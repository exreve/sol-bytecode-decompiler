# open_bundled_position

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_open_bundled_position (anchor); 62 functions reachable: ix_open_bundled_position, accounts_open_bundled_position, memcpy, fn_338a0, fn_5a40, fn_149678, fn_7f28, fn_147990, fn_11f980, fn_139720, fn_a9c0, fn_83078, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | position_bundle [str] | — | PARTIAL | found (+discriminator found) | — | — |
| 1 | position_bundle_token_account [str] | — | — | found (+discriminator found) | — | — |
| 2 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 3 | rent [str] | — | — | — | — | found |
| 4 | bundled_position [str] | — | PARTIAL | PARTIAL | — | — |
| 5 | funder [str] | found | PARTIAL | — | — | — |
| 6 | system_program [str] | — | — | — | found | found |
| 7 | position_bundle_authority [str] | found | — | — | — | — |

## Constraints per account

- position_bundle: owner found (bundle/open_bundled_position.ts:261 via try_accounts_11bb8); initialized found (bundle/open_bundled_position.ts:261 via try_accounts_11bb8); discriminator found (bundle/open_bundled_position.ts:261 via try_accounts_11bb8); writable PARTIAL (bundle/open_bundled_position.ts:438)
- position_bundle_token_account: owner found (bundle/open_bundled_position.ts:276 via try_accounts_11f50); discriminator found (bundle/open_bundled_position.ts:276 via try_accounts_11f50); initialized found (bundle/open_bundled_position.ts:276 via try_accounts_11f50); raw PARTIAL (bundle/open_bundled_position.ts:440)
- whirlpool: owner found (bundle/open_bundled_position.ts:295 via try_accounts_11a48); initialized found (bundle/open_bundled_position.ts:295 via try_accounts_11a48); discriminator found (bundle/open_bundled_position.ts:295 via try_accounts_11a48)
- rent: address found (bundle/open_bundled_position.ts:323 via try_accounts_11990)
- bundled_position: key found (bundle/open_bundled_position.ts:353); pda found (bundle/open_bundled_position.ts:353); writable PARTIAL (bundle/open_bundled_position.ts:361); rent_exempt PARTIAL (bundle/open_bundled_position.ts:429); owner PARTIAL (bundle/open_bundled_position.ts:1279 via fn_4a30); initialized PARTIAL (bundle/open_bundled_position.ts:1279 via fn_4a30)
- funder: signer found (bundle/open_bundled_position.ts:312 via try_accounts_11718); writable PARTIAL (bundle/open_bundled_position.ts:451)
- system_program: address found (bundle/open_bundled_position.ts:317 via fn_122e8); executable found (bundle/open_bundled_position.ts:317 via fn_122e8)
- position_bundle_authority: signer found (bundle/open_bundled_position.ts:292 via try_accounts_11718)

## CPIs

- shared.ts:20063 [conditional] program not decoded
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/open_bundled_position.ts:345 find_program_address(["bundled_position", *s2f8, ?], program *(ld64(s378)))
- compared with provided accounts: bundled_position found

## Dominance (checks on every path to the operation; across calls)

- shared.ts:20063 CPI: 16 dominating checks (owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_token_account; discriminator position_bundle_token_account; initialized position_bundle_token_account; signer position_bundle_authority; owner whirlpool; …)
- entrypoint.ts:14045 CPI: 24 dominating checks (owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_token_account; discriminator position_bundle_token_account; initialized position_bundle_token_account; signer position_bundle_authority; owner whirlpool; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 25 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:20063 CPI: `bj != -1` · `bh != -1` · `bc != -1` · `ba != -1` · `u170 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s48, s318, 0x20) as u32) == 0` #23 · `g != 0` · `(memcmp(s290, s320, 0x20) as u32) == 0` #9 · … 16 more
- entrypoint.ts:14045 CPI: `u70 != -1` · `u65 != -1` · `u58 != -1` · `u55 != -1` · `u47 != -1` · `u43 != -1` · `u26 != -1` · `u22 != -1` · ✗ `f != 2` · ✗ `f != 2` · … 5 more

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/open_bundled_position.ts:317)
- rent.key == (constant address) (address, found, bundle/open_bundled_position.ts:323)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): position_bundle.key, position_bundle_token_account.key, whirlpool.key, funder.key, position_bundle_authority.key
- position_bundle.data: validated (owner found @accounts_open_bundled_position:52, discriminator found @accounts_open_bundled_position:52, initialized found @accounts_open_bundled_position:52)
- position_bundle_token_account.data: validated (owner found @accounts_open_bundled_position:67, discriminator found @accounts_open_bundled_position:67, initialized found @accounts_open_bundled_position:67)
- whirlpool.data: validated (owner found @accounts_open_bundled_position:86, discriminator found @accounts_open_bundled_position:86, initialized found @accounts_open_bundled_position:86)
- rent.key: validated (address found @accounts_open_bundled_position:114)
- bundled_position.key: validated (pda found @accounts_open_bundled_position:144, key found @accounts_open_bundled_position:144)
- bundled_position.data: partially-validated (owner partial @fn_b4498:392, initialized partial @fn_b4498:392)
- system_program.key: validated (address found @accounts_open_bundled_position:108)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/open_bundled_position.ts:171 | PARTIAL | position_bundle |  | `l != 2` | return |
| 1 | bundle/open_bundled_position.ts:248 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/open_bundled_position.ts:261 | found | position_bundle | owner, initialized, discriminator (via try_accounts_11bb8 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 3 | bundle/open_bundled_position.ts:276 | found | position_bundle_token_account | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x70) == 2` | return |
| 4 | bundle/open_bundled_position.ts:292 | found | position_bundle_authority | signer (via try_accounts_11718 (count, signer)) | `o != 2` | return |
| 5 | bundle/open_bundled_position.ts:295 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 6 | bundle/open_bundled_position.ts:312 | found | funder | signer (via try_accounts_11718 (count, signer)) | `s != 2` | return |
| 7 | bundle/open_bundled_position.ts:317 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `u != 2` | return |
| 8 | bundle/open_bundled_position.ts:323 | found | rent | address (via try_accounts_11990 (count, address)) | `w == 0` | return |
| 9 | bundle/open_bundled_position.ts:353 | found | bundled_position | key, pda | `!((memcmp(s290, s320, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 10 | bundle/open_bundled_position.ts:361 | PARTIAL | bundled_position | writable | `bundled_position.is_writable == 0` | anchor::ConstraintMut |
| 11 | bundle/open_bundled_position.ts:429 | PARTIAL | bundled_position | rent_exempt | `ba > ld64(s558)` | anchor::ConstraintRentExempt |
| 12 | bundle/open_bundled_position.ts:438 | PARTIAL | position_bundle | writable | `!(ld8(ld64(j) + 0x29) != 0)` | anchor::ConstraintMut |
| 13 | bundle/open_bundled_position.ts:440 | PARTIAL | position_bundle_token_account | raw | `ak != 0` | anchor::ConstraintRaw |
| 14 | bundle/open_bundled_position.ts:441 | PARTIAL | position_bundle_token_account | raw | `ld64(ld64(s548 + 0x28) + 0x48) != 1` | anchor::ConstraintRaw |
| 15 | bundle/open_bundled_position.ts:451 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 16 | bundle/open_bundled_position.ts:562 | PARTIAL |  | key | `(memcmp(g + 0x148, 0x100152180, 0x20) as u32) == 0 && (ld16(g + 0xc8) & 1) != 0` | return |
| 17 | entrypoint.ts:929 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 18 | entrypoint.ts:938 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 19 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 20 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 21 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 22 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 23 | bundle/open_bundled_position.ts:906 | PARTIAL |  | key | `(memcmp(s48, s318, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 24 | bundle/open_bundled_position.ts:1279 | PARTIAL | bundled_position | owner, initialized (via fn_4a30 (owner, initialized)) | `ld64(s138) == 0` | return |
| 25 | entrypoint.ts:13553 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 26 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 27 | bundle/open_bundled_position.ts:1686 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 28 | bundle/open_bundled_position.ts:1695 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
