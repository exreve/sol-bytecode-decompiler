//! IR-level support for the program analysis (`src/analysis/flow.ts`, part 1): control-flow graphs with
//! real dominators, decision blocks, small IR helpers, reaching definitions (`Defs`: per-variable /
//! per-frame-slot fixpoint, order-independent), what calls write through pointer arguments.
//!
//! Expression identity: the TS compares expression objects; here a function's expressions are ids in its
//! arena, and expressions the TS creates on the fly (a copy seen as a load, a call statement as a call
//! expression) are new ids created at the same events.

use super::FK;
use indexmap::IndexMap;
use sbpf_ir::{BinOp, CallTarget, CmpOp, Ir, Node, Stmt, Term, E, L};
use sbpf_program::Func;
use sbpf_struct::structure::{compute_rpo, dominators};
use std::cell::{Cell, RefCell};
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

/// position: block << 16 | statement index (the branch condition: index = the block's statement count)
pub type Pos = i64;

pub fn pos_of(b: usize, i: usize) -> Pos {
    ((b as i64) << 16) | i as i64
}

/// the function's arena
pub fn fir(f: &Func) -> &Ir {
    f.ir.as_ref().expect("variable IR")
}

/// Number(BigInt.asIntN(64, v))
pub fn s_num(v: u64) -> f64 {
    v as i64 as f64
}

pub fn fp_of(f: &Func) -> i64 {
    f.vars.iter().find(|v| v.param == 10).map_or(-1, |v| v.id as i64)
}

/// offOf: e is `base` or `base + const`: the offset
pub fn off_of(ir: &Ir, e: E, base: i64) -> Option<f64> {
    match ir.get(e) {
        Node::Var(id) if id as i64 == base => Some(0.0),
        Node::Bin(BinOp::Add, a, b) => match (ir.get(a), ir.get(b)) {
            (Node::Var(id), Node::Const(v)) if id as i64 == base => Some(s_num(v)),
            _ => None,
        },
        _ => None,
    }
}

/// the (first) variable of a function holding parameter n
pub fn param_var(f: &Func, n: i32) -> Option<u32> {
    f.vars.iter().find(|v| v.param == n).map(|v| v.id)
}

/// the variable of a function holding its call's argument j (0-based)
pub fn arg_param(f: &Func, j: usize) -> Option<u32> {
    param_var(f, j as i32 + 1).or_else(|| if j >= 4 { param_var(f, 100 + j as i32 - 4) } else { None })
}

/// callOf: a call statement, a set / eval of a call expression: target, arguments
pub fn call_of(ir: &Ir, s: &Stmt) -> Option<(CallTarget, L)> {
    match s {
        Stmt::Call { t, args, .. } => Some((t.clone(), *args)),
        Stmt::Set { e, .. } | Stmt::Eval { e, .. } => match ir.get(*e) {
            Node::Call(t, args) => Some((ir.target(t), args)),
            _ => None,
        },
        _ => None,
    }
}

pub fn stmt_pc(s: &Stmt) -> i64 {
    crate::util::stmt_pc(s)
}

/// a new call expression of a call statement (`{ k: 'call', t: s.t, args: s.args }`)
pub fn call_expr(ir: &Ir, t: &CallTarget, args: L) -> E {
    let ti = ir.mk_target(t.clone());
    ir.mk(Node::Call(ti, args))
}

/// `{ k: 'load', size, addr: fp + o }`
pub fn frame_load(ir: &Ir, fp: i64, o: f64, size: u8) -> E {
    let a = ir.bin(BinOp::Add, ir.var(fp as u32), ir.c(o as i64 as u64));
    ir.load(size, a)
}

// ---- control-flow graphs ----

pub struct Cfg<'a> {
    pub f: &'a Func,
    pub rpo: Vec<i32>,
    pub idom: Vec<i32>,
    pub pc_block: HashMap<i64, usize>,
    pub cond_block: IndexMap<E, usize>,
    pub cond_key: RefCell<Option<HashMap<String, Vec<usize>>>>,
    pub ret_block: HashMap<E, usize>,
    pub pc_copies: HashMap<i64, Vec<usize>>,
}

pub fn cfg_of(f: &Func) -> Cfg<'_> {
    let (order, rpo) = compute_rpo(f);
    let idom = dominators(f, &order, &rpo);
    let mut pc_block: HashMap<i64, usize> = HashMap::new();
    let mut cond_block: IndexMap<E, usize> = IndexMap::new();
    let mut ret_block: HashMap<E, usize> = HashMap::new();
    let mut pc_copies: HashMap<i64, Vec<usize>> = HashMap::new();
    for (i, b) in f.blocks.iter().enumerate() {
        if rpo[i] < 0 {
            continue;
        }
        for s in &b.stmts {
            let pc = stmt_pc(s);
            match pc_block.get(&pc) {
                None => {
                    pc_block.insert(pc, i);
                }
                Some(&j) if j != i => {
                    let l = pc_copies.entry(pc).or_insert_with(|| vec![j]);
                    if !l.contains(&i) {
                        l.push(i);
                    }
                }
                _ => {}
            }
        }
        pc_block.entry(b.end).or_insert(i);
        match &b.term {
            Term::Br { c, .. } => {
                cond_block.insert(*c, i);
            }
            Term::Ret { e: Some(e) } => {
                ret_block.insert(*e, i);
            }
            _ => {}
        }
    }
    Cfg {
        f,
        rpo,
        idom,
        pc_block,
        cond_block,
        cond_key: RefCell::new(None),
        ret_block,
        pc_copies,
    }
}

pub fn dominates(g: &Cfg, a: usize, mut b: usize) -> bool {
    if g.rpo[a] < 0 || g.rpo[b] < 0 {
        return false;
    }
    for _ in 0..100000 {
        if a == b {
            return true;
        }
        if b == 0 {
            return false;
        }
        b = g.idom[b] as usize;
    }
    false
}

fn neg_cmp(op: CmpOp) -> Option<CmpOp> {
    Some(match op {
        CmpOp::Eq => CmpOp::Ne,
        CmpOp::Ne => CmpOp::Eq,
        CmpOp::Ugt => CmpOp::Ule,
        CmpOp::Uge => CmpOp::Ult,
        CmpOp::Ult => CmpOp::Uge,
        CmpOp::Ule => CmpOp::Ugt,
        CmpOp::Sgt => CmpOp::Sle,
        CmpOp::Sge => CmpOp::Slt,
        CmpOp::Slt => CmpOp::Sge,
        CmpOp::Sle => CmpOp::Sgt,
        _ => return None,
    })
}

/// a condition's shape up to negation
pub fn cond_key(ir: &Ir, e: E, d: u32) -> String {
    if d > 8 {
        return "…".into();
    }
    match ir.get(e) {
        Node::Lnot(a) => {
            if d == 0 {
                cond_key(ir, a, d)
            } else {
                format!("!{}", cond_key(ir, a, d + 1))
            }
        }
        Node::Cmp(op, a, b) => {
            let o = match (d == 0, neg_cmp(op)) {
                (true, Some(n)) => {
                    let mut v = [op.as_str(), n.as_str()];
                    v.sort();
                    format!("{}/{}", v[0], v[1])
                }
                _ => op.as_str().to_string(),
            };
            format!("({o} {} {})", cond_key(ir, a, d + 1), cond_key(ir, b, d + 1))
        }
        Node::Var(id) => format!("v{id}"),
        Node::Const(v) => format!("{v}"),
        Node::Load { size, addr } => format!("ld{size}({})", cond_key(ir, addr, d + 1)),
        Node::Bin(op, a, b) => format!("({} {} {})", op.as_str(), cond_key(ir, a, d + 1), cond_key(ir, b, d + 1)),
        Node::Ext { signed, bits, a } => format!("x{}{bits}({})", if signed { "s" } else { "u" }, cond_key(ir, a, d + 1)),
        Node::Land(a, b) => format!("(land {} {})", cond_key(ir, a, d + 1), cond_key(ir, b, d + 1)),
        Node::Lor(a, b) => format!("(lor {} {})", cond_key(ir, a, d + 1), cond_key(ir, b, d + 1)),
        Node::Fn(n, args) => format!(
            "{}({})",
            ir.name(n),
            ir.items(args).map(|a| cond_key(ir, a, d + 1)).collect::<Vec<_>>().join(",")
        ),
        Node::Call(_, args) => format!("call({})", ir.items(args).map(|a| cond_key(ir, a, d + 1)).collect::<Vec<_>>().join(",")),
        n => node_kind(&n).to_string(),
    }
}

pub fn node_kind(n: &Node) -> &'static str {
    match n {
        Node::Const(_) => "const",
        Node::Var(_) => "var",
        Node::Reg(_) => "reg",
        Node::Undef => "undef",
        Node::Bin(..) => "bin",
        Node::Neg(_) => "neg",
        Node::Not(_) => "not",
        Node::Ext { .. } => "ext",
        Node::Bswap { .. } => "bswap",
        Node::Load { .. } => "load",
        Node::Cmp(..) => "cmp",
        Node::Lnot(_) => "lnot",
        Node::Land(..) => "land",
        Node::Lor(..) => "lor",
        Node::Sel(..) => "sel",
        Node::Call(..) => "call",
        Node::Fn(..) => "fn",
        Node::Item(_) => "item",
    }
}

/// The block deciding a check's condition: the branch whose condition is (a leaf of) it, else the fail
/// side's branching predecessor.
pub fn decision_block(g: &Cfg, c: Option<E>, fail_pc: Option<i64>, pass_pc: Option<i64>) -> Option<usize> {
    let ir = fir(g.f);
    let mut leaves: Vec<usize> = Vec::new();
    fn leaf(g: &Cfg, ir: &Ir, e: E, out: &mut Vec<usize>) {
        if let Some(&b) = g.cond_block.get(&e) {
            out.push(b);
            return;
        }
        match ir.get(e) {
            Node::Lnot(a) => leaf(g, ir, a, out),
            Node::Land(a, b) | Node::Lor(a, b) => {
                leaf(g, ir, a, out);
                leaf(g, ir, b, out);
            }
            _ => {}
        }
    }
    if let Some(c) = c {
        leaf(g, ir, c, &mut leaves);
    }
    if leaves.is_empty() {
        if let Some(c) = c {
            {
                let mut ck = g.cond_key.borrow_mut();
                if ck.is_none() {
                    let mut m: HashMap<String, Vec<usize>> = HashMap::new();
                    for (e, &b) in &g.cond_block {
                        m.entry(cond_key(ir, *e, 0)).or_default().push(b);
                    }
                    *ck = Some(m);
                }
            }
            let mut bs: Vec<usize> = g.cond_key.borrow().as_ref().unwrap().get(&cond_key(ir, c, 0)).cloned().unwrap_or_default();
            let leads = |mut s: usize, pc: i64| -> bool {
                for _ in 0..4 {
                    let x = &g.f.blocks[s];
                    if x.stmts.iter().any(|st| stmt_pc(st) == pc) {
                        return true;
                    }
                    if x.succs.len() != 1 {
                        return false;
                    }
                    s = x.succs[0];
                }
                false
            };
            for pc in [fail_pc, pass_pc] {
                if bs.len() > 1 {
                    if let Some(pc) = pc {
                        bs.retain(|&b| g.f.blocks[b].succs.iter().any(|&s| leads(s, pc)));
                    }
                }
            }
            if bs.len() == 1 {
                leaves.push(bs[0]);
            }
        }
    }
    if !leaves.is_empty() {
        let mut a = leaves[0];
        for &b in &leaves[1..] {
            if g.rpo[a] > g.rpo[b] {
                a = b;
            }
        }
        return Some(a);
    }
    let fail_pc = fail_pc?;
    let mut b = g.pc_block.get(&fail_pc).copied();
    let blocks = &g.f.blocks;
    for _ in 0..4 {
        let Some(bb) = b else { break };
        let ps: Vec<usize> = blocks[bb].preds.iter().copied().filter(|&p| g.rpo[p] >= 0).collect();
        if ps.len() != 1 {
            return None;
        }
        b = Some(ps[0]);
        if matches!(blocks[ps[0]].term, Term::Br { .. }) {
            return Some(ps[0]);
        }
    }
    None
}

/// A path from the function's entry to block `to` that avoids block `avoid`.
pub fn bypass(g: &Cfg, avoid: usize, to: usize, allowed: Option<&dyn Fn(usize) -> bool>) -> Option<Vec<usize>> {
    if avoid == 0 {
        return None;
    }
    let blocks = &g.f.blocks;
    let mut prev = vec![-2i64; blocks.len()];
    prev[0] = -1;
    let mut q = std::collections::VecDeque::from([0usize]);
    while let Some(b) = q.pop_front() {
        if b == to {
            let mut path = Vec::new();
            let mut x = b as i64;
            while x >= 0 {
                path.push(x as usize);
                x = prev[x as usize];
            }
            path.reverse();
            return Some(path);
        }
        for &s in &blocks[b].succs {
            if s != avoid && prev[s] == -2 && allowed.is_none_or(|f| f(s)) {
                prev[s] = b as i64;
                q.push_back(s);
            }
        }
    }
    None
}

/// Is block `to` reachable from block `from` (allowed blocks only)?
pub fn reaches(g: &Cfg, from: usize, to: usize, allowed: Option<&dyn Fn(usize) -> bool>) -> bool {
    let blocks = &g.f.blocks;
    let mut seen = vec![false; blocks.len()];
    let mut q = vec![from];
    seen[from] = true;
    while let Some(b) = q.pop() {
        if b == to {
            return true;
        }
        for &s in &blocks[b].succs {
            if !seen[s] && allowed.is_none_or(|f| f(s)) {
                seen[s] = true;
                q.push(s);
            }
        }
    }
    false
}

/// The first statement pc of a block (its start when it has none).
pub fn block_pc(g: &Cfg, b: usize) -> i64 {
    g.f.blocks[b].stmts.first().map_or(g.f.blocks[b].start, stmt_pc)
}

/// variables with a single definition (`set`): their expression
pub fn single_defs(f: &Func) -> IndexMap<u32, E> {
    let mut out: IndexMap<u32, E> = IndexMap::new();
    let mut multi: HashSet<u32> = HashSet::new();
    for b in &f.blocks {
        for s in &b.stmts {
            let (d, set_e) = match s {
                Stmt::Set { dst, e, .. } => (*dst, Some(*e)),
                Stmt::Call { dst, .. } => (*dst, None),
                _ => continue,
            };
            if d < 0 {
                continue;
            }
            let d = d as u32;
            if out.contains_key(&d) || multi.contains(&d) || set_e.is_none() {
                out.shift_remove(&d);
                multi.insert(d);
            } else {
                out.insert(d, set_e.unwrap());
            }
        }
    }
    out
}

/// statements of a function in block (address) order: (block, index)
pub fn stmts_in_order(f: &Func) -> Vec<(usize, usize)> {
    let mut bs: Vec<usize> = (0..f.blocks.len()).collect();
    bs.sort_by_key(|&b| f.blocks[b].start);
    let mut out = Vec::new();
    for b in bs {
        for i in 0..f.blocks[b].stmts.len() {
            out.push((b, i));
        }
    }
    out
}

/// the printed right-hand side of a store line `stNN(addr, value)` / `x.f = value`
pub fn store_value(line: &str) -> String {
    let t = super::js_trim(line);
    let inner = t.strip_prefix("st").and_then(|r| {
        let d = r.bytes().take_while(|c| c.is_ascii_digit()).count();
        if d == 0 {
            return None;
        }
        r[d..].strip_prefix('(').and_then(|x| x.strip_suffix(')'))
    });
    let Some(m) = inner else {
        return match t.find(" = ") {
            Some(i) => t[i + 3..].to_string(),
            None => t.to_string(),
        };
    };
    let mut depth = 0i32;
    for (i, ch) in m.char_indices() {
        match ch {
            '(' | '[' => depth += 1,
            ')' | ']' => depth -= 1,
            ',' if depth == 0 => return super::js_trim(&m[i + 1..]).to_string(),
            _ => {}
        }
    }
    t.to_string()
}

// ---- callees: what a call writes ----

/// a function's IR (when decompiled) and name (library code)
pub struct Callee<'a> {
    pub f: Box<dyn Fn(i64) -> Option<&'a Func> + 'a>,
    pub name: Box<dyn Fn(i64) -> String + 'a>,
    /// the pre-repr(C) AccountInfo
    pub legacy: bool,
    memo: RefCell<HashMap<i64, f64>>,
    adv: RefCell<HashMap<(i64, usize, i64, i32), i64>>,
}

impl<'a> Callee<'a> {
    pub fn new(f: Box<dyn Fn(i64) -> Option<&'a Func> + 'a>, name: Box<dyn Fn(i64) -> String + 'a>, legacy: bool) -> Self {
        Callee {
            f,
            name,
            legacy,
            memo: RefCell::new(HashMap::new()),
            adv: RefCell::new(HashMap::new()),
        }
    }
}

/// memcpy / memmove of a constant size: (dst, src, n)
pub fn memcpy_of(ir: &Ir, t: &CallTarget, args: L, callee: Option<&Callee>) -> Option<(E, E, f64)> {
    let nm = match t {
        CallTarget::Sys { name, .. } => name.to_string(),
        CallTarget::Fn { pc } => callee.map_or(String::new(), |c| (c.name)(*pc)),
        _ => String::new(),
    };
    if !crate::jre!(r"^(sol_)?(memcpy|memmove)_?$").is_match(&nm) || args.len < 3 {
        return None;
    }
    match ir.get(ir.at(args, 2)) {
        Node::Const(v) if v <= 0x2000 => Some((ir.at(args, 0), ir.at(args, 1), v as f64)),
        _ => None,
    }
}

/// writes through a pointer argument by the callee's name (library code not decompiled)
fn lib_writes(nm: &str, sys: bool) -> f64 {
    if crate::jre!(r"find_program_address").is_match(nm) || nm.contains("create_program_address") {
        return 33.0;
    }
    if crate::jre!(r"^(sol_)?(memcpy|memmove|memset)").is_match(nm) {
        return -1.0;
    }
    if sys {
        let extra = if crate::jre!(r"log|invoke|get_.*sysvar|clock|rent").is_match(nm) {
            if crate::jre!(r"get_|clock|rent").is_match(nm) {
                0x40 as f64
            } else {
                0.0
            }
        } else {
            0x80 as f64
        };
        return 256.0 + extra;
    }
    0.0
}

struct WritesInfo {
    defs: HashMap<u32, Option<Vec<E>>>,
    fpv: i64,
    fst: Vec<(f64, E)>,
    narrow: Vec<f64>,
}

fn writes_info(f: &Func) -> WritesInfo {
    let ir = fir(f);
    let mut defs: HashMap<u32, Option<Vec<E>>> = HashMap::new();
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Call { dst, .. } => {
                    defs.insert(*dst as u32, None);
                }
                Stmt::Set { dst, e, .. } => {
                    let k = *dst as u32;
                    match defs.get_mut(&k) {
                        Some(None) => {}
                        Some(Some(l)) => l.push(*e),
                        None => {
                            defs.insert(k, Some(vec![*e]));
                        }
                    }
                }
                _ => {}
            }
        }
    }
    let fpv = fp_of(f);
    let mut fst: Vec<(f64, E)> = Vec::new();
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Store { size: 8, addr, v, .. } => {
                    if let Some(z) = off_of(ir, *addr, fpv) {
                        fst.push((z, *v));
                    }
                }
                Stmt::Stores { size: 8, addr, vals, .. } => {
                    if let Some(z) = off_of(ir, *addr, fpv) {
                        for (i, v) in ir.items(*vals).enumerate() {
                            fst.push((z + 8.0 * i as f64, v));
                        }
                    }
                }
                _ => {}
            }
        }
    }
    let mut ys: Vec<f64> = Vec::new();
    {
        let mut seen: HashSet<FK> = HashSet::new();
        for x in &fst {
            if seen.insert(FK::of(x.0)) {
                ys.push(x.0);
            }
        }
    }
    ys.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let mut hit: indexmap::IndexSet<FK> = indexmap::IndexSet::new();
    let mut hitv: Vec<f64> = Vec::new();
    for b in &f.blocks {
        for s in &b.stmts {
            let (a, n) = match s {
                Stmt::Store { size, addr, .. } if *size != 8 => (*addr, *size as f64),
                Stmt::Stores { size, addr, vals, .. } if *size != 8 => (*addr, *size as f64 * vals.len as f64),
                Stmt::Copy { dst, n, .. } => (*dst, *n as f64),
                _ => continue,
            };
            let Some(z) = off_of(ir, a, fpv) else { continue };
            let hi = z + n;
            let (mut lo, mut up) = (0usize, ys.len());
            while lo < up {
                let m = (lo + up) >> 1;
                if ys[m] < z - 7.0 {
                    lo = m + 1;
                } else {
                    up = m;
                }
            }
            let mut i = lo;
            while i < ys.len() && ys[i] < hi {
                if hit.insert(FK::of(ys[i])) {
                    hitv.push(ys[i]);
                }
                i += 1;
            }
        }
    }
    WritesInfo { defs, fpv, fst, narrow: hitv }
}

/// How many bytes a call may write through its argument j (a pointer to the caller's frame).
pub fn call_writes(fl: &FlowCtx, t: &CallTarget, j: usize, depth: i32) -> f64 {
    let cl = &fl.callee;
    let key = match t {
        CallTarget::Fn { pc } => ((*pc * 0x10000 + j as i64) * 4 + depth as i64) as f64,
        _ => -1.0,
    };
    if key >= 0.0 && depth > 0 {
        if let Some(&m) = cl.memo.borrow().get(&(key as i64)) {
            return m;
        }
    }
    let (nm, sys) = match t {
        CallTarget::Sys { name, .. } => (name.to_string(), true),
        CallTarget::Fn { pc } => ((cl.name)(*pc), false),
        _ => (String::new(), false),
    };
    let lw = lib_writes(&nm, sys);
    if lw != 0.0 {
        return if lw < 0.0 {
            if j == 0 {
                128.0
            } else {
                0.0
            }
        } else if lw >= 256.0 {
            lw - 256.0
        } else {
            lw
        };
    }
    let CallTarget::Fn { pc } = t else { return 128.0 };
    if depth <= 0 {
        return 128.0;
    }
    let f = (cl.f)(*pc);
    let pv = f.and_then(|f| arg_param(f, j));
    let mut n = 0f64;
    if let (Some(f), Some(pv)) = (f, pv) {
        let ir = fir(f);
        let w = fl.writes_info(f);
        let WritesInfo { defs, fpv, fst, narrow } = &*w;
        let spill: RefCell<HashMap<FK, bool>> = RefCell::new(HashMap::new());
        fn off(ir: &Ir, e: E, d: u32, pv: u32, defs: &HashMap<u32, Option<Vec<E>>>, fpv: i64, spill: &RefCell<HashMap<FK, bool>>) -> Option<f64> {
            if d > 8 {
                return None;
            }
            match ir.get(e) {
                Node::Var(id) => {
                    if id == pv {
                        return Some(0.0);
                    }
                    let l = defs.get(&id)?.as_ref()?;
                    let x = off(ir, l[0], d + 1, pv, defs, fpv, spill)?;
                    for (i, &y) in l.iter().enumerate() {
                        if i > 0 && off(ir, y, d + 1, pv, defs, fpv, spill) != Some(x) {
                            return None;
                        }
                    }
                    Some(x)
                }
                Node::Load { size: 8, addr } => {
                    let z = off_of(ir, addr, fpv)?;
                    if spill.borrow().get(&FK::of(z)).copied().unwrap_or(false) {
                        Some(0.0)
                    } else {
                        None
                    }
                }
                Node::Bin(BinOp::Add, a, b) => match ir.get(b) {
                    Node::Const(v) => off(ir, a, d + 1, pv, defs, fpv, spill).map(|x| x + s_num(v)),
                    _ => None,
                },
                _ => None,
            }
        }
        let offe = |e: E| off(ir, e, 0, pv, defs, *fpv, &spill);
        for (z, _) in fst {
            spill.borrow_mut().insert(FK::of(*z), true);
        }
        let mut ch = true;
        let mut k = 0;
        while ch && k < 4 {
            ch = false;
            for (z, v) in fst {
                if spill.borrow().get(&FK::of(*z)).copied().unwrap_or(false) && offe(*v) != Some(0.0) {
                    spill.borrow_mut().insert(FK::of(*z), false);
                    ch = true;
                }
            }
            k += 1;
        }
        for y in narrow {
            spill.borrow_mut().insert(FK::of(*y), false);
        }
        let sp = |z: Option<f64>| z.is_some_and(|z| spill.borrow().get(&FK::of(z)).copied().unwrap_or(false));
        'outer: for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Store { size: 8, addr, .. } = s {
                    if sp(off_of(ir, *addr, *fpv)) {
                        continue;
                    }
                }
                if let Stmt::Stores { size: 8, addr, vals, .. } = s {
                    if let Some(z) = off_of(ir, *addr, *fpv) {
                        if ir.items(*vals).enumerate().all(|(i, v)| offe(v).is_none() || sp(Some(z + 8.0 * i as f64))) {
                            continue;
                        }
                    }
                }
                match s {
                    Stmt::Store { size, addr, v, .. } => {
                        if let Some(a) = offe(*addr) {
                            n = n.max(a + *size as f64);
                        }
                        if offe(*v).is_some() {
                            n = n.max(128.0);
                            break 'outer;
                        }
                    }
                    Stmt::Stores { size, addr, vals, .. } => {
                        if let Some(a) = offe(*addr) {
                            n = n.max(a + *size as f64 * vals.len as f64);
                        }
                        if ir.items(*vals).any(|v| offe(v).is_some()) {
                            n = n.max(128.0);
                            break 'outer;
                        }
                    }
                    Stmt::Copy { dst, n: cn, .. } => {
                        if let Some(a) = offe(*dst) {
                            n = n.max(a + *cn as f64);
                        }
                    }
                    _ => {}
                }
                if let Some((ct, args)) = call_of(ir, s) {
                    let mc = memcpy_of(ir, &ct, args, Some(cl));
                    for (k, a) in ir.items(args).enumerate() {
                        if let Some(a) = offe(a) {
                            let w = match (&mc, k) {
                                (Some(m), 0) => m.2,
                                _ => call_writes(fl, &ct, k, depth - 1),
                            };
                            n = n.max(a + w);
                        }
                    }
                }
            }
        }
    } else {
        n = 128.0;
    }
    cl.memo.borrow_mut().insert(key as i64, n);
    n
}

/// An accounts iterator advanced by a callee (see flow.ts iterAdvance): the AccountInfos taken on a path.
pub fn iter_advance(fl: &FlowCtx, pc: i64, j: usize, k: i64, depth: i32) -> i64 {
    let cl = &fl.callee;
    let key = (pc, j, k, depth);
    if let Some(&h) = cl.adv.borrow().get(&key) {
        return h;
    }
    cl.adv.borrow_mut().insert(key, 0);
    let g = (cl.f)(pc);
    let pv = g.and_then(|g| param_var(g, j as i32 + 1));
    let mut n = 0;
    if let (Some(g), Some(pv)) = (g, pv) {
        let gd = fl.defs_of(g, false);
        let ir = fir(g);
        let root = |e: E| -> E {
            let mut e = e;
            let mut d = 0;
            loop {
                match ir.get(e) {
                    Node::Var(id) if d < 6 && gd.defs.contains_key(&id) => {
                        e = gd.defs[&id];
                        d += 1;
                    }
                    Node::Ext { a, .. } => {
                        e = a;
                        d += 1;
                    }
                    _ => return e,
                }
            }
        };
        let is_var_pv = |e: E| matches!(ir.get(root(e)), Node::Var(id) if id == pv);
        let is_iter = |e: E| -> bool {
            let x = root(e);
            let Node::Load { size: 8, addr } = ir.get(x) else { return false };
            if k == 0 && is_var_pv(addr) {
                return true;
            }
            match ir.get(root(addr)) {
                Node::Bin(BinOp::Add, a, b) => is_var_pv(a) && ir.get(b) == Node::Const(k as u64),
                _ => false,
            }
        };
        let add30 = |v: E| matches!(ir.get(root(v)), Node::Bin(BinOp::Add, _, b) if ir.get(b) == Node::Const(0x30));
        'o: for b in &g.blocks {
            for st in &b.stmts {
                if n != 0 {
                    break 'o;
                }
                if let Stmt::Store { size: 8, addr, v, .. } = st {
                    if is_iter(*addr) && add30(*v) {
                        n = 1;
                    }
                }
                if n == 0 && depth > 0 {
                    if let Some((CallTarget::Fn { pc: t }, args)) = call_of(ir, st) {
                        for (i, a) in ir.items(args).enumerate() {
                            if n != 0 {
                                break;
                            }
                            if is_var_pv(a) {
                                n = iter_advance(fl, t, i, k, depth - 1);
                            } else if is_iter(a) {
                                n = iter_advance(fl, t, i, 0, depth - 1);
                            }
                        }
                    }
                }
            }
        }
        if n == 0 && k == 0 {
            for b in &g.blocks {
                for st in &b.stmts {
                    if n != 0 {
                        break;
                    }
                    if let Stmt::Store { size: 8, addr, v, .. } = st {
                        if is_var_pv(*addr) && add30(*v) {
                            n = 1;
                        }
                    }
                }
            }
        }
    }
    cl.adv.borrow_mut().insert(key, n);
    n
}

// ---- reaching definitions ----

#[derive(Clone, Copy, PartialEq, Debug)]
enum EndV {
    Top,
    Null,
    Def(E, Pos),
}

/// Definitions in a function: single ones (a `set` or a call result), and the others and frame slots by
/// position (reaching definitions).
pub struct Defs<'a> {
    pub f: &'a Func,
    pub ir: &'a Ir,
    pub fp: i64,
    pub defs: IndexMap<u32, E>,
    pub def_pos: HashMap<u32, Pos>,
    pub multi: HashSet<u32>,
    /// branch condition (by identity) -> position
    pub pos_e: HashMap<E, Pos>,
    with_callee: bool,
    slot_at: RefCell<Vec<Option<Rc<Vec<usize>>>>>,
    var_at: RefCell<Vec<Option<Rc<HashMap<u32, Vec<usize>>>>>>,
    end_memo: RefCell<HashMap<FK, Vec<Option<EndV>>>>,
    open: RefCell<Vec<bool>>,
    adv_memo: RefCell<HashMap<Pos, Option<Rc<Vec<(f64, i64)>>>>>,
}

/// the key of a frame slot (negative; its own inverse)
pub fn slot(o: f64) -> f64 {
    -16777216.0 - o
}

impl<'a> Defs<'a> {
    pub fn new(f: &'a Func, with_callee: bool) -> Defs<'a> {
        let ir = fir(f);
        let fp = fp_of(f);
        let mut defs: IndexMap<u32, E> = IndexMap::new();
        let mut def_pos: HashMap<u32, Pos> = HashMap::new();
        let mut multi: HashSet<u32> = HashSet::new();
        let mut pos_e: HashMap<E, Pos> = HashMap::new();
        for (bi, b) in f.blocks.iter().enumerate() {
            for (i, s) in b.stmts.iter().enumerate() {
                let (d, e) = match s {
                    Stmt::Set { dst, e, .. } => (*dst, Some(*e)),
                    Stmt::Call { dst, .. } => (*dst, None),
                    _ => continue,
                };
                if d < 0 {
                    continue;
                }
                let d = d as u32;
                if defs.contains_key(&d) || multi.contains(&d) {
                    defs.shift_remove(&d);
                    multi.insert(d);
                } else {
                    let x = match (e, s) {
                        (Some(e), _) => e,
                        (None, Stmt::Call { t, args, .. }) => call_expr(ir, t, *args),
                        _ => unreachable!(),
                    };
                    defs.insert(d, x);
                    def_pos.insert(d, pos_of(bi, i));
                }
            }
            if let Term::Br { c, .. } = &b.term {
                pos_e.insert(*c, pos_of(bi, b.stmts.len()));
            }
        }
        let n = f.blocks.len();
        Defs {
            f,
            ir,
            fp,
            defs,
            def_pos,
            multi,
            pos_e,
            with_callee,
            slot_at: RefCell::new(vec![None; n]),
            var_at: RefCell::new(vec![None; n]),
            end_memo: RefCell::new(HashMap::new()),
            open: RefCell::new(vec![false; n]),
            adv_memo: RefCell::new(HashMap::new()),
        }
    }

    pub fn fp_off(&self, e: E) -> Option<f64> {
        off_of(self.ir, e, self.fp)
    }

    /// a single definition or the definition reaching p (variables only)
    pub fn def_at(&self, fl: &FlowCtx, id: u32, p: Pos) -> Option<(E, Pos)> {
        if let Some(&e) = self.defs.get(&id) {
            return Some((e, self.def_pos[&id]));
        }
        if self.multi.contains(&id) {
            return self.reaching(fl, id as f64, p, false);
        }
        None
    }

    fn copy_load(&self, src: E, o: f64, a: f64) -> E {
        let ir = self.ir;
        let k = (o - a) as i64 as u64;
        let addr = match self.fp_off(src) {
            Some(s) => ir.bin(BinOp::Add, ir.var(self.fp as u32), ir.c((s + o - a) as i64 as u64)),
            None => {
                if k != 0 {
                    ir.bin(BinOp::Add, src, ir.c(k))
                } else {
                    src
                }
            }
        };
        ir.load(8, addr)
    }

    /// What a statement does to a variable (key >= 0) / a frame slot (key < 0): Some(Some(value)),
    /// Some(None) (clobbered) or None (untouched).
    fn effect(&self, fl: &FlowCtx, bi: usize, si: usize, key: f64, loose: bool) -> Option<Option<E>> {
        let ir = self.ir;
        let s = &self.f.blocks[bi].stmts[si];
        if key >= 0.0 {
            return match s {
                Stmt::Set { dst, e, .. } if *dst as f64 == key => Some(Some(*e)),
                Stmt::Call { dst, t, args, .. } if *dst as f64 == key => Some(Some(call_expr(ir, t, *args))),
                _ => None,
            };
        }
        let o = slot(key);
        match s {
            Stmt::Store { size, addr, v, .. } => {
                let a = self.fp_off(*addr)?;
                if a == o {
                    return Some(if *size == 8 || loose { Some(*v) } else { None });
                }
                return if a < o + 8.0 && a + *size as f64 > o { Some(None) } else { None };
            }
            Stmt::Stores { size, addr, vals, .. } => {
                let a = self.fp_off(*addr)?;
                let n = vals.len as f64 * *size as f64;
                if a >= o + 8.0 || a + n <= o {
                    return None;
                }
                let sz = *size as f64;
                if (*size == 8 || loose) && (o - a) % sz == 0.0 {
                    let idx = (o - a) / sz;
                    if idx < 0.0 || idx >= vals.len as f64 {
                        return None;
                    }
                    return Some(Some(ir.at(*vals, idx as u32)));
                }
                return Some(None);
            }
            Stmt::Copy { dst, src, n, .. } => {
                let a = self.fp_off(*dst)?;
                let n = *n as f64;
                if a >= o + 8.0 || a + n <= o {
                    return None;
                }
                if (!loose && a + n < o + 8.0) || a > o {
                    return Some(None);
                }
                return Some(Some(self.copy_load(*src, o, a)));
            }
            _ => {}
        }
        let (ct, args) = call_of(ir, s)?;
        let callee = if self.with_callee { Some(&fl.callee) } else { None };
        if let Some(mc) = memcpy_of(ir, &ct, args, callee) {
            let a = self.fp_off(mc.0)?;
            if a >= o + 8.0 || a + mc.2 <= o {
                return None;
            }
            if a > o || a + mc.2 < o + 8.0 {
                return Some(None);
            }
            return Some(Some(self.copy_load(mc.1, o, a)));
        }
        for (j, a) in ir.items(args).enumerate() {
            if let Some(p) = self.fp_off(a) {
                let w = if self.with_callee { call_writes(fl, &ct, j, 3) } else { 128.0 };
                if p <= o && o < p + w {
                    return Some(if loose { Some(call_expr(ir, &ct, args)) } else { None });
                }
            }
        }
        let mut all: Vec<E> = ir.to_vec(args);
        if let Stmt::Call { extra: Some(x), .. } = s {
            all.extend(ir.items(*x));
        }
        for a in all {
            let Node::Call(t, cargs) = ir.get(a) else { continue };
            let Some(nc) = memcpy_of(ir, &ir.target(t), cargs, callee) else { continue };
            let Some(d) = self.fp_off(nc.0) else { continue };
            if d >= o + 8.0 || d + nc.2 <= o {
                continue;
            }
            if d > o || d + nc.2 < o + 8.0 {
                return Some(None);
            }
            return Some(Some(self.copy_load(nc.1, o, d)));
        }
        if self.with_callee && matches!(ct, CallTarget::Fn { .. }) && !loose {
            if let Some(adv) = self.advanced_at(fl, bi, si, &ct, args) {
                if let Some(&(_, n)) = adv.iter().find(|x| x.0 == o) {
                    if n != 0 {
                        let l = frame_load(ir, self.fp, o, 8);
                        return Some(Some(ir.bin(BinOp::Add, l, ir.c((0x30 * n) as u64))));
                    }
                }
            }
        }
        None
    }

    /// per call: the frame slots (iterator cursors) it advances, by the AccountInfos taken
    fn advanced_at(&self, fl: &FlowCtx, bi: usize, si: usize, ct: &CallTarget, args: L) -> Option<Rc<Vec<(f64, i64)>>> {
        let key = pos_of(bi, si);
        if let Some(x) = self.adv_memo.borrow().get(&key) {
            return x.clone();
        }
        self.adv_memo.borrow_mut().insert(key, None);
        let ir = self.ir;
        let mut out: Option<Vec<(f64, i64)>> = None;
        if let CallTarget::Fn { pc } = ct {
            for (j, a) in ir.items(args).enumerate() {
                let Some(p) = self.fp_off(a) else { continue };
                let mut k = 0;
                while k < 0x40 {
                    let x = self.last(fl, bi, si, slot(p + k as f64), false);
                    let o = match x {
                        Some(Some((e, _))) => self.fp_off(e),
                        _ => None,
                    };
                    if let Some(o) = o {
                        let n = iter_advance(fl, *pc, j, k, 2);
                        if n != 0 {
                            let v = out.get_or_insert_with(Vec::new);
                            match v.iter_mut().find(|y| y.0 == o) {
                                Some(y) => y.1 = n,
                                None => v.push((o, n)),
                            }
                        }
                    }
                    k += 8;
                }
            }
        }
        let r = out.map(Rc::new);
        self.adv_memo.borrow_mut().insert(key, r.clone());
        r
    }

    fn slot_stmts(&self, b: usize) -> Rc<Vec<usize>> {
        if let Some(r) = &self.slot_at.borrow()[b] {
            return r.clone();
        }
        let ir = self.ir;
        let mut r = Vec::new();
        for (i, s) in self.f.blocks[b].stmts.iter().enumerate() {
            let hit = match s {
                Stmt::Store { addr, .. } | Stmt::Stores { addr, .. } => self.fp_off(*addr).is_some(),
                Stmt::Copy { dst, .. } => self.fp_off(*dst).is_some(),
                _ => call_of(ir, s).is_some(),
            };
            if hit {
                r.push(i);
            }
        }
        let r = Rc::new(r);
        self.slot_at.borrow_mut()[b] = Some(r.clone());
        r
    }

    fn var_stmts(&self, b: usize) -> Rc<HashMap<u32, Vec<usize>>> {
        if let Some(r) = &self.var_at.borrow()[b] {
            return r.clone();
        }
        let mut r: HashMap<u32, Vec<usize>> = HashMap::new();
        for (i, s) in self.f.blocks[b].stmts.iter().enumerate() {
            match s {
                Stmt::Set { dst, .. } | Stmt::Call { dst, .. } if *dst >= 0 => r.entry(*dst as u32).or_default().push(i),
                _ => {}
            }
        }
        let r = Rc::new(r);
        self.var_at.borrow_mut()[b] = Some(r.clone());
        r
    }

    /// the last statement of block b before `to` affecting key: Some(Some(value, pos)), Some(None)
    /// (clobbered), None (none)
    fn last(&self, fl: &FlowCtx, b: usize, to: usize, key: f64, loose: bool) -> Option<Option<(E, Pos)>> {
        let cand: Vec<usize> = if key >= 0.0 {
            self.var_stmts(b).get(&(key as u32)).cloned().unwrap_or_default()
        } else {
            (*self.slot_stmts(b)).clone()
        };
        for &i in cand.iter().rev() {
            if i >= to {
                continue;
            }
            if let Some(x) = self.effect(fl, b, i, key, loose) {
                return Some(x.map(|e| (e, pos_of(b, i))));
            }
        }
        None
    }

    fn meet(&self, b: usize, val: &dyn Fn(usize) -> Option<EndV>) -> EndV {
        let mut r = EndV::Top;
        for &q in &self.f.blocks[b].preds {
            let x = val(q);
            match x {
                None | Some(EndV::Top) => continue,
                Some(EndV::Null) => return EndV::Null,
                Some(EndV::Def(e, p)) => {
                    if let EndV::Def(re, _) = r {
                        if re != e {
                            return EndV::Null;
                        }
                    }
                    r = EndV::Def(e, p);
                }
            }
        }
        r
    }

    /// the definition of key reaching position p (the same one on every path), with its position
    pub fn reaching(&self, fl: &FlowCtx, key: f64, p: Pos, loose: bool) -> Option<(E, Pos)> {
        let b0 = (p >> 16) as usize;
        if let Some(x0) = self.last(fl, b0, (p & 0xffff) as usize, key, loose) {
            return x0;
        }
        let mkey = FK::of(key * 2.0 + if loose { 1.0 } else { 0.0 });
        let n = self.f.blocks.len();
        self.end_memo.borrow_mut().entry(mkey).or_insert_with(|| vec![None; n]);
        let known = |q: usize| self.end_memo.borrow()[&mkey][q];
        let set_known = |q: usize, v: EndV| self.end_memo.borrow_mut().get_mut(&mkey).unwrap()[q] = Some(v);
        let mut todo: Vec<usize> = Vec::new();
        let mut stack: Vec<usize> = self.f.blocks[b0].preds.clone();
        while let Some(q) = stack.pop() {
            if known(q).is_some() || self.open.borrow()[q] {
                continue;
            }
            let len = self.f.blocks[q].stmts.len();
            if let Some(x) = self.last(fl, q, len, key, loose) {
                set_known(q, match x {
                    Some((e, p)) => EndV::Def(e, p),
                    None => EndV::Null,
                });
                continue;
            }
            let preds = &self.f.blocks[q].preds;
            if preds.is_empty() {
                set_known(q, EndV::Null);
                continue;
            }
            self.open.borrow_mut()[q] = true;
            todo.push(q);
            stack.extend(preds.iter().copied());
        }
        if !todo.is_empty() {
            let cur: RefCell<HashMap<usize, EndV>> = RefCell::new(todo.iter().map(|&q| (q, EndV::Top)).collect());
            let val = |q: usize| -> Option<EndV> {
                if self.open.borrow()[q] {
                    cur.borrow().get(&q).copied()
                } else {
                    known(q)
                }
            };
            let mut succs: HashMap<usize, Vec<usize>> = HashMap::new();
            for &q in &todo {
                for &r in &self.f.blocks[q].preds {
                    if self.open.borrow()[r] {
                        succs.entry(r).or_default().push(q);
                    }
                }
            }
            let mut work: Vec<usize> = todo.clone();
            let mut in_w = vec![false; n];
            for &q in &todo {
                in_w[q] = true;
            }
            while let Some(q) = work.pop() {
                in_w[q] = false;
                let v = self.meet(q, &val);
                let o = cur.borrow()[&q];
                let same = match (v, o) {
                    (EndV::Def(a, _), EndV::Def(b, _)) => a == b,
                    _ => v == o,
                };
                if same {
                    continue;
                }
                cur.borrow_mut().insert(q, v);
                if let Some(ss) = succs.get(&q) {
                    for &s in ss {
                        if !in_w[s] {
                            in_w[s] = true;
                            work.push(s);
                        }
                    }
                }
            }
            for &q in &todo {
                let v = cur.borrow()[&q];
                set_known(q, v);
                self.open.borrow_mut()[q] = false;
            }
        }
        match self.meet(b0, &known) {
            EndV::Def(e, p) => Some((e, p)),
            _ => None,
        }
    }
}

/// a stored value that is a sum / difference (through its variables' definitions): += / -=, else =
pub fn arith_how(fl: &FlowCtx, d: &Defs, e: E, p: Pos) -> &'static str {
    let ir = d.ir;
    let (mut e, mut p) = (e, p);
    for _ in 0..6 {
        match ir.get(e) {
            Node::Ext { a, .. } => {
                e = a;
                continue;
            }
            Node::Bin(op @ (BinOp::Add | BinOp::Sub), _, b) if !matches!(ir.get(b), Node::Const(_)) => {
                return if op == BinOp::Add { "+=" } else { "-=" };
            }
            Node::Var(id) => match d.def_at(fl, id, p) {
                Some(y) => {
                    (e, p) = y;
                }
                None => break,
            },
            _ => break,
        }
    }
    "="
}

/// The flow layer's shared state for one program: the callees, per-function definitions (by callee kind),
/// the memos keyed by function; `ev_cuts` counts evaluations cut by a depth limit (shared by every
/// evaluator: a memo entry is kept only when none happened below it).
pub struct FlowCtx<'a> {
    pub callee: Callee<'a>,
    defs: RefCell<HashMap<(i64, bool), Rc<Defs<'a>>>>,
    winfo: RefCell<HashMap<i64, Rc<WritesInfo>>>,
    same: RefCell<HashMap<(i64, bool, u32), Option<(E, Pos)>>>,
    pub ev_cuts: Cell<u64>,
    pub cache: super::acct::AcctCache<'a>,
}

impl<'a> FlowCtx<'a> {
    pub fn new(callee: Callee<'a>) -> Self {
        FlowCtx {
            callee,
            defs: RefCell::new(HashMap::new()),
            winfo: RefCell::new(HashMap::new()),
            same: RefCell::new(HashMap::new()),
            ev_cuts: Cell::new(0),
            cache: Default::default(),
        }
    }
    pub fn defs_of(&self, f: &'a Func, with_callee: bool) -> Rc<Defs<'a>> {
        let k = (f.pc, with_callee);
        if let Some(d) = self.defs.borrow().get(&k) {
            return d.clone();
        }
        let d = Rc::new(Defs::new(f, with_callee));
        self.defs.borrow_mut().insert(k, d.clone());
        d
    }
    fn writes_info(&self, f: &Func) -> Rc<WritesInfo> {
        if let Some(w) = self.winfo.borrow().get(&f.pc) {
            return w.clone();
        }
        let w = Rc::new(writes_info(f));
        self.winfo.borrow_mut().insert(f.pc, w.clone());
        w
    }
}

/// a variable defined on several paths by loads of one frame word holding the same value at each: that load
fn same_loads(fl: &FlowCtx, d: &Defs, id: u32) -> Option<(E, Pos)> {
    let k = (d.f.pc, d.with_callee, id);
    if let Some(x) = fl.same.borrow().get(&k) {
        return *x;
    }
    fl.same.borrow_mut().insert(k, None);
    let ir = d.ir;
    let mut ds: Vec<(E, Pos)> = Vec::new();
    for (bi, b) in d.f.blocks.iter().enumerate() {
        for (i, st) in b.stmts.iter().enumerate() {
            if let Stmt::Set { dst, e, .. } = st {
                if *dst as i64 == id as i64 {
                    ds.push((*e, pos_of(bi, i)));
                }
            }
        }
    }
    if ds.len() < 2 || ds.len() > 8 {
        return None;
    }
    let mut val: Option<E> = None;
    for &(e, q) in &ds {
        let o = match ir.get(e) {
            Node::Load { size: 8, addr } => d.fp_off(addr),
            _ => None,
        };
        let y = o.and_then(|o| d.reaching(fl, slot(o), q, true));
        let Some((y, _)) = y else { return None };
        if val.is_some_and(|v| v != y) {
            return None;
        }
        val = Some(y);
    }
    fl.same.borrow_mut().insert(k, Some(ds[0]));
    Some(ds[0])
}

/// Anchor try_accounts: the accounts two 32-byte comparisons read (compareAccounts); None: no comparison
pub fn compare_accounts(
    fl: &FlowCtx,
    d: &Defs,
    c: E,
    p0: Pos,
    calls: &HashMap<Pos, String>,
    acct_var: Option<&dyn Fn(u32) -> Option<String>>,
    infos: Option<(&HashMap<Pos, String>, &HashMap<u32, String>)>,
) -> Option<Vec<(String, bool)>> {
    let ir = d.ir;
    let mut x = c;
    while let Node::Lnot(a) = ir.get(x) {
        x = a;
    }
    let cmp_args = |e: E| -> Option<(E, E)> {
        let args = match ir.get(e) {
            Node::Call(_, a) => a,
            Node::Fn(n, a) if &*ir.name(n) == "memeq" => a,
            _ => return None,
        };
        if args.len >= 3 && ir.get(ir.at(args, 2)) == Node::Const(0x20) {
            Some((ir.at(args, 0), ir.at(args, 1)))
        } else {
            None
        }
    };
    let follow = |e: E, p: Pos| -> (E, Pos) {
        let (mut e, mut p) = (e, p);
        for _ in 0..6 {
            match ir.get(e) {
                Node::Ext { a, .. } => {
                    e = a;
                    continue;
                }
                Node::Var(id) => {
                    let y = if let Some(&x) = d.defs.get(&id) {
                        Some((x, d.def_pos[&id]))
                    } else if d.multi.contains(&id) {
                        d.reaching(fl, id as f64, p, false).or_else(|| same_loads(fl, d, id))
                    } else {
                        None
                    };
                    let Some(y) = y else { break };
                    (e, p) = y;
                }
                _ => break,
            }
        }
        (e, p)
    };
    let mut ca: Option<(E, E)> = None;
    let mut cp = p0;
    let sides: Vec<E> = match ir.get(x) {
        Node::Cmp(_, a, b) => vec![a, b],
        _ => vec![x],
    };
    for side in sides {
        let (e, p) = follow(side, p0);
        if ca.is_none() {
            ca = cmp_args(e);
        }
        if ca.is_some() && cp == p0 {
            cp = p;
        }
    }
    let ca = ca?;
    fn prov(
        fl: &FlowCtx,
        d: &Defs,
        follow: &dyn Fn(E, Pos) -> (E, Pos),
        calls: &HashMap<Pos, String>,
        acct_var: Option<&dyn Fn(u32) -> Option<String>>,
        infos: Option<(&HashMap<Pos, String>, &HashMap<u32, String>)>,
        cp: Pos,
        e: E,
        p: Pos,
        direct: bool,
        dd: u32,
    ) -> Option<(String, bool)> {
        if dd > 10 {
            return None;
        }
        let ir = d.ir;
        let (e, p) = follow(e, p);
        if let Some(o) = d.fp_off(e) {
            let (y0, y1) = d.reaching(fl, slot(o), p, true)?;
            let (v, q) = follow(y0, y1);
            if matches!(ir.get(v), Node::Call(..)) {
                return calls.get(&y1).map(|a| (a.clone(), direct));
            }
            let ia = if direct {
                None
            } else {
                match ir.get(v) {
                    Node::Load { .. } => infos.and_then(|i| i.0.get(&q).cloned()),
                    Node::Var(id) => infos.and_then(|i| i.1.get(&id).cloned()),
                    _ => None,
                }
            };
            if let Some(ia) = ia {
                return Some((ia, direct));
            }
            if !direct && d.fp_off(v).is_some() {
                return prov(fl, d, follow, calls, acct_var, infos, cp, v, cp, true, dd + 1);
            }
            return match ir.get(v) {
                Node::Load { addr, .. } => prov(fl, d, follow, calls, acct_var, infos, cp, addr, q, direct, dd + 1),
                _ => None,
            };
        }
        let base = match ir.get(e) {
            Node::Bin(BinOp::Add, a, b) if matches!(ir.get(b), Node::Const(_)) => a,
            _ => e,
        };
        let (b, q) = follow(base, p);
        if let Node::Var(id) = ir.get(b) {
            if !direct {
                if let Some(a) = acct_var.and_then(|f| f(id)) {
                    return Some((a, direct));
                }
            }
        }
        match ir.get(b) {
            Node::Load { size: 8, addr } => prov(fl, d, follow, calls, acct_var, infos, cp, addr, q, false, dd + 1),
            _ => None,
        }
    }
    let res: Vec<(String, bool)> = [ca.0, ca.1].iter().filter_map(|&a| prov(fl, d, &follow, calls, acct_var, infos, cp, a, cp, true, 0)).collect();
    Some(res)
}
