# delete_token_badge

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_delete_token_badge (anchor); 43 functions reachable: ix_delete_token_badge, accounts_delete_token_badge, memcpy, fn_eaae8, fn_83340, fn_87828, fn_149678, fn_11f980, fn_147990, fn_139720, fn_9900, fn_9d30, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | whirlpools_config_extension [str] | — | — | found (+discriminator found) | — | — |
| 2 | token_mint [str] | — | — | found (+discriminator found) | — | — |
| 3 | token_badge [str] | — | found | found (+discriminator found) | — | — |
| 4 | receiver [str] | — | found | — | — | — |
| 5 | token_badge_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/delete_token_badge.ts:128 via try_accounts_11de0); initialized found (bundle/delete_token_badge.ts:128 via try_accounts_11de0); discriminator found (bundle/delete_token_badge.ts:128 via try_accounts_11de0)
- whirlpools_config_extension: owner found (bundle/delete_token_badge.ts:144 via try_accounts_120c0); initialized found (bundle/delete_token_badge.ts:144 via try_accounts_120c0); discriminator found (bundle/delete_token_badge.ts:144 via try_accounts_120c0); key found (bundle/delete_token_badge.ts:218); has_one found (bundle/delete_token_badge.ts:218)
- token_mint: owner found (bundle/delete_token_badge.ts:164 via try_accounts_610); discriminator found (bundle/delete_token_badge.ts:164 via try_accounts_610); initialized found (bundle/delete_token_badge.ts:164 via try_accounts_610)
- token_badge: owner found (bundle/delete_token_badge.ts:181 via fn_12178); initialized found (bundle/delete_token_badge.ts:181 via fn_12178); discriminator found (bundle/delete_token_badge.ts:181 via fn_12178); key found (bundle/delete_token_badge.ts:233); pda found (bundle/delete_token_badge.ts:233); writable found (bundle/delete_token_badge.ts:234); has_one found (bundle/delete_token_badge.ts:251); close found (bundle/delete_token_badge.ts:256)
- receiver: count found (bundle/delete_token_badge.ts:197); writable found (bundle/delete_token_badge.ts:265)
- token_badge_authority: signer found (bundle/delete_token_badge.ts:160 via try_accounts_11718); key found (bundle/delete_token_badge.ts:222); address found (bundle/delete_token_badge.ts:222)

## PDAs derived

- bundle/delete_token_badge.ts:227 find_program_address(["token_badge", *s, *aa], program *(ld64(s338)))
- compared with provided accounts: token_badge found

## Operations (account writes)

- bundle/delete_token_badge.ts:423 LAMPORT_WRITE receiver.lamports += f + g [conditional]
- bundle/delete_token_badge.ts:429 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports = 0 [conditional]
- bundle/delete_token_badge.ts:517 ACCOUNT_REALLOC b.data.len = c
- bundle/delete_token_badge.ts:516 ACCOUNT_DATA_WRITE token_badge.data[-8..0] = c [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/delete_token_badge.ts:423 LAMPORT_WRITE: 21 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpools_config_extension; initialized whirlpools_config_extension; discriminator whirlpools_config_extension; signer token_badge_authority; owner token_mint; …)
  - sources: receiver.lamports ← token_badge.key (validated)
- bundle/delete_token_badge.ts:429 LAMPORT_WRITE, ACCOUNT_CLOSE: 21 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpools_config_extension; initialized whirlpools_config_extension; discriminator whirlpools_config_extension; signer token_badge_authority; owner token_mint; …)
- bundle/delete_token_badge.ts:517 ACCOUNT_REALLOC: 22 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpools_config_extension; initialized whirlpools_config_extension; discriminator whirlpools_config_extension; signer token_badge_authority; owner token_mint; …)
- bundle/delete_token_badge.ts:516 ACCOUNT_DATA_WRITE: 22 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpools_config_extension; initialized whirlpools_config_extension; discriminator whirlpools_config_extension; signer token_badge_authority; owner token_mint; …)

## Authority (who enables each value movement / authority change)

- bundle/delete_token_badge.ts:429 LAMPORT_WRITE, ACCOUNT_CLOSE: signer token_badge_authority (found); stored token_badge_authority.key == whirlpools_config_extension.token_badge_authority (found); stored token_badge_authority.key == (constant address) (found); stored token_badge_authority.key == token_badge.token_badge_authority (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/delete_token_badge.ts:423 LAMPORT_WRITE receiver.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — receiver: no pda / address / key / has_one / associated / signer check found
  - [found] amount arithmetic checked — f + g (checked); receiver.lamports ← token_badge.key (validated)
  - [found] relevant checks on every path — 22 dominating checks
- bundle/delete_token_badge.ts:429 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer token_badge_authority (found); stored token_badge_authority.key == whirlpools_config_extension.token_badge_authority (found); stored token_badge_authority.key == (constant address) (found); sto
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13aee8
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 22 dominating checks
- bundle/delete_token_badge.ts:516 ACCOUNT_DATA_WRITE token_badge.data[-8..0] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — token_badge: discriminator found
  - [found] write gated (signer / constraint) — signer token_badge_authority accounts_delete_token_badge:40; key/has_one whirlpools_config_extension accounts_delete_token_badge:98; key/address token_badge_authority accounts_delete_token_badge:102

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/delete_token_badge.ts:429 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports ⇐ signer token_badge_authority (found) ⇐ stored whirlpools_config_extension.token_badge_authority == token_badge_authority.key (found) ⇐ writer whirlpools_config_extension.token_badge_authority: no instruction writing it found (set at creation, or outside the recognized writes)
- bundle/delete_token_badge.ts:429 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports ⇐ signer token_badge_authority (found) ⇐ stored (constant address) == token_badge_authority.key (found) ⇐ writer (constant address): no instruction writing it found (set at creation, or outside the recognized writes)
- bundle/delete_token_badge.ts:429 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports ⇐ signer token_badge_authority (found) ⇐ stored token_badge.token_badge_authority == token_badge_authority.key (found) ⇐ writer token_badge.token_badge_authority: no instruction writing it found (set at creation, or outside the recognized writes)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/delete_token_badge.ts:423 LAMPORT_WRITE receiver.lamports: `j == 0` · ✗ `(h & 1) != 0` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · `(ld16(ld64(s1c8 + 0xb8) + 0x6a) & 1) != 0` · ✗ `f == 2`
- bundle/delete_token_badge.ts:429 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports: `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · `(ld16(ld64(s1c8 + 0xb8) + 0x6a) & 1) != 0` · ✗ `f == 2`
- bundle/delete_token_badge.ts:517 ACCOUNT_REALLOC b.data.len: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #23 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · … 2 more
- bundle/delete_token_badge.ts:516 ACCOUNT_DATA_WRITE token_badge.data[-8..0]: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #23 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · … 2 more

## Arithmetic on value paths

- bundle/delete_token_badge.ts:423 receiver.lamports ← `f + g`: checked — guard `(h & 1) != 0` (bundle/delete_token_badge.ts:414)

## Relations (equalities the checks establish)

- whirlpools_config_extension.token_badge_authority? == token_badge_authority.key (has_one, found, bundle/delete_token_badge.ts:218)
- token_badge_authority.key == (constant address) (address, found, bundle/delete_token_badge.ts:222)
- token_badge.token_badge_authority? == token_badge_authority.key (has_one, found, bundle/delete_token_badge.ts:251)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, token_mint.key, receiver.key
- whirlpools_config.data: validated (owner found @accounts_delete_token_badge:8, discriminator found @accounts_delete_token_badge:8, initialized found @accounts_delete_token_badge:8)
- whirlpools_config_extension.key: validated (key found @accounts_delete_token_badge:98, has_one found @accounts_delete_token_badge:98)
- whirlpools_config_extension.data: validated (owner found @accounts_delete_token_badge:24, discriminator found @accounts_delete_token_badge:24, initialized found @accounts_delete_token_badge:24)
- token_mint.data: validated (owner found @accounts_delete_token_badge:44, discriminator found @accounts_delete_token_badge:44, initialized found @accounts_delete_token_badge:44)
- token_badge.key: validated (pda found @accounts_delete_token_badge:113, key found @accounts_delete_token_badge:113, has_one found @accounts_delete_token_badge:131)
- token_badge.data: validated (owner found @accounts_delete_token_badge:61, discriminator found @accounts_delete_token_badge:61, initialized found @accounts_delete_token_badge:61)
- token_badge_authority.key: validated (address found @accounts_delete_token_badge:102, key found @accounts_delete_token_badge:102)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/delete_token_badge.ts:128 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s1a0) == 0` | return |
| 1 | bundle/delete_token_badge.ts:144 | found | whirlpools_config_extension | owner, initialized, discriminator (via try_accounts_120c0 (count, owner, initialized, discriminator)) | `ld64(s1a0) == 0` | return |
| 2 | bundle/delete_token_badge.ts:160 | found | token_badge_authority | signer (via try_accounts_11718 (count, signer)) | `j != 2` | return |
| 3 | bundle/delete_token_badge.ts:164 | found | token_mint | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `l == 2` | return |
| 4 | bundle/delete_token_badge.ts:181 | found | token_badge | owner, initialized, discriminator (via fn_12178 (count, owner, initialized, discriminator)) | `o == 2` | return |
| 5 | bundle/delete_token_badge.ts:197 | found | receiver | count | `p == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/delete_token_badge.ts:218 | found | whirlpools_config_extension | key, has_one | `!((memcmp(s20, s68, 0x20) as u32) == 0)` | anchor::ConstraintHasOne |
| 7 | bundle/delete_token_badge.ts:222 | found | token_badge_authority | key, address | `!((memcmp(s20, s68, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 8 | bundle/delete_token_badge.ts:233 | found | token_badge | key, pda | `!((memcmp(s1a0, s88, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 9 | bundle/delete_token_badge.ts:234 | found | token_badge | writable | `ld8(ld64(s378) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 10 | bundle/delete_token_badge.ts:251 | found | token_badge | key, has_one | `!((memcmp(s20, s68, 0x20) as u32) == 0)` | anchor::ConstraintHasOne |
| 11 | bundle/delete_token_badge.ts:256 | found | token_badge | key, close | `(memcmp(s68, s1a0, 0x20) as u32) == 0` | anchor::ConstraintClose |
| 12 | bundle/delete_token_badge.ts:265 | found | receiver | writable | `receiver.is_writable == 0` | anchor::ConstraintMut |
| 13 | bundle/delete_token_badge.ts:395 | PARTIAL | token_badge |  | `v != 2` | return |
| 14 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 15 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 16 | entrypoint.ts:740 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 17 | entrypoint.ts:749 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 18 | entrypoint.ts:803 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 19 | entrypoint.ts:812 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 20 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 21 | entrypoint.ts:13263 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 22 | shared.ts:13523 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 23 | bundle/delete_token_badge.ts:510 | PARTIAL | b? | key | `sat_sub(c, ld32(b.key - 4)) > 0x2800` | Err(ProgramError::InvalidRealloc) |
