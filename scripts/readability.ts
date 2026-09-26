// Readability metrics of decompiled output (dev tool): raw memory accesses vs named field accesses.
//   node --stack-size=65500 scripts/readability.ts prog.so|out.ts … [--idl x.json] [--json]
// A .so is decompiled as the CLI does (single-file output); a .ts is measured as is.
// Counted in function bodies, outside comments and string literals:
//   code      code lines (not blank, not comment-only)
//   ld / st   raw ldN( / stN( calls; `frame` those whose address is a stack object (sNN / a named one)
//   copy      copy( / copyr( / memcpy( calls
//   fields    named field accesses (x.f, x[k].f, x.f.g count once)
//   density   (ld + st) per code line
import { readFileSync } from 'node:fs'

interface M { file: string; lines: number; bytes: number; code: number; ld: number; st: number; frameLd: number; frameSt: number; copy: number; fields: number; helpers: number }

export function measure(file: string, text: string): M {
	const m: M = { file, lines: 0, bytes: Buffer.byteLength(text), code: 0, ld: 0, st: 0, frameLd: 0, frameSt: 0, copy: 0, fields: 0, helpers: 0 }
	const lines = text.split('\n')
	m.lines = lines.length
	// frame object names: `const s30 = fp - 0x30, key = fp - 0x58` declarations
	let frameNames = new Set<string>()
	let inFn = false
	for (const raw of lines) {
		if (/^(export )?function /.test(raw)) { inFn = true; frameNames = new Set(); if (/^function (ret_tail|tail)_\d+\(/.test(raw)) m.helpers++; continue }
		if (raw === '}') { inFn = false; continue }
		if (!inFn) continue
		const code = strip(raw).trim()
		if (!code) continue
		m.code++
		const fd = code.match(/^const (.*)$/)
		if (fd && / = fp - 0x/.test(code)) for (const d of fd[1].split(', ')) { const n = d.match(/^(\w+)(?::\s*\w+)? = fp - 0x/); if (n) frameNames.add(n[1]) }
		for (const x of code.matchAll(/\b(ld|st)(8|16|32|64)\(\s*([A-Za-z_]\w*)?/g)) {
			const frame = x[3] !== undefined && (frameNames.has(x[3]) || /^s[0-9a-f]+$/.test(x[3]))
			if (x[1] === 'ld') { m.ld++; if (frame) m.frameLd++ } else { m.st++; if (frame) m.frameSt++ }
		}
		m.copy += [...code.matchAll(/\b(copyr?|memcpy)\(/g)].length
		m.fields += [...code.matchAll(/\b[A-Za-z_]\w*(\[\d+\])?(\.[A-Za-z_]\w*(\[\d+\])?)+/g)].length
	}
	return m
}

/** a line without its comments and string literals */
function strip(s: string): string {
	let out = ''
	for (let i = 0; i < s.length; i++) {
		const c = s[i]
		if (c === '"') { i++; while (i < s.length && s[i] !== '"') i += s[i] === '\\' ? 2 : 1; out += '""'; continue }
		if (c === '/' && s[i + 1] === '/') break
		if (c === '/' && s[i + 1] === '*') { const j = s.indexOf('*/', i + 2); if (j < 0) break; i = j + 1; continue }
		out += c
	}
	return out
}

if (import.meta.main) {
	const argv = process.argv.slice(2)
	const idlAt = argv.indexOf('--idl')
	const idlPath = idlAt >= 0 ? argv[idlAt + 1] : undefined
	const files = argv.filter((a, i) => !a.startsWith('--') && (idlAt < 0 || i !== idlAt + 1))
	const rows: M[] = []
	for (const f of files) {
		let text: string
		if (f.endsWith('.so')) {
			const { decompile } = await import('../src/decompile.ts')
			const { parseIdl } = await import('../src/idl.ts')
			const idl = idlPath ? parseIdl(JSON.parse(readFileSync(idlPath, 'utf8'))) : undefined
			text = decompile(new Uint8Array(readFileSync(f)), { idl }).text
		} else text = readFileSync(f, 'utf8')
		rows.push(measure(f.replace(/^.*\//, ''), text))
	}
	if (argv.includes('--json')) console.log(JSON.stringify(rows, null, 1))
	else {
		const cols: [string, (m: M) => string][] = [
			['file', m => m.file], ['lines', m => `${m.lines}`], ['KiB', m => `${Math.round(m.bytes / 1024)}`], ['code', m => `${m.code}`],
			['ld', m => `${m.ld}`], ['st', m => `${m.st}`], ['ld+st', m => `${m.ld + m.st}`], ['frame ld/st', m => `${m.frameLd}/${m.frameSt}`],
			['copy', m => `${m.copy}`], ['fields', m => `${m.fields}`], ['density', m => ((m.ld + m.st) / Math.max(1, m.code)).toFixed(3)], ['helpers', m => `${m.helpers}`],
		]
		const tab = [cols.map(c => c[0]), ...rows.map(r => cols.map(c => c[1](r)))]
		const w = cols.map((_, i) => Math.max(...tab.map(r => r[i].length)))
		for (const r of tab) console.log(r.map((x, i) => (i ? x.padStart(w[i]) : x.padEnd(w[i]))).join('  '))
	}
}
