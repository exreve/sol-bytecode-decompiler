// Register liveness, interprocedural parameter/return inference and variable recovery (webs).
import type { Program, Func, Block } from './program.ts';
import { type Expr, type Stmt, walkExpr, mapExpr } from './ir.ts';

const ARG_MASK = [0, 0b10, 0b110, 0b1110, 0b11110, 0b111110]; // r1..rk
const CLOBBER = 0b111111; // r0..r5

export function regsOf(e: Expr): number {
  let m = 0;
  walkExpr(e, x => { if (x.k === 'reg') m |= 1 << x.r; });
  return m;
}

export interface CallInfo { nparams: number; returns: boolean; noreturn: boolean; syscall?: boolean }

export function calleeInfo(p: Program, s: Extract<Stmt, { k: 'call' }>): CallInfo {
  if (s.t.k === 'fn') {
    const f = p.funcs.get(s.t.pc);
    if (f) return { nparams: f.nparams, returns: f.returns, noreturn: f.noreturn };
    return { nparams: 5, returns: true, noreturn: false };
  }
  if (s.t.k === 'sys') {
    const sc = p.syscalls.get(s.t.name)!;
    return { nparams: sc.params.length, returns: true, noreturn: !!sc.noreturn, syscall: true };
  }
  return { nparams: 5, returns: true, noreturn: false };
}

/** For indirect calls: argument registers that hold call-clobbered garbage on every path. */
const indClobber = new WeakMap<Stmt, number>();

export function computeIndClobber(p: Program, f: Func) {
  let hasInd = false;
  for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'call' && s.t.k === 'ind') hasInd = true;
  if (!hasInd) return;
  const n = f.blocks.length;
  const inM = new Int32Array(n).fill(-1), outM = new Int32Array(n).fill(-1);
  inM[0] = 0;
  const order = postorder(f).reverse();
  const xfer = (b: Block, m: number, record: boolean) => {
    for (const s of b.stmts) {
      if (s.k === 'set') m &= ~(1 << s.dst);
      else if (s.k === 'call') {
        if (record && s.t.k === 'ind') indClobber.set(s, m & 0b111110);
        m |= 0b111110;
        if (calleeInfo(p, s).returns) m &= ~1; else m |= 1;
      }
    }
    return m;
  };
  for (let changed = true; changed;) {
    changed = false;
    for (const id of order) {
      const b = f.blocks[id];
      let m = id === 0 ? 0 : -1;
      if (id !== 0) for (const pr of b.preds) m &= outM[pr];
      if (id !== 0 && !b.preds.length) m = 0;
      const o = xfer(b, m, false);
      if (m !== inM[id] || o !== outM[id]) { inM[id] = m; outM[id] = o; changed = true; }
    }
  }
  for (const b of f.blocks) xfer(b, inM[b.id], true);
}

/** use/def masks of one statement in register form. */
function stmtUseDef(p: Program, s: Stmt): { use: number; def: number } {
  if (s.k === 'call') return stmtUseDef0(p, s);
  // only call statements depend on (changing) callee signatures; statements are not mutated in
  // place (except calls, in recoverVars), so the others' masks are cached per statement object
  // (non-enumerable symbol property: not copied by spreads, invisible to JSON / for-in)
  let r: { use: number; def: number } | undefined = (s as any)[UD];
  if (!r) { r = stmtUseDef0(p, s); Object.defineProperty(s, UD, { value: r }); }
  return r;
}
const UD = Symbol('useDef');
const GK = Symbol('blockGenKill');

function stmtUseDef0(p: Program, s: Stmt): { use: number; def: number } {
  switch (s.k) {
    case 'set': return { use: regsOf(s.e), def: 1 << s.dst };
    case 'store': return { use: regsOf(s.addr) | regsOf(s.v), def: 0 };
    case 'eval': return { use: regsOf(s.e), def: 0 };
    case 'trap': return { use: 0, def: 0 };
    case 'call': {
      const ci = calleeInfo(p, s);
      let use = ARG_MASK[ci.nparams];
      if (s.t.k === 'ind') use = (use & ~(indClobber.get(s) ?? 0)) | regsOf(s.t.e);
      if (s.t.k === 'fn') { const f = p.funcs.get(s.t.pc); if (f) for (const r of f.extraIn) use |= 1 << r; }
      return { use, def: CLOBBER };
    }
  }
}

function termUse(f: Func, b: Block): number {
  const t = b.term;
  if (t.k === 'br') return regsOf(t.c);
  if (t.k === 'ret') return f.returns ? 1 : 0;
  return 0;
}

/** Per-block backwards liveness over registers r0..r10. Returns live-in masks. */
export function liveness(p: Program, f: Func): { liveIn: Int32Array; liveOut: Int32Array } {
  const n = f.blocks.length;
  const gen = new Int32Array(n), kill = new Int32Array(n);
  for (const b of f.blocks) {
    // Folding x -> (x & ~def) | use backwards over the statements gives x -> (x & ~K) | G with
    // K = union of defs and G = the fold of 0, so gen = G | (termUse & ~K). (G, K) of a block
    // without calls does not depend on signatures and is cached (same statements array/length).
    let G: number, K: number;
    const c: { stmts: Stmt[]; len: number; g: number; k: number } | undefined = (b as any)[GK];
    if (c && c.stmts === b.stmts && c.len === b.stmts.length) { G = c.g; K = c.k; }
    else {
      G = 0; K = 0;
      let calls = false;
      for (let i = b.stmts.length - 1; i >= 0; i--) {
        const s = b.stmts[i];
        if (s.k === 'call') calls = true;
        const { use, def } = stmtUseDef(p, s);
        G = (G & ~def) | use;
        K |= def;
      }
      if (!calls) Object.defineProperty(b, GK, { value: { stmts: b.stmts, len: b.stmts.length, g: G, k: K }, writable: true, configurable: true });
    }
    gen[b.id] = G | (termUse(f, b) & ~K); kill[b.id] = K;
  }
  const liveIn = new Int32Array(n), liveOut = new Int32Array(n);
  let changed = true;
  const order = postorder(f);
  while (changed) {
    changed = false;
    for (const id of order) {
      const b = f.blocks[id];
      let out = 0;
      for (const s of b.succs) out |= liveIn[s];
      const inn = gen[id] | (out & ~kill[id]);
      if (inn !== liveIn[id] || out !== liveOut[id]) { liveIn[id] = inn; liveOut[id] = out; changed = true; }
    }
  }
  return { liveIn, liveOut };
}

export function postorder(f: Func): number[] {
  const seen = new Uint8Array(f.blocks.length), out: number[] = [];
  const stack: [number, number][] = [[0, 0]];
  seen[0] = 1;
  while (stack.length) {
    const top = stack[stack.length - 1];
    const b = f.blocks[top[0]];
    if (top[1] < b.succs.length) {
      const s = b.succs[top[1]++];
      if (!seen[s]) { seen[s] = 1; stack.push([s, 0]); }
    } else { out.push(top[0]); stack.pop(); }
  }
  return out;
}

/** Can the function reach a `ret`? (calls to noreturn callees don't fall through) */
function reachesReturn(p: Program, f: Func): boolean {
  const seen = new Uint8Array(f.blocks.length);
  const st = [0]; seen[0] = 1;
  while (st.length) {
    const b = f.blocks[st.pop()!];
    let dead = false;
    for (const s of b.stmts) if (s.k === 'call' && calleeInfo(p, s).noreturn) { dead = true; break; }
    if (dead) continue;
    if (b.term.k === 'ret') return true;
    for (const s of b.succs) if (!seen[s]) { seen[s] = 1; st.push(s); }
  }
  return false;
}

/** Does any path define r0 before reaching a ret? (otherwise the function returns nothing) */
function definesR0(f: Func): boolean {
  for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'set' && s.dst === 0) || s.k === 'call') return true;
  return false;
}

/** Mark callees whose r0 result is read by a caller (r0 live right after the call). */
function markUsedResults(p: Program, f: Func, liveOut: Int32Array, onMarked: (cf: Func) => void): boolean {
  let changed = false;
  for (const b of f.blocks) {
    let live = liveOut[b.id] | termUse(f, b);
    for (let i = b.stmts.length - 1; i >= 0; i--) {
      const s = b.stmts[i];
      if (s.k === 'call' && s.t.k === 'fn' && (live & 1)) {
        const cf = p.funcs.get(s.t.pc);
        if (cf && !cf.returns && !cf.noreturn) { cf.returns = true; changed = true; onMarked(cf); }
      }
      const { use, def } = stmtUseDef(p, s);
      live = (live & ~def) | use;
    }
  }
  return changed;
}

/** Interprocedural fixed point for noreturn, returns, nparams, extraIn. */
export function inferSignatures(p: Program) {
  const funcs = [...p.funcs.values()];
  // noreturn: optimistic "returns" start, monotone decreasing reachability
  // (worklist: a function can only lose its path to `ret` when one of its callees becomes
  // noreturn, so only callers of newly noreturn functions are re-checked; the set only grows and
  // reachesReturn is monotone in it, hence the same least fixed point as re-scanning everything)
  const nrCallers = new Map<number, Func[]>();
  for (const f of funcs) {
    const seen = new Set<number>();
    for (const b of f.blocks) for (const s of b.stmts) {
      if (s.k !== 'call' || s.t.k !== 'fn' || seen.has(s.t.pc)) continue;
      seen.add(s.t.pc);
      let l = nrCallers.get(s.t.pc); if (!l) nrCallers.set(s.t.pc, (l = [])); l.push(f);
    }
  }
  {
    const queue = [...funcs], queued = new Set(funcs);
    for (let qi = 0; qi < queue.length; qi++) {
      const f = queue[qi];
      queued.delete(f);
      if (f.noreturn || reachesReturn(p, f)) continue;
      f.noreturn = true;
      for (const c of nrCallers.get(f.pc) ?? []) if (!c.noreturn && !queued.has(c)) { queued.add(c); queue.push(c); }
    }
  }
  // Cut blocks after calls to noreturn callees (code after them is unreachable)
  for (const f of funcs) truncateNoreturn(p, f);
  // lifted statements are shared between overlapping functions (Lifter.liftShared); call statements
  // get per-function state (indClobber, and in-place rewriting in recoverVars): unshare them now
  for (const f of funcs) for (const b of f.blocks) {
    const ss = b.stmts;
    for (let i = 0; i < ss.length; i++) if (ss[i].k === 'call') ss[i] = { ...ss[i] };
  }
  for (const f of funcs) computeIndClobber(p, f);
  for (const f of funcs) {
    f.nparams = 0; f.extraIn = [];
    // entrypoint and address-taken functions have unknown callers: they return r0 if they ever set it
    f.returns = !f.noreturn && (f.isEntry || p.addressTaken.has(f.pc) || !p.funcs.size) && (f.isEntry || definesR0(f));
  }
  // Worklist fixed point. Every update only grows nparams / extraIn / returns (monotone), so the
  // result is the least fixed point above the initial state whatever the evaluation order; a
  // function is re-evaluated only when an input of its liveness changed: its own `returns`
  // (set by a caller's markUsedResults) or a callee's nparams/extraIn.
  const callers = new Map<number, Func[]>();
  const callees = new Map<Func, Func[]>();
  for (const f of funcs) {
    const seen = new Set<number>();
    const out: Func[] = [];
    for (const b of f.blocks) for (const s of b.stmts) {
      if (s.k !== 'call' || s.t.k !== 'fn' || seen.has(s.t.pc)) continue;
      seen.add(s.t.pc);
      let l = callers.get(s.t.pc); if (!l) callers.set(s.t.pc, (l = [])); l.push(f);
      const g = p.funcs.get(s.t.pc); if (g) out.push(g);
    }
    callees.set(f, out);
  }
  // initial order: callees before callers (DFS postorder of the call graph), so that most
  // signatures are final before their callers are first evaluated (fewer re-evaluations)
  const queue: Func[] = [];
  {
    const done = new Set<Func>();
    for (const root of funcs) {
      if (done.has(root)) continue;
      done.add(root);
      const st: [Func, number][] = [[root, 0]];
      while (st.length) {
        const top = st[st.length - 1], cs = callees.get(top[0])!;
        if (top[1] < cs.length) { const g = cs[top[1]++]; if (!done.has(g)) { done.add(g); st.push([g, 0]); } }
        else { queue.push(top[0]); st.pop(); }
      }
    }
  }
  const queued = new Set(funcs);
  const enqueue = (g: Func) => { if (!queued.has(g)) { queued.add(g); queue.push(g); } };
  for (let qi = 0; qi < queue.length; qi++) {
    const f = queue[qi];
    queued.delete(f);
    const { liveIn, liveOut } = liveness(p, f);
    markUsedResults(p, f, liveOut, enqueue);
    const li = liveIn[0];
    let k = 0;
    for (let r = 1; r <= 5; r++) if (li & (1 << r)) k = r;
    const extra = [0, 6, 7, 8, 9].filter(r => li & (1 << r));
    const np = Math.max(k, f.nparams);
    const ex = [...new Set([...f.extraIn, ...extra])].sort((a, b) => a - b);
    if (np !== f.nparams || ex.join() !== f.extraIn.join()) {
      f.nparams = np; f.extraIn = ex;
      for (const c of callers.get(f.pc) ?? []) enqueue(c);
    }
  }
}

function truncateNoreturn(p: Program, f: Func) {
  let touched = false;
  for (const b of f.blocks) {
    const i = b.stmts.findIndex(s => s.k === 'call' && calleeInfo(p, s).noreturn);
    if (i < 0 || (i === b.stmts.length - 1 && b.term.k === 'trap')) continue;
    b.stmts.length = i + 1;
    b.term = { k: 'trap', msg: '' };
    for (const s of b.succs) f.blocks[s].preds = f.blocks[s].preds.filter(x => x !== b.id);
    b.succs = [];
    touched = true;
  }
  if (touched) pruneUnreachable(f);
}

/** Remove blocks unreachable from the entry, renumbering ids. */
export function pruneUnreachable(f: Func) {
  const seen = new Uint8Array(f.blocks.length);
  const st = [0]; seen[0] = 1;
  while (st.length) for (const s of f.blocks[st.pop()!].succs) if (!seen[s]) { seen[s] = 1; st.push(s); }
  if (seen.every(x => x)) return;
  const remap = new Int32Array(f.blocks.length).fill(-1);
  const nb: Block[] = [];
  for (const b of f.blocks) if (seen[b.id]) { remap[b.id] = nb.length; nb.push(b); }
  for (const b of nb) {
    b.id = remap[b.id];
    b.succs = b.succs.map(s => remap[s]);
    b.preds = b.preds.filter(x => remap[x] >= 0).map(x => remap[x]);
    const t = b.term;
    if (t.k === 'jmp') t.to = remap[t.to];
    else if (t.k === 'br') { t.t = remap[t.t]; t.f = remap[t.f]; }
  }
  f.blocks = nb;
  f.blockAt = new Map([...f.blockAt].filter(([, id]) => remap[id] >= 0).map(([pc, id]) => [pc, remap[id]]));
}

// ---------------- variable recovery ----------------

export interface VarInfo {
  id: number;
  reg: number;
  param: number;     // 1..5 for r1..r5 params, 10 for fp, 0/6..9 implicit inputs, -1 local
  undef: boolean;    // includes a call-clobber definition (value unknowable)
}

export interface VarFunc extends Func {
  vars: VarInfo[];
  promoted?: { off: number; size: number; v: number }[]; // stack slots turned into variables
  argAreaElided?: boolean; // stores to the outgoing stack-argument area were turned into call arguments
}

class UF {
  p: Int32Array;
  constructor(n: number) { this.p = new Int32Array(n).map((_, i) => i); }
  find(x: number): number { while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; } return x; }
  union(a: number, b: number) { a = this.find(a); b = this.find(b); if (a !== b) this.p[a] = b; }
}

/**
 * Convert register IR into variable IR. Each maximal web of definitions/uses of a
 * register (connected through shared uses) becomes one variable.
 */
export function recoverVars(p: Program, f: Func): VarFunc {
  const { liveIn } = liveness(p, f);
  const nb = f.blocks.length;
  // node ids: [0, nb*11) block-entry values; then per-def nodes
  let next = nb * 11;
  const entryNode = (b: number, r: number) => b * 11 + r;
  interface DefRec { node: number; reg: number; kind: 'stmt' | 'clobber' | 'entry' }
  const defs: DefRec[] = [];
  const newDef = (reg: number, kind: DefRec['kind']) => { const d = { node: next++, reg, kind }; defs.push(d); return d.node; };

  // entry definitions for registers live into the function
  const entryDefs = new Map<number, number>();
  for (let r = 0; r <= 10; r++) if (liveIn[0] & (1 << r)) { const n = newDef(r, 'entry'); entryDefs.set(r, n); }

  // first pass: allocate def nodes, record per-use node, compute block exit values
  type UseRef = { node: number };
  const stmtDefNode = new Map<Stmt, number>();
  const clobberNodes = new Map<Stmt, number[]>();
  const useNodes = new Map<Expr, number>(); // reg-read expr object -> node
  const exitVal: number[][] = [];
  for (const b of f.blocks) {
    const cur = new Array<number>(11);
    for (let r = 0; r <= 10; r++) cur[r] = entryNode(b.id, r);
    const noteUses = (e: Expr) => walkExpr(e, x => { if (x.k === 'reg') useNodes.set(x, cur[x.r]); });
    for (const s of b.stmts) {
      if (s.k === 'set') { noteUses(s.e); const n = newDef(s.dst, 'stmt'); stmtDefNode.set(s, n); cur[s.dst] = n; }
      else if (s.k === 'store') { noteUses(s.addr); noteUses(s.v); }
      else if (s.k === 'eval') noteUses(s.e);
      else if (s.k === 'call') {
        const ci = calleeInfo(p, s);
        s.args = s.args.slice(0, ci.nparams);
        if (s.t.k === 'ind') {
          const cm = indClobber.get(s) ?? 0;
          let k = 5;
          while (k > 0 && (cm & (1 << k))) k--;
          s.args = s.args.slice(0, k);
          for (let i = 0; i < k; i++) if (cm & (1 << (i + 1))) s.args[i] = { k: 'undef' };
        }
        s.args.forEach(noteUses);
        if (s.t.k === 'ind') noteUses(s.t.e);
        const extras: Expr[] = [];
        if (s.t.k === 'fn') { const cf = p.funcs.get(s.t.pc); if (cf) for (const r of cf.extraIn) extras.push({ k: 'reg', r }); }
        extras.forEach(noteUses);
        s.extra = extras;
        const cl: number[] = [];
        for (let r = 1; r <= 5; r++) { const n = newDef(r, 'clobber'); cl.push(n); cur[r] = n; }
        if (ci.returns) { const n = newDef(0, 'stmt'); stmtDefNode.set(s, n); cur[0] = n; s.dst = 0; }
        else { const n = newDef(0, 'clobber'); cl.push(n); cur[0] = n; s.dst = -1; }
        clobberNodes.set(s, cl);
      }
    }
    const t = b.term;
    if (t.k === 'br') noteUses(t.c);
    else if (t.k === 'ret') { if (f.returns && t.e) noteUses(t.e); else t.e = null; }
    exitVal[b.id] = cur;
  }

  const uf = new UF(next);
  // connect block-entry nodes with predecessor exit values (only for live registers)
  for (const b of f.blocks) {
    for (let r = 0; r <= 10; r++) {
      if (!(liveIn[b.id] & (1 << r))) continue;
      const en = entryNode(b.id, r);
      if (b.id === 0) { const d = entryDefs.get(r); if (d !== undefined) uf.union(en, d); }
      for (const pr of b.preds) uf.union(en, exitVal[pr][r]);
    }
  }
  // collect used classes
  const classVar = new Map<number, number>();
  const vars: VarInfo[] = [];
  const varOf = (node: number, reg: number): number => {
    const c = uf.find(node);
    let v = classVar.get(c);
    if (v === undefined) { v = vars.length; classVar.set(c, v); vars.push({ id: v, reg, param: -1, undef: false }); }
    return v;
  };
  // allocate variables for every class that is read (so clobber defs can be materialized in any order)
  for (const [x, n] of useNodes) varOf(n, (x as { r: number }).r);
  // rewrite
  const rw = (e: Expr): Expr => mapExpr(e, x => {
    if (x.k !== 'reg') return x;
    const n = useNodes.get(x);
    if (n === undefined) throw new Error('internal: unmapped register use');
    return { k: 'var', id: varOf(n, x.r) };
  });
  const rwUse = (e: Expr): Expr => {
    // mapExpr rebuilds nodes bottom-up: resolve reg leaves against the original objects first
    if (e.k === 'reg') { const n = useNodes.get(e)!; return { k: 'var', id: varOf(n, e.r) }; }
    return mapExprPre(e, rwLeaf);
  };
  const rwLeaf = (x: Expr): Expr | null => {
    if (x.k !== 'reg') return null;
    const n = useNodes.get(x);
    if (n === undefined) throw new Error('internal: unmapped register use');
    return { k: 'var', id: varOf(n, x.r) };
  };
  void rw;
  for (const b of f.blocks) {
    const out: Stmt[] = [];
    for (const s of b.stmts) {
      if (s.k === 'set') {
        const e = rwUse(s.e);
        out.push({ ...s, e, dst: varOf(stmtDefNode.get(s)!, s.dst) });
      } else if (s.k === 'store') out.push({ ...s, addr: rwUse(s.addr), v: rwUse(s.v) });
      else if (s.k === 'eval') out.push({ ...s, e: rwUse(s.e) });
      else if (s.k === 'call') {
        const ns: any = { ...s, args: s.args.map(rwUse), t: s.t.k === 'ind' ? { k: 'ind', e: rwUse(s.t.e) } : s.t };
        ns.extra = (s.extra ?? []).map(rwUse);
        ns.dst = s.dst === 0 ? varOf(stmtDefNode.get(s)!, 0) : -1;
        out.push(ns);
        // registers the callee leaves behind that are read later: explicit `undef` definitions
        for (const n of clobberNodes.get(s)!) {
          const v = classVar.get(uf.find(n));
          if (v !== undefined) out.push({ k: 'set', dst: v, e: { k: 'undef' }, pc: s.pc });
        }
      } else out.push(s);
    }
    b.stmts = out;
    const t = b.term;
    if (t.k === 'br') t.c = rwUse(t.c);
    else if (t.k === 'ret' && t.e) t.e = rwUse(t.e);
  }
  // classify variables: param / implicit input / undefined (clobber)
  for (const d of defs) {
    const c = uf.find(d.node);
    const v = classVar.get(c);
    if (v === undefined) continue;
    if (d.kind === 'entry') vars[v].param = d.reg;
    // clobber definitions are materialized as explicit `x = undef` statements
  }
  const vf = f as VarFunc;
  vf.vars = vars;
  return vf;
}

/** Pre-order leaf replacement that keeps object identity for lookups. */
function mapExprPre(e: Expr, leaf: (x: Expr) => Expr | null): Expr {
  const r = leaf(e);
  if (r) return r;
  switch (e.k) {
    case 'bin': case 'cmp': case 'land': case 'lor': return { ...e, a: mapExprPre(e.a, leaf), b: mapExprPre(e.b, leaf) } as Expr;
    case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': return { ...e, a: mapExprPre(e.a, leaf) } as Expr;
    case 'load': return { ...e, addr: mapExprPre(e.addr, leaf) };
    case 'sel': return { ...e, c: mapExprPre(e.c, leaf), a: mapExprPre(e.a, leaf), b: mapExprPre(e.b, leaf) };
    case 'call': return { ...e, t: e.t.k === 'ind' ? { k: 'ind', e: mapExprPre(e.t.e, leaf) } : e.t, args: e.args.map(a => mapExprPre(a, leaf)) };
    case 'fn': return { ...e, args: e.args.map(a => mapExprPre(a, leaf)) };
    default: return e;
  }
}
