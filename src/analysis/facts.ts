// Per-function facts for the program analysis (security/ output, see report.ts): the checks a function
// makes (a condition guarding an early exit), the operations it performs (CPIs, PDA derivations, lamport
// and account-data writes) and the calls it makes, each with its line in the function's printed text.
//
// Control flow comes from the structured IR (structure.ts nodes); names, typed fields and CPI decodings
// come from the lines the function printed as (the same names the reader sees). A check is an `if`
// one side of which exits (return / abort) while the other continues; "main" marks nodes reached on
// every path of the function that does not take such an exit (no other branching encloses them).
import type { Node } from '../structure.ts'
import type { Expr, Stmt } from '../ir.ts'
import { walkExpr } from '../ir.ts'
import { stmtExprs } from '../simplify.ts'
import type { CpiDesc, CpiParts } from '../cpi.ts'
import { inlineString } from '../anchorstate.ts'
import type { Program } from '../program.ts'
import { extentOf } from '../exec.ts'
import { callTargetName } from '../emu.ts'

/** A CPI / PDA site of the function (the comment printed before it, when there is one). */
export interface SiteNote { kind: 'cpi' | 'pda'; desc?: CpiDesc; text?: string; via?: string } // via: the user function wrapping invoke that was called

export interface FnInput {
	pc: number
	name: string
	body: Node[]
	lines: string[]                        // the function's printed lines (header comments included)
	at: number                             // index in `lines` of the body's first line
	spans: Map<Node, [number, number]>     // node -> [start, end) in the body's lines
	sites: Map<Node, SiteNote>
	noreturn: (pc: number) => boolean
	calleeName: (pc: number) => string
	anchor: boolean
	seedsAt?: (ptr: bigint, n: bigint) => string | undefined // a seed list in program memory, as text
	programId?: number                                      // the variable holding the program id (Anchor handler ABI)
}

/** An account (or an object held by one) as the code names it: `game_state`, `accounts.user`, `acc0`, a temporary `ga`. */
export interface Ref { acct: string; field?: string }

export interface Check {
	line: number           // 1-based line in the function text
	pc?: number
	cond: string           // the printed condition
	failsIf: boolean       // true: the exit is taken when cond holds
	error: string          // anchor::X, error::X, Err(...), abort, return
	kinds: string[]        // signer, writable, owner, key, executable, data_len, lamports, discriminator, pda, has_one, …, state, custom
	refs: Ref[]            // accounts (and fields) the condition reads
	named?: string         // the account the failing side names (Anchor: Error::with_account_name / inline name string)
	main: boolean
	before?: number        // the callee of the last call before the check in its statement list (Anchor try-call pattern)
	via?: { fn: string; kinds: string[] } // the checks that callee makes (kinds from its Anchor error codes, see calleeChecks)
}

export type OpKind = 'CPI' | 'TOKEN_TRANSFER' | 'LAMPORT_TRANSFER' | 'ACCOUNT_CLOSE' | 'ACCOUNT_REALLOC' | 'ACCOUNT_DATA_WRITE' | 'AUTHORITY_WRITE'
	| 'MINT' | 'BURN' | 'PDA_SIGNATURE' | 'PROGRAM_UPGRADE' | 'ACCOUNT_CREATE' | 'OWNER_ASSIGN' | 'PDA_DERIVE' | 'LAMPORT_WRITE'

export interface Op {
	line: number
	pc?: number
	kinds: OpKind[]
	text: string                  // the printed line (the comment for CPIs / PDAs)
	main: boolean
	errPath: boolean              // on the failing side of a check
	cpi?: CpiParts & { family?: string; ix?: string }
	target?: Ref                  // written account / field
	how?: '=' | '+=' | '-='
	value?: string
	pda?: { fn: string; seeds: string; program: string }
	via?: string                  // the CPI is made through this (small) user function wrapping invoke
}

export interface Call { line: number; callee: number; main: boolean; errPath: boolean }

export interface FnFacts { pc: number; name: string; checks: Check[]; ops: Op[]; calls: Call[]; types: Map<string, string>; wrapper?: boolean }

const ACC_FIELDS = new Set(['key', 'owner', 'is_signer', 'is_writable', 'executable', 'lamports', 'data', 'data_len', 'rent_epoch', 'original_data_len', 'dup_marker'])
const FIELD_KIND: Record<string, string> = { is_signer: 'signer', is_writable: 'writable', executable: 'executable', owner: 'owner', key: 'key', data_len: 'data_len', lamports: 'lamports' }
/** Anchor error -> the constraint it reports */
export const ANCHOR_KIND: Record<string, string> = {
	ConstraintMut: 'writable', AccountNotMutable: 'writable', ConstraintSigner: 'signer', AccountNotSigner: 'signer',
	ConstraintOwner: 'owner', AccountOwnedByWrongProgram: 'owner', ConstraintSeeds: 'pda', ConstraintHasOne: 'has_one',
	ConstraintAddress: 'address', InvalidProgramId: 'address', AccountDiscriminatorMismatch: 'discriminator', AccountDiscriminatorNotFound: 'discriminator',
	AccountNotInitialized: 'initialized', ConstraintRentExempt: 'rent_exempt', ConstraintExecutable: 'executable', InvalidProgramExecutable: 'executable',
	AccountNotProgram: 'executable', ConstraintTokenMint: 'token_mint', ConstraintTokenOwner: 'token_owner', ConstraintMintAuthority: 'mint_authority',
	ConstraintRaw: 'raw', ConstraintClose: 'close', ConstraintZero: 'zero', AccountNotEnoughKeys: 'count', ConstraintState: 'state',
	ConstraintAssociated: 'associated', ConstraintAssociatedInit: 'associated', ConstraintTokenTokenProgram: 'token_program', AccountNotSystemOwned: 'owner',
	AccountSysvarMismatch: 'address', ConstraintSpace: 'space', ConstraintDuplicateMutableAccount: 'duplicate',
}
const ERROR_MARK = /anchor::\w|error::\w|\bErr\(|ProgramError::|Error_with_account_name\(|anchor_error_from\(|\btrap\(|\babort\(|sol_panic|panic/
const TEMP = /^([a-z]{1,2}|v\d+|s[0-9a-f]+|p\d+|r\d|fp|u\d+)$/
const AUTHORITY = /authority|admin|owner|manager|operator|governor|guardian|upgrade|signer|delegate/i

/** Split a dotted path into the account it names and the field (see Ref); undefined when no account is involved. */
export function refOf(path: string, types: Map<string, string>): Ref | undefined {
	const seg = path.split('.')
	let i = seg.indexOf('accounts')
	if (i >= 0 && i + 1 < seg.length) { i++ }
	else if (seg[0] === 'input' && /^acc\d+$/.test(seg[1] ?? '')) i = 1
	else i = 0
	let acct = seg[i]
	const rest = seg.slice(i + 1)
	const t = types.get(seg[0]) ?? ''
	// a typed account object (deserialized data, a box of it, an AccountInfo or record) or a named account
	const isAcc = /^(AccountInfo|AccountRecord)$/.test(t) || /(Account|Data)$/.test(t) || i > 0 || /_(box|data|acc)$/.test(acct) || (rest.length > 0 && ACC_FIELDS.has(rest[0]))
	if (!isAcc || /(Context|Accounts|Args)$/.test(t) && i === 0) return undefined
	acct = acct.replace(/_(box|data|acc)$/, '')
	return { acct, field: rest.length ? rest.join('.') : undefined }
}

export function functionFacts(inp: FnInput): FnFacts {
	const { lines, at, spans } = inp
	const facts: FnFacts = { pc: inp.pc, name: inp.name, checks: [], ops: [], calls: [], types: new Map() }
	// declared types and single-definition aliases (x = path) of the function's names
	const alias = new Map<string, string | null>()
	const sig = lines.find(l => l.startsWith('function ') || l.startsWith('export function '))
	if (sig) for (const m of sig.matchAll(/(\w+): (\w+)/g)) facts.types.set(m[1], m[2])
	for (const l of lines) {
		const m = /^\s*(?:const |let )?(\w+)(?:: (\w+))? = ([A-Za-z_]\w*\.[\w.]+)$/.exec(l)
		if (m) { alias.set(m[1], alias.has(m[1]) && alias.get(m[1]) !== m[3] ? null : m[3]); if (m[2]) facts.types.set(m[1], m[2]) }
		else { const d = /^\s*(?:const |let )?(\w+)(?:: (\w+))? = /.exec(l); if (d) { if (alias.has(d[1])) alias.set(d[1], null); if (d[2]) facts.types.set(d[1], d[2]) } }
	}
	const resolve = (path: string): string => {
		for (let k = 0; k < 4; k++) {
			const dot = path.indexOf('.'), head = dot < 0 ? path : path.slice(0, dot)
			const a = alias.get(head)
			if (!a) break
			path = a + (dot < 0 ? '' : path.slice(dot))
		}
		return path
	}
	const ref = (path: string) => refOf(resolve(path), facts.types)
	const lineOf = (n: Node) => { const s = spans.get(n); return s ? at + s[0] : -1 }
	const textOf = (ns: Node[], max = 400): string => {
		if (!ns.length) return ''
		const a = spans.get(ns[0]), b = spans.get(ns[ns.length - 1])
		if (!a || !b) return ''
		return lines.slice(at + a[0], Math.min(at + b[1], at + a[0] + max)).join('\n')
	}
	/** the lines of a list's own statements (nested branches, blocks and loops left out) */
	const topText = (ns: Node[], max = 80): string => {
		const out: string[] = []
		for (const n of ns) {
			if (n.k === 'if' || n.k === 'block' || n.k === 'loop' || n.k === 'switch') continue
			const sp = spans.get(n)
			if (sp) for (let i = sp[0]; i < sp[1] && out.length < max; i++) out.push(lines[at + i])
		}
		return out.join('\n')
	}
	const firstPc = (ns: Node[]): number | undefined => {
		for (const n of ns) {
			if (n.k === 'stmt') return n.s.pc
			const sub = n.k === 'if' ? [...n.then, ...n.else] : n.k === 'block' || n.k === 'loop' ? n.body : []
			const p = firstPc(sub)
			if (p !== undefined) return p
		}
		return undefined
	}
	/**
	 * Does control leave the function (return / abort) once the list is done, `cont` telling whether
	 * falling off its end does (the rest of the enclosing code exits)? `break L` goes where block L ends.
	 */
	const labelCont = new Map<string, boolean>()
	const exits = (ns: Node[], cont: boolean): boolean => {
		const n = ns[ns.length - 1]
		if (!n) return cont
		switch (n.k) {
			case 'return': case 'trap': return true
			case 'stmt': return n.s.k === 'trap' || (n.s.k === 'call' && n.s.t.k === 'fn' && inp.noreturn(n.s.t.pc)) || cont
			case 'break': return n.label !== null && (labelCont.get(n.label) ?? false)
			case 'if': return exits(n.then, cont) && exits(n.else, cont)
			case 'block': labelCont.set(n.label, cont); return exits(n.body, cont)
			case 'setstate': return cont
			default: return false
		}
	}
	const calleesOf = (s: Stmt): number[] => {
		const out: number[] = []
		if (s.k === 'call' && s.t.k === 'fn') out.push(s.t.pc)
		for (const e of stmtExprs(s)) walkExpr(e, x => { if (x.k === 'call' && x.t.k === 'fn') out.push(x.t.pc) })
		return out
	}
	const exprCallees = (e: Expr): number[] => { const out: number[] = []; walkExpr(e, x => { if (x.k === 'call' && x.t.k === 'fn') out.push(x.t.pc) }); return out }

	const site = (n: Node, main: boolean, err: boolean) => {
		const s = inp.sites.get(n)
		if (!s) return
		const l = lineOf(n)
		const pc = n.k === 'stmt' ? n.s.pc : undefined
		const text = s.desc?.text ?? s.text ?? lines[l]?.trim() ?? ''
		if (s.kind === 'pda') {
			const m = /^PDA (\w+)\((.*), program (.*)\)$/.exec(text)
			facts.ops.push({ line: l + 1, pc, kinds: ['PDA_DERIVE'], text, main, errPath: err, pda: m ? { fn: m[1], seeds: m[2], program: m[3] } : { fn: 'find_program_address', seeds: '?', program: '?' } })
			return
		}
		const d = s.desc
		const kinds: OpKind[] = ['CPI']
		const ix = d?.ix ?? '', fam = d?.family ?? '', known = d?.parts?.known ?? ''
		if (fam === 'token' || fam === 'token2022') {
			if (/^Transfer/.test(ix)) kinds.push('TOKEN_TRANSFER')
			else if (/^MintTo/.test(ix)) kinds.push('MINT')
			else if (/^Burn/.test(ix)) kinds.push('BURN')
			else if (ix === 'CloseAccount') kinds.push('ACCOUNT_CLOSE')
			else if (/^(SetAuthority|Approve|Revoke)/.test(ix)) kinds.push('AUTHORITY_WRITE')
		} else if (fam === 'system') {
			if (/^Transfer/.test(ix)) kinds.push('LAMPORT_TRANSFER')
			else if (/^CreateAccount/.test(ix)) kinds.push('ACCOUNT_CREATE')
			else if (/^Assign/.test(ix)) kinds.push('OWNER_ASSIGN')
			else if (/^Allocate/.test(ix)) kinds.push('ACCOUNT_REALLOC')
		}
		if (/UPGRADEABLE/.test(known)) kinds.push('PROGRAM_UPGRADE')
		if (d ? d.parts?.seeds : /signer seeds (?!\[\])/.test(text) && !/no signer seeds/.test(text)) kinds.push('PDA_SIGNATURE')
		facts.ops.push({ line: l + 1, pc, kinds, text: text || `CPI (instruction not decoded): ${lines[l]?.trim()}`, main, errPath: err, cpi: d?.parts ? { ...d.parts, family: d.family, ix: d.ix } : undefined, via: s.via })
	}

	// stores: lamports, account data fields (typed), account record fields
	const store = (n: Node, main: boolean, err: boolean) => {
		const s = n.k === 'stmt' ? n.s : undefined
		if (!s || (s.k !== 'store' && s.k !== 'stores')) return
		const l = lineOf(n)
		const t = lines[l]?.trim() ?? ''
		const m = /^([A-Za-z_][\w]*(?:\.[A-Za-z_]\w*|\[\d+\])+) = (.*?)(?: \/\/.*)?$/.exec(t)
		if (!m) return
		const lv = resolve(m[1]), rhs = m[2]
		if (/\.(borrow|strong|weak|dup_marker)$/.test(lv)) return
		const r = refOf(lv, facts.types)
		if (!r) return
		const how: Op['how'] = rhs.startsWith(m[1] + ' - ') || rhs.startsWith(lv + ' - ') ? '-=' : rhs.startsWith(m[1] + ' + ') || rhs.startsWith(lv + ' + ') ? '+=' : '='
		const kinds: OpKind[] = []
		const f = r.field ?? ''
		if (/^lamports\b/.test(f) || /\.lamports(\.|$)/.test(lv)) kinds.push('LAMPORT_WRITE')
		else if (f === 'data_len') kinds.push('ACCOUNT_REALLOC')
		else if (/^(key|owner|is_signer|is_writable|executable|rent_epoch|data|original_data_len)$/.test(f)) return
		else { kinds.push('ACCOUNT_DATA_WRITE'); if (AUTHORITY.test(f.split('.').pop() ?? '')) kinds.push('AUTHORITY_WRITE') }
		if (kinds[0] === 'LAMPORT_WRITE' && how === '=' && /^0x0*0?$|^0$/.test(rhs)) kinds.push('ACCOUNT_CLOSE')
		facts.ops.push({ line: l + 1, pc: s.pc, kinds, text: t, main, errPath: err, target: { acct: r.acct, field: r.field?.replace(/^lamports\..*/, 'lamports') }, how, value: rhs })
	}

	const check = (n: Extract<Node, { k: 'if' }>, failNodes: Node[], failsIf: boolean, main: boolean, before: number | undefined) => {
		const l = lineOf(n)
		const hl = lines[l] ?? ''
		const cm = /^\s*(?:\} else )?if \((.*)\) \{$/.exec(hl) ?? /^\s*(?:\} else )?if \((.*)\) \{$/.exec(lines[l + 1] ?? '')
		const cond = cm ? cm[1] : '?'
		const ft = topText(failNodes) + '\n' + textOf(failNodes, 60)
		const kinds: string[] = []
		const add = (k: string) => { if (!kinds.includes(k)) kinds.push(k) }
		const refs: Ref[] = []
		const clean = cond.replace(/"(?:[^"\\]|\\.)*"/g, '""')
		for (const pm of clean.matchAll(/\b([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+)/g)) {
			const r = ref(pm[1])
			if (!r) continue
			if (!refs.some(x => x.acct === r.acct && x.field === r.field)) refs.push(r)
			const f0 = r.field?.split('.')[0] ?? ''
			if (FIELD_KIND[f0]) add(FIELD_KIND[f0])
			else if (r.field && !ACC_FIELDS.has(f0)) add('state')
		}
		if (/\bkeyeq\(|memeq\([^)]*0x20\)/.test(clean) && !kinds.includes('owner')) add('key')
		// the error raised: an IDL error, else an Anchor error that reports a constraint, else any Anchor / program error
		let error = ''
		const cm2 = /\berror::(\w+)/.exec(ft)
		const ams = [...ft.matchAll(/anchor::(\w+)/g)].map(x => x[1])
		const ak = ams.find(x => ANCHOR_KIND[x])
		if (cm2) { error = cm2[0]; add('custom') }
		else if (ak) { error = `anchor::${ak}`; add(ANCHOR_KIND[ak]) }
		else if (ams.length) error = `anchor::${ams[0]}`
		else { const em = /\b(Err\([^)]*\)?\))/.exec(ft) ?? /ProgramError::(\w+)/.exec(ft); if (em) error = em[0] }
		if (!error) error = /\btrap\(|\babort\(|panic/.test(ft) || failNodes[failNodes.length - 1]?.k === 'trap' ? 'abort' : 'return'
		let named: string | undefined
		const nm = /Error_with_account_name\([^\n]*?"(\w+)"/.exec(ft)
		if (nm) named = nm[1]
		else if (inp.anchor && ft.length < 4000) named = inlineString(failNodes)
		if (!kinds.length && !named) return
		const pc = firstPc(failNodes)
		facts.checks.push({ line: l + 1, pc, cond, failsIf, error, kinds, refs, named, main, before })
	}

	const walk = (ns: Node[], main: boolean, err: boolean, cont: boolean) => {
		let before: number | undefined
		for (let k = 0; k < ns.length; k++) {
			const n = ns[k]
			site(n, main, err)
			switch (n.k) {
				case 'stmt': {
					store(n, main, err)
					const cs = calleesOf(n.s)
					for (const c of cs) {
						facts.calls.push({ line: lineOf(n) + 1, callee: c, main, errPath: err })
						const nm = inp.calleeName(c)
						if (/find_program_address|create_program_address/.test(nm) && !inp.sites.has(n)) {
							// (out, seeds, seeds_len, program_id): a constant seed list is read from program memory
							const c = n.s.k === 'call' ? n.s : n.s.k === 'set' && n.s.e.k === 'call' ? n.s.e : undefined
							const [sp, sn] = [c?.args[1], c?.args[2]]
							const seeds = sp?.k === 'const' && sn?.k === 'const' ? inp.seedsAt?.(sp.v, sn.v) : undefined
							const t = lines[lineOf(n)]?.trim() ?? ''
							const prog = /, (\w+)\)$/.exec(t)?.[1] ?? '?'
							facts.ops.push({ line: lineOf(n) + 1, pc: n.s.pc, kinds: ['PDA_DERIVE'], text: t, main, errPath: err, pda: { fn: nm.replace(/_[0-9a-f]+$/, ''), seeds: seeds ?? '? (not in the frame)', program: prog } })
						}
						if (/realloc|resize/i.test(nm)) facts.ops.push({ line: lineOf(n) + 1, pc: n.s.pc, kinds: ['ACCOUNT_REALLOC'], text: lines[lineOf(n)]?.trim() ?? '', main, errPath: err })
					}
					if (cs.length) before = cs[cs.length - 1]
					break
				}
				case 'return': if (n.e) for (const c of exprCallees(n.e)) facts.calls.push({ line: lineOf(n) + 1, callee: c, main, errPath: err }); break
				case 'if': {
					const rest = ns.slice(k + 1)
					// (the rest of the list ends with the list's last node: its exit is the same for every k)
					const after = k + 1 < ns.length ? exits(ns, cont) : cont
					// (a side exits on its own: falling off its end merges with the other path)
					const tEx = exits(n.then, false), eEx = n.else.length > 0 && exits(n.else, false)
					let fail: 'then' | 'else' | 'rest' | undefined
					if (!n.else.length) {
						const rEx = after
						if (tEx && !rEx) fail = 'then'
						else if (tEx && rEx) fail = pickFail(n.then, rest)
						else if (!n.then.length && rEx) fail = 'rest'
						// (the side leaves the function somewhere inside and otherwise falls into the rest: which is the error path)
						else if (!tEx && rEx && hasExit(n.then)) fail = pickFail(n.then, rest, true)
					} else if (tEx && !eEx) fail = 'then'
					else if (eEx && !tEx) fail = 'else'
					// (both exit, or both fall into a continuation that exits: the one that looks like the error path)
					else if ((tEx && eEx) || (!tEx && !eEx && after)) { const pf = pickFail(n.then, n.else); fail = pf === 'then' ? 'then' : pf === 'rest' ? 'else' : undefined }
					if (fail) {
						const failNodes = fail === 'then' ? n.then : fail === 'else' ? n.else : rest
						check(n, failNodes, fail === 'then', main, before)
						walk(n.then, fail === 'then' ? false : main, err || fail === 'then', after)
						walk(n.else, fail === 'else' ? false : main, err || fail === 'else', after)
						if (fail === 'rest') { walk(rest, false, true, cont); return }
					} else { walk(n.then, false, err, after); walk(n.else, false, err, after) }
					before = undefined
					break
				}
				case 'block': { const after = k + 1 < ns.length ? exits(ns, cont) : cont; labelCont.set(n.label, after); walk(n.body, main, err, after); before = undefined; break }
				case 'loop': walk(n.body, n.form === 'do' ? main : false, err, false); before = undefined; break
				case 'switch': { const after = k + 1 < ns.length ? exits(ns, cont) : cont; for (const c of n.cases) walk(c.body, false, err, after); before = undefined; break }
			}
		}
	}
	/** both sides exit: the one that looks like the error path (error markers; else much shorter) */
	const pickFail = (a: Node[], b: Node[], strict = false): 'then' | 'rest' | undefined => {
		const la = span(a), lb = span(b)
		if (!strict && la * 4 <= lb && la <= 40) return 'then'
		if (!strict && lb * 4 <= la && lb <= 40) return 'rest'
		// (Anchor: the failing side names the account it reports, e.g. a heap-built "system_program")
		if (!strict && inp.anchor && la <= 60 && la * 2 <= lb && inlineString(a)) return 'then'
		// (the failing side raises its error first thing; the passing side, if at all, after further checks)
		const fa = firstMark(a), fb = firstMark(b)
		if (fa !== fb && Math.min(fa, fb) + 8 < Math.max(fa, fb)) return fa < fb ? 'then' : 'rest'
		// (the failing side reports one error; the passing side goes on to make further checks)
		const marks = (ns: Node[]) => { let c = 0; for (const l of textOf(ns).split('\n')) if (ERROR_MARK.test(l)) c++; return c }
		const ca = marks(a), cb = marks(b)
		if (ca && cb && ca !== cb && Math.min(ca, cb) * 2 < Math.max(ca, cb)) return ca < cb ? 'then' : 'rest'
		const ma = ERROR_MARK.test(topText(a)), mb = ERROR_MARK.test(topText(b))
		if (ma !== mb) return ma ? 'then' : 'rest'
		return undefined
	}
	const hasExit = (ns: Node[]): boolean => ns.some(n => n.k === 'return' || n.k === 'trap' || (n.k === 'if' ? hasExit(n.then) || hasExit(n.else) : n.k === 'block' || n.k === 'loop' ? hasExit(n.body) : false))
	/** lines from the start of a list to its first own statement (not nested) with an error marker */
	const firstMark = (ns: Node[]): number => {
		const s0 = spans.get(ns[0])
		if (!s0) return Infinity
		for (const n of ns) {
			if (n.k === 'if' || n.k === 'block' || n.k === 'loop' || n.k === 'switch') continue
			const sp = spans.get(n)
			if (sp) for (let i = sp[0]; i < sp[1]; i++) if (ERROR_MARK.test(lines[at + i])) return i - s0[0]
		}
		return Infinity
	}
	const span = (ns: Node[]) => { const a = spans.get(ns[0]), b = spans.get(ns[ns.length - 1]); return a && b ? b[1] - a[0] : 0 }
	walk(inp.body, true, false, true)
	return facts
}

/** Anchor account types by the library functions a try-callee uses (names from the library database). */
const TYPE_KINDS: [RegExp, string[]][] = [
	[/^Signer_try_from/, ['signer']], [/^(Account|AccountLoader|InterfaceAccount)_try_from/, ['owner', 'discriminator']],
	[/^Program_try_from/, ['address', 'executable']], [/^SystemAccount_try_from/, ['owner']], [/^Sysvar_from_account_info/, ['address']],
]

/**
 * What a callee (an Anchor `<T as Accounts>::try_accounts` / `try_from`, usually library code) checks: the
 * kinds of the Anchor errors its code (and that of its callees within 2 calls) raises (error-code
 * immediates), and the account types of the named library functions it calls. Functions with many
 * error codes (error conversion tables) are left out.
 */
export function calleeChecks(p: Program, pc: number, errName: (v: bigint) => string | undefined, memo: Map<number, Set<string>>, depth = 2): Set<string> {
	let r = memo.get(pc)
	if (r) return r
	r = new Set()
	memo.set(pc, r)
	const own = new Set<string>(), sub: number[] = []
	const end = extentOf(p, pc)
	for (let i = pc; i < end; i++) {
		const ins = p.insns[i]
		// mov / mov32 / st{w,dw} of an immediate in the Anchor error range
		if ((ins.opc === 0xb7 || ins.opc === 0xb4 || ins.opc === 0x62 || ins.opc === 0x7a) && ins.imm >= 2000 && ins.imm <= 4200) {
			const e = errName(BigInt(ins.imm))?.replace(/^anchor::/, '')
			if (e && ANCHOR_KIND[e]) own.add(ANCHOR_KIND[e])
		}
		if (ins.opc === 0x85) {
			const t = callTargetName(p, i, ins.imm)
			if (!t.startsWith('fn:')) continue
			const x = Number(t.slice(3)), nm = p.funcs.get(x)?.name ?? ''
			for (const [re, ks] of TYPE_KINDS) if (re.test(nm)) ks.forEach(k => own.add(k))
			if (depth > 0) sub.push(x)
		}
	}
	if (own.size > 6) return r
	own.forEach(k => r!.add(k))
	for (const x of sub) calleeChecks(p, x, errName, memo, depth - 1).forEach(k => r!.add(k))
	return r
}
