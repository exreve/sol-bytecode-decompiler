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

const args = process.argv.slice(2)
const file = args.find((a, i) => !a.startsWith('-') && !['-o', '--idl', '--program-id'].includes(args[i - 1]))
if (!file) {
	console.error(`usage: sbpf-decompile <program.so> [-o out.ts | -o outdir/] [--full] [--raw]
  -o out.ts   single file
  -o outdir/  project layout: index.ts, entrypoint.ts, ix/<name>.ts, shared.ts, lib.d.ts
  --idl f.json        Anchor IDL: instruction args/accounts, error names
  --program-id <id>   fetch the program's on-chain Anchor IDL (mainnet RPC or $RPC)
  --full      also decompile recognized library functions
  --raw       no Solana-specific comments/names
  --exact-memory  keep every stack access in memory (exact even if the program writes its own stack
              frame through wild pointers; default output assumes memory-safe execution)`)
	process.exit(1)
}
const oi = args.indexOf('-o')
const out = oi >= 0 ? args[oi + 1] : undefined
const opt = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
let idlJson: any
if (opt('--idl')) idlJson = JSON.parse(readFileSync(opt('--idl')!, 'utf8'))
else if (opt('--program-id')) {
	try { idlJson = await fetchIdl(opt('--program-id')!) } catch (e) { console.error('IDL fetch failed:', String(e)) }
	if (!idlJson) console.error('no on-chain Anchor IDL found for', opt('--program-id'))
}
const res = decompile(new Uint8Array(readFileSync(file)), { sugar: !args.includes('--raw'), full: args.includes('--full'), exactMemory: args.includes('--exact-memory'), idl: idlJson ? parseIdl(idlJson) : undefined })
if (out && (out.endsWith('/') || (existsSync(out) && statSync(out).isDirectory()))) {
	for (const [path, text] of renderProject(res)) {
		mkdirSync(dirname(join(out, path)), { recursive: true })
		writeFileSync(join(out, path), text)
	}
} else if (out) writeFileSync(out, res.text)
else process.stdout.write(res.text)
