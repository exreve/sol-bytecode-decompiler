// Output layout. Solana programs have a single entrypoint that dispatches on instruction data,
// so the "public API" is the set of instruction handlers. Functions are grouped by the
// instruction handlers that reach them in the call graph:
//   index.ts       program summary + instruction table (exports)
//   entrypoint.ts  entrypoint / dispatcher and code not owned by a single instruction
//   ix/<name>.ts   one instruction handler + helpers used only by it
//   shared.ts      user helpers used by several instructions
//   lib.d.ts       runtime model, syscalls, library stubs
import type { Result, FuncOut } from './decompile.ts'
import { SYSCALLS } from './syscalls.ts'
import { VIEW_NOTATION } from './views.ts'
import { renderFingerprints } from './fingerprint.ts'
import { cfgOf } from './analysis/flow.ts'
import { BUDGET, budgetJson, budgetMarkdown, IX_ORDER, SUMMARY_ORDER } from './budget.ts'
import { analyze, renderJson, renderSummary, renderIx, renderSummaryComment, type Where } from './analysis/report.ts'

export const PRELUDE = `// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// ret_tail_N(…) / tail_N(…): outlined tails, functions defined in the output: a call runs exactly the statements it replaced
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)`

const TYPES = `type u64 = number
type u8 = u64
type u16 = u64
type u32 = u64
type i8 = u64
type i16 = u64
type i32 = u64
type i64 = u64
declare const fp: u64
declare const undef: u64
declare function ld8(a: u64): u64
declare function ld16(a: u64): u64
declare function ld32(a: u64): u64
declare function ld64(a: u64): u64
declare function st8(a: u64, ...v: u64[]): void
declare function st16(a: u64, ...v: u64[]): void
declare function st32(a: u64, ...v: u64[]): void
declare function st64(a: u64, ...v: u64[]): void
declare function copy(dst: u64, src: u64, n: u64): void
declare function copyr(dst: u64, src: u64, n: u64): void
declare function sar(x: u64, n: u64): u64 // arithmetic (sign-filling) shift right
declare function shl(x: u64, n: u64): u64 // x << n (function form, used where the << operator would parse ambiguously)
declare function popcount(x: u64): u64 // number of 1 bits
declare function clz(x: u64): u64 // leading zero bits of the 64-bit value (64 for 0)
declare function ctz(x: u64): u64 // trailing zero bits (64 for 0)
declare function rotl(x: u64, n: u64): u64 // 64-bit rotate left by n % 64
declare function min(a: u64, b: u64): u64 // unsigned
declare function max(a: u64, b: u64): u64 // unsigned
declare function smin(a: u64, b: u64): u64 // signed (i64) minimum
declare function smax(a: u64, b: u64): u64 // signed (i64) maximum
declare function sat_sub(a: u64, b: u64): u64 // a >= b ? a - b : 0
declare function memeq(p: u64, q: u64, n: u64): boolean // n bytes at p == n bytes at q (ascending 8-byte words, stops at first difference)
declare function keyeq(p: u64, key: string): boolean // 32 bytes at p == the base58 public key (same word-wise comparison)
declare function rc_inc(p: u64, x?: u64): void // Rc count increment: x = ld64(p) (unless given); st64(p, x + 1); if (x == -1) abort()
declare function rc_dec(p: u64, x?: u64): void // Rc drop: x = ld64(p) (unless given); st64(p, x - 1); if (x == 1) st64(p + 8, ld64(p + 8) - 1)
declare function rc_release(p: u64, x?: u64): boolean // Rc strong-count release: x = ld64(p) (unless given); st64(p, x - 1); result x == 1 (the last reference: the caller then drops the value)
declare function sdiv(a: u64, b: u64): u64 // signed (i64) division (traps on 0 and MIN / -1)
declare function sdiv32(a: u64, b: u64): u64 // signed division of the low 32 bits, zero-extended result
declare function srem32(a: u64, b: u64): u64 // signed remainder of the low 32 bits, zero-extended result
declare function mulhu(a: u64, b: u64): u64 // high 64 bits of the unsigned 128-bit product
declare function mulhs(a: u64, b: u64): u64 // high 64 bits of the signed 128-bit product
declare function bswap16(x: u64): u64 // byte swap of the low 16 bits
declare function bswap32(x: u64): u64 // byte swap of the low 32 bits
declare function bswap64(x: u64): u64 // byte swap
declare function srem(a: u64, b: u64): u64 // signed (i64) remainder
declare function trap(msg: string): never
declare function callx(fn: u64, ...args: u64[]): u64`

const lineCount = (f: FuncOut) => { let n = 1; for (let i = f.text.indexOf('\n'); i >= 0; i = f.text.indexOf('\n', i + 1)) n++; return n }

export interface Group { key: string; title: string; funcs: FuncOut[] }

/** A function's text cut down to some of its paths: map[line - 1] = the line in text (1-based) of each original line. */
export interface Sliced { text: string; lines: number; map: number[] }

/** Net brace depth change of a line and its lowest running depth (braces in strings and comments ignored). */
function braces(l: string): { d: number; min: number } {
	let d = 0, min = 0
	for (let i = 0; i < l.length; i++) {
		const c = l[i]
		if (c === '"' || c === "'" || c === '`') { for (i++; i < l.length && l[i] !== c; i++) if (l[i] === '\\') i++; continue }
		if (c === '/' && l[i + 1] === '/') break
		if (c === '/' && l[i + 1] === '*') { const e = l.indexOf('*/', i + 2); if (e < 0) break; i = e + 1; continue }
		if (c === '{') d++
		else if (c === '}') { d--; if (d < min) min = d }
	}
	return { d, min }
}

/**
 * The text of `fo` restricted to the blocks `allowed` keeps (an instruction's part of a native dispatcher):
 * brace-balanced runs of lines whose statements / conditions all lie in other blocks become one comment
 * line. Only a view (the full function is in `full`); the evaluated output is never sliced.
 */
export function slice(r: Result, fo: FuncOut, allowed: (fn: number, b: number) => boolean, full: string): Sliced | undefined {
	const ff = r.facts.get(fo.pc)
	if (!ff) return undefined
	const g = cfgOf(fo)
	const lines = fo.text.split('\n')
	// per line: 1 = code of this instruction, 2 = only code of others, 0 = no code (braces, declarations, comments)
	const st = new Uint8Array(lines.length)
	const mark = (line: number, b: number | undefined) => {
		if (b === undefined || line < 1 || line > lines.length) return
		if (allowed(fo.pc, b)) st[line - 1] = 1
		else if (st[line - 1] !== 1) st[line - 1] = 2
	}
	for (const [pc, line] of ff.pcLine) mark(line, g.pcBlock.get(pc))
	for (const [c, line] of ff.condLine) mark(line, g.condBlock.get(c))
	if (!st.includes(2)) return undefined
	const out: string[] = [], map: number[] = new Array(lines.length)
	const br = lines.map(braces)
	for (let i = 0; i < lines.length;) {
		// the longest run from i without code of this instruction, brace-balanced, with code of others
		let best = -1
		if (st[i] !== 1) {
			let depth = 0, other = false
			for (let j = i; j < lines.length && st[j] !== 1; j++) {
				if (depth + br[j].min < 0) break
				depth += br[j].d
				if (st[j] === 2) other = true
				if (depth === 0 && other) best = j
			}
		}
		if (best >= i) {
			const n = best - i + 1
			out.push(`${/^\s*/.exec(lines[i])![0]}// … ${n} lines of other instructions (full function: ${full})`)
			for (let k = i; k <= best; k++) map[k] = out.length
			i = best + 1
		} else { out.push(lines[i]); map[i] = out.length; i++ }
	}
	return { text: out.join('\n'), lines: out.length, map }
}

/** Instruction handlers (and inline processors) reaching each function through direct calls. */
export function handlerOwners(r: Result): { handlers: FuncOut[]; owners: Map<number, Set<number>>; isRoot: (f: FuncOut) => boolean } {
	const byPc = new Map(r.funcs.map(f => [f.pc, f]))
	const procNames = new Set(r.processors.map(x => x.fn))
	const isRoot = (f: FuncOut) => f.name.startsWith('ix_') || procNames.has(f.name)
	const handlers = r.funcs.filter(isRoot)
	const owners = new Map<number, Set<number>>()
	for (const h of handlers) {
		const seen = new Set<number>([h.pc])
		const q = [h.pc]
		while (q.length) {
			const x = q.pop()!
			let o = owners.get(x); if (!o) owners.set(x, (o = new Set())); o.add(h.pc)
			for (const t of byPc.get(x)?.calls ?? []) if (byPc.has(t) && !seen.has(t) && !isRoot(byPc.get(t)!)) { seen.add(t); q.push(t) }
		}
	}
	return { handlers, owners, isRoot }
}

export function groups(r: Result): { entry: Group; ix: Group[]; shared: Group } {
	const byPc = new Map(r.funcs.map(f => [f.pc, f]))
	const { handlers, owners, isRoot } = handlerOwners(r)
	const entry: Group = { key: 'entrypoint', title: 'entrypoint, dispatcher and code outside instruction handlers', funcs: [] }
	const shared: Group = { key: 'shared', title: 'helpers used by several instructions', funcs: [] }
	const ix = new Map<number, Group>(handlers.map(h => [h.pc, h.name.startsWith('ix_')
		? { key: `ix/${h.name.slice(3)}`, title: `instruction ${h.name.slice(3)}`, funcs: [] }
		: { key: `processor_${h.name}`, title: `instruction processor ${h.name} (handles several instructions inline)`, funcs: [] }]))
	// order: handler first, then helpers in call order
	const placed = new Set<number>()
	for (const h of handlers) {
		const g = ix.get(h.pc)!
		const order: number[] = []
		const seen = new Set<number>()
		const dfs = (x: number) => { if (seen.has(x)) return; seen.add(x); order.push(x); for (const t of byPc.get(x)?.calls ?? []) if (byPc.has(t) && owners.get(t)?.size === 1 && owners.get(t)!.has(h.pc) && !isRoot(byPc.get(t)!)) dfs(t) }
		dfs(h.pc)
		for (const x of order) { g.funcs.push(byPc.get(x)!); placed.add(x) }
	}
	for (const f of r.funcs) {
		if (placed.has(f.pc)) continue
		const o = owners.get(f.pc)
		if (o && o.size > 1) shared.funcs.push(f)
		else entry.funcs.push(f)
	}
	entry.funcs.sort((a, b) => (a.f.isEntry ? -1 : b.f.isEntry ? 1 : a.pc - b.pc))
	return { entry, ix: [...ix.values()], shared }
}

/**
 * What the layout looks up in a function's text, found once per function (the single file, the
 * modules, lib.d.ts and every bundle containing the function used to run the same regular
 * expressions over it again): the names called `name(` (CALLED: each distinct name in order of
 * first appearance), and the type names after `: ` / `as ` (VIEWS, same). A match never spans two
 * functions' texts (they are joined with line breaks), so scanning the functions one by one finds
 * what scanning their joined text finds, in the same order.
 */
const CALLED = /\b([A-Za-z_][A-Za-z0-9_]*)\(/g
const scanned = new WeakMap<FuncOut, { called: string[]; views: string[] }>()
function scan(f: FuncOut): { called: string[]; views: string[] } {
	let r = scanned.get(f)
	if (!r) {
		r = { called: [...new Set([...f.text.matchAll(CALLED)].map(m => m[1]))], views: [...new Set([...f.text.matchAll(/(?::|\bas) ([A-Z][A-Za-z0-9_]*)\b/g)].map(m => m[1]))] }
		scanned.set(f, r)
	}
	return r
}
/** Names called in these functions that match `re` (a subset of CALLED's names: see below). */
function calledNames(funcs: FuncOut[], re: RegExp): Set<string> {
	const names = new Set<string>()
	for (const f of funcs) for (const n of scan(f).called) if (re.test(n)) names.add(n)
	return names
}
// `\b([a-z_][a-z0-9_]*)\(` and `\b(sol_[a-z0-9_]+|abort)\(` (as used before) match exactly the
// CALLED matches whose name has that form: a CALLED match is a whole identifier followed by `(`,
// and so is every match of those (a shorter lowercase run inside a longer identifier is not
// preceded by a word boundary, or not followed by `(`)
const LOWER = /^[a-z_][a-z0-9_]*$/, SYSCALL = /^(sol_[a-z0-9_]+|abort)$/

/** Declarations (with their one-line semantics) of the commented helper functions the output uses. */
function usedHelpers(r: Result): string[] {
	const names = calledNames(r.funcs, LOWER)
	return TYPES.split('\n').filter(l => { const m = /^declare function (\w+)\(.*\/\/ /.exec(l); return m && names.has(m[1]) })
}

/** Declarations of the typed views the output uses (x.field notation), with the notation itself. */
function usedViews(r: Result, funcs: FuncOut[] = r.funcs): string[] {
	const names = new Set<string>()
	for (const f of funcs) for (const n of scan(f).views) if (r.views.map.has(n)) names.add(n)
	if (!names.size) return []
	return ['// typed views: x.field is exactly the load / store / address given by the field declaration', ...VIEW_NOTATION, ...r.views.render(names)]
}

function usedSyscalls(r: Result, called?: Set<string>): string[] {
	const names = called ?? calledNames(r.funcs, SYSCALL)
	const out: string[] = []
	for (const sc of SYSCALLS) if (names.has(sc.alias)) out.push(`declare function ${sc.alias}(${sc.params.map(p => `${p}: u64`).join(', ')})${sc.noreturn ? ': never' : sc.ret ? ': u64' : ': void'} // ${sc.doc}`)
	return out
}

const OUTLINED = '// outlined tails: repeated statements ending in a return, defined once; each call runs exactly these statements (arguments: the values and stack objects they use)'

/** How recovered names are marked (per-function "// names" / "// accounts" lines carry the tags). */
export const PROVENANCE = `// recovered names carry their source: [idl] Anchor IDL · [str] the program's own strings (instruction logs, Anchor account-error
//   names) · [known] well-known program ids and layouts · [heur] structural inference (verify); per-function "// names" lines list them.
//   Other names are plain temporaries: a..e = parameters r1..r5 (ret: an out parameter, the object the result is written to), f, g, … = locals, s30 = stack object at fp - 0x30 (or named after its role: ix, metas, seeds, fmt, err, prod, …), fn_<addr> = unnamed function`

function summary(r: Result): string[] {
	const p = r.program
	const lines = [PROVENANCE, `// program: sBPF v${p.version}, ${p.insns.length} instructions, ${p.funcs.size} functions (${r.funcs.length} decompiled, ${r.libCount} library)`]
	if (r.instructions.length) {
		lines.push(r.anchor ? `// instructions (Anchor, discriminator = sha256("global:<name>")[..8] of instruction data, as u64):` : `// instruction handlers (named from their "Instruction: X" logs, or [heur] from the discriminator compared before the call):`)
		for (const i of [...r.instructions].sort((a, b) => a.name.localeCompare(b.name))) {
			lines.push(r.anchor ? `//   ${i.name.padEnd(28)} 0x${i.disc.toString(16).padStart(16, '0')}  -> ix_${i.name}` : `//   ${i.name.padEnd(28)} -> ix_${i.name}`)
			if (i.args?.length) lines.push(`//     args [idl]: ${i.args.join(', ')}`)
			if (i.accounts?.length) lines.push(`//     accounts [idl]: ${i.accounts.join(', ')}`)
			else if (i.strAccounts?.length) lines.push(`//     accounts [str, order of first use]: ${i.strAccounts.join(', ')}`)
		}
	}
	for (const pr of r.processors) lines.push(`// instructions handled inline by ${pr.fn} (search its "Instruction: X" log calls): ${pr.names.join(', ')}`)
	return lines
}

export function renderSingle(r: Result): string {
	const g = groups(r)
	const out: string[] = [PRELUDE, ...summary(r), ...renderSummaryComment(analyze(r)), '']
	const helpers = usedHelpers(r)
	if (helpers.length) out.push(`// helpers:`, ...helpers, '')
	const vw = usedViews(r)
	if (vw.length) out.push(...vw, '')
	const sys = usedSyscalls(r)
	if (sys.length) out.push(...sys, '')
	if (r.stubs.length) out.push(`// library functions (recognized, not decompiled):`, ...r.stubs, '')
	if (r.outlined.length) out.push(OUTLINED, ...r.outlined.map(h => h.text + '\n'))
	const section = (grp: { title: string; funcs: FuncOut[] }) => { if (!grp.funcs.length) return; out.push(`// ===== ${grp.title} =====`); for (const f of grp.funcs) out.push(f.text, '') }
	section(g.entry)
	for (const x of g.ix) section(x)
	section(g.shared)
	return out.join('\n')
}

/** security/fingerprints.json, functions tagged with the instructions whose handlers reach them (as grouped in ix/). */
function fingerprints(r: Result): string {
	const { owners } = handlerOwners(r)
	const byPc = new Map(r.funcs.map(f => [f.pc, f]))
	const inline = new Map(r.processors.map(x => [x.fn, x.names]))
	const ixs = (pc: number) => [...new Set([...owners.get(pc) ?? []].flatMap(h => { const n = byPc.get(h)!.name; return n.startsWith('ix_') ? [n.slice(3)] : inline.get(n) ?? [] }))].sort()
	return renderFingerprints(r.program, r.sigs, r.libPcs, ixs)
}

/** Multi-file project: path -> content. */
export function renderProject(r: Result): Map<string, string> {
	const g = groups(r)
	const files = new Map<string, string>()
	const home = new Map<string, string>() // function name -> module path
	for (const grp of [g.entry, g.shared, ...g.ix]) for (const f of grp.funcs) home.set(f.name, grp.key)
	for (const h of r.outlined) home.set(h.name, 'outlined')
	const libNames = new Set(r.stubs.map(s => /declare function (\w+)/.exec(s)![1]))
	const modLoc = new Map<string, { file: string; line: number }>() // function -> its module file and first line
	const bundleLoc = new Map<string, Map<string, (line: number) => number>>() // instruction -> function -> its line -> line in bundle/<ix>.ts
	const mod = (grp: Group) => {
		if (!grp.funcs.length) return
		const imports = new Map<string, Set<string>>()
		for (const f of grp.funcs) for (const n of scan(f).called) {
			const h = home.get(n)
			if (h && h !== grp.key) { let s = imports.get(h); if (!s) imports.set(h, (s = new Set())); s.add(n) }
		}
		const rel = (to: string) => {
			const depth = grp.key.split('/').length - 1
			return (depth ? '../'.repeat(depth) : './') + to + '.ts'
		}
		const head = [`/// <reference path="${grp.key.includes('/') ? '../' : './'}lib.d.ts" />`, `// ${grp.title}`]
		for (const [h, names] of imports) head.push(`import { ${[...names].sort().join(', ')} } from '${rel(h)}'`)
		const body = grp.funcs.map(f => f.text.replace(/^function /m, 'export function ')).join('\n\n')
		files.set(grp.key + '.ts', head.join('\n') + '\n\n' + body + '\n')
		let at = head.length + 2
		for (const f of grp.funcs) { modLoc.set(f.name, { file: grp.key + '.ts', line: at }); at += lineCount(f) + 1 }
	}
	mod(g.entry); mod(g.shared); g.ix.forEach(mod)
	if (r.outlined.length) files.set('outlined.ts', [`/// <reference path="./lib.d.ts" />`, OUTLINED, '', r.outlined.map(h => h.text.replace(/^function /m, 'export function ')).join('\n\n'), ''].join('\n'))
	void libNames
	const lib = [PRELUDE, TYPES, '', ...usedViews(r), '', '// syscalls', ...usedSyscalls(r), '', '// library functions (recognized in many programs; not decompiled)', ...r.stubs].join('\n') + '\n'
	files.set('lib.d.ts', lib)
	const idx = [...summary(r), '']
	for (const i of r.instructions) idx.push(`export { ix_${i.name} } from './ix/${i.name}.ts'`)
	idx.push(`export { entrypoint } from './entrypoint.ts'`)
	files.set('index.ts', idx.join('\n') + '\n')
	// self-contained per-instruction bundles: handler + all user code it reaches + the stubs it needs
	const a = analyze(r)
	const byName = new Map(r.funcs.map(f => [f.name, f]))
	const outlByName = new Map(r.outlined.map(x => [x.name, x]))
	const procNames = new Set(r.processors.map(x => x.fn))
	const isRoot = (f: FuncOut | undefined) => !!f && (f.name.startsWith('ix_') || procNames.has(f.name))
	const namesIn = (text: string) => new Set([...text.matchAll(CALLED)].map(m => m[1]))
	const bundle = (ix: string, h: FuncOut, what: string, view?: (f: FuncOut) => Sliced | undefined) => {
		// breadth-first from the handler (closest helpers first) over the functions its text calls (and the
		// outlined tails it calls): every user function reached is in the bundle
		const order = [h], outl: { name: string; text: string }[] = [], seen = new Set<string>([h.name]), sliced = new Map<FuncOut, Sliced>()
		const q: string[] = []
		// (other instructions' handlers / processors a path calls are not part of this instruction: declared)
		const other: FuncOut[] = []
		const visit = (names: Iterable<string>) => {
			for (const n of names) if (!seen.has(n) && (byName.has(n) || outlByName.has(n))) { seen.add(n); if (isRoot(byName.get(n))) other.push(byName.get(n)!); else q.push(n) }
		}
		const v0 = view?.(h)
		if (v0) sliced.set(h, v0)
		visit(v0 ? namesIn(v0.text) : scan(h).called)
		while (q.length) {
			const n = q.shift()!, g = byName.get(n)
			if (!g) { const o = outlByName.get(n)!; outl.push(o); visit(namesIn(o.text)); continue }
			order.push(g)
			const v = view?.(g)
			if (v) sliced.set(g, v)
			visit(v ? namesIn(v.text) : scan(g).called)
		}
		const sig = (f: FuncOut) => f.text.split('\n').find(l => l.startsWith('function '))!.replace(/^function /, 'declare function ').replace(/ \{$/, '')
		const text = order.map(f => sliced.get(f)?.text ?? f.text).join('\n\n') + (other.length ? '\n\n// other instructions\' handlers called on these paths (see their own bundle / module):\n' + other.map(f => `${sig(f)} // ${f.name.startsWith('ix_') ? `bundle/${f.name.slice(3)}.ts` : `${home.get(f.name) ?? 'entrypoint'}.ts`}`).join('\n') : '')
		const used = new Set([...namesIn(text), ...outl.flatMap(o => [...namesIn(o.text)])])
		const stubs = r.stubs.filter(x => used.has(/declare function (\w+)/.exec(x)![1]))
		const sys = usedSyscalls(r, used)
		const outlSorted = r.outlined.filter(x => seen.has(x.name))
		const pre = [PRELUDE, `// instruction ${ix}: ${what} + ${order.length - 1} reachable functions`, ...usedViews(r, order), ...sys, ...stubs, ...(outlSorted.length ? ['', OUTLINED, ...outlSorted.map(x => x.text)] : []), ''].join('\n')
		files.set(`bundle/${ix}.ts`, pre + '\n' + text + '\n')
		const m = new Map<string, (line: number) => number>()
		let at = pre.split('\n').length + 1
		for (const f of order) {
			const base = at, v = sliced.get(f)
			m.set(f.name, v ? (l: number) => base + (v.map[l - 1] ?? l) - 1 : (l: number) => base + l - 1)
			at += (v ? v.lines : lineCount(f)) + 1
		}
		bundleLoc.set(ix, m)
	}
	for (const h of r.funcs.filter(f => f.name.startsWith('ix_'))) bundle(h.name.slice(3), h, 'handler')
	// instructions a native processor handles inline (a match on the instruction tag, see security/): the
	// processor restricted to the paths this instruction's tags take, and what those paths call
	const inline: string[] = []
	for (const ix of a.ixs) {
		const allowed = ix.ctx?.allowed, h = byName.get(ix.handler)
		if (!allowed || !h || ix.handler.startsWith('ix_') || files.has(`bundle/${ix.name}.ts`)) continue
		const restricted = ix.ctx!.restricted ?? new Set<number>()
		bundle(ix.name, h, `${ix.handler} restricted to this instruction's paths (${ix.dispatch ?? 'instruction tag'})`,
			f => (f === h || restricted.has(f.pc) ? slice(r, f, allowed, `${home.get(f.name) ?? 'entrypoint'}.ts`) : undefined))
		inline.push(`//   ${ix.name.padEnd(28)} ${ix.dispatch?.replace(/ \(instruction data\).*$/, '') ?? ''} of ${ix.handler} -> bundle/${ix.name}.ts`)
	}
	if (inline.length) files.set('index.ts', files.get('index.ts')! + [`// instructions handled inline by a processor (a match on the instruction tag; bundle/<name>.ts: the processor restricted to that instruction's paths + what they call):`, ...inline.sort()].join('\n') + '\n')
	// security/: the program analysis (derived views, see src/analysis/report.ts), read first
	const where: Where = (ix, at) => {
		const b = ix === undefined ? undefined : bundleLoc.get(ix)?.get(at.fn)
		if (b !== undefined) return { file: `bundle/${ix}.ts`, line: b(at.line) }
		const m = modLoc.get(at.fn)
		return m && { file: m.file, line: m.line + at.line - 1 }
	}
	const ixFile = (ix: { name: string }) => `${ix.name}.md`
	files.set('security/analysis.json', budgetJson(renderJson(a, where), BUDGET.jsonBytes))
	files.set('security/summary.md', budgetMarkdown(renderSummary(a, where, ixFile), BUDGET.summaryLines, SUMMARY_ORDER))
	for (const ix of a.ixs) files.set(`security/${ixFile(ix)}`, budgetMarkdown(renderIx(ix, where, a), BUDGET.ixLines, IX_ORDER))
	files.set('security/fingerprints.json', fingerprints(r))
	files.set('index.ts', files.get('index.ts')! + `// security/summary.md: read first — instructions ranked by sensitivity, their effects, privileges and checks (derived, over-approximate views; security/<ix>.md per instruction, security/analysis.json)\n`)
	return files
}
