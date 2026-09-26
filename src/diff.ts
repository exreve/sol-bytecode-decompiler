// Program diff from bytecode alone: which functions (and instruction handlers) differ between two
// builds, or how much code two programs share (fork-family matching).
//   sbpf-decompile a.so b.so [-o report.txt]   (src/cli.ts)
// Functions are matched by address-independent hash (src/fingerprint.ts), then by register-renamed
// hash, instruction name, symbol name, and finally by coarse shape + call-graph neighbourhood.
// Only the decompiler's first phase runs (lifting, signatures, library recognition, instruction names).
import { loadProgram, type Program } from './program.ts'
import { inferSignatures } from './dataflow.ts'
import { Semantics } from './semantics.ts'
import { classify } from './library.ts'
import { signatures, fuzzySim, codeHash, type FnSig } from './fingerprint.ts'
import type { IdlInfo } from './idl.ts'
import { decompile, type Result } from './decompile.ts'
import { analyze } from './analysis/report.ts'

export interface Profile {
	p: Program
	sigs: Map<number, FnSig>
	lib: Set<number>
	names: Map<number, string>        // pc -> display name (ix_<name>, library name, symbol, fn_<addr>)
	owners: Map<number, string[]>     // pc -> instructions whose handler reaches the function
	arms: Map<string, string>         // instruction name -> where it was found (log / disc / idl / tag: native dispatch split)
	callers: Map<number, number[]>
	codeHash: string                  // hash of the multiset of (function hash, data hash)
}

/** Everything the diff (and security/fingerprints.json) needs, from the first decompiler phase. */
export function profile(bytes: Uint8Array, idl?: IdlInfo): Profile {
	const p = loadProgram(bytes, { lazyBlocks: true })
	inferSignatures(p)
	const sem = new Semantics(p, idl)
	const libs = classify(p)
	const sigs = signatures(p)
	const lib = new Set([...libs].filter(([, i]) => i.lib).map(([pc]) => pc))
	const names = new Map<number, string>()
	for (const f of p.funcs.values()) names.set(f.pc, libs.get(f.pc)?.name ?? f.name)
	const roots = new Map<number, string[]>()
	for (const [pc, ix] of sem.ixNames) if (!lib.has(pc)) { names.set(pc, `ix_${ix}`); roots.set(pc, [ix]) }
	for (const [pc, ixs] of sem.processors) if (!lib.has(pc)) roots.set(pc, ixs.length > 3 ? [`processor ${names.get(pc)}`] : ixs)
	const owners = handlerReach(sigs, lib, roots)
	const arms = new Map<string, string>()
	for (const ix of sem.ixNames.values()) arms.set(ix, 'log')
	for (const ixs of sem.processors.values()) for (const ix of ixs) arms.set(ix, 'log')
	// Anchor dispatcher: 8-byte instruction discriminators loaded as constants
	for (let i = 0; i + 1 < p.insns.length; i++) if (p.insns[i].opc === 0x18 && p.version !== 2) {
		const v = (BigInt(p.insns[i + 1].imm >>> 0) << 32n) | BigInt(p.insns[i].imm >>> 0)
		const n = sem.disc.get(v)
		if (n?.startsWith('ix:') && !arms.has(n.slice(3))) arms.set(n.slice(3), 'disc')
	}
	for (const ix of idl?.instructions ?? []) if (!arms.has(ix.name)) arms.set(ix.name, 'idl')
	// native programs (no names from logs / discriminators): the per-instruction split on the tag dispatch
	// (security analysis, src/analysis/flow.ts), which needs the full decompilation
	if (!arms.size) nativeArms(bytes, idl, arms, owners)
	const callers = new Map<number, number[]>()
	for (const s of sigs.values()) for (const t of new Set(s.calls)) { let l = callers.get(t); if (!l) callers.set(t, (l = [])); l.push(s.pc) }
	return { p, sigs, lib, names, owners, arms, callers, codeHash: codeHash(sigs.values()) }
}

/** Instruction arms of a native program from the analysis' tag-dispatch split (and the functions each reaches). */
function nativeArms(bytes: Uint8Array, idl: IdlInfo | undefined, arms: Map<string, string>, owners: Map<number, string[]>) {
	let r: Result
	try { r = decompile(bytes, { idl }) } catch { return }
	const byName = new Map(r.funcs.map(f => [f.name, f.pc]))
	for (const ix of analyze(r).ixs) {
		if (ix.kind !== 'native') continue
		arms.set(ix.name, 'tag')
		for (const fn of ix.functions) {
			const pc = byName.get(fn)
			if (pc === undefined) continue
			const o = owners.get(pc) ?? []
			if (!o.includes(ix.name)) owners.set(pc, [...o, ix.name])
		}
	}
}

/** Instruction handlers reaching each function through direct calls (not through library code or other handlers). */
export function handlerReach(sigs: Map<number, FnSig>, lib: Set<number>, roots: Map<number, string[]>): Map<number, string[]> {
	const own = new Map<number, Set<string>>()
	for (const [r, ixs] of roots) {
		const seen = new Set([r]), q = [r]
		while (q.length) {
			const x = q.pop()!
			let o = own.get(x); if (!o) own.set(x, (o = new Set())); for (const ix of ixs) o.add(ix)
			for (const t of sigs.get(x)?.calls ?? []) if (!seen.has(t) && !lib.has(t) && !roots.has(t) && sigs.has(t)) { seen.add(t); q.push(t) }
		}
	}
	return new Map([...own].map(([pc, s]) => [pc, [...s].sort()]))
}

type Kind = 'same' | 'data' | 'regs' | 'near'
export interface Match { b: number; kind: Kind; sim: number }

export function match(A: Profile, B: Profile): Map<number, Match> {
	const m = new Map<number, Match>(), used = new Set<number>()
	const pair = (a: number, b: number, kind: Kind, sim = 1) => { m.set(a, { b, kind, sim }); used.add(b) }
	// 1-3: identical code (and constants), identical code, identical up to register allocation
	const byKey = (kind: Kind, key: (s: FnSig) => string) => {
		const idx = new Map<string, number[]>()
		for (const s of B.sigs.values()) if (!used.has(s.pc)) { const k = key(s); const l = idx.get(k); if (l) l.push(s.pc); else idx.set(k, [s.pc]) }
		for (const s of A.sigs.values()) if (!m.has(s.pc)) { const l = idx.get(key(s)); const b = l?.shift(); if (b !== undefined) pair(s.pc, b, kind) }
	}
	byKey('same', s => `${s.hash}:${s.data}`)
	byKey('data', s => s.hash)
	byKey('regs', s => s.regfree)
	// 4: same instruction handler / symbol name (user code)
	const bByName = new Map<string, number>()
	for (const [pc, n] of B.names) if (!used.has(pc) && !B.lib.has(pc) && !/^fn_[0-9a-f]+$/.test(n)) bByName.set(n, pc)
	for (const [pc, n] of A.names) if (!m.has(pc) && !A.lib.has(pc)) {
		const b = bByName.get(n)
		if (b !== undefined && !used.has(b)) pair(pc, b, 'near', fuzzySim(A.sigs.get(pc)!, B.sigs.get(b)!))
	}
	// 5: coarse shape + call-graph neighbourhood (matched callers/callees), greedy by score; twice, so
	// matches found in the first round count as neighbours in the second
	const nbrs = (P: Profile, pc: number) => new Set([...P.sigs.get(pc)!.calls, ...P.callers.get(pc) ?? []])
	for (let round = 0; round < 2; round++) {
		const as = [...A.sigs.values()].filter(s => !m.has(s.pc) && !A.lib.has(s.pc) && s.insns >= 6)
		const bs = [...B.sigs.values()].filter(s => !used.has(s.pc) && !B.lib.has(s.pc) && s.insns >= 6).sort((x, y) => x.insns - y.insns)
		if (!as.length || !bs.length) break
		const cands: [number, number, number, number][] = []
		for (const a of as) {
			const na = nbrs(A, a.pc)
			let lo = 0, hi = bs.length
			while (lo < hi) { const mid = (lo + hi) >> 1; if (bs[mid].insns * 2 < a.insns) lo = mid + 1; else hi = mid }
			for (let k = lo; k < bs.length && bs[k].insns <= a.insns * 2; k++) {
				const b = bs[k], f = fuzzySim(a, b)
				if (f < 0.55) continue
				const nb = nbrs(B, b.pc)
				let hit = 0
				for (const x of na) { const y = m.get(x); if (y && nb.has(y.b)) hit++ }
				const score = na.size || nb.size ? f * 0.6 + (hit / Math.max(na.size, nb.size)) * 0.4 : f
				if (score >= (round ? 0.65 : 0.75)) cands.push([score, a.pc, b.pc, f])
			}
		}
		cands.sort((x, y) => y[0] - x[0] || x[1] - y[1])
		for (const [, a, b, f] of cands) if (!m.has(a) && !used.has(b)) pair(a, b, 'near', f)
	}
	return m
}

/** Instructions differing between two functions' normalized code (aligned position-wise, or by common prefix/suffix). */
export function changedInsns(a: string[], b: string[]): number {
	let pre = 0, suf = 0
	while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++
	while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++
	let d = Math.max(a.length, b.length) - pre - suf
	if (a.length === b.length) { let q = 0; for (let k = pre; k < a.length - suf; k++) if (a[k] !== b[k]) q++; d = Math.min(d, q) }
	if (d > 8) { // (insertions in the middle) instructions without a counterpart in the other function
		const c = new Map<string, number>()
		for (let k = pre; k < a.length - suf; k++) c.set(a[k], (c.get(a[k]) ?? 0) + 1)
		let common = 0
		for (let k = pre; k < b.length - suf; k++) { const n = c.get(b[k]); if (n) { common++; c.set(b[k], n - 1) } }
		d = Math.min(d, Math.max(a.length, b.length) - pre - suf - common)
	}
	return d
}

export interface Diff { A: Profile; B: Profile; m: Map<number, Match>; lines: string[] }

export function diff(A: Profile, B: Profile, opts: { all?: boolean; labels?: [string, string] } = {}): Diff {
	const m = match(A, B)
	const matchedB = new Set([...m.values()].map(x => x.b))
	const size = (P: Profile, pc: number) => P.sigs.get(pc)!.insns
	const user = (P: Profile) => [...P.sigs.keys()].filter(pc => !P.lib.has(pc))
	const total = (P: Profile, pcs: number[]) => pcs.reduce((t, pc) => t + size(P, pc), 0)
	const delta = (pc: number, x: Match) => changedInsns(A.sigs.get(pc)!.toks, B.sigs.get(x.b)!.toks)
	// share of a matched pair counted as common code: aligned identical instructions, at least half the shape similarity
	const weight = (pc: number, x: Match) => x.kind === 'data' || x.kind === 'regs' ? 1 : Math.max(1 - delta(pc, x) / Math.max(size(A, pc), size(B, x.b)), x.sim / 2)
	const uA = user(A), uB = user(B), tA = total(A, uA), tB = total(B, uB)
	let same = 0, near = 0
	for (const pc of uA) {
		const x = m.get(pc)
		if (!x || B.lib.has(x.b)) continue
		const w = size(A, pc) + size(B, x.b)
		if (x.kind === 'same') same += w
		else near += w * weight(pc, x)
	}
	const pct = (x: number) => `${(tA + tB ? (100 * x) / (tA + tB) : 100).toFixed(1)}%`
	const [la, lb] = ['a', 'b']
	const L: string[] = []
	const desc = (P: Profile, l: string) => `${l}: ${opts.labels?.[l === la ? 0 : 1] ?? ''}  sBPF v${P.p.version}, ${P.p.insns.length} insns, ${P.sigs.size} functions (${P.sigs.size - P.lib.size} user, ${P.lib.size} library), ${P.arms.size} instruction arms, code hash ${P.codeHash}`
	L.push(desc(A, la), desc(B, lb))
	// library code: counted as multisets of hashes
	const libHashes = (P: Profile) => { const c = new Map<string, number>(); for (const pc of P.lib) { const h = P.sigs.get(pc)!.hash; c.set(h, (c.get(h) ?? 0) + 1) } return c }
	const hA = libHashes(A), hB = libHashes(B)
	let libOnlyA = 0, libOnlyB = 0
	for (const [h, n] of hA) libOnlyA += Math.max(0, n - (hB.get(h) ?? 0))
	for (const [h, n] of hB) libOnlyB += Math.max(0, n - (hA.get(h) ?? 0))
	const userSame = uA.length === uB.length && uA.every(pc => m.get(pc)?.kind === 'same' && !B.lib.has(m.get(pc)!.b))
	const score = tA + tB ? (same + near) / (tA + tB) : 1
	if (A.codeHash === B.codeHash) L.push(`verdict: same code (e.g. redeployed at a new address)${A.p.elf.bytes.length === B.p.elf.bytes.length && Buffer.compare(Buffer.from(A.p.elf.bytes), Buffer.from(B.p.elf.bytes)) === 0 ? '; identical files' : ''}`)
	else if (userSame) L.push(`verdict: same program code; toolchain/library version changed (library functions: ${libOnlyA} only in ${la}, ${libOnlyB} only in ${lb})`)
	else L.push(`verdict: ${score >= 0.9 ? 'same program, modified' : score >= 0.5 ? 'related programs (fork family / shared code base)' : score >= 0.15 ? 'partially shared code' : 'different programs'}`)
	L.push(`similarity: ${pct(same + near)} of user code (identical ${pct(same)}, near ${pct(near)}; user code ${tA} vs ${tB} instructions)`)
	L.push(`library: ${libOnlyA || libOnlyB ? `${libOnlyA} functions only in ${la}, ${libOnlyB} only in ${lb} (toolchain/library version differs)` : 'identical'}`)
	// instruction arms
	const armsA = [...A.arms.keys()], armsB = [...B.arms.keys()]
	const addArms = armsB.filter(x => !A.arms.has(x)).sort(), delArms = armsA.filter(x => !B.arms.has(x)).sort()
	if (addArms.length || delArms.length) {
		L.push(`instructions: ${armsA.length - delArms.length} common, ${addArms.length} added, ${delArms.length} removed`)
		const cap = (xs: string[]) => opts.all || xs.length <= 30 ? xs.join(', ') : `${xs.slice(0, 30).join(', ')}, … (${xs.length - 30} more)`
		if (addArms.length) L.push(`  + ${cap(addArms)}`)
		if (delArms.length) L.push(`  - ${cap(delArms)}`)
	} else L.push(`instructions: ${armsA.length ? `same ${armsA.length}` : 'none recognized'}`)
	// user functions
	const ixs = (P: Profile, pc: number) => { const o = P.owners.get(pc); return o?.length ? `  [${o.length > 4 ? `${o.slice(0, 4).join(', ')}, +${o.length - 4}` : o.join(', ')}]` : '' }
	const changed = uA.filter(pc => { const x = m.get(pc); return x && x.kind !== 'same' && !B.lib.has(x.b) }).sort((x, y) => size(A, y) - size(A, x))
	const removed = uA.filter(pc => !m.has(pc)).sort((x, y) => size(A, y) - size(A, x))
	const added = uB.filter(pc => !matchedB.has(pc)).sort((x, y) => size(B, y) - size(B, x))
	L.push(`functions: ${uA.length - changed.length - removed.length} identical, ${changed.length} changed, ${added.length} added, ${removed.length} removed (user code)`)
	const list = (xs: number[], row: (pc: number) => string) => {
		const n = opts.all ? xs.length : 25
		for (const pc of xs.slice(0, n)) L.push(row(pc))
		if (xs.length > n) L.push(`    … ${xs.length - n} more (--all)`)
	}
	const nm = (P: Profile, pc: number) => P.names.get(pc) ?? `fn_${pc}`
	const note: Record<Kind, string> = { same: '', data: 'constants only', regs: 'register allocation only', near: '' }
	list(changed, pc => {
		const x = m.get(pc)!, a = nm(A, pc), b = nm(B, x.b)
		let why = note[x.kind] || `${delta(pc, x)} insns differ`
		if (x.kind === 'data') {
			const ca = A.sigs.get(pc)!.consts, cb = B.sigs.get(x.b)!.consts
			const d = ca.map((c, k) => [c, cb[k]]).filter(([c, e]) => c !== e)
			if (d.length) why += `: ${d.slice(0, 2).map(([c, e]) => `${c} -> ${e ?? '?'}`).join(', ')}${d.length > 2 ? `, +${d.length - 2}` : ''}`
		}
		return `  ~ ${a === b ? a : `${a} -> ${b}`}  ${size(A, pc)} -> ${size(B, x.b)} insns, ${why}${ixs(B, x.b) || ixs(A, pc)}`
	})
	list(added, pc => `  + ${nm(B, pc)}  ${size(B, pc)} insns${ixs(B, pc)}`)
	list(removed, pc => `  - ${nm(A, pc)}  ${size(A, pc)} insns${ixs(A, pc)}`)
	return { A, B, m, lines: L }
}
