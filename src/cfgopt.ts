// CFG-level readability transforms on variable IR. All are exact:
//  - tail duplication copies code (same statements, same order on every path)
//  - block merging concatenates a block with its unique successor/predecessor
//  - local constant propagation / dead store elimination respect redefinitions and effects
import type { VarFunc } from './dataflow.ts';
import { pruneUnreachable } from './dataflow.ts';
import type { Block } from './program.ts';
import { type Expr, type Stmt, type Term, walkExpr, hasSideEffectsOrMem } from './ir.ts';
import { stmtExprs } from './simplify.ts';

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
  const final = (id: number): number => {
    const seen = new Set<number>();
    let b = f.blocks[id];
    while (b.id !== 0 && !b.stmts.length && b.term.k === 'jmp' && !seen.has(b.id)) { seen.add(b.id); b = f.blocks[b.term.to]; }
    return seen.has(b.id) ? id : b.id; // a cycle of empty blocks is left alone
  };
  let changed = false;
  for (const b of f.blocks) {
    if (!b.succs.length) continue;
    for (const s of [...new Set(b.succs)]) {
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

function substExpr(e: Expr, m: Map<number, Expr>): Expr {
  if (!m.size) return e;
  switch (e.k) {
    case 'var': return m.get(e.id) ?? e;
    case 'bin': case 'cmp': case 'land': case 'lor': return { ...e, a: substExpr(e.a, m), b: substExpr(e.b, m) } as Expr;
    case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': return { ...e, a: substExpr(e.a, m) } as Expr;
    case 'load': return { ...e, addr: substExpr(e.addr, m) };
    case 'sel': return { ...e, c: substExpr(e.c, m), a: substExpr(e.a, m), b: substExpr(e.b, m) };
    case 'fn': return { ...e, args: e.args.map(a => substExpr(a, m)) };
    default: return e;
  }
}

/** Within each block: forward-substitute variables currently known to hold a constant. */
export function localConstProp(f: VarFunc): boolean {
  let changed = false;
  for (const b of f.blocks) {
    const m = new Map<number, Expr>();
    const kill = (v: number) => m.delete(v);
    const sub = (e: Expr) => { const n = substExpr(e, m); if (n !== e && JSON.stringify(n, rep) !== JSON.stringify(e, rep)) changed = true; return n; };
    b.stmts = b.stmts.map(s => {
      let ns: Stmt;
      switch (s.k) {
        case 'set': ns = { ...s, e: sub(s.e) }; kill(s.dst); if (ns.e.k === 'const' || ns.e.k === 'undef') m.set(s.dst, ns.e); break;
        case 'store': ns = { ...s, addr: sub(s.addr), v: sub(s.v) }; break;
        case 'eval': ns = { ...s, e: sub(s.e) }; break;
        case 'call': ns = { ...s, args: s.args.map(sub), extra: s.extra?.map(sub), t: s.t.k === 'ind' ? { k: 'ind', e: sub(s.t.e) } : s.t }; if (s.dst >= 0) kill(s.dst); break;
        default: ns = s;
      }
      return ns;
    });
    const t = b.term;
    if (t.k === 'br') t.c = sub(t.c);
    else if (t.k === 'ret' && t.e) t.e = sub(t.e);
  }
  return changed;
}
const rep = (_k: string, v: unknown) => (typeof v === 'bigint' ? v.toString() : v);

/** Variables live at the entry of each block (bitsets indexed by variable id). */
export function liveInSets(f: VarFunc): Uint32Array[] {
  const W = (f.vars.length + 31) >>> 5;
  const uses = (e: Expr, set: Uint32Array) => walkExpr(e, x => { if (x.k === 'var') set[x.id >>> 5] |= 1 << (x.id & 31); });
  const liveIn = f.blocks.map(() => new Uint32Array(W));
  for (let changed = true; changed;) {
    changed = false;
    for (let id = f.blocks.length - 1; id >= 0; id--) {
      const b = f.blocks[id];
      const live = new Uint32Array(W);
      for (const s of b.succs) { const li = liveIn[s]; for (let k = 0; k < W; k++) live[k] |= li[k]; }
      if (b.term.k === 'br') uses(b.term.c, live);
      else if (b.term.k === 'ret' && b.term.e) uses(b.term.e, live);
      for (let i = b.stmts.length - 1; i >= 0; i--) {
        const s = b.stmts[i];
        if ((s.k === 'set' || s.k === 'call') && s.dst >= 0) live[s.dst >>> 5] &= ~(1 << (s.dst & 31));
        stmtExprs(s).forEach(e => uses(e, live));
      }
      for (let k = 0; k < W; k++) if (live[k] !== liveIn[id][k]) { liveIn[id] = live; changed = true; break; }
    }
  }
  return liveIn;
}

/** Backward variable liveness; removes dead pure assignments (multi-def variables included). */
export function deadStores(f: VarFunc): boolean {
  const nv = f.vars.length, W = (nv + 31) >>> 5, nb = f.blocks.length;
  const liveIn = Array.from({ length: nb }, () => new Uint32Array(W));
  const uses = (e: Expr, set: Uint32Array) => walkExpr(e, x => { if (x.k === 'var') set[x.id >>> 5] |= 1 << (x.id & 31); });
  const has = (set: Uint32Array, v: number) => (set[v >>> 5] >>> (v & 31)) & 1;
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
          const fx = hasSideEffectsOrMem(s.e);
          if (fx.load || fx.trap || fx.call) { b.stmts[i] = { k: 'eval', e: s.e, pc: s.pc }; uses(s.e, live); }
          else b.stmts.splice(i, 1);
          changed = true;
          continue;
        }
        live[s.dst >>> 5] &= ~(1 << (s.dst & 31));
        uses(s.e, live);
      } else if (s.k === 'call') {
        if (s.dst >= 0) {
          if (apply && !has(live, s.dst)) { b.stmts[i] = { ...s, dst: -1 }; changed = true; }
          else live[s.dst >>> 5] &= ~(1 << (s.dst & 31));
        }
        stmtExprs(s).forEach(e => uses(e, live));
      } else stmtExprs(s).forEach(e => uses(e, live));
    }
    return { live, changed };
  };
  const outOf = (b: Block) => {
    const o = new Uint32Array(W);
    for (const s of b.succs) { const li = liveIn[s]; for (let k = 0; k < W; k++) o[k] |= li[k]; }
    return o;
  };
  for (let changed = true; changed;) {
    changed = false;
    for (let id = nb - 1; id >= 0; id--) {
      const b = f.blocks[id];
      const { live } = transfer(b, outOf(b), false);
      const li = liveIn[id];
      for (let k = 0; k < W; k++) if (live[k] !== li[k]) { liveIn[id] = live; changed = true; break; }
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
  const nb = f.blocks.length;
  type St = Map<number, bigint | null>; // null = varying; absent = no definition seen (unreached)
  const IN: (St | undefined)[] = new Array(nb);
  const params = new Set(f.vars.filter(v => v.param >= 0).map(v => v.id));
  const entry: St = new Map();
  for (const v of params) entry.set(v, null);
  IN[0] = entry;
  const xfer = (b: Block, st: St): St => {
    const s2 = new Map(st);
    for (const s of b.stmts) {
      if (s.k === 'set') s2.set(s.dst, s.e.k === 'const' ? s.e.v : null);
      else if (s.k === 'call' && s.dst >= 0) s2.set(s.dst, null);
    }
    return s2;
  };
  const meet = (a: St | undefined, b: St): St => {
    if (!a) return new Map(b);
    const r = new Map(a);
    for (const [k, v] of b) {
      if (!r.has(k)) { r.set(k, v); continue; }
      const x = r.get(k);
      if (x !== v) r.set(k, null);
    }
    // variables defined on one side only: the other side reaches without a definition => varying
    for (const k of r.keys()) if (!b.has(k)) r.set(k, null);
    for (const k of b.keys()) if (!a.has(k)) r.set(k, null);
    return r;
  };
  const order: number[] = [];
  { const seen = new Uint8Array(nb); const post: number[] = []; const st: [number, number][] = [[0, 0]]; seen[0] = 1;
    while (st.length) { const t = st[st.length - 1]; const b = f.blocks[t[0]]; if (t[1] < b.succs.length) { const s = b.succs[t[1]++]; if (!seen[s]) { seen[s] = 1; st.push([s, 0]); } } else { post.push(t[0]); st.pop(); } }
    order.push(...post.reverse()); }
  const OUT: (St | undefined)[] = new Array(nb);
  for (let changed = true, it = 0; changed && it < 50; it++) {
    changed = false;
    for (const id of order) {
      const b = f.blocks[id];
      let inn: St | undefined = id === 0 ? entry : undefined;
      for (const p of b.preds) if (OUT[p]) inn = inn ? meet(inn, OUT[p]!) : new Map(OUT[p]!);
      if (id === 0 && b.preds.length) for (const p of b.preds) if (OUT[p]) inn = meet(inn, OUT[p]!);
      if (!inn) continue;
      const out = xfer(b, inn);
      if (!OUT[id] || !sameSt(OUT[id]!, out)) { OUT[id] = out; IN[id] = inn; changed = true; }
      else IN[id] = inn;
    }
  }
  let changed = false;
  for (const b of f.blocks) {
    const st = IN[b.id];
    if (!st) continue;
    const m = new Map<number, Expr>();
    for (const [k, v] of st) if (v !== null && v !== undefined) m.set(k, { k: 'const', v });
    const cur = new Map(m);
    const sub = (e: Expr) => { const n = substExpr(e, cur); if (n !== e) changed = changed || JSON.stringify(n, rep) !== JSON.stringify(e, rep); return n; };
    b.stmts = b.stmts.map(s => {
      let ns: Stmt = s;
      switch (s.k) {
        case 'set': ns = { ...s, e: sub(s.e) }; cur.delete(s.dst); if (ns.e.k === 'const') cur.set(s.dst, ns.e); break;
        case 'store': ns = { ...s, addr: sub(s.addr), v: sub(s.v) }; break;
        case 'eval': ns = { ...s, e: sub(s.e) }; break;
        case 'call': ns = { ...s, args: s.args.map(sub), extra: s.extra?.map(sub), t: s.t.k === 'ind' ? { k: 'ind', e: sub(s.t.e) } : s.t }; if (s.dst >= 0) cur.delete(s.dst); break;
      }
      return ns;
    });
    const t = b.term;
    if (t.k === 'br') t.c = sub(t.c);
    else if (t.k === 'ret' && t.e) t.e = sub(t.e);
  }
  return changed;
}

function sameSt(a: Map<number, bigint | null>, b: Map<number, bigint | null>) {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v || !b.has(k)) return false;
  return true;
}

/** Block-local copy propagation: after `x = y`, uses of x become y until x or y is reassigned. */
export function localCopyProp(f: VarFunc): boolean {
  let changed = false;
  for (const b of f.blocks) {
    const m = new Map<number, Expr>();
    const killVar = (v: number) => { m.delete(v); for (const [k, e] of m) if (e.k === 'var' && e.id === v) m.delete(k); };
    const sub = (e: Expr) => { const n = substExpr(e, m); if (n !== e) changed = true; return n; };
    b.stmts = b.stmts.map(s => {
      let ns: Stmt = s;
      switch (s.k) {
        case 'set': ns = { ...s, e: sub(s.e) }; killVar(s.dst); if (ns.e.k === 'var' && ns.e.id !== s.dst) m.set(s.dst, ns.e); break;
        case 'store': ns = { ...s, addr: sub(s.addr), v: sub(s.v) }; break;
        case 'eval': ns = { ...s, e: sub(s.e) }; break;
        case 'call': ns = { ...s, args: s.args.map(sub), extra: s.extra?.map(sub), t: s.t.k === 'ind' ? { k: 'ind', e: sub(s.t.e) } : s.t }; if (s.dst >= 0) killVar(s.dst); break;
      }
      return ns;
    });
    const t = b.term;
    if (t.k === 'br') t.c = sub(t.c);
    else if (t.k === 'ret' && t.e) t.e = sub(t.e);
  }
  return changed;
}
