// Intermediate representation. Every value is an unsigned 64-bit integer; every
// operator has exactly the sBPF VM semantics documented next to it.

export type BinOp =
  | 'add' | 'sub' | 'mul'           // wrapping
  | 'udiv' | 'urem'                 // unsigned; traps on divisor 0
  | 'sdiv' | 'srem'                 // signed i64; traps on 0 and on MIN / -1
  | 'sdiv32' | 'srem32'             // signed i32 on low halves, result zero-extended; traps on 0 and MIN / -1
  | 'and' | 'or' | 'xor'
  | 'shl' | 'lshr' | 'ashr'         // shift amount masked with 63
  | 'uhmul' | 'shmul';              // high 64 bits of 128-bit product (unsigned / signed)

export type CmpOp = 'eq' | 'ne' | 'ugt' | 'uge' | 'ult' | 'ule' | 'sgt' | 'sge' | 'slt' | 'sle' | 'set';

export type Expr =
  | { k: 'const'; v: bigint }
  | { k: 'var'; id: number }
  | { k: 'reg'; r: number }                                   // pre-variable-recovery register read
  | { k: 'undef' }                                            // unspecified value (register left over by a callee)
  | { k: 'bin'; op: BinOp; a: Expr; b: Expr }
  | { k: 'neg'; a: Expr }
  | { k: 'not'; a: Expr }                                      // bitwise not (only produced by simplifier)
  | { k: 'ext'; signed: boolean; bits: 8 | 16 | 32; a: Expr }  // truncate to bits then zero/sign extend to 64
  | { k: 'bswap'; bits: 16 | 32 | 64; a: Expr }                // byte swap of low bits, zero extended
  | { k: 'load'; size: 1 | 2 | 4 | 8; addr: Expr }
  | { k: 'cmp'; op: CmpOp; a: Expr; b: Expr }                  // 1 or 0 ('set': (a & b) != 0)
  | { k: 'lnot'; a: Expr }                                     // logical not of a boolean
  | { k: 'land'; a: Expr; b: Expr } | { k: 'lor'; a: Expr; b: Expr } // short-circuit booleans
  | { k: 'sel'; c: Expr; a: Expr; b: Expr }                    // c ? a : b
  | { k: 'call'; t: CallTarget; args: Expr[] }
  | { k: 'fn'; name: Intrinsic; args: Expr[] };              // pure, total helper function (see INTRINSICS)

export type CallTarget =
  | { k: 'fn'; pc: number }
  | { k: 'sys'; name: string; hash: number }
  | { k: 'ind'; e: Expr };

export type Stmt =
  | { k: 'set'; dst: number; e: Expr; pc: number }                 // register/var assignment (dst = reg or var id)
  | { k: 'store'; size: 1 | 2 | 4 | 8; addr: Expr; v: Expr; pc: number }
  | { k: 'call'; dst: number | -1; t: CallTarget; args: Expr[]; pc: number; extra?: Expr[] }       // extra: implicit register inputs (r0/r6-r9)
  | { k: 'eval'; e: Expr; pc: number }                             // evaluated for side effect/trap only
  | { k: 'stores'; size: 1 | 2 | 4 | 8; addr: Expr; vals: Expr[]; pc: number } // vals[i] -> addr + i*size, in order
  | { k: 'copy'; dst: Expr; src: Expr; n: number; pc: number; rev?: boolean } // n/8 8-byte word copies, ascending (rev: descending)
  | { k: 'trap'; msg: string; pc: number };                        // invalid instruction / unreachable

export type Term =
  | { k: 'jmp'; to: number }
  | { k: 'br'; c: Expr; t: number; f: number }
  | { k: 'ret'; e: Expr | null }
  | { k: 'trap'; msg: string }                                     // program aborts
  | { k: 'tail'; e: null };                                        // falls into next function (malformed)

export const C = (v: bigint | number): Expr => ({ k: 'const', v: BigInt.asUintN(64, BigInt(v)) });
export const R = (r: number): Expr => ({ k: 'reg', r });
export const B = (op: BinOp, a: Expr, b: Expr): Expr => ({ k: 'bin', op, a, b });
export const X = (signed: boolean, bits: 8 | 16 | 32, a: Expr): Expr => ({ k: 'ext', signed, bits, a });
export const CMP = (op: CmpOp, a: Expr, b: Expr): Expr => ({ k: 'cmp', op, a, b });

export const M64 = (1n << 64n) - 1n;
export const u64 = (v: bigint) => BigInt.asUintN(64, v);
export const i64 = (v: bigint) => BigInt.asIntN(64, v);

/** Reference semantics for every operator (shared by simplifier constant folding and tests). */
export function evalBin(op: BinOp, a: bigint, b: bigint): bigint {
  switch (op) {
    case 'add': return u64(a + b);
    case 'sub': return u64(a - b);
    case 'mul': return u64(a * b);
    case 'udiv': if (b === 0n) throw new Trap('division by zero'); return a / b;
    case 'urem': if (b === 0n) throw new Trap('division by zero'); return a % b;
    case 'sdiv': {
      if (b === 0n) throw new Trap('division by zero');
      if (i64(a) === -(1n << 63n) && i64(b) === -1n) throw new Trap('division overflow');
      return u64(i64(a) / i64(b));
    }
    case 'srem': {
      if (b === 0n) throw new Trap('division by zero');
      if (i64(a) === -(1n << 63n) && i64(b) === -1n) throw new Trap('division overflow');
      return u64(i64(a) % i64(b));
    }
    case 'sdiv32': case 'srem32': {
      const x = BigInt.asIntN(32, a), y = BigInt.asIntN(32, b);
      if (y === 0n) throw new Trap('division by zero');
      if (x === -(1n << 31n) && y === -1n) throw new Trap('division overflow');
      return BigInt.asUintN(32, op === 'sdiv32' ? x / y : x % y);
    }
    case 'and': return a & b;
    case 'or': return a | b;
    case 'xor': return a ^ b;
    case 'shl': return u64(a << (b & 63n));
    case 'lshr': return a >> (b & 63n);
    case 'ashr': return u64(i64(a) >> (b & 63n));
    case 'uhmul': return (a * b) >> 64n;
    case 'shmul': return u64((i64(a) * i64(b)) >> 64n);
  }
}

export function evalCmp(op: CmpOp, a: bigint, b: bigint): boolean {
  switch (op) {
    case 'eq': return a === b;
    case 'ne': return a !== b;
    case 'ugt': return a > b;
    case 'uge': return a >= b;
    case 'ult': return a < b;
    case 'ule': return a <= b;
    case 'sgt': return i64(a) > i64(b);
    case 'sge': return i64(a) >= i64(b);
    case 'slt': return i64(a) < i64(b);
    case 'sle': return i64(a) <= i64(b);
    case 'set': return (a & b) !== 0n;
  }
}

export function evalExt(signed: boolean, bits: number, a: bigint): bigint {
  return signed ? u64(BigInt.asIntN(bits, a)) : BigInt.asUintN(bits, a);
}

export function evalBswap(bits: number, a: bigint): bigint {
  let v = BigInt.asUintN(bits, a), r = 0n;
  for (let i = 0; i < bits / 8; i++) { r = (r << 8n) | (v & 0xffn); v >>= 8n; }
  return r;
}

export class Trap extends Error {}

/**
 * Pure, total helper functions the output language provides (printed as `name(args)`).
 * They are introduced only by exact idiom rewrites (src/idioms.ts); the definitions here are
 * the reference semantics (also implemented by test/evaluate.ts and documented in the prelude).
 */
export const INTRINSICS = {
  popcount: (a: bigint[]) => { let x = a[0], n = 0n; while (x) { n += x & 1n; x >>= 1n; } return n; },
  clz: (a: bigint[]) => BigInt(64 - bitLength(a[0])),
  ctz: (a: bigint[]) => { if (a[0] === 0n) return 64n; let x = a[0], n = 0n; while (!(x & 1n)) { n++; x >>= 1n; } return n; },
  rotl: (a: bigint[]) => { const n = a[1] & 63n; return u64((a[0] << n) | (a[0] >> ((64n - n) & 63n))); },
  min: (a: bigint[]) => (a[0] < a[1] ? a[0] : a[1]),
  max: (a: bigint[]) => (a[0] > a[1] ? a[0] : a[1]),
  smin: (a: bigint[]) => (i64(a[0]) < i64(a[1]) ? a[0] : a[1]),
  smax: (a: bigint[]) => (i64(a[0]) > i64(a[1]) ? a[0] : a[1]),
  sat_sub: (a: bigint[]) => (a[0] >= a[1] ? a[0] - a[1] : 0n),
} satisfies Record<string, (a: bigint[]) => bigint>;
/**
 * Helpers that read memory (they may fault like the loads they stand for); both compare ascending
 * 8-byte words, first word first, and stop at the first difference:
 *   memeq(p, q, n)        the n bytes at p equal the n bytes at q
 *   keyeq(p, c0, …, c3)   the 32 bytes at p equal the key whose little-endian words are c0..c3
 *                         (printed as keyeq(p, "<base58>"))
 */
export type MemIntrinsic = 'memeq' | 'keyeq';
/**
 * Statement helpers with effects, introduced only on the final structured body (src/stmtidioms.ts):
 *   rc_inc(p[, x])   x = ld64(p) (unless given); st64(p, x + 1); if (x == u64::MAX) abort()
 */
export type EffIntrinsic = 'rc_inc';
export type Intrinsic = keyof typeof INTRINSICS | MemIntrinsic | EffIntrinsic;
export const isMemIntrinsic = (n: Intrinsic): n is MemIntrinsic => n === 'memeq' || n === 'keyeq';
const bitLength = (v: bigint) => (v === 0n ? 0 : v.toString(2).length);

export const NEG_CMP: Record<CmpOp, CmpOp | null> = {
  eq: 'ne', ne: 'eq', ugt: 'ule', uge: 'ult', ult: 'uge', ule: 'ugt',
  sgt: 'sle', sge: 'slt', slt: 'sge', sle: 'sgt', set: null,
};
export const SWAP_CMP: Record<CmpOp, CmpOp> = {
  eq: 'eq', ne: 'ne', ugt: 'ult', uge: 'ule', ult: 'ugt', ule: 'uge',
  sgt: 'slt', sge: 'sle', slt: 'sgt', sle: 'sge', set: 'set',
};

// ---- generic traversal helpers ----
export function mapExpr(e: Expr, f: (e: Expr) => Expr): Expr {
  let n: Expr;
  switch (e.k) {
    case 'bin': n = { ...e, a: mapExpr(e.a, f), b: mapExpr(e.b, f) }; break;
    case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': n = { ...e, a: mapExpr(e.a, f) } as Expr; break;
    case 'load': n = { ...e, addr: mapExpr(e.addr, f) }; break;
    case 'cmp': case 'land': case 'lor': n = { ...e, a: mapExpr(e.a, f), b: mapExpr(e.b, f) } as Expr; break;
    case 'sel': n = { ...e, c: mapExpr(e.c, f), a: mapExpr(e.a, f), b: mapExpr(e.b, f) }; break;
    case 'call': n = { ...e, t: e.t.k === 'ind' ? { k: 'ind', e: mapExpr(e.t.e, f) } : e.t, args: e.args.map(a => mapExpr(a, f)) }; break;
    case 'fn': n = { ...e, args: e.args.map(a => mapExpr(a, f)) }; break;
    default: n = e;
  }
  return f(n);
}

export function walkExpr(e: Expr, f: (e: Expr) => void): void {
  f(e);
  switch (e.k) {
    case 'bin': case 'cmp': case 'land': case 'lor': walkExpr(e.a, f); walkExpr(e.b, f); break;
    case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': walkExpr(e.a, f); break;
    case 'load': walkExpr(e.addr, f); break;
    case 'sel': walkExpr(e.c, f); walkExpr(e.a, f); walkExpr(e.b, f); break;
    case 'call': if (e.t.k === 'ind') walkExpr(e.t.e, f); e.args.forEach(a => walkExpr(a, f)); break;
    case 'fn': e.args.forEach(a => walkExpr(a, f)); break;
  }
}

export function exprSize(e: Expr): number { let n = 0; walkExpr(e, () => n++); return n; }

export function hasSideEffectsOrMem(e: Expr): { load: boolean; call: boolean; trap: boolean } {
  const r = { load: false, call: false, trap: false };
  walkExpr(e, x => {
    if (x.k === 'load') { r.load = true; r.trap = true; }
    else if (x.k === 'call') r.call = true;
    else if (x.k === 'fn' && isMemIntrinsic(x.name)) { r.load = true; r.trap = true; }
    else if (x.k === 'fn' && x.name === 'rc_inc') { r.load = true; r.trap = true; r.call = true; }
    else if (x.k === 'bin' && isDivOp(x.op) && !safeDivisor(x.op, x.b)) r.trap = true;
  });
  return r;
}

export function exprEq(a: Expr, b: Expr): boolean {
  if (a.k !== b.k) return false;
  switch (a.k) {
    case 'const': return a.v === (b as typeof a).v;
    case 'var': return a.id === (b as typeof a).id;
    case 'reg': return a.r === (b as typeof a).r;
    case 'bin': { const c = b as typeof a; return a.op === c.op && exprEq(a.a, c.a) && exprEq(a.b, c.b); }
    case 'cmp': { const c = b as typeof a; return a.op === c.op && exprEq(a.a, c.a) && exprEq(a.b, c.b); }
    case 'land': case 'lor': { const c = b as typeof a; return exprEq(a.a, c.a) && exprEq(a.b, c.b); }
    case 'neg': case 'not': case 'lnot': return exprEq(a.a, (b as typeof a).a);
    case 'ext': { const c = b as typeof a; return a.signed === c.signed && a.bits === c.bits && exprEq(a.a, c.a); }
    case 'bswap': { const c = b as typeof a; return a.bits === c.bits && exprEq(a.a, c.a); }
    case 'load': { const c = b as typeof a; return a.size === c.size && exprEq(a.addr, c.addr); }
    case 'sel': { const c = b as typeof a; return exprEq(a.c, c.c) && exprEq(a.a, c.a) && exprEq(a.b, c.b); }
    case 'call': return false;
    case 'fn': { const c = b as typeof a; return a.name === c.name && a.args.length === c.args.length && a.args.every((x, i) => exprEq(x, c.args[i])); }
    case 'undef': return true;
  }
}

/** A constant divisor that can never trap (32-bit ops divide by the low 32 bits; signed ops trap on MIN / -1). */
function safeDivisor(op: BinOp, b: Expr): boolean {
  if (b.k !== 'const') return false;
  if (op === 'sdiv32' || op === 'srem32') return BigInt.asUintN(32, b.v) !== 0n && BigInt.asIntN(32, b.v) !== -1n;
  return b.v !== 0n && !(op[0] === 's' && b.v === M64);
}

export const isDivOp = (op: BinOp) => op === 'udiv' || op === 'urem' || op === 'sdiv' || op === 'srem' || op === 'sdiv32' || op === 'srem32';

