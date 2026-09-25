// End-to-end pipeline: ELF -> functions -> IR -> variables -> simplified -> structured -> TypeScript.
import { loadProgram, type Program, fnAddr } from './program.ts';
import { inferSignatures, recoverVars, type VarFunc } from './dataflow.ts';
import { optimizeFunc, stmtExprs, DISABLED, setFoldImage } from './simplify.ts';
import { structure, cleanup, type Node } from './structure.ts';
import { Printer, printBody, keyB58, type PrintCtx } from './print.ts';
import { type Expr, type Stmt, walkExpr, exprEq, INTRINSICS } from './ir.ts';
import { Semantics, constsIn, NICHE, OK_TAGS, KNOWN_KEYS } from './semantics.ts';
import { renderSingle } from './layout.ts';
import type { IdlInfo } from './idl.ts';
import { promoteStack } from './stack.ts';
import { compactStores } from './compact.ts';
import { rewriteStackArgs } from './stackargs.ts';
import { recognizeIdioms } from './idioms.ts';
import { findAccounts, accountField, accountAddr } from './accounts.ts';
import { classify, type LibInfo } from './library.ts';
import { statementIdioms } from './stmtidioms.ts';
import { findCpiSites, describeCpi, cpiDesc, type CpiEnv } from './cpi.ts';
import { Views, exprType } from './views.ts';
import { findNameFn, anchorFn, accountsLayout, type AnchorFn } from './anchor.ts';
import { accountViews, accountDataVars } from './state.ts';
import { instructionTaint, exprTainted } from './taint.ts';

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
  instructions: { name: string; pc: number; disc: bigint; args?: string[]; accounts?: string[]; strAccounts?: string[] }[];
  views: Views;                    // typed views available to the output (declared with it)
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
    if (!DISABLED.has('stmtidioms')) bt.body = statementIdioms(bt.body, opts.exactMemory ? undefined : bt.f.vars.find(v => v.param === 10)?.id);
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

  // ---- Anchor error helpers (named before anything is printed) ----
  const heurNames = new Map<number, string>(); // pc -> provenance note of a heuristic function name
  let nameFn: number | undefined;
  if (opts.sugar !== false && sem.anchor) {
    nameFn = findNameFn([...built.values()].map(b => b.f), (ptr, len) => sem.strAt(ptr, len));
    const rename = (pc: number, nm: string, why: string) => {
      const fn = p.funcs.get(pc);
      if (!fn || !/^fn_[0-9a-f]+$/.test(fn.name) || [...p.funcs.values()].some(x => x.name === nm)) return;
      heurNames.set(pc, `name [heur]: ${why} (was ${fn.name})`);
      fn.name = nm;
      fnByAddr.set(fnAddr(p, pc), nm);
    };
    if (nameFn !== undefined) rename(nameFn, 'Error_with_account_name', 'the callee most often given an account-name string as its last argument pair');
    // the Anchor error constructor: the callee most often given an anchor_lang ErrorCode as second argument
    const count = new Map<number, number>();
    for (const { f } of built.values()) for (const b of f.blocks) for (const st of b.stmts) {
      const calls: { pc: number; args: Expr[] }[] = [];
      if (st.k === 'call' && st.t.k === 'fn') calls.push({ pc: st.t.pc, args: st.args });
      for (const c of calls) { const a = c.args[1]; if (a?.k === 'const' && a.v >= 2000n && a.v <= 5000n && sem.anchorError(a.v)) count.set(c.pc, (count.get(c.pc) ?? 0) + 1); }
    }
    let best: number | undefined, n = 0;
    for (const [pc, c] of count) if (c > n) { best = pc; n = c; }
    if (best !== undefined && n >= 3 && best !== nameFn) rename(best, 'anchor_error_from', 'the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from');
  }

  // ---- Anchor dispatcher: compares the instruction data's first 8 bytes with each handler's discriminator ----
  const abiNames = new Map<number, Map<number, string>>(); // fn pc -> var id -> name (Anchor dispatch / handler ABI)
  if (opts.sugar !== false) {
    const handlerOf = new Map([...sem.ixNames].map(([pc, ix]) => [ix, pc]));
    const setName = (pc: number, v: number, nm: string) => { let m = abiNames.get(pc); if (!m) abiNames.set(pc, (m = new Map())); if (!m.has(v)) m.set(v, nm); };
    for (const [dpc, { f }] of built) {
      // if (ld64(X) == disc) { … handler(out, p1, p2, p3[, X + 8, L - 8]) … }
      const hits: { x: number; call: Extract<Stmt, { k: 'call' }> }[] = [];
      for (const b of f.blocks) {
        if (b.term.k !== 'br') continue;
        const c = b.term.c;
        if (c.k !== 'cmp' || (c.op !== 'eq' && c.op !== 'ne') || c.b.k !== 'const' || c.a.k !== 'load' || c.a.size !== 8 || c.a.addr.k !== 'var') continue;
        const d = sem.disc.get(c.b.v);
        const hpc = d?.startsWith('ix:') ? handlerOf.get(d.slice(3)) : undefined;
        if (hpc === undefined) continue;
        const next = f.blocks[c.op === 'eq' ? b.term.t : b.term.f];
        const call = next?.stmts.find(x => x.k === 'call' && x.t.k === 'fn' && x.t.pc === hpc) as Extract<Stmt, { k: 'call' }> | undefined;
        if (call) hits.push({ x: c.a.addr.id, call });
      }
      if (hits.length < 3 || hits.some(h => h.x !== hits[0].x)) continue;
      const fn = p.funcs.get(dpc)!;
      if (/^fn_[0-9a-f]+$/.test(fn.name) && ![...p.funcs.values()].some(x => x.name === 'anchor_dispatch')) {
        heurNames.set(dpc, `name [heur]: compares the instruction data's first 8 bytes with ${hits.length} handlers' discriminators and calls the matching handler (was ${fn.name})`);
        fn.name = 'anchor_dispatch'; fnByAddr.set(fnAddr(p, dpc), fn.name);
      }
      const X = hits[0].x;
      setName(dpc, X, 'ix_data');
      // arguments passed the same way to every handler: Anchor handler ABI (out, program_id, accounts, accounts_len, args, args_len)
      const ABI = ['', 'program_id', 'accounts', 'accounts_len', 'ix_args', 'ix_args_len'];
      for (let k = 1; k <= 5; k++) {
        const args = hits.map(h => h.call.args[k]).filter(Boolean);
        if (!args.length) continue;
        const same = args.every(a => exprEq(a, args[0]));
        if (!same) continue;
        const a = args[0];
        const ok = k <= 3 ? a.k === 'var' : k === 4 ? a.k === 'bin' && a.op === 'add' && a.a.k === 'var' && a.a.id === X && a.b.k === 'const' && a.b.v === 8n
          : a.k === 'bin' && a.op === 'add' && a.a.k === 'var' && a.b.k === 'const' && a.b.v === BigInt.asUintN(64, -8n);
        if (!ok) continue;
        if (k <= 3 && a.k === 'var') setName(dpc, a.id, ABI[k]);
        if (k === 5 && a.k === 'bin' && a.a.k === 'var') setName(dpc, a.a.id, 'ix_data_len');
        for (const h of hits) {
          const hpc = (h.call.t as { pc: number }).pc, hb = built.get(hpc);
          if (!hb) continue;
          // argument k -> the callee's parameter: registers r1..r5, or r1..r4 then stack-passed p5, p6, …
          const reg = hb.f.stackArgs ? (k < 4 ? k + 1 : 100 + (k - 4)) : k + 1;
          const target = hb.f.vars.find(v => v.param === reg);
          if (target && defCount(hb.f, target.id) === 0) setName(hpc, target.id, ABI[k]);
        }
      }
    }
  }

  // ---- instruction-data taint from the handlers' ix_args (see taint.ts) ----
  const seeds = new Map<number, number[]>();
  for (const [pc, m] of abiNames) for (const [v, nm] of m) if (nm === 'ix_args') { let l = seeds.get(pc); if (!l) seeds.set(pc, (l = [])); l.push(v); }
  const taint = opts.sugar !== false && seeds.size ? instructionTaint(built, seeds) : new Map();

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
    if (heurNames.has(pc)) hint = heurNames.get(pc) + (hint ? `; ${hint}` : '');
    stubs.push(`declare function ${f.name}(${params.join(', ')})${f.noreturn ? ': never' : f.returns ? ': u64' : ': void'} // lib${hint ? ' ' + hint : ''}`);
  }

  // ---- phase 4: print ----
  // thin wrappers of the CPI syscalls (same arguments)
  const invokeThunks = new Map<number, 'c' | 'rust' | 'pda_find' | 'pda_create'>();
  for (const fn of p.funcs.values()) {
    if (fn.blocks.length > 2) continue;
    let n = 0; for (const b of fn.blocks) n += b.end - b.start + 1;
    const calls = fn.blocks.flatMap(b => b.stmts.filter(s => s.k === 'call'));
    const t = calls[0]?.k === 'call' ? calls[0].t : undefined;
    const abi = calls.length === 1 && t?.k === 'sys' ? invokeAbi(t.name) : null;
    if (abi && n <= 8) invokeThunks.set(fn.pc, abi);
  }
  const accountInfos = opts.sugar !== false ? findAccounts(built) : undefined;
  const views = new Views();
  // IDL account layouts: pointers whose first 8 bytes are compared with an account discriminator (see state.ts)
  const dataVars = opts.sugar !== false && opts.idl ? accountDataVars(built, accountViews(opts.idl, views), t => views.recordOf(t)) : new Map<number, Map<number, string>>();
  // Anchor: account names from the program's own account-error strings (see anchor.ts)
  const anchorInfo = new Map<number, AnchorFn>();
  const fnNotes = new Map<number, string[]>(); // extra header lines per function
  const strAccounts = new Map<number, string[]>(); // handler pc -> account names from strings
  const tryOf = new Map<number, number>();          // handler pc -> its Accounts::try_accounts function
  const paramTypes = new Map<number, Map<number, [string, string]>>(); // fn pc -> param var -> [view, provenance note]
  // IDL: accounts and arguments of each handler
  if (opts.sugar !== false && opts.idl) for (const [hpc, ix] of sem.ixNames) {
    const d = opts.idl.instructions.find(i => i.name === ix);
    if (!d || !built.has(hpc)) continue;
    const l = fnNotes.get(hpc) ?? fnNotes.set(hpc, []).get(hpc)!;
    l.push(`accounts [idl]: ${d.accounts.map((x, i) => `${i} ${x}`).join(', ') || '(none)'}`);
    l.push(`args [idl]: ${d.args.join(', ') || '(none)'}`);
  }
  if (opts.sugar !== false && sem.anchor) {
    const strAt = (ptr: bigint, len: bigint) => sem.strAt(ptr, len);
    if (nameFn !== undefined) {
      for (const [pc, bt] of built) {
        const a = anchorFn(bt.f, bt.body, nameFn, strAt, v => sem.anchorError(v), v => accountInfos?.get(pc)?.get(`v${v}`) === 'info');
        if (a) anchorInfo.set(pc, a);
      }
      // each handler's Accounts::try_accounts: the first function it calls that names accounts
      const taken = new Set([...p.funcs.values()].map(x => x.name));
      for (const [hpc, ix] of sem.ixNames) {
        const bt = built.get(hpc);
        if (!bt) continue;
        let tpc: number | undefined;
        const hit = (t: number) => { if (tpc === undefined && t !== hpc && anchorInfo.has(t)) tpc = t; };
        const inExpr = (e: Expr) => walkExpr(e, x => { if (x.k === 'call' && x.t.k === 'fn') hit(x.t.pc); });
        const visit = (ns: Node[]) => {
          for (const n of ns) {
            if (n.k === 'stmt') { if (n.s.k === 'call' && n.s.t.k === 'fn') hit(n.s.t.pc); stmtExprs(n.s).forEach(inExpr); }
            else if (n.k === 'if') { inExpr(n.c); visit(n.then); visit(n.else); }
            else if (n.k === 'return' && n.e) inExpr(n.e);
            else childLists(n).forEach(visit);
          }
        };
        visit(bt.body);
        if (tpc === undefined) continue;
        tryOf.set(hpc, tpc);
        const a = anchorInfo.get(tpc)!, fn = p.funcs.get(tpc)!;
        if (/^fn_[0-9a-f]+$/.test(fn.name) && !taken.has(`accounts_${ix}`)) {
          const old = fn.name;
          fn.name = `accounts_${ix}`; taken.add(fn.name);
          fnByAddr.set(fnAddr(p, tpc), fn.name);
          (fnNotes.get(tpc) ?? fnNotes.set(tpc, []).get(tpc)!).push(`Anchor Accounts::try_accounts of instruction ${ix} (called by ix_${ix}; name [str]: from the handler's "Instruction: …" log; was ${old})`);
        }
        if (!opts.idl?.instructions.some(i => i.name === ix)) (fnNotes.get(hpc) ?? fnNotes.set(hpc, []).get(hpc)!).push(`accounts [str: the program's account-error strings, in order of first use]: ${a.accounts.join(', ')}`);
        strAccounts.set(hpc, a.accounts);
      }
    }
  }
  // Anchor Accounts structs (layout from try_accounts' stores) and the Context the handler passes to its logic
  for (const [hpc, tpc] of tryOf) {
    const ix = sem.ixNames.get(hpc)!;
    const layout = accountsLayout(built.get(tpc)!.f, anchorInfo.get(tpc)!.varNames);
    if (!layout.size) continue;
    const P = ix.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join('');
    if (views.map.has(`${P}Accounts`) || views.map.has(`${P}Context`)) continue;
    views.add({ name: `${P}Accounts`, doc: `Accounts struct of instruction ${ix} as accounts_${ix} returns it: account fields (&AccountInfo) at the offsets it stores them [str names; offsets inferred]`, fields: [...layout].sort((x, y) => x[0] - y[0]).map(([off, nm]) => ({ name: nm, off, t: { k: 'ref', to: 'AccountInfo' } })) });
    views.add({ name: `${P}Context`, doc: `anchor_lang Context of instruction ${ix} (program_id, accounts), as the handler builds it [layout from the handler's stores]`, fields: [{ name: 'program_id', off: 0, t: { k: 'ref', to: 'Pubkey' } }, { name: 'accounts', off: 8, t: { k: 'ref', to: `${P}Accounts` } }] });
    // the handler: the frame object R receiving try_accounts' result, and a call passing a frame object
    // whose word 0 is program_id and word 8 the address of a copy of R
    const hb = built.get(hpc)!, hf = hb.f;
    const fpv = hf.vars.find(v => v.param === 10)?.id;
    const prog = [...(abiNames.get(hpc) ?? [])].find(([, n]) => n === 'program_id')?.[0];
    if (fpv === undefined || prog === undefined) continue;
    const fo = (e: Expr | undefined): number | undefined => (e && e.k === 'bin' && e.op === 'add' && e.a.k === 'var' && e.a.id === fpv && e.b.k === 'const' ? Number(BigInt.asIntN(64, e.b.v)) : e?.k === 'var' && e.id === fpv ? 0 : undefined);
    const defs = new Map<number, Expr[]>();
    for (const b of hf.blocks) for (const st of b.stmts) if (st.k === 'set') { let l = defs.get(st.dst); if (!l) defs.set(st.dst, (l = [])); l.push(st.e); }
    let R: number | undefined;
    for (const b of hf.blocks) for (const st of b.stmts) if (st.k === 'call' && st.t.k === 'fn' && st.t.pc === tpc) R = fo(st.args[0]);
    if (R === undefined) continue;
    const loadsR = (e: Expr, k: number) => {
      if (e.k === 'var' && defs.get(e.id)?.length === 1) e = defs.get(e.id)![0];
      return e.k === 'load' && e.size === 8 && fo(e.addr) === R! + k;
    };
    const sites = findCpiSites(hb.body, fpv, t => (t.k === 'fn' && t.pc !== tpc && built.has(t.pc) ? 'call' : null));
    for (const site of sites.values()) {
      if (site.t?.k !== 'fn') continue;
      const callee = built.get(site.t.pc);
      if (!callee) continue;
      site.args.forEach((arg, i) => {
        const F = fo(arg);
        if (F === undefined) return;
        const w0 = site.facts.find(x => x.off === F && x.size === 8)?.e, w1 = site.facts.find(x => x.off === F + 8 && x.size === 8)?.e;
        const G = fo(w1);
        if (w0?.k !== 'var' || w0.id !== prog || G === undefined) return;
        if (!site.facts.some(x => x.size === 8 && x.off >= G && x.off < G + 0x800 && loadsR(x.e, x.off - G))) return;
        const reg = callee.f.stackArgs ? (i < 4 ? i + 1 : 100 + (i - 4)) : i + 1;
        const pv = callee.f.vars.find(v => v.param === reg);
        if (!pv || defCount(callee.f, pv.id) !== 0) return;
        let m = paramTypes.get(site.t.pc); if (!m) paramTypes.set(site.t.pc, (m = new Map()));
        m.set(pv.id, [`${P}Context`, `the handler ix_${ix} passes a frame object holding (program_id, address of a copy of the Accounts result)`]);
      });
    }
  }

  // functions that make exactly one CPI, of a decoded well-known instruction: cpi_<program>_<instruction>
  if (opts.sugar !== false) {
    const taken = new Set([...p.funcs.values()].map(x => x.name));
    for (const [pc, bt] of built) {
      const fn = p.funcs.get(pc)!;
      const fpv = bt.f.vars.find(v => v.param === 10)?.id;
      if (!/^fn_[0-9a-f]+$/.test(fn.name) || fpv === undefined) continue;
      // small functions only (a wrapper around the CPI, not a handler that also makes one)
      let size = 0;
      for (const b of bt.f.blocks) size += b.stmts.length;
      if (size > 120) continue;
      const cpiOnly = (a: string | null | undefined) => (a === 'c' || a === 'rust' ? a : null);
      const sites = findCpiSites(bt.body, fpv, t => (t.k === 'sys' ? cpiOnly(invokeAbi(t.name)) : t.k === 'fn' ? cpiOnly(invokeThunks.get(t.pc)) : null));
      if (sites.size !== 1) continue;
      const d = cpiDesc([...sites.values()][0], { fp: fpv, expr: () => '', keyAt: a => sem.keyAt(a), read: (a, n) => (p.image.region(a, n)?.exec === false ? p.image.read(a, n) : undefined) });
      if (!d?.ix) continue;
      const base = `cpi_${d.family}_${d.ix.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()}`;
      let nm = base, k = 2;
      while (taken.has(nm)) nm = `${base}_${k++}`;
      const old = fn.name;
      fn.name = nm; taken.add(nm);
      fnByAddr.set(fnAddr(p, pc), nm);
      (fnNotes.get(pc) ?? fnNotes.set(pc, []).get(pc)!).push(d.guessed
        ? `name [heur]: its CPI's data and accounts match ${d.family === 'token' ? 'SPL Token' : 'System'} ${d.ix}, but the program id is not a constant here (was ${old})`
        : `name [known]: makes the CPI ${d.ix} of a well-known program (was ${old})`);
    }
  }
  const funcs: FuncOut[] = [];
  for (const [pc, bt] of built) {
    const { f, irreducible } = bt;
    // readable mode: `x = undef` (leftover register value) is shown by leaving x unassigned
    const body = opts.sugar !== false ? stripUndef(bt.body, undefOnly(bt.body, v => f.vars[v]?.param >= 0)) : bt.body;
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
    // recovered names (see anchor.ts), unique and distinct from every other identifier of the output
    const an = anchorInfo.get(pc);
    const recovered: string[] = [];
    const taken = new Set([...names.filter(Boolean), ...globalIdents(p), ...views.map.keys(), ...views.opaque.keys()]);
    const unique = (nm0: string) => { let nm = nm0, k = 2; while (taken.has(nm) || RESERVED_TS.has(nm)) nm = `${nm0}_${k++}`; taken.add(nm); return nm; };
    // IDL: the instruction data of a handler, as a view of its arguments (Borsh layout)
    const argTypes = new Map<number, string>();
    const argNames: string[] = [];
    const ixName = sem.ixNames.get(pc);
    const ixDef = opts.sugar !== false && ixName ? opts.idl?.instructions.find(i => i.name === ixName) : undefined;
    if (ixDef && ixDef.argDefs.length) {
      const vname = ixName!.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join('') + 'Args';
      const view = views.map.get(vname) ?? views.borshView(vname, `arguments of instruction ${ixName} (Anchor IDL, Borsh layout; after the 8-byte discriminator)`, ixDef.argDefs, opts.idl!.types);
      const found = view && argsVar(f, view.name, views);
      if (found !== undefined && used.has(found)) {
        argTypes.set(found, view!.name);
        names[found] = unique('args'); argNames.push(names[found]);
        // variables that are exactly one argument: named after it
        for (const b of f.blocks) for (const st of b.stmts) {
          if (st.k !== 'set' || st.e.k !== 'load' || !used.has(st.dst) || f.vars[st.dst]?.param >= 0) continue;
          const a = st.e.addr, off = a.k === 'var' && a.id === found ? 0 : a.k === 'bin' && a.op === 'add' && a.a.k === 'var' && a.a.id === found && a.b.k === 'const' ? Number(a.b.v) : -1;
          const fd = off >= 0 ? view!.fields.find(x => x.off === off && x.t.k === 'scalar' && x.t.size === (st.e as { size: number }).size) : undefined;
          if (!fd || defCount(f, st.dst) !== 1) continue;
          names[st.dst] = unique(fd.name); argNames.push(names[st.dst]);
        }
      }
    }
    // Anchor dispatcher / handler ABI names
    const abiNm: string[] = [];
    for (const [v, nm] of abiNames.get(pc) ?? []) if (used.has(v) && !argTypes.has(v)) { names[v] = unique(nm); abiNm.push(names[v]); }
    // account data pointers (IDL layouts): <account type>_data
    for (const [v, t] of dataVars.get(pc) ?? []) {
      if (!used.has(v) || argTypes.has(v) || f.vars[v]?.param === 10) continue;
      names[v] = unique(t.replace(/Account$|Record$/, '').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase() + (t.endsWith('Record') ? '_acc' : '_data'));
    }
    if (an) {
      for (const [v, nm0] of [...an.varNames].sort((x, y) => x[0] - y[0])) {
        if (!used.has(v) || f.vars[v]?.param === 10 || argTypes.has(v) || dataVars.get(pc)?.has(v)) continue;
        const nm = unique(nm0);
        names[v] = nm;
        recovered.push(nm);
      }
    }
    const ctx: PrintCtx = {
      fnName, fnAddrName: a => fnByAddr.get(a), sysName: n => sem.syscallName(n),
      constComment: (v, role) => (opts.sugar === false ? undefined : sem.constComment(v, role)), varName: id => names[id] ?? `u${id}`,
      strAt: opts.sugar === false ? undefined : (ptr, len) => sem.strLit(ptr, len),
      strNote: opts.sugar === false ? undefined : (ptr, len) => sem.strAt(ptr, len),
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
    // serialized input: p + data_len(p) + 10 KiB realloc room + rent_epoch, 8-aligned = the next account record
    if (opts.sugar !== false) {
      const prev = ctx.exprHook;
      ctx.exprHook = (e, pr) => {
        if (e.k === 'bin' && e.op === 'and' && e.b.k === 'const' && e.b.v === 0xfffffffffffffff8n && e.a.k === 'bin' && e.a.op === 'add' && e.a.b.k === 'const' && e.a.b.v === 0x2867n) {
          const s1 = e.a.a;
          if (s1.k === 'bin' && s1.op === 'add' && s1.b.k === 'load' && s1.b.size === 8 && exprEq(s1.b.addr, { k: 'bin', op: 'add', a: s1.a, b: { k: 'const', v: 0x50n } }))
            return `(${pr(e.a, 9)} & -8 /* next account record */)`;
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
        for (const o of all) if (o < 0 && o >= -0x2000) usedBases.add(pick(o)[0]); // (frameRef names these only)
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
    // typed views: variables known to point to an account (see accounts.ts), the entrypoint input
    const varTypes = new Map<number, string>();
    const dataNotes: string[] = [];
    const ctxNotes: string[] = [];
    if (opts.sugar !== false) {
      for (const [k, kind] of accTyped ?? []) if (/^v\d+$/.test(k)) varTypes.set(Number(k.slice(1)), kind === 'info' ? 'AccountInfo' : 'AccountRecord');
      for (const v of an?.accountVars ?? []) if (!varTypes.has(v)) varTypes.set(v, 'AccountInfo');
      for (const [v, t] of argTypes) varTypes.set(v, t);
      for (const [v, [t, why]] of paramTypes.get(pc) ?? []) if (!varTypes.has(v)) { varTypes.set(v, t); ctxNotes.push(`${names[v]}: ${t} (${why})`); }
      for (const [v, t] of dataVars.get(pc) ?? []) if ((!varTypes.has(v) || varTypes.get(v) === 'AccountRecord') && used.has(v)) { varTypes.set(v, t); dataNotes.push(`${names[v]}: ${t}`); }
      // single-definition variables holding a typed object (x = acc.data): that object's view type
      for (let it = 0, grew = true; grew && it < 4; it++) {
        grew = false;
        for (const b of f.blocks) for (const st of b.stmts) {
          if (st.k !== 'set' || varTypes.has(st.dst) || !used.has(st.dst) || f.vars[st.dst]?.param >= 0 || defCount(f, st.dst) !== 1) continue;
          const t = exprType(views, st.e, id => varTypes.get(id));
          if (t && views.map.has(t)) { varTypes.set(st.dst, t); grew = true; }
        }
      }
      if (inputVar !== undefined) varTypes.set(inputVar, 'Input');
      ctx.views = views;
      ctx.varType = id => varTypes.get(id);
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
        // st64(p, code << 32): tag and code in one store
        if (s.k === 'store' && s.size === 8 && s.v.k === 'const' && s.v.v !== 0n && okAt.some(x => exprEq(x, s.addr))) {
          const tag = s.v.v & 0xffffffffn, code = s.v.v >> 32n;
          return tag === 0n ? custom(code) : code === 0n ? sem.resultTagName(tag) : undefined;
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
      const sites = findCpiSites(body, fpVar, t => (t.k === 'sys' ? invokeAbi(t.name) ?? 'call' : t.k === 'fn' ? invokeThunks.get(t.pc) ?? pdaAbi(fnName(t.pc)) ?? 'call' : null));
      if (sites.size) {
        const env: CpiEnv = {
          programCheck: ptr => keyCompares(f, ptr, a => sem.keyAt(a)),
          tainted: e => exprTainted(taint.get(pc), e, fpVar),
          fp: fpVar, expr: e => pr.u(e, 0), keyAt: ctx.keyAt, strAt: (ptr, len) => sem.strAt(ptr, len),
          constName: v => sem.constComment(v, 'value'), read: (a, n) => (p.image.region(a, n)?.exec === false ? p.image.read(a, n) : undefined), // program memory (never written at run time)
        };
        ctx.nodeNote = n => { const s = sites.get(n); return s && describeCpi(s, env); };
      }
    }
    const { decls, hoisted } = declarations(f, body);
    const params: string[] = [];
    const paramType = (reg: number) => { const v = f.vars.find(x => x.param === reg); return (v && varTypes.get(v.id)) ?? 'u64'; };
    const paramNm = (reg: number, dflt: string) => { const v = f.vars.find(x => x.param === reg); return (v && names[v.id]) ?? dflt; };
    if (f.isEntry) params.push(`input: ${paramType(1)}`);
    else {
      for (let r = 1; r <= (f.stackArgs ? 4 : f.nparams); r++) params.push(`${paramNm(r, paramName[r])}: ${paramType(r)}`);
      for (let k = 0; k < (f.stackArgs ?? 0); k++) params.push(`${paramNm(100 + k, `p${5 + k}`)}: ${paramType(100 + k)}`);
      for (const r of f.extraIn) params.push(`${paramNm(r, paramName[r])}: ${paramType(r)}`);
    }
    const lines: string[] = [];
    const sig = `function ${f.name}(${params.join(', ')})${f.noreturn ? ': never' : f.returns ? ': u64' : ''}`;
    const hdr = opts.sugar === false ? undefined : sem.funcComment(f);
    if (hdr) lines.push(`// ${hdr}`);
    for (const n of fnNotes.get(pc) ?? []) lines.push(`// ${n}`);
    if (heurNames.has(pc)) lines.push(`// ${heurNames.get(pc)}`);
    const tp = taint.get(pc);
    if (tp && !sem.ixNames.has(pc)) {
      const ps = f.vars.filter(v => v.param >= 1 && v.param !== 10 && tp.vars.has(v.id) && names[v.id]).map(v => `${names[v.id]} (${tp.vars.get(v.id) === 'ptr' ? 'points to it' : 'value'})`);
      if (ps.length) lines.push(`// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: ${ps.join(', ')}`);
    }
    if (abiNm.length) lines.push(`// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: ${abiNm.join(', ')}`);
    if (ctxNotes.length) lines.push(`// types [heur]: ${ctxNotes.join('; ')}`);
    if (dataNotes.length) lines.push(`// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: ${dataNotes.join(', ')}`);
    if (argNames.length) lines.push(`// names [idl: argument names and layout; which variable holds the instruction data is inferred]: ${argNames.join(', ')}`);
    if (an) {
      const checks = an.accounts.map(nm => { const c = an.checks.get(nm) ?? []; return c.length ? `${nm} (${c.join(', ')})` : nm; });
      lines.push(`// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: ${checks.join(', ')}`);
      if (recovered.length) {
        const idlAcc = new Set(opts.idl?.instructions.flatMap(i => i.accounts.map(x => x.split(' ')[0].split('.').pop()!)) ?? []);
        const tag = (nm: string) => (idlAcc.has(nm.replace(/_\d+$/, '')) ? `${nm} [idl]` : nm);
        lines.push(`// names [str: account-error string on the failing branch; which variable holds the account is inferred${idlAcc.size ? '; [idl]: also an account name in the IDL' : ''}]: ${recovered.map(tag).join(', ')}`);
      }
    }
    if (irreducible) lines.push('// note: irreducible control flow, emitted as a state machine');
    lines.push(`${sig} {`);
    if (frameDecl) lines.push(frameDecl);
    if (zeroInit.length) lines.push(`\tlet ${zeroInit.map(v => `${names[v.id]}${varTypes.has(v.id) ? `: ${varTypes.get(v.id)}` : ''} = 0`).join(', ')}`);
    lines.push(...printBody(pr, f, body, '\t', decls, hoisted.filter(v => used.has(v))));
    lines.push('}');
    funcs.push({ pc, name: f.name, text: lines.join('\n'), irreducible, f, body, names, calls: callMap.get(pc)! });
  }
  const instructions = [...sem.ixNames].filter(([pc]) => built.has(pc)).map(([pc, name]) => {
    const d = opts.idl?.instructions.find(i => i.name === name);
    return { name, pc, disc: d?.disc ?? sem.discOf(name), args: d?.args, accounts: d?.accounts, strAccounts: strAccounts.get(pc) };
  });
  const processors = [...sem.processors].filter(([pc]) => built.has(pc)).map(([pc, names]) => ({ fn: p.funcs.get(pc)!.name, names }));
  const res: Result = { program: p, funcs, stubs, instructions, processors, anchor: sem.anchor, libCount: [...libs.values()].filter(l => l.lib).length, text: '', views };
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

function invokeAbi(sys: string): 'c' | 'rust' | 'pda_find' | 'pda_create' | null {
  return sys === 'sol_invoke_signed_c' ? 'c' : sys === 'sol_invoke_signed_rust' ? 'rust'
    : sys === 'sol_try_find_program_address' ? 'pda_find' : sys === 'sol_create_program_address' ? 'pda_create' : null;
}

/** PDA derivation functions by name: Pubkey::find/create_program_address (out first), thin syscall wrappers (syscall order). */
function pdaAbi(name: string): 'pda_find' | 'pda_create' | 'pda_find_out' | 'pda_create_out' | undefined {
  if (/^Pubkey_find_program_address(_[0-9a-f]+)?$/.test(name)) return 'pda_find_out';
  if (/^Pubkey_create_program_address(_[0-9a-f]+)?$/.test(name)) return 'pda_create_out';
  return undefined;
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

function defCount(f: VarFunc, v: number): number {
  let n = 0;
  for (const b of f.blocks) for (const s of b.stmts) if ((s.k === 'set' || s.k === 'call') && s.dst === v) n++;
  return n;
}

/**
 * The variable holding a handler's instruction data, for an argument view: a parameter (or a copy of
 * one) through which every constant-offset load fits the view's fields, touching at least two of them
 * (one when the view has a single field).
 */
function argsVar(f: VarFunc, view: string, views: Views): number | undefined {
  const v = views.map.get(view)!;
  const cands = new Set<number>();
  for (const x of f.vars) if (x.param >= 1 && x.param !== 10) cands.add(x.id);
  for (const b of f.blocks) for (const s of b.stmts) if (s.k === 'set' && s.e.k === 'var' && cands.has(s.e.id) && defCount(f, s.dst) === 1) cands.add(s.dst);
  const loads = new Map<number, [number, number][]>();
  const bad = new Set<number>();
  const visit = (e: Expr) => walkExpr(e, x => {
    if (x.k === 'var' && cands.has(x.id)) return;
    if (x.k !== 'load') return;
    const a = x.addr;
    const [id, off] = a.k === 'var' ? [a.id, 0] : a.k === 'bin' && a.op === 'add' && a.a.k === 'var' && a.b.k === 'const' ? [a.a.id, Number(BigInt.asIntN(64, a.b.v))] : [-1, 0];
    if (!cands.has(id)) return;
    let l = loads.get(id); if (!l) loads.set(id, (l = [])); l.push([off, x.size]);
  });
  for (const b of f.blocks) { for (const s of b.stmts) stmtExprs(s).forEach(visit); if (b.term.k === 'br') visit(b.term.c); else if (b.term.k === 'ret' && b.term.e) visit(b.term.e); }
  let best: number | undefined, score = 0;
  for (const [id, ls] of loads) {
    if (bad.has(id)) continue;
    const hit = new Set<string>();
    let ok = true;
    for (const [off, size] of ls) {
      const fd = v.fields.find(x => x.off <= off && off + size <= x.off + views.width(x.t));
      if (!fd || (fd.t.k === 'scalar' && (fd.off !== off || fd.t.size !== size))) { ok = false; break; }
      hit.add(fd.name);
    }
    if (ok && hit.size > score) { best = id; score = hit.size; }
  }
  return score >= Math.min(2, v.fields.length) ? best : undefined;
}

/** Known keys (program ids by name) that the 32 bytes at `ptr` are compared with somewhere in f (keyeq, memeq, memcmp-style calls). */
function keyCompares(f: VarFunc, ptr: Expr, keyAt: (a: bigint) => string | undefined): string[] {
  const out = new Set<string>();
  const name = (b: string) => KNOWN_KEYS[b] ?? `key ${b}`;
  const other = (xs: Expr[]) => (exprEq(xs[0], ptr) ? xs[1] : exprEq(xs[1], ptr) ? xs[0] : undefined);
  const visit = (e: Expr) => walkExpr(e, x => {
    if (x.k === 'fn' && x.name === 'keyeq' && exprEq(x.args[0], ptr)) out.add(name(keyB58(x.args.slice(1))));
    if ((x.k === 'fn' && x.name === 'memeq') || (x.k === 'call' && x.args.length >= 3 && x.args[2].k === 'const' && x.args[2].v === 32n)) {
      const o = other(x.args);
      const k = o?.k === 'const' ? keyAt(o.v) : undefined;
      if (k) out.add(name(k));
    }
  });
  for (const b of f.blocks) {
    for (const s of b.stmts) {
      stmtExprs(s).forEach(visit);
      if (s.k === 'call' && s.args.length >= 3 && s.args[2].k === 'const' && s.args[2].v === 32n) { const o = other(s.args); const k = o?.k === 'const' ? keyAt(o.v) : undefined; if (k) out.add(name(k)); }
    }
    if (b.term.k === 'br') visit(b.term.c);
  }
  return [...out];
}

function childLists(n: Node): Node[][] {
  return n.k === 'if' ? [n.then, n.else] : n.k === 'block' || n.k === 'loop' ? [n.body] : n.k === 'switch' ? n.cases.map(c => c.body) : [];
}

const RESERVED_TS = new Set(['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends',
  'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'typeof', 'var', 'void', 'while', 'with', 'as', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield',
  'any', 'boolean', 'constructor', 'declare', 'get', 'module', 'require', 'number', 'set', 'string', 'symbol', 'type', 'from', 'of', 'async', 'await',
  'input', 'fp', 'undef', 'state']);

/** Identifiers the output uses at the top level (functions, helpers, syscalls, types). */
let globalCache: { p: Program; ids: Set<string> } | undefined;
function globalIdents(p: Program): Set<string> {
  if (globalCache?.p === p) return globalCache.ids;
  const ids = new Set<string>([...HELPERS, 'u8', 'u16', 'u32', 'u64', 'i8', 'i16', 'i32', 'i64', 'at', 'ref', 'sized', 'Pubkey', 'bytes', 'AccountInfo', 'AccountRecord', 'Input']);
  for (const f of p.funcs.values()) ids.add(f.name);
  for (const sc of p.syscalls.values()) ids.add(sc.alias);
  for (const n of ['ld8', 'ld16', 'ld32', 'ld64', 'st8', 'st16', 'st32', 'st64', 'bswap16', 'bswap32', 'bswap64']) ids.add(n);
  globalCache = { p, ids };
  return ids;
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

/** Variables whose every definition is `x = undef` (never assigned anything else: every read is a leftover value). */
function undefOnly(ns: Node[], isParam: (v: number) => boolean): Set<number> {
  const undef = new Set<number>(), other = new Set<number>();
  const walk = (xs: Node[]) => {
    for (const n of xs) {
      if (n.k === 'stmt' && (n.s.k === 'set' || n.s.k === 'call') && n.s.dst >= 0) (n.s.k === 'set' && n.s.e.k === 'undef' ? undef : other).add(n.s.dst);
      else if (n.k === 'if') { walk(n.then); walk(n.else); }
      else if (n.k === 'block' || n.k === 'loop') walk(n.body);
      else if (n.k === 'switch') n.cases.forEach(c => walk(c.body));
      else if (n.k === 'setstate') other.add(n.v);
    }
  };
  walk(ns);
  for (const v of [...undef]) if (other.has(v) || isParam(v)) undef.delete(v);
  return undef;
}

/** Drop `x = undef` for variables never assigned anything else (reads of an unassigned variable are undef). */
function stripUndef(ns: Node[], only: Set<number>): Node[] {
  const out: Node[] = [];
  for (const n of ns) {
    if (n.k === 'stmt' && n.s.k === 'set' && n.s.e.k === 'undef' && only.has(n.s.dst)) continue;
    if (n.k === 'if') out.push({ ...n, then: stripUndef(n.then, only), else: stripUndef(n.else, only) });
    else if (n.k === 'block' || n.k === 'loop') out.push({ ...n, body: stripUndef(n.body, only) } as Node);
    else if (n.k === 'switch') out.push({ ...n, cases: n.cases.map(c => ({ ...c, body: stripUndef(c.body, only) })) });
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
