// Anchor account recovery (names and comments only: nothing here changes semantics).
//
// Anchor's generated `Accounts::try_accounts` maps every failure of a field to
// `Error::with_account_name("<field>")`: the program's own strings name its accounts. From the
// calls to that function we recover, per function:
//   - the account names in order of first appearance (the struct's field order in generated code);
//   - the checks on each account: the failing branch that names it and the Anchor error code it
//     raises there (ConstraintMut, ConstraintSeeds, AccountNotEnoughKeys, ...);
//   - names for variables that hold the account: variables tested by the branch whose failing side
//     names it, and the AccountInfo pointer among the words loaded from the same result as those.
// The association of a variable with a name is structural (heuristic, tagged [str] in the output:
// the name itself is the program's; which variable holds that account is inferred).
import type { Node } from './structure.ts'
import type { VarFunc } from './dataflow.ts'
import { type Expr, type Stmt, walkExpr } from './ir.ts'
import { stmtExprs } from './simplify.ts'

export interface AnchorFn {
	accounts: string[]                      // names in order of first appearance
	checks: Map<string, string[]>           // name -> Anchor error names raised on its failing branches
	varNames: Map<number, string>           // variable id -> account name
	accountVars: Set<number>                // variables that hold an AccountInfo pointer (view type)
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/

type Call = { pc: number; args: Expr[] }
function callsIn(s: Stmt): Call[] {
	const out: Call[] = []
	if (s.k === 'call' && s.t.k === 'fn') out.push({ pc: s.t.pc, args: s.args })
	for (const e of stmtExprs(s)) walkExpr(e, x => { if (x.k === 'call' && x.t.k === 'fn') out.push({ pc: x.t.pc, args: x.args }) })
	return out
}

/** The name carried by a call's last (pointer, length) argument pair, if it is an identifier string. */
export function nameArg(args: Expr[], strAt: (p: bigint, n: bigint) => string | undefined): string | undefined {
	const p = args[args.length - 2], n = args[args.length - 1]
	if (p?.k !== 'const' || n?.k !== 'const' || n.v > 64n) return undefined
	const s = strAt(p.v, n.v)
	return s !== undefined && IDENT.test(s) ? s : undefined
}

/**
 * The account-name error function (`anchor_lang::error::Error::with_account_name`): the callee most
 * often called with an identifier string as its last two arguments (at least 3 sites).
 */
export function findNameFn(funcs: Iterable<VarFunc>, strAt: (p: bigint, n: bigint) => string | undefined): number | undefined {
	const count = new Map<number, number>()
	for (const f of funcs) for (const b of f.blocks) for (const s of b.stmts) for (const c of callsIn(s))
		if (nameArg(c.args, strAt)) count.set(c.pc, (count.get(c.pc) ?? 0) + 1)
	let best: number | undefined, n = 0
	for (const [pc, c] of count) if (c > n) { best = pc; n = c }
	return n >= 3 ? best : undefined
}

const vars = (e: Expr, out: Set<number>) => walkExpr(e, x => { if (x.k === 'var') out.add(x.id) })
const frameOff = (e: Expr, fp: number): number | undefined =>
	e.k === 'var' && e.id === fp ? 0 : e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const' ? Number(BigInt.asIntN(64, e.b.v)) : undefined

/**
 * Analyze one function. `errName(code)` names Anchor error codes; `isAccount(v)` tells variables
 * already known to be AccountInfo pointers.
 */
export function anchorFn(f: VarFunc, body: Node[], nameFn: number, strAt: (p: bigint, n: bigint) => string | undefined,
	errName: (code: bigint) => string | undefined, isAccount: (v: number) => boolean): AnchorFn | undefined {
	const fp = f.vars.find(v => v.param === 10)?.id ?? -1
	const res: AnchorFn = { accounts: [], checks: new Map(), varNames: new Map(), accountVars: new Set() }
	// names and error codes of a node list (recursively): the per-node summaries merged in order
	interface Info { names: Set<string>; codes: string[] }
	const cache = new Map<Node[], Info>()
	const nodeCache = new Map<Node, Info>()
	const merge = (r: Info, i: Info) => { i.names.forEach(x => r.names.add(x)); i.codes.forEach(x => { if (!r.codes.includes(x)) r.codes.push(x) }) }
	const nodeInfo = (n: Node): Info => {
		let r = nodeCache.get(n)
		if (r) return r
		r = { names: new Set(), codes: [] }
		if (n.k === 'stmt') {
			for (const c of callsIn(n.s)) {
				if (c.pc === nameFn) { const nm = nameArg(c.args, strAt); if (nm) r.names.add(nm) }
				for (const a of c.args) if (a.k === 'const') { const e = errName(a.v); if (e && !r.codes.includes(e)) r.codes.push(e) }
			}
		} else for (const sub of children(n)) merge(r, info(sub))
		nodeCache.set(n, r)
		return r
	}
	const info = (ns: Node[]): Info => {
		let r = cache.get(ns)
		if (r) return r
		r = { names: new Set(), codes: [] }
		for (const n of ns) merge(r, nodeInfo(n))
		cache.set(ns, r)
		return r
	}
	/**
	 * What `branches` needs from the suffixes ns.slice(j) of a list, for every j at once (built
	 * backwards; the former version re-summarized each suffix from scratch, quadratic in the list
	 * length): the number of distinct names (capped at 2), the name when there is exactly one, the
	 * error codes in order of first appearance (while there is at most one name), and the last position
	 * of each name among the list's unconditional name calls (for topNames of a suffix).
	 */
	interface Suffixes { count: Int8Array; one: (string | undefined)[]; codes: (string[] | undefined)[]; topLast: Map<string, number> }
	const sufCache = new Map<Node[], Suffixes>()
	const suffixes = (ns: Node[]): Suffixes => {
		let r = sufCache.get(ns)
		if (r) return r
		const len = ns.length
		r = { count: new Int8Array(len + 1), one: new Array(len + 1), codes: new Array(len + 1), topLast: new Map() }
		const names = new Set<string>()
		let codes: string[] = []
		r.codes[len] = codes
		for (let k = len - 1; k >= 0; k--) {
			const n = ns[k]
			for (const nm of topNames([n], nameFn, strAt)) if (!r.topLast.has(nm)) r.topLast.set(nm, k)
			if (names.size >= 2) { r.count[k] = 2; continue }
			const i = nodeInfo(n)
			i.names.forEach(x => names.add(x))
			r.count[k] = Math.min(names.size, 2)
			if (names.size === 1) r.one[k] = [...names][0]
			// codes of ns.slice(k): this node's, then the later ones not already listed
			if (i.codes.length) { const c = [...i.codes]; for (const x of codes) if (!c.includes(x)) c.push(x); codes = c }
			r.codes[k] = codes
		}
		sufCache.set(ns, r)
		return r
	}
	if (!info(body).names.size) return undefined

	// account names in order of first appearance
	const order = (ns: Node[]) => {
		for (const n of ns) {
			if (n.k === 'stmt') { for (const c of callsIn(n.s)) if (c.pc === nameFn) { const nm = nameArg(c.args, strAt); if (nm && !res.accounts.includes(nm)) res.accounts.push(nm) } }
			else if (n.k === 'if') { order(n.then); order(n.else) }
			else children(n).forEach(order)
		}
	}
	order(body)

	// try-call result groups: words loaded from a frame object right after a call that received it
	const group = new Map<number, number>() // var -> group id
	let gid = 0
	const groups = (ns: Node[]) => {
		let cur: { off: number; id: number } | undefined
		for (const n of ns) {
			if (n.k !== 'stmt') { children(n).forEach(groups); cur = undefined; continue }
			const s = n.s
			const cs = callsIn(s)
			if (cs.length) {
				const o = cs[0].args.length ? frameOff(cs[0].args[0], fp) : undefined
				cur = o !== undefined && s.k === 'call' ? { off: o, id: ++gid } : undefined
				continue
			}
			if (cur && s.k === 'set' && s.e.k === 'load' && s.e.size === 8) {
				const o = frameOff(s.e.addr, fp) ?? (s.e.addr.k === 'bin' && s.e.addr.op === 'add' && s.e.addr.b.k === 'const' ? addOff(frameOff(s.e.addr.a, fp), s.e.addr.b.v) : undefined)
				if (o !== undefined && o >= cur.off && o < cur.off + 0x40) { group.set(s.dst, cur.id); continue }
			}
			if (s.k === 'store' || s.k === 'stores' || s.k === 'copy') cur = undefined
		}
	}
	groups(body)

	// candidate names: variables tested by a branch whose other side names exactly one account
	const cand = new Map<number, Set<string>>()
	const add = (v: number, nm: string) => { let s = cand.get(v); if (!s) cand.set(v, (s = new Set())); s.add(nm) }
	const branches = (ns: Node[]) => {
		for (let k = 0; k < ns.length; k++) {
			const n = ns[k]
			if (n.k === 'if') {
				// `if (c) { …; return }` followed by more code: that code is the other side (when it fails
				// unconditionally: its name call is not nested in a further check)
				// a side: a list of its own, or the rest of this list (ns.slice(k + 1), read off suffixes(ns))
				const sides: [Node[] | null, boolean][] = [[n.then, false], [n.else, false]]
				if (!n.else.length && exits(n.then)) sides[1] = [null, true]
				if (!n.then.length && exits(n.else)) sides[0] = [null, true]
				for (const [side, rest] of sides) {
					let nm: string, codes: string[], topHas: boolean
					if (side) {
						const i = info(side)
						if (i.names.size !== 1) continue
						nm = [...i.names][0]
						codes = i.codes
						topHas = topNames(side, nameFn, strAt).has(nm)
					} else {
						const suf = suffixes(ns)
						if (suf.count[k + 1] !== 1) continue
						nm = suf.one[k + 1]!
						codes = suf.codes[k + 1]!
						topHas = (suf.topLast.get(nm) ?? -1) >= k + 1
					}
					if (rest && !topHas) continue
					// the variables tested: only when the failing side names the account unconditionally
					if (topHas) {
						const vs = new Set<number>()
						vars(n.c, vs)
						vs.delete(fp)
						vs.forEach(v => add(v, nm))
					}
					// the check itself: the error codes raised on that side
					let l = res.checks.get(nm); if (!l) res.checks.set(nm, (l = []))
					for (const c of codes) if (!l.includes(c)) l.push(c)
				}
				branches(n.then); branches(n.else)
			} else children(n).forEach(branches)
		}
	}
	branches(body)

	// AccountInfo evidence for untyped variables: flag bytes, or ld64(v) used as a 32-byte key
	const evidence = accountEvidence(f)
	const byGroup = new Map<number, Set<string>>()
	for (const [v, names] of cand) { const g = group.get(v); if (g !== undefined) { let s = byGroup.get(g); if (!s) byGroup.set(g, (s = new Set())); names.forEach(x => s!.add(x)) } }
	const assign = (v: number, names: Set<string>) => {
		if (names.size !== 1) return
		const nm = [...names][0]
		if (isAccount(v) || evidence.has(v)) { res.varNames.set(v, nm); res.accountVars.add(v) }
	}
	for (const [v, names] of cand) assign(v, names)
	for (const [v, g] of group) if (!res.varNames.has(v)) { const names = byGroup.get(g); if (names) assign(v, names) }
	return res
}

/** names of the name-function calls made unconditionally by a list (its own statements, not nested ones) */
function topNames(ns: Node[], nameFn: number, strAt: (p: bigint, n: bigint) => string | undefined): Set<string> {
	const out = new Set<string>()
	for (const n of ns) {
		const s: Stmt | undefined = n.k === 'stmt' ? n.s : n.k === 'return' && n.e ? { k: 'eval', e: n.e, pc: 0 } : undefined
		if (!s) continue
		for (const c of callsIn(s)) if (c.pc === nameFn) { const nm = nameArg(c.args, strAt); if (nm) out.add(nm) }
	}
	return out
}

/** does the list always leave (return / trap) at its end? */
function exits(ns: Node[]): boolean {
	const l = ns[ns.length - 1]
	if (!l) return false
	if (l.k === 'return' || l.k === 'trap') return true
	if (l.k === 'stmt' && l.s.k === 'trap') return true
	return l.k === 'if' && exits(l.then) && exits(l.else)
}

/**
 * Variables holding a function's first parameter (the out pointer): the parameter itself (never
 * reassigned), variables only ever assigned it, and variables only ever loaded from a frame slot that is
 * stored exactly once, with such a variable (the out pointer spilled under register pressure).
 * Undefined when the parameter is reassigned.
 */
export function outAliases(f: VarFunc): Set<number> | undefined {
	const out = f.vars.find(v => v.param === 1)?.id
	const fp = f.vars.find(v => v.param === 10)?.id ?? -1
	if (out === undefined) return undefined
	const defs = new Map<number, Expr[]>()
	const slots = new Map<number, Expr | null>()
	for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k === 'set' || s.k === 'call') { let l = defs.get(s.dst); if (!l) defs.set(s.dst, (l = [])); l.push(s.k === 'set' ? s.e : { k: 'undef' }) }
		else if (s.k === 'store' && s.size === 8) { const o = frameOff(s.addr, fp); if (o !== undefined) slots.set(o, slots.has(o) ? null : s.v) }
		else if (s.k === 'stores') { const o = frameOff(s.addr, fp); if (o !== undefined) s.vals.forEach((v, i) => { const k = o + s.size * i; slots.set(k, slots.has(k) || s.size !== 8 ? null : v) }) }
		else if (s.k === 'copy') { const o = frameOff(s.dst, fp); if (o !== undefined) for (let k = o - 7; k < o + s.n; k++) if (slots.has(k)) slots.set(k, null) }
	}
	if (defs.has(out)) return undefined
	// the value a def copies: a variable, or the variable stored in a single-store slot it loads
	const src = (e: Expr): number | undefined => {
		if (e.k === 'var') return e.id
		if (e.k !== 'load' || e.size !== 8) return undefined
		const o = frameOff(e.addr, fp)
		if (o === undefined) return undefined
		// (another store overlapping the slot: not a single-store slot)
		for (const k of slots.keys()) if (k !== o && k > o - 8 && k < o + 8) return undefined
		const v = slots.get(o)
		return v?.k === 'var' ? v.id : undefined
	}
	// greatest fixpoint: variables all of whose defs copy the out parameter or another such variable
	const res = new Set<number>([out])
	for (const [v, ds] of defs) if (ds.every(e => src(e) !== undefined)) res.add(v)
	for (let changed = true; changed;) {
		changed = false
		for (const v of res) if (v !== out && !defs.get(v)!.every(e => res.has(src(e)!))) { res.delete(v); changed = true }
	}
	return res
}

/**
 * Layout of the Accounts struct a try_accounts function returns through its first parameter: offset ->
 * account name, from stores `st64(out + off, v)` of a named account variable (or of a frame slot stored
 * exactly once, with such a variable). Offsets stored with different names are dropped.
 */
export function accountsLayout(f: VarFunc, names: Map<number, string>): Map<number, string> {
	const fp = f.vars.find(v => v.param === 10)?.id
	const res = new Map<number, string>(), bad = new Set<number>()
	// variables that only ever hold the out parameter
	const aliases = outAliases(f)
	if (!aliases) return res
	const isOut = (id: number) => aliases.has(id)
	const fo = (e: Expr) => frameOff(e, fp ?? -1)
	// frame slots stored exactly once
	const slot = new Map<number, Expr | null>()
	for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k === 'store' && s.size === 8) { const o = fo(s.addr); if (o !== undefined) slot.set(o, slot.has(o) ? null : s.v) }
		else if (s.k === 'stores' && s.size === 8) { const o = fo(s.addr); if (o !== undefined) s.vals.forEach((v, i) => slot.set(o + 8 * i, slot.has(o + 8 * i) ? null : v)) }
	}
	const nameOf = (e: Expr): string | undefined => {
		if (e.k === 'var') return names.get(e.id)
		if (e.k === 'load' && e.size === 8) { const o = fo(e.addr); const v = o !== undefined ? slot.get(o) : undefined; return v?.k === 'var' ? names.get(v.id) : undefined }
		return undefined
	}
	const note = (off: number, v: Expr) => {
		const nm = nameOf(v)
		if (!nm) return
		if (res.has(off) && res.get(off) !== nm) bad.add(off)
		res.set(off, nm)
	}
	const outOff = (a: Expr) => (a.k === 'var' && isOut(a.id) ? 0 : a.k === 'bin' && a.op === 'add' && a.a.k === 'var' && isOut(a.a.id) && a.b.k === 'const' ? Number(a.b.v) : -1)
	// blocks returning an error: Result<Accounts, Error> is Err when its first word (a reference) is 0
	const errBlock = (b: typeof f.blocks[number]) => b.stmts.some(s => (s.k === 'store' && s.size === 8 && s.v.k === 'const' && s.v.v === 0n && outOff(s.addr) === 0) || (s.k === 'stores' && s.size === 8 && s.vals[0].k === 'const' && s.vals[0].v === 0n && outOff(s.addr) === 0))
	for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k !== 'store' && s.k !== 'stores') continue
		if (errBlock(b)) break
		const a = s.addr
		const off = outOff(a)
		if (off < 0 || off > 0x10000 || s.size !== 8) continue
		if (s.k === 'store') note(off, s.v); else s.vals.forEach((v, i) => note(off + 8 * i, v))
	}
	for (const o of bad) res.delete(o)
	// one offset per name
	const seen = new Map<string, number>()
	for (const [o, nm] of res) { if (seen.has(nm)) { res.delete(o); res.delete(seen.get(nm)!) } else seen.set(nm, o) }
	return res
}

const addOff = (o: number | undefined, c: bigint) => (o === undefined ? undefined : o + Number(BigInt.asIntN(64, c)))

function children(n: Node): Node[][] {
	switch (n.k) {
		case 'if': return [n.then, n.else]
		case 'block': case 'loop': return [n.body]
		case 'switch': return n.cases.map(c => c.body)
		default: return []
	}
}

/**
 * Variables used like an AccountInfo pointer: a flag byte read at +0x28/+0x29/+0x2a, or the pointer
 * at +0 read and used as a 32-byte key (compared, copied, or read word by word).
 */
function accountEvidence(f: VarFunc): Set<number> {
	const out = new Set<number>()
	const defs = new Map<number, Expr[]>()
	for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'set') { let a = defs.get(s.dst); if (!a) defs.set(s.dst, (a = [])); a.push(s.e) }
	const baseVar = (e: Expr): number | undefined => (e.k === 'var' ? e.id : undefined)
	/** v if e is ld64(v) (directly or through a single-definition variable) */
	const keyPtrOf = (e: Expr): number | undefined => {
		if (e.k === 'var') { const d = defs.get(e.id); if (d?.length === 1) e = d[0] }
		return e.k === 'load' && e.size === 8 ? baseVar(e.addr) : undefined
	}
	const scan = (e: Expr) => walkExpr(e, x => {
		if (x.k === 'load' && x.size === 1 && x.addr.k === 'bin' && x.addr.op === 'add' && x.addr.a.k === 'var' && x.addr.b.k === 'const' && [0x28n, 0x29n, 0x2an].includes(x.addr.b.v)) out.add(x.addr.a.id)
		if (x.k === 'fn' && (x.name === 'memeq' || x.name === 'keyeq')) for (const a of x.name === 'memeq' ? x.args.slice(0, 2) : x.args.slice(0, 1)) { const v = keyPtrOf(a); if (v !== undefined) out.add(v) }
	})
	for (const b of f.blocks) {
		for (const s of b.stmts) {
			stmtExprs(s).forEach(scan)
			if (s.k === 'copy' && s.n === 32) { const v = keyPtrOf(s.src); if (v !== undefined) out.add(v) }
			if (s.k === 'call') for (let i = 0; i + 2 < s.args.length; i++) {
				// memcmp / memcpy-style calls: (p, q, 32)
				const n = s.args[i + 2]
				if (n.k === 'const' && n.v === 32n) for (const a of [s.args[i], s.args[i + 1]]) { const v = keyPtrOf(a); if (v !== undefined) out.add(v) }
			}
		}
		if (b.term.k === 'br') scan(b.term.c)
	}
	return out
}
