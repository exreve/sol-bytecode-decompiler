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
import type { Expr, Stmt } from '../ir.ts'
import { walkExpr } from '../ir.ts'
import { computeRpo, dominators } from '../structure.ts'
import { stmtExprs } from '../simplify.ts'
import { borshSize, structFields } from '../idl.ts'
import type { Op, OpKind } from './facts.ts'

// ---- control-flow graphs ----

export interface Cfg {
	fo: FuncOut
	rpo: Int32Array
	idom: Int32Array
	pcBlock: Map<number, number>   // statement / instruction pc -> block
	condBlock: Map<Expr, number>   // a branch condition (by identity) -> its block
}

const cfgMemo = new WeakMap<FuncOut, Cfg>()
export function cfgOf(fo: FuncOut): Cfg {
	let g = cfgMemo.get(fo)
	if (g) return g
	const f = fo.f
	const { order, rpo } = computeRpo(f)
	const idom = dominators(f, order, rpo)
	const pcBlock = new Map<number, number>(), condBlock = new Map<Expr, number>()
	f.blocks.forEach((b, i) => {
		if (rpo[i] < 0) return
		for (const s of b.stmts) if (!pcBlock.has(s.pc)) pcBlock.set(s.pc, i)
		if (!pcBlock.has(b.end)) pcBlock.set(b.end, i)
		if (b.term.k === 'br') condBlock.set(b.term.c, i)
	})
	g = { fo, rpo, idom, pcBlock, condBlock }
	cfgMemo.set(fo, g)
	return g
}

export function dominates(g: Cfg, a: number, b: number): boolean {
	if (g.rpo[a] < 0 || g.rpo[b] < 0) return false
	for (let k = 0; k < 100000; k++) { if (a === b) return true; if (b === 0) return false; b = g.idom[b] }
	return false
}

/** The block deciding a check's condition: the branch whose condition is (a leaf of) it, else the fail side's branching predecessor. */
export function decisionBlock(g: Cfg, c: Expr | undefined, failPc: number | undefined): number | undefined {
	const leaves: number[] = []
	const leaf = (e: Expr) => {
		const b = g.condBlock.get(e)
		if (b !== undefined) { leaves.push(b); return }
		if (e.k === 'lnot') leaf(e.a)
		else if (e.k === 'land' || e.k === 'lor') { leaf(e.a); leaf(e.b) }
	}
	if (c) leaf(c)
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
	return out
}

/**
 * Stores into the fields of an account object before its exit function serializes it: ACCOUNT_DATA_WRITE
 * operations of `<account>.<field>` added to the facts of the storing function (the object lives in its
 * frame: the handler's inlined business logic).
 */
export function addExitWrites(r: Result) {
	const exits = exitFns(r)
	if (!exits.size) return
	for (const fo of r.funcs) {
		const ff = r.facts.get(fo.pc)
		if (!ff) continue
		const fp = fpOf(fo)
		const sites = [...stmtsOf(fo)].filter(s => { const c = callOf(s); return c?.t.k === 'fn' && exits.has(c.t.pc) })
		if (!sites.length) continue
		const g = cfgOf(fo)
		const defs = singleDefs(fo)
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
			// (words copied from another frame object at the same relative offsets: the object being built)
			const copied = (s: Extract<Stmt, { k: 'store' | 'stores' }>, A: number) => {
				const vals = s.k === 'store' ? [s.v] : s.vals
				const srcs = vals.map(v => { const d = v.k === 'var' ? defs.get(v.id) : v; return d?.k === 'load' ? offOf(d.addr, fp) : undefined })
				const deltas = srcs.map((o, i) => (o === undefined ? undefined : o - (A + i * s.size))).filter(d => d !== undefined)
				return deltas.length > 0 && deltas.every(d => d === deltas[0] && d !== 0) && vals.every((v, i) => srcs[i] !== undefined || v.k === 'var')
			}
			// (the object is built in the frame by a copy into it: stores after that, on the way to the exit call)
			const size = Math.max(...ex.fields.map(x => x.off + x.size))
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
				const fld = ex.fields.find(x => A < X + x.off + x.size && X + x.off < A + n)
				if (!fld || seen.has(fld.name)) continue
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
	}
}
