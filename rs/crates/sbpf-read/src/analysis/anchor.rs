//! Anchor support of the flow layer (`src/analysis/flow.ts`, part 3): account objects serialized back on
//! exit (exit functions, exit writes), the handler's account evaluator (HVal: frame pointers,
//! &AccountInfo words, RcBoxes of lamports / data), try_accounts' layout (tryInfo, byValueTry), the
//! writes the handler's logic makes in the functions it calls (calleeWrites).

use super::facts::{short_name, Op};
use super::flow::*;
use super::{An, FK};
use crate::util::{js_num, to_int32};
use crate::views::{Field, FT};
use indexmap::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, Term, E};
use sbpf_program::Func;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::{Rc, Weak};

// ---- exit functions ----

#[derive(Clone, Debug, PartialEq)]
pub struct XField {
    pub off: f64,
    pub size: f64,
    pub name: String,
}

#[derive(Clone, Debug)]
pub struct XSub {
    pub ty: Option<String>,
    pub fields: Vec<XField>,
    pub name: Option<String>,
}

#[derive(Clone, Debug)]
pub struct ExitFn {
    pub ty: Option<String>,
    pub param: i32,
    pub fields: Vec<XField>,
    pub subs: Option<Vec<XSub>>,
}

#[derive(Clone, Debug)]
pub struct FrameObj {
    pub x: f64,
    pub size: f64,
    pub acct: String,
    pub ex: ExitFn,
    pub exit: String,
}

fn obj_lo(o: &FrameObj) -> f64 {
    o.ex.fields.iter().map(|x| x.off).fold(f64::INFINITY, f64::min)
}

/// the objects an exit function serializes: its own, or a wrapper's several
pub fn exit_objs(e: &ExitFn) -> Vec<(ExitFn, Option<String>)> {
    match &e.subs {
        Some(subs) => subs
            .iter()
            .map(|x| {
                (
                    ExitFn {
                        ty: x.ty.clone(),
                        param: e.param,
                        fields: x.fields.clone(),
                        subs: None,
                    },
                    x.name.clone(),
                )
            })
            .collect(),
        None => vec![(e.clone(), None)],
    }
}

/// `s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()`
pub fn snake1(s: &str) -> String {
    crate::jre!(r"([a-z0-9])([A-Z])").replace_all(s, "${1}_${2}").to_lowercase()
}

/// flow.ts snake
pub fn snake2(s: &str) -> String {
    let a = crate::jre!(r"([a-z0-9])([A-Z])").replace_all(s, "${1}_${2}");
    let b = crate::jre!(r"([A-Z]+)([A-Z][a-z])").replace_all(&a, "${1}_${2}");
    let c = crate::jre!(r"\W+").replace_all(&b, "_");
    let d = crate::jre!(r"^_|_$").replace_all(&c, "");
    d.to_lowercase()
}

fn authority(s: &str) -> bool {
    crate::jre!(r"(?i-u)authority|admin|owner|manager|operator|governor|guardian|upgrade|delegate").is_match(s)
}

/// the memos of the Anchor part (per result)
#[derive(Default)]
pub struct AnchorMemo<'a> {
    exits: RefCell<Option<Rc<IndexMap<i64, ExitFn>>>>,
    pub objs: RefCell<HashMap<i64, Rc<Vec<FrameObj>>>>,
    anchor: RefCell<HashMap<i64, Rc<AnchorEval<'a>>>>,
    try_memo: RefCell<HashMap<i64, Option<Rc<TryInfo>>>>,
    borrow: RefCell<HashMap<i64, bool>>,
    pub data_reads: RefCell<IndexMap<i64, IndexSet<String>>>,
    out_stores: RefCell<HashMap<(i64, u32, FK), Rc<Vec<(E, Pos)>>>>,
    visit: RefCell<HashMap<i64, Rc<Vec<Pos>>>>,
    keep: RefCell<HashMap<(i64, String), Rc<Vec<Pos>>>>,
}

impl<'a> An<'a> {
    pub fn exit_fns(&self) -> Rc<IndexMap<i64, ExitFn>> {
        if let Some(x) = self.memo.exits.borrow().as_ref() {
            return x.clone();
        }
        let x = Rc::new(self.exit_fns0());
        *self.memo.exits.borrow_mut() = Some(x.clone());
        x
    }

    fn exit_fns0(&self) -> IndexMap<i64, ExitFn> {
        let mut out: IndexMap<i64, ExitFn> = IndexMap::new();
        let img = self.p.image();
        let idl = self.idl;
        let disc_type: HashMap<u64, String> = idl.map_or(HashMap::new(), |i| i.accounts.iter().map(|(n, d)| (*d, n.clone())).collect());
        for fo in &self.funcs {
            let f = fo.f;
            if f.blocks.len() > 400 {
                continue;
            }
            let ir = fir(f);
            let params: HashMap<u32, i32> = f.vars.iter().filter(|v| v.param >= 1 && v.param <= 5).map(|v| (v.id, v.param)).collect();
            if params.is_empty() {
                continue;
            }
            let fp = fp_of(f);
            let mut slot: HashMap<FK, E> = HashMap::new();
            let mut sdefs: Option<IndexMap<u32, E>> = None;
            struct Rec {
                disc: Option<u64>,
                writes: Vec<(i32, f64, f64)>,
            }
            let mut by_w: IndexMap<i64, Rec> = IndexMap::new();
            for (b, i) in stmts_in_order(f) {
                let s = &f.blocks[b].stmts[i];
                if let Stmt::Store { addr, v, .. } = s {
                    if let Some(o) = off_of(ir, *addr, fp) {
                        slot.insert(FK::of(o), *v);
                    }
                }
                let Some((CallTarget::Fn { pc }, args)) = call_of(ir, s) else { continue };
                if args.len < 3 {
                    continue;
                }
                let Node::Const(lv) = ir.get(ir.at(args, 2)) else { continue };
                let len = lv as f64;
                let a = ir.at(args, 1);
                let has = by_w.contains_key(&pc);
                if let Node::Const(av) = ir.get(a) {
                    if len == 8.0 && !has {
                        if let Some(v) = img.read_const(av, 8) {
                            by_w.insert(pc, Rec { disc: Some(v), writes: vec![] });
                        }
                        continue;
                    }
                }
                if !has {
                    continue;
                }
                let mut src = a;
                if let Some(fo2) = off_of(ir, a, fp) {
                    let mut v = slot.get(&FK::of(fo2)).copied();
                    if let Some(Node::Var(id)) = v.map(|x| ir.get(x)) {
                        v = sdefs.get_or_insert_with(|| single_defs(f)).get(&id).copied();
                    }
                    if let Some(Node::Load { size, addr }) = v.map(|x| ir.get(x)) {
                        if size as f64 == len {
                            src = addr;
                        }
                    }
                }
                let base: i64 = match ir.get(src) {
                    Node::Var(id) => id as i64,
                    Node::Bin(BinOp::Add, x, c) if matches!(ir.get(x), Node::Var(_)) && matches!(ir.get(c), Node::Const(_)) => match ir.get(x) {
                        Node::Var(id) => id as i64,
                        _ => unreachable!(),
                    },
                    _ => -1,
                };
                let Some(&pi) = (if base >= 0 { params.get(&(base as u32)) } else { None }) else { continue };
                let off = off_of(ir, src, base).unwrap();
                by_w.get_mut(&pc).unwrap().writes.push((pi, off, len));
            }
            for rec in by_w.values() {
                let ws = &rec.writes;
                let named_type = idl.is_some() && rec.disc.is_some_and(|d| disc_type.contains_key(&d));
                if ws.is_empty() || (ws.len() < 2 && !named_type) || rec.disc.is_none() || !ws.iter().all(|w| w.0 == ws[0].0) {
                    continue;
                }
                let ty = disc_type.get(&rec.disc.unwrap()).cloned();
                if idl.is_some() && ty.is_none() {
                    continue;
                }
                let defs = match (&ty, idl) {
                    (Some(t), Some(i)) => crate::idl::struct_fields(t, &i.types),
                    _ => None,
                };
                let mut fields: Vec<XField> = Vec::new();
                let mut data = 8.0;
                for (i, w) in ws.iter().enumerate() {
                    let d = defs.as_ref().and_then(|x| x.get(i));
                    let z = match (d, idl) {
                        (Some(d), Some(idl)) => crate::idl::borsh_size(&d.1, &idl.types, 0),
                        _ => None,
                    };
                    let ok = d.is_some() && z == Some(w.2) && fields.len() == i && (i == 0 || !fields[i - 1].name.contains('['));
                    let name = if ok { snake1(&d.unwrap().0) } else { format!("data[{}..{}]", js_num(data), js_num(data + w.2)) };
                    fields.push(XField { off: w.1, size: w.2, name });
                    data += w.2;
                }
                out.insert(fo.pc, ExitFn { ty, param: ws[0].0, fields, subs: None });
                break;
            }
        }
        // (wrappers passing a parameter (+ an offset) on as the object)
        for _round in 0..2 {
            for fo in &self.funcs {
                if out.contains_key(&fo.pc) || fo.f.blocks.len() > 400 {
                    continue;
                }
                let f = fo.f;
                let ir = fir(f);
                let params: HashMap<u32, i32> = f.vars.iter().filter(|v| v.param >= 1 && v.param <= 5).map(|v| (v.id, v.param)).collect();
                struct Sub {
                    pi: i32,
                    ex: ExitFn,
                    d: f64,
                    pc: i64,
                }
                let mut subs: Vec<Sub> = Vec::new();
                for (b, i) in stmts_in_order(f) {
                    let s = &f.blocks[b].stmts[i];
                    let Some((CallTarget::Fn { pc }, args)) = call_of(ir, s) else { continue };
                    let Some(ex) = out.get(&pc) else { continue };
                    let a = if ex.param >= 1 && (ex.param as u32) <= args.len { Some(ir.at(args, ex.param as u32 - 1)) } else { None };
                    let base: i64 = match a.map(|a| ir.get(a)) {
                        Some(Node::Var(id)) => id as i64,
                        Some(Node::Bin(BinOp::Add, x, c)) if matches!(ir.get(x), Node::Var(_)) && matches!(ir.get(c), Node::Const(_)) => match ir.get(x) {
                            Node::Var(id) => id as i64,
                            _ => unreachable!(),
                        },
                        _ => -1,
                    };
                    let Some(&pi) = (if base >= 0 { params.get(&(base as u32)) } else { None }) else { continue };
                    if !subs.is_empty() && pi != subs[0].pi {
                        continue;
                    }
                    subs.push(Sub {
                        pi,
                        ex: ex.clone(),
                        d: off_of(ir, a.unwrap(), base).unwrap(),
                        pc: stmt_pc(s),
                    });
                }
                if subs.is_empty() {
                    continue;
                }
                let shift = |e: &ExitFn, d: f64| -> Vec<XField> { e.fields.iter().map(|x| XField { off: x.off + d, ..x.clone() }).collect() };
                let facts = self.facts.borrow();
                let ff = facts.get(&fo.pc);
                let lines: Vec<Option<i64>> = subs.iter().map(|x| ff.and_then(|ff| ff.pc_line.get(&x.pc).copied())).collect();
                let name_at = |pc: i64| -> Option<String> {
                    let i = subs.iter().position(|x| x.pc == pc)?;
                    let l = lines[i]?;
                    let ff = ff?;
                    let next = lines.get(i + 1).copied().flatten();
                    let mut ks: Vec<&super::facts::Check> = ff.checks.iter().filter(|k| k.named.is_some() && k.line > l && next.is_none_or(|n| k.line < n)).collect();
                    ks.sort_by_key(|k| k.line);
                    if let Some(k) = ks.first() {
                        return k.named.clone();
                    }
                    let hi = next.map_or(ff.lines.len(), |n| (n as usize).min(ff.lines.len()));
                    let lo = (l as usize).min(hi);
                    let t = ff.lines[lo..hi].join("\n");
                    crate::jre!(r#"// "([a-z][a-z0-9_]*)""#).captures(&t).map(|m| m[1].to_string()).or_else(|| short_name(&t))
                };
                let first = &subs[0];
                let e = ExitFn {
                    ty: first.ex.ty.clone(),
                    param: first.pi,
                    fields: shift(&first.ex, first.d),
                    subs: if subs.len() > 1 {
                        Some(subs.iter().map(|x| XSub { ty: x.ex.ty.clone(), fields: shift(&x.ex, x.d), name: name_at(x.pc) }).collect())
                    } else {
                        None
                    },
                };
                drop(facts);
                out.insert(fo.pc, e);
            }
        }
        out
    }

    /// a field of an account type's deserialized object at an offset (objField)
    pub fn obj_field(&self, ty: Option<&str>, off: f64) -> Option<String> {
        let ty = ty?;
        let ex = self.exit_fns();
        let o = ex.values().flat_map(exit_objs).find(|x| x.0.ty.as_deref() == Some(ty))?;
        o.0.fields.iter().find(|x| off >= x.off && off < x.off + x.size).map(|x| x.name.clone())
    }

    /// Stores into the fields of an account object before its exit function serializes it
    pub fn add_exit_writes(&self) {
        if !self.anchor {
            return;
        }
        let exits = self.exit_fns();
        for fo in &self.funcs {
            if !self.facts.borrow().contains_key(&fo.pc) {
                continue;
            }
            let f = fo.f;
            let ir = fir(f);
            let fp = fp_of(f);
            let order = stmts_in_order(f);
            let sites: Vec<(usize, usize)> = order
                .iter()
                .copied()
                .filter(|&(b, i)| matches!(call_of(ir, &f.blocks[b].stmts[i]), Some((CallTarget::Fn { pc }, _)) if exits.contains_key(&pc)))
                .collect();
            if sites.is_empty() {
                self.memo.objs.borrow_mut().insert(fo.pc, Rc::new(vec![]));
                if fo.name.starts_with("ix_") {
                    self.callee_writes(fo.pc, Rc::new(vec![]), &exits);
                }
                continue;
            }
            let g = self.cfg(fo.pc);
            let defs = single_defs(f);
            let d = self.fl.defs_of(f, true);
            let mut objs: Vec<FrameObj> = Vec::new();
            for &(sb, si) in &sites {
                let s0 = &f.blocks[sb].stmts[si];
                let (ct, args) = call_of(ir, s0).unwrap();
                let CallTarget::Fn { pc: callee } = ct else { unreachable!() };
                for (ex, exname) in exit_objs(&exits[&callee]) {
                    let a = if ex.param >= 1 && (ex.param as u32) <= args.len { Some(ir.at(args, ex.param as u32 - 1)) } else { None };
                    let Some(x) = a.and_then(|a| off_of(ir, a, fp)) else { continue };
                    let acct = exname
                        .clone()
                        .or_else(|| self.facts.borrow()[&fo.pc].checks.iter().find(|k| k.before == Some(callee) && k.named.is_some()).and_then(|k| k.named.clone()))
                        .unwrap_or_else(|| ex.ty.as_ref().map_or("account?".to_string(), |t| snake1(t)));
                    let s0pc = stmt_pc(s0);
                    let exit_block = g.pc_block.get(&s0pc).copied();
                    let mut seen: HashSet<String> = HashSet::new();
                    let size = ex.fields.iter().map(|x| x.off + x.size).fold(f64::NEG_INFINITY, f64::max);
                    let deltas_of = |b: usize, i: usize, a0: f64| -> Vec<f64> {
                        let s = &f.blocks[b].stmts[i];
                        let (vals, sz): (Vec<E>, f64) = match s {
                            Stmt::Store { v, size, .. } => (vec![*v], *size as f64),
                            Stmt::Stores { vals, size, .. } => (ir.to_vec(*vals), *size as f64),
                            _ => return vec![],
                        };
                        let at = pos_of(b, i);
                        let srcs: Vec<Option<f64>> = vals
                            .iter()
                            .map(|&v| {
                                let dd = match ir.get(v) {
                                    Node::Var(id) => defs.get(&id).copied().or_else(|| if d.multi.contains(&id) { d.reaching(&self.fl, id as f64, at, false).map(|y| y.0) } else { None }),
                                    _ => Some(v),
                                };
                                match dd.map(|x| ir.get(x)) {
                                    Some(Node::Load { addr, .. }) => off_of(ir, addr, fp),
                                    _ => None,
                                }
                            })
                            .collect();
                        let deltas: Vec<f64> = srcs.iter().enumerate().filter_map(|(i, o)| o.map(|o| o - (a0 + i as f64 * sz))).collect();
                        if !deltas.is_empty() && deltas.iter().all(|&x| x == deltas[0] && x != 0.0) && vals.iter().enumerate().all(|(i, &v)| srcs[i].is_some() || matches!(ir.get(v), Node::Var(_))) {
                            deltas
                        } else {
                            vec![]
                        }
                    };
                    let mut per_delta: HashMap<FK, i64> = HashMap::new();
                    for &(b, i) in &order {
                        if let Stmt::Store { addr, .. } | Stmt::Stores { addr, .. } = &f.blocks[b].stmts[i] {
                            if let Some(a0) = off_of(ir, *addr, fp) {
                                if a0 >= x && a0 < x + size {
                                    for dl in deltas_of(b, i, a0) {
                                        *per_delta.entry(FK::of(dl)).or_insert(0) += 1;
                                    }
                                }
                            }
                        }
                    }
                    let copied = |b: usize, i: usize, a0: f64| {
                        let ds = deltas_of(b, i, a0);
                        ds.len() > 1 || (ds.len() == 1 && per_delta.get(&FK::of(ds[0])).copied().unwrap_or(0) > 1)
                    };
                    let mut inits: Vec<i64> = Vec::new();
                    for &(b, i) in &order {
                        let s = &f.blocks[b].stmts[i];
                        let cc = call_of(ir, s);
                        let dst = match s {
                            Stmt::Copy { dst, .. } => Some(*dst),
                            _ => match &cc {
                                Some((CallTarget::Fn { pc }, cargs)) if self.pname(*pc).contains("memcpy") => Some(ir.at(*cargs, 0)),
                                _ => None,
                            },
                        };
                        let o = dst.and_then(|dd| off_of(ir, dd, fp));
                        let is_try = matches!(&cc, Some((CallTarget::Fn { pc }, _)) if self.try_of.get(&fo.pc) == Some(pc));
                        if o.is_some_and(|o| o >= x && o < x + size) || is_try {
                            inits.push(stmt_pc(s));
                        } else if let Stmt::Store { addr, .. } | Stmt::Stores { addr, .. } = s {
                            if let Some(a0) = off_of(ir, *addr, fp) {
                                if a0 >= x && a0 < x + size && copied(b, i, a0) {
                                    inits.push(stmt_pc(s));
                                }
                            }
                        }
                    }
                    let after = |spc: i64| -> bool {
                        let Some(&b) = g.pc_block.get(&spc) else { return false };
                        let Some(eb) = exit_block else { return false };
                        inits.iter().any(|&ipc| match g.pc_block.get(&ipc) {
                            Some(&ib) => {
                                if ib == b {
                                    ipc < spc
                                } else {
                                    dominates(&g, ib, b)
                                }
                            }
                            None => false,
                        }) && (if b == eb { spc < s0pc } else { !dominates(&g, eb, b) })
                    };
                    let callee_name = self.fo(callee).map_or(callee.to_string(), |x| x.name.clone());
                    for &(b, i) in &order {
                        let s = &f.blocks[b].stmts[i];
                        let (addr, n) = match s {
                            Stmt::Store { addr, size, .. } => (*addr, *size as f64),
                            Stmt::Stores { addr, size, vals, .. } => (*addr, *size as f64 * vals.len as f64),
                            _ => continue,
                        };
                        let Some(a0) = off_of(ir, addr, fp) else { continue };
                        let spc = stmt_pc(s);
                        if !after(spc) {
                            continue;
                        }
                        if copied(b, i, a0) {
                            continue;
                        }
                        for fld in ex.fields.iter().filter(|fx| a0 < x + fx.off + fx.size && x + fx.off < a0 + n) {
                            if seen.contains(&fld.name) {
                                continue;
                            }
                            seen.insert(fld.name.clone());
                            let mut facts = self.facts.borrow_mut();
                            let ff = facts.get_mut(&fo.pc).unwrap();
                            let Some(&line) = ff.pc_line.get(&spc) else { continue };
                            let text = ff.lines.get((line - 1) as usize).map_or(String::new(), |l| super::js_trim(l).to_string());
                            let how = match s {
                                Stmt::Store { v, .. } => match ir.get(*v) {
                                    Node::Bin(op @ (BinOp::Add | BinOp::Sub), va, _) if matches!(ir.get(va), Node::Load { addr, .. } if off_of(ir, addr, fp) == Some(a0)) => {
                                        if op == BinOp::Add {
                                            "+="
                                        } else {
                                            "-="
                                        }
                                    }
                                    _ => "=",
                                },
                                _ => "=",
                            };
                            let mut kinds = vec!["ACCOUNT_DATA_WRITE"];
                            if authority(&fld.name) || (fld.size == 32.0 && fld.name.starts_with("data[") && authority(&fo.name)) {
                                kinds.push("AUTHORITY_WRITE");
                            }
                            let sbk = g.pc_block.get(&spc).copied();
                            let main = match (sbk, exit_block) {
                                (Some(sbk), Some(eb)) => dominates(&g, sbk, eb) && ff.checks.iter().all(|k| k.pc.is_none_or(|p| p == 0) || g.pc_block.get(&k.pc.unwrap()).copied() != Some(sbk)),
                                _ => false,
                            };
                            let mut op = Op {
                                line,
                                pc: Some(spc),
                                kinds,
                                text: text.clone(),
                                main,
                                err_path: false,
                                cpi: None,
                                target: Some(super::facts::Ref { acct: acct.clone(), field: Some(fld.name.clone()) }),
                                how: Some(how),
                                value: Some(store_value(&text)),
                                pda: None,
                                via: None,
                                ret: None,
                                exit: None,
                                handler: None,
                            };
                            op.exit = Some(format!("serialized back by {callee_name}{}", ex.ty.as_ref().map_or(String::new(), |t| format!(" ({t})"))));
                            ff.ops.push(op);
                        }
                    }
                    objs.push(FrameObj {
                        x,
                        size,
                        acct,
                        ex: ex.clone(),
                        exit: callee_name,
                    });
                }
            }
            let objs = Rc::new(objs);
            self.memo.objs.borrow_mut().insert(fo.pc, objs.clone());
            if !objs.is_empty() {
                self.callee_writes(fo.pc, objs, &exits);
            }
        }
    }
}

// ---- the handler's account evaluator (HVal) ----

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum HK {
    Info,
    Rc,
    Drc,
    Lam,
    Data,
    Keyp,
    Ownp,
    Rem,
    Obj,
    Objp,
}

impl HK {
    pub fn as_str(self) -> &'static str {
        match self {
            HK::Info => "info",
            HK::Rc => "rc",
            HK::Drc => "drc",
            HK::Lam => "lam",
            HK::Data => "data",
            HK::Keyp => "keyp",
            HK::Ownp => "ownp",
            HK::Rem => "rem",
            HK::Obj => "obj",
            HK::Objp => "objp",
        }
    }
}

/// a value that is not a frame pointer (a JS object: shared by reference, mutable in place)
#[derive(Clone, Debug)]
pub struct HA {
    pub k: HK,
    pub acct: String,
    pub ty: Option<String>,
    pub off: f64,
    pub guess: Option<bool>,
    /// (JSON key order: guess before off)
    pub guess_first: bool,
    pub seq: Option<Vec<String>>,
    pub fo: Option<f64>,
    pub vo: bool,
}

impl HA {
    pub fn new(k: HK, acct: String, off: f64) -> HA {
        HA {
            k,
            acct,
            ty: None,
            off,
            guess: None,
            guess_first: false,
            seq: None,
            fo: None,
            vo: false,
        }
    }
    pub fn json(&self) -> String {
        let mut o = format!(r#"{{"k":"{}","acct":{}"#, self.k.as_str(), crate::util::json_str(&self.acct));
        if let Some(t) = &self.ty {
            o.push_str(&format!(r#","ty":{}"#, crate::util::json_str(t)));
        }
        if let Some(s) = &self.seq {
            o.push_str(&format!(r#","seq":[{}]"#, s.iter().map(|x| crate::util::json_str(x)).collect::<Vec<_>>().join(",")));
        }
        if let (Some(g), true) = (self.guess, self.guess_first) {
            o.push_str(&format!(r#","guess":{g}"#));
        }
        o.push_str(&format!(r#","off":{}"#, js_num(self.off)));
        if let Some(f) = self.fo {
            o.push_str(&format!(r#","fo":{}"#, js_num(f)));
        }
        if let (Some(g), false) = (self.guess, self.guess_first) {
            o.push_str(&format!(r#","guess":{g}"#));
        }
        if self.vo {
            o.push_str(r#","vo":true"#);
        }
        o.push('}');
        o
    }
}

#[derive(Clone)]
pub enum HVal<'a> {
    Fr { ctx: Rc<ACtx<'a>>, z: f64, at: Pos },
    A(Rc<RefCell<HA>>),
}

impl<'a> HVal<'a> {
    pub fn a(x: HA) -> HVal<'a> {
        HVal::A(Rc::new(RefCell::new(x)))
    }
    pub fn k(&self) -> Option<HK> {
        match self {
            HVal::A(x) => Some(x.borrow().k),
            _ => None,
        }
    }
    pub fn ha(&self) -> Option<HA> {
        match self {
            HVal::A(x) => Some(x.borrow().clone()),
            _ => None,
        }
    }
}

/// INFO_WORD: an AccountInfo's pointer words (repr(C) offsets)
fn info_word(o: f64) -> Option<HK> {
    Some(match o {
        x if x == 0.0 => HK::Keyp,
        x if x == 8.0 => HK::Rc,
        x if x == 16.0 => HK::Drc,
        x if x == 24.0 => HK::Ownp,
        _ => return None,
    })
}

struct HMemo<'a> {
    p: Pos,
    x: Option<HVal<'a>>,
    more: Option<HashMap<Pos, Option<HVal<'a>>>>,
}

/// An evaluation context of the handler or a function it calls (EvCtx)
pub struct ACtx<'a> {
    me: Weak<ACtx<'a>>,
    ae: Rc<AnchorEval<'a>>,
    pub fo: i64,
    pub f: &'a Func,
    pub d: Rc<Defs<'a>>,
    roots: IndexMap<u32, HVal<'a>>,
    depth: i32,
    memo: RefCell<HashMap<E, HMemo<'a>>>,
    /// (calleeWrites: the visit key of the context)
    pub key: RefCell<Option<String>>,
}

pub struct TryInfo {
    pub try_pc: i64,
    pub layout: Vec<Field>,
    pub box_info: Option<IndexMap<String, f64>>,
    pub words: Option<IndexMap<FK, (f64, String, f64)>>,
    pub ptrs: Option<IndexMap<u32, String>>,
    pub seqs: Option<IndexMap<u32, Vec<String>>>,
}

pub struct AnchorEval<'a> {
    me: Weak<AnchorEval<'a>>,
    an: *const An<'a>,
    h: i64,
    d: Rc<Defs<'a>>,
    ti: Option<Rc<TryInfo>>,
    try_pc: Option<i64>,
    disc_type: HashMap<u64, String>,
    accounts_param: Option<u32>,
    objs: Rc<Vec<FrameObj>>,
    exits: Rc<IndexMap<i64, ExitFn>>,
}

fn is_info(t: &FT) -> bool {
    matches!(t, FT::Ref(to) if to == "AccountInfo")
}

/// the account the handler's frame word holds (infoAcct)
struct IA {
    acct: String,
    ty: Option<String>,
    guess: Option<bool>,
    word: Option<f64>,
    bx: bool,
}

impl<'a> AnchorEval<'a> {
    fn an(&self) -> &An<'a> {
        // SAFETY: an AnchorEval lives in its An's memo and never outlives it
        unsafe { &*self.an }
    }
    fn legacy(&self) -> bool {
        self.an().fl.callee.legacy
    }
    fn rest_slice(&self, z: f64, args: &[E], p: Pos) -> bool {
        let dd = &self.d;
        if !args.iter().any(|&x| dd.fp_off(x) == Some(z)) {
            return false;
        }
        let an = self.an();
        match dd.reaching(&an.fl, slot(z), p, false) {
            Some((y, _)) => matches!(dd.ir.get(y), Node::Var(id) if Some(id) == self.accounts_param),
            None => false,
        }
    }
    fn info_acct(&self, z0: f64, at0: Pos) -> Option<IA> {
        let an = self.an();
        let dd = &self.d;
        let ir = dd.ir;
        let ow = || -> Option<IA> {
            for o in self.objs.iter() {
                let hi = (to_int32(o.x + o.size + 7.0) & !7) as f64 + 8.0;
                if z0 >= o.x + obj_lo(o) - 8.0 && z0 < hi && !o.ex.fields.iter().any(|x| z0 < o.x + x.off + x.size && o.x + x.off < z0 + 8.0) {
                    return Some(IA {
                        acct: o.acct.clone(),
                        ty: o.ex.ty.clone(),
                        guess: Some(true),
                        word: None,
                        bx: false,
                    });
                }
            }
            None
        };
        let layout: &[Field] = self.ti.as_ref().map_or(&[], |t| &t.layout);
        let (mut z, mut at) = (z0, at0);
        for _ in 0..6 {
            let Some((mut e, mut p)) = dd.reaching(&an.fl, slot(z), at, true) else { return ow() };
            let mut j = 0;
            while j < 4 {
                let Node::Var(id) = ir.get(e) else { break };
                let Some(y) = dd.def_at(&an.fl, id, p) else { return ow() };
                (e, p) = y;
                j += 1;
            }
            if let Node::Call(t, args) = ir.get(e) {
                if let CallTarget::Fn { pc } = ir.target(t) {
                    if Some(pc) == self.try_pc {
                        let tt = dd.fp_off(ir.at(args, 0));
                        let bv = tt.and_then(|tt| self.ti.as_ref().and_then(|ti| ti.words.as_ref()).and_then(|w| w.get(&FK::of(z - tt))).cloned());
                        if let Some(bv) = bv {
                            return Some(IA {
                                acct: bv.1,
                                ty: None,
                                guess: None,
                                word: Some(bv.2),
                                bx: false,
                            });
                        }
                        let f = tt.and_then(|tt| {
                            layout.iter().find(|x| {
                                (tt + x.off == z && is_info(&x.t))
                                    || match &x.t {
                                        FT::Embed(ty) => an.views.map.get(ty).is_some_and(|v| v.fields.iter().any(|y| tt + x.off + y.off == z && is_info(&y.t))),
                                        _ => false,
                                    }
                            })
                        });
                        let bx = if f.is_some() || tt.is_none() {
                            None
                        } else {
                            let tt = tt.unwrap();
                            layout.iter().find(|x| tt + x.off == z && matches!(x.t, FT::Ref(_)) && crate::jre!(r"boxed account object|^Box<Account<").is_match(x.doc.as_deref().unwrap_or("")))
                        };
                        if let Some(bx) = bx {
                            let FT::Ref(to) = &bx.t else { unreachable!() };
                            return Some(IA {
                                acct: bx.name.clone(),
                                ty: if to == "Box" { None } else { Some(to.clone()) },
                                guess: None,
                                word: None,
                                bx: true,
                            });
                        }
                        return match f {
                            Some(f) => Some(IA {
                                acct: f.name.clone(),
                                ty: match &f.t {
                                    FT::Embed(t) => Some(t.clone()),
                                    _ => crate::jre!(r"account of type (\w+)").captures(f.doc.as_deref().unwrap_or("")).map(|m| m[1].to_string()),
                                },
                                guess: None,
                                word: None,
                                bx: false,
                            }),
                            None => ow(),
                        };
                    }
                }
            }
            let w = match ir.get(e) {
                Node::Load { size: 8, addr } => dd.fp_off(addr),
                _ => None,
            };
            let Some(w) = w else { return ow() };
            z = w;
            at = p;
        }
        ow()
    }
    /// a zero-copy account's field at a data offset
    pub fn zc_field(&self, ty: Option<&str>, off: f64, n: f64) -> Option<String> {
        let an = self.an();
        let idl = an.idl?;
        let fs = crate::idl::struct_fields(ty?, &idl.types);
        let mut o = 8.0;
        for (name, t) in fs.unwrap_or_default() {
            let z = crate::idl::borsh_size(&t, &idl.types, 0)?;
            if off < o + z && o < off + n {
                return Some(name);
            }
            o += z;
        }
        None
    }
    pub fn ctx_of(&self, fo: i64, roots: IndexMap<u32, HVal<'a>>, depth: i32) -> Rc<ACtx<'a>> {
        let an = self.an();
        let f = an.fo(fo).unwrap().f;
        let d = if fo == self.h { self.d.clone() } else { an.fl.defs_of(f, true) };
        let ae = self.me.upgrade().unwrap();
        Rc::new_cyclic(|me| ACtx {
            me: me.clone(),
            ae,
            fo,
            f,
            d,
            roots,
            depth,
            memo: RefCell::new(HashMap::new()),
            key: RefCell::new(None),
        })
    }
    /// the account (and field) a frame word of the handler holds
    pub fn frame_acct(&self, z: f64, n: f64, at: Pos) -> Option<(String, Option<String>, bool)> {
        let an = self.an();
        for o in self.objs.iter() {
            if z >= o.x + obj_lo(o) && z < o.x + o.size {
                if let Some(f) = o.ex.fields.iter().find(|x| z < o.x + x.off + x.size && o.x + x.off < z + n) {
                    return Some((o.acct.clone(), Some(f.name.clone()), false));
                }
            }
        }
        let dd = &self.d;
        let ir = dd.ir;
        let (mut e, mut p) = dd.reaching(&an.fl, slot(z), at, true)?;
        let mut j = 0;
        while j < 4 {
            let Node::Var(id) = ir.get(e) else { break };
            (e, p) = dd.def_at(&an.fl, id, p)?;
            j += 1;
        }
        let _ = p;
        let Node::Call(t, args) = ir.get(e) else { return None };
        if !matches!(ir.target(t), CallTarget::Fn { pc } if Some(pc) == self.try_pc) {
            return None;
        }
        let tt = dd.fp_off(ir.at(args, 0))?;
        if let Some(bw) = self.ti.as_ref().and_then(|ti| ti.words.as_ref()).and_then(|w| w.get(&FK::of(z - tt))) {
            let fl = if self.legacy() { legacy_info_field(bw.2) } else { info_field_c(bw.2) };
            return Some((bw.1.clone(), fl.map(|x| x.to_string()), false));
        }
        let layout: &[Field] = self.ti.as_ref().map_or(&[], |t| &t.layout);
        let f = layout.iter().find(|x| {
            let sz = match &x.t {
                FT::Embed(ty) => an.views.map.get(ty).and_then(|v| v.size).unwrap_or(8.0),
                _ => 8.0,
            };
            z >= tt + x.off && z < tt + x.off + sz.max(8.0)
        })?;
        if is_info(&f.t) {
            return Some((f.name.clone(), None, true));
        }
        let fl = match &f.t {
            FT::Embed(ty) => an.views.map.get(ty).and_then(|v| v.fields.iter().find(|y| z >= tt + f.off + y.off && z < tt + f.off + y.off + 8.0)),
            _ => None,
        };
        if fl.is_some_and(|y| is_info(&y.t)) {
            Some((f.name.clone(), None, true))
        } else {
            Some((f.name.clone(), fl.map(|y| y.name.clone()), false))
        }
    }
}

fn info_field_c(o: f64) -> Option<&'static str> {
    Some(match o as i64 {
        0 => "key",
        8 => "lamports",
        0x10 => "data",
        0x18 => "owner",
        0x20 => "rent_epoch",
        0x28 => "is_signer",
        0x29 => "is_writable",
        0x2a => "executable",
        _ => return None,
    })
    .filter(|_| o.fract() == 0.0)
}

fn legacy_info_field(o: f64) -> Option<&'static str> {
    Some(match o as i64 {
        0 => "rent_epoch",
        8 => "key",
        0x10 => "lamports",
        0x18 => "data",
        0x20 => "owner",
        0x28 => "is_signer",
        0x29 => "is_writable",
        0x2a => "executable",
        _ => return None,
    })
    .filter(|_| o.fract() == 0.0)
}

impl<'a> ACtx<'a> {
    fn rc(&self) -> Rc<ACtx<'a>> {
        self.me.upgrade().unwrap()
    }
    fn an(&self) -> &An<'a> {
        self.ae.an()
    }
    pub fn ir(&self) -> &'a Ir {
        fir(self.f)
    }
    /// what a call left in the object it got a pointer to: the callee's single store there
    fn out_of(&self, t: CallTarget, args: &[E], z: f64, p: Pos, d: i32) -> Option<HVal<'a>> {
        let an = self.an();
        let CallTarget::Fn { pc } = t else { return None };
        if self.depth <= 0 {
            return None;
        }
        let g = an.fo(pc)?;
        if self.ae.exits.contains_key(&g.pc) {
            return None;
        }
        let cd = &self.d;
        let j = args.iter().position(|&a| cd.fp_off(a).is_some_and(|o| o <= z && z < o + 128.0));
        let pv = param_var(g.f, j.map_or(0, |j| j as i32 + 1));
        let (Some(j), Some(pv)) = (j, pv) else { return None };
        let off = z - cd.fp_off(args[j]).unwrap();
        let gd = an.fl.defs_of(g.f, true);
        let key = (g.pc, pv, FK::of(off));
        let vs = {
            let hit = an.memo.out_stores.borrow().get(&key).cloned();
            match hit {
                Some(v) => v,
                None => {
                    let gir = fir(g.f);
                    fn at(gir: &Ir, gd: &Defs, pv: u32, e: E, k: u32) -> Option<f64> {
                        match gir.get(e) {
                            Node::Var(id) => {
                                if id == pv {
                                    Some(0.0)
                                } else if k < 6 {
                                    gd.defs.get(&id).and_then(|&x| at(gir, gd, pv, x, k + 1))
                                } else {
                                    None
                                }
                            }
                            Node::Bin(BinOp::Add, a, b) => match gir.get(b) {
                                Node::Const(v) => at(gir, gd, pv, a, k + 1).map(|x| x + s_num(v)),
                                _ => None,
                            },
                            _ => None,
                        }
                    }
                    let mut l: Vec<(E, Pos)> = Vec::new();
                    for (bi, b) in g.f.blocks.iter().enumerate() {
                        for (i, s) in b.stmts.iter().enumerate() {
                            if let Stmt::Store { size: 8, addr, v, .. } = s {
                                if at(gir, &gd, pv, *addr, 0) == Some(off) {
                                    l.push((*v, pos_of(bi, i)));
                                }
                            }
                        }
                    }
                    let v = Rc::new(l);
                    an.memo.out_stores.borrow_mut().insert(key, v.clone());
                    v
                }
            }
        };
        if vs.is_empty() || vs.len() > 8 {
            return None;
        }
        let mut rs: IndexMap<u32, HVal<'a>> = IndexMap::new();
        for (k, &a) in args.iter().enumerate() {
            let x = self.ev(a, p, d + 1);
            let q = arg_param(g.f, k);
            if let (Some(x), Some(q)) = (x, q) {
                if k != j {
                    rs.insert(q, x);
                }
            }
        }
        let gc = self.ae.ctx_of(g.pc, rs, self.depth - 1);
        let xs: Vec<HVal<'a>> = vs.iter().filter_map(|&(e, q)| gc.ev(e, q, d + 1)).filter(|x| !matches!(x, HVal::Fr { .. })).collect();
        if xs.is_empty() {
            return None;
        }
        let j0 = xs[0].ha().unwrap().json();
        if !xs.iter().all(|x| x.ha().unwrap().json() == j0) {
            return None;
        }
        let x = xs[0].clone();
        if let HVal::A(xa) = &x {
            if xa.borrow().k == HK::Data && xa.borrow().ty.is_none() {
                let gir = fir(g.f);
                for b in &g.f.blocks {
                    if let Term::Br { c, .. } = &b.term {
                        let mut cs: Vec<u64> = Vec::new();
                        gir.walk(*c, &mut |_, n| {
                            if let Node::Const(v) = n {
                                cs.push(v);
                            }
                        });
                        for v in cs {
                            if xa.borrow().ty.is_none() {
                                let t = self.ae.disc_type.get(&v).cloned();
                                xa.borrow_mut().ty = t;
                            }
                        }
                    }
                }
            }
        }
        Some(x)
    }

    pub fn ev(&self, e: E, p: Pos, d: i32) -> Option<HVal<'a>> {
        let an = self.an();
        if d > 16 {
            an.fl.ev_cuts.set(an.fl.ev_cuts.get() + 1);
            return None;
        }
        let had = {
            let m = self.memo.borrow();
            match m.get(&e) {
                Some(m) => {
                    if m.p == p {
                        return m.x.clone();
                    }
                    if let Some(x) = m.more.as_ref().and_then(|mm| mm.get(&p)) {
                        return x.clone();
                    }
                    true
                }
                None => false,
            }
        };
        let c0 = an.fl.ev_cuts.get();
        let x = self.ev0(e, p, d);
        if an.fl.ev_cuts.get() == c0 {
            let mut m = self.memo.borrow_mut();
            if had {
                if let Some(y) = m.get_mut(&e) {
                    y.more.get_or_insert_with(HashMap::new).insert(p, x.clone());
                }
            } else {
                m.insert(e, HMemo { p, x: x.clone(), more: None });
            }
        }
        x
    }

    /// a loop cursor: a variable set once from a value and otherwise stepped by a constant
    fn stepped(&self, id: u32) -> Option<(E, Pos)> {
        let ir = self.ir();
        let mut init: Option<(E, Pos)> = None;
        for (bi, b) in self.f.blocks.iter().enumerate() {
            for (i, s) in b.stmts.iter().enumerate() {
                let Stmt::Set { dst, e: x, .. } = s else { continue };
                if *dst as i64 != id as i64 {
                    continue;
                }
                if let Node::Bin(BinOp::Add, a, c) = ir.get(*x) {
                    if ir.get(a) == Node::Var(id) && matches!(ir.get(c), Node::Const(_)) {
                        continue;
                    }
                }
                if init.is_some() {
                    return None;
                }
                init = Some((*x, pos_of(bi, i)));
            }
        }
        init
    }

    fn ev0(&self, e: E, p: Pos, d: i32) -> Option<HVal<'a>> {
        let an = self.an();
        let ir = self.ir();
        let cd = &self.d;
        if let Some(o) = cd.fp_off(e) {
            return Some(HVal::Fr { ctx: self.rc(), z: o, at: p });
        }
        let legacy = self.ae.legacy();
        match ir.get(e) {
            Node::Var(id) => {
                if let Some(x) = self.roots.get(&id) {
                    return Some(x.clone());
                }
                let (y, step) = if let Some(&x) = cd.defs.get(&id) {
                    (Some((x, cd.def_pos[&id])), false)
                } else if cd.multi.contains(&id) {
                    match cd.reaching(&an.fl, id as f64, p, false) {
                        Some(y) => (Some(y), false),
                        None => match self.stepped(id) {
                            Some(y) => (Some(y), true),
                            None => (None, false),
                        },
                    }
                } else {
                    (None, false)
                };
                let v0 = match y {
                    Some((x, q)) if !matches!(ir.get(x), Node::Call(..)) => self.ev(x, q, d + 1),
                    _ => None,
                };
                let v = match (&v0, step) {
                    (Some(HVal::A(a)), true) if a.borrow().k == HK::Objp => {
                        let mut c = a.borrow().clone();
                        c.vo = true;
                        Some(HVal::a(c))
                    }
                    _ => v0,
                };
                match v {
                    Some(HVal::Fr { ctx, z, .. }) if Rc::ptr_eq(&ctx, &self.rc()) => Some(HVal::Fr { ctx, z, at: p }),
                    v => v,
                }
            }
            Node::Ext { a, .. } => self.ev(a, p, d + 1),
            Node::Bin(op, a, b) => {
                let bc = match ir.get(b) {
                    Node::Const(v) => Some(v),
                    _ => None,
                };
                if op == BinOp::Add && bc.is_none() {
                    for x in [a, b] {
                        if let Some(HVal::A(y)) = self.ev(x, p, d + 1) {
                            if y.borrow().k == HK::Objp {
                                let mut c = y.borrow().clone();
                                c.vo = true;
                                return Some(HVal::a(c));
                            }
                        }
                    }
                    return None;
                }
                if op == BinOp::And {
                    if let Some(v) = bc {
                        let s = v as i64;
                        if (-16..0).contains(&s) {
                            let x = self.ev(a, p, d + 1);
                            return match &x {
                                Some(HVal::A(y)) if y.borrow().k == HK::Obj && y.borrow().off == 0.0 => x,
                                _ => None,
                            };
                        }
                    }
                }
                if op != BinOp::Add {
                    return None;
                }
                let bv = bc?;
                let x = self.ev(a, p, d + 1);
                let c = s_num(bv);
                if let Some(HVal::A(y)) = &x {
                    let yb = y.borrow();
                    if yb.k == HK::Info && yb.seq.is_some() && yb.off == 0.0 && c > 0.0 && c % 48.0 == 0.0 {
                        let seq = yb.seq.as_ref().unwrap();
                        let k = (c / 48.0) as usize;
                        let q: Vec<String> = if k < seq.len() { seq[k..].to_vec() } else { vec![] };
                        if q.is_empty() {
                            return None;
                        }
                        let mut h = HA::new(HK::Info, q[0].clone(), 0.0);
                        h.seq = Some(q);
                        return Some(HVal::a(h));
                    }
                }
                match x {
                    Some(HVal::Fr { ctx, z, at }) => Some(HVal::Fr { ctx, z: z + c, at }),
                    Some(HVal::A(y)) => {
                        let mut h = y.borrow().clone();
                        h.off += c;
                        Some(HVal::a(h))
                    }
                    None => None,
                }
            }
            Node::Load { size, addr } => {
                if size != 8 {
                    return None;
                }
                let a = self.ev(addr, p, d + 1);
                if let Some(HVal::Fr { ctx: actx, z, at }) = &a {
                    let (z, at) = (*z, *at);
                    let y = actx.d.reaching(&an.fl, slot(z), at, true);
                    let aid = actx.ir();
                    if let Some((ye, yq)) = y {
                        if actx.fo == self.ae.h {
                            if let Node::Call(t, args) = aid.get(ye) {
                                if matches!(aid.target(t), CallTarget::Fn { pc } if Some(pc) == self.ae.try_pc) && self.ae.rest_slice(z, &aid.to_vec(args), yq) {
                                    return Some(HVal::a(HA::new(HK::Rem, "remaining_accounts".into(), 0.0)));
                                }
                            }
                        }
                    }
                    let yc = y.and_then(|(ye, _)| match aid.get(ye) {
                        Node::Call(t, args) => match aid.target(t) {
                            CallTarget::Fn { pc } if crate::jre!(r"^AccountInfo_clone\b").is_match(&(an.fl.callee.name)(pc)) => Some(aid.to_vec(args)),
                            _ => None,
                        },
                        _ => None,
                    });
                    let dz = yc.as_ref().and_then(|args| if args.len() > 1 { actx.d.fp_off(args[0]) } else { None });
                    if let (Some(args), Some(dz)) = (&yc, dz) {
                        if z >= dz && z < dz + 48.0 {
                            let src = actx.ev(args[1], y.unwrap().1, d + 1);
                            let k = info_word(if legacy { z - dz - 8.0 } else { z - dz });
                            return match (src, k) {
                                (Some(HVal::A(s)), Some(k)) if s.borrow().k == HK::Info && s.borrow().off == 0.0 => {
                                    let sb = s.borrow();
                                    let mut h = HA::new(k, sb.acct.clone(), 0.0);
                                    h.ty = sb.ty.clone();
                                    h.guess = sb.guess;
                                    Some(HVal::a(h))
                                }
                                _ => None,
                            };
                        }
                    }
                    let v = match y {
                        None => None,
                        Some((ye, yq)) => match aid.get(ye) {
                            Node::Call(t, args) => {
                                if Rc::ptr_eq(actx, &self.rc()) {
                                    self.out_of(aid.target(t), &aid.to_vec(args), z, yq, d)
                                } else {
                                    None
                                }
                            }
                            _ => actx.ev(ye, yq, d + 1),
                        },
                    };
                    if v.is_some() {
                        return v;
                    }
                    let ia = if actx.fo == self.ae.h { self.ae.info_acct(z, at) } else { None };
                    if let Some(ia) = &ia {
                        if let Some(w) = ia.word {
                            let k = info_word(if legacy { w - 8.0 } else { w });
                            return k.map(|k| HVal::a(HA::new(k, ia.acct.clone(), 0.0)));
                        }
                        if ia.bx {
                            let mut h = HA::new(HK::Obj, ia.acct.clone(), 0.0);
                            h.ty = ia.ty.clone();
                            return Some(HVal::a(h));
                        }
                    }
                    return ia.map(|ia| {
                        let mut h = HA::new(HK::Info, ia.acct, 0.0);
                        h.ty = ia.ty;
                        h.guess = ia.guess;
                        h.guess_first = true;
                        HVal::a(h)
                    });
                }
                let Some(HVal::A(ab)) = a else { return None };
                let ah = ab.borrow().clone();
                if ah.k == HK::Obj && !ah.vo {
                    let bi = self.ae.ti.as_ref().and_then(|t| t.box_info.as_ref()).and_then(|b| b.get(&ah.acct).copied());
                    let viaty = ah.ty.as_ref().is_some_and(|t| an.views.map.get(t).is_some_and(|v| v.fields.iter().any(|x| x.off == ah.off && is_info(&x.t))));
                    if bi == Some(ah.off) || viaty {
                        return Some(HVal::a(HA::new(HK::Info, ah.acct, 0.0)));
                    }
                    let mut h = HA::new(HK::Objp, ah.acct, 0.0);
                    h.ty = ah.ty;
                    h.fo = Some(ah.off);
                    return Some(HVal::a(h));
                }
                if matches!(ah.k, HK::Lam | HK::Data | HK::Keyp | HK::Ownp | HK::Obj | HK::Objp) {
                    return None;
                }
                if ah.k == HK::Rem {
                    let i = (ah.off / 48.0).floor();
                    let w = ah.off - 48.0 * i;
                    let k = info_word(if legacy { w - 8.0 } else { w });
                    return k.map(|k| HVal::a(HA::new(k, format!("remaining_accounts[{}]", js_num(i)), 0.0)));
                }
                let next = if ah.k == HK::Info {
                    info_word(if legacy { ah.off - 8.0 } else { ah.off })
                } else if ah.off == 24.0 {
                    match ah.k {
                        HK::Rc => Some(HK::Lam),
                        HK::Drc => Some(HK::Data),
                        _ => None,
                    }
                } else {
                    None
                };
                next.map(|k| {
                    let mut h = HA::new(k, ah.acct, 0.0);
                    h.ty = ah.ty;
                    h.guess = ah.guess;
                    HVal::a(h)
                })
            }
            _ => None,
        }
    }
}

// ---- try_accounts ----

impl<'a> An<'a> {
    fn tpc_of(&self, h: i64) -> Option<i64> {
        if let Some(&t) = self.try_of.get(&h) {
            return Some(t);
        }
        let facts = self.facts.borrow();
        facts.get(&h)?.calls.iter().find(|c| !c.err_path && facts.get(&c.callee).is_some_and(|f| f.checks.iter().any(|k| k.named.is_some()))).map(|c| c.callee)
    }

    /// An Anchor handler's Accounts::try_accounts and the Accounts struct's layout (tryInfo)
    pub fn try_info(&self, h: i64) -> Option<Rc<TryInfo>> {
        if let Some(m) = self.memo.try_memo.borrow().get(&h) {
            return m.clone();
        }
        let r = self.try_info0(h).map(Rc::new);
        self.memo.try_memo.borrow_mut().insert(h, r.clone());
        r
    }

    fn try_info0(&self, h: i64) -> Option<TryInfo> {
        let mut res: Option<TryInfo> = None;
        let known = self.try_of.get(&h).copied();
        let lay: Vec<Field> = self.acct_layouts.get(&h).cloned().unwrap_or_default();
        let tpc = known.or_else(|| {
            let facts = self.facts.borrow();
            let mut calls: Vec<&super::facts::Call> = facts.get(&h).map_or(vec![], |f| f.calls.iter().filter(|c| !c.err_path).collect());
            calls.sort_by_key(|c| c.line);
            calls.iter().find(|c| facts.get(&c.callee).is_some_and(|f| f.checks.iter().any(|k| k.named.is_some()))).map(|c| c.callee)
        });
        let tt = tpc.and_then(|t| self.fo(t));
        let tf = tpc.and_then(|t| self.facts.borrow().get(&t).cloned());
        if let (Some(tt), Some(tf)) = (tt, tf) {
            res = self.try_layout(tpc.unwrap(), tt, &tf, &lay, known.is_some());
        }
        if res.is_none() && self.tpc_of(h).is_none() {
            res = self.by_value_try(h);
        } else if let Some(r) = res.as_mut() {
            let se = self.slice_events(h, Some(r.try_pc));
            r.ptrs = se.as_ref().map(|s| s.ptrs.clone());
            r.seqs = se.map(|s| s.seqs);
        }
        res
    }
}

/// sliceEvents: the accounts try_accounts consumes from its accounts slice, in the IDL's order
pub struct SliceEv {
    pub names: Vec<String>,
    pub t: i64,
    pub evs: Vec<SEv>,
    pub ptrs: IndexMap<u32, String>,
    pub seqs: IndexMap<u32, Vec<String>>,
    pub tpc: i64,
}

#[derive(Clone, Debug)]
pub struct SEv {
    pub b: usize,
    pub i: usize,
    pub out: Option<f64>,
    pub v: Option<u32>,
    pub adv: Option<(u32, f64)>,
    pub idx: f64,
}

fn mk_field(name: String, off: f64, to: &str, doc: String) -> Field {
    Field {
        id: 0,
        name,
        off,
        t: FT::Ref(to.to_string()),
        doc: Some(doc),
        count: None,
    }
}

impl<'a> An<'a> {
    fn try_layout(&self, tpc: i64, t: &super::FnRef<'a>, tf: &super::facts::FnFacts, lay: &[Field], known: bool) -> Option<TryInfo> {
        let fl = &self.fl;
        let tfn = t.f;
        let ir = fir(tfn);
        let d = fl.defs_of(tfn, true);
        let out = param_var(tfn, 1);
        let mut layout: Vec<Field> = Vec::new();
        let named: Vec<&super::facts::Check> = tf.checks.iter().filter(|k| k.named.is_some() && k.before.is_some() && k.pc.is_some()).collect();
        let names: HashSet<String> = tf.checks.iter().filter_map(|k| k.named.clone()).collect();
        let slice_pv = param_var(tfn, 3);
        let copies = |id: u32| -> bool {
            let (mut any, mut other) = (false, false);
            for b in &tfn.blocks {
                for s in &b.stmts {
                    match s {
                        Stmt::Set { dst, e, .. } if *dst as i64 == id as i64 => {
                            if matches!(ir.get(*e), Node::Var(v) if Some(v) == slice_pv) {
                                any = true;
                            } else if ir.get(*e) != Node::Undef {
                                other = true;
                            }
                        }
                        Stmt::Call { dst, .. } if *dst as i64 == id as i64 => other = true,
                        _ => {}
                    }
                }
            }
            any && !other
        };
        let g = self.cfg(tpc);
        // (decision blocks of the named checks, by index in tf.checks)
        let db_memo: RefCell<HashMap<usize, Option<usize>>> = RefCell::new(HashMap::new());
        let ck_idx = |k: &super::facts::Check| tf.checks.iter().position(|x| std::ptr::eq(x, k)).unwrap();
        let db_of = |k: &super::facts::Check| -> Option<usize> {
            let i = ck_idx(k);
            if let Some(x) = db_memo.borrow().get(&i) {
                return *x;
            }
            let x = decision_block(&g, k.c, k.pc, k.pass_pc);
            db_memo.borrow_mut().insert(i, x);
            x
        };
        let slotc: std::cell::Cell<Option<f64>> = std::cell::Cell::new(None);
        let follow = |e: E, p: Pos| -> Option<(E, Pos)> {
            slotc.set(None);
            let (mut e, mut p) = (e, p);
            for _ in 0..6 {
                if let Node::Var(id) = ir.get(e) {
                    match d.def_at(fl, id, p) {
                        Some(y) => {
                            (e, p) = y;
                            continue;
                        }
                        None => break,
                    }
                }
                let o = match ir.get(e) {
                    Node::Load { size: 8, addr } => d.fp_off(addr),
                    _ => None,
                };
                let Some(o) = o else { break };
                let (y, q) = d.reaching(fl, slot(o), p, true)?;
                e = y;
                p = q;
                slotc.set(Some(o));
            }
            Some((e, p))
        };
        let fp_of_e = |e: Option<E>| -> Option<f64> {
            let e = e?;
            d.fp_off(e).or_else(|| match ir.get(e) {
                Node::Var(id) => d.defs.get(&id).and_then(|&x| d.fp_off(x)),
                _ => None,
            })
        };
        let copies_in = |st: &Stmt| -> Vec<(E, E, f64)> {
            let mut out: Vec<(E, E, f64)> = Vec::new();
            if let Stmt::Copy { dst, src, n, .. } = st {
                out.push((*dst, *src, *n as f64));
            }
            let c0e: Option<E> = match st {
                Stmt::Set { e, .. } | Stmt::Eval { e, .. } if matches!(ir.get(*e), Node::Call(..)) => Some(*e),
                _ => None,
            };
            let mut cs: Vec<(CallTarget, sbpf_ir::L)> = Vec::new();
            if let Some(c) = call_of(ir, st) {
                cs.push(c);
            }
            for e in crate::util::stmt_exprs(ir, st) {
                ir.walk(e, &mut |x, n| {
                    if let Node::Call(t, args) = n {
                        if Some(x) != c0e {
                            cs.push((ir.target(t), args));
                        }
                    }
                });
            }
            for (ct, args) in cs {
                if let Some(mc) = memcpy_of(ir, &ct, args, Some(&fl.callee)) {
                    out.push(mc);
                }
            }
            out
        };
        let snake_eq = |nm: &str| -> Option<String> { self.idl.and_then(|i| i.accounts.iter().find(|a| snake1(&a.0) == nm).map(|a| a.0.clone())) };
        let box_of = |v: E, p: Pos| -> Option<(String, Option<String>)> {
            let chain = |e: E, q: Pos| -> IndexSet<String> {
                let mut out: IndexSet<String> = IndexSet::new();
                fn go(ir: &Ir, d: &Defs, fl: &FlowCtx, x: E, w: Pos, dd: u32, out: &mut IndexSet<String>) {
                    if dd > 5 {
                        return;
                    }
                    out.insert(crate::util::jkey_s(ir, x));
                    if let Node::Sel(_, a, b) = ir.get(x) {
                        go(ir, d, fl, a, w, dd + 1, out);
                        go(ir, d, fl, b, w, dd + 1, out);
                    }
                    let Node::Var(id) = ir.get(x) else { return };
                    if let Some((y, q)) = d.def_at(fl, id, w) {
                        if !matches!(ir.get(y), Node::Call(..)) {
                            go(ir, d, fl, y, q, dd + 1, out);
                        }
                    }
                }
                go(ir, &d, fl, e, q, 0, &mut out);
                out
            };
            let zero = crate::util::jkey_s(ir, ir.c(0));
            let vs = chain(v, p);
            for (bj, b2) in tfn.blocks.iter().enumerate() {
                for (ij, s2) in b2.stmts.iter().enumerate() {
                    for (dst, src, n) in copies_in(s2) {
                        if n < 32.0 {
                            continue;
                        }
                        let q = pos_of(bj, ij);
                        if !chain(dst, q).iter().any(|x| vs.contains(x) && *x != zero) {
                            continue;
                        }
                        let z = d.fp_off(src).and_then(|so| d.reaching(fl, slot(so), q, true));
                        let c = z.and_then(|(x, zq)| match ir.get(x) {
                            Node::Call(t, _) => match ir.target(t) {
                                CallTarget::Fn { pc } => Some((pc, zq)),
                                _ => None,
                            },
                            _ => None,
                        });
                        let Some((cpc, zq)) = c else { continue };
                        let call_pc = tfn.blocks.get((zq >> 16) as usize).and_then(|b| b.stmts.get((zq & 0xffff) as usize)).map_or(-1, stmt_pc);
                        let mut ks: Vec<&&super::facts::Check> = named.iter().filter(|x| x.before == Some(cpc) && x.pc.unwrap() > call_pc).collect();
                        ks.sort_by_key(|x| x.pc.unwrap());
                        let Some(k) = ks.first() else { continue };
                        let Some(kn) = &k.named else { continue };
                        return Some((kn.clone(), snake_eq(kn)));
                    }
                }
            }
            None
        };
        let mut info_slots: HashSet<String> = HashSet::new();
        let dv = |a: E| -> E {
            match ir.get(a) {
                Node::Var(id) => d.defs.get(&id).copied().unwrap_or(a),
                _ => a,
            }
        };
        let mut box_reads: IndexMap<Pos, IndexSet<FK>> = IndexMap::new();
        let mut box_reads_v: HashMap<Pos, Vec<f64>> = HashMap::new();
        let mut box_name: HashMap<Pos, String> = HashMap::new();
        let mut box_info: IndexMap<String, f64> = IndexMap::new();
        {
            let mut info_at = |a: E, p: Pos| {
                let hw = dv(a);
                if let Node::Load { size: 8, addr } = ir.get(hw) {
                    let q = dv(addr);
                    let (yy, o) = match ir.get(q) {
                        Node::Bin(BinOp::Add, qa, qb) => match ir.get(qb) {
                            Node::Const(v) => (qa, s_num(v)),
                            _ => (q, 0.0),
                        },
                        _ => (q, 0.0),
                    };
                    if d.fp_off(yy).is_none() && o >= 0.0 && o < 1024.0 {
                        if let Some(z) = follow(yy, p) {
                            if box_reads.entry(z.1).or_default().insert(FK::of(o)) {
                                box_reads_v.entry(z.1).or_default().push(o);
                            }
                            let nm = match ir.get(a) {
                                Node::Var(id) => t.names.get(id as usize).cloned().flatten(),
                                _ => None,
                            };
                            if let Some(nm) = nm {
                                if !nm.is_empty() && names.contains(&nm) {
                                    let v = match box_name.get(&z.1) {
                                        Some(old) if *old != nm => String::new(),
                                        _ => nm,
                                    };
                                    box_name.insert(z.1, v);
                                }
                            }
                        }
                    }
                }
                if let Some(o) = follow(a, p) {
                    if let Some(sl) = slotc.get() {
                        info_slots.insert(format!("{}|{}", o.1, js_num(sl)));
                    }
                }
            };
            let mut flag_read = |x: E, args_call: Option<Vec<E>>, p: Pos| {
                if let Some(args) = args_call {
                    for a0 in args {
                        let a = dv(a0);
                        let Node::Load { size: 8, addr } = ir.get(a) else { continue };
                        let b = dv(addr);
                        match ir.get(b) {
                            Node::Bin(BinOp::Add, ba, bb) if ir.get(bb) == Node::Const(0x18) => info_at(ba, p),
                            Node::Bin(..) => {}
                            _ => info_at(b, p),
                        }
                    }
                    return;
                }
                let Node::Load { size: 1, addr } = ir.get(x) else { return };
                let a = dv(addr);
                if let Node::Bin(BinOp::Add, aa, ab) = ir.get(a) {
                    if let Node::Const(v) = ir.get(ab) {
                        if (0x28..=0x2a).contains(&v) {
                            info_at(aa, p);
                        }
                    }
                }
            };
            for (bi, b) in tfn.blocks.iter().enumerate() {
                for (i, s) in b.stmts.iter().enumerate() {
                    let p = pos_of(bi, i);
                    for e in crate::util::stmt_exprs(ir, s) {
                        let mut xs: Vec<E> = Vec::new();
                        ir.walk(e, &mut |x, _| xs.push(x));
                        for x in xs {
                            let ca = match ir.get(x) {
                                Node::Call(_, args) => Some(ir.to_vec(args)),
                                _ => None,
                            };
                            flag_read(x, ca, p);
                        }
                    }
                    if let Stmt::Copy { n: 32, src, .. } = s {
                        flag_read(*src, Some(vec![*src]), p);
                    }
                }
                if let Term::Br { c, .. } = &b.term {
                    let p = pos_of(bi, b.stmts.len());
                    let mut xs: Vec<E> = Vec::new();
                    ir.walk(*c, &mut |x, _| xs.push(x));
                    for x in xs {
                        let ca = match ir.get(x) {
                            Node::Call(_, args) => Some(ir.to_vec(args)),
                            _ => None,
                        };
                        flag_read(x, ca, p);
                    }
                }
            }
        }
        let mut most = 0usize;
        for (bi, b) in tfn.blocks.iter().enumerate() {
            let mut bl: Vec<Field> = Vec::new();
            let mut word_of: HashMap<FK, Option<f64>> = HashMap::new();
            let mut slot_of: HashMap<FK, Option<String>> = HashMap::new();
            let mut cpc_of: HashMap<FK, i64> = HashMap::new();
            let mut nst = 0usize;
            for (i, s) in b.stmts.iter().enumerate() {
                let Stmt::Store { size: 8, addr, v, .. } = s else { continue };
                let Some(out) = out else { continue };
                let p = pos_of(bi, i);
                let (base, off) = match ir.get(*addr) {
                    Node::Var(_) => (Some(*addr), 0.0),
                    Node::Bin(BinOp::Add, ba, bb) if matches!(ir.get(ba), Node::Var(_)) => match ir.get(bb) {
                        Node::Const(c) => (Some(ba), c as f64),
                        _ => (None, -1.0),
                    },
                    _ => (None, -1.0),
                };
                if off < 0.0 || off > 4096.0 || bl.iter().any(|x| x.off == off) {
                    continue;
                }
                let base_id = match base.map(|x| ir.get(x)) {
                    Some(Node::Var(id)) => id,
                    _ => continue,
                };
                let ob = if base_id == out { Some((base.unwrap(), p)) } else { follow(base.unwrap(), p) };
                match ob.map(|x| ir.get(x.0)) {
                    Some(Node::Var(id)) if id == out => {}
                    _ => continue,
                }
                nst += 1;
                let y = follow(*v, p);
                slot_of.insert(FK::of(off), match (y, slotc.get()) {
                    (Some(y), Some(sl)) => Some(format!("{}|{}", y.1, js_num(sl))),
                    _ => None,
                });
                let y_call = y.is_some_and(|y| matches!(ir.get(y.0), Node::Call(..)));
                let bx = if y.is_some() && !y_call { box_of(*v, p) } else { None };
                let bn = bx.as_ref().map(|b| b.0.clone()).or_else(|| {
                    lay.iter()
                        .find(|x| x.off == off && matches!(x.t, FT::Ref(_)) && x.doc.as_deref().unwrap_or("").starts_with("Box<Account<"))
                        .map(|x| x.name.clone())
                });
                if let Some(bn) = &bn {
                    if let Some(y) = y {
                        if let Some(bi2) = box_reads_v.get(&y.1) {
                            if bi2.len() == 1 {
                                box_info.insert(bn.clone(), bi2[0]);
                            }
                        }
                    }
                }
                let hn = if bn.is_none() { y.and_then(|y| box_name.get(&y.1).cloned()).filter(|x| !x.is_empty()) } else { None };
                let hi = hn.as_ref().and_then(|_| box_reads_v.get(&y.unwrap().1));
                if let (Some(hn), Some(hi)) = (&hn, hi) {
                    if hi.len() == 1 && !bl.iter().any(|x| &x.name == hn) {
                        box_info.insert(hn.clone(), hi[0]);
                        word_of.insert(FK::of(off), Some(0.0));
                        bl.push(mk_field(hn.clone(), off, "Box", "the analysis: a boxed account object try_accounts stores (its &AccountInfo read through it by the checks on the account)".into()));
                        continue;
                    }
                }
                if let Some((bxn, bxt)) = &bx {
                    if !bl.iter().any(|x| &x.name == bxn) {
                        word_of.insert(FK::of(off), Some(0.0));
                        bl.push(mk_field(
                            bxn.clone(),
                            off,
                            bxt.as_deref().unwrap_or("Box"),
                            format!(
                                "the analysis: a boxed account object try_accounts stores (a heap copy of its try call's out object){}",
                                bxt.as_ref().map_or(String::new(), |t| format!("; account of type {t}"))
                            ),
                        ));
                    }
                    continue;
                }
                let y_fn = y.and_then(|y| match ir.get(y.0) {
                    Node::Call(t, args) => match ir.target(t) {
                        CallTarget::Fn { pc } => Some((pc, args, y.1)),
                        _ => None,
                    },
                    _ => None,
                });
                let Some((cpc, cargs, yp)) = y_fn else {
                    let mut vn = match ir.get(*v) {
                        Node::Var(id) => t.names.get(id as usize).cloned().flatten().filter(|x| !x.is_empty()),
                        _ => None,
                    };
                    let from_slice = |e: E, q: Pos| -> bool {
                        let Node::Load { size: 8, addr } = ir.get(e) else { return false };
                        let is_s = |x: E| matches!(ir.get(x), Node::Var(id) if Some(id) == slice_pv || copies(id));
                        let z = follow(addr, q);
                        is_s(addr) || z.is_some_and(|z| is_s(z.0))
                    };
                    let mut lp: Option<Pos> = None;
                    if let Some(y) = y {
                        if from_slice(y.0, y.1) {
                            lp = Some(y.1);
                        } else if let Node::Var(id) = ir.get(y.0) {
                            for (bi2, b2) in tfn.blocks.iter().enumerate() {
                                for (i2, s2) in b2.stmts.iter().enumerate() {
                                    if lp.is_none() {
                                        if let Stmt::Set { dst, e, .. } = s2 {
                                            if *dst as i64 == id as i64 && from_slice(*e, pos_of(bi2, i2)) {
                                                lp = Some(pos_of(bi2, i2));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if !vn.as_ref().is_some_and(|x| names.contains(x)) {
                        if let Some(lp) = lp {
                            let lb = (lp >> 16) as usize;
                            let mut cs: Vec<&super::facts::Check> = tf
                                .checks
                                .iter()
                                .filter(|k| k.named.is_some() && k.kinds.contains(&"count") && k.pc.is_some() && db_of(k).is_some_and(|db| dominates(&g, db, lb)))
                                .collect();
                            cs.sort_by(|x, w| g.rpo[db_of(w).unwrap()].cmp(&g.rpo[db_of(x).unwrap()]));
                            vn = cs.first().and_then(|k| k.named.clone());
                            if vn.is_none() {
                                let after: Vec<&super::facts::Check> = tf
                                    .checks
                                    .iter()
                                    .filter(|k| {
                                        k.named.is_some()
                                            && k.kinds.contains(&"count")
                                            && k.pc.is_some()
                                            && db_of(k).is_some_and(|db| dominates(&g, lb, db) && g.rpo[db] - g.rpo[lb] <= 2)
                                    })
                                    .collect();
                                if after.len() == 1 {
                                    vn = after[0].named.clone();
                                }
                            }
                        }
                    }
                    if let Some(vn) = vn {
                        if !vn.is_empty() && names.contains(&vn) && !bl.iter().any(|x| x.name == vn) {
                            word_of.insert(FK::of(off), Some(0.0));
                            bl.push(mk_field(vn, off, "AccountInfo", "the analysis: stored by try_accounts, taken from the accounts slice".into()));
                        }
                    }
                    continue;
                };
                if off == 0.0 {
                    continue;
                }
                let a0 = fp_of_e(if cargs.len > 0 { Some(ir.at(cargs, 0)) } else { None });
                let word = match (slotc.get(), a0) {
                    (Some(sl), Some(a0)) => Some(sl - a0),
                    _ => None,
                };
                let call_pc = tfn.blocks.get((yp >> 16) as usize).and_then(|b| b.stmts.get((yp & 0xffff) as usize)).map_or(-1, stmt_pc);
                let cb = (yp >> 16) as usize;
                let cand: Vec<&&super::facts::Check> = named
                    .iter()
                    .filter(|k| (k.before == Some(cpc) && k.pc.unwrap() > call_pc) || (k.before == Some(cpc) && db_of(k).is_some_and(|db| db != cb && dominates(&g, cb, db))))
                    .collect();
                let flow: Vec<&&super::facts::Check> = cand.iter().copied().filter(|k| db_of(k).is_some_and(|db| dominates(&g, cb, db))).collect();
                let c = flow.iter().copied().find(|k| flow.iter().all(|x| dominates(&g, db_of(k).unwrap(), db_of(x).unwrap()))).or_else(|| {
                    let mut v: Vec<&&super::facts::Check> = cand.iter().copied().filter(|k| k.pc.unwrap() > call_pc).collect();
                    v.sort_by_key(|k| k.pc.unwrap());
                    v.first().copied()
                });
                let cn = c.and_then(|c| c.named.clone());
                let ty = cn.as_deref().and_then(snake_eq);
                if let Some(cn) = cn {
                    word_of.insert(FK::of(off), word);
                    cpc_of.insert(FK::of(off), cpc);
                    bl.push(mk_field(
                        cn,
                        off,
                        "AccountInfo",
                        format!("the analysis: stored by try_accounts after the call its check names{}", ty.map_or(String::new(), |t| format!("; account of type {t}"))),
                    ));
                }
            }
            let is_info_w = |x: &Field| slot_of.get(&FK::of(x.off)).cloned().flatten().is_some_and(|z| info_slots.contains(&z));
            let mut by_callee: IndexMap<i64, Option<f64>> = IndexMap::new();
            for (xi, x) in bl.iter().enumerate() {
                let same: Vec<usize> = (0..bl.len()).filter(|&j| bl[j].name == x.name).collect();
                let fi: Vec<usize> = same.iter().copied().filter(|&j| is_info_w(&bl[j])).collect();
                let c = cpc_of.get(&FK::of(x.off)).copied();
                let w = word_of.get(&FK::of(x.off)).copied().flatten();
                if same.len() < 2 || fi.len() != 1 || fi[0] != xi || c.is_none() || w.is_none() {
                    continue;
                }
                let c = c.unwrap();
                let nv = match by_callee.get(&c) {
                    Some(old) if *old != w => None,
                    _ => w,
                };
                by_callee.insert(c, nv);
            }
            let callee_w = |x: &Field| -> Option<f64> { cpc_of.get(&FK::of(x.off)).and_then(|c| by_callee.get(c).copied().flatten()) };
            let wo = |x: &Field| word_of.get(&FK::of(x.off)).copied().flatten();
            let one: Vec<Field> = bl
                .iter()
                .enumerate()
                .filter(|(xi, x)| {
                    let same: Vec<usize> = (0..bl.len()).filter(|&j| bl[j].name == x.name).collect();
                    let fi: Vec<usize> = same.iter().copied().filter(|&j| is_info_w(&bl[j])).collect();
                    if same.len() == 1 {
                        return true;
                    }
                    if fi.len() == 1 {
                        return fi[0] == *xi;
                    }
                    let cw = same.iter().map(|&j| callee_w(&bl[j])).find(|w| w.is_some()).flatten();
                    if let Some(cw) = cw {
                        if same.iter().any(|&j| wo(&bl[j]) == Some(cw)) {
                            return wo(x) == Some(cw);
                        }
                    }
                    wo(x) == Some(0.0) && same.iter().all(|&j| j == *xi || wo(&bl[j]).is_some_and(|w| w != 0.0 && !w.is_nan()))
                })
                .map(|(_, x)| x.clone())
                .collect();
            if one.len() > layout.len() || (!one.is_empty() && one.len() == layout.len() && nst > most) {
                layout = one;
                most = nst;
            }
        }
        let size = |x: &Field| match &x.t {
            FT::Embed(ty) => self.views.map.get(ty).and_then(|v| v.size).unwrap_or(8.0),
            _ => 8.0,
        };
        let mut all = layout.clone();
        for x in lay {
            if !layout.iter().any(|y| x.name == y.name || (x.off < y.off + 8.0 && y.off < x.off + size(x))) {
                all.push(x.clone());
            }
        }
        if !all.is_empty() || known {
            Some(TryInfo {
                try_pc: tpc,
                layout: all,
                box_info: if box_info.is_empty() { None } else { Some(box_info) },
                words: None,
                ptrs: None,
                seqs: None,
            })
        } else {
            None
        }
    }

    pub fn slice_events(&self, h: i64, tpc0: Option<i64>) -> Option<SliceEv> {
        let fl = &self.fl;
        let names: Vec<String> = self.instructions.iter().find(|x| x.pc == h)?.accounts.as_ref()?.iter().map(|a| snake2(a.split(' ').next().unwrap_or(""))).collect();
        if names.is_empty() || names.iter().any(|n| n.contains('.')) {
            return None;
        }
        let hf = self.fo(h)?.f;
        let hir = fir(hf);
        let dh = fl.defs_of(hf, true);
        let ap = param_var(hf, 3);
        let mut tpc = tpc0;
        if tpc.is_none() {
            if let Some(ap) = ap {
                for (bi, b) in hf.blocks.iter().enumerate() {
                    for (i, s) in b.stmts.iter().enumerate() {
                        if tpc.is_some() {
                            continue;
                        }
                        let Some((CallTarget::Fn { pc }, args)) = call_of(hir, s) else { continue };
                        let hit = hir.items(args).any(|a| match dh.fp_off(a).and_then(|z| dh.reaching(fl, slot(z), pos_of(bi, i), false)) {
                            Some((y, _)) => hir.get(y) == Node::Var(ap),
                            None => false,
                        });
                        if hit {
                            tpc = Some(pc);
                        }
                    }
                }
            }
        }
        let tpc = tpc?;
        let t = self.fo(tpc)?;
        let tf = t.f;
        let ir = fir(tf);
        let td = fl.defs_of(tf, true);
        let g = self.cfg(tpc);
        let sv = param_var(tf, 3);
        fn is_s(ir: &Ir, td: &Defs, fl: &FlowCtx, sv: Option<u32>, e: E, d: u32) -> bool {
            let Node::Var(id) = ir.get(e) else { return false };
            if d > 4 {
                return false;
            }
            if Some(id) == sv {
                return true;
            }
            let Some(&x) = td.defs.get(&id) else { return false };
            if matches!(ir.get(x), Node::Var(_)) {
                return is_s(ir, td, fl, sv, x, d + 1);
            }
            let z = match ir.get(x) {
                Node::Load { size: 8, addr } => td.fp_off(addr),
                _ => None,
            };
            match z.and_then(|z| td.reaching(fl, slot(z), td.def_pos[&id], false)) {
                Some((y, _)) => is_s(ir, td, fl, sv, y, d + 1),
                None => false,
            }
        }
        let iss = |e: E| is_s(ir, &td, fl, sv, e, 0);
        let err_pc: HashSet<i64> = self.facts.borrow().get(&tpc).map_or(HashSet::new(), |f| f.calls.iter().filter(|c| c.err_path && c.pc.is_some()).map(|c| c.pc.unwrap()).collect());
        let mut all: Vec<SEv> = Vec::new();
        for (bi, b) in tf.blocks.iter().enumerate() {
            if g.rpo[bi] < 0 {
                continue;
            }
            for (i, s) in b.stmts.iter().enumerate() {
                let c = call_of(ir, s);
                if let Some((CallTarget::Fn { .. }, args)) = &c {
                    if ir.items(*args).any(iss) && !err_pc.contains(&stmt_pc(s)) {
                        all.push(SEv { b: bi, i, out: if args.len > 0 { td.fp_off(ir.at(*args, 0)) } else { None }, v: None, adv: None, idx: -1.0 });
                        continue;
                    }
                }
                if let Stmt::Set { dst, e, .. } = s {
                    if let Node::Load { size: 8, addr } = ir.get(*e) {
                        if iss(addr) {
                            all.push(SEv { b: bi, i, out: None, v: Some(*dst as u32), adv: None, idx: -1.0 });
                            continue;
                        }
                    }
                }
                if let Stmt::Store { size: 8, addr, v, .. } = s {
                    if iss(*addr) {
                        if let Node::Bin(BinOp::Add, va, vb) = ir.get(*v) {
                            if let (Node::Var(vid), Node::Const(k)) = (ir.get(va), ir.get(vb)) {
                                if k % 0x30 == 0 {
                                    all.push(SEv { b: bi, i, out: None, v: None, adv: Some((vid, (k / 0x30) as f64)), idx: -1.0 });
                                }
                            }
                        }
                    }
                }
            }
        }
        all.sort_by(|x, y| (g.rpo[x.b] - g.rpo[y.b]).cmp(&0).then(x.i.cmp(&y.i)));
        for k in 1..all.len() {
            let (p, x) = (&all[k - 1], &all[k]);
            let ok = if p.b == x.b { p.i < x.i } else { dominates(&g, p.b, x.b) };
            if !ok {
                return None;
            }
        }
        let mut n = 0.0;
        let mut at: HashMap<u32, f64> = HashMap::new();
        for x in all.iter_mut() {
            if let Some((v, k)) = x.adv {
                let base = at.get(&v)?;
                n = base + k;
            } else {
                x.idx = n;
                if let Some(v) = x.v {
                    at.insert(v, n);
                } else {
                    n += 1.0;
                }
            }
        }
        if all.last().is_some_and(|x| x.v.is_some()) {
            n += 1.0;
        }
        let evs: Vec<SEv> = all.into_iter().filter(|x| x.adv.is_none()).collect();
        let nl = names.len() as f64;
        if n != nl || evs.iter().any(|x| x.idx >= nl) {
            return None;
        }
        let mut ptrs: IndexMap<u32, String> = IndexMap::new();
        let mut seqs: IndexMap<u32, Vec<String>> = IndexMap::new();
        for x in &evs {
            if let Some(v) = x.v {
                if !td.multi.contains(&v) {
                    let i = x.idx as usize;
                    ptrs.insert(v, names[i].clone());
                    seqs.insert(v, names[i..].to_vec());
                }
            }
        }
        for v in &tf.vars {
            let Some(Some(nm)) = t.names.get(v.id as usize) else { continue };
            if !nm.is_empty() && names.contains(nm) && !td.multi.contains(&v.id) && td.defs.contains_key(&v.id) && !ptrs.contains_key(&v.id) && t.text.contains(&format!("const {nm}: AccountInfo = ")) {
                ptrs.insert(v.id, nm.clone());
            }
        }
        Some(SliceEv { names, t: tpc, evs, ptrs, seqs, tpc })
    }

    fn by_value_try(&self, h: i64) -> Option<TryInfo> {
        let se = self.slice_events(h, None)?;
        let fl = &self.fl;
        let t = self.fo(se.t)?;
        let tf = t.f;
        let ir = fir(tf);
        let td = fl.defs_of(tf, true);
        let out = param_var(tf, 1);
        let evs = &se.evs;
        let frame_of = |e: E, p: Pos| -> Option<f64> {
            if let Some(z) = td.fp_off(e) {
                return Some(z);
            }
            let w = match ir.get(e) {
                Node::Load { size: 8, addr } => td.fp_off(addr),
                _ => None,
            }?;
            let (y, _) = td.reaching(fl, slot(w), p, false)?;
            td.fp_off(y)
        };
        let ptr_ev = |e: E, p: Pos| -> Option<f64> {
            let (mut e, mut p) = (e, p);
            for _ in 0..8 {
                if let Node::Var(id) = ir.get(e) {
                    if let Some(k) = evs.iter().position(|x| x.v == Some(id)) {
                        if !td.multi.contains(&id) {
                            return Some(evs[k].idx);
                        }
                    }
                    (e, p) = td.def_at(fl, id, p)?;
                    continue;
                }
                let z = match ir.get(e) {
                    Node::Load { size: 8, addr } => td.fp_off(addr),
                    _ => None,
                };
                (e, p) = td.reaching(fl, slot(z?), p, false)?;
            }
            None
        };
        let trace = |z0: f64, p0: Pos| -> Option<(f64, f64)> {
            let (mut z, mut p) = (z0, p0);
            for _ in 0..8 {
                let (mut e, mut q) = td.reaching(fl, slot(z), p, true)?;
                let mut j = 0;
                while j < 4 {
                    let Node::Var(id) = ir.get(e) else { break };
                    (e, q) = td.def_at(fl, id, q)?;
                    j += 1;
                }
                if let Node::Call(_, args) = ir.get(e) {
                    if let Some(k) = evs.iter().position(|x| pos_of(x.b, x.i) == q && x.out.is_some_and(|o| z >= o && z < o + 48.0)) {
                        return Some((evs[k].idx, z - evs[k].out.unwrap()));
                    }
                    let aa = if args.len == 2 { td.fp_off(ir.at(args, 0)) } else { None };
                    let k2 = match aa {
                        Some(aa) if z >= aa && z < aa + 48.0 => ptr_ev(ir.at(args, 1), q),
                        _ => None,
                    };
                    return k2.map(|k| (k, z - aa.unwrap()));
                }
                let w = match ir.get(e) {
                    Node::Load { size: 8, addr } => td.fp_off(addr),
                    _ => None,
                };
                let Some(w) = w else {
                    let Node::Load { size: 8, addr } = ir.get(e) else { return None };
                    let (b0, o0) = match ir.get(addr) {
                        Node::Bin(BinOp::Add, ba, bb) => match ir.get(bb) {
                            Node::Const(v) => (ba, s_num(v)),
                            _ => (addr, 0.0),
                        },
                        _ => (addr, 0.0),
                    };
                    if let Some(fz) = frame_of(b0, q) {
                        z = fz + o0;
                        p = q;
                        continue;
                    }
                    let k = ptr_ev(b0, q);
                    return match k {
                        Some(k) if o0 >= 0.0 && o0 < 48.0 => Some((k, o0)),
                        _ => None,
                    };
                };
                z = w;
                p = q;
            }
            None
        };
        let off_in = |e: E| -> Option<f64> {
            let out = out?;
            match ir.get(e) {
                Node::Var(id) if id == out => Some(0.0),
                Node::Bin(BinOp::Add, a, b) if ir.get(a) == Node::Var(out) => match ir.get(b) {
                    Node::Const(v) => Some(s_num(v)),
                    _ => None,
                },
                _ => None,
            }
        };
        let mut best: Option<IndexMap<FK, (f64, f64, f64)>> = None;
        let mut most = 0.0;
        for (bi, b) in tf.blocks.iter().enumerate() {
            let mut nw = 0.0;
            let mut m: IndexMap<FK, (f64, f64, f64)> = IndexMap::new();
            for (i, s) in b.stmts.iter().enumerate() {
                let p = pos_of(bi, i);
                if let Stmt::Store { size: 8, addr, v, .. } = s {
                    let Some(o) = off_in(*addr) else { continue };
                    nw += 1.0;
                    let vz = match ir.get(*v) {
                        Node::Load { size: 8, addr } => td.fp_off(addr),
                        _ => None,
                    };
                    if let Some(x) = vz.and_then(|vz| trace(vz, p)) {
                        m.insert(FK::of(o), (o, x.0, x.1));
                    }
                    continue;
                }
                let mc = match s {
                    Stmt::Copy { dst, src, n, .. } => Some((*dst, *src, *n as f64)),
                    _ => call_of(ir, s).and_then(|(ct, args)| memcpy_of(ir, &ct, args, Some(&fl.callee))),
                };
                let Some(mc) = mc else { continue };
                let Some(o) = off_in(mc.0) else { continue };
                let src = frame_of(mc.1, p);
                nw += ((mc.2 as i64) >> 3) as f64;
                if let Some(src) = src {
                    let mut j = 0.0;
                    while j + 8.0 <= mc.2 {
                        if let Some(x) = trace(src + j, p) {
                            m.insert(FK::of(o + j), (o + j, x.0, x.1));
                        }
                        j += 8.0;
                    }
                }
            }
            if nw > most {
                most = nw;
                best = Some(m);
            }
        }
        let best = best?;
        let legacy = fl.callee.legacy;
        let key_w = if legacy { 8.0 } else { 0.0 };
        let data_w = if legacy { 24.0 } else { 16.0 };
        let mut infos: Vec<f64> = Vec::new();
        for (_, k, w) in best.values() {
            if *w == data_w && best.values().any(|(_, k2, w2)| k2 == k && *w2 == key_w) && !infos.contains(k) {
                infos.push(*k);
            }
        }
        let mut words: IndexMap<FK, (f64, String, f64)> = IndexMap::new();
        for (o, k, w) in best.values() {
            if infos.contains(k) {
                words.insert(FK::of(*o), (*o, se.names[*k as usize].clone(), *w));
            }
        }
        if words.is_empty() && se.ptrs.is_empty() {
            return None;
        }
        Some(TryInfo {
            try_pc: se.tpc,
            layout: vec![],
            box_info: None,
            words: Some(words),
            ptrs: Some(se.ptrs),
            seqs: Some(se.seqs),
        })
    }

    /// The Anchor account evaluator of a handler (anchorEval)
    pub fn anchor_eval(&self, h: i64) -> Rc<AnchorEval<'a>> {
        if let Some(a) = self.memo.anchor.borrow().get(&h) {
            return a.clone();
        }
        let objs = self.memo.objs.borrow().get(&h).cloned().unwrap_or_default();
        let a = self.anchor_eval0(h, objs, self.exit_fns());
        self.memo.anchor.borrow_mut().insert(h, a.clone());
        a
    }

    fn anchor_eval0(&self, h: i64, objs: Rc<Vec<FrameObj>>, exits: Rc<IndexMap<i64, ExitFn>>) -> Rc<AnchorEval<'a>> {
        let hf = self.fo(h).unwrap().f;
        let d = self.fl.defs_of(hf, true);
        let ti = self.try_info(h);
        let try_pc = ti.as_ref().map(|t| t.try_pc);
        let disc_type: HashMap<u64, String> = self.idl.map_or(HashMap::new(), |i| i.accounts.iter().map(|(n, dd)| (*dd, n.clone())).collect());
        Rc::new_cyclic(|me| AnchorEval {
            me: me.clone(),
            an: self as *const An<'a>,
            h,
            d,
            ti,
            try_pc,
            disc_type,
            accounts_param: param_var(hf, 3),
            objs,
            exits,
        })
    }

    /// positions of the statements calleeWrites looks at
    fn visit_pos(&self, f: &'a Func) -> Rc<Vec<Pos>> {
        if let Some(r) = self.memo.visit.borrow().get(&f.pc) {
            return r.clone();
        }
        let ir = fir(f);
        let fp = param_var(f, 10).map_or(-1, |v| v as i64);
        let mut r: Vec<Pos> = Vec::new();
        for (bi, b) in f.blocks.iter().enumerate() {
            for (i, s) in b.stmts.iter().enumerate() {
                let hit = match s {
                    Stmt::Store { addr, .. } | Stmt::Stores { addr, .. } => off_of(ir, *addr, fp).is_none(),
                    Stmt::Copy { dst, .. } => off_of(ir, *dst, fp).is_none(),
                    _ => false,
                } || matches!(call_of(ir, s), Some((CallTarget::Fn { .. }, _)));
                if hit {
                    r.push(pos_of(bi, i));
                }
            }
        }
        let r = Rc::new(r);
        self.memo.visit.borrow_mut().insert(f.pc, r.clone());
        r
    }

    /// The statements (of visitPos) through which an AnchorEval context of a callee may reach something
    /// derived from its roots (rootKeep / derivedFrom)
    fn root_keep(&self, f: &'a Func, d: &Defs<'a>, roots: &IndexMap<u32, HVal<'a>>) -> Rc<Vec<Pos>> {
        let mut ks: Vec<u32> = roots.keys().copied().collect();
        ks.sort();
        let k = (f.pc, ks.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(","));
        if let Some(r) = self.memo.keep.borrow().get(&k) {
            return r.clone();
        }
        let ir = fir(f);
        let fp = d.fp;
        let seed = |v: u32| roots.contains_key(&v) && v as i64 != fp;
        let mut dep_var: HashSet<u32> = HashSet::new();
        let mut ranges: Vec<(f64, f64)> = Vec::new();
        let mut set_defs: HashMap<u32, Vec<E>> = HashMap::new();
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Set { dst, e, .. } = s {
                    if *dst >= 0 {
                        set_defs.entry(*dst as u32).or_default().push(*e);
                    }
                }
            }
        }
        #[derive(Clone, Copy, PartialEq)]
        enum Fr {
            N(f64),
            No,
            Any,
        }
        fn fr(ir: &Ir, d: &Defs, set_defs: &HashMap<u32, Vec<E>>, e: E, dd: u32) -> Fr {
            if let Some(o) = d.fp_off(e) {
                return Fr::N(o);
            }
            if dd > 12 {
                return Fr::Any;
            }
            match ir.get(e) {
                Node::Var(id) => {
                    if let Some(&x) = d.defs.get(&id) {
                        return if matches!(ir.get(x), Node::Call(..)) { Fr::No } else { fr(ir, d, set_defs, x, dd + 1) };
                    }
                    if !d.multi.contains(&id) {
                        return Fr::No;
                    }
                    let mut r: Option<Fr> = None;
                    for &y in set_defs.get(&id).map_or(&[][..], |v| &v[..]) {
                        let q = if matches!(ir.get(y), Node::Call(..)) { Fr::No } else { fr(ir, d, set_defs, y, dd + 1) };
                        match r {
                            None => r = Some(q),
                            Some(rr) if rr != q => return Fr::Any,
                            _ => {}
                        }
                    }
                    r.unwrap_or(Fr::No)
                }
                Node::Ext { a, .. } => fr(ir, d, set_defs, a, dd + 1),
                Node::Bin(op, a, b) => {
                    let Node::Const(v) = ir.get(b) else { return Fr::No };
                    if op != BinOp::Add {
                        return Fr::No;
                    }
                    match fr(ir, d, set_defs, a, dd + 1) {
                        Fr::N(x) => Fr::N(x + s_num(v)),
                        o => o,
                    }
                }
                Node::Load { size, .. } => {
                    if size == 8 {
                        Fr::Any
                    } else {
                        Fr::No
                    }
                }
                _ => Fr::No,
            }
        }
        let frame_read = |ranges: &Vec<(f64, f64)>, addr: E, n: f64| -> bool {
            if ranges.is_empty() {
                return false;
            }
            match fr(ir, d, &set_defs, addr, 0) {
                Fr::No => false,
                Fr::Any => true,
                Fr::N(z) => ranges.iter().any(|&(a, b)| z < b && a < z + n),
            }
        };
        fn dep(ir: &Ir, e: E, dv: &HashSet<u32>, seed: &dyn Fn(u32) -> bool, fread: &dyn Fn(E, f64) -> bool) -> bool {
            match ir.get(e) {
                Node::Var(id) => dv.contains(&id) || seed(id),
                Node::Ext { a, .. } => dep(ir, a, dv, seed, fread),
                Node::Bin(BinOp::Add, a, b) => matches!(ir.get(b), Node::Const(_)) && dep(ir, a, dv, seed, fread),
                Node::Load { size: 8, addr } => dep(ir, addr, dv, seed, fread) || fread(addr, 8.0),
                _ => false,
            }
        }
        let mut changed = true;
        while changed {
            changed = false;
            for b in &f.blocks {
                for s in &b.stmts {
                    let rg = ranges.clone();
                    let fread = |a: E, n: f64| frame_read(&rg, a, n);
                    let depf = |e: E| dep(ir, e, &dep_var, &seed, &fread);
                    let mut mark = |z: f64, n: f64, ranges: &mut Vec<(f64, f64)>, changed: &mut bool| {
                        if !ranges.iter().any(|&(a, b)| a <= z && z + n <= b) {
                            ranges.push((z, z + n));
                            *changed = true;
                        }
                    };
                    let mut add_var: Option<u32> = None;
                    if let Stmt::Set { dst, e, .. } = s {
                        if *dst >= 0 && !dep_var.contains(&(*dst as u32)) && !seed(*dst as u32) && !matches!(ir.get(*e), Node::Call(..)) && depf(*e) {
                            add_var = Some(*dst as u32);
                        }
                    }
                    let mut marks: Vec<(f64, f64)> = Vec::new();
                    let z = match s {
                        Stmt::Store { addr, .. } | Stmt::Stores { addr, .. } => d.fp_off(*addr),
                        Stmt::Copy { dst, .. } => d.fp_off(*dst),
                        _ => None,
                    };
                    if let Some(z) = z {
                        match s {
                            Stmt::Store { v, size, .. } if depf(*v) => marks.push((z, *size as f64)),
                            Stmt::Stores { vals, size, .. } if ir.items(*vals).any(depf) => marks.push((z, *size as f64 * vals.len as f64)),
                            Stmt::Copy { src, n, .. } if depf(*src) || frame_read(&rg, *src, *n as f64) => marks.push((z, *n as f64)),
                            _ => {}
                        }
                    }
                    if let Some((_, args)) = call_of(ir, s) {
                        let av = ir.to_vec(args);
                        let ptr_dep = |e: E| depf(e) || (!rg.is_empty() && fr(ir, d, &set_defs, e, 0) != Fr::No);
                        if av.iter().any(|&a| d.fp_off(a).is_some()) && av.iter().any(|&a| ptr_dep(a)) {
                            let n = match av.get(2).map(|&x| ir.get(x)) {
                                Some(Node::Const(v)) if av.len() >= 3 && v <= 0x2000 => (v as f64).max(128.0),
                                _ => 128.0,
                            };
                            for &a in &av {
                                if let Some(q) = d.fp_off(a) {
                                    marks.push((q, n));
                                }
                            }
                        }
                    }
                    if let Some(v) = add_var {
                        dep_var.insert(v);
                        changed = true;
                    }
                    for (z, n) in marks {
                        mark(z, n, &mut ranges, &mut changed);
                    }
                }
            }
        }
        let fread = |a: E, n: f64| frame_read(&ranges, a, n);
        let depf = |e: E| dep(ir, e, &dep_var, &seed, &fread);
        let ptr_dep = |e: E| depf(e) || (!ranges.is_empty() && fr(ir, d, &set_defs, e, 0) != Fr::No);
        let mut keep: Vec<Pos> = Vec::new();
        for &q in self.visit_pos(f).iter() {
            let s = &f.blocks[(q >> 16) as usize].stmts[(q & 0xffff) as usize];
            let hit = match call_of(ir, s) {
                Some((_, args)) => ir.items(args).any(ptr_dep),
                None => match s {
                    Stmt::Copy { dst, .. } => depf(*dst),
                    Stmt::Store { addr, .. } | Stmt::Stores { addr, .. } => depf(*addr),
                    _ => false,
                },
            };
            if hit {
                keep.push(q);
            }
        }
        let keep = Rc::new(keep);
        self.memo.keep.borrow_mut().insert(k, keep.clone());
        keep
    }

    /// AccountInfo::try_borrow_data: by name, else by behavior
    pub fn is_borrow_data(&self, pc: i64) -> bool {
        let nm = self.pname(pc);
        if nm.contains("try_borrow_data") {
            return !nm.contains("_mut");
        }
        if let Some(&v) = self.memo.borrow.borrow().get(&pc) {
            return v;
        }
        let v = {
            let facts = self.facts.borrow();
            let t = match facts.get(&pc) {
                Some(ff) if ff.lines.len() < 40 => ff.lines.join("\n"),
                _ => String::new(),
            };
            t.contains("AccountBorrowFailed") && crate::jre!(r"\.borrow = \w+ \+ 1\b").is_match(&t)
        };
        self.memo.borrow.borrow_mut().insert(pc, v);
        v
    }

    /// Writes the handler's logic makes in the functions it calls with pointers into its frame
    fn callee_writes(&self, h: i64, objs: Rc<Vec<FrameObj>>, exits: &Rc<IndexMap<i64, ExitFn>>) {
        let ae = self.anchor_eval0(h, objs.clone(), exits.clone());
        self.memo.anchor.borrow_mut().insert(h, ae.clone());
        let try_pc = self.try_info(h).map(|t| t.try_pc);
        let hname = self.fo(h).unwrap().name.clone();
        let mut done: HashSet<String> = HashSet::new();
        let mut seen: HashMap<String, i32> = HashMap::new();
        let mut uniq = 0u64;
        #[allow(clippy::too_many_arguments)]
        fn visit<'a>(
            an: &An<'a>,
            ae: &Rc<AnchorEval<'a>>,
            h: i64,
            hname: &str,
            objs: &[FrameObj],
            exits: &IndexMap<i64, ExitFn>,
            try_pc: Option<i64>,
            done: &mut HashSet<String>,
            seen: &mut HashMap<String, i32>,
            uniq: &mut u64,
            c: i64,
            roots: IndexMap<u32, HVal<'a>>,
            depth: i32,
        ) {
            if !an.facts.borrow().contains_key(&c) || exits.contains_key(&c) || try_pc == Some(c) {
                return;
            }
            let hkey = |v: &HVal<'a>, uniq: &mut u64| -> String {
                match v {
                    HVal::Fr { ctx, z, at } => {
                        let k = match ctx.key.borrow().clone() {
                            Some(k) => k,
                            None => {
                                let s = format!("#{uniq}");
                                *uniq += 1;
                                s
                            }
                        };
                        format!("fr({k}){}@{at}", js_num(*z))
                    }
                    HVal::A(x) => {
                        let x = x.borrow();
                        format!("{}:{}:{}:{}:{}", x.k.as_str(), x.acct, x.ty.as_deref().unwrap_or(""), js_num(x.off), if x.guess == Some(true) { 1 } else { 0 })
                    }
                }
            };
            let parts: Vec<String> = roots.iter().map(|(k, v)| format!("{k}={}", hkey(v, uniq))).collect();
            let vk = format!("{c}|{}", parts.join(","));
            if seen.get(&vk).copied().unwrap_or(-1) >= depth {
                return;
            }
            seen.insert(vk.clone(), depth);
            let cf = an.fo(c).unwrap().f;
            let x = ae.ctx_of(c, roots.clone(), 2);
            *x.key.borrow_mut() = Some(vk);
            let keep = if c == h { None } else { Some(an.root_keep(cf, &x.d, &roots)) };
            if keep.as_ref().is_some_and(|k| k.is_empty()) {
                return;
            }
            let ir = fir(cf);
            let has_disc = an.facts.borrow()[&c].checks.iter().any(|k| k.kinds.contains(&"discriminator"));
            let positions: Rc<Vec<Pos>> = match &keep {
                Some(k) => k.clone(),
                None => an.visit_pos(cf),
            };
            for &q in positions.iter() {
                let (bi, i) = ((q >> 16) as usize, (q & 0xffff) as usize);
                let s = &cf.blocks[bi].stmts[i];
                let p = q;
                let cc = call_of(ir, s);
                if let Some((CallTarget::Fn { pc }, args)) = &cc {
                    if an.is_borrow_data(*pc) && !has_disc {
                        for xa in ir.items(*args) {
                            let mut v = x.ev(xa, p, 0);
                            if matches!(v, Some(HVal::Fr { .. })) {
                                let w = x.ev(ir.load(8, ir.bin(BinOp::Add, xa, ir.c(0x10))), p, 0);
                                v = match w {
                                    Some(HVal::A(wa)) if wa.borrow().k == HK::Drc => {
                                        let mut c2 = wa.borrow().clone();
                                        c2.k = HK::Info;
                                        Some(HVal::a(c2))
                                    }
                                    _ => None,
                                };
                            }
                            if let Some(HVal::A(va)) = &v {
                                let vb = va.borrow();
                                if vb.k == HK::Info && vb.off == 0.0 && vb.guess != Some(true) {
                                    an.memo.data_reads.borrow_mut().entry(h).or_default().insert(vb.acct.clone());
                                }
                            }
                        }
                    }
                    if depth > 0 && !exits.contains_key(pc) {
                        if let Some(g) = an.fo(*pc) {
                            let gf = g.f;
                            let gpc = g.pc;
                            let mut rs: IndexMap<u32, HVal<'a>> = IndexMap::new();
                            for (j, xa) in ir.items(*args).enumerate() {
                                let v = x.ev(xa, p, 0);
                                let pv = arg_param(gf, j);
                                if let (Some(v), Some(pv)) = (v, pv) {
                                    rs.insert(pv, v);
                                }
                            }
                            if !rs.is_empty() {
                                visit(an, ae, h, hname, objs, exits, try_pc, done, seen, uniq, gpc, rs, depth - 1);
                            }
                        }
                    }
                }
                let (target, n) = match s {
                    Stmt::Store { addr, size, .. } => (*addr, *size as f64),
                    Stmt::Stores { addr, size, vals, .. } => (*addr, *size as f64 * vals.len as f64),
                    Stmt::Copy { dst, n, .. } => (*dst, *n as f64),
                    _ => continue,
                };
                let a = x.ev(target, p, 0);
                let spc = stmt_pc(s);
                let line = an.facts.borrow()[&c].pc_line.get(&spc).copied();
                let (Some(a), Some(line)) = (a, line) else { continue };
                let text = an.facts.borrow()[&c].lines.get((line - 1) as usize).map_or(String::new(), |l| super::js_trim(l).to_string());
                let mut push = |acct: &str, field: &str, mut kinds: Vec<&'static str>, note: String| {
                    let key = format!("{c}:{spc}:{acct}.{field}");
                    let mut facts = an.facts.borrow_mut();
                    let ff = facts.get_mut(&c).unwrap();
                    if done.contains(&key)
                        || ff.ops.iter().any(|o| o.line == line && o.target.as_ref().is_some_and(|t| t.acct == acct && t.field.as_deref() == Some(field)) && o.handler.is_none_or(|x| x == h))
                    {
                        return;
                    }
                    done.insert(key);
                    let v = store_value(&text);
                    if kinds[0] == "LAMPORT_WRITE" && (v == "0" || v == "0x0") {
                        kinds.push("ACCOUNT_CLOSE");
                    }
                    if kinds[0] == "ACCOUNT_DATA_WRITE" && authority(field) {
                        kinds.push("AUTHORITY_WRITE");
                    }
                    let how = match s {
                        Stmt::Store { v, .. } => arith_how(&an.fl, &x.d, *v, p),
                        _ => "=",
                    };
                    ff.ops.push(Op {
                        line,
                        pc: Some(spc),
                        kinds,
                        text: text.clone(),
                        main: false,
                        err_path: false,
                        cpi: None,
                        target: Some(super::facts::Ref { acct: acct.to_string(), field: Some(field.to_string()) }),
                        how: Some(how),
                        value: Some(v),
                        pda: None,
                        via: None,
                        ret: None,
                        exit: Some(note),
                        handler: if c == h { None } else { Some(h) },
                    });
                };
                let ah = match &a {
                    HVal::A(x) => Some(x.borrow().clone()),
                    _ => None,
                };
                if let Some(ah) = &ah {
                    if ah.k == HK::Obj || ah.k == HK::Objp {
                        let ex = ah.ty.as_ref().and_then(|t| exits.values().flat_map(exit_objs).find(|x| x.0.ty.as_deref() == Some(t.as_str())));
                        let fl = if ah.k == HK::Obj && !ah.vo {
                            ex.as_ref().and_then(|e| e.0.fields.iter().find(|x| ah.off < x.off + x.size && x.off < ah.off + n).map(|x| x.name.clone()))
                        } else {
                            None
                        };
                        push(
                            &ah.acct,
                            fl.as_deref().unwrap_or("data"),
                            vec!["ACCOUNT_DATA_WRITE"],
                            format!(
                                "through {}'s boxed account object{}, serialized back on exit (handler {hname})",
                                ah.acct,
                                if ah.k == HK::Objp { " (a buffer it points to)" } else { "" }
                            ),
                        );
                        continue;
                    }
                    if ah.k == HK::Lam && ah.off == 0.0 && n == 8.0 {
                        push(&ah.acct, "lamports", vec!["LAMPORT_WRITE"], format!("through the RefCell'd lamports of {}'s AccountInfo (handler {hname})", ah.acct));
                    }
                    if ah.k == HK::Data && ah.off == -8.0 && n == 8.0 {
                        push(&ah.acct, "data_len", vec!["ACCOUNT_REALLOC"], format!("the length before the RefCell'd data of {}'s AccountInfo (handler {hname})", ah.acct));
                    } else if ah.k == HK::Data {
                        let fl = ae.zc_field(ah.ty.as_deref(), ah.off, n).unwrap_or_else(|| format!("data[{}..{}]", js_num(ah.off), js_num(ah.off + n)));
                        push(&ah.acct, &fl, vec!["ACCOUNT_DATA_WRITE"], format!("through the RefCell'd data of {}'s AccountInfo (handler {hname})", ah.acct));
                    }
                }
                let HVal::Fr { ctx, z, .. } = &a else { continue };
                if ctx.fo != h || c == h {
                    continue;
                }
                for o in objs {
                    for xf in &o.ex.fields {
                        if *z < o.x + xf.off + xf.size && o.x + xf.off < z + n {
                            push(&o.acct, &xf.name, vec!["ACCOUNT_DATA_WRITE"], format!("an object of the handler {hname}'s frame, serialized back by {}", o.exit));
                        }
                    }
                }
            }
        }
        visit(self, &ae, h, &hname, &objs, exits, try_pc, &mut done, &mut seen, &mut uniq, h, IndexMap::new(), 3);
    }
}

#[allow(dead_code)]
fn unused(_: &IndexSet<u8>) {}
