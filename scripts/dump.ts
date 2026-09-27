// Stage dumps for the Rust port (dev tool, read-only): canonical, deterministic JSONL of each pipeline
// stage, byte-compared against `rs/` (sbpf-dump) by scripts/parity.ts. The encoding is specified in
// rs/README.md; any change here must be mirrored in rs/crates/sbpf-dump.
//
//   node scripts/dump.ts prog.so [--idl x.json] [--stages elf,insns,cfg,lift,dataflow,vars,stack,stackargs,opt,optir,compact,struct,text,rawfile,types,rtext,readfile,library,fingerprint] out_dir
//   node scripts/dump.ts --diff a.so b.so out_dir     (diff.jsonl: the program diff report)
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
import { decompile } from '../src/decompile.ts'
import { classify } from '../src/library.ts'
import { fingerprints, renderProject } from '../src/layout.ts'
import { profile, diff } from '../src/diff.ts'
import { parseIdl, type IdlInfo } from '../src/idl.ts'
import type { Node } from '../src/structure.ts'
import { dumpStage8 } from './dump8.ts'

export const FORMAT = 1
export const STAGES = ['elf', 'insns', 'cfg', 'lift', 'dataflow', 'vars', 'stack', 'stackargs', 'opt', 'optir', 'compact', 'struct', 'text', 'rawfile', 'types', 'rtext', 'readfile', 'library', 'fingerprint', 'facts', 'flow', 'analysis', 'project'] as const

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
const errMsg = (e: unknown) => (e instanceof RangeError ? 'out of bounds' : (e as Error).message)
const errLine = (e: unknown) => line({ error: errMsg(e) })

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

/** A structured statement tree node (src/structure.ts `Node`), keys in declaration order (`loop`: `c` only for while / do). */
export function snode(n: Node): unknown {
	switch (n.k) {
		case 'stmt': return { k: n.k, s: stmt(n.s) }
		case 'if': return { k: n.k, c: expr(n.c), then: n.then.map(snode), else: n.else.map(snode) }
		case 'block': return { k: n.k, label: n.label, body: n.body.map(snode) }
		case 'loop': {
			const o: Record<string, unknown> = { k: n.k, label: n.label, body: n.body.map(snode), form: n.form }
			if (n.c) o.c = expr(n.c)
			return o
		}
		case 'break': case 'continue': return { k: n.k, label: n.label }
		case 'return': return { k: n.k, e: n.e ? expr(n.e) : null }
		case 'trap': return { k: n.k, msg: n.msg }
		case 'switch': return { k: n.k, v: n.v, cases: n.cases.map(c => ({ vals: c.vals, body: c.body.map(snode) })) }
		case 'setstate': return { k: n.k, v: n.v, val: n.val }
	}
}

/** The single-file text without the analysis summary block (`// security summary …` up to the blank line: stage 8). */
export function withoutAnalysis(text: string): string {
	const ls = text.split('\n')
	const i = ls.findIndex(l => l.startsWith('// security summary ('))
	if (i < 0) return text
	let j = i
	while (j < ls.length && ls[j] !== '') j++
	return [...ls.slice(0, i), ...ls.slice(j)].join('\n')
}

/**
 * Stage 4: the raw decompiler output (`decompile(bytes, { sugar: false, full: true })`, the form
 * `test/equiv.ts --raw` checks). `struct` = each function's structured body (structure + cleanup +
 * statementIdioms), `text` = each function's printed text, `rawfile` = the single-file text minus the
 * analysis summary.
 */
export function dumpStage4(bytes: Uint8Array, stages: readonly string[], res: Map<string, string>) {
	const want = ['struct', 'text', 'rawfile'].filter(s => stages.includes(s))
	if (!want.length) return
	let r: ReturnType<typeof decompile>
	try { r = decompile(bytes, { sugar: false, full: true }) } catch (e) { res.set('struct', header('struct') + errLine(e)); return }
	if (stages.includes('struct')) {
		const out = [header('struct')]
		for (const f of r.funcs) out.push(line({ t: 'func', pc: f.pc, irreducible: f.irreducible, nvars: f.f.vars.length, body: f.body.map(snode) }))
		res.set('struct', out.join(''))
	}
	if (stages.includes('text')) {
		const out = [header('text')]
		for (const f of r.funcs) out.push(line({ t: 'func', pc: f.pc, name: f.name, text: f.text }))
		res.set('text', out.join(''))
	}
	if (stages.includes('rawfile')) res.set('rawfile', header('rawfile') + line({ text: withoutAnalysis(r.text) }))
}

/**
 * Stage 5: the readable output (`decompile(bytes, { full: true, idl })`, the CLI default without library
 * classification). `types` = each function's variable names and typed-view assignment (insertion
 * order), `rtext` = each function's printed text, `readfile` = the single-file text minus the analysis
 * summary (stage 8).
 */
export function dumpStage5(bytes: Uint8Array, stages: readonly string[], res: Map<string, string>, idl?: IdlInfo) {
	const want = ['types', 'rtext', 'readfile'].filter(s => stages.includes(s))
	if (!want.length) return
	let r: ReturnType<typeof decompile>
	try { r = decompile(bytes, { full: true, idl }) } catch (e) { res.set(want[0], header(want[0]) + errLine(e)); return }
	if (stages.includes('types')) {
		const out = [header('types')]
		for (const f of r.funcs) {
			const names = Array.from(f.names, x => x ?? null)
			while (names.length && names[names.length - 1] === null) names.pop()
			out.push(line({ t: 'func', pc: f.pc, name: f.name, names, types: [...f.varTypes ?? []] }))
		}
		res.set('types', out.join(''))
	}
	if (stages.includes('rtext')) {
		const out = [header('rtext')]
		for (const f of r.funcs) out.push(line({ t: 'func', pc: f.pc, name: f.name, text: f.text }))
		res.set('rtext', out.join(''))
	}
	if (stages.includes('readfile')) res.set('readfile', header('readfile') + line({ text: r.text }))
}

/**
 * Stage 7: library classification and the default output (`decompile(bytes, { idl })`: library code as
 * one-line stubs). `library` = classify() of a fresh program after inferSignatures (per function: lib,
 * families, name, hint), then from the default output the library functions' final names, the stubs and
 * the counts; `fingerprint` = security/fingerprints.json; `readfile` gets a second line, the default
 * single file (the CLI's stdout, analysis summary included); `project` = the files of `-o dir/` (renderProject,
 * in its map order).
 */
export function dumpStage7(bytes: Uint8Array, stages: readonly string[], res: Map<string, string>, idl?: IdlInfo) {
	const want = ['library', 'fingerprint', 'readfile', 'project'].filter(s => stages.includes(s))
	if (!want.length) return
	if (stages.includes('library')) {
		const out = [header('library')]
		try {
			const p = loadProgram(bytes, { lazyBlocks: true })
			inferSignatures(p)
			for (const [pc, i] of classify(p)) out.push(line({ t: 'func', pc, lib: i.lib, families: i.families, name: i.name, hint: i.hint }))
		} catch (e) { out.push(errLine(e)) }
		res.set('library', out.join(''))
	}
	let r: ReturnType<typeof decompile>
	try { r = decompile(bytes, { idl }) } catch (e) {
		for (const st of want) res.set(st, (res.get(st) ?? header(st)) + (st === 'readfile' ? line({ lib: true, error: errMsg(e) }) : errLine(e)))
		return
	}
	if (stages.includes('library')) {
		const out = [res.get('library')!]
		for (const pc of r.libPcs) out.push(line({ t: 'lib', pc, name: r.program.funcs.get(pc)!.name }))
		for (const s of r.stubs) out.push(line({ t: 'stub', text: s }))
		out.push(line({ t: 'count', funcs: r.funcs.length, lib: r.libCount }))
		res.set('library', out.join(''))
	}
	if (stages.includes('fingerprint')) res.set('fingerprint', header('fingerprint') + line({ text: fingerprints(r) }))
	if (stages.includes('readfile')) res.set('readfile', (res.get('readfile') ?? header('readfile')) + line({ lib: true, text: r.text }))
	if (stages.includes('project')) {
		let out: string
		try { out = [...renderProject(r)].map(([path, text]) => line({ path, text })).join('') } catch (e) { out = errLine(e) }
		res.set('project', header('project') + out)
	}
}

/** The program diff report (`sbpf-decompile a.so b.so -o report.txt`: all rows, the paths as labels). */
export function dumpDiff(a: string, b: string): string {
	let text: string
	try {
		const d = diff(profile(new Uint8Array(readFileSync(a))), profile(new Uint8Array(readFileSync(b))), { all: true, labels: [a, b] })
		text = d.lines.join('\n') + '\n'
	} catch (e) { return header('diff') + errLine(e) }
	return header('diff') + line({ text })
}

export function dumpAll(bytes: Uint8Array, stages: readonly string[] = STAGES, idl?: IdlInfo): Map<string, string> {
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
	dumpStage4(bytes, stages, res)
	dumpStage5(bytes, stages, res, idl)
	dumpStage7(bytes, stages, res, idl)
	dumpStage8(bytes, stages, res, idl)
	return res
}

if (import.meta.main) {
	const args = process.argv.slice(2)
	let stages: readonly string[] = STAGES
	let idlFile: string | undefined
	const pos: string[] = []
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--idl') idlFile = args[++i] // (stage 5 on; the earlier stages do not use it)
		else if (args[i] === '--stages') stages = args[++i].split(',')
		else pos.push(args[i])
	}
	if (pos[0] === '--diff' && pos.length === 4) { mkdirSync(pos[3], { recursive: true }); writeFileSync(join(pos[3], 'diff.jsonl'), dumpDiff(pos[1], pos[2])); process.exit(0) }
	if (pos.length !== 2) { console.error('usage: node scripts/dump.ts prog.so [--idl x.json] [--stages elf,insns,cfg,lift,dataflow,vars,stack,stackargs,opt,optir,compact,struct,text,rawfile,types,rtext,readfile] out_dir'); process.exit(2) }
	const [file, dir] = pos
	mkdirSync(dir, { recursive: true })
	for (const [stage, text] of dumpAll(new Uint8Array(readFileSync(file)), stages, idlFile ? parseIdl(JSON.parse(readFileSync(idlFile, 'utf8'))) : undefined)) writeFileSync(join(dir, `${stage}.jsonl`), text)
}
