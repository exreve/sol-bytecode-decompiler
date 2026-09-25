// Minimal Solana JSON-RPC client: program binaries and Anchor IDLs. There is no built-in endpoint:
// callers pass one (CLI `--rpc`, or the SOLANA_RPC_URL environment variable).

export const RPC_ENV = 'SOLANA_RPC_URL'

/** RPC URL from an explicit value or the environment; undefined when none is configured. */
export function rpcUrl(explicit?: string): string | undefined {
	return explicit ?? process.env[RPC_ENV] ?? undefined
}

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export function isAddress(s: string): boolean {
	return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)
}

export function b58encode(b: Uint8Array): string {
	let n = 0n
	for (const x of b) n = n * 256n + BigInt(x)
	let s = ''
	while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n }
	for (const x of b) { if (x) break; s = '1' + s }
	return s
}

async function call(rpc: string, method: string, params: unknown[]): Promise<any> {
	for (let attempt = 0; ; attempt++) {
		const r = await fetch(rpc, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) })
		if (r.status === 429 && attempt < 4) { await new Promise(res => setTimeout(res, 1000 * (attempt + 1))); continue }
		if (!r.ok) throw new Error(`RPC ${method}: HTTP ${r.status}`)
		const j: any = await r.json()
		if (j.error) throw new Error(`RPC ${method}: ${j.error.message ?? JSON.stringify(j.error)}`)
		return j.result
	}
}

export interface AccountData { owner: string; data: Uint8Array; executable: boolean }

export async function getAccount(rpc: string, address: string): Promise<AccountData | undefined> {
	const v = (await call(rpc, 'getAccountInfo', [address, { encoding: 'base64' }]))?.value
	if (!v) return undefined
	return { owner: v.owner, executable: v.executable, data: new Uint8Array(Buffer.from(v.data[0], 'base64')) }
}

/**
 * ELF bytes of a deployed program, for every loader: BPFLoader1/2 (account data is the ELF),
 * BPFLoaderUpgradeable (program account -> programdata account, 45-byte header), LoaderV4 (48-byte header).
 */
export async function fetchProgram(rpc: string, programId: string): Promise<Uint8Array> {
	const acc = await getAccount(rpc, programId)
	if (!acc) throw new Error(`account ${programId} not found`)
	let data = acc.data
	if (acc.owner.startsWith('BPFLoaderUpgradeab')) {
		if (data.length < 36) throw new Error(`${programId} is not an upgradeable program account`)
		const pd = await getAccount(rpc, b58encode(data.subarray(4, 36)))
		if (!pd) throw new Error(`programdata account of ${programId} not found`)
		data = pd.data.subarray(45)
	} else if (acc.owner.startsWith('LoaderV4')) {
		data = data.subarray(48)
	} else if (!acc.owner.startsWith('BPFLoader')) {
		throw new Error(`${programId} is owned by ${acc.owner}, not a BPF loader (not a program?)`)
	}
	if (data[0] !== 0x7f || data[1] !== 0x45 || data[2] !== 0x4c || data[3] !== 0x46) throw new Error(`${programId}: account data is not an ELF (closed program?)`)
	// programdata may be zero-padded up to its allocated size: harmless (the ELF uses offsets), and
	// trimming zeros could cut the last section header
	return data
}
