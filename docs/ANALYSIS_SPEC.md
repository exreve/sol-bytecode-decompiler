# Program analysis spec (security/ output)

Goal: alongside the decompiled code, emit a structured, deterministic description of what each
instruction does and which checks guard it, so reviewers (humans and AI models) know where to look
without reading the whole program. Produced in the same run as the decompilation, from the same IR.

Principles
- The decompiled TypeScript stays the verified source of truth; its output must stay byte-identical.
  The analysis is derived and over-approximate, and says so.
- Status values: `found` (check found and it dominates the operation on every path), `partial`
  (found on some paths), `not_found` (no check found — not a proof of absence), `runtime`
  (enforced by the Solana runtime, e.g. only the owner can write account data, CPI privilege rules).
- Every fact links back to code: pc, function name, `bundle/<ix>.ts` line.
- No new CLI flags or modes: project output (`-o dir/`) always writes `security/`; single-file output
  gets a short summary comment block. `slices/` is replaced by `security/`.

Outputs
- `security/analysis.json` — all facts and graphs, stable documented schema (for tool calls / grep).
- `security/summary.md` — short, ranked overview; read first. `index.ts` points to it.
- `security/<ix>.md` — per-instruction detail.

## Foundation (phase 1)
1. Canonical account identity per instruction: `Ix.account[i]` / IDL name, followed through calls,
   the Anchor Accounts/Context structs, remaining_accounts, copies.
2. Symbolic values across calls: `account[3].key`, `ix.<arg>`, `<Account>.<field>`, constants
   (known program ids), sysvars, CPI return data.
3. Facts per instruction: checks (predicate + the abort it guards), operations (CPI with decoded
   program/instruction/accounts, lamport moves, account data writes by field, close, realloc,
   authority-field writes), PDAs (symbolic seeds + bump, where used as signer).
4. Runtime model of what Solana enforces itself.

## Views
Phase 1 (reports over facts):
- Instruction surface tree: each instruction with its effects (WRITE state/field, CREATE PDA,
  CPI → program.instruction, TOKEN IN/OUT, LAMPORT OUT, CLOSE, SET authority), ranked by sensitivity
  (value movement, PDA signing, external CPI, authority change, account close).
- Account privilege matrix per instruction: signer / writable / executable / expected owner, and a
  second column: is it verified by the program (found/partial/not_found/runtime).
- PDA list: seeds, bump source, which instructions derive/sign with it, what it controls, and whether
  a provided account is compared with the derived address.
- CPI graph: per instruction the callee (constant program id vs account-supplied, and whether its key is
  checked), instruction name, privileges passed (signer/writable, PDA signers added by invoke_signed).
- Sensitive operations list: TOKEN_TRANSFER, LAMPORT_TRANSFER, ACCOUNT_CLOSE, ACCOUNT_REALLOC,
  ACCOUNT_DATA_WRITE, AUTHORITY_WRITE, MINT, BURN, CPI, PDA_SIGNATURE, PROGRAM_UPGRADE — with source,
  destination, amount, signing authority, reachability.
- State-write map: per account type and field, which instructions write it (and how: =, +=, -=).
- Read/write dependencies: field read by instruction X's checks, written by instruction Y.
- Constraint matrix per account: writable, owner, PDA derivation, discriminator, initialized, key/field
  equalities — each with a status.

Phase 2:
- Trust classification of values: caller-controlled (instruction data, account keys, account data not
  owned by this program, remaining accounts), trusted after validation (with the validating checks),
  never validated.
- Data-flow (taint) paths from caller-controlled sources to operation parameters: amounts, destinations,
  CPI program ids, PDA seeds, authority assignments, owner assignments, realloc sizes.
- Cross-account relations: key/field equalities between accounts (e.g. `signer.key == state.authority`,
  `state.mint == token_account.mint`), found / not_found.
- Dominance: does a check dominate the operation across calls; list paths that reach it without the check.
- Authority graph: who (signer / stored authority field / PDA) enables each asset movement and each
  authority change, and which instructions write those authority fields.
- Rule engine: declarative rules over the facts, e.g.
  - CPI to account-supplied program id with no dominating equality against a known id;
  - value-moving operation or authority write with a signer but no relation between the signer key and
    a stored authority field;
  - token destination whose mint is not related to the source/state mint.
  Each result: rule id, instruction, accounts, path, evidence, confidence.

Status (implemented, src/analysis/phase2.ts, flow.ts): dominance on the IR's CFGs (a check takes effect at
its deciding block and, when on every path of its function, at the call sites up the call path; statuses
found/partial come from it); trust of account keys / data / instruction args; parameter sources on the IR
(src/analysis/sources.ts: a backward walk from the parameter's expression through reaching definitions, frame
slots, call-site arguments up the call path, what a call leaves in an object it is passed (its arguments) and
pointers (the base a value is loaded through, not the offsets added to it), down to instruction data (native: the
pointer the dispatch tag is read from; Anchor: the handler's ix_args, `ix.<arg>` by the printed load), account
keys / data / lamports / owners (native: the account model; Anchor: the Accounts struct's AccountInfo words and the
objects serialized back), remaining accounts, sysvars and CPI return data by the syscalls producing them; the
printed text only for parameters without an expression (seeds)); relations from equality checks and Anchor
has_one; authority graph; rules `cpi-unchecked-program`, `value-move-no-signer`,
`signer-not-related-to-authority` (also, Anchor: a stored authority field another instruction writes, named like a
signer of this one (the has_one convention), not compared with it here, before an operation other than a CPI that
signer signs), `check-bypassable`, `token-mint-unrelated`,
`caller-controlled-sensitive-param`, `unverified-account-data`. Phase-1 gaps closed alongside: Anchor
fields written back on exit, native instruction split on the tag dispatch (with account[i] resolution),
function pointers / tables / vtables, Anchor checks naming the account with a heap-built string.

Phase 3 (bounded, best-effort):
- Path conditions to reach each sensitive operation (with a per-operation budget); which checks are
  not required on some path.
- Backward authorization chains from operations to signers.
- Arithmetic: checked vs unchecked ops on caller-controlled values, dominating bounds, widening.
- State machine: status/enum fields, which instructions set them, which instructions check them.
- Per-operation property checklist ("proof tree") with found/not_found for each expected property.

Phase 3 additions (pattern rules over the facts, each with evidence + confidence):
- instruction that writes program state with no signer check and no constraint gating it;
- share-price math where supply can be zero or donated (division by a supply field / token balance with
  no dominating zero / minimum check);
- mint/burn whose authority comes from account data rather than a signer;
- verbatim CPI forwarder (caller accounts passed through, no signer seeds, account-supplied program id);
- account close without zeroing data/discriminator; close followed by realloc (revival);
- unchecked (wrapping) subtraction on value paths with no dominating bound check;
- recipient/destination with no owner or mint binding.

Status (implemented, src/analysis/phase3.ts on src/analysis/paths.ts; rules in phase2.ts): conditions, operands and
divisors on the IR, names from the printed code, with per-operation budgets (80 conditions, 40 arithmetic sites, 20
divisions per instruction).
- path conditions: the edges of branching blocks that dominate the operation (the edge's target dominates it and is
  entered only from the branch or from inside its own region), up the dominator tree of its function and from the call
  sites up to the handler (labeled-block exits, early returns and loops are plain edges; in a native dispatcher, the
  part of the CFG the instruction's tags reach); plus the relevant checks (signer / owner / key / has_one / pda /
  custom / state) that do not dominate it, with a path when phase 2 found one;
- value identity: a canonical key per expression and position (variables by their reaching definitions, frame slots
  by the store reaching the load, parameters by the argument at the call site up the call path, sums flattened with
  constants folded); a condition guards an operand when one of its comparisons contains the operand's key;
- authorization chains: from the authority rows (phase 2) through the stored field to the instructions writing it
  and their signers;
- arithmetic: `+` / `-` stored on value paths (value-named fields, lamports, 8-byte native fields, CPI amounts):
  `checked` when a comparison on the way (any dominating branch) reads every non-constant operand, or the result and an
  operand (Rust overflow traps, checked_* error returns, bound checks); `bounded` when each subtracted operand is
  compared with another value on every path (an invariant between them, e.g. an amount checked against a token balance
  and then debited from the lamports), or an addition of an amount the instruction subtracts, checked, from another
  balance (a transfer: the total stays within a supply); `saturating` for sat_sub; else `unchecked`;
- divisions (`/`, sdiv, __udivti3) by supply / balance-like values (by name along the divisor's provenance) or a 128-bit
  product divided by a value read from an account's data (native: the account model), with or without a comparison of
  the divisor on the way (a required edge; not the division-by-zero panic the compiler inserts: a side that aborts);
- proof trees for token transfers, mints / burns, lamport moves, closes, authority writes, data writes and CPIs to
  account-supplied programs;
- state machine: fields set to small constants (status-named, or native single bytes that are checked) and fields
  compared with small constants in checks / branch conditions;
- rules `state-write-ungated`, `share-price-zero-supply`, `mint-burn-authority-from-data`, `cpi-forwarder`,
  `close-without-zeroing`, `unchecked-arithmetic`, `recipient-unbound` (native: also a transfer's destination no
  check of the instruction reads at all; not a mint's: the token program requires it to hold the mint).
Fact recovery (src/analysis/flow.ts, facts.ts; measured by bench/, see bench/README.md):
- native accounts by an IR account model: `&[AccountInfo]` slices, input records and arrays of pointers to them
  (pinocchio), the RefCell'd lamports / data of an AccountInfo, frame spills and multiply-assigned variables
  (reaching definitions), values calls leave in out objects (the callee's stores with its parameters bound;
  memcpy as a copy; AccountInfo::try_borrow_(mut_)data / lamports by name): lamport / data writes (+= / -=),
  key / field relations, address checks (a key vs a constant) and PDA checks (a key vs bytes a PDA derivation wrote,
  also word by word: all 4 words of the output compared, the key's account possibly unresolved, e.g. taken from an
  accounts iterator; a PDA is `compared` when such a check is in the deriving function (comparing that derivation's
  output, through copies: the call's pointer arguments) or a caller of it);
  an accounts iterator's cursor a callee advances (a structure holding the cursor's address passed to it, the callee
  storing cursor + 0x30, 2 levels): the next account; a pointer into a caller's frame (an accounts struct of
  AccountInfo copies, an argument object) is read with the caller's words at the call, for out objects and along the
  instruction's call path (pinocchio's record arrays by their own evidence); a callee variable defined differently by
  path: the one account value its definitions give;
  a lamport write is a store into the u64 itself (LamportsCell.value.amount, an input record's lamports), never a
  pointer stored into an AccountInfo (struct copy / clone) nor an Rc box's counts / flag; a DataCell's slice pointer /
  length moved by `Write for &mut [u8]` is neither a data write nor a realloc (the u64 before the data is);
  the dispatch is looked for past functions whose matching splits into no instruction (the entrypoint's error map);
  a condition the structuring rebuilt is located by the branch deciding it (its shape, the sides' first statements);
  in a function the instruction calls, pointer parameters are bound to the caller's values at the call site of this
  instruction's call path (a helper's checks on the AccountInfo it is passed, e.g. `config.owner != program_id`);
  32-byte comparisons of values the function alone does not know as accounts wait for that context; pointers into
  the function's own frame are values too (a struct a helper filled from an account's data, copied around the frame:
  `config.admin == admin.key` through Config returned by a helper);
- Anchor try_accounts when the decompiler names none (the first function the handler calls whose checks name
  accounts) and the Accounts struct's &AccountInfo words its success path stores (one word from the call the check
  right after names; the out object may be spilled to the frame and reloaded; two accounts of one type: the check
  first in the flow after each call; an account whose call leaves several words: its call's first word), with the
  decompiler's layout for the other accounts (analysis only: the printed views keep the decompiler's); a callee's
  writes through a parameter it spills to its frame count for reaching definitions (not only the first 0x80 bytes); a zero-copy account's type by the IDL account type named like it; Anchor `zero` is a discriminator
  check; alignment asserts (a pointer's low bits masked) are not checks; a success return writing the Ok tag before an
  error raised first thing is not the failing side;
- Anchor writes in the functions the handler passes its frame to (Context.accounts: object fields serialized back
  on exit, through the exit wrappers of the Accounts struct), lamports and zero-copy data through the RefCells of the
  &AccountInfo words (traced back to try_accounts' out object and the Accounts layout);
- Anchor key comparisons (has_one, token::mint / token::authority) by the provenance of the compared bytes: the
  account whose try-call produced them (the check right after it names it), data vs key;
- CPIs by library helper (anchor_lang::system_program, anchor_spl::token*: name, CpiContext accounts, signer
  seeds; CpiContext accounts the printed text leaves unnamed: its AccountInfo copies, the program's first, then the
  accounts struct's in field order), instruction builders and TokenInstruction::pack tags before an undecoded invoke
  (native: the builder's arguments give the accounts); a program id the printed text leaves unnamed: the instruction
  struct followed up the call path (read-only memory, constant stores into a caller's frame on straight-line code) to
  a known id, its instruction by the tag (e.g. pinocchio-system); unnamed create / find_program_address by their
  syscall (analysis only);
- Anchor stores in a function several handlers call (e.g. a close helper) named with one handler's accounts count
  only for that handler's instruction.
Reaching definitions (flow.ts defsOf): the definition of a variable / frame slot reaching a position is the meet over
the paths to it, solved once per key as a fixpoint over the blocks the position depends on (optimistic start, loops
included), so an answer does not depend on the queries asked before; evaluator memos keep only values whose evaluation
hit no depth limit, callWrites is memoized per depth, seeded account resolvers by their seed.

Audit pattern rules (src/analysis/audit.ts facts, rules in phase2.ts; bench/programs/a_audit seeds one bug per rule):
- `sysvar-account-unchecked` (medium): an account named like a sysvar (clock, rent, instructions, slot_hashes, …) whose
  data the logic borrows itself (AccountInfo::try_borrow_data, by name or behavior; not Sysvar<T> / from_account_info /
  get()), with no address check on it; and by behavior, whatever the name (native too): an account's data parsed with
  the Instructions sysvar's layout (a u16 read from its last 2 bytes: load_current_index; a u16 at 2 + 2 * index after
  the count at 0: load_instruction_at), no key check on the account, no comparison with the sysvar id in the
  instruction (informational when the account is not identified);
- `pda-bump-from-ix` (medium): create_program_address whose last seed (one byte, the bump) is loaded straight from
  instruction data (not through a call's results, e.g. a deserialized stored bump);
- `duplicate-mutable-accounts` (medium with a += / -= write, else low; Anchor): try_accounts deserializes one account
  type (the try call checking a discriminator) for several accounts, all writable, the instruction writes data of that
  type, and no check compares two account keys; native (medium): two program-owned accounts written at the same data
  offset (a debit and a credit) with no key equality between them;
- `account-type-unchecked` (medium; Anchor): the logic borrows an account's data itself, its owner is checked (a
  constraint, or a check comparing its owner) but no discriminator check is found (type confusion; an owner not
  checked at all is `unverified-account-data`'s); not an AccountLoader load (a discriminator check after the borrow);
- `cpi-unchecked-program`: only a program id traced to an account's key (the IR sources; a hand-built Instruction's
  program_id passed to invoke), with no key / address / PDA / stored-key check of that account dominating the CPI, no
  comparison with a known id (the call site, a token builder function); one finding per program account and
  instruction; high when the CPI is PDA-signed;
- `cpi-result-ignored` (medium): a CPI through a function returning its Result in an out object (invoke, the Anchor
  helpers, a wrapper) that no statement after the call reads (not the syscall itself: a failed CPI aborts);
- `truncating-cast` (medium from instruction data, else low): a value-path amount (lamports stored, a CPI helper's
  amount) with an `ext` narrowing a wider value from instruction data / account data / lamports;
- `remaining-account-unchecked` (medium; Anchor): ctx.remaining_accounts[i] (the accounts slice after try_accounts)
  credited (+=) or passed as a CPI destination / authority with no check reading its key, owner or data;
- `init-if-needed-reinit` (medium; Anchor): an authority field written on an account the instruction may create or
  find initialized (a create CPI, and the owner check of the existing account's path), with no condition on the way
  reading the account's state;
- `reinit-unchecked` (medium): an account type's discriminator (an IDL account type's, or a printed `account:T`
  constant) written at offset 0 of an account's data, directly or as the start of a buffer copied there (bytes / memcpy),
  by an instruction that does not create the account (no ACCOUNT_CREATE, system or undecoded CPI), compares nothing
  with that discriminator (an Account<T> load: its exit serialization) and has no condition on the way reading the
  account's data (dominating branches, try_accounts' branches: discriminator == 0 / `zero`, an is_initialized flag) nor a
  discriminator / zero / state check on it (candy machine v2 initialize_candy_machine: vuln fires, fixed does not); native
  (info): an authority field written into an account not created there with no condition on the way reading its data.
Anchor before &AccountInfo fields (≈ 0.1x, e.g. candy machine v2: errors name no account, the program has no "AnchorError"
string): try_accounts is the call the handler passes its accounts slice to; its consumptions of the slice (calls taking
it, loads of its pointer, the pointer stored back past a loaded one, the slice spilled to the frame) give the IDL's
accounts in order (flow.ts sliceEvents); the Accounts struct holds AccountInfos by value (the words its success block
copies from a consumption's out object or from a clone of a loaded &AccountInfo: TryInfo.words), a loaded &AccountInfo
names its variable (TryInfo.ptrs, also for later Anchor: evaluation roots in try_accounts, `ptr + 0x30·k` the k-th next
account).
Token init helpers (src/analysis/libcpi.ts): a library function the database does not name, reaching sol_invoke_signed
(3 calls deep) through a builder that compares a program id with the SPL Token (2022) id and stores tag 18 / 20 into its
frame, is anchor_spl's initialize_account3 / initialize_mint2 (`init` of a token account / mint): its CPI op with the
CpiContext's accounts by their key words (the program's slot recognized by name, else by position) and InitializeMint2's
authority argument; the relations they establish (account.mint / account.owner / mint.mint_authority) are `token` relations.
Constant seed lists at PDA sites the printed text leaves unknown are read from read-only memory (relocated pointers).
Incident-class rules (src/analysis/incidents.ts, after the rule engine; bench/gen/risk.ts seeds one property per variant):
on the IR of the instruction's reachable functions (the blocks its dispatch allows), each rule failing on an unexpected
shape reports nothing.
- `introspection-unchecked` (high: key; medium: program id / index): the Instructions sysvar parsed, recognized by its
  layout: the executing index (a u16 at data + len - 2: load_current_index and the checked helpers) and the offset table
  (a u16 at data + 2 + 2·i next to the count read at data + 0: load_instruction_at); its account by the sources of the
  data pointer, else the account compared with the sysvar id, a try_borrow_data of the parsing function, an account named
  like the sysvar (the current-index read: neither term scaled nor a frame address). Reported when no comparison with
  Sysvar1nstructions… (one of its words, a 32-byte compare with the id, an address constraint, a library function holding
  the id in its bytecode: check_id of the *_checked helpers) is in the instruction; when an instruction is loaded before a value move and no 32-byte comparison
  of the loaded bytes (by their sources; Anchor: the comparisons of the parsing functions and their callees) with a
  constant / a non-account value (its program id) is found; when the table's index comes from instruction data and the
  executing index is not read;
- `flash-repay-unbound` (medium): the same parse before a value move of the program's funds (a PDA-signed one first; not a
  system transfer, a fee the caller pays), no comparison of the loaded bytes with an account key or an instruction
  argument (the repay instruction's reserve / amount);
- `stale-after-cpi` (medium): a branch after a token CPI (transfer / mint / burn; at each level of the call path up to the handler) reads a value taken
  before the call from the data of an account the CPI may write (its writable metas; not resolved: an account the
  program does not write itself (its own accounts only it can change), IDL-writable for Anchor): native, a variable
  defined before the call (also a value a helper left in its out object, e.g. a token amount); Anchor, an 8-byte word of
  the account's deserialized copy in the Accounts struct (try_accounts' layout; the base printed as the struct), a direct
  operand of the comparison, not an AccountInfo / key / mint / owner field, with no call between the CPI and the read
  taking that copy (reload()); an account another instruction writes by name is the program's own (a CPI cannot change it). Not when the branch also reads the account afresh (a balance delta);
- `token2022-amount-assumed` (medium): an inbound token transfer (the program does not sign it: no seeds, a seeds slice
  of length 0 on the call path; Anchor helpers with undecoded seeds: no PDA derived in the instruction) through a program
  that may be Token-2022 (a CPI to it, a comparison with its id: the either-or check, a check naming it), and a `+=`
  state write whose value comes from instruction data with no account balance contributing (not the destination's
  balance read after the transfer). Not when a length is compared for equality with 82 / 165 (extensions rejected);
- `oracle-unvalidated` (medium; low when only the confidence is missing): a Pyth price account (aggregate price @208
  read through a pointer whose magic 0xa1b2c3d4 is compared, or whose expo @20 and price type @16 are read, in a program
  comparing the magic somewhere; the 2021 SPL token-lending layout keeps the aggregate at the same offsets) with no read
  of its aggregate status (@224), no read of its publish time / slot (timestamp @96, valid slot @40, last slot @32,
  aggregate pub slot @232), or, when the price gates a value move of the instruction, of its confidence (@216). Field
  reads, not their comparisons: a field read and ignored counts as checked. Switchboard not recognized;
- `signer-to-untrusted-program` (high when PDA-signed, medium when the program account is known only by its name; info when
  only a signer of the instruction is forwarded: the caller's own signature to a program it picks): a CPI whose program id is an account key (sources; Anchor: the Accounts struct word evaluated, else
  the one account named like a program other than token / system / sysvar ones) that no check pins (address / key / PDA / has_one
  constraint, a check naming it, a 32-byte comparison with a constant / stored bytes; Anchor: an address constraint no
  account was attributed to, InvalidProgramId / AccountNotProgram), a CPI the facts say is compared with a known id, signed with the program's seeds or with a signer meta of an instruction signer. The
  invoke / invoke_signed calls the facts did not decode (nested in an expression) are read directly: the Instruction's
  program id @0x30, the seeds' length (the stack argument). A CPI cpi-unchecked-program already reports in the same
  instruction at the same site is merged into that finding (escalated to high when PDA-signed, the evidence appended);
  an undecoded one in an instruction cpi-unchecked-program already reports is dropped;
- `rounding-favors-user` (low, experimental): share conversions (a product divided by a non-constant: `udiv`, or
  __udivti3 of a __multi3 result) rounded up ((n + d - 1) / d, the divisor's key in the sum with -1) and credited (+=) next
  to another credit of the instruction (not a debt / fee field), or rounded down and debited (-=) from a share-like field
  (named so; native: another debit pairs it and the outflow's amount is the caller's argument) when the quotient is not
  itself paid out (a lamport debit or a transfer amount).
Fund movers (informational, analysis.json `fund_movers: [{ instruction, authority, kind, from?, at }]`, summary.md "Who
can move funds", <= 8 lines): per instruction, the first operation moving program-controlled funds (a token transfer /
burn the program signs for: seeds, or a PDA the instruction derives when an Anchor helper's seeds are not decoded; a
lamport debit) and the authority gating it: the signers of its authority row (else the instruction's signer checks),
each with the stored field it is compared with (`admin (signer; == reserve.admin)`) or `constant key`, else
`none (no signer check found)`.
Precision guards (eval/ blind review):
- AccountInfo field order: solana_program before AccountInfo became #[repr(C)] (≈ 1.9, e.g. Solend, Anchor ≤ 0.2x
  builds) laid it out { rent_epoch, key, lamports, data, owner, flags }; told by the entrypoint's deserializer (the
  record's key address stored at +8 of the AccountInfo it builds; accounts.ts legacyAccountInfo) and used by the
  printed views (AccountInfo view, field names), the native account model and the Anchor account words;
- a variable is an `&[AccountInfo]` slice only with AccountInfo evidence (a flag byte read, a key / owner pointer
  compared as 32 bytes or read word-wise, a data Rc's pointer / length read) and no load no field explains (other
  sizes / offsets, a pointer word dereferenced past its target: 32 key bytes, an Rc box); flags are 1-byte reads, a
  key / owner / lamports pointer is read within its bytes: an Rc / RefCell counter (+8 weak, +0x10 borrow flag) is
  never an owner assignment, a WAD / u64 field never a signer flag;
- vipers `assert_keys_eq!` (the failing side logs "self.a != self.b.c" first thing): a key relation between the IDL
  accounts the paths name (nested Accounts structs by the IDL's flattened paths), or an address check against a
  named constant; code (snake_case) names are merged with the IDL's camelCase ones;
- stored keys (`## Stored keys`, analysis.json `stored_keys`): per account whose data is used (type checked, or a
  stored field compared) the key equalities with provided accounts, the accounts binding it (its key compared with
  their fields), its stored Pubkey fields (IDL type) never compared or written, and GAP lines (such a field named
  like an instruction account bound by nothing else); no rule (too imprecise on the corpus: Anchor constraints the
  analysis does not match to fields);
- validation consistency (src/analysis/consistency.ts; analysis.json `validation_consistency`, summary.md / <ix>.md
  `## Validation consistency`): accounts grouped by role across instructions (the IDL account type, else the data length
  a native unpack checks (`data_len 0x23b`), else the account's name; not programs / sysvars; not in instructions creating
  or initializing it); per instruction the validations it applies: owner, type (discriminator / length), signer,
  writable, address / PDA, and stored-key relations labelled by the counterpart's role (`lending_market == LendingMarket.key`,
  native `stored key == (owner-checked account).key`, `key == Obligation.reserve`). An inconsistency: a validation >= 2
  and >= 2/3 of the other instructions of the role apply (for a relation: of those that have an account of the
  counterpart's role), missing in an instruction that uses the account (data unpacked / read by an operation / updated,
  stored keys compared, data checked). Signer, address / PDA and writable are shown, not reported (mostly by design: a
  party that does not sign there, an account bound by has_one instead of its seeds); nor owner / type in an Anchor program
  (Account<T> / AccountLoader<T> check them: a missing one is mostly the analysis'); nor a relation where the counterpart
  is created. No rule: informational (corpus noise and spot-check precision in bench/README.md);
- stored keys in summary.md (`## Stored keys not compared`, at most 5 lines): program accounts (type checked) of an
  instruction moving value / changing an authority that no stored field of binds, bound only through another program
  account's field (not a token account's mint / owner) and not pinned by their own key (PDA / address / key / has_one)
  (cashio print_cash: bank only through collateral.bank; at most 2), then GAP lines of such instructions;
- statuses: `partial` is rendered "found on some paths": the check is complete (e.g. all 32 bytes of a key compared) but
  does not dominate every operation; the last node of a list falling into an enclosing check's failing side (the next
  word of a key compared word by word) keeps its then side on every non-failing path (facts.ts `contFail`);
- check-bypassable (informational): only checks shaped like a binding (the flag read / keys compared / the
  constraint's error; not a distinctness check failing when two keys are equal) on some path to the operation (the
  check reaches it); the evidence says whether the path avoids every check of that kind (on that account) too;
- confidence `info`: kept in analysis.json, left out of the Findings lists (counted on one line). recipient-unbound is
  a finding when the instruction has no signer check or the destination is named after a party that does not sign
  (maker_ata_b, the taker signing), else info.

Corpus noise (400 programs, programs with >= 1 finding): see bench/README.md.

Known gaps: native programs dispatching through processors taking accounts via iterators / calls leave accounts in
temporaries; Anchor accounts missing from the inferred Accounts layout stay unnamed in CPI contexts and as sources (an
account object's neighbouring words are only a guess for the writes); in try_accounts an account deserialized by its
own try call (Account<Mint>, Program<T>) is not named inside init helpers' CpiContexts (vault~mint of a token account
`init`), nor a mint authority reached through the bumps / PDA structs (a_mint config~mint); values a library function not decompiled fills
(n_token's dest via TokenAccount::unpack: the config~dest relation) are not followed back to the account; value
identity follows one call path per function (the first found) and treats memory as unchanged between two reads; the
audit rules are Anchor-first (native programs: bumps, CPI results, casts only).
