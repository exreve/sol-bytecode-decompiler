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

Phase 3 (bounded, best-effort):
- Path conditions to reach each sensitive operation (with a per-operation budget); which checks are
  not required on some path.
- Backward authorization chains from operations to signers.
- Arithmetic: checked vs unchecked ops on caller-controlled values, dominating bounds, widening.
- State machine: status/enum fields, which instructions set them, which instructions check them.
- Per-operation property checklist ("proof tree") with found/not_found for each expected property.
