# update_dynamic_fee_config

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_update_dynamic_fee_config (anchor); 28 functions reachable: ix_update_dynamic_fee_config, fn_d68d8, memcpy, fn_d7288, fn_88360, anchor_error_from, fn_ded0, fn_11e480, fn_a2c0, fn_85138, fn_13e5a0, fn_14d660, ….

## Look first

- ⚠ owner: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | — | — | — | = GThUX1At… · expected · NOT FOUND |
| 1 | dynamic_fee_config | — | expected · found | found (+discriminator found) | — | — |

## Constraints per account

- owner: signer found (bundle/update_dynamic_fee_config.ts:158 via try_accounts_17a30); address NOT FOUND
- dynamic_fee_config: owner found (bundle/update_dynamic_fee_config.ts:192 via try_accounts_187b8); initialized found (bundle/update_dynamic_fee_config.ts:192 via try_accounts_187b8); discriminator found (bundle/update_dynamic_fee_config.ts:192 via try_accounts_187b8); key found (bundle/update_dynamic_fee_config.ts:226); writable found (bundle/update_dynamic_fee_config.ts:226)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, ix.filter_period, ix.decay_period, ix.reduction_factor, ix.dynamic_fee_control, ix.max_volatility_accumulator
- dynamic_fee_config.key: validated (key found @fn_d68d8:75)
- dynamic_fee_config.data: validated (owner found @fn_d68d8:41, discriminator found @fn_d68d8:41, initialized found @fn_d68d8:41)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/update_dynamic_fee_config.ts:158 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/update_dynamic_fee_config.ts:192 | found | dynamic_fee_config | owner, initialized, discriminator (via try_accounts_187b8 (count, owner, initialized, discriminator)) | `g == 0` | return |
| 2 | bundle/update_dynamic_fee_config.ts:226 | found | dynamic_fee_config | key, writable | `(memcmp(s20, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) == 0` | anchor::ConstraintMut |
| 3 | shared.ts:1936 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 4 | shared.ts:1945 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 5 | shared.ts:22961 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
