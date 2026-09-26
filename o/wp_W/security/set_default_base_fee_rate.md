# set_default_base_fee_rate

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_default_base_fee_rate (anchor); 32 functions reachable: ix_set_default_base_fee_rate, accounts_set_default_base_fee_rate, memcpy, fn_83340, fn_87828, fn_149678, fn_11f980, fn_5f98, fn_147990, fn_139720, fn_9900, fn_a590, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | adaptive_fee_tier [str] | — | found | found | — | — |
| 2 | fee_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/set_default_base_fee_rate.ts:140 via try_accounts_11de0); initialized found (bundle/set_default_base_fee_rate.ts:140 via try_accounts_11de0); discriminator found (bundle/set_default_base_fee_rate.ts:140 via try_accounts_11de0)
- adaptive_fee_tier: owner found (bundle/set_default_base_fee_rate.ts:154 via try_accounts_11d28); initialized found (bundle/set_default_base_fee_rate.ts:154 via try_accounts_11d28); writable found (bundle/set_default_base_fee_rate.ts:168); key found (bundle/set_default_base_fee_rate.ts:181); has_one found (bundle/set_default_base_fee_rate.ts:181)
- fee_authority: signer found (bundle/set_default_base_fee_rate.ts:167 via try_accounts_11718); key found (bundle/set_default_base_fee_rate.ts:201); address found (bundle/set_default_base_fee_rate.ts:201)

## Operations (account writes)

- bundle/set_default_base_fee_rate.ts:114 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[108..110] = m [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/set_default_base_fee_rate.ts:114 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner adaptive_fee_tier; initialized adaptive_fee_tier; signer fee_authority; writable adaptive_fee_tier; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[108..110] ← instruction data (caller-controlled)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_default_base_fee_rate.ts:114 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[108..110] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — adaptive_fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer fee_authority accounts_set_default_base_fee_rate:38; key/has_one adaptive_fee_tier accounts_set_default_base_fee_rate:52; key/address fee_authority accounts_set_default_base_fee_rate:72
  - [PARTIAL] amount arithmetic checked — adaptive_fee_tier.data[108..110] ← instruction data (caller-controlled)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_default_base_fee_rate.ts:114 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[108..110]: ✗ `m > 0xea60` · ✗ `f == 0` · ✗ `2 > ix_args_len`

## Relations (equalities the checks establish)

- adaptive_fee_tier.whirlpools_config == whirlpools_config.key (field_eq, found, bundle/set_default_base_fee_rate.ts:181)
- fee_authority.key == (constant address) (address, found, bundle/set_default_base_fee_rate.ts:201)
- whirlpools_config.data == fee_authority.key (field_eq, found, bundle/set_default_base_fee_rate.ts:201)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key
- whirlpools_config.data: validated (owner found @accounts_set_default_base_fee_rate:11, discriminator found @accounts_set_default_base_fee_rate:11, initialized found @accounts_set_default_base_fee_rate:11)
- adaptive_fee_tier.key: validated (key found @accounts_set_default_base_fee_rate:52, has_one found @accounts_set_default_base_fee_rate:52)
- adaptive_fee_tier.data: validated (owner found @accounts_set_default_base_fee_rate:25, initialized found @accounts_set_default_base_fee_rate:25)
- fee_authority.key: validated (address found @accounts_set_default_base_fee_rate:72, key found @accounts_set_default_base_fee_rate:72)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_default_base_fee_rate.ts:118 | PARTIAL | adaptive_fee_tier |  | `l != 2` | return |
| 1 | bundle/set_default_base_fee_rate.ts:140 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `whirlpools_config == 0` | return |
| 2 | bundle/set_default_base_fee_rate.ts:154 | found | adaptive_fee_tier | owner, initialized (via try_accounts_11d28 (count, owner, initialized)) | `adaptive_fee_tier == 0` | return |
| 3 | bundle/set_default_base_fee_rate.ts:167 | found | fee_authority | signer (via try_accounts_11718 (count, signer)) | `l != 2` | return |
| 4 | bundle/set_default_base_fee_rate.ts:168 | found | adaptive_fee_tier | writable | `adaptive_fee_tier.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/set_default_base_fee_rate.ts:181 | found | adaptive_fee_tier | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 6 | bundle/set_default_base_fee_rate.ts:201 | found | fee_authority | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 7 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 8 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 9 | entrypoint.ts:866 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 10 | entrypoint.ts:875 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 11 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 12 | entrypoint.ts:13185 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
