// Cross-program invocations (comments only: nothing here changes semantics).
//
// At a sol_invoke_signed_c / sol_invoke_signed_rust call (or a thin wrapper of one) whose instruction
// struct lives in the caller's frame, the constant parts of what is invoked are read back from the
// stores that built it and summarized in a comment. Instructions of well-known programs (SPL Token /
// Token-2022, System, Associated Token Account, Compute Budget) are decoded: accounts by role, data fields
// by name; when the program id is not a constant, the data/account shape is matched against SPL Token and
// System and the comment says whether the id is compared with a known program id in the same function:
//   // CPI TOKEN_PROGRAM.Transfer { source: f.key (w), destination: g.key (w), authority: h.key (s), amount: ld64(a + 0x20) }, no signer seeds
//   // CPI program *(q + 8) (id not a constant, and not compared with a known program id in this function) — data and
//   //   accounts match SPL Token TransferChecked; if it is SPL Token: { source: i.key (w), mint: h.key, … }
//   // CPI: program key <base58>, accounts [...], data 24 bytes [u64 0x… (ix:swap), u64 …]   (anything else)
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
// CPI (C / Rust ABI); PDA derivation: syscall argument order (seeds, n, program_id, out[, bump]) or
// Pubkey::find/create_program_address (out, seeds, n, program_id); or another call taking a frame address
export type SiteKind = 'c' | 'rust' | 'pda_find' | 'pda_create' | 'pda_find_out' | 'pda_create_out' | 'call'
export interface CpiSite { abi: SiteKind; args: Expr[]; facts: Fact[] }

/** CPI call sites of a structured body, keyed by the node (statement / return) containing the call. */
export function findCpiSites(body: Node[], fp: number, abiOf: (t: Extract<Stmt, { k: 'call' }>['t']) => SiteKind | null): Map<Node, CpiSite> {
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
			if (abi && !sites.has(n) && ((abi !== 'call' && !abi.startsWith('pda')) || x.args.some(a => fo(a) !== null))) sites.set(n, { abi, args: x.args, facts: [...facts] })
		})
	}
	const run = (ns: Node[], facts0: Fact[]): Fact[] => {
		let facts = [...facts0]
		for (const n of ns) {
			switch (n.k) {
				case 'stmt': {
					const s = n.s
					if (s.k === 'call') {
						if (s.t.k !== 'ind') { const abi = abiOf(s.t); if (abi && ((abi !== 'call' && !abi.startsWith('pda')) || s.args.some(a => fo(a) !== null))) sites.set(n, { abi, args: s.args, facts: [...facts] }) }
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
						const o = fo(s.dst), so = fo(s.src)
						// frame to frame: the source's facts move along (read before the destination is overwritten)
						const moved = o !== null && so !== null && (so + s.n <= o || o + s.n <= so)
							? facts.filter(f => f.off >= so && f.off + f.size <= so + s.n).map(f => ({ ...f, off: f.off - so + o })) : []
						facts = o === null ? [] : kill(facts, o, s.n)
						facts.push(...moved)
						// the copied words, as loads of the source (dropped with the facts reading it); a descending
						// copy (copyr) leaves the same contents when the source is outside the frame
						if (o !== null && so === null && !hasCall(s.src)) for (let i = 0; i < s.n; i += 8) facts.push({ off: o + i, size: 8, e: { k: 'load', size: 8, addr: addOff(s.src, i) } })
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
	/** known program ids the 32 bytes at `ptr` are compared with in this function (keyeq / memeq) */
	programCheck?: (ptr: Expr) => string[]
}

/** Instruction of a well-known program: account roles, data fields (name, byte offset, size or 'key'), data length. */
interface IxLayout { name: string; accounts: string[]; fields: [string, number, number | 'key'][]; len?: number }
interface Family { label: string; tagSize: 1 | 4; ixs: Record<number, IxLayout> }
const L = (name: string, accounts: string[], fields: [string, number, number | 'key'][] = [], len?: number): IxLayout => ({ name, accounts, fields, len })
const AMOUNT: [string, number, number][] = [['amount', 1, 8]]
const CHECKED: [string, number, number][] = [['amount', 1, 8], ['decimals', 9, 1]]
const TOKEN: Family = {
	label: 'SPL Token', tagSize: 1, ixs: {
		0: L('InitializeMint', ['mint', 'rent_sysvar'], [['decimals', 1, 1], ['mint_authority', 2, 'key']]),
		1: L('InitializeAccount', ['account', 'mint', 'owner', 'rent_sysvar'], [], 1),
		2: L('InitializeMultisig', ['multisig', 'rent_sysvar'], [['m', 1, 1]], 2),
		3: L('Transfer', ['source', 'destination', 'authority'], AMOUNT, 9),
		4: L('Approve', ['source', 'delegate', 'owner'], AMOUNT, 9),
		5: L('Revoke', ['source', 'owner'], [], 1),
		6: L('SetAuthority', ['account', 'current_authority'], [['authority_type', 1, 1], ['new_authority_is_some', 2, 1], ['new_authority', 3, 'key']]),
		7: L('MintTo', ['mint', 'destination', 'authority'], AMOUNT, 9),
		8: L('Burn', ['account', 'mint', 'authority'], AMOUNT, 9),
		9: L('CloseAccount', ['account', 'destination', 'authority'], [], 1),
		10: L('FreezeAccount', ['account', 'mint', 'authority'], [], 1),
		11: L('ThawAccount', ['account', 'mint', 'authority'], [], 1),
		12: L('TransferChecked', ['source', 'mint', 'destination', 'authority'], CHECKED, 10),
		13: L('ApproveChecked', ['source', 'mint', 'delegate', 'owner'], CHECKED, 10),
		14: L('MintToChecked', ['mint', 'destination', 'authority'], CHECKED, 10),
		15: L('BurnChecked', ['account', 'mint', 'authority'], CHECKED, 10),
		16: L('InitializeAccount2', ['account', 'mint', 'rent_sysvar'], [['owner', 1, 'key']], 33),
		17: L('SyncNative', ['account'], [], 1),
		18: L('InitializeAccount3', ['account', 'mint'], [['owner', 1, 'key']], 33),
		19: L('InitializeMultisig2', ['multisig'], [['m', 1, 1]], 2),
		20: L('InitializeMint2', ['mint'], [['decimals', 1, 1], ['mint_authority', 2, 'key']]),
		21: L('GetAccountDataSize', ['mint'], []),
		22: L('InitializeImmutableOwner', ['account'], [], 1),
		23: L('AmountToUiAmount', ['mint'], AMOUNT, 9),
		25: L('InitializeMintCloseAuthority', ['mint'], [['close_authority_is_some', 1, 1], ['close_authority', 2, 'key']]),
		38: L('WithdrawExcessLamports', ['source', 'destination', 'authority'], [], 1),
		45: L('UnwrapLamports', ['source', 'destination', 'authority'], [['amount_is_some', 1, 1], ['amount', 2, 8]]), // p-token
	},
}
const SYSTEM: Family = {
	label: 'System', tagSize: 4, ixs: {
		0: L('CreateAccount', ['funder', 'new_account'], [['lamports', 4, 8], ['space', 12, 8], ['owner', 20, 'key']], 52),
		1: L('Assign', ['account'], [['owner', 4, 'key']], 36),
		2: L('Transfer', ['from', 'to'], [['lamports', 4, 8]], 12),
		3: L('CreateAccountWithSeed', ['funder', 'new_account', 'base'], [['base', 4, 'key']]),
		4: L('AdvanceNonceAccount', ['nonce_account', 'recent_blockhashes_sysvar', 'nonce_authority'], [], 4),
		5: L('WithdrawNonceAccount', ['nonce_account', 'to', 'recent_blockhashes_sysvar', 'rent_sysvar', 'nonce_authority'], [['lamports', 4, 8]], 12),
		8: L('Allocate', ['account'], [['space', 4, 8]], 12),
		11: L('TransferWithSeed', ['from', 'base', 'to'], [['lamports', 4, 8]]),
	},
}
const ATA_ACCOUNTS = ['payer', 'associated_token_account', 'wallet', 'mint', 'system_program', 'token_program']
const ATA: Family = {
	label: 'Associated Token Account', tagSize: 1, ixs: {
		0: L('Create', ATA_ACCOUNTS, [], 1),
		1: L('CreateIdempotent', ATA_ACCOUNTS, [], 1),
		2: L('RecoverNested', ['nested', 'nested_mint', 'destination', 'owner_associated_token_account', 'owner_mint', 'wallet', 'token_program'], [], 1),
	},
}
const COMPUTE_BUDGET: Family = {
	label: 'Compute Budget', tagSize: 1, ixs: {
		1: L('RequestHeapFrame', [], [['bytes', 1, 4]], 5),
		2: L('SetComputeUnitLimit', [], [['units', 1, 4]], 5),
		3: L('SetComputeUnitPrice', [], [['micro_lamports', 1, 8]], 9),
		4: L('SetLoadedAccountsDataSizeLimit', [], [['bytes', 1, 4]], 5),
	},
}
const FAMILY: Record<string, Family> = { TOKEN_PROGRAM: TOKEN, TOKEN_2022_PROGRAM: TOKEN, SYSTEM_PROGRAM: SYSTEM, ASSOCIATED_TOKEN_PROGRAM: ATA, COMPUTE_BUDGET_PROGRAM: COMPUTE_BUDGET }

interface Acc { text: string; w?: number; s?: number }

/** A described CPI: the comment, and the decoded instruction of a well-known program (guessed: the program id is not a constant). */
export interface CpiDesc { text: string; family?: string; ix?: string; guessed?: boolean }

/** One-line description of a CPI site, or undefined when its instruction is not in the frame. */
export function describeCpi(site: CpiSite, env: CpiEnv): string | undefined { return cpiDesc(site, env)?.text }

export function cpiDesc(site: CpiSite, env: CpiEnv): CpiDesc | undefined {
	if (site.abi === 'call') { const t = describeFmt(site, env); return t ? { text: t } : undefined }
	if (site.abi.startsWith('pda')) { const t = describePda(site, env); return t ? { text: t } : undefined }
	const { facts, args } = site
	const fo = (e: Expr) => frameOff(e, env.fp)
	const at = (o: number, size: number): Expr | undefined => {
		const f = facts.find(x => x.off === o && x.size === size)
		if (f) return f.e
		// a constant covering the bytes
		const c = facts.find(x => x.off <= o && o + size <= x.off + x.size && x.e.k === 'const')
		if (c && c.e.k === 'const') return { k: 'const', v: BigInt.asUintN(size * 8, c.e.v >> BigInt(8 * (o - c.off))) }
		// constant bytes from several stores (e.g. a u32 tag written as u8 + u16 + u8)
		let v = 0n
		for (let i = size - 1; i >= 0; i--) {
			const b = facts.find(x => x.off <= o + i && o + i < x.off + x.size && x.e.k === 'const')
			if (b?.e.k !== 'const') return undefined
			v = (v << 8n) | ((b.e.v >> BigInt(8 * (o + i - b.off))) & 0xffn)
		}
		return { k: 'const', v }
	}
	const num = (e: Expr | undefined) => (e?.k === 'const' && e.v < 0x10000n ? Number(e.v) : undefined)
	const ix = fo(args[0])
	if (ix === null) return undefined
	const keyName = (b: string) => KNOWN_KEYS[b] ?? `key ${b}`
	/** a 32-byte key stored as four constant words (or copied from rodata) at frame offset o; `src`: the address it was copied from */
	const keyInFrame = (o: number): { text: string; known?: string; src?: Expr } | undefined => {
		const words: bigint[] = []
		// copied from memory that is not read-only: name the source
		const w0 = at(o, 8)
		if (w0?.k === 'load' && w0.addr.k !== 'const' && [1, 2, 3].every(i => { const w = at(o + 8 * i, 8); return w?.k === 'load' && exprEq(w.addr, addOff(w0.addr, 8 * i)) })) return { text: `*${wrap(env.expr(w0.addr))}`, src: w0.addr }
		for (let i = 0; i < 4; i++) {
			let w = at(o + 8 * i, 8)
			if (w?.k === 'load' && w.addr.k === 'const' && env.read) { const v = env.read(w.addr.v, 8); w = v === undefined ? undefined : { k: 'const', v } }
			if (w?.k !== 'const') return undefined
			words.push(w.v)
		}
		const b = new Uint8Array(32)
		words.forEach((v, i) => { for (let j = 0; j < 8; j++) b[i * 8 + j] = Number((v >> BigInt(8 * j)) & 0xffn) })
		const n = keyName(b58(b))
		return { text: n, known: n }
	}
	/** a pointer to a key: named when constant, else `*ptr` (or the pointer itself for account keys, e.g. `acc.key`) */
	const keyPtr = (e: Expr | undefined): { text: string; known?: string; src?: Expr } => {
		if (!e) return { text: '?' }
		if (e.k === 'const') {
			const k = env.keyAt?.(e.v)
			if (k) { const n = keyName(k); return { text: n, known: n } }
			// 32 zero bytes of read-only memory: the System program id
			if (env.read && [0, 8, 16, 24].every(i => env.read!(e.v + BigInt(i), 8) === 0n)) return { text: 'SYSTEM_PROGRAM', known: 'SYSTEM_PROGRAM' }
		}
		const o = fo(e)
		if (o !== null) { const k = keyInFrame(o); if (k) return k }
		return { text: `*${wrap(env.expr(e))}`, src: e }
	}
	let program: { text: string; known?: string; src?: Expr }
	const accounts: Acc[] = []
	let nAcc: number | undefined, dataPtr: Expr | undefined, dataLen: Expr | undefined
	if (site.abi === 'c') {
		program = keyPtr(at(ix, 8))
		const metas = at(ix + 8, 8)
		nAcc = num(at(ix + 16, 8))
		dataPtr = at(ix + 24, 8); dataLen = at(ix + 32, 8)
		const mo = metas && fo(metas)
		if (nAcc !== undefined && mo !== undefined && mo !== null && nAcc <= 24) for (let i = 0; i < nAcc; i++) {
			const pk = at(mo + 16 * i, 8)
			accounts.push({ text: pk ? keyPtr(pk).known ?? env.expr(pk) : '?', w: num(at(mo + 16 * i + 8, 1)), s: num(at(mo + 16 * i + 9, 1)) })
		}
	} else {
		program = keyInFrame(ix + 48) ?? { text: '?' }
		nAcc = num(at(ix + 16, 8))
		dataPtr = at(ix + 24, 8); dataLen = at(ix + 40, 8)
		const metas = at(ix, 8), mo = metas && fo(metas)
		if (nAcc !== undefined && mo !== undefined && mo !== null && nAcc <= 24) for (let i = 0; i < nAcc; i++) {
			const b = mo + 34 * i
			accounts.push({ text: keyInFrame(b)?.text ?? '?', w: num(at(b + 33, 1)), s: num(at(b + 32, 1)) })
		}
	}
	const dl = num(dataLen)
	const seeds = describeSeeds(args[3], args[4], at, fo, env)
	const accText = (a: Acc) => `${a.text}${flags(a.w, a.s)}`
	// program id not constant: is it compared with a known id in this function?
	let check = ''
	if (!program.known && program.src && env.programCheck) {
		const ids = env.programCheck(program.src)
		check = ids.length ? ` (id compared with ${ids.join(' / ')} in this function)` : ' (id not a constant, and not compared with a known program id in this function)'
	}
	// well-known program: decode the instruction (accounts by role, data fields)
	const dOff = dataPtr ? fo(dataPtr) : null
	if (dl !== undefined && dOff !== null) {
		const fam = program.known ? FAMILY[program.known] : undefined
		const cands: Family[] = fam ? [fam] : program.known ? [] : [TOKEN, SYSTEM]
		for (const F of cands) {
			const tag = dl === 0 && F === ATA ? 0n : at(dOff, F.tagSize)
			if (tag?.k !== 'const' && !(dl === 0 && F === ATA)) continue
			const t = typeof tag === 'bigint' ? tag : (tag as { v: bigint }).v
			const lay = F.ixs[Number(t)]
			if (!lay) continue
			// a guess (program not constant) must match the data length and the account count exactly
			if (!fam && (lay.len === undefined || lay.len !== dl || (nAcc !== undefined && nAcc !== lay.accounts.length))) continue
			const parts: string[] = []
			accounts.forEach((a, i) => parts.push(`${lay.accounts[i] ?? `account${i}`}: ${accText(a)}`))
			if (!accounts.length && nAcc !== undefined && nAcc !== lay.accounts.length) parts.push(`${nAcc} accounts`)
			for (const [name, off, size] of lay.fields) {
				if (off >= dl) continue
				let v: string
				if (size === 'key') v = keyInFrame(dOff + off)?.text ?? '?'
				else { const e = at(dOff + off, size); v = e ? env.expr(e) : '?' }
				parts.push(`${name}: ${v}`)
			}
			const head = fam ? `${program.text}.${lay.name}` : `program ${program.text}${check} — data and accounts match ${F.label} ${lay.name}; if it is ${F.label}:`
			const family = program.known === 'TOKEN_2022_PROGRAM' ? 'token2022' : F === TOKEN ? 'token' : F === SYSTEM ? 'system' : F === ATA ? 'ata' : 'compute_budget'
			return { text: `CPI ${head} { ${parts.join(', ')} }${seeds ? `, ${seeds}` : ''}`, family, ix: lay.name, guessed: !fam }
		}
	}
	const parts = [`program ${program.text}${check}`]
	if (accounts.some(a => a.text !== '?' || a.w !== undefined)) parts.push(`accounts [${accounts.map(accText).join(', ')}]`)
	else if (nAcc !== undefined) parts.push(`${nAcc} account${nAcc === 1 ? '' : 's'}`)
	if (dl !== undefined) parts.push(`data ${dl} byte${dl === 1 ? '' : 's'}${dataPtr ? describeData(dataPtr, dl, at, fo, env) : ''}`)
	else if (dataPtr && dataLen) parts.push(`data ${wrap(env.expr(dataPtr))}[..${env.expr(dataLen)}]`)
	if (program.text === '?' && parts.length === 1) return undefined
	if (seeds) parts.push(seeds)
	return { text: `CPI: ${parts.join(', ')}` }
}

function flags(w: number | undefined, s: number | undefined): string {
	if (w === undefined || s === undefined) return ' (?)'
	const f = [w ? 'w' : '', s ? 's' : ''].filter(Boolean).join(',')
	return f ? ` (${f})` : ''
}

const wrap = (t: string) => (/^[\w.]+$/.test(t) ? t : `(${t})`)

function describeData(ptr: Expr, len: number, at: (o: number, size: number) => Expr | undefined, fo: (e: Expr) => number | null, env: CpiEnv): string {
	const o = fo(ptr)
	if (o === null || len === 0 || len > 256) return ''
	// the stores covering [o, o + len), in address order
	const items: string[] = []
	let p = o, first = true
	while (p < o + len && items.length < 12) {
		let e: Expr | undefined, size = 0
		for (const s of [8, 4, 2, 1]) if (p + s <= o + len && (e = at(p, s))) { size = s; break }
		if (!e) { if (items.length) items.push('?'); break }
		let t = `u${size * 8} ${env.expr(e)}`
		// an 8-byte constant first: an Anchor instruction discriminator
		if (first && e.k === 'const' && size === 8) { const n = env.constName?.(e.v); if (n && !t.includes('/*')) t += ` (${n})` }
		items.push(t)
		p += size; first = false
	}
	return items.length ? ` [${items.join(', ')}]` : ''
}

type At = (o: number, size: number) => Expr | undefined

/** One seed (ptr, len): a string, a known key, a key copied into the frame (`*src`), a small value (`u8 v`), or the bytes. */
function seedText(p: Expr, l: Expr, at: At, fo: (e: Expr) => number | null, env: CpiEnv): string {
	if (p.k === 'const' && l.k === 'const') {
		const s = env.strAt?.(p.v, l.v)
		if (s !== undefined) return JSON.stringify(s)
		if (l.v === 32n) { const k = env.keyAt?.(p.v); if (k) return KNOWN_KEYS[k] ?? `key ${k}` }
	}
	const o = fo(p)
	if (o !== null && l.k === 'const') {
		if (l.v === 32n) {
			// 32 bytes copied into the frame from one place: *src
			const w0 = at(o, 8)
			if (w0?.k === 'load' && [1, 2, 3].every(i => { const w = at(o + 8 * i, 8); return w?.k === 'load' && exprEq(w.addr, addOff(w0.addr, 8 * i)) })) return `*${wrap(env.expr(w0.addr))}`
		}
		if (l.v === 1n || l.v === 2n || l.v === 4n || l.v === 8n) { const v = at(o, Number(l.v)); if (v) return `u${Number(l.v) * 8} ${env.expr(v)}` }
	}
	return l.k === 'const' && l.v === 32n ? `*${wrap(env.expr(p))}` : `${wrap(env.expr(p))}[..${env.expr(l)}]`
}

/** Seeds of a PDA derivation (ptr: &[&[u8]] built in the frame, n seeds). */
function seedList(ptr: Expr, n: Expr, at: At, fo: (e: Expr) => number | null, env: CpiEnv): string | undefined {
	const o = fo(ptr)
	if (o === null || n?.k !== 'const' || n.v > 16n) return undefined
	const seeds: string[] = []
	for (let i = 0; i < Number(n.v); i++) {
		const p = at(o + 16 * i, 8), l = at(o + 16 * i + 8, 8)
		seeds.push(p && l ? seedText(p, l, at, fo, env) : '?')
	}
	return `[${seeds.join(', ')}]`
}

/** `PDA find_program_address([seeds], program)` for a PDA derivation whose seed list is built in the frame. */
function describePda(site: CpiSite, env: CpiEnv): string | undefined {
	const out = site.abi === 'pda_find_out' || site.abi === 'pda_create_out'
	const [seeds, n, prog] = out ? site.args.slice(1, 4) : site.args.slice(0, 3)
	if (!seeds || !n || !prog) return undefined
	const at = atFacts(site.facts)
	const fo = (e: Expr) => frameOff(e, env.fp)
	const list = seedList(seeds, n, at, fo, env)
	if (!list) return undefined
	let program = `*${wrap(env.expr(prog))}`
	if (prog.k === 'const') { const k = env.keyAt?.(prog.v); if (k) program = KNOWN_KEYS[k] ?? `key ${k}` }
	const kind = site.abi === 'pda_find' || site.abi === 'pda_find_out' ? 'find_program_address' : 'create_program_address'
	return `PDA ${kind}(${list}, program ${program})`
}

/** Frame contents at the site: exact facts, or constant bytes covering the range. */
function atFacts(facts: Fact[]): At {
	return (o, size) => {
		const f = facts.find(x => x.off === o && x.size === size)
		if (f) return f.e
		let v = 0n
		for (let i = size - 1; i >= 0; i--) {
			const b = facts.find(x => x.off <= o + i && o + i < x.off + x.size && x.e.k === 'const')
			if (b?.e.k !== 'const') return undefined
			v = (v << 8n) | ((b.e.v >> BigInt(8 * (o + i - b.off))) & 0xffn)
		}
		return { k: 'const', v }
	}
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
			seeds.push(p && l ? seedText(p, l, at, fo, env) : '?')
		}
		signers.push(`[${seeds.join(', ')}]`)
	}
	return `signer seeds ${signers.join(', ')}`
}

/**
 * core::fmt::Arguments built in the frame and passed to a call (format!, panic!, msg!): its first
 * field is the `&[&str]` of literal pieces, which lives in rodata.
 */
function describeFmt(site: CpiSite, env: CpiEnv): string | undefined {
	if (!env.read || !env.strAt) return undefined
	for (const a of site.args) {
		const o = frameOff(a, env.fp)
		if (o === null) continue
		const p = site.facts.find(x => x.off === o && x.size === 8)?.e, n = site.facts.find(x => x.off === o + 8 && x.size === 8)?.e
		if (p?.k !== 'const' || n?.k !== 'const' || n.v < 1n || n.v > 12n) continue
		const pieces: string[] = []
		for (let i = 0n; i < n.v; i++) {
			const sp = env.read(p.v + 16n * i, 8), sl = env.read(p.v + 16n * i + 8n, 8)
			if (sp === undefined || sl === undefined || sl > 200n) break
			const s = sl === 0n ? '' : env.strAt(sp, sl)
			if (s === undefined) break
			pieces.push(s)
		}
		if (pieces.length === Number(n.v) && pieces.some(s => s.length > 1)) return `fmt pieces ${JSON.stringify(pieces)}`
	}
	return undefined
}
