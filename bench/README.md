# Analysis benchmark

Ground truth for the analysis layer (`src/analysis/`, docs/ANALYSIS_SPEC.md): small programs compiled from source,
their expected facts, and single-property variants whose expected finding is known.

    node bench/run.ts [--verbose] [filter]      # or: npm run bench

It decompiles every `bin/*.so` as the CLI project output does (`-o dir/ [--idl]`), reads `security/analysis.json`
and prints TP / FP / FN, recall, precision and F1 per category, then one `score` line (mean F1 of the six
categories). `--verbose` lists the variants (caught / MISSED), every miss and every false report. Without a filter it
also scores the eval pairs (`eval/analyze.ts`, below); `node bench/run.ts pairs` runs only those. ~40 s (~7 s with a filter).

## Generated programs (bench/gen)

`node bench/gen/gen.ts` writes 9 programs from instruction templates (`bench/gen/anchor.ts`, `bench/gen/native.ts`,
`bench/gen/risk.ts`; the two `*_risk` programs are described under Incident classes below):
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

### Incident classes (g_a31_risk, g_n_risk)

`bench/gen/risk.ts`: a lending reserve (vault PDA authority, ledger per user, TransferChecked through the token
interface, so SPL Token and Token-2022 mints) under Anchor 0.31 (`g_a31_risk`) and solana-program 2.2.1 (`g_n_risk`,
token CPIs built by hand, tags 0-7). The Instructions sysvar is read by a hand-written parser (both programs, so the
key check is the only difference) and the Pyth v2 price account by a hand-written layout (magic @0, type @8, expo @20,
timestamp @96, price @208, conf @216, status @224). Rule ids marked * do not exist yet (pseudo ids: misses until a
rule reports them):

| class | instruction | variants (both programs unless noted) | accepted rules |
|---|---|---|---|
| introspection | flash_borrow | `ix_sysvar_unchecked` (sysvar key), `ix_program_unchecked` (repay's program id), `ix_absolute_index` (caller's absolute index instead of current + 1), `ix_repay_unbound` (repay's reserve / amount not compared) | `introspection-unchecked`*, `flash-repay-unbound`* (repay), `sysvar-account-unchecked` (sysvar) |
| stale after CPI | withdraw | `no_reload` (Anchor: vault.amount after the transfer without reload()), `stale_copy` (native: balance read before the CPI) | `stale-after-cpi`* |
| Token-2022 amount | deposit | `nominal_amount` (credits the argument, not the vault balance delta) | `token2022-amount-assumed`* |
| oracle | borrow | `oracle_no_status`, `oracle_no_conf` (conf <= 2 %), `oracle_no_staleness` (Clock - timestamp <= 60 s) | `oracle-unvalidated`* |
| signer forwarding | route / swap_user | `signer_untrusted_pda` (vault PDA signs for an unchecked program), `user_signer_untrusted` (the caller's signature forwarded) | `signer-to-untrusted-program`*, `cpi-unchecked-program` |
| rounding | deposit / withdraw | `round_mint_ceil` (shares minted rounded up), `round_burn_floor` (shares burned rounded down) | `rounding-favors-user`* |
| admin drain | admin_sweep | none: informational | `fund_movers` |

`fund_movers` (expected file): `[{ ix, authority, from, index? }]`, an authority-only instruction that can move user
funds to a destination of its choosing. It must not be a finding (every base finding is false) and is expected in
analysis.json as `fund_movers: [{ instruction, authority, ... }]` (authority: the account name, or `account[index]`
for native); `bench/run.ts` prints `fund movers listed n/m` (missing section: all NOT LISTED).

## Realistic and open-source sets (bench/real, bench/real29)

Hand-labelled programs of realistic size, scored for rules only and apart from the six categories and the generated
(template) set; `expected.set` selects the set. Build with `WS=bench/real sh bench/build.sh <crate>` (Anchor 0.31.1,
solana-program 2.2.1, pinocchio 0.8.4) and `WS=bench/real29 sh bench/build.sh r_a29_` (Anchor 0.29.0); IDLs with
`node bench/real/idl.ts`.

- `realistic` (r_*): programs written for the bench in the styles real code uses, each meant to be correct as written:
  `r_a31_staking` (Anchor 0.31, 16 instructions: upgrade-authority-gated init, has_one / address / constraint with
  custom errors, a helper doing the admin check, two-step admin, token / associated_token constraints, PDA vault
  signers, zero-copy stats, events, permissionless crank / reward funding / payer-funded position / batch sync over
  remaining accounts validated one by one, Anchor close, checked u128 math), `r_n_vesting` (solana-program, 11:
  assert_* helpers with custom errors, loaders checking owner / length / tag / PDA from the stored bump, hard-coded
  admin, Clock sysvar address, system CPIs with invoke_signed, permissionless release and batch release bound to stored
  keys), `r_p_crowdfund` (pinocchio, 10: the same by hand, a state machine, permissionless finalize and batch refund),
  `r_a29_market` (Anchor 0.29, 10: SOL-priced token listings, PDA fee vault, token close_account, permissionless sweep).
  Every finding on them is false. `instructions.<ix>.why` says why each account is safely validated.
- `oss` (o_*): open-source programs with permissive licenses, logic unmodified: `o_multisig` (coral-xyz/multisig,
  Apache-2.0), `o_escrow` (solana-developers/program-examples tokens/escrow/anchor, MIT), `o_record` (spl-record 0.3.0,
  Apache-2.0), `o_spl_token` (spl-token 8.0.0, Apache-2.0). The clean build is a clean case (every finding false);
  each `v_*` feature removes exactly one validation (signer, has_one / key equality, PDA seeds, mint binding) and is
  kept only when the removal is exploitable: `variants.<v>` gives `removed`, `impact` (which instruction / account
  becomes unvalidated and the attack) and `verified`; `discarded` lists the removals left out as redundant or harmless,
  with the reason.

`node bench/real/verify.ts [--write] [filter]` is the label check: it decompiles each variant and its clean build and
prints, at the variant's instruction, the check-related tokens of the decompiled code that differ (Anchor error
constants, ProgramError returns, logged messages, `Signer::try_accounts`, memcmp / sol_memcmp, PDA derivations, calls of
the function returning MissingRequiredSignature), the same over the whole program, and the per-account checks the
analysis finds in one build only; `--write` records them in `variants.<v>.verified` (`note`: a hand-written addition
where the tokens do not show it, e.g. a Signer replaced by a SystemAccount).

`bench/run.ts` prints one line per set: clean programs, false findings on them (+ validation_consistency
inconsistencies, instructions the analysis does not find), and for `oss` the variants caught: an accepted rule reported
at the variant's instruction that the clean build does not already report there.

## Eval pairs

`eval/analyze.ts` decompiles each real-world vuln / fixed pair of `eval/cases.json` (with its IDL) and looks for a
signal at `ground_truth.target` (instruction + account names as the analysis names them): a finding (`finding`), or
only an informational one (`informational`: a finding of confidence info, a validation_consistency inconsistency, a
stored-key gap or a program account no stored field of which is compared); `missed` otherwise. `fixed` is `clean` when
no such signal is left at the target in @fixed. `--verbose` lists the signals.

Incident-class pairs: `spl_lending_oracle_status` (SPL #2618, Pyth aggregate status) and `solend_oracle_conf` (Solend
#52, Pyth status + confidence), target refresh_reserve / init_reserve with `rules: ["oracle-unvalidated"]`. Not added:
introspection (no small public fix pair found; wormhole_bridge already covers the unchecked Instructions sysvar; the
marginfi 2025 flash-loan bug is a flag missing in transfer_to_new_account, in a large Anchor workspace), stale after
CPI (the only fix commits found are self-described no-ops or bundled audit fixes of unaudited hobby programs),
Token-2022 received amount (no single-property program fix found; the public fixes are SDK-side quote code).

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
