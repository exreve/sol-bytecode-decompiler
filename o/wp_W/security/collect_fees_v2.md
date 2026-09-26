# collect_fees_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_collect_fees_v2 (anchor); 74 functions reachable: ix_collect_fees_v2, fn_11150, accounts_collect_fees_v2, memcpy, fn_3b360, fn_d46d8, fn_eef8, fn_14ef78, fn_147990, fn_11f980, fn_139720, fn_149678, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 1 | position [str] | — | found | found (+discriminator found) | — | — |
| 2 | position_token_account [str] | — | — | found (+discriminator found) | — | — |
| 3 | token_mint_a [str] | — | — | found (+discriminator found) | — | found |
| 4 | token_mint_b [str] | — | — | found (+discriminator found) | — | found |
| 5 | token_owner_account_a [str] | — | found | found (+discriminator found) | — | — |
| 6 | token_vault_a [str] | — | found | found (+discriminator found) | — | found |
| 7 | token_owner_account_b [str] | — | found | found (+discriminator found) | — | — |
| 8 | token_vault_b [str] | — | found | found (+discriminator found) | — | found |
| 9 | token_program_b [str] | — | — | — | found | found |
| 10 | token_program_a [str] | — | — | — | found | found |
| 11 | memo_program [str] | — | — | — | found | found |
| 12 | position_authority [str] | found | — | — | — | — |

## Constraints per account

- whirlpool: owner found (bundle/collect_fees_v2.ts:343 via try_accounts_11a48); initialized found (bundle/collect_fees_v2.ts:343 via try_accounts_11a48); discriminator found (bundle/collect_fees_v2.ts:343 via try_accounts_11a48)
- position: owner found (bundle/collect_fees_v2.ts:361 via try_accounts_11b00); initialized found (bundle/collect_fees_v2.ts:361 via try_accounts_11b00); discriminator found (bundle/collect_fees_v2.ts:361 via try_accounts_11b00); writable found (bundle/collect_fees_v2.ts:458); key found (bundle/collect_fees_v2.ts:470); has_one found (bundle/collect_fees_v2.ts:470)
- position_token_account: owner found (bundle/collect_fees_v2.ts:377 via try_accounts_558); discriminator found (bundle/collect_fees_v2.ts:377 via try_accounts_558); initialized found (bundle/collect_fees_v2.ts:377 via try_accounts_558); state found (bundle/collect_fees_v2.ts:483); key found (bundle/collect_fees_v2.ts:483); raw found (bundle/collect_fees_v2.ts:483)
- token_mint_a: owner found (bundle/collect_fees_v2.ts:392 via try_accounts_610); discriminator found (bundle/collect_fees_v2.ts:392 via try_accounts_610); initialized found (bundle/collect_fees_v2.ts:392 via try_accounts_610); key found (bundle/collect_fees_v2.ts:496); address found (bundle/collect_fees_v2.ts:496)
- token_mint_b: owner found (bundle/collect_fees_v2.ts:408 via try_accounts_610); discriminator found (bundle/collect_fees_v2.ts:408 via try_accounts_610); initialized found (bundle/collect_fees_v2.ts:408 via try_accounts_610); key found (bundle/collect_fees_v2.ts:500); address found (bundle/collect_fees_v2.ts:500)
- token_owner_account_a: owner found (bundle/collect_fees_v2.ts:425 via fn_2258); discriminator found (bundle/collect_fees_v2.ts:425 via fn_2258); initialized found (bundle/collect_fees_v2.ts:425 via fn_2258); writable found (bundle/collect_fees_v2.ts:501); raw found (bundle/collect_fees_v2.ts:510); key PARTIAL (bundle/collect_fees_v2.ts:837)
- token_vault_a: owner found (bundle/collect_fees_v2.ts:430 via fn_2258); discriminator found (bundle/collect_fees_v2.ts:430 via fn_2258); initialized found (bundle/collect_fees_v2.ts:430 via fn_2258); writable found (bundle/collect_fees_v2.ts:512); key found (bundle/collect_fees_v2.ts:516); address found (bundle/collect_fees_v2.ts:516)
- token_owner_account_b: owner found (bundle/collect_fees_v2.ts:435 via fn_2258); discriminator found (bundle/collect_fees_v2.ts:435 via fn_2258); initialized found (bundle/collect_fees_v2.ts:435 via fn_2258); writable found (bundle/collect_fees_v2.ts:529); raw found (bundle/collect_fees_v2.ts:538)
- token_vault_b: owner found (bundle/collect_fees_v2.ts:440 via fn_2258); discriminator found (bundle/collect_fees_v2.ts:440 via fn_2258); initialized found (bundle/collect_fees_v2.ts:440 via fn_2258); writable found (bundle/collect_fees_v2.ts:540); key found (bundle/collect_fees_v2.ts:544); address found (bundle/collect_fees_v2.ts:544)
- token_program_b: address found (bundle/collect_fees_v2.ts:450 via try_accounts_120); executable found (bundle/collect_fees_v2.ts:450 via try_accounts_120); key found (bundle/collect_fees_v2.ts:576)
- token_program_a: address found (bundle/collect_fees_v2.ts:445 via try_accounts_120); executable found (bundle/collect_fees_v2.ts:445 via try_accounts_120); key found (bundle/collect_fees_v2.ts:566)
- memo_program: address found (bundle/collect_fees_v2.ts:455 via fn_12758); executable found (bundle/collect_fees_v2.ts:455 via fn_12758)
- position_authority: signer found (bundle/collect_fees_v2.ts:359 via try_accounts_11718)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- bundle/collect_fees_v2.ts:3881 [conditional] program not decoded

## PDAs derived

- bundle/collect_fees_v2.ts:3122 find_program_address(["extra-account-metas", *g [ix data?]], program *d)
- bundle/collect_fees_v2.ts:4948 find_program_address(?, program ?)

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 38 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer position_authority; owner position; initialized position; discriminator position; owner position_token_account; …)
- bundle/collect_fees_v2.ts:3881 CPI: 37 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer position_authority; owner position; initialized position; discriminator position; owner position_token_account; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 39 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `ld8(sb0) == 0` · `cj != -1` · `cg != -1` · `cd != -1` · `cb != -1` · `u258 != -1` · `by != -1` · `u242 != -1` · `bu != -1` · `br > 0x300000007` · … 8 more
- bundle/collect_fees_v2.ts:3881 CPI: `p != -1` · `u47 != -1` · ✗ `(f & 1) == 0` · ✗ `ld8(sb0) != 0` · ✗ `j == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */` · ✗ `g != 2` · ✗ `g == 2` · ✗ `f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */`

## Relations (equalities the checks establish)

- token_program_a.key == (constant address) (address, found, bundle/collect_fees_v2.ts:445)
- token_program_b.key == (constant address) (address, found, bundle/collect_fees_v2.ts:450)
- memo_program.key == (constant address) (address, found, bundle/collect_fees_v2.ts:455)
- position.position_authority? == position_authority.key (has_one, found, bundle/collect_fees_v2.ts:470)
- token_mint_a.key == (constant address) (address, found, bundle/collect_fees_v2.ts:496)
- token_mint_b.key == (constant address) (address, found, bundle/collect_fees_v2.ts:500)
- token_vault_a.key == (constant address) (address, found, bundle/collect_fees_v2.ts:516)
- token_vault_b.key == (constant address) (address, found, bundle/collect_fees_v2.ts:544)
- token_program_a.key == (constant address) (address, found, bundle/collect_fees_v2.ts:566)
- token_program_b.key == (constant address) (address, found, bundle/collect_fees_v2.ts:576)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, token_owner_account_b.key, position_authority.key
- whirlpool.data: validated (owner found @accounts_collect_fees_v2:8, discriminator found @accounts_collect_fees_v2:8, initialized found @accounts_collect_fees_v2:8)
- position.key: validated (key found @accounts_collect_fees_v2:135, has_one found @accounts_collect_fees_v2:135)
- position.data: validated (owner found @accounts_collect_fees_v2:26, discriminator found @accounts_collect_fees_v2:26, initialized found @accounts_collect_fees_v2:26)
- position_token_account.key: validated (key found @accounts_collect_fees_v2:148)
- position_token_account.data: validated (owner found @accounts_collect_fees_v2:42, discriminator found @accounts_collect_fees_v2:42, initialized found @accounts_collect_fees_v2:42)
- token_mint_a.key: validated (address found @accounts_collect_fees_v2:161, key found @accounts_collect_fees_v2:161)
- token_mint_a.data: validated (owner found @accounts_collect_fees_v2:57, discriminator found @accounts_collect_fees_v2:57, initialized found @accounts_collect_fees_v2:57)
- token_mint_b.key: validated (address found @accounts_collect_fees_v2:165, key found @accounts_collect_fees_v2:165)
- token_mint_b.data: validated (owner found @accounts_collect_fees_v2:73, discriminator found @accounts_collect_fees_v2:73, initialized found @accounts_collect_fees_v2:73)
- token_owner_account_a.key: partially-validated (key partial @fn_d46d8:17)
- token_owner_account_a.data: validated (owner found @accounts_collect_fees_v2:90, discriminator found @accounts_collect_fees_v2:90, initialized found @accounts_collect_fees_v2:90)
- token_vault_a.key: validated (address found @accounts_collect_fees_v2:181, key found @accounts_collect_fees_v2:181)
- token_vault_a.data: validated (owner found @accounts_collect_fees_v2:95, discriminator found @accounts_collect_fees_v2:95, initialized found @accounts_collect_fees_v2:95)
- token_owner_account_b.data: validated (owner found @accounts_collect_fees_v2:100, discriminator found @accounts_collect_fees_v2:100, initialized found @accounts_collect_fees_v2:100)
- token_vault_b.key: validated (address found @accounts_collect_fees_v2:209, key found @accounts_collect_fees_v2:209)
- token_vault_b.data: validated (owner found @accounts_collect_fees_v2:105, discriminator found @accounts_collect_fees_v2:105, initialized found @accounts_collect_fees_v2:105)
- token_program_b.key: validated (address found @accounts_collect_fees_v2:115, key found @accounts_collect_fees_v2:241)
- token_program_a.key: validated (address found @accounts_collect_fees_v2:110, key found @accounts_collect_fees_v2:231)
- memo_program.key: validated (address found @accounts_collect_fees_v2:120)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/collect_fees_v2.ts:343 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 1 | bundle/collect_fees_v2.ts:359 | found | position_authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 2 | bundle/collect_fees_v2.ts:361 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 3 | bundle/collect_fees_v2.ts:377 | found | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `ld32(s230 + 0x50) == 2` | return |
| 4 | bundle/collect_fees_v2.ts:392 | found | token_mint_a | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `n == 2` | return |
| 5 | bundle/collect_fees_v2.ts:408 | found | token_mint_b | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `o == 2` | return |
| 6 | bundle/collect_fees_v2.ts:425 | found | token_owner_account_a | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `p != 2` | return |
| 7 | bundle/collect_fees_v2.ts:430 | found | token_vault_a | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `r != 2` | return |
| 8 | bundle/collect_fees_v2.ts:435 | found | token_owner_account_b | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `t != 2` | return |
| 9 | bundle/collect_fees_v2.ts:440 | found | token_vault_b | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `v != 2` | return |
| 10 | bundle/collect_fees_v2.ts:445 | found | token_program_a | address, executable (via try_accounts_120 (count, address, executable)) | `x != 2` | return |
| 11 | bundle/collect_fees_v2.ts:450 | found | token_program_b | address, executable (via try_accounts_120 (count, address, executable)) | `z != 2` | return |
| 12 | bundle/collect_fees_v2.ts:455 | found | memo_program | address, executable (via fn_12758 (count, address, executable)) | `ab != 2` | return |
| 13 | bundle/collect_fees_v2.ts:458 | found | position | writable | `ld8(ld64(ad) + 0x29) == 0` | anchor::ConstraintMut |
| 14 | bundle/collect_fees_v2.ts:470 | found | position | key, has_one | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 15 | bundle/collect_fees_v2.ts:483 | found | position_token_account | state, key, raw | `!((memcmp(position_token_account_box.mint, ad + 0x28, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 16 | bundle/collect_fees_v2.ts:484 | found | position_token_account | state, raw | `position_token_account_box.amount != 1` | anchor::ConstraintRaw |
| 17 | bundle/collect_fees_v2.ts:496 | found | token_mint_a | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 18 | bundle/collect_fees_v2.ts:500 | found | token_mint_b | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 19 | bundle/collect_fees_v2.ts:501 | found | token_owner_account_a | writable | `ld8(ld64(ld64(s738) + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 20 | bundle/collect_fees_v2.ts:510 | found | token_owner_account_a | raw | `!((memcmp(ld64(s738) + 0x28, g + 0x1a8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 21 | bundle/collect_fees_v2.ts:512 | found | token_vault_a | writable | `token_vault_a.is_writable == 0` | anchor::ConstraintMut |
| 22 | bundle/collect_fees_v2.ts:516 | found | token_vault_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 23 | bundle/collect_fees_v2.ts:529 | found | token_owner_account_b | writable | `ld8(ld64(ld64(s748) + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 24 | bundle/collect_fees_v2.ts:538 | found | token_owner_account_b | raw | `!((memcmp(ld64(s748) + 0x28, g + 0x1e8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 25 | bundle/collect_fees_v2.ts:540 | found | token_vault_b | writable | `token_vault_b.is_writable == 0` | anchor::ConstraintMut |
| 26 | bundle/collect_fees_v2.ts:544 | found | token_vault_b | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 27 | bundle/collect_fees_v2.ts:566 | found | token_program_a | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 28 | bundle/collect_fees_v2.ts:576 | found | token_program_b | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 29 | bundle/collect_fees_v2.ts:828 | PARTIAL | position |  | `f != 2` | return |
| 30 | bundle/collect_fees_v2.ts:837 | PARTIAL | token_owner_account_a | key | `(memcmp(g, c, 0x20) as u32) == 0` | return |
| 31 | bundle/collect_fees_v2.ts:930 | PARTIAL | token_vault_b |  | `ad != 0x800000000000001a /* Ok */` | return |
| 32 | bundle/collect_fees_v2.ts:936 | PARTIAL | token_vault_b |  | `aj != 2` | return |
| 33 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 34 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 35 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 36 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 37 | bundle/collect_fees_v2.ts:1078 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 38 | bundle/collect_fees_v2.ts:1083 | found |  | key, address | `(memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 39 | bundle/collect_fees_v2.ts:1093 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 40 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 41 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 42 | bundle/collect_fees_v2.ts:2870 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
