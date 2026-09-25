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

export const PRELUDE = `// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// "text" as a call argument = address of those rodata bytes (followed by their length)
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
	const handlers = r.funcs.filter(f => f.name.startsWith('ix_'))
	const owners = new Map<number, Set<number>>()
	for (const h of handlers) {
		const seen = new Set<number>([h.pc])
		const q = [h.pc]
		while (q.length) {
			const x = q.pop()!
			let o = owners.get(x); if (!o) owners.set(x, (o = new Set())); o.add(h.pc)
			for (const t of byPc.get(x)?.calls ?? []) if (byPc.has(t) && !seen.has(t) && !byPc.get(t)!.name.startsWith('ix_')) { seen.add(t); q.push(t) }
		}
	}
	const entry: Group = { key: 'entrypoint', title: 'entrypoint, dispatcher and code outside instruction handlers', funcs: [] }
	const shared: Group = { key: 'shared', title: 'helpers used by several instructions', funcs: [] }
	const ix = new Map<number, Group>(handlers.map(h => [h.pc, { key: `ix/${h.name.slice(3)}`, title: `instruction ${h.name.slice(3)}`, funcs: [] }]))
	// order: handler first, then helpers in call order
	const placed = new Set<number>()
	for (const h of handlers) {
		const g = ix.get(h.pc)!
		const order: number[] = []
		const seen = new Set<number>()
		const dfs = (x: number) => { if (seen.has(x)) return; seen.add(x); order.push(x); for (const t of byPc.get(x)?.calls ?? []) if (byPc.has(t) && owners.get(t)?.size === 1 && owners.get(t)!.has(h.pc) && !byPc.get(t)!.name.startsWith('ix_')) dfs(t) }
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

function usedSyscalls(r: Result): string[] {
	const names = new Set<string>()
	for (const f of r.funcs) for (const m of f.text.matchAll(/\b(sol_[a-z0-9_]+|abort)\(/g)) names.add(m[1])
	const out: string[] = []
	for (const sc of SYSCALLS) if (names.has(sc.alias)) out.push(`declare function ${sc.alias}(${sc.params.map(p => `${p}: u64`).join(', ')})${sc.noreturn ? ': never' : sc.ret ? ': u64' : ': void'} // ${sc.doc}`)
	return out
}

function summary(r: Result): string[] {
	const p = r.program
	const lines = [`// program: sBPF v${p.version}, ${p.insns.length} instructions, ${p.funcs.size} functions (${r.funcs.length} decompiled, ${r.libCount} library)`]
	if (r.instructions.length) {
		lines.push(`// instructions (Anchor, discriminator = sha256("global:<name>")[..8] of instruction data):`)
		for (const i of [...r.instructions].sort((a, b) => a.name.localeCompare(b.name))) lines.push(`//   ${i.name.padEnd(28)} 0x${i.disc.toString(16).padStart(16, '0')}  -> ix_${i.name}`)
	}
	return lines
}

export function renderSingle(r: Result): string {
	const g = groups(r)
	const out: string[] = [PRELUDE, ...summary(r), '']
	const helpers = usedHelpers(r)
	if (helpers.length) out.push(`// helpers:`, ...helpers, '')
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
	const lib = [PRELUDE, TYPES, '', '// syscalls', ...usedSyscalls(r), '', '// library functions (recognized in many programs; not decompiled)', ...r.stubs].join('\n') + '\n'
	files.set('lib.d.ts', lib)
	const idx = [...summary(r), '']
	for (const i of r.instructions) idx.push(`export { ix_${i.name} } from './ix/${i.name}.ts'`)
	idx.push(`export { entrypoint } from './entrypoint.ts'`)
	files.set('index.ts', idx.join('\n') + '\n')
	return files
}
