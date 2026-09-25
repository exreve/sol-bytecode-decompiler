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

export const PRELUDE = `// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
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

export interface Group { key: string; title: string; funcs: FuncOut[] }

export function groups(r: Result): { entry: Group; ix: Group[]; shared: Group } {
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

/** Declarations (with their one-line semantics) of the commented helper functions the output uses. */
function usedHelpers(r: Result): string[] {
	const names = new Set<string>()
	for (const f of r.funcs) for (const m of f.text.matchAll(/\b([a-z_][a-z0-9_]*)\(/g)) names.add(m[1])
	return TYPES.split('\n').filter(l => { const m = /^declare function (\w+)\(.*\/\/ /.exec(l); return m && names.has(m[1]) })
}

/** Declarations of the typed views the output uses (x.field notation), with the notation itself. */
function usedViews(r: Result, funcs: FuncOut[] = r.funcs): string[] {
	const names = new Set<string>()
	for (const f of funcs) for (const m of f.text.matchAll(/(?::|\bas) ([A-Z][A-Za-z0-9_]*)\b/g)) if (r.views.map.has(m[1])) names.add(m[1])
	if (!names.size) return []
	return ['// typed views: x.field is exactly the load / store / address given by the field declaration', ...VIEW_NOTATION, ...r.views.render(names)]
}

function usedSyscalls(r: Result): string[] {
	const names = new Set<string>()
	for (const f of r.funcs) for (const m of f.text.matchAll(/\b(sol_[a-z0-9_]+|abort)\(/g)) names.add(m[1])
	const out: string[] = []
	for (const sc of SYSCALLS) if (names.has(sc.alias)) out.push(`declare function ${sc.alias}(${sc.params.map(p => `${p}: u64`).join(', ')})${sc.noreturn ? ': never' : sc.ret ? ': u64' : ': void'} // ${sc.doc}`)
	return out
}

/** How recovered names are marked (per-function "// names" / "// accounts" lines carry the tags). */
export const PROVENANCE = `// recovered names carry their source: [idl] Anchor IDL · [str] the program's own strings (instruction logs, Anchor account-error
//   names) · [known] well-known program ids and layouts · [heur] structural inference (verify); per-function "// names" lines list them.
//   Other names are plain temporaries: a..e = parameters r1..r5, f, g, … = locals, s30 = stack object at fp - 0x30, fn_<addr> = unnamed function`

function summary(r: Result): string[] {
	const p = r.program
	const lines = [PROVENANCE, `// program: sBPF v${p.version}, ${p.insns.length} instructions, ${p.funcs.size} functions (${r.funcs.length} decompiled, ${r.libCount} library)`]
	if (r.instructions.length) {
		lines.push(r.anchor ? `// instructions (Anchor, discriminator = sha256("global:<name>")[..8] of instruction data, as u64):` : `// instruction handlers (from their "Instruction: X" logs):`)
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
	const out: string[] = [PRELUDE, ...summary(r), '']
	const helpers = usedHelpers(r)
	if (helpers.length) out.push(`// helpers:`, ...helpers, '')
	const vw = usedViews(r)
	if (vw.length) out.push(...vw, '')
	const sys = usedSyscalls(r)
	if (sys.length) out.push(...sys, '')
	if (r.stubs.length) out.push(`// library functions (recognized, not decompiled):`, ...r.stubs, '')
	const section = (grp: { title: string; funcs: FuncOut[] }) => { if (!grp.funcs.length) return; out.push(`// ===== ${grp.title} =====`); for (const f of grp.funcs) out.push(f.text, '') }
	section(g.entry)
	for (const x of g.ix) section(x)
	section(g.shared)
	return out.join('\n')
}

/** Multi-file project: path -> content. */
export function renderProject(r: Result): Map<string, string> {
	const g = groups(r)
	const files = new Map<string, string>()
	const home = new Map<string, string>() // function name -> module path
	for (const grp of [g.entry, g.shared, ...g.ix]) for (const f of grp.funcs) home.set(f.name, grp.key)
	const libNames = new Set(r.stubs.map(s => /declare function (\w+)/.exec(s)![1]))
	const mod = (grp: Group) => {
		if (!grp.funcs.length) return
		const imports = new Map<string, Set<string>>()
		const text = grp.funcs.map(f => f.text).join('\n\n')
		for (const m of text.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\(/g)) {
			const h = home.get(m[1])
			if (h && h !== grp.key) { let s = imports.get(h); if (!s) imports.set(h, (s = new Set())); s.add(m[1]) }
		}
		const rel = (to: string) => {
			const depth = grp.key.split('/').length - 1
			return (depth ? '../'.repeat(depth) : './') + to + '.ts'
		}
		const head = [`/// <reference path="${grp.key.includes('/') ? '../' : './'}lib.d.ts" />`, `// ${grp.title}`]
		for (const [h, names] of imports) head.push(`import { ${[...names].sort().join(', ')} } from '${rel(h)}'`)
		const body = grp.funcs.map(f => f.text.replace(/^function /m, 'export function ')).join('\n\n')
		files.set(grp.key + '.ts', head.join('\n') + '\n\n' + body + '\n')
	}
	mod(g.entry); mod(g.shared); g.ix.forEach(mod)
	void libNames
	const lib = [PRELUDE, TYPES, '', ...usedViews(r), '', '// syscalls', ...usedSyscalls(r), '', '// library functions (recognized in many programs; not decompiled)', ...r.stubs].join('\n') + '\n'
	files.set('lib.d.ts', lib)
	const idx = [...summary(r), '']
	for (const i of r.instructions) idx.push(`export { ix_${i.name} } from './ix/${i.name}.ts'`)
	idx.push(`export { entrypoint } from './entrypoint.ts'`)
	files.set('index.ts', idx.join('\n') + '\n')
	// self-contained per-instruction bundles: handler + all user code it reaches + the stubs it needs
	const byPc = new Map(r.funcs.map(f => [f.pc, f]))
	for (const h of r.funcs.filter(f => f.name.startsWith('ix_'))) {
		// breadth-first (closest helpers first) up to a size budget; the rest become declarations
		const seen = new Set<number>([h.pc]), order = [h], decl: FuncOut[] = []
		let size = h.text.length
		for (let i = 0; i < order.length; i++) for (const t of order[i].calls) {
			const g = byPc.get(t)
			if (!g || seen.has(t)) continue
			seen.add(t)
			if (size + g.text.length <= 150_000) { order.push(g); size += g.text.length } else decl.push(g)
		}
		const sig = (f: FuncOut) => f.text.split('\n').find(l => l.startsWith('function '))!.replace(/^function /, 'declare function ').replace(/ \{$/, '')
		const text = order.map(f => f.text).join('\n\n') + (decl.length ? `\n\n// not included (size budget), see ${[...new Set(decl.map(f => (home.get(f.name) ?? 'entrypoint') + '.ts'))].join(', ')}:\n` + decl.map(sig).join('\n') : '')
		const used = new Set([...text.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\(/g)].map(m => m[1]))
		const stubs = r.stubs.filter(x => used.has(/declare function (\w+)/.exec(x)![1]))
		const sys = usedSyscalls({ ...r, funcs: order })
		files.set(`bundle/${h.name.slice(3)}.ts`, [PRELUDE, `// instruction ${h.name.slice(3)}: handler + ${order.length - 1} reachable functions`, ...usedViews(r, order), ...sys, ...stubs, '', text, ''].join('\n'))
	}
	return files
}
