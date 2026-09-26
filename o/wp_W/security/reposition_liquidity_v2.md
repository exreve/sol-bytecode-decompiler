# reposition_liquidity_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_reposition_liquidity_v2 (anchor); 111 functions reachable: ix_reposition_liquidity_v2, fn_2cb80, fn_11abf0, accounts_reposition_liquidity_v2, memcpy, fn_147990, fn_11f980, fn_139720, fn_149678, fn_118b0, fn_22210, fn_228d8, ….

Reached through function pointers / tables (conditional): fn_2cb80 (entrypoint table entry chosen by the discriminator).

## Findings (rule engine)

- [low] cpi-unchecked-program: CPI to an account-supplied program id with no dominating check against a known id. CPI: program *(b + 0x30) (id not a constant, and not compared with a known program id in this function), data r[..q] · a program account (token_program_a) is checked, but no check dominating this CPI compares its id (fn_13f4b8:71)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 1 | position [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 2 | token_mint_a [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 3 | token_mint_b [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 4 | existing_tick_array_lower [str] | — | PARTIAL | — | — | — |
| 5 | existing_tick_array_upper [str] | — | PARTIAL | — | — | — |
| 6 | new_tick_array_lower [str] | — | PARTIAL | — | — | — |
| 7 | new_tick_array_upper [str] | — | PARTIAL | — | — | — |
| 8 | token_program_a [str] | — | — | — | PARTIAL | PARTIAL |
| 9 | funder [str] | PARTIAL | PARTIAL | — | — | — |
| 10 | position_token_account [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | — |
| 11 | token_owner_account_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 12 | token_vault_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 13 | token_vault_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 14 | token_owner_account_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 15 | token_program_b [str] | — | — | — | PARTIAL | PARTIAL |
| 16 | system_program [str] | — | — | — | PARTIAL | PARTIAL |
| 17 | position_authority [str] | PARTIAL | — | — | — | — |
| 18 | memo_program [str] | — | — | — | PARTIAL | PARTIAL |

## Constraints per account

- whirlpool: owner PARTIAL (bundle/reposition_liquidity_v2.ts:246 via try_accounts_11a48); initialized PARTIAL (bundle/reposition_liquidity_v2.ts:246 via try_accounts_11a48); discriminator PARTIAL (bundle/reposition_liquidity_v2.ts:246 via try_accounts_11a48); writable PARTIAL (bundle/reposition_liquidity_v2.ts:447)
- position: owner PARTIAL (bundle/reposition_liquidity_v2.ts:286 via try_accounts_11b00); initialized PARTIAL (bundle/reposition_liquidity_v2.ts:286 via try_accounts_11b00); discriminator PARTIAL (bundle/reposition_liquidity_v2.ts:286 via try_accounts_11b00); writable PARTIAL (bundle/reposition_liquidity_v2.ts:500); key PARTIAL (bundle/reposition_liquidity_v2.ts:504); has_one PARTIAL (bundle/reposition_liquidity_v2.ts:504)
- token_mint_a: owner PARTIAL (bundle/reposition_liquidity_v2.ts:308 via try_accounts_610); discriminator PARTIAL (bundle/reposition_liquidity_v2.ts:308 via try_accounts_610); initialized PARTIAL (bundle/reposition_liquidity_v2.ts:308 via try_accounts_610); key PARTIAL (bundle/reposition_liquidity_v2.ts:533); address PARTIAL (bundle/reposition_liquidity_v2.ts:533)
- token_mint_b: owner PARTIAL (bundle/reposition_liquidity_v2.ts:324 via try_accounts_610); discriminator PARTIAL (bundle/reposition_liquidity_v2.ts:324 via try_accounts_610); initialized PARTIAL (bundle/reposition_liquidity_v2.ts:324 via try_accounts_610); key PARTIAL (bundle/reposition_liquidity_v2.ts:537); address PARTIAL (bundle/reposition_liquidity_v2.ts:537)
- existing_tick_array_lower: count PARTIAL (bundle/reposition_liquidity_v2.ts:363); writable PARTIAL (bundle/reposition_liquidity_v2.ts:561)
- existing_tick_array_upper: writable PARTIAL (bundle/reposition_liquidity_v2.ts:562)
- new_tick_array_lower: writable PARTIAL (bundle/reposition_liquidity_v2.ts:563)
- new_tick_array_upper: writable PARTIAL (bundle/reposition_liquidity_v2.ts:564)
- token_program_a: address PARTIAL (bundle/reposition_liquidity_v2.ts:260 via try_accounts_120); executable PARTIAL (bundle/reposition_liquidity_v2.ts:260 via try_accounts_120); key PARTIAL (bundle/reposition_liquidity_v2.ts:466)
- funder: signer PARTIAL (bundle/reposition_liquidity_v2.ts:280 via try_accounts_11718); writable PARTIAL (bundle/reposition_liquidity_v2.ts:490)
- position_token_account: owner PARTIAL (bundle/reposition_liquidity_v2.ts:304 via fn_2258); discriminator PARTIAL (bundle/reposition_liquidity_v2.ts:304 via fn_2258); initialized PARTIAL (bundle/reposition_liquidity_v2.ts:304 via fn_2258); raw PARTIAL (bundle/reposition_liquidity_v2.ts:519)
- token_owner_account_a: owner PARTIAL (bundle/reposition_liquidity_v2.ts:342 via fn_2258); discriminator PARTIAL (bundle/reposition_liquidity_v2.ts:342 via fn_2258); initialized PARTIAL (bundle/reposition_liquidity_v2.ts:342 via fn_2258); writable PARTIAL (bundle/reposition_liquidity_v2.ts:538); raw PARTIAL (bundle/reposition_liquidity_v2.ts:548)
- token_vault_b: owner PARTIAL (bundle/reposition_liquidity_v2.ts:357 via fn_2258); discriminator PARTIAL (bundle/reposition_liquidity_v2.ts:357 via fn_2258); initialized PARTIAL (bundle/reposition_liquidity_v2.ts:357 via fn_2258); writable PARTIAL (bundle/reposition_liquidity_v2.ts:557); key PARTIAL (bundle/reposition_liquidity_v2.ts:560); raw PARTIAL (bundle/reposition_liquidity_v2.ts:560)
- token_vault_a: owner PARTIAL (bundle/reposition_liquidity_v2.ts:352 via fn_2258); discriminator PARTIAL (bundle/reposition_liquidity_v2.ts:352 via fn_2258); initialized PARTIAL (bundle/reposition_liquidity_v2.ts:352 via fn_2258); writable PARTIAL (bundle/reposition_liquidity_v2.ts:552); key PARTIAL (bundle/reposition_liquidity_v2.ts:555); raw PARTIAL (bundle/reposition_liquidity_v2.ts:555)
- token_owner_account_b: owner PARTIAL (bundle/reposition_liquidity_v2.ts:347 via fn_2258); discriminator PARTIAL (bundle/reposition_liquidity_v2.ts:347 via fn_2258); initialized PARTIAL (bundle/reposition_liquidity_v2.ts:347 via fn_2258); writable PARTIAL (bundle/reposition_liquidity_v2.ts:549); raw PARTIAL (bundle/reposition_liquidity_v2.ts:550)
- token_program_b: address PARTIAL (bundle/reposition_liquidity_v2.ts:265 via try_accounts_120); executable PARTIAL (bundle/reposition_liquidity_v2.ts:265 via try_accounts_120); key PARTIAL (bundle/reposition_liquidity_v2.ts:489)
- system_program: address PARTIAL (bundle/reposition_liquidity_v2.ts:446 via fn_122e8); executable PARTIAL (bundle/reposition_liquidity_v2.ts:446 via fn_122e8)
- position_authority: signer PARTIAL (bundle/reposition_liquidity_v2.ts:275 via try_accounts_11718)
- memo_program: address PARTIAL (bundle/reposition_liquidity_v2.ts:270 via fn_12758); executable PARTIAL (bundle/reposition_liquidity_v2.ts:270 via fn_12758)

## CPIs

- entrypoint.ts:3163 [conditional] t + 8 (account-supplied; (id not a constant, and not compared with a known program id in this function)).Transfer — accounts from: k.key w s, to: g.key w — lamports: ?
- entrypoint.ts:4077 [conditional] *(w + 8) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- entrypoint.ts:4258 [conditional] *(ac + 8) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- entrypoint.ts:1372 [conditional] *(ak + 8) (account-supplied; (id not a constant, and not compared with a known program id in this function)).TransferChecked — amount: ld64(a + 0x38), decimals: ld8(a + 0x40)
- entrypoint.ts:1263 [conditional] q + 8 (account-supplied; (id not a constant, and not compared with a known program id in this function)).TransferChecked — accounts source: i.key w, mint: h.key, destination: g.key w, authority: f.key s — amount: ld64(a + 0x28), decimals: ld8(a + 0x30) — PDA signer: b[..c]
- entrypoint.ts:1170 [conditional] *(g + 8) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:3163 LAMPORT_TRANSFER: 30 dominating checks (writable; address; owner; discriminator; initialized)
- entrypoint.ts:4077 CPI: 30 dominating checks (writable; address; owner; discriminator; initialized)
- entrypoint.ts:4258 CPI: 30 dominating checks (writable; address; owner; discriminator; initialized)
- entrypoint.ts:1372 TOKEN_TRANSFER: 31 dominating checks (writable; address; owner; discriminator; initialized; key)
- entrypoint.ts:1263 TOKEN_TRANSFER, PDA_SIGNATURE: 30 dominating checks (writable; address; owner; discriminator; initialized)
- entrypoint.ts:1170 CPI: 30 dominating checks (writable; address; owner; discriminator; initialized)
- entrypoint.ts:14045 CPI: 0 dominating checks

## Authority (who enables each value movement / authority change)

- entrypoint.ts:3163 LAMPORT_TRANSFER: signer funder (PARTIAL); signer position_authority (PARTIAL)
- entrypoint.ts:1372 TOKEN_TRANSFER: signer funder (PARTIAL); signer position_authority (PARTIAL)
- entrypoint.ts:1263 TOKEN_TRANSFER, PDA_SIGNATURE: signer funder (PARTIAL); signer position_authority (PARTIAL); pda PDA signature b[..c]

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:3163 LAMPORT_TRANSFER t + 8.Transfer [LAMPORT_TRANSFER]
  - [NOT FOUND] debited account authorized (signer / PDA / owned by the program) — k: not an identified account
  - [PARTIAL] authorized (signer / PDA signature / stored authority) — signer funder (partial); signer position_authority (partial)
  - [NOT FOUND] recipient bound — g: not an identified account
  - [found] relevant checks on every path — 38 dominating checks
- entrypoint.ts:4077 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 38 dominating checks
- entrypoint.ts:4258 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 38 dominating checks
- entrypoint.ts:1372 TOKEN_TRANSFER *(ak + 8).TransferChecked [TOKEN_TRANSFER]
  - [PARTIAL] authorized (signer / PDA signature / stored authority) — signer funder (partial); signer position_authority (partial)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [NOT FOUND] token program id — (id not a constant, and not compared with a known program id in this function)
  - [found] relevant checks on every path — 39 dominating checks
- entrypoint.ts:1263 TOKEN_TRANSFER, PDA_SIGNATURE q + 8.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer funder (partial); signer position_authority (partial); pda PDA signature b[..c]
  - [found] signer related to a stored authority (or PDA signature) — PDA signature b[..c]
  - [NOT FOUND] source account bound — i: not an identified account
  - [NOT FOUND] destination bound (owner / mint / key) — g: not an identified account
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [NOT FOUND] token program id — (id not a constant, and not compared with a known program id in this function)
  - [found] relevant checks on every path — 38 dominating checks
- entrypoint.ts:1170 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 38 dominating checks
- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 0 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- entrypoint.ts:3163 LAMPORT_TRANSFER t + 8.Transfer ⇐ signer funder (PARTIAL)
- entrypoint.ts:3163 LAMPORT_TRANSFER t + 8.Transfer ⇐ signer position_authority (PARTIAL)
- entrypoint.ts:1372 TOKEN_TRANSFER *(ak + 8).TransferChecked ⇐ signer funder (PARTIAL)
- entrypoint.ts:1372 TOKEN_TRANSFER *(ak + 8).TransferChecked ⇐ signer position_authority (PARTIAL)
- entrypoint.ts:1263 TOKEN_TRANSFER, PDA_SIGNATURE q + 8.TransferChecked ⇐ signer funder (PARTIAL)
- entrypoint.ts:1263 TOKEN_TRANSFER, PDA_SIGNATURE q + 8.TransferChecked ⇐ signer position_authority (PARTIAL)
- entrypoint.ts:1263 TOKEN_TRANSFER, PDA_SIGNATURE q + 8.TransferChecked ⇐ pda PDA signature b[..c]

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:3163 LAMPORT_TRANSFER t + 8.Transfer: ✗ `0x248880 > h` · `0x3c5280 > h` · `f == 2` · ✗ `f != 2` · `ld64(s158) == 3` · ✗ `bt == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */` · ✗ `ld32(s158) != 0` · ✗ `ld8(ld64(s618 + 0x30) + 0x6c) == 2` · `ld64(s158) == 3` · `ld64(s158) == 3` · … 14 more
  - not required on some path: #24 (signer position_authority); #25 (signer funder)
- entrypoint.ts:4077 CPI: ✗ `ld32(s48) != 0` · ✗ `am == 0` · `j > 0xa6` · `h != 0` · ✗ `h == 0` · `p10 != 0` · ✗ `co == 2` · ✗ `cn == 2` · `ld64(s158) == 0` · `ld64(s158) == 3` · … 25 more
  - not required on some path: #24 (signer position_authority); #25 (signer funder)
- entrypoint.ts:4258 CPI: ✗ `ld32(s60) != 0` · ✗ `at == 0` · `i > 0xa6` · `(g & 7) != 0` · ✗ `(g & 8) == 0` · ✗ `p10 != 0` · ✗ `co == 2` · ✗ `cn == 2` · `ld64(s158) == 0` · `ld64(s158) == 3` · … 25 more
  - not required on some path: #24 (signer position_authority); #25 (signer funder)
- entrypoint.ts:1372 TOKEN_TRANSFER *(ak + 8).TransferChecked: ✗ `ld64(ah) == 0x8000000000000000` · ✗ `keyeq(k + 0x20, "11111111111111111111111111111111")` #90 · `h != 0` · ✗ `h == 0` · `p10 != 0` · ✗ `co == 2` · ✗ `cn == 2` · `ld64(s158) == 0` · `ld64(s158) == 3` · ✗ `ld64(s5a0 + 8) > bu` · … 24 more
  - not required on some path: #24 (signer position_authority); #25 (signer funder)
- entrypoint.ts:1263 TOKEN_TRANSFER, PDA_SIGNATURE q + 8.TransferChecked: `h != 0` · ✗ `h == 0` · `p10 != 0` · ✗ `co == 2` · ✗ `cn == 2` · `ld64(s158) == 0` · `ld64(s158) == 3` · ✗ `ld64(s5a0 + 8) > bu` · `ld64(s158) == 0` · ✗ `ld64(s5a0) > bu` · … 22 more
  - not required on some path: #24 (signer position_authority); #25 (signer funder)
- entrypoint.ts:1170 CPI: `ld8(o) != 0` · ✗ `o == 0` · ✗ `0xa7 > j` · ✗ `ld8(s60 + 0x20) == 2` · `(g & 7) != 0` · ✗ `(g & 8) == 0` · ✗ `p10 != 0` · ✗ `co == 2` · ✗ `cn == 2` · `ld64(s158) == 0` · … 26 more
  - not required on some path: #24 (signer position_authority); #25 (signer funder)
- entrypoint.ts:14045 CPI: no conditions found
  - not required on some path: #24 (signer position_authority); #25 (signer funder)

## Relations (equalities the checks establish)

- token_program_a.key == (constant address) (address, PARTIAL, bundle/reposition_liquidity_v2.ts:260)
- token_program_b.key == (constant address) (address, PARTIAL, bundle/reposition_liquidity_v2.ts:265)
- memo_program.key == (constant address) (address, PARTIAL, bundle/reposition_liquidity_v2.ts:270)
- system_program.key == (constant address) (address, PARTIAL, bundle/reposition_liquidity_v2.ts:446)
- token_program_a.key == (constant address) (address, PARTIAL, bundle/reposition_liquidity_v2.ts:466)
- token_program_b.key == (constant address) (address, PARTIAL, bundle/reposition_liquidity_v2.ts:489)
- position.whirlpool == whirlpool.key (field_eq, PARTIAL, bundle/reposition_liquidity_v2.ts:504)
- position.data == position_token_account.key (field_eq, PARTIAL, bundle/reposition_liquidity_v2.ts:519)
- token_mint_a.key == (constant address) (address, PARTIAL, bundle/reposition_liquidity_v2.ts:533)
- token_mint_b.key == (constant address) (address, PARTIAL, bundle/reposition_liquidity_v2.ts:537)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, existing_tick_array_lower.key, existing_tick_array_upper.key, new_tick_array_lower.key, new_tick_array_upper.key, funder.key, position_token_account.key, token_owner_account_a.key, token_owner_account_b.key, position_authority.key
- whirlpool.data: partially-validated (owner partial @accounts_reposition_liquidity_v2:13, discriminator partial @accounts_reposition_liquidity_v2:13, initialized partial @accounts_reposition_liquidity_v2:13)
- position.key: partially-validated (key partial @accounts_reposition_liquidity_v2:271, has_one partial @accounts_reposition_liquidity_v2:271)
- position.data: partially-validated (owner partial @accounts_reposition_liquidity_v2:53, discriminator partial @accounts_reposition_liquidity_v2:53, initialized partial @accounts_reposition_liquidity_v2:53)
- token_mint_a.key: partially-validated (address partial @accounts_reposition_liquidity_v2:300, key partial @accounts_reposition_liquidity_v2:300)
- token_mint_a.data: partially-validated (owner partial @accounts_reposition_liquidity_v2:75, discriminator partial @accounts_reposition_liquidity_v2:75, initialized partial @accounts_reposition_liquidity_v2:75)
- token_mint_b.key: partially-validated (address partial @accounts_reposition_liquidity_v2:304, key partial @accounts_reposition_liquidity_v2:304)
- token_mint_b.data: partially-validated (owner partial @accounts_reposition_liquidity_v2:91, discriminator partial @accounts_reposition_liquidity_v2:91, initialized partial @accounts_reposition_liquidity_v2:91)
- token_program_a.key: partially-validated (address partial @accounts_reposition_liquidity_v2:27, key partial @accounts_reposition_liquidity_v2:233)
- position_token_account.data: partially-validated (owner partial @accounts_reposition_liquidity_v2:71, discriminator partial @accounts_reposition_liquidity_v2:71, initialized partial @accounts_reposition_liquidity_v2:71)
- token_owner_account_a.data: partially-validated (owner partial @accounts_reposition_liquidity_v2:109, discriminator partial @accounts_reposition_liquidity_v2:109, initialized partial @accounts_reposition_liquidity_v2:109)
- token_vault_b.key: partially-validated (key partial @accounts_reposition_liquidity_v2:327)
- token_vault_b.data: partially-validated (owner partial @accounts_reposition_liquidity_v2:124, discriminator partial @accounts_reposition_liquidity_v2:124, initialized partial @accounts_reposition_liquidity_v2:124)
- token_vault_a.key: partially-validated (key partial @accounts_reposition_liquidity_v2:322)
- token_vault_a.data: partially-validated (owner partial @accounts_reposition_liquidity_v2:119, discriminator partial @accounts_reposition_liquidity_v2:119, initialized partial @accounts_reposition_liquidity_v2:119)
- token_owner_account_b.data: partially-validated (owner partial @accounts_reposition_liquidity_v2:114, discriminator partial @accounts_reposition_liquidity_v2:114, initialized partial @accounts_reposition_liquidity_v2:114)
- token_program_b.key: partially-validated (address partial @accounts_reposition_liquidity_v2:32, key partial @accounts_reposition_liquidity_v2:256)
- system_program.key: partially-validated (address partial @accounts_reposition_liquidity_v2:213)
- memo_program.key: partially-validated (address partial @accounts_reposition_liquidity_v2:37)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | entrypoint.ts:9653 | PARTIAL |  | count | `c == 0` | anchor::AccountNotEnoughKeys |
| 1 | entrypoint.ts:9664 | PARTIAL |  | writable | `ld8(ld64(h) + 2) == 0` | anchor::AccountNotMutable |
| 2 | entrypoint.ts:9787 | PARTIAL |  | address | `y == 0` | anchor::InvalidProgramId |
| 3 | entrypoint.ts:9865 | PARTIAL |  | writable | `ld8(ld64(ah) + 2) == 0` | anchor::AccountNotMutable |
| 4 | entrypoint.ts:9942 | PARTIAL |  | writable | `ld8(ld64(ah) + 2) == 0` | anchor::AccountNotMutable |
| 5 | entrypoint.ts:9954 | PARTIAL |  | count | `aj >= c` | anchor::AccountNotEnoughKeys |
| 6 | entrypoint.ts:9970 | PARTIAL |  | writable | `ld8(ld64(ah) + 2) == 0` | anchor::AccountNotMutable |
| 7 | entrypoint.ts:9997 | PARTIAL |  | writable | `ld8(ld64(ah) + 2) == 0` | anchor::AccountNotMutable |
| 8 | entrypoint.ts:10009 | PARTIAL |  | count | `ld64(s618 + 0x68) >= c` | anchor::AccountNotEnoughKeys |
| 9 | entrypoint.ts:10024 | PARTIAL |  | writable | `ld8(ld64(ah) + 2) == 0` | anchor::AccountNotMutable |
| 10 | entrypoint.ts:10036 | PARTIAL |  | count | `ld64(s618 + 0x68) >= c` | anchor::AccountNotEnoughKeys |
| 11 | entrypoint.ts:10051 | PARTIAL |  | writable | `ld8(ld64(ah) + 2) == 0` | anchor::AccountNotMutable |
| 12 | entrypoint.ts:10063 | PARTIAL |  | count | `ld64(s618 + 0x68) >= c` | anchor::AccountNotEnoughKeys |
| 13 | entrypoint.ts:10078 | PARTIAL |  | writable | `ld8(ld64(ah) + 2) == 0` | anchor::AccountNotMutable |
| 14 | entrypoint.ts:10090 | PARTIAL |  | count | `ld64(s618 + 0x68) >= c` | anchor::AccountNotEnoughKeys |
| 15 | entrypoint.ts:10106 | PARTIAL |  | writable | `ld8(ld64(ap) + 2) == 0` | anchor::AccountNotMutable |
| 16 | entrypoint.ts:10118 | PARTIAL |  | count | `ld64(s618 + 0x68) >= c` | anchor::AccountNotEnoughKeys |
| 17 | entrypoint.ts:10135 | PARTIAL |  | writable | `ld8(ld64(ld64(s628)) + 2) == 0` | anchor::AccountNotMutable |
| 18 | entrypoint.ts:10147 | PARTIAL |  | count | `ld64(s618 + 0x68) >= c` | anchor::AccountNotEnoughKeys |
| 19 | entrypoint.ts:10163 | PARTIAL |  | address | `au == 0` | anchor::InvalidProgramId |
| 20 | bundle/reposition_liquidity_v2.ts:246 | PARTIAL | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `whirlpool == 0` | return |
| 21 | bundle/reposition_liquidity_v2.ts:260 | PARTIAL | token_program_a | address, executable (via try_accounts_120 (count, address, executable)) | `j != 2` | return |
| 22 | bundle/reposition_liquidity_v2.ts:265 | PARTIAL | token_program_b | address, executable (via try_accounts_120 (count, address, executable)) | `k != 2` | return |
| 23 | bundle/reposition_liquidity_v2.ts:270 | PARTIAL | memo_program | address, executable (via fn_12758 (count, address, executable)) | `m != 2` | return |
| 24 | bundle/reposition_liquidity_v2.ts:275 | PARTIAL | position_authority | signer (via try_accounts_11718 (count, signer)) | `o != 2` | return |
| 25 | bundle/reposition_liquidity_v2.ts:280 | PARTIAL | funder | signer (via try_accounts_11718 (count, signer)) | `q != 2` | return |
| 26 | bundle/reposition_liquidity_v2.ts:286 | PARTIAL | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `s == 0` | return |
| 27 | bundle/reposition_liquidity_v2.ts:304 | PARTIAL | position_token_account | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `v != 2` | return |
| 28 | bundle/reposition_liquidity_v2.ts:308 | PARTIAL | token_mint_a | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `x == 2` | return |
| 29 | bundle/reposition_liquidity_v2.ts:324 | PARTIAL | token_mint_b | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `ad == 2` | return |
| 30 | bundle/reposition_liquidity_v2.ts:342 | PARTIAL | token_owner_account_a | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ae != 2` | return |
| 31 | bundle/reposition_liquidity_v2.ts:347 | PARTIAL | token_owner_account_b | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ag != 2` | return |
| 32 | bundle/reposition_liquidity_v2.ts:352 | PARTIAL | token_vault_a | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ai != 2` | return |
| 33 | bundle/reposition_liquidity_v2.ts:357 | PARTIAL | token_vault_b | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ak != 2` | return |
| 34 | bundle/reposition_liquidity_v2.ts:363 | PARTIAL | existing_tick_array_lower | count | `am == 0` | anchor::AccountNotEnoughKeys |
| 35 | bundle/reposition_liquidity_v2.ts:446 | PARTIAL | system_program | address, executable (via fn_122e8 (count, address, executable)) | `ay != 2` | return |
| 36 | bundle/reposition_liquidity_v2.ts:447 | PARTIAL | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 37 | bundle/reposition_liquidity_v2.ts:466 | PARTIAL | token_program_a | key, address | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 38 | bundle/reposition_liquidity_v2.ts:489 | PARTIAL | token_program_b | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 39 | bundle/reposition_liquidity_v2.ts:490 | PARTIAL | funder | writable | `ld8(ld64(sbd0 + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 40 | bundle/reposition_liquidity_v2.ts:500 | PARTIAL | position | writable | `!(ld8(ld64(sba8 + 8) + 0x29) != 0)` | anchor::ConstraintMut |
| 41 | bundle/reposition_liquidity_v2.ts:504 | PARTIAL | position | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 42 | bundle/reposition_liquidity_v2.ts:519 | PARTIAL | position_token_account | raw | `!((memcmp(ld64(sba8) + 0x28, s1b0, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 43 | bundle/reposition_liquidity_v2.ts:520 | PARTIAL | position_token_account | raw | `ld64(ld64(sba8) + 0x68) != 1` | anchor::ConstraintRaw |
| 44 | bundle/reposition_liquidity_v2.ts:533 | PARTIAL | token_mint_a | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 45 | bundle/reposition_liquidity_v2.ts:537 | PARTIAL | token_mint_b | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 46 | bundle/reposition_liquidity_v2.ts:538 | PARTIAL | token_owner_account_a | writable | `ld8(ld64(ld64(sc00) + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 47 | bundle/reposition_liquidity_v2.ts:548 | PARTIAL | token_owner_account_a | raw | `!((memcmp(ld64(sc00) + 0x28, s550, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 48 | bundle/reposition_liquidity_v2.ts:549 | PARTIAL | token_owner_account_b | writable | `!(ld8(ld64(ld64(sc08) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 49 | bundle/reposition_liquidity_v2.ts:550 | PARTIAL | token_owner_account_b | raw | `!((memcmp(ld64(sc08) + 0x28, s510, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 50 | bundle/reposition_liquidity_v2.ts:552 | PARTIAL | token_vault_a | writable | `token_vault_a.is_writable == 0` | anchor::ConstraintMut |
| 51 | bundle/reposition_liquidity_v2.ts:555 | PARTIAL | token_vault_a | key, raw | `!((memcmp(s468, s530, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 52 | bundle/reposition_liquidity_v2.ts:557 | PARTIAL | token_vault_b | writable | `token_vault_b.is_writable == 0` | anchor::ConstraintMut |
| 53 | bundle/reposition_liquidity_v2.ts:560 | PARTIAL | token_vault_b | key, raw | `!((memcmp(s468, s4f0, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 54 | bundle/reposition_liquidity_v2.ts:561 | PARTIAL | existing_tick_array_lower | writable | `!(ld8(ld64(sc18) + 0x29) != 0)` | anchor::ConstraintMut |
| 55 | bundle/reposition_liquidity_v2.ts:562 | PARTIAL | existing_tick_array_upper | writable | `!(ld8(ld64(sc20) + 0x29) != 0)` | anchor::ConstraintMut |
| 56 | bundle/reposition_liquidity_v2.ts:563 | PARTIAL | new_tick_array_lower | writable | `!(ld8(ld64(sc30) + 0x29) != 0)` | anchor::ConstraintMut |
| 57 | bundle/reposition_liquidity_v2.ts:564 | PARTIAL | new_tick_array_upper | writable | `!(ld8(ld64(sc38) + 0x29) != 0)` | anchor::ConstraintMut |
| 58 | entrypoint.ts:5320 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 59 | entrypoint.ts:5328 | PARTIAL |  | owner | `ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 60 | entrypoint.ts:5336 | PARTIAL |  | owner | `ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 61 | entrypoint.ts:5344 | PARTIAL |  | owner | `!(ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */)` | anchor::AccountOwnedByWrongProgram |
| 62 | entrypoint.ts:5562 | PARTIAL |  | address | `f != ld64(c)` | anchor::ConstraintAddress |
| 63 | entrypoint.ts:5578 | PARTIAL |  | address | `!memeq(b + 0x10, c + 0x10, 0x10)` | anchor::ConstraintAddress |
| 64 | entrypoint.ts:5227 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 65 | entrypoint.ts:5235 | PARTIAL |  | owner | `ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 66 | entrypoint.ts:5243 | PARTIAL |  | owner | `ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 67 | entrypoint.ts:5251 | PARTIAL |  | owner | `!(ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */)` | anchor::AccountOwnedByWrongProgram |
| 68 | entrypoint.ts:5415 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 69 | entrypoint.ts:5423 | PARTIAL |  | owner | `ld64(b + 0x30) != 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 70 | entrypoint.ts:5431 | PARTIAL |  | owner | `ld64(b + 0x38) != 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 71 | entrypoint.ts:5450 | PARTIAL |  | owner | `f != 0xfc` | anchor::AccountOwnedByWrongProgram |
| 72 | entrypoint.ts:5458 | PARTIAL |  | owner | `ld64(b + 0x28) != 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 73 | entrypoint.ts:5466 | PARTIAL |  | owner | `ld64(b + 0x30) != 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 74 | entrypoint.ts:5474 | PARTIAL |  | owner | `ld64(b + 0x38) != 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 75 | entrypoint.ts:5494 | PARTIAL |  | discriminator | `h == 0x163` | anchor::AccountDiscriminatorMismatch |
| 76 | entrypoint.ts:5502 | PARTIAL |  | initialized | `0x6d > h` | anchor::AccountNotInitialized |
| 77 | entrypoint.ts:5528 | PARTIAL |  | discriminator | `h != 0xa5` | anchor::AccountDiscriminatorMismatch |
| 78 | entrypoint.ts:438 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 79 | entrypoint.ts:447 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 80 | bundle/reposition_liquidity_v2.ts:1050 | PARTIAL |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 81 | bundle/reposition_liquidity_v2.ts:1055 | PARTIAL |  | key, address | `(memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 82 | bundle/reposition_liquidity_v2.ts:1065 | PARTIAL | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 83 | entrypoint.ts:618 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 84 | entrypoint.ts:627 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 85 | entrypoint.ts:4880 | PARTIAL |  | writable | `!(ld8(b + 2) != 0)` | anchor::AccountNotMutable |
| 86 | entrypoint.ts:4881 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 87 | entrypoint.ts:4889 | PARTIAL |  | owner | `ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 88 | entrypoint.ts:4897 | PARTIAL |  | owner | `ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 89 | entrypoint.ts:4905 | PARTIAL |  | owner | `!(ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */)` | anchor::AccountOwnedByWrongProgram |
| 90 | entrypoint.ts:4095 | PARTIAL |  | key | `keyeq(k + 0x20, "11111111111111111111111111111111")` | return |
| 91 | entrypoint.ts:4371 | PARTIAL |  | key | `!(aw != 0 && !keyeq(ae + 0x20, "11111111111111111111111111111111"))` | anchor::InstructionFallbackNotFound |
| 92 | entrypoint.ts:13592 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 93 | entrypoint.ts:13514 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
