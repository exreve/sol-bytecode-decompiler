// Program analysis, phase 2 (docs/ANALYSIS_SPEC.md): views over the per-instruction facts of report.ts.
//   dominance   which checks dominate each operation (real dominators, across calls), and for the
//               relevant ones that do not, a path reaching the operation without them
//   trust       caller-controlled values (instruction data, account keys, data of accounts whose owner is
//               not verified, remaining accounts) vs values validated by checks (with the checks)
//   sources     where an operation's parameters come from (taint: instruction data as taint.ts marks it
//               `[ix data?]`, account keys, stored account fields, constants)
//   relations   key / field equalities between accounts the checks establish
//   authority   who enables each value movement / authority change (signers, stored authority fields
//               related to them, PDA signatures) and which instructions write those fields
//   findings    a small declarative rule engine over all of the above
// DERIVED and OVER-APPROXIMATE like everything in security/: the decompiled code is the source of truth.
import type { Result } from '../decompile.ts'
import type { OpKind } from './facts.ts'
import type { Analysis, CheckOut, OpOut, IxOut, IxCtx, Loc } from './report.ts'
import { cfgOf, decisionBlock, dominates, bypass, blockPc, callOf, type Cfg } from './flow.ts'
import { dominators } from '../structure.ts'
import { phase3Ix, stateMachine, closeZeroing } from './phase3.ts'
import { auditIx } from './audit.ts'
import { structFields } from '../idl.ts'
import { irOf, posAt, stmtAt, storedAt, defsIn } from './paths.ts'
import { sourceCtx, type Source } from './sources.ts'
import type { Expr } from '../ir.ts'
import { knownIx } from '../cpi.ts'
import { cpiKinds } from './facts.ts'
import { b58, KNOWN_KEYS } from '../semantics.ts'

export interface TrustRow { value: string; trust: 'caller-controlled' | 'validated' | 'partially-validated' | 'runtime'; evidence: string[] }
export interface Relation { a: string; b: string; kind: 'key_eq' | 'field_eq' | 'has_one' | 'address' | 'compare' | 'token'; status: 'found' | 'partial'; at: Loc; negated?: boolean } // token: a token account's mint / owner (token::mint / token::authority)
export interface Enabler { kind: 'signer' | 'stored' | 'pda' | 'none'; what: string; status?: string; writtenBy?: string[] }
export interface AuthorityRow { op: number; kind: string; enabledBy: Enabler[] }
export interface Finding { rule: string; title: string; ix: string; accounts: string[]; path: string[]; evidence: string[]; confidence: 'high' | 'medium' | 'low'; weight: number }

const VALUE: OpKind[] = ['TOKEN_TRANSFER', 'LAMPORT_TRANSFER', 'MINT', 'BURN', 'ACCOUNT_CLOSE', 'OWNER_ASSIGN', 'PROGRAM_UPGRADE']
const isSensitive = (o: OpOut) => o.kinds.some(k => k !== 'PDA_DERIVE')
const isValueOrAuth = (o: OpOut) => o.kinds.some(k => VALUE.includes(k) || k === 'AUTHORITY_WRITE') || (o.kinds.includes('LAMPORT_WRITE') && o.how === '-=')
const GATE = ['signer', 'has_one', 'key', 'address', 'pda', 'custom', 'state', 'raw', 'token_owner', 'associated']
const GUARD_KINDS = ['signer', 'owner', 'key', 'address', 'has_one', 'pda', 'custom', 'discriminator', 'state']

// ---- dominance ----

interface Site { fn: number; b: number; pc: number }

/**
 * Which checks dominate which operations. A check takes effect at its deciding block (its failing side
 * leaves the function), and, when it is on every path of its function (facts.ts `main`), at each call
 * site of that function up the call path (the error propagates). An operation's points are its block and
 * the call sites leading to its function from the handler (one call path: the first found). A check
 * dominates an operation if one of its sites dominates one of the operation's points (in the part of a
 * native dispatcher the instruction's tags reach). Check statuses become: found = dominates every
 * sensitive operation, partial = some; unchanged when the instruction makes none.
 */
export function dominance(r: Result, checks: CheckOut[], ops: OpOut[], ctx: IxCtx) {
	const byPc = fnIndex(r)
	const cfg = (fn: number): Cfg | undefined => { const fo = byPc.get(fn); return fo && cfgOf(fo) }
	const blockOf = (fn: number, pc?: number, ret?: unknown): number | undefined => {
		const g = cfg(fn)
		if (!g) return undefined
		return pc !== undefined ? g.pcBlock.get(pc) : ret ? g.retBlock.get(ret as never) : undefined
	}
	const chainUp = (fn: number, first: Site | undefined): Site[] => {
		const out: Site[] = first ? [first] : []
		for (let x = fn, k = 0; x !== ctx.handler && k < 16; k++) {
			const p = ctx.parents.get(x)
			if (!p) break
			const b = blockOf(p.fn, p.pc, p.ret)
			if (b === undefined) break
			out.push({ fn: p.fn, b, pc: p.pc ?? Infinity })
			x = p.fn
		}
		return out
	}
	// (in a native dispatcher: dominators of the part of its CFG the instruction's tags reach)
	const rMemo = new Map<number, Int32Array>()
	const dom = (fn: number, a: Site, b: Site): boolean => {
		const g = cfg(fn)!
		if (a.b === b.b) return a.pc < b.pc
		if (!ctx.restricted?.has(fn)) return dominates(g, a.b, b.b)
		let idom = rMemo.get(fn)
		if (!idom) {
			const blocks = g.fo.f.blocks, ok = (x: number) => ctx.allowed!(fn, x)
			const order = [...blocks.keys()].filter(x => g.rpo[x] >= 0 && ok(x)).sort((x, y) => g.rpo[x] - g.rpo[y])
			idom = dominators({ blocks: blocks.map((bl, i) => ({ preds: ok(i) ? bl.preds.filter(ok) : [] })) } as never, order, g.rpo)
			rMemo.set(fn, idom)
		}
		if (idom[b.b] < 0) return true // (not reached with these tags)
		let x = b.b
		for (let k = 0; k < 100000; k++) { if (x === a.b) return true; if (x === 0 || idom[x] < 0) return false; x = idom[x] }
		return false
	}
	const siteOf = checks.map(c => {
		const g = cfg(c.fnPc)
		const b = g && decisionBlock(g, c.c, c.at.pc, c.passPc)
		if (b === undefined) return []
		const own: Site = { fn: c.fnPc, b, pc: Infinity }
		return c.main && c.fnPc !== ctx.handler ? chainUp(c.fnPc, own) : [own]
	})
	const pointsOf = ops.map(o => {
		if (o.fnPc === undefined) return []
		const b = blockOf(o.fnPc, o.at.pc, o.ret)
		return chainUp(o.fnPc, b === undefined ? undefined : { fn: o.fnPc, b, pc: o.at.pc ?? Infinity })
	})
	const doms = (ci: number, oi: number) => {
		const ss = siteOf[ci], ps = pointsOf[oi]
		for (let i = 0; i < ss.length; i++) for (let j = 0; j < ps.length; j++) if (ps[j].fn === ss[i].fn && dom(ss[i].fn, ss[i], ps[j])) return true
		return false
	}
	const sens = ops.map((o, i) => i).filter(i => isSensitive(ops[i]) && pointsOf[i].length)
	for (const oi of sens) ops[oi].guards = []
	checks.forEach((c, ci) => {
		if (!siteOf[ci].length || !sens.length) return
		let n = 0
		for (const oi of sens) if (doms(ci, oi)) { n++; ops[oi].guards!.push(ci) }
		c.status = n === sens.length ? 'found' : 'partial'
	})
	// relevant checks that do not dominate a value-moving / authority operation: a path around them
	for (const oi of sens) {
		const o = ops[oi]
		if (!isValueOrAuth(o)) continue
		const accts = opAccounts(o)
		const cand = checks.map((c, ci) => ci).filter(ci => !o.guards!.includes(ci) && checks[ci].kinds.some(k => GUARD_KINDS.includes(k)) && (checks[ci].kinds.includes('signer') || (checks[ci].account && accts.has(checks[ci].account!.replace(/\?$/, ''))))
			// (a check made after the operation on every path, e.g. in the exit code, is not one it could bypass)
			&& !pointsOf[oi].some(p => siteOf[ci].some(s => s.fn === p.fn && s.b !== p.b && dom(s.fn, p, s))))
		for (const ci of cand.slice(0, 3)) {
			for (const s of siteOf[ci]) {
				const p = pointsOf[oi].find(x => x.fn === s.fn)
				if (!p) continue
				const g = cfg(s.fn)!
				const path = bypass(g, s.b, p.b, ctx.allowed ? b => ctx.allowed!(s.fn, b) : undefined)
				if (!path) continue
				const ff = r.facts.get(s.fn)
				const locs: Loc[] = []
				for (const b of path) { const pc = blockPc(g, b); const line = ff?.pcLine.get(pc); if (line !== undefined && (!locs.length || locs[locs.length - 1].line !== line)) locs.push({ fn: ff!.name, line, pc }) }
				const short = locs.length > 6 ? [...locs.slice(0, 3), ...locs.slice(-3)] : locs
				;(o.bypass ??= []).push({ check: ci, path: short })
				break
			}
		}
	}
}

const idx = new WeakMap<Result, Map<number, Result['funcs'][number]>>()
function fnIndex(r: Result) { let m = idx.get(r); if (!m) idx.set(r, (m = new Map(r.funcs.map(f => [f.pc, f])))); return m }

/** the accounts an operation names (target, CPI accounts) */
function opAccounts(o: OpOut): Set<string> {
	const s = new Set<string>()
	if (o.target) s.add(o.target.split('.')[0])
	for (const a of o.cpi?.accounts ?? []) { const m = /^\*?([A-Za-z_]\w*)/.exec(a.text); if (m) s.add(m[1]); if (a.role) s.add(a.role) }
	return s
}

// ---- trust, sources, relations, authority, rules ----

const ACCT_REF = /\b([A-Za-z_]\w*(?:\[\d+\])?)\.(key|owner|lamports|data|[a-z_][a-z0-9_]*(?:\[\d+\.\.\d+\])?)\b/g

export function phase2(a: Analysis, r: Result) {
	const findings: Finding[] = []
	const authFields = new Map<string, string[]>() // stored authority field -> instructions writing it
	for (const s of a.stateWrites) {
		const ixw = s.writes.map(w => w.ix)
		const isAuth = a.ixs.some(ix => ix.ops.some(o => o.target === s.target && o.kinds.includes('AUTHORITY_WRITE')))
		if (isAuth) authFields.set(s.target, [...new Set(ixw)])
	}
	for (const ix of a.ixs) {
		const names = new Set(ix.accounts.map(x => x.name))
		const acctOf = (t: string): string | undefined => { const m = /^\*?([A-Za-z_]\w*(?:\[\d+\])?)/.exec(t); const n = m?.[1]; return n && names.has(n) ? n : undefined }
		// trust
		const trust: TrustRow[] = []
		const ev = (x: IxOut['accounts'][number], ks: string[]) => ks.filter(k => x.constraints[k] && x.constraints[k].status !== 'not_found').map(k => `${k} ${x.constraints[k].status}${x.constraints[k].at ? ` @${x.constraints[k].at!.fn}:${x.constraints[k].at!.line}` : ''}`)
		const st = (x: IxOut['accounts'][number], ks: string[]): TrustRow['trust'] => {
			const ss = ks.map(k => x.constraints[k]?.status).filter(Boolean)
			return ss.includes('found') ? 'validated' : ss.includes('runtime') ? 'runtime' : ss.includes('partial') ? 'partially-validated' : 'caller-controlled'
		}
		for (const x of ix.accounts) {
			trust.push({ value: `${x.name}.key`, trust: st(x, ['address', 'pda', 'key', 'has_one']), evidence: ev(x, ['address', 'pda', 'key', 'has_one']) })
			const dataT = st(x, ['owner'])
			trust.push({ value: `${x.name}.data`, trust: dataT === 'validated' && !x.constraints.discriminator && !x.constraints.initialized && r.anchor ? 'partially-validated' : dataT, evidence: ev(x, ['owner', 'discriminator', 'initialized']) })
		}
		const info = r.instructions.find(i => i.name === ix.name)
		const args = (info?.args ?? []).map(s => s.split(':')[0].trim())
		for (const g of args) trust.push({ value: `ix.${g}`, trust: 'caller-controlled', evidence: ['instruction data'] })
		ix.trust = trust
		const trustOf = (v: string) => trust.find(t => t.value === v)?.trust
		// sources of operation parameters (taint)
		const classify = (text: string): { source: string; trust: string }[] => {
			const out: { source: string; trust: string }[] = []
			if (/\[ix data\?\]/.test(text)) out.push({ source: 'instruction data', trust: 'caller-controlled' })
			for (const g of args) if (new RegExp(`\\b${g}\\b`).test(text)) out.push({ source: `ix.${g}`, trust: 'caller-controlled' })
			for (const m of text.matchAll(ACCT_REF)) {
				const acct = acctOf(m[1])
				if (!acct) continue
				const v = m[2] === 'key' ? `${acct}.key` : `${acct}.data`
				out.push({ source: m[2] === 'key' ? `${acct}.key` : `${acct}.${m[2]}`, trust: trustOf(v) ?? 'caller-controlled' })
			}
			const bare = acctOf(text.trim())
			if (bare && !out.length) out.push({ source: `${bare}.key`, trust: trustOf(`${bare}.key`) ?? 'caller-controlled' })
			return out.filter((x, i) => out.findIndex(y => y.source === x.source) === i)
		}
		// (on the IR where the parameter's expression is known: sources.ts; else by the printed text)
		const S = sourceCtx(r, ix), I = irOf(r)
		// (a CPI whose program id the printed text does not name: the instruction built up the call path (e.g. a library's
		// instruction struct passed to its invoke function): a known program's id, its instruction by the tag)
		for (const o of ix.ops) {
			if (!o.cpi || o.cpi.known || o.fnPc === undefined || o.at.pc === undefined) continue
			const st = stmtAt(I, o.fnPc, o.at.pc), c = st && callOf(st[0])
			const nm = c?.t.k === 'sys' ? c.t.name : ''
			if (!c?.args[0] || !/^sol_invoke_signed_(c|rust)$/.test(nm)) continue
			const w = (k: number): Expr => ({ k: 'load', size: 8, addr: { k: 'bin', op: 'add', a: c.args[0], b: { k: 'const', v: BigInt(k) } } })
			const rust = nm.endsWith('rust')
			const id = rust ? S.bytesAt(o.fnPc, { k: 'bin', op: 'add', a: c.args[0], b: { k: 'const', v: 48n } }, st![1], 32) : S.bytesAt(o.fnPc, w(0), st![1], 32)
			const known = id && (id.every(x => x === 0) ? 'SYSTEM_PROGRAM' : KNOWN_KEYS[b58(id)])
			if (!known) continue
			// (the data pointer: SolInstruction.data, StableInstruction.data.ptr)
			const data = S.bytesAt(o.fnPc, w(24), st![1], 4) ?? S.bytesAt(o.fnPc, w(24), st![1], 1)
			const k = data && knownIx(known, data)
			o.cpi = { ...o.cpi, program: known, known, checked: undefined, ...(k ? { family: k.family, ix: k.ix, accounts: o.cpi.accounts.map((x, i) => ({ ...x, role: x.role ?? k.accounts[i] })) } : {}) }
			if (k) o.kinds = [...new Set([...o.kinds, ...cpiKinds(k.family, k.ix)])]
		}
		// (Anchor CPI helpers: the accounts of the CpiContext not named by the printed text, by the AccountInfo copies' key
		// words (the program's copy first, then the accounts struct's in field order, 0x30 bytes each, after 0x18 bytes))
		if (r.anchor) for (const o of ix.ops) {
			if (!o.cpi?.family || !o.cpi.accounts.some(x => x.text === '?') || o.fnPc === undefined || o.at.pc === undefined) continue
			const st = stmtAt(I, o.fnPc, o.at.pc), c = st && callOf(st[0])
			const Y = c?.args[1] && defsIn(I, o.fnPc)?.fpOff(c.args[1])
			if (Y === undefined || Y === null) continue
			o.cpi.accounts = o.cpi.accounts.map((x, i) => x.text !== '?' ? x : { ...x, text: S.frameAccount(o.fnPc!, Y + 0x18 + 0x30 * (i + 1), st![1]) ?? '?' })
		}
		const trustSrc = (x: Source): string => x.kind === 'ix' || x.kind === 'remaining' ? 'caller-controlled' : x.kind === 'sysvar' || x.kind === 'lamports' || x.kind === 'owner' ? 'runtime'
			: x.kind === 'return-data' ? 'partially-validated' : trustOf(x.kind === 'key' ? `${x.acct}.key` : `${x.acct}.data`) ?? 'caller-controlled'
		for (const o of ix.ops) {
			if (!isSensitive(o)) continue
			const fn = o.fnPc
			const pos = fn === undefined ? undefined : posAt(I, fn, o.at.pc, o.ret)
			const call = fn !== undefined && o.at.pc !== undefined ? stmtAt(I, fn, o.at.pc) : undefined
			const args = call && callOf(call[0])?.args
			const printed = (v: string) => { const ex = fn !== undefined ? r.facts.get(fn)?.expr : undefined; return ex && args?.find(a => ex(a) === v.replace(/ \[ix data\?\]$/, '')) }
			const params: [string, string, Expr | undefined][] = []
			if (o.cpi) {
				const cs = o.cpi.src
				if (!o.cpi.known && o.cpi.program !== '?') params.push(['program', o.cpi.program, cs?.program])
				o.cpi.accounts.forEach((x, i) => params.push([x.role ?? 'account', x.text, cs?.accounts[i]]))
				o.cpi.fields.forEach(([k, v], i) => params.push([k, v, cs?.fields[i] ?? printed(v)]))
				if (o.cpi.seeds) params.push(['signer seeds', o.cpi.seeds, undefined])
			}
			if (o.pda) params.push(['seeds', o.pda.seeds, undefined])
			if (o.value !== undefined && o.target) params.push([o.target, o.value, fn !== undefined && o.at.pc !== undefined ? storedAt(I, fn, o.at.pc)?.[0] : undefined])
			const src: NonNullable<OpOut['sources']> = []
			for (const [p, t, e] of params) {
				// (an account passed to a CPI is named by the account model; its key's flow is the account itself)
				const ir = e && fn !== undefined && pos !== undefined ? S.of(fn, e, pos) : undefined
				if (ir?.length) for (const x of ir) src.push({ param: p, source: x.source, trust: trustSrc(x) })
				else for (const x of classify(t)) src.push({ param: p, ...x })
			}
			const uniq = src.filter((x, i) => src.findIndex(y => y.param === x.param && y.source === x.source) === i)
			if (uniq.length) o.sources = uniq.slice(0, 24)
		}
		// relations: two sides of an equality check, at least one an account key / field
		const rel: Relation[] = []
		for (const c of ix.checks) {
			// (Anchor has_one on account T: T.<f> == f.key, f an account of the instruction and a field of T's type (the
			// error names T, not f): by the bytes compared (c.sides), else the IDL's field names, else (no IDL) each signer)
			if (c.kinds.includes('has_one') && c.account && !c.sides) {
				const fields = idlFields(r, ix.handler, c.account)
				// (names compared snake_cased: IDLs before 0.30 use camelCase; the same account may appear under both)
				const T = snakeName(c.account)
				const byName = new Map<string, IxOut['accounts'][number]>()
				for (const x of ix.accounts) { const k = snakeName(x.name); if (k !== T && (!byName.has(k) || x.constraints.signer)) byName.set(k, x) }
				const cands = fields ? [...byName].filter(([k]) => fields.has(k)).map(([, x]) => x) : ix.accounts.filter(x => x.name !== c.account && x.constraints.signer && x.constraints.signer.status !== 'not_found')
				for (const t of cands) rel.push({ a: fields ? `${c.account}.${t.name}` : hasOneField(c.account, t.name, c.cond, a), b: `${t.name}.key`, kind: 'has_one', status: c.status, at: c.at })
			}
			if (c.kinds.includes('address') && c.account) rel.push({ a: `${c.account}.key`, b: '(constant address)', kind: 'address', status: c.status, at: c.at })
			const sides = c.sides ?? eqSides(c.cond)
			if (!sides) continue
			const norm = (t: string) => {
				for (const m of t.matchAll(ACCT_REF)) { const acct = acctOf(m[1]); if (acct) return `${acct}.${m[2]}` }
				const b = acctOf(t.trim())
				return b ? `${b}.key` : undefined
			}
			const [x, y] = [norm(sides[0]), norm(sides[1])]
			if (!x && !y) continue
			const kind: Relation['kind'] = c.kinds.some(k => k === 'token_mint' || k === 'token_owner') ? 'token' : x?.endsWith('.key') && y?.endsWith('.key') ? 'key_eq' : x && y ? 'field_eq' : 'compare'
			rel.push({ a: x ?? sides[0].slice(0, 60), b: y ?? sides[1].slice(0, 60), kind, status: c.status, at: c.at })
		}
		ix.relations = rel
		// (account data rows only for accounts whose data is checked or read by an operation)
		const dataUsed = new Set(ix.ops.flatMap(o => (o.sources ?? []).filter(x => !x.source.endsWith('.key')).map(x => x.source.split('.')[0])))
		ix.trust = trust.filter(t => !t.value.endsWith('.data') || t.evidence.length || dataUsed.has(t.value.slice(0, -5)))
		// authority: who enables each value movement / authority change
		const signers = ix.accounts.filter(x => x.constraints.signer && x.constraints.signer.status !== 'not_found')
		const auth: AuthorityRow[] = []
		ix.ops.forEach((o, oi) => {
			if (!isValueOrAuth(o)) return
			const en: Enabler[] = []
			for (const s of signers) {
				en.push({ kind: 'signer', what: s.name, status: s.constraints.signer.status })
				for (const x of rel) {
					const other = x.a === `${s.name}.key` ? x.b : x.b === `${s.name}.key` ? x.a : undefined
					// (a token account's owner is not an authority the program stores)
					if (!other || (other.endsWith('.key') && x.kind !== 'has_one') || x.kind === 'token') continue
					const field = x.kind === 'has_one' && other.endsWith('?') ? [...authFields.keys()].find(f => f.endsWith(`.${s.name}`)) ?? other.replace(/\?$/, '') : other
					en.push({ kind: 'stored', what: `${s.name}.key == ${field}`, status: x.status, writtenBy: authFields.get(field) ?? a.stateWrites.find(w => w.target === field)?.writes.map(w => w.ix) })
				}
			}
			if (o.cpi?.seeds || o.kinds.includes('PDA_SIGNATURE')) en.push({ kind: 'pda', what: `PDA signature ${o.cpi?.seeds ?? '(seeds not decoded)'}` })
			if (!en.length) en.push({ kind: 'none', what: 'no signer, stored authority or PDA signature found' })
			auth.push({ op: oi, kind: o.kinds.filter(k => k !== 'CPI').join(', ') || 'CPI', enabledBy: en })
		})
		ix.authority = auth
	}
	// phase 3 views (after every instruction's authority rows: the chains follow the writers), then the rules
	for (const ix of a.ixs) { phase3Ix(r, ix, a); ix.audit = auditIx(r, ix) }
	a.states = stateMachine(a)
	a.authorityFields = [...authFields].map(([field, writtenBy]) => ({ field, writtenBy }))
	for (const ix of a.ixs) {
		findings.push(...rules(ix, a))
	}
	const rank = { high: 3, medium: 2, low: 1 }
	findings.sort((x, y) => rank[y.confidence] * 10 + y.weight - (rank[x.confidence] * 10 + x.weight) || x.ix.localeCompare(y.ix))
	a.findings = findings
}

/**
 * A CPI to a well-known program (system, token) the program does not sign for: the callee requires the
 * signature of the account it debits / reassigns itself (the runtime enforces it).
 */
const SYSVAR_NAME = /^(clock|rent|instructions?|ix_sysvar|instructions?_sysvar|sysvar_\w+|\w+_sysvar|slot_?hashes|recent_(block|slot)hashes|stake_history|epoch_schedule|epoch_rewards|fees|last_restart_slot)$/
/** an account's key compared with a constant (an address check) */
const addressChecked = (ix: IxOut, a: string) => found(ix, a, 'address') || ix.checks.some(c => c.account === a && c.kinds.includes('address'))
const found = (ix: IxOut, a: string, k: string) => { const c = ix.accounts.find(x => x.name === a)?.constraints[k]; return !!c && (c.status === 'found' || c.status === 'partial') }
const runtimeAuthorized = (o: OpOut) => !!o.cpi && !!(o.cpi.known || o.cpi.family) && !o.cpi.seeds && !o.kinds.includes('PDA_SIGNATURE')

/** the system CPIs creating an account (create_account, or transfer + allocate + assign of a funded one) in an instruction that creates one */
const initMechanics = (ix: IxOut, o: OpOut) => o.cpi?.family === 'system' && /^(CreateAccount|Assign|Allocate|Transfer)$/.test(o.cpi.ix ?? '') && ix.ops.some(x => x.kinds.includes('ACCOUNT_CREATE') || (x.cpi?.family === 'system' && x.cpi.ix === 'Allocate'))

/**
 * Initialization: a write to an account the instruction creates (no discriminator / type check on it), or one the
 * program requires to be uninitialized (Anchor `zero`: its discriminator must be zero).
 */
const initWrite = (ix: IxOut, o: OpOut) => {
	const t = !o.cpi && o.target ? ix.accounts.find(x => x.name === o.target!.split('.')[0]) : undefined
	if (!t) return false
	const z = t.constraints.zero
	return (!!z && z.status !== 'not_found') || (ix.ops.some(x => x.kinds.includes('ACCOUNT_CREATE')) && (!t.constraints.discriminator || t.constraints.discriminator.status === 'not_found'))
}

/** an operation enabled by a stored authority the signer is bound to, or a PDA signature (authority rows) */
const authorized = (ix: IxOut, oi: number) => (ix.authority ?? []).some(r => r.op === oi && r.enabledBy.some(e => e.kind === 'stored' || e.kind === 'pda'))

/** a source that is the key of an account the instruction checks to be a signer */
const signerKey = (ix: IxOut, src: string) => { const m = /^(.+)\.key$/.exec(src); const c = m && ix.accounts.find(x => x.name === m[1])?.constraints.signer; return !!c && c.status !== 'not_found' }

const snakeName = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()

/** the fields of an account's IDL type (its type in the Accounts struct's layout, else any account type's; undefined without an IDL) */
function idlFields(r: Result, handler: string, acct: string): Set<string> | undefined {
	const idl = r.idl
	if (!idl?.accounts?.length) return undefined
	const h = r.funcs.find(x => x.name === handler)
	const t = h && r.acctLayouts?.get(h.pc)?.find(x => x.name === acct)?.t
	const ty = t?.k === 'embed' ? t.type : t?.k === 'ref' && t.to !== 'AccountInfo' ? t.to : undefined
	const types = ty && idl.accounts.some(x => x.name === ty) ? [ty] : idl.accounts.map(x => x.name)
	const out = new Set<string>()
	for (const x of types) for (const f of structFields(x, idl.types) ?? []) out.add(snakeName(f.name))
	return out
}

/**
 * The stored field an Anchor has_one on account T compares with signer S's key: a field of T the condition
 * reads, else a stored field of T named after S (state writes / authority fields), else `T.S?` (guessed).
 */
function hasOneField(t: string, s: string, cond: string, a: Analysis): string {
	const m = new RegExp(`\\b${t}\\.([a-z_][a-z0-9_]*)\\b`).exec(cond)
	if (m && !/^(key|owner|lamports|data|is_signer|is_writable)$/.test(m[1])) return `${t}.${m[1]}`
	const known = a.stateWrites.map(w => w.target).find(f => f === `${t}.${s}` || (f.startsWith(`${t}.`) && f.endsWith(`_${s}`)))
	return known ?? `${t}.${s}?`
}

/** the two sides of an (in)equality condition: a == b, a != b, memeq/keyeq/memcmp(a, b, 0x20) */
function eqSides(cond: string): [string, string] | undefined {
	const c = cond.replace(/^!+\(?/, '').replace(/\)$/, '')
	const m = /^(?:\(\s*)?(?:memeq|keyeq|memcmp)\(([^,]+), ([^,]+?)(?:, 0x20)?\)(?: as u32\))?(?: [!=]= 0)?$/.exec(c)
	if (m) return [m[1], m[2]]
	const e = /^([^&|=!<>]+?) [!=]= ([^&|=!<>]+)$/.exec(cond)
	if (e && !/^\d+$|^0x[0-9a-f]+$/.test(e[2].trim())) return [e[1], e[2]]
	return undefined
}

// ---- rules ----

interface Rule { id: string; title: string; run: (ix: IxOut, a: Analysis) => Omit<Finding, 'rule' | 'title' | 'ix'>[] }
const W: Partial<Record<OpKind, number>> = { TOKEN_TRANSFER: 5, LAMPORT_TRANSFER: 5, MINT: 5, PROGRAM_UPGRADE: 6, AUTHORITY_WRITE: 4, ACCOUNT_CLOSE: 4, OWNER_ASSIGN: 4, LAMPORT_WRITE: 4, BURN: 3, CPI: 1 }
const wOf = (o: OpOut) => Math.max(0, ...o.kinds.map(k => W[k] ?? 0))
const L = (at: Loc) => `${at.fn}:${at.line}`

/** value movements / authority changes a signer enables with no stored authority related to it (and no PDA signature) */
const signerUnrelated = (ix: IxOut): Omit<Finding, 'rule' | 'title' | 'ix'>[] => (ix.authority ?? []).flatMap(row => {
	const o = ix.ops[row.op]
	const hasSigner = row.enabledBy.some(e => e.kind === 'signer'), stored = row.enabledBy.some(e => e.kind === 'stored' || e.kind === 'pda')
	if (!hasSigner || stored || o.cpi?.seeds || initMechanics(ix, o)) return []
	// (Anchor's close constraint on an account bound by has_one: the rent goes to the target its stored data names, e.g. a
	// permissionless trade closing the maker's escrow to the maker)
	const closed = o.anchorClose && o.target ? o.target.split('.')[0] + '.' : undefined
	if (closed && (ix.relations ?? []).some(x => (x.kind === 'has_one' || x.kind === 'field_eq') && ((x.a.startsWith(closed) && x.b.endsWith('.key')) || (x.b.startsWith(closed) && x.a.endsWith('.key'))))) return []
	if (initWrite(ix, o)) return []
	// (a CPI passing the signer on: the callee checks it against its own state, e.g. a token account's owner)
	// (or through a library helper, its accounts not decoded: the callee checks the authority's signature too)
	if (((o.cpi?.known || o.cpi?.family) && (o.cpi.accounts.some(x => x.s) || !o.cpi.accounts.length)) || runtimeAuthorized(o)) return []
	return [{ accounts: row.enabledBy.filter(e => e.kind === 'signer').map(e => e.what), path: [L(o.at)], evidence: [o.text.slice(0, 140), 'signers: ' + row.enabledBy.filter(e => e.kind === 'signer').map(e => `${e.what} (${e.status})`).join(', ')], confidence: 'low' as const, weight: wOf(o) }]
})

const RULES: Rule[] = [
	{
		id: 'cpi-unchecked-program', title: 'CPI to an account-supplied program id with no dominating check against a known id',
		run: ix => ix.ops.filter(o => o.cpi && !o.cpi.known && o.cpi.program !== '?' && !/\(id compared with/.test(o.cpi.checked ?? '')).flatMap(o => {
			// (the program account not identified, e.g. an instruction built by a library builder: a key compared with a constant)
			const unid = !o.cpi!.accounts.length && /^[A-Z_0-9|]+$/.test(o.cpi!.program)
			const g = (o.guards ?? []).map(i => ix.checks[i]).filter(c => c.kinds.some(k => k === 'address' || k === 'executable' || k === 'key') && ((!c.account && !c.kinds.includes('initialized')) || /program/.test(c.account ?? '') || (!!c.account && o.cpi!.program.includes(c.account.replace(/\?$/, ''))) || (unid && c.kinds.includes('address'))))
			if (g.length) return []
			const progAcct = ix.accounts.find(x => /program/.test(x.name) && ['address', 'executable'].some(k => x.constraints[k] && x.constraints[k].status !== 'not_found'))
			// (the program signs it (PDA): whatever program the caller passes gets the PDA's authority)
			const pda = !!o.cpi!.seeds || o.kinds.includes('PDA_SIGNATURE')
			return [{ accounts: [o.cpi!.program], path: [L(o.at)], evidence: [`${o.text.slice(0, 140)}`, progAcct ? `a program account (${progAcct.name}) is checked, but no check dominating this CPI compares its id` : 'no address / executable check on a program account found', ...(pda ? ['PDA-signed: the program lends its PDA signature to the account-supplied program'] : [])], confidence: pda ? 'high' as const : progAcct ? 'low' as const : 'medium' as const, weight: wOf(o) + (pda ? 4 : 2) }]
		}),
	},
	{
		id: 'value-move-no-signer', title: 'Value movement or authority change with no signer check and no PDA signature',
		run: ix => {
			const signers = ix.accounts.some(x => x.constraints.signer && x.constraints.signer.status !== 'not_found') || ix.checks.some(c => c.kinds.includes('signer'))
			if (signers) return []
			// (the program signing for the move authorizes nobody in particular: low)
			// (Anchor's close constraint sends the lamports to its target: a cleanup anyone may run, unless the target is the caller's)
			return ix.ops.filter(o => isValueOrAuth(o) && !runtimeAuthorized(o) && !initMechanics(ix, o) && !o.anchorClose).slice(0, 3).map(o => {
				const pda = !!o.cpi?.seeds || o.kinds.includes('PDA_SIGNATURE')
				return { accounts: [...opAccounts(o)], path: [L(o.at)], evidence: [o.text.slice(0, 140), ...(pda ? ['the program signs it (PDA); no caller signature is required'] : [])], confidence: pda ? 'low' as const : 'medium' as const, weight: wOf(o) }
			})
		},
	},
	{
		id: 'signer-not-related-to-authority', title: 'Value movement or authority change with a signer but no relation between the signer key and a stored authority field',
		run: (ix, a) => {
			const out = signerUnrelated(ix)
			if (out.length) return out
			// (Anchor's has_one convention: an authority field another instruction stores, named like a signer of this one, with
			// no relation between the two here; e.g. a PDA-signed outflow from a per-user account whose owner is not checked)
			const signers = new Set(ix.accounts.filter(x => x.constraints.signer && x.constraints.signer.status !== 'not_found').map(x => x.name))
			// (not a movement of the signer's own funds: a CPI the signer signs, e.g. a deposit)
			const own = (o: OpOut) => !!o.cpi?.accounts.some(x => x.s && signers.has(/^\*?([A-Za-z_]\w*)/.exec(x.text)?.[1] ?? ''))
			const row = (ix.authority ?? []).find(x => !initMechanics(ix, ix.ops[x.op]) && !initWrite(ix, ix.ops[x.op]) && !own(ix.ops[x.op]))
			if (!a.program.anchor || !row) return []
			return (a.authorityFields ?? []).flatMap(({ field, writtenBy }) => {
				const [acct, f] = [field.slice(0, field.indexOf('.')), field.slice(field.indexOf('.') + 1)]
				if (!signers.has(f) || writtenBy.includes(ix.name) || !ix.accounts.some(x => x.name === acct)) return []
				if ((ix.relations ?? []).some(x => x.a === field || x.b === field || ((x.a === `${f}.key` || x.b === `${f}.key`) && (x.a.startsWith(`${acct}.`) || x.b.startsWith(`${acct}.`))))) return []
				const o = ix.ops[row.op]
				return [{ accounts: [f, acct], path: [L(o.at)], evidence: [o.text.slice(0, 140), `${field} (the stored authority ${writtenBy.join(', ')} writes) is not compared with the signer ${f}`], confidence: 'low' as const, weight: wOf(o) }]
			}).slice(0, 1)
		},
	},
	{
		id: 'check-bypassable', title: 'A signer / owner / key check exists but does not dominate a value movement or authority change',
		// (Anchor: a branch raising no error (e.g. the exit's `owner == program_id && !is_closed` before serializing back) is control flow)
		run: (ix, a) => ix.ops.filter(o => !runtimeAuthorized(o) && !initMechanics(ix, o)).flatMap(o => (o.bypass ?? []).filter(b => !(a.program.anchor && ix.checks[b.check].error === 'return')).map(b => {
			const c = ix.checks[b.check]
			return { accounts: c.account ? [c.account] : [], path: b.path.map(L), evidence: [`check ${L(c.at)} (${c.kinds.join(', ')}): fails if ${c.cond.slice(0, 80)}`, `operation ${L(o.at)}: ${o.text.slice(0, 100)}`], confidence: 'medium' as const, weight: wOf(o) + 1 }
		})),
	},
	{
		id: 'token-mint-unrelated', title: 'Token transfer (unchecked Transfer) whose destination mint is not related to the source / state mint',
		run: ix => ix.ops.filter(o => o.kinds.includes('TOKEN_TRANSFER') && o.cpi?.ix === 'Transfer').flatMap(o => {
			const dest = o.cpi!.accounts.find(x => x.role === 'destination')
			const d = dest && /^\*?([A-Za-z_]\w*)/.exec(dest.text)?.[1]
			if (!d || !ix.accounts.some(x => x.name === d)) return []
			const row = ix.accounts.find(x => x.name === d)
			const related = row && (row.constraints.token_mint || row.constraints.associated) || (ix.relations ?? []).some(x => (x.a.startsWith(`${d}.`) || x.b.startsWith(`${d}.`)) && /mint/.test(x.a + x.b))
			return related ? [] : [{ accounts: [d], path: [L(o.at)], evidence: [o.text.slice(0, 140), `no token::mint constraint / mint relation found for ${d}`], confidence: 'low' as const, weight: wOf(o) }]
		}),
	},
	{
		id: 'caller-controlled-sensitive-param', title: 'Caller-controlled value reaches a CPI program id, PDA seeds or an authority assignment',
		// (an authority set to the key of an account that signed, or while initializing: the usual assignments)
		run: ix => ix.ops.flatMap((o, oi) => (o.sources ?? []).filter(s => s.trust === 'caller-controlled' && (s.param === 'program' || (o.kinds.includes('AUTHORITY_WRITE') && o.target && s.param === o.target && !authorized(ix, oi) && !signerKey(ix, s.source) && !initWrite(ix, o)))).slice(0, 2).map(s => ({
			accounts: [s.source], path: [L(o.at)], evidence: [`${s.param} ← ${s.source} (${s.trust})`, o.text.slice(0, 120)], confidence: 'low' as const, weight: wOf(o),
		}))),
	},
	{
		id: 'unverified-account-data', title: 'Operation parameter read from the data of an account whose owner is not verified',
		run: ix => {
			const out = ix.ops.flatMap(o => (o.sources ?? []).filter(s => !/\.key$/.test(s.source) && s.source !== 'instruction data' && !s.source.startsWith('ix.') && s.trust === 'caller-controlled' && isValueOrAuth(o)).slice(0, 1).map(s => ({
				accounts: [s.source.split('.')[0]], path: [L(o.at)], evidence: [`${s.param} ← ${s.source}: the account's owner is not verified (no check found)`, o.text.slice(0, 120)], confidence: 'low' as const, weight: wOf(o),
			})))
			if (out.length) return out
			// (a check deciding a value move compares the data of an account whose owner the program does not check:
			// an account of another owner with chosen data passes it)
			const checked = (a: string) => { const c = ix.accounts.find(x => x.name === a)?.constraints.owner; return !!c && (c.status === 'found' || c.status === 'partial') }
			for (const o of ix.ops) {
				if (!isValueOrAuth(o) || runtimeAuthorized(o)) continue
				for (const ci of o.guards ?? []) {
					const c = ix.checks[ci]
					const a = (c.sides ?? []).map(s => /^([A-Za-z_]\w*(?:\[\d+\])?)\.data\b/.exec(s)?.[1]).find(x => x && !checked(x))
					if (a) return [{ accounts: [a], path: [L(c.at), L(o.at)], evidence: [`check ${L(c.at)} reads ${a}'s data (${c.sides!.join(' == ')}); ${a}'s owner is not checked`, o.text.slice(0, 120)], confidence: 'low' as const, weight: wOf(o) }]
				}
			}
			return []
		},
	},
	// ---- audit pattern rules (audit.ts facts) ----
	{
		id: 'sysvar-account-unchecked', title: 'Sysvar data (Clock / Rent / Instructions / …) read from an account whose key is not checked against the sysvar id',
		run: ix => (ix.audit?.dataReads ?? []).filter(a => SYSVAR_NAME.test(a) && !addressChecked(ix, a)).map(a => ({
			accounts: [a], path: [], evidence: [`the logic borrows ${a}'s data and reads it as a sysvar`, `no check of ${a}'s key against the sysvar id found: any account with chosen data passes (Sysvar<T> / from_account_info / get() check or avoid it)`], confidence: 'medium' as const, weight: 4,
		})),
	},
	{
		id: 'pda-bump-from-ix', title: 'PDA address from create_program_address with a bump taken from instruction data (not the canonical bump)',
		run: ix => (ix.audit?.bumps ?? []).map(b => { const o = ix.ops[b.op]; return { accounts: [], path: [L(o.at)], evidence: [o.text.slice(0, 140), `bump seed ← ${b.source}: the caller picks among several valid addresses (use find_program_address or a stored canonical bump)`], confidence: 'medium' as const, weight: 3 } }),
	},
	{
		id: 'duplicate-mutable-accounts', title: 'Two writable accounts of one type with no key comparison between them (the same account passed twice)',
		// (Anchor: try_accounts deserializes one account type several times; the instruction writes account data; no check compares two account keys)
		run: ix => {
			const t = ix.audit?.sameType
			if (!t || ix.checks.some(c => c.keyCmp)) return []
			const w = ix.accounts.filter(x => x.expected.writable).map(x => x.name)
			// (data of that type written: an account it names, or an object named after the type)
			// (type not known: an object the instruction's accounts do not name, named after its type)
			const mine = (o: OpOut) => { const a = o.target?.split('.')[0]; return o.kinds.includes('ACCOUNT_DATA_WRITE') && !!a && (t.accts.includes(a) || (t.type ? a === t.type.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase() : !ix.accounts.some(x => x.name === a))) }
			const o = ix.ops.find(o => mine(o) && o.how !== '=')
			const any = o ?? ix.ops.find(mine)
			if (w.length < 2 || !any || !t.accts.every(a => w.includes(a))) return []
			return [{ accounts: w, path: [L(any.at)], evidence: [`${t.n} accounts deserialized by ${t.fn} (one type), ${w.length} writable (${w.join(', ')})`, 'no comparison of two account keys found: passing one account twice makes both views of it, the last one written back wins (e.g. a debit undone by the credit)'], confidence: o ? 'medium' as const : 'low' as const, weight: 4 }]
		},
	},
	{
		id: 'account-type-unchecked', title: 'Account data trusted in an authorization / value decision without a discriminator (type) check',
		// (Anchor: data the logic reads itself from an account try_accounts did not deserialize as Account<T> (no discriminator check))
		// (the owner verified, the type not: the program's other accounts of the same layout pass; an owner not verified
		// at all is unverified-account-data's)
		run: ix => {
			if (!ix.ops.some(o => isValueOrAuth(o) && !runtimeAuthorized(o))) return []
			const own = (a: string) => found(ix, a, 'owner') || !!ix.audit?.ownerCmp?.includes(a)
			return (ix.audit?.dataReads ?? []).filter(a => !SYSVAR_NAME.test(a) && !addressChecked(ix, a) && !found(ix, a, 'discriminator') && own(a)).slice(0, 2).map(a => ({
				accounts: [a], path: [], evidence: [`the logic reads ${a}'s data itself; its owner is checked, no discriminator check on it found`, 'another account type of the same program with a matching layout passes the checks made on this data'], confidence: 'medium' as const, weight: 3,
			}))
		},
	},
	{
		id: 'cpi-result-ignored', title: 'CPI whose result (the Result invoke / the CPI helper returns) is never tested',
		run: ix => (ix.audit?.ignored ?? []).map(i => { const o = ix.ops[i]; return { accounts: o.cpi ? [o.cpi.program] : [], path: [L(o.at)], evidence: [o.text.slice(0, 140), 'no statement after the call reads its Result: an error returned before the CPI runs (e.g. a borrow failure) passes silently'], confidence: 'medium' as const, weight: wOf(o) + 1 } }),
	},
	{
		id: 'truncating-cast', title: 'Amount / balance narrowed (truncating cast) on a value path',
		run: ix => (ix.audit?.casts ?? []).map(c => { const o = ix.ops[c.op]; return { accounts: [], path: [L(o.at)], evidence: [c.expr, `a value from ${c.source} is cast to ${c.bits} bits before this operation: larger values wrap`], confidence: /^ix\.|instruction data/.test(c.source) ? 'medium' as const : 'low' as const, weight: 3 } }),
	},
	{
		id: 'remaining-account-unchecked', title: 'Remaining account used as a destination / authority with no key or owner check',
		run: ix => {
			const ok = new Set(ix.audit?.remChecked ?? [])
			const out: Omit<Finding, 'rule' | 'title' | 'ix'>[] = []
			for (const o of ix.ops) {
				const rs = [...new Set([...(o.target && /^remaining_accounts\[\d+\]\./.test(o.target) && (o.how === '+=' || o.kinds.some(k => k !== 'LAMPORT_WRITE')) ? [o.target.split('.')[0]] : []),
					...(o.cpi?.accounts ?? []).filter(x => x.role && /^(destination|to|authority|owner|account)$/.test(x.role) && /remaining_accounts\[\d+\]/.test(x.text)).map(x => /remaining_accounts\[\d+\]/.exec(x.text)![0])])].filter(a => !ok.has(a))
				for (const a of rs) out.push({ accounts: [a], path: [L(o.at)], evidence: [o.text.slice(0, 140), `${a} (ctx.remaining_accounts) receives value / authority; no check of its key or owner found`], confidence: 'medium' as const, weight: wOf(o) })
			}
			return out.slice(0, 2)
		},
	},
	{
		id: 'init-if-needed-reinit', title: 'Authority / state field of an init_if_needed account overwritten with no initialized check (reinitialization)',
		run: ix => (ix.audit?.reinit ?? []).slice(0, 1).map(x => { const o = ix.ops[x.op]; return { accounts: [x.acct], path: [L(o.at)], evidence: [o.text.slice(0, 140), `${x.acct} may exist already (init_if_needed: its owner check on the existing account's path); no condition on the way reads its state: a second call overwrites ${o.target}`], confidence: 'medium' as const, weight: 5 } }),
	},
	// ---- phase 3 pattern rules (phase3.ts facts) ----
	{
		id: 'state-write-ungated', title: 'Instruction writes program state with no signer check and no constraint gating the write',
		run: ix => {
			if (ix.accounts.some(x => x.constraints.signer && x.constraints.signer.status !== 'not_found') || ix.checks.some(c => c.kinds.includes('signer'))) return []
			// (no signer anywhere: a key binding (has_one, token owner) to an account nobody signs for gates nothing)
			const gate = GATE.filter(k => !['has_one', 'key', 'token_owner', 'associated'].includes(k))
			const ws = ix.ops.filter(o => (o.kinds.includes('ACCOUNT_DATA_WRITE') || o.kinds.includes('AUTHORITY_WRITE')) && o.target && !(o.guards ?? []).some(i => ix.checks[i].kinds.some(k => gate.includes(k))))
			if (!ws.length) return []
			const tg = [...new Set(ws.map(o => o.target!))]
			const anyGuard = ws.some(o => (o.guards ?? []).length)
			return [{ accounts: [...new Set(tg.map(t => t.split('.')[0]))], path: [L(ws[0].at)], evidence: [`writes ${tg.slice(0, 4).join(', ')}${tg.length > 4 ? ', …' : ''}`, anyGuard ? 'only type / owner / size checks dominate the writes' : 'no dominating check found'], confidence: ws.some(o => o.kinds.includes('AUTHORITY_WRITE')) || !anyGuard ? 'medium' as const : 'low' as const, weight: Math.max(...ws.map(wOf), 2) }]
		},
	},
	{
		id: 'share-price-zero-supply', title: 'Division by a supply / balance-like value with no zero / minimum check on the way (empty or donated pool)',
		run: ix => (ix.divs ?? []).filter(d => d.status === 'not_found').slice(0, 2).map(d => ({
			accounts: [], path: [L(d.at)], evidence: [`divisor ${d.divisor}: no comparison on it found on the way (a zero divisor aborts; a first depositor / donation can skew the ratio)`, d.expr], confidence: /\.amount\b|balance|lamports/.test(d.divisor) ? 'medium' as const : 'low' as const, weight: 4,
		})),
	},
	{
		id: 'mint-burn-authority-from-data', title: 'Mint / burn whose authority comes from account data rather than a signer',
		run: ix => ix.ops.filter(o => o.kinds.includes('MINT') || o.kinds.includes('BURN')).flatMap(o => {
			const au = o.cpi?.accounts.find(x => x.role && /authority|owner/.test(x.role))
			const n = au && /^\*?([A-Za-z_]\w*(?:\[\d+\])?)/.exec(au.text)?.[1]
			const row = n ? ix.accounts.find(x => x.name === n) : undefined
			const signed = row?.constraints.signer && row.constraints.signer.status !== 'not_found'
			const fromData = (o.sources ?? []).filter(s => s.param === au?.role && !s.source.endsWith('.key') && s.source.includes('.'))
			const seedsData = !o.cpi?.seeds ? [] : (o.sources ?? []).filter(s => s.param === 'signer seeds' && s.trust === 'caller-controlled' && !s.source.endsWith('.key'))
			if (signed) return []
			if (fromData.length) return [{ accounts: [n ?? au!.text], path: [L(o.at)], evidence: [o.text.slice(0, 140), `authority ← ${fromData.map(s => `${s.source} (${s.trust})`).join(', ')}`], confidence: fromData.some(s => s.trust === 'caller-controlled') ? 'medium' as const : 'low' as const, weight: wOf(o) }]
			if (seedsData.length) return [{ accounts: seedsData.map(s => s.source), path: [L(o.at)], evidence: [o.text.slice(0, 140), `PDA signer seeds from unverified account data: ${seedsData.map(s => s.source).join(', ')}`], confidence: 'low' as const, weight: wOf(o) }]
			if (!o.cpi?.seeds && !o.kinds.includes('PDA_SIGNATURE') && au && !row) return [{ accounts: [au.text], path: [L(o.at)], evidence: [o.text.slice(0, 140), `authority ${au.text} is not an identified account with a signer check (read from memory / data)`], confidence: 'low' as const, weight: wOf(o) }]
			return []
		}),
	},
	{
		id: 'cpi-forwarder', title: 'Verbatim CPI forwarder: account-supplied program id, caller accounts passed through, no signer seeds',
		run: ix => ix.ops.filter(o => o.cpi && !o.cpi.known && o.cpi.program !== '?' && !o.cpi.seeds).flatMap(o => {
			// (accounts decoded, every one a caller-provided account; the instruction data from the caller or not decoded)
			const names = new Set(ix.accounts.map(x => x.name))
			const accts = o.cpi!.accounts
			if (!accts.length || !accts.every(x => { const m = /^\*?([A-Za-z_]\w*(?:\[\d+\])?)$/.exec(x.text.trim()); return m && names.has(m[1]) || /remaining/.test(x.text) })) return []
			const dataCaller = !o.cpi!.fields.length || (o.sources ?? []).some(s => s.trust === 'caller-controlled' && (s.source === 'instruction data' || s.source.startsWith('ix.')))
			if (!dataCaller) return []
			const checked = /\(id compared with/.test(o.cpi!.checked ?? '')
			return [{ accounts: [o.cpi!.program], path: [L(o.at)], evidence: [o.text.slice(0, 140), `${accts.length} accounts, all caller-provided; data ${o.cpi!.fields.length ? 'from the instruction data' : 'not decoded'}; program id ${checked ? 'compared with a known id' : 'not compared with a known id'}`], confidence: checked ? 'low' as const : 'medium' as const, weight: 4 }]
		}),
	},
	{
		id: 'close-without-zeroing', title: 'Account close without zeroing the data / discriminator, or followed by a realloc (revival)',
		run: ix => ix.ops.flatMap((o, oi) => {
			if (!o.kinds.includes('ACCOUNT_CLOSE') || o.cpi?.known) return []
			const z = closeZeroing(ix, oi)
			if (z.revived) return [{ accounts: [o.target ?? '?'], path: [L(o.at)], evidence: [o.text.slice(0, 120), `realloc after the close: ${z.revived}`], confidence: 'medium' as Finding['confidence'], weight: 5 }]
			if (z.zeroed) return []
			return [{ accounts: [o.target ?? '?'], path: [L(o.at)], evidence: [o.text.slice(0, 120), 'lamports drained, but no data zeroing / closed discriminator / realloc(0) / owner reassignment found in the instruction'], confidence: 'low' as const, weight: 4 }]
		}),
	},
	{
		id: 'unchecked-arithmetic', title: 'Wrapping (unchecked) addition / subtraction on a value path with no bound check on the way',
		run: ix => (ix.arith ?? []).filter(x => x.status === 'unchecked').sort((x, y) => Number(!!y.caller) - Number(!!x.caller) || (x.kind === 'sub' ? -1 : 1)).slice(0, 3).map(x => ({
			accounts: [x.target.split('.')[0]], path: [L(x.at)], evidence: [`${x.target} ← ${x.expr} (${x.kind})`, `no comparison of the operands found on the way${x.caller ? '; operands include instruction data' : ''}${x.unnamed ? '; field not named (native layout)' : ''}`], confidence: x.caller && x.kind === 'sub' ? 'medium' as const : 'low' as const, weight: x.kind === 'sub' ? 3 : 2,
		})),
	},
	{
		id: 'recipient-unbound', title: 'Recipient / destination with no owner, mint or key binding',
		run: (ix, a) => ix.ops.flatMap(o => {
			const k = o.kinds
			if (!k.some(x => x === 'TOKEN_TRANSFER' || x === 'LAMPORT_TRANSFER' || x === 'MINT')) return []
			const dest = o.cpi?.accounts.find(x => x.role && /^(destination|to|account)$/.test(x.role))
			const d = dest && /^\*?([A-Za-z_]\w*(?:\[\d+\])?)/.exec(dest.text)?.[1]
			const row = d ? ix.accounts.find(x => x.name === d) : undefined
			// (native: an account by index no check of the instruction reads has no row: nothing binds it; not a mint's
			// destination: the token program requires it to hold the mint minted)
			if (!row && !(d && !a.program.anchor && /^account\[\d+\]$/.test(d) && !k.includes('MINT'))) return []
			// (native: an explicit owner check, e.g. the token program's; Anchor's Account<T> always checks one)
			const bind = ['token_owner', 'token_mint', 'associated', 'has_one', 'key', 'address', 'pda', 'signer', ...(a.program.anchor ? [] : ['owner'])].filter(c => row?.constraints[c] && row.constraints[c].status !== 'not_found' && row.constraints[c].status !== 'runtime')
			const rel = (ix.relations ?? []).some(x => x.a.startsWith(`${d}.`) || x.b.startsWith(`${d}.`))
			if (bind.length || rel) return []
			// (outflows the program signs for are the ones where an unbound destination matters most)
			return [{ accounts: [d!], path: [L(o.at)], evidence: [o.text.slice(0, 140), `${d}: no owner / mint / key / PDA / relation check found${o.cpi?.seeds ? '; the program signs this outflow (PDA)' : ''}`], confidence: o.cpi?.seeds ? 'medium' as const : 'low' as const, weight: wOf(o) }]
		}),
	},
]

function rules(ix: IxOut, a: Analysis): Finding[] {
	const out: Finding[] = []
	for (const r of RULES) for (const f of r.run(ix, a)) out.push({ rule: r.id, title: r.title, ix: ix.name, ...f })
	return out
}
export const RULE_IDS = RULES.map(r => `${r.id}: ${r.title}`)
