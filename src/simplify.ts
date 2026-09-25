// Exact expression simplification + variable propagation / dead code elimination.
// Every rewrite here is an identity over u64 arithmetic; nothing that can trap is dropped or reordered
// across a side effect.
import {
  type Expr, type Stmt, type CmpOp, B, C, M64, NEG_CMP, SWAP_CMP,
  evalBin, evalCmp, evalExt, evalBswap, Trap, walkExpr, hasSideEffectsOrMem, exprEq, u64, exprSize, isDivOp, safeDivisor,
} from './ir.ts';
import { type VarFunc, pruneUnreachable } from './dataflow.ts';
import type { Image } from './elf.ts';
import { tailDuplicate, mergeBlocks, localConstProp, deadStores, globalConstProp, localCopyProp } from './cfgopt.ts';

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
      if (op === e.op && a === e.a && b === e.b) return e; // unchanged (same as rebuilding it)
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

// simplifyExpr returns `e` itself when nothing changes (IR expressions are immutable, so reusing the
// node is equivalent to rebuilding it); optimizeFunc relies on this to detect rounds that did nothing.
export function simplifyExpr(e: Expr): Expr {
  switch (e.k) {
    case 'bin': case 'cmp': case 'land': case 'lor': {
      const a = simplifyExpr(e.a), b = simplifyExpr(e.b);
      return simp1(a === e.a && b === e.b ? e : { ...e, a, b } as Expr);
    }
    case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': {
      const a = simplifyExpr(e.a);
      return simp1(a === e.a ? e : { ...e, a } as Expr);
    }
    case 'load': {
      const addr = simplifyExpr(e.addr);
      // read-only program memory never changes and never faults: the load is a constant
      if (addr.k === 'const' && foldImage) { const v = foldImage.readConst(addr.v, e.size); if (v !== undefined) return C(v); }
      return addr === e.addr ? e : { ...e, addr };
    }
    case 'sel': {
      const c = simplifyExpr(e.c), a = simplifyExpr(e.a), b = simplifyExpr(e.b);
      return simp1(c === e.c && a === e.a && b === e.b ? e : { ...e, c, a, b });
    }
    case 'call': {
      let args: Expr[] | undefined;
      for (let i = 0; i < e.args.length; i++) { const x = simplifyExpr(e.args[i]); if (x !== e.args[i]) (args ??= e.args.slice())[i] = x; }
      return args ? { ...e, args } : e;
    }
    default: return e;
  }
}

/** Condition simplifier: `x != 0` of boolean etc. */
export function simplifyCond(e: Expr): Expr {
  const s = simplifyExpr(e);
  return s;
}

// ---------------- function-level passes ----------------

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

export function mapStmtExprs(s: Stmt, f: (e: Expr) => Expr): Stmt {
  switch (s.k) {
    case 'set': return { ...s, e: f(s.e) };
    case 'store': return { ...s, addr: f(s.addr), v: f(s.v) };
    case 'eval': return { ...s, e: f(s.e) };
    case 'call': return { ...s, args: s.args.map(f), t: s.t.k === 'ind' ? { k: 'ind', e: f(s.t.e) } : s.t, extra: s.extra?.map(f) };
    case 'stores': return { ...s, addr: f(s.addr), vals: s.vals.map(f) };
    case 'copy': return { ...s, dst: f(s.dst), src: f(s.src) };
    default: return s;
  }
}

/** mapStmtExprs that returns `s` itself when `f` returned every expression unchanged. */
function mapStmtExprsKeep(s: Stmt, f: (e: Expr) => Expr): Stmt {
  switch (s.k) {
    case 'set': { const e = f(s.e); return e === s.e ? s : { ...s, e }; }
    case 'store': { const addr = f(s.addr), v = f(s.v); return addr === s.addr && v === s.v ? s : { ...s, addr, v }; }
    case 'eval': { const e = f(s.e); return e === s.e ? s : { ...s, e }; }
    case 'call': {
      const args = mapAll(s.args, f), te = s.t.k === 'ind' ? f(s.t.e) : undefined, extra = s.extra && mapAll(s.extra, f);
      if (args === s.args && extra === s.extra && (s.t.k !== 'ind' || te === s.t.e)) return s;
      return { ...s, args, t: s.t.k === 'ind' ? { k: 'ind', e: te! } : s.t, extra };
    }
    case 'stores': { const addr = f(s.addr), vals = mapAll(s.vals, f); return addr === s.addr && vals === s.vals ? s : { ...s, addr, vals }; }
    case 'copy': { const dst = f(s.dst), src = f(s.src); return dst === s.dst && src === s.src ? s : { ...s, dst, src }; }
    default: return s;
  }
}
function mapAll(es: Expr[], f: (e: Expr) => Expr): Expr[] {
  let out: Expr[] | undefined;
  for (let i = 0; i < es.length; i++) { const n = f(es[i]); if (n !== es[i]) (out ??= es.slice())[i] = n; }
  return out ?? es;
}

export function stmtExprs(s: Stmt): Expr[] {
  switch (s.k) {
    case 'set': return [s.e];
    case 'store': return [s.addr, s.v];
    case 'eval': return [s.e];
    case 'call': return [...s.args, ...(s.t.k === 'ind' ? [s.t.e] : []), ...(s.extra ?? [])];
    case 'stores': return [s.addr, ...s.vals];
    case 'copy': return [s.dst, s.src];
    default: return [];
  }
}

/**
 * Per-statement summary of stmtExprs(s): every variable occurrence (with multiplicity) and the
 * union of hasSideEffectsOrMem over the expressions. Cached per statement object, which is sound
 * because statements are never mutated in place after variable recovery (rewrites create new ones).
 * The cache lives in a non-enumerable symbol property: invisible to spreads (`{ ...s }` copies do not
 * inherit it), JSON and for-in, and much cheaper than a WeakMap with millions of entries.
 */
interface StmtInfo { vars: number[]; load: boolean; call: boolean; trap: boolean }
const INFO = Symbol('stmtInfo');
export function stmtInfo(s: Stmt): StmtInfo {
  let r: StmtInfo | undefined = (s as any)[INFO];
  if (r) return r;
  r = { vars: [], load: false, call: false, trap: false };
  for (const e of stmtExprs(s)) scanInfo(e, r);
  Object.defineProperty(s, INFO, { value: r });
  return r;
}
/** One walk computing what walkExpr (var occurrences) and hasSideEffectsOrMem compute. */
function scanInfo(e: Expr, r: StmtInfo): void {
  switch (e.k) {
    case 'var': r.vars.push(e.id); return;
    case 'load': r.load = true; r.trap = true; scanInfo(e.addr, r); return;
    case 'call': r.call = true; if (e.t.k === 'ind') scanInfo(e.t.e, r); for (const a of e.args) scanInfo(a, r); return;
    case 'bin': if (isDivOp(e.op) && !safeDivisor(e.op, e.b)) r.trap = true; scanInfo(e.a, r); scanInfo(e.b, r); return;
    case 'cmp': case 'land': case 'lor': scanInfo(e.a, r); scanInfo(e.b, r); return;
    case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': scanInfo(e.a, r); return;
    case 'sel': scanInfo(e.c, r); scanInfo(e.a, r); scanInfo(e.b, r); return;
  }
}
const countIn = (vars: number[], v: number) => { let n = 0; for (let k = 0; k < vars.length; k++) if (vars[k] === v) n++; return n; };

function countUses(f: VarFunc): Int32Array {
  const uses = new Int32Array(f.vars.length);
  const cnt = (e: Expr) => walkExpr(e, x => { if (x.k === 'var') uses[x.id]++; });
  for (const b of f.blocks) {
    for (const s of b.stmts) for (const v of stmtInfo(s).vars) uses[v]++;
    if (b.term.k === 'br') cnt(b.term.c);
    else if (b.term.k === 'ret' && b.term.e) cnt(b.term.e);
  }
  return uses;
}

/** Number of definitions of each variable. */
function defCounts(f: VarFunc): Int32Array {
  const nd = new Int32Array(f.vars.length);
  for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'set' || s.k === 'call') && s.dst >= 0) nd[s.dst]++;
  return nd;
}

const isCheap = (e: Expr) => exprSize(e) <= 3 && isPure(e);

/** Debug switch: SBPF_DISABLE=prop,inline,... turns passes off (bisecting miscompiles). */
/** Program image used to fold loads from read-only memory (set per decompilation). */
let foldImage: Image | null = null;
export function setFoldImage(img: Image | null) { foldImage = img; }

export const DISABLED = new Set((process.env.SBPF_DISABLE ?? '').split(',').filter(Boolean));

export function optimizeFunc(f: VarFunc) {
  // simplify all expressions first
  // `changed` keeps the historical per-pass flags (propagateGlobal and localCopyProp over-report),
  // which decide how many rounds run. `st.real` records whether the IR was actually modified: a
  // round that modifies nothing leaves the IR identical, so every later round would repeat it
  // exactly (all passes are deterministic functions of the IR; tail duplication only runs in
  // rounds < 6, and it did nothing in this round either) and stopping early gives the same result.
  for (let round = 0; round < 8; round++) {
    let changed = false;
    const st = { real: false };
    for (const b of f.blocks) {
      const ss = b.stmts;
      for (let i = 0; i < ss.length; i++) { const n = mapStmtExprsKeep(ss[i], simplifyExpr); if (n !== ss[i]) { ss[i] = n; st.real = true; } }
      if (b.term.k === 'br') { const c = simplifyExpr(b.term.c); if (c !== b.term.c) { b.term.c = c; st.real = true; } }
      else if (b.term.k === 'ret' && b.term.e) { const c = simplifyExpr(b.term.e); if (c !== b.term.e) { b.term.e = c; st.real = true; } }
    }
    const off = (n: string) => DISABLED.has(n);
    const exact = (c: boolean) => { if (c) { changed = true; st.real = true; } };
    if (!off('prop')) changed = propagateGlobal(f, st) || changed;
    // inlineLocal hands dce the exact use counts after its rewrites (saves a recount)
    let counts: Int32Array | undefined;
    if (!off('inline')) exact(inlineLocal(f, c => { counts = c; }));
    exact(dce(f, counts));
    if (!off('lconst')) exact(localConstProp(f));
    if (!off('gconst')) exact(globalConstProp(f));
    if (!off('copy')) changed = localCopyProp(f, st) || changed;
    if (foldConstBranches(f)) { pruneUnreachable(f); mergeBlocks(f); changed = true; st.real = true; }
    if (!off('dse')) exact(deadStores(f));
    if (!off('taildup') && round < 6 && tailDuplicate(f)) { changed = true; st.real = true; }
    if (!changed || !st.real) break;
  }
}

/** Substitute single-def vars whose definition is a cheap pure expression over single-def vars / constants. */
function propagateGlobal(f: VarFunc, st: { real: boolean }): boolean {
  // definition count and first definition of each variable (all that was used of its def sites)
  const nd = new Int32Array(f.vars.length);
  const firstDef: (Stmt | undefined)[] = new Array(f.vars.length);
  for (const b of f.blocks) for (const s of b.stmts) {
    if ((s.k === 'set' || s.k === 'call') && s.dst >= 0 && nd[s.dst]++ === 0) firstDef[s.dst] = s;
  }
  // "SSA-like": exactly one definition and not a parameter/implicit input
  const singleDef = (v: number) => nd[v] === 1 && f.vars[v].param < 0 && !f.vars[v].undef;
  const m = new Map<number, Expr>();
  // iterate to allow chains
  const candidates: number[] = [];
  for (let v = 0; v < f.vars.length; v++) {
    if (!singleDef(v)) continue;
    const s = firstDef[v]!;
    if (s.k !== 'set' || !isCheap(s.e)) continue;
    candidates.push(v);
  }
  const ok = (e: Expr): boolean => {
    let good = true;
    walkExpr(e, x => {
      if (x.k === 'var' && !(singleDef(x.id) || f.vars[x.id].param >= 0 && nd[x.id] === 0)) good = false;
    });
    return good;
  };
  for (const v of candidates) {
    const s = firstDef[v] as Extract<Stmt, { k: 'set' }>;
    if (ok(s.e)) m.set(v, s.e);
  }
  if (!m.size) return false;
  // resolve chains; keep only substitutions that stay small (no duplication blow-up)
  // (the first pass stops resolving an entry once it exceeds the size limit: see resolveSmall)
  for (const [v, e] of m) m.set(v, resolveSmall(e, m, 0));
  for (const [v, e] of m) if (e === TOO_BIG || exprSize(e) > 4) m.delete(v);
  for (const [v, e] of m) m.set(v, resolve(e, m, 0));
  // Historical result: the former rewrite rebuilt every non-trap statement, so it reported a change
  // whenever some block has one (or a terminator was rewritten); optimizeFunc's round count depends on it.
  let changed = false;
  const sub = (e: Expr) => substVars(e, m);
  for (const b of f.blocks) {
    const ss = b.stmts;
    for (let i = 0; i < ss.length; i++) {
      const s = ss[i];
      if (s.k !== 'trap') changed = true;
      const n = mapStmtExprsKeep(s, sub);
      if (n !== s) { ss[i] = n; st.real = true; }
    }
    if (b.term.k === 'br') { const c = substVars(b.term.c, m); if (c !== b.term.c) { b.term.c = c; changed = true; st.real = true; } }
    else if (b.term.k === 'ret' && b.term.e) { const c = substVars(b.term.e, m); if (c !== b.term.e) { b.term.e = c; changed = true; st.real = true; } }
  }
  return changed;
}

function resolve(e: Expr, m: Map<number, Expr>, depth: number): Expr {
  if (depth > 20) return e;
  const n = substVars(e, m);
  return n === e ? e : resolve(n, m, depth + 1);
}

/** Stand-in for a resolved expression larger than 4 nodes (such entries are dropped). */
const TOO_BIG: Expr = { k: 'undef' };

/**
 * resolve() for the first chain-resolution pass, whose results larger than 4 nodes are all dropped.
 * Substituting variables never shrinks an expression, so once an intermediate result exceeds 4
 * nodes (or would contain a TOO_BIG value) the final one would too: return TOO_BIG instead of
 * building it. Results that stay small are computed exactly as resolve() does. This avoids the
 * exponential growth of chains like `x2 = x1 * x1`, `x3 = x2 * x2`, ... in huge straight-line code.
 */
function resolveSmall(e: Expr, m: Map<number, Expr>, depth: number): Expr {
  for (;;) {
    if (depth > 20) return e;
    let hit = false, big = false;
    walkExpr(e, x => { if (x.k === 'var') { const r = m.get(x.id); if (r !== undefined) { hit = true; if (r === TOO_BIG) big = true; } } });
    if (!hit) return e;
    if (big) return TOO_BIG;
    const n = substVars(e, m);
    if (exprSize(n) > 4) return TOO_BIG;
    e = n; depth++;
  }
}

/** Inline single-use definitions into their (same-block) use when no intervening statement interferes. */
function inlineLocal(f: VarFunc, exactCounts?: (uses: Int32Array) => void): boolean {
  const uses = countUses(f); // deliberately not updated during the pass
  // exact counts: an inline replaces the single occurrence of v by its definition, which moves
  // (not copies) the other variables' occurrences, so only v loses a use
  const cur = uses.slice();
  const nd = defCounts(f);
  let changed = false;
  for (const b of f.blocks) {
    for (let i = 0; i < b.stmts.length; i++) {
      const s = b.stmts[i];
      if (s.k === 'call' && s.dst >= 0 && inlineCall(f, b, i, uses, nd)) { cur[s.dst]--; changed = true; i--; continue; }
      if (s.k !== 'set') continue;
      const v = s.dst;
      if (!(uses[v] === 1 && nd[v] === 1 && f.vars[v].param < 0) && localReach(b, i, v) !== 1) continue;
      const fx = stmtInfo(s); // stmtExprs(set) = [s.e]
      const reads = new Set<number>(fx.vars);
      // find use
      let j = i + 1;
      let found = -1;
      for (; j <= b.stmts.length; j++) {
        if (j === b.stmts.length) {
          const te = b.term.k === 'br' ? b.term.c : b.term.k === 'ret' && b.term.e ? b.term.e : null;
          if (te) { let hit = false; walkExpr(te, x => { if (x.k === 'var' && x.id === v) hit = true; }); if (hit) found = j; }
          break;
        }
        const t = b.stmts[j];
        const ti = stmtInfo(t);
        if (ti.vars.includes(v)) { found = j; break; }
        if ((t.k === 'set' || t.k === 'call') && t.dst >= 0 && reads.has(t.dst)) break;
        // effects of the statement we would move past
        const tLoads = ti.load, tCalls = t.k === 'call' || ti.call;
        const tWrites = t.k === 'store' || t.k === 'stores' || t.k === 'copy' || t.k === 'trap' || tCalls;
        if ((fx.load || fx.trap || fx.call) && tWrites) break;
        // a call may write memory that t reads, and may trap before t's own traps
        if (fx.call && (tLoads || ti.trap)) break;
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
      nd[v]--; // the removed statement was a definition of v (the old code recomputed all def sites here)
      cur[v]--;
      i--;
      changed = true;
    }
  }
  exactCounts?.(cur);
  return changed;
}


/** If the definition of v at stmt i only reaches uses inside this block, return how many; else -1. */
function localReach(b: { stmts: Stmt[]; term: any; succs: number[] }, i: number, v: number): number {
  let n = 0;
  const cnt = (e: Expr) => walkExpr(e, x => { if (x.k === 'var' && x.id === v) n++; });
  for (let j = i + 1; j < b.stmts.length; j++) {
    const t = b.stmts[j];
    n += countIn(stmtInfo(t).vars, v);
    if ((t.k === 'set' || t.k === 'call') && t.dst === v) return n;
  }
  if (b.term.k === 'br') cnt(b.term.c);
  else if (b.term.k === 'ret' && b.term.e) cnt(b.term.e);
  return b.succs.length === 0 ? n : -1;
}

/** `v = call(...)` immediately followed by the single use of v -> call expression at the use site. */
function inlineCall(f: VarFunc, b: { stmts: Stmt[]; term: any }, i: number, uses: Int32Array, nd: Int32Array): boolean {
  const s = b.stmts[i] as Extract<Stmt, { k: 'call' }>;
  const v = s.dst;
  if (!(uses[v] === 1 && nd[v] === 1 && f.vars[v].param < 0) && localReach(b as any, i, v) !== 1) return false;
  const next = i + 1 < b.stmts.length ? stmtExprs(b.stmts[i + 1]) : b.term.k === 'br' ? [b.term.c] : b.term.k === 'ret' && b.term.e ? [b.term.e] : null;
  if (!next) return false;
  let hit = false, impure = false;
  for (const e of next) { walkExpr(e, x => { if (x.k === 'var' && x.id === v) hit = true; }); const fx = hasSideEffectsOrMem(e); if (fx.load || fx.call || fx.trap) impure = true; }
  if (!hit || impure) return false;
  if (i + 1 < b.stmts.length && b.stmts[i + 1].k === 'call' && (b.stmts[i + 1] as any).t.k === 'ind' && false) return false;
  const ce: Expr = { k: 'call', t: s.t, args: [...s.args, ...(s.extra ?? [])] };
  const m = new Map([[v, ce]]);
  if (i + 1 < b.stmts.length) b.stmts[i + 1] = mapStmtExprs(b.stmts[i + 1], e => substVars(e, m));
  else if (b.term.k === 'br') b.term.c = substVars(b.term.c, m);
  else b.term.e = substVars(b.term.e, m);
  b.stmts.splice(i, 1);
  nd[v]--;
  return true;
}

/** Remove definitions of unused variables (keeping anything that may trap or has effects). */
function dce(f: VarFunc, initialUses?: Int32Array): boolean {
  let changed = false;
  // use counts are computed once and then kept equal to a recount: each pass reads the counts at
  // its start (`uses`) and records the effect of every removed/rewritten statement in `next`
  let uses = initialUses ?? countUses(f);
  const drop = (next: Int32Array, s: Stmt) => { for (const v of stmtInfo(s).vars) next[v]--; };
  const add = (next: Int32Array, s: Stmt) => { for (const v of stmtInfo(s).vars) next[v]++; };
  for (let iter = 0; iter < 10; iter++) {
    const next = uses.slice();
    let any = false;
    for (const b of f.blocks) {
      const out: Stmt[] = [];
      for (const s of b.stmts) {
        if (s.k === 'set' && s.e.k === 'var' && s.e.id === s.dst) { any = true; drop(next, s); continue; } // x = x
        if (s.k === 'set' && uses[s.dst] === 0) {
          const fx = stmtInfo(s); // = hasSideEffectsOrMem(s.e)
          if (fx.load || fx.trap || fx.call) out.push({ k: 'eval', e: s.e, pc: s.pc }); // same expression: same uses
          else drop(next, s);
          any = true;
          continue;
        }
        if (s.k === 'call' && s.dst >= 0 && uses[s.dst] === 0) { out.push({ ...s, dst: -1 }); any = true; continue; }
        if (s.k === 'eval') {
          const fx = stmtInfo(s);
          if (!fx.load && !fx.trap && !fx.call) { any = true; drop(next, s); continue; }
          // keep only the trapping sub-parts: strip pure wrappers
          const inner = trappingCore(s.e);
          if (inner !== s.e) { const ns: Stmt = { ...s, e: inner }; out.push(ns); drop(next, s); add(next, ns); any = true; continue; }
        }
        out.push(s);
      }
      b.stmts = out;
    }
    if (!any) break;
    uses = next;
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
