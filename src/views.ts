// Typed views: named fields over memory, printed as `x.field` (exact aliases of loads, stores and
// address arithmetic; see the `at<>` declarations emitted with the output).
//
//   interface AccountInfo {
//   	key: at<0x00, ref<Pubkey>>   // 8-byte pointer: x.key = ld64(x + 0), a Pubkey (its address)
//   	is_signer: at<0x28, u8>      // scalar: x.is_signer = ld8(x + 0x28); `x.is_signer = v` stores
//   }
//   interface AccountRecord {
//   	key: at<0x08, Pubkey>        // embedded: x.key = x + 8 (a Pubkey, i.e. its address)
//   }
//
// A value of a view type is an address (a u64). Which variables get which view is heuristic (see
// accounts.ts); what `x.field` denotes is not: it is defined by the declaration alone, so the output
// stays exact whatever x holds.
import type { Expr } from './ir.ts'
import { borshPrefix, structFields, type BorshField } from './idl.ts'

export type FieldType =
	| { k: 'scalar'; size: 1 | 2 | 4 | 8 }
	| { k: 'ref'; to: string }    // 8-byte pointer to a `to`
	| { k: 'embed'; type: string } // a `type` stored in place (value = its address)
/** `count`: an array of that many `t` in a row (an embedded sized view: x.f[k] is the k-th) */
export interface Field { name: string; off: number; t: FieldType; doc?: string; count?: number }
export interface View { name: string; doc: string; size?: number; fields: Field[] }

const S = (size: 1 | 2 | 4 | 8): FieldType => ({ k: 'scalar', size })
const REF = (to: string): FieldType => ({ k: 'ref', to })
const EMB = (type: string): FieldType => ({ k: 'embed', type })

/** Opaque embedded types: no fields, fixed or open-ended size. */
export const OPAQUE: Record<string, { size?: number; doc: string }> = {
	Pubkey: { size: 32, doc: '32-byte public key (a Pubkey value is its address)' },
	bytes: { doc: 'byte array in place (a bytes value is its address)' },
}

export const BUILTIN_VIEWS: View[] = [
	{
		name: 'AccountInfo', size: 0x30, doc: 'solana_program::account_info::AccountInfo (Rust struct, 0x30 bytes; `&[AccountInfo]` has stride 0x30)',
		fields: [
			{ name: 'key', off: 0x00, t: REF('Pubkey'), doc: '&Pubkey' },
			{ name: 'lamports', off: 0x08, t: REF('LamportsCell'), doc: 'Rc<RefCell<&mut u64>>' },
			{ name: 'data', off: 0x10, t: REF('DataCell'), doc: 'Rc<RefCell<&mut [u8]>>' },
			{ name: 'owner', off: 0x18, t: REF('Pubkey'), doc: '&Pubkey' },
			{ name: 'rent_epoch', off: 0x20, t: S(8) },
			{ name: 'is_signer', off: 0x28, t: S(1) },
			{ name: 'is_writable', off: 0x29, t: S(1) },
			{ name: 'executable', off: 0x2a, t: S(1) },
		],
	},
	{
		name: 'LamportsCell', size: 0x20, doc: 'Rc<RefCell<&mut u64>> box of an AccountInfo: reference counts, RefCell borrow flag, the lamports pointer',
		fields: [
			{ name: 'strong', off: 0x00, t: S(8) },
			{ name: 'weak', off: 0x08, t: S(8) },
			{ name: 'borrow', off: 0x10, t: S(8), doc: 'RefCell flag: 0 free, > 0 shared borrows, -1 mutably borrowed' },
			{ name: 'value', off: 0x18, t: REF('Lamports'), doc: '&mut u64' },
		],
	},
	{ name: 'Lamports', size: 8, doc: 'the lamports of an account (in the input buffer)', fields: [{ name: 'amount', off: 0, t: S(8) }] },
	{
		name: 'DataCell', size: 0x28, doc: 'Rc<RefCell<&mut [u8]>> box of an AccountInfo: reference counts, RefCell borrow flag, the data slice',
		fields: [
			{ name: 'strong', off: 0x00, t: S(8) },
			{ name: 'weak', off: 0x08, t: S(8) },
			{ name: 'borrow', off: 0x10, t: S(8), doc: 'RefCell flag: 0 free, > 0 shared borrows, -1 mutably borrowed' },
			{ name: 'ptr', off: 0x18, t: REF('bytes'), doc: 'data pointer' },
			{ name: 'len', off: 0x20, t: S(8), doc: 'data length' },
		],
	},
	{
		name: 'AccountRecord', doc: 'serialized account in the program input (what a pinocchio AccountInfo points to)',
		fields: [
			{ name: 'dup_marker', off: 0x00, t: S(1), doc: '0xff: not a duplicate of an earlier account (pinocchio reuses this byte as borrow state)' },
			{ name: 'is_signer', off: 0x01, t: S(1) },
			{ name: 'is_writable', off: 0x02, t: S(1) },
			{ name: 'executable', off: 0x03, t: S(1) },
			{ name: 'original_data_len', off: 0x04, t: S(4), doc: 'pinocchio: resize delta' },
			{ name: 'key', off: 0x08, t: EMB('Pubkey') },
			{ name: 'owner', off: 0x28, t: EMB('Pubkey') },
			{ name: 'lamports', off: 0x48, t: S(8) },
			{ name: 'data_len', off: 0x50, t: S(8) },
			{ name: 'data', off: 0x58, t: EMB('bytes') },
		],
	},
	{
		name: 'SolInstruction', size: 0x28, doc: 'C-ABI instruction (sol_invoke_signed_c): program id, account metas, data',
		fields: [
			{ name: 'program_id', off: 0x00, t: REF('Pubkey'), doc: '&Pubkey' },
			{ name: 'accounts', off: 0x08, t: REF('SolAccountMeta') },
			{ name: 'account_len', off: 0x10, t: S(8) },
			{ name: 'data', off: 0x18, t: REF('bytes') },
			{ name: 'data_len', off: 0x20, t: S(8) },
		],
	},
	{
		name: 'SolAccountMeta', size: 0x10, doc: 'C-ABI account meta of a SolInstruction (16 bytes)',
		fields: [
			{ name: 'pubkey', off: 0x00, t: REF('Pubkey'), doc: '&Pubkey' },
			{ name: 'is_writable', off: 0x08, t: S(1) },
			{ name: 'is_signer', off: 0x09, t: S(1) },
		],
	},
	{
		name: 'StableInstruction', size: 0x50, doc: 'solana_program StableInstruction (sol_invoke_signed_rust): account metas and data as StableVec { ptr, cap, len }, the program id in place',
		fields: [
			{ name: 'accounts', off: 0x00, t: REF('AccountMeta') },
			{ name: 'accounts_cap', off: 0x08, t: S(8) },
			{ name: 'accounts_len', off: 0x10, t: S(8) },
			{ name: 'data', off: 0x18, t: REF('bytes') },
			{ name: 'data_cap', off: 0x20, t: S(8) },
			{ name: 'data_len', off: 0x28, t: S(8) },
			{ name: 'program_id', off: 0x30, t: EMB('Pubkey') },
		],
	},
	{
		name: 'AccountMeta', size: 0x22, doc: 'solana_program::instruction::AccountMeta (34 bytes: the key in place, then the flags)',
		fields: [
			{ name: 'pubkey', off: 0x00, t: EMB('Pubkey') },
			{ name: 'is_signer', off: 0x20, t: S(1) },
			{ name: 'is_writable', off: 0x21, t: S(1) },
		],
	},
	{
		name: 'Slice', size: 0x10, doc: '&[u8]: pointer and length (a seed)',
		fields: [
			{ name: 'ptr', off: 0x00, t: REF('bytes') },
			{ name: 'len', off: 0x08, t: S(8) },
		],
	},
	{
		name: 'SeedList', size: 0x10, doc: "&[&[u8]]: one signer's seeds (pointer to Slices, count)",
		fields: [
			{ name: 'ptr', off: 0x00, t: REF('Slice') },
			{ name: 'len', off: 0x08, t: S(8) },
		],
	},
	{
		name: 'U128', size: 0x10, doc: 'u128 / i128 in place (little-endian words)',
		fields: [
			{ name: 'lo', off: 0x00, t: S(8) },
			{ name: 'hi', off: 0x08, t: S(8) },
		],
	},
	{
		name: 'FmtArguments', size: 0x30, doc: 'core::fmt::Arguments { pieces: &[&str], args: &[Argument], fmt: Option<&[Placeholder]> } (fields in this order)',
		fields: [
			{ name: 'pieces', off: 0x00, t: REF('Slice'), doc: '&[&str] (rodata)' },
			{ name: 'pieces_len', off: 0x08, t: S(8) },
			{ name: 'args', off: 0x10, t: REF('FmtArg') },
			{ name: 'args_len', off: 0x18, t: S(8) },
			{ name: 'fmt', off: 0x20, t: REF('bytes'), doc: 'placeholder specs (0: none)' },
			{ name: 'fmt_len', off: 0x28, t: S(8) },
		],
	},
	{
		name: 'FmtArgumentsSpecsFirst', size: 0x30, doc: 'core::fmt::Arguments { pieces: &[&str], fmt: Option<&[Placeholder]>, args: &[Argument] } (fields in this order)',
		fields: [
			{ name: 'pieces', off: 0x00, t: REF('Slice'), doc: '&[&str] (rodata)' },
			{ name: 'pieces_len', off: 0x08, t: S(8) },
			{ name: 'fmt', off: 0x10, t: REF('bytes'), doc: 'placeholder specs (0: none)' },
			{ name: 'fmt_len', off: 0x18, t: S(8) },
			{ name: 'args', off: 0x20, t: REF('FmtArg') },
			{ name: 'args_len', off: 0x28, t: S(8) },
		],
	},
	{
		name: 'FmtArg', size: 0x10, doc: 'core::fmt::rt::Argument: value pointer, formatter function',
		fields: [
			{ name: 'value', off: 0x00, t: REF('bytes') },
			{ name: 'formatter', off: 0x08, t: S(8) },
		],
	},
	...([1, 2, 4, 8] as const).map((n): View => ({
		name: `Tagged${n * 8}`, doc: `enum value returned through an out parameter: its variant tag, a u${n * 8} at offset 0 (the payload after it is not named)`,
		fields: [{ name: 'tag', off: 0, t: S(n) }],
	})),
	{
		name: 'Input', doc: 'program input (entrypoint parameter): account count, then the first serialized account',
		fields: [
			{ name: 'num_accounts', off: 0, t: S(8) },
			{ name: 'acc0', off: 8, t: EMB('AccountRecord') },
		],
	},
]

const hex = (n: number) => '0x' + n.toString(16).padStart(2, '0')
const TS_SCALAR: Record<number, string> = { 1: 'u8', 2: 'u16', 4: 'u32', 8: 'u64' }

export class Views {
	map = new Map<string, View>()
	opaque = new Map<string, { size?: number; doc: string }>(Object.entries(OPAQUE))
	constructor(views: View[] = BUILTIN_VIEWS) { for (const v of views) this.map.set(v.name, v) }
	add(v: View) { this.map.set(v.name, v) }

	/** width of a field in bytes (Infinity: open-ended) */
	width(t: FieldType): number {
		if (t.k === 'scalar') return t.size
		if (t.k === 'ref') return 8
		const o = this.opaque.get(t.type)
		if (o) return o.size ?? Infinity
		const v = this.map.get(t.type)
		return v?.size ?? Infinity
	}

	/** A serialized-account-record view whose data has the given layout: <Name>Record. */
	recordOf(data: string): string {
		const name = data.replace(/Account$/, '') + 'Record'
		if (!this.map.has(name)) {
			const base = this.map.get('AccountRecord')!
			this.map.set(name, { name, doc: `serialized input account whose data is a ${data}`, fields: base.fields.map(f => (f.name === 'data' ? { ...f, t: { k: 'embed', type: data } } : f)) })
		}
		return name
	}

	/** an opaque fixed-size byte range type (Bytes16, ...) */
	bytes(n: number): string {
		const name = n === 32 ? 'Pubkey' : `Bytes${n}`
		if (!this.opaque.has(name)) this.opaque.set(name, { size: n, doc: `${n} bytes in place (value = their address)` })
		return name
	}

	/**
	 * A view of Borsh-serialized fields (an Anchor IDL argument list or account): the fixed-offset
	 * prefix, starting at byte `base`. Nested fixed-size structs get their own views. Returns the view
	 * (undefined when no field has a fixed offset).
	 */
	borshView(name: string, doc: string, fields: { name: string; type: any }[], types: Map<string, any>, base = 0): View | undefined {
		const pre = borshPrefix(fields, types)
		if (!pre.length) return undefined
		const vf: Field[] = pre.map(f => ({ name: f.name, off: base + f.off, t: this.fieldType(f, types), doc: undefined }))
		const v: View = { name, doc, fields: vf }
		const last = pre[pre.length - 1]
		if (pre.length === fields.length) v.size = base + last.off + last.size
		this.map.set(name, v)
		return v
	}

	private fieldType(f: BorshField, types: Map<string, any>): FieldType {
		if (f.kind === 'scalar' && (f.size === 1 || f.size === 2 || f.size === 4 || f.size === 8)) return { k: 'scalar', size: f.size }
		if (f.kind === 'key') return { k: 'embed', type: 'Pubkey' }
		if (f.kind === 'struct' && f.type) {
			const nm = `${f.type}`
			if (this.map.has(nm) || OPAQUE[nm]) return { k: 'embed', type: nm }
			const fs = structFields(f.type, types)
			if (fs && this.borshView(nm, `IDL type ${f.type} (Borsh layout)`, fs, types)?.size === f.size) return { k: 'embed', type: nm }
			this.map.delete(nm)
		}
		if (f.size === 16 && f.kind === 'bytes') { if (!this.opaque.has('u128')) this.opaque.set('u128', { size: 16, doc: '128-bit integer in place (value = its address)' }); return { k: 'embed', type: 'u128' } }
		return { k: 'embed', type: this.bytes(f.size) }
	}

	/** field of view `type` covering byte offset off (the last one with off <= o that still covers it) */
	fieldAt(type: string, off: number): Field | undefined {
		const v = this.map.get(type)
		if (!v) return undefined
		let best: Field | undefined
		for (const f of v.fields) if (f.off <= off && off < f.off + this.width(f.t) * (f.count ?? 1) && (!best || f.off > best.off)) best = f
		return best
	}

	/**
	 * Resolve base type + byte offset: `path` of field names, the remaining byte offset `rest` inside the
	 * last (embedded) field, and what the path denotes: a scalar of `size`, a ref (loaded pointer), or an
	 * embedded object (address).
	 */
	resolve(type: string, off: number): { path: string[]; rest: number; last: FieldType } | undefined {
		const f = this.fieldAt(type, off)
		if (!f) return undefined
		let d = off - f.off
		if (f.count !== undefined && f.t.k === 'embed') {
			// an array element: f[k]
			const w = this.width(f.t), k = Math.floor(d / w)
			d -= k * w
			const inner = d > 0 && this.map.has(f.t.type) ? this.resolve(f.t.type, d) : undefined
			return inner ? { path: [`${f.name}[${k}]`, ...inner.path], rest: inner.rest, last: inner.last } : { path: [`${f.name}[${k}]`], rest: d, last: f.t }
		}
		if (f.t.k === 'embed' && d > 0 && this.map.has(f.t.type)) {
			const inner = this.resolve(f.t.type, d)
			if (inner) return { path: [f.name, ...inner.path], rest: inner.rest, last: inner.last }
		}
		return { path: [f.name], rest: d, last: f.t }
	}

	/** TypeScript declarations of the given views (and the views they mention) */
	render(names: Iterable<string>): string[] {
		const want = new Set<string>()
		const visit = (n: string) => {
			if (want.has(n)) return
			want.add(n)
			for (const f of this.map.get(n)?.fields ?? []) { const t = f.t.k === 'ref' ? f.t.to : f.t.k === 'embed' ? f.t.type : undefined; if (t) visit(t) }
		}
		for (const n of names) visit(n)
		const out: string[] = []
		for (const [n, o] of this.opaque) if (want.has(n)) out.push(`interface ${n} {} // ${o.doc}`)
		for (const v of this.map.values()) {
			if (!want.has(v.name)) continue
			out.push(`interface ${v.name}${v.size ? ` extends sized<${hex(v.size)}>` : ''} { // ${v.doc}`)
			const w = Math.max(...v.fields.map(f => f.name.length))
			for (const f of v.fields) {
				const t = f.t.k === 'scalar' ? TS_SCALAR[f.t.size] : f.t.k === 'ref' ? `ref<${f.t.to}>` : f.t.type
				const doc = [f.count !== undefined ? `[${f.count}]` : '', f.doc ?? ''].filter(Boolean).join(' ')
				out.push(`\t${(f.name + ':').padEnd(w + 1)} at<${hex(f.off)}, ${t}>${doc ? ` // ${doc}` : ''}`)
			}
			out.push('}')
		}
		return out
	}
}

/** The prelude lines defining the view notation. */
export const VIEW_NOTATION = [
	'type at<Offset extends number, T> = T // view field: a T at byte offset Offset of the object (x.f: scalar = its load, ref<U> = the loaded pointer, other = its address)',
	'type ref<T> = T                        // view field holding a pointer (8 bytes) to a T',
	'interface sized<Size extends number> {} // a view of that many bytes: x[k] is the k-th such object from x (at x + k * Size)',
]

/**
 * View type of an expression, given the variables' types: a typed variable, a ref field loaded through
 * a typed object, or an embedded field's address (as the printer resolves them).
 */
export function exprType(V: Views, e: Expr, varType: (id: number) => string | undefined): string | undefined {
	if (e.k === 'var') return varType(e.id)
	const field = (addr: Expr) => {
		let b: Expr = addr, off = 0n
		if (addr.k === 'bin' && addr.op === 'add' && addr.b.k === 'const') { b = addr.a; off = BigInt.asIntN(64, addr.b.v) }
		if (off < 0n || off > 0x10000n) return undefined
		const t = exprType(V, b, varType)
		if (!t) return undefined
		const size = V.map.get(t)?.size
		const rel = size && Number(off) >= size ? Number(off) % size : Number(off)
		return V.resolve(t, rel)
	}
	if (e.k === 'load' && e.size === 8) { const r = field(e.addr); return r && !r.rest && r.last.k === 'ref' ? r.last.to : undefined }
	if (e.k === 'bin' && e.op === 'add' && e.b.k === 'const') { const r = field(e); return r && !r.rest && r.last.k === 'embed' ? r.last.type : undefined }
	return undefined
}

/** Base variable and constant offset of an address expression `v` or `v + c`. */
export function baseOff(e: Expr): { id: number; off: bigint } | undefined {
	if (e.k === 'var') return { id: e.id, off: 0n }
	if (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.b.k === 'const') return { id: e.a.id, off: BigInt.asIntN(64, e.b.v) }
	return undefined
}
