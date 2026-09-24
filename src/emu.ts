// Reference sBPF interpreter used to verify decompiler output. Written independently of the
// lifter, following agave solana-sbpf `interpreter.rs` instruction by instruction.
// Calls are not followed: they are reported to a hook (stubs) so a single function can be tested.
import type { Program } from './program.ts'
import { Image, MM_STACK_START } from './elf.ts'
import { SYSCALL_BY_HASH } from './syscalls.ts'

export class Abort extends Error {}
/** Value the test emulator leaves in call-clobbered registers; the evaluator maps `undef` to it. */
export const UNDEF = 0xdeadbeef_deadbeefn
export class StepLimit extends Error {}
/** Access to the current frame through a pointer not derived from the frame pointer (memory-unsafe execution). */
export class FrameAlias extends Error {}

const M = (1n << 64n) - 1n
const u64 = (v: bigint) => v & M
const i64 = (v: bigint) => BigInt.asIntN(64, v)
const u32 = (v: bigint) => v & 0xffffffffn
const i32 = (v: bigint) => BigInt.asIntN(32, v)

export type Event =
	| { k: 'store'; addr: bigint; size: number; v: bigint }
	| { k: 'call'; t: string; args: bigint[] }

/** Deterministic test memory: rodata comes from the image, everything else is seeded noise. */
export class TestMem {
	image: Image
	seed: bigint
	bytes = new Map<bigint, number>()
	events: Event[]
	constructor(image: Image, seed: number, events: Event[]) { this.image = image; this.seed = BigInt(seed); this.events = events }
	noise(a: bigint): number {
		let x = (a ^ (this.seed * 0x9e3779b97f4a7c15n)) & M
		x = ((x ^ (x >> 33n)) * 0xff51afd7ed558ccdn) & M
		x = ((x ^ (x >> 33n)) * 0xc4ceb9fe1a85ec53n) & M
		x ^= x >> 33n
		// bias towards small bytes so lengths/indices/tags are plausible
		const b = Number(x & 0xffn)
		return (x >> 8n) & 1n ? b : (x >> 9n) & 1n ? 0 : b & 7
	}
	byte(a: bigint): number {
		const w = this.bytes.get(a)
		if (w !== undefined) return w
		const r = this.image.region(a)
		if (r) return r.bytes[Number(a - r.vaddr)]
		return this.noise(a)
	}
	load(addr: bigint, size: number): bigint {
		addr = u64(addr)
		let v = 0n
		for (let i = size - 1; i >= 0; i--) v = (v << 8n) | BigInt(this.byte(u64(addr + BigInt(i))))
		return v
	}
	store(addr: bigint, size: number, v: bigint) {
		addr = u64(addr)
		if (this.image.region(addr, size)) throw new Abort('store to read-only memory')
		v &= (1n << BigInt(size * 8)) - 1n
		this.events.push({ k: 'store', addr, size, v })
		for (let i = 0; i < size; i++) this.bytes.set(u64(addr + BigInt(i)), Number((v >> BigInt(8 * i)) & 0xffn))
	}
}

export interface CallHook { (target: string, args: bigint[]): bigint }

export interface EmuResult { ret?: bigint; abort?: string; steps: number; limit?: boolean; alias?: boolean }

/** Execute one function starting at `pc` with registers r1..r5 = args, r10 = fp. */
export function emulate(p: Program, pc: number, args: bigint[], fp: bigint, mem: TestMem, onCall: CallHook, maxSteps: number,
	argRegs: (t: string) => number[], extraIn: bigint[] = [], stackArgs: (t: string) => number = () => 0): EmuResult {
	const v = p.version
	const v2 = v === 2
	const pqr = v2, sx = v2, swapSub = v2, noNeg = v2, noLddw = v2, noLe = v2, movMem = v2, staticSys = v >= 3, jmp32 = v >= 3
	const r = new Array<bigint>(11).fill(0n)
	for (let i = 0; i < 5; i++) r[i + 1] = args[i] ?? 0n
	r[0] = extraIn[0] ?? 0n; r[6] = extraIn[1] ?? 0n; r[7] = extraIn[2] ?? 0n; r[8] = extraIn[3] ?? 0n; r[9] = extraIn[4] ?? 0n
	r[10] = fp
	const insns = p.insns
	// provenance: which registers hold frame-pointer-derived values
	const fr = new Array<boolean>(11).fill(false)
	fr[10] = true
	const flo = fp - 0x1000n, fhi = fp
	const checkFrame = (base: number, addr: bigint) => { if (!fr[base] && addr >= flo && addr < fhi) throw new FrameAlias() }
	const signExt = (x: bigint) => (sx ? u32(x) : u64(BigInt.asIntN(32, x)))
	let steps = 0
	const doCall = (t: string) => {
		let a = argRegs(t).map(i => r[i])
		const ns = stackArgs(t)
		if (ns) a = [r[1], r[2], r[3], r[4], ...Array.from({ length: ns }, (_, k) => mem.load(u64(r[5] - 0x1000n + BigInt(8 * k)), 8)), ...argRegs(t).filter(i => i === 0 || i > 5).map(i => r[i])]
		r[0] = u64(onCall(t, a))
		for (let i = 1; i <= 5; i++) r[i] = UNDEF // clobbered
		for (let i = 0; i <= 5; i++) fr[i] = false
	}
	try {
		while (true) {
			if (++steps > maxSteps) return { steps, limit: true }
			if (pc < 0 || pc >= insns.length) throw new Abort('pc out of text')
			const ins = insns[pc]
			const dst = ins.dst, src = ins.src
			const imm = BigInt(ins.imm), off = BigInt(ins.off)
			const immU = u64(imm)
			let next = pc + 1
			const D = r[dst], S = r[src]
			const ld = (size: number) => { checkFrame(src, u64(S + off)); r[dst] = mem.load(u64(S + off), size) }
			const st = (size: number, val: bigint) => { checkFrame(dst, u64(D + off)); mem.store(u64(D + off), size, val) }
			// provenance update (computed before the instruction executes)
			const cls0 = ins.opc & 7, op0 = ins.opc & 0xf0
			const alu64 = cls0 === 7 && !movMem, isReg = (ins.opc & 8) !== 0
			let nfr: boolean | null = null
			if (alu64 && op0 === 0xb0) nfr = isReg ? fr[src] : false                 // mov
			else if (alu64 && (op0 === 0x00 || op0 === 0x10)) nfr = fr[dst] || (isReg && fr[src]) // add/sub
			else if (ins.opc !== 0x05 && (ins.opc & 7) !== 5 && (ins.opc & 7) !== 2 && (ins.opc & 7) !== 3) nfr = false // other writes to dst
			if (movMem && (ins.opc & 7) === 7 && (op0 === 0x20 || op0 === 0x30 || op0 === 0x80 || op0 === 0x90)) nfr = null // v2 stores
			let handled = true
			if (!movMem) {
				switch (ins.opc) {
					case 0x71: ld(1); break; case 0x69: ld(2); break; case 0x61: ld(4); break; case 0x79: ld(8); break
					case 0x72: st(1, immU); break; case 0x6a: st(2, immU); break; case 0x62: st(4, immU); break; case 0x7a: st(8, immU); break
					case 0x73: st(1, S); break; case 0x6b: st(2, S); break; case 0x63: st(4, S); break; case 0x7b: st(8, S); break
					default: handled = false
				}
			} else {
				switch (ins.opc) {
					case 0x2c: ld(1); break; case 0x3c: ld(2); break; case 0x8c: ld(4); break; case 0x9c: ld(8); break
					case 0x27: st(1, immU); break; case 0x37: st(2, immU); break; case 0x87: st(4, immU); break; case 0x97: st(8, immU); break
					case 0x2f: st(1, S); break; case 0x3f: st(2, S); break; case 0x8f: st(4, S); break; case 0x9f: st(8, S); break
					default: handled = false
				}
			}
			if (!handled) {
				handled = true
				const divz = (x: bigint) => { if (x === 0n) throw new Abort('division by zero') }
				switch (ins.opc) {
					case 0x18:
						if (noLddw) { handled = false; break }
						r[dst] = (BigInt(insns[pc + 1].imm >>> 0) << 32n) | BigInt(ins.imm >>> 0)
						next = pc + 2
						break
					case 0x04: r[dst] = signExt(D + imm); break
					case 0x0c: r[dst] = signExt(D + S); break
					case 0x14: r[dst] = swapSub ? signExt(imm - D) : signExt(D - imm); break
					case 0x1c: r[dst] = signExt(D - S); break
					case 0x24: if (pqr) handled = false; else r[dst] = u64(i32(i32(D) * i32(imm))); break
					case 0x2c: if (pqr) handled = false; else r[dst] = u64(i32(i32(D) * i32(S))); break
					case 0x34: if (pqr) handled = false; else { divz(u32(immU)); r[dst] = u32(D) / u32(immU) } break
					case 0x3c: if (pqr) handled = false; else { divz(u32(S)); r[dst] = u32(D) / u32(S) } break
					case 0x44: r[dst] = u32(D | immU); break
					case 0x4c: r[dst] = u32(D | S); break
					case 0x54: r[dst] = u32(D & immU); break
					case 0x5c: r[dst] = u32(D & S); break
					case 0x64: r[dst] = u32(u32(D) << (u32(immU) & 31n)); break
					case 0x6c: r[dst] = u32(u32(D) << (u32(S) & 31n)); break
					case 0x74: r[dst] = u32(D) >> (u32(immU) & 31n); break
					case 0x7c: r[dst] = u32(D) >> (u32(S) & 31n); break
					case 0x84: if (noNeg) handled = false; else r[dst] = u32(-i32(D)); break
					case 0x94: if (pqr) handled = false; else { divz(u32(immU)); r[dst] = u32(D) % u32(immU) } break
					case 0x9c: if (pqr) handled = false; else { divz(u32(S)); r[dst] = u32(D) % u32(S) } break
					case 0xa4: r[dst] = u32(D ^ immU); break
					case 0xac: r[dst] = u32(D ^ S); break
					case 0xb4: r[dst] = u32(immU); break
					case 0xbc: r[dst] = sx ? u64(i32(S)) : u32(S); break
					case 0xc4: r[dst] = u32(i32(D) >> (u32(immU) & 31n)); break
					case 0xcc: r[dst] = u32(i32(D) >> (u32(S) & 31n)); break
					case 0xd4:
						if (noLe) { handled = false; break }
						if (ins.imm === 16) r[dst] = D & 0xffffn
						else if (ins.imm === 32) r[dst] = u32(D)
						else if (ins.imm === 64) r[dst] = D
						else throw new Abort('invalid le')
						break
					case 0xdc: {
						const bits = ins.imm
						if (bits !== 16 && bits !== 32 && bits !== 64) throw new Abort('invalid be')
						let x = D & ((1n << BigInt(bits)) - 1n), y = 0n
						for (let i = 0; i < bits / 8; i++) { y = (y << 8n) | (x & 0xffn); x >>= 8n }
						r[dst] = y
						break
					}
					case 0x07: r[dst] = u64(D + imm); break
					case 0x0f: r[dst] = u64(D + S); break
					case 0x17: r[dst] = swapSub ? u64(imm - D) : u64(D - imm); break
					case 0x1f: r[dst] = u64(D - S); break
					case 0x27: if (pqr) handled = false; else r[dst] = u64(D * immU); break
					case 0x2f: if (pqr) handled = false; else r[dst] = u64(D * S); break
					case 0x37: if (pqr) handled = false; else { divz(immU); r[dst] = D / immU } break
					case 0x3f: if (pqr) handled = false; else { divz(S); r[dst] = D / S } break
					case 0x47: r[dst] = D | immU; break
					case 0x4f: r[dst] = D | S; break
					case 0x57: r[dst] = D & immU; break
					case 0x5f: r[dst] = D & S; break
					case 0x67: r[dst] = u64(D << (u32(immU) & 63n)); break
					case 0x6f: r[dst] = u64(D << (u32(S) & 63n)); break
					case 0x77: r[dst] = D >> (u32(immU) & 63n); break
					case 0x7f: r[dst] = D >> (u32(S) & 63n); break
					case 0x87: if (noNeg) handled = false; else r[dst] = u64(-D); break
					case 0x97: if (pqr) handled = false; else { divz(immU); r[dst] = D % immU } break
					case 0x9f: if (pqr) handled = false; else { divz(S); r[dst] = D % S } break
					case 0xa7: r[dst] = D ^ immU; break
					case 0xaf: r[dst] = D ^ S; break
					case 0xb7: r[dst] = immU; break
					case 0xbf: r[dst] = S; break
					case 0xc7: r[dst] = u64(i64(D) >> (u32(immU) & 63n)); break
					case 0xcf: r[dst] = u64(i64(D) >> (u32(S) & 63n)); break
					case 0xf7: if (!noLddw) handled = false; else r[dst] = D | (u32(immU) << 32n); break
					default: handled = false
				}
				if (!handled && pqr && (ins.opc & 7) === 6) {
					handled = true
					const isImm = (ins.opc & 8) === 0
					const is64 = (ins.opc & 0x10) !== 0
					const op = ins.opc & 0xe0
					switch (op) {
						case 0x80: { const b = isImm ? immU : S; r[dst] = is64 ? u64(D * b) : u32(u32(D) * u32(b)); break }
						case 0x20: if (!is64) { handled = false; break } r[dst] = (D * (isImm ? u32(immU) : S)) >> 64n; break
						case 0xa0: if (!is64) { handled = false; break } r[dst] = u64((i64(D) * (isImm ? imm : i64(S))) >> 64n); break
						case 0x40: case 0x60: {
							const b = isImm ? u32(immU) : S
							if (is64) { divz(b); r[dst] = op === 0x40 ? D / b : D % b }
							else { divz(u32(b)); r[dst] = op === 0x40 ? u32(D) / u32(b) : u32(D) % u32(b) }
							break
						}
						case 0xc0: case 0xe0: {
							if (is64) {
								const b = isImm ? imm : i64(S)
								if (b === 0n) throw new Abort('division by zero')
								if (i64(D) === -(1n << 63n) && b === -1n) throw new Abort('division overflow')
								r[dst] = u64(op === 0xc0 ? i64(D) / b : i64(D) % b)
							} else {
								const b = isImm ? i32(imm) : i32(S)
								if (b === 0n) throw new Abort('division by zero')
								if (i32(D) === -(1n << 31n) && b === -1n) throw new Abort('division overflow')
								r[dst] = u32(op === 0xc0 ? i32(D) / b : i32(D) % b)
							}
							break
						}
						default: handled = false
					}
				}
			}
			if (!handled) {
				const cls = ins.opc & 7
				const code = ins.opc >> 4
				if (ins.opc === 0x05) next = pc + 1 + ins.off
				else if (cls === 5 && [1, 2, 3, 4, 5, 6, 7, 0xa, 0xb, 0xc, 0xd].includes(code) && ins.opc !== 0x85 && ins.opc !== 0x8d && ins.opc !== 0x95 && ins.opc !== 0x9d) {
					const b = ins.opc & 8 ? S : immU
					let t: boolean
					switch (code) {
						case 1: t = D === b; break
						case 2: t = D > b; break
						case 3: t = D >= b; break
						case 4: t = (D & b) !== 0n; break
						case 5: t = D !== b; break
						case 6: t = i64(D) > i64(b); break
						case 7: t = i64(D) >= i64(b); break
						case 0xa: t = D < b; break
						case 0xb: t = D <= b; break
						case 0xc: t = i64(D) < i64(b); break
						default: t = i64(D) <= i64(b); break
					}
					if (t) next = pc + 1 + ins.off
				} else if (jmp32 && cls === 6 && [1, 2, 3, 4, 5, 6, 7, 0xa, 0xb, 0xc, 0xd].includes(code)) {
					const bb = ins.opc & 8 ? S : immU
					const x = u32(D), y = u32(bb), sx32 = i32(D), sy32 = i32(bb)
					let t: boolean
					switch (code) {
						case 1: t = x === y; break
						case 2: t = x > y; break
						case 3: t = x >= y; break
						case 4: t = (x & y) !== 0n; break
						case 5: t = x !== y; break
						case 6: t = sx32 > sy32; break
						case 7: t = sx32 >= sy32; break
						case 0xa: t = x < y; break
						case 0xb: t = x <= y; break
						case 0xc: t = sx32 < sy32; break
						default: t = sx32 <= sy32; break
					}
					if (t) next = pc + 1 + ins.off
				} else if (ins.opc === 0x85) {
					if (staticSys) {
						if (ins.src === 0) doCall(`sys:${SYSCALL_BY_HASH.get(ins.imm >>> 0)?.name ?? 'hash:' + (ins.imm >>> 0)}`)
						else if (ins.src === 1) doCall(`fn:${pc + 1 + ins.imm}`)
						else throw new Abort('invalid call')
					} else doCall(callTargetName(p, pc, ins.imm))
				} else if (ins.opc === 0x8d) {
					const reg = v === 2 ? src : v >= 3 ? dst : ins.imm
					doCall(`ptr:${r[reg].toString(16)}`)
				} else if (ins.opc === 0x95) {
					return { ret: r[0], steps }
				} else throw new Abort(`invalid instruction 0x${ins.opc.toString(16)}`)
			}
			if (nfr !== null) fr[dst] = nfr
			pc = next
		}
	} catch (e) {
		if (e instanceof Abort) return { abort: e.message, steps }
		if (e instanceof StepLimit) return { steps, limit: true }
		if (e instanceof FrameAlias) return { steps, alias: true }
		throw e
	}
}

/** Name of a call target the way the test hooks identify it (independent of the lifter). */
export function callTargetName(p: Program, pc: number, imm: number): string {
	if (p.version >= 3) return `fn:${pc + 1 + imm}`
	const rel = p.elf.callRelocs.get(pc)
	if (rel) return rel.kind === 'fn' ? `fn:${rel.targetPc}` : `sys:${rel.name}`
	if (imm !== -1 && pc + 1 + imm >= 0 && pc + 1 + imm < p.insns.length) return `fn:${pc + 1 + imm}`
	return `hash:${imm >>> 0}`
}

export { MM_STACK_START }
