//! Incident-class rules on the IR of each instruction's reachable functions (the
//! blocks its dispatch allows): introspection-unchecked, flash-repay-unbound, stale-after-cpi,
//! token2022-amount-assumed, oracle-unvalidated, signer-to-untrusted-program, rounding-favors-user; and the
//! informational fund movers.

use super::anchor::{HVal, HK};
use super::flow::*;
use super::ixctx::IxCtx;
use super::phase2::Finding;
use super::report::{Analysis, IxOut, Loc, OpOut};
use super::sources::{Source, SourceCtx};
use super::{js_slice, js_trim, An, FK};
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, CmpOp, Node, Stmt, Term, E, L};
use sbpf_program::Func;
use std::cell::{Cell, OnceCell, RefCell};
use sbpf_ir::fx::{HashMap, HashSet};
use std::rc::Rc;

#[derive(Clone, Debug)]
pub struct FundMover {
    pub instruction: String,
    pub authority: String,
    pub kind: String,
    pub from: Option<String>,
    pub at: String,
}

pub fn incident_title(rule: &str) -> &'static str {
    match rule {
        "introspection-unchecked" => "Instructions sysvar parsed without its key check, the loaded instruction's program id check, or with an index from instruction data",
        "flash-repay-unbound" => "Flash-loan introspection: the found instruction's accounts / amount are not compared with this instruction's",
        "rounding-favors-user" => "(experimental) Share math rounded in the caller's favor: up on a credit, down on a debit",
        "token2022-amount-assumed" => "Inbound transfer through a program that may be Token-2022, state credited with the input amount (no balance delta)",
        "stale-after-cpi" => "Account data read before a CPI that may write the account, used after it without re-reading (reload)",
        "signer-to-untrusted-program" => "PDA signature or a signer forwarded to a CPI whose program id is an account key no check pins",
        "oracle-unvalidated" => "Oracle (Pyth) price used without its status / staleness (/ confidence, before a value move) read",
        _ => "",
    }
}

const M64: u64 = u64::MAX;
const SYSVAR_IX_WORDS: [u64; 4] = [
    0x66d17b1817d5a706,
    0xc0c2fd5504d4da35,
    0xa57556218fc624c1,
    0x85fcbbadb,
];
const PYTH_MAGIC: u64 = 0xa1b2c3d4;
const PYTH_FIELDS: [i64; 10] = [0, 0x10, 0x14, 0x20, 0x28, 0x60, 0xd0, 0xd8, 0xe0, 0xe8];

fn l(at: &Loc) -> String {
    format!("{}:{}", at.fn_, at.line)
}

/// a sum's terms: the non-constant ones and the constant
struct Sum {
    terms: Vec<E>,
    c: u64,
}

fn sum_of(ir: &sbpf_ir::Ir, e: E) -> Sum {
    let mut s = Sum {
        terms: Vec::new(),
        c: 0,
    };
    fn go(ir: &sbpf_ir::Ir, x: E, neg: bool, s: &mut Sum) {
        match ir.get(x) {
            Node::Bin(BinOp::Add, a, b) => {
                go(ir, a, neg, s);
                go(ir, b, neg, s);
            }
            Node::Bin(BinOp::Sub, a, b) => {
                go(ir, a, neg, s);
                go(ir, b, !neg, s);
            }
            Node::Const(v) => {
                s.c = if neg {
                    s.c.wrapping_sub(v)
                } else {
                    s.c.wrapping_add(v)
                }
            }
            _ => s.terms.push(x),
        }
    }
    go(ir, e, false, &mut s);
    s
}

/// stmtExprs of the incident rules (call statements: their arguments only)
fn stmt_exprs(ir: &sbpf_ir::Ir, s: &Stmt) -> Vec<E> {
    match s {
        Stmt::Set { e, .. } | Stmt::Eval { e, .. } => vec![*e],
        Stmt::Store { addr, v, .. } => vec![*addr, *v],
        Stmt::Stores { addr, vals, .. } => {
            let mut v = vec![*addr];
            v.extend(ir.items(*vals));
            v
        }
        Stmt::Copy { dst, src, .. } => vec![*dst, *src],
        Stmt::Call { args, .. } => ir.to_vec(*args),
        _ => vec![],
    }
}

fn walk_nodes(ir: &sbpf_ir::Ir, e: E) -> Vec<(E, Node)> {
    let mut v = Vec::new();
    ir.walk(e, &mut |x, n| v.push((x, n)));
    v
}

fn is_magic_cmp(ir: &sbpf_ir::Ir, n: Node) -> bool {
    match n {
        Node::Cmp(_, a, b) => {
            matches!(ir.get(a), Node::Const(v) if v & 0xffffffff == PYTH_MAGIC)
                || matches!(ir.get(b), Node::Const(v) if v & 0xffffffff == PYTH_MAGIC)
        }
        _ => false,
    }
}

#[derive(Clone)]
struct CallAt {
    name: String,
    args: Vec<E>,
    p: Pos,
    pc: i64,
    target: Option<i64>,
}

#[derive(Default)]
struct BlockExprs {
    intro: Vec<(E, Pos)>,
    pyth: Vec<(E, Pos)>,
    div: Vec<(E, Pos)>,
    calls: Vec<CallAt>,
    magic: bool,
}

/// an instruction's function: its allowed blocks
struct Fnx<'a> {
    pc: i64,
    f: &'a Func,
    name: String,
    blocks: Vec<usize>,
}

struct Cmp {
    fi: usize,
    p: Pos,
    a: E,
    b: E,
    n: Option<u64>,
    e: E,
}

struct Intro {
    current: bool,
    sysvar: Option<String>,
    by_src: bool,
    index: Option<Vec<Source>>,
    at: Loc,
    fi: usize,
    p: Pos,
}

struct Access {
    fi: usize,
    p: Pos,
    size: u8,
    off: i64,
    base: String,
    e: E,
}

/// a finding before its title
struct F {
    rule: &'static str,
    accounts: Vec<String>,
    path: Vec<String>,
    evidence: Vec<String>,
    confidence: &'static str,
    weight: f64,
}

type DefSites = (HashMap<u32, Vec<(E, Pos)>>, HashMap<FK, Vec<(E, Pos)>>);

/// the program-wide memos (keyed by the result / functions)
#[derive(Default)]
pub struct IncMemo {
    blocks: RefCell<HashMap<(i64, usize), Rc<BlockExprs>>>,
    lines: RefCell<HashMap<(i64, Pos), String>>,
    lib_sys: RefCell<HashMap<i64, bool>>,
    magic: Cell<Option<bool>>,
    def_sites: RefCell<HashMap<i64, Rc<DefSites>>>,
    derefs: RefCell<HashMap<(i64, E), E>>,
}

/// one instruction's rule context
struct X<'a, 'x, 'y> {
    an: &'x An<'a>,
    m: &'y IncMemo,
    ix: &'y IxOut,
    ctx: &'y IxCtx<'a>,
    s: &'y SourceCtx<'a, 'x>,
    sc: Vec<Fnx<'a>>,
    cmps: OnceCell<Rc<Vec<Cmp>>>,
    calls: OnceCell<Rc<Vec<(usize, CallAt)>>>,
    state_targets: &'y [String],
}

fn value_move(o: &OpOut) -> bool {
    o.kinds
        .iter()
        .any(|k| matches!(*k, "TOKEN_TRANSFER" | "LAMPORT_TRANSFER" | "MINT"))
        || (o.has("LAMPORT_WRITE") && o.how == Some("-="))
}

fn is_signer(ix: &IxOut, acct: &str) -> bool {
    ix.accounts
        .iter()
        .find(|y| y.name == acct)
        .is_some_and(|x| x.expected.signer || x.has("signer"))
}

fn truthy(v: Option<f64>) -> bool {
    v.is_some_and(|v| v != 0.0 && !v.is_nan())
}

fn nz(s: &Option<String>) -> bool {
    s.as_deref().is_some_and(|s| !s.is_empty())
}

impl<'a> An<'a> {
    /// the Instructions sysvar id in a library function's bytecode (itself or a function it calls)
    fn lib_has_sysvar_id(&self, m: &IncMemo, pc: i64, depth: i64) -> bool {
        let k = pc * 4 + depth;
        if let Some(&v) = m.lib_sys.borrow().get(&k) {
            return v;
        }
        m.lib_sys.borrow_mut().insert(k, false);
        let p = self.p;
        let mut starts: Vec<i64> = p.funcs.keys().copied().collect();
        starts.sort();
        let end = starts
            .iter()
            .copied()
            .find(|&x| x > pc)
            .unwrap_or(p.insns.len() as i64);
        let img = p.image();
        let mut hit = false;
        let mut i = pc;
        while i < end.min(pc + 3000) && !hit {
            let x = &p.insns[i as usize];
            if x.opc == 0x18 && i + 1 < end {
                let v = (x.imm as u32 as u64) | ((p.insns[i as usize + 1].imm as u32 as u64) << 32);
                if SYSVAR_IX_WORDS.contains(&v) {
                    hit = true;
                } else if v > 0xffffffff && v < 0x200000000 {
                    if let Some(b) = img.bytes_at(v, 32) {
                        if SYSVAR_IX_WORDS.iter().enumerate().all(|(j, &w)| {
                            b[8 * j..8 * j + 8]
                                .iter()
                                .enumerate()
                                .fold(0u64, |a, (q, &y)| a | ((y as u64) << (8 * q)))
                                == w
                        }) {
                            hit = true;
                        }
                    }
                }
            } else if x.opc == 0x85 && depth > 0 && x.src == 1 {
                let t = i + 1 + x.imm as i64;
                if p.funcs.contains_key(&t) && t != pc && self.lib_has_sysvar_id(m, t, depth - 1) {
                    hit = true;
                }
            }
            i += 1;
        }
        m.lib_sys.borrow_mut().insert(k, hit);
        hit
    }

    fn inc_block(&self, m: &IncMemo, pc: i64, f: &Func, b: usize) -> Rc<BlockExprs> {
        if let Some(x) = m.blocks.borrow().get(&(pc, b)) {
            return x.clone();
        }
        let ir = fir(f);
        let mut o = BlockExprs::default();
        let name_of = |t: &CallTarget| match t {
            CallTarget::Sys { name, .. } => name.to_string(),
            CallTarget::Fn { pc } => self.pname(*pc),
            _ => String::new(),
        };
        let add = |o: &mut BlockExprs, x: E, n: Node, p: Pos| match n {
            Node::Load { size, addr } => {
                let s = sum_of(ir, addr);
                if size == 2 && s.terms.len() == 2 && (s.c == M64 - 1 || s.c == 2) {
                    o.intro.push((x, p));
                }
                let off = if s.c > 0xffff { -1 } else { s.c as i64 };
                if PYTH_FIELDS.contains(&off) && !s.terms.is_empty() && s.terms.len() <= 2 {
                    o.pyth.push((x, p));
                }
            }
            Node::Bin(BinOp::Udiv | BinOp::Sdiv, _, _) => o.div.push((x, p)),
            _ => {}
        };
        let bl = &f.blocks[b];
        for (i, s) in bl.stmts.iter().enumerate() {
            let c: Option<E> = match s {
                Stmt::Set { e, .. } | Stmt::Eval { e, .. }
                    if matches!(ir.get(*e), Node::Call(..)) =>
                {
                    Some(*e)
                }
                _ => None,
            };
            let p = pos_of(b, i);
            if let Stmt::Call { t, args, pc, .. } = s {
                o.calls.push(CallAt {
                    name: name_of(t),
                    args: ir.to_vec(*args),
                    p,
                    pc: *pc,
                    target: match t {
                        CallTarget::Fn { pc } => Some(*pc),
                        _ => None,
                    },
                });
            }
            for e in stmt_exprs(ir, s) {
                for (x, n) in walk_nodes(ir, e) {
                    add(&mut o, x, n, p);
                    if let (Node::Call(ti, args), false) = (n, Some(x) == c) {
                        let t = ir.target(ti);
                        o.calls.push(CallAt {
                            name: name_of(&t),
                            args: ir.to_vec(args),
                            p,
                            pc: stmt_pc(s),
                            target: match t {
                                CallTarget::Fn { pc } => Some(pc),
                                _ => None,
                            },
                        });
                    } else if !o.magic && is_magic_cmp(ir, n) {
                        o.magic = true;
                    }
                }
            }
        }
        let (t, br) = match &bl.term {
            Term::Ret { e } => (*e, false),
            Term::Br { c, .. } => (Some(*c), true),
            _ => (None, false),
        };
        if let Some(t) = t {
            let p = pos_of(b, bl.stmts.len());
            for (x, n) in walk_nodes(ir, t) {
                add(&mut o, x, n, p);
                if let Node::Call(ti, args) = n {
                    let t = ir.target(ti);
                    o.calls.push(CallAt {
                        name: name_of(&t),
                        args: ir.to_vec(args),
                        p,
                        pc: -1,
                        target: match t {
                            CallTarget::Fn { pc } => Some(pc),
                            _ => None,
                        },
                    });
                } else if br && !o.magic && is_magic_cmp(ir, n) {
                    o.magic = true;
                }
            }
        }
        let o = Rc::new(o);
        m.blocks.borrow_mut().insert((pc, b), o.clone());
        o
    }

    /// the program compares a word with the Pyth magic somewhere
    fn pyth_aware(&self, m: &IncMemo) -> bool {
        if let Some(v) = m.magic.get() {
            return v;
        }
        let v = self
            .funcs
            .iter()
            .any(|fo| (0..fo.f.blocks.len()).any(|b| self.inc_block(m, fo.pc, fo.f, b).magic));
        m.magic.set(Some(v));
        v
    }

    fn inc_def_sites(&self, m: &IncMemo, pc: i64, f: &Func, d: &Defs<'a>) -> Rc<DefSites> {
        if let Some(x) = m.def_sites.borrow().get(&pc) {
            return x.clone();
        }
        let mut sets: HashMap<u32, Vec<(E, Pos)>> = HashMap::default();
        let mut stores: HashMap<FK, Vec<(E, Pos)>> = HashMap::default();
        for (bi, b) in f.blocks.iter().enumerate() {
            for (i, st) in b.stmts.iter().enumerate() {
                match st {
                    Stmt::Set { dst, e, .. } => sets
                        .entry(*dst as u32)
                        .or_default()
                        .push((*e, pos_of(bi, i))),
                    Stmt::Store {
                        size: 8, addr, v, ..
                    } => {
                        if let Some(o) = d.fp_off(*addr) {
                            stores
                                .entry(FK::of(o))
                                .or_default()
                                .push((*v, pos_of(bi, i)));
                        }
                    }
                    _ => {}
                }
            }
        }
        let r = Rc::new((sets, stores));
        m.def_sites.borrow_mut().insert(pc, r.clone());
        r
    }

    /// incidentFindings: the incident rules' findings; a signer-to-untrusted-program finding on a CPI
    /// cpi-unchecked-program already reports is merged into it (`prior` mutated in place)
    pub fn incident_findings<'x>(
        &'x self,
        a: &Analysis,
        infos: &'x [super::ixctx::IxInfo<'a>],
        srcs: &'x [OnceCell<SourceCtx<'a, 'x>>],
        prior: &mut [Finding],
        m: &IncMemo,
    ) -> Vec<Finding> {
        let mut out: Vec<Finding> = Vec::new();
        let state_targets: Vec<String> = a.state_writes.iter().map(|(t, _)| t.clone()).collect();
        for ix in &a.ixs {
            let ii = ix.info;
            let s = srcs[ii].get_or_init(|| self.source_ctx(&infos[ii]));
            let ctx: &IxCtx<'a> = &infos[ii].ctx;
            let x = X {
                an: self,
                m,
                ix,
                ctx,
                s,
                sc: self.inc_scope(ctx),
                cmps: OnceCell::new(),
                calls: OnceCell::new(),
                state_targets: &state_targets,
            };
            for rule in 0..6 {
                let fs = match rule {
                    0 => x.introspection(),
                    1 => x.rounding(),
                    2 => x.token2022_amount(),
                    3 => x.stale_after_cpi(),
                    4 => x.signer_forward(),
                    _ => x.oracle(),
                };
                for f in fs {
                    let sfwd = f.rule == "signer-to-untrusted-program";
                    let same = if sfwd {
                        prior.iter().position(|y| {
                            y.rule == "cpi-unchecked-program"
                                && y.ix == ix.name
                                && y.path.first() == f.path.first()
                        })
                    } else {
                        None
                    };
                    if same.is_none()
                        && sfwd
                        && prior
                            .iter()
                            .any(|y| y.rule == "cpi-unchecked-program" && y.ix == ix.name)
                    {
                        continue;
                    }
                    if let Some(si) = same {
                        let y = &mut prior[si];
                        if f.confidence == "high" {
                            y.confidence = "high";
                        }
                        y.evidence.push(format!(
                            "signer-to-untrusted-program: {}",
                            f.evidence.get(2).map_or("", |s| s.as_str())
                        ));
                        let mut acc: IndexSet<String> = y.accounts.iter().cloned().collect();
                        acc.extend(f.accounts.iter().cloned());
                        y.accounts = acc.into_iter().collect();
                    } else {
                        out.push(Finding {
                            rule: f.rule,
                            title: incident_title(f.rule),
                            ix: ix.name.clone(),
                            accounts: f.accounts,
                            path: f.path,
                            evidence: f.evidence,
                            confidence: f.confidence,
                            weight: f.weight,
                        });
                    }
                }
            }
        }
        out
    }

    /// the instruction's code: the handler and the functions it reaches, with their allowed reachable blocks
    fn inc_scope(&self, ctx: &IxCtx<'a>) -> Vec<Fnx<'a>> {
        let mut s = Vec::new();
        for pc in std::iter::once(ctx.handler).chain(ctx.parents.keys().copied()) {
            let Some(fo) = self.fo(pc) else { continue };
            let g = self.cfg(pc);
            let blocks = (0..fo.f.blocks.len())
                .filter(|&b| g.rpo[b] >= 0 && ctx.allowed(pc, b) != Some(false))
                .collect();
            s.push(Fnx {
                pc,
                f: fo.f,
                name: fo.name.clone(),
                blocks,
            });
        }
        s
    }

    /// fundMovers: per instruction that can move program-controlled funds, the authority gating it
    pub fn fund_movers<'x>(
        &'x self,
        a: &Analysis,
        infos: &'x [super::ixctx::IxInfo<'a>],
    ) -> Vec<FundMover> {
        let mut out = Vec::new();
        for ix in &a.ixs {
            if ix.name.starts_with("idl_") {
                continue;
            }
            let ctx: &IxCtx<'a> = &infos[ix.info].ctx;
            let derives = ix.ops.iter().any(|o| {
                o.has("PDA_DERIVE")
                    && !o
                        .pda
                        .as_ref()
                        .is_some_and(|p| p.fn_.contains("create_program_address"))
            }) || a.pdas.iter().any(|p| p.derived_in.contains(&ix.name));
            let moves: Vec<usize> = (0..ix.ops.len())
                .filter(|&i| {
                    let o = &ix.ops[i];
                    if o.anchor_close || o.has("ACCOUNT_CREATE") {
                        return false;
                    }
                    if o.has("LAMPORT_WRITE") && o.how == Some("-=") {
                        return true;
                    }
                    if !o
                        .kinds
                        .iter()
                        .any(|k| *k == "TOKEN_TRANSFER" || *k == "BURN")
                    {
                        return false;
                    }
                    self.inc_signs(ctx, o)
                        || (derives
                            && o.cpi(|c| c.accounts.is_empty()).unwrap_or(true)
                            && !o.cpi(|c| nz(&c.seeds)).unwrap_or(false)
                            && !o.has("PDA_SIGNATURE"))
                })
                .collect();
            let Some(&oi) = moves.first() else { continue };
            let o = &ix.ops[oi];
            let row = ix
                .authority
                .as_ref()
                .and_then(|r| r.iter().find(|x| x.op == oi));
            let mut signers: Vec<String> = Vec::new();
            for e in row.map_or(&[][..], |r| &r.enabled_by[..]) {
                if e.kind == "signer" && e.status != Some("not_found") && !signers.contains(&e.what)
                {
                    signers.push(e.what.clone());
                }
            }
            if signers.is_empty() {
                signers = ix
                    .accounts
                    .iter()
                    .filter(|x| x.has("signer"))
                    .map(|x| x.name.clone())
                    .collect();
            }
            let gate = |s: &str| {
                let pre = format!("{s}.key ==");
                let stored: Vec<String> = row
                    .map_or(&[][..], |r| &r.enabled_by[..])
                    .iter()
                    .filter(|e| e.kind == "stored" && e.what.starts_with(&pre))
                    .map(|e| {
                        let i = e.what.find("==").map_or(0, |i| i + 3);
                        e.what.get(i..).unwrap_or("").to_string()
                    })
                    .collect();
                let addr = ix
                    .accounts
                    .iter()
                    .find(|x| x.name == s)
                    .and_then(|x| x.constraints.get("address"));
                format!(
                    "{s} (signer{})",
                    if !stored.is_empty() {
                        format!("; == {}", stored.join(", "))
                    } else if addr.is_some_and(|a| a.status != "not_found") {
                        "; constant key".to_string()
                    } else {
                        String::new()
                    }
                )
            };
            let anon = ix.checks.iter().any(|c| c.kinds.contains(&"signer"));
            let authority = if !signers.is_empty() {
                signers
                    .iter()
                    .map(|s| gate(s))
                    .collect::<Vec<_>>()
                    .join(" + ")
            } else if anon {
                "a signer (account not identified; see the checks)".to_string()
            } else {
                "none (no signer check found)".to_string()
            };
            let kind = if o.has("LAMPORT_WRITE") {
                "lamports debited".to_string()
            } else {
                format!(
                    "{} {}",
                    if o.has("BURN") {
                        "token burn"
                    } else {
                        "token transfer"
                    },
                    if self.inc_signs(ctx, o) {
                        "signed by a PDA"
                    } else {
                        "(a PDA derived here; signer seeds not decoded)"
                    }
                )
            };
            let from = if o.has("LAMPORT_WRITE") {
                o.target
                    .as_ref()
                    .map(|t| t.split('.').next().unwrap_or("").to_string())
            } else {
                o.cpi(|c| {
                    c.accounts
                        .iter()
                        .find(|x| matches!(x.role.as_deref(), Some("source") | Some("account")))
                        .map(|x| x.text.strip_prefix('*').unwrap_or(&x.text).to_string())
                })
                .flatten()
            };
            out.push(FundMover {
                instruction: ix.name.clone(),
                authority,
                kind,
                from: from.filter(|f| ix.accounts.iter().any(|x| &x.name == f)),
                at: l(&o.at),
            });
        }
        out
    }

    /// signs: the program signs the CPI (signer seeds, a PDA signature); not when the seeds are a parameter
    /// slice whose length the instruction's call path passes as 0
    fn inc_signs(&self, ctx: &IxCtx<'a>, o: &OpOut) -> bool {
        let seeds = o.cpi(|c| c.seeds.clone()).flatten();
        if !nz(&seeds) && !o.has("PDA_SIGNATURE") {
            return false;
        }
        let m = crate::jre!(r"^p(\d+)\[\.\.p(\d+)\]$")
            .captures(seeds.as_deref().unwrap_or(""))
            .map(|m| m[2].to_string());
        let fo = o.fn_pc.and_then(|pc| self.fo(pc));
        let (Some(m), Some(fo)) = (m, fo) else {
            return true;
        };
        let n: i32 = m.parse().unwrap_or(i32::MAX);
        let fpc = o.fn_pc.unwrap();
        let Some(v) = fo.f.vars.iter().find(|x| {
            if n >= 5 {
                x.param == 100 + n - 5
            } else {
                x.param == n
            }
        }) else {
            return true;
        };
        let ir = fir(fo.f);
        if self.value_key(Some(ctx), fpc, ir.var(v.id), 0, 0) == "#0" {
            return false;
        }
        if let Some(par) = ctx.parents.get(&fpc) {
            if par.pc.is_none() {
                if let Some(ret) = par.ret {
                    let pf = self.fo(par.fn_).map(|f| fir(f.f));
                    if let Some(pir) = pf {
                        if let Node::Call(_, args) = pir.get(ret) {
                            let j = if v.param >= 100 {
                                4 + v.param - 100
                            } else {
                                v.param - 1
                            };
                            let x = if j >= 0 && (j as u32) < args.len {
                                Some(pir.at(args, j as u32))
                            } else {
                                None
                            };
                            let q = self.pos_at(par.fn_, None, Some(ret));
                            if let (Some(x), Some(q)) = (x, q) {
                                if self.value_key(Some(ctx), par.fn_, x, q, 0) == "#0" {
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        }
        true
    }
}

impl<'a, 'x, 'y> X<'a, 'x, 'y> {
    fn src(&self, fn_: i64, e: E, p: Pos) -> Vec<Source> {
        self.s.of(fn_, e, p)
    }
    fn ir_of(&self, fn_: i64) -> Option<&'a sbpf_ir::Ir> {
        self.an.fo(fn_).map(|f| fir(f.f))
    }
    fn ld8(&self, fn_: i64, e: E) -> Option<E> {
        self.ir_of(fn_).map(|ir| ir.load(8, e))
    }
    fn deref(&self, fn_: i64, e: E) -> Option<E> {
        if let Some(&x) = self.m.derefs.borrow().get(&(fn_, e)) {
            return Some(x);
        }
        let x = self.ld8(fn_, e)?;
        self.m.derefs.borrow_mut().insert((fn_, e), x);
        Some(x)
    }
    fn vk(&self, fn_: i64, e: E, p: Pos) -> String {
        self.an.value_key(Some(self.ctx), fn_, e, p, 0)
    }
    fn loc_at(&self, pc: i64, f: &Func, name: &str, p: Pos) -> Loc {
        let facts = self.an.facts.borrow();
        let ff = facts.get(&pc);
        let bl = f.blocks.get((p >> 16) as usize);
        let i = (p & 0xffff) as usize;
        let s = bl.and_then(|bl| bl.stmts.get(i).or(bl.stmts.last()));
        let cl = match bl {
            Some(bl) if i >= bl.stmts.len() => match &bl.term {
                Term::Br { c, .. } => ff.and_then(|ff| ff.cond_line.get(c).copied()),
                _ => None,
            },
            _ => None,
        };
        let line = cl
            .or_else(|| s.and_then(|s| ff.and_then(|ff| ff.pc_line.get(&stmt_pc(s)).copied())))
            .unwrap_or_else(|| ff.map_or(0, |ff| ff.at as i64 + 1));
        Loc {
            fn_: ff.map_or_else(|| name.to_string(), |ff| ff.name.clone()),
            line,
            pc: s.map(stmt_pc),
        }
    }
    fn loc_of(&self, fi: usize, p: Pos) -> Loc {
        let f = &self.sc[fi];
        self.loc_at(f.pc, f.f, &f.name, p)
    }
    fn line_at(&self, pc: i64, f: &Func, name: &str, p: Pos) -> String {
        if let Some(y) = self.m.lines.borrow().get(&(pc, p)) {
            return y.clone();
        }
        let at = self.loc_at(pc, f, name, p);
        let y = {
            let facts = self.an.facts.borrow();
            let t = facts
                .get(&pc)
                .and_then(|ff| {
                    if at.line >= 1 {
                        ff.lines.get(at.line as usize - 1)
                    } else {
                        None
                    }
                })
                .map_or("", |s| s.as_str());
            js_trim(t).to_string()
        };
        self.m.lines.borrow_mut().insert((pc, p), y.clone());
        y
    }
    fn line_text(&self, fi: usize, p: Pos) -> String {
        let f = &self.sc[fi];
        self.line_at(f.pc, f.f, &f.name, p)
    }
    fn fn_expr(&self, fn_: i64, e: E) -> Option<String> {
        if !self.an.facts.borrow().contains_key(&fn_) {
            return None;
        }
        (self.an.expr)(fn_, e)
    }

    fn each_expr(&self, k: u8, mut f: impl FnMut(usize, E, Pos)) {
        for (fi, fx) in self.sc.iter().enumerate() {
            for &b in &fx.blocks {
                let bo = self.an.inc_block(self.m, fx.pc, fx.f, b);
                let l = match k {
                    0 => &bo.intro,
                    1 => &bo.pyth,
                    _ => &bo.div,
                };
                for &(x, p) in l {
                    f(fi, x, p);
                }
            }
        }
    }
    fn calls_in(&self, fis: &[usize]) -> Vec<(usize, CallAt)> {
        let mut l = Vec::new();
        for &fi in fis {
            let fx = &self.sc[fi];
            for &b in &fx.blocks {
                for c in &self.an.inc_block(self.m, fx.pc, fx.f, b).calls {
                    l.push((fi, c.clone()));
                }
            }
        }
        l
    }
    fn each_call(&self) -> Rc<Vec<(usize, CallAt)>> {
        self.calls
            .get_or_init(|| {
                let all: Vec<usize> = (0..self.sc.len()).collect();
                Rc::new(self.calls_in(&all))
            })
            .clone()
    }

    fn compares(&self) -> Rc<Vec<Cmp>> {
        if let Some(c) = self.cmps.get() {
            return c.clone();
        }
        let mut out: Vec<Cmp> = Vec::new();
        for (fi, fx) in self.sc.iter().enumerate() {
            let d = self.an.defs_in(fx.pc);
            let ir = fir(fx.f);
            fn go<'a>(
                ir: &sbpf_ir::Ir,
                d: &Option<Rc<Defs<'a>>>,
                fi: usize,
                x: E,
                p: Pos,
                k: u32,
                out: &mut Vec<Cmp>,
            ) {
                if k > 8 {
                    return;
                }
                match ir.get(x) {
                    Node::Lnot(a) | Node::Ext { a, .. } => go(ir, d, fi, a, p, k + 1, out),
                    Node::Land(a, b) | Node::Lor(a, b) => {
                        go(ir, d, fi, a, p, k + 1, out);
                        go(ir, d, fi, b, p, k + 1, out);
                    }
                    Node::Var(id) => {
                        if let Some(dd) = d {
                            if let Some(&y) = dd.defs.get(&id) {
                                if matches!(
                                    ir.get(y),
                                    Node::Cmp(..) | Node::Lnot(_) | Node::Land(..) | Node::Lor(..)
                                ) {
                                    go(ir, d, fi, y, dd.def_pos[&id], k + 1, out);
                                }
                            }
                        }
                    }
                    Node::Cmp(_, a, b) => out.push(Cmp {
                        fi,
                        p,
                        a,
                        b,
                        n: None,
                        e: x,
                    }),
                    _ => {}
                }
            }
            for &b in &fx.blocks {
                let bl = &fx.f.blocks[b];
                if let Term::Br { c, .. } = &bl.term {
                    go(ir, &d, fi, *c, pos_of(b, bl.stmts.len()), 0, &mut out);
                }
            }
        }
        for (fi, c) in self.each_call().iter() {
            if crate::jre!(r"^(memcmp|memeq|bcmp|sol_memcmp_?|memcmp_\w+)$").is_match(&c.name)
                && c.args.len() >= 3
            {
                let ir = fir(self.sc[*fi].f);
                out.push(Cmp {
                    fi: *fi,
                    p: c.p,
                    a: c.args[0],
                    b: c.args[1],
                    n: match ir.get(c.args[2]) {
                        Node::Const(v) => Some(v),
                        _ => None,
                    },
                    e: c.args[0],
                });
            }
        }
        let r = Rc::new(out);
        let _ = self.cmps.set(r.clone());
        r
    }

    // ---- introspection ----

    fn intro_sites(&self) -> Vec<Intro> {
        let mut out: Vec<Intro> = Vec::new();
        let mut sites: Vec<(usize, E, Pos)> = Vec::new();
        self.each_expr(0, |fi, x, p| sites.push((fi, x, p)));
        for (fi, x, p) in sites {
            let fx = &self.sc[fi];
            let ir = fir(fx.f);
            let Node::Load { size: 2, addr } = ir.get(x) else {
                continue;
            };
            let s = sum_of(ir, addr);
            if s.terms.len() != 2 {
                continue;
            }
            let mut kind: Option<bool> = None;
            let mut base: Vec<E> = s.terms.clone();
            let mut index: Option<E> = None;
            let df = self.an.defs_in(fx.pc);
            let scaled = |t: E| {
                let x = match (ir.get(t), &df) {
                    (Node::Var(id), Some(d)) if d.defs.contains_key(&id) => d.defs[&id],
                    _ => t,
                };
                matches!(ir.get(x), Node::Bin(BinOp::Shl | BinOp::Mul, _, _))
            };
            if s.c == M64 - 1
                && s.terms
                    .iter()
                    .all(|&t| !scaled(t) && df.as_ref().and_then(|d| d.fp_off(t)).is_none())
            {
                kind = Some(true);
            } else if s.c == 2 {
                let d = &df;
                fn twice(ir: &sbpf_ir::Ir, d: &Option<Rc<Defs>>, t: E, dd: u32) -> Option<E> {
                    match ir.get(t) {
                        Node::Var(id)
                            if dd < 3 && d.as_ref().is_some_and(|d| d.defs.contains_key(&id)) =>
                        {
                            twice(ir, d, d.as_ref().unwrap().defs[&id], dd + 1)
                        }
                        Node::Bin(BinOp::And, a, b) if matches!(ir.get(b), Node::Const(_)) => {
                            twice(ir, d, a, dd + 1)
                        }
                        Node::Bin(BinOp::Shl, a, b) if matches!(ir.get(b), Node::Const(1)) => {
                            Some(a)
                        }
                        Node::Bin(BinOp::Mul, a, b) if matches!(ir.get(b), Node::Const(2)) => {
                            Some(a)
                        }
                        _ => None,
                    }
                }
                let Some(i) = s.terms.iter().position(|&t| twice(ir, d, t, 0).is_some()) else {
                    continue;
                };
                kind = Some(false);
                index = twice(ir, d, s.terms[i], 0);
                base = vec![s.terms[1 - i]];
            }
            let Some(current) = kind else { continue };
            if out.iter().any(|o| o.fi == fi && o.p == p) {
                continue;
            }
            let srcs: Vec<Source> = base.iter().flat_map(|&t| self.src(fx.pc, t, p)).collect();
            if srcs.iter().any(|y| y.kind == "ix") && !srcs.iter().any(|y| y.kind == "data") {
                continue;
            }
            if !current {
                let bk = self.vk(fx.pc, base[0], p);
                let mut count = false;
                for (bi, b) in fx.f.blocks.iter().enumerate() {
                    if count {
                        break;
                    }
                    if let Term::Br { c, .. } = &b.term {
                        for (_, n) in walk_nodes(ir, *c) {
                            if let Node::Load { size: 2, addr } = n {
                                if !count && self.vk(fx.pc, addr, pos_of(bi, b.stmts.len())) == bk {
                                    count = true;
                                }
                            }
                        }
                    }
                }
                if !count {
                    continue;
                }
            }
            let d = srcs
                .iter()
                .find(|y| y.kind == "data" || y.kind == "remaining");
            out.push(Intro {
                current,
                sysvar: d.and_then(|d| d.acct.clone()),
                by_src: d.is_some(),
                index: index.map(|i| self.src(fx.pc, i, p)),
                at: self.loc_of(fi, p),
                fi,
                p,
            });
        }
        if out.is_empty() || out.iter().any(|o| o.sysvar.is_some()) {
            return out;
        }
        let mut borrowed: IndexSet<String> = IndexSet::default();
        let fis: Vec<usize> = (0..self.sc.len())
            .filter(|&fi| out.iter().any(|o| o.fi == fi))
            .collect();
        for (fi, c) in self.calls_in(&fis) {
            if !crate::jre!(r"try_borrow_(mut_)?data").is_match(&c.name) || c.args.len() < 2 {
                continue;
            }
            for y in self.src(self.sc[fi].pc, c.args[1], c.p) {
                if y.kind == "key" || y.kind == "data" {
                    borrowed.insert(y.acct.clone().unwrap_or_default());
                }
            }
        }
        let named: Vec<String> = self
            .ix
            .accounts
            .iter()
            .filter(|x| {
                crate::jre!(r"(?i)^(instructions?|ixs|ix_sysvar|instructions?_sysvar|sysvar_instructions?|instructions?_(account|acc|info))$")
                    .is_match(&x.name)
            })
            .map(|x| x.name.clone())
            .collect();
        let keyed: Vec<String> = if self.an.anchor {
            vec![]
        } else {
            let mut s: IndexSet<String> = IndexSet::default();
            for k in self.compares().iter() {
                if !self.is_sysvar_cmp(k) {
                    continue;
                }
                let mut v = self.side_src(k, k.a);
                v.extend(self.side_src(k, k.b));
                for y in v {
                    if y.kind == "key" {
                        s.insert(y.acct.unwrap_or_default());
                    }
                }
            }
            s.into_iter().collect()
        };
        let acct = if keyed.len() == 1 {
            Some(keyed[0].clone())
        } else if borrowed.len() == 1 {
            borrowed.first().cloned()
        } else if named.len() == 1 {
            Some(named[0].clone())
        } else {
            None
        };
        if let Some(acct) = acct {
            for o in &mut out {
                o.sysvar = Some(acct.clone());
                o.by_src = keyed.len() == 1;
            }
        }
        out
    }

    /// a comparison with the Instructions sysvar id (its first word, or the 32 bytes a pointer points to)
    fn is_sysvar_cmp(&self, k: &Cmp) -> bool {
        let ir = fir(self.sc[k.fi].f);
        let mut hit = false;
        for e in [k.a, k.b] {
            ir.walk(e, &mut |_, n| {
                if let Node::Const(v) = n {
                    if SYSVAR_IX_WORDS[..3].contains(&v) {
                        hit = true;
                    }
                }
            });
        }
        hit || (k.n == Some(32) && self.line_text(k.fi, k.p).contains("SYSVAR_INSTRUCTIONS"))
    }

    fn sysvar_key_checked(&self, cmps: &[Cmp], acct: Option<&str>) -> Option<Loc> {
        let row = acct.and_then(|a| self.ix.accounts.iter().find(|x| x.name == a));
        if let Some(c) = row.and_then(|r| r.constraints.get("address")) {
            if c.status != "not_found" {
                if let Some(at) = &c.at {
                    return Some(at.clone());
                }
            }
        }
        if let Some(k) = cmps.iter().find(|k| self.is_sysvar_cmp(k)) {
            return Some(self.loc_of(k.fi, k.p));
        }
        let mut lib: Option<Loc> = None;
        for (fi, c) in self.each_call().iter() {
            if lib.is_some() {
                break;
            }
            if let Some(t) = c.target {
                if !self.an.facts.borrow().contains_key(&t)
                    && self.an.lib_has_sysvar_id(self.m, t, 1)
                {
                    lib = Some(self.loc_of(*fi, c.p));
                }
            }
        }
        if lib.is_some() {
            return lib;
        }
        self.ix
            .checks
            .iter()
            .find(|x| crate::jre!(r"SYSVAR_INSTRUCTIONS|Sysvar1nstructions").is_match(&x.cond))
            .map(|x| x.at.clone())
    }

    /// the sources of a compared operand: its value, and for a pointer (a memcmp side) the first word it points to
    fn side_src(&self, k: &Cmp, e: E) -> Vec<Source> {
        let pc = self.sc[k.fi].pc;
        let mut s = self.src(pc, e, k.p);
        if k.n.is_some_and(|n| n != 0) {
            if let Some(d) = self.deref(pc, e) {
                s.extend(self.src(pc, d, k.p));
            }
        }
        s
    }

    fn signs(&self, o: &OpOut) -> bool {
        self.an.inc_signs(self.ctx, o)
    }

    /// the functions a function calls within the instruction (itself included)
    fn below(&self, fns: &[usize]) -> HashSet<usize> {
        let mut out: HashSet<usize> = fns.iter().copied().collect();
        let mut pcs: HashSet<i64> = fns.iter().map(|&f| self.sc[f].pc).collect();
        let mut grew = true;
        while grew {
            grew = false;
            for (c, par) in &self.ctx.parents {
                if pcs.contains(&par.fn_) && !pcs.contains(c) {
                    pcs.insert(*c);
                    grew = true;
                }
            }
        }
        for (fi, f) in self.sc.iter().enumerate() {
            if pcs.contains(&f.pc) {
                out.insert(fi);
            }
        }
        out
    }

    fn f(
        &self,
        rule: &'static str,
        accounts: Vec<String>,
        path: Vec<String>,
        evidence: Vec<String>,
        confidence: &'static str,
        weight: f64,
    ) -> F {
        F {
            rule,
            accounts,
            path,
            evidence,
            confidence,
            weight,
        }
    }

    fn introspection(&self) -> Vec<F> {
        let sites = self.intro_sites();
        if sites.is_empty() {
            return vec![];
        }
        let cmps = self.compares();
        let acct = sites.iter().find_map(|s| s.sysvar.clone());
        let mut out: Vec<F> = Vec::new();
        let accts: Vec<String> = acct.iter().cloned().collect();
        let first = sites.iter().find(|s| s.current).unwrap_or(&sites[0]);
        let at = l(&first.at);
        let key_at = self.sysvar_key_checked(&cmps, acct.as_deref());
        let has_cur = sites.iter().any(|s| s.current);
        let has_tab = sites.iter().any(|s| !s.current);
        let what = format!(
            "{}{}{}",
            if has_cur {
                "the executing instruction's index (the last two bytes)"
            } else {
                ""
            },
            if sites.len() > 1 && has_cur && has_tab {
                " and "
            } else {
                ""
            },
            if has_tab {
                "an instruction by its index (the offset table)"
            } else {
                ""
            }
        );
        if key_at.is_none() {
            out.push(self.f(
                "introspection-unchecked",
                accts.clone(),
                vec![at.clone()],
                vec![
                    format!(
                        "the Instructions sysvar is parsed: {what}{} ({at})",
                        acct.as_ref().map_or(String::new(), |a| format!(", from {a}'s data"))
                    ),
                    format!("no comparison of {}'s key with the Instructions sysvar id (Sysvar1nstructions1111111111111111111111111) found: a caller can pass an account holding a forged instruction list", acct.as_deref().unwrap_or("the account")),
                ],
                "high",
                6.0,
            ));
        }
        let tab = sites.iter().find(|s| {
            !s.current
                && s.index.as_ref().is_some_and(|ix| {
                    ix.iter().any(|y| y.kind == "ix") && !ix.iter().any(|y| y.kind == "data")
                })
        });
        if let Some(tab) = tab {
            if !has_cur {
                out.push(self.f(
                    "introspection-unchecked",
                    accts.clone(),
                    vec![l(&tab.at)],
                    vec![
                        format!("an instruction is loaded from the Instructions sysvar at an index from instruction data ({}), not relative to the executing instruction (its index is not read)", tab.index.as_ref().unwrap().iter().filter(|y| y.kind == "ix").map(|y| y.source.as_str()).collect::<Vec<_>>().join(", ")),
                        "the caller picks which instruction of the transaction is inspected".to_string(),
                    ],
                    "medium",
                    5.0,
                ));
            }
        }
        let site_fns: Vec<usize> = {
            let mut v: Vec<usize> = Vec::new();
            for s in &sites {
                if !v.contains(&s.fi) {
                    v.push(s.fi);
                }
            }
            v
        };
        let local = self.below(&site_fns);
        let by_src = sites.iter().any(|s| s.by_src);
        let from_sys = |s: &[Source]| {
            s.iter().any(|y| {
                (y.kind == "data" || y.kind == "remaining") && y.acct.is_some() && y.acct == acct
            })
        };
        let mut prog: Option<Loc> = None;
        let mut bind: Option<Loc> = None;
        let moves: Vec<&OpOut> = self
            .ix
            .ops
            .iter()
            .filter(|o| {
                value_move(o)
                    && (self.signs(o)
                        || (o
                            .cpi(|c| c.family.as_deref() != Some("system"))
                            .unwrap_or(true)
                            && !o
                                .cpi(|c| c.known.clone())
                                .flatten()
                                .is_some_and(|k| k.contains("SYSTEM_PROGRAM"))))
            })
            .collect();
        if acct.is_some() && !moves.is_empty() {
            for k in cmps.iter() {
                if prog.is_some() && bind.is_some() {
                    break;
                }
                if self.is_sysvar_cmp(k) {
                    continue;
                }
                let a = self.side_src(k, k.a);
                let b = self.side_src(k, k.b);
                let (mut sa, mut sb) = (from_sys(&a), from_sys(&b));
                let ir = fir(self.sc[k.fi].f);
                if sa == sb
                    && !by_src
                    && local.contains(&k.fi)
                    && !crate::jre!(r"&(TOKEN|TOKEN_2022|SYSTEM|ASSOCIATED_TOKEN)_PROGRAM\b")
                        .is_match(&self.line_text(k.fi, k.p))
                {
                    sa = a.is_empty() && !matches!(ir.get(k.a), Node::Const(_));
                    sb = b.is_empty() && !matches!(ir.get(k.b), Node::Const(_));
                    if sa && sb {
                        continue;
                    }
                }
                if sa == sb {
                    continue;
                }
                let (other, oe) = if sa { (&b, k.b) } else { (&a, k.a) };
                if other.iter().any(|y| y.kind == "key" || y.kind == "ix") {
                    if bind.is_none() {
                        bind = Some(self.loc_of(k.fi, k.p));
                    }
                } else if k.n == Some(32)
                    && (matches!(ir.get(oe), Node::Const(_)) || other.is_empty())
                    && prog.is_none()
                {
                    prog = Some(self.loc_of(k.fi, k.p));
                }
            }
        }
        if prog.is_none() && !moves.is_empty() && acct.is_some() {
            out.push(self.f(
                "introspection-unchecked",
                accts.clone(),
                vec![at.clone()],
                vec![format!("an instruction is loaded from the Instructions sysvar before a value move ({}), but no 32-byte comparison of its program id with a known id / this program's id was found: its data is trusted whatever program it targets", js_slice(&moves[0].text, 0, Some(80)))],
                "medium",
                5.0,
            ));
        }
        let pda = moves
            .iter()
            .find(|o| self.signs(o))
            .or(moves.first())
            .copied();
        if let (None, Some(pda), Some(_)) = (&bind, pda, &acct) {
            out.push(self.f(
                "flash-repay-unbound",
                accts,
                vec![at, l(&pda.at)],
                vec![
                    "flash-loan style introspection: no field of the found instruction (its accounts, its amount) is compared with an account key or an argument of this instruction".to_string(),
                    format!("value move: {}", js_slice(&pda.text, 0, Some(120))),
                ],
                "medium",
                5.0,
            ));
        }
        out
    }

    // ---- oracle (Pyth price accounts) ----

    fn pyth_loads(&self) -> Vec<Access> {
        let mut out = Vec::new();
        let mut xs: Vec<(usize, E, Pos)> = Vec::new();
        self.each_expr(1, |fi, x, p| xs.push((fi, x, p)));
        for (fi, x, p) in xs {
            let fx = &self.sc[fi];
            let ir = fir(fx.f);
            let Node::Load { size, addr } = ir.get(x) else {
                continue;
            };
            let s = sum_of(ir, addr);
            let off = if s.c > 0xffff { -1 } else { s.c as i64 };
            if !PYTH_FIELDS.contains(&off) || s.terms.is_empty() || s.terms.len() > 2 {
                continue;
            }
            let mut ks: Vec<String> = s.terms.iter().map(|&t| self.vk(fx.pc, t, p)).collect();
            ks.sort();
            let base = ks.join(" ");
            if base.starts_with("fp") || base == "?" || base.starts_with('#') {
                continue;
            }
            out.push(Access {
                fi,
                p,
                size,
                off,
                base,
                e: x,
            });
        }
        out
    }

    fn oracle(&self) -> Vec<F> {
        if !self.an.pyth_aware(self.m) {
            return vec![];
        }
        let loads = self.pyth_loads();
        if !loads.iter().any(|x| x.off == 0xd0 && x.size == 8) {
            return vec![];
        }
        let mut by: IndexMap<String, Vec<&Access>> = IndexMap::default();
        for x in &loads {
            by.entry(x.base.clone()).or_default().push(x);
        }
        let mut magic_at: IndexSet<String> = IndexSet::default();
        for k in self.compares().iter() {
            let ir = fir(self.sc[k.fi].f);
            let (c, o) = if matches!(ir.get(k.a), Node::Const(_)) {
                (k.a, k.b)
            } else {
                (k.b, k.a)
            };
            let Node::Const(cv) = ir.get(c) else { continue };
            if cv & 0xffffffff != PYTH_MAGIC {
                continue;
            }
            let y = match ir.get(o) {
                Node::Ext { a, .. } => a,
                _ => o,
            };
            if let Node::Load { addr, .. } = ir.get(y) {
                let s = sum_of(ir, addr);
                if s.c == 0 {
                    let mut ks: Vec<String> = s
                        .terms
                        .iter()
                        .map(|&t| self.vk(self.sc[k.fi].pc, t, k.p))
                        .collect();
                    ks.sort();
                    magic_at.insert(ks.join(" "));
                }
            }
        }
        let objs: Vec<(&String, &Vec<&Access>)> = by
            .iter()
            .filter(|(b, xs)| {
                xs.iter().any(|x| x.off == 0xd0 && x.size == 8)
                    && (magic_at.contains(*b)
                        || [0x10, 0x14]
                            .iter()
                            .all(|&o| xs.iter().any(|x| x.off == o && x.size == 4)))
            })
            .collect();
        if objs.is_empty() {
            return vec![];
        }
        let all: Vec<&Access> = objs.iter().flat_map(|(_, xs)| xs.iter().copied()).collect();
        let has = |offs: &[i64]| {
            all.iter()
                .any(|x| offs.contains(&x.off) && (x.off != 0xe0 || x.size <= 4))
        };
        let (status, conf, stale) = (has(&[0xe0]), has(&[0xd8]), has(&[0x60, 0x28, 0x20, 0xe8]));
        let moves: Vec<&OpOut> = self.ix.ops.iter().filter(|o| value_move(o)).collect();
        let mut missing: Vec<&str> = Vec::new();
        if !status {
            missing.push("status (aggregate status == Trading, @224)");
        }
        if !stale {
            missing.push("staleness (publish time / slot vs Clock)");
        }
        if !(conf || moves.is_empty()) {
            missing.push("confidence (aggregate conf vs price, @216)");
        }
        if missing.is_empty() {
            return vec![];
        }
        let price = *objs[0].1.iter().find(|x| x.off == 0xd0).unwrap();
        let ppc = self.sc[price.fi].pc;
        let mut accts: Vec<String> = Vec::new();
        for y in self.src(ppc, price.e, price.p) {
            if y.kind == "data" || y.kind == "remaining" {
                let a = y.acct.unwrap_or_default();
                if !accts.contains(&a) {
                    accts.push(a);
                }
            }
        }
        let at = self.loc_of(price.fi, price.p);
        let mut path = vec![l(&at)];
        if let Some(o) = moves.first() {
            path.push(l(&o.at));
        }
        let mut ev = vec![
            format!(
                "Pyth price account read (aggregate price @208: {}){}{}",
                js_slice(&self.line_text(price.fi, price.p), 0, Some(90)),
                if accts.is_empty() {
                    String::new()
                } else {
                    format!(" from {}", accts.join(", "))
                },
                if magic_at.is_empty() {
                    ""
                } else {
                    "; magic 0xa1b2c3d4 compared"
                }
            ),
            format!(
                "no read of its {} found in the instruction",
                missing.join(", ")
            ),
        ];
        if let Some(o) = moves.first() {
            ev.push(format!(
                "the price gates a value move: {}",
                js_slice(&o.text, 0, Some(100))
            ));
        }
        vec![self.f(
            "oracle-unvalidated",
            accts,
            path,
            ev,
            if status && stale { "low" } else { "medium" },
            5.0,
        )]
    }

    // ---- signer / PDA authority forwarded to an account-supplied program ----

    /// the arguments of the call to fn a parent entry names, with its position
    fn call_at(&self, fn_: i64, par: Option<&super::ixctx::Parent>) -> Option<(Vec<E>, Pos)> {
        let par = par?;
        let pfo = self.an.fo(par.fn_)?;
        let ir = fir(pfo.f);
        let look = |e: E, found: &mut Option<L>| {
            ir.walk(e, &mut |_, n| {
                if found.is_none() {
                    if let Node::Call(ti, args) = n {
                        if ir.target(ti) == (CallTarget::Fn { pc: fn_ }) {
                            *found = Some(args);
                        }
                    }
                }
            })
        };
        let mut found: Option<L> = None;
        if let Some(pc) = par.pc {
            let (b, i) = self.an.stmt_at(par.fn_, pc)?;
            let st = &pfo.f.blocks[b].stmts[i];
            if let Some((CallTarget::Fn { pc: t }, args)) = call_of(ir, st) {
                if t == fn_ {
                    return Some((ir.to_vec(args), pos_of(b, i)));
                }
            }
            for e in stmt_exprs(ir, st) {
                look(e, &mut found);
            }
            return found.map(|a| (ir.to_vec(a), pos_of(b, i)));
        }
        let q = par.ret.and_then(|r| self.an.pos_at(par.fn_, None, Some(r)));
        if let Some(r) = par.ret {
            look(r, &mut found);
        }
        match (found, q) {
            (Some(a), Some(q)) => Some((ir.to_vec(a), q)),
            _ => None,
        }
    }

    /// an account's key is pinned
    fn pinned(&self, acct: &str) -> bool {
        let row = self.ix.accounts.iter().find(|x| x.name == acct);
        if row.is_some_and(|r| {
            ["address", "key", "pda", "has_one", "executable"]
                .iter()
                .any(|k| r.has(k))
        }) {
            return true;
        }
        if self.ix.checks.iter().any(|c| {
            c.account.as_deref() == Some(acct)
                && c.kinds
                    .iter()
                    .any(|k| *k == "address" || *k == "key" || *k == "executable")
        }) {
            return true;
        }
        self.compares().iter().any(|k| {
            let a = self.side_src(k, k.a);
            let b = self.side_src(k, k.b);
            let ir = fir(self.sc[k.fi].f);
            let key = |s: &[Source]| {
                s.iter()
                    .any(|y| y.kind == "key" && y.acct.as_deref() == Some(acct))
            };
            let other = |e: E, s: &[Source]| {
                (k.n == Some(32)
                    && (matches!(ir.get(e), Node::Const(_)) || s.iter().any(|y| y.kind == "data")))
                    || (!k.n.is_some_and(|n| n != 0)
                        && matches!(ir.get(e), Node::Const(v) if v > 0xffffffff))
            };
            (key(&a) && other(k.b, &b)) || (key(&b) && other(k.a, &a))
        })
    }

    fn key_acct(&self, fn_: i64, e: E, p: Pos) -> Option<String> {
        let mut v = self.src(fn_, e, p);
        if let Some(d) = self.ld8(fn_, e) {
            v.extend(self.src(fn_, d, p));
        }
        let a = v
            .iter()
            .find(|y| y.kind == "key")
            .and_then(|y| y.acct.clone());
        if a.is_some() || !self.an.anchor {
            return a;
        }
        let c = self.an.ev_for(self.ctx, fn_);
        let d = self.an.defs_in(fn_);
        let h = self.ctx.handler;
        let aev = self.an.fo(h).map(|_| self.an.anchor_eval(h));
        let (c, d) = (c?, d?);
        let ir = d.ir;
        let def = |x: E| -> Option<(E, Pos)> {
            match ir.get(x) {
                Node::Var(id) if d.defs.contains_key(&id) => Some((d.defs[&id], d.def_pos[&id])),
                _ => None,
            }
        };
        let info = |x: E, q: Pos, dd: u32| -> Option<String> {
            let (mut x, mut q, mut dd) = (x, q, dd);
            loop {
                let hv = c.ev(x, q, 0);
                if let Some(HVal::A(h)) = &hv {
                    let h = h.borrow();
                    if h.k == HK::Info && h.guess != Some(true) {
                        return Some(h.acct.clone());
                    }
                }
                if let Some(y) = def(x) {
                    if dd < 4 {
                        x = y.0;
                        q = y.1;
                        dd += 1;
                        continue;
                    }
                }
                let Node::Load { addr, .. } = ir.get(x) else {
                    return None;
                };
                let g = c.ev(addr, q, 0);
                if let Some(HVal::Fr { ctx: gc, z, at }) = g {
                    if gc.fo == h {
                        if let Some(w) = aev.as_ref().and_then(|a| a.frame_acct(z, 8.0, at)) {
                            if w.2 {
                                return Some(w.0);
                            }
                        }
                    }
                }
                return None;
            }
        };
        let (mut x, mut q, mut dd) = (e, p, 0u32);
        loop {
            let hv = c.ev(x, q, 0);
            if let Some(HVal::A(h)) = &hv {
                let h = h.borrow();
                if (h.k == HK::Keyp || h.k == HK::Info) && h.guess != Some(true) {
                    return Some(h.acct.clone());
                }
            }
            if let Some(y) = def(x) {
                if dd < 4 {
                    x = y.0;
                    q = y.1;
                    dd += 1;
                    continue;
                }
            }
            return match ir.get(x) {
                Node::Load { addr, .. } => info(addr, q, dd + 1),
                _ => None,
            };
        }
    }

    fn signer_forward(&self) -> Vec<F> {
        let mut out: Vec<F> = Vec::new();
        let ix = self.ix;
        let mut report = |prog: String,
                          at: String,
                          pda: bool,
                          fwd: Vec<String>,
                          text: String,
                          raw: bool,
                          by_name: bool| {
            if !pda && fwd.is_empty() {
                return;
            }
            let third = if pda {
                "the program signs the CPI with its PDA seeds: the callee gets the PDA's authority (e.g. over its token accounts)".to_string()
            } else {
                format!(
                    "the caller's signature is forwarded ({} signs the CPI){}",
                    fwd.join(", "),
                    if raw {
                        "; CPI not decoded: the instruction has a signer check"
                    } else {
                        ""
                    }
                )
            };
            let mut accounts = vec![prog.clone()];
            accounts.extend(fwd);
            out.push(F {
                rule: "signer-to-untrusted-program",
                accounts,
                path: vec![at],
                evidence: vec![
                    js_slice(&text, 0, Some(140)),
                    format!("the program id is {prog}'s key, and no check pins it (no address / key constraint, no comparison with a known id): the caller picks the program"),
                    third,
                    "see also cpi-unchecked-program".to_string(),
                ],
                confidence: if pda {
                    if by_name {
                        "medium"
                    } else {
                        "high"
                    }
                } else {
                    "info"
                },
                weight: if pda { 6.0 } else { 4.0 },
            });
        };
        let seen: HashSet<(i64, Option<i64>)> = ix
            .ops
            .iter()
            .filter(|o| o.cpi.is_some() && o.fn_pc.is_some())
            .map(|o| (o.fn_pc.unwrap(), o.at.pc))
            .collect();
        for o in &ix.ops {
            let Some(cpi) = &o.cpi else { continue };
            let c = cpi.borrow().clone();
            let (Some(fpc), Some(apc)) = (o.fn_pc, o.at.pc) else {
                continue;
            };
            if nz(&c.known) {
                continue;
            }
            let Some(src) = c.src.as_ref() else { continue };
            let Some(sprog) = src.program else { continue };
            if c.checked
                .as_deref()
                .unwrap_or("")
                .contains("(id compared with")
            {
                continue;
            }
            let Some((b, i)) = self.an.stmt_at(fpc, apc) else {
                continue;
            };
            let sp = pos_of(b, i);
            let mut prog = self.key_acct(fpc, sprog, sp);
            let cands: Vec<&super::report::AcctOut> = if self.an.anchor && prog.is_none() {
                ix.accounts
                    .iter()
                    .filter(|x| {
                        crate::jre!(r"(?i)program").is_match(&x.name)
                            && !crate::jre!(r"(?i)system|token|associated|rent|metadata|memo|compute_budget|sysvar")
                                .is_match(&x.name)
                    })
                    .collect()
            } else {
                vec![]
            };
            let by_name = cands.len() == 1 && prog.is_none();
            if cands.len() == 1
                && !ix.checks.iter().any(|c| {
                    c.account.is_none()
                        && crate::jre!(r"ConstraintAddress|ConstraintExecutable|InvalidProgramId|AccountNotProgram|AccountNotExecutable")
                            .is_match(&c.error)
                })
            {
                prog = Some(cands[0].name.clone());
            }
            let Some(prog) = prog else { continue };
            if self.pinned(&prog) {
                continue;
            }
            let mut fwd: Vec<String> = Vec::new();
            for (i, x) in c.accounts.iter().enumerate() {
                let e = src.accounts.get(i).copied().flatten();
                let a = match e {
                    Some(e) if truthy(x.s) => self.key_acct(fpc, e, sp),
                    _ => None,
                };
                if let Some(a) = a {
                    if is_signer(ix, &a) {
                        fwd.push(a);
                    }
                }
            }
            if fwd.is_empty()
                && !self.signs(o)
                && c.accounts.iter().enumerate().any(|(i, x)| {
                    truthy(x.s) && {
                        let e = src
                            .accounts
                            .get(i)
                            .copied()
                            .flatten()
                            .or_else(|| self.ir_of(fpc).map(|ir| ir.undef()));
                        e.is_none_or(|e| self.key_acct(fpc, e, sp).is_none())
                    }
                })
            {
                fwd = ix
                    .accounts
                    .iter()
                    .filter(|x| is_signer(ix, &x.name))
                    .map(|x| x.name.clone())
                    .collect();
            }
            let mut uf: Vec<String> = Vec::new();
            for a in fwd {
                if !uf.contains(&a) {
                    uf.push(a);
                }
            }
            report(
                prog,
                l(&o.at),
                self.signs(o),
                uf,
                format!(
                    "{}{}",
                    o.text,
                    if by_name {
                        " (program account by name: a Program<T> check in library code is not seen)"
                    } else {
                        ""
                    }
                ),
                false,
                by_name,
            );
        }
        for (fi, c) in self.each_call().iter() {
            let fx = &self.sc[*fi];
            if !crate::jre!(r"^(solana_program::program::)?(program_)?invoke(_signed)?(_unchecked)?$|^sol_invoke_signed_(rust|c)$").is_match(&c.name)
                || seen.contains(&(fx.pc, Some(c.pc)))
                || c.args.len() < 2
            {
                continue;
            }
            let ixp = if c.name.contains("sol_invoke") {
                c.args[0]
            } else {
                c.args[1]
            };
            let (mut f0, mut e0, mut p0) = (fx.pc, ixp, c.p);
            for _ in 0..3 {
                let Some(fo0) = self.an.fo(f0) else { break };
                let Node::Var(id) = fir(fo0.f).get(e0) else {
                    break;
                };
                let v = fo0.f.vars.get(id as usize);
                let par = match v {
                    Some(v) if v.param >= 1 && v.param < 100 => self.ctx.parents.get(&f0),
                    _ => None,
                };
                let at = self.call_at(f0, par);
                let Some((args, q)) = at else { break };
                let j = v.unwrap().param as usize - 1;
                let Some(&a) = args.get(j) else { break };
                f0 = par.unwrap().fn_;
                e0 = a;
                p0 = q;
            }
            let Some(ir0) = self.ir_of(f0) else { continue };
            let addr = ir0.bin(BinOp::Add, e0, ir0.c(0x30));
            let Some(prog) = self.key_acct(f0, addr, p0) else {
                continue;
            };
            if self.pinned(&prog) {
                continue;
            }
            let d = self.an.defs_in(fx.pc);
            let mut pda = false;
            if c.name.contains("invoke_signed") {
                if let Some(d) = &d {
                    let y = d.reaching(&self.an.fl, slot(-0x1000 as f64 + 8.0), c.p, false);
                    pda = !y.is_some_and(|y| matches!(d.ir.get(y.0), Node::Const(0)));
                }
            }
            let mut signers: Vec<String> = ix
                .accounts
                .iter()
                .filter(|x| x.has("signer"))
                .map(|x| x.name.clone())
                .collect();
            if signers.is_empty() && ix.checks.iter().any(|c| c.kinds.contains(&"signer")) {
                signers = vec!["(a signer the checks name)".to_string()];
            }
            report(
                prog,
                l(&self.loc_of(*fi, c.p)),
                pda,
                if pda { vec![] } else { signers },
                format!("{}(…) {}", c.name, self.line_text(*fi, c.p)),
                true,
                false,
            );
        }
        out
    }

    // ---- stale account data after a CPI ----

    fn before(&self, pc: i64, a: Pos, b: Pos) -> bool {
        if a >> 16 == b >> 16 {
            return (a & 0xffff) < (b & 0xffff);
        }
        let g = self.an.cfg(pc);
        reaches(&g, (a >> 16) as usize, (b >> 16) as usize, None)
            && !reaches(&g, (b >> 16) as usize, (a >> 16) as usize, None)
    }

    fn stale_after_cpi(&self) -> Vec<F> {
        let ix = self.ix;
        let an = self.an;
        let mut out: Vec<F> = Vec::new();
        let cpis: Vec<&OpOut> = ix
            .ops
            .iter()
            .filter(|o| {
                o.fn_pc.is_some()
                    && o.kinds
                        .iter()
                        .any(|k| matches!(*k, "TOKEN_TRANSFER" | "MINT" | "BURN"))
            })
            .collect();
        if cpis.is_empty() {
            return out;
        }
        let mut own: HashSet<String> = ix
            .ops
            .iter()
            .filter(|o| o.has("ACCOUNT_DATA_WRITE") || o.has("AUTHORITY_WRITE"))
            .map(|o| {
                o.target.as_ref().map_or(String::new(), |t| {
                    t.split('.').next().unwrap_or("").to_string()
                })
            })
            .collect();
        if an.anchor {
            for t in self.state_targets {
                own.insert(t.split('.').next().unwrap_or("").to_string());
            }
        }
        let h = self.ctx.handler;
        let aev = if an.anchor && an.fo(h).is_some() {
            Some(an.anchor_eval(h))
        } else {
            None
        };
        let allowed = |fn_: i64, b: usize| self.ctx.allowed(fn_, b) != Some(false);
        let mut seen: HashSet<String> = HashSet::default();
        for o in cpis {
            let fpc = o.fn_pc.unwrap();
            let Some(cp0) = an.pos_at(fpc, o.at.pc, o.ret) else {
                continue;
            };
            let (caccts, csrc) = o
                .cpi(|c| (c.accounts.clone(), c.src.clone()))
                .unwrap_or_default();
            let mut metas: Vec<String> = Vec::new();
            for (i, x) in caccts.iter().enumerate() {
                let e = csrc
                    .as_ref()
                    .and_then(|s| s.accounts.get(i).copied().flatten());
                if let (true, Some(e)) = (truthy(x.w), e) {
                    let mut v = self.src(fpc, e, cp0);
                    if let Some(d) = self.ld8(fpc, e) {
                        v.extend(self.src(fpc, d, cp0));
                    }
                    for y in v {
                        if y.kind == "key" {
                            metas.push(y.acct.unwrap_or_default());
                        }
                    }
                }
            }
            let w: HashSet<String> = if !metas.is_empty() {
                metas.into_iter().collect()
            } else {
                ix.accounts
                    .iter()
                    .filter(|x| {
                        (if an.anchor {
                            x.expected.writable || x.constraints.contains_key("writable")
                        } else {
                            true
                        }) && !own.contains(&x.name)
                            && !x.expected.signer
                    })
                    .map(|x| x.name.clone())
                    .collect()
            };
            if w.is_empty() {
                continue;
            }
            let mut lv: Option<(i64, Pos)> = Some((fpc, cp0));
            let mut depth = 0;
            while let Some((fn_, cp)) = lv {
                if depth >= 6 {
                    break;
                }
                depth += 1;
                let (Some(fo), Some(d)) = (an.fo(fn_), an.defs_in(fn_)) else {
                    break;
                };
                let g = an.cfg(fn_);
                let ir = fir(fo.f);
                for b in 0..fo.f.blocks.len() {
                    let bl = &fo.f.blocks[b];
                    let Term::Br { c: bc, .. } = &bl.term else {
                        continue;
                    };
                    if g.rpo[b] < 0
                        || !allowed(fn_, b)
                        || !reaches(&g, (cp >> 16) as usize, b, None)
                    {
                        continue;
                    }
                    let q = pos_of(b, bl.stmts.len());
                    if !self.before(fn_, cp, q) && b as i64 != cp >> 16 {
                        continue;
                    }
                    let mut stale: Vec<(String, String)> = Vec::new();
                    let mut fresh: HashSet<String> = HashSet::default();
                    let mut operands: HashSet<E> = HashSet::default();
                    for (_, n) in walk_nodes(ir, *bc) {
                        if let Node::Cmp(_, a, b2) = n {
                            for y in [a, b2] {
                                operands.insert(match ir.get(y) {
                                    Node::Ext { a, .. } => a,
                                    _ => y,
                                });
                            }
                        }
                    }
                    self.visit(
                        fn_, fo.f, &d, &w, cp, *bc, q, 0, &operands, &aev, &mut stale, &mut fresh,
                    );
                    for (acct, what) in stale {
                        if fresh.contains(&acct) || seen.contains(&acct) {
                            continue;
                        }
                        seen.insert(acct.clone());
                        let at = self.loc_at(fn_, fo.f, &fo.name, q);
                        out.push(F {
                            rule: "stale-after-cpi",
                            accounts: vec![acct.clone()],
                            path: vec![l(&o.at), l(&at)],
                            evidence: vec![
                                format!(
                                    "{what} is read before the CPI ({}) that may write {acct}, and used after it: {}",
                                    js_slice(&o.text, 0, Some(80)),
                                    js_slice(&self.line_at(fn_, fo.f, &fo.name, q), 0, Some(100))
                                ),
                                if an.anchor {
                                    format!("no reload of {acct} (a call taking its deserialized copy) between the CPI and the read")
                                } else {
                                    "the value is not read again after the CPI".to_string()
                                },
                            ],
                            confidence: "medium",
                            weight: 4.0,
                        });
                    }
                }
                let par = if fn_ == self.ctx.handler {
                    None
                } else {
                    self.ctx.parents.get(&fn_)
                };
                let at = self.call_at(fn_, par);
                lv = match (at, par) {
                    (Some((_, q)), Some(par)) => Some((par.fn_, q)),
                    _ => None,
                };
            }
        }
        out
    }

    #[allow(clippy::too_many_arguments)]
    fn visit(
        &self,
        fn_: i64,
        f: &'a Func,
        d: &Rc<Defs<'a>>,
        w: &HashSet<String>,
        cp: Pos,
        e: E,
        p: Pos,
        depth: u32,
        operands: &HashSet<E>,
        aev: &Option<Rc<super::anchor::AnchorEval<'a>>>,
        stale: &mut Vec<(String, String)>,
        fresh: &mut HashSet<String>,
    ) {
        let an = self.an;
        let ir = fir(f);
        let h = self.ctx.handler;
        for (x, n) in walk_nodes(ir, e) {
            match n {
                Node::Var(id) if depth < 4 => {
                    let y: Option<(E, Pos)> = if d.defs.contains_key(&id) {
                        Some((d.defs[&id], d.def_pos[&id]))
                    } else if d.multi.contains(&id) {
                        d.reaching(&an.fl, id as f64, p, false)
                    } else {
                        None
                    };
                    let Some(y) = y else { continue };
                    let o8 = match ir.get(y.0) {
                        Node::Load { addr, .. } => d.fp_off(addr),
                        _ => None,
                    };
                    let cs = match o8 {
                        Some(o8) if !an.anchor => self.call_out(f, d, o8, y.1),
                        _ => None,
                    };
                    let mut ss: Vec<Source> = self
                        .src(fn_, y.0, y.1)
                        .into_iter()
                        .filter(|s| s.kind == "data")
                        .collect();
                    if let Some((args, cq)) = &cs {
                        for &a in args {
                            let mut v = self.src(fn_, a, *cq);
                            if let Some(dd) = self.ld8(fn_, a) {
                                v.extend(self.src(fn_, dd, *cq));
                            }
                            ss.extend(
                                v.into_iter()
                                    .filter(|s| s.kind == "key" || s.kind == "data"),
                            );
                        }
                    }
                    let ss: Vec<Source> = ss
                        .into_iter()
                        .filter(|s| w.contains(s.acct.as_deref().unwrap_or("\u{0}")))
                        .collect();
                    if self.before(fn_, y.1, cp) {
                        for s in ss {
                            let acct = s.acct.clone().unwrap_or_default();
                            let what = if s.kind == "key" {
                                format!("a value a call reads from {acct}")
                            } else {
                                s.source
                            };
                            stale.push((acct, what));
                        }
                    } else {
                        for s in ss {
                            fresh.insert(s.acct.unwrap_or_default());
                        }
                        self.visit(
                            fn_,
                            f,
                            d,
                            w,
                            cp,
                            y.0,
                            y.1,
                            depth + 1,
                            operands,
                            aev,
                            stale,
                            fresh,
                        );
                    }
                }
                Node::Load { addr, size } => {
                    let ss: Vec<Source> = self
                        .src(fn_, x, p)
                        .into_iter()
                        .filter(|s| {
                            s.kind == "data" && w.contains(s.acct.as_deref().unwrap_or("\u{0}"))
                        })
                        .collect();
                    let hv = if an.anchor {
                        an.ev_for(self.ctx, fn_).and_then(|c| c.ev(addr, p, 0))
                    } else {
                        None
                    };
                    let copy = match &hv {
                        Some(HVal::Fr { ctx: hc, z, at }) if hc.fo == h => aev
                            .as_ref()
                            .is_some_and(|a| a.frame_acct(*z, size as f64, *at).is_some()),
                        _ => false,
                    };
                    let cc =
                        if an.anchor && ss.is_empty() && size == 8 && operands.contains(&x) && {
                            let t = self.fn_expr(fn_, x).unwrap_or_default();
                            !crate::jre!(
                                r"\.(info|owner|key|data|lamports|mint|delegate|state)\b|rc_|ref"
                            )
                            .is_match(&t)
                        } {
                            self.copy_acct(fn_, addr, p)
                        } else {
                            None
                        };
                    if let Some((ca, cinfo)) = &cc {
                        if !cinfo && w.contains(ca) {
                            if self.reloaded(fn_, f, cp, p, ca) {
                                fresh.insert(ca.clone());
                            } else {
                                stale.push((
                                    ca.clone(),
                                    format!(
                                        "{ca} (its deserialized copy: {})",
                                        self.fn_expr(fn_, x).unwrap_or_else(|| "a load".into())
                                    ),
                                ));
                            }
                            continue;
                        }
                    }
                    for s in ss {
                        let acct = s.acct.clone().unwrap_or_default();
                        if !copy {
                            fresh.insert(acct);
                            continue;
                        }
                        if self.reloaded(fn_, f, cp, p, &acct) {
                            fresh.insert(acct);
                        } else {
                            stale.push((acct, s.source));
                        }
                    }
                }
                _ => {}
            }
        }
    }

    /// the call statement writing frame offset o (its out object), the last before position p in p's block
    fn call_out(&self, f: &Func, d: &Defs<'a>, o: f64, p: Pos) -> Option<(Vec<E>, Pos)> {
        let ir = fir(f);
        let bl = &f.blocks[(p >> 16) as usize];
        let n = ((p & 0xffff) as usize).min(bl.stmts.len());
        for i in (0..n).rev() {
            let st = &bl.stmts[i];
            match st {
                Stmt::Store { addr, size, .. } => {
                    if let Some(a) = d.fp_off(*addr) {
                        if a <= o && o < a + *size as f64 {
                            return None;
                        }
                    }
                }
                Stmt::Stores {
                    addr, size, vals, ..
                } => {
                    if let Some(a) = d.fp_off(*addr) {
                        if a <= o && o < a + (*size as f64) * (vals.len as f64) {
                            return None;
                        }
                    }
                }
                _ => {}
            }
            let Some((_, args)) = call_of(ir, st) else {
                continue;
            };
            let args = ir.to_vec(args);
            if args
                .iter()
                .any(|&e| d.fp_off(e).is_some_and(|a| a <= o && o < a + 128.0))
            {
                return Some((
                    args.into_iter()
                        .filter(|&e| d.fp_off(e).is_none())
                        .collect(),
                    ((p >> 16) << 16) | i as i64,
                ));
            }
        }
        None
    }

    /// Anchor: the account whose deserialized copy in the Accounts struct an address points into, with whether it
    /// is the account's AccountInfo word
    fn copy_acct(&self, fn_: i64, addr: E, p: Pos) -> Option<(String, bool)> {
        let an = self.an;
        let h = self.ctx.handler;
        an.fo(h)?;
        let t = an.try_info(h);
        let _a = an.anchor_eval(h);
        let ev = an.ev_for(self.ctx, fn_);
        let t = t.filter(|t| !t.layout.is_empty())?;
        let ev = ev?;
        let ir = fir(an.fo(fn_)?.f);
        let s = sum_of(ir, addr);
        if s.terms.len() != 1 || s.c > 0x4000 {
            return None;
        }
        let c = s.c as f64;
        match ev.ev(s.terms[0], p, 0) {
            Some(HVal::Fr { ctx, .. }) if ctx.fo == h => {}
            _ => return None,
        }
        let mut fs: Vec<&crate::views::Field> = t.layout.iter().collect();
        fs.sort_by(|x, y| {
            x.off
                .partial_cmp(&y.off)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        let mut i: Option<usize> = None;
        for (k, f) in fs.iter().enumerate() {
            if f.off <= c {
                i = Some(k);
            }
        }
        let i = i?;
        let f = fs[i];
        let end = match fs.get(i + 1) {
            Some(n) => n.off,
            None => {
                f.off
                    + match &f.t {
                        crate::views::FT::Embed(ty) => {
                            an.views.map.get(ty).and_then(|v| v.size).unwrap_or(8.0)
                        }
                        _ => 8.0,
                    }
            }
        };
        if c >= end {
            return None;
        }
        let t0 = self.fn_expr(fn_, s.terms[0]).unwrap_or_default();
        if !crate::jre!(r"^acc(oun)?ts(_\d+)?$").is_match(&t0) {
            return None;
        }
        Some((
            f.name.clone(),
            c - f.off < 8.0 && matches!(f.t, crate::views::FT::Ref(_)),
        ))
    }

    /// Anchor: a call between the CPI and the read taking a pointer into the account's deserialized copy
    fn reloaded(&self, fn_: i64, f: &Func, cp: Pos, rp: Pos, acct: &str) -> bool {
        let an = self.an;
        let ev = an.ev_for(self.ctx, fn_);
        let h = self.ctx.handler;
        let aev = an.fo(h).map(|_| an.anchor_eval(h));
        let (Some(ev), Some(aev)) = (ev, aev) else {
            return false;
        };
        let g = an.cfg(fn_);
        let ir = fir(f);
        for b in 0..f.blocks.len() {
            if g.rpo[b] < 0
                || !reaches(&g, (cp >> 16) as usize, b, None)
                || !reaches(&g, b, (rp >> 16) as usize, None)
            {
                continue;
            }
            let bl = &f.blocks[b];
            for i in 0..bl.stmts.len() {
                let p = pos_of(b, i);
                if !self.before(fn_, cp, p) || !self.before(fn_, p, rp) {
                    continue;
                }
                if let Some((_, args)) = call_of(ir, &bl.stmts[i]) {
                    for a in ir.to_vec(args) {
                        let hv = ev.ev(a, p, 0);
                        match &hv {
                            Some(HVal::Fr { ctx, z, at }) if ctx.fo == h => {
                                if aev.frame_acct(*z, 8.0, *at).is_some_and(|x| x.0 == acct) {
                                    return true;
                                }
                            }
                            Some(HVal::A(x)) => {
                                if x.borrow().acct == acct {
                                    return true;
                                }
                            }
                            _ => {}
                        }
                        if self.copy_acct(fn_, a, p).is_some_and(|x| x.0 == acct) {
                            return true;
                        }
                    }
                }
            }
        }
        false
    }

    // ---- Token-2022: the transfer's input amount credited ----

    fn token2022_amount(&self) -> Vec<F> {
        let ix = self.ix;
        let an = self.an;
        let derives = ix.ops.iter().any(|o| o.has("PDA_DERIVE"));
        let moves: Vec<&OpOut> = ix
            .ops
            .iter()
            .filter(|o| {
                o.has("TOKEN_TRANSFER")
                    && !self.signs(o)
                    && !(derives && o.cpi(|c| c.accounts.is_empty()).unwrap_or(true))
            })
            .collect();
        if moves.is_empty() {
            return vec![];
        }
        let cmps = self.compares();
        let via = ix.ops.iter().find(|o| {
            o.cpi(|c| {
                format!("{} {}", c.known.as_deref().unwrap_or(""), c.program).contains("TOKEN_2022")
                    || c.family.as_deref().unwrap_or("").contains("2022")
            })
            .unwrap_or_else(|| {
                // (no CPI: `${undefined ?? ''} ${undefined ?? ''}`)
                false
            })
        });
        let cmp = if via.is_some() {
            None
        } else {
            cmps.iter()
                .find(|k| self.line_text(k.fi, k.p).contains("TOKEN_2022_PROGRAM"))
        };
        if via.is_none()
            && cmp.is_none()
            && !ix
                .checks
                .iter()
                .any(|c| c.cond.contains("TOKEN_2022_PROGRAM"))
        {
            return vec![];
        }
        if cmps.iter().any(|k| {
            let ir = fir(self.sc[k.fi].f);
            matches!(ir.get(k.e), Node::Cmp(CmpOp::Eq | CmpOp::Ne, _, _))
                && [k.a, k.b]
                    .iter()
                    .any(|&x| matches!(ir.get(x), Node::Const(82) | Node::Const(165)))
        }) {
            return vec![];
        }
        let own: HashSet<String> = ix
            .ops
            .iter()
            .filter(|o| o.has("ACCOUNT_DATA_WRITE"))
            .map(|o| {
                o.target.as_ref().map_or(String::new(), |t| {
                    t.split('.').next().unwrap_or("").to_string()
                })
            })
            .collect();
        for o in &ix.ops {
            if !o.has("ACCOUNT_DATA_WRITE") || o.how != Some("+=") {
                continue;
            }
            let (Some(fpc), Some(apc)) = (o.fn_pc, o.at.pc) else {
                continue;
            };
            let Some(v) = an.stored_at(fpc, apc) else {
                continue;
            };
            let ss = self.src(fpc, v.0, v.1);
            let Some(arg) = ss.iter().find(|y| y.kind == "ix") else {
                continue;
            };
            if ss
                .iter()
                .any(|y| y.kind == "data" && !own.contains(y.acct.as_deref().unwrap_or("")))
            {
                continue;
            }
            let m = moves[0];
            let target = o.target.clone().unwrap_or_default();
            let via_s = if let Some(v) = via {
                format!(
                    "CPI {}",
                    v.cpi(|c| c.known.clone().unwrap_or_else(|| c.program.clone()))
                        .unwrap_or_default()
                )
            } else if let Some(k) = cmp {
                format!(
                    "compared with its id: {}",
                    js_slice(&self.line_text(k.fi, k.p), 0, Some(80))
                )
            } else {
                "a check names its id".to_string()
            };
            return vec![F {
                rule: "token2022-amount-assumed",
                accounts: vec![target.split('.').next().unwrap_or("").to_string()],
                path: vec![l(&m.at), l(&o.at)],
                evidence: vec![
                    format!(
                        "{target} += {} ({}): the credited amount is the transfer's input, not what the destination received",
                        arg.source,
                        js_slice(&o.text, 0, Some(80))
                    ),
                    format!("the token program may be Token-2022 ({via_s}): a transfer fee (or hook) makes the destination receive less; no read of the destination's balance after the transfer (balance delta) found"),
                    format!("transfer: {}", js_slice(&m.text, 0, Some(100))),
                ],
                confidence: "medium",
                weight: 4.0,
            }];
        }
        vec![]
    }

    // ---- rounding direction of share math (experimental) ----

    fn rounding(&self) -> Vec<F> {
        struct Div {
            fi: usize,
            p: Pos,
            q: Vec<String>,
            ceil: bool,
            text: String,
        }
        let an = self.an;
        let ix = self.ix;
        let mut out: Vec<F> = Vec::new();
        let mut divs: Vec<Div> = Vec::new();
        let mut muls: HashMap<i64, HashSet<FK>> = HashMap::default();
        for (fi, c) in self.each_call().iter() {
            let pc = self.sc[*fi].pc;
            if crate::jre!(r"^(__multi3)(_[0-9a-f]+)?$").is_match(&c.name) && !c.args.is_empty() {
                if let Some(o) = an.defs_in(pc).and_then(|d| d.fp_off(c.args[0])) {
                    muls.entry(pc).or_default().insert(FK::of(o));
                }
            }
        }
        let product = |fi: usize, e: E, p: Pos| -> bool {
            let pc = self.sc[fi].pc;
            if self.vk(pc, e, p).contains("(mul ") {
                return true;
            }
            let d = an.defs_in(pc);
            let ir = fir(self.sc[fi].f);
            let x = match (ir.get(e), &d) {
                (Node::Var(id), Some(d)) if d.defs.contains_key(&id) => d.defs[&id],
                _ => e,
            };
            let o = match ir.get(x) {
                Node::Load { addr, .. } => d.as_ref().and_then(|d| d.fp_off(addr)),
                _ => None,
            };
            o.is_some_and(|o| muls.get(&pc).is_some_and(|m| m.contains(&FK::of(o))))
        };
        let is_ceil = |nk: &str, dk: &str| {
            nk.starts_with("(+ ") && nk.ends_with(" #-1)") && super::paths::key_in(nk, dk)
        };
        let mut xs: Vec<(usize, E, Pos)> = Vec::new();
        self.each_expr(2, |fi, x, p| xs.push((fi, x, p)));
        for (fi, x, p) in xs {
            let pc = self.sc[fi].pc;
            let ir = fir(self.sc[fi].f);
            let Node::Bin(BinOp::Udiv | BinOp::Sdiv, xa, xb) = ir.get(x) else {
                continue;
            };
            if matches!(ir.get(xb), Node::Const(_)) {
                continue;
            }
            if !self.src(pc, xb, p).iter().any(|y| y.kind == "data") {
                continue;
            }
            let nk = self.vk(pc, xa, p);
            let dk = self.vk(pc, xb, p);
            if !product(fi, xa, p) && !is_ceil(&nk, &dk) {
                continue;
            }
            divs.push(Div {
                fi,
                p,
                q: vec![self.vk(pc, x, p)],
                ceil: is_ceil(&nk, &dk),
                text: self.line_text(fi, p),
            });
        }
        for (fi, c) in self.each_call().iter() {
            let pc = self.sc[*fi].pc;
            let ir = fir(self.sc[*fi].f);
            if !crate::jre!(r"^(__udivti3|__divti3|udivti3|u128_div)(_[0-9a-f]+)?$")
                .is_match(&c.name)
                || c.args.len() < 5
                || matches!(ir.get(c.args[3]), Node::Const(_))
            {
                continue;
            }
            let nk = self.vk(pc, c.args[1], c.p);
            let dk = self.vk(pc, c.args[3], c.p);
            if !is_ceil(&nk, &dk) && !product(*fi, c.args[1], c.p) {
                continue;
            }
            let o = an.defs_in(pc).and_then(|d| d.fp_off(c.args[0]));
            let mut q = vec![format!("call{}@{}", pc, c.p)];
            if let Some(o) = o {
                q.push(format!("fs{}@{}:8", pc, crate::util::js_num(o)));
            }
            divs.push(Div {
                fi: *fi,
                p: c.p,
                q,
                ceil: is_ceil(&nk, &dk),
                text: self.line_text(*fi, c.p),
            });
        }
        if divs.is_empty() {
            return out;
        }
        struct Wr<'o> {
            o: &'o OpOut,
            k: String,
        }
        let writes: Vec<Wr> = ix
            .ops
            .iter()
            .filter(|o| {
                o.has("ACCOUNT_DATA_WRITE")
                    && (o.how == Some("+=") || o.how == Some("-="))
                    && o.fn_pc.is_some()
                    && o.at.pc.is_some()
            })
            .filter_map(|o| {
                let v = an.stored_at(o.fn_pc.unwrap(), o.at.pc.unwrap())?;
                Some(Wr {
                    o,
                    k: self.vk(o.fn_pc.unwrap(), v.0, v.1),
                })
            })
            .collect();
        let field = |t: &Option<String>| -> String {
            t.as_ref().map_or(String::new(), |t| {
                t.split('.').skip(1).collect::<Vec<_>>().join(".")
            })
        };
        let outflow_arg = ix
            .ops
            .iter()
            .filter(|o| {
                (o.has("TOKEN_TRANSFER") || o.has("LAMPORT_TRANSFER"))
                    && o.sources.as_ref().is_some_and(|s| !s.is_empty())
            })
            .all(|o| {
                o.sources
                    .as_ref()
                    .unwrap()
                    .iter()
                    .filter(|y| y.param == "amount" || y.param == "lamports")
                    .all(|y| crate::jre!(r"instruction data|^ix\.").is_match(&y.source))
            });
        for d in &divs {
            fn has<'a>(x: &X<'a, '_, '_>, q: &[String], k: &str, depth: u32) -> bool {
                if q.iter().any(|q| super::paths::key_in(k, q)) {
                    return true;
                }
                if depth >= 3 {
                    return false;
                }
                for m in crate::jre!(r"\b(v|fs)(\d+)[.@](-?\d+)\b").captures_iter(k) {
                    let f: i64 = m[2].parse().unwrap_or(-1);
                    let id = super::js_number(&m[3]);
                    let (Some(fo), Some(dd)) = (x.an.fo(f), x.an.defs_in(f)) else {
                        continue;
                    };
                    let ds = x.an.inc_def_sites(x.m, f, fo.f, &dd);
                    let l = if &m[1] == "v" {
                        if id >= 0.0 && id.fract() == 0.0 {
                            ds.0.get(&(id as u32))
                        } else {
                            None
                        }
                    } else {
                        ds.1.get(&FK::of(id))
                    };
                    if l.is_some_and(|l| {
                        l.iter()
                            .any(|&(v, qp)| has(x, q, &x.vk(f, v, qp), depth + 1))
                    }) {
                        return true;
                    }
                }
                false
            }
            let uses: Vec<usize> = (0..writes.len())
                .filter(|&i| has(self, &d.q, &writes[i].k, 0))
                .collect();
            let paid = ix.ops.iter().any(|o| {
                let Some(fpc) = o.fn_pc else { return false };
                if o.has("LAMPORT_WRITE") && o.how == Some("-=") && o.at.pc.is_some() {
                    let v = an.stored_at(fpc, o.at.pc.unwrap());
                    return v.is_some_and(|v| has(self, &d.q, &self.vk(fpc, v.0, v.1), 0));
                }
                let q = an.pos_at(fpc, o.at.pc, o.ret);
                let Some(q) = q else { return false };
                o.cpi(|c| {
                    c.fields.iter().enumerate().any(|(i, (n, _))| {
                        crate::jre!(r"amount|lamports").is_match(n)
                            && c.src
                                .as_ref()
                                .and_then(|s| s.fields.get(i).copied().flatten())
                                .is_some_and(|e| has(self, &d.q, &self.vk(fpc, e, q), 0))
                    })
                })
                .unwrap_or(false)
            });
            if !d.ceil && paid {
                continue;
            }
            for &wi in &uses {
                let wr = &writes[wi];
                let others: Vec<usize> = (0..writes.len())
                    .filter(|&x| x != wi && writes[x].o.how == wr.o.how && !uses.contains(&x))
                    .collect();
                let f = field(&wr.o.target);
                let tgt = wr.o.target.clone().unwrap_or_default();
                let mut why: Option<String> = None;
                if d.ceil
                    && wr.o.how == Some("+=")
                    && !crate::jre!(r"(?i)debt|borrow|owed|liab|fee").is_match(&f)
                    && !others.is_empty()
                {
                    why = Some(format!("rounded up ((n + d - 1) / d) and credited to {tgt}, next to {} += (the deposit): the caller gets up to one unit more than the exact share", writes[others[0]].o.target.clone().unwrap_or_default()));
                } else if !d.ceil
                    && wr.o.how == Some("-=")
                    && (crate::jre!(r"(?i)share|lp|supply|units").is_match(&f)
                        || (!crate::jre!(r"[a-z]")
                            .is_match(&crate::jre!(r"data\[\d+\.\.\d+\]").replace(&f, ""))
                            && !others.is_empty()
                            && outflow_arg))
                {
                    why = Some(format!(
                        "rounded down and debited from {tgt}{}: the caller burns up to one unit less than the exact share",
                        if others.is_empty() {
                            String::new()
                        } else {
                            format!(
                                ", next to {} -= (the assets out)",
                                writes[others[0]].o.target.clone().unwrap_or_default()
                            )
                        }
                    ));
                }
                let Some(why) = why else { continue };
                out.push(F {
                    rule: "rounding-favors-user",
                    accounts: vec![tgt.split('.').next().unwrap_or("").to_string()],
                    path: vec![l(&self.loc_of(d.fi, d.p)), l(&wr.o.at)],
                    evidence: vec![
                        format!(
                            "share conversion {} (a product divided by a stored value)",
                            js_slice(&d.text, 0, Some(90))
                        ),
                        why,
                        "experimental: rounding direction recognized from the division's shape and the write it flows into".to_string(),
                    ],
                    confidence: "low",
                    weight: 3.0,
                });
                break;
            }
            if !out.is_empty() {
                break;
            }
        }
        out
    }
}
