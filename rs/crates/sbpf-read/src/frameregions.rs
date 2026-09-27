//! `src/frameregions.ts`: frame regions, stack objects known from where their bytes come from (a call's
//! result of a known layout, and copies of it), flow-sensitive over the structured body.

use crate::util::{fo_add, to_int32, K, N};
use sbpf_ir::{CallTarget, Ir, Node, Stmt, E};
use sbpf_struct::{SNode, Tree};
use std::collections::HashMap;
use std::rc::Rc;

/// The object a call writes through its first argument.
#[derive(Clone, Debug, Default)]
pub struct Root {
    pub name: String,
    pub copy_name: String,
    pub ty: Option<String>,
    pub shift: Option<N>,
    pub size: Option<N>,
    pub why: String,
    pub reused: bool,
}

#[derive(Clone, Debug, Default)]
pub struct Region {
    pub id: usize,
    pub base: N,
    pub lo: N,
    pub hi: N,
    pub ty: Option<String>,
    pub name: String,
    pub copy_name: Option<String>,
    pub why: String,
    pub root: usize,
    pub out: bool,
    pub reused: bool,
    pub bad: bool,
    pub args: bool,
    pub dropped: bool,
}

pub trait RegionCfg {
    fn fp(&self) -> u32;
    fn bases(&self) -> &[N];
    fn root_of(&self, t: &CallTarget, args: &[E], pc: i64) -> Option<Root>;
    fn arg_root(&self, t: &CallTarget, args: &[E], pc: i64, i: usize) -> Option<Root>;
    fn typed_src(&self, e: E) -> Option<(String, String)>;
    fn is_copy(&self, t: &CallTarget) -> bool;
    fn size_of(&self, ty: &str) -> Option<N>;
    fn fits(&self, ty: &str, d: N, size: N) -> bool;
    fn embedded(&self, ty: &str, off: N) -> Option<(String, String)>;
}

pub type Act = Rc<Vec<usize>>;

pub struct Regions {
    pub list: Vec<Region>,
    pub at: HashMap<*const SNode, Act>,
}

#[derive(Clone, Copy, Debug, PartialEq)]
struct Org {
    r: usize,
    off: N,
}

/// An undoable map (UMap): `clear` is not logged, as in the TS (Map.prototype.clear is not overridden).
struct UMap<Kx: std::hash::Hash + Eq + Copy> {
    m: HashMap<Kx, Org>,
    log: Vec<(Kx, Option<Org>)>,
}
impl<Kx: std::hash::Hash + Eq + Copy> UMap<Kx> {
    fn new() -> Self {
        UMap {
            m: HashMap::new(),
            log: Vec::new(),
        }
    }
    fn get(&self, k: Kx) -> Option<Org> {
        self.m.get(&k).copied()
    }
    fn set(&mut self, k: Kx, v: Org) {
        self.log.push((k, self.m.get(&k).copied()));
        self.m.insert(k, v);
    }
    fn delete(&mut self, k: Kx) {
        if let Some(v) = self.m.remove(&k) {
            self.log.push((k, Some(v)));
        }
    }
    fn mark(&self) -> usize {
        self.log.len()
    }
    fn undo(&mut self, m: usize) -> Vec<Kx> {
        let mut ks = Vec::new();
        while self.log.len() > m {
            let (k, v) = self.log.pop().unwrap();
            ks.push(k);
            match v {
                Some(v) => {
                    self.m.insert(k, v);
                }
                None => {
                    self.m.remove(&k);
                }
            }
        }
        ks
    }
}

fn exits(ns: &[SNode]) -> bool {
    matches!(
        ns.last(),
        Some(SNode::Return(_) | SNode::Break(_) | SNode::Continue(_) | SNode::Trap(_))
    )
}

fn has_break(ns: &[SNode]) -> bool {
    ns.iter().any(|n| match n {
        SNode::Break(_) => true,
        SNode::If { then, els, .. } => has_break(then) || has_break(els),
        SNode::Block { body, .. } => has_break(body),
        SNode::Switch { cases, .. } => cases.iter().any(|c| has_break(&c.1)),
        _ => false,
    })
}

struct W<'a, C: RegionCfg + ?Sized> {
    cfg: &'a C,
    ir: &'a Ir,
    tree: &'a Tree,
    list: Vec<Region>,
    at: HashMap<*const SNode, Act>,
    org: UMap<K>,
    var_org: UMap<u32>,
    act: Act,
    accesses: Vec<(N, N, Act)>,
    here: Option<(*const Vec<SNode>, usize)>,
    built: Vec<(*const Vec<SNode>, usize, usize)>,
}

impl<C: RegionCfg + ?Sized> W<'_, C> {
    fn fo(&self, e: E) -> Option<N> {
        fo_add(self.ir, e, Some(self.cfg.fp()))
    }
    fn next_base(&self, o: N) -> N {
        for &b in self.cfg.bases() {
            if b > o {
                return b.min(o + 512.0);
            }
        }
        o + 512.0
    }
    fn origin_of(&self, e: E) -> Option<Org> {
        match self.ir.get(e) {
            Node::Var(v) => self.var_org.get(v),
            Node::Load { size: 8, addr } => self.fo(addr).and_then(|o| self.org.get(K::of(o))),
            _ => None,
        }
    }
    fn loads(&mut self, e: E) {
        let ir = self.ir;
        let mut found = Vec::new();
        ir.walk(e, &mut |_, x| {
            if let Node::Load { size, addr } = x {
                found.push((addr, size));
            }
        });
        for (addr, size) in found {
            if let Some(o) = self.fo(addr) {
                self.accesses.push((o, size as N, self.act.clone()));
            }
        }
    }
    fn clobber(&mut self, o: N, n: N) {
        if self.org.m.is_empty() {
            return;
        }
        let ks: Vec<K> = self.org.m.keys().copied().collect();
        for k in ks {
            let w = k.get();
            if w + 8.0 > o && w < o + n {
                self.org.delete(k);
            }
        }
    }
    fn end(&mut self, keep: &dyn Fn(&Region) -> bool) {
        let a: Vec<usize> = self.act.iter().copied().filter(|&id| keep(&self.list[id])).collect();
        if a.len() != self.act.len() {
            self.act = Rc::new(a);
        }
    }
    fn overwrite(&mut self, o: N, n: N) {
        self.end(&|r: &Region| !(r.out && r.lo >= o && r.lo < o + n));
    }
    fn open(&mut self, mut r: Region) -> usize {
        let id = self.list.len();
        r.id = id;
        let (lo, hi) = (r.lo, r.hi);
        self.list.push(r);
        self.end(&|x: &Region| x.hi <= lo || x.lo >= hi || (!x.out && x.lo <= lo && x.hi >= hi));
        let mut a = (*self.act).clone();
        a.push(id);
        self.act = Rc::new(a);
        id
    }
    fn find_copy(&self, root: usize, base: N) -> Option<usize> {
        self.act
            .iter()
            .copied()
            .find(|&id| {
                let r = &self.list[id];
                !r.out && r.root == root && r.base == base
            })
    }
    fn copied(&mut self, d: N, n: N, src: Org) -> Option<Org> {
        let s_root = self.list[src.r].root;
        let base = d - src.off;
        if let Some(x) = self.find_copy(s_root, base) {
            let r = &mut self.list[x];
            r.lo = r.lo.min(d);
            r.hi = r.hi.max(d + n);
            return None;
        }
        let root = self.list[s_root].clone();
        let size = root.ty.as_ref().and_then(|t| self.cfg.size_of(t));
        let why = "a copy of such an object (memcpy / copy / word by word)".to_string();
        if let (Some(ty), Some(size)) = (&root.ty, size) {
            if size != 0.0 && 2.0 * n >= size {
                self.open(Region {
                    base,
                    lo: d,
                    hi: d + n,
                    ty: Some(ty.clone()),
                    name: root.copy_name.clone().unwrap_or(root.name.clone()),
                    why,
                    root: s_root,
                    out: false,
                    ..Default::default()
                });
                return None;
            }
        }
        let f = root.ty.as_ref().and_then(|t| self.cfg.embedded(t, src.off));
        if let Some((fty, fname)) = f {
            if let Some(fs) = self.cfg.size_of(&fty) {
                if fs != 0.0 && 2.0 * n >= fs && n <= fs {
                    let root_id = self.list.len();
                    let id = self.open(Region {
                        base: d,
                        lo: d,
                        hi: d + n,
                        ty: Some(fty),
                        name: fname.clone(),
                        copy_name: Some(fname),
                        why,
                        root: root_id,
                        out: false,
                        ..Default::default()
                    });
                    return Some(Org { r: id, off: 0.0 });
                }
            }
        }
        None
    }
    fn on_copy(&mut self, dst: E, src: E, n: N) {
        let Some(d) = self.fo(dst) else { return };
        let s = self.fo(src);
        let nw = (to_int32(n) >> 3).max(0) as usize;
        let mut words: Vec<Option<Org>> = Vec::new();
        if let Some(s) = s {
            for i in 0..nw {
                words.push(self.org.get(K::of(s + 8.0 * i as N)));
            }
        }
        let w0 = words.first().copied().flatten();
        let run = w0.is_some_and(|w0| {
            words
                .iter()
                .enumerate()
                .all(|(i, w)| w.is_some_and(|w| w.r == w0.r && w.off == w0.off + 8.0 * i as N))
        });
        let n8 = (to_int32(n) & !7) as N;
        if run && n >= 16.0 {
            self.clobber(d, n);
            let e = self.copied(d, n8, w0.unwrap());
            for (i, w) in words.iter().enumerate() {
                let v = match e {
                    Some(e) => Org {
                        r: e.r,
                        off: 8.0 * i as N,
                    },
                    None => w.unwrap(),
                };
                self.org.set(K::of(d + 8.0 * i as N), v);
            }
            return;
        }
        let t = if s.is_none() { self.cfg.typed_src(src) } else { None };
        let size = t.as_ref().and_then(|t| self.cfg.size_of(&t.0));
        self.clobber(d, n);
        if let (Some((ty, name)), Some(size)) = (&t, size) {
            if size != 0.0 && n >= 16.0 && n <= size {
                let id = self.list.len();
                self.list.push(Region {
                    id,
                    base: d,
                    lo: d,
                    hi: d,
                    ty: Some(ty.clone()),
                    name: name.clone(),
                    copy_name: Some(format!("{name}_copy")),
                    why: String::new(),
                    root: id,
                    out: false,
                    dropped: true,
                    ..Default::default()
                });
                self.copied(d, n8, Org { r: id, off: 0.0 });
                for i in 0..nw {
                    self.org.set(
                        K::of(d + 8.0 * i as N),
                        Org {
                            r: id,
                            off: 8.0 * i as N,
                        },
                    );
                }
                return;
            }
        }
        self.overwrite(d, n);
    }
    fn on_call(&mut self, t: &CallTarget, args: &[E], pc: i64, dst: i32) {
        for &a in args {
            self.loads(a);
        }
        if dst >= 0 {
            self.var_org.delete(dst as u32);
        }
        if self.cfg.is_copy(t) && args.len() >= 3 {
            if let Node::Const(n) = self.ir.get(args[2]) {
                if n < 0x10000 {
                    self.on_copy(args[0], args[1], n as N);
                    return;
                }
            }
        }
        for &a in args {
            if let Some(g) = self.fo(a) {
                self.clobber(g, 256.0);
                if matches!(t, CallTarget::Sys { .. }) {
                    self.overwrite(g, 1.0);
                }
            }
        }
        let o = args.first().and_then(|&a| self.fo(a));
        let r = o.and_then(|_| self.cfg.root_of(t, args, pc));
        if let (Some(o), None) = (o, &r) {
            self.overwrite(o, 1.0);
        }
        if let (Some(o), Some(r)) = (o, &r) {
            let lo = o + r.shift.unwrap_or(0.0);
            let size = match &r.ty {
                Some(ty) => r.size.or_else(|| self.cfg.size_of(ty)),
                None => None,
            }
            .filter(|s| *s != 0.0 && !s.is_nan());
            let hi = match size {
                Some(s) => lo + s,
                None => self.next_base(o),
            };
            let root = self.list.len();
            let id = self.open(Region {
                base: lo,
                lo,
                hi,
                ty: if size.is_some() { r.ty.clone() } else { None },
                name: r.name.clone(),
                copy_name: Some(r.copy_name.clone()),
                why: r.why.clone(),
                root,
                out: true,
                reused: r.reused,
                ..Default::default()
            });
            if let Some(size) = size {
                let mut w = 0.0;
                while w + 8.0 <= size {
                    self.org.set(K::of(lo + w), Org { r: id, off: w });
                    w += 8.0;
                }
            }
        }
        for (i, &a) in args.iter().enumerate() {
            let Some(g) = self.fo(a) else { continue };
            if i == 0 && r.is_some() {
                continue;
            }
            let Some(x) = self.cfg.arg_root(t, args, pc, i) else { continue };
            let Some(size) = x.ty.as_ref().and_then(|t| self.cfg.size_of(t)).filter(|s| *s != 0.0 && !s.is_nan()) else {
                continue;
            };
            let root = self.list.len();
            let id = self.open(Region {
                base: g,
                lo: g,
                hi: g + size,
                ty: x.ty.clone(),
                name: x.name.clone(),
                copy_name: Some(x.copy_name.clone()),
                why: x.why.clone(),
                root,
                out: true,
                ..Default::default()
            });
            let mut w = 0.0;
            while w + 8.0 <= size {
                self.org.set(K::of(g + w), Org { r: id, off: w });
                w += 8.0;
            }
            if let Some(h) = self.here {
                self.built.push((h.0, h.1, id));
            }
        }
    }
    fn put(&mut self, d: N, i: N, v: Option<Org>) {
        self.clobber(d + i, 8.0);
        let Some(v) = v else {
            self.overwrite(d + i, 8.0);
            return;
        };
        self.org.set(K::of(d + i), v);
        let s_root = self.list[v.r].root;
        let base = d + i - v.off;
        if let Some(x) = self.find_copy(s_root, base) {
            let r = &mut self.list[x];
            r.lo = r.lo.min(d + i);
            r.hi = r.hi.max(d + i + 8.0);
        }
    }
    fn on_stmt(&mut self, s: &Stmt) {
        let ir = self.ir;
        match s {
            Stmt::Set { dst, e, pc } => {
                if let Node::Call(t, args) = ir.get(*e) {
                    let t = ir.target(t);
                    self.on_call(&t, &ir.to_vec(args), *pc, *dst);
                    return;
                }
                self.loads(*e);
                match self.origin_of(*e) {
                    Some(o) => self.var_org.set(*dst as u32, o),
                    None => self.var_org.delete(*dst as u32),
                }
            }
            Stmt::Call { t, args, pc, dst, .. } => {
                self.on_call(t, &ir.to_vec(*args), *pc, *dst);
                if let CallTarget::Ind { e } = t {
                    self.loads(*e);
                }
            }
            Stmt::Eval { e, .. } => self.loads(*e),
            Stmt::Store { .. } | Stmt::Stores { .. } => {
                let (addr, size, vals): (E, u8, Vec<E>) = match s {
                    Stmt::Store { addr, size, v, .. } => (*addr, *size, vec![*v]),
                    Stmt::Stores { addr, size, vals, .. } => (*addr, *size, ir.to_vec(*vals)),
                    _ => unreachable!(),
                };
                self.loads(addr);
                for &v in &vals {
                    self.loads(v);
                }
                let Some(d) = self.fo(addr) else { return };
                for i in 0..vals.len() {
                    self.accesses.push((d + (i * size as usize) as N, size as N, self.act.clone()));
                }
                let tot = (size as usize * vals.len()) as N;
                if size != 8 {
                    self.clobber(d, tot);
                    self.overwrite(d, tot);
                    return;
                }
                let os: Vec<Option<Org>> = vals.iter().map(|&v| self.origin_of(v)).collect();
                let o0 = os[0];
                if os.len() >= 2
                    && o0.is_some()
                    && os.iter().enumerate().all(|(i, o)| {
                        o.is_some_and(|o| o.r == o0.unwrap().r && o.off == o0.unwrap().off + 8.0 * i as N)
                    })
                {
                    self.clobber(d, 8.0 * os.len() as N);
                    let e = self.copied(d, 8.0 * os.len() as N, o0.unwrap());
                    for (i, o) in os.iter().enumerate() {
                        let v = match e {
                            Some(e) => Org {
                                r: e.r,
                                off: 8.0 * i as N,
                            },
                            None => o.unwrap(),
                        };
                        self.org.set(K::of(d + 8.0 * i as N), v);
                    }
                    return;
                }
                for (i, o) in os.into_iter().enumerate() {
                    self.put(d, 8.0 * i as N, o);
                }
            }
            Stmt::Copy { dst, src, n, .. } => self.on_copy(*dst, *src, *n as N),
            Stmt::Trap { .. } => {}
        }
    }
    fn writes(&self, ns: &[SNode], w: &mut Vec<(N, N)>) {
        let ir = self.ir;
        for n in ns {
            match n {
                SNode::Stmt(si) => {
                    let s = self.tree.stmt(*si);
                    match s {
                        Stmt::Store { addr, size, .. } => {
                            if let Some(d) = self.fo(*addr) {
                                w.push((d, d + *size as N));
                            }
                        }
                        Stmt::Stores { addr, size, vals, .. } => {
                            if let Some(d) = self.fo(*addr) {
                                w.push((d, d + (*size as u32 * vals.len) as N));
                            }
                        }
                        Stmt::Copy { dst, n, .. } => {
                            if let Some(d) = self.fo(*dst) {
                                w.push((d, d + *n as N));
                            }
                        }
                        _ => {
                            if let Some((_, args)) = crate::util::call_of(ir, s) {
                                for a in ir.items(args) {
                                    if let Some(d) = self.fo(a) {
                                        w.push((d, d + 65536.0));
                                    }
                                }
                            }
                        }
                    }
                }
                SNode::If { then, els, .. } => {
                    self.writes(then, w);
                    self.writes(els, w);
                }
                SNode::Block { body, .. } | SNode::Loop { body, .. } => self.writes(body, w),
                SNode::Switch { cases, .. } => {
                    for c in cases {
                        self.writes(&c.1, w);
                    }
                }
                _ => {}
            }
        }
    }
    fn forget(&mut self, w: &[(N, N)]) {
        if w.is_empty() {
            return;
        }
        self.end(&|r: &Region| !w.iter().any(|&(a, b)| a < r.hi && b > r.lo));
        let ks: Vec<K> = self.org.m.keys().copied().collect();
        for k in ks {
            let kk = k.get();
            if w.iter().any(|&(a, b)| a < kk + 8.0 && b > kk) {
                self.org.delete(k);
            }
        }
        self.var_org.m.clear();
    }
    fn isolated(&mut self, ns: &Vec<SNode>) -> (Act, Vec<K>, Vec<u32>) {
        let a0 = self.act.clone();
        let m = self.org.mark();
        let v = self.var_org.mark();
        self.walk(ns);
        let r = (self.act.clone(), self.org.undo(m), self.var_org.undo(v));
        self.act = a0;
        r
    }
    fn walk(&mut self, ns: &Vec<SNode>) {
        let meet = |xs: &[Act]| -> Act {
            Rc::new(
                xs[0]
                    .iter()
                    .copied()
                    .filter(|id| xs.iter().all(|x| x.contains(id)))
                    .collect(),
            )
        };
        for (i, n) in ns.iter().enumerate() {
            if let SNode::Loop { body, .. } = n {
                let mut w = Vec::new();
                self.writes(body, &mut w);
                self.forget(&w);
            }
            if !self.act.is_empty() && !matches!(n, SNode::Stmt(_)) {
                self.at.insert(n as *const SNode, self.act.clone());
            }
            match n {
                SNode::Stmt(si) => {
                    self.here = Some((ns as *const Vec<SNode>, i));
                    let s = self.tree.stmt(*si).clone();
                    self.on_stmt(&s);
                    self.here = None;
                    if !self.act.is_empty() {
                        self.at.insert(n as *const SNode, self.act.clone());
                    }
                }
                SNode::If { c, then, els } => {
                    self.loads(*c);
                    let (te, ee) = (exits(then), exits(els));
                    if te && !ee {
                        self.isolated(then);
                        self.walk(els);
                    } else if ee && !te {
                        self.isolated(els);
                        self.walk(then);
                    } else {
                        let a = self.isolated(then);
                        let b = self.isolated(els);
                        for k in a.1.iter().chain(b.1.iter()) {
                            self.org.delete(*k);
                        }
                        for k in a.2.iter().chain(b.2.iter()) {
                            self.var_org.delete(*k);
                        }
                        if !te {
                            self.act = meet(&[a.0, b.0]);
                        }
                    }
                }
                SNode::Block { body, .. } => {
                    self.walk(body);
                    if has_break(body) {
                        let mut w = Vec::new();
                        self.writes(body, &mut w);
                        self.forget(&w);
                    }
                }
                SNode::Loop { body, c, .. } => {
                    if let Some(c) = c {
                        self.loads(*c);
                    }
                    self.walk(body);
                    let mut w = Vec::new();
                    self.writes(body, &mut w);
                    self.forget(&w);
                }
                SNode::Switch { cases, .. } => {
                    let rs: Vec<(Act, Vec<K>, Vec<u32>)> = cases.iter().map(|c| self.isolated(&c.1)).collect();
                    for r in &rs {
                        for k in &r.1 {
                            self.org.delete(*k);
                        }
                        for k in &r.2 {
                            self.var_org.delete(*k);
                        }
                    }
                    let live: Vec<Act> = rs
                        .iter()
                        .enumerate()
                        .filter(|(i, _)| !exits(&cases[*i].1))
                        .map(|(_, r)| r.0.clone())
                        .collect();
                    if !live.is_empty() {
                        self.act = meet(&live);
                    }
                }
                SNode::Return(Some(e)) => self.loads(*e),
                _ => {}
            }
        }
    }
    fn scan(&self, ns: &[SNode]) -> bool {
        let ir = self.ir;
        for n in ns {
            match n {
                SNode::Stmt(si) => {
                    let s = self.tree.stmt(*si);
                    let spc = crate::util::stmt_pc(s);
                    if let Some((t, args)) = crate::util::call_of(ir, s) {
                        let av = ir.to_vec(args);
                        if av.first().is_some_and(|&a| self.fo(a).is_some()) && self.cfg.root_of(&t, &av, spc).is_some() {
                            return true;
                        }
                        if av.iter().enumerate().any(|(i, &a)| self.fo(a).is_some() && self.cfg.arg_root(&t, &av, spc, i).is_some()) {
                            return true;
                        }
                        if self.cfg.is_copy(&t) && av.get(1).is_some_and(|&a| self.cfg.typed_src(a).is_some()) {
                            return true;
                        }
                    } else if let Stmt::Copy { src, .. } = s {
                        if self.cfg.typed_src(*src).is_some() {
                            return true;
                        }
                    }
                }
                SNode::If { then, els, .. } => {
                    if self.scan(then) || self.scan(els) {
                        return true;
                    }
                }
                SNode::Block { body, .. } | SNode::Loop { body, .. } => {
                    if self.scan(body) {
                        return true;
                    }
                }
                SNode::Switch { cases, .. } => {
                    for c in cases {
                        if self.scan(&c.1) {
                            return true;
                        }
                    }
                }
                _ => {}
            }
        }
        false
    }
}

/// frameRegions
pub fn frame_regions<C: RegionCfg + ?Sized>(ir: &Ir, tree: &Tree, body: &Vec<SNode>, cfg: &C) -> Regions {
    let mut w = W {
        cfg,
        ir,
        tree,
        list: Vec::new(),
        at: HashMap::new(),
        org: UMap::new(),
        var_org: UMap::new(),
        act: Rc::new(Vec::new()),
        accesses: Vec::new(),
        here: None,
        built: Vec::new(),
    };
    if !w.scan(body) {
        return Regions {
            list: w.list,
            at: w.at,
        };
    }
    w.walk(body);
    let built = std::mem::take(&mut w.built);
    for (ns, i, id) in built {
        // SAFETY: the lists are nodes of `body`, alive and unchanged for the whole call
        let ns: &Vec<SNode> = unsafe { &*ns };
        let mut any = false;
        for k in (0..i).rev() {
            let n = &ns[k];
            let SNode::Stmt(si) = n else { break };
            let s = tree.stmt(*si);
            if matches!(s, Stmt::Call { .. } | Stmt::Trap { .. })
                || matches!(s, Stmt::Set { e, .. } if matches!(ir.get(*e), Node::Call(..)))
            {
                break;
            }
            let (addr, size, n2) = match s {
                Stmt::Store { addr, size, .. } => (*addr, *size, 1u32),
                Stmt::Stores { addr, size, vals, .. } => (*addr, *size, vals.len),
                _ => continue,
            };
            let Some(d) = w.fo(addr) else { continue };
            let r = &w.list[id];
            let tot = (n2 * size as u32) as N;
            if d + tot <= r.lo || d >= r.hi {
                continue;
            }
            let rt = r.ty.clone().unwrap_or_default();
            let fits: Vec<bool> = (0..n2)
                .map(|j| cfg.fits(&rt, d + (j * size as u32) as N - r.base, size as N))
                .collect();
            if d < r.lo || d + tot > r.hi || !fits.iter().all(|x| *x) {
                break;
            }
            let key = n as *const SNode;
            let a = w.at.get(&key).cloned();
            w.at.insert(
                key,
                Rc::new(match a {
                    Some(a) => {
                        let mut v = (*a).clone();
                        v.push(id);
                        v
                    }
                    None => vec![id],
                }),
            );
            any = true;
        }
        if any {
            w.list[id].args = true;
        }
    }
    let mut per_slot: HashMap<K, u32> = HashMap::new();
    for r in &w.list {
        if r.out && !r.dropped {
            *per_slot.entry(K::of(r.lo)).or_default() += 1;
        }
    }
    for r in w.list.iter_mut() {
        if r.out && r.reused && per_slot.get(&K::of(r.lo)).copied().unwrap_or(0) < 2 {
            r.dropped = true;
        }
        if !r.out && r.hi - r.lo < 16.0 {
            r.dropped = true;
        }
    }
    let accesses = std::mem::take(&mut w.accesses);
    for (off, size, act) in accesses {
        if let Some(rid) = innermost(&w.list, &act, off) {
            let r = &w.list[rid];
            if let Some(ty) = &r.ty {
                if !r.bad && !cfg.fits(ty, off - r.base, size) {
                    w.list[rid].bad = true;
                }
            }
        }
    }
    Regions {
        list: w.list,
        at: w.at,
    }
}

/// innermost: the innermost live region of an active set holding frame offset o.
pub fn innermost(list: &[Region], act: &[usize], o: N) -> Option<usize> {
    let mut best: Option<usize> = None;
    for &id in act {
        let r = &list[id];
        if r.dropped || o < r.lo || o >= r.hi {
            continue;
        }
        if best.is_none_or(|b| r.hi - r.lo < list[b].hi - list[b].lo) {
            best = Some(id);
        }
    }
    best
}
