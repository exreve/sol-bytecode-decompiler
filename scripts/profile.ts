// Per-stage timing of the pipeline (dev tool): node --stack-size=65500 scripts/profile.ts prog.so [slow-ms]
import { readFileSync } from 'node:fs'
import { loadProgram } from '../src/program.ts'
import { inferSignatures, recoverVars, type VarFunc } from '../src/dataflow.ts'
import { optimizeFunc, setFoldImage } from '../src/simplify.ts'
import { structure, cleanup } from '../src/structure.ts'
import { Semantics } from '../src/semantics.ts'
import { classify } from '../src/library.ts'
import { promoteStack } from '../src/stack.ts'
import { rewriteStackArgs } from '../src/stackargs.ts'
import { compactStores } from '../src/compact.ts'

const slow = Number(process.argv[3] ?? 200)
const tot: Record<string, number> = {}
const time = <T>(k: string, fn: () => T): T => { const t = performance.now(); const r = fn(); tot[k] = (tot[k] ?? 0) + performance.now() - t; return r }
const p = time('load', () => loadProgram(new Uint8Array(readFileSync(process.argv[2]))))
console.log('funcs', p.funcs.size, 'insns', p.insns.length)
const mem = (s: string) => { const g = (globalThis as any).gc; if (g) g(); console.log(s, Math.round(process.memoryUsage().heapUsed / 1e6), "MB heap") }
mem("after load")
time('signatures', () => inferSignatures(p))
const sem = time('semantics', () => new Semantics(p))
setFoldImage(p.image)
const libs = time('classify', () => classify(p))
mem('after signatures+semantics+classify')
const built = new Map<number, { f: VarFunc; body: any[]; irreducible: boolean }>()
for (const f0 of p.funcs.values()) {
	if (libs.get(f0.pc)?.lib) continue
	const t0 = performance.now()
	const f = time('recoverVars', () => recoverVars(p, f0))
	time('optimize', () => optimizeFunc(f))
	if (time('promote', () => promoteStack(f))) time('optimize2', () => optimizeFunc(f))
	const dt = performance.now() - t0
	if (dt > slow) console.log(f.name, 'blocks', f.blocks.length, 'vars', f.vars.length, Math.round(dt), 'ms')
	built.set(f.pc, { f, body: [], irreducible: false })
}
mem('after optimize (all functions)')
time('stackargs', () => rewriteStackArgs(p, built))
for (const bt of built.values()) {
	const t0 = performance.now()
	time('compact', () => compactStores(bt.f))
	const st = time('structure', () => structure(bt.f))
	bt.body = time('cleanup', () => cleanup(st, bt.f.returns))
	const dt = performance.now() - t0
	if (dt > slow) console.log(bt.f.name, 'structure+cleanup', Math.round(dt), 'ms')
}
void sem
for (const [k, v] of Object.entries(tot)) console.log(k.padEnd(12), Math.round(v), 'ms')
mem('after structure')
console.log('max RSS', Math.round(process.resourceUsage().maxRSS / 1024), 'MB')
