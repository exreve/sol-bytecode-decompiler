# close_bundled_position

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_close_bundled_position (anchor); 43 functions reachable: ix_close_bundled_position, accounts_close_bundled_position, memcpy, fn_30e80, fn_8a170, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9540, fn_a9c0, fn_83078, ….

## Findings (rule engine)

- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(m + 0x18), 0) · signers: position_bundle_authority (found) (fn_13aee8:23)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | bundled_position [str] | — | found | found (+discriminator found) | — | — |
| 1 | position_bundle [str] | — | found | found (+discriminator found) | — | — |
| 2 | position_bundle_token_account [str] | — | — | found (+discriminator found) | — | — |
| 3 | receiver [str] | — | found | — | — | — |
| 4 | position_bundle_authority [str] | found | — | — | — | — |
|  | position_bundle_token_account_box [code] | — | — | — | — | — |

## Constraints per account

- bundled_position: owner found (bundle/close_bundled_position.ts:208 via try_accounts_11b00); initialized found (bundle/close_bundled_position.ts:208 via try_accounts_11b00); discriminator found (bundle/close_bundled_position.ts:208 via try_accounts_11b00); key found (bundle/close_bundled_position.ts:290); pda found (bundle/close_bundled_position.ts:290); writable found (bundle/close_bundled_position.ts:291); close found (bundle/close_bundled_position.ts:303)
- position_bundle: owner found (bundle/close_bundled_position.ts:222 via try_accounts_11bb8); initialized found (bundle/close_bundled_position.ts:222 via try_accounts_11bb8); discriminator found (bundle/close_bundled_position.ts:222 via try_accounts_11bb8); writable found (bundle/close_bundled_position.ts:312)
- position_bundle_token_account: owner found (bundle/close_bundled_position.ts:238 via try_accounts_11f50); discriminator found (bundle/close_bundled_position.ts:238 via try_accounts_11f50); initialized found (bundle/close_bundled_position.ts:238 via try_accounts_11f50); state found (bundle/close_bundled_position.ts:322); key found (bundle/close_bundled_position.ts:322); raw found (bundle/close_bundled_position.ts:322)
- receiver: count found (bundle/close_bundled_position.ts:257); writable found (bundle/close_bundled_position.ts:334)
- position_bundle_authority: signer found (bundle/close_bundled_position.ts:254 via try_accounts_11718)
- position_bundle_token_account_box: state found (bundle/close_bundled_position.ts:322)

## PDAs derived

- bundle/close_bundled_position.ts:283 find_program_address(["bundled_position", *s38, ?], program *(ld64(s3d0)))
- compared with provided accounts: bundled_position found

## Operations (account writes)

- bundle/close_bundled_position.ts:644 LAMPORT_WRITE receiver.lamports += f + g [conditional]
- bundle/close_bundled_position.ts:650 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports = 0 [conditional]
- bundle/close_bundled_position.ts:832 ACCOUNT_REALLOC b.data.len = c
- bundle/close_bundled_position.ts:831 ACCOUNT_DATA_WRITE token_badge.data[-8..0] = c [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/close_bundled_position.ts:644 LAMPORT_WRITE: 18 dominating checks (owner bundled_position; initialized bundled_position; discriminator bundled_position; owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_token_account; discriminator position_bundle_token_account; …)
- bundle/close_bundled_position.ts:650 LAMPORT_WRITE, ACCOUNT_CLOSE: 18 dominating checks (owner bundled_position; initialized bundled_position; discriminator bundled_position; owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_token_account; discriminator position_bundle_token_account; …)
- bundle/close_bundled_position.ts:832 ACCOUNT_REALLOC: 19 dominating checks (owner bundled_position; initialized bundled_position; discriminator bundled_position; owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_token_account; discriminator position_bundle_token_account; …)
- bundle/close_bundled_position.ts:831 ACCOUNT_DATA_WRITE: 19 dominating checks (owner bundled_position; initialized bundled_position; discriminator bundled_position; owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_token_account; discriminator position_bundle_token_account; …)

## Authority (who enables each value movement / authority change)

- bundle/close_bundled_position.ts:650 LAMPORT_WRITE, ACCOUNT_CLOSE: signer position_bundle_authority (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/close_bundled_position.ts:644 LAMPORT_WRITE receiver.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — receiver: no pda / address / key / has_one / associated / signer check found
  - [found] amount arithmetic checked — f + g (checked)
  - [found] relevant checks on every path — 19 dominating checks
- bundle/close_bundled_position.ts:650 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer position_bundle_authority (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13aee8
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 19 dominating checks
- bundle/close_bundled_position.ts:831 ACCOUNT_DATA_WRITE token_badge.data[-8..0] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — token_badge: not an identified account
  - [found] write gated (signer / constraint) — signer position_bundle_authority accounts_close_bundled_position:89; key/pda bundled_position accounts_close_bundled_position:125; key/close bundled_position accounts_close_bundled_position:138

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/close_bundled_position.ts:650 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports ⇐ signer position_bundle_authority (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/close_bundled_position.ts:644 LAMPORT_WRITE receiver.lamports: `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · `j == 2` · ✗ `h == 0` · ✗ `2 > f`
- bundle/close_bundled_position.ts:650 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports: `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · `j == 2` · ✗ `h == 0` · ✗ `2 > f`
- bundle/close_bundled_position.ts:832 ACCOUNT_REALLOC b.data.len: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #20 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · … 3 more
- bundle/close_bundled_position.ts:831 ACCOUNT_DATA_WRITE token_badge.data[-8..0]: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #20 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · … 3 more

## Arithmetic on value paths

- bundle/close_bundled_position.ts:644 receiver.lamports ← `f + g`: checked — guard `(h & 1) != 0` (bundle/close_bundled_position.ts:635)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): position_bundle.key, receiver.key, position_bundle_authority.key, position_bundle_token_account_box.key
- bundled_position.key: validated (pda found @accounts_close_bundled_position:125, key found @accounts_close_bundled_position:125)
- bundled_position.data: validated (owner found @accounts_close_bundled_position:43, discriminator found @accounts_close_bundled_position:43, initialized found @accounts_close_bundled_position:43)
- position_bundle.data: validated (owner found @accounts_close_bundled_position:57, discriminator found @accounts_close_bundled_position:57, initialized found @accounts_close_bundled_position:57)
- position_bundle_token_account.key: validated (key found @accounts_close_bundled_position:157)
- position_bundle_token_account.data: validated (owner found @accounts_close_bundled_position:73, discriminator found @accounts_close_bundled_position:73, initialized found @accounts_close_bundled_position:73)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/close_bundled_position.ts:208 | found | bundled_position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `f == 0` | return |
| 1 | bundle/close_bundled_position.ts:222 | found | position_bundle | owner, initialized, discriminator (via try_accounts_11bb8 (count, owner, initialized, discriminator)) | `ld64(s158) == 0` | return |
| 2 | bundle/close_bundled_position.ts:238 | found | position_bundle_token_account | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s138 + 0x70) == 2` | return |
| 3 | bundle/close_bundled_position.ts:254 | found | position_bundle_authority | signer (via try_accounts_11718 (count, signer)) | `r != 2` | return |
| 4 | bundle/close_bundled_position.ts:257 | found | receiver | count | `t == 0` | anchor::AccountNotEnoughKeys |
| 5 | bundle/close_bundled_position.ts:290 | found | bundled_position | key, pda | `!((memcmp(s158, s80, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 6 | bundle/close_bundled_position.ts:291 | found | bundled_position | writable | `bundled_position.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/close_bundled_position.ts:303 | found | bundled_position | key, close | `(memcmp(s60, s158, 0x20) as u32) == 0` | anchor::ConstraintClose |
| 8 | bundle/close_bundled_position.ts:312 | found | position_bundle | writable | `ld8(ld64(k) + 0x29) == 0` | anchor::ConstraintMut |
| 9 | bundle/close_bundled_position.ts:322 | found | position_bundle_token_account | state, key, raw | `!((memcmp(position_bundle_token_account_box_2.mint, s208, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 10 | bundle/close_bundled_position.ts:323 | found | position_bundle_token_account | state, key, raw | `!((memcmp(position_bundle_token_account_box_2.mint, k + 8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 11 | bundle/close_bundled_position.ts:324 | found | position_bundle_token_account | state, raw | `position_bundle_token_account_box_2.amount != 1` | anchor::ConstraintRaw |
| 12 | bundle/close_bundled_position.ts:334 | found | receiver | writable | `receiver.is_writable == 0` | anchor::ConstraintMut |
| 13 | bundle/close_bundled_position.ts:509 | PARTIAL | position_bundle |  | `w != 2` | return |
| 14 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 15 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 16 | entrypoint.ts:929 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 17 | entrypoint.ts:938 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 18 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 19 | entrypoint.ts:13553 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 20 | bundle/close_bundled_position.ts:825 | PARTIAL | b? | key | `sat_sub(c, ld32(b.key - 4)) > 0x2800` | Err(ProgramError::InvalidRealloc) |
