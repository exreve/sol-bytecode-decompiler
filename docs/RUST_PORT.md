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

## Stage order

Each stage ports the listed modules and adds its dump(s). A stage may start only when all earlier
stages are at 100% parity.

| # | modules | dump(s) |
|---|---|---|
| 1 | `elf`, `program`, `emu` (+ `murmur`, `syscalls`, `ir` types) | `elf`, `insns`, `cfg`, `lift` (pilot: done except `emu`) |
| 2 | `dataflow`, `stack`, `stackargs` | `dataflow` (signatures, materialized blocks, variables) |
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
  once they are ported. The dump encoding is unaffected.
- **Double arithmetic in the input path.** Header fields are doubles in TS, so the Rust side keeps
  `f64` there (fuzzing hits it within a few hundred mutants). The same pattern will matter wherever
  later stages compute offsets from program data as `number` (views, accounts, layout, exec).
- **The full CFG (`loadProgram` without `lazyBlocks`) is only a dump/test path**; the decompiler forms
  blocks lazily. Its dump stays useful (it pins leaders, block shapes and linking), but stage 2 must
  add the lazy `materializeBlocks` path with its own dump (`dataflow`).
- **Parity runtime.** A full parity run over the 615 binaries takes ~5 min (dominated by the TS side and
  full-CFG dumps of the big programs); fine per stage, and `--stages` narrows it while iterating.
