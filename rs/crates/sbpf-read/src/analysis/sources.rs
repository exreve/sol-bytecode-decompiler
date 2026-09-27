//! Where the values of an instruction come from (`src/analysis/sources.ts`): a backward walk from an
//! expression through definitions, frame slots, parameters (up the call path) and pointers, down to the
//! sources: instruction data, account keys / data / lamports / owners, sysvars, CPI return data.

use super::anchor::{ACtx, AnchorEval, HVal, HK};
use super::flow::*;
use super::ixctx::IxInfo;
use super::An;
use indexmap::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, Node, Stmt, E, L};
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

#[derive(Clone, Debug, PartialEq)]
pub struct Source {
    pub source: String,
    pub kind: &'static str,
    pub acct: Option<String>,
}

/// a value as a constant or an address in a function's frame (at a position)
#[derive(Clone, Copy, Debug)]
enum Loc {
    C(u64),
    F { fn_: i64, off: f64, p: Pos },
}

pub struct SourceCtx<'a, 'x> {
    an: &'x An<'a>,
    ix: &'x IxInfo<'a>,
    args: Vec<String>,
    bases: IndexSet<String>,
    ae: Option<Rc<AnchorEval<'a>>>,
    ev_memo: RefCell<HashMap<i64, Option<Rc<ACtx<'a>>>>>,
    of_memo: RefCell<HashMap<(i64, E, Pos, String), Vec<Source>>>,
}

fn terms_of(k: &str) -> String {
    match k.strip_prefix("(+ ") {
        Some(inner) => inner[..inner.char_indices().last().map_or(0, |x| x.0)]
            .split(' ')
            .filter(|t| !t.starts_with('#'))
            .collect::<Vec<_>>()
            .join(" "),
        None => k.to_string(),
    }
}

impl<'a> An<'a> {
    /// The source walker of an instruction (sourceCtx).
    pub fn source_ctx<'x>(&'x self, ix: &'x IxInfo<'a>) -> SourceCtx<'a, 'x> {
        let ctx = &ix.ctx;
        let args: Vec<String> = self
            .instructions
            .iter()
            .find(|i| i.name == ix.name)
            .and_then(|i| i.args.clone())
            .unwrap_or_default()
            .iter()
            .map(|s| super::js_trim(s.split(':').next().unwrap_or("")).to_string())
            .collect();
        let mut bases: IndexSet<String> = IndexSet::new();
        if let Some((tfn, tv)) = ctx.tag {
            if let (Some(_), Some(fo)) = (self.defs_in(tfn), self.fo(tfn)) {
                let ir = fir(fo.f);
                for (bi, b) in fo.f.blocks.iter().enumerate() {
                    for (i, s) in b.stmts.iter().enumerate() {
                        let Stmt::Set { dst, e, .. } = s else {
                            continue;
                        };
                        if *dst as i64 != tv as i64 {
                            continue;
                        }
                        let e = match ir.get(*e) {
                            Node::Ext { a, .. } => a,
                            _ => *e,
                        };
                        if let Node::Load { addr, .. } = ir.get(e) {
                            bases.insert(terms_of(&self.value_key(
                                Some(ctx),
                                tfn,
                                addr,
                                pos_of(bi, i),
                                0,
                            )));
                        }
                    }
                }
            }
        }
        if self.anchor {
            if let Some(h) = self.fo(ctx.handler) {
                let ir = fir(h.f);
                for v in &h.f.vars {
                    let nm = h.names.get(v.id as usize).cloned().flatten();
                    let want = if h.f.stack_args.is_some() { 100 } else { 5 };
                    if v.param >= 1
                        && (nm.as_deref() == Some("ix_args")
                            || (h.name.starts_with("ix_") && v.param == want))
                    {
                        let k = self.value_key(Some(ctx), ctx.handler, ir.var(v.id), 0, 0);
                        bases.insert(k);
                    }
                }
            }
        }
        let ae = if self.anchor && self.fo(ctx.handler).is_some() {
            Some(self.anchor_eval(ctx.handler))
        } else {
            None
        };
        SourceCtx {
            an: self,
            ix,
            args,
            bases,
            ae,
            ev_memo: RefCell::new(HashMap::new()),
            of_memo: RefCell::new(HashMap::new()),
        }
    }
}

impl<'a, 'x> SourceCtx<'a, 'x> {
    fn is_ix(&self, k: &str) -> bool {
        self.bases.contains(&terms_of(k))
    }
    fn name_at(&self, i: f64) -> String {
        self.ix
            .accounts
            .iter()
            .find(|x| x.index == Some(i))
            .map_or_else(
                || format!("account[{}]", crate::util::js_num(i)),
                |x| x.name.clone(),
            )
    }
    fn known(&self) -> f64 {
        self.ix
            .accounts
            .iter()
            .filter(|x| x.index.is_some())
            .count() as f64
    }
    fn callee_name(&self, t: &CallTarget) -> String {
        match t {
            CallTarget::Sys { name, .. } => name.to_string(),
            CallTarget::Fn { pc } => format!(
                "{} {}",
                self.an.pname(*pc),
                self.an
                    .facts
                    .borrow()
                    .get(pc)
                    .map_or(String::new(), |f| f.name.clone())
            ),
            _ => String::new(),
        }
    }
    /// Anchor: evaluation contexts along the call path
    pub fn ev_in(&self, fn_: i64, d: u32) -> Option<Rc<ACtx<'a>>> {
        let ae = self.ae.as_ref()?;
        if d > 8 {
            return None;
        }
        if let Some(x) = self.ev_memo.borrow().get(&fn_) {
            return x.clone();
        }
        self.ev_memo.borrow_mut().insert(fn_, None);
        let ctx = &self.ix.ctx;
        let an = self.an;
        let mut x: Option<Rc<ACtx<'a>>> = None;
        if let Some(fo) = an.fo(fn_) {
            if fn_ == ctx.handler {
                x = Some(ae.ctx_of(fn_, IndexMap::new(), 2));
            } else {
                let par = ctx.parents.get(&fn_).copied();
                let pp = par.and_then(|p| self.ev_in(p.fn_, d + 1));
                let st = par.and_then(|p| p.pc.and_then(|pc| an.stmt_at(p.fn_, pc)));
                let c = match (par, st) {
                    (Some(p), Some((b, i))) => {
                        let pf = an.fo(p.fn_).unwrap().f;
                        call_of(fir(pf), &pf.blocks[b].stmts[i]).map(|c| (c, pos_of(b, i), fir(pf)))
                    }
                    _ => None,
                };
                if let (Some(pp), Some(((_, args), sp, pir))) = (pp, c) {
                    let mut roots: IndexMap<u32, HVal<'a>> = IndexMap::new();
                    for (j, a) in pir.items(args).enumerate() {
                        let v = pp.ev(a, sp, 0);
                        let pv = arg_param(fo.f, j);
                        if let (Some(v), Some(pv)) = (v, pv) {
                            roots.insert(pv, v);
                        }
                    }
                    x = Some(ae.ctx_of(fn_, roots, 2));
                }
            }
        }
        self.ev_memo.borrow_mut().insert(fn_, x.clone());
        x
    }

    fn acct_src(&self, i: f64, field: &str) -> Option<Source> {
        if i >= 64.0 || !crate::jre!(r"^(key|owner|lamports|data(\[.*)?)$").is_match(field) {
            return None;
        }
        let a = self.name_at(i);
        let known = self.known();
        if i >= known && known > 0.0 {
            return Some(Source {
                source: "remaining accounts".into(),
                kind: "remaining",
                acct: Some(a),
            });
        }
        let kind = match field {
            "key" => "key",
            "lamports" => "lamports",
            "owner" => "owner",
            _ => "data",
        };
        let what = if kind == "data" {
            if field.starts_with("data[") {
                field.to_string()
            } else {
                "data".into()
            }
        } else {
            kind.to_string()
        };
        Some(Source {
            source: format!("{a}.{what}"),
            kind,
            acct: Some(a),
        })
    }

    fn anchor_src(&self, h: Option<HVal<'a>>, n: f64) -> Option<Source> {
        let h = h?;
        let ae = self.ae.as_ref()?;
        match &h {
            HVal::Fr { ctx, z, at } => {
                if ctx.fo != self.ix.ctx.handler {
                    return None;
                }
                let (acct, field, info) = ae.frame_acct(*z, n, *at)?;
                if info {
                    return None;
                }
                Some(Source {
                    source: format!("{acct}.{}", field.as_deref().unwrap_or("data")),
                    kind: "data",
                    acct: Some(acct),
                })
            }
            HVal::A(x) => {
                let x = x.borrow();
                if x.guess == Some(true) {
                    return None;
                }
                let kind = match x.k {
                    HK::Keyp => "key",
                    HK::Ownp => "owner",
                    HK::Lam => "lamports",
                    HK::Data => "data",
                    _ => return None,
                };
                let field = if kind == "data" {
                    ae.zc_field(x.ty.as_deref(), x.off, n)
                        .unwrap_or_else(|| "data".into())
                } else {
                    kind.to_string()
                };
                if x.acct.starts_with("remaining_accounts[") {
                    return Some(Source {
                        source: format!("{}.{field}", x.acct),
                        kind: "remaining",
                        acct: Some(x.acct.clone()),
                    });
                }
                Some(Source {
                    source: format!("{}.{field}", x.acct),
                    kind,
                    acct: Some(x.acct.clone()),
                })
            }
        }
    }

    /// the sources of expression e at position p of function fn
    pub fn of(&self, fn0: i64, e0: E, p0: Pos) -> Vec<Source> {
        let k = (
            fn0,
            e0,
            p0,
            self.ix
                .accounts
                .iter()
                .map(|x| {
                    format!(
                        "{}:{}",
                        x.index.map_or("undefined".into(), crate::util::js_num),
                        x.name
                    )
                })
                .collect::<Vec<_>>()
                .join(","),
        );
        if let Some(y) = self.of_memo.borrow().get(&k) {
            return y.clone();
        }
        let y = self.of0(fn0, e0, p0);
        self.of_memo.borrow_mut().insert(k, y.clone());
        y
    }

    fn of0(&self, fn0: i64, e0: E, p0: Pos) -> Vec<Source> {
        let mut w = Walk {
            s: self,
            out: IndexMap::new(),
            budget: 400,
            seen: HashSet::new(),
        };
        w.walk(fn0, e0, p0, 0, String::new(), false);
        w.out.into_values().collect()
    }

    /// Anchor: the account whose key / AccountInfo a word of a frame object at a position holds
    pub fn frame_account(&self, fn_: i64, off: f64, p: Pos) -> Option<String> {
        let an = self.an;
        let (fo, d) = (an.fo(fn_)?, an.defs_in(fn_)?);
        self.ae.as_ref()?;
        let _ = fo;
        let x = self.ev_in(fn_, 0)?;
        let e = frame_load(d.ir, d.fp, off, 8);
        let h = x.ev(e, p, 0)?;
        match h {
            HVal::A(a) => {
                let a = a.borrow();
                if (a.k == HK::Keyp || a.k == HK::Info) && a.guess != Some(true) {
                    Some(a.acct.clone())
                } else {
                    None
                }
            }
            _ => None,
        }
    }

    fn val_of(&self, fn_: i64, e: E, p: Pos, d: u32) -> Option<Loc> {
        let an = self.an;
        let (dd, fo) = (an.defs_in(fn_)?, an.fo(fn_)?);
        if d > 16 {
            return None;
        }
        let ir = dd.ir;
        if let Node::Const(v) = ir.get(e) {
            return Some(Loc::C(v));
        }
        if let Some(o) = dd.fp_off(e) {
            return Some(Loc::F { fn_, off: o, p });
        }
        match ir.get(e) {
            Node::Bin(BinOp::Add, a, b) if matches!(ir.get(b), Node::Const(_)) => {
                let Node::Const(bv) = ir.get(b) else {
                    unreachable!()
                };
                let x = self.val_of(fn_, a, p, d + 1)?;
                let k = bv as i64;
                Some(match x {
                    Loc::C(c) => Loc::C(c.wrapping_add(k as u64)),
                    Loc::F { fn_, off, p } => Loc::F {
                        fn_,
                        off: off + k as f64,
                        p,
                    },
                })
            }
            Node::Var(id) => {
                if let Some((y, q)) = dd.def_at(&an.fl, id, p) {
                    return if matches!(ir.get(y), Node::Call(..)) {
                        None
                    } else {
                        self.val_of(fn_, y, q, d + 1)
                    };
                }
                let v = fo.f.vars.get(id as usize)?;
                let ctx = &self.ix.ctx;
                if !(v.param >= 1 && v.param != 10 && fn_ != ctx.handler) {
                    return None;
                }
                let par = ctx.parents.get(&fn_)?;
                let (b, i) = an.stmt_at(par.fn_, par.pc?)?;
                let pf = an.fo(par.fn_)?.f;
                let pir = fir(pf);
                let (t, args) = call_of(pir, &pf.blocks[b].stmts[i])?;
                let idx = if v.param < 100 {
                    v.param - 1
                } else {
                    4 + (v.param - 100)
                };
                if !matches!(t, CallTarget::Fn { pc } if pc == fn_)
                    || idx < 0
                    || idx as u32 >= args.len
                {
                    return None;
                }
                self.val_of(par.fn_, pir.at(args, idx as u32), pos_of(b, i), d + 1)
            }
            Node::Load { size: 8, addr } => {
                let a = self.val_of(fn_, addr, p, d + 1)?;
                match a {
                    Loc::C(c) => {
                        let img = an.p.image();
                        let b = img.bytes_at(c, 8)?;
                        if img.region(c, 8).map(|r| r.exec) != Some(false) {
                            return None;
                        }
                        Some(Loc::C(
                            b.iter()
                                .enumerate()
                                .fold(0u64, |x, (j, &y)| x | ((y as u64) << (8 * j))),
                        ))
                    }
                    Loc::F {
                        fn_: afn,
                        off,
                        p: ap,
                    } => {
                        let da = an.defs_in(afn)?;
                        let (y, q) = da.reaching(&an.fl, slot(off), ap, false)?;
                        if matches!(da.ir.get(y), Node::Call(..)) {
                            None
                        } else {
                            self.val_of(afn, y, q, d + 1)
                        }
                    }
                }
            }
            _ => None,
        }
    }

    fn frame_byte(&self, fn_: i64, off: f64, p: Pos) -> Option<u8> {
        let an = self.an;
        let (fo, dd) = (an.fo(fn_)?, an.defs_in(fn_)?);
        let ir = dd.ir;
        let mut b = (p >> 16) as usize;
        let mut i = (p & 0xffff) as i64;
        for _ in 0..200 {
            i -= 1;
            if i < 0 {
                let ps = &fo.f.blocks[b].preds;
                if ps.len() != 1 {
                    return None;
                }
                b = ps[0];
                i = fo.f.blocks[b].stmts.len() as i64;
                continue;
            }
            let st = &fo.f.blocks[b].stmts[i as usize];
            match st {
                Stmt::Store { addr, size, .. } | Stmt::Stores { addr, size, .. } => {
                    let vs: Vec<E> = match st {
                        Stmt::Store { v, .. } => vec![*v],
                        Stmt::Stores { vals, .. } => ir.to_vec(*vals),
                        _ => unreachable!(),
                    };
                    let Some(a) = dd.fp_off(*addr) else { continue };
                    let sz = *size as f64;
                    if off < a || off >= a + sz * vs.len() as f64 {
                        continue;
                    }
                    let v = vs[((off - a) / sz).floor() as usize];
                    return match ir.get(v) {
                        Node::Const(c) => {
                            Some(((c >> (8 * (((off - a) % sz) as u64))) & 0xff) as u8)
                        }
                        _ => None,
                    };
                }
                Stmt::Copy { dst, n, .. } => {
                    let a = dd.fp_off(*dst);
                    if a.is_none_or(|a| off >= a && off < a + *n as f64) {
                        return None;
                    }
                    continue;
                }
                _ => {}
            }
            if let Some((_, args)) = call_of(ir, st) {
                if ir
                    .items(args)
                    .any(|x| dd.fp_off(x).is_some_and(|o| o <= off))
                {
                    return None;
                }
            }
        }
        None
    }

    /// the n constant bytes a pointer points to (read-only memory, or constant stores into a frame up the call path)
    pub fn bytes_at(&self, fn_: i64, e: E, p: Pos, n: usize) -> Option<Vec<u8>> {
        match self.val_of(fn_, e, p, 0)? {
            Loc::C(c) => {
                let img = self.an.p.image();
                let g = img.region(c, n as u64)?;
                if g.exec {
                    return None;
                }
                img.bytes_at(c, n).map(|b| b.to_vec())
            }
            Loc::F { fn_, off, p } => {
                let mut out = Vec::with_capacity(n);
                for k in 0..n {
                    out.push(self.frame_byte(fn_, off + k as f64, p)?);
                }
                Some(out)
            }
        }
    }
}

struct Walk<'s, 'a, 'x> {
    s: &'s SourceCtx<'a, 'x>,
    out: IndexMap<String, Source>,
    budget: i64,
    seen: HashSet<String>,
}

/// the pointer terms of an address (a sum): not the offsets added to it
fn bases_(ir: &sbpf_ir::Ir, a: E) -> Vec<E> {
    match ir.get(a) {
        Node::Bin(BinOp::Add, x, y) => {
            let mut v = bases_(ir, x);
            v.extend(bases_(ir, y));
            v
        }
        Node::Const(_) => vec![],
        Node::Bin(op, _, _) if op != BinOp::Sub => vec![],
        _ => vec![a],
    }
}

impl<'s, 'a, 'x> Walk<'s, 'a, 'x> {
    fn add(&mut self, s: Source) {
        if !self.out.contains_key(&s.source) {
            self.out.insert(s.source.clone(), s);
        }
    }
    fn ix_src(&self, t: &str) -> Source {
        let g = self
            .s
            .args
            .iter()
            .find(|x| super::jsre(&format!(r"\b{}\b", regex::escape(x))).is_match(t));
        Source {
            source: g.map_or("instruction data".into(), |g| format!("ix.{g}")),
            kind: "ix",
            acct: None,
        }
    }
    fn native_ref(&self, fn_: i64, e: E, p: Pos) -> Option<Source> {
        let an = self.s.an;
        let fo = an.fo(fn_)?;
        let r = super::acct::account_resolver(&an.fl, fo.f, &fo.names, true, None);
        let x = r.value_at(&an.fl, e, p)?;
        let f = x.field?;
        self.s.acct_src(x.index, &f)
    }
    fn call_src(
        &mut self,
        fn_: i64,
        t: &CallTarget,
        args: L,
        ir: &sbpf_ir::Ir,
        p: Pos,
        d: u32,
        via: &str,
    ) {
        let nm = self.s.callee_name(t);
        if let Some(sv) = crate::jre!(r"sol_get_(clock|rent|epoch_schedule|fees|epoch_rewards|last_restart_slot|stake_history)_sysvar|sol_get_sysvar|\b(Clock|Rent|EpochSchedule|Fees|EpochRewards|LastRestartSlot)::get\b|sysvar::(clock|rent)").captures(&nm) {
            let k = sv.get(1).or(sv.get(2)).or(sv.get(3)).map(|m| m.as_str().to_lowercase());
            self.add(Source {
                source: k.map_or("sysvar".into(), |k| format!("sysvar {k}")),
                kind: "sysvar",
                acct: None,
            });
            return;
        }
        if crate::jre!(r"sol_get_return_data|get_return_data").is_match(&nm) {
            self.add(Source {
                source: "CPI return data".into(),
                kind: "return-data",
                acct: None,
            });
            return;
        }
        for a in ir.items(args) {
            self.walk(fn_, a, p, d + 1, via.to_string(), false);
        }
    }
    fn walk(&mut self, fn_: i64, e: E, p: Pos, d: u32, via0: String, ptr: bool) {
        if d > 24 {
            return;
        }
        let b = self.budget;
        self.budget -= 1;
        if b <= 0 {
            return;
        }
        let an = self.s.an;
        let (Some(fo), Some(dd)) = (an.fo(fn_), an.defs_in(fn_)) else {
            return;
        };
        let ir = fir(fo.f);
        if matches!(ir.get(e), Node::Const(_) | Node::Undef | Node::Reg(_)) {
            return;
        }
        let ctx = &self.s.ix.ctx;
        let sk = format!(
            "{fn_}|{p}|{}{}",
            if ptr { "*" } else { "" },
            an.value_key(Some(ctx), fn_, e, p, 0)
        );
        if self.seen.contains(&sk) {
            return;
        }
        self.seen.insert(sk);
        let mut via = via0;
        if matches!(ir.get(e), Node::Load { .. }) {
            if let Some(t) = (an.expr)(fn_, e) {
                via = t;
            }
        }
        if !an.anchor {
            if let Node::Bin(BinOp::Add, _, b) = ir.get(e) {
                if matches!(ir.get(b), Node::Const(_)) {
                    if let Some(y) = self.native_ref(fn_, e, p) {
                        self.add(y);
                        return;
                    }
                }
            }
        }
        let is_load = matches!(ir.get(e), Node::Load { .. });
        let is_var = matches!(ir.get(e), Node::Var(_));
        if is_load || is_var {
            let addr = match ir.get(e) {
                Node::Load { addr, .. } => Some(addr),
                _ => None,
            };
            if let Some(addr) = addr {
                if dd.fp_off(addr).is_none()
                    && self.s.is_ix(&an.value_key(Some(ctx), fn_, addr, p, 0))
                {
                    let s = self.ix_src(&via);
                    self.add(s);
                    return;
                }
            }
            if is_var && self.s.is_ix(&an.value_key(Some(ctx), fn_, e, p, 0)) {
                let t = format!("{via} {}", (an.expr)(fn_, e).unwrap_or_default());
                let s = self.ix_src(&t);
                self.add(s);
                return;
            }
            if let Some(addr) = addr {
                if dd.fp_off(addr).is_none() {
                    if an.anchor {
                        let n = match ir.get(e) {
                            Node::Load { size, .. } => size as f64,
                            _ => 8.0,
                        };
                        let h = self.s.ev_in(fn_, 0).and_then(|x| x.ev(addr, p, 0));
                        if let Some(s) = self.s.anchor_src(h, n) {
                            self.add(s);
                            return;
                        }
                    } else if let Some(y) = self.native_ref(fn_, e, p) {
                        self.add(y);
                        return;
                    }
                }
            }
            if !an.anchor && is_var {
                if let Some(y) = self.native_ref(fn_, e, p) {
                    self.add(y);
                    return;
                }
            }
            if an.anchor {
                let h = self.s.ev_in(fn_, 0).and_then(|x| x.ev(e, p, 0));
                if let Some(HVal::A(h)) = h {
                    let hb = h.borrow();
                    if hb.k == HK::Info && hb.guess != Some(true) {
                        let a = hb.acct.clone();
                        drop(hb);
                        self.add(Source {
                            source: format!("{a}.key"),
                            kind: "key",
                            acct: Some(a),
                        });
                        return;
                    }
                }
            }
        }
        match ir.get(e) {
            Node::Var(id) => {
                if id as i64 == dd.fp {
                    return;
                }
                if let Some((y, q)) = dd.def_at(&an.fl, id, p) {
                    if let Node::Call(t, args) = ir.get(y) {
                        self.call_src(fn_, &ir.target(t), args, ir, q, d, &via);
                    } else {
                        self.walk(fn_, y, q, d + 1, via, ptr);
                    }
                    return;
                }
                let Some(v) = fo.f.vars.get(id as usize) else {
                    return;
                };
                if v.param >= 1 && v.param != 10 && !dd.multi.contains(&id) {
                    if fn_ == ctx.handler {
                        return;
                    }
                    let Some(par) = ctx.parents.get(&fn_).copied() else {
                        return;
                    };
                    let Some(ppc) = par.pc else { return };
                    let Some((b, i)) = an.stmt_at(par.fn_, ppc) else {
                        return;
                    };
                    let pf = an.fo(par.fn_).unwrap().f;
                    let pir = fir(pf);
                    let Some((t, args)) = call_of(pir, &pf.blocks[b].stmts[i]) else {
                        return;
                    };
                    let idx = if v.param < 100 {
                        v.param - 1
                    } else {
                        4 + (v.param - 100)
                    };
                    if matches!(t, CallTarget::Fn { pc } if pc == fn_)
                        && idx >= 0
                        && (idx as u32) < args.len
                    {
                        self.walk(
                            par.fn_,
                            pir.at(args, idx as u32),
                            pos_of(b, i),
                            d + 1,
                            via,
                            ptr,
                        );
                    }
                }
            }
            Node::Load { size, addr } => {
                if let Some(o) = dd.fp_off(addr) {
                    let y = if size == 8 {
                        dd.reaching(&an.fl, slot(o), p, false)
                    } else {
                        None
                    };
                    let y = y.or_else(|| {
                        dd.reaching(
                            &an.fl,
                            slot(o - (crate::util::to_int32(o) & 7) as f64),
                            p,
                            true,
                        )
                    });
                    if let Some((y, q)) = y {
                        if let Node::Call(t, args) = ir.get(y) {
                            self.call_src(fn_, &ir.target(t), args, ir, q, d, &via);
                        } else {
                            self.walk(fn_, y, q, d + 1, via, false);
                        }
                    }
                    return;
                }
                self.walk(fn_, addr, p, d + 1, via, true);
            }
            Node::Call(t, args) => self.call_src(fn_, &ir.target(t), args, ir, p, d, &via),
            Node::Bin(_, a, b) => {
                let xs = if ptr { bases_(ir, e) } else { vec![a, b] };
                for x in xs {
                    self.walk(fn_, x, p, d + 1, via.clone(), ptr && x != e);
                }
            }
            Node::Ext { a, .. }
            | Node::Neg(a)
            | Node::Not(a)
            | Node::Bswap { a, .. }
            | Node::Lnot(a) => self.walk(fn_, a, p, d + 1, via, false),
            Node::Sel(_, a, b) => {
                self.walk(fn_, a, p, d + 1, via.clone(), false);
                self.walk(fn_, b, p, d + 1, via, false);
            }
            Node::Fn(_, args) => {
                for a in ir.items(args) {
                    self.walk(fn_, a, p, d + 1, via.clone(), false);
                }
            }
            Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                self.walk(fn_, a, p, d + 1, via.clone(), false);
                self.walk(fn_, b, p, d + 1, via, false);
            }
            _ => {}
        }
    }
}
