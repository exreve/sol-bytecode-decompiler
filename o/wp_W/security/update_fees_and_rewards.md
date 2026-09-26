# update_fees_and_rewards

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_update_fees_and_rewards (anchor); 67 functions reachable: ix_update_fees_and_rewards, accounts_update_fees_and_rewards, memcpy, fn_3adf0, fn_6aa0, fn_149678, fn_5a40, fn_147990, fn_11f980, fn_139720, fn_89e0, fn_9540, ….

## Findings (rule engine)

- [low] state-write-ungated: Instruction writes program state with no signer check and no constraint gating the write. writes account?.data[197..205], position.data[88..96], position.data[80..88] · only type / owner / size checks dominate the writes (fn_3adf0:76)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 1 | position [str] | — | found | found (+discriminator found) | — | — |
| 2 | tick_array_lower [str] | — | — | — | — | — |
| 3 | tick_array_upper [str] | — | — | — | — | — |

## Constraints per account

- whirlpool: owner found (bundle/update_fees_and_rewards.ts:148 via try_accounts_11a48); initialized found (bundle/update_fees_and_rewards.ts:148 via try_accounts_11a48); discriminator found (bundle/update_fees_and_rewards.ts:148 via try_accounts_11a48); writable found (bundle/update_fees_and_rewards.ts:213)
- position: owner found (bundle/update_fees_and_rewards.ts:162 via try_accounts_11b00); initialized found (bundle/update_fees_and_rewards.ts:162 via try_accounts_11b00); discriminator found (bundle/update_fees_and_rewards.ts:162 via try_accounts_11b00); writable found (bundle/update_fees_and_rewards.ts:222); key found (bundle/update_fees_and_rewards.ts:230); has_one found (bundle/update_fees_and_rewards.ts:230)
- tick_array_lower: count found (bundle/update_fees_and_rewards.ts:175)
- tick_array_upper: no checks found

## Operations (account writes)

- bundle/update_fees_and_rewards.ts:345 ACCOUNT_DATA_WRITE account?.data[197..205] = ac [conditional]
- bundle/update_fees_and_rewards.ts:351 ACCOUNT_DATA_WRITE position.data[88..96] = z [conditional]
- bundle/update_fees_and_rewards.ts:352 ACCOUNT_DATA_WRITE position.data[80..88] = aa [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/update_fees_and_rewards.ts:345 ACCOUNT_DATA_WRITE: 13 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; owner position; initialized position; discriminator position; writable whirlpool; writable position; …)
- bundle/update_fees_and_rewards.ts:351 ACCOUNT_DATA_WRITE: 13 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; owner position; initialized position; discriminator position; writable whirlpool; writable position; …)
- bundle/update_fees_and_rewards.ts:352 ACCOUNT_DATA_WRITE: 13 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; owner position; initialized position; discriminator position; writable whirlpool; writable position; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/update_fees_and_rewards.ts:345 ACCOUNT_DATA_WRITE account?.data[197..205] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — account: not an identified account
  - [found] write gated (signer / constraint) — key/has_one position accounts_update_fees_and_rewards:93; key/initialized  fn_89e0:5; key/initialized  fn_9540:5
- bundle/update_fees_and_rewards.ts:351 ACCOUNT_DATA_WRITE position.data[88..96] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — position: discriminator found
  - [found] write gated (signer / constraint) — key/has_one position accounts_update_fees_and_rewards:93; key/initialized  fn_89e0:5; key/initialized  fn_9540:5
- bundle/update_fees_and_rewards.ts:352 ACCOUNT_DATA_WRITE position.data[80..88] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — position: discriminator found
  - [found] write gated (signer / constraint) — key/has_one position accounts_update_fees_and_rewards:93; key/initialized  fn_89e0:5; key/initialized  fn_9540:5

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/update_fees_and_rewards.ts:345 ACCOUNT_DATA_WRITE account?.data[197..205]: ✗ `ld64(s3d8) != 0` · ✗ `o == 0` · ✗ `l == 0` · ✗ `ld64(s3d8) != 0` · ✗ `f == 0`
- bundle/update_fees_and_rewards.ts:351 ACCOUNT_DATA_WRITE position.data[88..96]: ✗ `ld64(s3d8) != 0` · ✗ `o == 0` · ✗ `l == 0` · ✗ `ld64(s3d8) != 0` · ✗ `f == 0`
- bundle/update_fees_and_rewards.ts:352 ACCOUNT_DATA_WRITE position.data[80..88]: ✗ `ld64(s3d8) != 0` · ✗ `o == 0` · ✗ `l == 0` · ✗ `ld64(s3d8) != 0` · ✗ `f == 0`

## Relations (equalities the checks establish)

- position.whirlpool == whirlpool.key (field_eq, found, bundle/update_fees_and_rewards.ts:230)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, tick_array_lower.key, tick_array_upper.key
- whirlpool.data: validated (owner found @accounts_update_fees_and_rewards:11, discriminator found @accounts_update_fees_and_rewards:11, initialized found @accounts_update_fees_and_rewards:11)
- position.key: validated (key found @accounts_update_fees_and_rewards:93, has_one found @accounts_update_fees_and_rewards:93)
- position.data: validated (owner found @accounts_update_fees_and_rewards:25, discriminator found @accounts_update_fees_and_rewards:25, initialized found @accounts_update_fees_and_rewards:25)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/update_fees_and_rewards.ts:122 | PARTIAL | position |  | `j != 2` | return |
| 1 | bundle/update_fees_and_rewards.ts:148 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `f == 0` | return |
| 2 | bundle/update_fees_and_rewards.ts:162 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `position == 0` | return |
| 3 | bundle/update_fees_and_rewards.ts:175 | found | tick_array_lower | count | `l == 0` | anchor::AccountNotEnoughKeys |
| 4 | bundle/update_fees_and_rewards.ts:213 | found | whirlpool | writable | `f.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/update_fees_and_rewards.ts:222 | found | position | writable | `position.is_writable == 0` | anchor::ConstraintMut |
| 6 | bundle/update_fees_and_rewards.ts:230 | found | position | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 7 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 8 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 9 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 10 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 11 | bundle/update_fees_and_rewards.ts:630 | found |  | owner | `(f as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 12 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 13 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 14 | bundle/update_fees_and_rewards.ts:1365 | found |  | key | `(memcmp(sa0, s20, 0x20) as u32) == 0` | return |
