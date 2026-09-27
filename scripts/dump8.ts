// Stage 8 dumps (the analysis foundation, src/analysis/*): per-function facts as printing collects them
// (`facts`), and the flow layer's outputs (`flow`). Canonical encoding: rs/README.md. Read-only: the
// facts are serialized before the single file's analysis runs (decompile's debugHooks), the rest after.
import type { Expr } from '../src/ir.ts'
import { decompile, debugHooks, type Result } from '../src/decompile.ts'
import type { FnFacts } from '../src/analysis/facts.ts'
import type { IdlInfo } from '../src/idl.ts'
import { expr } from './dump.ts'

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

/**
 * Stage 8: `facts` = the per-function facts of the default output (library classification), as printing
 * collected them (before the single file's analysis adds to them).
 */
export function dumpStage8(bytes: Uint8Array, stages: readonly string[], res: Map<string, string>, idl?: IdlInfo) {
	const want = ['facts'].filter(s => stages.includes(s))
	if (!want.length) return
	let facts: string[] | undefined
	debugHooks.beforeRender = r => { facts = factsLines(r) }
	try { decompile(bytes, { idl }) } catch (e) {
		debugHooks.beforeRender = undefined
		for (const st of want) res.set(st, header(st) + (st === 'facts' && facts ? facts.join('') : '') + line({ error: errMsg(e) }))
		return
	} finally { debugHooks.beforeRender = undefined }
	if (stages.includes('facts')) res.set('facts', header('facts') + facts!.join(''))
}
