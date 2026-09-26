# collect_reward_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_collect_reward_v2 (anchor); 74 functions reachable: ix_collect_reward_v2, fn_11150, accounts_collect_reward_v2, memcpy, fn_3ba00, fn_d9230, fn_147990, fn_11f980, fn_139720, fn_149678, fn_eef8, fn_14ef78, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 1 | position [str] | — | found | found (+discriminator found) | — | — |
| 2 | position_token_account [str] | — | — | found (+discriminator found) | — | — |
| 3 | reward_owner_account [str] | — | found | found (+discriminator found) | — | — |
| 4 | reward_mint [str] | — | — | found (+discriminator found) | — | found |
| 5 | reward_vault [str] | — | found | found (+discriminator found) | — | found |
| 6 | reward_token_program [str] | — | — | — | found | found |
| 7 | memo_program [str] | — | — | — | found | found |
| 8 | position_authority [str] | found | — | — | — | — |

## Constraints per account

- whirlpool: owner found (bundle/collect_reward_v2.ts:377 via try_accounts_11a48); initialized found (bundle/collect_reward_v2.ts:377 via try_accounts_11a48); discriminator found (bundle/collect_reward_v2.ts:377 via try_accounts_11a48)
- position: owner found (bundle/collect_reward_v2.ts:396 via try_accounts_11b00); initialized found (bundle/collect_reward_v2.ts:396 via try_accounts_11b00); discriminator found (bundle/collect_reward_v2.ts:396 via try_accounts_11b00); writable found (bundle/collect_reward_v2.ts:460); key found (bundle/collect_reward_v2.ts:473); has_one found (bundle/collect_reward_v2.ts:473)
- position_token_account: owner found (bundle/collect_reward_v2.ts:412 via try_accounts_558); discriminator found (bundle/collect_reward_v2.ts:412 via try_accounts_558); initialized found (bundle/collect_reward_v2.ts:412 via try_accounts_558); key found (bundle/collect_reward_v2.ts:487); raw found (bundle/collect_reward_v2.ts:487)
- reward_owner_account: owner found (bundle/collect_reward_v2.ts:427 via try_accounts_558); discriminator found (bundle/collect_reward_v2.ts:427 via try_accounts_558); initialized found (bundle/collect_reward_v2.ts:427 via try_accounts_558); writable found (bundle/collect_reward_v2.ts:497); raw found (bundle/collect_reward_v2.ts:510)
- reward_mint: owner found (bundle/collect_reward_v2.ts:443 via fn_2518); discriminator found (bundle/collect_reward_v2.ts:443 via fn_2518); initialized found (bundle/collect_reward_v2.ts:443 via fn_2518); key found (bundle/collect_reward_v2.ts:516); address found (bundle/collect_reward_v2.ts:516)
- reward_vault: owner found (bundle/collect_reward_v2.ts:448 via fn_2258); discriminator found (bundle/collect_reward_v2.ts:448 via fn_2258); initialized found (bundle/collect_reward_v2.ts:448 via fn_2258); writable found (bundle/collect_reward_v2.ts:530); key found (bundle/collect_reward_v2.ts:543); address found (bundle/collect_reward_v2.ts:543)
- reward_token_program: address found (bundle/collect_reward_v2.ts:453 via try_accounts_120); executable found (bundle/collect_reward_v2.ts:453 via try_accounts_120)
- memo_program: address found (bundle/collect_reward_v2.ts:458 via fn_12758); executable found (bundle/collect_reward_v2.ts:458 via fn_12758)
- position_authority: signer found (bundle/collect_reward_v2.ts:394 via try_accounts_11718)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- bundle/collect_reward_v2.ts:3729 [conditional] program not decoded

## PDAs derived

- bundle/collect_reward_v2.ts:2974 find_program_address(["extra-account-metas", *g [ix data?]], program *d)
- bundle/collect_reward_v2.ts:4796 find_program_address(?, program ?)

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 28 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer position_authority; owner position; initialized position; discriminator position; owner position_token_account; …)
- bundle/collect_reward_v2.ts:3729 CPI: 27 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer position_authority; owner position; initialized position; discriminator position; owner position_token_account; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 29 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `ld8(sb0) == 0` · `cj != -1` · `cg != -1` · `cd != -1` · `cb != -1` · `u258 != -1` · `by != -1` · `u242 != -1` · `bu != -1` · `br > 0x300000007` · … 10 more
- bundle/collect_reward_v2.ts:3729 CPI: `p != -1` · `u47 != -1` · ✗ `(f & 1) == 0` · ✗ `ld8(sb0) != 0` · `3 > (c as u8)` · ✗ `j == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */` · ✗ `g != 2` · ✗ `i == 0` · ✗ `h == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */` · ✗ `f == 0`

## Relations (equalities the checks establish)

- reward_token_program.key == (constant address) (address, found, bundle/collect_reward_v2.ts:453)
- memo_program.key == (constant address) (address, found, bundle/collect_reward_v2.ts:458)
- position.position_authority? == position_authority.key (has_one, found, bundle/collect_reward_v2.ts:473)
- reward_mint.key == (constant address) (address, found, bundle/collect_reward_v2.ts:516)
- reward_vault.key == (constant address) (address, found, bundle/collect_reward_v2.ts:543)
- reward_token_program.key == (constant address) (address, found, bundle/collect_reward_v2.ts:566)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, reward_owner_account.key, position_authority.key
- whirlpool.data: validated (owner found @accounts_collect_reward_v2:37, discriminator found @accounts_collect_reward_v2:37, initialized found @accounts_collect_reward_v2:37)
- position.key: validated (key found @accounts_collect_reward_v2:133, has_one found @accounts_collect_reward_v2:133)
- position.data: validated (owner found @accounts_collect_reward_v2:56, discriminator found @accounts_collect_reward_v2:56, initialized found @accounts_collect_reward_v2:56)
- position_token_account.key: validated (key found @accounts_collect_reward_v2:147)
- position_token_account.data: validated (owner found @accounts_collect_reward_v2:72, discriminator found @accounts_collect_reward_v2:72, initialized found @accounts_collect_reward_v2:72)
- reward_owner_account.data: validated (owner found @accounts_collect_reward_v2:87, discriminator found @accounts_collect_reward_v2:87, initialized found @accounts_collect_reward_v2:87)
- reward_mint.key: validated (address found @accounts_collect_reward_v2:176, key found @accounts_collect_reward_v2:176)
- reward_mint.data: validated (owner found @accounts_collect_reward_v2:103, discriminator found @accounts_collect_reward_v2:103, initialized found @accounts_collect_reward_v2:103)
- reward_vault.key: validated (address found @accounts_collect_reward_v2:203, key found @accounts_collect_reward_v2:203)
- reward_vault.data: validated (owner found @accounts_collect_reward_v2:108, discriminator found @accounts_collect_reward_v2:108, initialized found @accounts_collect_reward_v2:108)
- reward_token_program.key: validated (address found @accounts_collect_reward_v2:113)
- memo_program.key: validated (address found @accounts_collect_reward_v2:118)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/collect_reward_v2.ts:377 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 1 | bundle/collect_reward_v2.ts:394 | found | position_authority | signer (via try_accounts_11718 (count, signer)) | `i != 2` | return |
| 2 | bundle/collect_reward_v2.ts:396 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 3 | bundle/collect_reward_v2.ts:412 | found | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `ld32(s290 + 0xb0) == 2` | return |
| 4 | bundle/collect_reward_v2.ts:427 | found | reward_owner_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `ld32(s290 + 0xb0) == 2` | return |
| 5 | bundle/collect_reward_v2.ts:443 | found | reward_mint | owner, discriminator, initialized (via fn_2518 (count, owner, discriminator, initialized)) | `s != 2` | return |
| 6 | bundle/collect_reward_v2.ts:448 | found | reward_vault | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `u != 2` | return |
| 7 | bundle/collect_reward_v2.ts:453 | found | reward_token_program | address, executable (via try_accounts_120 (count, address, executable)) | `w != 2` | return |
| 8 | bundle/collect_reward_v2.ts:458 | found | memo_program | address, executable (via fn_12758 (count, address, executable)) | `y != 2` | return |
| 9 | bundle/collect_reward_v2.ts:460 | found | position | writable | `ld8(ld64(z) + 0x29) == 0` | anchor::ConstraintMut |
| 10 | bundle/collect_reward_v2.ts:473 | found | position | key, has_one | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 11 | bundle/collect_reward_v2.ts:487 | found | position_token_account | key, raw | `!((memcmp(ac.mint, z + 0x28, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 12 | bundle/collect_reward_v2.ts:488 | found | position_token_account | raw | `ac.amount != 1` | anchor::ConstraintRaw |
| 13 | bundle/collect_reward_v2.ts:497 | found | reward_owner_account | writable | `ld8(ld64(ld64(s538 + 8) + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 14 | bundle/collect_reward_v2.ts:510 | found | reward_owner_account | raw | `!((memcmp(ld64(s538 + 8) + 0x28, ai, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 15 | bundle/collect_reward_v2.ts:516 | found | reward_mint | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 16 | bundle/collect_reward_v2.ts:530 | found | reward_vault | writable | `reward_vault.is_writable == 0` | anchor::ConstraintMut |
| 17 | bundle/collect_reward_v2.ts:543 | found | reward_vault | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 18 | bundle/collect_reward_v2.ts:566 | found | reward_token_program | address | `ah != 0` | anchor::ConstraintAddress |
| 19 | bundle/collect_reward_v2.ts:708 | PARTIAL | position |  | `f != 2` | return |
| 20 | bundle/collect_reward_v2.ts:760 | PARTIAL | reward_vault |  | `t != 0x800000000000001a /* Ok */` | return |
| 21 | bundle/collect_reward_v2.ts:766 | PARTIAL | reward_vault |  | `v != 2` | return |
| 22 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 23 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 24 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 25 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 26 | bundle/collect_reward_v2.ts:908 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 27 | bundle/collect_reward_v2.ts:913 | found |  | key, address | `(memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 28 | bundle/collect_reward_v2.ts:923 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 29 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 30 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 31 | bundle/collect_reward_v2.ts:2722 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
