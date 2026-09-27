// Stage dumps for the Rust port (dev tool, read-only): canonical, deterministic JSONL of each pipeline
// stage, byte-compared against `rs/` (sbpf-dump) by scripts/parity.ts. The encoding is specified in
// rs/README.md; any change here must be mirrored in rs/crates/sbpf-dump.
//
//   node scripts/dump.ts prog.so [--idl x.json] [--stages elf,insns,cfg,lift,dataflow,vars,stack,stackargs,opt,optir,compact] out_dir
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseElf, Image, type Elf } from '../src/elf.ts'
import { loadProgram, pendingCalls, Lifter, type Program } from '../src/program.ts'
import type { Expr, Stmt, Term, CallTarget } from '../src/ir.ts'
import type { Block } from '../src/program.ts'
import { inferSignatures, recoverVars, type VarFunc } from '../src/dataflow.ts'
import { promoteStack } from '../src/stack.ts'
import { rewriteStackArgs } from '../src/stackargs.ts'
import { optimizeFunc, setFoldImage, isSettled } from '../src/simplify.ts'
import { recognizeIdioms } from '../src/idioms.ts'
import { compactStores, sinkFrameLoads } from '../src/compact.ts'

export const FORMAT = 1
export const STAGES = ['elf', 'insns', 'cfg', 'lift', 'dataflow', 'vars', 'stack', 'stackargs', 'opt', 'optir', 'compact'] as const

// ---------- canonical values ----------
// JSON.stringify of plain objects built with keys in the documented order; bigint -> "0x" lowercase hex.
const hex = (v: bigint) => '0x' + v.toString(16)

/** FNV-1a 64 of a byte range, as 16 hex digits. */
export function fnv64(b: Uint8Array): string {
	// h = (h ^ byte) * 0x100000001b3 mod 2^64, on 32-bit halves: h * P = h * 0x1b3 + (lo << 40)
	let lo = 0x84222325, hi = 0xcbf29ce4
	for (let i = 0; i < b.length; i++) {
		lo = (lo ^ b[i]) >>> 0
		const l = lo * 0x1b3
		hi = (Math.imul(hi, 0x1b3) + Math.floor(l / 0x100000000) + (lo << 8)) >>> 0
		lo = l >>> 0
	}
	return hi.toString(16).padStart(8, '0') + lo.toString(16).padStart(8, '0')
}

export function expr(e: Expr): unknown {
	switch (e.k) {
		case 'const': return { k: e.k, v: hex(e.v) }
		case 'var': return { k: e.k, id: e.id }
		case 'reg': return { k: e.k, r: e.r }
		case 'undef': return { k: e.k }
		case 'bin': return { k: e.k, op: e.op, a: expr(e.a), b: expr(e.b) }
		case 'neg': case 'not': case 'lnot': return { k: e.k, a: expr(e.a) }
		case 'ext': return { k: e.k, signed: e.signed, bits: e.bits, a: expr(e.a) }
		case 'bswap': return { k: e.k, bits: e.bits, a: expr(e.a) }
		case 'load': return { k: e.k, size: e.size, addr: expr(e.addr) }
		case 'cmp': return { k: e.k, op: e.op, a: expr(e.a), b: expr(e.b) }
		case 'land': case 'lor': return { k: e.k, a: expr(e.a), b: expr(e.b) }
		case 'sel': return { k: e.k, c: expr(e.c), a: expr(e.a), b: expr(e.b) }
		case 'call': return { k: e.k, t: target(e.t), args: e.args.map(expr) }
		case 'fn': return { k: e.k, name: e.name, args: e.args.map(expr) }
	}
}

export function target(t: CallTarget): unknown {
	switch (t.k) {
		case 'fn': return { k: t.k, pc: t.pc }
		case 'sys': return { k: t.k, name: t.name, hash: t.hash }
		case 'ind': return { k: t.k, e: expr(t.e) }
	}
}

export function stmt(s: Stmt): unknown {
	switch (s.k) {
		case 'set': return { k: s.k, dst: s.dst, e: expr(s.e), pc: s.pc }
		case 'store': return { k: s.k, size: s.size, addr: expr(s.addr), v: expr(s.v), pc: s.pc }
		case 'call': {
			const o: Record<string, unknown> = { k: s.k, dst: s.dst, t: target(s.t), args: s.args.map(expr), pc: s.pc }
			if (s.extra) o.extra = s.extra.map(expr)
			return o
		}
		case 'eval': return { k: s.k, e: expr(s.e), pc: s.pc }
		case 'stores': return { k: s.k, size: s.size, addr: expr(s.addr), vals: s.vals.map(expr), pc: s.pc }
		case 'copy': {
			const o: Record<string, unknown> = { k: s.k, dst: expr(s.dst), src: expr(s.src), n: s.n, pc: s.pc }
			if (s.rev !== undefined) o.rev = s.rev
			return o
		}
		case 'trap': return { k: s.k, msg: s.msg, pc: s.pc }
	}
}

export function term(t: Term): unknown {
	switch (t.k) {
		case 'jmp': return { k: t.k, to: t.to }
		case 'br': return { k: t.k, c: expr(t.c), t: t.t, f: t.f }
		case 'ret': return { k: t.k, e: t.e ? expr(t.e) : null }
		case 'trap': return { k: t.k, msg: t.msg }
		case 'tail': return { k: t.k, e: null }
	}
}

// ---------- stages ----------
const line = (v: unknown) => JSON.stringify(v) + '\n'
const header = (stage: string) => line({ stage, format: FORMAT })

/** Error line: our own `throw new Error(msg)` keeps its message; runtime errors (DataView bounds) are "out of bounds". */
const errLine = (e: unknown) => line({ error: e instanceof RangeError ? 'out of bounds' : (e as Error).message })

export function dumpElf(elf: Elf): string {
	const out: string[] = [header('elf')]
	out.push(line({ t: 'elf', version: elf.version, entryPc: elf.entryPc, textVaddr: hex(elf.textVaddr), text: elf.sections.indexOf(elf.text), bytes: elf.bytes.length, hash: fnv64(elf.bytes) }))
	for (const s of elf.sections) out.push(line({ t: 'section', name: s.name, type: s.type, flags: s.flags, addr: s.addr, offset: s.offset, size: s.size, link: s.link, entsize: s.entsize }))
	for (const [t, syms] of [['dynsym', elf.dynsyms], ['symbol', elf.symbols]] as const)
		for (const s of syms) out.push(line({ t, name: s.name, value: s.value, size: s.size, type: s.type, bind: s.bind, shndx: s.shndx }))
	for (const r of elf.relocs) out.push(line({ t: 'reloc', offset: r.offset, type: r.type, sym: r.sym }))
	for (const [pc, r] of elf.callRelocs) out.push(line(r.kind === 'fn' ? { t: 'callreloc', pc, kind: r.kind, name: r.name, targetPc: r.targetPc } : { t: 'callreloc', pc, kind: r.kind, name: r.name }))
	for (const r of elf.regions) out.push(line({ t: 'region', name: r.name, vaddr: hex(r.vaddr), len: r.bytes.length, exec: r.exec, hash: fnv64(r.bytes) }))
	for (const [va, v] of elf.dataPointers) out.push(line({ t: 'dataptr', va: hex(va), v: hex(v) }))
	const image = new Image(elf.regions)
	out.push(line({ t: 'image', order: image.regions.map(r => elf.regions.indexOf(r)) }))
	return out.join('')
}

export function dumpInsns(p: Program): string {
	const out: string[] = [header('insns')]
	for (const i of p.insns) out.push(line([i.pc, i.opc, i.dst, i.src, i.off, i.imm]))
	return out.join('')
}

/** Discovery + full CFG (loadProgram without lazyBlocks) + the lazy path's direct call lists. */
export function dumpCfg(p: Program, lazy: Program): string {
	const out: string[] = [header('cfg')]
	for (const [pc, name] of p.symbolNames) out.push(line({ t: 'symname', pc, name }))
	out.push(line({ t: 'addressTaken', pcs: [...p.addressTaken] }))
	out.push(line({ t: 'syscalls', names: [...p.syscalls.keys()] }))
	for (const f of p.funcs.values()) {
		const lf = lazy.funcs.get(f.pc)!
		out.push(line({ t: 'func', pc: f.pc, name: f.name, isEntry: f.isEntry, leaders: [...f.blockAt.keys()], calls: pendingCalls(lf), blocks: f.blocks.length }))
		for (const b of f.blocks) out.push(line({ t: 'block', id: b.id, start: b.start, end: b.end, stmts: b.stmts.length, term: term(b.term), succs: b.succs, preds: b.preds }))
	}
	return out.join('')
}

/** lift(pc) of every instruction start, in pc order, by a fresh Lifter (lifting is a pure function of the pc). */
export function dumpLift(p: Program): string {
	const out: string[] = [header('lift')]
	const q: Program = { ...p, syscalls: new Map(p.syscalls) } // (lifting registers syscalls: keep p untouched)
	const lifter = new Lifter(q)
	const noLddw = p.version === 2
	for (let pc = 0; pc < p.insns.length; pc++) {
		const l = lifter.lift(pc)
		const stmts = l.stmts.map(stmt)
		out.push(line('next' in l ? { pc, stmts, next: l.next } : { pc, stmts, term: term(l.term) }))
		if (p.insns[pc].opc === 0x18 && !noLddw) pc++
	}
	return out.join('')
}

/** A block with its IR. */
const blockLine = (b: Block) => line({ t: 'block', id: b.id, start: b.start, end: b.end, stmts: b.stmts.map(stmt), term: term(b.term), succs: b.succs, preds: b.preds })
const varsOf = (f: VarFunc) => f.vars.map(v => [v.reg, v.param, v.undef])

/**
 * Stage 2 on a fresh lazily loaded program (the decompiler's path): `dataflow` = inferSignatures
 * (signatures and the materialized blocks), `vars` = recoverVars of every function, `stack` =
 * promoteStack of every function on that IR, `stackargs` = rewriteStackArgs over all functions.
 * (The pipeline runs promoteStack and rewriteStackArgs on optimized IR and skips library functions;
 * here they run on recoverVars' output, as unit harnesses of the same code.)
 */
export function dumpStage2(bytes: Uint8Array, stages: readonly string[], res: Map<string, string>) {
	const want = ['dataflow', 'vars', 'stack', 'stackargs'].filter(s => stages.includes(s))
	if (!want.length) return
	const need = (s: string) => ['dataflow', 'vars', 'stack', 'stackargs'].indexOf(s) <= ['dataflow', 'vars', 'stack', 'stackargs'].indexOf(want[want.length - 1])
	const fail = (st: string, e: unknown) => { res.set(st, header(st) + errLine(e)) }
	const q = loadProgram(bytes, { lazyBlocks: true })
	const funcs = () => [...q.funcs.values()] as VarFunc[]
	try { inferSignatures(q) } catch (e) { fail('dataflow', e); return }
	if (stages.includes('dataflow')) {
		const out: string[] = [header('dataflow')]
		for (const f of q.funcs.values()) {
			out.push(line({ t: 'func', pc: f.pc, noreturn: f.noreturn, returns: f.returns, nparams: f.nparams, extraIn: f.extraIn, leaders: [...f.blockAt.keys()], blocks: f.blocks.length }))
			for (const b of f.blocks) out.push(line({ t: 'block', id: b.id, start: b.start, end: b.end, stmts: b.stmts.length, term: term(b.term), succs: b.succs, preds: b.preds }))
		}
		res.set('dataflow', out.join(''))
	}
	if (!need('vars')) return
	try { for (const f of q.funcs.values()) recoverVars(q, f) } catch (e) { fail('vars', e); return }
	if (stages.includes('vars')) {
		const out: string[] = [header('vars')]
		for (const f of funcs()) {
			out.push(line({ t: 'func', pc: f.pc, vars: varsOf(f) }))
			for (const b of f.blocks) out.push(blockLine(b))
		}
		res.set('vars', out.join(''))
	}
	if (!need('stack')) return
	const before = new Map<number, string>() // (IR per function after promoteStack, for the stackargs dump)
	{
		const out: string[] = [header('stack')]
		try {
			for (const f of funcs()) {
				const r = promoteStack(f)
				const ir = f.blocks.map(blockLine).join('')
				before.set(f.pc, ir)
				out.push(line({ t: 'func', pc: f.pc, promoted: r }))
				if (r) out.push(line({ t: 'slots', slots: f.promoted!.map(x => [x.off, x.size, x.v]), vars: varsOf(f) }), ir)
			}
		} catch (e) { fail('stack', e); return }
		if (stages.includes('stack')) res.set('stack', out.join(''))
	}
	if (!need('stackargs')) return
	{
		const out: string[] = [header('stackargs')]
		try {
			const built = new Map(funcs().map(f => [f.pc, { f }]))
			const nstack = rewriteStackArgs(q, built)
			for (const [pc, n] of nstack) out.push(line({ t: 'nstack', pc, n }))
			for (const f of funcs()) {
				const ir = f.blocks.map(blockLine).join('')
				const o: Record<string, unknown> = { t: 'func', pc: f.pc }
				if (f.stackArgs !== undefined) o.stackArgs = f.stackArgs
				if (f.argAreaElided !== undefined) o.argAreaElided = f.argAreaElided
				if (nstack.has(f.pc)) o.vars = varsOf(f)
				o.changed = ir !== before.get(f.pc)
				out.push(line(o))
				if (o.changed) out.push(ir)
			}
		} catch (e) { fail('stackargs', e); return }
		res.set('stackargs', out.join(''))
	}
}

/**
 * Stage 3 on a fresh lazily loaded program: decompile's per-function phase (phase 2) over every
 * function (as `--full` builds them: library classification is stage 7), in its exact order.
 * `opt` = each function after recoverVars + optimizeFunc; `optir` = after the whole per-function
 * phase (optimizeFunc, promoteStack + optimizeFunc, recognizeIdioms + optimizeFunc); `compact` =
 * after rewriteStackArgs over all functions, then sinkFrameLoads + compactStores per function (the
 * IR structuring starts from). Read-only memory folding uses the program image (setFoldImage).
 */
export function dumpStage3(bytes: Uint8Array, stages: readonly string[], res: Map<string, string>) {
	const want = ['opt', 'optir', 'compact'].filter(s => stages.includes(s))
	if (!want.length) return
	const fail = (st: string, e: unknown) => { res.set(st, header(st) + errLine(e)) }
	const q = loadProgram(bytes, { lazyBlocks: true })
	try { inferSignatures(q) } catch { return }
	const funcs = [...q.funcs.values()] as VarFunc[]
	try { for (const f of funcs) recoverVars(q, f) } catch (e) { fail('opt', e); return }
	const fline = (f: VarFunc) => line({ t: 'func', pc: f.pc, settled: isSettled(f), vars: varsOf(f) }) + f.blocks.map(blockLine).join('')
	setFoldImage(q.image)
	try {
		const opt: string[] = [header('opt')], optir: string[] = [header('optir')]
		try {
			for (const f of funcs) {
				optimizeFunc(f)
				opt.push(fline(f))
				if (promoteStack(f)) optimizeFunc(f)
				const idi = { real: false }
				if (recognizeIdioms(f, idi) && (idi.real || !isSettled(f))) optimizeFunc(f)
				optir.push(fline(f))
			}
		} catch (e) { fail('opt', e); return }
		if (stages.includes('opt')) res.set('opt', opt.join(''))
		if (stages.includes('optir')) res.set('optir', optir.join(''))
		if (!stages.includes('compact')) return
		try {
			const out: string[] = [header('compact')]
			const nstack = rewriteStackArgs(q, new Map(funcs.map(f => [f.pc, { f }])))
			for (const [pc, n] of nstack) out.push(line({ t: 'nstack', pc, n }))
			for (const f of funcs) {
				sinkFrameLoads(f)
				compactStores(f)
				const o: Record<string, unknown> = { t: 'func', pc: f.pc }
				if (f.stackArgs !== undefined) o.stackArgs = f.stackArgs
				if (f.argAreaElided !== undefined) o.argAreaElided = f.argAreaElided
				o.vars = varsOf(f)
				out.push(line(o), ...f.blocks.map(blockLine))
			}
			res.set('compact', out.join(''))
		} catch (e) { fail('compact', e) }
	} finally { setFoldImage(null) }
}

export function dumpAll(bytes: Uint8Array, stages: readonly string[] = STAGES): Map<string, string> {
	const res = new Map<string, string>()
	let elf: Elf
	try { elf = parseElf(bytes) } catch (e) { res.set('elf', header('elf') + errLine(e)); return res }
	if (stages.includes('elf')) res.set('elf', dumpElf(elf))
	let p: Program, lazy: Program
	try { p = loadProgram(bytes); lazy = loadProgram(bytes, { lazyBlocks: true }) } catch (e) { res.set('insns', header('insns') + errLine(e)); return res }
	if (stages.includes('insns')) res.set('insns', dumpInsns(p))
	if (stages.includes('cfg')) res.set('cfg', dumpCfg(p, lazy))
	if (stages.includes('lift')) res.set('lift', dumpLift(p))
	dumpStage2(bytes, stages, res)
	dumpStage3(bytes, stages, res)
	return res
}

if (import.meta.main) {
	const args = process.argv.slice(2)
	let stages: readonly string[] = STAGES
	const pos: string[] = []
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--idl') i++ // (accepted for the later stages; the early stages do not use it)
		else if (args[i] === '--stages') stages = args[++i].split(',')
		else pos.push(args[i])
	}
	if (pos.length !== 2) { console.error('usage: node scripts/dump.ts prog.so [--idl x.json] [--stages elf,insns,cfg,lift,dataflow,vars,stack,stackargs,opt,optir,compact] out_dir'); process.exit(2) }
	const [file, dir] = pos
	mkdirSync(dir, { recursive: true })
	for (const [stage, text] of dumpAll(new Uint8Array(readFileSync(file)), stages)) writeFileSync(join(dir, `${stage}.jsonl`), text)
}
