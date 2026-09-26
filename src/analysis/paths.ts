// IR-level path conditions and value identity for the program analysis (phase3.ts, phase2.ts).
//   conditions  the branch conditions holding on every path to a point: an edge d -> s of a branching block
//               dominates the point when s dominates it and every other way into s comes from inside s's
//               region (a back edge); walked up the dominator tree of the point's function, then from the
//               call sites up the instruction's call path. Labeled-block exits, early returns and loops are
//               plain edges here. Dominating branches whose both sides reach the point are kept as `before`.
//   values      a canonical key of an expression at a position: variables by their (reaching) definitions,
//               frame slots by the store reaching the load, parameters by the argument at the call site up
//               the call path, sums flattened with their constants folded. Two expressions with the same key
//               hold the same value (up to memory changes between the reads); a key containing another one
//               reads it (a comparison of the operand of an arithmetic operation).
// DERIVED and OVER-APPROXIMATE like everything in security/.
import type { FuncOut, Result } from '../decompile.ts'
import type { Expr, Stmt } from '../ir.ts'
import { cfgOf, decisionBlock, defsOf, callOf, type Cfg, type Defs } from './flow.ts'
import { dominators } from '../structure.ts'
import type { IxCtx, IxOut } from './report.ts'

export interface IrCond {
	fn: number; b: number; c: Expr; pos: number // the branching block, its condition and its position (block << 16 | statements)
	holds?: boolean                            // the side taken on the way (undefined: `before`, either side)
	how: 'branch' | 'loop' | 'before'
	panics?: boolean                           // the other side aborts (a trap, e.g. a panic call) rather than returning
}

interface Ir {
	r: Result
	byPc: Map<number, FuncOut>
	stmts: Map<number, Map<number, [Stmt, number]>> // function -> statement pc -> [statement, position]
	keys: WeakMap<Expr, Map<string, string>>
	ctxIds: WeakMap<IxCtx, number>; nextCtx: number
}
const irMemo = new WeakMap<Result, Ir>()
export function irOf(r: Result): Ir {
	let x = irMemo.get(r)
	if (!x) irMemo.set(r, (x = { r, byPc: new Map(r.funcs.map(f => [f.pc, f])), stmts: new Map(), keys: new WeakMap(), ctxIds: new WeakMap(), nextCtx: 1 }))
	return x
}
const callee = (I: Ir) => ({ f: (pc: number) => I.byPc.get(pc)?.f, name: (pc: number) => I.r.program.funcs.get(pc)?.name ?? '' })
export const defsIn = (I: Ir, fn: number): Defs | undefined => { const fo = I.byPc.get(fn); return fo && defsOf(fo.f, callee(I)) }

/** a statement of a function by its pc (the first copy, in block order), with its position */
export function stmtAt(I: Ir, fn: number, pc: number): [Stmt, number] | undefined {
	let m = I.stmts.get(fn)
	if (!m) {
		m = new Map()
		const fo = I.byPc.get(fn)
		const g = fo && cfgOf(fo)
		if (fo && g) fo.f.blocks.forEach((b, bi) => { if (g.rpo[bi] >= 0) b.stmts.forEach((s, i) => { if (!m!.has(s.pc)) m!.set(s.pc, [s, bi << 16 | i]) }) })
		I.stmts.set(fn, m)
	}
	return m.get(pc)
}

/** the value a single store statement writes, with its position */
export function storedAt(I: Ir, fn: number, pc: number): [Expr, number] | undefined {
	const st = stmtAt(I, fn, pc)
	if (!st) return undefined
	const [s, p] = st
	const v = s.k === 'store' ? s.v : s.k === 'stores' && s.vals.length === 1 ? s.vals[0] : undefined
	return v && [v, p]
}

/** the position of a point: its statement, else the end of the block returning `ret` */
export function posAt(I: Ir, fn: number, pc?: number, ret?: Expr): number | undefined {
	if (pc !== undefined) return stmtAt(I, fn, pc)?.[1]
	const b = blockAt(I, fn, undefined, ret)
	return b === undefined ? undefined : b << 16 | I.byPc.get(fn)!.f.blocks[b].stmts.length
}

// ---- dominators of the part of a native dispatcher an instruction's tags reach ----

const ridom = new WeakMap<IxCtx, Map<number, Int32Array>>()
function idomOf(g: Cfg, fn: number, ctx?: IxCtx): Int32Array {
	if (!ctx?.restricted?.has(fn) || !ctx.allowed) return g.idom
	let m = ridom.get(ctx)
	if (!m) ridom.set(ctx, (m = new Map()))
	let idom = m.get(fn)
	if (!idom) {
		const blocks = g.fo.f.blocks, ok = (x: number) => ctx.allowed!(fn, x)
		const order = [...blocks.keys()].filter(x => g.rpo[x] >= 0 && ok(x)).sort((x, y) => g.rpo[x] - g.rpo[y])
		idom = dominators({ blocks: blocks.map((bl, i) => ({ preds: ok(i) ? bl.preds.filter(ok) : [] })) } as never, order, g.rpo)
		m.set(fn, idom)
	}
	return idom
}
const domBy = (idom: Int32Array, a: number, b: number): boolean => {
	for (let k = 0; k < 100000; k++) { if (a === b) return true; if (b <= 0 || idom[b] < 0 || idom[b] === b) return false; b = idom[b] }
	return false
}

/** The branch conditions on every path to block b of a function (nearest first), and the dominating branches either side of which reaches it. */
export function condsIn(I: Ir, fn: number, b: number, ctx?: IxCtx, max = 80): IrCond[] {
	const fo = I.byPc.get(fn)
	if (!fo) return []
	const g = cfgOf(fo), blocks = fo.f.blocks
	// (in a native dispatcher: the part the instruction's tags reach, unless the point is outside it)
	let idom = idomOf(g, fn, ctx)
	const part = idom !== g.idom && idom[b] >= 0
	if (!part) idom = g.idom
	const ok = (x: number) => g.rpo[x] >= 0 && (!part || ctx!.allowed!(fn, x))
	const out: IrCond[] = []
	for (let x = b, k = 0; x > 0 && k < 4000 && out.length < max; k++) {
		const d = idom[x]
		if (d < 0 || d === x) break
		const t = blocks[d].term
		if (t.k === 'br' && t.t !== t.f) {
			const pos = d << 16 | blocks[d].stmts.length
			const others = (x === t.t || x === t.f) ? blocks[x].preds.filter(p => p !== d && ok(p)) : undefined
			if (others && others.every(p => domBy(idom, x, p))) {
				// (a loop: the edge enters or stays in it; its header's condition)
				const loop = others.length > 0 || blocks[d].preds.some(p => ok(p) && domBy(idom, d, p))
				let y = x === t.t ? t.f : t.t
				for (let j = 0; j < 6 && blocks[y].term.k === 'jmp' && blocks[y].succs.length === 1; j++) y = blocks[y].succs[0]
				out.push({ fn, b: d, c: t.c, pos, holds: x === t.t, how: loop ? 'loop' : 'branch', panics: blocks[y].term.k === 'trap' || undefined })
			} else out.push({ fn, b: d, c: t.c, pos, how: 'before' })
		}
		x = d
	}
	return out
}

/** The block of a point of a function: a statement pc, or a returned expression. */
export function blockAt(I: Ir, fn: number, pc?: number, ret?: Expr): number | undefined {
	const fo = I.byPc.get(fn)
	if (!fo) return undefined
	const g = cfgOf(fo)
	return pc !== undefined ? g.pcBlock.get(pc) : ret ? g.retBlock.get(ret) : undefined
}

/** conditions on the way to block b of a function: in it, then at the call sites up the instruction's call path to its handler */
export function pathTo(I: Ir, ctx: IxCtx | undefined, fn: number, b: number | undefined, max = 80): IrCond[] {
	const out: IrCond[] = []
	let cur = fn
	for (let d = 0; b !== undefined && d < 8 && out.length < max; d++) {
		out.push(...condsIn(I, cur, b, ctx, max - out.length))
		const par = cur === ctx?.handler ? undefined : ctx?.parents.get(cur)
		if (!par) break
		b = blockAt(I, par.fn, par.pc, par.ret)
		cur = par.fn
	}
	return out
}

/** per instruction: the check deciding each branching block (function -> block -> check index) */
const checkMemo = new WeakMap<IxOut, Map<number, Map<number, number>>>()
export function checkAt(I: Ir, ix: IxOut, fn: number, b: number): number | undefined {
	let m = checkMemo.get(ix)
	if (!m) {
		m = new Map()
		ix.checks.forEach((c, ci) => {
			const fo = I.byPc.get(c.fnPc)
			const db = fo && decisionBlock(cfgOf(fo), c.c, c.at.pc, c.passPc)
			if (db === undefined) return
			let x = m!.get(c.fnPc)
			if (!x) m!.set(c.fnPc, (x = new Map()))
			if (!x.has(db)) x.set(db, ci)
		})
		checkMemo.set(ix, m)
	}
	return m.get(fn)?.get(b)
}

// ---- value identity ----

const COMM = new Set(['add', 'mul', 'and', 'or', 'xor', 'eq', 'ne'])
const SWAP: Record<string, string> = { ugt: 'ult', uge: 'ule', sgt: 'slt', sge: 'sle' }
const sconst = (v: bigint) => { const s = BigInt.asIntN(64, v); return s < 0n && s > -0x100000n ? `#-${-s}` : `#${v}` }

/**
 * The canonical key of expression e at position p of function fn (see the header). `ctx` gives the call
 * path parameters are followed up (one call site per function, as the dominance analysis uses).
 */
export function valueKey(I: Ir, ctx: IxCtx | undefined, fn: number, e: Expr, p: number, d = 0): string {
	if (d > 14) return '…'
	let m = I.keys.get(e)
	let ci = ctx ? I.ctxIds.get(ctx) : 0
	if (ci === undefined) I.ctxIds.set(ctx!, (ci = I.nextCtx++))
	const mk = `${fn}|${p}|${ci}`
	const hit = m?.get(mk)
	if (hit !== undefined) return hit
	const k = valueKey0(I, ctx, fn, e, p, d)
	if (!m) I.keys.set(e, (m = new Map()))
	m.set(mk, k.length > 600 ? `${k.slice(0, 600)}…` : k)
	return k
}

function valueKey0(I: Ir, ctx: IxCtx | undefined, fn: number, e: Expr, p: number, d: number): string {
	const K = (x: Expr, q = p) => valueKey(I, ctx, fn, x, q, d + 1)
	const D = defsIn(I, fn)
	const fo = I.byPc.get(fn)
	if (!D || !fo) return '?'
	switch (e.k) {
		case 'const': return sconst(e.v)
		case 'var': {
			if (e.id === D.fp) return `fp${fn}`
			if (D.defs.has(e.id)) { const x = D.defs.get(e.id)!; return x.k === 'call' ? `call${fn}@${D.defPos.get(e.id)}` : K(x, D.defPos.get(e.id)!) }
			const v = fo.f.vars[e.id]
			if (D.multi.has(e.id)) { const y = D.reaching(e.id, p); return y ? (y[0].k === 'call' ? `call${fn}@${y[1]}` : K(y[0], y[1])) : `v${fn}.${e.id}` }
			if (v && v.param >= 1 && v.param !== 10) return paramKey(I, ctx, fn, v.param, d) ?? `p${fn}.${v.param}`
			return `v${fn}.${e.id}`
		}
		case 'load': {
			const o = D.fpOff(e.addr)
			if (o !== undefined) {
				if (e.size === 8) { const y = D.reaching(D.SLOT(o), p); if (y) return y[0].k === 'call' ? `call${fn}@${y[1]}` : K(y[0], y[1]) }
				return `fs${fn}@${o}:${e.size}`
			}
			return `ld${e.size}(${K(e.addr)})`
		}
		case 'bin': {
			if (e.op === 'add' || (e.op === 'sub' && e.b.k === 'const')) {
				// (a sum: its terms sorted, constants folded)
				const terms: string[] = []
				let c = 0n
				const flat = (x: Expr, neg: boolean) => {
					if (x.k === 'bin' && x.op === 'add') { flat(x.a, neg); flat(x.b, neg); return }
					if (x.k === 'bin' && x.op === 'sub' && x.b.k === 'const') { flat(x.a, neg); c += neg ? x.b.v : -x.b.v; return }
					if (x.k === 'const') { c += neg ? -x.v : x.v; return }
					const s = K(x)
					if (s.startsWith('(+ ')) {
						// (a variable holding a sum: its terms)
						const inner = s.slice(3, -1).split(' ')
						if (inner.every(t => !t.includes('('))) { for (const t of inner) { if (t.startsWith('#')) c += BigInt.asUintN(64, BigInt(t.slice(1))); else terms.push(t) } return }
					}
					terms.push(s)
				}
				flat(e, false)
				c = BigInt.asUintN(64, c)
				if (!terms.length) return sconst(c)
				if (terms.length === 1 && c === 0n) return terms[0]
				terms.sort()
				return `(+ ${terms.join(' ')}${c ? ` ${sconst(c)}` : ''})`
			}
			const a = K(e.a), b = K(e.b)
			return COMM.has(e.op) && a > b ? `(${e.op} ${b} ${a})` : `(${e.op} ${a} ${b})`
		}
		case 'ext': return K(e.a)
		case 'cmp': {
			let op: string = e.op, a = K(e.a), b = K(e.b)
			if (SWAP[op]) { op = SWAP[op]; [a, b] = [b, a] }
			if (COMM.has(op) && a > b) [a, b] = [b, a]
			return `(${op} ${a} ${b})`
		}
		case 'lnot': return `(! ${K(e.a)})`
		case 'land': case 'lor': return `(${e.k} ${K(e.a)} ${K(e.b)})`
		case 'sel': return `(? ${K(e.c)} ${K(e.a)} ${K(e.b)})`
		case 'neg': case 'not': return `(${e.k} ${K(e.a)})`
		case 'bswap': return `(bswap${e.bits} ${K(e.a)})`
		case 'fn': return `(${e.name} ${e.args.map(x => K(x)).join(' ')})`
		case 'call': return `call${fn}@${p}`
		default: return e.k
	}
}

/** a parameter's value: the argument at the call site up the instruction's call path */
function paramKey(I: Ir, ctx: IxCtx | undefined, fn: number, reg: number, d: number): string | undefined {
	const par = !ctx || fn === ctx.handler ? undefined : ctx.parents.get(fn)
	if (!par || par.pc === undefined) return undefined
	const st = stmtAt(I, par.fn, par.pc)
	const c = st && callOf(st[0])
	if (!c || c.t.k !== 'fn' || c.t.pc !== fn) return undefined
	const f = I.byPc.get(fn)?.f
	const i = reg < 100 ? reg - 1 : 4 + (reg - 100)
	if (!f || (reg >= 100 && !f.stackArgs) || !c.args[i]) return undefined
	return valueKey(I, ctx, par.fn, c.args[i], st[1], d + 1)
}

/** does key k (a whole term) occur in key K? */
export function keyIn(K: string, k: string): boolean {
	for (let i = K.indexOf(k); i >= 0; i = K.indexOf(k, i + 1)) {
		const b = K[i - 1] ?? ' ', a = K[i + k.length] ?? ' '
		if ((b === ' ' || b === '(') && (a === ' ' || a === ')')) return true
	}
	return false
}

/** the comparisons of a condition (through && / || / !), as [op, left, right] of canonical keys */
export function cmpsOf(I: Ir, ctx: IxCtx | undefined, fn: number, c: Expr, p: number): [string, string, string][] {
	const out: [string, string, string][] = []
	const go = (x: Expr, k: number) => {
		if (k > 8 || out.length > 8) return
		if (x.k === 'lnot') return go(x.a, k + 1)
		if (x.k === 'land' || x.k === 'lor') { go(x.a, k + 1); go(x.b, k + 1); return }
		// (a variable holding a comparison, e.g. an overflow flag)
		if (x.k === 'var') {
			const D = defsIn(I, fn)
			const y = D?.defs.has(x.id) ? D.defs.get(x.id)! : undefined
			if (y && (y.k === 'cmp' || y.k === 'lnot' || y.k === 'land' || y.k === 'lor')) return go(y, k + 1)
		}
		if (x.k === 'cmp') out.push([x.op, valueKey(I, ctx, fn, x.a, p), valueKey(I, ctx, fn, x.b, p)])
	}
	go(c, 0)
	return out
}

/** follow a variable to its (reaching) definition, through extensions: the expression and its position */
export function follow(I: Ir, fn: number, e: Expr, p: number, n = 6): [Expr, number] {
	const D = defsIn(I, fn)
	for (let k = 0; D && k < n; k++) {
		if (e.k === 'ext') { e = e.a; continue }
		if (e.k === 'load') {
			const o = D.fpOff(e.addr)
			const y = o !== undefined && e.size === 8 ? D.reaching(D.SLOT(o), p) : null
			if (!y || y[0].k === 'call') break
			;[e, p] = y
			continue
		}
		if (e.k !== 'var') break
		const y: [Expr, number] | null = D.defs.has(e.id) ? [D.defs.get(e.id)!, D.defPos.get(e.id)!] : D.multi.has(e.id) ? D.reaching(e.id, p) : null
		if (!y || y[0].k === 'call') break
		;[e, p] = y
	}
	return [e, p]
}
