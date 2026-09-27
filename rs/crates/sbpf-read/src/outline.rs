//! `src/outline.ts`: outlining of repeated function tails (exact): runs of statements ending in a
//! return that recur in several places are printed once as helpers (`ret_tail_N` / `tail_N`).

use crate::util::{js_hex, json_str, n_s, N};
use indexmap::IndexMap;
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, E};
use sbpf_program::{Func, VarInfo};
use sbpf_struct::{SNode, Tree};
use std::collections::{HashMap, HashSet};

pub struct OutlineFn<'a> {
    pub f: &'a Func,
    pub tree: &'a Tree,
    pub fp: Option<u32>,
    pub ret: Option<u32>,
    pub bases: Vec<N>,
    pub no_const_stores: bool,
}

pub struct Helper {
    pub name: String,
    pub params: Vec<String>,
    pub vars: Vec<VarInfo>,
    pub names: Vec<String>,
    pub ir: Ir,
    pub tree: Tree,
    pub value: bool,
    pub uses: usize,
}

pub struct OutlineUse {
    pub helper: usize,
    pub args: Vec<E>,
}

#[derive(Default)]
pub struct Outlines {
    /// (function index, list) -> index in the list -> use
    pub at: HashMap<(usize, *const Vec<SNode>), HashMap<usize, OutlineUse>>,
    pub helpers: Vec<Helper>,
}

const MAX_NODES: usize = 16;
const MAX_PARAMS: usize = 8;

fn line_count(ns: &[SNode]) -> usize {
    let mut n = 0;
    for x in ns {
        n += match x {
            SNode::If { then, els, .. } => {
                1 + line_count(then)
                    + if els.is_empty() {
                        0
                    } else {
                        1 + line_count(els)
                    }
                    + 1
            }
            _ => 1,
        };
    }
    n
}

struct Cand {
    fi: usize,
    list: *const Vec<SNode>,
    i: usize,
    lines: usize,
    params: Vec<E>,
    key: String,
    lead: Option<u32>,
}

impl Cand {
    fn nodes(&self) -> &[SNode] {
        // SAFETY: the list is a node list of a function body alive for the whole findOutlines call
        unsafe { &(&*self.list)[self.i..] }
    }
}

fn returns_value(n: &SNode) -> bool {
    match n {
        SNode::Return(e) => e.is_some(),
        SNode::If { then, els, .. } => {
            then.iter().any(returns_value) || els.iter().any(returns_value)
        }
        _ => false,
    }
}

fn occurrences(ir: &Ir, tree: &Tree, ns: &[SNode], m: &mut HashMap<u32, u32>) {
    let ex = |e: E, m: &mut HashMap<u32, u32>| {
        ir.walk(e, &mut |_, x| {
            if let Node::Var(v) = x {
                *m.entry(v).or_default() += 1;
            }
        })
    };
    for n in ns {
        match n {
            SNode::Stmt(si) => {
                let s = tree.stmt(*si);
                for e in crate::util::stmt_exprs(ir, s) {
                    ex(e, m);
                }
                if let Some(d) = crate::util::dst_of(s) {
                    *m.entry(d).or_default() += 1;
                }
            }
            SNode::If { c, then, els } => {
                ex(*c, m);
                occurrences(ir, tree, then, m);
                occurrences(ir, tree, els, m);
            }
            SNode::Block { body, .. } => occurrences(ir, tree, body, m),
            SNode::Loop { c, body, .. } => {
                if let Some(c) = c {
                    ex(*c, m);
                }
                occurrences(ir, tree, body, m);
            }
            SNode::Return(Some(e)) => ex(*e, m),
            SNode::Switch { v, cases } => {
                *m.entry(*v).or_default() += 1;
                for c in cases {
                    occurrences(ir, tree, &c.1, m);
                }
            }
            SNode::SetState { v, .. } => *m.entry(*v).or_default() += 1,
            _ => {}
        }
    }
}

fn base_of(bases: &[N], c: N) -> N {
    let mut b = c;
    for &x in bases {
        if x <= c && c - x < 512.0 {
            b = x;
        }
        if x > c {
            break;
        }
    }
    b
}

fn frame_off(ir: &Ir, e: E, fp: Option<u32>) -> Option<N> {
    crate::util::fo_add(ir, e, fp)
}

/// leadCall: a call statement assigning its result to a variable (not fp / the out parameter).
fn lead_call(fn_: &OutlineFn, n: &SNode) -> Option<(u32, E)> {
    let SNode::Stmt(si) = n else { return None };
    let ir = fn_.f.ir.as_ref().unwrap();
    let s = fn_.tree.stmt(*si);
    match s {
        Stmt::Call {
            dst,
            t,
            args,
            extra,
            ..
        } if *dst >= 0 && Some(*dst as u32) != fn_.fp && Some(*dst as u32) != fn_.ret => {
            let mut all = ir.to_vec(*args);
            if let Some(x) = extra {
                all.extend(ir.items(*x));
            }
            let l = ir.list(all);
            let ti = ir.mk_target(t.clone());
            Some((*dst as u32, ir.mk(Node::Call(ti, l))))
        }
        Stmt::Set { dst, e, .. }
            if matches!(ir.get(*e), Node::Call(..))
                && Some(*dst as u32) != fn_.fp
                && Some(*dst as u32) != fn_.ret =>
        {
            Some((*dst as u32, *e))
        }
        _ => None,
    }
}

fn ok_node(fn_: &OutlineFn, n: &SNode) -> bool {
    let ir = fn_.f.ir.as_ref().unwrap();
    let (fp, ret) = (fn_.fp, fn_.ret);
    fn ok_expr(ir: &Ir, fp: Option<u32>, e: E) -> bool {
        match ir.get(e) {
            Node::Call(..) => false,
            Node::Var(id) => Some(id) != fp,
            Node::Bin(op, a, b) => {
                if op == BinOp::Add
                    && Some(ir.get(a)) == fp.map(Node::Var)
                    && matches!(ir.get(b), Node::Const(_))
                {
                    return true;
                }
                ok_expr(ir, fp, a) && ok_expr(ir, fp, b)
            }
            Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                ok_expr(ir, fp, a) && ok_expr(ir, fp, b)
            }
            Node::Neg(a)
            | Node::Not(a)
            | Node::Lnot(a)
            | Node::Ext { a, .. }
            | Node::Bswap { a, .. } => ok_expr(ir, fp, a),
            Node::Load { addr, .. } => ok_expr(ir, fp, addr),
            Node::Sel(c, a, b) => ok_expr(ir, fp, c) && ok_expr(ir, fp, a) && ok_expr(ir, fp, b),
            Node::Fn(_, args) => ir.items(args).all(|x| ok_expr(ir, fp, x)),
            _ => true,
        }
    }
    let dest = |a: E| {
        let b = match ir.get(a) {
            Node::Bin(BinOp::Add, x, c) if matches!(ir.get(c), Node::Const(_)) => x,
            _ => a,
        };
        matches!(ir.get(b), Node::Var(v) if Some(v) == fp || Some(v) == ret)
    };
    match n {
        SNode::Stmt(si) => match fn_.tree.stmt(*si) {
            Stmt::Set { e, dst, .. } => {
                ok_expr(ir, fp, *e) && Some(*dst as u32) != fp && Some(*dst as u32) != ret
            }
            Stmt::Store { addr, v, .. } => {
                dest(*addr)
                    && ok_expr(ir, fp, *addr)
                    && ok_expr(ir, fp, *v)
                    && !(fn_.no_const_stores && matches!(ir.get(*v), Node::Const(_)))
            }
            Stmt::Stores { addr, vals, .. } => {
                dest(*addr)
                    && ok_expr(ir, fp, *addr)
                    && ir.items(*vals).all(|x| ok_expr(ir, fp, x))
                    && !(fn_.no_const_stores
                        && ir.items(*vals).any(|x| matches!(ir.get(x), Node::Const(_))))
            }
            Stmt::Copy { dst, src, .. } => {
                dest(*dst) && ok_expr(ir, fp, *dst) && ok_expr(ir, fp, *src)
            }
            Stmt::Eval { e, .. } => ok_expr(ir, fp, *e),
            Stmt::Trap { .. } => true,
            Stmt::Call { .. } => false,
        },
        SNode::If { c, then, els } => {
            ok_expr(ir, fp, *c)
                && then.iter().all(|x| ok_node(fn_, x))
                && els.iter().all(|x| ok_node(fn_, x))
        }
        SNode::Return(e) => e.is_none_or(|e| ok_expr(ir, fp, e)),
        SNode::Trap(_) => true,
        _ => false,
    }
}

enum CandR {
    Null,
    Undef,
    Some(String, Vec<E>, Option<u32>),
}

fn candidate(fn_: &OutlineFn, ns: &[SNode], i: usize, total: &HashMap<u32, u32>) -> CandR {
    let ir = fn_.f.ir.as_ref().unwrap();
    let tree = fn_.tree;
    let fp = fn_.fp;
    let lead = lead_call(fn_, &ns[i]);
    if lead.is_none() && !ok_node(fn_, &ns[i]) {
        return CandR::Null;
    }
    let run = &ns[i..];
    for n in &run[1..] {
        if !ok_node(fn_, n) {
            return CandR::Undef;
        }
    }
    let mut in_run = HashMap::new();
    occurrences(ir, tree, run, &mut in_run);
    let only = |id: u32| in_run.get(&id) == total.get(&id) && !crate::util::is_param(fn_.f, id);
    struct S<'a> {
        ir: &'a Ir,
        fp: Option<u32>,
        bases: &'a [N],
        vars: IndexMap<u32, String>,
        frames: IndexMap<crate::util::K, String>,
        params: Vec<E>,
    }
    impl S<'_> {
        fn use_var(&mut self, id: u32, only: &dyn Fn(u32) -> bool) -> String {
            if let Some(s) = self.vars.get(&id) {
                return s.clone();
            }
            if only(id) {
                let s = format!("L{}", self.vars.len());
                self.vars.insert(id, s.clone());
                return s;
            }
            let s = format!("P{}", self.params.len());
            self.vars.insert(id, s.clone());
            let v = self.ir.var(id);
            self.params.push(v);
            s
        }
        fn ser(&mut self, e: E, only: &dyn Fn(u32) -> bool) -> String {
            let ir = self.ir;
            if let Some(o) = frame_off(ir, e, self.fp) {
                let b = base_of(self.bases, o);
                let s = match self.frames.get(&crate::util::K::of(b)) {
                    Some(s) => s.clone(),
                    None => {
                        let s = format!("P{}", self.params.len());
                        self.frames.insert(crate::util::K::of(b), s.clone());
                        let v = ir.var(self.fp.unwrap());
                        let c = ir.c(crate::util::big_u(b));
                        let x = ir.bin(BinOp::Add, v, c);
                        self.params.push(x);
                        s
                    }
                };
                return format!("({s}+{})", crate::util::js_num(o - b));
            }
            match ir.get(e) {
                Node::Const(v) => format!("#{v:x}"),
                Node::Var(id) => self.use_var(id, only),
                Node::Reg(r) => format!("r{r}"),
                Node::Undef => "U".into(),
                Node::Bin(op, a, b) => {
                    let (x, y) = (self.ser(a, only), self.ser(b, only));
                    format!("({} {x} {y})", op.as_str())
                }
                Node::Cmp(op, a, b) => {
                    let (x, y) = (self.ser(a, only), self.ser(b, only));
                    format!("({} {x} {y})", op.as_str())
                }
                Node::Land(a, b) => {
                    let (x, y) = (self.ser(a, only), self.ser(b, only));
                    format!("(land {x} {y})")
                }
                Node::Lor(a, b) => {
                    let (x, y) = (self.ser(a, only), self.ser(b, only));
                    format!("(lor {x} {y})")
                }
                Node::Neg(a) => format!("(neg {})", self.ser(a, only)),
                Node::Not(a) => format!("(not {})", self.ser(a, only)),
                Node::Lnot(a) => format!("(lnot {})", self.ser(a, only)),
                Node::Ext { signed, bits, a } => {
                    format!(
                        "(ext{}{bits} {})",
                        if signed { 's' } else { 'u' },
                        self.ser(a, only)
                    )
                }
                Node::Bswap { bits, a } => format!("(bswap{bits} {})", self.ser(a, only)),
                Node::Load { size, addr } => format!("[{size} {}]", self.ser(addr, only)),
                Node::Sel(c, a, b) => {
                    let (x, y, z) = (self.ser(c, only), self.ser(a, only), self.ser(b, only));
                    format!("(? {x} {y} {z})")
                }
                Node::Fn(n, args) => {
                    let name = ir.name(n);
                    let parts: Vec<String> = ir.items(args).map(|x| self.ser(x, only)).collect();
                    format!("({} {})", name, parts.join(" "))
                }
                Node::Call(..) => crate::util::js_throw("call in an outlining candidate"),
                Node::Item(_) => unreachable!(),
            }
        }
        fn stmt(&mut self, tree: &Tree, s: &Stmt, top: bool, only: &dyn Fn(u32) -> bool) -> String {
            match s {
                Stmt::Set { dst, e, .. } => {
                    let e = self.ser(*e, only);
                    let d = *dst as u32;
                    if !self.vars.contains_key(&d) && top {
                        let l = format!("L{}", self.vars.len());
                        self.vars.insert(d, l.clone());
                        return format!("{l}={e}");
                    }
                    format!("{}={e}", self.use_var(d, only))
                }
                Stmt::Store { size, addr, v, .. } => {
                    let (a, b) = (self.ser(*addr, only), self.ser(*v, only));
                    format!("st{size} {a} {b}")
                }
                Stmt::Stores {
                    size, addr, vals, ..
                } => {
                    let a = self.ser(*addr, only);
                    let vs: Vec<String> = self.ir.items(*vals).map(|x| self.ser(x, only)).collect();
                    format!("sts{size} {a} {}", vs.join(" "))
                }
                Stmt::Copy {
                    dst, src, n, rev, ..
                } => {
                    let (a, b) = (self.ser(*dst, only), self.ser(*src, only));
                    format!(
                        "cp{} {a} {b} {n}",
                        if *rev == Some(true) { "r" } else { "" }
                    )
                }
                Stmt::Eval { e, .. } => format!("ev {}", self.ser(*e, only)),
                Stmt::Trap { msg, .. } => format!("trap {}", json_str(msg)),
                Stmt::Call { .. } => crate::util::js_throw("call in an outlining candidate"),
            }
        }
        fn list(
            &mut self,
            tree: &Tree,
            xs: &[SNode],
            top: bool,
            only: &dyn Fn(u32) -> bool,
        ) -> String {
            let mut parts = Vec::new();
            for n in xs {
                parts.push(match n {
                    SNode::Stmt(si) => self.stmt(tree, tree.stmt(*si), top, only),
                    SNode::If { c, then, els } => {
                        let c = self.ser(*c, only);
                        let a = self.list(tree, then, false, only);
                        let b = self.list(tree, els, false, only);
                        format!("if {c} {{{a}}} {{{b}}}")
                    }
                    SNode::Return(e) => match e {
                        Some(e) => format!("ret {}", self.ser(*e, only)),
                        None => "ret".into(),
                    },
                    SNode::Trap(msg) => format!("abort {}", json_str(msg)),
                    _ => crate::util::js_throw("unexpected node"),
                });
            }
            parts.join(";")
        }
    }
    let mut s = S {
        ir,
        fp,
        bases: &fn_.bases,
        vars: IndexMap::new(),
        frames: IndexMap::new(),
        params: Vec::new(),
    };
    if let Some((d, _)) = lead {
        s.vars.insert(d, "@C".into());
    }
    let mut key = s.list(
        tree,
        if lead.is_some() { &run[1..] } else { run },
        true,
        &only,
    );
    if let Some((_, call)) = lead {
        key = key.replace("@C", &format!("P{}", s.params.len()));
        s.params.push(call);
    }
    if s.params.len() > MAX_PARAMS {
        return CandR::Undef;
    }
    CandR::Some(key, s.params, lead.map(|x| x.0))
}

/// findOutlines
pub fn find_outlines(fns: &[OutlineFn], taken: &dyn Fn(&str) -> bool) -> Outlines {
    let min_lines = 3;
    let mut groups: IndexMap<String, Vec<Cand>> = IndexMap::new();
    for (fi, fn_) in fns.iter().enumerate() {
        let mut total0: Option<HashMap<u32, u32>> = None;
        fn visit(
            fn_: &OutlineFn,
            fi: usize,
            ns: &Vec<SNode>,
            total0: &mut Option<HashMap<u32, u32>>,
            groups: &mut IndexMap<String, Vec<Cand>>,
            min_lines: usize,
        ) {
            for n in ns {
                match n {
                    SNode::If { then, els, .. } => {
                        visit(fn_, fi, then, total0, groups, min_lines);
                        visit(fn_, fi, els, total0, groups, min_lines);
                    }
                    SNode::Block { body, .. } | SNode::Loop { body, .. } => {
                        visit(fn_, fi, body, total0, groups, min_lines)
                    }
                    SNode::Switch { cases, .. } => {
                        for c in cases {
                            visit(fn_, fi, &c.1, total0, groups, min_lines);
                        }
                    }
                    _ => {}
                }
            }
            if !matches!(ns.last(), Some(SNode::Return(_))) {
                return;
            }
            let mut i = ns.len() as i64 - 2;
            while i >= 0 && ns.len() - i as usize <= MAX_NODES {
                let iu = i as usize;
                let total = total0.get_or_insert_with(|| {
                    let mut m = HashMap::new();
                    occurrences(fn_.f.ir.as_ref().unwrap(), fn_.tree, &fn_.tree.body, &mut m);
                    m
                });
                match candidate(fn_, ns, iu, total) {
                    CandR::Null => break,
                    CandR::Undef => {}
                    CandR::Some(key, params, lead) => {
                        let lines = line_count(&ns[iu..]);
                        if lines >= min_lines {
                            groups.entry(key.clone()).or_default().push(Cand {
                                fi,
                                list: ns as *const Vec<SNode>,
                                i: iu,
                                lines,
                                params,
                                key,
                                lead,
                            });
                        }
                        if lead.is_some() {
                            break;
                        }
                    }
                }
                i -= 1;
            }
        }
        visit(fn_, fi, &fn_.tree.body, &mut total0, &mut groups, min_lines);
    }
    let mut covered: HashSet<*const SNode> = HashSet::new();
    fn cover(ns: &[SNode], c: &mut HashSet<*const SNode>) {
        for n in ns {
            c.insert(n as *const SNode);
            if let SNode::If { then, els, .. } = n {
                cover(then, c);
                cover(els, c);
            }
        }
    }
    fn free(ns: &[SNode], c: &HashSet<*const SNode>) -> bool {
        ns.iter().all(|n| {
            !c.contains(&(n as *const SNode))
                && match n {
                    SNode::If { then, els, .. } => free(then, c) && free(els, c),
                    _ => true,
                }
        })
    }
    let gain = |g: &[&Cand]| -> i64 {
        let site = if g[0].nodes().iter().any(returns_value) {
            1
        } else {
            2
        };
        g.len() as i64 * (g[0].lines as i64 - site) - (g[0].lines as i64 + 2)
    };
    let mut order: Vec<Vec<&Cand>> = groups
        .values()
        .map(|g| g.iter().collect::<Vec<_>>())
        .filter(|g| g.len() >= 2 && gain(g) > 0)
        .collect();
    order.sort_by(|a, b| gain(b).cmp(&gain(a)));
    let mut chosen: Vec<Vec<&Cand>> = Vec::new();
    for g0 in order {
        let g: Vec<&Cand> = g0
            .into_iter()
            .filter(|c| free(c.nodes(), &covered))
            .collect();
        if g.len() < 2 || gain(&g) <= 0 {
            continue;
        }
        for c in &g {
            cover(c.nodes(), &mut covered);
        }
        chosen.push(g);
    }
    let u16cmp = |a: &str, b: &str| a.encode_utf16().cmp(b.encode_utf16());
    chosen.sort_by(|a, b| {
        b.len().cmp(&a.len()).then(
            if u16cmp(&a[0].key, &b[0].key) == std::cmp::Ordering::Less {
                std::cmp::Ordering::Less
            } else {
                std::cmp::Ordering::Greater
            },
        )
    });
    let mut out = Outlines::default();
    let mut k = 0;
    for g in &chosen {
        let c = g[0];
        let fn_ = &fns[c.fi];
        let ret_first = g.iter().all(|x| {
            let p = x.params.first();
            let ir = fns[x.fi].f.ir.as_ref().unwrap();
            p.is_some_and(|&p| matches!(ir.get(p), Node::Var(v) if Some(v) == fns[x.fi].ret))
        });
        let mut name;
        loop {
            k += 1;
            name = format!("{}_{k}", if ret_first { "ret_tail" } else { "tail" });
            if !taken(&name) {
                break;
            }
        }
        let mut h = helper_of(fn_, c, &name, ret_first);
        h.uses = g.len();
        let hi = out.helpers.len();
        out.helpers.push(h);
        for x in g {
            out.at.entry((x.fi, x.list)).or_default().insert(
                x.i,
                OutlineUse {
                    helper: hi,
                    args: x.params.clone(),
                },
            );
        }
    }
    out
}

fn helper_of(fn_: &OutlineFn, c: &Cand, name: &str, ret_first: bool) -> Helper {
    let fir = fn_.f.ir.as_ref().unwrap();
    let hir = Ir::new();
    let mut ids: HashMap<u32, u32> = HashMap::new();
    let mut vars: Vec<VarInfo> = Vec::new();
    let mut names: Vec<String> = Vec::new();
    let mut params: Vec<String> = Vec::new();
    let letters: Vec<char> = "abcdefghijklmnopqrstuvwxyz".chars().collect();
    let mut li = 0usize;
    let mut frame_param: HashMap<crate::util::K, u32> = HashMap::new();
    for (k, &p) in c.params.iter().enumerate() {
        let id = vars.len() as u32;
        vars.push(VarInfo {
            id,
            reg: -1,
            param: k as i32 + 1,
            undef: false,
        });
        let nm = if k == 0 && ret_first {
            "ret".to_string()
        } else {
            let x = letters.get(li).map_or(format!("p{k}"), |c| c.to_string());
            li += 1;
            x
        };
        names.push(nm.clone());
        params.push(nm);
        match fir.get(p) {
            Node::Var(v) => {
                ids.insert(v, id);
            }
            Node::Call(..) => {
                ids.insert(c.lead.unwrap(), id);
            }
            Node::Bin(_, _, b) => {
                let Node::Const(v) = fir.get(b) else {
                    unreachable!()
                };
                frame_param.insert(crate::util::K::of(n_s(v)), id);
            }
            _ => {}
        }
    }
    struct H<'a> {
        fir: &'a Ir,
        hir: &'a Ir,
        fp: Option<u32>,
        bases: &'a [N],
        ids: HashMap<u32, u32>,
        vars: Vec<VarInfo>,
        names: Vec<String>,
        li: usize,
        frame_param: HashMap<crate::util::K, u32>,
    }
    impl H<'_> {
        fn local(&mut self, id: u32) -> u32 {
            if let Some(&n) = self.ids.get(&id) {
                return n;
            }
            let n = self.vars.len() as u32;
            self.ids.insert(id, n);
            self.vars.push(VarInfo {
                id: n,
                reg: -1,
                param: -1,
                undef: false,
            });
            let letters = b"abcdefghijklmnopqrstuvwxyz";
            let mut nm;
            loop {
                nm = if self.li < 26 {
                    (letters[self.li] as char).to_string()
                } else {
                    format!("v{}", self.li - 26)
                };
                self.li += 1;
                if !(self.names.contains(&nm) || nm == "ret") {
                    break;
                }
            }
            self.names.push(nm);
            n
        }
        fn ex(&mut self, e: E) -> E {
            let (f, h) = (self.fir, self.hir);
            if let Some(o) = frame_off(f, e, self.fp) {
                let b = base_of(self.bases, o);
                let d = o - b;
                let v = h.var(*self.frame_param.get(&crate::util::K::of(b)).unwrap());
                return if d != 0.0 {
                    let c = h.c(crate::util::big_u(d));
                    h.bin(BinOp::Add, v, c)
                } else {
                    v
                };
            }
            match f.get(e) {
                Node::Var(id) => {
                    let n = self.local(id);
                    h.var(n)
                }
                Node::Bin(op, a, b) => {
                    let (a, b) = (self.ex(a), self.ex(b));
                    h.bin(op, a, b)
                }
                Node::Cmp(op, a, b) => {
                    let (a, b) = (self.ex(a), self.ex(b));
                    h.cmp(op, a, b)
                }
                Node::Land(a, b) => {
                    let (a, b) = (self.ex(a), self.ex(b));
                    h.mk(Node::Land(a, b))
                }
                Node::Lor(a, b) => {
                    let (a, b) = (self.ex(a), self.ex(b));
                    h.mk(Node::Lor(a, b))
                }
                Node::Neg(a) => {
                    let a = self.ex(a);
                    h.mk(Node::Neg(a))
                }
                Node::Not(a) => {
                    let a = self.ex(a);
                    h.mk(Node::Not(a))
                }
                Node::Lnot(a) => {
                    let a = self.ex(a);
                    h.mk(Node::Lnot(a))
                }
                Node::Ext { signed, bits, a } => {
                    let a = self.ex(a);
                    h.ext(signed, bits, a)
                }
                Node::Bswap { bits, a } => {
                    let a = self.ex(a);
                    h.mk(Node::Bswap { bits, a })
                }
                Node::Load { size, addr } => {
                    let a = self.ex(addr);
                    h.load(size, a)
                }
                Node::Sel(c, a, b) => {
                    let (c, a, b) = (self.ex(c), self.ex(a), self.ex(b));
                    h.mk(Node::Sel(c, a, b))
                }
                Node::Fn(n, args) => {
                    let xs: Vec<E> = f.items(args).map(|x| self.ex(x)).collect();
                    let l = h.list(xs);
                    let nn = h.mk_name(f.name(n));
                    h.mk(Node::Fn(nn, l))
                }
                x => h.mk(x),
            }
        }
    }
    let mut hh = H {
        fir,
        hir: &hir,
        fp: fn_.fp,
        bases: &fn_.bases,
        ids,
        vars,
        names,
        li,
        frame_param,
    };
    let mut tree = Tree::default();
    fn nodes(hh: &mut H, src: &Tree, xs: &[SNode], tree: &mut Tree) -> Vec<SNode> {
        let mut out = Vec::new();
        for n in xs {
            out.push(match n {
                SNode::Stmt(si) => {
                    let s = src.stmt(*si);
                    let ns = match s {
                        Stmt::Set { dst, e, pc } => {
                            let e = hh.ex(*e);
                            let d = hh.local(*dst as u32);
                            Stmt::Set {
                                dst: d as i32,
                                e,
                                pc: *pc,
                            }
                        }
                        Stmt::Store { size, addr, v, pc } => {
                            let (a, v) = (hh.ex(*addr), hh.ex(*v));
                            Stmt::Store {
                                size: *size,
                                addr: a,
                                v,
                                pc: *pc,
                            }
                        }
                        Stmt::Stores {
                            size,
                            addr,
                            vals,
                            pc,
                        } => {
                            let a = hh.ex(*addr);
                            let vs: Vec<E> = hh.fir.items(*vals).map(|x| hh.ex(x)).collect();
                            let l = hh.hir.list(vs);
                            Stmt::Stores {
                                size: *size,
                                addr: a,
                                vals: l,
                                pc: *pc,
                            }
                        }
                        Stmt::Copy {
                            dst,
                            src: s2,
                            n,
                            pc,
                            rev,
                        } => {
                            let (d, s2) = (hh.ex(*dst), hh.ex(*s2));
                            Stmt::Copy {
                                dst: d,
                                src: s2,
                                n: *n,
                                pc: *pc,
                                rev: *rev,
                            }
                        }
                        Stmt::Eval { e, pc } => Stmt::Eval {
                            e: hh.ex(*e),
                            pc: *pc,
                        },
                        x => x.clone(),
                    };
                    SNode::Stmt(tree.push(ns))
                }
                SNode::If { c, then, els } => {
                    let c = hh.ex(*c);
                    let t = nodes(hh, src, then, tree);
                    let e = nodes(hh, src, els, tree);
                    SNode::If { c, then: t, els: e }
                }
                SNode::Return(e) => SNode::Return(e.map(|e| hh.ex(e))),
                x => x.clone(),
            });
        }
        out
    }
    let src_nodes = if c.lead.is_some() {
        &c.nodes()[1..]
    } else {
        c.nodes()
    };
    let body = nodes(&mut hh, fn_.tree, src_nodes, &mut tree);
    tree.body = body;
    let H { vars, names, .. } = hh;
    let _ = js_hex;
    let _: Option<CallTarget> = None;
    Helper {
        name: name.to_string(),
        params,
        vars,
        names,
        ir: hir,
        tree,
        value: c.nodes().iter().any(returns_value),
        uses: 0,
    }
}
