// Account data layouts from the Anchor IDL (views only: nothing here changes semantics).
//
// Each IDL account type becomes a view `<Name>Account`: the 8-byte discriminator, then the fields at
// their serialized offsets (Borsh: the fixed-offset prefix; zero-copy accounts are Pod, laid out the same
// way without padding). A pointer is taken to point to that data when its first 8 bytes are compared
// with the account's discriminator:
//   - v with ld64(v) == disc                  -> v is the data
//   - P with ld64(ld64(P)) == disc            -> P is a (ptr, len) slice of it: variables v = ld64(P) are
//     the data, and callees receiving P unmodified get the same fact for their parameter.
import type { VarFunc } from './dataflow.ts'
import { type Expr, walkExpr } from './ir.ts'
import { stmtExprs } from './simplify.ts'
import type { IdlInfo } from './idl.ts'
import type { Views } from './views.ts'

/** Views of the IDL's account types; returns discriminator -> view name. */
export function accountViews(idl: IdlInfo, views: Views): Map<bigint, string> {
	const out = new Map<bigint, string>()
	for (const a of idl.accounts) {
		const def = idl.types.get(a.name)
		if (def?.kind !== 'struct' || !Array.isArray(def.fields)) continue
		const fields = [{ name: 'discriminator', type: 'u64' }, ...def.fields.filter((f: any) => typeof f === 'object' && f.name).map((f: any) => ({ name: f.name, type: f.type }))]
		const name = `${a.name[0].toUpperCase()}${a.name.slice(1)}Account`
		if (views.map.has(name)) continue
		const v = views.borshView(name, `data of an account of type ${a.name} (Anchor IDL: 8-byte discriminator, then the fields in serialized order)`, fields, idl.types)
		if (v && v.fields.length > 1) out.set(a.disc, name)
	}
	return out
}

/**
 * Per function: variable id -> account data view, from discriminator comparisons (see file comment).
 * `record(view)`: the view of a serialized input record whose data has that layout (for ld64(r + 0x58) == disc).
 */
export function accountDataVars(funcs: Map<number, { f: VarFunc }>, discs: Map<bigint, string>, record: (view: string) => string): Map<number, Map<number, string>> {
	const res = new Map<number, Map<number, string>>()
	if (!discs.size) return res
	const slices = new Map<number, Map<number, string>>() // fn -> slice var -> view
	const setIn = (m: Map<number, Map<number, string>>, pc: number, v: number, t: string) => { let x = m.get(pc); if (!x) m.set(pc, (x = new Map())); if (x.has(v)) return false; x.set(v, t); return true }
	const defsOf = (f: VarFunc) => {
		const d = new Map<number, Expr[]>()
		for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'set' || s.k === 'call') { let a = d.get(s.dst); if (!a) d.set(s.dst, (a = [])); a.push(s.k === 'set' ? s.e : { k: 'undef' }) }
		return d
	}
	const info = new Map<number, { f: VarFunc; defs: Map<number, Expr[]> }>()
	for (const [pc, { f }] of funcs) info.set(pc, { f, defs: defsOf(f) })
	// local evidence
	for (const [pc, { f, defs }] of info) {
		let local = new Map<number, Expr>() // variable -> its last definition earlier in the current block
		const note = (e: Expr) => walkExpr(e, x => {
			if (x.k !== 'cmp' || (x.op !== 'eq' && x.op !== 'ne')) return
			let [l, c] = x.b.k === 'const' ? [x.a, x.b] : x.a.k === 'const' ? [x.b, x.a] : [undefined, undefined]
			const t = c && discs.get(c.v)
			const single = (v: number) => (defs.get(v)?.length ?? 0) <= 1
			if (l?.k === 'var') l = local.get(l.id) ?? (defs.get(l.id)?.length === 1 ? defs.get(l.id)![0] : l) // through a temporary
			if (!t || l?.k !== 'load' || l.size !== 8) return
			// the data of a serialized input record (zero-copy AccountLoader): ld64(r + 0x58)
			if (l.addr.k === 'bin' && l.addr.op === 'add' && l.addr.a.k === 'var' && l.addr.b.k === 'const' && l.addr.b.v === 0x58n && single(l.addr.a.id)) { setIn(res, pc, l.addr.a.id, record(t)); return }
			if (l.addr.k === 'var' && single(l.addr.id)) setIn(res, pc, l.addr.id, t)
			else if (l.addr.k === 'load' && l.addr.size === 8 && l.addr.addr.k === 'var' && single(l.addr.addr.id)) setIn(slices, pc, l.addr.addr.id, t)
		})
		for (const b of f.blocks) {
			local = new Map()
			for (const s of b.stmts) {
				stmtExprs(s).forEach(note)
				if (s.k === 'set') {
					// (a definition reading a variable redefined since is not reused)
					for (const [v, e] of local) { let uses = false; walkExpr(e, y => { if (y.k === 'var' && y.id === s.dst) uses = true }); if (uses) local.delete(v) }
					local.set(s.dst, s.e)
				} else if (s.k === 'call' && s.dst >= 0) local.delete(s.dst)
			}
			if (b.term.k === 'br') note(b.term.c)
		}
	}
	// slices: through direct calls (unmodified parameters), then v = ld64(P)
	for (let round = 0, changed = true; changed && round < 4; round++) {
		changed = false
		for (const [pc, sl] of [...slices]) {
			const { f } = info.get(pc)!
			for (const b of f.blocks) for (const s of b.stmts) {
				if (s.k !== 'call' || s.t.k !== 'fn') continue
				const cpc = s.t.pc, callee = info.get(cpc)
				if (!callee) continue
				s.args.forEach((a, i) => {
					const t = a.k === 'var' ? sl.get(a.id) : undefined
					const pv = t && callee.f.vars.find(v => v.param === i + 1)
					if (pv && !callee.defs.has(pv.id) && setIn(slices, cpc, pv.id, t!)) changed = true
				})
			}
		}
	}
	for (const [pc, sl] of slices) {
		const { defs } = info.get(pc)!
		for (const [v, es] of defs) if (es.length === 1 && es[0].k === 'load' && es[0].size === 8 && es[0].addr.k === 'var' && sl.has(es[0].addr.id)) setIn(res, pc, v, sl.get(es[0].addr.id)!)
	}
	return res
}
