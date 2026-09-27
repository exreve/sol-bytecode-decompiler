# Rust port

The decompiler is being ported from TypeScript (`src/`, ~24k lines) to Rust (`rs/`) for speed, in
stages, with **zero output regression**. The TypeScript implementation is the oracle until the port
is complete; TS feature work is frozen for the duration. Each stage is accepted only when its stage
dumps are byte-identical to the TS dumps over every binary set (see *Parity rules*).

Tooling (details and the dump format: [`rs/README.md`](../rs/README.md)):

- `scripts/dump.ts prog.so [--idl x.json] out_dir`: the TS oracle's canonical stage dumps (dev script,
  read-only; no CLI flag).
- `sbpf-dump prog.so out_dir` (`rs/crates/sbpf-dump`): the same dumps from Rust.
- `scripts/parity.ts`: runs both over binary sets (or `--fuzz N` mutants) and reports the first
  differing line per stage.
- `scripts/stagetime.ts` / `sbpf-dump --time`: per-stage timings, same breakdown.
- `scripts/cpuprof.ts`: per-stage breakdown of `node --cpu-prof` profiles of the whole CLI.

## Stage order

Each stage ports the listed modules and adds its dump(s). A stage may start only when all earlier
stages are at 100% parity.

| # | modules | dump(s) |
|---|---|---|
| 1 | `elf`, `program`, `emu` (+ `murmur`, `syscalls`, `ir` types) | `elf`, `insns`, `cfg`, `lift` (pilot: done except `emu`) |
| 2 | `dataflow`, `stack`, `stackargs` | `dataflow` (signatures, materialized blocks), `vars`, `stack`, `stackargs` (done) |
| 3 | `simplify`, `cfgopt`, `ifconv`, `idioms`, `compact` (+ decompile's phase 2) | `opt`, `optir`, `compact` (done) |
| 4 | `structure`, `stmtidioms`, `print` (+ decompile's raw printing path, renderSingle) | `struct`, `text`, `rawfile` (done: raw output) |
| 5 | `views`, `accounts`, `structs`, `frameregions`, `fieldnames`, `anchor`, `anchorstate`, `idl`, `state`, `outline`, `taint` (+ decompile's phases 3–4, readable renderSingle) | `types`, `rtext`, `readfile` (done: readable output, with and without IDL) |
| 6 | `exec`, `cpiexec`, `cpi` (done with stage 5: the readable text needs them), `builtins` (with stage 7: only used on library functions) | (covered by `rtext` / `readfile`) |
| 7 | `fingerprint`, `library`, `diff`, `selector`, `semantics` | `fingerprint`, `semantics` |
| 8 | `src/analysis/*` | `analysis` (analysis JSON, canonical key order) |
| 9 | `layout`, `budget`, `rpc`, `cli` | whole CLI output (`-o dir/`) byte-compared |

Until stage 9 the Rust code is a library plus `sbpf-dump`; the TS CLI stays the product. A stage's
Rust output feeds the next stage's Rust code only; the TS pipeline is never fed from Rust.

## Parity rules

1. **Byte-identical dumps** on every binary of: `samples/*.so` (incl. `svault_v3`), `samples/regress`,
   `compat/bin`, `bench/bin`, `eval/bin`, `corpus/` (402 programs) — 615 binaries today — plus
   `parity.ts --fuzz` runs (≥ 1000 mutants, several seeds: random `e_flags` for every sBPF version,
   random instructions, corrupted header tables, truncated files).
2. **Same algorithm, same order.** Port the TS algorithm as written, including its iteration orders and
   tie-breaks; do not "improve" it in the same change. Rust-only speedups are allowed when they are
   provably order-preserving (e.g. the pilot's packed per-pc `Step` array for the leader walk, derived
   from the same memo) and parity stays at 100%.
3. **Errors are output too.** A TS exception becomes an `{"error":...}` dump line; Rust must fail at
   the same stage with the same message (runtime `RangeError`s normalize to `"out of bounds"`).
   Inputs outside what the Rust side models are rejected with an explicit `"unsupported: ..."` error,
   never by silently diverging (then parity reports them as such).
4. **Behaviour changes go to TS first**, after the freeze: fix in TS, regenerate, then port. Never
   fix a TS bug only in Rust.
5. **Dump format changes** are made in both dumpers in the same commit; bump `format` only when an
   existing stage's encoding changes.

## JS → Rust pitfalls

- **Map / Set insertion order.** JS `Map`/`Set` iterate in insertion order and `set` on an existing key
  keeps its position: use `IndexMap`/`IndexSet` (`insert` has the same semantics). `delete` + re-`set`
  moves a key to the end: use `shift_remove` (not `swap_remove`, which reorders) followed by `insert`.
  A `HashMap` is fine only where the TS code never iterates (pure lookups).
- **Object key order.** Plain objects iterate integer-like keys ascending first, then string keys in
  insertion order. Any `Object.keys/entries` or `for..in` over a record needs that exact rule.
- **`number` vs `bigint`.** TS uses doubles for pcs, offsets and header fields, `bigint` for u64 values.
  - A `number` above 2^53 is rounded (`Number(getBigUint64(..))` is round-to-nearest-even, like
    `u64 as f64`); arithmetic on it is double arithmetic. Where such values can occur from the input
    (ELF header fields), port them as `f64` (`sbpf_elf::Num`) and keep the double arithmetic; print
    them with `JSON.stringify`'s number format (`js_num`: shortest round-trip digits, exponent from
    1e21, `-0` as `0`).
  - `x / 8` on numbers can be fractional; `Number.isInteger` checks and `Math.floor` must be kept
    (`f64::fract`, `floor`), and fractional keys must stay distinct map keys (`f64::to_bits`).
  - Bitwise operators on numbers go through `ToInt32`/`ToUint32` (`>>> 0`, `| 0`, `& mask`): modulo
    2^32 of the exact double value.
  - `bigint` arithmetic is unbounded: `BigInt.asUintN(64, ..)` = `wrapping_*`; comparisons of values
    that may exceed 2^64 before truncation need `u128` or an explicit check.
  - `Math.imul`, `(a << b)` with `b` masked to 31, `>>>` vs `>>`: port bit-exactly (`wrapping_mul`,
    `rotate_left`, `i32` vs `u32`).
- **Typed arrays and DataView.** `DataView` reads/writes throw `RangeError` out of bounds; `u8[i]` out
  of bounds is `undefined` (then `0` after `&`/`>>`); `subarray` clamps its bounds; `new Array(n)`
  throws for `n > 2^32 - 1`.
- **Sorting.** `Array.prototype.sort` is stable (TimSort); use `sort_by`/`sort_by_key` (stable), never
  `sort_unstable*` unless keys are unique. Inconsistent comparators (e.g. `(a, b) => a < b ? -1 : 1`)
  behave as a stable sort on V8 — keep them stable. Default `sort()` without comparator compares
  **strings** (`[10, 9].sort()` is `[10, 9]`).
- **Strings.** JS strings are UTF-16: `.length`, `slice`, `charCodeAt`, `localeCompare`, and `<` on
  strings compare UTF-16 code units, not bytes or chars. `TextDecoder` is lossy and drops a leading BOM.
  `toString(16)` is lowercase and unpadded; `padStart` pads to UTF-16 length. `JSON.stringify` escapes
  only `"`, `\`, and controls (`\u00xx` lowercase); `serde_json` matches for valid strings.
- **Regex.** JS regex semantics (backtracking, `\d`, `\w`, `\s` Unicode set, `lastIndex` on `g`/`y`)
  differ from the `regex` crate; most TS uses are simple anchored tests — port them to explicit string
  code, and treat any remaining regex as needing a dedicated parity test.
- **Budgets and limits.** Step, fuel and size budgets (`budget.ts`, exec/emu limits, "give up after N")
  must count exactly the same events in the same order, or outputs differ at the cut-off. Port the
  counter increments with the code they sit in, not as a separate estimate. Never budget on time.
- **Shared objects.** TS shares IR objects between functions (e.g. the lifter memo) and some passes
  mutate in place after unsharing. The port uses `Rc<Stmt>` for the lifted statements; later stages
  must reproduce each mutation's visibility (clone-on-write where TS copies, shared mutation where it
  does not).
- **`undefined` / optional fields.** A missing optional key and a key set to `undefined` are the same
  in dumps (omitted); `null` is different. `?.` / `??` chains often hide an out-of-range index
  (`sections[i]?.x ?? 0`): keep them as `get(i).map_or(..)`.
- **Recursion depth.** The TS runs with `--stack-size=65500`; deep recursive walks in Rust need
  explicit stacks or a big thread stack, with the same visit order.

## Pilot results (stage 1 without `emu`)

Ported: `src/elf.ts` → `sbpf-elf`, `src/program.ts` (decode, lifter, discovery, full and lazy CFG) +
`murmur.ts` + `syscalls.ts` → `sbpf-program`, IR types → `sbpf-ir`; dumps (a)–(d) in `sbpf-dump`.
About 2.5k lines of Rust. Dependencies: `indexmap`, `serde_json`.

### Parity

- All binary sets: **615 / 615 identical** on all four stages (`elf`, `insns`, `cfg`, `lift`),
  sBPF v0 (572), v1 (5), v2 (18), v3 (20). No differences at any point of the pilot.
- Fuzz: **2800 / 2800 identical** (seeds 1, 3, 7; 300 + 1500 + 1000 mutants) after the double-arithmetic
  change below. The first fuzz run found the only divergence class: corrupted headers with u64 fields
  above 2^53, which TS rounds to doubles; the first Rust version rejected them. The ELF loader now
  models those fields as `f64` with the TS arithmetic.
- Remaining explicit `unsupported` corners (never seen in the corpus or fuzzing): a function call
  relocation whose target is not a whole pc, and a VM address that rounds to 2^64 or more.

### Speed

Best of 10, ms; TS on Node 26 after warm-up (`scripts/stagetime.ts`), Rust release build
(`sbpf-dump --time`). `discover_lazy` is function discovery + lifting on the decompiler's path
(`loadProgram(.., {lazyBlocks: true})` minus ELF and decode); `load_full` also forms every
function's full CFG; `lift_all` lifts every instruction once.

| program | stage | TS | Rust | speedup |
|---|---|---:|---:|---:|
| token22 | elf / decode | 0.99 / 0.75 | 0.25 / 0.15 | 4.0× / 5.0× |
| | discover (lazy) | 27.5 | 12.6 | 2.2× |
| | load lazy (total) | 37.3 | 13.1 | 2.9× |
| | load full CFG | 79.2 | 47.6 | 1.7× |
| | lift all | 10.2 | 4.4 | 2.3× |
| whirlpool | elf / decode | 2.21 / 1.90 | 1.02 / 0.40 | 2.2× / 4.8× |
| | discover (lazy) | 63.0 | 19.9 | 3.2× |
| | load lazy (total) | 70.0 | 22.2 | 3.2× |
| | load full CFG | 87.1 | 59.7 | 1.5× |
| | lift all | 25.9 | 11.2 | 2.3× |
| jup | elf / decode | 1.66 / 2.54 | 0.63 / 0.54 | 2.6× / 4.7× |
| | discover (lazy) | 219.6 | 51.3 | 4.3× |
| | load lazy (total) | 225.4 | 54.3 | 4.2× |
| | load full CFG | 373.2 | 208.3 | 1.8× |
| | lift all | 37.0 | 16.8 | 2.2× |
| svault_v3 | elf / decode | 0.31 / 3.18 | 0.20 / 0.63 | 1.6× / 5.0× |
| | discover (lazy) | 136.4 | 36.4 | 3.7× |
| | load lazy (total) | 147.9 | 38.5 | 3.8× |
| | load full CFG | 201.7 | 122.8 | 1.6× |
| | lift all | 40.6 | 17.3 | 2.3× |

The decompiler's path (load lazy) is **2.9–4.2× faster**; the packed per-pc `Step` array used by the
leader walks accounts for about a third of that (jup 78 → 51 ms).

### Findings that affect the plan

- **These stages are ~2% of the pipeline.** `jup` takes ~10 s end to end in TS; its early stages take
  ~0.23 s. Stage 1 alone will not show up in wall time; the payoff is in stages 2–6 (dataflow,
  simplification, structuring, views/exec), which should be profiled per stage in TS before porting
  so the order can favour the hot ones (the order above is fixed by data dependencies, but effort
  and Rust-specific optimizations should go where the time is).
- **Allocation-bound IR.** V8 is already fast on this integer-heavy code; Rust wins 2–5× mainly where
  it avoids allocation. Lifting (`Box<Expr>` per node, `Rc<Stmt>`, `Vec` per instruction) and full-CFG
  formation (statement vectors, cloned `br` conditions) are allocation-bound (~1.5–2.3×). Before
  stage 2, decide on an arena / interned IR (`ExprId` into a per-program arena, hash-consed
  constants and registers): the later stages rewrite IR constantly, and that choice is hard to change
  once they are ported. The dump encoding is unaffected. (Decided: see *IR representation*.)
- **Double arithmetic in the input path.** Header fields are doubles in TS, so the Rust side keeps
  `f64` there (fuzzing hits it within a few hundred mutants). The same pattern will matter wherever
  later stages compute offsets from program data as `number` (views, accounts, layout, exec).
- **The full CFG (`loadProgram` without `lazyBlocks`) is only a dump/test path**; the decompiler forms
  blocks lazily. Its dump stays useful (it pins leaders, block shapes and linking), but stage 2 must
  add the lazy `materializeBlocks` path with its own dump (`dataflow`).
- **Parity runtime.** A full parity run over the 615 binaries takes ~5 min (dominated by the TS side and
  full-CFG dumps of the big programs); fine per stage, and `--stages` narrows it while iterating.

## Pipeline profile (TS, whole CLI)

`node --stack-size=65500 --cpu-prof --cpu-prof-interval 500 src/cli.ts prog.so -o dir/` (project output,
analysis included), Node 26. Each sample is charged to the outermost `src/` frame below the
orchestrators (`cli.ts`, `decompile.ts`, `layout.ts`, `src/analysis/*`; `ir.ts` helpers count for their
caller), so a module's row includes the helpers it calls; `GC` is V8's own node. ms (share of the run).
Aggregated by `scripts/cpuprof.ts`. The profiler adds ~10% to the wall time.

| stage | token22 | whirlpool | jup | svault_v3 |
|---|---:|---:|---:|---:|
| load: lazy discovery + lift (`program.ts`) | 93 (2.9%) | 134 (1.6%) | 445 (2.6%) | 350 (2.5%) |
| inferSignatures (+ materializeBlocks) | 112 (3.5%) | 208 (2.5%) | 454 (2.7%) | 605 (4.3%) |
| recoverVars | 59 (1.9%) | 170 (2.1%) | 438 (2.6%) | 409 (2.9%) |
| promoteStack + rewriteStackArgs | 75 (2.4%) | 194 (2.4%) | 472 (2.8%) | 301 (2.1%) |
| optimizeFunc (simplify, cfgopt, ifconv) | 606 (19.0%) | 1065 (13.0%) | 3188 (18.8%) | 2441 (17.2%) |
| idioms + compact | 74 (2.3%) | 221 (2.7%) | 507 (3.0%) | 465 (3.3%) |
| structuring (structure, stmtidioms, outline) | 100 (3.2%) | 252 (3.1%) | 564 (3.3%) | 525 (3.7%) |
| printing (`print.ts`) | 183 (5.7%) | 484 (5.9%) | 1189 (7.0%) | 711 (5.0%) |
| views/accounts/structs/frameregions/fieldnames/anchor*/idl/state | 238 (7.5%) | 1216 (14.8%) | 1427 (8.4%) | 1991 (14.0%) |
| exec/cpiexec/cpi/emu/builtins | 29 (0.9%) | 143 (1.7%) | 332 (2.0%) | 262 (1.8%) |
| semantics/library/fingerprint/selector/taint | 123 (3.9%) | 300 (3.6%) | 547 (3.2%) | 434 (3.1%) |
| analysis layer (`src/analysis/*`; `flow.ts` alone 7–12%) | 638 (20.1%) | 1680 (20.4%) | 3658 (21.6%) | 2167 (15.3%) |
| `decompile.ts` own code (naming, phase 3, out-params, declarations) | 307 (9.6%) | 993 (12.1%) | 1713 (10.1%) | 1607 (11.3%) |
| layout + budget (`renderProject`) | 62 (2.0%) | 275 (3.3%) | 326 (1.9%) | 425 (3.0%) |
| GC | 153 (4.8%) | 534 (6.5%) | 1172 (6.9%) | 956 (6.7%) |
| startup, module loading, I/O | 329 (10.3%) | 349 (4.2%) | 519 (3.1%) | 540 (3.8%) |
| **total** | **3181** | **8219** | **16951** | **14192** |

Where porting effort pays most:

- **Stages 1–2 are ~10% of the run** (load + signatures + recoverVars + stack/stackargs: 8.7–12%). Their
  3–4× (below) saves at most ~7% of wall time; they are prerequisites, not the payoff.
- **`optimizeFunc` is the largest single stage (13–19%)** and the most rewrite-heavy: stage 3 is where the
  IR representation and Rust-specific work (no GC, per-function arenas, per-function parallelism) pay.
- **The analysis layer is the largest group (15–22%)**, `analysis/flow.ts` alone 7–12% (stage 8), then
  the stage 5 group (views … anchorstate: 8–15%, `anchorstate`/`structs`/`accounts`/`fieldnames` each
  2–3%) and printing (5–7%).
- **`decompile.ts` itself is 10–12%** (its own passes: naming, phase 3 constant resolution, out-parameter
  detection, declarations): the plan did not assign it to a stage (see *Plan changes*).
- GC (5–7%) and module loading disappear in Rust; everything else is spread thin (no other module
  above 3%).
- Phase 2 of `decompile` (recoverVars → optimizeFunc → promoteStack → idioms, per function) is
  independent per function apart from the signatures read: with per-function arenas it can run on all
  cores, which is worth more than any single-thread gain on the big programs (optimizeFunc + idioms are
  15–22% of the run).

## IR representation

Decision (implemented in `sbpf-ir`, used by every stage from lifting on):

- **Append-only arena of immutable 16-byte nodes, integer ids, no hash-consing.** `Ir` holds
  `Vec<Node>`; `E(u32)` is an expression id; `Node` is a flat enum whose children are ids
  (`Bin(op, E, E)`, `Load { size, addr: E }`, `Sel(E, E, E)`, …); constants are inline `u64`. Lists (call
  arguments, `stores` values) are runs of `Item(E)` nodes addressed by `L { start, len }`; call targets
  of call expressions and intrinsic names live in side tables. Statements (`Stmt`) and terminators
  (`Term`) are small `Clone` values holding ids; a block's statements are a `Vec<Stmt>`.
- **One arena per program for the lifted (register) IR, one per function from `recoverVars` on.**
  recoverVars rebuilds every expression anyway (TS's `mapExprPre` copies every inner node), so the copy
  into the function's arena is free; afterwards a function's IR is self-contained (freeable, and `Send`,
  so functions can be processed in parallel). `Func::ir(p)` gives the arena a function's blocks use.
- **Why no hash-consing.** The TS code relies on object identity in ways that change results, not just
  speed: `optimizeFunc` decides how many rounds run (and `settled`) from `n !== s` after simplification
  (a structurally equal *new* object counts as a change), `mapExprsKeep`/`keepAll` keep statements
  whose expressions came back as the same objects, recoverVars keys register reads by object, and
  several caches are per object (StmtMeta, UD, indClobber). With a plain arena an id is exactly an
  object reference (each constructor call is a new node, `===` is `==` on ids), so these port 1:1.
  Hash-consing would merge "new but equal" into "same" and silently change round counts. Structural
  equality stays the recursive `exprEq` of TS; a hash index can be added on the side (e.g. for CSE)
  without changing identity.
- **Interior mutability.** Constructors take `&Ir` (nodes are pushed through an `UnsafeCell`), so nested
  construction reads like the TS (`ir.bin(Add, ir.reg(1), ir.c(8))`). Sound because the arena never lends
  a reference into its vectors: every read copies a `Node`/`E` out (lists are iterated by index).
- Encoders write JSON straight from the arena (no intermediate strings per node).

Measured on the lifted IR (release, best of 10, ms; the pilot's `Box<Expr>`/`Rc<Stmt>` build vs the
arena build, same machine and session; TS for reference):

| program | stage | TS | Rust tree (pilot) | Rust arena | arena vs tree |
|---|---|---:|---:|---:|---:|
| token22 | lift all | 11.7 | 4.03 | 2.17 | 1.9× |
| | discover (lazy) | 37.7 | 11.24 | 8.84 | 1.3× |
| | load full CFG | 77.1 | 39.83 | 30.23 | 1.3× |
| whirlpool | lift all | 28.6 | 9.99 | 10.28 | 1.0× |
| | discover (lazy) | 35.1 | 18.38 | 11.96 | 1.5× |
| | load full CFG | 66.4 | 50.43 | 31.62 | 1.6× |
| jup | lift all | 43.8 | 15.05 | 8.54 | 1.8× |
| | discover (lazy) | 165.0 | 47.61 | 38.00 | 1.3× |
| | load full CFG | 398.3 | 188.84 | 141.43 | 1.3× |
| svault_v3 | lift all | 45.5 | 15.51 | 8.24 | 1.9× |
| | discover (lazy) | 94.9 | 33.51 | 23.39 | 1.4× |
| | load full CFG | 144.3 | 105.68 | 60.08 | 1.8× |

Lifting is ~1.9× faster than the tree version (5.1–5.5× TS) except on whirlpool, whose `lift all` did
not move (its time is not in node allocation; not investigated). Discovery gains 1.3–1.5× and the full
CFG (statement copies per block) 1.3–1.8× (2.1–2.8× TS). A node is 16 bytes with no allocation of its
own, against a separately boxed, several times larger `Expr` per node in the pilot.

## Stage 2 results

Ported: `src/dataflow.ts` (liveness, `computeIndClobber`, `inferSignatures` on the lazy path with
`reachesReturnPending` + `materializeBlocks` from `program.ts`, `recoverVars`), `src/stack.ts`,
`src/stackargs.ts` → `sbpf-dataflow` (~2.2k lines of rustfmt-ed Rust, plus ~150 in `sbpf-program`). Only the lazy
path is ported (`infer_signatures` asserts it): the full-CFG `truncateNoreturn` + `pruneUnreachable` path
is not used by the decompiler. Dumps: `dataflow` (signatures + materialized blocks), `vars`
(recoverVars IR and variables), `stack` (promoteStack), `stackargs` (rewriteStackArgs); format in
[`rs/README.md`](../rs/README.md).

Harness note: the pipeline runs `promoteStack` after `optimizeFunc` and `rewriteStackArgs` after all
per-function optimization, skipping library functions. Until stage 3 exists, the `stack`/`stackargs`
dumps run the same code on `recoverVars`' output over all functions (what `--full` builds). This
exercises every path (on jup: 141 functions get stack parameters, 175 functions change), but the exact
pipeline composition is only checked once stage 3's dump runs recoverVars → optimizeFunc →
promoteStack → optimizeFunc → idioms → rewriteStackArgs.

### Parity

- All binary sets: **615 / 615 identical on all eight stages** (`elf`, `insns`, `cfg`, `lift`,
  `dataflow`, `vars`, `stack`, `stackargs`); the first full run was already identical.
- Fuzz: **2800 / 2800 identical** on all eight stages (seeds 1, 3, 7; 1000 + 1000 + 800 mutants), after
  one fix: the first fuzz run had ~70% Rust panics from invalid instructions using registers 11–15.
  TS's `recoverVars` keeps the current definition per register in `new Array(11)`, so a read of r11–r15
  before a definition in the block maps to `undefined`; `varOf(undefined)` then makes one shared
  variable (`find(undefined)` is `undefined`, a valid `Map` key) when the read is a whole expression
  (`rwUse`), and throws `internal: unmapped register use` when it is nested (`rwLeaf`). The Rust side
  models exactly that (`Rw` in `sbpf-dataflow`), so the `vars` stage fails with the same error line.
- No residual differences. A full parity run over the 615 binaries now takes ~10 min (all eight stages);
  a 1000-mutant fuzz run ~4 min.

Other details that had to be modelled (all in the code comments):

- **Identity by occurrence.** `recoverVars` keys register reads by object (`Map<Expr, node>`) and
  allocates variables in that Map's order. Within one function every lifted instruction appears in one
  block and every read is its own object, so the Map order is the first pass's visit order: the Rust
  side records reads in a list and consumes them in the same pre-order during the rewrite.
- **Missing table entries.** `ARG_MASK[n]` for `n > 5` is `undefined`, which or-s as 0 (`arg_mask`).
- **Doubles.** Stack offsets are `Number(BigInt.asIntN(64, c))`: `f64` in `stack.rs`/`stackargs.rs`,
  with `BigInt(off)` converted back exactly (`js_as_u64`); `(o - AREA) / 8` keeps the `Number.isInteger`
  test.
- **Convergence tests by size.** `liveInEntry` compares set sizes only; the Rust bitsets do the same.
- **`ensurePreEntry` sharing.** The moved entry block shares its terminator and successor array with the
  old block 0 in TS; the retargeting order makes that invisible, which the Rust version reproduces with
  owned copies.
- **Caches.** The TS per-statement caches (`UD`, `GK` symbols, `indClobber` WeakMap) are pure; the Rust
  side keeps the call-free block gen/kill cache in the signature fixed point and stores the indirect-call
  clobber masks per function by (block, statement index).

### Speed

Best of 10, ms, same run for both (`scripts/stagetime.ts`, `sbpf-dump --time`): `signatures` =
inferSignatures (noreturn fixed point, block materialization, parameter/return fixed point),
`recover` = recoverVars of every function, `promote` = promoteStack of every function, `stackargs` =
rewriteStackArgs.

| program | stage | TS | Rust | speedup |
|---|---|---:|---:|---:|
| token22 | signatures | 75.4 | 25.8 | 2.9× |
| | recover | 65.0 | 16.2 | 4.0× |
| | promote | 57.9 | 14.1 | 4.1× |
| | stackargs | 22.9 | 5.3 | 4.4× |
| whirlpool | signatures | 150.9 | 50.5 | 3.0× |
| | recover | 146.5 | 36.7 | 4.0× |
| | promote | 186.0 | 52.9 | 3.5× |
| | stackargs | 61.0 | 16.1 | 3.8× |
| jup | signatures | 238.5 | 79.9 | 3.0× |
| | recover | 194.8 | 53.5 | 3.6× |
| | promote | 251.3 | 67.8 | 3.7× |
| | stackargs | 77.3 | 21.5 | 3.6× |
| svault_v3 | signatures | 372.0 | 118.7 | 3.1× |
| | recover | 240.1 | 63.8 | 3.8× |
| | promote | 171.3 | 53.3 | 3.2× |
| | stackargs | 78.0 | 20.3 | 3.8× |

Stage 2 runs **2.9–4.4× faster** than TS (stage 1's decompiler path, load lazy: 2.4–4.3×), single-threaded,
algorithms unchanged. The remaining cost is mostly hashing (`HashSet`/`HashMap` in the noreturn walk and
block materialization, pc → function lookups) and per-statement vectors in recoverVars' first pass;
none of it changes the order of anything, so it can be tightened later without parity risk.

## Stage 3 results

Ported: `src/simplify.ts` (simplifyExpr/simp1/simpSel, `optimizeFunc` and its pass loop with the
`real`/`prevLast` early exits and `settled`, propagateGlobal, inlineLocal/inlineCall, dce,
foldConstBranches), `src/cfgopt.ts` (tailDuplicate, threadJumps, mergeBlocks, local/global constant
propagation, localCopyProp, deadStores, liveInSets), `src/ifconv.ts`, `src/idioms.ts` (popcount/clz/ctz,
memeq/keyeq word-compare chains), `src/compact.ts` (sinkFrameLoads, compactStores), read-only memory
folding (`setFoldImage` → `Fx::img`), `pruneUnreachable`, and decompile's per-function phase
(`sbpf_opt::phase2`: optimizeFunc; promoteStack + optimizeFunc; recognizeIdioms + optimizeFunc unless
settled and not really modified; then rewriteStackArgs over all functions and `sbpf_opt::finish`:
sinkFrameLoads + compactStores) → `sbpf-opt` (~5.4k lines of rustfmt-ed Rust). Dumps: `opt` (after the
first optimizeFunc), `optir` (after the whole per-function phase), `compact` (after rewriteStackArgs,
sinkFrameLoads, compactStores: the input of structuring); format in [`rs/README.md`](../rs/README.md).
This resolves the stage 2 harness limitation: the pipeline composition recoverVars → optimizeFunc →
promoteStack → optimizeFunc → idioms → optimizeFunc → rewriteStackArgs → sinkFrameLoads → compactStores
is now checked in its exact order. Library classification (stage 7) is not ported: the dumps run every
function, as `--full` does.

Design:

- **`Fx`**: one per function for the whole phase; it owns the function's arena while passes run and keeps
  caches keyed by expression id: side-effect flags (hasSideEffectsOrMem), variable occurrences of
  statement expressions (stmtInfo), and "simplifyExpr(e) returns e" (the TS `simple` mark). Nodes are
  immutable, so an answer cached for an id never goes stale; this replaces the TS per-statement
  `StmtMeta` symbol cache (same answers, no invalidation logic).
- **Identity** is id equality, as decided for the IR: every TS object creation is a new node (`{ ...e, a, b }`
  after a swap, substVars' full rebuild, mapExpr's rebuild in idioms and sinkFrameLoads), every reuse the
  same id (shared `m` values in propagateGlobal, the shared select condition in ifConvert), so round counts,
  `settled` and the `real` flags come out the same.
- **sameBody** (`JSON.stringify` of `[stmts with pc 0, term]`) is a structural comparison that equates
  calls (unlike exprEq), which is what the JSON strings decide; statement key orders are the same for
  all constructors, so no string is built.
- **bigint offsets** in compact.ts are i128; the u64 wrap (`BigInt.asUintN`) is the truncating cast.
- **Parallel per-function phase** (`sbpf_opt::par_each`, `SBPF_THREADS`): each function owns its arena and
  only reads the program image, so phase 2 and `finish` run on worker threads with results in function
  order. For that the IR's shared strings became `Arc<str>` (was `Rc<str>`), which made `Func` `Send`.

### Parity

- All binary sets: **615 / 615 identical** on `opt`, `optir`, `compact` (first run already identical;
  re-run after the speed changes and the parallel driver).
- Fuzz: **4000 / 4000 identical** on `dataflow,vars,opt,optir,compact` (seeds 1, 3, 7, 11; 1000 each, seed
  3 on corpus/bench/eval bases).
- No residual differences.

### Speed

Best of 10 (Rust) / 5 after warm-up (TS, Node 26), ms, same machine (`sbpf-dump --time3`,
`scripts/stagetime.ts --stage3`), after inferSignatures + recoverVars of every function; each column is
summed over all functions: `opt1` = optimizeFunc, `promote` = promoteStack, `opt2` = optimizeFunc after a
promotion, `idioms` = recognizeIdioms, `opt3` = optimizeFunc after idioms, `stackargs` =
rewriteStackArgs, `sink` / `compact` = sinkFrameLoads / compactStores; `total` = their sum; `parallel` =
the same work with phase 2 and sink/compact on 8 worker threads (wall time).

| program | | opt1 | promote | opt2 | idioms | opt3 | stackargs | sink | compact | total | parallel |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| token22 | TS | 317.0 | 18.4 | 31.5 | 24.1 | 109.4 | 39.2 | 11.3 | 17.5 | 577.9 | |
| | Rust | 66.0 | 3.9 | 5.8 | 4.3 | 21.8 | 5.0 | 1.9 | 3.6 | 112.4 | 32.4 |
| | speedup | 4.8× | 4.7× | 5.5× | 5.5× | 5.0× | 7.9× | 6.0× | 4.8× | **5.1×** | **17.8×** |
| whirlpool | TS | 650.6 | 47.7 | 66.3 | 51.2 | 13.5 | 93.3 | 38.9 | 68.8 | 1049.2 | |
| | Rust | 132.1 | 11.0 | 14.8 | 7.0 | 2.8 | 11.1 | 5.9 | 11.7 | 198.8 | 58.5 |
| | speedup | 4.9× | 4.3× | 4.5× | 7.3× | 4.9× | 8.4× | 6.6× | 5.9× | **5.3×** | **17.9×** |
| jup | TS | 985.4 | 73.8 | 161.9 | 70.4 | 294.0 | 138.0 | 42.6 | 82.3 | 1849.8 | |
| | Rust | 198.4 | 18.7 | 32.9 | 14.8 | 65.4 | 18.3 | 8.1 | 18.9 | 384.1 | 121.2 |
| | speedup | 5.0× | 3.9× | 4.9× | 4.8× | 4.5× | 7.5× | 5.3× | 4.3× | **4.8×** | **15.3×** |
| svault_v3 | TS | 1054.3 | 54.4 | 75.6 | 78.7 | 68.0 | 112.6 | 39.0 | 90.4 | 1619.7 | |
| | Rust | 207.6 | 15.2 | 14.5 | 13.4 | 13.8 | 16.8 | 8.6 | 22.8 | 314.2 | 101.2 |
| | speedup | 5.1× | 3.6× | 5.2× | 5.9× | 4.9× | 6.7× | 4.5× | 4.0× | **5.2×** | **16.0×** |

Inside optimizeFunc (jup, one run, from temporary timers in both implementations; not committed):
simplification 250 → 27 ms (9×, the per-id stability cache skips stable subtrees), propagateGlobal 256 →
~45, inlineLocal 455 → ~100, dce 73 → 10, globalConstProp 156 → ~42, localCopyProp 50 → 15, deadStores
285 → ~70, ifConvert 43 → 14, threadJumps 21 → 8, tailDuplicate 31 → 10 ms. The weakest ratios (3.5–4.5×)
are the passes that re-derive whole-function tables every round exactly as TS does (use/def counts,
gen/kill rows, the constant lattice); keeping those incrementally would be an algorithm change (allowed
only when provably order-preserving) and is left for later.

The single-threaded per-function phase is **4.8–5.3× faster** than TS; on 8 threads **15–18×**
(the profile's optimizeFunc + idioms + compact share, 15–22% of the TS run, drops to ~1–1.5%).

## Stage 4 results

Ported: `src/structure.ts` (computeRpo, dominators, stackifier structuring, `makeReducible` node
splitting with its size budget, the dispatcher fallback, and every clean-up pass: tailPass, labelPass,
ifPass, sameArmsPass, dupPass, loopPass, unlabel, dropLoopLabels, the 12-round fixpoint on `sameTree`),
`src/stmtidioms.ts` → `sbpf-struct`; `src/print.ts` (expressions with the TS precedence and
TS-ambiguity parenthesization, `fmtConst`, `joinArgs`, `wrapped`, the `shl()` fallback, statements,
`printBody`), and of `src/decompile.ts` + `src/layout.ts` what the **raw** output (`decompile(bytes, {
sugar: false, full: true })`, what `test/equiv.ts --raw` evaluates) needs → `sbpf-print`: function
naming (`Semantics`' instruction-log scan and classification → `ix_*` names and processors, `nameThunks`,
helper-name suffixes, symbol sanitizing with `// symbol:` notes), variable names (`shortNames`,
parameters, entrypoint zero-init), `declarations`, the function text, `callsOf`, and `renderSingle`
(header, instruction table with Anchor discriminators via a local SHA-256, used helpers / syscalls,
handler grouping). ~4.5k lines of rustfmt-ed Rust. Dumps: `struct` (structured bodies), `text` (each
function's text), `rawfile` (the whole single file); format in [`rs/README.md`](../rs/README.md).

Raw mode includes no outlining (`ret_tail_N`/`tail_N` are readable-mode only: `findOutlines` is skipped
when `sugar === false`), no views / accounts / strings / comments, no library stubs (`full`). The raw
single file does contain one block the port cannot produce yet: the `// security summary` lines come
from the analysis (`analyze`, stage 8). The `rawfile` dump drops that block on both sides; everything
else in the file is compared.

Design:

- **Statement identity.** Tree nodes refer to statements by index into a per-function table
  (`Tree::stmts`): a TS statement object is an index, a copy (`{ ...s }` in node splitting and `cloneNodes`,
  the `eval` of an empty `if`, the `rc_*` calls) is a new entry. `declarations` keys its `let`/`const`
  decisions by that index, as TS keys them by object.
- **Structural comparisons** (`sameTree`, `samePcFree`) compare as plain data: equal indices / ids are
  equal, otherwise statements and expressions are compared field by field (`Fx::json_eq`).
- **Clean-up passes work in place** where the TS rebuilds an identical tree (tailPass, labelPass,
  sameArmsPass, loopPass, unlabel, dropLoopLabels); ifPass and dupPass move nodes into a new list. Break
  sets are chains through the enclosing frames (TS: a new `Set` per block), label reference counts are
  arrays by block id.
- **Printer**: writes one buffer; a subexpression is parenthesized in place after it is written (its
  precedence, or a rule looking at its text: `wrapped`, `joinArgs`, the `<<`/`>` checks). Printing order
  does not change the text (the TS prints an indirect call's arguments before its target).
- **declarations** keeps, per variable, the first reference and the lowest common ancestor of the lists
  of all references (the TS keeps each reference's path and takes the common prefix: same list).
- Per-function structuring and printing run on the worker threads (`par_each`); output is identical for
  any thread count (checked on jup, svault_v3, whirlpool with 1 and 8 threads).

### Parity

- All binary sets: **615 / 615 identical** on `struct`, `text` and `rawfile` (the first run was already
  identical; re-run after the speed changes).
- Fuzz: **6000 / 6000 identical** (1000 each: seeds 1, 7, 11 on samples + compat, seed 3 on corpus + bench +
  eval; seed 13: 2000 on samples + compat + bench). 15–32% of the mutants get through the whole pipeline
  (1103 of the 5000 counted; the others stop at an earlier stage's error, which both sides report
  identically); `parity.ts` now prints how many cases reach each stage without an error.
- Equivalence harness on the **Rust-printed** raw text: `test/equiv.ts`'s check with the program text
  replaced by the Rust `rawfile` text (5 trials per function): token, memo, ata, token22, whirlpool,
  svault_v3, jup — 4674 functions, 23 270 trials, **0 failing functions, 0 errors** (the same as the TS text).
- No residual differences apart from the analysis summary block (stage 8), excluded by construction.

### Speed

Best of 10 (Rust) / 5 after warm-up (TS, Node 26), ms, same machine (`sbpf-dump --time4`,
`scripts/stagetime.ts --stage4`), after the stage 3 pipeline: `struct` = structure + cleanup +
statementIdioms, `print` = variable names + declarations + printBody + the function's lines (the TS
side times a script-local copy of decompile's raw printing path, checked to produce decompile's text),
each summed over all functions; `parallel` = the same on 8 worker threads (wall time).

| program | | struct | print | total | parallel |
|---|---|---:|---:|---:|---:|
| token22 | TS | 54.5 | 67.9 | 122.4 | |
| | Rust | 16.7 | 17.0 | 33.9 | 6.7 |
| | speedup | 3.3× | 4.0× | **3.6×** | **18.2×** |
| whirlpool | TS | 100.1 | 121.5 | 224.8 | |
| | Rust | 33.0 | 36.4 | 69.7 | 12.4 |
| | speedup | 3.0× | 3.3× | **3.2×** | **18.1×** |
| jup | TS | 161.2 | 209.3 | 370.5 | |
| | Rust | 47.6 | 55.4 | 104.2 | 17.3 |
| | speedup | 3.4× | 3.8× | **3.6×** | **21.4×** |
| svault_v3 | TS | 184.1 | 234.2 | 418.3 | |
| | Rust | 65.4 | 71.1 | 138.6 | 21.7 |
| | speedup | 2.8× | 3.3× | **3.0×** | **19.3×** |

The first port (passes rebuilding the tree as the TS does, `format!`-per-subexpression printing) was only
1.5–2× faster; the in-place passes and the buffer printer brought it to 3–4×. What remains is allocation
(ifPass / dupPass lists, the per-round copy of the tree for the fixpoint test: about 35% of `struct`) and
text building (~9 ns per output byte). Single-thread gains are lower than stage 3's because V8 is good at
exactly this (short strings as ropes, small short-lived objects); the parallel driver matters more here.

## Stage 5 results

Ported (with stage 6's `exec`, `cpiexec`, `cpi`, which the readable text needs): `src/views.ts`,
`accounts.ts`, `structs.ts`, `frameregions.ts`, `fieldnames.ts`, `anchor.ts`, `anchorstate.ts`, `idl.ts`,
`state.ts`, `outline.ts`, `taint.ts`, the read side of `semantics.ts`, and the rest of `src/decompile.ts`
(phase 3: discriminator constants, Result layouts, out-parameters; phase 4: invoke thunks / PDA and
invoke wrappers, Accounts / Context views, zero-copy loaders, per-function names and view types, the
printing hooks: typed views, account and input fields, frame objects and regions, strings, keys, Result
tags, stored strings, CPI / PDA / fmt notes, outlined tails) → `sbpf-exec` (the concrete interpreter,
local SHA-256 / Keccak) and `sbpf-read` (`decompile_read`, `render_read`); `layout.ts` renderSingle is
shared with the raw path (`sbpf-print::raw::render_single_of`: IDL args / accounts rows, typed-view
declarations, outlined tails). ~20k lines of rustfmt-ed Rust. Dumps: `types` (each function's variable
names and view assignment; TS side: `FuncOut.varTypes`, an output-neutral field added for the dump),
`rtext` (each function's readable text), `readfile` (the single file); `--idl` on both dumpers,
`parity.ts --idl` picks the binaries that have one. Format in [`rs/README.md`](../rs/README.md).

As for `rawfile`, the `readfile` dump drops the `// security summary` block (stage 8's `analyze`) on
both sides; everything else, CPI comments included, is compared.

Fixes found by parity (all Rust-side, TS unchanged):

- **The TS reads phase 4 facts of the built functions.** `recoverVars` works in place (`f as VarFunc`),
  so `p.funcs` holds the optimized functions by phase 4: invoke thunks, PDA wrappers (block and syscall
  counts, `nparams`) and `unalignedInput` are read from them, not from the register-level CFG (jup: a
  `sol_try_find_program_address` removed by the optimizer made `fn_93bc0` a PDA wrapper in Rust only).
- **NaN view sizes.** A Borsh view whose size is unknown has size `NaN`; JS `Math.max(0x400, NaN + 0x100)`
  is `NaN` and `Array.from({ length: NaN })` is empty (so the account run fails), while Rust's `f64::max`
  ignores NaN. `util::jmax` keeps the JS semantics where view sizes are maxed.
- The IDL argument view is added to the shared view table while each function is named (as in the TS),
  outside the per-function printing borrow (no unsafe aliasing).

Design notes:

- Phase 4 printing runs function by function on one thread: naming a function can add views
  (IDL argument views, zero-copy loaders) that later functions' names and types depend on. Stages 1–4
  keep their worker threads.
- `f64` stands for JS numbers wherever the TS does arithmetic on offsets / sizes (`N`); `K` keys JS
  `Map<number, …>` (SameValueZero: `-0` is `0`).

### Parity

- Without IDL, all binary sets: **615 / 615 identical** on `types`, `rtext` and `readfile` (samples,
  regress, compat, bench, eval: 213; corpus: 402).
- With IDL (the 183 binaries that have one: samples/regress 2, bench, eval, corpus): **IDL_RESULT**.
- Fuzz: **6000 / 6000 identical** (1000 each: seeds 1, 7, 11 on samples + compat, seed 3 on corpus + bench +
  eval; seed 13: 2000 on samples + compat + bench); 1409 of them reach the readable output without an
  error (the others stop at an earlier stage's error, reported identically).
- Equivalence harness on the **Rust-printed** readable text (`test/equiv.ts`'s readable check with the
  program text replaced by the Rust `readfile` text, 5 trials per function): memo, token, ata, stake_pool,
  token22, whirlpool, svault_v3, jup — 4991 functions, 24 855 trials, **0 failing functions, 0 errors**;
  with IDL: squads_v4, metadao_conditional_vault, bench a_vault, eval candy_machine_v2, corpus SAGE —
  3418 functions, 17 074 trials, 0 errors, **1 failing function** (metadao `fn_a4a8`, a store width
  mismatch at event #860), which fails identically on the TS text (a TS issue, not a port difference).
- No residual differences apart from the analysis summary block (stage 8), excluded by construction.

### Speed

Best of 10 (Rust) / 5 after warm-up (TS, Node 26), ms, same machine (`sbpf-dump --time5`,
`scripts/stagetime.ts --stage5`): the whole output from the bytes (all stages, single file included) minus
the analysis (`analyze()`, stage 8, timed separately on the same result and subtracted on the TS side; the
Rust side has none): `raw` = `decompile(bytes, { sugar: false, full: true })`, `readable` = `decompile(bytes,
{ full: true })`, `read` = readable − raw (what stage 5 adds); `parallel` = the same with 8 worker threads
(wall time).

| program | | raw | readable | read | readable, parallel |
|---|---|---:|---:|---:|---:|
| token22 | TS | 890.6 | 1641.8 | 751.2 | |
| | Rust | 192.2 | 351.5 | 159.2 | 269.7 |
| | speedup | 4.6× | **4.7×** | 4.7× | **6.1×** |
| whirlpool | TS | 1575.8 | 3520.0 | 1944.2 | |
| | Rust | 342.6 | 961.8 | 619.2 | 795.1 |
| | speedup | 4.6× | **3.7×** | 3.1× | **4.4×** |
| jup | TS | 3029.0 | 5917.4 | 2888.4 | |
| | Rust | 636.1 | 1368.6 | 732.5 | 1060.2 |
| | speedup | 4.8× | **4.3×** | 3.9× | **5.6×** |
| svault_v3 | TS | 2830.9 | 5563.0 | 2732.1 | |
| | Rust | 663.5 | 1364.3 | 700.7 | 1097.7 |
| | speedup | 4.3× | **4.1×** | 3.9× | **5.1×** |

The stage 5 part is a straight port (no Rust-specific restructuring yet) and runs on one thread, so the
parallel driver only shortens stages 1–4 (the `read` part is the same 160–790 ms with 8 threads); it is
now the larger half of the Rust run. The TS side also keeps memory across `decompile` calls (one Node
process timing token22, whirlpool, jup and svault_v3 in a row runs out of its 4 GB heap), which the
Rust side does not.

## Plan changes

- **Stage 5 is done** (above), with `exec` / `cpiexec` / `cpi` of stage 6; `builtins` moves to stage 7
  (u128 builtin names are only given to library functions, i.e. with classification). Next: stage 7
  (`fingerprint`, `library`, `diff`, `selector`, the rest of `semantics`: the CLI default without `--full`),
  then stage 8 (analysis: brings back the summary block in `rawfile` / `readfile`).
- **A dedicated Rust performance pass follows the full port** (after stage 9), guarded by byte-identical
  comparisons against the frozen TS outputs (whole CLI output and stage dumps of every corpus binary).
  Known targets: stage 5's phase 4 on worker threads (the order-dependent part is the view table: name
  and add views in a sequential pre-pass, print in parallel), the concrete runs of `anchorstate` /
  `cpiexec` (repeated interpreter runs per callee), and the allocation-heavy parts of stage 4.

- **Stage 4 is done for the raw output** (above): structuring, statement idioms, the printer and the raw
  printing path (naming, declarations, function text, single file). The readable output's printing hooks
  (strings, keys, typed views, frame objects, comments, `stripUndef`, outlining with `ret_tail_N`/`tail_N`)
  belong to stage 5 with the views / accounts / semantics they read; the printer's structure (buffer
  writer, `ProgNames`, statement indices) is where they plug in. The `rawfile` dump gets the analysis
  summary block back when stage 8 lands.
- **Semantics moved partly forward**: the raw output's function names need `Semantics`' instruction-log
  classification (`ix_*` names, processors) and the Anchor flag; those are ported in `sbpf-print::names`
  (stage 7 keeps the rest of `semantics.ts`).
- **Stage 2 and stage 3 are done** (above). Stage 3's `opt`/`optir`/`compact` dumps check the composed
  per-function pipeline in its exact order, over all functions as `--full` builds them; the library skip
  (classification) arrives with stage 7, whose dump should then re-run stage 3 on user functions only.
- **Parallelism is in**: the per-function phase runs on worker threads (`par_each`); later per-function
  stages (structuring, printing) should use the same driver. Shared IR strings are `Arc<str>`.
- **Remaining single-thread headroom in stage 3** is in whole-function recounts per round (see *Stage 3
  results*); not worth an algorithm change while the parallel driver already gives 15–18×.
- **`decompile.ts` gets a stage.** Its own passes are 10–12% of the run and sit between the listed
  modules: `sinkFrameLoads`, naming (`nameThunks`, symbol sanitizing), phase 3 (discriminator constants,
  Result layouts, out-parameters), declarations. Port its phase 2 driver with stage 3, its structuring
  glue with stage 4, and the rest with stage 5 (they read views/semantics), each behind the stage's dump.
- **Effort goes to stage 3 and stage 8.** optimizeFunc (13–19%) and the analysis layer (15–22%) are two
  thirds of the Rust payoff. Stage 3 is also where per-function parallelism should be designed in (the
  per-function arena makes it possible; the only shared state read is the signatures and the
  program image).
- **IR decision is final**: plain arena, no hash-consing (above). Later stages keep TS's object identity
  semantics by comparing ids; any structural sharing index is an add-on.
- The stage order is unchanged (it follows data dependencies).
- **End state (clarified):** only the decompiler implementation moves to Rust; its output stays the
  TypeScript it is today (same text, `lib.d.ts` runtime model, project layout), byte for byte. The TS
  implementation is then removed, so every design is Rust-native (no FFI or callbacks into TS, no JS
  runtime), and before the removal the oracle's outputs must be frozen as regression fixtures: the whole
  CLI output (`-o dir/`) and the stage dumps of every corpus binary, which the Rust tests then compare
  against instead of `scripts/parity.ts`.
