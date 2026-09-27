//! `src/ifconv.ts`: branches whose arms only assign variables become selects.

use crate::cfgopt::distinct;
use crate::*;
use sbpf_ir::{Node, Stmt, Term, E};
use sbpf_program::{Block, Func, VarInfo};

/// var -> expression assigned by an arm (insertion order)
type Assign = Vec<(u32, E)>;

fn get(m: &Assign, v: u32) -> Option<E> {
    m.iter().find(|x| x.0 == v).map(|x| x.1)
}

/// Arm block: only pure `x = e` statements over distinct variables.
fn arm_assigns(x: &mut Fx, b: &Block, max_stmts: usize) -> Option<Assign> {
    if b.stmts.len() > max_stmts {
        return None;
    }
    let mut m: Assign = vec![];
    for s in &b.stmts {
        let Stmt::Set { dst, e, .. } = *s else {
            return None;
        };
        let d = dst as u32;
        if get(&m, d).is_some() || !x.is_pure(e) || x.has_undef(e) {
            return None;
        }
        m.push((d, e));
    }
    Some(m)
}

fn reads_any(x: &mut Fx, e: E, vs: &[u32]) -> bool {
    let mut r = false;
    x.evars(e, |v| r |= vs.contains(&v));
    r
}

/// definitelyAssigned: per (block, variable) backward search over preds (see ifconv.ts).
struct Da {
    seen: Vec<u32>,
    stamp: u32,
    gens: Vec<Option<Vec<u32>>>,
}

impl Da {
    fn at(&mut self, x: &Fx, f: &Func, a: usize, v: u32) -> bool {
        let param = f.vars[v as usize].param >= 0;
        self.stamp += 1;
        let st = self.stamp;
        let mut stack = vec![a];
        self.seen[a] = st;
        while let Some(bi) = stack.pop() {
            let b = &f.blocks[bi];
            if self.gens[b.id].is_none() {
                let mut g = vec![];
                for s in &b.stmts {
                    match s {
                        Stmt::Set { dst, e, .. } => {
                            if x.node(*e) != Node::Undef {
                                g.push(*dst as u32)
                            }
                        }
                        Stmt::Call { dst, .. } if *dst >= 0 => g.push(*dst as u32),
                        _ => {}
                    }
                }
                self.gens[b.id] = Some(g);
            }
            if self.gens[b.id].as_ref().unwrap().contains(&v) {
                continue;
            }
            if b.id == 0 && !param {
                return false;
            }
            for &p in &b.preds {
                if self.seen[p] != st {
                    self.seen[p] = st;
                    stack.push(p);
                }
            }
        }
        true
    }
}

/// Identical terminators (so two arms can share one). exprEq never equates calls.
fn same_term(x: &Fx, a: &Term, b: &Term) -> bool {
    match (a, b) {
        (Term::Jmp { to: p }, Term::Jmp { to: q }) => p == q,
        (
            Term::Br { c, t, f },
            Term::Br {
                c: c2,
                t: t2,
                f: f2,
            },
        ) => {
            if t == t2 && f == f2 {
                return x.expr_eq(*c, *c2);
            }
            // `br c ? X : Y` == `br !c ? Y : X`
            if t != f2 || f != t2 {
                return false;
            }
            let Node::Cmp(op, ca, cb) = x.node(*c) else {
                return false;
            };
            let Some(n) = neg_cmp(op) else { return false };
            matches!(x.node(*c2), Node::Cmp(o2, a2, b2) if o2 == n && x.expr_eq(ca, a2) && x.expr_eq(cb, b2))
        }
        (Term::Ret { e: p }, Term::Ret { e: q }) => match (p, q) {
            (None, None) => true,
            (Some(p), Some(q)) => x.expr_eq(*p, *q),
            _ => false,
        },
        _ => false,
    }
}

pub fn if_convert(x: &mut Fx, f: &mut Func, max_stmts: usize) -> bool {
    let mut da = Da {
        seen: vec![0; f.blocks.len()],
        stamp: 0,
        gens: vec![None; f.blocks.len()],
    };
    let mut changed = false;
    for ai in 0..f.blocks.len() {
        let Term::Br { c: tc, t: tt, f: tf } = f.blocks[ai].term else {
            continue;
        };
        if tt == tf {
            continue;
        }
        let aid = f.blocks[ai].id;
        let (ti, fi) = (tt as usize, tf as usize);
        let single = |b: &Block| b.id != 0 && b.id != aid && b.preds.len() == 1;
        let (tb, fb) = (&f.blocks[ti], &f.blocks[fi]);
        let next: Term;
        let arms: Vec<usize>;
        let (on_t, on_f);
        if single(tb) && matches!(tb.term, Term::Jmp { to } if to as usize == fb.id) {
            on_t = arm_assigns(x, tb, max_stmts);
            on_f = Some(vec![]);
            next = Term::Jmp { to: fb.id as i64 };
            arms = vec![ti];
        } else if single(fb) && matches!(fb.term, Term::Jmp { to } if to as usize == tb.id) {
            on_t = Some(vec![]);
            on_f = arm_assigns(x, fb, max_stmts);
            next = Term::Jmp { to: tb.id as i64 };
            arms = vec![fi];
        } else if single(tb) && single(fb) && same_term(x, &tb.term, &fb.term) {
            on_t = arm_assigns(x, tb, max_stmts);
            on_f = arm_assigns(x, fb, max_stmts);
            next = tb.term.clone();
            arms = vec![ti, fi];
        } else {
            continue;
        }
        let (Some(on_t), Some(on_f)) = (on_t, on_f) else {
            continue;
        };
        let succs: Vec<usize> = match next {
            Term::Jmp { to } => vec![to as usize],
            Term::Br { t, f, .. } => vec![t as usize, f as usize],
            _ => vec![],
        };
        let arm_ids: Vec<usize> = arms.iter().map(|&i| f.blocks[i].id).collect();
        if distinct(&succs).len() != succs.len()
            || succs.iter().any(|&s| s == aid || arm_ids.contains(&s))
        {
            continue;
        }
        let mut targets: Vec<u32> = on_t.iter().map(|x| x.0).collect();
        for &(v, _) in &on_f {
            if !targets.contains(&v) {
                targets.push(v);
            }
        }
        if on_t
            .iter()
            .chain(on_f.iter())
            .any(|&(_, e)| reads_any(x, e, &targets))
        {
            continue;
        }
        // the untaken side keeps the old value: it must be definitely assigned at the end of A
        let both = |v: u32| get(&on_t, v).is_some() && get(&on_f, v).is_some();
        let one_sided: Vec<u32> = targets.iter().copied().filter(|&v| !both(v)).collect();
        if one_sided.iter().any(|&v| !da.at(x, f, ai, v)) {
            continue;
        }
        let differ: Vec<u32> = targets
            .iter()
            .copied()
            .filter(|&v| {
                !(both(v) && x.expr_eq(get(&on_t, v).unwrap(), get(&on_f, v).unwrap()))
            })
            .collect();
        let mut stmts: Vec<Stmt> = vec![];
        let mut c = tc;
        let pc = f.blocks[ti]
            .stmts
            .first()
            .or(f.blocks[fi].stmts.first())
            .map_or(0, crate::cfgopt::stmt_pc);
        if differ.len() > 1 && !(x.is_pure(c) && x.size(c) <= 3 && !reads_any(x, c, &targets)) {
            let tv = f.vars.len() as u32;
            f.vars.push(VarInfo {
                id: tv,
                reg: -1,
                param: -1,
                undef: false,
            });
            stmts.push(Stmt::Set {
                dst: tv as i32,
                e: c,
                pc,
            });
            c = x.ir.var(tv);
        } else if differ.is_empty() && !x.is_pure(c) {
            stmts.push(Stmt::Eval { e: c, pc });
        }
        for &v in &targets {
            let e = if differ.contains(&v) {
                let a = get(&on_t, v).unwrap_or_else(|| x.ir.var(v));
                let b = get(&on_f, v).unwrap_or_else(|| x.ir.var(v));
                x.ir.mk(Node::Sel(c, a, b))
            } else {
                get(&on_t, v).unwrap()
            };
            stmts.push(Stmt::Set {
                dst: v as i32,
                e,
                pc,
            });
        }
        // A takes over the arms' common continuation; the arm blocks become unreachable
        let a = &mut f.blocks[ai];
        a.stmts.extend(stmts);
        a.term = next;
        a.succs = succs.clone();
        for s in distinct(&succs) {
            let sp = &mut f.blocks[s].preds;
            sp.retain(|&p| p != aid && !arm_ids.contains(&p));
            sp.push(aid);
        }
        for &arm in &arms {
            let b = &mut f.blocks[arm];
            b.preds = vec![];
            b.succs = vec![];
            b.stmts = vec![];
            b.term = dead_trap();
        }
        da.gens[aid] = None;
        for &arm in &arm_ids {
            da.gens[arm] = None;
        }
        changed = true;
    }
    changed
}
