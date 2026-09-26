# lock_position

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_lock_position (anchor); 54 functions reachable: ix_lock_position, accounts_lock_position, memcpy, fn_33380, fn_b2cf8, fn_147e78, fn_11f980, fn_147990, fn_139720, fn_149678, fn_9540, fn_145330, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | funder [str] | found | PARTIAL | — | — | — |
| 1 | position [str] | — | — | found (+discriminator found) | — | — |
| 2 | position_mint [str] | — | — | found (+discriminator found) | — | PARTIAL |
| 3 | position_token_account [str] | — | PARTIAL | found (+discriminator found) | — | — |
| 4 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 5 | lock_config [str] | — | PARTIAL | PARTIAL | — | — |
| 6 | token_2022_program [str] | — | — | — | found | found |
| 7 | system_program [str] | — | — | — | found | found |
| 8 | position_authority [str] | found | — | — | — | — |

## Constraints per account

- funder: signer found (bundle/lock_position.ts:287 via try_accounts_11718); writable PARTIAL (bundle/lock_position.ts:502)
- position: owner found (bundle/lock_position.ts:306 via try_accounts_11b00); initialized found (bundle/lock_position.ts:306 via try_accounts_11b00); discriminator found (bundle/lock_position.ts:306 via try_accounts_11b00); key PARTIAL (bundle/lock_position.ts:512); pda PARTIAL (bundle/lock_position.ts:512); has_one PARTIAL (bundle/lock_position.ts:535)
- position_mint: owner found (bundle/lock_position.ts:319 via try_accounts_610); discriminator found (bundle/lock_position.ts:319 via try_accounts_610); initialized found (bundle/lock_position.ts:319 via try_accounts_610); key PARTIAL (bundle/lock_position.ts:542); address PARTIAL (bundle/lock_position.ts:545)
- position_token_account: owner found (bundle/lock_position.ts:338 via try_accounts_558); discriminator found (bundle/lock_position.ts:338 via try_accounts_558); initialized found (bundle/lock_position.ts:338 via try_accounts_558); writable PARTIAL (bundle/lock_position.ts:546); raw PARTIAL (bundle/lock_position.ts:556); key PARTIAL (bundle/lock_position.ts:557)
- whirlpool: owner found (bundle/lock_position.ts:371 via try_accounts_11a48); initialized found (bundle/lock_position.ts:371 via try_accounts_11a48); discriminator found (bundle/lock_position.ts:371 via try_accounts_11a48)
- lock_config: key found (bundle/lock_position.ts:414); pda found (bundle/lock_position.ts:414); writable PARTIAL (bundle/lock_position.ts:421); rent_exempt PARTIAL (bundle/lock_position.ts:492); owner PARTIAL (bundle/lock_position.ts:1249 via fn_4240); initialized PARTIAL (bundle/lock_position.ts:1249 via fn_4240)
- token_2022_program: address found (bundle/lock_position.ts:385 via fn_12be8); executable found (bundle/lock_position.ts:385 via fn_12be8); key PARTIAL (bundle/lock_position.ts:561)
- system_program: address found (bundle/lock_position.ts:390 via fn_122e8); executable found (bundle/lock_position.ts:390 via fn_122e8)
- position_authority: signer found (bundle/lock_position.ts:300 via try_accounts_11718)

## CPIs

- shared.ts:20063 [conditional] program not decoded
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/lock_position.ts:406 find_program_address(["lock_config", *s70], program *(ld64(s800)))
- bundle/lock_position.ts:506 find_program_address(["position", *bq], program *(ld64(s800)))
- compared with provided accounts: position PARTIAL, lock_config found

## Dominance (checks on every path to the operation; across calls)

- shared.ts:20063 CPI: 18 dominating checks (signer funder; signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; …)
- entrypoint.ts:14045 CPI: 33 dominating checks (signer funder; signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 35 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:20063 CPI: `bo != -1` · `bm != -1` · `bh != -1` · `bf != -1` · `u229 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s260, 0x20) as u32) == 0` #31 · `g != 0` · `(memcmp(s5d8, s98, 0x20) as u32) == 0` #9 · … 12 more
- entrypoint.ts:14045 CPI: `u113 != -1` · `u104 != -1` · `u98 != -1` · `u88 != -1` · `u82 != -1` · `u74 != -1` · `u70 != -1` · `u62 != -1` · ✗ `t == 0x8000000000000000` · `u28 != -1` · … 9 more

## Relations (equalities the checks establish)

- token_2022_program.key == (constant address) (address, found, bundle/lock_position.ts:385)
- system_program.key == (constant address) (address, found, bundle/lock_position.ts:390)
- position.whirlpool == whirlpool.key (field_eq, PARTIAL, bundle/lock_position.ts:535)
- position_mint.key == (constant address) (address, PARTIAL, bundle/lock_position.ts:545)
- position.data == position_mint.key (field_eq, PARTIAL, bundle/lock_position.ts:545)
- token_2022_program.key == (constant address) (address, PARTIAL, bundle/lock_position.ts:561)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): funder.key, whirlpool.key, position_authority.key
- position.key: partially-validated (pda partial @accounts_lock_position:236, key partial @accounts_lock_position:236, has_one partial @accounts_lock_position:259)
- position.data: validated (owner found @accounts_lock_position:30, discriminator found @accounts_lock_position:30, initialized found @accounts_lock_position:30)
- position_mint.key: partially-validated (address partial @accounts_lock_position:269, key partial @accounts_lock_position:266)
- position_mint.data: validated (owner found @accounts_lock_position:43, discriminator found @accounts_lock_position:43, initialized found @accounts_lock_position:43)
- position_token_account.key: partially-validated (key partial @accounts_lock_position:281)
- position_token_account.data: validated (owner found @accounts_lock_position:62, discriminator found @accounts_lock_position:62, initialized found @accounts_lock_position:62)
- whirlpool.data: validated (owner found @accounts_lock_position:95, discriminator found @accounts_lock_position:95, initialized found @accounts_lock_position:95)
- lock_config.key: validated (pda found @accounts_lock_position:138, key found @accounts_lock_position:138)
- lock_config.data: partially-validated (owner partial @fn_b1248:345, initialized partial @fn_b1248:345)
- token_2022_program.key: validated (address found @accounts_lock_position:109, key partial @accounts_lock_position:285)
- system_program.key: validated (address found @accounts_lock_position:114)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/lock_position.ts:287 | found | funder | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 1 | bundle/lock_position.ts:300 | found | position_authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 2 | bundle/lock_position.ts:306 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `k == 0` | return |
| 3 | bundle/lock_position.ts:319 | found | position_mint | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `n == 2` | return |
| 4 | bundle/lock_position.ts:338 | found | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `p == 2` | return |
| 5 | bundle/lock_position.ts:354 | found |  | count | `s == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/lock_position.ts:371 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `whirlpool == 0` | return |
| 7 | bundle/lock_position.ts:385 | found | token_2022_program | address, executable (via fn_12be8 (count, address, executable)) | `w != 2` | return |
| 8 | bundle/lock_position.ts:390 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `y != 2` | return |
| 9 | bundle/lock_position.ts:414 | found | lock_config | key, pda | `!((memcmp(s5d8, s98, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 10 | bundle/lock_position.ts:421 | PARTIAL | lock_config | writable | `lock_config.is_writable == 0` | anchor::ConstraintMut |
| 11 | bundle/lock_position.ts:492 | PARTIAL | lock_config | rent_exempt | `bi > ld64(sb08)` | anchor::ConstraintRentExempt |
| 12 | bundle/lock_position.ts:502 | PARTIAL | funder | writable | `!(ld8(ld64(s7f8) + 0x29) != 0)` | anchor::ConstraintMut |
| 13 | bundle/lock_position.ts:512 | PARTIAL | position | key, pda | `(memcmp(s5d8, s40, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 14 | bundle/lock_position.ts:535 | PARTIAL | position | key, has_one | `!((memcmp(s20, s70, 0x20) as u32) == 0)` | anchor::ConstraintHasOne |
| 15 | bundle/lock_position.ts:542 | PARTIAL | position_mint | key, owner | `!((memcmp(ce, s70, 0x20) as u32) == 0)` | anchor::ConstraintOwner |
| 16 | bundle/lock_position.ts:545 | PARTIAL | position_mint | key, address | `!((memcmp(s20, s70, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 17 | bundle/lock_position.ts:546 | PARTIAL | position_token_account | writable | `ld8(ld64(s6a8 + 0x10) + 0x29) == 0` | anchor::ConstraintMut |
| 18 | bundle/lock_position.ts:556 | PARTIAL | position_token_account | raw | `!(ld64(s690 + 0x40) == 1)` | anchor::ConstraintRaw |
| 19 | bundle/lock_position.ts:557 | PARTIAL | position_token_account | key, raw | `!((memcmp(s690, s7c8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 20 | bundle/lock_position.ts:558 | PARTIAL | position_token_account | raw | `!(ld8(s690 + 0x6c) != 2)` | anchor::ConstraintRaw |
| 21 | bundle/lock_position.ts:561 | PARTIAL | token_2022_program | key, address | `(memcmp(s70, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 22 | bundle/lock_position.ts:819 | PARTIAL | lock_config | key | `!((memcmp(b + 0x80, c, 0x20) as u32) == 0)` | return |
| 23 | bundle/lock_position.ts:844 | PARTIAL | lock_config |  | `l != 2` | return |
| 24 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 25 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 26 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 27 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 28 | bundle/lock_position.ts:873 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 29 | bundle/lock_position.ts:878 | found |  | key, address | `(memcmp(h, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 30 | bundle/lock_position.ts:888 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 31 | bundle/lock_position.ts:921 | PARTIAL |  | key | `(memcmp(s40, s260, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 32 | bundle/lock_position.ts:1249 | PARTIAL | lock_config | owner, initialized (via fn_4240 (owner, initialized)) | `ld64(sb0) == 0` | return |
| 33 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 34 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 35 | bundle/lock_position.ts:1607 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 36 | bundle/lock_position.ts:1616 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 37 | bundle/lock_position.ts:1681 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
