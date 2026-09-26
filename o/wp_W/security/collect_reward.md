# collect_reward

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_collect_reward (anchor); 49 functions reachable: ix_collect_reward, accounts_collect_reward, fn_60480, fn_652d0, fn_92920, memcpy, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_9540, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 1 | position [str] | — | found | found (+discriminator found) | — | — |
| 2 | position_token_account [str] | — | — | found (+discriminator found) | — | — |
| 3 | reward_owner_account [str] | — | found | found (+discriminator found) | — | — |
| 4 | reward_vault [str] | — | found | found (+discriminator found) | — | found |
| 5 | token_program [str] | — | — | — | found | found |
| 6 | position_authority [str] | found | — | — | — | — |
|  | reward_owner_account_box [code] | — | — | — | — | — |

## Constraints per account

- whirlpool: owner found (bundle/collect_reward.ts:229 via try_accounts_11a48); initialized found (bundle/collect_reward.ts:229 via try_accounts_11a48); discriminator found (bundle/collect_reward.ts:229 via try_accounts_11a48)
- position: owner found (bundle/collect_reward.ts:248 via try_accounts_11b00); initialized found (bundle/collect_reward.ts:248 via try_accounts_11b00); discriminator found (bundle/collect_reward.ts:248 via try_accounts_11b00); writable found (bundle/collect_reward.ts:302); key found (bundle/collect_reward.ts:315); has_one found (bundle/collect_reward.ts:315)
- position_token_account: owner found (bundle/collect_reward.ts:264 via try_accounts_558); discriminator found (bundle/collect_reward.ts:264 via try_accounts_558); initialized found (bundle/collect_reward.ts:264 via try_accounts_558); key found (bundle/collect_reward.ts:329); raw found (bundle/collect_reward.ts:329)
- reward_owner_account: owner found (bundle/collect_reward.ts:279 via try_accounts_11f50); discriminator found (bundle/collect_reward.ts:279 via try_accounts_11f50); initialized found (bundle/collect_reward.ts:279 via try_accounts_11f50); state found (bundle/collect_reward.ts:340); writable found (bundle/collect_reward.ts:340); raw found (bundle/collect_reward.ts:353)
- reward_vault: owner found (bundle/collect_reward.ts:295 via fn_20f8); discriminator found (bundle/collect_reward.ts:295 via fn_20f8); initialized found (bundle/collect_reward.ts:295 via fn_20f8); writable found (bundle/collect_reward.ts:355); key found (bundle/collect_reward.ts:360); address found (bundle/collect_reward.ts:360)
- token_program: address found (bundle/collect_reward.ts:300 via fn_129a0); executable found (bundle/collect_reward.ts:300 via fn_129a0)
- position_authority: signer found (bundle/collect_reward.ts:246 via try_accounts_11718)
- reward_owner_account_box: state found (bundle/collect_reward.ts:340)

## CPIs

- bundle/collect_reward.ts:828 TOKEN_PROGRAM (constant).Transfer — accounts source: *(ld64(b + 0x48)) w, destination: *(ld64(b + 0x78)) w, authority: *(ld64(b + 0xa8)) s — amount: c [ix data?] — PDA signer: (ld64(b + 0xd8))[..ld64(b + 0xe0)]
- bundle/collect_reward.ts:1183 program not decoded

## Dominance (checks on every path to the operation; across calls)

- bundle/collect_reward.ts:828 TOKEN_TRANSFER, PDA_SIGNATURE: 23 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer position_authority; owner position; initialized position; discriminator position; owner position_token_account; …)
  - sources: amount ← instruction data (caller-controlled); amount ← reward_vault.key (validated)
- bundle/collect_reward.ts:1183 CPI: 23 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer position_authority; owner position; initialized position; discriminator position; owner position_token_account; …)

## Authority (who enables each value movement / authority change)

- bundle/collect_reward.ts:828 TOKEN_TRANSFER, PDA_SIGNATURE: signer position_authority (found); stored position_authority.key == position.position_authority (found); pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/collect_reward.ts:828 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer position_authority (found); stored position_authority.key == position.position_authority (found); pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]
  - [found] signer related to a stored authority (or PDA signature) — position_authority.key == position.position_authority; PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [PARTIAL] amount arithmetic checked — amount ← instruction data (caller-controlled); amount ← reward_vault.key (validated)
  - [found] relevant checks on every path — 23 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/collect_reward.ts:828 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ signer position_authority (found) ⇐ stored position.position_authority == position_authority.key (found) ⇐ writer position.position_authority: no instruction writing it found (set at creation, or outside the recognized writes)
- bundle/collect_reward.ts:828 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer ⇐ pda PDA signature (ld64(b + 0xd8))[..ld64(b + 0xe0)]

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/collect_reward.ts:828 TOKEN_TRANSFER, PDA_SIGNATURE TOKEN_PROGRAM.Transfer: ✗ `i == 0x8000000000000000` · `u63 != -1` · `u54 != -1` · `u44 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u10 != -1` · `u5 != -1` · `3 > n` · … 3 more
- bundle/collect_reward.ts:1183 CPI: ✗ `i == 0x8000000000000000` · `u63 != -1` · `u54 != -1` · `u44 != -1` · `u36 != -1` · `u28 != -1` · `u19 != -1` · `u10 != -1` · `u5 != -1` · `3 > n` · … 3 more

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/collect_reward.ts:300)
- position.position_authority? == position_authority.key (has_one, found, bundle/collect_reward.ts:315)
- reward_vault.key == (constant address) (address, found, bundle/collect_reward.ts:360)
- token_program.key == (constant address) (address, found, bundle/collect_reward.ts:376)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, reward_owner_account.key, position_authority.key, reward_owner_account_box.key
- whirlpool.data: validated (owner found @accounts_collect_reward:37, discriminator found @accounts_collect_reward:37, initialized found @accounts_collect_reward:37)
- position.key: validated (key found @accounts_collect_reward:123, has_one found @accounts_collect_reward:123)
- position.data: validated (owner found @accounts_collect_reward:56, discriminator found @accounts_collect_reward:56, initialized found @accounts_collect_reward:56)
- position_token_account.key: validated (key found @accounts_collect_reward:137)
- position_token_account.data: validated (owner found @accounts_collect_reward:72, discriminator found @accounts_collect_reward:72, initialized found @accounts_collect_reward:72)
- reward_owner_account.data: validated (owner found @accounts_collect_reward:87, discriminator found @accounts_collect_reward:87, initialized found @accounts_collect_reward:87)
- reward_vault.key: validated (address found @accounts_collect_reward:168, key found @accounts_collect_reward:168)
- reward_vault.data: validated (owner found @accounts_collect_reward:103, discriminator found @accounts_collect_reward:103, initialized found @accounts_collect_reward:103)
- token_program.key: validated (address found @accounts_collect_reward:108)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/collect_reward.ts:229 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 1 | bundle/collect_reward.ts:246 | found | position_authority | signer (via try_accounts_11718 (count, signer)) | `i != 2` | return |
| 2 | bundle/collect_reward.ts:248 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 3 | bundle/collect_reward.ts:264 | found | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x90) == 2` | return |
| 4 | bundle/collect_reward.ts:279 | found | reward_owner_account | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s270 + 0x70) == 2` | return |
| 5 | bundle/collect_reward.ts:295 | found | reward_vault | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `s != 2` | return |
| 6 | bundle/collect_reward.ts:300 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `u != 2` | return |
| 7 | bundle/collect_reward.ts:302 | found | position | writable | `ld8(ld64(v) + 0x29) == 0` | anchor::ConstraintMut |
| 8 | bundle/collect_reward.ts:315 | found | position | key, has_one | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 9 | bundle/collect_reward.ts:329 | found | position_token_account | key, raw | `!((memcmp(y.mint, v + 0x28, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 10 | bundle/collect_reward.ts:330 | found | position_token_account | raw | `y.amount != 1` | anchor::ConstraintRaw |
| 11 | bundle/collect_reward.ts:340 | found | reward_owner_account | state, writable | `reward_owner_account_box_2.info.is_writable == 0` | anchor::ConstraintMut |
| 12 | bundle/collect_reward.ts:353 | found | reward_owner_account | state, raw | `!((memcmp(reward_owner_account_box_2.mint, h + 8 + (af << 7), 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 13 | bundle/collect_reward.ts:355 | found | reward_vault | writable | `reward_vault.is_writable == 0` | anchor::ConstraintMut |
| 14 | bundle/collect_reward.ts:360 | found | reward_vault | key, address | `(memcmp(s2d0, s2b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 15 | bundle/collect_reward.ts:376 | found | token_program | address | `ad != 0` | anchor::ConstraintAddress |
| 16 | bundle/collect_reward.ts:630 | PARTIAL | position |  | `f != 2` | return |
| 17 | bundle/collect_reward.ts:680 | PARTIAL | reward_vault |  | `r != 0x800000000000001a /* Ok */` | return |
| 18 | bundle/collect_reward.ts:686 | PARTIAL | reward_vault |  | `t != 2` | return |
| 19 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 20 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 21 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 22 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 23 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 24 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 25 | bundle/collect_reward.ts:990 | found |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
