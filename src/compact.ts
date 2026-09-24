// Final exact compaction of statement runs (applied after all optimizations):
//   stN(p, a); stN(p+N, b); ...            -> stores run (values must be pure: order-independent)
//   st64(d, ld64(s)); st64(d+8, ld64(s+8)) -> copy(d, s, 16)   (ascending word copies, same order)
import type { VarFunc } from './dataflow.ts'
import { type Expr, type Stmt, exprEq, hasSideEffectsOrMem } from './ir.ts'

/** Split an address into (base, constant offset). */
function baseOff(e: Expr): [Expr, bigint] {
	if (e.k === 'bin' && e.op === 'add' && e.b.k === 'const') return [e.a, BigInt.asIntN(64, e.b.v)]
	return [e, 0n]
}
const pure = (e: Expr) => { const f = hasSideEffectsOrMem(e); return !f.load && !f.call && !f.trap }
const mk = (base: Expr, off: bigint): Expr => (off === 0n ? base : { k: 'bin', op: 'add', a: base, b: { k: 'const', v: BigInt.asUintN(64, off) } })

export function compactStores(f: VarFunc) {
	for (const b of f.blocks) {
		const out: Stmt[] = []
		const st = b.stmts
		for (let i = 0; i < st.length; i++) {
			const s = st[i]
			if (s.k !== 'store') { out.push(s); continue }
			const [db, doff] = baseOff(s.addr)
			// copy run: 8-byte store of an 8-byte load
			if (s.size === 8 && s.v.k === 'load' && s.v.size === 8) {
				const [sb, soff] = baseOff(s.v.addr)
				let j = i + 1
				while (j < st.length) {
					const t = st[j]
					if (t.k !== 'store' || t.size !== 8 || t.v.k !== 'load' || t.v.size !== 8) break
					const [tdb, tdo] = baseOff(t.addr), [tsb, tso] = baseOff(t.v.addr)
					const k = BigInt(j - i) * 8n
					if (!exprEq(tdb, db) || !exprEq(tsb, sb) || tdo !== doff + k || tso !== soff + k) break
					j++
				}
				if (j - i >= 2 && pure(db) && pure(sb)) {
					out.push({ k: 'copy', dst: s.addr, src: s.v.addr, n: (j - i) * 8, pc: s.pc })
					i = j - 1
					continue
				}
			}
			// store run: contiguous, same width, order-independent values
			if (pure(s.v) && pure(db)) {
				let j = i + 1
				while (j < st.length) {
					const t = st[j]
					if (t.k !== 'store' || t.size !== s.size || !pure(t.v)) break
					const [tdb, tdo] = baseOff(t.addr)
					if (!exprEq(tdb, db) || tdo !== doff + BigInt((j - i) * s.size)) break
					j++
				}
				if (j - i >= 2) {
					out.push({ k: 'stores', size: s.size, addr: s.addr, vals: st.slice(i, j).map(x => (x as Extract<Stmt, { k: 'store' }>).v), pc: s.pc })
					i = j - 1
					continue
				}
			}
			out.push(s)
		}
		b.stmts = out
	}
	void mk
}
