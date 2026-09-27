//! Stack slot promotion (`src/stack.ts`): frame locations accessed only directly (fp + const, one
//! fixed size) and not reachable through any escaped frame pointer become ordinary variables.
//!
//! Offsets are JS numbers in TS (`Number(BigInt.asIntN(64, c))`, rounded past 2^53): `f64` here.

use indexmap::IndexMap;
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, Term, E, L};
use sbpf_program::{Block, Func, Promoted, VarInfo};

const FRAME: f64 = 4096.0;

/// `Number(BigInt.asIntN(64, v))`
pub fn js_i64(v: u64) -> f64 {
    v as i64 as f64
}

/// fp + const → the constant (as a JS number), fp → 0.
pub fn fp_offset(ir: &Ir, e: E, fp: u32) -> Option<f64> {
    match ir.get(e) {
        Node::Var(id) if id == fp => Some(0.0),
        Node::Bin(BinOp::Add, a, b) => match (ir.get(a), ir.get(b)) {
            (Node::Var(id), Node::Const(c)) if id == fp => Some(js_i64(c)),
            _ => None,
        },
        _ => None,
    }
}

/// `BigInt.asUintN(64, BigInt(x))` of an integral double.
pub fn js_as_u64(x: f64) -> u64 {
    debug_assert!(x.fract() == 0.0);
    (x as i128) as u64
}

pub fn uses_var(ir: &Ir, e: E, v: u32) -> bool {
    let mut u = false;
    ir.walk(e, &mut |_, n| {
        if n == Node::Var(v) {
            u = true;
        }
    });
    u
}

struct Scan<'a> {
    ir: &'a Ir,
    fp: u32,
    /// off (f64 bits) -> sizes (insertion order)
    accesses: IndexMap<u64, (f64, Vec<u8>)>,
    low_escape: f64,
    whole_frame: bool,
    arg_area: bool,
}

impl Scan<'_> {
    fn note_access(&mut self, off: f64, size: u8) {
        let s = &mut self
            .accesses
            .entry(off.to_bits())
            .or_insert((off, vec![]))
            .1;
        if !s.contains(&size) {
            s.push(size);
        }
    }
    fn escape(&mut self, off: Option<f64>) {
        let Some(off) = off else {
            self.whole_frame = true;
            return;
        };
        if off == 0.0 {
            self.arg_area = true;
            return;
        }
        if off < -FRAME || off > 0.0 {
            self.whole_frame = true;
            return;
        }
        self.low_escape = self.low_escape.min(off);
    }
    /// `addr_ctx`: this node is the address of a load/store of that size
    fn visit(&mut self, e: E, addr_ctx: Option<u8>) {
        let ir = self.ir;
        if let Some(off) = fp_offset(ir, e, self.fp) {
            match addr_ctx {
                Some(sz) => self.note_access(off, sz),
                None => self.escape(Some(off)),
            }
            return;
        }
        match ir.get(e) {
            Node::Var(_) => {}
            Node::Load { size, addr } => self.visit(addr, Some(size)),
            Node::Bin(op, a, b) => {
                if op == BinOp::Add {
                    let oa = fp_offset(ir, a, self.fp);
                    let ob = fp_offset(ir, b, self.fp);
                    if oa.is_some() {
                        self.escape(oa);
                        self.visit(b, None);
                        return;
                    }
                    if ob.is_some() {
                        self.escape(ob);
                        self.visit(a, None);
                        return;
                    }
                    self.visit(a, None);
                    self.visit(b, None);
                    return;
                }
                if uses_var(ir, e, self.fp) {
                    self.whole_frame = true;
                }
            }
            Node::Neg(_) | Node::Not(_) | Node::Ext { .. } | Node::Bswap { .. } | Node::Lnot(_) => {
                if uses_var(ir, e, self.fp) {
                    self.whole_frame = true;
                }
            }
            Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                self.visit(a, None);
                self.visit(b, None);
            }
            Node::Sel(c, a, b) => {
                self.visit(c, None);
                self.visit(a, None);
                self.visit(b, None);
            }
            Node::Call(t, args) => {
                for a in ir.items(args) {
                    self.visit(a, None);
                }
                if let CallTarget::Ind { e } = ir.target(t) {
                    self.visit(e, None);
                }
            }
            Node::Fn(_, args) => {
                for a in ir.items(args) {
                    self.visit(a, None);
                }
            }
            _ => {}
        }
    }
}

/// Rebuilds `e` in the same arena, replacing nodes where `f` says so (pre-order), as TS's
/// `{ ...e, a: rw(e.a) }` rewrites do (new nodes for every inner node, leaves kept).
pub fn rebuild(ir: &Ir, e: E, f: &mut dyn FnMut(&Ir, E, Node) -> Option<E>) -> E {
    let n = ir.get(e);
    if let Some(r) = f(ir, e, n) {
        return r;
    }
    match n {
        Node::Bin(op, a, b) => {
            let a = rebuild(ir, a, f);
            let b = rebuild(ir, b, f);
            ir.mk(Node::Bin(op, a, b))
        }
        Node::Cmp(op, a, b) => {
            let a = rebuild(ir, a, f);
            let b = rebuild(ir, b, f);
            ir.mk(Node::Cmp(op, a, b))
        }
        Node::Land(a, b) => {
            let a = rebuild(ir, a, f);
            let b = rebuild(ir, b, f);
            ir.mk(Node::Land(a, b))
        }
        Node::Lor(a, b) => {
            let a = rebuild(ir, a, f);
            let b = rebuild(ir, b, f);
            ir.mk(Node::Lor(a, b))
        }
        Node::Neg(a) => {
            let a = rebuild(ir, a, f);
            ir.mk(Node::Neg(a))
        }
        Node::Not(a) => {
            let a = rebuild(ir, a, f);
            ir.mk(Node::Not(a))
        }
        Node::Lnot(a) => {
            let a = rebuild(ir, a, f);
            ir.mk(Node::Lnot(a))
        }
        Node::Ext { signed, bits, a } => {
            let a = rebuild(ir, a, f);
            ir.mk(Node::Ext { signed, bits, a })
        }
        Node::Bswap { bits, a } => {
            let a = rebuild(ir, a, f);
            ir.mk(Node::Bswap { bits, a })
        }
        Node::Load { size, addr } => {
            let addr = rebuild(ir, addr, f);
            ir.mk(Node::Load { size, addr })
        }
        Node::Sel(c, a, b) => {
            let c = rebuild(ir, c, f);
            let a = rebuild(ir, a, f);
            let b = rebuild(ir, b, f);
            ir.mk(Node::Sel(c, a, b))
        }
        Node::Call(t, args) => {
            // (`{ ...e, args: e.args.map(rw), t: ... }`: arguments first)
            let args = rebuild_list(ir, args, f);
            let t = match ir.target(t) {
                CallTarget::Ind { e } => ir.mk_target(CallTarget::Ind {
                    e: rebuild(ir, e, f),
                }),
                _ => t,
            };
            ir.mk(Node::Call(t, args))
        }
        Node::Fn(name, args) => {
            let args = rebuild_list(ir, args, f);
            ir.mk(Node::Fn(name, args))
        }
        _ => e,
    }
}

pub fn rebuild_list(ir: &Ir, l: L, f: &mut dyn FnMut(&Ir, E, Node) -> Option<E>) -> L {
    let v: Vec<E> = ir.items(l).map(|a| rebuild(ir, a, f)).collect();
    ir.list(v)
}

/// promoteStack: returns whether any slot was promoted.
pub fn promote_stack(f: &mut Func) -> bool {
    let Some(fpv) = f.vars.iter().find(|v| v.param == 10) else {
        return false;
    };
    let fp = fpv.id;
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Set { dst, .. } | Stmt::Call { dst, .. } if *dst == fp as i32 => {
                    return false
                }
                _ => {}
            }
        }
    }
    let ir = f.ir.as_ref().expect("variable IR");
    let mut sc = Scan {
        ir,
        fp,
        accesses: IndexMap::new(),
        low_escape: 0.0,
        whole_frame: false,
        arg_area: false,
    };
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Set { e, .. } | Stmt::Eval { e, .. } => sc.visit(*e, None),
                Stmt::Store { size, addr, v, .. } => {
                    sc.visit(*addr, Some(*size));
                    sc.visit(*v, None);
                }
                Stmt::Call { args, extra, t, .. } => {
                    for a in ir.items(*args) {
                        sc.visit(a, None);
                    }
                    if let Some(x) = extra {
                        for a in ir.items(*x) {
                            sc.visit(a, None);
                        }
                    }
                    if let CallTarget::Ind { e } = t {
                        sc.visit(*e, None);
                    }
                }
                _ => {}
            }
        }
        match &b.term {
            Term::Br { c, .. } => sc.visit(*c, None),
            Term::Ret { e: Some(e) } => sc.visit(*e, None),
            _ => {}
        }
    }
    if sc.whole_frame {
        return false;
    }
    let (low_escape, arg_area) = (sc.low_escape, sc.arg_area);
    let mut offs: Vec<(f64, Vec<u8>)> = sc.accesses.into_values().collect();
    offs.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());
    let reachable = |lo: f64, hi: f64| {
        (lo < 0.0 && hi > low_escape && low_escape < 0.0)
            || (arg_area && lo < -FRAME + 256.0 && hi > -FRAME)
    };
    let mut chosen: Vec<(f64, u8)> = vec![];
    for (off, sizes) in &offs {
        if sizes.len() != 1 {
            continue;
        }
        let (off, size) = (*off, sizes[0]);
        if off < -FRAME || off + size as f64 > 0.0 {
            continue;
        }
        if reachable(off, off + size as f64) {
            continue;
        }
        let mut overlap = false;
        for (o2, s2s) in &offs {
            if *o2 == off {
                continue;
            }
            for &s2 in s2s {
                if *o2 < off + size as f64 && off < *o2 + s2 as f64 {
                    overlap = true;
                }
            }
        }
        if !overlap {
            chosen.push((off, size));
        }
    }
    if chosen.is_empty() {
        return false;
    }
    let mut promoted = vec![];
    let mut slot_var: Vec<(f64, u32)> = vec![];
    for &(off, size) in &chosen {
        let v = f.vars.len() as u32;
        f.vars.push(VarInfo {
            id: v,
            reg: -2,
            param: -1,
            undef: false,
        });
        slot_var.push((off, v));
        promoted.push(Promoted { off, size, v });
    }
    let chosen_size = |off: f64| chosen.iter().find(|c| c.0 == off).map(|c| c.1);
    let slot = |off: f64| slot_var.iter().find(|c| c.0 == off).unwrap().1;
    let mut rw = |ir: &Ir, _e: E, n: Node| -> Option<E> {
        if let Node::Load { size, addr } = n {
            if let Some(off) = fp_offset(ir, addr, fp) {
                if chosen_size(off) == Some(size) {
                    return Some(ir.var(slot(off)));
                }
            }
        }
        None
    };
    for b in f.blocks.iter_mut() {
        let old = std::mem::take(&mut b.stmts);
        b.stmts = old
            .into_iter()
            .map(|s| match s {
                Stmt::Set { dst, e, pc } => Stmt::Set {
                    dst,
                    e: rebuild(ir, e, &mut rw),
                    pc,
                },
                Stmt::Eval { e, pc } => Stmt::Eval {
                    e: rebuild(ir, e, &mut rw),
                    pc,
                },
                Stmt::Store { size, addr, v, pc } => {
                    let off = fp_offset(ir, addr, fp);
                    let val = rebuild(ir, v, &mut rw);
                    if let Some(off) = off {
                        if chosen_size(off) == Some(size) {
                            let e = if size == 8 {
                                val
                            } else {
                                ir.ext(false, size * 8, val)
                            };
                            return Stmt::Set {
                                dst: slot(off) as i32,
                                e,
                                pc,
                            };
                        }
                    }
                    Stmt::Store {
                        size,
                        addr: rebuild(ir, addr, &mut rw),
                        v: val,
                        pc,
                    }
                }
                Stmt::Call {
                    dst,
                    t,
                    args,
                    pc,
                    extra,
                } => {
                    let args = rebuild_list(ir, args, &mut rw);
                    let extra = extra.map(|x| rebuild_list(ir, x, &mut rw));
                    let t = match t {
                        CallTarget::Ind { e } => CallTarget::Ind {
                            e: rebuild(ir, e, &mut rw),
                        },
                        t => t,
                    };
                    Stmt::Call {
                        dst,
                        t,
                        args,
                        pc,
                        extra,
                    }
                }
                s => s,
            })
            .collect();
        match &mut b.term {
            Term::Br { c, .. } => *c = rebuild(ir, *c, &mut rw),
            Term::Ret { e: Some(e) } => *e = rebuild(ir, *e, &mut rw),
            _ => {}
        }
    }
    // slots possibly read before written: initialize from memory at function entry (exact)
    let only: Vec<u32> = slot_var.iter().map(|x| x.1).collect();
    let live_at_entry = live_in_entry(ir, &f.blocks, &only);
    if live_at_entry.iter().any(|&x| x) {
        let mut inits = vec![];
        for (k, &(off, size)) in chosen.iter().enumerate() {
            let v = slot_var[k].1;
            if !live_at_entry[k] {
                continue;
            }
            let addr = if off == 0.0 {
                ir.var(fp)
            } else {
                let a = ir.var(fp);
                let c = ir.c(js_as_u64(off));
                ir.bin(BinOp::Add, a, c)
            };
            inits.push(Stmt::Set {
                dst: v as i32,
                e: ir.load(size, addr),
                pc: -1,
            });
        }
        let entry = ensure_pre_entry(&mut f.blocks);
        let b = &mut f.blocks[entry];
        inits.append(&mut b.stmts);
        b.stmts = inits;
    }
    let mut all = f.promoted.take().unwrap_or_default();
    all.extend(promoted);
    f.promoted = Some(all);
    true
}

/// Variables (from `only`, by index) that may be read before being written on some path from entry.
fn live_in_entry(ir: &Ir, blocks: &[Block], only: &[u32]) -> Vec<bool> {
    let nb = blocks.len();
    let idx = |v: u32| only.iter().position(|&x| x == v);
    let m = only.len();
    let mut live_in: Vec<Vec<bool>> = vec![vec![false; m]; nb];
    let mut gen: Vec<Vec<bool>> = Vec::with_capacity(nb);
    let mut kill: Vec<Vec<bool>> = Vec::with_capacity(nb);
    for b in blocks {
        let mut g = vec![false; m];
        let mut k = vec![false; m];
        let use_ = |e: E, g: &mut Vec<bool>, k: &Vec<bool>| {
            ir.walk(e, &mut |_, n| {
                if let Node::Var(id) = n {
                    if let Some(i) = idx(id) {
                        if !k[i] {
                            g[i] = true;
                        }
                    }
                }
            })
        };
        for s in &b.stmts {
            match s {
                Stmt::Set { dst, e, .. } => {
                    use_(*e, &mut g, &k);
                    if *dst >= 0 {
                        if let Some(i) = idx(*dst as u32) {
                            k[i] = true;
                        }
                    }
                }
                Stmt::Store { addr, v, .. } => {
                    use_(*addr, &mut g, &k);
                    use_(*v, &mut g, &k);
                }
                Stmt::Eval { e, .. } => use_(*e, &mut g, &k),
                Stmt::Call { args, extra, t, .. } => {
                    for a in ir.items(*args) {
                        use_(a, &mut g, &k);
                    }
                    if let Some(x) = extra {
                        for a in ir.items(*x) {
                            use_(a, &mut g, &k);
                        }
                    }
                    if let CallTarget::Ind { e } = t {
                        use_(*e, &mut g, &k);
                    }
                }
                _ => {}
            }
        }
        match &b.term {
            Term::Br { c, .. } => use_(*c, &mut g, &k),
            Term::Ret { e: Some(e) } => use_(*e, &mut g, &k),
            _ => {}
        }
        gen.push(g);
        kill.push(k);
    }
    let size = |s: &[bool]| s.iter().filter(|&&x| x).count();
    let mut changed = true;
    while changed {
        changed = false;
        for id in (0..nb).rev() {
            let mut out = vec![false; m];
            for &s in &blocks[id].succs {
                for i in 0..m {
                    out[i] |= live_in[s][i];
                }
            }
            let mut inn = gen[id].clone();
            for i in 0..m {
                if out[i] && !kill[id][i] {
                    inn[i] = true;
                }
            }
            if size(&inn) != size(&live_in[id]) {
                live_in[id] = inn;
                changed = true;
            }
        }
    }
    live_in.swap_remove(0)
}

/// Make sure block 0 has no predecessors (so code prepended to it runs exactly once); returns 0.
pub fn ensure_pre_entry(blocks: &mut Vec<Block>) -> usize {
    if blocks[0].preds.is_empty() {
        return 0;
    }
    let nid = blocks.len();
    let b0 = blocks[0].clone();
    let mut moved = b0.clone();
    moved.id = nid;
    moved.preds = b0
        .preds
        .iter()
        .map(|&p| if p == 0 { nid } else { p })
        .collect();
    moved.preds.push(0);
    blocks.push(moved);
    let succs = blocks[nid].succs.clone();
    for s in succs {
        blocks[s].preds = blocks[s]
            .preds
            .iter()
            .map(|&p| if p == 0 { nid } else { p })
            .collect();
    }
    // retarget back edges into the old entry
    for bi in 0..blocks.len() {
        if bi == nid {
            continue;
        }
        let b = &mut blocks[bi];
        if !b.succs.contains(&0) {
            continue;
        }
        retarget(&mut b.term, nid);
        b.succs = b
            .succs
            .iter()
            .map(|&s| if s == 0 { nid } else { s })
            .collect();
    }
    let m = &mut blocks[nid];
    retarget(&mut m.term, nid);
    m.succs = m
        .succs
        .iter()
        .map(|&s| if s == 0 { nid } else { s })
        .collect();
    blocks[0] = Block {
        id: 0,
        start: b0.start,
        end: b0.start,
        stmts: vec![],
        term: Term::Jmp { to: nid as i64 },
        succs: vec![nid],
        preds: vec![],
    };
    0
}

fn retarget(t: &mut Term, nid: usize) {
    match t {
        Term::Jmp { to } if *to == 0 => *to = nid as i64,
        Term::Br { t, f, .. } => {
            if *t == 0 {
                *t = nid as i64;
            }
            if *f == 0 {
                *f = nid as i64;
            }
        }
        _ => {}
    }
}
