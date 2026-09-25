// In-memory layouts of deserialized Anchor accounts (views only: nothing here changes semantics).
//
// `Account<'info, T>` deserializes the account data (8-byte discriminator, then T in Borsh) into a Rust
// struct whose field order is the compiler's, not the IDL's. Each instruction's try_accounts function
// gets its accounts from `<Account<T> as Accounts>::try_accounts` (or a similar callee) into a frame
// object and, for `Box<Account<T>>`, copies it to the heap:
//   try_accounts_X(s290, …); if (ld64(s290) == 0) { … Error_with_account_name(…, "whirlpool") … }
//   j = <heap allocation>; memcpy(j, s290, 0x290)
// For each such callee, the IDL account type is the one whose discriminator (a 64-bit immediate) its
// code, or a callee's within 3 calls, holds; its layout comes from running it (exec.ts) on an account
// whose data is a Borsh sample of that type with pseudo-random values and whose owner is the program id
// (from the IDL): each value is then found at its in-memory offset (values of 4+ bytes by their bytes,
// smaller ones by changing them in a second run). The view `<T>` (fields at those offsets, `info` the
// AccountInfo pointer) types the box variable in try_accounts and the Accounts struct field it is
// stored in, from which the business logic loads it.
import type { Program } from './program.ts'
import type { VarFunc } from './dataflow.ts'
import type { Node } from './structure.ts'
import { type Expr, type Stmt } from './ir.ts'
import { borshSample, type IdlInfo, type SampleLeaf } from './idl.ts'
import { Exec, ExecMem, extentOf } from './exec.ts'
import { callTargetName } from './emu.ts'
import { unb58 } from './semantics.ts'
import type { Views, Field } from './views.ts'
import { nameArg } from './anchor.ts'

/** A variable holding a (boxed) deserialized account: its account name, the view of the object, the Rust account type. */
export interface AccountObj { name: string; view: string; rust: string }

const pascal = (s: string) => s.split('_').filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('')

/** 64-bit immediates of a function's code (lddw; v2: mov32 + hor64) and of its callees within `depth` calls. */
function immediates(p: Program, pc: number, depth: number, memo: Map<string, Set<bigint>>): Set<bigint> {
	const k = `${pc}:${depth}`
	let r = memo.get(k)
	if (r) return r
	r = new Set()
	memo.set(k, r)
	const end = extentOf(p, pc), v2 = p.version === 2
	for (let i = pc; i < end; i++) {
		const ins = p.insns[i]
		if (ins.opc === 0x18 && !v2 && i + 1 < end) { r.add((BigInt(p.insns[i + 1].imm >>> 0) << 32n) | BigInt(ins.imm >>> 0)); i++; continue }
		if (v2 && ins.opc === 0xf7 && i > pc && p.insns[i - 1].opc === 0xb4 && p.insns[i - 1].dst === ins.dst) r.add((BigInt(ins.imm >>> 0) << 32n) | BigInt(p.insns[i - 1].imm >>> 0))
		if (ins.opc === 0x85 && depth > 0) {
			const t = callTargetName(p, i, ins.imm)
			if (t.startsWith('fn:')) for (const v of immediates(p, Number(t.slice(3)), depth - 1, memo)) r.add(v)
		}
	}
	return r
}

/** A sample account: its data bytes (after the discriminator, if any) and their leaves; the owner program. */
interface Sample { bytes: number[]; leaves: SampleLeaf[]; disc?: bigint; owner: string }

const rng = () => { let seed = 0x2545f491; return () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed & 0xff } }

/**
 * SPL Token accounts ([known] layouts, spl_token::state, Pack): Account (165 bytes; state 1 = Initialized)
 * and Mint (82 bytes; is_initialized 1).
 */
function splSample(kind: 'TokenAccount' | 'Mint'): Sample {
	const rnd = rng(), bytes: number[] = [], leaves: SampleLeaf[] = []
	const put = (n: number, path: string, type: string, fixed?: number[]) => {
		leaves.push({ path, off: bytes.length, size: n, kind: n === 32 ? 'key' : 'int', type })
		for (let i = 0; i < n; i++) bytes.push(fixed ? fixed[i] : rnd())
	}
	const some = () => bytes.push(1, 0, 0, 0) // COption tag: Some
	if (kind === 'TokenAccount') {
		put(32, 'mint', 'pubkey'); put(32, 'owner', 'pubkey'); put(8, 'amount', 'u64')
		some(); put(32, 'delegate', 'COption<Pubkey>')
		put(1, 'state', 'AccountState', [1])
		some(); put(8, 'is_native', 'COption<u64>')
		put(8, 'delegated_amount', 'u64')
		some(); put(32, 'close_authority', 'COption<Pubkey>')
	} else {
		some(); put(32, 'mint_authority', 'COption<Pubkey>')
		put(8, 'supply', 'u64'); put(1, 'decimals', 'u8')
		put(1, 'is_initialized', 'bool', [1])
		some(); put(32, 'freeze_authority', 'COption<Pubkey>')
	}
	return { bytes, leaves, owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }
}

const OUT = 0x2_0000_0200n, SIZE = 0x1000, AI = 0x4_2000_0400n

/**
 * Run an account-taking callee x (out, &mut &[AccountInfo] in every other argument register: its ABI is not
 * known) on one synthetic account at AI with the given data, owner and flags; the out object's bytes.
 */
function runAccountCallee(p: Program, x: number, data: number[], owner: Uint8Array, flags: [number, number, number], boxAt?: number): Uint8Array | undefined {
	const mem = new ExecMem(p, 5)
	const base = 0x4_2000_0000n
	const K1 = base, K2 = base + 0x100n, DC = base + 0x200n, LC = base + 0x300n, LV = base + 0x380n, SL = base + 0x500n, DB = base + 0x1000n
	const w = (a: bigint, b: Uint8Array | number[]) => mem.write(a, new Uint8Array(b))
	const w64 = (a: bigint, v: bigint) => mem.store(a, 8, v)
	w(K1, owner)
	w(K2, Array.from({ length: 32 }, (_, i) => 0x40 + i))
	w(DB, data)
	// Rc<RefCell<&mut [u8]>> / Rc<RefCell<&mut u64>>: strong, weak, borrow flag, value
	w64(DC, 1n); w64(DC + 8n, 1n); w64(DC + 0x10n, 0n); w64(DC + 0x18n, DB); w64(DC + 0x20n, BigInt(data.length))
	w64(LC, 1n); w64(LC + 8n, 1n); w64(LC + 0x10n, 0n); w64(LC + 0x18n, LV); w64(LV, 1_000_000_000n)
	// AccountInfo { key, lamports, data, owner, rent_epoch, is_signer, is_writable, executable }; &mut &[AccountInfo]
	w64(AI, K2); w64(AI + 8n, LC); w64(AI + 0x10n, DC); w64(AI + 0x18n, K1); w64(AI + 0x20n, 0n); w(AI + 0x28n, flags)
	w64(SL, AI); w64(SL + 8n, 1n)
	const e = new Exec(p, mem, { maxSteps: 60_000 })
	e.noPanic = true
	const r = e.run(x, [OUT, SL, SL, SL, SL], 0x2_0000_3000n)
	if (r.abort !== undefined || r.limit || r.stopped) return undefined
	if (boxAt === undefined) return mem.read(OUT, SIZE)
	// the object the out word boxAt points to (a boxed result)
	const q = mem.readU(OUT + BigInt(boxAt), 8)
	return q >= 0x3_0000_0000n && q < 0x4_0000_0000n ? mem.read(q, SIZE) : undefined
}

/** 8-aligned words among the first 0x40 bytes of an out object that point into the heap (candidate boxes). */
function heapWords(b: Uint8Array): number[] {
	const out: number[] = []
	for (let i = 0; i < 0x40; i += 8) { let v = 0n; for (let j = 7; j >= 0; j--) v = (v << 8n) | BigInt(b[i + j]); if (v >= 0x3_0000_0000n && v < 0x4_0000_0000n) out.push(i) }
	return out
}

/** The first 8-aligned word of an object holding the AccountInfo pointer AI. */
function infoIn(b: Uint8Array, n = SIZE): number | undefined {
	for (let i = 0; i + 8 <= n; i += 8) { let v = 0n; for (let j = 7; j >= 0; j--) v = (v << 8n) | BigInt(b[i + j]); if (v === AI) return i }
	return undefined
}

/**
 * Located leaves of the sample (path -> offset in the object), or undefined when too few were found. The
 * object is the callee's out object, or (boxAt) the heap object an out word points to.
 */
function locate(p: Program, x: number, smp: Sample): { at: Map<string, SampleLeaf & { mem: number }>; info?: number; boxAt?: number } | undefined {
	const r = locateIn(p, x, smp, undefined)
	if (r) return r
	const out = runAccountCallee(p, x, dataOf(smp, smp.bytes), unb58(smp.owner), [0, 1, 0])
	for (const w of out ? heapWords(out) : []) { const b = locateIn(p, x, smp, w); if (b) return { ...b, boxAt: w } }
	return undefined
}

const dataOf = (smp: Sample, bytes: number[]) => [...(smp.disc === undefined ? [] : Array.from({ length: 8 }, (_, i) => Number((smp.disc! >> BigInt(8 * i)) & 0xffn))), ...bytes]

function locateIn(p: Program, x: number, smp: Sample, boxAt: number | undefined): { at: Map<string, SampleLeaf & { mem: number }>; info?: number } | undefined {
	const owner = unb58(smp.owner)
	const run = (bytes: number[]) => runAccountCallee(p, x, dataOf(smp, bytes), owner, [0, 1, 0], boxAt)
	const base = run(smp.bytes)
	if (!base) return undefined
	const find = (b: number[]) => {
		let hit = -1
		for (let i = 0; i + b.length <= base.length; i++) {
			let ok = true
			for (let j = 0; j < b.length; j++) if (base[i + j] !== b[j]) { ok = false; break }
			if (ok) { if (hit >= 0) return -2; hit = i }
		}
		return hit
	}
	const at = new Map<string, SampleLeaf & { mem: number }>()
	let big = 0
	for (const l of smp.leaves) {
		if (l.heap || l.size < 4) continue
		big++
		const h = find(smp.bytes.slice(l.off, l.off + l.size))
		if (h >= 0) at.set(l.path, { ...l, mem: h })
	}
	if (big && at.size * 2 < big) return undefined
	// small values: change one at a time and see which bytes move (not the values that must stay valid)
	let runs = 0
	for (const l of smp.leaves) {
		if (l.heap || l.size >= 4 || runs >= 24 || l.type === 'AccountState' || (l.type === 'bool' && !smp.disc)) continue
		runs++
		const b2 = [...smp.bytes]
		for (let i = 0; i < l.size; i++) b2[l.off + i] = l.kind === 'bool' ? 0 : (b2[l.off + i] ^ 0x5a) & 0xff
		const o2 = run(b2)
		if (!o2) continue
		const diff: number[] = []
		for (let i = 0; i < SIZE; i++) if (o2[i] !== base[i]) diff.push(i)
		if (diff.length && diff.length <= l.size && diff[diff.length - 1] - diff[0] < l.size) at.set(l.path, { ...l, mem: diff[0] - (l.kind === 'bool' ? 0 : 0) })
	}
	if (!at.size) return undefined
	return { at, info: infoIn(base) }
}

/** Views of a located layout: the object, nested structs and arrays of structs as element views. */
function buildViews(views: Views, top: string, doc: string, at: Map<string, SampleLeaf & { mem: number }>, info: number | undefined): string | undefined {
	const taken = (n: string) => views.map.has(n) || views.opaque.has(n)
	// (another layout of the same type, e.g. another container: <T>_2; a name taken by another view: <T>Obj)
	const viewName = (n: string) => {
		if (!taken(n)) return n
		const own = (x: string) => views.map.get(x)?.doc.startsWith('Account<') || views.map.get(x)?.doc.startsWith('element of')
		const b = own(n) ? n : `${n}Obj`
		if (!taken(b)) return b
		let k = 2
		while (taken(`${b}_${k}`)) k++
		return `${b}_${k}`
	}
	interface Tree { leaf?: SampleLeaf & { mem: number }; kids: Map<string, Tree>; order: string[] }
	const root: Tree = { kids: new Map(), order: [] }
	const add = (path: string[], leaf: SampleLeaf & { mem: number }) => {
		let t = root
		for (const seg of path) { let c = t.kids.get(seg); if (!c) { c = { kids: new Map(), order: [] }; t.kids.set(seg, c); t.order.push(seg) } t = c }
		t.leaf = leaf
	}
	for (const [path, l] of at) add(path.split(/\.|(?=\[)/), l)
	const lo = (t: Tree): number => (t.leaf ? t.leaf.mem : Math.min(...[...t.kids.values()].map(lo)))
	const hi = (t: Tree): number => (t.leaf ? t.leaf.mem + t.leaf.size : Math.max(...[...t.kids.values()].map(hi)))
	// the IDL type where the view type does not say it (signed, bool, floats, 128-bit, byte arrays)
	const typeDoc = (l: SampleLeaf): string | undefined => (/^(u8|u16|u32|u64|u128|pubkey)$/.test(l.type) ? undefined : l.type)
	const leafType = (l: SampleLeaf): Field['t'] => l.size === 1 || l.size === 2 || l.size === 4 || l.size === 8 ? (l.kind === 'key' || l.kind === 'bytes' ? { k: 'embed', type: views.bytes(l.size) } : { k: 'scalar', size: l.size }) : l.size === 16 && l.kind === 'int' ? { k: 'embed', type: u128(views) } : { k: 'embed', type: views.bytes(l.size) }
	/** fields of a struct node, offsets relative to `base` */
	const fieldsOf = (t: Tree, base: number, prefix: string, typeHint: string): Field[] => {
		const out: Field[] = []
		for (const seg of t.order) {
			const c = t.kids.get(seg)!
			const name = prefix + seg
			if (c.leaf && !c.kids.size) { out.push({ name, off: c.leaf.mem - base, t: leafType(c.leaf), doc: typeDoc(c.leaf) }); continue }
			const idx = [...c.kids.keys()]
			if (idx.every(k => /^\[\d+\]$/.test(k))) {
				// an array: of structs (element view with a constant stride), else flattened
				const els = idx.map(k => c.kids.get(k)!)
				const structEls = els.every(e => !e.leaf && e.kids.size)
				if (structEls && els.length > 1) {
					const stride = lo(els[1]) - lo(els[0])
					const ok = stride > 0 && els.every((e, i) => lo(e) === lo(els[0]) + i * stride) && els.every(e => hi(e) - lo(e) <= stride)
					if (ok) {
						const ev = viewName(`${typeHint}${pascal(seg)}Elem`)
						const merged: Tree = { kids: new Map(), order: [] }
						for (const e of els) for (const s2 of e.order) if (!merged.kids.has(s2)) { merged.kids.set(s2, e.kids.get(s2)!); merged.order.push(s2) }
						const eb = lo(els[0])
						// element fields from element 0 (offsets relative to the element)
						views.add({ name: ev, doc: `element of ${top}.${name} (in-memory layout)`, size: stride, fields: fieldsOf(els[0], eb, '', ev) })
						out.push({ name, off: eb - base, t: { k: 'embed', type: ev }, count: els.length })
						continue
					}
				}
				els.forEach((e, i) => { if (e.leaf && !e.kids.size) out.push({ name: `${name}_${i}`, off: e.leaf.mem - base, t: leafType(e.leaf), doc: typeDoc(e.leaf) }); else out.push(...fieldsOf(e, base, `${name}_${i}_`, typeHint)) })
				continue
			}
			// a nested struct: flattened (Rust keeps it contiguous, but its own field order)
			out.push(...fieldsOf(c, base, `${name}_`, typeHint))
		}
		return out
	}
	const fields = fieldsOf(root, 0, '', top)
	if (info !== undefined) fields.push({ name: 'info', off: info, t: { k: 'ref', to: 'AccountInfo' }, doc: '&AccountInfo' })
	fields.sort((a, b) => a.off - b.off)
	// the same layout found through another callee: that view
	const key = JSON.stringify(fields)
	for (const v of views.map.values()) if (v.doc.startsWith('Account<') && v.name.replace(/(Obj)?(_\d+)?$/, '') === top && JSON.stringify(v.fields) === key) return v.name
	const name = viewName(top)
	// (a size, so an object in place in another struct does not cover what follows it)
	let end = 0
	for (const f of fields) end = Math.max(end, f.off + views.width(f.t) * (f.count ?? 1))
	views.add({ name, doc, fields, size: (end + 7) & ~7 })
	return name
}

function u128(views: Views): string {
	if (!views.opaque.has('u128')) views.opaque.set('u128', { size: 16, doc: '128-bit integer in place (value = its address)' })
	return 'u128'
}

/**
 * Per try_accounts function: the boxed accounts' variables, the accounts stored in place in the struct it
 * returns, the struct's words holding a boxed account, and those holding the &AccountInfo other account
 * kinds start with (Signer, AccountLoader, Program, UncheckedAccount, …), by account name.
 */
export interface AccountObjs { boxes: Map<number, AccountObj>; inline: Map<number, AccountObj>; refs: Map<number, AccountObj>; infos: Map<number, string> }

/**
 * Per try_accounts function (see the file comment): variables holding a boxed deserialized account, and
 * deserialized accounts copied in place into the returned struct (at which offset). The objects are
 * followed through the frame word by word (stores of loaded words, memcpy/copy) in statement order.
 */
export function accountObjects(p: Program, idl: IdlInfo | undefined, views: Views, fns: { pc: number; f: VarFunc; body: Node[] }[], nameFn: number,
	strAt: (ptr: bigint, len: bigint) => string | undefined): Map<number, AccountObjs> {
	const res = new Map<number, AccountObjs>()
	const discs = new Map<bigint, string>()
	if (idl?.address) for (const a of idl.accounts) discs.set(a.disc, a.name)
	const memo = new Map<string, Set<bigint>>()
	const typeOf = new Map<number, string | null>() // callee -> account type ('spl:…' for SPL Token accounts)
	const viewOf = new Map<string, string | null>() // `${callee}:${type}` -> view
	// SPL Token account types: callees (within 3 calls) of spl_token::state::{Account, Mint}::unpack*
	const splMemo = new Map<string, Set<string>>()
	const splOf = (pc: number, depth: number): Set<string> => {
		const k = `${pc}:${depth}`
		let r = splMemo.get(k)
		if (r) return r
		r = new Set()
		splMemo.set(k, r)
		const nm = p.funcs.get(pc)?.name ?? ''
		const m = /^(Account|Mint)_unpack(_from_slice|_unchecked)?(_[0-9a-f]+)?$/.exec(nm)
		if (m) { r.add(m[1] === 'Account' ? 'spl:TokenAccount' : 'spl:Mint'); return r }
		if (depth === 0) return r
		const end = extentOf(p, pc)
		for (let i = pc; i < end; i++) if (p.insns[i].opc === 0x85) {
			const t = callTargetName(p, i, p.insns[i].imm)
			if (t.startsWith('fn:')) for (const x of splOf(Number(t.slice(3)), depth - 1)) r.add(x)
		}
		return r
	}
	const calleeType = (x: number): string | undefined => {
		if (typeOf.has(x)) return typeOf.get(x) ?? undefined
		const hits = new Set<string>()
		for (const v of immediates(p, x, 4, memo)) { const t = discs.get(v); if (t) hits.add(t) }
		if (!hits.size) for (const t of splOf(x, 5)) hits.add(t)
		const t = hits.size === 1 ? [...hits][0] : undefined
		typeOf.set(x, t ?? null)
		return t
	}
	const layout = (x: number, t: string): string | undefined => {
		const k = `${x}:${t}`
		if (viewOf.has(k)) return viewOf.get(k) ?? undefined
		viewOf.set(k, null)
		let smp: Sample | undefined, doc: string, name: string
		if (t.startsWith('spl:')) {
			const kind = t.slice(4) as 'TokenAccount' | 'Mint'
			smp = splSample(kind)
			name = kind
			doc = `Account<${kind}> (anchor_spl, SPL Token ${kind === 'Mint' ? 'Mint' : 'Account'}) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of ${p.funcs.get(x)?.name ?? 'fn'} put them [offsets from exec]; info = the &AccountInfo)`
		} else {
			const def = idl!.types.get(t), acc = idl!.accounts.find(a => a.name === t)
			if (def?.kind !== 'struct' || !Array.isArray(def.fields) || !acc) return undefined
			const fields = def.fields.filter((f: any) => typeof f === 'object' && f.name).map((f: any) => ({ name: f.name, type: f.type }))
			const b = borshSample(fields, idl!.types, rng())
			if (!b) return undefined
			smp = { ...b, disc: acc.disc, owner: idl!.address! }
			name = pascal(t)
			doc = `Account<${t}> as deserialized in memory (the IDL fields at the offsets a run of ${p.funcs.get(x)?.name ?? 'fn'} put them [idl names; offsets from exec]; info = the &AccountInfo)`
		}
		const loc = locate(p, x, smp)
		if (!loc) return undefined
		const v = buildViews(views, name, doc, loc.at, loc.info)
		viewOf.set(k, v ?? null)
		if (loc.boxAt !== undefined) boxAtOf.set(k, loc.boxAt)
		return v
	}
	const boxAtOf = new Map<string, number>() // `${callee}:${type}` -> out word holding a box of the object
	const infoWords = new Map<number, number | null>()
	const infoWord = (x: number, t: string | undefined): number | undefined => {
		if (!infoWords.has(x)) {
			// (an IDL account type: its discriminator and the program as owner, e.g. for AccountLoader<T>)
			const acc = t && !t.startsWith('spl:') ? idl?.accounts.find(a => a.name === t) : undefined
			const data = Array.from({ length: 0x400 }, (_, i) => (i < 8 && acc ? Number((acc.disc >> BigInt(8 * i)) & 0xffn) : i & 0xff))
			const owner = acc && idl?.address ? unb58(idl.address) : new Uint8Array(32).fill(7)
			const b = runAccountCallee(p, x, data, owner, [1, 1, 0])
			infoWords.set(x, (b && infoIn(b, 0x40)) ?? null)
		}
		return infoWords.get(x) ?? undefined
	}
	const sizeOf = (v: string) => {
		const view = views.map.get(v)!
		if (view.size) return view.size
		let n = 0
		for (const f of view.fields) n = Math.max(n, f.off + views.width(f.t) * (f.count ?? 1))
		return (n + 7) & ~7
	}
	for (const { pc, f, body } of fns) {
		const fp = f.vars.find(v => v.param === 10)?.id
		const outP = f.vars.find(v => v.param === 1)?.id
		if (fp === undefined || outP === undefined) continue
		// variables that only ever hold the out parameter
		const defs = new Map<number, Expr[]>()
		for (const b of f.blocks) for (const st of b.stmts) if (st.k === 'set' || st.k === 'call') { let l = defs.get(st.dst); if (!l) defs.set(st.dst, (l = [])); l.push(st.k === 'set' ? st.e : { k: 'undef' }) }
		if (defs.has(outP)) continue
		const isOut = (id: number) => id === outP || (defs.get(id)?.every(e => e.k === 'var' && e.id === outP) ?? false)
		const off = (e: Expr, base: (id: number) => boolean): number | undefined => {
			if (e.k === 'var' && base(e.id)) return 0
			if (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && base(e.a.id) && e.b.k === 'const') return Number(BigInt.asIntN(64, e.b.v))
			return undefined
		}
		const fo = (e: Expr) => off(e, id => id === fp), oo = (e: Expr) => off(e, isOut)
		interface Obj { type?: string; callee: number; view?: string; name?: string }
		// the accounts slice (&mut &[AccountInfo], the third parameter): calls given it take the next account
		const accountsP = f.vars.find(v => v.param === 3)?.id
		const takesAccounts = (args: Expr[]) => accountsP !== undefined && !defs.has(accountsP) && args.some(a => a.k === 'var' && a.id === accountsP)
		interface Org { obj: number; off: number }
		const objs: Obj[] = []
		const org = new Map<number, Org>()     // frame word -> which object word it holds
		const varOrg = new Map<number, Org>()  // variable -> which object word it holds
		const outWords = new Map<number, Org>()
		// (off -1: a pointer to the object, i.e. its box)
		const boxVars = new Map<number, number>()
		const originOf = (e: Expr): Org | undefined => {
			if (e.k === 'var') return varOrg.get(e.id)
			if (e.k === 'load' && e.size === 8) { const o = fo(e.addr); return o === undefined ? undefined : org.get(o) }
			return undefined
		}
		const clobber = (o: number, n: number) => { for (const w of [...org.keys()]) if (w + 8 > o && w < o + n) org.delete(w) }
		const put = (dst: Expr, i: number, v: Org | undefined) => {
			const g = fo(dst), k = oo(dst)
			if (g !== undefined) { clobber(g + i, 8); if (v) org.set(g + i, v) }
			else if (k !== undefined && v) outWords.set(k + i, v)
		}
		const copy = (dst: Expr, src: Expr, n: number) => {
			const f0 = fo(src)
			if (f0 === undefined) { const g = fo(dst); if (g !== undefined) clobber(g, n); return }
			const words = Array.from({ length: n >> 3 }, (_, i) => org.get(f0 + 8 * i))
			// the box: memcpy(j, <object>, n)
			const o0 = words[0]
			if (dst.k === 'var' && o0 && o0.off === 0 && fo(dst) === undefined && oo(dst) === undefined) {
				if (objs[o0.obj].view) { boxVars.set(dst.id, o0.obj); varOrg.set(dst.id, { obj: o0.obj, off: -1 }) }
				return
			}
			const g = fo(dst)
			if (g !== undefined) clobber(g, n)
			words.forEach((w, i) => put(dst, 8 * i, w))
		}
		const onStmt = (s0: Stmt) => {
			// (a call whose result is assigned: its side effects like a call statement's)
			const s: Stmt = s0.k === 'set' && s0.e.k === 'call' ? { k: 'call', dst: s0.dst, t: s0.e.t, args: s0.e.args, pc: s0.pc } : s0
			if (s.k === 'set') {
				const o = originOf(s.e)
				if (o) varOrg.set(s.dst, o); else varOrg.delete(s.dst)
				if (o?.off === -1) boxVars.set(s.dst, o.obj)
				return
			}
			if (s.k === 'store') { if (s.size === 8) put(s.addr, 0, originOf(s.v)); else { const g = fo(s.addr); if (g !== undefined) clobber(g, s.size) } return }
			if (s.k === 'stores') { if (s.size === 8) s.vals.forEach((v, i) => put(s.addr, 8 * i, originOf(v))); else { const g = fo(s.addr); if (g !== undefined) clobber(g, s.size * s.vals.length) } return }
			if (s.k === 'copy') { copy(s.dst, s.src, s.n); return }
			if (s.k !== 'call' || s.t.k === 'ind') return
			if (s.dst >= 0) varOrg.delete(s.dst)
			const tpc = s.t.k === 'fn' ? s.t.pc : -1
			// the account-name error: its payload is the error the call returned (words of its out object)
			if (tpc === nameFn) {
				const nm = nameArg(s.args, strAt)
				for (const a of s.args.slice(0, -2)) { const o = originOf(a); if (o && nm && !objs[o.obj].name) objs[o.obj].name = nm }
				return
			}
			const isCopy = s.t.k === 'sys' ? s.t.name === 'sol_memcpy_' || s.t.name === 'sol_memmove_' : /^(memcpy|memmove)\d*_?$/.test(p.funcs.get(tpc)?.name ?? '')
			if (isCopy && s.args.length >= 3 && s.args[2].k === 'const' && s.args[2].v < 0x10000n) { copy(s.args[0], s.args[1], Number(s.args[2].v)); return }
			// another call writing through frame addresses
			for (const a of s.args) { const g = fo(a); if (g !== undefined) clobber(g, 0x100) }
			const out = s.args[0] && fo(s.args[0])
			if (out !== undefined && tpc >= 0) {
				const t = calleeType(tpc)
				const view = t && layout(tpc, t)
				if (t && view) {
					const id = objs.push({ type: t, callee: tpc, view }) - 1
					const box = boxAtOf.get(`${tpc}:${t}`)
					if (box !== undefined) { clobber(out, 0x40); org.set(out + box, { obj: id, off: -1 }) }
					else {
						const n = sizeOf(view)
						clobber(out, n)
						for (let w = 0; w < n; w += 8) org.set(out + w, { obj: id, off: w })
					}
				} else if (takesAccounts(s.args)) {
					// another account kind (e.g. AccountLoader<T>, Signer): the word holding the &AccountInfo (from a run)
					const w = infoWord(tpc, t)
					if (w !== undefined) {
						const id = objs.push({ callee: tpc, type: t }) - 1
						org.set(out + w, { obj: id, off: 0 })
					}
				}
			}
		}
		// statement order; a branch that always leaves (an error return) does not change the frame state
		// after it (what it stores into the returned struct is kept: only object words are recorded)
		const exits = (ns: Node[]) => { const l = ns[ns.length - 1]; return !!l && (l.k === 'return' || l.k === 'break' || l.k === 'continue' || l.k === 'trap') }
		const isolated = (ns: Node[]) => {
			const o = new Map(org), v = new Map(varOrg)
			walk(ns)
			org.clear(); o.forEach((x, k) => org.set(k, x))
			varOrg.clear(); v.forEach((x, k) => varOrg.set(k, x))
		}
		const walk = (ns: Node[]) => {
			for (const n of ns) {
				if (n.k === 'stmt') onStmt(n.s)
				else if (n.k === 'if') {
					if (exits(n.then)) { isolated(n.then); walk(n.else) }
					else if (exits(n.else)) { isolated(n.else); walk(n.then) }
					else { walk(n.then); walk(n.else) }
				} else if (n.k === 'block' || n.k === 'loop') walk(n.body)
				else if (n.k === 'switch') n.cases.forEach(c => walk(c.body))
			}
		}
		walk(body)
		// objects in place in the returned struct: out words holding one object's words at a constant distance
		const inline = new Map<number, AccountObj>()
		const bases = new Map<string, number>() // `${obj}:${base}` -> words
		for (const [k, o] of outWords) { const key = `${o.obj}:${k - o.off}`; bases.set(key, (bases.get(key) ?? 0) + 1) }
		const infos = new Map<number, string>()
		const acc = (ob: { name?: string; view?: string; type?: string }): AccountObj => ({ name: ob.name!, view: ob.view!, rust: ob.type!.replace(/^spl:/, '') })
		const boxes = new Map<number, AccountObj>(), refs = new Map<number, AccountObj>()
		for (const [v, id] of boxVars) if (objs[id].name && objs[id].type) boxes.set(v, acc(objs[id]))
		for (const [k, o] of outWords) if (o.off === -1 && objs[o.obj].name && objs[o.obj].type) refs.set(k, acc(objs[o.obj]))
		for (const [key, n] of bases) {
			const [obj, base] = key.split(':').map(Number)
			const ob = objs[obj]
			if (!ob.name || base < 0 || key.endsWith(':-1') || outWords.get(base)?.off === -1) continue
			if (!ob.view) { if (outWords.get(base)?.off === 0) infos.set(base, ob.type ? `${ob.name}:${ob.type.replace(/^spl:/, '')}` : ob.name); continue }
			if (n < 2 || !ob.type) continue
			inline.set(base, { name: ob.name, view: ob.view, rust: ob.type.replace(/^spl:/, '') })
		}
		if (boxes.size || inline.size || infos.size || refs.size) res.set(pc, { boxes, inline, refs, infos })
	}
	return res
}
