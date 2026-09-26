// Program analysis (docs/ANALYSIS_SPEC.md): per-instruction facts aggregated from the per-function facts
// (facts.ts) over the call graph, IR-level facts (flow.ts), the phase 2 views (phase2.ts), and the reports
// written to security/.
//
// DERIVED and OVER-APPROXIMATE: the decompiled code is the verified source of truth; everything here is
// read off it by structural heuristics and may be incomplete or wrong. Statuses:
//   found      a check dominates every sensitive operation of the instruction (real dominators, across
//              calls: see phase2.ts dominance); in an instruction without one, it is on every path that
//              does not exit early (not nested under other branching, in its function nor at the calls)
//   partial    a check was found, but it dominates only some operations (or is only on some paths)
//   not_found  no check was found (not a proof of absence: it may be made in a way not recognized)
//   runtime    enforced by the Solana runtime (a written account must be writable and owned by the
//              program; a CPI's signer / writable privileges cannot exceed the caller's; the invoked
//              program must be executable)
//
// Model (phase 1): an instruction is its handler and the functions it reaches through direct calls (library
// code included, which calls back into user code). An Anchor handler is generated code whose branches only
// handle errors: its calls count as made on every successful path. Anchor try-call checks (`<T as
// Accounts>::try_accounts` results) get the checks of the callee (its Anchor error codes, the account types
// of the library functions it uses: Signer, Account, Program, …). Accounts are named by the IDL, the
// program's account-error strings, and the names the code gives them (a temporary is shown as `name?`).
// Also (flow.ts): Anchor account fields stored before the exit serialization; functions reached through
// function pointers / tables / vtables (conditional; a fast path picked by discriminator); native programs
// split per instruction on the tag dispatch (kind 'native', `dispatch` says how), accounts in temporaries
// resolved to account[i] (input record array, &[AccountInfo] slice) and named by a well-known layout.
//
// security/analysis.json schema ("schema": "sbpf-decompiler/security@1"):
//   program      { version, instructions (sBPF), functions, anchor, idl }
//   instructions [ {
//     name, handler (function), kind ('anchor' | 'native' | 'processor' | 'entrypoint'), dispatch?, score, effects: [string],
//     functions: [function names reachable from the handler], indirect?: [functions reached through pointers (why)],
//     accounts: [ { index?, name, source ('idl' | 'str' | 'code' | 'known'), expected: { signer?, writable?, pda?, address?, optional? },
//                   constraints: { <kind>: { status, at?, via?, note? } } } ],
//     checks:   [ { id, at, status ('found' | 'partial'), account?, kinds: [string], cond, fails_if (bool: the exit is taken when cond holds),
//                   error, via? } ],
//     operations: [ { at, kinds: [OpKind], text, path ('main' | 'conditional'), target?, how?, value?,
//                     cpi?: { program, known?, program_check, instruction?, accounts: [ { role?, text, w?, s? } ], fields: [[name, value]], seeds? },
//                     pda?: { fn, seeds, program },
//                     guarded_by?: [check id] (dominating checks), bypass?: [ { check, path: [at] } ] (a path reaching it without that check),
//                     sources?: [ { param, source (ix data / ix.<arg> / <account>.key / <account>.<field>), trust } ] } ],
//     trust:     [ { value (<account>.key | <account>.data | ix.<arg>), trust ('caller-controlled' | 'validated' | 'partially-validated' | 'runtime'), evidence } ],
//     relations: [ { a, b, kind ('key_eq' | 'field_eq' | 'has_one' | 'address' | 'compare' | 'token': a token account's mint / owner), status, at } ],
//     authority: [ { operation (index), kind, enabled_by: [ { kind ('signer' | 'stored' | 'pda' | 'none'), what, status?, writtenBy? } ] } ],
//     path_conditions: [ { operation (index), conditions: [ { at, cond, holds (false: the path needs it not to hold), how ('branch' | 'exit-check' | 'loop'), check? (id) } ],
//                          not_required: [ { check, path? } ] (relevant checks some path to it does not make), truncated? } ]            (phase3.ts)
//     auth_chains: [ { operation, chains: [ [ { kind ('op' | 'signer' | 'pda' | 'stored' | 'writer' | 'none'), what, status? } ] ] } ]
//     arithmetic: [ { at, operation?, target, expr, kind ('add' | 'sub'), status ('checked' | 'saturating' | 'unchecked'), guard?: { at, cond }, caller_controlled?, unnamed_field? } ]
//     divisions:  [ { at, expr, divisor (with its definitions), status ('checked' | 'not_found'), guard? } ]
//     proof:      [ { operation, kind, properties: [ { prop, status, evidence } ] } ]   (per-operation property checklist)
//   } ]
//   state_machine [ { field (account.field), set_by: [ { ix, value, at } ], checked_by: [ { ix, cond, at } ] } ]: status-like fields
//   findings     [ { rule, instruction, confidence ('high' | 'medium' | 'low'), title, accounts, path, evidence } ] (phase2.ts RULES), ranked
//   authority_fields [ { field, writtenBy: [ix] } ]: stored fields written by an AUTHORITY_WRITE
//   pdas         [ { seeds, program, derived_in: [ix], signs_in: [ix], accounts: [ix.account with a seeds constraint], compared: status } ]
//   state_writes [ { target (account.field), writes: [ { ix, how, at } ] } ]
//   dependencies [ { target, read_by: [ix] (in checks), written_by: [ix] } ]
//   unattributed_operations [ { at, kinds, text, target?, how?, cpi? } ]: in functions no handler reaches
// `at` = { fn, line (1-based, in the function's text), pc? (sBPF instruction index), file?, file_line? (the line in that file) }.
// constraint kinds: signer, writable, owner, discriminator, initialized, pda, address, executable, has_one, key, state,
//   custom (IDL error), raw, rent_exempt, count, token_mint, token_owner, …; op kinds: see facts.ts OpKind.
import type { Result } from '../decompile.ts'
import type { FnFacts, IxHint, Op, OpKind } from './facts.ts'
import { refOf, cpiKinds } from './facts.ts'
import { knownFamilies } from '../cpi.ts'
import { dominance, phase2, type TrustRow, type Relation, type AuthorityRow, type Finding } from './phase2.ts'
import { addExitWrites, indirectTargets, splitDispatch, accountResolver, cfgOf, decisionBlock, defsOf, compareAccounts, callOf, type DispatchGroup, type AcctRef, type AcctResolver, type AcctVal } from './flow.ts'
import type { Expr } from '../ir.ts'
import type { PathInfo, Chain, ArithSite, DivSite, Proof, StateField } from './phase3.ts'

export type Status = 'found' | 'partial' | 'not_found' | 'runtime'
export interface Loc { fn: string; line: number; pc?: number }
export interface Evidence { status: Status; at?: Loc; via?: string; note?: string }
export interface AccountRow {
	index?: number
	name: string
	source: 'idl' | 'str' | 'code' | 'known'
	expected: { signer?: boolean; writable?: boolean; pda?: boolean; address?: string; optional?: boolean }
	constraints: Record<string, Evidence>
}
export interface CheckOut {
	at: Loc; status: 'found' | 'partial'; account?: string; kinds: string[]; cond: string; failsIf: boolean; error: string; via?: string
	sides?: [string, string]              // native: the two account fields an equality compares (by the IR)
	fnPc: number; c?: Expr; passPc?: number; main: boolean // (internal: the dominance analysis, phase2.ts)
}
export interface OpOut {
	at: Loc; kinds: OpKind[]; text: string; main: boolean; target?: string; how?: string; value?: string; cpi?: Op['cpi']; pda?: Op['pda']
	fnPc?: number; ret?: Expr                       // (internal)
	anchorClose?: boolean                           // Anchor's `close` constraint (anchor_lang::common::close in the exit: lamports to the target, assign / realloc)
	guards?: number[]                               // indices of the instruction's checks that dominate it (phase2.ts)
	bypass?: { check: number; path: Loc[] }[]       // relevant checks that do not: a path reaching it without them
	sources?: { param: string; source: string; trust: string }[] // taint: where its parameters come from (phase2.ts)
}
export interface IxOut {
	name: string
	handler: string
	kind: 'anchor' | 'native' | 'processor' | 'entrypoint'
	functions: string[]
	accounts: AccountRow[]
	checks: CheckOut[]
	ops: OpOut[]
	score: number
	effects: string[]
	indirect: string[]   // functions reached through function pointers / tables (and why)
	dispatch?: string    // native: the tag(s) selecting this instruction's part of the handler
	ctx?: IxCtx          // (internal: the dominance analysis)
	trust?: TrustRow[]
	relations?: Relation[]
	authority?: AuthorityRow[]
	paths?: PathInfo[]   // phase 3 (phase3.ts)
	chains?: Chain[]
	arith?: ArithSite[]
	divs?: DivSite[]
	proof?: Proof[]
}
export interface IxCtx { handler: number; parents: Map<number, { fn: number; pc?: number; ret?: Expr }>; allowed?: (fn: number, b: number) => boolean; restricted?: Set<number>; tag?: { fn: number; v: number } }
export interface PdaOut { seeds: string; program: string; derivedIn: string[]; signsIn: string[]; accounts: string[]; compared: Status }
export interface Analysis {
	program: { version: number; instructions: number; functions: number; anchor: boolean; idl: boolean }
	ixs: IxOut[]
	pdas: PdaOut[]
	stateWrites: { target: string; writes: { ix: string; how: string; at: Loc }[] }[]
	deps: { target: string; readBy: string[]; writtenBy: string[] }[]
	unattributed: OpOut[] // operations in functions no instruction handler reaches through direct calls
	findings?: Finding[]  // phase 2 rule engine (phase2.ts)
	authorityFields?: { field: string; writtenBy: string[] }[]
	states?: StateField[] // phase 3 state machine (phase3.ts)
}

/** Sensitivity weights (ranking of the instruction surface). */
const WEIGHT: Partial<Record<OpKind, number>> = {
	TOKEN_TRANSFER: 5, LAMPORT_TRANSFER: 5, MINT: 5, BURN: 3, PROGRAM_UPGRADE: 6, AUTHORITY_WRITE: 4, ACCOUNT_CLOSE: 4, OWNER_ASSIGN: 4,
	PDA_SIGNATURE: 3, LAMPORT_WRITE: 4, ACCOUNT_REALLOC: 2, ACCOUNT_CREATE: 2, ACCOUNT_DATA_WRITE: 1, CPI: 1,
}
const RANK: Record<Status, number> = { found: 3, runtime: 2, partial: 1, not_found: 0 }
const TEMP = /^([a-z]{1,2}|v\d+|s[0-9a-f]+|p\d+|r\d|fp|u\d+|[a-z]{1,2}_\d+)$/

const memo = new WeakMap<Result, Analysis>()

/** The analysis of a decompiled program (computed once per result). */
export function analyze(r: Result): Analysis {
	let a = memo.get(r)
	if (!a) { a = analyze0(r); memo.set(r, a) }
	return a
}

function parseIdlAccount(s: string, i: number): AccountRow {
	const m = /^(\S+)(?: \[(.*)\])?$/.exec(s)!
	const flags = (m[2] ?? '').split(', ')
	const addr = flags.find(f => f.startsWith('= '))
	return {
		index: i, name: m[1].split('.').pop()!, source: 'idl', constraints: {},
		expected: { signer: flags.includes('signer') || undefined, writable: flags.includes('mut') || undefined, pda: flags.includes('pda') || undefined, optional: flags.includes('optional') || undefined, address: addr?.slice(2) },
	}
}

function analyze0(r: Result): Analysis {
	const facts = r.facts, p = r.program
	addExitWrites(r)
	const ind = indirectTargets(r)
	const byPc = new Map(r.funcs.map(f => [f.pc, f]))
	const procNames = new Set(r.processors.map(x => x.fn))
	let roots = r.funcs.filter(f => f.name.startsWith('ix_') || procNames.has(f.name))
	if (!roots.length) roots = r.funcs.filter(f => f.f.isEntry)
	const rootPcs = new Set(roots.map(f => f.pc))
	// native programs: the instructions a processor / the entrypoint dispatches on the tag (flow.ts)
	const splits = new Map<number, DispatchGroup[]>()
	if (!r.anchor) for (const h of roots) if (!h.name.startsWith('ix_')) { const g = splitDispatch(r, h, rootPcs); if (g) splits.set(h.pc, g) }
	const ixs: IxOut[] = []
	for (const h of roots) for (const grp of splits.get(h.pc) ?? [undefined]) {
		const name = grp ? grp.name : h.name.startsWith('ix_') ? h.name.slice(3) : h.name
		const hpc = h.pc
		const info = grp ? undefined : r.instructions.find(i => i.pc === h.pc)
		const keep = (fn: number, pc: number | undefined) => !grp || pc === undefined || grp.keep(fn, pc)
		// (a dispatcher's branches on the tag look like checks to facts.ts: its error-path marks do not apply)
		const isDisp = (fn: number) => !!grp && grp.dispatchers.includes(facts.get(fn)?.name ?? '')
		const keepCall = (fn: number, c: { pc?: number; ret?: Expr }) => {
			if (!grp || c.pc !== undefined) return keep(fn, c.pc)
			const fo = byPc.get(fn), b = fo && c.ret ? cfgOf(fo).retBlock.get(c.ret) : undefined
			return b === undefined || grp.allowed(fn, b)
		}
		// functions reachable through direct calls (not other handlers): main = through main-path calls only
		// (library code is followed too: it calls back into user code, e.g. trait implementations; those
		// calls count as conditional)
		const main = new Map<number, boolean>([[h.pc, true]])
		const lib = new Set<number>()
		const q = [h.pc]
		const parents: IxCtx['parents'] = new Map()
		let from: { fn: number; pc?: number; ret?: Expr } | undefined
		const reach = (callee: number, cm: boolean) => {
			if (rootPcs.has(callee)) return
			if (from && !parents.has(callee) && callee !== h.pc) parents.set(callee, from)
			if (!facts.has(callee)) {
				if (lib.has(callee) || !p.funcs.has(callee)) return
				lib.add(callee)
				for (const b of p.funcs.get(callee)!.blocks) for (const st of b.stmts) if (st.k === 'call' && st.t.k === 'fn') reach(st.t.pc, false)
				return
			}
			const prev = main.get(callee)
			if (prev === undefined || (cm && !prev)) { main.set(callee, cm); q.push(callee) }
		}
		// (an Anchor handler is generated code: argument deserialization, try_accounts, the instruction's
		// function, exit; its branches only handle errors, so its calls outside error paths are made on
		// every successful path)
		const generated = h.name.startsWith('ix_') && r.anchor
		// (functions reached through function pointers / tables: conditional; a fast-path handler the
		// entrypoint picks from a table by this instruction's discriminator)
		const indirect: string[] = []
		const viaPtr = (t: number, why: string) => { if (!main.has(t) && !rootPcs.has(t) && facts.has(t)) { if (facts.get(t)!.ops.length || !why.startsWith('function')) indirect.push(`${facts.get(t)!.name} (${why})`); reach(t, false) } }
		if (info) for (const t of ind.byDisc.get(info.disc) ?? []) viaPtr(t, 'entrypoint table entry chosen by the discriminator')
		while (q.length) {
			const x = q.shift()!
			const m = main.get(x)!
			for (const c of facts.get(x)?.calls ?? []) if ((!c.errPath || isDisp(x)) && keepCall(x, c)) { from = { fn: x, pc: c.pc, ret: c.ret }; reach(c.callee, m && (c.main || (generated && x === h.pc))) }
			from = { fn: x }
			for (const t of ind.targets.get(x) ?? []) viaPtr(t, `function pointer in ${facts.get(x)?.name}`)
		}
		const fns = [...main.keys()].map(pc => facts.get(pc)!).filter(Boolean)
		// the accounts: IDL, else the program's account-error strings, then names met in the code
		const accounts: AccountRow[] = info?.accounts?.length ? info.accounts.map(parseIdlAccount)
			: grp?.accounts ? grp.accounts.map((n, i) => ({ index: i, name: n, source: 'known' as const, expected: {}, constraints: {} }))
			: (info?.strAccounts ?? []).map((n, i) => ({ index: i, name: n, source: 'str' as const, expected: {}, constraints: {} }))
		const known = new Set(accounts.map(x => x.name))
		const canon = (acct: string | undefined): string | undefined => {
			if (!acct) return undefined
			if (known.has(acct)) return acct
			const a = acct.replace(/_\d+$/, '')
			if (known.has(a)) return a
			const ix = /^acc(\d+)$/.exec(a) ?? /^account\[(\d+)\]$/.exec(a)
			if (ix) return accounts.find(y => y.index === Number(ix[1]))?.name ?? `account[${ix[1]}]`
			return TEMP.test(acct) ? undefined : a
		}
		const row = (nm: string): AccountRow => {
			let x = accounts.find(y => y.name === nm)
			if (!x) { x = { name: nm, source: 'code', expected: {}, constraints: {} }; accounts.push(x); known.add(nm) }
			return x
		}
		const note = (acct: string, kind: string, ev: Evidence) => {
			const x = row(acct)
			const old = x.constraints[kind]
			if (!old || RANK[ev.status] > RANK[old.status]) x.constraints[kind] = ev
		}
		const loc = (ff: FnFacts, line: number, pc?: number): Loc => ({ fn: ff.name, line, pc })
		const checks: CheckOut[] = []
		const pend: [string, string, number, string | undefined][] = []
		const ops: OpOut[] = []
		const idxName = (i: number) => accounts.find(y => y.index === i)?.name ?? `account[${i}]`
		/** Anchor try_accounts: the accounts a check's key comparison reads (flow.ts compareAccounts) */
		const anchorCompares = (ff: FnFacts): ((c: FnFacts['checks'][number]) => { acct: string; direct: boolean }[] | undefined) | undefined => {
			const fo = byPc.get(ff.pc)
			if (!fo || !ff.checks.some(c => c.named && c.before !== undefined)) return undefined
			const D = defsOf(fo.f, { f: pc => byPc.get(pc)?.f, name: pc => p.funcs.get(pc)?.name ?? '' })
			const g = cfgOf(fo), blocks = fo.f.blocks
			// (each account's call: the last call of the checked callee before the check naming the account)
			const calls = new Map<number, string>()
			for (const c of ff.checks) {
				if (!c.named || c.before === undefined || !c.c) continue
				let b = decisionBlock(g, c.c, c.pc, c.passPc)
				for (let k = 0; b !== undefined && k < 6; k++) {
					const ss = blocks[b].stmts
					let i = ss.length - 1
					for (; i >= 0; i--) { const x = callOf(ss[i]); if (x?.t.k === 'fn' && x.t.pc === c.before) break }
					if (i >= 0) { calls.set(b << 16 | i, c.named); break }
					b = blocks[b].preds.length === 1 ? blocks[b].preds[0] : undefined
				}
			}
			if (!calls.size) return undefined
			return c => { const b = decisionBlock(g, c.c, c.pc, c.passPc); return b === undefined ? undefined : compareAccounts(D, c.c!, b << 16 | blocks[b].stmts.length, calls) }
		}
		/** the nearest instruction built before a line of a function: its own hints and calls to builders (functions with hints of one instruction) */
		/** the accounts whose keys a call passes (arguments 1.., native), by name */
		const builderAccounts = (fn: number, pc: number): (string | undefined)[] | undefined => {
			const fo = byPc.get(fn)
			const s = fo?.f.blocks.flatMap(b => b.stmts).find(x => x.pc === pc && callOf(x))
			if (!fo || !s) return undefined
			const R = accountResolver(fo, { f: x => byPc.get(x)?.f, name: x => p.funcs.get(x)?.name ?? '' })
			return callOf(s)!.args.slice(1, 8).map(a => { const x = R.valueRef(a, s); return x?.field === 'key' ? idxName(x.index) : undefined })
		}
		const hintBefore = (ff: FnFacts, line: number, depth = 2): IxHint | undefined => {
			let best: IxHint | undefined
			const take = (x: IxHint) => { if (x.line < line && (!best || x.line > best.line)) best = x }
			ff.ixHints.forEach(take)
			for (const c of ff.calls) {
				const hs = facts.get(c.callee)?.ixHints ?? []
				if (hs.length && hs.every(x => x.ix === hs[0].ix) && keep(ff.pc, c.pc)) take({ ...hs[0], line: c.line, how: `${facts.get(c.callee)!.name} (${hs[0].how})`, call: c.pc !== undefined ? { fn: ff.pc, pc: c.pc } : undefined })
			}
			// (none: a wrapper of invoke called after the instruction was built, in its caller)
			const par = !best && depth > 0 ? parents.get(ff.pc) : undefined
			const pf = par && facts.get(par.fn), pl = pf?.calls.find(x => x.callee === ff.pc && (par!.pc !== undefined ? x.pc === par!.pc : x.ret === par!.ret))?.line
			return best ?? (pf && pl !== undefined ? hintBefore(pf, pl, depth - 1) : undefined)
		}
		// (native: accounts held in temporaries, by their place in the input / the AccountInfo slice; in a function the
		// instruction calls, its pointer parameters bound to the values at the call site of this instruction's call path)
		const clr = { f: (pc: number) => byPc.get(pc)?.f, name: (pc: number) => p.funcs.get(pc)?.name ?? '' }
		const resMemo = new Map<number, AcctResolver | undefined>()
		const resolverFor = (fn: number, d = 0): AcctResolver | undefined => {
			if (resMemo.has(fn)) return resMemo.get(fn)
			const fo = byPc.get(fn)
			if (r.anchor || !fo) return undefined
			resMemo.set(fn, accountResolver(fo, clr))
			const par = fn !== h.pc && d < 6 ? parents.get(fn) : undefined
			const PR = par?.pc !== undefined ? resolverFor(par.fn, d + 1) : undefined
			const pf = par && byPc.get(par.fn)
			let pos = -1, c: ReturnType<typeof callOf> | undefined
			pf?.f.blocks.forEach((b, bi) => b.stmts.forEach((st, i) => { if (st.pc === par!.pc && callOf(st)) { pos = bi << 16 | i; c = callOf(st) } }))
			const seed = new Map<number, AcctVal>()
			if (PR && c && c.t.k === 'fn' && c.t.pc === fn) c.args.forEach((a, j) => {
				const v = PR.av(a, pos), pv = fo.f.vars.find(x => x.param === j + 1)?.id
				if (v && pv !== undefined && (v.k === 'slice' || v.k === 'recs' || v.k === 'rec' || v.k === 'ptr' || v.k === 'rc')) seed.set(pv, v)
			})
			if (seed.size) resMemo.set(fn, accountResolver(fo, clr, seed))
			return resMemo.get(fn)
		}
		for (const ff of fns) {
			const fm = main.get(ff.pc)!
			const R = resolverFor(ff.pc)
			const cn = (a: string | undefined) => { const x = a ? R?.byName.get(a) : undefined; return x ? idxName(x.index) : canon(a) }
			const AC = r.anchor ? anchorCompares(ff) : undefined
			for (const c of ff.checks) {
				// (by the block deciding the condition: the failing side may be an error exit the tags share)
				const cb = (grp || R) && c.c && byPc.get(ff.pc) ? decisionBlock(cfgOf(byPc.get(ff.pc)!), c.c, c.pc, c.passPc) : undefined
				if (grp && (cb !== undefined ? !grp.allowed(ff.pc, cb) : !keep(ff.pc, c.pc))) continue
				const status: 'found' | 'partial' = fm && c.main ? 'found' : 'partial'
				const irRefs = R && c.c ? R.refs(c.c, cb) : []
				// (an account the code holds in a temporary: its name, marked with ?)
				const acct = cn(c.named) ?? cn(c.refs.find(x => cn(x.acct))?.acct) ?? (irRefs[0] ? idxName(irRefs[0].index) : undefined) ?? (c.refs[0] ? `${c.refs[0].acct}?` : undefined)
				const fk = (f: string | undefined) => ({ is_signer: 'signer', is_writable: 'writable', owner: 'owner', key: 'key', executable: 'executable', data_len: 'data_len', lamports: 'lamports' } as Record<string, string>)[f ?? '']
				const kinds = [...c.kinds, ...(c.via?.kinds ?? []).filter(k => k !== 'count' && !c.kinds.includes(k)), ...irRefs.map(x => fk(x.field)).filter((k, i, a): k is string => !!k && !c.kinds.includes(k) && a.indexOf(k) === i)]
				// (a 32-byte comparison this instruction's context does not resolve either)
				if (!kinds.length && c.cmp32) continue
				// (native: an account key compared with a constant (address), with a derived address in the frame (pda),
				// or two account fields compared (a relation))
				const sd = R && c.c ? R.sides(c.c, cb) : undefined
				const keyed = sd?.find((x): x is AcctRef => typeof x === 'object' && x.field === 'key')
				const other = keyed && sd!.find(x => x !== keyed)
				const sk = other === 'const' ? 'address' : other === 'pda' ? 'pda' : undefined
				if (sk && !kinds.includes(sk)) kinds.push(sk)
				let sides = sd && typeof sd[0] === 'object' && typeof sd[1] === 'object' && sd[0].index !== sd[1].index ? sd.map(x => `${idxName((x as AcctRef).index)}.${(x as AcctRef).field}`) as [string, string] : undefined
				// (Anchor: the accounts a key comparison reads, by where its bytes come from: an account's data (the
				// checked account) and another account's key; has_one: the field is named after the target account)
				const ac = AC && c.c && kinds.some(k => ['has_one', 'token_mint', 'token_owner', 'key', 'raw', 'custom'].includes(k)) ? AC(c) : undefined
				let account = sk ? idxName(keyed!.index) : acct
				if (ac) {
					const dat = ac.find(x => x.direct), key = ac.find(x => !x.direct)
					const d = canon(dat?.acct), k = canon(key?.acct)
					if (d && k && d !== k) {
						sides = [`${d}.${kinds.includes('has_one') ? k : kinds.includes('token_mint') ? 'mint' : kinds.includes('token_owner') ? 'owner' : 'data'}`, `${k}.key`]
						if (!account || account.endsWith('?')) account = d
					}
				}
				const at = loc(ff, c.line, c.pc)
				checks.push({ at, status, account, kinds, cond: c.cond, failsIf: c.failsIf, error: c.error, via: c.via ? `${c.via.fn} (${c.via.kinds.join(', ')})` : undefined, sides, fnPc: ff.pc, c: c.c, passPc: c.passPc, main: c.main })
				const ci = checks.length - 1
				if (sk) pend.push([idxName(keyed!.index), sk, ci, undefined])
				// per account: the named one gets every kind; accounts read by the condition get their field's kind
				// (applied once the statuses are final: see the dominance analysis below)
				if (c.named && cn(c.named)) for (const k of kinds) pend.push([cn(c.named)!, k, ci, c.via && !c.kinds.includes(k) ? c.via.fn : undefined])
				for (const x of irRefs) { const k = fk(x.field); if (k) pend.push([idxName(x.index), k, ci, undefined]) }
				for (const x of c.refs) {
					const ca = cn(x.acct)
					if (!ca || ca === cn(c.named)) continue
					const f0 = x.field?.split('.')[0] ?? ''
					const k = { is_signer: 'signer', is_writable: 'writable', owner: 'owner', key: 'key', executable: 'executable', data_len: 'data_len', lamports: 'lamports' }[f0] ?? (x.field ? 'state' : undefined)
					if (k) pend.push([ca, k, ci, undefined])
				}
			}
			for (const o of ff.ops) {
				if ((o.errPath && !isDisp(ff.pc)) || !(o.pc === undefined && o.ret ? keepCall(ff.pc, { ret: o.ret }) : keep(ff.pc, o.pc))) continue
				// (a store in a function several handlers call, named by another handler's accounts)
				if (o.handler !== undefined && o.handler !== hpc) continue
				// (a wrapper's own CPI site, when its calls in this instruction are decoded)
				if (ff.wrapper && !o.cpi && fns.some(g => g.ops.some(x => x.via === ff.name))) continue
				const at = loc(ff, o.line, o.pc)
				const tgt = o.target ? `${cn(o.target.acct) ?? o.target.acct}${o.target.field ? '.' + o.target.field : ''}` : undefined
				let { kinds, text, cpi } = o
				// (a CPI whose instruction is not in the frame: the instruction built before it in the function)
				const h = o.kinds.includes('CPI') && !o.cpi?.ix ? hintBefore(ff, o.line) : undefined
				if (h) {
					cpi = { ...(o.cpi ?? { program: h.program, accounts: [], fields: [] }), family: h.family, ix: h.ix }
					if (!o.cpi || o.cpi.program === '?') cpi.program = h.program
					// (native: the builder's arguments: the program id, then the instruction's accounts in their order)
					const ba = !r.anchor && h.call ? builderAccounts(h.call.fn, h.call.pc) : undefined
					if (ba && !cpi.accounts.length) {
						const roles = knownFamilies().find(([k]) => k === h.program)?.[1].ixs
						const lay = roles && Object.values(roles).find(x => x.name === h.ix)
						cpi.accounts = ba.slice(1, 1 + (lay?.accounts.length ?? 0)).map((a, i) => ({ role: lay!.accounts[i], text: a ?? '?' }))
						if (ba[0]) cpi.program = ba[0]
					}
					kinds = [...new Set([...cpiKinds(h.family, h.ix), ...o.kinds])]
					text = `CPI ${cpi.program}.${h.ix} [heur: the instruction built before it: ${h.how}]${o.cpi ? ` — ${o.text}` : ''}`
				}
				ops.push({ at, kinds, text: text + (o.via ? ` [through ${o.via}, decoded by a run of ${ff.name}]` : ''), main: fm && o.main, target: tgt, how: o.how, value: o.value, cpi, pda: o.pda, fnPc: ff.pc, ret: o.ret, anchorClose: r.anchor && kinds.includes('ACCOUNT_CLOSE') && !cpi && ff.lines.some(l => /\bAccountInfo_(assign|realloc|resize)\w*\(/.test(l)) || undefined })
			}
		}
		// check statuses from real dominators (across calls), then the per-account constraints
		const ctx: IxCtx = { handler: h.pc, parents, allowed: grp?.allowed, restricted: grp && new Set(fns.filter(f => grp.dispatchers.includes(f.name)).map(f => f.pc)), tag: grp?.tag }
		dominance(r, checks, ops, ctx)
		for (const [acct, k, ci, via] of pend) note(acct, k, { status: checks[ci].status, at: checks[ci].at, via })
		// runtime model: what the Solana runtime enforces for the operations made
		for (const o of ops) {
			const acct = o.target?.split('.')[0]
			if (acct && known.has(acct)) {
				if (o.kinds.includes('ACCOUNT_DATA_WRITE') || o.kinds.includes('LAMPORT_WRITE')) note(acct, 'writable', { status: 'runtime', at: o.at, note: 'written: the runtime rejects changes to a read-only account' })
				if (o.kinds.includes('ACCOUNT_DATA_WRITE') || (o.kinds.includes('LAMPORT_WRITE') && o.how === '-=')) note(acct, 'owner', { status: 'runtime', at: o.at, note: 'data written / lamports debited: only the owner program may (the runtime rejects it otherwise)' })
			}
			for (const x of o.cpi?.accounts ?? []) {
				const ca = canon(refOf(x.text.replace(/^\*/, ''), new Map())?.acct ?? x.text.replace(/^\*/, ''))
				if (!ca || !known.has(ca)) continue
				if (x.s && !o.cpi?.seeds) note(ca, 'signer', { status: 'runtime', at: o.at, note: 'passed as a CPI signer: the callee rejects it unless it signed the transaction' })
				if (x.w) note(ca, 'writable', { status: 'runtime', at: o.at, note: 'passed writable to a CPI: privileges cannot be escalated' })
			}
		}
		// what the IDL declares but no check was found for
		for (const x of accounts) {
			const e = x.expected
			const need: string[] = []
			if (e.signer) need.push('signer')
			if (e.writable) need.push('writable')
			if (e.pda) need.push('pda')
			// (an account fixed to this program's own id: the placeholder of an absent optional account, or the program itself)
			if (e.address && e.address !== r.programId) need.push('address')
			for (const k of need) if (!x.constraints[k]) x.constraints[k] = { status: 'not_found' }
		}
		// effects (surface tree) and the sensitivity score
		const effects: string[] = []
		let score = 0
		const seen = new Set<string>()
		const eff = (t: string, w: number) => { if (seen.has(t)) return; seen.add(t); effects.push(t); score += w }
		for (const o of ops) {
			const k = o.kinds
			const w = Math.max(...k.map(x => WEIGHT[x] ?? 0))
			if (k.includes('CPI')) {
				const c = o.cpi
				const prog = c && c.program !== '?' ? (c.known ? c.program : `${c.program} [account-supplied program id${c.checked ? `; ${c.checked}` : ''}]`) : '?'
				const what = c?.ix ? `${prog}.${c.ix}` : prog !== '?' ? prog : 'program not decoded'
				const tag = k.includes('TOKEN_TRANSFER') ? 'TOKEN MOVE' : k.includes('LAMPORT_TRANSFER') ? 'LAMPORT MOVE' : k.includes('MINT') ? 'MINT' : k.includes('BURN') ? 'BURN'
					: k.includes('ACCOUNT_CLOSE') ? 'CLOSE' : k.includes('AUTHORITY_WRITE') ? 'SET authority' : k.includes('ACCOUNT_CREATE') ? 'CREATE' : k.includes('OWNER_ASSIGN') ? 'ASSIGN owner' : k.includes('ACCOUNT_REALLOC') ? 'ALLOCATE' : k.includes('PROGRAM_UPGRADE') ? 'UPGRADE' : 'CPI'
				eff(`${tag}: CPI → ${what}${k.includes('PDA_SIGNATURE') ? ' (PDA-signed)' : ''}`, w + (c && !c.known && c.program !== '?' ? 3 : 0))
			} else if (k.includes('PDA_DERIVE')) eff(`DERIVE PDA ${o.pda?.seeds ?? '?'}`, 0)
			else if (k.includes('LAMPORT_WRITE')) eff(`${k.includes('ACCOUNT_CLOSE') ? 'CLOSE (lamports = 0)' : o.how === '-=' ? 'LAMPORT OUT' : o.how === '+=' ? 'LAMPORT IN' : 'LAMPORT SET'} ${o.target}`, w)
			else if (k.includes('AUTHORITY_WRITE')) eff(`SET authority ${o.target}`, w)
			else if (k.includes('ACCOUNT_DATA_WRITE')) eff(`WRITE ${o.target} (${o.how})`, w)
			else if (k.includes('ACCOUNT_REALLOC')) eff(`REALLOC ${o.target ?? o.text}`, w)
		}
		// unverified expected privileges raise the rank
		for (const x of accounts) for (const [k, ev] of Object.entries(x.constraints)) if (ev.status === 'not_found' && (k === 'signer' || k === 'pda' || k === 'address')) score += 2
		const kind: IxOut['kind'] = grp ? 'native' : !h.name.startsWith('ix_') ? (procNames.has(h.name) ? 'processor' : 'entrypoint') : r.anchor ? 'anchor' : 'native'
		const dispatch = grp && `${grp.tags.length ? `tag ${grp.tags.join(', ')}` : 'paths leaving before the tag is matched'} (instruction data) matched in ${grp.dispatchers.join(', ')}; name ${grp.source === 'str' ? '[str: its "Instruction: …" log]' : grp.source === 'known' ? '[heur: the layout of a well-known program with these tags]' : '[the tag]'}`
		// (a tag region doing nothing the analysis sees, e.g. the invalid-tag default of the match: left out)
		if (grp && !ops.length && !checks.length) continue
		ixs.push({ name, handler: h.name, kind, functions: fns.map(f => f.name), accounts, checks, ops, score, effects, indirect, dispatch, ctx })
	}
	ixs.sort((x, y) => y.score - x.score || x.name.localeCompare(y.name))
	// operations in code no handler reaches through direct calls (function pointers, dispatch tables)
	const reached = new Set<string>(ixs.flatMap(x => x.functions))
	const unattributed: OpOut[] = []
	if (ixs.some(x => x.kind !== 'entrypoint')) for (const ff of facts.values()) {
		if (reached.has(ff.name)) continue
		for (const o of ff.ops) if (!o.errPath && !o.kinds.every(k => k === 'PDA_DERIVE')) unattributed.push({ at: { fn: ff.name, line: o.line, pc: o.pc }, kinds: o.kinds, text: o.text, main: false, target: o.target && `${o.target.acct}${o.target.field ? '.' + o.target.field : ''}`, how: o.how, value: o.value, cpi: o.cpi, pda: o.pda })
	}

	// program-level views: PDAs, state writes, read/write dependencies
	const pdas = new Map<string, PdaOut>()
	const pda = (seeds: string, program: string) => {
		const k = `${seeds}|${program}`
		let x = pdas.get(k)
		if (!x) pdas.set(k, (x = { seeds, program, derivedIn: [], signsIn: [], accounts: [], compared: 'not_found' }))
		return x
	}
	const add = (l: string[], v: string) => { if (!l.includes(v)) l.push(v) }
	const writes = new Map<string, { ix: string; how: string; at: Loc }[]>()
	const reads = new Map<string, Set<string>>()
	for (const ix of ixs) {
		const pdaAccts = ix.accounts.filter(x => x.constraints.pda?.status === 'found' || x.constraints.pda?.status === 'partial')
		for (const o of ix.ops) {
			if (o.pda) {
				const x = pda(o.pda.seeds, o.pda.program)
				add(x.derivedIn, ix.name)
				for (const a of pdaAccts) { add(x.accounts, `${ix.name}.${a.name}`); if (RANK[a.constraints.pda.status] > RANK[x.compared]) x.compared = a.constraints.pda.status }
			}
			if (o.cpi?.seeds) add(pda(o.cpi.seeds, '(caller: this program)').signsIn, ix.name)
			if (o.target && o.kinds.some(k => k === 'ACCOUNT_DATA_WRITE' || k === 'LAMPORT_WRITE')) {
				let l = writes.get(o.target); if (!l) writes.set(o.target, (l = []))
				if (!l.some(w => w.ix === ix.name && w.how === o.how)) l.push({ ix: ix.name, how: o.how ?? '=', at: o.at })
			}
		}
		for (const c of ix.checks) for (const m of c.cond.matchAll(/\b([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+)/g)) {
			const rf = refOf(m[1], new Map())
			if (!rf?.field || /^(key|owner|is_signer|is_writable|executable|lamports|data_len)$/.test(rf.field)) continue
			const t = `${rf.acct.replace(/_\d+$/, '')}.${rf.field}`
			let s = reads.get(t); if (!s) reads.set(t, (s = new Set())); s.add(ix.name)
		}
	}
	const deps: Analysis['deps'] = []
	for (const [t, rs] of reads) { const w = writes.get(t); if (w) deps.push({ target: t, readBy: [...rs].sort(), writtenBy: [...new Set(w.map(x => x.ix))].sort() }) }
	const a: Analysis = {
		program: { version: p.version, instructions: p.insns.length, functions: p.funcs.size, anchor: r.anchor, idl: r.instructions.some(i => i.accounts !== undefined) },
		ixs, pdas: [...pdas.values()],
		stateWrites: [...writes].sort((x, y) => x[0].localeCompare(y[0])).map(([target, w]) => ({ target, writes: w })),
		deps: deps.sort((x, y) => x.target.localeCompare(y.target)),
		unattributed,
	}
	phase2(a, r)
	return a
}

// ---- rendering ----

/** Where a location is in the written files: `file:line`, or undefined (single-file output). */
export type Where = (ix: string | undefined, at: Loc) => { file: string; line: number } | undefined

const at2s = (w: Where, ix: string | undefined, at: Loc) => { const x = w(ix, at); return x ? `${x.file}:${x.line}` : `${at.fn}:${at.line}` }
const ST: Record<Status, string> = { found: 'found', partial: 'PARTIAL', not_found: 'NOT FOUND', runtime: 'runtime' }

/** security/analysis.json */
export function renderJson(a: Analysis, where: Where): string {
	const L = (ix: string | undefined, at: Loc) => { const x = where(ix, at); return { fn: at.fn, line: at.line, pc: at.pc, file: x?.file, file_line: x?.line } }
	const ev = (ix: string, e: Evidence) => ({ status: e.status, at: e.at && L(ix, e.at), via: e.via, note: e.note })
	const doc = {
		schema: 'sbpf-decompiler/security@1',
		note: 'derived, over-approximate facts read off the decompiled code (the verified source of truth); statuses: found | partial | not_found (no check found, not a proof of absence) | runtime (enforced by the Solana runtime)',
		program: a.program,
		instructions: a.ixs.map(ix => ({
			name: ix.name, handler: ix.handler, kind: ix.kind, dispatch: ix.dispatch, score: ix.score, effects: ix.effects, functions: ix.functions, indirect: ix.indirect.length ? ix.indirect : undefined,
			accounts: ix.accounts.map(x => ({ index: x.index, name: x.name, source: x.source, expected: x.expected, constraints: Object.fromEntries(Object.entries(x.constraints).map(([k, e]) => [k, ev(ix.name, e)])) })),
			checks: ix.checks.map((c, i) => ({ id: i, at: L(ix.name, c.at), status: c.status, account: c.account, kinds: c.kinds, cond: c.cond, fails_if: c.failsIf, error: c.error, via: c.via })),
			operations: ix.ops.map(o => ({
				at: L(ix.name, o.at), kinds: o.kinds, text: o.text, path: o.main ? 'main' : 'conditional', target: o.target, how: o.how, value: o.value,
				cpi: o.cpi && { program: o.cpi.program, known: o.cpi.known, program_check: o.cpi.known ? 'constant' : o.cpi.checked ?? 'unknown', instruction: o.cpi.ix, accounts: o.cpi.accounts, fields: o.cpi.fields, seeds: o.cpi.seeds },
				pda: o.pda,
				guarded_by: o.guards, bypass: o.bypass?.map(b => ({ check: b.check, path: b.path.map(x => L(ix.name, x)) })), sources: o.sources,
			})),
			trust: ix.trust, relations: ix.relations?.map(x => ({ ...x, at: L(ix.name, x.at) })), authority: ix.authority?.map(x => ({ operation: x.op, kind: x.kind, enabled_by: x.enabledBy })),
			path_conditions: ix.paths?.map(p => ({ operation: p.op, conditions: p.conds.map(c => ({ at: L(ix.name, c.at), cond: c.cond, holds: c.holds, how: c.how, check: c.check })), not_required: p.notRequired.map(x => ({ check: x.check, path: x.path?.map(y => L(ix.name, y)) })), truncated: p.truncated })),
			auth_chains: ix.chains?.map(c => ({ operation: c.op, chains: c.steps })),
			arithmetic: ix.arith?.map(x => ({ at: L(ix.name, x.at), operation: x.op, target: x.target, expr: x.expr, kind: x.kind, status: x.status, guard: x.guard && { at: L(ix.name, x.guard.at), cond: x.guard.cond }, caller_controlled: x.caller, unnamed_field: x.unnamed })),
			divisions: ix.divs?.map(x => ({ at: L(ix.name, x.at), expr: x.expr, divisor: x.divisor, status: x.status, guard: x.guard && { at: L(ix.name, x.guard.at), cond: x.guard.cond } })),
			proof: ix.proof?.map(p => ({ operation: p.op, kind: p.kind, properties: p.props })),
		})),
		state_machine: a.states?.map(s => ({ field: s.field, set_by: s.setBy.map(x => ({ ix: x.ix, value: x.value, at: L(x.ix, x.at) })), checked_by: s.checkedBy.map(x => ({ ix: x.ix, cond: x.cond, at: L(x.ix, x.at) })) })),
		pdas: a.pdas.map(x => ({ seeds: x.seeds, program: x.program, derived_in: x.derivedIn, signs_in: x.signsIn, accounts: x.accounts, compared: x.compared })),
		state_writes: a.stateWrites.map(s => ({ target: s.target, writes: s.writes.map(w => ({ ix: w.ix, how: w.how, at: L(w.ix, w.at) })) })),
		dependencies: a.deps.map(d => ({ target: d.target, read_by: d.readBy, written_by: d.writtenBy })),
		findings: a.findings?.map(f => ({ rule: f.rule, instruction: f.ix, confidence: f.confidence, title: f.title, accounts: f.accounts, path: f.path, evidence: f.evidence })),
		authority_fields: a.authorityFields,
		unattributed_operations: a.unattributed.map(o => ({ at: L(undefined, o.at), kinds: o.kinds, text: o.text, target: o.target, how: o.how, cpi: o.cpi && { program: o.cpi.program, known: o.cpi.known, instruction: o.cpi.ix, accounts: o.cpi.accounts, fields: o.cpi.fields, seeds: o.cpi.seeds } })),
	}
	return JSON.stringify(doc, (_, v) => (v === undefined ? undefined : v), 1) + '\n'
}

const HEADER = [
	'DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).',
	'Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).',
]

/** Flags an auditor should look at first, per instruction. */
function flags(ix: IxOut): string[] {
	const out: string[] = []
	for (const x of ix.accounts) for (const k of ['signer', 'pda', 'address', 'writable']) if (x.constraints[k]?.status === 'not_found') out.push(`${x.name}: ${k} expected, no check found`)
	// (a program account with an address / executable check found counts as the check: e.g. an Anchor Interface<TokenInterface>)
	const progChecked = ix.accounts.some(x => /program/.test(x.name) && ['address', 'executable'].some(k => x.constraints[k] && x.constraints[k].status !== 'not_found'))
	for (const o of ix.ops) if (o.cpi && !o.cpi.known && o.cpi.program !== '?' && !/\(id compared with/.test(o.cpi.checked ?? '') && !progChecked) out.push(`CPI to an account-supplied program id without a recognized check (${o.at.fn}:${o.at.line})`)
	const value = ix.ops.some(o => o.kinds.some(k => ['TOKEN_TRANSFER', 'LAMPORT_TRANSFER', 'MINT', 'LAMPORT_WRITE', 'ACCOUNT_CLOSE', 'AUTHORITY_WRITE'].includes(k)))
	const signer = ix.accounts.some(x => x.constraints.signer && x.constraints.signer.status !== 'not_found') || ix.checks.some(c => c.kinds.includes('signer'))
	if (value && !signer) out.push('moves value / changes authority, but no signer check was found')
	return [...new Set(out)]
}

/** The ranked findings of the rule engine (phase2.ts), top ones. */
function renderFindings(a: Analysis, where: Where): string[] {
	const fs = a.findings ?? []
	const out = ['## Findings (ranked; rule engine over the facts: leads to review, not verdicts)', '']
	if (!fs.length) out.push('- none of the rules matched')
	for (const f of fs.slice(0, 15)) {
		const at = f.path[0]
		out.push(`- [${f.confidence}] **${f.rule}** · ${f.ix}${f.accounts.length ? ` · ${f.accounts.slice(0, 3).join(', ')}` : ''}${at ? ` · ${at}` : ''} — ${f.evidence[0] ?? ''}`.slice(0, 260))
	}
	if (fs.length > 15) out.push(`- … ${fs.length - 15} more in analysis.json (findings)`)
	const byRule = new Map<string, number>()
	for (const f of fs) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1)
	if (fs.length) out.push(`- by rule: ${[...byRule].map(([k, n]) => `${k} ${n}`).join(', ')}`)
	out.push('')
	return out
}

/** security/summary.md: the ranked instruction surface tree. */
export function renderSummary(a: Analysis, where: Where, ixFile: (ix: IxOut) => string): string {
	const out = ['# Security summary', '', ...HEADER, '',
		`Program: sBPF v${a.program.version}, ${a.program.instructions} instructions, ${a.program.functions} functions${a.program.anchor ? ', Anchor' : ''}${a.program.idl ? ' (with IDL)' : ''}. Machine-readable: analysis.json.`, '',
		...renderFindings(a, where), '## Instructions (most sensitive first)', '']
	for (const ix of a.ixs) {
		const signers = ix.accounts.filter(x => x.constraints.signer && x.constraints.signer.status !== 'not_found').map(x => `${x.name} (${ST[x.constraints.signer.status]})`)
		const anon = ix.checks.filter(c => c.kinds.includes('signer') && (!c.account || c.account.endsWith('?'))).length
		if (anon) signers.push(`${anon} signer check${anon > 1 ? 's' : ''} on accounts held in temporaries (see ${ixFile(ix)})`)
		out.push(`- **${ix.name}** — score ${ix.score} · [${ixFile(ix)}](${ixFile(ix)})${ix.handler.startsWith('ix_') ? ` · ../bundle/${ix.name}.ts` : ''}`)
		out.push(`  - signers: ${signers.join(', ') || 'none found'}`)
		for (const e of ix.effects.slice(0, 12)) out.push(`  - ${e}`)
		if (ix.effects.length > 12) out.push(`  - … ${ix.effects.length - 12} more (see ${ixFile(ix)})`)
		for (const f of flags(ix).slice(0, 6)) out.push(`  - ⚠ ${f}`)
	}
	if (a.unattributed.length) {
		out.push('', '## Operations not attributed to an instruction', '', 'In functions no handler reaches through direct calls (called through function pointers / dispatch tables, or dead code):', '')
		const w = (o: OpOut) => Math.max(...o.kinds.map(k => WEIGHT[k] ?? 0))
		for (const o of [...a.unattributed].sort((x, y) => w(y) - w(x)).slice(0, 25)) out.push(`- ${at2s(where, undefined, o.at)} ${o.kinds.join(', ')}: ${o.text.slice(0, 160)}`)
		if (a.unattributed.length > 25) out.push(`- … ${a.unattributed.length - 25} more in analysis.json`)
	}
	if (a.pdas.length) {
		out.push('', '## PDAs', '')
		for (const x of a.pdas) out.push(`- seeds ${x.seeds}, program ${x.program}${x.derivedIn.length ? ` — derived in ${x.derivedIn.join(', ')}` : ''}${x.signsIn.length ? ` — signs in ${x.signsIn.join(', ')}` : ''}${x.accounts.length ? ` — seeds constraint on ${x.accounts.join(', ')} (${ST[x.compared]})` : ''}`)
	}
	if (a.stateWrites.length) {
		out.push('', '## State writes (account.field ← instructions)', '')
		for (const s of a.stateWrites.slice(0, 60)) out.push(`- ${s.target} ← ${s.writes.map(w => `${w.ix} (${w.how})`).join(', ')}`)
		if (a.stateWrites.length > 60) out.push(`- … ${a.stateWrites.length - 60} more in analysis.json`)
	}
	if (a.authorityFields?.length) {
		out.push('', '## Authority fields (stored authorities and the instructions writing them)', '')
		for (const x of a.authorityFields.slice(0, 30)) out.push(`- ${x.field} ← ${x.writtenBy.join(', ')}`)
	}
	if (a.states?.length) {
		out.push('', '## State machine (status-like fields: set by → checked by; details in analysis.json state_machine)', '')
		for (const x of a.states.slice(0, 8)) out.push(`- ${x.field}: set by ${x.setBy.map(w => `${w.ix} (= ${w.value})`).join(', ') || 'none found'}; checked by ${[...new Set(x.checkedBy.map(c => c.ix))].join(', ') || 'none found'}`)
		if (a.states.length > 8) out.push(`- … ${a.states.length - 8} more in analysis.json`)
	}
	if (a.deps.length) {
		out.push('', '## Read/write dependencies (field checked by X, written by Y)', '')
		for (const d of a.deps) out.push(`- ${d.target}: checked in ${d.readBy.join(', ')}; written in ${d.writtenBy.join(', ')}`)
	}
	return out.join('\n') + '\n'
}

const cell = (x: AccountRow, k: string): string => {
	const e = x.constraints[k]
	const exp = k === 'signer' ? x.expected.signer : k === 'writable' ? x.expected.writable : k === 'pda' ? x.expected.pda : k === 'address' ? !!x.expected.address : undefined
	if (!e) return exp ? 'expected · NOT FOUND' : '—'
	return `${exp ? 'expected · ' : ''}${ST[e.status]}`
}
/** the condition under which a check fails, as text */
export function failText(c: { cond: string; failsIf: boolean }): string {
	if (c.failsIf) return c.cond
	const m = /^([^&|!=<>()]+?) (==|!=|>=|<=|>|<) ([^&|!=<>()]+)$/.exec(c.cond)
	if (m) return `${m[1]} ${{ '==': '!=', '!=': '==', '>=': '<', '<=': '>', '>': '<=', '<': '>=' }[m[2]]} ${m[3]}`
	if (/^!\w+\([^()]*(\([^()]*\)[^()]*)*\)$/.test(c.cond)) return c.cond.slice(1)
	return /^\w+\([^()]*(\([^()]*\)[^()]*)*\)$/.test(c.cond) ? `!${c.cond}` : `!(${c.cond})`
}
const md = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')

/** security/<ix>.md: privilege matrix, constraint matrix, CPIs, PDAs, operations, state writes, checks. */
export function renderIx(ix: IxOut, where: Where, a?: Analysis): string {
	const W = (at: Loc) => at2s(where, ix.name, at)
	const out = [`# ${ix.name}`, '', ...HEADER, '', `Handler ${ix.handler} (${ix.kind}); ${ix.functions.length} functions reachable: ${ix.functions.slice(0, 12).join(', ')}${ix.functions.length > 12 ? ', …' : ''}.`, '']
	if (ix.dispatch) out.push(`Dispatch: ${ix.dispatch}.`, '')
	if (ix.indirect.length) out.push(`Reached through function pointers / tables (conditional): ${ix.indirect.slice(0, 8).join(', ')}${ix.indirect.length > 8 ? ', …' : ''}.`, '')
	const fl = flags(ix)
	if (fl.length) out.push('## Look first', '', ...fl.map(f => `- ⚠ ${f}`), '')
	const fs = (a?.findings ?? []).filter(f => f.ix === ix.name)
	if (fs.length) out.push('## Findings (rule engine)', '', ...fs.slice(0, 10).map(f => `- [${f.confidence}] ${f.rule}: ${f.title}. ${f.evidence.join(' · ').slice(0, 220)}${f.path.length > 1 ? ` (path ${f.path.join(' → ')})` : f.path[0] ? ` (${f.path[0]})` : ''}`), '')
	out.push('## Account privileges (expected by the IDL · verified by the code)', '', '| # | account | signer | writable | owner | executable | address |', '|---|---|---|---|---|---|---|')
	for (const x of ix.accounts) out.push(`| ${x.index ?? ''} | ${x.name}${x.source !== 'idl' ? ` [${x.source}]` : ''} | ${cell(x, 'signer')} | ${cell(x, 'writable')} | ${cell(x, 'owner')}${x.constraints.discriminator ? ` (+discriminator ${ST[x.constraints.discriminator.status]})` : ''} | ${cell(x, 'executable')} | ${x.expected.address ? `= ${x.expected.address.slice(0, 8)}… · ` : ''}${cell(x, 'address')} |`)
	out.push('', '## Constraints per account', '')
	for (const x of ix.accounts) {
		const ks = Object.entries(x.constraints)
		if (!ks.length) { out.push(`- ${x.name}: no checks found`); continue }
		out.push(`- ${x.name}: ${ks.map(([k, e]) => `${k} ${ST[e.status]}${e.at ? ` (${W(e.at)}${e.via ? ` via ${e.via}` : ''})` : ''}${e.note ? ` — ${e.note}` : ''}`).join('; ')}`)
	}
	const cpis = ix.ops.filter(o => o.kinds.includes('CPI'))
	if (cpis.length) {
		out.push('', '## CPIs', '')
		for (const o of cpis) {
			const c = o.cpi
			const prog = !c || c.program === '?' ? 'program not decoded' : c.known ? `${c.program} (constant)` : `${c.program} (account-supplied; ${c.checked ?? 'check unknown'})`
			out.push(`- ${W(o.at)} ${o.main ? '' : '[conditional] '}${prog}${c?.ix ? `.${c.ix}` : ''}${c?.accounts.length ? ` — accounts ${c.accounts.map(x => `${x.role ? x.role + ': ' : ''}${x.text}${x.w ? ' w' : ''}${x.s ? ' s' : ''}`).join(', ')}` : ''}${c?.fields.length ? ` — ${c.fields.map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}${c?.seeds ? ` — PDA signer: ${c.seeds}` : ''}`)
			if (!c) out.push(`  - ${md(o.text)}`)
		}
	}
	const pdas = ix.ops.filter(o => o.pda)
	if (pdas.length) {
		out.push('', '## PDAs derived', '')
		for (const o of pdas) out.push(`- ${W(o.at)} ${o.pda!.fn}(${o.pda!.seeds}, program ${o.pda!.program})`)
		const sc = ix.accounts.filter(x => x.constraints.pda)
		if (sc.length) out.push(`- compared with provided accounts: ${sc.map(x => `${x.name} ${ST[x.constraints.pda.status]}`).join(', ')}`)
	}
	const sens = ix.ops.filter(o => !o.kinds.includes('CPI') && !o.pda)
	if (sens.length) {
		out.push('', '## Operations (account writes)', '')
		for (const o of sens) out.push(`- ${W(o.at)} ${o.kinds.join(', ')} ${o.target ?? ''} ${o.how ?? ''}${o.value ? ` ${md(o.value).slice(0, 80)}` : ''}${o.main ? '' : ' [conditional]'}`)
	}
	const vo = ix.ops.map((o, i) => [o, i] as const).filter(([o]) => o.guards && o.kinds.some(k => k !== 'PDA_DERIVE' && k !== 'CPI' || (o.cpi && !o.cpi.known)))
	if (vo.length) {
		out.push('', '## Dominance (checks on every path to the operation; across calls)', '')
		for (const [o] of vo.slice(0, 20)) {
			const g = o.guards!.map(i => ix.checks[i]).filter(c => c.kinds.some(k => k !== 'count'))
			const ks = [...new Set(g.flatMap(c => c.kinds.map(k => `${k}${c.account ? ` ${c.account}` : ''}`)))]
			out.push(`- ${W(o.at)} ${o.kinds.filter(k => k !== 'CPI').join(', ') || 'CPI'}: ${g.length} dominating checks${ks.length ? ` (${ks.slice(0, 8).join('; ')}${ks.length > 8 ? '; …' : ''})` : ''}`)
			for (const b of o.bypass ?? []) out.push(`  - ⚠ check ${W(ix.checks[b.check].at)} (${ix.checks[b.check].kinds.join(', ')}${ix.checks[b.check].account ? ` on ${ix.checks[b.check].account}` : ''}) does not dominate it: ${b.path.map(W).join(' → ')}`)
			if (o.sources?.length) out.push(`  - sources: ${o.sources.slice(0, 6).map(x => `${x.param} ← ${x.source} (${x.trust})`).join('; ')}`)
		}
	}
	if (ix.authority?.length) {
		out.push('', '## Authority (who enables each value movement / authority change)', '')
		for (const x of ix.authority.slice(0, 12)) out.push(`- ${W(ix.ops[x.op].at)} ${x.kind}: ${x.enabledBy.map(e => `${e.kind} ${e.what}${e.status ? ` (${ST[e.status as Status] ?? e.status})` : ''}${e.writtenBy?.length ? ` — written by ${e.writtenBy.join(', ')}` : ''}`).join('; ')}`)
	}
	const opName = (i: number) => { const o = ix.ops[i]; return `${W(o.at)} ${o.kinds.filter(k => k !== 'CPI').join(', ') || 'CPI'}${o.target ? ` ${o.target}` : o.cpi?.ix ? ` ${o.cpi.program}.${o.cpi.ix}` : ''}` }
	const P: Record<Status, string> = { found: 'found', partial: 'PARTIAL', not_found: 'NOT FOUND', runtime: 'runtime' }
	if (ix.proof?.length) {
		out.push('', '## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)', '')
		for (const p of ix.proof) {
			out.push(`- ${opName(p.op)} [${p.kind}]`)
			for (const x of p.props) out.push(`  - [${P[x.status]}] ${x.prop} — ${md(x.evidence)}`)
		}
	}
	if (ix.chains?.length) {
		out.push('', '## Authorization chains (operation ⇐ … ⇐ signer)', '')
		for (const c of ix.chains.slice(0, 12)) for (const alt of c.steps) out.push(`- ${opName(c.op)} ⇐ ${alt.slice(1).map(s => `${s.kind} ${s.what}${s.status ? ` (${ST[s.status as Status] ?? s.status})` : ''}`).join(' ⇐ ')}`)
	}
	const pcs = (ix.paths ?? []).filter(p => p.conds.length || p.notRequired.length)
	if (pcs.length) {
		out.push('', '## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)', '')
		for (const p of pcs.slice(0, 16)) {
			const cs = p.conds.filter(c => c.how !== 'loop').slice(0, 10).map(c => `${c.holds ? '' : '✗ '}\`${md(c.cond).slice(0, 70)}\`${c.check !== undefined ? ` #${c.check}` : ''}`)
			out.push(`- ${opName(p.op)}: ${cs.join(' · ') || 'no conditions found'}${p.conds.length > 10 ? ` · … ${p.conds.length - 10} more` : ''}${p.truncated ? ' (budget reached)' : ''}`)
			if (p.notRequired.length) out.push(`  - not required on some path: ${p.notRequired.map(x => `#${x.check} (${ix.checks[x.check].kinds.join(', ')}${ix.checks[x.check].account ? ` ${ix.checks[x.check].account}` : ''})${x.path ? ` via ${x.path.map(W).join(' → ')}` : ''}`).join('; ')}`)
		}
	}
	if (ix.arith?.length || ix.divs?.length) {
		out.push('', '## Arithmetic on value paths', '')
		for (const x of ix.arith ?? []) out.push(`- ${W(x.at)} ${x.target} ← \`${md(x.expr)}\`: ${x.status === 'unchecked' ? 'UNCHECKED (wraps)' : x.status}${x.guard ? ` — guard \`${md(x.guard.cond)}\` (${W(x.guard.at)})` : ''}${x.caller ? ' — instruction data' : ''}`)
		for (const x of ix.divs ?? []) out.push(`- ${W(x.at)} division by ${md(x.divisor)}: ${x.status === 'checked' ? `checked — \`${md(x.guard!.cond)}\` (${W(x.guard!.at)})` : 'NO zero / minimum check found'}`)
	}
	if (ix.relations?.length) {
		out.push('', '## Relations (equalities the checks establish)', '')
		for (const x of ix.relations.slice(0, 20)) out.push(`- ${x.a} ${x.kind === 'compare' ? '~' : '=='} ${x.b} (${x.kind}, ${ST[x.status]}, ${W(x.at)})`)
	}
	const tr = ix.trust?.filter(t => t.trust !== 'validated' || t.evidence.length) ?? []
	if (tr.length) {
		out.push('', '## Trust (caller-controlled vs validated values)', '')
		const cc = tr.filter(t => t.trust === 'caller-controlled').map(t => t.value)
		if (cc.length) out.push(`- caller-controlled (no validating check found): ${cc.join(', ')}`)
		for (const t of tr.filter(t => t.trust !== 'caller-controlled')) out.push(`- ${t.value}: ${t.trust}${t.evidence.length ? ` (${t.evidence.slice(0, 4).join(', ')})` : ''}`)
	}
	if (ix.checks.length) {
		out.push('', '## Checks', '', '| # | at | status | account | kinds | fails if | error |', '|---|---|---|---|---|---|---|')
		ix.checks.forEach((c, i) => out.push(`| ${i} | ${W(c.at)} | ${ST[c.status]} | ${c.account ?? ''} | ${c.kinds.join(', ')}${c.via ? ` (via ${c.via})` : ''} | \`${md(failText(c)).slice(0, 100)}\` | ${c.error} |`))
	}
	return out.join('\n') + '\n'
}

/** Short comment block for the single-file output. */
export function renderSummaryComment(a: Analysis): string[] {
	const out = ['// security summary (DERIVED, over-approximate; write a project with -o dir/ for security/*.md, analysis.json):']
	for (const ix of a.ixs.slice(0, 40)) {
		const fl = flags(ix)
		out.push(`//   ${ix.name} [score ${ix.score}]: ${ix.effects.slice(0, 4).join('; ') || 'no effects found'}${ix.effects.length > 4 ? '; …' : ''}${fl.length ? ` | ⚠ ${fl.slice(0, 2).join('; ')}${fl.length > 2 ? '; …' : ''}` : ''}`)
	}
	if (a.ixs.length > 40) out.push(`//   … ${a.ixs.length - 40} more`)
	return out
}

