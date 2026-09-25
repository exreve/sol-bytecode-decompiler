// Solana-specific knowledge used for naming and comments. Nothing here changes semantics:
// it only chooses names and adds comments (or, with --sugar, equivalent compact renderings).
import { createHash } from 'node:crypto'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { gunzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import type { Program, Func } from './program.ts'
import type { Image } from './elf.ts'
import { type Expr, walkExpr } from './ir.ts'
import { previewString } from './fingerprint.ts'
import type { IdlInfo } from './idl.ts'

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

/** 0x8000_0000_0000_0000: first niche value of Result<_, ProgramError> (see noteResultCompares) */
export const NICHE = 0x8000000000000000n
/** Ok tags of the u32-tagged Result<(), ProgramError> (variant counts of ProgramError over versions) */
export const OK_TAGS = [0x12n, 0x14n, 0x15n, 0x16n, 0x18n, 0x1an]
const HEAP_CURSOR = 0x300000000n // the bump allocator keeps its current (downward-growing) pointer here

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
	idl?: IdlInfo
	constructor(p: Program, idl?: IdlInfo) {
		this.p = p
		this.idl = idl
		for (const r of p.image.regions) if (!r.exec && Buffer.from(r.bytes.buffer, r.bytes.byteOffset, r.bytes.byteLength).includes('AnchorError occurred')) this.anchor = true
		for (const [k, n] of Object.entries(KNOWN_KEYS)) {
			const b = unb58(k)
			if (k.startsWith('1111')) continue // all-zero chunks are too common to annotate
			const dv = new DataView(b.buffer)
			for (let i = 0; i < 4; i++) this.keyChunks.set(dv.getBigUint64(i * 8, true), i === 0 ? n : `${n}[${i}]`)
		}
		this.scanRodata()
		if (idl) for (const [v, n] of idl.discs) this.disc.set(v, n)
		this.scanInstructionLogs()
		this.classifyInstructionLogs()
	}

	/** Known keys stored in rodata; identifier-like strings as discriminator dictionary. */
	scanRodata() {
		const known = new Map<string, string>()
		// first 4 bytes of every known key: only offsets starting with one of them can match, so the
		// 32-byte hex lookup is done for those alone (same matches, same order)
		const prefixes = new Set<number>()
		for (const [k, n] of Object.entries(KNOWN_KEYS)) {
			const kb = Buffer.from(unb58(k))
			known.set(kb.toString('hex'), n)
			prefixes.add(kb.readUInt32LE(0))
		}
		const words = new Set<string>()
		for (const r of this.p.image.regions) {
			if (r.exec) continue
			const b = r.bytes
			for (let o = 0; o + 32 <= b.length; o += 1) {
				if (!prefixes.has((b[o] | b[o + 1] << 8 | b[o + 2] << 16 | b[o + 3] << 24) >>> 0)) continue
				const h = known.get(Buffer.from(b.subarray(o, o + 32)).toString('hex'))
				if (h && !h.startsWith('SYSTEM')) this.keyAddrs.set(r.vaddr + BigInt(o), h)
			}
			// identifier-like words
			const s = Buffer.from(b.buffer, b.byteOffset, b.byteLength).toString('latin1') // view, no copy
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
		const want: bigint[] = []
		for (const v of values) if (!this.disc.has(v) && looksRandom(v)) want.push(v)
		if (!want.length) return
		const table = vocabTable()
		if (!table) return
		for (const v of want) {
			const name = table.lookup(v)
			if (name) this.disc.set(v, `ix:${name}`)
		}
	}

	discOf(ix: string): bigint { return sha8(`global:${ix}`) }

	syscallName(n: string): string { return this.p.syscalls.get(n)?.alias ?? n }

	/**
	 * Result<_, ProgramError> in memory: ProgramError's String-carrying variant (BorshIoError) makes
	 * the other variants niche values 0x8000_0000_0000_0000 + variant index, and Ok the next one
	 * (= the number of variants, which depends on the solana-program version). The Ok value is the
	 * one results are compared against: the most frequent such constant in == / != comparisons.
	 */
	resultOk?: bigint
	noteResultCompares(counts: Map<bigint, number>) {
		let best: bigint | undefined, n = 0
		for (const [v, c] of counts) if (c > n || (c === n && best !== undefined && v > best)) { best = v; n = c }
		if (best !== undefined && n >= 3 && best >= NICHE + 0x10n && best < NICHE + BigInt(PROGRAM_ERRORS.length)) this.resultOk = best
	}

	/**
	 * Result<(), ProgramError> before the niche layout: a u32 variant tag at +0 (ProgramError variant
	 * index; Custom(code) = 0 with the code at +4) and Ok = the number of variants, which depends on
	 * the solana-program version: the most frequent such constant compared with a 32-bit load.
	 */
	resultOkTag?: bigint
	noteResultTags(compares: Map<bigint, number>, stores: Map<bigint, number>) {
		let best: bigint | undefined, n = 0
		for (const [v, c] of compares) if (c > n) { best = v; n = c }
		// compared and stored as a u32 somewhere
		if (best !== undefined && stores.has(best)) this.resultOkTag = best
	}
	/** name of u32 tag v stored where the Ok tag is stored too */
	resultTagName(v: bigint): string | undefined {
		const ok = this.resultOkTag
		if (ok === undefined || v > ok) return undefined
		return v === ok ? 'Ok' : v === 0n ? 'Err(ProgramError::Custom(u32 at +4))' : `Err(ProgramError::${PROGRAM_ERRORS[Number(v) + 1]})`
	}

	constComment(v: bigint, role: 'value' | 'addr' | 'ret' = 'value'): string | undefined {
		const d = looksRandom(v) ? this.disc.get(v) : undefined
		if (d) return d
		if (v === HEAP_CURSOR) return 'heap bump-allocator cursor'
		if (role === 'addr') return undefined
		if (this.resultOk !== undefined && v > NICHE && v <= this.resultOk) return v === this.resultOk ? 'Ok' : `Err(ProgramError::${PROGRAM_ERRORS[Number(v - NICHE) + 1]})`
		if (this.anchor && v >= 100n && v <= 5000n && ANCHOR_ERRORS[Number(v)]) return `anchor::${ANCHOR_ERRORS[Number(v)]}`
		if (this.idl && v >= 6000n && v < 0x10000n && this.idl.errors.has(Number(v))) return `error::${this.idl.errors.get(Number(v))}`
		const k = this.keyAddrs.get(v)
		if (k) return `&${k}`
		const c = this.keyChunks.get(v)
		if (c) return c
		if (role === 'ret' && (v & 0xffffffffn) === 0n && v >> 32n > 0n && v >> 32n < BigInt(PROGRAM_ERRORS.length)) return `ProgramError::${PROGRAM_ERRORS[Number(v >> 32n)]}`
		return undefined
	}

	/** Anchor framework error (anchor_lang ErrorCode) or custom program error named by the IDL, for an error code constant */
	anchorError(v: bigint): string | undefined {
		if (!this.anchor) return undefined
		if (v >= 100n && v <= 5000n && ANCHOR_ERRORS[Number(v)]) return ANCHOR_ERRORS[Number(v)]
		if (this.idl && v >= 6000n && v < 0x10000n) return this.idl.errors.get(Number(v))
		return undefined
	}

	/** base58 of 32 non-text bytes in rodata at ptr (a public key compared or copied by address) */
	keyAt(ptr: bigint): string | undefined {
		const r = this.p.image.region(ptr, 32)
		if (!r || r.exec || this.strAt(ptr, 32n) !== undefined) return undefined
		const b = this.p.image.bytesAt(ptr, 32)
		return b && b.some(x => x !== 0) ? b58(b) : undefined
	}

	strAt(ptr: bigint, len: bigint): string | undefined {
		// (tiny values are counts and flags, not rodata addresses, even where rodata is mapped at 0)
		if (len < 1n || len > 512n || ptr < 0x100n || !this.p.image.region(ptr, Number(len))) return undefined
		const b = this.p.image.bytesAt(ptr, Number(len))
		if (!b) return undefined
		const s = UTF8.decode(b)
		let printable = 0
		for (const ch of s) if (ch >= ' ' && ch !== '\ufffd') printable++
		return printable >= s.length * 0.9 ? s : undefined
	}

	/**
	 * A string literal that denotes exactly (ptr, len) in the output: the bytes are valid UTF-8 and
	 * ptr is the first occurrence of those bytes in program memory (see stringAddr), so the literal
	 * determines the address.
	 */
	strLit(ptr: bigint, len: bigint): string | undefined {
		const s = this.strAt(ptr, len)
		if (s === undefined || s.includes('\ufffd')) return undefined
		const b = this.p.image.bytesAt(ptr, Number(len))!
		if (!Buffer.from(s, 'utf8').equals(Buffer.from(b.buffer, b.byteOffset, b.byteLength))) return undefined
		return stringAddr(this.p.image, s) === ptr ? s : undefined
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

// one decoder for all strAt calls (a non-streaming decode keeps no state between calls)
const UTF8 = new TextDecoder('utf-8', { fatal: false })

function looksRandom(v: bigint): boolean {
	// (the size test first: most constants are small; then the population count of the two 32-bit
	// halves, the same count as bit by bit for values below 2^64)
	if (!(v > 0xffffffffffffn)) return false
	let pc = 0
	if (v < 1n << 64n) pc = popcount32(Number(v & 0xffffffffn)) + popcount32(Number(v >> 32n))
	else { let x = v; while (x) { pc += Number(x & 1n); x >>= 1n } }
	return pc >= 18 && pc <= 46
}
function popcount32(x: number): number {
	x = x - ((x >>> 1) & 0x55555555)
	x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
	return (Math.imul((x + (x >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24)
}

/** Address of the first occurrence of the UTF-8 bytes of `s` in program memory (regions in address order). */
const strCache = new WeakMap<Image, Map<string, bigint | undefined>>()
export function stringAddr(image: Image, s: string): bigint | undefined {
	let m = strCache.get(image)
	if (!m) strCache.set(image, (m = new Map()))
	if (m.has(s)) return m.get(s)
	const needle = Buffer.from(s, 'utf8')
	let at: bigint | undefined
	for (const r of image.regions) {
		if (!mayContain(r, needle)) continue // (no occurrence: indexOf would return -1)
		const i = Buffer.from(r.bytes.buffer, r.bytes.byteOffset, r.bytes.byteLength).indexOf(needle)
		if (i >= 0) { at = r.vaddr + BigInt(i); break }
	}
	m.set(s, at)
	return at
}

/**
 * Filter for the byte search in large regions (the code comes first in address order, so every
 * string used to be searched for in all of it): a bit per 24-bit hash of each 4-byte window of the
 * region. A needle occurring in the region has all its windows there, so when one of its windows'
 * bits is clear it does not occur. Never a false "no"; small regions and needles shorter than 4
 * bytes are just searched.
 */
const windowBits = new WeakMap<Uint8Array, Uint32Array>()
const winHash = (b: Uint8Array, i: number) => Math.imul(b[i] | b[i + 1] << 8 | b[i + 2] << 16 | b[i + 3] << 24, 0x9e3779b1) >>> 8
function mayContain(r: { bytes: Uint8Array }, needle: Uint8Array): boolean {
	const b = r.bytes
	if (b.length < 0x10000 || needle.length < 4) return true
	let bits = windowBits.get(b)
	if (!bits) {
		bits = new Uint32Array(1 << 19)
		for (let i = 0; i + 4 <= b.length; i++) { const h = winHash(b, i); bits[h >>> 5] |= 1 << (h & 31) }
		windowBits.set(b, bits)
	}
	for (let i = 0; i + 4 <= needle.length; i++) { const h = winHash(needle, i); if (!((bits[h >>> 5] >>> (h & 31)) & 1)) return false }
	return true
}

export function constsIn(e: Expr, out: Set<bigint>) { walkExpr(e, x => { if (x.k === 'const') out.add(x.v) }) }

/** Expanded vocabulary ("<verb>[_<noun>][_v2]") as a sorted table of discriminators, cached on disk. */
let vocab: { lookup: (v: bigint) => string | undefined } | null | undefined
function vocabTable() {
	if (vocab !== undefined) return vocab
	const db = selectors()
	if (!db) return (vocab = null)
	// names[i] in verb-major order (verb, verb_v2, verb_noun0, verb_noun0_v2, ...), computed on demand
	// instead of materializing all verbs x (nouns + 1) x 2 strings on every run
	const per = 2 * (db.nouns.length + 1)
	const count0 = db.verbs.length * per
	const nameAt = (i: number) => {
		const verb = db.verbs[Math.floor(i / per)], r = i % per, noun = r >> 1 ? db.nouns[(r >> 1) - 1] : ''
		const nm = noun ? `${verb}_${noun}` : verb
		return r & 1 ? nm + '_v2' : nm
	}
	const key = createHash('sha1').update(count0 + ':' + db.verbs.join() + db.nouns.slice(0, 50).join()).digest('hex').slice(0, 12)
	const dir = join(homedir(), '.cache', 'sbpf-decompiler')
	const file = join(dir, `vocab-${key}.bin`)
	let buf: Buffer
	if (existsSync(file)) buf = readFileSync(file)
	else {
		// entries: u64 hash (LE) + u32 index into names, sorted by hash
		const n = count0
		const hs = new BigUint64Array(n)
		for (let i = 0; i < n; i++) hs[i] = sha8(`global:${nameAt(i)}`)
		const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => (hs[a] < hs[b] ? -1 : hs[a] > hs[b] ? 1 : 0))
		buf = Buffer.alloc(n * 12)
		idx.forEach((i, k) => { buf.writeBigUInt64LE(hs[i], k * 12); buf.writeUInt32LE(i, k * 12 + 8) })
		try { mkdirSync(dir, { recursive: true }); writeFileSync(file, buf) } catch { /* cache is optional */ }
	}
	const count = buf.length / 12
	vocab = {
		lookup(v: bigint) {
			let lo = 0, hi = count - 1
			while (lo <= hi) {
				const mid = (lo + hi) >> 1, h = buf.readBigUInt64LE(mid * 12)
				if (h === v) return nameAt(buf.readUInt32LE(mid * 12 + 8))
				if (h < v) lo = mid + 1; else hi = mid - 1
			}
			return undefined
		},
	}
	return vocab
}
