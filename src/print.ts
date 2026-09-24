// TypeScript printer. Output semantics (documented in the emitted header):
//  - every value is a u64; + - * << wrap modulo 2^64; / % are unsigned; >> is a logical shift
//  - `x as u8|u16|u32` truncates; `x as i8|i16|i32` truncates then sign-extends; `x as i64` = signed view
//  - relational operators compare mathematically (so `(a as i64) < (b as i64)` is a signed compare)
//  - ldN(addr) / stN(addr, v) read/write N-bit little-endian memory (may fault)
import type { Expr, Stmt, CallTarget } from './ir.ts';
import type { Node } from './structure.ts';
import type { VarFunc } from './dataflow.ts';
import { maxBits } from './simplify.ts';

export interface PrintCtx {
  fnName: (pc: number) => string;
  fnAddrName: (addr: bigint) => string | undefined;   // function pointer constants
  sysName: (name: string) => string;
  constComment: (v: bigint, role: 'value' | 'addr' | 'ret') => string | undefined; // well-known key / error code
  strAt?: (ptr: bigint, len: bigint) => string | undefined; // exact rodata string for (ptr, len) argument pairs
  dropUndefArgs?: boolean; // omit trailing `undef` call arguments (readability mode)
  varName: (id: number) => string;
  exprHook?: (e: Expr, pr: (e: Expr, prec: number) => string) => string | undefined;
}

const P = { assign: 2, cond: 3, lor: 4, land: 5, bor: 6, bxor: 7, band: 8, eq: 9, rel: 10, shift: 11, add: 12, mul: 13, unary: 15, as: 3, call: 20, prim: 21 };

export function fmtConst(v: bigint): string {
  const s = BigInt.asIntN(64, v);
  if (s < 0n && s > -0x10000n) return `-${fmtPos(-s)}`;
  return fmtPos(v);
}
function fmtPos(v: bigint): string { return v < 10n ? v.toString() : '0x' + v.toString(16); }

const BIN: Record<string, [string, number]> = {
  add: ['+', P.add], sub: ['-', P.add], mul: ['*', P.mul], udiv: ['/', P.mul], urem: ['%', P.mul],
  and: ['&', P.band], or: ['|', P.bor], xor: ['^', P.bxor], shl: ['<<', P.shift], lshr: ['>>', P.shift],
};
const CMPS: Record<string, string> = { eq: '==', ne: '!=', ugt: '>', uge: '>=', ult: '<', ule: '<=', sgt: '>', sge: '>=', slt: '<', sle: '<=' };

/** Join call arguments, parenthesizing ones that TypeScript could misparse as generic type arguments. */
export function joinArgs(a: string[]): string {
  if (a.length < 2 || !a.some(x => x.includes('<')) || !a.some(x => x.includes('>'))) return a.join(', ');
  return a.map(x => (/[<>]/.test(x) && !/^\w+\(.*\)$/.test(x) ? `(${x})` : x)).join(', ');
}

export class Printer {
  ctx: PrintCtx;
  addrDepth = 0;
  retTop: Expr | null = null;
  constructor(ctx: PrintCtx) { this.ctx = ctx; }

  /** true if printing `e` yields a signed (possibly negative) intermediate value */
  static signedTop(e: Expr) { return (e.k === 'ext' && e.signed); }

  shiftAmt(b: Expr): Expr {
    if (b.k === 'const') return { k: 'const', v: b.v & 63n };
    if (maxBits(b) <= 6) return b;
    return { k: 'bin', op: 'and', a: b, b: { k: 'const', v: 63n } };
  }

  expr(e: Expr, prec = 0): string {
    const s = this.expr0(e);
    return s.prec < prec ? `(${s.t})` : s.t;
  }

  private expr0(e: Expr): { t: string; prec: number } {
    const hook = this.ctx.exprHook?.(e, (x, p) => this.expr(x, p));
    if (hook !== undefined) return { t: hook, prec: P.call };
    switch (e.k) {
      case 'const': {
        const fn = this.ctx.fnAddrName(e.v);
        if (fn) return { t: fn, prec: P.prim };
        const t = fmtConst(e.v);
        const cm = this.ctx.constComment(e.v, this.addrDepth ? 'addr' : this.retTop === e ? 'ret' : 'value');
        return { t: cm ? `${t} /* ${cm} */` : t, prec: t.startsWith('-') ? P.unary : P.prim };
      }
      case 'var': return { t: this.ctx.varName(e.id), prec: P.prim };
      case 'reg': return { t: `r${e.r}`, prec: P.prim };
      case 'undef': return { t: 'undef', prec: P.prim };
      case 'bin': {
        const op = e.op;
        if (op === 'add' && e.b.k === 'const' && BigInt.asIntN(64, e.b.v) < 0n && BigInt.asIntN(64, e.b.v) > -0x1_0000_0000n && !this.ctx.fnAddrName(e.b.v)) {
          return { t: `${this.u(e.a, P.add)} - ${fmtPos(-BigInt.asIntN(64, e.b.v))}`, prec: P.add };
        }
        if (op === 'shl' || op === 'lshr') {
          const [o, p] = BIN[op];
          return { t: `${this.u(e.a, p, false)} ${o} ${this.u(this.shiftAmt(e.b), p + 1, false)}`, prec: p };
        }
        if (op === 'ashr') return { t: `sar(${joinArgs([this.u(e.a, 0), this.u(this.shiftAmt(e.b), 0)])})`, prec: P.call };
        const fnOps: Record<string, string> = { sdiv: 'sdiv', srem: 'srem', sdiv32: 'sdiv32', srem32: 'srem32', uhmul: 'mulhu', shmul: 'mulhs' };
        if (fnOps[op]) return { t: `${fnOps[op]}(${joinArgs([this.u(e.a, 0), this.u(e.b, 0)])})`, prec: P.call };
        const [o, p] = BIN[op];
        const sOk = op !== 'udiv' && op !== 'urem';
        // left-assoc: right operand needs strictly higher precedence
        return { t: `${this.u(e.a, p, sOk)} ${o} ${this.u(e.b, p + 1, sOk)}`, prec: p };
      }
      case 'neg': return { t: `-${this.u(e.a, P.unary + 1)}`, prec: P.unary };
      case 'not': return { t: `~${this.u(e.a, P.unary + 1)}`, prec: P.unary };
      case 'ext': return { t: `${this.expr(e.a, P.unary)} as ${e.signed ? 'i' : 'u'}${e.bits}`, prec: P.as };
      case 'bswap': return { t: `bswap${e.bits}(${this.u(e.a, 0)})`, prec: P.call };
      case 'load': { this.addrDepth++; const a = this.u(e.addr, 0); this.addrDepth--; return { t: `ld${e.size * 8}(${a})`, prec: P.call }; }
      case 'cmp': {
        if (e.op === 'set') return { t: `(${this.u(e.a, P.band)} & ${this.u(e.b, P.band + 1)}) != 0`, prec: P.eq };
        const signed = e.op[0] === 's';
        const o = CMPS[e.op];
        const p = o === '==' || o === '!=' ? P.eq : P.rel;
        const side = (x: Expr, pp: number) => signed ? this.signedOperand(x) : this.u(x, pp, p === P.eq);
        return { t: `${side(e.a, p)} ${o} ${side(e.b, p + 1)}`, prec: p };
      }
      case 'lnot': return { t: `!${this.expr(e.a, P.unary)}`, prec: P.unary };
      case 'land': return { t: `${this.expr(e.a, P.land)} && ${this.expr(e.b, P.land + 1)}`, prec: P.land };
      case 'lor': return { t: `${this.expr(e.a, P.lor)} || ${this.expr(e.b, P.lor + 1)}`, prec: P.lor };
      case 'sel': return { t: `${this.expr(e.c, P.cond + 1)} ? ${this.u(e.a, P.assign)} : ${this.u(e.b, P.assign)}`, prec: P.cond };
      case 'call': return { t: this.callText(e.t, e.args), prec: P.call };
    }
  }

  /** Print an operand in an unsigned context: signed-typed intermediates are re-normalized. */
  u(e: Expr, prec: number, signedOk = true): string {
    if (!signedOk && Printer.signedTop(e)) return `(${this.expr(e, P.unary)} as u64)`;
    if (!signedOk && e.k === 'const' && BigInt.asIntN(64, e.v) < 0n && !this.ctx.fnAddrName(e.v)) return fmtPos(e.v);
    return this.expr(e, prec);
  }

  signedOperand(e: Expr): string {
    if (e.k === 'const') { const s = BigInt.asIntN(64, e.v); return s < 0n ? `-${fmtPos(-s)}` : fmtPos(s); }
    if (e.k === 'ext' && e.signed) return this.expr(e, P.rel + 1);
    return `(${this.expr(e, P.unary)} as i64)`;
  }

  callText(t: CallTarget, args: Expr[]): string {
    if (this.ctx.dropUndefArgs) { let n = args.length; while (n > 0 && args[n - 1].k === 'undef') n--; args = args.slice(0, n); }
    const a = args.map(x => this.u(x, P.assign));
    // (pointer, length) pairs into rodata render as the string they denote
    if (this.ctx.strAt) for (let i = 0; i + 1 < args.length; i++) {
      const x = args[i], y = args[i + 1];
      if (x.k === 'const' && y.k === 'const') { const str = this.ctx.strAt(x.v, y.v); if (str !== undefined) a[i] = JSON.stringify(str); }
    }
    if (t.k === 'fn') return `${this.ctx.fnName(t.pc)}(${joinArgs(a)})`;
    if (t.k === 'sys') return `${this.ctx.sysName(t.name)}(${joinArgs(a)})`;
    return `callx(${joinArgs([this.u(t.e, P.assign), ...a])})`;
  }
}

// ---------------- statements ----------------

export interface Decl { kind: 'let' | 'const'; hoist: boolean }

export function printBody(pr: Printer, f: VarFunc, body: Node[], indent: string, decls: Map<Stmt, 'let' | 'const'>, hoisted: number[]): string[] {
  const out: string[] = [];
  const I = (d: number) => indent + '\t'.repeat(d);
  if (hoisted.length) out.push(`${I(0)}let ${hoisted.map(v => pr.ctx.varName(v)).join(', ')}: u64`);
  const stmt = (s: Stmt, d: number) => {
    switch (s.k) {
      case 'set': {
        const kw = decls.get(s);
        out.push(`${I(d)}${kw ? kw + ' ' : ''}${pr.ctx.varName(s.dst)} = ${pr.u(s.e, P.assign)}`);
        break;
      }
      case 'store': { pr.addrDepth++; const a = pr.u(s.addr, P.assign); pr.addrDepth--; out.push(`${I(d)}st${s.size * 8}(${joinArgs([a, pr.u(s.v, P.assign)])})`); break; }
      case 'call': {
        const kw = decls.get(s);
        const txt = pr.callText(s.t, [...s.args, ...(s.extra ?? [])]);
        out.push(`${I(d)}${s.dst >= 0 ? `${kw ? kw + ' ' : ''}${pr.ctx.varName(s.dst)} = ` : ''}${txt}`);
        break;
      }
      case 'eval': out.push(`${I(d)}void ${pr.u(s.e, P.unary)}`); break;
      case 'stores': { pr.addrDepth++; const a = pr.u(s.addr, P.assign); pr.addrDepth--; out.push(`${I(d)}st${s.size * 8}(${joinArgs([a, ...s.vals.map(v => pr.u(v, P.assign))])})`); break; }
      case 'copy': out.push(`${I(d)}copy(${joinArgs([pr.u(s.dst, P.assign), pr.u(s.src, P.assign), fmtConst(BigInt(s.n))])})`); break;
      case 'trap': out.push(`${I(d)}trap(${JSON.stringify(s.msg)})`); break;
    }
  };
  const rec = (ns: Node[], d: number) => {
    for (const n of ns) {
      switch (n.k) {
        case 'stmt': stmt(n.s, d); break;
        case 'if': {
          out.push(`${I(d)}if (${pr.expr(n.c, 0)}) {`);
          rec(n.then, d + 1);
          let el = n.else;
          while (el.length === 1 && el[0].k === 'if') {
            const e = el[0];
            out.push(`${I(d)}} else if (${pr.expr(e.c, 0)}) {`);
            rec(e.then, d + 1);
            el = e.else;
          }
          if (el.length) { out.push(`${I(d)}} else {`); rec(el, d + 1); }
          out.push(`${I(d)}}`);
          break;
        }
        case 'block':
          out.push(`${I(d)}${n.label}: {`);
          rec(n.body, d + 1);
          out.push(`${I(d)}}`);
          break;
        case 'loop': {
          const lbl = n.label ? `${n.label}: ` : '';
          if (n.form === 'for') out.push(`${I(d)}${lbl}while (true) {`);
          else if (n.form === 'while') out.push(`${I(d)}${lbl}while (${pr.expr(n.c!, 0)}) {`);
          else out.push(`${I(d)}${lbl}do {`);
          rec(n.body, d + 1);
          out.push(n.form === 'do' ? `${I(d)}} while (${pr.expr(n.c!, 0)})` : `${I(d)}}`);
          break;
        }
        case 'break': out.push(`${I(d)}break${n.label ? ' ' + n.label : ''}`); break;
        case 'continue': out.push(`${I(d)}continue${n.label ? ' ' + n.label : ''}`); break;
        case 'return': pr.retTop = n.e; out.push(`${I(d)}return${n.e ? ' ' + pr.u(n.e, P.assign) : ''}`); pr.retTop = null; break;
        case 'trap': if (n.msg) out.push(`${I(d)}trap(${JSON.stringify(n.msg)})`); break;
        case 'setstate': out.push(`${I(d)}${pr.ctx.varName(n.v)} = ${n.val}`); break;
        case 'switch':
          out.push(`${I(d)}switch (${pr.ctx.varName(n.v)}) {`);
          for (const c of n.cases) {
            out.push(`${I(d + 1)}${c.vals.map(v => `case ${v}:`).join(' ')} {`);
            rec(c.body, d + 2);
            out.push(`${I(d + 1)}}`);
          }
          out.push(`${I(d)}}`);
          break;
      }
    }
  };
  rec(body, 0);
  return out;
}
