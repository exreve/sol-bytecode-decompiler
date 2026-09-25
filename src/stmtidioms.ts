// Statement-level idioms on the structured body (after all analyses; printed as helper calls):
//
//   x = ld64(p); …; st64(p, x + 1); if (x == -1) { abort() }   ->   rc_inc(p)
//   st64(p, x + 1); if (x == -1) { abort() }                    ->   rc_inc(p, x)
//
// (Rc::clone / Rc strong-count increment: *p += 1, aborting when the count was u64::MAX.)
// The helper loads, stores and aborts exactly like the statements it replaces. For the first form,
// statements between the load and the store may only assign variables (no call, no store: at most
// a load or a trapping division, whose fault aborts either way before any effect) and must neither
// read x nor assign a variable of p, so performing the load right before the store reads the same
// word. In both forms x has no other use.
import type { Node } from './structure.ts'
import { type Expr, walkExpr, exprEq, M64 } from './ir.ts'

export function statementIdioms(body: Node[]): Node[] {
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
	return rewrite(body, uses)
}

const hasCall = (e: Expr) => { let c = false; walkExpr(e, x => { if (x.k === 'call') c = true }); return c }
const mentions = (e: Expr, v: number) => { let m = false; walkExpr(e, x => { if (x.k === 'var' && x.id === v) m = true }); return m }

function isAbort(ns: Node[]): boolean {
	const [a, b] = ns
	if (!a || a.k !== 'stmt' || a.s.k !== 'call' || a.s.t.k !== 'sys' || a.s.t.name !== 'abort') return false
	return ns.length === 1 || (ns.length === 2 && b.k === 'trap')
}

function rewrite(ns: Node[], uses: Map<number, number>): Node[] {
	let out: Node[] = ns.map(n => {
		switch (n.k) {
			case 'if': return { ...n, then: rewrite(n.then, uses), else: rewrite(n.else, uses) }
			case 'block': case 'loop': return { ...n, body: rewrite(n.body, uses) } as Node
			case 'switch': return { ...n, cases: n.cases.map(c => ({ ...c, body: rewrite(c.body, uses) })) }
			default: return n
		}
	})
	for (let j = 0; j + 1 < out.length; j++) {
		// st64(p, x + 1); if (x == -1) { abort() }
		const st = out[j], br = out[j + 1]
		if (st.k !== 'stmt' || st.s.k !== 'store' || st.s.size !== 8 || hasCall(st.s.addr)) continue
		const v = st.s.v, p = st.s.addr
		if (!(v.k === 'bin' && v.op === 'add' && v.a.k === 'var' && v.b.k === 'const' && v.b.v === 1n)) continue
		const x = v.a.id
		if (br.k !== 'if' || br.else.length || !isAbort(br.then) || uses.get(x) !== 3) continue
		const c = br.c
		if (!(c.k === 'cmp' && c.op === 'eq' && c.a.k === 'var' && c.a.id === x && c.b.k === 'const' && c.b.v === M64)) continue
		// the load of x: in this list, followed only by variable assignments that keep p and x
		const pv = new Set<number>(); walkExpr(p, y => { if (y.k === 'var') pv.add(y.id) })
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
		const call: Node = { k: 'stmt', s: { k: 'eval', e: { k: 'fn', name: 'rc_inc', args }, pc: st.s.pc } }
		if (adjacent) { out = [...out.slice(0, i), ...out.slice(i + 1, j), call, ...out.slice(j + 2)]; j-- }
		else out = [...out.slice(0, j), call, ...out.slice(j + 2)]
	}
	return out
}
