//! `src/accounts.ts`: account recognition (AccountInfo / serialized input records), the legacy
//! AccountInfo field order, the deprecated loader's unaligned input.

use crate::util::{dst_of, jkey, n_s, stmt_exprs, term_br, term_ret, var_of, N};
use sbpf_ir::fx::IndexMap;
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, E};
use sbpf_program::Func;
use sbpf_ir::fx::{HashMap, HashSet};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Kind {
    Info,
    Raw,
    Raw1,
}

struct Layout {
    loads: &'static [(u64, u8, &'static str)],
    flags: &'static [u64],
    key_ptrs: &'static [u64],
    key_addrs: &'static [u64],
}

const INFO: Layout = Layout {
    loads: &[
        (0, 8, "key"),
        (8, 8, "lamports"),
        (0x10, 8, "data"),
        (0x18, 8, "owner"),
        (0x20, 8, "rent_epoch"),
        (0x28, 1, "is_signer"),
        (0x29, 1, "is_writable"),
        (0x2a, 1, "executable"),
    ],
    flags: &[0x28, 0x29, 0x2a],
    key_ptrs: &[0, 0x18],
    key_addrs: &[],
};
const RAW: Layout = Layout {
    loads: &[
        (1, 1, "is_signer"),
        (2, 1, "is_writable"),
        (3, 1, "executable"),
        (0x48, 8, "lamports"),
        (0x50, 8, "data_len"),
    ],
    flags: &[1, 2, 3],
    key_ptrs: &[],
    key_addrs: &[8, 0x28],
};
const RAW1: Layout = Layout {
    loads: &[
        (1, 1, "is_signer"),
        (2, 1, "is_writable"),
        (0x23, 8, "lamports"),
        (0x2b, 8, "data_len"),
    ],
    flags: &[1, 2],
    key_ptrs: &[],
    key_addrs: &[3],
};
const LEGACY_INFO: Layout = Layout {
    loads: &[
        (0, 8, "rent_epoch"),
        (8, 8, "key"),
        (0x10, 8, "lamports"),
        (0x18, 8, "data"),
        (0x20, 8, "owner"),
        (0x28, 1, "is_signer"),
        (0x29, 1, "is_writable"),
        (0x2a, 1, "executable"),
    ],
    flags: &[0x28, 0x29, 0x2a],
    key_ptrs: &[8, 0x20],
    key_addrs: &[],
};

fn layout(kind: Kind, legacy: bool) -> &'static Layout {
    match kind {
        Kind::Info => {
            if legacy {
                &LEGACY_INFO
            } else {
                &INFO
            }
        }
        Kind::Raw => &RAW,
        Kind::Raw1 => &RAW1,
    }
}
fn load_at(l: &Layout, o: N) -> Option<(u8, &'static str)> {
    l.loads.iter().find(|x| x.0 as N == o).map(|x| (x.1, x.2))
}

const STRIDE: i128 = 0x30;

/// key(e): canonical text of an expression (identity for the typing maps).
pub fn key(ir: &Ir, e: E) -> String {
    let mut s = String::new();
    key_to(ir, e, &mut s);
    s
}
fn key_to(ir: &Ir, e: E, o: &mut String) {
    use std::fmt::Write;
    match ir.get(e) {
        Node::Var(v) => write!(o, "v{v}").unwrap(),
        Node::Const(v) => write!(o, "#{v}").unwrap(),
        Node::Load { size, addr } => {
            write!(o, "L{size}(").unwrap();
            key_to(ir, addr, o);
            o.push(')');
        }
        Node::Bin(op, a, b) => {
            write!(o, "({} ", op.as_str()).unwrap();
            key_to(ir, a, o);
            o.push(' ');
            key_to(ir, b, o);
            o.push(')');
        }
        _ => {
            o.push('{');
            jkey(ir, e, o);
        }
    }
}
/// split: base and signed constant offset of `a + c`
fn split(ir: &Ir, e: E) -> (E, i128) {
    if let Node::Bin(BinOp::Add, a, b) = ir.get(e) {
        if let Node::Const(c) = ir.get(b) {
            return (a, c as i64 as i128);
        }
    }
    (e, 0)
}
fn off_key(k: &str, o: i128) -> String {
    if o == 0 {
        k.to_string()
    } else {
        format!("(add {k} #{})", o as u64)
    }
}

pub type Typed = IndexMap<String, Kind>;

#[derive(Clone)]
struct Split {
    bk: String,
    o: i128,
}
fn split_key(ir: &Ir, e: E) -> Split {
    let (b, o) = split(ir, e);
    Split { bk: key(ir, b), o }
}

struct Static {
    defs: IndexMap<u32, Vec<Option<E>>>,
    prop: Vec<(String, Split, Option<String>)>,
    calls: Vec<(i64, Vec<Option<Split>>)>,
}

struct FnInfo<'a> {
    f: &'a Func,
    typed: Typed,
    params: Vec<(u32, i32)>,
    addrs: Option<HashMap<String, HashSet<i64>>>,
    st: Option<Static>,
}

/// findAccounts: per function (in `funcs` order), expressions that point to an account.
pub fn find_accounts(funcs: &[&Func], unaligned: bool, legacy: bool) -> Vec<Typed> {
    let kinds = [Kind::Info, if unaligned { Kind::Raw1 } else { Kind::Raw }];
    let mut info: Vec<FnInfo> = funcs
        .iter()
        .map(|f| FnInfo {
            f,
            typed: IndexMap::default(),
            params: f
                .vars
                .iter()
                .filter(|v| v.param >= 1 && v.param <= 5)
                .map(|v| (v.id, v.param))
                .collect(),
            addrs: None,
            st: None,
        })
        .collect();
    let idx: HashMap<i64, usize> = funcs.iter().enumerate().map(|(i, f)| (f.pc, i)).collect();
    let mut param_typed: IndexMap<i64, IndexMap<i32, Kind>> = IndexMap::default();
    let mut blocked: IndexMap<i64, Vec<i32>> = IndexMap::default();
    for _round in 0..6 {
        let mut changed = false;
        for fi in info.iter_mut() {
            let tp = param_typed.get(&fi.f.pc).cloned();
            if local(fi, tp.as_ref(), &kinds, legacy) {
                changed = true;
            }
        }
        for fi in &info {
            for (t, args) in &fi.st.as_ref().unwrap().calls {
                for (i, a) in args.iter().enumerate() {
                    let r = i as i32 + 1;
                    let Some(a) = a else {
                        let s = blocked.entry(*t).or_default();
                        if !s.contains(&r) {
                            s.push(r);
                        }
                        continue;
                    };
                    let Some(k) = kind_of(&fi.typed, a) else {
                        continue;
                    };
                    let s = param_typed.entry(*t).or_default();
                    if !s.contains_key(&r) {
                        s.insert(r, k);
                        changed = true;
                    }
                }
            }
        }
        for (t, s) in &blocked {
            if let Some(m) = param_typed.get_mut(t) {
                for r in s {
                    m.shift_remove(r);
                }
            }
        }
        if !changed {
            break;
        }
    }
    let _ = idx;
    info.into_iter().map(|fi| fi.typed).collect()
}

fn kind_of(typed: &Typed, s: &Split) -> Option<Kind> {
    let k = *typed.get(&s.bk)?;
    if s.o == 0 || (k == Kind::Info && s.o > 0 && s.o % STRIDE == 0) {
        Some(k)
    } else {
        None
    }
}

fn local(
    fi: &mut FnInfo,
    typed_params: Option<&IndexMap<i32, Kind>>,
    kinds: &[Kind; 2],
    legacy: bool,
) -> bool {
    let f = fi.f;
    let n0 = fi.typed.len();
    if let Some(st) = &fi.st {
        for &(v, r) in &fi.params {
            if let Some(&k) = typed_params.and_then(|m| m.get(&r)) {
                if !st.defs.contains_key(&v) {
                    let vk = format!("v{v}");
                    if !fi.typed.contains_key(&vk) {
                        fi.typed.insert(vk, k);
                    }
                }
            }
        }
        propagate(&mut fi.typed, &st.prop);
        return fi.typed.len() != n0;
    }
    let ir = f.ir.as_ref().unwrap();
    let add = |typed: &mut Typed, k: String, kind: Kind| {
        if !typed.contains_key(&k) {
            typed.insert(k, kind);
        }
    };
    let mut defs: IndexMap<u32, Vec<Option<E>>> = IndexMap::default();
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Set { dst, e, .. } => defs.entry(*dst as u32).or_default().push(Some(*e)),
                Stmt::Call { dst, .. } if *dst >= 0 => {
                    defs.entry(*dst as u32).or_default().push(None)
                }
                _ => {}
            }
        }
    }
    let mut prop = Vec::new();
    for (v, es) in &defs {
        if es.len() == 1 {
            let (def, lk) = match es[0] {
                Some(e) => (
                    split_key(ir, e),
                    if matches!(ir.get(e), Node::Load { .. }) {
                        Some(key(ir, e))
                    } else {
                        None
                    },
                ),
                None => (
                    Split {
                        bk: "{U".into(),
                        o: 0,
                    },
                    None,
                ),
            };
            prop.push((format!("v{v}"), def, lk));
        }
    }
    let mut calls: Vec<(i64, Vec<Option<Split>>)> = Vec::new();
    let call = |calls: &mut Vec<(i64, Vec<Option<Split>>)>, t: i64, args: &[E]| {
        calls.push((
            t,
            args.iter()
                .map(|&a| {
                    if matches!(ir.get(a), Node::Const(_)) {
                        None
                    } else {
                        Some(split_key(ir, a))
                    }
                })
                .collect(),
        ));
    };
    for &(v, r) in &fi.params {
        if let Some(&k) = typed_params.and_then(|m| m.get(&r)) {
            if !defs.contains_key(&v) {
                add(&mut fi.typed, format!("v{v}"), k);
            }
        }
    }
    let single = |e: E| -> E {
        if let Node::Var(v) = ir.get(e) {
            if let Some(d) = defs.get(&v) {
                if d.len() == 1 {
                    return match d[0] {
                        Some(x) => x,
                        None => ir.undef(),
                    };
                }
            }
        }
        e
    };
    let mut loads: IndexMap<String, IndexMap<crate::util::K, u8>> = IndexMap::default();
    let mut wide: HashSet<String> = HashSet::default();
    let use32 = |wide: &mut HashSet<String>, e: E| {
        let (b, o) = split(ir, single(e));
        wide.insert(off_key(&key(ir, b), o));
    };
    let mut visit = |x: E,
                     n: Node,
                     scan: bool,
                     do_calls: bool,
                     loads: &mut IndexMap<String, IndexMap<crate::util::K, u8>>,
                     wide: &mut HashSet<String>,
                     calls: &mut Vec<(i64, Vec<Option<Split>>)>| {
        let _ = x;
        match n {
            Node::Load { size, addr } => {
                let (b, o) = split(ir, addr);
                let bk = key(ir, b);
                loads
                    .entry(bk)
                    .or_default()
                    .insert(crate::util::K::of(o as i64 as N), size);
                if scan && size == 8 {
                    let sb = single(b);
                    if matches!(ir.get(sb), Node::Load { .. }) {
                        use32(wide, sb);
                    }
                }
            }
            Node::Fn(nm, args) if scan && ir.with_name(nm, |s| s == "memeq" || s == "keyeq") => {
                let is_memeq = ir.with_name(nm, |s| s == "memeq");
                use32(wide, ir.at(args, 0));
                if is_memeq {
                    use32(wide, ir.at(args, 1));
                }
            }
            Node::Call(t, args) if do_calls => {
                if let CallTarget::Fn { pc } = ir.target(t) {
                    call(calls, pc, &ir.to_vec(args));
                }
            }
            _ => {}
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
                call(&mut calls, *pc, &ir.to_vec(*args));
            }
            for e in stmt_exprs(ir, s) {
                ir.walk(e, &mut |x, n| {
                    visit(x, n, true, true, &mut loads, &mut wide, &mut calls)
                });
            }
            if let Stmt::Copy {
                n: 32, src, dst, ..
            } = s
            {
                use32(&mut wide, *src);
                use32(&mut wide, *dst);
            }
            if let Stmt::Store {
                size: 8, addr, v, ..
            } = s
            {
                let (x, o) = split(ir, *v);
                let cur = ir.load(8, *addr);
                if o == STRIDE && key(ir, single(x)) == key(ir, cur) {
                    add(&mut fi.typed, key(ir, cur), Kind::Info);
                    add(&mut fi.typed, key(ir, x), Kind::Info);
                }
            }
        }
        if let Some(c) = term_br(&b.term) {
            ir.walk(c, &mut |x, n| {
                visit(x, n, true, false, &mut loads, &mut wide, &mut calls)
            });
        } else if let Some(e) = term_ret(&b.term) {
            ir.walk(e, &mut |x, n| {
                visit(x, n, false, false, &mut loads, &mut wide, &mut calls)
            });
        }
    }
    fi.st = Some(Static {
        defs: defs.clone(),
        prop: prop.clone(),
        calls,
    });
    for (bk, m) in &loads {
        for &kind in kinds {
            let l = layout(kind, legacy);
            let fit: Vec<(N, u8)> = m
                .iter()
                .map(|(o, sz)| (o.get(), *sz))
                .filter(|(o, sz)| load_at(l, *o).is_some_and(|x| x.0 == *sz))
                .collect();
            if !fit
                .iter()
                .any(|(o, _)| l.flags.iter().any(|&fl| fl as N == *o))
            {
                continue;
            }
            let keyed = l
                .key_ptrs
                .iter()
                .any(|&o| wide.contains(&format!("L8({})", off_key(bk, o as i128))))
                || l.key_addrs
                    .iter()
                    .any(|&o| wide.contains(&off_key(bk, o as i128)));
            let mget = |o: N| m.get(&crate::util::K::of(o)).copied();
            let many = match kind {
                Kind::Info => fit.len() >= 4,
                Kind::Raw1 => mget(35.0) == Some(8) && mget(43.0) == Some(8),
                Kind::Raw => {
                    (mget(72.0) == Some(8) && mget(80.0) == Some(8)) || {
                        let a = fi.addrs.get_or_insert_with(|| field_addrs(f));
                        a.get(bk).map_or(0, |s| s.len()) >= 2
                    }
                }
            };
            if keyed || many {
                if !fi.typed.contains_key(bk) {
                    fi.typed.insert(bk.clone(), kind);
                }
                break;
            }
        }
    }
    propagate(&mut fi.typed, &prop);
    fi.typed.len() != n0
}

fn propagate(typed: &mut Typed, prop: &[(String, Split, Option<String>)]) {
    for _ in 0..4 {
        let n = typed.len();
        for (v, def, lk) in prop {
            if typed.contains_key(v) {
                continue;
            }
            let k = kind_of(typed, def).or_else(|| lk.as_ref().and_then(|l| typed.get(l).copied()));
            if let Some(k) = k {
                typed.insert(v.clone(), k);
            }
        }
        if typed.len() == n {
            break;
        }
    }
}

fn field_addrs(f: &Func) -> HashMap<String, HashSet<i64>> {
    let ir = f.ir.as_ref().unwrap();
    let mut addrs: HashMap<String, HashSet<i64>> = HashMap::default();
    fn visit(ir: &Ir, x: E, is_addr: bool, addrs: &mut HashMap<String, HashSet<i64>>) {
        let n = ir.get(x);
        if !is_addr {
            if let Node::Bin(BinOp::Add, a, b) = n {
                if let (Node::Var(v), Node::Const(c)) = (ir.get(a), ir.get(b)) {
                    if [8, 0x28, 0x48, 0x58].contains(&c) {
                        addrs.entry(format!("v{v}")).or_default().insert(c as i64);
                    }
                }
            }
        }
        match n {
            Node::Load { addr, .. } => visit(ir, addr, true, addrs),
            Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                visit(ir, a, false, addrs);
                visit(ir, b, false, addrs);
            }
            Node::Neg(a) | Node::Not(a) | Node::Lnot(a) => visit(ir, a, false, addrs),
            Node::Ext { a, .. } | Node::Bswap { a, .. } => visit(ir, a, false, addrs),
            Node::Sel(c, a, b) => {
                visit(ir, c, false, addrs);
                visit(ir, a, false, addrs);
                visit(ir, b, false, addrs);
            }
            Node::Call(_, args) | Node::Fn(_, args) => {
                for a in ir.items(args) {
                    visit(ir, a, false, addrs);
                }
            }
            _ => {}
        }
    }
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Store { v, .. } => visit(ir, *v, false, &mut addrs),
                Stmt::Stores { vals, .. } => {
                    for v in ir.items(*vals) {
                        visit(ir, v, false, &mut addrs);
                    }
                }
                Stmt::Call { args, .. } => {
                    for v in ir.items(*args) {
                        visit(ir, v, false, &mut addrs);
                    }
                }
                Stmt::Set { e, .. } => visit(ir, *e, false, &mut addrs),
                _ => {}
            }
        }
    }
    addrs
}

/// accountField: the field name of a load through a known account pointer.
pub fn account_field(typed: Option<&Typed>, ir: &Ir, e: E, legacy: bool) -> Option<String> {
    let typed = typed?;
    let Node::Load { size, addr } = ir.get(e) else {
        return None;
    };
    let (b, o) = split(ir, addr);
    if o < 0 {
        return None;
    }
    let lo = |l: &Layout, x: i128| {
        l.loads
            .iter()
            .find(|y| y.0 as i128 == x)
            .map(|y| (y.1, y.2))
    };
    let inf = lo(layout(Kind::Info, legacy), o % STRIDE);
    let raw = lo(&RAW, o);
    let raw1 = lo(&RAW1, o);
    if !inf.is_some_and(|x| x.0 == size)
        && !raw.is_some_and(|x| x.0 == size)
        && !raw1.is_some_and(|x| x.0 == size)
        && !((3..0x48).contains(&o) && size == 8)
    {
        return None;
    }
    let kind = *typed.get(&key(ir, b))?;
    match kind {
        Kind::Raw => {
            if let Some(fd) = raw.filter(|x| x.0 == size) {
                return Some(fd.1.into());
            }
            if (8..0x48).contains(&o) && size == 8 {
                let base = if o < 0x28 { 8 } else { 0x28 };
                return Some(format!(
                    "{}[{}]",
                    if o < 0x28 { "key" } else { "owner" },
                    (o - base) / 8
                ));
            }
            None
        }
        Kind::Raw1 => {
            if let Some(fd) = raw1.filter(|x| x.0 == size) {
                return Some(fd.1.into());
            }
            if (3..0x23).contains(&o) && size == 8 && (o - 3) % 8 == 0 {
                return Some(format!("key[{}]", (o - 3) / 8));
            }
            None
        }
        Kind::Info => {
            let idx = o / STRIDE;
            let fd = lo(layout(Kind::Info, legacy), o % STRIDE)?;
            if fd.0 != size {
                return None;
            }
            Some(if idx != 0 {
                format!("[{idx}].{}", fd.1)
            } else {
                fd.1.into()
            })
        }
    }
}

/// accountAddr: `&owner` / `&key` / `&data` for an address inside a raw account record.
pub fn account_addr(typed: Option<&Typed>, ir: &Ir, e: E) -> Option<&'static str> {
    let typed = typed?;
    let (b, o) = split(ir, e);
    let nm = match o {
        8 => Some("&key"),
        0x28 => Some("&owner"),
        0x58 => Some("&data"),
        _ => None,
    };
    let nm1 = match o {
        3 => Some("&key"),
        0x33 => Some("&data"),
        _ => None,
    };
    if nm.is_none() && nm1.is_none() {
        return None;
    }
    match typed.get(&key(ir, b)) {
        Some(Kind::Raw) => nm,
        Some(Kind::Raw1) => nm1,
        _ => None,
    }
}

/// legacyAccountInfo: the pre-repr(C) AccountInfo field order, told by the entrypoint's deserializer.
pub fn legacy_account_info(funcs: &HashMap<i64, &Func>, entry_pc: i64) -> bool {
    let mut seen: HashSet<i64> = HashSet::default();
    let (mut legacy, mut current) = (0, 0);
    fn visit(
        funcs: &HashMap<i64, &Func>,
        pc: i64,
        depth: u32,
        seen: &mut HashSet<i64>,
        legacy: &mut u32,
        current: &mut u32,
    ) {
        let Some(f) = funcs.get(&pc) else { return };
        if seen.contains(&pc) {
            return;
        }
        seen.insert(pc);
        let ir = f.ir.as_ref().unwrap();
        let mut defs: HashMap<u32, Vec<E>> = HashMap::default();
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Set { dst, e, .. } = s {
                    defs.entry(*dst as u32).or_default().push(*e);
                }
            }
        }
        let one = |mut e: E| {
            for _ in 0..4 {
                let Some(v) = var_of(ir, e) else { break };
                match defs.get(&v) {
                    Some(d) if d.len() == 1 => e = d[0],
                    _ => break,
                }
            }
            e
        };
        let key_addr = |e: E| matches!(ir.get(one(e)), Node::Bin(BinOp::Add, _, b) if ir.get(b) == Node::Const(8));
        let mut flags: IndexMap<String, HashSet<crate::util::K>> = IndexMap::default();
        let mut words: HashMap<String, HashMap<crate::util::K, E>> = HashMap::default();
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Call {
                    t: CallTarget::Fn { pc },
                    ..
                } = s
                {
                    if depth > 0 {
                        visit(funcs, *pc, depth - 1, seen, legacy, current);
                    }
                }
                let (addr, size, vals): (E, u8, Vec<E>) = match s {
                    Stmt::Store { addr, size, v, .. } => (*addr, *size, vec![*v]),
                    Stmt::Stores {
                        addr, size, vals, ..
                    } => (*addr, *size, ir.to_vec(*vals)),
                    _ => continue,
                };
                let (bs, o) = split(ir, addr);
                let bk = key(ir, bs);
                for (i, v) in vals.iter().enumerate() {
                    let off = o as i64 as N + (i * size as usize) as N;
                    if size == 1 {
                        flags
                            .entry(bk.clone())
                            .or_default()
                            .insert(crate::util::K::of(off));
                    }
                    if size == 8 && (off == 0.0 || off == 8.0) {
                        words
                            .entry(bk.clone())
                            .or_default()
                            .insert(crate::util::K::of(off), *v);
                    }
                }
            }
        }
        for (bk, m) in &flags {
            let has = |x: N| m.contains(&crate::util::K::of(x));
            if !has(40.0) || !has(41.0) || !has(42.0) {
                continue;
            }
            let w = words.get(bk);
            let w0 = w.and_then(|w| w.get(&crate::util::K::of(0.0)));
            let w8 = w.and_then(|w| w.get(&crate::util::K::of(8.0)));
            if w8.is_some_and(|&x| key_addr(x)) && !w0.is_some_and(|&x| key_addr(x)) {
                *legacy += 1;
            } else if w0.is_some_and(|&x| key_addr(x)) && !w8.is_some_and(|&x| key_addr(x)) {
                *current += 1;
            }
        }
    }
    visit(funcs, entry_pc, 2, &mut seen, &mut legacy, &mut current);
    legacy > 0 && current == 0
}

/// unalignedInput, on the register-level blocks (before variable recovery).
pub fn unaligned_input(p: &sbpf_program::Program) -> bool {
    if p.version != 0 || p.elf.entry_pc < 0 {
        return false;
    }
    let Some(entry) = p.funcs.get(&p.elf.entry_pc) else {
        return false;
    };
    let offs = |pc: i64, size: u8, reg: Option<u8>| -> HashSet<u64> {
        let mut out = HashSet::default();
        let Some(f) = p.funcs.get(&pc) else {
            return out;
        };
        let ir = f.ir(p);
        for b in &f.blocks {
            for s in &b.stmts {
                for e in stmt_exprs(ir, s) {
                    ir.walk(e, &mut |_, n| {
                        let Node::Load { size: sz, addr } = n else {
                            return;
                        };
                        if sz != size {
                            return;
                        }
                        let Node::Bin(BinOp::Add, a, c) = ir.get(addr) else {
                            return;
                        };
                        let Node::Const(c) = ir.get(c) else { return };
                        if reg.is_none() || ir.get(a) == Node::Reg(reg.unwrap()) {
                            out.insert(c);
                        }
                    });
                }
            }
        }
        out
    };
    let mut callees = sbpf_ir::fx::IndexSet::default();
    callees.insert(entry.pc);
    for b in &entry.blocks {
        for s in &b.stmts {
            if let Stmt::Call {
                t: CallTarget::Fn { pc },
                ..
            } = s
            {
                callees.insert(*pc);
            }
        }
    }
    for &pc in &callees {
        let (o8, o1) = (offs(pc, 8, None), offs(pc, 1, None));
        if o8.contains(&0x2b) && o8.contains(&0x21) && o1.contains(&0x20) {
            return true;
        }
    }
    let b1 = offs(entry.pc, 1, Some(1));
    (0x33..=0x3a).all(|o| b1.contains(&o)) && !b1.contains(&0x32) && !b1.contains(&0x3b)
}

#[allow(dead_code)]
fn unused(_: Option<u32>) {
    let _ = dst_of;
    let _ = n_s;
}
