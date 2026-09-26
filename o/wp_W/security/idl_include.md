# idl_include

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_idl_include (anchor); 19 functions reachable: ix_idl_include, accounts_idl_include, fn_11f980, memcpy, fn_147990, fn_139720, fn_149678, fn_83078, log, fn_147230, fn_149478, abort_, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | system_program [str] | — | — | — | found | found |

## Constraints per account

- system_program: address found (bundle/idl_include.ts:52 via fn_122e8); executable found (bundle/idl_include.ts:52 via fn_122e8)

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/idl_include.ts:52)

## Trust (caller-controlled vs validated values)

- system_program.key: validated (address found @accounts_idl_include:8)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/idl_include.ts:52 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `f != 2` | return |
