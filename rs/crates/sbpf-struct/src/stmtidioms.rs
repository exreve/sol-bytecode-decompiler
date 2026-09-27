//! `src/stmtidioms.ts`: Rc count idioms on the structured body (rc_inc / rc_dec / rc_release).

use crate::{SNode, Tree};
use sbpf_ir::{BinOp, CallTarget, CmpOp, Node, Stmt, E};
use sbpf_opt::{is_div_op, Fx, Intr, CALL, LOAD, M64, TRAP};
use std::collections::HashMap;

pub fn statement_idioms(fx: &mut Fx, tree: &mut Tree, fp: Option<u32>) {
    if !has_candidate(fx, tree, &tree.body) {
        return;
    }
    let mut uses: HashMap<u32, i32> = HashMap::new();
    scan(fx, tree, &tree.body, &mut uses);
    let body = std::mem::take(&mut tree.body);
    tree.body = rewrite(fx, tree, body, &uses, fp);
}

fn count(fx: &Fx, e: E, uses: &mut HashMap<u32, i32>) {
    fx.ir.walk(e, &mut |_, n| {
        if let Node::Var(v) = n {
            *uses.entry(v).or_insert(0) += 1;
        }
    });
}

fn scan(fx: &Fx, tree: &Tree, ns: &[SNode], uses: &mut HashMap<u32, i32>) {
    for n in ns {
        match n {
            SNode::Stmt(i) => match tree.stmt(*i) {
                Stmt::Set { dst, e, .. } => {
                    count(fx, *e, uses);
                    *uses.entry(*dst as u32).or_insert(0) += 1;
                }
                Stmt::Call {
                    dst,
                    t,
                    args,
                    extra,
                    ..
                } => {
                    for a in fx.ir.items(*args) {
                        count(fx, a, uses);
                    }
                    if let Some(x) = extra {
                        for a in fx.ir.items(*x) {
                            count(fx, a, uses);
                        }
                    }
                    if let CallTarget::Ind { e } = t {
                        count(fx, *e, uses);
                    }
                    if *dst >= 0 {
                        *uses.entry(*dst as u32).or_insert(0) += 1;
                    }
                }
                Stmt::Store { addr, v, .. } => {
                    count(fx, *addr, uses);
                    count(fx, *v, uses);
                }
                Stmt::Stores { addr, vals, .. } => {
                    count(fx, *addr, uses);
                    for a in fx.ir.items(*vals) {
                        count(fx, a, uses);
                    }
                }
                Stmt::Copy { dst, src, .. } => {
                    count(fx, *dst, uses);
                    count(fx, *src, uses);
                }
                Stmt::Eval { e, .. } => count(fx, *e, uses),
                Stmt::Trap { .. } => {}
            },
            SNode::If { c, then, els } => {
                count(fx, *c, uses);
                scan(fx, tree, then, uses);
                scan(fx, tree, els, uses);
            }
            SNode::Block { body, .. } => scan(fx, tree, body, uses),
            SNode::Loop { c, body, .. } => {
                if let Some(c) = c {
                    count(fx, *c, uses);
                }
                scan(fx, tree, body, uses);
            }
            SNode::Return(Some(e)) => count(fx, *e, uses),
            SNode::Switch { v, cases } => {
                uses.insert(*v, 2);
                for c in cases {
                    scan(fx, tree, &c.1, uses);
                }
            }
            SNode::SetState { v, .. } => {
                uses.insert(*v, 2);
            }
            _ => {}
        }
    }
}

/// `st64(p, x ± 1)` with x a variable
fn inc_store(fx: &Fx, s: &Stmt) -> Option<(E, u32, bool, i64)> {
    let Stmt::Store {
        size: 8,
        addr,
        v,
        pc,
    } = s
    else {
        return None;
    };
    let Node::Bin(BinOp::Add, a, b) = fx.ir.get(*v) else {
        return None;
    };
    let Node::Var(x) = fx.ir.get(a) else {
        return None;
    };
    let Node::Const(c) = fx.ir.get(b) else {
        return None;
    };
    if c != 1 && c != M64 {
        return None;
    }
    Some((*addr, x, c == 1, *pc))
}

fn has_candidate(fx: &Fx, tree: &Tree, ns: &[SNode]) -> bool {
    for n in ns {
        match n {
            SNode::Stmt(i) => {
                if inc_store(fx, tree.stmt(*i)).is_some() {
                    return true;
                }
            }
            SNode::If { then, els, .. } => {
                if has_candidate(fx, tree, then) || has_candidate(fx, tree, els) {
                    return true;
                }
            }
            SNode::Block { body, .. } | SNode::Loop { body, .. } => {
                if has_candidate(fx, tree, body) {
                    return true;
                }
            }
            SNode::Switch { cases, .. } => {
                if cases.iter().any(|c| has_candidate(fx, tree, &c.1)) {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// hasSideEffectsOrMem(withoutFrameLoads(e, fp)): loads of the current frame (fp + c, inside the
/// 4 KiB frame) count as the constant 0 they are replaced with (the call target of an indirect call is
/// not rewritten by withoutFrameLoads).
fn fx_no_frame(fx: &mut Fx, e: E, fp: u32) -> u8 {
    match fx.ir.get(e) {
        Node::Load { size, addr } => {
            if let Node::Bin(BinOp::Add, a, b) = fx.ir.get(addr) {
                if let (Node::Var(v), Node::Const(c)) = (fx.ir.get(a), fx.ir.get(b)) {
                    let c = c as i64 as i128;
                    if v == fp && c >= -0x1000 && c + size as i128 <= 0 {
                        return 0;
                    }
                }
            }
            LOAD | TRAP | fx_no_frame(fx, addr, fp)
        }
        Node::Bin(op, a, b) => {
            let t = if is_div_op(op) && !fx.safe_divisor(op, b) {
                TRAP
            } else {
                0
            };
            t | fx_no_frame(fx, a, fp) | fx_no_frame(fx, b, fp)
        }
        Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
            fx_no_frame(fx, a, fp) | fx_no_frame(fx, b, fp)
        }
        Node::Neg(a)
        | Node::Not(a)
        | Node::Lnot(a)
        | Node::Ext { a, .. }
        | Node::Bswap { a, .. } => fx_no_frame(fx, a, fp),
        Node::Sel(c, a, b) => {
            fx_no_frame(fx, c, fp) | fx_no_frame(fx, a, fp) | fx_no_frame(fx, b, fp)
        }
        Node::Call(t, args) => {
            let mut r = CALL;
            if let CallTarget::Ind { e } = fx.ir.target(t) {
                r |= fx.fx(e);
            }
            for k in 0..args.len {
                r |= fx_no_frame(fx, fx.ir.at(args, k), fp);
            }
            r
        }
        Node::Fn(name, args) => {
            let mut r = match fx.intr(name) {
                Intr::Memeq | Intr::Keyeq => LOAD | TRAP,
                Intr::RcInc | Intr::RcDec | Intr::RcRelease => LOAD | TRAP | CALL,
                _ => 0,
            };
            for k in 0..args.len {
                r |= fx_no_frame(fx, fx.ir.at(args, k), fp);
            }
            r
        }
        _ => 0,
    }
}

fn has_call(fx: &Fx, e: E) -> bool {
    let mut c = false;
    fx.ir.walk(e, &mut |_, n| {
        if let Node::Call(..) = n {
            c = true;
        }
    });
    c
}

fn mentions(fx: &Fx, e: E, v: u32) -> bool {
    let mut m = false;
    fx.ir.walk(e, &mut |_, n| {
        if n == Node::Var(v) {
            m = true;
        }
    });
    m
}

fn is_abort(tree: &Tree, ns: &[SNode]) -> bool {
    let Some(SNode::Stmt(a)) = ns.first() else {
        return false;
    };
    let Stmt::Call {
        t: CallTarget::Sys { name, .. },
        ..
    } = tree.stmt(*a)
    else {
        return false;
    };
    if &**name != "abort" {
        return false;
    }
    ns.len() == 1 || (ns.len() == 2 && matches!(ns[1], SNode::Trap(_)))
}

fn no_fall_through(tree: &Tree, ns: &[SNode]) -> bool {
    let Some(l) = ns.last() else { return false };
    match l {
        SNode::Return(_) | SNode::Trap(_) | SNode::Break(_) | SNode::Continue(_) => true,
        SNode::Stmt(i) => match tree.stmt(*i) {
            Stmt::Trap { .. } => true,
            Stmt::Call {
                t: CallTarget::Sys { name, .. },
                ..
            } => &**name == "abort",
            _ => false,
        },
        SNode::If { then, els, .. } => no_fall_through(tree, then) && no_fall_through(tree, els),
        _ => false,
    }
}

fn is_pure_set(
    fx: &mut Fx,
    tree: &Tree,
    n: &SNode,
    x: u32,
    pv: &[u32],
    frame_ok: Option<u32>,
) -> bool {
    let SNode::Stmt(i) = n else { return false };
    let Stmt::Set { dst, e, .. } = tree.stmt(*i) else {
        return false;
    };
    let (dst, e) = (*dst, *e);
    if dst == x as i32 || pv.contains(&(dst as u32)) || mentions(fx, e, x) {
        return false;
    }
    let f = match frame_ok {
        Some(fp) => fx_no_frame(fx, e, fp),
        None => fx.fx(e),
    };
    f == 0
}

fn split(fx: &Fx, e: E) -> (E, u64) {
    if let Node::Bin(BinOp::Add, a, b) = fx.ir.get(e) {
        if let Node::Const(c) = fx.ir.get(b) {
            return (a, c);
        }
    }
    (e, 0)
}

/// [st64(p + 8, ld64(p + 8) - 1)]
fn is_weak_dec(fx: &Fx, tree: &Tree, ns: &[SNode], p: E) -> bool {
    if ns.len() != 1 {
        return false;
    }
    let SNode::Stmt(i) = &ns[0] else { return false };
    let Stmt::Store {
        size: 8, addr, v, ..
    } = tree.stmt(*i)
    else {
        return false;
    };
    let ((pb, po), (qb, qo)) = (split(fx, p), split(fx, *addr));
    if !fx.expr_eq(pb, qb) || qo != po.wrapping_add(8) {
        return false;
    }
    match fx.ir.get(*v) {
        Node::Bin(BinOp::Add, a, b) => {
            fx.ir.get(b) == Node::Const(M64)
                && matches!(fx.ir.get(a), Node::Load { size: 8, addr: la } if fx.expr_eq(la, *addr))
        }
        _ => false,
    }
}

/// `x <op> k` for the variable x
fn cmp_var_const(fx: &Fx, c: E, x: u32) -> Option<(CmpOp, u64)> {
    let Node::Cmp(op, a, b) = fx.ir.get(c) else {
        return None;
    };
    let (Node::Var(v), Node::Const(k)) = (fx.ir.get(a), fx.ir.get(b)) else {
        return None;
    };
    (v == x).then_some((op, k))
}

fn rewrite(
    fx: &mut Fx,
    tree: &mut Tree,
    ns: Vec<SNode>,
    uses: &HashMap<u32, i32>,
    fp: Option<u32>,
) -> Vec<SNode> {
    let mut out: Vec<SNode> = ns
        .into_iter()
        .map(|n| match n {
            SNode::If { c, then, els } => SNode::If {
                c,
                then: rewrite(fx, tree, then, uses, fp),
                els: rewrite(fx, tree, els, uses, fp),
            },
            SNode::Block { label, body } => SNode::Block {
                label,
                body: rewrite(fx, tree, body, uses, fp),
            },
            SNode::Loop {
                label,
                body,
                form,
                c,
            } => SNode::Loop {
                label,
                body: rewrite(fx, tree, body, uses, fp),
                form,
                c,
            },
            SNode::Switch { v, cases } => SNode::Switch {
                v,
                cases: cases
                    .into_iter()
                    .map(|(vals, b)| (vals, rewrite(fx, tree, b, uses, fp)))
                    .collect(),
            },
            n => n,
        })
        .collect();
    let mut j: isize = 0;
    while ((j + 1) as usize) < out.len() {
        let ju = j as usize;
        let SNode::Stmt(si) = out[ju] else {
            j += 1;
            continue;
        };
        let Some((p, x, inc, st_pc)) = inc_store(fx, tree.stmt(si)) else {
            j += 1;
            continue;
        };
        if has_call(fx, p) {
            j += 1;
            continue;
        }
        let mut pv: Vec<u32> = Vec::new();
        fx.ir.walk(p, &mut |_, n| {
            if let Node::Var(v) = n {
                if !pv.contains(&v) {
                    pv.push(v);
                }
            }
        });
        let p_is_frame = fp.is_some_and(|fpv| match fx.ir.get(p) {
            Node::Var(v) => v == fpv,
            Node::Bin(BinOp::Add, a, _) => fx.ir.get(a) == Node::Var(fpv),
            _ => false,
        });
        let frame_ok = if p_is_frame { None } else { fp };
        let mut k = ju + 1;
        while k < out.len() && is_pure_set(fx, tree, &out[k], x, &pv, frame_ok) {
            k += 1;
        }
        let Some(SNode::If { c, then, els }) = out.get(k) else {
            j += 1;
            continue;
        };
        if uses.get(&x).copied() != Some(3) {
            j += 1;
            continue;
        }
        let c = *c;
        let abort_end = if matches!(out.get(k + 2), Some(SNode::Trap(_))) {
            k + 3
        } else {
            k + 2
        };
        let cv = cmp_var_const(fx, c, x);
        let tail = &out[(k + 1).min(out.len())..abort_end.min(out.len())];
        let inverted = inc
            && els.is_empty()
            && cv == Some((CmpOp::Ne, M64))
            && no_fall_through(tree, then)
            && is_abort(tree, tail);
        let mut release = false;
        if !inverted {
            let plain = els.is_empty()
                && cv == Some((CmpOp::Eq, if inc { M64 } else { 1 }))
                && if inc {
                    is_abort(tree, then)
                } else {
                    is_weak_dec(fx, tree, then, p)
                };
            if !plain {
                if inc || !matches!(cv, Some((CmpOp::Eq | CmpOp::Ne, 1))) {
                    j += 1;
                    continue;
                }
                release = true;
            }
        }
        // the load of x: in this list, followed only by variable assignments that keep p and x
        let mut i: isize = j - 1;
        while i >= 0 {
            let SNode::Stmt(mi) = out[i as usize] else {
                i = -1;
                break;
            };
            let Stmt::Set { dst, e, .. } = *tree.stmt(mi) else {
                i = -1;
                break;
            };
            if has_call(fx, e) {
                i = -1;
                break;
            }
            if dst == x as i32 {
                break;
            }
            if mentions(fx, e, x) || pv.contains(&(dst as u32)) {
                i = -1;
                break;
            }
            i -= 1;
        }
        let adjacent = i >= 0
            && match &out[i as usize] {
                SNode::Stmt(di) => match tree.stmt(*di) {
                    Stmt::Set { e, .. } => {
                        matches!(fx.ir.get(*e), Node::Load { size: 8, addr } if fx.expr_eq(addr, p))
                    }
                    _ => false,
                },
                _ => false,
            };
        let args: Vec<E> = if adjacent {
            vec![p]
        } else {
            vec![p, fx.ir.var(x)]
        };
        let moved: Vec<SNode> = out[ju + 1..k].to_vec();
        let SNode::If { then, els, .. } = out[k].clone() else {
            unreachable!()
        };
        let (call, after): (SNode, Vec<SNode>) = if release {
            let r = fx.mk_fn(Intr::RcRelease, &args);
            let is_ne = matches!(fx.ir.get(c), Node::Cmp(CmpOp::Ne, ..));
            let nc = if is_ne { fx.ir.mk(Node::Lnot(r)) } else { r };
            (
                SNode::If { c: nc, then, els },
                out[(k + 1).min(out.len())..].to_vec(),
            )
        } else {
            let e = fx.mk_fn(if inc { Intr::RcInc } else { Intr::RcDec }, &args);
            let s = tree.push(Stmt::Eval { e, pc: st_pc });
            let after = if inverted {
                let mut a = then;
                a.extend_from_slice(&out[abort_end.min(out.len())..]);
                a
            } else {
                out[(k + 1).min(out.len())..].to_vec()
            };
            (SNode::Stmt(s), after)
        };
        let ml = moved.len() as isize;
        let mut nout: Vec<SNode>;
        if adjacent {
            let iu = i as usize;
            nout = out[..iu].to_vec();
            nout.extend_from_slice(&out[iu + 1..ju]);
            nout.extend(moved);
            nout.push(call);
            nout.extend(after);
            j += ml - 1;
        } else {
            nout = out[..ju].to_vec();
            nout.extend(moved);
            nout.push(call);
            nout.extend(after);
            j += ml;
        }
        out = nout;
        j += 1;
    }
    out
}
