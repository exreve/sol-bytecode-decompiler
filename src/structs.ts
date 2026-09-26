// Inferred struct views ([heur]; views only: nothing here changes semantics).
//
// Pointers without a known layout get a view whose fields are the fixed-offset accesses the program makes
// through them: `ld64(b + 0x18)` prints as `b.f0x18_u64`, `st8(ret + 0x20, x)` as `ret.f0x20_u8 = x`.
// A pointer is a function parameter never reassigned, or a variable defined once as a pointer loaded
// from such an object (`g = ld64(b + 0x10)`: the object b's field 0x10 points to). Objects are unified
// (one view) along the program's own data flow, Steensgaard style: a parameter with the arguments the
// calls pass it (the same object), a loaded pointer with every other pointer loaded from or stored at
// the same field of the same object. A merge is only made when the two layouts agree (no access of one
// overlaps an access of another size of the other), recursively for the objects their fields point to.
// Each field is named after its offset and size (a u64 at 0x18: `f0x18_u64`; an 8-byte field whose value
// is used as such a pointer: `f0x10_ref`, of type ref<its view>). Pointers used in arithmetic with a
// non-constant (buffers, arrays) and those of library functions get no view.
import type { VarFunc } from './dataflow.ts'
import type { Expr, Stmt } from './ir.ts'
import type { Views, Field } from './views.ts'

export interface StructCfg {
	built: Map<number, { f: VarFunc }>
	skip(pc: number): boolean                     // functions left out (library code)
	typed(pc: number, v: number): boolean         // variables that already have a view type
	fnName(pc: number): string
	outParam(pc: number): boolean                 // its first parameter is an out pointer (named `ret`)
	paramReg(callee: number, i: number): number   // the parameter register of a call's i-th argument
	dataPtr?(pc: number, e: Expr): boolean         // a load giving an account's data pointer (acc.data.ptr)
	fieldHints?(pc: number, reg: number): { fields?: Map<number, Field>; name?: (off: number, size: number) => string | undefined; why: string } | undefined // known fields of a parameter's object (by offset) or names of its accesses, and where from
}

interface Acc { off: number; size: number; n: number }
interface Cls {
	acc: Map<string, Acc>          // `${off}:${size}` -> access count
	ptr: Map<number, number>       // offset -> node the 8-byte field there points to
	members: { pc: number; v: number }[]
	data: { pc: number; v: number }[] // account data pointers (acc.data.ptr) it holds
	isData?: boolean // the data of a DataCell (its pointers are account data pointers)
	opaque: boolean
}

const MAX_OFF = 0x4000
const PARAM_NAMES = ['r0', 'a', 'b', 'c', 'd', 'e']

/** Per function: variable -> view name; the views are added to `views`. */
export function inferStructs(cfg: StructCfg, views: Views): { types: Map<number, Map<number, string>>; synth: Set<string> } {
	const synth = new Set<string>() // the views made here
	const parent: number[] = [], cls: Cls[] = []
	const find = (x: number): number => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
	const fresh = (): number => { const id = parent.length; parent.push(id); cls.push({ acc: new Map(), ptr: new Map(), members: [], data: [], opaque: false }); return id }
	const nodeOf = new Map<number, Map<number, number | null>>() // pc -> var -> node
	const params = new Map<number, Map<number, number>>() // pc -> parameter register -> var
	const paramVar = (pc: number, reg: number): number | undefined => {
		let m = params.get(pc)
		if (!m) { m = new Map(); for (const v of cfg.built.get(pc)!.f.vars) if (v.param >= 0 && !m.has(v.param)) m.set(v.param, v.id); params.set(pc, m) }
		return m.get(reg)
	}

	// the pointee node of a field (created on demand)
	const pointee = (n: number, off: number): number => {
		const c = cls[find(n)]
		let t = c.ptr.get(off)
		if (t === undefined) { t = fresh(); cls[find(n)].ptr.set(off, t) }
		return t
	}
	const base = (e: Expr): { v: number; off: number } | undefined => {
		if (e.k === 'var') return { v: e.id, off: 0 }
		if (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.b.k === 'const') {
			const o = BigInt.asIntN(64, e.b.v)
			return o >= 0n && o < BigInt(MAX_OFF) ? { v: e.a.id, off: Number(o) } : undefined
		}
		return undefined
	}

	// ---- phase 1: nodes and accesses per function ----
	const edges: [number, number][] = []
	const direct = new Set<string>() // `${pc}:${var}`: locals typed directly (not through a typed pointer field)
	const fieldEdges: [number, number, number][] = [] // node, callee * 256 + parameter register, offset: the node is what that field points to
	const arithVars: [Map<number, number | null>, number][] = [] // (variables in arithmetic: marked once their nodes are known)
	for (const [pc, { f }] of cfg.built) {
		if (cfg.skip(pc) || f.isEntry || f.noreturn) continue
		const defs = new Map<number, Stmt[]>()
		for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'set' || s.k === 'call') && s.dst >= 0) { let l = defs.get(s.dst); if (!l) defs.set(s.dst, (l = [])); l.push(s) }
		const memo = new Map<number, number | null>()
		nodeOf.set(pc, memo)
		const busy = new Set<number>()
		const node = (v: number): number | undefined => {
			if (memo.has(v)) return memo.get(v) ?? undefined
			const info = f.vars[v]
			let n: number | undefined
			if (!info || info.param === 10 || cfg.typed(pc, v) || busy.has(v)) n = undefined
			else if (info.param >= 0) {
				if (!defs.has(v) && (info.param >= 1 && info.param <= 5 || info.param >= 100)) { n = fresh(); cls[n].members.push({ pc, v }) }
			} else {
				const d = defs.get(v)
				// (several definitions: when each is a pointer variable or a pointer field, one object)
				if (d && d.length > 1 && d.length <= 16 && d.every(x => x.k === 'set' && (x.e.k === 'var' || (x.e.k === 'load' && x.e.size === 8)))) {
					busy.add(v)
					const ns: number[] = []
					for (const x of d) {
						const e = (x as Stmt & { k: 'set' }).e
						let dn: number | undefined
						if (e.k === 'var') dn = node(e.id)
						else if (e.k === 'load') {
							const b = base(e.addr); const bn = b && node(b.v)
							if (bn !== undefined) dn = pointee(bn, b!.off)
							else if (fo(e.addr) !== undefined) { const r = resultField(x, fo(e.addr)!); if (r === 'opaque') dn = undefined; else if (r) { dn = fresh(); fieldEdges.push([dn, r.cpc * 256 + r.reg, r.rel]) } else dn = cell(fo(e.addr)!) }
						}
						if (dn === undefined) { ns.length = 0; break }
						ns.push(dn)
					}
					busy.delete(v)
					if (ns.length) { n = fresh(); for (const x of ns) edges.push([n, x]); direct.add(`${pc}:${v}`) }
				}
				else if (d?.length === 1 && d[0].k === 'set') {
					const e = d[0].e
					busy.add(v)
					if (e.k === 'load' && e.size === 8) {
						const b = base(e.addr); const bn = b && node(b.v)
						if (bn !== undefined) n = pointee(bn, b!.off)
						// (an account's data pointer, loaded from its typed RefCell box: an object of its own)
						else if (cfg.dataPtr?.(pc, e)) { n = fresh(); cls[n].data.push({ pc, v }) }
						// (a pointer field of a call's result in the frame: the callee's out object's field)
						else if (fo(e.addr) !== undefined) {
							const r = resultField(d[0], fo(e.addr)!)
							if (r === 'opaque') n = undefined
							else if (r) { n = fresh(); fieldEdges.push([n, r.cpc * 256 + r.reg, r.rel]) }
							else n = cell(fo(e.addr)!)
							if (n !== undefined) direct.add(`${pc}:${v}`)
						}
					}
					// (a heap object: an allocation the bump allocator's code gives inline)
					else if (e.k === 'sel' && [e.a, e.b].some(x => x.k === 'const' && x.v >= 0x3_0000_0000n && x.v < 0x4_0000_0000n)) { n = fresh(); direct.add(`${pc}:${v}`) }
					else if (e.k === 'var') n = node(e.id)
					busy.delete(v)
				}
			}
			memo.set(v, n ?? null)
			return n
		}
		// frame words holding pointers (spills): one object per word and function (a word reused for another object
		// merges them only when their layouts agree)
		const cells = new Map<number, number>()
		const cell = (off: number): number | undefined => {
			if (off >= 0 || off < -0x2000) return undefined
			let n = cells.get(off)
			if (n === undefined) cells.set(off, (n = fresh()))
			return cellOk(off) ? n : fresh()
		}
		// (only a word that holds one value: every variable stored there is the same parameter, or reloaded from the word)
		let stored: Map<number, Set<number>> | undefined
		const storedAt = (off: number) => {
			if (!stored) {
				stored = new Map()
				for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'store' || s.k === 'stores') && s.size === 8) {
					const F = fo(s.addr)
					if (F !== undefined) (s.k === 'store' ? [s.v] : s.vals).forEach((x, i) => { if (x.k === 'var') { let l = stored!.get(F + 8 * i); if (!l) stored!.set(F + 8 * i, (l = new Set())); l.add(x.id) } })
				}
			}
			return stored.get(off) ?? []
		}
		const rootsOf = (v: number, seen: Set<number>): Set<string> => {
			if (seen.has(v)) return new Set()
			seen.add(v)
			if (f.vars[v]?.param >= 0) return new Set([`p${v}`])
			const r = new Set<string>()
			for (const d of defs.get(v) ?? []) {
				if (d.k === 'set' && d.e.k === 'var') for (const x of rootsOf(d.e.id, seen)) r.add(x)
				else if (d.k === 'set' && d.e.k === 'load' && d.e.size === 8 && fo(d.e.addr) !== undefined) r.add(`c${fo(d.e.addr)}`)
				else r.add(`v${v}`)
			}
			return r
		}
		const okMemo = new Map<number, boolean>()
		const cellOk = (off: number): boolean => {
			let ok = okMemo.get(off)
			if (ok === undefined) {
				const r = new Set<string>()
				for (const v of storedAt(off)) for (const x of rootsOf(v, new Set())) if (x !== `c${off}`) r.add(x)
				okMemo.set(off, (ok = r.size <= 1))
			}
			return ok
		}
		// where a statement is (block, index)
		const where = new Map<Stmt, [number, number]>()
		f.blocks.forEach((b, bi) => b.stmts.forEach((s, si) => where.set(s, [bi, si])))
		/**
		 * The call whose out object a frame word read by statement st lies in (the last call before it given a
		 * frame address at most 0x100 below the word, through single-predecessor blocks, with no store over the word
		 * in between): its user callee, the parameter and the word's offset in the object ('opaque': another callee's;
		 * undefined: none, e.g. a spill slot stored before).
		 */
		const resultField = (st: Stmt, off: number): { cpc: number; reg: number; rel: number } | 'opaque' | undefined => {
			let [bi, si] = where.get(st)!
			for (let depth = 0; depth < 8; depth++) {
				const ss = f.blocks[bi].stmts
				for (let k = si - 1; k >= 0; k--) {
					const s = ss[k]
					if (s.k === 'store' || s.k === 'stores' || s.k === 'copy') {
						const D = fo(s.k === 'copy' ? s.dst : s.addr), n = s.k === 'copy' ? s.n : s.k === 'store' ? s.size : s.size * s.vals.length
						if (D !== undefined && D < off + 8 && D + n > off) return undefined
						continue
					}
					const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
					if (!c) continue
					let best: { i: number; O: number } | undefined
					c.args.forEach((a, i) => { const O = fo(a); if (O !== undefined && O <= off && off - O < 0x100 && (!best || O > best.O)) best = { i, O } })
					if (!best) { if (c.t.k !== 'fn') return 'opaque'; continue }
					const { i, O } = best
					if (c.t.k !== 'fn' || cfg.skip(c.t.pc) || !cfg.built.has(c.t.pc) || cfg.built.get(c.t.pc)!.f.noreturn) return 'opaque'
					return { cpc: c.t.pc, reg: cfg.paramReg(c.t.pc, i), rel: off - O }
				}
				const ps = f.blocks[bi].preds
				if (ps.length !== 1) return undefined
				bi = ps[0]; si = f.blocks[bi].stmts.length
			}
			return undefined
		}
		const access = (addr: Expr, size: number, count = 1) => {
			const b = base(addr)
			const n = b && node(b.v)
			if (n === undefined) return
			const c = cls[find(n)], k = `${b!.off}:${size}`
			const a = c.acc.get(k)
			if (a) a.n += count; else c.acc.set(k, { off: b!.off, size, n: count })
		}
		// a variable in arithmetic with a non-constant (or subtracted): a buffer / array pointer
		const arith = (e: Expr) => {
			if (e.k === 'bin' && (e.op === 'add' || e.op === 'sub')) {
				// (or with a constant out of the object: a negative offset, e.g. a frame pointer's stack arguments)
				for (const [x, y] of [[e.a, e.b], [e.b, e.a]] as const) if (x.k === 'var' && (y.k !== 'const' || e.op === 'sub' || BigInt.asIntN(64, y.v) < 0n || BigInt.asIntN(64, y.v) >= BigInt(MAX_OFF))) arithVars.push([memo, x.id])
			}
		}
		const visit = (e: Expr) => {
			switch (e.k) {
				case 'load': access(e.addr, e.size); if (!base(e.addr)) visit(e.addr); else arith(e.addr); break
				case 'bin': arith(e); visit(e.a); visit(e.b); break
				case 'cmp': case 'land': case 'lor': visit(e.a); visit(e.b); break
				case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': visit(e.a); break
				case 'sel': visit(e.c); visit(e.a); visit(e.b); break
				case 'call': if (e.t.k === 'ind') visit(e.t.e); e.args.forEach(visit); break
				case 'fn': e.args.forEach(visit); break
			}
		}
		// frame addresses passed to calls (object starts)
		const fpv = f.vars.find(v => v.param === 10)?.id
		const fo = (e: Expr): number | undefined => (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fpv && e.b.k === 'const' ? Number(BigInt.asIntN(64, e.b.v)) : undefined)
		const starts: number[] = []
		for (const b of f.blocks) for (const s of b.stmts) {
			const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
			for (const a of c?.args ?? []) { const o = fo(a); if (o !== undefined) starts.push(o) }
		}
		starts.sort((x, y) => x - y)
		const call = (t: Stmt & { k: 'call' } | Expr & { k: 'call' }, stmts: Stmt[], at: number) => {
			if (t.t.k === 'ind') visit(t.t.e)
			t.args.forEach((a, i) => {
				visit(a)
				if (t.t.k !== 'fn' || cfg.skip(t.t.pc) || t.t.pc === pc || !cfg.built.has(t.t.pc) || cfg.built.get(t.t.pc)!.f.noreturn) return
				const cpc = t.t.pc
				const reg = cfg.paramReg(cpc, i)
				if (paramVar(cpc, reg) === undefined) return
				// (the argument: a pointer variable, or a pointer loaded from a field)
				let an: number | undefined
				if (a.k === 'var') an = node(a.id)
				else if (a.k === 'load' && a.size === 8) {
					const b = base(a.addr); const bn = b && node(b.v)
					if (bn !== undefined) an = pointee(bn, b!.off)
					else if (cfg.dataPtr?.(pc, a)) { an = fresh(); cls[an].data.push({ pc, v: -1 }) }
				} else if (fo(a) !== undefined) an = frameArg(fo(a)!, stmts, at)
				if (an !== undefined) edges.push([an, -1 - cpc * 256 - reg]) // (resolved after phase 1: the callee's node)
			})
		}
		// a frame object passed to a call: the stores building it right before (same block, back to another call),
		// up to the next object start
		const frameArg = (O: number, stmts: Stmt[], at: number): number | undefined => {
			let hi = O + 0x100
			for (const x of starts) if (x > O) { hi = Math.min(hi, x); break }
			let n: number | undefined
			for (let k = at - 1; k >= 0; k--) {
				const s = stmts[k]
				if (s.k === 'call' || (s.k === 'set' && s.e.k === 'call') || s.k === 'copy') break
				if (s.k !== 'store' && s.k !== 'stores') continue
				const D = fo(s.addr)
				if (D === undefined || D < O || D >= hi) continue
				n ??= fresh()
				const vals = s.k === 'store' ? [s.v] : s.vals
				vals.forEach((x, j) => {
					const off = D - O + j * s.size
					if (D + j * s.size + s.size > hi) return
					const c = cls[find(n!)], key = `${off}:${s.size}`
					const acc = c.acc.get(key)
					if (acc) acc.n++; else c.acc.set(key, { off, size: s.size, n: 1 })
					if (s.size === 8 && x.k === 'var') { const xn = node(x.id); if (xn !== undefined) edges.push([pointee(n!, off), xn]) }
				})
			}
			return n
		}
		for (const b of f.blocks) {
			for (let si = 0; si < b.stmts.length; si++) {
				const s = b.stmts[si]
				switch (s.k) {
					case 'set': if (s.e.k === 'call') call(s.e, b.stmts, si); else visit(s.e); break
					case 'call': call(s, b.stmts, si); s.extra?.forEach(visit); break
					case 'eval': visit(s.e); break
					case 'store': case 'stores': {
						const vals = s.k === 'store' ? [s.v] : s.vals
						const b0 = base(s.addr)
						const F = fo(s.addr)
						vals.forEach((x, i) => {
							visit(x)
							// (a pointer spilled to a frame word: the word's cell holds its object)
							if (F !== undefined && s.size === 8 && x.k === 'var') { const xn = node(x.id), cn = xn === undefined ? undefined : cell(F + 8 * i); if (cn !== undefined) edges.push([cn, xn!]) }
							if (!b0) return
							access(i ? { k: 'bin', op: 'add', a: { k: 'var', id: b0.v }, b: { k: 'const', v: BigInt(b0.off + i * s.size) } } : s.addr, s.size)
							// (a pointer stored in a field: the field points to its object)
							if (s.size === 8 && x.k === 'var') { const xn = node(x.id), bn = node(b0.v); if (xn !== undefined && bn !== undefined) edges.push([pointee(bn, b0.off + i * 8), xn]) }
						})
						if (!b0) visit(s.addr); else arith(s.addr)
						break
					}
					case 'copy': visit(s.dst); visit(s.src); break
				}
			}
			if (b.term.k === 'br') visit(b.term.c)
			else if (b.term.k === 'ret' && b.term.e) visit(b.term.e)
		}
	}
	for (const [memo, v] of arithVars) { const n = memo.get(v); if (n != null) cls[find(n)].opaque = true }
	// ---- phase 2: unify along the edges, when the layouts agree ----
	const paramNode = new Map<number, number>() // cpc * 256 + reg -> node
	for (const [pc, memo] of nodeOf) { const vs = cfg.built.get(pc)!.f.vars; for (const [v, n] of memo) if (n !== null && vs[v].param > 0) paramNode.set(pc * 256 + vs[v].param, n) }
	const calleeNode = (x: number): number | undefined => paramNode.get(-1 - x)
	/** do the classes of a and b agree (recursively through their pointer fields)? */
	const agree = (a: number, b: number, seen: Set<string>): boolean => {
		a = find(a); b = find(b)
		if (a === b) return true
		const k = a < b ? `${a}:${b}` : `${b}:${a}`
		if (seen.has(k)) return true
		seen.add(k)
		const A = cls[a], B = cls[b]
		if (A.opaque !== B.opaque) return false
		// (accesses of both sorted by offset: a different one overlapping)
		const xs = [...[...A.acc.values()].map(x => ({ ...x, s: 0 })), ...[...B.acc.values()].map(x => ({ ...x, s: 1 }))].sort((x, y) => x.off - y.off || x.size - y.size)
		for (let i = 0; i < xs.length; i++) {
			const x = xs[i]
			// (the accesses of the other class overlapping x, of another place or size)
			for (let j = i + 1; j < xs.length && xs[j].off < x.off + x.size; j++) if (xs[j].s !== x.s && (xs[j].off !== x.off || xs[j].size !== x.size)) return false
		}
		for (const [o, t] of A.ptr) { const u = B.ptr.get(o); if (u !== undefined && !agree(t, u, seen)) return false }
		return true
	}
	const merge = (a: number, b: number) => {
		a = find(a); b = find(b)
		if (a === b) return
		const A = cls[a], B = cls[b]
		parent[a] = b
		for (const [k, x] of A.acc) { const y = B.acc.get(k); if (y) y.n += x.n; else B.acc.set(k, { ...x }) }
		B.members.push(...A.members)
		B.data.push(...A.data)
		B.isData ||= A.isData
		B.opaque ||= A.opaque
		const pend: [number, number][] = []
		for (const [o, t] of A.ptr) { const u = B.ptr.get(o); if (u === undefined) B.ptr.set(o, t); else pend.push([t, u]) }
		for (const [t, u] of pend) merge(t, u)
	}
	for (const [x, y0] of edges) {
		const y = y0 < 0 ? calleeNode(y0) : y0
		if (y === undefined) continue
		if (agree(x, y, new Set())) merge(x, y)
	}
	for (const [x, k, rel] of fieldEdges) {
		const pn = paramNode.get(k)
		// (a word the callee accesses as a pointer: not a frame word merely near its object)
		if (pn === undefined || cls[find(pn)].acc.get(`${rel}:8`) === undefined) continue
		const y = pointee(pn, rel)
		if (agree(x, y, new Set())) merge(x, y)
	}
	// ---- phase 3: views ----
	const viewOf = new Map<number, string | null>()
	const knownCls = new Set<number>() // classes typed with a known view
	const taken = (n: string) => views.map.has(n) || views.opaque.has(n)
	/**
	 * Does a class match a known view (every access hits one of its fields exactly, recursively for the
	 * objects its pointer fields point to)? The number of distinct fields hit, or -1.
	 */
	// (a value only passed on or stored: not known to be a pointer)
	const empty = (t: number, seen = new Set<number>()): boolean => {
		t = find(t)
		if (seen.has(t)) return true
		seen.add(t)
		const c = cls[t]
		return !c.acc.size && [...c.ptr.values()].every(u => empty(u, seen))
	}
	const matches = (root: number, view: string, seen: Set<number>): number => {
		root = find(root)
		if (seen.has(root)) return 0
		seen.add(root)
		const c = cls[root]
		const hit = new Set<number>()
		for (const a of c.acc.values()) {
			const r = views.resolve(view, a.off)
			if (!r || r.rest || !((r.last.k === 'scalar' && r.last.size === a.size) || (r.last.k === 'ref' && a.size === 8))) return -1
			hit.add(views.fieldAt(view, a.off)!.off)
		}
		let n = hit.size
		for (const [o, t] of c.ptr) {
			if (empty(t)) continue
			const r = views.resolve(view, o)
			if (!r || r.rest || r.last.k !== 'ref') return -1
			if (!views.map.has(r.last.to)) continue // (a key, bytes: what the program does with them is not checked)
			const m = matches(t, r.last.to, seen)
			if (m < 0) return -1
			n += m
		}
		return n
	}
	// (what tells an AccountInfo from other objects of pointers and words: a flag byte read or written, or
	// its data / lamports cell followed to the RefCell's borrow flag and value)
	const infoEvidence = (root: number): boolean => {
		const c = cls[find(root)], info = views.map.get('AccountInfo')!
		const flags = info.fields.filter(f => /^is_|^executable$/.test(f.name)).map(f => f.off)
		if ([...c.acc.values()].some(a => a.size === 1 && flags.includes(a.off))) return true
		for (const f of info.fields) {
			if (f.t.k !== 'ref' || !/Cell$/.test(f.t.to)) continue
			const t = c.ptr.get(f.off)
			const ks = t === undefined ? [] : [...cls[find(t)].acc.values()].map(a => a.off)
			if (ks.includes(0x10) && ks.includes(0x18)) return true
		}
		return false
	}
	const known = (root: number, view: string) => {
		viewOf.set(find(root), view)
		for (const [o, t] of cls[find(root)].ptr) {
			const r = views.resolve(view, o)
			if (r?.last.k === 'ref' && views.map.has(r.last.to) && !viewOf.has(find(t))) known(t, r.last.to)
			// (the data a DataCell points to: account data, its own view)
			else if (view === 'DataCell' && o === 0x18 && r?.last.k === 'ref' && !empty(t)) cls[find(t)].isData = true
		}
	}
	const build = (root: number, hint: string): string | undefined => {
		root = find(root)
		if (viewOf.has(root)) return viewOf.get(root) ?? undefined
		const c = cls[root]
		// (an AccountInfo: its accesses and those through its pointers fit the view, 3+ fields, one of them a pointer followed)
		if (views.map.has('AccountInfo') && c.ptr.size && infoEvidence(root) && matches(root, 'AccountInfo', new Set()) >= 3) { known(root, 'AccountInfo'); knownCls.add(root); return 'AccountInfo' }
		// (an AccountInfo's data RefCell box on its own: its borrow flag, data pointer and length accessed, nothing else)
		const at = (o: number) => c.acc.has(`${o}:8`)
		if (views.map.has('DataCell') && at(0x10) && at(0x18) && at(0x20) && matches(root, 'DataCell', new Set()) >= 3) { known(root, 'DataCell'); knownCls.add(root); return 'DataCell' }
		viewOf.set(root, null)
		if (c.opaque) return undefined
		// fields: the most used access at each place, when it does not overlap one chosen before
		const cand = [...c.acc.values()].sort((x, y) => y.n - x.n || x.off - y.off || y.size - x.size)
		const chosen: Acc[] = []
		for (const a of cand) if (!chosen.some(x => x.off < a.off + a.size && a.off < x.off + x.size)) chosen.push(a)
		if (chosen.length < 2) return undefined
		chosen.sort((x, y) => x.off - y.off)
		// the name: after a parameter it is (the first function's), else after the field pointing to it
		const m = [...c.members].sort((x, y) => x.pc - y.pc)[0]
		let name = hint
		let dm = [...c.data].filter(x => x.v >= 0).sort((x, y) => x.pc - y.pc)[0]
		if (!dm && c.isData) for (const [pc, memo] of nodeOf) { for (const [v, n] of memo) if (n !== null && find(n) === root) { dm = { pc, v }; break } if (dm) break }
		if (dm) name = `Data_${cfg.fnName(dm.pc).replace(/^fn_/, '')}`
		else if (m) {
			const info = cfg.built.get(m.pc)!.f.vars[m.v]
			const pn = info.param === 1 && cfg.outParam(m.pc) ? 'ret' : info.param >= 100 ? `p${5 + info.param - 100}` : PARAM_NAMES[info.param]
			name = `S_${cfg.fnName(m.pc).replace(/^fn_/, '')}_${pn}`
		}
		if (taken(name)) { let k = 2; while (taken(`${name}_${k}`)) k++; name = `${name}_${k}` }
		viewOf.set(root, name)
		const fields: Field[] = []
		const view = { name, doc: '', fields }
		views.add(view) // (reserved: pointer fields may refer back to it)
		synth.add(name)
		// (names known for a member's fields, e.g. the Accounts struct try_accounts returns through its out parameter)
		const hints = new Map<number, Field>()
		let hintWhy: string | undefined, hintName: ((off: number, size: number) => string | undefined) | undefined
		for (const x of c.members) {
			const h = cfg.fieldHints?.(x.pc, cfg.built.get(x.pc)!.f.vars[x.v].param)
			if (!h || (hintWhy && hintWhy !== h.why)) continue
			hintWhy ??= h.why
			hintName ??= h.name
			for (const [o, f] of h.fields ?? []) if (!hints.has(o)) hints.set(o, f)
		}
		const names = new Set<string>()
		let hinted = 0
		for (const a of chosen) {
			const hex = `0x${a.off.toString(16)}`
			const h = hints.get(a.off)
			if (h && !names.has(h.name) && ((h.t.k === 'ref' && a.size === 8) || (h.t.k === 'scalar' && h.t.size === a.size))) { fields.push({ ...h, off: a.off }); names.add(h.name); hinted++; continue }
			const t = a.size === 8 && c.ptr.has(a.off) && !empty(c.ptr.get(a.off)!) ? build(c.ptr.get(a.off)!, `${name}_${hex}`) : undefined
			const hn = !t ? hintName?.(a.off, a.size) : undefined
			if (hn && !names.has(hn)) { names.add(hn); hinted++; fields.push({ name: hn, off: a.off, t: { k: 'scalar', size: a.size as 1 | 2 | 4 | 8 } }); continue }
			fields.push(t ? { name: `f${hex}_ref`, off: a.off, t: { k: 'ref', to: t } } : { name: `f${hex}_u${a.size * 8}`, off: a.off, t: { k: 'scalar', size: a.size as 1 | 2 | 4 | 8 } })
		}
		const fns = new Set(c.members.map(x => x.pc))
		const where = dm ? `an account's data pointer (acc.data.ptr: offsets in the account data) in ${cfg.fnName(dm.pc)}${c.data.length > 1 || c.members.length ? ' and the functions it is passed to' : ''}` : m ? `parameter ${PARAM_NAMES[cfg.built.get(m.pc)!.f.vars[m.v].param] ?? 'p'} of ${cfg.fnName(m.pc)}${fns.size > 1 ? ` and ${fns.size - 1} more function${fns.size > 2 ? 's' : ''}` : ''}` : `the objects the field ${hint.replace(/_0x/, '.0x')} points to`
		view.doc = (`[heur] layout from the fixed-offset accesses through ${where} (fields: offset and size${hinted ? `; ${hinted} named after ${hintWhy}` : ''}; other bytes not described)`)
		return name
	}
	const out = new Map<number, Map<number, string>>()
	// (views of the parameters' objects first: a known view found there makes the data its RefCell points to account data)
	for (const [pc, memo] of nodeOf) for (const [v, n] of memo) if (n !== null && cfg.built.get(pc)!.f.vars[v].param >= 0) build(n, `S_${cfg.fnName(pc).replace(/^fn_/, '')}_local`)
	for (const [pc, memo] of nodeOf) for (const [v, n] of memo) {
		if (n === null || f0(pc, v)) continue
		const t = build(n, `S_${cfg.fnName(pc).replace(/^fn_/, '')}_local`)
		if (!t) continue
		let m = out.get(pc); if (!m) out.set(pc, (m = new Map()))
		m.set(v, t)
	}
	// small layouts of plain words (4 fields at most, no pointer field, no known names) are shared by every object
	// with that layout, named after it: S_u64_u64 (fields from offset 0 on, each after the last), else S_0x8u64_0x18u32
	const rename = new Map<string, string>(), shared = new Map<string, { names: string[] }>()
	for (const nm of synth) {
		const v = views.map.get(nm)!
		if (v.fields.length > 4 || nm.startsWith('Data_') || !v.fields.every(x => x.t.k === 'scalar' && /^f0x[0-9a-f]+_u\d+$/.test(x.name))) continue
		let end = 0
		const contiguous = v.fields.every(x => { const ok = x.off === end; end = x.off + (x.t as { size: number }).size; return ok })
		const shape = `S_${v.fields.map(x => `${contiguous ? '' : `0x${x.off.toString(16)}`}u${(x.t as { size: number }).size * 8}`).join('_')}`
		let sh = shared.get(shape)
		if (!sh) shared.set(shape, (sh = { names: [] }))
		sh.names.push(nm)
		rename.set(nm, shape)
	}
	for (const [shape, { names }] of shared) {
		const first = views.map.get(names[0])!
		for (const nm of names) { views.map.delete(nm); synth.delete(nm) }
		views.add({ name: shape, doc: `[heur] layout of plain words: the fixed-offset accesses through ${names.length > 1 ? `${names.length} unrelated objects with this layout` : 'an object'} (fields: offset and size; other bytes not described)`, fields: first.fields })
		synth.add(shape)
	}
	if (rename.size) for (const nm of synth) for (const x of views.map.get(nm)!.fields) if (x.t.k === 'ref' && rename.has(x.t.to)) x.t = { k: 'ref', to: rename.get(x.t.to)! }
	for (const m of out.values()) for (const [v, t] of m) if (rename.has(t)) m.set(v, rename.get(t)!)
	// (locals: typed through their pointer field, except account data pointers)
	function f0(pc: number, v: number) { const c = cls[find(nodeOf.get(pc)!.get(v)!)]; return cfg.built.get(pc)!.f.vars[v].param < 0 && !direct.has(`${pc}:${v}`) && !c.isData && !c.data.some(x => x.pc === pc && x.v === v) }
	return { types: out, synth }
}
