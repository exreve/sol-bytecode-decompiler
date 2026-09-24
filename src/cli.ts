#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { decompile } from './decompile.ts'

const args = process.argv.slice(2)
const file = args.find(a => !a.startsWith('-'))
if (!file) {
	console.error('usage: sbpf-decompile <program.so> [-o out.ts] [--raw] [--full]\n  --full  also decompile recognized library functions\n  --raw   no Solana-specific rendering')
	process.exit(1)
}
const oi = args.indexOf('-o')
const res = decompile(new Uint8Array(readFileSync(file)), { sugar: !args.includes('--raw'), full: args.includes('--full') })
if (oi >= 0) writeFileSync(args[oi + 1], res.text)
else process.stdout.write(res.text)
