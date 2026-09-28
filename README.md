# sol-bytecode-decompiler

Decompiles deployed Solana programs (sBPF `.so`, SBPF v0–v3) into compact, **semantically exact**
TypeScript, made to be read by AI models (and humans) reviewing many programs, plus a derived
program analysis (privileges, checks, CPIs, PDAs, state writes, ranked findings) from the same run.

* works on stripped mainnet binaries: native, Anchor, pinocchio, hand-written asm; also C / Zig SDK, Solang,
  the deprecated loader's unaligned input and sBPF v2 / v3 builds (compatibility set: [compat/README.md](compat/README.md))
* fetches programs by address from any RPC endpoint you provide (no built-in endpoint)
* one file per instruction handler, self-contained per-instruction bundles, an instruction index
* recognizes generic library code (Rust std, solana-program, anchor-lang, spl, …) and shows it as one-line
  typed stubs with real Rust names instead of decompiling it
* names instructions, accounts, account fields, well-known program ids, error codes, strings; decodes CPIs
* every function can be checked against an independent sBPF interpreter (`sbpf-equiv`, see [Exactness](#exactness))

Written in Rust; the output is TypeScript under a small documented runtime model (`lib.d.ts`).

## Install

```sh
git clone https://github.com/exreve/sol-bytecode-decompiler && cd sol-bytecode-decompiler
cargo install --path crates/sbpf-cli        # installs sbpf-decompile and sbpf-selector
```

Or build everything in place (the decompiler and the development tools) with `cargo build --release`; the
binaries are in `target/release/`. Needs a stable Rust toolchain; no other dependency.

## Usage

```
sbpf-decompile <program> [-o out.ts | -o outdir/] [--rpc <url>] [--idl <file.json>] [--full]
sbpf-decompile <program A> <program B> [-o report.txt] [--rpc <url>]

  <program>         a local .so file ("-" reads it from stdin), or a program address fetched with --rpc
                    (its on-chain Anchor IDL is used when published)
  -o out.ts         write a single file (default: stdout)
  -o outdir/        write a project: index.ts, bundle/<ix>.ts, ix/, shared.ts, entrypoint.ts, lib.d.ts, security/
  --idl file.json   Anchor IDL (instruction args/accounts, account layouts, error names)
  --full            also decompile recognized library code (default: one-line typed stubs)
  two programs      compare them (upgrade diff / fork matching); long lists are shortened on the terminal,
                    complete with -o
```

```sh
sbpf-decompile program.so -o program.ts                                  # a local binary, one file
sbpf-decompile <program address> --rpc <your rpc url> -o program/        # a deployed program, as a project
sbpf-decompile old.so new.so                                             # what changed between two builds
```

Output is always the most readable exact form; there are no modes to choose, and the program analysis
(`security/`) is always produced with the decompilation. Recipes, the output format and the runtime model:
[docs/USAGE.md](docs/USAGE.md).

Speed (8 threads): token 0.13 s, token-2022 0.27 s, whirlpool (173k instructions) 0.5 s, jupiter (258k
instructions) 0.9 s.

## Output

```ts
// instruction handler: swap (discriminator sha256("global:swap")[..8] = 0xc88775e1919ec6f8)
// accounts [idl]: 0 token_program [= TokenkegQ…], 1 token_authority [signer], 2 whirlpool [mut], …
// args [idl]: amount: u64, other_amount_threshold: u64, sqrt_price_limit: u128, amount_specified_is_input: bool, a_to_b: bool
function ix_swap(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	sol_log("Instruction: Swap", 0x11)
	…
	const args: SwapArgs = ix_args
	const amount = args.amount
	if (2 > amount_specified_is_input) { …

function accounts_set_fee_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const whirlpools_config: AccountInfo = ld64(s108)
	if (whirlpools_config.is_writable == 0) { …anchor::ConstraintMut… }

	// CPI TOKEN_PROGRAM.Transfer { source: q + 8 (w), destination: r + 8 (w), authority: s + 8 (s), amount: ah }
	// PDA find_program_address(["whirlpool", *ao, *ap, *aq, u16 ld16(s2a2) [ix data?]], program *(ld64(s2b0)))
```

Everything printed is executable under the runtime model and verified against the bytecode. Names, view types and
comments are derived and say where they come from (`[idl]`, `[str]`, `[known]`, `[heur]`, `[exec]`). The project
output (`-o dir/`) has an `index.ts`, one `bundle/<ix>.ts` per instruction and `security/` (summary.md, one
`<ix>.md` per instruction, analysis.json, fingerprints.json). For AI review: give the model
`security/summary.md` + `index.ts` + `lib.d.ts`, then one `bundle/<ix>.ts` at a time with its `security/<ix>.md`.

## Exactness

Every transformation is an identity on the VM semantics (agave `solana-sbpf` interpreter, including quirks such
as SBPF v0 `add32/sub32/mul32` sign-extending their result), with one documented assumption: stack slots of the
current function are only accessed through frame-pointer-derived addresses (true for every memory-safe execution).
Traps (division by zero, memory faults) are never dropped or reordered across side effects.

`sbpf-equiv` checks this differentially for **every function**: an independent sBPF interpreter and an evaluator
of the emitted TypeScript (exactly the documented semantics) run on the same random arguments and memory with
identically stubbed calls; the traces — calls with arguments, stores outside the frame, frame state at every call,
return value, abort — must match.

```sh
sbpf-equiv program.so 3 [--idl idl.json]      # expected: 0 failing functions
```

## Documentation

| | |
|---|---|
| [docs/USAGE.md](docs/USAGE.md) | recipes, output layout, runtime model, program diff, library code, tools |
| [docs/INTERNALS.md](docs/INTERNALS.md) | architecture (crates, pipeline), determinism, performance, regression guards, how names / views / annotations are recovered |
| [docs/ANALYSIS_SPEC.md](docs/ANALYSIS_SPEC.md) | the program analysis (`security/`): spec, rules, known gaps |
| [docs/DUMPS.md](docs/DUMPS.md) | `sbpf-dump`: per-stage dumps of the pipeline (format) |
| [bench/README.md](bench/README.md), [eval/README.md](eval/README.md), [compat/README.md](compat/README.md) | analysis benchmark, real-world vulnerability pairs, compatibility set |

## Development

```sh
cargo build --release && cargo test --release
target/release/sbpf-equiv samples/token.so 2           # equivalence on a sample
target/release/sbpf-compat                             # compatibility set
target/release/sbpf-bench                              # analysis benchmark (score)
target/release/sbpf-fixtures --fixtures <golden dir>   # whole-output regression guard (docs/INTERNALS.md)
```

CI (`.github/workflows/ci.yml`) runs the build, the tests, `sbpf-equiv` on the samples, `sbpf-compat` and
`sbpf-bench` (minimum score 85).
