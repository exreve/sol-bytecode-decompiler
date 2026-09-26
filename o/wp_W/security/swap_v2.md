# swap_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_swap_v2 (anchor); 145 functions reachable: ix_swap_v2, fn_11150, accounts_swap_v2, memcpy, fn_3d688, fn_e42f8, fn_147e78, fn_11f980, fn_147990, fn_83078, fn_139720, fn_149678, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | token_program_a [str] | — | — | — | found | found |
| 1 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 2 | token_mint_a [str] | — | — | found (+discriminator found) | — | found |
| 3 | token_mint_b [str] | — | — | found (+discriminator found) | — | found |
| 4 | tick_array_0 [str] | — | found | — | — | — |
| 5 | tick_array_1 [str] | — | found | — | — | — |
| 6 | tick_array_2 [str] | — | found | — | — | — |
| 7 | oracle [str] | — | found | — | — | — |
| 8 | token_owner_account_a [str] | — | found | found (+discriminator found) | — | — |
| 9 | token_vault_a [str] | — | found | found (+discriminator found) | — | found |
| 10 | token_owner_account_b [str] | — | found | found (+discriminator found) | — | — |
| 11 | token_vault_b [str] | — | found | found (+discriminator found) | — | found |
| 12 | token_program_b [str] | — | — | — | found | found |
| 13 | token_authority [str] | found | — | — | — | — |
| 14 | memo_program [str] | — | — | — | found | found |
|  | authority [code] | PARTIAL | — | — | — | — |
|  | buffer [code] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |

## Constraints per account

- token_program_a: address found (bundle/swap_v2.ts:446 via try_accounts_120); executable found (bundle/swap_v2.ts:446 via try_accounts_120); key found (bundle/swap_v2.ts:625)
- whirlpool: owner found (bundle/swap_v2.ts:471 via try_accounts_11a48); initialized found (bundle/swap_v2.ts:471 via try_accounts_11a48); discriminator found (bundle/swap_v2.ts:471 via try_accounts_11a48); writable found (bundle/swap_v2.ts:638)
- token_mint_a: owner found (bundle/swap_v2.ts:487 via try_accounts_610); discriminator found (bundle/swap_v2.ts:487 via try_accounts_610); initialized found (bundle/swap_v2.ts:487 via try_accounts_610); key found (bundle/swap_v2.ts:651); address found (bundle/swap_v2.ts:651)
- token_mint_b: owner found (bundle/swap_v2.ts:503 via try_accounts_610); discriminator found (bundle/swap_v2.ts:503 via try_accounts_610); initialized found (bundle/swap_v2.ts:503 via try_accounts_610); key found (bundle/swap_v2.ts:668); address found (bundle/swap_v2.ts:668)
- tick_array_0: count found (bundle/swap_v2.ts:541); writable found (bundle/swap_v2.ts:727)
- tick_array_1: writable found (bundle/swap_v2.ts:736)
- tick_array_2: writable found (bundle/swap_v2.ts:737)
- oracle: key found (bundle/swap_v2.ts:747); pda found (bundle/swap_v2.ts:747); writable found (bundle/swap_v2.ts:761)
- token_owner_account_a: owner found (bundle/swap_v2.ts:520 via fn_2258); discriminator found (bundle/swap_v2.ts:520 via fn_2258); initialized found (bundle/swap_v2.ts:520 via fn_2258); writable found (bundle/swap_v2.ts:669); raw found (bundle/swap_v2.ts:678); key PARTIAL (bundle/swap_v2.ts:1520)
- token_vault_a: owner found (bundle/swap_v2.ts:525 via fn_2258); discriminator found (bundle/swap_v2.ts:525 via fn_2258); initialized found (bundle/swap_v2.ts:525 via fn_2258); writable found (bundle/swap_v2.ts:680); key found (bundle/swap_v2.ts:685); address found (bundle/swap_v2.ts:685)
- token_owner_account_b: owner found (bundle/swap_v2.ts:530 via fn_2258); discriminator found (bundle/swap_v2.ts:530 via fn_2258); initialized found (bundle/swap_v2.ts:530 via fn_2258); writable found (bundle/swap_v2.ts:698); raw found (bundle/swap_v2.ts:707)
- token_vault_b: owner found (bundle/swap_v2.ts:535 via fn_2258); discriminator found (bundle/swap_v2.ts:535 via fn_2258); initialized found (bundle/swap_v2.ts:535 via fn_2258); writable found (bundle/swap_v2.ts:709); key found (bundle/swap_v2.ts:714); address found (bundle/swap_v2.ts:714)
- token_program_b: address found (bundle/swap_v2.ts:458 via try_accounts_120); executable found (bundle/swap_v2.ts:458 via try_accounts_120); key found (bundle/swap_v2.ts:635)
- token_authority: signer found (bundle/swap_v2.ts:468 via try_accounts_11718)
- memo_program: address found (bundle/swap_v2.ts:463 via fn_12758); executable found (bundle/swap_v2.ts:463 via fn_12758)
- authority: signer PARTIAL (shared.ts:15130 via try_accounts_11718); raw PARTIAL (shared.ts:15181)
- buffer: zero PARTIAL (shared.ts:15152); discriminator PARTIAL (shared.ts:15152); owner PARTIAL (shared.ts:15155 via fn_3e60); initialized PARTIAL (shared.ts:15155 via fn_3e60); writable PARTIAL (shared.ts:15166); rent_exempt PARTIAL (shared.ts:15225)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/swap_v2.ts:741 find_program_address(["oracle", *by], program *(ld64(s7e0 + 0x48)))
- bundle/swap_v2.ts:3106 find_program_address(["tick_array", *s20, ?], program *s188)
- shared.ts:16048 find_program_address(["extra-account-metas", *g [ix data?]], program *d)
- shared.ts:15775 find_program_address(?, program ?)
- compared with provided accounts: oracle found

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 42 dominating checks (address token_program_a; executable token_program_a; address token_program_b; executable token_program_b; address memo_program; executable memo_program; signer token_authority; owner whirlpool; …)
- shared.ts:20063 CPI: 41 dominating checks (address token_program_a; executable token_program_a; address token_program_b; executable token_program_b; address memo_program; executable memo_program; signer token_authority; owner whirlpool; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 44 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `ld8(s1b8) == 0` · `bf != -1` · `bc != -1` · `ba != -1` · `ay != -1` · `u153 != -1` · `av != -1` · `u136 != -1` · `u132 != -1` · `an > 0x300000007` · … 30 more
  - not required on some path: #56 (signer authority)
- shared.ts:20063 CPI: `u != -1` · `o != -1` · ✗ `(f & 1) == 0` · ✗ `ld8(s1b8) != 0` · `ld64(s238) == 0` · `ld64(s238) == 0` · `bf == 2` · `bf == 2` · `ld8(s238) == 0` · `(az as u8) != 0` · … 22 more
  - not required on some path: #56 (signer authority)

## Relations (equalities the checks establish)

- token_program_a.key == (constant address) (address, found, bundle/swap_v2.ts:446)
- token_program_b.key == (constant address) (address, found, bundle/swap_v2.ts:458)
- memo_program.key == (constant address) (address, found, bundle/swap_v2.ts:463)
- token_program_a.key == (constant address) (address, found, bundle/swap_v2.ts:625)
- token_program_b.key == (constant address) (address, found, bundle/swap_v2.ts:635)
- token_mint_a.key == (constant address) (address, found, bundle/swap_v2.ts:651)
- token_mint_b.key == (constant address) (address, found, bundle/swap_v2.ts:668)
- token_vault_a.key == (constant address) (address, found, bundle/swap_v2.ts:685)
- token_vault_b.key == (constant address) (address, found, bundle/swap_v2.ts:714)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, tick_array_0.key, tick_array_1.key, tick_array_2.key, token_owner_account_b.key, token_authority.key, authority.key, buffer.key
- token_program_a.key: validated (address found @accounts_swap_v2:12, key found @accounts_swap_v2:191)
- whirlpool.data: validated (owner found @accounts_swap_v2:37, discriminator found @accounts_swap_v2:37, initialized found @accounts_swap_v2:37)
- token_mint_a.key: validated (address found @accounts_swap_v2:217, key found @accounts_swap_v2:217)
- token_mint_a.data: validated (owner found @accounts_swap_v2:53, discriminator found @accounts_swap_v2:53, initialized found @accounts_swap_v2:53)
- token_mint_b.key: validated (address found @accounts_swap_v2:234, key found @accounts_swap_v2:234)
- token_mint_b.data: validated (owner found @accounts_swap_v2:69, discriminator found @accounts_swap_v2:69, initialized found @accounts_swap_v2:69)
- oracle.key: validated (pda found @accounts_swap_v2:313, key found @accounts_swap_v2:313)
- token_owner_account_a.key: partially-validated (key partial @fn_e42f8:16)
- token_owner_account_a.data: validated (owner found @accounts_swap_v2:86, discriminator found @accounts_swap_v2:86, initialized found @accounts_swap_v2:86)
- token_vault_a.key: validated (address found @accounts_swap_v2:251, key found @accounts_swap_v2:251)
- token_vault_a.data: validated (owner found @accounts_swap_v2:91, discriminator found @accounts_swap_v2:91, initialized found @accounts_swap_v2:91)
- token_owner_account_b.data: validated (owner found @accounts_swap_v2:96, discriminator found @accounts_swap_v2:96, initialized found @accounts_swap_v2:96)
- token_vault_b.key: validated (address found @accounts_swap_v2:280, key found @accounts_swap_v2:280)
- token_vault_b.data: validated (owner found @accounts_swap_v2:101, discriminator found @accounts_swap_v2:101, initialized found @accounts_swap_v2:101)
- token_program_b.key: validated (address found @accounts_swap_v2:24, key found @accounts_swap_v2:201)
- memo_program.key: validated (address found @accounts_swap_v2:29)
- buffer.data: partially-validated (owner partial @fn_11c9a8:39, discriminator partial @fn_11c9a8:36, initialized partial @fn_11c9a8:39)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/swap_v2.ts:446 | found | token_program_a | address, executable (via try_accounts_120 (count, address, executable)) | `f != 2` | return |
| 1 | bundle/swap_v2.ts:458 | found | token_program_b | address, executable (via try_accounts_120 (count, address, executable)) | `g != 2` | return |
| 2 | bundle/swap_v2.ts:463 | found | memo_program | address, executable (via fn_12758 (count, address, executable)) | `i != 2` | return |
| 3 | bundle/swap_v2.ts:468 | found | token_authority | signer (via try_accounts_11718 (count, signer)) | `k != 2` | return |
| 4 | bundle/swap_v2.ts:471 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 5 | bundle/swap_v2.ts:487 | found | token_mint_a | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `p == 2` | return |
| 6 | bundle/swap_v2.ts:503 | found | token_mint_b | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `q == 2` | return |
| 7 | bundle/swap_v2.ts:520 | found | token_owner_account_a | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `r != 2` | return |
| 8 | bundle/swap_v2.ts:525 | found | token_vault_a | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `t != 2` | return |
| 9 | bundle/swap_v2.ts:530 | found | token_owner_account_b | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `v != 2` | return |
| 10 | bundle/swap_v2.ts:535 | found | token_vault_b | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `x != 2` | return |
| 11 | bundle/swap_v2.ts:541 | found | tick_array_0 | count | `z == 0` | anchor::AccountNotEnoughKeys |
| 12 | bundle/swap_v2.ts:625 | found | token_program_a | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 13 | bundle/swap_v2.ts:635 | found | token_program_b | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 14 | bundle/swap_v2.ts:638 | found | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/swap_v2.ts:651 | found | token_mint_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 16 | bundle/swap_v2.ts:668 | found | token_mint_b | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 17 | bundle/swap_v2.ts:669 | found | token_owner_account_a | writable | `ld8(ld64(ld64(s810) + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 18 | bundle/swap_v2.ts:678 | found | token_owner_account_a | raw | `!((memcmp(ld64(s810) + 0x28, ld64(s7e0 + 0x28) + 0x1a8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 19 | bundle/swap_v2.ts:680 | found | token_vault_a | writable | `token_vault_a.is_writable == 0` | anchor::ConstraintMut |
| 20 | bundle/swap_v2.ts:685 | found | token_vault_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 21 | bundle/swap_v2.ts:698 | found | token_owner_account_b | writable | `ld8(ld64(ld64(s820) + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 22 | bundle/swap_v2.ts:707 | found | token_owner_account_b | raw | `!((memcmp(ld64(s820) + 0x28, ld64(s7e0 + 0x28) + 0x1e8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 23 | bundle/swap_v2.ts:709 | found | token_vault_b | writable | `token_vault_b.is_writable == 0` | anchor::ConstraintMut |
| 24 | bundle/swap_v2.ts:714 | found | token_vault_b | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 25 | bundle/swap_v2.ts:727 | found | tick_array_0 | writable | `ld8(ld64(s830) + 0x29) == 0` | anchor::ConstraintMut |
| 26 | bundle/swap_v2.ts:736 | found | tick_array_1 | writable | `!(ld8(ld64(s838) + 0x29) != 0)` | anchor::ConstraintMut |
| 27 | bundle/swap_v2.ts:737 | found | tick_array_2 | writable | `!(ld8(ld64(s840) + 0x29) != 0)` | anchor::ConstraintMut |
| 28 | bundle/swap_v2.ts:747 | found | oracle | key, pda | `(memcmp(s290, s2f0, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 29 | bundle/swap_v2.ts:761 | found | oracle | writable | `oracle.is_writable == 0` | anchor::ConstraintMut |
| 30 | bundle/swap_v2.ts:1511 | PARTIAL | whirlpool |  | `f != 2` | return |
| 31 | bundle/swap_v2.ts:1520 | PARTIAL | token_owner_account_a | key | `(memcmp(g, c, 0x20) as u32) == 0` | return |
| 32 | bundle/swap_v2.ts:1613 | PARTIAL | token_vault_b |  | `ad != 0x800000000000001a /* Ok */` | return |
| 33 | bundle/swap_v2.ts:1619 | PARTIAL | token_vault_b |  | `aj != 2` | return |
| 34 | bundle/swap_v2.ts:1687 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 35 | bundle/swap_v2.ts:1692 | found |  | key, address | `(memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 36 | bundle/swap_v2.ts:1702 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 37 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 38 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 39 | bundle/swap_v2.ts:3310 | found |  | key | `(memcmp(g, 0x100152180, 0x20) as u32) == 0 && fn_143248(c) != 0` | return |
| 40 | bundle/swap_v2.ts:3316 | found |  | owner | `(h as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 41 | bundle/swap_v2.ts:3342 | PARTIAL |  | key | `(memcmp(x + 8, s60, 0x20) as u32) != 0` | abort |
| 42 | bundle/swap_v2.ts:3659 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 43 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 44 | bundle/swap_v2.ts:4067 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 45 | bundle/swap_v2.ts:4069 | found |  | owner | `!((f as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 46 | bundle/swap_v2.ts:4082 | found |  | discriminator | `p != 0x38dac7e18ef6d811 /* account:DynamicTickArray */` | anchor::AccountDiscriminatorMismatch |
| 47 | bundle/swap_v2.ts:4088 | PARTIAL |  | discriminator | `p == 0xbb42076ebebd6145 /* account:TickArray */` | anchor::AccountDiscriminatorMismatch |
| 48 | shared.ts:4047 | found |  | key | `(memcmp(sa0, s20, 0x20) as u32) == 0` | return |
| 49 | shared.ts:18860 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 50 | shared.ts:14572 | PARTIAL | idl |  | `ap == 2` | return |
| 51 | shared.ts:14825 | PARTIAL | idl |  | `bh != 2` | return |
| 52 | shared.ts:14897 | PARTIAL | buffer |  | `bo != 2` | return |
| 53 | entrypoint.ts:497 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 54 | entrypoint.ts:506 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 55 | shared.ts:15123 | PARTIAL |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 56 | shared.ts:15130 | PARTIAL | authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 57 | shared.ts:15152 | PARTIAL | buffer | zero, discriminator | `!(ld8(t) == 0 && (ld8(t + 1) == 0 && (ld8(t + 2) == 0 && (ld8(t + 3) == 0 && (ld8(t + 4) == 0 && (ld` | anchor::ConstraintZero |
| 58 | shared.ts:15155 | PARTIAL | buffer | owner, initialized (via fn_3e60 (owner, initialized)) | `buffer == 0` | return |
| 59 | shared.ts:15166 | PARTIAL | buffer | writable | `buffer.is_writable == 0` | anchor::ConstraintMut |
| 60 | shared.ts:15181 | PARTIAL | authority | raw | `w == 0x800000000000001a /* Ok */` | anchor::ConstraintRaw |
| 61 | shared.ts:15225 | PARTIAL | buffer | rent_exempt | `ah > an` | anchor::ConstraintRentExempt |
| 62 | shared.ts:15235 | PARTIAL | authority | raw | `n == 0` | anchor::ConstraintRaw |
| 63 | entrypoint.ts:13631 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 64 | shared.ts:311 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 65 | shared.ts:320 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
