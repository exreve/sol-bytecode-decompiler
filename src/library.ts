// Library code recognition. Functions whose fingerprint occurs in many unrelated mainnet
// programs (data/libsigs.json) are generic library code (Rust std, solana-program, borsh,
// anchor-lang, spl, ...). In the default output they are not decompiled: callers see a
// typed `declare function` stub with a behavioral name/hint instead.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Program, Func } from './program.ts'
import { fingerprint, previewString } from './fingerprint.ts'

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

export function classify(p: Program): Map<number, LibInfo> {
	const d = libDb()
	const out = new Map<number, LibInfo>()
	const used = new Map<string, number>()
	for (const f of p.funcs.values()) {
		const fp = fingerprint(p, f)
		const hit = d && fp.insns >= MIN_LIB_INSNS ? d.sigs[fp.hash] : undefined
		const info: LibInfo = { lib: !!hit && !f.isEntry, families: hit?.[0] ?? 0 }
		if (info.lib) {
			const n = behaviorName(p, f, fp.strings)
			if (n) {
				const k = (used.get(n) ?? 0) + 1
				used.set(n, k)
				info.name = n
			}
			const strs = fp.strings.filter(s => s.length >= 6).slice(0, 2).map(s => JSON.stringify(s.length > 40 ? s.slice(0, 40) + '…' : s))
			if (strs.length) info.hint = strs.join(', ')
		}
		out.set(f.pc, info)
	}
	// disambiguate duplicate behavior names with the address suffix
	for (const [pc, info] of out) if (info.name && used.get(info.name)! > 1) info.name = `${info.name}_${(p.elf.text.addr + pc * 8).toString(16)}`
	void previewString
	return out
}
