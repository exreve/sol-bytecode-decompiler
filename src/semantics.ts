// Solana-specific knowledge used for naming and comments. Nothing here changes semantics:
// it only chooses names and adds comments (or, with --sugar, equivalent compact renderings).
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import type { Program, Func } from './program.ts'
import { type Expr, walkExpr } from './ir.ts'
import { previewString } from './fingerprint.ts'

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
export function b58(b: Uint8Array): string {
	let n = 0n
	for (const x of b) n = n * 256n + BigInt(x)
	let s = ''
	while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n }
	for (const x of b) { if (x) break; s = '1' + s }
	return s
}
export function unb58(s: string): Uint8Array {
	let n = 0n
	for (const c of s) n = n * 58n + BigInt(B58.indexOf(c))
	const out: number[] = []
	while (n > 0n) { out.unshift(Number(n & 0xffn)); n >>= 8n }
	for (const c of s) { if (c !== '1') break; out.unshift(0) }
	while (out.length < 32) out.unshift(0)
	return new Uint8Array(out)
}

export const KNOWN_KEYS: Record<string, string> = {
	'11111111111111111111111111111111': 'SYSTEM_PROGRAM',
	TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: 'TOKEN_PROGRAM',
	TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: 'TOKEN_2022_PROGRAM',
	ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: 'ASSOCIATED_TOKEN_PROGRAM',
	MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr: 'MEMO_PROGRAM',
	Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo: 'MEMO_V1_PROGRAM',
	metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s: 'TOKEN_METADATA_PROGRAM',
	ComputeBudget111111111111111111111111111111: 'COMPUTE_BUDGET_PROGRAM',
	BPFLoaderUpgradeab1e11111111111111111111111: 'BPF_LOADER_UPGRADEABLE',
	BPFLoader2111111111111111111111111111111111: 'BPF_LOADER_2',
	BPFLoader1111111111111111111111111111111111: 'BPF_LOADER_1',
	SysvarC1ock11111111111111111111111111111111: 'SYSVAR_CLOCK',
	SysvarRent111111111111111111111111111111111: 'SYSVAR_RENT',
	Sysvar1nstructions1111111111111111111111111: 'SYSVAR_INSTRUCTIONS',
	SysvarRecentB1ockHashes11111111111111111111: 'SYSVAR_RECENT_BLOCKHASHES',
	SysvarEpochSchedu1e111111111111111111111111: 'SYSVAR_EPOCH_SCHEDULE',
	SysvarFees111111111111111111111111111111111: 'SYSVAR_FEES',
	SysvarS1otHashes111111111111111111111111111: 'SYSVAR_SLOT_HASHES',
	SysvarStakeHistory1111111111111111111111111: 'SYSVAR_STAKE_HISTORY',
	SysvarEpochRewards1111111111111111111111111: 'SYSVAR_EPOCH_REWARDS',
	SysvarLastRestartS1ot1111111111111111111111: 'SYSVAR_LAST_RESTART_SLOT',
	Stake11111111111111111111111111111111111111: 'STAKE_PROGRAM',
	Vote111111111111111111111111111111111111111: 'VOTE_PROGRAM',
	Config1111111111111111111111111111111111111: 'CONFIG_PROGRAM',
	AddressLookupTab1e1111111111111111111111111: 'ADDRESS_LOOKUP_TABLE_PROGRAM',
	Ed25519SigVerify111111111111111111111111111: 'ED25519_PROGRAM',
	KeccakSecp256k11111111111111111111111111111: 'SECP256K1_PROGRAM',
	So11111111111111111111111111111111111111112: 'WSOL_MINT',
	EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC_MINT',
	Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 'USDT_MINT',
	srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX: 'OPENBOOK_V1_PROGRAM',
	opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb: 'OPENBOOK_V2_PROGRAM',
	'675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'RAYDIUM_AMM_V4_PROGRAM',
	CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK: 'RAYDIUM_CLMM_PROGRAM',
	CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C: 'RAYDIUM_CPMM_PROGRAM',
	whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc: 'ORCA_WHIRLPOOL_PROGRAM',
	JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: 'JUPITER_V6_PROGRAM',
	LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo: 'METEORA_DLMM_PROGRAM',
	'6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P': 'PUMPFUN_PROGRAM',
	CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d: 'MPL_CORE_PROGRAM',
	BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY: 'BUBBLEGUM_PROGRAM',
	SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy: 'STAKE_POOL_PROGRAM',
	namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX: 'NAME_SERVICE_PROGRAM',
	rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ: 'PYTH_RECEIVER_PROGRAM',
	FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH: 'PYTH_ORACLE_PROGRAM',
	SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv: 'SWITCHBOARD_ONDEMAND_PROGRAM',
	SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf: 'SQUADS_V4_PROGRAM',
	MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD: 'MARINADE_PROGRAM',
	KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD: 'KAMINO_LEND_PROGRAM',
	dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH: 'DRIFT_PROGRAM',
	worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth: 'WORMHOLE_CORE_PROGRAM',
	wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb: 'WORMHOLE_TOKEN_BRIDGE',
	'4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg': 'MANGO_V4_PROGRAM',
	T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt: 'JITO_TIP_PROGRAM',
}

const PROGRAM_ERRORS = ['', 'Custom(0)', 'InvalidArgument', 'InvalidInstructionData', 'InvalidAccountData', 'AccountDataTooSmall',
	'InsufficientFunds', 'IncorrectProgramId', 'MissingRequiredSignature', 'AccountAlreadyInitialized', 'UninitializedAccount',
	'NotEnoughAccountKeys', 'AccountBorrowFailed', 'MaxSeedLengthExceeded', 'InvalidSeeds', 'BorshIoError', 'AccountNotRentExempt',
	'UnsupportedSysvar', 'IllegalOwner', 'MaxAccountsDataAllocationsExceeded', 'InvalidRealloc', 'MaxInstructionTraceLengthExceeded',
	'BuiltinProgramsMustConsumeComputeUnits', 'InvalidAccountOwner', 'ArithmeticOverflow', 'Immutable', 'IncorrectAuthority']

/** anchor_lang::error::ErrorCode */
const ANCHOR_ERRORS: Record<number, string> = {
	100: 'InstructionMissing', 101: 'InstructionFallbackNotFound', 102: 'InstructionDidNotDeserialize', 103: 'InstructionDidNotSerialize',
	1000: 'IdlInstructionStub', 1001: 'IdlInstructionInvalidProgram', 1002: 'IdlAccountNotEmpty', 1500: 'EventInstructionStub',
	2000: 'ConstraintMut', 2001: 'ConstraintHasOne', 2002: 'ConstraintSigner', 2003: 'ConstraintRaw', 2004: 'ConstraintOwner',
	2005: 'ConstraintRentExempt', 2006: 'ConstraintSeeds', 2007: 'ConstraintExecutable', 2008: 'ConstraintState', 2009: 'ConstraintAssociated',
	2010: 'ConstraintAssociatedInit', 2011: 'ConstraintClose', 2012: 'ConstraintAddress', 2013: 'ConstraintZero', 2014: 'ConstraintTokenMint',
	2015: 'ConstraintTokenOwner', 2016: 'ConstraintMintMintAuthority', 2017: 'ConstraintMintFreezeAuthority', 2018: 'ConstraintMintDecimals',
	2019: 'ConstraintSpace', 2020: 'ConstraintAccountIsNone', 2021: 'ConstraintTokenTokenProgram', 2022: 'ConstraintMintTokenProgram',
	2023: 'ConstraintAssociatedTokenTokenProgram',
	2500: 'RequireViolated', 2501: 'RequireEqViolated', 2502: 'RequireKeysEqViolated', 2503: 'RequireNeqViolated', 2504: 'RequireKeysNeqViolated',
	2505: 'RequireGtViolated', 2506: 'RequireGteViolated',
	3000: 'AccountDiscriminatorAlreadySet', 3001: 'AccountDiscriminatorNotFound', 3002: 'AccountDiscriminatorMismatch', 3003: 'AccountDidNotDeserialize',
	3004: 'AccountDidNotSerialize', 3005: 'AccountNotEnoughKeys', 3006: 'AccountNotMutable', 3007: 'AccountOwnedByWrongProgram',
	3008: 'InvalidProgramId', 3009: 'InvalidProgramExecutable', 3010: 'AccountNotSigner', 3011: 'AccountNotSystemOwned',
	3012: 'AccountNotInitialized', 3013: 'AccountNotProgramData', 3014: 'AccountNotAssociatedTokenAccount', 3015: 'AccountSysvarMismatch',
	3016: 'AccountReallocExceedsLimit', 3017: 'AccountDuplicateReallocs', 4100: 'DeclaredProgramIdMismatch', 4101: 'TryingToInitPayerAsProgramAccount',
	4102: 'InvalidNumericConversion', 5000: 'Deprecated',
}

const sha8 = (s: string) => createHash('sha256').update(s).digest().readBigUInt64LE(0)
const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').toLowerCase()

interface SelDb { names: Record<string, string>; verbs: string[]; nouns: string[] }
let selDb: SelDb | null | undefined
function selectors(): SelDb | null {
	if (selDb !== undefined) return selDb
	const p = fileURLToPath(new URL('../data/selectors.json.gz', import.meta.url))
	selDb = existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString()) : null
	return selDb
}

export class Semantics {
	p: Program
	keyChunks = new Map<bigint, string>()     // u64 chunk of a well-known key -> comment
	keyAddrs = new Map<bigint, string>()      // rodata address of a 32-byte known key -> name
	disc = new Map<bigint, string>()          // 8-byte discriminator value -> "ix:swap" / "account:Pool"
	ixNames = new Map<number, string>()       // handler function pc -> instruction name (logs exactly one "Instruction: X")
	processors = new Map<number, string[]>()  // function pc -> instruction names handled inline (native dispatchers)
	ixLogs = new Map<number, string[]>()
	logSites: { fpc: number; block: number; stmt: number; name: string }[] = []
	anchor = false
	constructor(p: Program) {
		this.p = p
		for (const r of p.image.regions) if (!r.exec && Buffer.from(r.bytes).includes('AnchorError occurred')) this.anchor = true
		for (const [k, n] of Object.entries(KNOWN_KEYS)) {
			const b = unb58(k)
			if (k.startsWith('1111')) continue // all-zero chunks are too common to annotate
			const dv = new DataView(b.buffer)
			for (let i = 0; i < 4; i++) this.keyChunks.set(dv.getBigUint64(i * 8, true), i === 0 ? n : `${n}[${i}]`)
		}
		this.scanRodata()
		this.scanInstructionLogs()
		this.classifyInstructionLogs()
	}

	/** Known keys stored in rodata; identifier-like strings as discriminator dictionary. */
	scanRodata() {
		const known = new Map<string, string>()
		for (const [k, n] of Object.entries(KNOWN_KEYS)) known.set(Buffer.from(unb58(k)).toString('hex'), n)
		const words = new Set<string>()
		for (const r of this.p.image.regions) {
			if (r.exec) continue
			const b = r.bytes
			for (let o = 0; o + 32 <= b.length; o += 1) {
				if (o % 1 === 0) {
					const h = known.get(Buffer.from(b.subarray(o, o + 32)).toString('hex'))
					if (h && !h.startsWith('SYSTEM')) this.keyAddrs.set(r.vaddr + BigInt(o), h)
				}
			}
			// identifier-like words
			const s = Buffer.from(b).toString('latin1')
			for (const m of s.matchAll(/[A-Za-z][A-Za-z0-9_]{2,40}/g)) words.add(m[0])
		}
		// Anchor: account/event discriminators from type names; instruction from snake names
		for (const w of words) {
			// strings in rodata are concatenated; split CamelCase runs into candidate names too
			const parts = w.match(/[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*/g) ?? []
			for (const x of [w, ...parts]) {
				this.disc.set(sha8(`account:${x}`), `account:${x}`)
				this.disc.set(sha8(`event:${x}`), `event:${x}`)
				this.disc.set(sha8(`global:${snake(x)}`), `ix:${snake(x)}`)
			}
		}
		const db = selectors()
		if (db) for (const [h, n] of Object.entries(db.names)) {
			const v = Buffer.from(h, 'hex').readBigUInt64LE(0)
			if (this.disc.has(v)) continue
			this.disc.set(v, n.startsWith('i:') ? `ix:${n.slice(2)}` : n.startsWith('a:') ? `account:${n.slice(2)}` : `event:${n.slice(2)}`)
		}
	}

	/** Anchor handlers log "Instruction: Name" — use that to name the handler function. */
	scanInstructionLogs() {
		for (const f of this.p.funcs.values()) {
			for (const b of f.blocks) for (const s of b.stmts) {
				if (s.k !== 'call' || s.t.k !== 'sys' || s.t.name !== 'sol_log_') continue
				// the message pointer is set by an lddw earlier in the same block
				let ptr: bigint | undefined, len: bigint | undefined
				for (const x of b.stmts) {
					if (x === s) break
					if (x.k === 'set' && x.e.k === 'const') { if (x.dst === 1) ptr = x.e.v; if (x.dst === 2) len = x.e.v }
				}
				if (ptr === undefined || len === undefined || len > 200n) continue
				const bytes = this.p.image.bytesAt(ptr, Number(len))
				const m = bytes && /^Instruction: ([A-Za-z0-9_]+)$/.exec(Buffer.from(bytes).toString('latin1'))
				if (m) {
					let l = this.ixLogs.get(f.pc); if (!l) this.ixLogs.set(f.pc, (l = []))
					if (!l.includes(snake(m[1]))) l.push(snake(m[1]))
					this.logSites.push({ fpc: f.pc, block: b.id, stmt: b.stmts.indexOf(s), name: snake(m[1]) })
				}
			}
		}
	}

	classifyInstructionLogs() {
		for (const [pc, names] of this.ixLogs) {
			if (names.length === 1) this.ixNames.set(pc, names[0])
			else this.processors.set(pc, names)
		}
		// in a processor, the first sizeable function called right after `log("Instruction: X")` handles X
		const callers = new Map<number, Set<number>>()
		for (const f of this.p.funcs.values()) for (const b of f.blocks) for (const s of b.stmts)
			if (s.k === 'call' && s.t.k === 'fn') { let c = callers.get(s.t.pc); if (!c) callers.set(s.t.pc, (c = new Set())); c.add(f.pc) }
		const found = new Map<number, string>()
		const dup = new Set<number>()
		for (const site of this.logSites) {
			if (!this.processors.has(site.fpc)) continue
			const f = this.p.funcs.get(site.fpc)!
			let b = f.blocks[site.block], i = site.stmt + 1
			for (let hops = 0; hops < 6 && b; hops++) {
				let hit: number | undefined
				for (; i < b.stmts.length; i++) {
					const s = b.stmts[i]
					if (s.k !== 'call' || s.t.k !== 'fn') continue
					const g = this.p.funcs.get(s.t.pc)
					let size = 0
					if (g) for (const gb of g.blocks) size += gb.end - gb.start + 1
					if (g && !g.noreturn && size >= 40 && callers.get(g.pc)?.size === 1) { hit = g.pc; break }
				}
				if (hit !== undefined) { if (found.has(hit) && found.get(hit) !== site.name) dup.add(hit); found.set(hit, site.name); break }
				if (b.term.k !== 'jmp') break
				b = f.blocks[b.term.to]; i = 0
			}
		}
		const taken = new Set(this.ixNames.values())
		for (const [pc, name] of found) if (!dup.has(pc) && !taken.has(name) && !this.ixNames.has(pc)) { this.ixNames.set(pc, name); taken.add(name) }
	}

	/** Resolve remaining discriminator-looking constants by expanding the verb x noun vocabulary. */
	resolveCandidates(values: Iterable<bigint>) {
		const db = selectors()
		const want = new Set<bigint>()
		for (const v of values) if (!this.disc.has(v) && looksRandom(v)) want.add(v)
		if (!db || !want.size) return
		for (const verb of db.verbs) {
			for (const n of ['', ...db.nouns]) {
				const name = n ? `${verb}_${n}` : verb
				for (const nm of [name, name + '_v2']) {
					const h = sha8(`global:${nm}`)
					if (want.has(h)) { this.disc.set(h, `ix:${nm}`); want.delete(h); if (!want.size) return }
				}
			}
		}
	}

	discOf(ix: string): bigint { return sha8(`global:${ix}`) }

	syscallName(n: string): string { return this.p.syscalls.get(n)?.alias ?? n }

	constComment(v: bigint, role: 'value' | 'addr' | 'ret' = 'value'): string | undefined {
		const d = looksRandom(v) ? this.disc.get(v) : undefined
		if (d) return d
		if (role === 'addr') return undefined
		if (this.anchor && v >= 100n && v <= 5000n && ANCHOR_ERRORS[Number(v)]) return `anchor::${ANCHOR_ERRORS[Number(v)]}`
		const k = this.keyAddrs.get(v)
		if (k) return `&${k}`
		const c = this.keyChunks.get(v)
		if (c) return c
		if (role === 'ret' && (v & 0xffffffffn) === 0n && v >> 32n > 0n && v >> 32n < BigInt(PROGRAM_ERRORS.length)) return `ProgramError::${PROGRAM_ERRORS[Number(v >> 32n)]}`
		return undefined
	}

	strAt(ptr: bigint, len: bigint): string | undefined {
		if (len < 1n || len > 512n || !this.p.image.region(ptr, Number(len))) return undefined
		const b = this.p.image.bytesAt(ptr, Number(len))
		if (!b) return undefined
		const s = new TextDecoder('utf-8', { fatal: false }).decode(b)
		let printable = 0
		for (const ch of s) if (ch >= ' ' && ch !== '\ufffd') printable++
		return printable >= s.length * 0.9 ? s : undefined
	}

	sugar(_e: Expr, _pr: (e: Expr, prec: number) => string): string | undefined { return undefined }
	funcComment(f: Func): string | undefined {
		const ix = this.ixNames.get(f.pc)
		if (ix) return this.anchor ? `instruction handler: ${ix} (discriminator sha256("global:${ix}")[..8] = 0x${sha8(`global:${ix}`).toString(16)})` : `instruction handler: ${ix}`
		const pr = this.processors.get(f.pc)
		if (pr) return `instruction processor (handles inline, see its "Instruction: X" logs): ${pr.join(', ')}`
		return undefined
	}
	header(): string { return '' }
}

function looksRandom(v: bigint): boolean {
	let pc = 0, x = v
	while (x) { pc += Number(x & 1n); x >>= 1n }
	return pc >= 18 && pc <= 46 && v > 0xffffffffffffn
}

export function constsIn(e: Expr, out: Set<bigint>) { walkExpr(e, x => { if (x.k === 'const') out.add(x.v) }) }
