// Facts for the audit pattern rules (phase2.ts RULES; bench/programs/a_audit seeds one bug per rule), on the IR,
// per instruction: accounts whose data the logic borrows itself (flow.ts dataReads), PDA bumps from instruction
// data, CPI results never read, narrowing casts of value-path amounts, remaining accounts the checks read,
// authority writes of an init_if_needed account not gated by its state. DERIVED and OVER-APPROXIMATE.
import type { Result } from '../decompile.ts'
import type { Expr, Stmt } from '../ir.ts'
import { walkExpr } from '../ir.ts'
import type { IxCtx, IxOut, Loc } from './report.ts'
import { irOf, stmtAt, defsIn, pathTo, blockAt } from './paths.ts'
import { dataReads, callOf, cfgOf, anchorEval, tryInfo, type HVal, type EvCtx } from './flow.ts'
import { sourceCtx } from './sources.ts'

export interface AuditFacts {
	dataReads: string[]                                           // Anchor: accounts whose data the logic borrows itself
	bumps: { op: number; source: string }[]                       // create_program_address: the bump seed's instruction-data source
	ignored: number[]                                             // CPIs whose result (the Result it returns) is never read
	casts: { op: number; expr: string; bits: number; source: string }[] // value-path amounts narrowed from 64 bits
	remChecked: string[]                                          // Anchor: remaining accounts whose key / owner / data a check reads
	ownerCmp?: string[]                                           // Anchor: accounts whose owner a check compares
	reinit: { op: number; acct: string }[]                        // authority writes to an init_if_needed account, no state read on the way
	sameType?: { fn: string; n: number; type?: string; accts: string[] } // Anchor: an account type try_accounts deserializes more than once (its try call, the accounts it names)
	initWrites?: InitWrite[]                                      // an account type's discriminator written into an account's data with no state check before
}
export interface InitWrite { acct: string; type: string; at: Loc; owner: boolean; field?: string } // field: native, an authority field written (no discriminator) // owner: a check compares the account's owner

const VALUE_OPS = new Set(['LAMPORT_WRITE', 'LAMPORT_TRANSFER', 'TOKEN_TRANSFER', 'MINT', 'BURN'])

export function auditIx(r: Result, ix: IxOut): AuditFacts {
	const I = irOf(r), ctx = ix.ctx
	const S = sourceCtx(r, ix)
	const out: AuditFacts = { dataReads: ctx ? [...dataReads(r, ctx.handler) ?? []] : [], bumps: [], ignored: [], casts: [], remChecked: [], reinit: [] }
	const src = (fn: number, e: Expr, p: number) => { try { return S.of(fn, e, p) } catch { return [] } }
	ix.ops.forEach((o, oi) => {
		const fn = o.fnPc, pc = o.at.pc
		if (fn === undefined || pc === undefined) return
		const st = stmtAt(I, fn, pc), D = defsIn(I, fn)
		if (!st || !D) return
		const [s, p] = st
		const c = callOf(s)
		// (a PDA derived with a bump the caller chooses: the last seed, one byte, stored from instruction data)
		if (o.pda && /create_program_address/.test(o.pda.fn) && c && c.args.length >= 3 && c.args[2].k === 'const') {
			const S0 = D.fpOff(c.args[1]), n = Number(c.args[2].v)
			const w = S0 === undefined || n < 1 || n > 16 ? undefined : S0 + 16 * (n - 1)
			const len = w === undefined ? undefined : D.reaching(D.SLOT(w + 8), p)
			const ptr = w === undefined ? undefined : D.reaching(D.SLOT(w), p)
			const B = ptr ? D.fpOff(ptr[0]) : undefined
			if (len && len[0].k === 'const' && len[0].v === 1n && B !== undefined) {
				const v = D.reaching(D.SLOT(B), p, true)
				// (loaded straight from instruction data: not through a call's results (e.g. a deserialized, stored bump))
				const ld = v && direct(v[0], v[1], D, 0)
				const ss = ld ? src(fn, ld[0], ld[1]) : []
				if (ss.length && ss.every(x => x.kind === 'ix')) out.bumps.push({ op: oi, source: ss[0].source })
			}
		}
		// (a CPI whose Result (the out object its first argument points to) no later statement reads; not the syscall itself:
		// a CPI that fails aborts the transaction, its r0 needs no test)
		if (o.kinds.includes('CPI') && c && c.t.k === 'fn' && !o.ret && c.args.length) {
			const O = D.fpOff(c.args[0])
			if (O !== undefined && !readAfter(I, fn, p, D.fpOff, O, 8)) out.ignored.push(oi)
		}
		// (a value-path amount narrowed from a wider value)
		if (o.kinds.some(k => VALUE_OPS.has(k))) {
			const es: Expr[] = s.k === 'store' ? [s.v] : c ? c.args.slice(2).filter(x => D.fpOff(x) === undefined) : []
			for (const e of es) {
				const x = narrowed(e, p, D, 0, paramWidth(I, ctx, fn))
				if (!x) continue
				const ss = src(fn, x.inner, x.p).filter(y => y.kind === 'ix' || y.kind === 'data' || y.kind === 'lamports')
				if (ss.length) { out.casts.push({ op: oi, expr: o.text.slice(0, 100), bits: x.bits, source: ss[0].source }); break }
			}
		}
	})
	// (Anchor: the accounts' keys / owners / data the checks compare (their compared bytes / values, through the variables
	// holding a comparison's result), by the handler's evaluation contexts: remaining accounts checked, owners compared)
	if (r.anchor && ctx && (out.dataReads.length || ix.ops.some(o => o.target?.startsWith('remaining_accounts[') || o.cpi?.accounts.some(x => /remaining_accounts\[/.test(x.text))))) {
		const ev = evaluators(r, ix)
		const seen = new Set<string>(), owners = new Set<string>()
		for (const ck of ix.checks) {
			const E = ev(ck.fnPc), st = ck.at.pc !== undefined ? stmtAt(I, ck.fnPc, ck.at.pc) : undefined
			const fo = I.byPc.get(ck.fnPc), D = defsIn(I, ck.fnPc)
			const b = fo && ck.c ? cfgOf(fo).condBlock.get(ck.c) : undefined
			const p = b !== undefined ? b << 16 | fo!.f.blocks[b].stmts.length : st?.[1]
			if (!E || !D || !ck.c || p === undefined) continue
			const scan = (e: Expr, q: number, d: number) => walkExpr(e, x => {
				if (x.k === 'call' || x.k === 'fn') { for (const a of x.args) for (const [v, k] of reads(E, a, q)) { if (/^remaining_accounts\[/.test(v)) seen.add(v); if (k === 'ownp') owners.add(v) } }
				else if (x.k === 'var' && d < 3) {
					const y: [Expr, number] | null = D.defs.has(x.id) ? [D.defs.get(x.id)!, D.defPos.get(x.id)!] : D.multi.has(x.id) ? D.reaching(x.id, q) : null
					if (y) scan(y[0], y[1], d + 1)
					else for (const [v] of reads(E, x, q)) if (/^remaining_accounts\[/.test(v)) seen.add(v)
				}
			})
			scan(ck.c, p, 0)
		}
		out.remChecked = [...seen]
		out.ownerCmp = [...owners]
	}
	// (Anchor: a deserialization (a try call checking a discriminator) try_accounts makes for several accounts)
	if (r.anchor && ctx) {
		const H = I.byPc.get(ctx.handler), T = H && tryInfo(r, H)?.tryPc, tf = T !== undefined ? r.facts.get(T) : undefined
		if (tf) {
			const n = new Map<number, number>()
			for (const c of tf.calls) if (!c.errPath) n.set(c.callee, (n.get(c.callee) ?? 0) + 1)
			const des = new Set(tf.checks.filter(k => k.before !== undefined && k.via?.kinds.includes('discriminator')).map(k => k.before!))
			const [c, k] = [...n].find(([c, k]) => k >= 2 && des.has(c)) ?? []
			// (its type: the discriminator it compares (the IDL account named in the printed constant))
			const type = c === undefined ? undefined : r.facts.get(c)?.checks.map(x => /account:(\w+)/.exec(x.cond)?.[1]).find(x => x)
			if (c !== undefined) out.sameType = { fn: r.facts.get(c)?.name ?? r.program.funcs.get(c)?.name ?? String(c), n: k!, type, accts: [...new Set(tf.checks.filter(x => x.before === c && x.named).map(x => x.named!))] }
		}
	}
	// (init_if_needed: an account the instruction may create or find initialized (the owner check of the existing
	// account's path), whose authority field it writes with no condition on the way reading the account's state)
	if (r.anchor && ctx && ix.ops.some(o => o.kinds.includes('ACCOUNT_CREATE'))) {
		ix.ops.forEach((o, oi) => {
			if (!o.kinds.includes('AUTHORITY_WRITE') || !o.target || o.fnPc === undefined) return
			const acct = o.target.split('.')[0]
			if (!ix.checks.some(k => k.account === acct && /ConstraintOwner/.test(k.error))) return
			const b = blockAt(I, o.fnPc, o.at.pc)
			const conds = pathTo(I, ctx, o.fnPc, b)
			const gated = conds.some(k => k.how !== 'before' && (src(k.fn, k.c, k.pos).some(x => x.acct === acct && x.kind === 'data') || readsAcct(r, ix, k.fn, k.c, k.pos, acct)))
			if (!gated) out.reinit.push({ op: oi, acct })
		})
	}
	if (ctx) out.initWrites = initWrites(r, ix, out.ownerCmp ?? [])
	// (native: an authority field written into an account the instruction does not create, no condition on the way
	// reading the account's data (an is_initialized flag, a state unpacked))
	if (ctx && !r.anchor && !out.initWrites?.length && !ix.ops.some(o => o.kinds.includes('ACCOUNT_CREATE') || (o.cpi && (o.cpi.family === 'system' || (!o.cpi.known && !o.cpi.family))))) {
		for (const o of ix.ops) {
			if (!o.kinds.includes('AUTHORITY_WRITE') || !o.target || o.fnPc === undefined || o.at.pc === undefined) continue
			const acct = o.target.split('.')[0]
			if (/\?$|^account\[/.test(acct) && !ix.accounts.some(a => a.name === acct)) continue
			const conds = pathTo(I, ctx, o.fnPc, blockAt(I, o.fnPc, o.at.pc))
			if (conds.some(k => k.how !== 'before' && src(k.fn, k.c, k.pos).some(x => x.acct === acct && x.kind === 'data'))) continue
			if (ix.checks.some(k => k.account === acct && k.kinds.some(x => x === 'state' || x === 'discriminator' || x === 'initialized'))) continue
			out.initWrites!.push({ acct, type: '', field: o.target, at: o.at, owner: ix.checks.some(k => k.account === acct && k.kinds.includes('owner')) })
			break
		}
	}
	return out
}

/**
 * Initialization writes (reinit-unchecked): an account type's discriminator (an IDL account type's, or a printed
 * `account:T` constant) stored at offset 0 of an account's data, directly or as the start of a buffer copied there
 * (by bytes or memcpy), by an instruction that does not create the account (no system CreateAccount / Allocate /
 * Assign CPI, no CPI to a program not decoded), does not compare anything with that discriminator (an Account<T>
 * deserialization: the account is initialized, the write is its serialization on exit), and has no condition on the
 * way to the write (dominating branches, the checks of try_accounts before the handler's body) reading the account's
 * data (discriminator == 0 / Anchor `zero`, an is_initialized flag).
 */
function initWrites(r: Result, ix: IxOut, ownerCmp: string[]): InitWrite[] {
	const ctx = ix.ctx!, I = irOf(r), H = I.byPc.get(ctx.handler)
	if (!H) return []
	const fns = [ctx.handler, ...ctx.parents.keys()]
	const discs = new Map<bigint, string>((r.idl?.accounts ?? []).map(a => [a.disc, a.name]))
	for (const fn of fns) for (const m of I.byPc.get(fn)?.text.matchAll(/0x([0-9a-f]{9,16}) \/\* account:(\w+) \*\//g) ?? []) discs.set(BigInt('0x' + m[1]), m[2])
	if (!discs.size) return []
	// (created here, or by a program the analysis does not decode)
	if (ix.ops.some(o => o.kinds.includes('ACCOUNT_CREATE') || (o.cpi && (/^SYSTEM/.test(o.cpi.known ?? '') || o.cpi.family === 'system' || (!o.cpi.known && !o.cpi.family))))) return []
	const E = evaluators(r, ix)
	const out: InitWrite[] = []
	// (the types compared anywhere: deserialized as that type)
	const compared = new Set<string>()
	for (const fn of fns) for (const b of I.byPc.get(fn)?.f.blocks ?? []) if (b.term.k === 'br') walkExpr(b.term.c, x => { if (x.k === 'const' && discs.has(x.v)) compared.add(discs.get(x.v)!) })
	/** the base of an address (a variable offset dropped) and whether it had one */
	const baseOf = (e: Expr): [Expr, boolean] => e.k === 'bin' && e.op === 'add' && e.b.k !== 'const' ? [e.a, true] : [e, false]
	for (const fn of fns) {
		const fo = I.byPc.get(fn), Ev = E(fn), D = defsIn(I, fn)
		if (!fo || !Ev || !D) continue
		// (buffers starting with a discriminator: the variable / frame slot it is stored at)
		const bufV = new Map<number, string>(), bufF = new Map<number, string>()
		let any = false
		for (const b of fo.f.blocks) for (const s of b.stmts) {
			const v = s.k === 'store' && s.size === 8 ? s.v : s.k === 'stores' && s.size === 8 ? s.vals[0] : undefined
			if (!v || v.k !== 'const' || !discs.has(v.v)) continue
			any = true
			const a = (s as { addr: Expr }).addr, z = D.fpOff(a)
			if (z !== undefined) bufF.set(z, discs.get(v.v)!)
			else if (a.k === 'var') bufV.set(a.id, discs.get(v.v)!)
		}
		if (!any) continue
		const bufOf = (e: Expr): string | undefined => { const [b] = baseOf(e); const z = D.fpOff(b); return z !== undefined ? bufF.get(z) : b.k === 'var' ? bufV.get(b.id) : undefined }
		fo.f.blocks.forEach((b, bi) => b.stmts.forEach((s, i) => {
			const p = bi << 16 | i
			let dst: Expr | undefined, type: string | undefined
			if (s.k === 'store' || s.k === 'stores') {
				const v = s.k === 'store' ? s.v : s.vals[0]
				dst = s.addr
				type = v.k === 'const' ? discs.get(v.v) : v.k === 'load' ? bufOf(v.addr) : undefined
			} else {
				const c = callOf(s), mc = s.k === 'copy' ? [s.dst, s.src] : c && c.t.k === 'fn' && /memcpy|memmove/.test(r.program.funcs.get(c.t.pc)?.name ?? '') ? [c.args[0], c.args[1]] : c && c.t.k === 'sys' && /memcpy|memmove/.test(c.t.name) ? [c.args[0], c.args[1]] : undefined
				if (mc) { dst = mc[0]; type = bufOf(mc[1]) }
			}
			if (!dst || !type) return
			const [base, varOff] = baseOf(dst)
			const h = Ev.ev(base, p)
			if (h?.k !== 'data' || (h.off !== 0 && !varOff) || compared.has(type) || out.some(x => x.acct === h.acct)) return
			// (a condition on the way reading the account's data: dominating branches, try_accounts' checks)
			const T = tryInfo(r, H)?.tryPc
			const conds = pathTo(I, ctx, fn, bi).filter(k => k.how !== 'before').map(k => [k.fn, k.c, k.pos] as const)
			const tf = T !== undefined ? I.byPc.get(T) : undefined
			if (tf) tf.f.blocks.forEach((tb, tbi) => { if (tb.term.k === 'br') conds.push([T!, tb.term.c, tbi << 16 | tb.stmts.length]) })
			if (conds.some(([f2, c2, q]) => readsData(r, ix, f2, c2, q, h.acct))) return
			if (ix.checks.some(k => k.account === h.acct && k.kinds.some(x => x === 'discriminator' || x === 'zero' || x === 'initialized' || x === 'state'))) return
			const ff = r.facts.get(fn)
			out.push({ acct: h.acct, type, at: { fn: ff?.name ?? fo.name, line: ff?.pcLine.get(s.pc) ?? 0, pc: s.pc }, owner: ownerCmp.includes(h.acct) || ix.checks.some(k => k.account === h.acct && k.kinds.includes('owner')) })
		}))
	}
	return out
}

/** whether a value reads an account's data (a load through a pointer into it), through variables */
function readsData(r: Result, ix: IxOut, fn: number, e: Expr, p: number, acct: string): boolean {
	const I = irOf(r), E = evaluators(r, ix)(fn), D = defsIn(I, fn)
	if (!E || !D) return false
	const go = (e: Expr, p: number, d: number): boolean => {
		if (d > 6) return false
		let hit = false
		walkExpr(e, x => {
			if (hit) return
			if (x.k === 'load') { const h = E.ev(baseOfAddr(x.addr), p); hit = h?.k === 'data' && h.acct === acct }
			else if (x.k === 'var') {
				const y: [Expr, number] | null = D.defs.has(x.id) ? [D.defs.get(x.id)!, D.defPos.get(x.id)!] : D.multi.has(x.id) ? D.reaching(x.id, p) : null
				if (y && y[0].k !== 'call') hit = go(y[0], y[1], d + 1)
			}
		})
		return hit
	}
	return go(e, p, 0)
}
const baseOfAddr = (e: Expr): Expr => e.k === 'bin' && e.op === 'add' && e.b.k !== 'const' ? e.a : e

/** whether a statement after position p (in its block, or in a block reachable from it) reads the frame bytes [O, O + n) */
function readAfter(I: ReturnType<typeof irOf>, fn: number, p: number, fpOff: (e: Expr) => number | undefined, O: number, n: number): boolean {
	const fo = I.byPc.get(fn)
	if (!fo) return true
	const blocks = fo.f.blocks
	const hit = (e: Expr): boolean => {
		let h = false
		walkExpr(e, x => {
			if (h) return
			if (x.k === 'load') { const a = fpOff(x.addr); if (a !== undefined && a < O + n && O < a + x.size) h = true }
			// (the object passed on, e.g. to an error conversion)
			else if (x.k === 'call' || x.k === 'fn') for (const y of x.args) { const a = fpOff(y); if (a !== undefined && a <= O && O < a + 0x40) h = true }
		})
		return h
	}
	const stmtHit = (s: Stmt): boolean => {
		if (s.k === 'copy') { const a = fpOff(s.src); if (a !== undefined && a < O + n && O < a + s.n) return true }
		const c = callOf(s)
		if (c) for (const y of c.args) { const a = fpOff(y); if (a !== undefined && a <= O && O < a + 0x40) return true }
		for (const e of stmtExprsOf(s)) if (hit(e)) return true
		return false
	}
	const termHit = (b: number): boolean => { const t = blocks[b].term; return (t.k === 'br' && hit(t.c)) || (t.k === 'ret' && !!t.e && hit(t.e)) }
	const b0 = p >> 16
	for (const s of blocks[b0].stmts.slice((p & 0xffff) + 1)) if (stmtHit(s)) return true
	if (termHit(b0)) return true
	const seen = new Set<number>([b0]), work = [...blocks[b0].succs]
	while (work.length) {
		const b = work.pop()!
		if (seen.has(b)) continue
		seen.add(b)
		if (blocks[b].stmts.some(stmtHit) || termHit(b)) return true
		work.push(...blocks[b].succs)
	}
	return false
}

/** the load a value is (through variables and frame words, not a call's results): its address, with its position */
function direct(e: Expr, p: number, D: NonNullable<ReturnType<typeof defsIn>>, d: number): [Expr, number] | undefined {
	if (d > 8) return undefined
	if (e.k === 'ext') return direct(e.a, p, D, d + 1)
	if (e.k === 'var') {
		const y: [Expr, number] | null = D.defs.has(e.id) ? [D.defs.get(e.id)!, D.defPos.get(e.id)!] : D.multi.has(e.id) ? D.reaching(e.id, p) : null
		return y && y[0].k !== 'call' ? direct(y[0], y[1], D, d + 1) : undefined
	}
	if (e.k !== 'load') return undefined
	const o = D.fpOff(e.addr)
	if (o === undefined) return [e.addr, p]
	const y = D.reaching(D.SLOT(o), p, true)
	return y && y[0].k !== 'call' ? direct(y[0], y[1], D, d + 1) : undefined
}

/** the expressions of a statement */
function stmtExprsOf(s: Stmt): Expr[] {
	switch (s.k) {
		case 'set': return [s.e]
		case 'store': return [s.addr, s.v]
		case 'stores': return [s.addr, ...s.vals]
		case 'copy': return [s.dst, s.src]
		case 'call': return s.args
		case 'eval': return [s.e]
		default: return []
	}
}

/** an `ext` narrowing a wider value on the way to e (through variables' definitions): the inner value and its width */
type PW = (id: number) => number
function narrowed(e: Expr, p: number, D: NonNullable<ReturnType<typeof defsIn>>, d: number, pw: PW): { inner: Expr; p: number; bits: number } | undefined {
	if (d > 6) return undefined
	let found: { inner: Expr; p: number; bits: number } | undefined
	walkExpr(e, x => {
		if (found) return
		if (x.k === 'ext' && width(x.a, p, D, 0, pw) > x.bits) found = { inner: x.a, p, bits: x.bits }
		else if (x.k === 'var') {
			const y: [Expr, number] | null = D.defs.has(x.id) ? [D.defs.get(x.id)!, D.defPos.get(x.id)!] : D.multi.has(x.id) ? D.reaching(x.id, p) : null
			if (y && y[0].k !== 'call') found = narrowed(y[0], y[1], D, d + 1, pw)
		}
	})
	return found
}
/** the width in bits of a value, 0 when not known (a parameter or call result: a narrow argument's upper bits are
 * undefined, its `ext` normalizes it) */
function width(e: Expr, p: number, D: NonNullable<ReturnType<typeof defsIn>>, d: number, pw: PW): number {
	if (d > 6) return 0
	switch (e.k) {
		case 'load': return e.size * 8
		case 'ext': return e.bits
		case 'const': return e.v < 0x100n ? 8 : e.v < 0x10000n ? 16 : e.v < 0x100000000n ? 32 : 64
		case 'bin': {
			const [a, b] = [width(e.a, p, D, d + 1, pw), width(e.b, p, D, d + 1, pw)]
			if ((!a && e.a.k !== 'const') || (!b && e.b.k !== 'const')) return e.op === 'and' ? Math.max(a, b) : 0
			return e.op === 'and' ? Math.min(a, b) : ['shr', 'sar', 'div', 'udiv', 'mod', 'umod'].includes(e.op) ? a : Math.max(a, b)
		}
		case 'var': {
			const y: [Expr, number] | null = D.defs.has(e.id) ? [D.defs.get(e.id)!, D.defPos.get(e.id)!] : D.multi.has(e.id) ? D.reaching(e.id, p) : null
			return y ? (y[0].k !== 'call' ? width(y[0], y[1], D, d + 1, pw) : 0) : pw(e.id)
		}
		default: return 0
	}
}

/** the width of a function's parameter: its argument's at the call site up the instruction's call path (0: not known) */
function paramWidth(I: ReturnType<typeof irOf>, ctx: IxOut['ctx'], fn: number, depth = 0): PW {
	return id => {
		const fo = I.byPc.get(fn), k = fo?.f.vars.find(v => v.id === id)?.param ?? -1
		const par = ctx && fn !== ctx.handler ? ctx.parents.get(fn) : undefined
		if (!par || par.pc === undefined || k < 1 || k > 5 || depth > 3) return 0
		const st = stmtAt(I, par.fn, par.pc), c = st && callOf(st[0]), D = defsIn(I, par.fn)
		return c && D && c.args[k - 1] ? width(c.args[k - 1], st![1], D, 0, paramWidth(I, ctx, par.fn, depth + 1)) : 0
	}
}

/** Anchor: the evaluation context of a function of the instruction (its parameters bound up the call path) */
function evaluators(r: Result, ix: IxOut): (fn: number) => EvCtx | undefined { return evaluatorsFor(r, ix.ctx!) }
const evMemo = new WeakMap<IxCtx, (fn: number) => EvCtx | undefined>()
export function evaluatorsFor(r: Result, ctx: IxCtx): (fn: number) => EvCtx | undefined {
	const m = evMemo.get(ctx)
	if (m) return m
	const I = irOf(r)
	const H = I.byPc.get(ctx.handler)
	const A = H && anchorEval(r, H), T = H && tryInfo(r, H)
	const memo = new Map<number, EvCtx | undefined>()
	const evIn = (fn: number, d = 0): EvCtx | undefined => {
		if (!A || d > 8) return undefined
		if (memo.has(fn)) return memo.get(fn)
		memo.set(fn, undefined)
		let x: EvCtx | undefined
		const fo = I.byPc.get(fn)
		if (fo && fn === ctx.handler) x = A.ctxOf(fo, new Map(), 2)
		else if (fo) {
			const par = ctx.parents.get(fn)
			const P = par && evIn(par.fn, d + 1)
			const st = par?.pc !== undefined ? stmtAt(I, par.fn, par.pc) : undefined
			const c = st && callOf(st[0])
			if (P && c) {
				const roots = new Map<number, HVal>()
				c.args.forEach((a, j) => { const v = P.ev(a, st![1]); const pv = fo.f.vars.find(q => q.param === j + 1)?.id; if (v && pv !== undefined) roots.set(pv, v) })
				// (try_accounts before &AccountInfo fields: the variables holding an account's &AccountInfo (byValueTry))
				if (fn === T?.tryPc) for (const [id, acct] of T.ptrs ?? []) roots.set(id, { k: 'info', acct, off: 0, seq: T.seqs?.get(id) })
				x = A.ctxOf(fo, roots, 2)
			}
		}
		memo.set(fn, x)
		return x
	}
	const f = (fn: number) => evIn(fn)
	evMemo.set(ctx, f)
	return f
}

/** Anchor: whether a value reads the account's bytes (its data, or its object in the handler's frame), through variables */
function readsAcct(r: Result, ix: IxOut, fn: number, e: Expr, p: number, acct: string): boolean {
	const I = irOf(r), E = evaluators(r, ix)(fn), D = defsIn(I, fn), H = I.byPc.get(ix.ctx!.handler)
	const A = H && anchorEval(r, H)
	if (!E || !D || !A) return false
	// (variables the function stores into the account's object: the same value as its field, e.g. a flag copied there)
	const stored = new Set<number>()
	I.byPc.get(fn)!.f.blocks.forEach((b, bi) => b.stmts.forEach((s, i) => {
		if ((s.k !== 'store' && s.k !== 'stores') || (s.k === 'store' ? s.v.k !== 'var' : !s.vals.some(v => v.k === 'var'))) return
		const h = E.ev(s.addr, bi << 16 | i)
		if (h?.k === 'fr' && h.ctx.fo === H && A.frameAcct(h.z, s.size, h.at)?.acct === acct) for (const v of s.k === 'store' ? [s.v] : s.vals) if (v.k === 'var') stored.add(v.id)
	}))
	const go = (e: Expr, p: number, d: number): boolean => {
		if (d > 6) return false
		let hit = false
		walkExpr(e, x => {
			if (hit) return
			if (x.k === 'load') {
				const h = E.ev(x.addr, p)
				if (h?.k === 'fr' && h.ctx.fo === H) hit = A.frameAcct(h.z, x.size, h.at)?.acct === acct
				else if (h?.k === 'data') hit = h.acct === acct
			} else if (x.k === 'var') {
				if (stored.has(x.id)) { hit = true; return }
				const y: [Expr, number] | null = D.defs.has(x.id) ? [D.defs.get(x.id)!, D.defPos.get(x.id)!] : D.multi.has(x.id) ? D.reaching(x.id, p) : null
				if (y && y[0].k !== 'call') hit = go(y[0], y[1], d + 1)
			}
		})
		return hit
	}
	return go(e, p, 0)
}

/** the accounts a compared value comes from: pointers to a key / owner / data, and the frame bytes copied from them */
function reads(E: EvCtx, e: Expr, p: number): [string, string][] {
	const out: [string, string][] = []
	const one = (v: HVal | undefined) => { if (v && v.k !== 'fr' && (v.k === 'keyp' || v.k === 'ownp' || v.k === 'data' || v.k === 'info')) out.push([v.acct, v.k]) }
	const v = E.ev(e, p)
	one(v)
	// (bytes copied into the frame from a key: the copy's source)
	if (v?.k === 'fr') {
		const y = v.ctx.D.reaching(v.ctx.D.SLOT(v.z), v.at, true)
		if (y && y[0].k === 'load') one(v.ctx.ev(y[0].addr, y[1]))
	}
	return out
}
