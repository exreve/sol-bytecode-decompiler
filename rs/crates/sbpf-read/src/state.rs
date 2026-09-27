//! `src/state.ts`: account data layouts from the Anchor IDL (views `<Name>Account`) and the variables
//! pointing to such data (from discriminator comparisons).

use crate::idl::{get, js_string_opt, truthy, IdlInfo};
use crate::util::{stmt_exprs, term_br, upper_first, uses_var};
use crate::views::Views;
use indexmap::IndexMap;
use sbpf_ir::{BinOp, CallTarget, CmpOp, Node, Stmt, E};
use sbpf_program::Func;
use serde_json::Value;

/// accountViews: views of the IDL's account types; discriminator -> view name.
pub fn account_views(idl: &IdlInfo, views: &mut Views) -> IndexMap<u64, String> {
    let mut out = IndexMap::new();
    for (name, disc) in &idl.accounts {
        let Some(def) = idl.types.get(name) else {
            continue;
        };
        if get(def, "kind").and_then(|k| k.as_str()) != Some("struct") {
            continue;
        }
        let Some(Value::Array(fs)) = get(def, "fields") else {
            continue;
        };
        let mut fields: Vec<(String, Value)> =
            vec![("discriminator".into(), Value::String("u64".into()))];
        for f in fs {
            if f.is_object() && truthy(get(f, "name")) {
                fields.push((
                    js_string_opt(get(f, "name")),
                    get(f, "type").cloned().unwrap_or(Value::Null),
                ));
            }
        }
        let base = format!("{}Account", upper_first(name));
        let vname = if idl.types.contains_key(&base) {
            format!("{base}Data")
        } else {
            base
        };
        if views.map.contains_key(&vname) {
            continue;
        }
        let v = views.borsh_view(
            &vname,
            &format!("data of an account of type {name} (Anchor IDL: 8-byte discriminator, then the fields in serialized order)"),
            &fields,
            &idl.types,
            0.0,
        );
        if let Some(v) = v {
            if views.map[&v].fields.len() > 1 {
                out.insert(*disc, v);
            }
        }
    }
    out
}

fn set_in(m: &mut IndexMap<i64, IndexMap<u32, String>>, pc: i64, v: u32, t: &str) -> bool {
    let x = m.entry(pc).or_default();
    if x.contains_key(&v) {
        return false;
    }
    x.insert(v, t.to_string());
    true
}

/// accountDataVars: per function, variable -> account data view.
pub fn account_data_vars(
    funcs: &[&Func],
    discs: &IndexMap<u64, String>,
    views: &mut Views,
) -> IndexMap<i64, IndexMap<u32, String>> {
    let mut res: IndexMap<i64, IndexMap<u32, String>> = IndexMap::new();
    if discs.is_empty() {
        return res;
    }
    let mut slices: IndexMap<i64, IndexMap<u32, String>> = IndexMap::new();
    let defs_of = |f: &Func| {
        let mut d: IndexMap<u32, Vec<Option<E>>> = IndexMap::new();
        for b in &f.blocks {
            for s in &b.stmts {
                match s {
                    Stmt::Set { dst, e, .. } => d.entry(*dst as u32).or_default().push(Some(*e)),
                    Stmt::Call { dst, .. } => {
                        // (dst -1 is a key too: `s.dst` of a call without a result)
                        d.entry(*dst as u32).or_default().push(None)
                    }
                    _ => {}
                }
            }
        }
        d
    };
    let info: Vec<(i64, &Func, IndexMap<u32, Vec<Option<E>>>)> =
        funcs.iter().map(|f| (f.pc, *f, defs_of(f))).collect();
    let idx: std::collections::HashMap<i64, usize> =
        info.iter().enumerate().map(|(i, x)| (x.0, i)).collect();
    for (pc, f, defs) in &info {
        let ir = f.ir.as_ref().unwrap();
        let single = |v: u32| defs.get(&v).map_or(0, |d| d.len()) <= 1;
        let mut note = |e: E,
                        local: &IndexMap<u32, E>,
                        res: &mut IndexMap<i64, IndexMap<u32, String>>,
                        slices: &mut IndexMap<i64, IndexMap<u32, String>>,
                        views: &mut Views| {
            ir.walk(e, &mut |_, x| {
                let Node::Cmp(op, a, b) = x else { return };
                if op != CmpOp::Eq && op != CmpOp::Ne {
                    return;
                }
                let (l, c) = if let Node::Const(c) = ir.get(b) {
                    (Some(a), Some(c))
                } else if let Node::Const(c) = ir.get(a) {
                    (Some(b), Some(c))
                } else {
                    (None, None)
                };
                let t = c.and_then(|c| discs.get(&c));
                let mut l = l;
                if let Some(le) = l {
                    if let Node::Var(id) = ir.get(le) {
                        l = Some(match local.get(&id) {
                            Some(&d) => d,
                            None => match defs.get(&id) {
                                Some(d) if d.len() == 1 => match d[0] {
                                    Some(x) => x,
                                    None => ir.undef(),
                                },
                                _ => le,
                            },
                        });
                    }
                }
                let Some(t) = t else { return };
                let Some(l) = l else { return };
                let Node::Load { size: 8, addr } = ir.get(l) else {
                    return;
                };
                if let Node::Bin(BinOp::Add, a2, b2) = ir.get(addr) {
                    if let (Node::Var(av), Node::Const(0x58)) = (ir.get(a2), ir.get(b2)) {
                        if single(av) {
                            let r = views.record_of(t);
                            set_in(res, *pc, av, &r);
                            return;
                        }
                    }
                }
                match ir.get(addr) {
                    Node::Var(av) if single(av) => {
                        set_in(res, *pc, av, t);
                    }
                    Node::Load { size: 8, addr: a2 } => {
                        if let Node::Var(av) = ir.get(a2) {
                            if single(av) {
                                set_in(slices, *pc, av, t);
                            }
                        }
                    }
                    _ => {}
                }
            });
        };
        for b in &f.blocks {
            let mut local: IndexMap<u32, E> = IndexMap::new();
            for s in &b.stmts {
                for e in stmt_exprs(ir, s) {
                    note(e, &local, &mut res, &mut slices, views);
                }
                match s {
                    Stmt::Set { dst, e, .. } => {
                        let dst = *dst as u32;
                        let stale: Vec<u32> = local
                            .iter()
                            .filter(|(_, &x)| uses_var(ir, x, dst))
                            .map(|(v, _)| *v)
                            .collect();
                        for v in stale {
                            local.shift_remove(&v);
                        }
                        local.insert(dst, *e);
                    }
                    Stmt::Call { dst, .. } if *dst >= 0 => {
                        local.shift_remove(&(*dst as u32));
                    }
                    _ => {}
                }
            }
            if let Some(c) = term_br(&b.term) {
                note(c, &local, &mut res, &mut slices, views);
            }
        }
    }
    let mut round = 0;
    let mut changed = true;
    while changed && round < 4 {
        changed = false;
        let snapshot: Vec<i64> = slices.keys().copied().collect();
        for pc in snapshot {
            let Some(&i) = idx.get(&pc) else { continue };
            let f = info[i].1;
            let ir = f.ir.as_ref().unwrap();
            for b in &f.blocks {
                for s in &b.stmts {
                    let Stmt::Call {
                        t: CallTarget::Fn { pc: cpc },
                        args,
                        ..
                    } = s
                    else {
                        continue;
                    };
                    let Some(&ci) = idx.get(cpc) else { continue };
                    let (_, cf, cdefs) = &info[ci];
                    for (k, a) in ir.items(*args).enumerate() {
                        let t = match ir.get(a) {
                            Node::Var(id) => slices.get(&pc).and_then(|sl| sl.get(&id)).cloned(),
                            _ => None,
                        };
                        let Some(t) = t else { continue };
                        let Some(pv) = cf.vars.iter().find(|v| v.param == k as i32 + 1) else {
                            continue;
                        };
                        if !cdefs.contains_key(&pv.id) && set_in(&mut slices, *cpc, pv.id, &t) {
                            changed = true;
                        }
                    }
                }
            }
        }
        round += 1;
    }
    for (pc, sl) in &slices {
        let Some(&i) = idx.get(pc) else { continue };
        let (_, f, defs) = &info[i];
        let ir = f.ir.as_ref().unwrap();
        for (v, es) in defs {
            if es.len() != 1 {
                continue;
            }
            let Some(e) = es[0] else { continue };
            if let Node::Load { size: 8, addr } = ir.get(e) {
                if let Node::Var(a) = ir.get(addr) {
                    if let Some(t) = sl.get(&a) {
                        set_in(&mut res, *pc, *v, t);
                    }
                }
            }
        }
    }
    res
}
