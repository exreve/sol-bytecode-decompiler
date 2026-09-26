# initialize_reward

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_reward (anchor); 54 functions reachable: ix_initialize_reward, accounts_initialize_reward, memcpy, fn_32bc0, fn_6aa0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_83078, fn_143100, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | reward_authority [str] | found | — | — | — | found |
| 1 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 2 | reward_mint [str] | — | — | found (+discriminator found) | — | — |
| 3 | rent [str] | — | — | — | — | found |
| 4 | funder [str] | found | found | — | — | — |
| 5 | token_program [str] | — | — | — | found | found |
| 6 | reward_vault [str] | found | found | — | — | — |
| 7 | system_program [str] | — | — | — | found | found |

## Constraints per account

- reward_authority: signer found (bundle/initialize_reward.ts:197 via try_accounts_11718); key found (bundle/initialize_reward.ts:272); address found (bundle/initialize_reward.ts:272)
- whirlpool: owner found (bundle/initialize_reward.ts:210 via try_accounts_11a48); initialized found (bundle/initialize_reward.ts:210 via try_accounts_11a48); discriminator found (bundle/initialize_reward.ts:210 via try_accounts_11a48); writable found (bundle/initialize_reward.ts:282)
- reward_mint: owner found (bundle/initialize_reward.ts:226 via try_accounts_11e98); discriminator found (bundle/initialize_reward.ts:226 via try_accounts_11e98); initialized found (bundle/initialize_reward.ts:226 via try_accounts_11e98)
- rent: address found (bundle/initialize_reward.ts:258 via try_accounts_11990)
- funder: signer found (bundle/initialize_reward.ts:208 via try_accounts_11718); writable found (bundle/initialize_reward.ts:273)
- token_program: address found (bundle/initialize_reward.ts:247 via fn_129a0); executable found (bundle/initialize_reward.ts:247 via fn_129a0)
- reward_vault: signer found (bundle/initialize_reward.ts:242 via try_accounts_11718); writable found (bundle/initialize_reward.ts:283)
- system_program: address found (bundle/initialize_reward.ts:252 via fn_122e8); executable found (bundle/initialize_reward.ts:252 via fn_122e8)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- bundle/initialize_reward.ts:2122 program not decoded

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 19 dominating checks (signer reward_authority; signer funder; owner whirlpool; initialized whirlpool; discriminator whirlpool; owner reward_mint; discriminator reward_mint; initialized reward_mint; …)
- bundle/initialize_reward.ts:2122 CPI: 18 dominating checks (signer reward_authority; signer funder; owner whirlpool; initialized whirlpool; discriminator whirlpool; owner reward_mint; discriminator reward_mint; initialized reward_mint; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 19 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `af != -1` · `ac != -1` · `z != -1` · `x != -1` · `u != -1` · `u39 != -1` · ✗ `h == 0` · ✗ `(memcmp(d.owner, sa8, 0x20) as u32) != 0` #19 · `u154 != -1` · `u150 != -1` · … 13 more
- bundle/initialize_reward.ts:2122 CPI: ✗ `g == 0x8000000000000000` · `m != -1` · `k != -1` · `u22 != -1` · `u18 != -1` · `j != -1` · `u5 != -1` · ✗ `f == 0` · ✗ `ix_args_len == 0`

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/initialize_reward.ts:247)
- system_program.key == (constant address) (address, found, bundle/initialize_reward.ts:252)
- rent.key == (constant address) (address, found, bundle/initialize_reward.ts:258)
- reward_authority.key == (constant address) (address, found, bundle/initialize_reward.ts:272)
- token_program.key == (constant address) (address, found, bundle/initialize_reward.ts:287)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, reward_mint.key, funder.key, reward_vault.key
- reward_authority.key: validated (address found @accounts_initialize_reward:85, key found @accounts_initialize_reward:85)
- whirlpool.data: validated (owner found @accounts_initialize_reward:23, discriminator found @accounts_initialize_reward:23, initialized found @accounts_initialize_reward:23)
- reward_mint.data: validated (owner found @accounts_initialize_reward:39, discriminator found @accounts_initialize_reward:39, initialized found @accounts_initialize_reward:39)
- rent.key: validated (address found @accounts_initialize_reward:71)
- token_program.key: validated (address found @accounts_initialize_reward:60)
- system_program.key: validated (address found @accounts_initialize_reward:65)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_reward.ts:172 | PARTIAL | whirlpool |  | `i != 2` | return |
| 1 | bundle/initialize_reward.ts:197 | found | reward_authority | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 2 | bundle/initialize_reward.ts:208 | found | funder | signer (via try_accounts_11718 (count, signer)) | `g != 2` | return |
| 3 | bundle/initialize_reward.ts:210 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 4 | bundle/initialize_reward.ts:226 | found | reward_mint | owner, discriminator, initialized (via try_accounts_11e98 (count, owner, discriminator, initialized)) | `ld32(s290) == 2` | return |
| 5 | bundle/initialize_reward.ts:242 | found | reward_vault | signer (via try_accounts_11718 (count, signer)) | `n != 2` | return |
| 6 | bundle/initialize_reward.ts:247 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `p != 2` | return |
| 7 | bundle/initialize_reward.ts:252 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `r != 2` | return |
| 8 | bundle/initialize_reward.ts:258 | found | rent | address (via try_accounts_11990 (count, address)) | `t == 0` | return |
| 9 | bundle/initialize_reward.ts:272 | found | reward_authority | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 10 | bundle/initialize_reward.ts:273 | found | funder | writable | `ld8(ld64(s450 + 0x38) + 0x29) == 0` | anchor::ConstraintMut |
| 11 | bundle/initialize_reward.ts:282 | found | whirlpool | writable | `!(ld8(ld64(ld64(s450 + 0x30)) + 0x29) != 0)` | anchor::ConstraintMut |
| 12 | bundle/initialize_reward.ts:283 | found | reward_vault | writable | `!(ld8(ld64(s450 + 0x28) + 0x29) != 0)` | anchor::ConstraintMut |
| 13 | bundle/initialize_reward.ts:287 | found | token_program | address | `ac != 0` | anchor::ConstraintAddress |
| 14 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 15 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 16 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 17 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 18 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 19 | bundle/initialize_reward.ts:1182 | PARTIAL | d? | owner | `!((memcmp(d.owner, sa8, 0x20) as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 20 | bundle/initialize_reward.ts:1417 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 21 | bundle/initialize_reward.ts:1450 | found |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
