// Re-fetch the on-chain members of the compatibility set into compat/bin (see compat/README.md for provenance).
// usage: node compat/fetch.ts [filter]
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fetchProgram } from '../src/rpc.ts'

const MAINNET = 'https://api.mainnet-beta.solana.com'
const ECLIPSE = 'https://mainnetbeta-rpc.eclipse.xyz'
const SONIC = 'https://api.mainnet-alpha.sonic.game'
// [output name, address, rpc]
export const ONCHAIN: [string, string, string][] = [
	['bpf1_tiny_BYVBQ71C', 'BYVBQ71CYArTNbEpDnsPCjcoWkJL9181xvj52kfyFFHg', MAINNET],
	['bpf1_small_8pXDrcpH', '8pXDrcpHJuYk4niJMRTiYv5dVbCZN15xTzFcAnqHTvsx', MAINNET],
	['bpf1_break_BrEAK7zG', 'BrEAK7zGZ6dM71zUDACDqJnekihmwF15noTddWTsknjC', MAINNET],
	['bpf1_tokenv1_TokenSVp5', 'TokenSVp5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o', MAINNET],
	['bpf1_2voXLbiG', '2voXLbiGTiuioc4DtEtWRkz3h4BJ42aBhbqhaNcx8tpD', MAINNET],
	['svm_eclipse_tiny_2r7UuKRa', '2r7UuKRaoh7Y8qgmrn73DbRcYuauqBn7tpBJpfodam92', ECLIPSE],
	['svm_sonic_2sCw3Foz', '2sCw3FozxoNinZV923Q6XNvaMjRsmPSFAKnNYYnWsqD3', SONIC],
]

if (import.meta.main) {
	const filter = process.argv[2]
	for (const [name, addr, rpc] of ONCHAIN) {
		if (filter && !name.includes(filter)) continue
		try {
			const elf = await fetchProgram(rpc, addr)
			writeFileSync(join(import.meta.dirname, 'bin', name + '.so'), elf)
			console.log('fetched', name, elf.length)
		} catch (e) { console.log('FAILED', name, String(e).slice(0, 200)) }
	}
}
