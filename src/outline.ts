// Outlining of repeated function tails (exact): a run of statements ending in a `return` that recurs,
// identical up to the variables and stack objects it uses, in several places of the program is printed
// once as a helper function and replaced by a call at each place:
//
//   copyr(ret + 8, err_8, 0x10)          ->   return ret_tail_1(ret, err_8, r)
//   st64(ret, 0)
//   return r                                  function ret_tail_1(ret: u64, a: u64, b: u64): u64 {
//                                             	copyr(ret + 8, a, 0x10)
//                                             	st64(ret, 0)
//                                             	return b
//                                             }
//
// The helper's body is the run itself: every variable the run reads before assigning it (at its top
// level) is a parameter, passed its value at the call; every stack object it accesses (fp + c) is a
// parameter holding the object's address (fp + base), accesses being base-relative. Constants stay in
// the body (runs that differ in a constant are different helpers). Nothing after the run executes (it
// returns on every path), so assignments inside the helper need no copying back. Runs are restricted
// to what reads the same in a helper as in place: no calls (their results and comments belong to the
// caller's text), no loops or labeled jumps, stores only into the function's out parameter (`ret`) or
// its frame.
import type { Node } from './structure.ts'
import type { VarFunc, VarInfo } from './dataflow.ts'
import { type Expr, type Stmt, walkExpr } from './ir.ts'
import { stmtExprs } from './simplify.ts'

export interface OutlineFn {
	f: VarFunc
	body: Node[]
	fp?: number          // frame pointer variable
	ret?: number         // the out parameter's variable (see decompile.ts pureOutParams)
	bases: number[]      // stack-object base offsets (ascending)
	noConstStores?: boolean // stores of constants are annotated per function (Result tags): not outlined
}
export interface Helper { name: string; params: string[]; vars: VarInfo[]; names: string[]; body: Node[]; value: boolean; uses: number }
export interface OutlineUse { helper: Helper; args: Expr[] }
export interface Outlines { at: Map<Node[], Map<number, OutlineUse>>; helpers: Helper[] }

const MAX_NODES = 16, MAX_PARAMS = 8

/** Printed lines of a node list (as printBody prints it; else-if chains count one line less, fine for an estimate). */
function lineCount(ns: Node[]): number {
	let n = 0
	for (const x of ns) n += x.k === 'if' ? 1 + lineCount(x.then) + (x.else.length ? 1 + lineCount(x.else) : 0) + 1 : 1
	return n
}

interface Cand { fi: number; list: Node[]; i: number; lines: number; params: Expr[]; key: string; nodes: Node[]; lead?: number }

export function findOutlines(fns: OutlineFn[], taken: (name: string) => boolean, minLines = 3): Outlines {
	const groups = new Map<string, Cand[]>()
	fns.forEach((fn, fi) => {
		let total0: Map<number, number> | undefined
		const total = () => (total0 ??= occurrences(fn.body))
		const visit = (ns: Node[]) => {
			for (const n of ns) {
				if (n.k === 'if') { visit(n.then); visit(n.else) }
				else if (n.k === 'block' || n.k === 'loop') visit(n.body)
				else if (n.k === 'switch') n.cases.forEach(c => visit(c.body))
			}
			if (ns[ns.length - 1]?.k !== 'return') return
			for (let i = ns.length - 2; i >= 0 && ns.length - i <= MAX_NODES; i--) {
				const c = candidate(fn, ns, i, total)
				if (c === null) break // (a longer suffix contains the same offending node)
				if (!c) continue
				const lines = lineCount(ns.slice(i))
				if (lines >= minLines) {
					let g = groups.get(c.key); if (!g) groups.set(c.key, (g = []))
					g.push({ fi, list: ns, i, lines, params: c.params, key: c.key, nodes: ns.slice(i), lead: c.lead })
				}
				if (c.lead !== undefined) break // (a call is only ever the first statement of a run)
			}
		}
		visit(fn.body)
	})
	// greedy: largest gain first; instances must not overlap chosen ones
	const covered = new Set<Node>()
	const cover = (ns: Node[]) => { for (const n of ns) { covered.add(n); if (n.k === 'if') { cover(n.then); cover(n.else) } } }
	const free = (ns: Node[]): boolean => ns.every(n => !covered.has(n) && (n.k !== 'if' || (free(n.then) && free(n.else))))
	const gain = (g: Cand[]) => { const site = g[0].nodes.some(returnsValue) ? 1 : 2; return g.length * (g[0].lines - site) - (g[0].lines + 2) }
	const order = [...groups.values()].filter(g => g.length >= 2 && gain(g) > 0).sort((a, b) => gain(b) - gain(a))
	const chosen: Cand[][] = []
	for (const g0 of order) {
		const g = g0.filter(c => free(c.nodes))
		if (g.length < 2 || gain(g) <= 0) continue
		g.forEach(c => cover(c.nodes))
		chosen.push(g)
	}
	// helpers, most used first
	chosen.sort((a, b) => b.length - a.length || (a[0].key < b[0].key ? -1 : 1))
	const out: Outlines = { at: new Map(), helpers: [] }
	let k = 0
	for (const g of chosen) {
		const c = g[0], fn = fns[c.fi]
		const retFirst = g.every(x => { const p = x.params[0]; return p?.k === 'var' && p.id === fns[x.fi].ret })
		let name: string
		do name = `${retFirst ? 'ret_tail' : 'tail'}_${++k}`; while (taken(name))
		const h = helperOf(fn, c, name, retFirst)
		h.uses = g.length
		out.helpers.push(h)
		for (const x of g) {
			let m = out.at.get(x.list); if (!m) out.at.set(x.list, (m = new Map()))
			m.set(x.i, { helper: h, args: x.params })
		}
	}
	return out
}

/** Occurrences (reads and assignments) of each variable in a node list. */
function occurrences(ns: Node[], m = new Map<number, number>()): Map<number, number> {
	const add = (id: number) => m.set(id, (m.get(id) ?? 0) + 1)
	const ex = (e: Expr) => walkExpr(e, x => { if (x.k === 'var') add(x.id) })
	for (const n of ns) {
		switch (n.k) {
			case 'stmt': stmtExprs(n.s).forEach(ex); if ((n.s.k === 'set' || n.s.k === 'call') && n.s.dst >= 0) add(n.s.dst); break
			case 'if': ex(n.c); occurrences(n.then, m); occurrences(n.else, m); break
			case 'block': occurrences(n.body, m); break
			case 'loop': if (n.c) ex(n.c); occurrences(n.body, m); break
			case 'return': if (n.e) ex(n.e); break
			case 'switch': add(n.v); n.cases.forEach(c => occurrences(c.body, m)); break
			case 'setstate': add(n.v); break
		}
	}
	return m
}

function returnsValue(n: Node): boolean {
	if (n.k === 'return') return n.e !== null
	if (n.k === 'if') return n.then.some(returnsValue) || n.else.some(returnsValue)
	return false
}

/**
 * The suffix ns[i..] as an outlining candidate: its key (the run with variables and stack objects
 * numbered by first occurrence, parameters and locals told apart) and the parameters' values at the
 * call. null: node i can never be part of a run (nor any longer suffix); undefined: not this suffix.
 */
function candidate(fn: OutlineFn, ns: Node[], i: number, total0: () => Map<number, number>): { key: string; params: Expr[]; lead?: number } | null | undefined {
	const { fp, ret } = fn
	// a leading call `v = f(…)`: printed at the call site as the helper's last argument (evaluated before its
	// body runs, after the other arguments, which are plain values), v being that parameter
	const lead = leadCall(fn, ns[i])
	if (!lead && !okNode(fn, ns[i])) return null
	const run = ns.slice(i)
	for (const n of run.slice(1)) if (!okNode(fn, n)) return undefined
	// variables occurring only in the run: locals of the helper (the caller may not even declare them)
	const inRun = occurrences(run), total = total0()
	const only = (id: number) => inRun.get(id) === total.get(id) && !(fn.f.vars[id]?.param >= 0)
	const vars = new Map<number, string>(), frames = new Map<number, string>()
	const params: Expr[] = []
	const base = (c: number) => { let b = c; for (const x of fn.bases) { if (x <= c && c - x < 0x200) b = x; if (x > c) break } return b }
	const frameOff = (e: Expr) => (fp !== undefined && e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const' ? Number(BigInt.asIntN(64, e.b.v)) : undefined)
	const useVar = (id: number) => {
		let s = vars.get(id)
		if (!s) {
			if (only(id)) { s = `L${vars.size}`; vars.set(id, s); return s }
			s = `P${params.length}`; vars.set(id, s); params.push({ k: 'var', id })
		}
		return s
	}
	const ser = (e: Expr): string => {
		const o = frameOff(e)
		if (o !== undefined) {
			const b = base(o)
			let s = frames.get(b)
			if (!s) { s = `P${params.length}`; frames.set(b, s); params.push({ k: 'bin', op: 'add', a: { k: 'var', id: fp! }, b: { k: 'const', v: BigInt.asUintN(64, BigInt(b)) } }) }
			return `(${s}+${o - b})`
		}
		switch (e.k) {
			case 'const': return `#${e.v.toString(16)}`
			case 'var': return useVar(e.id)
			case 'reg': return `r${e.r}`
			case 'undef': return 'U'
			case 'bin': return `(${e.op} ${ser(e.a)} ${ser(e.b)})`
			case 'cmp': return `(${e.op} ${ser(e.a)} ${ser(e.b)})`
			case 'land': case 'lor': return `(${e.k} ${ser(e.a)} ${ser(e.b)})`
			case 'neg': case 'not': case 'lnot': return `(${e.k} ${ser(e.a)})`
			case 'ext': return `(ext${e.signed ? 's' : 'u'}${e.bits} ${ser(e.a)})`
			case 'bswap': return `(bswap${e.bits} ${ser(e.a)})`
			case 'load': return `[${e.size} ${ser(e.addr)}]`
			case 'sel': return `(? ${ser(e.c)} ${ser(e.a)} ${ser(e.b)})`
			case 'fn': return `(${e.name} ${e.args.map(ser).join(' ')})`
			case 'call': throw new Error('call in an outlining candidate')
		}
	}
	const stmt = (s: Stmt, top: boolean): string => {
		switch (s.k) {
			case 'set': {
				const e = ser(s.e)
				// a local: first seen as this top-level definition
				if (!vars.has(s.dst) && top) { vars.set(s.dst, `L${vars.size}`); return `${vars.get(s.dst)}=${e}` }
				return `${useVar(s.dst)}=${e}`
			}
			case 'store': return `st${s.size} ${ser(s.addr)} ${ser(s.v)}`
			case 'stores': return `sts${s.size} ${ser(s.addr)} ${s.vals.map(ser).join(' ')}`
			case 'copy': return `cp${s.rev ? 'r' : ''} ${ser(s.dst)} ${ser(s.src)} ${s.n}`
			case 'eval': return `ev ${ser(s.e)}`
			case 'trap': return `trap ${JSON.stringify(s.msg)}`
			case 'call': throw new Error('call in an outlining candidate')
		}
	}
	const list = (xs: Node[], top: boolean): string => xs.map(n => {
		switch (n.k) {
			case 'stmt': return stmt(n.s, top)
			case 'if': { const c = ser(n.c); return `if ${c} {${list(n.then, false)}} {${list(n.else, false)}}` }
			case 'return': return n.e ? `ret ${ser(n.e)}` : 'ret'
			case 'trap': return `abort ${JSON.stringify(n.msg)}`
			default: throw new Error('unexpected node')
		}
	}).join(';')
	if (lead) vars.set(lead.dst, '@C')
	let key = list(lead ? run.slice(1) : run, true)
	// (the call's result is the last parameter: the same key as a run without the call whose variable is first seen last)
	if (lead) { key = key.replaceAll('@C', `P${params.length}`); params.push(lead.call) }
	if (params.length > MAX_PARAMS) return undefined
	// (the out parameter itself is not reassigned by construction: pureOutParams)
	void ret
	return { key, params, lead: lead?.dst }
}

/** A call statement assigning its result to a variable (not the frame pointer or the out parameter). */
function leadCall(fn: OutlineFn, n: Node): { dst: number; call: Expr } | undefined {
	if (n.k !== 'stmt') return undefined
	const s = n.s
	if (s.k === 'call' && s.dst >= 0 && s.dst !== fn.fp && s.dst !== fn.ret) return { dst: s.dst, call: { k: 'call', t: s.t, args: [...s.args, ...(s.extra ?? [])] } }
	if (s.k === 'set' && s.e.k === 'call' && s.dst !== fn.fp && s.dst !== fn.ret) return { dst: s.dst, call: s.e }
	return undefined
}

/** A node that can be part of an outlined run (see the header). */
function okNode(fn: OutlineFn, n: Node): boolean {
	const { fp, ret } = fn
	const okExpr = (e: Expr): boolean => {
		switch (e.k) {
			case 'call': return false
			case 'var': return e.id !== fp
			case 'bin':
				if (e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const') return true
				return okExpr(e.a) && okExpr(e.b)
			case 'cmp': case 'land': case 'lor': return okExpr(e.a) && okExpr(e.b)
			case 'neg': case 'not': case 'lnot': case 'ext': case 'bswap': return okExpr(e.a)
			case 'load': return okExpr(e.addr)
			case 'sel': return okExpr(e.c) && okExpr(e.a) && okExpr(e.b)
			case 'fn': return e.args.every(okExpr)
			default: return true
		}
	}
	// stores: into the out parameter or the frame only (writes the analysis reads from the text stay in place)
	const dest = (a: Expr) => {
		const b = a.k === 'bin' && a.op === 'add' && a.b.k === 'const' ? a.a : a
		return b.k === 'var' && (b.id === fp || (ret !== undefined && b.id === ret))
	}
	switch (n.k) {
		case 'stmt': {
			const s = n.s
			switch (s.k) {
				case 'set': return okExpr(s.e) && s.dst !== fp && s.dst !== ret
				case 'store': return dest(s.addr) && okExpr(s.addr) && okExpr(s.v) && !(fn.noConstStores && s.v.k === 'const')
				case 'stores': return dest(s.addr) && okExpr(s.addr) && s.vals.every(okExpr) && !(fn.noConstStores && s.vals.some(v => v.k === 'const'))
				case 'copy': return dest(s.dst) && okExpr(s.dst) && okExpr(s.src)
				case 'eval': return okExpr(s.e)
				case 'trap': return true
				default: return false
			}
		}
		case 'if': return okExpr(n.c) && n.then.every(x => okNode(fn, x)) && n.else.every(x => okNode(fn, x))
		case 'return': return !n.e || okExpr(n.e)
		case 'trap': return true
		default: return false
	}
}

/** The helper of a chosen run: its body with the run's variables renumbered (parameters first) and stack objects as parameters. */
function helperOf(fn: OutlineFn, c: Cand, name: string, retFirst: boolean): Helper {
	const ids = new Map<number, number>()
	const vars: VarInfo[] = []
	const names: string[] = []
	const params: string[] = []
	const letters = 'abcdefghijklmnopqrstuvwxyz'
	let li = 0
	const frameParam = new Map<number, number>()
	c.params.forEach((p, k) => {
		const id = vars.length
		vars.push({ id, reg: -1, param: k + 1, undef: false })
		const nm = k === 0 && retFirst ? 'ret' : letters[li++] ?? `p${k}`
		names.push(nm); params.push(nm)
		if (p.k === 'var') ids.set(p.id, id)
		else if (p.k === 'call') ids.set(c.lead!, id)
		else frameParam.set(Number(BigInt.asIntN(64, (p as { b: { v: bigint } }).b.v)), id)
	})
	// (the same stack-object bases as the key: see candidate)
	const baseOf = (o: number) => { let b = o; for (const x of fn.bases) { if (x <= o && o - x < 0x200) b = x; if (x > o) break } return b }
	const local = (id: number) => {
		let n = ids.get(id)
		if (n === undefined) {
			n = vars.length
			ids.set(id, n)
			vars.push({ id: n, reg: -1, param: -1, undef: false })
			let nm: string
			do nm = li < 26 ? letters[li++] : `v${li++ - 26}`; while (names.includes(nm) || nm === 'ret')
			names.push(nm)
		}
		return n
	}
	const fp = fn.fp
	const ex = (e: Expr): Expr => {
		if (fp !== undefined && e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const') {
			const o = Number(BigInt.asIntN(64, e.b.v)), b = baseOf(o), d = o - b
			const v: Expr = { k: 'var', id: frameParam.get(b)! }
			return d ? { k: 'bin', op: 'add', a: v, b: { k: 'const', v: BigInt.asUintN(64, BigInt(d)) } } : v
		}
		switch (e.k) {
			case 'var': return { k: 'var', id: local(e.id) }
			case 'bin': return { ...e, a: ex(e.a), b: ex(e.b) }
			case 'cmp': return { ...e, a: ex(e.a), b: ex(e.b) }
			case 'land': case 'lor': return { ...e, a: ex(e.a), b: ex(e.b) }
			case 'neg': case 'not': case 'lnot': case 'ext': case 'bswap': return { ...e, a: ex(e.a) } as Expr
			case 'load': return { ...e, addr: ex(e.addr) }
			case 'sel': return { ...e, c: ex(e.c), a: ex(e.a), b: ex(e.b) }
			case 'fn': return { ...e, args: e.args.map(ex) }
			default: return e
		}
	}
	const st = (s: Stmt): Stmt => {
		switch (s.k) {
			case 'set': return { ...s, e: ex(s.e), dst: local(s.dst) }
			case 'store': return { ...s, addr: ex(s.addr), v: ex(s.v) }
			case 'stores': return { ...s, addr: ex(s.addr), vals: s.vals.map(ex) }
			case 'copy': return { ...s, dst: ex(s.dst), src: ex(s.src) }
			case 'eval': return { ...s, e: ex(s.e) }
			default: return { ...s }
		}
	}
	const nodes = (xs: Node[]): Node[] => xs.map(n => {
		switch (n.k) {
			case 'stmt': return { k: 'stmt', s: st(n.s) }
			case 'if': return { k: 'if', c: ex(n.c), then: nodes(n.then), else: nodes(n.else) }
			case 'return': return { k: 'return', e: n.e ? ex(n.e) : null }
			default: return { ...n }
		}
	})
	const body = nodes(c.lead !== undefined ? c.nodes.slice(1) : c.nodes)
	return { name, params, vars, names, body, value: c.nodes.some(returnsValue), uses: 0 }
}
