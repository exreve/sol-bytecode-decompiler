// Label verification of the bench/real variants (bench/README.md, "Realistic and open-source sets"): decompiles every
// variant's clean build and the variant as the CLI project does and prints, at the variant's instruction, the evidence
// that the removed validation is in the clean build's code and not in the variant's:
//  - code: check-related tokens of the instruction's decompiled bundle (bundle/<ix>.ts) whose count differs: Anchor
//    error constants (`anchor::ConstraintHasOne`), ProgramError returns, logged messages, the Anchor account types
//    whose try_accounts the handler calls (`Signer::try_accounts`), is_signer reads, memcmp calls, PDA derivations;
//  - analysis: per-account checks of security/analysis.json found in one build and not in the other.
// The expected file records the result (variants.<v>.verified: code / analysis, plus a hand-written note where the tokens
// do not show it). usage: node bench/real/verify.ts [--write] [filter]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { decompile } from '../../src/decompile.ts'
import { renderProject } from '../../src/layout.ts'
import { parseIdl } from '../../src/idl.ts'

const BENCH = join(dirname(fileURLToPath(import.meta.url)), '..')
const write = process.argv.includes('--write')
const filter = process.argv.slice(2).find(a => !a.startsWith('-'))
const json = (x: any) => JSON.stringify(x, null, '\t').replace(/\[\n\t+([^\[\]{}]*?)\n\t+\]/g, (_, b: string) => `[${b.replace(/\n\t+/g, ' ')}]`) + '\n'

function project(so: string, idl: any): Map<string, string> {
	return renderProject(decompile(readFileSync(join(BENCH, 'bin', so)), { idl: idl ? parseIdl(idl) : undefined }))
}

function patchIdl(idl: any, patch: Record<string, string>): any {
	const out = structuredClone(idl)
	for (const [ix, accs] of Object.entries(patch)) {
		const i = out.instructions.find((x: any) => x.name === ix)
		i.accounts = accs.split(/\s+/).filter(Boolean).map(a => { const [name, f = ''] = a.split(':'); return { name, ...(f.includes('w') ? { writable: true } : {}), ...(f.includes('s') ? { signer: true } : {}) } })
	}
	return out
}

/** instruction of the analysis: Anchor by name, native by dispatch tag */
function ixOf(a: any, name: string, tag?: number): any {
	return a.instructions.find((x: any) => tag !== undefined ? new RegExp(`^tag ${tag}\\b`).test(x.dispatch ?? '') : x.name === name)
}

/** check-related tokens of a decompiled bundle, with counts */
function tokens(code: string): Map<string, number> {
	const out = new Map<string, number>()
	const add = (t: string) => out.set(t, (out.get(t) ?? 0) + 1)
	for (const m of code.matchAll(/\/\* ((?:anchor::|Err\()[^*]*?) \*\//g)) add(m[1])
	for (const m of code.matchAll(/sol_log\("([^"]*)"/g)) add(`log "${m[1]}"`)
	for (const m of code.matchAll(/^declare function \w+\(.*\/\/ lib <([\w:]+)(?:<[^>]*>)? as anchor_lang::Accounts<B>>::try_accounts/gm)) add(`${m[1].split('::').pop()}::try_accounts`)
	for (const m of code.matchAll(/\.is_signer\b/g)) add('.is_signer read')
	for (const m of code.matchAll(/\bmemcmp\(/g)) add('memcmp')
	for (const m of code.matchAll(/\b(\w*(?:create_program_address|find_program_address))\(/g)) add(m[1])
	return out
}

function constraints(ix: any): Set<string> {
	const s = new Set<string>()
	for (const acc of ix?.accounts ?? []) for (const [k, v] of Object.entries(acc.constraints) as [string, any][]) if (v.status === 'found' || v.status === 'partial') s.add(`${acc.name}.${k}`)
	for (const r of ix?.relations ?? []) s.add(`${r.kind} ${[r.a, r.b].sort().join(' ~ ')}`)
	return s
}

for (const f of readdirSync(join(BENCH, 'expected')).filter(f => f.endsWith('.json')).sort()) {
	const exp = JSON.parse(readFileSync(join(BENCH, 'expected', f), 'utf8'))
	const prog = f.slice(0, -5)
	if (exp.set !== 'oss' || (filter && !prog.includes(filter))) continue
	const idl = exp.idl ? JSON.parse(readFileSync(join(BENCH, 'idl', exp.idl), 'utf8')) : undefined
	const base = project(prog + '.so', idl), ba = JSON.parse(base.get('security/analysis.json')!)
	for (const [v, ve] of Object.entries(exp.variants) as [string, any][]) {
		const tag = exp.instructions[ve.ix]?.tag
		const vp = project(`${prog}@${v}.so`, idl && ve.idl ? patchIdl(idl, ve.idl) : idl), va = JSON.parse(vp.get('security/analysis.json')!)
		const bi = ixOf(ba, ve.ix, tag), vi = ixOf(va, ve.ix, tag)
		console.log(`${prog}@${v} (${ve.ix}${tag !== undefined ? `, tag ${tag}` : ''})`)
		if (!bi || !vi) { console.log(`  instruction not found (base ${!!bi}, variant ${!!vi})`); continue }
		const bt = tokens(base.get(`bundle/${bi.name}.ts`) ?? ''), vt = tokens(vp.get(`bundle/${vi.name}.ts`) ?? '')
		const diff: string[] = []
		for (const k of new Set([...bt.keys(), ...vt.keys()])) {
			const d = (vt.get(k) ?? 0) - (bt.get(k) ?? 0)
			if (d) diff.push(`${d > 0 ? '+' : ''}${d} ${k}`)
		}
		const code = diff.join(', ') || 'no check-related token differs'
		console.log(`  code: ${code}`)
		const bc = constraints(bi), vc = constraints(vi)
		const gone = [...bc].filter(c => !vc.has(c)), added = [...vc].filter(c => !bc.has(c))
		const analysis = `${gone.length ? `found in the clean build only: ${gone.join(', ')}` : 'no check found only in the clean build'}${added.length ? `; in the variant only: ${added.join(', ')}` : ''}`
		console.log(`  analysis: ${analysis}`)
		if (ve.verified?.note) console.log(`  note: ${ve.verified.note}`)
		ve.verified = { code, analysis, ...(ve.verified?.note ? { note: ve.verified.note } : {}) }
	}
	if (write) writeFileSync(join(BENCH, 'expected', f), json(exp))
}
