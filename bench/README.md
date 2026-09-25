# Analysis benchmark

Ground truth for the analysis layer (`src/analysis/`, docs/ANALYSIS_SPEC.md): small programs compiled from source,
their expected facts, and single-property variants whose expected finding is known.

    node bench/run.ts [--verbose] [filter]      # or: npm run bench

It decompiles every `bin/*.so` as the CLI project output does (`-o dir/ [--idl]`), reads `security/analysis.json`
and prints TP / FP / FN, recall, precision and F1 per category, then one `score` line (mean F1 of the six
categories). `--verbose` lists the variants (caught / MISSED), every miss and every false report. ~7 s.

## Contents

- `programs/`: sources (a cargo workspace; tabs for indentation). Anchor 0.31.1: `a_vault` (SOL vault PDA, system
  transfer, raw lamport moves, close), `a_staking` (share-price pool, PDA-signed token transfer), `a_escrow`
  (token escrow, close_account, close = maker), `a_counter` (admin rotation, realloc), `a_oracle` (zero-copy
  AccountLoader), `a_mint` (PDA mint authority, mint_to / burn). solana-program 2.2.1: `n_vault`, `n_token`
  (spl-token CPIs with invoke_signed), `n_pool`. pinocchio 0.8.4: `p_counter`.
- Variants are cargo features `v_<name>` removing exactly one property; `bin/<prog>@<name>.so`.
- `bin/`: the stripped binaries (platform-tools v1.48, as `cargo build-sbf` deploys them). `build.sh` rebuilds them
  in the `sbf-builder` container (see scripts/refbuild.ts for the toolchain); not needed to run the bench.
- `idl/`: Anchor IDLs (0.30+ spec) written from the sources; passed as `--idl`.
- `expected/<prog>.json`: per instruction (native: by dispatch `tag`, accounts in index order)
  - `accounts`: `{ name: [check kinds] }`, kinds from signer, writable, owner, discriminator, pda, has_one, address,
    token_mint, token_owner, close (the only kinds scored);
  - `relations`: account pairs bound by a key equality (has_one, token::mint / authority, native compares);
  - `cpis`: `PROGRAM.Instruction`; `writes`: `account.field`, `account.data[a..b]` (native), `account.lamports`;
  - `pdas`: seeds, `literal/*` (`*` = non-literal seed, bump dropped);
  - `variants`: `{ ix, rules: [accepted rule ids], idl?: { ix: "acct:ws …" } }` (the variant's IDL accounts).
  A trailing `?` marks an optional fact (not a miss when absent, not a false report when present).

## Scoring

- Facts are compared on the base programs only. A reported fact counts only when its account resolves to an
  expected account of the instruction (by name, or index for native); facts on unnamed temporaries are ignored.
  Relations are unordered account pairs (constant-address relations are checks); a CPI to an account-supplied
  program matches by instruction name.
- Rules: a variant is a TP when one of its accepted rule ids is reported on its instruction, else a FN. Every
  finding on a base program is a FP (the bases are meant to be clean), and so is a finding in a variant that
  is neither expected nor already in the base.
- Anchor-generated instructions (idl_*) and native paths outside the dispatch are not scored.

To add a program: a crate under `programs/` (add it to the workspace), `v_*` features, `bench/build.sh <crate>`,
an IDL for Anchor, and `expected/<crate>.json`.
