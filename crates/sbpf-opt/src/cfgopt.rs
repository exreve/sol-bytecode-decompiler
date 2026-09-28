//! `src/cfgopt.ts`: CFG-level transforms on variable IR (tail duplication, jump threading, block
//! merging, local/global constant propagation, copy propagation, dead stores).

use crate::simplify::VarMap;
use crate::*;
use sbpf_ir::{Node, Stmt, Term, E};
use sbpf_program::{Block, Func};

fn is_exitish(f: &Func, b: usize, budget: i64, seen: &mut Vec<usize>) -> i64 {
    let b = &f.blocks[b];
    if seen.contains(&b.id) {
        return -1;
    }
    seen.push(b.id);
    let cost = b.stmts.len() as i64 + 1;
    if cost > budget {
        return -1;
    }
    match b.term {
        Term::Ret { .. } | Term::Trap { .. } => cost,
        Term::Jmp { to } => {
            let rest = is_exitish(f, to as usize, budget - cost, seen);
            if rest < 0 {
                -1
            } else {
                cost + rest
            }
        }
        _ => -1,
    }
}

/// the distinct elements of a (short) list, in first-occurrence order
pub(crate) fn distinct(xs: &[usize]) -> Vec<usize> {
    let mut out: Vec<usize> = vec![];
    for &x in xs {
        if !out.contains(&x) {
            out.push(x);
        }
    }
    out
}

/// Duplicate small blocks that end the function (return/abort) into each predecessor.
pub fn tail_duplicate(f: &mut Func, budget: i64) -> bool {
    let mut changed = false;
    for _ in 0..4 {
        let mut any = false;
        let n0 = f.blocks.len();
        for id in 0..n0 {
            if f.blocks[id].preds.len() < 2 || id == 0 {
                continue;
            }
            if is_exitish(f, id, budget, &mut vec![]) < 0 {
                continue;
            }
            let preds = distinct(&f.blocks[id].preds);
            for &p in &preds[1..] {
                if p == id {
                    continue;
                }
                let b = &f.blocks[id];
                let nid = f.blocks.len();
                let nb = Block {
                    id: nid,
                    start: b.start,
                    end: b.end,
                    stmts: b.stmts.clone(),
                    term: b.term.clone(),
                    succs: b.succs.clone(),
                    preds: vec![p],
                };
                let succs = nb.succs.clone();
                f.blocks.push(nb);
                for s in succs {
                    f.blocks[s].preds.push(nid);
                }
                retarget(&mut f.blocks[p], id, nid);
                f.blocks[id].preds.retain(|&x| x != p);
            }
            any = true;
        }
        if !any {
            break;
        }
        changed = true;
        merge_blocks(f);
    }
    changed
}

/// Jump threading: edges into empty `jmp` blocks go straight to the final target, and a branch whose
/// two edges then coincide becomes a jump (keeping its condition as `eval` if it may trap).
pub fn thread_jumps(x: &mut Fx, f: &mut Func) -> bool {
    let nb = f.blocks.len();
    let mut seen = vec![0u32; nb];
    let mut stamp = 0u32;
    let mut changed = false;
    for bi in 0..nb {
        if f.blocks[bi].succs.is_empty() {
            continue;
        }
        let bid = f.blocks[bi].id;
        for s in distinct(&f.blocks[bi].succs) {
            // final(s)
            stamp += 1;
            let mut b = s;
            loop {
                let bb = &f.blocks[b];
                if bb.id == 0 || !bb.stmts.is_empty() || seen[bb.id] == stamp {
                    break;
                }
                let Term::Jmp { to } = bb.term else { break };
                seen[bb.id] = stamp;
                b = to as usize;
            }
            let bb = f.blocks[b].id;
            let to = if seen[bb] == stamp { s } else { bb };
            if to == s {
                continue;
            }
            retarget(&mut f.blocks[bi], s, to);
            f.blocks[s].preds.retain(|&p| p != bid);
            f.blocks[to].preds.push(bid);
            changed = true;
        }
        if let Term::Br { c, t, f: fl } = f.blocks[bi].term {
            if t == fl {
                let b = &mut f.blocks[bi];
                if x.fx(c) != 0 {
                    let pc = b.stmts.last().map_or(0, stmt_pc);
                    b.stmts.push(Stmt::Eval { e: c, pc });
                }
                b.term = Term::Jmp { to: t };
                b.succs = vec![t as usize];
                let tp = &mut f.blocks[t as usize].preds;
                let i = tp.iter().position(|&p| p == bid);
                let l = tp.iter().rposition(|&p| p == bid);
                if l != i {
                    tp.remove(i.unwrap());
                }
                changed = true;
            }
        }
    }
    if changed {
        prune_unreachable(f);
    }
    changed
}

pub fn stmt_pc(s: &Stmt) -> i64 {
    match s {
        Stmt::Set { pc, .. }
        | Stmt::Store { pc, .. }
        | Stmt::Call { pc, .. }
        | Stmt::Eval { pc, .. }
        | Stmt::Stores { pc, .. }
        | Stmt::Copy { pc, .. }
        | Stmt::Trap { pc, .. } => *pc,
    }
}

pub(crate) fn retarget(pb: &mut Block, from: usize, to: usize) {
    let (fr, t2) = (from as i64, to as i64);
    match &mut pb.term {
        Term::Jmp { to: x } if *x == fr => *x = t2,
        Term::Br { t, f, .. } => {
            if *t == fr {
                *t = t2;
            }
            if *f == fr {
                *f = t2;
            }
        }
        _ => {}
    }
    for s in pb.succs.iter_mut() {
        if *s == from {
            *s = to;
        }
    }
}

/// Merge a block ending in `jmp` into its successor when it is the successor's only predecessor.
pub fn merge_blocks(f: &mut Func) -> bool {
    let mut changed = false;
    for bi in 0..f.blocks.len() {
        while let Term::Jmp { to } = f.blocks[bi].term {
            let si = to as usize;
            let (sid, bid) = (f.blocks[si].id, f.blocks[bi].id);
            if sid == bid || sid == 0 || f.blocks[si].preds.len() != 1 {
                break;
            }
            let s = &mut f.blocks[si];
            let stmts = std::mem::take(&mut s.stmts);
            let term = std::mem::replace(&mut s.term, dead_trap());
            let succs = std::mem::take(&mut s.succs);
            s.preds = vec![];
            for &x in &succs {
                for p in f.blocks[x].preds.iter_mut() {
                    if *p == sid {
                        *p = bid;
                    }
                }
            }
            let b = &mut f.blocks[bi];
            b.stmts.extend(stmts);
            b.term = term;
            b.succs = succs;
            changed = true;
        }
    }
    if changed {
        prune_unreachable(f);
    }
    changed
}

/// Composite expressions that the historical copying substitution rebuilt (see localCopyProp).
fn composite(n: Node) -> bool {
    !matches!(
        n,
        Node::Const(_) | Node::Var(_) | Node::Reg(_) | Node::Undef | Node::Call(..) | Node::Item(_)
    )
}

/// The callbacks of rewriteBlock.
pub(crate) trait Rw {
    fn sub(&mut self, x: &mut Fx, e: E) -> E;
    fn def(&mut self, x: &mut Fx, dst: u32, ns: &Stmt);
    fn same(&mut self, x: &mut Fx, s: &Stmt) -> bool;
}

/// rewriteBlock: rewrites the expressions of every statement of b (in order) with `sub`; `def` is
/// called after each statement that defines a variable; statements `same` vouches for are skipped.
fn rewrite_block(x: &mut Fx, b: &mut Block, rw: &mut impl Rw) {
    for i in 0..b.stmts.len() {
        if rw.same(x, &b.stmts[i]) {
            if let Some(d) = def_of(&b.stmts[i]) {
                let s = b.stmts[i].clone();
                rw.def(x, d, &s);
            }
            continue;
        }
        match b.stmts[i] {
            Stmt::Set { dst, e, pc } => {
                let n = rw.sub(x, e);
                if n != e {
                    b.stmts[i] = Stmt::Set { dst, e: n, pc };
                }
                let s = b.stmts[i].clone();
                rw.def(x, dst as u32, &s);
            }
            Stmt::Store { size, addr, v, pc } => {
                let a2 = rw.sub(x, addr);
                let v2 = rw.sub(x, v);
                if a2 != addr || v2 != v {
                    b.stmts[i] = Stmt::Store {
                        size,
                        addr: a2,
                        v: v2,
                        pc,
                    };
                }
            }
            Stmt::Eval { e, pc } => {
                let n = rw.sub(x, e);
                if n != e {
                    b.stmts[i] = Stmt::Eval { e: n, pc };
                }
            }
            Stmt::Call {
                dst,
                ref t,
                args,
                pc,
                extra,
            } => {
                let t = t.clone();
                let a2 = sub_all(x, args, rw);
                let x2 = extra.map(|l| sub_all(x, l, rw));
                let te = match t {
                    CallTarget::Ind { e } => Some((e, rw.sub(x, e))),
                    _ => None,
                };
                if a2 != args || x2 != extra || te.is_some_and(|(o, n)| o != n) {
                    b.stmts[i] = Stmt::Call {
                        dst,
                        t: match te {
                            Some((_, n)) => CallTarget::Ind { e: n },
                            None => t,
                        },
                        args: a2,
                        pc,
                        extra: x2,
                    };
                }
                if dst >= 0 {
                    let s = b.stmts[i].clone();
                    rw.def(x, dst as u32, &s);
                }
            }
            _ => {}
        }
    }
    match &mut b.term {
        Term::Br { c, .. } => *c = rw.sub(x, *c),
        Term::Ret { e: Some(e) } => *e = rw.sub(x, *e),
        _ => {}
    }
}

fn sub_all(x: &mut Fx, l: sbpf_ir::L, rw: &mut impl Rw) -> sbpf_ir::L {
    let mut out: Option<Vec<E>> = None;
    for k in 0..l.len {
        let a = x.ir.at(l, k);
        let n = rw.sub(x, a);
        if n != a {
            out.get_or_insert_with(|| x.ir.to_vec(l))[k as usize] = n;
        }
    }
    match out {
        Some(v) => x.ir.list(v),
        None => l,
    }
}

/// substConst: substExpr with a lookup function; `e` itself when nothing was substituted (calls are
/// not entered).
fn subst_const(x: &mut Fx, e: E, look: &mut dyn FnMut(&mut Fx, u32) -> Option<E>) -> E {
    match x.node(e) {
        Node::Var(id) => look(x, id).unwrap_or(e),
        Node::Bin(op, a, b) => {
            let (a2, b2) = (subst_const(x, a, look), subst_const(x, b, look));
            if a2 == a && b2 == b {
                e
            } else {
                x.ir.bin(op, a2, b2)
            }
        }
        Node::Cmp(op, a, b) => {
            let (a2, b2) = (subst_const(x, a, look), subst_const(x, b, look));
            if a2 == a && b2 == b {
                e
            } else {
                x.ir.cmp(op, a2, b2)
            }
        }
        Node::Land(a, b) => {
            let (a2, b2) = (subst_const(x, a, look), subst_const(x, b, look));
            if a2 == a && b2 == b {
                e
            } else {
                x.ir.mk(Node::Land(a2, b2))
            }
        }
        Node::Lor(a, b) => {
            let (a2, b2) = (subst_const(x, a, look), subst_const(x, b, look));
            if a2 == a && b2 == b {
                e
            } else {
                x.ir.mk(Node::Lor(a2, b2))
            }
        }
        Node::Neg(a) => {
            let a2 = subst_const(x, a, look);
            if a2 == a {
                e
            } else {
                x.ir.mk(Node::Neg(a2))
            }
        }
        Node::Not(a) => {
            let a2 = subst_const(x, a, look);
            if a2 == a {
                e
            } else {
                x.ir.mk(Node::Not(a2))
            }
        }
        Node::Lnot(a) => {
            let a2 = subst_const(x, a, look);
            if a2 == a {
                e
            } else {
                x.ir.mk(Node::Lnot(a2))
            }
        }
        Node::Ext { signed, bits, a } => {
            let a2 = subst_const(x, a, look);
            if a2 == a {
                e
            } else {
                x.ir.ext(signed, bits, a2)
            }
        }
        Node::Bswap { bits, a } => {
            let a2 = subst_const(x, a, look);
            if a2 == a {
                e
            } else {
                x.ir.mk(Node::Bswap { bits, a: a2 })
            }
        }
        Node::Load { size, addr } => {
            let a2 = subst_const(x, addr, look);
            if a2 == addr {
                e
            } else {
                x.ir.load(size, a2)
            }
        }
        Node::Sel(c, a, b) => {
            let c2 = subst_const(x, c, look);
            let a2 = subst_const(x, a, look);
            let b2 = subst_const(x, b, look);
            if c2 == c && a2 == a && b2 == b {
                e
            } else {
                x.ir.mk(Node::Sel(c2, a2, b2))
            }
        }
        Node::Fn(name, args) => {
            let mut out: Option<Vec<E>> = None;
            for k in 0..args.len {
                let a = x.ir.at(args, k);
                let n = subst_const(x, a, look);
                if n != a {
                    out.get_or_insert_with(|| x.ir.to_vec(args))[k as usize] = n;
                }
            }
            match out {
                Some(v) => {
                    let l = x.ir.list(v);
                    x.ir.mk(Node::Fn(name, l))
                }
                None => e,
            }
        }
        _ => e,
    }
}

// ---------------- local constant propagation ----------------

struct LocalConst {
    m: VarMap,
    changed: bool,
}

impl Rw for LocalConst {
    fn sub(&mut self, x: &mut Fx, e: E) -> E {
        if self.m.n == 0 {
            return e;
        }
        let m = &self.m;
        let n = subst_const(x, e, &mut |_, v| m.get(v));
        if n != e {
            self.changed = true;
        }
        n
    }
    fn def(&mut self, x: &mut Fx, dst: u32, ns: &Stmt) {
        self.m.delete(dst);
        if let Stmt::Set { e, .. } = ns {
            if matches!(x.node(*e), Node::Const(_) | Node::Undef) {
                self.m.set(dst, *e);
            }
        }
    }
    fn same(&mut self, x: &mut Fx, s: &Stmt) -> bool {
        if self.m.n == 0 {
            return true;
        }
        let m = &self.m;
        let mut hit = false;
        x.sinfo(s, |v| hit |= m.has(v));
        !hit
    }
}

/// Within each block: forward-substitute variables currently known to hold a constant.
pub fn local_const_prop(x: &mut Fx, f: &mut Func) -> bool {
    let mut rw = LocalConst {
        m: VarMap::new(f.vars.len()),
        changed: false,
    };
    for b in &mut f.blocks {
        if rw.m.n != 0 {
            rw.m.clear();
        } else if !rw.m.keys.is_empty() {
            rw.m.clear();
        }
        rewrite_block(x, b, &mut rw);
    }
    rw.changed
}

// ---------------- liveness ----------------

/// Least solution of liveIn = gen | (OR of the successors' liveIn) & ~kill (rows of W words).
fn solve_live_in(f: &Func, w: usize, gen: &[u32], kill: &[u32]) -> Vec<u32> {
    let nb = f.blocks.len();
    let mut live_in = gen.to_vec();
    let mut u_start = vec![0usize; nb + 1];
    for b in &f.blocks {
        for &s in &b.succs {
            u_start[s + 1] += 1;
        }
    }
    for i in 0..nb {
        u_start[i + 1] += u_start[i];
    }
    let mut users = vec![0usize; u_start[nb]];
    let mut fill = u_start[..nb].to_vec();
    for b in &f.blocks {
        for &s in &b.succs {
            users[fill[s]] = b.id;
            fill[s] += 1;
        }
    }
    let mut stack: Vec<(usize, usize)> = vec![];
    for b in 0..nb {
        for k in 0..w {
            let mut x = gen[b * w + k];
            while x != 0 {
                let t = x.trailing_zeros() as usize;
                stack.push((b, k * 32 + t));
                x &= x - 1;
            }
        }
    }
    while let Some((b, v)) = stack.pop() {
        let (k, m) = (v >> 5, 1u32 << (v & 31));
        for &u in &users[u_start[b]..u_start[b + 1]] {
            let i = u * w + k;
            if kill[i] & m == 0 && live_in[i] & m == 0 {
                live_in[i] |= m;
                stack.push((u, v));
            }
        }
    }
    live_in
}

struct GenKill {
    w: usize,
    ix: Option<Vec<i32>>,
    gen: Vec<u32>,
    kill: Vec<u32>,
}

fn gen_kill(x: &mut Fx, f: &Func, compact: bool) -> GenKill {
    let nb = f.blocks.len();
    let mut ix: Option<Vec<i32>> = None;
    let mut n = f.vars.len();
    if compact {
        let mut m = vec![-1i32; f.vars.len()];
        let mut k = 0i32;
        for b in &f.blocks {
            for s in &b.stmts {
                x.sinfo(s, |v| {
                    if m[v as usize] < 0 {
                        m[v as usize] = k;
                        k += 1;
                    }
                });
                if let Some(d) = def_of(s) {
                    if m[d as usize] < 0 {
                        m[d as usize] = k;
                        k += 1;
                    }
                }
            }
            if let Some(te) = term_expr(&b.term) {
                x.evars(te, |v| {
                    if m[v as usize] < 0 {
                        m[v as usize] = k;
                        k += 1;
                    }
                });
            }
        }
        n = k as usize;
        ix = Some(m);
    }
    let w = n.div_ceil(32);
    let mut gen = vec![0u32; nb * w];
    let mut kill = vec![0u32; nb * w];
    let idx = |v: u32| match &ix {
        Some(m) => m[v as usize] as usize,
        None => v as usize,
    };
    for id in 0..nb {
        let b = &f.blocks[id];
        let base = id * w;
        if let Some(te) = term_expr(&b.term) {
            x.evars(te, |v| {
                let i = idx(v);
                gen[base + (i >> 5)] |= 1 << (i & 31);
            });
        }
        for s in b.stmts.iter().rev() {
            if let Some(d) = def_of(s) {
                let d = idx(d);
                gen[base + (d >> 5)] &= !(1 << (d & 31));
                kill[base + (d >> 5)] |= 1 << (d & 31);
            }
            x.sinfo(s, |v| {
                let i = idx(v);
                gen[base + (i >> 5)] |= 1 << (i & 31);
            });
        }
    }
    GenKill { w, ix, gen, kill }
}

/// Variables live at the entry of each block: rows of W words (bit = variable id).
pub fn live_in_sets(x: &mut Fx, f: &Func) -> (usize, Vec<u32>) {
    let gk = gen_kill(x, f, false);
    let li = solve_live_in(f, gk.w, &gk.gen, &gk.kill);
    (gk.w, li)
}

/// Backward variable liveness; removes dead pure assignments (multi-def variables included).
pub fn dead_stores(x: &mut Fx, f: &mut Func) -> bool {
    let gk = gen_kill(x, f, true);
    let w = gk.w;
    let live_in = solve_live_in(f, w, &gk.gen, &gk.kill);
    let ix = gk.ix.unwrap();
    let mut live = vec![0u32; w];
    let mut any = false;
    for bi in 0..f.blocks.len() {
        live.fill(0);
        for &s in &f.blocks[bi].succs {
            for k in 0..w {
                live[k] |= live_in[s * w + k];
            }
        }
        let b = &mut f.blocks[bi];
        if let Some(te) = term_expr(&b.term) {
            x.evars(te, |v| {
                let i = ix[v as usize] as usize;
                live[i >> 5] |= 1 << (i & 31);
            });
        }
        let has = |live: &[u32], v: u32| {
            let i = ix[v as usize] as usize;
            (live[i >> 5] >> (i & 31)) & 1 != 0
        };
        let mut i = b.stmts.len();
        while i > 0 {
            i -= 1;
            let set_uses = |x: &mut Fx, s: &Stmt, live: &mut [u32]| {
                x.sinfo(s, |v| {
                    let i = ix[v as usize] as usize;
                    live[i >> 5] |= 1 << (i & 31);
                });
            };
            match b.stmts[i] {
                Stmt::Set { dst, e, pc } => {
                    if !has(&live, dst as u32) {
                        if x.fx(e) != 0 {
                            let s = b.stmts[i].clone();
                            b.stmts[i] = Stmt::Eval { e, pc };
                            set_uses(x, &s, &mut live);
                        } else {
                            b.stmts.remove(i);
                        }
                        any = true;
                        continue;
                    }
                    let d = ix[dst as usize] as usize;
                    live[d >> 5] &= !(1 << (d & 31));
                    let s = b.stmts[i].clone();
                    set_uses(x, &s, &mut live);
                }
                Stmt::Call { dst, .. } => {
                    if dst >= 0 {
                        if !has(&live, dst as u32) {
                            if let Stmt::Call { dst, .. } = &mut b.stmts[i] {
                                *dst = -1;
                            }
                            any = true;
                        } else {
                            let d = ix[dst as usize] as usize;
                            live[d >> 5] &= !(1 << (d & 31));
                        }
                    }
                    let s = b.stmts[i].clone();
                    set_uses(x, &s, &mut live);
                }
                _ => {
                    let s = b.stmts[i].clone();
                    set_uses(x, &s, &mut live);
                }
            }
        }
    }
    any
}

// ---------------- global constant propagation ----------------

struct GlobalConst<'a> {
    slot: &'a [i32],
    cval: &'a [u64],
    inn: &'a [i32],
    r0: usize,
    /// block-local overrides: None = not set, Some(None) = no longer known, Some(Some(e)) = constant
    loc: Vec<Option<Option<E>>>,
    touched: Vec<u32>,
    changed: bool,
}

impl GlobalConst<'_> {
    fn look(&self, x: &mut Fx, v: u32) -> Option<E> {
        if let Some(l) = self.loc[v as usize] {
            return l;
        }
        let k = self.slot[v as usize];
        if k >= 0 && self.inn[self.r0 + k as usize] >= 0 {
            Some(x.c(self.cval[self.inn[self.r0 + k as usize] as usize]))
        } else {
            None
        }
    }
    fn known(&self, v: u32) -> bool {
        if let Some(l) = self.loc[v as usize] {
            return l.is_some();
        }
        let k = self.slot[v as usize];
        k >= 0 && self.inn[self.r0 + k as usize] >= 0
    }
}

impl Rw for GlobalConst<'_> {
    fn sub(&mut self, x: &mut Fx, e: E) -> E {
        let n = subst_const(x, e, &mut |x, v| self.look(x, v));
        if n != e {
            self.changed = true;
        }
        n
    }
    fn def(&mut self, x: &mut Fx, dst: u32, ns: &Stmt) {
        let v = match ns {
            Stmt::Set { e, .. } if matches!(x.node(*e), Node::Const(_)) => Some(*e),
            _ => None,
        };
        if self.loc[dst as usize].is_none() {
            self.touched.push(dst);
        }
        self.loc[dst as usize] = Some(v);
    }
    fn same(&mut self, x: &mut Fx, s: &Stmt) -> bool {
        let mut hit = false;
        x.sinfo(s, |v| hit |= self.known(v));
        !hit
    }
}

/// Global constant propagation over (possibly multi-definition) variables.
pub fn global_const_prop(x: &mut Fx, f: &mut Func) -> bool {
    const ABSENT: i32 = -1;
    const VARY: i32 = -2;
    let nb = f.blocks.len();
    let nv = f.vars.len();
    let mut slot = vec![-1i32; nv];
    let mut slot_var: Vec<u32> = vec![];
    let mut cval: Vec<u64> = vec![];
    let mut cid_of: sbpf_ir::fx::HashMap<u64, i32> = sbpf_ir::fx::HashMap::default();
    for b in &f.blocks {
        for s in &b.stmts {
            if let Stmt::Set { dst, e, .. } = s {
                if x.cv(*e).is_some() && slot[*dst as usize] < 0 {
                    slot[*dst as usize] = slot_var.len() as i32;
                    slot_var.push(*dst as u32);
                }
            }
        }
    }
    let kk = slot_var.len();
    if kk == 0 {
        return false;
    }
    let mut g: Vec<i32> = vec![];
    let mut g_start = vec![0usize; nb + 1];
    for id in 0..nb {
        for s in &f.blocks[id].stmts {
            match s {
                Stmt::Set { dst, e, .. } => {
                    let k = slot[*dst as usize];
                    if k >= 0 {
                        let val = match x.cv(*e) {
                            Some(v) => *cid_of.entry(v).or_insert_with(|| {
                                cval.push(v);
                                cval.len() as i32 - 1
                            }),
                            None => VARY,
                        };
                        g.push(k);
                        g.push(val);
                    }
                }
                Stmt::Call { dst, .. } if *dst >= 0 => {
                    let k = slot[*dst as usize];
                    if k >= 0 {
                        g.push(k);
                        g.push(VARY);
                    }
                }
                _ => {}
            }
        }
        g_start[id + 1] = g.len();
    }
    let mut entry = vec![ABSENT; kk];
    for v in &f.vars {
        if v.param >= 0 && slot[v.id as usize] >= 0 {
            entry[slot[v.id as usize] as usize] = VARY;
        }
    }
    let mut inn_all = vec![0i32; nb * kk];
    let mut out_all = vec![0i32; nb * kk];
    let mut has_in = vec![false; nb];
    let mut has_out = vec![false; nb];
    inn_all[..kk].copy_from_slice(&entry);
    has_in[0] = true;
    // reverse postorder of a depth-first walk along successors
    let mut order: Vec<usize> = Vec::with_capacity(nb);
    {
        let mut seen = vec![false; nb];
        let mut st: Vec<(usize, usize)> = vec![(0, 0)];
        seen[0] = true;
        while let Some(top) = st.last_mut() {
            let b = &f.blocks[top.0];
            if top.1 < b.succs.len() {
                let s = b.succs[top.1];
                top.1 += 1;
                if !seen[s] {
                    seen[s] = true;
                    st.push((s, 0));
                }
            } else {
                order.push(top.0);
                st.pop();
            }
        }
        order.reverse();
    }
    let mut inn = vec![0i32; kk];
    let mut out = vec![0i32; kk];
    let mut d_start = vec![0usize; nb + 1];
    for b in &f.blocks {
        for &p in &b.preds {
            d_start[p + 1] += 1;
        }
    }
    for i in 0..nb {
        d_start[i + 1] += d_start[i];
    }
    let mut dep = vec![0usize; d_start[nb]];
    let mut d_fill = d_start[..nb].to_vec();
    for b in &f.blocks {
        for &p in &b.preds {
            dep[d_fill[p]] = b.id;
            d_fill[p] += 1;
        }
    }
    let mut dirty = vec![true; nb];
    let mut changed = true;
    let mut it = 0;
    while changed && it < 50 {
        changed = false;
        for &id in &order {
            if !dirty[id] {
                continue;
            }
            dirty[id] = false;
            let b = &f.blocks[id];
            let mut any = false;
            if id == 0 {
                inn.copy_from_slice(&entry);
                any = true;
            }
            for &p in &b.preds {
                if !has_out[p] {
                    continue;
                }
                let o = p * kk;
                if any {
                    for k in 0..kk {
                        if inn[k] != out_all[o + k] {
                            inn[k] = VARY;
                        }
                    }
                } else {
                    inn.copy_from_slice(&out_all[o..o + kk]);
                    any = true;
                }
            }
            if !any {
                continue;
            }
            out.copy_from_slice(&inn);
            let mut i = g_start[id];
            while i < g_start[id + 1] {
                out[g[i] as usize] = g[i + 1];
                i += 2;
            }
            let r = id * kk;
            let same = has_out[id] && out_all[r..r + kk] == out[..];
            if !same {
                out_all[r..r + kk].copy_from_slice(&out);
                has_out[id] = true;
                changed = true;
                for &d in &dep[d_start[id]..d_start[id + 1]] {
                    dirty[d] = true;
                }
            }
            inn_all[r..r + kk].copy_from_slice(&inn);
            has_in[id] = true;
        }
        it += 1;
    }
    let mut rw = GlobalConst {
        slot: &slot,
        cval: &cval,
        inn: &inn_all,
        r0: 0,
        loc: vec![None; nv],
        touched: vec![],
        changed: false,
    };
    for b in &mut f.blocks {
        if !has_in[b.id] {
            continue;
        }
        let r0 = b.id * kk;
        let mut any = inn_all[r0..r0 + kk].iter().any(|&v| v >= 0);
        let mut i = g_start[b.id] + 1;
        while i < g_start[b.id + 1] && !any {
            if g[i] >= 0 {
                any = true;
            }
            i += 2;
        }
        if !any {
            continue;
        }
        rw.r0 = r0;
        for &v in &rw.touched {
            rw.loc[v as usize] = None;
        }
        rw.touched.clear();
        rewrite_block(x, b, &mut rw);
    }
    rw.changed
}

// ---------------- local copy propagation ----------------

struct CopyProp {
    m: VarMap,
    /// copiesOf[y]: the variables k with m[k] = y (insertion-ordered set)
    copies_of: Vec<Vec<u32>>,
    touched: Vec<u32>,
    changed: bool,
    real: bool,
}

impl CopyProp {
    fn del(&mut self, x: &Fx, k: u32) {
        if let Some(e) = self.m.get(k) {
            self.m.delete(k);
            if let Node::Var(y) = x.node(e) {
                self.copies_of[y as usize].retain(|&z| z != k);
            }
        }
    }
    fn kill_var(&mut self, x: &Fx, v: u32) {
        self.del(x, v);
        let ks = std::mem::take(&mut self.copies_of[v as usize]);
        for k in ks {
            self.m.delete(k);
        }
    }
}

impl Rw for CopyProp {
    fn sub(&mut self, x: &mut Fx, e: E) -> E {
        if self.m.n == 0 {
            return e;
        }
        let n = x.node(e);
        if composite(n) || matches!(n, Node::Var(id) if self.m.has(id)) {
            self.changed = true;
        }
        let m = &self.m;
        let r = subst_const(x, e, &mut |_, v| m.get(v));
        if r != e {
            self.real = true;
        }
        r
    }
    fn def(&mut self, x: &mut Fx, dst: u32, ns: &Stmt) {
        self.kill_var(x, dst);
        if let Stmt::Set { e, .. } = ns {
            if let Node::Var(y) = x.node(*e) {
                if y != dst {
                    self.m.set(dst, *e);
                    let ks = &mut self.copies_of[y as usize];
                    if ks.is_empty() {
                        self.touched.push(y);
                    }
                    if !ks.contains(&dst) {
                        ks.push(dst);
                    }
                }
            }
        }
    }
    fn same(&mut self, x: &mut Fx, s: &Stmt) -> bool {
        if self.m.n == 0 {
            return true;
        }
        let m = &self.m;
        let mut hit = false;
        x.sinfo(s, |v| hit |= m.has(v));
        if hit {
            return false;
        }
        if !self.changed {
            self.changed = top_composite(x, s);
        }
        true
    }
}

/// Block-local copy propagation: after `x = y`, uses of x become y until x or y is reassigned.
pub fn local_copy_prop(x: &mut Fx, f: &mut Func, real: &mut bool) -> bool {
    let nv = f.vars.len();
    let mut rw = CopyProp {
        m: VarMap::new(nv),
        copies_of: vec![vec![]; nv],
        touched: vec![],
        changed: false,
        real: false,
    };
    for b in &mut f.blocks {
        rw.m.clear();
        for &y in &rw.touched {
            rw.copies_of[y as usize].clear();
        }
        rw.touched.clear();
        rewrite_block(x, b, &mut rw);
    }
    *real |= rw.real;
    rw.changed
}

/// Some expression rewriteBlock passes to `sub` for this statement is composite.
fn top_composite(x: &Fx, s: &Stmt) -> bool {
    match s {
        Stmt::Set { e, .. } | Stmt::Eval { e, .. } => composite(x.node(*e)),
        Stmt::Store { addr, v, .. } => composite(x.node(*addr)) || composite(x.node(*v)),
        Stmt::Call { args, extra, t, .. } => {
            x.ir.items(*args).any(|e| composite(x.node(e)))
                || extra.is_some_and(|l| x.ir.items(l).any(|e| composite(x.node(e))))
                || matches!(t, CallTarget::Ind { e } if composite(x.node(*e)))
        }
        _ => false,
    }
}
