//! The native account model (`src/analysis/flow.ts`, part 2): abstract values of pointers into the
//! accounts (an &[AccountInfo] slice, the input records, the RcBoxes of lamports / data, fields), the
//! evaluator (avEvaluator), root classification, and the per-function account resolver.

use super::flow::*;
use super::FK;
use crate::util::js_num;
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, Term, E};
use sbpf_program::Func;
use std::cell::{Cell, RefCell};
use sbpf_ir::fx::{HashMap, HashSet};
use std::rc::{Rc, Weak};

/// Abstract values of the account model.
#[derive(Clone, Debug, PartialEq)]
pub enum AV {
    /// &[AccountInfo] (0x30-byte entries)
    Slice { off: f64 },
    /// array of pointers to input records
    Recs { off: f64 },
    /// input record i
    Rec { i: f64, off: f64 },
    /// Rc<RefCell<&mut ..>> of AccountInfo i (f: lamports | data)
    Rc { i: f64, f: &'static str, off: f64 },
    /// &lamports / &data[..] / &key / &owner of account i (vo: data at a variable offset past off)
    Ptr {
        i: f64,
        f: String,
        off: f64,
        vo: bool,
    },
    /// a field value read
    Val { i: f64, f: String },
    /// (first pass) a pointer variable
    Base { v: u32, off: f64 },
    /// (first pass) a pointer loaded from base v, entry e
    Elem { v: u32, e: f64, off: f64 },
    /// a pointer into the function's own frame (fp + off)
    Fr { off: f64 },
    /// a pointer into a caller's frame (a parameter): its words by the caller's evaluator
    Ext { id: u32, off: f64 },
}

impl AV {
    pub fn kind(&self) -> &'static str {
        match self {
            AV::Slice { .. } => "slice",
            AV::Recs { .. } => "recs",
            AV::Rec { .. } => "rec",
            AV::Rc { .. } => "rc",
            AV::Ptr { .. } => "ptr",
            AV::Val { .. } => "val",
            AV::Base { .. } => "base",
            AV::Elem { .. } => "elem",
            AV::Fr { .. } => "fr",
            AV::Ext { .. } => "ext",
        }
    }
    fn off(&self) -> Option<f64> {
        match self {
            AV::Slice { off }
            | AV::Recs { off }
            | AV::Rec { off, .. }
            | AV::Rc { off, .. }
            | AV::Ptr { off, .. } => Some(*off),
            AV::Base { off, .. } | AV::Elem { off, .. } | AV::Fr { off } | AV::Ext { off, .. } => {
                Some(*off)
            }
            AV::Val { .. } => None,
        }
    }
    fn with_off(&self, o: f64) -> AV {
        let mut x = self.clone();
        match &mut x {
            AV::Slice { off }
            | AV::Recs { off }
            | AV::Rec { off, .. }
            | AV::Rc { off, .. }
            | AV::Ptr { off, .. } => *off = o,
            AV::Base { off, .. } | AV::Elem { off, .. } | AV::Fr { off } | AV::Ext { off, .. } => {
                *off = o
            }
            AV::Val { .. } => {}
        }
        x
    }
    /// JSON.stringify of the value (the memo keys)
    pub fn json(&self) -> String {
        let n = js_num;
        match self {
            AV::Slice { off } => format!(r#"{{"k":"slice","off":{}}}"#, n(*off)),
            AV::Recs { off } => format!(r#"{{"k":"recs","off":{}}}"#, n(*off)),
            AV::Rec { i, off } => format!(r#"{{"k":"rec","i":{},"off":{}}}"#, n(*i), n(*off)),
            AV::Rc { i, f, off } => {
                format!(r#"{{"k":"rc","i":{},"f":"{f}","off":{}}}"#, n(*i), n(*off))
            }
            AV::Ptr { i, f, off, vo } => format!(
                r#"{{"k":"ptr","i":{},"f":{},"off":{}{}}}"#,
                n(*i),
                crate::util::json_str(f),
                n(*off),
                if *vo { r#","vo":true"# } else { "" }
            ),
            AV::Val { i, f } => format!(
                r#"{{"k":"val","i":{},"f":{}}}"#,
                n(*i),
                crate::util::json_str(f)
            ),
            AV::Base { v, off } => format!(r#"{{"k":"base","v":{v},"off":{}}}"#, n(*off)),
            AV::Elem { v, e, off } => {
                format!(r#"{{"k":"elem","v":{v},"e":{},"off":{}}}"#, n(*e), n(*off))
            }
            AV::Fr { off } => format!(r#"{{"k":"fr","off":{}}}"#, n(*off)),
            AV::Ext { id, off } => format!(r#"{{"k":"ext","id":{id},"off":{}}}"#, n(*off)),
        }
    }
}

/// An account (by index) and field.
#[derive(Clone, Debug, PartialEq)]
pub struct AcctRef {
    pub index: f64,
    pub field: Option<String>,
}

/// a side of an equality
#[derive(Clone, Debug, PartialEq)]
pub enum Side {
    Acct(AcctRef),
    Stack,
    Pda,
    Const,
    None,
}

fn info_field(legacy: bool, o: f64) -> Option<&'static str> {
    if o.fract() != 0.0 {
        return None;
    }
    let o = o as i64;
    Some(if legacy {
        match o {
            0 => "rent_epoch",
            8 => "key",
            0x10 => "lamports",
            0x18 => "data",
            0x20 => "owner",
            0x28 => "is_signer",
            0x29 => "is_writable",
            0x2a => "executable",
            _ => return None,
        }
    } else {
        match o {
            0 => "key",
            8 => "lamports",
            0x10 => "data",
            0x18 => "owner",
            0x20 => "rent_epoch",
            0x28 => "is_signer",
            0x29 => "is_writable",
            0x2a => "executable",
            _ => return None,
        }
    })
}

/// a serialized input record: field by offset, size
pub fn rec_field(o: f64) -> Option<(&'static str, u8)> {
    if o.fract() != 0.0 {
        return None;
    }
    Some(match o as i64 {
        1 => ("is_signer", 1),
        2 => ("is_writable", 1),
        3 => ("executable", 1),
        8 => ("key", 32),
        0x28 => ("owner", 32),
        0x48 => ("lamports", 8),
        0x50 => ("data_len", 8),
        _ => return None,
    })
}

fn c_info_field(o: f64) -> Option<(&'static str, u8)> {
    if o.fract() != 0.0 {
        return None;
    }
    Some(match o as i64 {
        0 => ("key", 8),
        8 => ("lamports", 8),
        0x10 => ("data_len", 8),
        0x18 => ("data", 8),
        0x20 => ("owner", 8),
        0x28 => ("rent_epoch", 8),
        0x30 => ("is_signer", 1),
        0x31 => ("is_writable", 1),
        0x32 => ("executable", 1),
        _ => return None,
    })
}

/// (JS `%` on numbers)
fn jmod(a: f64, b: f64) -> f64 {
    a % b
}

/// the loader of a caller frame a callee's parameter points into (AV::Ext): the caller's evaluator, as at the call
#[derive(Clone)]
pub struct ExtLoader<'a> {
    ev: Rc<AvEval<'a>>,
    p: Pos,
    d: i32,
    fpv: i64,
}

#[derive(Default)]
pub struct AcctCache<'a> {
    ext: RefCell<HashMap<u32, ExtLoader<'a>>>,
    ext_ids: Cell<u32>,
    classify: RefCell<HashMap<(i64, String), Vec<(u32, AV)>>>,
    slice: RefCell<HashMap<(i64, String), Rc<Vec<i32>>>>,
    wt: RefCell<HashMap<(i64, i32, i32), bool>>,
    seed: RefCell<HashMap<(i64, String), Rc<Resolver<'a>>>>,
    pda: RefCell<HashMap<(i64, bool), Rc<PdaMemo>>>,
}

#[derive(Default)]
pub struct PdaMemo {
    full: RefCell<Option<Rc<Vec<f64>>>>,
    eqs: RefCell<HashMap<(E, Pos), Rc<Vec<(f64, f64, E)>>>>,
}

fn ext_of<'a>(fl: &FlowCtx<'a>, ld: ExtLoader<'a>, off: f64) -> AV {
    let c = &fl.cache;
    let id = c.ext_ids.get() + 1;
    c.ext_ids.set(id);
    c.ext.borrow_mut().insert(id, ld);
    AV::Ext { id, off }
}

fn ext_load<'a>(fl: &FlowCtx<'a>, id: u32, o: f64, size: u8) -> Option<AV> {
    let ld = fl.cache.ext.borrow().get(&id)?.clone();
    let ir = fir(ld.ev.f);
    let e = frame_load(ir, ld.fpv, o, size);
    let x = ld.ev.ev(fl, e, ld.p, ld.d);
    match x {
        Some(AV::Fr { off }) => Some(ext_of(fl, ld.clone(), off)),
        x => x,
    }
}

struct EvMemo {
    p: Pos,
    x: Option<AV>,
    more: Option<HashMap<Pos, Option<AV>>>,
}

/// The evaluator of the native account model in a function (avEvaluator).
pub struct AvEval<'a> {
    me: Weak<AvEval<'a>>,
    pub f: &'a Func,
    d: Rc<Defs<'a>>,
    roots: IndexMap<u32, AV>,
    arr: Option<f64>,
    with_callee: bool,
    depth: i32,
    pass1: bool,
    infos: Option<f64>,
    bud: Option<Rc<Cell<i64>>>,
    memo: RefCell<HashMap<E, EvMemo>>,
    mdefs: RefCell<Option<HashMap<u32, Vec<(Option<E>, Pos)>>>>,
    own: RefCell<Option<Rc<Cell<i64>>>>,
    mres: RefCell<HashMap<u32, Option<AV>>>,
}

#[allow(clippy::too_many_arguments)]
pub fn av_evaluator<'a>(
    f: &'a Func,
    d: Rc<Defs<'a>>,
    roots: IndexMap<u32, AV>,
    arr: Option<f64>,
    with_callee: bool,
    depth: i32,
    pass1: bool,
    infos: Option<f64>,
    bud: Option<Rc<Cell<i64>>>,
) -> Rc<AvEval<'a>> {
    Rc::new_cyclic(|me| AvEval {
        me: me.clone(),
        f,
        d,
        roots,
        arr,
        with_callee,
        depth,
        pass1,
        infos,
        bud,
        memo: RefCell::new(HashMap::default()),
        mdefs: RefCell::new(None),
        own: RefCell::new(None),
        mres: RefCell::new(HashMap::default()),
    })
}

impl<'a> AvEval<'a> {
    fn ir(&self) -> &'a Ir {
        fir(self.f)
    }
    fn rc(&self) -> Rc<AvEval<'a>> {
        self.me.upgrade().unwrap()
    }
    fn legacy(&self, fl: &FlowCtx) -> bool {
        self.with_callee && fl.callee.legacy
    }

    /// what a call left in the object it got a pointer to: the callee's stores there
    fn out_of(
        &self,
        fl: &FlowCtx<'a>,
        t: &CallTarget,
        args: &[E],
        o: f64,
        p: Pos,
        d: i32,
    ) -> Option<AV> {
        let CallTarget::Fn { pc } = t else {
            return None;
        };
        if self.depth <= 0 || !self.with_callee {
            return None;
        }
        let g = (fl.callee.f)(*pc)?;
        let dd = &self.d;
        let j = args
            .iter()
            .position(|&a| dd.fp_off(a).is_some_and(|q| q <= o && o < q + 128.0));
        let pv = param_var(g, j.map_or(0, |j| j as i32 + 1));
        let (Some(j), Some(pv)) = (j, pv) else {
            return None;
        };
        let off = o - dd.fp_off(args[j]).unwrap();
        let gd = fl.defs_of(g, true);
        let gir = fir(g);
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
        let mut vs: Vec<(E, Pos)> = Vec::new();
        for (bi, b) in g.blocks.iter().enumerate() {
            for (i, s) in b.stmts.iter().enumerate() {
                if let Stmt::Store {
                    size: 8, addr, v, ..
                } = s
                {
                    if at(gir, &gd, pv, *addr, 0) == Some(off) {
                        vs.push((*v, pos_of(bi, i)));
                    }
                }
                let mc = call_of(gir, s)
                    .and_then(|(ct, cargs)| memcpy_of(gir, &ct, cargs, Some(&fl.callee)));
                if let Some(mc) = mc {
                    if let Some(a) = at(gir, &gd, pv, mc.0, 0) {
                        if a <= off && off + 8.0 <= a + mc.2 {
                            let addr = if off > a {
                                gir.bin(BinOp::Add, mc.1, gir.c((off - a) as i64 as u64))
                            } else {
                                mc.1
                            };
                            vs.push((gir.load(8, addr), pos_of(bi, i)));
                        }
                    }
                }
            }
        }
        if vs.is_empty() || vs.len() > 8 {
            return None;
        }
        let mut rs: IndexMap<u32, AV> = IndexMap::default();
        for (k, &a) in args.iter().enumerate() {
            let x = if k == j {
                None
            } else {
                self.ev(fl, a, p, d + 1)
            };
            let q = param_var(g, k as i32 + 1);
            let (Some(x), Some(q)) = (x, q) else { continue };
            if let AV::Fr { off } = x {
                let ld = ExtLoader {
                    ev: self.rc(),
                    p,
                    d: d + 2,
                    fpv: dd.fp,
                };
                rs.insert(q, ext_of(fl, ld, off));
            } else {
                rs.insert(q, x);
            }
        }
        if rs.is_empty() {
            return None;
        }
        let bud = self.bud.clone().unwrap_or_else(|| Rc::new(Cell::new(64)));
        let gg = av_evaluator(
            g,
            gd,
            rs,
            None,
            true,
            self.depth - 1,
            false,
            None,
            Some(bud),
        );
        let xs: Vec<AV> = vs
            .iter()
            .filter_map(|&(e, q)| gg.ev(fl, e, q, d + 1))
            .collect();
        if !xs.is_empty() && xs.iter().all(|x| x.json() == xs[0].json()) {
            Some(xs[0].clone())
        } else {
            None
        }
    }

    fn multi_val(&self, fl: &FlowCtx<'a>, id: u32, d: i32) -> Option<AV> {
        match self.mres.borrow().get(&id) {
            Some(Some(x)) => return Some(x.clone()),
            Some(None) => return None,
            None => {}
        }
        if self.mdefs.borrow().is_none() {
            let mut m: HashMap<u32, Vec<(Option<E>, Pos)>> = HashMap::default();
            for (bi, b) in self.f.blocks.iter().enumerate() {
                for (i, st) in b.stmts.iter().enumerate() {
                    let (dst, e) = match st {
                        Stmt::Set { dst, e, .. } => (*dst, Some(*e)),
                        Stmt::Call { dst, .. } => (*dst, None),
                        _ => continue,
                    };
                    if dst >= 0 && self.d.multi.contains(&(dst as u32)) {
                        m.entry(dst as u32).or_default().push((e, pos_of(bi, i)));
                    }
                }
            }
            *self.mdefs.borrow_mut() = Some(m);
        }
        let ds: Vec<(Option<E>, Pos)> = self
            .mdefs
            .borrow()
            .as_ref()
            .unwrap()
            .get(&id)
            .cloned()
            .unwrap_or_default();
        let b = match &self.bud {
            Some(b) => b.clone(),
            None => self
                .own
                .borrow_mut()
                .get_or_insert_with(|| Rc::new(Cell::new(64)))
                .clone(),
        };
        if ds.is_empty() || ds.len() > 4 || d > 6 {
            return None;
        }
        b.set(b.get() - ds.len() as i64);
        if b.get() < 0 {
            return None;
        }
        self.mres.borrow_mut().insert(id, None);
        let ir = self.ir();
        let vs: Vec<AV> = ds
            .iter()
            .filter_map(|&(x, q)| {
                let x = x?;
                if matches!(ir.get(x), Node::Call(..)) {
                    return None;
                }
                self.ev(fl, x, q, d + 1)
            })
            .filter(|x| !matches!(x, AV::Fr { .. } | AV::Base { .. }))
            .collect();
        let r = if !vs.is_empty() && vs.iter().all(|x| x.json() == vs[0].json()) {
            Some(vs[0].clone())
        } else {
            None
        };
        match &r {
            Some(x) => {
                self.mres.borrow_mut().insert(id, Some(x.clone()));
            }
            None => {
                self.mres.borrow_mut().remove(&id);
            }
        }
        r
    }

    /// the value of e evaluated at position p
    pub fn ev(&self, fl: &FlowCtx<'a>, e: E, p: Pos, d: i32) -> Option<AV> {
        if d > 24 {
            fl.ev_cuts.set(fl.ev_cuts.get() + 1);
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
        let c0 = fl.ev_cuts.get();
        let r = self.ev0(fl, e, p, d);
        if fl.ev_cuts.get() == c0 {
            let mut m = self.memo.borrow_mut();
            if had {
                if let Some(x) = m.get_mut(&e) {
                    x.more.get_or_insert_with(HashMap::default).insert(p, r.clone());
                }
            } else {
                m.insert(
                    e,
                    EvMemo {
                        p,
                        x: r.clone(),
                        more: None,
                    },
                );
            }
        }
        r
    }

    fn ev0(&self, fl: &FlowCtx<'a>, e: E, p: Pos, d: i32) -> Option<AV> {
        let ir = self.ir();
        let dd = &self.d;
        if !self.pass1 {
            if let Some(o) = dd.fp_off(e) {
                return Some(AV::Fr { off: o });
            }
        }
        match ir.get(e) {
            Node::Var(id) => {
                if let Some(r) = self.roots.get(&id) {
                    return Some(r.clone());
                }
                if let Some(&x) = dd.defs.get(&id) {
                    return if matches!(ir.get(x), Node::Call(..)) {
                        None
                    } else {
                        self.ev(fl, x, dd.def_pos[&id], d + 1)
                    };
                }
                if dd.multi.contains(&id) {
                    if let Some((y, q)) = dd.reaching(fl, id as f64, p, false) {
                        return if matches!(ir.get(y), Node::Call(..)) {
                            None
                        } else {
                            self.ev(fl, y, q, d + 1)
                        };
                    }
                    return if self.pass1 || self.depth > 1 {
                        None
                    } else {
                        self.multi_val(fl, id, d)
                    };
                }
                if self.pass1 && id as i64 != dd.fp {
                    Some(AV::Base { v: id, off: 0.0 })
                } else {
                    None
                }
            }
            Node::Ext { a, .. } => self.ev(fl, a, p, d + 1),
            Node::Bin(op, a, b) => {
                if op != BinOp::Add {
                    return None;
                }
                let bc = match ir.get(b) {
                    Node::Const(v) => Some(v),
                    _ => None,
                };
                let Some(bv) = bc else {
                    if self.pass1 {
                        return None;
                    }
                    for (x, y) in [(a, b), (b, a)] {
                        if !matches!(ir.get(y), Node::Const(_)) {
                            if let Some(AV::Ptr { i, f, off, .. }) = self.ev(fl, x, p, d + 1) {
                                if f == "data" {
                                    return Some(AV::Ptr {
                                        i,
                                        f,
                                        off,
                                        vo: true,
                                    });
                                }
                            }
                        }
                    }
                    return None;
                };
                let av = self.ev(fl, a, p, d + 1)?;
                if matches!(av, AV::Val { .. }) {
                    return None;
                }
                let o = av.off().unwrap();
                Some(av.with_off(o + s_num(bv)))
            }
            Node::Load { size, addr } => {
                let fo = dd.fp_off(addr);
                let fa = if self.pass1 || fo.is_some() {
                    None
                } else {
                    self.ev(fl, addr, p, d + 1)
                };
                let o = fo.or(match &fa {
                    Some(AV::Fr { off }) => Some(*off),
                    _ => None,
                });
                if let Some(o) = o {
                    if let Some(arr) = self.arr {
                        if size == 8 && o >= arr && jmod(o - arr, 8.0) == 0.0 && o - arr < 512.0 {
                            return Some(AV::Rec {
                                i: (o - arr) / 8.0,
                                off: 0.0,
                            });
                        }
                    }
                    if let Some(infos) = self.infos {
                        if o >= infos && o < infos + 0x38 as f64 * 64.0 {
                            let i = ((o - infos) / 56.0).floor();
                            if let Some(c) = c_info_field(jmod(o - infos, 56.0)) {
                                if c.1 == size {
                                    return Some(
                                        if c.1 == 1 || c.0 == "data_len" || c.0 == "rent_epoch" {
                                            AV::Val { i, f: c.0.into() }
                                        } else {
                                            AV::Ptr {
                                                i,
                                                f: c.0.into(),
                                                off: 0.0,
                                                vo: false,
                                            }
                                        },
                                    );
                                }
                            }
                        }
                    }
                    let y = if size == 8 {
                        dd.reaching(fl, slot(o), p, false)
                    } else {
                        None
                    };
                    if let Some((y, q)) = y {
                        return self.ev(fl, y, q, d + 1);
                    }
                    let z = if size == 8 && self.with_callee {
                        dd.reaching(fl, slot(o), p, true)
                    } else {
                        None
                    };
                    let c = z.and_then(|(x, q)| match ir.get(x) {
                        Node::Call(t, cargs) => match ir.target(t) {
                            CallTarget::Fn { pc } => {
                                Some((CallTarget::Fn { pc }, ir.to_vec(cargs), q))
                            }
                            _ => None,
                        },
                        _ => None,
                    });
                    let Some((ct, cargs, zq)) = c else {
                        return None;
                    };
                    let CallTarget::Fn { pc } = ct else {
                        unreachable!()
                    };
                    let nm = (fl.callee.name)(pc);
                    if let Some(m) =
                        crate::jre!(r"try_borrow_(?:mut_)?(data|lamports)").captures(&nm)
                    {
                        if cargs.first().and_then(|&a| dd.fp_off(a)) == Some(o - 8.0) {
                            let a = cargs.get(1).and_then(|&a1| self.ev(fl, a1, zq, d + 1));
                            return match a {
                                Some(AV::Slice { off }) if jmod(off, 48.0) == 0.0 => Some(AV::Rc {
                                    i: off / 48.0,
                                    f: if &m[1] == "data" { "data" } else { "lamports" },
                                    off: 24.0,
                                }),
                                _ => None,
                            };
                        }
                    }
                    return if !self.pass1 {
                        self.out_of(fl, &ct, &cargs, o, zq, d)
                    } else {
                        None
                    };
                }
                let a = match fa {
                    Some(x) => Some(x),
                    None => self.ev(fl, addr, p, d + 1),
                };
                self.deref(fl, a, size)
            }
            _ => None,
        }
    }

    fn deref(&self, fl: &FlowCtx<'a>, a: Option<AV>, size: u8) -> Option<AV> {
        let a = a?;
        match a {
            AV::Base { v, off } => {
                if self.pass1 && size == 8 && off >= 0.0 && jmod(off, 8.0) == 0.0 {
                    Some(AV::Elem {
                        v,
                        e: off / 8.0,
                        off: 0.0,
                    })
                } else {
                    None
                }
            }
            AV::Slice { off } => {
                if off < 0.0 {
                    return None;
                }
                let i = (off / 48.0).floor();
                let o = jmod(off, 48.0);
                let fl_ = info_field(self.legacy(fl), o);
                match fl_ {
                    Some(f @ ("key" | "owner")) if size == 8 => Some(AV::Ptr {
                        i,
                        f: f.into(),
                        off: 0.0,
                        vo: false,
                    }),
                    Some(f @ ("lamports" | "data")) if size == 8 => Some(AV::Rc { i, f, off: 0.0 }),
                    Some(f) => {
                        let ok = if f == "rent_epoch" {
                            size == 8
                        } else {
                            o >= 40.0 && size == 1
                        };
                        if ok {
                            Some(AV::Val { i, f: f.into() })
                        } else {
                            None
                        }
                    }
                    None => None,
                }
            }
            AV::Recs { off } => {
                if size == 8 && off >= 0.0 && off < 512.0 && jmod(off, 8.0) == 0.0 {
                    Some(AV::Rec {
                        i: off / 8.0,
                        off: 0.0,
                    })
                } else {
                    None
                }
            }
            AV::Ext { id, off } => ext_load(fl, id, off, size),
            AV::Rec { i, off } => {
                if off >= 88.0 {
                    return Some(AV::Val {
                        i,
                        f: format!(
                            "data[{}..{}]",
                            js_num(off - 88.0),
                            js_num(off - 88.0 + size as f64)
                        ),
                    });
                }
                if let Some(x) = rec_field(off) {
                    if x.1 == size || x.1 == 32 {
                        return Some(AV::Val { i, f: x.0.into() });
                    }
                }
                for o in [8.0, 40.0] {
                    if off > o && off < o + 32.0 {
                        return Some(AV::Val {
                            i,
                            f: rec_field(o).unwrap().0.into(),
                        });
                    }
                }
                None
            }
            AV::Rc { i, f, off } => {
                if off == 24.0 && size == 8 {
                    return Some(AV::Ptr {
                        i,
                        f: f.into(),
                        off: 0.0,
                        vo: false,
                    });
                }
                if f == "data" && off == 32.0 && size == 8 {
                    Some(AV::Val {
                        i,
                        f: "data_len".into(),
                    })
                } else {
                    None
                }
            }
            AV::Ptr { i, f, off, vo } => {
                if f != "data"
                    && (off < 0.0 || off + size as f64 > if f == "lamports" { 8.0 } else { 32.0 })
                {
                    return None;
                }
                let fld = if f == "data" {
                    if vo {
                        "data".to_string()
                    } else {
                        format!("data[{}..{}]", js_num(off), js_num(off + size as f64))
                    }
                } else {
                    f
                };
                Some(AV::Val { i, f: fld })
            }
            _ => None,
        }
    }
}

/// Account arrays an entrypoint fills in its frame through a cursor: (ptrs, infos) frame offsets
fn cursor_arrays(f: &Func, input: u32, d: &Defs) -> (Option<f64>, Option<f64>) {
    let ir = fir(f);
    let mut all: HashMap<u32, Vec<E>> = HashMap::default();
    for b in &f.blocks {
        for s in &b.stmts {
            if let Stmt::Set { dst, e, .. } = s {
                all.entry(*dst as u32).or_default().push(*e);
            }
        }
    }
    let step = |v: u32, n: u64| {
        all.get(&v).is_some_and(|l| {
            l.iter().any(|&e| match ir.get(e) {
                Node::Bin(BinOp::Add, a, b) => {
                    ir.get(a) == Node::Var(v) && ir.get(b) == Node::Const(n)
                }
                _ => false,
            })
        })
    };
    let start = |v: u32| {
        all.get(&v)
            .and_then(|l| l.iter().find_map(|&e| d.fp_off(e)))
    };
    let rec0 = |e: E| match ir.get(e) {
        Node::Var(id) => all.get(&id).is_some_and(|l| {
            l.iter().any(|&x| match ir.get(x) {
                Node::Bin(BinOp::Add, a, b) => {
                    ir.get(a) == Node::Var(input) && ir.get(b) == Node::Const(8)
                }
                _ => false,
            })
        }),
        _ => false,
    };
    let mut ptrs: Option<f64> = None;
    let mut infos: Option<f64> = None;
    let mut flags: IndexMap<u32, IndexSet<FK>> = IndexMap::default();
    let mut flagv: HashMap<u32, Vec<f64>> = HashMap::default();
    let mut keys: HashMap<u32, HashSet<FK>> = HashMap::default();
    for b in &f.blocks {
        for s in &b.stmts {
            let (addr, size, vals) = match s {
                Stmt::Store { addr, size, v, .. } => (*addr, *size, vec![*v]),
                Stmt::Stores {
                    addr, size, vals, ..
                } => (*addr, *size, ir.to_vec(*vals)),
                _ => continue,
            };
            let (base, off) = match ir.get(addr) {
                Node::Var(id) => (Some(id), 0.0),
                Node::Bin(BinOp::Add, a, c) => match (ir.get(a), ir.get(c)) {
                    (Node::Var(id), Node::Const(v)) => (Some(id), s_num(v)),
                    _ => (None, 0.0),
                },
                _ => (None, 0.0),
            };
            let Some(base) = base else { continue };
            if d.fp_off(addr).is_some() {
                continue;
            }
            if size == 8 && off == 0.0 && rec0(vals[0]) && step(base, 8) && ptrs.is_none() {
                ptrs = start(base);
            }
            if !step(base, 0x38) {
                continue;
            }
            if size == 1 {
                let x = flags.entry(base).or_default();
                let xv = flagv.entry(base).or_default();
                for i in 0..vals.len() {
                    if x.insert(FK::of(off + i as f64)) {
                        xv.push(off + i as f64);
                    }
                }
            }
            if size == 8 {
                keys.entry(base).or_default().insert(FK::of(off));
            }
        }
    }
    for (v, fl) in &flags {
        if let Some(o) = start(*v) {
            for &x in &flagv[v] {
                if fl.contains(&FK::of(x + 1.0))
                    && fl.contains(&FK::of(x + 2.0))
                    && keys.get(v).is_some_and(|k| k.contains(&FK::of(x - 48.0)))
                {
                    infos = Some(o + x - 48.0);
                    break;
                }
            }
        }
        if infos.is_some() {
            break;
        }
    }
    (ptrs, infos)
}

/// whether a function stores through its parameter n (itself or through the calls it passes it to)
fn writes_through<'a>(fl: &FlowCtx<'a>, g: &'a Func, n: i32, depth: i32) -> bool {
    let k = (g.pc, n, depth);
    if let Some(&x) = fl.cache.wt.borrow().get(&k) {
        return x;
    }
    fl.cache.wt.borrow_mut().insert(k, false);
    let Some(pv) = param_var(g, n) else {
        return false;
    };
    if g.blocks.len() > 2000 {
        return false;
    }
    let d = fl.defs_of(g, true);
    let ir = fir(g);
    fn of(ir: &Ir, d: &Defs, pv: u32, e: E, k: u32) -> bool {
        k < 6
            && match ir.get(e) {
                Node::Var(id) => {
                    id == pv || d.defs.get(&id).is_some_and(|&x| of(ir, d, pv, x, k + 1))
                }
                Node::Bin(BinOp::Add, a, b) => {
                    matches!(ir.get(b), Node::Const(_)) && of(ir, d, pv, a, k + 1)
                }
                _ => false,
            }
    }
    let mut r = false;
    'o: for b in &g.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Store { addr, .. } | Stmt::Stores { addr, .. }
                    if of(ir, &d, pv, *addr, 0) =>
                {
                    r = true;
                    break 'o;
                }
                Stmt::Copy { dst, .. } if of(ir, &d, pv, *dst, 0) => {
                    r = true;
                    break 'o;
                }
                _ => {}
            }
            let Some((ct, args)) = call_of(ir, s) else {
                continue;
            };
            if let Some(mc) = memcpy_of(ir, &ct, args, Some(&fl.callee)) {
                if of(ir, &d, pv, mc.0, 0) {
                    r = true;
                    break 'o;
                }
                continue;
            }
            let h = match &ct {
                CallTarget::Fn { pc } if depth > 0 => (fl.callee.f)(*pc),
                _ => None,
            };
            if let Some(h) = h {
                if !std::ptr::eq(h, g)
                    && ir.items(args).enumerate().any(|(j, a)| {
                        of(ir, &d, pv, a, 0) && writes_through(fl, h, j as i32 + 1, depth - 1)
                    })
                {
                    r = true;
                    break 'o;
                }
            }
        }
    }
    fl.cache.wt.borrow_mut().insert(k, r);
    r
}

/// the parameters (numbers) a function uses as an &[AccountInfo] by its own evidence
fn slice_params<'a>(fl: &FlowCtx<'a>, g: &'a Func, depth: i32) -> Rc<Vec<i32>> {
    let k = (
        g.pc,
        format!("{}{depth}", if fl.callee.legacy { "L" } else { "C" }),
    );
    if let Some(r) = fl.cache.slice.borrow().get(&k) {
        return r.clone();
    }
    fl.cache
        .slice
        .borrow_mut()
        .insert(k.clone(), Rc::new(Vec::new()));
    if g.blocks.len() > 4000 {
        return Rc::new(Vec::new());
    }
    let mut roots: IndexMap<u32, AV> = IndexMap::default();
    classify_roots(
        fl,
        g,
        fl.defs_of(g, true),
        &mut roots,
        None,
        true,
        None,
        None,
        depth,
    );
    let mut r: Vec<i32> = Vec::new();
    for v in &g.vars {
        if v.param >= 1
            && v.param <= 5
            && matches!(roots.get(&v.id), Some(AV::Slice { off }) if *off == 0.0)
            && !r.contains(&v.param)
        {
            r.push(v.param);
        }
    }
    let r = Rc::new(r);
    fl.cache.slice.borrow_mut().insert(k, r.clone());
    r
}

/// (accountResolver's first pass) the variables of f used as a slice / an array of record pointers: the
/// roots it adds (returned: the keys set, in order)
#[allow(clippy::too_many_arguments)]
fn classify_roots<'a>(
    fl: &FlowCtx<'a>,
    f: &'a Func,
    d: Rc<Defs<'a>>,
    roots: &mut IndexMap<u32, AV>,
    arr: Option<f64>,
    with_callee: bool,
    infos: Option<f64>,
    input: Option<u32>,
    depth: i32,
) -> Vec<u32> {
    let ir = fir(f);
    let ev = av_evaluator(
        f,
        d.clone(),
        roots.clone(),
        arr,
        with_callee,
        2,
        true,
        infos,
        None,
    );
    let legacy = with_callee && fl.callee.legacy;
    let mut hits: IndexMap<u32, IndexSet<FK>> = IndexMap::default();
    let mut elems: IndexMap<u32, IndexSet<FK>> = IndexMap::default();
    let mut rec_uses: HashMap<u32, i64> = HashMap::default();
    let mut info_ev: HashSet<u32> = HashSet::default();
    let mut misfit: HashSet<u32> = HashSet::default();
    let mut key_words: HashMap<(u32, FK), HashSet<FK>> = HashMap::default();
    let mut several: IndexSet<u32> = IndexSet::default();
    let elem_field = |a: &Option<AV>| match a {
        Some(AV::Elem { e, .. }) => info_field(legacy, jmod(e * 8.0, 48.0)),
        _ => None,
    };
    fn x30(ir: &Ir, d: &Defs, e: E, k: u32) -> bool {
        match ir.get(e) {
            Node::Bin(BinOp::Mul, a, b) => {
                (ir.get(b) == Node::Const(0x30) && !matches!(ir.get(a), Node::Const(_)))
                    || (ir.get(a) == Node::Const(0x30) && !matches!(ir.get(b), Node::Const(_)))
            }
            Node::Var(id) if k < 3 => d.defs.get(&id).is_some_and(|&x| x30(ir, d, x, k + 1)),
            _ => false,
        }
    }
    let rec_use = |rec_uses: &mut HashMap<u32, i64>, a: &Option<AV>, ok: bool| {
        if let (Some(AV::Elem { v, .. }), true) = (a, ok) {
            *rec_uses.entry(*v).or_insert(0) += 1;
        }
    };
    let add_to = |m: &mut IndexMap<u32, IndexSet<FK>>, v: u32, x: f64| {
        m.entry(v).or_default().insert(FK::of(x));
    };
    for (bi, b) in f.blocks.iter().enumerate() {
        let mut p = pos_of(bi, 0);
        let mut note = |x: E,
                        p: Pos,
                        hits: &mut IndexMap<u32, IndexSet<FK>>,
                        elems: &mut IndexMap<u32, IndexSet<FK>>,
                        rec_uses: &mut HashMap<u32, i64>,
                        info_ev: &mut HashSet<u32>,
                        misfit: &mut HashSet<u32>,
                        key_words: &mut HashMap<(u32, FK), HashSet<FK>>,
                        several: &mut IndexSet<u32>| {
            if let Node::Bin(BinOp::Add, xa, xb) = ir.get(x) {
                for (u, w) in [(xa, xb), (xb, xa)] {
                    if x30(ir, &d, w, 0) {
                        if let Some(AV::Base { v, off }) = ev.ev(fl, u, p, 0) {
                            if off == 0.0 {
                                several.insert(v);
                            }
                        }
                    }
                }
            }
            let Node::Load { size, addr } = ir.get(x) else {
                return;
            };
            let a = ev.ev(fl, addr, p, 0);
            if let Some(AV::Base { v, off: c }) = &a {
                if Some(*v) != input && *c >= 0.0 && *c < 48.0 * 64.0 {
                    let c = *c;
                    let fld = info_field(legacy, jmod(c, 48.0));
                    let fits = if size == 8 {
                        jmod(c, 8.0) == 0.0
                    } else {
                        size == 1 && jmod(c, 48.0) >= 40.0 && jmod(c, 48.0) <= 42.0
                    };
                    if !fits {
                        misfit.insert(*v);
                    }
                    if fld.is_some()
                        && (if size == 8 {
                            jmod(c, 48.0) < 40.0
                        } else {
                            size == 1 && jmod(c, 48.0) >= 40.0
                        })
                    {
                        add_to(hits, *v, (c / 48.0).floor());
                    }
                    if size == 1 && jmod(c, 48.0) >= 40.0 && fld.is_some() {
                        info_ev.insert(*v);
                    }
                    if size == 8 && jmod(c, 8.0) == 0.0 {
                        add_to(elems, *v, c / 8.0);
                    }
                }
            }
            let ef = elem_field(&a);
            if let Some(AV::Elem { v, e, off }) = &a {
                let lim = if ef == Some("key") || ef == Some("owner") {
                    32.0
                } else {
                    40.0
                };
                if ef.is_none()
                    || ef == Some("rent_epoch")
                    || *off < 0.0
                    || *off + size as f64 > lim
                {
                    misfit.insert(*v);
                }
                if size == 8 {
                    if ef == Some("data") && (*off == 24.0 || *off == 32.0) {
                        info_ev.insert(*v);
                    }
                    if (ef == Some("key") || ef == Some("owner"))
                        && *off < 32.0
                        && jmod(*off, 8.0) == 0.0
                    {
                        let w = key_words.entry((*v, FK::of(*e))).or_default();
                        w.insert(FK::of(*off));
                        if w.len() >= 2 {
                            info_ev.insert(*v);
                        }
                    }
                }
            }
            let ok = matches!(&a, Some(AV::Elem { off, .. }) if rec_field(*off).is_some_and(|r| r.1 == size));
            rec_use(rec_uses, &a, ok);
        };
        let cmp_note = |y: E, p: Pos, info_ev: &mut HashSet<u32>| {
            let Node::Fn(n, args) = ir.get(y) else { return };
            let nm = ir.name(n);
            let take = match &*nm {
                "memeq" => 2,
                "keyeq" => 1,
                _ => return,
            };
            for a in ir.items(args).take(take) {
                let x = ev.ev(fl, a, p, 0);
                if let Some(AV::Elem { v, off, .. }) = &x {
                    if *off < 32.0 && matches!(elem_field(&x), Some("key" | "owner")) {
                        info_ev.insert(*v);
                    }
                }
            }
        };
        for (i, s) in b.stmts.iter().enumerate() {
            p = pos_of(bi, i);
            for e in crate::util::stmt_exprs(ir, s) {
                let mut xs: Vec<E> = Vec::new();
                ir.walk(e, &mut |x, _| xs.push(x));
                for x in xs {
                    note(
                        x,
                        p,
                        &mut hits,
                        &mut elems,
                        &mut rec_uses,
                        &mut info_ev,
                        &mut misfit,
                        &mut key_words,
                        &mut several,
                    );
                }
            }
            let c = call_of(ir, s);
            if let Some((_, args)) = &c {
                for a in ir.items(*args) {
                    let x = ev.ev(fl, a, p, 0);
                    let ok =
                        matches!(&x, Some(AV::Elem { off, .. }) if *off == 8.0 || *off == 40.0);
                    rec_use(&mut rec_uses, &x, ok);
                    if let Some(AV::Elem { v, off, .. }) = &x {
                        if *off == 0.0 && matches!(elem_field(&x), Some("key" | "owner")) {
                            info_ev.insert(*v);
                        }
                    }
                }
            }
            let g = match &c {
                Some((CallTarget::Fn { pc }, _)) if depth > 0 && with_callee => (fl.callee.f)(*pc),
                _ => None,
            };
            if let Some(g) = g {
                if !std::ptr::eq(g, f) {
                    let ps = slice_params(fl, g, depth - 1);
                    if !ps.is_empty() {
                        for (j, a) in ir.items(c.as_ref().unwrap().1).enumerate() {
                            if !ps.contains(&(j as i32 + 1)) {
                                continue;
                            }
                            if let Some(AV::Base { v, off }) = ev.ev(fl, a, p, 0) {
                                if off == 0.0 && Some(v) != input {
                                    several.insert(v);
                                    info_ev.insert(v);
                                }
                            }
                        }
                    }
                }
            }
            for e in crate::util::stmt_exprs(ir, s) {
                let mut xs: Vec<E> = Vec::new();
                ir.walk(e, &mut |x, _| xs.push(x));
                for y in xs {
                    cmp_note(y, p, &mut info_ev);
                }
            }
            if let Stmt::Store { addr, .. } = s {
                let x = ev.ev(fl, *addr, p, 0);
                let ok = matches!(&x, Some(AV::Elem { off, .. }) if *off == 72.0);
                rec_use(&mut rec_uses, &x, ok);
            }
        }
        p = pos_of(bi, b.stmts.len());
        if let Term::Br { c, .. } = &b.term {
            let mut xs: Vec<E> = Vec::new();
            ir.walk(*c, &mut |x, _| xs.push(x));
            for &x in &xs {
                note(
                    x,
                    p,
                    &mut hits,
                    &mut elems,
                    &mut rec_uses,
                    &mut info_ev,
                    &mut misfit,
                    &mut key_words,
                    &mut several,
                );
            }
            for &y in &xs {
                cmp_note(y, p, &mut info_ev);
            }
        }
    }
    for &v in &several {
        hits.entry(v).or_default();
    }
    let mut set: Vec<u32> = Vec::new();
    for (v, ks) in &hits {
        if (ks.len() >= 2 || several.contains(v)) && info_ev.contains(v) && !misfit.contains(v) {
            roots.insert(*v, AV::Slice { off: 0.0 });
            if !set.contains(v) {
                set.push(*v);
            }
        }
    }
    for (v, ks) in &elems {
        if !roots.contains_key(v) && ks.len() >= 2 && rec_uses.get(v).copied().unwrap_or(0) >= 2 {
            roots.insert(*v, AV::Recs { off: 0.0 });
            set.push(*v);
        }
    }
    set
}

/// The account resolver of a native function (flow.ts accountResolver).
pub struct Resolver<'a> {
    pub f: &'a Func,
    d: Rc<Defs<'a>>,
    ev: Rc<AvEval<'a>>,
    pub by_name: IndexMap<String, AcctRef>,
    ext_memo: RefCell<HashMap<String, AV>>,
    with_callee: bool,
    pm: Rc<PdaMemo>,
}

fn seed_key(ck: &str, seed: &IndexMap<u32, AV>) -> String {
    if seed.is_empty() {
        return ck.to_string();
    }
    let v: Vec<String> = seed
        .iter()
        .map(|(k, x)| format!("[{k},{}]", x.json()))
        .collect();
    format!("{ck}[{}]", v.join(","))
}

pub fn account_resolver<'a>(
    fl: &FlowCtx<'a>,
    f: &'a Func,
    names: &[Option<String>],
    with_callee: bool,
    seed: Option<&IndexMap<u32, AV>>,
) -> Rc<Resolver<'a>> {
    let ck = if with_callee {
        if fl.callee.legacy {
            "L"
        } else {
            "C"
        }
    } else {
        "-"
    };
    let empty = IndexMap::default();
    let seed = seed.unwrap_or(&empty);
    let sk = (f.pc, seed_key(ck, seed));
    if let Some(r) = fl.cache.seed.borrow().get(&sk) {
        return r.clone();
    }
    let ir = fir(f);
    let input = if f.is_entry { param_var(f, 1) } else { None };
    let d = fl.defs_of(f, with_callee);
    let rec0 = |x: Option<E>| {
        let (Some(x), Some(inp)) = (x, input) else {
            return false;
        };
        matches!(ir.get(x), Node::Bin(BinOp::Add, a, b) if ir.get(a) == Node::Var(inp) && ir.get(b) == Node::Const(8))
    };
    let mut arr: Option<f64> = None;
    if input.is_some() {
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Store {
                    size: 8, addr, v, ..
                } = s
                {
                    let hit = rec0(Some(*v))
                        || match ir.get(*v) {
                            Node::Var(id) => rec0(d.defs.get(&id).copied()),
                            _ => false,
                        };
                    if hit {
                        if let Some(o) = d.fp_off(*addr) {
                            if arr.is_none_or(|a| o > a) {
                                arr = Some(o);
                            }
                        }
                    }
                }
            }
        }
    }
    let mut infos: Option<f64> = None;
    if let (Some(inp), None) = (input, arr) {
        let (p, i) = cursor_arrays(f, inp, &d);
        arr = p;
        infos = i;
    }
    let classify = |roots: &mut IndexMap<u32, AV>| {
        let k = {
            let v: Vec<String> = roots
                .iter()
                .map(|(v, x)| {
                    if matches!(x, AV::Ext { .. }) {
                        format!(r#"[{v},"ext"]"#)
                    } else {
                        format!("[{v},{}]", x.json())
                    }
                })
                .collect();
            (f.pc, format!("{ck}[{}]", v.join(",")))
        };
        let hit = fl.cache.classify.borrow().get(&k).cloned();
        match hit {
            None => {
                let set =
                    classify_roots(fl, f, d.clone(), roots, arr, with_callee, infos, input, 2);
                // (the entries whose value classify set, in the map's order)
                let y: Vec<(u32, AV)> = roots
                    .iter()
                    .filter(|(v, _)| set.contains(v))
                    .map(|(v, x)| (*v, x.clone()))
                    .collect();
                fl.cache.classify.borrow_mut().insert(k, y);
            }
            Some(y) => {
                for (v, x) in y {
                    roots.insert(v, x);
                }
            }
        }
    };
    let mut roots: IndexMap<u32, AV> = seed
        .iter()
        .filter(|(_, x)| !matches!(x, AV::Ext { .. }))
        .map(|(v, x)| (*v, x.clone()))
        .collect();
    let exts: Vec<(u32, AV)> = seed
        .iter()
        .filter(|(_, x)| matches!(x, AV::Ext { .. }))
        .map(|(v, x)| (*v, x.clone()))
        .collect();
    if !exts.is_empty() {
        let mut r1 = roots.clone();
        classify(&mut r1);
        for (v, x) in exts {
            let nv = match r1.get(&v) {
                Some(y @ AV::Recs { .. }) => y.clone(),
                _ => x,
            };
            roots.insert(v, nv);
        }
    }
    classify(&mut roots);
    let has_roots = !roots.is_empty();
    let ev = av_evaluator(
        f,
        d.clone(),
        roots.clone(),
        arr,
        with_callee,
        2,
        false,
        infos,
        None,
    );
    let mut by_name: IndexMap<String, AcctRef> = IndexMap::default();
    if has_roots || arr.is_some() || infos.is_some() {
        for (v, e) in &d.defs {
            let Some(Some(nm)) = names.get(*v as usize) else {
                continue;
            };
            let Some(a) = ev.ev(fl, *e, d.def_pos[v], 0) else {
                continue;
            };
            match a {
                AV::Rec { i, off } if off == 0.0 => {
                    by_name.insert(
                        nm.clone(),
                        AcctRef {
                            index: i,
                            field: None,
                        },
                    );
                }
                AV::Slice { off } if jmod(off, 48.0) == 0.0 => {
                    by_name.insert(
                        nm.clone(),
                        AcctRef {
                            index: off / 48.0,
                            field: None,
                        },
                    );
                }
                AV::Ptr { i, f, off, .. } if f == "key" && off == 0.0 => {
                    by_name.insert(
                        nm.clone(),
                        AcctRef {
                            index: i,
                            field: None,
                        },
                    );
                }
                _ => {}
            }
        }
    }
    for (v, a) in &roots {
        if let (AV::Slice { .. }, Some(Some(nm))) = (a, names.get(*v as usize)) {
            by_name.insert(
                nm.clone(),
                AcctRef {
                    index: 0.0,
                    field: None,
                },
            );
        }
    }
    let pm = {
        let k = (f.pc, with_callee);
        let x = fl.cache.pda.borrow().get(&k).cloned();
        match x {
            Some(x) => x,
            None => {
                let x = Rc::new(PdaMemo::default());
                fl.cache.pda.borrow_mut().insert(k, x.clone());
                x
            }
        }
    };
    let r = Rc::new(Resolver {
        f,
        d,
        ev,
        by_name,
        ext_memo: RefCell::new(HashMap::default()),
        with_callee,
        pm,
    });
    fl.cache.seed.borrow_mut().insert(sk, r.clone());
    r
}

fn as_ref_(a: Option<AV>) -> Option<AcctRef> {
    match a? {
        AV::Val { i, f } => Some(AcctRef {
            index: i,
            field: Some(f),
        }),
        AV::Ptr { i, f, off, vo } => Some(AcctRef {
            index: i,
            field: Some(if f == "data" {
                if vo {
                    "data".into()
                } else {
                    format!("data[{}..{}]", js_num(off), js_num(off + 32.0))
                }
            } else {
                f
            }),
        }),
        AV::Rec { i, off } => {
            if off >= 88.0 {
                return Some(AcctRef {
                    index: i,
                    field: Some(format!(
                        "data[{}..{}]",
                        js_num(off - 88.0),
                        js_num(off - 88.0 + 32.0)
                    )),
                });
            }
            match rec_field(off) {
                Some((n, 32)) => Some(AcctRef {
                    index: i,
                    field: Some(n.into()),
                }),
                _ => None,
            }
        }
        _ => None,
    }
}

impl<'a> Resolver<'a> {
    fn ir(&self) -> &'a Ir {
        fir(self.f)
    }
    pub fn av(&self, fl: &FlowCtx<'a>, e: E, p: Pos) -> Option<AV> {
        self.ev.ev(fl, e, p, 0)
    }
    pub fn value_at(&self, fl: &FlowCtx<'a>, e: E, p: Pos) -> Option<AcctRef> {
        as_ref_(self.av(fl, e, p))
    }
    /// the position of a condition (by identity), else the end of block b
    fn at(&self, e: E, b: Option<usize>) -> Option<Pos> {
        if let Some(&p) = self.d.pos_e.get(&e) {
            return Some(p);
        }
        if let Some(b) = b {
            if b < self.f.blocks.len() {
                return Some(pos_of(b, self.f.blocks[b].stmts.len()));
            }
        }
        match self.ir().get(e) {
            Node::Lnot(a) => self.at(a, None),
            _ => None,
        }
    }
    /// the two pointers of a 32-byte comparison
    fn cmp_args(&self, x: E) -> Option<(E, E)> {
        let ir = self.ir();
        let args = match ir.get(x) {
            Node::Call(_, a) => a,
            Node::Fn(n, a) if &*ir.name(n) == "memeq" => a,
            _ => return None,
        };
        if args.len >= 3 && ir.get(ir.at(args, 2)) == Node::Const(0x20) {
            Some((ir.at(args, 0), ir.at(args, 1)))
        } else {
            None
        }
    }
    /// through casts and variables holding a call's result
    fn follow(&self, fl: &FlowCtx<'a>, e: E, p: Pos) -> (E, Pos) {
        let ir = self.ir();
        let (mut e, mut p) = (e, p);
        for _ in 0..4 {
            match ir.get(e) {
                Node::Ext { a, .. } => {
                    e = a;
                    continue;
                }
                Node::Var(id) => {
                    let Some((y, q)) = self.d.def_at(fl, id, p) else {
                        break;
                    };
                    let u = match ir.get(y) {
                        Node::Ext { a, .. } => a,
                        _ => y,
                    };
                    if !matches!(ir.get(u), Node::Call(..) | Node::Var(_)) {
                        break;
                    }
                    e = y;
                    p = q;
                }
                _ => break,
            }
        }
        (e, p)
    }
    /// account fields an expression (a branch condition, else evaluated at the end of block b) reads
    pub fn refs(&self, fl: &FlowCtx<'a>, e: E, b: Option<usize>) -> Vec<AcctRef> {
        let Some(p0) = self.at(e, b) else {
            return vec![];
        };
        let ir = self.ir();
        let mut out: Vec<AcctRef> = Vec::new();
        let push = |out: &mut Vec<AcctRef>, r: Option<AcctRef>| {
            if let Some(r) = r {
                if !out.iter().any(|y| y.index == r.index && y.field == r.field) {
                    out.push(r);
                }
            }
        };
        let mut xs: Vec<E> = Vec::new();
        ir.walk(e, &mut |x, _| xs.push(x));
        for x in xs {
            let n = ir.get(x);
            if matches!(n, Node::Load { .. } | Node::Var(_)) {
                if let Some(a @ AV::Val { .. }) = self.av(fl, x, p0) {
                    push(&mut out, as_ref_(Some(a)));
                }
            }
            let (y, p) = if matches!(n, Node::Var(_)) {
                self.follow(fl, x, p0)
            } else {
                (x, p0)
            };
            if let Some((q0, q1)) = self.cmp_args(y) {
                for q in [q0, q1] {
                    let r = as_ref_(self.av(fl, q, p));
                    push(&mut out, r);
                }
            }
            if let Node::Fn(nm, args) = ir.get(y) {
                if &*ir.name(nm) == "keyeq" {
                    let r = as_ref_(self.av(fl, ir.at(args, 0), p));
                    push(&mut out, r);
                }
            }
        }
        out
    }
    /// the account field a store writes (by the statement's position), how
    pub fn store(
        &self,
        fl: &FlowCtx<'a>,
        p: Option<Pos>,
    ) -> Option<(AcctRef, Option<&'static str>)> {
        let p = p?;
        let r = self.store0(fl, p)?;
        let s = &self.f.blocks[(p >> 16) as usize].stmts[(p & 0xffff) as usize];
        Some(match s {
            Stmt::Store { v, .. } => (r, Some(arith_how(fl, &self.d, *v, p))),
            _ => (r, None),
        })
    }
    fn store0(&self, fl: &FlowCtx<'a>, p: Pos) -> Option<AcctRef> {
        let ir = self.ir();
        let s = &self.f.blocks[(p >> 16) as usize].stmts[(p & 0xffff) as usize];
        let c = call_of(ir, s);
        if let Some((ct, args)) = &c {
            let nm = match ct {
                CallTarget::Sys { name, .. } => name.to_string(),
                CallTarget::Fn { pc } => {
                    if self.with_callee {
                        (fl.callee.name)(*pc)
                    } else {
                        String::new()
                    }
                }
                _ => String::new(),
            };
            if crate::jre!(r"^(sol_)?(memset|memcpy|memmove)_?$").is_match(&nm) && args.len >= 3 {
                let a = self.av(fl, ir.at(*args, 0), p);
                let n = match ir.get(ir.at(*args, 2)) {
                    Node::Const(v) => Some(v as f64),
                    _ => None,
                };
                let dd = match &a {
                    Some(AV::Ptr { i, f, off, .. }) if f == "data" => Some((*i, *off)),
                    Some(AV::Rec { i, off }) if *off >= 88.0 => Some((*i, off - 88.0)),
                    _ => None,
                };
                if let Some(AV::Ptr { i, vo: true, .. }) = &a {
                    return Some(AcctRef {
                        index: *i,
                        field: Some("data".into()),
                    });
                }
                let (i, o) = dd?;
                return Some(AcctRef {
                    index: i,
                    field: Some(match n {
                        None => {
                            if o != 0.0 {
                                format!("data[{}..]", js_num(o))
                            } else {
                                "data".into()
                            }
                        }
                        Some(n) => format!("data[{}..{}]", js_num(o), js_num(o + n)),
                    }),
                });
            }
            let g = match ct {
                CallTarget::Fn { pc } if self.with_callee => (fl.callee.f)(*pc),
                _ => None,
            };
            if let Some(g) = g {
                if !std::ptr::eq(g, self.f) {
                    for (j, a) in ir.items(*args).enumerate() {
                        let x = self.av(fl, a, p);
                        if let Some(AV::Ptr { i, f, .. }) = &x {
                            if f == "data" && writes_through(fl, g, j as i32 + 1, 2) {
                                return Some(AcctRef {
                                    index: *i,
                                    field: Some("data".into()),
                                });
                            }
                        }
                    }
                }
            }
        }
        let (target, n) = match s {
            Stmt::Store { addr, size, .. } => (*addr, *size as f64),
            Stmt::Stores {
                addr, size, vals, ..
            } => (*addr, *size as f64 * vals.len as f64),
            Stmt::Copy { dst, n, .. } => (*dst, *n as f64),
            _ => return None,
        };
        let a = self.av(fl, target, p);
        match &a {
            Some(AV::Ptr { i, f, off, vo }) => {
                if f == "data" && !vo && *off == -8.0 && n == 8.0 && matches!(s, Stmt::Store { .. })
                {
                    return Some(AcctRef {
                        index: *i,
                        field: Some("data_len".into()),
                    });
                }
                if f == "lamports" || f == "data" {
                    return Some(AcctRef {
                        index: *i,
                        field: Some(if f == "lamports" {
                            "lamports".into()
                        } else if *vo {
                            "data".into()
                        } else {
                            format!("data[{}..{}]", js_num(*off), js_num(off + n))
                        }),
                    });
                }
                if f == "owner" && *off >= 0.0 && off + n <= 32.0 {
                    return Some(AcctRef {
                        index: *i,
                        field: Some("owner".into()),
                    });
                }
            }
            Some(AV::Rec { i, off }) => {
                if *off >= 40.0 && off + n <= 72.0 {
                    return Some(AcctRef {
                        index: *i,
                        field: Some("owner".into()),
                    });
                }
                if *off == 72.0 && matches!(s, Stmt::Store { size: 8, .. }) {
                    return Some(AcctRef {
                        index: *i,
                        field: Some("lamports".into()),
                    });
                }
                if *off >= 88.0 {
                    return Some(AcctRef {
                        index: *i,
                        field: Some(format!(
                            "data[{}..{}]",
                            js_num(off - 88.0),
                            js_num(off - 88.0 + n)
                        )),
                    });
                }
            }
            _ => {}
        }
        None
    }
    /// the call that wrote the frame bytes a pointer points to
    fn origin(&self, fl: &FlowCtx<'a>, e: E, p: Pos, d: u32) -> Option<(CallTarget, sbpf_ir::L)> {
        let ir = self.ir();
        let (mut e, mut p, mut d) = (e, p, d);
        let mut k = 0;
        while k < 6 && d < 12 {
            match ir.get(e) {
                Node::Ext { a, .. } => e = a,
                Node::Var(id) => {
                    let (y, q) = self.d.def_at(fl, id, p)?;
                    e = y;
                    p = q;
                }
                _ => break,
            }
            k += 1;
            d += 1;
        }
        let o = self.d.fp_off(e)?;
        let (mut x, mut q) = self.d.reaching(fl, slot(o), p, true)?;
        if let Node::Call(t, args) = ir.get(x) {
            return Some((ir.target(t), args));
        }
        let mut k = 0;
        while k < 6 {
            match ir.get(x) {
                Node::Ext { a, .. } => x = a,
                Node::Var(id) => {
                    let (y, qq) = self.d.def_at(fl, id, q)?;
                    x = y;
                    q = qq;
                }
                _ => break,
            }
            k += 1;
        }
        match ir.get(x) {
            Node::Load { addr, .. } if d < 12 => self.origin(fl, addr, q, d + 1),
            _ => None,
        }
    }
    /// a PDA derivation: by name, or a function making the syscall (2 levels)
    fn pda_call(&self, fl: &FlowCtx<'a>, t: &CallTarget, d: u32) -> bool {
        match t {
            CallTarget::Sys { name, .. } => name.contains("program_address"),
            CallTarget::Fn { pc } => {
                if !self.with_callee {
                    return false;
                }
                if (fl.callee.name)(*pc).contains("program_address") {
                    return true;
                }
                let g = if d < 2 { (fl.callee.f)(*pc) } else { None };
                let Some(g) = g else { return false };
                let gir = fir(g);
                g.blocks.iter().any(|b| {
                    b.stmts.iter().any(|s| match call_of(gir, s) {
                        Some((ct, _)) => {
                            !matches!(ct, CallTarget::Ind { .. }) && self.pda_call(fl, &ct, d + 1)
                        }
                        None => false,
                    }) || match &b.term {
                        Term::Br { c, .. } => {
                            let mut in_cond = false;
                            let mut xs: Vec<E> = Vec::new();
                            gir.walk(*c, &mut |x, _| xs.push(x));
                            for x in xs {
                                if !in_cond {
                                    if let Node::Call(t, _) = gir.get(x) {
                                        let t = gir.target(t);
                                        if !matches!(t, CallTarget::Ind { .. }) {
                                            in_cond = self.pda_call(fl, &t, d + 1);
                                        }
                                    }
                                }
                            }
                            in_cond
                        }
                        _ => false,
                    }
                })
            }
            _ => false,
        }
    }
    fn side(&self, fl: &FlowCtx<'a>, e: E, p: Pos) -> Side {
        let ir = self.ir();
        if let Some(r) = as_ref_(self.av(fl, e, p)) {
            return Side::Acct(r);
        }
        let mut st = false;
        ir.walk(e, &mut |x, _| {
            if self.d.fp_off(x).is_some() {
                st = true;
            }
        });
        if st {
            let w = self.av(fl, ir.load(8, e), p);
            if let Some(AV::Val { i, f }) = &w {
                let m = crate::jre!(r"^data\[(\d+)\.\.\d+\]$")
                    .captures(f)
                    .map(|m| m[1].to_string());
                if m.is_some() || f == "key" || f == "owner" {
                    return Side::Acct(AcctRef {
                        index: *i,
                        field: Some(match m {
                            Some(m) => {
                                format!("data[{m}..{}]", js_num(super::js_number(&m) + 32.0))
                            }
                            None => f.clone(),
                        }),
                    });
                }
            }
            if let Some((t, _)) = self.origin(fl, e, p, 0) {
                if self.pda_call(fl, &t, 0) {
                    return Side::Pda;
                }
            }
            return Side::Stack;
        }
        match ir.get(e) {
            Node::Const(_) => Side::Const,
            Node::Var(id)
                if matches!(
                    self.d.defs.get(&id).map(|&x| ir.get(x)),
                    Some(Node::Const(_))
                ) =>
            {
                Side::Const
            }
            _ => Side::None,
        }
    }
    /// a word of a PDA derivation's output (in the frame) a value is loaded from: (buffer, word offset)
    fn pda_word(&self, fl: &FlowCtx<'a>, e: E, p: Pos) -> Option<(f64, f64)> {
        let ir = self.ir();
        let (mut x, mut q) = (e, p);
        let mut k = 0;
        while k < 6 && matches!(ir.get(x), Node::Ext { .. } | Node::Var(_)) {
            match ir.get(x) {
                Node::Ext { a, .. } => x = a,
                Node::Var(id) => {
                    let (y, qq) = self.d.def_at(fl, id, q)?;
                    x = y;
                    q = qq;
                }
                _ => unreachable!(),
            }
            k += 1;
        }
        let Node::Load { size: 8, addr } = ir.get(x) else {
            return None;
        };
        let o = self.d.fp_off(addr)?;
        let (t, args) = self.origin(fl, addr, q, 0)?;
        if !self.pda_call(fl, &t, 0) {
            return None;
        }
        let bs: Vec<f64> = ir
            .items(args)
            .filter_map(|a| {
                let a2 = match ir.get(a) {
                    Node::Var(id) => self.d.defs.get(&id).copied().unwrap_or(a),
                    _ => a,
                };
                self.d.fp_off(a2)
            })
            .filter(|&b| o - b >= 0.0 && o - b < 32.0 && jmod(o - b, 8.0) == 0.0)
            .collect();
        if bs.is_empty() {
            return None;
        }
        let m = bs.iter().copied().fold(f64::NEG_INFINITY, f64::max);
        Some((m, o - m))
    }
    fn pda_eqs(&self, fl: &FlowCtx<'a>, c: E, p: Pos) -> Rc<Vec<(f64, f64, E)>> {
        if let Some(y) = self.pm.eqs.borrow().get(&(c, p)) {
            return y.clone();
        }
        let ir = self.ir();
        let mut out: Vec<(f64, f64, E)> = Vec::new();
        let mut xs: Vec<E> = Vec::new();
        ir.walk(c, &mut |x, _| xs.push(x));
        for x in xs {
            let Node::Cmp(op, a, b) = ir.get(x) else {
                continue;
            };
            if op != sbpf_ir::CmpOp::Eq && op != sbpf_ir::CmpOp::Ne {
                continue;
            }
            let wa = self.pda_word(fl, a, p);
            let wb = self.pda_word(fl, b, p);
            match (wa, wb) {
                (Some(w), None) => out.push((w.0, w.1, b)),
                (None, Some(w)) => out.push((w.0, w.1, a)),
                _ => {}
            }
        }
        let y = Rc::new(out);
        self.pm.eqs.borrow_mut().insert((c, p), y.clone());
        y
    }
    /// the PDA outputs whose 4 words are all compared: the other value of c's equality with one
    fn pda_chain(&self, fl: &FlowCtx<'a>, c: E, p: Pos) -> Option<E> {
        let full = {
            let x = self.pm.full.borrow().clone();
            match x {
                Some(x) => x,
                None => {
                    let mut seen: IndexMap<FK, (f64, HashSet<FK>)> = IndexMap::default();
                    for (bi, b) in self.f.blocks.iter().enumerate() {
                        if let Term::Br { c, .. } = &b.term {
                            for (o, w, _) in self.pda_eqs(fl, *c, pos_of(bi, b.stmts.len())).iter()
                            {
                                seen.entry(FK::of(*o))
                                    .or_insert_with(|| (*o, HashSet::default()))
                                    .1
                                    .insert(FK::of(*w));
                            }
                        }
                    }
                    let v: Vec<f64> = seen
                        .values()
                        .filter(|x| x.1.len() == 4)
                        .map(|x| x.0)
                        .collect();
                    let v = Rc::new(v);
                    *self.pm.full.borrow_mut() = Some(v.clone());
                    v
                }
            }
        };
        if full.is_empty() {
            return None;
        }
        self.pda_eqs(fl, c, p)
            .iter()
            .find(|x| full.contains(&x.0))
            .map(|x| x.2)
    }
    /// the two sides of an equality (key / field compares)
    pub fn sides(&self, fl: &FlowCtx<'a>, c: E, b: Option<usize>) -> Option<(Side, Side)> {
        let p0 = self.at(c, b)?;
        let ir = self.ir();
        if let Some(pw) = self.pda_chain(fl, c, p0) {
            let r = as_ref_(self.av(fl, pw, p0));
            return Some((
                match r {
                    Some(r) if r.field.as_deref() == Some("key") => Side::Acct(r),
                    _ => Side::None,
                },
                Side::Pda,
            ));
        }
        let mut x = c;
        while let Node::Lnot(a) = ir.get(x) {
            x = a;
        }
        if let Node::Land(a, bb) | Node::Lor(a, bb) = ir.get(x) {
            let ss: Vec<(Side, Side)> = [self.sides(fl, a, b), self.sides(fl, bb, b)]
                .into_iter()
                .flatten()
                .collect();
            let obj = |s: &Side| matches!(s, Side::Acct(_));
            if let Some(s) = ss.iter().find(|s| obj(&s.0) && obj(&s.1)) {
                return Some(s.clone());
            }
            if let Some(s) = ss.iter().find(|s| {
                [&s.0, &s.1]
                    .iter()
                    .any(|y| matches!(y, Side::Acct(r) if r.field.as_deref() == Some("key")))
            }) {
                return Some(s.clone());
            }
            return ss.into_iter().next();
        }
        let cmp = |e: E| -> Option<(Side, Side)> {
            let (y, p) = self.follow(fl, e, p0);
            let (a0, a1) = self.cmp_args(y)?;
            Some((self.side(fl, a0, p), self.side(fl, a1, p)))
        };
        if let Node::Cmp(op, a, bb) = ir.get(x) {
            if op == sbpf_ir::CmpOp::Eq || op == sbpf_ir::CmpOp::Ne {
                if let Some(r) = cmp(a).or_else(|| cmp(bb)) {
                    return Some(r);
                }
                let ra = as_ref_(self.av(fl, a, p0));
                let rb = as_ref_(self.av(fl, bb, p0));
                if ra.is_some() || rb.is_some() {
                    return Some((
                        ra.map_or(Side::None, Side::Acct),
                        rb.map_or(Side::None, Side::Acct),
                    ));
                }
                return None;
            }
        }
        cmp(x)
    }
    /// the account field an expression of a statement is (by the statement's position)
    pub fn value_ref(&self, fl: &FlowCtx<'a>, e: E, p: Option<Pos>) -> Option<AcctRef> {
        as_ref_(self.av(fl, e, p?))
    }
    /// a condition on a 32-byte comparison (memcmp / memeq)
    pub fn cmp32(&self, fl: &FlowCtx<'a>, c: E, b: Option<usize>) -> bool {
        let Some(p0) = self.at(c, b) else {
            return false;
        };
        let ir = self.ir();
        let mut hit = false;
        let mut xs: Vec<E> = Vec::new();
        ir.walk(c, &mut |x, _| xs.push(x));
        for x in xs {
            if !hit && matches!(ir.get(x), Node::Var(_) | Node::Call(..) | Node::Fn(..)) {
                let y = if matches!(ir.get(x), Node::Var(_)) {
                    self.follow(fl, x, p0).0
                } else {
                    x
                };
                hit = self.cmp_args(y).is_some();
            }
        }
        hit || self.pda_chain(fl, c, p0).is_some()
    }
    /// a word equality of a PDA compared word by word: the word's offset
    pub fn pda_eq(&self, fl: &FlowCtx<'a>, c: E, b: Option<usize>) -> Option<f64> {
        let p0 = self.at(c, b)?;
        let x = self.pda_chain(fl, c, p0)?;
        self.pda_eqs(fl, c, p0)
            .iter()
            .find(|y| y.2 == x)
            .map(|y| y.1)
    }
    /// the PDA derivations a condition compares: the frame offsets of their calls' pointer arguments
    pub fn pda_bufs(&self, fl: &FlowCtx<'a>, c: E, b: Option<usize>) -> Vec<f64> {
        let Some(p0) = self.at(c, b) else {
            return vec![];
        };
        let ir = self.ir();
        let mut out: IndexSet<FK> = IndexSet::default();
        let mut outv: Vec<f64> = Vec::new();
        let mut add = |o: f64, out: &mut IndexSet<FK>| {
            if out.insert(FK::of(o)) {
                outv.push(o);
            }
        };
        for (o, _, _) in self.pda_eqs(fl, c, p0).iter() {
            add(*o, &mut out);
        }
        let mut seen: HashSet<E> = HashSet::default();
        let mut todo: Vec<(E, Pos, u32)> = vec![(c, p0, 0)];
        // (a walk per expression, in the TS order: depth-first, a variable's definition scanned where it is met)
        fn scan<'a>(
            r: &Resolver<'a>,
            fl: &FlowCtx<'a>,
            e: E,
            p: Pos,
            d: u32,
            seen: &mut HashSet<E>,
            found: &mut Vec<f64>,
        ) {
            let ir = r.ir();
            let mut xs: Vec<E> = Vec::new();
            ir.walk(e, &mut |x, _| xs.push(x));
            // (walkExpr visits parents before children; a seen node's children are still walked)
            for x in xs {
                if !seen.insert(x) {
                    continue;
                }
                if let Some((a0, a1)) = r.cmp_args(x) {
                    for a in [a0, a1] {
                        let (y, q) = r.follow(fl, a, p);
                        let g = if r.d.fp_off(y).is_some() {
                            r.origin(fl, y, q, 0)
                        } else {
                            None
                        };
                        if let Some((t, args)) = g {
                            if r.pda_call(fl, &t, 0) {
                                for z in ir.items(args) {
                                    if let Some(o) = r.d.fp_off(z) {
                                        found.push(o);
                                    }
                                }
                            }
                        }
                    }
                }
                if let Node::Var(id) = ir.get(x) {
                    if d < 3 {
                        if let Some((y, q)) = r.d.def_at(fl, id, p) {
                            scan(r, fl, y, q, d + 1, seen, found);
                        }
                    }
                }
            }
        }
        let (c0, p00, d0) = todo.pop().unwrap();
        let mut found: Vec<f64> = Vec::new();
        scan(self, fl, c0, p00, d0, &mut seen, &mut found);
        for o in found {
            add(o, &mut out);
        }
        outv
    }
}

/// seed: a callee's parameters bound to the caller's values at a call (see ctxResolver)
pub fn seed_from<'a>(
    fl: &FlowCtx<'a>,
    pr: Option<&Rc<Resolver<'a>>>,
    pf: Option<&'a Func>,
    c: Option<(CallTarget, sbpf_ir::L)>,
    pos: Pos,
    fo: &'a Func,
    fn_: i64,
) -> IndexMap<u32, AV> {
    let mut seed: IndexMap<u32, AV> = IndexMap::default();
    let (Some(pr), Some(pf), Some((ct, args))) = (pr, pf, c) else {
        return seed;
    };
    let CallTarget::Fn { pc } = ct else {
        return seed;
    };
    if pc != fn_ {
        return seed;
    }
    let pfp = fp_of(pf);
    let pir = fir(pf);
    for (j, a) in pir.items(args).enumerate() {
        let v = pr.av(fl, a, pos);
        let pv = param_var(fo, j as i32 + 1);
        let (Some(v), Some(pv)) = (v, pv) else {
            continue;
        };
        match v {
            AV::Slice { .. }
            | AV::Recs { .. }
            | AV::Rec { .. }
            | AV::Ptr { .. }
            | AV::Rc { .. }
            | AV::Ext { .. } => {
                seed.insert(pv, v);
            }
            AV::Fr { off } => {
                let k = format!("{pos}|{pfp}|{}", js_num(off));
                let x = pr.ext_memo.borrow().get(&k).cloned();
                let x = match x {
                    Some(x) => x,
                    None => {
                        let ld = ExtLoader {
                            ev: pr.ev.clone(),
                            p: pos,
                            d: 0,
                            fpv: pfp,
                        };
                        let x = ext_of(fl, ld, off);
                        pr.ext_memo.borrow_mut().insert(k, x.clone());
                        x
                    }
                };
                seed.insert(pv, x);
            }
            _ => {}
        }
    }
    seed
}

#[allow(dead_code)]
fn unused(_: &Weak<u8>) {}
