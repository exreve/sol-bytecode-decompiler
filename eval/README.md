# Reviewer eval: does the decompiler output help an AI reviewer?

A dataset of real-world, publicly documented and since-fixed access-control / validation bugs in open-source Solana
programs, plus synthetic cases from `bench/`, turned into review packets (decompiler output only) with a scorer.

    sh eval/build.sh [case] [vuln|fixed]     # rebuild eval/bin/ from upstream sources (not needed: binaries are committed)
    node eval/packets.ts [prog_NN ...]        # generate eval/packets/prog_NN/{code,full}/ (not committed, ~2 min)
    node eval/score.ts [--verbose] [--min-confidence x] [filter]   # score eval/results/

**Never give a reviewer anything but one packet directory**: `cases.json`, `bin/`, `build.sh`, this README and the
results name the programs and the bugs.

## Real-world cases

Each case is built twice from the upstream repository: the last commit before the fix (`vuln`) and the fix commit
(`fixed`, a negative). Binaries are stripped as `cargo build-sbf` deploys them; Anchor cases also get an IDL generated
from the source (`bin/<case>@<variant>.json`, see `idlgen/`).

| case | program | issue (instruction: property) | category | vuln | fixed | provenance |
|---|---|---|---|---|---|---|
| wormhole_bridge | Wormhole core bridge (native, solitaire) | verify_signatures: instructions-sysvar account address unchecked (Feb 2022 exploit, 120k wETH) | sysvar-unchecked | 79ab522f | e8b91810 | fix commit, Kudelski / Halborn post-mortems |
| solend_lending | Solend token-lending (native) | UpdateReserveConfig: reserve not bound to the signer's lending market (Aug 2021 attack) | account-confusion | 871935ca | 132d74cf | fix commit, Solend incident report |
| spl_lending_flashloan | SPL token-lending (native) | FlashLoan: reserve account owner not checked | missing-owner-check | e8861b27 | 23c487dd | fix commit "lending: add extra owner check" |
| spl_lending_rounding | SPL token-lending (native) | DepositReserveLiquidity / RedeemReserveCollateral: exchange-rate rounding in the user's favour | arithmetic | c24bc966 | c2b28778 | Neodyme disclosure (Dec 2021), PR #1883 |
| candy_machine_v2 | Metaplex Candy Machine v2 (Anchor 0.17) | initialize_candy_machine: live candy machine can be re-initialized (hijack) | reinitialization | 4f835f73 | e9ef3764 | PR #1366, Solens write-up |
| cashio_brrr | Cashio brrr (Anchor 0.22) | print_cash: bank / collateral chain not bound to the real crate mint (Mar 2022 infinite mint) | account-confusion | a51c3c59 | 7df65818 | fix commit, samczsun / Sec3 analyses |
| raydium_clmm | Raydium CLMM (Anchor 0.29) | increase_liquidity(_v2): remaining_accounts[0] used as the tick-array bitmap extension unchecked | remaining-account-unchecked | d0cb69cc | e6dd1d56 | fix commit, Immunefi bugfix review ($505k) |
| raydium_cp_swap | Raydium CP-Swap (Anchor 0.29) | deposit: zero token amount after rounding / zero LP amount not rejected (pool drain) | input-validation | cfdb70a8 | 183ddbb1 | fix commit, Immunefi bugfix review |

Full commits, links and the ground-truth description (instruction, accounts, missing property, accepted aliases and
keywords) are in `cases.json`. Notes:
- The Immunefi CLMM review links commit 83b5a471, which is an unrelated fix; e6dd1d56 ("fix for
  tick_array_bitmap_extension account check", 2024-01-11) is the one adding the check it quotes.
- The Solend fix branch starts at 871935ca, before the oracle-update commits merged the same day; the pair differs by
  the fix only. Same for every pair here (fix commit vs its parent), except cashio, whose fix commit also disables
  print_cash / burn_cash outright.
- spl_lending_flashloan and spl_lending_rounding are the same program at two dates (and Solend is a fork of it).

### Toolchain

All builds run `cargo build --release --target sbf-solana-solana` in the `sbf-builder` container (as `bench/build.sh`)
with platform-tools from `~/.cache/sbf-tools`:
- v1.41 (rustc 1.75) with the repository's own `Cargo.lock` for everything from 2021-2022. solana-program < 1.10 gates
  its syscalls / entrypoint on `target_arch = "bpf"`, so these get `RUSTFLAGS=--cfg target_arch="bpf"`.
- Wormhole: solitaire used the removed `const_generics` feature; `build.sh` switches it to `adt_const_params` (plus a
  `ConstParamTy` derive) and sets `EMITTER_ADDRESS` to the mainnet governance emitter, as the repo's Dockerfile does.
- Cashio: `proc-macro2` bumped to 1.0.66 in the lockfile (older ones do not compile on newer rustc).
- Raydium CLMM (no committed lockfile): v1.48 with a lockfile resolved for its rust version (`CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback`).

Not taken: Crema (closed source), Jet v1 borrow bug (health-iteration logic, not access control), the Sec3 stake-pool
report (fix not identifiable), Raydium AMM v4 (key compromise). No candidate was dropped for toolchain trouble.

## Bench cases

12 single-property variants from `bench/bin/` (known rule and instruction, `bench/expected/*.json`), for a mixed set:
a_vault@no_has_one, a_counter@ungated, a_escrow@recipient_unbound, a_mint@no_signer, a_audit@{type_confusion,
cpi_pda_unchecked, bump_from_ix, sysvar_unchecked}, n_vault@no_owner, n_token@cpi_unchecked, n_pool@wrapping_sub,
p_counter@no_signer. They have no fixed counterpart packet (the bench bases are the clean versions).

## Packets

`node eval/packets.ts` copies each binary (and IDL, with its name / address / docs removed) under a neutral id
`prog_NN` (a seeded shuffle; mapping in `cases.json` → `packets`), runs the CLI (`node src/cli.ts prog_NN.so -o dir/
[--idl prog_NN.json]`) and writes:
- `prog_NN/full/`: the complete project output (index.ts, bundle/, ix/, shared.ts, entrypoint.ts, lib.d.ts, security/);
- `prog_NN/code/`: index.ts (without its pointer line to security/), lib.d.ts, bundle/*.ts, entrypoint.ts (the
  dispatcher and any handler not split into bundle/) and the top-level files these import. No security/.

A program's vuln and fixed binaries get unrelated ids; give a reviewer one of them only. The packet directories are
not committed (they follow the decompiler version): `packets/stats.json` records their size and the decompiler commit.

Sizes at the recorded commit (lines / KB, code → full):

| case | vuln code | vuln full | fixed code | fixed full |
|---|---|---|---|---|
| wormhole_bridge | 13.2k / 396 | 26.5k / 744 | 13.2k / 395 | 26.5k / 744 |
| solend_lending | 4.3k / 194 | 55.2k / 1657 | 4.3k / 194 | 55.1k / 1649 |
| spl_lending_flashloan | 15.6k / 541 | 1458k / 31262 | 15.6k / 542 | 1458k / 31263 |
| spl_lending_rounding | 15.5k / 540 | 1458k / 31261 | 15.6k / 543 | 1345k / 28772 |
| candy_machine_v2 | 13.6k / 374 | 15.9k / 482 | 13.7k / 379 | 16.0k / 487 |
| cashio_brrr | 26.1k / 760 | 37.7k / 1133 | 23.4k / 706 | 31.2k / 982 |
| raydium_clmm | 115k / 3984 | 189k / 6305 | 115k / 3990 | 189k / 6313 |
| raydium_cp_swap | 36.2k / 1188 | 72.0k / 2261 | 36.4k / 1194 | 72.4k / 2274 |
| bench (12, range) | 0.6k-13k / 20-465 | 3.2k-30k / 85-994 | | |

Known output artifacts that affect the packets (decompiler behaviour, left as is):
- SPL token-lending: `security/analysis.json` is ~29 MB and the dispatch shows 45 tags for 14 instructions.
- Solend: only update_reserve_config (the bug's instruction) is split into ix/ + bundle/ + security/<ix>.md; the other
  handlers stay in entrypoint.ts. This singles out the target instruction in both variants.
- Program identity is visible in both variants through the binary's own strings (log messages, source paths): a
  reviewer may recognize a famous exploit from memory. Compare against the fixed negatives to see this.

## Review protocol

The reviewer (model + harness) gets read access to exactly one packet directory (`prog_NN/code/` or
`prog_NN/full/`), no network, no other files, and this instruction, nothing else:

> Review this Solana program for access-control and validation issues; report findings as JSON
> {"findings": [{"instruction": "<instruction name or dispatch tag>", "accounts": ["<account names or indices>"], "issue": "<what is missing and how it is exploited>", "confidence": <0..1>}]}

Save the answer as `eval/results/<prog_NN>/<code|full>/<run>.json`, adding `"tokens_read"` (input tokens the reviewer
consumed) when the harness reports it. Run each packet in both variants and several runs per variant; randomize the
order so a run never sees both packets of one program.

## Scoring

`node eval/score.ts` matches each finding against the case's ground truth:
- instruction: the ground-truth instruction or an alias (native dispatch forms `tag_N`, sibling instructions sharing
  the bug), compared as words (`VerifySignatures` = `verify_signatures`, `tag 1` ≠ `tag_13`);
- plus a ground-truth account (name or index form, in `accounts` or the issue text) or a category keyword in the issue.

Both → hit. Instruction only → **unsure**, printed with the ground truth for a human; record the decision in
`eval/results/overrides.json` (`{"prog_09/code/run1#0": "hit" | "miss"}`). On a vuln packet a hit is **found**,
else **missed**; on a fixed packet a hit is a **false positive** (claiming the fixed bug). Every other finding is an
**other claim**: a real different bug or a false claim, listed by `--verbose` for manual review.
The summary gives per variant (code / full) and set (real / bench): recall on vuln packets, false-positive rate on
fixed packets, other claims per run, unsure count and mean tokens read.
