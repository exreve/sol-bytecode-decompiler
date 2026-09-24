// End-to-end pipeline: ELF -> functions -> IR -> variables -> simplified -> structured -> TypeScript.
import { loadProgram, type Program, fnAddr } from './program.ts';
import { inferSignatures, recoverVars, type VarFunc } from './dataflow.ts';
import { optimizeFunc, stmtExprs } from './simplify.ts';
import { structure, cleanup, type Node } from './structure.ts';
import { Printer, printBody, type PrintCtx } from './print.ts';
import { type Expr, type Stmt, walkExpr } from './ir.ts';
import { Semantics } from './semantics.ts';

export interface Options { sugar?: boolean; only?: Set<number>; comments?: boolean }

export interface FuncOut { pc: number; name: string; text: string; irreducible: boolean; f: VarFunc; body: Node[]; names: string[] }
export interface Result { program: Program; funcs: FuncOut[]; header: string; text: string }

const RESERVED = new Set(['do', 'if', 'in', 'as', 'of', 'fp', 'let', 'var', 'for', 'new', 'try', 'int', 'is', 'ld', 'st']);

function* shortNames(): Generator<string> {
  const al = 'abcdefghijklmnopqrstuvwxyz';
  for (const c of 'fghijklmnopqrstuvwxyz') yield c;
  for (const c1 of al) for (const c2 of al) { const n = c1 + c2; if (!RESERVED.has(n)) yield n; }
  for (let i = 0; ; i++) yield `v${i}`;
}

export function decompile(bytes: Uint8Array, opts: Options = {}): Result {
  const p = loadProgram(bytes);
  inferSignatures(p);
  const sem = new Semantics(p);
  const funcs: FuncOut[] = [];
  const fnName = (pc: number) => p.funcs.get(pc)?.name ?? `fn_${(p.elf.text.addr + pc * 8).toString(16)}`;
  const fnByAddr = new Map<bigint, string>();
  for (const f of p.funcs.values()) fnByAddr.set(fnAddr(p, f.pc), f.name);

  for (const f0 of p.funcs.values()) {
    if (opts.only && !opts.only.has(f0.pc)) continue;
    const f = recoverVars(p, f0);
    optimizeFunc(f);
    const st = structure(f);
    const body = cleanup(st, f.returns);
    // ---- naming ----
    const names: string[] = [];
    const used = new Set<number>();
    const note = (e: Expr) => walkExpr(e, x => { if (x.k === 'var') used.add(x.id); });
    const noteNodes = (ns: Node[]) => {
      for (const n of ns) {
        if (n.k === 'stmt') { stmtExprs(n.s).forEach(note); if ((n.s.k === 'set' || n.s.k === 'call') && n.s.dst >= 0) used.add(n.s.dst); }
        else if (n.k === 'if') { note(n.c); noteNodes(n.then); noteNodes(n.else); }
        else if (n.k === 'block') noteNodes(n.body);
        else if (n.k === 'loop') { if (n.c) note(n.c); noteNodes(n.body); }
        else if (n.k === 'return' && n.e) note(n.e);
        else if (n.k === 'switch') { used.add(n.v); n.cases.forEach(c => noteNodes(c.body)); }
        else if (n.k === 'setstate') used.add(n.v);
      }
    };
    noteNodes(body);
    const gen = shortNames();
    const paramName = ['r0', 'a', 'b', 'c', 'd', 'e', 'r6', 'r7', 'r8', 'r9', 'fp'];
    for (const v of f.vars) {
      if (v.param >= 0) names[v.id] = paramName[v.param];
      else if (v.reg === -1) names[v.id] = 'state';
    }
    for (const v of f.vars) if (names[v.id] === undefined && used.has(v.id)) names[v.id] = gen.next().value as string;
    const ctx: PrintCtx = {
      fnName, fnAddrName: a => fnByAddr.get(a), sysName: n => sem.syscallName(n),
      constComment: v => sem.constComment(v), varName: id => names[id] ?? `u${id}`,
      exprHook: opts.sugar ? (e, pr) => sem.sugar(e, pr) : undefined,
    };
    const pr = new Printer(ctx);
    const { decls, hoisted } = declarations(f, body);
    const params: string[] = [];
    for (let r = 1; r <= f.nparams; r++) params.push(`${paramName[r]}: u64`);
    for (const r of f.extraIn) params.push(`${paramName[r]}: u64`);
    const lines: string[] = [];
    const sig = `function ${f.name}(${params.join(', ')})${f.noreturn ? ': never' : f.returns ? ': u64' : ''}`;
    const hdr = sem.funcComment(f);
    if (hdr) lines.push(`// ${hdr}`);
    if (st.irreducible) lines.push('// note: irreducible control flow, emitted as a state machine');
    lines.push(`${sig} {`);
    const hoistedUsed = hoisted.filter(v => used.has(v));
    lines.push(...printBody(pr, f, body, '\t', decls, hoistedUsed));
    lines.push('}');
    funcs.push({ pc: f.pc, name: f.name, text: lines.join('\n'), irreducible: st.irreducible, f, body, names });
  }
  const header = sem.header();
  return { program: p, funcs, header, text: header + '\n' + funcs.map(f => f.text).join('\n\n') + '\n' };
}

/** Decide where each variable is declared (see README: "declarations"). */
function declarations(f: VarFunc, body: Node[]): { decls: Map<Stmt, 'let' | 'const'>; hoisted: number[] } {
  // references in DFS order with their containing list
  interface Ref { list: Node[]; idx: number; path: Node[][]; isDef: boolean; s?: Stmt }
  const refs = new Map<number, Ref[]>();
  const defCount = new Map<number, number>();
  const add = (v: number, r: Ref) => { let a = refs.get(v); if (!a) refs.set(v, (a = [])); a.push(r); };
  const walk = (ns: Node[], path: Node[][]) => {
    const p2 = [...path, ns];
    ns.forEach((n, idx) => {
      const use = (e: Expr) => walkExpr(e, x => { if (x.k === 'var') add(x.id, { list: ns, idx, path: p2, isDef: false }); });
      switch (n.k) {
        case 'stmt': {
          stmtExprs(n.s).forEach(use);
          if ((n.s.k === 'set' || n.s.k === 'call') && n.s.dst >= 0) {
            add(n.s.dst, { list: ns, idx, path: p2, isDef: true, s: n.s });
            defCount.set(n.s.dst, (defCount.get(n.s.dst) ?? 0) + 1);
          }
          break;
        }
        case 'if': use(n.c); walk(n.then, p2); walk(n.else, p2); break;
        case 'block': walk(n.body, p2); break;
        case 'loop':
          if (n.form === 'while' && n.c) use(n.c);
          walk(n.body, p2);
          if (n.form === 'do' && n.c) use(n.c); // the do-while condition is outside the body's scope
          break;
        case 'return': if (n.e) use(n.e); break;
        case 'switch': add(n.v, { list: ns, idx, path: p2, isDef: false }); n.cases.forEach(c => walk(c.body, p2)); break;
        case 'setstate': add(n.v, { list: ns, idx, path: p2, isDef: true }); defCount.set(n.v, 2); break;
      }
    });
  };
  walk(body, []);
  const decls = new Map<Stmt, 'let' | 'const'>();
  const hoisted: number[] = [];
  for (const [v, rs] of refs) {
    if (f.vars[v]?.param >= 0) continue;
    // innermost common list
    let common = rs[0].path;
    for (const r of rs) { let i = 0; while (i < common.length && i < r.path.length && common[i] === r.path[i]) i++; common = common.slice(0, i); }
    const list = common[common.length - 1];
    const first = rs[0];
    const firstIsTopDef = first.isDef && first.list === list && first.s && !(first.s.k === 'set' && usesVar(first.s.e, v));
    // loop `do { } while (c)` condition refs are placed at idx = body.length: fine
    if (firstIsTopDef && list) {
      decls.set(first.s!, (defCount.get(v) ?? 0) === 1 ? 'const' : 'let');
    } else hoisted.push(v);
  }
  return { decls, hoisted: hoisted.sort((a, b) => a - b) };
}

function usesVar(e: Expr, v: number) { let u = false; walkExpr(e, x => { if (x.k === 'var' && x.id === v) u = true; }); return u; }
