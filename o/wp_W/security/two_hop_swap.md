# two_hop_swap

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_two_hop_swap (anchor); 117 functions reachable: ix_two_hop_swap, accounts_two_hop_swap, memcpy, fn_386c8, fn_d12a0, fn_147e78, fn_11f980, fn_147990, fn_83078, fn_139720, fn_149678, fn_14ef78, ….

## Findings (rule engine)

- [low] cpi-unchecked-program: CPI to an account-supplied program id with no dominating check against a known id. CPI: program *(b + 0x30) (id not a constant, and not compared with a known program id in this function), data r[..q] · a program account (token_program) is checked, but no check dominating this CPI compares its id (fn_13f4b8:71)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | token_program [str] | — | — | — | PARTIAL | PARTIAL |
| 1 | whirlpool_one [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 2 | whirlpool_two [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 3 | token_owner_account_one_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 4 | token_vault_one_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 5 | tick_array_one_0 [str] | — | PARTIAL | — | — | — |
| 6 | tick_array_one_1 [str] | — | PARTIAL | — | — | — |
| 7 | tick_array_one_2 [str] | — | PARTIAL | — | — | — |
| 8 | tick_array_two_0 [str] | — | PARTIAL | — | — | — |
| 9 | tick_array_two_1 [str] | — | PARTIAL | — | — | — |
| 10 | tick_array_two_2 [str] | — | PARTIAL | — | — | — |
| 11 | oracle_one [str] | — | — | — | — | — |
| 12 | oracle_two [str] | — | — | — | — | — |
| 13 | token_owner_account_one_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 14 | token_vault_one_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 15 | token_owner_account_two_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 16 | token_vault_two_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 17 | token_owner_account_two_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 18 | token_vault_two_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 19 | token_authority [str] | PARTIAL | — | — | — | — |
|  | authority [code] | PARTIAL | — | — | — | — |
|  | buffer [code] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |

## Constraints per account

- token_program: address PARTIAL (bundle/two_hop_swap.ts:318 via fn_129a0); executable PARTIAL (bundle/two_hop_swap.ts:318 via fn_129a0); key PARTIAL (bundle/two_hop_swap.ts:582)
- whirlpool_one: owner PARTIAL (bundle/two_hop_swap.ts:332 via try_accounts_11a48); initialized PARTIAL (bundle/two_hop_swap.ts:332 via try_accounts_11a48); discriminator PARTIAL (bundle/two_hop_swap.ts:332 via try_accounts_11a48); writable PARTIAL (bundle/two_hop_swap.ts:584)
- whirlpool_two: owner PARTIAL (bundle/two_hop_swap.ts:348 via try_accounts_11a48); initialized PARTIAL (bundle/two_hop_swap.ts:348 via try_accounts_11a48); discriminator PARTIAL (bundle/two_hop_swap.ts:348 via try_accounts_11a48); writable PARTIAL (bundle/two_hop_swap.ts:593)
- token_owner_account_one_a: owner PARTIAL (bundle/two_hop_swap.ts:363 via try_accounts_11f50); discriminator PARTIAL (bundle/two_hop_swap.ts:363 via try_accounts_11f50); initialized PARTIAL (bundle/two_hop_swap.ts:363 via try_accounts_11f50); writable PARTIAL (bundle/two_hop_swap.ts:594); raw PARTIAL (bundle/two_hop_swap.ts:595)
- token_vault_one_a: owner PARTIAL (bundle/two_hop_swap.ts:378 via try_accounts_11f50); discriminator PARTIAL (bundle/two_hop_swap.ts:378 via try_accounts_11f50); initialized PARTIAL (bundle/two_hop_swap.ts:378 via try_accounts_11f50); state PARTIAL (bundle/two_hop_swap.ts:597); writable PARTIAL (bundle/two_hop_swap.ts:597); key PARTIAL (bundle/two_hop_swap.ts:602); address PARTIAL (bundle/two_hop_swap.ts:602)
- tick_array_one_0: count PARTIAL (bundle/two_hop_swap.ts:429); writable PARTIAL (bundle/two_hop_swap.ts:702)
- tick_array_one_1: writable PARTIAL (bundle/two_hop_swap.ts:711)
- tick_array_one_2: writable PARTIAL (bundle/two_hop_swap.ts:712)
- tick_array_two_0: writable PARTIAL (bundle/two_hop_swap.ts:713)
- tick_array_two_1: writable PARTIAL (bundle/two_hop_swap.ts:714)
- tick_array_two_2: writable PARTIAL (bundle/two_hop_swap.ts:715)
- oracle_one: key PARTIAL (bundle/two_hop_swap.ts:725); pda PARTIAL (bundle/two_hop_swap.ts:725)
- oracle_two: pda PARTIAL (bundle/two_hop_swap.ts:752)
- token_owner_account_one_b: owner PARTIAL (bundle/two_hop_swap.ts:394 via fn_20f8); discriminator PARTIAL (bundle/two_hop_swap.ts:394 via fn_20f8); initialized PARTIAL (bundle/two_hop_swap.ts:394 via fn_20f8); writable PARTIAL (bundle/two_hop_swap.ts:615); raw PARTIAL (bundle/two_hop_swap.ts:624)
- token_vault_one_b: owner PARTIAL (bundle/two_hop_swap.ts:399 via fn_20f8); discriminator PARTIAL (bundle/two_hop_swap.ts:399 via fn_20f8); initialized PARTIAL (bundle/two_hop_swap.ts:399 via fn_20f8); writable PARTIAL (bundle/two_hop_swap.ts:626); key PARTIAL (bundle/two_hop_swap.ts:631); address PARTIAL (bundle/two_hop_swap.ts:631)
- token_owner_account_two_a: owner PARTIAL (bundle/two_hop_swap.ts:404 via fn_20f8); discriminator PARTIAL (bundle/two_hop_swap.ts:404 via fn_20f8); initialized PARTIAL (bundle/two_hop_swap.ts:404 via fn_20f8); writable PARTIAL (bundle/two_hop_swap.ts:644); raw PARTIAL (bundle/two_hop_swap.ts:653); key PARTIAL (bundle/two_hop_swap.ts:1651)
- token_vault_two_a: owner PARTIAL (bundle/two_hop_swap.ts:409 via fn_20f8); discriminator PARTIAL (bundle/two_hop_swap.ts:409 via fn_20f8); initialized PARTIAL (bundle/two_hop_swap.ts:409 via fn_20f8); writable PARTIAL (bundle/two_hop_swap.ts:655); key PARTIAL (bundle/two_hop_swap.ts:660); address PARTIAL (bundle/two_hop_swap.ts:660)
- token_owner_account_two_b: owner PARTIAL (bundle/two_hop_swap.ts:414 via fn_20f8); discriminator PARTIAL (bundle/two_hop_swap.ts:414 via fn_20f8); initialized PARTIAL (bundle/two_hop_swap.ts:414 via fn_20f8); writable PARTIAL (bundle/two_hop_swap.ts:673); raw PARTIAL (bundle/two_hop_swap.ts:682)
- token_vault_two_b: owner PARTIAL (bundle/two_hop_swap.ts:419 via fn_20f8); discriminator PARTIAL (bundle/two_hop_swap.ts:419 via fn_20f8); initialized PARTIAL (bundle/two_hop_swap.ts:419 via fn_20f8); writable PARTIAL (bundle/two_hop_swap.ts:684); key PARTIAL (bundle/two_hop_swap.ts:689); address PARTIAL (bundle/two_hop_swap.ts:689)
- token_authority: signer PARTIAL (bundle/two_hop_swap.ts:330 via try_accounts_11718)
- authority: signer PARTIAL (shared.ts:15130 via try_accounts_11718); raw PARTIAL (shared.ts:15181)
- buffer: zero PARTIAL (shared.ts:15152); discriminator PARTIAL (shared.ts:15152); owner PARTIAL (shared.ts:15155 via fn_3e60); initialized PARTIAL (shared.ts:15155 via fn_3e60); writable PARTIAL (shared.ts:15166); rent_exempt PARTIAL (shared.ts:15225)

## CPIs

- shared.ts:17105 [conditional] TOKEN_PROGRAM (constant).Transfer — accounts source: *(ld64(b + 0x48)) w, destination: *(ld64(b + 0x78)) w, authority: *(ld64(b + 0xa8)) s — amount: c [ix data?] — PDA signer: (ld64(b + 0xd8))[..ld64(b + 0xe0)]
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/two_hop_swap.ts:719 find_program_address(["oracle", *cc], program *(ld64(s8a8)))
- bundle/two_hop_swap.ts:745 find_program_address(["oracle", *s2b0], program *(ld64(s8a8)))
- bundle/two_hop_swap.ts:2653 find_program_address(["tick_array", *s20, ?], program *s188)
- compared with provided accounts: oracle_one PARTIAL, oracle_two PARTIAL

## Dominance (checks on every path to the operation; across calls)

- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE: 51 dominating checks (address token_program; executable token_program; signer token_authority; owner whirlpool_one; initialized whirlpool_one; discriminator whirlpool_one; owner whirlpool_two; initialized whirlpool_two; …)
  - sources: amount ← instruction data (caller-controlled)
- entrypoint.ts:14045 CPI: 0 dominating checks
- shared.ts:20063 CPI: 51 dominating checks (address token_program; executable token_program; signer token_authority; owner whirlpool_one; initialized whirlpool_one; discriminator whirlpool_one; owner whirlpool_two; initialized whirlpool_two; …)

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
  - [found] relevant checks on every path — 52 dominating checks
- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 0 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ signer token_authority (PARTIAL)
- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ signer authority (PARTIAL)
- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:17105 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer: ✗ `i == 0x8000000000000000` · `u62 != -1` · `u53 != -1` · `u45 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u13 != -1` · `u7 != -1` · ✗ `g != 2` · … 30 more (budget reached)
  - not required on some path: #70 (signer authority)
- entrypoint.ts:14045 CPI: no conditions found
  - not required on some path: #1 (signer token_authority); #70 (signer authority)
- shared.ts:20063 CPI: ✗ `i == 0x8000000000000000` · `u62 != -1` · `u53 != -1` · `u45 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u13 != -1` · `u7 != -1` · ✗ `g != 2` · … 30 more (budget reached)
  - not required on some path: #70 (signer authority)

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, PARTIAL, bundle/two_hop_swap.ts:318)
- token_program.key == (constant address) (address, PARTIAL, bundle/two_hop_swap.ts:582)
- token_vault_one_a.key == (constant address) (address, PARTIAL, bundle/two_hop_swap.ts:602)
- token_vault_one_b.key == (constant address) (address, PARTIAL, bundle/two_hop_swap.ts:631)
- token_vault_two_a.key == (constant address) (address, PARTIAL, bundle/two_hop_swap.ts:660)
- token_vault_two_b.key == (constant address) (address, PARTIAL, bundle/two_hop_swap.ts:689)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool_one.key, whirlpool_two.key, token_owner_account_one_a.key, tick_array_one_0.key, tick_array_one_1.key, tick_array_one_2.key, tick_array_two_0.key, tick_array_two_1.key, tick_array_two_2.key, token_owner_account_one_b.key, token_owner_account_two_b.key, token_authority.key, authority.key, buffer.key
- token_program.key: partially-validated (address partial @accounts_two_hop_swap:12, key partial @accounts_two_hop_swap:276)
- whirlpool_one.data: partially-validated (owner partial @accounts_two_hop_swap:26, discriminator partial @accounts_two_hop_swap:26, initialized partial @accounts_two_hop_swap:26)
- whirlpool_two.data: partially-validated (owner partial @accounts_two_hop_swap:42, discriminator partial @accounts_two_hop_swap:42, initialized partial @accounts_two_hop_swap:42)
- token_owner_account_one_a.data: partially-validated (owner partial @accounts_two_hop_swap:57, discriminator partial @accounts_two_hop_swap:57, initialized partial @accounts_two_hop_swap:57)
- token_vault_one_a.key: partially-validated (address partial @accounts_two_hop_swap:296, key partial @accounts_two_hop_swap:296)
- token_vault_one_a.data: partially-validated (owner partial @accounts_two_hop_swap:72, discriminator partial @accounts_two_hop_swap:72, initialized partial @accounts_two_hop_swap:72)
- oracle_one.key: partially-validated (pda partial @accounts_two_hop_swap:419, key partial @accounts_two_hop_swap:419)
- oracle_two.key: partially-validated (pda partial @accounts_two_hop_swap:446)
- token_owner_account_one_b.data: partially-validated (owner partial @accounts_two_hop_swap:88, discriminator partial @accounts_two_hop_swap:88, initialized partial @accounts_two_hop_swap:88)
- token_vault_one_b.key: partially-validated (address partial @accounts_two_hop_swap:325, key partial @accounts_two_hop_swap:325)
- token_vault_one_b.data: partially-validated (owner partial @accounts_two_hop_swap:93, discriminator partial @accounts_two_hop_swap:93, initialized partial @accounts_two_hop_swap:93)
- token_owner_account_two_a.key: partially-validated (key partial @fn_d12a0:18)
- token_owner_account_two_a.data: partially-validated (owner partial @accounts_two_hop_swap:98, discriminator partial @accounts_two_hop_swap:98, initialized partial @accounts_two_hop_swap:98)
- token_vault_two_a.key: partially-validated (address partial @accounts_two_hop_swap:354, key partial @accounts_two_hop_swap:354)
- token_vault_two_a.data: partially-validated (owner partial @accounts_two_hop_swap:103, discriminator partial @accounts_two_hop_swap:103, initialized partial @accounts_two_hop_swap:103)
- token_owner_account_two_b.data: partially-validated (owner partial @accounts_two_hop_swap:108, discriminator partial @accounts_two_hop_swap:108, initialized partial @accounts_two_hop_swap:108)
- token_vault_two_b.key: partially-validated (address partial @accounts_two_hop_swap:383, key partial @accounts_two_hop_swap:383)
- token_vault_two_b.data: partially-validated (owner partial @accounts_two_hop_swap:113, discriminator partial @accounts_two_hop_swap:113, initialized partial @accounts_two_hop_swap:113)
- buffer.data: partially-validated (owner partial @fn_11c9a8:39, discriminator partial @fn_11c9a8:36, initialized partial @fn_11c9a8:39)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/two_hop_swap.ts:318 | PARTIAL | token_program | address, executable (via fn_129a0 (count, address, executable)) | `f != 2` | return |
| 1 | bundle/two_hop_swap.ts:330 | PARTIAL | token_authority | signer (via try_accounts_11718 (count, signer)) | `g != 2` | return |
| 2 | bundle/two_hop_swap.ts:332 | PARTIAL | whirlpool_one | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 3 | bundle/two_hop_swap.ts:348 | PARTIAL | whirlpool_two | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 4 | bundle/two_hop_swap.ts:363 | PARTIAL | token_owner_account_one_a | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x70) == 2` | return |
| 5 | bundle/two_hop_swap.ts:378 | PARTIAL | token_vault_one_a | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x70) == 2` | return |
| 6 | bundle/two_hop_swap.ts:394 | PARTIAL | token_owner_account_one_b | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `r != 2` | return |
| 7 | bundle/two_hop_swap.ts:399 | PARTIAL | token_vault_one_b | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `t != 2` | return |
| 8 | bundle/two_hop_swap.ts:404 | PARTIAL | token_owner_account_two_a | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `v != 2` | return |
| 9 | bundle/two_hop_swap.ts:409 | PARTIAL | token_vault_two_a | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `x != 2` | return |
| 10 | bundle/two_hop_swap.ts:414 | PARTIAL | token_owner_account_two_b | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `z != 2` | return |
| 11 | bundle/two_hop_swap.ts:419 | PARTIAL | token_vault_two_b | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `ab != 2` | return |
| 12 | bundle/two_hop_swap.ts:429 | PARTIAL | tick_array_one_0 | count | `ad == 0` | anchor::AccountNotEnoughKeys |
| 13 | bundle/two_hop_swap.ts:582 | PARTIAL | token_program | key, address | `!((memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 14 | bundle/two_hop_swap.ts:584 | PARTIAL | whirlpool_one | writable | `whirlpool_one.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/two_hop_swap.ts:593 | PARTIAL | whirlpool_two | writable | `!(ld8(ld64(ld64(s8c8)) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 16 | bundle/two_hop_swap.ts:594 | PARTIAL | token_owner_account_one_a | writable | `!(ld8(ld64(ld64(s8d0)) + 0x29) != 0)` | anchor::ConstraintMut |
| 17 | bundle/two_hop_swap.ts:595 | PARTIAL | token_owner_account_one_a | raw | `!((memcmp(ld64(s8d0) + 8, ld64(s8b8) + 0x1a8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 18 | bundle/two_hop_swap.ts:597 | PARTIAL | token_vault_one_a | state, writable | `token_vault_one_a.is_writable == 0` | anchor::ConstraintMut |
| 19 | bundle/two_hop_swap.ts:602 | PARTIAL | token_vault_one_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 20 | bundle/two_hop_swap.ts:615 | PARTIAL | token_owner_account_one_b | writable | `ld8(ld64(ld64(s8d8)) + 0x29) == 0` | anchor::ConstraintMut |
| 21 | bundle/two_hop_swap.ts:624 | PARTIAL | token_owner_account_one_b | raw | `!((memcmp(ld64(s8d8) + 8, ld64(s8b8) + 0x1e8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 22 | bundle/two_hop_swap.ts:626 | PARTIAL | token_vault_one_b | writable | `token_vault_one_b.is_writable == 0` | anchor::ConstraintMut |
| 23 | bundle/two_hop_swap.ts:631 | PARTIAL | token_vault_one_b | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 24 | bundle/two_hop_swap.ts:644 | PARTIAL | token_owner_account_two_a | writable | `ld8(ld64(ld64(s8e8)) + 0x29) == 0` | anchor::ConstraintMut |
| 25 | bundle/two_hop_swap.ts:653 | PARTIAL | token_owner_account_two_a | raw | `!((memcmp(ld64(s8e8) + 8, ld64(s8c8) + 0x1a8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 26 | bundle/two_hop_swap.ts:655 | PARTIAL | token_vault_two_a | writable | `token_vault_two_a.is_writable == 0` | anchor::ConstraintMut |
| 27 | bundle/two_hop_swap.ts:660 | PARTIAL | token_vault_two_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 28 | bundle/two_hop_swap.ts:673 | PARTIAL | token_owner_account_two_b | writable | `ld8(ld64(ld64(s8f8)) + 0x29) == 0` | anchor::ConstraintMut |
| 29 | bundle/two_hop_swap.ts:682 | PARTIAL | token_owner_account_two_b | raw | `!((memcmp(ld64(s8f8) + 8, ld64(s8c8) + 0x1e8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 30 | bundle/two_hop_swap.ts:684 | PARTIAL | token_vault_two_b | writable | `token_vault_two_b.is_writable == 0` | anchor::ConstraintMut |
| 31 | bundle/two_hop_swap.ts:689 | PARTIAL | token_vault_two_b | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 32 | bundle/two_hop_swap.ts:702 | PARTIAL | tick_array_one_0 | writable | `ld8(ld64(s908) + 0x29) == 0` | anchor::ConstraintMut |
| 33 | bundle/two_hop_swap.ts:711 | PARTIAL | tick_array_one_1 | writable | `!(ld8(ld64(s910) + 0x29) != 0)` | anchor::ConstraintMut |
| 34 | bundle/two_hop_swap.ts:712 | PARTIAL | tick_array_one_2 | writable | `!(ld8(ld64(s918) + 0x29) != 0)` | anchor::ConstraintMut |
| 35 | bundle/two_hop_swap.ts:713 | PARTIAL | tick_array_two_0 | writable | `!(ld8(ld64(s928) + 0x29) != 0)` | anchor::ConstraintMut |
| 36 | bundle/two_hop_swap.ts:714 | PARTIAL | tick_array_two_1 | writable | `!(ld8(ld64(s920) + 0x29) != 0)` | anchor::ConstraintMut |
| 37 | bundle/two_hop_swap.ts:715 | PARTIAL | tick_array_two_2 | writable | `!(ld8(ld64(s930) + 0x29) != 0)` | anchor::ConstraintMut |
| 38 | bundle/two_hop_swap.ts:725 | PARTIAL | oracle_one | key, pda | `(memcmp(s290, s310, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 39 | bundle/two_hop_swap.ts:752 | PARTIAL | oracle_two | pda | `aj != 0` | anchor::ConstraintSeeds |
| 40 | bundle/two_hop_swap.ts:1026 | PARTIAL |  | key | `(memcmp(s110, s78, 0x20) as u32) == 0` | return |
| 41 | bundle/two_hop_swap.ts:1037 | PARTIAL |  | key | `!((memcmp(s288, s268, 0x20) as u32) == 0)` | return |
| 42 | bundle/two_hop_swap.ts:1640 | PARTIAL | whirlpool_one |  | `f != 2` | return |
| 43 | bundle/two_hop_swap.ts:1649 | PARTIAL | whirlpool_two |  | `g != 2` | return |
| 44 | bundle/two_hop_swap.ts:1651 | PARTIAL | token_owner_account_two_a | key | `!((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0)` | return |
| 45 | bundle/two_hop_swap.ts:1675 | PARTIAL | token_owner_account_two_a | key | `!((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0)` | return |
| 46 | bundle/two_hop_swap.ts:1699 | PARTIAL | token_owner_account_two_a | key | `!((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0)` | return |
| 47 | bundle/two_hop_swap.ts:1723 | PARTIAL | token_owner_account_two_a | key | `!((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0)` | return |
| 48 | bundle/two_hop_swap.ts:1748 | PARTIAL | token_owner_account_two_a |  | `n != 2` | return |
| 49 | bundle/two_hop_swap.ts:1751 | PARTIAL | token_vault_two_a |  | `o != 2` | return |
| 50 | bundle/two_hop_swap.ts:1757 | PARTIAL | token_vault_two_b |  | `q != 2` | return |
| 51 | entrypoint.ts:438 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 52 | entrypoint.ts:447 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 53 | bundle/two_hop_swap.ts:2857 | PARTIAL |  | key | `(memcmp(g, 0x100152180, 0x20) as u32) == 0 && fn_143248(c) != 0` | return |
| 54 | bundle/two_hop_swap.ts:2863 | PARTIAL |  | owner | `(h as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 55 | bundle/two_hop_swap.ts:2889 | PARTIAL |  | key | `(memcmp(x + 8, s60, 0x20) as u32) != 0` | abort |
| 56 | bundle/two_hop_swap.ts:3805 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 57 | entrypoint.ts:13592 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 58 | bundle/two_hop_swap.ts:4217 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 59 | bundle/two_hop_swap.ts:4219 | PARTIAL |  | owner | `!((f as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 60 | bundle/two_hop_swap.ts:4232 | PARTIAL |  | discriminator | `p != 0x38dac7e18ef6d811 /* account:DynamicTickArray */` | anchor::AccountDiscriminatorMismatch |
| 61 | bundle/two_hop_swap.ts:4238 | PARTIAL |  | discriminator | `p == 0xbb42076ebebd6145 /* account:TickArray */` | anchor::AccountDiscriminatorMismatch |
| 62 | bundle/two_hop_swap.ts:4502 | PARTIAL |  | key | `(memcmp(sa0, s20, 0x20) as u32) == 0` | return |
| 63 | shared.ts:14572 | PARTIAL | idl |  | `ap == 2` | return |
| 64 | shared.ts:14825 | PARTIAL | idl |  | `bh != 2` | return |
| 65 | shared.ts:14897 | PARTIAL | buffer |  | `bo != 2` | return |
| 66 | shared.ts:19308 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 67 | entrypoint.ts:497 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 68 | entrypoint.ts:506 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 69 | shared.ts:15123 | PARTIAL |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 70 | shared.ts:15130 | PARTIAL | authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 71 | shared.ts:15152 | PARTIAL | buffer | zero, discriminator | `!(ld8(t) == 0 && (ld8(t + 1) == 0 && (ld8(t + 2) == 0 && (ld8(t + 3) == 0 && (ld8(t + 4) == 0 && (ld` | anchor::ConstraintZero |
| 72 | shared.ts:15155 | PARTIAL | buffer | owner, initialized (via fn_3e60 (owner, initialized)) | `buffer == 0` | return |
| 73 | shared.ts:15166 | PARTIAL | buffer | writable | `buffer.is_writable == 0` | anchor::ConstraintMut |
| 74 | shared.ts:15181 | PARTIAL | authority | raw | `w == 0x800000000000001a /* Ok */` | anchor::ConstraintRaw |
| 75 | shared.ts:15225 | PARTIAL | buffer | rent_exempt | `ah > an` | anchor::ConstraintRentExempt |
| 76 | shared.ts:15235 | PARTIAL | authority | raw | `n == 0` | anchor::ConstraintRaw |
| 77 | entrypoint.ts:13631 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 78 | shared.ts:311 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 79 | shared.ts:320 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
