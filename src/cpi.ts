// Cross-program invocations (comments only: nothing here changes semantics).
//
// At a sol_invoke_signed_c / sol_invoke_signed_rust call (or a thin wrapper of one) whose instruction
// struct lives in the caller's frame, the constant parts of what is invoked are read back from the
// stores that built it and summarized in a comment. Instructions of well-known programs (SPL Token /
// Token-2022, System, Associated Token Account, Compute Budget, Stake) are decoded: accounts by role, data fields
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
// 'invoke': a library wrapper (out, &Instruction, account infos, count, [signer seeds]) (see cpiexec.ts)
export type SiteKind = 'c' | 'rust' | 'pda_find' | 'pda_create' | 'pda_find_out' | 'pda_create_out' | 'invoke' | 'call'
export interface CpiSite { abi: SiteKind; args: Expr[]; facts: Fact[]; t?: Extract<Stmt, { k: 'call' }>['t'] }

/** CPI call sites of a structured body, keyed by the node (statement / return) containing the call. */
export function findCpiSites(body: Node[], fp: number, abiOf: (t: Extract<Stmt, { k: 'call' }>['t']) => SiteKind | null): Map<Node, CpiSite> {
	const sites = new Map<Node, CpiSite>()
	const fo = (e: Expr): number | null => frameOff(e, fp)
	const hasCall = (e: Expr) => { let c = false; walkExpr(e, x => { if (x.k === 'call') c = true }); return c }
	// the variables and frame loads of each fact's expression, found once per expression (facts are
	// re-checked at every later assignment and store: walking them each time was quadratic in long
	// straight-line code; expressions are immutable)
	const info = new Map<Expr, { vars: Set<number>; loads: [number, number][] }>()
	const infoOf = (e: Expr) => {
		let r = info.get(e)
		if (!r) {
			const vars = new Set<number>(), loads: [number, number][] = []
			walkExpr(e, x => { if (x.k === 'var') vars.add(x.id); else if (x.k === 'load') { const lo = fo(x.addr); if (lo !== null) loads.push([lo, x.size]) } })
			info.set(e, (r = { vars, loads }))
		}
		return r
	}
	const mentions = (e: Expr, v: number) => infoOf(e).vars.has(v)
	/** does e load bytes that a frame store to [o, o + n) changes? */
	const readsChanged = (e: Expr, o: number, n: number) => infoOf(e).loads.some(([lo, size]) => lo < o + n && o < lo + size)
	const kill = (facts: Fact[], o: number, n: number) => facts.filter(f => !(f.off < o + n && o < f.off + f.size) && !readsChanged(f.e, o, n))
	const note = (n: Node, e: Expr | null, facts: Fact[]) => {
		if (!e) return
		walkExpr(e, x => {
			if (x.k !== 'call' || x.t.k === 'ind') return
			const abi = abiOf(x.t)
			if (abi && !sites.has(n) && ((abi !== 'call' && !abi.startsWith('pda')) || x.args.some(a => fo(a) !== null))) sites.set(n, { abi, args: x.args, facts: [...facts], t: x.t })
		})
	}
	const run = (ns: Node[], facts0: Fact[]): Fact[] => {
		let facts = [...facts0]
		for (const n of ns) {
			switch (n.k) {
				case 'stmt': {
					const s = n.s
					if (s.k === 'call') {
						if (s.t.k !== 'ind') { const abi = abiOf(s.t); if (abi && ((abi !== 'call' && !abi.startsWith('pda')) || s.args.some(a => fo(a) !== null))) sites.set(n, { abi, args: s.args, facts: [...facts], t: s.t }) }
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
	/** name of the function at a code address (formatter functions of fmt arguments) */
	fnAt?: (addr: bigint) => string | undefined
	/** an expression of the function's parameters in terms of its variables where one is defined as it (cpiexec.ts) */
	named?: (e: Expr) => Expr
	/** may the value derive from instruction data (taint.ts)? */
	tainted?: (e: Expr) => boolean
}

const IXD = ' [ix data?]'
/** anchor_lang::event::EVENT_IX_TAG (first 8 bytes of an emit_cpi! instruction's data, as u64) */
const EVENT_IX_TAG = 0x1d9acb512ea545e4n

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
// solana_stake_interface::instruction::StakeInstruction (bincode: u32 tag, then the fields); optional
// trailing accounts (a lockup custodian) are shown as accountN
const STAKE: Family = {
	label: 'Stake', tagSize: 4, ixs: {
		0: L('Initialize', ['stake', 'rent_sysvar'], [['staker', 4, 'key'], ['withdrawer', 36, 'key'], ['lockup_unix_timestamp', 68, 8], ['lockup_epoch', 76, 8], ['lockup_custodian', 84, 'key']], 116),
		1: L('Authorize', ['stake', 'clock_sysvar', 'authority'], [['new_authority', 4, 'key'], ['stake_authorize', 36, 4]], 40),
		2: L('DelegateStake', ['stake', 'vote', 'clock_sysvar', 'stake_history_sysvar', 'stake_config', 'stake_authority'], [], 4),
		3: L('Split', ['stake', 'split_stake', 'stake_authority'], [['lamports', 4, 8]], 12),
		4: L('Withdraw', ['stake', 'recipient', 'clock_sysvar', 'stake_history_sysvar', 'withdraw_authority'], [['lamports', 4, 8]], 12),
		5: L('Deactivate', ['stake', 'clock_sysvar', 'stake_authority'], [], 4),
		6: L('SetLockup', ['stake', 'authority'], []),
		7: L('Merge', ['destination_stake', 'source_stake', 'clock_sysvar', 'stake_history_sysvar', 'stake_authority'], [], 4),
		8: L('AuthorizeWithSeed', ['stake', 'authority_base', 'clock_sysvar'], [['new_authority', 4, 'key'], ['stake_authorize', 36, 4]]),
		9: L('InitializeChecked', ['stake', 'rent_sysvar', 'stake_authority', 'withdraw_authority'], [], 4),
		10: L('AuthorizeChecked', ['stake', 'clock_sysvar', 'authority', 'new_authority'], [['stake_authorize', 4, 4]], 8),
		11: L('AuthorizeCheckedWithSeed', ['stake', 'authority_base', 'clock_sysvar', 'new_authority'], [['stake_authorize', 4, 4]]),
		12: L('SetLockupChecked', ['stake', 'authority'], []),
		13: L('GetMinimumDelegation', [], [], 4),
		14: L('DeactivateDelinquent', ['stake', 'delinquent_vote', 'reference_vote'], [], 4),
		15: L('Redelegate', ['stake', 'uninitialized_stake', 'vote', 'stake_config', 'stake_authority'], [], 4),
		16: L('MoveStake', ['source_stake', 'destination_stake', 'stake_authority'], [['lamports', 4, 8]], 12),
		17: L('MoveLamports', ['source_stake', 'destination_stake', 'stake_authority'], [['lamports', 4, 8]], 12),
	},
}
const FAMILY: Record<string, Family> = { TOKEN_PROGRAM: TOKEN, TOKEN_2022_PROGRAM: TOKEN, SYSTEM_PROGRAM: SYSTEM, ASSOCIATED_TOKEN_PROGRAM: ATA, COMPUTE_BUDGET_PROGRAM: COMPUTE_BUDGET, STAKE_PROGRAM: STAKE }
/** The instruction layouts of the well-known programs (by the known-id label), for naming a program's own instructions. */
export const knownFamilies = (): [string, { label: string; ixs: Record<number, { name: string; accounts: string[] }> }][] => Object.entries(FAMILY)

/** A described CPI: the comment, and the decoded instruction of a well-known program (guessed: the program id is not a constant). */
export interface CpiDesc { text: string; family?: string; ix?: string; guessed?: boolean; parts?: CpiParts }
/** The decoded parts of a CPI (for the analysis, src/analysis): program, account metas by role, data fields, signer seeds. */
export interface CpiParts {
	program: string
	known?: string
	checked?: string // how a non-constant program id is checked (see formatIx)
	accounts: { role?: string; text: string; w?: number; s?: number }[]
	fields: [string, string][]
	seeds?: string
	src?: { program?: Expr; accounts: (Expr | undefined)[]; fields: (Expr | undefined)[] } // the expressions (at the call) the program id, account keys and fields come from (the analysis)
}

/** One-line description of a CPI site, or undefined when its instruction is not in the frame. */
export function describeCpi(site: CpiSite, env: CpiEnv): string | undefined { return cpiDesc(site, env)?.text }

export function cpiDesc(site: CpiSite, env: CpiEnv): CpiDesc | undefined {
	if (site.abi === 'call') { const t = describeFmt(site, env); return t ? { text: t } : undefined }
	if (site.abi === 'invoke') return undefined
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
	const keyPtr = (e: Expr | undefined): KeyText => {
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
	let program: KeyText
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
			accounts.push({ text: pk ? keyPtr(pk).known ?? env.expr(pk) : '?', w: num(at(mo + 16 * i + 8, 1)), s: num(at(mo + 16 * i + 9, 1)), src: pk })
		}
	} else {
		program = keyInFrame(ix + 48) ?? { text: '?' }
		nAcc = num(at(ix + 16, 8))
		dataPtr = at(ix + 24, 8); dataLen = at(ix + 40, 8)
		const metas = at(ix, 8), mo = metas && fo(metas)
		if (nAcc !== undefined && mo !== undefined && mo !== null && nAcc <= 24) for (let i = 0; i < nAcc; i++) {
			const b = mo + 34 * i
			const k = keyInFrame(b)
			accounts.push({ text: k?.text ?? '?', w: num(at(b + 33, 1)), s: num(at(b + 32, 1)), src: k?.src })
		}
	}
	const dl = num(dataLen)
	const seeds = describeSeeds(args[3], args[4], at, fo, env)
	const dOff = dataPtr ? fo(dataPtr) : null
	return formatIx({
		program, accounts, nAcc, dl, seeds,
		data: dOff === null ? undefined : { at: (o, size) => at(dOff + o, size), key: o => keyInFrame(dOff + o) },
		dataText: dl === undefined && dataPtr && dataLen ? `${wrap(env.expr(dataPtr))}[..${env.expr(dataLen)}]` : undefined,
	}, env)
}

/** A 32-byte key: its text (known name, `key <base58>`, `*src`), the known name, the address it was read from. */
export interface KeyText { text: string; known?: string; src?: Expr }
export interface Acc { text: string; w?: number; s?: number; src?: Expr }
/**
 * An instruction passed to a CPI, as far as it is known: program id, account metas, data (bytes
 * relative to the data start, when it is a known object), signer seeds (text).
 */
export interface IxModel {
	program: KeyText
	accounts: Acc[]
	nAcc?: number
	dl?: number
	data?: { at: At; key: (o: number) => KeyText | undefined }
	dataText?: string // data shown as ptr[..len] when the length is not a constant
	seeds?: string
	note?: string     // appended to the comment (how the instruction was found)
}

/** The comment for an instruction model: decoded for well-known programs (see FAMILY), else generic. */
export function formatIx(m: IxModel, env: CpiEnv): CpiDesc | undefined {
	const { program, accounts, nAcc, dl, data, seeds } = m
	const tail = (seeds ? `, ${seeds}` : '') + (m.note ? ` ${m.note}` : '')
	const accText = (a: Acc) => `${a.text}${flags(a.w, a.s)}`
	// program id not constant: is it compared with a known id in this function?
	let check = ''
	if (!program.known && program.src && env.tainted?.(program.src)) check += ' [id from ix data]'
	if (!program.known && program.src && env.programCheck) {
		const ids = env.programCheck(program.src)
		check += ids.length ? ` (id compared with ${ids.join(' / ')} in this function)` : ' (id not a constant, and not compared with a known program id in this function)'
	}
	// well-known program: decode the instruction (accounts by role, data fields)
	if (dl !== undefined && data) {
		const fam = program.known ? FAMILY[program.known] : undefined
		const cands: Family[] = fam ? [fam] : program.known ? [] : [TOKEN, SYSTEM]
		for (const F of cands) {
			// the instruction tag (an empty ATA instruction is Create)
			let tag: bigint | undefined
			if (dl === 0 && F === ATA) tag = 0n
			else { const e = data.at(0, F.tagSize); if (e?.k === 'const') tag = e.v }
			if (tag === undefined) continue
			const lay: IxLayout | undefined = F.ixs[Number(tag)]
			if (!lay) continue
			// a guess (program not constant) must match the data length and the account count exactly
			if (!fam && (lay.len === undefined || lay.len !== dl || (nAcc !== undefined && nAcc !== lay.accounts.length))) continue
			const parts: string[] = [], fields: [string, string][] = [], fsrc: (Expr | undefined)[] = []
			accounts.forEach((a, i) => parts.push(`${lay.accounts[i] ?? `account${i}`}: ${accText(a)}`))
			if (!accounts.length && nAcc !== undefined && nAcc !== lay.accounts.length) parts.push(`${nAcc} accounts`)
			for (const [name, off, size] of lay.fields) {
				if (off >= dl) continue
				let v: string
				if (size === 'key') { const k = data.key(off); v = (k?.text ?? '?') + (k?.src && env.tainted?.(k.src) ? IXD : ''); fsrc.push(k?.src) }
				else { const e = data.at(off, size); v = e ? env.expr(e) + (env.tainted?.(e) ? IXD : '') : '?'; fsrc.push(e) }
				parts.push(`${name}: ${v}`)
				fields.push([name, v])
			}
			const head = fam ? `${program.text}.${lay.name}` : `program ${program.text}${check} — data and accounts match ${F.label} ${lay.name}; if it is ${F.label}:`
			const family = program.known === 'TOKEN_2022_PROGRAM' ? 'token2022' : F === TOKEN ? 'token' : F === SYSTEM ? 'system' : F === ATA ? 'ata' : F === STAKE ? 'stake' : 'compute_budget'
			const cp: CpiParts = { program: program.text, known: program.known, checked: check.trim() || undefined, seeds: signerSeeds(seeds), fields, accounts: accounts.map((a, i) => ({ role: lay.accounts[i], text: a.text, w: a.w, s: a.s })), src: { program: program.src, accounts: accounts.map(a => a.src), fields: fsrc } }
			return { text: `CPI ${head} ${parts.length ? `{ ${parts.join(', ')} }` : '{}'}${tail}`, family, ix: lay.name, guessed: !fam, parts: cp }
		}
	}
	const parts = [`program ${program.text}${check}`]
	// Anchor emit_cpi!: data = EVENT_IX_TAG, then the event (discriminator, Borsh fields)
	const tag0 = dl !== undefined && dl >= 16 ? data?.at(0, 8) : undefined
	const event = tag0?.k === 'const' && tag0.v === EVENT_IX_TAG
	if (accounts.some(a => a.text !== '?' || a.w !== undefined)) parts.push(`accounts [${accounts.map(accText).join(', ')}]`)
	else if (nAcc !== undefined) parts.push(`${nAcc} account${nAcc === 1 ? '' : 's'}`)
	if (dl !== undefined) parts.push(`data ${dl} byte${dl === 1 ? '' : 's'}${data ? describeData(data.at, dl, env) : ''}`)
	else if (m.dataText) parts.push(`data ${m.dataText}`)
	if (program.text === '?' && parts.length === 1) return undefined
	return { text: `CPI${event ? ' emit_cpi! (Anchor event self-invocation)' : ''}: ${parts.join(', ')}${tail}`, parts: { program: program.text, known: program.known, checked: check.trim() || undefined, seeds: signerSeeds(seeds), fields: event ? [['event', 'emit_cpi!']] : [], accounts: accounts.map(a => ({ text: a.text, w: a.w, s: a.s })), src: { program: program.src, accounts: accounts.map(a => a.src), fields: [] } } }
}

/** signer seeds text of a CPI, undefined when it has none */
const signerSeeds = (s: string | undefined) => (s && !/^no signer seeds/.test(s) ? s.replace(/^signer seeds /, '') : undefined)

function flags(w: number | undefined, s: number | undefined): string {
	if (w === undefined || s === undefined) return ' (?)'
	const f = [w ? 'w' : '', s ? 's' : ''].filter(Boolean).join(',')
	return f ? ` (${f})` : ''
}

const wrap = (t: string) => (/^[\w.]+$/.test(t) ? t : `(${t})`)

function describeData(at: At, len: number, env: CpiEnv): string {
	const o = 0
	if (len === 0 || len > 256) return ''
	// the stores covering [o, o + len), in address order
	const items: string[] = []
	let p = o, first = true
	while (p < o + len && items.length < 12) {
		let e: Expr | undefined, size = 0
		for (const s of [8, 4, 2, 1]) if (p + s <= o + len && (e = at(p, s))) { size = s; break }
		if (!e) { if (items.length) items.push('?'); break }
		let t = first && size === 8 && e.k === 'const' && e.v === EVENT_IX_TAG ? 'EVENT_IX_TAG' : `u${size * 8} ${env.expr(e)}${env.tainted?.(e) ? IXD : ''}`
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
			if (w0?.k === 'load' && [1, 2, 3].every(i => { const w = at(o + 8 * i, 8); return w?.k === 'load' && exprEq(w.addr, addOff(w0.addr, 8 * i)) })) return `*${wrap(env.expr(w0.addr))}${env.tainted?.(w0.addr) ? IXD : ''}`
		}
		if (l.v === 1n || l.v === 2n || l.v === 4n || l.v === 8n) { const v = at(o, Number(l.v)); if (v) return `u${Number(l.v) * 8} ${env.expr(v)}${env.tainted?.(v) ? IXD : ''}` }
	}
	const mark = env.tainted?.(p) || env.tainted?.(l) ? IXD : ''
	return (l.k === 'const' && l.v === 32n ? `*${wrap(env.expr(p))}` : `${wrap(env.expr(p))}[..${env.expr(l)}]`) + mark
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
 * field is the `&[&str]` of literal pieces, which lives in rodata; another field is the `&[Argument]`
 * of (value pointer, formatter function) pairs, also built in the frame, and one more the optional
 * placeholder specs (None: the arguments fill the `{}` between the pieces in order):
 *   // fmt "Initializing global config with global authority {} and bump {}" {} = *v [fn_7d078], {} = ld8(j + 0x98) [u8_fmt]
 */
function describeFmt(site: CpiSite, env: CpiEnv): string | undefined {
	if (!env.read || !env.strAt) return undefined
	const word = (o: number) => site.facts.find(x => x.off === o && x.size === 8)?.e
	for (const a of site.args) {
		const o = frameOff(a, env.fp)
		if (o === null) continue
		const p = word(o), n = word(o + 8)
		if (p?.k !== 'const' || n?.k !== 'const' || n.v < 1n || n.v > 12n) continue
		const pieces: string[] = []
		for (let i = 0n; i < n.v; i++) {
			const sp = env.read(p.v + 16n * i, 8), sl = env.read(p.v + 16n * i + 8n, 8)
			if (sp === undefined || sl === undefined || sl > 200n) break
			const s = sl === 0n ? '' : env.strAt(sp, sl)
			if (s === undefined) break
			pieces.push(s)
		}
		if (pieces.length !== Number(n.v) || !pieces.some(s => s.length > 1)) continue
		const args = fmtArgs(site, o, env)
		if (!args) return `fmt pieces ${JSON.stringify(pieces)}`
		const list = args.list.map(x => `{} = ${x}`).join(', ')
		// no placeholder specs: pieces[0] {} pieces[1] {} … (as many {} as arguments)
		if (!args.specs && (pieces.length === args.list.length || pieces.length === args.list.length + 1)) {
			let s = ''
			pieces.forEach((x, i) => { s += x + (i < args.list.length ? '{}' : '') })
			return `fmt ${JSON.stringify(s)}${list ? ' ' + list : ''}`
		}
		return `fmt pieces ${JSON.stringify(pieces)} (with placeholder specs), arguments: ${args.list.join(', ') || '(none)'}`
	}
	return undefined
}

/**
 * The `&[Argument]` of a fmt::Arguments at frame offset o (after the pieces): a (frame pointer, count)
 * pair among the object's words whose entries are (value pointer, formatter function address); and
 * whether the placeholder-specs word (the remaining one) is set. Values: what the frame holds at the
 * value pointer (an 8-byte value, `*src` for 32 bytes copied from src), else `*ptr`; with the
 * formatter's name.
 */
function fmtArgs(site: CpiSite, o: number, env: CpiEnv): { list: string[]; specs: boolean } | undefined {
	const word = (k: number) => site.facts.find(x => x.off === k && x.size === 8)?.e
	// Arguments { pieces: &[&str], fmt: Option<&[Placeholder]>, args: &[Argument] } (48 bytes; pieces
	// first, the order of the other two is the compiler's)
	for (const k of [16, 32]) {
		const ap = word(o + k), an = word(o + k + 8)
		if (!ap || an?.k !== 'const' || an.v > 16n) continue
		const A = an.v === 0n ? null : frameOff(ap, env.fp)
		if (an.v !== 0n && A === null) continue
		const list: string[] = []
		let ok = true
		for (let i = 0; i < Number(an.v) && ok; i++) {
			const v = word(A! + 16 * i), f = word(A! + 16 * i + 8)
			const fn = f?.k === 'const' ? env.fnAt?.(f.v) : undefined
			if (!v || !fn) { ok = false; break }
			list.push(`${fmtValue(v, site, env)} [${fn}]`)
		}
		if (!ok) continue
		// the other field: the placeholder specs (pointer 0 = None)
		const s = word(o + (k === 16 ? 32 : 16))
		const specs = !(s?.k === 'const' && s.v === 0n)
		return { list, specs }
	}
	return undefined
}

/** A fmt argument's value pointer: what the frame holds there (see fmtArgs). */
function fmtValue(v: Expr, site: CpiSite, env: CpiEnv): string {
	const vo = frameOff(v, env.fp)
	if (vo !== null) {
		const at = (k: number, size: number) => site.facts.find(x => x.off === k && x.size === size)?.e
		const w0 = at(vo, 8)
		if (w0?.k === 'load' && w0.size === 8 && [1, 2, 3].every(i => { const w = at(vo + 8 * i, 8); return w?.k === 'load' && exprEq(w.addr, addOff(w0.addr, 8 * i)) })) return `*${wrap(env.expr(w0.addr))}`
		for (const size of [8, 4, 2, 1]) { const e = at(vo, size); if (e) return env.expr(e) }
	}
	return `*${wrap(env.expr(v))}`
}
