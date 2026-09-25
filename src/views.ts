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

export type FieldType =
	| { k: 'scalar'; size: 1 | 2 | 4 | 8 }
	| { k: 'ref'; to: string }    // 8-byte pointer to a `to`
	| { k: 'embed'; type: string } // a `type` stored in place (value = its address)
export interface Field { name: string; off: number; t: FieldType; doc?: string }
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
			{ name: 'lamports', off: 0x08, t: S(8), doc: 'Rc<RefCell<&mut u64>> (pointer to the Rc box)' },
			{ name: 'data', off: 0x10, t: S(8), doc: 'Rc<RefCell<&mut [u8]>> (pointer to the Rc box)' },
			{ name: 'owner', off: 0x18, t: REF('Pubkey'), doc: '&Pubkey' },
			{ name: 'rent_epoch', off: 0x20, t: S(8) },
			{ name: 'is_signer', off: 0x28, t: S(1) },
			{ name: 'is_writable', off: 0x29, t: S(1) },
			{ name: 'executable', off: 0x2a, t: S(1) },
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
	constructor(views: View[] = BUILTIN_VIEWS) { for (const v of views) this.map.set(v.name, v) }
	add(v: View) { this.map.set(v.name, v) }

	/** width of a field in bytes (Infinity: open-ended) */
	width(t: FieldType): number {
		if (t.k === 'scalar') return t.size
		if (t.k === 'ref') return 8
		const o = OPAQUE[t.type]
		if (o) return o.size ?? Infinity
		const v = this.map.get(t.type)
		return v?.size ?? Infinity
	}

	/** field of view `type` covering byte offset off (the last one with off <= o that still covers it) */
	fieldAt(type: string, off: number): Field | undefined {
		const v = this.map.get(type)
		if (!v) return undefined
		let best: Field | undefined
		for (const f of v.fields) if (f.off <= off && off < f.off + this.width(f.t) && (!best || f.off > best.off)) best = f
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
		const d = off - f.off
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
		for (const [n, o] of Object.entries(OPAQUE)) if (want.has(n)) out.push(`interface ${n} {} // ${o.doc}`)
		for (const v of this.map.values()) {
			if (!want.has(v.name)) continue
			out.push(`interface ${v.name}${v.size ? ` extends sized<${hex(v.size)}>` : ''} { // ${v.doc}`)
			const w = Math.max(...v.fields.map(f => f.name.length))
			for (const f of v.fields) {
				const t = f.t.k === 'scalar' ? TS_SCALAR[f.t.size] : f.t.k === 'ref' ? `ref<${f.t.to}>` : f.t.type
				out.push(`\t${(f.name + ':').padEnd(w + 1)} at<${hex(f.off)}, ${t}>${f.doc ? ` // ${f.doc}` : ''}`)
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

/** Base variable and constant offset of an address expression `v` or `v + c`. */
export function baseOff(e: Expr): { id: number; off: bigint } | undefined {
	if (e.k === 'var') return { id: e.id, off: 0n }
	if (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.b.k === 'const') return { id: e.a.id, off: BigInt.asIntN(64, e.b.v) }
	return undefined
}
