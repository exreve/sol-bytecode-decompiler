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
const { isAddress, fetchProgramAccount } = await import('./rpc.ts')

const USAGE = `usage: sbpf-decompile <program> [-o out.ts | -o outdir/] [--rpc <url>] [--idl <file.json>] [--full]
       sbpf-decompile <program A> <program B> [-o report.txt] [--rpc <url>]

  <program>         a local .so file ("-" reads it from stdin), or a program address fetched with --rpc
                    (its on-chain Anchor IDL is used when published)
  -o out.ts         write a single file (default: stdout)
  -o outdir/        write a project: index.ts, bundle/<ix>.ts, ix/, shared.ts, entrypoint.ts, lib.d.ts, security/
  --idl file.json   Anchor IDL (instruction args/accounts, account layouts, error names)
  --full            also decompile recognized library code (default: one-line typed stubs)
  two programs      compare them (upgrade diff / fork matching); long lists are shortened on the terminal,
                    complete with -o`

const args = process.argv.slice(2)
const VALUED = new Set(['-o', '--idl', '--rpc'])
const opt = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const flag = (n: string) => args.includes(n)
const inputs = args.filter((a, i) => (!a.startsWith('-') || a === '-') && !VALUED.has(args[i - 1]))
if (!inputs.length || inputs.length > 2 || flag('-h') || flag('--help')) {
	console.error(USAGE)
	process.exit(inputs.length && inputs.length <= 2 ? 0 : 1)
}
const fail = (msg: string): never => { console.error(`error: ${msg}`); process.exit(1) }
const rpc = opt('--rpc')
const out = opt('-o')

/** Program bytes, and the IDL (explicit file, or the on-chain one of a fetched program). */
async function load(input: string, idlFile?: string): Promise<{ bytes: Uint8Array; idl?: ReturnType<typeof parseIdl>; loader?: string }> {
	let bytes: Uint8Array
	let programId: string | undefined, loader: string | undefined
	if (input === '-') bytes = new Uint8Array(readFileSync(0))
	else if (existsSync(input)) bytes = new Uint8Array(readFileSync(input))
	else if (isAddress(input)) {
		if (!rpc) fail(`${input} looks like a program address: pass --rpc <url> to fetch it`)
		programId = input
		try { ({ bytes, loader } = await fetchProgramAccount(rpc!, input)) } catch (e) { fail(String((e as Error).message ?? e)) }
		console.error(`fetched ${input}: ${bytes!.length} bytes`)
	} else fail(`${input}: no such file, and not a program address`)
	let idlJson: any
	if (idlFile) idlJson = JSON.parse(readFileSync(idlFile, 'utf8'))
	else if (programId && rpc) {
		try { idlJson = await fetchIdl(programId, rpc) } catch { /* no IDL */ }
		if (idlJson) console.error(`using on-chain Anchor IDL of ${programId}`)
	}
	return { bytes: bytes!, idl: idlJson ? parseIdl(idlJson) : undefined, loader }
}

if (inputs.length === 2) {
	const { profile, diff } = await import('./diff.ts')
	const [a, b] = await Promise.all(inputs.map(i => load(i)))
	const d = diff(profile(a.bytes, a.idl), profile(b.bytes, b.idl), { all: !!out, labels: [inputs[0], inputs[1]] })
	const text = d.lines.join('\n') + '\n'
	if (out) writeFileSync(out, text)
	else process.stdout.write(text)
	process.exit(0)
}

const { bytes, idl, loader } = await load(inputs[0], opt('--idl'))
const res = decompile(bytes, { full: flag('--full'), idl, loader })
{
	// opcodes the declared sBPF version (e_flags) does not have: probably built for another version
	const { invalidInstructions } = await import('./program.ts')
	const bad = invalidInstructions(res.program)
	if (bad.length) console.error(`warning: ${bad.length} reachable instruction${bad.length > 1 ? 's are' : ' is'} invalid for the declared sBPF v${res.program.version} (first at pc ${bad[0]}, opcode 0x${res.program.insns[bad[0]].opc.toString(16)}): built for another sBPF version? The output follows the declared version.`)
}
if (out && (out.endsWith('/') || (existsSync(out) && statSync(out).isDirectory()))) {
	for (const [path, text] of renderProject(res)) {
		mkdirSync(dirname(join(out, path)), { recursive: true })
		writeFileSync(join(out, path), text)
	}
	console.error(`wrote project to ${out}`)
} else if (out) writeFileSync(out, res.text)
else process.stdout.write(res.text)
