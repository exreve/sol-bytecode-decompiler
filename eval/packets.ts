// Generate the reviewer packets from eval/cases.json: eval/packets/<prog_NN>/full/ (the CLI project output, security/
// included) and code/ (index.ts, lib.d.ts, bundle/*.ts and the shared files they import; no security/ folder and no
// pointer to it). Binaries and IDLs are copied under their neutral id first, so no file or program name hints at the case.
// usage: node eval/packets.ts [prog_NN ...]
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const E = dirname(fileURLToPath(import.meta.url)), ROOT = join(E, '..')
const cases = JSON.parse(readFileSync(join(E, 'cases.json'), 'utf8')).cases
const only = process.argv.slice(2)
const statsFile = join(E, 'packets', 'stats.json')
const stats: Record<string, { code: Size; full: Size }> = existsSync(statsFile) ? JSON.parse(readFileSync(statsFile, 'utf8')).packets : {}
interface Size { files: number; lines: number; kb: number }

// bench variants drop accounts from an instruction: the IDL they were built with (as bench/run.ts)
function patchIdl(idl: any, patch: Record<string, string>): any {
	const out = structuredClone(idl)
	for (const [ix, accs] of Object.entries(patch)) {
		const i = out.instructions.find((x: any) => x.name === ix)
		i.accounts = accs.split(/\s+/).filter(Boolean).map(a => { const [name, f = ''] = a.split(':'); return { name, ...(f.includes('w') ? { writable: true } : {}), ...(f.includes('s') ? { signer: true } : {}) } })
	}
	return out
}

// program name / address / docs of the IDL would name the project (or the bench variant): neutral id instead
function neutral(idl: any, id: string): any {
	delete idl.address
	delete idl.docs
	if (idl.metadata) { idl.metadata.name = id; delete idl.metadata.address; delete idl.metadata.description; delete idl.metadata.repository }
	if (idl.name) idl.name = id
	return idl
}

function measure(dir: string): Size {
	const s: Size = { files: 0, lines: 0, kb: 0 }
	const walk = (d: string) => {
		for (const f of readdirSync(d)) {
			const p = join(d, f)
			if (statSync(p).isDirectory()) { walk(p); continue }
			const txt = readFileSync(p, 'utf8')
			s.files++
			s.lines += txt.split('\n').length - (txt.endsWith('\n') ? 1 : 0)
			s.kb += Buffer.byteLength(txt) / 1024
		}
	}
	walk(dir)
	s.kb = Math.round(s.kb)
	return s
}

function makeCode(full: string, code: string) {
	mkdirSync(code, { recursive: true })
	const index = readFileSync(join(full, 'index.ts'), 'utf8').replace(/^\/\/ security\/summary\.md:.*\n/m, '')
	if (index.includes('security/')) throw new Error(`${full}: index.ts still mentions security/`)
	writeFileSync(join(code, 'index.ts'), index)
	copyFileSync(join(full, 'lib.d.ts'), join(code, 'lib.d.ts'))
	// the entrypoint (dispatcher, and every handler the decompiler did not split into bundle/) is code too
	const top = new Set<string>(existsSync(join(full, 'entrypoint.ts')) ? ['entrypoint.ts'] : [])
	if (existsSync(join(full, 'bundle'))) {
		mkdirSync(join(code, 'bundle'))
		for (const f of readdirSync(join(full, 'bundle'))) {
			const txt = readFileSync(join(full, 'bundle', f), 'utf8')
			writeFileSync(join(code, 'bundle', f), txt)
			for (const m of txt.matchAll(/from '\.\.\/([\w.]+\.ts)'/g)) top.add(m[1])
		}
	} else {
		// no per-instruction bundles (native dispatch not split): the code lives in the top-level files
		for (const f of readdirSync(full)) if (f.endsWith('.ts') && f !== 'index.ts' && f !== 'lib.d.ts') top.add(f)
	}
	// top-level modules imported by what is copied (not ix/: bundle/ already inlines it)
	for (const f of [...top]) for (const m of readFileSync(join(full, f), 'utf8').matchAll(/from '\.\/([\w.]+\.ts)'/g)) top.add(m[1])
	for (const f of top) copyFileSync(join(full, f), join(code, f))
}

for (const c of cases) {
	for (const [variant, id] of Object.entries(c.packets as Record<string, string>)) {
		if (only.length && !only.includes(id)) continue
		const so = c.source === 'bench' ? join(ROOT, c.binary) : join(E, 'bin', `${c.id}@${variant}.so`)
		const idlFile = c.source === 'bench' ? (c.idl_file ? join(ROOT, c.idl_file) : undefined) : c.idl ? join(E, 'bin', `${c.id}@${variant}.json`) : undefined
		const tmp = mkdtempSync(join(tmpdir(), 'packet-'))
		copyFileSync(so, join(tmp, id + '.so'))
		const args = ['--stack-size=65500', join(ROOT, 'src/cli.ts'), join(tmp, id + '.so')]
		if (idlFile) {
			let idl = JSON.parse(readFileSync(idlFile, 'utf8'))
			if (c.idl_patch) idl = patchIdl(idl, c.idl_patch)
			writeFileSync(join(tmp, id + '.json'), JSON.stringify(neutral(idl, id), null, '\t'))
			args.push('--idl', join(tmp, id + '.json'))
		}
		const dir = join(E, 'packets', id), full = join(dir, 'full'), code = join(dir, 'code')
		rmSync(dir, { recursive: true, force: true })
		const t = Date.now()
		execFileSync(process.execPath, [...args, '-o', full + '/'], { cwd: tmp, stdio: ['ignore', 'ignore', 'inherit'] })
		rmSync(tmp, { recursive: true, force: true })
		makeCode(full, code)
		stats[id] = { code: measure(code), full: measure(full) }
		console.log(id, `${((Date.now() - t) / 1000).toFixed(1)}s`, 'code', stats[id].code, 'full', stats[id].full)
	}
}
// packets depend on the decompiler version: record it (the packet directories themselves are not committed)
const decompiler = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT }).toString().trim()
writeFileSync(statsFile, JSON.stringify({ decompiler, packets: Object.fromEntries(Object.entries(stats).sort()) }, null, '\t') + '\n')
