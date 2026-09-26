# set_reward_params

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_reward_params (anchor); 55 functions reachable: ix_set_reward_params, accounts_set_reward_params, memcpy, fn_45880, fn_c03e8, anchor_error_from, fn_cf90, fn_5608, fn_61a8, fn_11e480, fn_4130, fn_4dc0, ….

## Look first

- ⚠ operation_state: pda expected, no check found
- ⚠ token_program_2022: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | authority | expected · found | — | — | — | — |
| 1 | amm_config | — | — | found (+discriminator found) | — | — |
| 2 | pool_state | — | expected · found | found (+discriminator found) | — | — |
| 3 | operation_state | — | — | found (+discriminator found) | — | — |
| 4 | token_program | — | — | — | found | = Tokenkeg… · expected · found |
| 5 | token_program_2022 | — | — | — | — | = TokenzQd… · expected · NOT FOUND |

## Constraints per account

- authority: signer found (bundle/set_reward_params.ts:251 via try_accounts_17a30)
- amm_config: owner found (bundle/set_reward_params.ts:257 via try_accounts_184d8); initialized found (bundle/set_reward_params.ts:257 via try_accounts_184d8); discriminator found (bundle/set_reward_params.ts:257 via try_accounts_184d8)
- pool_state: discriminator found (bundle/set_reward_params.ts:291 via fn_11e0); owner found (bundle/set_reward_params.ts:291 via fn_11e0); writable found (bundle/set_reward_params.ts:336)
- operation_state: discriminator found (bundle/set_reward_params.ts:296 via fn_12d8); owner found (bundle/set_reward_params.ts:296 via fn_12d8); pda NOT FOUND
- token_program: address found (bundle/set_reward_params.ts:301 via try_accounts_19190); executable found (bundle/set_reward_params.ts:301 via try_accounts_19190)
- token_program_2022: address NOT FOUND

## CPIs

- bundle/set_reward_params.ts:3048 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: ld64(s1e8 + 0x18), ld8(ld64(s1e8 + 0x30) + 0x30)
- bundle/set_reward_params.ts:3116 [conditional] TOKEN_PROGRAM (constant).Transfer — amount: ld64(s1e8 + 0x18)

## PDAs derived

- bundle/set_reward_params.ts:353 find_program_address(["operation"], program *(ld64(s238 + 0x18)))
- compared with provided accounts: operation_state NOT FOUND

## Dominance (checks on every path to the operation; across calls)

- bundle/set_reward_params.ts:3048 TOKEN_TRANSFER: 26 dominating checks (signer authority; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; owner pool_state; discriminator operation_state; owner operation_state; …)
- bundle/set_reward_params.ts:3116 TOKEN_TRANSFER: 26 dominating checks (signer authority; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; owner pool_state; discriminator operation_state; owner operation_state; …)

## Authority (who enables each value movement / authority change)

- bundle/set_reward_params.ts:3048 TOKEN_TRANSFER: signer authority (found)
- bundle/set_reward_params.ts:3116 TOKEN_TRANSFER: signer authority (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_reward_params.ts:3048 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer authority (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 26 dominating checks
- bundle/set_reward_params.ts:3116 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer authority (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [found] relevant checks on every path — 26 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/set_reward_params.ts:3048 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer authority (found)
- bundle/set_reward_params.ts:3116 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer authority (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_reward_params.ts:3048 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked: `u168 != -1` · `bd != -1` · `u109 != -1` · `al != -1` · `u81 != -1` · `ac != -1` · ✗ `z == 2` · ✗ `x == 0` · `u41 != -1` · `u != -1` · … 30 more (budget reached)
- bundle/set_reward_params.ts:3116 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer: `u104 != -1` · `ai != -1` · `u77 != -1` · `u73 != -1` · `u41 != -1` · `u != -1` · `u24 != -1` · `l != -1` · `g != 0` · ✗ `0x300000008 > br` · … 30 more (budget reached)

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/set_reward_params.ts:301)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): authority.key, amm_config.key, pool_state.key, operation_state.key, token_program_2022.key, ix.reward_index, ix.emissions_per_second_x64, ix.open_time, ix.end_time
- amm_config.data: validated (owner found @accounts_set_reward_params:17, discriminator found @accounts_set_reward_params:17, initialized found @accounts_set_reward_params:17)
- pool_state.data: validated (owner found @accounts_set_reward_params:51, discriminator found @accounts_set_reward_params:51)
- operation_state.data: validated (owner found @accounts_set_reward_params:56, discriminator found @accounts_set_reward_params:56)
- token_program.key: validated (address found @accounts_set_reward_params:61)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_reward_params.ts:251 | found | authority | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/set_reward_params.ts:257 | found | amm_config | owner, initialized, discriminator (via try_accounts_184d8 (count, owner, initialized, discriminator)) | `j == 0` | return |
| 2 | bundle/set_reward_params.ts:291 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 3 | bundle/set_reward_params.ts:296 | found | operation_state | discriminator, owner (via fn_12d8 (count, discriminator, owner)) | `f != 2` | return |
| 4 | bundle/set_reward_params.ts:301 | found | token_program | address, executable (via try_accounts_19190 (count, address, executable)) | `f != 2` | return |
| 5 | bundle/set_reward_params.ts:334 | found |  | address | `!((ac as u32) == 0)` | anchor::ConstraintAddress |
| 6 | bundle/set_reward_params.ts:336 | found | pool_state | writable | `pool_state.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/set_reward_params.ts:351 | found |  | raw | `!((aj as u32) == 0)` | anchor::ConstraintRaw |
| 8 | bundle/set_reward_params.ts:359 | found |  | key, pda | `(memcmp(s20, s50, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 9 | bundle/set_reward_params.ts:534 | found |  | custom | `!(3 > (c as u8))` | error::InvalidRewardIndex |
| 10 | bundle/set_reward_params.ts:590 | found |  | key | `(memcmp(s280, s628, 0x20) as u32) == 0` | anchor::RequireNeqViolated |
| 11 | bundle/set_reward_params.ts:738 | PARTIAL |  | key | `!((memcmp(s628, v, 0x20) as u32) != 0)` | return |
| 12 | bundle/set_reward_params.ts:777 | found |  | key, custom | `!((memcmp(s3e8, s628, 0x20) as u32) != 0)` | error::UnInitializedRewardInfo |
| 13 | bundle/set_reward_params.ts:792 | PARTIAL |  | custom | `ld64(s421 + 1) >= aj` | error::NotApproved |
| 14 | bundle/set_reward_params.ts:921 | found |  | key | `(memcmp(s350, s258, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 15 | bundle/set_reward_params.ts:951 | found |  | key | `(memcmp(sa8, s3c8, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 16 | ix/swap_router_base_in.ts:890 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 17 | ix/swap_router_base_in.ts:899 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 18 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 19 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 20 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 21 | entrypoint.ts:140 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 22 | entrypoint.ts:158 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 23 | entrypoint.ts:166 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0xfcb7de51ed3aec13 /* account:OperationState */` | anchor::AccountDiscriminatorMismatch |
| 24 | bundle/set_reward_params.ts:1312 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 25 | bundle/set_reward_params.ts:1323 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 26 | bundle/set_reward_params.ts:2087 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 27 | bundle/set_reward_params.ts:2098 | found |  | discriminator | `j != 0xfcb7de51ed3aec13 /* account:OperationState */` | anchor::AccountDiscriminatorMismatch |
| 28 | bundle/set_reward_params.ts:2182 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 29 | bundle/set_reward_params.ts:2187 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 30 | bundle/set_reward_params.ts:2198 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 31 | bundle/set_reward_params.ts:2632 | PARTIAL |  | custom | `0xffffffffff92937f > g - f - 0x76a701` | error::NotApproveUpdateRewardEmissions |
| 32 | ix/swap_router_base_in.ts:949 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 33 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 34 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
