# Usage guide

Install with `cargo install --path crates/sbpf-cli` (gives `sbpf-decompile` and `sbpf-selector`), or build
everything with `cargo build --release` and run the binaries from `target/release/`. No configuration.

```
sbpf-decompile <program> [-o out.ts | -o outdir/] [--rpc <url>] [--idl <file.json>] [--full]
sbpf-decompile <program A> <program B> [-o report.txt] [--rpc <url>]      # compare two programs
```

## Decompile

```sh
sbpf-decompile program.so                        # print to the terminal
sbpf-decompile program.so -o program.ts          # one file
sbpf-decompile program.so -o program/            # a project (recommended for big programs)
```

A deployed program, by address — bring your own RPC endpoint (there is no built-in one):

```sh
sbpf-decompile whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc --rpc https://your-rpc.example -o whirlpool/
```

If the program published an Anchor IDL on-chain it is used automatically (instruction arguments,
account names and flags, account data fields, error names). For a local binary, pass the IDL file:

```sh
sbpf-decompile program.so --idl idl.json -o program/
```

From the Solana CLI through stdin:

```sh
solana program dump <address> /dev/stdout | sbpf-decompile - -o program/
```

Upgradeable programs are resolved through their programdata account; loader v4 and the legacy loaders work too
(a `BPFLoader1111…` program's input is modeled unaligned, as that loader serializes it; without the owner, the
entrypoint's deserializer tells). A warning goes to stderr when the code has opcodes its declared sBPF version lacks.

## What you get (`-o program/`)

A Solana program has one entrypoint that dispatches on instruction data; its public API is the set of
instruction handlers.

```
program/index.ts        start here: program summary, instruction table (name, discriminator, handler export; args/accounts with an IDL)
program/bundle/<ix>.ts  one instruction, self-contained: handler + the user code it reaches (nearest calls first, up to
                        30k lines, the rest declared with the place of its body) + the stubs it needs (an instruction a
                        native processor handles inline: the processor cut down to the paths its tag takes)
program/ix/<ix>.ts      the handler and helpers used only by it
program/shared.ts       helpers used by several instructions
program/entrypoint.ts   entrypoint, dispatcher, remaining code
program/lib.d.ts        runtime model (what every helper means), syscalls, library stubs
program/security/       derived analysis: summary.md (read first), <ix>.md, analysis.json;
                        fingerprints.json (per-function hashes, for diffing and fork matching)
```

For AI review: give the model `security/summary.md` + `index.ts` + `lib.d.ts`, then one `bundle/<ix>.ts` at a
time with its `security/<ix>.md` (privileges and checks found, CPIs, PDAs, writes, each with its bundle line).
The security views are derived and over-approximate (`not_found` = no check recognized, not a proof of absence);
the decompiled code stays the source of truth. A single-file output (`-o out.ts`) carries a short summary comment.

## Reading the output

Names, view types and comments are derived and say where they come from:

| tag | source |
|---|---|
| `[idl]` | the Anchor IDL (`--idl`, or published on-chain for a fetched program) |
| `[str]` | the program's own strings: `"Instruction: X"` logs, Anchor account-error names |
| `[known]` | well-known program ids, sysvars, SPL layouts |
| `[heur]` | structural inference: verify before relying on it |
| `[exec]` | read from concrete runs of the function in the reference interpreter |

Untagged names are plain temporaries (`a..e` = register arguments r1..r5, `ret` an out parameter, then `f, g, …`;
`s30` stack objects, `res` / `arg` a call's result / argument object where the slot is reused; `fn_<addr>` unnamed
functions). How each name, view and annotation is recovered: [INTERNALS.md](INTERNALS.md).

### Runtime model

Also emitted as `lib.d.ts` / the single-file prelude.

| construct | meaning |
|---|---|
| values | every value is a `u64`; `+ - * <<` wrap mod 2^64, `/ %` unsigned, `>>` logical, `sar()` arithmetic |
| `x as u8/u16/u32` | truncate; `x as i8/i16/i32` truncate + sign-extend |
| `(a as i64) < (b as i64)` | signed comparison (relational ops compare mathematically) |
| `ldN(p)`, `stN(p, v, …)` | N-bit little-endian load/store (extra values go to `p+N`, `p+2N`, …) |
| `copy(d, s, n)` | n bytes copied as ascending 8-byte words |
| `c ? a : b` | select (from if-conversion; only the chosen arm is evaluated) |
| `popcount clz ctz min max smin smax sat_sub` | pure helpers recognized from bit tricks / branches (`clz(0) = 64`, `sat_sub(a, b) = a >= b ? a - b : 0`) |
| `memeq(p, q, n)` | n bytes at p equal n bytes at q, compared as ascending 8-byte words, stopping at the first difference |
| `keyeq(p, "<base58>")` | the 32 bytes at p equal that public key (same word-wise comparison) |
| `rc_inc(p[, x])` | Rc count increment: `x = ld64(p)` (unless given); `st64(p, x + 1)`; `abort()` if x was `-1` |
| `rc_dec(p[, x])` | Rc drop: `x = ld64(p)` (unless given); `st64(p, x - 1)`; if x was 1, `st64(p + 8, ld64(p + 8) - 1)` |
| `rc_release(p[, x])` | Rc strong-count release: `x = ld64(p)` (unless given); `st64(p, x - 1)`; true when x was 1 |
| `fp`, `s30` | frame pointer; `s30 = fp - 0x30` names a stack object (`s30 + 8` = its field at +8) |
| `p5, p6, …` | arguments 6+ (SBF passes them through the caller's frame; turned back into parameters) |
| `undef` | a register value left over by a callee (unspecified); also variables read before assignment and omitted trailing call arguments |
| `"text"` argument | address of the first occurrence of those UTF-8 bytes in program memory (next argument is the length) |
| memory map | `0x1_0000_0000` program/rodata, `0x2_…` stack, `0x3_…` heap, `0x4_…` input |
| `x: AccountInfo`, `x.is_signer` | typed view: `x.f` is exactly the load / address its declaration gives, `x.f = v` the store (a scalar or `ref<>` field) |
| `x: S_2a00_b`, `x.f0x18_u64`, `acc.d0x29_u16` | inferred view (`[heur]`): fields named after their offset and size (`d…`: offset in the account data); still exactly the load / store at that offset |
| `x[k]`, `x.f[k]` | for a view declared `extends sized<N>`: the k-th such object from x (`x + k * N`) |
| `ret_tail_3(ret, err, r)`, `tail_7(…)` | outlined tail: a function defined in the output (`// outlined tails` section, `outlined.ts`) whose body is exactly the statements (ending in a return) each call replaces; its arguments are the values and stack-object addresses they use |

Style: tabs, no semicolons, short variable names.

## Program analysis (`security/`)

Computed from the same IR in the same run (a few % of the run time); spec and known gaps in
[ANALYSIS_SPEC.md](ANALYSIS_SPEC.md).

* `summary.md`: ranked findings of a rule engine (leads for review, not verdicts: unchecked CPI programs (high when
  PDA-signed), missing signers / authority relations, bypassable checks, unbound recipients, unchecked arithmetic,
  share-price divisions, closes, sysvar accounts read without an id check, PDA bumps from instruction data, the same
  account passed twice, account types not checked, ignored CPI results, truncating casts, unchecked remaining
  accounts, init_if_needed reinitialization), instructions ranked by sensitivity (value movement, PDA signing, CPIs,
  authority / state writes, closes) with their effects, state writes per field, authority fields, a state-machine
  table.
* `<ix>.md`: account privilege matrix (what the IDL expects vs what the code checks), constraints per account,
  CPIs (program, instruction, accounts, signer seeds), PDAs, account writes, key/field relations between accounts,
  which checks dominate each sensitive operation (and paths around them), authorization chains, caller-controlled
  vs validated values, arithmetic on value paths, a property checklist per operation; each item linked to
  `bundle/<ix>.ts:<line>`.
* `analysis.json`: all of it (written by `crates/sbpf-read/src/analysis/render.rs`).
* Size budgets: summary.md ≤ 150 lines, `<ix>.md` ≤ 400 lines, analysis.json ≤ 2 MB; beyond them the
  lowest-priority detail (path conditions first) is dropped with a "… N more" note / `<key>_omitted` counts.
* `fingerprints.json`: per-function address-independent hashes (used by the program diff).

Statuses: `found` (dominates every sensitive operation), `partial` (some paths), `not_found` (none recognized —
not a proof of absence), `runtime` (enforced by Solana). Native programs are split per instruction on their tag
dispatch. The analysis is over-approximate; the decompiled code is the source of truth. Its accuracy is measured
by [bench/](../bench/README.md): small programs compiled from source with known facts and single-bug variants.

## Library code

Generic code (Rust core/alloc, solana-program, borsh, anchor-lang internals, …) is not decompiled by default.
Recognized library functions called from user code get one typed line; `--full` decompiles them too:

```ts
declare function RawVec_reserve_for_push(a: u64, b: u64): void // lib alloc::raw_vec::RawVec<T,A>::reserve_for_push
```

Recognition uses position-independent function fingerprints: `data/libsigs.json` (fingerprints shared by ≥ 3
unrelated code families among 400+ mainnet programs), `data/libnames.json` (Rust names from symbolized reference
builds with the real platform-tools), and behavior for unnamed u128 builtins (`__multi3`, `__udivti3`, …).
A crate is never elided from the program that *is* that crate (decompiling spl-token-2022 shows its own code).

Instruction / account / event names: `data/selectors.json.gz` holds 7k exact Anchor discriminators from ~300
IDLs and Anchor sources, plus a verb × noun vocabulary for unresolved discriminator-like constants. The data
files are embedded in the binary at build time.

## Many programs

```sh
for p in $(cat program_ids.txt); do sbpf-decompile "$p" --rpc https://your-rpc.example -o "out/$p/" || echo "failed: $p"; done
```

## Discriminators

```sh
sbpf-selector 0xc88775e1919ec6f8    # a constant as printed in the output -> i:swap
sbpf-selector f8c69e91e17587c8      # raw instruction-data bytes work too
sbpf-selector deposit               # name -> instruction / account / event discriminators
```

## Compare two programs

```sh
sbpf-decompile old.so new.so                         # upgrade diff: changed/added/removed functions per instruction
sbpf-decompile fork.so original.so                   # fork matching: share of user code identical / near
sbpf-decompile <addr A> <addr B> --rpc <url>         # deployed programs (on-chain IDLs used when published)
sbpf-decompile old.so new.so -o report.txt           # complete lists (the terminal shows shortened ones)
```

Works from bytecode only (~0.1 s for 10k instructions, ~0.4 s for 250k) and prints a verdict (`same code (e.g.
redeployed at a new address)`, `same program code; toolchain/library version changed`, `same program, modified`,
`related programs (fork family / shared code base)`, `different programs`), the share of user code identical /
near-identical, instruction arms added / removed, library differences as one line, and the user functions changed /
added / removed with the instructions reaching them. `same code` means the same set of function hashes (addresses,
call targets and rodata locations normalized); "constants only" lists the rodata constants that changed (keys in
base58, texts).

## Check a decompilation

```sh
sbpf-equiv program.so 3 [--idl idl.json]     # the output as the CLI prints it
sbpf-equiv program.so 3 --raw                # the plain form (no names / views)
```

Runs every function on random inputs in an independent sBPF interpreter and in the emitted TypeScript,
and compares calls, memory writes, return values and aborts. Expected: `0 failing functions`. Trials that touch
the current frame through a non-frame pointer (memory-unsafe) are reported as skipped. Over a mainnet corpus:
`scripts/equiv-corpus.sh [maxBytes] [trials] [binDir]`.

## Maintenance tools

All in the workspace (`cargo build --release`), run from the repository root:

```sh
sbpf-fetch samples --rpc <url>                                # sample programs from mainnet
sbpf-fetch corpus --rpc <url> [target=300] [outDir=corpus]    # mainnet corpus + on-chain Anchor IDLs
sbpf-fetch compat                                             # the on-chain members of the compatibility set
sbpf-build-libdb corpus 3                                     # data/libsigs.json
sbpf-refbuild && sbpf-build-libnames                          # symbolized builds -> data/libnames.json
sbpf-gh-anchor-names && sbpf-build-selectors <idl/source dirs...>   # data/selectors.json.gz
bench/build.sh                                                # rebuild bench binaries (sbf-builder container)
```

`sbpf-refbuild` needs Solana platform-tools in `~/.cache/sbf-tools/<version>` (toolchains newer than v1.41 run
inside an `ubuntu:24.04`-based container because they require glibc ≥ 2.34).

Development tools: `sbpf-readability prog.so|out.ts … [--idl x.json] [--json]` (raw `ldN`/`stN` vs named field
accesses, lines, density), `sbpf-dump` (per-stage dumps and timings, [DUMPS.md](DUMPS.md)), `sbpf-fixtures`
(golden-output regression guard, [INTERNALS.md](INTERNALS.md#regression-guards)); the benchmarks and the
compatibility set: [bench/](../bench/README.md), [eval/](../eval/README.md), [compat/](../compat/README.md).
