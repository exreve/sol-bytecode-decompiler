#!/usr/bin/env node
// Anchor discriminator lookup.
//   node src/selector.ts 0xf8c69e91e17587c8     -> name (dataset, then verb x noun vocabulary)
//   node src/selector.ts swap                   -> sha256("global:swap")[..8], account/event forms
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

const db: { names: Record<string, string>; verbs: string[]; nouns: string[] } =
	JSON.parse(gunzipSync(readFileSync(fileURLToPath(new URL('../data/selectors.json.gz', import.meta.url)))).toString())
const h8 = (s: string) => createHash('sha256').update(s).digest().subarray(0, 8).toString('hex')
const pascal = (s: string) => s.split(/[_\s-]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('')

/** Accepts either byte order: `0x...` as a little-endian u64 (as printed by the decompiler) or raw bytes hex. */
export function lookup(hex: string): string | undefined {
	const h = hex.replace(/^0x/, '').padStart(16, '0').toLowerCase()
	const le = Buffer.from(h, 'hex').reverse().toString('hex')
	for (const k of [h, le]) {
		if (db.names[k]) return db.names[k]
	}
	const want = new Set([h, le])
	for (const v of db.verbs) for (const n of ['', ...db.nouns]) {
		const name = n ? `${v}_${n}` : v
		if (want.has(h8(`global:${name}`))) return `i:${name}`
	}
	return undefined
}

if (import.meta.main) {
	for (const a of process.argv.slice(2)) {
		if (/^(0x)?[0-9a-f]{16}$/i.test(a)) console.log(a, '->', lookup(a) ?? 'unknown')
		else console.log(`${a}: instruction ${h8(`global:${a}`)}  account ${h8(`account:${pascal(a)}`)}  event ${h8(`event:${pascal(a)}`)}  (bytes, hex)`)
	}
}
