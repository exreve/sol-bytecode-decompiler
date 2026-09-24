// Build data/selectors.json.gz: 8-byte Anchor discriminator -> name.
//   instruction: sha256("global:<snake_name>")[..8]
//   account:     sha256("account:<PascalName>")[..8]
//   event:       sha256("event:<PascalName>")[..8]
// Sources: IDL JSON files, Anchor Rust sources (Context<> handlers, #[account]/#[event] structs),
// and a vocabulary expansion (observed verbs x observed noun phrases).
// usage: node scripts/build-selectors.ts <dir> [<dir>...]
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const dirs = process.argv.slice(2)
const ins = new Set<string>(), accs = new Set<string>(), evs = new Set<string>()
const explicit = new Map<string, string>() // disc hex -> name, from IDLs that list discriminators

const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/[- ]/g, '_').toLowerCase()
const pascal = (s: string) => s.split(/[_\s-]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('')
const hex8 = (s: string) => createHash('sha256').update(s).digest().subarray(0, 8).toString('hex')

function walk(d: string, out: string[]) {
	let ents: string[]
	try { ents = readdirSync(d) } catch { return }
	for (const e of ents) {
		if (e === 'node_modules' || e === '.git' || e === 'target') continue
		const p = join(d, e)
		let st
		try { st = statSync(p) } catch { continue }
		if (st.isDirectory()) walk(p, out)
		else if ((e.endsWith('.json') || e.endsWith('.rs')) && st.size < 20_000_000) out.push(p)
	}
}

const files: string[] = []
for (const d of dirs) walk(d, files)
let nIdl = 0
for (const f of files) {
	const src = readFileSync(f, 'utf8')
	if (f.endsWith('.json')) {
		if (!src.includes('"instructions"')) continue
		let j: any
		try { j = JSON.parse(src) } catch { continue }
		const idls = Array.isArray(j) ? j : [j]
		for (const idl of idls) {
			if (!Array.isArray(idl?.instructions)) continue
			nIdl++
			for (const i of idl.instructions) if (typeof i?.name === 'string') {
				ins.add(snake(i.name))
				if (Array.isArray(i.discriminator) && i.discriminator.length === 8) explicit.set(Buffer.from(i.discriminator).toString('hex'), `i:${snake(i.name)}`)
			}
			for (const a of idl.accounts ?? []) if (typeof a?.name === 'string') {
				accs.add(pascal(a.name))
				if (Array.isArray(a.discriminator) && a.discriminator.length === 8) explicit.set(Buffer.from(a.discriminator).toString('hex'), `a:${pascal(a.name)}`)
			}
			for (const e of idl.events ?? []) if (typeof e?.name === 'string') {
				evs.add(pascal(e.name))
				if (Array.isArray(e.discriminator) && e.discriminator.length === 8) explicit.set(Buffer.from(e.discriminator).toString('hex'), `e:${pascal(e.name)}`)
			}
			for (const t of idl.types ?? []) if (typeof t?.name === 'string') accs.add(pascal(t.name))
		}
	} else {
		for (const m of src.matchAll(/pub fn (\w+)\s*(?:<[^>]*>)?\s*\(\s*(?:mut\s+)?\w+\s*:\s*Context</g)) ins.add(m[1])
		for (const m of src.matchAll(/#\[account(?:\([^)]*\))?\]\s*(?:#\[[^\]]*\]\s*)*pub struct (\w+)/g)) accs.add(m[1])
		for (const m of src.matchAll(/#\[event\]\s*(?:#\[[^\]]*\]\s*)*pub struct (\w+)/g)) evs.add(m[1])
	}
}
// names harvested from GitHub (scripts/gh-anchor-names.ts)
try {
	const gh = JSON.parse(readFileSync('data-src/gh-names.json', 'utf8'))
	for (const n of gh.instructions) ins.add(n)
	for (const n of gh.accounts) accs.add(n)
	for (const n of gh.events) evs.add(n)
} catch { /* optional */ }
// vocabulary expansion: verb + noun phrase
const verbs = new Set<string>(), nouns = new Set<string>()
for (const n of ins) {
	const w = n.split('_').filter(Boolean)
	if (w.length < 1) continue
	verbs.add(w[0])
	for (let k = 1; k < w.length; k++) nouns.add(w.slice(k).join('_'))
}
for (const a of accs) nouns.add(snake(a))
const COMMON_VERBS = ['initialize', 'init', 'create', 'update', 'set', 'close', 'open', 'deposit', 'withdraw', 'swap', 'buy', 'sell', 'claim', 'stake', 'unstake', 'mint', 'burn', 'transfer', 'add', 'remove', 'lock', 'unlock', 'harvest', 'liquidate', 'borrow', 'repay', 'redeem', 'cancel', 'place', 'fill', 'settle', 'collect', 'distribute', 'register', 'delete', 'migrate', 'execute', 'approve', 'revoke', 'freeze', 'thaw', 'pause', 'unpause', 'admin', 'emergency', 'refresh', 'sync', 'crank', 'consume', 'process', 'verify', 'accept', 'propose', 'vote', 'finalize', 'start', 'end', 'reset', 'resize', 'realloc', 'increase', 'decrease', 'change', 'toggle', 'enable', 'disable']
for (const v of COMMON_VERBS) verbs.add(v)
const nounList = [...nouns].filter(n => n.length <= 40 && n.split('_').length <= 4)
const out: Record<string, string> = {}
const put = (h: string, v: string) => { if (!(h in out)) out[h] = v }
for (const [h, v] of explicit) out[h] = v
for (const n of ins) put(hex8(`global:${n}`), `i:${n}`)
for (const a of accs) put(hex8(`account:${a}`), `a:${a}`)
for (const e of evs) put(hex8(`event:${e}`), `e:${e}`)
mkdirSync('data', { recursive: true })
// nouns that occur at least twice (or are account names) keep the runtime expansion tractable
const nounFreq = new Map<string, number>()
for (const n of ins) { const w = n.split('_'); for (let k = 1; k < w.length; k++) { const x = w.slice(k).join('_'); nounFreq.set(x, (nounFreq.get(x) ?? 0) + 1) } }
const accNouns = new Set([...accs].map(snake))
// keep the runtime expansion around ~1M hashes: most frequent verbs / noun phrases
const verbFreq = new Map<string, number>()
for (const n of ins) { const v = n.split('_')[0]; verbFreq.set(v, (verbFreq.get(v) ?? 0) + 1) }
const topVerbs = new Set([...verbs].sort((a, b) => (verbFreq.get(b) ?? 0) - (verbFreq.get(a) ?? 0)).slice(0, 300))
for (const v of [...verbs]) if (!topVerbs.has(v)) verbs.delete(v)
const vocabNouns = nounList.filter(n => (nounFreq.get(n) ?? 0) >= 2 || accNouns.has(n))
	.sort((a, b) => (nounFreq.get(b) ?? 0) - (nounFreq.get(a) ?? 0)).slice(0, 3000)
const buf = gzipSync(JSON.stringify({ names: out, verbs: [...verbs].sort(), nouns: vocabNouns.sort() }), { level: 9 })
writeFileSync('data/selectors.json.gz', buf)
console.log(`files ${files.length}, idls ${nIdl}, instructions ${ins.size}, accounts ${accs.size}, events ${evs.size}, names ${Object.keys(out).length}, vocab ${verbs.size} verbs x ${vocabNouns.length} nouns, gz ${buf.length} bytes`)
