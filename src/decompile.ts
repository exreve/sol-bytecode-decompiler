// End-to-end pipeline: ELF -> functions -> IR -> variables -> simplified -> structured -> TypeScript.
import { loadProgram, type Program, fnAddr } from './program.ts';
import { inferSignatures, recoverVars, type VarFunc } from './dataflow.ts';
import { optimizeFunc, stmtExprs, DISABLED, setFoldImage } from './simplify.ts';
import { structure, cleanup, type Node } from './structure.ts';
import { Printer, printBody, type PrintCtx } from './print.ts';
import { type Expr, type Stmt, walkExpr, exprEq, INTRINSICS } from './ir.ts';
import { Semantics, constsIn, NICHE, OK_TAGS } from './semantics.ts';
import { renderSingle } from './layout.ts';
import type { IdlInfo } from './idl.ts';
import { promoteStack } from './stack.ts';
import { compactStores } from './compact.ts';
import { rewriteStackArgs } from './stackargs.ts';
import { recognizeIdioms } from './idioms.ts';
import { findAccounts, accountField, accountAddr } from './accounts.ts';
import { classify, type LibInfo } from './library.ts';
import { statementIdioms } from './stmtidioms.ts';
import { findCpiSites, describeCpi, type CpiEnv } from './cpi.ts';

export interface Options {
  sugar?: boolean;       // Solana-aware rendering (strings, pubkeys, account fields)
  only?: Set<number>;    // restrict to these function entry pcs
  full?: boolean;        // decompile library functions too (default: typed stubs only)
  exactMemory?: boolean; // no stack promotion / stack-arg elision (exact even for memory-unsafe executions)
  idl?: IdlInfo;         // Anchor IDL of the program (names, accounts, args, error codes)
}

export interface FuncOut { pc: number; name: string; text: string; irreducible: boolean; f: VarFunc; body: Node[]; names: string[]; calls: Set<number> }
export interface Result {
  program: Program;
  funcs: FuncOut[];
  stubs: string[];                 // `declare function` lines for referenced library functions
  instructions: { name: string; pc: number; disc: bigint; args?: string[]; accounts?: string[] }[];
  processors: { fn: string; names: string[] }[];  // functions handling several instructions inline (native programs)
  anchor: boolean;
  libCount: number;
  text: string;                    // single-file rendering
}

const RESERVED = new Set(['do', 'if', 'in', 'as', 'of', 'fp', 'let', 'var', 'for', 'new', 'try', 'int', 'is', 'ld', 'st']);

const HELPERS = new Set(['copy', 'copyr', 'sar', 'shl', 'sdiv', 'srem', 'sdiv32', 'srem32', 'mulhu', 'mulhs', 'trap', 'callx', 'undef', 'fp',
  'memeq', 'keyeq', 'rc_inc', 'rc_dec', ...Object.keys(INTRINSICS)]);

function* shortNames(): Generator<string> {
  const al = 'abcdefghijklmnopqrstuvwxyz';
  for (const c of 'fghijklmnopqrstuvwxyz') yield c;
  for (const c1 of al) for (const c2 of al) { const n = c1 + c2; if (!RESERVED.has(n)) yield n; }
  for (let i = 0; ; i++) yield `v${i}`;
}

interface Built { f: VarFunc; body: Node[]; irreducible: boolean }

export function decompile(bytes: Uint8Array, opts: Options = {}): Result {
  // ---- phase 1: whole-program analysis ----
  const p = loadProgram(bytes);
  inferSignatures(p);
  const sem = new Semantics(p, opts.idl);
  setFoldImage(DISABLED.has('rofold') ? null : p.image);
  const libs: Map<number, LibInfo> = opts.full ? new Map() : classify(p);
  for (const [pc, info] of libs) if (info.lib && info.name) p.funcs.get(pc)!.name = info.name;
  for (const [pc, ix] of sem.ixNames) if (!libs.get(pc)?.lib) p.funcs.get(pc)!.name = `ix_${ix}`;
  nameThunks(p);
  // names of the output language's own helpers stay unambiguous
  for (const f of p.funcs.values()) if (HELPERS.has(f.name) || /^(ld|st)(8|16|32|64)$|^bswap(16|32|64)$/.test(f.name)) f.name += '_';
  const isLib = (pc: number) => !!libs.get(pc)?.lib;
  const fnName = (pc: number) => p.funcs.get(pc)?.name ?? `fn_${(p.elf.text.addr + pc * 8).toString(16)}`;
  const fnByAddr = new Map<bigint, string>();
  const pcByAddr = new Map<bigint, number>();
  for (const f of p.funcs.values()) { fnByAddr.set(fnAddr(p, f.pc), f.name); pcByAddr.set(fnAddr(p, f.pc), f.pc); }

  // ---- phase 2: build every user function ----
  const built = new Map<number, Built>();
  for (const f0 of p.funcs.values()) {
    if (opts.only && !opts.only.has(f0.pc)) continue;
    if (isLib(f0.pc)) continue;
    const f = recoverVars(p, f0);
    optimizeFunc(f);
    if (!opts.exactMemory && !DISABLED.has('promote') && promoteStack(f)) optimizeFunc(f);
    if (!DISABLED.has('idioms') && recognizeIdioms(f)) optimizeFunc(f);
    built.set(f.pc, { f, body: [], irreducible: false });
  }

  // ---- SBF stack-passed arguments become ordinary parameters ----
  if (!opts.exactMemory && !DISABLED.has('stackargs')) rewriteStackArgs(p, built);
  for (const bt of built.values()) {
    if (!DISABLED.has('compact')) compactStores(bt.f);
    const st = structure(bt.f);
    bt.body = cleanup(st, bt.f.returns);
    if (!DISABLED.has('stmtidioms')) bt.body = statementIdioms(bt.body);
    bt.irreducible = st.irreducible;
  }

  // ---- phase 3: resolve discriminator-looking constants against the selector vocabulary ----
  const consts = new Set<bigint>();
  for (const { f } of built.values()) for (const b of f.blocks) {
    for (const s of b.stmts) stmtExprs(s).forEach(e => constsIn(e, consts));
    if (b.term.k === 'br') constsIn(b.term.c, consts);
  }
  if (opts.sugar !== false) sem.resolveCandidates(consts);
  // Result<_, ProgramError> niche constants compared with == / != (see Semantics.noteResultCompares)
  const niche = new Map<bigint, number>();
  const noteCmp = (e: Expr) => walkExpr(e, x => {
    if (x.k === 'cmp' && (x.op === 'eq' || x.op === 'ne') && x.b.k === 'const' && x.b.v > NICHE && x.b.v < NICHE + 0x40n) niche.set(x.b.v, (niche.get(x.b.v) ?? 0) + 1);
    // older layout: u32 variant tag (Ok = the number of ProgramError variants)
    if (x.k === 'cmp' && (x.op === 'eq' || x.op === 'ne') && x.a.k === 'load' && x.a.size === 4 && x.b.k === 'const' && OK_TAGS.includes(x.b.v)) tags.set(x.b.v, (tags.get(x.b.v) ?? 0) + 1);
  });
  const tags = new Map<bigint, number>();
  const tagStores = new Map<bigint, number>();
  for (const { f } of built.values()) for (const b of f.blocks) {
    for (const s of b.stmts) if (s.k === 'store' && s.size === 4 && s.v.k === 'const' && OK_TAGS.includes(s.v.v)) tagStores.set(s.v.v, (tagStores.get(s.v.v) ?? 0) + 1);
    for (const s of b.stmts) stmtExprs(s).forEach(noteCmp);
    if (b.term.k === 'br') noteCmp(b.term.c);
  }
  sem.noteResultCompares(niche);
  sem.noteResultTags(tags, tagStores);
  const resultOut = sem.resultOkTag !== undefined && opts.sugar !== false ? resultOutParams(built, sem.resultOkTag) : new Set<number>();

  // ---- library stubs referenced from user code ----
  const callsOf = (f: VarFunc) => {
    const out = new Set<number>();
    const visitE = (e: Expr) => walkExpr(e, x => {
      if (x.k === 'call' && x.t.k === 'fn') out.add(x.t.pc);
      if (x.k === 'const') { const t = pcByAddr.get(x.v); if (t !== undefined) out.add(t); }
    });
    for (const b of f.blocks) {
      for (const s of b.stmts) { if (s.k === 'call' && s.t.k === 'fn') out.add(s.t.pc); stmtExprs(s).forEach(visitE); }
      if (b.term.k === 'br') visitE(b.term.c);
      else if (b.term.k === 'ret' && b.term.e) visitE(b.term.e);
    }
    return out;
  };
  const stubs: string[] = [];
  const calledLib = new Set<number>();
  const callMap = new Map<number, Set<number>>();
  for (const [pc, { f }] of built) { const c = callsOf(f); callMap.set(pc, c); for (const t of c) if (isLib(t)) calledLib.add(t); }
  for (const pc of [...calledLib].sort((a, b) => a - b)) {
    const f = p.funcs.get(pc)!, info = libs.get(pc)!;
    const params = Array.from({ length: f.nparams }, (_, i) => `${'abcde'[i]}: u64`).concat(f.extraIn.map(r => `r${r}: u64`));
    let hint = info.hint;
    if (!hint) {
      // unnamed library code: say what it uses (named callees, syscalls)
      const uses = new Set<string>();
      for (const b of f.blocks) for (const st of b.stmts) if (st.k === 'call') {
        if (st.t.k === 'sys') uses.add(sem.syscallName(st.t.name));
        else if (st.t.k === 'fn') { const n = p.funcs.get(st.t.pc)?.name; if (n && !n.startsWith('fn_')) uses.add(n); }
        else uses.add('callx');
      }
      if (uses.size) hint = 'uses ' + [...uses].slice(0, 4).join(', ') + (uses.size > 4 ? ', …' : '');
    }
    stubs.push(`declare function ${f.name}(${params.join(', ')})${f.noreturn ? ': never' : f.returns ? ': u64' : ': void'} // lib${hint ? ' ' + hint : ''}`);
  }

  // ---- phase 4: print ----
  // thin wrappers of the CPI syscalls (same arguments)
  const invokeThunks = new Map<number, 'c' | 'rust'>();
  for (const fn of p.funcs.values()) {
    if (fn.blocks.length > 2) continue;
    let n = 0; for (const b of fn.blocks) n += b.end - b.start + 1;
    const calls = fn.blocks.flatMap(b => b.stmts.filter(s => s.k === 'call'));
    const t = calls[0]?.k === 'call' ? calls[0].t : undefined;
    const abi = calls.length === 1 && t?.k === 'sys' ? invokeAbi(t.name) : null;
    if (abi && n <= 8) invokeThunks.set(fn.pc, abi);
  }
  const accountInfos = opts.sugar !== false ? findAccounts(built) : undefined;
  const funcs: FuncOut[] = [];
  for (const [pc, bt] of built) {
    const { f, irreducible } = bt;
    // readable mode: `x = undef` (leftover register value) is shown by leaving x unassigned
    const body = opts.sugar !== false ? stripUndef(bt.body) : bt.body;
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
    // the VM starts the entrypoint with r1 = input, r10 = frame pointer and every other register zeroed
    const zeroInit = f.isEntry ? f.vars.filter(v => v.param >= 0 && v.param !== 1 && v.param !== 10 && used.has(v.id)) : [];
    for (const v of f.vars) {
      if (v.param >= 100) names[v.id] = `p${5 + v.param - 100}`;
      else if (v.param >= 0 && !zeroInit.includes(v)) names[v.id] = f.isEntry && v.param === 1 ? 'input' : paramName[v.param];
      else if (v.reg === -1) names[v.id] = 'state';
    }
    for (const v of f.vars) if (names[v.id] === undefined && used.has(v.id)) names[v.id] = gen.next().value as string;
    const ctx: PrintCtx = {
      fnName, fnAddrName: a => fnByAddr.get(a), sysName: n => sem.syscallName(n),
      constComment: (v, role) => (opts.sugar === false ? undefined : sem.constComment(v, role)), varName: id => names[id] ?? `u${id}`,
      strAt: opts.sugar === false ? undefined : (ptr, len) => sem.strAt(ptr, len),
      keyAt: opts.sugar === false ? undefined : ptr => sem.keyAt(ptr),
      dropUndefArgs: opts.sugar !== false,
      exprHook: opts.sugar ? (e, pr) => sem.sugar(e, pr) : undefined,
    };
    // entrypoint: annotate fields of the serialized input (first account + header)
    const inputVar = f.isEntry ? f.vars.find(v => v.param === 1)?.id : undefined;
    if (opts.sugar !== false && inputVar !== undefined) {
      const prev = ctx.exprHook;
      ctx.exprHook = (e, pr) => {
        if (e.k === 'load') {
          const a = e.addr;
          const off = a.k === 'var' && a.id === inputVar ? 0 : a.k === 'bin' && a.op === 'add' && a.a.k === 'var' && a.a.id === inputVar && a.b.k === 'const' ? Number(a.b.v) : -1;
          const fld = off >= 0 ? inputField(off, e.size) : undefined;
          if (fld) return `ld${e.size * 8}(${pr(a, 0)} /* ${fld} */)`;
        }
        return prev?.(e, pr);
      };
    }
    // loads through pointers known to be AccountInfo: field names (is_signer, owner, ...)
    const accTyped = accountInfos?.get(pc);
    if (opts.sugar !== false) ctx.storeField = (size, addr) => {
      const fld = accountField(accTyped, { k: 'load', size: size as 1 | 2 | 4 | 8, addr });
      if (fld || inputVar === undefined) return fld;
      const off = addr.k === 'var' && addr.id === inputVar ? 0 : addr.k === 'bin' && addr.op === 'add' && addr.a.k === 'var' && addr.a.id === inputVar && addr.b.k === 'const' ? Number(addr.b.v) : -1;
      return off >= 0 ? inputField(off, size) : undefined;
    };
    let inAddr = false; // printing the address of an annotated load
    if (accTyped?.size) {
      const prev = ctx.exprHook;
      ctx.exprHook = (e, pr) => {
        const fld = accountField(accTyped, e);
        if (fld && e.k === 'load') { inAddr = true; const a = pr(e.addr, 0); inAddr = false; return `ld${e.size * 8}(${a} /* ${fld} */)`; }
        const adr = e.k === 'bin' && !inAddr ? accountAddr(accTyped, e) : undefined;
        if (adr && e.k === 'bin') return `(${pr(e.a, 13)} + ${pr(e.b, 14)} /* ${adr} */)`;
        return prev?.(e, pr);
      };
    }
    // stack objects: frame addresses that escape (or are bases of copies) name an object; other
    // frame accesses are shown relative to the nearest object below them
    let frameDecl = '';
    if (opts.sugar !== false) {
      const fpv = f.vars.find(v => v.param === 10);
      if (fpv) {
        const { bases, all } = frameOffsets(f, fpv.id);
        const sorted = [...bases].sort((a, b) => a - b);
        const usedBases = new Set<number>();
        const pick = (o: number): [number, number] => {
          let b = o;
          for (const x of sorted) { if (x <= o && o - x < 0x200) b = x; if (x > o) break; }
          return [b, o - b];
        };
        for (const o of all) usedBases.add(pick(o)[0]);
        const nm = (b: number) => `s${(-b).toString(16)}`;
        ctx.frameRef = off => {
          const o = Number(off);
          if (o >= 0 || o < -0x2000) return undefined;
          const [b, d] = pick(o);
          return d ? `${nm(b)} + ${d < 10 ? d : '0x' + d.toString(16)}` : nm(b);
        };
        const list = [...usedBases].sort((a, b) => b - a);
        if (list.length) frameDecl = `\tconst ${list.map(b => `${nm(b)} = fp - 0x${(-b).toString(16)}`).join(', ')}`;
      }
    }
    const pr = new Printer(ctx);
    // Result<(), ProgramError> tags (u32 layout): stores of constants where the Ok tag is stored too
    if (opts.sugar !== false && sem.resultOkTag !== undefined) {
      const okAt: Expr[] = [];
      for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'store' && s.size === 4 && s.v.k === 'const' && s.v.v === sem.resultOkTag && !okAt.some(x => exprEq(x, s.addr))) okAt.push(s.addr);
      const a = resultOut.has(pc) ? f.vars.find(v => v.param === 1)?.id : undefined;
      if (a !== undefined) okAt.push({ k: 'var', id: a });
      const custom = (c: bigint) => { const n = c >= 100n ? sem.constComment(c, 'value') : undefined; return `Err(ProgramError::Custom(${c}${n ? ` ${n}` : ''}))`; };
      if (okAt.length) ctx.stmtTail = (s, prev) => {
        if (s.k === 'store' && s.size === 4 && s.v.k === 'const' && okAt.some(x => exprEq(x, s.addr))) {
          // st32(p + 4, code); st32(p, 0): Custom(code)
          const c = prev?.k === 'store' && prev.size === 4 && prev.v.k === 'const' && exprEq(prev.addr, { k: 'bin', op: 'add', a: s.addr, b: { k: 'const', v: 4n } }) ? prev.v.v : undefined;
          return s.v.v === 0n && c !== undefined ? custom(c) : sem.resultTagName(s.v.v);
        }
        // st32(p, 0, code): Custom(code)
        if (s.k === 'stores' && s.size === 4 && s.vals[0].k === 'const' && okAt.some(x => exprEq(x, s.addr))) {
          const c = s.vals[1];
          return s.vals[0].v === 0n && c?.k === 'const' ? custom(c.v) : sem.resultTagName(s.vals[0].v);
        }
        return undefined;
      };
    }
    // cross-program invocations: what is invoked (comment before the call)
    const fpVar = f.vars.find(v => v.param === 10)?.id;
    if (opts.sugar !== false && fpVar !== undefined) {
      const sites = findCpiSites(body, fpVar, t => (t.k === 'sys' ? invokeAbi(t.name) : t.k === 'fn' ? invokeThunks.get(t.pc) ?? null : null));
      if (sites.size) {
        const env: CpiEnv = {
          fp: fpVar, expr: e => pr.u(e, 0), keyAt: ctx.keyAt, strAt: ctx.strAt,
          constName: v => sem.constComment(v, 'value'), read: (a, n) => p.image.readConst(a, n),
        };
        ctx.nodeNote = n => { const s = sites.get(n); return s && describeCpi(s, env); };
      }
    }
    const { decls, hoisted } = declarations(f, body);
    const params: string[] = [];
    if (f.isEntry) params.push('input: u64');
    else {
      for (let r = 1; r <= (f.stackArgs ? 4 : f.nparams); r++) params.push(`${paramName[r]}: u64`);
      for (let k = 0; k < (f.stackArgs ?? 0); k++) params.push(`p${5 + k}: u64`);
      for (const r of f.extraIn) params.push(`${paramName[r]}: u64`);
    }
    const lines: string[] = [];
    const sig = `function ${f.name}(${params.join(', ')})${f.noreturn ? ': never' : f.returns ? ': u64' : ''}`;
    const hdr = opts.sugar === false ? undefined : sem.funcComment(f);
    if (hdr) lines.push(`// ${hdr}`);
    if (irreducible) lines.push('// note: irreducible control flow, emitted as a state machine');
    lines.push(`${sig} {`);
    if (frameDecl) lines.push(frameDecl);
    if (zeroInit.length) lines.push(`\tlet ${zeroInit.map(v => `${names[v.id]} = 0`).join(', ')}`);
    lines.push(...printBody(pr, f, body, '\t', decls, hoisted.filter(v => used.has(v))));
    lines.push('}');
    funcs.push({ pc, name: f.name, text: lines.join('\n'), irreducible, f, body, names, calls: callMap.get(pc)! });
  }
  const instructions = [...sem.ixNames].filter(([pc]) => built.has(pc)).map(([pc, name]) => {
    const d = opts.idl?.instructions.find(i => i.name === name);
    return { name, pc, disc: d?.disc ?? sem.discOf(name), args: d?.args, accounts: d?.accounts };
  });
  const processors = [...sem.processors].filter(([pc]) => built.has(pc)).map(([pc, names]) => ({ fn: p.funcs.get(pc)!.name, names }));
  const res: Result = { program: p, funcs, stubs, instructions, processors, anchor: sem.anchor, libCount: [...libs.values()].filter(l => l.lib).length, text: '' };
  res.text = renderSingle(res);
  return res;
}

/**
 * Functions whose first parameter points to a u32-tagged Result<(), ProgramError> (Ok tag `ok`):
 * they store the Ok tag through it, or a caller passes a slot whose tag it compares with the Ok tag,
 * or a function known to have one passes its own (unmodified) parameter on.
 */
function resultOutParams(built: Map<number, Built>, ok: bigint): Set<number> {
  const out = new Set<number>();
  const param1 = (f: VarFunc) => {
    const id = f.vars.find(v => v.param === 1)?.id;
    if (id === undefined) return undefined;
    for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'set' || s.k === 'call') && s.dst === id) return undefined;
    return id;
  };
  /** direct calls (statements and call expressions): target pc and arguments */
  const calls = (f: VarFunc) => {
    const r: { t: number; args: Expr[] }[] = [];
    const visit = (e: Expr) => walkExpr(e, x => { if (x.k === 'call' && x.t.k === 'fn') r.push({ t: x.t.pc, args: x.args }); });
    for (const b of f.blocks) {
      for (const s of b.stmts) { if (s.k === 'call' && s.t.k === 'fn') r.push({ t: s.t.pc, args: s.args }); stmtExprs(s).forEach(visit); }
      if (b.term.k === 'br') visit(b.term.c); else if (b.term.k === 'ret' && b.term.e) visit(b.term.e);
    }
    return r;
  };
  for (const [pc, { f }] of built) {
    const a = param1(f);
    const compared: Expr[] = [];
    const note = (e: Expr) => walkExpr(e, x => { if (x.k === 'cmp' && (x.op === 'eq' || x.op === 'ne') && x.a.k === 'load' && x.a.size === 4 && x.b.k === 'const' && x.b.v === ok) compared.push(x.a.addr); });
    for (const b of f.blocks) {
      for (const s of b.stmts) {
        if (a !== undefined && s.k === 'store' && s.size === 4 && s.v.k === 'const' && s.v.v === ok && s.addr.k === 'var' && s.addr.id === a) out.add(pc);
        stmtExprs(s).forEach(note);
      }
      if (b.term.k === 'br') note(b.term.c);
    }
    for (const c of calls(f)) if (c.args[0] && compared.some(x => exprEq(x, c.args[0]))) out.add(c.t);
  }
  for (let changed = true; changed;) {
    changed = false;
    for (const pc of [...out]) {
      const bt = built.get(pc);
      const a = bt && param1(bt.f);
      if (a === undefined) continue;
      for (const c of calls(bt!.f)) if (c.args[0]?.k === 'var' && c.args[0].id === a && !out.has(c.t)) { out.add(c.t); changed = true; }
    }
  }
  return out;
}

function invokeAbi(sys: string): 'c' | 'rust' | null {
  return sys === 'sol_invoke_signed_c' ? 'c' : sys === 'sol_invoke_signed_rust' ? 'rust' : null;
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

/** Name thin wrappers around a single syscall (memcpy, memset, ...) after what they wrap. */
function nameThunks(p: Program) {
  const taken = new Set([...p.funcs.values()].map(f => f.name));
  const WRAP: Record<string, string> = { sol_memcpy_: 'memcpy', sol_memmove_: 'memmove', sol_memset_: 'memset', sol_memcmp_: 'memcmp', abort: 'abort_', sol_panic_: 'panic_', sol_log_: 'log', sol_invoke_signed_rust: 'invoke_signed', sol_invoke_signed_c: 'invoke_signed_c', sol_try_find_program_address: 'find_program_address', sol_create_program_address: 'create_program_address', sol_sha256: 'sha256', sol_keccak256: 'keccak256', sol_log_data: 'log_data', sol_set_return_data: 'set_return_data', sol_get_return_data: 'get_return_data', sol_get_clock_sysvar: 'clock_get', sol_get_rent_sysvar: 'rent_get' };
  for (const f of p.funcs.values()) {
    if (!/^fn_[0-9a-f]+$/.test(f.name) || f.blocks.length > 2) continue;
    let n = 0; for (const b of f.blocks) n += b.end - b.start + 1;
    if (n > 8) continue;
    const calls = f.blocks.flatMap(b => b.stmts.filter(s => s.k === 'call'));
    if (calls.length !== 1 || calls[0].k !== 'call' || calls[0].t.k !== 'sys') continue;
    const base = WRAP[calls[0].t.name];
    if (!base) continue;
    let name = base, k = 2;
    while (taken.has(name)) name = `${base}${k++}`;
    taken.add(name);
    f.name = name;
  }
}

/** Frame offsets used in a function: `bases` = addresses that escape or start a copy/store run. */
function frameOffsets(f: VarFunc, fp: number): { bases: Set<number>; all: Set<number> } {
  const bases = new Set<number>(), all = new Set<number>();
  const off = (e: Expr): number | null => (e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fp && e.b.k === 'const') ? Number(BigInt.asIntN(64, e.b.v)) : null;
  const visit = (e: Expr, addr: boolean) => {
    const o = off(e);
    if (o !== null) { all.add(o); if (!addr) bases.add(o); return; }
    switch (e.k) {
      case 'bin': case 'cmp': case 'land': case 'lor': visit(e.a, false); visit(e.b, false); break;
      case 'neg': case 'not': case 'ext': case 'bswap': case 'lnot': visit(e.a, false); break;
      case 'load': visit(e.addr, true); break;
      case 'sel': visit(e.c, false); visit(e.a, false); visit(e.b, false); break;
      case 'call': case 'fn': e.args.forEach(a => visit(a, false)); if (e.k === 'call' && e.t.k === 'ind') visit(e.t.e, false); break;
    }
  };
  for (const b of f.blocks) {
    for (const s of b.stmts) {
      if (s.k === 'store') { visit(s.addr, true); visit(s.v, false); }
      else if (s.k === 'stores') { const o = off(s.addr); if (o !== null) { bases.add(o); all.add(o); } else visit(s.addr, true); s.vals.forEach(v => visit(v, false)); }
      else if (s.k === 'copy') { for (const x of [s.dst, s.src]) { const o = off(x); if (o !== null) { bases.add(o); all.add(o); } else visit(x, false); } }
      else stmtExprs(s).forEach(e => visit(e, false));
    }
    if (b.term.k === 'br') visit(b.term.c, false);
    else if (b.term.k === 'ret' && b.term.e) visit(b.term.e, false);
  }
  return { bases, all };
}

function stripUndef(ns: Node[]): Node[] {
  const out: Node[] = [];
  for (const n of ns) {
    if (n.k === 'stmt' && n.s.k === 'set' && n.s.e.k === 'undef') continue;
    if (n.k === 'if') out.push({ ...n, then: stripUndef(n.then), else: stripUndef(n.else) });
    else if (n.k === 'block' || n.k === 'loop') out.push({ ...n, body: stripUndef(n.body) } as Node);
    else if (n.k === 'switch') out.push({ ...n, cases: n.cases.map(c => ({ ...c, body: stripUndef(c.body) })) });
    else out.push(n);
  }
  return out;
}

/** Field of the serialized program input at a fixed offset (only the first account has fixed offsets). */
function inputField(off: number, size: number): string | undefined {
  if (off === 0 && size === 8) return 'num_accounts';
  const o = off - 8;
  if (o < 0) return undefined;
  const F: [number, number, string][] = [[0, 1, 'dup_marker(0xff=not dup)'], [1, 1, 'is_signer'], [2, 1, 'is_writable'], [3, 1, 'executable'], [4, 4, 'original_data_len'],
    [8, 32, 'key'], [40, 32, 'owner'], [72, 8, 'lamports'], [80, 8, 'data_len']];
  if (o === 0 && size === 2) return 'dup_marker|is_signer';
  if (o === 0 && size === 4) return 'dup_marker|is_signer|is_writable|executable';
  for (const [at, len, name] of F) if (o >= at && o + size <= at + len) return `acc0.${name}${len > 8 ? (o === at ? '' : `[${o - at}]`) : ''}`;
  if (o >= 88 && o < 88 + 0x800) return `acc0.data[${o - 88}]`;
  return undefined;
}
