// Anchor IDL support (legacy <= 0.29 and 0.30+ formats): names for instructions, their accounts
// and arguments, account/event discriminators and custom error codes. Optional: pass `--idl file`
// or `--program-id <id>` (fetches the on-chain IDL account) to the CLI.
import { createHash } from 'node:crypto'
import { inflateSync } from 'node:zlib'

export interface IdlInfo {
	name?: string
	instructions: { name: string; disc: bigint; args: string[]; accounts: string[]; argDefs: { name: string; type: any }[] }[]
	errors: Map<number, string>
	discs: Map<bigint, string> // u64 (LE) discriminator -> "ix:x" / "account:X" / "event:X"
	types: Map<string, any>    // defined type name -> { kind: 'struct', fields } | { kind: 'enum', variants } (IDL JSON)
	accounts: { name: string; disc: bigint }[] // account types (data starts with the 8-byte discriminator)
}

const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').toLowerCase()
const pascal = (s: string) => s.split(/[_\s-]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('')
const le8 = (b: Uint8Array | number[]) => Buffer.from(b).readBigUInt64LE(0)
const sha8 = (s: string) => le8(createHash('sha256').update(s).digest())

function typeStr(t: any): string {
	if (typeof t === 'string') return t
	if (!t || typeof t !== 'object') return '?'
	if (t.defined) return typeof t.defined === 'string' ? t.defined : t.defined.name
	if (t.vec) return `Vec<${typeStr(t.vec)}>`
	if (t.option) return `Option<${typeStr(t.option)}>`
	if (t.coption) return `COption<${typeStr(t.coption)}>`
	if (t.array) return `[${typeStr(t.array[0])}; ${t.array[1]}]`
	return JSON.stringify(t)
}

function flattenAccounts(accs: any[], prefix = ''): string[] {
	const out: string[] = []
	for (const a of accs ?? []) {
		if (Array.isArray(a.accounts)) { out.push(...flattenAccounts(a.accounts, `${prefix}${a.name}.`)); continue }
		const w = a.writable ?? a.isMut, s = a.signer ?? a.isSigner, o = a.optional ?? a.isOptional
		const flags = [s ? 'signer' : '', w ? 'mut' : '', o ? 'optional' : '', a.address ? `= ${a.address}` : '', a.pda ? 'pda' : ''].filter(Boolean)
		out.push(`${prefix}${a.name}${flags.length ? ` [${flags.join(', ')}]` : ''}`)
	}
	return out
}

export function parseIdl(json: any): IdlInfo {
	const info: IdlInfo = { name: json.metadata?.name ?? json.name, instructions: [], errors: new Map(), discs: new Map(), types: new Map(), accounts: [] }
	for (const t of json.types ?? []) if (t?.name && t.type) info.types.set(t.name, t.type)
	// legacy IDLs define account structs under `accounts` only
	for (const a of json.accounts ?? []) if (a?.name && a.type && !info.types.has(a.name)) info.types.set(a.name, a.type)
	for (const ix of json.instructions ?? []) {
		const name = snake(ix.name)
		const disc = Array.isArray(ix.discriminator) ? le8(ix.discriminator) : sha8(`global:${name}`)
		info.discs.set(disc, `ix:${name}`)
		info.instructions.push({ name, disc, args: (ix.args ?? []).map((a: any) => `${a.name}: ${typeStr(a.type)}`), accounts: flattenAccounts(ix.accounts), argDefs: (ix.args ?? []).map((a: any) => ({ name: snake(a.name), type: a.type })) })
	}
	for (const a of json.accounts ?? []) {
		const disc = Array.isArray(a.discriminator) ? le8(a.discriminator) : sha8(`account:${pascal(a.name)}`)
		info.discs.set(disc, `account:${pascal(a.name)}`)
		info.accounts.push({ name: a.name, disc })
	}
	for (const e of json.events ?? []) info.discs.set(Array.isArray(e.discriminator) ? le8(e.discriminator) : sha8(`event:${pascal(e.name)}`), `event:${pascal(e.name)}`)
	for (const e of json.errors ?? []) info.errors.set(e.code, e.name)
	return info
}

// ---- Borsh layouts ----
export interface BorshField { name: string; off: number; size: number; kind: 'scalar' | 'key' | 'bytes' | 'struct'; type?: string }

/**
 * Fixed-offset prefix of a Borsh-serialized field list: fields up to the first one whose size depends on
 * the data (Vec, String, Option, enums with data, ...). `struct`: a defined type with a fixed size.
 */
export function borshPrefix(fields: { name: string; type: any }[], types: Map<string, any>): BorshField[] {
	const out: BorshField[] = []
	let off = 0
	for (const f of fields) {
		const z = borshSize(f.type, types, 0)
		if (z === undefined) break
		out.push({ name: snake(f.name), off, size: z, ...kindOf(f.type, types) })
		off += z
	}
	return out
}

const SCALAR_SIZE: Record<string, number> = { bool: 1, u8: 1, i8: 1, u16: 2, i16: 2, u32: 4, i32: 4, f32: 4, u64: 8, i64: 8, f64: 8, u128: 16, i128: 16, publicKey: 32, pubkey: 32 }

function kindOf(t: any, types: Map<string, any>): { kind: BorshField['kind']; type?: string } {
	if (typeof t === 'string') return SCALAR_SIZE[t] === 32 ? { kind: 'key' } : SCALAR_SIZE[t] <= 8 ? { kind: 'scalar' } : { kind: 'bytes' }
	const d = t?.defined === undefined ? undefined : typeof t.defined === 'string' ? t.defined : t.defined.name
	if (d !== undefined) { const def = types.get(d); return def?.kind === 'struct' ? { kind: 'struct', type: d } : { kind: 'scalar' } }
	return { kind: 'bytes' }
}

/** Borsh size of a type when it does not depend on the data (undefined otherwise). */
export function borshSize(t: any, types: Map<string, any>, depth: number): number | undefined {
	if (depth > 8) return undefined
	if (typeof t === 'string') return SCALAR_SIZE[t]
	if (t?.array) { const z = borshSize(t.array[0], types, depth + 1); return z === undefined ? undefined : z * Number(t.array[1]) }
	const d = t?.defined === undefined ? undefined : typeof t.defined === 'string' ? t.defined : t.defined.name
	if (d === undefined) return undefined
	const def = types.get(d)
	if (def?.kind === 'struct' && Array.isArray(def.fields)) {
		let n = 0
		for (const f of def.fields) { const z = borshSize(typeof f === 'object' && 'type' in f ? f.type : f, types, depth + 1); if (z === undefined) return undefined; n += z }
		return n
	}
	// enums: a u8 tag; fixed size only without data
	if (def?.kind === 'enum' && Array.isArray(def.variants) && def.variants.every((v: any) => !v.fields?.length)) return 1
	return undefined
}

/** Fields of a defined struct type (named fields only), for a nested view. */
export function structFields(name: string, types: Map<string, any>): { name: string; type: any }[] | undefined {
	const def = types.get(name)
	if (def?.kind !== 'struct' || !Array.isArray(def.fields) || !def.fields.every((f: any) => typeof f === 'object' && f.name)) return undefined
	return def.fields.map((f: any) => ({ name: f.name, type: f.type }))
}

// ---- fetching the on-chain IDL account ----
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
function b58enc(b: Uint8Array): string {
	let n = 0n
	for (const x of b) n = n * 256n + BigInt(x)
	let s = ''
	while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n }
	for (const x of b) { if (x) break; s = '1' + s }
	return s
}
function b58dec(s: string): Uint8Array {
	let n = 0n
	for (const c of s) n = n * 58n + BigInt(B58.indexOf(c))
	const out: number[] = []
	while (n > 0n) { out.unshift(Number(n & 0xffn)); n >>= 8n }
	for (const c of s) { if (c !== '1') break; out.unshift(0) }
	while (out.length < 32) out.unshift(0)
	return new Uint8Array(out)
}
const P = (1n << 255n) - 19n
const modp = (a: bigint) => ((a % P) + P) % P
function pw(b: bigint, e: bigint) { let r = 1n; b = modp(b); while (e > 0n) { if (e & 1n) r = r * b % P; b = b * b % P; e >>= 1n } return r }
const D = modp(-121665n * pw(121666n, P - 2n))
function onCurve(k: Uint8Array): boolean {
	let y = 0n
	for (let i = 31; i >= 0; i--) y = (y << 8n) | BigInt(k[i])
	y &= (1n << 255n) - 1n
	if (y >= P) return false
	const y2 = y * y % P, x2 = modp(y2 - 1n) * pw(modp(D * y2 + 1n), P - 2n) % P
	return x2 === 0n || pw(x2, (P - 1n) / 2n) === 1n
}
const sha = (...parts: (Uint8Array | string)[]) => { const h = createHash('sha256'); for (const x of parts) h.update(x); return new Uint8Array(h.digest()) }
export function anchorIdlAddress(programId: string): string {
	const pid = b58dec(programId)
	for (let bump = 255; bump >= 0; bump--) {
		const base = sha(new Uint8Array([bump]), pid, 'ProgramDerivedAddress')
		if (!onCurve(base)) return b58enc(sha(base, 'anchor:idl', pid))
	}
	throw new Error('no pda')
}

export async function fetchIdl(programId: string, rpc = process.env.RPC ?? 'https://api.mainnet-beta.solana.com'): Promise<any | undefined> {
	const r = await fetch(rpc, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getAccountInfo', params: [anchorIdlAddress(programId), { encoding: 'base64' }] }) })
	const v = (await r.json() as any).result?.value
	if (!v) return undefined
	const raw = Buffer.from(v.data[0], 'base64')
	return JSON.parse(inflateSync(raw.subarray(44, 44 + raw.readUInt32LE(40))).toString())
}
