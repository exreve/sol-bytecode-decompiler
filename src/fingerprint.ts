// Position-independent function fingerprints, used to recognize library code shared by
// many unrelated programs (Rust core/alloc, solana-program, borsh, anchor-lang, spl, ...).
import { createHash } from 'node:crypto'
import type { Program, Func } from './program.ts'
import { b58 } from './semantics.ts'

/** alt (sBPF v2 / v3): the hash of the code in its v0 encoding (see V2_MEM), when it differs */
export interface FnPrint { hash: string; insns: number; strings: string[]; alt?: string }

/** Instructions of a function in address order (blocks are contiguous in LLVM output). */
function funcPcs(f: Func): number[] {
	const pcs: number[] = []
	for (const b of [...f.blocks].sort((a, b) => a.start - b.start)) for (let pc = b.start; pc <= b.end; pc++) pcs.push(pc)
	return pcs
}

/**
 * sBPF v2 / v3 encodings of v0 instructions, hashed in their v0 form (the fingerprints are v0-derived):
 * v2's memory classes and `mov32 lo + hor64 hi` constants (as lddw), v3's `return` (exit), callx register
 * and unrelocated syscalls. PQR multiply / divide, v2's reversed `sub imm`, jmp32 and codegen differences
 * (instruction selection, register allocation, frame layout) are not mapped. The raw hash is kept: the
 * signatures also hold v2-encoded code (mainnet programs built for the early SBFv2 target).
 */
const V2_MEM: Record<number, number> = { 0x2c: 0x71, 0x3c: 0x69, 0x8c: 0x61, 0x9c: 0x79, 0x27: 0x72, 0x37: 0x6a, 0x87: 0x62, 0x97: 0x7a, 0x2f: 0x73, 0x3f: 0x6b, 0x8f: 0x63, 0x9f: 0x7b }

export function fingerprint(p: Program, f: Func): FnPrint {
	const raw = printOf(p, f, false)
	if (p.version < 2) return raw
	const alt = printOf(p, f, true).hash
	return alt === raw.hash ? raw : { ...raw, alt }
}

function printOf(p: Program, f: Func, norm: boolean): FnPrint {
	const h = createHash('sha1')
	const pcs = funcPcs(f)
	// the hashed byte stream is assembled in one buffer and hashed with a single update (same
	// digest as updating per instruction, without a native call per instruction)
	let out = Buffer.allocUnsafe(pcs.length * 12 + 64), len = 0
	const need = (n: number) => { if (len + n > out.length) { const o = Buffer.allocUnsafe((len + n) * 2); out.copy(o, 0, 0, len); out = o } }
	const textLo = p.textVaddr, textHi = p.textVaddr + BigInt(p.insns.length * 8)
	const strings: string[] = []
	const v = p.version
	const put = (opc: number, regs: number, off: number, imm: string | number, hi: number) => {
		const tail = typeof imm === 'number' ? undefined : Buffer.from(imm, 'utf8')
		need(4 + (tail ? tail.length : 8))
		out.writeUInt8(opc, len); out.writeUInt8(regs, len + 1); out.writeInt16LE(off, len + 2)
		len += 4
		if (typeof imm === 'number') { out.writeInt32LE(imm, len); out.writeInt32LE(hi, len + 4); len += 8 }
		else { tail!.copy(out, len); len += tail!.length }
	}
	/** a 64-bit constant (lddw): text / rodata addresses normalized */
	const constImm = (val: bigint, lo: number, hiImm: number): [string | number, number] => {
		if (val >= textLo && val < textHi) return ['T', 0]
		if (p.image.region(val)) {
			const s = p.image.bytesAt(val, 1) ? previewString(p, val) : undefined
			if (s) strings.push(s)
			return ['A', 0]
		}
		return [lo, hiImm]
	}
	// v3 calls are not relocated: syscalls by the lifted target
	let sysAt: Map<number, string> | undefined
	if (norm && v >= 3) { sysAt = new Map(); for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'call' && s.t.k === 'sys') sysAt.set(s.pc, s.t.name) }
	for (let k = 0; k < pcs.length; k++) {
		const pc = pcs[k], i = p.insns[pc]
		let opc = i.opc, regs = i.dst | (i.src << 4)
		let imm: string | number = i.imm
		let hi = 0
		if (!norm) { /* raw encoding */ }
		else if (v === 2 && V2_MEM[opc] !== undefined) opc = V2_MEM[opc]
		else if (v >= 3 && opc === 0x9d) opc = 0x95
		else if (opc === 0x8d) { imm = v === 2 ? i.src : i.dst; regs = 0 }
		else if (v === 2 && opc === 0xb4 && pcs[k + 1] === pc + 1 && p.insns[pc + 1]?.opc === 0xf7 && p.insns[pc + 1].dst === i.dst) {
			// mov32 dst, lo; hor64 dst, hi: v0's lddw (hashed as two slots, the second holding hi)
			const n = p.insns[pc + 1]
			const [a, b] = constImm((BigInt(n.imm >>> 0) << 32n) | BigInt(i.imm >>> 0), i.imm, n.imm)
			put(0x18, i.dst, 0, a, b)
			put(0, 0, 0, n.imm, 0)
			k++
			continue
		}
		if (opc === 0x85) {
			const rel = p.elf.callRelocs.get(pc)
			if (rel?.kind === 'syscall') imm = 'S:' + rel.name
			else if (sysAt?.has(pc)) imm = 'S:' + sysAt.get(pc)
			else if (v < 3 && i.imm === -1 && !rel) imm = 'U'
			else imm = 'F' // internal call: target varies with layout
		} else if (opc === 0x18 && (norm ? v !== 2 : v < 2)) {
			const n = p.insns[pc + 1]
			const c = constImm(n ? (BigInt(n.imm >>> 0) << 32n) | BigInt(i.imm >>> 0) : 0n, i.imm, n?.imm ?? 0)
			imm = c[0]
			hi = c[1]
		}
		put(opc, regs, opc === 0x85 ? 0 : i.off, imm, hi)
	}
	h.update(out.subarray(0, len))
	return { hash: h.digest('hex').slice(0, 16), insns: pcs.length, strings }
}

/** Printable ASCII run at an address (used as hints for library stubs and naming). */
export function previewString(p: Program, addr: bigint, max = 48): string | undefined {
	const b = p.image.bytesAt(addr, 1)
	if (!b) return undefined
	let s = ''
	for (let k = 0; k < max; k++) {
		const c = p.image.bytesAt(addr + BigInt(k), 1)?.[0]
		if (c === undefined || c < 0x20 || c > 0x7e) break
		s += String.fromCharCode(c)
	}
	return s.length >= 4 ? s : undefined
}

// ---- function signatures for program diffing (src/diff.ts) and security/fingerprints.json ----

/**
 * Per-function signature, computed from the bytecode alone:
 *   hash     address-independent code hash: call targets (internal -> F, syscalls by name), text and
 *            rodata addresses (-> T / A) normalized; jump offsets (relative) and other immediates kept
 *   regfree  the same with registers renamed in order of first use (register allocation-insensitive)
 *   data     hash of the constants at the rodata addresses the code refers to (see constantAt)
 *   fuzzy    coarse shape: instructions, blocks, CFG edges and an opcode-class histogram (OP_CLASSES)
 */
export interface FnSig { pc: number; insns: number; toks: string[]; consts: string[]; hash: string; regfree: string; data: string; fuzzy: string; hist: number[]; blocks: number; edges: number; calls: number[]; sys: string[] }

/** Opcode classes of the fuzzy histogram. */
export const OP_CLASSES = ['ldx', 'st', 'lddw', 'addsub', 'muldiv', 'bitop', 'shift', 'mov', 'alu_other', 'jeq', 'jcc', 'ja', 'call', 'syscall', 'callx', 'exit']
function opClass(opc: number, sys: boolean): number {
	if (opc === 0x18) return 2
	if (opc === 0x85) return sys ? 13 : 12
	if (opc === 0x8d) return 14
	if (opc === 0x95) return 15
	const cls = opc & 7, op = opc >> 4
	if (cls === 0 || cls === 1) return 0
	if (cls === 2 || cls === 3) return 1
	if (cls === 5 || cls === 6) return op === 0 ? 11 : op === 1 || op === 5 ? 9 : 10
	switch (op) {
		case 0: case 1: return 3
		case 2: case 3: case 9: return 4
		case 4: case 5: case 10: return 5
		case 6: case 7: case 12: return 6
		case 11: return 7
		default: return 8
	}
}
/**
 * The constant a rodata reference designates, as far as it is layout-independent: the first 16
 * characters of a text, or 32 raw bytes (a key, a table); nothing for structured data holding
 * pointers (panic locations, vtables: they change with the layout).
 */
function constantAt(p: Program, bytes: Uint8Array, o: number): string {
	const w = bytes.subarray(o, o + 32)
	let txt = 0
	while (txt < w.length && w[txt] >= 0x20 && w[txt] < 0x7f) txt++
	if (txt >= 4) return JSON.stringify(Buffer.from(w.subarray(0, Math.min(txt, 16))).toString('latin1'))
	for (let k = 0; k + 8 <= w.length; k += 8) {
		const v = Buffer.from(w.buffer, w.byteOffset + k, 8).readBigUInt64LE(0)
		if (v >> 32n >= 1n && v >> 32n <= 4n && p.image.region(v)) return ''
	}
	return w.length === 32 ? b58(w) : Buffer.from(w).toString('hex')
}
/** Instructions that read a source register (ldx, stx, register-operand alu/jmp). */
const usesSrc = (opc: number) => { const cls = opc & 7; return cls === 1 || cls === 3 || (cls >= 4 && (opc & 8) !== 0 && opc !== 0x85 && opc !== 0x8d && opc !== 0x95) }

/** What a signature reads of a function's lifted blocks (a snapshot: later phases reshape the blocks). */
export interface SigShape { pc: number; pcs: number[]; targets: Map<number, { k: string; name?: string; pc?: number }>; edges: number; blocks: number }
export function sigShape(f: Func): SigShape {
	const targets = new Map<number, { k: string; name?: string; pc?: number }>()
	let edges = 0
	for (const b of f.blocks) {
		edges += b.succs.length
		for (const s of b.stmts) if (s.k === 'call') targets.set(s.pc, { k: s.t.k, name: (s.t as { name?: string }).name, pc: (s.t as { pc?: number }).pc })
	}
	return { pc: f.pc, pcs: funcPcs(f), targets, edges, blocks: f.blocks.length }
}

export function signature(p: Program, f: Func): FnSig { return shapeSignature(p, sigShape(f)) }

export function shapeSignature(p: Program, f: SigShape): FnSig {
	const { pcs, targets, edges } = f
	const textLo = p.textVaddr, textHi = p.textVaddr + BigInt(p.insns.length * 8)
	const lddw = p.version !== 2
	const toks: string[] = [], rf: string[] = [], consts: string[] = []
	const hist = new Array<number>(OP_CLASSES.length).fill(0)
	const ren = new Map<number, number>([[10, 10]])
	const reg = (r: number) => { let x = ren.get(r); if (x === undefined) ren.set(r, (x = ren.size - 1)); return x }
	const calls: number[] = [], sys = new Set<string>()
	let n = 0
	for (let k = 0; k < pcs.length; k++) {
		const pc = pcs[k], i = p.insns[pc]
		let imm: string | number = i.imm, hi = 0
		const t = i.opc === 0x85 ? targets.get(pc) : undefined
		if (i.opc === 0x85) {
			if (t?.k === 'sys') { imm = 'S:' + t.name; sys.add(t.name!) }
			else if (t?.k === 'fn') { imm = 'F'; calls.push(t.pc!) }
		} else if (i.opc === 0x18 && lddw) {
			const nx = p.insns[pc + 1]
			const v = nx ? (BigInt(nx.imm >>> 0) << 32n) | BigInt(i.imm >>> 0) : 0n
			if (v >= textLo && v < textHi) imm = 'T'
			else {
				const r = p.image.region(v)
				if (r && !r.exec) {
					imm = 'A'
					const c = constantAt(p, r.bytes, Number(v - r.vaddr))
					if (c) consts.push(c)
				} else hi = nx?.imm ?? 0
			}
			if (pcs[k + 1] === pc + 1) k++ // second slot of lddw
		}
		hist[opClass(i.opc, t?.k === 'sys')]++
		n++
		const off = i.opc === 0x85 ? 0 : i.off
		toks.push(`${i.opc},${i.dst},${i.src},${off},${imm},${hi}`)
		const dst = i.opc === 0x85 || i.opc === 0x95 || i.opc === 0x05 ? i.dst : reg(i.dst)
		rf.push(`${i.opc},${dst},${usesSrc(i.opc) ? reg(i.src) : i.src},${off},${imm},${hi}`)
	}
	const h = (a: string[]) => createHash('sha1').update(a.join(';')).digest('hex').slice(0, 16)
	return {
		pc: f.pc, insns: n, hash: h(toks), regfree: h(rf), data: consts.length ? h(consts) : '', toks, consts,
		fuzzy: `${n}i ${f.blocks}b ${edges}e ${hist.join('.')}`, hist, blocks: f.blocks, edges, calls, sys: [...sys].sort(),
	}
}

/** Similarity of two functions' coarse shapes, 0..1 (1: same opcode-class histogram, CFG size and syscalls). */
export function fuzzySim(a: FnSig, b: FnSig): number {
	let d = 0, t = 0
	for (let k = 0; k < a.hist.length; k++) { d += Math.abs(a.hist[k] - b.hist[k]); t += a.hist[k] + b.hist[k] }
	const ratio = (x: number, y: number) => (x === y ? 1 : Math.min(x, y) / Math.max(x, y))
	return (t ? 1 - d / t : 1) * 0.6 + ratio(a.blocks, b.blocks) * 0.15 + ratio(a.edges, b.edges) * 0.15 + (a.sys.join() === b.sys.join() ? 0.1 : 0.05)
}

/** Program-level hash: the multiset of (code hash, constants hash) of the given functions. */
export function codeHash(sigs: Iterable<FnSig>): string {
	return createHash('sha1').update([...sigs].map(s => `${s.hash}:${s.data}`).sort().join('\n')).digest('hex').slice(0, 16)
}

/** security/fingerprints.json: one line per function, in address order. */
export function renderFingerprints(p: Program, sigs: Map<number, FnSig>, lib: Set<number>, instructions: (pc: number) => string[]): string {
	const all = [...sigs.values()].sort((a, b) => a.pc - b.pc)
	const user = all.filter(s => !lib.has(s.pc))
	const head = {
		sbpf: p.version, functions: all.length, library: all.length - user.length,
		codeHash: codeHash(all), userCodeHash: codeHash(user),
		about: 'address-independent function hashes (bytecode only): hash = code with call targets, text/rodata addresses normalized; regfree = same, registers renamed; data = constants the code refers to in rodata (texts, 32-byte keys/tables; absent: none); fuzzy = "<insns>i <blocks>b <edges>e <opcode-class histogram: ' + OP_CLASSES.join('.') + '>"; codeHash = hash of the set of (hash, data). Compare programs with src/diff.ts',
	}
	const rows = all.map(s => JSON.stringify({
		pc: s.pc, addr: '0x' + (p.textVaddr + BigInt(s.pc * 8)).toString(16), name: p.funcs.get(s.pc)?.name, lib: lib.has(s.pc) || undefined,
		instructions: instructions(s.pc).length ? instructions(s.pc) : undefined, hash: s.hash, regfree: s.regfree, data: s.data || undefined, fuzzy: s.fuzzy, size: s.insns,
	}))
	return `{"program": ${JSON.stringify(head)},\n"functions": [\n${rows.join(',\n')}\n]}\n`
}

/** Signatures of every function of the program, by entry pc. */
export function signatures(p: Program): Map<number, FnSig> {
	const out = new Map<number, FnSig>()
	for (const f of p.funcs.values()) out.set(f.pc, signature(p, f))
	return out
}
