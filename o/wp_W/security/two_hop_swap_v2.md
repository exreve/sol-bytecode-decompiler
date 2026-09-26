# two_hop_swap_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_two_hop_swap_v2 (anchor); 145 functions reachable: ix_two_hop_swap_v2, fn_11150, accounts_two_hop_swap_v2, memcpy, fn_40458, fn_e8e38, fn_147e78, fn_11f980, fn_147990, fn_83078, fn_139720, fn_149678, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool_one [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 1 | whirlpool_two [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 2 | token_mint_input [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | — |
| 3 | token_mint_intermediate [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 4 | token_mint_output [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 5 | tick_array_one_0 [str] | — | PARTIAL | — | — | — |
| 6 | tick_array_one_1 [str] | — | PARTIAL | — | — | — |
| 7 | tick_array_one_2 [str] | — | PARTIAL | — | — | — |
| 8 | tick_array_two_0 [str] | — | PARTIAL | — | — | — |
| 9 | tick_array_two_1 [str] | — | PARTIAL | — | — | — |
| 10 | tick_array_two_2 [str] | — | PARTIAL | — | — | — |
| 11 | oracle_one [str] | — | PARTIAL | — | — | — |
| 12 | oracle_two [str] | — | PARTIAL | — | — | — |
| 13 | token_owner_account_input [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 14 | token_vault_one_input [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 15 | token_vault_two_intermediate [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 16 | token_owner_account_output [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 17 | token_vault_two_output [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 18 | token_vault_one_intermediate [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 19 | token_program_output [str] | — | — | — | PARTIAL | PARTIAL |
| 20 | token_program_intermediate [str] | — | — | — | PARTIAL | PARTIAL |
| 21 | token_program_input [str] | — | — | — | PARTIAL | PARTIAL |
| 22 | memo_program [str] | — | — | — | PARTIAL | PARTIAL |
| 23 | token_authority [str] | PARTIAL | — | — | — | — |
|  | authority [code] | PARTIAL | — | — | — | — |
|  | buffer [code] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |

## Constraints per account

- whirlpool_one: owner PARTIAL (bundle/two_hop_swap_v2.ts:479 via try_accounts_11a48); initialized PARTIAL (bundle/two_hop_swap_v2.ts:479 via try_accounts_11a48); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:479 via try_accounts_11a48); writable PARTIAL (bundle/two_hop_swap_v2.ts:753)
- whirlpool_two: owner PARTIAL (bundle/two_hop_swap_v2.ts:494 via try_accounts_11a48); initialized PARTIAL (bundle/two_hop_swap_v2.ts:494 via try_accounts_11a48); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:494 via try_accounts_11a48); writable PARTIAL (bundle/two_hop_swap_v2.ts:762)
- token_mint_input: owner PARTIAL (bundle/two_hop_swap_v2.ts:510 via try_accounts_610); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:510 via try_accounts_610); initialized PARTIAL (bundle/two_hop_swap_v2.ts:510 via try_accounts_610)
- token_mint_intermediate: owner PARTIAL (bundle/two_hop_swap_v2.ts:526 via try_accounts_610); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:526 via try_accounts_610); initialized PARTIAL (bundle/two_hop_swap_v2.ts:526 via try_accounts_610); key PARTIAL (bundle/two_hop_swap_v2.ts:801); address PARTIAL (bundle/two_hop_swap_v2.ts:801)
- token_mint_output: owner PARTIAL (bundle/two_hop_swap_v2.ts:542 via try_accounts_610); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:542 via try_accounts_610); initialized PARTIAL (bundle/two_hop_swap_v2.ts:542 via try_accounts_610); key PARTIAL (bundle/two_hop_swap_v2.ts:809); address PARTIAL (bundle/two_hop_swap_v2.ts:809)
- tick_array_one_0: count PARTIAL (bundle/two_hop_swap_v2.ts:605); writable PARTIAL (bundle/two_hop_swap_v2.ts:971)
- tick_array_one_1: writable PARTIAL (bundle/two_hop_swap_v2.ts:972)
- tick_array_one_2: writable PARTIAL (bundle/two_hop_swap_v2.ts:973)
- tick_array_two_0: writable PARTIAL (bundle/two_hop_swap_v2.ts:974)
- tick_array_two_1: writable PARTIAL (bundle/two_hop_swap_v2.ts:975)
- tick_array_two_2: writable PARTIAL (bundle/two_hop_swap_v2.ts:976)
- oracle_one: key PARTIAL (bundle/two_hop_swap_v2.ts:989); pda PARTIAL (bundle/two_hop_swap_v2.ts:989); writable PARTIAL (bundle/two_hop_swap_v2.ts:1003)
- oracle_two: key PARTIAL (bundle/two_hop_swap_v2.ts:1024); pda PARTIAL (bundle/two_hop_swap_v2.ts:1024); writable PARTIAL (bundle/two_hop_swap_v2.ts:1025)
- token_owner_account_input: owner PARTIAL (bundle/two_hop_swap_v2.ts:572 via fn_2258); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:572 via fn_2258); initialized PARTIAL (bundle/two_hop_swap_v2.ts:572 via fn_2258); writable PARTIAL (bundle/two_hop_swap_v2.ts:840); raw PARTIAL (bundle/two_hop_swap_v2.ts:850)
- token_vault_one_input: owner PARTIAL (bundle/two_hop_swap_v2.ts:576 via fn_2258); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:576 via fn_2258); initialized PARTIAL (bundle/two_hop_swap_v2.ts:576 via fn_2258); writable PARTIAL (bundle/two_hop_swap_v2.ts:852)
- token_vault_two_intermediate: owner PARTIAL (bundle/two_hop_swap_v2.ts:584 via fn_2258); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:584 via fn_2258); initialized PARTIAL (bundle/two_hop_swap_v2.ts:584 via fn_2258); writable PARTIAL (bundle/two_hop_swap_v2.ts:902)
- token_owner_account_output: owner PARTIAL (bundle/two_hop_swap_v2.ts:592 via fn_2258); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:592 via fn_2258); initialized PARTIAL (bundle/two_hop_swap_v2.ts:592 via fn_2258); writable PARTIAL (bundle/two_hop_swap_v2.ts:959); raw PARTIAL (bundle/two_hop_swap_v2.ts:970)
- token_vault_two_output: owner PARTIAL (bundle/two_hop_swap_v2.ts:588 via fn_2258); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:588 via fn_2258); initialized PARTIAL (bundle/two_hop_swap_v2.ts:588 via fn_2258); key PARTIAL (bundle/two_hop_swap_v2.ts:958); address PARTIAL (bundle/two_hop_swap_v2.ts:958)
- token_vault_one_intermediate: owner PARTIAL (bundle/two_hop_swap_v2.ts:580 via fn_2258); discriminator PARTIAL (bundle/two_hop_swap_v2.ts:580 via fn_2258); initialized PARTIAL (bundle/two_hop_swap_v2.ts:580 via fn_2258); key PARTIAL (bundle/two_hop_swap_v2.ts:900); address PARTIAL (bundle/two_hop_swap_v2.ts:900)
- token_program_output: address PARTIAL (bundle/two_hop_swap_v2.ts:568 via try_accounts_120); executable PARTIAL (bundle/two_hop_swap_v2.ts:568 via try_accounts_120); key PARTIAL (bundle/two_hop_swap_v2.ts:839)
- token_program_intermediate: address PARTIAL (bundle/two_hop_swap_v2.ts:564 via try_accounts_120); executable PARTIAL (bundle/two_hop_swap_v2.ts:564 via try_accounts_120); key PARTIAL (bundle/two_hop_swap_v2.ts:829)
- token_program_input: address PARTIAL (bundle/two_hop_swap_v2.ts:559 via try_accounts_120); executable PARTIAL (bundle/two_hop_swap_v2.ts:559 via try_accounts_120); key PARTIAL (bundle/two_hop_swap_v2.ts:819)
- memo_program: address PARTIAL (bundle/two_hop_swap_v2.ts:752 via fn_12758); executable PARTIAL (bundle/two_hop_swap_v2.ts:752 via fn_12758)
- token_authority: signer PARTIAL (bundle/two_hop_swap_v2.ts:596 via try_accounts_11718)
- authority: signer PARTIAL (shared.ts:15130 via try_accounts_11718); raw PARTIAL (shared.ts:15181)
- buffer: zero PARTIAL (shared.ts:15152); discriminator PARTIAL (shared.ts:15152); owner PARTIAL (shared.ts:15155 via fn_3e60); initialized PARTIAL (shared.ts:15155 via fn_3e60); writable PARTIAL (shared.ts:15166); rent_exempt PARTIAL (shared.ts:15225)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/two_hop_swap_v2.ts:983 find_program_address(["oracle", *s2b0], program *(ld64(sad0)))
- bundle/two_hop_swap_v2.ts:1018 find_program_address(["oracle", *s2b0], program *(ld64(sad0)))
- bundle/two_hop_swap_v2.ts:3915 find_program_address(["tick_array", *s20, ?], program *s188)
- shared.ts:16048 find_program_address(["extra-account-metas", *g [ix data?]], program *d)
- shared.ts:15775 find_program_address(?, program ?)
- compared with provided accounts: oracle_one PARTIAL, oracle_two PARTIAL

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 14 dominating checks (key; initialized; owner; address; executable g?; writable; discriminator)
- shared.ts:20063 CPI: 13 dominating checks (key; initialized; owner; address; executable g?; writable; discriminator)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 15 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `ld8(s1b8) == 0` · `bf != -1` · `bc != -1` · `ba != -1` · `ay != -1` · `u153 != -1` · `av != -1` · `u136 != -1` · `u132 != -1` · `an > 0x300000007` · … 30 more (budget reached)
  - not required on some path: #14 (signer token_authority); #77 (signer authority)
- shared.ts:20063 CPI: `u != -1` · `o != -1` · ✗ `(f & 1) == 0` · ✗ `ld8(s1b8) != 0` · `ld64(s2f0) == 0` · `ld64(s2f0) == 0` · `ld64(s2f0) == 0` · `ld64(s2f0) == 0` · `eh == 2` · `eg == 2` · … 30 more (budget reached)
  - not required on some path: #14 (signer token_authority); #77 (signer authority)

## Relations (equalities the checks establish)

- token_program_input.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:559)
- token_program_intermediate.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:564)
- token_program_output.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:568)
- memo_program.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:752)
- token_mint_intermediate.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:801)
- token_mint_output.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:809)
- token_program_input.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:819)
- token_program_intermediate.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:829)
- token_program_output.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:839)
- token_vault_one_intermediate.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:900)
- token_vault_two_output.key == (constant address) (address, PARTIAL, bundle/two_hop_swap_v2.ts:958)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool_one.key, whirlpool_two.key, token_mint_input.key, tick_array_one_0.key, tick_array_one_1.key, tick_array_one_2.key, tick_array_two_0.key, tick_array_two_1.key, tick_array_two_2.key, token_owner_account_input.key, token_vault_one_input.key, token_vault_two_intermediate.key, token_owner_account_output.key, token_authority.key, authority.key, buffer.key
- whirlpool_one.data: partially-validated (owner partial @accounts_two_hop_swap_v2:30, discriminator partial @accounts_two_hop_swap_v2:30, initialized partial @accounts_two_hop_swap_v2:30)
- whirlpool_two.data: partially-validated (owner partial @accounts_two_hop_swap_v2:45, discriminator partial @accounts_two_hop_swap_v2:45, initialized partial @accounts_two_hop_swap_v2:45)
- token_mint_input.data: partially-validated (owner partial @accounts_two_hop_swap_v2:61, discriminator partial @accounts_two_hop_swap_v2:61, initialized partial @accounts_two_hop_swap_v2:61)
- token_mint_intermediate.key: partially-validated (address partial @accounts_two_hop_swap_v2:352, key partial @accounts_two_hop_swap_v2:352)
- token_mint_intermediate.data: partially-validated (owner partial @accounts_two_hop_swap_v2:77, discriminator partial @accounts_two_hop_swap_v2:77, initialized partial @accounts_two_hop_swap_v2:77)
- token_mint_output.key: partially-validated (address partial @accounts_two_hop_swap_v2:360, key partial @accounts_two_hop_swap_v2:360)
- token_mint_output.data: partially-validated (owner partial @accounts_two_hop_swap_v2:93, discriminator partial @accounts_two_hop_swap_v2:93, initialized partial @accounts_two_hop_swap_v2:93)
- oracle_one.key: partially-validated (pda partial @accounts_two_hop_swap_v2:540, key partial @accounts_two_hop_swap_v2:540)
- oracle_two.key: partially-validated (pda partial @accounts_two_hop_swap_v2:575, key partial @accounts_two_hop_swap_v2:575)
- token_owner_account_input.data: partially-validated (owner partial @accounts_two_hop_swap_v2:123, discriminator partial @accounts_two_hop_swap_v2:123, initialized partial @accounts_two_hop_swap_v2:123)
- token_vault_one_input.data: partially-validated (owner partial @accounts_two_hop_swap_v2:127, discriminator partial @accounts_two_hop_swap_v2:127, initialized partial @accounts_two_hop_swap_v2:127)
- token_vault_two_intermediate.data: partially-validated (owner partial @accounts_two_hop_swap_v2:135, discriminator partial @accounts_two_hop_swap_v2:135, initialized partial @accounts_two_hop_swap_v2:135)
- token_owner_account_output.data: partially-validated (owner partial @accounts_two_hop_swap_v2:143, discriminator partial @accounts_two_hop_swap_v2:143, initialized partial @accounts_two_hop_swap_v2:143)
- token_vault_two_output.key: partially-validated (address partial @accounts_two_hop_swap_v2:509, key partial @accounts_two_hop_swap_v2:509)
- token_vault_two_output.data: partially-validated (owner partial @accounts_two_hop_swap_v2:139, discriminator partial @accounts_two_hop_swap_v2:139, initialized partial @accounts_two_hop_swap_v2:139)
- token_vault_one_intermediate.key: partially-validated (address partial @accounts_two_hop_swap_v2:451, key partial @accounts_two_hop_swap_v2:451)
- token_vault_one_intermediate.data: partially-validated (owner partial @accounts_two_hop_swap_v2:131, discriminator partial @accounts_two_hop_swap_v2:131, initialized partial @accounts_two_hop_swap_v2:131)
- token_program_output.key: partially-validated (address partial @accounts_two_hop_swap_v2:119, key partial @accounts_two_hop_swap_v2:390)
- token_program_intermediate.key: partially-validated (address partial @accounts_two_hop_swap_v2:115, key partial @accounts_two_hop_swap_v2:380)
- token_program_input.key: partially-validated (address partial @accounts_two_hop_swap_v2:110, key partial @accounts_two_hop_swap_v2:370)
- memo_program.key: partially-validated (address partial @accounts_two_hop_swap_v2:303)
- buffer.data: partially-validated (owner partial @fn_11c9a8:39, discriminator partial @fn_11c9a8:36, initialized partial @fn_11c9a8:39)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/two_hop_swap_v2.ts:479 | PARTIAL | whirlpool_one | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 1 | bundle/two_hop_swap_v2.ts:494 | PARTIAL | whirlpool_two | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 2 | bundle/two_hop_swap_v2.ts:510 | PARTIAL | token_mint_input | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `v == 2` | return |
| 3 | bundle/two_hop_swap_v2.ts:526 | PARTIAL | token_mint_intermediate | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `w == 2` | return |
| 4 | bundle/two_hop_swap_v2.ts:542 | PARTIAL | token_mint_output | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `x == 2` | return |
| 5 | bundle/two_hop_swap_v2.ts:559 | PARTIAL | token_program_input | address, executable (via try_accounts_120 (count, address, executable)) | `y != 2` | return |
| 6 | bundle/two_hop_swap_v2.ts:564 | PARTIAL | token_program_intermediate | address, executable (via try_accounts_120 (count, address, executable)) | `aa != 2` | return |
| 7 | bundle/two_hop_swap_v2.ts:568 | PARTIAL | token_program_output | address, executable (via try_accounts_120 (count, address, executable)) | `ab != 2` | return |
| 8 | bundle/two_hop_swap_v2.ts:572 | PARTIAL | token_owner_account_input | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ac != 2` | return |
| 9 | bundle/two_hop_swap_v2.ts:576 | PARTIAL | token_vault_one_input | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ad != 2` | return |
| 10 | bundle/two_hop_swap_v2.ts:580 | PARTIAL | token_vault_one_intermediate | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ae != 2` | return |
| 11 | bundle/two_hop_swap_v2.ts:584 | PARTIAL | token_vault_two_intermediate | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `af != 2` | return |
| 12 | bundle/two_hop_swap_v2.ts:588 | PARTIAL | token_vault_two_output | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ag != 2` | return |
| 13 | bundle/two_hop_swap_v2.ts:592 | PARTIAL | token_owner_account_output | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ah != 2` | return |
| 14 | bundle/two_hop_swap_v2.ts:596 | PARTIAL | token_authority | signer (via try_accounts_11718 (count, signer)) | `ai != 2` | return |
| 15 | bundle/two_hop_swap_v2.ts:605 | PARTIAL | tick_array_one_0 | count | `aj == 0` | anchor::AccountNotEnoughKeys |
| 16 | bundle/two_hop_swap_v2.ts:752 | PARTIAL | memo_program | address, executable (via fn_12758 (count, address, executable)) | `be != 2` | return |
| 17 | bundle/two_hop_swap_v2.ts:753 | PARTIAL | whirlpool_one | writable | `ld8(ld64(ld64(sb08 + 0x30)) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 18 | bundle/two_hop_swap_v2.ts:762 | PARTIAL | whirlpool_two | writable | `!(ld8(ld64(ld64(sb08 + 0x28)) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 19 | bundle/two_hop_swap_v2.ts:801 | PARTIAL | token_mint_intermediate | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 20 | bundle/two_hop_swap_v2.ts:809 | PARTIAL | token_mint_output | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 21 | bundle/two_hop_swap_v2.ts:819 | PARTIAL | token_program_input | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 22 | bundle/two_hop_swap_v2.ts:829 | PARTIAL | token_program_intermediate | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 23 | bundle/two_hop_swap_v2.ts:839 | PARTIAL | token_program_output | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 24 | bundle/two_hop_swap_v2.ts:840 | PARTIAL | token_owner_account_input | writable | `ld8(ld64(ld64(sb78) + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 25 | bundle/two_hop_swap_v2.ts:850 | PARTIAL | token_owner_account_input | raw | `!((memcmp(ld64(sb78) + 0x28, s290, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 26 | bundle/two_hop_swap_v2.ts:852 | PARTIAL | token_vault_one_input | writable | `token_vault_one_input.is_writable == 0` | anchor::ConstraintMut |
| 27 | bundle/two_hop_swap_v2.ts:863 | PARTIAL | dm? | writable | `dm.is_writable == 0` | return |
| 28 | bundle/two_hop_swap_v2.ts:877 | PARTIAL | dc? | writable | `dc.is_writable == 0` | return |
| 29 | bundle/two_hop_swap_v2.ts:900 | PARTIAL | token_vault_one_intermediate | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 30 | bundle/two_hop_swap_v2.ts:902 | PARTIAL | token_vault_two_intermediate | writable | `token_vault_two_intermediate.is_writable == 0` | anchor::ConstraintMut |
| 31 | bundle/two_hop_swap_v2.ts:921 | PARTIAL | ei? | writable | `ei.is_writable == 0` | return |
| 32 | bundle/two_hop_swap_v2.ts:935 | PARTIAL | dy? | writable | `dy.is_writable == 0` | return |
| 33 | bundle/two_hop_swap_v2.ts:958 | PARTIAL | token_vault_two_output | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 34 | bundle/two_hop_swap_v2.ts:959 | PARTIAL | token_owner_account_output | writable | `ld8(ld64(ld64(sba0) + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 35 | bundle/two_hop_swap_v2.ts:970 | PARTIAL | token_owner_account_output | raw | `!((memcmp(ld64(sba0) + 0x28, s290, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 36 | bundle/two_hop_swap_v2.ts:971 | PARTIAL | tick_array_one_0 | writable | `!(ld8(ld64(sbb0) + 0x29) != 0)` | anchor::ConstraintMut |
| 37 | bundle/two_hop_swap_v2.ts:972 | PARTIAL | tick_array_one_1 | writable | `!(ld8(ld64(sbb8) + 0x29) != 0)` | anchor::ConstraintMut |
| 38 | bundle/two_hop_swap_v2.ts:973 | PARTIAL | tick_array_one_2 | writable | `!(ld8(ld64(sbc0) + 0x29) != 0)` | anchor::ConstraintMut |
| 39 | bundle/two_hop_swap_v2.ts:974 | PARTIAL | tick_array_two_0 | writable | `!(ld8(ld64(sbc8) + 0x29) != 0)` | anchor::ConstraintMut |
| 40 | bundle/two_hop_swap_v2.ts:975 | PARTIAL | tick_array_two_1 | writable | `!(ld8(ld64(sbd0) + 0x29) != 0)` | anchor::ConstraintMut |
| 41 | bundle/two_hop_swap_v2.ts:976 | PARTIAL | tick_array_two_2 | writable | `!(ld8(ld64(sbd8) + 0x29) != 0)` | anchor::ConstraintMut |
| 42 | bundle/two_hop_swap_v2.ts:989 | PARTIAL | oracle_one | key, pda | `(memcmp(s290, s310, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 43 | bundle/two_hop_swap_v2.ts:1003 | PARTIAL | oracle_one | writable | `ld8(ld64(sbe0) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 44 | bundle/two_hop_swap_v2.ts:1024 | PARTIAL | oracle_two | key, pda | `!((memcmp(s290, s2f0, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 45 | bundle/two_hop_swap_v2.ts:1025 | PARTIAL | oracle_two | writable | `ld8(ld64(sbe8) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 46 | bundle/two_hop_swap_v2.ts:1445 | found |  | key | `(memcmp(s428, s2f0, 0x20) as u32) == 0` | return |
| 47 | bundle/two_hop_swap_v2.ts:1457 | found |  | key | `!((memcmp(s468, s448, 0x20) as u32) == 0)` | return |
| 48 | bundle/two_hop_swap_v2.ts:2304 | PARTIAL | whirlpool_one |  | `f != 2` | return |
| 49 | bundle/two_hop_swap_v2.ts:2313 | PARTIAL | whirlpool_two |  | `g != 2` | return |
| 50 | bundle/two_hop_swap_v2.ts:2316 | PARTIAL | token_vault_two_output | key | `!((memcmp(h, c, 0x20) as u32) == 0)` | return |
| 51 | bundle/two_hop_swap_v2.ts:2341 | PARTIAL | token_vault_two_output | key | `!((memcmp(o, c, 0x20) as u32) == 0)` | return |
| 52 | bundle/two_hop_swap_v2.ts:2366 | PARTIAL | token_vault_two_output | key | `!((memcmp(p, c, 0x20) as u32) == 0)` | return |
| 53 | bundle/two_hop_swap_v2.ts:2391 | PARTIAL | token_vault_two_output | key | `!((memcmp(q, c, 0x20) as u32) == 0)` | return |
| 54 | bundle/two_hop_swap_v2.ts:2421 | PARTIAL | token_owner_account_output |  | `u != 2` | return |
| 55 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 56 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 57 | bundle/two_hop_swap_v2.ts:2517 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 58 | bundle/two_hop_swap_v2.ts:2522 | found |  | key, address | `(memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 59 | bundle/two_hop_swap_v2.ts:2532 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 60 | bundle/two_hop_swap_v2.ts:4119 | found |  | key | `(memcmp(g, 0x100152180, 0x20) as u32) == 0 && fn_143248(c) != 0` | return |
| 61 | bundle/two_hop_swap_v2.ts:4125 | found |  | owner | `(h as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 62 | bundle/two_hop_swap_v2.ts:4151 | PARTIAL |  | key | `(memcmp(x + 8, s60, 0x20) as u32) != 0` | abort |
| 63 | bundle/two_hop_swap_v2.ts:4301 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 64 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 65 | shared.ts:6164 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 66 | shared.ts:6166 | found |  | owner | `!((f as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 67 | shared.ts:6179 | found |  | discriminator | `p != 0x38dac7e18ef6d811 /* account:DynamicTickArray */` | anchor::AccountDiscriminatorMismatch |
| 68 | shared.ts:6185 | PARTIAL |  | discriminator | `p == 0xbb42076ebebd6145 /* account:TickArray */` | anchor::AccountDiscriminatorMismatch |
| 69 | shared.ts:4047 | PARTIAL |  | key | `(memcmp(sa0, s20, 0x20) as u32) == 0` | return |
| 70 | shared.ts:18860 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 71 | shared.ts:14572 | PARTIAL | idl |  | `ap == 2` | return |
| 72 | shared.ts:14825 | PARTIAL | idl |  | `bh != 2` | return |
| 73 | shared.ts:14897 | PARTIAL | buffer |  | `bo != 2` | return |
| 74 | entrypoint.ts:497 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 75 | entrypoint.ts:506 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 76 | shared.ts:15123 | PARTIAL |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 77 | shared.ts:15130 | PARTIAL | authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 78 | shared.ts:15152 | PARTIAL | buffer | zero, discriminator | `!(ld8(t) == 0 && (ld8(t + 1) == 0 && (ld8(t + 2) == 0 && (ld8(t + 3) == 0 && (ld8(t + 4) == 0 && (ld` | anchor::ConstraintZero |
| 79 | shared.ts:15155 | PARTIAL | buffer | owner, initialized (via fn_3e60 (owner, initialized)) | `buffer == 0` | return |
| 80 | shared.ts:15166 | PARTIAL | buffer | writable | `buffer.is_writable == 0` | anchor::ConstraintMut |
| 81 | shared.ts:15181 | PARTIAL | authority | raw | `w == 0x800000000000001a /* Ok */` | anchor::ConstraintRaw |
| 82 | shared.ts:15225 | PARTIAL | buffer | rent_exempt | `ah > an` | anchor::ConstraintRentExempt |
| 83 | shared.ts:15235 | PARTIAL | authority | raw | `n == 0` | anchor::ConstraintRaw |
| 84 | entrypoint.ts:13631 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 85 | shared.ts:311 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 86 | shared.ts:320 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
