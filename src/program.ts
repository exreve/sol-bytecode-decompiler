// Instruction decoding, function discovery, CFG construction and lifting to IR.
import { type Elf, Image, parseElf } from './elf.ts';
import { hashPc } from './murmur.ts';
import { SYSCALL_BY_HASH, SYSCALL_BY_NAME, type Syscall, unknownSyscall } from './syscalls.ts';
import { type Expr, type Stmt, type Term, type CallTarget, type BinOp, type CmpOp, B, C, CMP, R, X } from './ir.ts';

export interface Insn { pc: number; opc: number; dst: number; src: number; off: number; imm: number }

export interface Block { id: number; start: number; end: number; stmts: Stmt[]; term: Term; succs: number[]; preds: number[] }

export interface Func {
  pc: number;              // entry instruction index
  name: string;
  blocks: Block[];         // blocks[0] is the entry
  blockAt: Map<number, number>;
  noreturn: boolean;
  nparams: number;         // number of r1..r5 arguments
  extraIn: number[];       // other registers read before written (r0, r6..r9): passed implicitly
  returns: boolean;
  isEntry: boolean;
  stackArgs?: number;      // arguments 5.. passed through the caller's frame (SBF convention), see stackargs.ts
}

export interface Program {
  elf: Elf;
  version: number;
  image: Image;
  insns: Insn[];
  textVaddr: bigint;
  funcs: Map<number, Func>;
  syscalls: Map<string, Syscall>;
  symbolNames: Map<number, string>; // pc -> symbol name
  addressTaken: Set<number>;        // functions whose address is materialized (callx / fn pointers)
}

const JCC: Record<number, CmpOp> = { 0x1: 'eq', 0x2: 'ugt', 0x3: 'uge', 0x4: 'set', 0x5: 'ne', 0x6: 'sgt', 0x7: 'sge', 0xa: 'ult', 0xb: 'ule', 0xc: 'slt', 0xd: 'sle' };

export function decode(bytes: Uint8Array, base: number, count: number): Insn[] {
  const dv = new DataView(bytes.buffer, bytes.byteOffset);
  const out: Insn[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const o = base + i * 8;
    const b1 = bytes[o + 1];
    out[i] = { pc: i, opc: bytes[o], dst: b1 & 0xf, src: b1 >> 4, off: dv.getInt16(o + 2, true), imm: dv.getInt32(o + 4, true) };
  }
  return out;
}

type Lifted =
  | { stmts: Stmt[]; next: number }           // falls through to `next`
  | { stmts: Stmt[]; term: Term };            // ends the block

export class Lifter {
  p: Program;
  v: number;
  pcByHash = new Map<number, number>();
  constructor(p: Program) { this.p = p; this.v = p.version; this.memo = new Array(p.insns.length); }

  callTarget(pc: number, imm: number): CallTarget | null {
    const { elf, insns, version } = this.p;
    if (version >= 3) {
      const t = pc + 1 + imm;
      return t >= 0 && t < insns.length ? { k: 'fn', pc: t } : null;
    }
    const rel = elf.callRelocs.get(pc);
    if (rel) {
      if (rel.kind === 'fn') return { k: 'fn', pc: rel.targetPc };
      const sc = SYSCALL_BY_NAME.get(rel.name) ?? unknownSyscall(rel.name);
      this.p.syscalls.set(sc.name, sc);
      return { k: 'sys', name: sc.name, hash: 0 };
    }
    if (imm !== -1) {
      const t = pc + 1 + imm;
      if (t >= 0 && t < insns.length) return { k: 'fn', pc: t };
    }
    // unrelocated hashed immediates (very old toolchains)
    const h = imm >>> 0;
    const sc = SYSCALL_BY_HASH.get(h);
    if (sc) { this.p.syscalls.set(sc.name, sc); return { k: 'sys', name: sc.name, hash: h }; }
    if (!this.pcByHash.size) for (let i = 0; i < insns.length; i++) this.pcByHash.set(hashPc(i), i);
    const t = this.pcByHash.get(h);
    return t !== undefined ? { k: 'fn', pc: t } : null;
  }

  /**
   * lift() memoized per pc. Functions overlap heavily before noreturn calls are known (code after a
   * panic call falls through into whatever follows), so without sharing the same instructions are
   * lifted many times over. The returned statements/expressions are shared between functions:
   * nothing mutates them in place except call statements in variable recovery, and
   * inferSignatures gives every function its own copies of those (unshareCalls) before that.
   * Lifting is a pure function of the pc apart from registering syscalls, which the first lift does.
   */
  memo: (Lifted | undefined)[];
  liftShared(pc: number): Lifted {
    let l = this.memo[pc];
    if (!l) { l = this.lift(pc); this.memo[pc] = l; }
    return l;
  }

  syscallByImm(imm: number): CallTarget | null {
    const sc = SYSCALL_BY_HASH.get(imm >>> 0);
    if (!sc) return null;
    this.p.syscalls.set(sc.name, sc);
    return { k: 'sys', name: sc.name, hash: imm >>> 0 };
  }

  /** Lift a single instruction. Semantics follow agave solana-sbpf interpreter.rs exactly. */
  lift(pc: number): Lifted {
    const ins = this.p.insns[pc];
    const { opc, dst, src, off, imm } = ins;
    const v = this.v;
    // feature matrix of agave solana-sbpf (0.25): SIMD-0173/0174 features are V2-only; V3+ has static syscalls + JMP32
    const v2 = v === 2;
    const pqr = v2, sx = v2, swapSub = v2, noNeg = v2, noLddw = v2, noLe = v2, movMem = v2, staticSys = v >= 3, jmp32 = v >= 3;
    const d = R(dst), s = R(src);
    const immS = C(BigInt(imm));                 // imm as i64 as u64
    const immU32 = C(BigInt(imm >>> 0));         // imm as u32 as u64
    const set = (e: Expr): Lifted => ({ stmts: [{ k: 'set', dst, e, pc }], next: pc + 1 });
    const ext32 = (e: Expr) => X(!sx, 32, e);    // `sign_extension()` helper of add32/sub32 (v0/v1 sign-extend!)
    const z32 = (e: Expr) => X(false, 32, e);
    const addr = (base: Expr) => (off === 0 ? base : B('add', base, C(BigInt(off))));
    const load = (size: 1 | 2 | 4 | 8): Lifted => set({ k: 'load', size, addr: addr(s) });
    const store = (size: 1 | 2 | 4 | 8, val: Expr): Lifted => ({ stmts: [{ k: 'store', size, addr: addr(d), v: val, pc }], next: pc + 1 });
    const trap = (msg: string): Lifted => ({ stmts: [], term: { k: 'trap', msg } });
    const bad = () => trap(`invalid instruction 0x${opc.toString(16)} at pc ${pc}`);
    const jmp = (c: Expr): Lifted => ({ stmts: [], term: { k: 'br', c, t: pc + 1 + off, f: pc + 1 } });
    const src32 = (isImm: boolean, u32imm = false) => (isImm ? (u32imm ? immU32 : immS) : s);

    // memory ops
    if (!movMem) {
      switch (opc) {
        case 0x71: return load(1); case 0x69: return load(2); case 0x61: return load(4); case 0x79: return load(8);
        case 0x72: return store(1, immS); case 0x6a: return store(2, immS); case 0x62: return store(4, immS); case 0x7a: return store(8, immS);
        case 0x73: return store(1, s); case 0x6b: return store(2, s); case 0x63: return store(4, s); case 0x7b: return store(8, s);
      }
    } else {
      switch (opc) {
        case 0x2c: return load(1); case 0x3c: return load(2); case 0x8c: return load(4); case 0x9c: return load(8);
        case 0x27: return store(1, immS); case 0x37: return store(2, immS); case 0x87: return store(4, immS); case 0x97: return store(8, immS);
        case 0x2f: return store(1, s); case 0x3f: return store(2, s); case 0x8f: return store(4, s); case 0x9f: return store(8, s);
      }
    }
    if (opc === 0x18 && !noLddw) {
      const hi = this.p.insns[pc + 1];
      if (!hi) return bad();
      const val = (BigInt(hi.imm >>> 0) << 32n) | BigInt(imm >>> 0);
      return { stmts: [{ k: 'set', dst, e: C(val), pc }], next: pc + 2 };
    }

    switch (opc) {
      // ---- ALU32 ----
      case 0x04: return set(ext32(B('add', d, immS)));
      case 0x0c: return set(ext32(B('add', d, s)));
      case 0x14: return set(swapSub ? ext32(B('sub', immS, d)) : ext32(B('sub', d, immS)));
      case 0x1c: return set(ext32(B('sub', d, s)));
      case 0x24: if (!pqr) return set(X(true, 32, B('mul', d, immS))); break;
      case 0x2c: if (!pqr) return set(X(true, 32, B('mul', d, s))); break;
      case 0x34: if (!pqr) return set(B('udiv', z32(d), immU32)); break;
      case 0x3c: if (!pqr) return set(B('udiv', z32(d), z32(s))); break;
      case 0x44: return set(z32(B('or', d, immS)));
      case 0x4c: return set(z32(B('or', d, s)));
      case 0x54: return set(z32(B('and', d, immS)));
      case 0x5c: return set(z32(B('and', d, s)));
      case 0x64: return set(z32(B('shl', d, C(BigInt(imm & 31)))));
      case 0x6c: return set(z32(B('shl', d, B('and', s, C(31)))));
      case 0x74: return set(B('lshr', z32(d), C(BigInt(imm & 31))));
      case 0x7c: return set(B('lshr', z32(d), B('and', s, C(31))));
      case 0x84: if (!noNeg) return set(z32({ k: 'neg', a: d })); break;
      case 0x94: if (!pqr) return set(B('urem', z32(d), immU32)); break;
      case 0x9c: if (!pqr) return set(B('urem', z32(d), z32(s))); break;
      case 0xa4: return set(z32(B('xor', d, immS)));
      case 0xac: return set(z32(B('xor', d, s)));
      case 0xb4: return set(immU32);
      case 0xbc: return set(sx ? X(true, 32, s) : z32(s));
      case 0xc4: return set(z32(B('ashr', X(true, 32, d), C(BigInt(imm & 31)))));
      case 0xcc: return set(z32(B('ashr', X(true, 32, d), B('and', s, C(31)))));
      case 0xd4:
        if (noLe) break;
        if (imm === 16) return set(X(false, 16, d));
        if (imm === 32) return set(z32(d));
        if (imm === 64) return set(d);
        return trap('invalid le width');
      case 0xdc:
        if (imm === 16 || imm === 32 || imm === 64) return set({ k: 'bswap', bits: imm, a: d });
        return trap('invalid be width');
      // ---- ALU64 ----
      case 0x07: return set(B('add', d, immS));
      case 0x0f: return set(B('add', d, s));
      case 0x17: return set(swapSub ? B('sub', immS, d) : B('sub', d, immS));
      case 0x1f: return set(B('sub', d, s));
      case 0x27: if (!pqr) return set(B('mul', d, immS)); break;
      case 0x2f: if (!pqr) return set(B('mul', d, s)); break;
      case 0x37: if (!pqr) return set(B('udiv', d, immS)); break;
      case 0x3f: if (!pqr) return set(B('udiv', d, s)); break;
      case 0x47: return set(B('or', d, immS));
      case 0x4f: return set(B('or', d, s));
      case 0x57: return set(B('and', d, immS));
      case 0x5f: return set(B('and', d, s));
      case 0x67: return set(B('shl', d, C(BigInt(imm & 63))));
      case 0x6f: return set(B('shl', d, s));
      case 0x77: return set(B('lshr', d, C(BigInt(imm & 63))));
      case 0x7f: return set(B('lshr', d, s));
      case 0x87: if (!noNeg) return set({ k: 'neg', a: d }); break;
      case 0x97: if (!pqr) return set(B('urem', d, immS)); break;
      case 0x9f: if (!pqr) return set(B('urem', d, s)); break;
      case 0xa7: return set(B('xor', d, immS));
      case 0xaf: return set(B('xor', d, s));
      case 0xb7: return set(immS);
      case 0xbf: return set(s);
      case 0xc7: return set(B('ashr', d, C(BigInt(imm & 63))));
      case 0xcf: return set(B('ashr', d, s));
      case 0xf7: if (noLddw) return set(B('or', d, C(BigInt(imm >>> 0) << 32n))); break;
    }
    if (pqr) {
      const is64 = (opc & 0x10) !== 0, isImm = (opc & 0x08) === 0;
      if ((opc & 0x07) === 0x06) {
        const op = opc & 0xe0;
        const sv = src32(isImm, op === 0x20 || op === 0x40 || op === 0x60); // uhmul/udiv/urem take imm as u32
        const x32 = (a: Expr) => z32(a);
        const sx32 = (a: Expr) => X(true, 32, a);
        const opTab: Record<number, BinOp> = { 0x20: 'uhmul', 0x40: 'udiv', 0x60: 'urem', 0x80: 'mul', 0xa0: 'shmul', 0xc0: 'sdiv', 0xe0: 'srem' };
        const bop = opTab[op];
        if (bop) {
          if (is64) return set(B(bop, d, sv));
          switch (bop) {
            case 'mul': return set(x32(B('mul', d, sv)));
            case 'udiv': case 'urem': return set(B(bop, x32(d), isImm ? sv : x32(sv)));
            case 'sdiv': return set(B('sdiv32', d, sv));
            case 'srem': return set(B('srem32', d, sv));
          }
        }
      }
    }

    // ---- jumps / calls ----
    if (opc === 0x05) return { stmts: [], term: { k: 'jmp', to: pc + 1 + off } };
    const jc = JCC[opc >> 4];
    if ((opc & 0x07) === 0x05 && jc) return jmp(CMP(jc, d, (opc & 0x08) ? s : immS));
    if (jmp32 && (opc & 0x07) === 0x06 && jc) {
      const signed = jc[0] === 's' && jc !== 'set';
      const w = (e: Expr) => X(signed, 32, e);
      return jmp(CMP(jc, w(d), w((opc & 0x08) ? s : immS)));
    }
    if (opc === 0x85) {
      if (staticSys) {
        if (ins.src === 0) {
          const t = this.syscallByImm(imm);
          return t ? this.call(pc, t) : trap(`unknown syscall 0x${(imm >>> 0).toString(16)}`);
        }
        const tp = pc + 1 + imm;
        if (ins.src === 1 && tp >= 0 && tp < this.p.insns.length) return this.call(pc, { k: 'fn', pc: tp });
        return bad();
      }
      const t = this.callTarget(pc, imm);
      if (!t) return trap(`unresolved call imm=${imm} at pc ${pc}`);
      return this.call(pc, t);
    }
    if (opc === 0x8d) {
      const reg = v === 2 ? src : v >= 3 ? dst : imm;
      if (reg < 0 || reg > 10) return bad();
      // target pc = (reg - text_vaddr) / 8, dispatched at runtime
      return this.call(pc, { k: 'ind', e: R(reg) });
    }
    if (opc === 0x95) return { stmts: [], term: { k: 'ret', e: R(0) } };
    return bad();
  }

  call(pc: number, t: CallTarget): Lifted {
    const args: Expr[] = [1, 2, 3, 4, 5].map(R);
    const st: Stmt = { k: 'call', dst: 0, t, args, pc };
    if (t.k === 'sys') {
      const sc = this.p.syscalls.get(t.name)!;
      st.args = args.slice(0, sc.params.length);
      if (sc.noreturn) return { stmts: [st], term: { k: 'trap', msg: '' } };
    }
    return { stmts: [st], next: pc + 1 };
  }
}

/**
 * `lazyBlocks` (the decompiler's path): the functions' blocks are formed by inferSignatures, once
 * noreturn callees are known, and only those that remain after cutting blocks at noreturn calls
 * (see materializeBlocks). Otherwise every function's full CFG is formed here, as before.
 */
export function loadProgram(bytes: Uint8Array, opts: { lazyBlocks?: boolean } = {}): Program {
  const elf = parseElf(bytes);
  const n = Math.floor(elf.text.size / 8);
  const insns = decode(elf.bytes, elf.text.offset, n);
  const image = new Image(elf.regions);
  const symbolNames = new Map<number, string>();
  for (const s of [...elf.dynsyms, ...elf.symbols]) {
    if (s.type === 2 && s.value >= elf.text.addr && s.value < elf.text.addr + elf.text.size && s.name) {
      const pc = (s.value - elf.text.addr) / 8;
      if (Number.isInteger(pc) && !symbolNames.has(pc)) symbolNames.set(pc, s.name);
    }
  }
  const p: Program = { elf, version: elf.version, image, insns, textVaddr: elf.textVaddr, funcs: new Map(), syscalls: new Map(), symbolNames, addressTaken: new Set() };
  discover(p, !!opts.lazyBlocks);
  return p;
}

/**
 * Reachable instructions (in the functions' blocks) that are invalid under the program's declared sBPF
 * version (e_flags): e.g. v2 encodings (hor64, moved memory classes, PQR) in a binary declaring v3, as early
 * platform-tools `sbpfv3` builds emit. Their pcs.
 */
export function invalidInstructions(p: Program): number[] {
  const out = new Set<number>()
  for (const f of p.funcs.values()) for (const b of f.blocks) {
    const t = b.term
    if (t.k === 'trap' && t.msg.startsWith('invalid instruction')) out.add(Number(/at pc (\d+)/.exec(t.msg)?.[1] ?? b.end))
  }
  return [...out].sort((a, b) => a - b)
}

/** True when `pc` begins an instruction (not the second slot of lddw). */
function instructionStarts(p: Program): Uint8Array {
  const starts = new Uint8Array(p.insns.length);
  const noLddw = p.version === 2;
  for (let i = 0; i < p.insns.length; i++) {
    starts[i] = 1;
    if (p.insns[i].opc === 0x18 && !noLddw) i++;
  }
  return starts;
}

function discover(p: Program, lazy: boolean) {
  const lifter = new Lifter(p);
  const starts = instructionStarts(p);
  const entries = new Set<number>();
  const add = (pc: number) => { if (pc >= 0 && pc < p.insns.length && starts[pc]) entries.add(pc); };
  if (p.elf.entryPc >= 0) add(p.elf.entryPc);
  for (const pc of p.symbolNames.keys()) add(pc);
  const textLo = p.textVaddr, textHi = p.textVaddr + BigInt(p.insns.length * 8);
  const fnPtr = (v: bigint) => { if (v >= textLo && v < textHi && (v - textLo) % 8n === 0n) { const pc = Number((v - textLo) / 8n); add(pc); p.addressTaken.add(pc); } };
  for (const v of p.elf.dataPointers.values()) fnPtr(v);
  // call targets and code pointers loaded as constants
  const noLddw = p.version === 2;
  for (let i = 0; i < p.insns.length; i++) {
    if (!starts[i]) continue;
    const ins = p.insns[i];
    if (ins.opc === 0x85) {
      if (p.version >= 3) { if (ins.src === 1) add(i + 1 + ins.imm); continue; }
      const t = lifter.callTarget(i, ins.imm);
      if (t?.k === 'fn') add(t.pc);
    } else if (ins.opc === 0x18 && !noLddw && p.insns[i + 1]) {
      fnPtr((BigInt(p.insns[i + 1].imm >>> 0) << 32n) | BigInt(ins.imm >>> 0));
    }
  }
  const seen = new Int32Array(p.insns.length), lead = new Int32Array(p.insns.length);
  let stamp = 0;
  if (lazy) lazyState.set(p, { lifter, starts });
  for (const pc of [...entries].sort((a, b) => a - b)) p.funcs.set(pc, (lazy ? pendingFunc : buildFunc)(p, lifter, pc, starts, seen, lead, ++stamp));
}

/**
 * Leaders of the function at `entry`: the entry, then every jump target reached (in walk order).
 * seen[pc] === stamp: visited by this function (out-of-text pcs stop the walk right away);
 * lead[pc] === stamp: in-text leader of this function (out-of-text leaders are kept in `outside`).
 * `onLift` sees every lifted instruction of the walk.
 */
function findLeaders(p: Program, lifter: Lifter, entry: number, starts: Uint8Array, seen: Int32Array, lead: Int32Array, stamp: number, onLift?: (l: Lifted) => void) {
  const n = p.insns.length;
  const leaderList: number[] = [entry];
  const outside = new Set<number>();
  const addLeader = (x: number) => {
    if (x >= 0 && x < n) { if (lead[x] !== stamp) { lead[x] = stamp; leaderList.push(x); } }
    else if (!outside.has(x)) { outside.add(x); leaderList.push(x); }
  };
  if (entry >= 0 && entry < n) lead[entry] = stamp; else outside.add(entry);
  const work = [entry];
  while (work.length) {
    let pc = work.pop()!;
    while (true) {
      if (pc < 0 || pc >= n || seen[pc] === stamp) break;
      seen[pc] = stamp;
      if (!starts[pc]) break;
      const l = lifter.liftShared(pc);
      onLift?.(l);
      if ('next' in l) { pc = l.next; continue; }
      const t = l.term;
      if (t.k === 'jmp') { addLeader(t.to); work.push(t.to); }
      else if (t.k === 'br') { addLeader(t.t); work.push(t.t); addLeader(t.f); work.push(t.f); }
      break;
    }
  }
  return { leaderList, outside };
}

/** The block starting at leader `start`, as the full CFG has it (term not yet patched to block ids). */
function formBlock(p: Program, lifter: Lifter, starts: Uint8Array, start: number, id: number, isLeader: (x: number) => boolean): Block {
  const n = p.insns.length;
  const b: Block = { id, start, end: start, stmts: [], term: { k: 'trap', msg: '' }, succs: [], preds: [] };
  let pc = start;
  while (true) {
    // every pc reached here was visited (and so lifted) by the walk that found the leaders
    const l = pc >= 0 && pc < n && starts[pc] ? lifter.memo[pc] : undefined;
    if (!l) { b.term = { k: 'trap', msg: pc >= p.insns.length || pc < 0 ? 'jump outside text' : 'jump into middle of lddw' }; break; }
    for (const s of l.stmts) b.stmts.push(s);
    if ('term' in l) { b.term = { ...l.term }; b.end = pc; break; } // terminators are patched per function (block ids): never shared
    b.end = pc;
    if (isLeader(l.next)) { b.term = { k: 'jmp', to: l.next }; break; }
    pc = l.next;
  }
  return b;
}

/** Patch jump targets from leader pcs to block ids; successors and predecessors. */
function linkBlocks(blocks: Block[], blockAt: Map<number, number>) {
  const bid = (pc: number) => blockAt.get(pc)!;
  for (const b of blocks) {
    const t = b.term;
    if (t.k === 'jmp') { t.to = bid(t.to); b.succs = [t.to]; }
    else if (t.k === 'br') { t.t = bid(t.t); t.f = bid(t.f); b.succs = t.t === t.f ? [t.t] : [t.t, t.f]; }
  }
  for (const b of blocks) for (const s of b.succs) blocks[s].preds.push(b.id);
}

const funcName = (p: Program, entry: number) => p.symbolNames.get(entry) ?? (entry === p.elf.entryPc ? 'entrypoint' : `fn_${(p.elf.text.addr + entry * 8).toString(16)}`);

function buildFunc(p: Program, lifter: Lifter, entry: number, starts: Uint8Array, seen: Int32Array, lead: Int32Array, stamp: number): Func {
  // 1) find leaders via reachability
  const n = p.insns.length;
  const { leaderList, outside } = findLeaders(p, lifter, entry, starts, seen, lead, stamp);
  const isLeader = (x: number) => (x >= 0 && x < n ? lead[x] === stamp : outside.has(x));
  // 2) form blocks
  const blockAt = new Map<number, number>();
  const blocks: Block[] = [];
  const sortedLeaders = [entry, ...leaderList.slice(1).sort((a, b) => a - b)];
  for (const l of sortedLeaders) { blockAt.set(l, blocks.length); blocks.push(formBlock(p, lifter, starts, l, blocks.length, isLeader)); }
  linkBlocks(blocks, blockAt);
  return { pc: entry, name: funcName(p, entry), blocks, blockAt, noreturn: false, nparams: 5, extraIn: [], returns: true, isEntry: entry === p.elf.entryPc };
}

// ---------------- lazy CFGs (loadProgram's lazyBlocks) ----------------
//
// Before noreturn callees are known, a function's CFG runs past every panic call into whatever code
// follows (often the rest of the program): in big programs the full CFGs hold several times the
// program's code, most of which inferSignatures then cuts off (truncateNoreturn + pruneUnreachable).
// Lazily, discovery only walks each function (the same walk, so the same leaders and lifting) and
// keeps its leaders and direct call targets; inferSignatures decides noreturn with
// reachesReturnPending (the same reachability over the same blocks, followed through the lifted
// instructions instead of formed blocks), then materializeBlocks forms the blocks that the cut
// leaves, exactly as truncateNoreturn + pruneUnreachable leave the full CFG.

interface Pending { leaders: Set<number>; sorted: number[]; calls: number[] }
const pending = new WeakMap<Func, Pending>();
const lazyState = new WeakMap<Program, { lifter: Lifter; starts: Uint8Array }>();

/** The program was loaded with lazyBlocks and its blocks are not formed yet. */
export const hasPendingBlocks = (p: Program) => lazyState.has(p);

function pendingFunc(p: Program, lifter: Lifter, entry: number, starts: Uint8Array, seen: Int32Array, lead: Int32Array, stamp: number): Func {
  const calls = new Set<number>();
  const { leaderList } = findLeaders(p, lifter, entry, starts, seen, lead, stamp, l => { for (const s of l.stmts) if (s.k === 'call' && s.t.k === 'fn') calls.add(s.t.pc); });
  const f: Func = { pc: entry, name: funcName(p, entry), blocks: [], blockAt: new Map(), noreturn: false, nparams: 5, extraIn: [], returns: true, isEntry: entry === p.elf.entryPc };
  pending.set(f, { leaders: new Set(leaderList), sorted: [entry, ...leaderList.slice(1).sort((a, b) => a - b)], calls: [...calls] });
  return f;
}

/** Direct call targets anywhere in the function's full CFG (distinct). */
export function pendingCalls(f: Func): number[] { return pending.get(f)!.calls; }

/**
 * reachesReturn on the full CFG: from the entry block, is a `ret` terminator reached through blocks
 * without a call to a noreturn callee (such a block is a dead end, whatever its terminator)?
 */
export function reachesReturnPending(p: Program, f: Func, noret: (s: Stmt) => boolean): boolean {
  const { lifter, starts } = lazyState.get(p)!, pd = pending.get(f)!, n = p.insns.length;
  const seen = new Set<number>([f.pc]), st = [f.pc];
  const push = (x: number) => { if (!seen.has(x)) { seen.add(x); st.push(x); } };
  while (st.length) {
    let pc = st.pop()!;
    // the block starting at this leader (formBlock's walk)
    for (;;) {
      const l = pc >= 0 && pc < n && starts[pc] ? lifter.memo[pc] : undefined;
      if (!l) break; // trap terminator
      if (l.stmts.some(noret)) break; // dead block
      if ('term' in l) {
        const t = l.term;
        if (t.k === 'ret') return true;
        if (t.k === 'jmp') push(t.to);
        else if (t.k === 'br') { push(t.t); push(t.f); }
        break;
      }
      if (pd.leaders.has(l.next)) { push(l.next); break; }
      pc = l.next;
    }
  }
  return false;
}

/**
 * Form the function's blocks: the full CFG's blocks that remain after truncateNoreturn (a block is
 * cut after its first noreturn call, unless that call ends a block that ends in a trap, and loses
 * its successors) and pruneUnreachable (blocks no longer reachable from the entry are dropped, the
 * others renumbered in order). The remaining blocks are exactly those reached from the entry through
 * the successors of blocks as cut, so only they are formed; ids, terminators, successors, the
 * predecessors (in block order), `end` (a cut block keeps it) and blockAt come out the same.
 */
export function materializeBlocks(p: Program, f: Func, noret: (s: Stmt) => boolean) {
  const { lifter, starts } = lazyState.get(p)!, pd = pending.get(f)!;
  pending.delete(f);
  const isLeader = (x: number) => pd.leaders.has(x);
  const formed = new Map<number, Block>(); // leader -> block (id assigned below)
  const st = [f.pc];
  formed.set(f.pc, null as unknown as Block);
  while (st.length) {
    const L = st.pop()!;
    const b = formBlock(p, lifter, starts, L, -1, isLeader);
    formed.set(L, b);
    const i = b.stmts.findIndex(noret);
    if (i >= 0 && !(i === b.stmts.length - 1 && b.term.k === 'trap')) { b.stmts.length = i + 1; b.term = { k: 'trap', msg: '' }; continue; }
    const t = b.term;
    const next = t.k === 'jmp' ? [t.to] : t.k === 'br' ? [t.t, t.f] : [];
    for (const x of next) if (!formed.has(x)) { formed.set(x, null as unknown as Block); st.push(x); }
  }
  const blocks: Block[] = [];
  const blockAt = new Map<number, number>();
  for (const l of pd.sorted) { const b = formed.get(l); if (b) { b.id = blocks.length; blockAt.set(l, b.id); blocks.push(b); } }
  linkBlocks(blocks, blockAt);
  f.blocks = blocks;
  f.blockAt = blockAt;
}

/** All functions' blocks are formed: drop the lifter. */
export function endPendingBlocks(p: Program) { lazyState.delete(p); }

export function fnAddr(p: Program, pc: number): bigint { return p.textVaddr + BigInt(pc * 8); }
