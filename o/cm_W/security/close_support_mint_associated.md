# close_support_mint_associated

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_close_support_mint_associated (anchor); 33 functions reachable: ix_close_support_mint_associated, accounts_close_support_mint_associated, memcpy, fn_dd130, anchor_error_from, fn_14b198, fn_14ed60, fn_153158, memset2, fn_14d660, fn_125710, fn_11e480, ….

## Look first

- ⚠ support_mint_associated: pda expected, no check found

## Findings (rule engine)

- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: owner (found) (fn_13e190:21)
- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: owner (found) (fn_13e190:21)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | expected · found | — | — | — |
| 1 | token_mint | — | — | found (+discriminator found) | — | — |
| 2 | support_mint_associated | — | expected · found | found (+discriminator found) | — | — |

## Constraints per account

- owner: signer found (bundle/close_support_mint_associated.ts:105 via try_accounts_17a30); writable found (bundle/close_support_mint_associated.ts:184)
- token_mint: owner found (bundle/close_support_mint_associated.ts:109 via try_accounts_15c0); discriminator found (bundle/close_support_mint_associated.ts:109 via try_accounts_15c0); initialized found (bundle/close_support_mint_associated.ts:109 via try_accounts_15c0); key found (bundle/close_support_mint_associated.ts:220)
- support_mint_associated: owner found (bundle/close_support_mint_associated.ts:150 via try_accounts_18590); initialized found (bundle/close_support_mint_associated.ts:150 via try_accounts_18590); discriminator found (bundle/close_support_mint_associated.ts:150 via try_accounts_18590); writable found (bundle/close_support_mint_associated.ts:232); pda NOT FOUND

## PDAs derived

- bundle/close_support_mint_associated.ts:224 find_program_address(["support_mint", *aj], program *b)
- compared with provided accounts: support_mint_associated NOT FOUND

## Operations (account writes)

- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE owner.lamports += k [conditional]
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports = 0 [conditional]
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports = 0 [conditional]
- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE nft_owner.lamports += k [conditional]
- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE admin.lamports += k [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE: 11 dominating checks (signer owner; owner token_mint; discriminator token_mint; initialized token_mint; owner support_mint_associated; initialized support_mint_associated; discriminator support_mint_associated; writable owner; …)
  - sources: owner.lamports ← support_mint_associated.key (caller-controlled)
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE: 11 dominating checks (signer owner; owner token_mint; discriminator token_mint; initialized token_mint; owner support_mint_associated; initialized support_mint_associated; discriminator support_mint_associated; writable owner; …)
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE: 11 dominating checks (signer owner; owner token_mint; discriminator token_mint; initialized token_mint; owner support_mint_associated; initialized support_mint_associated; discriminator support_mint_associated; writable owner; …)
- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE: 11 dominating checks (signer owner; owner token_mint; discriminator token_mint; initialized token_mint; owner support_mint_associated; initialized support_mint_associated; discriminator support_mint_associated; writable owner; …)
  - sources: nft_owner.lamports ← support_mint_associated.key (caller-controlled)
- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE: 11 dominating checks (signer owner; owner token_mint; discriminator token_mint; initialized token_mint; owner support_mint_associated; initialized support_mint_associated; discriminator support_mint_associated; writable owner; …)
  - sources: admin.lamports ← support_mint_associated.key (caller-controlled)

## Authority (who enables each value movement / authority change)

- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE: signer owner (found)
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE: signer owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE owner.lamports [LAMPORT_WRITE +=]
  - [found] recipient bound — owner: signer found
  - [found] amount arithmetic checked — h + g (checked); owner.lamports ← support_mint_associated.key (caller-controlled)
  - [found] relevant checks on every path — 11 dominating checks
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 11 dominating checks
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 11 dominating checks
- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE nft_owner.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — nft_owner: not an identified account
  - [found] amount arithmetic checked — h + g (checked); nft_owner.lamports ← support_mint_associated.key (caller-controlled)
  - [found] relevant checks on every path — 11 dominating checks
- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE admin.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — admin: not an identified account
  - [found] amount arithmetic checked — h + g (checked); admin.lamports ← support_mint_associated.key (caller-controlled)
  - [found] relevant checks on every path — 11 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports ⇐ signer owner (found)
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports ⇐ signer owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE owner.lamports: `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 2`
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 2`
- bundle/close_support_mint_associated.ts:579 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 2`
- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE nft_owner.lamports: `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 2`
- bundle/close_support_mint_associated.ts:573 LAMPORT_WRITE admin.lamports: `j == 0` · ✗ `f > f + h` · `u24 != -1` · `u20 != -1` · `u8 != -1` · `u4 != -1` · ✗ `g == 2`

## Arithmetic on value paths

- bundle/close_support_mint_associated.ts:571 owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_support_mint_associated.ts:565)
- bundle/close_support_mint_associated.ts:571 nft_owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_support_mint_associated.ts:565)
- bundle/close_support_mint_associated.ts:571 admin.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_support_mint_associated.ts:565)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, support_mint_associated.key
- token_mint.key: validated (key found @accounts_close_support_mint_associated:126)
- token_mint.data: validated (owner found @accounts_close_support_mint_associated:15, discriminator found @accounts_close_support_mint_associated:15, initialized found @accounts_close_support_mint_associated:15)
- support_mint_associated.data: validated (owner found @accounts_close_support_mint_associated:56, discriminator found @accounts_close_support_mint_associated:56, initialized found @accounts_close_support_mint_associated:56)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/close_support_mint_associated.ts:105 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/close_support_mint_associated.ts:109 | found | token_mint | owner, discriminator, initialized (via try_accounts_15c0 (count, owner, discriminator, initialized)) | `l == 2` | return |
| 2 | bundle/close_support_mint_associated.ts:150 | found | support_mint_associated | owner, initialized, discriminator (via try_accounts_18590 (count, owner, initialized, discriminator)) | `m == 0` | return |
| 3 | bundle/close_support_mint_associated.ts:184 | found | owner | writable | `k.is_writable == 0` | anchor::ConstraintMut |
| 4 | bundle/close_support_mint_associated.ts:190 | PARTIAL |  | key | `!((memcmp(s1d8, 0x100159420 /* key RayVyjyJQz9vAi126A4sGexKnSU1XeZaHTRcM1mZMPY */, 0x20) as u32) != ` | return |
| 5 | bundle/close_support_mint_associated.ts:220 | found | token_mint | key | `!((memcmp(ab, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) == 0)` | return |
| 6 | bundle/close_support_mint_associated.ts:231 | found |  | key, pda | `!((memcmp(s40, s80, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 7 | bundle/close_support_mint_associated.ts:232 | found | support_mint_associated | writable | `support_mint_associated.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/close_support_mint_associated.ts:235 | found |  | key, close | `(memcmp(s20, s1d8, 0x20) as u32) == 0` | anchor::ConstraintClose |
| 9 | entrypoint.ts:427 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 10 | entrypoint.ts:436 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 11 | shared.ts:23636 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
