// Security-oriented slices: derived, UNVERIFIED views of the (verified) output, written to separate
// files (slices/<kind>.txt in the project layout) and never mixed into the verified code.
//
// For every sink line of a kind (CPIs, PDA derivations, account checks, writes to accounts), a slice
// shows: the instruction handlers that reach the function, the conditions it runs under (enclosing
// blocks and earlier early-exit checks at each level), the sink line, and the definitions of the
// variables used there (transitively, within the function). The slices are read off the printed text;
// they omit everything else, so they are an index into the code, not a replacement for it.
import type { FuncOut } from './decompile.ts'

export interface SliceKind { key: string; title: string; match: (line: string) => boolean; maxGuards?: number; defs?: boolean }

export const SLICE_KINDS: SliceKind[] = [
	{ key: 'cpi', title: 'cross-program invocations (CPI) and the code guarding / feeding them', match: l => /\/\/ CPI\b|\bsol_invoke_signed_(c|rust)\(|\binvoke_signed\w*\(/.test(l) },
	{ key: 'pda', title: 'PDA derivations (seeds) and what they depend on', match: l => /\/\/ PDA\b/.test(l) },
	{
		key: 'account_checks', title: 'account checks: conditions on signer / writable flags, owners, keys; Anchor constraint errors',
		match: l => (/^\s*(if|\} else if|while) \(/.test(l) && /\.(is_signer|is_writable|executable|owner|key)\b|\bkeyeq\(|\bmemeq\(/.test(l))
			|| (/anchor::(Constraint\w+|AccountNot\w+|AccountOwnedByWrongProgram|InvalidProgramId)/.test(l) && !/^\s*\/\//.test(l)),
		maxGuards: 3, defs: false,
	},
	{ key: 'account_writes', title: 'writes to account data and lamports (typed account fields, data / lamport cells)', match: l => /^\s*[a-z_][a-z0-9_]*(\[\d+\])?\.(data\.)?[a-z_][a-z0-9_.]* = /.test(l) && !/\.(borrow|strong|weak|dup_marker) = /.test(l) },
]

interface Line { text: string; depth: number }

const depthOf = (l: string) => { let d = 0; while (l[d] === '\t') d++; return d }

/** Enclosing block headers and earlier early-exit checks of line i (outermost first). */
function guards(lines: Line[], i: number): string[] {
	const out: string[] = []
	let d = lines[i].depth
	let j = i - 1
	// earlier siblings at depth d: `if (c) { … return }` exits
	const scanSiblings = (from: number) => {
			const found: string[] = []
			for (let k = from; k >= 0 && lines[k].depth >= d; k--) {
				const t = lines[k].text.trim()
				if (lines[k].depth !== d || !/^if \(/.test(t) || !t.endsWith('{')) continue
				// the block's last line before its closing brace
				let e = k + 1
				while (e < lines.length && !(lines[e].depth === d && lines[e].text.trim().startsWith('}'))) e++
				const last = lines[e - 1]?.text.trim() ?? ''
				if (lines[e]?.text.trim() === '}' && /^(return\b|break\b|continue\b|trap\(|abort\()/.test(last)) found.push(`not ${t.slice(3, -2).trim()}  (earlier: exits otherwise)`)
			}
		return found.reverse()
	}
	while (d > 1 && j >= 0) {
		const sib = scanSiblings(j)
		// the header of the enclosing block
		while (j >= 0 && !(lines[j].depth === d - 1 && lines[j].text.trimEnd().endsWith('{'))) j--
		if (j < 0) break
		const h = lines[j].text.trim()
		let head = h
		if (/^\} else \{$/.test(h)) {
			// the if chain it belongs to
			let k = j - 1
			while (k >= 0 && !(lines[k].depth === d - 1 && /^(if \(|\} else if \()/.test(lines[k].text.trim()))) k--
			head = k >= 0 ? `else of: ${lines[k].text.trim().replace(/^\} /, '')}` : h
		}
		out.unshift(...sib.map(x => `${'  '.repeat(d - 1)}${x}`))
		out.unshift(`${'  '.repeat(d - 2)}${head}`)
		d--
		j--
	}
	// early exits at the top level of the function body
	if (d === 1 && j >= 0) out.unshift(...scanSiblings(j))
	return out
}

/** Definitions (within the function) of the identifiers used by the given lines, transitively. */
function defsFor(lines: Line[], uses: string[], limit = 12): string[] {
	const want = new Set<string>()
	for (const u of uses) for (const m of u.replace(/\/\*.*?\*\/|\/\/.*$|"(?:[^"\\]|\\.)*"/g, '').matchAll(/\b[a-z_][a-z0-9_]*\b/g)) want.add(m[0])
	const seen = new Set<number>(), out: number[] = []
	const queue = [...want]
	for (let q = 0; q < queue.length && out.length < limit; q++) {
		const id = queue[q]
		for (let k = 0; k < lines.length; k++) {
			const t = lines[k].text.trim()
			const m = /^(?:const |let )?([a-z_][a-z0-9_]*)(?::\s*\w+)? = (.*)$/.exec(t)
			if (!m || m[1] !== id || seen.has(k) || / = fp - 0x/.test(t)) continue
			seen.add(k); out.push(k)
			for (const x of m[2].replace(/\/\*.*?\*\/|"(?:[^"\\]|\\.)*"/g, '').matchAll(/\b[a-z_][a-z0-9_]*\b/g)) if (!want.has(x[0])) { want.add(x[0]); queue.push(x[0]) }
		}
	}
	return out.sort((a, b) => a - b).map(k => lines[k].text.trim())
}

/** One slice file per kind: path -> text (empty kinds omitted). */
export function renderSlices(funcs: FuncOut[], reachers: (f: FuncOut) => string[]): Map<string, string> {
	const files = new Map<string, string>()
	for (const kind of SLICE_KINDS) {
		const parts: string[] = []
		let n = 0
		for (const f of funcs) {
			const raw = f.text.split('\n')
			const lines: Line[] = raw.map(t => ({ text: t, depth: depthOf(t) }))
			const hits: number[] = []
			raw.forEach((t, i) => {
				if (!kind.match(t)) return
				// a comment line describes the statement after it: one entry for both
				const prev = hits[hits.length - 1]
				if (prev !== undefined && prev === i - 1 && /^\s*\/\//.test(raw[prev])) return
				hits.push(i)
			})
			if (!hits.length) continue
			const sig = raw.find(l => l.startsWith('function '))?.replace(/ \{$/, '') ?? f.name
			const who = reachers(f)
			parts.push(`== ${sig}`, `   reached from: ${who.length ? who.join(', ') : '(no instruction handler reaches it through direct calls: entrypoint code, or called through a function pointer)'}`)
			for (const i of hits) {
				// a comment line describes the statement after it
				const at = /^\s*\/\//.test(raw[i]) && i + 1 < raw.length ? i + 1 : i
				const all = guards(lines, at), max = kind.maxGuards ?? 12
				const g = all.length > max ? all.slice(-max) : all
				const defs = kind.defs === false ? [] : defsFor(lines, [raw[i], raw[at], ...g])
				parts.push('', `   line ${at + 1}:`)
				if (g.length) parts.push(`   under${all.length > g.length ? ` (innermost ${g.length} of ${all.length})` : ''}:`, ...g.map(x => `     ${x.trim()}`))
				if (defs.length) parts.push('   using:', ...defs.map(x => `     ${x}`))
				if (at !== i) parts.push(`   ${raw[i].trim()}`)
				parts.push(`   > ${raw[at].trim()}`)
				n++
			}
			parts.push('')
		}
		if (!n) continue
		files.set(`slices/${kind.key}.txt`, [
			`UNVERIFIED VIEW — derived from the verified decompiled code (see ../index.ts); not executable and not checked for`,
			`equivalence. Each entry: the function, the instruction handlers reaching it, the conditions the line runs under`,
			`(enclosing blocks, earlier early exits), the definitions it uses (same function), and the line itself.`,
			`Line numbers count from the function's first line (its header comments included).`,
			``,
			`${kind.title}: ${n} site${n === 1 ? '' : 's'}`,
			``,
			...parts,
		].join('\n'))
	}
	return files
}
