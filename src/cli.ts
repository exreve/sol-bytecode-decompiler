#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'
import { enableCompileCache } from 'node:module'

// Cache Node's compilation (including TypeScript type stripping) of our modules on disk: saves
// ~0.2 s per run. The decompiler modules are imported only after enabling it; entries are
// validated against the sources, and the cache is optional (failures are ignored).
try { enableCompileCache?.(join(homedir(), '.cache', 'sbpf-decompiler', 'node-compile-cache')) } catch { /* optional */ }
const { decompile } = await import('./decompile.ts')
const { renderProject } = await import('./layout.ts')
const { parseIdl, fetchIdl } = await import('./idl.ts')
const { rpcUrl, isAddress, fetchProgram, RPC_ENV } = await import('./rpc.ts')

const USAGE = `usage: sbpf-decompile <input> [options]

input:
  program.so            a local program binary
  <program address>     fetched from an RPC endpoint (needs --rpc or $${RPC_ENV})
  -                     read the binary from stdin

output:
  (default)             single file to stdout
  -o out.ts             single file
  -o outdir/            project: index.ts, entrypoint.ts, ix/<name>.ts, bundle/<name>.ts, shared.ts, lib.d.ts

options:
  --rpc <url>           Solana RPC endpoint (default: $${RPC_ENV}; there is no built-in endpoint)
  --idl <file.json>     Anchor IDL (instruction args/accounts, error names)
  --program-id <id>     fetch the on-chain Anchor IDL for this program id (local input + RPC)
  --no-idl              do not fetch the on-chain IDL automatically for an address input
  --save-so <file>      save the fetched binary
  --full                also decompile recognized library functions
  --raw                 no Solana-specific names/comments (the form verified by the tests)
  --exact-memory        keep every stack access in memory (exact even if the program corrupts
                        its own stack frame through wild pointers)
  -h, --help            this help`

const args = process.argv.slice(2)
const VALUED = new Set(['-o', '--idl', '--program-id', '--rpc', '--save-so'])
const opt = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const flag = (n: string) => args.includes(n)
const input = args.find((a, i) => (!a.startsWith('-') || a === '-') && !VALUED.has(args[i - 1]))
if (!input || flag('-h') || flag('--help')) {
	console.error(USAGE)
	process.exit(input || flag('-h') || flag('--help') ? 0 : 1)
}
const fail = (msg: string): never => { console.error(`error: ${msg}`); process.exit(1) }
const rpc = rpcUrl(opt('--rpc'))
const needRpc = (why: string) => rpc ?? fail(`${why} needs an RPC endpoint: pass --rpc <url> or set ${RPC_ENV}`)

// ---- program bytes ----
let bytes: Uint8Array
let programId = opt('--program-id')
if (input === '-') bytes = new Uint8Array(readFileSync(0))
else if (existsSync(input)) bytes = new Uint8Array(readFileSync(input))
else if (isAddress(input)) {
	programId ??= input
	try { bytes = await fetchProgram(needRpc(`fetching program ${input}`), input) } catch (e) { fail(String((e as Error).message ?? e)) }
	console.error(`fetched ${input}: ${bytes!.length} bytes`)
	if (opt('--save-so')) writeFileSync(opt('--save-so')!, bytes!)
} else fail(`${input}: no such file, and not a program address`)

// ---- IDL (explicit file, or on-chain when we know the program id) ----
let idlJson: any
if (opt('--idl')) idlJson = JSON.parse(readFileSync(opt('--idl')!, 'utf8'))
else if (programId && !flag('--no-idl') && (rpc || opt('--program-id'))) {
	try { idlJson = await fetchIdl(programId, needRpc('fetching the on-chain IDL')) } catch (e) { console.error(`IDL fetch failed: ${String((e as Error).message ?? e)}`) }
	console.error(idlJson ? `using on-chain Anchor IDL of ${programId}` : `no on-chain Anchor IDL for ${programId}`)
}

const res = decompile(bytes!, { sugar: !flag('--raw'), full: flag('--full'), exactMemory: flag('--exact-memory'), idl: idlJson ? parseIdl(idlJson) : undefined })
const out = opt('-o')
if (out && (out.endsWith('/') || (existsSync(out) && statSync(out).isDirectory()))) {
	for (const [path, text] of renderProject(res)) {
		mkdirSync(dirname(join(out, path)), { recursive: true })
		writeFileSync(join(out, path), text)
	}
	console.error(`wrote project to ${out}`)
} else if (out) writeFileSync(out, res.text)
else process.stdout.write(res.text)
