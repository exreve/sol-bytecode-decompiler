#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'
import { enableCompileCache } from 'node:module'

// Cache Node's compilation (including TypeScript type stripping) of our modules on disk: saves
// ~0.2 s per run. The decompiler modules are imported only after enabling it; entries are
// validated against the sources, and the cache is optional (failures are ignored).
try { enableCompileCache?.(join(homedir(), '.cache', 'sbpf-decompiler', 'node-compile-cache')) } catch { /* optional */ }
// Deeply nested programs need a large stack: run in a worker thread with a big stack instead of
// requiring `node --stack-size=...` from the user.
const { isMainThread, Worker } = await import('node:worker_threads')
if (isMainThread && !process.execArgv.some(a => a.startsWith('--stack-size'))) {
	process.stdout.on('error', e => { if ((e as NodeJS.ErrnoException).code === 'EPIPE') process.exit(0); throw e }) // e.g. `| head`
	const w = new Worker(new URL(import.meta.url), { argv: process.argv.slice(2), resourceLimits: { stackSizeMb: 256, maxOldGenerationSizeMb: 16384 } })
	const code = await new Promise<number>(resolve => { w.on('error', e => { console.error(e); resolve(1) }); w.on('exit', resolve) })
	process.exit(code)
}
const { decompile } = await import('./decompile.ts')
const { renderProject } = await import('./layout.ts')
const { parseIdl, fetchIdl } = await import('./idl.ts')
const { isAddress, fetchProgram } = await import('./rpc.ts')

const USAGE = `usage: sbpf-decompile <program.so | program address> [-o out.ts | -o outdir/] [--rpc <url>] [--idl <file.json>] [--full]

  program.so        a local program binary ("-" reads it from stdin)
  program address   fetched from the RPC endpoint given with --rpc (its on-chain Anchor IDL is used when published)
  -o out.ts         write a single file (default: stdout)
  -o outdir/        write a project: index.ts, bundle/<ix>.ts, ix/, shared.ts, entrypoint.ts, lib.d.ts, security/
  --idl file.json   Anchor IDL (instruction args/accounts, account layouts, error names)
  --full            also decompile recognized library code (default: one-line typed stubs)`

const args = process.argv.slice(2)
const VALUED = new Set(['-o', '--idl', '--rpc'])
const opt = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const flag = (n: string) => args.includes(n)
const input = args.find((a, i) => (!a.startsWith('-') || a === '-') && !VALUED.has(args[i - 1]))
if (!input || flag('-h') || flag('--help')) {
	console.error(USAGE)
	process.exit(input || flag('-h') || flag('--help') ? 0 : 1)
}
const fail = (msg: string): never => { console.error(`error: ${msg}`); process.exit(1) }
const rpc = opt('--rpc')

// ---- program bytes ----
let bytes: Uint8Array
let programId: string | undefined
if (input === '-') bytes = new Uint8Array(readFileSync(0))
else if (existsSync(input)) bytes = new Uint8Array(readFileSync(input))
else if (isAddress(input)) {
	if (!rpc) fail(`${input} looks like a program address: pass --rpc <url> to fetch it`)
	programId = input
	try { bytes = await fetchProgram(rpc!, input) } catch (e) { fail(String((e as Error).message ?? e)) }
	console.error(`fetched ${input}: ${bytes!.length} bytes`)
} else fail(`${input}: no such file, and not a program address`)

// ---- IDL: explicit file, or the on-chain one of a fetched program ----
let idlJson: any
if (opt('--idl')) idlJson = JSON.parse(readFileSync(opt('--idl')!, 'utf8'))
else if (programId && rpc) {
	try { idlJson = await fetchIdl(programId, rpc) } catch { /* no IDL */ }
	if (idlJson) console.error(`using on-chain Anchor IDL of ${programId}`)
}

const res = decompile(bytes!, { full: flag('--full'), idl: idlJson ? parseIdl(idlJson) : undefined })
const out = opt('-o')
if (out && (out.endsWith('/') || (existsSync(out) && statSync(out).isDirectory()))) {
	for (const [path, text] of renderProject(res)) {
		mkdirSync(dirname(join(out, path)), { recursive: true })
		writeFileSync(join(out, path), text)
	}
	console.error(`wrote project to ${out}`)
} else if (out) writeFileSync(out, res.text)
else process.stdout.write(res.text)
