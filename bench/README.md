# Analysis benchmark

Ground truth for the analysis layer (`src/analysis/`, docs/ANALYSIS_SPEC.md): small programs compiled from source,
their expected facts, and single-property variants whose expected finding is known.

    node bench/run.ts [--verbose] [filter]      # or: npm run bench

It decompiles every `bin/*.so` as the CLI project output does (`-o dir/ [--idl]`), reads `security/analysis.json`
and prints TP / FP / FN, recall, precision and F1 per category, then one `score` line (mean F1 of the six
categories). `--verbose` lists the variants (caught / MISSED), every miss and every false report. Without a filter it
also scores the eval pairs (`eval/analyze.ts`, below); `node bench/run.ts pairs` runs only those. ~40 s (~7 s with a filter).

## Generated programs (bench/gen)

`node bench/gen/gen.ts` writes 7 programs from instruction templates (`bench/gen/anchor.ts`, `bench/gen/native.ts`):
`g_a31_vault`, `g_a31_pool` (Anchor 0.31.1), `g_a29_vault`, `g_a29_pool` (the same templates under Anchor 0.29.0 /
solana-program 1.16.27), `g_n_bank`, `g_n_amm` (solana-program 2.2.1, spl-token), `g_p_jar` (pinocchio 0.8.4). Each
template instruction is clean as written and names the properties its `v_<id>` features remove (signer, has_one /
stored key, owner, discriminator / type tag, CPI program id, stored bump, uninitialized check, sysvar address,
duplicate-account check, remaining-account key, close zeroing, checked arithmetic, zero-supply guard, token mint /
authority, one of several instructions' validation). The generator writes the crates (`bench/gen/programs`,
`bench/gen/programs29`: two cargo workspaces), the IDLs (`bench/idl/g_*.json`) and `bench/expected/g_*.json` with
`"generated": true`; build with `WS=bench/gen/programs sh bench/build.sh g_` and `WS=bench/gen/programs29 sh
bench/build.sh g_` (binaries in `bench/bin/`).

`bench/run.ts` scores them for rules only, apart from the six categories: a variant is caught when one of its accepted
rules is reported at its instruction (`~consistency`: a validation_consistency inconsistency there); every finding on a
generated base is a false finding (inconsistencies on a base are counted as informational noise); findings a variant
adds besides its expected ones are listed as unexpected (`--verbose`).

## Eval pairs

`eval/analyze.ts` decompiles each real-world vuln / fixed pair of `eval/cases.json` (with its IDL) and looks for a
signal at `ground_truth.target` (instruction + account names as the analysis names them): a finding (`finding`), or
only an informational one (`informational`: a finding of confidence info, a validation_consistency inconsistency, a
stored-key gap or a program account no stored field of which is compared); `missed` otherwise. `fixed` is `clean` when
no such signal is left at the target in @fixed. `--verbose` lists the signals.

## Contents

- `programs/`: sources (a cargo workspace; tabs for indentation). Anchor 0.31.1: `a_vault` (SOL vault PDA, system
  transfer, raw lamport moves, close), `a_staking` (share-price pool, PDA-signed token transfer), `a_escrow`
  (token escrow, close_account, close = maker), `a_counter` (admin rotation, realloc), `a_oracle` (zero-copy
  AccountLoader), `a_mint` (PDA mint authority, mint_to / burn), `a_audit` (one instruction per audit rule,
  init-if-needed, manual initialization: register). solana-program 2.2.1: `n_vault`, `n_token` (spl-token CPIs with invoke_signed), `n_pool`.
  pinocchio 0.8.4: `p_counter`.
- Variants are cargo features `v_<name>` removing exactly one property (a_audit: seeding the bug its rule looks for);
  `bin/<prog>@<name>.so`.
- `bin/`: the stripped binaries (platform-tools v1.48, as `cargo build-sbf` deploys them). `build.sh` rebuilds them
  in the `sbf-builder` container (see scripts/refbuild.ts for the toolchain); not needed to run the bench.
- `idl/`: Anchor IDLs (0.30+ spec) written from the sources; passed as `--idl`.
- `expected/<prog>.json`: per instruction (native: by dispatch `tag`, accounts in index order)
  - `accounts`: `{ name: [check kinds] }`, kinds from signer, writable, owner, discriminator, pda, has_one, address,
    token_mint, token_owner, close (the only kinds scored);
  - `relations`: account pairs bound by a key equality (has_one, token::mint / authority, native compares);
  - `cpis`: `PROGRAM.Instruction`; `writes`: `account.field`, `account.data[a..b]` (native), `account.lamports`;
  - `pdas`: seeds, `literal/*` (`*` = non-literal seed, bump dropped);
  - `note`: why the instruction is clean as written (e.g. permissionless by design), not scored;
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

## Corpus noise baseline

    node bench/corpus.ts [corpusDir=corpus] [--budget s=1800] [--timeout s=240] [--jobs n] [--save]

Decompiles every `corpus/*.so` (with `corpus/idl/<id>.json` when present; ~7 min on 6 workers) and prints per rule the
programs hit, the findings and the findings per 100 programs; informational findings and the validation_consistency /
stored-key gap signals get their own rows. The corpus programs are presumed clean, so this is the noise floor. The
table is compared with `bench/corpus-baseline.json` (same programs only; a changed row shows the baseline programs /
findings); `--save` rewrites the baseline (per rule totals and per-program counts, for diffs).

## Corpus noise of the audit rules (history)

Programs of the 400-program corpus with >= 1 finding (decompile project mode): `sysvar-account-unchecked` 0,
`pda-bump-from-ix` 5 (7 findings), `duplicate-mutable-accounts` 0, `account-type-unchecked` 3, `cpi-result-ignored` 1,
`truncating-cast` 0, `remaining-account-unchecked` 1, `init-if-needed-reinit` 0, `reinit-unchecked` 0 (also 0 informational
native authority writes; eval candy_machine_v2 initialize_candy_machine: @vuln fires, @fixed does not); `cpi-unchecked-program`
high (PDA-signed) in 19 of its 92 programs. Rules are kept under ~5% of the programs. The token init helpers (InitializeAccount3 /
InitializeMint2 from library bytecode) and the by-value try_accounts of Anchor 0.1x leave every other rule's corpus counts
unchanged.

Phase-2/3 rules after the eval precision pass (findings / programs; before → after, same corpus and instruction split):
`check-bypassable` 1458 / 34 → 0 (17 / 6 informational), `signer-not-related-to-authority` 658 / 64 → 184 / 53,
`recipient-unbound` 34 / 14 → 22 / 9 (+55 informational: a destination the signer picks for itself),
`value-move-no-signer` 262 / 53 → 188 / 53, `unverified-account-data` 91 / 15 → 79 / 18.

Validation consistency (informational, no rule; src/analysis/consistency.ts): 100 inconsistencies in 28 of the 400
programs (first version, owner / type / signer / address included: 263 in 45). A spot-check of 10 corpus hits found no
clear true positive (Anchor loaders the analysis does not see load, a counterpart created by the instruction, labels of
the same field under two roles, SPL token's implicit owner rules), so it stays a view. Eval pairs: spl_lending_flashloan
flash_loan (reserve: no owner check, 6/6 others) and solend update_reserve_config (reserve: no stored-key relation with
the lending market, 4/4 others) show in @vuln only; bench clean bases: none. Stored keys in summary.md: 25 programs
(<= 5 lines each). Other rules unchanged by the pass except `cpi-unchecked-program` 1611 → 1606 findings (a check made
word by word now counted on every non-failing path).
