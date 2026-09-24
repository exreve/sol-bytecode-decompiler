// Build symbolized reference programs with Solana platform-tools, for library function naming.
// Requires: platform-tools linked as rustup toolchain (e.g. `rustup toolchain link sbf141 <tools>/rust`)
// usage: node scripts/refbuild.ts [filter]
import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

interface Variant { name: string; template: string; tools: string; rust: string; vars: Record<string, string>; pins?: [string, string][] }
// toolchains newer than v1.41 need glibc >= 2.34: they run inside an ubuntu:24.04 container
const TOOLS: Record<string, { rust: string; docker: boolean }> = { 'v1.41': { rust: '1.75', docker: false }, 'v1.43': { rust: '1.79', docker: true }, 'v1.48': { rust: '1.84', docker: true } }
const matrix: Variant[] = []
const PINS141: [string, string][] = [['blake3', '1.5.5'], ['cc', '1.0.94']]
const nat = (tools: string, sol: string, spl: string, pins: [string, string][] = []) => matrix.push({ name: `native-sol${sol}-t${tools.slice(1)}`, template: 'native', tools, rust: TOOLS[tools].rust, vars: { SOLANA: sol, SPL_TOKEN: spl }, pins })
const anc = (tools: string, anchor: string, bump: string, pins: [string, string][] = []) => matrix.push({ name: `anchor${anchor}-t${tools.slice(1)}`, template: 'anchor', tools, rust: TOOLS[tools].rust, vars: { ANCHOR: anchor, BUMP: bump }, pins })
for (const sol of ['1.16.27', '1.17.34', '1.18.26']) nat('v1.41', sol, '4.0.0', PINS141)
anc('v1.41', '0.28.0', '*ctx.bumps.get("vault").unwrap()', PINS141)
anc('v1.41', '0.29.0', 'ctx.bumps.vault', PINS141)
anc('v1.41', '0.30.1', 'ctx.bumps.vault', PINS141)
nat('v1.43', '1.18.26', '4.0.0', PINS141)
nat('v1.43', '2.1.21', '7.0.0')
anc('v1.43', '0.30.1', 'ctx.bumps.vault', PINS141)
anc('v1.43', '0.31.1', 'ctx.bumps.vault')
nat('v1.48', '2.2.1', '8.0.0')
anc('v1.48', '0.31.1', 'ctx.bumps.vault')

const filter = process.argv[2]
const root = process.cwd()
mkdirSync(join(root, 'refbuild/out'), { recursive: true })
for (const v of matrix) {
	if (filter && !v.name.includes(filter)) continue
	const out = join(root, 'refbuild/out', v.name + '.so')
	if (existsSync(out)) { console.log('skip (exists)', v.name); continue }
	const wd = join(homedir(), '.cache/sbf-rb', v.name)
	rmSync(wd, { recursive: true, force: true })
	cpSync(join(root, 'refbuild/templates', v.template), wd, { recursive: true })
	for (const f of ['Cargo.toml', 'src/lib.rs']) {
		let s = readFileSync(join(wd, f), 'utf8')
		for (const [k, val] of Object.entries({ ...v.vars, RUST: v.rust })) s = s.replaceAll(`{{${k}}}`, val)
		writeFileSync(join(wd, f), s)
	}
	const sh = (cmd: string, env: Record<string, string> = {}) => execSync(cmd, { cwd: wd, stdio: 'pipe', env: { ...process.env, ...env }, maxBuffer: 1 << 26 }).toString()
	try {
		sh('cargo generate-lockfile', { CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS: 'fallback' })
		for (const [pkg, ver] of v.pins ?? []) { try { sh(`cargo update -p ${pkg} --precise ${ver}`) } catch { /* not in graph */ } }
		writeFileSync(join(wd, 'Cargo.lock'), readFileSync(join(wd, 'Cargo.lock'), 'utf8').replace(/^version = 4$/m, 'version = 3'))
		const t = join(homedir(), '.cache/sbf-tools', v.tools)
		if (TOOLS[v.tools].docker) {
			const uid = execSync('id -u').toString().trim(), gid = execSync('id -g').toString().trim()
			const home = join(homedir(), '.cache/sbf-cargo-' + v.tools)
			mkdirSync(home, { recursive: true })
			sh(`docker run --rm -u ${uid}:${gid} -v ${t}:/tools:ro -v ${home}:/cargo -v ${wd}:/w -w /w -e CARGO_HOME=/cargo -e HOME=/tmp -e PATH=/tools/llvm/bin:/tools/rust/bin:/usr/bin:/bin -e CC=clang -e AR=llvm-ar -e RUSTC=/tools/rust/bin/rustc sbf-builder sh -c "cargo fetch && cargo build --offline --release --target sbf-solana-solana"`)
		} else {
			execSync(`rustup toolchain link sbf-${v.tools} ${t}/rust`, { stdio: 'ignore' })
			sh(`cargo +sbf-${v.tools} build --release --target sbf-solana-solana`, { PATH: `${t}/llvm/bin:${process.env.PATH}`, CC: 'clang', AR: 'llvm-ar' })
		}
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
