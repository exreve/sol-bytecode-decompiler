// Concrete execution of program code for analyses that only produce comments / names / view layouts
// (never code): a function is run with every call followed, syscalls modeled, and memory a sparse byte
// map whose unwritten bytes come from a filler function (zero by default: the VM zero-initializes stack
// and heap). Callers use it to learn what a function does on concrete inputs, e.g. which bytes of its
// inputs end up where in its outputs. Optionally the run tracks input taint (see emu.ts TaintHooks):
// which bytes may depend on the inputs' data; values that input-dependent branches select show up by
// running the other side of those branches (`flip`).
//
// The interpreter (Exec.frame) is the reference interpreter's (emu.ts emulate, run with `frameCheck:
// false` and the taint hooks) instruction for instruction, on registers held as two int32 halves: the
// runs of an analysis execute millions of instructions, and BigInt arithmetic allocates per operation.
import { createHash } from 'node:crypto'
import type { Program } from './program.ts'
import { TestMem, Abort, callTargetName } from './emu.ts'
import { SYSCALL_BY_HASH } from './syscalls.ts'

const M = (1n << 64n) - 1n
/** the u64 of two int32 halves */
export const big = (h: number, l: number): bigint => (h === 0 ? BigInt(l >>> 0) : (BigInt(h >>> 0) << 32n) | BigInt(l >>> 0))
const hiOf = (v: bigint) => Number((v >> 32n) & 0xffffffffn) | 0
const loOf = (v: bigint) => Number(v & 0xffffffffn) | 0
/** page number of the address with halves h, l */
const pageOf = (h: number, l: number) => (h >>> 0) * 0x100000 + (l >>> 12)

/**
 * Memory in 4 KiB pages, materialized on first access: program image bytes where the image maps them
 * (read-only), else pseudo-random bytes from `seed` (0: zeros; the word at 0x3_0000_0000, the heap
 * allocator's cursor, always starts at zero as the VM starts it). Each byte has an input taint
 * (TaintHooks): unwritten bytes are inputs except the image and the heap (fresh memory the program
 * allocates). Loads can be observed (see onLoad).
 */
// (t: per-byte taint, allocated on the first byte that differs from the page's default t0)
interface Page { b: Uint8Array; dv: DataView; t?: Uint8Array; t0: number; ro?: Uint8Array }
const PAGE = 4096n
/** page numbers the program image maps (any byte) */
const imagePagesMemo = new WeakMap<object, Set<number>>()
function imagePages(image: { regions: { vaddr: bigint; bytes: Uint8Array }[] }): Set<number> {
	let s = imagePagesMemo.get(image)
	if (!s) {
		s = new Set()
		for (const r of image.regions) if (r.bytes.length) for (let k = r.vaddr >> 12n; k <= (r.vaddr + BigInt(r.bytes.length) - 1n) >> 12n; k++) s.add(Number(k))
		imagePagesMemo.set(image, s)
	}
	return s
}
/**
 * The pseudo-random bytes of page k for a seed: a xorshift32 stream (little-endian words). Cached (up
 * to 16 MiB): the runs of an analysis use the same seeds, and the pointers they load from the filler
 * are the same in every run, so most pages are materialized again and again.
 */
const fillCache = new Map<number, Map<number, Uint8Array>>()
let fillCached = 0
function fillBytes(seed: number, k: number): Uint8Array {
	let c = fillCache.get(seed)
	if (!c) fillCache.set(seed, (c = new Map()))
	const r = c.get(k)
	if (r) return r
	let x = ((k >>> 0) ^ Math.imul(Math.floor(k / 0x1_0000_0000) >>> 0, 0x9e3779b9) ^ Math.imul(seed, 0x85ebca6b)) | 0
	x = x || 1
	const u = new Uint32Array(1024)
	for (let i = 0; i < 1024; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; u[i] = x }
	const b = new Uint8Array(u.buffer)
	if (fillCached < 4096) { c.set(k, b); fillCached++ }
	return b
}
/** pages of released memories (ExecMem.release), for their buffers and views; taint arrays likewise */
const pagePool: Page[] = []
const tPool: Uint8Array[] = []
const newT = (t0: number) => (tPool.pop() ?? new Uint8Array(4096)).fill(t0)
const tArr = (pg: Page) => (pg.t ??= newT(pg.t0))
export class ExecMem extends TestMem {
	fillSeed: number
	pages = new Map<number, Page>() // (page number as a Number: exact below 2^53, and faster to hash than a BigInt)
	/** observes loads (the address and the value as int32 halves) */
	onLoad?: (ah: number, al: number, size: number, vh: number, vl: number) => void
	/** the bytes a memcpy reads (else they are observed as 8-byte loads, see onLoad) */
	onCopy?: (addr: bigint, bytes: Uint8Array) => void
	/** the value ldN loaded (int32 halves) */
	vh = 0
	vl = 0
	constructor(p: Program, seed = 0) { super(p.image, 0, []); this.fillSeed = seed }
	// the two pages accessed last (stack and data alternate)
	private lastK = -1
	private lastPg?: Page
	private prevK = -1
	private prevPg?: Page
	private page(k: number): Page {
		if (k === this.lastK) return this.lastPg!
		if (k === this.prevK) { const pg = this.prevPg!; this.prevK = this.lastK; this.prevPg = this.lastPg; this.lastK = k; this.lastPg = pg; return pg }
		let pg = this.pages.get(k)
		if (pg) { this.prevK = this.lastK; this.prevPg = this.lastPg; this.lastK = k; this.lastPg = pg; return pg }
		const pooled = pagePool.pop()
		const b = pooled ? pooled.b : new Uint8Array(4096), t0 = k >= 0x30_0000 && k < 0x40_0000 ? 0 : 1
		if (pooled && !this.fillSeed) b.fill(0)
		let t: Uint8Array | undefined
		if (this.fillSeed) b.set(fillBytes(this.fillSeed, k))
		if (k === 0x30_0000) b.fill(0, 0, 8)
		let ro: Uint8Array | undefined
		if (imagePages(this.image).has(k)) {
			const base = BigInt(k) * PAGE
			for (const r of this.image.regions) {
				const rend = r.vaddr + BigInt(r.bytes.length)
				const lo = r.vaddr > base ? r.vaddr : base, hi = rend < base + PAGE ? rend : base + PAGE
				if (lo >= hi) continue
				ro ??= new Uint8Array(4096)
				const o = Number(lo - base), n = Number(hi - lo)
				b.set(r.bytes.subarray(Number(lo - r.vaddr), Number(lo - r.vaddr) + n), o)
				t ??= newT(t0)
				t.fill(0, o, o + n); ro.fill(1, o, o + n)
			}
		}
		pg = { b, dv: pooled ? pooled.dv : new DataView(b.buffer), t, t0, ro }
		this.pages.set(k, pg)
		this.prevK = this.lastK; this.prevPg = this.lastPg
		this.lastK = k; this.lastPg = pg
		return pg
	}
	/** give the pages' buffers back for reuse by later memories (this one must not be used afterwards) */
	release() {
		for (const pg of this.pages.values()) {
			if (pg.t && tPool.length < 1024) tPool.push(pg.t)
			if (!pg.ro && pagePool.length < 1024) pagePool.push(pg)
		}
		this.pages.clear(); this.lastK = this.prevK = -1; this.lastPg = this.prevPg = undefined
	}
	byte(a: bigint): number { a &= M; return this.page(Number(a >> 12n)).b[Number(a & 0xfffn)] }
	load(addr: bigint, size: number): bigint {
		addr &= M
		this.ldN(hiOf(addr), loOf(addr), size)
		return big(this.vh, this.vl)
	}
	/** load `size` bytes at the address with int32 halves ah, al: the value in vh, vl */
	ldN(ah: number, al: number, size: number) {
		const o = al & 0xfff
		let vh = 0, vl: number
		if (o + size <= 4096) {
			const pg = this.page(pageOf(ah, al))
			if (size === 8) { vl = pg.dv.getInt32(o, true); vh = pg.dv.getInt32(o + 4, true) }
			else vl = size === 4 ? pg.dv.getInt32(o, true) : size === 2 ? pg.dv.getUint16(o, true) : pg.b[o]
		} else { const v = this.readU(big(ah, al), size); vh = hiOf(v); vl = loOf(v) }
		this.vh = vh; this.vl = vl
		this.onLoad?.(ah, al, size, vh, vl)
	}
	store(addr: bigint, size: number, v: bigint) {
		addr &= M
		const o = Number(addr & 0xfffn)
		if (o + size <= 4096) { this.stN(hiOf(addr), loOf(addr), size, hiOf(v), loOf(v)); return }
		for (let i = 0; i < size; i++) {
			const a = (addr + BigInt(i)) & M, pg = this.page(Number(a >> 12n)), k = Number(a & 0xfffn)
			if (pg.ro?.[k]) throw new Abort('store to read-only memory')
			pg.b[k] = Number((v >> BigInt(8 * i)) & 0xffn)
		}
	}
	/** store the low `size` bytes of the value with halves vh, vl at the address with halves ah, al */
	stN(ah: number, al: number, size: number, vh: number, vl: number) {
		const o = al & 0xfff
		if (o + size > 4096) { this.store(big(ah, al), size, big(vh, vl)); return }
		const pg = this.page(pageOf(ah, al))
		const ro = pg.ro
		if (ro) for (let i = o; i < o + size; i++) if (ro[i]) throw new Abort('store to read-only memory')
		if (size === 8) { pg.dv.setInt32(o, vl, true); pg.dv.setInt32(o + 4, vh, true) }
		else if (size === 4) pg.dv.setInt32(o, vl, true)
		else if (size === 2) pg.dv.setUint16(o, vl & 0xffff, true)
		else pg.b[o] = vl & 0xff
	}
	/** raw bytes (no load observation) */
	read(addr: bigint, n: number): Uint8Array {
		addr &= M
		const o = Number(addr & 0xfffn)
		if (o + n <= 4096) return this.page(Number(addr >> 12n)).b.slice(o, o + n)
		const out = new Uint8Array(n)
		// page by page
		for (let i = 0; i < n;) {
			const a = (addr + BigInt(i)) & M, k = Number(a & 0xfffn), c = Math.min(n - i, 4096 - k)
			out.set(this.page(Number(a >> 12n)).b.subarray(k, k + c), i)
			i += c
		}
		return out
	}
	readU(addr: bigint, size: number): bigint {
		let v = 0n
		for (let i = size - 1; i >= 0; i--) v = (v << 8n) | BigInt(this.byte(addr + BigInt(i)))
		return v
	}
	write(addr: bigint, b: Uint8Array, taint?: number | ArrayLike<number>) {
		// page by page
		for (let i = 0; i < b.length;) {
			const a = (addr + BigInt(i)) & M, pg = this.page(Number(a >> 12n)), k = Number(a & 0xfffn), c = Math.min(b.length - i, 4096 - k)
			pg.b.set(b.subarray(i, i + c), k)
			if (typeof taint === 'number') { if (pg.t || taint !== pg.t0) tArr(pg).fill(taint, k, k + c) }
			else if (taint !== undefined) { const t = tArr(pg); for (let j = 0; j < c; j++) t[k + j] = taint[i + j] }
			i += c
		}
	}
	/** the taint of n bytes */
	taintArr(addr: bigint, n: number): Uint8Array {
		addr &= M
		const out = new Uint8Array(n)
		for (let i = 0; i < n;) {
			const a = (addr + BigInt(i)) & M, pg = this.page(Number(a >> 12n)), k = Number(a & 0xfffn), c = Math.min(n - i, 4096 - k)
			if (pg.t) out.set(pg.t.subarray(k, k + c), i); else if (pg.t0) out.fill(pg.t0, i, i + c)
			i += c
		}
		return out
	}
	tainted(addr: bigint, n: number): number {
		addr &= M
		const o = Number(addr & 0xfffn)
		if (o + n <= 4096) return this.taintedN(hiOf(addr), loOf(addr), n)
		let t = 0
		for (let i = 0; i < n; i++) { const a = (addr + BigInt(i)) & M, pg = this.page(Number(a >> 12n)); t |= pg.t ? pg.t[Number(a & 0xfffn)] : pg.t0 }
		return t
	}
	/** tainted() of the address with halves ah, al */
	taintedN(ah: number, al: number, n: number): number {
		const o = al & 0xfff
		if (o + n > 4096) return this.tainted(big(ah, al), n)
		const pg = this.page(pageOf(ah, al)), tt = pg.t
		if (!tt) return pg.t0
		let t = 0
		for (let i = o; i < o + n; i++) t |= tt[i]
		return t
	}
	setTaint(addr: bigint, n: number, t: number) {
		addr &= M
		const o = Number(addr & 0xfffn)
		if (o + n <= 4096) { this.setTaintN(hiOf(addr), loOf(addr), n, t); return }
		for (let i = 0; i < n; i++) { const a = (addr + BigInt(i)) & M, pg = this.page(Number(a >> 12n)); if (pg.t || t !== pg.t0) tArr(pg)[Number(a & 0xfffn)] = t }
	}
	/** setTaint() of the address with halves ah, al */
	setTaintN(ah: number, al: number, n: number, t: number) {
		const o = al & 0xfff
		if (o + n > 4096) { this.setTaint(big(ah, al), n, t); return }
		const pg = this.page(pageOf(ah, al))
		if (pg.t || t !== pg.t0) tArr(pg).fill(t, o, o + n)
	}
	taintBytes(addr: bigint, n: number): number[] {
		addr &= M
		const o = Number(addr & 0xfffn)
		if (o + n <= 4096) { const pg = this.page(Number(addr >> 12n)); return pg.t ? Array.from(pg.t.subarray(o, o + n)) : new Array<number>(n).fill(pg.t0) }
		return Array.from(this.taintArr(addr, n))
	}
}

// (control flow only, caught by Exec.run: not Errors, whose stack traces are costly to capture)
export class Stop {}
class Limit {}

/** A conditional branch of a run: the pc of its function's entry and its own pc, as one number. */
export type BranchKey = number
const branchKey = (fpc: number, pc: number): BranchKey => fpc * 0x400_0000 + pc

export interface ExecResult { ret?: bigint; abort?: string; steps: number; limit?: boolean; stopped?: boolean }

// memory instructions by opcode: kind bits | access size (low 4 bits); v2 moves them to other opcodes (as emu.ts)
const LD = 16, STI = 32, STX = 64
const MEM_V0 = new Uint8Array(256), MEM_V2 = new Uint8Array(256)
for (const [o, k] of [[0x71, LD | 1], [0x69, LD | 2], [0x61, LD | 4], [0x79, LD | 8], [0x72, STI | 1], [0x6a, STI | 2], [0x62, STI | 4], [0x7a, STI | 8], [0x73, STX | 1], [0x6b, STX | 2], [0x63, STX | 4], [0x7b, STX | 8]]) MEM_V0[o] = k
for (const [o, k] of [[0x2c, LD | 1], [0x3c, LD | 2], [0x8c, LD | 4], [0x9c, LD | 8], [0x27, STI | 1], [0x37, STI | 2], [0x87, STI | 4], [0x97, STI | 8], [0x2f, STX | 1], [0x3f, STX | 2], [0x8f, STX | 4], [0x9f, STX | 8]]) MEM_V2[o] = k
const JCC_CODE = new Uint8Array(16)
for (const c of [1, 2, 3, 4, 5, 6, 7, 0xa, 0xb, 0xc, 0xd]) JCC_CODE[c] = 1
/** the value the interpreter leaves in call-clobbered registers (emu.ts UNDEF), as an int32 half */
const UNDEF_HALF = 0xdeadbeef | 0

/**
 * Call targets by pc (as emulate names them): a function entry (number; for sBPF v3 not range-checked),
 * a syscall name (string: `hash:<n>` when unknown), or null (an invalid v3 call).
 */
const callsMemo = new WeakMap<Program, (number | string | null | undefined)[]>()
function callTarget(p: Program, pc: number): number | string | null {
	let c = callsMemo.get(p)
	if (!c) callsMemo.set(p, (c = []))
	let t = c[pc]
	if (t !== undefined) return t
	const ins = p.insns[pc]
	let name: string | null
	if (p.version >= 3) name = ins.src === 0 ? `sys:${SYSCALL_BY_HASH.get(ins.imm >>> 0)?.name ?? 'hash:' + (ins.imm >>> 0)}` : ins.src === 1 ? `fn:${pc + 1 + ins.imm}` : null
	else name = callTargetName(p, pc, ins.imm)
	t = name === null ? null : name.startsWith('fn:') ? Number(name.slice(3)) : name.startsWith('sys:') ? name.slice(4) : name
	c[pc] = t
	return t
}

// 64-bit arithmetic on int32 halves: results in rh, rl
let rh = 0, rl = 0
function add64(ah: number, al: number, bh: number, bl: number) { const s = (al >>> 0) + (bl >>> 0); rl = s | 0; rh = (ah + bh + (s > 0xffffffff ? 1 : 0)) | 0 }
function sub64(ah: number, al: number, bh: number, bl: number) { const s = (al >>> 0) - (bl >>> 0); rl = s | 0; rh = (ah - bh - (s < 0 ? 1 : 0)) | 0 }
function mul64(ah: number, al: number, bh: number, bl: number) {
	// high half of the 64-bit product al * bl (unsigned), from 16-bit limbs
	const a0 = al & 0xffff, a1 = al >>> 16, b0 = bl & 0xffff, b1 = bl >>> 16
	const m1 = a1 * b0, m2 = a0 * b1
	const mid = ((a0 * b0) >>> 16) + (m1 & 0xffff) + (m2 & 0xffff)
	const hi = a1 * b1 + Math.floor(m1 / 0x10000) + Math.floor(m2 / 0x10000) + Math.floor(mid / 0x10000)
	rl = Math.imul(al, bl)
	rh = (hi + Math.imul(al, bh) + Math.imul(ah, bl)) | 0
}
function lsh64(h: number, l: number, n: number) {
	if (n === 0) { rh = h; rl = l } else if (n < 32) { rh = (h << n) | (l >>> (32 - n)); rl = l << n } else { rh = l << (n - 32); rl = 0 }
}
function rsh64(h: number, l: number, n: number) {
	if (n === 0) { rh = h; rl = l } else if (n < 32) { rl = (l >>> n) | (h << (32 - n)); rh = h >>> n | 0 } else { rl = h >>> (n - 32) | 0; rh = 0 }
}
function arsh64(h: number, l: number, n: number) {
	if (n === 0) { rh = h; rl = l } else if (n < 32) { rl = (l >>> n) | (h << (32 - n)); rh = h >> n } else { rl = h >> (n - 32); rh = h >> 31 }
}
const bswap32 = (x: number) => ((x & 0xff) << 24) | ((x & 0xff00) << 8) | ((x >>> 8) & 0xff00) | (x >>> 24)
const ltU = (ah: number, al: number, bh: number, bl: number) => ah !== bh ? (ah >>> 0) < (bh >>> 0) : (al >>> 0) < (bl >>> 0)
const ltS = (ah: number, al: number, bh: number, bl: number) => ah !== bh ? ah < bh : (al >>> 0) < (bl >>> 0)

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
	/**
	 * called before each call (pc of the call instruction in its caller, depth of the caller); its
	 * arguments (r1..r5) are callArg(0..4) and may be changed (setCallArg)
	 */
	onCall?: (pc: number, depth: number) => void
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
	noFlip = new Set<BranchKey>()
	blamed = false
	/** the branches flipped in the last run, in order */
	flipped = new Set<BranchKey>()
	private flipLog: BranchKey[] = []
	/**
	 * Control taint (bit 2, TaintHooks) from the branches whose other side is not explored: those in
	 * noFlip, or every one ('all'), or those in noFlip in the run's function and every one in called
	 * functions ('callees').
	 */
	sticky: 'noflip' | 'all' | 'callees' = 'noflip'
	/**
	 * With `loopCap`: an input-dependent branch not forced towards the target and executed more than
	 * loopCap times in a run takes the other side from then on (a loop over a pseudo-random count exits);
	 * such branches are sticky (what follows them is control-tainted).
	 */
	loopCap = 0
	private branchCount = new Map<BranchKey, number>()
	private capped = new Set<BranchKey>()
	/** 1: the models of the PDA syscalls derive other bump seeds (so runs 0 and 1 disagree on them) */
	variant = 0
	private pdaCalls = 0
	private force?: { reach: PcSet; target: number }
	// a frame's result: r0 (halves) and its taint
	private retH = 0
	private retL = 0
	private retT = 0
	// the registers of the caller during onCall
	private cH?: Int32Array
	private cL?: Int32Array
	constructor(p: Program, mem: ExecMem, opts: { maxSteps?: number; maxDepth?: number; taint?: boolean } = {}) {
		this.p = p; this.mem = mem; this.maxSteps = opts.maxSteps ?? 200_000; this.maxDepth = opts.maxDepth ?? 24; this.taint = !!opts.taint
	}
	/** argument i (r(i+1)) of the call being made (in onCall) */
	callArg(i: number): bigint { return big(this.cH![i + 1], this.cL![i + 1]) }
	setCallArg(i: number, v: bigint) { this.cH![i + 1] = hiOf(v); this.cL![i + 1] = loOf(v) }

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
		this.branchCount.clear(); this.capped.clear()
		try {
			const H = new Int32Array(16), L = new Int32Array(16)
			const set = (i: number, v: bigint) => { H[i] = hiOf(v); L[i] = loOf(v) }
			for (let i = 0; i < 5; i++) set(i + 1, args[i] ?? 0n)
			set(0, extraIn[0] ?? 0n); set(6, extraIn[1] ?? 0n); set(7, extraIn[2] ?? 0n); set(8, extraIn[3] ?? 0n); set(9, extraIn[4] ?? 0n)
			set(10, fp)
			let rt: Uint8Array | undefined
			if (this.taint) { rt = new Uint8Array(16); rt.fill(1, 0, 10) }
			this.frame(pc, 0, Number(fp), H, L, rt, 0)
			return { ret: big(this.retH, this.retL), steps: this.steps - start }
		} catch (e) {
			if (e instanceof Stop) return { stopped: true, steps: this.steps - start }
			if (e instanceof Abort) return { abort: e.message, steps: this.steps - start }
			if (e instanceof Limit) return { limit: true, steps: this.steps - start }
			throw e
		}
	}

	/** Branch decisions (forced when only one side can reach `reach`; flips, see `flip`) and the sticky predicate. */
	private forcer(fpc: number, depth: number, reach: PcSet | undefined): { branch: (pc: number, taken: boolean, tainted: boolean) => boolean; sticky: (pc: number) => boolean } {
		const insns = this.p.insns
		const forced = (pc: number) => !!reach && reach.has(pc + 1 + insns[pc].off) !== reach.has(pc + 1)
		return {
			sticky: pc => !forced(pc) && (this.sticky === 'all' || (this.sticky === 'callees' && depth > 0) || this.noFlip.has(branchKey(fpc, pc)) || this.capped.has(branchKey(fpc, pc))),
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
				const k = branchKey(fpc, pc)
				if (this.loopCap && tainted) {
					const n = (this.branchCount.get(k) ?? 0) + 1
					this.branchCount.set(k, n)
					if (n > this.loopCap) { this.capped.add(k); return !taken }
				}
				if (this.flip && tainted && !this.flipped.has(k) && !this.noFlip.has(k)) { this.flipped.add(k); this.flipLog.push(k); return !taken }
				return taken
			},
		}
	}

	/**
	 * Run the function at `pc` (at call depth `depth`, frame pointer `fp`) on the registers H, L (int32
	 * halves; r10 = fp) with their taints `rt` (taint runs; `base`: the caller's control taint at the
	 * call). Its r0 is left in retH, retL (and its taint in retT); aborts and the step limit throw.
	 * Step accounting as in the reference: the steps of a frame are counted when it ends (returns,
	 * aborts, or runs out of steps), not when a Stop or Limit from a call ends it.
	 */
	private frame(pc: number, depth: number, fp: number, H: Int32Array, L: Int32Array, rt: Uint8Array | undefined, base: number): void {
		const budget = this.maxSteps - this.steps
		if (budget <= 0 || depth > this.maxDepth) throw new Limit()
		const p = this.p, m = this.mem, insns = p.insns
		const reach = depth === 0 && this.force ? this.force.reach : this.noPanic ? returning(p, pc) : undefined
		const f = this.forcer(pc, depth, reach)
		const v = p.version
		const v2 = v === 2
		const pqr = v2, sx = v2, swapSub = v2, noNeg = v2, noLddw = v2, noLe = v2, movMem = v2, jmp32 = v >= 3
		const MEM = movMem ? MEM_V2 : MEM_V0
		let ctl = rt ? base : 0 // bit 2 (see TaintHooks)
		let steps = 0, abort: string | undefined, limit = false
		try {
			while (true) {
				if (++steps > budget) { limit = true; break }
				if (pc < 0 || pc >= insns.length) throw new Abort('pc out of text')
				const ins = insns[pc], o = ins.opc
				const dst = ins.dst, src = ins.src, imm = ins.imm
				const cls = o & 7, op0 = o & 0xf0, isReg = (o & 8) !== 0
				const dh = H[dst], dl = L[dst], sh = H[src], sl = L[src]
				const ih = imm >> 31 // (the immediate sign-extended to 64 bits: ih, imm)
				let next = pc + 1
				const mt = MEM[o]
				// input taint of the value written to dst (taint runs only)
				let tv = -1
				if (rt) {
					if (mt & LD) { add64(sh, sl, ins.off >> 31, ins.off); tv = m.taintedN(rh, rl, mt & 15) | rt[src] | ctl }
					else if (mt & STI) { add64(dh, dl, ins.off >> 31, ins.off); m.setTaintN(rh, rl, mt & 15, ctl) }
					else if (mt & STX) { add64(dh, dl, ins.off >> 31, ins.off); m.setTaintN(rh, rl, mt & 15, rt[src] | ctl) }
					else if (o === 0x18 && !noLddw) tv = ctl
					else if (pqr && cls === 6) tv = rt[dst] | (isReg ? rt[src] : 0) | ctl
					else if (cls === 4 || cls === 7) tv = (op0 === 0xb0 ? (isReg ? rt[src] : 0) : op0 === 0x80 || op0 === 0xd0 ? rt[dst] : rt[dst] | (isReg ? rt[src] : 0)) | ctl
					else if ((cls === 5 || (jmp32 && cls === 6)) && o !== 0x05 && o !== 0x85 && o !== 0x8d && o !== 0x95 && o !== 0x9d
						&& (rt[dst] | (isReg ? rt[src] : 0)) & 1 && f.sticky(pc)) ctl = 2
				}
				if (mt) {
					const size = mt & 15
					if (mt & LD) { add64(sh, sl, ins.off >> 31, ins.off); m.ldN(rh, rl, size); H[dst] = m.vh; L[dst] = m.vl }
					else { add64(dh, dl, ins.off >> 31, ins.off); if (mt & STI) m.stN(rh, rl, size, ih, imm); else m.stN(rh, rl, size, sh, sl) }
				} else {
					// ALU: the result in rh, rl unless the instruction is not one (bad = true)
					let bad = false
					switch (o) {
						case 0x18:
							if (noLddw) { bad = true; break }
							rh = insns[pc + 1].imm; rl = imm
							next = pc + 2
							break
						case 0x04: rl = (dl + imm) | 0; rh = sx ? 0 : rl >> 31; break
						case 0x0c: rl = (dl + sl) | 0; rh = sx ? 0 : rl >> 31; break
						case 0x14: rl = (swapSub ? imm - dl : dl - imm) | 0; rh = sx ? 0 : rl >> 31; break
						case 0x1c: rl = (dl - sl) | 0; rh = sx ? 0 : rl >> 31; break
						case 0x24: if (pqr) bad = true; else { rl = Math.imul(dl, imm); rh = rl >> 31 } break
						case 0x2c: if (pqr) bad = true; else { rl = Math.imul(dl, sl); rh = rl >> 31 } break
						case 0x34: if (pqr) bad = true; else { if (imm === 0) throw new Abort('division by zero'); rl = ((dl >>> 0) / (imm >>> 0)) | 0; rh = 0 } break
						case 0x3c: if (pqr) bad = true; else { if (sl === 0) throw new Abort('division by zero'); rl = ((dl >>> 0) / (sl >>> 0)) | 0; rh = 0 } break
						case 0x44: rl = dl | imm; rh = 0; break
						case 0x4c: rl = dl | sl; rh = 0; break
						case 0x54: rl = dl & imm; rh = 0; break
						case 0x5c: rl = dl & sl; rh = 0; break
						case 0x64: rl = dl << (imm & 31); rh = 0; break
						case 0x6c: rl = dl << (sl & 31); rh = 0; break
						case 0x74: rl = dl >>> (imm & 31) | 0; rh = 0; break
						case 0x7c: rl = dl >>> (sl & 31) | 0; rh = 0; break
						case 0x84: if (noNeg) bad = true; else { rl = -dl | 0; rh = 0 } break
						case 0x94: if (pqr) bad = true; else { if (imm === 0) throw new Abort('division by zero'); rl = ((dl >>> 0) % (imm >>> 0)) | 0; rh = 0 } break
						case 0x9c: if (pqr) bad = true; else { if (sl === 0) throw new Abort('division by zero'); rl = ((dl >>> 0) % (sl >>> 0)) | 0; rh = 0 } break
						case 0xa4: rl = dl ^ imm; rh = 0; break
						case 0xac: rl = dl ^ sl; rh = 0; break
						case 0xb4: rl = imm; rh = 0; break
						case 0xbc: rl = sl; rh = sx ? sl >> 31 : 0; break
						case 0xc4: rl = dl >> (imm & 31); rh = 0; break
						case 0xcc: rl = dl >> (sl & 31); rh = 0; break
						case 0xd4:
							if (noLe) { bad = true; break }
							if (imm === 16) { rh = 0; rl = dl & 0xffff }
							else if (imm === 32) { rh = 0; rl = dl }
							else if (imm === 64) { rh = dh; rl = dl }
							else throw new Abort('invalid le')
							break
						case 0xdc:
							if (imm === 16) { rh = 0; rl = ((dl & 0xff) << 8) | ((dl >>> 8) & 0xff) }
							else if (imm === 32) { rh = 0; rl = bswap32(dl) }
							else if (imm === 64) { rh = bswap32(dl); rl = bswap32(dh) }
							else throw new Abort('invalid be')
							break
						case 0x07: add64(dh, dl, ih, imm); break
						case 0x0f: add64(dh, dl, sh, sl); break
						case 0x17: if (swapSub) sub64(ih, imm, dh, dl); else sub64(dh, dl, ih, imm); break
						case 0x1f: sub64(dh, dl, sh, sl); break
						case 0x27: if (pqr) bad = true; else mul64(dh, dl, ih, imm); break
						case 0x2f: if (pqr) bad = true; else mul64(dh, dl, sh, sl); break
						case 0x37: case 0x3f: case 0x97: case 0x9f: {
							if (pqr) { bad = true; break }
							const b = o & 8 ? big(sh, sl) : big(ih, imm)
							if (b === 0n) throw new Abort('division by zero')
							const x = big(dh, dl), q = o === 0x37 || o === 0x3f ? x / b : x % b
							rh = hiOf(q); rl = loOf(q)
							break
						}
						case 0x47: rh = dh | ih; rl = dl | imm; break
						case 0x4f: rh = dh | sh; rl = dl | sl; break
						case 0x57: rh = dh & ih; rl = dl & imm; break
						case 0x5f: rh = dh & sh; rl = dl & sl; break
						case 0x67: lsh64(dh, dl, imm & 63); break
						case 0x6f: lsh64(dh, dl, sl & 63); break
						case 0x77: rsh64(dh, dl, imm & 63); break
						case 0x7f: rsh64(dh, dl, sl & 63); break
						case 0x87: if (noNeg) bad = true; else sub64(0, 0, dh, dl); break
						case 0xa7: rh = dh ^ ih; rl = dl ^ imm; break
						case 0xaf: rh = dh ^ sh; rl = dl ^ sl; break
						case 0xb7: rh = ih; rl = imm; break
						case 0xbf: rh = sh; rl = sl; break
						case 0xc7: arsh64(dh, dl, imm & 63); break
						case 0xcf: arsh64(dh, dl, sl & 63); break
						case 0xf7: if (!noLddw) bad = true; else { rh = dh | imm; rl = dl } break
						default: bad = true
					}
					if (bad && pqr && cls === 6) { bad = false; this.pqr(o, dh, dl, sh, sl, imm) }
					if (!bad) { H[dst] = rh; L[dst] = rl }
					else if (o === 0x05) next = pc + 1 + ins.off
					else if ((cls === 5 && JCC_CODE[o >> 4] && o !== 0x85 && o !== 0x8d && o !== 0x95 && o !== 0x9d) || (jmp32 && cls === 6 && JCC_CODE[o >> 4])) {
						const bh = isReg ? sh : ih, bl = isReg ? sl : imm
						let t: boolean
						if (cls === 5) {
							switch (o >> 4) {
								case 1: t = dh === bh && dl === bl; break
								case 2: t = ltU(bh, bl, dh, dl); break
								case 3: t = !ltU(dh, dl, bh, bl); break
								case 4: t = ((dh & bh) | (dl & bl)) !== 0; break
								case 5: t = dh !== bh || dl !== bl; break
								case 6: t = ltS(bh, bl, dh, dl); break
								case 7: t = !ltS(dh, dl, bh, bl); break
								case 0xa: t = ltU(dh, dl, bh, bl); break
								case 0xb: t = !ltU(bh, bl, dh, dl); break
								case 0xc: t = ltS(dh, dl, bh, bl); break
								default: t = !ltS(bh, bl, dh, dl); break
							}
						} else {
							const x = dl >>> 0, y = bl >>> 0
							switch (o >> 4) {
								case 1: t = x === y; break
								case 2: t = x > y; break
								case 3: t = x >= y; break
								case 4: t = (x & y) !== 0; break
								case 5: t = x !== y; break
								case 6: t = dl > bl; break
								case 7: t = dl >= bl; break
								case 0xa: t = x < y; break
								case 0xb: t = x <= y; break
								case 0xc: t = dl < bl; break
								default: t = dl <= bl; break
							}
						}
						t = f.branch(pc, t, rt ? (rt[dst] | (isReg ? rt[src] : 0)) !== 0 : false)
						if (t) next = pc + 1 + ins.off
					} else if (o === 0x85 || o === 0x8d) {
						let t: number | string | null
						if (o === 0x85) {
							t = callTarget(p, pc)
							if (t === null) throw new Abort('invalid call')
						} else {
							const reg = v === 2 ? src : v >= 3 ? dst : imm
							if (!(reg >= 0 && reg <= 10)) throw new TypeError('callx: no such register')
							t = `ptr:${big(H[reg], L[reg]).toString(16)}`
						}
						this.call(t, pc, fp, depth, H, L, rt, ctl)
						H[0] = this.retH; L[0] = this.retL
						if (rt) { rt[0] = this.retT | ctl; for (let i = 1; i <= 5; i++) rt[i] = 1 }
						for (let i = 1; i <= 5; i++) { H[i] = UNDEF_HALF; L[i] = UNDEF_HALF } // clobbered
					} else if (o === 0x95) {
						this.retH = H[0]; this.retL = L[0]; this.retT = rt ? rt[0] | ctl : 1
						break
					} else throw new Abort(`invalid instruction 0x${o.toString(16)}`)
				}
				if (tv >= 0) rt![dst] = tv
				pc = next
			}
		} catch (e) {
			if (!(e instanceof Abort)) throw e
			abort = e.message
		}
		this.steps += steps
		if (limit) throw new Limit()
		if (abort !== undefined) throw new Abort(abort)
	}

	/** the v2 product / quotient / remainder instructions (class 6): the result in rh, rl (as emu.ts) */
	private pqr(o: number, dh: number, dl: number, sh: number, sl: number, imm32: number) {
		const u64 = (x: bigint) => x & M, i64 = (x: bigint) => BigInt.asIntN(64, x), u32 = (x: bigint) => x & 0xffffffffn, i32 = (x: bigint) => BigInt.asIntN(32, x)
		const D = big(dh, dl), S = big(sh, sl), imm = BigInt(imm32), immU = u64(imm)
		const isImm = (o & 8) === 0, is64 = (o & 0x10) !== 0, op = o & 0xe0
		let r: bigint
		switch (op) {
			case 0x80: { const b = isImm ? immU : S; r = is64 ? u64(D * b) : u32(u32(D) * u32(b)); break }
			case 0x20: if (!is64) throw new Abort(`invalid instruction 0x${o.toString(16)}`); r = (D * (isImm ? u32(immU) : S)) >> 64n; break
			case 0xa0: if (!is64) throw new Abort(`invalid instruction 0x${o.toString(16)}`); r = u64((i64(D) * (isImm ? imm : i64(S))) >> 64n); break
			case 0x40: case 0x60: {
				const b = isImm ? u32(immU) : S
				if (is64) { if (b === 0n) throw new Abort('division by zero'); r = op === 0x40 ? D / b : D % b }
				else { if (u32(b) === 0n) throw new Abort('division by zero'); r = op === 0x40 ? u32(D) / u32(b) : u32(D) % u32(b) }
				break
			}
			case 0xc0: case 0xe0: {
				if (is64) {
					const b = isImm ? imm : i64(S)
					if (b === 0n) throw new Abort('division by zero')
					if (i64(D) === -(1n << 63n) && b === -1n) throw new Abort('division overflow')
					r = u64(op === 0xc0 ? i64(D) / b : i64(D) % b)
				} else {
					const b = isImm ? i32(imm) : i32(S)
					if (b === 0n) throw new Abort('division by zero')
					if (i32(D) === -(1n << 31n) && b === -1n) throw new Abort('division overflow')
					r = u32(op === 0xc0 ? i32(D) / b : i32(D) % b)
				}
				break
			}
			default: throw new Abort(`invalid instruction 0x${o.toString(16)}`)
		}
		rh = hiOf(r); rl = loOf(r)
	}

	/**
	 * A call from the frame with registers H, L (taints rt, control taint ctl) at pc: t is the target
	 * (callTarget; callx: `ptr:<address>`). The result in retH, retL, retT.
	 */
	private call(t: number | string, cpc: number, fp: number, depth: number, H: Int32Array, L: Int32Array, rt: Uint8Array | undefined, ctl: number) {
		if (this.onCall) { this.cH = H; this.cL = L; this.onCall(cpc, depth); this.cH = this.cL = undefined }
		let target: number | undefined
		if (typeof t === 'number') target = t
		else if (t.startsWith('ptr:')) {
			const addr = BigInt('0x' + t.slice(4)), off = addr - this.p.textVaddr
			if (off < 0n || off % 8n !== 0n || off / 8n >= BigInt(this.p.insns.length)) throw new Abort('bad indirect call')
			target = Number(off / 8n)
		}
		if (target !== undefined) {
			// callee registers: the arguments with their taint; the others (callee-saved, clobbered) as inputs
			const cH = new Int32Array(16), cL = new Int32Array(16)
			for (let i = 1; i <= 5; i++) { cH[i] = H[i]; cL[i] = L[i] }
			const cfp = fp + 0x2000
			cH[10] = Math.floor(cfp / 0x1_0000_0000) | 0; cL[10] = cfp | 0
			let crt: Uint8Array | undefined
			if (rt) { crt = new Uint8Array(16); crt.fill(1, 0, 10); for (let i = 1; i <= 5; i++) crt[i] = rt[i] }
			this.frame(target, depth + 1, cfp, cH, cL, crt, rt ? ctl : 0)
			return
		}
		const name = t as string
		const a = [big(H[1], L[1]), big(H[2], L[2]), big(H[3], L[3]), big(H[4], L[4]), big(H[5], L[5])]
		const h = this.onSyscall?.(name, a, this)
		const r = (h !== undefined ? h : this.syscall(name, a, rt ? [rt[1], rt[2], rt[3], rt[4], rt[5]] : [1, 1, 1, 1, 1])) & M
		this.retH = hiOf(r); this.retL = loOf(r); this.retT = ctl
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
				const bytes = m.read(a[1], n)
				if (m.onCopy) m.onCopy(a[1] & M, bytes)
				else if (m.onLoad) { const dv = new DataView(bytes.buffer, bytes.byteOffset, n); for (let i = 0; i + 8 <= n; i += 8) { const x = (a[1] + BigInt(i)) & M; m.onLoad(hiOf(x), loOf(x), 8, dv.getInt32(i + 4, true), dv.getInt32(i, true)) } }
				const t = m.taintArr(a[1], n), x = at[1] | at[2]
				if (x) for (let i = 0; i < n; i++) t[i] |= x
				m.write(a[0], bytes, t)
				return 0n
			}
			case 'sol_memset_': { if (n > 1 << 20) throw new Abort('memset size'); m.write(a[0], new Uint8Array(n).fill(Number(a[1] & 0xffn)), at[1] | at[2]); return 0n }
			case 'sol_memcmp_': {
				if (n > 1 << 20) throw new Abort('memcmp size') // (as memcpy: beyond any compute budget)
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
interface Cfg { predStart: Int32Array; preds: Int32Array; exits: number[]; lo: number; end: number } // predecessors of pc: preds[predStart[pc - lo] .. predStart[pc - lo + 1])
const cfgCache = new WeakMap<Program, Map<number, Cfg>>()
function cfgOf(p: Program, fpc: number): Cfg {
	let c = cfgCache.get(p)
	if (!c) cfgCache.set(p, (c = new Map()))
	let r = c.get(fpc)
	if (r) return r
	const end = extentOf(p, fpc)
	const v3 = p.version >= 3, noLddw = p.version === 2
	const from: number[] = [], to: number[] = [], exits: number[] = []
	const edge = (a: number, b: number) => {
		if (b < fpc || b >= end) return
		from.push(a); to.push(b)
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
		if ((cls === 5 || (v3 && cls === 6)) && JCC_CODES.has(code) && ins.opc !== 0x8d) { edge(pc, pc + 1); edge(pc, pc + 1 + ins.off); continue }
		edge(pc, pc + 1)
	}
	// (compressed predecessor lists)
	const n = Math.max(end - fpc, 0), predStart = new Int32Array(n + 1), preds = new Int32Array(to.length)
	for (const b of to) predStart[b - fpc + 1]++
	for (let i = 0; i < n; i++) predStart[i + 1] += predStart[i]
	const fill = predStart.slice(0, n)
	for (let k = 0; k < to.length; k++) preds[fill[to[k] - fpc]++] = from[k]
	r = { predStart, preds, exits, lo: fpc, end }
	c.set(fpc, r)
	return r
}
const JCC_CODES = new Set([1, 2, 3, 4, 5, 6, 7, 0xa, 0xb, 0xc, 0xd])

/** A set of instructions of one function (lo: its entry): pc -> member. */
export class PcSet {
	private lo: number
	private m: Uint8Array
	constructor(lo: number, m: Uint8Array) { this.lo = lo; this.m = m }
	has(pc: number): boolean { const i = pc - this.lo; return i >= 0 && i < this.m.length && this.m[i] === 1 }
}
function backward(g: Cfg, seeds: number[]): PcSet {
	const m = new Uint8Array(g.predStart.length - 1), q: number[] = []
	for (const s of seeds) if (!m[s - g.lo]) { m[s - g.lo] = 1; q.push(s) }
	while (q.length) {
		const x = q.pop()! - g.lo
		for (let k = g.predStart[x]; k < g.predStart[x + 1]; k++) { const y = g.preds[k]; if (!m[y - g.lo]) { m[y - g.lo] = 1; q.push(y) } }
	}
	return new PcSet(g.lo, m)
}

/**
 * Instructions of the function at fpc from which `target` can be reached (within the function; calls
 * fall through). Cached (the several runs towards one call share it); callers must not modify it.
 */
const reachCache = new WeakMap<Program, Map<string, PcSet | undefined>>()
export function reaching(p: Program, fpc: number, target: number): PcSet | undefined {
	let c = reachCache.get(p)
	if (!c) reachCache.set(p, (c = new Map()))
	const k = `${fpc}:${target}`
	if (c.has(k)) return c.get(k)
	const g = cfgOf(p, fpc)
	const r = target < fpc || target >= g.end ? undefined : backward(g, [target])
	c.set(k, r)
	return r
}

/** Instructions of the function at fpc from which it can return (not only abort / panic). */
const retCache = new WeakMap<Program, Map<number, PcSet>>()
export function returning(p: Program, fpc: number): PcSet {
	let c = retCache.get(p)
	if (!c) retCache.set(p, (c = new Map()))
	let r = c.get(fpc)
	if (!r) { const g = cfgOf(p, fpc); r = backward(g, g.exits); c.set(fpc, r) }
	return r
}
