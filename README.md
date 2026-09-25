# sol-bytecode-decompiler

Decompiles deployed Solana programs (sBPF `.so`, SBPF v0–v3) into compact, **semantically exact**
TypeScript, made to be read by AI models (and humans) reviewing many programs.

* works on stripped mainnet binaries: native, Anchor, pinocchio, hand-written asm
* fetches programs by address from any RPC endpoint you provide (no built-in endpoint)
* one file per instruction handler, self-contained per-instruction bundles, an instruction index
* recognizes generic library code (Rust std, solana-program, anchor-lang, spl, …) and shows it as one-line
  typed stubs with real Rust names instead of decompiling it
* names instructions (Anchor discriminators, `"Instruction: X"` logs, on-chain IDL), accounts fields,
  well-known program ids, error codes, strings
* every function is checked against an independent sBPF emulator (see [Exactness](#exactness-and-how-it-is-verified))

Requires Node ≥ 23.6 (runs the TypeScript sources directly). No runtime dependencies.

## Quick start

```sh
git clone https://github.com/exreve/sol-bytecode-decompiler && cd sol-bytecode-decompiler
npm install                                  # dev dependencies (tests only)

# a local binary
node src/cli.ts program.so -o out.ts

# a deployed program, by address (any RPC endpoint; none is built in)
node src/cli.ts whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc --rpc https://your-rpc.example -o whirlpool/

# or set the endpoint once
export SOLANA_RPC_URL=https://your-rpc.example
node src/cli.ts TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb -o token22/
```

More recipes: [docs/USAGE.md](docs/USAGE.md).

## Usage

```
sbpf-decompile <input> [options]

input:
  program.so            a local program binary
  <program address>     fetched from an RPC endpoint (needs --rpc or $SOLANA_RPC_URL)
  -                     read the binary from stdin

output:
  (default)             single file to stdout
  -o out.ts             single file
  -o outdir/            project layout (see below)

options:
  --rpc <url>           Solana RPC endpoint (default: $SOLANA_RPC_URL; there is no built-in endpoint)
  --idl <file.json>     Anchor IDL: instruction args/accounts (signer/mut/pda), custom error names
  --program-id <id>     fetch the on-chain Anchor IDL for this program id (with a local input)
  --no-idl              do not fetch the on-chain IDL automatically for an address input
  --save-so <file>      save the fetched binary
  --full                also decompile recognized library functions
  --raw                 no Solana-specific names/comments (the form verified by the tests)
  --exact-memory        keep every stack access in memory (see Exactness)
```

When the input is an address, the program is fetched (BPFLoader 1/2, upgradeable loader via its
programdata account, loader v4) and its on-chain Anchor IDL is used automatically when it exists.

Other tools:

```
node src/selector.ts 0xc88775e1919ec6f8     # discriminator -> name   (i:swap)
node src/selector.ts open_position          # name -> instruction / account / event discriminators
node test/equiv.ts program.so 3             # check the decompilation of every function (see below)
```

Speed (warm cache, 8-core VM): memo 0.8 s, token-2022 4 s, whirlpool (173k instructions) 7 s,
jupiter (258k instructions) 12 s.

## Output

```ts
// instruction handler: swap (discriminator sha256("global:swap")[..8] = 0xc88775e1919ec6f8)
export function ix_swap(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s70 = fp - 0x70, sd8 = fp - 0xd8
	sol_log("Instruction: Swap", 0x11)
	if (memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20) != 0) { ... }
	...
}
```

Runtime model (also emitted as the file prelude / `lib.d.ts`):

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
| `fp`, `s30` | frame pointer; `s30 = fp - 0x30` names a stack object (`s30 + 8` = its field at +8) |
| `p5, p6, …` | arguments 6+ (SBF passes them through the caller's frame; turned back into parameters) |
| `undef` | a register value left over by a callee (unspecified) |
| `"text"` argument | address of those rodata bytes (next argument is the length) |
| memory map | `0x1_0000_0000` program/rodata, `0x2_…` stack, `0x3_…` heap, `0x4_…` input |

Style: tabs, no semicolons, short variable names (`a..e` = register arguments r1..r5, then `f, g, …`).

### Project layout (`-o dir/`)

Solana programs have one entrypoint that dispatches on instruction data; the "public API" is the set
of instruction handlers.

```
index.ts        program summary + instruction table (name, discriminator, handler export)
entrypoint.ts   entrypoint, dispatcher, code not owned by a single instruction
ix/<name>.ts    one instruction handler + helpers only it uses
shared.ts       helpers used by several instructions
lib.d.ts        runtime model, used syscalls, library stubs
bundle/<ix>.ts  self-contained: one handler + all user code it reaches + the stubs it needs
```

Anchor handlers are found from their `"Instruction: <Name>"` log and named `ix_<snake_name>`.

### Annotations (comments only)

* account fields: loads through pointers recognized as a Rust `AccountInfo` (slice iteration with stride
  0x30, typical field accesses, parameters receiving one) or as a raw serialized account record
  (pinocchio style) name the field: `ld8(c + 0x28 /* is_signer */)`, `ld64(x + 0x50 /* data_len */)`;
* `Result<_, ProgramError>` niche values: `0x8000000000000007 /* Err(ProgramError::MissingRequiredSignature) */`,
  the `Ok` value being inferred per program (it depends on the solana-program version);
* public keys: known program ids, 32-byte rodata keys compared/copied by address (`/* key <base58> */`),
  keys written as four constant words; Anchor error codes, discriminators, `ProgramError` return codes;
* `ld64(0x300000000 /* heap bump-allocator cursor */)`; `(p + ld64(p + 0x50) + 0x2867 & -8 /* next account record */)`
  in input parsing loops;
* stores through recognized account pointers name the field too: `st64(f + 0x48 /* lamports */, v)`;
* `Result<(), ProgramError>` with a u32 variant tag (older toolchains; Ok tag inferred per program): constant tag
  stores into such a result get `// Err(ProgramError::InvalidSeeds)`, `// Err(ProgramError::Custom(6008))`, `// Ok`;
* cross-program invocations (`sol_invoke_signed_c/_rust` and thin wrappers) whose instruction is built in the
  frame get a line describing it, read back from the stores along straight-line code:
  `// CPI: program *(n + 8), accounts [h + 8 (w), g + 8 (w), f + 8 (s)], data 9 bytes [u8 3 (Token Transfer if the program is SPL Token), u64 ld64(a + 0x20)]`
  (known program ids by name, signer seeds as strings/keys when constant);
* calls receiving a `fmt::Arguments` built in the frame: `// fmt pieces ["Failed to borrow AccountInfo.lamports: "]`.

## Library code

Generic code (Rust core/alloc, solana-program, borsh, anchor-lang internals, …) is not decompiled
by default. Recognized library functions called from user code get one typed line:

```ts
declare function RawVec_reserve_for_push(a: u64, b: u64): void // lib alloc::raw_vec::RawVec<T,A>::reserve_for_push
```

Recognition uses position-independent function fingerprints (normalized instruction stream; call
targets and code/rodata addresses abstracted):

* `data/libsigs.json` — fingerprints occurring in ≥ 3 unrelated code families among 400+ deployed
  mainnet programs (forks/redeploys are clustered first so forked *user* code is not mistaken for a library);
* `data/libnames.json` — Rust names from symbolized reference builds made with the real Solana
  platform-tools (several toolchain / solana-program / anchor versions).

Crate-aware policy: a crate is never elided from the program that *is* that crate (e.g. decompiling
spl-token-2022 shows its own processor code; programs that merely depend on it get stubs).

## Instruction / account / event names

`data/selectors.json.gz`: 7k exact Anchor discriminators (`sha256("global:<ix>")`, `"account:<Name>"`,
`"event:<Name>"`) from ~300 IDLs and Anchor sources, plus a verb × noun vocabulary expanded lazily at
decompile time for unresolved discriminator-like constants. Program-local strings (type names found
in rodata) are also hashed.

```
node src/selector.ts 0xc88775e1919ec6f8     # -> i:swap   (u64 as printed, or raw byte hex)
node src/selector.ts open_position          # -> instruction / account / event discriminators
```

## Exactness and how it is verified

Every transformation is an identity on the VM semantics (agave `solana-sbpf` interpreter, including
quirks such as SBPF v0 `add32/sub32/mul32` sign-extending their result), with one documented
assumption in the default mode: stack slots of the current function are only accessed through frame-pointer-derived
addresses (true for every memory-safe execution). Stack slots whose address never escapes become
variables, and SBF stack-passed arguments become parameters. `--exact-memory` turns both off, making
the output exact even for executions that corrupt their own stack frame through wild pointers.

Traps (division by zero, memory faults) are never dropped or reordered across side effects.

`test/equiv.ts` checks this differentially for **every function**:

* `src/emu.ts` — independent reference interpreter written from `interpreter.rs`;
* `test/evaluate.ts` — parses the emitted TypeScript text with the TypeScript compiler API and
  executes it with exactly the documented semantics;
* the emulator tracks frame-pointer provenance; random trials that touch the current frame through a
  non-frame pointer (memory-unsafe executions, outside the default model) are reported as skipped;
* both run on the same random arguments and deterministic memory; calls are stubbed identically
  (results derived from arguments, writes through pointer arguments). The traces — calls with
  arguments, stores outside the frame, frame state at every call, return value, abort — must match.

```
node test/equiv.ts samples/token22.so 3      # 545 functions, 1632 trials, 0 failing
npm test                                     # unit tests, printer/simplifier fuzzer, samples
```

Checked on all bundled samples (memo, token, ata, stake-pool, token-2022, whirlpool, jupiter);
`scripts/equiv-corpus.sh` runs it over a mainnet corpus (`scripts/corpus.ts`).

## Data pipeline (maintainers)

```
export SOLANA_RPC_URL=...                             # the scripts use it too (no default)
node scripts/fetch-samples.ts                         # sample programs from mainnet
node scripts/corpus.ts 400 corpus                     # mainnet corpus + on-chain Anchor IDLs
node scripts/build-libdb.ts corpus 3                  # data/libsigs.json
node scripts/refbuild.ts && node scripts/build-libnames.ts   # symbolized builds -> data/libnames.json
node scripts/build-selectors.ts <idl/source dirs...>  # data/selectors.json.gz
```

`refbuild` needs Solana platform-tools in `~/.cache/sbf-tools/<version>` (toolchains newer than
v1.41 are run inside an `ubuntu:24.04`-based container because they require glibc ≥ 2.34).

## Source map

| file | role |
|---|---|
| `src/elf.ts` | ELF loader, relocations exactly as the runtime applies them |
| `src/program.ts` | decoding, function discovery, CFG, lifting to IR (all SBPF versions) |
| `src/dataflow.ts` | liveness, interprocedural params/returns/noreturn, variable recovery |
| `src/simplify.ts`, `src/cfgopt.ts` | exact expression simplification, propagation, tail duplication, DSE, jump threading |
| `src/ifconv.ts`, `src/idioms.ts` | if-conversion to selects; bit-trick and multi-word compare idioms (popcount/clz/ctz, memeq/keyeq) |
| `src/accounts.ts` | AccountInfo / raw account pointer recognition (field-name comments) |
| `src/stack.ts`, `src/stackargs.ts` | stack slot promotion (escape analysis), stack-passed arguments |
| `src/structure.ts` | structuring (stackifier: correct by construction; irreducible CFGs made reducible by node splitting, state machine only past a size budget) |
| `src/stmtidioms.ts` | statement idioms on the structured body (rc_inc / rc_dec) |
| `src/cpi.ts` | CPI and format-string descriptions (comments) |
| `src/compact.ts` | store/copy run compaction |
| `src/print.ts`, `src/layout.ts` | TypeScript printer, output layout |
| `src/semantics.ts`, `src/library.ts`, `src/fingerprint.ts` | Solana knowledge, library recognition |
