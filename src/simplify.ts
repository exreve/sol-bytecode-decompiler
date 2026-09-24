// Exact expression simplification + variable propagation / dead code elimination.
// Every rewrite here is an identity over u64 arithmetic; nothing that can trap is dropped or reordered
// across a side effect.
import {
  type Expr, type Stmt, type CmpOp, B, C, M64, NEG_CMP, SWAP_CMP,
  evalBin, evalCmp, evalExt, evalBswap, Trap, walkExpr, hasSideEffectsOrMem, exprEq, u64, exprSize,
} from './ir.ts';
import type { VarFunc } from './dataflow.ts';

const bitlen = (v: bigint) => v.toString(2).length - (v === 0n ? 1 : 0);

/** Upper bound on the number of significant bits of an expression's value. */
export function maxBits(e: Expr): number {
  switch (e.k) {
    case 'const': return bitlen(e.v);
    case 'load': return e.size * 8;
    case 'ext': return e.signed ? 64 : e.bits;
    case 'bswap': return e.bits;
    case 'cmp': case 'lnot': case 'land': case 'lor': return 1;
    case 'bin':
      switch (e.op) {
        case 'and': return Math.min(maxBits(e.a), maxBits(e.b));
        case 'or': case 'xor': return Math.max(maxBits(e.a), maxBits(e.b));
        case 'lshr': return e.b.k === 'const' ? Math.max(0, maxBits(e.a) - Number(e.b.v & 63n)) : maxBits(e.a);
        case 'udiv': return maxBits(e.a);
        case 'urem': return Math.min(maxBits(e.a), maxBits(e.b));
        case 'add': return Math.min(64, Math.max(maxBits(e.a), maxBits(e.b)) + 1);
        case 'mul': return Math.min(64, maxBits(e.a) + maxBits(e.b));
        case 'shl': return e.b.k === 'const' ? Math.min(64, maxBits(e.a) + Number(e.b.v & 63n)) : 64;
        case 'sdiv32': case 'srem32': return 32;
        default: return 64;
      }
    case 'sel': return Math.max(maxBits(e.a), maxBits(e.b));
    default: return 64;
  }
}

const isPure = (e: Expr) => { const s = hasSideEffectsOrMem(e); return !s.load && !s.call && !s.trap; };
const isBool = (e: Expr) => e.k === 'cmp' || e.k === 'lnot' || e.k === 'land' || e.k === 'lor' || (e.k === 'const' && e.v <= 1n);

export function negate(c: Expr): Expr {
  if (c.k === 'cmp') { const n = NEG_CMP[c.op]; if (n) return { ...c, op: n }; }
  if (c.k === 'lnot') return c.a;
  if (c.k === 'land') return { k: 'lor', a: negate(c.a), b: negate(c.b) };
  if (c.k === 'lor') return { k: 'land', a: negate(c.a), b: negate(c.b) };
  if (c.k === 'const') return C(c.v === 0n ? 1 : 0);
  return { k: 'lnot', a: c };
}

/** Bottom-up simplification of one node whose children are already simplified. */
function simp1(e: Expr): Expr {
  switch (e.k) {
    case 'bin': {
      let { a, b } = e;
      const op = e.op;
      if (a.k === 'const' && b.k === 'const') {
        try { return C(evalBin(op, a.v, b.v)); } catch (x) { if (!(x instanceof Trap)) throw x; return e; }
      }
      // canonical: constant on the right for commutative ops
      if (a.k === 'const' && (op === 'add' || op === 'mul' || op === 'and' || op === 'or' || op === 'xor')) { [a, b] = [b, a]; e = { ...e, a, b }; }
      if (b.k === 'const') {
        const c = b.v;
        if (c === 0n && (op === 'add' || op === 'sub' || op === 'or' || op === 'xor' || op === 'shl' || op === 'lshr' || op === 'ashr')) return a;
        if (c === 1n && (op === 'mul' || op === 'udiv' || op === 'sdiv')) return a;
        if (c === M64 && op === 'and') return a;
        if (c === M64 && op === 'xor') return { k: 'not', a };
        if (c === 0n && (op === 'and' || op === 'mul') && isPure(a)) return C(0);
        if (op === 'sub') return simp1(B('add', a, C(u64(-c))));
        if (op === 'add' && a.k === 'bin' && a.op === 'add' && a.b.k === 'const') return simp1(B('add', a.a, C(u64(a.b.v + c))));
        if ((op === 'and' || op === 'or' || op === 'xor') && a.k === 'bin' && a.op === op && a.b.k === 'const') {
          return simp1(B(op, a.a, C(evalBin(op, a.b.v, c))));
        }
        if (op === 'and') {
          if (c === 0xffn) return simp1({ k: 'ext', signed: false, bits: 8, a });
          if (c === 0xffffn) return simp1({ k: 'ext', signed: false, bits: 16, a });
          if (c === 0xffffffffn) return simp1({ k: 'ext', signed: false, bits: 32, a });
          if (maxBits(a) <= bitlen(c) && ((1n << BigInt(maxBits(a))) - 1n & ~c) === 0n) return a;
        }
        if ((op === 'lshr' || op === 'ashr') && a.k === 'bin' && a.op === 'shl' && a.b.k === 'const' && a.b.v === c && (c === 32n || c === 48n || c === 56n)) {
          return simp1({ k: 'ext', signed: op === 'ashr', bits: Number(64n - c) as 8 | 16 | 32, a: a.a });
        }
        if (op === 'lshr' && maxBits(a) <= Number(c & 63n)) return isPure(a) ? C(0) : e;
        if (op === 'shl' && a.k === 'bin' && a.op === 'shl' && a.b.k === 'const' && (a.b.v & 63n) + (c & 63n) < 64n) return simp1(B('shl', a.a, C((a.b.v & 63n) + (c & 63n))));
        if ((op === 'or' || op === 'xor') && a.k === 'const') return e;
      }
      if ((op === 'sub' || op === 'xor') && exprEq(a, b) && isPure(a)) return C(0);
      if ((op === 'and' || op === 'or') && exprEq(a, b) && isPure(a)) return a;
      return e;
    }
    case 'neg':
      if (e.a.k === 'const') return C(u64(-e.a.v));
      if (e.a.k === 'neg') return e.a.a;
      return e;
    case 'not':
      if (e.a.k === 'const') return C(e.a.v ^ M64);
      return e;
    case 'ext': {
      const a = e.a;
      if (a.k === 'const') return C(evalExt(e.signed, e.bits, a.v));
      if (!e.signed && maxBits(a) <= e.bits) return a;
      if (e.signed && maxBits(a) < e.bits) return a;
      if (a.k === 'ext') {
        if (a.bits <= e.bits) {
          // inner result already fits in e.bits (zero) or is a sign-extension from fewer bits
          if (!a.signed) return e.signed && a.bits === e.bits ? { ...e, a: a.a } : a;
          if (e.signed) return a;
          return e.bits === a.bits ? { ...e, a: a.a } : e;
        }
        // outer narrower: only low e.bits of inner matter
        return simp1({ ...e, a: a.a });
      }
      if (a.k === 'load' && a.size * 8 === e.bits && !e.signed) return a;
      if (a.k === 'bin' && (a.op === 'and' || a.op === 'or' || a.op === 'xor') && a.b.k === 'const') {
        const m = (1n << BigInt(e.bits)) - 1n;
        const nc = a.b.v & m;
        if (nc !== a.b.v) return simp1({ ...e, a: simp1(B(a.op, a.a, C(nc))) });
      }
      return e;
    }
    case 'bswap':
      if (e.a.k === 'const') return C(evalBswap(e.bits, e.a.v));
      return e;
    case 'cmp': {
      let { a, b, op } = e;
      if (a.k === 'const' && b.k === 'const') return C(evalCmp(op, a.v, b.v) ? 1 : 0);
      if (a.k === 'const' && b.k !== 'const') { [a, b] = [b, a]; op = SWAP_CMP[op]; }
      if (b.k === 'const') {
        const c = b.v;
        // boolean value compared against 0/1
        if (isBool(a) && (op === 'ne' || op === 'eq') && (c === 0n || c === 1n)) {
          return (op === 'ne') === (c === 0n) ? a : negate(a);
        }
        if (op === 'set' && c === M64) return simp1({ k: 'cmp', op: 'ne', a, b: C(0) });
        if (op === 'ugt' && c === 0n) return { k: 'cmp', op: 'ne', a, b };
        if (op === 'ule' && c === 0n) return { k: 'cmp', op: 'eq', a, b };
        if (op === 'ult' && c === 1n) return { k: 'cmp', op: 'eq', a, b: C(0) };
        if (op === 'uge' && c === 1n) return { k: 'cmp', op: 'ne', a, b: C(0) };
        if ((op === 'eq' || op === 'ne') && a.k === 'bin' && a.op === 'xor' && isPure(a)) return { k: 'cmp', op, a: a.a, b: simp1(B('xor', a.b, b)) };
        if ((op === 'eq' || op === 'ne') && a.k === 'bin' && a.op === 'add' && a.b.k === 'const') return { k: 'cmp', op, a: a.a, b: C(u64(c - a.b.v)) };
        // value provably out of range of the constant
        const mb = maxBits(a);
        if (mb < 64 && isPure(a)) {
          const max = (1n << BigInt(mb)) - 1n;
          if ((op === 'eq') && c > max) return C(0);
          if ((op === 'ne') && c > max) return C(1);
        }
      }
      if (op === 'set' && b.k === 'const' && ((b.v & (b.v - 1n)) === 0n) && a.k === 'bin' && a.op === 'and') return { k: 'cmp', op, a, b };
      return { k: 'cmp', op, a, b };
    }
    case 'lnot': return negate(e.a);
    case 'land':
      if (e.a.k === 'const') return e.a.v ? e.b : C(0);
      return e;
    case 'lor':
      if (e.a.k === 'const') return e.a.v ? C(1) : e.b;
      return e;
    case 'sel':
      if (e.c.k === 'const') return e.c.v ? e.a : e.b;
      return e;
    default: return e;
  }
}

export function simplifyExpr(e: Expr): Expr {
  switch (e.k) {
    case 'bin': return simp1({ ...e, a: simplifyExpr(e.a), b: simplifyExpr(e.b) });
    case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': return simp1({ ...e, a: simplifyExpr(e.a) } as Expr);
    case 'load': return { ...e, addr: simplifyExpr(e.addr) };
    case 'cmp': case 'land': case 'lor': return simp1({ ...e, a: simplifyExpr(e.a), b: simplifyExpr(e.b) } as Expr);
    case 'sel': return simp1({ ...e, c: simplifyExpr(e.c), a: simplifyExpr(e.a), b: simplifyExpr(e.b) });
    case 'call': return { ...e, args: e.args.map(simplifyExpr) };
    default: return e;
  }
}

/** Condition simplifier: `x != 0` of boolean etc. */
export function simplifyCond(e: Expr): Expr {
  const s = simplifyExpr(e);
  return s;
}

// ---------------- function-level passes ----------------

interface DefSite { b: number; i: number } // i = stmt index

function substVars(e: Expr, m: Map<number, Expr>): Expr {
  let hit = false;
  walkExpr(e, x => { if (x.k === 'var' && m.has(x.id)) hit = true; });
  if (!hit) return e;
  const go = (x: Expr): Expr => {
    switch (x.k) {
      case 'var': return m.get(x.id) ?? x;
      case 'bin': case 'cmp': case 'land': case 'lor': return { ...x, a: go(x.a), b: go(x.b) } as Expr;
      case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': return { ...x, a: go(x.a) } as Expr;
      case 'load': return { ...x, addr: go(x.addr) };
      case 'sel': return { ...x, c: go(x.c), a: go(x.a), b: go(x.b) };
      case 'call': return { ...x, t: x.t.k === 'ind' ? { k: 'ind', e: go(x.t.e) } : x.t, args: x.args.map(go) };
      default: return x;
    }
  };
  return go(e);
}

function mapStmtExprs(s: Stmt, f: (e: Expr) => Expr): Stmt {
  switch (s.k) {
    case 'set': return { ...s, e: f(s.e) };
    case 'store': return { ...s, addr: f(s.addr), v: f(s.v) };
    case 'eval': return { ...s, e: f(s.e) };
    case 'call': return { ...s, args: s.args.map(f), t: s.t.k === 'ind' ? { k: 'ind', e: f(s.t.e) } : s.t, extra: s.extra?.map(f) };
    default: return s;
  }
}

export function stmtExprs(s: Stmt): Expr[] {
  switch (s.k) {
    case 'set': return [s.e];
    case 'store': return [s.addr, s.v];
    case 'eval': return [s.e];
    case 'call': return [...s.args, ...(s.t.k === 'ind' ? [s.t.e] : []), ...(s.extra ?? [])];
    default: return [];
  }
}

function varsIn(e: Expr, out: Set<number>) { walkExpr(e, x => { if (x.k === 'var') out.add(x.id); }); }

function countUses(f: VarFunc): Int32Array {
  const uses = new Int32Array(f.vars.length);
  const cnt = (e: Expr) => walkExpr(e, x => { if (x.k === 'var') uses[x.id]++; });
  for (const b of f.blocks) {
    for (const s of b.stmts) stmtExprs(s).forEach(cnt);
    if (b.term.k === 'br') cnt(b.term.c);
    else if (b.term.k === 'ret' && b.term.e) cnt(b.term.e);
  }
  return uses;
}

function defSites(f: VarFunc): { sites: DefSite[][]; } {
  const sites: DefSite[][] = f.vars.map(() => []);
  for (const b of f.blocks) b.stmts.forEach((s, i) => {
    if ((s.k === 'set' || s.k === 'call') && s.dst >= 0) sites[s.dst].push({ b: b.id, i });
  });
  return { sites };
}

/** A var is "SSA-like" if it has exactly one definition and is not a parameter/implicit input. */
function singleDef(f: VarFunc, sites: DefSite[][], v: number) {
  return sites[v].length === 1 && f.vars[v].param < 0 && !f.vars[v].undef;
}

const isCheap = (e: Expr) => exprSize(e) <= 3 && isPure(e);

export function optimizeFunc(f: VarFunc) {
  // simplify all expressions first
  for (let round = 0; round < 8; round++) {
    let changed = false;
    for (const b of f.blocks) {
      b.stmts = b.stmts.map(s => mapStmtExprs(s, simplifyExpr));
      if (b.term.k === 'br') b.term.c = simplifyExpr(b.term.c);
      else if (b.term.k === 'ret' && b.term.e) b.term.e = simplifyExpr(b.term.e);
    }
    changed = propagateGlobal(f) || changed;
    changed = inlineLocal(f) || changed;
    changed = dce(f) || changed;
    if (!changed) break;
  }
  foldConstBranches(f);
}

/** Substitute single-def vars whose definition is a cheap pure expression over single-def vars / constants. */
function propagateGlobal(f: VarFunc): boolean {
  const { sites } = defSites(f);
  const m = new Map<number, Expr>();
  // iterate to allow chains
  const candidates: number[] = [];
  for (let v = 0; v < f.vars.length; v++) {
    if (!singleDef(f, sites, v)) continue;
    const { b, i } = sites[v][0];
    const s = f.blocks[b].stmts[i];
    if (s.k !== 'set' || !isCheap(s.e)) continue;
    candidates.push(v);
  }
  const ok = (e: Expr): boolean => {
    let good = true;
    walkExpr(e, x => {
      if (x.k === 'var' && !(singleDef(f, sites, x.id) || f.vars[x.id].param >= 0 && sites[x.id].length === 0)) good = false;
    });
    return good;
  };
  for (const v of candidates) {
    const { b, i } = sites[v][0];
    const s = f.blocks[b].stmts[i] as Extract<Stmt, { k: 'set' }>;
    if (ok(s.e)) m.set(v, s.e);
  }
  if (!m.size) return false;
  // resolve chains; keep only substitutions that stay small (no duplication blow-up)
  for (const [v, e] of m) m.set(v, resolve(e, m, 0));
  for (const [v, e] of m) if (exprSize(e) > 4) m.delete(v);
  for (const [v, e] of m) m.set(v, resolve(e, m, 0));
  let changed = false;
  for (const b of f.blocks) {
    b.stmts = b.stmts.map(s => {
      const n = mapStmtExprs(s, e => substVars(e, m));
      if (n !== s) changed = true;
      return n;
    });
    if (b.term.k === 'br') { const c = substVars(b.term.c, m); if (c !== b.term.c) { b.term.c = c; changed = true; } }
    else if (b.term.k === 'ret' && b.term.e) { const c = substVars(b.term.e, m); if (c !== b.term.e) { b.term.e = c; changed = true; } }
  }
  return changed;
}

function resolve(e: Expr, m: Map<number, Expr>, depth: number): Expr {
  if (depth > 20) return e;
  const n = substVars(e, m);
  return n === e ? e : resolve(n, m, depth + 1);
}

/** Inline single-use definitions into their (same-block) use when no intervening statement interferes. */
function inlineLocal(f: VarFunc): boolean {
  const uses = countUses(f);
  const { sites } = defSites(f);
  let changed = false;
  for (const b of f.blocks) {
    for (let i = 0; i < b.stmts.length; i++) {
      const s = b.stmts[i];
      if (s.k !== 'set') continue;
      const v = s.dst;
      if (uses[v] !== 1 || sites[v].length !== 1 || f.vars[v].param >= 0 || f.vars[v].undef) continue;
      const fx = hasSideEffectsOrMem(s.e);
      const reads = new Set<number>(); varsIn(s.e, reads);
      // find use
      let j = i + 1;
      let found = -1;
      for (; j <= b.stmts.length; j++) {
        const exprs = j < b.stmts.length ? stmtExprs(b.stmts[j]) : b.term.k === 'br' ? [b.term.c] : b.term.k === 'ret' && b.term.e ? [b.term.e] : [];
        let hit = false;
        for (const e of exprs) walkExpr(e, x => { if (x.k === 'var' && x.id === v) hit = true; });
        if (hit) { found = j; break; }
        if (j === b.stmts.length) break;
        const t = b.stmts[j];
        if ((t.k === 'set' || t.k === 'call') && t.dst >= 0 && reads.has(t.dst)) break;
        if ((fx.load || fx.trap) && (t.k === 'store' || t.k === 'call' || t.k === 'trap')) break;
        if (t.k === 'set' || t.k === 'eval') {
          // moving a trapping expression past another trapping expression is fine (both abort)
        }
      }
      if (found < 0) continue;
      // the use itself: if the use statement is a call/store, evaluation of e still happens before its effect
      const m = new Map([[v, s.e]]);
      if (found < b.stmts.length) b.stmts[found] = mapStmtExprs(b.stmts[found], e => substVars(e, m));
      else if (b.term.k === 'br') b.term.c = substVars(b.term.c, m);
      else if (b.term.k === 'ret' && b.term.e) b.term.e = substVars(b.term.e, m);
      b.stmts.splice(i, 1);
      sites[v] = [];
      // indices shift: recompute sites lazily by restarting this block
      const r = defSites(f); for (let k = 0; k < sites.length; k++) sites[k] = r.sites[k];
      i--;
      changed = true;
    }
  }
  return changed;
}

/** Remove definitions of unused variables (keeping anything that may trap or has effects). */
function dce(f: VarFunc): boolean {
  let changed = false;
  for (let iter = 0; iter < 10; iter++) {
    const uses = countUses(f);
    let any = false;
    for (const b of f.blocks) {
      const out: Stmt[] = [];
      for (const s of b.stmts) {
        if (s.k === 'set' && uses[s.dst] === 0) {
          const fx = hasSideEffectsOrMem(s.e);
          if (fx.load || fx.trap || fx.call) out.push({ k: 'eval', e: s.e, pc: s.pc });
          any = true;
          continue;
        }
        if (s.k === 'call' && s.dst >= 0 && uses[s.dst] === 0) { out.push({ ...s, dst: -1 }); any = true; continue; }
        if (s.k === 'eval') {
          const fx = hasSideEffectsOrMem(s.e);
          if (!fx.load && !fx.trap && !fx.call) { any = true; continue; }
          // keep only the trapping sub-parts: strip pure wrappers
          const inner = trappingCore(s.e);
          if (inner !== s.e) { out.push({ ...s, e: inner }); any = true; continue; }
        }
        out.push(s);
      }
      b.stmts = out;
    }
    if (!any) break;
    changed = true;
  }
  return changed;
}

/** For an evaluated-for-effect expression, drop pure wrappers around a single trapping core. */
function trappingCore(e: Expr): Expr {
  if (e.k === 'load') return e;
  if (e.k === 'bin' && (e.op === 'udiv' || e.op === 'urem' || e.op === 'sdiv' || e.op === 'srem' || e.op === 'sdiv32' || e.op === 'srem32')) return e;
  const kids: Expr[] = [];
  switch (e.k) {
    case 'bin': case 'cmp': case 'land': case 'lor': kids.push(e.a, e.b); break;
    case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': kids.push(e.a); break;
  }
  const impure = kids.filter(k => !isPure(k));
  if (impure.length === 1 && (e.k !== 'land' && e.k !== 'lor')) return trappingCore(impure[0]);
  return e;
}

/** Branch on a constant becomes a jump. */
function foldConstBranches(f: VarFunc) {
  let touched = false;
  for (const b of f.blocks) {
    const t = b.term;
    if (t.k === 'br' && t.c.k === 'const') {
      const to = t.c.v ? t.t : t.f;
      const other = t.c.v ? t.f : t.t;
      b.term = { k: 'jmp', to };
      if (other !== to) f.blocks[other].preds = f.blocks[other].preds.filter(p => p !== b.id);
      b.succs = [to];
      touched = true;
    }
  }
  return touched;
}

export type { CmpOp };
