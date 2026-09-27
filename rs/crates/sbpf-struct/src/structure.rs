//! `src/structure.ts`: stackifier structuring, controlled node splitting, the dispatcher fallback and
//! the clean-up passes, in the TS order (same iteration orders, same budgets).

use crate::{Form, Label, SNode, Tree};
use sbpf_ir::{BinOp, CallTarget, Node, Stmt, Term, E};
use sbpf_opt::Fx;
use sbpf_program::{Func, VarInfo};

/// computeRpo: reverse post-order from block 0 and each block's index in it (-1: unreachable).
pub fn compute_rpo(f: &Func) -> (Vec<usize>, Vec<i32>) {
    let n = f.blocks.len();
    let mut seen = vec![false; n];
    let mut post = Vec::with_capacity(n);
    let mut stack: Vec<(usize, usize)> = vec![(0, 0)];
    seen[0] = true;
    while let Some(top) = stack.last_mut() {
        let b = &f.blocks[top.0];
        if top.1 < b.succs.len() {
            let s = b.succs[top.1];
            top.1 += 1;
            if !seen[s] {
                seen[s] = true;
                stack.push((s, 0));
            }
        } else {
            post.push(top.0);
            stack.pop();
        }
    }
    post.reverse();
    let mut rpo = vec![-1i32; n];
    for (i, &b) in post.iter().enumerate() {
        rpo[b] = i as i32;
    }
    (post, rpo)
}

pub fn dominators(f: &Func, order: &[usize], rpo: &[i32]) -> Vec<i32> {
    let mut idom = vec![-1i32; f.blocks.len()];
    idom[0] = 0;
    let intersect = |idom: &[i32], mut a: i32, mut b: i32| {
        while a != b {
            while rpo[a as usize] > rpo[b as usize] {
                a = idom[a as usize];
            }
            while rpo[b as usize] > rpo[a as usize] {
                b = idom[b as usize];
            }
        }
        a
    };
    loop {
        let mut changed = false;
        for &b in order {
            if b == 0 {
                continue;
            }
            let mut nd = -1i32;
            for &p in &f.blocks[b].preds {
                if idom[p] < 0 || rpo[p] < 0 {
                    continue;
                }
                nd = if nd < 0 {
                    p as i32
                } else {
                    intersect(&idom, p as i32, nd)
                };
            }
            if nd >= 0 && idom[b] != nd {
                idom[b] = nd;
                changed = true;
            }
        }
        if !changed {
            break;
        }
    }
    idom
}

fn dominates(idom: &[i32], a: usize, mut b: usize) -> bool {
    loop {
        if a == b {
            return true;
        }
        if b == 0 {
            return false;
        }
        b = idom[b] as usize;
    }
}

fn irreducible_edge(f: &Func, rpo: &[i32], idom: &[i32], order: &[usize]) -> bool {
    for &b in order {
        for &p in &f.blocks[b].preds {
            if rpo[p] >= 0 && rpo[p] >= rpo[b] && !dominates(idom, b, p) {
                return true;
            }
        }
    }
    false
}

/// An ordered set of block ids (JS `Set<number>`: insertion order, membership).
#[derive(Clone, Default)]
struct OSet {
    list: Vec<usize>,
    has: Vec<bool>,
}

impl OSet {
    fn new(n: usize) -> Self {
        OSet {
            list: Vec::new(),
            has: vec![false; n],
        }
    }
    fn contains(&self, x: usize) -> bool {
        self.has.get(x).copied().unwrap_or(false)
    }
    fn add(&mut self, x: usize) {
        if x >= self.has.len() {
            self.has.resize(x + 1, false);
        }
        if !self.has[x] {
            self.has[x] = true;
            self.list.push(x);
        }
    }
}

/// Tarjan's SCCs of the subgraph induced by `nodes` (iterative, roots in `nodes` order).
fn sccs(f: &Func, nodes: &OSet) -> Vec<Vec<usize>> {
    let n = f.blocks.len();
    let mut index = vec![-1i64; n];
    let mut low = vec![0i64; n];
    let mut on = vec![false; n];
    let mut stack: Vec<usize> = Vec::new();
    let mut out = Vec::new();
    let mut next = 0i64;
    for &root in &nodes.list {
        if index[root] >= 0 {
            continue;
        }
        let mut work: Vec<(usize, usize)> = vec![(root, 0)];
        index[root] = next;
        low[root] = next;
        next += 1;
        stack.push(root);
        on[root] = true;
        while let Some(top) = work.last_mut() {
            let v = top.0;
            let succ = &f.blocks[v].succs;
            if top.1 < succ.len() {
                let w = succ[top.1];
                top.1 += 1;
                if !nodes.contains(w) {
                    continue;
                }
                if index[w] < 0 {
                    index[w] = next;
                    low[w] = next;
                    next += 1;
                    stack.push(w);
                    on[w] = true;
                    work.push((w, 0));
                } else if on[w] {
                    low[v] = low[v].min(index[w]);
                }
                continue;
            }
            work.pop();
            if let Some(u) = work.last() {
                let u = u.0;
                low[u] = low[u].min(low[v]);
            }
            if low[v] == index[v] {
                let mut c = Vec::new();
                loop {
                    let w = stack.pop().unwrap();
                    on[w] = false;
                    c.push(w);
                    if w == v {
                        break;
                    }
                }
                out.push(c);
            }
        }
    }
    out
}

fn retarget(t: &Term, m: &dyn Fn(i64) -> i64) -> Term {
    match t {
        Term::Jmp { to } => Term::Jmp { to: m(*to) },
        Term::Br { c, t, f } => Term::Br {
            c: *c,
            t: m(*t),
            f: m(*f),
        },
        x => x.clone(),
    }
}

enum Fix {
    No,
    Yes,
    Fail,
}

struct Split<'a> {
    f: &'a mut Func,
    budget: i64,
    live: OSet,
}

impl Split<'_> {
    fn cost(&self, b: usize) -> i64 {
        self.f.blocks[b].stmts.len() as i64 + 1
    }
    fn reach(&self, from: &[usize], within: &OSet, avoid: usize) -> OSet {
        let mut seen = OSet::new(self.f.blocks.len());
        let mut st: Vec<usize> = from.iter().copied().filter(|&x| x != avoid).collect();
        for &x in &st {
            seen.add(x);
        }
        while let Some(x) = st.pop() {
            for &s in &self.f.blocks[x].succs {
                if within.contains(s) && s != avoid && !seen.contains(s) {
                    seen.add(s);
                    st.push(s);
                }
            }
        }
        seen
    }

    fn fix_one(&mut self, nodes: &OSet) -> Fix {
        for c in sccs(self.f, nodes) {
            let mut s_set = OSet::new(self.f.blocks.len());
            for &x in &c {
                s_set.add(x);
            }
            if c.len() == 1 && !self.f.blocks[c[0]].succs.contains(&c[0]) {
                continue;
            }
            let entries: Vec<usize> = c
                .iter()
                .copied()
                .filter(|&x| {
                    x == 0
                        || self.f.blocks[x]
                            .preds
                            .iter()
                            .any(|&p| self.live.contains(p) && !s_set.contains(p))
                })
                .collect();
            if entries.len() > 1 {
                let mut best: Option<(usize, OSet, i64)> = None;
                let has0 = entries.contains(&0);
                for &h in &entries {
                    if has0 && h != 0 {
                        continue;
                    }
                    let others: Vec<usize> = entries.iter().copied().filter(|&x| x != h).collect();
                    let r = self.reach(&others, &s_set, h);
                    let size: i64 = r.list.iter().map(|&x| self.cost(x)).sum();
                    if best.as_ref().is_none_or(|b| size < b.2) {
                        best = Some((h, r, size));
                    }
                }
                let Some((bh, br, bsize)) = best else {
                    return Fix::Fail;
                };
                self.budget -= bsize;
                if self.budget < 0 {
                    return Fix::Fail;
                }
                let base = self.f.blocks.len();
                let mut copy = vec![-1i64; base];
                for (k, &x) in br.list.iter().enumerate() {
                    copy[x] = (base + k) as i64;
                }
                let m = |s: i64| {
                    let c = copy.get(s as usize).copied().unwrap_or(-1);
                    if c >= 0 {
                        c
                    } else {
                        s
                    }
                };
                for (k, &x) in br.list.iter().enumerate() {
                    let ob = &self.f.blocks[x];
                    let mut nb = ob.clone();
                    nb.id = base + k;
                    nb.term = retarget(&ob.term, &m);
                    nb.succs = ob.succs.iter().map(|&s| m(s as i64) as usize).collect();
                    nb.preds = Vec::new();
                    self.f.blocks.push(nb);
                }
                for &e in &entries {
                    if e == bh || copy[e] < 0 {
                        continue;
                    }
                    let ce = copy[e];
                    let mut ps: Vec<usize> = Vec::new();
                    for &p in &self.f.blocks[e].preds {
                        if !ps.contains(&p) {
                            ps.push(p);
                        }
                    }
                    for p in ps {
                        if s_set.contains(p) || !self.live.contains(p) {
                            continue;
                        }
                        let mm = |s: i64| if s == e as i64 { ce } else { s };
                        let pb = &mut self.f.blocks[p];
                        pb.term = retarget(&pb.term, &mm);
                        for s in pb.succs.iter_mut() {
                            *s = mm(*s as i64) as usize;
                        }
                    }
                }
                for b in self.f.blocks.iter_mut() {
                    b.preds.clear();
                }
                for i in 0..self.f.blocks.len() {
                    for k in 0..self.f.blocks[i].succs.len() {
                        let s = self.f.blocks[i].succs[k];
                        self.f.blocks[s].preds.push(i);
                    }
                }
                return Fix::Yes;
            }
            let mut inner = OSet::new(self.f.blocks.len());
            for &x in &c {
                if Some(&x) != entries.first() {
                    inner.add(x);
                }
            }
            match self.fix_one(&inner) {
                Fix::No => {}
                r => return r,
            }
        }
        Fix::No
    }
}

/// makeReducible: controlled node splitting; restores the blocks and returns false past the budget.
fn make_reducible(f: &mut Func) -> bool {
    let saved = f.blocks.clone();
    let total: i64 = f.blocks.iter().map(|b| b.stmts.len() as i64 + 1).sum();
    let mut sp = Split {
        budget: 800.min(40 + total),
        f,
        live: OSet::default(),
    };
    for _ in 0..100 {
        let (order, _) = compute_rpo(sp.f);
        let mut live = OSet::new(sp.f.blocks.len());
        for b in order {
            live.add(b);
        }
        sp.live = live.clone();
        match sp.fix_one(&live) {
            Fix::Fail => break,
            Fix::No => {
                sbpf_opt::prune_unreachable(sp.f);
                return true;
            }
            Fix::Yes => {}
        }
    }
    sp.f.blocks = saved;
    false
}

struct Builder<'a> {
    f: &'a Func,
    rpo: Vec<i32>,
    is_header: Vec<bool>,
    is_merge: Vec<bool>,
    kids: Vec<Vec<usize>>,
    tree: &'a mut Tree,
}

impl Builder<'_> {
    fn code_for(&mut self, x: usize) -> Vec<SNode> {
        let mut ms: Vec<usize> = self.kids[x]
            .iter()
            .copied()
            .filter(|&c| self.is_merge[c])
            .collect();
        ms.sort_by(|&a, &b| self.rpo[b].cmp(&self.rpo[a]));
        let body = self.node_within(x, &ms);
        if self.is_header[x] {
            vec![SNode::Loop {
                label: Some(Label::L(x as u32)),
                body,
                form: Form::For,
                c: None,
            }]
        } else {
            body
        }
    }
    fn node_within(&mut self, x: usize, ys: &[usize]) -> Vec<SNode> {
        let Some((&y, rest)) = ys.split_first() else {
            let f = self.f;
            let b = &f.blocks[x];
            let mut out: Vec<SNode> = Vec::with_capacity(b.stmts.len() + 1);
            for s in &b.stmts {
                out.push(SNode::Stmt(self.tree.push(s.clone())));
            }
            match b.term.clone() {
                Term::Ret { e } => out.push(SNode::Return(e)),
                Term::Trap { msg } => out.push(SNode::Trap(msg)),
                Term::Tail => out.push(SNode::Trap("fallthrough".into())),
                Term::Jmp { to } => {
                    let v = self.do_branch(x, to as usize);
                    out.extend(v);
                }
                Term::Br { c, t, f } => {
                    if t == f {
                        let v = self.do_branch(x, t as usize);
                        out.extend(v);
                    } else {
                        let then = self.do_branch(x, t as usize);
                        let els = self.do_branch(x, f as usize);
                        out.push(SNode::If { c, then, els });
                    }
                }
            }
            return out;
        };
        let body = self.node_within(x, rest);
        let mut out = vec![SNode::Block {
            label: Label::B(y as u32),
            body,
        }];
        out.extend(self.code_for(y));
        out
    }
    fn do_branch(&mut self, x: usize, t: usize) -> Vec<SNode> {
        if self.rpo[t] <= self.rpo[x] {
            return vec![SNode::Continue(Some(Label::L(t as u32)))];
        }
        if self.is_merge[t] {
            return vec![SNode::Break(Some(Label::B(t as u32)))];
        }
        self.code_for(t)
    }
}

/// structure(f): the structured body (stmts copied into `tree`); may split nodes (f's blocks change)
/// or fall back to the dispatcher (adds the state variable to f's vars).
pub fn structure(f: &mut Func, tree: &mut Tree) {
    let (mut order, mut rpo) = compute_rpo(f);
    let mut idom = dominators(f, &order, &rpo);
    if irreducible_edge(f, &rpo, &idom, &order) {
        if !make_reducible(f) {
            dispatcher(f, &order, tree);
            return;
        }
        (order, rpo) = compute_rpo(f);
        idom = dominators(f, &order, &rpo);
    }
    let n = f.blocks.len();
    let mut is_header = vec![false; n];
    let mut is_merge = vec![false; n];
    for &b in &order {
        let mut fwd = 0;
        for &p in &f.blocks[b].preds {
            if rpo[p] < 0 {
                continue;
            }
            if rpo[p] >= rpo[b] {
                is_header[b] = true;
            } else {
                fwd += 1;
            }
        }
        if fwd >= 2 {
            is_merge[b] = true;
        }
    }
    let mut kids: Vec<Vec<usize>> = vec![Vec::new(); n];
    for &b in &order {
        if b != 0 {
            kids[idom[b] as usize].push(b);
        }
    }
    let mut bd = Builder {
        f,
        rpo,
        is_header,
        is_merge,
        kids,
        tree,
    };
    let body = bd.code_for(0);
    tree.body = body;
    tree.irreducible = false;
}

fn dispatcher(f: &mut Func, order: &[usize], tree: &mut Tree) {
    let sv = f.vars.len() as u32;
    f.vars.push(VarInfo {
        id: sv,
        reg: -1,
        param: -1,
        undef: false,
    });
    let jump = |t: i64| {
        vec![
            SNode::SetState { v: sv, val: t },
            SNode::Continue(Some(Label::Disp)),
        ]
    };
    let mut cases = Vec::with_capacity(order.len());
    for &id in order {
        let b = &f.blocks[id];
        let mut body: Vec<SNode> = Vec::with_capacity(b.stmts.len() + 2);
        for s in &b.stmts {
            body.push(SNode::Stmt(tree.push(s.clone())));
        }
        match b.term.clone() {
            Term::Ret { e } => body.push(SNode::Return(e)),
            Term::Trap { msg } => body.push(SNode::Trap(msg)),
            Term::Tail => body.push(SNode::Trap("fallthrough".into())),
            Term::Jmp { to } => body.extend(jump(to)),
            Term::Br { c, t, f } => body.push(SNode::If {
                c,
                then: jump(t),
                els: jump(f),
            }),
        }
        cases.push((vec![id as i64], body));
    }
    tree.body = vec![
        SNode::SetState { v: sv, val: 0 },
        SNode::Loop {
            label: Some(Label::Disp),
            body: vec![SNode::Switch { v: sv, cases }],
            form: Form::For,
            c: None,
        },
    ];
    tree.irreducible = true;
}

// ======================= clean-up =======================

/// Continuation: the jumps equivalent to falling off the end at a position.
#[derive(Clone, Default)]
struct Cont {
    breaks: Vec<Label>,
    conts: Vec<Label>,
    ret: bool,
}

impl Cont {
    fn with_break(&self, l: Label) -> Cont {
        let mut c = self.clone();
        if !c.breaks.contains(&l) {
            c.breaks.push(l);
        }
        c
    }
    fn loop_body(l: Option<Label>) -> Cont {
        Cont {
            breaks: Vec::new(),
            conts: l.into_iter().collect(),
            ret: false,
        }
    }
}

fn ends_in_jump(ns: &[SNode], stmts: &[Stmt]) -> bool {
    let Some(l) = ns.last() else { return false };
    match l {
        SNode::Break(_) | SNode::Continue(_) | SNode::Return(_) | SNode::Trap(_) => true,
        SNode::Stmt(s) => matches!(stmts[*s as usize], Stmt::Trap { .. }),
        SNode::If { then, els, .. } => ends_in_jump(then, stmts) && ends_in_jump(els, stmts),
        SNode::Loop {
            form, body, label, ..
        } => *form == Form::For && !has_break_to(body, *label, true),
        _ => false,
    }
}

fn has_break_to(ns: &[SNode], label: Option<Label>, innermost: bool) -> bool {
    for n in ns {
        match n {
            SNode::Break(l) => {
                if *l == label && label.is_some() {
                    return true;
                }
                if l.is_none() && innermost {
                    return true;
                }
            }
            SNode::If { then, els, .. } => {
                if has_break_to(then, label, innermost) || has_break_to(els, label, innermost) {
                    return true;
                }
            }
            SNode::Block { body, .. } => {
                if has_break_to(body, label, innermost) {
                    return true;
                }
            }
            SNode::Loop { body, .. } => {
                if has_break_to(body, label, false) {
                    return true;
                }
            }
            SNode::Switch { cases, .. } => {
                if cases.iter().any(|c| has_break_to(&c.1, label, false)) {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

type Refs = std::collections::HashMap<Label, u32>;

fn count_refs(ns: &[SNode], m: &mut Refs) {
    for n in ns {
        match n {
            SNode::Break(Some(l)) | SNode::Continue(Some(l)) => *m.entry(*l).or_insert(0) += 1,
            SNode::If { then, els, .. } => {
                count_refs(then, m);
                count_refs(els, m);
            }
            SNode::Block { body, .. } | SNode::Loop { body, .. } => count_refs(body, m),
            SNode::Switch { cases, .. } => cases.iter().for_each(|c| count_refs(&c.1, m)),
            _ => {}
        }
    }
}

fn refs_of(ns: &[SNode]) -> Refs {
    let mut m = Refs::new();
    count_refs(ns, &mut m);
    m
}

fn is_jump_in(n: &SNode, c: &Cont) -> bool {
    match n {
        SNode::Break(Some(l)) => c.breaks.contains(l),
        SNode::Continue(Some(l)) => c.conts.contains(l),
        SNode::Return(None) => c.ret,
        _ => false,
    }
}

/// Remove tail jumps equal to the natural continuation; rewrite breaks out of loops.
fn tail_pass(ns: &[SNode], cont: &Cont, ls: &mut Vec<(Option<Label>, Cont)>) -> Vec<SNode> {
    let none = Cont::default();
    let mut out = Vec::with_capacity(ns.len());
    for (i, n) in ns.iter().enumerate() {
        let last = i == ns.len() - 1;
        let c = if last { cont } else { &none };
        if last && is_jump_in(n, c) {
            continue;
        }
        let n = match n {
            SNode::If { c: cc, then, els } => SNode::If {
                c: *cc,
                then: tail_pass(then, c, ls),
                els: tail_pass(els, c, ls),
            },
            SNode::Block { label, body } => {
                let bc = c.with_break(*label);
                SNode::Block {
                    label: *label,
                    body: tail_pass(body, &bc, ls),
                }
            }
            SNode::Loop {
                label,
                body,
                form,
                c: lc,
            } => {
                ls.push((*label, c.clone()));
                let body = tail_pass(body, &Cont::loop_body(*label), ls);
                ls.pop();
                SNode::Loop {
                    label: *label,
                    body,
                    form: *form,
                    c: *lc,
                }
            }
            SNode::Switch { v, cases } => SNode::Switch {
                v: *v,
                cases: cases
                    .iter()
                    .map(|(vals, b)| (vals.clone(), tail_pass(b, &none, ls)))
                    .collect(),
            },
            SNode::Break(Some(l)) => match ls.last() {
                Some((tl, exit)) if !l.is_l() && exit.breaks.contains(l) => SNode::Break(*tl),
                _ => n.clone(),
            },
            _ => n.clone(),
        };
        out.push(n);
    }
    out
}

/// Splice unreferenced blocks (loop labels are kept here).
fn label_pass(ns: Vec<SNode>, refs: &Refs) -> Vec<SNode> {
    let mut out = Vec::with_capacity(ns.len());
    for n in ns {
        match n {
            SNode::Block { label, body } => {
                let body = label_pass(body, refs);
                if refs.get(&label).copied().unwrap_or(0) == 0 {
                    out.extend(body);
                } else {
                    out.push(SNode::Block { label, body });
                }
            }
            SNode::Loop {
                label,
                body,
                form,
                c,
            } => out.push(SNode::Loop {
                label,
                body: label_pass(body, refs),
                form,
                c,
            }),
            SNode::If { c, then, els } => out.push(SNode::If {
                c,
                then: label_pass(then, refs),
                els: label_pass(els, refs),
            }),
            SNode::Switch { v, cases } => out.push(SNode::Switch {
                v,
                cases: cases
                    .into_iter()
                    .map(|(vals, b)| (vals, label_pass(b, refs)))
                    .collect(),
            }),
            n => out.push(n),
        }
    }
    out
}

struct Cx<'a, 'i> {
    fx: &'a mut Fx<'i>,
    stmts: &'a mut Vec<Stmt>,
}

impl Cx<'_, '_> {
    fn if_pass(&mut self, ns: &[SNode], cont: &Cont) -> Vec<SNode> {
        let none = Cont::default();
        let mut out = Vec::with_capacity(ns.len());
        for i in 0..ns.len() {
            let last = i == ns.len() - 1;
            let c = if last { cont } else { &none };
            let n = match &ns[i] {
                SNode::Block { label, body } => {
                    let bc = c.with_break(*label);
                    SNode::Block {
                        label: *label,
                        body: self.if_pass(body, &bc),
                    }
                }
                SNode::Loop {
                    label,
                    body,
                    form,
                    c: lc,
                } => SNode::Loop {
                    label: *label,
                    body: self.if_pass(body, &Cont::loop_body(*label)),
                    form: *form,
                    c: *lc,
                },
                SNode::Switch { v, cases } => SNode::Switch {
                    v: *v,
                    cases: cases
                        .iter()
                        .map(|(vals, b)| (vals.clone(), self.if_pass(b, &none)))
                        .collect(),
                },
                SNode::If { c: c0, then, els } => {
                    let mut th = self.if_pass(then, c);
                    let mut el = self.if_pass(els, c);
                    let mut cond = *c0;
                    if th.is_empty() && !el.is_empty() {
                        th = std::mem::take(&mut el);
                        cond = self.fx.negate(cond);
                    }
                    let to_block =
                        th.len() == 1 && matches!(th[0], SNode::Break(Some(l)) if l.is_b());
                    if el.is_empty()
                        && th.len() == 1
                        && i + 1 < ns.len()
                        && is_jump_in(&th[0], cont)
                        && (!ends_in_jump(ns, self.stmts) || to_block)
                    {
                        let nc = self.fx.negate(cond);
                        let then = self.if_pass(&ns[i + 1..], cont);
                        out.push(SNode::If {
                            c: nc,
                            then,
                            els: Vec::new(),
                        });
                        return out;
                    }
                    if el.is_empty()
                        && th.len() > 1
                        && matches!(th.last(), Some(SNode::Break(Some(l))) if l.is_b())
                        && is_jump_in(th.last().unwrap(), cont)
                        && !ends_in_jump(&th[..th.len() - 1], self.stmts)
                    {
                        th.pop();
                        let els = self.if_pass(&ns[i + 1..], cont);
                        out.push(SNode::If {
                            c: cond,
                            then: th,
                            els,
                        });
                        return out;
                    }
                    if !el.is_empty() && ends_in_jump(&th, self.stmts) {
                        out.push(SNode::If {
                            c: cond,
                            then: th,
                            els: Vec::new(),
                        });
                        out.extend(el);
                        continue;
                    }
                    if !el.is_empty()
                        && ends_in_jump(&el, self.stmts)
                        && !ends_in_jump(&th, self.stmts)
                    {
                        let nc = self.fx.negate(cond);
                        out.push(SNode::If {
                            c: nc,
                            then: el,
                            els: Vec::new(),
                        });
                        out.extend(th);
                        continue;
                    }
                    if th.is_empty() && el.is_empty() {
                        self.stmts.push(Stmt::Eval { e: cond, pc: -1 });
                        out.push(SNode::Stmt((self.stmts.len() - 1) as u32));
                        continue;
                    }
                    // merge `if (a) { if (b) { X } }`
                    if el.is_empty() && th.len() == 1 {
                        if let SNode::If {
                            els: ie,
                            c: ic,
                            then: _,
                        } = &th[0]
                        {
                            if ie.is_empty() {
                                let ic = *ic;
                                let Some(SNode::If { then: it, .. }) = th.pop() else {
                                    unreachable!()
                                };
                                let land = self.fx.ir.mk(Node::Land(cond, ic));
                                out.push(SNode::If {
                                    c: land,
                                    then: it,
                                    els: Vec::new(),
                                });
                                continue;
                            }
                        }
                    }
                    SNode::If {
                        c: cond,
                        then: th,
                        els: el,
                    }
                }
                n => n.clone(),
            };
            out.push(n);
        }
        out
    }

    fn same_arms_pass(&mut self, ns: Vec<SNode>) -> Vec<SNode> {
        let mut out = Vec::with_capacity(ns.len());
        for n in ns {
            match n {
                SNode::If { c, then, els } => {
                    let t = self.same_arms_pass(then);
                    let e = self.same_arms_pass(els);
                    if !t.is_empty() && inert(self.fx, c) && self.same_list(&t, &e, false) {
                        out.extend(t);
                    } else {
                        out.push(SNode::If { c, then: t, els: e });
                    }
                }
                SNode::Block { label, body } => out.push(SNode::Block {
                    label,
                    body: self.same_arms_pass(body),
                }),
                SNode::Loop {
                    label,
                    body,
                    form,
                    c,
                } => out.push(SNode::Loop {
                    label,
                    body: self.same_arms_pass(body),
                    form,
                    c,
                }),
                SNode::Switch { v, cases } => out.push(SNode::Switch {
                    v,
                    cases: cases
                        .into_iter()
                        .map(|(vals, b)| (vals, self.same_arms_pass(b)))
                        .collect(),
                }),
                n => out.push(n),
            }
        }
        out
    }

    /// sameTree (with_pc) / samePcFree (statement pcs ignored) on node lists.
    fn same_list(&self, a: &[SNode], b: &[SNode], with_pc: bool) -> bool {
        a.len() == b.len()
            && a.iter()
                .zip(b.iter())
                .all(|(x, y)| self.same_node(x, y, with_pc))
    }
    fn same_node(&self, a: &SNode, b: &SNode, with_pc: bool) -> bool {
        let fx = &*self.fx;
        match (a, b) {
            (SNode::Stmt(x), SNode::Stmt(y)) => {
                x == y
                    || stmt_same(
                        fx,
                        &self.stmts[*x as usize],
                        &self.stmts[*y as usize],
                        with_pc,
                    )
            }
            (
                SNode::If {
                    c: c1,
                    then: t1,
                    els: e1,
                },
                SNode::If {
                    c: c2,
                    then: t2,
                    els: e2,
                },
            ) => {
                fx.json_eq(*c1, *c2)
                    && self.same_list(t1, t2, with_pc)
                    && self.same_list(e1, e2, with_pc)
            }
            (
                SNode::Block {
                    label: l1,
                    body: b1,
                },
                SNode::Block {
                    label: l2,
                    body: b2,
                },
            ) => l1 == l2 && self.same_list(b1, b2, with_pc),
            (
                SNode::Loop {
                    label: l1,
                    body: b1,
                    form: f1,
                    c: c1,
                },
                SNode::Loop {
                    label: l2,
                    body: b2,
                    form: f2,
                    c: c2,
                },
            ) => l1 == l2 && f1 == f2 && opt_eq(fx, *c1, *c2) && self.same_list(b1, b2, with_pc),
            (SNode::Break(x), SNode::Break(y)) | (SNode::Continue(x), SNode::Continue(y)) => x == y,
            (SNode::Return(x), SNode::Return(y)) => opt_eq(fx, *x, *y),
            (SNode::Trap(x), SNode::Trap(y)) => x == y,
            (SNode::Switch { v: v1, cases: c1 }, SNode::Switch { v: v2, cases: c2 }) => {
                v1 == v2
                    && c1.len() == c2.len()
                    && c1
                        .iter()
                        .zip(c2.iter())
                        .all(|(x, y)| x.0 == y.0 && self.same_list(&x.1, &y.1, with_pc))
            }
            (SNode::SetState { v: v1, val: x1 }, SNode::SetState { v: v2, val: x2 }) => {
                v1 == v2 && x1 == x2
            }
            _ => false,
        }
    }

    fn clone_nodes(&mut self, ns: &[SNode]) -> Vec<SNode> {
        ns.iter()
            .map(|n| match n {
                SNode::Stmt(s) => {
                    let st = self.stmts[*s as usize].clone();
                    self.stmts.push(st);
                    SNode::Stmt((self.stmts.len() - 1) as u32)
                }
                SNode::If { c, then, els } => SNode::If {
                    c: *c,
                    then: self.clone_nodes(then),
                    els: self.clone_nodes(els),
                },
                SNode::Block { label, body } => SNode::Block {
                    label: *label,
                    body: self.clone_nodes(body),
                },
                SNode::Loop {
                    label,
                    body,
                    form,
                    c,
                } => SNode::Loop {
                    label: *label,
                    body: self.clone_nodes(body),
                    form: *form,
                    c: *c,
                },
                SNode::Switch { v, cases } => SNode::Switch {
                    v: *v,
                    cases: cases
                        .iter()
                        .map(|(vals, b)| (vals.clone(), self.clone_nodes(b)))
                        .collect(),
                },
                n => n.clone(),
            })
            .collect()
    }

    fn rep(&mut self, xs: Vec<SNode>, label: Label, rest: &[SNode]) -> Vec<SNode> {
        let mut out = Vec::with_capacity(xs.len());
        for x in xs {
            match x {
                SNode::Break(Some(l)) if l == label => {
                    let c = self.clone_nodes(rest);
                    out.extend(c);
                }
                SNode::If { c, then, els } => {
                    let then = self.rep(then, label, rest);
                    let els = self.rep(els, label, rest);
                    out.push(SNode::If { c, then, els });
                }
                SNode::Block { label: l, body } => {
                    let body = self.rep(body, label, rest);
                    out.push(SNode::Block { label: l, body });
                }
                SNode::Loop {
                    label: l,
                    body,
                    form,
                    c,
                } => {
                    let body = self.rep(body, label, rest);
                    out.push(SNode::Loop {
                        label: l,
                        body,
                        form,
                        c,
                    });
                }
                SNode::Switch { v, cases } => {
                    let cases = cases
                        .into_iter()
                        .map(|(vals, b)| (vals, self.rep(b, label, rest)))
                        .collect();
                    out.push(SNode::Switch { v, cases });
                }
                x => out.push(x),
            }
        }
        out
    }

    /// `B: { … break B … } rest` with a short rest ending in a jump: every `break B` becomes a copy of rest.
    fn dup_pass(&mut self, ns: &[SNode]) -> Vec<SNode> {
        let mut out = Vec::with_capacity(ns.len());
        for i in 0..ns.len() {
            let n = match &ns[i] {
                SNode::If { c, then, els } => SNode::If {
                    c: *c,
                    then: self.dup_pass(then),
                    els: self.dup_pass(els),
                },
                SNode::Loop {
                    label,
                    body,
                    form,
                    c,
                } => SNode::Loop {
                    label: *label,
                    body: self.dup_pass(body),
                    form: *form,
                    c: *c,
                },
                SNode::Switch { v, cases } => SNode::Switch {
                    v: *v,
                    cases: cases
                        .iter()
                        .map(|(vals, b)| (vals.clone(), self.dup_pass(b)))
                        .collect(),
                },
                SNode::Block { label, body } => {
                    let mut body = self.dup_pass(body);
                    let rest_len = ns.len() - i - 1;
                    let rest = if rest_len > 0 && rest_len <= 4 && ends_in_jump(ns, self.stmts) {
                        Some(&ns[i + 1..])
                    } else {
                        None
                    };
                    let sz = rest.map_or(usize::MAX, node_size);
                    let mut k = 0usize;
                    if sz <= 4 {
                        k = refs_of(&body).get(label).copied().unwrap_or(0) as usize;
                    }
                    if let Some(rest) = rest {
                        if sz <= 4
                            && k * sz <= 8
                            && !rest.iter().any(|x| {
                                matches!(
                                    x,
                                    SNode::Block { .. } | SNode::Loop { .. } | SNode::Switch { .. }
                                )
                            })
                        {
                            body = self.rep(body, *label, rest);
                            let ends = ends_in_jump(&body, self.stmts);
                            out.extend(body);
                            if ends {
                                return out;
                            }
                            continue;
                        }
                    }
                    SNode::Block {
                        label: *label,
                        body,
                    }
                }
                n => n.clone(),
            };
            out.push(n);
        }
        out
    }
}

fn opt_eq(fx: &Fx, a: Option<E>, b: Option<E>) -> bool {
    match (a, b) {
        (None, None) => true,
        (Some(x), Some(y)) => fx.json_eq(x, y),
        _ => false,
    }
}

fn target_eq(fx: &Fx, a: &CallTarget, b: &CallTarget) -> bool {
    match (a, b) {
        (CallTarget::Ind { e: x }, CallTarget::Ind { e: y }) => fx.json_eq(*x, *y),
        (x, y) => x == y,
    }
}

/// Deep equality of two statements (as plain data), `pc` compared only when `with_pc`.
pub fn stmt_same(fx: &Fx, a: &Stmt, b: &Stmt, with_pc: bool) -> bool {
    let pc = |x: i64, y: i64| !with_pc || x == y;
    match (a, b) {
        (
            Stmt::Set {
                dst: d1,
                e: e1,
                pc: p1,
            },
            Stmt::Set {
                dst: d2,
                e: e2,
                pc: p2,
            },
        ) => d1 == d2 && fx.json_eq(*e1, *e2) && pc(*p1, *p2),
        (
            Stmt::Store {
                size: s1,
                addr: a1,
                v: v1,
                pc: p1,
            },
            Stmt::Store {
                size: s2,
                addr: a2,
                v: v2,
                pc: p2,
            },
        ) => s1 == s2 && fx.json_eq(*a1, *a2) && fx.json_eq(*v1, *v2) && pc(*p1, *p2),
        (
            Stmt::Call {
                dst: d1,
                t: t1,
                args: a1,
                pc: p1,
                extra: x1,
            },
            Stmt::Call {
                dst: d2,
                t: t2,
                args: a2,
                pc: p2,
                extra: x2,
            },
        ) => {
            d1 == d2
                && target_eq(fx, t1, t2)
                && fx.list_json_eq(*a1, *a2)
                && pc(*p1, *p2)
                && match (x1, x2) {
                    (None, None) => true,
                    (Some(x), Some(y)) => fx.list_json_eq(*x, *y),
                    _ => false,
                }
        }
        (Stmt::Eval { e: e1, pc: p1 }, Stmt::Eval { e: e2, pc: p2 }) => {
            fx.json_eq(*e1, *e2) && pc(*p1, *p2)
        }
        (
            Stmt::Stores {
                size: s1,
                addr: a1,
                vals: v1,
                pc: p1,
            },
            Stmt::Stores {
                size: s2,
                addr: a2,
                vals: v2,
                pc: p2,
            },
        ) => s1 == s2 && fx.json_eq(*a1, *a2) && fx.list_json_eq(*v1, *v2) && pc(*p1, *p2),
        (
            Stmt::Copy {
                dst: d1,
                src: s1,
                n: n1,
                pc: p1,
                rev: r1,
            },
            Stmt::Copy {
                dst: d2,
                src: s2,
                n: n2,
                pc: p2,
                rev: r2,
            },
        ) => fx.json_eq(*d1, *d2) && fx.json_eq(*s1, *s2) && n1 == n2 && pc(*p1, *p2) && r1 == r2,
        (Stmt::Trap { msg: m1, pc: p1 }, Stmt::Trap { msg: m2, pc: p2 }) => {
            m1 == m2 && pc(*p1, *p2)
        }
        _ => false,
    }
}

/// An expression that cannot trap, read memory or call.
fn inert(fx: &Fx, e: E) -> bool {
    match fx.ir.get(e) {
        Node::Const(_) | Node::Var(_) | Node::Reg(_) | Node::Undef => true,
        Node::Bin(op, a, b) => {
            !matches!(
                op,
                BinOp::Udiv
                    | BinOp::Urem
                    | BinOp::Sdiv
                    | BinOp::Srem
                    | BinOp::Sdiv32
                    | BinOp::Srem32
            ) && inert(fx, a)
                && inert(fx, b)
        }
        Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => inert(fx, a) && inert(fx, b),
        Node::Neg(a)
        | Node::Not(a)
        | Node::Ext { a, .. }
        | Node::Bswap { a, .. }
        | Node::Lnot(a) => inert(fx, a),
        Node::Sel(c, a, b) => inert(fx, c) && inert(fx, a) && inert(fx, b),
        _ => false,
    }
}

fn node_size(ns: &[SNode]) -> usize {
    ns.iter()
        .map(|n| match n {
            SNode::If { then, els, .. } => 1 + node_size(then) + node_size(els),
            SNode::Block { body, .. } | SNode::Loop { body, .. } => 1 + node_size(body),
            SNode::Switch { cases, .. } => 1 + cases.iter().map(|c| node_size(&c.1)).sum::<usize>(),
            _ => 1,
        })
        .sum()
}

/// for(;;) { if (c) break; body } -> while (!c) body; trailing exit test -> do-while.
fn loop_pass(fx: &mut Fx, ns: Vec<SNode>) -> Vec<SNode> {
    ns.into_iter()
        .map(|n| match n {
            SNode::If { c, then, els } => SNode::If {
                c,
                then: loop_pass(fx, then),
                els: loop_pass(fx, els),
            },
            SNode::Block { label, body } => SNode::Block {
                label,
                body: loop_pass(fx, body),
            },
            SNode::Switch { v, cases } => SNode::Switch {
                v,
                cases: cases
                    .into_iter()
                    .map(|(vals, b)| (vals, loop_pass(fx, b)))
                    .collect(),
            },
            SNode::Loop {
                label,
                body,
                form,
                c,
            } => {
                let mut body = loop_pass(fx, body);
                if form != Form::For {
                    return SNode::Loop {
                        label,
                        body,
                        form,
                        c,
                    };
                }
                let is_exit =
                    |x: &SNode| matches!(x, SNode::Break(l) if l.is_none() || *l == label);
                let first = match body.first() {
                    Some(SNode::If { c, then, els })
                        if els.is_empty() && then.len() == 1 && is_exit(&then[0]) =>
                    {
                        Some(*c)
                    }
                    _ => None,
                };
                if let Some(fc) = first {
                    let nc = fx.negate(fc);
                    body.remove(0);
                    return SNode::Loop {
                        label,
                        body,
                        form: Form::While,
                        c: Some(nc),
                    };
                }
                // 1: trailing `if (c) break` -> do-while (!c); 2: `if (c) continue; else break` -> do-while (c)
                let last = match body.last() {
                    Some(SNode::If { c, then, els }) => {
                        if els.is_empty()
                            && then.len() == 1
                            && is_exit(&then[0])
                            && !has_continue_to(&body, label)
                        {
                            Some((1, *c))
                        } else if then.len() == 1
                            && matches!(then[0], SNode::Continue(l) if l == label)
                            && els.len() == 1
                            && is_exit(&els[0])
                            && !has_continue_to(&body[..body.len() - 1], label)
                        {
                            Some((2, *c))
                        } else {
                            None
                        }
                    }
                    _ => None,
                };
                if let Some((kind, lc)) = last {
                    let nc = if kind == 1 { fx.negate(lc) } else { lc };
                    body.pop();
                    return SNode::Loop {
                        label,
                        body,
                        form: Form::Do,
                        c: Some(nc),
                    };
                }
                SNode::Loop {
                    label,
                    body,
                    form,
                    c,
                }
            }
            n => n,
        })
        .collect()
}

fn has_continue_to(ns: &[SNode], label: Option<Label>) -> bool {
    for n in ns {
        match n {
            SNode::Continue(l) => {
                if *l == label {
                    return true;
                }
            }
            SNode::If { then, els, .. } => {
                if has_continue_to(then, label) || has_continue_to(els, label) {
                    return true;
                }
            }
            SNode::Block { body, .. } | SNode::Loop { body, .. } => {
                if has_continue_to(body, label) {
                    return true;
                }
            }
            SNode::Switch { cases, .. } => {
                if cases.iter().any(|c| has_continue_to(&c.1, label)) {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// `break L` / `continue L` of the innermost loop L become unlabeled.
fn unlabel(ns: Vec<SNode>, inner: Option<Label>, in_switch: bool) -> Vec<SNode> {
    ns.into_iter()
        .map(|n| match n {
            SNode::Break(Some(l)) if Some(l) == inner && !in_switch => SNode::Break(None),
            SNode::Continue(Some(l)) if Some(l) == inner => SNode::Continue(None),
            SNode::If { c, then, els } => SNode::If {
                c,
                then: unlabel(then, inner, in_switch),
                els: unlabel(els, inner, in_switch),
            },
            SNode::Block { label, body } => SNode::Block {
                label,
                body: unlabel(body, inner, in_switch),
            },
            SNode::Loop {
                label,
                body,
                form,
                c,
            } => SNode::Loop {
                label,
                body: unlabel(body, label, false),
                form,
                c,
            },
            SNode::Switch { v, cases } => SNode::Switch {
                v,
                cases: cases
                    .into_iter()
                    .map(|(vals, b)| (vals, unlabel(b, inner, true)))
                    .collect(),
            },
            n => n,
        })
        .collect()
}

fn drop_loop_labels(ns: Vec<SNode>, refs: &Refs) -> Vec<SNode> {
    ns.into_iter()
        .map(|n| match n {
            SNode::If { c, then, els } => SNode::If {
                c,
                then: drop_loop_labels(then, refs),
                els: drop_loop_labels(els, refs),
            },
            SNode::Block { label, body } => SNode::Block {
                label,
                body: drop_loop_labels(body, refs),
            },
            SNode::Loop {
                label,
                body,
                form,
                c,
            } => SNode::Loop {
                label: label.filter(|l| refs.get(l).copied().unwrap_or(0) != 0),
                body: drop_loop_labels(body, refs),
                form,
                c,
            },
            SNode::Switch { v, cases } => SNode::Switch {
                v,
                cases: cases
                    .into_iter()
                    .map(|(vals, b)| (vals, drop_loop_labels(b, refs)))
                    .collect(),
            },
            n => n,
        })
        .collect()
}

/// cleanup(s, returnsValue): the clean-up rounds (at most 12, until a round leaves the tree
/// structurally unchanged), then unlabeling.
pub fn cleanup(fx: &mut Fx, tree: &mut Tree, returns_value: bool) {
    let top = Cont {
        breaks: Vec::new(),
        conts: Vec::new(),
        ret: !returns_value,
    };
    let mut body = std::mem::take(&mut tree.body);
    let mut cx = Cx {
        fx,
        stmts: &mut tree.stmts,
    };
    for _ in 0..12 {
        let before = body.clone();
        body = tail_pass(&body, &top, &mut Vec::new());
        let refs = refs_of(&body);
        body = label_pass(body, &refs);
        body = cx.if_pass(&body, &top);
        body = cx.same_arms_pass(body);
        body = cx.dup_pass(&body);
        body = tail_pass(&body, &top, &mut Vec::new());
        let refs = refs_of(&body);
        body = label_pass(body, &refs);
        body = loop_pass(cx.fx, body);
        if cx.same_list(&body, &before, true) {
            break;
        }
    }
    body = unlabel(body, None, false);
    let refs = refs_of(&body);
    body = drop_loop_labels(label_pass(body, &refs), &refs);
    tree.body = body;
}
