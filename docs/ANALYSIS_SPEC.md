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
  key / field relations, address checks (a key vs a constant) and PDA checks (a key vs bytes a PDA derivation wrote);
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
  data the logic borrows itself (AccountInfo::try_borrow_data; not Sysvar<T> / from_account_info / get()), with no
  address check on it;
- `pda-bump-from-ix` (medium): create_program_address whose last seed (one byte, the bump) is loaded straight from
  instruction data (not through a call's results, e.g. a deserialized stored bump);
- `duplicate-mutable-accounts` (medium with a += / -= write, else low; Anchor): try_accounts deserializes one account
  type (the try call checking a discriminator) for several accounts, all writable, the instruction writes data of that
  type, and no check compares two account keys;
- `account-type-unchecked` (medium; Anchor): the logic borrows an account's data itself, its owner is checked (a
  constraint, or a check comparing its owner) but no discriminator check is found (type confusion; an owner not
  checked at all is `unverified-account-data`'s); not an AccountLoader load (a discriminator check after the borrow);
- `cpi-unchecked-program`: high when the CPI is PDA-signed;
- `cpi-result-ignored` (medium): a CPI through a function returning its Result in an out object (invoke, the Anchor
  helpers, a wrapper) that no statement after the call reads (not the syscall itself: a failed CPI aborts);
- `truncating-cast` (medium from instruction data, else low): a value-path amount (lamports stored, a CPI helper's
  amount) with an `ext` narrowing a wider value from instruction data / account data / lamports;
- `remaining-account-unchecked` (medium; Anchor): ctx.remaining_accounts[i] (the accounts slice after try_accounts)
  credited (+=) or passed as a CPI destination / authority with no check reading its key, owner or data;
- `init-if-needed-reinit` (medium; Anchor): an authority field written on an account the instruction may create or
  find initialized (a create CPI, and the owner check of the existing account's path), with no condition on the way
  reading the account's state.
Corpus noise (400 programs, programs with >= 1 finding): see bench/README.md.

Known gaps: native programs dispatching through processors taking accounts via iterators / calls leave accounts in
temporaries; Anchor accounts missing from the inferred Accounts layout stay unnamed in CPI contexts and as sources (an
account object's neighbouring words are only a guess for the writes); Anchor `init` of token accounts / mints: the
anchor_spl helper (initialize_account3 / initialize_mint2) compiled into an unnamed library function is not decoded,
so its CPI and the relations it establishes (vault~mint, vault~authority) are missing; a seed list in read-only memory
that needs relocation is not read (a_audit deposit's vault PDA); values a library function not decompiled fills
(n_token's dest via TokenAccount::unpack: the config~dest relation) are not followed back to the account; value
identity follows one call path per function (the first found) and treats memory as unchanged between two reads; the
audit rules are Anchor-first (native programs: bumps, CPI results, casts only).
