# set_config_feature_flag

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_config_feature_flag (anchor); 29 functions reachable: ix_set_config_feature_flag, accounts_set_config_feature_flag, memcpy, fn_8228, fn_147e78, fn_11f980, fn_147990, fn_83078, fn_139720, fn_149678, fn_14ef78, fn_9900, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | found | found (+discriminator found) | — | — |
| 1 | authority [str] | found | — | — | — | — |

## Constraints per account

- whirlpools_config: owner found (bundle/set_config_feature_flag.ts:220 via try_accounts_11de0); initialized found (bundle/set_config_feature_flag.ts:220 via try_accounts_11de0); discriminator found (bundle/set_config_feature_flag.ts:220 via try_accounts_11de0); writable found (bundle/set_config_feature_flag.ts:234)
- authority: signer found (bundle/set_config_feature_flag.ts:233 via try_accounts_11718); key found (bundle/set_config_feature_flag.ts:245); raw found (bundle/set_config_feature_flag.ts:245)

## Operations (account writes)

- bundle/set_config_feature_flag.ts:90 ACCOUNT_DATA_WRITE whirlpools_config.data[106..108] = i

## Dominance (checks on every path to the operation; across calls)

- bundle/set_config_feature_flag.ts:90 ACCOUNT_DATA_WRITE: 7 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer authority; writable whirlpools_config; key authority; raw authority; key; …)
  - sources: whirlpools_config.data[106..108] ← instruction data (caller-controlled)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_config_feature_flag.ts:90 ACCOUNT_DATA_WRITE whirlpools_config.data[106..108] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — whirlpools_config: discriminator found
  - [found] write gated (signer / constraint) — signer authority accounts_set_config_feature_flag:24; key/raw authority accounts_set_config_feature_flag:36; key/initialized  fn_9900:5
  - [PARTIAL] amount arithmetic checked — whirlpools_config.data[106..108] ← instruction data (caller-controlled)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_config_feature_flag.ts:90 ACCOUNT_DATA_WRITE whirlpools_config.data[106..108]: ✗ `t == 0` · `2 > i` · ✗ `f == 1` · ✗ `h != 0` · ✗ `f == 0`

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key
- whirlpools_config.data: validated (owner found @accounts_set_config_feature_flag:11, discriminator found @accounts_set_config_feature_flag:11, initialized found @accounts_set_config_feature_flag:11)
- authority.key: validated (key found @accounts_set_config_feature_flag:36)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_config_feature_flag.ts:94 | PARTIAL | whirlpools_config |  | `u != 2` | return |
| 1 | bundle/set_config_feature_flag.ts:220 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `f == 0` | return |
| 2 | bundle/set_config_feature_flag.ts:233 | found | authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 3 | bundle/set_config_feature_flag.ts:234 | found | whirlpools_config | writable | `ld8(f + 0x29) == 0` | anchor::ConstraintMut |
| 4 | bundle/set_config_feature_flag.ts:245 | found | authority | key, raw | `!((memcmp(j, 0x100152d90 /* key GwH3Hiv5mACLX3ufTw1pFsrhSPon5tdw252DBs4Rx4PV */, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 5 | bundle/set_config_feature_flag.ts:253 | PARTIAL | authority | raw | `!((memcmp(ld64(s138), 0x100152db0 /* key AqiJTdr9jLPDAk5prGhWFHtSM1qJszAsdZVV7oeinxhh */, 0x20) as u` | anchor::ConstraintRaw |
| 6 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 7 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 8 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
