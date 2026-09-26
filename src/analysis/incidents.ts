// Incident-class rules (docs/ANALYSIS_SPEC.md, Incident classes; bench/gen/risk.ts seeds one property per variant), on the
// IR of each instruction's reachable functions (the blocks its dispatch allows):
//   introspection-unchecked   the Instructions sysvar parsed (the current index: its last two bytes) with no key check
//                             against Sysvar1nstructions…, a loaded instruction's program id never compared, or the
//                             index taken from instruction data
//   flash-repay-unbound       introspection before a PDA-signed outflow, no field of the found instruction compared with
//                             an account key or the instruction's arguments
//   stale-after-cpi           a value read from an account's data before a CPI that gets the account writable, used after it
//   token2022-amount-assumed  an inbound transfer through a program that may be Token-2022, state credited with the
//                             argument, the destination's balance never read after the transfer
//   oracle-unvalidated        a Pyth price (aggregate price @208) read with no status / staleness read (confidence: when
//                             the price gates an outflow of the same instruction)
//   signer-to-untrusted-program  a CPI whose program id is an account key no check pins, signed by a PDA or forwarding a
//                             signer of the instruction
//   rounding-favors-user      (experimental) share math rounded up on a credit / down on a debit
// and the informational fund movers (who can move program-controlled funds). DERIVED and OVER-APPROXIMATE.
import type { Result, FuncOut } from '../decompile.ts'
import type { Expr, Stmt } from '../ir.ts'
import { walkExpr } from '../ir.ts'
import type { Analysis, IxOut, Loc, OpOut } from './report.ts'
import type { Finding } from './phase2.ts'
import type { FnFacts } from './facts.ts'
import { irOf, defsIn, valueKey, posAt } from './paths.ts'
import { cfgOf, callOf } from './flow.ts'
import { sourceCtx, type Source } from './sources.ts'

type F = Omit<Finding, 'title'>
export interface FundMover { instruction: string; authority: string; kind: string; from?: string; at: string }

export const INCIDENT_RULES: Record<string, string> = {
	'introspection-unchecked': 'Instructions sysvar parsed without its key check, the loaded instruction\'s program id check, or with an index from instruction data',
	'flash-repay-unbound': 'Flash-loan introspection: the found instruction\'s accounts / amount are not compared with this instruction\'s',
}

const M64 = (1n << 64n) - 1n
const SYSVAR_IX_W0 = 0x66d17b1817d5a706n // Sysvar1nstructions1111111111111111111111111, first word

// ---- the instruction's code: reachable functions and their allowed blocks ----

interface Fn { pc: number; fo: FuncOut; ff?: FnFacts; blocks: number[] }
const scopeMemo = new WeakMap<IxOut, Fn[]>()
function scope(r: Result, ix: IxOut): Fn[] {
	let s = scopeMemo.get(ix)
	if (s) return s
	s = []
	const I = irOf(r), ctx = ix.ctx
	if (ctx) for (const pc of [ctx.handler, ...ctx.parents.keys()]) {
		const fo = I.byPc.get(pc)
		if (!fo) continue
		const g = cfgOf(fo)
		const blocks = fo.f.blocks.map((_, b) => b).filter(b => g.rpo[b] >= 0 && (!ctx.allowed || ctx.allowed(pc, b)))
		s.push({ pc, fo, ff: r.facts.get(pc), blocks })
	}
	scopeMemo.set(ix, s)
	return s
}

const stmtExprs = (s: Stmt): Expr[] => s.k === 'set' || s.k === 'eval' ? [s.e] : s.k === 'store' ? [s.addr, s.v] : s.k === 'stores' ? [s.addr, ...s.vals] : s.k === 'copy' ? [s.dst, s.src] : s.k === 'call' ? s.args : []
/** every expression of the scope (sub-expressions included), with its function and position */
function eachExpr(sc: Fn[], f: (fn: Fn, e: Expr, p: number, top: Expr) => void) {
	for (const fn of sc) for (const b of fn.blocks) {
		const bl = fn.fo.f.blocks[b]
		bl.stmts.forEach((s, i) => { for (const e of stmtExprs(s)) walkExpr(e, x => f(fn, x, b << 16 | i, e)) })
		if (bl.term.k === 'br') { const c = bl.term.c; walkExpr(c, x => f(fn, x, b << 16 | bl.stmts.length, c)) }
		else if (bl.term.k === 'ret' && bl.term.e) { const c = bl.term.e; walkExpr(c, x => f(fn, x, b << 16 | bl.stmts.length, c)) }
	}
}
/** the calls of the scope (statements and calls nested in expressions), with their position */
function eachCall(sc: Fn[], f: (fn: Fn, name: string, args: Expr[], p: number, pc: number) => void, r: Result) {
	const nameOf = (t: Extract<Expr, { k: 'call' }>['t']) => t.k === 'sys' ? t.name : t.k === 'fn' ? r.program.funcs.get(t.pc)?.name ?? '' : ''
	for (const fn of sc) for (const b of fn.blocks) {
		const bl = fn.fo.f.blocks[b]
		bl.stmts.forEach((s, i) => {
			const c = callOf(s)
			if (s.k === 'call') f(fn, nameOf(s.t), s.args, b << 16 | i, s.pc)
			for (const e of stmtExprs(s)) walkExpr(e, x => { if (x.k === 'call' && x !== (c as unknown)) f(fn, nameOf(x.t), x.args, b << 16 | i, s.pc) })
		})
		const t = bl.term.k === 'ret' ? bl.term.e : bl.term.k === 'br' ? bl.term.c : null
		if (t) walkExpr(t, x => { if (x.k === 'call') f(fn, nameOf(x.t), x.args, b << 16 | bl.stmts.length, -1) })
	}
}

/** a sum's terms: the non-constant ones and the constant */
function sumOf(e: Expr): { terms: Expr[]; c: bigint } {
	const terms: Expr[] = []
	let c = 0n
	const go = (x: Expr, neg: boolean) => {
		if (x.k === 'bin' && x.op === 'add') { go(x.a, neg); go(x.b, neg); return }
		if (x.k === 'bin' && x.op === 'sub') { go(x.a, neg); go(x.b, !neg); return }
		if (x.k === 'const') { c += neg ? -x.v : x.v; return }
		terms.push(x)
	}
	go(e, false)
	return { terms, c: c & M64 }
}

const locOf = (fn: Fn, p: number): Loc => {
	const bl = fn.fo.f.blocks[p >> 16], s = bl?.stmts[p & 0xffff] ?? bl?.stmts[bl.stmts.length - 1]
	const cl = bl && (p & 0xffff) >= bl.stmts.length && bl.term.k === 'br' ? fn.ff?.condLine.get(bl.term.c) : undefined
	const line = cl ?? (s && fn.ff?.pcLine.get(s.pc)) ?? (fn.ff ? fn.ff.at + 1 : 0)
	return { fn: fn.ff?.name ?? fn.fo.name, line, pc: s?.pc }
}
const L = (at: Loc) => `${at.fn}:${at.line}`
const lineText = (fn: Fn, p: number) => { const at = locOf(fn, p); return (fn.ff?.lines[at.line - 1] ?? '').trim() }

// ---- comparisons: branch conditions (through && / || / ! and variables holding a comparison) and memcmp-like calls ----

interface Cmp { fn: Fn; p: number; a: Expr; b: Expr; n?: number; e: Expr } // n: bytes compared (memcmp-like)
const MEMCMP = /^(memcmp|memeq|bcmp|sol_memcmp_?|memcmp_\w+)$/
function compares(r: Result, sc: Fn[]): Cmp[] {
	const I = irOf(r), out: Cmp[] = []
	for (const fn of sc) {
		const D = defsIn(I, fn.pc)
		const go = (x: Expr, p: number, k: number) => {
			if (k > 8) return
			if (x.k === 'lnot' || x.k === 'ext') return go(x.a, p, k + 1)
			if (x.k === 'land' || x.k === 'lor') { go(x.a, p, k + 1); go(x.b, p, k + 1); return }
			if (x.k === 'var' && D?.defs.has(x.id)) { const y = D.defs.get(x.id)!; if (y.k === 'cmp' || y.k === 'lnot' || y.k === 'land' || y.k === 'lor') return go(y, D.defPos.get(x.id)!, k + 1) }
			if (x.k === 'cmp') out.push({ fn, p, a: x.a, b: x.b, e: x })
		}
		for (const b of fn.blocks) { const bl = fn.fo.f.blocks[b]; if (bl.term.k === 'br') go(bl.term.c, b << 16 | bl.stmts.length, 0) }
	}
	eachCall(sc, (fn, name, args, p) => { if (MEMCMP.test(name) && args.length >= 3) out.push({ fn, p, a: args[0], b: args[1], n: args[2].k === 'const' ? Number(args[2].v) : undefined, e: args[0] }) }, r)
	return out
}

// ---- introspection ----

interface Intro { kind: 'current' | 'table'; sysvar?: string; bySrc?: boolean; index?: Source[]; at: Loc; fn: Fn; p: number }
const SYSVAR_NAME = /^(instructions?|ixs|ix_sysvar|instructions?_sysvar|sysvar_instructions?|instructions?_(account|acc|info))$/i
/**
 * Reads of the serialized Instructions sysvar: the executing instruction's index (a u16 at data + len - 2:
 * load_current_index and the checked helpers) and the offset table (a u16 at data + 2 + 2·i: load_instruction_at), with
 * the account whose data they read (its sources; else the account a try_borrow_data of the function borrows; else an
 * account named like the sysvar)
 */
function introSites(r: Result, ix: IxOut, sc: Fn[]): Intro[] {
	const out: Intro[] = []
	const src = srcOf(r, ix)
	eachExpr(sc, (fn, x, p) => {
		if (x.k !== 'load' || x.size !== 2) return
		const s = sumOf(x.addr)
		if (s.terms.length !== 2) return
		let kind: Intro['kind'] | undefined, base: Expr[] = s.terms, index: Expr | undefined
		if (s.c === M64 - 1n) kind = 'current'
		else if (s.c === 2n) {
			// (2·i: a shift or product, possibly masked to 17 bits, possibly in a variable)
			const D = defsIn(irOf(r), fn.pc)
			const twice = (t: Expr, d: number): Expr | undefined => {
				if (t.k === 'var' && D?.defs.has(t.id) && d < 3) return twice(D.defs.get(t.id)!, d + 1)
				if (t.k === 'bin' && t.op === 'and' && t.b.k === 'const') return twice(t.a, d + 1)
				if (t.k === 'bin' && ((t.op === 'shl' && t.b.k === 'const' && t.b.v === 1n) || (t.op === 'mul' && t.b.k === 'const' && t.b.v === 2n))) return t.a
			}
			const i = s.terms.findIndex(t => twice(t, 0))
			if (i < 0) return
			kind = 'table'; index = twice(s.terms[i], 0); base = [s.terms[1 - i]]
		}
		if (!kind || out.some(o => o.fn === fn && o.p === p)) return
		const srcs = base.flatMap(t => src(fn.pc, t, p))
		// (not instruction data: a trailing u16 / a table of the caller's own bytes)
		if (srcs.some(y => y.kind === 'ix') && !srcs.some(y => y.kind === 'data')) return
		// (the table read: only next to a count read (a u16 at the base, compared with the index))
		if (kind === 'table') {
			const I = irOf(r), bk = valueKey(I, ix.ctx, fn.pc, base[0], p)
			let count = false
			fn.fo.f.blocks.forEach((b, bi) => { if (!count && b.term.k === 'br') walkExpr(b.term.c, y => { if (y.k === 'load' && y.size === 2 && valueKey(I, ix.ctx, fn.pc, y.addr, bi << 16 | b.stmts.length) === bk) count = true }) })
			if (!count) return
		}
		const d = srcs.find(y => y.kind === 'data' || y.kind === 'remaining')
		out.push({ kind, sysvar: d?.acct, bySrc: !!d, index: index && src(fn.pc, index, p), at: locOf(fn, p), fn, p })
	})
	if (!out.length || out.some(o => o.sysvar)) return out
	// (the account a try_borrow_data call of the parsing function borrows, when only one)
	const borrowed = new Set<string>()
	eachCall(sc.filter(f => out.some(o => o.fn === f)), (fn, name, args, p) => {
		if (!/try_borrow_(mut_)?data/.test(name) || args.length < 2) return
		for (const y of src(fn.pc, args[1], p)) if (y.kind === 'key' || y.kind === 'data') borrowed.add(y.acct!)
	}, r)
	const named = ix.accounts.filter(x => SYSVAR_NAME.test(x.name)).map(x => x.name)
	// (native: the account whose key is compared with the sysvar id)
	const keyed = r.anchor ? [] : [...new Set(compares(r, sc).filter(isSysvarCmp).flatMap(k => [...sideSrc(src, k, k.a), ...sideSrc(src, k, k.b)]).filter(y => y.kind === 'key').map(y => y.acct!))]
	const acct = keyed.length === 1 ? keyed[0] : borrowed.size === 1 ? [...borrowed][0] : named.length === 1 ? named[0] : undefined
	if (acct) for (const o of out) { o.sysvar = acct; o.bySrc = keyed.length === 1 }
	return out
}

/** a comparison with the Instructions sysvar id (its first word, or the 32 bytes a pointer points to) in the scope */
const isSysvarCmp = (k: Cmp) => {
	let hit = false
	for (const e of [k.a, k.b]) walkExpr(e, x => { if (x.k === 'const' && x.v === SYSVAR_IX_W0) hit = true })
	return hit || (k.n === 32 && /SYSVAR_INSTRUCTIONS/.test(lineText(k.fn, k.p)))
}
function sysvarKeyChecked(ix: IxOut, cmps: Cmp[], acct?: string): Loc | undefined {
	const row = acct ? ix.accounts.find(x => x.name === acct) : undefined
	const c = row?.constraints.address
	if (c && c.status !== 'not_found' && c.at) return c.at
	const k = cmps.find(isSysvarCmp)
	if (k) return locOf(k.fn, k.p)
	// (a check the facts name: its printed condition names the id)
	return ix.checks.find(x => /SYSVAR_INSTRUCTIONS|Sysvar1nstructions/.test(x.cond))?.at
}

const srcOf = (r: Result, ix: IxOut) => { const S = sourceCtx(r, ix); return (fn: number, e: Expr, p: number): Source[] => { try { return S.of(fn, e, p) } catch { return [] } } }
/** the sources of a compared operand: its value, and for a pointer (a memcmp side) the first word it points to */
const sideSrc = (src: ReturnType<typeof srcOf>, k: Cmp, e: Expr): Source[] => { const s = src(k.fn.pc, e, k.p); return k.n ? [...s, ...src(k.fn.pc, { k: 'load', size: 8, addr: e }, k.p)] : s }
/**
 * The program signs the CPI (signer seeds, a PDA signature): not when the seeds are a parameter slice (a shared transfer
 * helper) whose length the instruction's call path passes as 0
 */
function signs(r: Result, ix: IxOut, o: OpOut): boolean {
	if (!o.cpi?.seeds && !o.kinds.includes('PDA_SIGNATURE')) return false
	const m = /^p(\d+)\[\.\.p(\d+)\]$/.exec(o.cpi?.seeds ?? '')
	const fo = o.fnPc !== undefined ? irOf(r).byPc.get(o.fnPc) : undefined
	if (!m || !fo) return true
	const n = Number(m[2]), I = irOf(r)
	const v = fo.f.vars.find(x => n >= 5 ? x.param === 100 + n - 5 : x.param === n)
	if (!v) return true
	if (valueKey(I, ix.ctx, o.fnPc!, { k: 'var', id: v.id }, 0) === '#0') return false
	// (a tail call: the argument of the returned call)
	const par = ix.ctx?.parents.get(o.fnPc!)
	if (par?.pc === undefined && par?.ret?.k === 'call') {
		const x = par.ret.args[v.param >= 100 ? 4 + v.param - 100 : v.param - 1], q = posAt(I, par.fn, undefined, par.ret)
		if (x && q !== undefined && valueKey(I, ix.ctx, par.fn, x, q) === '#0') return false
	}
	return true
}
const VALUE_MOVE = (o: OpOut) => o.kinds.some(k => k === 'TOKEN_TRANSFER' || k === 'LAMPORT_TRANSFER' || k === 'MINT') || (o.kinds.includes('LAMPORT_WRITE') && o.how === '-=')
const WELL_KNOWN = /&(TOKEN|TOKEN_2022|SYSTEM|ASSOCIATED_TOKEN)_PROGRAM\b/
const isConstKey = (e: Expr) => e.k === 'const'

/** the functions a function calls within the instruction (itself included) */
function below(ix: IxOut, sc: Fn[], fns: Set<Fn>): Set<Fn> {
	const out = new Set(fns), pcs = new Set([...fns].map(f => f.pc))
	for (let grew = true; grew;) {
		grew = false
		for (const [c, par] of ix.ctx!.parents) if (pcs.has(par.fn) && !pcs.has(c)) { pcs.add(c); grew = true }
	}
	for (const f of sc) if (pcs.has(f.pc)) out.add(f)
	return out
}

function introspection(r: Result, ix: IxOut, sc: Fn[]): F[] {
	const sites = introSites(r, ix, sc)
	if (!sites.length) return []
	const cmps = compares(r, sc)
	const src = srcOf(r, ix)
	const acct = sites.find(s => s.sysvar)?.sysvar
	const out: F[] = []
	const accts = acct ? [acct] : []
	const first = sites.find(s => s.kind === 'current') ?? sites[0]
	const at = L(first.at)
	const keyAt = sysvarKeyChecked(ix, cmps, acct)
	const what = `${sites.some(s => s.kind === 'current') ? 'the executing instruction\'s index (the last two bytes)' : ''}${sites.length > 1 && sites.some(s => s.kind === 'current') && sites.some(s => s.kind === 'table') ? ' and ' : ''}${sites.some(s => s.kind === 'table') ? 'an instruction by its index (the offset table)' : ''}`
	if (!keyAt) out.push({ rule: 'introspection-unchecked', ix: ix.name, accounts: accts, path: [at], evidence: [`the Instructions sysvar is parsed: ${what}${acct ? `, from ${acct}'s data` : ''} (${at})`, `no comparison of ${acct ?? 'the account'}'s key with the Instructions sysvar id (Sysvar1nstructions1111111111111111111111111) found: a caller can pass an account holding a forged instruction list`], confidence: 'high', weight: 6 })
	// (the index of the instruction loaded: from instruction data, the executing one's not read)
	const tab = sites.find(s => s.kind === 'table' && s.index?.some(y => y.kind === 'ix') && !s.index.some(y => y.kind === 'data'))
	if (tab && !sites.some(s => s.kind === 'current')) out.push({ rule: 'introspection-unchecked', ix: ix.name, accounts: accts, path: [L(tab.at)], evidence: [`an instruction is loaded from the Instructions sysvar at an index from instruction data (${tab.index!.filter(y => y.kind === 'ix').map(y => y.source).join(', ')}), not relative to the executing instruction (its index is not read)`, 'the caller picks which instruction of the transaction is inspected'], confidence: 'medium', weight: 5 })
	// (comparisons reading the loaded instruction: with a constant / a non-account value (its program id, its tag) or with an
	// account key / an argument (binding it to this instruction); the sysvar's bytes by their sources, else (sources not
	// resolved) the comparisons of the parsing functions and their callees)
	const local = below(ix, sc, new Set(sites.map(s => s.fn))), bySrc = sites.some(s => s.bySrc)
	const fromSys = (k: Cmp, e: Expr) => sideSrc(src, k, e).some(y => (y.kind === 'data' || y.kind === 'remaining') && y.acct === acct)
	let prog: Loc | undefined, bind: Loc | undefined
	for (const k of cmps) {
		if (isSysvarCmp(k)) continue
		const A = sideSrc(src, k, k.a), B = sideSrc(src, k, k.b)
		let sa = !!acct && fromSys(k, k.a), sb = !!acct && fromSys(k, k.b)
		if (sa === sb && !bySrc && local.has(k.fn) && !WELL_KNOWN.test(lineText(k.fn, k.p))) { sa = !A.length && k.a.k !== 'const'; sb = !B.length && k.b.k !== 'const'; if (sa && sb) continue }
		if (sa === sb) continue
		const other = sa ? B : A, oe = sa ? k.b : k.a
		if (other.some(y => y.kind === 'key' || y.kind === 'ix')) bind ??= locOf(k.fn, k.p)
		else if (k.n === 32 && (isConstKey(oe) || !other.length)) prog ??= locOf(k.fn, k.p)
	}
	const moves = ix.ops.filter(VALUE_MOVE)
	// (the loaded instruction's fields: only with the sysvar account known)
	if (!prog && moves.length && acct) out.push({ rule: 'introspection-unchecked', ix: ix.name, accounts: accts, path: [at], evidence: [`an instruction is loaded from the Instructions sysvar before a value move (${moves[0].text.slice(0, 80)}), but no 32-byte comparison of its program id with a known id / this program's id was found: its data is trusted whatever program it targets`], confidence: 'medium', weight: 5 })
	const pda = moves.find(o => signs(r, ix, o)) ?? moves[0]
	if (!bind && pda && acct) out.push({ rule: 'flash-repay-unbound', ix: ix.name, accounts: accts, path: [at, L(pda.at)], evidence: ['flash-loan style introspection: no field of the found instruction (its accounts, its amount) is compared with an account key or an argument of this instruction', `value move: ${pda.text.slice(0, 120)}`], confidence: 'medium', weight: 5 })
	if ((globalThis as { __incDebug?: boolean }).__incDebug) console.error('intro', ix.name, JSON.stringify(sites.map(s => [s.kind, s.sysvar, L(s.at), s.index?.map(y => y.source)])), 'key', keyAt && L(keyAt), 'prog', prog && L(prog), 'bind', bind && L(bind))
	return out
}

export function incidentFindings(a: Analysis, r: Result): Finding[] {
	const out: Finding[] = []
	for (const ix of a.ixs) {
		if (!ix.ctx) continue
		const sc = scope(r, ix)
		for (const f of introspection(r, ix, sc)) out.push({ ...f, title: INCIDENT_RULES[f.rule] })
	}
	return out
}

// ---- fund movers (informational) ----

/**
 * Per instruction that can move program-controlled funds (a token transfer / burn the program signs for: signer seeds, or
 * a PDA the instruction derives when the seeds are not decoded; a lamport debit written by the program), the authority
 * gating it: the signers the authority rows name, with the stored field / constant key each is compared with, else none.
 */
export function fundMovers(a: Analysis, r: Result): FundMover[] {
	const out: FundMover[] = []
	for (const ix of a.ixs) {
		if (/^idl_/.test(ix.name)) continue
		const derives = ix.ops.some(o => o.kinds.includes('PDA_DERIVE') && !/create_program_address/.test(o.pda?.fn ?? '')) || a.pdas.some(p => p.derivedIn.includes(ix.name))
		const moves = ix.ops.map((o, i) => [o, i] as const).filter(([o]) => {
			if (o.anchorClose || o.kinds.includes('ACCOUNT_CREATE')) return false
			if (o.kinds.includes('LAMPORT_WRITE') && o.how === '-=') return true
			if (!o.kinds.some(k => k === 'TOKEN_TRANSFER' || k === 'BURN')) return false
			return signs(r, ix, o) || (derives && !o.cpi?.accounts.length && !o.cpi?.seeds && !o.kinds.includes('PDA_SIGNATURE'))
		})
		if (!moves.length) continue
		const [o, oi] = moves[0]
		const row = ix.authority?.find(x => x.op === oi)
		let signers = [...new Set((row?.enabledBy ?? []).filter(e => e.kind === 'signer' && e.status !== 'not_found').map(e => e.what))]
		// (no signer in the operation's authority row: the instruction's signer checks)
		if (!signers.length) signers = ix.accounts.filter(x => x.constraints.signer && x.constraints.signer.status !== 'not_found').map(x => x.name)
		const gate = (s: string) => {
			const stored = (row?.enabledBy ?? []).filter(e => e.kind === 'stored' && e.what.startsWith(`${s}.key ==`)).map(e => e.what.slice(e.what.indexOf('==') + 3))
			const addr = ix.accounts.find(x => x.name === s)?.constraints.address
			return `${s} (signer${stored.length ? `; == ${stored.join(', ')}` : addr && addr.status !== 'not_found' ? '; constant key' : ''})`
		}
		const anon = ix.checks.some(c => c.kinds.includes('signer'))
		const authority = signers.length ? signers.map(gate).join(' + ') : anon ? 'a signer (account not identified; see the checks)' : 'none (no signer check found)'
		const kind = o.kinds.includes('LAMPORT_WRITE') ? 'lamports debited' : `${o.kinds.includes('BURN') ? 'token burn' : 'token transfer'} ${signs(r, ix, o) ? 'signed by a PDA' : '(a PDA derived here; signer seeds not decoded)'}`
		const from = o.kinds.includes('LAMPORT_WRITE') ? o.target?.split('.')[0] : o.cpi?.accounts.find(x => x.role === 'source' || x.role === 'account')?.text.replace(/^\*/, '')
		out.push({ instruction: ix.name, authority, kind, from: from && ix.accounts.some(x => x.name === from) ? from : undefined, at: L(o.at) })
	}
	return out
}
