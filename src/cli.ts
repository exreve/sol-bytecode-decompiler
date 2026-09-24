#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { decompile } from './decompile.ts'
import { renderProject } from './layout.ts'

const args = process.argv.slice(2)
const file = args.find((a, i) => !a.startsWith('-') && args[i - 1] !== '-o')
if (!file) {
	console.error(`usage: sbpf-decompile <program.so> [-o out.ts | -o outdir/] [--full] [--raw]
  -o out.ts   single file
  -o outdir/  project layout: index.ts, entrypoint.ts, ix/<name>.ts, shared.ts, lib.d.ts
  --full      also decompile recognized library functions
  --raw       no Solana-specific comments/names`)
	process.exit(1)
}
const oi = args.indexOf('-o')
const out = oi >= 0 ? args[oi + 1] : undefined
const res = decompile(new Uint8Array(readFileSync(file)), { sugar: !args.includes('--raw'), full: args.includes('--full') })
if (out && (out.endsWith('/') || (existsSync(out) && statSync(out).isDirectory()))) {
	for (const [path, text] of renderProject(res)) {
		mkdirSync(dirname(join(out, path)), { recursive: true })
		writeFileSync(join(out, path), text)
	}
} else if (out) writeFileSync(out, res.text)
else process.stdout.write(res.text)
