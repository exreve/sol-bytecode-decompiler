// Cross-program invocations (comments only: nothing here changes semantics).
//
// At a sol_invoke_signed_c / sol_invoke_signed_rust call (or a thin wrapper of one) whose instruction
// struct lives in the caller's frame, the constant parts of what is invoked are read back from the
// stores that built it and summarized in a comment:
//   // CPI: program TOKEN_PROGRAM, accounts [f + 8 (w), g + 8 (w), h + 8 (s)], data 9 bytes [u8 3 (Transfer), u64 ld64(a + 0x20)], no signer seeds
// Layouts:
//   C    SolInstruction { program_id: *Pubkey, accounts: *SolAccountMeta, account_len, data: *u8, data_len }
//        SolAccountMeta { pubkey: *Pubkey, is_writable: u8, is_signer: u8 } (16 bytes)
//   Rust StableInstruction { accounts: {ptr, cap, len}, data: {ptr, cap, len}, program_id: Pubkey }
//        AccountMeta { pubkey: Pubkey, is_signer: u8, is_writable: u8 } (34 bytes)
//   signer seeds (both): [{ ptr, len }] of [{ ptr, len }] byte slices
// The frame contents are tracked along straight-line code only: a fact is a store to fp + k that is
// still the latest write to those bytes at the call, i.e. no call, store through another pointer,
// loop, labeled block or non-exiting branch came in between, and no variable it mentions (or memory
// it loads) changed since.
import type { Node } from './structure.ts'
import { type Expr, type Stmt, walkExpr, exprEq } from './ir.ts'
import { KNOWN_KEYS, b58 } from './semantics.ts'

interface Fact { off: number; size: number; e: Expr }
export interface CpiSite { abi: 'c' | 'rust'; args: Expr[]; facts: Fact[] }

/** CPI call sites of a structured body, keyed by the node (statement / return) containing the call. */
export function findCpiSites(body: Node[], fp: number, abiOf: (t: Extract<Stmt, { k: 'call' }>['t']) => 'c' | 'rust' | null): Map<Node, CpiSite> {
	const sites = new Map<Node, CpiSite>()
	const fo = (e: Expr): number | null => frameOff(e, fp)
	const hasCall = (e: Expr) => { let c = false; walkExpr(e, x => { if (x.k === 'call') c = true }); return c }
	const mentions = (e: Expr, v: number) => { let m = false; walkExpr(e, x => { if (x.k === 'var' && x.id === v) m = true }); return m }
	/** does e load bytes that a frame store to [o, o + n) changes? */
	const readsChanged = (e: Expr, o: number, n: number) => {
		let r = false
		walkExpr(e, x => { if (x.k === 'load') { const lo = fo(x.addr); if (lo !== null && lo < o + n && o < lo + x.size) r = true } })
		return r
	}
	const kill = (facts: Fact[], o: number, n: number) => facts.filter(f => !(f.off < o + n && o < f.off + f.size) && !readsChanged(f.e, o, n))
	const note = (n: Node, e: Expr | null, facts: Fact[]) => {
		if (!e) return
		walkExpr(e, x => {
			if (x.k !== 'call' || x.t.k === 'ind') return
			const abi = abiOf(x.t)
			if (abi && !sites.has(n)) sites.set(n, { abi, args: x.args, facts: [...facts] })
		})
	}
	const run = (ns: Node[], facts0: Fact[]): Fact[] => {
		let facts = [...facts0]
		for (const n of ns) {
			switch (n.k) {
				case 'stmt': {
					const s = n.s
					if (s.k === 'call') {
						if (s.t.k !== 'ind') { const abi = abiOf(s.t); if (abi) sites.set(n, { abi, args: s.args, facts: [...facts] }) }
						facts = []
					} else if (s.k === 'set') {
						note(n, s.e, facts)
						facts = hasCall(s.e) ? [] : facts.filter(f => !mentions(f.e, s.dst))
					} else if (s.k === 'store' || s.k === 'stores') {
						const vals = s.k === 'store' ? [s.v] : s.vals
						const o = fo(s.addr)
						// a store through any other pointer may hit the frame (through a copy of its address)
						if (o === null || vals.some(hasCall)) facts = []
						else vals.forEach((v, i) => { facts = kill(facts, o + i * s.size, s.size); facts.push({ off: o + i * s.size, size: s.size, e: v }) })
					} else if (s.k === 'copy') {
						const o = fo(s.dst)
						facts = o === null ? [] : kill(facts, o, s.n)
						// the copied words, as loads of the source (dropped with the facts reading it)
						if (o !== null && !s.rev && fo(s.src) === null && !hasCall(s.src)) for (let i = 0; i < s.n; i += 8) facts.push({ off: o + i, size: 8, e: { k: 'load', size: 8, addr: addOff(s.src, i) } })
					} else if (s.k === 'eval') {
						note(n, s.e, facts)
						if (hasCall(s.e)) facts = []
					}
					break
				}
				case 'return': note(n, n.e, facts); break
				case 'if': {
					if (hasCall(n.c)) { note(n, n.c, facts); facts = []; run(n.then, []); run(n.else, []); break }
					run(n.then, facts); run(n.else, facts)
					// a branch that always leaves does not affect the code after the if
					const exits = (xs: Node[]) => { const l = xs[xs.length - 1]; return !!l && (l.k === 'return' || l.k === 'break' || l.k === 'continue' || l.k === 'trap') }
					if (!((exits(n.then) && !n.else.length) || (exits(n.else) && !n.then.length))) facts = []
					break
				}
				case 'block': run(n.body, facts); facts = []; break
				case 'loop': run(n.body, []); facts = []; break
				case 'switch': n.cases.forEach(c => run(c.body, [])); facts = []; break
				default: break
			}
		}
		return facts
	}
	run(body, [])
	return sites
}

const addOff = (e: Expr, i: number): Expr => (i === 0 ? e : e.k === 'const' ? { k: 'const', v: e.v + BigInt(i) }
	: e.k === 'bin' && e.op === 'add' && e.b.k === 'const' ? { ...e, b: { k: 'const', v: BigInt.asUintN(64, e.b.v + BigInt(i)) } }
	: { k: 'bin', op: 'add', a: e, b: { k: 'const', v: BigInt(i) } })

function frameOff(e: Expr, fp: number): number | null {
	if (e.k === 'var' && e.id === fp) return 0
	if (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const') return Number(BigInt.asIntN(64, e.b.v))
	return null
}

export interface CpiEnv {
	fp: number
	expr: (e: Expr) => string
	keyAt?: (ptr: bigint) => string | undefined   // base58 of 32 rodata bytes
	strAt?: (ptr: bigint, len: bigint) => string | undefined
	constName?: (v: bigint) => string | undefined // discriminator / known key chunk names
	read?: (addr: bigint, size: number) => bigint | undefined // read-only program memory
}

const SYSTEM_IX = ['CreateAccount', 'Assign', 'Transfer', 'CreateAccountWithSeed', 'AdvanceNonceAccount', 'WithdrawNonceAccount',
	'InitializeNonceAccount', 'AuthorizeNonceAccount', 'Allocate', 'AllocateWithSeed', 'AssignWithSeed', 'TransferWithSeed', 'UpgradeNonceAccount']
const TOKEN_IX = ['InitializeMint', 'InitializeAccount', 'InitializeMultisig', 'Transfer', 'Approve', 'Revoke', 'SetAuthority', 'MintTo', 'Burn',
	'CloseAccount', 'FreezeAccount', 'ThawAccount', 'TransferChecked', 'ApproveChecked', 'MintToChecked', 'BurnChecked', 'InitializeAccount2',
	'SyncNative', 'InitializeAccount3', 'InitializeMultisig2', 'InitializeMint2', 'GetAccountDataSize', 'InitializeImmutableOwner',
	'AmountToUiAmount', 'UiAmountToAmount', 'InitializeMintCloseAuthority']
const ATA_IX = ['Create', 'CreateIdempotent', 'RecoverNested']

/** One-line description of a CPI site, or undefined when its instruction is not in the frame. */
export function describeCpi(site: CpiSite, env: CpiEnv): string | undefined {
	const { facts, args } = site
	const fo = (e: Expr) => frameOff(e, env.fp)
	const at = (o: number, size: number): Expr | undefined => {
		const f = facts.find(x => x.off === o && x.size === size)
		if (f) return f.e
		// a constant covering the bytes
		const c = facts.find(x => x.off <= o && o + size <= x.off + x.size && x.e.k === 'const')
		if (c && c.e.k === 'const') return { k: 'const', v: BigInt.asUintN(size * 8, c.e.v >> BigInt(8 * (o - c.off))) }
		return undefined
	}
	const num = (e: Expr | undefined) => (e?.k === 'const' && e.v < 0x10000n ? Number(e.v) : undefined)
	const ix = fo(args[0])
	if (ix === null) return undefined
	const keyName = (b: string) => KNOWN_KEYS[b] ?? `key ${b}`
	/** a 32-byte key stored as four constant words (or copied from rodata) at frame offset o */
	const keyInFrame = (o: number): string | undefined => {
		const words: bigint[] = []
		// copied from memory that is not read-only: name the source
		const w0 = at(o, 8)
		if (w0?.k === 'load' && w0.addr.k !== 'const' && [1, 2, 3].every(i => { const w = at(o + 8 * i, 8); return w?.k === 'load' && exprEq(w.addr, addOff(w0.addr, 8 * i)) })) return `*${wrap(env.expr(w0.addr))}`
		for (let i = 0; i < 4; i++) {
			let w = at(o + 8 * i, 8)
			if (w?.k === 'load' && w.addr.k === 'const' && env.read) { const v = env.read(w.addr.v, 8); w = v === undefined ? undefined : { k: 'const', v } }
			if (w?.k !== 'const') return undefined
			words.push(w.v)
		}
		const b = new Uint8Array(32)
		words.forEach((v, i) => { for (let j = 0; j < 8; j++) b[i * 8 + j] = Number((v >> BigInt(8 * j)) & 0xffn) })
		return keyName(b58(b))
	}
	const keyPtr = (e: Expr | undefined): { text: string; known?: string } => {
		if (!e) return { text: '?' }
		if (e.k === 'const') { const k = env.keyAt?.(e.v); if (k) { const n = keyName(k); return { text: n, known: n } } }
		const o = fo(e)
		if (o !== null) { const k = keyInFrame(o); if (k) return { text: k, known: k } }
		return { text: `*${wrap(env.expr(e))}` }
	}
	let program: { text: string; known?: string }
	const accounts: string[] = []
	let nAcc: number | undefined, dataPtr: Expr | undefined, dataLen: Expr | undefined
	if (site.abi === 'c') {
		program = keyPtr(at(ix, 8))
		const metas = at(ix + 8, 8)
		nAcc = num(at(ix + 16, 8))
		dataPtr = at(ix + 24, 8); dataLen = at(ix + 32, 8)
		const mo = metas && fo(metas)
		if (nAcc !== undefined && mo !== undefined && mo !== null && nAcc <= 24) for (let i = 0; i < nAcc; i++) {
			const pk = at(mo + 16 * i, 8)
			const w = num(at(mo + 16 * i + 8, 1)), s = num(at(mo + 16 * i + 9, 1))
			accounts.push(`${pk ? keyPtr(pk).known ?? env.expr(pk) : '?'}${flags(w, s)}`)
		}
	} else {
		const k = keyInFrame(ix + 48)
		program = k ? { text: k, known: k } : { text: '?' }
		nAcc = num(at(ix + 16, 8))
		dataPtr = at(ix + 24, 8); dataLen = at(ix + 40, 8)
		const metas = at(ix, 8), mo = metas && fo(metas)
		if (nAcc !== undefined && mo !== undefined && mo !== null && nAcc <= 24) for (let i = 0; i < nAcc; i++) {
			const b = mo + 34 * i
			accounts.push(`${keyInFrame(b) ?? '?'}${flags(num(at(b + 33, 1)), num(at(b + 32, 1)))}`)
		}
	}
	const parts = [`program ${program.text}`]
	if (accounts.some(a => a !== '? (?)')) parts.push(`accounts [${accounts.join(', ')}]`)
	else if (nAcc !== undefined) parts.push(`${nAcc} account${nAcc === 1 ? '' : 's'}`)
	const dl = num(dataLen)
	if (dl !== undefined) parts.push(`data ${dl} byte${dl === 1 ? '' : 's'}${dataPtr ? describeData(dataPtr, dl, program.known, at, fo, env) : ''}`)
	else if (dataPtr && dataLen) parts.push(`data ${wrap(env.expr(dataPtr))}[..${env.expr(dataLen)}]`)
	if (program.text === '?' && parts.length === 1) return undefined
	const seeds = describeSeeds(args[3], args[4], at, fo, env)
	if (seeds) parts.push(seeds)
	return `CPI: ${parts.join(', ')}`
}

function flags(w: number | undefined, s: number | undefined): string {
	if (w === undefined || s === undefined) return ' (?)'
	const f = [w ? 'w' : '', s ? 's' : ''].filter(Boolean).join(',')
	return f ? ` (${f})` : ''
}

const wrap = (t: string) => (/^[\w.]+$/.test(t) ? t : `(${t})`)

function describeData(ptr: Expr, len: number, program: string | undefined, at: (o: number, size: number) => Expr | undefined, fo: (e: Expr) => number | null, env: CpiEnv): string {
	const o = fo(ptr)
	if (o === null || len === 0 || len > 256) return ''
	// the stores covering [o, o + len), in address order
	const items: string[] = []
	let p = o, tag: bigint | undefined, first = true
	while (p < o + len && items.length < 12) {
		let e: Expr | undefined, size = 0
		for (const s of [8, 4, 2, 1]) if (p + s <= o + len && (e = at(p, s))) { size = s; break }
		if (!e) { if (items.length) items.push('?'); break }
		if (first && e.k === 'const') tag = e.v
		let t = `u${size * 8} ${env.expr(e)}`
		if (first && e.k === 'const') {
			const n = ixName(program, size, e.v) ?? (size === 8 ? env.constName?.(e.v) : undefined) ?? (program ? undefined : guessIx(size, e.v, len))
			if (n && !t.includes('/*')) t += ` (${n})`
		}
		items.push(t)
		p += size; first = false
	}
	void tag
	return items.length ? ` [${items.join(', ')}]` : ''
}

/** Program unknown: the instruction a System / SPL Token program would see in data of this shape. */
function guessIx(size: number, tag: bigint, len: number): string | undefined {
	const SYS: Record<number, number> = { 0: 52, 1: 36, 2: 12, 8: 12 }
	const TOK: Record<number, number> = { 3: 9, 4: 9, 7: 9, 8: 9, 9: 1, 12: 10, 13: 10, 14: 10, 15: 10, 17: 1, 18: 33 }
	if (size === 4 && SYS[Number(tag)] === len) return `System ${SYSTEM_IX[Number(tag)]} if the program is System`
	if (size === 1 && TOK[Number(tag)] === len) return `Token ${TOKEN_IX[Number(tag)]} if the program is SPL Token`
	return undefined
}

function ixName(program: string | undefined, size: number, v: bigint): string | undefined {
	if (program === 'SYSTEM_PROGRAM' && size === 4) return SYSTEM_IX[Number(v)]
	if ((program === 'TOKEN_PROGRAM' || program === 'TOKEN_2022_PROGRAM') && size === 1) return TOKEN_IX[Number(v)]
	if (program === 'ASSOCIATED_TOKEN_PROGRAM' && size === 1) return ATA_IX[Number(v)]
	return undefined
}

function describeSeeds(ptr: Expr, n: Expr, at: (o: number, size: number) => Expr | undefined, fo: (e: Expr) => number | null, env: CpiEnv): string | undefined {
	if (n?.k !== 'const') return undefined
	if (n.v === 0n) return 'no signer seeds'
	const o = fo(ptr)
	if (o === null || n.v > 4n) return `${n.v} signer${n.v === 1n ? '' : 's'}`
	const signers: string[] = []
	for (let j = 0; j < Number(n.v); j++) {
		const sp = at(o + 16 * j, 8), sl = at(o + 16 * j + 8, 8)
		const so = sp && fo(sp)
		if (so === undefined || so === null || sl?.k !== 'const' || sl.v > 16n) { signers.push('?'); continue }
		const seeds: string[] = []
		for (let i = 0; i < Number(sl.v); i++) {
			const p = at(so + 16 * i, 8), l = at(so + 16 * i + 8, 8)
			if (!p || !l) { seeds.push('?'); continue }
			if (p.k === 'const' && l.k === 'const') {
				const s = env.strAt?.(p.v, l.v)
				if (s !== undefined) { seeds.push(JSON.stringify(s)); continue }
				if (l.v === 32n) { const k = env.keyAt?.(p.v); if (k) { seeds.push(KNOWN_KEYS[k] ?? `key ${k}`); continue } }
			}
			seeds.push(l.k === 'const' && l.v === 32n ? `*${wrap(env.expr(p))}` : `${wrap(env.expr(p))}[..${env.expr(l)}]`)
		}
		signers.push(`[${seeds.join(', ')}]`)
	}
	return `signer seeds ${signers.join(', ')}`
}
