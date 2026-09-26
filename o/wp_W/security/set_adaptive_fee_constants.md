# set_adaptive_fee_constants

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_adaptive_fee_constants (anchor); 38 functions reachable: ix_set_adaptive_fee_constants, fn_10f70, accounts_set_adaptive_fee_constants, memcpy, fn_44be8, fn_258, fn_147e78, fn_11f980, fn_147990, fn_83078, fn_139720, fn_149678, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 1 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 2 | oracle [str] | — | found | found (+discriminator found) | — | — |
| 3 | fee_authority [str] | found | — | — (+discriminator found) | — | PARTIAL |

## Constraints per account

- whirlpool: owner found (bundle/set_adaptive_fee_constants.ts:450 via try_accounts_11a48); initialized found (bundle/set_adaptive_fee_constants.ts:450 via try_accounts_11a48); discriminator found (bundle/set_adaptive_fee_constants.ts:450 via try_accounts_11a48); has_one found (bundle/set_adaptive_fee_constants.ts:487)
- whirlpools_config: owner found (bundle/set_adaptive_fee_constants.ts:464 via try_accounts_11de0); initialized found (bundle/set_adaptive_fee_constants.ts:464 via try_accounts_11de0); discriminator found (bundle/set_adaptive_fee_constants.ts:464 via try_accounts_11de0)
- oracle: discriminator found (bundle/set_adaptive_fee_constants.ts:477 via fn_460); owner found (bundle/set_adaptive_fee_constants.ts:477 via fn_460); writable found (bundle/set_adaptive_fee_constants.ts:489); key PARTIAL (bundle/set_adaptive_fee_constants.ts:527); has_one PARTIAL (bundle/set_adaptive_fee_constants.ts:527)
- fee_authority: signer found (bundle/set_adaptive_fee_constants.ts:482 via try_accounts_11718); discriminator found (bundle/set_adaptive_fee_constants.ts:505); key PARTIAL (bundle/set_adaptive_fee_constants.ts:534); address PARTIAL (bundle/set_adaptive_fee_constants.ts:534)

## Relations (equalities the checks establish)

- whirlpool.fee_authority? == fee_authority.key (has_one, found, bundle/set_adaptive_fee_constants.ts:487)
- oracle.fee_authority? == fee_authority.key (has_one, PARTIAL, bundle/set_adaptive_fee_constants.ts:527)
- fee_authority.key == (constant address) (address, PARTIAL, bundle/set_adaptive_fee_constants.ts:534)
- whirlpools_config.data == fee_authority.key (field_eq, PARTIAL, bundle/set_adaptive_fee_constants.ts:534)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, fee_authority.data
- whirlpool.key: validated (has_one found @accounts_set_adaptive_fee_constants:48)
- whirlpool.data: validated (owner found @accounts_set_adaptive_fee_constants:11, discriminator found @accounts_set_adaptive_fee_constants:11, initialized found @accounts_set_adaptive_fee_constants:11)
- whirlpools_config.data: validated (owner found @accounts_set_adaptive_fee_constants:25, discriminator found @accounts_set_adaptive_fee_constants:25, initialized found @accounts_set_adaptive_fee_constants:25)
- oracle.key: partially-validated (key partial @accounts_set_adaptive_fee_constants:88, has_one partial @accounts_set_adaptive_fee_constants:88)
- oracle.data: validated (owner found @accounts_set_adaptive_fee_constants:38, discriminator found @accounts_set_adaptive_fee_constants:38)
- fee_authority.key: partially-validated (address partial @accounts_set_adaptive_fee_constants:95, key partial @accounts_set_adaptive_fee_constants:95)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_adaptive_fee_constants.ts:275 | found | oracle |  | `al != 2` | return |
| 1 | bundle/set_adaptive_fee_constants.ts:450 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `whirlpool == 0` | return |
| 2 | bundle/set_adaptive_fee_constants.ts:464 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `whirlpools_config == 0` | return |
| 3 | bundle/set_adaptive_fee_constants.ts:477 | found | oracle | discriminator, owner (via fn_460 (count, discriminator, owner)) | `l != 2` | return |
| 4 | bundle/set_adaptive_fee_constants.ts:482 | found | fee_authority | signer (via try_accounts_11718 (count, signer)) | `n != 2` | return |
| 5 | bundle/set_adaptive_fee_constants.ts:487 | found | whirlpool | has_one | `!((p as u32) == 0)` | anchor::ConstraintHasOne |
| 6 | bundle/set_adaptive_fee_constants.ts:489 | found | oracle | writable | `oracle.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/set_adaptive_fee_constants.ts:505 | found | fee_authority | discriminator | `x == 0x800000000000001a /* Ok */` | anchor::AccountDiscriminatorNotFound |
| 8 | bundle/set_adaptive_fee_constants.ts:527 | PARTIAL | oracle | key, has_one | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintHasOne |
| 9 | bundle/set_adaptive_fee_constants.ts:534 | PARTIAL | fee_authority | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 10 | bundle/set_adaptive_fee_constants.ts:624 | found |  | writable | `!(ld8(g + 0x29) != 0)` | anchor::AccountNotMutable |
| 11 | entrypoint.ts:438 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 12 | entrypoint.ts:447 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 13 | entrypoint.ts:677 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 14 | entrypoint.ts:686 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 15 | entrypoint.ts:273 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 16 | entrypoint.ts:290 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 17 | entrypoint.ts:296 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0xf4e5b38cb383c28b /* account:Oracle */` | anchor::AccountDiscriminatorMismatch |
| 18 | entrypoint.ts:13592 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 19 | entrypoint.ts:13224 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
