# Analysis benchmark

Ground truth for the analysis layer (`crates/sbpf-read/src/analysis/`, docs/ANALYSIS_SPEC.md): small programs compiled from source,
their expected facts, and single-property variants whose expected finding is known.

    sbpf-bench [--verbose] [filter]

It decompiles every `bin/*.so` as the CLI project output does (`-o dir/ [--idl]`), reads `security/analysis.json`
and prints TP / FP / FN, recall, precision and F1 per category, then one `score` line (mean F1 of the six
categories). `--verbose` lists the variants (caught / MISSED), every miss and every false report. Without a filter it
also scores the eval pairs (below); `sbpf-bench pairs` runs only those. ~10 s. The `sbpf-bench*` tools are built
with the workspace (`cargo build --release`, binaries in `target/release/`) and find `bench/` from their crate.

## Generated programs (bench/gen)

`sbpf-bench-gen` writes 9 programs from instruction templates (`crates/sbpf-bench/src/gen/anchor.rs`, `native.rs`,
`risk.rs`; the two `*_risk` programs are described under Incident classes below):
`g_a31_vault`, `g_a31_pool` (Anchor 0.31.1), `g_a29_vault`, `g_a29_pool` (the same templates under Anchor 0.29.0 /
solana-program 1.16.27), `g_n_bank`, `g_n_amm` (solana-program 2.2.1, spl-token), `g_p_jar` (pinocchio 0.8.4). Each
template instruction is clean as written and names the properties its `v_<id>` features remove (signer, has_one /
stored key, owner, discriminator / type tag, CPI program id, stored bump, uninitialized check, sysvar address,
duplicate-account check, remaining-account key, close zeroing, checked arithmetic, zero-supply guard, token mint /
authority, one of several instructions' validation). The generator writes the crates (`bench/gen/programs`,
`bench/gen/programs29`: two cargo workspaces), the IDLs (`bench/idl/g_*.json`) and `bench/expected/g_*.json` with
`"generated": true`; build with `WS=bench/gen/programs sh bench/build.sh g_` and `WS=bench/gen/programs29 sh
bench/build.sh g_` (binaries in `bench/bin/`).

`sbpf-bench` scores them for rules only, apart from the six categories: a variant is caught when one of its accepted
rules is reported at its instruction (`~consistency`: a validation_consistency inconsistency there); every finding on a
generated base is a false finding (inconsistencies on a base are counted as informational noise); findings a variant
adds besides its expected ones are listed as unexpected (`--verbose`).

### Incident classes (g_a31_risk, g_n_risk)

`gen/risk.rs`: a lending reserve (vault PDA authority, ledger per user, TransferChecked through the token
interface, so SPL Token and Token-2022 mints) under Anchor 0.31 (`g_a31_risk`) and solana-program 2.2.1 (`g_n_risk`,
token CPIs built by hand, tags 0-7). The Instructions sysvar is read by a hand-written parser (both programs, so the
key check is the only difference) and the Pyth v2 price account by a hand-written layout (magic @0, type @8, expo @20,
timestamp @96, price @208, conf @216, status @224). The incident rules are crates/sbpf-read/src/analysis/incidents.rs
(docs/ANALYSIS_SPEC.md, Incident-class rules):

| class | instruction | variants (both programs unless noted) | accepted rules |
|---|---|---|---|
| introspection | flash_borrow | `ix_sysvar_unchecked` (sysvar key), `ix_program_unchecked` (repay's program id), `ix_absolute_index` (caller's absolute index instead of current + 1), `ix_repay_unbound` (repay's reserve / amount not compared) | `introspection-unchecked`, `flash-repay-unbound` (repay), `sysvar-account-unchecked` (sysvar) |
| stale after CPI | withdraw | `no_reload` (Anchor: vault.amount after the transfer without reload()), `stale_copy` (native: balance read before the CPI) | `stale-after-cpi` |
| Token-2022 amount | deposit | `nominal_amount` (credits the argument, not the vault balance delta) | `token2022-amount-assumed` |
| oracle | borrow | `oracle_no_status`, `oracle_no_conf` (conf <= 2 %), `oracle_no_staleness` (Clock - timestamp <= 60 s) | `oracle-unvalidated` |
| signer forwarding | route / swap_user | `signer_untrusted_pda` (vault PDA signs for an unchecked program), `user_signer_untrusted` (the caller's signature forwarded) | `signer-to-untrusted-program`, `cpi-unchecked-program` |
| rounding | deposit / withdraw | `round_mint_ceil` (shares minted rounded up), `round_burn_floor` (shares burned rounded down) | `rounding-favors-user` |
| admin drain | admin_sweep | none: informational | `fund_movers` |

`fund_movers` (expected file): `[{ ix, authority, from, index? }]`, an authority-only instruction that can move user
funds to a destination of its choosing. It must not be a finding (every base finding is false) and is expected in
analysis.json as `fund_movers: [{ instruction, authority, ... }]` (authority: the account name, or `account[index]`
for native); `sbpf-bench` prints `fund movers listed n/m` (missing section: all NOT LISTED).

## Realistic and open-source sets (bench/real, bench/real29)

Hand-labelled programs of realistic size, scored for rules only and apart from the six categories and the generated
(template) set; `expected.set` selects the set. Build with `WS=bench/real sh bench/build.sh <crate>` (Anchor 0.31.1,
solana-program 2.2.1, pinocchio 0.8.4) and `WS=bench/real29 sh bench/build.sh r_a29_` (Anchor 0.29.0); IDLs with
`sbpf-bench-real-idl`.

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

`sbpf-bench-verify [--write] [filter]` is the label check: it decompiles each variant and its clean build and
prints, at the variant's instruction, the check-related tokens of the decompiled code that differ (Anchor error
constants, ProgramError returns, logged messages, `Signer::try_accounts`, memcmp / sol_memcmp, PDA derivations, calls of
the function returning MissingRequiredSignature), the same over the whole program, and the per-account checks the
analysis finds in one build only; `--write` records them in `variants.<v>.verified` (`note`: a hand-written addition
where the tokens do not show it, e.g. a Signer replaced by a SystemAccount).

`sbpf-bench` prints one line per set: clean programs, false findings on them (+ validation_consistency
inconsistencies, instructions the analysis does not find), and for `oss` the variants caught: an accepted rule reported
at the variant's instruction that the clean build does not already report there.

## Eval pairs

`sbpf-bench` (`sbpf_bench::eval`) decompiles each real-world vuln / fixed pair of `eval/cases.json` (with its IDL) and looks for a
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
  in the `sbf-builder` container (see `sbpf-refbuild` for the toolchain); not needed to run the bench.
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

    sbpf-bench-corpus [corpusDir=corpus] [--budget s=1800] [--timeout s=240] [--jobs n] [--save]

Decompiles every `corpus/*.so` (with `corpus/idl/<id>.json` when present; ~1 min on 6 workers) and prints per rule the
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

Validation consistency (informational, no rule; crates/sbpf-read/src/analysis/consistency.rs): 100 inconsistencies in 28 of the 400
programs (first version, owner / type / signer / address included: 263 in 45). A spot-check of 10 corpus hits found no
clear true positive (Anchor loaders the analysis does not see load, a counterpart created by the instruction, labels of
the same field under two roles, SPL token's implicit owner rules), so it stays a view. Eval pairs: spl_lending_flashloan
flash_loan (reserve: no owner check, 6/6 others) and solend update_reserve_config (reserve: no stored-key relation with
the lending market, 4/4 others) show in @vuln only; bench clean bases: none. Stored keys in summary.md: 25 programs
(<= 5 lines each). Other rules unchanged by the pass except `cpi-unchecked-program` 1611 → 1606 findings (a check made
word by word now counted on every non-failing path).

Incident-class rules (crates/sbpf-read/src/analysis/incidents.rs; generated variants caught / false findings on the clean bases (generated,
realistic r_*, open-source o_*) / 400-program corpus: programs, findings, per 100 programs):
`introspection-unchecked` 6/6, 0, 4 / 4 / 1.0 (current-index parses with no key check found; marginfi's sorted-array
`ld16(a + 2i - 2)` and Token-2022's check_id in library code were false hits, fixed); `flash-repay-unbound` 2/2, 0,
2 / 2 / 0.5 (signature-verification programs with a token outflow); `stale-after-cpi` 2/2, 0, 0 / 0 (first version: 36 /
119, Anchor AccountInfo words and non-token CPIs; now token CPIs only, value words compared directly);
`token2022-amount-assumed` 2/2, 0, 1 / 1; `oracle-unvalidated` 6/6, 0, 1 / 1 (first version 2 / 11: Drift structs with
fields at the Pyth offsets; now magic compared on the object, or expo and price type both read); `signer-to-untrusted-program`
3/4 (+ merged into cpi-unchecked-program at the same site; native user_signer_untrusted: the account model of that build
resolves no account), 0, 4 / 6 (+ 8 informational: the caller's own signature forwarded, a swap router);
`rounding-favors-user` (experimental, low) 4/4, 0, 0 / 0. Eval: spl_lending_oracle_status and solend_oracle_conf vuln
finding / fixed clean; wormhole_bridge tag_7 finding without the account (Solitaire's account struct: the parse's
account is not resolved, so account[3] is not named). Fund movers: 2/2 admin_sweep listed.

Precision pass (findings on the 400 programs, before → after, baseline refreshed first): all 3042 → 826;
`cpi-unchecked-program` 1596 → 82 (a program id traced to an account key only, checked accounts / token builders
excluded, one per account and instruction), `caller-controlled-sensitive-param` 325 → 39, `share-price-zero-supply`
269 → 1 (spot-checked hits were fixed-point helpers, products, a divisor of 1), `close-without-zeroing` 181 → 102,
`signer-not-related-to-authority` 218 → 184, `value-move-no-signer` 204 → 190, `state-write-ungated` 78 → 57,
`unchecked-arithmetic` 58 → 39; new behavior-based `sysvar-account-unchecked` 2 (info, account not identified),
`reinit-unchecked` (native) 4 in 1 program.


Generated variants can be marked `notExploitable` in the templates (bench/gen): they are still built but listed under
`discarded` in the expected file (with the reason) and not scored. Currently: the Anchor pools' `cpi_token_unchecked`
(anchor_spl invokes the constant token program id), g_n_amm `cpi_unchecked` (the spl-token instruction builder rejects
other program ids) and the native/pinocchio `no_owner` withdraws (the runtime rejects debiting or writing an account the
program does not own).
