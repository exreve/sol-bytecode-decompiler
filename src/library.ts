// Library code recognition. Functions whose fingerprint occurs in many unrelated mainnet
// programs (data/libsigs.json) are generic library code (Rust std, solana-program, borsh,
// anchor-lang, spl, ...). In the default output they are not decompiled: callers see a
// typed `declare function` stub with a behavioral name/hint instead.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Program, Func } from './program.ts'
import { fingerprint, previewString } from './fingerprint.ts'
import { crateOf } from './demangle.ts'

export const MIN_LIB_INSNS = 6

interface LibDb { programs: number; families: number; sigs: Record<string, [number, number]> }
let db: LibDb | null | undefined

export function libDb(): LibDb | null {
	if (db !== undefined) return db
	const path = fileURLToPath(new URL('../data/libsigs.json', import.meta.url))
	db = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null
	return db
}

export interface LibInfo { lib: boolean; families: number; name?: string; hint?: string }

const STRING_NAMES: [RegExp, string][] = [
	[/^called `Option::unwrap\(\)` on a `None`/, 'panic_unwrap_none'],
	[/^called `Result::unwrap\(\)` on an `Err`/, 'panic_unwrap_err'],
	[/^capacity overflow/, 'panic_capacity_overflow'],
	[/^attempt to (add|subtract|multiply|divide|negate|shift)/, 'panic_arith_overflow'],
	[/^already (mutably )?borrowed/, 'panic_already_borrowed'],
	[/index out of bounds/, 'panic_bounds_check'],
	[/^memory allocation of|^Error: memory allocation failed/, 'alloc_error'],
	[/^a formatting trait implementation returned an error/, 'fmt_format'],
	[/^Unable to find a viable program address bump seed/, 'find_program_address'],
	[/^AnchorError occurred/, 'anchor_error_log'],
	[/^ProgramError occurred/, 'program_error_log'],
]

/** Name library functions by observable behavior (syscalls used, strings referenced, heap use). */
export function behaviorName(p: Program, f: Func, strings: string[]): string | undefined {
	for (const s of strings) for (const [re, n] of STRING_NAMES) if (re.test(s)) return n
	const sys = new Set<string>()
	let calls = 0, heap = false
	for (const b of f.blocks) for (const s of b.stmts) {
		if (s.k === 'call') { calls++; if (s.t.k === 'sys') sys.add(s.t.name) }
		const scan = (e: any) => { if (e && typeof e === 'object') { if (e.k === 'const' && e.v === 0x3_0000_0000n) heap = true; for (const k in e) if (typeof e[k] === 'object') scan(e[k]) } }
		scan(s)
	}
	const only = (n: string) => sys.size === 1 && sys.has(n)
	if (only('sol_memcpy_')) return 'memcpy'
	if (only('sol_memmove_')) return 'memmove'
	if (only('sol_memset_')) return 'memset'
	if (only('sol_memcmp_')) return 'memcmp'
	if (sys.has('sol_invoke_signed_rust') || sys.has('sol_invoke_signed_c')) return 'invoke_signed'
	if (sys.has('sol_try_find_program_address')) return 'find_program_address'
	if (sys.has('sol_create_program_address')) return 'create_program_address'
	if (sys.has('sol_get_rent_sysvar')) return 'rent_get'
	if (sys.has('sol_get_clock_sysvar')) return 'clock_get'
	if (sys.has('sol_log_data')) return 'log_data'
	if (sys.has('sol_set_return_data')) return 'set_return_data'
	if (sys.has('sol_sha256')) return 'sha256'
	if (heap && calls === 0) return 'heap_alloc'
	if (f.noreturn && (sys.has('abort') || sys.has('sol_panic_'))) return 'panic'
	if (f.noreturn) return 'panic_fmt'
	if (sys.has('sol_log_')) return 'log'
	return undefined
}

let names: Record<string, string> | null | undefined
export function libNames(): Record<string, string> | null {
	if (names !== undefined) return names
	const path = fileURLToPath(new URL('../data/libnames.json', import.meta.url))
	names = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null
	return names
}

/** Crates that are runtime/framework plumbing for every program: always shown as stubs. */
const GENERIC = /^(core|alloc|std|compiler_builtins|solana_[a-z0-9_]+|borsh[a-z0-9_]*|anchor_lang|anchor_spl|bs58|bytemuck[a-z_]*|hashbrown|num_[a-z_]+|thiserror|arrayref|bincode|serde[a-z_]*|curve25519_dalek|ark_[a-z_]+|sha2|sha3|blake3|keccak|base64|memchr|itoa|ryu|getrandom|rand[a-z_]*|spl_discriminator|spl_pod|spl_type_length_value|spl_program_error|spl_tlv_account_resolution|pinocchio[a-z_]*|light_[a-z_]+|hex|byteorder|static_assertions|five8[a-z_]*|uint|primitive_types|fixed|rust_decimal)$/

/** Turn a Rust path into a short identifier: `<a::B as c::D>::f` -> `B_f`, `a::b::c` -> `b_c`. */
export function identFromPath(name: string): string {
	let n = name
	const impl = /^<(?:&(?:mut )?)?(?:[A-Za-z0-9_]+::)*([A-Za-z0-9_]+)(?:<[^>]*>)?(?: as [^>]*)?>::([A-Za-z0-9_]+)/.exec(n)
	if (impl) return `${impl[1]}_${impl[2]}`
	n = n.replace(/<[^<>]*>/g, '').replace(/<[^<>]*>/g, '')
	const segs = n.split('::').filter(Boolean)
	return segs.slice(-2).join('_').replace(/[^A-Za-z0-9_]/g, '_')
}

export function classify(p: Program): Map<number, LibInfo> {
	const d = libDb()
	const nm = libNames()
	const out = new Map<number, LibInfo>()
	const used = new Map<string, number>()
	const prints = new Map<number, ReturnType<typeof fingerprint>>()
	for (const f of p.funcs.values()) prints.set(f.pc, fingerprint(p, f))
	// crates this program *is* (its own processor/instruction code is recognized): never elided
	const owned = new Set<string>()
	for (const [, fp] of prints) {
		const n = nm?.[fp.hash] ?? (fp.alt ? nm?.[fp.alt] : undefined)
		if (n && /::processor::|process_instruction|::instruction::[A-Z]\w*::unpack/.test(n) && !GENERIC.test(crateOf(n))) owned.add(crateOf(n))
	}
	for (const f of p.funcs.values()) {
		const fp = prints.get(f.pc)!
		const big = fp.insns >= MIN_LIB_INSNS
		const hit = d && big ? d.sigs[fp.hash] ?? (fp.alt ? d.sigs[fp.alt] : undefined) : undefined
		const rust = big ? nm?.[fp.hash] ?? (fp.alt ? nm?.[fp.alt] : undefined) : undefined
		let lib = (!!hit || !!rust) && !f.isEntry
		if (lib && rust && owned.has(crateOf(rust))) lib = false
		const info: LibInfo = { lib, families: hit?.[0] ?? 0 }
		if (info.lib) {
			const n = rust ? identFromPath(rust) : behaviorName(p, f, fp.strings)
			if (rust) info.hint = rust.length > 90 ? rust.slice(0, 90) + '…' : rust
			if (n) {
				const k = (used.get(n) ?? 0) + 1
				used.set(n, k)
				info.name = n
			}
			const strs = fp.strings.filter(s => s.length >= 6).slice(0, 2).map(s => JSON.stringify(s.length > 40 ? s.slice(0, 40) + '…' : s))
			if (!info.hint && strs.length) info.hint = strs.join(', ')
		}
		out.set(f.pc, info)
	}
	// disambiguate duplicate behavior names with the address suffix
	for (const [pc, info] of out) if (info.name && used.get(info.name)! > 1) info.name = `${info.name}_${(p.elf.text.addr + pc * 8).toString(16)}`
	void previewString
	return out
}
