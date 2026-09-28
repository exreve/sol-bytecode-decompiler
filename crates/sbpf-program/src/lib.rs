//! Instruction decoding, function discovery, CFG construction and lifting to IR: a faithful port of
//! `src/program.ts` (same algorithms, same iteration orders).

pub mod murmur;
pub mod syscalls;

use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_elf::{parse_elf, CallReloc, Elf, Image};
use sbpf_ir::{BinOp, CallTarget, CmpOp, Ir, Node, Stmt, Term, E};
use sbpf_ir::fx::{HashMap, HashSet};
use std::sync::Arc;
use syscalls::Syscall;

#[derive(Clone, Copy, Debug)]
pub struct Insn {
    pub pc: u32,
    pub opc: u8,
    pub dst: u8,
    pub src: u8,
    pub off: i16,
    pub imm: i32,
}

/// One lifted instruction: falls through to `Next(pc)` or ends the block.
#[derive(Clone, Debug)]
pub enum Flow {
    Next(i64),
    Term(Term),
}

/// (Lifting yields at most one statement per instruction.)
#[derive(Clone, Debug)]
pub struct Lifted {
    pub stmt: Option<Stmt>,
    pub flow: Flow,
}

#[derive(Clone, Debug)]
pub struct Block {
    pub id: usize,
    pub start: i64,
    pub end: i64,
    /// expressions in the program's arena until variable recovery, then in the function's
    pub stmts: Vec<Stmt>,
    pub term: Term,
    pub succs: Vec<usize>,
    pub preds: Vec<usize>,
}

#[derive(Clone, Debug, Default)]
pub struct Pending {
    pub leaders: HashSet<i64>,
    pub sorted: Vec<i64>,
    pub calls: Vec<i64>,
}

#[derive(Clone, Debug)]
pub struct Func {
    pub pc: i64,
    pub name: String,
    /// blocks[0] is the entry
    pub blocks: Vec<Block>,
    pub block_at: IndexMap<i64, usize>,
    pub noreturn: bool,
    pub nparams: u32,
    pub extra_in: Vec<u8>,
    pub returns: bool,
    pub is_entry: bool,
    pub stack_args: Option<u32>,
    /// lazyBlocks: leaders and direct call targets until the blocks are materialized
    pub pending: Option<Pending>,
    // ---- from variable recovery on (VarFunc) ----
    /// the function's own arena: once set, the blocks' expressions live here (not in `Program::ir`)
    pub ir: Option<Ir>,
    pub vars: Vec<VarInfo>,
    /// stack slots turned into variables
    pub promoted: Option<Vec<Promoted>>,
    /// stores to the outgoing stack-argument area were turned into call arguments
    pub arg_area_elided: Option<bool>,
    /// indirect calls: argument registers holding call-clobbered garbage, by (block id, stmt index)
    pub ind_clobber: HashMap<(u32, u32), i32>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct VarInfo {
    pub id: u32,
    pub reg: i32,
    /// 1..5 for r1..r5 params, 10 for fp, 0/6..9 implicit inputs, -1 local
    pub param: i32,
    /// includes a call-clobber definition (value unknowable)
    pub undef: bool,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Promoted {
    pub off: f64,
    pub size: u8,
    pub v: u32,
}

impl Func {
    /// The arena holding the blocks' expressions.
    pub fn ir<'a>(&'a self, p: &'a Program) -> &'a Ir {
        self.ir.as_ref().unwrap_or(&p.ir)
    }
}

pub struct LazyState {
    pub lifter: Lifter,
    pub starts: Vec<u8>,
}

pub struct Program {
    pub elf: Elf,
    pub version: u32,
    pub insns: Vec<Insn>,
    pub text_vaddr: u64,
    pub funcs: IndexMap<i64, Func>,
    pub syscalls: IndexMap<String, Syscall>,
    /// pc -> symbol name
    pub symbol_names: IndexMap<i64, String>,
    /// functions whose address is materialized (callx / fn pointers)
    pub address_taken: IndexSet<i64>,
    pub lazy: Option<LazyState>,
    /// arena of the lifted IR (shared by all functions' blocks until variable recovery)
    pub ir: Ir,
}

impl Program {
    pub fn image(&self) -> Image<'_> {
        Image::new(&self.elf)
    }
}

fn jcc(i: u8) -> Option<CmpOp> {
    Some(match i {
        0x1 => CmpOp::Eq,
        0x2 => CmpOp::Ugt,
        0x3 => CmpOp::Uge,
        0x4 => CmpOp::Set,
        0x5 => CmpOp::Ne,
        0x6 => CmpOp::Sgt,
        0x7 => CmpOp::Sge,
        0xa => CmpOp::Ult,
        0xb => CmpOp::Ule,
        0xc => CmpOp::Slt,
        0xd => CmpOp::Sle,
        _ => return None,
    })
}

/// `decode(bytes, base, count)` with TS's JS-number arguments (`text.offset`, `floor(text.size / 8)`).
pub fn decode(bytes: &[u8], base: f64, count: f64) -> Result<Vec<Insn>, String> {
    // TS: `new Array(count)` throws past 2^32 - 1; DataView reads throw once an instruction extends past the buffer
    if count > u32::MAX as f64
        || (count >= 1.0 && base + (count - 1.0) * 8.0 + 8.0 > bytes.len() as f64)
    {
        return Err(sbpf_elf::OOB.into());
    }
    let (base, count) = (base as usize, count as usize);
    let mut out = Vec::with_capacity(count);
    for (i, w) in bytes[base..base + count * 8].chunks_exact(8).enumerate() {
        out.push(Insn {
            pc: i as u32,
            opc: w[0],
            dst: w[1] & 0xf,
            src: w[1] >> 4,
            off: i16::from_le_bytes([w[2], w[3]]),
            imm: i32::from_le_bytes([w[4], w[5], w[6], w[7]]),
        });
    }
    Ok(out)
}

/// What lifting reads and writes of the program (split borrows of `Program`).
pub struct Cx<'a> {
    pub insns: &'a [Insn],
    pub elf: &'a Elf,
    pub syscalls: &'a mut IndexMap<String, Syscall>,
    pub ir: &'a Ir,
}

pub struct Lifter {
    pub v: u32,
    pc_by_hash: HashMap<u32, i64>,
    /// lift() memoized per pc (see program.ts liftShared)
    pub memo: Vec<Option<Lifted>>,
    /// control flow of each memoized pc, packed for the discovery walks (Rust-only, derived from memo)
    steps: Vec<Step>,
}

/// What the leader walk needs of a lifted instruction: flow and its direct call target.
#[derive(Clone, Copy)]
struct Step {
    kind: u8, // 0: not lifted, 1: next(a), 2: jmp(a), 3: br(a, b), 4: other terminator
    a: i64,
    b: i64,
    call: i64, // direct call target, NO_CALL if none
}
const NO_CALL: i64 = i64::MIN;

impl Step {
    fn of(l: &Lifted) -> Step {
        let mut call = NO_CALL;
        if let Some(Stmt::Call {
            t: CallTarget::Fn { pc },
            ..
        }) = &l.stmt
        {
            call = *pc;
        }
        let (kind, a, b) = match &l.flow {
            Flow::Next(n) => (1, *n, 0),
            Flow::Term(Term::Jmp { to }) => (2, *to, 0),
            Flow::Term(Term::Br { t, f, .. }) => (3, *t, *f),
            Flow::Term(_) => (4, 0, 0),
        };
        Step { kind, a, b, call }
    }
}

fn register(cx: &mut Cx, sc: &Syscall) -> Arc<str> {
    cx.syscalls.insert(sc.name.clone(), sc.clone());
    Arc::from(sc.name.as_str())
}

impl Lifter {
    pub fn new(version: u32, n: usize) -> Self {
        Lifter {
            v: version,
            pc_by_hash: HashMap::default(),
            memo: vec![None; n],
            steps: vec![
                Step {
                    kind: 0,
                    a: 0,
                    b: 0,
                    call: NO_CALL
                };
                n
            ],
        }
    }

    pub fn call_target(&mut self, cx: &mut Cx, pc: i64, imm: i32) -> Option<CallTarget> {
        let n = cx.insns.len() as i64;
        if self.v >= 3 {
            let t = pc + 1 + imm as i64;
            return (t >= 0 && t < n).then_some(CallTarget::Fn { pc: t });
        }
        if let Some(rel) = cx.elf.call_reloc(pc) {
            return Some(match rel {
                CallReloc::Fn { target_pc, .. } => CallTarget::Fn { pc: *target_pc },
                CallReloc::Syscall { name } => {
                    let sc = syscalls::by_name(name)
                        .cloned()
                        .unwrap_or_else(|| syscalls::unknown_syscall(name));
                    let name = register(cx, &sc);
                    CallTarget::Sys { name, hash: 0 }
                }
            });
        }
        if imm != -1 {
            let t = pc + 1 + imm as i64;
            if t >= 0 && t < n {
                return Some(CallTarget::Fn { pc: t });
            }
        }
        // unrelocated hashed immediates (very old toolchains)
        let h = imm as u32;
        if let Some(sc) = syscalls::by_hash(h) {
            let name = register(cx, sc);
            return Some(CallTarget::Sys { name, hash: h });
        }
        if self.pc_by_hash.is_empty() {
            for i in 0..n {
                self.pc_by_hash.insert(murmur::hash_pc(i as u64), i);
            }
        }
        self.pc_by_hash.get(&h).map(|&t| CallTarget::Fn { pc: t })
    }

    pub fn lift_shared(&mut self, cx: &mut Cx, pc: i64) -> &Lifted {
        if self.memo[pc as usize].is_none() {
            let l = self.lift(cx, pc);
            self.steps[pc as usize] = Step::of(&l);
            self.memo[pc as usize] = Some(l);
        }
        self.memo[pc as usize].as_ref().unwrap()
    }

    fn step(&mut self, cx: &mut Cx, pc: i64) -> Step {
        let st = self.steps[pc as usize];
        if st.kind != 0 {
            return st;
        }
        self.lift_shared(cx, pc);
        self.steps[pc as usize]
    }

    fn syscall_by_imm(&self, cx: &mut Cx, imm: i32) -> Option<CallTarget> {
        let sc = syscalls::by_hash(imm as u32)?;
        let name = register(cx, sc);
        Some(CallTarget::Sys {
            name,
            hash: imm as u32,
        })
    }

    /// Lift a single instruction. Semantics follow agave solana-sbpf interpreter.rs exactly.
    pub fn lift(&mut self, cx: &mut Cx, pc: i64) -> Lifted {
        let ins = cx.insns[pc as usize];
        let (opc, dst, src, off, imm) = (ins.opc, ins.dst, ins.src, ins.off, ins.imm);
        let v = self.v;
        // feature matrix of agave solana-sbpf (0.25): SIMD-0173/0174 features are V2-only; V3+ has static syscalls + JMP32
        let v2 = v == 2;
        let (pqr, sx, swap_sub, no_neg, no_lddw, no_le, mov_mem) = (v2, v2, v2, v2, v2, v2, v2);
        let (static_sys, jmp32) = (v >= 3, v >= 3);
        let ir: &Ir = cx.ir;
        let d = || ir.reg(dst);
        let s = || ir.reg(src);
        let imm_s = || ir.c(imm as i64 as u64); // imm as i64 as u64
        let imm_u32 = || ir.c(imm as u32 as u64); // imm as u32 as u64
        let set = |e: E| Lifted {
            stmt: Some(Stmt::Set {
                dst: dst as i32,
                e,
                pc,
            }),
            flow: Flow::Next(pc + 1),
        };
        let ext32 = |e: E| ir.ext(!sx, 32, e); // `sign_extension()` helper of add32/sub32 (v0/v1 sign-extend!)
        let z32 = |e: E| ir.ext(false, 32, e);
        let addr = |base: E| {
            if off == 0 {
                base
            } else {
                ir.bin(BinOp::Add, base, ir.c(off as i64 as u64))
            }
        };
        let load = |size: u8| set(ir.load(size, addr(s())));
        let store = |size: u8, val: E| Lifted {
            stmt: Some(Stmt::Store {
                size,
                addr: addr(d()),
                v: val,
                pc,
            }),
            flow: Flow::Next(pc + 1),
        };
        let trap = |msg: Arc<str>| Lifted {
            stmt: None,
            flow: Flow::Term(Term::Trap { msg }),
        };
        let bad = || trap(format!("invalid instruction 0x{:x} at pc {}", opc, pc).into());
        let jmp = |cond: E| Lifted {
            stmt: None,
            flow: Flow::Term(Term::Br {
                c: cond,
                t: pc + 1 + off as i64,
                f: pc + 1,
            }),
        };
        let src32 = |is_imm: bool, u32imm: bool| {
            if is_imm {
                if u32imm {
                    imm_u32()
                } else {
                    imm_s()
                }
            } else {
                s()
            }
        };
        use BinOp::*;

        // memory ops
        if !mov_mem {
            match opc {
                0x71 => return load(1),
                0x69 => return load(2),
                0x61 => return load(4),
                0x79 => return load(8),
                0x72 => return store(1, imm_s()),
                0x6a => return store(2, imm_s()),
                0x62 => return store(4, imm_s()),
                0x7a => return store(8, imm_s()),
                0x73 => return store(1, s()),
                0x6b => return store(2, s()),
                0x63 => return store(4, s()),
                0x7b => return store(8, s()),
                _ => {}
            }
        } else {
            match opc {
                0x2c => return load(1),
                0x3c => return load(2),
                0x8c => return load(4),
                0x9c => return load(8),
                0x27 => return store(1, imm_s()),
                0x37 => return store(2, imm_s()),
                0x87 => return store(4, imm_s()),
                0x97 => return store(8, imm_s()),
                0x2f => return store(1, s()),
                0x3f => return store(2, s()),
                0x8f => return store(4, s()),
                0x9f => return store(8, s()),
                _ => {}
            }
        }
        if opc == 0x18 && !no_lddw {
            let Some(hi) = cx.insns.get(pc as usize + 1) else {
                return bad();
            };
            let val = ((hi.imm as u32 as u64) << 32) | imm as u32 as u64;
            return Lifted {
                stmt: Some(Stmt::Set {
                    dst: dst as i32,
                    e: ir.c(val),
                    pc,
                }),
                flow: Flow::Next(pc + 2),
            };
        }

        match opc {
            // ---- ALU32 ----
            0x04 => return set(ext32(ir.bin(Add, d(), imm_s()))),
            0x0c => return set(ext32(ir.bin(Add, d(), s()))),
            0x14 => {
                return set(if swap_sub {
                    ext32(ir.bin(Sub, imm_s(), d()))
                } else {
                    ext32(ir.bin(Sub, d(), imm_s()))
                })
            }
            0x1c => return set(ext32(ir.bin(Sub, d(), s()))),
            0x24 if !pqr => return set(ir.ext(true, 32, ir.bin(Mul, d(), imm_s()))),
            0x2c if !pqr => return set(ir.ext(true, 32, ir.bin(Mul, d(), s()))),
            0x34 if !pqr => return set(ir.bin(Udiv, z32(d()), imm_u32())),
            0x3c if !pqr => return set(ir.bin(Udiv, z32(d()), z32(s()))),
            0x44 => return set(z32(ir.bin(Or, d(), imm_s()))),
            0x4c => return set(z32(ir.bin(Or, d(), s()))),
            0x54 => return set(z32(ir.bin(And, d(), imm_s()))),
            0x5c => return set(z32(ir.bin(And, d(), s()))),
            0x64 => return set(z32(ir.bin(Shl, d(), ir.c((imm & 31) as u64)))),
            0x6c => return set(z32(ir.bin(Shl, d(), ir.bin(And, s(), ir.c(31))))),
            0x74 => return set(ir.bin(Lshr, z32(d()), ir.c((imm & 31) as u64))),
            0x7c => return set(ir.bin(Lshr, z32(d()), ir.bin(And, s(), ir.c(31)))),
            0x84 if !no_neg => return set(z32(ir.mk(Node::Neg(d())))),
            0x94 if !pqr => return set(ir.bin(Urem, z32(d()), imm_u32())),
            0x9c if !pqr => return set(ir.bin(Urem, z32(d()), z32(s()))),
            0xa4 => return set(z32(ir.bin(Xor, d(), imm_s()))),
            0xac => return set(z32(ir.bin(Xor, d(), s()))),
            0xb4 => return set(imm_u32()),
            0xbc => return set(if sx { ir.ext(true, 32, s()) } else { z32(s()) }),
            0xc4 => {
                return set(z32(ir.bin(
                    Ashr,
                    ir.ext(true, 32, d()),
                    ir.c((imm & 31) as u64),
                )))
            }
            0xcc => {
                return set(z32(ir.bin(
                    Ashr,
                    ir.ext(true, 32, d()),
                    ir.bin(And, s(), ir.c(31)),
                )))
            }
            0xd4 if !no_le => {
                return match imm {
                    16 => set(ir.ext(false, 16, d())),
                    32 => set(z32(d())),
                    64 => set(d()),
                    _ => trap("invalid le width".into()),
                }
            }
            0xdc => {
                return match imm {
                    16 | 32 | 64 => set(ir.mk(Node::Bswap {
                        bits: imm as u8,
                        a: d(),
                    })),
                    _ => trap("invalid be width".into()),
                }
            }
            // ---- ALU64 ----
            0x07 => return set(ir.bin(Add, d(), imm_s())),
            0x0f => return set(ir.bin(Add, d(), s())),
            0x17 => {
                return set(if swap_sub {
                    ir.bin(Sub, imm_s(), d())
                } else {
                    ir.bin(Sub, d(), imm_s())
                })
            }
            0x1f => return set(ir.bin(Sub, d(), s())),
            0x27 if !pqr => return set(ir.bin(Mul, d(), imm_s())),
            0x2f if !pqr => return set(ir.bin(Mul, d(), s())),
            0x37 if !pqr => return set(ir.bin(Udiv, d(), imm_s())),
            0x3f if !pqr => return set(ir.bin(Udiv, d(), s())),
            0x47 => return set(ir.bin(Or, d(), imm_s())),
            0x4f => return set(ir.bin(Or, d(), s())),
            0x57 => return set(ir.bin(And, d(), imm_s())),
            0x5f => return set(ir.bin(And, d(), s())),
            0x67 => return set(ir.bin(Shl, d(), ir.c((imm & 63) as u64))),
            0x6f => return set(ir.bin(Shl, d(), s())),
            0x77 => return set(ir.bin(Lshr, d(), ir.c((imm & 63) as u64))),
            0x7f => return set(ir.bin(Lshr, d(), s())),
            0x87 if !no_neg => return set(ir.mk(Node::Neg(d()))),
            0x97 if !pqr => return set(ir.bin(Urem, d(), imm_s())),
            0x9f if !pqr => return set(ir.bin(Urem, d(), s())),
            0xa7 => return set(ir.bin(Xor, d(), imm_s())),
            0xaf => return set(ir.bin(Xor, d(), s())),
            0xb7 => return set(imm_s()),
            0xbf => return set(s()),
            0xc7 => return set(ir.bin(Ashr, d(), ir.c((imm & 63) as u64))),
            0xcf => return set(ir.bin(Ashr, d(), s())),
            0xf7 if no_lddw => return set(ir.bin(Or, d(), ir.c((imm as u32 as u64) << 32))),
            _ => {}
        }
        if pqr {
            let is64 = opc & 0x10 != 0;
            let is_imm = opc & 0x08 == 0;
            if opc & 0x07 == 0x06 {
                let op = opc & 0xe0;
                let sv = src32(is_imm, op == 0x20 || op == 0x40 || op == 0x60); // uhmul/udiv/urem take imm as u32
                let bop = match op {
                    0x20 => Some(Uhmul),
                    0x40 => Some(Udiv),
                    0x60 => Some(Urem),
                    0x80 => Some(Mul),
                    0xa0 => Some(Shmul),
                    0xc0 => Some(Sdiv),
                    0xe0 => Some(Srem),
                    _ => None,
                };
                if let Some(bop) = bop {
                    if is64 {
                        return set(ir.bin(bop, d(), sv));
                    }
                    match bop {
                        Mul => return set(z32(ir.bin(Mul, d(), sv))),
                        Udiv | Urem => {
                            return set(ir.bin(bop, z32(d()), if is_imm { sv } else { z32(sv) }))
                        }
                        Sdiv => return set(ir.bin(Sdiv32, d(), sv)),
                        Srem => return set(ir.bin(Srem32, d(), sv)),
                        _ => {}
                    }
                }
            }
        }

        // ---- jumps / calls ----
        if opc == 0x05 {
            return Lifted {
                stmt: None,
                flow: Flow::Term(Term::Jmp {
                    to: pc + 1 + off as i64,
                }),
            };
        }
        let jc = jcc(opc >> 4);
        if let Some(jc) = jc {
            if opc & 0x07 == 0x05 {
                return jmp(ir.cmp(jc, d(), if opc & 0x08 != 0 { s() } else { imm_s() }));
            }
            if jmp32 && opc & 0x07 == 0x06 {
                let signed = matches!(jc, CmpOp::Sgt | CmpOp::Sge | CmpOp::Slt | CmpOp::Sle);
                let w = |e: E| ir.ext(signed, 32, e);
                return jmp(ir.cmp(jc, w(d()), w(if opc & 0x08 != 0 { s() } else { imm_s() })));
            }
        }
        if opc == 0x85 {
            if static_sys {
                if src == 0 {
                    return match self.syscall_by_imm(cx, imm) {
                        Some(t) => self.call(cx, pc, t),
                        None => trap(format!("unknown syscall 0x{:x}", imm as u32).into()),
                    };
                }
                let tp = pc + 1 + imm as i64;
                if src == 1 && tp >= 0 && tp < cx.insns.len() as i64 {
                    return self.call(cx, pc, CallTarget::Fn { pc: tp });
                }
                return bad();
            }
            return match self.call_target(cx, pc, imm) {
                Some(t) => self.call(cx, pc, t),
                None => trap(format!("unresolved call imm={} at pc {}", imm, pc).into()),
            };
        }
        if opc == 0x8d {
            let reg: i64 = if v == 2 {
                src as i64
            } else if v >= 3 {
                dst as i64
            } else {
                imm as i64
            };
            if !(0..=10).contains(&reg) {
                return bad();
            }
            // target pc = (reg - text_vaddr) / 8, dispatched at runtime
            return self.call(
                cx,
                pc,
                CallTarget::Ind {
                    e: ir.reg(reg as u8),
                },
            );
        }
        if opc == 0x95 {
            return Lifted {
                stmt: None,
                flow: Flow::Term(Term::Ret { e: Some(ir.reg(0)) }),
            };
        }
        bad()
    }

    fn call(&self, cx: &mut Cx, pc: i64, t: CallTarget) -> Lifted {
        let ir = cx.ir;
        let mut args: Vec<E> = (1..=5).map(|r| ir.reg(r)).collect();
        let mut noreturn = false;
        if let CallTarget::Sys { name, .. } = &t {
            let sc = &cx.syscalls[&**name];
            args.truncate(sc.params.len());
            noreturn = sc.noreturn;
        }
        let st = Stmt::Call {
            dst: 0,
            t,
            args: ir.list(args),
            pc,
            extra: None,
        };
        if noreturn {
            return Lifted {
                stmt: Some(st),
                flow: Flow::Term(Term::Trap { msg: "".into() }),
            };
        }
        Lifted {
            stmt: Some(st),
            flow: Flow::Next(pc + 1),
        }
    }
}

/// Symbol names by pc: function symbols inside the text (first one wins).
pub fn symbol_names(elf: &Elf) -> IndexMap<i64, String> {
    let t = elf.text();
    let mut out = IndexMap::default();
    for s in elf.dynsyms.iter().chain(elf.symbols.iter()) {
        if s.ty == 2 && s.value >= t.addr && s.value < t.addr + t.size && !s.name.is_empty() {
            let pc = (s.value - t.addr) / 8.0;
            if pc.fract() == 0.0 {
                out.entry(pc as i64).or_insert_with(|| s.name.clone());
            }
        }
    }
    out
}

/// `lazy_blocks` (the decompiler's path): blocks are formed later (materializeBlocks); discovery keeps
/// each function's leaders and direct call targets. Otherwise every function's full CFG is formed.
pub fn load_program(bytes: &[u8], lazy_blocks: bool) -> Result<Program, String> {
    let elf = parse_elf(bytes)?;
    let mut p = prepare(elf)?;
    discover(&mut p, lazy_blocks);
    Ok(p)
}

/// loadProgram up to discovery: decode and symbol names.
pub fn prepare(elf: Elf) -> Result<Program, String> {
    let t = elf.text();
    let insns = decode(&elf.bytes, t.offset, (t.size / 8.0).floor())?;
    let symbol_names = symbol_names(&elf);
    Ok(Program {
        version: elf.version,
        text_vaddr: elf.text_vaddr,
        elf,
        insns,
        funcs: IndexMap::default(),
        syscalls: IndexMap::default(),
        symbol_names,
        address_taken: IndexSet::default(),
        lazy: None,
        ir: Ir::new(),
    })
}

/// True when `pc` begins an instruction (not the second slot of lddw).
pub fn instruction_starts(p: &Program) -> Vec<u8> {
    let n = p.insns.len();
    let mut starts = vec![0u8; n];
    let no_lddw = p.version == 2;
    let mut i = 0;
    while i < n {
        starts[i] = 1;
        if p.insns[i].opc == 0x18 && !no_lddw {
            i += 1;
        }
        i += 1;
    }
    starts
}

struct Walk<'a> {
    starts: &'a [u8],
    seen: Vec<i32>,
    lead: Vec<i32>,
}

pub fn discover(p: &mut Program, lazy: bool) {
    let mut lifter = Lifter::new(p.version, p.insns.len());
    let starts = instruction_starts(p);
    let n = p.insns.len() as i64;
    let mut entries: HashSet<i64> = HashSet::default();
    let add = |entries: &mut HashSet<i64>, pc: i64| {
        if pc >= 0 && pc < n && starts[pc as usize] != 0 {
            entries.insert(pc);
        }
    };
    if p.elf.entry_pc >= 0 {
        add(&mut entries, p.elf.entry_pc);
    }
    for &pc in p.symbol_names.keys() {
        add(&mut entries, pc);
    }
    let text_lo = p.text_vaddr as u128;
    let text_hi = text_lo + n as u128 * 8;
    let mut address_taken = IndexSet::default();
    let mut fn_ptr = |entries: &mut HashSet<i64>, v: u64| {
        let v = v as u128;
        if v >= text_lo && v < text_hi && (v - text_lo) % 8 == 0 {
            let pc = ((v - text_lo) / 8) as i64;
            add(entries, pc);
            address_taken.insert(pc);
        }
    };
    for &v in p.elf.data_pointers.values() {
        fn_ptr(&mut entries, v);
    }
    // call targets and code pointers loaded as constants
    let no_lddw = p.version == 2;
    let mut cx = Cx {
        insns: &p.insns,
        elf: &p.elf,
        syscalls: &mut p.syscalls,
        ir: &p.ir,
    };
    for i in 0..cx.insns.len() {
        if starts[i] == 0 {
            continue;
        }
        let ins = cx.insns[i];
        if ins.opc == 0x85 {
            if p.version >= 3 {
                if ins.src == 1 {
                    add(&mut entries, i as i64 + 1 + ins.imm as i64);
                }
                continue;
            }
            if let Some(CallTarget::Fn { pc }) = lifter.call_target(&mut cx, i as i64, ins.imm) {
                add(&mut entries, pc);
            }
        } else if ins.opc == 0x18 && !no_lddw && i + 1 < cx.insns.len() {
            fn_ptr(
                &mut entries,
                ((cx.insns[i + 1].imm as u32 as u64) << 32) | ins.imm as u32 as u64,
            );
        }
    }
    let mut sorted: Vec<i64> = entries.into_iter().collect();
    sorted.sort_unstable();
    let mut w = Walk {
        starts: &starts,
        seen: vec![0; n as usize],
        lead: vec![0; n as usize],
    };
    let names = Names {
        symbol_names: &p.symbol_names,
        elf: &p.elf,
    };
    let mut funcs = IndexMap::default();
    for (k, &pc) in sorted.iter().enumerate() {
        let stamp = k as i32 + 1;
        let f = if lazy {
            pending_func(&names, &mut cx, &mut lifter, &mut w, pc, stamp)
        } else {
            build_func(&names, &mut cx, &mut lifter, &mut w, pc, stamp)
        };
        funcs.insert(pc, f);
    }

    p.funcs = funcs;
    p.address_taken = address_taken;
    if lazy {
        p.lazy = Some(LazyState { lifter, starts });
    }
}

struct Leaders {
    list: Vec<i64>,
    outside: HashSet<i64>,
    calls: IndexSet<i64>,
}

/// Leaders of the function at `entry`: the entry, then every jump target reached (in walk order);
/// also the distinct direct call targets of the lifted instructions (in walk order).
fn find_leaders(cx: &mut Cx, lifter: &mut Lifter, w: &mut Walk, entry: i64, stamp: i32) -> Leaders {
    let n = cx.insns.len() as i64;
    let mut list = vec![entry];
    let mut outside = HashSet::default();
    let mut calls = IndexSet::default();
    let add_leader = |list: &mut Vec<i64>, outside: &mut HashSet<i64>, lead: &mut [i32], x: i64| {
        if x >= 0 && x < n {
            if lead[x as usize] != stamp {
                lead[x as usize] = stamp;
                list.push(x);
            }
        } else if outside.insert(x) {
            list.push(x);
        }
    };
    if entry >= 0 && entry < n {
        w.lead[entry as usize] = stamp;
    } else {
        outside.insert(entry);
    }
    let mut work = vec![entry];
    while let Some(mut pc) = work.pop() {
        loop {
            if pc < 0 || pc >= n || w.seen[pc as usize] == stamp {
                break;
            }
            w.seen[pc as usize] = stamp;
            if w.starts[pc as usize] == 0 {
                break;
            }
            let st = lifter.step(cx, pc);
            if st.call != NO_CALL {
                calls.insert(st.call);
            }
            match st.kind {
                1 => {
                    pc = st.a;
                    continue;
                }
                2 => {
                    add_leader(&mut list, &mut outside, &mut w.lead, st.a);
                    work.push(st.a);
                }
                3 => {
                    add_leader(&mut list, &mut outside, &mut w.lead, st.a);
                    work.push(st.a);
                    add_leader(&mut list, &mut outside, &mut w.lead, st.b);
                    work.push(st.b);
                }
                _ => {}
            }
            break;
        }
    }
    Leaders {
        list,
        outside,
        calls,
    }
}

/// The block starting at leader `start`, as the full CFG has it (term not yet patched to block ids).
pub fn form_block(
    lifter: &Lifter,
    starts: &[u8],
    start: i64,
    id: usize,
    is_leader: &dyn Fn(i64) -> bool,
) -> Block {
    let n = starts.len() as i64;
    let mut b = Block {
        id,
        start,
        end: start,
        stmts: vec![],
        term: Term::Trap { msg: "".into() },
        succs: vec![],
        preds: vec![],
    };
    let mut pc = start;
    loop {
        let l = if pc >= 0 && pc < n && starts[pc as usize] != 0 {
            lifter.memo[pc as usize].as_ref()
        } else {
            None
        };
        let Some(l) = l else {
            let msg = if pc >= n || pc < 0 {
                "jump outside text"
            } else {
                "jump into middle of lddw"
            };
            b.term = Term::Trap { msg: msg.into() };
            break;
        };
        if let Some(s) = &l.stmt {
            b.stmts.push(s.clone());
        }
        match &l.flow {
            Flow::Term(t) => {
                b.term = t.clone();
                b.end = pc;
                break;
            }
            Flow::Next(nx) => {
                b.end = pc;
                if is_leader(*nx) {
                    b.term = Term::Jmp { to: *nx };
                    break;
                }
                pc = *nx;
            }
        }
    }
    b
}

/// Patch jump targets from leader pcs to block ids; successors and predecessors.
pub fn link_blocks(blocks: &mut [Block], block_at: &IndexMap<i64, usize>) {
    let bid = |pc: i64| block_at[&pc] as i64;
    for b in blocks.iter_mut() {
        match &mut b.term {
            Term::Jmp { to } => {
                *to = bid(*to);
                b.succs = vec![*to as usize];
            }
            Term::Br { t, f, .. } => {
                *t = bid(*t);
                *f = bid(*f);
                b.succs = if t == f {
                    vec![*t as usize]
                } else {
                    vec![*t as usize, *f as usize]
                };
            }
            _ => {}
        }
    }
    for i in 0..blocks.len() {
        for k in 0..blocks[i].succs.len() {
            let s = blocks[i].succs[k];
            let id = blocks[i].id;
            blocks[s].preds.push(id);
        }
    }
}

pub fn func_name(p: &Program, entry: i64) -> String {
    name_of(&p.symbol_names, &p.elf, entry)
}

fn name_of(symbol_names: &IndexMap<i64, String>, elf: &Elf, entry: i64) -> String {
    if let Some(n) = symbol_names.get(&entry) {
        return n.clone();
    }
    if entry == elf.entry_pc {
        return "entrypoint".into();
    }
    // (a JS number: `(text.addr + entry * 8).toString(16)`)
    format!("fn_{:x}", (elf.text().addr + (entry * 8) as f64) as u128)
}

/// What a new function needs of the program (disjoint from the lifter's borrows).
struct Names<'a> {
    symbol_names: &'a IndexMap<i64, String>,
    elf: &'a Elf,
}

fn new_func(p: &Names, entry: i64) -> Func {
    Func {
        pc: entry,
        name: name_of(p.symbol_names, p.elf, entry),
        blocks: vec![],
        block_at: IndexMap::default(),
        noreturn: false,
        nparams: 5,
        extra_in: vec![],
        returns: true,
        is_entry: entry == p.elf.entry_pc,
        stack_args: None,
        pending: None,
        ir: None,
        vars: vec![],
        promoted: None,
        arg_area_elided: None,
        ind_clobber: HashMap::default(),
    }
}

fn sorted_leaders(list: &[i64]) -> Vec<i64> {
    let mut rest = list[1..].to_vec();
    rest.sort_unstable();
    let mut v = Vec::with_capacity(list.len());
    v.push(list[0]);
    v.extend(rest);
    v
}

fn build_func(
    p: &Names,
    cx: &mut Cx,
    lifter: &mut Lifter,
    w: &mut Walk,
    entry: i64,
    stamp: i32,
) -> Func {
    let n = cx.insns.len() as i64;
    let l = find_leaders(cx, lifter, w, entry, stamp);
    let lead = &w.lead;
    let outside = &l.outside;
    let is_leader = |x: i64| {
        if x >= 0 && x < n {
            lead[x as usize] == stamp
        } else {
            outside.contains(&x)
        }
    };
    let mut f = new_func(p, entry);
    let sorted = sorted_leaders(&l.list);
    for &ld in &sorted {
        let id = f.blocks.len();
        f.block_at.insert(ld, id);
        f.blocks
            .push(form_block(lifter, w.starts, ld, id, &is_leader));
    }
    link_blocks(&mut f.blocks, &f.block_at);
    // (the full CFG also keeps the lazy path's call list: the same walk)
    f.pending = Some(Pending {
        leaders: HashSet::default(),
        sorted: vec![],
        calls: l.calls.into_iter().collect(),
    });
    f
}

fn pending_func(
    p: &Names,
    cx: &mut Cx,
    lifter: &mut Lifter,
    w: &mut Walk,
    entry: i64,
    stamp: i32,
) -> Func {
    let l = find_leaders(cx, lifter, w, entry, stamp);
    let mut f = new_func(p, entry);
    f.pending = Some(Pending {
        sorted: sorted_leaders(&l.list),
        leaders: l.list.into_iter().collect(),
        calls: l.calls.into_iter().collect(),
    });
    f
}

/// Direct call targets anywhere in the function's full CFG (distinct, walk order).
pub fn pending_calls(f: &Func) -> &[i64] {
    &f.pending.as_ref().expect("pending").calls
}

pub fn fn_addr(p: &Program, pc: i64) -> u64 {
    p.text_vaddr.wrapping_add((pc * 8) as u64)
}

/// The lifted instruction at `pc`, if it was lifted (a walked instruction start).
fn memo_at<'a>(lz: &'a LazyState, pc: i64) -> Option<&'a Lifted> {
    let n = lz.starts.len() as i64;
    if pc >= 0 && pc < n && lz.starts[pc as usize] != 0 {
        lz.lifter.memo[pc as usize].as_ref()
    } else {
        None
    }
}

/// The program was loaded with lazyBlocks and its blocks are not formed yet.
pub fn has_pending_blocks(p: &Program) -> bool {
    p.lazy.is_some()
}

/// reachesReturn on the full CFG (program.ts reachesReturnPending): from the entry block, is a `ret`
/// reached through blocks without a call to a noreturn callee?
pub fn reaches_return_pending(p: &Program, f: &Func, noret: &dyn Fn(&Stmt) -> bool) -> bool {
    let lz = p.lazy.as_ref().expect("lazy");
    let pd = f.pending.as_ref().expect("pending");
    let mut seen: HashSet<i64> = HashSet::default();
    seen.insert(f.pc);
    let mut st = vec![f.pc];
    while let Some(mut pc) = st.pop() {
        let mut push = |x: i64, st: &mut Vec<i64>| {
            if seen.insert(x) {
                st.push(x);
            }
        };
        loop {
            let Some(l) = memo_at(lz, pc) else { break };
            if l.stmt.as_ref().is_some_and(noret) {
                break;
            }
            match &l.flow {
                Flow::Term(t) => {
                    match t {
                        Term::Ret { .. } => return true,
                        Term::Jmp { to } => push(*to, &mut st),
                        Term::Br { t, f, .. } => {
                            push(*t, &mut st);
                            push(*f, &mut st);
                        }
                        _ => {}
                    }
                    break;
                }
                Flow::Next(nx) => {
                    if pd.leaders.contains(nx) {
                        push(*nx, &mut st);
                        break;
                    }
                    pc = *nx;
                }
            }
        }
    }
    false
}

/// program.ts materializeBlocks: the full CFG's blocks that remain after cutting blocks after their
/// first noreturn call and pruning unreachable blocks. Returns (blocks, blockAt); the caller stores
/// them in the function and drops its pending state.
pub fn materialize_blocks(
    p: &Program,
    f: &Func,
    noret: &dyn Fn(&Stmt) -> bool,
) -> (Vec<Block>, IndexMap<i64, usize>) {
    let lz = p.lazy.as_ref().expect("lazy");
    let pd = f.pending.as_ref().expect("pending");
    let is_leader = |x: i64| pd.leaders.contains(&x);
    let mut formed: HashMap<i64, Option<Block>> = HashMap::default();
    let mut st = vec![f.pc];
    formed.insert(f.pc, None);
    while let Some(l) = st.pop() {
        let mut b = form_block(&lz.lifter, &lz.starts, l, usize::MAX, &is_leader);
        let i = b.stmts.iter().position(noret);
        if let Some(i) = i {
            if !(i == b.stmts.len() - 1 && matches!(b.term, Term::Trap { .. })) {
                b.stmts.truncate(i + 1);
                b.term = Term::Trap { msg: "".into() };
                formed.insert(l, Some(b));
                continue;
            }
        }
        let next: Vec<i64> = match &b.term {
            Term::Jmp { to } => vec![*to],
            Term::Br { t, f, .. } => vec![*t, *f],
            _ => vec![],
        };
        formed.insert(l, Some(b));
        for x in next {
            if let std::collections::hash_map::Entry::Vacant(e) = formed.entry(x) {
                e.insert(None);
                st.push(x);
            }
        }
    }
    let mut blocks: Vec<Block> = vec![];
    let mut block_at = IndexMap::default();
    for l in &pd.sorted {
        if let Some(Some(b)) = formed.get_mut(l) {
            let mut b = std::mem::replace(
                b,
                Block {
                    id: 0,
                    start: 0,
                    end: 0,
                    stmts: vec![],
                    term: Term::Tail,
                    succs: vec![],
                    preds: vec![],
                },
            );
            b.id = blocks.len();
            block_at.insert(*l, b.id);
            blocks.push(b);
        }
    }
    link_blocks(&mut blocks, &block_at);
    (blocks, block_at)
}
