// Download deployed program binaries from Solana mainnet into samples/<name>.so
// usage: node scripts/fetch-samples.ts [name=ProgramId ...]   (no args: default set)
import { writeFileSync, mkdirSync } from 'node:fs'

const ri = process.argv.indexOf('--rpc')
const RPC = ri >= 0 ? process.argv[ri + 1] : ''
if (!RPC) { console.error('pass --rpc <url>'); process.exit(1) }
process.argv.splice(ri, 2) // remaining positional arguments keep their meaning
const DEFAULT: Record<string, string> = {
	memo: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
	ata: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
	token: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
	token22: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
	stake_pool: 'SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy',
	jup: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
	whirlpool: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
}
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
export function b58(b: Uint8Array): string {
	let n = 0n
	for (const x of b) n = n * 256n + BigInt(x)
	let s = ''
	while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n }
	for (const x of b) { if (x) break; s = '1' + s }
	return s
}
async function account(key: string): Promise<{ owner: string; data: Uint8Array }> {
	const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getAccountInfo', params: [key, { encoding: 'base64' }] }) })
	const j: any = await r.json()
	const v = j.result?.value
	if (!v) throw new Error(`account ${key} not found`)
	return { owner: v.owner, data: new Uint8Array(Buffer.from(v.data[0], 'base64')) }
}
export async function programBytes(id: string): Promise<Uint8Array> {
	let { owner, data } = await account(id)
	if (owner.startsWith('BPFLoaderUpgradeab')) data = (await account(b58(data.subarray(4, 36)))).data.subarray(45)
	return data
}
if (import.meta.main) {
	const args = process.argv.slice(2)
	const list = args.length ? Object.fromEntries(args.map(a => a.split('='))) : DEFAULT
	mkdirSync('samples', { recursive: true })
	for (const [name, id] of Object.entries(list)) {
		const b = await programBytes(id)
		writeFileSync(`samples/${name}.so`, b)
		console.log(name, b.length)
	}
}
