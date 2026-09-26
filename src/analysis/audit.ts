// Facts for the audit pattern rules (phase2.ts RULES; bench/programs/a_audit seeds one bug per rule), on the IR,
// per instruction: accounts whose data the logic borrows itself (flow.ts dataReads), PDA bumps from instruction
// data, CPI results never read, narrowing casts of value-path amounts, remaining accounts the checks read,
// authority writes of an init_if_needed account not gated by its state. DERIVED and OVER-APPROXIMATE.
import type { Result } from '../decompile.ts'
import type { Expr, Stmt } from '../ir.ts'
import { walkExpr } from '../ir.ts'
import type { IxOut } from './report.ts'
import { irOf, stmtAt, defsIn, pathTo, blockAt } from './paths.ts'
import { dataReads, callOf, cfgOf, anchorEval, tryInfo, type HVal, type EvCtx } from './flow.ts'
import { sourceCtx } from './sources.ts'

export interface AuditFacts {
	dataReads: string[]                                           // Anchor: accounts whose data the logic borrows itself
	bumps: { op: number; source: string }[]                       // create_program_address: the bump seed's instruction-data source
	ignored: number[]                                             // CPIs whose result (the Result it returns) is never read
	casts: { op: number; expr: string; bits: number; source: string }[] // value-path amounts narrowed from 64 bits
	remChecked: string[]                                          // Anchor: remaining accounts whose key / owner / data a check reads
	reinit: { op: number; acct: string }[]                        // authority writes to an init_if_needed account, no state read on the way
	sameType?: { fn: string; n: number; type?: string; accts: string[] } // Anchor: an account type try_accounts deserializes more than once (its try call, the accounts it names)
}

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
				const ixs = v ? src(fn, v[0], v[1]).filter(x => x.kind === 'ix') : []
				if (ixs.length) out.bumps.push({ op: oi, source: ixs[0].source })
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
				const x = narrowed(e, p, D, 0)
				if (!x) continue
				const ss = src(fn, x.inner, x.p).filter(y => y.kind === 'ix' || y.kind === 'data' || y.kind === 'lamports')
				if (ss.length) { out.casts.push({ op: oi, expr: o.text.slice(0, 100), bits: x.bits, source: ss[0].source }); break }
			}
		}
	})
	// (Anchor: the remaining accounts a check reads (its compared bytes / values), by the handler's evaluation contexts)
	if (r.anchor && ctx && ix.ops.some(o => o.target?.startsWith('remaining_accounts[') || o.cpi?.accounts.some(x => /remaining_accounts\[/.test(x.text)))) {
		const ev = evaluators(r, ix)
		const seen = new Set<string>()
		for (const ck of ix.checks) {
			const E = ev(ck.fnPc), st = ck.at.pc !== undefined ? stmtAt(I, ck.fnPc, ck.at.pc) : undefined
			const fo = I.byPc.get(ck.fnPc)
			const b = fo && ck.c ? cfgOf(fo).condBlock.get(ck.c) : undefined
			const p = b !== undefined ? b << 16 | fo!.f.blocks[b].stmts.length : st?.[1]
			if (!E || !ck.c || p === undefined) continue
			walkExpr(ck.c, x => {
				const args = x.k === 'call' || x.k === 'fn' ? x.args : x.k === 'var' ? [x] : []
				for (const a of args) for (const v of reads(E, a, p)) if (/^remaining_accounts\[/.test(v)) seen.add(v)
			})
		}
		out.remChecked = [...seen]
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
	return out
}

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
function narrowed(e: Expr, p: number, D: NonNullable<ReturnType<typeof defsIn>>, d: number): { inner: Expr; p: number; bits: number } | undefined {
	if (d > 6) return undefined
	let found: { inner: Expr; p: number; bits: number } | undefined
	walkExpr(e, x => {
		if (found) return
		if (x.k === 'ext' && width(x.a, p, D, 0) > x.bits) found = { inner: x.a, p, bits: x.bits }
		else if (x.k === 'var') {
			const y: [Expr, number] | null = D.defs.has(x.id) ? [D.defs.get(x.id)!, D.defPos.get(x.id)!] : D.multi.has(x.id) ? D.reaching(x.id, p) : null
			if (y && y[0].k !== 'call') found = narrowed(y[0], y[1], D, d + 1)
		}
	})
	return found
}
/** the width in bits of a value (64 when not known) */
function width(e: Expr, p: number, D: NonNullable<ReturnType<typeof defsIn>>, d: number): number {
	if (d > 6) return 64
	switch (e.k) {
		case 'load': return e.size * 8
		case 'ext': return e.bits
		case 'const': return e.v < 0x100n ? 8 : e.v < 0x10000n ? 16 : e.v < 0x100000000n ? 32 : 64
		case 'bin': return e.op === 'and' ? Math.min(width(e.a, p, D, d + 1), width(e.b, p, D, d + 1)) : ['shr', 'sar', 'div', 'udiv', 'mod', 'umod'].includes(e.op) ? width(e.a, p, D, d + 1) : Math.max(width(e.a, p, D, d + 1), width(e.b, p, D, d + 1))
		case 'var': {
			const y: [Expr, number] | null = D.defs.has(e.id) ? [D.defs.get(e.id)!, D.defPos.get(e.id)!] : D.multi.has(e.id) ? D.reaching(e.id, p) : null
			return y && y[0].k !== 'call' ? width(y[0], y[1], D, d + 1) : 64
		}
		default: return 64
	}
}

/** Anchor: the evaluation context of a function of the instruction (its parameters bound up the call path) */
function evaluators(r: Result, ix: IxOut): (fn: number) => EvCtx | undefined {
	const I = irOf(r), ctx = ix.ctx!
	const H = I.byPc.get(ctx.handler)
	const A = H && anchorEval(r, H)
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
				x = A.ctxOf(fo, roots, 2)
			}
		}
		memo.set(fn, x)
		return x
	}
	return fn => evIn(fn)
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
function reads(E: EvCtx, e: Expr, p: number): string[] {
	const out: string[] = []
	const one = (v: HVal | undefined) => { if (v && v.k !== 'fr' && (v.k === 'keyp' || v.k === 'ownp' || v.k === 'data' || v.k === 'info')) out.push(v.acct) }
	const v = E.ev(e, p)
	one(v)
	// (bytes copied into the frame from a key: the copy's source)
	if (v?.k === 'fr') {
		const y = v.ctx.D.reaching(v.ctx.D.SLOT(v.z), v.at, true)
		if (y && y[0].k === 'load') one(v.ctx.ev(y[0].addr, y[1]))
	}
	return out
}
