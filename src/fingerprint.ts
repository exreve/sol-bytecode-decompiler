// Position-independent function fingerprints, used to recognize library code shared by
// many unrelated programs (Rust core/alloc, solana-program, borsh, anchor-lang, spl, ...).
import { createHash } from 'node:crypto'
import type { Program, Func } from './program.ts'

export interface FnPrint { hash: string; insns: number; strings: string[] }

/** Instructions of a function in address order (blocks are contiguous in LLVM output). */
function funcPcs(f: Func): number[] {
	const pcs: number[] = []
	for (const b of [...f.blocks].sort((a, b) => a.start - b.start)) for (let pc = b.start; pc <= b.end; pc++) pcs.push(pc)
	return pcs
}

export function fingerprint(p: Program, f: Func): FnPrint {
	const h = createHash('sha1')
	const pcs = funcPcs(f)
	// the hashed byte stream is assembled in one buffer and hashed with a single update (same
	// digest as updating per instruction, without a native call per instruction)
	let out = Buffer.allocUnsafe(pcs.length * 12 + 64), len = 0
	const need = (n: number) => { if (len + n > out.length) { const o = Buffer.allocUnsafe((len + n) * 2); out.copy(o, 0, 0, len); out = o } }
	const textLo = p.textVaddr, textHi = p.textVaddr + BigInt(p.insns.length * 8)
	const strings: string[] = []
	for (const pc of pcs) {
		const i = p.insns[pc]
		let imm: string | number = i.imm
		let hi = 0
		if (i.opc === 0x85) {
			const rel = p.elf.callRelocs.get(pc)
			if (rel?.kind === 'syscall') imm = 'S:' + rel.name
			else if (p.version < 3 && i.imm === -1 && !rel) imm = 'U'
			else imm = 'F' // internal call: target varies with layout
		} else if (i.opc === 0x18 && p.version < 2) {
			const n = p.insns[pc + 1]
			const v = n ? (BigInt(n.imm >>> 0) << 32n) | BigInt(i.imm >>> 0) : 0n
			if (v >= textLo && v < textHi) imm = 'T'
			else if (p.image.region(v)) {
				imm = 'A'
				const s = p.image.bytesAt(v, 1) ? previewString(p, v) : undefined
				if (s) strings.push(s)
			} else { imm = i.imm; hi = n?.imm ?? 0 }
		}
		const tail = typeof imm === 'number' ? undefined : Buffer.from(imm, 'utf8')
		need(4 + (tail ? tail.length : 8))
		out.writeUInt8(i.opc, len); out.writeUInt8(i.dst | (i.src << 4), len + 1); out.writeInt16LE(i.opc === 0x85 ? 0 : i.off, len + 2)
		len += 4
		if (typeof imm === 'number') { out.writeInt32LE(imm, len); out.writeInt32LE(hi, len + 4); len += 8 }
		else { tail!.copy(out, len); len += tail!.length }
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
