# sol-bytecode-decompiler

Decompiles deployed Solana programs (sBPF `.so`, SBPF v0–v3) into compact, **semantically exact**
TypeScript, made to be read by AI models (and humans) reviewing many programs, plus a derived
program analysis (privileges, checks, CPIs, PDAs, state writes, ranked findings) from the same run.

* works on stripped mainnet binaries: native, Anchor, pinocchio, hand-written asm
* fetches programs by address from any RPC endpoint you provide (no built-in endpoint)
* one file per instruction handler, self-contained per-instruction bundles, an instruction index
* recognizes generic library code (Rust std, solana-program, anchor-lang, spl, …) and shows it as one-line
  typed stubs with real Rust names instead of decompiling it
* names instructions, accounts, account fields, well-known program ids, error codes, strings; decodes CPIs
* every function is checked against an independent sBPF emulator (see [Exactness](#exactness))

Requires Node ≥ 23.6 (runs the TypeScript sources directly). No runtime dependencies, no install step.

## Quick start

```sh
git clone https://github.com/exreve/sol-bytecode-decompiler && cd sol-bytecode-decompiler

node src/cli.ts program.so -o out.ts                                   # a local binary, one file
node src/cli.ts <program address> --rpc <your rpc url> -o out/          # a deployed program, as a project
```

Output is always the most readable exact form; there are no modes to choose. Recipes: [docs/USAGE.md](docs/USAGE.md).

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
  two programs      compare them (see Program diff); long lists are shortened on the terminal, complete with -o
```

The program analysis (`security/`) is always produced with the decompilation; there is nothing to enable.

Upgradeable programs are resolved through their programdata account; loader v4 and the legacy loaders work too.

Other tools:

| command | what |
|---|---|
| `node src/selector.ts 0xc88775e1919ec6f8` | discriminator → name (`i:swap`); a name → its instruction / account / event discriminators |
| `node --stack-size=65500 test/equiv.ts program.so 3 [--idl x.json]` | check a decompilation against the emulator (expected: `0 failing functions`) |
| `node bench/run.ts [--verbose]` | score the analysis against ground truth ([bench/README.md](bench/README.md)) |

Speed (8-core VM): memo 0.6 s, token-2022 2.2 s, whirlpool (173k instructions) 4.1 s, jupiter (258k instructions) 6.2 s.

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

Everything printed is executable under the runtime model below and verified against the bytecode. Names, view
types and comments are derived and say where they come from:

| tag | source |
|---|---|
| `[idl]` | the Anchor IDL (`--idl`, or published on-chain for a fetched program) |
| `[str]` | the program's own strings: `"Instruction: X"` logs, Anchor account-error names |
| `[known]` | well-known program ids, sysvars, SPL layouts |
| `[heur]` | structural inference: verify before relying on it |
| `[exec]` | read from concrete runs of the function in the reference interpreter |

Untagged names are plain temporaries (`a..e` = register arguments r1..r5, then `f, g, …`; `s30` stack objects;
`fn_<addr>` unnamed functions). How each name, view and annotation is recovered: [docs/INTERNALS.md](docs/INTERNALS.md).

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
| `x: AccountInfo`, `x.is_signer` | typed view: `x.f` is exactly the load / address its declaration gives, `x.f = v` the store |
| `x[k]`, `x.f[k]` | for a view declared `extends sized<N>`: the k-th such object from x (`x + k * N`) |

Style: tabs, no semicolons, short variable names.

### Project layout (`-o dir/`)

A Solana program has one entrypoint that dispatches on instruction data; its public API is the set of
instruction handlers.

```
index.ts        program summary + instruction table (name, discriminator, handler export)
entrypoint.ts   entrypoint, dispatcher, code not owned by a single instruction
ix/<name>.ts    one instruction handler + helpers only it uses
shared.ts       helpers used by several instructions
lib.d.ts        runtime model, used syscalls, library stubs
bundle/<ix>.ts  self-contained: one handler + all user code it reaches + the stubs it needs
security/       summary.md (read first), <ix>.md per instruction, analysis.json, fingerprints.json
```

For AI review: give the model `security/summary.md` + `index.ts` + `lib.d.ts`, then one `bundle/<ix>.ts` at a time
with its `security/<ix>.md`. The single-file output (`-o out.ts`) carries a short analysis summary comment instead.

### Program analysis (`security/`)

Computed from the same IR in the same run (a few % of the run time); spec and known gaps in
[docs/ANALYSIS_SPEC.md](docs/ANALYSIS_SPEC.md).

* `summary.md`: ranked findings of a rule engine (leads for review, not verdicts), instructions ranked by
  sensitivity (value movement, PDA signing, CPIs, authority / state writes, closes) with their effects, state
  writes per field, authority fields, a state-machine table.
* `<ix>.md`: account privilege matrix (what the IDL expects vs what the code checks), constraints per account,
  CPIs (program, instruction, accounts, signer seeds), PDAs, account writes, key/field relations between accounts,
  which checks dominate each sensitive operation (and paths around them), authorization chains, caller-controlled
  vs validated values, arithmetic on value paths, a property checklist per operation; each item linked to
  `bundle/<ix>.ts:<line>`.
* `analysis.json`: all of it (schema in `src/analysis/report.ts`).
* `fingerprints.json`: per-function address-independent hashes (used by the program diff).

Statuses: `found` (dominates every sensitive operation), `partial` (some paths), `not_found` (none recognized —
not a proof of absence), `runtime` (enforced by Solana). Native programs are split per instruction on their tag
dispatch. The analysis is over-approximate; the decompiled code is the source of truth. Its accuracy is measured
by [bench/](bench/README.md): small programs compiled from source with known facts and single-bug variants.

### Program diff

`sbpf-decompile a.so b.so` (files or addresses) works from bytecode only (~0.2 s for 10k instructions, ~2 s for 250k) and prints a
verdict (`same code (e.g. redeployed at a new address)`, `same program code; toolchain/library version changed`,
`same program, modified`, `related programs (fork family / shared code base)`, `different programs`), the share of
user code identical / near-identical, instruction arms added / removed, library differences as one line, and the
user functions changed / added / removed with the instructions reaching them. "Constants only" changes show the
differing rodata constants (keys in base58, texts).

## Library code

Generic code (Rust core/alloc, solana-program, borsh, anchor-lang internals, …) is not decompiled by default.
Recognized library functions called from user code get one typed line:

```ts
declare function RawVec_reserve_for_push(a: u64, b: u64): void // lib alloc::raw_vec::RawVec<T,A>::reserve_for_push
```

Recognition uses position-independent function fingerprints: `data/libsigs.json` (fingerprints shared by ≥ 3
unrelated code families among 400+ mainnet programs), `data/libnames.json` (Rust names from symbolized reference
builds with the real platform-tools), and behavior for unnamed u128 builtins (`__multi3`, `__udivti3`, …).
A crate is never elided from the program that *is* that crate (decompiling spl-token-2022 shows its own code).

Instruction / account / event names: `data/selectors.json.gz` holds 7k exact Anchor discriminators from ~300
IDLs and Anchor sources, plus a verb × noun vocabulary for unresolved discriminator-like constants.

## Exactness

Every transformation is an identity on the VM semantics (agave `solana-sbpf` interpreter, including quirks such
as SBPF v0 `add32/sub32/mul32` sign-extending their result), with one documented assumption: stack slots of the
current function are only accessed through frame-pointer-derived addresses (true for every memory-safe execution).
Traps (division by zero, memory faults) are never dropped or reordered across side effects.

`test/equiv.ts` checks this differentially for **every function**: `src/emu.ts` (an independent interpreter
written from `interpreter.rs`) and `test/evaluate.ts` (executes the emitted TypeScript with exactly the documented
semantics) run on the same random arguments and memory with identically stubbed calls; the traces — calls with
arguments, stores outside the frame, frame state at every call, return value, abort — must match. Trials that
touch the current frame through a non-frame pointer (memory-unsafe) are reported as skipped.

```
node --stack-size=65500 test/equiv.ts samples/token22.so 3                # the output as the CLI prints it
node --stack-size=65500 test/equiv.ts corpus/<id>.so 3 --idl <idl.json>   # with an Anchor IDL
node --stack-size=65500 test/equiv.ts samples/token22.so 3 --raw          # the plain form (no names/views)
npm test                                                                   # unit tests, fuzzer, samples
```

Checked on all bundled samples (memo, token, ata, stake-pool, token-2022, whirlpool, jupiter) and a mainnet
corpus (`scripts/equiv-corpus.sh`).

## Maintainers

```
node scripts/fetch-samples.ts --rpc <url>                     # sample programs from mainnet
node scripts/corpus.ts 400 corpus --rpc <url>                 # mainnet corpus + on-chain Anchor IDLs
node scripts/build-libdb.ts corpus 3                          # data/libsigs.json
node scripts/refbuild.ts && node scripts/build-libnames.ts    # symbolized builds -> data/libnames.json
node scripts/gh-anchor-names.ts && node scripts/build-selectors.ts <idl/source dirs...>   # data/selectors.json.gz
bench/build.sh                                                # rebuild bench binaries (sbf-builder container)
```

`refbuild` needs Solana platform-tools in `~/.cache/sbf-tools/<version>` (toolchains newer than v1.41 run inside an
`ubuntu:24.04`-based container because they require glibc ≥ 2.34).

Dev tools (`node --stack-size=65500 scripts/<tool>.ts prog.so …`): `show.ts <fn>` (IR and output of one function),
`callers.ts <fn>`, `profile.ts` (per-stage timing), `coverage.ts` (function discovery coverage), `libstats.ts`
(library recognition stats), `match-ref.ts` (library signatures vs a symbolized reference build), `readability.ts
prog.so|out.ts …` (raw `ldN`/`stN` vs named field accesses, lines, density).

## Source map

| file | role |
|---|---|
| `src/cli.ts`, `src/rpc.ts` | command line; fetching programs and IDLs over RPC |
| `src/elf.ts` | ELF loader, relocations exactly as the runtime applies them |
| `src/program.ts` | decoding, function discovery, CFG, lifting to IR (all SBPF versions) |
| `src/dataflow.ts` | liveness, interprocedural params/returns/noreturn, variable recovery |
| `src/simplify.ts`, `src/cfgopt.ts` | exact expression simplification, propagation, tail duplication, DSE, jump threading |
| `src/ifconv.ts`, `src/idioms.ts`, `src/stmtidioms.ts` | if-conversion; bit-trick, compare and Rc idioms |
| `src/stack.ts`, `src/stackargs.ts` | stack slot promotion (escape analysis), stack-passed arguments |
| `src/structure.ts` | structuring (stackifier; irreducible CFGs made reducible by node splitting) |
| `src/compact.ts` | store/copy run compaction |
| `src/accounts.ts`, `src/views.ts` | account pointer recognition; typed views |
| `src/anchor.ts`, `src/anchorstate.ts`, `src/state.ts`, `src/idl.ts` | Anchor accounts, in-memory layouts, IDL data layouts, IDL parsing |
| `src/cpi.ts`, `src/exec.ts`, `src/cpiexec.ts` | CPI / PDA / format-string descriptions; concrete runs describing heap-built CPIs |
| `src/taint.ts` | instruction-data taint |
| `src/semantics.ts`, `src/library.ts`, `src/fingerprint.ts`, `src/builtins.ts` | Solana knowledge, library recognition, function signatures, u128 builtins |
| `src/print.ts`, `src/layout.ts` | TypeScript printer, output layout |
| `src/analysis/*` | program analysis: facts, per-instruction reports, dominance/relations/rules, bounded path analyses |
| `src/diff.ts`, `src/selector.ts` | program diff / fork matching; discriminator lookup |
| `src/emu.ts`, `test/` | reference interpreter and equivalence harness |
