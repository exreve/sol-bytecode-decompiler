// Semantic names for generated struct fields ([heur]; names only: nothing here changes what the output means).
//
// Inferred views (structs.ts: `f0x18_u64`, `f0x10_ref`) and account layouts found by runs (anchorstate.ts:
// `d0x49_u64`) name their fields after offset and size. This pass looks at how the program uses each such field
// (through typed variables, and through frame copies of a call's out object) and renames it when a use says what
// it is; the offset stays in a comment (`// +0x18 [heur: …]`, `// data +0x49 …` for account data):
//   * a 32-byte key (in place, or a pointer field holding its address) compared (memeq / memcmp / keyeq) with a
//     signer's key: `authority` (`owner_key` / `admin` when the message logged on the failing side says so); with
//     the key of an account the Accounts struct names: that name (Anchor's has_one); with a well-known program id:
//     its name (`token_program`); else the subject of the message logged when the comparison fails ("Invalid
//     mint" → `mint`, "X does not match …" → `x`, "X is not owned by …" → `x_owner`). A key in place in an
//     inferred view with no field there gets one (`Pubkey`: its address); one over four u64 words names them
//     `x_w0` … `x_w3`;
//   * a value compared, the message on failure naming it: "Invalid X" / "X does not match …" / "X must be …" /
//     "Insufficient X" → `x`, "X must be a signer" → `x_is_signer` (a flag in a copied AccountInfo);
//   * a u64 stored from / compared with Clock.unix_timestamp: `updated_ts` / `deadline` (subtracted from it:
//     `start_ts`), with Clock.slot: `updated_slot` / `slot`;
//   * a byte copied into a 1-byte seed of a PDA derivation or a signed CPI: `bump`; a field given as another seed:
//     `seed`;
//   * the field at offset 0 only ever written constants and compared with constants: `kind` (a variant tag); a
//     byte only tested against 0 and written 0 / 1, set where it is tested or next to a message about
//     initialization: `is_initialized`;
//   * a u64 updated in place by ± 1: `count`, by another amount: `balance`; passed to a token CPI wrapper: `amount`;
//   * a field copied from / to a named one (x.f = y.g): the same name.
// Names are per view (one type: the same names in every function; the most specific evidence wins, then the most
// frequent); a name taken twice in a view gets a suffix, names the analysis reads as AccountInfo fields (`owner`,
// `key`, …) get `_key`. Layouts shared by unrelated objects (`S_u64_u64`) are not named.
// Small unnamed functions are also named by role when unambiguous (`keys_eq`, `require_signer`).
import type { VarFunc } from './dataflow.ts'
import { type Expr, type Stmt, walkExpr, exprEq } from './ir.ts'
import { stmtExprs } from './simplify.ts'
import { exprType, type Views, type Field } from './views.ts'
import { KNOWN_KEYS } from './semantics.ts'
import { keyB58 } from './print.ts'

export interface FieldNameCfg {
	funcs: Map<number, VarFunc>                  // user functions (library code left out)
	types: (pc: number) => Map<number, string>   // view types of the variables of a function
	views: Views
	fnName: (pc: number) => string
	strAt: (ptr: bigint, len: bigint) => string | undefined
}

/** generated field names (offset and size) */
export const GENERATED = /^[fd]0x[0-9a-f]+_(u(8|16|32|64)|ref)$/
// names the analysis reads as AccountInfo / RefCell fields (a data field must not look like one)
const RESERVED = new Set(['key', 'owner', 'is_signer', 'is_writable', 'executable', 'rent_epoch', 'data', 'lamports', 'original_data_len', 'data_len', 'info', 'borrow', 'strong', 'weak', 'dup_marker', 'len', 'ptr', 'tag', 'val'])
const KEY_WORDS = /\b(owner|admin|authority)\b/

interface Vote { name: string; rank: number; why: string }
// (rank: the more specific the evidence, the lower)

/** A snake_case name for the thing a failure message is about (undefined: none clear). */
export function msgSubject(msg: string, value = false): string | undefined {
	const m0 = msg.trim().replace(/[.!]+$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
	if (m0.length > 120) return undefined
	const pats: [RegExp, string][] = [
		[/^(?:the )?([a-z][a-z0-9 _]*?) (?:provided |account )?(?:must be|is not|was not) (?:a )?signer\b/, '_is_signer'],
		[/^(?:the )?([a-z][a-z0-9 _]*?) (?:provided |account )?(?:must be|is not|was not) writable\b/, '_is_writable'],
		[/^(?:the )?([a-z][a-z0-9 _]*?) (?:provided |account )?(?:is )?not owned by\b/, '_owner'],
		[/^(?:invalid|incorrect|wrong|unexpected|mismatched) ([a-z][a-z0-9 _]*?)(?: provided| account| key| address| pubkey)?(?:$|[,:;(]| for\b| in\b| on\b)/, ''],
		[/^(?:the )?([a-z][a-z0-9 _]*?) (?:provided |account |key |address |pubkey )?(?:does not match|doesn't match|do not match|mismatch|is invalid|is incorrect|must match|must be)\b/, ''],
	]
	// (a value: not what an account is owned by, but a flag or what is short / wrong about it; a key: not a flag)
	if (!value) pats.splice(0, 2)
	else { pats.splice(2, 1); pats.push([/^(?:insufficient|not enough) ([a-z][a-z0-9 _]*?)(?:$|[,:;(]| for\b| in\b| to\b)/, '']) }
	for (const [re, suf] of pats) {
		const m = re.exec(m0)
		if (!m) continue
		const w = m[1].split(/[ _]+/).filter(x => x && !['the', 'a', 'an', 'provided', 'given'].includes(x))
		if (!w.length || w.length > 4 || w.some(x => !/^[a-z][a-z0-9]*$/.test(x) || /^(is|are|was|and|or|must|not|be|has|have|should|cannot|can)$/.test(x))) return undefined
		return w.join('_') + suf
	}
	return undefined
}

/**
 * Rename the generated fields of the views (in place) after how the functions use them. Returns the number of
 * fields named (and added).
 */
export function nameFields(cfg: FieldNameCfg): number {
	const { views } = cfg
	const votes = new Map<Field, { view: string; v: Vote[] }>()
	const added = new Map<string, Map<number, Vote[]>>() // view -> offset -> votes for a key field not declared
	const edges: [Loc, Loc][] = []
	const sharedMemo = new Map<string, boolean>()
	const shared = (l: Loc) => { let r = sharedMemo.get(l.view); if (r === undefined) sharedMemo.set(l.view, (r = /unrelated objects/.test(views.map.get(l.view)?.doc ?? ''))); return r }
	const vote = (loc: Loc | undefined, name: string, rank: number, why: string) => {
		// (not a layout shared by unrelated objects: what one does with a field says nothing about the others)
		if (!loc || !/^[a-z_][a-z0-9_]*$/.test(name) || shared(loc)) return
		if (loc.field) {
			if (!GENERATED.test(loc.field.name) || loc.rest) return
			let x = votes.get(loc.field)
			if (!x) votes.set(loc.field, (x = { view: loc.view, v: [] }))
			x.v.push({ name, rank, why })
		} else if (loc.key && views.map.get(loc.view)?.fields.some(x => GENERATED.test(x.name))) {
			let m = added.get(loc.view)
			if (!m) added.set(loc.view, (m = new Map()))
			let l = m.get(loc.off)
			if (!l) m.set(loc.off, (l = []))
			l.push({ name, rank, why })
		}
	}
	// (views with generated fields, or reaching one through their pointer / embedded fields)
	const gen = new Map<string, boolean>()
	const reach = (t: string): boolean => {
		const g = gen.get(t)
		if (g !== undefined) return g
		gen.set(t, false)
		const V = views.map.get(t)
		const r = !!V && V.fields.some(x => GENERATED.test(x.name) || (x.t.k === 'ref' ? reach(x.t.to) : x.t.k === 'embed' ? reach(x.t.type) : false))
		gen.set(t, r)
		return r
	}
	for (const [pc, f] of cfg.funcs) {
		// (only functions holding such an object, or calling one taking one)
		const any = [...cfg.types(pc).values()].some(reach) || f.blocks.some(b => b.stmts.some(s => {
			const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
			if (c?.t.k !== 'fn') return false
			const cf = cfg.funcs.get(c.t.pc)
			return !!cf && [...cfg.types(c.t.pc)].some(([v, t]) => cf.vars[v]?.param > 0 && reach(t))
		}))
		if (any) scan(cfg, pc, f, vote, (a, b) => { if (!shared(a) && !shared(b)) edges.push([a, b]) })
	}
	let n = 0
	// the best name per field (lowest rank, then the most votes)
	const pick = (vs: Vote[]): Vote => {
		const c = new Map<string, { v: Vote; n: number }>()
		for (const v of vs) { const x = c.get(v.name); if (!x) c.set(v.name, { v, n: 1 }); else { x.n++; if (v.rank < x.v.rank) x.v = v } }
		return [...c.values()].sort((a, b) => a.v.rank - b.v.rank || b.n - a.n || (a.v.name < b.v.name ? -1 : 1))[0].v
	}
	const byView = new Map<string, [Field, Vote][]>()
	for (const [fd, { view, v }] of votes) { let l = byView.get(view); if (!l) byView.set(view, (l = [])); l.push([fd, pick(v)]) }
	for (const [view, m] of added) {
		const V = views.map.get(view)
		if (!V) continue
		for (const [off, vs] of m) {
			// (only where no declared field overlaps the 32 bytes, inside the view's size)
			if (V.fields.some(x => x.off < off + 32 && off < x.off + views.width(x.t) * (x.count ?? 1)) || (V.size !== undefined && off + 32 > V.size)) continue
			const fd: Field = { name: `f0x${off.toString(16)}_key`, off, t: { k: 'embed', type: 'Pubkey' } }
			V.fields.push(fd)
			V.fields.sort((a, b) => a.off - b.off)
			let l = byView.get(view); if (!l) byView.set(view, (l = [])); l.push([fd, pick(vs)])
		}
	}
	// (fields copied from / to a named one: its name, a few steps)
	const chosen = new Map<Field, Vote>()
	for (const l of byView.values()) for (const [fd, v] of l) chosen.set(fd, v)
	for (let round = 0; round < 3; round++) {
		const add = new Map<Field, [Loc, Vote]>()
		for (const [a, b] of edges) for (const [x, y, dir] of [[a, b, 'from'], [b, a, 'to']] as const) {
			const v = chosen.get(y.field!)
			if (v && !chosen.has(x.field!) && !add.has(x.field!)) add.set(x.field!, [x, { name: v.name, rank: 9, why: `copied ${dir} ${y.view}.${v.name}` }])
		}
		if (!add.size) break
		for (const [x, v] of add.values()) { chosen.set(x.field!, v); let l = byView.get(x.view); if (!l) byView.set(x.view, (l = [])); l.push([x.field!, v]) }
	}
	for (const [view, list] of byView) {
		const V = views.map.get(view)!
		const renamed = new Set(list.map(([f]) => f))
		const names = new Set(V.fields.filter(x => !renamed.has(x)).map(x => x.name))
		let k = 0
		for (const [fd, v] of list.sort((a, b) => a[1].rank - b[1].rank || a[0].off - b[0].off)) {
			let nm = RESERVED.has(v.name) ? (fd.t.k === 'embed' || v.rank <= 2 ? `${v.name}_key` : `${v.name}_field`) : v.name
			if (names.has(nm)) { let i = 2; while (names.has(`${nm}_${i}`)) i++; nm = `${nm}_${i}` }
			names.add(nm)
			const was = fd.name, d = /^d0x([0-9a-f]+)_/.exec(was)
			fd.doc = `${d ? `data +0x${d[1]}` : `+0x${fd.off.toString(16)}`} [heur: ${v.why}]${fd.doc ? ` ${fd.doc}` : ''}`
			fd.name = nm
			k++
		}
		if (k) V.doc += `; ${k} field${k > 1 ? 's' : ''} named after their use [heur]`
		n += k
	}
	return n
}

interface Loc { view: string; field?: Field; rest: number; off: number; key?: boolean }

function scan(cfg: FieldNameCfg, pc: number, f: VarFunc, vote: (loc: Loc | undefined, name: string, rank: number, why: string) => void, edge: (a: Loc, b: Loc) => void) {
	const vote0 = vote
	const { views } = cfg
	const types = cfg.types(pc)
	const ty = (id: number) => types.get(id)
	const fp = f.vars.find(v => v.param === 10)?.id
	const defs = new Map<number, Expr | null>()
	const defAt = new Map<number, [number, number]>() // (where a single-definition variable is assigned)
	f.blocks.forEach((b, bi) => b.stmts.forEach((s, si) => { if ((s.k === 'set' || s.k === 'call') && s.dst >= 0) { defs.set(s.dst, defs.has(s.dst) || s.k === 'call' ? null : s.e); defAt.set(s.dst, [bi, si]) } }))
	let cur: [number, number] = [0, 0] // (the position of the statement looked at)
	/** the expression a single-definition variable holds (a few levels) */
	const val = (e: Expr, depth = 3): Expr => {
		while (depth-- > 0 && e.k === 'var' && f.vars[e.id]?.param < 0) { const d = defs.get(e.id); if (!d || d.k === 'call') break; e = d }
		return e
	}
	const frameOff = (e: Expr): number | undefined => {
		e = val(e, 2)
		return e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const' ? Number(BigInt.asIntN(64, e.b.v)) : undefined
	}
	/** the view field at an address (a field of a typed object, through embedded views) */
	const locMemo = new Map<Expr, Loc | undefined>()
	const loc = (addr: Expr): Loc | undefined => {
		if (locMemo.has(addr)) return locMemo.get(addr)
		const r = loc0(addr)
		locMemo.set(addr, r)
		return r
	}
	const loc0 = (addr: Expr): Loc | undefined => {
		let b: Expr = addr, off = 0
		if (addr.k === 'bin' && addr.op === 'add' && addr.b.k === 'const') { b = addr.a; off = Number(BigInt.asIntN(64, addr.b.v)) }
		if (off < 0 || off > 0x10000) return undefined
		let t = exprType(views, b, ty)
		if (!t && b.k === 'var') { const d = val(b); if (d !== b) t = exprType(views, d, ty) }
		return t ? locIn(t, off) : undefined
	}
	const locIn = (t: string, off: number): Loc | undefined => {
		for (let depth = 0; depth < 4; depth++) {
			const V = views.map.get(t)
			if (!V) return undefined
			if (V.size && off >= V.size) off %= V.size
			const fd = views.fieldAt(t, off)
			if (!fd) return { view: t, rest: 0, off }
			const d = off - fd.off
			if (fd.t.k === 'embed' && views.map.has(fd.t.type) && fd.count === undefined) { t = fd.t.type; off = d; continue }
			return { view: t, field: fd, rest: d, off }
		}
		return undefined
	}
	/** the field a value is loaded from: through a typed object, or a frame copy of one (a call's out object) */
	const loadLoc = (e: Expr, size?: number): Loc | undefined => {
		let at = cur
		for (let d = 0; d < 3 && e.k === 'var' && f.vars[e.id]?.param < 0; d++) {
			const x = defs.get(e.id)
			if (!x || x.k === 'call') break
			at = defAt.get(e.id)!; e = x
		}
		if (e.k === 'ext') e = val(e.a)
		if (e.k !== 'load' || (size !== undefined && e.size !== size)) return undefined
		const o = frameOff(e.addr)
		const l = o !== undefined ? frameField(o, e.size, at) : loc(e.addr)
		return l?.field && l.field.t.k !== 'embed' && !l.rest && (l.field.t.k === 'ref' ? e.size === 8 : l.field.t.size === e.size) ? l : undefined
	}
	const frameField = (o: number, size: number, at: [number, number], depth = 0): Loc | undefined => {
		const w = lastWrite(o, size, at)
		if (!w || 'store' in w) return undefined
		if ('view' in w) return locIn(w.view, w.off)
		const so = frameOff(w.src)
		return so !== undefined ? (depth < 4 ? frameField(so, size, w.at, depth + 1) : undefined) : loc(w.src)
	}

	// ---- 32-byte keys: what an address holding one is ----
	const copyOf = (s: Stmt): { dst: Expr; src: Expr; n: number } | undefined => {
		if (s.k === 'copy') return { dst: s.dst, src: s.src, n: s.n }
		const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
		if (c?.t.k !== 'fn' || c.args.length < 3 || !/^memcpy\d*_?$/.test(cfg.fnName(c.t.pc))) return undefined
		const n = val(c.args[2])
		return n.k === 'const' && n.v <= 0x10000n ? { dst: c.args[0], src: c.args[1], n: Number(n.v) } : undefined
	}
	const add = (e: Expr, d: number): Expr => (d === 0 ? e : e.k === 'bin' && e.op === 'add' && e.b.k === 'const' ? { k: 'bin', op: 'add', a: e.a, b: { k: 'const', v: e.b.v + BigInt(d) } } : { k: 'bin', op: 'add', a: e, b: { k: 'const', v: BigInt(d) } })
	/** the view of a callee's parameter (register reg) */
	const paramType = (cpc: number, reg: number): string | undefined => {
		const cf = cfg.funcs.get(cpc)
		const v = cf?.vars.find(x => x.param === reg)
		return v ? cfg.types(cpc).get(v.id) : undefined
	}
	type Write = { src: Expr; at: [number, number] } | { view: string; off: number } | { store: true } | undefined
	/**
	 * The last write over the frame bytes [o, o + n) before position at (same block, then single predecessors):
	 * a copy (its source there), a call given a frame address at most 0x400 below them (its out object's view),
	 * or a store.
	 */
	const lastWrite = (o: number, n: number, at: [number, number]): Write => {
		let [bi, si] = at
		for (let depth = 0; depth < 8; depth++) {
			const ss = f.blocks[bi].stmts
			for (let k = si - 1; k >= 0; k--) {
				const s = ss[k]
				const cp = copyOf(s)
				if (cp) {
					const D = frameOff(cp.dst)
					if (D === undefined) continue
					if (D <= o && o + n <= D + cp.n) return { src: add(cp.src, o - D), at: [bi, k] }
					if (D < o + n && o < D + cp.n) return undefined
					continue
				}
				if (s.k === 'store' || s.k === 'stores') {
					const D = frameOff(s.addr), w = s.k === 'store' ? s.size : s.size * s.vals.length
					if (D !== undefined && D < o + n && o < D + w) return { store: true }
					continue
				}
				const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
				if (!c) continue
				let best: { i: number; A: number } | undefined
				c.args.forEach((x, i) => { const A = frameOff(x); if (A !== undefined && A <= o && o - A < 0x400 && (!best || A > best.A)) best = { i, A } })
				if (!best) continue
				const { i, A } = best
				const view = c.t.k === 'fn' ? paramType(c.t.pc, i + 1) : undefined
				return view ? { view, off: o - A } : undefined
			}
			const ps = f.blocks[bi].preds
			if (ps.length !== 1) return undefined
			bi = ps[0]; si = f.blocks[bi].stmts.length
		}
		return undefined
	}
	// frame words stored once (four of them from the words of one 32-byte place: a key copied word by word)
	const words = new Map<number, Expr | null>()
	for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'store' || s.k === 'stores') && s.size === 8) {
		const o = frameOff(s.addr)
		if (o !== undefined) (s.k === 'store' ? [s.v] : s.vals).forEach((x, i) => words.set(o + 8 * i, words.has(o + 8 * i) ? null : x))
	}
	const exprKey = (e: Expr) => JSON.stringify(e, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
	/** an account: its AccountInfo (or input record) expression and index in an array of them */
	const acctId = (e: Expr): string => {
		e = val(e)
		if (e.k === 'bin' && e.op === 'add' && e.b.k === 'const' && e.b.v % 0x30n === 0n && exprType(views, e.a, ty) === 'AccountInfo') return `${exprKey(val(e.a))}#${e.b.v / 0x30n}`
		return `${exprKey(e)}#0`
	}
	type Key = { k: 'field'; loc: Loc; ptr?: boolean } | { k: 'acct'; e: Expr } | { k: 'const'; name: string } | undefined
	const keyOf = (a: Expr, at: [number, number], depth = 0): Key => {
		a = val(a)
		const o = frameOff(a)
		if (o !== undefined) {
			if (depth > 4) return undefined
			const w = lastWrite(o, 32, at)
			if (w && 'src' in w) return keyOf(w.src, w.at, depth + 1)
			if (w && 'view' in w) { const l = locIn(w.view, w.off); return l && (!l.field || (!l.rest && l.field.t.k !== 'ref')) ? { k: 'field', loc: l.field ? l : { ...l, key: true } } : undefined }
			if (w && 'store' in w) {
				const ls = [0, 8, 16, 24].map(i => words.get(o + i)).map(x => (x ? val(x) : undefined)).map(x => (x?.k === 'load' && x.size === 8 ? x.addr : undefined))
				const b0 = ls[0]
				if (b0 && ls.every((x, i) => x && exprEq(x, add(b0, 8 * i)))) return keyOf(b0, at, depth + 1)
			}
			return undefined
		}
		// (an account's key: AccountInfo.key (also of the k-th of an array), an input record's key)
		if (a.k === 'load' && a.size === 8) {
			const x = a.addr
			if (exprType(views, x, ty) === 'AccountInfo') return { k: 'acct', e: x }
			if (x.k === 'bin' && x.op === 'add' && x.b.k === 'const' && x.b.v % 0x30n === 0n && exprType(views, x.a, ty) === 'AccountInfo') return { k: 'acct', e: x }
		}
		if (a.k === 'bin' && a.op === 'add' && a.b.k === 'const' && a.b.v === 8n && /Record$/.test(exprType(views, a.a, ty) ?? '')) return { k: 'acct', e: a.a }
		// (a pointer field holding the key's address, or the key in place in a typed object)
		const ll = loadLoc(a, 8)
		if (ll) return { k: 'field', loc: ll, ptr: true }
		const l = loc(a)
		if (l && (!l.field || (!l.rest && l.field.t.k !== 'ref'))) return { k: 'field', loc: l.field ? l : { ...l, key: true } }
		return undefined
	}
	// accounts whose is_signer this function reads (found when first needed)
	let signers0: Set<string> | undefined
	const signers = (): Set<string> => {
		if (signers0) return signers0
		const r = (signers0 = new Set())
		for (const b of f.blocks) for (const e of [...b.stmts.flatMap(stmtExprs), ...(b.term.k === 'br' ? [b.term.c] : [])]) walkExpr(e, x => {
			if (x.k !== 'load' || x.size !== 1) return
			const a = x.addr
			if (a.k === 'bin' && a.op === 'add' && a.b.k === 'const') {
				const t = exprType(views, a.a, ty)
				if (t === 'AccountInfo' && a.b.v % 0x30n === 0x28n) r.add(`${exprKey(val(a.a))}#${a.b.v / 0x30n}`)
				else if (t && /Record$/.test(t) && a.b.v === 1n) r.add(`${exprKey(val(a.a))}#0`)
			}
		})
		return r
	}
	/** the name the Accounts struct gives an account (through its box / Account<T> view) */
	const acctName = (e: Expr): string | undefined => {
		for (let d = 0; d < 3; d++) {
			e = val(e)
			if (e.k !== 'load' || e.size !== 8) return undefined
			const l = loc(e.addr)
			if (!l?.field || l.rest) return undefined
			if (/(Accounts|Context)$/.test(l.view) && !GENERATED.test(l.field.name)) return l.field.name.replace(/_\d+$/, '')
			if (l.field.name !== 'info') return undefined
			e = e.addr.k === 'bin' ? e.addr.a : e.addr
		}
		return undefined
	}

	// ---- messages on the failing side of a branch ----
	const logIn = (bi: number): string | undefined => {
		for (let k = 0, at = bi; k < 3 && at >= 0 && at < f.blocks.length; k++) {
			const b = f.blocks[at]
			for (const s of b.stmts) {
				const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
				if (!c) continue
				const isLog = c.t.k === 'sys' ? c.t.name === 'sol_log_' : c.t.k === 'fn' && /^(log|msg|sol_log)\w*$/.test(cfg.fnName(c.t.pc))
				if (!isLog || c.args.length < 2) continue
				const p = val(c.args[0]), n = val(c.args[1])
				if (p.k === 'const' && n.k === 'const') { const t = cfg.strAt(p.v, n.v); if (t) return t }
			}
			if (b.term.k !== 'jmp') break
			at = b.term.to
		}
		return undefined
	}
	const branchMsg = (bi: number): string | undefined => {
		const t = f.blocks[bi].term
		if (t.k !== 'br') return undefined
		const a = logIn(t.t), b = logIn(t.f)
		return a && !b ? a : b && !a ? b : undefined
	}
	// the block whose branch tests an expression (directly or through the variable it is assigned to)
	// (built when first needed: expression -> block branching on it, variable -> block branching on it,
	// expression -> variable assigned it, variable -> variables computed from it)
	let cx: { condOf: Map<Expr, number>; condVars: Map<number, number>; setOf: Map<Expr, number>; usedBy: Map<number, number[]> } | undefined
	const conds = () => {
		if (cx) return cx
		cx = { condOf: new Map(), condVars: new Map(), setOf: new Map(), usedBy: new Map() }
		const c = cx
		f.blocks.forEach((b, bi) => { if (b.term.k === 'br') walkExpr(b.term.c, x => { c.condOf.set(x, bi); if (x.k === 'var') c.condVars.set(x.id, bi) }) })
		for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'set' && s.dst >= 0) walkExpr(s.e, x => { c.setOf.set(x, s.dst); if (x.k === 'var') { let l = c.usedBy.get(x.id); if (!l) c.usedBy.set(x.id, (l = [])); l.push(s.dst) } })
		return c
	}
	const msgForVar = (v: number, depth = 0): string | undefined => {
		const bi = conds().condVars.get(v)
		if (bi !== undefined) return branchMsg(bi)
		// (through a variable computed from it: `f = bc as u32; if (f == 0)`)
		if (depth < 2) for (const w of conds().usedBy.get(v) ?? []) { const m = msgForVar(w, depth + 1); if (m) return m }
		return undefined
	}
	const msgFor = (e: Expr): string | undefined => {
		const bi = conds().condOf.get(e)
		if (bi !== undefined) return branchMsg(bi)
		const v = conds().setOf.get(e)
		return v === undefined ? undefined : msgForVar(v)
	}

	const keyCompare = (a: Key, b: Key, msg: string | undefined) => {
		for (const [p, q] of [[a, b], [b, a]] as const) {
			if (p?.k !== 'field') continue
			const l0 = p.loc
			// (a key in place over word fields (four u64s, as a run on bit patterns cuts it): each word named)
			const words = !p.ptr && l0.field?.t.k === 'scalar' ? [0, 8, 16, 24].map(d => locIn(l0.view, l0.off + d)) : undefined
			if (words && !words.every(w => w?.field && !w.rest && w.field.t.k === 'scalar' && w.field.t.size === 8)) continue
			const vote = (_: Loc, name: string, rank: number, why: string) => {
				if (words) words.forEach((w, i) => vote0(w, `${name}_w${i}`, rank, `${why} (word ${i} of the key)`))
				else vote0(l0, name, rank, why)
			}
			const l = l0
			const sub = msg ? msgSubject(msg) : undefined
			const kw = msg ? KEY_WORDS.exec(msg.toLowerCase())?.[1] : undefined
			if (q?.k === 'acct') {
				const nm = acctName(q.e)
				if (signers().has(acctId(q.e))) vote(l, kw ?? 'authority', 1, `compared with the key of a signer${nm ? ` (${nm})` : ''}${kw ? ` ("${msg}")` : ''} in ${cfg.fnName(pc)}`)
				else if (nm) vote(l, nm, 0, `compared with the key of account ${nm} (has_one) in ${cfg.fnName(pc)}`)
				else if (sub) vote(l, sub, 2, `compared with an account's key; "${msg}" on failure in ${cfg.fnName(pc)}`)
			} else if (q?.k === 'const') vote(l, q.name, 3, `compared with the ${q.name} id in ${cfg.fnName(pc)}`)
			else if (sub) vote(l, sub, 2, `a key compared; "${msg}" on failure in ${cfg.fnName(pc)}`)
		}
	}

	// ---- clock values ----
	const clockSlots = new Map<number, true>()
	for (const b of f.blocks) for (const s of b.stmts) {
		const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
		if (!c) continue
		if ((c.t.k === 'sys' && c.t.name === 'sol_get_clock_sysvar') || (c.t.k === 'fn' && /clock/i.test(cfg.fnName(c.t.pc)))) { const o = c.args[0] && frameOff(c.args[0]); if (o !== undefined) clockSlots.set(o, true) }
	}
	const clockOf = (e: Expr): 'ts' | 'slot' | undefined => {
		e = val(e)
		if (e.k !== 'load' || e.size !== 8) return undefined
		const o = frameOff(e.addr)
		if (o === undefined) return undefined
		for (const c of clockSlots.keys()) { if (o === c + 0x20) return 'ts'; if (o === c) return 'slot' }
		return undefined
	}
	const hasClock = (e: Expr): 'ts' | 'slot' | undefined => {
		let r: 'ts' | 'slot' | undefined
		walkExpr(e, x => { r ??= clockOf(x) })
		if (!r && e.k === 'var') r = clockOf(e)
		if (!r) { const d = val(e); if (d !== e) walkExpr(d, x => { r ??= clockOf(x) }) }
		return r
	}

	// ---- PDA seeds: (ptr, len) pairs stored in the frame by a function deriving an address ----
	let pda = false
	for (const b of f.blocks) for (const s of b.stmts) {
		const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
		// (deriving an address, or signing a CPI with seeds)
		if (c && ((c.t.k === 'sys' && /program_address|invoke_signed/.test(c.t.name)) || (c.t.k === 'fn' && /program_address|invoke_signed|^cpi_/.test(cfg.fnName(c.t.pc))))) pda = true
	}
	const byteCopies = new Map<number, Loc>() // frame byte -> the u8 field copied there
	if (pda) for (const [bi, b] of f.blocks.entries()) for (const [si, s] of b.stmts.entries()) {
		cur = [bi, si]
		if (s.k !== 'store' || s.size !== 1) continue
		const o = frameOff(s.addr), l = loadLoc(s.v, 1)
		if (o !== undefined && l) byteCopies.set(o, l)
	}

	const fnm = cfg.fnName(pc)
	const onStmt = (s: Stmt) => {
		if (pda && (s.k === 'store' || s.k === 'stores') && s.size === 8) {
			const vals = s.k === 'store' ? [s.v] : s.vals
			const o = frameOff(s.addr)
			vals.forEach((x, i) => {
				// (a seed: its address, then its length)
				const len = i + 1 < vals.length ? val(vals[i + 1]) : undefined
				if (len?.k !== 'const' || len.v === 0n || len.v > 32n) return
				const fo = frameOff(x)
				const l = fo !== undefined ? (len.v === 1n ? byteCopies.get(fo) : undefined) : loc(val(x))
				if (!l || (l.field && l.rest)) return
				if (len.v === 1n) vote(l.field ? l : undefined, 'bump', 3, `given as a 1-byte PDA seed in ${fnm}`)
				else vote(l.field || len.v !== 32n ? l : { ...l, key: true }, 'seed', 5, `given as a PDA seed (${len.v} bytes) in ${fnm}`)
				void o
			})
		}
		if (s.k === 'store') {
			const l = loc(s.addr)
			if (!l?.field || l.rest || l.field.t.k === 'embed') return
			const v = val(s.v)
			const ck = hasClock(s.v)
			// (a field copied from another: the same name)
			const src = l.field.t.k === 'scalar' && GENERATED.test(l.field.name) ? loadLoc(s.v, s.size) : undefined
			if (src && src.field !== l.field && src.field!.t.k === 'scalar' && GENERATED.test(src.field!.name)) edge(l, src)
			if (ck && l.field.t.k === 'scalar' && l.field.t.size === 8) vote(l, ck === 'ts' ? 'updated_ts' : 'updated_slot', 4, `stored from Clock.${ck === 'ts' ? 'unix_timestamp' : 'slot'} in ${fnm}`)
			// (x.f = x.f ± d)
			if (v.k === 'bin' && (v.op === 'add' || v.op === 'sub') && l.field.t.k === 'scalar' && l.field.t.size >= 4) {
				const self = (e: Expr) => { const d = val(e); return d.k === 'load' && d.size === s.size && exprEq(d.addr, s.addr) }
				const other = self(v.a) ? v.b : v.op === 'add' && self(v.b) ? v.a : undefined
				if (other && !hasClock(other)) {
					const o = val(other)
					if (o.k === 'const' && (o.v === 1n || o.v === (1n << 64n) - 1n)) vote(l, 'count', 7, `updated in place by ${v.op === 'add' ? '+' : '-'} 1 in ${fnm}`)
					else if (o.k !== 'const') vote(l, 'balance', 6, `updated in place by ${v.op === 'add' ? '+' : '-'} an amount in ${fnm}`)
				}
			}
		}
		const c = s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : undefined
		if (c?.t.k === 'fn' && /^cpi_token_(transfer|mint_to|burn|approve)/.test(cfg.fnName(c.t.pc))) for (const a of c.args) { const l = loadLoc(a, 8); if (l && l.field!.t.k === 'scalar') vote(l, 'amount', 5, `passed to ${cfg.fnName(c.t.pc)} in ${fnm}`) }
		if (c && ((c.t.k === 'fn' && cfg.fnName(c.t.pc) === 'memcmp') || (c.t.k === 'sys' && c.t.name === 'sol_memcmp_'))) {
			const n = c.args[2] && val(c.args[2])
			if (n?.k === 'const' && n.v === 32n) keyCompare(keyOf(c.args[0], cur), keyOf(c.args[1], cur), (s.k === 'set' || s.k === 'call') && s.dst >= 0 ? msgForVar(s.dst) : undefined)
		}
	}
	const onExpr = (e: Expr) => walkExpr(e, x => {
		if (x.k === 'fn' && x.name === 'memeq' && x.args.length === 3) {
			const n = val(x.args[2])
			if (n.k === 'const' && n.v === 32n) keyCompare(keyOf(x.args[0], cur), keyOf(x.args[1], cur), msgFor(x))
		} else if (x.k === 'fn' && x.name === 'keyeq' && x.args.length === 5 && x.args.slice(1).every(a => a.k === 'const')) {
			const nm = KNOWN_KEYS[keyB58(x.args.slice(1))]
			const k = keyOf(x.args[0], cur)
			if (nm && nm !== 'SYSTEM_PROGRAM' && k?.k === 'field') keyCompare(k, { k: 'const', name: nm.toLowerCase() }, msgFor(x))
		} else if (x.k === 'cmp' && x.op !== 'set') {
			for (const [p, q] of [[x.a, x.b], [x.b, x.a]]) {
				const l = loadLoc(p)
				if (!l || l.field!.t.k !== 'scalar') continue
				const ck = hasClock(q)
				if (ck && l.field!.t.size === 8) vote(l, ck === 'ts' ? 'deadline' : 'slot', 4, `compared with Clock.${ck === 'ts' ? 'unix_timestamp' : 'slot'} in ${fnm}`)
				// (a value checked, a message naming it on failure: "Invalid X", "X mismatch", "Insufficient X")
				else if (!loadLoc(q)) {
					const m = msgFor(x), sub = m ? msgSubject(m, true) : undefined
					if (sub) vote(l, sub, 2, `compared; "${m}" on failure in ${fnm}`)
				}
			}
		} else if (x.k === 'bin' && x.op === 'sub' && hasClock(x.a)) {
			const l = loadLoc(x.b, 8)
			if (l && l.field!.t.k === 'scalar') vote(l, hasClock(x.a) === 'ts' ? 'start_ts' : 'start_slot', 4, `subtracted from Clock.${hasClock(x.a) === 'ts' ? 'unix_timestamp' : 'slot'} in ${fnm}`)
		}
	})
	for (const [bi, b] of f.blocks.entries()) {
		for (const [si, s] of b.stmts.entries()) { cur = [bi, si]; onStmt(s); stmtExprs(s).forEach(onExpr) }
		cur = [bi, b.stmts.length]
		if (b.term.k === 'br') onExpr(b.term.c)
		else if (b.term.k === 'ret' && b.term.e) onExpr(b.term.e)
	}

	// ---- tags and initialization flags: every use of the field in this function ----
	const uses = new Map<Field, { l: Loc; stores: bigint[]; nonConst: boolean; cmps: bigint[]; other: boolean; msgs: string[] }>()
	const use = (l: Loc) => { let u = uses.get(l.field!); if (!u) uses.set(l.field!, (u = { l, stores: [], nonConst: false, cmps: [], other: false, msgs: [] })); return u }
	// (a variable holding a field's value: its uses count as the load's)
	const varField = new Map<number, Loc>()
	for (const [v, d] of defs) {
		const ld = d?.k === 'ext' ? d.a : d
		if (ld?.k !== 'load') continue
		const l = loc(ld.addr)
		if (l?.field && !l.rest && l.field.t.k === 'scalar' && l.field.t.size === ld.size && GENERATED.test(l.field.name)) varField.set(v, l)
	}
	const visit = (e: Expr, parent?: Expr) => {
		let l: Loc | undefined
		if (e.k === 'load') { const x = loc(e.addr); if (x?.field && !x.rest && x.field.t.k === 'scalar' && x.field.t.size === e.size && GENERATED.test(x.field.name)) l = x }
		else if (e.k === 'var') l = varField.get(e.id)
		if (l) {
			const u = use(l)
			const other = parent?.k === 'cmp' ? (parent.a === e ? parent.b : parent.a) : undefined
			if (parent?.k === 'cmp' && (parent.op === 'eq' || parent.op === 'ne') && other?.k === 'const') { u.cmps.push(other.v); const m = msgFor(parent); if (m) u.msgs.push(m) }
			else u.other = true
		}
		switch (e.k) {
			case 'bin': case 'cmp': case 'land': case 'lor': visit(e.a, e); visit(e.b, e); break
			case 'sel': visit(e.c, e); visit(e.a, e); visit(e.b, e); break
			case 'load': visit(e.addr, e); break
			case 'ext': case 'neg': case 'not': case 'lnot': case 'bswap': visit(e.a, e); break
			case 'call': case 'fn': for (const x of e.args) visit(x, e); break
		}
	}
	for (const b of f.blocks) {
		for (const s of b.stmts) {
			if (s.k === 'store' || s.k === 'stores') {
				const vals = s.k === 'store' ? [s.v] : s.vals
				const ab = s.addr.k === 'bin' && s.addr.op === 'add' && s.addr.b.k === 'const' ? { a: s.addr.a, o: s.addr.b.v } : { a: s.addr, o: 0n }
				vals.forEach((x, i) => {
					const l = loc(i ? { k: 'bin', op: 'add', a: ab.a, b: { k: 'const', v: ab.o + BigInt(i * s.size) } } : s.addr)
					if (l?.field && !l.rest && l.field.t.k === 'scalar' && l.field.t.size === s.size && GENERATED.test(l.field.name)) { const u = use(l); const c = val(x); if (c.k === 'const') u.stores.push(c.v); else u.nonConst = true }
				})
			}
			// (the definition of such a variable: not a use)
			if (s.k === 'set' && varField.has(s.dst)) { const ld = s.e.k === 'ext' ? s.e.a : s.e; if (ld.k === 'load') visit(ld.addr, ld); continue }
			for (const e of stmtExprs(s)) visit(e)
		}
		if (b.term.k === 'br') { const c = b.term.c; const l = c.k === 'var' ? varField.get(c.id) : undefined; if (l) use(l).cmps.push(0n); else visit(c) }
		else if (b.term.k === 'ret' && b.term.e) visit(b.term.e)
	}
	for (const [, u] of uses) {
		if (u.nonConst || u.other) continue
		const fd = u.l.field!
		const bool = [...u.stores, ...u.cmps].every(x => x === 0n || x === 1n)
		const initMsg = u.msgs.some(m => /initiali[sz]ed/i.test(m))
		if (fd.t.k === 'scalar' && fd.t.size === 1 && bool && u.cmps.length && (initMsg || (u.stores.includes(1n) && u.cmps.includes(0n))) ) vote(u.l, 'is_initialized', 4, `a flag tested against 0${u.stores.includes(1n) ? ' and set to 1' : ''}${initMsg ? ` ("${u.msgs.find(m => /initiali[sz]ed/i.test(m))}")` : ''} in ${fnm}`)
		else if (fd.off === 0 && u.l.off === 0 && (u.cmps.some(x => x !== 0n) || (u.stores.length && !u.cmps.length && u.stores.some(x => x !== 0n))) && fd.t.k === 'scalar') vote(u.l, 'kind', 8, `offset 0, only written and compared constants (a variant tag) in ${fnm}`)
	}
}

/**
 * Role names of small unnamed functions ([heur]): `keys_eq` (compares the 32 bytes two pointer parameters
 * point to, word by word), `require_signer` (reads the is_signer flag of an AccountInfo parameter and returns or
 * writes an error constant when it is clear, nothing else).
 */
export function roleNames(cfg: FieldNameCfg): Map<number, { name: string; why: string }> {
	const out = new Map<number, { name: string; why: string }>()
	for (const [pc, f] of cfg.funcs) {
		if (!/^fn_[0-9a-f]+$/.test(cfg.fnName(pc))) continue
		const stmts = f.blocks.flatMap(b => b.stmts)
		if (stmts.length > 24 || f.blocks.length > 12) continue
		const params = f.vars.filter(v => v.param >= 1 && v.param <= 5)
		const types = cfg.types(pc)
		const exprs = [...stmts.flatMap(stmtExprs), ...f.blocks.flatMap(b => (b.term.k === 'br' ? [b.term.c] : b.term.k === 'ret' && b.term.e ? [b.term.e] : []))]
		const loads: Expr[] = [], calls: Expr[] = []
		for (const e of exprs) walkExpr(e, x => { if (x.k === 'load') loads.push(x); else if (x.k === 'call') calls.push(x) })
		const hasCall = stmts.some(s => s.k === 'call' || (s.k === 'set' && s.e.k === 'call'))
		const hasStore = stmts.some(s => s.k === 'store' || s.k === 'stores' || s.k === 'copy')
		// keys_eq: loads only of the words 0..3 of two parameters, compared pairwise; or memeq(a, b, 32)
		const pv = new Set(params.map(v => v.id))
		const wordOf = (a: Expr): [number, number] | undefined => {
			if (a.k === 'var' && pv.has(a.id)) return [a.id, 0]
			if (a.k === 'bin' && a.op === 'add' && a.a.k === 'var' && pv.has(a.a.id) && a.b.k === 'const') return [a.a.id, Number(a.b.v)]
			return undefined
		}
		const memeq32 = exprs.some(e => { let r = false; walkExpr(e, x => { if (x.k === 'fn' && x.name === 'memeq' && x.args.length === 3 && x.args[2].k === 'const' && x.args[2].v === 32n && x.args.slice(0, 2).every(a => a.k === 'var' && pv.has(a.id))) r = true }); return r })
		if (!hasCall && !hasStore && params.length === 2 && f.blocks.some(b => b.term.k === 'ret' && b.term.e)) {
			const ws = loads.map(l => (l.k === 'load' && l.size === 8 ? wordOf(l.addr) : undefined))
			const offs = new Set(ws.map(w => (w ? `${w[0]}:${w[1]}` : 'x')))
			const want = params.flatMap(p => [0, 8, 16, 24].map(o => `${p.id}:${o}`))
			if (memeq32 && !loads.length || (!offs.has('x') && offs.size === 8 && want.every(k => offs.has(k)))) { out.set(pc, { name: 'keys_eq', why: 'compares the 32 bytes its two pointer parameters point to (a key comparison)' }); continue }
		}
		// require_signer: an AccountInfo parameter's is_signer read and branched on; nothing else loaded, stored
		// constants only, no call but a log
		const infos = params.filter(v => types.get(v.id) === 'AccountInfo')
		if (infos.length === 1 && f.blocks.some(b => b.term.k === 'br')) {
			const iv = infos[0].id
			const isSigner = (x: Expr) => x.k === 'load' && x.size === 1 && x.addr.k === 'bin' && x.addr.op === 'add' && x.addr.a.k === 'var' && x.addr.a.id === iv && x.addr.b.k === 'const' && x.addr.b.v === 0x28n
			const okLoads = loads.every(x => isSigner(x) || (x.k === 'load' && x.size === 8 && ((x.addr.k === 'var' && x.addr.id === iv))))
			const okStores = stmts.every(s => s.k === 'set' || s.k === 'eval' || (s.k === 'store' && s.v.k === 'const') || (s.k === 'stores' && s.vals.every(v => v.k === 'const')) || (s.k === 'call' && s.t.k === 'sys' && /^sol_log/.test(s.t.name)))
			if (loads.some(isSigner) && okLoads && okStores && calls.every(c => c.k === 'call' && c.t.k === 'sys' && /^sol_log/.test(c.t.name))) out.set(pc, { name: 'require_signer', why: 'reads the is_signer flag of its AccountInfo parameter and gives an error constant when it is clear' })
		}
	}
	return out
}
