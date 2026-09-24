// Differential equivalence check: bytecode (reference emulator) vs decompiled TypeScript (evaluator).
// usage: node test/equiv.ts <program.so> [trials] [maxFuncs]
import { readFileSync } from 'node:fs'
import { decompile } from '../src/decompile.ts'
import { emulate, TestMem, Abort, StepLimit, UNDEF, type Event } from '../src/emu.ts'
import { fnAddr } from '../src/program.ts'
import { parseFunctions, runFunction, EvalError } from './evaluate.ts'

export interface EquivReport { funcs: number; trials: number; failures: { fn: string; seed: number; why: string }[]; errors: { fn: string; why: string }[] }

function rng(seed: number) {
	let x = BigInt(seed) * 0x9e3779b97f4a7c15n + 0x1234567n
	return () => { x ^= x << 13n; x &= (1n << 64n) - 1n; x ^= x >> 7n; x ^= x << 17n; x &= (1n << 64n) - 1n; return x }
}

export function checkProgram(bytes: Uint8Array, trials = 20, maxFuncs = Infinity, only?: Set<number>, verbose = false, dumpSeed?: number): EquivReport {
	const res = decompile(bytes, { sugar: false, only })
	const p = res.program
	const report: EquivReport = { funcs: 0, trials: 0, failures: [], errors: [] }
	let decls
	try { decls = parseFunctions(res.text) } catch (e) { report.errors.push({ fn: '*', why: String(e) }); return report }
	const fnAddrMap = new Map<string, bigint>(), fnTarget = new Map<string, string>(), sysTarget = new Map<string, string>()
	for (const f of p.funcs.values()) { fnAddrMap.set(f.name, fnAddr(p, f.pc)); fnTarget.set(f.name, `fn:${f.pc}`) }
	for (const sc of p.syscalls.values()) sysTarget.set(sc.alias, `sys:${sc.name}`)
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
			const R = rng(seed)
			const pick = (): bigint => {
				const k = Number(R() % 6n)
				if (k === 0) return R() % 16n
				if (k === 1) return 0x4_0000_0000n + (R() % 0x400n) * 8n
				if (k === 2) return 0x3_0000_0000n + (R() % 0x400n) * 8n
				if (k === 3) return 0x2_0000_0000n + (R() % 0x800n) * 8n
				if (k === 4) return R() % 0x10000n
				return R()
			}
			const args = f.isEntry ? [0x4_0000_0000n, 0n, 0n, 0n, 0n] : [pick(), pick(), pick(), pick(), pick()]
			const extra = f.isEntry ? [0n, 0n, 0n, 0n, 0n] : [pick(), pick(), pick(), pick(), pick()]
			const fp = 0x2_0000_1000n + 0x2000n * BigInt(1 + (t % 5))
			let cap = Infinity
			const run = (side: 'emu' | 'dec') => {
				const events: Event[] = []
				const push = events.push.bind(events)
				events.push = (...e: Event[]) => { if (events.length >= cap) throw new StepLimit(); return push(...e) }
				const mem = new TestMem(p.image, seed, events)
				let calls = 0
				const onCall = (target: string, a: bigint[]) => {
					events.push({ k: 'call', t: target, args: a })
					if (noreturn(target)) throw new Abort('noreturn call')
					let h = BigInt(++calls) * 0x100000001b3n
					let n = a.length
					if (target.startsWith('ptr:')) while (n > 0 && a[n - 1] === UNDEF) n--
					for (const x of a.slice(0, n)) h = ((h ^ x) * 0x100000001b3n) & ((1n << 64n) - 1n)
					return R2(h, target)
				}
				if (side === 'emu') {
					const extraIn = [extra[0], extra[1], extra[2], extra[3], extra[4]]
					const r = emulate(p, fo.pc, args, fp, mem, onCall, 20000, argRegs, extraIn)
					return { ...r, events }
				}
				const pargs = args.slice(0, f.isEntry ? 1 : f.nparams)
				if (!f.isEntry) for (const r of f.extraIn) pargs.push(r === 0 ? extra[0] : extra[r - 5])
				try {
					const r = runFunction(decl, pargs, { mem, onCall, fp, fnAddr: fnAddrMap, fnTarget, sysTarget, maxSteps: 20000 })
					return { ...r, events }
				} catch (e) {
					if (e instanceof EvalError) return { err: e.message, events }
					throw e
				}
			}
			const a = run('emu') as any
			// stores into promoted stack slots are variables in the output
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
			const why = compare(a, b, f.returns)
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

function compare(a: any, b: any, returns: boolean): string | null {
	if (b.err) return `evaluator error: ${b.err}`
	const n = Math.min(a.events.length, b.events.length)
	for (let i = 0; i < n; i++) if (!evEq(a.events[i], b.events[i])) return `event #${i}: emu ${fmtEv(a.events[i])} vs dec ${fmtEv(b.events[i])}`
	if (a.limit || b.limit) return null
	if (a.events.length !== b.events.length) return `event count: emu ${a.events.length} vs dec ${b.events.length}; next emu ${fmtEv(a.events[n])} dec ${fmtEv(b.events[n])}`
	if (!!a.abort !== !!b.abort) return `abort mismatch: emu ${a.abort ?? 'ret 0x' + a.ret?.toString(16)} vs dec ${b.abort ?? 'ret ' + b.ret}`
	if (!a.abort && returns && a.ret !== b.ret) return `return: emu 0x${a.ret.toString(16)} vs dec 0x${b.ret?.toString(16)}`
	return null
}

if (import.meta.main) {
	const file = process.argv[2]
	const trials = Number(process.argv[3] ?? 20)
	const maxFuncs = Number(process.argv[4] ?? Infinity)
	const t0 = Date.now()
	const only = process.env.ONLY ? new Set(process.env.ONLY.split(',').map(Number)) : undefined
	const r = checkProgram(new Uint8Array(readFileSync(file)), trials, maxFuncs, only, true, process.env.SEED ? Number(process.env.SEED) : undefined)
	console.log(`${file}: ${r.funcs} functions, ${r.trials} trials, ${r.failures.length} failing functions, ${r.errors.length} errors, ${Date.now() - t0}ms`)
	for (const e of r.errors.slice(0, 10)) console.log('ERROR', e.fn, e.why)
	if (r.failures.length || r.errors.length) process.exitCode = 1
}
