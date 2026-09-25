// SBF calling convention for more than 5 arguments: the caller stores arguments 5.. at
// [fp - 0x1000 + 8k] of its own frame and passes r5 = fp; the callee reads them via
// ld64(r5 - 0x1000 + 8k). This pass turns that back into ordinary parameters.
//
// Callee side (exact when r5 is used only for such loads and never reassigned):
//   loads become parameter variables holding the value at entry. The argument area of the
//   caller's frame is not reachable from the callee except through r5 (see stack.ts escape
//   model), so the value cannot change between entry and the load.
// Caller side: the call passes the value stored by the latest preceding store in the same
// block when that is provably still the memory content (no intervening call receiving fp, no
// redefinition of the variables involved); otherwise it passes ld64(fp - 0x1000 + 8k) read at
// the call, which is exact by definition.
import type { Program } from './program.ts'
import type { VarFunc } from './dataflow.ts'
import { type Expr, type Stmt, walkExpr, isMemIntrinsic } from './ir.ts'
import { stmtExprs } from './simplify.ts'

const AREA = -0x1000

function fpOff(e: Expr, v: number): number | null {
	if (e.k === 'var' && e.id === v) return 0
	if (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === v && e.b.k === 'const') return Number(BigInt.asIntN(64, e.b.v))
	return null
}

/** Number of stack arguments a function reads through r5, or 0 if it does not follow the pattern. */
function calleeStackArgs(f: VarFunc): number {
	if (f.nparams < 5) return 0
	const ev = f.vars.find(v => v.param === 5)
	if (!ev) return 0
	let ok = true, max = -1
	const visit = (e: Expr, inLoad: boolean): void => {
		if (!ok) return
		if (e.k === 'load') {
			const o = fpOff(e.addr, ev.id)
			if (o !== null) {
				const k = (o - AREA) / 8
				if (e.size !== 8 || !Number.isInteger(k) || k < 0 || k > 32) { ok = false; return }
				max = Math.max(max, k)
				return
			}
			visit(e.addr, true)
			return
		}
		if (e.k === 'var' && e.id === ev.id) { ok = false; return }
		switch (e.k) {
			case 'bin': case 'cmp': case 'land': case 'lor': visit(e.a, inLoad); visit(e.b, inLoad); break
			case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': visit(e.a, inLoad); break
			case 'sel': visit(e.c, inLoad); visit(e.a, inLoad); visit(e.b, inLoad); break
			case 'call': e.args.forEach(a => visit(a, false)); if (e.t.k === 'ind') visit(e.t.e, false); break
			case 'fn': e.args.forEach(a => visit(a, inLoad)); break
		}
	}
	for (const b of f.blocks) {
		for (const s of b.stmts) {
			if ((s.k === 'set' || s.k === 'call') && s.dst === ev.id) return 0
			if (s.k === 'store' && fpOff(s.addr, ev.id) !== null) return 0
			stmtExprs(s).forEach(e => visit(e, false))
		}
		if (b.term.k === 'br') visit(b.term.c, false)
		else if (b.term.k === 'ret' && b.term.e) visit(b.term.e, false)
	}
	return ok && max >= 0 ? max + 1 : 0
}

export function rewriteStackArgs(p: Program, built: Map<number, { f: VarFunc }>) {
	// 1) callee signatures
	const nstack = new Map<number, number>()
	for (const [pc, { f }] of built) {
		const n = calleeStackArgs(f)
		if (n) nstack.set(pc, n)
	}
	for (const [pc, n] of nstack) {
		const f = built.get(pc)!.f
		const ev = f.vars.find(v => v.param === 5)!
		const pv: number[] = []
		for (let k = 0; k < n; k++) { const id = f.vars.length; f.vars.push({ id, reg: -3, param: 100 + k, undef: false }); pv.push(id) }
		const rw = (e: Expr): Expr => {
			if (e.k === 'load') {
				const o = fpOff(e.addr, ev.id)
				if (o !== null) return { k: 'var', id: pv[(o - AREA) / 8] }
				return { ...e, addr: rw(e.addr) }
			}
			switch (e.k) {
				case 'bin': case 'cmp': case 'land': case 'lor': return { ...e, a: rw(e.a), b: rw(e.b) } as Expr
				case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': return { ...e, a: rw(e.a) } as Expr
				case 'sel': return { ...e, c: rw(e.c), a: rw(e.a), b: rw(e.b) }
				case 'call': return { ...e, args: e.args.map(rw), t: e.t.k === 'ind' ? { k: 'ind', e: rw(e.t.e) } : e.t }
				case 'fn': return { ...e, args: e.args.map(rw) }
				default: return e
			}
		}
		for (const b of f.blocks) {
			b.stmts = b.stmts.map(s => mapExprs(s, rw))
			if (b.term.k === 'br') b.term.c = rw(b.term.c)
			else if (b.term.k === 'ret' && b.term.e) b.term.e = rw(b.term.e)
		}
		ev.param = -1 // r5 is no longer a parameter (it is unused now)
		const pf = p.funcs.get(pc)!
		pf.stackArgs = n
	}
	// 2) call sites (call statements and call expressions)
	for (const [, { f }] of built) {
		const fpv = f.vars.find(v => v.param === 10)
		// call expressions: arguments are read from memory at the call (always exact)
		const fixExpr = (e: Expr): Expr => {
					if (e.k === 'call' && e.t.k === 'fn' && nstack.has(e.t.pc)) {
						const n = nstack.get(e.t.pc)!
						const args = e.args.map(fixExpr)
						const r5 = args[4]
						const nparams = 5
						const extra = args.slice(nparams)
						const vals: Expr[] = Array.from({ length: n }, (_, k) => r5 ? { k: 'load', size: 8, addr: { k: 'bin', op: 'add', a: r5, b: { k: 'const', v: BigInt.asUintN(64, BigInt(AREA + 8 * k)) } } } as Expr : { k: 'undef' } as Expr)
						return { ...e, args: [...args.slice(0, 4), ...vals, ...extra] }
					}
					switch (e.k) {
						case 'bin': case 'cmp': case 'land': case 'lor': return { ...e, a: fixExpr(e.a), b: fixExpr(e.b) } as Expr
						case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': return { ...e, a: fixExpr(e.a) } as Expr
						case 'load': return { ...e, addr: fixExpr(e.addr) }
						case 'sel': return { ...e, c: fixExpr(e.c), a: fixExpr(e.a), b: fixExpr(e.b) }
						case 'call': case 'fn': return { ...e, args: e.args.map(fixExpr) }
						default: return e
					}
		}
		const fixTerm = fixExpr
		for (const b of f.blocks) {
			for (let i = 0; i < b.stmts.length; i++) {
				b.stmts[i] = mapExprs(b.stmts[i], fixExpr)
				const s = b.stmts[i]
				const n = s.k === 'call' && s.t.k === 'fn' ? nstack.get(s.t.pc) : undefined
				if (!n || s.k !== 'call') continue
				const r5 = s.args[4]
				const base = r5 && fpv ? fpOff(r5, fpv.id) : null
				const vals: Expr[] = []
				for (let k = 0; k < n; k++) {
					let v: Expr | null = null
					if (base !== null && fpv) {
						const off = base + AREA + 8 * k
						v = latestStore(b.stmts, i, fpv.id, off)
						if (!v) v = { k: 'load', size: 8, addr: { k: 'bin', op: 'add', a: { k: 'var', id: fpv.id }, b: { k: 'const', v: BigInt.asUintN(64, BigInt(off)) } } }
					} else if (r5) {
						v = { k: 'load', size: 8, addr: { k: 'bin', op: 'add', a: r5, b: { k: 'const', v: BigInt.asUintN(64, BigInt(AREA + 8 * k)) } } }
					} else v = { k: 'undef' }
					vals.push(v)
				}
				b.stmts[i] = { ...s, args: [...s.args.slice(0, 4), ...vals] }
			}
			const t = b.term
			if (t.k === 'br') t.c = fixTerm(t.c)
			else if (t.k === 'ret' && t.e) t.e = fixTerm(t.e)
		}
	}
	// 3) outgoing argument-area stores that only fed rewritten calls are dead
	for (const [, { f }] of built) elideArgArea(f)
	return nstack
}

function elideArgArea(f: VarFunc) {
	const fpv = f.vars.find(v => v.param === 10)
	if (!fpv) return
	const inArea = (o: number | null) => o !== null && o >= AREA && o < AREA + 0x100
	let used = false, has = false
	const scan = (e: Expr, _isStoreAddr: boolean): void => {
		const o = fpOff(e, fpv.id)
		if (o !== null) { if (o === 0 || inArea(o)) used = true; return }
		switch (e.k) {
			case 'bin': case 'cmp': case 'land': case 'lor': scan(e.a, false); scan(e.b, false); break
			case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': scan(e.a, false); break
			case 'load': scan(e.addr, false); break
			case 'sel': scan(e.c, false); scan(e.a, false); scan(e.b, false); break
			case 'call': e.args.forEach(a => scan(a, false)); if (e.t.k === 'ind') scan(e.t.e, false); break
			case 'fn': e.args.forEach(a => scan(a, false)); break
		}
	}
	for (const b of f.blocks) {
		for (const s of b.stmts) {
			if ((s.k === 'store' || s.k === 'stores') && inArea(fpOff(s.addr, fpv.id))) { has = true; if (s.k === 'store') scan(s.v, false); else s.vals.forEach(v => scan(v, false)); continue }
			stmtExprs(s).forEach(e => scan(e, false))
		}
		if (b.term.k === 'br') scan(b.term.c, false)
		else if (b.term.k === 'ret' && b.term.e) scan(b.term.e, false)
	}
	if (!has || used) return
	for (const b of f.blocks) b.stmts = b.stmts.flatMap((s): Stmt[] => {
		if ((s.k === 'store' || s.k === 'stores') && inArea(fpOff(s.addr, fpv.id))) {
			const vals = s.k === 'store' ? [s.v] : s.vals
			// keep evaluation of anything that could trap
			return vals.filter(v => { let t = false; walkExpr(v, x => { if (x.k === 'load' || x.k === 'call' || (x.k === 'fn' && isMemIntrinsic(x.name)) || (x.k === 'bin' && /div|rem/.test(x.op))) t = true }); return t }).map(v => ({ k: 'eval', e: v, pc: s.pc }))
		}
		return [s]
	})
	f.argAreaElided = true
}

/** Value stored at fp+off by the latest store before stmts[i], if still valid at i. */
function latestStore(stmts: Stmt[], i: number, fp: number, off: number): Expr | null {
	const defined = new Set<number>()
	for (let j = i - 1; j >= 0; j--) {
		const t = stmts[j]
		if (t.k === 'store' && t.size === 8 && fpOff(t.addr, fp) === off) {
			// the stored expression must mean the same thing at the call: pure, and no variable in it redefined since
			let ok = true
			walkExpr(t.v, x => { if (x.k === 'load' || x.k === 'call' || (x.k === 'fn' && isMemIntrinsic(x.name))) ok = false; if (x.k === 'var' && defined.has(x.id)) ok = false })
			return ok ? t.v : null
		}
		if (t.k === 'stores' && fpOff(t.addr, fp) !== null) {
			const o0 = fpOff(t.addr, fp)!
			const idx = (off - o0) / t.size
			if (t.size === 8 && Number.isInteger(idx) && idx >= 0 && idx < t.vals.length) {
				let ok = true
				walkExpr(t.vals[idx], x => { if (x.k === 'load' || x.k === 'call' || (x.k === 'fn' && isMemIntrinsic(x.name))) ok = false; if (x.k === 'var' && defined.has(x.id)) ok = false })
				return ok ? t.vals[idx] : null
			}
		}
		if (t.k === 'call' || t.k === 'copy' || t.k === 'trap') return null
		if (t.k === 'store' || t.k === 'stores') {
			// another direct frame store elsewhere is fine; anything else might alias
			const o = fpOff(t.addr, fp)
			if (o === null) return null
			const sz = t.k === 'store' ? t.size : t.size * t.vals.length
			if (o < off + 8 && off < o + sz) return null
		}
		if ((t.k === 'set') && t.dst >= 0) defined.add(t.dst)
		if (t.k === 'set' && stmtExprs(t).some(e => { let c = false; walkExpr(e, x => { if (x.k === 'call') c = true }); return c })) return null
	}
	return null
}

function mapExprs(s: Stmt, f: (e: Expr) => Expr): Stmt {
	switch (s.k) {
		case 'set': return { ...s, e: f(s.e) }
		case 'store': return { ...s, addr: f(s.addr), v: f(s.v) }
		case 'eval': return { ...s, e: f(s.e) }
		case 'call': return { ...s, args: s.args.map(f), t: s.t.k === 'ind' ? { k: 'ind', e: f(s.t.e) } : s.t, extra: s.extra?.map(f) }
		case 'stores': return { ...s, addr: f(s.addr), vals: s.vals.map(f) }
		case 'copy': return { ...s, dst: f(s.dst), src: f(s.src) }
		default: return s
	}
}
