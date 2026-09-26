// Writes bench/idl/<prog>.json (Anchor 0.30+ spec) for the Anchor programs of bench/real from the compact specs below,
// written from the sources (accounts: `name[:w][s]` in Accounts struct order; args and fields as IDL types).
// usage: node bench/real/idl.ts
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

type Ty = string | { vec: Ty } | { defined: { name: string } } | { option: Ty } | { array: [Ty, number] }
interface Spec {
	address: string
	ixs: [name: string, accounts: string, args?: [string, Ty][]][]
	accounts: string[]
	types: Record<string, [string, Ty][]>
	zeroCopy?: string[]
	errors?: string[]
	events?: string[]
}

const def = (name: string): Ty => ({ defined: { name } })
const disc = (s: string) => [...createHash('sha256').update(s).digest().subarray(0, 8)]
const accs = (s: string) => s.split(/\s+/).filter(Boolean).map(a => { const [name, f = ''] = a.split(':'); return { name, ...(f.includes('w') ? { writable: true } : {}), ...(f.includes('s') ? { signer: true } : {}) } })

const SPECS: Record<string, Spec> = {
	o_multisig: {
		address: 'msigUdDBsR4zSUYqYEDrc1LcgtmuSDDM7KxpRUXNC6U',
		ixs: [
			['create_multisig', 'multisig:ws', [['owners', { vec: 'pubkey' }], ['threshold', 'u64'], ['nonce', 'u8']]],
			['create_transaction', 'multisig transaction:ws proposer:s', [['pid', 'pubkey'], ['accs', { vec: def('TransactionAccount') }], ['data', 'bytes']]],
			['approve', 'multisig transaction:w owner:s'],
			['set_owners_and_change_threshold', 'multisig:w multisig_signer:s', [['owners', { vec: 'pubkey' }], ['threshold', 'u64']]],
			['set_owners', 'multisig:w multisig_signer:s', [['owners', { vec: 'pubkey' }]]],
			['change_threshold', 'multisig:w multisig_signer:s', [['threshold', 'u64']]],
			['execute_transaction', 'multisig multisig_signer transaction:w'],
		],
		accounts: ['Multisig', 'Transaction'],
		types: {
			Multisig: [['owners', { vec: 'pubkey' }], ['threshold', 'u64'], ['nonce', 'u8'], ['owner_set_seqno', 'u32']],
			Transaction: [['multisig', 'pubkey'], ['program_id', 'pubkey'], ['accounts', { vec: def('TransactionAccount') }], ['data', 'bytes'], ['signers', { vec: 'bool' }], ['did_execute', 'bool'], ['owner_set_seqno', 'u32']],
			TransactionAccount: [['pubkey', 'pubkey'], ['is_signer', 'bool'], ['is_writable', 'bool']],
		},
		errors: ['InvalidOwner', 'InvalidOwnersLen', 'NotEnoughSigners', 'TransactionAlreadySigned', 'Overflow', 'UnableToDelete', 'AlreadyExecuted', 'InvalidThreshold', 'UniqueOwners'],
	},
	o_escrow: {
		address: '3o3jk7aj2aGCGsbChkgeNdHcBmeEmGA7BtpnTXdVSgtr',
		ixs: [
			['make_offer', 'maker:ws token_mint_a token_mint_b maker_token_account_a:w offer:w vault:w associated_token_program token_program system_program', [['id', 'u64'], ['token_a_offered_amount', 'u64'], ['token_b_wanted_amount', 'u64']]],
			['take_offer', 'taker:ws maker:w token_mint_a token_mint_b taker_token_account_a:w taker_token_account_b:w maker_token_account_b:w offer:w vault:w associated_token_program token_program system_program'],
			['refund_offer', 'maker:ws token_mint_a maker_token_account_a:w offer:w vault:w token_program'],
		],
		accounts: ['Offer'],
		types: { Offer: [['id', 'u64'], ['maker', 'pubkey'], ['token_mint_a', 'pubkey'], ['token_mint_b', 'pubkey'], ['token_b_wanted_amount', 'u64'], ['bump', 'u8']] },
		errors: ['CustomError'],
	},
}

function idl(name: string, s: Spec): any {
	return {
		address: s.address,
		metadata: { name, version: '0.1.0', spec: '0.1.0' },
		instructions: s.ixs.map(([n, a, args = []]) => ({ name: n, discriminator: disc(`global:${n}`), accounts: accs(a), args: args.map(([name, type]) => ({ name, type })) })),
		accounts: s.accounts.map(t => ({ name: t, discriminator: disc(`account:${t}`) })),
		...(s.events ? { events: s.events.map(e => ({ name: e, discriminator: disc(`event:${e}`) })) } : {}),
		errors: (s.errors ?? []).map((e, i) => ({ code: 6000 + i, name: e[0].toLowerCase() + e.slice(1) })),
		types: Object.entries(s.types).map(([t, fields]) => ({
			name: t,
			...(s.zeroCopy?.includes(t) ? { serialization: 'bytemuckunsafe', repr: { kind: 'c' } } : {}),
			type: { kind: 'struct', fields: fields.map(([name, type]) => ({ name, type })) },
		})),
	}
}

const json = (x: any) => JSON.stringify(x, null, '\t').replace(/\[\n\t+([^\[\]{}]*?)\n\t+\]/g, (_, b: string) => `[${b.replace(/\n\t+/g, ' ')}]`) + '\n'
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'idl')
for (const [name, s] of Object.entries(SPECS)) {
	writeFileSync(join(out, name + '.json'), json(idl(name, s)))
	console.log(`${name}: ${s.ixs.length} instructions`)
}
