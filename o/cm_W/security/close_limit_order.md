# close_limit_order

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_close_limit_order (anchor); 33 functions reachable: ix_close_limit_order, accounts_close_limit_order, memcpy, fn_551a8, fn_ee970, anchor_error_from, fn_181f8, fn_667d0, fn_13e190, fn_af28, fn_14d660, fn_125710, ….

## Findings (rule engine)

- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: signer (found) (fn_13e190:21)
- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: signer (found) (fn_13e190:21)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | signer | expected · found | — | — | — | — |
| 1 | rent_receiver | — | expected · found | — | — | PARTIAL |
| 2 | limit_order | — | expected · PARTIAL | found (+discriminator found) | — | — |

## Constraints per account

- signer: signer found (bundle/close_limit_order.ts:128 via try_accounts_17a30)
- rent_receiver: writable found (bundle/close_limit_order.ts:248); key PARTIAL (bundle/close_limit_order.ts:289); address PARTIAL (bundle/close_limit_order.ts:289)
- limit_order: owner found (bundle/close_limit_order.ts:203 via fn_181f8); initialized found (bundle/close_limit_order.ts:203 via fn_181f8); discriminator found (bundle/close_limit_order.ts:203 via fn_181f8); writable PARTIAL (bundle/close_limit_order.ts:285)

## Operations (account writes)

- bundle/close_limit_order.ts:1363 LAMPORT_WRITE owner.lamports += k [conditional]
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports = 0 [conditional]
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports = 0 [conditional]
- bundle/close_limit_order.ts:1363 LAMPORT_WRITE nft_owner.lamports += k [conditional]
- bundle/close_limit_order.ts:1363 LAMPORT_WRITE admin.lamports += k [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/close_limit_order.ts:1363 LAMPORT_WRITE: 7 dominating checks (signer signer; owner limit_order; initialized limit_order; discriminator limit_order; writable rent_receiver; custom; key; initialized; …)
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE: 7 dominating checks (signer signer; owner limit_order; initialized limit_order; discriminator limit_order; writable rent_receiver; custom; key; initialized; …)
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE: 7 dominating checks (signer signer; owner limit_order; initialized limit_order; discriminator limit_order; writable rent_receiver; custom; key; initialized; …)
- bundle/close_limit_order.ts:1363 LAMPORT_WRITE: 7 dominating checks (signer signer; owner limit_order; initialized limit_order; discriminator limit_order; writable rent_receiver; custom; key; initialized; …)
- bundle/close_limit_order.ts:1363 LAMPORT_WRITE: 7 dominating checks (signer signer; owner limit_order; initialized limit_order; discriminator limit_order; writable rent_receiver; custom; key; initialized; …)

## Authority (who enables each value movement / authority change)

- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE: signer signer (found)
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE: signer signer (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/close_limit_order.ts:1363 LAMPORT_WRITE owner.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — owner: not an identified account
  - [found] amount arithmetic checked — h + g (checked)
  - [found] relevant checks on every path — 8 dominating checks
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer signer (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 8 dominating checks
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer signer (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 8 dominating checks
- bundle/close_limit_order.ts:1363 LAMPORT_WRITE nft_owner.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — nft_owner: not an identified account
  - [found] amount arithmetic checked — h + g (checked)
  - [found] relevant checks on every path — 8 dominating checks
- bundle/close_limit_order.ts:1363 LAMPORT_WRITE admin.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — admin: not an identified account
  - [found] amount arithmetic checked — h + g (checked)
  - [found] relevant checks on every path — 8 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports ⇐ signer signer (found)
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports ⇐ signer signer (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/close_limit_order.ts:1363 LAMPORT_WRITE owner.lamports: `j == 0` · ✗ `f > f + h` · `u58 != -1` · `u54 != -1` · `u43 != -1` · `u39 != -1` · `ld64(s118 + 8) == 0` #6 · ✗ `g != 2` · ✗ `g == 2`
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u58 != -1` · `u54 != -1` · `u43 != -1` · `u39 != -1` · `ld64(s118 + 8) == 0` #6 · ✗ `g != 2` · ✗ `g == 2`
- bundle/close_limit_order.ts:1369 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u58 != -1` · `u54 != -1` · `u43 != -1` · `u39 != -1` · `ld64(s118 + 8) == 0` #6 · ✗ `g != 2` · ✗ `g == 2`
- bundle/close_limit_order.ts:1363 LAMPORT_WRITE nft_owner.lamports: `j == 0` · ✗ `f > f + h` · `u58 != -1` · `u54 != -1` · `u43 != -1` · `u39 != -1` · `ld64(s118 + 8) == 0` #6 · ✗ `g != 2` · ✗ `g == 2`
- bundle/close_limit_order.ts:1363 LAMPORT_WRITE admin.lamports: `j == 0` · ✗ `f > f + h` · `u58 != -1` · `u54 != -1` · `u43 != -1` · `u39 != -1` · `ld64(s118 + 8) == 0` #6 · ✗ `g != 2` · ✗ `g == 2`

## Arithmetic on value paths

- bundle/close_limit_order.ts:1361 owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_limit_order.ts:1355)
- bundle/close_limit_order.ts:1361 nft_owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_limit_order.ts:1355)
- bundle/close_limit_order.ts:1361 admin.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_limit_order.ts:1355)

## Relations (equalities the checks establish)

- rent_receiver.key == (constant address) (address, PARTIAL, bundle/close_limit_order.ts:289)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): signer.key, limit_order.key
- rent_receiver.key: partially-validated (address partial @accounts_close_limit_order:172, key partial @accounts_close_limit_order:172)
- limit_order.data: validated (owner found @accounts_close_limit_order:86, discriminator found @accounts_close_limit_order:86, initialized found @accounts_close_limit_order:86)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/close_limit_order.ts:128 | found | signer | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/close_limit_order.ts:203 | found | limit_order | owner, initialized, discriminator (via fn_181f8 (count, owner, initialized, discriminator)) | `r == 2` | return |
| 2 | bundle/close_limit_order.ts:248 | found | rent_receiver | writable | `!((z as u32) != 0)` | anchor::ConstraintMut |
| 3 | bundle/close_limit_order.ts:285 | PARTIAL | rent_receiver | writable | `limit_order.is_writable == 0` | anchor::ConstraintMut |
| 4 | bundle/close_limit_order.ts:289 | PARTIAL | rent_receiver | key, address | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 5 | bundle/close_limit_order.ts:326 | PARTIAL | limit_order | writable | `limit_order_2.is_writable == 0` | anchor::ConstraintMut |
| 6 | bundle/close_limit_order.ts:398 | found |  | custom | `!(ld64(s118 + 8) == 0)` | error::InvalidLimitOrderAmount |
| 7 | bundle/close_limit_order.ts:532 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 8 | bundle/close_limit_order.ts:1557 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 9 | bundle/close_limit_order.ts:1566 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 10 | bundle/close_limit_order.ts:1721 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
