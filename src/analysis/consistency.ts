// Validation consistency (docs/ANALYSIS_SPEC.md): accounts playing the same role in several instructions (the same IDL
// account type, the same data length a native unpack checks, else the same name), the validations each instruction
// applies to its account of that role (owner, type, signer, writable, address / PDA, stored-key relations with the
// other accounts, by their roles), and the instructions missing one most of the others apply while they use the
// account's data (or move value with it).
// DERIVED and OVER-APPROXIMATE like everything in security/.
import type { Result } from '../decompile.ts'
import type { Analysis, IxOut, Loc } from './report.ts'

export interface RoleMember { ix: string; account: string; validations: string[]; uses: string[] }
export interface Inconsistency {
	role: string; ix: string; account: string; validation: string
	appliedIn: { ix: string; account: string; at?: Loc }[] // the other instructions applying it (with where)
	others: number                                         // the other instructions of the role (it could apply in)
	uses: string[]                                         // how this instruction uses the account (why it matters)
	weight: number
}
export interface RoleView { role: string; by: 'type' | 'data_len' | 'name'; members: RoleMember[]; inconsistencies: Inconsistency[] }

const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
const GENERIC = /^account\[\d+\]$|\?$/
// (programs and sysvars: address checks, covered by the CPI / sysvar rules)
const NOT_A_ROLE = /program|^(rent|clock|instructions?(_sysvar)?|sysvar\w*|\w+_sysvar|slot_?hashes|recent_\w+|stake_history|epoch_schedule|fees)$/
const OWNED = '(owner-checked account)'
const ACCT_FIELDS = /^(key|owner|lamports|data_len|is_signer|is_writable|executable)$/
const VALUE = ['TOKEN_TRANSFER', 'LAMPORT_TRANSFER', 'LAMPORT_WRITE', 'MINT', 'BURN', 'ACCOUNT_CLOSE']
/** the validations reported when missing (by weight); signer / address / writable are shown only (see below) */
const WEIGHT: Record<string, number> = { owner: 6, type: 5, relation: 4 }
const kindOf = (v: string) => ['owner', 'type', 'signer', 'writable', 'address'].includes(v) ? v : 'relation'

/** the constant a data-length check compares with (a native unpack: Pack::LEN) */
function dataLen(cond: string): string | undefined {
	const m = /(?:==|!=|>=|<|>|<=) (0x[0-9a-f]+|\d+)\)?$/.exec(cond) ?? /^\(?(0x[0-9a-f]+|\d+) (?:==|!=)/.exec(cond)
	return m && Number(m[1]) >= 16 ? m[1] : undefined
}

export function consistency(a: Analysis, r: Result): RoleView[] {
	const types = r.idl?.types
	const idlAccts = new Set((r.idl?.accounts ?? []).map(x => x.name))
	const layoutOf = new Map<string, NonNullable<ReturnType<NonNullable<Result['acctLayouts']>['get']>>>()
	/** the account's IDL type: its type in the Accounts struct, else the IDL account type named like it */
	const typeOf = (ix: IxOut, name: string): string | undefined => {
		if (!idlAccts.size) return undefined
		if (!layoutOf.has(ix.handler)) { const h = r.funcs.find(x => x.name === ix.handler); layoutOf.set(ix.handler, (h && r.acctLayouts?.get(h.pc)) ?? []) }
		const t = layoutOf.get(ix.handler)!.find(y => y.name === name || snake(y.name) === snake(name))?.t
		const lt = t?.k === 'embed' ? t.type : t?.k === 'ref' && t.to !== 'AccountInfo' ? t.to : undefined
		if (lt && idlAccts.has(lt) && (!types || types.has(lt))) return lt
		return r.idl?.accounts.find(y => snake(y.name) === snake(name))?.name
	}
	const roleOf = (ix: IxOut, name: string): { role: string; by: RoleView['by'] } | undefined => {
		const t = typeOf(ix, name)
		if (t) return { role: t, by: 'type' }
		const len = ix.checks.find(c => c.account === name && c.kinds.includes('data_len') && dataLen(c.cond))
		if (len) return { role: `data_len ${dataLen(len.cond)}`, by: 'data_len' }
		const n = snake(name)
		return GENERIC.test(name) || NOT_A_ROLE.test(n) ? undefined : { role: n, by: 'name' }
	}
	const has = (x: IxOut['accounts'][number], k: string) => !!x.constraints[k] && x.constraints[k].status !== 'not_found'
	// per instruction: account -> role; the counterpart label of an account in a relation
	const roles = new Map<IxOut, Map<string, NonNullable<ReturnType<typeof roleOf>>>>()
	for (const ix of a.ixs) { const m = new Map<string, NonNullable<ReturnType<typeof roleOf>>>(); for (const x of ix.accounts) { const ro = roleOf(ix, x.name); if (ro) m.set(x.name, ro) } roles.set(ix, m) }
	const counter = (ix: IxOut, name: string): string | undefined => {
		const ro = roles.get(ix)!.get(name)
		if (ro) return ro.role
		const x = ix.accounts.find(y => y.name === name)
		return x && has(x, 'owner') ? OWNED : undefined
	}
	const fieldOf = (side: string, acct: string) => side.startsWith(`${acct}.`) && !ACCT_FIELDS.test(side.slice(acct.length + 1)) ? side.slice(acct.length + 1).replace(/^data\b.*/, 'data') : undefined
	const acctOfSide = (ix: IxOut, side: string) => ix.accounts.find(x => side.startsWith(`${x.name}.`))?.name
	/** validations: name -> where */
	const validations = (ix: IxOut, x: IxOut['accounts'][number], by: RoleView['by']): Map<string, Loc | undefined> => {
		const out = new Map<string, Loc | undefined>()
		const c = (k: string) => x.constraints[k]
		if (has(x, 'owner')) out.set('owner', c('owner').at)
		if (by !== 'data_len' && (has(x, 'discriminator') || has(x, 'data_len'))) out.set('type', (c('discriminator') ?? c('data_len')).at)
		if (has(x, 'signer')) out.set('signer', c('signer').at)
		if (has(x, 'writable')) out.set('writable', c('writable').at)
		if (has(x, 'address') || has(x, 'pda')) out.set('address', (c('address') ?? c('pda')).at)
		for (const rel of ix.relations ?? []) {
			if (rel.kind === 'address' || rel.kind === 'compare') continue
			for (const [s, o] of [[rel.a, rel.b], [rel.b, rel.a]]) {
				const f = fieldOf(s, x.name)
				if (f && o.endsWith('.key')) {
					const y = o.slice(0, -4), cr = y !== x.name && counter(ix, y)
					if (cr) out.set(`${f === 'data' ? 'stored key' : f} == ${cr}.key`, rel.at)
				}
				if (s === `${x.name}.key`) {
					const y = acctOfSide(ix, o), f2 = y && fieldOf(o, y), cr = y && y !== x.name && counter(ix, y)
					if (f2 && cr) out.set(`key == ${cr}.${f2 === 'data' ? '(stored key)' : f2}`, rel.at)
				}
			}
		}
		return out
	}
	/** how the instruction uses the account's data / moves value with it */
	const uses = (ix: IxOut, name: string, by: RoleView['by']): string[] => {
		const out = new Set<string>()
		if (by === 'data_len') out.add('data unpacked')
		for (const o of ix.ops) {
			if ((o.sources ?? []).some(s => s.source.startsWith(`${name}.`) && !s.source.endsWith('.key'))) out.add(`data read by ${o.kinds.filter(k => k !== 'CPI')[0] ?? 'CPI'}`)
			if (o.kinds.some(k => VALUE.includes(k)) && (o.target?.startsWith(`${name}.`) || o.cpi?.accounts.some(y => y.text === name))) out.add(`value moved (${o.kinds.filter(k => VALUE.includes(k)).join(', ')})`)
			if (o.target?.startsWith(`${name}.`) && (o.how === '+=' || o.how === '-=')) out.add('data updated (+= / -=)')
		}
		for (const rel of ix.relations ?? []) if (rel.kind !== 'address' && (fieldOf(rel.a, name) || fieldOf(rel.b, name))) { out.add('stored keys compared'); break }
		if (ix.checks.some(c => c.account === name && c.kinds.some(k => k === 'state' || k === 'custom'))) out.add('data checked')
		return [...out]
	}
	function initializes(ix: IxOut, x: IxOut['accounts'][number]) {
		return /^(init|initialize|create)(_|$)/i.test(snake(ix.name)) || has(x, 'zero') || has(x, 'init')
			|| ix.ops.some(o => o.kinds.includes('ACCOUNT_CREATE') && o.cpi?.accounts.some(y => y.text === x.name))
	}
	// members by role
	const byRole = new Map<string, { by: RoleView['by']; members: { ix: IxOut; x: IxOut['accounts'][number]; v: Map<string, Loc | undefined>; uses: string[] }[] }>()
	for (const ix of a.ixs) for (const x of ix.accounts) {
		const ro = roles.get(ix)!.get(x.name)
		if (!ro || initializes(ix, x)) continue
		let g = byRole.get(ro.role)
		if (!g) byRole.set(ro.role, (g = { by: ro.by, members: [] }))
		g.members.push({ ix, x, v: validations(ix, x, ro.by), uses: uses(ix, x.name, ro.by) })
	}
	const out: RoleView[] = []
	for (const [role, g] of byRole) {
		const ixs = new Set(g.members.map(m => m.ix))
		if (ixs.size < 3) continue
		const inc: Inconsistency[] = []
		const all = new Set(g.members.flatMap(m => [...m.v.keys()]))
		for (const m of g.members) {
			if (!m.uses.length) continue
			for (const v of all) {
				if (m.v.has(v)) continue
				const k = kindOf(v)
				// (a relation: only where the instruction has an account of the counterpart's role)
				const cr = k === 'relation' ? /== (.+?)\.[^.]+$/.exec(v)?.[1] : undefined
				// (a relation: where the instruction has an account of the counterpart's role it does not create / initialize)
				const eligible = (ix: IxOut) => !cr || ix.accounts.some(y => y.name !== m.x.name && !initializes(ix, y) && (roles.get(ix)!.get(y.name)?.role === cr || (cr === OWNED && has(y, 'owner') && !roles.get(ix)!.has(y.name))))
				if (!eligible(m.ix)) continue
				// (reported: owner, type and relations; a missing signer / address check is mostly by design (a party that does
				// not sign here, an account bound by a has_one instead of its seeds); Anchor programs: Account<T> /
				// AccountLoader<T> check owner and discriminator themselves (a loader when loaded): a missing one is mostly the analysis')
				if (!(k in WEIGHT) || ((k === 'owner' || k === 'type') && r.anchor)) continue
				const others = [...ixs].filter(ix => ix !== m.ix && eligible(ix))
				const applied = g.members.filter(o => o.ix !== m.ix && o.v.has(v) && others.includes(o.ix))
				const n = new Set(applied.map(o => o.ix)).size
				if (n < 2 || n * 3 < others.length * 2) continue
				const appliedIn = applied.filter((o, i) => applied.findIndex(p => p.ix === o.ix) === i).map(o => ({ ix: o.ix.name, account: o.x.name, at: o.v.get(v) }))
				inc.push({ role, ix: m.ix.name, account: m.x.name, validation: v, appliedIn, others: others.length, uses: m.uses, weight: WEIGHT[k] ?? 1 })
			}
		}
		inc.sort((x, y) => y.weight - x.weight || y.appliedIn.length - x.appliedIn.length)
		out.push({ role, by: g.by, members: g.members.map(m => ({ ix: m.ix.name, account: m.x.name, validations: [...m.v.keys()], uses: m.uses })), inconsistencies: inc })
	}
	return out.sort((x, y) => (y.inconsistencies[0]?.weight ?? 0) - (x.inconsistencies[0]?.weight ?? 0) || y.members.length - x.members.length)
}
