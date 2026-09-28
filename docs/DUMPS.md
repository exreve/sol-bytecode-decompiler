# Stage dumps (`sbpf-dump`)

`sbpf-dump` writes what each stage of the pipeline ([INTERNALS.md](INTERNALS.md#architecture)) produced, as
canonical JSON lines, and times the stages. It is a development tool: the dumps make a behavior change visible at
the stage that causes it (compare the dumps of two builds with `diff -r`), long before it shows in the whole output.

```sh
sbpf-dump prog.so [--idl x.json] [--stages elf,insns,…] out_dir   # stage dumps (all stages by default)
sbpf-dump --diff a.so b.so out_dir                                 # the program diff report (diff.jsonl)
sbpf-dump --time --iters 5 a.so b.so                               # per-stage timings (ms, best of N)
sbpf-dump --time3 | --time4 | --time5 | --time7 | --time8 --iters 5 a.so   # one stage's breakdown
sbpf-dump --timediff --iters 5 a.so b.so                           # program diff timing
sbpf-dump --timecli --iters 5 a.so                                 # whole CLI output (single file, project; 1 / n threads)
sbpf-dump --cli <sbpf-decompile arguments>                         # the CLI entry (SBPF_THREADS=n: thread count, dev only)

# sampling profile of a CLI run (SIGPROF over all threads, folded stacks; optional dev feature)
cargo build --profile profiling -p sbpf-dump --features prof     # release + line tables
target/profiling/sbpf-dump --prof out.folded [--hz 1000] <sbpf-decompile arguments>
# 1 thread: prefix with `taskset -c 0` (available_parallelism follows the affinity mask)
```

Stages: `elf, insns, cfg, lift, dataflow, vars, stack, stackargs, opt, optir, compact, struct, text, rawfile, types,
rtext, readfile, library, fingerprint, facts, flow, analysis, project` (the IDL is read from stage 5 on).

## Format (format 1)

One file per stage, `<stage>.jsonl`: UTF-8, one compact JSON value per line, `\n` after every line
(including the last). Line 1 is the header `{"stage":"<stage>","format":1}`.

### Canonical encoding

- **Objects**: keys in exactly the order listed below (never sorted, never taken from object
  iteration). Optional keys are omitted when absent, never written as `null`.
- **Strings**: `JSON.stringify` escaping (`\"`, `\\`, `\b \f \n \r \t`, other controls as `\u00xx`
  lowercase; everything else literal, including U+007F and U+2028).
- **Doubles** (offsets, sizes, header fields held as `f64`): JSON number format — integers as plain decimal, and the
  shortest round-trip digits for values that are not exact (a header field above 2^53 prints as e.g.
  `18446744073709552000`; fractional values as `12.5`), printed by `js_num`.
- **u64 values** (constants, VM addresses, pointers): strings, `"0x"` + lowercase
  hex without padding (`"0x0"`, `"0x100000120"`).
- **Byte ranges**: FNV-1a 64 (`"hash"`, 16 lowercase hex digits) plus their length.
- **Arrays**: in the order given below. Insertion-ordered maps / sets are dumped in insertion order (which
  is itself part of the behavior under test), sorted collections in their sorted order.
- **Errors**: when a stage fails, its file has the header then `{"error":"<msg>"}` and later stages are
  absent. `<msg>` is the error message; bounds errors on corrupt inputs are `"out of bounds"`.

### `elf.jsonl` — `parse_elf`

```
{"t":"elf","version","entryPc","textVaddr":hex,"text":<index in sections>,"bytes":<len>,"hash":<fnv of the relocated image>}
{"t":"section","name","type","flags","addr","offset","size","link","entsize"}      (section order; a synthesized .text last)
{"t":"dynsym"|"symbol","name","value","size","type","bind","shndx"}                  (table order)
{"t":"reloc","offset","type","sym"}                                                  (relocation order)
{"t":"callreloc","pc","kind":"fn","name","targetPc"} | {"t":"callreloc","pc","kind":"syscall","name"}   (insertion order)
{"t":"region","name","vaddr":hex,"len","exec","hash"}                                (elf.regions order)
{"t":"dataptr","va":hex,"v":hex}                                                     (insertion order)
{"t":"image","order":[region indices]}                                               (Image's sorted order)
```

### `insns.jsonl` — `decode`

One line per instruction slot: `[pc,opc,dst,src,off,imm]` (`off` i16, `imm` i32, signed decimal).

### `cfg.jsonl` — discovery + CFG

From `load_program` with the full CFG, plus the lazily formed blocks for the lazy path's
per-function call lists:

```
{"t":"symname","pc","name"}                     (p.symbolNames, insertion order)
{"t":"addressTaken","pcs":[...]}                (insertion order)
{"t":"syscalls","names":[...]}                  (p.syscalls keys, registration order)
{"t":"func","pc","name","isEntry","leaders":[blockAt keys = entry, then the other leaders sorted],"calls":[pending_calls(f)],"blocks":<n>}
{"t":"block","id","start","end","stmts":<count>,"term":<Term>,"succs":[...],"preds":[...]}   (after each func, block order)
```

Functions in `p.funcs` order (ascending entry pc). Terms here carry block ids (after `linkBlocks`).

### `lift.jsonl` — lifted IR

`lift(pc)` of every instruction start (every pc except the second slot of `lddw`), by a fresh
`Lifter`, in pc order: `{"pc","stmts":[<Stmt>...],"next":<pc>}` or `{"pc","stmts":[...],"term":<Term>}`.
Lifting is a pure function of the pc (apart from registering syscalls), so this is every function's
IR before optimization: a block's statements are the lifted statements of its pcs `start..end`
(`cfg.jsonl` has the ranges and counts).

### IR encoding

Every node is an object whose first key is `"k"`; the other keys follow the IR node's fields
(`sbpf-ir`) in order:

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

### `dataflow.jsonl` — `infer_signatures` (stage 2)

On a fresh lazily loaded program (the decompiler's path), after `infer_signatures`
(noreturn fixed point, `materialize_blocks`, parameters/returns fixed point):

```
{"t":"func","pc","noreturn","returns","nparams","extraIn":[...],"leaders":[blockAt keys],"blocks":<n>}
{"t":"block","id","start","end","stmts":<count>,"term":<Term>,"succs":[...],"preds":[...]}   (after each func)
```

The block statements are the lifted statements of `start..end` (cut after a noreturn call), see
`lift.jsonl`; their variable form is in `vars.jsonl`.

### `vars.jsonl` — `recover_vars` (stage 2)

`recover_vars` of every function in `p.funcs` order, then per function:

```
{"t":"func","pc","vars":[[reg,param,undef],...]}          (VarInfo by id)
{"t":"block","id","start","end","stmts":[<Stmt>...],"term":<Term>,"succs":[...],"preds":[...]}
```

### `stack.jsonl` — `promote_stack` (stage 2)

`promote_stack` of every function, run on `recover_vars`' output (the pipeline runs it after
`optimize_func`; here it is a harness of the same code on unoptimized IR):
`{"t":"func","pc","promoted":<bool>}`, and when true
`{"t":"slots","slots":[[off,size,var],...],"vars":[...]}` plus the function's block lines (as in
`vars.jsonl`; `off` is a double).

### `stackargs.jsonl` — `rewrite_stack_args` (stage 2)

`rewrite_stack_args` over all functions after the `stack` stage: `{"t":"nstack","pc","n"}` (insertion order),
then per function `{"t":"func","pc"[,"stackArgs"][,"argAreaElided"][,"vars"],"changed":<bool>}`
(`vars` for the functions given stack parameters) followed by its block lines when its IR differs from
the `stack` stage.

### `opt.jsonl`, `optir.jsonl`, `compact.jsonl` — the per-function phase (stage 3)

On a fresh lazily loaded program after `infer_signatures` and `recover_vars` of every function, the
decompiler's phase 2 over every function in `p.funcs` order (as `--full` builds them: library classification
is stage 7), with read-only memory folding on the program image:

- `opt`: per function after `optimize_func`: `{"t":"func","pc","settled","vars":[...]}` (`settled`:
  the fixpoint flag that lets the pipeline skip a later `optimize_func`) + its block lines (as
  in `vars.jsonl`).
- `optir`: the same after the whole per-function phase: `optimize_func`; `promote_stack`, then `optimize_func`
  if it promoted; `recognize_idioms`, then `optimize_func` if it changed something and (really modified the
  IR or the function is not settled).
- `compact`: after `rewrite_stack_args` over all functions, then `sink_frame_loads` and `compact_stores` per
  function (the IR structuring starts from): `{"t":"nstack","pc","n"}` (insertion order), then per function
  `{"t":"func","pc"[,"stackArgs"][,"argAreaElided"],"vars"}` + its block lines.

A `recover_vars` error is an `opt` error line (later stage 3 dumps absent).

### `struct.jsonl`, `text.jsonl`, `rawfile.jsonl` — structuring and printing (stage 4)

The raw decompiler output (`sbpf_print::raw`, the form `sbpf-equiv --raw` evaluates; no library
classification, no readable-mode names / views / comments / outlining),
per function in `p.funcs` order:

- `struct`: `{"t":"func","pc","irreducible","nvars","body":[<Node>...]}` — the body after `structure`,
  `cleanup` and `statement_idioms`; `nvars` counts the dispatcher's state variable. Nodes (`sbpf_struct::SNode`,
  keys in declaration order): `{"k":"stmt","s":<Stmt>}`, `{"k":"if","c","then","else"}`,
  `{"k":"block","label","body"}`, `{"k":"loop","label"(null),"body","form"[,"c"]}`,
  `{"k":"break"|"continue","label"(null)}`, `{"k":"return","e"(null)}`, `{"k":"trap","msg"}`,
  `{"k":"switch","v","cases":[{"vals","body"}]}`, `{"k":"setstate","v","val"}`.
- `text`: `{"t":"func","pc","name","text"}` — the function's printed text, verbatim.
- `rawfile`: `{"text"}` — the single-file rendering (`render_single`) without the analysis summary block
  (`// security summary …` up to the blank line after it): the raw mode is not a CLI output and its printer
  collects no analysis facts.

A decompilation error is a `struct` error line (later stage 4 dumps absent).

### `types.jsonl`, `rtext.jsonl`, `readfile.jsonl` — the readable output (stage 5)

The readable decompiler output with library code decompiled (the CLI's `--full`; `--idl x.json` as the CLI's),
per function in output order:

- `types`: `{"t":"func","pc","name","names","types"}` — `names`: the variables' names by id (holes as `null`,
  trailing `null`s dropped); `types`: `[[id, view]...]`, the typed-view assignment in insertion order.
- `rtext`: `{"t":"func","pc","name","text"}` — the function's printed text, verbatim (comments, typed views,
  account fields, CPI / PDA notes, outlined-tail calls).
- `readfile`: `{"text"}` — the single file (`render_single`: instruction table with IDL args / accounts, the analysis
  summary block, helpers, typed-view declarations, syscalls, outlined tails, grouped functions): the CLI's `--full`
  output, verbatim.

A decompilation error is an error line in the first requested of these dumps.

### `library.jsonl`, `fingerprint.jsonl`, `readfile.jsonl` line 3, `diff.jsonl` — library code and the default output (stage 7)

The default output: library functions are classified and not decompiled
(one-line `declare function` stubs for those user code references).

- `library`: `classify` on a fresh program after `infer_signatures`, per function in `p.funcs` order:
  `{"t":"func","pc","lib","families"[,"name"][,"hint"]}`; then, from the default output, the library functions'
  final names `{"t":"lib","pc","name"}` (classification order: builtin names, renames included), the stubs
  `{"t":"stub","text"}` and `{"t":"count","funcs":<decompiled>,"lib":<libCount>}`.
- `fingerprint`: `{"text"}`, the project output's `security/fingerprints.json` (per-function 
  hash / regfree / data / fuzzy signatures, library flags, the instructions whose handlers reach each function).
- `readfile` gets a third line `{"lib":true,"text"}` (or `{"lib":true,"error"}`): the default single file (the CLI's
  stdout), analysis summary block included.
- `project` (stage 8c): `{"path","text"}` per file of `-o dir/` (`render_project`, in its insertion order: modules,
  `outlined.ts`, `lib.d.ts`, `index.ts`, `bundle/*`, `security/analysis.json`, `summary.md`, `<ix>.md`,
  `fingerprints.json`), verbatim.
- `diff` (`--diff a.so b.so out_dir`): `{"text"}`, the report of `sbpf-decompile a.so b.so -o report.txt` (all rows, the
  two paths as labels), or an error line.

A default-output error is an error line in each requested stage 7 dump.

### `facts.jsonl`, `flow.jsonl` — the analysis foundation (stage 8a)

Both on the default output. Expressions are the IR encoding above (`<Expr>`), in their function's arena.

- `facts` (`analysis/facts.rs`, read before the single file's analysis adds to them),
  per function in printing order: `{"t":"fn","pc","name"[,"wrapper":true],"at","types":[[name,type]...]}`, then
  `{"t":"check","line"[,"pc"],"cond","failsIf","error","kinds","refs":[{"acct"[,"field"]}...][,"named"],"main"[,"before"][,"via":{"fn","kinds"}][,"c"][,"passPc"][,"cmp32":true][,"logRel":[a,b]][,"pubkeys":true]}`,
  `{"t":"op","line"[,"pc"],"kinds","text","main","errPath"[,"cpi":{"program"[,"known"][,"checked"][,"seeds"],"fields","accounts":[{["role"],"text"[,"w"][,"s"]}...][,"src":{["program"],"accounts","fields"}][,"family"][,"ix"]}][,"target":{"acct"[,"field"]}][,"how"][,"value"][,"pda":{"fn","seeds","program"}][,"via"][,"ret"][,"exit"][,"handler"]}`,
  `{"t":"call","line"[,"pc"][,"ret"],"callee","main","errPath"}`, `{"t":"hint","line","program","family","ix","how"[,"call":{"fn","pc"}]}`,
  `{"t":"pcline","m":[[pc,line]...]}`, `{"t":"condline","m":[[<Expr>,line]...]}` (insertion order).
- `flow` (`analysis/flow.rs`, `paths.rs`, `sources.rs`), after the analysis ran (the same calls through
  `decompile_read_hook`, in `analyze0`'s order): `{"t":"exit","pc"[,"type"],"param","fields":[[off,size,name]...][,"subs"]}`
  per exit function; `{"t":"xop","fn",…}` the facts ops the exit / callee writes added (op encoding); `{"t":"indirect","targets","byDisc"}`;
  native: `{"t":"split","root","via","groups":[{"tags","name","source"[,"accounts"],"dispatchers","tag":[fn,var]}]}` and
  `{"t":"allowed","name","fn","m":"0101…"}` (the group's blocks per dispatcher); Anchor: `{"t":"try","h","tryPc","layout":[[name,off,type,doc]...][,"boxInfo"][,"words"][,"ptrs"][,"seqs"]}`,
  `{"t":"dataReads","h","accts"}`. Then every instruction context analyze0 builds (its loop mirrored in the dump, before the
  report drops empty dispatch parts and sorts by score; the analysis' own contexts are checked against it), in creation order:
  `{"t":"ix","name","handler","functions","parents":[[fn,parentFn,pc|null,ret|null]...][,"restricted"][,"tag"],"indirect","accounts":[[index,name,source,signer,writable,pda,optional,address]...]}`;
  native: per function `{"t":"res","fn","byName","conds":[[block,refs,sides,cmp32,pdaEq,pdaBufs]...],"stores":[[pos,index,field,how]...]}`
  (`ctx_resolver`); per point the report reads (ops, checks' deciding blocks) `{"t":"path","fn","b","conds":[[fn,block,holds,how,panics]...]}`
  (`path_to`) and once per condition `{"t":"vk","fn","b","key","cmps"}` (`value_key`, `cmps_of`); per op with a pc
  `{"t":"src","fn","pc","v":[[[source,kind,acct]...]...]}` (`source_ctx` of the stored value / each call argument).

A default-output error is an error line in each requested stage 8 dump; an error of the flow walk is an error line
after the flow header.

### `analysis.jsonl` — the report layer (stage 8b)

The analysis (`analyze0`, phase 2, phase 3, audit, consistency, libcpi, incidents; `crates/sbpf-read/src/analysis/`)
as it stands when phase 2 is about to run the incident rules (the rule engine's findings saved at that point), then
the final findings and fund movers: everything `render_json` writes to `security/analysis.json` except the `where` file mapping (checked by `project`), plus
the internal fields the rules read. `<Loc>` = `{"fn","line"[,"pc"]}`. Lines, all key orders fixed:

- `{"t":"program","version","instructions","functions","anchor","idl"}`;
- per instruction (sorted by score, then name by `locale_cmp`): `{"t":"ix","name","handler","kind"[,"dispatch"],"score","effects","functions","indirect"}`,
  `{"t":"acct"[,"index"],"name","source","expected":{["signer"],["writable"],["pda"],["address"],["optional"]},"constraints":[[kind,{"status"[,"at"][,"via"][,"note"]}]...]}`,
  `{"t":"check","id","at","status"[,"account"],"kinds","cond","fails_if","error"[,"via"][,"sides"][,"pdaBufs"],"fnPc"[,"passPc"],"main"[,"keyCmp"][,"cross"]}`,
  `{"t":"op","at","kinds","text","main"[,"target"][,"how"][,"value"][,"cpi":{"program"[,"known"][,"checked"][,"family"][,"ix"][,"seeds"],"fields","accounts":[{["role"],"text"[,"w"][,"s"]}...]}][,"pda":{"fn","seeds","program"}][,"fnPc"][,"anchorClose"][,"guards"][,"bypass":[{"check","path":[<Loc>...][,"strong"]}...]][,"sources":[{"param","source","trust"}...]]}`,
  then `{"t":"trust","rows":[{"value","trust","evidence"}...]}`, `{"t":"relations","rows":[{"a","b","kind","status","at"}...]}`,
  `{"t":"storedKeys","rows":[{"account"[,"type"],"compared","referencedBy","never","gaps"}...]}`,
  `{"t":"authority","rows":[{"op","kind","enabledBy":[{"kind","what"[,"status"][,"writtenBy"]}...]}...]}`,
  `{"t":"paths","rows":[{"op","conds":[{"at","cond","holds","how"[,"check"]}...],"notRequired":[{"check"[,"path"]}...][,"truncated"]}...]}`,
  `{"t":"chains","rows":[{"op","steps":[[{"kind","what"[,"status"]}...]...]}...]}`,
  `{"t":"arith","rows":[{"at"[,"op"],"target","expr","kind","status"[,"guard":{"at","cond"}][,"caller"][,"unnamed"]}...]}`,
  `{"t":"divs","rows":[{"at","expr","divisor","status"[,"guard"]}...]}`, `{"t":"proof","rows":[{"op","kind","props":[{"prop","status","evidence"}...]}...]}`,
  `{"t":"audit","dataReads","bumps":[{"op","source"}...],"ignored","casts":[{"op","expr","bits","source"}...],"remChecked"[,"ownerCmp"],"reinit":[{"op","acct"}...][,"sameType":{"fn","n"[,"type"],"accts"}][,"initWrites":[{"acct","type","at","owner"[,"field"][,"tag"]}...]][,"sysvarReads":[{"acct","sysvar","at","idCompared"}...]][,"initGated"]}`;
- program views: `{"t":"state","field","setBy":[{"ix","value","at"}...],"checkedBy":[{"ix","cond","at"}...]}` (state machine),
  `{"t":"pda","seeds","program","derivedIn","signsIn","accounts","compared"}`, `{"t":"writes","target","writes":[{"ix","how","at"}...]}`,
  `{"t":"dep","target","readBy","writtenBy"}`, `{"t":"finding","rule","ix","confidence","weight","title","accounts","path","evidence"}`
  (the rule engine's, in rule order: before the incident rules, the dispatcher grouping and the ranking),
  `{"t":"authField","field","writtenBy"}`, `{"t":"role","role","by","members":[{"ix","account","validations","uses"}...],"inconsistencies":[{"role","ix","account","validation","appliedIn":[{"ix","account"[,"at"]}...],"others","uses","weight"}...]}`,
  `{"t":"unattr","at","kinds","text"[,"target"][,"how"][,"value"][,"cpi"][,"pda"]}` (operations no handler reaches);
- then (8c) the final findings, `{"t":"ranked","rule","ix","confidence","weight","title","accounts","path","evidence"}`
  (incident rules added, `cpi-unchecked-program` findings merged with `signer-to-untrusted-program`, one finding per
  place of a dispatcher, ranked by `rank * 10 + weight`, then instruction), and `{"t":"fundMover","instruction","authority","kind"[,"from"],"at"}`.

A default-output error is an error line (as for the other stage 8 dumps); a fatal error of the analysis (e.g. a sysvar
read in a branch condition) is an error line after the header.

### Adding a stage

A new stage gets its own `<stage>.jsonl` with the same rules (add it to `STAGES` in `sbpf-dump`); bump `format`
only when an existing stage's encoding changes.
