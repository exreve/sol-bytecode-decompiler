// Concrete execution of program code for analyses that only produce comments / names / view layouts
// (never code): a function is run in the reference interpreter (emu.ts) with every call followed,
// syscalls modeled, and memory a sparse byte map whose unwritten bytes come from a filler function
// (zero by default: the VM zero-initializes stack and heap). Callers use it to learn what a function
// does on concrete inputs, e.g. which bytes of its inputs end up where in its outputs. Optionally the
// run tracks input taint (see emu.ts TaintHooks): which bytes may depend on the inputs' data; values
// that input-dependent branches select show up by running the other side of those branches (`flip`).
import { createHash } from 'node:crypto'
import type { Program } from './program.ts'
import { emulate, TestMem, Abort, callTargetName, type TaintHooks } from './emu.ts'

const M = (1n << 64n) - 1n

/**
 * Memory in 4 KiB pages, materialized on first access: program image bytes where the image maps them
 * (read-only), else pseudo-random bytes from `seed` (0: zeros; the word at 0x3_0000_0000, the heap
 * allocator's cursor, always starts at zero as the VM starts it). Each byte has an input taint
 * (TaintHooks): unwritten bytes are inputs except the image and the heap (fresh memory the program
 * allocates). Loads can be observed (see onLoad).
 */
interface Page { b: Uint8Array; dv: DataView; t: Uint8Array; ro?: Uint8Array }
const PAGE = 4096n
export class ExecMem extends TestMem {
	fillSeed: number
	pages = new Map<bigint, Page>()
	onLoad?: (addr: bigint, size: number, v: bigint) => void
	constructor(p: Program, seed = 0) { super(p.image, 0, []); this.fillSeed = seed }
	private page(k: bigint): Page {
		let pg = this.pages.get(k)
		if (pg) return pg
		const base = k * PAGE
		const b = new Uint8Array(4096), t = new Uint8Array(4096).fill(base >= 0x3_0000_0000n && base < 0x4_0000_0000n ? 0 : 1)
		if (this.fillSeed) {
			// xorshift32 stream per page
			let x = (Number(k & 0xffffffffn) ^ Math.imul(Number((k >> 32n) & 0xffffffffn), 0x9e3779b9) ^ Math.imul(this.fillSeed, 0x85ebca6b)) | 0
			x = x || 1
			for (let i = 0; i < 4096; i += 4) {
				x ^= x << 13; x ^= x >>> 17; x ^= x << 5
				b[i] = x & 0xff; b[i + 1] = (x >>> 8) & 0xff; b[i + 2] = (x >>> 16) & 0xff; b[i + 3] = (x >>> 24) & 0xff
			}
		}
		if (base === 0x3_0000_0000n) b.fill(0, 0, 8)
		let ro: Uint8Array | undefined
		for (const r of this.image.regions) {
			const rend = r.vaddr + BigInt(r.bytes.length)
			const lo = r.vaddr > base ? r.vaddr : base, hi = rend < base + PAGE ? rend : base + PAGE
			if (lo >= hi) continue
			ro ??= new Uint8Array(4096)
			const o = Number(lo - base), n = Number(hi - lo)
			b.set(r.bytes.subarray(Number(lo - r.vaddr), Number(lo - r.vaddr) + n), o)
			t.fill(0, o, o + n); ro.fill(1, o, o + n)
		}
		pg = { b, dv: new DataView(b.buffer), t, ro }
		this.pages.set(k, pg)
		return pg
	}
	byte(a: bigint): number { a &= M; return this.page(a >> 12n).b[Number(a & 0xfffn)] }
	load(addr: bigint, size: number): bigint {
		addr &= M
		const o = Number(addr & 0xfffn)
		let v: bigint
		if (o + size <= 4096) {
			const dv = this.page(addr >> 12n).dv
			v = size === 8 ? dv.getBigUint64(o, true) : BigInt(size === 4 ? dv.getUint32(o, true) : size === 2 ? dv.getUint16(o, true) : dv.getUint8(o))
		} else v = this.readU(addr, size)
		this.onLoad?.(addr, size, v)
		return v
	}
	store(addr: bigint, size: number, v: bigint) {
		addr &= M
		const o = Number(addr & 0xfffn)
		if (o + size <= 4096) {
			const pg = this.page(addr >> 12n)
			if (pg.ro && pg.ro.subarray(o, o + size).some(x => x)) throw new Abort('store to read-only memory')
			if (size === 8) pg.dv.setBigUint64(o, v & M, true)
			else { const n = Number(v & 0xffffffffn); if (size === 4) pg.dv.setUint32(o, n, true); else if (size === 2) pg.dv.setUint16(o, n & 0xffff, true); else pg.b[o] = n & 0xff }
			return
		}
		for (let i = 0; i < size; i++) {
			const a = (addr + BigInt(i)) & M, pg = this.page(a >> 12n), k = Number(a & 0xfffn)
			if (pg.ro?.[k]) throw new Abort('store to read-only memory')
			pg.b[k] = Number((v >> BigInt(8 * i)) & 0xffn)
		}
	}
	/** raw bytes (no load observation) */
	read(addr: bigint, n: number): Uint8Array {
		const out = new Uint8Array(n)
		for (let i = 0; i < n; i++) { const a = (addr + BigInt(i)) & M; out[i] = this.page(a >> 12n).b[Number(a & 0xfffn)] }
		return out
	}
	readU(addr: bigint, size: number): bigint {
		let v = 0n
		for (let i = size - 1; i >= 0; i--) v = (v << 8n) | BigInt(this.byte(addr + BigInt(i)))
		return v
	}
	write(addr: bigint, b: Uint8Array, taint?: number | number[]) {
		for (let i = 0; i < b.length; i++) {
			const a = (addr + BigInt(i)) & M, pg = this.page(a >> 12n), k = Number(a & 0xfffn)
			pg.b[k] = b[i]
			if (taint !== undefined) pg.t[k] = typeof taint === 'number' ? taint : taint[i]
		}
	}
	tainted(addr: bigint, n: number): number {
		let t = 0
		for (let i = 0; i < n; i++) { const a = (addr + BigInt(i)) & M; t |= this.page(a >> 12n).t[Number(a & 0xfffn)] }
		return t
	}
	setTaint(addr: bigint, n: number, t: number) {
		addr &= M
		const o = Number(addr & 0xfffn)
		if (o + n <= 4096) { this.page(addr >> 12n).t.fill(t, o, o + n); return }
		for (let i = 0; i < n; i++) { const a = (addr + BigInt(i)) & M; this.page(a >> 12n).t[Number(a & 0xfffn)] = t }
	}
	taintBytes(addr: bigint, n: number): number[] { return Array.from({ length: n }, (_, i) => this.tainted(addr + BigInt(i), 1)) }
}

export class Stop extends Error {}
class Limit extends Error {}

export interface ExecResult { ret?: bigint; abort?: string; steps: number; limit?: boolean; stopped?: boolean }

/**
 * Runs functions with all calls followed. `onSyscall` may handle a syscall (return its r0) or stop the
 * run (throw Stop); unhandled syscalls get the models below. Frames: fp + 0x2000 per call depth.
 */
export class Exec {
	p: Program
	mem: ExecMem
	steps = 0
	maxSteps: number
	maxDepth: number
	onSyscall?: (name: string, args: bigint[], x: Exec) => bigint | undefined
	/** called before each call (pc of the call instruction in its caller, depth of the caller); may change the arguments in place */
	onCall?: (target: string, args: bigint[], pc: number, depth: number) => void
	/** track input taint (TaintHooks): all registers but r10 are inputs of the run */
	taint: boolean
	/** in called functions, force branches away from paths that can only abort (panics on the synthetic inputs) */
	noPanic = false
	/**
	 * Explore the other side of input-dependent branches (on taint): take it the first time each is
	 * executed where the forcing leaves the choice open, unless in `noFlip`. A flip is added to `noFlip`
	 * (and `blamed` set) when the run's function then has to be forced against its inputs' choice: the
	 * flipped branch led to an error path (e.g. an Err return the caller then checks).
	 */
	flip = false
	noFlip = new Set<string>()
	blamed = false
	/** the branches flipped in the last run, in order */
	flipped = new Set<string>()
	private flipLog: string[] = []
	/**
	 * Control taint (bit 2, TaintHooks) from the branches whose other side is not explored: those in
	 * noFlip, or every one ('all'), or those in noFlip in the run's function and every one in called
	 * functions ('callees').
	 */
	sticky: 'noflip' | 'all' | 'callees' = 'noflip'
	/** 1: the models of the PDA syscalls derive other bump seeds (so runs 0 and 1 disagree on them) */
	variant = 0
	private pdaCalls = 0
	private force?: { reach: Set<number>; target: number }
	constructor(p: Program, mem: ExecMem, opts: { maxSteps?: number; maxDepth?: number; taint?: boolean } = {}) {
		this.p = p; this.mem = mem; this.maxSteps = opts.maxSteps ?? 200_000; this.maxDepth = opts.maxDepth ?? 24; this.taint = !!opts.taint
	}

	/**
	 * Run the function at `pc`. `target`: the pc of an instruction of that function; its conditional
	 * branches are forced towards it when only one side can reach it (the run then follows a path to the
	 * target, not necessarily one its inputs select).
	 */
	run(pc: number, args: bigint[], fp = 0x2_0000_1000n, target?: number, extraIn: bigint[] = []): ExecResult {
		const start = this.steps
		const reach = target === undefined ? undefined : reaching(this.p, pc, target)
		this.force = reach ? { reach, target: target! } : undefined
		this.flipped.clear(); this.flipLog = []; this.blamed = false
		try {
			const r = this.frame(pc, args, fp, 0, extraIn, Array.from({ length: 11 }, (_, i) => (i === 10 ? 0 : 1)))
			return { ret: r.ret, steps: this.steps - start }
		} catch (e) {
			if (e instanceof Stop) return { stopped: true, steps: this.steps - start }
			if (e instanceof Abort) return { abort: e.message, steps: this.steps - start }
			if (e instanceof Limit) return { limit: true, steps: this.steps - start }
			throw e
		}
	}

	/** Branch decisions (forced when only one side can reach `reach`; flips, see `flip`) and the sticky predicate. */
	private forcer(fpc: number, depth: number, reach: Set<number> | undefined): { branch: (pc: number, taken: boolean, tainted: boolean) => boolean; sticky: (pc: number) => boolean } {
		const insns = this.p.insns
		const forced = (pc: number) => !!reach && reach.has(pc + 1 + insns[pc].off) !== reach.has(pc + 1)
		return {
			sticky: pc => !forced(pc) && (this.sticky === 'all' || (this.sticky === 'callees' && depth > 0) || this.noFlip.has(`${fpc}:${pc}`)),
			branch: (pc, taken, tainted) => {
				if (forced(pc)) {
					const dir = reach!.has(pc + 1 + insns[pc].off)
					if (depth === 0) {
						// forced against the inputs' choice right after flips: blame them
						if (dir !== taken && this.flipLog.length) { for (const k of this.flipLog) this.noFlip.add(k); this.blamed = true }
						if (dir === taken) this.flipLog = []
					}
					return dir
				}
				const k = `${fpc}:${pc}`
				if (this.flip && tainted && !this.flipped.has(k) && !this.noFlip.has(k)) { this.flipped.add(k); this.flipLog.push(k); return !taken }
				return taken
			},
		}
	}

	private frame(pc: number, args: bigint[], fp: bigint, depth: number, extraIn: bigint[], init: number[], base = 0): { ret?: bigint; retTaint?: number } {
		const budget = this.maxSteps - this.steps
		if (budget <= 0 || depth > this.maxDepth) throw new Limit()
		const m = this.mem
		const reach = depth === 0 && this.force ? this.force.reach : this.noPanic ? returning(this.p, pc) : undefined
		const f = this.forcer(pc, depth, reach)
		const taint: TaintHooks | undefined = this.taint ? { init, base, sticky: f.sticky, mem: (a, n) => m.tainted(a, n), set: (a, n, t) => m.setTaint(a, n, t) } : undefined
		const r = emulate(this.p, pc, args, fp, this.mem, (t, a, cpc) => this.call(t, a, cpc ?? -1, fp, depth, taint), budget,
			() => [1, 2, 3, 4, 5], extraIn, () => 0, { frameCheck: false, branch: f.branch, taint })
		this.steps += r.steps
		if (r.limit) throw new Limit()
		if (r.abort !== undefined) throw new Abort(r.abort)
		return { ret: r.ret, retTaint: r.retTaint }
	}

	private call(t: string, a: bigint[], cpc: number, fp: bigint, depth: number, taint?: TaintHooks): bigint {
		this.onCall?.(t, a, cpc, depth)
		let target: number | undefined
		if (t.startsWith('fn:')) target = Number(t.slice(3))
		else if (t.startsWith('ptr:')) {
			const addr = BigInt('0x' + t.slice(4)), off = addr - this.p.textVaddr
			if (off < 0n || off % 8n !== 0n || off / 8n >= BigInt(this.p.insns.length)) throw new Abort('bad indirect call')
			target = Number(off / 8n)
		}
		if (target !== undefined) {
			// callee registers: the arguments with their taint; the others (callee-saved, clobbered) as inputs
			const init = [1, ...(taint?.args ?? [1, 1, 1, 1, 1]), 1, 1, 1, 1, 0]
			const r = this.frame(target, a, fp + 0x2000n, depth + 1, [], init, taint?.ctl ?? 0)
			if (taint) taint.ret = r.retTaint ?? 1
			return r.ret ?? 0n
		}
		const name = t.startsWith('sys:') ? t.slice(4) : t
		if (taint) taint.ret = taint.ctl ?? 0
		const h = this.onSyscall?.(name, a, this)
		if (h !== undefined) return h
		return this.syscall(name, a, taint?.args ?? [1, 1, 1, 1, 1])
	}

	/** n pseudo-random bytes (depending on the memory's seed; tainted): outputs of the environment (sysvars) */
	private opaque(addr: bigint, n: number) {
		const src = 0x7_0000_0000n + (addr & 0xffff_fff8n)
		this.mem.write(addr, this.mem.read(src, n), 1)
	}

	/**
	 * Syscall models (enough for straight-line library code: memory ops, logs, hashes; sysvars from the
	 * filler). `at`: taint of the argument registers.
	 */
	syscall(name: string, a: bigint[], at: number[] = [1, 1, 1, 1, 1]): bigint {
		const m = this.mem
		const n = Number(a[2] & 0xffffffffn)
		switch (name) {
			case 'abort': case 'sol_panic_': throw new Abort(name)
			case 'sol_memcpy_': case 'sol_memmove_': {
				if (n > 1 << 20) throw new Abort('memcpy size')
				if (m.onLoad) for (let i = 0; i + 8 <= n; i += 8) m.onLoad((a[1] + BigInt(i)) & M, 8, m.readU(a[1] + BigInt(i), 8))
				m.write(a[0], m.read(a[1], n), m.taintBytes(a[1], n).map(t => t | at[1] | at[2]))
				return 0n
			}
			case 'sol_memset_': { if (n > 1 << 20) throw new Abort('memset size'); m.write(a[0], new Uint8Array(n).fill(Number(a[1] & 0xffn)), at[1] | at[2]); return 0n }
			case 'sol_memcmp_': {
				const x = m.read(a[0], n), y = m.read(a[1], n)
				let r = 0
				for (let i = 0; i < n; i++) if (x[i] !== y[i]) { r = x[i] - y[i]; break }
				m.store(a[3], 4, BigInt.asUintN(32, BigInt(r)))
				m.setTaint(a[3], 4, m.tainted(a[0], n) | m.tainted(a[1], n) | at[0] | at[1] | at[2])
				return 0n
			}
			case 'sol_sha256': case 'sol_keccak256': {
				const hsh = createHash(name === 'sol_sha256' ? 'sha256' : 'sha3-256') // (keccak: a stand-in digest)
				for (let i = 0n; i < a[1] && i < 64n; i++) hsh.update(m.read(m.readU(a[0] + 16n * i, 8), Number(m.readU(a[0] + 16n * i + 8n, 8) & 0xffffn)))
				m.write(a[2], new Uint8Array(hsh.digest()), 1)
				return 0n
			}
			case 'sol_try_find_program_address': case 'sol_create_program_address': {
				// a stand-in address (tainted: not the real derivation, whatever the seeds); variant 1 fails
				// every other create_program_address, so bump seeds searched from 255 differ between the variants
				if (name === 'sol_create_program_address' && this.variant === 1 && this.pdaCalls++ % 2 === 0) return 1n
				const hsh = createHash('sha256')
				for (let i = 0n; i < a[1] && i < 17n; i++) hsh.update(m.read(m.readU(a[0] + 16n * i, 8), Number(m.readU(a[0] + 16n * i + 8n, 8) & 0xffn)))
				hsh.update(m.read(a[2], 32))
				m.write(a[3], new Uint8Array(hsh.digest()), 1)
				if (name === 'sol_try_find_program_address') { m.store(a[4], 1, this.variant === 1 ? 254n : 255n); m.setTaint(a[4], 1, 1) }
				return 0n
			}
			// sysvars: bytes from the filler (so values derived from them are not taken for constants)
			case 'sol_get_clock_sysvar': this.opaque(a[0], 40); return 0n
			case 'sol_get_rent_sysvar': this.opaque(a[0], 17); return 0n
			case 'sol_get_epoch_schedule_sysvar': this.opaque(a[0], 33); return 0n
			case 'sol_get_fees_sysvar': case 'sol_get_last_restart_slot': this.opaque(a[0], 8); return 0n
			case 'sol_get_epoch_rewards_sysvar': this.opaque(a[0], 96); return 0n
			case 'sol_get_sysvar': this.opaque(a[1], Number(a[3] & 0xffffn)); return 0n
			case 'sol_get_stack_height': return 1n
			case 'sol_remaining_compute_units': return 1_000_000n
			case 'sol_get_return_data': return 0n
			case 'sol_alloc_free_': return 0n
			default: return 0n // logs, return data, CPIs (unless handled by onSyscall)
		}
	}
}

/** Function extents: entry pc -> first pc after it (the next function's entry). */
const extents = new WeakMap<Program, Map<number, number>>()
export function extentOf(p: Program, fpc: number): number {
	let m = extents.get(p)
	if (!m) {
		m = new Map()
		const starts = [...p.funcs.keys()].sort((a, b) => a - b)
		starts.forEach((s, i) => m!.set(s, starts[i + 1] ?? p.insns.length))
		extents.set(p, m)
	}
	return m.get(fpc) ?? p.insns.length
}

/**
 * Machine-level control flow of a function (instructions within its extent): predecessor and successor
 * lists; exits are returns; calls to noreturn functions end their path.
 */
interface Cfg { preds: Map<number, number[]>; succs: Map<number, number[]>; exits: number[]; end: number }
const cfgCache = new WeakMap<Program, Map<number, Cfg>>()
function cfgOf(p: Program, fpc: number): Cfg {
	let c = cfgCache.get(p)
	if (!c) cfgCache.set(p, (c = new Map()))
	let r = c.get(fpc)
	if (r) return r
	const end = extentOf(p, fpc)
	const v3 = p.version >= 3, noLddw = p.version === 2
	const preds = new Map<number, number[]>(), succs = new Map<number, number[]>(), exits: number[] = []
	const edge = (a: number, b: number) => {
		if (b < fpc || b >= end) return
		let l = preds.get(b); if (!l) preds.set(b, (l = [])); l.push(a)
		let s = succs.get(a); if (!s) succs.set(a, (s = [])); s.push(b)
	}
	for (let pc = fpc; pc < end; pc++) {
		const ins = p.insns[pc]
		const cls = ins.opc & 7, code = ins.opc >> 4
		if (ins.opc === 0x18 && !noLddw) { edge(pc, pc + 2); pc++; continue }
		if (ins.opc === 0x95 || ins.opc === 0x9d) { exits.push(pc); continue }
		if (ins.opc === 0x05) { edge(pc, pc + 1 + ins.off); continue }
		if (ins.opc === 0x85) {
			const t = callTargetName(p, pc, ins.imm)
			const noret = t.startsWith('fn:') ? !!p.funcs.get(Number(t.slice(3)))?.noreturn : t === 'sys:abort' || t === 'sys:sol_panic_'
			if (!noret) edge(pc, pc + 1)
			continue
		}
		if ((cls === 5 || (v3 && cls === 6)) && [1, 2, 3, 4, 5, 6, 7, 0xa, 0xb, 0xc, 0xd].includes(code) && ins.opc !== 0x8d) { edge(pc, pc + 1); edge(pc, pc + 1 + ins.off); continue }
		edge(pc, pc + 1)
	}
	r = { preds, succs, exits, end }
	c.set(fpc, r)
	return r
}

function backward(preds: Map<number, number[]>, seeds: number[]): Set<number> {
	const reach = new Set<number>(seeds), q = [...seeds]
	while (q.length) for (const x of preds.get(q.pop()!) ?? []) if (!reach.has(x)) { reach.add(x); q.push(x) }
	return reach
}

/** Instructions of the function at fpc from which `target` can be reached (within the function; calls fall through). */
export function reaching(p: Program, fpc: number, target: number): Set<number> | undefined {
	const { preds, end } = cfgOf(p, fpc)
	if (target < fpc || target >= end) return undefined
	return backward(preds, [target])
}

/** Instructions of the function at fpc from which it can return (not only abort / panic). */
const retCache = new WeakMap<Program, Map<number, Set<number>>>()
export function returning(p: Program, fpc: number): Set<number> {
	let c = retCache.get(p)
	if (!c) retCache.set(p, (c = new Map()))
	let r = c.get(fpc)
	if (!r) { const { preds, exits } = cfgOf(p, fpc); r = backward(preds, exits); c.set(fpc, r) }
	return r
}
