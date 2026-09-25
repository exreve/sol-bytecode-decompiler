// Statement-level idioms on the structured body (after all analyses; printed as helper calls):
//
//   x = ld64(p); …; st64(p, x + 1); if (x == -1) { abort() }   ->   rc_inc(p)
//   st64(p, x + 1); if (x == -1) { abort() }                    ->   rc_inc(p, x)
//   x = ld64(p); …; st64(p, x - 1); if (x == 1) { st64(p + 8, ld64(p + 8) - 1) }   ->   rc_dec(p)  (or rc_dec(p, x))
//   …; st64(p, x + 1); if (x != -1) { B } abort()   ->   rc_inc(p); B   when B never falls through (the
//       abort after the if is reached only when x == -1: it is the abort of rc_inc)
//
// (Rc::clone / Rc strong-count increment: *p += 1, aborting when the count was u64::MAX; Rc drop:
// strong count -= 1 and, when it reaches 0, weak count -= 1 — the bump allocator frees nothing.)
// The helper loads, stores and aborts exactly like the statements it replaces. For the first form,
// statements between the load and the store may only assign variables (no call, no store: at most
// a load or a trapping division, whose fault aborts either way before any effect) and must neither
// read x nor assign a variable of p, so performing the load right before the store reads the same
// word. In both forms x has no other use. With the frame pointer given (default memory model: the frame
// is only accessed through frame-pointer-derived addresses), statements moved before the helper may
// also load from the frame when p is not a frame address: such a load cannot read the word p.
import type { Node } from './structure.ts'
import { type Expr, walkExpr, exprEq, hasSideEffectsOrMem, M64 } from './ir.ts'

export function statementIdioms(body: Node[], fp?: number): Node[] {
	const uses = new Map<number, number>()
	const count = (e: Expr) => walkExpr(e, x => { if (x.k === 'var') uses.set(x.id, (uses.get(x.id) ?? 0) + 1) })
	const scan = (ns: Node[]) => {
		for (const n of ns) {
			switch (n.k) {
				case 'stmt': {
					const s = n.s
					if (s.k === 'set') { count(s.e); uses.set(s.dst, (uses.get(s.dst) ?? 0) + 1) }
					else if (s.k === 'call') { s.args.forEach(count); s.extra?.forEach(count); if (s.t.k === 'ind') count(s.t.e); if (s.dst >= 0) uses.set(s.dst, (uses.get(s.dst) ?? 0) + 1) }
					else if (s.k === 'store') { count(s.addr); count(s.v) }
					else if (s.k === 'stores') { count(s.addr); s.vals.forEach(count) }
					else if (s.k === 'copy') { count(s.dst); count(s.src) }
					else if (s.k === 'eval') count(s.e)
					break
				}
				case 'if': count(n.c); scan(n.then); scan(n.else); break
				case 'block': scan(n.body); break
				case 'loop': if (n.c) count(n.c); scan(n.body); break
				case 'return': if (n.e) count(n.e); break
				case 'switch': uses.set(n.v, 2); n.cases.forEach(c => scan(c.body)); break
				case 'setstate': uses.set(n.v, 2); break
			}
		}
	}
	scan(body)
	return rewrite(body, uses, fp)
}

/** e with every load of the current frame (fp + c, inside the 4 KiB frame: it cannot fault) replaced by 0 */
function withoutFrameLoads(e: Expr, fp: number): Expr {
	const m = (x: Expr): Expr => {
		switch (x.k) {
			case 'load': {
				const a = x.addr
				if (a.k === 'bin' && a.op === 'add' && a.a.k === 'var' && a.a.id === fp && a.b.k === 'const') {
					const c = BigInt.asIntN(64, a.b.v)
					if (c >= -0x1000n && c + BigInt(x.size) <= 0n) return { k: 'const', v: 0n }
				}
				return { ...x, addr: m(x.addr) }
			}
			case 'bin': case 'cmp': case 'land': case 'lor': return { ...x, a: m(x.a), b: m(x.b) } as Expr
			case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': return { ...x, a: m(x.a) } as Expr
			case 'sel': return { ...x, c: m(x.c), a: m(x.a), b: m(x.b) }
			case 'call': case 'fn': return { ...x, args: x.args.map(m) } as Expr
			default: return x
		}
	}
	return m(e)
}

const hasCall = (e: Expr) => { let c = false; walkExpr(e, x => { if (x.k === 'call') c = true }); return c }
const mentions = (e: Expr, v: number) => { let m = false; walkExpr(e, x => { if (x.k === 'var' && x.id === v) m = true }); return m }

function isAbort(ns: Node[]): boolean {
	const [a, b] = ns
	if (!a || a.k !== 'stmt' || a.s.k !== 'call' || a.s.t.k !== 'sys' || a.s.t.name !== 'abort') return false
	return ns.length === 1 || (ns.length === 2 && b.k === 'trap')
}

/** control never reaches the end of the list (return, trap, abort, break, continue, or an if whose both sides never do) */
function noFallThrough(ns: Node[]): boolean {
	const l = ns[ns.length - 1]
	if (!l) return false
	if (l.k === 'return' || l.k === 'trap' || l.k === 'break' || l.k === 'continue') return true
	if (l.k === 'stmt') return l.s.k === 'trap' || (l.s.k === 'call' && l.s.t.k === 'sys' && l.s.t.name === 'abort')
	return l.k === 'if' && noFallThrough(l.then) && noFallThrough(l.else)
}

/** `y = e` with e free of loads (frame loads allowed with `frameOk`), calls and traps, keeping x and the variables of p */
function isPureSet(n: Node, x: number, pv: Set<number>, frameOk?: number): boolean {
	if (n.k !== 'stmt' || n.s.k !== 'set' || n.s.dst === x || pv.has(n.s.dst) || mentions(n.s.e, x)) return false
	const fx = hasSideEffectsOrMem(frameOk !== undefined ? withoutFrameLoads(n.s.e, frameOk) : n.s.e)
	return !fx.load && !fx.call && !fx.trap
}

/** [st64(p + 8, ld64(p + 8) - 1)] */
function isWeakDec(ns: Node[], p: Expr): boolean {
	if (ns.length !== 1 || ns[0].k !== 'stmt') return false
	const s = ns[0].s
	if (s.k !== 'store' || s.size !== 8) return false
	const [pb, po] = split(p), [qb, qo] = split(s.addr)
	if (!exprEq(pb, qb) || qo !== BigInt.asUintN(64, po + 8n)) return false
	const v = s.v
	return v.k === 'bin' && v.op === 'add' && v.b.k === 'const' && v.b.v === M64 && v.a.k === 'load' && v.a.size === 8 && exprEq(v.a.addr, s.addr)
}
const split = (e: Expr): [Expr, bigint] => (e.k === 'bin' && e.op === 'add' && e.b.k === 'const' ? [e.a, e.b.v] : [e, 0n])

function rewrite(ns: Node[], uses: Map<number, number>, fp?: number): Node[] {
	let out: Node[] = ns.map(n => {
		switch (n.k) {
			case 'if': return { ...n, then: rewrite(n.then, uses, fp), else: rewrite(n.else, uses, fp) }
			case 'block': case 'loop': return { ...n, body: rewrite(n.body, uses, fp) } as Node
			case 'switch': return { ...n, cases: n.cases.map(c => ({ ...c, body: rewrite(c.body, uses, fp) })) }
			default: return n
		}
	})
	for (let j = 0; j + 1 < out.length; j++) {
		// st64(p, x + 1); if (x == -1) { abort() }   |   st64(p, x - 1); if (x == 1) { st64(p + 8, ld64(p + 8) - 1) }
		const st = out[j]
		if (st.k !== 'stmt' || st.s.k !== 'store' || st.s.size !== 8 || hasCall(st.s.addr)) continue
		const v = st.s.v, p = st.s.addr
		if (!(v.k === 'bin' && v.op === 'add' && v.a.k === 'var' && v.b.k === 'const' && (v.b.v === 1n || v.b.v === M64))) continue
		const x = v.a.id, inc = v.b.v === 1n
		const pv = new Set<number>(); walkExpr(p, y => { if (y.k === 'var') pv.add(y.id) })
		// assignments of pure values between the store and the check commute with both: they go first
		const pIsFrame = fp !== undefined && (p.k === 'var' ? p.id === fp : p.k === 'bin' && p.op === 'add' && p.a.k === 'var' && p.a.id === fp)
		let k = j + 1
		while (k < out.length && isPureSet(out[k], x, pv, pIsFrame ? undefined : fp)) k++
		const br = out[k]
		if (!br) continue
		if (br.k !== 'if' || br.else.length || uses.get(x) !== 3) continue
		const c = br.c
		// inverted: if (x != -1) { B } abort(), B never falling through
		const abortEnd = out[k + 2]?.k === 'trap' ? k + 3 : k + 2
		const inverted = inc && c.k === 'cmp' && c.op === 'ne' && c.a.k === 'var' && c.a.id === x && c.b.k === 'const' && c.b.v === M64
			&& noFallThrough(br.then) && isAbort(out.slice(k + 1, abortEnd))
		if (!inverted) {
			if (!(c.k === 'cmp' && c.op === 'eq' && c.a.k === 'var' && c.a.id === x && c.b.k === 'const' && c.b.v === (inc ? M64 : 1n))) continue
			if (inc ? !isAbort(br.then) : !isWeakDec(br.then, p)) continue
		}
		// the load of x: in this list, followed only by variable assignments that keep p and x
		let i = j - 1
		for (; i >= 0; i--) {
			const m = out[i]
			if (m.k !== 'stmt' || m.s.k !== 'set' || hasCall(m.s.e)) { i = -1; break }
			if (m.s.dst === x) break
			if (mentions(m.s.e, x) || pv.has(m.s.dst)) { i = -1; break }
		}
		const def = i >= 0 ? out[i] : undefined
		const adjacent = def?.k === 'stmt' && def.s.k === 'set' && def.s.e.k === 'load' && def.s.e.size === 8 && exprEq(def.s.e.addr, p)
		const args = adjacent ? [p] : [p, { k: 'var', id: x } as Expr]
		const call: Node = { k: 'stmt', s: { k: 'eval', e: { k: 'fn', name: inc ? 'rc_inc' : 'rc_dec', args }, pc: st.s.pc } }
		const moved = out.slice(j + 1, k)
		// inverted form: the if's body follows the helper; the abort after it is the helper's
		const after = inverted ? [...br.then, ...out.slice(abortEnd)] : out.slice(k + 1)
		if (adjacent) { out = [...out.slice(0, i), ...out.slice(i + 1, j), ...moved, call, ...after]; j += moved.length - 1 }
		else { out = [...out.slice(0, j), ...moved, call, ...after]; j += moved.length }
	}
	return out
}
