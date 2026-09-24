// Harvest Anchor instruction / account / event names from public GitHub code (via `gh` CLI).
// Output: data-src/gh-names.json  { instructions: string[], accounts: string[], events: string[] }
// usage: node scripts/gh-anchor-names.ts [maxFiles=3000]
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const maxFiles = Number(process.argv[2] ?? 3000)
const out = 'data-src/gh-names.json'
mkdirSync('data-src', { recursive: true })
const state = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : { instructions: [], accounts: [], events: [], seen: [] }
const ins = new Set<string>(state.instructions), accs = new Set<string>(state.accounts), evs = new Set<string>(state.events)
const seen = new Set<string>(state.seen)
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const gh = (args: string[]) => execFileSync('gh', args, { maxBuffer: 1 << 26 }).toString()
const save = () => writeFileSync(out, JSON.stringify({ instructions: [...ins].sort(), accounts: [...accs].sort(), events: [...evs].sort(), seen: [...seen] }))

function extract(src: string) {
	for (const m of src.matchAll(/pub fn (\w+)\s*(?:<[^>]*>)?\s*\(\s*(?:mut\s+)?\w+\s*:\s*Context</g)) ins.add(m[1])
	for (const m of src.matchAll(/#\[account(?:\([^)]*\))?\]\s*(?:#\[[^\]]*\]\s*)*pub struct (\w+)/g)) accs.add(m[1])
	for (const m of src.matchAll(/#\[event\]\s*(?:#\[[^\]]*\]\s*)*pub struct (\w+)/g)) evs.add(m[1])
}

// code search returns at most 1000 hits per query: partition by file size
const queries: string[] = []
for (const q of ['"Context<" "#[program]"', '"Context<" "pub fn" anchor_lang', '"#[account]" "pub struct"', '"#[event]" "pub struct"']) {
	for (const [lo, hi] of [[0, 2000], [2000, 4000], [4000, 7000], [7000, 12000], [12000, 20000], [20000, 40000], [40000, 400000]]) queries.push(`${q} language:rust size:${lo}..${hi}`)
}
let files = seen.size
for (const q of queries) {
	for (let page = 1; page <= 10 && files < maxFiles; page++) {
		let res: any
		try { res = JSON.parse(gh(['api', '-X', 'GET', 'search/code', '-f', `q=${q}`, '-f', 'per_page=100', '-f', `page=${page}`])) }
		catch (e) { console.log('search error, waiting', String(e).slice(0, 120)); await sleep(65000); continue }
		const items: any[] = res.items ?? []
		if (!items.length) break
		for (const it of items) {
			const key = `${it.repository.full_name}/${it.path}`
			if (seen.has(key)) continue
			seen.add(key)
			try {
				const c = JSON.parse(gh(['api', `repos/${it.repository.full_name}/contents/${it.path}`]))
				extract(Buffer.from(c.content, 'base64').toString('utf8'))
				files++
			} catch { /* skip */ }
			if (files % 50 === 0) { save(); console.log(`files ${files} ix ${ins.size} accounts ${accs.size} events ${evs.size}`) }
		}
		await sleep(7000) // search API: 10 requests / minute
	}
}
save()
console.log(`done: files ${files} ix ${ins.size} accounts ${accs.size} events ${evs.size}`)
