# swap

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_swap (anchor); 116 functions reachable: ix_swap, accounts_swap, memcpy, fn_36bf8, fn_cc228, fn_147e78, fn_11f980, fn_147990, fn_83078, fn_139720, fn_149678, fn_14ef78, ….

## Findings (rule engine)

- [low] cpi-unchecked-program: CPI to an account-supplied program id with no dominating check against a known id. CPI: program *(b + 0x30) (id not a constant, and not compared with a known program id in this function), data r[..q] · a program account (token_program) is checked, but no check dominating this CPI compares its id (fn_13f4b8:71)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | token_program [str] | — | — | — | PARTIAL | PARTIAL |
| 1 | whirlpool [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 2 | token_owner_account_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 3 | token_vault_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 4 | token_owner_account_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 5 | tick_array_0 [str] | — | PARTIAL | — | — | — |
| 6 | tick_array_1 [str] | — | PARTIAL | — | — | — |
| 7 | tick_array_2 [str] | — | PARTIAL | — | — | — |
| 8 | oracle [str] | — | — | — | — | — |
| 9 | token_vault_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 10 | token_authority [str] | PARTIAL | — | — | — | — |
|  | authority [code] | PARTIAL | — | — | — | — |
|  | buffer [code] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |

## Constraints per account

- token_program: address PARTIAL (bundle/swap.ts:297 via fn_129a0); executable PARTIAL (bundle/swap.ts:297 via fn_129a0); key PARTIAL (bundle/swap.ts:456)
- whirlpool: owner PARTIAL (bundle/swap.ts:311 via try_accounts_11a48); initialized PARTIAL (bundle/swap.ts:311 via try_accounts_11a48); discriminator PARTIAL (bundle/swap.ts:311 via try_accounts_11a48); writable PARTIAL (bundle/swap.ts:459)
- token_owner_account_a: owner PARTIAL (bundle/swap.ts:327 via try_accounts_11f50); discriminator PARTIAL (bundle/swap.ts:327 via try_accounts_11f50); initialized PARTIAL (bundle/swap.ts:327 via try_accounts_11f50); state PARTIAL (bundle/swap.ts:469); writable PARTIAL (bundle/swap.ts:469); key PARTIAL (bundle/swap.ts:470); raw PARTIAL (bundle/swap.ts:470)
- token_vault_a: owner PARTIAL (bundle/swap.ts:342 via try_accounts_11f50); discriminator PARTIAL (bundle/swap.ts:342 via try_accounts_11f50); initialized PARTIAL (bundle/swap.ts:342 via try_accounts_11f50); writable PARTIAL (bundle/swap.ts:472); key PARTIAL (bundle/swap.ts:477); address PARTIAL (bundle/swap.ts:477)
- token_owner_account_b: owner PARTIAL (bundle/swap.ts:357 via try_accounts_11f50); discriminator PARTIAL (bundle/swap.ts:357 via try_accounts_11f50); initialized PARTIAL (bundle/swap.ts:357 via try_accounts_11f50); state PARTIAL (bundle/swap.ts:490); writable PARTIAL (bundle/swap.ts:490); raw PARTIAL (bundle/swap.ts:499)
- tick_array_0: count PARTIAL (bundle/swap.ts:379); writable PARTIAL (bundle/swap.ts:519)
- tick_array_1: writable PARTIAL (bundle/swap.ts:528)
- tick_array_2: writable PARTIAL (bundle/swap.ts:529)
- oracle: pda PARTIAL (bundle/swap.ts:540)
- token_vault_b: owner PARTIAL (bundle/swap.ts:373 via fn_20f8); discriminator PARTIAL (bundle/swap.ts:373 via fn_20f8); initialized PARTIAL (bundle/swap.ts:373 via fn_20f8); writable PARTIAL (bundle/swap.ts:501); key PARTIAL (bundle/swap.ts:506); address PARTIAL (bundle/swap.ts:506)
- token_authority: signer PARTIAL (bundle/swap.ts:309 via try_accounts_11718)
- authority: signer PARTIAL (shared.ts:15130 via try_accounts_11718); raw PARTIAL (shared.ts:15181)
- buffer: zero PARTIAL (shared.ts:15152); discriminator PARTIAL (shared.ts:15152); owner PARTIAL (shared.ts:15155 via fn_3e60); initialized PARTIAL (shared.ts:15155 via fn_3e60); writable PARTIAL (shared.ts:15166); rent_exempt PARTIAL (shared.ts:15225)

## CPIs

- shared.ts:17105 [conditional] TOKEN_PROGRAM (constant).Transfer — accounts source: *(ld64(b + 0x48)) w, destination: *(ld64(b + 0x78)) w, authority: *(ld64(b + 0xa8)) s — amount: c [ix data?] — PDA signer: (ld64(b + 0xd8))[..ld64(b + 0xe0)]
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/swap.ts:533 find_program_address(["oracle", *ba], program *(ld64(s5e8)))
- bundle/swap.ts:1973 find_program_address(["tick_array", *s20, ?], program *s188)
- compared with provided accounts: oracle PARTIAL

## Dominance (checks on every path to the operation; across calls)

- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE: 32 dominating checks (address token_program; executable token_program; signer token_authority; owner whirlpool; initialized whirlpool; discriminator whirlpool; owner token_owner_account_a; discriminator token_owner_account_a; …)
  - sources: amount ← instruction data (caller-controlled)
- entrypoint.ts:14045 CPI: 0 dominating checks
- shared.ts:20063 CPI: 32 dominating checks (address token_program; executable token_program; signer token_authority; owner whirlpool; initialized whirlpool; discriminator whirlpool; owner token_owner_account_a; discriminator token_owner_account_a; …)

## Authority (who enables each value movement / authority change)

- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE: signer token_authority (PARTIAL); signer authority (PARTIAL); pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer token_authority (partial); signer authority (partial); pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]
  - [found] signer related to a stored authority (or PDA signature) — PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [PARTIAL] amount arithmetic checked — amount ← instruction data (caller-controlled)
  - [found] relevant checks on every path — 33 dominating checks
- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 0 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ signer token_authority (PARTIAL)
- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ signer authority (PARTIAL)
- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer: ✗ `i == 0x8000000000000000` · `u62 != -1` · `u53 != -1` · `u45 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u13 != -1` · `u7 != -1` · `g == 2` · … 23 more
  - not required on some path: #45 (signer authority)
- entrypoint.ts:14045 CPI: no conditions found
  - not required on some path: #1 (signer token_authority); #45 (signer authority)
- shared.ts:20063 CPI: ✗ `i == 0x8000000000000000` · `u62 != -1` · `u53 != -1` · `u45 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u13 != -1` · `u7 != -1` · `g == 2` · … 23 more
  - not required on some path: #45 (signer authority)

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, PARTIAL, bundle/swap.ts:297)
- token_program.key == (constant address) (address, PARTIAL, bundle/swap.ts:456)
- token_vault_a.key == (constant address) (address, PARTIAL, bundle/swap.ts:477)
- token_vault_b.key == (constant address) (address, PARTIAL, bundle/swap.ts:506)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, token_owner_account_b.key, tick_array_0.key, tick_array_1.key, tick_array_2.key, token_authority.key, authority.key, buffer.key
- token_program.key: partially-validated (address partial @accounts_swap:12, key partial @accounts_swap:171)
- whirlpool.data: partially-validated (owner partial @accounts_swap:26, discriminator partial @accounts_swap:26, initialized partial @accounts_swap:26)
- token_owner_account_a.key: partially-validated (key partial @accounts_swap:185)
- token_owner_account_a.data: partially-validated (owner partial @accounts_swap:42, discriminator partial @accounts_swap:42, initialized partial @accounts_swap:42)
- token_vault_a.key: partially-validated (address partial @accounts_swap:192, key partial @accounts_swap:192)
- token_vault_a.data: partially-validated (owner partial @accounts_swap:57, discriminator partial @accounts_swap:57, initialized partial @accounts_swap:57)
- token_owner_account_b.data: partially-validated (owner partial @accounts_swap:72, discriminator partial @accounts_swap:72, initialized partial @accounts_swap:72)
- oracle.key: partially-validated (pda partial @accounts_swap:255)
- token_vault_b.key: partially-validated (address partial @accounts_swap:221, key partial @accounts_swap:221)
- token_vault_b.data: partially-validated (owner partial @accounts_swap:88, discriminator partial @accounts_swap:88, initialized partial @accounts_swap:88)
- buffer.data: partially-validated (owner partial @fn_11c9a8:39, discriminator partial @fn_11c9a8:36, initialized partial @fn_11c9a8:39)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/swap.ts:297 | PARTIAL | token_program | address, executable (via fn_129a0 (count, address, executable)) | `f != 2` | return |
| 1 | bundle/swap.ts:309 | PARTIAL | token_authority | signer (via try_accounts_11718 (count, signer)) | `g != 2` | return |
| 2 | bundle/swap.ts:311 | PARTIAL | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 3 | bundle/swap.ts:327 | PARTIAL | token_owner_account_a | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x70) == 2` | return |
| 4 | bundle/swap.ts:342 | PARTIAL | token_vault_a | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x70) == 2` | return |
| 5 | bundle/swap.ts:357 | PARTIAL | token_owner_account_b | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x70) == 2` | return |
| 6 | bundle/swap.ts:373 | PARTIAL | token_vault_b | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `r != 2` | return |
| 7 | bundle/swap.ts:379 | PARTIAL | tick_array_0 | count | `t == 0` | anchor::AccountNotEnoughKeys |
| 8 | bundle/swap.ts:456 | PARTIAL | token_program | key, address | `!((memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 9 | bundle/swap.ts:459 | PARTIAL | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 10 | bundle/swap.ts:469 | PARTIAL | token_owner_account_a | state, writable | `am.info.is_writable == 0` | anchor::ConstraintMut |
| 11 | bundle/swap.ts:470 | PARTIAL | token_owner_account_a | state, key, raw | `!((memcmp(am.mint, ak + 0x1a8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 12 | bundle/swap.ts:472 | PARTIAL | token_vault_a | writable | `token_vault_a.is_writable == 0` | anchor::ConstraintMut |
| 13 | bundle/swap.ts:477 | PARTIAL | token_vault_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 14 | bundle/swap.ts:490 | PARTIAL | token_owner_account_b | state, writable | `token_owner_account_b_box.info.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/swap.ts:499 | PARTIAL | token_owner_account_b | state, raw | `!((memcmp(token_owner_account_b_box.mint, ld64(s5f8) + 0x1e8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 16 | bundle/swap.ts:501 | PARTIAL | token_vault_b | writable | `token_vault_b.is_writable == 0` | anchor::ConstraintMut |
| 17 | bundle/swap.ts:506 | PARTIAL | token_vault_b | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 18 | bundle/swap.ts:519 | PARTIAL | tick_array_0 | writable | `ld8(ld64(s620) + 0x29) == 0` | anchor::ConstraintMut |
| 19 | bundle/swap.ts:528 | PARTIAL | tick_array_1 | writable | `!(ld8(ld64(s628) + 0x29) != 0)` | anchor::ConstraintMut |
| 20 | bundle/swap.ts:529 | PARTIAL | tick_array_2 | writable | `!(ld8(ld64(s630) + 0x29) != 0)` | anchor::ConstraintMut |
| 21 | bundle/swap.ts:540 | PARTIAL | oracle | pda | `z != 0` | anchor::ConstraintSeeds |
| 22 | bundle/swap.ts:992 | PARTIAL | whirlpool |  | `f != 2` | return |
| 23 | bundle/swap.ts:1000 | PARTIAL | token_owner_account_a | key | `(memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0` | return |
| 24 | bundle/swap.ts:1090 | PARTIAL | token_vault_b |  | `z != 0x800000000000001a /* Ok */` | return |
| 25 | bundle/swap.ts:1096 | PARTIAL | token_vault_b |  | `af != 2` | return |
| 26 | entrypoint.ts:438 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 27 | entrypoint.ts:447 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 28 | bundle/swap.ts:2177 | PARTIAL |  | key | `(memcmp(g, 0x100152180, 0x20) as u32) == 0 && fn_143248(c) != 0` | return |
| 29 | bundle/swap.ts:2183 | PARTIAL |  | owner | `(h as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 30 | bundle/swap.ts:2209 | PARTIAL |  | key | `(memcmp(x + 8, s60, 0x20) as u32) != 0` | abort |
| 31 | bundle/swap.ts:3100 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 32 | entrypoint.ts:13592 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 33 | bundle/swap.ts:3472 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 34 | bundle/swap.ts:3474 | PARTIAL |  | owner | `!((f as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 35 | bundle/swap.ts:3487 | PARTIAL |  | discriminator | `p != 0x38dac7e18ef6d811 /* account:DynamicTickArray */` | anchor::AccountDiscriminatorMismatch |
| 36 | bundle/swap.ts:3493 | PARTIAL |  | discriminator | `p == 0xbb42076ebebd6145 /* account:TickArray */` | anchor::AccountDiscriminatorMismatch |
| 37 | bundle/swap.ts:3770 | PARTIAL |  | key | `(memcmp(sa0, s20, 0x20) as u32) == 0` | return |
| 38 | shared.ts:14572 | PARTIAL | idl |  | `ap == 2` | return |
| 39 | shared.ts:14825 | PARTIAL | idl |  | `bh != 2` | return |
| 40 | shared.ts:14897 | PARTIAL | buffer |  | `bo != 2` | return |
| 41 | shared.ts:19308 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 42 | entrypoint.ts:497 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 43 | entrypoint.ts:506 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 44 | shared.ts:15123 | PARTIAL |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 45 | shared.ts:15130 | PARTIAL | authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 46 | shared.ts:15152 | PARTIAL | buffer | zero, discriminator | `!(ld8(t) == 0 && (ld8(t + 1) == 0 && (ld8(t + 2) == 0 && (ld8(t + 3) == 0 && (ld8(t + 4) == 0 && (ld` | anchor::ConstraintZero |
| 47 | shared.ts:15155 | PARTIAL | buffer | owner, initialized (via fn_3e60 (owner, initialized)) | `buffer == 0` | return |
| 48 | shared.ts:15166 | PARTIAL | buffer | writable | `buffer.is_writable == 0` | anchor::ConstraintMut |
| 49 | shared.ts:15181 | PARTIAL | authority | raw | `w == 0x800000000000001a /* Ok */` | anchor::ConstraintRaw |
| 50 | shared.ts:15225 | PARTIAL | buffer | rent_exempt | `ah > an` | anchor::ConstraintRentExempt |
| 51 | shared.ts:15235 | PARTIAL | authority | raw | `n == 0` | anchor::ConstraintRaw |
| 52 | entrypoint.ts:13631 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 53 | shared.ts:311 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 54 | shared.ts:320 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
