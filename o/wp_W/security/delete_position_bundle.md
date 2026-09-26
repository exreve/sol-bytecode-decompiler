# delete_position_bundle

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_delete_position_bundle (anchor); 42 functions reachable: ix_delete_position_bundle, accounts_delete_position_bundle, memcpy, fn_65a18, fn_93d90, fn_83340, fn_87828, fn_149678, fn_11f980, fn_147990, fn_139720, fn_a9c0, ….

## Findings (rule engine)

- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(m + 0x18), 0) · signers: position_bundle_owner (found) (fn_13aee8:23)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | position_bundle [str] | — | found | found (+discriminator found) | — | — |
| 1 | position_bundle_mint [str] | — | found | found (+discriminator found) | — | found |
| 2 | position_bundle_token_account [str] | — | found | found (+discriminator found) | — | — |
| 3 | receiver [str] | — | found | — | — | — |
| 4 | token_program [str] | — | — | — | found | found |
| 5 | position_bundle_owner [str] | found | — | — | — | — |

## Constraints per account

- position_bundle: owner found (bundle/delete_position_bundle.ts:163 via try_accounts_11bb8); initialized found (bundle/delete_position_bundle.ts:163 via try_accounts_11bb8); discriminator found (bundle/delete_position_bundle.ts:163 via try_accounts_11bb8); writable found (bundle/delete_position_bundle.ts:236); key found (bundle/delete_position_bundle.ts:250); close found (bundle/delete_position_bundle.ts:250)
- position_bundle_mint: owner found (bundle/delete_position_bundle.ts:176 via try_accounts_11e98); discriminator found (bundle/delete_position_bundle.ts:176 via try_accounts_11e98); initialized found (bundle/delete_position_bundle.ts:176 via try_accounts_11e98); writable found (bundle/delete_position_bundle.ts:262); key found (bundle/delete_position_bundle.ts:275); address found (bundle/delete_position_bundle.ts:275)
- position_bundle_token_account: owner found (bundle/delete_position_bundle.ts:191 via try_accounts_11f50); discriminator found (bundle/delete_position_bundle.ts:191 via try_accounts_11f50); initialized found (bundle/delete_position_bundle.ts:191 via try_accounts_11f50); state found (bundle/delete_position_bundle.ts:289); writable found (bundle/delete_position_bundle.ts:289); key found (bundle/delete_position_bundle.ts:298); raw found (bundle/delete_position_bundle.ts:298)
- receiver: writable found (bundle/delete_position_bundle.ts:311)
- token_program: address found (bundle/delete_position_bundle.ts:234 via fn_129a0); executable found (bundle/delete_position_bundle.ts:234 via fn_129a0); key found (bundle/delete_position_bundle.ts:322)
- position_bundle_owner: signer found (bundle/delete_position_bundle.ts:209 via try_accounts_11718)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## Operations (account writes)

- bundle/delete_position_bundle.ts:956 LAMPORT_WRITE receiver.lamports += f + g [conditional]
- bundle/delete_position_bundle.ts:962 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports = 0 [conditional]
- bundle/delete_position_bundle.ts:1322 ACCOUNT_REALLOC b.data.len = c
- bundle/delete_position_bundle.ts:1321 ACCOUNT_DATA_WRITE token_badge.data[-8..0] = c [conditional]

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 19 dominating checks (owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_mint; discriminator position_bundle_mint; initialized position_bundle_mint; owner position_bundle_token_account; discriminator position_bundle_token_account; …)
- bundle/delete_position_bundle.ts:956 LAMPORT_WRITE: 18 dominating checks (owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_mint; discriminator position_bundle_mint; initialized position_bundle_mint; owner position_bundle_token_account; discriminator position_bundle_token_account; …)
- bundle/delete_position_bundle.ts:962 LAMPORT_WRITE, ACCOUNT_CLOSE: 18 dominating checks (owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_mint; discriminator position_bundle_mint; initialized position_bundle_mint; owner position_bundle_token_account; discriminator position_bundle_token_account; …)
- bundle/delete_position_bundle.ts:1322 ACCOUNT_REALLOC: 19 dominating checks (owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_mint; discriminator position_bundle_mint; initialized position_bundle_mint; owner position_bundle_token_account; discriminator position_bundle_token_account; …)
- bundle/delete_position_bundle.ts:1321 ACCOUNT_DATA_WRITE: 19 dominating checks (owner position_bundle; initialized position_bundle; discriminator position_bundle; owner position_bundle_mint; discriminator position_bundle_mint; initialized position_bundle_mint; owner position_bundle_token_account; discriminator position_bundle_token_account; …)

## Authority (who enables each value movement / authority change)

- bundle/delete_position_bundle.ts:962 LAMPORT_WRITE, ACCOUNT_CLOSE: signer position_bundle_owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 19 dominating checks
- bundle/delete_position_bundle.ts:956 LAMPORT_WRITE receiver.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — receiver: no pda / address / key / has_one / associated / signer check found
  - [found] amount arithmetic checked — f + g (checked)
  - [found] relevant checks on every path — 18 dominating checks
- bundle/delete_position_bundle.ts:962 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer position_bundle_owner (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13aee8
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 18 dominating checks
- bundle/delete_position_bundle.ts:1321 ACCOUNT_DATA_WRITE token_badge.data[-8..0] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — token_badge: not an identified account
  - [found] write gated (signer / constraint) — signer position_bundle_owner accounts_delete_position_bundle:58; address/executable token_program accounts_delete_position_bundle:83; key/close position_bundle accounts_delete_position_bundle:99

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/delete_position_bundle.ts:962 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports ⇐ signer position_bundle_owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `u114 != -1` · `u105 != -1` · `u100 != -1` · `u90 != -1` · `u85 != -1` · `u74 != -1` · `u67 != -1` · `u59 != -1` · ✗ `q == 0x8000000000000000` · `u28 != -1` · … 5 more
- bundle/delete_position_bundle.ts:956 LAMPORT_WRITE receiver.lamports: `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · `k == 2` · ✗ `fn_5c948(s128) != 0` · ✗ `f == 2`
- bundle/delete_position_bundle.ts:962 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports: `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · `k == 2` · ✗ `fn_5c948(s128) != 0` · ✗ `f == 2`
- bundle/delete_position_bundle.ts:1322 ACCOUNT_REALLOC b.data.len: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #23 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · … 3 more
- bundle/delete_position_bundle.ts:1321 ACCOUNT_DATA_WRITE token_badge.data[-8..0]: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #23 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · … 3 more

## Arithmetic on value paths

- bundle/delete_position_bundle.ts:956 receiver.lamports ← `f + g`: checked — guard `(h & 1) != 0` (bundle/delete_position_bundle.ts:947)

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/delete_position_bundle.ts:234)
- position_bundle_mint.key == (constant address) (address, found, bundle/delete_position_bundle.ts:275)
- token_program.key == (constant address) (address, found, bundle/delete_position_bundle.ts:322)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): receiver.key, position_bundle_owner.key
- position_bundle.key: validated (key found @accounts_delete_position_bundle:99)
- position_bundle.data: validated (owner found @accounts_delete_position_bundle:12, discriminator found @accounts_delete_position_bundle:12, initialized found @accounts_delete_position_bundle:12)
- position_bundle_mint.key: validated (address found @accounts_delete_position_bundle:124, key found @accounts_delete_position_bundle:124)
- position_bundle_mint.data: validated (owner found @accounts_delete_position_bundle:25, discriminator found @accounts_delete_position_bundle:25, initialized found @accounts_delete_position_bundle:25)
- position_bundle_token_account.key: validated (key found @accounts_delete_position_bundle:147)
- position_bundle_token_account.data: validated (owner found @accounts_delete_position_bundle:40, discriminator found @accounts_delete_position_bundle:40, initialized found @accounts_delete_position_bundle:40)
- token_program.key: validated (address found @accounts_delete_position_bundle:83, key found @accounts_delete_position_bundle:171)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/delete_position_bundle.ts:163 | found | position_bundle | owner, initialized, discriminator (via try_accounts_11bb8 (count, owner, initialized, discriminator)) | `position_bundle == 0` | return |
| 1 | bundle/delete_position_bundle.ts:176 | found | position_bundle_mint | owner, discriminator, initialized (via try_accounts_11e98 (count, owner, discriminator, initialized)) | `j == 2` | return |
| 2 | bundle/delete_position_bundle.ts:191 | found | position_bundle_token_account | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s98 + 0x70) == 2` | return |
| 3 | bundle/delete_position_bundle.ts:209 | found | position_bundle_owner | signer (via try_accounts_11718 (count, signer)) | `n != 2` | return |
| 4 | bundle/delete_position_bundle.ts:234 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `u != 2` | return |
| 5 | bundle/delete_position_bundle.ts:236 | found | position_bundle | writable | `position_bundle.is_writable == 0` | anchor::ConstraintMut |
| 6 | bundle/delete_position_bundle.ts:250 | found | position_bundle | key, close | `(memcmp(sd8, sb8, 0x20) as u32) == 0` | anchor::ConstraintClose |
| 7 | bundle/delete_position_bundle.ts:262 | found | position_bundle_mint | writable | `position_bundle_mint.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/delete_position_bundle.ts:275 | found | position_bundle_mint | key, address | `(memcmp(sf8, sd8, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 9 | bundle/delete_position_bundle.ts:289 | found | position_bundle_token_account | state, writable | `position_bundle_token_account_box.info.is_writable == 0` | anchor::ConstraintMut |
| 10 | bundle/delete_position_bundle.ts:298 | found | position_bundle_token_account | state, key, raw | `!((memcmp(position_bundle_token_account_box.mint, s178, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 11 | bundle/delete_position_bundle.ts:301 | found | position_bundle_token_account | owner, raw | `!((memcmp(position_bundle_token_account_box.owner, sb8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 12 | bundle/delete_position_bundle.ts:302 | found | position_bundle_token_account | state, raw | `position_bundle_token_account_box.amount != 1` | anchor::ConstraintRaw |
| 13 | bundle/delete_position_bundle.ts:311 | found | receiver | writable | `ld8(ld64(s380) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 14 | bundle/delete_position_bundle.ts:322 | found | token_program | key, address | `(memcmp(sd8, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 15 | bundle/delete_position_bundle.ts:682 | PARTIAL | position_bundle |  | `v != 2` | return |
| 16 | bundle/delete_position_bundle.ts:732 | PARTIAL | position_bundle_token_account |  | `ah != 0x800000000000001a /* Ok */` | return |
| 17 | bundle/delete_position_bundle.ts:738 | PARTIAL | position_bundle_token_account |  | `aj != 2` | return |
| 18 | entrypoint.ts:929 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 19 | entrypoint.ts:938 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 20 | bundle/delete_position_bundle.ts:758 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 21 | bundle/delete_position_bundle.ts:852 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 22 | entrypoint.ts:13553 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 23 | bundle/delete_position_bundle.ts:1315 | PARTIAL | b? | key | `sat_sub(c, ld32(b.key - 4)) > 0x2800` | Err(ProgramError::InvalidRealloc) |
