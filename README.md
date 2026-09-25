# sol-bytecode-decompiler

Decompiles Solana sBPF programs (`.so`, SBPF v0–v3) into compact, **semantically exact** TypeScript,
designed to be read by LLMs reviewing many programs.

```
node src/cli.ts program.so                 # single file to stdout
node src/cli.ts program.so -o out.ts       # single file
node src/cli.ts program.so -o outdir/      # project layout (see below)
  --idl f.json         Anchor IDL: instruction args/accounts (signer/mut/pda), custom error names
  --program-id <id>    fetch the on-chain Anchor IDL (mainnet, or $RPC)
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
| `c ? a : b` | select (from if-conversion; only the chosen arm is evaluated) |
| `popcount clz ctz min max smin smax sat_sub` | pure helpers recognized from bit tricks / branches (`clz(0) = 64`, `sat_sub(a, b) = a >= b ? a - b : 0`) |
| `memeq(p, q, n)` | n bytes at p equal n bytes at q, compared as ascending 8-byte words, stopping at the first difference |
| `keyeq(p, "<base58>")` | the 32 bytes at p equal that public key (same word-wise comparison) |
| `rc_inc(p[, x])` | Rc count increment: `x = ld64(p)` (unless given); `st64(p, x + 1)`; `abort()` if x was `-1` |
| `rc_dec(p[, x])` | Rc drop: `x = ld64(p)` (unless given); `st64(p, x - 1)`; if x was 1, `st64(p + 8, ld64(p + 8) - 1)` |
| `fp`, `s30` | frame pointer; `s30 = fp - 0x30` names a stack object (`s30 + 8` = its field at +8) |
| `p5, p6, …` | arguments 6+ (SBF passes them through the caller's frame; turned back into parameters) |
| `undef` | a register value left over by a callee (unspecified); a variable read before any assignment and call arguments omitted at the end of the list are `undef` too |
| `"text"` argument | address of the first occurrence of those UTF-8 bytes in program memory (next argument is the length); text found elsewhere is shown as `0x100001234 /* "text" */` |
| memory map | `0x1_0000_0000` program/rodata, `0x2_…` stack, `0x3_…` heap, `0x4_…` input |
| `x: AccountInfo`, `x.is_signer` | typed view (below): `x.f` is exactly the load / address its declaration gives, `x.f = v` the store |
| `x[k]` | for a view declared `extends sized<N>`: the k-th such object from x (`x + k * N`), e.g. the next `AccountInfo` in a slice |

Style: tabs, no semicolons, short variable names (`a..e` = register arguments r1..r5, then `f, g, …`).

### Typed views

Variables (and parameters) known to point to a structure are declared with a view type, and memory
accesses through them print as fields. Views are declared with the output (`lib.d.ts` / file header):

```ts
type at<Offset extends number, T> = T  // field: a T at byte Offset (scalar: loaded; ref<U>: loaded pointer; other: address)
interface AccountInfo extends sized<0x30> {   // solana_program::account_info::AccountInfo
	key:       at<0x00, ref<Pubkey>>
	is_signer: at<0x28, u8>
	...
}
function fn_10c18(a: u64, b: u64, c: u64, d: AccountInfo) {
	if (d.is_signer == 0) { ... }          // ld8(d + 0x28)
	fn_67d68(s3c8, d.owner)                // ld64(d + 0x18)
	st64(s180 + 0x28, d[1].is_signer)      // ld8(d + 0x30 + 0x28): the next AccountInfo
```

Built-in views: `AccountInfo` (Rust; `lamports` / `data` point to `LamportsCell` / `DataCell`, the
`Rc<RefCell<…>>` boxes: `acc.data.borrow`, `acc.data.ptr`, `acc.data.len`, `acc.lamports.value.amount`),
`AccountRecord` (serialized input account: `dup_marker`, `is_signer`, `is_writable`, `executable`, `key`,
`owner` (embedded `Pubkey`s), `lamports`, `data_len`, `data`), `Input` (entrypoint parameter: `num_accounts`,
`acc0`). A variable defined once as such a field (`const j = acc.data`) gets the field's view type. A view is an exact alias whatever the variable holds; *which*
variables get a view is inferred (see `src/accounts.ts`), so a view type is a claim to double-check, not a fact.

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
slices/*.txt    security slices: UNVERIFIED views derived from the code above (see below)
```

**Slices** (`slices/cpi.txt`, `pda.txt`, `account_checks.txt`, `account_writes.txt`) index the security-relevant
lines: for each CPI, PDA derivation, condition on an account flag / owner / key (or Anchor constraint error),
and write to account data or lamports, they list the instruction handlers reaching the function (direct calls,
through library code too), the conditions the line runs under (enclosing blocks and earlier early exits), the
definitions of the variables it uses (same function), and the line. They are read off the printed code and
leave everything else out: an index for review, not verified code (never mixed into the `.ts` files).

Anchor handlers are found from their `"Instruction: <Name>"` log and named `ix_<snake_name>`.

### Recovered names and their provenance

Every recovered name says where it comes from, so a reader knows what to double-check:

| tag | source |
|---|---|
| `[idl]` | the Anchor IDL (`--idl` / `--program-id`) |
| `[str]` | the program's own strings: `"Instruction: X"` logs, Anchor account-error names |
| `[known]` | well-known program ids, sysvars, SPL layouts |
| `[heur]` | structural inference: verify before relying on it |

Names without a tag are plain temporaries (`a..e` parameters, `f, g, …` locals, `s30` stack objects,
`fn_<addr>` unnamed functions). Per function, `// names …` / `// accounts …` lines list what was recovered.

**Anchor accounts.** Generated `Accounts::try_accounts` code maps each field's failure to
`Error::with_account_name("<field>")`, so the program's strings name its accounts (the function is found
as the callee most often given an identifier string as its last argument pair). From it:

```ts
// ===== instruction set_fee_authority =====
// instruction handler: set_fee_authority (discriminator …)
// accounts [idl]: 0 whirlpools_config [mut], 1 fee_authority [signer], 2 new_fee_authority    (with an IDL; else, from the strings:)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, new_fee_authority, fee_authority
function ix_set_fee_authority(…)

// Anchor Accounts::try_accounts of instruction set_fee_authority (called by ix_set_fee_authority; …; was fn_c7d08)
// account checks: account (errors raised when a check on it fails) […]: whirlpools_config (ConstraintMut), new_fee_authority (AccountNotEnoughKeys), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, fee_authority
function accounts_set_fee_authority(…) {
	const whirlpools_config: AccountInfo = ld64(s108)
	…
	if (whirlpools_config.is_writable == 0) { … 0x7d0 /* anchor::ConstraintMut */ … "whirlpools_config" … }
	const o = fee_authority.key
```

**Instruction arguments (IDL).** With an IDL, the argument list of each instruction becomes a view of its
Borsh layout (the fixed-offset prefix, up to the first variable-size field), and the handler's variable
holding the instruction data (a parameter, or a copy of one, whose constant-offset loads all fit the fields)
is declared with it; variables that are exactly one argument are named after it:

```ts
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount, …
	const args: SwapArgs = p5
	const amount = args.amount
	const u = ld64(args.sqrt_price_limit + 8)     // u128: embedded, 16 bytes
	if (2 > amount_specified_is_input) { …        // bool validation
```

**Account data (IDL).** Each IDL account type becomes a view `<Name>Account` of its data: the 8-byte
discriminator, then the fields in serialized order (Borsh prefix; zero-copy accounts are `Pod`, so laid out the
same way). A pointer whose first 8 bytes are compared with the account's discriminator gets it (directly, or as
`ld64(P)` for a slice `P` checked in a caller), and a serialized input record `r` whose `ld64(r + 0x58)` is
compared (zero-copy `AccountLoader`) gets `<Name>Record`, whose `data` field is the layout:

```ts
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: whirlpool_data: WhirlpoolAccount
	const whirlpool_data: WhirlpoolAccount = ld64(b)
	const k = whirlpool_data.tick_spacing
	const an = ld64(whirlpool_data.sqrt_price)     // u128
function fn_22210(a: u64, whirlpool_acc: WhirlpoolRecord, …)
	if (ld64(whirlpool_acc.owner) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */) { … AccountOwnedByWrongProgram … }
```

A variable gets an account's name when a branch testing it fails with that account's name unconditionally
(or it is the AccountInfo pointer loaded from the same try-result as such a variable), and it is used like
an AccountInfo (flag bytes at +0x28..0x2a, or its key pointer used as a 32-byte key).

### Annotations (comments only)

* account fields through recognized account pointers that are not a variable (e.g. a loaded pointer)
  name the field in a comment: `ld8(ld64(s30) + 0x28 /* is_signer */)` (through variables: typed views, above);
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
  frame get a line describing it, read back from the stores along straight-line code. Instructions of well-known
  programs (SPL Token / Token-2022 incl. p-token, System, Associated Token Account, Compute Budget) are decoded,
  accounts by role and data fields by name:
  `// CPI TOKEN_PROGRAM.Transfer { source: f.key (w), destination: g.key (w), authority: h.key (s), amount: ld64(a + 0x20) }, no signer seeds`.
  When the program id is not a constant, the comment says whether it is compared with a known program id in the
  same function, and a data/account shape matching SPL Token or System is decoded as such, marked as a guess:
  `// CPI program *(q + 8) (id not a constant, and not compared with a known program id in this function) — data and accounts match SPL Token TransferChecked; if it is SPL Token: { source: i.key (w), mint: h.key, … }`.
  Anything else: `// CPI: program <name or key>, accounts [...], data 24 bytes [u64 0x… (ix:swap), …], signer seeds ["vault", …]`.
  Small functions whose one CPI is decoded are named after it: `cpi_token_transfer_checked` (`[known]` when the program id
  is a constant, `[heur]` when only the data shape matches);
* PDA derivations (`sol_try_find_program_address` / `sol_create_program_address`, thin wrappers, and
  `Pubkey::find/create_program_address`) whose seed list is built in the frame:
  `// PDA find_program_address(["whirlpool", *ao, *ap, *aq, u16 ld16(s2a2)], program *(ld64(s2b0)))`
  (string seeds, known keys, `*src` for 32 bytes copied from `src`, `u16 v` for small values);
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

Every transformation is an identity on the VM semantics — with one documented assumption in the
default mode: stack slots of the current function are only accessed through frame-pointer-derived
addresses (true for every memory-safe execution). Stack slots whose address never escapes become
variables, and SBF stack-passed arguments become parameters. `--exact-memory` turns both off, making
the output exact even for executions that corrupt their own stack frame through wild pointers.

Every transformation is an identity on the VM semantics (agave `solana-sbpf` interpreter, including
quirks such as SBPF v0 `add32/sub32/mul32` sign-extending their result). Traps (division by zero,
memory faults) are never dropped or reordered across side effects.

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
node test/equiv.ts samples/token22.so 4      # 545 functions, 2180 trials, 0 failing (--raw form)
SUGAR=1 node test/equiv.ts samples/token22.so 3   # the readable output (CLI default: names, strings, typed views)
IDL=corpus/idl/<id>.json node test/equiv.ts corpus/<id>.so 3   # readable output with the Anchor IDL's names
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
| `src/simplify.ts`, `src/cfgopt.ts` | exact expression simplification, propagation, tail duplication, DSE, jump threading |
| `src/ifconv.ts`, `src/idioms.ts` | if-conversion to selects; bit-trick and multi-word compare idioms (popcount/clz/ctz, memeq/keyeq) |
| `src/accounts.ts` | AccountInfo / raw account pointer recognition (view types, field-name comments) |
| `src/views.ts` | typed views: declarations (`at<>`), field resolution for the printer |
| `src/anchor.ts` | Anchor account names, checks and account variables from account-error strings |
| `src/state.ts` | IDL account data layouts: views, pointers found by discriminator checks |
| `src/slices.ts` | security slices (unverified views): sinks, guards, definitions, reaching handlers |
| `src/stack.ts`, `src/stackargs.ts` | stack slot promotion (escape analysis), stack-passed arguments |
| `src/structure.ts` | structuring (stackifier: correct by construction; irreducible CFGs made reducible by node splitting, state machine only past a size budget) |
| `src/stmtidioms.ts` | statement idioms on the structured body (rc_inc / rc_dec) |
| `src/cpi.ts` | CPI and format-string descriptions (comments) |
| `src/compact.ts` | store/copy run compaction |
| `src/print.ts`, `src/layout.ts` | TypeScript printer, output layout |
| `src/semantics.ts`, `src/library.ts`, `src/fingerprint.ts` | Solana knowledge, library recognition |
