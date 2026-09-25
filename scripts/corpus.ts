// Build a corpus of deployed mainnet programs (+ their on-chain Anchor IDLs when present).
// Programs are discovered from instructions in recent blocks.
// usage: node scripts/corpus.ts [targetPrograms=300] [outDir=corpus]
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { b58 } from './fetch-samples.ts'

const ri = process.argv.indexOf('--rpc')
const RPC = ri >= 0 ? process.argv[ri + 1] : ''
if (!RPC) { console.error('pass --rpc <url>'); process.exit(1) }
process.argv.splice(ri, 2) // remaining positional arguments keep their meaning
const target = Number(process.argv[2] ?? 300)
const out = process.argv[3] ?? 'corpus'
mkdirSync(`${out}/idl`, { recursive: true })

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
async function rpc(method: string, params: unknown[], tries = 6): Promise<any> {
	for (let i = 0; i < tries; i++) {
		try {
			const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) })
			if (r.status === 429) { await sleep(2000 * (i + 1)); continue }
			const j: any = await r.json()
			if (j.error) { if (j.error.code === -32007 || j.error.code === -32009) return null; throw new Error(JSON.stringify(j.error)) }
			return j.result
		} catch (e) { if (i === tries - 1) throw e; await sleep(1000 * (i + 1)) }
	}
}

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
export function unb58(s: string): Uint8Array {
	let n = 0n
	for (const c of s) n = n * 58n + BigInt(B58.indexOf(c))
	const bytes: number[] = []
	while (n > 0n) { bytes.unshift(Number(n & 0xffn)); n >>= 8n }
	for (const c of s) { if (c !== '1') break; bytes.unshift(0) }
	return new Uint8Array(bytes)
}

// ---- ed25519 on-curve test (for PDA derivation) ----
const P = (1n << 255n) - 19n
const modp = (a: bigint) => ((a % P) + P) % P
function pow(b: bigint, e: bigint): bigint { let r = 1n; b = modp(b); while (e > 0n) { if (e & 1n) r = r * b % P; b = b * b % P; e >>= 1n } return r }
const D = modp(-121665n * pow(121666n, P - 2n))
export function onCurve(k: Uint8Array): boolean {
	let y = 0n
	for (let i = 31; i >= 0; i--) y = (y << 8n) | BigInt(k[i])
	y &= (1n << 255n) - 1n
	if (y >= P) return false
	const y2 = y * y % P
	const u = modp(y2 - 1n), v = modp(D * y2 + 1n)
	const x2 = u * pow(v, P - 2n) % P
	if (x2 === 0n) return true
	return pow(x2, (P - 1n) / 2n) === 1n
}
const sha = (...parts: (Uint8Array | string)[]) => { const h = createHash('sha256'); for (const p of parts) h.update(p); return new Uint8Array(h.digest()) }
export function findPda(seeds: Uint8Array[], program: Uint8Array): Uint8Array {
	for (let bump = 255; bump >= 0; bump--) {
		const h = sha(...seeds, new Uint8Array([bump]), program, 'ProgramDerivedAddress')
		if (!onCurve(h)) return h
	}
	throw new Error('no pda')
}
export function anchorIdlAddress(programId: string): string {
	const pid = unb58(programId)
	const base = findPda([], pid)
	return b58(sha(base, 'anchor:idl', pid))
}

const NATIVE = /^(11111111111111111111111111111111|ComputeBudget111111111111111111111111111111|Vote111111111111111111111111111111111111111|Stake11111111111111111111111111111111111111|AddressLookupTab1e1111111111111111111111111|BPFLoader|Ed25519SigVerify|KeccakSecp256k|Config1111|Sysvar|NativeLoader|Secp256r1)/

async function main() {
	const have = new Set(readdirSync(out).filter(f => f.endsWith('.so')).map(f => f.slice(0, -3)))
	const seen = new Set<string>(have)
	const queue: string[] = []
	let slot: number = await rpc('getSlot', [])
	slot -= 200
	let blocks = 0
	while (seen.size < target * 3 && blocks < 400) {
		const b = await rpc('getBlock', [slot, { encoding: 'json', maxSupportedTransactionVersion: 1, transactionDetails: 'full', rewards: false }])
		slot -= 37
		if (!b) continue
		blocks++
		for (const tx of b.transactions) {
			const m = tx.transaction.message
			const keys: string[] = [...m.accountKeys, ...(tx.meta?.loadedAddresses?.writable ?? []), ...(tx.meta?.loadedAddresses?.readonly ?? [])]
			const ixs = [...m.instructions, ...(tx.meta?.innerInstructions ?? []).flatMap((x: any) => x.instructions)]
			for (const ix of ixs) {
				const p = keys[ix.programIdIndex]
				if (p && !seen.has(p) && !NATIVE.test(p)) { seen.add(p); queue.push(p) }
			}
		}
		if (blocks % 10 === 0) console.log(`blocks ${blocks}, programs ${seen.size}`)
		if (queue.length >= target) break
	}
	let n = have.size
	for (const pid of queue) {
		if (n >= target) break
		try {
			const acc = await rpc('getAccountInfo', [pid, { encoding: 'base64' }])
			if (!acc?.value?.executable) continue
			let data = Buffer.from(acc.value.data[0], 'base64')
			if (acc.value.owner.startsWith('BPFLoaderUpgradeab')) {
				const pd = await rpc('getAccountInfo', [b58(data.subarray(4, 36)), { encoding: 'base64' }])
				if (!pd?.value) continue
				data = Buffer.from(pd.value.data[0], 'base64').subarray(45)
			} else if (acc.value.owner.startsWith('LoaderV4')) {
				data = data.subarray(48)
			}
			if (data[0] !== 0x7f || data[1] !== 0x45) continue
			writeFileSync(`${out}/${pid}.so`, data)
			n++
			// anchor IDL
			const idl = await rpc('getAccountInfo', [anchorIdlAddress(pid), { encoding: 'base64' }])
			if (idl?.value) {
				const raw = Buffer.from(idl.value.data[0], 'base64')
				const len = raw.readUInt32LE(40)
				try { writeFileSync(`${out}/idl/${pid}.json`, inflateSync(raw.subarray(44, 44 + len))) } catch { /* not zlib */ }
			}
			console.log(`${n} ${pid} ${data.length}${idl?.value ? ' +idl' : ''}`)
		} catch (e) { console.log('skip', pid, String(e).slice(0, 100)) }
	}
}

if (import.meta.main) await main()
