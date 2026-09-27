//! `src/anchor.ts`: Anchor account recovery from `Error::with_account_name("<field>")` calls: account
//! names, the checks on them, the variables holding them; the Accounts struct layout of try_accounts.

use crate::util::{fo_any, stmt_exprs, term_br, var_of, K, N};
use indexmap::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, E, L};
use sbpf_program::Func;
use sbpf_struct::{SNode, Tree};
use std::collections::{HashMap, HashSet};

pub struct AnchorFn {
    pub accounts: Vec<String>,
    pub checks: IndexMap<String, Vec<String>>,
    pub var_names: IndexMap<u32, String>,
    pub account_vars: IndexSet<u32>,
}

/// The string accessor anchor code uses (`sem.strAt(ptr, len)`).
pub type StrAt<'a> = &'a dyn Fn(u64, u64) -> Option<String>;

fn is_ident(s: &str) -> bool {
    let b = s.as_bytes();
    !b.is_empty()
        && (b[0].is_ascii_alphabetic() || b[0] == b'_')
        && b.iter().all(|c| c.is_ascii_alphanumeric() || *c == b'_')
}

/// callsIn: the direct calls of a statement (its own, then those in its expressions).
pub fn calls_in(ir: &Ir, s: &Stmt) -> Vec<(i64, L)> {
    let mut out = Vec::new();
    if let Stmt::Call {
        t: CallTarget::Fn { pc },
        args,
        ..
    } = s
    {
        out.push((*pc, *args));
    }
    for e in stmt_exprs(ir, s) {
        ir.walk(e, &mut |_, n| {
            if let Node::Call(t, args) = n {
                if let CallTarget::Fn { pc } = ir.target(t) {
                    out.push((pc, args));
                }
            }
        });
    }
    out
}

/// nameArg: the identifier string of a call's last (pointer, length) argument pair.
pub fn name_arg(ir: &Ir, args: L, str_at: StrAt) -> Option<String> {
    if args.len < 2 {
        return None;
    }
    let p = ir.get(ir.at(args, args.len - 2));
    let n = ir.get(ir.at(args, args.len - 1));
    let (Node::Const(p), Node::Const(n)) = (p, n) else {
        return None;
    };
    if n > 64 {
        return None;
    }
    let s = str_at(p, n)?;
    if is_ident(&s) {
        Some(s)
    } else {
        None
    }
}

/// findNameFn: the callee most often called with an identifier string as its last argument pair (3+).
pub fn find_name_fn(funcs: &[&Func], str_at: StrAt) -> Option<i64> {
    let mut count: IndexMap<i64, u32> = IndexMap::new();
    for f in funcs {
        let ir = f.ir.as_ref().unwrap();
        for b in &f.blocks {
            for s in &b.stmts {
                for (pc, args) in calls_in(ir, s) {
                    if name_arg(ir, args, str_at).is_some() {
                        *count.entry(pc).or_default() += 1;
                    }
                }
            }
        }
    }
    let (mut best, mut n) = (None, 0);
    for (&pc, &c) in &count {
        if c > n {
            best = Some(pc);
            n = c;
        }
    }
    if n >= 3 {
        best
    } else {
        None
    }
}

pub fn children(n: &SNode) -> Vec<&Vec<SNode>> {
    crate::util::child_lists(n)
}

#[derive(Clone, Default)]
struct Info {
    names: IndexSet<String>,
    codes: Vec<String>,
}

fn merge(r: &mut Info, i: &Info) {
    for x in &i.names {
        r.names.insert(x.clone());
    }
    for x in &i.codes {
        if !r.codes.contains(x) {
            r.codes.push(x.clone());
        }
    }
}

struct Suffixes {
    count: Vec<i8>,
    one: Vec<Option<String>>,
    codes: Vec<Option<Vec<String>>>,
    top_last: HashMap<String, usize>,
}

struct Ctx<'a> {
    ir: &'a Ir,
    tree: &'a Tree,
    name_fn: i64,
    str_at: StrAt<'a>,
    err_name: &'a dyn Fn(u64) -> Option<String>,
    cache: HashMap<*const Vec<SNode>, Info>,
    node_cache: HashMap<*const SNode, Info>,
    suf: HashMap<*const Vec<SNode>, std::rc::Rc<Suffixes>>,
}

impl Ctx<'_> {
    fn node_info(&mut self, n: &SNode) -> Info {
        if let Some(r) = self.node_cache.get(&(n as *const SNode)) {
            return r.clone();
        }
        let mut r = Info::default();
        if let SNode::Stmt(si) = n {
            for (pc, args) in calls_in(self.ir, self.tree.stmt(*si)) {
                if pc == self.name_fn {
                    if let Some(nm) = name_arg(self.ir, args, self.str_at) {
                        r.names.insert(nm);
                    }
                }
                for a in self.ir.items(args) {
                    if let Node::Const(v) = self.ir.get(a) {
                        if let Some(e) = (self.err_name)(v) {
                            if !r.codes.contains(&e) {
                                r.codes.push(e);
                            }
                        }
                    }
                }
            }
        } else {
            for sub in children(n) {
                let i = self.info(sub);
                merge(&mut r, &i);
            }
        }
        self.node_cache.insert(n as *const SNode, r.clone());
        r
    }
    fn info(&mut self, ns: &Vec<SNode>) -> Info {
        if let Some(r) = self.cache.get(&(ns as *const Vec<SNode>)) {
            return r.clone();
        }
        let mut r = Info::default();
        for n in ns {
            let i = self.node_info(n);
            merge(&mut r, &i);
        }
        self.cache.insert(ns as *const Vec<SNode>, r.clone());
        r
    }
    fn suffixes(&mut self, ns: &Vec<SNode>) -> std::rc::Rc<Suffixes> {
        if let Some(r) = self.suf.get(&(ns as *const Vec<SNode>)) {
            return r.clone();
        }
        let len = ns.len();
        let mut r = Suffixes {
            count: vec![0; len + 1],
            one: vec![None; len + 1],
            codes: vec![None; len + 1],
            top_last: HashMap::new(),
        };
        let mut names: IndexSet<String> = IndexSet::new();
        let mut codes: Vec<String> = Vec::new();
        r.codes[len] = Some(codes.clone());
        for k in (0..len).rev() {
            let n = &ns[k];
            for nm in top_names(self.ir, self.tree, std::slice::from_ref(n), self.name_fn, self.str_at) {
                r.top_last.entry(nm).or_insert(k);
            }
            if names.len() >= 2 {
                r.count[k] = 2;
                continue;
            }
            let i = self.node_info(n);
            for x in &i.names {
                names.insert(x.clone());
            }
            r.count[k] = names.len().min(2) as i8;
            if names.len() == 1 {
                r.one[k] = names.first().cloned();
            }
            if !i.codes.is_empty() {
                let mut c = i.codes.clone();
                for x in &codes {
                    if !c.contains(x) {
                        c.push(x.clone());
                    }
                }
                codes = c;
            }
            r.codes[k] = Some(codes.clone());
        }
        let r = std::rc::Rc::new(r);
        self.suf.insert(ns as *const Vec<SNode>, r.clone());
        r
    }
}

/// topNames: names of the name-function calls a list makes unconditionally (its own statements).
fn top_names(ir: &Ir, tree: &Tree, ns: &[SNode], name_fn: i64, str_at: StrAt) -> IndexSet<String> {
    let mut out = IndexSet::new();
    for n in ns {
        let calls = match n {
            SNode::Stmt(si) => calls_in(ir, tree.stmt(*si)),
            SNode::Return(Some(e)) => calls_in(ir, &Stmt::Eval { e: *e, pc: 0 }),
            _ => continue,
        };
        for (pc, args) in calls {
            if pc == name_fn {
                if let Some(nm) = name_arg(ir, args, str_at) {
                    out.insert(nm);
                }
            }
        }
    }
    out
}

/// exits: does the list always leave (return / trap) at its end?
fn exits(tree: &Tree, ns: &[SNode]) -> bool {
    match ns.last() {
        None => false,
        Some(SNode::Return(_)) | Some(SNode::Trap(_)) => true,
        Some(SNode::Stmt(si)) => matches!(tree.stmt(*si), Stmt::Trap { .. }),
        Some(SNode::If { then, els, .. }) => exits(tree, then) && exits(tree, els),
        _ => false,
    }
}

fn vars_in(ir: &Ir, e: E, out: &mut IndexSet<u32>) {
    ir.walk(e, &mut |_, n| {
        if let Node::Var(v) = n {
            out.insert(v);
        }
    });
}

/// anchorFn: analyze one function.
pub fn anchor_fn(
    f: &Func,
    tree: &Tree,
    name_fn: i64,
    str_at: StrAt,
    err_name: &dyn Fn(u64) -> Option<String>,
    is_account: &dyn Fn(u32) -> bool,
) -> Option<AnchorFn> {
    let ir = f.ir.as_ref().unwrap();
    let fp = crate::util::fp_var(f);
    let mut res = AnchorFn {
        accounts: Vec::new(),
        checks: IndexMap::new(),
        var_names: IndexMap::new(),
        account_vars: IndexSet::new(),
    };
    let mut cx = Ctx {
        ir,
        tree,
        name_fn,
        str_at,
        err_name,
        cache: HashMap::new(),
        node_cache: HashMap::new(),
        suf: HashMap::new(),
    };
    if cx.info(&tree.body).names.is_empty() {
        return None;
    }
    fn order(cx: &Ctx, ns: &[SNode], res: &mut AnchorFn) {
        for n in ns {
            match n {
                SNode::Stmt(si) => {
                    for (pc, args) in calls_in(cx.ir, cx.tree.stmt(*si)) {
                        if pc == cx.name_fn {
                            if let Some(nm) = name_arg(cx.ir, args, cx.str_at) {
                                if !res.accounts.contains(&nm) {
                                    res.accounts.push(nm);
                                }
                            }
                        }
                    }
                }
                SNode::If { then, els, .. } => {
                    order(cx, then, res);
                    order(cx, els, res);
                }
                _ => {
                    for c in children(n) {
                        order(cx, c, res);
                    }
                }
            }
        }
    }
    order(&cx, &tree.body, &mut res);

    // try-call result groups
    let mut group: IndexMap<u32, u32> = IndexMap::new();
    let mut gid = 0u32;
    fn groups(ir: &Ir, tree: &Tree, fp: Option<u32>, ns: &[SNode], group: &mut IndexMap<u32, u32>, gid: &mut u32) {
        let mut cur: Option<(N, u32)> = None;
        for n in ns {
            let SNode::Stmt(si) = n else {
                for c in children(n) {
                    groups(ir, tree, fp, c, group, gid);
                }
                cur = None;
                continue;
            };
            let s = tree.stmt(*si);
            let cs = calls_in(ir, s);
            if !cs.is_empty() {
                let o = if cs[0].1.len > 0 {
                    fo_any(ir, ir.at(cs[0].1, 0), fp)
                } else {
                    None
                };
                cur = match (o, s) {
                    (Some(o), Stmt::Call { .. }) => {
                        *gid += 1;
                        Some((o, *gid))
                    }
                    _ => None,
                };
                continue;
            }
            if let (Some((coff, cid)), Stmt::Set { dst, e, .. }) = (cur, s) {
                if let Node::Load { size: 8, addr } = ir.get(*e) {
                    let o = fo_any(ir, addr, fp).or_else(|| match ir.get(addr) {
                        Node::Bin(BinOp::Add, a, b) => match ir.get(b) {
                            Node::Const(c) => fo_any(ir, a, fp).map(|x| x + crate::util::n_s(c)),
                            _ => None,
                        },
                        _ => None,
                    });
                    if let Some(o) = o {
                        if o >= coff && o < coff + 64.0 {
                            group.insert(*dst as u32, cid);
                            continue;
                        }
                    }
                }
            }
            if matches!(s, Stmt::Store { .. } | Stmt::Stores { .. } | Stmt::Copy { .. }) {
                cur = None;
            }
        }
    }
    groups(ir, tree, fp, &tree.body, &mut group, &mut gid);

    // candidate names
    let mut cand: IndexMap<u32, IndexSet<String>> = IndexMap::new();
    fn branches(
        cx: &mut Ctx,
        ns: &Vec<SNode>,
        fp: Option<u32>,
        cand: &mut IndexMap<u32, IndexSet<String>>,
        res: &mut AnchorFn,
    ) {
        for k in 0..ns.len() {
            let n = &ns[k];
            if let SNode::If { c, then, els } = n {
                let mut sides: [(Option<&Vec<SNode>>, bool); 2] = [(Some(then), false), (Some(els), false)];
                if els.is_empty() && exits(cx.tree, then) {
                    sides[1] = (None, true);
                }
                if then.is_empty() && exits(cx.tree, els) {
                    sides[0] = (None, true);
                }
                for (side, rest) in sides {
                    let (nm, codes, top_has);
                    match side {
                        Some(side) => {
                            let i = cx.info(side);
                            if i.names.len() != 1 {
                                continue;
                            }
                            nm = i.names.first().unwrap().clone();
                            codes = i.codes.clone();
                            top_has = top_names(cx.ir, cx.tree, side, cx.name_fn, cx.str_at).contains(&nm);
                        }
                        None => {
                            let suf = cx.suffixes(ns);
                            if suf.count[k + 1] != 1 {
                                continue;
                            }
                            nm = suf.one[k + 1].clone().unwrap();
                            codes = suf.codes[k + 1].clone().unwrap();
                            top_has = suf.top_last.get(&nm).map_or(-1, |&x| x as i64) >= k as i64 + 1;
                        }
                    }
                    if rest && !top_has {
                        continue;
                    }
                    if top_has {
                        let mut vs = IndexSet::new();
                        vars_in(cx.ir, *c, &mut vs);
                        if let Some(fp) = fp {
                            vs.shift_remove(&fp);
                        }
                        for v in vs {
                            cand.entry(v).or_default().insert(nm.clone());
                        }
                    }
                    let l = res.checks.entry(nm.clone()).or_default();
                    for x in codes {
                        if !l.contains(&x) {
                            l.push(x);
                        }
                    }
                }
                branches(cx, then, fp, cand, res);
                branches(cx, els, fp, cand, res);
            } else {
                for c in children(n) {
                    branches(cx, c, fp, cand, res);
                }
            }
        }
    }
    branches(&mut cx, &tree.body, fp, &mut cand, &mut res);

    let evidence = account_evidence(f);
    let mut by_group: IndexMap<u32, IndexSet<String>> = IndexMap::new();
    for (v, names) in &cand {
        if let Some(&g) = group.get(v) {
            let s = by_group.entry(g).or_default();
            for x in names {
                s.insert(x.clone());
            }
        }
    }
    let assign = |res: &mut AnchorFn, v: u32, names: &IndexSet<String>| {
        if names.len() != 1 {
            return;
        }
        let nm = names.first().unwrap().clone();
        if is_account(v) || evidence.contains(&v) {
            res.var_names.insert(v, nm);
            res.account_vars.insert(v);
        }
    };
    for (v, names) in &cand {
        assign(&mut res, *v, names);
    }
    for (v, g) in &group {
        if !res.var_names.contains_key(v) {
            if let Some(names) = by_group.get(g) {
                assign(&mut res, *v, names);
            }
        }
    }
    Some(res)
}

/// outAliases: variables holding a function's first parameter (the out pointer).
pub fn out_aliases(f: &Func) -> Option<IndexSet<u32>> {
    let ir = f.ir.as_ref().unwrap();
    let out = crate::util::param_var(f, 1)?;
    let fp = crate::util::fp_var(f);
    let mut defs: IndexMap<i32, Vec<Option<E>>> = IndexMap::new();
    let mut slots: IndexMap<K, Option<E>> = IndexMap::new();
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Set { dst, e, .. } => defs.entry(*dst).or_default().push(Some(*e)),
                Stmt::Call { dst, .. } => defs.entry(*dst).or_default().push(None),
                Stmt::Store { size: 8, addr, v, .. } => {
                    if let Some(o) = fo_any(ir, *addr, fp) {
                        let k = K::of(o);
                        let nv = if slots.contains_key(&k) { None } else { Some(*v) };
                        slots.insert(k, nv);
                    }
                }
                Stmt::Stores {
                    addr, vals, size, ..
                } => {
                    if let Some(o) = fo_any(ir, *addr, fp) {
                        for (i, v) in ir.items(*vals).enumerate() {
                            let k = K::of(o + (*size as usize * i) as N);
                            let nv = if slots.contains_key(&k) || *size != 8 { None } else { Some(v) };
                            slots.insert(k, nv);
                        }
                    }
                }
                Stmt::Copy { dst, n, .. } => {
                    if let Some(o) = fo_any(ir, *dst, fp) {
                        let mut k = o - 7.0;
                        while k < o + *n as N {
                            if slots.contains_key(&K::of(k)) {
                                slots.insert(K::of(k), None);
                            }
                            if k + 1.0 == k {
                                break;
                            }
                            k += 1.0;
                        }
                    }
                }
                _ => {}
            }
        }
    }
    if defs.contains_key(&(out as i32)) {
        return None;
    }
    let src = |e: Option<E>| -> Option<u32> {
        let e = match e {
            Some(e) => e,
            None => return None,
        };
        match ir.get(e) {
            Node::Var(v) => Some(v),
            Node::Load { size: 8, addr } => {
                let o = fo_any(ir, addr, fp)?;
                for k in slots.keys() {
                    let k = k.get();
                    if k != o && k > o - 8.0 && k < o + 8.0 {
                        return None;
                    }
                }
                match slots.get(&K::of(o)) {
                    Some(Some(v)) => var_of(ir, *v),
                    _ => None,
                }
            }
            _ => None,
        }
    };
    let mut res: IndexSet<u32> = IndexSet::new();
    res.insert(out);
    for (v, ds) in &defs {
        if ds.iter().all(|e| src(*e).is_some()) {
            res.insert(*v as u32);
        }
    }
    let mut changed = true;
    while changed {
        changed = false;
        let snap: Vec<u32> = res.iter().copied().collect();
        for v in snap {
            if !res.contains(&v) || v == out {
                continue;
            }
            let ok = defs[&(v as i32)]
                .iter()
                .all(|e| src(*e).is_some_and(|x| res.contains(&x)));
            if !ok {
                res.shift_remove(&v);
                changed = true;
            }
        }
    }
    Some(res)
}

/// accountsLayout: offset -> account name of the Accounts struct try_accounts returns.
pub fn accounts_layout(f: &Func, names: &IndexMap<u32, String>) -> IndexMap<K, String> {
    let ir = f.ir.as_ref().unwrap();
    let fp = crate::util::fp_var(f);
    let mut res: IndexMap<K, String> = IndexMap::new();
    let mut bad: IndexSet<K> = IndexSet::new();
    let Some(aliases) = out_aliases(f) else {
        return res;
    };
    let fo = |e: E| fo_any(ir, e, fp);
    let mut slot: HashMap<K, Option<E>> = HashMap::new();
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Store { size: 8, addr, v, .. } => {
                    if let Some(o) = fo(*addr) {
                        let k = K::of(o);
                        let nv = if slot.contains_key(&k) { None } else { Some(*v) };
                        slot.insert(k, nv);
                    }
                }
                Stmt::Stores {
                    size: 8, addr, vals, ..
                } => {
                    if let Some(o) = fo(*addr) {
                        for (i, v) in ir.items(*vals).enumerate() {
                            let k = K::of(o + (8 * i) as N);
                            let nv = if slot.contains_key(&k) { None } else { Some(v) };
                            slot.insert(k, nv);
                        }
                    }
                }
                _ => {}
            }
        }
    }
    let name_of = |e: E| -> Option<String> {
        match ir.get(e) {
            Node::Var(v) => names.get(&v).cloned(),
            Node::Load { size: 8, addr } => {
                let o = fo(addr)?;
                match slot.get(&K::of(o)) {
                    Some(Some(v)) => var_of(ir, *v).and_then(|x| names.get(&x).cloned()),
                    _ => None,
                }
            }
            _ => None,
        }
    };
    let out_off = |a: E| -> N {
        match ir.get(a) {
            Node::Var(v) if aliases.contains(&v) => 0.0,
            Node::Bin(BinOp::Add, x, c) => match (ir.get(x), ir.get(c)) {
                (Node::Var(v), Node::Const(c)) if aliases.contains(&v) => c as f64,
                _ => -1.0,
            },
            _ => -1.0,
        }
    };
    let mut note = |res: &mut IndexMap<K, String>, off: N, v: E| {
        let Some(nm) = name_of(v) else { return };
        let k = K::of(off);
        if res.get(&k).is_some_and(|x| *x != nm) {
            bad.insert(k);
        }
        res.insert(k, nm);
    };
    for b in &f.blocks {
        let err_block = b.stmts.iter().any(|s| match s {
            Stmt::Store { size: 8, addr, v, .. } => {
                ir.get(*v) == Node::Const(0) && out_off(*addr) == 0.0
            }
            Stmt::Stores {
                size: 8, addr, vals, ..
            } => ir.get(ir.at(*vals, 0)) == Node::Const(0) && out_off(*addr) == 0.0,
            _ => false,
        });
        for s in &b.stmts {
            let (addr, size) = match s {
                Stmt::Store { addr, size, .. } | Stmt::Stores { addr, size, .. } => (*addr, *size),
                _ => continue,
            };
            if err_block {
                break;
            }
            let off = out_off(addr);
            if !(0.0..=65536.0).contains(&off) || size != 8 {
                continue;
            }
            match s {
                Stmt::Store { v, .. } => note(&mut res, off, *v),
                Stmt::Stores { vals, .. } => {
                    for (i, v) in ir.items(*vals).enumerate() {
                        note(&mut res, off + (8 * i) as N, v);
                    }
                }
                _ => {}
            }
        }
    }
    for o in &bad {
        res.shift_remove(o);
    }
    let mut seen: HashMap<String, K> = HashMap::new();
    let snap: Vec<(K, String)> = res.iter().map(|(k, v)| (*k, v.clone())).collect();
    for (o, nm) in snap {
        if let Some(&p) = seen.get(&nm) {
            res.shift_remove(&o);
            res.shift_remove(&p);
        } else {
            seen.insert(nm, o);
        }
    }
    res
}

/// accountEvidence: variables used like an AccountInfo pointer.
fn account_evidence(f: &Func) -> HashSet<u32> {
    let ir = f.ir.as_ref().unwrap();
    let mut out = HashSet::new();
    let mut defs: HashMap<u32, Vec<E>> = HashMap::new();
    for b in &f.blocks {
        for s in &b.stmts {
            if let Stmt::Set { dst, e, .. } = s {
                defs.entry(*dst as u32).or_default().push(*e);
            }
        }
    }
    let key_ptr_of = |mut e: E| -> Option<u32> {
        if let Node::Var(v) = ir.get(e) {
            if let Some(d) = defs.get(&v) {
                if d.len() == 1 {
                    e = d[0];
                }
            }
        }
        match ir.get(e) {
            Node::Load { size: 8, addr } => var_of(ir, addr),
            _ => None,
        }
    };
    let scan = |e: E, out: &mut HashSet<u32>| {
        ir.walk(e, &mut |_, x| {
            if let Node::Load { size: 1, addr } = x {
                if let Node::Bin(BinOp::Add, a, c) = ir.get(addr) {
                    if let (Node::Var(v), Node::Const(c)) = (ir.get(a), ir.get(c)) {
                        if [0x28, 0x29, 0x2a].contains(&c) {
                            out.insert(v);
                        }
                    }
                }
            }
            if let Node::Fn(n, args) = x {
                let which = ir.with_name(n, |s| if s == "memeq" { 2 } else if s == "keyeq" { 1 } else { 0 });
                for i in 0..which.min(args.len) {
                    if let Some(v) = key_ptr_of(ir.at(args, i)) {
                        out.insert(v);
                    }
                }
            }
        });
    };
    for b in &f.blocks {
        for s in &b.stmts {
            for e in stmt_exprs(ir, s) {
                scan(e, &mut out);
            }
            if let Stmt::Copy { n: 32, src, .. } = s {
                if let Some(v) = key_ptr_of(*src) {
                    out.insert(v);
                }
            }
            if let Stmt::Call { args, .. } = s {
                let a = ir.to_vec(*args);
                let mut i = 0;
                while i + 2 < a.len() {
                    if ir.get(a[i + 2]) == Node::Const(32) {
                        for x in [a[i], a[i + 1]] {
                            if let Some(v) = key_ptr_of(x) {
                                out.insert(v);
                            }
                        }
                    }
                    i += 1;
                }
            }
        }
        if let Some(c) = term_br(&b.term) {
            scan(c, &mut out);
        }
    }
    out
}
