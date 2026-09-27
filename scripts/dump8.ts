// Stage 8 dumps (the analysis foundation, src/analysis/*): per-function facts as printing collects them
// (`facts`), and the flow layer's outputs (`flow`). Canonical encoding: rs/README.md. Read-only: the
// facts are serialized before the single file's analysis runs (decompile's debugHooks), the rest after.
import type { Expr } from '../src/ir.ts'
import { decompile, debugHooks, type Result } from '../src/decompile.ts'
import type { FnFacts } from '../src/analysis/facts.ts'
import type { IdlInfo } from '../src/idl.ts'
import { expr } from './dump.ts'
import { analyze } from '../src/analysis/report.ts'
import { addExitWrites, exitFns, indirectTargets, splitDispatch, tryInfo, dataReads, ctxResolver, calleeOf, cfgOf, callOf, decisionBlock, type Side } from '../src/analysis/flow.ts'
import { irOf, pathTo, blockAt, valueKey, cmpsOf, stmtAt } from '../src/analysis/paths.ts'
import { sourceCtx } from '../src/analysis/sources.ts'
import type { AccountRow, IxCtx, IxOut } from '../src/analysis/report.ts'
import type { DispatchGroups } from '../src/analysis/flow.ts'

const line = (v: unknown) => JSON.stringify(v) + '\n'
const header = (stage: string) => line({ stage, format: 1 })
const errMsg = (e: unknown) => (e instanceof RangeError ? 'out of bounds' : e instanceof Error ? e.message : String(e))

/** an object without its undefined / false-by-absence keys, in the given key order */
function obj(kv: [string, unknown][]): Record<string, unknown> {
	const o: Record<string, unknown> = {}
	for (const [k, v] of kv) if (v !== undefined) o[k] = v
	return o
}
const ex = (e: Expr | undefined) => (e ? expr(e) : undefined)

export function factsLines(r: Result): string[] {
	const out: string[] = []
	for (const [pc, ff] of r.facts) out.push(...fnFactsLines(pc, ff))
	return out
}

export function fnFactsLines(pc: number, ff: FnFacts): string[] {
	const out: string[] = []
	out.push(line(obj([['t', 'fn'], ['pc', pc], ['name', ff.name], ['wrapper', ff.wrapper || undefined], ['at', ff.at], ['types', [...ff.types]]])))
	for (const c of ff.checks) out.push(line(obj([
		['t', 'check'], ['line', c.line], ['pc', c.pc], ['cond', c.cond], ['failsIf', c.failsIf], ['error', c.error], ['kinds', c.kinds],
		['refs', c.refs.map(x => obj([['acct', x.acct], ['field', x.field]]))], ['named', c.named], ['main', c.main], ['before', c.before],
		['via', c.via ? { fn: c.via.fn, kinds: c.via.kinds } : undefined], ['c', ex(c.c)], ['passPc', c.passPc], ['cmp32', c.cmp32 || undefined],
		['logRel', c.logRel], ['pubkeys', c.pubkeys || undefined],
	])))
	for (const o of ff.ops) out.push(line(obj([
		['t', 'op'], ['line', o.line], ['pc', o.pc], ['kinds', o.kinds], ['text', o.text], ['main', o.main], ['errPath', o.errPath],
		['cpi', o.cpi ? obj([
			['program', o.cpi.program], ['known', o.cpi.known], ['checked', o.cpi.checked], ['seeds', o.cpi.seeds], ['fields', o.cpi.fields],
			['accounts', o.cpi.accounts.map(a => obj([['role', a.role], ['text', a.text], ['w', a.w], ['s', a.s]]))],
			['src', o.cpi.src ? obj([['program', ex(o.cpi.src.program)], ['accounts', o.cpi.src.accounts.map(x => ex(x) ?? null)], ['fields', o.cpi.src.fields.map(x => ex(x) ?? null)]]) : undefined],
			['family', o.cpi.family], ['ix', o.cpi.ix],
		]) : undefined],
		['target', o.target ? obj([['acct', o.target.acct], ['field', o.target.field]]) : undefined], ['how', o.how], ['value', o.value],
		['pda', o.pda ? { fn: o.pda.fn, seeds: o.pda.seeds, program: o.pda.program } : undefined], ['via', o.via], ['ret', ex(o.ret)], ['exit', o.exit], ['handler', o.handler],
	])))
	for (const c of ff.calls) out.push(line(obj([['t', 'call'], ['line', c.line], ['pc', c.pc], ['ret', ex(c.ret)], ['callee', c.callee], ['main', c.main], ['errPath', c.errPath]])))
	for (const h of ff.ixHints) out.push(line(obj([['t', 'hint'], ['line', h.line], ['program', h.program], ['family', h.family], ['ix', h.ix], ['how', h.how], ['call', h.call ? { fn: h.call.fn, pc: h.call.pc } : undefined]])))
	out.push(line({ t: 'pcline', m: [...ff.pcLine] }))
	out.push(line({ t: 'condline', m: [...ff.condLine].map(([e, l]) => [expr(e), l]) }))
	return out
}

const hex = (v: bigint) => '0x' + v.toString(16)
const acctRef = (x: { index: number; field?: string } | undefined) => (x ? [x.index, x.field ?? null] : null)
const sideJ = (s: Side) => (s === undefined ? null : typeof s === 'string' ? s : acctRef(s))

/** (report.ts parseIdlAccount) */
function parseIdlAccount(s: string, i: number): AccountRow {
	const m = /^(\S+)(?: \[(.*)\])?$/.exec(s)!
	const flags = (m[2] ?? '').split(', ')
	const addr = flags.find(f => f.startsWith('= '))
	return {
		index: i, name: m[1].split('.').pop()!, source: 'idl', constraints: {},
		expected: { signer: flags.includes('signer') || undefined, writable: flags.includes('mut') || undefined, pda: flags.includes('pda') || undefined, optional: flags.includes('optional') || undefined, address: addr?.slice(2) },
	}
}

/**
 * Every instruction context the report's analyze0 builds (its instruction loop, contexts only: before the
 * report drops the dispatch parts without checks or operations and sorts the instructions by score), in
 * creation order.
 */
function ixContexts(r: Result): { name: string; fns: number[]; ctx: IxCtx; accounts: AccountRow[]; indirect: string[] }[] {
	const facts = r.facts, p = r.program
	const ind = indirectTargets(r)
	const byPc = new Map(r.funcs.map(f => [f.pc, f]))
	const procNames = new Set(r.processors.map(x => x.fn))
	let roots = r.funcs.filter(f => f.name.startsWith('ix_') || procNames.has(f.name))
	if (!roots.length) roots = r.funcs.filter(f => f.f.isEntry)
	const rootPcs = new Set(roots.map(f => f.pc))
	const splits = new Map<number, DispatchGroups>()
	if (!r.anchor) for (const h of roots) if (!h.name.startsWith('ix_')) { const g = splitDispatch(r, h, rootPcs); if (g) splits.set(h.pc, g) }
	const libCalls = (pc: number): number[] => {
		const l: number[] = []
		for (const b of p.funcs.get(pc)!.blocks) for (const st of b.stmts) if (st.k === 'call' && st.t.k === 'fn') l.push(st.t.pc)
		return l
	}
	const out: { name: string; fns: number[]; ctx: IxCtx; accounts: AccountRow[]; indirect: string[] }[] = []
	for (const h of roots) for (const grp of splits.get(h.pc) ?? [undefined]) {
		const name = grp ? grp.name : h.name.startsWith('ix_') ? h.name.slice(3) : h.name
		const info = grp ? undefined : r.instructions.find(i => i.pc === h.pc)
		const keep = (fn: number, pc: number | undefined) => !grp || pc === undefined || grp.keep(fn, pc)
		const isDisp = (fn: number) => !!grp && grp.dispatchers.includes(facts.get(fn)?.name ?? '')
		const keepCall = (fn: number, c: { pc?: number; ret?: Expr }) => {
			if (!grp || c.pc !== undefined) return keep(fn, c.pc)
			const fo = byPc.get(fn), b = fo && c.ret ? cfgOf(fo).retBlock.get(c.ret) : undefined
			return b === undefined || grp.allowed(fn, b)
		}
		const main = new Map<number, boolean>([[h.pc, true]])
		const lib = new Set<number>()
		const q = [h.pc]
		const parents: IxCtx['parents'] = new Map()
		let from: { fn: number; pc?: number; ret?: Expr } | undefined
		const reach = (callee: number, cm: boolean) => {
			if (rootPcs.has(callee)) return
			if (from && !parents.has(callee) && callee !== h.pc) parents.set(callee, from)
			if (!facts.has(callee)) {
				if (lib.has(callee) || !p.funcs.has(callee)) return
				lib.add(callee)
				for (const t of libCalls(callee)) reach(t, false)
				return
			}
			const prev = main.get(callee)
			if (prev === undefined || (cm && !prev)) { main.set(callee, cm); q.push(callee) }
		}
		const generated = h.name.startsWith('ix_') && r.anchor
		const indirect: string[] = []
		const viaPtr = (t: number, why: string) => { if (!main.has(t) && !rootPcs.has(t) && facts.has(t)) { if (facts.get(t)!.ops.length || !why.startsWith('function')) indirect.push(`${facts.get(t)!.name} (${why})`); reach(t, false) } }
		if (info) for (const t of ind.byDisc.get(info.disc) ?? []) viaPtr(t, 'entrypoint table entry chosen by the discriminator')
		while (q.length) {
			const x = q.shift()!
			const m = main.get(x)!
			for (const c of facts.get(x)?.calls ?? []) if ((!c.errPath || isDisp(x)) && keepCall(x, c)) { from = { fn: x, pc: c.pc, ret: c.ret }; reach(c.callee, m && (c.main || (generated && x === h.pc))) }
			from = { fn: x }
			for (const t of ind.targets.get(x) ?? []) viaPtr(t, `function pointer in ${facts.get(x)?.name}`)
		}
		const fns = [...main.keys()].filter(pc => facts.has(pc))
		const accounts: AccountRow[] = info?.accounts?.length ? info.accounts.map(parseIdlAccount)
			: grp?.accounts ? grp.accounts.map((n, i) => ({ index: i, name: n, source: 'known' as const, expected: {}, constraints: {} }))
			: (info?.strAccounts ?? []).map((n, i) => ({ index: i, name: n, source: 'str' as const, expected: {}, constraints: {} }))
		const ctx: IxCtx = { handler: h.pc, parents, allowed: grp?.allowed, restricted: grp && new Set(fns.filter(f => grp.dispatchers.includes(facts.get(f)!.name))), tag: grp?.tag }
		out.push({ name, fns, ctx, accounts, indirect })
	}
	return out
}

/**
 * The flow layer's outputs (after the analysis ran, as the report consumed them): exit functions, the ops
 * the exit / callee writes added to the facts, indirect targets, native dispatch splits (with their allowed
 * blocks), try_accounts layouts, data reads; per instruction its context (functions, parents, dispatch
 * part, initial accounts), the native account resolvers of its functions (ctxResolver: names, per branch
 * the account refs / sides / 32-byte / PDA comparisons, per statement the account field a store writes),
 * the path conditions and value keys of the points the report reads (ops, checks), and the sources of the
 * ops' values.
 */
export function flowLines(r: Result, check = true): string[] {
	const out: string[] = []
	// (check: after the analysis, its instruction contexts compared with the dump's; else (timing, before the analysis) the
	// exit writes it starts with)
	const a = check ? analyze(r) : undefined
	if (!check) addExitWrites(r)
	for (const [pc, ex] of exitFns(r)) out.push(line(obj([['t', 'exit'], ['pc', pc], ['type', ex.type], ['param', ex.param], ['fields', ex.fields.map(f => [f.off, f.size, f.name])],
		['subs', ex.subs?.map(s => obj([['type', s.type], ['fields', s.fields.map(f => [f.off, f.size, f.name])], ['name', s.name]]))]])))
	for (const [pc, ff] of r.facts) for (const o of ff.ops) if (o.exit !== undefined) out.push(...fnFactsLines(pc, { ...ff, checks: [], calls: [], ixHints: [], ops: [o], types: new Map(), pcLine: new Map(), condLine: new Map() }).slice(1, 2).map(l => l.replace('{"t":"op"', `{"t":"xop","fn":${pc}`)))
	const ind = indirectTargets(r)
	out.push(line({ t: 'indirect', targets: [...ind.targets], byDisc: [...ind.byDisc].map(([d, l]) => [hex(d), l]) }))
	const byPc = new Map(r.funcs.map(f => [f.pc, f]))
	const procNames = new Set(r.processors.map(x => x.fn))
	let roots = r.funcs.filter(f => f.name.startsWith('ix_') || procNames.has(f.name))
	if (!roots.length) roots = r.funcs.filter(f => f.f.isEntry)
	const rootPcs = new Set(roots.map(f => f.pc))
	if (!r.anchor) for (const h of roots) if (!h.name.startsWith('ix_')) {
		const g = splitDispatch(r, h, rootPcs)
		if (!g) continue
		out.push(line({ t: 'split', root: h.pc, via: [...g.via ?? []], groups: g.map(x => obj([['tags', x.tags], ['name', x.name], ['source', x.source], ['accounts', x.accounts], ['dispatchers', x.dispatchers], ['tag', [x.tag.fn, x.tag.v]]])) }))
		for (const x of g) for (const fo of r.funcs) if (x.dispatchers.includes(fo.name)) out.push(line({ t: 'allowed', name: x.name, fn: fo.pc, m: fo.f.blocks.map((_, b) => (x.allowed(fo.pc, b) ? '1' : '0')).join('') }))
	}
	for (const f of r.funcs) if (f.name.startsWith('ix_') && r.anchor) {
		const ti = tryInfo(r, f)
		if (ti) out.push(line(obj([['t', 'try'], ['h', f.pc], ['tryPc', ti.tryPc], ['layout', ti.layout.map(x => [x.name, x.off, x.t.k === 'ref' ? x.t.to : x.t.k === 'embed' ? `embed ${x.t.type}` : `scalar ${x.t.size}`, x.doc ?? null])],
			['boxInfo', ti.boxInfo ? [...ti.boxInfo] : undefined], ['words', ti.words ? [...ti.words].map(([o, [n, w]]) => [o, n, w]) : undefined], ['ptrs', ti.ptrs ? [...ti.ptrs] : undefined], ['seqs', ti.seqs ? [...ti.seqs] : undefined]])))
		const dr = dataReads(r, f.pc)
		if (dr) out.push(line({ t: 'dataReads', h: f.pc, accts: [...dr] }))
	}
	const I = irOf(r)
	const ixs = ixContexts(r)
	// (the contexts the analysis built, for the instructions it kept, are these)
	for (const ix of a?.ixs ?? []) {
		const x = ixs.find(y => y.name === ix.name && y.ctx.handler === ix.ctx!.handler)
		const fnames = x?.fns.map(pc => r.facts.get(pc)!.name)
		if (!x || JSON.stringify(fnames) !== JSON.stringify(ix.functions) || JSON.stringify([...x.ctx.parents.keys()]) !== JSON.stringify([...ix.ctx!.parents.keys()])) throw new Error(`dump: instruction context mismatch (${ix.name})`)
	}
	for (const ix of ixs) {
		const ctx = ix.ctx
		const fns = ix.fns
		out.push(line(obj([['t', 'ix'], ['name', ix.name], ['handler', ctx.handler], ['functions', fns], ['parents', [...ctx.parents].map(([fn, p]) => [fn, p.fn, p.pc ?? null, p.ret ? expr(p.ret) : null])],
			['restricted', ctx.restricted ? [...ctx.restricted] : undefined], ['tag', ctx.tag ? [ctx.tag.fn, ctx.tag.v] : undefined], ['indirect', ix.indirect],
			['accounts', ix.accounts.map(x => [x.index ?? null, x.name, x.source, x.expected.signer ?? false, x.expected.writable ?? false, x.expected.pda ?? false, x.expected.optional ?? false, x.expected.address ?? null])]])))
		if (!r.anchor) for (const fn of fns) {
			const R = ctxResolver({ byPc }, calleeOf(r), ctx, fn)
			const fo = byPc.get(fn)
			if (!R || !fo) continue
			const conds: unknown[] = [], stores: unknown[] = []
			fo.f.blocks.forEach((b, bi) => {
				b.stmts.forEach((s, i) => { const x = R.store(s); if (x) stores.push([bi << 16 | i, x.index, x.field ?? null, x.how ?? null]) })
				if (b.term.k === 'br') { const c = b.term.c; conds.push([bi, R.refs(c).map(acctRef), R.sides(c)?.map(sideJ) ?? null, R.cmp32(c), R.pdaEq(c) ?? null, R.pdaBufs(c)]) }
			})
			out.push(line({ t: 'res', fn, byName: [...R.byName].map(([n, x]) => [n, x.index, x.field ?? null]), conds, stores }))
		}
		// (the points the report reads: ops and checks of the instruction's functions)
		const pts: [number, number | undefined][] = []
		for (const fn of fns) {
			const ff = r.facts.get(fn)!
			for (const o of ff.ops) pts.push([fn, blockAt(I, fn, o.pc, o.ret)])
			const fo = byPc.get(fn)
			for (const c of ff.checks) pts.push([fn, fo && decisionBlock(cfgOf(fo), c.c, c.pc, c.passPc)])
		}
		const seenPt = new Set<string>(), seenC = new Set<string>()
		for (const [fn, b] of pts) {
			if (b === undefined || seenPt.has(`${fn}:${b}`)) continue
			seenPt.add(`${fn}:${b}`)
			const cs = pathTo(I, ctx, fn, b)
			out.push(line({ t: 'path', fn, b, conds: cs.map(c => [c.fn, c.b, c.holds ?? null, c.how, c.panics ?? false]) }))
			// (each condition's value key and comparisons, once per instruction)
			for (const c of cs) {
				if (seenC.has(`${c.fn}:${c.b}`)) continue
				seenC.add(`${c.fn}:${c.b}`)
				out.push(line({ t: 'vk', fn: c.fn, b: c.b, key: valueKey(I, ctx, c.fn, c.c, c.pos), cmps: cmpsOf(I, ctx, c.fn, c.c, c.pos) }))
			}
		}
		const S = sourceCtx(r, ix as unknown as IxOut)
		for (const fn of fns) for (const o of r.facts.get(fn)!.ops) {
			if (o.pc === undefined) continue
			const st = stmtAt(I, fn, o.pc)
			if (!st) continue
			const [s, p] = st
			const vals = s.k === 'store' ? [s.v] : callOf(s)?.args ?? []
			out.push(line({ t: 'src', fn, pc: o.pc, v: vals.map(v => S.of(fn, v, p).map(x => [x.source, x.kind, x.acct ?? null])) }))
		}
	}
	return out
}

/**
 * Stage 8: `facts` = the per-function facts of the default output (library classification), as printing
 * collected them (before the single file's analysis adds to them); `flow` = flowLines.
 */
export function dumpStage8(bytes: Uint8Array, stages: readonly string[], res: Map<string, string>, idl?: IdlInfo) {
	const want = ['facts', 'flow'].filter(s => stages.includes(s))
	if (!want.length) return
	let facts: string[] | undefined
	let r: Result
	debugHooks.beforeRender = x => { facts = factsLines(x) }
	try { r = decompile(bytes, { idl }) } catch (e) {
		debugHooks.beforeRender = undefined
		for (const st of want) res.set(st, header(st) + (st === 'facts' && facts ? facts.join('') : '') + line({ error: errMsg(e) }))
		return
	} finally { debugHooks.beforeRender = undefined }
	if (stages.includes('facts')) res.set('facts', header('facts') + facts!.join(''))
	if (stages.includes('flow')) {
		let fl: string
		try { fl = flowLines(r).join('') } catch (e) { fl = line({ error: errMsg(e) }) }
		res.set('flow', header('flow') + fl)
	}
}
