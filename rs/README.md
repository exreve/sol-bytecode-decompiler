# rs/ — Rust port of the decompiler (staged)

The TypeScript implementation in `src/` is the oracle until the port is complete. Every ported stage
must produce **byte-identical stage dumps** to `scripts/dump.ts`; `scripts/parity.ts` checks that.
Plan, parity rules and pitfalls: [`docs/RUST_PORT.md`](../docs/RUST_PORT.md).

## Layout

| crate | ports | contents |
|---|---|---|
| `sbpf-elf` | `src/elf.ts` | ELF loader, relocations, regions, `Image` |
| `sbpf-ir` | `src/ir.ts` (types) | arena IR: `Ir` (16-byte `Node`s, `E` ids, `L` lists), `Stmt`, `Term`, `CallTarget` |
| `sbpf-program` | `src/program.ts`, `src/murmur.ts`, `src/syscalls.ts` | decode, lifter, function discovery, CFG (full and lazy) |
| `sbpf-dataflow` | `src/dataflow.ts`, `src/stack.ts`, `src/stackargs.ts` | signatures (lazy block materialization), variable recovery, stack slot promotion, stack arguments |
| `sbpf-opt` | `src/simplify.ts`, `src/cfgopt.ts`, `src/ifconv.ts`, `src/idioms.ts`, `src/compact.ts`, decompile's phase 2 | per-function optimizer (`Fx`: arena + per-id caches), `phase2`, `finish` |
| `sbpf-struct` | `src/structure.ts`, `src/stmtidioms.ts` | structured statement trees (`Tree`: `SNode`s + statement table), stackifier, node splitting, dispatcher, clean-up passes, Rc idioms |
| `sbpf-print` | `src/print.ts`, decompile's raw printing path, `layout.ts` renderSingle | printer, declarations, function naming (instruction logs, thunks, symbols), `decompile_raw`, `render_single` |
| `sbpf-exec` | `src/exec.ts` (+ SHA-256 / Keccak) | concrete interpreter of the built functions (CPI / account runs) |
| `sbpf-read` | `src/views.ts`, `accounts.ts`, `structs.ts`, `frameregions.ts`, `fieldnames.ts`, `anchor.ts`, `anchorstate.ts`, `idl.ts`, `state.ts`, `cpi.ts`, `cpiexec.ts`, `outline.ts`, `taint.ts`, the rest of `decompile.ts`, `semantics.ts`, `selector.ts` (lookup), `diff.ts`; `src/analysis/facts.ts`, `flow.ts`, `paths.ts`, `sources.ts` (`analysis/`) | the readable output (`decompile_read` with or without library classification, `render_read`, `render_fingerprints`), the program diff (`diff::diff_report`) |
| `sbpf-lib` | `src/fingerprint.ts`, `src/library.ts` (+ `crateOf` of `src/demangle.ts`), `src/builtins.ts` | function fingerprints and signatures (local SHA-1), library classification against `data/libsigs.json` / `data/libnames.json` (crate-aware policy, behavioral names), u128 builtins recognized by behavior |
| `sbpf-dump` | `scripts/dump.ts`, `scripts/stagetime.ts` | stage dump binary, stage timer |

Dependencies are kept minimal: `indexmap` (JS `Map`/`Set` insertion order), `serde_json` (string
escaping; IDL parsing with `preserve_order`), `regex` and `miniz_oxide` (sbpf-read).

## Build and run

The cargo target dir is outside `/home` (`.cargo/config.toml`: `/tmp/claude-1000/rs-target`).

```sh
cd rs && cargo build --release
/tmp/claude-1000/rs-target/release/sbpf-dump prog.so out_dir            # stage dumps (as scripts/dump.ts)
/tmp/claude-1000/rs-target/release/sbpf-dump --time --iters 5 a.so b.so # stage timings (as scripts/stagetime.ts)
/tmp/claude-1000/rs-target/release/sbpf-dump --time3 --iters 5 a.so     # stage 3 timings (as stagetime.ts --stage3)
/tmp/claude-1000/rs-target/release/sbpf-dump --time4 --iters 5 a.so     # stage 4 timings (as stagetime.ts --stage4)
/tmp/claude-1000/rs-target/release/sbpf-dump --time5 --iters 5 a.so     # stage 5 timings (as stagetime.ts --stage5)
/tmp/claude-1000/rs-target/release/sbpf-dump --time7 --iters 5 a.so     # stage 7 timings (as stagetime.ts --stage7)
/tmp/claude-1000/rs-target/release/sbpf-dump --time8 --iters 5 a.so     # analysis foundation (as stagetime.ts --stage8)
/tmp/claude-1000/rs-target/release/sbpf-dump --timediff --iters 5 a.so b.so   # program diff timing (as stagetime.ts --diff)
/tmp/claude-1000/rs-target/release/sbpf-dump --diff a.so b.so out_dir   # diff.jsonl (as dump.ts --diff)

node scripts/dump.ts prog.so out_dir                                     # the TS oracle's dumps
node scripts/parity.ts --root <repo with corpus/>                        # all standard binary sets
node scripts/parity.ts samples/token.so compat/bin                       # given files / dirs
node scripts/parity.ts --fuzz 1000 --seed 7 samples compat/bin           # mutants (all versions, corrupt headers)
node scripts/parity.ts --idl --stages types,rtext,readfile bench/bin     # binaries with an IDL, given to both
```

Both dumpers take `prog.so [--idl x.json] [--stages elf,insns,cfg,lift,dataflow,vars,stack,stackargs,opt,optir,compact,struct,text,rawfile,types,rtext,readfile,library,fingerprint,facts,flow] out_dir`, or `--diff a.so b.so out_dir`
(the IDL is read from stage 5 on).

## Stage dump format (format 1)

One file per stage, `<stage>.jsonl`: UTF-8, one compact JSON value per line, `\n` after every line
(including the last). Line 1 is the header `{"stage":"<stage>","format":1}`.

### Canonical encoding

- **Objects**: keys in exactly the order listed below (never sorted, never taken from object
  iteration). Optional keys are omitted when absent (TS `undefined`), never written as `null`.
- **Strings**: `JSON.stringify` escaping (`\"`, `\\`, `\b \f \n \r \t`, other controls as `\u00xx`
  lowercase; everything else literal, including U+007F and U+2028).
- **JS numbers** (TS `number`): `JSON.stringify` number format — integers as plain decimal, and the
  shortest round-trip digits for values that are not exact (a header field above 2^53 prints as e.g.
  `18446744073709552000`; fractional values as `12.5`). The Rust side prints these through `js_num`.
- **u64 values that are `bigint` in TS** (constants, VM addresses, pointers): strings, `"0x"` + lowercase
  hex without padding (`"0x0"`, `"0x100000120"`).
- **Byte ranges**: FNV-1a 64 (`"hash"`, 16 lowercase hex digits) plus their length.
- **Arrays**: in the order given below. JS `Map`/`Set` contents are dumped in insertion order (which
  is itself part of the behaviour under test), sorted collections in their sorted order.
- **Errors**: when a stage throws, its file has the header then `{"error":"<msg>"}` and later stages are
  absent. `<msg>` is the TS `Error` message; runtime `RangeError`s (DataView bounds, array length) are
  `"out of bounds"`.

### `elf.jsonl` — `parseElf` (a)

```
{"t":"elf","version","entryPc","textVaddr":hex,"text":<index in sections>,"bytes":<len>,"hash":<fnv of the relocated image>}
{"t":"section","name","type","flags","addr","offset","size","link","entsize"}      (section order; a synthesized .text last)
{"t":"dynsym"|"symbol","name","value","size","type","bind","shndx"}                  (table order)
{"t":"reloc","offset","type","sym"}                                                  (relocation order)
{"t":"callreloc","pc","kind":"fn","name","targetPc"} | {"t":"callreloc","pc","kind":"syscall","name"}   (Map order)
{"t":"region","name","vaddr":hex,"len","exec","hash"}                                (elf.regions order)
{"t":"dataptr","va":hex,"v":hex}                                                     (Map order)
{"t":"image","order":[region indices]}                                               (Image's sorted order)
```

### `insns.jsonl` — `decode` (b)

One line per instruction slot: `[pc,opc,dst,src,off,imm]` (`off` i16, `imm` i32, signed decimal).

### `cfg.jsonl` — discovery + CFG (c)

From `loadProgram(bytes)` (full CFG) plus `loadProgram(bytes, {lazyBlocks: true})` for the lazy path's
per-function call lists:

```
{"t":"symname","pc","name"}                     (p.symbolNames, Map order)
{"t":"addressTaken","pcs":[...]}                (Set order)
{"t":"syscalls","names":[...]}                  (p.syscalls keys, Map order: registration order)
{"t":"func","pc","name","isEntry","leaders":[blockAt keys = entry, then the other leaders sorted],"calls":[pendingCalls(f)],"blocks":<n>}
{"t":"block","id","start","end","stmts":<count>,"term":<Term>,"succs":[...],"preds":[...]}   (after each func, block order)
```

Functions in `p.funcs` order (ascending entry pc). Terms here carry block ids (after `linkBlocks`).

### `lift.jsonl` — lifted IR (d)

`lift(pc)` of every instruction start (every pc except the second slot of `lddw`), by a fresh
`Lifter`, in pc order: `{"pc","stmts":[<Stmt>...],"next":<pc>}` or `{"pc","stmts":[...],"term":<Term>}`.
Lifting is a pure function of the pc (apart from registering syscalls), so this is every function's
IR before optimization: a block's statements are the lifted statements of its pcs `start..end`
(`cfg.jsonl` has the ranges and counts).

### IR encoding

Every node is an object whose first key is `"k"`; the other keys follow the TS type declaration
(`src/ir.ts`) in order:

| node | keys |
|---|---|
| `const` | `k, v` (hex) |
| `var` / `reg` / `undef` | `k, id` / `k, r` / `k` |
| `bin` / `cmp` | `k, op, a, b` |
| `neg` / `not` / `lnot` | `k, a` |
| `ext` | `k, signed, bits, a` |
| `bswap` | `k, bits, a` |
| `load` | `k, size, addr` |
| `land` / `lor` | `k, a, b` |
| `sel` | `k, c, a, b` |
| `call` / `fn` (Expr) | `k, t, args` / `k, name, args` |
| CallTarget `fn` / `sys` / `ind` | `k, pc` / `k, name, hash` / `k, e` |
| Stmt `set` | `k, dst, e, pc` |
| Stmt `store` | `k, size, addr, v, pc` |
| Stmt `call` | `k, dst, t, args, pc[, extra]` |
| Stmt `eval` | `k, e, pc` |
| Stmt `stores` | `k, size, addr, vals, pc` |
| Stmt `copy` | `k, dst, src, n, pc[, rev]` |
| Stmt `trap` | `k, msg, pc` |
| Term `jmp` / `br` | `k, to` / `k, c, t, f` |
| Term `ret` / `trap` / `tail` | `k, e` (`null` when absent) / `k, msg` / `k, e:null` |

### `dataflow.jsonl` — inferSignatures (stage 2)

On a fresh `loadProgram(bytes, {lazyBlocks: true})` (the decompiler's path), after `inferSignatures`
(noreturn fixed point, `materializeBlocks`, parameters/returns fixed point):

```
{"t":"func","pc","noreturn","returns","nparams","extraIn":[...],"leaders":[blockAt keys],"blocks":<n>}
{"t":"block","id","start","end","stmts":<count>,"term":<Term>,"succs":[...],"preds":[...]}   (after each func)
```

The block statements are the lifted statements of `start..end` (cut after a noreturn call), see
`lift.jsonl`; their variable form is in `vars.jsonl`.

### `vars.jsonl` — recoverVars (stage 2)

`recoverVars` of every function in `p.funcs` order, then per function:

```
{"t":"func","pc","vars":[[reg,param,undef],...]}          (VarInfo by id)
{"t":"block","id","start","end","stmts":[<Stmt>...],"term":<Term>,"succs":[...],"preds":[...]}
```

### `stack.jsonl` — promoteStack (stage 2)

`promoteStack` of every function, run on `recoverVars`' output (the pipeline runs it after
`optimizeFunc`; here it is a harness of the same code on unoptimized IR):
`{"t":"func","pc","promoted":<bool>}`, and when true
`{"t":"slots","slots":[[off,size,var],...],"vars":[...]}` plus the function's block lines (as in
`vars.jsonl`; `off` is a JS number).

### `stackargs.jsonl` — rewriteStackArgs (stage 2)

`rewriteStackArgs` over all functions after the `stack` stage: `{"t":"nstack","pc","n"}` (Map order),
then per function `{"t":"func","pc"[,"stackArgs"][,"argAreaElided"][,"vars"],"changed":<bool>}`
(`vars` for the functions given stack parameters) followed by its block lines when its IR differs from
the `stack` stage.

### `opt.jsonl`, `optir.jsonl`, `compact.jsonl` — the per-function phase (stage 3)

On a fresh lazily loaded program after inferSignatures and recoverVars of every function, decompile's
phase 2 over every function in `p.funcs` order (as `--full` builds them: library classification is
stage 7), with read-only memory folding on the program image (`setFoldImage`):

- `opt`: per function after `optimizeFunc`: `{"t":"func","pc","settled","vars":[...]}` (`settled`:
  isSettled, the fixpoint flag that lets the pipeline skip a later optimizeFunc) + its block lines (as
  in `vars.jsonl`).
- `optir`: the same after the whole per-function phase: optimizeFunc; promoteStack, then optimizeFunc
  if it promoted; recognizeIdioms, then optimizeFunc if it changed something and (really modified the
  IR or the function is not settled).
- `compact`: after `rewriteStackArgs` over all functions, then `sinkFrameLoads` and `compactStores` per
  function (the IR structuring starts from): `{"t":"nstack","pc","n"}` (Map order), then per function
  `{"t":"func","pc"[,"stackArgs"][,"argAreaElided"],"vars"}` + its block lines.

A recoverVars error is an `opt` error line (later stage 3 dumps absent).

### `struct.jsonl`, `text.jsonl`, `rawfile.jsonl` — structuring and printing (stage 4)

The raw decompiler output: `decompile(bytes, { sugar: false, full: true })` (the form `test/equiv.ts
--raw` evaluates; no library classification, no readable-mode names / views / comments / outlining),
per function in `p.funcs` order:

- `struct`: `{"t":"func","pc","irreducible","nvars","body":[<Node>...]}` — the body after `structure`,
  `cleanup` and `statementIdioms`; `nvars` counts the dispatcher's state variable. Nodes (`src/structure.ts`
  `Node`, keys in declaration order): `{"k":"stmt","s":<Stmt>}`, `{"k":"if","c","then","else"}`,
  `{"k":"block","label","body"}`, `{"k":"loop","label"(null),"body","form"[,"c"]}`,
  `{"k":"break"|"continue","label"(null)}`, `{"k":"return","e"(null)}`, `{"k":"trap","msg"}`,
  `{"k":"switch","v","cases":[{"vals","body"}]}`, `{"k":"setstate","v","val"}`.
- `text`: `{"t":"func","pc","name","text"}` — the function's printed text, verbatim.
- `rawfile`: `{"text"}` — the single-file rendering (`renderSingle`) without the analysis summary block
  (`// security summary …` up to the blank line after it: stage 8).

A `decompile` error is a `struct` error line (later stage 4 dumps absent).

### `types.jsonl`, `rtext.jsonl`, `readfile.jsonl` — the readable output (stage 5)

The readable decompiler output: `decompile(bytes, { full: true, idl })` (the CLI default without library
classification; `--idl x.json` on both dumpers), per function in output order:

- `types`: `{"t":"func","pc","name","names","types"}` — `names`: the variables' names by id (`FuncOut.names`,
  holes as `null`, trailing `null`s dropped); `types`: `[[id, view]...]`, the typed-view assignment
  (`FuncOut.varTypes`) in insertion order.
- `rtext`: `{"t":"func","pc","name","text"}` — the function's printed text, verbatim (comments, typed views,
  account fields, CPI / PDA notes, outlined-tail calls).
- `readfile`: `{"text"}` — the single file (`renderSingle`: instruction table with IDL args / accounts,
  helpers, typed-view declarations, syscalls, outlined tails, grouped functions) without the analysis
  summary block (stage 8), as `rawfile`.

A `decompile` error is an error line in the first requested of these dumps.

### `library.jsonl`, `fingerprint.jsonl`, `readfile.jsonl` line 3, `diff.jsonl` — library code and the default output (stage 7)

The default output is `decompile(bytes, { idl })`: library functions are classified and not decompiled
(one-line `declare function` stubs for those user code references).

- `library`: `classify()` on a fresh program after inferSignatures, per function in `p.funcs` order:
  `{"t":"func","pc","lib","families"[,"name"][,"hint"]}`; then, from the default output, the library functions'
  final names `{"t":"lib","pc","name"}` (classification order: builtin names, renames included), the stubs
  `{"t":"stub","text"}` and `{"t":"count","funcs":<decompiled>,"lib":<libCount>}`.
- `fingerprint`: `{"text"}`, the project output's `security/fingerprints.json` (`layout.ts` fingerprints: per-function
  hash / regfree / data / fuzzy signatures, library flags, the instructions whose handlers reach each function).
- `readfile` gets a third line `{"lib":true,"text"}` (or `{"lib":true,"error"}`): the default single file, without the
  analysis summary block, as line 2 for `--full`.
- `diff` (`--diff a.so b.so out_dir`): `{"text"}`, the report of `sbpf-decompile a.so b.so -o report.txt` (all rows, the
  two paths as labels), or an error line.

A default-output error is an error line in each requested stage 7 dump.

### `facts.jsonl`, `flow.jsonl` — the analysis foundation (stage 8a)

Both on the default output (`decompile(bytes, { idl })`), dev dumps in `scripts/dump8.ts`. Expressions are the
IR encoding above (`<Expr>`), in their function's arena.

- `facts` (`src/analysis/facts.ts`, read before the single file's analysis adds to them: decompile's `debugHooks`),
  per function in printing order: `{"t":"fn","pc","name"[,"wrapper":true],"at","types":[[name,type]...]}`, then
  `{"t":"check","line"[,"pc"],"cond","failsIf","error","kinds","refs":[{"acct"[,"field"]}...][,"named"],"main"[,"before"][,"via":{"fn","kinds"}][,"c"][,"passPc"][,"cmp32":true][,"logRel":[a,b]][,"pubkeys":true]}`,
  `{"t":"op","line"[,"pc"],"kinds","text","main","errPath"[,"cpi":{"program"[,"known"][,"checked"][,"seeds"],"fields","accounts":[{["role"],"text"[,"w"][,"s"]}...][,"src":{["program"],"accounts","fields"}][,"family"][,"ix"]}][,"target":{"acct"[,"field"]}][,"how"][,"value"][,"pda":{"fn","seeds","program"}][,"via"][,"ret"][,"exit"][,"handler"]}`,
  `{"t":"call","line"[,"pc"][,"ret"],"callee","main","errPath"}`, `{"t":"hint","line","program","family","ix","how"[,"call":{"fn","pc"}]}`,
  `{"t":"pcline","m":[[pc,line]...]}`, `{"t":"condline","m":[[<Expr>,line]...]}` (insertion order).
- `flow` (`src/analysis/flow.ts`, `paths.ts`, `sources.ts`), after the analysis ran (TS; Rust: the same calls through
  `decompile_read_hook`, in analyze0's order): `{"t":"exit","pc"[,"type"],"param","fields":[[off,size,name]...][,"subs"]}`
  per exit function; `{"t":"xop","fn",…}` the facts ops the exit / callee writes added (op encoding); `{"t":"indirect","targets","byDisc"}`;
  native: `{"t":"split","root","via","groups":[{"tags","name","source"[,"accounts"],"dispatchers","tag":[fn,var]}]}` and
  `{"t":"allowed","name","fn","m":"0101…"}` (the group's blocks per dispatcher); Anchor: `{"t":"try","h","tryPc","layout":[[name,off,type,doc]...][,"boxInfo"][,"words"][,"ptrs"][,"seqs"]}`,
  `{"t":"dataReads","h","accts"}`. Then every instruction context analyze0 builds (its loop mirrored in the dump, before the
  report drops empty dispatch parts and sorts by score; the analysis' own contexts are checked against it), in creation order:
  `{"t":"ix","name","handler","functions","parents":[[fn,parentFn,pc|null,ret|null]...][,"restricted"][,"tag"],"indirect","accounts":[[index,name,source,signer,writable,pda,optional,address]...]}`;
  native: per function `{"t":"res","fn","byName","conds":[[block,refs,sides,cmp32,pdaEq,pdaBufs]...],"stores":[[pos,index,field,how]...]}`
  (ctxResolver); per point the report reads (ops, checks' deciding blocks) `{"t":"path","fn","b","conds":[[fn,block,holds,how,panics]...]}`
  (pathTo) and once per condition `{"t":"vk","fn","b","key","cmps"}` (valueKey, cmpsOf); per op with a pc
  `{"t":"src","fn","pc","v":[[[source,kind,acct]...]...]}` (sourceCtx `of` of the stored value / each call argument).

A default-output error is an error line in each requested stage 8 dump; an error of the TS flow walk is an error line
after the flow header.

### Later stages (planned)

Each later stage adds its own `<stage>.jsonl` with the same rules, e.g. `dataflow` (signatures:
noreturn, nparams, extraIn, returns, stackArgs; materialized blocks), `optir` (IR per function after
each optimization group, same node encoding plus `var`), `struct` (structured statement trees),
`text` (the printed TS output, verbatim, as one JSON string per function), `analysis` (the analysis
JSON, re-serialized with its own documented key order). Add the dumper to both `scripts/dump.ts`
(`STAGES`) and `sbpf-dump`, bump `format` only when an existing stage's encoding changes.
