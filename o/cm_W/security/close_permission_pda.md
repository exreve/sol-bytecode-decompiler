# close_permission_pda

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_close_permission_pda (anchor); 25 functions reachable: ix_close_permission_pda, accounts_close_permission_pda, memcpy, fn_db8b8, anchor_error_from, fn_c038, fn_88360, fn_13e190, fn_14d660, fn_125710, fn_10df30, fn_13e628, ….

## Findings (rule engine)

- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: owner (found) (fn_13e190:21)
- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: owner (found) (fn_13e190:21)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | expected · found | — | — | — |
| 1 | permission_authority | — | — | — | — | — |
| 2 | permission | — | expected · runtime | found (+discriminator found) | — | — |

## Constraints per account

- owner: signer found (bundle/close_permission_pda.ts:100 via try_accounts_17a30); writable found (bundle/close_permission_pda.ts:209)
- permission_authority: no checks found
- permission: owner found (bundle/close_permission_pda.ts:177 via try_accounts_18700); initialized found (bundle/close_permission_pda.ts:177 via try_accounts_18700); discriminator found (bundle/close_permission_pda.ts:177 via try_accounts_18700); key found (bundle/close_permission_pda.ts:213); pda found (bundle/close_permission_pda.ts:213); writable runtime (bundle/close_permission_pda.ts:548) — written: the runtime rejects changes to a read-only account

## Operations (account writes)

- bundle/close_permission_pda.ts:542 LAMPORT_WRITE owner.lamports += k [conditional]
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports = 0 [conditional]
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports = 0 [conditional]
- bundle/close_permission_pda.ts:542 LAMPORT_WRITE nft_owner.lamports += k [conditional]
- bundle/close_permission_pda.ts:542 LAMPORT_WRITE admin.lamports += k [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/close_permission_pda.ts:542 LAMPORT_WRITE: 8 dominating checks (signer owner; owner permission; initialized permission; discriminator permission; writable owner; key permission; pda permission; key; …)
  - sources: owner.lamports ← permission.key (validated)
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE: 8 dominating checks (signer owner; owner permission; initialized permission; discriminator permission; writable owner; key permission; pda permission; key; …)
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE: 8 dominating checks (signer owner; owner permission; initialized permission; discriminator permission; writable owner; key permission; pda permission; key; …)
- bundle/close_permission_pda.ts:542 LAMPORT_WRITE: 8 dominating checks (signer owner; owner permission; initialized permission; discriminator permission; writable owner; key permission; pda permission; key; …)
  - sources: nft_owner.lamports ← permission.key (validated)
- bundle/close_permission_pda.ts:542 LAMPORT_WRITE: 8 dominating checks (signer owner; owner permission; initialized permission; discriminator permission; writable owner; key permission; pda permission; key; …)
  - sources: admin.lamports ← permission.key (validated)

## Authority (who enables each value movement / authority change)

- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE: signer owner (found)
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE: signer owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/close_permission_pda.ts:542 LAMPORT_WRITE owner.lamports [LAMPORT_WRITE +=]
  - [found] recipient bound — owner: signer found
  - [found] amount arithmetic checked — h + g (checked); owner.lamports ← permission.key (validated)
  - [found] relevant checks on every path — 8 dominating checks
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 8 dominating checks
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 8 dominating checks
- bundle/close_permission_pda.ts:542 LAMPORT_WRITE nft_owner.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — nft_owner: not an identified account
  - [found] amount arithmetic checked — h + g (checked); nft_owner.lamports ← permission.key (validated)
  - [found] relevant checks on every path — 8 dominating checks
- bundle/close_permission_pda.ts:542 LAMPORT_WRITE admin.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — admin: not an identified account
  - [found] amount arithmetic checked — h + g (checked); admin.lamports ← permission.key (validated)
  - [found] relevant checks on every path — 8 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports ⇐ signer owner (found)
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports ⇐ signer owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/close_permission_pda.ts:542 LAMPORT_WRITE owner.lamports: `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 0`
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 0`
  - not required on some path: #5 (key, pda permission)
- bundle/close_permission_pda.ts:548 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 0`
- bundle/close_permission_pda.ts:542 LAMPORT_WRITE nft_owner.lamports: `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 0`
- bundle/close_permission_pda.ts:542 LAMPORT_WRITE admin.lamports: `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 0`

## Arithmetic on value paths

- bundle/close_permission_pda.ts:540 owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_permission_pda.ts:534)
- bundle/close_permission_pda.ts:540 nft_owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_permission_pda.ts:534)
- bundle/close_permission_pda.ts:540 admin.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_permission_pda.ts:534)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, permission_authority.key
- permission.key: validated (pda found @accounts_close_permission_pda:124, key found @accounts_close_permission_pda:124)
- permission.data: validated (owner found @accounts_close_permission_pda:88, discriminator found @accounts_close_permission_pda:88, initialized found @accounts_close_permission_pda:88)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/close_permission_pda.ts:100 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/close_permission_pda.ts:177 | found | permission | owner, initialized, discriminator (via try_accounts_18700 (count, owner, initialized, discriminator)) | `r == 0` | return |
| 2 | bundle/close_permission_pda.ts:209 | found | owner | writable | `m.is_writable == 0` | anchor::ConstraintMut |
| 3 | bundle/close_permission_pda.ts:213 | found | permission | key, pda | `!((memcmp(sa0, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != ` | anchor::ConstraintSeeds |
| 4 | bundle/close_permission_pda.ts:215 | found |  | key | `!((memcmp(s2b8, 0x100159640 /* key RayzVBPm6p6xtG7fU3KX4k44UexK4NjewDk2QCwoLqa */, 0x20) as u32) != ` | return |
| 5 | bundle/close_permission_pda.ts:252 | PARTIAL | permission | key, pda | `!((memcmp(s40, s80, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 6 | bundle/close_permission_pda.ts:253 | PARTIAL | permission | writable | `permission.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/close_permission_pda.ts:256 | PARTIAL |  | key, close | `(memcmp(s20, s2b8, 0x20) as u32) == 0` | anchor::ConstraintClose |
| 8 | entrypoint.ts:307 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 9 | entrypoint.ts:316 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 10 | entrypoint.ts:681 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
