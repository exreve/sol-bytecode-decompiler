//! Multi-step bit tricks become named helpers (popcount, clz, ctz), multi-word
//! memory comparisons become memeq / keyeq.

use crate::cfgopt::live_in_sets;
use crate::*;
use sbpf_ir::{BinOp, CmpOp, Node, Stmt, Term, E};
use sbpf_program::{Block, Func};

const M55: u64 = 0x5555555555555555;
const M33: u64 = 0x3333333333333333;
const M0F: u64 = 0x0f0f0f0f0f0f0f0f;
const M01: u64 = 0x0101010101010101;
const MINUS2: u64 = 0xfffffffffffffffe;

struct Matcher<'a> {
    defs: &'a [Option<E>],
    /// var -> (block, stmt index) of its definition
    at: &'a [(usize, usize)],
    count: &'a [i32],
    vars: &'a [sbpf_program::VarInfo],
    /// variables looked through by the current match
    trail: Vec<u32>,
    cur_b: usize,
    cur_i: usize,
}

impl Matcher<'_> {
    fn stable(&self, id: u32) -> bool {
        self.defs[id as usize].is_some()
            || (self.vars[id as usize].param >= 0 && self.count[id as usize] == 0)
    }
    fn see(&mut self, x: &Fx, e: E) -> E {
        if let Node::Var(id) = x.node(e) {
            if let Some(d) = self.defs[id as usize] {
                self.trail.push(id);
                return d;
            }
        }
        e
    }
    fn ok_arg(&self, x: &Fx, e: E) -> bool {
        let mut ok = true;
        x.ir.walk(e, &mut |_, n| {
            if let Node::Var(id) = n {
                if !self.stable(id) {
                    ok = false
                }
            }
        });
        ok
    }
    /// The helper argument has the value the matched chain saw.
    fn arg_ok(&self, x: &Fx, f: &Func, e: E) -> bool {
        if self.ok_arg(x, e) {
            return true;
        }
        let mut lo = self.cur_i;
        for &v in &self.trail {
            let (b, i) = self.at[v as usize];
            if b != self.cur_b {
                return false;
            }
            lo = lo.min(i);
        }
        let mut vs: Vec<u32> = vec![];
        x.ir.walk(e, &mut |_, n| {
            if let Node::Var(id) = n {
                vs.push(id)
            }
        });
        let st = &f.blocks[self.cur_b].stmts;
        for s in &st[lo..self.cur_i] {
            if let Some(d) = def_of(s) {
                if vs.contains(&d) {
                    return false;
                }
            }
        }
        true
    }
    fn bin(&mut self, x: &Fx, e: E, op: BinOp) -> Option<(E, E)> {
        match x.node(self.see(x, e)) {
            Node::Bin(o, a, b) if o == op => Some((a, b)),
            _ => None,
        }
    }
    /// e = x >> n (logical), returns x
    fn shr(&mut self, x: &Fx, e: E, n: u64) -> Option<E> {
        let (a, b) = self.bin(x, e, BinOp::Lshr)?;
        x.is_c(b, n).then_some(a)
    }
    /// e = (x >> n) & m or (x & m) when n = 0, returns x
    fn masked(&mut self, x: &Fx, e: E, n: u64, m: u64) -> Option<E> {
        let (a, b) = self.bin(x, e, BinOp::And)?;
        if !x.is_c(b, m) {
            return None;
        }
        if n == 0 {
            Some(a)
        } else {
            self.shr(x, a, n)
        }
    }
    fn same(&mut self, x: &Fx, a: E, b: E) -> bool {
        if x.expr_eq(a, b) {
            return true;
        }
        let (sa, sb) = (self.see(x, a), self.see(x, b));
        if !x.expr_eq(sa, sb) {
            return false;
        }
        let sa = self.see(x, a);
        self.ok_arg(x, sa)
    }
    /// commutative binary match
    fn both(
        &mut self,
        _x: &Fx,
        (a, b): (E, E),
        f2: &mut dyn FnMut(&mut Self, E, E) -> Option<E>,
    ) -> Option<E> {
        f2(self, a, b).or_else(|| f2(self, b, a))
    }
    /// m = s * 0x0101… with s the byte-sum stage of a popcount: returns the popcount's operand
    fn popcount_of(&mut self, x: &Fx, m: E) -> Option<E> {
        let (ma, mb) = self.bin(x, m, BinOp::Mul)?;
        if !x.is_c(mb, M01) {
            return None;
        }
        let s = self.masked(x, ma, 0, M0F)?;
        let add = self.bin(x, s, BinOp::Add)?;
        let r = self.both(x, add, &mut |me, l, xx| {
            let y = me.shr(x, xx, 4)?;
            me.same(x, y, l).then_some(l)
        })?;
        let radd = self.bin(x, r, BinOp::Add)?;
        let q = self.both(x, radd, &mut |me, l, xx| {
            let a = me.masked(x, l, 0, M33);
            let b = me.masked(x, xx, 2, M33);
            let (a, b) = (a?, b?);
            me.same(x, a, b).then_some(a)
        })?;
        let (sa, sb) = self.bin(x, q, BinOp::Sub)?;
        let p = self.masked(x, sb, 1, M55)?;
        if self.same(x, p, sa) {
            return Some(sa);
        }
        let (la, lb) = self.bin(x, sa, BinOp::And)?;
        if x.is_c(lb, MINUS2) && self.same(x, la, p) {
            return Some(x.ir.bin(BinOp::And, la, lb));
        }
        None
    }
    /// x | x >> 1 | x >> 2 | … | x >> 32 (each step on the previous result), returns x
    fn smear(&mut self, x: &Fx, e: E) -> Option<E> {
        let mut cur = e;
        for n in [32u64, 16, 8, 4, 2, 1] {
            let o = self.bin(x, cur, BinOp::Or)?;
            cur = self.both(x, o, &mut |me, l, xx| {
                let y = me.shr(x, xx, n)?;
                me.same(x, y, l).then_some(l)
            })?;
        }
        Some(cur)
    }
    /// helper call for popcount(p), recognizing clz / ctz forms of p
    fn helper_for(&mut self, x: &mut Fx, f: &Func, p: E) -> Option<E> {
        let n = self.see(x, p);
        // popcount(~smear(x)) = clz(x)
        if let Node::Not(na) = x.node(n) {
            if let Some(y) = self.smear(x, na) {
                if self.arg_ok(x, f, y) {
                    return Some(x.mk_fn(Intr::Clz, &[y]));
                }
            }
        }
        if let Node::Bin(BinOp::And, aa, ab) = x.node(n) {
            // popcount(~smear(x) & -2) = clz(x | 1)
            let nl = self.see(x, aa);
            if x.is_c(ab, MINUS2) {
                if let Node::Not(nla) = x.node(nl) {
                    if let Some(y) = self.smear(x, nla) {
                        if self.arg_ok(x, f, y) {
                            let one = x.c(1);
                            let o = x.ir.bin(BinOp::Or, y, one);
                            return Some(x.mk_fn(Intr::Clz, &[o]));
                        }
                    }
                }
            }
            // popcount(~x & (x - 1)) = ctz(x)
            let xx = &*x;
            let y = self.both(xx, (aa, ab), &mut |me, l, r| {
                let nl = me.see(xx, l);
                let dec = me.bin(xx, r, BinOp::Add);
                let Node::Not(nla) = xx.node(nl) else {
                    return None;
                };
                let (da, db) = dec?;
                (xx.is_c(db, M64) && me.same(xx, nla, da)).then_some(nla)
            });
            if let Some(y) = y {
                if self.arg_ok(x, f, y) {
                    return Some(x.mk_fn(Intr::Ctz, &[y]));
                }
            }
        }
        if self.arg_ok(x, f, p) {
            Some(x.mk_fn(Intr::Popcount, &[p]))
        } else {
            None
        }
    }
    fn rewrite(&mut self, x: &mut Fx, f: &Func, e: E) -> E {
        let Node::Bin(op, a, b) = x.node(e) else {
            return e;
        };
        self.trail.clear();
        // (s * 0x0101…) >> 56 = popcount
        if op == BinOp::Lshr && x.is_c(b, 56) {
            let p = self.popcount_of(x, a);
            return p.and_then(|p| self.helper_for(x, f, p)).unwrap_or(e);
        }
        // (s * 0x0101…) >> 55 & 0x1fe = popcount << 1
        if op == BinOp::And && x.is_c(b, 0x1fe) {
            let m = self.shr(x, a, 55);
            let p = m.and_then(|m| self.popcount_of(x, m));
            let h = p.and_then(|p| self.helper_for(x, f, p));
            if let Some(h) = h {
                let one = x.c(1);
                return x.ir.bin(BinOp::Shl, h, one);
            }
        }
        e
    }
}

/// recognizeIdioms: (whether the function should be optimized again, whether the IR was really
/// modified).
pub fn recognize_idioms(x: &mut Fx, f: &mut Func) -> (bool, bool) {
    let merged = merge_word_compares(x, f);
    let mut real = merged;
    let nv = f.vars.len();
    let mut count = vec![0i32; nv];
    for b in &f.blocks {
        for s in &b.stmts {
            if let Some(d) = def_of(s) {
                count[d as usize] += 1;
            }
        }
    }
    let mut defs: Vec<Option<E>> = vec![None; nv];
    let mut at = vec![(0usize, 0usize); nv];
    for b in &f.blocks {
        for (i, s) in b.stmts.iter().enumerate() {
            let Stmt::Set { dst, e, .. } = *s else {
                continue;
            };
            let d = dst as usize;
            if count[d] != 1 {
                continue;
            }
            let v = f.vars[d];
            if v.param < 0 && !v.undef && x.fx(e) == 0 {
                defs[d] = Some(e);
                at[d] = (b.id, i);
            }
        }
    }
    let mut changed = merged;
    let mut mt = Matcher {
        defs: &defs,
        at: &at,
        count: &count,
        vars: &f.vars.clone(),
        trail: vec![],
        cur_b: 0,
        cur_i: 0,
    };
    let fr: &Func = f;
    let mut new_stmts: Vec<(usize, Vec<Stmt>, Option<E>)> = vec![];
    for b in &fr.blocks {
        mt.cur_b = b.id;
        let mut out = Vec::with_capacity(b.stmts.len());
        for (i, s) in b.stmts.iter().enumerate() {
            mt.cur_i = i;
            out.push(x.map_stmt(s, &mut |x, e| {
                rw(x, fr, &mut mt, e, &mut changed, &mut real)
            }));
        }
        mt.cur_i = b.stmts.len();
        let te = term_expr(&b.term).map(|e| rw(x, fr, &mut mt, e, &mut changed, &mut real));
        new_stmts.push((b.id, out, te));
    }
    for (bi, out, te) in new_stmts {
        let b = &mut f.blocks[bi];
        b.stmts = out;
        match (&mut b.term, te) {
            (Term::Br { c, .. }, Some(n)) => *c = n,
            (Term::Ret { e: Some(e) }, Some(n)) => *e = n,
            _ => {}
        }
    }
    (changed, real)
}

fn rw(x: &mut Fx, f: &Func, mt: &mut Matcher, e: E, changed: &mut bool, real: &mut bool) -> E {
    let (mut cand, mut call) = (false, false);
    let ir = &x.ir;
    ir.walk(e, &mut |_, n| match n {
        Node::Call(..) => call = true,
        Node::Bin(op, _, b) => {
            if let Node::Const(v) = ir.get(b) {
                if (op == BinOp::Lshr && v == 56) || (op == BinOp::And && v == 0x1fe) {
                    cand = true
                }
            }
        }
        _ => {}
    });
    if !cand {
        if call {
            *changed = true;
        }
        return e;
    }
    let n = x.map_expr(e, &mut |x, y| mt.rewrite(x, f, y));
    if n != e && !x.expr_eq(n, e) {
        *changed = true;
        *real = true;
    }
    n
}

// ---------- multi-word memory comparisons ----------

fn split_addr(x: &Fx, e: E) -> (E, u64) {
    if let Node::Bin(BinOp::Add, a, b) = x.node(e) {
        if let Some(v) = x.cv(b) {
            return (a, v);
        }
    }
    (e, 0)
}

fn is_pure_expr(x: &mut Fx, e: E) -> bool {
    x.fx(e) == 0 && !x.has_undef(e)
}

fn add_addr(x: &Fx, base: E, off: u64) -> E {
    if off == 0 {
        base
    } else {
        let c = x.c(off);
        x.ir.bin(BinOp::Add, base, c)
    }
}

/// Structural equality of two blocks (statements with pc 0, terminator): sameBody.
fn same_body(x: &Fx, f: &Func, a: usize, b: usize) -> bool {
    let (p, q) = (&f.blocks[a], &f.blocks[b]);
    if p.id == q.id {
        return true;
    }
    p.stmts.len() == q.stmts.len()
        && p.stmts
            .iter()
            .zip(&q.stmts)
            .all(|(s, t)| stmt_json_eq(x, s, t))
        && term_json_eq(x, &p.term, &q.term)
}

fn stmt_json_eq(x: &Fx, s: &Stmt, t: &Stmt) -> bool {
    match (s, t) {
        (Stmt::Set { dst: d1, e: e1, .. }, Stmt::Set { dst: d2, e: e2, .. }) => {
            d1 == d2 && x.json_eq(*e1, *e2)
        }
        (
            Stmt::Store {
                size: s1,
                addr: a1,
                v: v1,
                ..
            },
            Stmt::Store {
                size: s2,
                addr: a2,
                v: v2,
                ..
            },
        ) => s1 == s2 && x.json_eq(*a1, *a2) && x.json_eq(*v1, *v2),
        (
            Stmt::Call {
                dst: d1,
                t: t1,
                args: l1,
                extra: x1,
                ..
            },
            Stmt::Call {
                dst: d2,
                t: t2,
                args: l2,
                extra: x2,
                ..
            },
        ) => {
            d1 == d2
                && (match (t1, t2) {
                    (CallTarget::Ind { e: p }, CallTarget::Ind { e: q }) => x.json_eq(*p, *q),
                    (p, q) => p == q,
                })
                && x.list_json_eq(*l1, *l2)
                && match (x1, x2) {
                    (None, None) => true,
                    (Some(p), Some(q)) => x.list_json_eq(*p, *q),
                    _ => false,
                }
        }
        (Stmt::Eval { e: e1, .. }, Stmt::Eval { e: e2, .. }) => x.json_eq(*e1, *e2),
        (
            Stmt::Stores {
                size: s1,
                addr: a1,
                vals: l1,
                ..
            },
            Stmt::Stores {
                size: s2,
                addr: a2,
                vals: l2,
                ..
            },
        ) => s1 == s2 && x.json_eq(*a1, *a2) && x.list_json_eq(*l1, *l2),
        (
            Stmt::Copy {
                dst: d1,
                src: r1,
                n: n1,
                rev: v1,
                ..
            },
            Stmt::Copy {
                dst: d2,
                src: r2,
                n: n2,
                rev: v2,
                ..
            },
        ) => n1 == n2 && v1 == v2 && x.json_eq(*d1, *d2) && x.json_eq(*r1, *r2),
        (Stmt::Trap { msg: m1, .. }, Stmt::Trap { msg: m2, .. }) => m1 == m2,
        _ => false,
    }
}

fn term_json_eq(x: &Fx, a: &Term, b: &Term) -> bool {
    match (a, b) {
        (
            Term::Br {
                c: c1,
                t: t1,
                f: f1,
            },
            Term::Br {
                c: c2,
                t: t2,
                f: f2,
            },
        ) => t1 == t2 && f1 == f2 && x.json_eq(*c1, *c2),
        (Term::Ret { e: Some(p) }, Term::Ret { e: Some(q) }) => x.json_eq(*p, *q),
        (p, q) => p == q,
    }
}

/// A word compare branch: ld64(p) against ld64(q) or a constant; targets if different / if equal.
struct WordCmp {
    p: E,
    q: Option<E>,
    c: u64,
    differ: usize,
    equal: usize,
}

fn word_compare(x: &mut Fx, f: &Func, b: usize) -> Option<WordCmp> {
    let Term::Br { c, t, f: fl } = f.blocks[b].term else {
        return None;
    };
    let Node::Cmp(op, a, cb) = x.node(c) else {
        return None;
    };
    if !matches!(op, CmpOp::Ne | CmpOp::Eq) || t == fl {
        return None;
    }
    // a word loaded into a variable earlier, with nothing stored since: the same load
    let pa = match x.node(a) {
        Node::Var(id) => loaded_word(x, f, b, id)?,
        Node::Load { size: 8, addr } => addr,
        _ => return None,
    };
    if x.fx(pa) & CALL != 0 {
        return None;
    }
    let (differ, equal) = if op == CmpOp::Ne {
        (t as usize, fl as usize)
    } else {
        (fl as usize, t as usize)
    };
    match x.node(cb) {
        Node::Const(v) => Some(WordCmp {
            p: pa,
            q: None,
            c: v,
            differ,
            equal,
        }),
        Node::Load { size: 8, addr } if x.fx(addr) & CALL == 0 => Some(WordCmp {
            p: pa,
            q: Some(addr),
            c: 0,
            differ,
            equal,
        }),
        _ => None,
    }
}

/// The value of variable v at the end of block b is `ld64(addr)` for the returned addr.
fn loaded_word(x: &mut Fx, f: &Func, b: usize, v: u32) -> Option<E> {
    let mut assigned: Vec<u32> = vec![];
    let mut blk = b;
    for _ in 0..3 {
        let st = &f.blocks[blk].stmts;
        for s in st.iter().rev() {
            if let Stmt::Set { dst, e, .. } = *s {
                if dst == v as i32 {
                    let Node::Load { size: 8, addr } = x.node(e) else {
                        return None;
                    };
                    if x.fx(addr) & CALL != 0 {
                        return None;
                    }
                    let mut ok = true;
                    x.ir.walk(addr, &mut |_, n| match n {
                        Node::Var(id) if assigned.contains(&id) || id == v => ok = false,
                        Node::Undef => ok = false,
                        _ => {}
                    });
                    return ok.then_some(addr);
                }
            }
            let Stmt::Set { dst, e, .. } = *s else {
                return None;
            };
            if x.fx(e) & CALL != 0 {
                return None;
            }
            assigned.push(dst as u32);
        }
        let bb = &f.blocks[blk];
        if bb.preds.len() != 1 || bb.id == 0 {
            return None;
        }
        blk = bb.preds[0];
        if blk == b {
            return None;
        }
    }
    None
}

/// Block d, entered when word 0 of p equals c0, goes straight to a block like e.
fn alt_key_miss(x: &mut Fx, f: &Func, d: usize, p: E, c0: u64, e: usize) -> bool {
    let db = &f.blocks[d];
    if !db.stmts.is_empty() {
        return false;
    }
    let Term::Br { c, f: fl, .. } = db.term else {
        return false;
    };
    if let Node::Fn(name, args) = x.node(c) {
        if x.intr(name) == Intr::Keyeq {
            let k0 = x.ir.at(args, 1);
            return x.expr_eq(x.ir.at(args, 0), p)
                && x.cv(k0).is_some_and(|v| v != c0)
                && same_body(x, f, fl as usize, e);
        }
    }
    match word_compare(x, f, d) {
        Some(w) => w.q.is_none() && w.c != c0 && x.expr_eq(w.p, p) && same_body(x, f, w.differ, e),
        None => false,
    }
}

fn merge_word_compares(x: &mut Fx, f: &mut Func) -> bool {
    let mut changed = false;
    let mut live: Option<(usize, Vec<u32>)> = None;
    for ai in 0..f.blocks.len() {
        let Some(w0) = word_compare(x, f, ai) else {
            continue;
        };
        let err = w0.differ;
        let mut miss = err;
        let w1 = if w0.q.is_none() && f.blocks[w0.equal].preds.len() == 1 {
            word_compare(x, f, w0.equal)
        } else {
            None
        };
        if let Some(w1) = &w1 {
            if w1.q.is_none()
                && !same_body(x, f, w1.differ, err)
                && alt_key_miss(x, f, err, w0.p, w0.c, w1.differ)
            {
                miss = w1.differ;
            }
        }
        let (pb, po) = split_addr(x, w0.p);
        let (qb, qo) = match w0.q {
            Some(q) => {
                let (b, o) = split_addr(x, q);
                (Some(b), o)
            }
            None => (None, 0),
        };
        let mut chain: Vec<usize> = vec![ai];
        let mut consts = vec![w0.c];
        let mut hoist: Vec<Stmt> = vec![];
        let mut err_targets = vec![err];
        let mut ok = w0.equal;
        for k in 1..(if w0.q.is_some() { 8 } else { 4 }) {
            let n = ok;
            let nb = &f.blocks[n];
            if nb.id == 0 || nb.preds.len() != 1 || chain.contains(&n) {
                break;
            }
            let Some(w) = word_compare(x, f, n) else {
                break;
            };
            if w.q.is_none() != w0.q.is_none()
                || chain
                    .iter()
                    .any(|&c| f.blocks[c].id == w.differ || f.blocks[c].id == w.equal)
                || !same_body(x, f, w.differ, miss)
            {
                break;
            }
            let at = |x: &Fx, e: E, base: E, off: u64| {
                let (b, o) = split_addr(x, e);
                x.expr_eq(b, base) && o == off.wrapping_add(8 * k as u64)
            };
            if !at(x, w.p, pb, po) || qb.is_some_and(|qb| !at(x, w.q.unwrap(), qb, qo)) {
                break;
            }
            // statements between compares run before all loads instead (when unobservable)
            let mut errs = err_targets.clone();
            errs.push(w.differ);
            let mut all = true;
            for s in &f.blocks[n].stmts {
                let Stmt::Set { dst, e, .. } = *s else {
                    all = false;
                    break;
                };
                let d = dst as u32;
                let movable = is_pure_expr(x, e)
                    && !x.uses_var(pb, d)
                    && !qb.is_some_and(|qb| x.uses_var(qb, d))
                    && !errs.iter().any(|&eb| {
                        let (w, l) = live.get_or_insert_with(|| live_in_sets(x, f));
                        let i = d as usize;
                        (i >> 5) < *w && (l[eb * *w + (i >> 5)] >> (i & 31)) & 1 != 0
                    });
                if !movable {
                    all = false;
                    break;
                }
            }
            if !all {
                break;
            }
            hoist.extend(f.blocks[n].stmts.iter().cloned());
            chain.push(n);
            consts.push(w.c);
            err_targets.push(w.differ);
            ok = w.equal;
        }
        if chain.len() < 2 || (qb.is_none() && chain.len() != 4) {
            continue;
        }
        let pa = add_addr(x, pb, po);
        let cond = match qb {
            Some(qb) => {
                let qa = add_addr(x, qb, qo);
                let n = x.c(8 * chain.len() as u64);
                x.mk_fn(Intr::Memeq, &[pa, qa, n])
            }
            None => {
                let mut args = vec![pa];
                for &c in &consts {
                    args.push(x.c(c));
                }
                x.mk_fn(Intr::Keyeq, &args)
            }
        };
        for &n in &chain[1..] {
            let Term::Br { t, f: fl, .. } = f.blocks[n].term else {
                unreachable!()
            };
            let nid = f.blocks[n].id;
            for s in [t as usize, fl as usize] {
                let sp = &mut f.blocks[s].preds;
                if let Some(i) = sp.iter().position(|&p| p == nid) {
                    sp.remove(i);
                }
            }
            let nb = &mut f.blocks[n];
            nb.preds = vec![];
            nb.succs = vec![];
            nb.term = dead_trap();
        }
        let aid = f.blocks[ai].id;
        f.blocks[err].preds.retain(|&p| p != aid);
        let a = &mut f.blocks[ai];
        a.stmts.extend(hoist);
        a.term = Term::Br {
            c: cond,
            t: ok as i64,
            f: err as i64,
        };
        a.succs = vec![ok, err];
        f.blocks[ok].preds.push(aid);
        f.blocks[err].preds.push(aid);
        changed = true;
    }
    if changed {
        prune_unreachable(f);
    }
    changed
}

#[allow(dead_code)]
fn _unused(_: &Block) {}
