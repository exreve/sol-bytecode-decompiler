// Final exact compaction of statement runs (applied after all optimizations):
//   stN(p, a); stN(p+N, b); ...            -> stN(p, a, b, ...)   (values pure)
//   st64(d, ld64(s)); st64(d+8, ld64(s+8)) -> copy(d, s, 16)      (ascending word copies)
// Runs into the stack frame (fp + const) may appear in any order: frame stores cannot fault and
// stores to disjoint addresses commute; for copies the source and destination ranges must be
// disjoint frame ranges (then order is irrelevant too).
import type { VarFunc } from './dataflow.ts'
import { type Expr, type Stmt, exprEq, hasSideEffectsOrMem } from './ir.ts'

function baseOff(e: Expr): [Expr, bigint] {
	if (e.k === 'bin' && e.op === 'add' && e.b.k === 'const') return [e.a, BigInt.asIntN(64, e.b.v)]
	return [e, 0n]
}
const pure = (e: Expr) => { const f = hasSideEffectsOrMem(e); return !f.load && !f.call && !f.trap }
const mk = (base: Expr, off: bigint): Expr => (off === 0n ? base : { k: 'bin', op: 'add', a: base, b: { k: 'const', v: BigInt.asUintN(64, off) } })

type Store = Extract<Stmt, { k: 'store' }>

export function compactStores(f: VarFunc) {
	const fp = f.vars.find(v => v.param === 10)?.id
	const isFp = (b: Expr) => fp !== undefined && b.k === 'var' && b.id === fp
	for (const b of f.blocks) {
		const out: Stmt[] = []
		const st = b.stmts
		for (let i = 0; i < st.length; i++) {
			const s = st[i]
			if (s.k !== 'store') { out.push(s); continue }
			const [db] = baseOff(s.addr)
			// maximal window of stores with the same destination base
			let j = i + 1
			while (j < st.length && st[j].k === 'store' && exprEq(baseOff((st[j] as Store).addr)[0], db)) j++
			const win = st.slice(i, j) as Store[]
			const done = compactWindow(win, isFp(db))
			out.push(...done)
			i = j - 1
		}
		b.stmts = out
	}
}

/** Compact a window of consecutive stores that share a base address expression. */
function compactWindow(win: Store[], frame: boolean): Stmt[] {
	const out: Stmt[] = []
	let k = 0
	while (k < win.length) {
		// try the longest prefix starting at k that forms a contiguous run (any order if frame)
		let best: { n: number; st: Stmt } | null = null
		for (let n = win.length - k; n >= 2; n--) {
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
	if (!ascendingAsWritten && !frame) return null
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
	if (!ss.every(s => pure(s.v))) return null
	return { k: 'stores', size, addr: mk(base, lo), vals: order.map(i => ss[i].v), pc: ss[0].pc }
}
