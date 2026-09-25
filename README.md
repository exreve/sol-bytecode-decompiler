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

node src/cli.ts program.so -o out.ts                                   # a local binary
node src/cli.ts <program address> --rpc <your rpc url> -o out/          # a deployed program
```

That's it: no install step, no configuration. Output is always the most readable exact form.
More examples: [docs/USAGE.md](docs/USAGE.md).

## Usage

```
sbpf-decompile <program.so | program address> [-o out.ts | -o outdir/] [--rpc <url>] [--idl <file.json>] [--full]

  program.so        a local program binary ("-" reads it from stdin)
  program address   fetched from the RPC endpoint given with --rpc (its on-chain Anchor IDL is used when published)
  -o out.ts         write a single file (default: stdout)
  -o outdir/        write a project: index.ts, bundle/<ix>.ts, ix/, shared.ts, entrypoint.ts, lib.d.ts, security/
  --idl file.json   Anchor IDL (instruction args/accounts, account layouts, error names)
  --full            also decompile recognized library code (default: one-line typed stubs)
```

There is no built-in RPC endpoint: bring your own (`--rpc`). Upgradeable programs are resolved through
their programdata account; loader v4 and the legacy loaders work too.

Discriminator lookup:

```
node src/selector.ts 0xc88775e1919ec6f8     # discriminator -> name   (i:swap)
node src/selector.ts open_position          # name -> instruction / account / event discriminators
```

Speed (8-core VM): memo 0.6 s, token-2022 2.2 s, whirlpool (173k instructions) 3.7 s,
jupiter (258k instructions) 5.6 s.

## Output

```ts
// instruction handler: swap (discriminator sha256("global:swap")[..8] = 0xc88775e1919ec6f8)
// accounts [idl]: 0 token_program [= TokenkegQ…], 1 token_authority [signer], 2 whirlpool [mut], …
// args [idl]: amount: u64, other_amount_threshold: u64, sqrt_price_limit: u128, amount_specified_is_input: bool, a_to_b: bool
// names [heur: Anchor dispatcher / handler argument order (…)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount, …
function ix_swap(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	sol_log("Instruction: Swap", 0x11)
	…
	const args: SwapArgs = ix_args
	const amount = args.amount
	const u = ld64(args.sqrt_price_limit + 8)
	if (2 > amount_specified_is_input) { …
	t = accounts_swap(s70, program_id, s10, other_amount_threshold, fp)

// account checks: account (errors raised when a check on it fails) [str: …]: whirlpools_config (ConstraintMut), …
function accounts_set_fee_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const whirlpools_config: AccountInfo = ld64(s108)
	if (whirlpools_config.is_writable == 0) { …anchor::ConstraintMut… }

// elsewhere: CPIs and PDA derivations described from the frame contents at the call
	// CPI TOKEN_PROGRAM.Transfer { source: q + 8 (w), destination: r + 8 (w), authority: s + 8 (s), amount: ah }
	// PDA find_program_address(["whirlpool", *ao, *ap, *aq, u16 ld16(s2a2) [ix data?]], program *(ld64(s2b0)))
```

Everything printed is executable under the runtime model below and verified against the bytecode
(`test/equiv.ts`); names, view types and comments carry their provenance (`[idl]`, `[str]`, `[known]`,
`[heur]`, see "Recovered names"). The security analysis (`security/`) is a separate, derived view.

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
| `rc_release(p[, x])` | Rc strong-count release: `x = ld64(p)` (unless given); `st64(p, x - 1)`; true when x was 1 (last reference: the caller drops the value) |
| | (`rc_inc` also replaces the nested form `st64(p, x + 1); if (x != -1) { …never falls through… } abort()`; for both, assignments moved before the helper may read the current frame) |
| `fp`, `s30` | frame pointer; `s30 = fp - 0x30` names a stack object (`s30 + 8` = its field at +8) |
| `p5, p6, …` | arguments 6+ (SBF passes them through the caller's frame; turned back into parameters) |
| `undef` | a register value left over by a callee (unspecified); a variable read before any assignment and call arguments omitted at the end of the list are `undef` too |
| `"text"` argument | address of the first occurrence of those UTF-8 bytes in program memory (next argument is the length); text found elsewhere is shown as `0x100001234 /* "text" */` |
| memory map | `0x1_0000_0000` program/rodata, `0x2_…` stack, `0x3_…` heap, `0x4_…` input |
| `x: AccountInfo`, `x.is_signer` | typed view (below): `x.f` is exactly the load / address its declaration gives, `x.f = v` the store |
| `x[k]`, `x.f[k]` | for a view declared `extends sized<N>`: the k-th such object from x (`x + k * N`), e.g. the next `AccountInfo` in a slice; `x.f[k]` for a field that is an array of such objects (`// [count]`) |

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
security/       program analysis: summary.md (read first), <ix>.md per instruction, analysis.json (see below)
```

**Security analysis** (`security/`, phases 1–2 of [docs/ANALYSIS_SPEC.md](docs/ANALYSIS_SPEC.md)), computed from the
same IR in the same run: `summary.md` starts with ranked findings of a small rule engine, then ranks the instructions by sensitivity (value movement, PDA signing, CPIs to
account-supplied programs, authority / state writes, closes) with their effects and what to look at first;
`<ix>.md` has the account privilege matrix (signer / writable / owner / executable / address: what the IDL
expects, and whether the code checks it), the constraints per account, CPIs (program, instruction, accounts,
signer seeds), PDAs, account writes, which checks dominate each sensitive operation (and paths around the ones
that do not), who enables it (signers, stored authority fields and the instructions writing them, PDA
signatures), key/field relations, caller-controlled vs validated values, and every recognized check, each linked
to `bundle/<ix>.ts:<line>`;
`analysis.json` has all of it (schema in `src/analysis/report.ts`). Statuses: `found` (dominates every
sensitive operation; else on every non-failing path), `partial` (some), `not_found` (none recognized — not a proof of absence), `runtime` (enforced by
Solana, e.g. a written account must be writable). Derived and over-approximate: the `.ts` code is the verified
source of truth. The single-file output gets a short summary comment block instead.

Anchor handlers are found from their `"Instruction: <Name>"` log and named `ix_<snake_name>`. Native programs are
split per instruction in `security/` on their tag dispatch (named by an `"Instruction: X"` log, a well-known
program layout such as SPL Token / ATA, or `tag_<n>`).

### Recovered names and their provenance

Every recovered name says where it comes from, so a reader knows what to double-check:

| tag | source |
|---|---|
| `[idl]` | the Anchor IDL (`--idl`, or published on-chain for a fetched program) |
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

**Anchor dispatcher and helpers** (`[heur]`, named only when unnamed): the function comparing the instruction
data's first 8 bytes with the handlers' discriminators is `anchor_dispatch`; the values it passes the same way
to every handler name the handlers' parameters after Anchor's handler ABI:
`ix_swap(a, program_id, accounts, accounts_len, ix_args, ix_args_len)` (`ix_args` = the data after the
discriminator). The account-name function is `Error_with_account_name`, and the callee most often given an
`anchor_lang` error code `anchor_error_from` (`<Error as From<ErrorCode>>::from`).

**Accounts struct and Context** (`[heur]`): each instruction's try_accounts function stores the named account
pointers into the struct it returns (also through the out pointer spilled to a frame slot); those offsets give a
view `<Ix>Accounts` (fields `&AccountInfo`, or an `AccountInfo` copied in place), and `<Ix>Context` = (`program_id`,
`accounts`, and `remaining_accounts` when it is a copy of the slice try_accounts consumed). A function the handler
passes a frame object holding that — a word the handler's `program_id` (its second parameter when the dispatcher
did not name it; also through a frame slot holding only it, or a copy made in the entry block), another word the
address of a copy of the try_accounts result (possibly past a `Result` tag word: the Accounts view is then shifted;
copies through frame memcpy chains count), checked on the frame contents at the call — gets the Context type for
that parameter (Anchor ≥ 0.29 orders the fields remaining_accounts, program_id, accounts, bumps):

```ts
// types [heur]: b: InitializeRewardContext (the handler ix_initialize_reward passes a frame object holding …)
function fn_32bc0(a: u64, b: InitializeRewardContext, c: u64): u64 {
	const f: InitializeRewardAccounts = b.accounts
```

Logic inlined into the handler has no Context parameter.

**Deserialized accounts** (`Account<T>`, `Box<Account<T>>`): try_accounts gets each account from a callee
(`<Account<T> as Accounts>::try_accounts`, given the accounts slice) into a frame object; the object is followed
through the frame word by word (stores of loaded words, memcpy) in statement order — branches that end in an error
return do not change what the frame holds after them — into the struct try_accounts returns, in place, or as a box
(a heap copy, or a box the callee returns). The account's name is the one the account-name error carries when its
payload is the callee's error result (by value or by the address of a frame copy), or, `with_account_name` inlined,
the identifier the error side writes byte by byte into a fresh String buffer. The account type is the IDL account
whose discriminator the callee's code (or a callee's, within 3 calls) holds — as an immediate, or as the address of
its bytes in program memory — or SPL Token `TokenAccount` / `Mint` when it reaches `spl_token::state::{Account, Mint}::unpack` (without
an IDL too). Its in-memory layout — Rust orders the fields itself — comes from running the callee (`src/exec.ts`)
on an account whose data is a sample of that type (Borsh from the IDL, or the SPL layout) with pseudo-random
values and whose owner is the program id (IDL `address`) or the Token program: each value is found at its offset
(values of 4+ bytes by their bytes, smaller ones by changing them in another run). That gives a view named after
the type, `info` being the `&AccountInfo`, arrays of structs as element views (`x.reward_infos[1].vault`), the
IDL type in a comment where the view type does not say it (`// i32`); the box variable (`<account>_box`) and the
Accounts field get it (`src/anchorstate.ts`). Other account kinds (Signer, AccountLoader, Program, …) give the
field holding their `&AccountInfo` (found by a run of the callee too):

```ts
interface Whirlpool { // Account<Whirlpool> as deserialized in memory (… [idl names; offsets from exec] …)
	info:                 at<0x00, ref<AccountInfo>> // &AccountInfo
	reward_infos:         at<0x08, WhirlpoolRewardInfosElem> // [3]
	token_mint_a:         at<0x1a8, Pubkey>
	liquidity:            at<0x228, u128>
	sqrt_price:           at<0x238, u128>
	tick_current_index:   at<0x280, u32> // i32
	…
interface SwapAccounts {
	token_authority:       at<0x08, ref<AccountInfo>>
	whirlpool:             at<0x10, ref<Whirlpool>> // Box<Account<Whirlpool>>
	token_owner_account_a: at<0x18, ref<TokenAccount>> // Box<Account<TokenAccount>>
…
interface ChangeWhitelistAccounts {
	admin:     at<0x00, ref<AccountInfo>>
	conf:      at<0x08, Conf> // Account<Conf> in place
…
	if ((memcmp(af + 8, whirlpool_box.token_mint_a, 0x20) as u32) == 0) {   // has_one / address constraint
…
	const bk: Whirlpool = m.whirlpool
	cn = ld64(bk.sqrt_price + 8)
```

Temporaries defined once as an account of an Accounts struct (or of a Context's `accounts`) are named after it:
`const whirlpool: Whirlpool = accounts.whirlpool`.

**Parameter types** (`[heur]`): a parameter (never reassigned) gets a view type when at least half of the direct
calls pass an object of that view type and none one of another — or, with fewer, when every load and store through
it hits a field of the view exactly and at least 3 fields: `// types [heur]: b: Whirlpool (1 of 3 calls pass one, …)`,
then `b.tick_current_index = h`, `st64(b.liquidity, i, j)`.

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
compared (zero-copy `AccountLoader`) gets `<Name>Record`, whose `data` field is the layout. An IDL without an
`address` (legacy format) takes the program id from the `DeclaredProgramIdMismatch` check.

**Zero-copy data** (`AccountLoader::load` / `load_mut`): a call given an Accounts field holding an account of IDL
type `T` whose data is not deserialized is run on a synthetic account of that type; when the callee returns the
pointer to the data past the discriminator in its out object, the variable loaded from that word gets the view
`<T>Data` (the layout without the discriminator) — a variable defined otherwise too only when every load and store
through it is reached by such definitions alone: `g.time_unit`, `memcmp(g.delegate_authority, …)`.

Account data views (`<Name>Account`, `<Name>Record`):

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
  programs (SPL Token / Token-2022 incl. p-token, System, Associated Token Account, Compute Budget, Stake) are decoded,
  accounts by role and data fields by name:
  `// CPI TOKEN_PROGRAM.Transfer { source: f.key (w), destination: g.key (w), authority: h.key (s), amount: ld64(a + 0x20) }, no signer seeds`.
  When the program id is not a constant, the comment says whether it is compared with a known program id in the
  same function, and a data/account shape matching SPL Token or System is decoded as such, marked as a guess:
  `// CPI program *(q + 8) (id not a constant, and not compared with a known program id in this function) — data and accounts match SPL Token TransferChecked; if it is SPL Token: { source: i.key (w), mint: h.key, … }`.
  Anything else: `// CPI: program <name or key>, accounts [...], data 24 bytes [u64 0x… (ix:swap), …], signer seeds ["vault", …]`;
  Anchor `emit_cpi!` self-invocations (data starting with `EVENT_IX_TAG`) are labeled as such.
  Small functions whose one CPI is decoded are named after it: `cpi_token_transfer_checked` (`[known]` when the program id
  is a constant, `[heur]` when only the data shape matches, `[known, exec]` when a run of the function builds it:
  `cpi_stake_merge`);
* CPIs whose instruction the frame does not show (built on the heap, by builder functions such as
  `system_instruction::transfer`, passed through library wrappers such as `solana_program::program::invoke_signed`)
  are described from two runs of the function in the reference interpreter (`src/exec.ts`, `src/cpiexec.ts`), marked
  `[exec]`. The parameters hold distinct marker addresses, other memory pseudo-random bytes (different in the two
  runs); branches are forced towards the call when only one side can reach it (and away from panics in callees); an
  input-dependent branch run more than 40 times takes the other side from then on (loops over pseudo-random counts
  exit; what follows is not taken for constants);
  library wrappers get no account infos (their RefCell checks are skipped; the run checks that the wrapper passes the
  instruction on). The instruction reaching the CPI syscall is read back and traced with input taint: the same
  untainted bytes in both runs are constants, a value an 8-byte load produced is `ld64(<its address traced the same
  way>)`, 32 bytes read at an address `*<address>` (shown as the function's variable defined as that expression, when
  there is one); anything computed from the inputs is `?`. Values input-dependent branches select: run B takes the
  other side of each such branch (until the call; flips that keep it from the CPI are dropped), so they differ between
  the runs; after the branches it could not explore, and after any in called functions, computed numbers are not
  taken for constants (instruction tags, keys, flags and random-looking words are):
  `// CPI SYSTEM_PROGRAM.Transfer { from: *f (w,s), to: *l (w), lamports: p7 }, signer seeds p5[..p6] [exec]`
  (bump seeds and PDAs are never taken for constants: the PDA syscall models differ between the runs; a
  budget of interpreter steps per program bounds the time);
* PDA derivations (`sol_try_find_program_address` / `sol_create_program_address`, thin wrappers, and
  `Pubkey::find/create_program_address`) whose seed list is built in the frame:
  `// PDA find_program_address(["whirlpool", *ao, *ap, *aq, u16 ld16(s2a2)], program *(ld64(s2b0)))`
  (string seeds, known keys, `*src` for 32 bytes copied from `src`, `u16 v` for small values);
* instruction-data taint (`[heur]`): from the handlers' `ix_args`, values that may derive from the instruction
  data are followed through arithmetic, frame slots and call arguments (flow-insensitive, interprocedural;
  call results and callee writes are not followed). CPI data fields and PDA seeds that may derive from it are
  marked `[ix data?]` (a program id: `[id from ix data]`), and functions list the parameters it may reach:
  `// instruction data may reach [heur: …]: c (points to it), d (value)`;
* calls receiving a `fmt::Arguments` built in the frame (format!, msg!, panic!): the literal pieces with the
  arguments in place of the `{}`, each argument as what the frame holds at its value pointer (`*src` for 32
  bytes copied from `src`, else `*ptr`) and its formatter function:
  `// fmt "Initializing vault for global config {} with mint {}" {} = *l [fn_7d078], {} = *m [fn_7d078]`
  (with placeholder specs, e.g. `{:?}` or `{0}`: `// fmt pieces [...] (with placeholder specs), arguments: …`).

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
  platform-tools (several toolchain / solana-program / anchor versions);
* behavior (`src/builtins.ts`): an unnamed library function of 5 parameters without calls that, run on 31
  operand pairs (edge cases and pseudo-random u128 values), writes exactly a * b, a / b or a % b (unsigned or
  signed) to its first argument is `__multi3` / `__udivti3` / `__umodti3` / `__divti3` / `__modti3` (`[heur]`).

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
variables, and SBF stack-passed arguments become parameters (the library option `exactMemory` turns
both off, for executions that corrupt their own stack frame through wild pointers).

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
node --stack-size=65500 test/equiv.ts samples/token22.so 3                # the output as the CLI prints it
node --stack-size=65500 test/equiv.ts corpus/<id>.so 3 --idl <idl.json>   # with an Anchor IDL
node --stack-size=65500 test/equiv.ts samples/token22.so 3 --raw          # the plain form (no names/views)
npm test                                           # unit tests, printer/simplifier fuzzer, samples
```

Checked on all bundled samples (memo, token, ata, stake-pool, token-2022, whirlpool, jupiter);
`scripts/equiv-corpus.sh` runs it over a mainnet corpus (`scripts/corpus.ts`).

## Data pipeline (maintainers)

```
node scripts/fetch-samples.ts --rpc <url>            # sample programs from mainnet
node scripts/corpus.ts 400 corpus --rpc <url>         # mainnet corpus + on-chain Anchor IDLs
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
| `src/anchorstate.ts` | in-memory layouts of deserialized accounts (`Box<Account<T>>`), from runs of the deserializer |
| `src/analysis/facts.ts` | per-function facts for security/: checks (guarded early exits), CPIs, PDAs, account writes, calls |
| `src/analysis/report.ts` | per-instruction analysis (privileges, constraints, operations, ranking) and the security/ files |
| `src/analysis/flow.ts` | IR-level analysis: CFG dominators, Anchor exit writes, native dispatch split and accounts, function pointers |
| `src/analysis/phase2.ts` | dominance across calls, trust, parameter sources, relations, authority graph, rule engine |
| `src/taint.ts` | instruction-data taint (hints on CPI fields, PDA seeds, parameters) |
| `src/stack.ts`, `src/stackargs.ts` | stack slot promotion (escape analysis), stack-passed arguments |
| `src/structure.ts` | structuring (stackifier: correct by construction; irreducible CFGs made reducible by node splitting, state machine only past a size budget) |
| `src/stmtidioms.ts` | statement idioms on the structured body (rc_inc / rc_dec / rc_release) |
| `src/cpi.ts` | CPI and format-string descriptions (comments) |
| `src/exec.ts`, `src/cpiexec.ts` | concrete runs with every call followed and input taint (analysis only); CPIs described from them |
| `src/compact.ts` | store/copy run compaction |
| `src/print.ts`, `src/layout.ts` | TypeScript printer, output layout |
| `src/semantics.ts`, `src/library.ts`, `src/fingerprint.ts` | Solana knowledge, library recognition |
| `src/builtins.ts` | u128 compiler builtins named by behavior (library stubs) |
