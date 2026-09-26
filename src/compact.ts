// Final exact compaction of statement runs (applied after all optimizations):
//   stN(p, a); stN(p+N, b); ...            -> stN(p, a, b, ...)   (values pure)
//   st64(d, ld64(s)); st64(d+8, ld64(s+8)) -> copy(d, s, 16)      (ascending word copies)
//   st64(d+8, ld64(s+8)); st64(d, ld64(s)) -> copyr(d, s, 16)     (descending word copies)
// preceded by sinkFrameLoads (loads of the own frame moved to their one use, see below); frame stores that
// extend one range are first gathered (gatherFrame), e.g. a key copied as st64(s40, ld64(q)) after
// copyr(s38, q + 8, 0x18) with other frame stores in between becomes one copyr(s40, q, 0x20).
// Runs into the stack frame (fp + const) may appear in any order: frame stores cannot fault and
// stores to disjoint addresses commute; for copies the source and destination ranges must be
// disjoint frame ranges (then order is irrelevant too).
import type { VarFunc } from './dataflow.ts'
import { type Expr, type Stmt, exprEq, hasSideEffectsOrMem, walkExpr, mapExpr, isMemIntrinsic, isDivOp, safeDivisor } from './ir.ts'
import { stmtExprs, mapStmtExprs, stmtInfo } from './simplify.ts'

function baseOff(e: Expr): [Expr, bigint] {
	if (e.k === 'bin' && e.op === 'add' && e.b.k === 'const') return [e.a, BigInt.asIntN(64, e.b.v)]
	return [e, 0n]
}
const pure = (e: Expr) => { const f = hasSideEffectsOrMem(e); return !f.load && !f.call && !f.trap }
const mk = (base: Expr, off: bigint): Expr => (off === 0n ? base : { k: 'bin', op: 'add', a: base, b: { k: 'const', v: BigInt.asUintN(64, off) } })

type Store = Extract<Stmt, { k: 'store' }>

/**
 * Move `v = <loads of the own frame>` down to the one use of v in its block, past stores that cannot
 * write the loaded bytes (default memory model: the frame is only accessed through frame-pointer-derived
 * addresses, so stores through a parameter never reach it). A load inside the 4 KiB frame cannot fault and
 * has no effect, so evaluating it later reads the same value. Only definitions whose value is not needed
 * after that use (v redefined later in the block, or the block ends the function) move. This turns
 * `t = ld64(s); st64(a + 0x10, ld64(s + 8)); st64(a + 8, t)` into word copies that compaction joins.
 */
export function sinkFrameLoads(f: VarFunc) {
	const fp = f.vars.find(v => v.param === 10)?.id
	if (fp === undefined) return
	const defd = new Set<number>()
	for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'set' || s.k === 'call') && s.dst >= 0) defd.add(s.dst)
	// parameters never reassigned: addresses the caller passed (never into this function's frame)
	const param = (e: Expr) => e.k === 'var' && e.id !== fp && (f.vars[e.id]?.param >= 1 && f.vars[e.id].param <= 5 || f.vars[e.id]?.param >= 100) && !defd.has(e.id)
	/** frame byte ranges read by e, when its only memory reads are 8/4/2/1-byte loads of the own frame and it cannot trap or call */
	const frameReads = (e: Expr): [bigint, bigint][] | undefined => {
		const fx = hasSideEffectsOrMem(e)
		if (fx.call) return undefined
		const r: [bigint, bigint][] = []
		let ok = true
		walkExpr(e, x => {
			if (x.k === 'fn' && isMemIntrinsic(x.name)) ok = false
			if (x.k === 'bin' && isDivOp(x.op) && !safeDivisor(x.op, x.b)) ok = false
			if (x.k !== 'load') return
			const [lb, lo] = baseOff(x.addr)
			if (!(lb.k === 'var' && lb.id === fp && lo >= -0x1000n && lo + BigInt(x.size) <= 0n)) ok = false
			else r.push([lo, lo + BigInt(x.size)])
		})
		return ok && r.length ? r : undefined
	}
	const uses = (s: Stmt, v: number) => { let n = 0; for (const e of stmtExprs(s)) walkExpr(e, x => { if (x.k === 'var' && x.id === v) n++ }); return n }
	for (const b of f.blocks) {
		const ends = b.term.k === 'ret' || b.term.k === 'trap'
		for (let i = 0; i < b.stmts.length; i++) {
			const s = b.stmts[i]
			if (s.k !== 'set' || f.vars[s.dst]?.param >= 0) continue
			const rd = frameReads(s.e)
			if (!rd) continue
			const reads = new Set<number>()
			walkExpr(s.e, x => { if (x.k === 'var') reads.add(x.id) })
			let at = -1, j = i + 1
			for (; j < b.stmts.length; j++) {
				const t = b.stmts[j]
				const n = uses(t, s.dst)
				if (n) { at = n === 1 ? j : -1; break }
				if ((t.k === 'set' || t.k === 'call') && (t.dst === s.dst || reads.has(t.dst))) break
				if (t.k === 'call' || t.k === 'trap' || stmtInfo(t).call) break
				if (t.k === 'store' || t.k === 'stores' || t.k === 'copy') {
					const [db, dof] = baseOff(t.k === 'copy' ? t.dst : t.addr)
					if (param(db)) continue
					const w = BigInt(t.k === 'store' ? t.size : t.k === 'stores' ? t.size * t.vals.length : t.n)
					if (!(db.k === 'var' && db.id === fp) || rd.some(([lo, hi]) => dof < hi && lo < dof + w)) break
				}
			}
			if (at < 0) continue
			// the value must be dead after its use: redefined later in the block (not read before), or the block ends the function
			let dead = false
			const term: Expr | null = b.term.k === 'br' ? b.term.c : b.term.k === 'ret' ? b.term.e : null
			const u = b.stmts[at]
			if ((u.k === 'set' || u.k === 'call') && u.dst === s.dst) dead = true
			for (let k = at + 1; k < b.stmts.length && !dead; k++) {
				const t = b.stmts[k]
				if (uses(t, s.dst)) break
				if ((t.k === 'set' || t.k === 'call') && t.dst === s.dst) dead = true
			}
			if (!dead && ends) {
				dead = true
				for (let k = at + 1; k < b.stmts.length; k++) if (uses(b.stmts[k], s.dst)) dead = false
				if (term) walkExpr(term, x => { if (x.k === 'var' && x.id === s.dst) dead = false })
			}
			if (!dead) continue
			const e = s.e
			b.stmts[at] = mapStmtExprs(u, x => mapExpr(x, y => (y.k === 'var' && y.id === s.dst ? e : y)))
			b.stmts.splice(i, 1)
			i--
		}
	}
}

export function compactStores(f: VarFunc) {
	const fp = f.vars.find(v => v.param === 10)?.id
	const isFp = (b: Expr) => fp !== undefined && b.k === 'var' && b.id === fp
	for (const b of f.blocks) {
		const out: Stmt[] = []
		const st = b.stmts
		for (let i = 0; i < st.length; i++) {
			const s = st[i]
			// a load from the own frame [fp - 0x1000, fp) cannot fault: evaluating it for effect is a no-op
			if (s.k === 'eval' && s.e.k === 'load') {
				const [lb, lo] = baseOff(s.e.addr)
				if (isFp(lb) && lo >= -0x1000n && lo + BigInt(s.e.size) <= 0n) continue
			}
			if (s.k !== 'store') { out.push(s); continue }
			const [db] = baseOff(s.addr)
			// maximal window of stores with the same destination base
			let j = i + 1
			while (j < st.length && st[j].k === 'store' && exprEq(baseOff((st[j] as Store).addr)[0], db)) j++
			const win = st.slice(i, j) as Store[]
			const done = compactWindow(isFp(db) ? gatherFrame(win, fp!) : win, isFp(db))
			out.push(...done)
			i = j - 1
		}
		// `void ldN(p)` (kept for its possible fault) right before a branch whose condition first
		// loads the same bytes: that load faults exactly when the dropped one would
		const last = out[out.length - 1]
		if (last?.k === 'eval' && last.e.k === 'load' && b.term.k === 'br') {
			const fl = firstLoad(b.term.c)
			if (fl && fl.size >= last.e.size && exprEq(fl.addr, last.e.addr)) out.pop()
		}
		b.stmts = out
	}
}

/** The load an expression performs first, when nothing before it can trap or have effects. */
function firstLoad(e: Expr): Extract<Expr, { k: 'load' }> | null {
	switch (e.k) {
		case 'load': return pure(e.addr) ? e : firstLoad(e.addr)
		case 'cmp': case 'bin': case 'land': case 'lor': return pure(e.a) ? firstLoad(e.b) : firstLoad(e.a)
		case 'ext': case 'lnot': case 'not': case 'neg': case 'bswap': return firstLoad(e.a)
		case 'fn':
			if ((e.name === 'keyeq' || (e.name === 'memeq' && e.args[2].k === 'const' && e.args[2].v > 0n)) && e.args.every(pure)) return { k: 'load', size: 8, addr: e.args[0] }
			return null
		default: return null
	}
}

/**
 * Frame stores reordered so that stores extending one contiguous range come together (they then compact
 * into one run): a later store moves before the stores it skips when both write disjoint frame bytes, neither
 * value reads the bytes the other writes, no value calls, and at most one of the two can fault (a load
 * outside the frame): frame stores cannot fault, and the frame is only observable at calls.
 */
function gatherFrame(win: Store[], fp: number): Store[] {
	if (win.length < 3) return win
	const info = win.map(s => {
		const o = baseOff(s.addr)[1]
		const fx = hasSideEffectsOrMem(s.v)
		const reads: [bigint, bigint][] = []
		let far = false
		walkExpr(s.v, x => {
			if (x.k !== 'load') return
			const [b, lo] = baseOff(x.addr)
			if (b.k === 'var' && b.id === fp && lo >= -0x1000n && lo + BigInt(x.size) <= 0n) reads.push([lo, lo + BigInt(x.size)])
			else far = true
		})
		// (only the own frame [fp - 0x1000, fp) is unobservable between calls: fp + 0 and above are the caller's)
		const own = o >= -0x1000n && o + BigInt(s.size) <= 0n
		return { o, hi: o + BigInt(s.size), call: fx.call, fault: far || (fx.trap && !fx.load), reads, own }
	})
	const overlaps = (r: [bigint, bigint][], lo: bigint, hi: bigint) => r.some(([a, b]) => a < hi && lo < b)
	const movable = (j: number, m: number) => {
		const a = info[j], b = info[m]
		return a.own && b.own && !a.call && !b.call && !(a.fault && b.fault) && (a.hi <= b.o || b.hi <= a.o) && !overlaps(a.reads, b.o, b.hi) && !overlaps(b.reads, a.o, a.hi)
	}
	const used = new Array<boolean>(win.length).fill(false)
	const out: Store[] = []
	for (let k = 0; k < win.length; k++) {
		if (used[k]) continue
		const cl = [k], skipped: number[] = []
		let lo = info[k].o, hi = info[k].hi
		for (let j = k + 1; j < win.length; j++) {
			if (used[j]) continue
			const x = info[j]
			if (win[j].size === win[k].size && (x.o === hi || x.hi === lo) && skipped.every(m => movable(j, m))) {
				cl.push(j); lo = x.o < lo ? x.o : lo; hi = x.hi > hi ? x.hi : hi
			} else skipped.push(j)
		}
		if (cl.length < 2 || !tryRun(cl.map(i => win[i]), true)) { used[k] = true; out.push(win[k]); continue }
		for (const i of cl) { used[i] = true; out.push(win[i]) }
	}
	return out
}

/** Compact a window of consecutive stores that share a base address expression. */
function compactWindow(win: Store[], frame: boolean): Stmt[] {
	const out: Stmt[] = []
	const offs = win.map(s => baseOff(s.addr)[1])
	const basePure = win.length > 0 && pure(baseOff(win[0].addr)[0])
	let k = 0
	while (k < win.length) {
		// try the longest prefix starting at k that forms a contiguous run (any order if frame)
		let best: { n: number; st: Stmt } | null = null
		// Necessary conditions for tryRun to succeed on win[k..k+n) (checked cheaply first; tryRun
		// still decides): pure base, one store size, distinct offsets aligned to that size, spanning
		// exactly n slots, and strictly monotonic as written unless frame. All but the span hold for
		// a prefix iff they hold for every shorter prefix, which bounds n by `lim`.
		let lim = basePure ? win.length - k : 0
		{
			const size = win[k].size, sz = BigInt(size), o0 = offs[k], seen = new Set<bigint>([o0])
			// (outside the frame: strictly ascending, or strictly descending for a copyr)
			const down = !frame && k + 1 < win.length && offs[k + 1] < o0
			for (let i = k + 1; i < k + lim; i++) {
				const o = offs[i]
				if (win[i].size !== size || (o - o0) % sz !== 0n || seen.has(o) || (!frame && (down ? o >= offs[i - 1] : o <= offs[i - 1]))) { lim = i - k; break }
				seen.add(o)
			}
		}
		let lo = offs[k], hi = offs[k]
		const span: boolean[] = []
		for (let n = 1; n <= lim; n++) {
			const o = offs[k + n - 1]
			if (o < lo) lo = o
			if (o > hi) hi = o
			span[n] = hi - lo === BigInt((n - 1) * win[k].size)
		}
		for (let n = lim; n >= 2; n--) {
			if (!span[n]) continue
			const r = tryRun(win.slice(k, k + n), frame)
			if (r) { best = { n, st: r }; break }
		}
		if (best) { out.push(best.st); k += best.n } else { out.push(win[k]); k++ }
	}
	return out
}

function tryRun(ss: Store[], frame: boolean): Stmt | null {
	const [base] = baseOff(ss[0].addr)
	const size = ss[0].size
	if (!pure(base)) return null
	const offs = ss.map(s => baseOff(s.addr)[1])
	if (ss.some(s => s.size !== size)) return null
	// only the function's own frame [fp - 0x1000, fp) is private and never faults
	if (frame && ss.some((s, i) => offs[i] < -0x1000n || offs[i] + BigInt(size) > 0n)) frame = false
	// ordering: ascending in program order, or any order for frame stores with distinct offsets
	const order = ss.map((_, i) => i).sort((a, b) => (offs[a] < offs[b] ? -1 : 1))
	const ascendingAsWritten = order.every((v, i) => v === i)
	// (strictly descending word copies are copyr, whatever the memory: same loads and stores in the same order)
	const descendingCopy = !ascendingAsWritten && size === 8 && order.every((v, i) => v === order.length - 1 - i) && ss.every(s => s.v.k === 'load' && s.v.size === 8)
	if (!ascendingAsWritten && !frame && !descendingCopy) return null
	for (let i = 1; i < order.length; i++) if (offs[order[i]] !== offs[order[i - 1]] + BigInt(size)) return null
	const lo = offs[order[0]]
	// copy run
	if (size === 8 && ss.every(s => s.v.k === 'load' && s.v.size === 8)) {
		const srcs = ss.map(s => baseOff((s.v as { addr: Expr }).addr))
		const sb = srcs[0][0]
		if (pure(sb) && srcs.every(([b2, o], i) => exprEq(b2, sb) && o - offs[i] === srcs[0][1] - offs[0])) {
			const slo = srcs[0][1] - offs[0] + lo
			const n = BigInt(ss.length * 8)
			if (ascendingAsWritten) return { k: 'copy', dst: mk(base, lo), src: mk(sb, slo), n: ss.length * 8, pc: ss[0].pc }
			if (order.every((v, i) => v === order.length - 1 - i)) return { k: 'copy', dst: mk(base, lo), src: mk(sb, slo), n: ss.length * 8, pc: ss[0].pc, rev: true }
			// any other order: only frame-to-frame with disjoint ranges (no faults, no aliasing)
			if (!exprEq(sb, base) || !(slo + n <= lo || lo + n <= slo)) return null
			return { k: 'copy', dst: mk(base, lo), src: mk(sb, slo), n: ss.length * 8, pc: ss[0].pc }
		}
	}
	if (!ss.every(s => pure(s.v)) || (!ascendingAsWritten && !frame)) return null
	return { k: 'stores', size, addr: mk(base, lo), vals: order.map(i => ss[i].v), pc: ss[0].pc }
}
