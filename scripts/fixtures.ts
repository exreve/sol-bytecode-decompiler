// Frozen TS CLI outputs (regression fixtures for the Rust port, dev tool, read-only on the sources):
//
//   node scripts/fixtures.ts --root <repo> --out <fixture dir> <files relative to root...>
//   node scripts/fixtures.ts --root <repo> --out <fixture dir> --diff <pairs file>
//
// Per binary `<out>/<file path>.jsonl.zst` (zstd --long=27, JSON lines): a header `{"file","idl"}`, then `{"out","text"}` records:
// `single.ts` (the default single file: `-o out.ts` and stdout), `project/<path>` (`-o dir/`), `full.ts` (`--full`),
// `idl.ts` / `idl-project/<path>` (`--idl`, when the binary has an Anchor IDL), and `stderr/<mode>` (what the CLI
// prints on stderr: the invalid-opcode warning, `wrote project to <dir>` excluded) or `error/<mode>` (the first
// line of an uncaught exception: `Error: <message>`). Existing fixtures are kept (resumable).
// --diff: `<out>/diff.jsonl.zst`, per pair (`a b` per line, paths relative to root, used as the labels) the terminal
// report (`{"a","b","all":false,"text"}`, stdout) and the complete one (`-o report.txt`, `"all":true`).
//
// Runs the CLI's code path in-process (decompile + renderProject, the same calls as src/cli.ts) in a worker with
// the CLI's stack; a few files per process (the big outputs are held in memory).
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const { isMainThread, Worker } = await import('node:worker_threads')
if (isMainThread) {
	const w = new Worker(new URL(import.meta.url), { argv: process.argv.slice(2), resourceLimits: { stackSizeMb: 256, maxOldGenerationSizeMb: 16384 } })
	const code = await new Promise<number>(resolve => { w.on('error', e => { console.error(e); resolve(1) }); w.on('exit', resolve) })
	process.exit(code)
}
const { decompile } = await import('../src/decompile.ts')
const { renderProject } = await import('../src/layout.ts')
const { parseIdl } = await import('../src/idl.ts')
const { invalidInstructions } = await import('../src/program.ts')
const { profile, diff } = await import('../src/diff.ts')

const args = process.argv.slice(2)
let root = '.', out = '', pairs: string | undefined
const files: string[] = []
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--root') root = args[++i]
	else if (args[i] === '--out') out = args[++i]
	else if (args[i] === '--diff') pairs = args[++i]
	else files.push(args[i])
}

/** The binary's Anchor IDL (as scripts/cliparity.ts / parity.ts find it), relative to root. */
function idlOf(f: string): string | undefined {
	const d = dirname(f), b = basename(f, '.so')
	for (const n of new Set([b, b.replace(/@.*$/, '')])) for (const dd of [d, join(d, '..', 'idl'), join(d, 'idl')]) {
		const c = join(dd, `${n}.json`)
		if (existsSync(join(root, c))) return c
	}
	return undefined
}
const firstLine = (e: unknown) => String((e as Error)?.stack ?? e).split('\n')[0]
const write = (path: string, recs: object[]) => {
	mkdirSync(dirname(path), { recursive: true })
	const r = spawnSync('zstd', ['-17', '--long=27', '-q', '-f', '-o', path], { input: recs.map(r => JSON.stringify(r)).join('\n') + '\n', maxBuffer: 1 << 30 })
	if (r.status !== 0) throw new Error(`zstd failed: ${r.stderr}`)
}

if (pairs) {
	const recs: object[] = []
	for (const l of readFileSync(pairs, 'utf8').split('\n')) {
		const [a, b] = l.trim().split(/\s+/)
		if (!a || !b) continue
		const bytes = (x: string) => new Uint8Array(readFileSync(join(root, x)))
		for (const all of [false, true]) {
			try {
				const d = diff(profile(bytes(a)), profile(bytes(b)), { all, labels: [a, b] })
				recs.push({ a, b, all, text: d.lines.join('\n') + '\n' })
			} catch (e) { recs.push({ a, b, all, error: firstLine(e) }) }
		}
	}
	write(join(out, 'diff.jsonl.zst'), recs)
	process.exit(0)
}

for (const f of files) {
	const dest = join(out, `${f}.jsonl.zst`)
	if (existsSync(dest)) continue
	const idlFile = idlOf(f)
	const recs: object[] = [{ file: f, idl: idlFile ?? null }]
	const bytes = new Uint8Array(readFileSync(join(root, f)))
	const modes: [string, boolean, string | undefined][] = [['default', false, undefined], ['full', true, undefined]]
	if (idlFile) modes.push(['idl', false, idlFile])
	for (const [mode, full, idlPath] of modes) {
		let res
		try {
			const idl = idlPath ? parseIdl(JSON.parse(readFileSync(join(root, idlPath), 'utf8'))) : undefined
			res = decompile(bytes, { full, idl })
		} catch (e) { recs.push({ out: `error/${mode}`, text: firstLine(e) }); continue }
		const bad = invalidInstructions(res.program)
		if (bad.length) recs.push({ out: `stderr/${mode}`, text: `warning: ${bad.length} reachable instruction${bad.length > 1 ? 's are' : ' is'} invalid for the declared sBPF v${res.program.version} (first at pc ${bad[0]}, opcode 0x${res.program.insns[bad[0]].opc.toString(16)}): built for another sBPF version? The output follows the declared version.\n` })
		const single = mode === 'full' ? 'full.ts' : mode === 'idl' ? 'idl.ts' : 'single.ts'
		recs.push({ out: single, text: res.text })
		if (mode !== 'full') {
			const dir = mode === 'idl' ? 'idl-project' : 'project'
			try { for (const [path, text] of renderProject(res)) recs.push({ out: `${dir}/${path}`, text }) } catch (e) { recs.push({ out: `error/${dir}`, text: firstLine(e) }) }
		}
	}
	write(dest, recs)
	console.log(`${f}: ${recs.length - 1} outputs`)
}
