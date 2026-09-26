# initialize_reward

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_reward (anchor); 75 functions reachable: ix_initialize_reward, accounts_initialize_reward, memcpy, fn_44080, fn_becb0, anchor_error_from, fn_14b198, fn_14ed60, fn_153158, fn_13e628, fn_147a20, fn_cf90, ….

## Look first

- ⚠ funder_token_account: writable expected, no check found
- ⚠ operation_state: pda expected, no check found
- ⚠ reward_token_vault: pda expected, no check found
- ⚠ reward_token_vault: writable expected, no check found
- ⚠ system_program: address expected, no check found
- ⚠ rent: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | reward_funder | expected · found | expected · PARTIAL | — | — | — |
| 1 | funder_token_account | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 2 | amm_config | — | — | found (+discriminator found) | — | — |
| 3 | pool_state | — | expected · runtime | found (+discriminator found) | — | — |
| 4 | operation_state | — | — | found (+discriminator found) | — | — |
| 5 | reward_token_mint | — | — | — | — | — |
| 6 | reward_token_vault | — | expected · NOT FOUND | — | — | — |
| 7 | reward_token_program | — | — | — | — | — |
| 8 | system_program | — | — | — | — | = 11111111… · expected · NOT FOUND |
| 9 | rent | — | — | — | — | = SysvarRe… · expected · NOT FOUND |

## Constraints per account

- reward_funder: signer found (bundle/initialize_reward.ts:278 via try_accounts_17a30); writable PARTIAL (bundle/initialize_reward.ts:463)
- funder_token_account: owner found (bundle/initialize_reward.ts:281 via try_accounts_1678); discriminator found (bundle/initialize_reward.ts:281 via try_accounts_1678); initialized found (bundle/initialize_reward.ts:281 via try_accounts_1678); key PARTIAL (bundle/initialize_reward.ts:1103); writable NOT FOUND
- amm_config: owner found (bundle/initialize_reward.ts:324 via try_accounts_184d8); initialized found (bundle/initialize_reward.ts:324 via try_accounts_184d8); discriminator found (bundle/initialize_reward.ts:324 via try_accounts_184d8)
- pool_state: discriminator found (bundle/initialize_reward.ts:366 via fn_11e0); owner found (bundle/initialize_reward.ts:366 via fn_11e0); writable runtime (bundle/initialize_reward.ts:3147) — written: the runtime rejects changes to a read-only account
- operation_state: discriminator found (bundle/initialize_reward.ts:371 via fn_12d8); owner found (bundle/initialize_reward.ts:371 via fn_12d8); pda NOT FOUND
- reward_token_mint: no checks found
- reward_token_vault: writable NOT FOUND; pda NOT FOUND
- reward_token_program: no checks found
- system_program: address NOT FOUND
- rent: address NOT FOUND

## CPIs

- bundle/initialize_reward.ts:3341 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: ld64(s1e8 + 0x18), ld8(ld64(s1e8 + 0x30) + 0x30)
- bundle/initialize_reward.ts:3409 [conditional] TOKEN_PROGRAM (constant).Transfer — amount: ld64(s1e8 + 0x18)
- bundle/initialize_reward.ts:3850 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — lamports: j, ci, b
- bundle/initialize_reward.ts:3922 [conditional] SYSTEM_PROGRAM (constant).Transfer — accounts from: payer s, to: ? — lamports: cj
- bundle/initialize_reward.ts:3973 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ci — PDA signer: ? (1 seeds)
- bundle/initialize_reward.ts:4000 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: b — PDA signer: ? (1 seeds)
- bundle/initialize_reward.ts:4879 program not decoded
  - return invoke_signed(a, b, c, d, fp)

## PDAs derived

- bundle/initialize_reward.ts:1316 find_program_address(["support_mint", *s128], program *s108)
- compared with provided accounts: operation_state NOT FOUND, reward_token_vault NOT FOUND

## Operations (account writes)

- bundle/initialize_reward.ts:3147 ACCOUNT_DATA_WRITE pool_state.recent_epoch = s [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/initialize_reward.ts:3147 ACCOUNT_DATA_WRITE: 24 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; …)
- bundle/initialize_reward.ts:3341 TOKEN_TRANSFER: 22 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; …)
- bundle/initialize_reward.ts:3409 TOKEN_TRANSFER: 22 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; …)
- bundle/initialize_reward.ts:3850 ACCOUNT_CREATE: 14 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; …)
- bundle/initialize_reward.ts:3922 LAMPORT_TRANSFER: 14 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; …)
- bundle/initialize_reward.ts:3973 OWNER_ASSIGN, PDA_SIGNATURE: 14 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; …)
- bundle/initialize_reward.ts:4000 OWNER_ASSIGN, PDA_SIGNATURE: 14 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; …)
- bundle/initialize_reward.ts:4879 PDA_SIGNATURE: 14 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; owner amm_config; initialized amm_config; discriminator amm_config; discriminator pool_state; …)

## Authority (who enables each value movement / authority change)

- bundle/initialize_reward.ts:3341 TOKEN_TRANSFER: signer reward_funder (found)
- bundle/initialize_reward.ts:3409 TOKEN_TRANSFER: signer reward_funder (found)
- bundle/initialize_reward.ts:3922 LAMPORT_TRANSFER: signer reward_funder (found)
- bundle/initialize_reward.ts:3973 OWNER_ASSIGN, PDA_SIGNATURE: signer reward_funder (found); pda PDA signature ? (1 seeds)
- bundle/initialize_reward.ts:4000 OWNER_ASSIGN, PDA_SIGNATURE: signer reward_funder (found); pda PDA signature ? (1 seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/initialize_reward.ts:3147 ACCOUNT_DATA_WRITE pool_state.recent_epoch [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer reward_funder accounts_initialize_reward:12; custom  fn_44080:27; key/initialized  fn_cf90:5
- bundle/initialize_reward.ts:3341 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer reward_funder (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 22 dominating checks
- bundle/initialize_reward.ts:3409 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer reward_funder (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [found] relevant checks on every path — 22 dominating checks
- bundle/initialize_reward.ts:3922 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [NOT FOUND] debited account authorized (signer / PDA / owned by the program) — payer: not an identified account
  - [found] authorized (signer / PDA signature / stored authority) — signer reward_funder (found)
  - [found] amount arithmetic checked — sat_sub(j, h) (saturating)
  - [found] relevant checks on every path — 14 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/initialize_reward.ts:3341 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer reward_funder (found)
- bundle/initialize_reward.ts:3409 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer reward_funder (found)
- bundle/initialize_reward.ts:3922 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer reward_funder (found)
- bundle/initialize_reward.ts:3973 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer reward_funder (found)
- bundle/initialize_reward.ts:3973 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- bundle/initialize_reward.ts:4000 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer reward_funder (found)
- bundle/initialize_reward.ts:4000 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/initialize_reward.ts:3147 ACCOUNT_DATA_WRITE pool_state.recent_epoch: ✗ `ld64(s118) != 0` · `q > 0x300000007` · ✗ `(memcmp(l + 0x40, o, 0x20) as u32) == 0` #33 · ✗ `(memcmp(l + 0x20, o, 0x20) as u32) == 0` · ✗ `(memcmp(l, o, 0x20) as u32) == 0` #32 · `l > 0x300000007` · ✗ `ld64(s148) != 0` · ✗ `ba > 0x5555555555555554` · ✗ `bb + ba > ld64(ld64(bd + 8) + 0x68)` · ✗ `ba > bb + ba` · … 19 more
- bundle/initialize_reward.ts:3341 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked: `u168 != -1` · `bd != -1` · `u109 != -1` · `al != -1` · `u81 != -1` · `ac != -1` · ✗ `z == 2` · ✗ `x == 0` · `u41 != -1` · `u != -1` · … 27 more
- bundle/initialize_reward.ts:3409 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer: `u104 != -1` · `ai != -1` · `u77 != -1` · `u73 != -1` · `u41 != -1` · `u != -1` · `u24 != -1` · `l != -1` · `g != 0` · ✗ `g != 2` · … 23 more
- bundle/initialize_reward.ts:3850 ACCOUNT_CREATE SYSTEM_PROGRAM.CreateAccount: `u100 != -1` · `u90 != -1` · `u86 != -1` · `u82 != -1` · `h == 0` · ✗ `ld64(s190) != 0` · `u96 != -1` · `u92 != -1` · `u81 != -1` · `u77 != -1` · … 18 more
- bundle/initialize_reward.ts:3922 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `u181 != -1` · `u172 != -1` · `u168 != -1` · `u158 != -1` · `u153 != -1` · `u42 != -1` · `j > h` · ✗ `h == 0` · ✗ `ld64(s190) != 0` · `u96 != -1` · … 21 more
- bundle/initialize_reward.ts:3973 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u231 != -1` · `u222 != -1` · `u218 != -1` · `u214 != -1` · ✗ `h == 0` · ✗ `ld64(s190) != 0` · `u96 != -1` · `u92 != -1` · `u81 != -1` · `u77 != -1` · … 18 more
- bundle/initialize_reward.ts:4000 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u277 != -1` · `u273 != -1` · `u267 != -1` · `u261 != -1` · `ad == 2` · `u231 != -1` · `u222 != -1` · `u218 != -1` · `u214 != -1` · ✗ `h == 0` · … 23 more
- bundle/initialize_reward.ts:4879 PDA_SIGNATURE: `u132 != -1` · `u129 != -1` · `u124 != -1` · `u120 != -1` · `x == 2` · `u96 != -1` · `u92 != -1` · `u81 != -1` · `u77 != -1` · `u63 != -1` · … 17 more

## Arithmetic on value paths

- bundle/initialize_reward.ts:3885 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(j, h)`: saturating

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): reward_funder.key, amm_config.key, pool_state.key, operation_state.key, reward_token_mint.key, reward_token_vault.key, reward_token_program.key, system_program.key, rent.key, ix.param
- funder_token_account.key: partially-validated (key partial @fn_becb0:6)
- funder_token_account.data: validated (owner found @accounts_initialize_reward:15, discriminator found @accounts_initialize_reward:15, initialized found @accounts_initialize_reward:15)
- amm_config.data: validated (owner found @accounts_initialize_reward:58, discriminator found @accounts_initialize_reward:58, initialized found @accounts_initialize_reward:58)
- pool_state.data: validated (owner found @accounts_initialize_reward:100, discriminator found @accounts_initialize_reward:100)
- operation_state.data: validated (owner found @accounts_initialize_reward:105, discriminator found @accounts_initialize_reward:105)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_reward.ts:278 | found | reward_funder | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/initialize_reward.ts:281 | found | funder_token_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sb8 + 0x90) == 2` | return |
| 2 | bundle/initialize_reward.ts:324 | found | amm_config | owner, initialized, discriminator (via try_accounts_184d8 (count, owner, initialized, discriminator)) | `ld64(sd8) == 0` | return |
| 3 | bundle/initialize_reward.ts:366 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 4 | bundle/initialize_reward.ts:371 | found | operation_state | discriminator, owner (via fn_12d8 (count, discriminator, owner)) | `f != 2` | return |
| 5 | bundle/initialize_reward.ts:424 | found |  | writable | `ai == 2` | anchor::ConstraintMut |
| 6 | bundle/initialize_reward.ts:439 | PARTIAL |  | writable | `al == 2` | anchor::ConstraintMut |
| 7 | bundle/initialize_reward.ts:463 | PARTIAL | reward_funder | writable | `reward_funder.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/initialize_reward.ts:464 | PARTIAL |  | writable | `!(ld8(ld64((l & -8) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 9 | bundle/initialize_reward.ts:470 | PARTIAL |  | token_mint | `(at as u32) != 0` | anchor::ConstraintTokenMint |
| 10 | bundle/initialize_reward.ts:491 | PARTIAL |  | key, address | `!((memcmp(s200, s1e0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 11 | bundle/initialize_reward.ts:492 | PARTIAL |  | writable | `!(ld8(ld64(s3e0 + 0x40) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 12 | bundle/initialize_reward.ts:500 | PARTIAL |  | key, pda | `(memcmp(s1a0, s1c0, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 13 | bundle/initialize_reward.ts:535 | PARTIAL |  | pda | `r != 0` | anchor::ConstraintSeeds |
| 14 | bundle/initialize_reward.ts:536 | PARTIAL |  | writable | `!(ld8(ld64(s3e0 + 0x28) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 15 | bundle/initialize_reward.ts:729 | found |  | custom | `!((ld8(s148 + 8) & 1) != 0)` | error::NotSupportMint |
| 16 | bundle/initialize_reward.ts:1103 | PARTIAL | funder_token_account | key | `(memcmp(f, c, 0x20) as u32) == 0 && (common_is_closed(g) == 0 && ld64(ld64(g + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 17 | ix/swap_router_base_in.ts:890 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 18 | ix/swap_router_base_in.ts:899 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 19 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 20 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 21 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 22 | entrypoint.ts:140 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 23 | entrypoint.ts:158 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 24 | entrypoint.ts:166 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0xfcb7de51ed3aec13 /* account:OperationState */` | anchor::AccountDiscriminatorMismatch |
| 25 | bundle/initialize_reward.ts:2420 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 26 | bundle/initialize_reward.ts:2431 | PARTIAL |  | discriminator | `j != 0xfcb7de51ed3aec13 /* account:OperationState */` | anchor::AccountDiscriminatorMismatch |
| 27 | bundle/initialize_reward.ts:1275 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 28 | bundle/initialize_reward.ts:1286 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 29 | bundle/initialize_reward.ts:2870 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 30 | bundle/initialize_reward.ts:2875 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 31 | bundle/initialize_reward.ts:2886 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 32 | bundle/initialize_reward.ts:2965 | PARTIAL |  | key, custom | `!((memcmp(l, o, 0x20) as u32) != 0)` | error::RewardTokenAlreadyInUse |
| 33 | bundle/initialize_reward.ts:2969 | PARTIAL |  | key | `!((memcmp(l + 0x40, o, 0x20) as u32) != 0)` | return |
| 34 | bundle/initialize_reward.ts:2977 | PARTIAL |  | custom | `v == 0` | error::ExceptRewardMint |
| 35 | bundle/initialize_reward.ts:2982 | PARTIAL |  | custom | `aa == 0xc80` | error::ExceptRewardMint |
| 36 | bundle/initialize_reward.ts:3026 | PARTIAL |  | custom | `ak == 0xc80` | error::ExceptRewardMint |
| 37 | bundle/initialize_reward.ts:3062 | PARTIAL |  | custom | `x == 0xc80` | error::ExceptRewardMint |
| 38 | ix/swap_router_base_in.ts:949 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 39 | bundle/initialize_reward.ts:3536 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 40 | entrypoint.ts:4307 | PARTIAL |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 41 | entrypoint.ts:3797 | PARTIAL |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 42 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 43 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 44 | bundle/initialize_reward.ts:4833 | found |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &T` | Err(ProgramError::IncorrectProgramId) |
