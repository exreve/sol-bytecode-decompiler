// If-conversion: branches whose arms only assign variables become selects.
//
//   A: ...; br c ? T : J        T: x = e; jmp J               A: ...; x = c ? e : x; jmp J
//   A: ...; br c ? T : F        T: x = e1; <t>, F: x = e2; <t>  A: ...; x = c ? e1 : e2; <t>
//
// (<t> = the same terminator in both arms, e.g. the same jump or the same conditional branch.)
// The simplifier then turns flag selects (`c ? 0 : 1`) into booleans and min/max/clz patterns into
// helpers. Exact because:
//  - c is evaluated exactly once, at the same point (end of A) as the branch it replaces
//    (when several variables need it, it is first stored in a fresh temporary);
//  - arm expressions are pure (no loads, calls or traps), so evaluating them unconditionally is
//    unobservable; they see the same variable values as before (nothing sits between the end of A
//    and the arm, and no arm expression reads a variable assigned by an arm);
//  - the shared terminator runs after all assignments, which give every variable the value it had
//    at the end of the taken arm;
//  - `x` on the untaken side is only read where x is definitely assigned (or a parameter), so the
//    printed program never reads an uninitialized variable.
import type { VarFunc } from './dataflow.ts'
import type { Block } from './program.ts'
import { type Expr, type Stmt, type Term, walkExpr, hasSideEffectsOrMem, exprSize, exprEq, NEG_CMP } from './ir.ts'

const pure = (e: Expr) => { const s = hasSideEffectsOrMem(e); return !s.load && !s.call && !s.trap }
const hasUndef = (e: Expr) => { let u = false; walkExpr(e, x => { if (x.k === 'undef') u = true }); return u }
const readsAny = (e: Expr, vs: Set<number>) => { let r = false; walkExpr(e, x => { if (x.k === 'var' && vs.has(x.id)) r = true }); return r }

type Assign = Map<number, Expr> // var -> expression assigned by an arm

/** Arm block: only pure `x = e` statements over distinct variables. */
function armAssigns(b: Block, maxStmts: number): Assign | null {
	if (b.stmts.length > maxStmts) return null
	const m: Assign = new Map()
	for (const s of b.stmts) {
		if (s.k !== 'set' || m.has(s.dst) || !pure(s.e) || hasUndef(s.e)) return null
		m.set(s.dst, s.e)
	}
	return m
}

/**
 * Whether variable v is definitely assigned at the end of block a (forward must-analysis:
 * block 0 starts with the parameters, out = in ∪ assigned, in = ∩ of the predecessors' out).
 *
 * Asked per (block, variable) instead of solving the analysis for every block and variable: the
 * problem is distributive (gen only), so its maximal fixpoint is the meet over all paths: v is NOT
 * definitely assigned at the end of a exactly when a path from the start of block 0 (v not a
 * parameter) to the end of a passes no block assigning v. That is a backward search from a over
 * `preds` that stops at blocks assigning v; blocks other than 0 without predecessors are
 * unreachable, where the fixpoint holds every variable, and so are dead ends. (The former version
 * re-solved the bit-vector problem for all blocks, allocating fresh vectors for every block on
 * every pass, after each conversion; the answers are the same.)
 */
function definitelyAssigned(f: VarFunc) {
	const seen = new Int32Array(f.blocks.length)
	let stamp = 0
	const gens = new Map<number, Set<number>>() // block -> variables it assigns (until its statements change)
	const gen = (b: Block): Set<number> => {
		let g = gens.get(b.id)
		if (!g) {
			g = new Set()
			// `x = undef` does not count: readable output omits it
			for (const s of b.stmts) if ((s.k === 'set' && s.e.k !== 'undef') || (s.k === 'call' && s.dst >= 0)) g.add(s.dst)
			gens.set(b.id, g)
		}
		return g
	}
	return {
		/** Block b's statements changed. */
		invalidate: (b: number) => { gens.delete(b) },
		at: (a: number, v: number): boolean => {
			const param = f.vars[v].param >= 0
			const st = ++stamp
			const stack = [a]
			seen[a] = st
			while (stack.length) {
				const b = f.blocks[stack.pop()!]
				if (gen(b).has(v)) continue
				if (b.id === 0 && !param) return false
				for (const p of b.preds) if (seen[p] !== st) { seen[p] = st; stack.push(p) }
			}
			return true
		},
	}
}

/** Identical terminators (so two arms can share one). exprEq never equates calls. */
function sameTerm(x: Term, y: Term): boolean {
	if (x.k !== y.k) return false
	switch (x.k) {
		case 'jmp': return x.to === (y as typeof x).to
		case 'br': {
			const z = y as typeof x
			if (x.t === z.t && x.f === z.f) return exprEq(x.c, z.c)
			// `br c ? X : Y` == `br !c ? Y : X`
			const n = x.c.k === 'cmp' ? NEG_CMP[x.c.op] : null
			return x.t === z.f && x.f === z.t && n !== null && x.c.k === 'cmp' && exprEq({ ...x.c, op: n }, z.c)
		}
		case 'ret': { const z = y as typeof x; return x.e === null ? z.e === null : z.e !== null && exprEq(x.e, z.e) }
		default: return false
	}
}

export function ifConvert(f: VarFunc, maxStmts = 3): boolean {
	const da = definitelyAssigned(f)
	let changed = false
	for (const a of f.blocks) {
		const t = a.term
		if (t.k !== 'br' || t.t === t.f) continue
		const T = f.blocks[t.t], F = f.blocks[t.f]
		const single = (x: Block) => x.id !== 0 && x.id !== a.id && x.preds.length === 1
		let next: Term, arms: Block[], onT: Assign | null, onF: Assign | null
		if (single(T) && T.term.k === 'jmp' && T.term.to === F.id) {          // triangle, arm on the true side
			onT = armAssigns(T, maxStmts); onF = new Map(); next = { k: 'jmp', to: F.id }; arms = [T]
		} else if (single(F) && F.term.k === 'jmp' && F.term.to === T.id) {   // triangle, arm on the false side
			onT = new Map(); onF = armAssigns(F, maxStmts); next = { k: 'jmp', to: T.id }; arms = [F]
		} else if (single(T) && single(F) && sameTerm(T.term, F.term)) {       // diamond (arms end identically)
			onT = armAssigns(T, maxStmts); onF = armAssigns(F, maxStmts); next = { ...T.term } as Term; arms = [T, F]
		} else continue
		if (!onT || !onF) continue
		const succs = next.k === 'jmp' ? [next.to] : next.k === 'br' ? [next.t, next.f] : []
		if (new Set(succs).size !== succs.length || succs.some(s => s === a.id || arms.some(b => b.id === s))) continue
		const targets = new Set([...onT.keys(), ...onF.keys()])
		if ([...onT.values(), ...onF.values()].some(e => readsAny(e, targets))) continue
		// the untaken side keeps the old value: it must be definitely assigned at the end of A
		const oneSided = [...targets].filter(v => !(onT.has(v) && onF.has(v)))
		if (oneSided.some(v => !da.at(a.id, v))) continue
		const x = (v: number): Expr => ({ k: 'var', id: v })
		const differ = [...targets].filter(v => !(onT.has(v) && onF.has(v) && exprEq(onT.get(v)!, onF.get(v)!)))
		const stmts: Stmt[] = []
		let c = t.c
		const pc = (T.stmts[0] ?? F.stmts[0])?.pc ?? 0
		if (differ.length > 1 && !(pure(c) && exprSize(c) <= 3 && !readsAny(c, targets))) {
			const tv = f.vars.length
			f.vars.push({ id: tv, reg: -1, param: -1, undef: false })
			stmts.push({ k: 'set', dst: tv, e: c, pc })
			c = x(tv)
		} else if (differ.length === 0 && !pure(c)) stmts.push({ k: 'eval', e: c, pc })
		for (const v of targets) {
			const e: Expr = differ.includes(v) ? { k: 'sel', c, a: onT.get(v) ?? x(v), b: onF.get(v) ?? x(v) } : onT.get(v)!
			stmts.push({ k: 'set', dst: v, e, pc })
		}
		// A takes over the arms' common continuation; the arm blocks become unreachable
		a.stmts.push(...stmts)
		a.term = next
		a.succs = succs
		for (const s of new Set(succs)) {
			const S = f.blocks[s]
			S.preds = S.preds.filter(p => p !== a.id && !arms.some(b => b.id === p))
			S.preds.push(a.id)
		}
		for (const arm of arms) { arm.preds = []; arm.succs = []; arm.stmts = []; arm.term = { k: 'trap', msg: 'dead' } }
		da.invalidate(a.id)
		for (const arm of arms) da.invalidate(arm.id)
		changed = true
	}
	return changed
}
