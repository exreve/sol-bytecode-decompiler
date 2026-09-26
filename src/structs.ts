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
	fieldHints?(pc: number, reg: number): { fields: Map<number, Field>; why: string } | undefined // known fields of a parameter's object (by offset), and where from
}

interface Acc { off: number; size: number; n: number }
interface Cls {
	acc: Map<string, Acc>          // `${off}:${size}` -> access count
	ptr: Map<number, number>       // offset -> node the 8-byte field there points to
	members: { pc: number; v: number }[]
	opaque: boolean
}

const MAX_OFF = 0x4000
const PARAM_NAMES = ['r0', 'a', 'b', 'c', 'd', 'e']

/** Per function: variable -> view name; the views are added to `views`. */
export function inferStructs(cfg: StructCfg, views: Views): { types: Map<number, Map<number, string>>; synth: Set<string> } {
	const synth = new Set<string>() // the views made here
	const parent: number[] = [], cls: Cls[] = []
	const find = (x: number): number => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
	const fresh = (): number => { const id = parent.length; parent.push(id); cls.push({ acc: new Map(), ptr: new Map(), members: [], opaque: false }); return id }
	const nodeOf = new Map<number, Map<number, number | null>>() // pc -> var -> node

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
				if (d?.length === 1 && d[0].k === 'set') {
					const e = d[0].e
					busy.add(v)
					if (e.k === 'load' && e.size === 8) { const b = base(e.addr); const bn = b && node(b.v); if (bn !== undefined) n = pointee(bn, b!.off) }
					else if (e.k === 'var') n = node(e.id)
					busy.delete(v)
				}
			}
			memo.set(v, n ?? null)
			return n
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
				const pv = cfg.built.get(cpc)!.f.vars.find(x => x.param === reg)
				if (!pv) return
				// (the argument: a pointer variable, or a pointer loaded from a field)
				let an: number | undefined
				if (a.k === 'var') an = node(a.id)
				else if (a.k === 'load' && a.size === 8) { const b = base(a.addr); const bn = b && node(b.v); if (bn !== undefined) an = pointee(bn, b!.off) }
				else if (fo(a) !== undefined) an = frameArg(fo(a)!, stmts, at)
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
						vals.forEach((x, i) => {
							visit(x)
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
	const calleeNode = (x: number): number | undefined => {
		const k = -1 - x, cpc = Math.floor(k / 256), reg = k % 256
		const f = cfg.built.get(cpc)?.f
		const pv = f?.vars.find(v => v.param === reg)
		const n = pv ? nodeOf.get(cpc)?.get(pv.id) : undefined
		return n ?? undefined
	}
	/** do the classes of a and b agree (recursively through their pointer fields)? */
	const agree = (a: number, b: number, seen: Set<string>): boolean => {
		a = find(a); b = find(b)
		if (a === b) return true
		const k = a < b ? `${a}:${b}` : `${b}:${a}`
		if (seen.has(k)) return true
		seen.add(k)
		const A = cls[a], B = cls[b]
		if (A.opaque !== B.opaque) return false
		for (const x of A.acc.values()) for (const y of B.acc.values()) {
			if (x.off === y.off && x.size === y.size) continue
			if (x.off < y.off + y.size && y.off < x.off + x.size) return false
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
		for (const [o, t] of cls[find(root)].ptr) { const r = views.resolve(view, o); if (r?.last.k === 'ref' && views.map.has(r.last.to) && !viewOf.has(find(t))) known(t, r.last.to) }
	}
	const build = (root: number, hint: string): string | undefined => {
		root = find(root)
		if (viewOf.has(root)) return viewOf.get(root) ?? undefined
		const c = cls[root]
		// (an AccountInfo: its accesses and those through its pointers fit the view, 3+ fields, one of them a pointer followed)
		if (views.map.has('AccountInfo') && c.ptr.size && infoEvidence(root) && matches(root, 'AccountInfo', new Set()) >= 3) { known(root, 'AccountInfo'); knownCls.add(root); return 'AccountInfo' }
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
		if (m) {
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
		let hintWhy: string | undefined
		for (const x of c.members) { const h = cfg.fieldHints?.(x.pc, cfg.built.get(x.pc)!.f.vars[x.v].param); if (h) { hintWhy ??= h.why; for (const [o, f] of h.fields) if (!hints.has(o)) hints.set(o, f) } }
		const names = new Set<string>()
		let hinted = 0
		for (const a of chosen) {
			const hex = `0x${a.off.toString(16)}`
			const h = hints.get(a.off)
			if (h && !names.has(h.name) && ((h.t.k === 'ref' && a.size === 8) || (h.t.k === 'scalar' && h.t.size === a.size))) { fields.push({ ...h, off: a.off }); names.add(h.name); hinted++; continue }
			const t = a.size === 8 && c.ptr.has(a.off) && !empty(c.ptr.get(a.off)!) ? build(c.ptr.get(a.off)!, `${name}_${hex}`) : undefined
			fields.push(t ? { name: `f${hex}_ref`, off: a.off, t: { k: 'ref', to: t } } : { name: `f${hex}_u${a.size * 8}`, off: a.off, t: { k: 'scalar', size: a.size as 1 | 2 | 4 | 8 } })
		}
		const fns = new Set(c.members.map(x => x.pc))
		const where = m ? `parameter ${PARAM_NAMES[cfg.built.get(m.pc)!.f.vars[m.v].param] ?? 'p'} of ${cfg.fnName(m.pc)}${fns.size > 1 ? ` and ${fns.size - 1} more function${fns.size > 2 ? 's' : ''}` : ''}` : `the objects the field ${hint.replace(/_0x/, '.0x')} points to`
		view.doc = (`[heur] layout from the fixed-offset accesses through ${where} (fields: offset and size${hinted ? `; ${hinted} named after ${hintWhy}` : ''}; other bytes not described)`)
		return name
	}
	const out = new Map<number, Map<number, string>>()
	for (const [pc, memo] of nodeOf) for (const [v, n] of memo) {
		if (n === null || f0(pc, v)) continue
		const t = build(n, `S_${pc.toString(16)}`)
		if (!t) continue
		let m = out.get(pc); if (!m) out.set(pc, (m = new Map()))
		m.set(v, t)
	}
	function f0(pc: number, v: number) { return cfg.built.get(pc)!.f.vars[v].param < 0 } // (locals: typed through their pointer field)
	return { types: out, synth }
}
