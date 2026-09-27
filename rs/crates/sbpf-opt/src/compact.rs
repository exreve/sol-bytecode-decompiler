//! `src/compact.ts`: final exact compaction of statement runs (sinkFrameLoads, compactStores).
//! Offsets are `bigint` in TS (unbounded): i128 here.

use crate::*;
use sbpf_ir::{BinOp, Node, Stmt, Term, E};
use sbpf_program::Func;

fn base_off(x: &Fx, e: E) -> (E, i128) {
    if let Node::Bin(BinOp::Add, a, b) = x.node(e) {
        if let Some(v) = x.cv(b) {
            return (a, v as i64 as i128);
        }
    }
    (e, 0)
}

fn mk(x: &Fx, base: E, off: i128) -> E {
    if off == 0 {
        base
    } else {
        let c = x.c(off as u64);
        x.ir.bin(BinOp::Add, base, c)
    }
}

fn fp_of(f: &Func) -> Option<u32> {
    f.vars.iter().find(|v| v.param == 10).map(|v| v.id)
}

fn is_var(x: &Fx, e: E, v: u32) -> bool {
    x.node(e) == Node::Var(v)
}

/// Move `v = <loads of the own frame>` down to the one use of v in its block (see compact.ts).
pub fn sink_frame_loads(x: &mut Fx, f: &mut Func) {
    let Some(fp) = fp_of(f) else { return };
    let mut defd = vec![false; f.vars.len()];
    for b in &f.blocks {
        for s in &b.stmts {
            if let Some(d) = def_of(s) {
                defd[d as usize] = true;
            }
        }
    }
    let vars = f.vars.clone();
    // parameters never reassigned: addresses the caller passed (never into this function's frame)
    let param = |x: &Fx, e: E| match x.node(e) {
        Node::Var(id) => {
            id != fp
                && vars.get(id as usize).is_some_and(|v| {
                    (v.param >= 1 && v.param <= 5) || v.param >= 100
                })
                && !defd[id as usize]
        }
        _ => false,
    };
    // frame byte ranges read by e, when its only memory reads are loads of the own frame
    let frame_reads = |x: &mut Fx, e: E| -> Option<Vec<(i128, i128)>> {
        if x.fx(e) & CALL != 0 {
            return None;
        }
        let mut r = vec![];
        let mut ok = true;
        let mut nodes = vec![];
        x.ir.walk(e, &mut |_, n| nodes.push(n));
        for n in nodes {
            match n {
                Node::Fn(name, _) if x.intr(name).is_mem() => ok = false,
                Node::Bin(op, _, b) if is_div_op(op) && !x.safe_divisor(op, b) => ok = false,
                Node::Load { size, addr } => {
                    let (lb, lo) = base_off(x, addr);
                    if !(is_var(x, lb, fp) && lo >= -0x1000 && lo + size as i128 <= 0) {
                        ok = false
                    } else {
                        r.push((lo, lo + size as i128))
                    }
                }
                _ => {}
            }
        }
        (ok && !r.is_empty()).then_some(r)
    };
    for bi in 0..f.blocks.len() {
        let ends = matches!(f.blocks[bi].term, Term::Ret { .. } | Term::Trap { .. });
        let mut i = 0usize;
        while i < f.blocks[bi].stmts.len() {
            let b = &f.blocks[bi];
            let Stmt::Set { dst, e: se, .. } = b.stmts[i] else {
                i += 1;
                continue;
            };
            let sd = dst as u32;
            if x.fx(se) & LOAD == 0 || vars.get(sd as usize).is_some_and(|v| v.param >= 0) {
                i += 1;
                continue;
            }
            let Some(rd) = frame_reads(x, se) else {
                i += 1;
                continue;
            };
            let mut reads: Vec<u32> = vec![];
            x.evars(se, |v| reads.push(v));
            let mut at: isize = -1;
            for j in i + 1..b.stmts.len() {
                let t = &b.stmts[j];
                let n = x.count_in(t, sd);
                if n != 0 {
                    at = if n == 1 { j as isize } else { -1 };
                    break;
                }
                if let Stmt::Set { dst, .. } | Stmt::Call { dst, .. } = t {
                    if *dst == dst_i(sd) || (*dst >= 0 && reads.contains(&(*dst as u32))) {
                        break;
                    }
                }
                if matches!(t, Stmt::Call { .. } | Stmt::Trap { .. }) || x.sflags(t) & CALL != 0 {
                    break;
                }
                let (db, dof, w) = match *t {
                    Stmt::Store { addr, size, .. } => {
                        let (db, dof) = base_off(x, addr);
                        (db, dof, size as i128)
                    }
                    Stmt::Stores {
                        addr, size, vals, ..
                    } => {
                        let (db, dof) = base_off(x, addr);
                        (db, dof, size as i128 * vals.len as i128)
                    }
                    Stmt::Copy { dst, n, .. } => {
                        let (db, dof) = base_off(x, dst);
                        (db, dof, n as i128)
                    }
                    _ => continue,
                };
                if param(x, db) {
                    continue;
                }
                if !is_var(x, db, fp) || rd.iter().any(|&(lo, hi)| dof < hi && lo < dof + w) {
                    break;
                }
            }
            if at < 0 {
                i += 1;
                continue;
            }
            let at = at as usize;
            // the value must be dead after its use
            let mut dead = false;
            let u = b.stmts[at].clone();
            if let Stmt::Set { dst, .. } | Stmt::Call { dst, .. } = u {
                if dst == dst_i(sd) {
                    dead = true;
                }
            }
            let mut k = at + 1;
            while k < b.stmts.len() && !dead {
                let t = &b.stmts[k];
                if x.count_in(t, sd) != 0 {
                    break;
                }
                if let Stmt::Set { dst, .. } | Stmt::Call { dst, .. } = t {
                    if *dst == dst_i(sd) {
                        dead = true;
                    }
                }
                k += 1;
            }
            if !dead && ends {
                dead = true;
                for k in at + 1..b.stmts.len() {
                    if x.count_in(&b.stmts[k], sd) != 0 {
                        dead = false;
                    }
                }
                if let Some(te) = term_expr(&b.term) {
                    if x.uses_var(te, sd) {
                        dead = false;
                    }
                }
            }
            if !dead {
                i += 1;
                continue;
            }
            let ns = x.map_stmt(&u, &mut |x, e| {
                x.map_expr(e, &mut |x, y| if is_var(x, y, sd) { se } else { y })
            });
            let b = &mut f.blocks[bi];
            b.stmts[at] = ns;
            b.stmts.remove(i);
        }
    }
}

#[inline]
fn dst_i(v: u32) -> i32 {
    v as i32
}

pub fn compact_stores(x: &mut Fx, f: &mut Func) {
    let fp = fp_of(f);
    let is_fp = |x: &Fx, b: E| fp.is_some_and(|fp| is_var(x, b, fp));
    for bi in 0..f.blocks.len() {
        let st = std::mem::take(&mut f.blocks[bi].stmts);
        let mut out: Vec<Stmt> = vec![];
        let mut i = 0;
        while i < st.len() {
            let s = &st[i];
            // a load from the own frame [fp - 0x1000, fp) cannot fault: evaluating it is a no-op
            if let Stmt::Eval { e, .. } = *s {
                if let Node::Load { size, addr } = x.node(e) {
                    let (lb, lo) = base_off(x, addr);
                    if is_fp(x, lb) && lo >= -0x1000 && lo + size as i128 <= 0 {
                        i += 1;
                        continue;
                    }
                }
            }
            let Stmt::Store { addr, .. } = *s else {
                out.push(s.clone());
                i += 1;
                continue;
            };
            let (db, _) = base_off(x, addr);
            // maximal window of stores with the same destination base
            let mut j = i + 1;
            while j < st.len() {
                let Stmt::Store { addr, .. } = st[j] else { break };
                if !x.expr_eq(base_off(x, addr).0, db) {
                    break;
                }
                j += 1;
            }
            let win: Vec<Store> = st[i..j].iter().map(Store::of).collect();
            let frame = is_fp(x, db);
            let win = if frame {
                gather_frame(x, win, fp.unwrap())
            } else {
                win
            };
            out.extend(compact_window(x, &win, frame));
            i = j;
        }
        // `void ldN(p)` right before a branch whose condition first loads the same bytes
        if let (Some(Stmt::Eval { e, .. }), Term::Br { c, .. }) = (out.last(), &f.blocks[bi].term)
        {
            if let Node::Load { size, addr } = x.node(*e) {
                if let Some((fs, fa)) = first_load(x, *c) {
                    if fs >= size && x.expr_eq(fa, addr) {
                        out.pop();
                    }
                }
            }
        }
        f.blocks[bi].stmts = out;
    }
}

#[derive(Clone, Copy)]
struct Store {
    size: u8,
    addr: E,
    v: E,
    pc: i64,
}

impl Store {
    fn of(s: &Stmt) -> Store {
        match *s {
            Stmt::Store { size, addr, v, pc } => Store { size, addr, v, pc },
            _ => unreachable!(),
        }
    }
    fn stmt(self) -> Stmt {
        Stmt::Store {
            size: self.size,
            addr: self.addr,
            v: self.v,
            pc: self.pc,
        }
    }
}

/// The load an expression performs first, when nothing before it can trap or have effects:
/// (size, addr).
fn first_load(x: &mut Fx, e: E) -> Option<(u8, E)> {
    match x.node(e) {
        Node::Load { size, addr } => {
            if x.is_pure(addr) {
                Some((size, addr))
            } else {
                first_load(x, addr)
            }
        }
        Node::Cmp(_, a, b) | Node::Bin(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
            if x.is_pure(a) {
                first_load(x, b)
            } else {
                first_load(x, a)
            }
        }
        Node::Ext { a, .. } | Node::Lnot(a) | Node::Not(a) | Node::Neg(a) | Node::Bswap { a, .. } => {
            first_load(x, a)
        }
        Node::Fn(name, args) => {
            let n = x.intr(name);
            let ok = n == Intr::Keyeq
                || (n == Intr::Memeq
                    && args.len > 2
                    && x.cv(x.ir.at(args, 2)).is_some_and(|v| v > 0));
            if ok && (0..args.len).all(|k| x.is_pure(x.ir.at(args, k))) {
                return Some((8, x.ir.at(args, 0)));
            }
            None
        }
        _ => None,
    }
}

struct Info {
    o: i128,
    hi: i128,
    call: bool,
    fault: bool,
    reads: Vec<(i128, i128)>,
    own: bool,
}

fn overlaps(r: &[(i128, i128)], lo: i128, hi: i128) -> bool {
    r.iter().any(|&(a, b)| a < hi && lo < b)
}

/// Frame stores reordered so that stores extending one contiguous range come together.
fn gather_frame(x: &mut Fx, win: Vec<Store>, fp: u32) -> Vec<Store> {
    if win.len() < 3 {
        return win;
    }
    {
        let mut lo = base_off(x, win[0].addr).1;
        let mut hi = lo + win[0].size as i128;
        let mut ok = true;
        for s in &win[1..] {
            if !ok {
                break;
            }
            let o = base_off(x, s.addr).1;
            let e = o + s.size as i128;
            if e == lo {
                lo = o;
            } else if o == hi {
                hi = e;
            } else {
                ok = false;
            }
        }
        if ok {
            return win;
        }
    }
    let info: Vec<Info> = win
        .iter()
        .map(|s| {
            let o = base_off(x, s.addr).1;
            let fx = x.fx(s.v);
            let mut reads = vec![];
            let mut far = false;
            let mut loads = vec![];
            x.ir.walk(s.v, &mut |_, n| {
                if let Node::Load { size, addr } = n {
                    loads.push((size, addr))
                }
            });
            for (size, addr) in loads {
                let (b, lo) = base_off(x, addr);
                if is_var(x, b, fp) && lo >= -0x1000 && lo + size as i128 <= 0 {
                    reads.push((lo, lo + size as i128));
                } else {
                    far = true;
                }
            }
            let own = o >= -0x1000 && o + s.size as i128 <= 0;
            Info {
                o,
                hi: o + s.size as i128,
                call: fx & CALL != 0,
                fault: far || (fx & TRAP != 0 && fx & LOAD == 0),
                reads,
                own,
            }
        })
        .collect();
    let movable = |j: usize, m: usize| {
        let (a, b) = (&info[j], &info[m]);
        a.own
            && b.own
            && !a.call
            && !b.call
            && !(a.fault && b.fault)
            && (a.hi <= b.o || b.hi <= a.o)
            && !overlaps(&a.reads, b.o, b.hi)
            && !overlaps(&b.reads, a.o, a.hi)
    };
    let mut used = vec![false; win.len()];
    let mut out: Vec<Store> = vec![];
    for k in 0..win.len() {
        if used[k] {
            continue;
        }
        let mut cl = vec![k];
        let mut skipped: Vec<usize> = vec![];
        let (mut lo, mut hi) = (info[k].o, info[k].hi);
        for j in k + 1..win.len() {
            if used[j] {
                continue;
            }
            let xi = &info[j];
            if win[j].size == win[k].size
                && (xi.o == hi || xi.hi == lo)
                && skipped.iter().all(|&m| movable(j, m))
            {
                cl.push(j);
                lo = lo.min(xi.o);
                hi = hi.max(xi.hi);
            } else {
                skipped.push(j);
            }
        }
        let run: Vec<Store> = cl.iter().map(|&i| win[i]).collect();
        if cl.len() < 2 || try_run(x, &run, true).is_none() {
            used[k] = true;
            out.push(win[k]);
            continue;
        }
        for &i in &cl {
            used[i] = true;
            out.push(win[i]);
        }
    }
    out
}

/// Compact a window of consecutive stores that share a base address expression.
fn compact_window(x: &mut Fx, win: &[Store], frame: bool) -> Vec<Stmt> {
    let mut out = vec![];
    let offs: Vec<i128> = win.iter().map(|s| base_off(x, s.addr).1).collect();
    let base_pure = !win.is_empty() && {
        let b = base_off(x, win[0].addr).0;
        x.is_pure(b)
    };
    let mut k = 0;
    while k < win.len() {
        let mut best: Option<(usize, Stmt)> = None;
        let mut lim = if base_pure { win.len() - k } else { 0 };
        {
            let size = win[k].size;
            let sz = size as i128;
            let o0 = offs[k];
            let mut seen = vec![o0];
            let down = !frame && k + 1 < win.len() && offs[k + 1] < o0;
            for i in k + 1..k + lim {
                let o = offs[i];
                if win[i].size != size
                    || (o - o0) % sz != 0
                    || seen.contains(&o)
                    || (!frame && (if down { o >= offs[i - 1] } else { o <= offs[i - 1] }))
                {
                    lim = i - k;
                    break;
                }
                seen.push(o);
            }
        }
        let (mut lo, mut hi) = (offs[k], offs[k]);
        let mut span = vec![false; lim + 1];
        for n in 1..=lim {
            let o = offs[k + n - 1];
            lo = lo.min(o);
            hi = hi.max(o);
            span[n] = hi - lo == (n as i128 - 1) * win[k].size as i128;
        }
        let mut n = lim;
        while n >= 2 {
            if span[n] {
                if let Some(r) = try_run(x, &win[k..k + n], frame) {
                    best = Some((n, r));
                    break;
                }
            }
            n -= 1;
        }
        match best {
            Some((n, st)) => {
                out.push(st);
                k += n;
            }
            None => {
                out.push(win[k].stmt());
                k += 1;
            }
        }
    }
    out
}

fn try_run(x: &mut Fx, ss: &[Store], mut frame: bool) -> Option<Stmt> {
    let (base, _) = base_off(x, ss[0].addr);
    let size = ss[0].size;
    if !x.is_pure(base) {
        return None;
    }
    let offs: Vec<i128> = ss.iter().map(|s| base_off(x, s.addr).1).collect();
    if ss.iter().any(|s| s.size != size) {
        return None;
    }
    let sz = size as i128;
    // only the function's own frame [fp - 0x1000, fp) is private and never faults
    if frame && offs.iter().any(|&o| o < -0x1000 || o + sz > 0) {
        frame = false;
    }
    let mut order: Vec<usize> = (0..ss.len()).collect();
    order.sort_by(|&a, &b| offs[a].cmp(&offs[b]));
    let ascending = order.iter().enumerate().all(|(i, &v)| v == i);
    let n = order.len();
    let descending_order = order.iter().enumerate().all(|(i, &v)| v == n - 1 - i);
    let all_word_loads = size == 8
        && ss
            .iter()
            .all(|s| matches!(x.node(s.v), Node::Load { size: 8, .. }));
    let descending_copy = !ascending && descending_order && all_word_loads;
    if !ascending && !frame && !descending_copy {
        return None;
    }
    for i in 1..n {
        if offs[order[i]] != offs[order[i - 1]] + sz {
            return None;
        }
    }
    let lo = offs[order[0]];
    // copy run
    if all_word_loads {
        let srcs: Vec<(E, i128)> = ss
            .iter()
            .map(|s| match x.node(s.v) {
                Node::Load { addr, .. } => base_off(x, addr),
                _ => unreachable!(),
            })
            .collect();
        let sb = srcs[0].0;
        if x.is_pure(sb)
            && srcs
                .iter()
                .enumerate()
                .all(|(i, &(b2, o))| x.expr_eq(b2, sb) && o - offs[i] == srcs[0].1 - offs[0])
        {
            let slo = srcs[0].1 - offs[0] + lo;
            let nb = n as i128 * 8;
            let pc = ss[0].pc;
            if ascending {
                let (d, s) = (mk(x, base, lo), mk(x, sb, slo));
                return Some(Stmt::Copy {
                    dst: d,
                    src: s,
                    n: n as u64 * 8,
                    pc,
                    rev: None,
                });
            }
            if descending_order {
                let (d, s) = (mk(x, base, lo), mk(x, sb, slo));
                return Some(Stmt::Copy {
                    dst: d,
                    src: s,
                    n: n as u64 * 8,
                    pc,
                    rev: Some(true),
                });
            }
            // any other order: only frame-to-frame with disjoint ranges
            if !x.expr_eq(sb, base) || !(slo + nb <= lo || lo + nb <= slo) {
                return None;
            }
            let (d, s) = (mk(x, base, lo), mk(x, sb, slo));
            return Some(Stmt::Copy {
                dst: d,
                src: s,
                n: n as u64 * 8,
                pc,
                rev: None,
            });
        }
    }
    if !ss.iter().all(|s| x.is_pure(s.v)) || (!ascending && !frame) {
        return None;
    }
    let addr = mk(x, base, lo);
    let vals = x.ir.list(order.iter().map(|&i| ss[i].v));
    Some(Stmt::Stores {
        size,
        addr,
        vals,
        pc: ss[0].pc,
    })
}
