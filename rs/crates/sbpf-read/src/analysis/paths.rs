//! IR-level path conditions and value identity (`src/analysis/paths.ts`): the branch conditions holding on
//! every path to a point (up the dominator tree, then up the instruction's call path), and canonical value
//! keys of expressions at positions.

use super::flow::*;
use super::ixctx::IxCtx;
use super::An;
use sbpf_ir::{BinOp, CmpOp, Node, Stmt, Term, E};
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

#[derive(Clone, Debug)]
pub struct IrCond {
    pub fn_: i64,
    pub b: usize,
    pub c: E,
    pub pos: Pos,
    /// the side taken on the way (None: `before`, either side)
    pub holds: Option<bool>,
    pub how: &'static str,
    pub panics: bool,
}

/// The memos of the value keys (paths.ts Ir: statements by pc, keys per expression).
#[derive(Default)]
pub struct PathMemo {
    stmts: RefCell<HashMap<i64, Rc<HashMap<i64, (usize, usize)>>>>,
    keys: RefCell<HashMap<(i64, E, Pos, u32), String>>,
}

fn dominators_on(preds: &[Vec<usize>], order: &[usize], rpo: &[i32]) -> Vec<i32> {
    let mut idom = vec![-1i32; preds.len()];
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
            for &p in &preds[b] {
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

fn dom_by(idom: &[i32], a: usize, b: usize) -> bool {
    let mut b = b as i32;
    for _ in 0..100000 {
        if a as i32 == b {
            return true;
        }
        if b <= 0 || idom[b as usize] < 0 || idom[b as usize] == b {
            return false;
        }
        b = idom[b as usize];
    }
    false
}

/// `#<v>` / `#-<n>` of a constant
fn sconst(v: u64) -> String {
    let s = v as i64;
    if s < 0 && s > -0x100000 {
        format!("#-{}", -(s as i128))
    } else {
        format!("#{v}")
    }
}

fn comm(op: &str) -> bool {
    matches!(op, "add" | "mul" | "and" | "or" | "xor" | "eq" | "ne")
}

impl<'a> An<'a> {
    /// a statement of a function by its pc (the first copy, in block order, reachable blocks), with its position
    pub fn stmt_at(&self, fn_: i64, pc: i64) -> Option<(usize, usize)> {
        let m = {
            let hit = self.paths.stmts.borrow().get(&fn_).cloned();
            match hit {
                Some(m) => m,
                None => {
                    let mut m: HashMap<i64, (usize, usize)> = HashMap::new();
                    if let Some(fo) = self.fo(fn_) {
                        let g = self.cfg(fn_);
                        for (bi, b) in fo.f.blocks.iter().enumerate() {
                            if g.rpo[bi] >= 0 {
                                for (i, s) in b.stmts.iter().enumerate() {
                                    m.entry(stmt_pc(s)).or_insert((bi, i));
                                }
                            }
                        }
                    }
                    let m = Rc::new(m);
                    self.paths.stmts.borrow_mut().insert(fn_, m.clone());
                    m
                }
            }
        };
        m.get(&pc).copied()
    }

    pub fn defs_in(&self, fn_: i64) -> Option<Rc<Defs<'a>>> {
        self.fo(fn_).map(|fo| self.fl.defs_of(fo.f, true))
    }

    /// the value a single store statement writes, with its position
    pub fn stored_at(&self, fn_: i64, pc: i64) -> Option<(E, Pos)> {
        let (b, i) = self.stmt_at(fn_, pc)?;
        let f = self.fo(fn_)?.f;
        let v = match &f.blocks[b].stmts[i] {
            Stmt::Store { v, .. } => Some(*v),
            Stmt::Stores { vals, .. } if vals.len == 1 => Some(fir(f).at(*vals, 0)),
            _ => None,
        }?;
        Some((v, pos_of(b, i)))
    }

    /// the position of a point: its statement, else the end of the block returning `ret`
    pub fn pos_at(&self, fn_: i64, pc: Option<i64>, ret: Option<E>) -> Option<Pos> {
        if let Some(pc) = pc {
            return self.stmt_at(fn_, pc).map(|(b, i)| pos_of(b, i));
        }
        let b = self.block_at(fn_, None, ret)?;
        Some(pos_of(b, self.fo(fn_).unwrap().f.blocks[b].stmts.len()))
    }

    /// The block of a point of a function: a statement pc, or a returned expression.
    pub fn block_at(&self, fn_: i64, pc: Option<i64>, ret: Option<E>) -> Option<usize> {
        self.fo(fn_)?;
        let g = self.cfg(fn_);
        match (pc, ret) {
            (Some(pc), _) => g.pc_block.get(&pc).copied(),
            (None, Some(r)) => g.ret_block.get(&r).copied(),
            _ => None,
        }
    }

    fn idom_of(&self, fn_: i64, ctx: Option<&IxCtx<'a>>) -> Option<Rc<Vec<i32>>> {
        let ctx = ctx?;
        let grp = ctx.grp.as_ref()?;
        if !ctx.restricted.as_ref().is_some_and(|r| r.contains(&fn_)) {
            return None;
        }
        if let Some(x) = ctx.ridom.borrow().get(&fn_) {
            return Some(x.clone());
        }
        let g = self.cfg(fn_);
        let blocks = &self.fo(fn_).unwrap().f.blocks;
        let ok = |x: usize| grp.allowed(fn_, x);
        let mut order: Vec<usize> = (0..blocks.len())
            .filter(|&x| g.rpo[x] >= 0 && ok(x))
            .collect();
        order.sort_by_key(|&x| g.rpo[x]);
        let preds: Vec<Vec<usize>> = (0..blocks.len())
            .map(|i| {
                if ok(i) {
                    blocks[i].preds.iter().copied().filter(|&p| ok(p)).collect()
                } else {
                    vec![]
                }
            })
            .collect();
        let idom = Rc::new(dominators_on(&preds, &order, &g.rpo));
        ctx.ridom.borrow_mut().insert(fn_, idom.clone());
        Some(idom)
    }

    /// The branch conditions on every path to block b of a function (nearest first), and the dominating
    /// branches either side of which reaches it.
    pub fn conds_in(&self, fn_: i64, b: usize, ctx: Option<&IxCtx<'a>>, max: usize) -> Vec<IrCond> {
        let Some(fo) = self.fo(fn_) else {
            return vec![];
        };
        let g = self.cfg(fn_);
        let blocks = &fo.f.blocks;
        let ridom = self.idom_of(fn_, ctx);
        let part = ridom.as_ref().is_some_and(|x| x[b] >= 0);
        let idom: &[i32] = if part {
            ridom.as_ref().unwrap()
        } else {
            &g.idom
        };
        let ok = |x: usize| {
            g.rpo[x] >= 0 && (!part || ctx.unwrap().grp.as_ref().unwrap().allowed(fn_, x))
        };
        let mut out: Vec<IrCond> = Vec::new();
        let mut x = b;
        let mut k = 0;
        while x > 0 && k < 4000 && out.len() < max {
            let d = idom[x];
            if d < 0 || d as usize == x {
                break;
            }
            let d = d as usize;
            if let Term::Br { c, t, f } = &blocks[d].term {
                if t != f {
                    let (t, f) = (*t as usize, *f as usize);
                    let pos = pos_of(d, blocks[d].stmts.len());
                    let others: Option<Vec<usize>> = if x == t || x == f {
                        Some(
                            blocks[x]
                                .preds
                                .iter()
                                .copied()
                                .filter(|&p| p != d && ok(p))
                                .collect(),
                        )
                    } else {
                        None
                    };
                    if others
                        .as_ref()
                        .is_some_and(|o| o.iter().all(|&p| dom_by(idom, x, p)))
                    {
                        let others = others.unwrap();
                        let lp = !others.is_empty()
                            || blocks[d].preds.iter().any(|&p| ok(p) && dom_by(idom, d, p));
                        let mut y = if x == t { f } else { t };
                        let mut j = 0;
                        while j < 6
                            && matches!(blocks[y].term, Term::Jmp { .. })
                            && blocks[y].succs.len() == 1
                        {
                            y = blocks[y].succs[0];
                            j += 1;
                        }
                        out.push(IrCond {
                            fn_,
                            b: d,
                            c: *c,
                            pos,
                            holds: Some(x == t),
                            how: if lp { "loop" } else { "branch" },
                            panics: matches!(blocks[y].term, Term::Trap { .. }),
                        });
                    } else {
                        out.push(IrCond {
                            fn_,
                            b: d,
                            c: *c,
                            pos,
                            holds: None,
                            how: "before",
                            panics: false,
                        });
                    }
                }
            }
            x = d;
            k += 1;
        }
        out
    }

    /// conditions on the way to block b of a function: in it, then at the call sites up the call path
    pub fn path_to(
        &self,
        ctx: Option<&IxCtx<'a>>,
        fn_: i64,
        b: Option<usize>,
        max: usize,
    ) -> Vec<IrCond> {
        let mut out: Vec<IrCond> = Vec::new();
        let mut cur = fn_;
        let mut b = b;
        let mut d = 0;
        while let Some(bb) = b {
            if d >= 8 || out.len() >= max {
                break;
            }
            let more = self.conds_in(cur, bb, ctx, max - out.len());
            out.extend(more);
            let par = match ctx {
                Some(c) if cur != c.handler => c.parents.get(&cur).copied(),
                _ => None,
            };
            let Some(par) = par else { break };
            b = self.block_at(par.fn_, par.pc, par.ret);
            cur = par.fn_;
            d += 1;
        }
        out
    }

    /// The canonical key of expression e at position p of function fn.
    pub fn value_key(&self, ctx: Option<&IxCtx<'a>>, fn_: i64, e: E, p: Pos, d: u32) -> String {
        if d > 14 {
            return "…".into();
        }
        let ci = ctx.map_or(0, |c| c.id);
        let mk = (fn_, e, p, ci);
        if let Some(h) = self.paths.keys.borrow().get(&mk) {
            return h.clone();
        }
        let k = self.value_key0(ctx, fn_, e, p, d);
        let stored = if crate::util::u16len(&k) > 600 {
            format!("{}…", js_slice(&k, 600))
        } else {
            k.clone()
        };
        self.paths.keys.borrow_mut().insert(mk, stored);
        k
    }

    fn value_key0(&self, ctx: Option<&IxCtx<'a>>, fn_: i64, e: E, p: Pos, d: u32) -> String {
        let (Some(dd), Some(fo)) = (self.defs_in(fn_), self.fo(fn_)) else {
            return "?".into();
        };
        let ir = fir(fo.f);
        let kk = |x: E, q: Pos| self.value_key(ctx, fn_, x, q, d + 1);
        match ir.get(e) {
            Node::Const(v) => sconst(v),
            Node::Var(id) => {
                if id as i64 == dd.fp {
                    return format!("fp{fn_}");
                }
                if let Some(&x) = dd.defs.get(&id) {
                    let dp = dd.def_pos[&id];
                    return if matches!(ir.get(x), Node::Call(..)) {
                        format!("call{fn_}@{dp}")
                    } else {
                        kk(x, dp)
                    };
                }
                let v = fo.f.vars.get(id as usize);
                if dd.multi.contains(&id) {
                    return match dd.reaching(&self.fl, id as f64, p, false) {
                        Some((y, q)) => {
                            if matches!(ir.get(y), Node::Call(..)) {
                                format!("call{fn_}@{q}")
                            } else {
                                kk(y, q)
                            }
                        }
                        None => format!("v{fn_}.{id}"),
                    };
                }
                if let Some(v) = v {
                    if v.param >= 1 && v.param != 10 {
                        return self
                            .param_key(ctx, fn_, v.param, d)
                            .unwrap_or_else(|| format!("p{fn_}.{}", v.param));
                    }
                }
                format!("v{fn_}.{id}")
            }
            Node::Load { size, addr } => {
                if let Some(o) = dd.fp_off(addr) {
                    if size == 8 {
                        if let Some((y, q)) = dd.reaching(&self.fl, slot(o), p, false) {
                            return if matches!(ir.get(y), Node::Call(..)) {
                                format!("call{fn_}@{q}")
                            } else {
                                kk(y, q)
                            };
                        }
                    }
                    return format!("fs{fn_}@{}:{size}", crate::util::js_num(o));
                }
                format!("ld{size}({})", kk(addr, p))
            }
            Node::Bin(op, a, b) => {
                let is_sub_c = op == BinOp::Sub && matches!(ir.get(b), Node::Const(_));
                if op == BinOp::Add || is_sub_c {
                    let mut terms: Vec<String> = Vec::new();
                    let mut c: u64 = 0;
                    fn flat(
                        an: &An,
                        ir: &sbpf_ir::Ir,
                        x: E,
                        terms: &mut Vec<String>,
                        c: &mut u64,
                        kk: &dyn Fn(E) -> String,
                    ) {
                        let _ = an;
                        match ir.get(x) {
                            Node::Bin(BinOp::Add, a, b) => {
                                flat(an, ir, a, terms, c, kk);
                                flat(an, ir, b, terms, c, kk);
                                return;
                            }
                            Node::Bin(BinOp::Sub, a, b) if matches!(ir.get(b), Node::Const(_)) => {
                                flat(an, ir, a, terms, c, kk);
                                let Node::Const(v) = ir.get(b) else {
                                    unreachable!()
                                };
                                *c = c.wrapping_sub(v);
                                return;
                            }
                            Node::Const(v) => {
                                *c = c.wrapping_add(v);
                                return;
                            }
                            _ => {}
                        }
                        let s = kk(x);
                        if let Some(inner) = s.strip_prefix("(+ ") {
                            let inner = &inner[..inner.char_indices().last().map_or(0, |x| x.0)];
                            let parts: Vec<&str> = inner.split(' ').collect();
                            if parts.iter().all(|t| !t.contains('(')) {
                                for t in parts {
                                    if let Some(n) = t.strip_prefix('#') {
                                        let v: i128 = n.parse().unwrap_or(0);
                                        *c = c.wrapping_add(v as u64);
                                    } else {
                                        terms.push(t.to_string());
                                    }
                                }
                                return;
                            }
                        }
                        terms.push(s);
                    }
                    let k1 = |x: E| kk(x, p);
                    flat(self, ir, e, &mut terms, &mut c, &k1);
                    if terms.is_empty() {
                        return sconst(c);
                    }
                    if terms.len() == 1 && c == 0 {
                        return terms.pop().unwrap();
                    }
                    terms.sort();
                    return format!(
                        "(+ {}{})",
                        terms.join(" "),
                        if c != 0 {
                            format!(" {}", sconst(c))
                        } else {
                            String::new()
                        }
                    );
                }
                let (ka, kb) = (kk(a, p), kk(b, p));
                let op = op.as_str();
                if comm(op) && ka > kb {
                    format!("({op} {kb} {ka})")
                } else {
                    format!("({op} {ka} {kb})")
                }
            }
            Node::Ext { a, .. } => kk(a, p),
            Node::Cmp(op, a, b) => {
                let (mut ka, mut kb) = (kk(a, p), kk(b, p));
                let mut o = op.as_str();
                let sw = match op {
                    CmpOp::Ugt => Some("ult"),
                    CmpOp::Uge => Some("ule"),
                    CmpOp::Sgt => Some("slt"),
                    CmpOp::Sge => Some("sle"),
                    _ => None,
                };
                if let Some(s) = sw {
                    o = s;
                    std::mem::swap(&mut ka, &mut kb);
                }
                if comm(o) && ka > kb {
                    std::mem::swap(&mut ka, &mut kb);
                }
                format!("({o} {ka} {kb})")
            }
            Node::Lnot(a) => format!("(! {})", kk(a, p)),
            Node::Land(a, b) => format!("(land {} {})", kk(a, p), kk(b, p)),
            Node::Lor(a, b) => format!("(lor {} {})", kk(a, p), kk(b, p)),
            Node::Sel(c, a, b) => format!("(? {} {} {})", kk(c, p), kk(a, p), kk(b, p)),
            Node::Neg(a) => format!("(neg {})", kk(a, p)),
            Node::Not(a) => format!("(not {})", kk(a, p)),
            Node::Bswap { bits, a } => format!("(bswap{bits} {})", kk(a, p)),
            Node::Fn(n, args) => {
                let xs: Vec<String> = ir.items(args).map(|x| kk(x, p)).collect();
                format!("({} {})", ir.name(n), xs.join(" "))
            }
            Node::Call(..) => format!("call{fn_}@{p}"),
            n => node_kind(&n).to_string(),
        }
    }

    /// a parameter's value: the argument at the call site up the instruction's call path
    fn param_key(&self, ctx: Option<&IxCtx<'a>>, fn_: i64, reg: i32, d: u32) -> Option<String> {
        let ctx = ctx?;
        if fn_ == ctx.handler {
            return None;
        }
        let par = ctx.parents.get(&fn_)?;
        let ppc = par.pc?;
        let (b, i) = self.stmt_at(par.fn_, ppc)?;
        let pf = self.fo(par.fn_)?.f;
        let pir = fir(pf);
        let (t, args) = call_of(pir, &pf.blocks[b].stmts[i])?;
        if !matches!(t, sbpf_ir::CallTarget::Fn { pc } if pc == fn_) {
            return None;
        }
        let f = self.fo(fn_)?.f;
        let idx = if reg < 100 { reg - 1 } else { 4 + (reg - 100) };
        if (reg >= 100 && f.stack_args.is_none()) || idx < 0 || idx as u32 >= args.len {
            return None;
        }
        Some(self.value_key(
            Some(ctx),
            par.fn_,
            pir.at(args, idx as u32),
            pos_of(b, i),
            d + 1,
        ))
    }

    /// the comparisons of a condition (through && / || / !), as (op, left, right) of canonical keys
    pub fn cmps_of(
        &self,
        ctx: Option<&IxCtx<'a>>,
        fn_: i64,
        c: E,
        p: Pos,
    ) -> Vec<(String, String, String)> {
        let mut out: Vec<(String, String, String)> = Vec::new();
        let Some(fo) = self.fo(fn_) else { return out };
        let ir = fir(fo.f);
        fn go<'a>(
            an: &An<'a>,
            ctx: Option<&IxCtx<'a>>,
            fn_: i64,
            ir: &sbpf_ir::Ir,
            x: E,
            k: u32,
            p: Pos,
            out: &mut Vec<(String, String, String)>,
        ) {
            if k > 8 || out.len() > 8 {
                return;
            }
            match ir.get(x) {
                Node::Lnot(a) => go(an, ctx, fn_, ir, a, k + 1, p, out),
                Node::Land(a, b) | Node::Lor(a, b) => {
                    go(an, ctx, fn_, ir, a, k + 1, p, out);
                    go(an, ctx, fn_, ir, b, k + 1, p, out);
                }
                Node::Var(id) => {
                    let dd = an.defs_in(fn_);
                    let y = dd.and_then(|d| d.defs.get(&id).copied());
                    if let Some(y) = y {
                        if matches!(
                            ir.get(y),
                            Node::Cmp(..) | Node::Lnot(_) | Node::Land(..) | Node::Lor(..)
                        ) {
                            go(an, ctx, fn_, ir, y, k + 1, p, out);
                        }
                    }
                }
                Node::Cmp(op, a, b) => {
                    let ka = an.value_key(ctx, fn_, a, p, 0);
                    let kb = an.value_key(ctx, fn_, b, p, 0);
                    out.push((op.as_str().to_string(), ka, kb));
                }
                _ => {}
            }
        }
        go(self, ctx, fn_, ir, c, 0, p, &mut out);
        out
    }

    /// follow a variable to its (reaching) definition, through extensions
    pub fn follow_def(&self, fn_: i64, e: E, p: Pos, n: u32) -> (E, Pos) {
        let Some(dd) = self.defs_in(fn_) else {
            return (e, p);
        };
        let ir = dd.ir;
        let (mut e, mut p) = (e, p);
        for _ in 0..n {
            match ir.get(e) {
                Node::Ext { a, .. } => {
                    e = a;
                    continue;
                }
                Node::Load { size, addr } => {
                    let o = dd.fp_off(addr);
                    let y = match o {
                        Some(o) if size == 8 => dd.reaching(&self.fl, slot(o), p, false),
                        _ => None,
                    };
                    match y {
                        Some((y, q)) if !matches!(ir.get(y), Node::Call(..)) => {
                            e = y;
                            p = q;
                        }
                        _ => break,
                    }
                    continue;
                }
                Node::Var(id) => match dd.def_at(&self.fl, id, p) {
                    Some((y, q)) if !matches!(ir.get(y), Node::Call(..)) => {
                        e = y;
                        p = q;
                    }
                    _ => break,
                },
                _ => break,
            }
        }
        (e, p)
    }
}

/// does key k (a whole term) occur in key K?
pub fn key_in(kk: &str, k: &str) -> bool {
    let b = kk.as_bytes();
    let mut from = 0;
    while let Some(i) = kk[from..].find(k) {
        let i = from + i;
        let before = if i == 0 { b' ' } else { b[i - 1] };
        let after = b.get(i + k.len()).copied().unwrap_or(b' ');
        if (before == b' ' || before == b'(') && (after == b' ' || after == b')') {
            return true;
        }
        from = i + 1;
        if from > kk.len() {
            break;
        }
    }
    false
}

/// `s.slice(0, n)` in UTF-16 units
fn js_slice(s: &str, n: usize) -> String {
    let mut out = String::new();
    let mut u = 0;
    for c in s.chars() {
        let l = c.len_utf16();
        if u + l > n {
            break;
        }
        out.push(c);
        u += l;
    }
    out
}
