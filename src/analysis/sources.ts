// Where the values of an instruction come from (taint on the IR): a backward walk from an operation's parameter
// through variables' (reaching) definitions, frame slots (the store reaching a load; what a call leaves in an
// object it gets a pointer to: its arguments), parameters (the argument at the call site up the instruction's
// call path) and pointers (a value loaded through a pointer comes from what the pointer points into), down to
// the sources:
//   instruction data  native: loads from the pointer the dispatch tag is read from; Anchor: the handler's
//                     ix_args (named `ix.<arg>` when the printed load names the argument)
//   account keys, data, lamports, owners
//                     native: the account model (flow.ts accountResolver: account[i], by index); Anchor: the
//                     AccountInfo words of the Accounts struct and the account objects serialized back
//                     (flow.ts anchorEval); accounts past the instruction's known ones are remaining accounts
//   sysvars, CPI return data
//                     the syscalls (and library getters) producing them
// Budgets bound each walk. DERIVED and OVER-APPROXIMATE (any argument of a call may flow into its results).
import type { Result, FuncOut } from '../decompile.ts'
import type { Expr } from '../ir.ts'
import type { IxOut } from './report.ts'
import { irOf, valueKey, stmtAt, defsIn } from './paths.ts'
import { accountResolver, anchorEval, callOf, type HVal, type EvCtx } from './flow.ts'

export type SrcKind = 'ix' | 'key' | 'data' | 'lamports' | 'owner' | 'remaining' | 'sysvar' | 'return-data'
export interface Source { source: string; kind: SrcKind; acct?: string }

const SYSVAR = /sol_get_(clock|rent|epoch_schedule|fees|epoch_rewards|last_restart_slot|stake_history)_sysvar|sol_get_sysvar|\b(Clock|Rent|EpochSchedule|Fees|EpochRewards|LastRestartSlot)::get\b|sysvar::(clock|rent)/
const RETURN_DATA = /sol_get_return_data|get_return_data/

export interface SourceCtx { of: (fn: number, e: Expr, p: number) => Source[] }

const ctxMemo = new WeakMap<IxOut, SourceCtx>()
/** The source walker of an instruction. */
export function sourceCtx(r: Result, ix: IxOut): SourceCtx {
	let c = ctxMemo.get(ix)
	if (!c) ctxMemo.set(ix, (c = sourceCtx0(r, ix)))
	return c
}
function sourceCtx0(r: Result, ix: IxOut): SourceCtx {
	const I = irOf(r), ctx = ix.ctx
	const cl = { f: (pc: number) => I.byPc.get(pc)?.f, name: (pc: number) => r.program.funcs.get(pc)?.name ?? '' }
	const nameAt = (i: number) => ix.accounts.find(x => x.index === i)?.name ?? `account[${i}]`
	const known = ix.accounts.filter(x => x.index !== undefined).length
	const args = (r.instructions.find(i => i.name === ix.name)?.args ?? []).map(s => s.split(':')[0].trim())
	const calleeName = (c: { t: Extract<Expr, { k: 'call' }>['t'] }) => c.t.k === 'sys' ? c.t.name : c.t.k === 'fn' ? `${cl.name(c.t.pc)} ${r.facts.get(c.t.pc)?.name ?? ''}` : ''
	// instruction data: the keys of the pointers it is read through (without their constant offsets)
	const bases = new Set<string>()
	const termsOf = (k: string) => k.startsWith('(+ ') ? k.slice(3, -1).split(' ').filter(t => !t.startsWith('#')).join(' ') : k
	if (ctx?.tag) {
		const D = defsIn(I, ctx.tag.fn), f = I.byPc.get(ctx.tag.fn)?.f
		if (D && f) f.blocks.forEach((b, bi) => b.stmts.forEach((s, i) => {
			if (s.k !== 'set' || s.dst !== ctx.tag!.v) return
			const e = s.e.k === 'ext' ? s.e.a : s.e
			if (e.k === 'load') bases.add(termsOf(valueKey(I, ctx, ctx.tag!.fn, e.addr, bi << 16 | i)))
		}))
	}
	if (ctx && r.anchor) {
		const H = I.byPc.get(ctx.handler)
		// (the handler ABI: out, program_id, accounts, accounts_len, ix_args, ix_args_len)
		H?.f.vars.forEach(v => { if (v.param >= 1 && (H.names[v.id] === 'ix_args' || (H.name.startsWith('ix_') && v.param === (H.f.stackArgs ? 100 : 5)))) bases.add(valueKey(I, ctx, ctx.handler, { k: 'var', id: v.id }, 0)) })
	}
	const isIx = (k: string) => bases.has(termsOf(k))
	// Anchor: evaluation contexts along the call path (parameters bound to the caller's arguments)
	const A = r.anchor && ctx ? (() => { const H = I.byPc.get(ctx.handler); return H && anchorEval(r, H) })() : undefined
	const evMemo = new Map<number, EvCtx | undefined>()
	const evIn = (fn: number, d = 0): EvCtx | undefined => {
		if (!A || !ctx || d > 8) return undefined
		if (evMemo.has(fn)) return evMemo.get(fn)
		evMemo.set(fn, undefined)
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
		evMemo.set(fn, x)
		return x
	}
	const native = (fo: FuncOut) => accountResolver(fo, cl)
	const acctSrc = (i: number, field: string): Source | undefined => {
		// (the account model's values: a key, owner, lamports or data bytes of one of the (at most 64) accounts)
		if (i >= 64 || !/^(key|owner|lamports|data(\[.*)?)$/.test(field)) return undefined
		const a = nameAt(i)
		if (i >= known && known > 0) return { source: 'remaining accounts', kind: 'remaining', acct: a }
		const kind: SrcKind = field === 'key' ? 'key' : field === 'lamports' ? 'lamports' : field === 'owner' ? 'owner' : 'data'
		return { source: `${a}.${kind === 'data' ? (/^data\[/.test(field) ? field : 'data') : kind}`, kind, acct: a }
	}
	const anchorSrc = (h: HVal | undefined, n: number): Source | undefined => {
		if (!h || (h.k !== 'fr' && h.guess)) return undefined
		if (h.k === 'fr') {
			if (h.ctx.fo.pc !== ctx?.handler) return undefined
			const x = A!.frameAcct(h.z, n, h.at)
			return x && !x.info ? { source: `${x.acct}.${x.field ?? 'data'}`, kind: 'data', acct: x.acct } : undefined
		}
		const kind: SrcKind | undefined = h.k === 'keyp' ? 'key' : h.k === 'ownp' ? 'owner' : h.k === 'lam' ? 'lamports' : h.k === 'data' ? 'data' : undefined
		if (!kind) return undefined
		const field = kind === 'data' ? A!.zcField(h.ty, h.off, n) ?? 'data' : kind
		return { source: `${h.acct}.${field}`, kind, acct: h.acct }
	}

	/** the pointer terms of an address (a sum): not the offsets added to it (constants, products, masks, shifts) */
	const bases_ = (a: Expr): Expr[] => a.k === 'bin' && a.op === 'add' ? [...bases_(a.a), ...bases_(a.b)] : a.k === 'const' || (a.k === 'bin' && a.op !== 'sub') ? [] : [a]
	const of = (fn0: number, e0: Expr, p0: number): Source[] => {
		const out = new Map<string, Source>()
		const add = (s: Source) => { if (!out.has(s.source)) out.set(s.source, s) }
		let budget = 400
		const seen = new Set<string>()
		const walk = (fn: number, e: Expr, p: number, d: number, via = '', ptr = false): void => {
			if (d > 24 || budget-- <= 0) return
			const fo = I.byPc.get(fn), D = defsIn(I, fn)
			if (!fo || !D) return
			if (e.k === 'const' || e.k === 'undef' || e.k === 'reg') return
			const sk = `${fn}|${p}|${ptr ? '*' : ''}${valueKey(I, ctx, fn, e, p)}`
			if (seen.has(sk)) return
			seen.add(sk)
			// (an account, instruction data; the printed load the walk came through names an instruction argument)
			if (e.k === 'load') via = r.facts.get(fn)?.expr?.(e) ?? via
			if (!r.anchor && e.k === 'bin' && e.op === 'add' && e.b.k === 'const') { const x = native(fo).valueAt(e, p); { const y = x?.field ? acctSrc(x.index, x.field) : undefined; if (y) { add(y); return } } }
			if (e.k === 'load' || e.k === 'var') {
				const addr = e.k === 'load' ? e.addr : undefined
				if (addr && D.fpOff(addr) === undefined && isIx(valueKey(I, ctx, fn, addr, p))) { add(ixSrc(via)); return }
				if (e.k === 'var' && isIx(valueKey(I, ctx, fn, e, p))) { add(ixSrc(`${via} ${r.facts.get(fn)?.expr?.(e) ?? ''}`)); return }
				if (addr && D.fpOff(addr) === undefined) {
					if (r.anchor) { const s = anchorSrc(evIn(fn)?.ev(addr, p), e.k === 'load' ? e.size : 8); if (s) { add(s); return } }
					else { const x = native(fo).valueAt(e, p); { const y = x?.field ? acctSrc(x.index, x.field) : undefined; if (y) { add(y); return } } }
				}
				// (the value is an account reference: its key)
				if (!r.anchor && e.k === 'var') { const x = native(fo).valueAt(e, p); { const y = x?.field ? acctSrc(x.index, x.field) : undefined; if (y) { add(y); return } } }
				if (r.anchor) { const h = evIn(fn)?.ev(e, p); if (h && h.k === 'info' && !h.guess) { add({ source: `${h.acct}.key`, kind: 'key', acct: h.acct }); return } }
			}
			switch (e.k) {
				case 'var': {
					if (e.id === D.fp) return
					const y: [Expr, number] | null = D.defs.has(e.id) ? [D.defs.get(e.id)!, D.defPos.get(e.id)!] : D.multi.has(e.id) ? D.reaching(e.id, p) : null
					if (y) { if (y[0].k === 'call') callSrc(fn, y[0], y[1], d, via); else walk(fn, y[0], y[1], d + 1, via, ptr); return }
					const v = fo.f.vars[e.id]
					if (v && v.param >= 1 && v.param !== 10 && !D.multi.has(e.id)) {
						const par = !ctx || fn === ctx.handler ? undefined : ctx.parents.get(fn)
						const st = par?.pc !== undefined ? stmtAt(I, par.fn, par.pc) : undefined
						const c = st && callOf(st[0])
						const i = v.param < 100 ? v.param - 1 : 4 + (v.param - 100)
						if (c && c.t.k === 'fn' && c.t.pc === fn && c.args[i]) walk(par!.fn, c.args[i], st![1], d + 1, via, ptr)
					}
					return
				}
				case 'load': {
					const o = D.fpOff(e.addr)
					if (o !== undefined) {
						const y = (e.size === 8 ? D.reaching(D.SLOT(o), p) : null) ?? D.reaching(D.SLOT(o - (o & 7)), p, true)
						if (y) { if (y[0].k === 'call') callSrc(fn, y[0], y[1], d, via); else walk(fn, y[0], y[1], d + 1, via) }
						return
					}
					// (read through a pointer: what it points into; not the offsets added to it, e.g. an aligned length)
					walk(fn, e.addr, p, d + 1, via, true)
					return
				}
				case 'call': callSrc(fn, e, p, d, via); return
				case 'bin': for (const x of ptr ? bases_(e) : [e.a, e.b]) walk(fn, x, p, d + 1, via, ptr && x !== e); return
				case 'ext': case 'neg': case 'not': case 'bswap': case 'lnot': walk(fn, e.a, p, d + 1, via); return
				case 'sel': walk(fn, e.a, p, d + 1, via); walk(fn, e.b, p, d + 1, via); return
				case 'fn': for (const a of e.args) walk(fn, a, p, d + 1, via); return
				default: return
			}
		}
		/** a call's result / the object it fills: a sysvar, the return data of a CPI, else what its arguments come from */
		const callSrc = (fn: number, c: Extract<Expr, { k: 'call' }>, p: number, d: number, via: string) => {
			const nm = calleeName(c)
			const sv = SYSVAR.exec(nm)
			if (sv) { const k = sv[1] ?? sv[2] ?? sv[3]; add({ source: k ? `sysvar ${k.toLowerCase()}` : 'sysvar', kind: 'sysvar' }); return }
			if (RETURN_DATA.test(nm)) { add({ source: 'CPI return data', kind: 'return-data' }); return }
			for (const a of c.args) walk(fn, a, p, d + 1, via)
		}
		/** instruction data, by the argument the printed load names */
		const ixSrc = (t: string): Source => {
			const g = args.find(x => new RegExp(`\\b${x}\\b`).test(t))
			return { source: g ? `ix.${g}` : 'instruction data', kind: 'ix' }
		}
		walk(fn0, e0, p0, 0)
		return [...out.values()]
	}
	return { of }
}
