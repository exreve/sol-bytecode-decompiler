# collect_protocol_fees

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_collect_protocol_fees (anchor); 40 functions reachable: ix_collect_protocol_fees, accounts_collect_protocol_fees, memcpy, fn_652d0, fn_90f88, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9900, fn_89e0, fn_83078, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 2 | token_vault_a [str] | — | found | found (+discriminator found) | — | found |
| 3 | token_vault_b [str] | — | found | found (+discriminator found) | — | found |
| 4 | token_destination_a [str] | — | found | found (+discriminator found) | — | — |
| 5 | token_destination_b [str] | — | found | found (+discriminator found) | — | — |
| 6 | token_program [str] | — | — | — | found | found |
| 7 | collect_protocol_fees_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/collect_protocol_fees.ts:127 via try_accounts_11de0); initialized found (bundle/collect_protocol_fees.ts:127 via try_accounts_11de0); discriminator found (bundle/collect_protocol_fees.ts:127 via try_accounts_11de0)
- whirlpool: owner found (bundle/collect_protocol_fees.ts:141 via try_accounts_11a48); initialized found (bundle/collect_protocol_fees.ts:141 via try_accounts_11a48); discriminator found (bundle/collect_protocol_fees.ts:141 via try_accounts_11a48); writable found (bundle/collect_protocol_fees.ts:237); key found (bundle/collect_protocol_fees.ts:249); has_one found (bundle/collect_protocol_fees.ts:249)
- token_vault_a: owner found (bundle/collect_protocol_fees.ts:163 via try_accounts_11f50); discriminator found (bundle/collect_protocol_fees.ts:163 via try_accounts_11f50); initialized found (bundle/collect_protocol_fees.ts:163 via try_accounts_11f50); writable found (bundle/collect_protocol_fees.ts:267); key found (bundle/collect_protocol_fees.ts:279); address found (bundle/collect_protocol_fees.ts:279)
- token_vault_b: owner found (bundle/collect_protocol_fees.ts:179 via try_accounts_11f50); discriminator found (bundle/collect_protocol_fees.ts:179 via try_accounts_11f50); initialized found (bundle/collect_protocol_fees.ts:179 via try_accounts_11f50); writable found (bundle/collect_protocol_fees.ts:293); key found (bundle/collect_protocol_fees.ts:305); address found (bundle/collect_protocol_fees.ts:305)
- token_destination_a: owner found (bundle/collect_protocol_fees.ts:197 via try_accounts_11f50); discriminator found (bundle/collect_protocol_fees.ts:197 via try_accounts_11f50); initialized found (bundle/collect_protocol_fees.ts:197 via try_accounts_11f50); writable found (bundle/collect_protocol_fees.ts:318); key found (bundle/collect_protocol_fees.ts:327); raw found (bundle/collect_protocol_fees.ts:327)
- token_destination_b: owner found (bundle/collect_protocol_fees.ts:218 via try_accounts_11f50); discriminator found (bundle/collect_protocol_fees.ts:218 via try_accounts_11f50); initialized found (bundle/collect_protocol_fees.ts:218 via try_accounts_11f50); writable found (bundle/collect_protocol_fees.ts:328); key found (bundle/collect_protocol_fees.ts:329); raw found (bundle/collect_protocol_fees.ts:329)
- token_program: address found (bundle/collect_protocol_fees.ts:236 via fn_129a0); executable found (bundle/collect_protocol_fees.ts:236 via fn_129a0); key found (bundle/collect_protocol_fees.ts:332)
- collect_protocol_fees_authority: signer found (bundle/collect_protocol_fees.ts:157 via try_accounts_11718); key found (bundle/collect_protocol_fees.ts:265); address found (bundle/collect_protocol_fees.ts:265)

## CPIs

- bundle/collect_protocol_fees.ts:711 TOKEN_PROGRAM (constant).Transfer — accounts source: *(ld64(b + 0x48)) w, destination: *(ld64(b + 0x78)) w, authority: *(ld64(b + 0xa8)) s — amount: c [ix data?] — PDA signer: (ld64(b + 0xd8))[..ld64(b + 0xe0)]
- bundle/collect_protocol_fees.ts:1094 program not decoded

## Dominance (checks on every path to the operation; across calls)

- bundle/collect_protocol_fees.ts:711 TOKEN_TRANSFER, PDA_SIGNATURE: 27 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpool; initialized whirlpool; discriminator whirlpool; signer collect_protocol_fees_authority; owner token_vault_a; …)
  - sources: amount ← instruction data (caller-controlled)
- bundle/collect_protocol_fees.ts:1094 CPI: 27 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpool; initialized whirlpool; discriminator whirlpool; signer collect_protocol_fees_authority; owner token_vault_a; …)

## Authority (who enables each value movement / authority change)

- bundle/collect_protocol_fees.ts:711 TOKEN_TRANSFER, PDA_SIGNATURE: signer collect_protocol_fees_authority (found); stored collect_protocol_fees_authority.key == whirlpool.collect_protocol_fees_authority (found); stored collect_protocol_fees_authority.key == (constant address) (found); pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/collect_protocol_fees.ts:711 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer collect_protocol_fees_authority (found); stored collect_protocol_fees_authority.key == whirlpool.collect_protocol_fees_authority (found); stored collect_protocol_fees_authority.key == (constant
  - [found] signer related to a stored authority (or PDA signature) — collect_protocol_fees_authority.key == whirlpool.collect_protocol_fees_authority; collect_protocol_fees_authority.key == (constant address); PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [PARTIAL] amount arithmetic checked — amount ← instruction data (caller-controlled)
  - [found] relevant checks on every path — 27 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/collect_protocol_fees.ts:711 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ signer collect_protocol_fees_authority (found) ⇐ stored whirlpool.collect_protocol_fees_authority == collect_protocol_fees_authority.key (found) ⇐ writer whirlpool.collect_protocol_fees_authority: no instruction writing it found (set at creation, or outside the recognized writes)
- bundle/collect_protocol_fees.ts:711 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ signer collect_protocol_fees_authority (found) ⇐ stored (constant address) == collect_protocol_fees_authority.key (found) ⇐ writer (constant address): no instruction writing it found (set at creation, or outside the recognized writes)
- bundle/collect_protocol_fees.ts:711 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/collect_protocol_fees.ts:711 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer: ✗ `i == 0x8000000000000000` · `u63 != -1` · `u54 != -1` · `u44 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u10 != -1` · `u5 != -1` · ✗ `f == 2`
- bundle/collect_protocol_fees.ts:1094 CPI: ✗ `i == 0x8000000000000000` · `u63 != -1` · `u54 != -1` · `u44 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u10 != -1` · `u5 != -1` · ✗ `f == 2`

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/collect_protocol_fees.ts:236)
- whirlpool.collect_protocol_fees_authority? == collect_protocol_fees_authority.key (has_one, found, bundle/collect_protocol_fees.ts:249)
- collect_protocol_fees_authority.key == (constant address) (address, found, bundle/collect_protocol_fees.ts:265)
- token_vault_a.key == (constant address) (address, found, bundle/collect_protocol_fees.ts:279)
- token_vault_b.key == (constant address) (address, found, bundle/collect_protocol_fees.ts:305)
- token_program.key == (constant address) (address, found, bundle/collect_protocol_fees.ts:332)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key
- whirlpools_config.data: validated (owner found @accounts_collect_protocol_fees:8, discriminator found @accounts_collect_protocol_fees:8, initialized found @accounts_collect_protocol_fees:8)
- whirlpool.key: validated (key found @accounts_collect_protocol_fees:130, has_one found @accounts_collect_protocol_fees:130)
- whirlpool.data: validated (owner found @accounts_collect_protocol_fees:22, discriminator found @accounts_collect_protocol_fees:22, initialized found @accounts_collect_protocol_fees:22)
- token_vault_a.key: validated (address found @accounts_collect_protocol_fees:160, key found @accounts_collect_protocol_fees:160)
- token_vault_a.data: validated (owner found @accounts_collect_protocol_fees:44, discriminator found @accounts_collect_protocol_fees:44, initialized found @accounts_collect_protocol_fees:44)
- token_vault_b.key: validated (address found @accounts_collect_protocol_fees:186, key found @accounts_collect_protocol_fees:186)
- token_vault_b.data: validated (owner found @accounts_collect_protocol_fees:60, discriminator found @accounts_collect_protocol_fees:60, initialized found @accounts_collect_protocol_fees:60)
- token_destination_a.key: validated (key found @accounts_collect_protocol_fees:208)
- token_destination_a.data: validated (owner found @accounts_collect_protocol_fees:78, discriminator found @accounts_collect_protocol_fees:78, initialized found @accounts_collect_protocol_fees:78)
- token_destination_b.key: validated (key found @accounts_collect_protocol_fees:210)
- token_destination_b.data: validated (owner found @accounts_collect_protocol_fees:99, discriminator found @accounts_collect_protocol_fees:99, initialized found @accounts_collect_protocol_fees:99)
- token_program.key: validated (address found @accounts_collect_protocol_fees:117, key found @accounts_collect_protocol_fees:213)
- collect_protocol_fees_authority.key: validated (address found @accounts_collect_protocol_fees:146, key found @accounts_collect_protocol_fees:146)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/collect_protocol_fees.ts:127 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 1 | bundle/collect_protocol_fees.ts:141 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 2 | bundle/collect_protocol_fees.ts:157 | found | collect_protocol_fees_authority | signer (via try_accounts_11718 (count, signer)) | `j != 2` | return |
| 3 | bundle/collect_protocol_fees.ts:163 | found | token_vault_a | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `l == 2` | return |
| 4 | bundle/collect_protocol_fees.ts:179 | found | token_vault_b | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `q == 2` | return |
| 5 | bundle/collect_protocol_fees.ts:197 | found | token_destination_a | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `t == 2` | return |
| 6 | bundle/collect_protocol_fees.ts:218 | found | token_destination_b | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `w == 2` | return |
| 7 | bundle/collect_protocol_fees.ts:236 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `z != 2` | return |
| 8 | bundle/collect_protocol_fees.ts:237 | found | whirlpool | writable | `ld8(ld64(i) + 0x29) == 0` | anchor::ConstraintMut |
| 9 | bundle/collect_protocol_fees.ts:249 | found | whirlpool | key, has_one | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 10 | bundle/collect_protocol_fees.ts:265 | found | collect_protocol_fees_authority | key, address | `!((memcmp(s2d0, s2b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 11 | bundle/collect_protocol_fees.ts:267 | found | token_vault_a | writable | `token_vault_a.is_writable == 0` | anchor::ConstraintMut |
| 12 | bundle/collect_protocol_fees.ts:279 | found | token_vault_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 13 | bundle/collect_protocol_fees.ts:293 | found | token_vault_b | writable | `token_vault_b.is_writable == 0` | anchor::ConstraintMut |
| 14 | bundle/collect_protocol_fees.ts:305 | found | token_vault_b | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 15 | bundle/collect_protocol_fees.ts:318 | found | token_destination_a | writable | `ld8(ld64(s838 + 0x28) + 0x29) == 0` | anchor::ConstraintMut |
| 16 | bundle/collect_protocol_fees.ts:327 | found | token_destination_a | key, raw | `!((memcmp(s438, i + 0x1a8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 17 | bundle/collect_protocol_fees.ts:328 | found | token_destination_b | writable | `!(ld8(ld64(s838 + 0x10) + 0x29) != 0)` | anchor::ConstraintMut |
| 18 | bundle/collect_protocol_fees.ts:329 | found | token_destination_b | key, raw | `!((memcmp(s380, i + 0x1e8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 19 | bundle/collect_protocol_fees.ts:332 | found | token_program | key, address | `(memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 20 | bundle/collect_protocol_fees.ts:506 | PARTIAL | whirlpool |  | `f != 2` | return |
| 21 | bundle/collect_protocol_fees.ts:514 | PARTIAL | token_vault_a | key | `(memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0` | return |
| 22 | bundle/collect_protocol_fees.ts:604 | PARTIAL | token_destination_b |  | `z != 0x800000000000001a /* Ok */` | return |
| 23 | bundle/collect_protocol_fees.ts:610 | PARTIAL | token_destination_b |  | `af != 2` | return |
| 24 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 25 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 26 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 27 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 28 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 29 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 30 | bundle/collect_protocol_fees.ts:901 | found |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
