// Function discovery coverage: how many instructions are reachable from discovered functions
import { readFileSync } from 'node:fs'
import { loadProgram } from '../src/program.ts'
const p = loadProgram(new Uint8Array(readFileSync(process.argv[2])))
const cov = new Uint8Array(p.insns.length)
for (const f of p.funcs.values()) for (const b of f.blocks) for (let i = b.start; i <= b.end; i++) cov[i] = 1
let n = 0; for (const c of cov) n += c
let calls = 0, unres = 0, callx = 0
for (const f of p.funcs.values()) for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'call') { calls++; if (s.t.k === 'ind') callx++ }
for (const f of p.funcs.values()) for (const b of f.blocks) if (b.term.k === 'trap' && b.term.msg.startsWith('unresolved')) unres++
console.log(`v${p.version} insns ${p.insns.length} covered ${n} (${(100 * n / p.insns.length).toFixed(1)}%) funcs ${p.funcs.size} calls ${calls} callx ${callx} unresolved ${unres} syscalls ${[...p.syscalls.keys()].join(',')}`)
// largest uncovered gaps
const gaps: [number, number][] = []
for (let i = 0; i < cov.length;) { if (cov[i]) { i++; continue } let j = i; while (j < cov.length && !cov[j]) j++; gaps.push([i, j - i]); i = j }
gaps.sort((a, b) => b[1] - a[1]); console.log('gaps', gaps.slice(0, 5))
