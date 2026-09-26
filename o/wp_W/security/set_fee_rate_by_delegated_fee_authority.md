# set_fee_rate_by_delegated_fee_authority

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_fee_rate_by_delegated_fee_authority (anchor); 32 functions reachable: ix_set_fee_rate_by_delegated_fee_authority, accounts_set_fee_rate_by_delegated_fee_authority, memcpy, fn_83340, fn_87828, fn_149678, fn_11f980, fn_6aa0, fn_147990, fn_139720, fn_89e0, fn_a590, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 1 | adaptive_fee_tier [str] | — | — | found | — | — |
| 2 | delegated_fee_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpool: owner found (bundle/set_fee_rate_by_delegated_fee_authority.ts:142 via try_accounts_11a48); initialized found (bundle/set_fee_rate_by_delegated_fee_authority.ts:142 via try_accounts_11a48); discriminator found (bundle/set_fee_rate_by_delegated_fee_authority.ts:142 via try_accounts_11a48); writable found (bundle/set_fee_rate_by_delegated_fee_authority.ts:175); raw found (bundle/set_fee_rate_by_delegated_fee_authority.ts:185)
- adaptive_fee_tier: owner found (bundle/set_fee_rate_by_delegated_fee_authority.ts:159 via try_accounts_11d28); initialized found (bundle/set_fee_rate_by_delegated_fee_authority.ts:159 via try_accounts_11d28); key found (bundle/set_fee_rate_by_delegated_fee_authority.ts:186); raw found (bundle/set_fee_rate_by_delegated_fee_authority.ts:186)
- delegated_fee_authority: signer found (bundle/set_fee_rate_by_delegated_fee_authority.ts:173 via try_accounts_11718); key found (bundle/set_fee_rate_by_delegated_fee_authority.ts:191); address found (bundle/set_fee_rate_by_delegated_fee_authority.ts:191)

## Operations (account writes)

- bundle/set_fee_rate_by_delegated_fee_authority.ts:115 ACCOUNT_DATA_WRITE whirlpool.data[45..47] = m [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/set_fee_rate_by_delegated_fee_authority.ts:115 ACCOUNT_DATA_WRITE: 14 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; owner adaptive_fee_tier; initialized adaptive_fee_tier; signer delegated_fee_authority; writable whirlpool; raw whirlpool; …)
  - sources: whirlpool.data[45..47] ← instruction data (caller-controlled)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_fee_rate_by_delegated_fee_authority.ts:115 ACCOUNT_DATA_WRITE whirlpool.data[45..47] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — whirlpool: discriminator found
  - [found] write gated (signer / constraint) — signer delegated_fee_authority accounts_set_fee_rate_by_delegated_fee_authority:43; raw whirlpool accounts_set_fee_rate_by_delegated_fee_authority:55; key/raw adaptive_fee_tier accounts_set_fee_rate_by_delegated_fee_authority:56
  - [PARTIAL] amount arithmetic checked — whirlpool.data[45..47] ← instruction data (caller-controlled)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_fee_rate_by_delegated_fee_authority.ts:115 ACCOUNT_DATA_WRITE whirlpool.data[45..47]: ✗ `m > 0xea60` · ✗ `f == 0` · ✗ `2 > ix_args_len`

## Relations (equalities the checks establish)

- delegated_fee_authority.key == (constant address) (address, found, bundle/set_fee_rate_by_delegated_fee_authority.ts:191)
- adaptive_fee_tier.data == delegated_fee_authority.key (field_eq, found, bundle/set_fee_rate_by_delegated_fee_authority.ts:191)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key
- whirlpool.data: validated (owner found @accounts_set_fee_rate_by_delegated_fee_authority:12, discriminator found @accounts_set_fee_rate_by_delegated_fee_authority:12, initialized found @accounts_set_fee_rate_by_delegated_fee_authority:12)
- adaptive_fee_tier.key: validated (key found @accounts_set_fee_rate_by_delegated_fee_authority:56)
- adaptive_fee_tier.data: validated (owner found @accounts_set_fee_rate_by_delegated_fee_authority:29, initialized found @accounts_set_fee_rate_by_delegated_fee_authority:29)
- delegated_fee_authority.key: validated (address found @accounts_set_fee_rate_by_delegated_fee_authority:61, key found @accounts_set_fee_rate_by_delegated_fee_authority:61)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_fee_rate_by_delegated_fee_authority.ts:119 | PARTIAL | whirlpool |  | `l != 2` | return |
| 1 | bundle/set_fee_rate_by_delegated_fee_authority.ts:142 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `f == 0` | return |
| 2 | bundle/set_fee_rate_by_delegated_fee_authority.ts:159 | found | adaptive_fee_tier | owner, initialized (via try_accounts_11d28 (count, owner, initialized)) | `j == 0` | return |
| 3 | bundle/set_fee_rate_by_delegated_fee_authority.ts:173 | found | delegated_fee_authority | signer (via try_accounts_11718 (count, signer)) | `m != 2` | return |
| 4 | bundle/set_fee_rate_by_delegated_fee_authority.ts:175 | found | whirlpool | writable | `ld8(ld64(s750) + 0x29) == 0` | anchor::ConstraintMut |
| 5 | bundle/set_fee_rate_by_delegated_fee_authority.ts:185 | found | whirlpool | raw | `!(n != ld16(s4d8 + 0xfc))` | anchor::ConstraintRaw |
| 6 | bundle/set_fee_rate_by_delegated_fee_authority.ts:186 | found | adaptive_fee_tier | key, raw | `!((memcmp(s3c8, s4d8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 7 | bundle/set_fee_rate_by_delegated_fee_authority.ts:187 | found | adaptive_fee_tier | raw | `!(ld16(s388 + 0x28) == n)` | anchor::ConstraintRaw |
| 8 | bundle/set_fee_rate_by_delegated_fee_authority.ts:191 | found | delegated_fee_authority | key, address | `(memcmp(s350, s330, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 9 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 10 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 11 | entrypoint.ts:866 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 12 | entrypoint.ts:875 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 13 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 14 | entrypoint.ts:13185 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
