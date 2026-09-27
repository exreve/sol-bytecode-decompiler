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
| `sbpf-dump` | `scripts/dump.ts`, `scripts/stagetime.ts` | stage dump binary, stage timer |

Dependencies are kept minimal: `indexmap` (JS `Map`/`Set` insertion order) and `serde_json` (string
escaping only).

## Build and run

The cargo target dir is outside `/home` (`.cargo/config.toml`: `/tmp/claude-1000/rs-target`).

```sh
cd rs && cargo build --release
/tmp/claude-1000/rs-target/release/sbpf-dump prog.so out_dir            # stage dumps (as scripts/dump.ts)
/tmp/claude-1000/rs-target/release/sbpf-dump --time --iters 5 a.so b.so # stage timings (as scripts/stagetime.ts)

node scripts/dump.ts prog.so out_dir                                     # the TS oracle's dumps
node scripts/parity.ts --root <repo with corpus/>                        # all standard binary sets
node scripts/parity.ts samples/token.so compat/bin                       # given files / dirs
node scripts/parity.ts --fuzz 1000 --seed 7 samples compat/bin           # mutants (all versions, corrupt headers)
```

Both dumpers take `prog.so [--idl x.json] [--stages elf,insns,cfg,lift,dataflow,vars,stack,stackargs] out_dir`
(the IDL is accepted for the later stages; the stages so far do not read it).

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

### Later stages (planned)

Each later stage adds its own `<stage>.jsonl` with the same rules, e.g. `dataflow` (signatures:
noreturn, nparams, extraIn, returns, stackArgs; materialized blocks), `optir` (IR per function after
each optimization group, same node encoding plus `var`), `struct` (structured statement trees),
`text` (the printed TS output, verbatim, as one JSON string per function), `analysis` (the analysis
JSON, re-serialized with its own documented key order). Add the dumper to both `scripts/dump.ts`
(`STAGES`) and `sbpf-dump`, bump `format` only when an existing stage's encoding changes.
