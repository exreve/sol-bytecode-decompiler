//! Inferred struct views ([heur]) for pointers without a known layout, unified along
//! the program's data flow (Steensgaard style) when the layouts agree.

use crate::util::{fo_add, js_hex, n_s, K, N};
use crate::views::{fid, Field, View, Views, FT};
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, E, L};
use sbpf_program::Func;
use sbpf_ir::fx::{HashMap, HashSet};

/// The questions inferStructs asks about the program (StructCfg).
pub trait StructCfg {
    fn funcs(&self) -> &[&Func];
    fn func(&self, pc: i64) -> Option<&Func>;
    fn skip(&self, pc: i64) -> bool;
    fn typed(&self, pc: i64, v: u32) -> bool;
    fn fn_name(&self, pc: i64) -> String;
    fn out_param(&self, pc: i64) -> bool;
    fn param_reg(&self, callee: i64, i: usize) -> i32;
    fn data_ptr(&self, pc: i64, e: E, ir: &Ir, views: &Views) -> bool;
    /// known fields of a parameter's object (by offset) and where from
    fn field_hints(&self, pc: i64, reg: i32) -> Option<(IndexMap<K, Field>, String)>;
}

#[derive(Clone, Copy, Debug)]
struct Acc {
    off: N,
    size: u8,
    n: u32,
}

#[derive(Clone, Debug, Default)]
struct Cls {
    acc: IndexMap<(K, u8), Acc>,
    ptr: IndexMap<K, usize>,
    members: Vec<(i64, u32)>,
    data: Vec<(i64, i64)>,
    is_data: bool,
    opaque: bool,
}

const MAX_OFF: N = 16384.0;
const PARAM_NAMES: [&str; 6] = ["r0", "a", "b", "c", "d", "e"];

#[derive(Clone, Copy)]
enum To {
    Node(usize),
    Param(i64),
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
enum Root {
    P(u32),
    C(K),
    V(u32),
}

struct Uf {
    parent: Vec<usize>,
    cls: Vec<Cls>,
}
impl Uf {
    fn find(&mut self, mut x: usize) -> usize {
        while self.parent[x] != x {
            self.parent[x] = self.parent[self.parent[x]];
            x = self.parent[x];
        }
        x
    }
    fn fresh(&mut self) -> usize {
        let id = self.parent.len();
        self.parent.push(id);
        self.cls.push(Cls::default());
        id
    }
    fn pointee(&mut self, n: usize, off: N) -> usize {
        let r = self.find(n);
        if let Some(&t) = self.cls[r].ptr.get(&K::of(off)) {
            return t;
        }
        let t = self.fresh();
        let r = self.find(n);
        self.cls[r].ptr.insert(K::of(off), t);
        t
    }
}

pub struct StructsOut {
    pub types: IndexMap<i64, IndexMap<u32, String>>,
    pub synth: IndexSet<String>,
}

fn base(ir: &Ir, e: E) -> Option<(u32, N)> {
    match ir.get(e) {
        Node::Var(v) => Some((v, 0.0)),
        Node::Bin(BinOp::Add, a, b) => match (ir.get(a), ir.get(b)) {
            (Node::Var(v), Node::Const(c)) => {
                let o = c as i64;
                if o >= 0 && (o as N) < MAX_OFF {
                    Some((v, o as N))
                } else {
                    None
                }
            }
            _ => None,
        },
        _ => None,
    }
}

enum RF {
    Opaque,
    Field { cpc: i64, reg: i32, rel: N },
}

struct FnState<'a> {
    pc: i64,
    f: &'a Func,
    ir: &'a Ir,
    fp: Option<u32>,
    defs: HashMap<u32, Vec<(usize, usize)>>,
    memo: IndexMap<u32, Option<usize>>,
    busy: HashSet<u32>,
    cells: HashMap<K, usize>,
    stored: Option<HashMap<K, IndexSet<u32>>>,
    ok_memo: HashMap<K, bool>,
    starts: Vec<N>,
}

struct G<'c, C: StructCfg + ?Sized> {
    cfg: &'c C,
    views: &'c Views,
    uf: Uf,
    edges: Vec<(usize, To)>,
    direct: HashSet<(i64, u32)>,
    field_edges: Vec<(usize, i64, N)>,
    params: HashMap<i64, HashMap<i32, u32>>,
}

impl<C: StructCfg + ?Sized> G<'_, C> {
    fn param_var(&mut self, pc: i64, reg: i32) -> Option<u32> {
        if !self.params.contains_key(&pc) {
            let mut m = HashMap::default();
            if let Some(f) = self.cfg.func(pc) {
                for v in &f.vars {
                    if v.param >= 0 {
                        m.entry(v.param).or_insert(v.id);
                    }
                }
            }
            self.params.insert(pc, m);
        }
        self.params[&pc].get(&reg).copied()
    }

    fn stmt<'a>(s: &FnState<'a>, at: (usize, usize)) -> &'a Stmt {
        &s.f.blocks[at.0].stmts[at.1]
    }

    fn node(&mut self, s: &mut FnState, v: u32) -> Option<usize> {
        if let Some(n) = s.memo.get(&v) {
            return *n;
        }
        let info = s.f.vars.get(v as usize);
        let mut n: Option<usize> = None;
        match info {
            None => {}
            Some(info) if info.param == 10 || self.cfg.typed(s.pc, v) || s.busy.contains(&v) => {}
            Some(info) if info.param >= 0 => {
                if !s.defs.contains_key(&v) && ((1..=5).contains(&info.param) || info.param >= 100)
                {
                    let x = self.uf.fresh();
                    self.uf.cls[x].members.push((s.pc, v));
                    n = Some(x);
                }
            }
            Some(_) => {
                let d = s.defs.get(&v).cloned();
                let ir = s.ir;
                let is_ptr_def = |at: &(usize, usize)| match Self::stmt(s, *at) {
                    Stmt::Set { e, .. } => {
                        matches!(ir.get(*e), Node::Var(_) | Node::Load { size: 8, .. })
                    }
                    _ => false,
                };
                if let Some(d) = d
                    .as_ref()
                    .filter(|d| d.len() > 1 && d.len() <= 16 && d.iter().all(is_ptr_def))
                {
                    s.busy.insert(v);
                    let mut ns: Vec<usize> = Vec::new();
                    for at in d {
                        let Stmt::Set { e, .. } = Self::stmt(s, *at) else {
                            unreachable!()
                        };
                        let e = *e;
                        let dn = match ir.get(e) {
                            Node::Var(id) => self.node(s, id),
                            Node::Load { addr, .. } => {
                                let b = base(ir, addr);
                                let bn = b.and_then(|b| self.node(s, b.0));
                                if let Some(bn) = bn {
                                    Some(self.uf.pointee(bn, b.unwrap().1))
                                } else if let Some(fo) = fo_add(ir, addr, s.fp) {
                                    match self.result_field(s, *at, fo) {
                                        Some(RF::Opaque) => None,
                                        Some(RF::Field { cpc, reg, rel }) => {
                                            let x = self.uf.fresh();
                                            self.field_edges.push((x, cpc * 256 + reg as i64, rel));
                                            Some(x)
                                        }
                                        None => self.cell(s, fo),
                                    }
                                } else {
                                    None
                                }
                            }
                            _ => None,
                        };
                        match dn {
                            None => {
                                ns.clear();
                                break;
                            }
                            Some(x) => ns.push(x),
                        }
                    }
                    s.busy.remove(&v);
                    if !ns.is_empty() {
                        let x = self.uf.fresh();
                        for y in ns {
                            self.edges.push((x, To::Node(y)));
                        }
                        self.direct.insert((s.pc, v));
                        n = Some(x);
                    }
                } else if let Some(d) = d.filter(|d| d.len() == 1) {
                    if let Stmt::Set { e, .. } = Self::stmt(s, d[0]) {
                        let e = *e;
                        s.busy.insert(v);
                        match ir.get(e) {
                            Node::Load { size: 8, addr } => {
                                let b = base(ir, addr);
                                let bn = b.and_then(|b| self.node(s, b.0));
                                if let Some(bn) = bn {
                                    n = Some(self.uf.pointee(bn, b.unwrap().1));
                                } else if self.cfg.data_ptr(s.pc, e, ir, self.views) {
                                    let x = self.uf.fresh();
                                    self.uf.cls[x].data.push((s.pc, v as i64));
                                    n = Some(x);
                                } else if let Some(fo) = fo_add(ir, addr, s.fp) {
                                    n = match self.result_field(s, d[0], fo) {
                                        Some(RF::Opaque) => None,
                                        Some(RF::Field { cpc, reg, rel }) => {
                                            let x = self.uf.fresh();
                                            self.field_edges.push((x, cpc * 256 + reg as i64, rel));
                                            Some(x)
                                        }
                                        None => self.cell(s, fo),
                                    };
                                    if n.is_some() {
                                        self.direct.insert((s.pc, v));
                                    }
                                }
                            }
                            Node::Sel(_, a, b)
                                if [a, b].iter().any(|&x| {
                                    matches!(ir.get(x), Node::Const(c) if (0x3_0000_0000..0x4_0000_0000).contains(&c))
                                }) =>
                            {
                                n = Some(self.uf.fresh());
                                self.direct.insert((s.pc, v));
                            }
                            Node::Var(id) => n = self.node(s, id),
                            _ => {}
                        }
                        s.busy.remove(&v);
                    }
                }
            }
        }
        s.memo.insert(v, n);
        n
    }

    fn cell(&mut self, s: &mut FnState, off: N) -> Option<usize> {
        if off >= 0.0 || off < -8192.0 {
            return None;
        }
        let n = match s.cells.get(&K::of(off)) {
            Some(&n) => n,
            None => {
                let n = self.uf.fresh();
                s.cells.insert(K::of(off), n);
                n
            }
        };
        if Self::cell_ok(s, off) {
            Some(n)
        } else {
            Some(self.uf.fresh())
        }
    }

    fn stored_at(s: &mut FnState, off: N) -> Vec<u32> {
        if s.stored.is_none() {
            let mut m: HashMap<K, IndexSet<u32>> = HashMap::default();
            for b in &s.f.blocks {
                for st in &b.stmts {
                    let (addr, size, vals): (E, u8, Vec<E>) = match st {
                        Stmt::Store { addr, size, v, .. } => (*addr, *size, vec![*v]),
                        Stmt::Stores {
                            addr, size, vals, ..
                        } => (*addr, *size, s.ir.to_vec(*vals)),
                        _ => continue,
                    };
                    if size != 8 {
                        continue;
                    }
                    if let Some(f) = fo_add(s.ir, addr, s.fp) {
                        for (i, x) in vals.iter().enumerate() {
                            if let Node::Var(id) = s.ir.get(*x) {
                                m.entry(K::of(f + 8.0 * i as N)).or_default().insert(id);
                            }
                        }
                    }
                }
            }
            s.stored = Some(m);
        }
        s.stored
            .as_ref()
            .unwrap()
            .get(&K::of(off))
            .map(|x| x.iter().copied().collect())
            .unwrap_or_default()
    }

    fn roots_of(s: &FnState, v: u32, seen: &mut HashSet<u32>) -> IndexSet<Root> {
        if seen.contains(&v) {
            return IndexSet::default();
        }
        seen.insert(v);
        if crate::util::is_param(s.f, v) {
            return [Root::P(v)].into_iter().collect();
        }
        let mut r = IndexSet::default();
        for at in s.defs.get(&v).cloned().unwrap_or_default() {
            match Self::stmt(s, at) {
                Stmt::Set { e, .. } if matches!(s.ir.get(*e), Node::Var(_)) => {
                    let Node::Var(id) = s.ir.get(*e) else {
                        unreachable!()
                    };
                    for x in Self::roots_of(s, id, seen) {
                        r.insert(x);
                    }
                }
                Stmt::Set { e, .. } if matches!(s.ir.get(*e), Node::Load { size: 8, addr } if fo_add(s.ir, addr, s.fp).is_some()) =>
                {
                    let Node::Load { addr, .. } = s.ir.get(*e) else {
                        unreachable!()
                    };
                    r.insert(Root::C(K::of(fo_add(s.ir, addr, s.fp).unwrap())));
                }
                _ => {
                    r.insert(Root::V(v));
                }
            }
        }
        r
    }

    fn cell_ok(s: &mut FnState, off: N) -> bool {
        if let Some(&ok) = s.ok_memo.get(&K::of(off)) {
            return ok;
        }
        let mut r: IndexSet<Root> = IndexSet::default();
        for v in Self::stored_at(s, off) {
            for x in Self::roots_of(s, v, &mut HashSet::default()) {
                if x != Root::C(K::of(off)) {
                    r.insert(x);
                }
            }
        }
        let ok = r.len() <= 1;
        s.ok_memo.insert(K::of(off), ok);
        ok
    }

    fn result_field(&self, s: &FnState, at: (usize, usize), off: N) -> Option<RF> {
        let (mut bi, mut si) = at;
        for _ in 0..8 {
            let ss = &s.f.blocks[bi].stmts;
            for k in (0..si).rev() {
                let st = &ss[k];
                match st {
                    Stmt::Store { addr, size, .. } => {
                        if let Some(d) = fo_add(s.ir, *addr, s.fp) {
                            if d < off + 8.0 && d + *size as N > off {
                                return None;
                            }
                        }
                        continue;
                    }
                    Stmt::Stores {
                        addr, size, vals, ..
                    } => {
                        if let Some(d) = fo_add(s.ir, *addr, s.fp) {
                            if d < off + 8.0 && d + (*size as u32 * vals.len) as N > off {
                                return None;
                            }
                        }
                        continue;
                    }
                    Stmt::Copy { dst, n, .. } => {
                        if let Some(d) = fo_add(s.ir, *dst, s.fp) {
                            if d < off + 8.0 && d + *n as N > off {
                                return None;
                            }
                        }
                        continue;
                    }
                    _ => {}
                }
                let Some((t, args)) = crate::util::call_of(s.ir, st) else {
                    continue;
                };
                let mut best: Option<(usize, N)> = None;
                for (i, a) in s.ir.items(args).enumerate() {
                    if let Some(o) = fo_add(s.ir, a, s.fp) {
                        if o <= off && off - o < 256.0 && best.is_none_or(|b| o > b.1) {
                            best = Some((i, o));
                        }
                    }
                }
                let Some((i, o)) = best else {
                    if !matches!(t, CallTarget::Fn { .. }) {
                        return Some(RF::Opaque);
                    }
                    continue;
                };
                let CallTarget::Fn { pc: cpc } = t else {
                    return Some(RF::Opaque);
                };
                if self.cfg.skip(cpc) || self.cfg.func(cpc).is_none_or(|f| f.noreturn) {
                    return Some(RF::Opaque);
                }
                return Some(RF::Field {
                    cpc,
                    reg: self.cfg.param_reg(cpc, i),
                    rel: off - o,
                });
            }
            let ps = &s.f.blocks[bi].preds;
            if ps.len() != 1 {
                return None;
            }
            bi = ps[0];
            si = s.f.blocks[bi].stmts.len();
        }
        None
    }

    fn access(&mut self, s: &mut FnState, b: Option<(u32, N)>, size: u8, count: u32) {
        let Some((v, off)) = b else { return };
        let Some(n) = self.node(s, v) else { return };
        let r = self.uf.find(n);
        let c = &mut self.uf.cls[r];
        match c.acc.get_mut(&(K::of(off), size)) {
            Some(a) => a.n += count,
            None => {
                c.acc.insert(
                    (K::of(off), size),
                    Acc {
                        off,
                        size,
                        n: count,
                    },
                );
            }
        }
    }

    fn arith(&self, s: &FnState, e: E, arith_vars: &mut Vec<(usize, u32)>, fi: usize) {
        if let Node::Bin(op, a, b) = s.ir.get(e) {
            if op == BinOp::Add || op == BinOp::Sub {
                for (x, y) in [(a, b), (b, a)] {
                    if let Node::Var(xv) = s.ir.get(x) {
                        let bad = match s.ir.get(y) {
                            Node::Const(c) => {
                                op == BinOp::Sub || (c as i64) < 0 || (c as i64) as N >= MAX_OFF
                            }
                            _ => true,
                        };
                        if bad {
                            arith_vars.push((fi, xv));
                        }
                    }
                }
            }
        }
    }

    fn visit(&mut self, s: &mut FnState, e: E, av: &mut Vec<(usize, u32)>, fi: usize) {
        let ir = s.ir;
        match ir.get(e) {
            Node::Load { size, addr } => {
                let b = base(ir, addr);
                self.access(s, b, size, 1);
                if b.is_none() {
                    self.visit(s, addr, av, fi);
                } else {
                    self.arith(s, addr, av, fi);
                }
            }
            Node::Bin(_, a, b) => {
                self.arith(s, e, av, fi);
                self.visit(s, a, av, fi);
                self.visit(s, b, av, fi);
            }
            Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                self.visit(s, a, av, fi);
                self.visit(s, b, av, fi);
            }
            Node::Neg(a)
            | Node::Not(a)
            | Node::Lnot(a)
            | Node::Ext { a, .. }
            | Node::Bswap { a, .. } => self.visit(s, a, av, fi),
            Node::Sel(c, a, b) => {
                self.visit(s, c, av, fi);
                self.visit(s, a, av, fi);
                self.visit(s, b, av, fi);
            }
            Node::Call(t, args) => {
                if let CallTarget::Ind { e } = ir.target(t) {
                    self.visit(s, e, av, fi);
                }
                for a in ir.items(args) {
                    self.visit(s, a, av, fi);
                }
            }
            Node::Fn(_, args) => {
                for a in ir.items(args) {
                    self.visit(s, a, av, fi);
                }
            }
            _ => {}
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn call(
        &mut self,
        s: &mut FnState,
        t: &CallTarget,
        args: L,
        bi: usize,
        at: usize,
        av: &mut Vec<(usize, u32)>,
        fi: usize,
    ) {
        let ir = s.ir;
        if let CallTarget::Ind { e } = t {
            self.visit(s, *e, av, fi);
        }
        for (i, a) in ir.items(args).enumerate() {
            self.visit(s, a, av, fi);
            let CallTarget::Fn { pc: cpc } = t else {
                continue;
            };
            let cpc = *cpc;
            if self.cfg.skip(cpc) || cpc == s.pc || self.cfg.func(cpc).is_none_or(|f| f.noreturn) {
                continue;
            }
            let reg = self.cfg.param_reg(cpc, i);
            if self.param_var(cpc, reg).is_none() {
                continue;
            }
            let an = match ir.get(a) {
                Node::Var(id) => self.node(s, id),
                Node::Load { size: 8, addr } => {
                    let b = base(ir, addr);
                    let bn = b.and_then(|b| self.node(s, b.0));
                    if let Some(bn) = bn {
                        Some(self.uf.pointee(bn, b.unwrap().1))
                    } else if self.cfg.data_ptr(s.pc, a, ir, self.views) {
                        let x = self.uf.fresh();
                        self.uf.cls[x].data.push((s.pc, -1));
                        Some(x)
                    } else {
                        None
                    }
                }
                _ => match fo_add(ir, a, s.fp) {
                    Some(o) => self.frame_arg(s, o, bi, at),
                    None => None,
                },
            };
            if let Some(an) = an {
                self.edges.push((an, To::Param(cpc * 256 + reg as i64)));
            }
        }
    }

    fn frame_arg(&mut self, s: &mut FnState, o: N, bi: usize, at: usize) -> Option<usize> {
        let ir = s.ir;
        let mut hi = o + 256.0;
        for &x in &s.starts {
            if x > o {
                hi = hi.min(x);
                break;
            }
        }
        let mut n: Option<usize> = None;
        for k in (0..at).rev() {
            let st = &s.f.blocks[bi].stmts[k];
            if matches!(st, Stmt::Call { .. } | Stmt::Copy { .. })
                || matches!(st, Stmt::Set { e, .. } if matches!(ir.get(*e), Node::Call(..)))
            {
                break;
            }
            let (addr, size, vals): (E, u8, Vec<E>) = match st {
                Stmt::Store { addr, size, v, .. } => (*addr, *size, vec![*v]),
                Stmt::Stores {
                    addr, size, vals, ..
                } => (*addr, *size, ir.to_vec(*vals)),
                _ => continue,
            };
            let Some(d) = fo_add(ir, addr, s.fp) else {
                continue;
            };
            if d < o || d >= hi {
                continue;
            }
            let nn = match n {
                Some(x) => x,
                None => {
                    let x = self.uf.fresh();
                    n = Some(x);
                    x
                }
            };
            for (j, x) in vals.iter().enumerate() {
                let off = d - o + (j * size as usize) as N;
                if d + (j * size as usize) as N + size as N > hi {
                    continue;
                }
                let r = self.uf.find(nn);
                let c = &mut self.uf.cls[r];
                match c.acc.get_mut(&(K::of(off), size)) {
                    Some(a) => a.n += 1,
                    None => {
                        c.acc.insert((K::of(off), size), Acc { off, size, n: 1 });
                    }
                }
                if size == 8 {
                    if let Node::Var(xid) = ir.get(*x) {
                        if let Some(xn) = self.node(s, xid) {
                            let p = self.uf.pointee(nn, off);
                            self.edges.push((p, To::Node(xn)));
                        }
                    }
                }
            }
        }
        n
    }
}

/// inferStructs: per function, variable -> view name; the views are added to `views`.
pub fn infer_structs<C: StructCfg + ?Sized>(cfg: &C, views: &mut Views) -> StructsOut {
    let mut g = G {
        cfg,
        views: &*views,
        uf: Uf {
            parent: Vec::new(),
            cls: Vec::new(),
        },
        edges: Vec::new(),
        direct: HashSet::default(),
        field_edges: Vec::new(),
        params: HashMap::default(),
    };
    let mut node_of: Vec<(i64, IndexMap<u32, Option<usize>>)> = Vec::new();
    let mut arith_vars: Vec<(usize, u32)> = Vec::new();
    let funcs: Vec<&Func> = cfg.funcs().to_vec();
    for f in &funcs {
        let pc = f.pc;
        if cfg.skip(pc) || f.is_entry || f.noreturn {
            continue;
        }
        let ir = f.ir.as_ref().unwrap();
        let mut defs: HashMap<u32, Vec<(usize, usize)>> = HashMap::default();
        for (bi, b) in f.blocks.iter().enumerate() {
            for (si, s) in b.stmts.iter().enumerate() {
                if let Some(d) = crate::util::dst_of(s) {
                    defs.entry(d).or_default().push((bi, si));
                }
            }
        }
        let fp = crate::util::fp_var(f);
        let mut starts: Vec<N> = Vec::new();
        for b in &f.blocks {
            for s in &b.stmts {
                if let Some((_, args)) = crate::util::call_of(ir, s) {
                    for a in ir.items(args) {
                        if let Some(o) = fo_add(ir, a, fp) {
                            starts.push(o);
                        }
                    }
                }
            }
        }
        starts.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let mut s = FnState {
            pc,
            f,
            ir,
            fp,
            defs,
            memo: IndexMap::default(),
            busy: HashSet::default(),
            cells: HashMap::default(),
            stored: None,
            ok_memo: HashMap::default(),
            starts,
        };
        let fi = node_of.len();
        node_of.push((pc, IndexMap::default()));
        for (bi, b) in f.blocks.iter().enumerate() {
            for (si, st) in b.stmts.iter().enumerate() {
                match st {
                    Stmt::Set { e, .. } => match ir.get(*e) {
                        Node::Call(t, args) => {
                            let t = ir.target(t);
                            g.call(&mut s, &t, args, bi, si, &mut arith_vars, fi)
                        }
                        _ => g.visit(&mut s, *e, &mut arith_vars, fi),
                    },
                    Stmt::Call { t, args, extra, .. } => {
                        g.call(&mut s, t, *args, bi, si, &mut arith_vars, fi);
                        if let Some(x) = extra {
                            for a in ir.items(*x) {
                                g.visit(&mut s, a, &mut arith_vars, fi);
                            }
                        }
                    }
                    Stmt::Eval { e, .. } => g.visit(&mut s, *e, &mut arith_vars, fi),
                    Stmt::Store { .. } | Stmt::Stores { .. } => {
                        let (addr, size, vals): (E, u8, Vec<E>) = match st {
                            Stmt::Store { addr, size, v, .. } => (*addr, *size, vec![*v]),
                            Stmt::Stores {
                                addr, size, vals, ..
                            } => (*addr, *size, ir.to_vec(*vals)),
                            _ => unreachable!(),
                        };
                        let b0 = base(ir, addr);
                        let ff = fo_add(ir, addr, fp);
                        for (i, x) in vals.iter().enumerate() {
                            g.visit(&mut s, *x, &mut arith_vars, fi);
                            if let (Some(ff), 8, Node::Var(xid)) = (ff, size, ir.get(*x)) {
                                let xn = g.node(&mut s, xid);
                                let cn = if xn.is_none() {
                                    None
                                } else {
                                    g.cell(&mut s, ff + 8.0 * i as N)
                                };
                                if let (Some(cn), Some(xn)) = (cn, xn) {
                                    g.edges.push((cn, To::Node(xn)));
                                }
                            }
                            let Some((bv, boff)) = b0 else { continue };
                            let o2 = boff + (i * size as usize) as N;
                            let bb = if i == 0 {
                                b0
                            } else if o2 < MAX_OFF {
                                Some((bv, o2))
                            } else {
                                None
                            };
                            g.access(&mut s, bb, size, 1);
                            if let (8, Node::Var(xid)) = (size, ir.get(*x)) {
                                let xn = g.node(&mut s, xid);
                                let bn = g.node(&mut s, bv);
                                if let (Some(xn), Some(bn)) = (xn, bn) {
                                    let p = g.uf.pointee(bn, boff + 8.0 * i as N);
                                    g.edges.push((p, To::Node(xn)));
                                }
                            }
                        }
                        if b0.is_none() {
                            g.visit(&mut s, addr, &mut arith_vars, fi);
                        } else {
                            g.arith(&s, addr, &mut arith_vars, fi);
                        }
                    }
                    Stmt::Copy { dst, src, .. } => {
                        g.visit(&mut s, *dst, &mut arith_vars, fi);
                        g.visit(&mut s, *src, &mut arith_vars, fi);
                    }
                    Stmt::Trap { .. } => {}
                }
            }
            match &b.term {
                sbpf_ir::Term::Br { c, .. } => g.visit(&mut s, *c, &mut arith_vars, fi),
                sbpf_ir::Term::Ret { e: Some(e) } => g.visit(&mut s, *e, &mut arith_vars, fi),
                _ => {}
            }
        }
        node_of[fi].1 = std::mem::take(&mut s.memo);
    }
    for &(fi, v) in &arith_vars {
        if let Some(Some(n)) = node_of[fi].1.get(&v) {
            let r = g.uf.find(*n);
            g.uf.cls[r].opaque = true;
        }
    }
    // ---- phase 2: unify ----
    let mut param_node: HashMap<i64, usize> = HashMap::default();
    for (pc, memo) in &node_of {
        let f = cfg.func(*pc).unwrap();
        for (v, n) in memo {
            if let Some(n) = n {
                let p = f.vars[*v as usize].param;
                if p > 0 {
                    param_node.insert(pc * 256 + p as i64, *n);
                }
            }
        }
    }
    fn agree(uf: &mut Uf, a: usize, b: usize, seen: &mut HashSet<(usize, usize)>) -> bool {
        let (a, b) = (uf.find(a), uf.find(b));
        if a == b {
            return true;
        }
        let k = if a < b { (a, b) } else { (b, a) };
        if seen.contains(&k) {
            return true;
        }
        seen.insert(k);
        if uf.cls[a].opaque != uf.cls[b].opaque {
            return false;
        }
        let mut xs: Vec<(N, u8, u8)> = Vec::new();
        for x in uf.cls[a].acc.values() {
            xs.push((x.off, x.size, 0));
        }
        for x in uf.cls[b].acc.values() {
            xs.push((x.off, x.size, 1));
        }
        xs.sort_by(|x, y| {
            x.0.partial_cmp(&y.0)
                .unwrap()
                .then((x.1 as i32).cmp(&(y.1 as i32)))
        });
        for i in 0..xs.len() {
            let x = xs[i];
            let mut j = i + 1;
            while j < xs.len() && xs[j].0 < x.0 + x.1 as N {
                if xs[j].2 != x.2 && (xs[j].0 != x.0 || xs[j].1 != x.1) {
                    return false;
                }
                j += 1;
            }
        }
        let aptr: Vec<(K, usize)> = uf.cls[a].ptr.iter().map(|(k, v)| (*k, *v)).collect();
        for (o, t) in aptr {
            let u = uf.cls[b].ptr.get(&o).copied();
            if let Some(u) = u {
                if !agree(uf, t, u, seen) {
                    return false;
                }
            }
        }
        true
    }
    fn merge(uf: &mut Uf, a: usize, b: usize) {
        let (a, b) = (uf.find(a), uf.find(b));
        if a == b {
            return;
        }
        uf.parent[a] = b;
        let ca = std::mem::take(&mut uf.cls[a]);
        {
            let cb = &mut uf.cls[b];
            for (k, x) in &ca.acc {
                match cb.acc.get_mut(k) {
                    Some(y) => y.n += x.n,
                    None => {
                        cb.acc.insert(*k, *x);
                    }
                }
            }
            cb.members.extend(ca.members.iter().copied());
            cb.data.extend(ca.data.iter().copied());
            cb.is_data |= ca.is_data;
            cb.opaque |= ca.opaque;
        }
        let mut pend = Vec::new();
        for (o, t) in &ca.ptr {
            match uf.cls[b].ptr.get(o).copied() {
                None => {
                    uf.cls[b].ptr.insert(*o, *t);
                }
                Some(u) => pend.push((*t, u)),
            }
        }
        // (the class keeps its data for anything still holding it)
        uf.cls[a] = ca;
        for (t, u) in pend {
            merge(uf, t, u);
        }
    }
    for i in 0..g.edges.len() {
        let (x, y0) = g.edges[i];
        let y = match y0 {
            To::Node(n) => Some(n),
            To::Param(k) => param_node.get(&k).copied(),
        };
        let Some(y) = y else { continue };
        if agree(&mut g.uf, x, y, &mut HashSet::default()) {
            merge(&mut g.uf, x, y);
        }
    }
    for i in 0..g.field_edges.len() {
        let (x, k, rel) = g.field_edges[i];
        let Some(&pn) = param_node.get(&k) else {
            continue;
        };
        let r = g.uf.find(pn);
        if !g.uf.cls[r].acc.contains_key(&(K::of(rel), 8)) {
            continue;
        }
        let y = g.uf.pointee(pn, rel);
        if agree(&mut g.uf, x, y, &mut HashSet::default()) {
            merge(&mut g.uf, x, y);
        }
    }
    // ---- phase 3: views ----
    let G { mut uf, direct, .. } = g;
    let mut p3 = P3 {
        cfg,
        uf: &mut uf,
        views,
        view_of: HashMap::default(),
        synth: IndexSet::default(),
        node_of: &node_of,
    };
    let mut out: IndexMap<i64, IndexMap<u32, String>> = IndexMap::default();
    for (pc, memo) in &node_of {
        let f = cfg.func(*pc).unwrap();
        for (v, n) in memo {
            if let Some(n) = n {
                if f.vars[*v as usize].param >= 0 {
                    let hint = format!("S_{}_local", strip_fn(&cfg.fn_name(*pc)));
                    p3.build(*n, &hint);
                }
            }
        }
    }
    for (pc, memo) in &node_of {
        let f = cfg.func(*pc).unwrap();
        for (v, n) in memo {
            let Some(n) = n else { continue };
            // f0: locals typed through their pointer field (not account data pointers)
            let r = p3.uf.find(*n);
            let c = &p3.uf.cls[r];
            let f0 = f.vars[*v as usize].param < 0
                && !direct.contains(&(*pc, *v))
                && !c.is_data
                && !c.data.iter().any(|x| x.0 == *pc && x.1 == *v as i64);
            if f0 {
                continue;
            }
            let hint = format!("S_{}_local", strip_fn(&cfg.fn_name(*pc)));
            let Some(t) = p3.build(*n, &hint) else {
                continue;
            };
            out.entry(*pc).or_default().insert(*v, t);
        }
    }
    let synth0 = std::mem::take(&mut p3.synth);
    let views = p3.views;
    let mut synth = synth0;
    // small layouts of plain words shared by every object with that layout
    let mut rename: HashMap<String, String> = HashMap::default();
    let mut shared: IndexMap<String, Vec<String>> = IndexMap::default();
    for nm in &synth {
        let v = &views.map[nm];
        if v.fields.len() > 4
            || nm.starts_with("Data_")
            || !v
                .fields
                .iter()
                .all(|x| matches!(x.t, FT::Scalar(_)) && is_gen_scalar(&x.name))
        {
            continue;
        }
        let mut end = 0.0;
        let mut contiguous = true;
        for x in &v.fields {
            let ok = x.off == end;
            end = x.off + scalar_size(&x.t);
            if !ok {
                contiguous = false;
                break;
            }
        }
        let shape = format!(
            "S_{}",
            v.fields
                .iter()
                .map(|x| format!(
                    "{}u{}",
                    if contiguous {
                        String::new()
                    } else {
                        format!("0x{}", js_hex(x.off))
                    },
                    scalar_size(&x.t) as u32 * 8
                ))
                .collect::<Vec<_>>()
                .join("_")
        );
        shared.entry(shape.clone()).or_default().push(nm.clone());
        rename.insert(nm.clone(), shape);
    }
    for (shape, names) in &shared {
        let first_fields = views.map[&names[0]].fields.clone();
        for nm in names {
            views.map.shift_remove(nm);
            synth.shift_remove(nm);
        }
        views.add(View {
            name: shape.clone(),
            doc: format!(
                "[heur] layout of plain words: the fixed-offset accesses through {} (fields: offset and size; other bytes not described)",
                if names.len() > 1 {
                    format!("{} unrelated objects with this layout", names.len())
                } else {
                    "an object".into()
                }
            ),
            size: None,
            fields: first_fields,
            builtin: false,
        });
        synth.insert(shape.clone());
    }
    if !rename.is_empty() {
        for nm in &synth {
            if let Some(v) = views.map.get_mut(nm) {
                for x in v.fields.iter_mut() {
                    if let FT::Ref(to) = &x.t {
                        if let Some(r) = rename.get(to) {
                            x.t = FT::Ref(r.clone());
                        }
                    }
                }
            }
        }
    }
    for m in out.values_mut() {
        for t in m.values_mut() {
            if let Some(r) = rename.get(t) {
                *t = r.clone();
            }
        }
    }
    let _ = n_s;
    StructsOut { types: out, synth }
}

fn scalar_size(t: &FT) -> N {
    match t {
        FT::Scalar(n) => *n as N,
        _ => f64::NAN,
    }
}

/// `/^f0x[0-9a-f]+_u\d+$/`
fn is_gen_scalar(n: &str) -> bool {
    let Some(r) = n.strip_prefix("f0x") else {
        return false;
    };
    let Some(i) = r.find("_u") else { return false };
    let (h, d) = (&r[..i], &r[i + 2..]);
    !h.is_empty()
        && h.bytes()
            .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
        && !d.is_empty()
        && d.bytes().all(|c| c.is_ascii_digit())
}

fn strip_fn(n: &str) -> &str {
    n.strip_prefix("fn_").unwrap_or(n)
}

struct P3<'a, C: StructCfg + ?Sized> {
    cfg: &'a C,
    uf: &'a mut Uf,
    views: &'a mut Views,
    view_of: HashMap<usize, Option<String>>,
    synth: IndexSet<String>,
    node_of: &'a Vec<(i64, IndexMap<u32, Option<usize>>)>,
}

impl<C: StructCfg + ?Sized> P3<'_, C> {
    fn empty(&mut self, t: usize, seen: &mut HashSet<usize>) -> bool {
        let t = self.uf.find(t);
        if seen.contains(&t) {
            return true;
        }
        seen.insert(t);
        if !self.uf.cls[t].acc.is_empty() {
            return false;
        }
        let ps: Vec<usize> = self.uf.cls[t].ptr.values().copied().collect();
        ps.into_iter().all(|u| self.empty(u, seen))
    }
    fn matches(&mut self, root: usize, view: &str, seen: &mut HashSet<usize>) -> i64 {
        let root = self.uf.find(root);
        if seen.contains(&root) {
            return 0;
        }
        seen.insert(root);
        let accs: Vec<Acc> = self.uf.cls[root].acc.values().copied().collect();
        let mut hit: IndexSet<K> = IndexSet::default();
        for a in &accs {
            let Some(r) = self.views.resolve(view, a.off) else {
                return -1;
            };
            let fits = match &r.last {
                FT::Scalar(s) => *s == a.size,
                FT::Ref(_) => a.size == 8,
                _ => false,
            };
            if r.rest != 0.0 || !fits {
                return -1;
            }
            hit.insert(K::of(self.views.field_at(view, a.off).unwrap().off));
        }
        let mut n = hit.len() as i64;
        let ptrs: Vec<(K, usize)> = self.uf.cls[root]
            .ptr
            .iter()
            .map(|(k, v)| (*k, *v))
            .collect();
        for (o, t) in ptrs {
            if self.empty(t, &mut HashSet::default()) {
                continue;
            }
            let Some(r) = self.views.resolve(view, o.get()) else {
                return -1;
            };
            let FT::Ref(to) = &r.last else { return -1 };
            if r.rest != 0.0 {
                return -1;
            }
            if !self.views.map.contains_key(to) {
                continue;
            }
            let to = to.clone();
            let m = self.matches(t, &to, seen);
            if m < 0 {
                return -1;
            }
            n += m;
        }
        n
    }
    fn info_evidence(&mut self, root: usize) -> bool {
        let r = self.uf.find(root);
        let info = self.views.map["AccountInfo"].clone();
        let flags: Vec<N> = info
            .fields
            .iter()
            .filter(|f| f.name.starts_with("is_") || f.name == "executable")
            .map(|f| f.off)
            .collect();
        if self.uf.cls[r]
            .acc
            .values()
            .any(|a| a.size == 1 && flags.contains(&a.off))
        {
            return true;
        }
        for f in &info.fields {
            let FT::Ref(to) = &f.t else { continue };
            if !to.ends_with("Cell") {
                continue;
            }
            let t = self.uf.cls[r].ptr.get(&K::of(f.off)).copied();
            let ks: Vec<N> = match t {
                None => vec![],
                Some(t) => {
                    let tr = self.uf.find(t);
                    self.uf.cls[tr].acc.values().map(|a| a.off).collect()
                }
            };
            if ks.contains(&16.0) && ks.contains(&24.0) {
                return true;
            }
        }
        false
    }
    fn known(&mut self, root: usize, view: &str) {
        let r = self.uf.find(root);
        self.view_of.insert(r, Some(view.to_string()));
        let ptrs: Vec<(K, usize)> = self.uf.cls[r].ptr.iter().map(|(k, v)| (*k, *v)).collect();
        for (o, t) in ptrs {
            let res = self.views.resolve(view, o.get());
            let ft = self.uf.find(t);
            match res.as_ref().map(|x| &x.last) {
                Some(FT::Ref(to))
                    if self.views.map.contains_key(to) && !self.view_of.contains_key(&ft) =>
                {
                    let to = to.clone();
                    self.known(t, &to);
                }
                Some(FT::Ref(_)) if view == "DataCell" && o.get() == 24.0 => {
                    if !self.empty(t, &mut HashSet::default()) {
                        let ft = self.uf.find(t);
                        self.uf.cls[ft].is_data = true;
                    }
                }
                _ => {}
            }
        }
    }
    fn build(&mut self, root: usize, hint: &str) -> Option<String> {
        let root = self.uf.find(root);
        if let Some(v) = self.view_of.get(&root) {
            return v.clone();
        }
        if self.views.map.contains_key("AccountInfo")
            && !self.uf.cls[root].ptr.is_empty()
            && self.info_evidence(root)
            && self.matches(root, "AccountInfo", &mut HashSet::default()) >= 3
        {
            self.known(root, "AccountInfo");
            return Some("AccountInfo".into());
        }
        let at = |c: &Cls, o: N| c.acc.contains_key(&(K::of(o), 8));
        if self.views.map.contains_key("DataCell")
            && {
                let c = &self.uf.cls[root];
                at(c, 16.0) && at(c, 24.0) && at(c, 32.0)
            }
            && self.matches(root, "DataCell", &mut HashSet::default()) >= 3
        {
            self.known(root, "DataCell");
            return Some("DataCell".into());
        }
        self.view_of.insert(root, None);
        if self.uf.cls[root].opaque {
            return None;
        }
        let mut cand: Vec<Acc> = self.uf.cls[root].acc.values().copied().collect();
        cand.sort_by(|x, y| {
            (y.n as i64 - x.n as i64)
                .cmp(&0)
                .then(x.off.partial_cmp(&y.off).unwrap())
                .then((y.size as i32).cmp(&(x.size as i32)))
        });
        let mut chosen: Vec<Acc> = Vec::new();
        for a in cand {
            if !chosen
                .iter()
                .any(|x| x.off < a.off + a.size as N && a.off < x.off + x.size as N)
            {
                chosen.push(a);
            }
        }
        if chosen.len() < 2 {
            return None;
        }
        chosen.sort_by(|x, y| x.off.partial_cmp(&y.off).unwrap());
        let c = self.uf.cls[root].clone();
        let mut members = c.members.clone();
        members.sort_by_key(|x| x.0);
        let m = members.first().copied();
        let mut name = hint.to_string();
        let mut data: Vec<(i64, i64)> = c.data.iter().filter(|x| x.1 >= 0).copied().collect();
        data.sort_by_key(|x| x.0);
        let mut dm = data.first().copied();
        if dm.is_none() && c.is_data {
            'o: for (pc, memo) in self.node_of.iter() {
                for (v, n) in memo {
                    if let Some(n) = n {
                        if self.uf.find(*n) == root {
                            dm = Some((*pc, *v as i64));
                            break 'o;
                        }
                    }
                }
            }
        }
        if let Some(dm) = dm {
            name = format!("Data_{}", strip_fn(&self.cfg.fn_name(dm.0)));
        } else if let Some(m) = m {
            let f = self.cfg.func(m.0).unwrap();
            let p = f.vars[m.1 as usize].param;
            let pn = if p == 1 && self.cfg.out_param(m.0) {
                "ret".to_string()
            } else if p >= 100 {
                format!("p{}", 5 + p - 100)
            } else {
                PARAM_NAMES
                    .get(p as usize)
                    .map_or("undefined".to_string(), |s| s.to_string())
            };
            name = format!("S_{}_{}", strip_fn(&self.cfg.fn_name(m.0)), pn);
        }
        let taken = |v: &Views, n: &str| v.map.contains_key(n) || v.opaque.contains_key(n);
        if taken(self.views, &name) {
            let mut k = 2;
            while taken(self.views, &format!("{name}_{k}")) {
                k += 1;
            }
            name = format!("{name}_{k}");
        }
        self.view_of.insert(root, Some(name.clone()));
        self.views.add(View {
            name: name.clone(),
            doc: String::new(),
            size: None,
            fields: Vec::new(),
            builtin: false,
        });
        self.synth.insert(name.clone());
        let mut hints: IndexMap<K, Field> = IndexMap::default();
        let mut hint_why: Option<String> = None;
        for x in &c.members {
            let f = self.cfg.func(x.0).unwrap();
            let Some((fs, why)) = self.cfg.field_hints(x.0, f.vars[x.1 as usize].param) else {
                continue;
            };
            if hint_why.as_ref().is_some_and(|w| *w != why) {
                continue;
            }
            hint_why.get_or_insert(why);
            for (o, fd) in fs {
                hints.entry(o).or_insert(fd);
            }
        }
        let mut names: HashSet<String> = HashSet::default();
        let mut hinted = 0;
        let mut fields: Vec<Field> = Vec::new();
        for a in &chosen {
            let hex = format!("0x{}", js_hex(a.off));
            if let Some(h) = hints.get(&K::of(a.off)) {
                let fits = match &h.t {
                    FT::Ref(_) => a.size == 8,
                    FT::Scalar(s) => *s == a.size,
                    _ => false,
                };
                if !names.contains(&h.name) && fits {
                    fields.push(Field {
                        id: fid(),
                        off: a.off,
                        ..h.clone()
                    });
                    names.insert(h.name.clone());
                    hinted += 1;
                    continue;
                }
            }
            let t = if a.size == 8 {
                match c.ptr.get(&K::of(a.off)).copied() {
                    Some(p) if !self.empty(p, &mut HashSet::default()) => {
                        self.build(p, &format!("{name}_{hex}"))
                    }
                    _ => None,
                }
            } else {
                None
            };
            fields.push(match t {
                Some(t) => Field {
                    id: fid(),
                    name: format!("f{hex}_ref"),
                    off: a.off,
                    t: FT::Ref(t),
                    doc: None,
                    count: None,
                },
                None => Field {
                    id: fid(),
                    name: format!("f{hex}_u{}", a.size as u32 * 8),
                    off: a.off,
                    t: FT::Scalar(a.size),
                    doc: None,
                    count: None,
                },
            });
        }
        let fns: IndexSet<i64> = c.members.iter().map(|x| x.0).collect();
        let wh = if let Some(dm) = dm {
            format!(
                "an account's data pointer (acc.data.ptr: offsets in the account data) in {}{}",
                self.cfg.fn_name(dm.0),
                if c.data.len() > 1 || !c.members.is_empty() {
                    " and the functions it is passed to"
                } else {
                    ""
                }
            )
        } else if let Some(m) = m {
            let f = self.cfg.func(m.0).unwrap();
            let p = f.vars[m.1 as usize].param;
            format!(
                "parameter {} of {}{}",
                PARAM_NAMES.get(p as usize).copied().unwrap_or("p"),
                self.cfg.fn_name(m.0),
                if fns.len() > 1 {
                    format!(
                        " and {} more function{}",
                        fns.len() - 1,
                        if fns.len() > 2 { "s" } else { "" }
                    )
                } else {
                    String::new()
                }
            )
        } else {
            format!(
                "the objects the field {} points to",
                hint.replacen("_0x", ".0x", 1)
            )
        };
        let doc = format!(
            "[heur] layout from the fixed-offset accesses through {wh} (fields: offset and size{}; other bytes not described)",
            if hinted > 0 {
                format!("; {hinted} named after {}", hint_why.clone().unwrap_or_default())
            } else {
                String::new()
            }
        );
        let v = self.views.map.get_mut(&name).unwrap();
        v.fields = fields;
        v.doc = doc;
        Some(name)
    }
}
