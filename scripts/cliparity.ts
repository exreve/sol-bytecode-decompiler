// Whole-output parity of the Rust port: runs the TypeScript CLI (`node src/cli.ts`) and the Rust driver
// (`sbpf-dump --cli`) on each binary, writing the project (`-o dir/`) and the single file (`-o out.ts`), and
// compares them with `diff -r` (dev tool, read-only).
//
//   node scripts/cliparity.ts [--bin rs-dump-binary] [--idl] [--full] [--keep dir] paths...
//
// paths: .so files or directories (their *.so). --idl: only the binaries that have an Anchor IDL (as
// scripts/parity.ts), both given it. --full: the single file with --full (library code decompiled) instead of the
// project. --keep dir: keep the outputs of differing binaries there. Exit status 1 when any output differs.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'

const args = process.argv.slice(2)
let bin = '/tmp/claude-1000/rs-target/release/sbpf-dump', useIdl = false, full = false, keep: string | undefined
const paths: string[] = []
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--bin') bin = args[++i]
	else if (args[i] === '--idl') useIdl = true
	else if (args[i] === '--full') full = true
	else if (args[i] === '--keep') keep = args[++i]
	else paths.push(args[i])
}
let files: string[] = []
for (const p of paths) {
	if (statSync(p).isDirectory()) for (const f of readdirSync(p).sort()) { if (f.endsWith('.so')) files.push(join(p, f)) }
	else files.push(p)
}
function idlOf(f: string): string | undefined {
	const d = dirname(f), b = basename(f, '.so')
	for (const n of new Set([b, b.replace(/@.*$/, '')])) for (const dd of [d, join(d, '..', 'idl'), join(d, 'idl')]) {
		const c = join(dd, `${n}.json`)
		if (existsSync(c)) return c
	}
	return undefined
}
if (useIdl) files = files.filter(f => idlOf(f))
const cli = join(import.meta.dirname, '..', 'src', 'cli.ts')
const run = (cmd: string, argv: string[]): string | undefined => {
	try { execFileSync(cmd, argv, { stdio: ['ignore', 'ignore', 'pipe'], maxBuffer: 1 << 30 }); return undefined } catch (e) { return String((e as { stderr?: Buffer }).stderr ?? e).trim().split('\n').slice(-1)[0] }
}
let same = 0
const bad: string[] = []
const t0 = performance.now()
for (const f of files) {
	const d = mkdtempSync(join(tmpdir(), 'cliparity-'))
	const idl = useIdl ? ['--idl', idlOf(f)!] : []
	const opts = [...idl, ...(full ? ['--full'] : [])]
	const outs = full ? ['single.ts'] : ['project/', 'single.ts']
	const errs: string[] = []
	for (const x of ['ts', 'rs']) mkdirSync(join(d, x))
	for (const o of outs) {
		const te = run('node', [cli, f, ...opts, '-o', join(d, 'ts', o)].map(String))
		const re = run(bin, ['--cli', f, ...opts, '-o', join(d, 'rs', o)])
		if (te || re) { if (te !== re) errs.push(`${o}: ts ${te ?? 'ok'} / rs ${re ?? 'ok'}`) }
	}
	let diff = ''
	if (!errs.length && existsSync(join(d, 'ts'))) {
		try { execFileSync('diff', ['-r', join(d, 'ts'), join(d, 'rs')], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 30 }) } catch (e) { diff = String((e as { stdout?: Buffer }).stdout ?? e).split('\n').slice(0, 6).join('\n    ') }
	}
	if (errs.length || diff) {
		bad.push(f)
		console.log(`DIFF ${f}\n    ${[...errs, diff].filter(x => x).join('\n    ')}`)
		if (keep) cpSync(d, join(keep, basename(f)), { recursive: true })
	} else same++
	rmSync(d, { recursive: true, force: true })
}
console.log(`cliparity: ${same}/${files.length} identical, ${bad.length} differing (${full ? 'single file --full' : 'project + single file'}${useIdl ? ', --idl' : ''}; ${((performance.now() - t0) / 1000).toFixed(0)}s)`)
process.exit(bad.length ? 1 : 0)
