# initialize_tick_array

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_tick_array (anchor); 40 functions reachable: ix_initialize_tick_array, accounts_initialize_tick_array, memcpy, fn_32f48, fn_aef00, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_83078, fn_149478, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 1 | system_program [str] | — | — | — | found | found |
| 2 | tick_array [str] | — | PARTIAL | PARTIAL | — | — |
| 3 | funder [str] | found | PARTIAL | — | — | — |

## Constraints per account

- whirlpool: owner found (bundle/initialize_tick_array.ts:209 via try_accounts_11a48); initialized found (bundle/initialize_tick_array.ts:209 via try_accounts_11a48); discriminator found (bundle/initialize_tick_array.ts:209 via try_accounts_11a48)
- system_program: address found (bundle/initialize_tick_array.ts:242 via fn_122e8); executable found (bundle/initialize_tick_array.ts:242 via fn_122e8)
- tick_array: key found (bundle/initialize_tick_array.ts:274); pda found (bundle/initialize_tick_array.ts:274); writable PARTIAL (bundle/initialize_tick_array.ts:280); owner PARTIAL (bundle/initialize_tick_array.ts:970 via fn_1110)
- funder: signer found (bundle/initialize_tick_array.ts:223 via try_accounts_11718); writable PARTIAL (bundle/initialize_tick_array.ts:295)

## CPIs

- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/initialize_tick_array.ts:266 find_program_address(["tick_array", *s50, ?], program *(ld64(s5f0)))
- compared with provided accounts: tick_array found

## Dominance (checks on every path to the operation; across calls)

- shared.ts:20063 CPI: 8 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer funder; address system_program; executable system_program; key tick_array; pda tick_array; …)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:20063 CPI: `bj != -1` · `bh != -1` · `bc != -1` · `ba != -1` · `u170 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s48, s240, 0x20) as u32) == 0` #13 · `g != 0` · `(memcmp(s350, s78, 0x20) as u32) == 0` #4 · … 8 more

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/initialize_tick_array.ts:242)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, funder.key
- whirlpool.data: validated (owner found @accounts_initialize_tick_array:43, discriminator found @accounts_initialize_tick_array:43, initialized found @accounts_initialize_tick_array:43)
- system_program.key: validated (address found @accounts_initialize_tick_array:76)
- tick_array.key: validated (pda found @accounts_initialize_tick_array:108, key found @accounts_initialize_tick_array:108)
- tick_array.data: partially-validated (owner partial @fn_ad230:394)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_tick_array.ts:209 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `f == 0` | return |
| 1 | bundle/initialize_tick_array.ts:223 | found | funder | signer (via try_accounts_11718 (count, signer)) | `i != 2` | return |
| 2 | bundle/initialize_tick_array.ts:227 | found |  | count | `k == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/initialize_tick_array.ts:242 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `m != 2` | return |
| 4 | bundle/initialize_tick_array.ts:274 | found | tick_array | key, pda | `!((memcmp(s350, s78, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 5 | bundle/initialize_tick_array.ts:280 | PARTIAL | tick_array | writable | `tick_array.is_writable == 0` | anchor::ConstraintMut |
| 6 | bundle/initialize_tick_array.ts:295 | PARTIAL | funder | writable | `ai == 0x800000000000001a /* Ok */` | anchor::ConstraintMut |
| 7 | bundle/initialize_tick_array.ts:359 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/initialize_tick_array.ts:427 | PARTIAL | tick_array | writable | `tick_array.is_writable == 0` | anchor::AccountNotMutable |
| 9 | bundle/initialize_tick_array.ts:532 | PARTIAL | tick_array |  | `i != 0x800000000000001a /* Ok */` | return |
| 10 | bundle/initialize_tick_array.ts:537 | PARTIAL | tick_array |  | `n != 2` | return |
| 11 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 12 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 13 | bundle/initialize_tick_array.ts:595 | found |  | key | `(memcmp(s48, s240, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 14 | bundle/initialize_tick_array.ts:970 | PARTIAL | tick_array | owner (via fn_1110 (owner)) | `cz != 2` | return |
| 15 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
