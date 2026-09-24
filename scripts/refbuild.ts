// Build symbolized reference programs with Solana platform-tools, for library function naming.
// Requires: platform-tools linked as rustup toolchain (e.g. `rustup toolchain link sbf141 <tools>/rust`)
// usage: node scripts/refbuild.ts [filter]
import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

interface Variant { name: string; template: string; toolchain: string; vars: Record<string, string>; pins?: [string, string][] }
const T141 = { toolchain: 'sbf141', rust: '1.75' }
const matrix: Variant[] = []
for (const [sol, spl] of [['1.16.27', '4.0.0'], ['1.17.34', '4.0.0'], ['1.18.26', '4.0.0']]) {
	matrix.push({ name: `native-sol${sol}-t141`, template: 'native', toolchain: T141.toolchain, vars: { RUST: T141.rust, SOLANA: sol, SPL_TOKEN: spl }, pins: [['blake3', '1.5.5'], ['cc', '1.0.94']] })
}
for (const [anchor, bump] of [['0.28.0', '*ctx.bumps.get("vault").unwrap()'], ['0.29.0', 'ctx.bumps.vault'], ['0.30.1', 'ctx.bumps.vault']]) {
	matrix.push({ name: `anchor${anchor}-t141`, template: 'anchor', toolchain: T141.toolchain, vars: { RUST: T141.rust, ANCHOR: anchor, BUMP: bump }, pins: [['blake3', '1.5.5'], ['cc', '1.0.94']] })
}

const filter = process.argv[2]
const root = process.cwd()
mkdirSync(join(root, 'refbuild/out'), { recursive: true })
const tools = (tc: string) => join(homedir(), '.cache/sbf-tools', 'v' + tc.replace('sbf', '').replace(/^(\d)(\d+)$/, '$1.$2'))
for (const v of matrix) {
	if (filter && !v.name.includes(filter)) continue
	const out = join(root, 'refbuild/out', v.name + '.so')
	if (existsSync(out)) { console.log('skip (exists)', v.name); continue }
	const wd = join(homedir(), '.cache/sbf-rb', v.name)
	rmSync(wd, { recursive: true, force: true })
	cpSync(join(root, 'refbuild/templates', v.template), wd, { recursive: true })
	for (const f of ['Cargo.toml', 'src/lib.rs']) {
		let s = readFileSync(join(wd, f), 'utf8')
		for (const [k, val] of Object.entries(v.vars)) s = s.replaceAll(`{{${k}}}`, val)
		writeFileSync(join(wd, f), s)
	}
	const sh = (cmd: string, env: Record<string, string> = {}) => execSync(cmd, { cwd: wd, stdio: 'pipe', env: { ...process.env, ...env }, maxBuffer: 1 << 26 }).toString()
	try {
		sh('cargo generate-lockfile', { CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS: 'fallback' })
		for (const [pkg, ver] of v.pins ?? []) { try { sh(`cargo update -p ${pkg} --precise ${ver}`) } catch { /* not in graph */ } }
		writeFileSync(join(wd, 'Cargo.lock'), readFileSync(join(wd, 'Cargo.lock'), 'utf8').replace(/^version = 4$/m, 'version = 3'))
		const t = tools(v.toolchain)
		sh(`cargo +${v.toolchain} build --release --target sbf-solana-solana`, { PATH: `${t}/llvm/bin:${process.env.PATH}`, CC: 'clang', AR: 'llvm-ar' })
		const rel = join(wd, 'target/sbf-solana-solana/release')
		const so = readdirSync(rel).find(f => f.endsWith('.so'))!
		cpSync(join(rel, so), out)
		rmSync(join(wd, 'target'), { recursive: true, force: true })
		console.log('built', v.name)
	} catch (e: any) {
		const msg = (e.stderr?.toString() ?? String(e)).split('\n').filter((l: string) => /^error/.test(l)).slice(0, 5).join('\n')
		console.log('FAILED', v.name, '\n', msg || String(e).slice(0, 400))
	}
}
