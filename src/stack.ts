// Stack slot promotion: frame locations accessed only directly (fp + const, one fixed size)
// and not reachable through any escaped frame pointer become ordinary variables.
//
// Escape model: a frame address fp+c that escapes (passed to a call, stored, used in arithmetic
// with a non-constant) makes [c, 0) reachable (objects are accessed upward from their base).
// `fp` itself escaping is the SBF convention for passing arguments 6+ (callee reads
// r5 - 0x1000 + 8*k); it makes the stack-argument area [-0x1000, -0x1000 + 0x100) reachable.
import type { VarFunc } from './dataflow.ts';
import type { Block } from './program.ts';
import type { Expr, Stmt } from './ir.ts';
import { walkExpr } from './ir.ts';

export interface Promoted { off: number; size: number; v: number }

const FRAME = 0x1000;

function fpOffset(e: Expr, fp: number): number | null {
  if (e.k === 'var' && e.id === fp) return 0;
  if (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const') {
    const c = Number(BigInt.asIntN(64, e.b.v));
    return c;
  }
  return null;
}

export function promoteStack(f: VarFunc & { promoted?: Promoted[] }): boolean {
  const fpv = f.vars.find(v => v.param === 10);
  if (!fpv) return false;
  const fp = fpv.id;
  // fp must never be reassigned
  for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'set' || s.k === 'call') && s.dst === fp) return false;

  const accesses = new Map<number, Set<number>>(); // off -> sizes
  let lowEscape = 0;            // lowest escaped base offset (region [lowEscape, 0))
  let wholeFrame = false;
  let argArea = false;
  const noteAccess = (off: number, size: number) => { let s = accesses.get(off); if (!s) accesses.set(off, (s = new Set())); s.add(size); };
  const escape = (off: number | null) => {
    if (off === null) { wholeFrame = true; return; }
    if (off === 0) { argArea = true; return; }
    if (off < -FRAME || off > 0) { wholeFrame = true; return; }
    lowEscape = Math.min(lowEscape, off);
  };
  // visit an expression; `addrCtx` = this node is the address of a load/store
  const visit = (e: Expr, addrCtx: number | null) => {
    const off = fpOffset(e, fp);
    if (off !== null) {
      if (addrCtx !== null) noteAccess(off, addrCtx);
      else escape(off);
      return;
    }
    switch (e.k) {
      case 'var': return; // not fp (fpOffset handles fp)
      case 'load': visit(e.addr, e.size); return;
      case 'bin':
        // pointer arithmetic on a frame address with a non-constant: object base escapes
        if (e.op === 'add') {
          const oa = fpOffset(e.a, fp), ob = fpOffset(e.b, fp);
          if (oa !== null) { escape(oa); visit(e.b, null); return; }
          if (ob !== null) { escape(ob); visit(e.a, null); return; }
          visit(e.a, null); visit(e.b, null);
          return;
        }
        // any other arithmetic on a frame address cannot be bounded
        if (usesVar(e, fp)) wholeFrame = true;
        return;
      case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot':
        if (usesVar(e, fp)) wholeFrame = true;
        return;
      case 'cmp': case 'land': case 'lor': visit(e.a, null); visit(e.b, null); return;
      case 'sel': visit(e.c, null); visit(e.a, null); visit(e.b, null); return;
      case 'call': e.args.forEach(a => visit(a, null)); if (e.t.k === 'ind') visit(e.t.e, null); return;
      case 'fn': e.args.forEach(a => visit(a, null)); return;
      default: return;
    }
  };
  for (const b of f.blocks) {
    for (const s of b.stmts) {
      switch (s.k) {
        case 'set': visit(s.e, null); break;
        case 'eval': visit(s.e, null); break;
        case 'store': visit(s.addr, s.size); visit(s.v, null); break;
        case 'call': s.args.forEach(a => visit(a, null)); s.extra?.forEach(a => visit(a, null)); if (s.t.k === 'ind') visit(s.t.e, null); break;
      }
    }
    if (b.term.k === 'br') visit(b.term.c, null);
    else if (b.term.k === 'ret' && b.term.e) visit(b.term.e, null);
  }
  if (wholeFrame) return false;

  // choose promotable slots
  const offs = [...accesses.keys()].sort((a, b) => a - b);
  const reachable = (lo: number, hi: number) => (lo < 0 && hi > lowEscape && lowEscape < 0) || (argArea && lo < -FRAME + 0x100 && hi > -FRAME);
  const chosen = new Map<number, number>(); // off -> size
  for (const off of offs) {
    const sizes = accesses.get(off)!;
    if (sizes.size !== 1) continue;
    const size = [...sizes][0];
    if (off < -FRAME || off + size > 0) continue;
    if (reachable(off, off + size)) continue;
    // no other access may overlap
    let overlap = false;
    for (const o2 of offs) {
      if (o2 === off) continue;
      for (const s2 of accesses.get(o2)!) if (o2 < off + size && off < o2 + s2) overlap = true;
    }
    if (!overlap) chosen.set(off, size);
  }
  if (!chosen.size) return false;

  const promoted: Promoted[] = [];
  const slotVar = new Map<number, number>();
  for (const [off, size] of chosen) {
    const v = f.vars.length;
    f.vars.push({ id: v, reg: -2, param: -1, undef: false });
    slotVar.set(off, v);
    promoted.push({ off, size, v });
  }
  const rw = (e: Expr): Expr => {
    switch (e.k) {
      case 'load': {
        const off = fpOffset(e.addr, fp);
        if (off !== null && chosen.get(off) === e.size) return { k: 'var', id: slotVar.get(off)! };
        return { ...e, addr: rw(e.addr) };
      }
      case 'bin': case 'cmp': case 'land': case 'lor': return { ...e, a: rw(e.a), b: rw(e.b) } as Expr;
      case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': return { ...e, a: rw(e.a) } as Expr;
      case 'sel': return { ...e, c: rw(e.c), a: rw(e.a), b: rw(e.b) };
      case 'call': return { ...e, args: e.args.map(rw), t: e.t.k === 'ind' ? { k: 'ind', e: rw(e.t.e) } : e.t };
      case 'fn': return { ...e, args: e.args.map(rw) };
      default: return e;
    }
  };
  for (const b of f.blocks) {
    b.stmts = b.stmts.map((s): Stmt => {
      switch (s.k) {
        case 'set': return { ...s, e: rw(s.e) };
        case 'eval': return { ...s, e: rw(s.e) };
        case 'store': {
          const off = fpOffset(s.addr, fp);
          const val = rw(s.v);
          if (off !== null && chosen.get(off) === s.size) {
            const v = slotVar.get(off)!;
            return { k: 'set', dst: v, e: s.size === 8 ? val : { k: 'ext', signed: false, bits: (s.size * 8) as 8 | 16 | 32, a: val }, pc: s.pc };
          }
          return { ...s, addr: rw(s.addr), v: val };
        }
        case 'call': return { ...s, args: s.args.map(rw), extra: s.extra?.map(rw), t: s.t.k === 'ind' ? { k: 'ind', e: rw(s.t.e) } : s.t };
        default: return s;
      }
    });
    if (b.term.k === 'br') b.term.c = rw(b.term.c);
    else if (b.term.k === 'ret' && b.term.e) b.term.e = rw(b.term.e);
  }
  // slots possibly read before written: initialize from memory at function entry (exact)
  const liveAtEntry = liveInEntry(f, new Set(slotVar.values()));
  if (liveAtEntry.size) {
    const entry = ensurePreEntry(f);
    const inits: Stmt[] = [];
    for (const [off, size] of chosen) {
      const v = slotVar.get(off)!;
      if (!liveAtEntry.has(v)) continue;
      inits.push({ k: 'set', dst: v, e: { k: 'load', size: size as 1 | 2 | 4 | 8, addr: off === 0 ? { k: 'var', id: fp } : { k: 'bin', op: 'add', a: { k: 'var', id: fp }, b: { k: 'const', v: BigInt.asUintN(64, BigInt(off)) } } }, pc: -1 });
    }
    entry.stmts.unshift(...inits);
  }
  f.promoted = [...(f.promoted ?? []), ...promoted];
  return true;
}

function usesVar(e: Expr, v: number) { let u = false; walkExpr(e, x => { if (x.k === 'var' && x.id === v) u = true; }); return u; }
/** Variables (from `only`) that may be read before being written on some path from entry. */
function liveInEntry(f: VarFunc, only: Set<number>): Set<number> {
  const nb = f.blocks.length;
  const liveIn: Set<number>[] = Array.from({ length: nb }, () => new Set());
  const gen: Set<number>[] = [], kill: Set<number>[] = [];
  for (const b of f.blocks) {
    const g = new Set<number>(), k = new Set<number>();
    const use = (e: Expr) => walkExpr(e, x => { if (x.k === 'var' && only.has(x.id) && !k.has(x.id)) g.add(x.id); });
    for (const s of b.stmts) {
      if (s.k === 'set') { use(s.e); if (only.has(s.dst)) k.add(s.dst); }
      else if (s.k === 'store') { use(s.addr); use(s.v); }
      else if (s.k === 'eval') use(s.e);
      else if (s.k === 'call') { s.args.forEach(use); s.extra?.forEach(use); if (s.t.k === 'ind') use(s.t.e); }
    }
    if (b.term.k === 'br') use(b.term.c);
    else if (b.term.k === 'ret' && b.term.e) use(b.term.e);
    gen.push(g); kill.push(k);
  }
  for (let changed = true; changed;) {
    changed = false;
    for (let id = nb - 1; id >= 0; id--) {
      const b = f.blocks[id];
      const out = new Set<number>();
      for (const s of b.succs) for (const v of liveIn[s]) out.add(v);
      const inn = new Set(gen[id]);
      for (const v of out) if (!kill[id].has(v)) inn.add(v);
      if (inn.size !== liveIn[id].size) { liveIn[id] = inn; changed = true; }
    }
  }
  return liveIn[0];
}

/** Make sure block 0 has no predecessors (so code prepended to it runs exactly once). */
export function ensurePreEntry(f: VarFunc): Block {
  const b0 = f.blocks[0];
  if (!b0.preds.length) return b0;
  const nid = f.blocks.length;
  const moved: Block = { ...b0, id: nid, preds: [...b0.preds.map(p => (p === 0 ? nid : p)), 0] };
  f.blocks.push(moved);
  for (const s of moved.succs) f.blocks[s].preds = f.blocks[s].preds.map(p => (p === 0 ? nid : p));
  // retarget back edges into the old entry
  for (const b of f.blocks) {
    if (b === moved) continue;
    const t = b.term;
    if (!b.succs.includes(0)) continue;
    if (t.k === 'jmp' && t.to === 0) t.to = nid;
    if (t.k === 'br') { if (t.t === 0) t.t = nid; if (t.f === 0) t.f = nid; }
    b.succs = b.succs.map(s => (s === 0 ? nid : s));
  }
  const mt = moved.term;
  if (mt.k === 'jmp' && mt.to === 0) mt.to = nid;
  if (mt.k === 'br') { if (mt.t === 0) mt.t = nid; if (mt.f === 0) mt.f = nid; }
  moved.succs = moved.succs.map(s => (s === 0 ? nid : s));
  f.blocks[0] = { id: 0, start: b0.start, end: b0.start, stmts: [], term: { k: 'jmp', to: nid }, succs: [nid], preds: [] };
  return f.blocks[0];
}
