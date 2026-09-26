// Program analysis, phase 3 (docs/ANALYSIS_SPEC.md): bounded, best-effort views over the phase 1/2 facts.
//   paths       the conditions on the way to each sensitive operation (enclosing branches and early-exit
//               checks before it, in its function and at the call sites up to the handler), and the
//               relevant checks that some path to it does not require
//   chains      backward authorization chains: operation -> signer / PDA signature / stored authority
//               field related to a signer -> the instructions writing that field -> their signers
//   arithmetic  additions / subtractions on value paths (amounts, balances, lamports): checked (a bound /
//               overflow check on the way), saturating, or unchecked (wrapping: sBPF arithmetic wraps)
//   divisions   divisions by a supply / balance-like value, and whether a zero / minimum check is on the way
//   proof       per-operation property checklist: the properties expected for the operation's kind, each
//               found / partial / runtime / not_found with its evidence
//   states      state machine: status / enum-like fields, the instructions setting them (to which values)
//               and the instructions checking them
// Everything is read off the printed code (indentation gives the structure of the statement tree) with
// per-operation budgets: DERIVED and OVER-APPROXIMATE like the rest of security/.
import type { Result } from '../decompile.ts'
import type { FnFacts, OpKind } from './facts.ts'
import type { Analysis, IxOut, OpOut, Loc, Status } from './report.ts'

export interface PathCond { at: Loc; cond: string; holds: boolean; how: 'branch' | 'exit-check' | 'loop' | 'before'; check?: number } // before: an earlier sibling if (either side may be taken)
export interface PathInfo { op: number; conds: PathCond[]; notRequired: { check: number; path?: Loc[] }[]; truncated?: boolean }
export interface ChainStep { kind: 'op' | 'signer' | 'pda' | 'stored' | 'writer' | 'none'; what: string; status?: string }
export interface Chain { op: number; steps: ChainStep[][] } // alternatives, each a chain from the operation back to a signer
export interface ArithSite { at: Loc; op?: number; target: string; expr: string; kind: 'add' | 'sub'; status: 'checked' | 'saturating' | 'unchecked'; guard?: { at: Loc; cond: string }; caller?: boolean; unnamed?: boolean }
export interface DivSite { at: Loc; expr: string; divisor: string; status: 'checked' | 'not_found'; guard?: { at: Loc; cond: string } }
export interface Prop { prop: string; status: Status; evidence: string }
export interface Proof { op: number; kind: string; props: Prop[] }
export interface StateField { field: string; setBy: { ix: string; value: string; at: Loc }[]; checkedBy: { ix: string; cond: string; at: Loc }[] }

const VALUE_OPS: OpKind[] = ['TOKEN_TRANSFER', 'LAMPORT_TRANSFER', 'MINT', 'BURN', 'ACCOUNT_CLOSE', 'AUTHORITY_WRITE', 'OWNER_ASSIGN', 'PROGRAM_UPGRADE']
export const isValueOp = (o: OpOut) => o.kinds.some(k => VALUE_OPS.includes(k)) || (o.kinds.includes('LAMPORT_WRITE') && o.how === '-=')
const VALUE_FIELD = /amount|balance|lamports|supply|total|claimed|deposit|reserve|share|liquidity|fee|debt|collateral|stake|reward|fund|minted|burn|withdraw|borrow|owed|volume|principal|interest|vault|pot|prize|payout|bet|tokens?\b/i
const SUPPLY = /supply|shares|total|balance|reserve|liquidity|deposit|lamports|staked|tvl|pool_token|\.amount\b|_amount\b|virtual/i
const STATUS_FIELD = /(^|_)(status|state|phase|stage|initiali[sz]ed|active|paused|frozen|closed|locked|enabled|started|ended|finished|settled|resolved|mode)$|(^|\.)is_[a-z_]+$/i
const CMP = /[<>]|[!=]=/
const EXIT = /^\s*(return\b|abort\(|trap\(|panic|throw\b)|anchor::\w|error::\w|\bErr\(|ProgramError::|sol_panic|anchor_error_from\(|panic_fmt/
const ind = (s: string) => { let i = 0; while (s.charCodeAt(i) === 9) i++; return i }
const ns = (s: string) => s.replace(/\s+/g, '')

// ---- per-function helpers (memoized per result) ----

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

/** the `if (…) {` condition of a line (also `} else if (…) {`), or undefined */
function ifCond(s: string): { cond: string; elseIf: boolean } | undefined {
	const m = /^\s*(\} else )?if \((.*)\) \{$/.exec(s)
	return m ? { cond: m[2], elseIf: !!m[1] } : undefined
}

/**
 * The conditions holding on every path to `line` of a function, read off the printed statement tree:
 * enclosing branches (with their polarity: then / else side, else-if chains), and earlier sibling `if`s
 * whose body exits (the path continues only when they do not hold). Bounded by `budget` lines.
 */
function condsIn(ff: FnFacts, line: number, budget: { lines: number }): PathCond[] {
	const L = ff.lines, out: PathCond[] = []
	if (line < 1 || line > L.length) return out
	let min = ind(L[line - 1]), chainInd = -1
	for (let i = line - 2; i >= ff.at && budget.lines-- > 0; i--) {
		const s = L[i], k = ind(s)
		if (k > min || !s.trim()) continue
		const at: Loc = { fn: ff.name, line: i + 1 }
		const ic = ifCond(s)
		if (k < min) {
			min = k
			if (/^\s*\} else \{$/.test(s)) { chainInd = k; continue }
			if (ic) { out.push({ at, cond: ic.cond, holds: true, how: 'branch' }); chainInd = ic.elseIf ? k : -1; continue }
			const w = /^\s*while \((.*)\) \{$/.exec(s)
			if (w) out.push({ at, cond: w[1], holds: true, how: 'loop' })
			chainInd = -1
			if (k === 0) break
			continue
		}
		// k === min
		if (chainInd === k && ic) { out.push({ at, cond: ic.cond, holds: false, how: 'branch' }); if (!ic.elseIf) chainInd = -1; continue }
		if (ic && !ic.elseIf) {
			// an earlier sibling `if` whose body (no else) exits: the path goes on when it does not hold
			let j = i + 1, last = ''
			for (; j < L.length && j < i + 400 && (ind(L[j]) > k || !L[j].trim()); j++) if (L[j].trim()) last = L[j]
			if (L[j]?.trim() === '}' && last && EXIT.test(last)) out.push({ at, cond: ic.cond, holds: false, how: 'exit-check' })
			else out.push({ at, cond: ic.cond, holds: false, how: 'before' })
		}
	}
	return out
}

/** conditions on the way to (fn, line), in its function and at the call sites up to the handler */
function pathConds(r: Result, ix: IxOut, fn: string, line: number, max = 40): { conds: PathCond[]; truncated: boolean } {
	const T = fnText(r), budget = { lines: 6000 }
	const conds: PathCond[] = []
	let cur: { fn: string; line: number } | undefined = { fn, line }
	for (let d = 0; cur && d < 8; d++) {
		const t = T.get(cur.fn)
		if (!t) break
		conds.push(...condsIn(t.ff, cur.line, budget))
		const par = ix.ctx?.parents.get(t.ff.pc)
		const pf = par && r.facts.get(par.fn)
		const pl = par?.pc !== undefined ? pf?.pcLine.get(par.pc) : undefined
		cur = pf && pl !== undefined ? { fn: pf.name, line: pl } : undefined
	}
	for (const c of conds) { const ci = ix.checks.findIndex(x => x.at.fn === c.at.fn && x.at.line === c.at.line); if (ci >= 0) c.check = ci }
	return { conds: conds.slice(0, max), truncated: conds.length > max || budget.lines <= 0 }
}

// ---- expressions (printed text) ----

/** top-level terms of a sum: [sign, text] (undefined when the expression is not a plain sum) */
function terms(e: string): [string, string][] | undefined {
	e = e.trim().replace(/ as [ui]\d+$/, '')
	const out: [string, string][] = []
	let depth = 0, start = 0, sign = '+'
	for (let i = 0; i < e.length; i++) {
		const c = e[i]
		if (c === '(' || c === '[') depth++
		else if (c === ')' || c === ']') depth--
		else if (depth === 0 && (c === '?' || c === '<' || c === '>' || c === '&' || c === '|' || c === '=' || c === '*' || c === '/')) return undefined
		else if (depth === 0 && (c === '+' || c === '-') && e[i - 1] === ' ' && e[i + 1] === ' ') { out.push([sign, e.slice(start, i).trim()]); sign = c; start = i + 1 }
	}
	out.push([sign, e.slice(start).trim()])
	return out.length > 1 ? out : undefined
}
const isConst = (t: string) => /^-?(0x[0-9a-f]+|\d+)$/i.test(t)
const mentions = (cond: string, t: string) => {
	const c = ns(cond), x = ns(t)
	for (let i = c.indexOf(x); i >= 0; i = c.indexOf(x, i + 1)) {
		const b = c[i - 1] ?? '', a = c[i + x.length] ?? ''
		if (!/[\w.]/.test(b) && !/[\w]/.test(a)) return true
	}
	return false
}

/** the defining expression of a local (`const x = …` / `x = …`) before a line, and its line */
function defOf(ff: FnFacts, name: string, before: number): { expr: string; line: number } | undefined {
	const re = new RegExp(`^\\s*(?:const |let )?${name}(?:: \\w+)? = (.+)$`)
	for (let i = before - 2, n = 0; i >= ff.at && n < 3000; i--, n++) { const m = re.exec(ff.lines[i]); if (m) return { expr: m[1], line: i + 1 } }
	return undefined
}

const paramMemo = new WeakMap<FnFacts, string[]>()
function paramsOf(ff: FnFacts): string[] {
	let p = paramMemo.get(ff)
	if (!p) {
		const sig = ff.lines.find(l => /^(export )?function /.test(l))
		const m = sig && /\((.*)\)/.exec(sig)
		p = m ? m[1].split(', ').map(x => x.split(':')[0].trim()) : []
		paramMemo.set(ff, p)
	}
	return p
}

/** the top-level arguments of the call whose parenthesis is at `open` */
function argsAt(s: string, open: number): string[] {
	const out: string[] = []
	let depth = 0, start = open + 1
	for (let i = open; i < s.length; i++) {
		const c = s[i]
		if (c === '(' || c === '[') depth++
		else if (c === ')' || c === ']') { if (--depth === 0) { out.push(s.slice(start, i).trim()); return out } }
		else if (c === ',' && depth === 1) { out.push(s.slice(start, i).trim()); start = i + 1 }
	}
	return out
}

/** calls to function `fn` in the functions of an instruction: [caller, line, arguments] (bounded) */
function callsTo(ix: IxOut, fn: string): [string, number, string[]][] {
	const out: [string, number, string[]][] = []
	const T = ixText.get(ix)
	if (!T) return out
	for (const f of ix.functions) {
		const ff = T.get(f)?.ff
		if (!ff) continue
		for (let i = ff.at; i < ff.lines.length && out.length < 4; i++) {
			const k = ff.lines[i].indexOf(`${fn}(`)
			if (k < 0 || /\w/.test(ff.lines[i][k - 1] ?? '') || /^(export )?function /.test(ff.lines[i])) continue
			out.push([f, i + 1, argsAt(ff.lines[i], k + fn.length)])
		}
	}
	return out
}
const ixText = new WeakMap<IxOut, Map<string, FnText>>()

// ---- per instruction ----

export function phase3Ix(r: Result, ix: IxOut, a: Analysis) {
	const T = fnText(r)
	ixText.set(ix, T)
	const loc = (fn: string, line: number): Loc => ({ fn, line, pc: T.get(fn)?.lineAt(line) })
	// arithmetic on value paths
	const arith: ArithSite[] = []
	const argNames = (r.instructions.find(i => i.name === ix.name)?.args ?? []).map(s => s.split(':')[0].trim())
	const callerCtl = (s: string) => /\[ix data\?\]|ix_args|ix_data/.test(s) || argNames.some(g => new RegExp(`\\b${g}\\b`).test(s))
	const site = (fn: string, line: number, expr: string, target: string, op: number | undefined, unnamed: boolean) => {
		const ff = T.get(fn)?.ff
		if (!ff || arith.length >= 40) return
		let e = expr.trim(), l = line
		const results: string[] = [] // (the locals holding the result: an overflow check may compare the sum with an operand)
		for (let k = 0; k < 2 && /^[A-Za-z_]\w*$/.test(e); k++) { const d = defOf(ff, e, l); if (!d) return; results.push(e); e = d.expr.trim(); l = d.line }
		if (/\bsat_(sub|add)\(/.test(e)) { arith.push({ at: loc(fn, l), op, target, expr: e.slice(0, 120), kind: /sat_sub/.test(e) ? 'sub' : 'add', status: 'saturating', unnamed }); return }
		const ts = terms(e)
		if (!ts) return
		const kind = ts.some(([s]) => s === '-') ? 'sub' : 'add'
		const vars = ts.map(([, t]) => t).filter(t => !isConst(t))
		if (!vars.length) return
		const { conds } = pathConds(r, ix, fn, line, 80)
		// (an operand copied from another local: `const am = z` — the check may name either)
		const alias = (v: string): string[] => { const out = [v]; for (let k = 0, x = v; k < 2 && /^[A-Za-z_]\w*$/.test(x); k++) { const d = defOf(ff, x, l); if (!d || !/^[A-Za-z_][\w.]*$/.test(d.expr.trim())) break; x = d.expr.trim(); out.push(x) } return out }
		const al = vars.map(alias)
		const hit = (c: string, vs: string[]) => vs.some(v => mentions(c, v))
		// (a condition on locals: their definitions too, e.g. an overflow flag `z = y > y + c`, a reload of the operand)
		const ex = (c: PathCond): string => {
			const cf = T.get(c.at.fn)?.ff
			if (!cf) return c.cond
			const ds: string[] = [c.cond]
			for (const m of new Set(c.cond.match(/(?<![\w.])[A-Za-z_]\w*(?![\w(])/g) ?? [])) { const d = defOf(cf, m, c.at.line); if (d && d.expr.length < 100) ds.push(d.expr) }
			return ds.join(' ; ')
		}
		const opText = al.map(vs => { const d = defOf(ff, vs[vs.length - 1], l); return d && d.expr.length < 100 && !/^[A-Za-z_][\w.]*$/.test(d.expr.trim()) ? [...vs, d.expr.trim()] : vs })
		const g = conds.find(c => { if (!CMP.test(c.cond)) return false; const t = ex(c); return opText.every(vs => hit(t, vs)) || (hit(t, results) && opText.some(vs => hit(t, vs))) })
		arith.push({ at: loc(fn, l), op, target, expr: e.slice(0, 120), kind, status: g ? 'checked' : 'unchecked', guard: g && { at: g.at, cond: g.cond.slice(0, 120) }, caller: callerCtl(e) || undefined, unnamed: unnamed || undefined })
	}
	ix.ops.forEach((o, oi) => {
		if (o.kinds.includes('LAMPORT_WRITE') && o.value && !o.kinds.includes('ACCOUNT_CLOSE')) site(o.at.fn, o.at.line, o.value, o.target ?? '?', oi, false)
		else if (o.kinds.includes('ACCOUNT_DATA_WRITE') && o.value && o.target) {
			const f = o.target.split('.').slice(1).join('.')
			const unnamed = /^data\[/.test(f)
			if (VALUE_FIELD.test(f) || (unnamed && o.how !== '=' )) site(o.at.fn, o.at.line, o.value, o.target, oi, unnamed)
			else if (unnamed && /^data\[\d+\.\.\d+\]$/.test(f) && terms(o.value)) { const [x, y] = f.slice(5, -1).split('..').map(Number); if (y - x === 8) site(o.at.fn, o.at.line, o.value, o.target, oi, true) }
		}
		for (const [k, v] of o.cpi?.fields ?? []) if (/amount|lamports|quantity/i.test(k)) site(o.at.fn, o.at.line, v, `${o.cpi!.program}.${o.cpi!.ix ?? '?'}.${k}`, oi, false)
	})
	ix.arith = arith
	// (where a value comes from: locals' definitions, and a parameter's arguments at the calls in this instruction)
	const provenance = (fn: string, e: string, line: number, depth: number, out: string[]) => {
		if (out.length >= 12 || out.includes(e.trim())) return
		out.push(e.trim())
		const ff = T.get(fn)?.ff
		if (!ff) return
		const ids = [...new Set([...e.replace(/\bld\d+\((?:[^()]|\([^()]*\))*\)/g, '').matchAll(/(?<![\w.])([A-Za-z_]\w*)(?![\w.(])/g)].map(m => m[1]))].slice(0, 4)
		const params = paramsOf(ff)
		for (const id of ids) {
			const d = defOf(ff, id, line)
			if (d) { provenance(fn, d.expr, d.line, depth, out); continue }
			const pi = params.indexOf(id)
			if (pi < 0 || depth <= 0) continue
			for (const [cf, cl, args] of callsTo(ix, fn).slice(0, 3)) if (args[pi]) provenance(cf, args[pi], cl, depth - 1, out)
		}
	}
	// divisions by a supply / balance-like value
	const divs: DivSite[] = []
	for (const fn of ix.functions) {
		const ff = T.get(fn)?.ff
		if (!ff || divs.length >= 20) continue
		for (let i = ff.at; i < ff.lines.length && divs.length < 20; i++) {
			const s = ff.lines[i]
			if (!/ \/ |__udivti3\(|\bu?div(64|128)?\(|\bsdiv\(/.test(s) || /^\s*\/\//.test(s)) continue
			const cands: string[] = []
			for (const m of s.matchAll(/ \/ (\([^()]*(?:\([^()]*\)[^()]*)*\)|[A-Za-z_][\w.]*(?:\([^()]*\))?)/g)) cands.push(m[1])
			const u = /__udivti3\(([^,]+), ([^,]+), ([^,]+), ([^,)]+)/.exec(s)
			if (u) cands.push(u[4])
			for (const dv of cands) {
				if (isConst(dv.replace(/[()]/g, ''))) continue
				const seen: string[] = []
				provenance(fn, dv, i + 1, 2, seen)
				if (!seen.some(x => SUPPLY.test(x))) continue
				const { conds } = pathConds(r, ix, fn, i + 1, 80)
				const names = seen.flatMap(x => /^[A-Za-z_][\w.]*$/.test(x.trim()) ? [x.trim()] : [])
				const g = conds.find(c => CMP.test(c.cond) && names.some(x => mentions(c.cond, x)))
				divs.push({ at: loc(fn, i + 1), expr: s.trim().slice(0, 140), divisor: seen.join(' ← ').slice(0, 160), status: g ? 'checked' : 'not_found', guard: g && { at: g.at, cond: g.cond.slice(0, 120) } })
			}
		}
	}
	ix.divs = divs
	// path conditions to the sensitive operations
	const paths: PathInfo[] = []
	ix.ops.forEach((o, oi) => {
		if (paths.length >= 30 || !o.kinds.some(k => k !== 'PDA_DERIVE') || (o.kinds.length === 1 && o.kinds[0] === 'CPI' && o.cpi?.known)) return
		const pc = pathConds(r, ix, o.at.fn, o.at.line, 60), conds = pc.conds.filter(c => c.how !== 'before').slice(0, 40), truncated = pc.truncated
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
		paths.push({ op: oi, conds, notRequired, truncated: truncated || undefined })
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
