// Idiom recognition: multi-step bit tricks emitted by LLVM become named helpers (see INTRINSICS).
//
//   q = p - (p >> 1 & 0x5555…); r = (q & 0x3333…) + (q >> 2 & 0x3333…);
//   (r + (r >> 4) & 0x0f0f…) * 0x0101… >> 56                            -> popcount(p)
//   popcount(~(x | x >> 1 | x >> 2 | … | x >> 32))  (as a chain)         -> clz(x)
//   popcount(~x & x - 1)                                                  -> ctz(x)
//
// The steps usually live in separate variables. Matching looks through a variable only when it has a
// single, pure definition that dominates all its uses (SSA-like: not a parameter, never undef), and
// the resulting helper's argument only mentions such variables or unassigned parameters. Then every
// variable has the same value at the use as at its definition (a single definition that dominates
// the use cannot be re-executed between them without also re-executing the use's own definition
// chain), so replacing the final expression by the helper is an identity; the intermediate
// variables become dead and are removed by the usual dead code elimination.
import { type VarFunc, pruneUnreachable } from './dataflow.ts'
import { type Expr, type Stmt, mapExpr, walkExpr, hasSideEffectsOrMem, exprEq } from './ir.ts'
import { mapStmtExprs } from './simplify.ts'
import { liveInSets } from './cfgopt.ts'

const M55 = 0x5555555555555555n, M33 = 0x3333333333333333n, M0F = 0x0f0f0f0f0f0f0f0fn, M01 = 0x0101010101010101n

type Bin = Extract<Expr, { k: 'bin' }>

export function recognizeIdioms(f: VarFunc): boolean {
	const merged = mergeWordCompares(f) // (changes block ids: first)
	// single pure definitions
	const defs = new Map<number, Expr>()
	const where = new Map<number, [number, number]>() // var -> [block, stmt index] of its definition
	const count = new Int32Array(f.vars.length)
	for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'set' || s.k === 'call') && s.dst >= 0) count[s.dst]++
	for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k !== 'set' || count[s.dst] !== 1) continue
		const v = f.vars[s.dst]
		const fx = hasSideEffectsOrMem(s.e)
		if (v.param < 0 && !v.undef && !fx.load && !fx.call && !fx.trap) { defs.set(s.dst, s.e); where.set(s.dst, [b.id, b.stmts.indexOf(s)]) }
	}
	// a variable is stable if its value is the same wherever it is visible
	const stable = (id: number) => defs.has(id) || (f.vars[id].param >= 0 && count[id] === 0)
	const trail: number[] = [] // variables looked through by the current match
	const see = (e: Expr): Expr => { if (e.k === 'var' && defs.has(e.id)) { trail.push(e.id); return defs.get(e.id)! } return e }
	const okArg = (e: Expr) => { let ok = true; walkExpr(e, x => { if (x.k === 'var' && !stable(x.id)) ok = false }); return ok }
	// the use being rewritten: block and statement index (stmts.length = terminator)
	let curB = -1, curI = -1
	/**
	 * The helper argument has the value the matched chain saw: its variables are stable, or the whole
	 * chain was defined earlier in the use's block and nothing in between assigns them.
	 */
	const argOk = (x: Expr): boolean => {
		if (okArg(x)) return true
		let lo = curI
		for (const v of trail) { const [b, i] = where.get(v)!; if (b !== curB) return false; lo = Math.min(lo, i) }
		const vs = new Set<number>(); walkExpr(x, y => { if (y.k === 'var') vs.add(y.id) })
		const st = f.blocks[curB].stmts
		for (let i = lo; i < curI; i++) { const s = st[i]; if ((s.k === 'set' || s.k === 'call') && vs.has(s.dst)) return false }
		return true
	}

	const bin = (e: Expr, op: Bin['op']): Bin | null => { const x = see(e); return x.k === 'bin' && x.op === op ? x : null }
	const isC = (e: Expr, v: bigint) => e.k === 'const' && e.v === v
	/** e = x >> n (logical), returns x */
	const shr = (e: Expr, n: bigint): Expr | null => { const x = bin(e, 'lshr'); return x && isC(x.b, n) ? x.a : null }
	/** e = (x >> n) & m or (x & m) when n = 0, returns x */
	const masked = (e: Expr, n: bigint, m: bigint): Expr | null => {
		const a = bin(e, 'and')
		if (!a || !isC(a.b, m)) return null
		return n === 0n ? a.a : shr(a.a, n)
	}
	// equal values: the same expression, or variables with the same definition over stable variables
	const same = (a: Expr, b: Expr) => exprEq(a, b) || (exprEq(see(a), see(b)) && okArg(see(a)))
	/** commutative binary match */
	const both = <T>(x: Bin, f2: (l: Expr, r: Expr) => T | null): T | null => f2(x.a, x.b) ?? f2(x.b, x.a)

	const popcount = (e: Expr): Expr | null => {
		// (s * 0x0101…) >> 56
		const m = shr(e, 56n); if (!m) return null
		const mul = bin(m, 'mul'); if (!mul || !isC(mul.b, M01)) return null
		// s = (r + (r >> 4)) & 0x0f0f…
		const s = masked(mul.a, 0n, M0F); if (!s) return null
		const add = bin(s, 'add'); if (!add) return null
		const r = both(add, (l, x) => { const y = shr(x, 4n); return y && same(y, l) ? l : null }); if (!r) return null
		// r = (q & 0x3333…) + ((q >> 2) & 0x3333…)
		const radd = bin(r, 'add'); if (!radd) return null
		const q = both(radd, (l, x) => { const a = masked(l, 0n, M33), b = masked(x, 2n, M33); return a && b && same(a, b) ? a : null }); if (!q) return null
		// q = p - ((p >> 1) & 0x5555…)
		const sub = bin(q, 'sub'); if (!sub) return null
		const p = masked(sub.b, 1n, M55)
		return p && same(p, sub.a) ? sub.a : null
	}
	/** x | x >> 1 | x >> 2 | … | x >> 32 (each step on the previous result), returns x */
	const smear = (e: Expr): Expr | null => {
		let cur = e
		for (const n of [32n, 16n, 8n, 4n, 2n, 1n]) {
			const o = bin(cur, 'or'); if (!o) return null
			const inner = both(o, (l, x) => { const y = shr(x, n); return y && same(y, l) ? l : null }); if (!inner) return null
			cur = inner
		}
		return cur
	}
	const rewrite = (e: Expr): Expr => {
		if (e.k !== 'bin' || e.op !== 'lshr') return e
		trail.length = 0
		const p = popcount(e)
		if (!p) return e
		// popcount(~smear(x)) = clz(x); popcount(~x & (x - 1)) = ctz(x)
		const n = see(p)
		if (n.k === 'not') {
			const x = smear(n.a)
			if (x && argOk(x)) return { k: 'fn', name: 'clz', args: [x] }
		}
		const a = n.k === 'bin' && n.op === 'and' ? n : null
		if (a) {
			const x = both(a, (l, r) => {
				const nl = see(l), dec = bin(r, 'add')
				return nl.k === 'not' && dec && isC(dec.b, 0xffffffffffffffffn) && same(nl.a, dec.a) ? nl.a : null
			})
			if (x && argOk(x)) return { k: 'fn', name: 'ctz', args: [x] }
		}
		if (!argOk(p)) return e
		return { k: 'fn', name: 'popcount', args: [p] }
	}
	let changed = merged
	const rw = (e: Expr) => { const n = mapExpr(e, rewrite); if (n !== e && !exprEq(n, e)) changed = true; return n }
	for (const b of f.blocks) {
		curB = b.id
		b.stmts = b.stmts.map((s: Stmt, i) => { curI = i; return mapStmtExprs(s, rw) })
		curI = b.stmts.length
		if (b.term.k === 'br') b.term.c = rw(b.term.c)
		else if (b.term.k === 'ret' && b.term.e) b.term.e = rw(b.term.e)
	}
	return changed
}

// ---------- multi-word memory comparisons ----------
//
//   if (ld64(p) != ld64(q)) goto E; if (ld64(p + 8) != ld64(q + 8)) goto E; … (k words)
//     ->  if (!memeq(p, q, 8k)) goto E
//   if (ld64(p) != c0) goto E; … ; if (ld64(p + 24) != c3) goto E
//     ->  if (!keyeq(p, "<base58 of c0..c3>")) goto E      (32-byte public key constant)
//
// memeq/keyeq compare ascending 8-byte words and stop at the first difference, so they perform the
// same loads as the chain, in the same order; the intermediate blocks must be reached only from the
// previous compare, and every exit must go to the same block (or to an identical copy of it made by
// tail duplication). Address bases are call-free and are evaluated once instead of once per word
// (nothing is stored in between).

type Blk = VarFunc['blocks'][number]

function splitAddr(e: Expr): [Expr, bigint] {
	if (e.k === 'bin' && e.op === 'add' && e.b.k === 'const') return [e.a, e.b.v]
	return [e, 0n]
}
const isPureExpr = (e: Expr) => { const s = hasSideEffectsOrMem(e); let u = false; walkExpr(e, x => { if (x.k === 'undef') u = true }); return !s.load && !s.call && !s.trap && !u }
const usesVar = (e: Expr, v: number) => { let r = false; walkExpr(e, x => { if (x.k === 'var' && x.id === v) r = true }); return r }
const addAddr = (base: Expr, off: bigint): Expr => (off === 0n ? base : { k: 'bin', op: 'add', a: base, b: { k: 'const', v: BigInt.asUintN(64, off) } })
const rep = (_k: string, v: unknown) => (typeof v === 'bigint' ? v.toString() : v)
const body = (x: Blk) => JSON.stringify([x.stmts.map(s => ({ ...s, pc: 0 })), x.term], rep)
const sameBody = (x: Blk, y: Blk) => x.id === y.id || body(x) === body(y)

/** A word compare branch: ld64(p) against ld64(q) or a constant; targets if different / if equal. */
interface WordCmp { p: Expr; q: Expr | null; c: bigint; differ: number; equal: number }
function wordCompare(b: Blk): WordCmp | null {
	const t = b.term
	if (t.k !== 'br' || t.c.k !== 'cmp' || (t.c.op !== 'ne' && t.c.op !== 'eq') || t.t === t.f) return null
	const { a, b: c } = t.c
	if (a.k !== 'load' || a.size !== 8 || hasSideEffectsOrMem(a.addr).call) return null
	const [differ, equal] = t.c.op === 'ne' ? [t.t, t.f] : [t.f, t.t]
	if (c.k === 'const') return { p: a.addr, q: null, c: c.v, differ, equal }
	if (c.k !== 'load' || c.size !== 8 || hasSideEffectsOrMem(c.addr).call) return null
	return { p: a.addr, q: c.addr, c: 0n, differ, equal }
}

function mergeWordCompares(f: VarFunc): boolean {
	let changed = false
	let live: Uint32Array[] | null = null
	const isLive = (b: number, v: number) => ((live ??= liveInSets(f))[b][v >>> 5] >>> (v & 31)) & 1
	for (const a of f.blocks) {
		const w0 = wordCompare(a)
		if (!w0) continue
		const err = w0.differ
		const [pb, po] = splitAddr(w0.p), [qb, qo] = w0.q ? splitAddr(w0.q) : [null, 0n]
		const chain: Blk[] = [a], consts = [w0.c]
		const hoist: Stmt[] = [], errTargets = [err]
		let ok = w0.equal
		for (let k = 1; k < (w0.q ? 8 : 4); k++) {
			const n = f.blocks[ok]
			if (n.id === 0 || n.preds.length !== 1 || chain.includes(n)) break
			const w = wordCompare(n)
			if (!w || !w.q !== !w0.q || chain.some(c => c.id === w.differ || c.id === w.equal) || !sameBody(f.blocks[w.differ], f.blocks[err])) break
			const at = (x: Expr, base: Expr, off: bigint) => { const [b, o] = splitAddr(x); return exprEq(b, base) && o === BigInt.asUintN(64, off + BigInt(8 * k)) }
			if (!at(w.p, pb, po) || (qb && !at(w.q!, qb, qo))) break
			// statements between compares (e.g. `flag = 0` before the last word) run before all loads
			// instead: allowed when pure and assigning variables that no exit reads before redefining
			// (so executing them on an early exit is unobservable) and that the addresses do not use
			const errs = [...errTargets, w.differ]
			const movable = (s: Stmt) => s.k === 'set' && isPureExpr(s.e) && !usesVar(pb, s.dst) && !(qb && usesVar(qb, s.dst)) &&
				!errs.some(e => isLive(e, s.dst))
			if (!n.stmts.every(movable)) break
			hoist.push(...n.stmts)
			chain.push(n)
			consts.push(w.c)
			errTargets.push(w.differ)
			ok = w.equal
		}
		if (chain.length < 2 || (!qb && chain.length !== 4)) continue
		// a: memeq/keyeq ? ok : err; the rest of the chain becomes unreachable
		const cond: Expr = qb
			? { k: 'fn', name: 'memeq', args: [addAddr(pb, po), addAddr(qb, qo), { k: 'const', v: BigInt(8 * chain.length) }] }
			: { k: 'fn', name: 'keyeq', args: [addAddr(pb, po), ...consts.map(v => ({ k: 'const', v }) as Expr)] }
		for (const n of chain.slice(1)) {
			const t = n.term as Extract<Blk['term'], { k: 'br' }>
			for (const s of [t.t, t.f]) { const S = f.blocks[s]; const i = S.preds.indexOf(n.id); if (i >= 0) S.preds.splice(i, 1) }
			n.preds = []; n.succs = []; n.term = { k: 'trap', msg: 'dead' }
		}
		f.blocks[err].preds = f.blocks[err].preds.filter(x => x !== a.id)
		a.stmts.push(...hoist)
		a.term = { k: 'br', c: cond, t: ok, f: err }
		a.succs = [ok, err]
		f.blocks[ok].preds.push(a.id)
		f.blocks[err].preds.push(a.id)
		changed = true
	}
	if (changed) pruneUnreachable(f)
	return changed
}
