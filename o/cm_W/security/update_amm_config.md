# update_amm_config

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_update_amm_config (anchor); 32 functions reachable: ix_update_amm_config, fn_c4f30, memcpy, fn_4bfc8, fn_c5880, anchor_error_from, fn_cf90, fn_88360, fn_11e480, fn_14d660, fn_125710, fn_13e5a0, ….

## Look first

- ⚠ owner: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | — | — | — | = GThUX1At… · expected · NOT FOUND |
| 1 | amm_config | — | expected · found | found (+discriminator found) | — | — |

## Constraints per account

- owner: signer found (bundle/update_amm_config.ts:144 via try_accounts_17a30); address NOT FOUND
- amm_config: owner found (bundle/update_amm_config.ts:178 via try_accounts_184d8); initialized found (bundle/update_amm_config.ts:178 via try_accounts_184d8); discriminator found (bundle/update_amm_config.ts:178 via try_accounts_184d8); key found (bundle/update_amm_config.ts:210); writable found (bundle/update_amm_config.ts:210)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, ix.param, ix.value
- amm_config.key: validated (key found @fn_c4f30:73)
- amm_config.data: validated (owner found @fn_c4f30:41, discriminator found @fn_c4f30:41, initialized found @fn_c4f30:41)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/update_amm_config.ts:144 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/update_amm_config.ts:178 | found | amm_config | owner, initialized, discriminator (via try_accounts_184d8 (count, owner, initialized, discriminator)) | `g == 0` | return |
| 2 | bundle/update_amm_config.ts:210 | found | amm_config | key, writable | `(memcmp(s20, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) == 0` | anchor::ConstraintMut |
| 3 | ix/swap_router_base_in.ts:890 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 4 | ix/swap_router_base_in.ts:899 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 5 | ix/swap_router_base_in.ts:949 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
