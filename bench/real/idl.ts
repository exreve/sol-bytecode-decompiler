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
	r_a31_staking: {
		address: 'Da8iRYKozKr2XYpuUT7NayMotUGDG4oUqbRtWT3UhdSY',
		ixs: [
			['init_config', 'admin:ws config:w program program_data system_program', [['fee_bps', 'u16'], ['treasury', 'pubkey']]],
			['propose_admin', 'config:w admin:s', [['new_admin', 'pubkey']]],
			['accept_admin', 'config:w new_admin:s'],
			['set_fee', 'config:w admin:s', [['fee_bps', 'u16']]],
			['set_paused', 'config:w admin:s', [['paused', 'bool']]],
			['set_treasury', 'config:w admin:s', [['treasury', 'pubkey']]],
			['create_pool', 'admin:ws config stake_mint reward_mint pool:w stake_vault:w reward_vault:w stats:w token_program system_program', [['reward_rate', 'u64']]],
			['set_reward_rate', 'config admin:s pool:w', [['reward_rate', 'u64']]],
			['open_position', 'payer:ws owner pool position:w system_program'],
			['stake', 'config pool:w position:w owner:s user_stake:w stake_vault:w token_program', [['amount', 'u64']]],
			['unstake', 'config pool:w position:w owner:s stake_mint user_stake:w stake_vault:w treasury_token:w token_program associated_token_program', [['amount', 'u64']]],
			['claim', 'pool:w position:w owner:s user_reward:w reward_vault:w stats:w token_program'],
			['fund_rewards', 'funder:s pool:w funder_token:w reward_vault:w token_program', [['amount', 'u64']]],
			['crank', 'cranker:s pool:w stats:w'],
			['sync_positions', 'pool:w'],
			['close_position', 'owner:ws position:w'],
		],
		accounts: ['Config', 'Pool', 'Position', 'PoolStats'],
		zeroCopy: ['PoolStats'],
		types: {
			Config: [['admin', 'pubkey'], ['pending_admin', 'pubkey'], ['treasury', 'pubkey'], ['fee_bps', 'u16'], ['paused', 'bool'], ['bump', 'u8']],
			Pool: [['stake_mint', 'pubkey'], ['reward_mint', 'pubkey'], ['stake_vault', 'pubkey'], ['reward_vault', 'pubkey'], ['reward_rate', 'u64'], ['total_staked', 'u64'], ['acc_reward_per_share', 'u128'], ['last_update_ts', 'i64'], ['rewards_funded', 'u64'], ['bump', 'u8'], ['stats_bump', 'u8']],
			Position: [['owner', 'pubkey'], ['pool', 'pubkey'], ['amount', 'u64'], ['reward_debt', 'u128'], ['pending', 'u64'], ['bump', 'u8']],
			PoolStats: [['pool', 'pubkey'], ['crank_count', 'u64'], ['last_crank_ts', 'i64'], ['total_claimed', 'u64'], ['head', 'u64'], ['history', { array: ['u64', 16] }]],
			ConfigUpdated: [['admin', 'pubkey'], ['fee_bps', 'u16'], ['treasury', 'pubkey'], ['paused', 'bool']],
			Staked: [['pool', 'pubkey'], ['owner', 'pubkey'], ['amount', 'u64']],
			Unstaked: [['pool', 'pubkey'], ['owner', 'pubkey'], ['amount', 'u64'], ['fee', 'u64']],
			Claimed: [['pool', 'pubkey'], ['owner', 'pubkey'], ['amount', 'u64']],
			RewardsFunded: [['pool', 'pubkey'], ['funder', 'pubkey'], ['amount', 'u64']],
		},
		events: ['ConfigUpdated', 'Staked', 'Unstaked', 'Claimed', 'RewardsFunded'],
		errors: ['FeeTooHigh', 'RateTooHigh', 'Unauthorized', 'NotPendingAdmin', 'InvalidProgramData', 'SameMint', 'InvalidVault', 'InvalidMint', 'InvalidPosition', 'ZeroAmount', 'Paused', 'InsufficientStake', 'PositionNotEmpty', 'MathOverflow'],
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
