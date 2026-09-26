// Anchor CPI helpers the library database does not name (anchor_spl::token::initialize_account3 / initialize_mint2,
// behind `init` of token accounts and mints), recognized in the bytecode of the library function the handler calls:
// it reaches sol_invoke_signed (within 3 calls) and a function it calls (within 2) compares a program id with the SPL
// Token (2022) id and stores the instruction's tag into its frame. DERIVED and OVER-APPROXIMATE (analysis only).
import type { Result } from '../decompile.ts'
import type { Expr } from '../ir.ts'
import { b58 } from '../semantics.ts'
import type { IxCtx, OpOut } from './report.ts'
import { cpiKinds, type FnFacts } from './facts.ts'
import { irOf, stmtAt, defsIn } from './paths.ts'
import { callOf } from './flow.ts'
import { evaluatorsFor } from './audit.ts'

const TOKEN_IDS: Record<string, [string, string]> = {
	TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: ['TOKEN_PROGRAM', 'token'],
	TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: ['TOKEN_2022_PROGRAM', 'token2022'],
}
/** the TokenInstruction tags recognized (the anchor_spl helpers `init` calls) */
const TAGS: Record<number, string> = { 18: 'InitializeAccount3', 20: 'InitializeMint2' }

export interface LibCpi { program: string; family: string; ix: string }
const memo = new WeakMap<Result, Map<number, LibCpi | null>>()

/** the CPI a library function the analysis has no name for makes (see above), by its pc */
export function libCpi(r: Result, pc: number): LibCpi | undefined {
	let m = memo.get(r)
	if (!m) memo.set(r, (m = new Map()))
	if (!m.has(pc)) m.set(pc, r.libPcs.has(pc) && /^fn_[0-9a-f]+$/.test(r.program.funcs.get(pc)?.name ?? '') ? scan(r, pc) ?? null : null)
	return m.get(pc) ?? undefined
}

function scan(r: Result, pc: number): LibCpi | undefined {
	const p = r.program, starts = [...p.funcs.keys()].sort((a, b) => a - b)
	const end = (s: number) => { let lo = 0, hi = starts.length; while (lo < hi) { const k = (lo + hi) >> 1; if (starts[k] <= s) lo = k + 1; else hi = k } return starts[lo] ?? p.insns.length }
	/** a function's calls: internal targets and syscall names */
	const calls = (s: number): { fns: number[]; sys: string[] } => {
		const fns: number[] = [], sys: string[] = []
		for (let i = s, e = Math.min(end(s), s + 4000); i < e; i++) {
			const x = p.insns[i]
			if (x.opc !== 0x85) continue
			const rel = p.elf.callRelocs.get(i)
			if (rel?.kind === 'syscall') sys.push(rel.name)
			else if (rel?.kind === 'fn') fns.push(rel.targetPc)
			else if (p.version >= 3 || x.src === 1 || x.imm !== -1) { const t = i + 1 + x.imm; if (t >= 0 && t < p.insns.length && p.funcs.has(t)) fns.push(t) }
		}
		return { fns, sys }
	}
	const invokes = (s: number, d: number, seen: Set<number>): boolean => {
		if (seen.has(s)) return false
		seen.add(s)
		const c = calls(s)
		return c.sys.some(n => /sol_invoke_signed/.test(n)) || (d > 0 && c.fns.some(t => invokes(t, d - 1, seen)))
	}
	/** a function comparing with a token program id and storing a known tag into its frame */
	const built = (s: number): LibCpi | undefined => {
		let prog: [string, string] | undefined, tag: number | undefined
		for (let i = s, e = Math.min(end(s), s + 4000); i < e; i++) {
			const x = p.insns[i]
			if (x.opc === 0x18 && i + 1 < e) {
				const a = BigInt.asUintN(32, BigInt(x.imm)) | BigInt.asUintN(32, BigInt(p.insns[i + 1].imm)) << 32n
				const reg = p.image.region(a, 32)
				if (reg && !reg.exec) { const o = Number(a - reg.vaddr); const id = TOKEN_IDS[b58(reg.bytes.subarray(o, o + 32))]; if (id && (!prog || id[0] === 'TOKEN_PROGRAM')) prog = id }
				i++
			} else if ((x.opc === 0x62 || x.opc === 0x72) && x.dst === 10 && TAGS[x.imm]) {
				if (tag !== undefined && tag !== x.imm) return undefined
				tag = x.imm
			}
		}
		return prog && tag !== undefined ? { program: prog[0], family: prog[1], ix: TAGS[tag] } : undefined
	}
	if (!invokes(pc, 3, new Set())) return undefined
	const found = new Map<string, LibCpi>()
	const walk = (s: number, d: number, seen: Set<number>) => {
		if (seen.has(s)) return
		seen.add(s)
		const b = built(s)
		if (b) found.set(b.ix, b)
		if (d > 0) for (const t of calls(s).fns) walk(t, d - 1, seen)
	}
	walk(pc, 2, new Set())
	return found.size === 1 ? [...found.values()][0] : undefined
}

/**
 * The CPI ops of an instruction's calls to such helpers: the CpiContext (the call's second argument, a frame object:
 * signer seeds, then AccountInfo copies: the program's, the accounts struct's in field order) its accounts by their key
 * words (the IR evaluator of the instruction's Anchor accounts); InitializeMint2's mint authority (its fourth argument,
 * a Pubkey copied from an account's key) as the field `mint_authority`.
 */
export function libCpiOps(r: Result, ctx: IxCtx, fns: FnFacts[], keep: (fn: number, pc: number | undefined) => boolean, mainFn: (fn: number) => boolean): OpOut[] {
	const out: OpOut[] = []
	const I = irOf(r), E = evaluatorsFor(r, ctx), legacy = !!r.legacyInfo
	for (const ff of fns) for (const c of ff.calls) {
		const h = c.errPath || c.pc === undefined || !keep(ff.pc, c.pc) ? undefined : libCpi(r, c.callee)
		if (!h) continue
		const st = stmtAt(I, ff.pc, c.pc!), fo = I.byPc.get(ff.pc), D = defsIn(I, ff.pc), Ev = E(ff.pc)
		const call = st && callOf(st[0])
		if (!st || !fo || !D || !call) continue
		const fpv = fo.f.vars.find(v => v.param === 10)?.id
		const Y = call.args[1] && D.fpOff(call.args[1])
		/** the account whose key a frame word (or a pointer value) holds */
		const keyOf = (e: Expr): string | undefined => { const v = Ev?.ev(e, st[1]); return v && v.k !== 'fr' && (v.k === 'keyp' || v.k === 'info') && !v.guess ? v.acct : undefined }
		const word = (o: number): Expr => ({ k: 'load', size: 8, addr: { k: 'bin', op: 'add', a: { k: 'var', id: fpv ?? -1 }, b: { k: 'const', v: BigInt.asUintN(64, BigInt(o)) } } })
		const roles = h.ix === 'InitializeAccount3' ? ['account', 'mint', 'authority'] : ['mint']
		// (the AccountInfo copies: the program's among them (its place in the struct is the compiler's), the accounts in
		// field order; a program account found drops its slot, else the program is first unless only the first slot is known)
		const slots = roles.concat('').map((_, i) => Y === undefined || fpv === undefined ? undefined : keyOf(word(Y + 0x18 + 0x30 * i + (legacy ? 8 : 0))))
		const pi = slots.findIndex(x => x !== undefined && /program/.test(x))
		const acc = pi >= 0 ? slots.filter((_, i) => i !== pi) : slots[0] !== undefined && slots[slots.length - 1] === undefined ? slots.slice(0, -1) : slots.slice(1)
		const accounts = roles.map((role, i) => ({ role, text: acc[i] ?? '?' }))
		const fields: [string, string][] = []
		if (h.ix === 'InitializeMint2' && call.args[3]) {
			// (the authority: a Pubkey in the frame copied from an account's key, or a pointer to one)
			const z = D.fpOff(call.args[3]), y = z === undefined ? null : D.reaching(D.SLOT(z), st[1], true)
			const a = keyOf(call.args[3]) ?? (y && y[0].k === 'load' ? keyOf(y[0].addr) : undefined)
			if (a) fields.push(['mint_authority', `${a}.key`])
		}
		const cpi = { program: h.program, known: h.program, accounts, fields, family: h.family, ix: h.ix }
		const text = `CPI ${h.program}.${h.ix} { ${accounts.map(x => `${x.role}: ${x.text}`).join(', ')} }${fields.length ? ` (${fields.map(x => `${x[0]}: ${x[1]}`).join(', ')})` : ''} [heur: library helper ${r.program.funcs.get(c.callee)?.name} (Anchor CpiContext; the builder's tag and program id)]`
		out.push({ at: { fn: ff.name, line: c.line, pc: c.pc }, kinds: cpiKinds(h.family, h.ix), text, main: mainFn(ff.pc) && c.main, cpi, fnPc: ff.pc })
	}
	return out
}
