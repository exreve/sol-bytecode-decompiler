// CPIs whose instruction is not visible in the frame at the call (built on the heap, by a builder
// function, through library wrappers such as solana_program::program::invoke_signed): the function is
// run twice in the reference interpreter on synthetic inputs (exec.ts), its branches forced towards
// the call, and the instruction that reaches the CPI syscall is read back and traced to the
// function's inputs (comments only; see describeByExec).
//
// Inputs: each parameter holds a distinct marker address; all other memory (except the heap-allocator
// cursor, zero as the VM starts it) is pseudo-random, different in the two runs. A value in the
// instruction is then:
//   the same in both runs                -> a constant (program ids, tags, flags, string seeds);
//   a marker                             -> that parameter;
//   the result of an 8-byte load from A  -> ld64(<A traced the same way>): A = marker + k or loaded pointer + k;
//   32 bytes read from memory at A       -> *<A>.
// Anything else (computed from inputs, or differently in the two runs) is shown as `?`.
import type { Program } from './program.ts'
import type { VarFunc } from './dataflow.ts'
import { type Expr, exprEq } from './ir.ts'
import { Exec, ExecMem, Stop } from './exec.ts'
import { KNOWN_KEYS, b58 } from './semantics.ts'
import { type IxModel, type KeyText, type Acc, type CpiEnv } from './cpi.ts'

const M = (1n << 64n) - 1n
const HEAP_CURSOR = 0x3_0000_0000n
const TOP_FP = 0x2_0000_3000n, CALLER_FP = 0x2_0000_1000n
const MAX_STEPS = 20_000

/** How the call at the site reaches the CPI syscall. */
export type ExecSiteKind = 'sys' | 'thunk' | 'wrapper' // wrapper: (out, &Instruction, infos, infos_len, …)

/** bytes with their input taint (bits: 1 data, 2 control; see emu.ts TaintHooks) */
interface TB { b: Uint8Array; t: number[] }
interface Captured {
	abi: 'c' | 'rust'
	program: TB
	programPtr?: bigint                  // C ABI: the pointer to the program id
	metas: { key: TB; ptr?: bigint; w: number; s: number; flagsTainted: number }[]
	data: TB
	signers?: { ptr: bigint; len: bigint }[][] // undefined: not a readable list (e.g. taken from the inputs)
	seedsPtr: bigint
	seedsLen: bigint
}

interface Run { cap: Captured; sym: Sym }

/** Traces values of one run back to the function's inputs. */
class Sym {
	markers = new Map<bigint, number>()          // marker value -> parameter variable id
	loads8 = new Map<bigint, bigint[]>()         // 8-byte loaded value -> addresses (first few)
	small: { addr: bigint; size: number; v: bigint }[] = []
	bases: bigint[] = []
	mem: ExecMem
	constructor(mem: ExecMem) { this.mem = mem }
	note(addr: bigint, size: number, v: bigint) {
		if (addr >= TOP_FP - 0x1000n && addr < TOP_FP + 0x100000n) return // the function's own frame and callees' frames: copies, not sources
		if (size === 8) { const l = this.loads8.get(v); if (!l) this.loads8.set(v, [addr]); else if (l.length < 4) l.push(addr) }
		else if (this.small.length < 20000) this.small.push({ addr, size, v })
	}
	finish() { this.bases = [...this.markers.keys(), ...this.loads8.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) }
	/** an address as an expression of the inputs */
	addr(a: bigint, depth = 0): Expr | undefined {
		if (depth > 6) return undefined
		// largest base <= a
		let lo = 0, hi = this.bases.length - 1, best = -1
		while (lo <= hi) { const mid = (lo + hi) >> 1; if (this.bases[mid] <= a) { best = mid; lo = mid + 1 } else hi = mid - 1 }
		for (let i = best; i >= 0 && i > best - 4; i--) {
			const b = this.bases[i], off = a - b
			if (off >= 0x10000n) break
			const be = this.value(b, depth + 1)
			if (be) return off === 0n ? be : { k: 'bin', op: 'add', a: be, b: { k: 'const', v: off } }
		}
		return undefined
	}
	/** an 8-byte value as an expression of the inputs */
	value(v: bigint, depth = 0): Expr | undefined {
		const m = this.markers.get(v)
		if (m !== undefined) return { k: 'var', id: m }
		if (depth > 6) return undefined
		for (const a of this.loads8.get(v) ?? []) { const e = this.addr(a, depth + 1); if (e) return { k: 'load', size: 8, addr: e } }
		return undefined
	}
	/** candidate expressions for a value of `size` bytes (small sizes: loads of that size returning it) */
	values(v: bigint, size: number): Expr[] {
		if (size === 8) { const e = this.value(v); return e ? [e] : [] }
		const out: Expr[] = []
		for (const l of this.small) if (l.size === size && l.v === v) { const e = this.addr(l.addr); if (e) out.push({ k: 'load', size: size as 1 | 2 | 4, addr: e }); if (out.length > 3) break }
		return out
	}
	/** 32 bytes: the address they were loaded from (first word matched, the rest checked in memory) */
	key(b: Uint8Array): Expr | undefined {
		const w0 = le(b, 0, 8)
		for (const a of this.loads8.get(w0) ?? []) {
			if (!eqBytes(this.mem.read(a, 32), b)) continue
			const e = this.addr(a)
			if (e) return e
		}
		return undefined
	}
}

const le = (b: Uint8Array, o: number, n: number) => { let v = 0n; for (let i = n - 1; i >= 0; i--) v = (v << 8n) | BigInt(b[o + i] ?? 0); return v }
const eqBytes = (x: Uint8Array, y: Uint8Array) => x.length === y.length && x.every((v, i) => v === y[i])

/**
 * One run of the function at f.pc towards the call at sitePc; the instruction at the CPI syscall reached
 * from that call (undefined when none is reached, or it is malformed).
 */
function runOnce(p: Program, f: VarFunc, sitePc: number, kind: ExecSiteKind, seed: number): Run | undefined {
	const mem = new ExecMem(p, seed)
	const sym = new Sym(mem)
	const x = new Exec(p, mem, { maxSteps: MAX_STEPS, taint: true })
	x.noPanic = true
	x.variant = seed === 2 ? 1 : 0
	const base = 0x4_1000_0000n + BigInt(seed) * 0x2000_0000n
	const marker = (k: number) => base + BigInt(k) * 0x100_0000n
	const param = (reg: number) => f.vars.find(v => v.param === reg)?.id
	const regs: bigint[] = []
	for (let r = 1; r <= 5; r++) { regs.push(marker(r)); const id = param(r); if (id !== undefined) sym.markers.set(marker(r), id) }
	if (f.stackArgs) {
		regs[4] = CALLER_FP
		for (let j = 0; j < f.stackArgs; j++) {
			const v = marker(16 + j)
			mem.store(CALLER_FP - 0x1000n + BigInt(8 * j), 8, v)
			const id = param(100 + j)
			if (id !== undefined) sym.markers.set(v, id)
		}
	}
	const extra = [0, 6, 7, 8, 9].map((r, i) => { const v = marker(8 + i); const id = f.extraIn.includes(r) ? param(r) : undefined; if (id !== undefined) sym.markers.set(v, id); return v })
	mem.onLoad = (a, size, v) => sym.note(a, size, v)
	let reached = false, infos: bigint | undefined
	let cap: Captured | undefined
	x.onCall = (t, a, cpc, d) => {
		if (d !== 0 || cpc !== sitePc) return
		reached = true
		// library wrappers check the metas against the account infos (RefCell borrows): pass none
		if (kind === 'wrapper') { infos = a[2]; a[3] = 0n }
	}
	x.onSyscall = (name, a) => {
		if (name !== 'sol_invoke_signed_c' && name !== 'sol_invoke_signed_rust') return undefined
		if (!reached) return 0n
		if (kind === 'wrapper' && (a[2] !== 0n || a[1] !== infos)) throw new Stop() // not the (out, ix, infos, len, …) ABI
		cap = capture(mem, name === 'sol_invoke_signed_c' ? 'c' : 'rust', a)
		throw new Stop()
	}
	const r = x.run(f.pc, regs, TOP_FP, sitePc, extra)
	execStats.runs++; execStats.steps += r.steps
	if (!cap) return undefined
	sym.finish()
	return { cap, sym }
}

function capture(mem: ExecMem, abi: 'c' | 'rust', a: bigint[]): Captured | undefined {
	const u = (addr: bigint, n = 8) => mem.readU(addr, n)
	const tb = (addr: bigint, n: number): TB => ({ b: mem.read(addr, n), t: mem.taintBytes(addr, n) })
	const ix = a[0]
	const metas: Captured['metas'] = []
	let program: TB, programPtr: bigint | undefined, data: TB
	if (abi === 'rust') {
		// StableInstruction { accounts: {ptr, cap, len}, data: {ptr, cap, len}, program_id }
		const n = u(ix + 16n), dl = u(ix + 40n)
		if (n > 64n || dl > 10240n) return undefined
		const mp = u(ix)
		for (let i = 0n; i < n; i++) {
			const b = mp + 34n * i
			metas.push({ key: tb(b, 32), s: Number(u(b + 32n, 1)), w: Number(u(b + 33n, 1)), flagsTainted: mem.tainted(b + 32n, 2) })
		}
		data = tb(u(ix + 24n), Number(dl))
		program = tb(ix + 48n, 32)
	} else {
		// SolInstruction { program_id: *Pubkey, accounts: *SolAccountMeta, len, data, data_len }; SolAccountMeta { pubkey: *, is_writable, is_signer }
		const n = u(ix + 16n), dl = u(ix + 32n)
		if (n > 64n || dl > 10240n) return undefined
		const mp = u(ix + 8n)
		for (let i = 0n; i < n; i++) {
			const b = mp + 16n * i, kp = u(b)
			metas.push({ key: tb(kp, 32), ptr: kp, w: Number(u(b + 8n, 1)), s: Number(u(b + 9n, 1)), flagsTainted: mem.tainted(b + 8n, 2) })
		}
		data = tb(u(ix + 24n), Number(dl))
		programPtr = u(ix)
		program = tb(programPtr, 32)
	}
	if (metas.some(m => m.w > 1 || m.s > 1)) return undefined
	let signers: Captured['signers'] = []
	if (a[4] > 8n) signers = undefined
	else for (let i = 0n; i < a[4] && signers; i++) {
		const sp = u(a[3] + 16n * i), sn = u(a[3] + 16n * i + 8n)
		if (sn > 16n) { signers = undefined; break }
		const seeds: { ptr: bigint; len: bigint }[] = []
		for (let j = 0n; j < sn; j++) seeds.push({ ptr: u(sp + 16n * j), len: u(sp + 16n * j + 8n) })
		if (seeds.some(s => s.len > 64n)) { signers = undefined; break }
		signers.push(seeds)
	}
	return { abi, program, programPtr, metas, data, signers, seedsPtr: a[3], seedsLen: a[4] }
}

const key = (e: Expr) => JSON.stringify(e, (_, v) => (typeof v === 'bigint' ? v.toString() : v))

/** The same expression in both runs (by structure), else undefined. */
function agree(a: Expr[], b: Expr[]): Expr | undefined {
	for (const x of a) for (const y of b) if (key(x) === key(y)) return x
	return undefined
}

export interface ExecEnv {
	/** names of 32-byte constants (known program ids); `key <base58>` otherwise */
	keyName?: (b58: string) => string | undefined
	/** text of a constant byte string used as a seed */
	seedStr?: (b: Uint8Array) => string | undefined
}

/**
 * The instruction a CPI site passes, from two runs of its function (see the file comment); undefined
 * when either run does not reach the CPI syscall from this call, or the runs disagree on its shape.
 */
export const execStats = { ms: 0, runs: 0, steps: 0 }
export function describeByExec(p: Program, f: VarFunc, sitePc: number, kind: ExecSiteKind, env: CpiEnv): IxModel | undefined {
	const t0 = performance.now()
	try { return describeByExec0(p, f, sitePc, kind, env) } finally { execStats.ms += performance.now() - t0 }
}
function describeByExec0(p: Program, f: VarFunc, sitePc: number, kind: ExecSiteKind, env: CpiEnv): IxModel | undefined {
	const A = runOnce(p, f, sitePc, kind, 1)
	if (!A) return undefined
	const B = runOnce(p, f, sitePc, kind, 2)
	if (!B) return undefined
	const a = A.cap, b = B.cap
	if (a.abi !== b.abi || a.metas.length !== b.metas.length || a.data.b.length !== b.data.b.length) return undefined
	// constant: the same untainted bytes in both runs
	const constant = (x: TB, y: TB, o = 0, n = x.b.length) => { for (let i = o; i < o + n; i++) if (x.t[i] || y.t[i] || x.b[i] !== y.b[i]) return false; return true }
	// values selected by input-dependent control flow are not traced either
	const selected = (x: TB, y: TB, o = 0, n = x.b.length) => { for (let i = o; i < o + n; i++) if ((x.t[i] | y.t[i]) & 2) return true; return false }
	const keyText = (x: TB, y: TB, px?: bigint, py?: bigint): KeyText => {
		if (constant(x, y)) { const k = b58(x.b); const n = KNOWN_KEYS[k]; return { text: n ?? `key ${k}`, known: n ?? `key ${k}` } }
		if (selected(x, y)) return { text: '?' }
		// C ABI: the pointer is traced (as the static description prints it), else the bytes' address
		if (px !== undefined && py !== undefined) { const e = agree(opt(A.sym.addr(px)), opt(B.sym.addr(py))); if (e) return { text: env.expr(e), src: e } }
		const e = agree(opt(A.sym.key(x.b)), opt(B.sym.key(y.b)))
		return e ? { text: `*${wrapT(env.expr(e))}`, src: e } : { text: '?' }
	}
	const program = keyText(a.program, b.program, a.programPtr, b.programPtr)
	const accounts: Acc[] = a.metas.map((m, i) => {
		const n = b.metas[i]
		const k = keyText(m.key, n.key, m.ptr, n.ptr)
		const fixed = !m.flagsTainted && !n.flagsTainted
		return { text: k.known ?? k.text, w: fixed && m.w === n.w ? m.w : undefined, s: fixed && m.s === n.s ? m.s : undefined }
	})
	const at = (o: number, size: number): Expr | undefined => {
		if (o + size > a.data.b.length) return undefined
		const va = le(a.data.b, o, size), vb = le(b.data.b, o, size)
		if (constant(a.data, b.data, o, size)) return { k: 'const', v: va }
		if (selected(a.data, b.data, o, size)) return undefined
		return agree(A.sym.values(va, size), B.sym.values(vb, size))
	}
	const dataKey = (o: number): KeyText | undefined => o + 32 <= a.data.b.length ? keyText(sub(a.data, o, 32), sub(b.data, o, 32)) : undefined
	// signer seeds
	let seeds: string | undefined
	const sa = a.signers, sb = b.signers
	if (sa && sb && sa.length === sb.length && !sa.length) seeds = 'no signer seeds'
	else if (sa && sb && sa.length === sb.length && sa.every((s, i) => s.length === sb[i].length)) {
		const list = sa.map((s, i) => '[' + s.map((sd, j) => seedText(A, B, sd, sb[i][j], env)).join(', ') + ']')
		seeds = `signer seeds ${list.join(', ')}`
	} else {
		// the list itself comes from the inputs: &[&[&[u8]]] at ptr, len
		const pe = agree(opt(A.sym.value(a.seedsPtr)), opt(B.sym.value(b.seedsPtr))), le_ = a.seedsLen === b.seedsLen ? { k: 'const' as const, v: a.seedsLen } : agree(opt(A.sym.value(a.seedsLen)), opt(B.sym.value(b.seedsLen)))
		if (pe && le_) seeds = `signer seeds ${wrapT(env.expr(pe))}[..${env.expr(le_)}]`
	}
	return { program, accounts, nAcc: accounts.length, dl: a.data.b.length, data: { at, key: dataKey }, seeds, note: '[exec]' }
}

const opt = (e: Expr | undefined) => (e ? [e] : [])
const sub = (x: TB, o: number, n: number): TB => ({ b: x.b.subarray(o, o + n), t: x.t.slice(o, o + n) })
const wrapT = (t: string) => (/^[\w.]+$/.test(t) ? t : `(${t})`)

function seedText(A: Run, B: Run, x: { ptr: bigint; len: bigint }, y: { ptr: bigint; len: bigint }, env: CpiEnv): string {
	if (x.len !== y.len) return '?'
	const n = Number(x.len)
	const bx = A.sym.mem.read(x.ptr, n), by = B.sym.mem.read(y.ptr, n)
	if (A.sym.mem.tainted(x.ptr, n) & 2 || B.sym.mem.tainted(y.ptr, n) & 2) return '?'
	if (eqBytes(bx, by) && !A.sym.mem.tainted(x.ptr, n) && !B.sym.mem.tainted(y.ptr, n)) {
		if (n > 0 && bx.every(c => c >= 0x20 && c < 0x7f)) return JSON.stringify(Buffer.from(bx).toString('latin1'))
		if (n === 32) { const k = b58(bx); return KNOWN_KEYS[k] ?? `key ${k}` }
		return n <= 8 ? `u${n * 8} 0x${le(bx, 0, n).toString(16)}` : `0x${Buffer.from(bx).toString('hex')}`
	}
	if (n === 32) { const e = agree(opt(A.sym.key(bx)), opt(B.sym.key(by))); if (e) return `*${wrapT(env.expr(e))}` }
	if (n === 1 || n === 2 || n === 4 || n === 8) {
		const e = agree(A.sym.values(le(bx, 0, n), n), B.sym.values(le(by, 0, n), n))
		if (e) return `u${n * 8} ${env.expr(e)}`
		// the seed is a value in memory at an input address
		const pa = agree(opt(A.sym.addr(x.ptr)), opt(B.sym.addr(y.ptr)))
		if (pa) return `u${n * 8} ${env.expr({ k: 'load', size: n as 1 | 2 | 4 | 8, addr: pa })}`
	}
	const pa = agree(opt(A.sym.addr(x.ptr)), opt(B.sym.addr(y.ptr)))
	return pa ? `${wrapT(env.expr(pa))}[..${n}]` : `? (${n} bytes)`
}

void exprEq
