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

/** Located leaves of the sample (path -> offset in the object), or undefined when too few were found. */
function locate(p: Program, x: number, smp: Sample): { at: Map<string, SampleLeaf & { mem: number }>; info?: number } | undefined {
	const OUT = 0x2_0000_0200n, SIZE = 0x1000
	const run = (bytes: number[]): Uint8Array | undefined => {
		const mem = new ExecMem(p, 5)
		const base = 0x4_2000_0000n
		const K1 = base, K2 = base + 0x100n, DC = base + 0x200n, LC = base + 0x300n, LV = base + 0x380n, AI = base + 0x400n, SL = base + 0x500n, DB = base + 0x1000n
		const w = (a: bigint, b: Uint8Array | number[]) => mem.write(a, new Uint8Array(b))
		const w64 = (a: bigint, v: bigint) => mem.store(a, 8, v)
		w(K1, unb58(smp.owner))
		w(K2, Array.from({ length: 32 }, (_, i) => 0x40 + i))
		const disc = smp.disc
		const data = [...(disc === undefined ? [] : Array.from({ length: 8 }, (_, i) => Number((disc >> BigInt(8 * i)) & 0xffn))), ...bytes]
		w(DB, data)
		// Rc<RefCell<&mut [u8]>> / Rc<RefCell<&mut u64>>: strong, weak, borrow flag, value
		w64(DC, 1n); w64(DC + 8n, 1n); w64(DC + 0x10n, 0n); w64(DC + 0x18n, DB); w64(DC + 0x20n, BigInt(data.length))
		w64(LC, 1n); w64(LC + 8n, 1n); w64(LC + 0x10n, 0n); w64(LC + 0x18n, LV); w64(LV, 1_000_000_000n)
		// AccountInfo { key, lamports, data, owner, rent_epoch, is_signer, is_writable, executable }; &mut &[AccountInfo]
		w64(AI, K2); w64(AI + 8n, LC); w64(AI + 0x10n, DC); w64(AI + 0x18n, K1); w64(AI + 0x20n, 0n); w(AI + 0x28n, [0, 1, 0])
		w64(SL, AI); w64(SL + 8n, 1n)
		infoAddr = AI
		const e = new Exec(p, mem, { maxSteps: 60_000 })
		e.noPanic = true
		// (the accounts slice in every argument register: the callee's ABI is not known)
		const r = e.run(x, [OUT, SL, SL, SL, SL], 0x2_0000_3000n)
		if (r.abort !== undefined || r.limit || r.stopped) return undefined
		return mem.read(OUT, SIZE)
	}
	let infoAddr = 0n
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
	// the AccountInfo pointer
	let info: number | undefined
	for (let i = 0; i + 8 <= SIZE; i += 8) { let v = 0n; for (let j = 7; j >= 0; j--) v = (v << 8n) | BigInt(base[i + j]); if (v === infoAddr) { info = i; break } }
	return { at, info }
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
	views.add({ name, doc, fields })
	return name
}

function u128(views: Views): string {
	if (!views.opaque.has('u128')) views.opaque.set('u128', { size: 16, doc: '128-bit integer in place (value = its address)' })
	return 'u128'
}

/**
 * Per try_accounts function: variables holding a boxed deserialized account (see the file comment).
 * `fns`: the try_accounts functions with their structured bodies.
 */
export function accountObjects(p: Program, idl: IdlInfo | undefined, views: Views, fns: { pc: number; f: VarFunc; body: Node[] }[], nameFn: number,
	strAt: (ptr: bigint, len: bigint) => string | undefined): Map<number, Map<number, AccountObj>> {
	const res = new Map<number, Map<number, AccountObj>>()
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
		for (const v of immediates(p, x, 3, memo)) { const t = discs.get(v); if (t) hits.add(t) }
		if (!hits.size) for (const t of splOf(x, 3)) hits.add(t)
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
		return v
	}
	for (const { pc, f, body } of fns) {
		const fp = f.vars.find(v => v.param === 10)?.id
		if (fp === undefined) continue
		const fo = (e: Expr): number | undefined => (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const' ? Number(BigInt.asIntN(64, e.b.v)) : undefined)
		let pending: { out: number; type: string; name?: string } | undefined
		const found = new Map<number, AccountObj>()
		const onStmt = (s: Stmt) => {
			if (s.k !== 'call' || s.t.k === 'ind') return
			const tpc = s.t.k === 'fn' ? s.t.pc : -1
			if (tpc === nameFn) { if (pending && !pending.name) pending.name = nameArg(s.args, strAt); return }
			const out = s.args[0] && fo(s.args[0])
			// memcpy(j, <out>, n): the box
			const isCopy = s.t.k === 'sys' ? s.t.name === 'sol_memcpy_' || s.t.name === 'sol_memmove_' : /^(memcpy|memmove)\d*_?$/.test(p.funcs.get(tpc)?.name ?? '')
			if (pending?.name && isCopy && s.args.length >= 3 && s.args[0].k === 'var' && fo(s.args[1]) === pending.out && s.args[2].k === 'const') {
				const v = layout(pendingCallee!, pending.type)
				if (v) found.set(s.args[0].id, { name: pending.name, view: v, rust: pending.type.replace(/^spl:/, '') })
				pending = undefined
				return
			}
			if (out !== undefined && tpc >= 0) {
				const t = calleeType(tpc)
				if (t) { pending = { out, type: t }; pendingCallee = tpc }
			}
		}
		let pendingCallee: number | undefined
		const walk = (ns: Node[]) => {
			for (const n of ns) {
				if (n.k === 'stmt') onStmt(n.s)
				else if (n.k === 'if') { walk(n.then); walk(n.else) }
				else if (n.k === 'block' || n.k === 'loop') walk(n.body)
				else if (n.k === 'switch') n.cases.forEach(c => walk(c.body))
			}
		}
		walk(body)
		if (found.size) res.set(pc, found)
	}
	return res
}
