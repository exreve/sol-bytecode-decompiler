// IR-level support for the program analysis (report.ts): control-flow graphs with real dominators (which
// checks dominate which operations, and the paths that bypass a check), and facts the printed text does
// not show: Anchor account fields written back on exit (Borsh serialization of the handler's copy of an
// `Account<T>`), native instruction dispatchers (per-instruction regions of a function that matches on
// the instruction tag), indirect calls through constant function pointers / tables, and native
// `&[AccountInfo]` slices (account[i] by offset).
//
// Everything here is DERIVED and over-approximate (see report.ts); it reads the IR the decompiled text is
// printed from and never changes it.
import type { FuncOut, Result } from '../decompile.ts'
import type { VarFunc } from '../dataflow.ts'
import type { CallTarget, Expr, Stmt } from '../ir.ts'
import { walkExpr, NEG_CMP } from '../ir.ts'
import { computeRpo, dominators } from '../structure.ts'
import { stmtExprs } from '../simplify.ts'
import { borshSize, structFields } from '../idl.ts'
import type { FieldType } from '../views.ts'
import { knownFamilies } from '../cpi.ts'
import type { Op, OpKind } from './facts.ts'

// ---- control-flow graphs ----

export interface Cfg {
	fo: FuncOut
	rpo: Int32Array
	idom: Int32Array
	pcBlock: Map<number, number>   // statement / instruction pc -> block
	condBlock: Map<Expr, number>   // a branch condition (by identity) -> its block
	condKey?: Map<string, number[]> // (lazily) a branch condition's shape up to negation -> its blocks
	retBlock: Map<Expr, number>    // a returned expression (by identity) -> its block
}

const cfgMemo = new WeakMap<FuncOut, Cfg>()
export function cfgOf(fo: FuncOut): Cfg {
	let g = cfgMemo.get(fo)
	if (g) return g
	const f = fo.f
	const { order, rpo } = computeRpo(f)
	const idom = dominators(f, order, rpo)
	const pcBlock = new Map<number, number>(), condBlock = new Map<Expr, number>(), retBlock = new Map<Expr, number>()
	f.blocks.forEach((b, i) => {
		if (rpo[i] < 0) return
		for (const s of b.stmts) if (!pcBlock.has(s.pc)) pcBlock.set(s.pc, i)
		if (!pcBlock.has(b.end)) pcBlock.set(b.end, i)
		if (b.term.k === 'br') condBlock.set(b.term.c, i)
		else if (b.term.k === 'ret' && b.term.e) retBlock.set(b.term.e, i)
	})
	g = { fo, rpo, idom, pcBlock, condBlock, retBlock }
	cfgMemo.set(fo, g)
	return g
}

export function dominates(g: Cfg, a: number, b: number): boolean {
	if (g.rpo[a] < 0 || g.rpo[b] < 0) return false
	for (let k = 0; k < 100000; k++) { if (a === b) return true; if (b === 0) return false; b = g.idom[b] }
	return false
}

/** a condition's shape up to negation (lnot, the negated comparison) */
function condKey(e: Expr, d = 0): string {
	if (d > 8) return '…'
	switch (e.k) {
		case 'lnot': return d === 0 ? condKey(e.a, d) : `!${condKey(e.a, d + 1)}`
		case 'cmp': { const n = NEG_CMP[e.op]; return `(${d === 0 && n ? [e.op, n].sort().join('/') : e.op} ${condKey(e.a, d + 1)} ${condKey(e.b, d + 1)})` }
		case 'var': return `v${e.id}`
		case 'const': return `${e.v}`
		case 'load': return `ld${e.size}(${condKey(e.addr, d + 1)})`
		case 'bin': return `(${e.op} ${condKey(e.a, d + 1)} ${condKey(e.b, d + 1)})`
		case 'ext': return `x${e.signed ? 's' : 'u'}${e.bits}(${condKey(e.a, d + 1)})`
		case 'land': case 'lor': return `(${e.k} ${condKey(e.a, d + 1)} ${condKey(e.b, d + 1)})`
		case 'fn': case 'call': return `${e.k === 'fn' ? e.name : 'call'}(${e.args.map(a => condKey(a, d + 1)).join(',')})`
		default: return e.k
	}
}

/** The block deciding a check's condition: the branch whose condition is (a leaf of) it, else the fail side's branching predecessor. */
export function decisionBlock(g: Cfg, c: Expr | undefined, failPc: number | undefined, passPc?: number): number | undefined {
	const leaves: number[] = []
	const leaf = (e: Expr) => {
		const b = g.condBlock.get(e)
		if (b !== undefined) { leaves.push(b); return }
		if (e.k === 'lnot') leaf(e.a)
		else if (e.k === 'land' || e.k === 'lor') { leaf(e.a); leaf(e.b) }
	}
	if (c) leaf(c)
	// (a condition the structuring rebuilt, e.g. negated: the one branch with the same condition up to negation)
	// (several such branches, e.g. duplicated tails: the ones leading to the failing side within a few jumps)
	if (!leaves.length && c) {
		if (!g.condKey) { g.condKey = new Map(); for (const [e, b] of g.condBlock) { const k = condKey(e); const l = g.condKey.get(k); if (l) l.push(b); else g.condKey.set(k, [b]) } }
		let bs = g.condKey.get(condKey(c)) ?? []
		// (statements are duplicated with their pc: each side by its first statement's pc, in the block or a jump or two after it)
		const leads = (s: number, pc: number) => { for (let k = 0; k < 4; k++) { const x = g.fo.f.blocks[s]; if (x.stmts.some(st => st.pc === pc)) return true; if (x.succs.length !== 1) return false; s = x.succs[0] } return false }
		for (const pc of [failPc, passPc]) if (bs.length > 1 && pc !== undefined) bs = bs.filter(b => g.fo.f.blocks[b].succs.some(s => leads(s, pc)))
		if (bs.length === 1) leaves.push(bs[0])
	}
	if (leaves.length) return leaves.reduce((a, b) => (g.rpo[a] <= g.rpo[b] ? a : b))
	if (failPc === undefined) return undefined
	let b = g.pcBlock.get(failPc)
	const blocks = g.fo.f.blocks
	for (let k = 0; b !== undefined && k < 4; k++) {
		const ps = blocks[b].preds.filter(p => g.rpo[p] >= 0)
		if (ps.length !== 1) return undefined
		b = ps[0]
		if (blocks[b].term.k === 'br') return b
	}
	return undefined
}

/** A path from the function's entry to block `to` that avoids block `avoid` (block ids), or undefined. */
export function bypass(g: Cfg, avoid: number, to: number, allowed?: (b: number) => boolean): number[] | undefined {
	if (avoid === 0) return undefined
	const blocks = g.fo.f.blocks
	const prev = new Int32Array(blocks.length).fill(-2)
	prev[0] = -1
	const q = [0]
	while (q.length) {
		const b = q.shift()!
		if (b === to) {
			const path: number[] = []
			for (let x = b; x >= 0; x = prev[x]) path.push(x)
			return path.reverse()
		}
		for (const s of blocks[b].succs) if (s !== avoid && prev[s] === -2 && (!allowed || allowed(s))) { prev[s] = b; q.push(s) }
	}
	return undefined
}

/** The first statement pc of a block (its start when it has none). */
export const blockPc = (g: Cfg, b: number) => g.fo.f.blocks[b].stmts[0]?.pc ?? g.fo.f.blocks[b].start

// ---- small IR helpers ----

export const callOf = (s: Stmt): { t: Extract<Stmt, { k: 'call' }>['t']; args: Expr[] } | undefined =>
	s.k === 'call' ? s : s.k === 'set' && s.e.k === 'call' ? s.e : s.k === 'eval' && s.e.k === 'call' ? s.e : undefined

const fpOf = (fo: FuncOut) => fo.f.vars.find(v => v.param === 10)?.id ?? -1
const offOf = (e: Expr, base: number): number | undefined =>
	e.k === 'var' && e.id === base ? 0 : e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === base && e.b.k === 'const' ? Number(BigInt.asIntN(64, e.b.v)) : undefined

/** statements of a function in block (address) order */
function* stmtsOf(fo: FuncOut): Generator<Stmt> {
	for (const b of [...fo.f.blocks].sort((x, y) => x.start - y.start)) yield* b.stmts
}

/** variables with a single definition (`set`): their expression */
export function singleDefs(fo: FuncOut): Map<number, Expr> {
	const out = new Map<number, Expr>(), multi = new Set<number>()
	for (const b of fo.f.blocks) for (const s of b.stmts) {
		const d = s.k === 'set' ? s.dst : s.k === 'call' ? s.dst : -1
		if (d < 0) continue
		if (out.has(d) || multi.has(d) || s.k !== 'set') { out.delete(d); multi.add(d) } else out.set(d, s.e)
	}
	return out
}

/** the printed right-hand side of a store line `stNN(addr, value)` / `x.f = value` */
function storeValue(line: string): string {
	const t = line.trim()
	const m = /^st\d+\((.*)\)$/.exec(t)
	if (!m) { const a = / = (.*)$/.exec(t); return a ? a[1] : t }
	let depth = 0
	for (let i = 0; i < m[1].length; i++) {
		const ch = m[1][i]
		if (ch === '(' || ch === '[') depth++
		else if (ch === ')' || ch === ']') depth--
		else if (ch === ',' && depth === 0) return m[1].slice(i + 1).trim()
	}
	return t
}

// ---- Anchor: fields written back on exit ----

export interface ExitFn { type?: string; param: number; fields: { off: number; size: number; name: string }[] }

const AUTHORITY = /authority|admin|owner|manager|operator|governor|guardian|upgrade|delegate/i

/**
 * Functions serializing an account object back (Anchor `AccountsExit` of `Account<T>`): calls of one
 * writer `W(sink, ptr, len)` in address order, the first with an 8-byte constant (the discriminator), the
 * others with `obj + off` (or a frame slot just loaded from it) of a parameter `obj`. Field i of T (IDL
 * order = Borsh order) is at in-memory offset off_i.
 */
export function exitFns(r: Result): Map<number, ExitFn> {
	const out = new Map<number, ExitFn>()
	const p = r.program, idl = r.idl
	const discType = new Map<bigint, string>()
	for (const a of idl?.accounts ?? []) discType.set(a.disc, a.name)
	for (const fo of r.funcs) {
		const f = fo.f
		if (f.blocks.length > 400) continue
		const params = new Map<number, number>()
		for (const v of f.vars) if (v.param >= 1 && v.param <= 5) params.set(v.id, v.param)
		if (!params.size) continue
		const fp = fpOf(fo)
		const slot = new Map<number, Expr>() // frame offset -> value last stored
		const byW = new Map<number, { disc?: bigint; writes: { param: number; off: number; size: number }[] }>()
		for (const s of stmtsOf(fo)) {
			if (s.k === 'store') { const o = offOf(s.addr, fp); if (o !== undefined) slot.set(o, s.v) }
			const c = callOf(s)
			if (!c || c.t.k !== 'fn' || c.args.length < 3 || c.args[2].k !== 'const') continue
			const len = Number(c.args[2].v), a = c.args[1]
			let rec = byW.get(c.t.pc)
			if (a.k === 'const' && len === 8 && !rec) {
				const v = p.image.readConst(a.v, 8)
				if (v !== undefined) byW.set(c.t.pc, { disc: v, writes: [] })
				continue
			}
			if (!rec) continue
			let src: Expr = a
			const fo2 = offOf(a, fp)
			if (fo2 !== undefined) { const v = slot.get(fo2); if (v?.k === 'load' && v.size === len) src = v.addr }
			const base = src.k === 'var' ? src.id : src.k === 'bin' && src.op === 'add' && src.a.k === 'var' && src.b.k === 'const' ? src.a.id : -1
			const pi = params.get(base)
			if (pi === undefined) continue
			rec.writes.push({ param: pi, off: offOf(src, base)!, size: len })
		}
		for (const rec of byW.values()) {
			const ws = rec.writes
			if (ws.length < 2 || rec.disc === undefined || !ws.every(w => w.param === ws[0].param)) continue
			const type = discType.get(rec.disc)
			if (idl && !type) continue
			// field names: the IDL struct's fields in order, while the Borsh sizes agree
			const fields: ExitFn['fields'] = []
			const defs = type && idl ? structFields(type, idl.types) : undefined
			let data = 8
			ws.forEach((w, i) => {
				const d = defs?.[i]
				const z = d && idl ? borshSize(d.type, idl.types, 0) : undefined
				const name = d && z === w.size && fields.length === i && (i === 0 || fields[i - 1].name.indexOf('[') < 0) ? d.name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase() : `data[${data}..${data + w.size}]`
				fields.push({ off: w.off, size: w.size, name })
				data += w.size
			})
			out.set(fo.pc, { type, param: ws[0].param, fields })
			break
		}
	}
	// (wrappers passing a parameter (+ an offset) on as the object: an Accounts struct's exit calling its accounts' exits)
	for (let round = 0; round < 2; round++) for (const fo of r.funcs) {
		if (out.has(fo.pc) || fo.f.blocks.length > 400) continue
		const params = new Map<number, number>()
		for (const v of fo.f.vars) if (v.param >= 1 && v.param <= 5) params.set(v.id, v.param)
		for (const s of stmtsOf(fo)) {
			const c = callOf(s)
			const ex = c?.t.k === 'fn' ? out.get(c.t.pc) : undefined
			const a = ex && c!.args[ex.param - 1]
			const base = a?.k === 'var' ? a.id : a?.k === 'bin' && a.op === 'add' && a.a.k === 'var' && a.b.k === 'const' ? a.a.id : -1
			const pi = params.get(base)
			if (!ex || pi === undefined) continue
			const d = offOf(a!, base)!
			out.set(fo.pc, { type: ex.type, param: pi, fields: ex.fields.map(x => ({ ...x, off: x.off + d })) })
			break
		}
	}
	return out
}

/**
 * Stores into the fields of an account object before its exit function serializes it: ACCOUNT_DATA_WRITE
 * operations of `<account>.<field>` added to the facts of the storing function (the object lives in its
 * frame: the handler's inlined business logic).
 */
export function addExitWrites(r: Result) {
	const exits = exitFns(r)
	if (!r.anchor) return
	for (const fo of r.funcs) {
		const ff = r.facts.get(fo.pc)
		if (!ff) continue
		const fp = fpOf(fo)
		const sites = [...stmtsOf(fo)].filter(s => { const c = callOf(s); return c?.t.k === 'fn' && exits.has(c.t.pc) })
		if (!sites.length) { if (fo.name.startsWith('ix_')) calleeWrites(r, fo, [], exits); continue }
		const g = cfgOf(fo)
		const defs = singleDefs(fo)
		const objs: FrameObj[] = []
		for (const s0 of sites) {
			const c = callOf(s0)!
			const ex = exits.get((c.t as { pc: number }).pc)!
			const X = offOf(c.args[ex.param - 1] ?? { k: 'undef' }, fp)
			if (X === undefined) continue
			// the account: named by the check of the exit call's result, else by its type
			const callee = (c.t as { pc: number }).pc
			const acct = ff.checks.find(k => k.before === callee && k.named)?.named ?? (ex.type ? ex.type.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase() : 'account?')
			const exitBlock = g.pcBlock.get(s0.pc)
			const seen = new Set<string>()
			const size = Math.max(...ex.fields.map(x => x.off + x.size))
			// (words copied from another frame object at the same relative offsets: the object being built; a single
			// word only when other words are copied with the same offset)
			const deltasOf = (s: Extract<Stmt, { k: 'store' | 'stores' }>, A: number) => {
				const vals = s.k === 'store' ? [s.v] : s.vals
				const srcs = vals.map(v => { const d = v.k === 'var' ? defs.get(v.id) : v; return d?.k === 'load' ? offOf(d.addr, fp) : undefined })
				const deltas = srcs.map((o, i) => (o === undefined ? undefined : o - (A + i * s.size))).filter(d => d !== undefined)
				return deltas.length > 0 && deltas.every(d => d === deltas[0] && d !== 0) && vals.every((v, i) => srcs[i] !== undefined || v.k === 'var') ? deltas : []
			}
			const perDelta = new Map<number, number>()
			for (const s of stmtsOf(fo)) if (s.k === 'store' || s.k === 'stores') { const A = offOf(s.addr, fp); if (A !== undefined && A >= X && A < X + size) for (const d of deltasOf(s, A)) perDelta.set(d, (perDelta.get(d) ?? 0) + 1) }
			const copied = (s: Extract<Stmt, { k: 'store' | 'stores' }>, A: number) => { const ds = deltasOf(s, A); return ds.length > 1 || (ds.length === 1 && (perDelta.get(ds[0]) ?? 0) > 1) }
			// (the object is built in the frame by a copy into it: stores after that, on the way to the exit call)
			const inits: Stmt[] = []
			for (const s of stmtsOf(fo)) {
				const cc = callOf(s)
				const dst = s.k === 'copy' ? s.dst : cc && cc.t.k === 'fn' && /memcpy/.test(r.program.funcs.get(cc.t.pc)?.name ?? '') ? cc.args[0] : undefined
				const o = dst && offOf(dst, fp)
				if ((o !== undefined && o >= X && o < X + size) || (cc?.t.k === 'fn' && r.tryOf.get(fo.pc) === cc.t.pc)) inits.push(s)
				else if (s.k === 'store' || s.k === 'stores') {
					const A = offOf(s.addr, fp)
					if (A !== undefined && A >= X && A < X + size && copied(s, A)) inits.push(s)
				}
			}
			const after = (s: Stmt) => {
				const b = g.pcBlock.get(s.pc)
				return b !== undefined && exitBlock !== undefined && inits.some(i => { const ib = g.pcBlock.get(i.pc)!; return ib === b ? i.pc < s.pc : dominates(g, ib, b) }) && (b === exitBlock ? s.pc < s0.pc : !dominates(g, exitBlock, b))
			}
			for (const s of stmtsOf(fo)) {
				if (s.k !== 'store' && s.k !== 'stores') continue
				const A = offOf(s.addr, fp)
				if (A === undefined || !after(s)) continue
				const n = s.k === 'store' ? s.size : s.size * s.vals.length
				if (copied(s, A)) continue
				// (a multi-word store may set several fields)
				for (const fld of ex.fields.filter(x => A < X + x.off + x.size && X + x.off < A + n)) {
					if (seen.has(fld.name)) continue
					seen.add(fld.name)
					const line = ff.pcLine.get(s.pc)
					if (line === undefined) continue
					const text = ff.lines[line - 1]?.trim() ?? ''
					const v = s.k === 'store' ? s.v : undefined
					const how: Op['how'] = v?.k === 'bin' && (v.op === 'add' || v.op === 'sub') && v.a.k === 'load' && offOf(v.a.addr, fp) === A ? (v.op === 'add' ? '+=' : '-=') : '='
					const kinds: OpKind[] = ['ACCOUNT_DATA_WRITE']
					const ixn = fo.name
					if (AUTHORITY.test(fld.name) || (fld.size === 32 && /^data\[/.test(fld.name) && AUTHORITY.test(ixn))) kinds.push('AUTHORITY_WRITE')
					const sb = g.pcBlock.get(s.pc)
					const main = sb !== undefined && exitBlock !== undefined && dominates(g, sb, exitBlock) && ff.checks.every(k => !k.pc || g.pcBlock.get(k.pc) !== sb)
					ff.ops.push({ line, pc: s.pc, kinds, text, main, errPath: false, target: { acct, field: fld.name }, how, value: storeValue(text), exit: `serialized back by ${r.funcs.find(x => x.pc === callee)?.name ?? callee}${ex.type ? ` (${ex.type})` : ''}` })
				}
			}
			objs.push({ X, size, acct, ex, exit: r.funcs.find(x => x.pc === callee)?.name ?? String(callee) })
		}
		if (objs.length) calleeWrites(r, fo, objs, exits)
	}
}

interface FrameObj { X: number; size: number; acct: string; ex: ExitFn; exit: string }
/**
 * A value in the handler or a function it calls: a pointer into a frame (of the function `ctx`, as at
 * position `at`); an account's &AccountInfo (info), the RcBox of its lamports (rc) / data (drc), a pointer
 * to its lamports (lam) / data (data, at `off`); ty: the account's type.
 */
type HVal = { k: 'fr'; ctx: EvCtx; z: number; at: number } | { k: 'info' | 'rc' | 'drc' | 'lam' | 'data'; acct: string; ty?: string; off: number }
interface EvCtx { fo: FuncOut; D: Defs; ev: (e: Expr, p: number, d?: number) => HVal | undefined }

/**
 * Writes the handler's logic makes in the functions it calls with pointers into its frame (the Context
 * holding &Accounts, the Accounts struct, AccountInfo copies; 3 levels of calls): a store to a field of an
 * object the handler serializes back on exit (ACCOUNT_DATA_WRITE), to an account's lamports through the
 * RefCell of its AccountInfo (LAMPORT_WRITE), or to its data through the RefCell (a zero-copy account:
 * the IDL fields after the discriminator). The &AccountInfo words are those of the account objects, or of
 * the Accounts struct as try_accounts returns it (its layout); values a call returns in an object the
 * caller passes are the callee's single store there.
 */
function calleeWrites(r: Result, H: FuncOut, objs: FrameObj[], exits: Map<number, ExitFn>) {
	const cl: Callee = { f: pc => byPcOf(r).get(pc)?.f, name: pc => r.program.funcs.get(pc)?.name ?? '' }
	const D = defsOf(H.f, cl)
	const layout = r.acctLayouts?.get(H.pc) ?? []
	const tryPc = r.tryOf.get(H.pc)
	const isInfo = (t: FieldType) => t.k === 'ref' && t.to === 'AccountInfo'
	const discType = new Map((r.idl?.accounts ?? []).map(a => [a.disc, a.name] as [bigint, string]))
	/** the account whose &AccountInfo the handler's frame word z holds (at position at): copies followed back to try_accounts' out object */
	const infoAcct = (z: number, at: number): { acct: string; ty?: string } | undefined => {
		for (const o of objs) if (z >= o.X && z < o.X + o.size && !o.ex.fields.some(x => z < o.X + x.off + x.size && o.X + x.off < z + 8)) return { acct: o.acct, ty: o.ex.type }
		for (let k = 0; k < 6; k++) {
			const y = D.reaching(D.SLOT(z), at, true)
			if (!y) return undefined
			let [e, p] = y
			for (let j = 0; j < 4 && e.k === 'var'; j++) { const d: [Expr, number] | null = D.defs.has(e.id) ? [D.defs.get(e.id)!, D.defPos.get(e.id)!] : D.multi.has(e.id) ? D.reaching(e.id, p) : null; if (!d) return undefined; [e, p] = d }
			if (e.k === 'call' && e.t.k === 'fn' && e.t.pc === tryPc) {
				// (an &AccountInfo field, or the info word of an account deserialized in place)
				const T = D.fpOff(e.args[0])
				const f = T === undefined ? undefined : layout.find(x => (T + x.off === z && isInfo(x.t)) || (x.t.k === 'embed' && r.views.map.get(x.t.type)?.fields.some(y => T + x.off + y.off === z && isInfo(y.t))))
				return f && { acct: f.name, ty: f.t.k === 'embed' ? f.t.type : /account of type (\w+)/.exec(f.doc ?? '')?.[1] }
			}
			const w = e.k === 'load' && e.size === 8 ? D.fpOff(e.addr) : undefined
			if (w === undefined) return undefined
			z = w
			at = p
		}
		return undefined
	}
	/** a zero-copy account's field at a data offset (the IDL fields after the discriminator, no padding) */
	const zcField = (ty: string | undefined, off: number, n: number): string | undefined => {
		const fs = ty && r.idl ? structFields(ty, r.idl.types) : undefined
		let o = 8
		for (const x of fs ?? []) {
			const z = borshSize(x.type, r.idl!.types, 0)
			if (z === undefined) return undefined
			if (off < o + z && o < off + n) return x.name
			o += z
		}
		return undefined
	}
	const done = new Set<string>()
	const ctxOf = (fo: FuncOut, roots: Map<number, HVal>, depth: number): EvCtx => {
		const CD = fo === H ? D : defsOf(fo.f, cl)
		const self: EvCtx = { fo, D: CD, ev: () => undefined }
		/** what a call left in the object it got a pointer to (argument j, at offset off): the callee's single 8-byte store there */
		const outOf = (c: Extract<Expr, { k: 'call' }>, z: number, p: number, d: number): HVal | undefined => {
			const g = c.t.k === 'fn' && depth > 0 ? byPcOf(r).get(c.t.pc) : undefined
			if (!g || exits.has(g.pc)) return undefined
			const j = c.args.findIndex(a => { const o = CD.fpOff(a); return o !== undefined && o <= z && z < o + 0x80 })
			const pv = g.f.vars.find(q => q.param === j + 1)?.id
			if (j < 0 || pv === undefined) return undefined
			const off = z - CD.fpOff(c.args[j])!
			const GD = defsOf(g.f, cl)
			const at = (e: Expr, k = 0): number | undefined => e.k === 'var' ? (e.id === pv ? 0 : GD.defs.has(e.id) && k < 6 ? at(GD.defs.get(e.id)!, k + 1) : undefined) : e.k === 'bin' && e.op === 'add' && e.b.k === 'const' ? ((x => x === undefined ? undefined : x + Number(BigInt.asIntN(64, e.b.v)))(at(e.a, k + 1))) : undefined
			const vs: [Expr, number][] = []
			for (let bi = 0; bi < g.f.blocks.length; bi++) g.f.blocks[bi].stmts.forEach((s, i) => { if (s.k === 'store' && s.size === 8 && at(s.addr) === off) vs.push([s.v, bi << 16 | i]) })
			if (!vs.length || vs.length > 8) return undefined
			const rs = new Map<number, HVal>()
			c.args.forEach((a, k) => { const x = ev(a, p, d + 1); const q = g.f.vars.find(u => u.param === k + 1)?.id; if (x && q !== undefined && k !== j) rs.set(q, x) })
			// (the stores whose value is known agree: other paths store error values)
			const G = ctxOf(g, rs, depth - 1)
			const xs = vs.map(([e, q]) => G.ev(e, q, d + 1)).filter((x): x is HVal => !!x && x.k !== 'fr')
			if (!xs.length || !xs.every(x => JSON.stringify(x) === JSON.stringify(xs[0]))) return undefined
			// (account data whose type is not known: the IDL account whose discriminator the callee compares)
			const x = xs[0]
			if (x.k === 'data' && !x.ty) for (const b of g.f.blocks) if (b.term.k === 'br') walkExpr(b.term.c, y => { if (y.k === 'const' && !x.ty) x.ty = discType.get(y.v) })
			return x
		}
		const ev = (e: Expr, p: number, d = 0): HVal | undefined => {
			if (d > 16) return undefined
			const o = CD.fpOff(e)
			if (o !== undefined) return { k: 'fr', ctx: self, z: o, at: p }
			switch (e.k) {
				case 'var': {
					const x = roots.get(e.id)
					if (x) return x
					const y: [Expr, number] | null = CD.defs.has(e.id) ? [CD.defs.get(e.id)!, CD.defPos.get(e.id)!] : CD.multi.has(e.id) ? CD.reaching(e.id, p) : null
					return y && y[0].k !== 'call' ? ev(y[0], y[1], d + 1) : undefined
				}
				case 'ext': return ev(e.a, p, d + 1)
				case 'bin': {
					if (e.op !== 'add' || e.b.k !== 'const') return undefined
					const a = ev(e.a, p, d + 1), c = Number(BigInt.asIntN(64, e.b.v))
					return a?.k === 'fr' ? { ...a, z: a.z + c } : a ? { ...a, off: a.off + c } : undefined
				}
				case 'load': {
					if (e.size !== 8) return undefined
					const a = ev(e.addr, p, d + 1)
					if (a?.k === 'fr') {
						// (a word of a frame: what was stored there (by a call: its store), else (the handler's) an &AccountInfo)
						const y = a.ctx.D.reaching(a.ctx.D.SLOT(a.z), a.at, true)
						const v = !y ? undefined : y[0].k === 'call' ? (a.ctx === self ? outOf(y[0], a.z, y[1], d) : undefined) : a.ctx.ev(y[0], y[1], d + 1)
						if (v) return v
						const ia = a.ctx.fo === H ? infoAcct(a.z, a.at) : undefined
						return ia ? { k: 'info', ...ia, off: 0 } : undefined
					}
					if (!a || a.k === 'lam' || a.k === 'data') return undefined
					const next = a.k === 'info' ? (a.off === 8 ? 'rc' : a.off === 0x10 ? 'drc' : undefined) : a.off === 0x18 ? (a.k === 'rc' ? 'lam' : a.k === 'drc' ? 'data' : undefined) : undefined
					return next ? { k: next, acct: a.acct, ty: a.ty, off: 0 } : undefined
				}
			}
			return undefined
		}
		self.ev = ev
		return self
	}
	const visit = (C: FuncOut, roots: Map<number, HVal>, depth: number) => {
		const ff = r.facts.get(C.pc)
		if (!ff || exits.has(C.pc) || tryPc === C.pc) return
		const X = ctxOf(C, roots, 2)
		C.f.blocks.forEach((b, bi) => b.stmts.forEach((s, i) => {
			const p = bi << 16 | i
			const c = callOf(s)
			if (c?.t.k === 'fn' && depth > 0 && !exits.has(c.t.pc)) {
				const g = byPcOf(r).get(c.t.pc)
				const rs = new Map<number, HVal>()
				if (g) c.args.forEach((x, j) => { const v = X.ev(x, p); const pv = g.f.vars.find(q => q.param === j + 1)?.id; if (v && pv !== undefined) rs.set(pv, v) })
				if (g && rs.size) visit(g, rs, depth - 1)
			}
			if (s.k !== 'store' && s.k !== 'stores') return
			const a = X.ev(s.addr, p)
			const n = s.k === 'store' ? s.size : s.size * s.vals.length
			const line = ff.pcLine.get(s.pc)
			if (!a || line === undefined) return
			const text = ff.lines[line - 1]?.trim() ?? ''
			const push = (acct: string, field: string, kinds: OpKind[], note: string) => {
				const key = `${C.pc}:${s.pc}:${acct}.${field}`
				if (done.has(key) || ff.ops.some(o => o.line === line && o.target?.acct === acct && o.target.field === field)) return
				done.add(key)
				const v = storeValue(text)
				if (kinds[0] === 'LAMPORT_WRITE' && /^(0x)?0$/.test(v)) kinds.push('ACCOUNT_CLOSE')
				if (kinds[0] === 'ACCOUNT_DATA_WRITE' && AUTHORITY.test(field)) kinds.push('AUTHORITY_WRITE')
				ff.ops.push({ line, pc: s.pc, kinds, text, main: false, errPath: false, target: { acct, field }, how: s.k === 'store' ? arithHow(X.D, s.v, p) : '=', value: v, exit: note })
			}
			if (a.k === 'lam' && a.off === 0 && n === 8) push(a.acct, 'lamports', ['LAMPORT_WRITE'], `through the RefCell'd lamports of ${a.acct}'s AccountInfo (handler ${H.name})`)
			if (a.k === 'data') push(a.acct, zcField(a.ty, a.off, n) ?? `data[${a.off}..${a.off + n}]`, ['ACCOUNT_DATA_WRITE'], `through the RefCell'd data of ${a.acct}'s AccountInfo (handler ${H.name})`)
			// (the handler's own stores to its objects: see addExitWrites)
			if (a.k !== 'fr' || a.ctx.fo !== H || C === H) return
			for (const o of objs) for (const x of o.ex.fields) if (a.z < o.X + x.off + x.size && o.X + x.off < a.z + n)
				push(o.acct, x.name, ['ACCOUNT_DATA_WRITE'], `an object of the handler ${H.name}'s frame, serialized back by ${o.exit}`)
		}))
	}
	visit(H, new Map(), 3)
}

const byPcMemo = new WeakMap<Result, Map<number, FuncOut>>()
const byPcOf = (r: Result) => { let m = byPcMemo.get(r); if (!m) byPcMemo.set(r, (m = new Map(r.funcs.map(x => [x.pc, x])))); return m }

// ---- indirect calls: constant function pointers, tables, vtables ----

export interface Indirect { targets: Map<number, number[]>; byDisc: Map<bigint, number[]> }

/**
 * Functions a function may reach other than by direct calls: `callx` through a constant, a table entry
 * `ld64(C + k)` in read-only memory (C a constant, or a variable only ever set to constants), function
 * addresses it passes or stores, and the function entries of read-only tables (vtables) whose address it
 * uses. Table entries chosen after comparing an 8-byte value with an instruction discriminator are
 * returned by discriminator (hand-written fast-path dispatch of an Anchor program).
 */
export function indirectTargets(r: Result): Indirect {
	const p = r.program
	const targets = new Map<number, number[]>(), byDisc = new Map<bigint, number[]>()
	const fnAt = (a: bigint): number | undefined => {
		const o = a - p.textVaddr
		if (o < 0n || o % 8n !== 0n) return undefined
		const pc = Number(o / 8n)
		return p.funcs.has(pc) ? pc : undefined
	}
	const ro = (a: bigint) => { const g = p.image.region(a, 8); return !!g && !g.exec && /^\.(rodata|data\.rel\.ro)$/.test(g.name) }
	const discs = new Set(r.instructions.map(i => i.disc))
	for (const fo of r.funcs) {
		const out = new Set<number>()
		const consts = new Map<number, { v: bigint; b: number }[]>() // var -> the constants it is set to (in which block)
		const other = new Set<number>()
		fo.f.blocks.forEach((b, bi) => {
			for (const s of b.stmts) {
				if (s.k === 'set') { if (s.e.k === 'const') { let l = consts.get(s.dst); if (!l) consts.set(s.dst, (l = [])); l.push({ v: s.e.v, b: bi }) } else other.add(s.dst) }
				else if (s.k === 'call' && s.dst >= 0) other.add(s.dst)
				for (const e of stmtExprs(s)) walkExpr(e, x => {
					if (x.k !== 'const') return
					const t = fnAt(x.v)
					if (t !== undefined && p.addressTaken.has(t)) out.add(t)
					else if (ro(x.v)) for (let k = 0; k < 12; k++) {
						const w = p.image.readConst(x.v + BigInt(8 * k), 8)
						const t2 = w === undefined ? undefined : fnAt(w)
						if (t2 !== undefined && p.addressTaken.has(t2)) out.add(t2)
						else if (w === undefined || w > 0x10000n) break
					}
				})
			}
		})
		for (const b of fo.f.blocks) for (const s of b.stmts) {
			const c = callOf(s)
			if (c?.t.k !== 'ind') continue
			const e = c.t.e
			if (e.k === 'const') { const t = fnAt(e.v); if (t !== undefined) out.add(t); continue }
			if (e.k !== 'load' || e.size !== 8) continue
			const a = e.addr
			const [base, k] = a.k === 'bin' && a.op === 'add' && a.b.k === 'const' ? [a.a, a.b.v] : [a, 0n]
			if (base.k === 'const') { const w = p.image.readConst(base.v + k, 8); const t = w === undefined ? undefined : fnAt(w); if (t !== undefined) out.add(t); continue }
			if (base.k !== 'var' || other.has(base.id)) continue
			for (const d of consts.get(base.id) ?? []) {
				const w = p.image.readConst(d.v + k, 8)
				const t = w === undefined ? undefined : fnAt(w)
				if (t === undefined) continue
				// (the constant chosen right before comparing an 8-byte value with a discriminator)
				const term = fo.f.blocks[d.b].term
				const cd = term.k === 'br' && term.c.k === 'cmp' && (term.c.op === 'eq' || term.c.op === 'ne') ? (term.c.b.k === 'const' ? term.c.b.v : term.c.a.k === 'const' ? term.c.a.v : undefined) : undefined
				if (cd !== undefined && discs.has(cd)) { let l = byDisc.get(cd); if (!l) byDisc.set(cd, (l = [])); l.push(t) }
				else out.add(t)
			}
		}
		out.delete(fo.pc)
		if (out.size) targets.set(fo.pc, [...out])
	}
	return { targets, byDisc }
}

// ---- native dispatchers: per-instruction regions of a function matching on the instruction tag ----

/** A set of tag values 0..255 (256 stands for any larger value) as a bitset. */
type Tags = Uint32Array
const NT = 257
const newTags = (all: boolean): Tags => { const t = new Uint32Array(9); if (all) { t.fill(0xffffffff, 0, 8); t[8] = 1 } return t }
const has = (t: Tags, v: number) => (t[v >> 5] >>> (v & 31)) & 1
const isAll = (t: Tags) => t[8] === 1 && t.subarray(0, 8).every(w => w === 0xffffffff)
const orInto = (a: Tags, b: Tags): boolean => { let ch = false; for (let i = 0; i < 9; i++) { const x = a[i] | b[i]; if (x !== a[i]) { a[i] = x >>> 0; ch = true } } return ch }
const filterTags = (t: Tags, f: (v: number) => boolean): Tags => { const o = newTags(false); for (let v = 0; v < NT; v++) if (has(t, v) && f(v)) o[v >> 5] |= 1 << (v & 31); return o }

export interface DispatchGroup {
	tags: number[]
	name: string
	source: 'str' | 'known' | 'tag'   // "Instruction: X" log in its region · a well-known program's layout · the tag value
	accounts?: string[]                // account roles (known layout)
	dispatchers: string[]              // the functions matching on the tag
	keep: (fn: number, pc: number) => boolean    // is code at pc of fn reachable with one of the group's tags? (true outside the dispatchers)
	allowed: (fn: number, b: number) => boolean  // the same for a block of fn
}

const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/\W+/g, '_').replace(/^_|_$/g, '').toLowerCase()

interface TagStates { fo: FuncOut; inS: (Tags | undefined)[]; family: Set<number> }

/**
 * The tags each block of `fo` can be reached with: the variables compared with several small constants
 * (the tag byte / u32 read from the instruction data or passed in `forced`, and enum values set from it),
 * propagated forward from the entry and narrowed on branches.
 */
function tagStates(fo: FuncOut, forced?: number): TagStates | undefined {
	const f = fo.f
	if (f.blocks.length > 20000) return undefined
	const defs = new Map<number, Expr[]>()
	for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'set') { let l = defs.get(s.dst); if (!l) defs.set(s.dst, (l = [])); l.push(s.e) }
	const leafVar = (e: Expr): number | undefined => e.k === 'var' ? e.id : e.k === 'ext' && e.a.k === 'var' ? e.a.id : undefined
	const cmpConsts = new Map<number, Set<bigint>>()
	const leaves = (c: Expr, fn: (x: Extract<Expr, { k: 'cmp' }>) => void) => {
		if (c.k === 'cmp') fn(c)
		else if (c.k === 'lnot') leaves(c.a, fn)
		else if (c.k === 'land' || c.k === 'lor') { leaves(c.a, fn); leaves(c.b, fn) }
	}
	for (const b of f.blocks) if (b.term.k === 'br') leaves(b.term.c, c => {
		if (c.op === 'set') return
		const [x, k] = c.b.k === 'const' ? [c.a, c.b.v] : c.a.k === 'const' ? [c.b, c.a.v] : [undefined, 0n]
		const v = x && leafVar(x)
		if (v === undefined || k > 0xffffffffn) return
		let s = cmpConsts.get(v); if (!s) cmpConsts.set(v, (s = new Set())); s.add(k)
	})
	const tagLike = (v: number, onlyConst: boolean) => {
		const ds = defs.get(v)
		if (!ds?.length) return false
		return ds.every(e => (e.k === 'const' && e.v <= 0xffn) || (!onlyConst && ((e.k === 'load' && (e.size === 1 || e.size === 4)) || (e.k === 'ext' && e.a.k === 'load'))))
	}
	let primary = forced
	if (primary === undefined) {
		let best = 0
		for (const [v, ks] of cmpConsts) if (ks.size > best && tagLike(v, false) && [...ks].filter(k => k <= 0xffn).length >= 2) { best = ks.size; primary = v }
		if (primary === undefined || (best < 3 && !defs.get(primary)!.some(e => e.k === 'load' && e.size === 1))) return undefined
	} else if ((cmpConsts.get(primary)?.size ?? 0) < 2) return undefined
	const family = new Set([primary])
	for (const [v, ks] of cmpConsts) if (v !== primary && ks.size >= 2 && tagLike(v, true)) family.add(v)
	const g = cfgOf(fo)
	const order = [...f.blocks.keys()].filter(b => g.rpo[b] >= 0).sort((a, b) => g.rpo[a] - g.rpo[b])
	const inS: (Tags | undefined)[] = new Array(f.blocks.length)
	inS[0] = newTags(true)
	const maskMemo = new Map<Expr, Record<string, Tags | null>>()
	const narrow = (c: Expr, truth: boolean, t: Tags): Tags => {
		if (c.k === 'lnot') return narrow(c.a, !truth, t)
		if (c.k === 'land' || c.k === 'lor') {
			if ((c.k === 'land') === truth) return narrow(c.b, truth, narrow(c.a, truth, t))
			const o = narrow(c.a, truth, t); orInto(o, narrow(c.b, truth, t)); return o
		}
		if (c.k !== 'cmp' || c.op === 'set') return t
		// (the tags a comparison lets through, computed once per condition and side)
		const mk = `${truth ? 1 : 0}`
		let ms = maskMemo.get(c)
		if (!ms) maskMemo.set(c, (ms = {}))
		let mask = ms[mk]
		if (mask === undefined) {
			const [x, k, swap] = c.b.k === 'const' ? [c.a, c.b.v, false] : c.a.k === 'const' ? [c.b, c.a.v, true] : [undefined, 0n, false]
			const v = x && leafVar(x)
			if (v === undefined || !family.has(v)) mask = null
			else {
				const ext = x!.k === 'ext' ? x as Extract<Expr, { k: 'ext' }> : undefined
				mask = filterTags(newTags(true), n => {
					let a = BigInt(n)
					if (ext) { const m = (1n << BigInt(ext.bits)) - 1n; a &= m; if (ext.signed && a >> BigInt(ext.bits - 1)) a = BigInt.asUintN(64, a - (1n << BigInt(ext.bits))) }
					return (swap ? evalCmpN(c.op, k, a) : evalCmpN(c.op, a, k)) === truth
				})
			}
			ms[mk] = mask
		}
		if (!mask) return t
		const o = new Uint32Array(9)
		for (let i = 0; i < 9; i++) o[i] = t[i] & mask[i]
		return o
	}
	// (sweeps in reverse postorder over the blocks whose tags grew; a block setting a family variable to a
	// constant goes on with that tag)
	const setTo = f.blocks.map(bl => { let v: number | undefined; for (const s of bl.stmts) if (s.k === 'set' && family.has(s.dst) && s.e.k === 'const') v = Number(s.e.v > 256n ? 256n : s.e.v); return v })
	const dirty = new Uint8Array(f.blocks.length)
	dirty[0] = 1
	for (let any = true, sweep = 0; any && sweep < 60; sweep++) {
		any = false
		for (const b of order) {
			if (!dirty[b]) continue
			dirty[b] = 0
			let t = inS[b]!
			const sv = setTo[b]
			if (sv !== undefined) { t = newTags(false); t[sv >> 5] |= 1 << (sv & 31) }
			const term = f.blocks[b].term
			const succ = (x: number, tt: Tags) => { const cur = inS[x]; if (!cur) inS[x] = Uint32Array.from(tt); else if (!orInto(cur, tt)) return; dirty[x] = 1; any = true }
			if (term.k === 'br') { succ(term.t, narrow(term.c, true, t)); succ(term.f, narrow(term.c, false, t)) }
			else for (const x of f.blocks[b].succs) succ(x, t)
		}
	}
	return { fo, inS, family }
}

/**
 * The instructions of a native program whose handler is `root` (the entrypoint, or a processor handling
 * several instructions inline): the dispatchers are the first function matching on the tag within two
 * calls of the root, and the functions it passes the tag to (nested dispatch, e.g. fast paths first). Tags
 * reaching the same blocks of the dispatchers form one instruction; its name comes from an
 * "Instruction: X" log only its blocks make, else from a well-known program's layout when the tags
 * match one, else the tag. Code reached by no tag in particular (paths of invalid tags) is left out.
 */
export function splitDispatch(r: Result, root: FuncOut, roots: Set<number>): DispatchGroup[] | undefined {
	const byPc = new Map(r.funcs.map(x => [x.pc, x]))
	const q: [number, number][] = [[root.pc, 0]], seen = new Set([root.pc])
	// (the first function whose matching splits into instructions: e.g. not the entrypoint's error-code conversion after the processor returns)
	while (q.length) {
		const [pc, d] = q.shift()!
		const fo = byPc.get(pc)
		if (!fo) continue
		const first = tagStates(fo)
		const gs = first && splitFrom(r, first, roots, byPc)
		if (gs) return gs
		if (d < 2) for (const c of r.facts.get(pc)?.calls ?? []) if (!c.errPath && !seen.has(c.callee) && !roots.has(c.callee)) { seen.add(c.callee); q.push([c.callee, d + 1]) }
	}
	return undefined
}

function splitFrom(r: Result, first: TagStates, roots: Set<number>, byPc: Map<number, FuncOut>): DispatchGroup[] | undefined {
	// nested dispatchers: callees the tag is passed to
	const ds: TagStates[] = [first]
	const tried = new Set([first.fo.pc])
	for (let i = 0; i < ds.length && ds.length < 4; i++) {
		const d = ds[i]
		for (const b of d.fo.f.blocks) for (const s of b.stmts) {
			const c = callOf(s)
			if (c?.t.k !== 'fn' || tried.has(c.t.pc)) continue
			const k = c.args.findIndex(a => { const v = a.k === 'var' ? a.id : a.k === 'ext' && a.a.k === 'var' ? a.a.id : -1; return d.family.has(v) })
			const callee = byPc.get(c.t.pc)
			const pv = k < 0 || !callee ? undefined : callee.f.vars.find(v => v.param === k + 1)?.id
			if (pv !== undefined) tried.add(c.t.pc)
			const t = pv === undefined ? undefined : tagStates(callee!, pv)
			if (t) ds.push(t)
		}
	}
	// per tag: the blocks specific to some tags it reaches, in every dispatcher
	const perTag: string[][] = Array.from({ length: NT }, () => [])
	ds.forEach((d, i) => d.inS.forEach((t, b) => {
		if (!t || isAll(t)) return
		for (let w = 0; w < 9; w++) for (let x = t[w]; x; x &= x - 1) perTag[w * 32 + 31 - Math.clz32(x & -x)].push(`${i}:${b}`)
	}))
	const sig = new Map<string, number[]>()
	perTag.forEach((parts, v) => {
		if (!parts.length) return
		const k = parts.join(',')
		let l = sig.get(k); if (!l) sig.set(k, (l = [])); l.push(v)
	})
	const dIdx = new Map(ds.map((d, i) => [d.fo.pc, i]))
	// (blocks reached with any tag that never lead to the matching: paths leaving before the dispatch)
	const before = ds.map(d => {
		const blocks = d.fo.f.blocks
		const reach = new Uint8Array(blocks.length)
		const q: number[] = []
		d.inS.forEach((t, b) => { if (t && !isAll(t)) { reach[b] = 1; q.push(b) } })
		while (q.length) { const b = q.pop()!; for (const x of blocks[b].preds) if (!reach[x]) { reach[x] = 1; q.push(x) } }
		return (b: number) => !!d.inS[b] && !reach[b]
	})
	const mk = (tags: number[] | 'before') => {
		const mask = newTags(false); if (tags !== 'before') for (const v of tags) mask[v >> 5] |= 1 << (v & 31)
		const allowed = (fn: number, b: number) => {
			const i = dIdx.get(fn)
			if (i === undefined) return true
			if (tags === 'before' || before[i](b)) return tags === 'before' && before[i](b)
			const t = ds[i].inS[b]; if (!t) return false
			for (let j = 0; j < 9; j++) if (t[j] & mask[j]) return true
			return false
		}
		const keep = (fn: number, pc: number) => { const i = dIdx.get(fn); if (i === undefined) return true; const b = cfgOf(ds[i].fo).pcBlock.get(pc); return b === undefined || allowed(fn, b) }
		return { mask, allowed, keep }
	}
	const lineText = (fn: number, pc: number) => { const ff = r.facts.get(fn); const l = ff?.pcLine.get(pc); return l === undefined ? '' : ff!.lines[l - 1] ?? '' }
	const cand: { tags: number[]; logs: Set<string>; acts: number; other: boolean }[] = []
	for (const [k, tags] of sig) {
		const { mask } = mk(tags)
		let other = false, acts = 0
		const logs = new Set<string>()
		for (const part of k.split(',')) {
			const [i, b] = part.split(':').map(Number)
			const d = ds[i], t = d.inS[b]!
			const excl = t.every((w, j) => (w & ~mask[j]) === 0)
			const term = d.fo.f.blocks[b].term
			if (term.k === 'ret' && term.e) walkExpr(term.e, x => { if (x.k === 'call') { acts++; if (x.t.k === 'fn' && roots.has(x.t.pc)) other = true } })
			for (const s of d.fo.f.blocks[b].stmts) {
				const c = callOf(s)
				if (c?.t.k === 'fn' && roots.has(c.t.pc)) other = true
				if (c || (s.k === 'store' || s.k === 'stores')) acts++
				if (excl && c?.t.k === 'sys' && /log/.test(c.t.name)) { const m = /"Instruction: ([^"]+)"/.exec(lineText(d.fo.pc, s.pc)); if (m) logs.add(snake(m[1])) }
			}
		}
		if (!other && acts && tags[0] < 256) cand.push({ tags, logs, acts, other })
	}
	// (the default branch of a match over 0..n-1: the next tag; other large tag sets are invalid tags)
	const small = cand.filter(c => c.tags.length <= 4)
	const maxSmall = Math.max(-1, ...small.flatMap(c => c.tags))
	const rest = cand.filter(c => c.tags.length > 16).sort((a, b) => b.acts - a.acts)[0]
	if (rest && rest.tags[0] === maxSmall + 1 && small.length >= 1) small.push({ ...rest, tags: [rest.tags[0]] })
	let groups: DispatchGroup[] = small.map(c => {
		const { allowed, keep } = mk(c === small[small.length - 1] && rest && c.tags.length === 1 && c.tags[0] === rest.tags[0] ? rest.tags : c.tags)
		const name = c.logs.size === 1 ? [...c.logs][0] : c.tags.length === 1 ? `tag_${c.tags[0]}` : `tags_${c.tags.join('_')}`
		return { tags: c.tags, name, source: c.logs.size === 1 ? 'str' as const : 'tag' as const, dispatchers: ds.map(d => d.fo.name), keep, allowed }
	})
	if (groups.length < 2) return undefined
	if (before[0] && ds[0].inS.some((_, b) => before[0](b) && ds[0].fo.f.blocks[b].stmts.some(s => callOf(s) || s.k === 'store' || s.k === 'stores'))) {
		const { allowed, keep } = mk('before')
		groups.push({ tags: [], name: `${ds[0].fo.name}_before_dispatch`, source: 'tag', dispatchers: [ds[0].fo.name], keep, allowed })
	}
	// a well-known program's layout (the program's own id referenced, or exactly its tags)
	if (groups.every(x => x.source === 'tag')) {
		const tagSet = groups.filter(x => x.tags.length === 1).flatMap(x => x.tags)
		for (const [known, fam] of knownFamilies()) {
			const keys = Object.keys(fam.ixs).map(Number)
			const cover = tagSet.filter(t => fam.ixs[t]).length
			// (its own id referenced; exactly its tags when there are many, else with its name in the program's strings:
			// a few tags 0..n fit any small program)
			const named = () => { const w = fam.label.toLowerCase().split(' ').slice(0, 2).join(' '); return r.funcs.some(x => x.text.toLowerCase().includes(w)) }
			const exact = keys.length === tagSet.length && cover === keys.length && (keys.length >= 6 || named())
			if (!(exact || (cover >= 0.8 * tagSet.length && cover >= 2 && r.funcs.some(x => x.text.includes(`/* ${known} */`))))) continue
			for (const x of groups) if (x.tags.length === 1 && fam.ixs[x.tags[0]]) { const l = fam.ixs[x.tags[0]]; x.name = snake(l.name); x.source = 'known'; x.accounts = l.accounts }
			break
		}
	}
	groups = groups.sort((a, b) => (a.tags[0] ?? -1) - (b.tags[0] ?? -1))
	const names = new Map<string, number>()
	for (const x of groups) { const n = names.get(x.name) ?? 0; names.set(x.name, n + 1); if (n) x.name += `_${n + 1}` }
	return groups
}

const evalCmpN = (op: string, a: bigint, b: bigint): boolean => {
	const i = (x: bigint) => BigInt.asIntN(64, x)
	switch (op) {
		case 'eq': return a === b
		case 'ne': return a !== b
		case 'ugt': return a > b
		case 'uge': return a >= b
		case 'ult': return a < b
		case 'ule': return a <= b
		case 'sgt': return i(a) > i(b)
		case 'sge': return i(a) >= i(b)
		case 'slt': return i(a) < i(b)
		case 'sle': return i(a) <= i(b)
		default: return true
	}
}

// ---- native accounts: account[i] from the serialized input / an &[AccountInfo] slice ----

/** AccountInfo (solana-program, 0x30 bytes): field by offset */
const INFO_FIELD: Record<number, string> = { 0: 'key', 8: 'lamports', 0x10: 'data', 0x18: 'owner', 0x20: 'rent_epoch', 0x28: 'is_signer', 0x29: 'is_writable', 0x2a: 'executable' }
/** a serialized input record (the entrypoint's input; pinocchio's AccountInfo points to one): field by offset, size */
const REC_FIELD: Record<number, [string, number]> = { 1: ['is_signer', 1], 2: ['is_writable', 1], 3: ['executable', 1], 8: ['key', 32], 0x28: ['owner', 32], 0x48: ['lamports', 8], 0x50: ['data_len', 8] }
export interface AcctRef { index: number; field?: string }
export type Side = AcctRef | 'stack' | 'pda' | 'const' | undefined // 'stack': a frame buffer ('pda': written by a PDA derivation); 'const': a constant (program memory)
export interface AcctResolver {
	byName: Map<string, AcctRef>
	refs: (e: Expr, b?: number) => AcctRef[]              // account fields an expression (a branch condition, else evaluated at the end of block b) reads
	store: (s: Stmt) => (AcctRef & { how?: '=' | '+=' | '-=' }) | undefined // the account field a store writes (lamports, data[a..b]), how (a sum / difference stored)
	sides: (c: Expr, b?: number) => [Side, Side] | undefined // the two sides of an equality (key / field compares)
	valueRef: (e: Expr, s: Stmt) => AcctRef | undefined     // the account field an expression of a statement is (a key: the pointer to it)
}

/**
 * Abstract values of the account model: pointers into the accounts (an &[AccountInfo] slice, the input
 * records or an array of pointers to them, the RcBox of a RefCell'd lamports / data field, a field) and
 * values read from them.
 */
type AV =
	| { k: 'slice'; off: number }                                 // &[AccountInfo] (0x30-byte entries)
	| { k: 'recs'; off: number }                                  // array of pointers to input records
	| { k: 'rec'; i: number; off: number }                        // input record i
	| { k: 'rc'; i: number; f: 'lamports' | 'data'; off: number } // Rc<RefCell<&mut ..>> of AccountInfo i
	| { k: 'ptr'; i: number; f: string; off: number }             // &lamports / &data[..] / &key / &owner of account i
	| { k: 'val'; i: number; f: string }                          // a field value read
	| { k: 'base'; v: number; off: number }                       // (first pass) a pointer variable
	| { k: 'elem'; v: number; e: number; off: number }            // (first pass) a pointer loaded from base v, entry e

const resMemo = new WeakMap<object, AcctResolver>()

/** a function's IR (when decompiled) and name (library code) */
export interface Callee { f: (pc: number) => VarFunc | undefined; name: (pc: number) => string; memo?: Map<string, number> }
/** writes through a pointer argument, by the callee's name (library code not decompiled) */
const LIB_WRITES: [RegExp, number][] = [[/find_program_address/, 33], [/create_program_address/, 33], [/^(sol_)?(memcpy|memmove|memset)/, -1]]
/**
 * How many bytes a call may write through its argument j (a pointer to the caller's frame): the stores the
 * callee makes through that parameter (and through the calls it passes it to, 3 levels); 0x80 when unknown
 * (the pointer escapes, or library code not known).
 */
function callWrites(t: Extract<Stmt, { k: 'call' }>['t'], j: number, cl: Callee, depth = 3): number {
	const nm = t.k === 'sys' ? t.name : t.k === 'fn' ? cl.name(t.pc) : ''
	for (const [re, n] of LIB_WRITES) if (re.test(nm)) return n < 0 ? (j === 0 ? 0x80 : 0) : n
	if (t.k === 'sys') return /log|invoke|get_.*sysvar|clock|rent/.test(nm) ? (/get_|clock|rent/.test(nm) ? 0x40 : 0) : 0x80
	if (t.k !== 'fn' || depth <= 0) return 0x80
	const key = `${t.pc}:${j}`
	const memo = cl.memo ??= new Map()
	const m = memo.get(key)
	if (m !== undefined) return m
	memo.set(key, 0x80) // (recursion)
	const f = cl.f(t.pc)
	const pv = f?.vars.find(v => v.param === j + 1)?.id
	let n = 0
	if (f && pv !== undefined) {
		const defs = new Map<number, Expr>(), multi = new Set<number>()
		for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'set' || s.k === 'call') { if (defs.has(s.dst) || multi.has(s.dst) || s.k === 'call') { defs.delete(s.dst); multi.add(s.dst) } else defs.set(s.dst, s.e) }
		// (param + c through single definitions)
		const off = (e: Expr, d = 0): number | undefined => {
			if (d > 8) return undefined
			if (e.k === 'var') return e.id === pv ? 0 : defs.has(e.id) ? off(defs.get(e.id)!, d + 1) : undefined
			if (e.k === 'bin' && e.op === 'add' && e.b.k === 'const') { const x = off(e.a, d + 1); return x === undefined ? undefined : x + Number(BigInt.asIntN(64, e.b.v)) }
			return undefined
		}
		outer: for (const b of f.blocks) for (const s of b.stmts) {
			if (s.k === 'store' || s.k === 'stores' || s.k === 'copy') {
				const a = off(s.k === 'copy' ? s.dst : s.addr)
				if (a !== undefined) n = Math.max(n, a + (s.k === 'store' ? s.size : s.k === 'stores' ? s.size * s.vals.length : s.n))
				// (the pointer stored somewhere: it escapes)
				if (s.k === 'store' && off(s.v) !== undefined || s.k === 'stores' && s.vals.some(v => off(v) !== undefined)) { n = 0x80; break outer }
			}
			const c = callOf(s)
			if (c) for (let k = 0; k < c.args.length; k++) { const a = off(c.args[k]); if (a !== undefined) n = Math.max(n, a + callWrites(c.t, k, cl, depth - 1)) }
			if (n >= 0x80) break
		}
	} else n = 0x80
	memo.set(key, n)
	return n
}
/**
 * Anchor try_accounts: the accounts two 32-byte comparisons read (has_one, token::mint / token::authority,
 * address constraints). Each side's bytes are followed back (frame copies, stores of loaded words, pointers
 * loaded from the frame) to the call that produced them: an account's try_accounts / deserialization call,
 * which the check right after it names (`calls`: call position -> account). `direct`: the bytes are in the
 * frame (a copy of the deserialized account's data) rather than behind a pointer (an AccountInfo's key).
 */
export function compareAccounts(D: Defs, c: Expr, p0: number, calls: Map<number, string>): { acct: string; direct: boolean }[] | undefined {
	let x = c
	while (x.k === 'lnot') x = x.a
	const cmpArgs = (e: Expr): [Expr, Expr] | undefined => (e.k === 'call' || (e.k === 'fn' && e.name === 'memeq')) && e.args.length >= 3 && e.args[2].k === 'const' && e.args[2].v === 0x20n ? [e.args[0], e.args[1]] : undefined
	const follow = (e: Expr, p: number): [Expr, number] => {
		for (let k = 0; k < 6; k++) {
			if (e.k === 'ext') { e = e.a; continue }
			if (e.k !== 'var') break
			const y: [Expr, number] | null = D.defs.has(e.id) ? [D.defs.get(e.id)!, D.defPos.get(e.id)!] : D.multi.has(e.id) ? D.reaching(e.id, p) : null
			if (!y) break
			;[e, p] = y
		}
		return [e, p]
	}
	let ca: [Expr, Expr] | undefined, cp = p0
	for (const side of x.k === 'cmp' ? [x.a, x.b] : [x]) { const [e, p] = follow(side, p0); ca ??= cmpArgs(e); if (ca && cp === p0) cp = p }
	if (!ca) return undefined
	/** where the bytes a pointer points to come from */
	const prov = (e: Expr, p: number, direct: boolean, d: number): { acct: string; direct: boolean } | undefined => {
		if (d > 10) return undefined
		;[e, p] = follow(e, p)
		const o = D.fpOff(e)
		if (o !== undefined) {
			const y = D.reaching(D.SLOT(o), p, true)
			if (!y) return undefined
			const [v, q] = follow(y[0], y[1])
			if (v.k === 'call') { const a = calls.get(y[1]); return a ? { acct: a, direct } : undefined }
			return v.k === 'load' ? prov(v.addr, q, direct, d + 1) : undefined
		}
		// (bytes behind a pointer: where the pointer comes from)
		const base = e.k === 'bin' && e.op === 'add' && e.b.k === 'const' ? e.a : e
		const [b, q] = follow(base, p)
		return b.k === 'load' && b.size === 8 ? prov(b.addr, q, false, d + 1) : undefined
	}
	return ca.map(a => prov(a, cp, true, 0)).filter((s): s is { acct: string; direct: boolean } => !!s)
}

/** a memcpy / memmove of a constant size: [dst, src, n] */
function memcpyOf(c: { t: CallTarget; args: Expr[] }, callee?: Callee): [Expr, Expr, number] | undefined {
	const nm = c.t.k === 'sys' ? c.t.name : c.t.k === 'fn' ? callee?.name(c.t.pc) ?? '' : ''
	return /^(sol_)?(memcpy|memmove)_?$/.test(nm) && c.args.length >= 3 && c.args[2].k === 'const' && c.args[2].v <= 0x400n ? [c.args[0], c.args[1], Number(c.args[2].v)] : undefined
}

/** a stored value that is a sum / difference (through its variables' definitions): += / -=, else = */
export function arithHow(D: Defs, e: Expr, p: number): '=' | '+=' | '-=' {
	for (let k = 0; k < 6; k++) {
		if (e.k === 'ext') { e = e.a; continue }
		if (e.k === 'bin' && (e.op === 'add' || e.op === 'sub') && e.b.k !== 'const') return e.op === 'add' ? '+=' : '-='
		if (e.k !== 'var') break
		const y: [Expr, number] | null = D.defs.has(e.id) ? [D.defs.get(e.id)!, D.defPos.get(e.id)!] : D.multi.has(e.id) ? D.reaching(e.id, p) : null
		if (!y) break
		;[e, p] = y
	}
	return '='
}

/** Definitions in a function: single ones (a `set` or a call result), and the others and frame slots by position (reaching definitions). */
export interface Defs {
	fp: number
	fpOff: (e: Expr) => number | undefined
	defs: Map<number, Expr>; defPos: Map<number, number>; multi: Set<number>
	pos: Map<Stmt | Expr, number>      // statement / branch condition -> position (block << 16 | index)
	SLOT: (o: number) => number
	reaching: (key: number, p: number, loose?: boolean) => [Expr, number] | null
}
const defsMemo = new WeakMap<VarFunc, Defs>()
export function defsOf(f: VarFunc, callee?: Callee): Defs {
	let d0 = defsMemo.get(f)
	if (d0) return d0
	const fp = f.vars.find(v => v.param === 10)?.id ?? -1
	const fpOff = (e: Expr): number | undefined => offOf(e, fp)
	// definitions: single ones (a `set` or a call result); the others by position (reaching definitions)
	const defs = new Map<number, Expr>(), defPos = new Map<number, number>(), multi = new Set<number>()
	const pos = new Map<Stmt | Expr, number>() // statement / branch condition -> position (block << 16 | index)
	f.blocks.forEach((b, bi) => {
		b.stmts.forEach((s, i) => {
			pos.set(s, bi << 16 | i)
			if (s.k !== 'set' && s.k !== 'call') return
			const d = s.dst
			if (d < 0) return
			if (defs.has(d) || multi.has(d)) { defs.delete(d); multi.add(d) } else { defs.set(d, s.k === 'set' ? s.e : { k: 'call', t: s.t, args: s.args }); defPos.set(d, bi << 16 | i) }
		})
		if (b.term.k === 'br') pos.set(b.term.c, bi << 16 | b.stmts.length)
	})
	/** the key of a frame slot (negative; its own inverse) */
	const SLOT = (o: number) => -(1 << 24) - o
	/**
	 * What a statement does to a variable (key >= 0) / a frame slot (key < 0: SLOT(offset)): its value, null
	 * (clobbered) or undefined (untouched). `loose` (where a byte of the slot comes from): a store of any size
	 * at the slot, a copy (as a load of its source) and a call writing it (the call) count too.
	 */
	const effect = (s: Stmt, key: number, loose = false): Expr | null | undefined => {
		if (key >= 0) return (s.k === 'set' || s.k === 'call') && s.dst === key ? (s.k === 'set' ? s.e : { k: 'call', t: s.t, args: s.args }) : undefined
		const o = SLOT(key)
		if (s.k === 'store') { const a = fpOff(s.addr); return a === undefined ? undefined : a === o ? (s.size === 8 || loose ? s.v : null) : a < o + 8 && a + s.size > o ? null : undefined }
		if (s.k === 'stores' || s.k === 'copy') {
			const a = fpOff(s.k === 'stores' ? s.addr : s.dst), n = s.k === 'stores' ? s.vals.length * s.size : s.n
			if (a === undefined || a >= o + 8 || a + n <= o) return undefined
			if (s.k === 'stores') return (s.size === 8 || loose) && (o - a) % s.size === 0 ? s.vals[(o - a) / s.size] : null
			if (!loose || a > o) return null
			const src = fpOff(s.src), k = BigInt.asUintN(64, BigInt(o - a))
			return { k: 'load', size: 8, addr: src !== undefined ? { k: 'bin', op: 'add', a: { k: 'var', id: fp }, b: { k: 'const', v: BigInt.asUintN(64, BigInt(src + o - a)) } } : k ? { k: 'bin', op: 'add', a: s.src, b: { k: 'const', v: k } } : s.src }
		}
		const c = callOf(s)
		// (memcpy / memmove of a constant size: a copy)
		const mc = c && memcpyOf(c, callee)
		if (mc) {
			const a = fpOff(mc[0])
			if (a === undefined || a >= o + 8 || a + mc[2] <= o) return undefined
			if (a > o || a + mc[2] < o + 8) return null
			const src = fpOff(mc[1]), k = BigInt.asUintN(64, BigInt(o - a))
			return { k: 'load', size: 8, addr: src !== undefined ? { k: 'bin', op: 'add', a: { k: 'var', id: fp }, b: { k: 'const', v: BigInt.asUintN(64, BigInt(src + o - a)) } } : k ? { k: 'bin', op: 'add', a: mc[1], b: { k: 'const', v: k } } : mc[1] }
		}
		// (a callee may write the structure it gets a pointer to)
		if (c) for (let j = 0; j < c.args.length; j++) { const p = fpOff(c.args[j]); if (p !== undefined && p <= o && o < p + (callee ? callWrites(c.t, j, callee) : 0x80)) return loose ? { k: 'call', t: c.t, args: c.args } : null }
		return undefined
	}
	const endMemo = new Map<string, [Expr, number] | null>()
	/** the definition of key reaching position p (the same one on every path), with its position */
	const reaching = (key: number, p: number, loose = false): [Expr, number] | null => {
		const path = new Set<number>()
		let steps = 0, cyc = false
		// (undefined: only paths around a loop back to a block being searched)
		const go = (b: number, from: number): [Expr, number] | null | undefined => {
			const ss = f.blocks[b].stmts
			for (let i = from - 1; i >= 0; i--) { const x = effect(ss[i], key, loose); if (x !== undefined) return x && [x, b << 16 | i] }
			const preds = f.blocks[b].preds
			if (!preds.length || ++steps > 400) return null
			let r: [Expr, number] | undefined
			path.add(b)
			for (const q of preds) {
				const mk = `${q}|${key}${loose ? '~' : ''}`
				let x = endMemo.get(mk)
				if (x === undefined) {
					if (path.has(q)) { cyc = true; continue }
					const c0 = cyc
					cyc = false
					const y = go(q, f.blocks[q].stmts.length)
					if (!cyc && y !== undefined) endMemo.set(mk, y)
					cyc ||= c0
					if (y === undefined) continue
					x = y
				}
				if (!x || (r && r[0] !== x[0])) { path.delete(b); return null }
				r = x
			}
			path.delete(b)
			return r
		}
		return go(p >> 16, p & 0xffff) ?? null
	}
	d0 = { fp, fpOff, defs, defPos, multi, pos, SLOT, reaching }
	defsMemo.set(f, d0)
	return d0
}

/**
 * The evaluator of the native account model in a function: roots (variables holding a slice / record
 * array, or a callee's parameters bound to the caller's values), the entrypoint's record array at frame
 * offset `arr`; `pass1`: unknown pointer variables as bases (root discovery). A frame word a call wrote is
 * what the callee stores there (its stores through that parameter, evaluated with its parameters bound;
 * `depth` levels), or for AccountInfo::try_borrow_(mut_)data / lamports, the RefCell's value.
 */
function avEvaluator(f: VarFunc, D: Defs, roots: Map<number, AV>, arr: number | undefined, callee: Callee | undefined, depth: number, pass1: boolean): { ev: (e: Expr, p: number, d?: number) => AV | undefined } {
	const { fp, fpOff, defs, defPos, multi, SLOT, reaching } = D
	const outOf = (c: Extract<Expr, { k: 'call' }>, o: number, p: number, d: number): AV | undefined => {
		const g = c.t.k === 'fn' && depth > 0 ? callee?.f(c.t.pc) : undefined
		if (!g) return undefined
		const j = c.args.findIndex(a => { const q = fpOff(a); return q !== undefined && q <= o && o < q + 0x80 })
		const pv = g.vars.find(v => v.param === j + 1)?.id
		if (j < 0 || pv === undefined) return undefined
		const off = o - fpOff(c.args[j])!
		const GD = defsOf(g, callee)
		const at = (e: Expr, k = 0): number | undefined => e.k === 'var' ? (e.id === pv ? 0 : GD.defs.has(e.id) && k < 6 ? at(GD.defs.get(e.id)!, k + 1) : undefined) : e.k === 'bin' && e.op === 'add' && e.b.k === 'const' ? ((x => x === undefined ? undefined : x + Number(BigInt.asIntN(64, e.b.v)))(at(e.a, k + 1))) : undefined
		const vs: [Expr, number][] = []
		g.blocks.forEach((b, bi) => b.stmts.forEach((s, i) => {
			if (s.k === 'store' && s.size === 8 && at(s.addr) === off) vs.push([s.v, bi << 16 | i])
			// (a copy into the parameter's object: the bytes copied)
			const mc = callOf(s) && memcpyOf(callOf(s)!, callee)
			const a = mc && at(mc[0])
			if (mc && a !== undefined && a <= off && off + 8 <= a + mc[2]) vs.push([{ k: 'load', size: 8, addr: off > a ? { k: 'bin', op: 'add', a: mc[1], b: { k: 'const', v: BigInt(off - a) } } : mc[1] }, bi << 16 | i])
		}))
		if (!vs.length || vs.length > 8) return undefined
		const rs = new Map<number, AV>()
		c.args.forEach((a, k) => { const x = k === j ? undefined : ev(a, p, d + 1); const q = g.vars.find(u => u.param === k + 1)?.id; if (x && q !== undefined) rs.set(q, x) })
		if (!rs.size) return undefined
		// (the stores whose value is known agree: other paths store error values)
		const G = avEvaluator(g, GD, rs, undefined, callee, depth - 1, false)
		const xs = vs.map(([e, q]) => G.ev(e, q, d + 1)).filter((x): x is AV => !!x)
		return xs.length && xs.every(x => JSON.stringify(x) === JSON.stringify(xs[0])) ? xs[0] : undefined
	}
	const memo = new Map<Expr, Map<number, AV | undefined>>()
	/** the value of e evaluated at position p */
	const ev = (e: Expr, p: number, d = 0): AV | undefined => {
		if (d > 24) return undefined
		let m = memo.get(e)
		if (m?.has(p)) return m.get(p)
		const r = ev0(e, p, d)
		if (!m) memo.set(e, (m = new Map()))
		m.set(p, r)
		return r
	}
	const ev0 = (e: Expr, p: number, d: number): AV | undefined => {
		switch (e.k) {
			case 'var': {
				const r = roots.get(e.id)
				if (r) return r
				const x = defs.get(e.id)
				if (x) return x.k !== 'call' ? ev(x, defPos.get(e.id)!, d + 1) : undefined
				if (multi.has(e.id)) { const y = reaching(e.id, p); return y && y[0].k !== 'call' ? ev(y[0], y[1], d + 1) : undefined }
				return pass1 && e.id !== fp ? { k: 'base', v: e.id, off: 0 } : undefined
			}
			case 'ext': return ev(e.a, p, d + 1)
			case 'bin': {
				if (e.op !== 'add' || e.b.k !== 'const') return undefined
				const a = ev(e.a, p, d + 1)
				return a && a.k !== 'val' ? { ...a, off: a.off + Number(BigInt.asIntN(64, e.b.v)) } : undefined
			}
			case 'load': {
				const o = fpOff(e.addr)
				if (o !== undefined) {
					if (arr !== undefined && e.size === 8 && o >= arr && (o - arr) % 8 === 0 && o - arr < 8 * 64) return { k: 'rec', i: (o - arr) / 8, off: 0 }
					const y = e.size === 8 ? reaching(SLOT(o), p) : null
					if (y) return ev(y[0], y[1], d + 1)
					// (a Ref / RefMut an AccountInfo::try_borrow_(mut_)data / lamports call returned in the frame: its value
					// pointer, at +8 of the out object, points to the RefCell's value)
					const z = e.size === 8 && callee ? reaching(SLOT(o), p, true) : null
					const c = z?.[0].k === 'call' && z[0].t.k === 'fn' ? z[0] : undefined
					const m = c && /try_borrow_(?:mut_)?(data|lamports)/.exec(callee!.name((c.t as { pc: number }).pc))
					if (m && fpOff(c!.args[0]) === o - 8) {
						const a = ev(c!.args[1], z![1], d + 1)
						return a?.k === 'slice' && a.off % 0x30 === 0 ? { k: 'rc', i: a.off / 0x30, f: m[1] as 'data' | 'lamports', off: 0x18 } : undefined
					}
					return c && !pass1 ? outOf(c, o, z![1], d) : undefined
				}
				return deref(ev(e.addr, p, d + 1), e.size)
			}
		}
		return undefined
	}
	const deref = (a: AV | undefined, size: number): AV | undefined => {
		if (!a) return undefined
		switch (a.k) {
			case 'base': return pass1 && size === 8 && a.off >= 0 && a.off % 8 === 0 ? { k: 'elem', v: a.v, e: a.off / 8, off: 0 } : undefined
			case 'slice': {
				if (a.off < 0) return undefined
				const i = Math.floor(a.off / 0x30), o = a.off % 0x30, fl = INFO_FIELD[o]
				if (size === 8 && (o === 0 || o === 0x18)) return { k: 'ptr', i, f: fl, off: 0 }
				if (size === 8 && (o === 8 || o === 0x10)) return { k: 'rc', i, f: o === 8 ? 'lamports' : 'data', off: 0 }
				return fl && o >= 0x20 ? { k: 'val', i, f: fl } : undefined
			}
			case 'recs': return size === 8 && a.off >= 0 && a.off < 8 * 64 && a.off % 8 === 0 ? { k: 'rec', i: a.off / 8, off: 0 } : undefined
			case 'rec': {
				if (a.off >= 0x58) return { k: 'val', i: a.i, f: `data[${a.off - 0x58}..${a.off - 0x58 + size}]` }
				const x = REC_FIELD[a.off]
				if (x && (x[1] === size || x[1] === 32)) return { k: 'val', i: a.i, f: x[0] }
				for (const o of [8, 0x28]) if (a.off > o && a.off < o + 32) return { k: 'val', i: a.i, f: REC_FIELD[o][0] }
				return undefined
			}
			case 'rc':
				if (a.off === 0x18 && size === 8) return { k: 'ptr', i: a.i, f: a.f, off: 0 }
				return a.f === 'data' && a.off === 0x20 && size === 8 ? { k: 'val', i: a.i, f: 'data_len' } : undefined
			case 'ptr': return { k: 'val', i: a.i, f: a.f === 'data' ? `data[${a.off}..${a.off + size}]` : a.f }
		}
		return undefined
	}
	return { ev }
}

/**
 * Accounts a native function reaches through its temporaries: the frame array of input-record pointers
 * the entrypoint fills (8-byte entries, the first stored being `input + 8`), a variable used as an
 * `&[AccountInfo]` slice (read at 0x30·i + field offsets for two or more i), or as an array of pointers to
 * input records (pinocchio: entries read for two or more i, dereferenced at record offsets). Variables
 * with one definition and frame slots stored once (no call gets a pointer near them) are followed, and
 * so are the RefCell'd lamports / data of an AccountInfo (the pointer at +0x18 of its RcBox).
 * Names are the printed variable names.
 */
export function accountResolver(fo: { f: VarFunc; names: string[] }, callee?: Callee): AcctResolver {
	let res = resMemo.get(fo.f)
	if (res) return res
	const f = fo.f
	const input = f.isEntry ? f.vars.find(v => v.param === 1)?.id : undefined
	const D = defsOf(f, callee)
	const { fp, fpOff, defs, defPos, multi, pos, SLOT, reaching } = D
	const rec0 = (d: Expr | undefined) => input !== undefined && d?.k === 'bin' && d.op === 'add' && d.a.k === 'var' && d.a.id === input && d.b.k === 'const' && d.b.v === 8n
	let arr: number | undefined
	if (input !== undefined) for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k === 'store' && s.size === 8 && (rec0(s.v) || (s.v.k === 'var' && rec0(defs.get(s.v.id))))) { const o = fpOff(s.addr); if (o !== undefined && (arr === undefined || o > arr)) arr = o }
	}
	const roots = new Map<number, AV>()
	let { ev } = avEvaluator(f, D, roots, arr, callee, 2, true)
	// first pass: the variables used as a slice / an array of record pointers
	const hits = new Map<number, Set<number>>(), elems = new Map<number, Set<number>>(), recUses = new Map<number, number>()
	const addTo = (m: Map<number, Set<number>>, v: number, x: number) => { let h = m.get(v); if (!h) m.set(v, (h = new Set())); h.add(x) }
	const recUse = (a: AV | undefined, ok: boolean) => { if (a?.k === 'elem' && ok) recUses.set(a.v, (recUses.get(a.v) ?? 0) + 1) }
	f.blocks.forEach((b, bi) => {
		let p = bi << 16
		const note = (x: Expr) => {
			if (x.k !== 'load') return
			const a = ev(x.addr, p)
			if (a?.k === 'base' && a.off >= 0 && a.off < 0x30 * 64) {
				const c = a.off
				if (INFO_FIELD[c % 0x30] !== undefined && (x.size === 8 || c % 0x30 >= 0x28)) addTo(hits, a.v, Math.floor(c / 0x30))
				if (x.size === 8 && c % 8 === 0) addTo(elems, a.v, c / 8)
			}
			recUse(a, a?.k === 'elem' && REC_FIELD[a.off]?.[1] === x.size)
		}
		b.stmts.forEach((s, i) => {
			p = bi << 16 | i
			for (const e of stmtExprs(s)) walkExpr(e, note)
			// (a key / owner compared: memcmp(rec + 8 | rec + 0x28, ..); lamports stored)
			const c = callOf(s)
			if (c) for (const a of c.args) { const x = ev(a, p); recUse(x, x?.k === 'elem' && (x.off === 8 || x.off === 0x28)) }
			if (s.k === 'store') { const x = ev(s.addr, p); recUse(x, x?.k === 'elem' && x.off === 0x48) }
		})
		p = bi << 16 | b.stmts.length
		if (b.term.k === 'br') walkExpr(b.term.c, note)
	})
	for (const [v, ks] of hits) if (ks.size >= 2) roots.set(v, { k: 'slice', off: 0 })
	for (const [v, ks] of elems) if (!roots.has(v) && ks.size >= 2 && (recUses.get(v) ?? 0) >= 2) roots.set(v, { k: 'recs', off: 0 })
	ev = avEvaluator(f, D, roots, arr, callee, 2, false).ev
	const asRef = (a: AV | undefined): AcctRef | undefined => {
		if (!a) return undefined
		if (a.k === 'val') return { index: a.i, field: a.f }
		// (a pointer standing for the 32 bytes compared)
		if (a.k === 'ptr') return { index: a.i, field: a.f === 'data' ? `data[${a.off}..${a.off + 32}]` : a.f }
		if (a.k === 'rec') { const r = REC_FIELD[a.off]; return a.off >= 0x58 ? { index: a.i, field: `data[${a.off - 0x58}..${a.off - 0x58 + 32}]` } : r && r[1] === 32 ? { index: a.i, field: r[0] } : undefined }
		return undefined
	}
	const byName = new Map<string, AcctRef>()
	for (const [v, e] of defs) {
		const nm = fo.names[v]
		const a = nm ? ev(e, defPos.get(v)!) : undefined
		if (!a) continue
		if (a.k === 'rec' && a.off === 0) byName.set(nm, { index: a.i })
		else if (a.k === 'slice' && a.off % 0x30 === 0) byName.set(nm, { index: a.off / 0x30 })
		else if (a.k === 'ptr' && a.f === 'key' && a.off === 0) byName.set(nm, { index: a.i })
	}
	for (const [v, a] of roots) if (a.k === 'slice' && fo.names[v]) byName.set(fo.names[v], { index: 0 })
	/** the two pointers of a 32-byte comparison: a call (memcmp / sol_memcmp) or a memeq */
	const cmpArgs = (x: Expr): [Expr, Expr] | undefined =>
		(x.k === 'call' || (x.k === 'fn' && x.name === 'memeq')) && x.args.length >= 3 && x.args[2].k === 'const' && x.args[2].v === 0x20n ? [x.args[0], x.args[1]] : undefined
	/** through casts and variables holding a call's result: the expression, at its position */
	const follow = (e: Expr, p: number): [Expr, number] => {
		for (let k = 0; k < 4; k++) {
			if (e.k === 'ext') { e = e.a; continue }
			if (e.k !== 'var') break
			const y: [Expr, number] | null = defs.has(e.id) ? [defs.get(e.id)!, defPos.get(e.id)!] : multi.has(e.id) ? reaching(e.id, p) : null
			const u = y && y[0].k === 'ext' ? y[0].a : y?.[0]
			if (!y || (u!.k !== 'call' && u!.k !== 'var')) break
			e = y[0]
			p = y[1]
		}
		return [e, p]
	}
	const at = (e: Expr, b?: number) => pos.get(e) ?? (b !== undefined && f.blocks[b] ? b << 16 | f.blocks[b].stmts.length : undefined)
	const refs = (e: Expr, b?: number): AcctRef[] => {
		const p0 = at(e, b)
		if (p0 === undefined) return []
		const out: AcctRef[] = []
		const push = (r: AcctRef | undefined) => { if (r && !out.some(y => y.index === r.index && y.field === r.field)) out.push(r) }
		walkExpr(e, x => {
			if (x.k === 'load' || x.k === 'var') { const a = ev(x, p0); if (a?.k === 'val') push(asRef(a)) }
			const [y, p] = x.k === 'var' ? follow(x, p0) : [x, p0]
			const ca = cmpArgs(y)
			if (ca) for (const q of ca) push(asRef(ev(q, p)))
			if (y.k === 'fn' && y.name === 'keyeq') push(asRef(ev(y.args[0], p)))
		})
		return out
	}
	const store = (s: Stmt): (AcctRef & { how?: '=' | '+=' | '-=' }) | undefined => {
		const r = store0(s), p = pos.get(s)
		return r && (s.k === 'store' && p !== undefined ? { ...r, how: arithHow(D, s.v, p) } : r)
	}
	const store0 = (s: Stmt): AcctRef | undefined => {
		const p = pos.get(s)
		if (p === undefined) return undefined
		// (memset / memcpy into an account's data, e.g. zeroing it on close)
		const c = callOf(s)
		const nm = c?.t.k === 'sys' ? c.t.name : c?.t.k === 'fn' ? callee?.name(c.t.pc) ?? '' : ''
		if (c && /^(sol_)?(memset|memcpy|memmove)_?$/.test(nm) && c.args.length >= 3) {
			const a = ev(c.args[0], p), n = c.args[2].k === 'const' ? Number(c.args[2].v) : undefined
			const d = a?.k === 'ptr' && a.f === 'data' ? [a.i, a.off] : a?.k === 'rec' && a.off >= 0x58 ? [a.i, a.off - 0x58] : undefined
			return d && { index: d[0], field: n === undefined ? (d[1] ? `data[${d[1]}..]` : 'data') : `data[${d[1]}..${d[1] + n}]` }
		}
		if (s.k !== 'store' && s.k !== 'stores') return undefined
		const a = ev(s.addr, p)
		const n = s.k === 'store' ? s.size : s.size * s.vals.length
		if (a?.k === 'ptr' && (a.f === 'lamports' || a.f === 'data')) return { index: a.i, field: a.f === 'lamports' ? 'lamports' : `data[${a.off}..${a.off + n}]` }
		// (the owner pubkey rewritten: AccountInfo::assign)
		if (a?.k === 'ptr' && a.f === 'owner' || a?.k === 'rec' && a.off >= 0x28 && a.off < 0x48) return { index: a.i, field: 'owner' }
		if (a?.k === 'rec' && a.off === 0x48 && s.k === 'store' && s.size === 8) return { index: a.i, field: 'lamports' }
		if (a?.k === 'rec' && a.off >= 0x58) return { index: a.i, field: `data[${a.off - 0x58}..${a.off - 0x58 + n}]` }
		return undefined
	}
	/** the call that wrote the frame bytes a pointer points to (through copies and stores of loaded bytes) */
	const origin = (e: Expr, p: number, d = 0): Extract<Expr, { k: 'call' }> | undefined => {
		for (let k = 0; k < 6 && d < 12; k++, d++) {
			if (e.k === 'ext') { e = e.a; continue }
			if (e.k !== 'var') break
			const y: [Expr, number] | null = defs.has(e.id) ? [defs.get(e.id)!, defPos.get(e.id)!] : multi.has(e.id) ? reaching(e.id, p) : null
			if (!y) return undefined
			;[e, p] = y
		}
		const o = fpOff(e)
		if (o === undefined) return undefined
		const r = reaching(SLOT(o), p, true)
		if (!r) return undefined
		let [x, q] = r
		if (x.k === 'call') return x
		for (let k = 0; k < 6 && (x.k === 'ext' || x.k === 'var'); k++) {
			if (x.k === 'ext') { x = x.a; continue }
			const y: [Expr, number] | null = defs.has(x.id) ? [defs.get(x.id)!, defPos.get(x.id)!] : multi.has(x.id) ? reaching(x.id, q) : null
			if (!y) return undefined
			;[x, q] = y
		}
		return x.k === 'load' && d < 12 ? origin(x.addr, q, d + 1) : undefined
	}
	/** a PDA derivation: by name, or a function making the syscall (2 levels) */
	const pdaCall = (t: CallTarget, d = 0): boolean => {
		if (t.k === 'sys') return /program_address/.test(t.name)
		if (t.k !== 'fn' || !callee) return false
		if (/program_address/.test(callee.name(t.pc))) return true
		const g = d < 2 ? callee.f(t.pc) : undefined
		return !!g && g.blocks.some(b => b.stmts.some(s => { const c = callOf(s); return !!c && c.t.k !== 'ind' && pdaCall(c.t, d + 1) }))
	}
	const side = (e: Expr, p: number): Side => {
		const r = asRef(ev(e, p))
		if (r) return r
		let st = false
		walkExpr(e, x => { if (fpOff(x) !== undefined) st = true })
		if (st) {
			const c = origin(e, p)
			if (c && pdaCall(c.t)) return 'pda'
			// (a frame copy of an account's key / data, e.g. a struct a helper read from the account: by its first word)
			const w = ev({ k: 'load', size: 8, addr: e }, p)
			const m = w?.k === 'val' ? /^data\[(\d+)\.\.\d+\]$/.exec(w.f) : undefined
			if (w?.k === 'val' && (m || w.f === 'key' || w.f === 'owner')) return { index: w.i, field: m ? `data[${m[1]}..${Number(m[1]) + 32}]` : w.f }
			return 'stack'
		}
		return e.k === 'const' || (e.k === 'var' && defs.get(e.id)?.k === 'const') ? 'const' : undefined
	}
	const sides = (c: Expr, b?: number): [Side, Side] | undefined => {
		const p0 = at(c, b)
		if (p0 === undefined) return undefined
		let x = c
		while (x.k === 'lnot') x = x.a
		const cmp = (e: Expr): [Side, Side] | undefined => { const [y, p] = follow(e, p0); const ca = cmpArgs(y); return ca && [side(ca[0], p), side(ca[1], p)] }
		if (x.k === 'cmp' && (x.op === 'eq' || x.op === 'ne')) {
			const r = cmp(x.a) ?? cmp(x.b)
			if (r) return r
			const [ra, rb] = [asRef(ev(x.a, p0)), asRef(ev(x.b, p0))]
			return ra || rb ? [ra, rb] : undefined
		}
		return cmp(x)
	}
	const valueRef = (e: Expr, s: Stmt): AcctRef | undefined => { const p = pos.get(s); return p === undefined ? undefined : asRef(ev(e, p)) }
	res = { byName, refs, store, sides, valueRef }
	resMemo.set(fo.f, res)
	return res
}
