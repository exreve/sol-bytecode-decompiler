# create_support_mint_associated

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_create_support_mint_associated (anchor); 47 functions reachable: ix_create_support_mint_associated, accounts_create_support_mint_associated, memcpy, fn_d24d0, anchor_error_from, fn_14b198, fn_14ed60, fn_153158, memset2, fn_14d660, fn_125710, fn_11e480, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | expected · PARTIAL | — | — | — |
| 1 | token_mint | — | — | found (+discriminator found) | — | — |
| 2 | support_mint_associated | — | expected · PARTIAL | — | — | — |
| 3 | system_program | — | — | — | found | = 11111111… · expected · found |

## Constraints per account

- owner: signer found (bundle/create_support_mint_associated.ts:130 via try_accounts_17a30); writable PARTIAL (bundle/create_support_mint_associated.ts:266)
- token_mint: owner found (bundle/create_support_mint_associated.ts:135 via try_accounts_15c0); discriminator found (bundle/create_support_mint_associated.ts:135 via try_accounts_15c0); initialized found (bundle/create_support_mint_associated.ts:135 via try_accounts_15c0)
- support_mint_associated: key found (bundle/create_support_mint_associated.ts:227); pda found (bundle/create_support_mint_associated.ts:227); writable PARTIAL (bundle/create_support_mint_associated.ts:243)
- system_program: address found (bundle/create_support_mint_associated.ts:202 via try_accounts_18870); executable found (bundle/create_support_mint_associated.ts:202 via try_accounts_18870)

## CPIs

- bundle/create_support_mint_associated.ts:715 [conditional] SYSTEM_PROGRAM (constant).Transfer — lamports: ld64(s350)
- bundle/create_support_mint_associated.ts:782 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: 0x69 — PDA signer: ? (1 seeds)
- bundle/create_support_mint_associated.ts:837 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ld64(ld64(ld64(s308 + 0x38) + 0x30)) — PDA signer: ? (1 seeds)
- bundle/create_support_mint_associated.ts:922 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — accounts from: ? s, to: ? — lamports: ld64(s308 + 0x30), 0x69, ld64(ld64(b + 0x30)) — PDA signer: ? (1 seeds)

## PDAs derived

- bundle/create_support_mint_associated.ts:219 find_program_address(["support_mint", *aa], program *(ld64(s3f8 + 0x10)))
- compared with provided accounts: support_mint_associated found

## Dominance (checks on every path to the operation; across calls)

- bundle/create_support_mint_associated.ts:715 LAMPORT_TRANSFER: 5 dominating checks (signer owner; owner token_mint; discriminator token_mint; initialized token_mint; address system_program; executable system_program; key support_mint_associated; pda support_mint_associated; …)
- bundle/create_support_mint_associated.ts:782 OWNER_ASSIGN, PDA_SIGNATURE: 5 dominating checks (signer owner; owner token_mint; discriminator token_mint; initialized token_mint; address system_program; executable system_program; key support_mint_associated; pda support_mint_associated; …)
- bundle/create_support_mint_associated.ts:837 OWNER_ASSIGN, PDA_SIGNATURE: 5 dominating checks (signer owner; owner token_mint; discriminator token_mint; initialized token_mint; address system_program; executable system_program; key support_mint_associated; pda support_mint_associated; …)
- bundle/create_support_mint_associated.ts:922 ACCOUNT_CREATE, PDA_SIGNATURE: 4 dominating checks (signer owner; owner token_mint; discriminator token_mint; initialized token_mint; address system_program; executable system_program; key support_mint_associated; pda support_mint_associated)

## Authority (who enables each value movement / authority change)

- bundle/create_support_mint_associated.ts:715 LAMPORT_TRANSFER: signer owner (found)
- bundle/create_support_mint_associated.ts:782 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)
- bundle/create_support_mint_associated.ts:837 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/create_support_mint_associated.ts:715 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [found] amount arithmetic checked — sat_sub(m, g) (saturating)
  - [found] relevant checks on every path — 6 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/create_support_mint_associated.ts:715 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer owner (found)
- bundle/create_support_mint_associated.ts:782 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_support_mint_associated.ts:782 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- bundle/create_support_mint_associated.ts:837 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_support_mint_associated.ts:837 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/create_support_mint_associated.ts:715 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `aw != -1` · `au != -1` · `u205 != -1` · `an != -1` · `u189 != -1` · `u56 != -1` · `m > g` · ✗ `(memcmp(s1a8, s188, 0x20) as u32) == 0` #9 · `g != 0` · `(memcmp(sd0, s118, 0x20) as u32) == 0` #4 · … 5 more
- bundle/create_support_mint_associated.ts:782 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u282 != -1` · `bm != -1` · `u265 != -1` · `bg != -1` · ✗ `(memcmp(s1a8, s188, 0x20) as u32) == 0` #9 · `g != 0` · `(memcmp(sd0, s118, 0x20) as u32) == 0` #4 · ✗ `ld64(s238) != 0` · `f == 2` #3 · ✗ `v == 0` #2 · … 2 more
- bundle/create_support_mint_associated.ts:837 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `cb != -1` · `bz != -1` · `u329 != -1` · `u325 != -1` · `af == 2` · `u282 != -1` · `bm != -1` · `u265 != -1` · `bg != -1` · ✗ `(memcmp(s1a8, s188, 0x20) as u32) == 0` #9 · … 7 more
- bundle/create_support_mint_associated.ts:922 ACCOUNT_CREATE, PDA_SIGNATURE SYSTEM_PROGRAM.CreateAccount: `u92 != -1` · `y != -1` · `u75 != -1` · `s != -1` · `u61 != -1` · `u21 != -1` · ✗ `g != 0` · `(memcmp(sd0, s118, 0x20) as u32) == 0` #4 · ✗ `ld64(s238) != 0` · `f == 2` #3 · … 3 more

## Arithmetic on value paths

- bundle/create_support_mint_associated.ts:686 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(m, g)`: saturating

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/create_support_mint_associated.ts:202)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, token_mint.key
- token_mint.data: validated (owner found @accounts_create_support_mint_associated:17, discriminator found @accounts_create_support_mint_associated:17, initialized found @accounts_create_support_mint_associated:17)
- support_mint_associated.key: validated (pda found @accounts_create_support_mint_associated:109, key found @accounts_create_support_mint_associated:109)
- system_program.key: validated (address found @accounts_create_support_mint_associated:84)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/create_support_mint_associated.ts:130 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/create_support_mint_associated.ts:135 | found | token_mint | owner, discriminator, initialized (via try_accounts_15c0 (count, owner, discriminator, initialized)) | `k == 2` | return |
| 2 | bundle/create_support_mint_associated.ts:186 | found |  | count | `v == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/create_support_mint_associated.ts:202 | found | system_program | address, executable (via try_accounts_18870 (count, address, executable)) | `f != 2` | return |
| 4 | bundle/create_support_mint_associated.ts:227 | found | support_mint_associated | key, pda | `!((memcmp(sd0, s118, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 5 | bundle/create_support_mint_associated.ts:243 | PARTIAL | support_mint_associated | writable | `support_mint_associated.is_writable == 0` | anchor::ConstraintMut |
| 6 | bundle/create_support_mint_associated.ts:264 | PARTIAL |  | rent_exempt | `aq == 0` | anchor::ConstraintRentExempt |
| 7 | bundle/create_support_mint_associated.ts:266 | PARTIAL | owner | writable | `owner.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/create_support_mint_associated.ts:271 | PARTIAL |  | key | `!((memcmp(s238, 0x100159420 /* key RayVyjyJQz9vAi126A4sGexKnSU1XeZaHTRcM1mZMPY */, 0x20) as u32) != ` | return |
| 9 | bundle/create_support_mint_associated.ts:618 | PARTIAL |  | key | `(memcmp(s1a8, s188, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 10 | bundle/create_support_mint_associated.ts:1123 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 11 | bundle/create_support_mint_associated.ts:1132 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
