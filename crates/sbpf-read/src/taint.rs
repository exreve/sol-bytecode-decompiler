//! `src/taint.ts`: instruction-data taint (flow-insensitive, interprocedural) from the handlers' ix_args.

use crate::util::{arg_reg, fo_any, n_s, N};
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, E, L};
use sbpf_program::Func;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TK {
    Ptr,
    Val,
}

#[derive(Clone, Debug, Default)]
pub struct FnTaint {
    pub vars: IndexMap<u32, TK>,
    pub frame: Vec<(N, N, TK)>,
}

fn join(a: Option<TK>, b: Option<TK>) -> Option<TK> {
    if a == Some(TK::Val) || b == Some(TK::Val) {
        Some(TK::Val)
    } else {
        a.or(b)
    }
}

/// instructionTaint
pub fn instruction_taint(
    funcs: &IndexMap<i64, &Func>,
    seeds: &IndexMap<i64, Vec<u32>>,
) -> IndexMap<i64, FnTaint> {
    let mut res: IndexMap<i64, FnTaint> = IndexMap::default();
    let mut queue: IndexSet<i64> = IndexSet::default();
    for (pc, vs) in seeds {
        let t = res.entry(*pc).or_default();
        for v in vs {
            t.vars.insert(*v, TK::Ptr);
        }
        queue.insert(*pc);
    }
    let mut budget: i32 = 20000;
    while !queue.is_empty() && {
        let b = budget;
        budget -= 1;
        b > 0
    } {
        let pc = queue.shift_remove_index(0).unwrap();
        let Some(f) = funcs.get(&pc) else { continue };
        let ir = f.ir.as_ref().unwrap();
        let mut t = res.entry(pc).or_default().clone();
        let fp = crate::util::fp_var(f);
        let fo = |e: E| fo_any(ir, e, fp);
        let mut bases: IndexSet<crate::util::K> = IndexSet::default();
        let note_base = |e: E, bases: &mut IndexSet<crate::util::K>| {
            ir.walk(e, &mut |x, _| {
                if let Some(o) = fo(x) {
                    bases.insert(crate::util::K::of(o));
                }
            })
        };
        for b in &f.blocks {
            for s in &b.stmts {
                match s {
                    Stmt::Call { args, .. } => {
                        for a in ir.items(*args) {
                            note_base(a, &mut bases);
                        }
                    }
                    Stmt::Copy { dst, src, .. } => {
                        note_base(*dst, &mut bases);
                        note_base(*src, &mut bases);
                    }
                    Stmt::Stores { addr, .. } => note_base(*addr, &mut bases),
                    _ => {}
                }
            }
        }
        let mut sorted: Vec<N> = bases.iter().map(|k| k.get()).collect();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let extent = |o: N| {
            let nx = sorted.iter().find(|&&x| x > o);
            (match nx {
                None => 256.0,
                Some(&x) => x - o,
            })
            .min(1024.0)
        };
        for _it in 0..8 {
            let mut changed = false;
            for b in &f.blocks {
                for s in &b.stmts {
                    match s {
                        Stmt::Set { dst, e, .. } => {
                            let k = taint(ir, &t, fp, *e);
                            set_var(&mut t, *dst as u32, k, &mut changed);
                        }
                        Stmt::Store { addr, v, size, .. } => {
                            if let Some(o) = fo(*addr) {
                                let k = taint(ir, &t, fp, *v);
                                set_frame(&mut t, o, *size as N, k, &mut changed);
                            }
                        }
                        Stmt::Stores {
                            addr, vals, size, ..
                        } => {
                            if let Some(o) = fo(*addr) {
                                for (i, v) in ir.items(*vals).enumerate() {
                                    let k = taint(ir, &t, fp, v);
                                    set_frame(
                                        &mut t,
                                        o + (i * *size as usize) as N,
                                        *size as N,
                                        k,
                                        &mut changed,
                                    );
                                }
                            }
                        }
                        Stmt::Copy { dst, src, n, .. } => {
                            let Some(o) = fo(*dst) else { continue };
                            let n = *n as N;
                            if let Some(so) = fo(*src) {
                                let snap = t.frame.clone();
                                for (lo, hi, k) in snap {
                                    if lo < so + n && so < hi {
                                        let a = lo.max(so);
                                        set_frame(
                                            &mut t,
                                            a - so + o,
                                            hi.min(so + n) - a,
                                            Some(k),
                                            &mut changed,
                                        );
                                    }
                                }
                            } else if taint(ir, &t, fp, *src).is_some() {
                                set_frame(&mut t, o, n, Some(TK::Val), &mut changed);
                            }
                        }
                        _ => {}
                    }
                }
            }
            if !changed {
                break;
            }
        }
        res.insert(pc, t);
        let mut visit_call =
            |callee: i64, args: L, res: &mut IndexMap<i64, FnTaint>, queue: &mut IndexSet<i64>| {
                let Some(cf) = funcs.get(&callee) else { return };
                for (i, a) in ir.items(args).enumerate() {
                    // (the function's taint as it is now: a recursive call may have changed it)
                    let t = &res[&pc];
                    let k = match fo(a) {
                        Some(o) => {
                            if frame_at(t, o, extent(o)).is_some() {
                                Some(TK::Ptr)
                            } else {
                                None
                            }
                        }
                        None => taint(ir, t, fp, a),
                    };
                    let Some(k) = k else { continue };
                    let reg = arg_reg(cf, i);
                    let Some(pv) = cf.vars.iter().find(|v| v.param == reg) else {
                        continue;
                    };
                    let ct = res.entry(callee).or_default();
                    let old = ct.vars.get(&pv.id).copied();
                    let n = join(old, Some(k));
                    if n != old {
                        ct.vars.insert(pv.id, n.unwrap());
                        queue.insert(callee);
                    }
                }
            };
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Call {
                    t: CallTarget::Fn { pc },
                    args,
                    ..
                } = s
                {
                    visit_call(*pc, *args, &mut res, &mut queue);
                }
                let e = match s {
                    Stmt::Set { e, .. } => Some(*e),
                    Stmt::Store { v, .. } => Some(*v),
                    Stmt::Eval { e, .. } => Some(*e),
                    _ => None,
                };
                if let Some(e) = e {
                    let mut calls = Vec::new();
                    ir.walk(e, &mut |_, x| {
                        if let Node::Call(tt, args) = x {
                            if let CallTarget::Fn { pc } = ir.target(tt) {
                                calls.push((pc, args));
                            }
                        }
                    });
                    for (pc, args) in calls {
                        visit_call(pc, args, &mut res, &mut queue);
                    }
                }
            }
        }
    }
    res
}

fn set_var(t: &mut FnTaint, v: u32, k: Option<TK>, changed: &mut bool) {
    let Some(k) = k else { return };
    let o = t.vars.get(&v).copied();
    let n = join(o, Some(k));
    if n != o {
        t.vars.insert(v, n.unwrap());
        *changed = true;
    }
}

fn set_frame(t: &mut FnTaint, o: N, n: N, k: Option<TK>, changed: &mut bool) {
    let Some(k) = k else { return };
    if t.frame
        .iter()
        .any(|&(lo, hi, kk)| lo <= o && o + n <= hi && (kk == k || kk == TK::Val))
    {
        return;
    }
    t.frame.push((o, o + n, k));
    *changed = true;
}

fn frame_at(t: &FnTaint, o: N, n: N) -> Option<TK> {
    let mut k = None;
    for &(lo, hi, kk) in &t.frame {
        if lo < o + n && o < hi {
            k = join(k, Some(kk));
        }
    }
    k
}

fn taint(ir: &Ir, t: &FnTaint, fp: Option<u32>, e: E) -> Option<TK> {
    match ir.get(e) {
        Node::Var(v) => t.vars.get(&v).copied(),
        Node::Const(_) | Node::Undef | Node::Reg(_) => None,
        Node::Load { size, addr } => {
            if let Some(o) = fo_any(ir, addr, fp) {
                return frame_at(t, o, size as N);
            }
            if taint(ir, t, fp, addr).is_some() {
                Some(TK::Val)
            } else {
                None
            }
        }
        Node::Bin(op, a, b) => {
            let (x, y) = (taint(ir, t, fp, a), taint(ir, t, fp, b));
            if (op == BinOp::Add || op == BinOp::Sub)
                && (x == Some(TK::Ptr) || y == Some(TK::Ptr))
                && x != Some(TK::Val)
                && y != Some(TK::Val)
            {
                return Some(TK::Ptr);
            }
            if x.is_some() || y.is_some() {
                Some(TK::Val)
            } else {
                None
            }
        }
        Node::Call(..) => None,
        _ => {
            let mut k = None;
            let mut subs = Vec::new();
            ir.walk(e, &mut |x, n| {
                if x != e && matches!(n, Node::Var(_) | Node::Load { .. }) {
                    subs.push(x);
                }
            });
            for x in subs {
                k = join(
                    k,
                    if taint(ir, t, fp, x).is_some() {
                        Some(TK::Val)
                    } else {
                        None
                    },
                );
            }
            k
        }
    }
}

/// exprTainted: does the expression derive from instruction data?
pub fn expr_tainted(t: Option<&FnTaint>, ir: &Ir, e: E, fp: Option<u32>) -> bool {
    let Some(t) = t else { return false };
    let mut hit = false;
    ir.walk(e, &mut |_, x| {
        if let Node::Var(v) = x {
            if t.vars.contains_key(&v) && Some(v) != fp {
                hit = true;
            }
        }
        if let Node::Load { size, addr } = x {
            if let Node::Bin(BinOp::Add, a, c) = ir.get(addr) {
                if let (Node::Var(av), Node::Const(c)) = (ir.get(a), ir.get(c)) {
                    if Some(av) == fp {
                        let o = n_s(c);
                        if t.frame
                            .iter()
                            .any(|&(lo, hi, _)| lo < o + size as N && o < hi)
                        {
                            hit = true;
                        }
                    }
                }
            }
        }
    });
    hit
}
