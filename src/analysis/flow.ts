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
import type { Expr, Stmt } from '../ir.ts'
import { walkExpr } from '../ir.ts'
import { computeRpo, dominators } from '../structure.ts'
import { stmtExprs } from '../simplify.ts'
import { borshSize, structFields } from '../idl.ts'
import { knownFamilies } from '../cpi.ts'
import type { Op, OpKind } from './facts.ts'

// ---- control-flow graphs ----

export interface Cfg {
	fo: FuncOut
	rpo: Int32Array
	idom: Int32Array
	pcBlock: Map<number, number>   // statement / instruction pc -> block
	condBlock: Map<Expr, number>   // a branch condition (by identity) -> its block
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
	const narrow = (c: Expr, truth: boolean, t: Tags): Tags => {
		if (c.k === 'lnot') return narrow(c.a, !truth, t)
		if (c.k === 'land' || c.k === 'lor') {
			if ((c.k === 'land') === truth) return narrow(c.b, truth, narrow(c.a, truth, t))
			const o = narrow(c.a, truth, t); orInto(o, narrow(c.b, truth, t)); return o
		}
		if (c.k !== 'cmp' || c.op === 'set') return t
		const [x, k, swap] = c.b.k === 'const' ? [c.a, c.b.v, false] : c.a.k === 'const' ? [c.b, c.a.v, true] : [undefined, 0n, false]
		const v = x && leafVar(x)
		if (v === undefined || !family.has(v)) return t
		const ext = x!.k === 'ext' ? x as Extract<Expr, { k: 'ext' }> : undefined
		return filterTags(t, n => {
			let a = BigInt(n)
			if (ext) { const m = (1n << BigInt(ext.bits)) - 1n; a &= m; if (ext.signed && a >> BigInt(ext.bits - 1)) a = BigInt.asUintN(64, a - (1n << BigInt(ext.bits))) }
			return (swap ? evalCmpN(c.op, k, a) : evalCmpN(c.op, a, k)) === truth
		})
	}
	for (let changed = true, it = 0; changed && it < 50; it++) {
		changed = false
		for (const b of order) {
			const s0 = inS[b]
			if (!s0) continue
			let t = s0
			for (const s of f.blocks[b].stmts) if (s.k === 'set' && family.has(s.dst) && s.e.k === 'const') { t = newTags(false); const v = Number(s.e.v > 256n ? 256n : s.e.v); t[v >> 5] |= 1 << (v & 31) }
			const term = f.blocks[b].term
			const succ = (x: number, tt: Tags) => { const cur = inS[x]; if (!cur) { inS[x] = Uint32Array.from(tt); changed = true } else if (orInto(cur, tt)) changed = true }
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
	let first: TagStates | undefined
	const q: [number, number][] = [[root.pc, 0]], seen = new Set([root.pc])
	while (q.length && !first) {
		const [pc, d] = q.shift()!
		const fo = byPc.get(pc)
		if (!fo) continue
		first = tagStates(fo)
		if (d < 2) for (const c of r.facts.get(pc)?.calls ?? []) if (!c.errPath && !seen.has(c.callee) && !roots.has(c.callee)) { seen.add(c.callee); q.push([c.callee, d + 1]) }
	}
	if (!first) return undefined
	// nested dispatchers: callees the tag is passed to
	const ds: TagStates[] = [first]
	for (let i = 0; i < ds.length && ds.length < 4; i++) {
		const d = ds[i]
		for (const b of d.fo.f.blocks) for (const s of b.stmts) {
			const c = callOf(s)
			if (c?.t.k !== 'fn' || ds.some(x => x.fo.pc === (c.t as { pc: number }).pc)) continue
			const k = c.args.findIndex(a => { const v = a.k === 'var' ? a.id : a.k === 'ext' && a.a.k === 'var' ? a.a.id : -1; return d.family.has(v) })
			const callee = byPc.get(c.t.pc)
			const pv = k < 0 || !callee ? undefined : callee.f.vars.find(v => v.param === k + 1)?.id
			const t = pv === undefined ? undefined : tagStates(callee!, pv)
			if (t) ds.push(t)
		}
	}
	// per tag: the blocks specific to some tags it reaches, in every dispatcher
	const sig = new Map<string, number[]>()
	for (let v = 0; v < NT; v++) {
		const parts: string[] = []
		ds.forEach((d, i) => d.inS.forEach((t, b) => { if (t && !isAll(t) && has(t, v)) parts.push(`${i}:${b}`) }))
		if (!parts.length) continue
		const k = parts.join(',')
		let l = sig.get(k); if (!l) sig.set(k, (l = [])); l.push(v)
	}
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
			const exact = keys.length === tagSet.length && cover === keys.length
			if (!(exact || (cover >= 0.8 * tagSet.length && cover >= 3 && r.funcs.some(x => x.text.includes(`/* ${known} */`))))) continue
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
export interface AcctRef { index: number; field?: string }
export interface AcctResolver { byName: Map<string, AcctRef>; refs: (e: Expr) => AcctRef[] }

const resMemo = new WeakMap<object, AcctResolver>()
/**
 * Accounts a native function holds in temporaries: loads from a frame array of account-record pointers
 * the entrypoint fills (8-byte entries, the first stored being the first record, `input + 8`), and
 * offsets into an `&[AccountInfo]` slice (0x30-byte entries: a variable read at 0x30·i + field offsets for
 * two or more i). Names are the printed variable names.
 */
export function accountResolver(fo: { f: VarFunc; names: string[] }): AcctResolver {
	let res = resMemo.get(fo.f)
	if (res) return res
	const f = fo.f
	const fp = f.vars.find(v => v.param === 10)?.id ?? -1
	const input = f.isEntry ? f.vars.find(v => v.param === 1)?.id : undefined
	const defs = singleDefs(fo as FuncOut)
	const rec0 = (d: Expr) => input !== undefined && d.k === 'bin' && d.op === 'add' && d.a.k === 'var' && d.a.id === input && d.b.k === 'const' && d.b.v === 8n
	const rec0Vars = new Set<number>()
	if (input !== undefined) for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'set' && rec0(s.e)) rec0Vars.add(s.dst)
	const isRec0 = (e: Expr): boolean => rec0(e) || (e.k === 'var' && rec0Vars.has(e.id))
	let arr: number | undefined
	const hits = new Map<number, Set<number>>() // slice var -> entries read
	for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k === 'store' && s.size === 8 && isRec0(s.v)) { const o = offOf(s.addr, fp); if (o !== undefined && (arr === undefined || o > arr)) arr = o }
		for (const e of stmtExprs(s)) walkExpr(e, x => {
			if (x.k !== 'load') return
			const a = x.addr
			if (a.k === 'bin' && a.op === 'add' && a.a.k === 'var' && a.a.id !== fp && a.b.k === 'const') {
				const c = Number(BigInt.asIntN(64, a.b.v))
				if (c >= 0 && c < 0x30 * 64 && INFO_FIELD[c % 0x30] !== undefined && (x.size === 8 || c % 0x30 >= 0x28)) { let h = hits.get(a.a.id); if (!h) hits.set(a.a.id, (h = new Set())); h.add(Math.floor(c / 0x30)) }
			}
		})
	}
	const slices = new Set([...hits].filter(([, ks]) => ks.size >= 2).map(([v]) => v))
	const at = (a: Expr): AcctRef | undefined => {
		const [base, c] = a.k === 'bin' && a.op === 'add' && a.b.k === 'const' ? [a.a, Number(BigInt.asIntN(64, a.b.v))] : [a, 0]
		if (base.k === 'var' && slices.has(base.id) && c >= 0) return { index: Math.floor(c / 0x30), field: INFO_FIELD[c % 0x30] }
		if (arr !== undefined && base.k === 'var' && base.id === fp && (c - arr) % 8 === 0 && c >= arr && c - arr < 8 * 64) return { index: (c - arr) / 8 }
		return undefined
	}
	const byName = new Map<string, AcctRef>()
	for (const [v, e] of defs) {
		const nm = fo.names[v]
		if (!nm) continue
		// (a record pointer loaded from the array; &slice[i]; a field of slice[i] (key / owner pointer))
		if (e.k === 'load' && e.size === 8) { const r0 = at(e.addr); if (r0) { byName.set(nm, r0.field === undefined ? { index: r0.index } : r0); continue } }
		const r1 = at(e)
		if (r1 && r1.field === 'key' && e.k !== 'load') byName.set(nm, { index: r1.index })
	}
	const refs = (e: Expr): AcctRef[] => {
		const out: AcctRef[] = []
		walkExpr(e, x => {
			if (x.k === 'load') { const r0 = at(x.addr); if (r0 && r0.field) out.push(r0) }
			else if (x.k === 'var') { const nm = fo.names[x.id]; const r0 = nm ? byName.get(nm) : undefined; if (r0?.field) out.push(r0) }
		})
		return out
	}
	res = { byName, refs }
	resMemo.set(fo.f, res)
	return res
}
