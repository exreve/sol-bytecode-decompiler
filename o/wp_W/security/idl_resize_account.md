# idl_resize_account

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_idl_resize_account (anchor); 23 functions reachable: ix_idl_resize_account, fn_143178, fn_147990, fn_11f980, fn_14f7f8, fn_143100, fn_1403d0, memcpy, fn_13eea8, fn_83078, fn_1434c0, fn_1486f0, ….

## Findings (rule engine)

- [low] state-write-ungated: Instruction writes program state with no signer check and no constraint gating the write. writes token_badge.data[-8..0] · only type / owner / size checks dominate the writes (fn_1434c0:21)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|

## Constraints per account


## CPIs

- shared.ts:20063 [conditional] program not decoded

## Operations (account writes)

- bundle/idl_resize_account.ts:241 ACCOUNT_REALLOC b.data.len = c
- bundle/idl_resize_account.ts:240 ACCOUNT_DATA_WRITE token_badge.data[-8..0] = c [conditional]

## Dominance (checks on every path to the operation; across calls)

- shared.ts:20063 CPI: 0 dominating checks
- bundle/idl_resize_account.ts:241 ACCOUNT_REALLOC: 1 dominating checks (key b?)
- bundle/idl_resize_account.ts:240 ACCOUNT_DATA_WRITE: 1 dominating checks (key b?)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/idl_resize_account.ts:240 ACCOUNT_DATA_WRITE token_badge.data[-8..0] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — token_badge: not an identified account
  - [found] write gated (signer / constraint) — key b? fn_1434c0:15

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:20063 CPI: ✗ `al > z` · `u109 != -1` · `u100 != -1` · `u95 != -1` · `u85 != -1` · `u77 != -1` · `u59 != -1` · ✗ `ld64(sd0) != 0` · `h + j > o` · ✗ `l != 0` · … 2 more
- bundle/idl_resize_account.ts:241 ACCOUNT_REALLOC b.data.len: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #0 · ✗ `g == c` · ✗ `f.borrow != 0` · ✗ `am != 2` · ✗ `al > z` · `u109 != -1` · `u100 != -1` · `u95 != -1` · `u85 != -1` · `u77 != -1` · … 6 more
- bundle/idl_resize_account.ts:240 ACCOUNT_DATA_WRITE token_badge.data[-8..0]: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #0 · ✗ `g == c` · ✗ `f.borrow != 0` · ✗ `am != 2` · ✗ `al > z` · `u109 != -1` · `u100 != -1` · `u95 != -1` · `u85 != -1` · `u77 != -1` · … 6 more

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/idl_resize_account.ts:234 | PARTIAL | b? | key | `sat_sub(c, ld32(b.key - 4)) > 0x2800` | Err(ProgramError::InvalidRealloc) |
