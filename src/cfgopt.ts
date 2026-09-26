// CFG-level readability transforms on variable IR. All are exact:
//  - tail duplication copies code (same statements, same order on every path)
//  - block merging concatenates a block with its unique successor/predecessor
//  - local constant propagation / dead store elimination respect redefinitions and effects
import type { VarFunc } from './dataflow.ts';
import { pruneUnreachable } from './dataflow.ts';
import type { Block } from './program.ts';
import { type Expr, type Stmt, type Term, walkExpr, hasSideEffectsOrMem } from './ir.ts';
import { stmtExprs } from './simplify.ts';
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

/**
 * Jump threading: edges into empty `jmp` blocks go straight to the final target, and a branch
 * whose two edges then coincide becomes a jump (keeping its condition as `eval` if it may trap).
 */
export function threadJumps(f: VarFunc): boolean {
  // seen[x] === stamp: block x was passed in the current final() call
  const seen = new Uint32Array(f.blocks.length);
  let stamp = 0;
  const final = (id: number): number => {
    stamp++;
    let b = f.blocks[id];
    while (b.id !== 0 && !b.stmts.length && b.term.k === 'jmp' && seen[b.id] !== stamp) { seen[b.id] = stamp; b = f.blocks[b.term.to]; }
    return seen[b.id] === stamp ? id : b.id; // a cycle of empty blocks is left alone
  };
  let changed = false;
  for (const b of f.blocks) {
    if (!b.succs.length) continue;
    for (const s of distinct(b.succs)) {
      const to = final(s);
      if (to === s) continue;
      retarget(b, s, to);
      f.blocks[s].preds = f.blocks[s].preds.filter(p => p !== b.id);
      f.blocks[to].preds.push(b.id);
      changed = true;
    }
    const t = b.term;
    if (t.k === 'br' && t.t === t.f) {
      const fx = hasSideEffectsOrMem(t.c);
      if (fx.load || fx.trap || fx.call) b.stmts.push({ k: 'eval', e: t.c, pc: b.stmts[b.stmts.length - 1]?.pc ?? 0 });
      b.term = { k: 'jmp', to: t.t };
      b.succs = [t.t];
      const T = f.blocks[t.t];
      const i = T.preds.indexOf(b.id);
      if (T.preds.lastIndexOf(b.id) !== i) T.preds.splice(i, 1);
      changed = true;
    }
  }
  if (changed) pruneUnreachable(f);
  return changed;
}

/** the distinct elements of a (short) list, in first-occurrence order ([...new Set(xs)]) */
function distinct(xs: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < xs.length; i++) if (!out.includes(xs[i])) out.push(xs[i]);
  return out;
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
      b.stmts = b.stmts.concat(s.stmts);
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
const COMPOSITE = new Set(['bin', 'cmp', 'land', 'lor', 'neg', 'not', 'ext', 'bswap', 'lnot', 'load', 'sel', 'fn']);

/**
 * Rewrites the expressions of every statement of b (in order) with `sub`; `def` is called after each
 * statement that defines a variable. Unchanged statements keep their identity (IR nodes are never
 * mutated in place after variable recovery, so sharing them is safe). `same(s)`, when given, tells
 * statements that `sub` certainly leaves unchanged: they are not rewritten (`def` still sees them).
 */
function rewriteBlock(b: Block, sub: (e: Expr) => Expr, def: (dst: number, ns: Stmt) => void, same?: (s: Stmt) => boolean) {
  const ss = b.stmts;
  for (let i = 0; i < ss.length; i++) {
    const s = ss[i];
    if (same?.(s)) { if ((s.k === 'set' || (s.k === 'call' && s.dst >= 0))) def(s.dst, s); continue; }
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
  // (one map for all blocks, emptied between them)
  const m = new Map<number, Expr>();
  const look = (v: number) => m.get(v);
  // substConst returns a new object exactly when a variable was replaced (what the former
  // JSON comparison of before/after detected)
  const sub = (e: Expr) => { if (!m.size) return e; const n = substConst(e, look); if (n !== e) changed = true; return n; };
  // (a statement mentioning no variable of m is left as it is by substConst)
  const same = (s: Stmt) => { if (!m.size) return true; const vs = stmtInfo(s).vars; for (let k = 0; k < vs.length; k++) if (m.has(vs[k])) return false; return true; };
  const def = (dst: number, ns: Stmt) => { m.delete(dst); if (ns.k === 'set' && (ns.e.k === 'const' || ns.e.k === 'undef')) m.set(dst, ns.e); };
  for (const b of f.blocks) {
    if (m.size) m.clear();
    rewriteBlock(b, sub, def, same);
  }
  return changed;
}

/**
 * Least solution of liveIn = gen | (OR of the successors' liveIn) & ~kill over W-word rows of flat
 * arrays (row = block id). (b, v) is in it exactly when some path along successors from b reaches a
 * block reading v before writing it, with no block before that one (b included) writing v; so each
 * variable is propagated backwards from the blocks that read it first, through predecessors that do
 * not write it. That is the least fixpoint the former round-robin iteration reached, computed with
 * work proportional to the live ranges instead of blocks x variables per pass.
 */
function solveLiveIn(f: VarFunc, W: number, gen: Uint32Array, kill: Uint32Array): Uint32Array {
  const nb = f.blocks.length;
  const liveIn = gen.slice();
  // users of s (blocks whose OUT reads liveIn[s]): users[uStart[s] .. uStart[s + 1])
  const uStart = new Int32Array(nb + 1);
  for (const b of f.blocks) for (const s of b.succs) uStart[s + 1]++;
  for (let i = 0; i < nb; i++) uStart[i + 1] += uStart[i];
  const users = new Int32Array(uStart[nb]), fill = uStart.slice(0, nb);
  for (const b of f.blocks) for (const s of b.succs) users[fill[s]++] = b.id;
  const stack: number[] = []; // (block, variable) pairs just made live-in
  for (let b = 0; b < nb; b++) {
    for (let k = 0; k < W; k++) {
      let w = gen[b * W + k];
      while (w) { const t = w & -w; stack.push(b, k * 32 + 31 - Math.clz32(t)); w ^= t; }
    }
  }
  while (stack.length) {
    const v = stack.pop()!, b = stack.pop()!;
    const k = v >>> 5, m = 1 << (v & 31);
    for (let j = uStart[b], e = uStart[b + 1]; j < e; j++) {
      const u = users[j], i = u * W + k;
      if (!(kill[i] & m) && !(liveIn[i] & m)) { liveIn[i] |= m; stack.push(u, v); }
    }
  }
  return liveIn;
}

/**
 * gen (variables read before written) and kill (written) of every block, as W-word rows over bit
 * indices: the variable ids, or with `compact` a dense numbering of the variables that occur in the
 * function (after the first rounds most of f.vars no longer does; a variable that occurs nowhere is
 * never live, so leaving it out changes no answer while the rows get several times shorter).
 */
function genKill(f: VarFunc, compact: boolean): { W: number; ix: Int32Array | null; gen: Uint32Array; kill: Uint32Array } {
  const nb = f.blocks.length;
  let ix: Int32Array | null = null, n = f.vars.length;
  if (compact) {
    const m = ix = new Int32Array(f.vars.length).fill(-1);
    n = 0;
    const see = (x: Expr) => { if (x.k === 'var' && m[x.id] < 0) m[x.id] = n++; };
    for (const b of f.blocks) {
      for (const s of b.stmts) {
        const vs = stmtInfo(s).vars;
        for (let k = 0; k < vs.length; k++) if (m[vs[k]] < 0) m[vs[k]] = n++;
        if ((s.k === 'set' || s.k === 'call') && s.dst >= 0 && m[s.dst] < 0) m[s.dst] = n++;
      }
      if (b.term.k === 'br') walkExpr(b.term.c, see);
      else if (b.term.k === 'ret' && b.term.e) walkExpr(b.term.e, see);
    }
  }
  const W = (n + 31) >>> 5;
  const gen = new Uint32Array(nb * W), kill = new Uint32Array(nb * W);
  let base = 0; // (the current block's row)
  const set = (v: number) => { const i = ix ? ix[v] : v; gen[base + (i >>> 5)] |= 1 << (i & 31); };
  const use = (x: Expr) => { if (x.k === 'var') set(x.id); };
  for (let id = 0; id < nb; id++) {
    const b = f.blocks[id];
    base = id * W;
    if (b.term.k === 'br') walkExpr(b.term.c, use);
    else if (b.term.k === 'ret' && b.term.e) walkExpr(b.term.e, use);
    for (let i = b.stmts.length - 1; i >= 0; i--) {
      const s = b.stmts[i];
      if ((s.k === 'set' || s.k === 'call') && s.dst >= 0) { const d = ix ? ix[s.dst] : s.dst; gen[base + (d >>> 5)] &= ~(1 << (d & 31)); kill[base + (d >>> 5)] |= 1 << (d & 31); }
      const vs = stmtInfo(s).vars; // = walking stmtExprs(s)
      for (let k = 0; k < vs.length; k++) set(vs[k]);
    }
  }
  return { W, ix, gen, kill };
}

/** Variables live at the entry of each block (bitsets indexed by variable id). */
export function liveInSets(f: VarFunc): Uint32Array[] {
  const { W, gen, kill } = genKill(f, false);
  const liveIn = solveLiveIn(f, W, gen, kill);
  return f.blocks.map((_, b) => liveIn.subarray(b * W, b * W + W));
}

/** Backward variable liveness; removes dead pure assignments (multi-def variables included). */
export function deadStores(f: VarFunc): boolean {
  // The non-applying transfer is liveIn = gen | (out & ~kill), solved once (see solveLiveIn) from
  // gen/kill computed once per block. Bitsets are W-word rows of flat arrays (row id = block id)
  // over the compact numbering of the variables (see genKill).
  const { W, ix, gen, kill } = genKill(f, true);
  const liveIn = solveLiveIn(f, W, gen, kill);
  const x = ix!;
  const setBit = (a: Uint32Array, v: number) => { const i = x[v]; a[i >>> 5] |= 1 << (i & 31); };
  const clrBit = (a: Uint32Array, v: number) => { const i = x[v]; a[i >>> 5] &= ~(1 << (i & 31)); };
  const uses = (e: Expr, a: Uint32Array) => walkExpr(e, y => { if (y.k === 'var') setBit(a, y.id); });
  // variable reads of a statement (= walking its stmtExprs), from the per-statement cache
  const usesS = (s: Stmt, a: Uint32Array) => { for (const v of stmtInfo(s).vars) setBit(a, v); };
  // apply: walk each block backwards from its live-out (liveIn is not updated while applying)
  const live = new Uint32Array(W);
  const has = (v: number) => { const i = x[v]; return (live[i >>> 5] >>> (i & 31)) & 1; };
  let any = false;
  for (const b of f.blocks) {
    live.fill(0);
    for (const s of b.succs) for (let k = 0; k < W; k++) live[k] |= liveIn[s * W + k];
    const t = b.term;
    if (t.k === 'br') uses(t.c, live);
    else if (t.k === 'ret' && t.e) uses(t.e, live);
    for (let i = b.stmts.length - 1; i >= 0; i--) {
      const s = b.stmts[i];
      if (s.k === 'set') {
        if (!has(s.dst)) {
          const fx = stmtInfo(s); // = hasSideEffectsOrMem(s.e)
          if (fx.load || fx.trap || fx.call) { b.stmts[i] = { k: 'eval', e: s.e, pc: s.pc }; usesS(s, live); }
          else b.stmts.splice(i, 1);
          any = true;
          continue;
        }
        clrBit(live, s.dst);
        usesS(s, live);
      } else if (s.k === 'call') {
        if (s.dst >= 0) {
          if (!has(s.dst)) { b.stmts[i] = { ...s, dst: -1 }; any = true; }
          else clrBit(live, s.dst);
        }
        usesS(s, live);
      } else usesS(s, live);
    }
  }
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
  // per-block transfer: (slot, value) pairs in statement order, gen[gStart[id] .. gStart[id + 1])
  const g: number[] = [], gStart = new Int32Array(nb + 1);
  for (let id = 0; id < nb; id++) {
    for (const s of f.blocks[id].stmts) {
      if (s.k === 'set') { const k = slot[s.dst]; if (k >= 0) g.push(k, s.e.k === 'const' ? cid(s.e.v) : VARY); }
      else if (s.k === 'call' && s.dst >= 0) { const k = slot[s.dst]; if (k >= 0) g.push(k, VARY); }
    }
    gStart[id + 1] = g.length;
  }
  const gen = Int32Array.from(g);
  const entry = new Int32Array(K).fill(ABSENT);
  for (const v of f.vars) if (v.param >= 0 && slot[v.id] >= 0) entry[slot[v.id]] = VARY;
  // IN/OUT states are K-wide rows of flat arrays (row = block id); hasIn/hasOut mark defined rows
  const IN = new Int32Array(nb * K), OUT = new Int32Array(nb * K);
  const hasIn = new Uint8Array(nb), hasOut = new Uint8Array(nb);
  IN.set(entry, 0); hasIn[0] = 1;
  // reverse postorder of a depth-first walk along successors (stack of (block, next successor index))
  const order = new Int32Array(nb);
  let no = 0;
  { const seen = new Uint8Array(nb), stB = new Int32Array(nb), stI = new Int32Array(nb); let sp = 0;
    stB[sp] = 0; stI[sp++] = 0; seen[0] = 1;
    while (sp) { const b = f.blocks[stB[sp - 1]]; if (stI[sp - 1] < b.succs.length) { const s = b.succs[stI[sp - 1]++]; if (!seen[s]) { seen[s] = 1; stB[sp] = s; stI[sp++] = 0; } } else order[no++] = stB[--sp]; }
    order.subarray(0, no).reverse(); }
  const inn = new Int32Array(K), out = new Int32Array(K); // scratch rows
  // A block whose predecessors' OUT did not change since it was last evaluated would recompute the
  // same IN/OUT, so it is skipped (same states and same per-iteration `changed` as re-evaluating
  // every block each round, hence also the same behaviour under the iteration cap).
  // dependents of p (blocks listing p among their predecessors): dep[dStart[p] .. dStart[p + 1])
  const dStart = new Int32Array(nb + 1);
  for (const b of f.blocks) for (const p of b.preds) dStart[p + 1]++;
  for (let i = 0; i < nb; i++) dStart[i + 1] += dStart[i];
  const dep = new Int32Array(dStart[nb]), dFill = dStart.slice(0, nb);
  for (const b of f.blocks) for (const p of b.preds) dep[dFill[p]++] = b.id;
  const dirty = new Uint8Array(nb).fill(1);
  for (let changed = true, it = 0; changed && it < 50; it++) {
    changed = false;
    for (let oi = 0; oi < no; oi++) {
      const id = order[oi];
      if (!dirty[id]) continue;
      dirty[id] = 0;
      const b = f.blocks[id];
      let any = false;
      if (id === 0) { inn.set(entry); any = true; }
      for (const p of b.preds) {
        if (!hasOut[p]) continue;
        const o = p * K;
        if (any) { for (let k = 0; k < K; k++) if (inn[k] !== OUT[o + k]) inn[k] = VARY; } // meet
        else { inn.set(OUT.subarray(o, o + K)); any = true; }
      }
      if (!any) continue;
      out.set(inn);
      for (let i = gStart[id], e = gStart[id + 1]; i < e; i += 2) out[gen[i]] = gen[i + 1];
      const r = id * K;
      let same = !!hasOut[id];
      if (same) for (let k = 0; k < K; k++) if (OUT[r + k] !== out[k]) { same = false; break; }
      if (!same) { OUT.set(out, r); hasOut[id] = 1; changed = true; for (let j = dStart[id], e = dStart[id + 1]; j < e; j++) dirty[dep[j]] = 1; }
      IN.set(inn, r); hasIn[id] = 1;
    }
  }
  let changed = false;
  // the entry state of the block being rewritten is IN[r0 .. r0 + K); loc: its block-local overrides
  // (null = no longer known constant). The map and closures serve all blocks.
  let r0 = 0;
  const loc = new Map<number, Expr | null>();
  const look = (v: number): Expr | undefined => {
    const l = loc.get(v);
    if (l !== undefined) return l ?? undefined;
    const k = slot[v];
    return k >= 0 && IN[r0 + k] >= 0 ? { k: 'const', v: cval[IN[r0 + k]] } : undefined;
  };
  const sub = (e: Expr) => { const n = substConst(e, look); if (n !== e) changed = true; return n; };
  // (a statement none of whose variables has a known constant is left as it is by substConst)
  const known = (v: number) => { const l = loc.get(v); if (l !== undefined) return l !== null; const k = slot[v]; return k >= 0 && IN[r0 + k] >= 0; };
  const same = (s: Stmt) => { const vs = stmtInfo(s).vars; for (let k = 0; k < vs.length; k++) if (known(vs[k])) return false; return true; };
  const def = (dst: number, ns: Stmt) => { loc.set(dst, ns.k === 'set' && ns.e.k === 'const' ? ns.e : null); };
  for (const b of f.blocks) {
    if (!hasIn[b.id]) continue;
    // (in a block where no variable holds a known constant on entry and none is assigned one, no
    // variable ever becomes known: rewriteBlock would leave the block as it is)
    r0 = b.id * K;
    let any = false;
    for (let k = 0; k < K && !any; k++) if (IN[r0 + k] >= 0) any = true;
    for (let i = gStart[b.id] + 1, e = gStart[b.id + 1]; i < e && !any; i += 2) if (gen[i] >= 0) any = true;
    if (!any) continue;
    if (loc.size) loc.clear();
    rewriteBlock(b, sub, def, same);
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
    case 'fn': { let args: Expr[] | undefined; for (let i = 0; i < e.args.length; i++) { const x = substConst(e.args[i], look); if (x !== e.args[i]) (args ??= e.args.slice())[i] = x; } return args ? { ...e, args } : e; }
    default: return e;
  }
}

/** Block-local copy propagation: after `x = y`, uses of x become y until x or y is reassigned. */
export function localCopyProp(f: VarFunc, st?: { real: boolean }): boolean {
  let changed = false;
  // (the maps and closures serve all blocks: emptied between blocks)
  const m = new Map<number, Expr>();
  // m's entries are copies `k = y`; copiesOf[y] = those k (so a reassignment of y finds them
  // without scanning m)
  const copiesOf = new Map<number, Set<number>>();
  const del = (k: number) => { const e = m.get(k); if (e) { m.delete(k); if (e.k === 'var') copiesOf.get(e.id)?.delete(k); } };
  const killVar = (v: number) => { del(v); const ks = copiesOf.get(v); if (ks) { for (const k of ks) m.delete(k); ks.clear(); } };
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
  // a statement without a variable of m is left as it is by substConst: not rewritten, but `sub`
  // would still have flagged its composite top-level expressions
  const same = (s: Stmt) => {
    if (!m.size) return true;
    const vs = stmtInfo(s).vars;
    for (let k = 0; k < vs.length; k++) if (m.has(vs[k])) return false;
    if (!changed) changed = topComposite(s);
    return true;
  };
  const def = (dst: number, ns: Stmt) => {
    killVar(dst);
    if (ns.k === 'set' && ns.e.k === 'var' && ns.e.id !== dst) { m.set(dst, ns.e); let ks = copiesOf.get(ns.e.id); if (!ks) copiesOf.set(ns.e.id, (ks = new Set())); ks.add(dst); }
  };
  for (const b of f.blocks) {
    if (m.size) m.clear();
    if (copiesOf.size) copiesOf.clear();
    rewriteBlock(b, sub, def, same);
  }
  return changed;
}

/** Some expression rewriteBlock passes to `sub` for this statement is composite. */
function topComposite(s: Stmt): boolean {
  switch (s.k) {
    case 'set': case 'eval': return COMPOSITE.has(s.e.k);
    case 'store': return COMPOSITE.has(s.addr.k) || COMPOSITE.has(s.v.k);
    case 'call': return s.args.some(e => COMPOSITE.has(e.k)) || !!s.extra?.some(e => COMPOSITE.has(e.k)) || (s.t.k === 'ind' && COMPOSITE.has(s.t.e.k));
    default: return false;
  }
}
