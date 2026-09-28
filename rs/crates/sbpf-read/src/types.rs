//! decompile.ts phase 4 before printing: Anchor account names and try_accounts, the Accounts /
//! Context views, CPI names, view types per function (with the AccountLoader pass), inferred structs,
//! native deserializers, role names and field names.

use crate::accounts::Kind;
use crate::anchor::{accounts_layout, anchor_fn};
use crate::anchorstate::{account_objects, copy_leaves};
use crate::cpi::{cpi_desc, find_cpi_sites, format_ix, CpiEnv, SiteKind};
use crate::cpiexec::{describe_model, ExecBudget, ExecSiteKind};
use crate::decompile::{call_insns, invoke_abi, pascal_ix, Dx};
use crate::fieldnames::{name_fields, role_names, FieldNameCfg};
use crate::structs::{infer_structs, StructCfg};
use crate::util::*;
use crate::views::{expr_type, fid, Field, View, Views, FT};
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, Term, E};
use sbpf_program::Func;
use sbpf_struct::{SNode, Tree};
use sbpf_ir::fx::{HashMap, HashSet};

/// declaredId: the one key compared in the functions using DeclaredProgramIdMismatch (4100).
pub fn declared_id(d: &Dx) -> Option<String> {
    let mut keys: IndexSet<String> = IndexSet::default();
    let key_at = |a: u64| d.sem.key_at(a);
    for f in &d.fs {
        let ir = f.ir.as_ref().unwrap();
        let mut raises = false;
        let mut found: IndexSet<String> = IndexSet::default();
        let mut visit = |e: E, found: &mut IndexSet<String>, raises: &mut bool| {
            ir.walk(e, &mut |_, x| {
                if x == Node::Const(0x1004) {
                    *raises = true;
                }
                match x {
                    Node::Fn(n, args) if ir.with_name(n, |s| s == "keyeq") => {
                        found.insert(key_b58(ir, args, 1));
                    }
                    _ => {}
                }
                let pair = match x {
                    Node::Fn(n, args) if ir.with_name(n, |s| s == "memeq") => Some(args),
                    Node::Call(_, args)
                        if args.len >= 3 && ir.get(ir.at(args, 2)) == Node::Const(32) =>
                    {
                        Some(args)
                    }
                    _ => None,
                };
                if let Some(args) = pair {
                    for i in 0..args.len.min(2) {
                        if let Node::Const(v) = ir.get(ir.at(args, i)) {
                            if let Some(k) = key_at(v) {
                                found.insert(k);
                            }
                        }
                    }
                }
            })
        };
        for b in &f.blocks {
            for s in &b.stmts {
                for e in stmt_exprs(ir, s) {
                    visit(e, &mut found, &mut raises);
                }
                if let Stmt::Call { args, .. } = s {
                    if args.len >= 3 && ir.get(ir.at(*args, 2)) == Node::Const(32) {
                        for i in 0..2 {
                            if let Node::Const(v) = ir.get(ir.at(*args, i)) {
                                if let Some(k) = key_at(v) {
                                    found.insert(k);
                                }
                            }
                        }
                    }
                }
            }
            if let Term::Br { c, .. } = &b.term {
                visit(*c, &mut found, &mut raises);
            }
        }
        if raises {
            for k in found {
                keys.insert(k);
            }
        }
    }
    if keys.len() == 1 {
        return keys.first().cloned();
    }
    let own: Vec<&String> = keys
        .iter()
        .filter(|k| crate::sem::known_key(k).is_none())
        .collect();
    if own.len() == 1 {
        Some(own[0].clone())
    } else {
        None
    }
}

/// keyB58 of the constant words args[from..]
pub fn key_b58(ir: &Ir, args: sbpf_ir::L, from: u32) -> String {
    let mut b = [0u8; 32];
    for i in from..args.len {
        let k = (i - from) as usize * 8;
        if k + 8 > 32 {
            break;
        }
        if let Node::Const(v) = ir.get(ir.at(args, i)) {
            b[k..k + 8].copy_from_slice(&v.to_le_bytes());
        }
    }
    b58(&b)
}

/// keyCompares: known keys the 32 bytes at `ptr` are compared with somewhere in f.
pub fn key_compares(d: &Dx, f: &Func, ptr: E) -> Vec<String> {
    let ir = f.ir.as_ref().unwrap();
    let mut out: IndexSet<String> = IndexSet::default();
    let name = |b: &str| crate::sem::known_key(b).map_or(format!("key {b}"), |s| s.to_string());
    let other = |xs: &[E]| -> Option<E> {
        if xs.len() < 2 {
            return None;
        }
        if expr_eq(ir, xs[0], ptr) {
            Some(xs[1])
        } else if expr_eq(ir, xs[1], ptr) {
            Some(xs[0])
        } else {
            None
        }
    };
    let visit = |e: E, out: &mut IndexSet<String>| {
        ir.walk(e, &mut |_, x| {
            if let Node::Fn(n, args) = x {
                if ir.with_name(n, |s| s == "keyeq")
                    && args.len > 0
                    && expr_eq(ir, ir.at(args, 0), ptr)
                {
                    out.insert(name(&key_b58(ir, args, 1)));
                }
            }
            let pair = match x {
                Node::Fn(n, args) if ir.with_name(n, |s| s == "memeq") => Some(args),
                Node::Call(_, args)
                    if args.len >= 3 && ir.get(ir.at(args, 2)) == Node::Const(32) =>
                {
                    Some(args)
                }
                _ => None,
            };
            if let Some(args) = pair {
                let o = other(&ir.to_vec(args));
                if let Some(Node::Const(v)) = o.map(|o| ir.get(o)) {
                    if let Some(k) = d.sem.key_at(v) {
                        out.insert(name(&k));
                    }
                }
            }
        })
    };
    for b in &f.blocks {
        for s in &b.stmts {
            for e in stmt_exprs(ir, s) {
                visit(e, &mut out);
            }
            if let Stmt::Call { args, .. } = s {
                if args.len >= 3 && ir.get(ir.at(*args, 2)) == Node::Const(32) {
                    if let Some(Node::Const(v)) = other(&ir.to_vec(*args)).map(|o| ir.get(o)) {
                        if let Some(k) = d.sem.key_at(v) {
                            out.insert(name(&k));
                        }
                    }
                }
            }
        }
        if let Term::Br { c, .. } = &b.term {
            visit(*c, &mut out);
        }
    }
    out.into_iter().collect()
}

/// IDL notes, Anchor account names (anchorFn), try_accounts functions, account objects, the Accounts /
/// Context views, CPI names and the view types. Returns nameFn.
pub fn anchor_accounts(d: &mut Dx, name_fn: Option<i64>) {
    // IDL: accounts and arguments of each handler
    if let Some(idl) = d.idl {
        for (hpc, ix) in d.sem.ix_names.clone() {
            let Some(dd) = idl.instructions.iter().find(|i| i.name == ix) else {
                continue;
            };
            if !d.idx.contains_key(&hpc) {
                continue;
            }
            let l = d.fn_notes.entry(hpc).or_default();
            let acc: Vec<String> = dd
                .accounts
                .iter()
                .enumerate()
                .map(|(i, x)| format!("{i} {x}"))
                .collect();
            l.push(format!(
                "accounts [idl]: {}",
                if acc.is_empty() {
                    "(none)".into()
                } else {
                    acc.join(", ")
                }
            ));
            l.push(format!(
                "args [idl]: {}",
                if dd.args.is_empty() {
                    "(none)".into()
                } else {
                    dd.args.join(", ")
                }
            ));
        }
    }
    if d.sem.anchor {
        if let Some(nf) = name_fn {
            // (each function on its own: anchor_fn only reads the function and the program; results in order)
            let sh = crate::util::Shared(&*d);
            let found = crate::util::par_map_big(d.fs.len(), d.threads, |i| {
                let d = sh.get();
                let f = d.fs[i];
                let ai = &d.account_infos[i];
                let sa = |p: u64, n: u64| d.str_at(p, n, false);
                let en = |v: u64| d.sem.anchor_error(v);
                let isacc = |v: u32| ai.get(&format!("v{v}")) == Some(&Kind::Info);
                crate::util::SendBox(anchor_fn(f, &d.trees[i], nf, &sa, &en, &isacc).map(|a| (f.pc, a)))
            });
            for x in found {
                if let Some((pc, a)) = x.0 {
                    d.anchor_info.insert(pc, a);
                }
            }
            let mut taken: HashSet<String> = d.pn.by_pc.values().cloned().collect();
            for (hpc, ix) in d.sem.ix_names.clone() {
                let Some(&hi) = d.idx.get(&hpc) else { continue };
                let tree = &d.trees[hi];
                let f = d.fs[hi];
                let ir = f.ir.as_ref().unwrap();
                let mut tpc: Option<i64> = None;
                fn visit(ir: &Ir, tree: &Tree, ns: &[SNode], hit: &mut dyn FnMut(i64)) {
                    let mut in_expr = |e: E, hit: &mut dyn FnMut(i64)| {
                        ir.walk(e, &mut |_, x| {
                            if let Node::Call(t, _) = x {
                                if let CallTarget::Fn { pc } = ir.target(t) {
                                    hit(pc);
                                }
                            }
                        })
                    };
                    for n in ns {
                        match n {
                            SNode::Stmt(si) => {
                                let s = tree.stmt(*si);
                                if let Stmt::Call {
                                    t: CallTarget::Fn { pc },
                                    ..
                                } = s
                                {
                                    hit(*pc);
                                }
                                for e in stmt_exprs(ir, s) {
                                    in_expr(e, hit);
                                }
                            }
                            SNode::If { c, then, els } => {
                                in_expr(*c, hit);
                                visit(ir, tree, then, hit);
                                visit(ir, tree, els, hit);
                            }
                            SNode::Return(Some(e)) => in_expr(*e, hit),
                            _ => {
                                for c in child_lists(n) {
                                    visit(ir, tree, c, hit);
                                }
                            }
                        }
                    }
                }
                {
                    let ai = &d.anchor_info;
                    let mut hit = |t: i64| {
                        if tpc.is_none() && t != hpc && ai.contains_key(&t) {
                            tpc = Some(t);
                        }
                    };
                    visit(ir, tree, &tree.body, &mut hit);
                }
                let Some(tpc) = tpc else { continue };
                d.try_of.insert(hpc, tpc);
                let old = d.fn_name(tpc);
                let an = format!("accounts_{ix}");
                if is_fn_hex(&old) && !taken.contains(&an) {
                    d.rename(tpc, &an);
                    taken.insert(an.clone());
                    d.fn_notes.entry(tpc).or_default().push(format!(
                        "Anchor Accounts::try_accounts of instruction {ix} (called by ix_{ix}; name [str]: from the handler's \"Instruction: …\" log; was {old})"
                    ));
                }
                let accs = d.anchor_info[&tpc].accounts.clone();
                if !d
                    .idl
                    .is_some_and(|i| i.instructions.iter().any(|x| x.name == ix))
                {
                    d.fn_notes.entry(hpc).or_default().push(format!(
                        "accounts [str: the program's account-error strings, in order of first use]: {}",
                        accs.join(", ")
                    ));
                }
                d.str_accounts.insert(hpc, accs);
            }
        }
    }
    // boxed accounts deserialized by try_accounts
    let idl_addr = d
        .idl
        .and_then(|i| i.address.clone())
        .filter(|a| !a.is_empty());
    let state_addr: Option<String> = match d.idl {
        Some(_) if idl_addr.is_none() => declared_id(d),
        Some(_) => idl_addr.clone(),
        None => None,
    };
    let mut named_discs: IndexMap<u64, String> = IndexMap::default();
    for (dv, n) in &d.sem.disc {
        if let Some(r) = n.strip_prefix("account:") {
            if !d.idl.is_some_and(|i| i.accounts.iter().any(|a| a.1 == *dv)) {
                named_discs.insert(*dv, r.to_string());
            }
        }
    }
    let owner_id = state_addr.clone().or_else(|| {
        if !named_discs.is_empty() && !d.try_of.is_empty() {
            declared_id(d)
        } else {
            None
        }
    });
    d.state_idl_address = state_addr.clone();
    if let (Some(nf), false) = (name_fn, d.try_of.is_empty()) {
        let mut seen = IndexSet::default();
        for &t in d.try_of.values() {
            seen.insert(t);
        }
        let fns: Vec<(i64, &Func, &Tree)> = seen
            .iter()
            .map(|&pc| {
                let i = d.idx[&pc];
                (pc, d.fs[i], &d.trees[i])
            })
            .collect();
        let named = if !named_discs.is_empty() && owner_id.is_some() {
            Some((&named_discs, owner_id.as_deref().unwrap()))
        } else {
            None
        };
        let pn = d.pn.clone();
        let fnames = move |pc: i64| pn.by_pc.get(&pc).cloned();
        let sa = |p: u64, n: u64| d.sem.str_at(p, n, false);
        let mut views = std::mem::take(&mut d.views);
        let objs = account_objects(
            &d.state_ctx,
            d.p,
            &fnames,
            d.idl,
            state_addr.as_deref(),
            &mut views,
            &fns,
            nf,
            &sa,
            named,
        );
        d.views = views;
        d.obj_vars = objs;
    }
    accounts_views(d);
    cpi_naming(d);
    view_types(d);
}

fn accounts_views(d: &mut Dx) {
    let mut acct_field_type: IndexMap<(String, K), (String, bool)> = IndexMap::default();
    for (hpc, tpc) in d.try_of.clone() {
        let ix = d.sem.ix_names[&hpc].clone();
        let objs = d.obj_vars.get(&tpc).cloned();
        let mut named: IndexMap<u32, String> = d.anchor_info[&tpc].var_names.clone();
        if let Some(o) = &objs {
            for (v, a) in &o.boxes {
                named.insert(*v, a.name.clone());
            }
        }
        let obj_view: IndexMap<String, crate::anchorstate::AccountObj> = objs
            .as_ref()
            .map(|o| {
                o.boxes
                    .values()
                    .map(|a| (a.name.clone(), a.clone()))
                    .collect()
            })
            .unwrap_or_default();
        let layout = accounts_layout(d.f(tpc).unwrap(), &named);
        let mut fields: Vec<Field> = Vec::new();
        let inl: Vec<(K, crate::anchorstate::AccountObj)> = objs
            .as_ref()
            .map(|o| o.inline.iter().map(|(k, a)| (*k, a.clone())).collect())
            .unwrap_or_default();
        let views = &d.views;
        let covered = |off: N| {
            inl.iter().any(|(o, a)| {
                off >= o.get()
                    && off < o.get() + views.map.get(&a.view).and_then(|v| v.size).unwrap_or(8.0)
            })
        };
        if let Some(o) = &objs {
            for (off, a) in &o.refs {
                if !covered(off.get()) {
                    fields.push(Field {
                        id: fid(),
                        name: a.name.clone(),
                        off: off.get(),
                        t: FT::Ref(a.view.clone()),
                        doc: Some(format!("Box<Account<{}>>", a.rust)),
                        count: None,
                    });
                }
            }
        }
        for (off, nm) in &layout {
            let off = off.get();
            if !covered(off)
                && !inl.iter().any(|(_, a)| &a.name == nm)
                && !fields.iter().any(|x| x.off == off || &x.name == nm)
            {
                fields.push(Field {
                    id: fid(),
                    name: nm.clone(),
                    off,
                    t: FT::Ref(
                        obj_view
                            .get(nm)
                            .map_or("AccountInfo".to_string(), |o| o.view.clone()),
                    ),
                    doc: obj_view
                        .get(nm)
                        .map(|o| format!("Box<Account<{}>>", o.rust)),
                    count: None,
                });
            }
        }
        for (off, a) in &inl {
            fields.push(Field {
                id: fid(),
                name: a.name.clone(),
                off: off.get(),
                t: FT::Embed(a.view.clone()),
                doc: Some(format!("Account<{}> in place", a.rust)),
                count: None,
            });
        }
        if let Some(o) = &objs {
            for (off, (nm, ty, embed)) in &o.infos {
                let off = off.get();
                if covered(off) || fields.iter().any(|x| x.off == off || &x.name == nm) {
                    continue;
                }
                if *embed {
                    fields.push(Field {
                        id: fid(),
                        name: nm.clone(),
                        off,
                        t: FT::Embed("AccountInfo".into()),
                        doc: Some(format!(
                            "the AccountInfo (a copy in place){}",
                            ty.as_ref().map_or(String::new(), |t| format!(
                                " of an account of type {t} (data not deserialized here)"
                            ))
                        )),
                        count: None,
                    });
                } else {
                    fields.push(Field {
                        id: fid(),
                        name: nm.clone(),
                        off,
                        t: FT::Ref("AccountInfo".into()),
                        doc: ty.as_ref().map(|t| {
                            format!("the &AccountInfo of an account of type {t} (e.g. AccountLoader<{t}>: data not deserialized)")
                        }),
                        count: None,
                    });
                }
                if let Some(t) = ty {
                    acct_field_type.insert((ix.clone(), K::of(off)), (t.clone(), *embed));
                }
            }
        }
        if fields.is_empty() {
            continue;
        }
        d.acct_layouts.insert(hpc, fields.clone());
        let pp = pascal_ix(&ix);
        let acc_name = format!("{pp}Accounts");
        let ctx_name = format!("{pp}Context");
        if d.views.map.contains_key(&acc_name) || d.views.map.contains_key(&ctx_name) {
            continue;
        }
        let mut ctx_layout: Option<String> = None;
        // the handler
        let hi = d.idx[&hpc];
        let hf = d.fs[hi];
        let hir = hf.ir.as_ref().unwrap();
        let fpv = fp_var(hf);
        let prog = d
            .abi_names
            .get(&hpc)
            .and_then(|m| m.iter().find(|(_, n)| *n == "program_id").map(|(v, _)| *v))
            .or_else(|| param_var(hf, 2));
        let (Some(fpv), Some(prog)) = (fpv, prog) else {
            if ctx_layout.is_none() {
                // (never reached: the TS continues before the fallback below)
            }
            continue;
        };
        let fo = |e: Option<E>| e.and_then(|e| fo_any(hir, e, Some(fpv)));
        let mut defs: HashMap<u32, Vec<E>> = HashMap::default();
        for b in &hf.blocks {
            for st in &b.stmts {
                if let Stmt::Set { dst, e, .. } = st {
                    defs.entry(*dst as u32).or_default().push(*e);
                }
            }
        }
        let (mut r_, mut s_) = (None, None);
        for b in &hf.blocks {
            for st in &b.stmts {
                if let Stmt::Call {
                    t: CallTarget::Fn { pc },
                    args,
                    ..
                } = st
                {
                    if *pc == tpc {
                        r_ = fo(if args.len > 0 {
                            Some(hir.at(*args, 0))
                        } else {
                            None
                        });
                        s_ = fo(if args.len > 2 {
                            Some(hir.at(*args, 2))
                        } else {
                            None
                        });
                    }
                }
            }
        }
        let Some(rr) = r_ else { continue };
        let mut copies_s: HashSet<K> = HashSet::default();
        if let Some(ss) = s_ {
            for b in &hf.blocks {
                for st in &b.stmts {
                    if let Stmt::Copy {
                        n: 16, src, dst, ..
                    } = st
                    {
                        if fo(Some(*src)) == Some(ss) {
                            if let Some(dd) = fo(Some(*dst)) {
                                copies_s.insert(K::of(dd));
                            }
                        }
                    }
                }
            }
        }
        let single = |e: E| -> E {
            if let Node::Var(v) = hir.get(e) {
                if let Some(ds) = defs.get(&v) {
                    if ds.len() == 1 {
                        return ds[0];
                    }
                }
            }
            e
        };
        let loads_s = |e: Option<E>, k: N| -> bool {
            let Some(e) = e else { return false };
            let e = single(e);
            match (s_, hir.get(e)) {
                (Some(ss), Node::Load { size: 8, addr }) => fo(Some(addr)) == Some(ss + k),
                _ => false,
            }
        };
        let from_r = |e: E| -> Option<N> {
            let e = single(e);
            let o = match hir.get(e) {
                Node::Load { size: 8, addr } => fo(Some(addr)),
                _ => None,
            }?;
            if o >= rr && o < rr + 2048.0 {
                Some(o - rr)
            } else {
                None
            }
        };
        let mut fcopies: Vec<(N, N, N)> = Vec::new();
        for b in &hf.blocks {
            for st in &b.stmts {
                if let Stmt::Copy { dst, src, n, .. } = st {
                    if let (Some(dd), Some(ss)) = (fo(Some(*dst)), fo(Some(*src))) {
                        fcopies.push((dd, ss, *n as N));
                    }
                    continue;
                }
                let Some((t, args)) = call_of(hir, st) else {
                    continue;
                };
                if args.len < 3 {
                    continue;
                }
                let Node::Const(n) = hir.get(hir.at(args, 2)) else {
                    continue;
                };
                let is_copy = match &t {
                    CallTarget::Sys { name, .. } => {
                        &**name == "sol_memcpy_" || &**name == "sol_memmove_"
                    }
                    CallTarget::Fn { pc } => is_memcpy_name(&d.fn_name(*pc)),
                    _ => false,
                };
                let (dd, ss) = (fo(Some(hir.at(args, 0))), fo(Some(hir.at(args, 1))));
                if let (true, Some(dd), Some(ss)) = (is_copy, dd, ss) {
                    fcopies.push((dd, ss, n as N));
                }
            }
        }
        fn copy_of_r(fc: &[(N, N, N)], rr: N, g: N, depth: u32) -> Option<N> {
            if g >= rr && g <= rr + 16.0 {
                return Some(g - rr);
            }
            if depth > 4 {
                return None;
            }
            for &(dd, ss, n) in fc {
                if g >= dd && g < dd + n && dd != ss {
                    if let Some(r) = copy_of_r(fc, rr, ss + g - dd, depth + 1) {
                        return Some(r);
                    }
                }
            }
            None
        }
        let mut slot_vals: HashMap<K, Vec<E>> = HashMap::default();
        for b in &hf.blocks {
            for st in &b.stmts {
                match st {
                    Stmt::Store {
                        size: 8, addr, v, ..
                    } => {
                        if let Some(o) = fo(Some(*addr)) {
                            slot_vals.entry(K::of(o)).or_default().push(*v);
                        }
                    }
                    Stmt::Stores {
                        size: 8,
                        addr,
                        vals,
                        ..
                    } => {
                        if let Some(o) = fo(Some(*addr)) {
                            for (i, v) in hir.items(*vals).enumerate() {
                                slot_vals
                                    .entry(K::of(o + 8.0 * i as N))
                                    .or_default()
                                    .push(v);
                            }
                        }
                    }
                    _ => {}
                }
            }
        }
        let is_prog = |e: Option<E>| -> bool {
            let Some(e) = e else { return false };
            let Node::Var(id) = hir.get(e) else {
                return false;
            };
            if id == prog {
                return true;
            }
            if hf.blocks[0].stmts.iter().any(|st| {
                matches!(st, Stmt::Set { dst, e: x, .. } if *dst == id as i32 && hir.get(*x) == Node::Var(prog))
            }) {
                return true;
            }
            let Some(dd) = defs.get(&id) else {
                return false;
            };
            if dd.len() != 1 {
                return false;
            }
            let Node::Load { size: 8, addr } = hir.get(dd[0]) else {
                return false;
            };
            let Some(o) = fo(Some(addr)) else {
                return false;
            };
            match slot_vals.get(&K::of(o)) {
                Some(vs) => vs.len() == 1 && hir.get(vs[0]) == Node::Var(prog),
                None => false,
            }
        };
        let trees: &[Tree] = d.trees;
        let htree = &trees[hi];
        let dref: &Dx = d;
        let sites = find_cpi_sites(
            hir,
            htree,
            &htree.body,
            Some(fpv),
            &|t: &CallTarget| match t {
                CallTarget::Fn { pc } if *pc != tpc && dref.idx.contains_key(pc) => {
                    Some(SiteKind::Call)
                }
                _ => None,
            },
        );
        let mut new_param_types: Vec<(i64, u32)> = Vec::new();
        let mut accounts_view_calls: Vec<N> = Vec::new();
        let mut ctx_calls: Vec<(N, N, Option<N>, N)> = Vec::new();
        // (the views are made below in call order; here the calls are collected in the same order)
        struct Ctxs {
            ctx_layout: Option<String>,
        }
        let mut cx = Ctxs { ctx_layout: None };
        let _ = &mut cx;
        let _ = (&mut accounts_view_calls, &mut ctx_calls);
        let mut acct_shift_set: Option<N> = None;
        let mut views_added: Vec<View> = Vec::new();
        let mut afv: Vec<((String, K), (String, bool))> = Vec::new();
        {
            let accounts_view = |shift: N,
                                 views_added: &mut Vec<View>,
                                 afv: &mut Vec<((String, K), (String, bool))>,
                                 acct_shift_set: &mut Option<N>|
             -> bool {
                let mut afs: Vec<Field> = fields
                    .iter()
                    .filter(|x| x.off >= shift)
                    .map(|x| Field {
                        id: fid(),
                        off: x.off - shift,
                        ..x.clone()
                    })
                    .collect();
                if afs.is_empty() {
                    return false;
                }
                for x in &afs {
                    if let Some(a) = acct_field_type.get(&(ix.clone(), K::of(x.off + shift))) {
                        afv.push(((acc_name.clone(), K::of(x.off)), a.clone()));
                    }
                }
                afs.sort_by(|a, b| a.off.partial_cmp(&b.off).unwrap());
                views_added.push(View {
                    name: acc_name.clone(),
                    doc: format!(
                        "Accounts struct of instruction {ix} as accounts_{ix} returns it{}: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]",
                        if shift != 0.0 { format!(" (at +0x{} of its out object)", js_hex(shift)) } else { String::new() }
                    ),
                    size: None,
                    fields: afs,
                    builtin: false,
                });
                *acct_shift_set = Some(shift);
                true
            };
            let mut ctx_view = |op: N,
                                oa: N,
                                or: Option<N>,
                                shift: N,
                                views_added: &mut Vec<View>,
                                afv: &mut Vec<((String, K), (String, bool))>,
                                acct_shift_set: &mut Option<N>|
             -> bool {
                let key = format!(
                    "{}:{}:{}:{}",
                    js_num(op),
                    js_num(oa),
                    or.map_or("undefined".to_string(), js_num),
                    js_num(shift)
                );
                if let Some(l) = &ctx_layout {
                    return *l == key;
                }
                if !accounts_view(shift, views_added, afv, acct_shift_set) {
                    return false;
                }
                ctx_layout = Some(key);
                let mut fs = vec![
                    Field {
                        id: fid(),
                        name: "program_id".into(),
                        off: op,
                        t: FT::Ref("Pubkey".into()),
                        doc: None,
                        count: None,
                    },
                    Field {
                        id: fid(),
                        name: "accounts".into(),
                        off: oa,
                        t: FT::Ref(acc_name.clone()),
                        doc: None,
                        count: None,
                    },
                ];
                if let Some(or) = or {
                    fs.push(Field {
                        id: fid(),
                        name: "remaining_accounts".into(),
                        off: or,
                        t: FT::Ref("AccountInfo".into()),
                        doc: Some(
                            "&[AccountInfo]: the accounts after the instruction's own".into(),
                        ),
                        count: None,
                    });
                    fs.push(Field {
                        id: fid(),
                        name: "remaining_accounts_len".into(),
                        off: or + 8.0,
                        t: FT::Scalar(8),
                        doc: None,
                        count: None,
                    });
                }
                fs.sort_by(|a, b| a.off.partial_cmp(&b.off).unwrap());
                views_added.push(View {
                    name: ctx_name.clone(),
                    doc: format!(
                        "anchor_lang Context of instruction {ix} (program_id, accounts{}{}), as the handler builds it [layout from the handler's stores]",
                        if or.is_some() { ", remaining_accounts" } else { "" },
                        if op == 0.0 && oa == 8.0 { "" } else { "; other fields not shown" }
                    ),
                    size: None,
                    fields: fs,
                    builtin: false,
                });
                true
            };
            for (_, (_, site)) in &sites {
                let Some(CallTarget::Fn { pc: cpc }) = &site.t else {
                    continue;
                };
                let cpc = *cpc;
                let Some(callee) = dref.f(cpc) else { continue };
                for (i, &arg) in site.args.iter().enumerate() {
                    let Some(ff) = fo(Some(arg)) else { continue };
                    let word = |k: N| {
                        site.facts
                            .iter()
                            .find(|x| x.off == ff + k && x.size == 8.0)
                            .map(|x| x.e)
                    };
                    let (mut op, mut oa, mut shift): (Option<N>, Option<N>, N) = (None, None, 0.0);
                    let mut k = 0.0;
                    while k < 64.0 && (op.is_none() || oa.is_none()) {
                        let w = word(k);
                        let g = fo(w);
                        if op.is_none() && is_prog(w) {
                            op = Some(k);
                            k += 8.0;
                            continue;
                        }
                        if oa.is_some() || g.is_none() || g == Some(ff) {
                            k += 8.0;
                            continue;
                        }
                        let g = g.unwrap();
                        let fact = site.facts.iter().find(|x| {
                            x.size == 8.0
                                && x.off >= g
                                && x.off < g + 2048.0
                                && from_r(x.e).is_some()
                        });
                        let sh = match fact {
                            Some(x) => Some(from_r(x.e).unwrap() - (x.off - g)),
                            None => copy_of_r(&fcopies, rr, g, 0),
                        };
                        if let Some(sh) = sh {
                            if (0.0..=16.0).contains(&sh) {
                                oa = Some(k);
                                shift = sh;
                            }
                        }
                        k += 8.0;
                    }
                    let (Some(op), Some(oa)) = (op, oa) else {
                        continue;
                    };
                    let mut or: Option<N> = None;
                    let mut k = 0.0;
                    while k < 64.0 && or.is_none() {
                        if k != op
                            && k != oa
                            && ((loads_s(word(k), 0.0) && loads_s(word(k + 8.0), 8.0))
                                || copies_s.contains(&K::of(ff + k)))
                        {
                            or = Some(k);
                        }
                        k += 8.0;
                    }
                    let reg = arg_reg(callee, i);
                    let Some(pv) = callee.vars.iter().find(|v| v.param == reg) else {
                        continue;
                    };
                    if dref.def_count(cpc, pv.id) != 0 {
                        continue;
                    }
                    if !ctx_view(
                        op,
                        oa,
                        or,
                        shift,
                        &mut views_added,
                        &mut afv,
                        &mut acct_shift_set,
                    ) {
                        continue;
                    }
                    new_param_types.push((cpc, pv.id));
                }
            }
            if ctx_layout.is_none() {
                accounts_view(
                    if fields.iter().any(|x| x.off == 0.0) {
                        0.0
                    } else {
                        8.0
                    },
                    &mut views_added,
                    &mut afv,
                    &mut acct_shift_set,
                );
            }
        }
        for v in views_added {
            d.views.add(v);
        }
        for (k, v) in afv {
            d.acct_field_view.insert(k, v);
        }
        if let Some(s) = acct_shift_set {
            d.acct_shift.insert(hpc, s);
        }
        for (cpc, v) in new_param_types {
            d.param_types.entry(cpc).or_default().insert(
                v,
                (
                    ctx_name.clone(),
                    format!("the handler ix_{ix} passes a frame object holding (program_id, address of a copy of the Accounts result)"),
                ),
            );
        }
    }
}

fn cpi_naming(d: &mut Dx) {
    let mut taken: HashSet<String> = d.pn.by_pc.values().cloned().collect();
    let mut name_budget = ExecBudget { steps: 100_000 };
    let pcs: Vec<i64> = d.fs.iter().map(|f| f.pc).collect();
    for pc in pcs {
        let fi = d.idx[&pc];
        let f = d.fs[fi];
        let Some(fpv) = fp_var(f) else { continue };
        if !is_fn_hex(&d.fn_name(pc)) {
            continue;
        }
        let size: usize = f.blocks.iter().map(|b| b.stmts.len()).sum();
        if size > 120 {
            continue;
        }
        let ir = f.ir.as_ref().unwrap();
        let trees: &[Tree] = d.trees;
        let tree = &trees[fi];
        let cpi_only = |a: Option<SiteKind>| match a {
            Some(SiteKind::C) | Some(SiteKind::Rust) => a,
            _ => None,
        };
        let dref: &Dx = d;
        let sites = find_cpi_sites(ir, tree, &tree.body, Some(fpv), &|t: &CallTarget| match t {
            CallTarget::Sys { name, .. } => cpi_only(invoke_abi(name)),
            CallTarget::Fn { pc } => cpi_only(dref.invoke_thunks.get(pc).copied()).or(
                if dref.invoke_wrappers.contains(pc) {
                    Some(SiteKind::Invoke)
                } else {
                    None
                },
            ),
            _ => None,
        });
        if sites.len() != 1 {
            continue;
        }
        let (node, site) = sites.values().next().unwrap();
        let ka = |a: u64| dref.sem.key_at(a);
        let sa = |a: u64, n: u64| dref.sem.str_at(a, n, true);
        let rd = |a: u128, n: usize| dref.sem.read_ro(a, n);
        let mut ex = |_: E| String::new();
        let mut env = CpiEnv {
            ir,
            fp: Some(fpv),
            expr: &mut ex,
            key_at: Some(&ka),
            str_at: Some(&sa),
            const_name: None,
            read: Some(&rd),
            program_check: None,
            fn_at: None,
            named: None,
            tainted: None,
        };
        let mut dd = if site.abi == SiteKind::Invoke {
            None
        } else {
            cpi_desc(site, &mut env)
        };
        let mut ran = false;
        if dd.as_ref().is_none_or(|x| x.ix.is_none()) {
            let kind = match &site.t {
                Some(CallTarget::Sys { .. }) => Some(ExecSiteKind::Sys),
                Some(CallTarget::Fn { pc: t }) => {
                    if dref.invoke_thunks.contains_key(t) {
                        Some(ExecSiteKind::Thunk)
                    } else if dref.invoke_wrappers.contains(t) {
                        Some(ExecSiteKind::Wrapper)
                    } else {
                        None
                    }
                }
                _ => None,
            };
            let t = match &site.t {
                Some(CallTarget::Fn { pc: t }) => Some(format!("fn:{t}")),
                Some(CallTarget::Sys { name, .. }) => Some(format!("sys:{name}")),
                _ => None,
            };
            let at = match node {
                SNode::Stmt(si) if matches!(tree.stmt(*si), Stmt::Call { .. }) => {
                    Some(stmt_pc(tree.stmt(*si)))
                }
                _ => match &t {
                    Some(t) => {
                        let l = call_insns(dref, pc, t);
                        if l.len() == 1 {
                            Some(l[0])
                        } else {
                            None
                        }
                    }
                    None => None,
                },
            };
            if let (Some(kind), Some(at)) = (kind, at) {
                if name_budget.steps > 0 {
                    if let Some(m) =
                        describe_model(dref.ctx, f, at, kind, &mut env, &mut name_budget)
                    {
                        if let Some(x) = m.format(&mut env) {
                            if x.ix.is_some() && !x.guessed {
                                dd = Some(x);
                                ran = true;
                            }
                        }
                    }
                }
            }
        }
        let Some(dd) = dd.filter(|x| x.ix.is_some()) else {
            continue;
        };
        let ixn = dd.ix.clone().unwrap();
        let base = format!(
            "cpi_{}_{}",
            dd.family.clone().unwrap_or_default(),
            camel_us(&ixn).to_lowercase()
        );
        let mut nm = base.clone();
        let mut k = 2;
        while taken.contains(&nm) {
            nm = format!("{base}_{k}");
            k += 1;
        }
        let old = d.fn_name(pc);
        d.rename(pc, &nm);
        taken.insert(nm);
        let note = if dd.guessed {
            format!(
                "name [heur]: its CPI's data and accounts match {} {}, but the program id is not a constant here (was {old})",
                if dd.family.as_deref() == Some("token") { "SPL Token" } else { "System" },
                ixn
            )
        } else {
            format!(
                "name [known{}]: makes the CPI {ixn} of a well-known program{} (was {old})",
                if ran { ", exec" } else { "" },
                if ran {
                    " (the instruction a run of it builds)"
                } else {
                    ""
                }
            )
        };
        d.fn_notes.entry(pc).or_default().push(note);
    }
}

fn pascal_name(s: &str) -> String {
    upper_first(s)
}

/// dataView: <T>Data, the account data after the discriminator.
fn data_view(views: &mut Views, ty: &str) -> Option<String> {
    let name = format!("{}Data", pascal_name(ty));
    if views.map.contains_key(&name) {
        return Some(name);
    }
    let acc = views
        .map
        .get(&format!("{}Account", pascal_name(ty)))?
        .clone();
    let fs: Vec<Field> = acc
        .fields
        .iter()
        .filter(|x| x.off >= 8.0)
        .map(|x| Field {
            id: fid(),
            off: x.off - 8.0,
            ..x.clone()
        })
        .collect();
    if fs.is_empty() {
        return None;
    }
    views.add(View {
        name: name.clone(),
        doc: format!("the data of an account of type {ty} after its 8-byte discriminator, in place in the account (zero-copy: what AccountLoader::load / load_mut returns) [idl layout; the loader from a run]"),
        size: acc.size.map(|s| s - 8.0),
        fields: fs,
        builtin: false,
    });
    Some(name)
}

/// computeTypes: the view types of one function's variables.
pub fn compute_types(
    d: &mut Dx,
    pc: i64,
    struct_types: &IndexMap<i64, IndexMap<u32, String>>,
) -> IndexMap<u32, String> {
    let fi = d.idx[&pc];
    let f = d.fs[fi];
    let mut t: IndexMap<u32, String> = IndexMap::default();
    for (k, kind) in &d.account_infos[fi] {
        if let Some(n) = k.strip_prefix('v') {
            if !n.is_empty() && n.bytes().all(|c| c.is_ascii_digit()) {
                let ty = match kind {
                    Kind::Info => "AccountInfo",
                    Kind::Raw1 => "UnalignedAccount",
                    Kind::Raw => "AccountRecord",
                };
                t.insert(n.parse::<u32>().unwrap(), ty.into());
            }
        }
    }
    if let Some(a) = d.anchor_info.get(&pc) {
        for &v in &a.account_vars {
            t.entry(v).or_insert_with(|| "AccountInfo".into());
        }
    }
    if let Some(o) = d.obj_vars.get(&pc) {
        for (v, a) in &o.boxes {
            t.entry(*v).or_insert_with(|| a.view.clone());
        }
    }
    if let Some(m) = d.param_types.get(&pc) {
        for (v, (ty, _)) in m {
            t.entry(*v).or_insert_with(|| ty.clone());
        }
    }
    if let Some(m) = d.data_vars.get(&pc) {
        for (v, ty) in m {
            if !t.contains_key(v) || t[v] == "AccountRecord" {
                t.insert(*v, ty.clone());
            }
        }
    }
    if let Some(m) = struct_types.get(&pc) {
        for (v, ty) in m {
            t.entry(*v).or_insert_with(|| ty.clone());
        }
    }
    let ir = f.ir.as_ref().unwrap();
    let mut it = 0;
    let mut grew = true;
    while grew && it < 4 {
        grew = false;
        for b in &f.blocks {
            for st in &b.stmts {
                let Stmt::Set { dst, e, .. } = st else {
                    continue;
                };
                let dv = *dst as u32;
                if t.contains_key(&dv) || is_param(f, dv) || d.def_count(pc, dv) != 1 {
                    continue;
                }
                let ty = {
                    let tt = &t;
                    d.set_type(fi, *e, &|id| tt.get(&id).cloned())
                };
                if let Some(ty) = ty {
                    if d.views.map.contains_key(&ty) {
                        t.insert(dv, ty);
                        grew = true;
                    }
                }
            }
        }
        if !grew && it < 3 && !d.acct_field_view.is_empty() && loader_pass(d, fi, &mut t) {
            grew = true;
        }
        it += 1;
    }
    let _ = ir;
    t
}

/// The AccountLoader pass (see decompile.ts loaderPass).
fn loader_pass(d: &mut Dx, fi: usize, t: &mut IndexMap<u32, String>) -> bool {
    let f = d.fs[fi];
    let pc = f.pc;
    let Some(fpv) = fp_var(f) else { return false };
    let ir = f.ir.as_ref().unwrap();
    let fo = |e: E| fo_any(ir, e, Some(fpv));
    let mut grew = false;
    let mut multi: IndexMap<u32, (String, IndexSet<(usize, usize)>)> = IndexMap::default();
    for (bi, b) in f.blocks.iter().enumerate() {
        let mut live: IndexMap<K, String> = IndexMap::default();
        for (si, st) in b.stmts.iter().enumerate() {
            if let Stmt::Set { dst, e, .. } = st {
                if let Node::Load { size: 8, addr } = ir.get(*e) {
                    let dv = fo(addr).and_then(|o| live.get(&K::of(o)).cloned());
                    let dst = *dst as u32;
                    if let Some(dv) = dv {
                        if !t.contains_key(&dst) && is_local(f, dst) {
                            if d.def_count(pc, dst) == 1 {
                                t.insert(dst, dv);
                                grew = true;
                            } else {
                                match multi.get_mut(&dst) {
                                    None => {
                                        let mut s = IndexSet::default();
                                        s.insert((bi, si));
                                        multi.insert(dst, (dv, s));
                                    }
                                    Some(m) => {
                                        if m.0 == dv {
                                            m.1.insert((bi, si));
                                        } else {
                                            m.0 = String::new();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if let Some((ct, args)) = call_of(ir, st) {
                let av = ir.to_vec(args);
                for &a in &av {
                    if let Some(o) = fo(a) {
                        let ks: Vec<K> = live.keys().copied().collect();
                        for w in ks {
                            if w.get() >= o && w.get() < o + 256.0 {
                                live.shift_remove(&w);
                            }
                        }
                    }
                }
                let out = av.first().and_then(|&a| fo(a));
                let ty = match (&ct, out, av.get(1)) {
                    (CallTarget::Fn { .. }, Some(_), Some(&a1)) => acct_of(d, ir, t, a1),
                    _ => None,
                };
                let view = ty.as_ref().and_then(|ty| data_view(&mut d.views, ty));
                let acc = ty
                    .as_ref()
                    .and_then(|ty| d.idl.and_then(|i| i.accounts.iter().find(|a| &a.0 == ty)));
                if let (Some(view), Some(acc), Some(addr), CallTarget::Fn { pc: cpc }) =
                    (view, acc, d.state_idl_address.clone(), &ct)
                {
                    let size = d
                        .views
                        .map
                        .get(&format!("{}Account", pascal_name(ty.as_ref().unwrap())))
                        .and_then(|v| v.size)
                        .unwrap_or(1024.0);
                    if let Some(w) = d.state_ctx.loader_word(*cpc, acc.1, &unb58(&addr), size) {
                        live.insert(K::of(out.unwrap() + w), view);
                    }
                }
            } else {
                let (o, n) = match st {
                    Stmt::Store { addr, size, .. } => (fo(*addr), *size as N),
                    Stmt::Stores {
                        addr, size, vals, ..
                    } => (fo(*addr), (*size as u32 * vals.len) as N),
                    Stmt::Copy { dst, n, .. } => (fo(*dst), *n as N),
                    _ => (None, 0.0),
                };
                if let Some(o) = o {
                    let ks: Vec<K> = live.keys().copied().collect();
                    for w in ks {
                        if w.get() + 8.0 > o && w.get() < o + n {
                            live.shift_remove(&w);
                        }
                    }
                }
            }
        }
    }
    for (v, (view, defs)) in multi {
        if !view.is_empty() && only_reached_by(f, v, &defs) {
            t.insert(v, view);
            grew = true;
        }
    }
    grew
}

fn acct_of(d: &Dx, ir: &Ir, t: &IndexMap<u32, String>, e: E) -> Option<String> {
    let is_load = matches!(ir.get(e), Node::Load { size: 8, .. });
    let ld = match ir.get(e) {
        Node::Load { size: 8, addr } => addr,
        _ => e,
    };
    let (id, off) = match ir.get(ld) {
        Node::Var(v) => (v, 0.0),
        Node::Bin(BinOp::Add, a, c) => match (ir.get(a), ir.get(c)) {
            (Node::Var(v), Node::Const(c)) => (v, n_s(c)),
            _ => return None,
        },
        _ => return None,
    };
    let vt = t.get(&id)?;
    let a = d.acct_field_view.get(&(vt.clone(), K::of(off)))?;
    let is_load_any = matches!(ir.get(e), Node::Load { .. });
    let _ = is_load;
    if a.1 == !is_load_any {
        Some(a.0.clone())
    } else {
        None
    }
}

/// onlyReachedBy: every access through v (+ c) is reached only by definitions in `defs`.
fn only_reached_by(f: &Func, v: u32, defs: &IndexSet<(usize, usize)>) -> bool {
    #[derive(Clone, Copy, PartialEq, Eq, Hash)]
    enum Df {
        Entry,
        S(usize, usize),
    }
    let ir = f.ir.as_ref().unwrap();
    let is_def = |s: &Stmt| dst_of(s) == Some(v);
    let mut out: HashMap<usize, IndexSet<Df>> = HashMap::default();
    let in_of = |bi: usize, out: &HashMap<usize, IndexSet<Df>>| -> IndexSet<Df> {
        let mut r = IndexSet::default();
        if bi == 0 {
            r.insert(Df::Entry);
        }
        for p in &f.blocks[bi].preds {
            if let Some(o) = out.get(p) {
                for x in o {
                    r.insert(*x);
                }
            }
        }
        r
    };
    let mut changed = true;
    let mut it = 0;
    while changed && it < 50 {
        changed = false;
        for (bi, b) in f.blocks.iter().enumerate() {
            let mut cur = in_of(bi, &out);
            for (si, s) in b.stmts.iter().enumerate() {
                if is_def(s) {
                    cur = [Df::S(bi, si)].into_iter().collect();
                }
            }
            let old = out.get(&b.id);
            let same =
                old.is_some_and(|o| o.len() == cur.len() && cur.iter().all(|x| o.contains(x)));
            if !same {
                out.insert(b.id, cur);
                changed = true;
            }
        }
        it += 1;
    }
    let mut uses = 0;
    let based = |a: E| match ir.get(a) {
        Node::Var(x) => x == v,
        Node::Bin(BinOp::Add, x, c) => {
            ir.get(x) == Node::Var(v) && matches!(ir.get(c), Node::Const(_))
        }
        _ => false,
    };
    let good = |cur: &IndexSet<Df>| {
        cur.iter()
            .all(|x| matches!(x, Df::S(b, s) if defs.contains(&(*b, *s))))
    };
    for (bi, b) in f.blocks.iter().enumerate() {
        let mut cur = in_of(bi, &out);
        for (si, s) in b.stmts.iter().enumerate() {
            let mut ok = true;
            if let Stmt::Store { addr, .. } | Stmt::Stores { addr, .. } = s {
                if based(*addr) {
                    uses += 1;
                    if !good(&cur) {
                        ok = false;
                    }
                }
            }
            for e in stmt_exprs(ir, s) {
                ir.walk(e, &mut |_, x| {
                    if let Node::Load { addr, .. } = x {
                        if based(addr) {
                            uses += 1;
                            if !good(&cur) {
                                ok = false;
                            }
                        }
                    }
                });
            }
            if is_def(s) {
                cur = [Df::S(bi, si)].into_iter().collect();
            }
            if !ok {
                return false;
            }
        }
        let mut ok = true;
        let mut chk = |e: E| {
            ir.walk(e, &mut |_, x| {
                if let Node::Load { addr, .. } = x {
                    if based(addr) {
                        uses += 1;
                        if !good(&cur) {
                            ok = false;
                        }
                    }
                }
            })
        };
        if let Term::Br { c, .. } = &b.term {
            chk(*c);
        }
        if let Term::Ret { e: Some(e) } = &b.term {
            chk(*e);
        }
        if !ok {
            return false;
        }
    }
    uses > 0
}

struct SCfg<'a, 'p> {
    d: &'a Dx<'p>,
}

impl StructCfg for SCfg<'_, '_> {
    fn funcs(&self) -> &[&Func] {
        &self.d.fs
    }
    fn func(&self, pc: i64) -> Option<&Func> {
        self.d.f(pc)
    }
    fn skip(&self, pc: i64) -> bool {
        self.d.is_lib(pc)
    }
    fn typed(&self, pc: i64, v: u32) -> bool {
        self.d
            .base_types
            .get(&pc)
            .is_some_and(|m| m.contains_key(&v))
    }
    fn fn_name(&self, pc: i64) -> String {
        self.d.fn_name(pc)
    }
    fn out_param(&self, pc: i64) -> bool {
        self.d.out_params.contains(&pc)
    }
    fn param_reg(&self, callee: i64, i: usize) -> i32 {
        arg_reg(self.d.f(callee).unwrap(), i)
    }
    fn data_ptr(&self, pc: i64, e: E, ir: &Ir, views: &Views) -> bool {
        let Node::Load { addr: a, .. } = ir.get(e) else {
            return false;
        };
        let Node::Bin(BinOp::Add, x, c) = ir.get(a) else {
            return false;
        };
        if ir.get(c) != Node::Const(0x18) {
            return false;
        }
        let bt = self.d.base_types.get(&pc);
        expr_type(views, ir, x, &|id| bt.and_then(|m| m.get(&id).cloned())).as_deref()
            == Some("DataCell")
    }
    fn field_hints(&self, pc: i64, reg: i32) -> Option<(IndexMap<K, Field>, String)> {
        if reg != 1 {
            return None;
        }
        let hpc = self
            .d
            .try_of
            .iter()
            .find(|(_, t)| **t == pc)
            .map(|(h, _)| *h)?;
        let fs = self.d.acct_layouts.get(&hpc)?;
        let mut m = IndexMap::default();
        for x in fs {
            m.insert(K::of(x.off), x.clone());
        }
        Some((
            m,
            "the account fields of the Accounts struct it returns".into(),
        ))
    }
}

fn view_types(d: &mut Dx) {
    let no_structs: IndexMap<i64, IndexMap<u32, String>> = IndexMap::default();
    let pcs: Vec<i64> = d.fs.iter().map(|f| f.pc).collect();
    for &pc in &pcs {
        let t = compute_types(d, pc, &no_structs);
        d.base_types.insert(pc, t);
    }
    // direct calls once: callee -> (caller, callee param var, argument)
    let mut call_args: IndexMap<i64, Vec<(i64, u32, E)>> = IndexMap::default();
    for f in &d.fs {
        let ir = f.ir.as_ref().unwrap();
        let pc = f.pc;
        let mut visit = |args: Vec<E>, cpc: i64| {
            let Some(callee) = d.f(cpc) else { return };
            if cpc == pc {
                return;
            }
            for (i, &a) in args.iter().enumerate() {
                let reg = arg_reg(callee, i);
                let Some(pv) = callee.vars.iter().find(|v| v.param == reg) else {
                    continue;
                };
                if d.def_count(cpc, pv.id) != 0 || matches!(ir.get(a), Node::Const(_)) {
                    continue;
                }
                call_args.entry(cpc).or_default().push((pc, pv.id, a));
            }
        };
        for b in &f.blocks {
            for st in &b.stmts {
                match st {
                    Stmt::Call {
                        t: CallTarget::Fn { pc: c },
                        args,
                        ..
                    } => visit(ir.to_vec(*args), *c),
                    Stmt::Set { e, .. } => {
                        if let Node::Call(t, args) = ir.get(*e) {
                            if let CallTarget::Fn { pc: c } = ir.target(t) {
                                visit(ir.to_vec(args), c);
                            }
                        }
                    }
                    _ => {}
                }
            }
        }
    }
    let mut struct_types: IndexMap<i64, IndexMap<u32, String>> = IndexMap::default();
    propagate(d, &call_args, &struct_types);
    // inferred struct layouts, then propagated again
    let mut views = std::mem::take(&mut d.views);
    let sres = {
        let cfg = SCfg { d: &*d };
        infer_structs(&cfg, &mut views)
    };
    d.views = views;
    let synth = sres.synth.clone();
    for (pc, m) in &sres.types {
        let filtered: IndexMap<u32, String> = m
            .iter()
            .filter(|(_, t)| synth.contains(*t))
            .map(|(v, t)| (*v, t.clone()))
            .collect();
        struct_types.insert(*pc, filtered);
        for (v, t) in m {
            if !synth.contains(t) {
                d.param_types.entry(*pc).or_default().insert(
                    *v,
                    (t.clone(), "its accesses, and those through the pointers it holds, fit the view (flags or RefCell boxes)".into()),
                );
            }
        }
        let t = compute_types(d, *pc, &struct_types);
        d.base_types.insert(*pc, t);
    }
    propagate(d, &call_args, &struct_types);
    native_deserializers(d, &synth);
    // role names and field names
    {
        let funcs: IndexMap<i64, &Func> = d.fs.iter().map(|f| (f.pc, *f)).collect();
        let bt = d.base_types.clone();
        let types = move |pc: i64| bt.get(&pc).cloned().unwrap_or_default();
        let pn = d.pn.clone();
        let fname = move |pc: i64| pn.fn_name(pc);
        let sem = &d.sem;
        let sa = |p: u64, n: u64| sem.str_at(p, n, true);
        let cfg = FieldNameCfg {
            funcs,
            types: &types,
            fn_name: &fname,
            str_at: &sa,
        };
        let roles = role_names(&cfg);
        let mut taken: HashSet<String> = d.pn.by_pc.values().cloned().collect();
        let mut renames = Vec::new();
        for (pc, (name, why)) in roles {
            let mut nm = name.clone();
            let mut k = 2;
            while taken.contains(&nm) {
                nm = format!("{name}_{k}");
                k += 1;
            }
            renames.push((pc, nm.clone(), why));
            taken.insert(nm);
        }
        drop(cfg);
        for (pc, nm, why) in renames {
            let old = d.fn_name(pc);
            d.heur_names
                .insert(pc, format!("name [heur]: {why} (was {old})"));
            d.rename(pc, &nm);
        }
        let funcs: IndexMap<i64, &Func> = d.fs.iter().map(|f| (f.pc, *f)).collect();
        let bt = d.base_types.clone();
        let types = move |pc: i64| bt.get(&pc).cloned().unwrap_or_default();
        let pn = d.pn.clone();
        let fname = move |pc: i64| pn.fn_name(pc);
        let sem = &d.sem;
        let sa = |p: u64, n: u64| sem.str_at(p, n, true);
        let cfg = FieldNameCfg {
            funcs,
            types: &types,
            fn_name: &fname,
            str_at: &sa,
        };
        let mut views = std::mem::take(&mut d.views);
        name_fields(&cfg, &mut views);
        drop(cfg);
        d.views = views;
    }
}

fn propagate(
    d: &mut Dx,
    call_args: &IndexMap<i64, Vec<(i64, u32, E)>>,
    struct_types: &IndexMap<i64, IndexMap<u32, String>>,
) {
    const BAD: [&str; 3] = ["AccountRecord", "UnalignedAccount", "Input"];
    for _round in 0..6 {
        let mut changed: Vec<i64> = Vec::new();
        // up: a caller's variable passed where the callee's parameter has a view type
        let mut up: IndexMap<i64, IndexMap<u32, (Option<String>, Vec<String>)>> = IndexMap::default();
        for (cpc, sites) in call_args {
            let ct = d.base_types[cpc].clone();
            for (caller, v, a) in sites {
                let ir = d.f(*caller).unwrap().ir.as_ref().unwrap();
                let Node::Var(aid) = ir.get(*a) else { continue };
                let Some(ty) = ct.get(v) else { continue };
                let m = up.entry(*caller).or_default();
                let nm = d.fn_name(*cpc);
                match m.get_mut(&aid) {
                    None => {
                        m.insert(aid, (Some(ty.clone()), vec![nm]));
                    }
                    Some(r) => {
                        if r.0.as_ref() != Some(ty) {
                            r.0 = None;
                        }
                        if !r.1.contains(&nm) {
                            r.1.push(nm);
                        }
                    }
                }
            }
        }
        for (pc, m) in &up {
            let f = d.f(*pc).unwrap();
            let ir = f.ir.as_ref().unwrap();
            for (u, (ty, callees)) in m {
                let Some(ty) = ty else { continue };
                if d.base_types[pc].contains_key(u)
                    || !d.views.map.contains_key(ty)
                    || BAD.contains(&ty.as_str())
                {
                    continue;
                }
                let Some(pv) = f.vars.get(*u as usize) else {
                    continue;
                };
                if pv.param == 10
                    || d.def_count(*pc, *u) != if pv.param >= 0 { 0 } else { 1 }
                    || !d.fits_view(*pc, *u, ty, 0)
                {
                    continue;
                }
                if pv.param < 0
                    && !f.blocks.iter().any(|b| {
                        b.stmts.iter().any(|st| {
                            matches!(st, Stmt::Set { dst, e, .. } if *dst == *u as i32 && matches!(ir.get(*e), Node::Load { size: 8, .. } | Node::Var(_)))
                        })
                    })
                {
                    continue;
                }
                let pt = d.param_types.entry(*pc).or_default();
                if pt.contains_key(u) {
                    continue;
                }
                let list: Vec<String> = callees.iter().take(3).cloned().collect();
                pt.insert(
                    *u,
                    (
                        ty.clone(),
                        format!(
                            "passed where the callee's parameter is one: {}{}",
                            list.join(", "),
                            if callees.len() > 3 { ", …" } else { "" }
                        ),
                    ),
                );
                changed.push(*pc);
            }
        }
        for (cpc, sites) in call_args {
            let mut seen: IndexMap<u32, (Option<Option<String>>, u32, u32, Vec<String>)> =
                IndexMap::default();
            for (caller, v, a) in sites {
                let cf = d.f(*caller).unwrap();
                let ir = cf.ir.as_ref().unwrap();
                let bt = &d.base_types[caller];
                let ty = expr_type(&d.views, ir, *a, &|id| bt.get(&id).cloned());
                let r = seen.entry(*v).or_insert((None, 0, 0, Vec::new()));
                r.2 += 1;
                let Some(ty) = ty else { continue };
                r.1 += 1;
                r.0 = match &r.0 {
                    None => Some(Some(ty)),
                    Some(Some(t)) if *t == ty => Some(Some(ty)),
                    _ => Some(None),
                };
                let nm = d.fn_name(*caller);
                if !r.3.contains(&nm) {
                    r.3.push(nm);
                }
            }
            for (v, (ty, n, of, callers)) in seen {
                let Some(Some(ty)) = ty else { continue };
                if !d.views.map.contains_key(&ty) || BAD.contains(&ty.as_str()) {
                    continue;
                }
                if d.param_types.get(cpc).is_some_and(|m| m.contains_key(&v))
                    || d.base_types[cpc].contains_key(&v)
                {
                    continue;
                }
                if n * 2 < of && !d.fits_view(*cpc, v, &ty, 3) {
                    continue;
                }
                let list: Vec<String> = callers.iter().take(3).cloned().collect();
                let why = format!(
                    "{}: {}{}",
                    if n == of {
                        "every call passes one".to_string()
                    } else {
                        format!(
                            "{n} of {of} calls pass one, the others an untyped value{}",
                            if n * 2 < of {
                                "; its loads and stores through it all hit fields of the view"
                            } else {
                                ""
                            }
                        )
                    },
                    list.join(", "),
                    if callers.len() > 3 { ", …" } else { "" }
                );
                d.param_types.entry(*cpc).or_default().insert(v, (ty, why));
                changed.push(*cpc);
            }
        }
        if changed.is_empty() {
            break;
        }
        let mut done = IndexSet::default();
        for pc in changed {
            if done.insert(pc) {
                let t = compute_types(d, pc, struct_types);
                d.base_types.insert(pc, t);
            }
        }
    }
}

fn native_deserializers(d: &mut Dx, synth: &IndexSet<String>) {
    let mut tried: HashSet<i64> = HashSet::default();
    let pcs: Vec<i64> = d.fs.iter().map(|f| f.pc).collect();
    for pc in pcs {
        let fi = d.idx[&pc];
        let f = d.fs[fi];
        let ir = f.ir.as_ref().unwrap();
        for b in &f.blocks {
            for st in &b.stmts {
                let Some((t, args)) = call_of(ir, st) else {
                    continue;
                };
                let CallTarget::Fn { pc: cpc } = t else {
                    continue;
                };
                // (a user function writing only its out parameter, or a library deserializer)
                let lib = d.is_lib(cpc);
                if tried.contains(&cpc)
                    || args.len < 3
                    || !(if lib {
                        let n = d.fn_name(cpc).to_lowercase();
                        n.contains("unpack")
                            || n.contains("from_slice")
                            || n.contains("deserialize")
                    } else {
                        d.out_params.contains(&cpc)
                    })
                {
                    continue;
                }
                let cell_field = |e: E, off: u64| -> bool {
                    let mut e = e;
                    if let Node::Var(id) = ir.get(e) {
                        if d.def_count(pc, id) == 1 {
                            let dd =
                                f.blocks.iter().flat_map(|b| b.stmts.iter()).find(
                                    |s| matches!(s, Stmt::Set { dst, .. } if *dst == id as i32),
                                );
                            if let Some(Stmt::Set { e: x, .. }) = dd {
                                e = *x;
                            }
                        }
                    }
                    let Node::Load { size: 8, addr } = ir.get(e) else {
                        return false;
                    };
                    let Node::Bin(BinOp::Add, a, c) = ir.get(addr) else {
                        return false;
                    };
                    if ir.get(c) != Node::Const(off) {
                        return false;
                    }
                    let bt = &d.base_types[&pc];
                    expr_type(&d.views, ir, a, &|id| bt.get(&id).cloned()).as_deref()
                        == Some("DataCell")
                };
                if !cell_field(ir.at(args, 1), 0x18) || !cell_field(ir.at(args, 2), 0x20) {
                    continue;
                }
                tried.insert(cpc);
                let mut lens: Vec<usize> = Vec::new();
                if let Some(cf) = d.f(cpc) {
                    if let Some(lv) = param_var(cf, 3) {
                        let cir = cf.ir.as_ref().unwrap();
                        for b2 in &cf.blocks {
                            let mut es: Vec<E> = Vec::new();
                            for s2 in &b2.stmts {
                                es.extend(stmt_exprs(cir, s2));
                            }
                            if let Term::Br { c, .. } = &b2.term {
                                es.push(*c);
                            }
                            for e in es {
                                cir.walk(e, &mut |_, x| {
                                    if let Node::Cmp(_, a, bb) = x {
                                        let k = match (cir.get(a), cir.get(bb)) {
                                            (Node::Var(v), Node::Const(c)) if v == lv => Some(c),
                                            (Node::Const(c), Node::Var(v)) if v == lv => Some(c),
                                            _ => None,
                                        };
                                        if let Some(k) = k {
                                            let k = k as N;
                                            if k > 0.0
                                                && k <= 65536.0
                                                && !lens.contains(&(k as usize))
                                                && lens.len() < 4
                                            {
                                                lens.push(k as usize);
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
                let m = d.state_ctx.probe_deserializer(cpc, &lens);
                let Some(m) = m else { continue };
                if lib {
                    // (a library function: a view of its out object from the run alone)
                    let fields: Vec<Field> = copy_leaves(&m, 0)
                        .into_values()
                        .map(|l| Field {
                            id: fid(),
                            name: l.leaf.path.clone(),
                            off: l.mem,
                            t: FT::Scalar(l.leaf.size as u8),
                            doc: None,
                            count: None,
                        })
                        .collect();
                    let fname = d.fn_name(cpc);
                    let name = format!("Deser_{fname}");
                    if fields.len() >= 2 && !d.views.map.contains_key(&name) {
                        d.views.add(View {
                            name: name.clone(),
                            doc: format!("[heur] the out object of {fname} (a library deserializer of account data): the data bytes a run on bit-pattern data copies there (dN_uS: the bytes at offset N of the account data, at their natural alignment; other bytes not described)"),
                            size: None,
                            fields,
                            builtin: false,
                        });
                        d.lib_out.insert(cpc, name);
                    }
                    continue;
                }
                let v = d.param_view(cpc, 1);
                let Some(v) = v.filter(|v| synth.contains(v)) else {
                    continue;
                };
                let cf = d.f(cpc).unwrap();
                let cir = cf.ir.as_ref().unwrap();
                let rv = param_var(cf, 1);
                let mut const_at: HashSet<K> = HashSet::default();
                for b2 in &cf.blocks {
                    for s2 in &b2.stmts {
                        let (addr, size, vals): (E, u8, Vec<E>) = match s2 {
                            Stmt::Store { addr, size, v, .. } => (*addr, *size, vec![*v]),
                            Stmt::Stores {
                                addr, size, vals, ..
                            } => (*addr, *size, cir.to_vec(*vals)),
                            _ => continue,
                        };
                        let Some(rv) = rv else { continue };
                        let o = match cir.get(addr) {
                            Node::Var(x) if x == rv => Some(0.0),
                            Node::Bin(BinOp::Add, x, c) => match (cir.get(x), cir.get(c)) {
                                (Node::Var(x), Node::Const(c)) if x == rv => Some(c as N),
                                _ => None,
                            },
                            _ => None,
                        };
                        if let Some(o) = o {
                            for (i, x) in vals.iter().enumerate() {
                                if matches!(cir.get(*x), Node::Const(_)) {
                                    const_at.insert(K::of(o + (i * size as usize) as N));
                                }
                            }
                        }
                    }
                }
                let fname = d.fn_name(cpc);
                let view = d.views.map.get_mut(&v).unwrap();
                let mut n = 0;
                let names: Vec<String> = view.fields.iter().map(|x| x.name.clone()).collect();
                let mut new_names: Vec<String> = names.clone();
                for (fi2, fd) in view.fields.iter().enumerate() {
                    if const_at.contains(&K::of(fd.off)) {
                        continue;
                    }
                    let size = match fd.t {
                        FT::Scalar(s) => s as usize,
                        _ => 0,
                    };
                    let Some(&dd) = m
                        .get(&(fd.off as usize))
                        .filter(|_| fd.off >= 0.0 && fd.off.fract() == 0.0)
                    else {
                        continue;
                    };
                    if size == 0
                        || (1..size).any(|i| m.get(&(fd.off as usize + i)) != Some(&(dd + i)))
                    {
                        continue;
                    }
                    let nm = format!("d0x{dd:x}_u{}", size * 8);
                    if new_names.contains(&nm) {
                        continue;
                    }
                    new_names[fi2] = nm;
                    n += 1;
                }
                for (fd, nm) in view.fields.iter_mut().zip(new_names) {
                    fd.name = nm;
                }
                if n > 0 {
                    view.doc.push_str(&format!(
                        "; {n} named after the account data bytes a run of {fname} (a deserializer) copies there on bit-pattern data (dN_uS: the bytes at offset N of the account data)"
                    ));
                }
                let _ = copy_leaves;
            }
        }
    }
}
