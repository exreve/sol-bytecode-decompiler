// Differential equivalence check: bytecode (reference emulator) vs decompiled TypeScript (evaluator).
// usage: node test/equiv.ts <program.so> [trials] [maxFuncs]
import { readFileSync } from 'node:fs'
import { decompile } from '../src/decompile.ts'
import { emulate, TestMem, Abort, StepLimit, UNDEF, type Event } from '../src/emu.ts'
import { fnAddr, loadProgram } from '../src/program.ts'
import { parseFunctions, runFunction, EvalError } from './evaluate.ts'
import { parseIdl } from '../src/idl.ts'

export interface EquivReport { funcs: number; trials: number; skipped?: number; failures: { fn: string; seed: number; why: string }[]; errors: { fn: string; why: string }[] }

function rng(seed: number) {
	let x = BigInt(seed) * 0x9e3779b97f4a7c15n + 0x1234567n
	return () => { x ^= x << 13n; x &= (1n << 64n) - 1n; x ^= x >> 7n; x ^= x << 17n; x &= (1n << 64n) - 1n; return x }
}

/**
 * sugar: check the readable output (the CLI default: names, strings, typed views) instead of the raw form.
 * idl: Anchor IDL (JSON) used for names in the readable output.
 */
export function checkProgram(bytes: Uint8Array, trials = 20, maxFuncs = Infinity, only?: Set<number>, verbose = false, dumpSeed?: number, sugar = false, idl?: any): EquivReport {
	const res = decompile(bytes, { sugar, only, full: true, idl: idl ? parseIdl(idl) : undefined })
	const p = res.program
	const report: EquivReport = { funcs: 0, trials: 0, failures: [], errors: [] }
	let decls
	try { decls = parseFunctions(res.text) } catch (e) { report.errors.push({ fn: '*', why: String(e) }); return report }
	const fnAddrMap = new Map<string, bigint>(), fnTarget = new Map<string, string>(), sysTarget = new Map<string, string>()
	for (const f of p.funcs.values()) { fnAddrMap.set(f.name, fnAddr(p, f.pc)); fnTarget.set(f.name, `fn:${f.pc}`) }
	for (const sc of p.syscalls.values()) sysTarget.set(sc.alias, `sys:${sc.name}`)
	// readable output: argument counts of call targets (trailing undef arguments are omitted there)
	const arity = new Map<string, number>()
	for (const f of p.funcs.values()) arity.set(`fn:${f.pc}`, (f.stackArgs ? 4 + f.stackArgs : f.nparams) + f.extraIn.length)
	for (const sc of p.syscalls.values()) arity.set(`sys:${sc.name}`, sc.params.length)
	// "text": first occurrence of its UTF-8 bytes in program memory (regions in address order)
	const strCache = new Map<string, bigint | undefined>()
	const strAddr = (text: string) => {
		if (strCache.has(text)) return strCache.get(text)
		const needle = Buffer.from(text, 'utf8')
		let at: bigint | undefined
		for (const r of [...p.image.regions].sort((x, y) => (x.vaddr < y.vaddr ? -1 : 1))) {
			const i = Buffer.from(r.bytes).indexOf(needle)
			if (i >= 0) { at = r.vaddr + BigInt(i); break }
		}
		strCache.set(text, at)
		return at
	}
	const sugarEnv = sugar ? { strAddr, arity, undefUninit: true } : {}
	const argRegs = (t: string): number[] => {
		if (t.startsWith('fn:')) { const f = p.funcs.get(Number(t.slice(3))); return f ? [...Array(f.nparams).keys()].map(i => i + 1).concat(f.extraIn) : [1, 2, 3, 4, 5] }
		if (t.startsWith('sys:')) { const sc = p.syscalls.get(t.slice(4)); return sc ? sc.params.map((_, i) => i + 1) : [1, 2, 3, 4, 5] }
		return [1, 2, 3, 4, 5]
	}
	const noreturn = (t: string) => {
		if (t.startsWith('fn:')) return !!p.funcs.get(Number(t.slice(3)))?.noreturn
		if (t.startsWith('sys:')) return !!p.syscalls.get(t.slice(4))?.noreturn
		return false
	}
	let n = 0
	for (const fo of res.funcs) {
		if (n++ >= maxFuncs) break
		const decl = decls.get(fo.name)
		if (!decl) { report.errors.push({ fn: fo.name, why: 'function missing in output' }); continue }
		report.funcs++
		const f = fo.f
		for (let t = 0; t < trials; t++) {
			const seed = t * 7919 + fo.pc
			if (process.env.SBPF_TRACE) console.log('TRIAL', seed)
			const R = rng(seed)
			const pick = (): bigint => {
				const k = Number(R() % 6n)
				if (k === 0) return R() % 16n
				if (k === 1) return 0x4_0000_0000n + (R() % 0x400n) * 8n
				if (k === 2) return 0x3_0000_0000n + (R() % 0x400n) * 8n
				if (k === 3) return 0x2_0000_0000n + (R() % 0x100n) * 8n // caller frames: never inside the callee's own frame
				if (k === 4) return R() % 0x10000n
				return R()
			}
			const args = f.isEntry ? [0x4_0000_0000n, 0n, 0n, 0n, 0n] : [pick(), pick(), pick(), pick(), f.stackArgs ? 0x2_0010_0000n + (R() % 0x100n) * 0x1000n : pick()]
			const extra = f.isEntry ? [0n, 0n, 0n, 0n, 0n] : [pick(), pick(), pick(), pick(), pick()]
			const fp = 0x2_0000_1000n + 0x2000n * BigInt(1 + (t % 5))
			let cap = Infinity
			const run = (side: 'emu' | 'dec') => {
				const events: Event[] = []
				const push = events.push.bind(events)
				events.push = (...e: Event[]) => { if (events.length >= cap) throw new StepLimit(); return push(...e) }
				const mem = new TestMem(p.image, seed, events, t % 4 === 3)
				let calls = 0
				const onCall = (target: string, a: bigint[]) => {
					events.push({ k: 'call', t: target, args: a })
					if (noreturn(target)) throw new Abort('noreturn call')
					let h = BigInt(++calls) * 0x100000001b3n
					let n = a.length
					if (target.startsWith('ptr:')) while (n > 0 && a[n - 1] === UNDEF) n--
					for (const x of a.slice(0, n)) h = ((h ^ x) * 0x100000001b3n) & ((1n << 64n) - 1n)
					// callees may write through pointer arguments: model that (identically on both sides)
					for (const x of a.slice(0, n)) {
						if (x >= 0x2_0000_0000n && x < 0x5_0000_0000n && (x & 7n) === 0n) mem.store(x, 8, (h ^ x) & 0xffffn)
					}
					return R2(h, target)
				}
				if (side === 'emu') {
					const extraIn = [extra[0], extra[1], extra[2], extra[3], extra[4]]
					const r = emulate(p, fo.pc, args, fp, mem, onCall, 20000, argRegs, extraIn, t => (t.startsWith('fn:') ? p.funcs.get(Number(t.slice(3)))?.stackArgs ?? 0 : 0))
					return { ...r, events }
				}
				const pargs = f.stackArgs ? [...args.slice(0, 4), ...Array.from({ length: f.stackArgs }, (_, k) => mem.load(args[4] - 0x1000n + BigInt(8 * k), 8))] : args.slice(0, f.isEntry ? 1 : f.nparams)
				if (!f.isEntry) for (const r of f.extraIn) pargs.push(r === 0 ? extra[0] : extra[r - 5])
				try {
					const r = runFunction(decl, pargs, { mem, onCall, fp, fnAddr: fnAddrMap, fnTarget, sysTarget, maxSteps: 20000, ...sugarEnv })
					return { ...r, events }
				} catch (e) {
					if (e instanceof EvalError) return { err: e.message, events }
					throw e
				}
			}
			const a = run('emu') as any
			// memory-unsafe execution (frame accessed through a non-frame pointer): outside the model, skip
			if (a.alias) { report.skipped = (report.skipped ?? 0) + 1; continue }
			// stores into promoted stack slots are variables in the output
			if (f.argAreaElided) {
				const lo = fp - 0x1000n, hi = fp - 0x1000n + 0x100n
				a.events = a.events.filter((e: Event) => !(e.k === 'store' && e.addr >= lo && e.addr < hi))
			}
			if (f.promoted?.length) {
				const pro = new Set(f.promoted.map(x => `${BigInt.asUintN(64, fp + BigInt(x.off))}:${x.size}`))
				a.events = a.events.filter((e: Event) => !(e.k === 'store' && pro.has(`${e.addr}:${e.size}`)))
			}
			if (a.limit) cap = a.events.length + 1
			const b = run('dec') as any
			if (dumpSeed !== undefined && seed === dumpSeed) {
				console.log('EMU', a.ret?.toString(16), a.abort ?? '', a.limit ?? ''); a.events.forEach((e: Event) => console.log('  ', fmtEv(e)))
				console.log('DEC', b.ret?.toString(16), b.abort ?? '', b.err ?? ''); b.events.forEach((e: Event) => console.log('  ', fmtEv(e)))
			}
			report.trials++
			const why = compare(a, b, f.returns, fp)
			if (why) {
				report.failures.push({ fn: fo.name, seed, why })
				if (verbose) console.log(fo.name, seed, why)
				break
			}
		}
	}
	return report
}

function R2(h: bigint, t: string): bigint {
	// stub results: mostly small (so result-dependent branches go both ways), sometimes large
	const k = h % 4n
	return k === 0n ? 0n : k === 1n ? h % 8n : k === 2n ? h : BigInt(t.length)
}

const fmtEv = (e: Event | undefined) => !e ? 'none' : e.k === 'store' ? `st${e.size * 8}[0x${e.addr.toString(16)}]=0x${e.v.toString(16)}` : `call ${e.t}(${e.args.map(x => '0x' + x.toString(16)).join(',')})`
const evEq = (x: Event, y: Event) => x.k === y.k && (x.k === 'store' ? x.addr === (y as any).addr && x.size === (y as any).size && x.v === (y as any).v
	: x.t === (y as any).t && argsEq(x.args, (y as any).args, x.t.startsWith('ptr:')))
// indirect calls: the decompiler omits trailing arguments that provably hold call-clobbered garbage
const argsEq = (a: bigint[], b: bigint[], ind: boolean) => ind
	? b.length <= a.length && b.every((v, i) => v === a[i]) && a.slice(b.length).every(v => v === UNDEF)
	: a.length === b.length && a.every((v, i) => v === b[i])

/**
 * Normalize an event trace: stores into the function's own frame between two barriers (calls or
 * stores elsewhere) are folded into the byte-level frame state they produce, because stores to
 * disjoint frame addresses commute.
 */
function normalize(events: Event[], lo: bigint, hi: bigint): Event[] {
	const out: Event[] = []
	let pending = new Map<bigint, number>()
	const flush = () => {
		for (const [addr, v] of [...pending].sort((x, y) => (x[0] < y[0] ? -1 : 1))) out.push({ k: 'store', addr, size: 1, v: BigInt(v) })
		pending = new Map()
	}
	for (const e of events) {
		if (e.k === 'store' && e.addr >= lo && e.addr + BigInt(e.size) <= hi) {
			for (let i = 0; i < e.size; i++) pending.set(e.addr + BigInt(i), Number((e.v >> BigInt(8 * i)) & 0xffn))
			continue
		}
		flush()
		out.push(e)
	}
	flush()
	return out
}

function compare(a: any, b: any, returns: boolean, fp?: bigint): string | null {
	if (b.err) return `evaluator error: ${b.err}`
	if (fp !== undefined) {
		const lo = fp - 0x1000n, hi = fp
		const isFrame = (e: Event) => e.k === 'store' && e.addr >= lo && e.addr + BigInt(e.size) <= hi
		if (a.limit || b.limit) {
			// partial trace: compare up to the last barrier both traces reached
			const barriers = (ev: Event[]) => ev.reduce((n, e) => n + (isFrame(e) ? 0 : 1), 0)
			const nb = Math.min(barriers(a.events), barriers(b.events))
			// keep everything up to and including the nb-th barrier (frame stores after it may be incomplete)
			const cut = (ev: Event[]) => { let k = 0; if (!nb) return []; for (let i = 0; i < ev.length; i++) if (!isFrame(ev[i]) && ++k === nb) return ev.slice(0, i + 1); return ev }
			a = { ...a, events: normalize(cut(a.events), lo, hi) }; b = { ...b, events: normalize(cut(b.events), lo, hi) }
		} else { a = { ...a, events: normalize(a.events, lo, hi) }; b = { ...b, events: normalize(b.events, lo, hi) } }
	}
	const n = Math.min(a.events.length, b.events.length)
	for (let i = 0; i < n; i++) if (!evEq(a.events[i], b.events[i])) return `event #${i}: emu ${fmtEv(a.events[i])} vs dec ${fmtEv(b.events[i])}`
	if (a.limit || b.limit) return null
	if (a.events.length !== b.events.length) return `event count: emu ${a.events.length} vs dec ${b.events.length}; next emu ${fmtEv(a.events[n])} dec ${fmtEv(b.events[n])}`
	if (!!a.abort !== !!b.abort) return `abort mismatch: emu ${a.abort ?? 'ret 0x' + a.ret?.toString(16)} vs dec ${b.abort ?? 'ret ' + b.ret}`
	if (!a.abort && returns && a.ret !== b.ret) return `return: emu 0x${a.ret.toString(16)} vs dec 0x${b.ret?.toString(16)}`
	return null
}

if (import.meta.main) {
	// usage: node test/equiv.ts <program.so> [trials=20] [--raw] [--idl file.json] [--only fn_x,..] [--seed N] [--max N]
	const argv = process.argv.slice(2)
	const opt = (n: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined }
	const pos = argv.filter((a, i) => !a.startsWith('--') && !['--idl', '--only', '--seed', '--max'].includes(argv[i - 1]))
	const file = pos[0]
	const trials = Number(pos[1] ?? 20)
	const maxFuncs = Number(opt('--max') ?? Infinity)
	const t0 = Date.now()
	const bytes = new Uint8Array(readFileSync(file))
	const txt = loadProgram(bytes).elf.text.addr
	const only = opt('--only') ? new Set(opt('--only')!.split(',').map(x => (x.startsWith('fn_') ? (parseInt(x.slice(3), 16) - txt) / 8 : Number(x)))) : undefined
	const idl = opt('--idl') ? JSON.parse(readFileSync(opt('--idl')!, 'utf8')) : undefined
	// default: the readable output the CLI produces; --raw: the plain form
	const r = checkProgram(bytes, trials, maxFuncs, only, true, opt('--seed') ? Number(opt('--seed')) : undefined, !argv.includes('--raw'), idl)
	console.log(`${file}: ${r.funcs} functions, ${r.trials} trials (${r.skipped ?? 0} skipped: memory-unsafe), ${r.failures.length} failing functions, ${r.errors.length} errors, ${Date.now() - t0}ms`)
	for (const e of r.errors.slice(0, 10)) console.log('ERROR', e.fn, e.why)
	if (r.failures.length || r.errors.length) process.exitCode = 1
}
