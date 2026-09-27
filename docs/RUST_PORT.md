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
| 3 | `simplify`, `cfgopt`, `ifconv`, `idioms`, `compact` | `optir` (IR after each group) |
| 4 | `structure`, `stmtidioms`, `print` | `struct`, `text` (printed output) |
| 5 | `views`, `accounts`, `structs`, `frameregions`, `fieldnames`, `anchor`, `anchorstate`, `idl`, `state` | `views`, `accounts`, `layout` records |
| 6 | `exec`, `cpiexec`, `cpi`, `builtins` | `exec`, `cpi` |
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

## Plan changes

- **Stage 2 is done** (above). The `stack`/`stackargs` dumps are harnesses on unoptimized IR; stage 3
  must add the composed per-function dump (`optir`: IR after recoverVars → optimizeFunc → promoteStack →
  optimizeFunc → idioms, then after rewriteStackArgs and `sinkFrameLoads`/`compactStores`), over all
  functions as `--full` builds them (classification is stage 7).
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
