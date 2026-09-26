# Internals: how names, views and annotations are recovered

Reference for what the decompiled output contains beyond the plain code, and how each piece is inferred.
User-facing overview: [../README.md](../README.md). Everything here is derived: names, view types and comments carry
their provenance (`[idl]`, `[str]`, `[known]`, `[heur]`), and the printed code stays exact whatever they claim.

## Typed views

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

**Stack objects** (`[heur]`, the frame declaration line ends with `// named [heur: …]`). A frame object is
named after its role, and typed when its layout is fixed by that role, when the role is consistent:

* the objects of a CPI / PDA / fmt site read back from the frame (`src/cpi.ts` `siteObjects`): the instruction
  `ix: SolInstruction` (C ABI) / `ix: StableInstruction` (Rust ABI), its account metas `metas: SolAccountMeta` /
  `AccountMeta` (arrays: `metas[1].is_writable`), its data `ix_data`, signer seed lists `signers: SeedList` and
  `seeds: Slice`, a PDA's seed list, result `pda` and `bump`, a `fmt: FmtArguments` and its `fmt_args: FmtArg`;
  not when the object's address is passed to other calls too, nor (typed) when an access to it does not hit a
  field of the view exactly (a slot reused for other data);
* objects whose address is only ever the first argument (the out parameter, or `&mut self`) of calls whose
  role is known, and that the function never writes itself: u128 builtins (`prod`, `quot`, `rem: U128`:
  `prod.lo`, `prod.hi`), Anchor error constructors (`err`), `AccountInfo::clone` (`info: AccountInfo`),
  `try_borrow_data` (`data_ref`), sysvar getters (`rent`, `clock`), `try_accounts` (`accts`), RawVec growth
  (`vec`), and user functions whose out parameter holds an enum with a clear tag (`res: Tagged64`, below);
  otherwise the one call of a library function (or of a user function only writing through its first parameter)
  the object is passed to: `res: Result64`, its 8-byte words `res.tag`, `res.val`, `res.val2`, `res.val3` (every
  access one of these words; a slot receiving several results: frame regions, below);
* objects whose address is only ever an operand of 32-byte comparisons (`memcmp(…, 0x20)`, `memeq`, `keyeq`) and
  that are only accessed within their 32 bytes: `key` (a public key: `memcmp(key_2, key, 0x20)`).

```ts
	const prod: U128 = fp - 0x40
	__multi3(prod, d + e - 1 & -d, 0, g, 0)
	if (prod.hi != 0) { … }
	const ix: SolInstruction = fp - 0x60, metas: SolAccountMeta = fp - 0x90
	ix.account_len = 2
```

**Out parameters.** A user function whose first parameter is only written through (stores and copies at
constant offsets, or passed on as another call's first argument; never loaded, never reassigned) names it
`ret`: the caller's object the result is written to (Rust's return slot for values larger than 8 bytes).
When every store at `ret + 0` is a constant of one size (no copy writes it; passing `ret` on goes to a function
with the same tag), that word is an enum's variant tag: `ret: Tagged64` (`ret.tag = 2`), and the caller's
object `res: Tagged64` (`if (res.tag == 0) { … }`; the payload stays `ld64(res + 8)`).

**Outlined tails** (`src/outline.ts`). Statement runs that end a function (a `return` on every path) and recur
in several places, identical up to the variables and stack objects they use, are printed once as a helper and
replaced by a call: variables the run reads that also occur elsewhere in the function are parameters (passed their
value), variables occurring only in the run are the helper's locals, stack objects are parameters holding their
address (accesses relative to it); constants stay in the body. Only runs without calls or loops that store into
the out parameter or the frame are outlined (everything the analysis reads from the text stays in place), and only
when it shortens the output (2+ places, 3+ lines):

```ts
		r = Error_with_account_name(err_8, k, g, "whirlpools_config", 0x11)
		return ret_tail_1(ret, err_8, r)
// outlined: 430 places
function ret_tail_1(ret: u64, a: u64, b: u64): u64 {
	copyr(ret + 8, a, 0x10)
	st64(ret, 0)
	return b
}
```

`test/evaluate.ts` runs a call of a function defined in the output that is not a program function in place.

## Recovered names and their provenance

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

**Frame regions** (`[heur]`, `src/frameregions.ts`): a stack object is named (and typed) after what its bytes
hold, per stretch of statements. A region starts where a call writes a result of a known layout through its first
argument — the handler's call of try_accounts (`accounts_res: <Ix>Accounts`; the view built from try_accounts'
stores even when no Context is passed on, after the `Result` tag word when no field is at offset 0), an account
try_accounts takes (`<account>_res`, typed by its in-memory view), or, where one slot receives several results,
any callee with an out parameter (`res`, `<callee>_res`, `err`, `Tagged…`) — and where such an object's bytes
are copied elsewhere in the frame (memcpy / copy / 8-byte words stored at one constant distance, at least half
of the object; a copy of an embedded view field starts a region of that view): `ctx_accounts`, `<account>_acc`.
It ends at the next result written to the slot, a write of other data over the slot's start, a syscall given
its address, and at joins whose sides disagree (loops: at their head). The name is a `const` declared as the
object's address (`const accounts_res: SetFeeRateAccounts = fp - 0x308, ctx_accounts: SetFeeRateAccounts =
fp - 0x610`; a slot reused for several results gets one alias per result, all the same address); accesses print
as fields when every access to the region fits its view (else untyped, `name + 0x10`), addresses inside a field
relative to the object:

```ts
k = accounts_set_fee_rate(accounts_res, undef, s620, undef, fp)
const f = accounts_res.whirlpools_config.info
memcpy(ctx_accounts + 0x18, accounts_res + 0x18, 0x2f0)
st64(ctx_accounts, f, h, g)
…
ctx_accounts.whirlpool.fee_rate = fee_rate
```

**Program errors** (`[heur]`): a function storing 6000 + its second parameter (Anchor's `#[error_code]` enum as an
`anchor_lang::error::Error`) is `program_error_from`; its constant argument shows the code, and the IDL error
name when given: `program_error_from(err, 0x1c /* error::FeeRateMaxExceeded = 6028 */)`.

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

## Annotations (comments only)

* account fields through recognized account pointers that are not a variable (e.g. a loaded pointer)
  name the field in a comment: `ld8(ld64(s30) + 0x28 /* is_signer */)` (through variables: typed views, above);
* `Result<_, ProgramError>` niche values: `0x8000000000000007 /* Err(ProgramError::MissingRequiredSignature) */`,
  the `Ok` value being inferred per program (it depends on the solana-program version);
* public keys: known program ids, 32-byte rodata keys compared/copied by address (`/* key <base58> */`),
  keys written as four constant words; Anchor error codes, discriminators, `ProgramError` return codes;
* constant stores through one pointer whose bytes form a text of 4+ printable characters (an account name put in
  a fresh String, a seed built in the frame): `st64(p + 8, 0x6f6363615f6e656b) // "owner_token_account"` on the
  last store of the run;
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

