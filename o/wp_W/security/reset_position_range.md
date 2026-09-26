# reset_position_range

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_reset_position_range (anchor); 48 functions reachable: ix_reset_position_range, accounts_reset_position_range, fn_35bf0, fn_5a40, memcpy, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_9540, fn_145330, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | funder [str] | found | found | — | — | — |
| 1 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 2 | position [str] | — | found | found (+discriminator found) | — | — |
| 3 | position_token_account [str] | — | — | found (+discriminator found) | — | — |
| 4 | system_program [str] | — | — | — | found | found |
| 5 | position_authority [str] | found | — | — | — | — |

## Constraints per account

- funder: signer found (bundle/reset_position_range.ts:183 via try_accounts_11718); writable found (bundle/reset_position_range.ts:244)
- whirlpool: owner found (bundle/reset_position_range.ts:196 via try_accounts_11a48); initialized found (bundle/reset_position_range.ts:196 via try_accounts_11a48); discriminator found (bundle/reset_position_range.ts:196 via try_accounts_11a48)
- position: owner found (bundle/reset_position_range.ts:212 via try_accounts_11b00); initialized found (bundle/reset_position_range.ts:212 via try_accounts_11b00); discriminator found (bundle/reset_position_range.ts:212 via try_accounts_11b00); writable found (bundle/reset_position_range.ts:254); key found (bundle/reset_position_range.ts:258); has_one found (bundle/reset_position_range.ts:258)
- position_token_account: owner found (bundle/reset_position_range.ts:227 via try_accounts_558); discriminator found (bundle/reset_position_range.ts:227 via try_accounts_558); initialized found (bundle/reset_position_range.ts:227 via try_accounts_558); state found (bundle/reset_position_range.ts:271); raw found (bundle/reset_position_range.ts:271)
- system_program: address found (bundle/reset_position_range.ts:243 via fn_122e8); executable found (bundle/reset_position_range.ts:243 via fn_122e8)
- position_authority: signer found (bundle/reset_position_range.ts:194 via try_accounts_11718)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 17 dominating checks (signer funder; signer position_authority; owner whirlpool; initialized whirlpool; discriminator whirlpool; owner position; initialized position; discriminator position; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 17 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `u89 != -1` · `u80 != -1` · `u74 != -1` · `u70 != -1` · `u54 != -1` · `u50 != -1` · ✗ `0x248880 > t` · ✗ `t > 0x3c527f` · `u27 != -1` · `u23 != -1` · … 6 more

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/reset_position_range.ts:243)
- position.funder? == funder.key (has_one, found, bundle/reset_position_range.ts:258)
- position.position_authority? == position_authority.key (has_one, found, bundle/reset_position_range.ts:258)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): funder.key, whirlpool.key, position_token_account.key, position_authority.key
- whirlpool.data: validated (owner found @accounts_reset_position_range:23, discriminator found @accounts_reset_position_range:23, initialized found @accounts_reset_position_range:23)
- position.key: validated (key found @accounts_reset_position_range:85, has_one found @accounts_reset_position_range:85)
- position.data: validated (owner found @accounts_reset_position_range:39, discriminator found @accounts_reset_position_range:39, initialized found @accounts_reset_position_range:39)
- position_token_account.data: validated (owner found @accounts_reset_position_range:54, discriminator found @accounts_reset_position_range:54, initialized found @accounts_reset_position_range:54)
- system_program.key: validated (address found @accounts_reset_position_range:70)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/reset_position_range.ts:135 | PARTIAL | position |  | `i != 2` | return |
| 1 | bundle/reset_position_range.ts:183 | found | funder | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 2 | bundle/reset_position_range.ts:194 | found | position_authority | signer (via try_accounts_11718 (count, signer)) | `g != 2` | return |
| 3 | bundle/reset_position_range.ts:196 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 4 | bundle/reset_position_range.ts:212 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 5 | bundle/reset_position_range.ts:227 | found | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `ld32(s290 + 0xb0) == 2` | return |
| 6 | bundle/reset_position_range.ts:243 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `p != 2` | return |
| 7 | bundle/reset_position_range.ts:244 | found | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/reset_position_range.ts:254 | found | position | writable | `!(ld8(ld64(q) + 0x29) != 0)` | anchor::ConstraintMut |
| 9 | bundle/reset_position_range.ts:258 | found | position | key, has_one | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 10 | bundle/reset_position_range.ts:271 | found | position_token_account | state, raw | `position_token_account_box.amount != 1` | anchor::ConstraintRaw |
| 11 | bundle/reset_position_range.ts:273 | found | position_token_account | raw | `t != 0` | anchor::ConstraintRaw |
| 12 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 13 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 14 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 15 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 16 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 17 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
