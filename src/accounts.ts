// Account recognition (comments only: nothing here changes semantics).
//
// Two layouts are recognized:
//  - solana_program AccountInfo (Rust struct, 0x30 bytes; `&[AccountInfo]` has stride 0x30):
//      +0 key: &Pubkey  +8 lamports: Rc<RefCell<&mut u64>>  +0x10 data: Rc<RefCell<&mut [u8]>>
//      +0x18 owner: &Pubkey  +0x20 rent_epoch  +0x28 is_signer  +0x29 is_writable  +0x2a executable
//  - the serialized input record itself (what pinocchio-style AccountInfo points to):
//      +0 borrow state / dup marker  +1 is_signer  +2 is_writable  +3 executable  +8 key[32]
//      +0x28 owner[32]  +0x48 lamports  +0x50 data_len  +0x58 data
// Loads through a pointer known to be an account get the field name, which makes signer / writable /
// owner / key checks visible. A pointer is an account when
//   - (Rust) it is the element a slice cursor points at: x = ld64(P) … st64(P, x + 0x30)
//     (slice iteration / next_account_info), or an element 0x30 * k further;
//   - the function reads a flag byte from it and either two more fields of the layout (with the
//     right sizes) or its key / owner as a 32-byte value (compared, copied or read word-wise);
//   - it is an unmodified parameter and some call site passes an account (and none a constant).
import type { VarFunc } from './dataflow.ts'
import { type Expr, walkExpr } from './ir.ts'
import { stmtExprs } from './simplify.ts'

type Kind = 'info' | 'raw'
interface Layout { loads: Record<number, [number, string]>; flags: number[]; keyPtrs: bigint[]; keyAddrs: bigint[] }
const LAYOUTS: Record<Kind, Layout> = {
	info: {
		loads: { 0: [8, 'key'], 8: [8, 'lamports'], 0x10: [8, 'data'], 0x18: [8, 'owner'], 0x20: [8, 'rent_epoch'], 0x28: [1, 'is_signer'], 0x29: [1, 'is_writable'], 0x2a: [1, 'executable'] },
		flags: [0x28, 0x29, 0x2a], keyPtrs: [0n, 0x18n], keyAddrs: [],
	},
	raw: {
		loads: { 1: [1, 'is_signer'], 2: [1, 'is_writable'], 3: [1, 'executable'], 0x48: [8, 'lamports'], 0x50: [8, 'data_len'] },
		flags: [1, 2, 3], keyPtrs: [], keyAddrs: [8n, 0x28n],
	},
}
const STRIDE = 0x30n

/** canonical text of an expression (identity for the typing maps) */
function key(e: Expr): string {
	switch (e.k) {
		case 'var': return `v${e.id}`
		case 'const': return `#${e.v}`
		case 'load': return `L${e.size}(${key(e.addr)})`
		case 'bin': return `(${e.op} ${key(e.a)} ${key(e.b)})`
		default: return JSON.stringify(e, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
	}
}
function split(e: Expr): [Expr, bigint] {
	if (e.k === 'bin' && e.op === 'add' && e.b.k === 'const') return [e.a, BigInt.asIntN(64, e.b.v)]
	return [e, 0n]
}
const offKey = (k: string, o: bigint) => (o === 0n ? k : `(add ${k} #${BigInt.asUintN(64, o)})`)

export type Typed = Map<string, Kind> // expression key -> layout it points to

interface FnInfo { f: VarFunc; typed: Typed; params: Map<number, number>; addrs?: Map<string, Set<number>> } // params: var id -> register

/** Per function: expressions (variables, loads) that point to an account. */
export function findAccounts(funcs: Map<number, { f: VarFunc }>): Map<number, Typed> {
	const info = new Map<number, FnInfo>()
	for (const [pc, { f }] of funcs) {
		const params = new Map<number, number>()
		for (const v of f.vars) if (v.param >= 1 && v.param <= 5) params.set(v.id, v.param)
		info.set(pc, { f, typed: new Map(), params })
	}
	const paramTyped = new Map<number, Map<number, Kind>>() // callee pc -> parameter register -> kind
	const blocked = new Map<number, Set<number>>()           // callee pc -> registers some caller passes a constant in
	for (let round = 0; round < 6; round++) {
		let changed = false
		for (const [pc, fi] of info) if (local(fi, paramTyped.get(pc))) changed = true
		// call sites vote for callee parameters
		for (const [, fi] of info) forEachCall(fi.f, (t, args) => {
			args.forEach((a, i) => {
				const r = i + 1
				if (a.k === 'const') { let s = blocked.get(t); if (!s) blocked.set(t, (s = new Set())); s.add(r); return }
				const k = kindOf(fi.typed, a)
				if (!k) return
				let s = paramTyped.get(t); if (!s) paramTyped.set(t, (s = new Map()))
				if (!s.has(r)) { s.set(r, k); changed = true }
			})
		})
		for (const [t, s] of blocked) for (const r of s) paramTyped.get(t)?.delete(r)
		if (!changed) break
	}
	return new Map([...info].map(([pc, fi]) => [pc, fi.typed]))
}

/** Kind of account `e` points to (a Rust AccountInfo pointer may be offset by whole elements). */
function kindOf(typed: Typed, e: Expr): Kind | undefined {
	const [b, o] = split(e)
	const k = typed.get(key(b))
	return k && (o === 0n || (k === 'info' && o > 0n && o % STRIDE === 0n)) ? k : undefined
}

function forEachCall(f: VarFunc, cb: (target: number, args: Expr[]) => void) {
	const visit = (e: Expr) => walkExpr(e, x => { if (x.k === 'call' && x.t.k === 'fn') cb(x.t.pc, x.args) })
	for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k === 'call' && s.t.k === 'fn') cb(s.t.pc, s.args)
		stmtExprs(s).forEach(visit)
	}
}

/** Local evidence; returns true if the typed set grew. */
function local(fi: FnInfo, typedParams: Map<number, Kind> | undefined): boolean {
	const { f, typed } = fi
	const n0 = typed.size
	const add = (e: Expr, k: Kind) => { if (!typed.has(key(e))) typed.set(key(e), k) }
	// definitions of variables (x = expr)
	const defs = new Map<number, Expr[]>()
	for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k === 'set') { let a = defs.get(s.dst); if (!a) defs.set(s.dst, (a = [])); a.push(s.e) }
		else if (s.k === 'call' && s.dst >= 0) { let a = defs.get(s.dst); if (!a) defs.set(s.dst, (a = [])); a.push({ k: 'undef' }) }
	}
	for (const [v, r] of fi.params) { const k = typedParams?.get(r); if (k && !defs.has(v)) add({ k: 'var', id: v }, k) }
	const single = (e: Expr): Expr => { if (e.k === 'var') { const d = defs.get(e.id); if (d?.length === 1) return d[0] } return e }
	// per base expression: loads at layout offsets, and 32-byte uses of base + off / of ld64(base + off)
	const loads = new Map<string, Map<number, number>>() // base -> offset -> size
	const note = (e: Expr) => walkExpr(e, x => {
		if (x.k !== 'load') return
		const [b, o] = split(x.addr)
		let m = loads.get(key(b)); if (!m) loads.set(key(b), (m = new Map())); m.set(Number(o), x.size)
	})
	const addrs = (fi.addrs ??= fieldAddrs(f))
	const wide = new Set<string>() // keys of address expressions used as 32-byte values
	const use32 = (e: Expr) => { const [b, o] = split(single(e)); wide.add(offKey(key(b), o)) }
	const scan = (e: Expr) => walkExpr(e, x => {
		if (x.k === 'fn' && (x.name === 'memeq' || x.name === 'keyeq')) { use32(x.args[0]); if (x.name === 'memeq') use32(x.args[1]) }
		if (x.k === 'load' && x.size === 8) { const [b] = split(x.addr); const sb = single(b); if (sb.k === 'load') use32(sb) }
	})
	for (const b of f.blocks) {
		for (const s of b.stmts) {
			stmtExprs(s).forEach(note)
			stmtExprs(s).forEach(scan)
			if (s.k === 'copy' && s.n === 32) { use32(s.src); use32(s.dst) }
			// slice cursor: st64(P, x + 0x30) with x = ld64(P)
			if (s.k === 'store' && s.size === 8) {
				const [x, o] = split(s.v)
				const cur: Expr = { k: 'load', size: 8, addr: s.addr }
				if (o === STRIDE && key(single(x)) === key(cur)) { add(cur, 'info'); add(x, 'info') }
			}
		}
		if (b.term.k === 'br') { note(b.term.c); scan(b.term.c) }
		else if (b.term.k === 'ret' && b.term.e) note(b.term.e)
	}
	for (const [bk, m] of loads) for (const kind of ['info', 'raw'] as Kind[]) {
		const L = LAYOUTS[kind]
		const fit = [...m].filter(([o, sz]) => L.loads[o]?.[0] === sz)
		if (!fit.some(([o]) => L.flags.includes(o))) continue
		const keyed = L.keyPtrs.some(o => wide.has(`L8(${offKey(bk, o)})`)) || L.keyAddrs.some(o => wide.has(offKey(bk, o)))
		// without a 32-byte key/owner use, demand more layout fields (a Rust clone reads all eight;
		// a raw record: lamports and data_len)
		const many = kind === 'info' ? fit.length >= 4 : (m.get(0x48) === 8 && m.get(0x50) === 8) || (addrs.get(bk)?.size ?? 0) >= 2
		if (keyed || many) { if (!typed.has(bk)) typed.set(bk, kind); break }
	}
	// propagate through single-definition copies, loads of typed cursors and whole-element strides
	for (let it = 0; it < 4; it++) for (const [v, es] of defs) {
		if (es.length !== 1) continue
		const k = kindOf(typed, es[0]) ?? (es[0].k === 'load' ? typed.get(key(es[0])) : undefined)
		if (k) add({ k: 'var', id: v }, k)
	}
	return typed.size !== n0
}

/**
 * Raw records: field addresses (key / owner / lamports / data) of variables taken as values, e.g. in a
 * C-ABI SolAccountInfo build: variable key -> offsets.
 */
function fieldAddrs(f: VarFunc): Map<string, Set<number>> {
	const addrs = new Map<string, Set<number>>()
	const visit = (x: Expr, isAddr: boolean) => {
		if (!isAddr && x.k === 'bin' && x.op === 'add' && x.a.k === 'var' && x.b.k === 'const' && (x.b.v === 8n || x.b.v === 0x28n || x.b.v === 0x48n || x.b.v === 0x58n)) {
			const k = `v${x.a.id}`; let m = addrs.get(k); if (!m) addrs.set(k, (m = new Set())); m.add(Number(x.b.v))
		}
		switch (x.k) {
			case 'load': visit(x.addr, true); break
			case 'bin': case 'cmp': case 'land': case 'lor': visit(x.a, false); visit(x.b, false); break
			case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': visit(x.a, false); break
			case 'sel': visit(x.c, false); visit(x.a, false); visit(x.b, false); break
			case 'call': case 'fn': x.args.forEach(a => visit(a, false)); break
		}
	}
	for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k === 'store' || s.k === 'stores') (s.k === 'store' ? [s.v] : s.vals).forEach(v => visit(v, false))
		else if (s.k === 'call') s.args.forEach(v => visit(v, false))
		else if (s.k === 'set') visit(s.e, false)
	}
	return addrs
}

/** Field name for a load through a known account pointer, e.g. `is_signer`. */
export function accountField(typed: Typed | undefined, e: Expr): string | undefined {
	if (!typed || e.k !== 'load') return undefined
	const [b, o] = split(e.addr)
	const kind = typed.get(key(b))
	if (!kind || o < 0n) return undefined
	const L = LAYOUTS[kind]
	if (kind === 'raw') {
		const fd = L.loads[Number(o)]
		if (fd && fd[0] === e.size) return fd[1]
		if (o >= 8n && o < 0x48n && e.size === 8) return `${o < 0x28n ? 'key' : 'owner'}[${(o - (o < 0x28n ? 8n : 0x28n)) / 8n}]`
		return undefined
	}
	const idx = o / STRIDE, fd = L.loads[Number(o % STRIDE)]
	if (!fd || fd[0] !== e.size) return undefined
	return idx ? `[${idx}].${fd[1]}` : fd[1] // [k]: the k-th AccountInfo after this one
}

/** Name for an address inside a raw account record (`&owner`), for 32-byte comparisons. */
export function accountAddr(typed: Typed | undefined, e: Expr): string | undefined {
	if (!typed) return undefined
	const [b, o] = split(e)
	if (typed.get(key(b)) !== 'raw') return undefined
	return o === 8n ? '&key' : o === 0x28n ? '&owner' : o === 0x58n ? '&data' : undefined
}
