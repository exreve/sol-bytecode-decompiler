// Program analysis (phase 1 of docs/ANALYSIS_SPEC.md): per-instruction facts aggregated from the
// per-function facts (facts.ts) over the call graph, and the reports written to security/.
//
// DERIVED and OVER-APPROXIMATE: the decompiled code is the verified source of truth; everything here is
// read off it by structural heuristics and may be incomplete or wrong. Statuses:
//   found      a check was found on every path of the instruction that does not exit early (it is not
//              nested under other branching, in its function nor at the calls leading to it)
//   partial    a check was found, but only on some paths
//   not_found  no check was found (not a proof of absence: it may be made in a way not recognized)
//   runtime    enforced by the Solana runtime (a written account must be writable and owned by the
//              program; a CPI's signer / writable privileges cannot exceed the caller's; the invoked
//              program must be executable)
//
// security/analysis.json schema ("schema": "sbpf-decompiler/security@1"):
//   program      { version, instructions (sBPF), functions, anchor, idl }
//   instructions [ {
//     name, handler (function), kind ('anchor' | 'native' | 'processor' | 'entrypoint'), score, effects: [string],
//     functions: [function names reachable from the handler through direct calls],
//     accounts: [ { index?, name, source ('idl' | 'str' | 'code'), expected: { signer?, writable?, pda?, address?, optional? },
//                   constraints: { <kind>: { status, at?, via?, note? } } } ],
//     checks:   [ { at, status ('found' | 'partial'), account?, kinds: [string], cond, fails_if (bool: the exit is taken when cond holds),
//                   error, via? } ],
//     operations: [ { at, kinds: [OpKind], text, path ('main' | 'conditional'), target?, how?, value?,
//                     cpi?: { program, known?, program_check, instruction?, accounts: [ { role?, text, w?, s? } ], fields: [[name, value]], seeds? },
//                     pda?: { fn, seeds, program } } ],
//   } ]
//   pdas         [ { seeds, program, derived_in: [ix], signs_in: [ix], accounts: [ix.account with a seeds constraint], compared: status } ]
//   state_writes [ { target (account.field), writes: [ { ix, how, at } ] } ]
//   dependencies [ { target, read_by: [ix] (in checks), written_by: [ix] } ]
// `at` = { fn, line (1-based, in the function's text), pc? (sBPF instruction index), file?, file_line? (the line in that file) }.
// constraint kinds: signer, writable, owner, discriminator, initialized, pda, address, executable, has_one, key, state,
//   custom (IDL error), raw, rent_exempt, count, token_mint, token_owner, …; op kinds: see facts.ts OpKind.
import type { Result } from '../decompile.ts'
import type { FnFacts, Op, OpKind } from './facts.ts'
import { refOf } from './facts.ts'

export type Status = 'found' | 'partial' | 'not_found' | 'runtime'
export interface Loc { fn: string; line: number; pc?: number }
export interface Evidence { status: Status; at?: Loc; via?: string; note?: string }
export interface AccountRow {
	index?: number
	name: string
	source: 'idl' | 'str' | 'code'
	expected: { signer?: boolean; writable?: boolean; pda?: boolean; address?: string; optional?: boolean }
	constraints: Record<string, Evidence>
}
export interface CheckOut { at: Loc; status: 'found' | 'partial'; account?: string; kinds: string[]; cond: string; failsIf: boolean; error: string; via?: string }
export interface OpOut { at: Loc; kinds: OpKind[]; text: string; main: boolean; target?: string; how?: string; value?: string; cpi?: Op['cpi']; pda?: Op['pda'] }
export interface IxOut {
	name: string
	handler: string
	kind: 'anchor' | 'native' | 'processor' | 'entrypoint'
	functions: string[]
	accounts: AccountRow[]
	checks: CheckOut[]
	ops: OpOut[]
	score: number
	effects: string[]
}
export interface PdaOut { seeds: string; program: string; derivedIn: string[]; signsIn: string[]; accounts: string[]; compared: Status }
export interface Analysis {
	program: { version: number; instructions: number; functions: number; anchor: boolean; idl: boolean }
	ixs: IxOut[]
	pdas: PdaOut[]
	stateWrites: { target: string; writes: { ix: string; how: string; at: Loc }[] }[]
	deps: { target: string; readBy: string[]; writtenBy: string[] }[]
}

/** Sensitivity weights (ranking of the instruction surface). */
const WEIGHT: Partial<Record<OpKind, number>> = {
	TOKEN_TRANSFER: 5, LAMPORT_TRANSFER: 5, MINT: 5, BURN: 3, PROGRAM_UPGRADE: 6, AUTHORITY_WRITE: 4, ACCOUNT_CLOSE: 4, OWNER_ASSIGN: 4,
	PDA_SIGNATURE: 3, LAMPORT_WRITE: 4, ACCOUNT_REALLOC: 2, ACCOUNT_CREATE: 2, ACCOUNT_DATA_WRITE: 1, CPI: 1,
}
const RANK: Record<Status, number> = { found: 3, runtime: 2, partial: 1, not_found: 0 }
const TEMP = /^([a-z]{1,2}|v\d+|s[0-9a-f]+|p\d+|r\d|fp|u\d+|[a-z]{1,2}_\d+)$/

const memo = new WeakMap<Result, Analysis>()

/** The analysis of a decompiled program (computed once per result). */
export function analyze(r: Result): Analysis {
	let a = memo.get(r)
	if (!a) { a = analyze0(r); memo.set(r, a) }
	return a
}

function parseIdlAccount(s: string, i: number): AccountRow {
	const m = /^(\S+)(?: \[(.*)\])?$/.exec(s)!
	const flags = (m[2] ?? '').split(', ')
	const addr = flags.find(f => f.startsWith('= '))
	return {
		index: i, name: m[1].split('.').pop()!, source: 'idl', constraints: {},
		expected: { signer: flags.includes('signer') || undefined, writable: flags.includes('mut') || undefined, pda: flags.includes('pda') || undefined, optional: flags.includes('optional') || undefined, address: addr?.slice(2) },
	}
}

function analyze0(r: Result): Analysis {
	const facts = r.facts
	const byPc = new Map(r.funcs.map(f => [f.pc, f]))
	const procNames = new Set(r.processors.map(x => x.fn))
	let roots = r.funcs.filter(f => f.name.startsWith('ix_') || procNames.has(f.name))
	if (!roots.length) roots = r.funcs.filter(f => f.f.isEntry)
	const rootPcs = new Set(roots.map(f => f.pc))
	const ixs: IxOut[] = []
	for (const h of roots) {
		const name = h.name.startsWith('ix_') ? h.name.slice(3) : h.name
		const info = r.instructions.find(i => i.pc === h.pc)
		// functions reachable through direct calls (not other handlers): main = through main-path calls only
		const main = new Map<number, boolean>([[h.pc, true]])
		const q = [h.pc]
		while (q.length) {
			const x = q.shift()!
			const m = main.get(x)!
			for (const c of facts.get(x)?.calls ?? []) {
				if (!facts.has(c.callee) || rootPcs.has(c.callee) || c.errPath) continue
				const cm = m && c.main
				const prev = main.get(c.callee)
				if (prev === undefined || (cm && !prev)) { main.set(c.callee, cm); q.push(c.callee) }
			}
		}
		const fns = [...main.keys()].map(pc => facts.get(pc)!).filter(Boolean)
		// the accounts: IDL, else the program's account-error strings, then names met in the code
		const accounts: AccountRow[] = info?.accounts?.length ? info.accounts.map(parseIdlAccount)
			: (info?.strAccounts ?? []).map((n, i) => ({ index: i, name: n, source: 'str' as const, expected: {}, constraints: {} }))
		const known = new Set(accounts.map(x => x.name))
		const canon = (acct: string | undefined): string | undefined => {
			if (!acct) return undefined
			const a = acct.replace(/_\d+$/, '')
			if (known.has(a)) return a
			if (/^acc\d+$/.test(a)) return `account[${a.slice(3)}]`
			return TEMP.test(acct) ? undefined : a
		}
		const row = (nm: string): AccountRow => {
			let x = accounts.find(y => y.name === nm)
			if (!x) { x = { name: nm, source: 'code', expected: {}, constraints: {} }; accounts.push(x); known.add(nm) }
			return x
		}
		const note = (acct: string, kind: string, ev: Evidence) => {
			const x = row(acct)
			const old = x.constraints[kind]
			if (!old || RANK[ev.status] > RANK[old.status]) x.constraints[kind] = ev
		}
		const loc = (ff: FnFacts, line: number, pc?: number): Loc => ({ fn: ff.name, line, pc })
		const checks: CheckOut[] = []
		const ops: OpOut[] = []
		for (const ff of fns) {
			const fm = main.get(ff.pc)!
			for (const c of ff.checks) {
				const status: 'found' | 'partial' = fm && c.main ? 'found' : 'partial'
				// (an account the code holds in a temporary: its name, marked with ?)
				const acct = canon(c.named) ?? canon(c.refs.find(x => canon(x.acct))?.acct) ?? (c.refs[0] ? `${c.refs[0].acct}?` : undefined)
				const kinds = [...c.kinds, ...(c.via?.kinds ?? []).filter(k => k !== 'count' && !c.kinds.includes(k))]
				const at = loc(ff, c.line, c.pc)
				checks.push({ at, status, account: acct, kinds, cond: c.cond, failsIf: c.failsIf, error: c.error, via: c.via ? `${c.via.fn} (${c.via.kinds.join(', ')})` : undefined })
				// per account: the named one gets every kind; accounts read by the condition get their field's kind
				if (c.named && canon(c.named)) for (const k of kinds) note(canon(c.named)!, k, { status, at, via: c.via && !c.kinds.includes(k) ? c.via.fn : undefined })
				for (const x of c.refs) {
					const ca = canon(x.acct)
					if (!ca || ca === canon(c.named)) continue
					const f0 = x.field?.split('.')[0] ?? ''
					const k = { is_signer: 'signer', is_writable: 'writable', owner: 'owner', key: 'key', executable: 'executable', data_len: 'data_len', lamports: 'lamports' }[f0] ?? (x.field ? 'state' : undefined)
					if (k) note(ca, k, { status, at })
				}
			}
			for (const o of ff.ops) {
				if (o.errPath) continue
				// (a wrapper's own CPI site, when its calls in this instruction are decoded)
				if (ff.wrapper && !o.cpi && fns.some(g => g.ops.some(x => x.via === ff.name))) continue
				const at = loc(ff, o.line, o.pc)
				const tgt = o.target ? `${canon(o.target.acct) ?? o.target.acct}${o.target.field ? '.' + o.target.field : ''}` : undefined
				ops.push({ at, kinds: o.kinds, text: o.text + (o.via ? ` [through ${o.via}, decoded by a run of ${ff.name}]` : ''), main: fm && o.main, target: tgt, how: o.how, value: o.value, cpi: o.cpi, pda: o.pda })
			}
		}
		// runtime model: what the Solana runtime enforces for the operations made
		for (const o of ops) {
			const acct = o.target?.split('.')[0]
			if (acct && known.has(acct)) {
				if (o.kinds.includes('ACCOUNT_DATA_WRITE') || o.kinds.includes('LAMPORT_WRITE')) note(acct, 'writable', { status: 'runtime', at: o.at, note: 'written: the runtime rejects changes to a read-only account' })
				if (o.kinds.includes('ACCOUNT_DATA_WRITE') || (o.kinds.includes('LAMPORT_WRITE') && o.how === '-=')) note(acct, 'owner', { status: 'runtime', at: o.at, note: 'data written / lamports debited: only the owner program may (the runtime rejects it otherwise)' })
			}
			for (const x of o.cpi?.accounts ?? []) {
				const ca = canon(refOf(x.text.replace(/^\*/, ''), new Map())?.acct ?? x.text.replace(/^\*/, ''))
				if (!ca || !known.has(ca)) continue
				if (x.s && !o.cpi?.seeds) note(ca, 'signer', { status: 'runtime', at: o.at, note: 'passed as a CPI signer: the callee rejects it unless it signed the transaction' })
				if (x.w) note(ca, 'writable', { status: 'runtime', at: o.at, note: 'passed writable to a CPI: privileges cannot be escalated' })
			}
		}
		// what the IDL declares but no check was found for
		for (const x of accounts) {
			const e = x.expected
			const need: string[] = []
			if (e.signer) need.push('signer')
			if (e.writable) need.push('writable')
			if (e.pda) need.push('pda')
			if (e.address) need.push('address')
			for (const k of need) if (!x.constraints[k]) x.constraints[k] = { status: 'not_found' }
		}
		// effects (surface tree) and the sensitivity score
		const effects: string[] = []
		let score = 0
		const seen = new Set<string>()
		const eff = (t: string, w: number) => { if (seen.has(t)) return; seen.add(t); effects.push(t); score += w }
		for (const o of ops) {
			const k = o.kinds
			const w = Math.max(...k.map(x => WEIGHT[x] ?? 0))
			if (k.includes('CPI')) {
				const c = o.cpi
				const prog = c ? (c.known ? c.program : `${c.program} [account-supplied program id${c.checked ? `; ${c.checked}` : ''}]`) : '?'
				const what = c?.ix ? `${prog}.${c.ix}` : c ? prog : 'program not decoded'
				const tag = k.includes('TOKEN_TRANSFER') ? 'TOKEN MOVE' : k.includes('LAMPORT_TRANSFER') ? 'LAMPORT MOVE' : k.includes('MINT') ? 'MINT' : k.includes('BURN') ? 'BURN'
					: k.includes('ACCOUNT_CLOSE') ? 'CLOSE' : k.includes('AUTHORITY_WRITE') ? 'SET authority' : k.includes('ACCOUNT_CREATE') ? 'CREATE' : k.includes('OWNER_ASSIGN') ? 'ASSIGN owner' : k.includes('ACCOUNT_REALLOC') ? 'ALLOCATE' : k.includes('PROGRAM_UPGRADE') ? 'UPGRADE' : 'CPI'
				eff(`${tag}: CPI → ${what}${k.includes('PDA_SIGNATURE') ? ' (PDA-signed)' : ''}`, w + (c && !c.known ? 3 : 0))
			} else if (k.includes('PDA_DERIVE')) eff(`DERIVE PDA ${o.pda?.seeds ?? '?'}`, 0)
			else if (k.includes('LAMPORT_WRITE')) eff(`${k.includes('ACCOUNT_CLOSE') ? 'CLOSE (lamports = 0)' : o.how === '-=' ? 'LAMPORT OUT' : o.how === '+=' ? 'LAMPORT IN' : 'LAMPORT SET'} ${o.target}`, w)
			else if (k.includes('AUTHORITY_WRITE')) eff(`SET authority ${o.target}`, w)
			else if (k.includes('ACCOUNT_DATA_WRITE')) eff(`WRITE ${o.target} (${o.how})`, w)
			else if (k.includes('ACCOUNT_REALLOC')) eff(`REALLOC ${o.target ?? o.text}`, w)
		}
		// unverified expected privileges raise the rank
		for (const x of accounts) for (const [k, ev] of Object.entries(x.constraints)) if (ev.status === 'not_found' && (k === 'signer' || k === 'pda' || k === 'address')) score += 2
		const kind: IxOut['kind'] = !h.name.startsWith('ix_') ? (procNames.has(h.name) ? 'processor' : 'entrypoint') : r.anchor ? 'anchor' : 'native'
		ixs.push({ name, handler: h.name, kind, functions: fns.map(f => f.name), accounts, checks, ops, score, effects })
	}
	ixs.sort((x, y) => y.score - x.score || x.name.localeCompare(y.name))

	// program-level views: PDAs, state writes, read/write dependencies
	const pdas = new Map<string, PdaOut>()
	const pda = (seeds: string, program: string) => {
		const k = `${seeds}|${program}`
		let x = pdas.get(k)
		if (!x) pdas.set(k, (x = { seeds, program, derivedIn: [], signsIn: [], accounts: [], compared: 'not_found' }))
		return x
	}
	const add = (l: string[], v: string) => { if (!l.includes(v)) l.push(v) }
	const writes = new Map<string, { ix: string; how: string; at: Loc }[]>()
	const reads = new Map<string, Set<string>>()
	for (const ix of ixs) {
		const pdaAccts = ix.accounts.filter(x => x.constraints.pda?.status === 'found' || x.constraints.pda?.status === 'partial')
		for (const o of ix.ops) {
			if (o.pda) {
				const x = pda(o.pda.seeds, o.pda.program)
				add(x.derivedIn, ix.name)
				for (const a of pdaAccts) { add(x.accounts, `${ix.name}.${a.name}`); if (RANK[a.constraints.pda.status] > RANK[x.compared]) x.compared = a.constraints.pda.status }
			}
			if (o.cpi?.seeds) add(pda(o.cpi.seeds, '(caller: this program)').signsIn, ix.name)
			if (o.target && o.kinds.some(k => k === 'ACCOUNT_DATA_WRITE' || k === 'LAMPORT_WRITE')) {
				let l = writes.get(o.target); if (!l) writes.set(o.target, (l = []))
				if (!l.some(w => w.ix === ix.name && w.how === o.how)) l.push({ ix: ix.name, how: o.how ?? '=', at: o.at })
			}
		}
		for (const c of ix.checks) for (const m of c.cond.matchAll(/\b([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+)/g)) {
			const rf = refOf(m[1], new Map())
			if (!rf?.field || /^(key|owner|is_signer|is_writable|executable|lamports|data_len)$/.test(rf.field)) continue
			const t = `${rf.acct.replace(/_\d+$/, '')}.${rf.field}`
			let s = reads.get(t); if (!s) reads.set(t, (s = new Set())); s.add(ix.name)
		}
	}
	const deps: Analysis['deps'] = []
	for (const [t, rs] of reads) { const w = writes.get(t); if (w) deps.push({ target: t, readBy: [...rs].sort(), writtenBy: [...new Set(w.map(x => x.ix))].sort() }) }
	const p = r.program
	return {
		program: { version: p.version, instructions: p.insns.length, functions: p.funcs.size, anchor: r.anchor, idl: r.instructions.some(i => i.accounts !== undefined) },
		ixs, pdas: [...pdas.values()],
		stateWrites: [...writes].sort((x, y) => x[0].localeCompare(y[0])).map(([target, w]) => ({ target, writes: w })),
		deps: deps.sort((x, y) => x.target.localeCompare(y.target)),
	}
}

// ---- rendering ----

/** Where a location is in the written files: `file:line`, or undefined (single-file output). */
export type Where = (ix: string | undefined, at: Loc) => { file: string; line: number } | undefined

const at2s = (w: Where, ix: string | undefined, at: Loc) => { const x = w(ix, at); return x ? `${x.file}:${x.line}` : `${at.fn}:${at.line}` }
const ST: Record<Status, string> = { found: 'found', partial: 'PARTIAL', not_found: 'NOT FOUND', runtime: 'runtime' }

/** security/analysis.json */
export function renderJson(a: Analysis, where: Where): string {
	const L = (ix: string | undefined, at: Loc) => { const x = where(ix, at); return { fn: at.fn, line: at.line, pc: at.pc, file: x?.file, file_line: x?.line } }
	const ev = (ix: string, e: Evidence) => ({ status: e.status, at: e.at && L(ix, e.at), via: e.via, note: e.note })
	const doc = {
		schema: 'sbpf-decompiler/security@1',
		note: 'derived, over-approximate facts read off the decompiled code (the verified source of truth); statuses: found | partial | not_found (no check found, not a proof of absence) | runtime (enforced by the Solana runtime)',
		program: a.program,
		instructions: a.ixs.map(ix => ({
			name: ix.name, handler: ix.handler, kind: ix.kind, score: ix.score, effects: ix.effects, functions: ix.functions,
			accounts: ix.accounts.map(x => ({ index: x.index, name: x.name, source: x.source, expected: x.expected, constraints: Object.fromEntries(Object.entries(x.constraints).map(([k, e]) => [k, ev(ix.name, e)])) })),
			checks: ix.checks.map(c => ({ at: L(ix.name, c.at), status: c.status, account: c.account, kinds: c.kinds, cond: c.cond, fails_if: c.failsIf, error: c.error, via: c.via })),
			operations: ix.ops.map(o => ({
				at: L(ix.name, o.at), kinds: o.kinds, text: o.text, path: o.main ? 'main' : 'conditional', target: o.target, how: o.how, value: o.value,
				cpi: o.cpi && { program: o.cpi.program, known: o.cpi.known, program_check: o.cpi.known ? 'constant' : o.cpi.checked ?? 'unknown', instruction: o.cpi.ix, accounts: o.cpi.accounts, fields: o.cpi.fields, seeds: o.cpi.seeds },
				pda: o.pda,
			})),
		})),
		pdas: a.pdas.map(x => ({ seeds: x.seeds, program: x.program, derived_in: x.derivedIn, signs_in: x.signsIn, accounts: x.accounts, compared: x.compared })),
		state_writes: a.stateWrites.map(s => ({ target: s.target, writes: s.writes.map(w => ({ ix: w.ix, how: w.how, at: L(w.ix, w.at) })) })),
		dependencies: a.deps.map(d => ({ target: d.target, read_by: d.readBy, written_by: d.writtenBy })),
	}
	return JSON.stringify(doc, (_, v) => (v === undefined ? undefined : v), 1) + '\n'
}

const HEADER = [
	'DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).',
	'Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).',
]

/** Flags an auditor should look at first, per instruction. */
function flags(ix: IxOut): string[] {
	const out: string[] = []
	for (const x of ix.accounts) for (const k of ['signer', 'pda', 'address', 'writable']) if (x.constraints[k]?.status === 'not_found') out.push(`${x.name}: ${k} expected, no check found`)
	for (const o of ix.ops) if (o.cpi && !o.cpi.known && !/compared with/.test(o.cpi.checked ?? '')) out.push(`CPI to an account-supplied program id without a recognized check (${o.at.fn}:${o.at.line})`)
	const value = ix.ops.some(o => o.kinds.some(k => ['TOKEN_TRANSFER', 'LAMPORT_TRANSFER', 'MINT', 'LAMPORT_WRITE', 'ACCOUNT_CLOSE', 'AUTHORITY_WRITE'].includes(k)))
	const signer = ix.accounts.some(x => x.constraints.signer && x.constraints.signer.status !== 'not_found') || ix.checks.some(c => c.kinds.includes('signer'))
	if (value && !signer) out.push('moves value / changes authority, but no signer check was found')
	return [...new Set(out)]
}

/** security/summary.md: the ranked instruction surface tree. */
export function renderSummary(a: Analysis, where: Where, ixFile: (ix: IxOut) => string): string {
	const out = ['# Security summary', '', ...HEADER, '',
		`Program: sBPF v${a.program.version}, ${a.program.instructions} instructions, ${a.program.functions} functions${a.program.anchor ? ', Anchor' : ''}${a.program.idl ? ' (with IDL)' : ''}. Machine-readable: analysis.json.`, '',
		'## Instructions (most sensitive first)', '']
	for (const ix of a.ixs) {
		const signers = ix.accounts.filter(x => x.constraints.signer && x.constraints.signer.status !== 'not_found').map(x => `${x.name} (${ST[x.constraints.signer.status]})`)
		const anon = ix.checks.filter(c => c.kinds.includes('signer') && (!c.account || c.account.endsWith('?'))).length
		if (anon) signers.push(`${anon} signer check${anon > 1 ? 's' : ''} on accounts held in temporaries (see ${ixFile(ix)})`)
		out.push(`- **${ix.name}** — score ${ix.score} · [${ixFile(ix)}](${ixFile(ix)})${ix.kind === 'anchor' || ix.kind === 'native' ? ` · ../bundle/${ix.name}.ts` : ''}`)
		out.push(`  - signers: ${signers.join(', ') || 'none found'}`)
		for (const e of ix.effects.slice(0, 12)) out.push(`  - ${e}`)
		if (ix.effects.length > 12) out.push(`  - … ${ix.effects.length - 12} more (see ${ixFile(ix)})`)
		for (const f of flags(ix).slice(0, 6)) out.push(`  - ⚠ ${f}`)
	}
	if (a.pdas.length) {
		out.push('', '## PDAs', '')
		for (const x of a.pdas) out.push(`- seeds ${x.seeds}, program ${x.program}${x.derivedIn.length ? ` — derived in ${x.derivedIn.join(', ')}` : ''}${x.signsIn.length ? ` — signs in ${x.signsIn.join(', ')}` : ''}${x.accounts.length ? ` — seeds constraint on ${x.accounts.join(', ')} (${ST[x.compared]})` : ''}`)
	}
	if (a.stateWrites.length) {
		out.push('', '## State writes (account.field ← instructions)', '')
		for (const s of a.stateWrites.slice(0, 60)) out.push(`- ${s.target} ← ${s.writes.map(w => `${w.ix} (${w.how})`).join(', ')}`)
		if (a.stateWrites.length > 60) out.push(`- … ${a.stateWrites.length - 60} more in analysis.json`)
	}
	if (a.deps.length) {
		out.push('', '## Read/write dependencies (field checked by X, written by Y)', '')
		for (const d of a.deps) out.push(`- ${d.target}: checked in ${d.readBy.join(', ')}; written in ${d.writtenBy.join(', ')}`)
	}
	void where
	return out.join('\n') + '\n'
}

const cell = (x: AccountRow, k: string): string => {
	const e = x.constraints[k]
	const exp = k === 'signer' ? x.expected.signer : k === 'writable' ? x.expected.writable : k === 'pda' ? x.expected.pda : k === 'address' ? !!x.expected.address : undefined
	if (!e) return exp ? 'expected · NOT FOUND' : '—'
	return `${exp ? 'expected · ' : ''}${ST[e.status]}`
}
/** the condition under which a check fails, as text */
export function failText(c: { cond: string; failsIf: boolean }): string {
	if (c.failsIf) return c.cond
	const m = /^([^&|!=<>()]+?) (==|!=|>=|<=|>|<) ([^&|!=<>()]+)$/.exec(c.cond)
	if (m) return `${m[1]} ${{ '==': '!=', '!=': '==', '>=': '<', '<=': '>', '>': '<=', '<': '>=' }[m[2]]} ${m[3]}`
	if (/^!\w+\([^()]*(\([^()]*\)[^()]*)*\)$/.test(c.cond)) return c.cond.slice(1)
	return /^\w+\([^()]*(\([^()]*\)[^()]*)*\)$/.test(c.cond) ? `!${c.cond}` : `!(${c.cond})`
}
const md = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')

/** security/<ix>.md: privilege matrix, constraint matrix, CPIs, PDAs, operations, state writes, checks. */
export function renderIx(ix: IxOut, where: Where): string {
	const W = (at: Loc) => at2s(where, ix.name, at)
	const out = [`# ${ix.name}`, '', ...HEADER, '', `Handler ${ix.handler} (${ix.kind}); ${ix.functions.length} functions reachable: ${ix.functions.slice(0, 12).join(', ')}${ix.functions.length > 12 ? ', …' : ''}.`, '']
	const fl = flags(ix)
	if (fl.length) out.push('## Look first', '', ...fl.map(f => `- ⚠ ${f}`), '')
	out.push('## Account privileges (expected by the IDL · verified by the code)', '', '| # | account | signer | writable | owner | executable | address |', '|---|---|---|---|---|---|---|')
	for (const x of ix.accounts) out.push(`| ${x.index ?? ''} | ${x.name}${x.source !== 'idl' ? ` [${x.source}]` : ''} | ${cell(x, 'signer')} | ${cell(x, 'writable')} | ${cell(x, 'owner')}${x.constraints.discriminator ? ` (+discriminator ${ST[x.constraints.discriminator.status]})` : ''} | ${cell(x, 'executable')} | ${x.expected.address ? `= ${x.expected.address.slice(0, 8)}… · ` : ''}${cell(x, 'address')} |`)
	out.push('', '## Constraints per account', '')
	for (const x of ix.accounts) {
		const ks = Object.entries(x.constraints)
		if (!ks.length) { out.push(`- ${x.name}: no checks found`); continue }
		out.push(`- ${x.name}: ${ks.map(([k, e]) => `${k} ${ST[e.status]}${e.at ? ` (${W(e.at)}${e.via ? ` via ${e.via}` : ''})` : ''}${e.note ? ` — ${e.note}` : ''}`).join('; ')}`)
	}
	const cpis = ix.ops.filter(o => o.kinds.includes('CPI'))
	if (cpis.length) {
		out.push('', '## CPIs', '')
		for (const o of cpis) {
			const c = o.cpi
			const prog = !c ? 'program not decoded' : c.known ? `${c.program} (constant)` : `${c.program} (account-supplied; ${c.checked ?? 'check unknown'})`
			out.push(`- ${W(o.at)} ${o.main ? '' : '[conditional] '}${prog}${c?.ix ? `.${c.ix}` : ''}${c?.accounts.length ? ` — accounts ${c.accounts.map(x => `${x.role ? x.role + ': ' : ''}${x.text}${x.w ? ' w' : ''}${x.s ? ' s' : ''}`).join(', ')}` : ''}${c?.fields.length ? ` — ${c.fields.map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}${c?.seeds ? ` — PDA signer: ${c.seeds}` : ''}`)
			if (!c) out.push(`  - ${md(o.text)}`)
		}
	}
	const pdas = ix.ops.filter(o => o.pda)
	if (pdas.length) {
		out.push('', '## PDAs derived', '')
		for (const o of pdas) out.push(`- ${W(o.at)} ${o.pda!.fn}(${o.pda!.seeds}, program ${o.pda!.program})`)
		const sc = ix.accounts.filter(x => x.constraints.pda)
		if (sc.length) out.push(`- compared with provided accounts: ${sc.map(x => `${x.name} ${ST[x.constraints.pda.status]}`).join(', ')}`)
	}
	const sens = ix.ops.filter(o => !o.kinds.includes('CPI') && !o.pda)
	if (sens.length) {
		out.push('', '## Operations (account writes)', '')
		for (const o of sens) out.push(`- ${W(o.at)} ${o.kinds.join(', ')} ${o.target ?? ''} ${o.how ?? ''}${o.value ? ` ${md(o.value).slice(0, 80)}` : ''}${o.main ? '' : ' [conditional]'}`)
	}
	if (ix.checks.length) {
		out.push('', '## Checks', '', '| at | status | account | kinds | fails if | error |', '|---|---|---|---|---|---|')
		for (const c of ix.checks) out.push(`| ${W(c.at)} | ${ST[c.status]} | ${c.account ?? ''} | ${c.kinds.join(', ')}${c.via ? ` (via ${c.via})` : ''} | \`${md(failText(c)).slice(0, 100)}\` | ${c.error} |`)
	}
	return out.join('\n') + '\n'
}

/** Short comment block for the single-file output. */
export function renderSummaryComment(a: Analysis): string[] {
	const out = ['// security summary (DERIVED, over-approximate; write a project with -o dir/ for security/*.md, analysis.json):']
	for (const ix of a.ixs.slice(0, 40)) {
		const fl = flags(ix)
		out.push(`//   ${ix.name} [score ${ix.score}]: ${ix.effects.slice(0, 4).join('; ') || 'no effects found'}${ix.effects.length > 4 ? '; …' : ''}${fl.length ? ` | ⚠ ${fl.slice(0, 2).join('; ')}${fl.length > 2 ? '; …' : ''}` : ''}`)
	}
	if (a.ixs.length > 40) out.push(`//   … ${a.ixs.length - 40} more`)
	return out
}

