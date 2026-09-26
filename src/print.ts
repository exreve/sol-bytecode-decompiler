// TypeScript printer. Output semantics (documented in the emitted header):
//  - every value is a u64; + - * << wrap modulo 2^64; / % are unsigned; >> is a logical shift
//  - `x as u8|u16|u32` truncates; `x as i8|i16|i32` truncates then sign-extends; `x as i64` = signed view
//  - relational operators compare mathematically (so `(a as i64) < (b as i64)` is a signed compare)
//  - ldN(addr) / stN(addr, v) read/write N-bit little-endian memory (may fault)
import { type Expr, type Stmt, type CallTarget, type CmpOp, walkExpr } from './ir.ts';
import type { Node } from './structure.ts';
import type { VarFunc } from './dataflow.ts';
import { maxBits } from './simplify.ts';
import { b58 } from './semantics.ts';
import type { Views } from './views.ts';

/** base58 of the 32-byte key whose little-endian 8-byte words are the given constants */
export function keyB58(words: Expr[]): string {
  const b = new Uint8Array(32);
  words.forEach((w, i) => { const v = (w as { v: bigint }).v; for (let j = 0; j < 8; j++) b[i * 8 + j] = Number((v >> BigInt(8 * j)) & 0xffn); });
  return b58(b);
}

export interface PrintCtx {
  fnName: (pc: number) => string;
  fnAddrName: (addr: bigint) => string | undefined;   // function pointer constants
  sysName: (name: string) => string;
  constComment: (v: bigint, role: 'value' | 'addr' | 'ret') => string | undefined; // well-known key / error code
  strAt?: (ptr: bigint, len: bigint) => string | undefined; // exact rodata string for (ptr, len) argument pairs
  strNote?: (ptr: bigint, len: bigint) => string | undefined; // rodata text for (ptr, len) pairs not printable as a literal (shown in a comment)
  keyAt?: (ptr: bigint) => string | undefined; // base58 of a 32-byte rodata value (public key) at ptr
  dropUndefArgs?: boolean; // omit trailing `undef` call arguments (readability mode)
  frameRef?: (off: bigint) => string | undefined; // name for fp + off (stack object), e.g. `s30 + 8`
  frameTyped?: (off: bigint) => { t: string; type: string; rel: number } | undefined; // typed stack object holding fp + off: its name, view type, offset in it
  varName: (id: number) => string;
  exprHook?: (e: Expr, pr: (e: Expr, prec: number) => string) => string | undefined;
  nodeNote?: (n: Node) => string | undefined; // comment line printed before a statement / return
  nodeLines?: (n: Node, start: number, end: number) => void; // lines [start, end) of printBody's output a node printed as (its note included)
  storeField?: (size: number, addr: Expr) => string | undefined; // field name of a store's destination
  stmtTail?: (s: Stmt, prev?: Stmt) => string | undefined; // comment at the end of a statement's line (prev: statement printed just before, same list)
  views?: Views;                                  // typed views (src/views.ts): x.field for loads/stores/addresses through typed variables
  varType?: (id: number) => string | undefined;   // view type of a variable
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
  shlCall = false; // render `x << n` as shl(x, n) (fallback against TS generic-syntax ambiguity)
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

  /** A typed object: a variable with a view type, or a field of one that is itself an object (ref / embedded). */
  typedObj(e: Expr): { t: string; type: string } | undefined {
    const V = this.ctx.views;
    if (!V) return undefined;
    if (e.k === 'var') { const type = this.ctx.varType?.(e.id); return type ? { t: this.ctx.varName(e.id), type } : undefined; }
    const fo = this.frameObj(e);
    if (fo) return fo.rel ? undefined : { t: fo.t, type: fo.type };
    const f = e.k === 'load' && e.size === 8 ? this.viewField(e.addr) : e.k === 'bin' && e.op === 'add' && e.b.k === 'const' ? this.viewField(e) : undefined;
    if (!f || f.rest) return undefined;
    if (e.k === 'load' && f.last.k === 'ref') return { t: f.t, type: f.last.to };
    if (e.k === 'bin' && f.last.k === 'embed') return { t: f.t, type: f.last.type };
    return undefined;
  }

  /** `obj.path` for an address expression obj + c (c inside a declared field), with the byte offset left over. */
  /** A frame address fp + c inside a typed stack object. */
  frameObj(e: Expr): { t: string; type: string; rel: number } | undefined {
    if (!this.ctx.frameTyped || e.k !== 'bin' || e.op !== 'add' || e.a.k !== 'var' || e.b.k !== 'const' || this.ctx.varName(e.a.id) !== 'fp') return undefined;
    return this.ctx.frameTyped(BigInt.asIntN(64, e.b.v));
  }

  viewField(addr: Expr): { t: string; rest: number; last: import('./views.ts').FieldType } | undefined {
    let b: Expr = addr, off = 0n;
    const fo = this.frameObj(addr);
    if (fo) { b = { k: 'var', id: -1 }; off = BigInt(fo.rel); }
    else if (addr.k === 'bin' && addr.op === 'add' && addr.b.k === 'const') { b = addr.a; off = BigInt.asIntN(64, addr.b.v); }
    if (off < 0n || off > 0x10000n) return undefined;
    const o = fo ? { t: fo.t, type: fo.type } : this.typedObj(b);
    if (!o) return undefined;
    // objects of a sized view in a row (e.g. a slice of AccountInfo): x[k]
    const size = this.ctx.views!.map.get(o.type)?.size;
    let t = o.t, rel = Number(off);
    if (size && rel >= size) { t = `${o.t}[${Math.floor(rel / size)}]`; rel %= size; }
    const r = this.ctx.views!.resolve(o.type, rel);
    if (!r) return undefined;
    return { t: `${t}.${r.path.join('.')}`, rest: r.rest, last: r.last };
  }

  /** Typed-view rendering of a load or an address, if any. */
  viewExpr(e: Expr): { t: string; prec: number } | undefined {
    if (!this.ctx.views) return undefined;
    if (e.k === 'load') {
      const f = this.viewField(e.addr);
      if (!f) return undefined;
      if (!f.rest && ((f.last.k === 'scalar' && f.last.size === e.size) || (f.last.k === 'ref' && e.size === 8))) return { t: f.t, prec: P.prim };
      if (f.last.k === 'embed') return { t: `ld${e.size * 8}(${f.rest ? `${f.t} + ${fmtConst(BigInt(f.rest))}` : f.t})`, prec: P.call };
      return undefined;
    }
    if (e.k === 'bin' && e.op === 'add' && e.b.k === 'const') {
      const f = this.viewField(e);
      if (!f || f.last.k !== 'embed') return undefined;
      return f.rest ? { t: `${f.t} + ${fmtConst(BigInt(f.rest))}`, prec: P.add } : { t: f.t, prec: P.prim };
    }
    return undefined;
  }

  /** Store destination as a view field (`x.is_writable`), if the store writes exactly that scalar field. */
  viewLvalue(size: number, addr: Expr): string | undefined {
    const f = this.viewField(addr);
    return f && !f.rest && f.last.k === 'scalar' && f.last.size === size ? f.t : undefined;
  }

  expr0(e: Expr): { t: string; prec: number } {
    const view = this.viewExpr(e);
    if (view) return view;
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
        if (op === 'add' && e.a.k === 'var' && e.b.k === 'const' && this.ctx.frameRef && this.ctx.varName(e.a.id) === 'fp') {
          const r = this.ctx.frameRef(BigInt.asIntN(64, e.b.v));
          if (r) return { t: r, prec: r.includes(' ') ? P.add : P.prim };
        }
        if (op === 'add' && e.b.k === 'const' && BigInt.asIntN(64, e.b.v) < 0n && BigInt.asIntN(64, e.b.v) > -0x1_0000_0000n && !this.ctx.fnAddrName(e.b.v)) {
          return { t: `${this.u(e.a, P.add)} - ${fmtPos(-BigInt.asIntN(64, e.b.v))}`, prec: P.add };
        }
        if (op === 'shl' && this.shlCall) return { t: `shl(${joinArgs([this.u(e.a, 0, false), this.u(this.shiftAmt(e.b), 0, false)])})`, prec: P.call };
        if (op === 'shl' || op === 'lshr') {
          const [o, p] = BIN[op];
          const amt = this.shiftAmt(e.b);
          const l = this.u(e.a, p, false), r = this.u(amt, p + 1, false);
          // `x << (… > (…))` can be misread by TypeScript as a generic call: use the function form
          if (op === 'shl' && /[<>]/.test(r)) return { t: `shl(${this.u(e.a, P.assign, false)}, ${this.u(amt, P.assign, false)})`, prec: P.call };
          return { t: `${l} ${o} ${r}`, prec: p };
        }
        if (op === 'ashr') return { t: `sar(${joinArgs([this.u(e.a, 0), this.u(this.shiftAmt(e.b), 0)])})`, prec: P.call };
        const fnOps: Record<string, string> = { sdiv: 'sdiv', srem: 'srem', sdiv32: 'sdiv32', srem32: 'srem32', uhmul: 'mulhu', shmul: 'mulhs' };
        if (fnOps[op]) return { t: `${fnOps[op]}(${joinArgs([this.u(e.a, 0), this.u(e.b, 0)])})`, prec: P.call };
        const [o, p] = BIN[op];
        const sOk = op !== 'udiv' && op !== 'urem';
        // left-assoc: right operand needs strictly higher precedence. A `<<` operand is parenthesized:
        // in `a << 1 | (b > (c))` TypeScript would read `<1 | (b>` as type arguments of a call
        const opnd = (x: Expr, pp: number) => {
          const t = this.u(x, pp, sOk);
          return x.k === 'bin' && x.op === 'shl' && !wrapped(t) ? `(${t})` : t;
        };
        return { t: `${opnd(e.a, p)} ${o} ${opnd(e.b, p + 1)}`, prec: p };
      }
      case 'neg':
        if (e.a.k === 'const') return this.expr0({ k: 'const', v: BigInt.asUintN(64, -e.a.v) });
        { const t = this.u(e.a, P.unary + 1); return { t: /^[0-9]/.test(t) ? `-(${t})` : `-${t}`, prec: P.unary }; } // `-literal` would denote a signed literal
      case 'not': return { t: `~${this.u(e.a, P.unary + 1)}`, prec: P.unary };
      case 'ext': return { t: `${this.expr(e.a, P.unary)} as ${e.signed ? 'i' : 'u'}${e.bits}`, prec: P.as };
      case 'bswap': return { t: `bswap${e.bits}(${this.u(e.a, 0)})`, prec: P.call };
      case 'load': { this.addrDepth++; const a = this.u(e.addr, 0); this.addrDepth--; return { t: `ld${e.size * 8}(${a})`, prec: P.call }; }
      case 'cmp': {
        if (e.op === 'set') return { t: `(${this.u(e.a, P.band)} & ${this.u(e.b, P.band + 1)}) != 0`, prec: P.eq };
        // print `<`/`<=` as `>`/`>=` with swapped operands (TS could read `a < b ... > (c)` as generics);
        // operand order only changes evaluation order, which matters only for calls
        const SW: Record<string, CmpOp> = { ult: 'ugt', ule: 'uge', slt: 'sgt', sle: 'sge' };
        if (SW[e.op]) {
          let hasCall = false;
          walkExpr(e, x => { if (x.k === 'call') hasCall = true; });
          if (!hasCall) e = { k: 'cmp', op: SW[e.op], a: e.b, b: e.a };
        }
        const signed = e.op[0] === 's';
        const o = CMPS[e.op];
        const p = o === '==' || o === '!=' ? P.eq : P.rel;
        // shifts / comparisons as operands of a comparison could be misparsed by TS as generics
        const risky = (x: Expr) => (x.k === 'bin' && (x.op === 'shl' || x.op === 'lshr')) || x.k === 'cmp';
        const side = (x: Expr, pp: number) => {
          const t = signed ? this.signedOperand(x) : this.u(x, pp, p === P.eq);
          return risky(x) && !wrapped(t) ? `(${t})` : t;
        };
        return { t: `${side(e.a, p)} ${o} ${side(e.b, p + 1)}`, prec: p };
      }
      case 'lnot': return { t: `!${this.expr(e.a, P.unary)}`, prec: P.unary };
      case 'land': return { t: `${this.expr(e.a, P.land)} && ${this.expr(e.b, P.land + 1)}`, prec: P.land };
      case 'lor': return { t: `${this.expr(e.a, P.lor)} || ${this.expr(e.b, P.lor + 1)}`, prec: P.lor };
      // arms in unsigned form: a signed literal/intermediate would compare mathematically in `x < (c ? -1 : y)`
      case 'sel': return { t: `${this.expr(e.c, P.cond + 1)} ? ${this.u(e.a, P.assign, false)} : ${this.u(e.b, P.assign, false)}`, prec: P.cond };
      case 'call': return { t: this.callText(e.t, e.args), prec: P.call };
      case 'fn':
        if (e.name === 'keyeq') {
          const nm = this.ctx.constComment((e.args[1] as { v: bigint }).v, 'value');
          return { t: `keyeq(${this.u(e.args[0], P.assign)}, ${JSON.stringify(keyB58(e.args.slice(1)))}${nm && !nm.includes('[') ? ` /* ${nm} */` : ''})`, prec: P.call };
        }
        { const a = e.args.map(x => this.u(x, P.assign)); if (e.name === 'memeq') this.keyArgs(e.args, a); return { t: `${e.name}(${joinArgs(a)})`, prec: P.call }; }
    }
  }

  /** Print an operand in an unsigned context: signed-typed intermediates are re-normalized. */
  u(e: Expr, prec: number, signedOk = true): string {
    if (e.k === 'neg' && e.a.k === 'const') e = { k: 'const', v: BigInt.asUintN(64, -e.a.v) };
    if (!signedOk && Printer.signedTop(e)) return `(${this.expr(e, P.unary)} as u64)`;
    if (!signedOk && e.k === 'const' && BigInt.asIntN(64, e.v) < 0n && !this.ctx.fnAddrName(e.v)) return fmtPos(e.v);
    return this.expr(e, prec);
  }

  signedOperand(e: Expr): string {
    if (e.k === 'const') { const s = BigInt.asIntN(64, e.v); return s < 0n ? `-${fmtPos(-s)}` : fmtPos(s); }
    if (e.k === 'ext' && e.signed) return this.expr(e, P.rel + 1);
    return `(${this.expr(e, P.unary)} as i64)`;
  }

  /** (rodata pointer, 32) argument pairs: show the 32 bytes as a base58 key (unless already named) */
  keyArgs(args: Expr[], a: string[]) {
    if (!this.ctx.keyAt) return;
    for (let i = 0; i < args.length; i++) {
      const x = args[i];
      if (x.k !== 'const' || a[i].includes('/*') || a[i].startsWith('"')) continue;
      const n = args[i + 1] ?? args[i + 2], m = args[i + 2];
      if (!(n?.k === 'const' && n.v === 32n) && !(m?.k === 'const' && m.v === 32n)) continue;
      const k = this.ctx.keyAt(x.v);
      if (k) a[i] = `${a[i]} /* key ${k} */`;
    }
  }

  callText(t: CallTarget, args: Expr[]): string {
    if (this.ctx.dropUndefArgs) { let n = args.length; while (n > 0 && args[n - 1].k === 'undef') n--; args = args.slice(0, n); }
    const a = args.map(x => this.u(x, P.assign));
    // (pointer, length) pairs into rodata render as the string they denote
    if (this.ctx.strAt) for (let i = 0; i + 1 < args.length; i++) {
      const x = args[i], y = args[i + 1];
      if (x.k === 'const' && y.k === 'const') {
        const str = this.ctx.strAt(x.v, y.v);
        if (str !== undefined) a[i] = JSON.stringify(str);
        else { const n = this.ctx.strNote?.(x.v, y.v); if (n !== undefined && !a[i].includes('/*')) a[i] = `${a[i]} /* ${JSON.stringify(n).replaceAll('*/', '*\\/')} */`; }
      }
    }
    this.keyArgs(args, a);
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
  const vt = (v: number) => pr.ctx.varType?.(v);
  const plain = hoisted.filter(v => !vt(v)), typed = hoisted.filter(v => vt(v));
  if (plain.length) out.push(`${I(0)}let ${plain.map(v => pr.ctx.varName(v)).join(', ')}: u64`);
  for (const v of typed) out.push(`${I(0)}let ${pr.ctx.varName(v)}: ${vt(v)}`);
  const declName = (v: number, kw: string | undefined) => `${kw ? kw + ' ' : ''}${pr.ctx.varName(v)}${kw && vt(v) ? `: ${vt(v)}` : ''}`;
  const stmt = (s: Stmt, d: number) => {
    const n0 = out.length;
    stmt0(s, d);
    // (`.` stops at line ends: testing the new lines one by one is testing their joined text)
    let risky = false;
    for (let i = n0; i < out.length && !risky; i++) risky = out[i].includes('<<') && /<<.*> \(/.test(out[i]);
    if (risky) { out.length = n0; pr.shlCall = true; stmt0(s, d); pr.shlCall = false; }
  };
  const stmt0 = (s: Stmt, d: number) => {
    switch (s.k) {
      case 'set': {
        const kw = decls.get(s);
        out.push(`${I(d)}${declName(s.dst, kw)} = ${pr.u(s.e, P.assign)}`);
        break;
      }
      case 'store': {
        const lv = pr.viewLvalue(s.size, s.addr);
        if (lv) {
          const tail = pr.ctx.stmtTail?.(s, prevStmt);
          out.push(`${I(d)}${lv} = ${pr.u(s.v, P.assign)}${tail ? ` // ${tail}` : ''}`);
          break;
        }
        pr.addrDepth++; let a = pr.u(s.addr, P.assign); pr.addrDepth--;
        const fld = pr.ctx.storeField?.(s.size, s.addr);
        if (fld && !a.includes('/*')) a += ` /* ${fld} */`;
        const tail = pr.ctx.stmtTail?.(s, prevStmt);
        out.push(`${I(d)}st${s.size * 8}(${joinArgs([a, pr.u(s.v, P.assign)])})${tail ? ` // ${tail}` : ''}`);
        break;
      }
      case 'call': {
        const kw = decls.get(s);
        const txt = pr.callText(s.t, [...s.args, ...(s.extra ?? [])]);
        out.push(`${I(d)}${s.dst >= 0 ? `${declName(s.dst, kw)} = ` : ''}${txt}`);
        break;
      }
      case 'eval': out.push(`${I(d)}${s.e.k === 'fn' && (s.e.name === 'rc_inc' || s.e.name === 'rc_dec') ? '' : 'void '}${pr.u(s.e, P.unary)}`); break;
      case 'stores': {
        pr.addrDepth++; const a = pr.u(s.addr, P.assign); pr.addrDepth--;
        // four large constant words: a public key written in place
        const key = pr.ctx.keyAt && s.size === 8 && s.vals.length === 4 && s.vals.every(v => v.k === 'const' && v.v > 1n << 48n) ? ` // key ${keyB58(s.vals)}`
          : pr.ctx.stmtTail?.(s, prevStmt) ? ` // ${pr.ctx.stmtTail(s, prevStmt)}` : '';
        out.push(`${I(d)}st${s.size * 8}(${joinArgs([a, ...s.vals.map(v => pr.u(v, P.assign))])})${key}`);
        break;
      }
      case 'copy': {
        const a = [pr.u(s.dst, P.assign), pr.u(s.src, P.assign), fmtConst(BigInt(s.n))];
        pr.keyArgs([s.dst, s.src, { k: 'const', v: BigInt(s.n) }], a);
        out.push(`${I(d)}copy${s.rev ? 'r' : ''}(${joinArgs(a)})`);
        break;
      }
      case 'trap': out.push(`${I(d)}trap(${JSON.stringify(s.msg)})`); break;
    }
  };
  let prevStmt: Stmt | undefined;
  const rec = (ns: Node[], d: number) => {
    for (const n of ns) {
      const prev = prevStmt;
      prevStmt = undefined;
      const start = out.length;
      const note = pr.ctx.nodeNote?.(n);
      if (note) out.push(`${I(d)}// ${note}`);
      node(n, d, prev);
      pr.ctx.nodeLines?.(n, start, out.length);
    }
  };
  const node = (n: Node, d: number, prev: Stmt | undefined) => {
      switch (n.k) {
        case 'stmt': prevStmt = prev; stmt(n.s, d); prevStmt = n.s; break;
        case 'if': {
          out.push(`${I(d)}if (${pr.expr(n.c, 0)}) {`);
          rec(n.then, d + 1);
          let el = n.else;
          const chain: [Node, number][] = [];
          while (el.length === 1 && el[0].k === 'if') {
            const e = el[0];
            chain.push([e, out.length]);
            out.push(`${I(d)}} else if (${pr.expr(e.c, 0)}) {`);
            rec(e.then, d + 1);
            el = e.else;
          }
          if (el.length) { out.push(`${I(d)}} else {`); rec(el, d + 1); }
          out.push(`${I(d)}}`);
          for (const [e, at] of chain) pr.ctx.nodeLines?.(e, at, out.length);
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
  };
  rec(body, 0);
  return out;
}

/** `t` is one parenthesized group: its first `(` closes at the very end (string literals skipped). */
function wrapped(t: string): boolean {
  if (t[0] !== '(') return false;
  let d = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === '"') { i++; while (i < t.length && t[i] !== '"') i += t[i] === '\\' ? 2 : 1; continue; }
    if (ch === '(') d++;
    else if (ch === ')' && --d === 0) return i === t.length - 1;
  }
  return false;
}
