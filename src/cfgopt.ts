// CFG-level readability transforms on variable IR. All are exact:
//  - tail duplication copies code (same statements, same order on every path)
//  - block merging concatenates a block with its unique successor/predecessor
//  - local constant propagation / dead store elimination respect redefinitions and effects
import type { VarFunc } from './dataflow.ts';
import { pruneUnreachable } from './dataflow.ts';
import type { Block } from './program.ts';
import { type Expr, type Stmt, type Term, walkExpr, hasSideEffectsOrMem } from './ir.ts';
import { stmtInfo } from './simplify.ts';

const cloneTerm = (t: Term): Term => ({ ...t } as Term);

function isExitish(f: VarFunc, b: Block, budget: number, seen = new Set<number>()): number {
  // returns the total statement cost of b plus its single-successor chain, or -1 if not an exit chain
  if (seen.has(b.id)) return -1;
  seen.add(b.id);
  const cost = b.stmts.length + 1;
  if (cost > budget) return -1;
  if (b.term.k === 'ret' || b.term.k === 'trap') return cost;
  if (b.term.k === 'jmp') {
    const rest = isExitish(f, f.blocks[b.term.to], budget - cost, seen);
    return rest < 0 ? -1 : cost + rest;
  }
  return -1;
}

/** Duplicate small blocks that end the function (return/abort) into each predecessor. */
export function tailDuplicate(f: VarFunc, budget = 6): boolean {
  let changed = false;
  for (let iter = 0; iter < 4; iter++) {
    let any = false;
    const n0 = f.blocks.length;
    for (let id = 0; id < n0; id++) {
      const b = f.blocks[id];
      if (b.preds.length < 2 || id === 0) continue;
      if (isExitish(f, b, budget) < 0) continue;
      const preds = [...new Set(b.preds)];
      for (const p of preds.slice(1)) {
        if (p === id) continue;
        const nb: Block = { id: f.blocks.length, start: b.start, end: b.end, stmts: b.stmts.map(s => ({ ...s } as Stmt)), term: cloneTerm(b.term), succs: [...b.succs], preds: [p] };
        f.blocks.push(nb);
        for (const s of nb.succs) f.blocks[s].preds.push(nb.id);
        const pb = f.blocks[p];
        retarget(pb, id, nb.id);
        b.preds = b.preds.filter(x => x !== p);
      }
      any = true;
    }
    if (!any) break;
    changed = true;
    mergeBlocks(f);
  }
  return changed;
}

function retarget(pb: Block, from: number, to: number) {
  const t = pb.term;
  if (t.k === 'jmp' && t.to === from) t.to = to;
  else if (t.k === 'br') { if (t.t === from) t.t = to; if (t.f === from) t.f = to; }
  pb.succs = pb.succs.map(s => (s === from ? to : s));
}

/** Merge a block ending in `jmp` into its successor when it is the successor's only predecessor. */
export function mergeBlocks(f: VarFunc): boolean {
  let changed = false;
  for (const b of f.blocks) {
    while (b.term.k === 'jmp') {
      const s = f.blocks[b.term.to];
      if (s.id === b.id || s.id === 0 || s.preds.length !== 1) break;
      b.stmts = [...b.stmts, ...s.stmts];
      b.term = s.term;
      b.succs = s.succs;
      for (const x of s.succs) f.blocks[x].preds = f.blocks[x].preds.map(p => (p === s.id ? b.id : p));
      s.preds = []; s.succs = []; s.stmts = []; s.term = { k: 'trap', msg: 'dead' };
      changed = true;
    }
  }
  if (changed) pruneUnreachable(f);
  return changed;
}

/** Composite expressions that the historical copying substitution rebuilt (see localCopyProp). */
const COMPOSITE = new Set(['bin', 'cmp', 'land', 'lor', 'neg', 'not', 'ext', 'bswap', 'lnot', 'load', 'sel']);

/**
 * Rewrites the expressions of every statement of b (in order) with `sub`; `def` is called after each
 * statement that defines a variable. Unchanged statements keep their identity (IR nodes are never
 * mutated in place after variable recovery, so sharing them is safe).
 */
function rewriteBlock(b: Block, sub: (e: Expr) => Expr, def: (dst: number, ns: Stmt) => void) {
  const ss = b.stmts;
  for (let i = 0; i < ss.length; i++) {
    const s = ss[i];
    switch (s.k) {
      case 'set': { const e = sub(s.e); const ns = e !== s.e ? (ss[i] = { ...s, e }) : s; def(s.dst, ns); break; }
      case 'store': { const addr = sub(s.addr), v = sub(s.v); if (addr !== s.addr || v !== s.v) ss[i] = { ...s, addr, v }; break; }
      case 'eval': { const e = sub(s.e); if (e !== s.e) ss[i] = { ...s, e }; break; }
      case 'call': {
        const args = subAll(s.args, sub), extra = s.extra && subAll(s.extra, sub);
        const te = s.t.k === 'ind' ? sub(s.t.e) : undefined;
        const ns = args !== s.args || extra !== s.extra || (s.t.k === 'ind' && te !== s.t.e) ? (ss[i] = { ...s, args, extra, t: s.t.k === 'ind' ? { k: 'ind', e: te! } : s.t }) : s;
        if (s.dst >= 0) def(s.dst, ns);
        break;
      }
    }
  }
  const t = b.term;
  if (t.k === 'br') t.c = sub(t.c);
  else if (t.k === 'ret' && t.e) t.e = sub(t.e);
}
function subAll(es: Expr[], sub: (e: Expr) => Expr): Expr[] {
  let out: Expr[] | undefined;
  for (let i = 0; i < es.length; i++) { const n = sub(es[i]); if (n !== es[i]) (out ??= es.slice())[i] = n; }
  return out ?? es;
}

/** Within each block: forward-substitute variables currently known to hold a constant. */
export function localConstProp(f: VarFunc): boolean {
  let changed = false;
  for (const b of f.blocks) {
    const m = new Map<number, Expr>();
    const look = (v: number) => m.get(v);
    // substConst returns a new object exactly when a variable was replaced (what the former
    // JSON comparison of before/after detected)
    const sub = (e: Expr) => { if (!m.size) return e; const n = substConst(e, look); if (n !== e) changed = true; return n; };
    rewriteBlock(b, sub, (dst, ns) => { m.delete(dst); if (ns.k === 'set' && (ns.e.k === 'const' || ns.e.k === 'undef')) m.set(dst, ns.e); });
  }
  return changed;
}

/** Backward variable liveness; removes dead pure assignments (multi-def variables included). */
export function deadStores(f: VarFunc): boolean {
  const nv = f.vars.length, W = (nv + 31) >>> 5, nb = f.blocks.length;
  const liveIn = Array.from({ length: nb }, () => new Uint32Array(W));
  const uses = (e: Expr, set: Uint32Array) => walkExpr(e, x => { if (x.k === 'var') set[x.id >>> 5] |= 1 << (x.id & 31); });
  const has = (set: Uint32Array, v: number) => (set[v >>> 5] >>> (v & 31)) & 1;
  // variable reads of a statement (= walking its stmtExprs), from the per-statement cache
  const usesS = (s: Stmt, set: Uint32Array) => { for (const v of stmtInfo(s).vars) set[v >>> 5] |= 1 << (v & 31); };
  const transfer = (b: Block, out: Uint32Array, apply: boolean): { live: Uint32Array; changed: boolean } => {
    const live = out.slice();
    const t = b.term;
    if (t.k === 'br') uses(t.c, live);
    else if (t.k === 'ret' && t.e) uses(t.e, live);
    let changed = false;
    for (let i = b.stmts.length - 1; i >= 0; i--) {
      const s = b.stmts[i];
      if (s.k === 'set') {
        if (apply && !has(live, s.dst)) {
          const fx = stmtInfo(s); // = hasSideEffectsOrMem(s.e)
          if (fx.load || fx.trap || fx.call) { b.stmts[i] = { k: 'eval', e: s.e, pc: s.pc }; usesS(s, live); }
          else b.stmts.splice(i, 1);
          changed = true;
          continue;
        }
        live[s.dst >>> 5] &= ~(1 << (s.dst & 31));
        usesS(s, live);
      } else if (s.k === 'call') {
        if (s.dst >= 0) {
          if (apply && !has(live, s.dst)) { b.stmts[i] = { ...s, dst: -1 }; changed = true; }
          else live[s.dst >>> 5] &= ~(1 << (s.dst & 31));
        }
        usesS(s, live);
      } else usesS(s, live);
    }
    return { live, changed };
  };
  const outOf = (b: Block) => {
    const o = new Uint32Array(W);
    for (const s of b.succs) { const li = liveIn[s]; for (let k = 0; k < W; k++) o[k] |= li[k]; }
    return o;
  };
  // The non-applying transfer is liveIn = gen | (out & ~kill); compute gen/kill once per block
  // instead of re-walking every expression on each iteration. Liveness has a unique least fixpoint,
  // so the result is the same.
  const gen: Uint32Array[] = new Array(nb), kill: Uint32Array[] = new Array(nb);
  for (let id = 0; id < nb; id++) {
    const b = f.blocks[id];
    const g = new Uint32Array(W), kl = new Uint32Array(W);
    const t = b.term;
    if (t.k === 'br') uses(t.c, g);
    else if (t.k === 'ret' && t.e) uses(t.e, g);
    for (let i = b.stmts.length - 1; i >= 0; i--) {
      const s = b.stmts[i];
      if ((s.k === 'set' || s.k === 'call') && s.dst >= 0) { g[s.dst >>> 5] &= ~(1 << (s.dst & 31)); kl[s.dst >>> 5] |= 1 << (s.dst & 31); }
      usesS(s, g);
    }
    gen[id] = g; kill[id] = kl;
  }
  for (let changed = true; changed;) {
    changed = false;
    for (let id = nb - 1; id >= 0; id--) {
      const b = f.blocks[id];
      const li = liveIn[id], g = gen[id], kl = kill[id];
      let o: Uint32Array | undefined;
      for (const s of b.succs) { const x = liveIn[s]; if (!o) o = x.slice(); else for (let k = 0; k < W; k++) o[k] |= x[k]; }
      for (let k = 0; k < W; k++) {
        const v = (g[k] | ((o ? o[k] : 0) & ~kl[k])) >>> 0;
        if (v !== li[k]) { li[k] = v; changed = true; }
      }
    }
  }
  let any = false;
  for (const b of f.blocks) if (transfer(b, outOf(b), true).changed) any = true;
  return any;
}

/**
 * Global constant propagation over (possibly multi-definition) variables:
 * forward dataflow with lattice {unknown, const c, varying}; a use is replaced when every
 * reaching definition assigns the same constant.
 */
export function globalConstProp(f: VarFunc): boolean {
  // Lattice per variable: absent (no definition on the path), const c, varying; unreached blocks
  // (no OUT yet) are skipped. meet(x, y) = x if x === y else varying; a block's transfer sets each
  // variable it defines to its constant (or varying). Both are pointwise per variable, so the state
  // is tracked only for variables that are assigned a literal constant somewhere: every other
  // variable is absent or varying everywhere and is never substituted. Dropping them does not change
  // the value of any tracked variable at any iteration, and iteration stops once the tracked part is
  // stable (it stays stable afterwards), so the result equals the full-map formulation, including
  // under the 50-iteration cap. States are dense Int32Arrays: -1 absent, -2 varying, k >= 0 = the
  // k-th interned constant.
  const nb = f.blocks.length;
  const nv = f.vars.length;
  const slot = new Int32Array(nv).fill(-1);
  const slotVar: number[] = [];
  const cval: bigint[] = [];
  const cidOf = new Map<bigint, number>();
  const cid = (v: bigint) => { let k = cidOf.get(v); if (k === undefined) { k = cval.length; cval.push(v); cidOf.set(v, k); } return k; };
  for (const b of f.blocks) for (const s of b.stmts) {
    if (s.k === 'set' && s.e.k === 'const' && slot[s.dst] < 0) { slot[s.dst] = slotVar.length; slotVar.push(s.dst); }
  }
  const K = slotVar.length;
  if (!K) return false; // nothing can be substituted (an assignment only becomes constant through substitution)
  const ABSENT = -1, VARY = -2;
  // per-block transfer: (slot, value) pairs in statement order
  const gen: Int32Array[] = new Array(nb);
  for (const b of f.blocks) {
    const g: number[] = [];
    for (const s of b.stmts) {
      if (s.k === 'set') { const k = slot[s.dst]; if (k >= 0) g.push(k, s.e.k === 'const' ? cid(s.e.v) : VARY); }
      else if (s.k === 'call' && s.dst >= 0) { const k = slot[s.dst]; if (k >= 0) g.push(k, VARY); }
    }
    gen[b.id] = Int32Array.from(g);
  }
  const entry = new Int32Array(K).fill(ABSENT);
  for (const v of f.vars) if (v.param >= 0 && slot[v.id] >= 0) entry[slot[v.id]] = VARY;
  const IN: (Int32Array | undefined)[] = new Array(nb);
  IN[0] = entry;
  const meetInto = (r: Int32Array, b: Int32Array) => { for (let k = 0; k < K; k++) if (r[k] !== b[k]) r[k] = VARY; };
  const order: number[] = [];
  { const seen = new Uint8Array(nb); const post: number[] = []; const st: [number, number][] = [[0, 0]]; seen[0] = 1;
    while (st.length) { const t = st[st.length - 1]; const b = f.blocks[t[0]]; if (t[1] < b.succs.length) { const s = b.succs[t[1]++]; if (!seen[s]) { seen[s] = 1; st.push([s, 0]); } } else { post.push(t[0]); st.pop(); } }
    order.push(...post.reverse()); }
  const OUT: (Int32Array | undefined)[] = new Array(nb);
  for (let changed = true, it = 0; changed && it < 50; it++) {
    changed = false;
    for (const id of order) {
      const b = f.blocks[id];
      let inn: Int32Array | undefined = id === 0 ? entry.slice() : undefined;
      for (const p of b.preds) { const o = OUT[p]; if (o) { if (inn) meetInto(inn, o); else inn = o.slice(); } }
      if (!inn) continue;
      const out = inn.slice();
      const g = gen[id];
      for (let i = 0; i < g.length; i += 2) out[g[i]] = g[i + 1];
      const prev = OUT[id];
      let same = !!prev;
      if (prev) for (let k = 0; k < K; k++) if (prev[k] !== out[k]) { same = false; break; }
      if (!same) { OUT[id] = out; changed = true; }
      IN[id] = inn;
    }
  }
  let changed = false;
  for (const b of f.blocks) {
    const st = IN[b.id];
    if (!st) continue;
    // block-local overrides of the entry state (null = no longer known constant)
    const loc = new Map<number, Expr | null>();
    const look = (v: number): Expr | undefined => {
      const l = loc.get(v);
      if (l !== undefined) return l ?? undefined;
      const k = slot[v];
      return k >= 0 && st[k] >= 0 ? { k: 'const', v: cval[st[k]] } : undefined;
    };
    const sub = (e: Expr) => { const n = substConst(e, look); if (n !== e) changed = true; return n; };
    rewriteBlock(b, sub, (dst, ns) => loc.set(dst, ns.k === 'set' && ns.e.k === 'const' ? ns.e : null));
  }
  return changed;
}

/** substExpr with a lookup function; returns `e` itself when nothing was substituted (IR expressions are immutable). */
function substConst(e: Expr, look: (v: number) => Expr | undefined): Expr {
  switch (e.k) {
    case 'var': return look(e.id) ?? e;
    case 'bin': case 'cmp': case 'land': case 'lor': { const a = substConst(e.a, look), b = substConst(e.b, look); return a === e.a && b === e.b ? e : { ...e, a, b } as Expr; }
    case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': { const a = substConst(e.a, look); return a === e.a ? e : { ...e, a } as Expr; }
    case 'load': { const addr = substConst(e.addr, look); return addr === e.addr ? e : { ...e, addr }; }
    case 'sel': { const c = substConst(e.c, look), a = substConst(e.a, look), b = substConst(e.b, look); return c === e.c && a === e.a && b === e.b ? e : { ...e, c, a, b }; }
    default: return e;
  }
}

/** Block-local copy propagation: after `x = y`, uses of x become y until x or y is reassigned. */
export function localCopyProp(f: VarFunc, st?: { real: boolean }): boolean {
  let changed = false;
  for (const b of f.blocks) {
    const m = new Map<number, Expr>();
    const killVar = (v: number) => { m.delete(v); for (const [k, e] of m) if (e.k === 'var' && e.id === v) m.delete(k); };
    const look = (v: number) => m.get(v);
    // `changed` keeps its historical meaning: the former copying substitution returned a new object
    // for every composite expression whenever m was non-empty, and optimizeFunc's round loop (whose
    // round count shapes the output) is driven by it.
    const sub = (e: Expr) => {
      if (!m.size) return e;
      if (COMPOSITE.has(e.k) || (e.k === 'var' && m.has(e.id))) changed = true;
      const n = substConst(e, look);
      if (n !== e && st) st.real = true; // an actual substitution
      return n;
    };
    rewriteBlock(b, sub, (dst, ns) => { killVar(dst); if (ns.k === 'set' && ns.e.k === 'var' && ns.e.id !== dst) m.set(dst, ns.e); });
  }
  return changed;
}
