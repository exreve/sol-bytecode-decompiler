// Size budgets of the security/ files (a big program, or a large dispatcher, can make the derived views
// grow without bound: every path condition of every operation of every instruction). Detail is dropped
// lowest-priority first, each cut leaving a "… N more" note (markdown) or an `<key>_omitted` count (JSON).

/** Budgets: summary.md / <ix>.md lines, analysis.json bytes. */
export const BUDGET = { summaryLines: 150, ixLines: 400, jsonBytes: 2 * 1024 * 1024 }

interface Item { head: string; kids: string[] }
interface Section { head: string[]; items: Item[]; tail: string[]; table: boolean }

/** `## ` sections: the lines before the first item, the items (a `- ` line / table row with its indented lines), the rest. */
function sections(text: string): { pre: string[]; secs: Section[] } {
	const lines = text.replace(/\n$/, '').split('\n')
	const pre: string[] = [], secs: Section[] = []
	let cur: Section | undefined
	for (const l of lines) {
		if (l.startsWith('## ')) { secs.push(cur = { head: [l], items: [], tail: [], table: false }); continue }
		if (!cur) { pre.push(l); continue }
		const isItem = l.startsWith('- ') || (l.startsWith('|') && !/^\|[-| ]+\|$/.test(l) && cur.head.some(h => /^\|[-| ]+\|$/.test(h)))
		if (isItem && !cur.tail.length) { cur.items.push({ head: l, kids: [] }); if (l.startsWith('|')) cur.table = true; continue }
		if (l.startsWith('  ') && cur.items.length && !cur.tail.length) { cur.items[cur.items.length - 1].kids.push(l); continue }
		if (cur.items.length) cur.tail.push(l); else cur.head.push(l)
	}
	return { pre, secs }
}

/**
 * Cut a security markdown file to `max` lines. `order`: section headings (regular expressions), the first
 * dropped first; sections not listed go last. Each step keeps fewer sub-lines per item, then fewer items,
 * section by section, until the file fits.
 */
export function budgetMarkdown(text: string, max: number, order: RegExp[], where = 'analysis.json'): string {
	const count = text.split('\n').length - (text.endsWith('\n') ? 1 : 0)
	if (count <= max) return text
	const { pre, secs } = sections(text)
	const rank = (s: Section) => { const i = order.findIndex(re => re.test(s.head[0])); return i < 0 ? order.length : i }
	const byRank = [...secs].sort((a, b) => rank(a) - rank(b))
	// per section: the number of items shown, and the sub-lines shown of each item
	const lim = new Map<Section, { items: number; kids: number[] }>(secs.map(s => [s, { items: s.items.length, kids: s.items.map(it => it.kids.length) }]))
	const itemLines = (it: Item, k: number) => 1 + Math.min(k, it.kids.length) + (k > 0 && k < it.kids.length ? 1 : 0)
	const secLines = (s: Section) => {
		const l = lim.get(s)!
		let n = s.head.length + s.tail.length
		for (let i = 0; i < l.items; i++) n += itemLines(s.items[i], l.kids[i])
		return n + (l.items < s.items.length ? (s.table ? 2 : 1) : 0)
	}
	const sizes = new Map(secs.map(s => [s, secLines(s)]))
	let total = pre.length + [...sizes.values()].reduce((a, b) => a + b, 0)
	const update = (s: Section) => { const n = secLines(s); total += n - sizes.get(s)!; sizes.set(s, n) }
	// (sub-lines first: at most 3, then 1, then none, the last items first; then items: at most 20, 8, 3, then none)
	const kidSteps = [3, 1, 0].map(k => function* (s: Section) { const l = lim.get(s)!; for (let i = s.items.length - 1; i >= 0; i--) if (l.kids[i] > k) { l.kids[i] = k; update(s); yield } })
	const itemSteps = [20, 8, 3, 0].map(k => function* (s: Section) { const l = lim.get(s)!; if (l.items > k) { l.items = k; update(s); yield } })
	const steps = [...kidSteps, ...itemSteps]
	// (step k of the section ranked r at time k + r: a section is cut down further than the ones after it)
	const plan: [number, number, Section][] = []
	byRank.forEach((s, r) => steps.forEach((_, k) => plan.push([k + r, k, s])))
	plan.sort((a, b) => a[0] - b[0])
	outer: for (const [, k, s] of plan) for (const _ of steps[k](s)) if (total <= max) break outer
	const out = [...pre]
	for (const s of secs) {
		const l = lim.get(s)!
		out.push(...s.head)
		s.items.slice(0, l.items).forEach((it, i) => {
			const k = l.kids[i], cut = it.kids.length - k
			if (cut <= 0) out.push(it.head, ...it.kids)
			else if (k === 0) out.push(`${it.head}${s.table ? '' : ` (… ${cut} more line${cut > 1 ? 's' : ''})`}`)
			else out.push(it.head, ...it.kids.slice(0, k), `  - … ${cut} more`)
		})
		const n = s.items.length - l.items
		if (n > 0) { if (s.table) out.push(''); out.push(`- … ${n} more in ${where}`) }
		out.push(...s.tail)
	}
	return out.join('\n') + '\n'
}

/** Section order for security/<ix>.md (dropped first → last). */
export const IX_ORDER = [/Path conditions/, /Relations/, /Trust/, /Authorization chains/, /Proof trees/, /Arithmetic/, /Dominance/, /Authority/, /^## Checks/, /Operations/, /PDAs derived/, /CPIs/, /Constraints per account/, /Findings/, /Account privileges/, /Look first/]
/** Section order for security/summary.md. */
export const SUMMARY_ORDER = [/Read\/write dependencies/, /State machine/, /Authority fields/, /State writes/, /^## PDAs/, /not attributed/, /Findings/, /Instructions/]

/**
 * Cut security/analysis.json to `max` bytes: lowest-priority detail first (path conditions, bypass paths,
 * authorization chains, …), each array cut leaving `<key>_omitted: n` next to it and the cuts listed
 * under `budget`.
 */
export function budgetJson(text: string, max: number): string {
	if (text.length <= max) return text
	const doc = JSON.parse(text)
	const omitted: Record<string, number> = {}
	const cap = (o: any, key: string, n: number, label: string) => {
		const a = o?.[key]
		if (!Array.isArray(a) || a.length <= n) return
		const k = a.length - n
		o[key] = a.slice(0, n)
		o[`${key}_omitted`] = (o[`${key}_omitted`] ?? 0) + k
		omitted[label] = (omitted[label] ?? 0) + k
	}
	const ixs: any[] = doc.instructions ?? []
	const each = (f: (ix: any) => void) => { for (const ix of ixs) f(ix) }
	// (exact duplicate findings first: no detail lost)
	if (Array.isArray(doc.findings)) {
		const seen = new Set<string>(), n = doc.findings.length
		doc.findings = doc.findings.filter((f: any) => { const k = JSON.stringify(f); if (seen.has(k)) return false; seen.add(k); return true })
		if (doc.findings.length < n) omitted['findings (duplicates)'] = n - doc.findings.length
	}
	const steps: (() => void)[] = [
		() => each(ix => { for (const p of ix.path_conditions ?? []) { cap(p, 'conditions', 12, 'path_conditions[].conditions'); cap(p, 'not_required', 4, 'path_conditions[].not_required'); for (const x of p.not_required ?? []) cap(x, 'path', 6, 'path_conditions[].not_required[].path') } }),
		() => each(ix => { for (const o of ix.operations ?? []) { cap(o, 'bypass', 3, 'operations[].bypass'); for (const b of o.bypass ?? []) cap(b, 'path', 6, 'operations[].bypass[].path'); cap(o, 'sources', 8, 'operations[].sources') } }),
		() => { if (Array.isArray(doc.findings)) { const per = new Map<string, number>(); const n = doc.findings.length; doc.findings = doc.findings.filter((f: any) => { const k = `${f.rule}@${f.instruction}`; const c = per.get(k) ?? 0; per.set(k, c + 1); return c < 25 }); if (doc.findings.length < n) { doc.findings_omitted = (doc.findings_omitted ?? 0) + n - doc.findings.length; omitted['findings (beyond 25 per rule and instruction)'] = n - doc.findings.length } } },
		() => each(ix => { cap(ix, 'path_conditions', 24, 'path_conditions'); cap(ix, 'auth_chains', 12, 'auth_chains'); cap(ix, 'relations', 30, 'relations'); cap(ix, 'trust', 40, 'trust') }),
		() => each(ix => { for (const p of ix.path_conditions ?? []) cap(p, 'conditions', 4, 'path_conditions[].conditions'); for (const c of ix.auth_chains ?? []) cap(c, 'chains', 2, 'auth_chains[].chains'); cap(ix, 'proof', 24, 'proof'); cap(ix, 'authority', 24, 'authority') }),
		() => each(ix => { cap(ix, 'path_conditions', 0, 'path_conditions'); cap(ix, 'auth_chains', 0, 'auth_chains'); cap(ix, 'relations', 0, 'relations'); cap(ix, 'proof', 0, 'proof'); cap(ix, 'arithmetic', 40, 'arithmetic'); cap(ix, 'functions', 60, 'functions') }),
		() => each(ix => { for (const o of ix.operations ?? []) { cap(o, 'bypass', 0, 'operations[].bypass'); cap(o, 'guarded_by', 16, 'operations[].guarded_by') }; cap(ix, 'checks', 150, 'checks'); cap(ix, 'operations', 150, 'operations'); cap(ix, 'trust', 0, 'trust'); cap(ix, 'authority', 0, 'authority') }),
		() => { cap(doc, 'findings', 300, 'findings'); cap(doc, 'unattributed_operations', 100, 'unattributed_operations'); cap(doc, 'state_writes', 200, 'state_writes'); each(ix => { cap(ix, 'checks', 60, 'checks'); cap(ix, 'operations', 60, 'operations'); cap(ix, 'arithmetic', 0, 'arithmetic'); cap(ix, 'divisions', 20, 'divisions') }) },
	]
	const out = () => JSON.stringify({ ...doc, budget: { max_bytes: max, note: 'detail dropped to fit the size budget, lowest priority first (<key>_omitted: entries cut from that list); the decompiled code is complete', omitted } }, null, 1) + '\n'
	let s = out()
	for (const step of steps) {
		if (s.length <= max) break
		step()
		s = out()
	}
	return s
}
