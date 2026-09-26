# update_operation_account

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_update_operation_account (anchor); 34 functions reachable: ix_update_operation_account, memcpy, fn_14d660, fn_125710, accounts_update_operation_account, fn_4f4c8, fn_ccf98, fn_11e480, anchor_error_from, fn_14ec00, fn_14d4f8, fn_61a8, ….

## Look first

- ⚠ owner: address expected, no check found
- ⚠ operation_state: pda expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | — | — | — | = GThUX1At… · expected · NOT FOUND |
| 1 | operation_state | — | expected · PARTIAL | found (+discriminator found) | — | — |
| 2 | system_program | — | — | — | found | = 11111111… · expected · found |

## Constraints per account

- owner: signer found (bundle/update_operation_account.ts:238 via try_accounts_17a30); key found (bundle/update_operation_account.ts:280); address NOT FOUND
- operation_state: discriminator found (bundle/update_operation_account.ts:273 via fn_12d8); owner found (bundle/update_operation_account.ts:273 via fn_12d8); writable PARTIAL (bundle/update_operation_account.ts:290); state found (bundle/update_operation_account.ts:490); pda NOT FOUND
- system_program: address found (bundle/update_operation_account.ts:277 via try_accounts_18870); executable found (bundle/update_operation_account.ts:277 via try_accounts_18870)

## PDAs derived

- bundle/update_operation_account.ts:282 find_program_address(["operation"], program *b)
- compared with provided accounts: operation_state NOT FOUND

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/update_operation_account.ts:277)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): operation_state.key, ix.param, ix.keys
- owner.key: validated (key found @accounts_update_operation_account:54)
- operation_state.data: validated (owner found @accounts_update_operation_account:47, discriminator found @accounts_update_operation_account:47)
- system_program.key: validated (address found @accounts_update_operation_account:51)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/update_operation_account.ts:238 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/update_operation_account.ts:273 | found | operation_state | discriminator, owner (via fn_12d8 (count, discriminator, owner)) | `f != 2` | return |
| 2 | bundle/update_operation_account.ts:277 | found | system_program | address, executable (via try_accounts_18870 (count, address, executable)) | `f != 2` | return |
| 3 | bundle/update_operation_account.ts:280 | found | owner | key | `!((memcmp(sb0, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) == ` | return |
| 4 | bundle/update_operation_account.ts:290 | PARTIAL | operation_state | writable | `operation_state.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/update_operation_account.ts:474 | found |  | writable | `!(ld8(f + 0x29) != 0)` | anchor::AccountNotMutable |
| 6 | bundle/update_operation_account.ts:490 | found | operation_state | state | `operation_state_data.discriminator != 0xfcb7de51ed3aec13 /* account:OperationState */` | return |
| 7 | bundle/update_operation_account.ts:491 | found |  | discriminator | `h <= 0xdc8` | anchor::AccountDiscriminatorMismatch |
| 8 | bundle/update_operation_account.ts:510 | PARTIAL |  | discriminator | `(c as u8) == 0` | anchor::AccountDiscriminatorMismatch |
| 9 | entrypoint.ts:140 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 10 | entrypoint.ts:158 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 11 | entrypoint.ts:166 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0xfcb7de51ed3aec13 /* account:OperationState */` | anchor::AccountDiscriminatorMismatch |
