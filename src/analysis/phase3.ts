// Program analysis, phase 3 (docs/ANALYSIS_SPEC.md): bounded, best-effort views over the phase 1/2 facts.
//   paths       the conditions on the way to each sensitive operation (enclosing branches and early-exit
//               checks before it, in its function and at the call sites up to the handler), and the
//               relevant checks that some path to it does not require
//   chains      backward authorization chains: operation -> signer / PDA signature / stored authority
//               field related to a signer -> the instructions writing that field -> their signers
//   arithmetic  additions / subtractions on value paths (amounts, balances, lamports): checked (a bound /
//               overflow check of the operands on the way), bounded (each subtracted operand compared with
//               another value on every path: an invariant between them; an amount added that the instruction
//               subtracts, checked, from another balance: a transfer), saturating, or unchecked (wrapping)
//   divisions   divisions by a supply / balance-like value, and whether a zero / minimum check is on the way
//   proof       per-operation property checklist: the properties expected for the operation's kind, each
//               found / partial / runtime / not_found with its evidence
//   states      state machine: status / enum-like fields, the instructions setting them (to which values)
//               and the instructions checking them
// Conditions, operands and divisors come from the IR (paths.ts: edges dominating the operation across calls,
// values by their definitions); names and field kinds from the printed code. Per-operation budgets:
// DERIVED and OVER-APPROXIMATE like the rest of security/.
import type { Result } from '../decompile.ts'
import type { FnFacts, OpKind } from './facts.ts'
import type { Analysis, IxOut, OpOut, Loc, Status, IxCtx } from './report.ts'
import type { Expr, Stmt } from '../ir.ts'
import { walkExpr } from '../ir.ts'
import { stmtExprs } from '../simplify.ts'
import { cfgOf, blockPc, condKey, callOf, accountResolver, type Cfg } from './flow.ts'
import { sourceCtx } from './sources.ts'
import { irOf, pathTo, blockAt, checkAt, valueKey, cmpsOf, keyIn, follow, stmtAt, storedAt, defsIn, type IrCond } from './paths.ts'

export interface PathCond { at: Loc; cond: string; holds: boolean; how: 'branch' | 'exit-check' | 'loop' | 'before'; check?: number } // before: an earlier sibling if (either side may be taken)
export interface PathInfo { op: number; conds: PathCond[]; notRequired: { check: number; path?: Loc[] }[]; truncated?: boolean }
export interface ChainStep { kind: 'op' | 'signer' | 'pda' | 'stored' | 'writer' | 'none'; what: string; status?: string }
export interface Chain { op: number; steps: ChainStep[][] } // alternatives, each a chain from the operation back to a signer
export interface ArithSite { at: Loc; op?: number; target: string; expr: string; kind: 'add' | 'sub'; status: 'checked' | 'bounded' | 'saturating' | 'unchecked'; guard?: { at: Loc; cond: string }; caller?: boolean; unnamed?: boolean }
export interface DivSite { at: Loc; expr: string; divisor: string; status: 'checked' | 'not_found'; guard?: { at: Loc; cond: string } }
export interface Prop { prop: string; status: Status; evidence: string }
export interface Proof { op: number; kind: string; props: Prop[] }
export interface StateField { field: string; setBy: { ix: string; value: string; at: Loc }[]; checkedBy: { ix: string; cond: string; at: Loc }[] }

const VALUE_OPS: OpKind[] = ['TOKEN_TRANSFER', 'LAMPORT_TRANSFER', 'MINT', 'BURN', 'ACCOUNT_CLOSE', 'AUTHORITY_WRITE', 'OWNER_ASSIGN', 'PROGRAM_UPGRADE']
export const isValueOp = (o: OpOut) => o.kinds.some(k => VALUE_OPS.includes(k)) || (o.kinds.includes('LAMPORT_WRITE') && o.how === '-=')
const VALUE_FIELD = /amount|balance|lamports|supply|total|claimed|deposit|reserve|share|liquidity|fee|debt|collateral|stake|reward|fund|minted|burn|withdraw|borrow|owed|volume|principal|interest|vault|pot|prize|payout|bet|tokens?\b/i
const SUPPLY = /supply|shares|total|balance|reserve|liquidity|deposit|lamports|staked|tvl|pool_token|\.amount\b|_amount\b|virtual/i
const STATUS_FIELD = /(^|_)(status|state|phase|stage|initiali[sz]ed|active|paused|frozen|closed|locked|enabled|started|ended|finished|settled|resolved|mode)$|(^|\.)is_[a-z_]+$/i

// ---- per-function text (the operations' lines; the close evidence) ----

interface FnText { ff: FnFacts; lineAt: (line: number) => number | undefined }
const fnMemo = new WeakMap<Result, Map<string, FnText>>()
function fnText(r: Result): Map<string, FnText> {
	let m = fnMemo.get(r)
	if (m) return m
	m = new Map()
	for (const ff of r.facts.values()) {
		let inv: Map<number, number> | undefined
		m.set(ff.name, { ff, lineAt: line => { if (!inv) { inv = new Map(); for (const [pc, l] of ff.pcLine) if (!inv.has(l) || inv.get(l)! > pc) inv.set(l, pc) } return inv.get(line) } })
	}
	fnMemo.set(r, m)
	return m
}
const ixText = new WeakMap<IxOut, Map<string, FnText>>()

/** the printed line of a branching block's condition: its `if` / loop (by the condition, else its shape up to negation), else the block's last statement */
const lineMemo = new WeakMap<FnFacts, Map<string, number>>()
function condLineOf(ff: FnFacts, g: Cfg, c: IrCond): number {
	const l = ff.condLine.get(c.c)
	if (l !== undefined) return l
	let m = lineMemo.get(ff)
	if (!m) { m = new Map(); for (const [e, x] of ff.condLine) { const k = condKey(e); if (!m.has(k)) m.set(k, x) } lineMemo.set(ff, m) }
	const k = m.get(condKey(c.c))
	if (k !== undefined) return k
	const bl = g.fo.f.blocks[c.b]
	for (const pc of [bl.stmts[bl.stmts.length - 1]?.pc, ...(bl.term.k === 'br' ? [g.fo.f.blocks[bl.term.t].stmts[0]?.pc] : [])]) { const x = pc === undefined ? undefined : ff.pcLine.get(pc); if (x !== undefined) return x }
	return ff.at + 1
}

type IrT = ReturnType<typeof irOf>
const isConst = (k: string) => k.startsWith('#')

/** the pc of the statement at a position */
const stmtOfPos = (I: IrT, fn: number, p: number): Stmt | undefined => I.byPc.get(fn)?.f.blocks[p >> 16]?.stmts[p & 0xffff]

/** where a value comes from, as printed: the expression, its variables' definitions, frame slots' stores, parameters' arguments up the call path */
function provenance(I: IrT, ctx: IxCtx | undefined, fn: number, e: Expr, p: number): string[] {
	const out: string[] = []
	const add = (f: number, x: Expr) => { const t = I.r.facts.get(f)?.expr?.(x)?.trim(); if (t && !out.includes(t)) out.push(t) }
	add(fn, e)
	for (let k = 0; k < 12; k++) {
		const [x, q] = follow(I, fn, e, p, 1)
		if (x !== e) { e = x; p = q; add(fn, e); continue }
		// (a parameter: the argument at the call site)
		const D = defsIn(I, fn), v = e.k === 'var' ? I.byPc.get(fn)?.f.vars[e.id] : undefined
		if (e.k === 'var' && v && v.param >= 1 && v.param !== 10 && D && !D.defs.has(e.id) && !D.multi.has(e.id)) {
			const par = !ctx || fn === ctx.handler ? undefined : ctx.parents.get(fn)
			const st = par?.pc !== undefined ? stmtAt(I, par.fn, par.pc) : undefined
			const c = st && callOf(st[0])
			const i = v.param < 100 ? v.param - 1 : 4 + (v.param - 100)
			if (c && c.args[i]) { e = c.args[i]; p = st![1]; fn = par!.fn; add(fn, e); continue }
		}
		// (a load: where its address comes from)
		const a = e.k === 'load' ? e.addr : undefined
		const b = a?.k === 'bin' && a.op === 'add' && a.b.k === 'const' ? a.a : a
		if (b?.k === 'var') { const [y, q2] = follow(I, fn, b, p, 1); if (y !== b) { add(fn, y); e = y; p = q2; continue } }
		break
	}
	return out.slice(0, 12)
}

// ---- per instruction ----

const divMemo = new WeakMap<object, { bi: number; si: number; s: Stmt; cands: [Expr, boolean][] }[]>()
/** a function's statements dividing by a non-constant (the divisors; wide: a 128-bit division helper's), in block order */
function divCands(r: Result, f: { blocks: { stmts: Stmt[] }[] }): { bi: number; si: number; s: Stmt; cands: [Expr, boolean][] }[] {
	let out = divMemo.get(f)
	if (out) return out
	out = []
	f.blocks.forEach((bl, bi) => bl.stmts.forEach((s, si) => {
		const cands: [Expr, boolean][] = []
		for (const e of stmtExprs(s)) walkExpr(e, x => { if (x.k === 'bin' && (x.op === 'udiv' || x.op === 'sdiv' || x.op === 'sdiv32') && x.b.k !== 'const') cands.push([x.b, false]) })
		const c = callOf(s)
		if (c?.t.k === 'fn' && /^__u?divti3/.test(r.program.funcs.get(c.t.pc)?.name ?? '') && c.args[3] && c.args[3].k !== 'const') cands.push([c.args[3], true])
		if (cands.length) out!.push({ bi, si, s, cands })
	}))
	divMemo.set(f, out)
	return out
}

export function phase3Ix(r: Result, ix: IxOut, a: Analysis) {
	const T = fnText(r), I = irOf(r), ctx = ix.ctx
	ixText.set(ix, T)
	const loc = (fn: string, line: number): Loc => ({ fn, line, pc: T.get(fn)?.lineAt(line) })
	const byName = new Map([...r.facts.values()].map(f => [f.name, f]))
	const text = (fn: number, e: Expr) => (r.facts.get(fn)?.expr?.(e) ?? '?').slice(0, 120)
	/** a condition of the IR as the report shows it */
	const shown = (c: IrCond): PathCond => {
		const ff = r.facts.get(c.fn)!, g = cfgOf(I.byPc.get(c.fn)!)
		const check = checkAt(I, ix, c.fn, c.b)
		const how: PathCond['how'] = c.how === 'branch' && check !== undefined ? 'exit-check' : c.how
		return { at: { fn: ff.name, line: condLineOf(ff, g, c), pc: blockPc(g, c.b) }, cond: ff.expr?.(c.c) ?? '?', holds: c.holds ?? false, how, check }
	}
	const guardOf = (c: IrCond) => ({ at: shown(c).at, cond: text(c.fn, c.c) })
	const S = sourceCtx(r, ix)
	const callerCtl = (fn: number, e: Expr, p: number) => S.of(fn, e, p).some(x => x.kind === 'ix')
	// arithmetic on value paths: the sum / difference an operation stores (IR), its operands by value identity
	const arith: ArithSite[] = []
	const keysOf = new Map<number, [boolean, string][]>() // site -> its operands' keys, [subtracted, key]
	const site = (fn: number, v: Expr, p: number, target: string, op: number | undefined, unnamed: boolean) => {
		const ff = r.facts.get(fn)
		if (!ff || arith.length >= 40) return
		const [e, q] = follow(I, fn, v, p)
		const line = ff.pcLine.get(stmtOfPos(I, fn, q)?.pc ?? -1) ?? ff.pcLine.get(stmtOfPos(I, fn, p)?.pc ?? -1) ?? ff.at + 1
		if (e.k === 'fn' && e.name === 'sat_sub') { arith.push({ at: loc(ff.name, line), op, target, expr: text(fn, e), kind: 'sub', status: 'saturating', unnamed: unnamed || undefined }); return }
		if (e.k !== 'bin' || (e.op !== 'add' && e.op !== 'sub')) return
		// (the terms of the sum: [subtracted, term])
		const terms: [boolean, Expr][] = []
		const flat = (x: Expr, neg: boolean, d: number) => { if (d < 6 && x.k === 'bin' && (x.op === 'add' || x.op === 'sub')) { flat(x.a, neg, d + 1); flat(x.b, x.op === 'sub' ? !neg : neg, d + 1) } else terms.push([neg, x]) }
		flat(e, false, 0)
		const vars = terms.map(([n, x]) => [n, valueKey(I, ctx, fn, x, q)] as [boolean, string]).filter(([, k]) => !isConst(k))
		// (an address: a frame object plus an offset)
		if (!vars.length || vars.some(([, k]) => /^fp\d+$/.test(k))) return
		const kind = terms.some(([n]) => n) ? 'sub' : 'add'
		const sum = valueKey(I, ctx, fn, e, q)
		let g: IrCond | undefined, bounded: IrCond | undefined
		for (const c of pathTo(I, ctx, fn, p >> 16, 80)) {
			const cm = cmpsOf(I, ctx, c.fn, c.c, c.pos)
			if (!cm.length) continue
			const K = cm.map(x => `(${x.join(' ')})`).join(' ')
			// (a comparison of every operand, or of the result with one of them: an overflow check)
			if (vars.every(([, k]) => keyIn(K, k)) || (keyIn(K, sum) && vars.some(([, k]) => keyIn(K, k)))) { g = c; break }
			// (each subtracted operand bounded by another value on every path, e.g. an amount checked against a balance:
			// the difference relies on an invariant between the two values)
			if (!bounded && c.how !== 'before' && kind === 'sub' && vars.filter(([n]) => n).every(([, k]) => cm.some(([, x, y]) => (x === k && !isConst(y)) || (y === k && !isConst(x))))) bounded = c
		}
		const gc = g ?? bounded
		keysOf.set(arith.length, vars)
		arith.push({ at: loc(ff.name, line), op, target, expr: text(fn, e), kind, status: g ? 'checked' : bounded ? 'bounded' : 'unchecked', guard: gc && guardOf(gc), caller: callerCtl(fn, e, q) || undefined, unnamed: unnamed || undefined })
	}
	ix.ops.forEach((o, oi) => {
		const fn = o.fnPc
		if (fn === undefined) return
		const x = o.at.pc !== undefined ? storedAt(I, fn, o.at.pc) : undefined
		if (x && o.kinds.includes('LAMPORT_WRITE') && o.value && !o.kinds.includes('ACCOUNT_CLOSE')) site(fn, x[0], x[1], o.target ?? '?', oi, false)
		else if (x && o.kinds.includes('ACCOUNT_DATA_WRITE') && o.value && o.target) {
			const f = o.target.split('.').slice(1).join('.')
			const unnamed = /^data\[/.test(f)
			if (VALUE_FIELD.test(f) || (unnamed && o.how !== '=')) site(fn, x[0], x[1], o.target, oi, unnamed)
			else if (unnamed && /^data\[\d+\.\.\d+\]$/.test(f)) { const [lo, hi] = f.slice(5, -1).split('..').map(Number); if (hi - lo === 8) site(fn, x[0], x[1], o.target, oi, true) }
		}
		// (a CPI's amount: the call's argument printed as the field's value)
		const cs = o.cpi?.fields.length && o.at.pc !== undefined ? stmtAt(I, fn, o.at.pc) : undefined
		const call = cs && callOf(cs[0])
		const ff = r.facts.get(fn)
		if (call && ff?.expr) for (const [k, v] of o.cpi!.fields) {
			if (!/amount|lamports|quantity/i.test(k)) continue
			const arg = call.args.find(y => ff.expr!(y) === v.replace(/ \[ix data\?\]$/, ''))
			if (arg) site(fn, arg, cs![1], `${o.cpi!.program}.${o.cpi!.ix ?? '?'}.${k}`, oi, false)
		}
	})
	// (value conserved: an addition of an amount the instruction subtracts from another balance with a check on the way, e.g.
	// a transfer between two accounts: the sum of the balances stays within the total (a supply))
	arith.forEach((x, i) => {
		if (x.status !== 'unchecked' || x.kind !== 'add') return
		const ks = keysOf.get(i) ?? []
		const j = arith.findIndex((y, k) => (y.status === 'checked' || y.status === 'bounded') && y.kind === 'sub' && (keysOf.get(k) ?? []).some(([n, key]) => n && ks.some(([, a]) => a === key)))
		if (j >= 0) { x.status = 'bounded'; x.guard = arith[j].guard && { at: arith[j].guard!.at, cond: `${arith[j].guard!.cond} (the amount is subtracted from ${arith[j].target}: a transfer)` } }
	})
	ix.arith = arith
	// divisions by a supply / balance-like value (IR: udiv / sdiv, the 128-bit division helpers)
	const divs: DivSite[] = []
	for (const fname of ix.functions) {
		const ff = byName.get(fname), fo = ff && I.byPc.get(ff.pc)
		if (!ff || !fo || divs.length >= 20) continue
		const g = cfgOf(fo)
		const R = !r.anchor ? accountResolver(fo, { f: x => I.byPc.get(x)?.f, name: x => r.program.funcs.get(x)?.name ?? '', legacy: r.legacyInfo }) : undefined
		for (const { bi, si, s, cands } of divCands(r, fo.f)) {
			if (g.rpo[bi] < 0 || divs.length >= 20 || (ctx?.restricted?.has(ff.pc) && ctx.allowed && !ctx.allowed(ff.pc, bi))) continue
			{
				const p = bi << 16 | si
				for (const [dv, wide] of cands) {
					const seen = provenance(I, ctx, ff.pc, dv, p)
					// (a supply-like name, or a 128-bit product divided by a value read from an account's data)
					let acct = false
					if (wide && !seen.some(x => SUPPLY.test(x))) {
						const [fe, fq] = follow(I, ff.pc, dv, p)
						acct = fe.k === 'load' && (R ? /^data/.test(R.valueRef(fe, stmtOfPos(I, ff.pc, fq) ?? s)?.field ?? '') : seen.some(x => /\bld(?:32|64)\(accounts\b|\.accounts\.|[A-Za-z_]\w*\.(?!data\b)[a-z_]\w*\)?$/.test(x)))
					}
					if (!seen.some(x => SUPPLY.test(x)) && !acct) continue
					const k = valueKey(I, ctx, ff.pc, dv, p)
					if (isConst(k)) continue
					// (a guard: required on the way (one side of it does not reach the division), comparing the divisor; not the
					// division-by-zero panic the compiler inserts: a side that aborts rather than returning an error)
					const gc = pathTo(I, ctx, ff.pc, bi, 80).find(x => x.how !== 'before' && !x.panics && cmpsOf(I, ctx, x.fn, x.c, x.pos).some(([, u, v]) => keyIn(u, k) || keyIn(v, k)))
					const line = ff.pcLine.get(s.pc) ?? ff.at + 1
					divs.push({ at: loc(ff.name, line), expr: ff.lines[line - 1]?.trim().slice(0, 140) ?? '', divisor: seen.join(' ← ').slice(0, 160), status: gc ? 'checked' : 'not_found', guard: gc && guardOf(gc) })
				}
			}
		}
	}
	ix.divs = divs
	// path conditions to the sensitive operations
	const paths: PathInfo[] = []
	ix.ops.forEach((o, oi) => {
		if (paths.length >= 30 || !o.kinds.some(k => k !== 'PDA_DERIVE') || (o.kinds.length === 1 && o.kinds[0] === 'CPI' && o.cpi?.known) || o.fnPc === undefined) return
		const all = pathTo(I, ctx, o.fnPc, blockAt(I, o.fnPc, o.at.pc, o.ret), 80).filter(c => c.how !== 'before')
		const conds = all.slice(0, 40).map(shown)
		const acct = new Set([o.target?.split('.')[0], ...(o.cpi?.accounts ?? []).map(x => /^\*?([A-Za-z_]\w*)/.exec(x.text)?.[1])].filter(Boolean) as string[])
		const req = new Set(conds.map(c => c.check).filter(x => x !== undefined))
		const notRequired: PathInfo['notRequired'] = []
		ix.checks.forEach((c, ci) => {
			if (notRequired.length >= 6 || o.guards?.includes(ci) || req.has(ci)) return
			if (!c.kinds.some(k => ['signer', 'owner', 'key', 'address', 'has_one', 'pda', 'custom', 'state', 'raw'].includes(k))) return
			if (!(c.kinds.includes('signer') || (c.account && acct.has(c.account.replace(/\?$/, ''))))) return
			if (!o.guards) return
			notRequired.push({ check: ci, path: o.bypass?.find(b => b.check === ci)?.path })
		})
		paths.push({ op: oi, conds, notRequired, truncated: all.length > 40 || undefined })
	})
	ix.paths = paths
	ix.chains = chains(ix, a)
	ix.proof = proofs(ix)
}

// ---- authorization chains ----

function chains(ix: IxOut, a: Analysis): Chain[] {
	const out: Chain[] = []
	const signersOf = (name: string) => a.ixs.find(x => x.name === name)?.accounts.filter(y => y.constraints.signer && y.constraints.signer.status !== 'not_found').map(y => `${y.name} (${y.constraints.signer.status})`) ?? []
	for (const row of ix.authority ?? []) {
		const alts: ChainStep[][] = []
		const head: ChainStep = { kind: 'op', what: `${row.kind} ${ix.ops[row.op].target ?? ''}`.trim() }
		for (const e of row.enabledBy) {
			if (e.kind === 'signer' && row.enabledBy.some(x => x.kind === 'stored' && x.what.startsWith(`${e.what}.key`))) continue
			const steps: ChainStep[] = [head]
			if (e.kind === 'stored') {
				const [sg, field] = e.what.split(' == ')
				steps.push({ kind: 'signer', what: sg.replace(/\.key$/, ''), status: row.enabledBy.find(x => x.kind === 'signer' && x.what === sg.replace(/\.key$/, ''))?.status }, { kind: 'stored', what: `${field} == ${sg}`, status: e.status })
				for (const w of (e.writtenBy ?? []).slice(0, 4)) steps.push({ kind: 'writer', what: `${field} written by ${w}${w === ix.name ? ' (this instruction)' : ''}; signers there: ${signersOf(w).join(', ') || 'none found'}` })
				if (!e.writtenBy?.length) steps.push({ kind: 'writer', what: `${field}: no instruction writing it found (set at creation, or outside the recognized writes)` })
			} else steps.push({ kind: e.kind, what: e.what, status: e.status })
			alts.push(steps)
		}
		out.push({ op: row.op, steps: alts.slice(0, 6) })
	}
	return out
}

// ---- proof trees ----

const bestOf = (ss: (Status | undefined)[]): Status => (['found', 'runtime', 'partial'] as Status[]).find(s => ss.includes(s)) ?? 'not_found'

function proofs(ix: IxOut): Proof[] {
	const out: Proof[] = []
	const row = (n?: string) => n ? ix.accounts.find(x => x.name === n) : undefined
	const nameOf = (t?: string) => t ? /^\*?([A-Za-z_]\w*(?:\[\d+\])?)/.exec(t)?.[1] : undefined
	const cst = (n: string | undefined, ks: string[]) => { const x = row(n); return x ? bestOf(ks.map(k => x.constraints[k]?.status)) : 'not_found' }
	const ev = (n: string | undefined, ks: string[]) => { const x = row(n); if (!x) return n ? `${n}: not an identified account` : 'account not identified'; const f = ks.filter(k => x.constraints[k] && x.constraints[k].status !== 'not_found'); return f.length ? `${n}: ${f.map(k => `${k} ${x.constraints[k].status}`).join(', ')}` : `${n}: no ${ks.join(' / ')} check found` }
	const rel = (n: string | undefined) => n ? (ix.relations ?? []).filter(x => x.a.startsWith(`${n}.`) || x.b.startsWith(`${n}.`)) : []
	const bound = (n: string | undefined, extra: string[] = []): Prop['status'] => { const s = cst(n, ['pda', 'address', 'key', 'has_one', 'associated', ...extra]); return s !== 'not_found' ? s : rel(n).length ? bestOf(rel(n).map(x => x.status)) : 'not_found' }
	const boundEv = (n: string | undefined, extra: string[] = []) => `${ev(n, ['pda', 'address', 'key', 'has_one', 'associated', ...extra])}${rel(n).length ? `; relations: ${rel(n).slice(0, 3).map(x => `${x.a} == ${x.b} (${x.status})`).join(', ')}` : ''}`
	const authOf = (oi: number): Prop => {
		const a = ix.authority?.find(x => x.op === oi)
		const en = a?.enabledBy ?? []
		const st = bestOf(en.map(e => e.kind === 'pda' ? 'found' : e.kind === 'none' ? undefined : e.status as Status))
		return { prop: 'authorized (signer / PDA signature / stored authority)', status: st, evidence: en.map(e => `${e.kind} ${e.what}${e.status ? ` (${e.status})` : ''}`).join('; ').slice(0, 200) || 'none found' }
	}
	const stored = (oi: number): Prop => {
		const en = ix.authority?.find(x => x.op === oi)?.enabledBy ?? []
		const s = en.filter(e => e.kind === 'stored' || e.kind === 'pda')
		return { prop: 'signer related to a stored authority (or PDA signature)', status: s.length ? bestOf(s.map(e => e.kind === 'pda' ? 'found' : e.status as Status)) : 'not_found', evidence: s.map(e => e.what).join('; ').slice(0, 200) || 'no relation between a signer key and a stored field found' }
	}
	const dom = (o: OpOut): Prop => ({ prop: 'relevant checks on every path', status: o.bypass?.length ? 'partial' : o.guards ? 'found' : 'not_found', evidence: o.bypass?.length ? `${o.bypass.length} relevant check(s) do not dominate it` : o.guards ? `${o.guards.length} dominating checks` : 'dominance not computed (operation not placed in the CFG)' })
	const amount = (o: OpOut, oi: number): Prop | undefined => {
		const ar = (ix.arith ?? []).filter(x => x.op === oi)
		const src = (o.sources ?? []).filter(s => /amount|lamports|quantity/i.test(s.param) || s.param === o.target)
		if (!ar.length && !src.length) return undefined
		const bad = ar.filter(x => x.status === 'unchecked')
		return { prop: 'amount arithmetic checked', status: bad.length ? 'not_found' : ar.length ? 'found' : 'partial', evidence: [...ar.map(x => `${x.expr} (${x.status})`), ...src.map(s => `${s.param} ← ${s.source} (${s.trust})`)].join('; ').slice(0, 200) }
	}
	ix.ops.forEach((o, oi) => {
		if (out.length >= 16) return
		const k = o.kinds
		const acc = (role: RegExp) => nameOf(o.cpi?.accounts.find(x => x.role && role.test(x.role))?.text)
		const props: (Prop | undefined)[] = []
		let kind = ''
		if (k.includes('TOKEN_TRANSFER')) {
			kind = 'TOKEN_TRANSFER'
			const src = acc(/^(source|from)/), dst = acc(/^(destination|to)/)
			props.push(authOf(oi), stored(oi),
				{ prop: 'source account bound', status: bound(src, ['token_owner']), evidence: boundEv(src, ['token_owner']) },
				{ prop: 'destination bound (owner / mint / key)', status: bound(dst, ['token_owner', 'token_mint']), evidence: boundEv(dst, ['token_owner', 'token_mint']) },
				{ prop: 'mints consistent', status: o.cpi?.ix === 'Transfer' || o.cpi?.ix === 'TransferChecked' ? 'runtime' : 'not_found', evidence: 'the token program requires source and destination of the same mint' },
				{ prop: 'token program id', status: o.cpi?.known ? 'found' : /\(id compared with/.test(o.cpi?.checked ?? '') ? 'found' : 'not_found', evidence: o.cpi?.known ? `constant ${o.cpi.program}` : o.cpi?.checked ?? 'account-supplied' },
				amount(o, oi), dom(o))
		} else if (k.includes('MINT') || k.includes('BURN')) {
			kind = k.includes('MINT') ? 'MINT' : 'BURN'
			const auth = acc(/authority|owner/), mint = acc(/^mint/), dst = acc(/^(account|destination|to)/)
			props.push({ prop: `${kind === 'MINT' ? 'mint' : 'burn'} authority is a signer or PDA`, status: o.cpi?.seeds ? 'found' : cst(auth, ['signer']), evidence: o.cpi?.seeds ? `PDA signature ${o.cpi.seeds}` : ev(auth, ['signer']) },
				{ prop: 'mint account bound', status: bound(mint), evidence: boundEv(mint) },
				{ prop: 'token account bound', status: bound(dst, ['token_owner', 'token_mint']), evidence: boundEv(dst, ['token_owner', 'token_mint']) },
				amount(o, oi), dom(o))
		} else if (k.includes('LAMPORT_TRANSFER') || (k.includes('LAMPORT_WRITE') && !k.includes('ACCOUNT_CLOSE'))) {
			kind = k.includes('LAMPORT_TRANSFER') ? 'LAMPORT_TRANSFER' : `LAMPORT_WRITE ${o.how ?? ''}`.trim()
			const from = k.includes('LAMPORT_TRANSFER') ? acc(/^from/) : o.how === '-=' ? nameOf(o.target) : undefined
			const to = k.includes('LAMPORT_TRANSFER') ? acc(/^to/) : o.how === '+=' ? nameOf(o.target) : undefined
			if (from) props.push({ prop: 'debited account authorized (signer / PDA / owned by the program)', status: o.cpi?.seeds ? 'found' : k.includes('LAMPORT_TRANSFER') ? cst(from, ['signer']) : bestOf([cst(from, ['owner']), 'runtime']), evidence: o.cpi?.seeds ? `PDA signature ${o.cpi.seeds}` : k.includes('LAMPORT_TRANSFER') ? ev(from, ['signer']) : 'direct lamport debit: the runtime requires the program to own the account' })
			if (isValueOp(o) || k.includes('LAMPORT_TRANSFER')) props.push(authOf(oi))
			if (to) props.push({ prop: 'recipient bound', status: bound(to, ['signer']), evidence: boundEv(to, ['signer']) })
			props.push(amount(o, oi), dom(o))
		} else if (k.includes('ACCOUNT_CLOSE')) {
			kind = 'ACCOUNT_CLOSE'
			const t = nameOf(o.target) ?? acc(/^account/)
			const z = closeZeroing(ix, oi)
			props.push(authOf(oi), { prop: 'data zeroed / closed discriminator / owner reassigned', status: z.zeroed ? 'found' : o.cpi?.known ? 'runtime' : 'not_found', evidence: z.zeroed ?? (o.cpi?.known ? `closed by ${o.cpi.program}` : `no zeroing, discriminator write, realloc(0) or assign of ${t ?? 'the account'} found in the instruction`) },
				{ prop: 'not reopened (no realloc after the close)', status: z.revived ? 'not_found' : 'found', evidence: z.revived ?? 'no realloc after it in the instruction' }, dom(o))
		} else if (k.includes('AUTHORITY_WRITE')) {
			kind = 'AUTHORITY_WRITE'
			const src = (o.sources ?? []).find(s => s.param === o.target)
			props.push(authOf(oi), stored(oi), { prop: 'new value validated', status: !src ? 'partial' : src.trust === 'caller-controlled' ? 'not_found' : src.trust === 'validated' ? 'found' : 'partial', evidence: src ? `${src.source} (${src.trust})` : `value ${o.value ?? '?'}` }, dom(o))
		} else if (k.includes('ACCOUNT_DATA_WRITE')) {
			if (out.filter(p => p.kind === 'ACCOUNT_DATA_WRITE').length >= 6) return
			kind = 'ACCOUNT_DATA_WRITE'
			const t = nameOf(o.target)
			const sig = ix.accounts.some(x => x.constraints.signer && x.constraints.signer.status !== 'not_found')
			const gate = (o.guards ?? []).map(i => ix.checks[i]).filter(c => c.kinds.some(x => ['signer', 'has_one', 'key', 'address', 'pda', 'custom', 'state', 'raw'].includes(x)))
			props.push({ prop: 'account owned by the program', status: bestOf([cst(t, ['owner']), 'runtime']), evidence: 'data written: the runtime rejects writes by a non-owner program' },
				{ prop: 'account type (discriminator)', status: cst(t, ['discriminator']), evidence: ev(t, ['discriminator']) },
				{ prop: 'write gated (signer / constraint)', status: gate.length ? 'found' : sig ? 'partial' : 'not_found', evidence: gate.length ? gate.slice(0, 3).map(c => `${c.kinds.join('/')} ${c.account ?? ''} ${c.at.fn}:${c.at.line}`).join('; ') : sig ? 'a signer is checked, but no gating check found to dominate the write' : 'no signer and no gating constraint found' },
				amount(o, oi))
		} else if (k.includes('CPI') && o.cpi && !o.cpi.known && o.cpi.program !== '?') {
			kind = 'CPI (account-supplied program)'
			props.push({ prop: 'program id checked', status: /\(id compared with/.test(o.cpi.checked ?? '') ? 'found' : 'not_found', evidence: o.cpi.checked ?? 'no check found' },
				{ prop: 'no PDA signature lent to it', status: o.cpi.seeds ? 'not_found' : 'found', evidence: o.cpi.seeds ? `signs with ${o.cpi.seeds}` : 'no signer seeds' }, dom(o))
		} else return
		out.push({ op: oi, kind, props: props.filter((p): p is Prop => !!p) })
	})
	return out
}

/** for a close: evidence the data is zeroed (and of a realloc after it, which could revive the account) */
export function closeZeroing(ix: IxOut, oi: number): { zeroed?: string; revived?: string } {
	const o = ix.ops[oi], t = o.target?.split('.')[0]
	const res: { zeroed?: string; revived?: string } = {}
	ix.ops.forEach((x, i) => {
		if (i === oi) return
		const same = !t || !x.target || x.target.split('.')[0] === t
		if (!same) return
		if (x.kinds.includes('OWNER_ASSIGN')) res.zeroed ??= `owner reassigned ${x.at.fn}:${x.at.line}`
		if (x.kinds.includes('ACCOUNT_REALLOC') && /realloc\([^,]+, [^,]+, 0\b|space: 0\b/.test(x.text)) res.zeroed ??= `realloc to 0 ${x.at.fn}:${x.at.line}`
		else if (x.kinds.includes('ACCOUNT_REALLOC') && (x.at.fn !== o.at.fn || x.at.line > o.at.line)) res.revived ??= `${x.text.slice(0, 80)} (${x.at.fn}:${x.at.line})`
		if (x.kinds.includes('ACCOUNT_DATA_WRITE') && x.target && /discriminator|data\[0\.\.|\.data$/.test(x.target)) res.zeroed ??= `discriminator written ${x.at.fn}:${x.at.line}`
	})
	if (!res.zeroed && /memset|fill\(/.test(o.text)) res.zeroed = 'memset in the close'
	// (the closing function reassigns / resizes the account: AccountInfo::assign / realloc, e.g. anchor_lang::common::close)
	const cf = ixText.get(ix)?.get(o.at.fn)?.ff
	if (!res.zeroed && cf?.lines.some(l => /\bAccountInfo_(assign|realloc|resize)\w*\(/.test(l))) res.zeroed = `AccountInfo::assign / realloc in ${o.at.fn}`
	return res
}

// ---- state machine ----

const ACC_INFO = /^(key|owner|lamports|data|data_len|is_signer|is_writable|executable|rent_epoch|len)$/
const SMALL = /^(0x[0-9a-f]{1,2}|\d{1,3}|true|false)$/i

/** `acct.field` / native `account[i].data[a..a+1]` compared with a small constant in a condition */
function stateRefs(cond: string, ix: IxOut): string[] {
	const out: string[] = []
	const nm = (a: string) => a.replace(/^accounts\./, '')
	for (const m of cond.matchAll(/((?:accounts\.)?[A-Za-z_]\w*(?:\[\d+\])?)\.([a-z_][a-z0-9_]*)\s*(?:==|!=|<=|>=|<|>)\s*(-?(?:0x[0-9a-f]+|\d+)|true|false)\b/gi)) if (!ACC_INFO.test(m[2]) && SMALL.test(m[3])) out.push(`${nm(m[1])}.${m[2]}`)
	for (const m of cond.matchAll(/(-?(?:0x[0-9a-f]+|\d+))\s*(?:==|!=|<=|>=|<|>)\s*((?:accounts\.)?[A-Za-z_]\w*(?:\[\d+\])?)\.([a-z_][a-z0-9_]*)\b(?!\()/gi)) if (!ACC_INFO.test(m[3]) && SMALL.test(m[1])) out.push(`${nm(m[2])}.${m[3]}`)
	for (const m of cond.matchAll(/ld8\(input\.acc(\d+)\.data \+ (0x[0-9a-f]+)\)(?:\s*(?:==|!=|<=|>=|<|>)\s*(0x[0-9a-f]{1,2}|\d{1,3})\b)?/g)) if (m[3] !== undefined) {
		const i = Number(m[1]), off = Number(m[2])
		out.push(`${ix.accounts.find(x => x.index === i)?.name ?? `account[${i}]`}.data[${off}..${off + 1}]`)
	}
	return out
}

/**
 * Status / enum-like fields: fields set to small constants (named like a status, or single bytes of a
 * native layout) and fields compared with small constants in checks / branch conditions; per field, the
 * instructions setting it (values) and checking it (conditions): the eligibility table of the state machine.
 */
export function stateMachine(a: Analysis): StateField[] {
	const out = new Map<string, StateField>()
	const get = (t: string) => { let s = out.get(t); if (!s) out.set(t, (s = { field: t, setBy: [], checkedBy: [] })); return s }
	const writes: [string, IxOut, OpOut][] = []
	for (const ix of a.ixs) for (const o of ix.ops) {
		if (!o.kinds.includes('ACCOUNT_DATA_WRITE') || !o.target || o.how !== '=' || o.value === undefined || !SMALL.test(o.value.trim())) continue
		writes.push([o.target, ix, o])
	}
	const checks: [string, IxOut, string, Loc][] = []
	for (const ix of a.ixs) {
		for (const c of ix.checks) for (const t of stateRefs(c.cond, ix)) checks.push([t, ix, c.cond, c.at])
		for (const p of ix.paths ?? []) for (const c of p.conds) if (c.check === undefined) for (const t of stateRefs(c.cond, ix)) checks.push([t, ix, c.cond, c.at])
	}
	const checked = new Set(checks.map(x => x[0]))
	const isState = (t: string) => { const f = t.split('.').slice(1).join('.'); return STATUS_FIELD.test(f) || /^data\[(\d+)\.\.(\d+)\]$/.test(f) && checked.has(t) }
	for (const [t, ix, o] of writes) {
		if (!isState(t) && !checked.has(t)) continue
		const s = get(t), v = o.value!.trim()
		if (!s.setBy.some(x => x.ix === ix.name && x.value === v)) s.setBy.push({ ix: ix.name, value: v, at: o.at })
	}
	for (const [t, ix, cond, at] of checks) {
		if (!out.has(t) && !STATUS_FIELD.test(t.split('.').slice(1).join('.'))) continue
		const s = get(t)
		if (s.checkedBy.length < 24 && !s.checkedBy.some(x => x.ix === ix.name && x.cond === cond.slice(0, 100))) s.checkedBy.push({ ix: ix.name, cond: cond.slice(0, 100), at })
	}
	return [...out.values()].sort((x, y) => Number(!!y.setBy.length && !!y.checkedBy.length) - Number(!!x.setBy.length && !!x.checkedBy.length) || y.setBy.length + y.checkedBy.length - x.setBy.length - x.checkedBy.length || x.field.localeCompare(y.field)).slice(0, 40)
}
