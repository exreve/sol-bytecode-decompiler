// Frame regions: stack objects known from where their bytes come from (naming only: nothing here
// changes semantics; a region is printed as `name` / `name.field` for addresses fp - k, and `name` is
// declared as that very address).
//
// A region starts where a call writes its result into a frame object (its first argument: the out
// parameter of a callee whose result layout is known, e.g. Anchor's try_accounts giving the Accounts
// struct), or where such an object's bytes are copied to another place of the frame (memcpy / copy /
// 8-byte loads stored elsewhere, at one constant distance): the copy holds the same object, at its own
// address. Regions are flow-sensitive: they apply to the statements between their start and the next
// write that replaces the object (a slot reused for another call's result gets one region per call,
// printed under a different name each: the names are aliases of the same address).
import { type CallTarget, type Expr, type Stmt, walkExpr } from './ir.ts'
import type { Node } from './structure.ts'

/** The object a call writes through its first argument: its view (at out + shift), a name for it, a name for copies of it. */
export interface Root { name: string; copyName: string; type?: string; shift?: number; size?: number; why: string; reused?: boolean }

export interface Region {
	id: number
	base: number // frame offset of the object's start (may lie below lo: a copy of its tail)
	lo: number   // frame bytes [lo, hi) holding it
	hi: number
	type?: string
	name: string
	copyName?: string // (a result: the name of its copies)
	why: string
	root: number // region of the call result it comes from (itself for a result)
	out: boolean // a call's result (ends when the slot's start is overwritten)
	reused?: boolean // (only a region when the slot holds several results)
	bad?: boolean    // an access does not fit the view: the name stays, the type goes
	dropped?: boolean
}

export interface RegionCfg {
	fp: number
	bases: number[] // frame object starts (sorted): the extent of an untyped result
	rootOf(t: CallTarget, args: Expr[], pc: number): Root | undefined
	typedSrc(e: Expr): { type: string; name: string } | undefined // a typed object outside the frame (a copy source)
	isCopy(t: CallTarget): boolean
	sizeOf(type: string): number | undefined
	fits(type: string, d: number, size: number): boolean
	embedded(type: string, off: number): { type: string; name: string } | undefined // the embedded object (a view) starting at off
}

export interface Regions { list: Region[]; at: Map<Node, number[]> }

interface Org { r: number; off: number } // a word of region r, at offset off from its base

/** An undoable map (the state around a branch). */
class UMap<K, V> extends Map<K, V> {
	log: [K, V | undefined, boolean][] = []
	override set(k: K, v: V): this { this.log?.push([k, super.get(k), super.has(k)]); return super.set(k, v) }
	override delete(k: K): boolean { if (super.has(k)) this.log.push([k, super.get(k), true]); return super.delete(k) }
	mark() { return this.log.length }
	undo(m: number): K[] {
		const ks: K[] = []
		while (this.log.length > m) { const [k, v, had] = this.log.pop()!; ks.push(k); if (had) super.set(k, v as V); else super.delete(k) }
		return ks
	}
}

const exits = (ns: Node[]) => { const l = ns[ns.length - 1]; return !!l && (l.k === 'return' || l.k === 'break' || l.k === 'continue' || l.k === 'trap') }
const hasBreak = (ns: Node[]): boolean => ns.some(n => n.k === 'break' || (n.k === 'if' && (hasBreak(n.then) || hasBreak(n.else))) || (n.k === 'block' && hasBreak(n.body)) || (n.k === 'switch' && n.cases.some(c => hasBreak(c.body))))

export function frameRegions(body: Node[], cfg: RegionCfg): Regions {
	const list: Region[] = [], at = new Map<Node, number[]>()
	const fo = (e: Expr): number | undefined => (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === cfg.fp && e.b.k === 'const' ? Number(BigInt.asIntN(64, e.b.v)) : undefined)
	const org = new UMap<number, Org>(), varOrg = new UMap<number, Org>()
	let act: number[] = []
	const accesses: { off: number; size: number; act: number[] }[] = []
	const nextBase = (o: number) => { for (const b of cfg.bases) if (b > o) return Math.min(b, o + 0x200); return o + 0x200 }
	const originOf = (e: Expr): Org | undefined => {
		if (e.k === 'var') return varOrg.get(e.id)
		if (e.k === 'load' && e.size === 8) { const o = fo(e.addr); return o === undefined ? undefined : org.get(o) }
		return undefined
	}
	const loads = (e: Expr) => walkExpr(e, x => { if (x.k === 'load') { const o = fo(x.addr); if (o !== undefined) accesses.push({ off: o, size: x.size, act }) } })
	const clobber = (o: number, n: number) => {
		if (!org.size) return
		if (n + 8 > org.size) { for (const w of [...org.keys()]) if (w + 8 > o && w < o + n) org.delete(w) }
		else for (let w = o - 7; w < o + n; w++) if (org.has(w)) org.delete(w)
	}
	const end = (keep: (r: Region) => boolean) => { const a = act.filter(id => keep(list[id])); if (a.length !== act.length) act = a }
	// a write not from a known object over the start of a call's result: the slot holds something else
	const overwrite = (o: number, n: number) => end(r => !(r.out && r.lo >= o && r.lo < o + n))
	const open = (r: Omit<Region, 'id'>): number => {
		const id = list.push({ ...r, id: list.length }) - 1
		// (regions it overlaps end, except ones containing it whole: a copy nested in a copy)
		end(x => x.hi <= r.lo || x.lo >= r.hi || (!x.out && x.lo <= r.lo && x.hi >= r.hi))
		act = [...act, id]
		return id
	}
	// bytes [d, d + n) now hold words of region src.r from offset src.off on: the region of that copy
	// (returns the words' new origin when the copy is of an embedded object: a region of its own)
	const copied = (d: number, n: number, src: Org): Org | undefined => {
		const s = list[src.r], base = d - src.off
		const x = act.map(id => list[id]).find(r => !r.out && r.root === s.root && r.base === base)
		if (x) { x.lo = Math.min(x.lo, d); x.hi = Math.max(x.hi, d + n); return undefined }
		const root = list[s.root]
		const size = root.type ? cfg.sizeOf(root.type) : undefined
		const why = 'a copy of such an object (memcpy / copy / word by word)'
		if (root.type && size && 2 * n >= size) { open({ base, lo: d, hi: d + n, type: root.type, name: root.copyName ?? root.name, why, root: s.root, out: false }); return undefined }
		// (a copy of an embedded object: at least half of it, from its start)
		const f = root.type ? cfg.embedded(root.type, src.off) : undefined
		const fs = f && cfg.sizeOf(f.type)
		if (f && fs && 2 * n >= fs && n <= fs) {
			const id = open({ base: d, lo: d, hi: d + n, type: f.type, name: f.name, copyName: f.name, why, root: list.length, out: false })
			return { r: id, off: 0 }
		}
		return undefined
	}
	const onCopy = (dst: Expr, src: Expr, n: number) => {
		const D = fo(dst), S = fo(src)
		if (D === undefined) return
		const words: (Org | undefined)[] = []
		if (S !== undefined) for (let i = 0; i < n >> 3; i++) words.push(org.get(S + 8 * i))
		const w0 = words[0]
		const run = !!w0 && words.every((w, i) => w && w.r === w0.r && w.off === w0.off + 8 * i)
		if (run && n >= 16) {
			clobber(D, n)
			const e = copied(D, n & ~7, w0!)
			words.forEach((w, i) => org.set(D + 8 * i, e ? { r: e.r, off: 8 * i } : w!))
			return
		}
		const t = S === undefined ? cfg.typedSrc(src) : undefined
		const size = t && cfg.sizeOf(t.type)
		clobber(D, n)
		if (t && size && n >= 16 && n <= size) {
			const id = list.push({ id: list.length, base: D, lo: D, hi: D, type: t.type, name: t.name, copyName: `${t.name}_copy`, why: '', root: list.length, out: false, dropped: true }) - 1
			copied(D, n & ~7, { r: id, off: 0 })
			for (let i = 0; i < n >> 3; i++) org.set(D + 8 * i, { r: id, off: 8 * i })
			return
		}
		overwrite(D, n)
	}
	const onCall = (t: CallTarget, args: Expr[], pc: number, dst: number) => {
		args.forEach(loads)
		if (dst >= 0) varOrg.delete(dst)
		if (cfg.isCopy(t) && args.length >= 3 && args[2].k === 'const' && args[2].v < 0x10000n) { onCopy(args[0], args[1], Number(args[2].v)); return }
		for (const a of args) { const g = fo(a); if (g !== undefined) { clobber(g, 0x100); if (t.k === 'sys') overwrite(g, 1) } }
		const O = args[0] && fo(args[0])
		if (O === undefined) return
		const r = cfg.rootOf(t, args, pc)
		if (!r) { overwrite(O, 1); return }
		const lo = O + (r.shift ?? 0), size = r.type ? r.size ?? cfg.sizeOf(r.type) : undefined
		const hi = size ? lo + size : nextBase(O)
		const id = open({ base: lo, lo, hi, type: size ? r.type : undefined, name: r.name, copyName: r.copyName, why: r.why, root: list.length, out: true, reused: r.reused })
		if (size) for (let w = 0; w + 8 <= size; w += 8) org.set(lo + w, { r: id, off: w })
	}
	const put = (D: number, i: number, v: Org | undefined) => {
		clobber(D + i, 8)
		if (!v) { overwrite(D + i, 8); return }
		org.set(D + i, v)
		const s = list[v.r], base = D + i - v.off
		const x = act.map(id => list[id]).find(r => !r.out && r.root === s.root && r.base === base)
		if (x) { x.lo = Math.min(x.lo, D + i); x.hi = Math.max(x.hi, D + i + 8) }
	}
	const onStmt = (s: Stmt) => {
		switch (s.k) {
			case 'set': {
				if (s.e.k === 'call') { onCall(s.e.t, s.e.args, s.pc, s.dst); return }
				loads(s.e)
				const o = originOf(s.e)
				if (o) varOrg.set(s.dst, o); else varOrg.delete(s.dst)
				return
			}
			case 'call': onCall(s.t, s.args, s.pc, s.dst); if (s.t.k === 'ind') loads(s.t.e); return
			case 'eval': loads(s.e); return
			case 'store': case 'stores': {
				const vals = s.k === 'store' ? [s.v] : s.vals
				loads(s.addr); vals.forEach(loads)
				const D = fo(s.addr)
				if (D === undefined) return
				vals.forEach((_, i) => accesses.push({ off: D + i * s.size, size: s.size, act }))
				if (s.size !== 8) { clobber(D, s.size * vals.length); overwrite(D, s.size * vals.length); return }
				const os = vals.map(originOf)
				// (a run of consistent words stored at once: a copy)
				const o0 = os[0]
				if (os.length >= 2 && o0 && os.every((o, i) => o && o.r === o0.r && o.off === o0.off + 8 * i)) {
					clobber(D, 8 * os.length)
					const e = copied(D, 8 * os.length, o0)
					os.forEach((o, i) => org.set(D + 8 * i, e ? { r: e.r, off: 8 * i } : o!))
					return
				}
				os.forEach((o, i) => put(D, 8 * i, o))
				return
			}
			case 'copy': onCopy(s.dst, s.src, s.n); return
		}
	}
	// frame bytes a list of nodes may write (an object established inside a loop is unknown at its head)
	const writes = (ns: Node[]): [number, number][] => {
		const w: [number, number][] = []
		const st = (s: Stmt) => {
			if (s.k === 'store' || s.k === 'stores') { const D = fo(s.addr); if (D !== undefined) w.push([D, D + s.size * (s.k === 'store' ? 1 : s.vals.length)]) }
			else if (s.k === 'copy') { const D = fo(s.dst); if (D !== undefined) w.push([D, D + s.n]) }
			else { const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined; if (c) for (const a of c.args) { const D = fo(a); if (D !== undefined) w.push([D, D + 0x10000]) } }
		}
		const visit = (xs: Node[]) => { for (const n of xs) { if (n.k === 'stmt') st(n.s); else if (n.k === 'if') { visit(n.then); visit(n.else) } else if (n.k === 'block' || n.k === 'loop') visit(n.body); else if (n.k === 'switch') n.cases.forEach(c => visit(c.body)) } }
		visit(ns)
		return w
	}
	const forget = (w: [number, number][]) => {
		if (!w.length) return
		end(r => !w.some(([a, b]) => a < r.hi && b > r.lo))
		for (const k of [...org.keys()]) if (w.some(([a, b]) => a < k + 8 && b > k)) org.delete(k)
		varOrg.clear()
	}
	const isolated = (ns: Node[]): { act: number[]; touched: number[]; vtouched: number[] } => {
		const a0 = act, m = org.mark(), v = varOrg.mark()
		walk(ns)
		const r = { act, touched: org.undo(m), vtouched: varOrg.undo(v) }
		act = a0
		return r
	}
	const meet = (xs: number[][]) => xs[0].filter(id => xs.every(x => x.includes(id)))
	const walk = (ns: Node[]) => {
		for (const n of ns) {
			if (n.k === 'loop') forget(writes(n.body))
			if (act.length && n.k !== 'stmt') at.set(n, act)
			switch (n.k) {
				// (a statement: the regions after it, e.g. the one its call's out argument starts)
				case 'stmt': onStmt(n.s); if (act.length) at.set(n, act); break
				case 'if': {
					loads(n.c)
					const te = exits(n.then), ee = exits(n.else)
					if (te && !ee) { isolated(n.then); walk(n.else) }
					else if (ee && !te) { isolated(n.else); walk(n.then) }
					else {
						const a = isolated(n.then), b = isolated(n.else)
						for (const k of [...a.touched, ...b.touched]) org.delete(k)
						for (const k of [...a.vtouched, ...b.vtouched]) varOrg.delete(k)
						if (!te) act = meet([a.act, b.act])
					}
					break
				}
				case 'block': {
					walk(n.body)
					if (hasBreak(n.body)) forget(writes(n.body))
					break
				}
				case 'loop': {
					if (n.c) loads(n.c)
					walk(n.body)
					forget(writes(n.body))
					break
				}
				case 'switch': {
					const rs = n.cases.map(c => isolated(c.body))
					for (const r of rs) { r.touched.forEach(k => org.delete(k)); r.vtouched.forEach(k => varOrg.delete(k)) }
					const live = rs.filter((_, i) => !exits(n.cases[i].body)).map(r => r.act)
					act = live.length ? meet(live) : act
					break
				}
				case 'return': if (n.e) loads(n.e); break
			}
		}
	}
	// (nothing to do without a call result of a known layout or a copy of a typed object)
	let any = false
	const scan = (ns: Node[]) => {
		for (const n of ns) {
			if (any) return
			if (n.k === 'stmt') {
				const s = n.s, c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
				if (c && c.args[0] && fo(c.args[0]) !== undefined && cfg.rootOf(c.t, c.args, s.pc)) any = true
				else if (c && cfg.isCopy(c.t) && c.args[1] && cfg.typedSrc(c.args[1])) any = true
				else if (s.k === 'copy' && cfg.typedSrc(s.src)) any = true
			} else if (n.k === 'if') { scan(n.then); scan(n.else) }
			else if (n.k === 'block' || n.k === 'loop') scan(n.body)
			else if (n.k === 'switch') n.cases.forEach(c => scan(c.body))
		}
	}
	scan(body)
	if (!any) return { list, at }
	walk(body)
	// results that are regions only where the slot is reused; copies of at least two words
	const perSlot = new Map<number, number>()
	for (const r of list) if (r.out && !r.dropped) perSlot.set(r.lo, (perSlot.get(r.lo) ?? 0) + 1)
	for (const r of list) {
		if (r.out && r.reused && (perSlot.get(r.lo) ?? 0) < 2) r.dropped = true
		if (!r.out && r.hi - r.lo < 16) r.dropped = true
	}
	for (const a of accesses) {
		const r = innermost(list, a.act, a.off)
		if (r?.type && !r.bad && !cfg.fits(r.type, a.off - r.base, a.size)) r.bad = true
	}
	return { list, at }
}

/** The innermost live region of an active set holding frame offset o. */
export function innermost(list: Region[], act: number[], o: number): Region | undefined {
	let best: Region | undefined
	for (const id of act) {
		const r = list[id]
		if (r.dropped || o < r.lo || o >= r.hi) continue
		if (!best || r.hi - r.lo < best.hi - best.lo) best = r
	}
	return best
}
