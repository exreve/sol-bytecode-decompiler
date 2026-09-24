# sol-bytecode-decompiler

Decompiles Solana sBPF programs (`.so`, SBPF v0–v3) into compact, **semantically exact** TypeScript,
designed to be read by LLMs reviewing many programs.

```
node src/cli.ts program.so                 # single file to stdout
node src/cli.ts program.so -o out.ts       # single file
node src/cli.ts program.so -o outdir/      # project layout (see below)
  --full   also decompile recognized library functions
  --raw    no Solana-specific names/comments (the form verified by the test harness)
```

Requires Node ≥ 23.6 (runs TypeScript directly). No runtime dependencies.

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
```

Anchor handlers are found from their `"Instruction: <Name>"` log and named `ix_<snake_name>`.

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

## Exactness and how it is verified

Every transformation is an identity on the VM semantics (agave `solana-sbpf` interpreter, including
quirks such as SBPF v0 `add32/sub32/mul32` sign-extending their result). Traps (division by zero,
memory faults) are never dropped or reordered across side effects.

`test/equiv.ts` checks this differentially for **every function**:

* `src/emu.ts` — independent reference interpreter written from `interpreter.rs`;
* `test/evaluate.ts` — parses the emitted TypeScript text with the TypeScript compiler API and
  executes it with exactly the documented semantics;
* both run on the same random arguments and deterministic memory; calls are stubbed identically
  (results derived from arguments, writes through pointer arguments). The traces — calls with
  arguments, stores outside the frame, frame state at every call, return value, abort — must match.

```
node test/equiv.ts samples/token22.so 4      # 545 functions, 2180 trials, 0 failing
```

## Data pipeline (maintainers)

```
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
| `src/simplify.ts`, `src/cfgopt.ts` | exact expression simplification, propagation, tail duplication, DSE |
| `src/stack.ts`, `src/stackargs.ts` | stack slot promotion (escape analysis), stack-passed arguments |
| `src/structure.ts` | structuring (stackifier: correct by construction; state machine for irreducible CFGs) |
| `src/compact.ts` | store/copy run compaction |
| `src/print.ts`, `src/layout.ts` | TypeScript printer, output layout |
| `src/semantics.ts`, `src/library.ts`, `src/fingerprint.ts` | Solana knowledge, library recognition |
