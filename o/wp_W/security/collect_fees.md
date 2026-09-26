# collect_fees

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_collect_fees (anchor); 49 functions reachable: ix_collect_fees, accounts_collect_fees, memcpy, fn_60480, fn_652d0, fn_8ef60, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_9540, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 1 | position [str] | — | found | found (+discriminator found) | — | — |
| 2 | position_token_account [str] | — | — | found (+discriminator found) | — | — |
| 3 | token_owner_account_a [str] | — | found | found (+discriminator found) | — | — |
| 4 | token_vault_a [str] | — | found | found (+discriminator found) | — | found |
| 5 | token_owner_account_b [str] | — | found | found (+discriminator found) | — | — |
| 6 | token_vault_b [str] | — | found | found (+discriminator found) | — | found |
| 7 | token_program [str] | — | — | — | found | found |
| 8 | position_authority [str] | found | — | — | — | — |

## Constraints per account

- whirlpool: owner found (bundle/collect_fees.ts:157 via try_accounts_11a48); initialized found (bundle/collect_fees.ts:157 via try_accounts_11a48); discriminator found (bundle/collect_fees.ts:157 via try_accounts_11a48)
- position: owner found (bundle/collect_fees.ts:175 via try_accounts_11b00); initialized found (bundle/collect_fees.ts:175 via try_accounts_11b00); discriminator found (bundle/collect_fees.ts:175 via try_accounts_11b00); writable found (bundle/collect_fees.ts:249); key found (bundle/collect_fees.ts:262); has_one found (bundle/collect_fees.ts:262)
- position_token_account: owner found (bundle/collect_fees.ts:191 via try_accounts_558); discriminator found (bundle/collect_fees.ts:191 via try_accounts_558); initialized found (bundle/collect_fees.ts:191 via try_accounts_558); key found (bundle/collect_fees.ts:276); raw found (bundle/collect_fees.ts:276)
- token_owner_account_a: owner found (bundle/collect_fees.ts:206 via try_accounts_11f50); discriminator found (bundle/collect_fees.ts:206 via try_accounts_11f50); initialized found (bundle/collect_fees.ts:206 via try_accounts_11f50); state found (bundle/collect_fees.ts:287); writable found (bundle/collect_fees.ts:287); key found (bundle/collect_fees.ts:296); raw found (bundle/collect_fees.ts:296)
- token_vault_a: owner found (bundle/collect_fees.ts:221 via try_accounts_11f50); discriminator found (bundle/collect_fees.ts:221 via try_accounts_11f50); initialized found (bundle/collect_fees.ts:221 via try_accounts_11f50); writable found (bundle/collect_fees.ts:298); key found (bundle/collect_fees.ts:302); address found (bundle/collect_fees.ts:302)
- token_owner_account_b: owner found (bundle/collect_fees.ts:237 via fn_20f8); discriminator found (bundle/collect_fees.ts:237 via fn_20f8); initialized found (bundle/collect_fees.ts:237 via fn_20f8); writable found (bundle/collect_fees.ts:315); raw found (bundle/collect_fees.ts:324)
- token_vault_b: owner found (bundle/collect_fees.ts:242 via fn_20f8); discriminator found (bundle/collect_fees.ts:242 via fn_20f8); initialized found (bundle/collect_fees.ts:242 via fn_20f8); writable found (bundle/collect_fees.ts:326); key found (bundle/collect_fees.ts:330); address found (bundle/collect_fees.ts:330)
- token_program: address found (bundle/collect_fees.ts:247 via fn_129a0); executable found (bundle/collect_fees.ts:247 via fn_129a0)
- position_authority: signer found (bundle/collect_fees.ts:173 via try_accounts_11718)

## CPIs

- bundle/collect_fees.ts:847 TOKEN_PROGRAM (constant).Transfer — accounts source: *(ld64(b + 0x48)) w, destination: *(ld64(b + 0x78)) w, authority: *(ld64(b + 0xa8)) s — amount: c [ix data?] — PDA signer: (ld64(b + 0xd8))[..ld64(b + 0xe0)]
- bundle/collect_fees.ts:1197 program not decoded

## Dominance (checks on every path to the operation; across calls)

- bundle/collect_fees.ts:847 TOKEN_TRANSFER, PDA_SIGNATURE: 29 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer position_authority; owner position; initialized position; discriminator position; owner position_token_account; …)
  - sources: amount ← instruction data (caller-controlled)
- bundle/collect_fees.ts:1197 CPI: 29 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer position_authority; owner position; initialized position; discriminator position; owner position_token_account; …)

## Authority (who enables each value movement / authority change)

- bundle/collect_fees.ts:847 TOKEN_TRANSFER, PDA_SIGNATURE: signer position_authority (found); stored position_authority.key == position.position_authority (found); pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/collect_fees.ts:847 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer position_authority (found); stored position_authority.key == position.position_authority (found); pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]
  - [found] signer related to a stored authority (or PDA signature) — position_authority.key == position.position_authority; PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [PARTIAL] amount arithmetic checked — amount ← instruction data (caller-controlled)
  - [found] relevant checks on every path — 29 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/collect_fees.ts:847 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ signer position_authority (found) ⇐ stored position.position_authority == position_authority.key (found) ⇐ writer position.position_authority: no instruction writing it found (set at creation, or outside the recognized writes)
- bundle/collect_fees.ts:847 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/collect_fees.ts:847 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer: ✗ `i == 0x8000000000000000` · `u63 != -1` · `u54 != -1` · `u44 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u10 != -1` · `u5 != -1` · ✗ `h != 2` · … 1 more
- bundle/collect_fees.ts:1197 CPI: ✗ `i == 0x8000000000000000` · `u63 != -1` · `u54 != -1` · `u44 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u10 != -1` · `u5 != -1` · ✗ `h != 2` · … 1 more

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/collect_fees.ts:247)
- position.position_authority? == position_authority.key (has_one, found, bundle/collect_fees.ts:262)
- token_vault_a.key == (constant address) (address, found, bundle/collect_fees.ts:302)
- token_vault_b.key == (constant address) (address, found, bundle/collect_fees.ts:330)
- token_program.key == (constant address) (address, found, bundle/collect_fees.ts:346)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, token_owner_account_b.key, position_authority.key
- whirlpool.data: validated (owner found @accounts_collect_fees:8, discriminator found @accounts_collect_fees:8, initialized found @accounts_collect_fees:8)
- position.key: validated (key found @accounts_collect_fees:113, has_one found @accounts_collect_fees:113)
- position.data: validated (owner found @accounts_collect_fees:26, discriminator found @accounts_collect_fees:26, initialized found @accounts_collect_fees:26)
- position_token_account.key: validated (key found @accounts_collect_fees:127)
- position_token_account.data: validated (owner found @accounts_collect_fees:42, discriminator found @accounts_collect_fees:42, initialized found @accounts_collect_fees:42)
- token_owner_account_a.key: validated (key found @accounts_collect_fees:147)
- token_owner_account_a.data: validated (owner found @accounts_collect_fees:57, discriminator found @accounts_collect_fees:57, initialized found @accounts_collect_fees:57)
- token_vault_a.key: validated (address found @accounts_collect_fees:153, key found @accounts_collect_fees:153)
- token_vault_a.data: validated (owner found @accounts_collect_fees:72, discriminator found @accounts_collect_fees:72, initialized found @accounts_collect_fees:72)
- token_owner_account_b.data: validated (owner found @accounts_collect_fees:88, discriminator found @accounts_collect_fees:88, initialized found @accounts_collect_fees:88)
- token_vault_b.key: validated (address found @accounts_collect_fees:181, key found @accounts_collect_fees:181)
- token_vault_b.data: validated (owner found @accounts_collect_fees:93, discriminator found @accounts_collect_fees:93, initialized found @accounts_collect_fees:93)
- token_program.key: validated (address found @accounts_collect_fees:98)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/collect_fees.ts:157 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 1 | bundle/collect_fees.ts:173 | found | position_authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 2 | bundle/collect_fees.ts:175 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 3 | bundle/collect_fees.ts:191 | found | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x90) == 2` | return |
| 4 | bundle/collect_fees.ts:206 | found | token_owner_account_a | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x70) == 2` | return |
| 5 | bundle/collect_fees.ts:221 | found | token_vault_a | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x70) == 2` | return |
| 6 | bundle/collect_fees.ts:237 | found | token_owner_account_b | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `r != 2` | return |
| 7 | bundle/collect_fees.ts:242 | found | token_vault_b | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `t != 2` | return |
| 8 | bundle/collect_fees.ts:247 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `v != 2` | return |
| 9 | bundle/collect_fees.ts:249 | found | position | writable | `ld8(ld64(w) + 0x29) == 0` | anchor::ConstraintMut |
| 10 | bundle/collect_fees.ts:262 | found | position | key, has_one | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 11 | bundle/collect_fees.ts:276 | found | position_token_account | key, raw | `!((memcmp(z.mint, w + 0x28, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 12 | bundle/collect_fees.ts:277 | found | position_token_account | raw | `z.amount != 1` | anchor::ConstraintRaw |
| 13 | bundle/collect_fees.ts:287 | found | token_owner_account_a | state, writable | `af.info.is_writable == 0` | anchor::ConstraintMut |
| 14 | bundle/collect_fees.ts:296 | found | token_owner_account_a | state, key, raw | `!((memcmp(af.mint, g + 0x1a8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 15 | bundle/collect_fees.ts:298 | found | token_vault_a | writable | `token_vault_a.is_writable == 0` | anchor::ConstraintMut |
| 16 | bundle/collect_fees.ts:302 | found | token_vault_a | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 17 | bundle/collect_fees.ts:315 | found | token_owner_account_b | writable | `ld8(ld64(ld64(s580 + 0x18)) + 0x29) == 0` | anchor::ConstraintMut |
| 18 | bundle/collect_fees.ts:324 | found | token_owner_account_b | raw | `!((memcmp(ld64(s580 + 0x18) + 8, g + 0x1e8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 19 | bundle/collect_fees.ts:326 | found | token_vault_b | writable | `token_vault_b.is_writable == 0` | anchor::ConstraintMut |
| 20 | bundle/collect_fees.ts:330 | found | token_vault_b | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 21 | bundle/collect_fees.ts:346 | found | token_program | address | `ae != 0` | anchor::ConstraintAddress |
| 22 | bundle/collect_fees.ts:620 | PARTIAL | position |  | `f != 2` | return |
| 23 | bundle/collect_fees.ts:628 | PARTIAL | token_owner_account_a | key | `(memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0` | return |
| 24 | bundle/collect_fees.ts:718 | PARTIAL | token_vault_b |  | `z != 0x800000000000001a /* Ok */` | return |
| 25 | bundle/collect_fees.ts:724 | PARTIAL | token_vault_b |  | `af != 2` | return |
| 26 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 27 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 28 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 29 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 30 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 31 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 32 | bundle/collect_fees.ts:1004 | found |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
