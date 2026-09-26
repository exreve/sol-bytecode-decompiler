# initialize_adaptive_fee_tier

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_adaptive_fee_tier (anchor); 39 functions reachable: ix_initialize_adaptive_fee_tier, accounts_initialize_adaptive_fee_tier, memcpy, fn_590d8, fn_5f98, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9900, fn_83078, fn_149478, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | funder [str] | found | PARTIAL | — | — | — |
| 2 | adaptive_fee_tier [str] | — | runtime | runtime | — | — |
| 3 | fee_authority [str] | found | — | — | — | PARTIAL |
| 4 | system_program [str] | — | — | — | found | found |

## Constraints per account

- whirlpools_config: owner found (bundle/initialize_adaptive_fee_tier.ts:244 via try_accounts_11de0); initialized found (bundle/initialize_adaptive_fee_tier.ts:244 via try_accounts_11de0); discriminator found (bundle/initialize_adaptive_fee_tier.ts:244 via try_accounts_11de0)
- funder: signer found (bundle/initialize_adaptive_fee_tier.ts:273 via try_accounts_11718); writable PARTIAL (bundle/initialize_adaptive_fee_tier.ts:344)
- adaptive_fee_tier: key found (bundle/initialize_adaptive_fee_tier.ts:313); pda found (bundle/initialize_adaptive_fee_tier.ts:313); writable runtime (bundle/initialize_adaptive_fee_tier.ts:158) — written: the runtime rejects changes to a read-only account; rent_exempt PARTIAL (bundle/initialize_adaptive_fee_tier.ts:389); owner runtime (bundle/initialize_adaptive_fee_tier.ts:158) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise)
- fee_authority: signer found (bundle/initialize_adaptive_fee_tier.ts:285 via try_accounts_11718); key PARTIAL (bundle/initialize_adaptive_fee_tier.ts:404); address PARTIAL (bundle/initialize_adaptive_fee_tier.ts:404)
- system_program: address found (bundle/initialize_adaptive_fee_tier.ts:290 via fn_122e8); executable found (bundle/initialize_adaptive_fee_tier.ts:290 via fn_122e8)

## CPIs

- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/initialize_adaptive_fee_tier.ts:305 find_program_address(["fee_tier", *t, u16 ld16(s1ba) [ix data?]], program *(ld64(s1c8)))
- compared with provided accounts: adaptive_fee_tier found

## Operations (account writes)

- bundle/initialize_adaptive_fee_tier.ts:158 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40] = ag, n, m
- bundle/initialize_adaptive_fee_tier.ts:514 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[40..42] = d, f [conditional]
- bundle/initialize_adaptive_fee_tier.ts:514 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[42..44] = d, f [conditional]
- bundle/initialize_adaptive_fee_tier.ts:515 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40] = i [conditional]
- bundle/initialize_adaptive_fee_tier.ts:516 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40] = j [conditional]
- bundle/initialize_adaptive_fee_tier.ts:517 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40] = k [conditional]
- bundle/initialize_adaptive_fee_tier.ts:518 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40] = l [conditional]
- bundle/initialize_adaptive_fee_tier.ts:532 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[108..110] = m [conditional]
- bundle/initialize_adaptive_fee_tier.ts:535 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[44..76] = ld64(n + 0x18) [conditional]
- bundle/initialize_adaptive_fee_tier.ts:536 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[44..76] = ld64(n + 0x10) [conditional]
- bundle/initialize_adaptive_fee_tier.ts:537 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[44..76] = ld64(n + 8) [conditional]
- bundle/initialize_adaptive_fee_tier.ts:538 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[44..76] = ld64(n) [conditional]
- bundle/initialize_adaptive_fee_tier.ts:548 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[114..116] = ld64(s80 + 8) [conditional]
- bundle/initialize_adaptive_fee_tier.ts:549 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[112..114] = ld64(s80 + 0x20) [conditional]
- bundle/initialize_adaptive_fee_tier.ts:550 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[110..112] = p [conditional]
- bundle/initialize_adaptive_fee_tier.ts:551 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[126..128] = ld64(s80) [conditional]
- bundle/initialize_adaptive_fee_tier.ts:552 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[124..126] = r [conditional]
- bundle/initialize_adaptive_fee_tier.ts:553 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[120..124] = ld64(s80 + 0x10) [conditional]
- bundle/initialize_adaptive_fee_tier.ts:555 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[116..120] = u [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/initialize_adaptive_fee_tier.ts:158 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
- bundle/initialize_adaptive_fee_tier.ts:514 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
- bundle/initialize_adaptive_fee_tier.ts:514 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
- bundle/initialize_adaptive_fee_tier.ts:515 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[8..40] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:516 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[8..40] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:517 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[8..40] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:518 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[8..40] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:532 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[108..110] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:535 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
- bundle/initialize_adaptive_fee_tier.ts:536 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
- bundle/initialize_adaptive_fee_tier.ts:537 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
- bundle/initialize_adaptive_fee_tier.ts:538 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
- bundle/initialize_adaptive_fee_tier.ts:548 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[114..116] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:549 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[112..114] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:550 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[110..112] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:551 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[126..128] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:552 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[124..126] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:553 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[120..124] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:555 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)
  - sources: adaptive_fee_tier.data[116..120] ← instruction data (caller-controlled)
- shared.ts:20063 CPI: 9 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer funder; signer fee_authority; address system_program; executable system_program; key adaptive_fee_tier; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/initialize_adaptive_fee_tier.ts:158 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — adaptive_fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_adaptive_fee_tier:68; signer fee_authority accounts_initialize_adaptive_fee_tier:80; address/executable system_program accounts_initialize_adaptive_fee_tier:85
- bundle/initialize_adaptive_fee_tier.ts:514 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[40..42] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — adaptive_fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_adaptive_fee_tier:68; signer fee_authority accounts_initialize_adaptive_fee_tier:80; address/executable system_program accounts_initialize_adaptive_fee_tier:85
- bundle/initialize_adaptive_fee_tier.ts:514 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[42..44] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — adaptive_fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_adaptive_fee_tier:68; signer fee_authority accounts_initialize_adaptive_fee_tier:80; address/executable system_program accounts_initialize_adaptive_fee_tier:85
- bundle/initialize_adaptive_fee_tier.ts:515 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — adaptive_fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_adaptive_fee_tier:68; signer fee_authority accounts_initialize_adaptive_fee_tier:80; address/executable system_program accounts_initialize_adaptive_fee_tier:85
  - [PARTIAL] amount arithmetic checked — adaptive_fee_tier.data[8..40] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:516 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — adaptive_fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_adaptive_fee_tier:68; signer fee_authority accounts_initialize_adaptive_fee_tier:80; address/executable system_program accounts_initialize_adaptive_fee_tier:85
  - [PARTIAL] amount arithmetic checked — adaptive_fee_tier.data[8..40] ← instruction data (caller-controlled)
- bundle/initialize_adaptive_fee_tier.ts:517 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — adaptive_fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_adaptive_fee_tier:68; signer fee_authority accounts_initialize_adaptive_fee_tier:80; address/executable system_program accounts_initialize_adaptive_fee_tier:85
  - [PARTIAL] amount arithmetic checked — adaptive_fee_tier.data[8..40] ← instruction data (caller-controlled)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/initialize_adaptive_fee_tier.ts:158 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40]: ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · ✗ `(f & -2) == 0x44` · ✗ `0x20 > f - 0x24` · … 3 more
- bundle/initialize_adaptive_fee_tier.ts:514 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[40..42]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:514 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[42..44]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:515 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:516 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:517 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:518 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[8..40]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:532 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[108..110]: ✗ `(m as u16) > 0xea60` · ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · … 6 more
- bundle/initialize_adaptive_fee_tier.ts:535 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[44..76]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:536 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[44..76]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:537 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[44..76]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:538 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[44..76]: ✗ `(f as u16) == 0` · ✗ `(d as u16) == (f as u16)` · ✗ `l == 0` · ✗ `(f & -2) == 0x56` · ✗ `(f & -2) == 0x54` · ✗ `(f & -4) == 0x50` · ✗ `(f & -4) == 0x4c` · ✗ `(f & -2) == 0x4a` · ✗ `(f & -2) == 0x48` · ✗ `(f & -2) == 0x46` · … 5 more
- bundle/initialize_adaptive_fee_tier.ts:548 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[114..116]: ✗ `(t as u16) > (f as u16) * 0x58` · ✗ `(t as u16) == 0` · ✗ `(f as u16) % (r as u16) != 0` · ✗ `(s & 1) != 0` · ✗ `(ld64(s80 + 8) as u16) > 0x270f` · ✗ `((r - 1) as u16) >= (f as u16)` · ✗ `(ld64(s80 + 0x18) as u32) > 0x1869f` · ✗ `(q as u16) >= (ld64(s80 + 0x20) as u16)` · ✗ `(p as u16) == 0` · ✗ `(f as u16) == 0` · … 14 more
- bundle/initialize_adaptive_fee_tier.ts:549 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[112..114]: ✗ `(t as u16) > (f as u16) * 0x58` · ✗ `(t as u16) == 0` · ✗ `(f as u16) % (r as u16) != 0` · ✗ `(s & 1) != 0` · ✗ `(ld64(s80 + 8) as u16) > 0x270f` · ✗ `((r - 1) as u16) >= (f as u16)` · ✗ `(ld64(s80 + 0x18) as u32) > 0x1869f` · ✗ `(q as u16) >= (ld64(s80 + 0x20) as u16)` · ✗ `(p as u16) == 0` · ✗ `(f as u16) == 0` · … 14 more
- bundle/initialize_adaptive_fee_tier.ts:550 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[110..112]: ✗ `(t as u16) > (f as u16) * 0x58` · ✗ `(t as u16) == 0` · ✗ `(f as u16) % (r as u16) != 0` · ✗ `(s & 1) != 0` · ✗ `(ld64(s80 + 8) as u16) > 0x270f` · ✗ `((r - 1) as u16) >= (f as u16)` · ✗ `(ld64(s80 + 0x18) as u32) > 0x1869f` · ✗ `(q as u16) >= (ld64(s80 + 0x20) as u16)` · ✗ `(p as u16) == 0` · ✗ `(f as u16) == 0` · … 14 more
- bundle/initialize_adaptive_fee_tier.ts:551 ACCOUNT_DATA_WRITE adaptive_fee_tier.data[126..128]: ✗ `(t as u16) > (f as u16) * 0x58` · ✗ `(t as u16) == 0` · ✗ `(f as u16) % (r as u16) != 0` · ✗ `(s & 1) != 0` · ✗ `(ld64(s80 + 8) as u16) > 0x270f` · ✗ `((r - 1) as u16) >= (f as u16)` · ✗ `(ld64(s80 + 0x18) as u32) > 0x1869f` · ✗ `(q as u16) >= (ld64(s80 + 0x20) as u16)` · ✗ `(p as u16) == 0` · ✗ `(f as u16) == 0` · … 14 more

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/initialize_adaptive_fee_tier.ts:290)
- fee_authority.key == (constant address) (address, PARTIAL, bundle/initialize_adaptive_fee_tier.ts:404)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, funder.key
- whirlpools_config.data: validated (owner found @accounts_initialize_adaptive_fee_tier:39, discriminator found @accounts_initialize_adaptive_fee_tier:39, initialized found @accounts_initialize_adaptive_fee_tier:39)
- adaptive_fee_tier.key: validated (pda found @accounts_initialize_adaptive_fee_tier:108, key found @accounts_initialize_adaptive_fee_tier:108)
- adaptive_fee_tier.data: runtime (owner runtime @ix_initialize_adaptive_fee_tier:67)
- fee_authority.key: partially-validated (address partial @accounts_initialize_adaptive_fee_tier:199, key partial @accounts_initialize_adaptive_fee_tier:199)
- system_program.key: validated (address found @accounts_initialize_adaptive_fee_tier:85)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_adaptive_fee_tier.ts:165 | PARTIAL | adaptive_fee_tier |  | `p != 2` | return |
| 1 | bundle/initialize_adaptive_fee_tier.ts:244 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s148) == 0` | return |
| 2 | bundle/initialize_adaptive_fee_tier.ts:258 | found |  | count | `j == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/initialize_adaptive_fee_tier.ts:273 | found | funder | signer (via try_accounts_11718 (count, signer)) | `l != 2` | return |
| 4 | bundle/initialize_adaptive_fee_tier.ts:285 | found | fee_authority | signer (via try_accounts_11718 (count, signer)) | `n != 2` | return |
| 5 | bundle/initialize_adaptive_fee_tier.ts:290 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `p != 2` | return |
| 6 | bundle/initialize_adaptive_fee_tier.ts:313 | found | adaptive_fee_tier | key, pda | `!((memcmp(s148, s170, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 7 | bundle/initialize_adaptive_fee_tier.ts:328 | PARTIAL | adaptive_fee_tier | writable | `adaptive_fee_tier.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/initialize_adaptive_fee_tier.ts:344 | PARTIAL | funder | writable | `ah == 0x800000000000001a /* Ok */` | anchor::ConstraintMut |
| 9 | bundle/initialize_adaptive_fee_tier.ts:389 | PARTIAL | adaptive_fee_tier | rent_exempt | `au > ld64(s328)` | anchor::ConstraintRentExempt |
| 10 | bundle/initialize_adaptive_fee_tier.ts:399 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 11 | bundle/initialize_adaptive_fee_tier.ts:404 | PARTIAL | fee_authority | key, address | `(memcmp(s20, sc8, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 12 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 13 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 14 | bundle/initialize_adaptive_fee_tier.ts:714 | PARTIAL |  | key | `(memcmp(s40, s1f0, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 15 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 16 | bundle/initialize_adaptive_fee_tier.ts:1118 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 17 | bundle/initialize_adaptive_fee_tier.ts:1127 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
