# open_position

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_open_position (anchor); 69 functions reachable: ix_open_position, accounts_open_position, memcpy, fn_34000, fn_bc720, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_83078, fn_27d8, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | funder [str] | found | PARTIAL | — | — | — |
| 1 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 2 | rent [str] | — | — | — | — | found |
| 3 | position [str] | — | PARTIAL | PARTIAL | — | — |
| 4 | position_mint [str] | PARTIAL | PARTIAL | — | — | — |
| 5 | position_token_account [str] | — | PARTIAL | PARTIAL | — | — |
| 6 | token_program [str] | — | — | — | found | found |
| 7 | associated_token_program [str] | — | — | — | found | found |
| 8 | system_program [str] | — | — | — | found | found |
| 9 | owner [str] | — | — | — | — | — |

## Constraints per account

- funder: signer found (bundle/open_position.ts:200 via try_accounts_11718); writable PARTIAL (bundle/open_position.ts:531)
- whirlpool: owner found (bundle/open_position.ts:238 via try_accounts_11a48); initialized found (bundle/open_position.ts:238 via try_accounts_11a48); discriminator found (bundle/open_position.ts:238 via try_accounts_11a48)
- rent: address found (bundle/open_position.ts:265 via try_accounts_11990)
- position: key found (bundle/open_position.ts:302); pda found (bundle/open_position.ts:302); writable PARTIAL (bundle/open_position.ts:311); rent_exempt PARTIAL (bundle/open_position.ts:372); owner PARTIAL (bundle/open_position.ts:1270 via fn_4a30); initialized PARTIAL (bundle/open_position.ts:1270 via fn_4a30)
- position_mint: writable PARTIAL (bundle/open_position.ts:411); signer PARTIAL (bundle/open_position.ts:420); rent_exempt PARTIAL (bundle/open_position.ts:480)
- position_token_account: writable PARTIAL (bundle/open_position.ts:513); rent_exempt PARTIAL (bundle/open_position.ts:575); owner PARTIAL (bundle/open_position.ts:1783 via Account_try_from_unchecked); initialized PARTIAL (bundle/open_position.ts:1783 via Account_try_from_unchecked)
- token_program: address found (bundle/open_position.ts:254 via fn_129a0); executable found (bundle/open_position.ts:254 via fn_129a0); key PARTIAL (bundle/open_position.ts:589)
- associated_token_program: address found (bundle/open_position.ts:278 via fn_12510); executable found (bundle/open_position.ts:278 via fn_12510)
- system_program: address found (bundle/open_position.ts:259 via fn_122e8); executable found (bundle/open_position.ts:259 via fn_122e8)
- owner: count found (bundle/open_position.ts:211)

## CPIs

- shared.ts:20063 [conditional] program not decoded
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/open_position.ts:294 find_program_address(["position", *s338], program *(ld64(s408)))
- compared with provided accounts: position found

## Dominance (checks on every path to the operation; across calls)

- shared.ts:20063 CPI: 12 dominating checks (signer funder; owner whirlpool; initialized whirlpool; discriminator whirlpool; address token_program; executable token_program; address system_program; executable system_program; …)
- entrypoint.ts:14045 CPI: 24 dominating checks (signer funder; owner whirlpool; initialized whirlpool; discriminator whirlpool; address token_program; executable token_program; address system_program; executable system_program; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 28 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:20063 CPI: `bo != -1` · `bm != -1` · `bh != -1` · `bf != -1` · `u228 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s2c8, 0x20) as u32) == 0` #29 · `g != 0` · `(memcmp(s290, s390, 0x20) as u32) == 0` #10 · … 14 more
  - not required on some path: #14 (signer position_mint)
- entrypoint.ts:14045 CPI: `u122 != -1` · `u110 != -1` · `u104 != -1` · `u95 != -1` · `u89 != -1` · `u81 != -1` · `u77 != -1` · `u69 != -1` · ✗ `s == 0x8000000000000000` · `u42 != -1` · … 13 more

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/open_position.ts:254)
- system_program.key == (constant address) (address, found, bundle/open_position.ts:259)
- rent.key == (constant address) (address, found, bundle/open_position.ts:265)
- associated_token_program.key == (constant address) (address, found, bundle/open_position.ts:278)
- token_program.key == (constant address) (address, PARTIAL, bundle/open_position.ts:589)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): funder.key, whirlpool.key, position_mint.key, position_token_account.key, owner.key
- whirlpool.data: validated (owner found @accounts_open_position:49, discriminator found @accounts_open_position:49, initialized found @accounts_open_position:49)
- rent.key: validated (address found @accounts_open_position:76)
- position.key: validated (pda found @accounts_open_position:113, key found @accounts_open_position:113)
- position.data: partially-validated (owner partial @fn_b84b0:345, initialized partial @fn_b84b0:345)
- position_token_account.data: partially-validated (owner partial @fn_bba20:105, initialized partial @fn_bba20:105)
- token_program.key: validated (address found @accounts_open_position:65, key partial @accounts_open_position:400)
- associated_token_program.key: validated (address found @accounts_open_position:89)
- system_program.key: validated (address found @accounts_open_position:70)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/open_position.ts:200 | found | funder | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 1 | bundle/open_position.ts:211 | found | owner | count | `h == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/open_position.ts:217 | found |  | count | `m == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/open_position.ts:229 | found |  | count | `h == 2` | anchor::AccountNotEnoughKeys |
| 4 | bundle/open_position.ts:233 | found |  | count | `h == 3` | anchor::AccountNotEnoughKeys |
| 5 | bundle/open_position.ts:238 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 6 | bundle/open_position.ts:254 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `s != 2` | return |
| 7 | bundle/open_position.ts:259 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `u != 2` | return |
| 8 | bundle/open_position.ts:265 | found | rent | address (via try_accounts_11990 (count, address)) | `w == 0` | return |
| 9 | bundle/open_position.ts:278 | found | associated_token_program | address, executable (via fn_12510 (count, address, executable)) | `z != 2` | return |
| 10 | bundle/open_position.ts:302 | found | position | key, pda | `!((memcmp(s290, s390, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 11 | bundle/open_position.ts:311 | PARTIAL | position | writable | `position.is_writable == 0` | anchor::ConstraintMut |
| 12 | bundle/open_position.ts:372 | PARTIAL | position | rent_exempt | `bf > ld64(s6a0)` | anchor::ConstraintRentExempt |
| 13 | bundle/open_position.ts:411 | PARTIAL | position_mint | writable | `position_mint.is_writable == 0` | anchor::ConstraintMut |
| 14 | bundle/open_position.ts:420 | PARTIAL | position_mint | signer | `position_mint.is_signer == 0` | anchor::ConstraintSigner |
| 15 | bundle/open_position.ts:480 | PARTIAL | position_mint | rent_exempt | `ca > ld64(s6a0)` | anchor::ConstraintRentExempt |
| 16 | bundle/open_position.ts:513 | PARTIAL | position_token_account | writable | `position_token_account.is_writable == 0` | anchor::ConstraintMut |
| 17 | bundle/open_position.ts:531 | PARTIAL | funder | writable | `ch == 0x800000000000001a /* Ok */` | anchor::ConstraintMut |
| 18 | bundle/open_position.ts:575 | PARTIAL | position_token_account | rent_exempt | `cu > ld64(s6b8)` | anchor::ConstraintRentExempt |
| 19 | bundle/open_position.ts:585 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 20 | bundle/open_position.ts:589 | PARTIAL | token_program | key, address | `(memcmp(s2d8, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 21 | bundle/open_position.ts:733 | PARTIAL |  | key | `(memcmp(g + 0x148, 0x100152180, 0x20) as u32) == 0 && (ld16(g + 0xc8) & 1) != 0` | return |
| 22 | bundle/open_position.ts:853 | PARTIAL | position |  | `f != 2` | return |
| 23 | bundle/open_position.ts:903 | PARTIAL | position_token_account |  | `r != 0x800000000000001a /* Ok */` | return |
| 24 | bundle/open_position.ts:909 | PARTIAL | position_token_account |  | `t != 2` | return |
| 25 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 26 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 27 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 28 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 29 | bundle/open_position.ts:942 | PARTIAL |  | key | `(memcmp(s40, s2c8, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 30 | bundle/open_position.ts:1270 | PARTIAL | position | owner, initialized (via fn_4a30 (owner, initialized)) | `ld64(s118) == 0` | return |
| 31 | bundle/open_position.ts:1325 | PARTIAL |  | key | `(memcmp(s40, s268, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 32 | bundle/open_position.ts:1783 | PARTIAL | position_token_account | owner, initialized (via Account_try_from_unchecked (owner, initialized)) | `ld32(sb8 + 0x90) == 2` | return |
| 33 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 34 | bundle/open_position.ts:2444 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 35 | bundle/open_position.ts:2453 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 36 | ix/open_position_with_token_extensions.ts:1667 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 37 | bundle/open_position.ts:3168 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 38 | bundle/open_position.ts:3264 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
