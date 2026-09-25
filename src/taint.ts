// Instruction-data taint (comments only: nothing here changes semantics).
//
// Which values may derive from the instruction data: a flow-insensitive, interprocedural propagation
// from the handlers' instruction-data pointers (Anchor: the argument after the discriminator).
//   ptr: points into instruction data (or to a frame object holding such values)
//   val: a value read from it, or computed from such values
// Loads through tainted pointers are values; arithmetic keeps taint (pointer + offset stays a pointer);
// stores into the current frame taint the frame bytes they write, and loads of those bytes are
// tainted; a call argument that is tainted, or the address of a frame object holding tainted bytes,
// taints the callee's parameter. Call results and writes made by callees are not followed. It is an
// over-approximation along the paths it follows (any store anywhere in the function counts) and
// misses flows it does not follow: a hint for review, tagged [heur].
import type { VarFunc } from './dataflow.ts'
import { type Expr, walkExpr } from './ir.ts'

export type TaintKind = 'ptr' | 'val'
export interface FnTaint { vars: Map<number, TaintKind>; frame: [number, number, TaintKind][] }

export function instructionTaint(funcs: Map<number, { f: VarFunc }>, seeds: Map<number, number[]>): Map<number, FnTaint> {
	const res = new Map<number, FnTaint>()
	const get = (pc: number) => { let t = res.get(pc); if (!t) res.set(pc, (t = { vars: new Map(), frame: [] })); return t }
	const queue = new Set<number>()
	for (const [pc, vs] of seeds) { const t = get(pc); for (const v of vs) t.vars.set(v, 'ptr'); queue.add(pc) }
	const join = (a: TaintKind | undefined, b: TaintKind | undefined): TaintKind | undefined => (a === 'val' || b === 'val' ? 'val' : a ?? b)
	let budget = 20000
	while (queue.size && budget-- > 0) {
		const pc = queue.values().next().value as number
		queue.delete(pc)
		const bf = funcs.get(pc)
		if (!bf) continue
		const f = bf.f, t = get(pc)
		const fp = f.vars.find(v => v.param === 10)?.id
		const fo = (e: Expr): number | undefined => (e.k === 'var' && e.id === fp ? 0 : e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const' ? Number(BigInt.asIntN(64, e.b.v)) : undefined)
		const frameAt = (o: number, n: number): TaintKind | undefined => { let k: TaintKind | undefined; for (const [lo, hi, kk] of t.frame) if (lo < o + n && o < hi) k = join(k, kk); return k }
		// frame objects: an address passed on covers the bytes up to the next frame address the function uses
		const bases = new Set<number>()
		const noteBase = (e: Expr) => walkExpr(e, x => { const o = fo(x); if (o !== undefined) bases.add(o) })
		for (const b of f.blocks) for (const s of b.stmts) {
			if (s.k === 'call') s.args.forEach(noteBase)
			else if (s.k === 'copy') { noteBase(s.dst); noteBase(s.src) }
			else if (s.k === 'stores') noteBase(s.addr)
		}
		const sortedBases = [...bases].sort((a, b) => a - b)
		const extent = (o: number) => { const nx = sortedBases.find(x => x > o); return Math.min(nx === undefined ? 0x100 : nx - o, 0x400) }
		const taint = (e: Expr): TaintKind | undefined => {
			switch (e.k) {
				case 'var': return t.vars.get(e.id)
				case 'const': case 'undef': case 'reg': return undefined
				case 'load': {
					const o = fo(e.addr)
					if (o !== undefined) return frameAt(o, e.size)
					return taint(e.addr) ? 'val' : undefined
				}
				case 'bin': {
					const a = taint(e.a), b = taint(e.b)
					if ((e.op === 'add' || e.op === 'sub') && (a === 'ptr' || b === 'ptr') && a !== 'val' && b !== 'val') return 'ptr'
					return a || b ? 'val' : undefined
				}
				case 'call': return undefined
				default: {
					let k: TaintKind | undefined
					walkExpr(e, x => { if (x !== e && (x.k === 'var' || x.k === 'load')) k = join(k, taint(x) ? 'val' : undefined) })
					return k
				}
			}
		}
		for (let changed = true, it = 0; changed && it < 8; it++) {
			changed = false
			const setVar = (v: number, k: TaintKind | undefined) => { if (!k) return; const o = t.vars.get(v), n = join(o, k); if (n !== o) { t.vars.set(v, n!); changed = true } }
			const setFrame = (o: number, n: number, k: TaintKind | undefined) => { if (!k || t.frame.some(([lo, hi, kk]) => lo <= o && o + n <= hi && (kk === k || kk === 'val'))) return; t.frame.push([o, o + n, k]); changed = true }
			for (const b of f.blocks) for (const s of b.stmts) {
				if (s.k === 'set') setVar(s.dst, taint(s.e))
				else if (s.k === 'store') { const o = fo(s.addr); if (o !== undefined) setFrame(o, s.size, taint(s.v)) }
				else if (s.k === 'stores') { const o = fo(s.addr); if (o !== undefined) s.vals.forEach((v, i) => setFrame(o + i * s.size, s.size, taint(v))) }
				else if (s.k === 'copy') {
					const o = fo(s.dst), so = fo(s.src)
					if (o === undefined) continue
					if (so !== undefined) { for (const [lo, hi, k] of [...t.frame]) if (lo < so + s.n && so < hi) setFrame(Math.max(lo, so) - so + o, Math.min(hi, so + s.n) - Math.max(lo, so), k) }
					else if (taint(s.src)) setFrame(o, s.n, 'val')
				}
			}
		}
		// calls: tainted arguments (or frame objects holding tainted bytes) taint the callee's parameter
		const visitCall = (callee: number, args: Expr[]) => {
			const cf = funcs.get(callee)?.f
			if (!cf) return
			args.forEach((a, i) => {
				const o = fo(a)
				const k = o !== undefined ? (frameAt(o, extent(o)) ? 'ptr' : undefined) : taint(a)
				if (!k) return
				const reg = cf.stackArgs ? (i < 4 ? i + 1 : 100 + (i - 4)) : i + 1
				const pv = cf.vars.find(v => v.param === reg)
				if (!pv) return
				const ct = get(callee), old = ct.vars.get(pv.id), n = join(old, k)
				if (n !== old) { ct.vars.set(pv.id, n!); queue.add(callee) }
			})
		}
		for (const b of f.blocks) for (const s of b.stmts) {
			if (s.k === 'call' && s.t.k === 'fn') visitCall(s.t.pc, s.args)
			if (s.k === 'set' || s.k === 'store' || s.k === 'eval') walkExpr(s.k === 'set' ? s.e : s.k === 'store' ? s.v : s.e, x => { if (x.k === 'call' && x.t.k === 'fn') visitCall(x.t.pc, x.args) })
		}
	}
	return res
}

/** Does expression e (in function with taint t) derive from instruction data? */
export function exprTainted(t: FnTaint | undefined, e: Expr, fp: number | undefined): boolean {
	if (!t) return false
	let hit = false
	walkExpr(e, x => {
		if (x.k === 'var' && t.vars.has(x.id) && x.id !== fp) hit = true
		if (x.k === 'load' && x.addr.k === 'bin' && x.addr.op === 'add' && x.addr.a.k === 'var' && x.addr.a.id === fp && x.addr.b.k === 'const') {
			const o = Number(BigInt.asIntN(64, x.addr.b.v))
			if (t.frame.some(([lo, hi]) => lo < o + x.size && o < hi)) hit = true
		}
	})
	return hit
}
