// Compatibility set: decompile (project mode) + equivalence (readable and --raw) over compat/bin/*.so.
// One line per program, then a summary; exit code 1 on any crash or failing function, except for the
// KNOWN issues below (reported, not counted; --strict counts them too). A <name>.json next to a binary is passed as --idl.
// usage: node compat/run.ts [filter] [--trials N] [--keep dir/] [--strict]
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// known issues (compat/README.md): binary -> reason
const KNOWN: Record<string, string> = {
	'solang_counter.so': 'ELF symbol names like counter::counter::function::count are emitted as-is (invalid identifiers)',
}

const root = join(import.meta.dirname, '..')
const argv = process.argv.slice(2)
const opt = (n: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined }
const filter = argv.find((a, i) => !a.startsWith('--') && !['--trials', '--keep'].includes(argv[i - 1]))
const trials = opt('--trials') ?? '2'
const keep = opt('--keep')
const strict = argv.includes('--strict')
const out = keep ?? mkdtempSync(join(tmpdir(), 'compat-'))
const bins = readdirSync(join(root, 'compat/bin')).filter(f => f.endsWith('.so') && (!filter || f.includes(filter))).sort()

const run = (args: string[]) => {
	const t0 = Date.now()
	const r = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 600_000 })
	return { ms: Date.now() - t0, code: r.status, text: (r.stdout ?? '') + (r.stderr ?? '') }
}
const equiv = (so: string, idl: string[], raw: boolean) => {
	const r = run(['--stack-size=65500', 'test/equiv.ts', so, trials, ...idl, ...(raw ? ['--raw'] : [])])
	const m = r.text.match(/(\d+) functions, .* (\d+) failing functions, (\d+) errors/)
	return m ? { ok: r.code === 0, s: `${m[2]}F/${m[3]}E of ${m[1]}` } : { ok: false, s: 'CRASH ' + (r.text.trim().split('\n').pop() ?? '').slice(0, 80) }
}

let bad = 0, known = 0
const t0 = Date.now()
console.log('program'.padEnd(34), 'ver  insns   fns  ixs  decompile  equiv(readable)       equiv(raw)')
for (const f of bins) {
	const so = join('compat/bin', f)
	const json = so.replace(/\.so$/, '.json')
	const idl = existsSync(join(root, json)) ? ['--idl', json] : []
	const dir = join(out, f.replace(/\.so$/, '')) + '/'
	const d = run(['--stack-size=65500', 'src/cli.ts', so, ...idl, '-o', dir])
	let ok = true, line: string
	if (d.code !== 0 || !existsSync(join(dir, 'index.ts'))) {
		ok = false
		line = 'decompile CRASH: ' + d.text.trim().split('\n').slice(-3).join(' | ').slice(0, 200)
	} else {
		const m = readFileSync(join(dir, 'index.ts'), 'utf8').match(/program: sBPF (v\d), (\d+) instructions, (\d+) functions/)
		const [ver, insns, fns] = m ? m.slice(1) : ['?', '?', '?']
		const sec = join(dir, 'security')
		const ixs = String(existsSync(sec) ? readdirSync(sec).filter(x => x.endsWith('.md') && x !== 'summary.md').length : 0)
		const a = equiv(so, idl, false), b = equiv(so, idl, true)
		ok = a.ok && b.ok
		line = [ver.padEnd(4), insns.padStart(5), fns.padStart(5), ixs.padStart(4), ' ', `${(d.ms / 1000).toFixed(1)}s`.padEnd(9), (a.ok ? 'ok ' : 'BAD ') + a.s.padEnd(18), (b.ok ? 'ok ' : 'BAD ') + b.s].join(' ')
	}
	const k = KNOWN[f]
	if (!ok && k && !strict) { known++; line += `  (known: ${k})` } else if (!ok) bad++
	else if (k) line += '  (listed as known issue but passes: update KNOWN)'
	console.log(f.padEnd(34), line)
}
if (!keep) rmSync(out, { recursive: true, force: true })
console.log(`${bins.length} programs, ${bad} with a crash or failing functions, ${known} known issues, ${((Date.now() - t0) / 1000).toFixed(0)}s`)
if (bad) process.exitCode = 1
