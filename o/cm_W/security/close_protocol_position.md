# close_protocol_position

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_close_protocol_position (anchor); 23 functions reachable: ix_close_protocol_position, accounts_close_protocol_position, fn_d36e0, anchor_error_from, fn_c400, memcpy, fn_13e190, fn_14d660, fn_125710, fn_110218, fn_13e628, fn_147a20, ….

## Look first

- ⚠ admin: address expected, no check found

## Findings (rule engine)

- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: admin (found) (fn_13e190:21)
- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: admin (found) (fn_13e190:21)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | admin | expected · found | expected · found | — | — | = GThUX1At… · expected · NOT FOUND |
| 1 | protocol_position | — | expected · found | found (+discriminator found) | — | — |

## Constraints per account

- admin: signer found (bundle/close_protocol_position.ts:96 via try_accounts_17a30); writable found (bundle/close_protocol_position.ts:168); key found (bundle/close_protocol_position.ts:171); address NOT FOUND
- protocol_position: owner found (bundle/close_protocol_position.ts:127 via try_accounts_18648); initialized found (bundle/close_protocol_position.ts:127 via try_accounts_18648); discriminator found (bundle/close_protocol_position.ts:127 via try_accounts_18648); writable found (bundle/close_protocol_position.ts:208)

## Operations (account writes)

- bundle/close_protocol_position.ts:485 LAMPORT_WRITE owner.lamports += k [conditional]
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports = 0 [conditional]
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports = 0 [conditional]
- bundle/close_protocol_position.ts:485 LAMPORT_WRITE nft_owner.lamports += k [conditional]
- bundle/close_protocol_position.ts:485 LAMPORT_WRITE admin.lamports += k [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/close_protocol_position.ts:485 LAMPORT_WRITE: 9 dominating checks (signer admin; owner protocol_position; initialized protocol_position; discriminator protocol_position; writable admin; key admin; writable protocol_position; close; …)
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE: 9 dominating checks (signer admin; owner protocol_position; initialized protocol_position; discriminator protocol_position; writable admin; key admin; writable protocol_position; close; …)
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE: 9 dominating checks (signer admin; owner protocol_position; initialized protocol_position; discriminator protocol_position; writable admin; key admin; writable protocol_position; close; …)
- bundle/close_protocol_position.ts:485 LAMPORT_WRITE: 9 dominating checks (signer admin; owner protocol_position; initialized protocol_position; discriminator protocol_position; writable admin; key admin; writable protocol_position; close; …)
- bundle/close_protocol_position.ts:485 LAMPORT_WRITE: 9 dominating checks (signer admin; owner protocol_position; initialized protocol_position; discriminator protocol_position; writable admin; key admin; writable protocol_position; close; …)

## Authority (who enables each value movement / authority change)

- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE: signer admin (found)
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE: signer admin (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/close_protocol_position.ts:485 LAMPORT_WRITE owner.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — owner: not an identified account
  - [found] amount arithmetic checked — h + g (checked)
  - [found] relevant checks on every path — 9 dominating checks
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer admin (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 9 dominating checks
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer admin (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 9 dominating checks
- bundle/close_protocol_position.ts:485 LAMPORT_WRITE nft_owner.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — nft_owner: not an identified account
  - [found] amount arithmetic checked — h + g (checked)
  - [found] relevant checks on every path — 9 dominating checks
- bundle/close_protocol_position.ts:485 LAMPORT_WRITE admin.lamports [LAMPORT_WRITE +=]
  - [found] recipient bound — admin: key found, signer found
  - [found] amount arithmetic checked — h + g (checked)
  - [found] relevant checks on every path — 9 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports ⇐ signer admin (found)
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports ⇐ signer admin (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/close_protocol_position.ts:485 LAMPORT_WRITE owner.lamports: `j == 0` · ✗ `f > f + h` · `u25 != -1` · `u21 != -1` · `u8 != -1` · `u4 != -1` · ✗ `ld64(s18) != 0`
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u25 != -1` · `u21 != -1` · `u8 != -1` · `u4 != -1` · ✗ `ld64(s18) != 0`
- bundle/close_protocol_position.ts:491 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u25 != -1` · `u21 != -1` · `u8 != -1` · `u4 != -1` · ✗ `ld64(s18) != 0`
- bundle/close_protocol_position.ts:485 LAMPORT_WRITE nft_owner.lamports: `j == 0` · ✗ `f > f + h` · `u25 != -1` · `u21 != -1` · `u8 != -1` · `u4 != -1` · ✗ `ld64(s18) != 0`
- bundle/close_protocol_position.ts:485 LAMPORT_WRITE admin.lamports: `j == 0` · ✗ `f > f + h` · `u25 != -1` · `u21 != -1` · `u8 != -1` · `u4 != -1` · ✗ `ld64(s18) != 0`

## Arithmetic on value paths

- bundle/close_protocol_position.ts:483 owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_protocol_position.ts:477)
- bundle/close_protocol_position.ts:483 nft_owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_protocol_position.ts:477)
- bundle/close_protocol_position.ts:483 admin.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_protocol_position.ts:477)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): protocol_position.key
- admin.key: validated (key found @accounts_close_protocol_position:84)
- protocol_position.data: validated (owner found @accounts_close_protocol_position:40, discriminator found @accounts_close_protocol_position:40, initialized found @accounts_close_protocol_position:40)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/close_protocol_position.ts:96 | found | admin | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/close_protocol_position.ts:127 | found | protocol_position | owner, initialized, discriminator (via try_accounts_18648 (count, owner, initialized, discriminator)) | `ld64(se8) == 0` | return |
| 2 | bundle/close_protocol_position.ts:168 | found | admin | writable | `m.is_writable == 0` | anchor::ConstraintMut |
| 3 | bundle/close_protocol_position.ts:171 | found | admin | key | `(memcmp(s128, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0` | return |
| 4 | bundle/close_protocol_position.ts:208 | found | protocol_position | writable | `o.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/close_protocol_position.ts:213 | found |  | close | `q == 0` | anchor::ConstraintClose |
| 6 | entrypoint.ts:367 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 7 | entrypoint.ts:376 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 8 | entrypoint.ts:807 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
