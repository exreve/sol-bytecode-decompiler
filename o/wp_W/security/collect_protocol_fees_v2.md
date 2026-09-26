# collect_protocol_fees_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_collect_protocol_fees_v2 (anchor); 72 functions reachable: ix_collect_protocol_fees_v2, fn_11150, accounts_collect_protocol_fees_v2, memcpy, fn_3b6d8, fn_d7470, fn_eef8, fn_14ef78, fn_147990, fn_11f980, fn_139720, fn_149678, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 2 | token_mint_a [str] | — | — | found (+discriminator found) | — | found |
| 3 | token_mint_b [str] | — | — | found (+discriminator found) | — | found |
| 4 | token_vault_a [str] | — | found | found (+discriminator found) | — | found |
| 5 | token_vault_b [str] | — | found | found (+discriminator found) | — | found |
| 6 | token_destination_a [str] | — | found | found (+discriminator found) | — | — |
| 7 | token_destination_b [str] | — | found | found (+discriminator found) | — | — |
| 8 | token_program_a [str] | — | — | — | found | found |
| 9 | token_program_b [str] | — | — | — | found | found |
| 10 | collect_protocol_fees_authority [str] | found | — | — | — | found |
| 11 | memo_program [str] | — | — | — | found | found |

## Constraints per account

- whirlpools_config: owner found (bundle/collect_protocol_fees_v2.ts:342 via try_accounts_11de0); initialized found (bundle/collect_protocol_fees_v2.ts:342 via try_accounts_11de0); discriminator found (bundle/collect_protocol_fees_v2.ts:342 via try_accounts_11de0)
- whirlpool: owner found (bundle/collect_protocol_fees_v2.ts:356 via try_accounts_11a48); initialized found (bundle/collect_protocol_fees_v2.ts:356 via try_accounts_11a48); discriminator found (bundle/collect_protocol_fees_v2.ts:356 via try_accounts_11a48); writable found (bundle/collect_protocol_fees_v2.ts:496); key found (bundle/collect_protocol_fees_v2.ts:508); has_one found (bundle/collect_protocol_fees_v2.ts:508)
- token_mint_a: owner found (bundle/collect_protocol_fees_v2.ts:376 via try_accounts_610); discriminator found (bundle/collect_protocol_fees_v2.ts:376 via try_accounts_610); initialized found (bundle/collect_protocol_fees_v2.ts:376 via try_accounts_610); key found (bundle/collect_protocol_fees_v2.ts:528); address found (bundle/collect_protocol_fees_v2.ts:528)
- token_mint_b: owner found (bundle/collect_protocol_fees_v2.ts:393 via try_accounts_610); discriminator found (bundle/collect_protocol_fees_v2.ts:393 via try_accounts_610); initialized found (bundle/collect_protocol_fees_v2.ts:393 via try_accounts_610); key found (bundle/collect_protocol_fees_v2.ts:532); address found (bundle/collect_protocol_fees_v2.ts:532)
- token_vault_a: owner found (bundle/collect_protocol_fees_v2.ts:412 via try_accounts_558); discriminator found (bundle/collect_protocol_fees_v2.ts:412 via try_accounts_558); initialized found (bundle/collect_protocol_fees_v2.ts:412 via try_accounts_558); writable found (bundle/collect_protocol_fees_v2.ts:533); key found (bundle/collect_protocol_fees_v2.ts:545); address found (bundle/collect_protocol_fees_v2.ts:545)
- token_vault_b: owner found (bundle/collect_protocol_fees_v2.ts:430 via try_accounts_558); discriminator found (bundle/collect_protocol_fees_v2.ts:430 via try_accounts_558); initialized found (bundle/collect_protocol_fees_v2.ts:430 via try_accounts_558); writable found (bundle/collect_protocol_fees_v2.ts:558); key found (bundle/collect_protocol_fees_v2.ts:570); address found (bundle/collect_protocol_fees_v2.ts:570)
- token_destination_a: owner found (bundle/collect_protocol_fees_v2.ts:448 via try_accounts_558); discriminator found (bundle/collect_protocol_fees_v2.ts:448 via try_accounts_558); initialized found (bundle/collect_protocol_fees_v2.ts:448 via try_accounts_558); writable found (bundle/collect_protocol_fees_v2.ts:583); key found (bundle/collect_protocol_fees_v2.ts:592); raw found (bundle/collect_protocol_fees_v2.ts:592)
- token_destination_b: owner found (bundle/collect_protocol_fees_v2.ts:467 via try_accounts_558); discriminator found (bundle/collect_protocol_fees_v2.ts:467 via try_accounts_558); initialized found (bundle/collect_protocol_fees_v2.ts:467 via try_accounts_558); writable found (bundle/collect_protocol_fees_v2.ts:593); key found (bundle/collect_protocol_fees_v2.ts:594); raw found (bundle/collect_protocol_fees_v2.ts:594)
- token_program_a: address found (bundle/collect_protocol_fees_v2.ts:485 via try_accounts_120); executable found (bundle/collect_protocol_fees_v2.ts:485 via try_accounts_120); key found (bundle/collect_protocol_fees_v2.ts:604)
- token_program_b: address found (bundle/collect_protocol_fees_v2.ts:490 via try_accounts_120); executable found (bundle/collect_protocol_fees_v2.ts:490 via try_accounts_120); key found (bundle/collect_protocol_fees_v2.ts:626)
- collect_protocol_fees_authority: signer found (bundle/collect_protocol_fees_v2.ts:372 via try_accounts_11718); key found (bundle/collect_protocol_fees_v2.ts:524); address found (bundle/collect_protocol_fees_v2.ts:524)
- memo_program: address found (bundle/collect_protocol_fees_v2.ts:495 via fn_12758); executable found (bundle/collect_protocol_fees_v2.ts:495 via fn_12758)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- bundle/collect_protocol_fees_v2.ts:3810 [conditional] program not decoded

## PDAs derived

- bundle/collect_protocol_fees_v2.ts:3051 find_program_address(["extra-account-metas", *g [ix data?]], program *d)
- bundle/collect_protocol_fees_v2.ts:4877 find_program_address(?, program ?)

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 36 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpool; initialized whirlpool; discriminator whirlpool; signer collect_protocol_fees_authority; owner token_mint_a; …)
- bundle/collect_protocol_fees_v2.ts:3810 CPI: 35 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpool; initialized whirlpool; discriminator whirlpool; signer collect_protocol_fees_authority; owner token_mint_a; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 37 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `ld8(sb0) == 0` · `cj != -1` · `cg != -1` · `cd != -1` · `cb != -1` · `u258 != -1` · `by != -1` · `u242 != -1` · `bu != -1` · `br > 0x300000007` · … 7 more
- bundle/collect_protocol_fees_v2.ts:3810 CPI: `p != -1` · `u47 != -1` · ✗ `(f & 1) == 0` · ✗ `ld8(sb0) != 0` · ✗ `i == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */` · ✗ `g == 2` · ✗ `f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */`

## Relations (equalities the checks establish)

- token_program_a.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:485)
- token_program_b.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:490)
- memo_program.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:495)
- whirlpool.collect_protocol_fees_authority? == collect_protocol_fees_authority.key (has_one, found, bundle/collect_protocol_fees_v2.ts:508)
- collect_protocol_fees_authority.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:524)
- token_mint_a.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:528)
- token_mint_b.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:532)
- token_vault_a.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:545)
- token_vault_b.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:570)
- token_program_a.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:604)
- token_program_b.key == (constant address) (address, found, bundle/collect_protocol_fees_v2.ts:626)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key
- whirlpools_config.data: validated (owner found @accounts_collect_protocol_fees_v2:7, discriminator found @accounts_collect_protocol_fees_v2:7, initialized found @accounts_collect_protocol_fees_v2:7)
- whirlpool.key: validated (key found @accounts_collect_protocol_fees_v2:173, has_one found @accounts_collect_protocol_fees_v2:173)
- whirlpool.data: validated (owner found @accounts_collect_protocol_fees_v2:21, discriminator found @accounts_collect_protocol_fees_v2:21, initialized found @accounts_collect_protocol_fees_v2:21)
- token_mint_a.key: validated (address found @accounts_collect_protocol_fees_v2:193, key found @accounts_collect_protocol_fees_v2:193)
- token_mint_a.data: validated (owner found @accounts_collect_protocol_fees_v2:41, discriminator found @accounts_collect_protocol_fees_v2:41, initialized found @accounts_collect_protocol_fees_v2:41)
- token_mint_b.key: validated (address found @accounts_collect_protocol_fees_v2:197, key found @accounts_collect_protocol_fees_v2:197)
- token_mint_b.data: validated (owner found @accounts_collect_protocol_fees_v2:58, discriminator found @accounts_collect_protocol_fees_v2:58, initialized found @accounts_collect_protocol_fees_v2:58)
- token_vault_a.key: validated (address found @accounts_collect_protocol_fees_v2:210, key found @accounts_collect_protocol_fees_v2:210)
- token_vault_a.data: validated (owner found @accounts_collect_protocol_fees_v2:77, discriminator found @accounts_collect_protocol_fees_v2:77, initialized found @accounts_collect_protocol_fees_v2:77)
- token_vault_b.key: validated (address found @accounts_collect_protocol_fees_v2:235, key found @accounts_collect_protocol_fees_v2:235)
- token_vault_b.data: validated (owner found @accounts_collect_protocol_fees_v2:95, discriminator found @accounts_collect_protocol_fees_v2:95, initialized found @accounts_collect_protocol_fees_v2:95)
- token_destination_a.key: validated (key found @accounts_collect_protocol_fees_v2:257)
- token_destination_a.data: validated (owner found @accounts_collect_protocol_fees_v2:113, discriminator found @accounts_collect_protocol_fees_v2:113, initialized found @accounts_collect_protocol_fees_v2:113)
- token_destination_b.key: validated (key found @accounts_collect_protocol_fees_v2:259)
- token_destination_b.data: validated (owner found @accounts_collect_protocol_fees_v2:132, discriminator found @accounts_collect_protocol_fees_v2:132, initialized found @accounts_collect_protocol_fees_v2:132)
- token_program_a.key: validated (address found @accounts_collect_protocol_fees_v2:150, key found @accounts_collect_protocol_fees_v2:269)
- token_program_b.key: validated (address found @accounts_collect_protocol_fees_v2:155, key found @accounts_collect_protocol_fees_v2:291)
- collect_protocol_fees_authority.key: validated (address found @accounts_collect_protocol_fees_v2:189, key found @accounts_collect_protocol_fees_v2:189)
- memo_program.key: validated (address found @accounts_collect_protocol_fees_v2:160)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/collect_protocol_fees_v2.ts:342 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 1 | bundle/collect_protocol_fees_v2.ts:356 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 2 | bundle/collect_protocol_fees_v2.ts:372 | found | collect_protocol_fees_authority | signer (via try_accounts_11718 (count, signer)) | `j != 2` | return |
| 3 | bundle/collect_protocol_fees_v2.ts:376 | found | token_mint_a | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `l == 2` | return |
| 4 | bundle/collect_protocol_fees_v2.ts:393 | found | token_mint_b | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `o == 2` | return |
| 5 | bundle/collect_protocol_fees_v2.ts:412 | found | token_vault_a | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `p == 2` | return |
| 6 | bundle/collect_protocol_fees_v2.ts:430 | found | token_vault_b | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `s == 2` | return |
| 7 | bundle/collect_protocol_fees_v2.ts:448 | found | token_destination_a | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `v == 2` | return |
| 8 | bundle/collect_protocol_fees_v2.ts:467 | found | token_destination_b | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `y == 2` | return |
| 9 | bundle/collect_protocol_fees_v2.ts:485 | found | token_program_a | address, executable (via try_accounts_120 (count, address, executable)) | `ab != 2` | return |
| 10 | bundle/collect_protocol_fees_v2.ts:490 | found | token_program_b | address, executable (via try_accounts_120 (count, address, executable)) | `ad != 2` | return |
| 11 | bundle/collect_protocol_fees_v2.ts:495 | found | memo_program | address, executable (via fn_12758 (count, address, executable)) | `af != 2` | return |
| 12 | bundle/collect_protocol_fees_v2.ts:496 | found | whirlpool | writable | `ld8(ld64(i) + 0x29) == 0` | anchor::ConstraintMut |
| 13 | bundle/collect_protocol_fees_v2.ts:508 | found | whirlpool | key, has_one | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 14 | bundle/collect_protocol_fees_v2.ts:524 | found | collect_protocol_fees_authority | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 15 | bundle/collect_protocol_fees_v2.ts:528 | found | token_mint_a | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 16 | bundle/collect_protocol_fees_v2.ts:532 | found | token_mint_b | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 17 | bundle/collect_protocol_fees_v2.ts:533 | found | token_vault_a | writable | `ld8(ld64(sa58 + 0x18) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 18 | bundle/collect_protocol_fees_v2.ts:545 | found | token_vault_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 19 | bundle/collect_protocol_fees_v2.ts:558 | found | token_vault_b | writable | `ld8(ld64(sa78 + 0x18) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 20 | bundle/collect_protocol_fees_v2.ts:570 | found | token_vault_b | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 21 | bundle/collect_protocol_fees_v2.ts:583 | found | token_destination_a | writable | `ld8(ld64(s470 + 0x10) + 0x29) == 0` | anchor::ConstraintMut |
| 22 | bundle/collect_protocol_fees_v2.ts:592 | found | token_destination_a | key, raw | `!((memcmp(s458, i + 0x1a8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 23 | bundle/collect_protocol_fees_v2.ts:593 | found | token_destination_b | writable | `!(ld8(ld64(s398 + 0x10) + 0x29) != 0)` | anchor::ConstraintMut |
| 24 | bundle/collect_protocol_fees_v2.ts:594 | found | token_destination_b | key, raw | `!((memcmp(s380, i + 0x1e8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 25 | bundle/collect_protocol_fees_v2.ts:604 | found | token_program_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 26 | bundle/collect_protocol_fees_v2.ts:626 | found | token_program_b | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 27 | bundle/collect_protocol_fees_v2.ts:840 | PARTIAL | whirlpool |  | `f != 2` | return |
| 28 | bundle/collect_protocol_fees_v2.ts:848 | PARTIAL | token_vault_a | key | `(memcmp(b + 0x100, c, 0x20) as u32) == 0` | return |
| 29 | bundle/collect_protocol_fees_v2.ts:938 | PARTIAL | token_destination_b |  | `z != 0x800000000000001a /* Ok */` | return |
| 30 | bundle/collect_protocol_fees_v2.ts:944 | PARTIAL | token_destination_b |  | `af != 2` | return |
| 31 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 32 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 33 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 34 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 35 | bundle/collect_protocol_fees_v2.ts:1065 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 36 | bundle/collect_protocol_fees_v2.ts:1070 | found |  | key, address | `(memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 37 | bundle/collect_protocol_fees_v2.ts:1080 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 38 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 39 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 40 | bundle/collect_protocol_fees_v2.ts:2799 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
