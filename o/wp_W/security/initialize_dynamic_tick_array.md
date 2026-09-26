# initialize_dynamic_tick_array

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_dynamic_tick_array (anchor); 32 functions reachable: ix_initialize_dynamic_tick_array, accounts_initialize_dynamic_tick_array, memcpy, fn_313b8, fn_147e78, fn_11f980, fn_147990, fn_139720, fn_149678, fn_14ef78, fn_89e0, fn_83078, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 1 | tick_array [str] | — | found | — | — | — |
| 2 | funder [str] | found | found | — | — | — |
| 3 | system_program [str] | — | — | — | found | found |

## Constraints per account

- whirlpool: owner found (bundle/initialize_dynamic_tick_array.ts:279 via try_accounts_11a48); initialized found (bundle/initialize_dynamic_tick_array.ts:279 via try_accounts_11a48); discriminator found (bundle/initialize_dynamic_tick_array.ts:279 via try_accounts_11a48)
- tick_array: count found (bundle/initialize_dynamic_tick_array.ts:295); key found (bundle/initialize_dynamic_tick_array.ts:346); pda found (bundle/initialize_dynamic_tick_array.ts:346); writable found (bundle/initialize_dynamic_tick_array.ts:360)
- funder: signer found (bundle/initialize_dynamic_tick_array.ts:292 via try_accounts_11718); writable found (bundle/initialize_dynamic_tick_array.ts:318)
- system_program: address found (bundle/initialize_dynamic_tick_array.ts:317 via fn_122e8); executable found (bundle/initialize_dynamic_tick_array.ts:317 via fn_122e8)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/initialize_dynamic_tick_array.ts:339 find_program_address(["tick_array", *s20, ?], program *b)
- compared with provided accounts: tick_array found

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 11 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer funder; address system_program; executable system_program; writable funder; key tick_array; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 12 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `af != -1` · `ac != -1` · `z != -1` · `x != -1` · `u != -1` · `u39 != -1` · ✗ `h == 0` · ✗ `(memcmp(d.owner, sa8, 0x20) as u32) != 0` #11 · `imp_fmt(s164, s48) == 0` · `u77 != -1` · … 11 more

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/initialize_dynamic_tick_array.ts:317)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, funder.key
- whirlpool.data: validated (owner found @accounts_initialize_dynamic_tick_array:41, discriminator found @accounts_initialize_dynamic_tick_array:41, initialized found @accounts_initialize_dynamic_tick_array:41)
- tick_array.key: validated (pda found @accounts_initialize_dynamic_tick_array:108, key found @accounts_initialize_dynamic_tick_array:108)
- system_program.key: validated (address found @accounts_initialize_dynamic_tick_array:79)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_dynamic_tick_array.ts:279 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `whirlpool == 0` | return |
| 1 | bundle/initialize_dynamic_tick_array.ts:292 | found | funder | signer (via try_accounts_11718 (count, signer)) | `i != 2` | return |
| 2 | bundle/initialize_dynamic_tick_array.ts:295 | found | tick_array | count | `k == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/initialize_dynamic_tick_array.ts:317 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `r != 2` | return |
| 4 | bundle/initialize_dynamic_tick_array.ts:318 | found | funder | writable | `ld8(ld64(s670) + 0x29) == 0` | anchor::ConstraintMut |
| 5 | bundle/initialize_dynamic_tick_array.ts:346 | found | tick_array | key, pda | `(memcmp(s578, s70, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 6 | bundle/initialize_dynamic_tick_array.ts:360 | found | tick_array | writable | `tick_array.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/initialize_dynamic_tick_array.ts:410 | found |  | key, owner | `!((memcmp(h, 0x100152180, 0x20) as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 8 | bundle/initialize_dynamic_tick_array.ts:492 | PARTIAL |  | owner | `!((i as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 9 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 10 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 11 | bundle/initialize_dynamic_tick_array.ts:668 | found | d? | owner | `!((memcmp(d.owner, sa8, 0x20) as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 12 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
