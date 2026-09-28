//! decompile.ts phase 4 printing: stripUndef, outlining, per-function names and view types, the
//! printing hooks (typed views, account fields, input fields, frame objects and regions, strings, keys,
//! Result tags, stored strings, CPI / PDA / fmt notes), the function texts and the outlined helpers.

use crate::accounts::{account_addr, account_field};
use crate::analysis::acct::account_resolver;
use crate::analysis::facts::{function_facts, FnFacts, FnInput, NodeKey, SiteNote, StoreRef};
use crate::analysis::flow::{cfg_of, decision_block, pos_of, Callee, Cfg, FlowCtx};
use crate::cpi::{cpi_desc, find_cpi_sites, format_ix, site_objects, CpiEnv, CpiSite, SiteKind};
use crate::cpiexec::{describe_model, ExecBudget, ExecSiteKind};
use crate::decompile::{
    call_insns, invoke_abi, pascal_ix, pda_abi, Dx, FrameClaim, IxRow, ReadFunc, ReadOut,
    GENERIC_RESULT, RESERVED_TS,
};
use crate::frameregions::{frame_regions, innermost, Act, RegionCfg, Regions, Root};
use crate::outline::{find_outlines, OutlineFn, Outlines};
use crate::taint::expr_tainted;
use crate::types::key_compares;
use crate::util::*;
use crate::views::{Views, FT};
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, Term, E};
use sbpf_print::print::{declarations_of, fmt_const, print_nodes, Printer, Role, Sugar};
use sbpf_print::raw::{ShortNames, PARAM_NAME};
use sbpf_program::Func;
use sbpf_struct::{SNode, Tree};
use std::cell::{Cell, RefCell};
use sbpf_ir::fx::{HashMap, HashSet};
use std::rc::Rc;

const BUILTIN_NAMES: &[&str] = &[
    "AccountInfo",
    "LamportsCell",
    "Lamports",
    "DataCell",
    "AccountRecord",
    "SolInstruction",
    "SolAccountMeta",
    "StableInstruction",
    "AccountMeta",
    "Slice",
    "SeedList",
    "U128",
    "FmtArguments",
    "FmtArgumentsSpecsFirst",
    "FmtArg",
    "Tagged8",
    "Tagged16",
    "Tagged32",
    "Tagged64",
    "Result64",
    "Input",
];
const ARRAY_VIEWS: &[&str] = &[
    "SolAccountMeta",
    "AccountMeta",
    "Slice",
    "SeedList",
    "FmtArg",
];

fn builtin_name(t: &str) -> bool {
    BUILTIN_NAMES.contains(&t)
}

/// undefOnly: variables whose every definition is `x = undef`.
fn undef_only(ir: &Ir, tree: &Tree, ns: &[SNode], is_param: &dyn Fn(u32) -> bool) -> HashSet<u32> {
    let mut undef: IndexSet<u32> = IndexSet::default();
    let mut other: HashSet<u32> = HashSet::default();
    fn walk(
        ir: &Ir,
        tree: &Tree,
        xs: &[SNode],
        undef: &mut IndexSet<u32>,
        other: &mut HashSet<u32>,
    ) {
        for n in xs {
            match n {
                SNode::Stmt(si) => {
                    let s = tree.stmt(*si);
                    if let Some(d) = dst_of(s) {
                        if matches!(s, Stmt::Set { e, .. } if ir.get(*e) == Node::Undef) {
                            undef.insert(d);
                        } else {
                            other.insert(d);
                        }
                    }
                }
                SNode::If { then, els, .. } => {
                    walk(ir, tree, then, undef, other);
                    walk(ir, tree, els, undef, other);
                }
                SNode::Block { body, .. } | SNode::Loop { body, .. } => {
                    walk(ir, tree, body, undef, other)
                }
                SNode::Switch { cases, .. } => {
                    for c in cases {
                        walk(ir, tree, &c.1, undef, other);
                    }
                }
                SNode::SetState { v, .. } => {
                    other.insert(*v);
                }
                _ => {}
            }
        }
    }
    walk(ir, tree, ns, &mut undef, &mut other);
    undef
        .into_iter()
        .filter(|v| !other.contains(v) && !is_param(*v))
        .collect()
}

fn strip_undef(ir: &Ir, tree: &Tree, ns: &[SNode], only: &HashSet<u32>) -> Vec<SNode> {
    let mut out = Vec::new();
    for n in ns {
        match n {
            SNode::Stmt(si) => {
                if let Stmt::Set { dst, e, .. } = tree.stmt(*si) {
                    if ir.get(*e) == Node::Undef && *dst >= 0 && only.contains(&(*dst as u32)) {
                        continue;
                    }
                }
                out.push(n.clone());
            }
            SNode::If { c, then, els } => out.push(SNode::If {
                c: *c,
                then: strip_undef(ir, tree, then, only),
                els: strip_undef(ir, tree, els, only),
            }),
            SNode::Block { label, body } => out.push(SNode::Block {
                label: *label,
                body: strip_undef(ir, tree, body, only),
            }),
            SNode::Loop {
                label,
                body,
                form,
                c,
            } => out.push(SNode::Loop {
                label: *label,
                body: strip_undef(ir, tree, body, only),
                form: *form,
                c: *c,
            }),
            SNode::Switch { v, cases } => out.push(SNode::Switch {
                v: *v,
                cases: cases
                    .iter()
                    .map(|c| (c.0.clone(), strip_undef(ir, tree, &c.1, only)))
                    .collect(),
            }),
            x => out.push(x.clone()),
        }
    }
    out
}

/// inputField: a field of the serialized input at a fixed offset.
fn input_field(off: N, size: u8, unaligned: bool) -> Option<String> {
    let size = size as N;
    if off == 0.0 && size == 8.0 {
        return Some("num_accounts".into());
    }
    let o = off - 8.0;
    if o < 0.0 {
        return None;
    }
    let fmt = |at: N, len: N, name: &str| {
        format!(
            "acc0.{name}{}",
            if len > 8.0 {
                if o == at {
                    String::new()
                } else {
                    format!("[{}]", js_num(o - at))
                }
            } else {
                String::new()
            }
        )
    };
    if unaligned {
        let u: [(N, N, &str); 6] = [
            (0.0, 1.0, "dup_marker(0xff=not dup)"),
            (1.0, 1.0, "is_signer"),
            (2.0, 1.0, "is_writable"),
            (3.0, 32.0, "key"),
            (35.0, 8.0, "lamports"),
            (43.0, 8.0, "data_len"),
        ];
        for (at, len, name) in u {
            if o >= at && o + size <= at + len {
                return Some(fmt(at, len, name));
            }
        }
        return None;
    }
    let fl: [(N, N, &str); 9] = [
        (0.0, 1.0, "dup_marker(0xff=not dup)"),
        (1.0, 1.0, "is_signer"),
        (2.0, 1.0, "is_writable"),
        (3.0, 1.0, "executable"),
        (4.0, 4.0, "original_data_len"),
        (8.0, 32.0, "key"),
        (40.0, 32.0, "owner"),
        (72.0, 8.0, "lamports"),
        (80.0, 8.0, "data_len"),
    ];
    if o == 0.0 && size == 2.0 {
        return Some("dup_marker|is_signer".into());
    }
    if o == 0.0 && size == 4.0 {
        return Some("dup_marker|is_signer|is_writable|executable".into());
    }
    for (at, len, name) in fl {
        if o >= at && o + size <= at + len {
            return Some(fmt(at, len, name));
        }
    }
    if (88.0..88.0 + 2048.0).contains(&o) {
        return Some(format!("acc0.data[{}]", js_num(o - 88.0)));
    }
    None
}

/// outRole: the stack-object role of the first argument of a call to a function of this name.
fn out_role(name: &str) -> Option<(String, Option<String>, bool)> {
    let n = strip_hex_suffix(name, 1);
    let r = |nm: &str, t: Option<&str>, inout: bool| {
        Some((nm.to_string(), t.map(|s| s.to_string()), inout))
    };
    match n {
        "__multi3" => return r("prod", Some("U128"), false),
        "__udivti3" | "__divti3" => return r("quot", Some("U128"), false),
        "__umodti3" | "__modti3" => return r("rem", Some("U128"), false),
        _ => {}
    }
    let prog_err = n.strip_prefix("program_error_from").is_some_and(|rest| {
        rest.is_empty()
            || rest
                .strip_prefix('_')
                .is_some_and(|d| !d.is_empty() && d.bytes().all(|c| c.is_ascii_digit()))
    });
    if n.starts_with("Error_with_") || n == "anchor_error_from" || prog_err {
        return r("err", Some("Result64"), false);
    }
    if n == "AccountInfo_clone" {
        return r("info", Some("AccountInfo"), false);
    }
    if n == "AccountInfo_try_borrow_data" || n == "AccountInfo_try_borrow_mut_data" {
        return r("data_ref", None, false);
    }
    if n == "AccountInfo_try_borrow_lamports" || n == "AccountInfo_try_borrow_mut_lamports" {
        return r("lamports_ref", None, false);
    }
    if ["rent_get", "clock_get", "epoch_schedule_get"].contains(&n) {
        return r(n.strip_suffix("_get").unwrap(), None, false);
    }
    if n == "ErrorCode_name" {
        return r("err_name", None, false);
    }
    if n == "Pubkey_find_program_address"
        || n == "Pubkey_try_find_program_address"
        || n == "Pubkey_create_program_address"
    {
        return r("pda", None, false);
    }
    if n == "try_accounts" {
        return r("accts", None, false);
    }
    let v = n.strip_prefix("RawVec_").unwrap_or(n);
    if [
        "reserve",
        "reserve_for_push",
        "grow_one",
        "reserve_do_reserve_and_handle",
        "do_reserve_and_handle",
        "grow_amortized",
    ]
    .contains(&v)
    {
        return r("vec", None, true);
    }
    None
}

fn fits_access(v: &Views, ty: &str, d: N, size: N, copy: bool) -> bool {
    if let Some(bits) = ty.strip_prefix("Tagged") {
        if ["8", "16", "32", "64"].contains(&bits) {
            let bytes = bits.parse::<N>().unwrap() / 8.0;
            return if copy {
                d == 0.0 || d >= bytes
            } else {
                d >= bytes || (d == 0.0 && size == bytes)
            };
        }
    }
    let Some(view) = v.map.get(ty) else {
        return false;
    };
    let Some(vs) = view.size.filter(|s| *s != 0.0 && !s.is_nan()) else {
        return false;
    };
    if d < 0.0 {
        return false;
    }
    let array = ARRAY_VIEWS.contains(&ty);
    if copy {
        return if array {
            d % vs == 0.0 && size % vs == 0.0
        } else {
            d + size <= vs
        };
    }
    if !array && d >= vs {
        return false;
    }
    let Some(r) = v.resolve(ty, d % vs) else {
        return false;
    };
    if let FT::Scalar(s) = r.last {
        if r.rest == 0.0 && (s as N) < size {
            let mut o = d % vs;
            let end = o + size;
            while o < end {
                let Some(g) = v.resolve(ty, o) else {
                    return false;
                };
                let FT::Scalar(gs) = g.last else { return false };
                if g.rest != 0.0 {
                    return false;
                }
                o += gs as N;
            }
            return o == end;
        }
        return r.rest == 0.0 && s as N == size;
    }
    if let FT::Ref(_) = r.last {
        return r.rest == 0.0 && size == 8.0;
    }
    r.rest + size <= v.width(&r.last)
}

fn fits_loose(v: &Views, ty: &str, d: N, size: N) -> bool {
    if d < 0.0 {
        return false;
    }
    let mut hit = false;
    let mut i = 0.0;
    while i < size && !hit {
        hit = v.field_at(ty, d + i).is_some();
        i += 1.0;
    }
    if !hit {
        return true;
    }
    let Some(r) = v.resolve(ty, d) else {
        return false;
    };
    match r.last {
        FT::Scalar(_) => {
            if r.rest != 0.0 {
                return false;
            }
            let mut o = d;
            while o < d + size {
                let Some(g) = v.resolve(ty, o) else {
                    return false;
                };
                let FT::Scalar(gs) = g.last else { return false };
                if g.rest != 0.0 {
                    return false;
                }
                o += gs as N;
            }
            o == d + size
        }
        FT::Ref(_) => r.rest == 0.0 && size == 8.0,
        FT::Embed(_) => r.rest + size <= v.width(&r.last),
    }
}

/// Frame objects of a function being printed (setupFrame).
struct Frame {
    obj_name: IndexMap<K, String>,
    obj_type: IndexMap<K, String>,
    obj_why: IndexMap<K, String>,
    sorted: Vec<N>,
    rg: Option<Regions>,
    cur: Act,
    used: IndexMap<String, (N, Option<String>, Option<String>)>,
    typed: bool,
}

impl Frame {
    fn pick(&self, o: N) -> (N, N) {
        let mut b = o;
        for &x in &self.sorted {
            if x <= o && o - x < 512.0 {
                b = x;
            }
            if x > o {
                break;
            }
        }
        (b, o - b)
    }
    fn region(&self, o: N) -> Option<usize> {
        let rg = self.rg.as_ref()?;
        if self.cur.is_empty() {
            return None;
        }
        innermost(&rg.list, &self.cur, o)
    }
    fn use_b(&mut self, b: N) -> String {
        let n = self
            .obj_name
            .get(&K::of(b))
            .cloned()
            .unwrap_or_else(|| format!("s{}", js_hex(-b)));
        if !self.used.contains_key(&n) {
            self.used.insert(
                n.clone(),
                (
                    b,
                    self.obj_type.get(&K::of(b)).cloned(),
                    self.obj_why.get(&K::of(b)).cloned(),
                ),
            );
        }
        n
    }
    fn use_r(&mut self, ri: usize) -> String {
        let r = &self.rg.as_ref().unwrap().list[ri];
        let name = r.name.clone();
        if !self.used.contains_key(&name) {
            let t = if r.ty.is_some() && !r.bad {
                r.ty.clone()
            } else {
                None
            };
            self.used
                .insert(name.clone(), (r.base, t, Some(r.why.clone())));
        }
        name
    }
    fn frame_ref(&mut self, o: N) -> Option<String> {
        if o >= 0.0 || o < -8192.0 {
            return None;
        }
        let rel = |n: String, d: N| {
            if d != 0.0 {
                format!(
                    "{n} + {}",
                    if d < 10.0 {
                        js_num(d)
                    } else {
                        format!("0x{}", js_hex(d))
                    }
                )
            } else {
                n
            }
        };
        if let Some(ri) = self.region(o) {
            let base = self.rg.as_ref().unwrap().list[ri].base;
            let n = self.use_r(ri);
            return Some(rel(n, o - base));
        }
        let (b, d) = self.pick(o);
        let n = self.use_b(b);
        Some(rel(n, d))
    }
    /// frameTyped: (name, type, rel, exact)
    fn frame_typed(&mut self, o: N) -> Option<(String, String, N, bool)> {
        if !self.typed || o >= 0.0 || o < -8192.0 {
            return None;
        }
        if let Some(ri) = self.region(o) {
            let r = &self.rg.as_ref().unwrap().list[ri];
            if let (Some(t), false) = (r.ty.clone(), r.bad) {
                let base = r.base;
                let n = self.use_r(ri);
                return Some((n, t, o - base, true));
            }
            return None;
        }
        let (b, d) = self.pick(o);
        let t = self.obj_type.get(&K::of(b)).cloned()?;
        let n = self.use_b(b);
        Some((n, t, d, false))
    }
    fn decl(&self) -> String {
        let mut list: Vec<(&String, &(N, Option<String>, Option<String>))> =
            self.used.iter().collect();
        if list.is_empty() {
            return String::new();
        }
        list.sort_by(|a, b| (b.1).0.partial_cmp(&(a.1).0).unwrap());
        let mut why: IndexSet<String> = IndexSet::default();
        for x in &list {
            if let Some(w) = &(x.1).2 {
                why.insert(w.clone());
            }
        }
        let parts: Vec<String> = list
            .iter()
            .map(|(n, (b, t, _))| {
                format!(
                    "{n}{} = fp - 0x{}",
                    t.as_ref().map_or(String::new(), |t| format!(": {t}")),
                    js_hex(-b)
                )
            })
            .collect();
        format!(
            "\tconst {}{}",
            parts.join(", "),
            if why.is_empty() {
                String::new()
            } else {
                format!(
                    " // named [heur: {}]",
                    why.iter().cloned().collect::<Vec<_>>().join("; ")
                )
            }
        )
    }
}

type NoteFn<'a> = Box<dyn FnMut(&mut Printer, &SNode) -> Option<String> + 'a>;

/// The readable hooks of one function.
struct FnSugar<'a> {
    d: &'a Dx<'a>,
    var_types: IndexMap<u32, String>,
    input_var: Option<u32>,
    acc_typed: Option<&'a crate::accounts::Typed>,
    in_addr: Cell<bool>,
    frame: RefCell<Option<Frame>>,
    ok_at: Vec<E>,
    stored: HashMap<u32, String>,
    outl: HashMap<(*const Vec<SNode>, usize), (String, Vec<E>, bool)>,
    note: RefCell<Option<NoteFn<'a>>>,
    arg_notes: bool,
    ir: &'a Ir,
    /// node -> printed lines (the analysis: facts.rs)
    spans: RefCell<HashMap<NodeKey, (usize, usize)>>,
}

enum VF {
    Scalar(u8),
    Ref(String),
    Embed(String),
}

struct ViewField {
    t: String,
    rest: N,
    last: FT,
}

impl FnSugar<'_> {
    fn frame_obj(&self, pr: &Printer, e: E) -> Option<(String, String, N, bool)> {
        let Node::Bin(BinOp::Add, a, c) = self.ir.get(e) else {
            return None;
        };
        let (Node::Var(av), Node::Const(cv)) = (self.ir.get(a), self.ir.get(c)) else {
            return None;
        };
        if pr.var_name(av) != "fp" {
            return None;
        }
        let mut fr = self.frame.borrow_mut();
        let f = fr.as_mut()?;
        if !f.typed {
            return None;
        }
        f.frame_typed(n_s(cv))
    }
    fn typed_obj(&self, pr: &Printer, e: E) -> Option<(String, String)> {
        let ir = self.ir;
        if let Node::Var(id) = ir.get(e) {
            return self
                .var_types
                .get(&id)
                .map(|t| (pr.var_name(id), t.clone()));
        }
        if let Some(fo) = self.frame_obj(pr, e) {
            return if fo.2 != 0.0 {
                None
            } else {
                Some((fo.0, fo.1))
            };
        }
        let f = match ir.get(e) {
            Node::Load { size: 8, addr } => self.view_field(pr, addr),
            Node::Bin(BinOp::Add, _, c) if matches!(ir.get(c), Node::Const(_)) => {
                self.view_field(pr, e)
            }
            _ => None,
        }?;
        if f.rest != 0.0 {
            return None;
        }
        match (ir.get(e), f.last) {
            (Node::Load { .. }, FT::Ref(to)) => Some((f.t, to)),
            (Node::Bin(..), FT::Embed(ty)) => Some((f.t, ty)),
            _ => None,
        }
    }
    fn view_field(&self, pr: &Printer, addr: E) -> Option<ViewField> {
        let ir = self.ir;
        let views = &self.d.views;
        let mut b = addr;
        let mut off: N = 0.0;
        let fo = self.frame_obj(pr, addr);
        if let Some(fo) = &fo {
            off = fo.2;
        } else if let Node::Bin(BinOp::Add, a, c) = ir.get(addr) {
            if let Node::Const(c) = ir.get(c) {
                b = a;
                off = n_s(c);
            }
        }
        if !(0.0..=65536.0).contains(&off) {
            return None;
        }
        let o = match fo {
            Some(fo) => (fo.0, fo.1),
            None => self.typed_obj(pr, b)?,
        };
        let size = views
            .map
            .get(&o.1)
            .and_then(|v| v.size)
            .filter(|s| *s != 0.0 && !s.is_nan());
        let mut t = o.0.clone();
        let mut rel = off;
        if let Some(s) = size {
            if rel >= s {
                t = format!("{}[{}]", o.0, js_num((rel / s).floor()));
                rel %= s;
            }
        }
        let r = views.resolve(&o.1, rel)?;
        Some(ViewField {
            t: format!("{t}.{}", r.path.join(".")),
            rest: r.rest,
            last: r.last,
        })
    }
    fn view_expr(&self, pr: &mut Printer, e: E) -> Option<(String, u8)> {
        let ir = self.ir;
        let views = &self.d.views;
        match ir.get(e) {
            Node::Load { size, addr } => {
                let f = self.view_field(pr, addr)?;
                let fits = |last: &FT| match last {
                    FT::Scalar(s) => *s == size,
                    FT::Ref(_) => size == 8,
                    _ => false,
                };
                if f.rest == 0.0 && fits(&f.last) {
                    return Some((f.t, 21));
                }
                if matches!(f.last, FT::Embed(_))
                    && f.rest == 0.0
                    && self.frame_obj(pr, addr).is_some_and(|x| x.3)
                {
                    let mut t = f.t.clone();
                    let mut last = f.last.clone();
                    let mut n = 0;
                    while n < 32 {
                        let FT::Embed(ty) = &last else { break };
                        if !views.map.contains_key(ty) {
                            break;
                        }
                        let Some(r) = views.resolve(ty, 0.0) else {
                            break;
                        };
                        if r.rest != 0.0 {
                            break;
                        }
                        t.push('.');
                        t.push_str(&r.path.join("."));
                        last = r.last;
                        n += 1;
                    }
                    if fits(&last) {
                        return Some((t, 21));
                    }
                }
                if matches!(f.last, FT::Embed(_)) {
                    return Some((
                        format!(
                            "ld{}({})",
                            size as u32 * 8,
                            if f.rest != 0.0 {
                                format!("{} + {}", f.t, fmt_const(big_u(f.rest)))
                            } else {
                                f.t
                            }
                        ),
                        20,
                    ));
                }
                None
            }
            Node::Bin(BinOp::Add, _, c) if matches!(ir.get(c), Node::Const(_)) => {
                let f = self.view_field(pr, e);
                let fo = self.frame_obj(pr, e);
                let f = f?;
                if !matches!(f.last, FT::Embed(_))
                    || fo
                        .as_ref()
                        .is_some_and(|x| x.3 && (f.rest != 0.0 || x.2 == 0.0))
                {
                    return None;
                }
                Some(if f.rest != 0.0 {
                    (format!("{} + {}", f.t, fmt_const(big_u(f.rest))), 12)
                } else {
                    (f.t, 21)
                })
            }
            _ => None,
        }
    }
    fn hooks(&self, pr: &mut Printer, e: E) -> Option<String> {
        let ir = self.ir;
        let d = self.d;
        if let Some(acc) = self.acc_typed.filter(|a| !a.is_empty()) {
            let fld = account_field(Some(acc), ir, e, d.legacy);
            if let (Some(fld), Node::Load { size, addr }) = (&fld, ir.get(e)) {
                self.in_addr.set(true);
                let a = pr.expr(addr, 0);
                self.in_addr.set(false);
                return Some(format!("ld{}({a} /* {fld} */)", size as u32 * 8));
            }
            let adr = if matches!(ir.get(e), Node::Bin(..)) && !self.in_addr.get() {
                account_addr(Some(acc), ir, e)
            } else {
                None
            };
            if let (Some(adr), Node::Bin(_, a, b)) = (adr, ir.get(e)) {
                let x = pr.expr(a, 13);
                let y = pr.expr(b, 14);
                return Some(format!("({x} + {y} /* {adr} */)"));
            }
        }
        // serialized input: the next account record
        if let Node::Bin(BinOp::And, a, m) = ir.get(e) {
            if ir.get(m) == Node::Const(0xffff_ffff_ffff_fff8) {
                if let Node::Bin(BinOp::Add, s1, k) = ir.get(a) {
                    if ir.get(k) == Node::Const(0x2867) {
                        if let Node::Bin(BinOp::Add, s1a, s1b) = ir.get(s1) {
                            if let Node::Load { size: 8, addr } = ir.get(s1b) {
                                let c50 = ir.c(0x50);
                                let want = ir.bin(BinOp::Add, s1a, c50);
                                if expr_eq(ir, addr, want) {
                                    let t = pr.expr(a, 9);
                                    return Some(format!("({t} & -8 /* next account record */)"));
                                }
                            }
                        }
                    }
                }
            }
        }
        if let Some(iv) = self.input_var {
            if let Node::Load { size, addr } = ir.get(e) {
                let off = match ir.get(addr) {
                    Node::Var(v) if v == iv => 0.0,
                    Node::Bin(BinOp::Add, a, c) => match (ir.get(a), ir.get(c)) {
                        (Node::Var(v), Node::Const(c)) if v == iv => c as N,
                        _ => -1.0,
                    },
                    _ => -1.0,
                };
                if off >= 0.0 {
                    if let Some(fld) = input_field(off, size, d.unaligned) {
                        let t = pr.expr(addr, 0);
                        return Some(format!("ld{}({t} /* {fld} */)", size as u32 * 8));
                    }
                }
            }
        }
        None
    }
    fn result_tail(&self, s: &Stmt, prev: Option<&Stmt>) -> Option<String> {
        let ir = self.ir;
        let sem = &self.d.sem;
        let ok = sem.result_ok_tag?;
        let _ = ok;
        if self.ok_at.is_empty() {
            return None;
        }
        let custom = |c: u64| {
            let n = if c >= 100 {
                sem.const_comment(c, 0)
            } else {
                None
            };
            format!(
                "Err(ProgramError::Custom({c}{}))",
                n.map_or(String::new(), |n| format!(" {n}"))
            )
        };
        let at_ok = |a: E| self.ok_at.iter().any(|&x| expr_eq(ir, x, a));
        match s {
            Stmt::Store {
                size: 4, v, addr, ..
            } if matches!(ir.get(*v), Node::Const(_)) && at_ok(*addr) => {
                let Node::Const(sv) = ir.get(*v) else {
                    unreachable!()
                };
                let c = match prev {
                    Some(Stmt::Store {
                        size: 4,
                        v: pv,
                        addr: pa,
                        ..
                    }) => match ir.get(*pv) {
                        Node::Const(pc) => {
                            let c4 = ir.c(4);
                            let want = ir.bin(BinOp::Add, *addr, c4);
                            if expr_eq(ir, *pa, want) {
                                Some(pc)
                            } else {
                                None
                            }
                        }
                        _ => None,
                    },
                    _ => None,
                };
                if sv == 0 {
                    if let Some(c) = c {
                        return Some(custom(c));
                    }
                }
                sem.result_tag_name(sv)
            }
            Stmt::Store {
                size: 8, v, addr, ..
            } if matches!(ir.get(*v), Node::Const(x) if x != 0) && at_ok(*addr) => {
                let Node::Const(sv) = ir.get(*v) else {
                    unreachable!()
                };
                let (tag, code) = (sv & 0xffff_ffff, sv >> 32);
                if tag == 0 {
                    Some(custom(code))
                } else if code == 0 {
                    sem.result_tag_name(tag)
                } else {
                    None
                }
            }
            Stmt::Stores {
                size: 4,
                vals,
                addr,
                ..
            } if matches!(ir.get(ir.at(*vals, 0)), Node::Const(_)) && at_ok(*addr) => {
                let Node::Const(v0) = ir.get(ir.at(*vals, 0)) else {
                    unreachable!()
                };
                let c = if vals.len > 1 {
                    Some(ir.at(*vals, 1))
                } else {
                    None
                };
                if v0 == 0 {
                    if let Some(Node::Const(cv)) = c.map(|c| ir.get(c)) {
                        return Some(custom(cv));
                    }
                }
                sem.result_tag_name(v0)
            }
            _ => None,
        }
    }
}

impl Sugar for FnSugar<'_> {
    fn expr(&self, pr: &mut Printer, e: E, o: &mut String) -> Option<u8> {
        if let Some((t, p)) = self.view_expr(pr, e) {
            o.push_str(&t);
            return Some(p);
        }
        if let Some(t) = self.hooks(pr, e) {
            o.push_str(&t);
            return Some(20);
        }
        if let Node::Bin(BinOp::Add, a, c) = self.ir.get(e) {
            if let (Node::Var(av), Node::Const(cv)) = (self.ir.get(a), self.ir.get(c)) {
                if self.frame.borrow().is_some() && pr.var_name(av) == "fp" {
                    let r = self.frame.borrow_mut().as_mut().unwrap().frame_ref(n_s(cv));
                    if let Some(r) = r {
                        let p = if r.contains(' ') { 12 } else { 21 };
                        o.push_str(&r);
                        return Some(p);
                    }
                }
            }
        }
        None
    }
    fn const_comment(&self, v: u64, role: Role) -> Option<String> {
        self.d.sem.const_comment(
            v,
            match role {
                Role::Value => 0,
                Role::Addr => 1,
                Role::Ret => 2,
            },
        )
    }
    fn has_str(&self) -> bool {
        true
    }
    fn str_lit(&self, ptr: u64, len: u64, is_ptr: bool) -> Option<String> {
        self.d.sem.str_lit(ptr, len, is_ptr)
    }
    fn str_note(&self, ptr: u64, len: u64, is_ptr: bool) -> Option<String> {
        self.d.sem.str_at(ptr, len, is_ptr)
    }
    fn has_key_at(&self) -> bool {
        true
    }
    fn key_at(&self, ptr: u64) -> Option<String> {
        self.d.sem.key_at(ptr)
    }
    fn drop_undef_args(&self) -> bool {
        true
    }
    fn arg_note(&self, t: &CallTarget, i: usize, v: u64) -> Option<String> {
        if !self.arg_notes {
            return None;
        }
        let CallTarget::Fn { pc } = t else {
            return None;
        };
        if i != 1 || !self.d.error_from.contains(pc) || v >= 0x10000 {
            return None;
        }
        let nm = self
            .d
            .idl
            .and_then(|i| i.error_name(6000.0 + v as N))
            .filter(|s| !s.is_empty());
        Some(match nm {
            Some(nm) => format!("error::{nm} = {}", 6000 + v),
            None => format!("error {}", 6000 + v),
        })
    }
    fn has_views(&self) -> bool {
        true
    }
    fn view_lvalue(&self, pr: &mut Printer, size: u8, addr: E) -> Option<String> {
        let f = self.view_field(pr, addr)?;
        let ok = f.rest == 0.0
            && match f.last {
                FT::Scalar(s) => s == size,
                FT::Ref(_) => size == 8,
                _ => false,
            };
        if ok {
            Some(f.t)
        } else {
            None
        }
    }
    fn store_field(&self, _pr: &mut Printer, size: u8, addr: E) -> Option<String> {
        let ir = self.ir;
        let ld = ir.load(size, addr);
        let fld = account_field(self.acc_typed, ir, ld, self.d.legacy);
        if fld.is_some() || self.input_var.is_none() {
            return fld;
        }
        let iv = self.input_var.unwrap();
        let off = match ir.get(addr) {
            Node::Var(v) if v == iv => 0.0,
            Node::Bin(BinOp::Add, a, c) => match (ir.get(a), ir.get(c)) {
                (Node::Var(v), Node::Const(c)) if v == iv => c as N,
                _ => -1.0,
            },
            _ => -1.0,
        };
        if off >= 0.0 {
            input_field(off, size, self.d.unaligned)
        } else {
            None
        }
    }
    fn stmt_tail(&self, pr: &Printer, si: u32, s: &Stmt, prev: Option<u32>) -> Option<String> {
        let _ = pr;
        let tree_prev = prev.map(|p| self.prev_stmt(p));
        self.result_tail(s, tree_prev.as_ref())
            .or_else(|| self.stored.get(&si).cloned())
    }
    fn var_type(&self, v: u32) -> Option<String> {
        self.var_types.get(&v).cloned()
    }
    fn node_lines(&self, n: &SNode, a: usize, b: usize) {
        self.spans.borrow_mut().insert(n as *const SNode, (a, b));
    }
    fn at_node(&self, n: &SNode) {
        let mut fr = self.frame.borrow_mut();
        if let Some(f) = fr.as_mut() {
            if let Some(rg) = &f.rg {
                f.cur = rg
                    .at
                    .get(&(n as *const SNode))
                    .cloned()
                    .unwrap_or_else(|| Rc::new(Vec::new()));
            }
        }
    }
    fn outline(&self, list: &Vec<SNode>, i: usize) -> Option<(String, Vec<E>, bool)> {
        self.outl.get(&(list as *const Vec<SNode>, i)).cloned()
    }
    fn node_note(&self, pr: &mut Printer, n: &SNode) -> Option<String> {
        let mut nf = self.note.borrow_mut();
        let f = nf.as_mut()?;
        f(pr, n)
    }
}

thread_local! {
    static TREE_STMTS: RefCell<Vec<Stmt>> = const { RefCell::new(Vec::new()) };
}

impl FnSugar<'_> {
    fn prev_stmt(&self, i: u32) -> Stmt {
        TREE_STMTS.with(|t| t.borrow()[i as usize].clone())
    }
}

/// The readable hooks of an outlined helper (strings, keys, constants only).
struct HelperSugar<'a> {
    d: &'a Dx<'a>,
}

impl Sugar for HelperSugar<'_> {
    fn const_comment(&self, v: u64, role: Role) -> Option<String> {
        self.d.sem.const_comment(
            v,
            match role {
                Role::Value => 0,
                Role::Addr => 1,
                Role::Ret => 2,
            },
        )
    }
    fn has_str(&self) -> bool {
        true
    }
    fn str_lit(&self, ptr: u64, len: u64, is_ptr: bool) -> Option<String> {
        self.d.sem.str_lit(ptr, len, is_ptr)
    }
    fn str_note(&self, ptr: u64, len: u64, is_ptr: bool) -> Option<String> {
        self.d.sem.str_at(ptr, len, is_ptr)
    }
    fn has_key_at(&self) -> bool {
        true
    }
    fn key_at(&self, ptr: u64) -> Option<String> {
        self.d.sem.key_at(ptr)
    }
    fn drop_undef_args(&self) -> bool {
        true
    }
}

/// storedStrings: runs of constant stores through one base writing printable text: keyed by the last store.
fn stored_strings(ir: &Ir, tree: &Tree, body: &[SNode]) -> HashMap<u32, String> {
    let mut out = HashMap::default();
    fn visit(ir: &Ir, tree: &Tree, ns: &[SNode], out: &mut HashMap<u32, String>) {
        let mut base: Option<E> = None;
        let mut bytes: IndexMap<i128, u8> = IndexMap::default();
        let mut last: Option<u32> = None;
        let mut flush = |base: &mut Option<E>,
                         bytes: &mut IndexMap<i128, u8>,
                         last: &mut Option<u32>,
                         out: &mut HashMap<u32, String>| {
            if let Some(l) = *last {
                if bytes.len() >= 4 {
                    let mut offs: Vec<i128> = bytes.keys().copied().collect();
                    offs.sort();
                    let lo = offs[0];
                    let txt: Vec<u8> = offs.iter().map(|o| bytes[o]).collect();
                    if offs[offs.len() - 1] - lo == offs.len() as i128 - 1
                        && txt.iter().all(|&c| (0x20..0x7f).contains(&c))
                        && txt.iter().any(|c| c.is_ascii_alphabetic())
                    {
                        let s: String = txt.iter().map(|&c| c as char).collect();
                        out.insert(l, json_str(&s));
                    }
                }
                *base = None;
                *bytes = IndexMap::default();
                *last = None;
            }
        };
        for n in ns {
            if let SNode::Stmt(si) = n {
                let s = tree.stmt(*si);
                let (addr, size, vals): (Option<E>, u8, Vec<E>) = match s {
                    Stmt::Store { addr, size, v, .. } => (Some(*addr), *size, vec![*v]),
                    Stmt::Stores {
                        addr, size, vals, ..
                    } => (Some(*addr), *size, ir.to_vec(*vals)),
                    _ => (None, 0, vec![]),
                };
                if let Some(addr) = addr {
                    if vals.iter().all(|&v| matches!(ir.get(v), Node::Const(_))) {
                        let (b, o) = match ir.get(addr) {
                            Node::Bin(BinOp::Add, a, c) if matches!(ir.get(c), Node::Const(_)) => {
                                let Node::Const(c) = ir.get(c) else {
                                    unreachable!()
                                };
                                (a, c as i64 as i128)
                            }
                            _ => (addr, 0),
                        };
                        if base.is_none_or(|x| !expr_eq(ir, b, x)) {
                            flush(&mut base, &mut bytes, &mut last, out);
                            base = Some(b);
                        }
                        for (i, v) in vals.iter().enumerate() {
                            let Node::Const(cv) = ir.get(*v) else {
                                unreachable!()
                            };
                            for j in 0..size as usize {
                                let k = o + (i * size as usize + j) as i128;
                                bytes.insert(k, ((cv >> (8 * j)) & 0xff) as u8);
                            }
                        }
                        last = Some(*si);
                        continue;
                    }
                }
            }
            flush(&mut base, &mut bytes, &mut last, out);
            match n {
                SNode::If { then, els, .. } => {
                    visit(ir, tree, then, out);
                    visit(ir, tree, els, out);
                }
                SNode::Block { body, .. } | SNode::Loop { body, .. } => visit(ir, tree, body, out),
                SNode::Switch { cases, .. } => {
                    for c in cases {
                        visit(ir, tree, &c.1, out);
                    }
                }
                _ => {}
            }
        }
        flush(&mut base, &mut bytes, &mut last, out);
    }
    visit(ir, tree, body, &mut out);
    out
}

/// frameRoles: roles of stack objects (CPI / PDA / fmt sites, out parameters, keys).
#[allow(clippy::too_many_arguments)]
fn frame_roles(d: &Dx, f: &Func, sites: &[&CpiSite], pc: i64) -> IndexMap<K, Vec<FrameClaim>> {
    let mut claims: IndexMap<K, Vec<FrameClaim>> = IndexMap::default();
    let Some(fp) = fp_var(f) else { return claims };
    let ir = f.ir.as_ref().unwrap();
    let rd = |a: u128, n: usize| d.sem.read_ro(a, n);
    let mut sited: IndexMap<K, Vec<FrameClaim>> = IndexMap::default();
    for s in sites {
        for o in site_objects(ir, s, Some(fp), Some(&rd)) {
            sited.entry(K::of(o.off)).or_default().push(FrameClaim {
                name: o.name.to_string(),
                ty: o.ty.map(|s| s.to_string()),
                why: "the CPI / PDA / fmt calls they are built for".into(),
                out: false,
                extent: None,
            });
        }
    }
    let fo = |e: E| fo_add(ir, e, Some(fp));
    let mut escapes: HashMap<K, u32> = HashMap::default();
    let mut arg_esc: HashMap<K, u32> = HashMap::default();
    let mut outs: IndexMap<K, Vec<FrameClaim>> = IndexMap::default();
    let mut generic: IndexMap<K, Vec<FrameClaim>> = IndexMap::default();
    let mut key_uses: IndexMap<K, u32> = IndexMap::default();
    let mut typed_args: IndexMap<K, Vec<FrameClaim>> = IndexMap::default();
    struct V<'x> {
        escapes: &'x mut HashMap<K, u32>,
        arg_esc: &'x mut HashMap<K, u32>,
        outs: &'x mut IndexMap<K, Vec<FrameClaim>>,
        generic: &'x mut IndexMap<K, Vec<FrameClaim>>,
        key_uses: &'x mut IndexMap<K, u32>,
        typed_args: &'x mut IndexMap<K, Vec<FrameClaim>>,
    }
    fn visit(d: &Dx, ir: &Ir, fp: u32, e: E, addr: bool, v: &mut V) {
        let fo = |e: E| fo_add(ir, e, Some(fp));
        if let Some(o) = fo(e) {
            if !addr {
                *v.escapes.entry(K::of(o)).or_default() += 1;
            }
            return;
        }
        match ir.get(e) {
            Node::Load { addr, .. } => visit(d, ir, fp, addr, true, v),
            Node::Call(t, args) => {
                let t = ir.target(t);
                let av = ir.to_vec(args);
                call(d, ir, fp, &t, &av, v);
            }
            Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                visit(d, ir, fp, a, false, v);
                visit(d, ir, fp, b, false, v);
            }
            Node::Neg(a)
            | Node::Not(a)
            | Node::Ext { a, .. }
            | Node::Bswap { a, .. }
            | Node::Lnot(a) => visit(d, ir, fp, a, false, v),
            Node::Sel(c, a, b) => {
                visit(d, ir, fp, c, false, v);
                visit(d, ir, fp, a, false, v);
                visit(d, ir, fp, b, false, v);
            }
            Node::Fn(n, args) => {
                let name = ir.name(n);
                let av = ir.to_vec(args);
                if &*name == "keyeq"
                    || (&*name == "memeq"
                        && av.get(2).is_some_and(|&x| ir.get(x) == Node::Const(32)))
                {
                    let k = if &*name == "keyeq" { 1 } else { 2 };
                    for &a in av.iter().take(k) {
                        if let Some(x) = fo(a) {
                            *v.key_uses.entry(K::of(x)).or_default() += 1;
                        }
                    }
                }
                for a in av {
                    visit(d, ir, fp, a, false, v);
                }
            }
            _ => {}
        }
    }
    fn call(d: &Dx, ir: &Ir, fp: u32, t: &CallTarget, args: &[E], v: &mut V) {
        let fo = |e: E| fo_add(ir, e, Some(fp));
        let o0 = args.first().and_then(|&a| fo(a));
        let r = match (o0, t) {
            (Some(_), CallTarget::Fn { pc }) => out_role(&d.fn_name(*pc)).or_else(|| {
                d.out_tags
                    .get(pc)
                    .map(|tag| ("res".to_string(), Some(format!("Tagged{}", tag * 8)), false))
            }),
            _ => None,
        };
        let cn = match t {
            CallTarget::Fn { pc } => d.fn_name(*pc),
            CallTarget::Sys { name, .. } => name.to_string(),
            _ => String::new(),
        };
        let is_memcmp = {
            let c = cn.strip_prefix("sol_").unwrap_or(&cn);
            c == "memcmp" || c == "memcmp_"
        };
        if is_memcmp && args.get(2).is_some_and(|&x| ir.get(x) == Node::Const(32)) {
            for &a in args.iter().take(2) {
                if let Some(x) = fo(a) {
                    *v.key_uses.entry(K::of(x)).or_default() += 1;
                }
            }
        }
        if let Some((name, ty, inout)) = r {
            v.outs
                .entry(K::of(o0.unwrap()))
                .or_default()
                .push(FrameClaim {
                    name,
                    ty,
                    why: if inout {
                        "the object the calls they are passed to work on".into()
                    } else {
                        "out parameter of the calls they are passed to".into()
                    },
                    out: !inout,
                    extent: None,
                });
        } else if let (Some(o0), CallTarget::Fn { pc }) = (o0, t) {
            if (d.is_lib(*pc) || d.out_params.contains(pc)) && args.len() > 1 {
                v.generic.entry(K::of(o0)).or_default().push(FrameClaim {
                    name: "res".into(),
                    ty: Some("Result64".into()),
                    why: GENERIC_RESULT.into(),
                    out: true,
                    extent: None,
                });
            }
        }
        for &a in args {
            if let Some(x) = fo(a) {
                *v.arg_esc.entry(K::of(x)).or_default() += 1;
            }
        }
        if let CallTarget::Fn { pc } = t {
            for (i, &a) in args.iter().enumerate() {
                let Some(x) = fo(a) else { continue };
                let reg = d.f(*pc).map_or(i as i32 + 1, |cf| arg_reg(cf, i));
                let Some(tv) = d.param_view(*pc, reg) else {
                    continue;
                };
                let out = reg == 1 && (d.out_params.contains(pc) || d.lib_out.contains_key(pc));
                v.typed_args.entry(K::of(x)).or_default().push(FrameClaim {
                    name: if out {
                        "res".into()
                    } else {
                        format!("s{}", js_hex(-x))
                    },
                    ty: Some(tv),
                    why: "typed as the parameter of the calls they are passed to".into(),
                    out,
                    extent: None,
                });
            }
        }
        if let CallTarget::Ind { e } = t {
            visit(d, ir, fp, *e, false, v);
        }
        for &a in args {
            visit(d, ir, fp, a, false, v);
        }
    }
    {
        let mut vv = V {
            escapes: &mut escapes,
            arg_esc: &mut arg_esc,
            outs: &mut outs,
            generic: &mut generic,
            key_uses: &mut key_uses,
            typed_args: &mut typed_args,
        };
        for b in &f.blocks {
            for s in &b.stmts {
                match s {
                    Stmt::Call { t, args, .. } => call(d, ir, fp, t, &ir.to_vec(*args), &mut vv),
                    Stmt::Store { addr, v, .. } => {
                        visit(d, ir, fp, *addr, true, &mut vv);
                        visit(d, ir, fp, *v, false, &mut vv);
                    }
                    Stmt::Stores { addr, vals, .. } => {
                        visit(d, ir, fp, *addr, true, &mut vv);
                        for v in ir.items(*vals) {
                            visit(d, ir, fp, v, false, &mut vv);
                        }
                    }
                    Stmt::Copy { dst, src, .. } => {
                        visit(d, ir, fp, *dst, true, &mut vv);
                        visit(d, ir, fp, *src, true, &mut vv);
                    }
                    _ => {
                        for e in stmt_exprs(ir, s) {
                            visit(d, ir, fp, e, false, &mut vv);
                        }
                    }
                }
            }
            match &b.term {
                Term::Br { c, .. } => visit(d, ir, fp, *c, false, &mut vv),
                Term::Ret { e: Some(e) } => visit(d, ir, fp, *e, false, &mut vv),
                _ => {}
            }
        }
    }
    let _ = (fo, pc);
    for (o, cs) in &sited {
        if arg_esc.get(o).copied().unwrap_or(0) as usize <= cs.len() {
            for c in cs {
                claims.entry(*o).or_default().push(c.clone());
            }
        }
    }
    for (o, cs) in &outs {
        if Some(cs.len() as u32) == escapes.get(o).copied() && !claims.contains_key(o) {
            for c in cs {
                claims.entry(*o).or_default().push(c.clone());
            }
        }
    }
    for (o, cs) in &typed_args {
        if Some(cs.len() as u32) == escapes.get(o).copied()
            && !claims.contains_key(o)
            && cs.iter().all(|c| c.ty == cs[0].ty && c.name == cs[0].name)
        {
            for c in cs {
                claims.entry(*o).or_default().push(FrameClaim {
                    out: false,
                    ..c.clone()
                });
            }
        }
    }
    for (o, cs) in &generic {
        if cs.len() == 1
            && escapes.get(o).copied() == Some(1)
            && !outs.contains_key(o)
            && !claims.contains_key(o)
        {
            claims.entry(*o).or_default().push(cs[0].clone());
        }
    }
    for (o, n) in &key_uses {
        if Some(*n) == escapes.get(o).copied() && !claims.contains_key(o) {
            claims.entry(*o).or_default().push(FrameClaim {
                name: "key".into(),
                ty: None,
                why: "operands of 32-byte comparisons (public keys)".into(),
                out: false,
                extent: Some(32.0),
            });
        }
    }
    claims
}

/// frameAccesses: loads, stores and copies of the frame.
fn frame_accesses(f: &Func, fp: u32) -> Vec<(N, N, bool, bool)> {
    let ir = f.ir.as_ref().unwrap();
    let mut out = Vec::new();
    let off = |e: E| fo_add(ir, e, Some(fp));
    let loads = |e: E, out: &mut Vec<(N, N, bool, bool)>| {
        ir.walk(e, &mut |_, x| {
            if let Node::Load { size, addr } = x {
                if let Some(o) = off(addr) {
                    out.push((o, size as N, false, false));
                }
            }
        })
    };
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Store { addr, size, .. } => {
                    if let Some(o) = off(*addr) {
                        out.push((o, *size as N, false, true));
                    }
                }
                Stmt::Stores {
                    addr, size, vals, ..
                } => {
                    if let Some(o) = off(*addr) {
                        for i in 0..vals.len {
                            out.push((o + (i * *size as u32) as N, *size as N, false, true));
                        }
                    }
                }
                Stmt::Copy { dst, src, n, .. } => {
                    for (i, x) in [*dst, *src].iter().enumerate() {
                        if let Some(o) = off(*x) {
                            out.push((o, *n as N, true, i == 0));
                        }
                    }
                }
                _ => {}
            }
            for e in stmt_exprs(ir, s) {
                loads(e, &mut out);
            }
        }
        match &b.term {
            Term::Br { c, .. } => loads(*c, &mut out),
            Term::Ret { e: Some(e) } => loads(*e, &mut out),
            _ => {}
        }
    }
    out
}

struct RC<'a> {
    d: &'a Dx<'a>,
    fp: u32,
    bases: Vec<N>,
    pc: i64,
    tpc: Option<i64>,
    ix: Option<String>,
    accounts: Option<String>,
    names: &'a [Option<String>],
    var_types: &'a IndexMap<u32, String>,
}

impl RegionCfg for RC<'_> {
    fn fp(&self) -> u32 {
        self.fp
    }
    fn bases(&self) -> &[N] {
        &self.bases
    }
    fn root_of(&self, t: &CallTarget, args: &[E], at: i64) -> Option<Root> {
        let CallTarget::Fn { pc: tp } = t else {
            return None;
        };
        let d = self.d;
        if let (Some(acc), Some(tpc)) = (&self.accounts, self.tpc) {
            if *tp == tpc {
                return Some(Root {
                    name: "accounts_res".into(),
                    copy_name: "ctx_accounts".into(),
                    ty: Some(acc.clone()),
                    shift: Some(d.acct_shift.get(&self.pc).copied().unwrap_or(0.0)),
                    size: None,
                    why: format!(
                        "the Accounts struct try_accounts returns (the result of accounts_{}), and copies of it",
                        self.ix.as_deref().unwrap_or("undefined")
                    ),
                    reused: false,
                });
            }
        }
        if let Some((Some(name), view)) = d.obj_vars.get(&self.pc).and_then(|o| o.calls.get(&at)) {
            if !name.is_empty() {
                return Some(Root {
                    name: format!("{name}_res"),
                    copy_name: format!("{name}_acc"),
                    ty: view.clone(),
                    shift: None,
                    size: None,
                    why: "the result of the call taking the account (per call where the slot is reused), and copies of it".into(),
                    reused: false,
                });
            }
        }
        let fname = d.fn_name(*tp);
        let role = out_role(&fname);
        let tag = d.out_tags.get(tp).copied();
        if let Some((rn, rt, false)) = &role {
            return Some(Root {
                name: rn.clone(),
                copy_name: format!("{rn}_copy"),
                ty: rt.clone(),
                shift: None,
                size: None,
                why: "out parameter of the call writing it (per call where the slot is reused)"
                    .into(),
                reused: true,
            });
        }
        let cn = strip_hex_suffix(&fname, 3).to_string();
        let rn = if cn == "fn" || cn.starts_with("fn_") || u16len(&cn) > 20 {
            "res".to_string()
        } else {
            format!("{cn}_res")
        };
        if tag.is_some() || d.out_params.contains(tp) {
            return Some(Root {
                name: rn.clone(),
                copy_name: format!("{rn}_copy"),
                ty: d
                    .param_view(*tp, 1)
                    .or_else(|| tag.map(|t| format!("Tagged{}", t * 8))),
                shift: None,
                size: None,
                why: "out parameter of the call writing it (per call where the slot is reused)"
                    .into(),
                reused: true,
            });
        }
        if self.d.is_lib(*tp) && args.len() > 1 {
            return Some(Root {
                name: "res".into(),
                copy_name: "res_copy".into(),
                ty: Some(
                    self.d
                        .lib_out
                        .get(tp)
                        .cloned()
                        .unwrap_or_else(|| "Result64".into()),
                ),
                shift: None,
                size: None,
                why:
                    "the result of the library call writing it (per call where the slot is reused)"
                        .into(),
                reused: true,
            });
        }
        None
    }
    fn arg_root(&self, t: &CallTarget, _args: &[E], _pc: i64, i: usize) -> Option<Root> {
        let CallTarget::Fn { pc: tp } = t else {
            return None;
        };
        let reg = self.d.f(*tp).map_or(i as i32 + 1, |cf| arg_reg(cf, i));
        let ty = self.d.param_view(*tp, reg)?;
        Some(Root {
            name: "arg".into(),
            copy_name: "arg_copy".into(),
            ty: Some(ty),
            shift: None,
            size: None,
            why: "an argument object of the call taking it (typed as its parameter; per call, with the stores building it)".into(),
            reused: false,
        })
    }
    fn typed_src(&self, e: E) -> Option<(String, String)> {
        let ir = self.d.f(self.pc).unwrap().ir.as_ref().unwrap();
        let Node::Var(id) = ir.get(e) else {
            return None;
        };
        let name = self.names.get(id as usize).cloned().flatten()?;
        let t = self.var_types.get(&id)?;
        if builtin_name(t) {
            return None;
        }
        Some((t.clone(), name))
    }
    fn is_copy(&self, t: &CallTarget) -> bool {
        match t {
            CallTarget::Sys { name, .. } => &**name == "sol_memcpy_" || &**name == "sol_memmove_",
            CallTarget::Fn { pc } => is_memcpy_name(&self.d.fn_name(*pc)),
            _ => false,
        }
    }
    fn size_of(&self, ty: &str) -> Option<N> {
        let views = &self.d.views;
        let v = views.map.get(ty)?;
        if let Some(s) = v.size.filter(|s| *s != 0.0 && !s.is_nan()) {
            return Some(s);
        }
        let mut n: N = 0.0;
        for x in &v.fields {
            n = crate::util::jmax(n, x.off + views.width(&x.t) * x.count.unwrap_or(1.0));
        }
        if n.is_finite() && n > 0.0 {
            Some((to_int32(n + 7.0) & !7) as N)
        } else {
            None
        }
    }
    fn fits(&self, ty: &str, d: N, size: N) -> bool {
        fits_loose(&self.d.views, ty, d, size)
    }
    fn embedded(&self, ty: &str, off: N) -> Option<(String, String)> {
        let views = &self.d.views;
        let r = views.resolve(ty, off)?;
        if r.rest != 0.0 {
            return None;
        }
        let FT::Embed(et) = &r.last else { return None };
        if !views.map.contains_key(et) {
            return None;
        }
        let last = r.path.last().unwrap();
        // .replace(/\[(\d+)\]$/, '_$1')
        let name = match last.rfind('[') {
            Some(i)
                if last.ends_with(']')
                    && last[i + 1..last.len() - 1]
                        .bytes()
                        .all(|c| c.is_ascii_digit())
                    && last.len() - i > 2 =>
            {
                format!("{}_{}", &last[..i], &last[i + 1..last.len() - 1])
            }
            _ => last.clone(),
        };
        Some((et.clone(), name))
    }
}

/// Printing of every function, the outlined helpers, and the output tables.
/// The analysis hook: given the result as the analysis reads it (after printing), its text output.
pub type AnalysisHook<'h> = &'h dyn for<'a> Fn(&crate::analysis::An<'a>) -> String;

/// The concrete-run budgets (interpreter steps) all functions' printing shares in function order: `Exec`,
/// the CPI sites' descriptions (250k), `Wrap`, the runs through user functions wrapping invoke (150k).
/// A run is made only while its budget is positive; a run's result does not depend on the budget. Each
/// test of a budget and each spending is logged: the log replayed against other starting budgets tells
/// whether the printing would have been the same (every test with the same outcome).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum BK {
    Exec = 0,
    Wrap = 1,
}

#[derive(Clone, Copy, Debug)]
enum BudgetEv {
    Test(BK, bool),
    Spend(BK, i64),
}

struct Budgets {
    left: Cell<[i64; 2]>,
    log: RefCell<Vec<BudgetEv>>,
}

impl Budgets {
    fn new(left: [i64; 2]) -> Self {
        Budgets {
            left: Cell::new(left),
            log: RefCell::new(Vec::new()),
        }
    }
    fn left(&self, k: BK) -> i64 {
        self.left.get()[k as usize]
    }
    fn test(&self, k: BK) -> bool {
        let ok = self.left(k) > 0;
        self.log.borrow_mut().push(BudgetEv::Test(k, ok));
        ok
    }
    fn spend(&self, k: BK, n: i64) {
        let mut l = self.left.get();
        l[k as usize] -= n;
        self.left.set(l);
        self.log.borrow_mut().push(BudgetEv::Spend(k, n));
    }
}

impl Budgets {
    /// The budgets left after a printing whose log this is, from `left`, when the printing would have been
    /// the same with those (every test with the same outcome); else None.
    fn replay(log: &[BudgetEv], mut left: [i64; 2]) -> Option<[i64; 2]> {
        for ev in log {
            match *ev {
                BudgetEv::Test(k, ok) => {
                    if (left[k as usize] > 0) != ok {
                        return None;
                    }
                }
                BudgetEv::Spend(k, n) => left[k as usize] -= n,
            }
        }
        Some(left)
    }
    /// Whether the printing tested budget `k`.
    fn tests(log: &[BudgetEv], k: BK) -> bool {
        log.iter().any(|ev| matches!(*ev, BudgetEv::Test(x, _) if x == k))
    }
}

/// A budget no printing exhausts (a speculative printing's budget while the real one is positive).
const UNBOUNDED: i64 = i64::MAX / 4;

/// The shared state of the parallel printing. The printing of a function reads the decompilation state
/// (`Dx`: every cache in it is thread-safe) and the outlines, and appends nodes to that function's IR
/// arena only (it reads no other function's arena): each arena is used by one thread at a time, so
/// sharing the (not `Sync`) arenas is sound. Nothing else writes the state while the threads run (`Dx`
/// is only changed between the runs, by the argument views of the instructions).
struct ParPrint<'a, 'p> {
    d: &'a Dx<'p>,
    finals: &'a [Tree],
    outl: &'a Outlines,
    helper_names: &'a HashSet<String>,
}
unsafe impl Sync for ParPrint<'_, '_> {}

/// A printed function and its budget log, handed from a worker thread (the node keys it holds are
/// addresses in the shared trees, only used as keys). None: the printing threw.
struct SendPrinted(Option<Printed>, Vec<BudgetEv>);
unsafe impl Send for SendPrinted {}

impl ParPrint<'_, '_> {
    /// The function printed with the given budgets on this thread (a panic unwinds).
    fn print(&self, fi: usize, view: Option<String>, left: [i64; 2]) -> SendPrinted {
        let bud = Budgets::new(left);
        let p = print_body(self.d, fi, &self.finals[fi], self.outl, self.helper_names, view, &bud);
        SendPrinted(Some(p), bud.log.into_inner())
    }
    /// The function printed speculatively (a panic gives None: it is printed again for real).
    fn try_print(&self, fi: usize, view: Option<String>, left: [i64; 2]) -> SendPrinted {
        speculate(|| self.print(fi, view, left)).unwrap_or(SendPrinted(None, Vec::new()))
    }
}



/// Every function's text and facts, as printed one after the other in function order (each function's
/// facts right after its text), on `threads` threads. Order matters through three things:
/// - the argument views of the instructions, added to the shared view table before each function is
///   printed: the functions between two additions (a segment) are printed together;
/// - the concrete-run budgets, spent in function order: the functions are printed speculatively with
///   unbounded budgets (those still positive) and checked in order against the real budgets by their
///   logs; the first one whose printing would have been different is printed again with the real
///   budgets, and the later ones that tested a budget it exhausted are printed again speculatively (at
///   most twice: two budgets);
/// - the flow layer's memos (native programs' facts): the facts are made in order on this thread (Anchor
///   programs' facts do not use it: on the worker threads).
/// A panic while speculating is caught; the computation is redone for real in its sequential turn (the
/// same panic, its message printed then from this thread). The result is the one of the sequential
/// printing, for any thread count.
fn print_all<'p: 'f, 'f>(
    dm: &mut Dx<'p>,
    finals: &[Tree],
    outl: &Outlines,
    helper_names: &HashSet<String>,
    fl: &FlowCtx<'f>,
    threads: usize,
) -> Vec<(Printed, FnFacts)> {
    let n = dm.fs.len();
    let mut out: Vec<(Printed, FnFacts)> = Vec::with_capacity(n);
    let mut left: [i64; 2] = [250_000, 150_000];
    let mut i = 0;
    while i < n {
        // the segment: its first function may add views; the next ones up to one that would add
        let mut views = vec![add_args_view(dm, i)];
        let mut j = i + 1;
        while j < n {
            match args_view_of(dm, j) {
                ArgsView::New => break,
                ArgsView::None => views.push(None),
                ArgsView::Existing(v) => views.push(Some(v)),
            }
            j += 1;
        }
        let pp = ParPrint {
            d: dm,
            finals,
            outl,
            helper_names,
        };
        let spec = |left: [i64; 2]| left.map(|b| if b > 0 { UNBOUNDED } else { b });
        let mut regime = spec(left);
        let mut got: Vec<Option<SendPrinted>> = (i..j).map(|_| None).collect();
        let mut todo: Vec<usize> = (0..j - i).collect();
        // (the first function whose printing panics for real: the later ones are not printed)
        let mut stop = j - i;
        let mut k = 0;
        while k < stop {
            let rs = par_map_big(todo.len(), threads, |t| {
                let x = todo[t];
                pp.try_print(i + x, views[x].clone(), regime)
            });
            for (x, r) in todo.iter().zip(rs) {
                got[*x] = Some(r);
            }
            todo.clear();
            // in order: keep the printings the real budgets give the same result
            while k < stop {
                let r = got[k].as_ref().unwrap();
                if r.0.is_some() {
                    if let Some(l) = Budgets::replay(&r.1, left) {
                        left = l;
                        k += 1;
                        continue;
                    }
                }
                // printed again with the real budgets, then the later ones that tested a budget it exhausted
                let r = pp.try_print(i + k, views[k].clone(), left);
                if r.0.is_none() {
                    stop = k;
                    break;
                }
                left = Budgets::replay(&r.1, left).expect("the real budgets");
                got[k] = Some(r);
                k += 1;
                let now = spec(left);
                for b in [BK::Exec, BK::Wrap] {
                    if now[b as usize] != regime[b as usize] {
                        for x in k..j - i {
                            if !todo.contains(&x) && Budgets::tests(&got[x].as_ref().unwrap().1, b) {
                                todo.push(x);
                            }
                        }
                    }
                }
                todo.sort();
                regime = now;
                if !todo.is_empty() {
                    break;
                }
            }
        }
        let printed: Vec<Printed> = got
            .into_iter()
            .take(stop)
            .map(|r| r.unwrap().0.unwrap())
            .collect();
        // the facts
        let facts: Vec<FnFacts> = if dm.sem.anchor {
            let pf = ParFacts {
                d: dm,
                finals,
                printed: &printed,
            };
            let rs = par_map_big(printed.len(), threads, |x| pf.try_facts(x));
            rs.into_iter()
                .enumerate()
                .map(|(x, r)| match r.0 {
                    Some(ff) => ff,
                    None => pf.facts(x),
                })
                .collect()
        } else {
            printed
                .iter()
                .map(|p| func_facts(&*dm, &finals[p.fi], p, Some(fl)))
                .collect()
        };
        out.extend(printed.into_iter().zip(facts));
        if stop < j - i {
            // (the printing that panics, in its turn)
            let _ = pp_real(dm, finals, outl, helper_names, i + stop, views[stop].clone(), left);
            unreachable!("the printing panicked while speculating");
        }
        i = j;
    }
    // (the printer's statement table is left, as after printing the functions one by one on this thread)
    if let Some(t) = finals.last() {
        TREE_STMTS.with(|x| *x.borrow_mut() = t.stmts.clone());
    }
    out
}

/// A function printed for real on this thread.
fn pp_real(
    d: &Dx,
    finals: &[Tree],
    outl: &Outlines,
    helper_names: &HashSet<String>,
    fi: usize,
    view: Option<String>,
    left: [i64; 2],
) -> Printed {
    let bud = Budgets::new(left);
    print_body(d, fi, &finals[fi], outl, helper_names, view, &bud)
}

/// The facts of an Anchor program's printed functions (they do not use the flow layer), shared by the
/// worker threads: the state is read only (see `ParPrint`; the facts append to no IR arena).
struct ParFacts<'a, 'p> {
    d: &'a Dx<'p>,
    finals: &'a [Tree],
    printed: &'a [Printed],
}
unsafe impl Sync for ParFacts<'_, '_> {}

struct SendFacts(Option<FnFacts>);
unsafe impl Send for SendFacts {}

impl ParFacts<'_, '_> {
    fn facts(&self, x: usize) -> FnFacts {
        let p = &self.printed[x];
        func_facts(self.d, &self.finals[p.fi], p, None)
    }
    fn try_facts(&self, x: usize) -> SendFacts {
        SendFacts(speculate(|| self.facts(x)))
    }
}

pub fn run(
    mut dm: Dx,
    _name_fn: Option<i64>,
    hook: Option<AnalysisHook>,
    threads: usize,
) -> Result<ReadOut, String> {
    let d = &dm;
    let n = d.fs.len();
    // finalBody: `x = undef` of variables never assigned anything else is dropped
    let mut finals: Vec<Tree> = Vec::with_capacity(n);
    for (i, f) in d.fs.iter().enumerate() {
        let ir = f.ir.as_ref().unwrap();
        let t = &d.trees[i];
        let only = undef_only(ir, t, &t.body, &|v| is_param(f, v));
        let body = strip_undef(ir, t, &t.body, &only);
        finals.push(Tree {
            stmts: t.stmts.clone(),
            body,
            irreducible: t.irreducible,
            origin: t.origin.clone(),
        });
    }
    // outlines
    let outl: Outlines = {
        let fns: Vec<OutlineFn> =
            d.fs.iter()
                .enumerate()
                .map(|(i, f)| {
                    let fp = fp_var(f);
                    let mut bases: Vec<N> = match fp {
                        Some(fp) => d.frame_offsets(i, fp).iter().map(|k| k.get()).collect(),
                        None => vec![],
                    };
                    bases.sort_by(|a, b| a.partial_cmp(b).unwrap());
                    OutlineFn {
                        f,
                        tree: &finals[i],
                        fp,
                        ret: if d.out_params.contains(&f.pc) {
                            param_var(f, 1)
                        } else {
                            None
                        },
                        bases,
                        no_const_stores: d.sem.result_ok_tag.is_some(),
                    }
                })
                .collect();
        let taken = |nm: &str| {
            d.is_global(nm)
                || d.views.map.contains_key(nm)
                || d.views.opaque.contains_key(nm)
                || RESERVED_TS.contains(&nm)
        };
        find_outlines(&fns, &taken)
    };
    let helper_names: HashSet<String> = outl.helpers.iter().map(|h| h.name.clone()).collect();
    let mut funcs: Vec<ReadFunc> = Vec::new();
    // the analysis' flow layer (native account resolution: what calls write through frame pointers)
    let callee = {
        let fs: Vec<&Func> = d.fs.clone();
        let idx = d.idx.clone();
        let pn = d.pn.clone();
        Callee::new(
            Box::new(move |pc| idx.get(&pc).map(|&i| fs[i])),
            Box::new(move |pc| pn.fn_name(pc)),
            d.legacy,
        )
    };
    let fl = FlowCtx::new(callee);
    let mut snaps: Vec<SugarSnap> = Vec::with_capacity(n);
    for (pd, ff) in print_all(&mut dm, &finals, &outl, &helper_names, &fl, threads) {
        let (rf, sn) = read_func(&dm, pd, ff);
        funcs.push(rf);
        snaps.push(sn);
    }
    let d = &dm;
    // the analysis facts; Anchor try-call checks: what the callee whose result they test checks
    let mut facts: IndexMap<i64, FnFacts> = IndexMap::default();
    for rf in funcs.iter_mut() {
        if let Some(ff) = rf.facts.take() {
            facts.insert(rf.pc, ff);
        }
    }
    if d.sem.anchor {
        let mut memo: HashMap<i64, Vec<&'static str>> = HashMap::default();
        let en = |v: u64| d.sem.anchor_error(v);
        for ff in facts.values_mut() {
            for c in ff.checks.iter_mut() {
                let Some(b) = c.before else { continue };
                if !c.kinds.is_empty() || c.named.is_none() {
                    continue;
                }
                let ks = crate::analysis::facts::callee_checks(d.ctx, b, &en, &mut memo, 2);
                if !ks.is_empty() {
                    c.via = Some((d.fn_name(b), ks));
                }
            }
        }
    }
    // the outlined helpers' definitions
    let mut outlined = Vec::new();
    for h in &outl.helpers {
        let hs = HelperSugar { d };
        let names: Vec<Option<String>> = h.names.iter().map(|x| Some(x.clone())).collect();
        let mut pr = Printer::new(&h.ir, &d.pn, &names).with_sugar(&hs);
        let (decls, hoisted, _) = declarations_of(&h.ir, &h.vars, &h.tree, &h.tree.body);
        let body = print_nodes(&mut pr, &h.tree, &h.tree.body, "\t", &decls, &hoisted);
        let mut lines = vec![
            format!("// outlined: {} places", h.uses),
            format!(
                "function {}({}){} {{",
                h.name,
                h.params
                    .iter()
                    .map(|p| format!("{p}: u64"))
                    .collect::<Vec<_>>()
                    .join(", "),
                if h.value { ": u64" } else { "" }
            ),
        ];
        lines.extend(body);
        lines.push("}".into());
        outlined.push((h.name.clone(), lines.join("\n")));
    }
    let instructions: Vec<IxRow> = d
        .sem
        .ix_names
        .iter()
        .filter(|(pc, _)| d.idx.contains_key(pc))
        .map(|(pc, name)| {
            let dd = d
                .idl
                .and_then(|i| i.instructions.iter().find(|x| &x.name == name));
            IxRow {
                name: name.clone(),
                pc: *pc,
                disc: dd.map_or_else(|| d.sem.disc_of(name), |x| x.disc),
                args: dd.map(|x| x.args.clone()),
                accounts: dd.map(|x| x.accounts.clone()),
                str_accounts: d.str_accounts.get(pc).cloned(),
            }
        })
        .collect();
    let processors: Vec<(String, Vec<String>)> = d
        .sem
        .processors
        .iter()
        .filter(|(pc, _)| d.idx.contains_key(pc))
        .map(|(pc, names)| (d.fn_name(*pc), names.clone()))
        .collect();
    // the analysis: the dumps' hook, else the outputs' analysis (security/, the single file's summary)
    let (flow, analysis) = {
        {
            let dx = shorten_dx(&dm);
            let fnrefs: Vec<crate::analysis::FnRef> = funcs
                .iter()
                .enumerate()
                .map(|(i, rf)| crate::analysis::FnRef {
                    pc: rf.pc,
                    name: rf.name.clone(),
                    f: dx.fs[i],
                    text: rf.text.clone(),
                    names: rf.names.clone(),
                })
                .collect();
            let mut an = Box::new(crate::analysis::An::new(
                dx.p,
                fl,
                fnrefs,
                facts.clone(),
                instructions.clone(),
                processors.clone(),
                dx.sem.anchor,
                dx.idl,
                &dx.views,
                dx.legacy,
                dx.try_of.clone(),
                dx.acct_layouts.clone(),
                expr_printer(dx, snaps),
            ));
            an.lib_pcs = dm.libs.iter().filter(|x| x.1.lib).map(|x| *x.0).collect();
            an.program_id = dm.state_idl_address.clone();
            match hook {
                Some(h) => (Some(h(&an)), None),
                None => (None, Some(an.analysis_out()?)),
            }
        }
    };
    let d = &dm;
    Ok(ReadOut {
        version: d.p.version,
        n_insns: d.p.insns.len(),
        n_funcs: d.p.funcs.len(),
        funcs,
        outlined,
        views: d.views.clone(),
        instructions,
        processors,
        anchor: d.sem.anchor,
        stubs: d.stubs.clone(),
        lib_count: d.libs.values().filter(|i| i.lib).count(),
        lib_pcs: d.libs.iter().filter(|x| x.1.lib).map(|x| *x.0).collect(),
        fn_names: d.p.funcs.keys().map(|&pc| (pc, d.fn_name(pc))).collect(),
        shapes: Vec::new(),
        program: None,
        facts,
        flow,
        analysis,
        trees: finals,
        legacy: d.legacy,
        try_of: d.try_of.clone(),
        acct_layouts: d.acct_layouts.clone(),
        program_id: d.state_idl_address.clone(),
        threads,
    })
}

fn is_short_temp(n: &str) -> bool {
    // /^([a-z]{1,2}|v\d+)$/
    let b = n.as_bytes();
    (!b.is_empty() && b.len() <= 2 && b.iter().all(|c| c.is_ascii_lowercase()))
        || (b.len() > 1 && b[0] == b'v' && b[1..].iter().all(|c| c.is_ascii_digit()))
}

#[allow(clippy::too_many_arguments)]
fn print_body<'p>(
    d: &Dx<'p>,
    fi: usize,
    tree: &Tree,
    outl: &Outlines,
    helper_names: &HashSet<String>,
    args_view: Option<String>,
    bud: &Budgets,
) -> Printed {
    let f = d.fs[fi];
    let pc = f.pc;
    let ir = f.ir.as_ref().unwrap();
    let body = &tree.body;
    let (decls, hoisted, used_v) = declarations_of(ir, &f.vars, tree, body);
    let used = |v: u32| used_v.get(v as usize).copied().unwrap_or(false);
    let mut names: Vec<Option<String>> = vec![None; f.vars.len().max(used_v.len())];
    let set_name = |names: &mut Vec<Option<String>>, v: u32, s: String| {
        if v as usize >= names.len() {
            names.resize(v as usize + 1, None);
        }
        names[v as usize] = Some(s);
    };
    let zero_init: Vec<u32> = if f.is_entry {
        f.vars
            .iter()
            .filter(|v| v.param >= 0 && v.param != 1 && v.param != 10 && used(v.id))
            .map(|v| v.id)
            .collect()
    } else {
        vec![]
    };
    for v in &f.vars {
        if v.param >= 100 {
            set_name(&mut names, v.id, format!("p{}", 5 + v.param - 100));
        } else if v.param >= 0 && !zero_init.contains(&v.id) {
            let s = if f.is_entry && v.param == 1 {
                Some("input".to_string())
            } else {
                PARAM_NAME.get(v.param as usize).map(|s| s.to_string())
            };
            if let Some(s) = s {
                set_name(&mut names, v.id, s);
            } else {
                names[v.id as usize] = None;
            }
        } else if v.reg == -1 {
            set_name(&mut names, v.id, "state".into());
        }
    }
    let mut gen = ShortNames { k: 0 };
    for v in &f.vars {
        if names.get(v.id as usize).cloned().flatten().is_none() && used(v.id) {
            let nm = gen.next().unwrap();
            set_name(&mut names, v.id, nm);
        }
    }
    if d.out_params.contains(&pc) {
        if let Some(a) = param_var(f, 1) {
            if !names.iter().any(|x| x.as_deref() == Some("ret")) {
                set_name(&mut names, a, "ret".into());
            }
        }
    }
    let an = d.anchor_info.get(&pc);
    let mut recovered: Vec<String> = Vec::new();
    let taken: RefCell<Option<HashSet<String>>> = RefCell::new(None);
    let is_taken = |nm: &str, names: &Vec<Option<String>>| -> bool {
        let mut t = taken.borrow_mut();
        let t = t.get_or_insert_with(|| names.iter().flatten().cloned().collect());
        t.contains(nm)
            || d.is_global(nm)
            || d.views.map.contains_key(nm)
            || d.views.opaque.contains_key(nm)
            || RESERVED_TS.contains(&nm)
            || helper_names.contains(nm)
    };
    let unique = |nm0: &str, names: &Vec<Option<String>>| -> String {
        let mut nm = nm0.to_string();
        let mut k = 2;
        while is_taken(&nm, names) {
            nm = format!("{nm0}_{k}");
            k += 1;
        }
        taken.borrow_mut().as_mut().unwrap().insert(nm.clone());
        nm
    };
    // IDL: the instruction data as a view of its arguments
    let mut arg_types: IndexMap<u32, String> = IndexMap::default();
    let mut arg_names: Vec<String> = Vec::new();
    let ix_name = d.sem.ix_names.get(&pc).cloned();
    let ix_def = ix_name.as_ref().and_then(|ix| {
        d.idl
            .and_then(|i| i.instructions.iter().find(|x| &x.name == ix))
    });
    if let Some(ix_def) = ix_def.filter(|x| !x.arg_defs.is_empty()) {
        let view = args_view;
        let found = view.as_ref().and_then(|v| args_var(d, fi, v));
        if let (Some(found), Some(view)) = (found, &view) {
            if used(found) {
                arg_types.insert(found, view.clone());
                let nm = unique("args", &names);
                set_name(&mut names, found, nm.clone());
                arg_names.push(nm);
                let vfields = d.views.map[view].fields.clone();
                for b in &f.blocks {
                    for st in &b.stmts {
                        let Stmt::Set { dst, e, .. } = st else {
                            continue;
                        };
                        let Node::Load { size, addr } = ir.get(*e) else {
                            continue;
                        };
                        let dst = *dst as u32;
                        if !used(dst) || is_param(f, dst) {
                            continue;
                        }
                        let off: N = match ir.get(addr) {
                            Node::Var(v) if v == found => 0.0,
                            Node::Bin(BinOp::Add, a, c) => match (ir.get(a), ir.get(c)) {
                                (Node::Var(v), Node::Const(c)) if v == found => c as N,
                                _ => -1.0,
                            },
                            _ => -1.0,
                        };
                        let fd = if off >= 0.0 {
                            vfields
                                .iter()
                                .find(|x| x.off == off && x.t == FT::Scalar(size))
                        } else {
                            None
                        };
                        let Some(fd) = fd else { continue };
                        if d.def_count(pc, dst) != 1 {
                            continue;
                        }
                        let nm = unique(&fd.name, &names);
                        set_name(&mut names, dst, nm.clone());
                        arg_names.push(nm);
                    }
                }
            }
        }
    }
    // Anchor dispatcher / handler ABI names
    let mut abi_nm: Vec<String> = Vec::new();
    if let Some(m) = d.abi_names.get(&pc) {
        for (v, nm) in m {
            if used(*v) && !arg_types.contains_key(v) {
                let u = unique(nm, &names);
                set_name(&mut names, *v, u.clone());
                abi_nm.push(u);
            }
        }
    }
    if let Some(m) = d.data_vars.get(&pc) {
        for (v, t) in m {
            if !used(*v) || arg_types.contains_key(v) || param_of(f, *v) == Some(10) {
                continue;
            }
            let base = t
                .strip_suffix("Account")
                .or_else(|| t.strip_suffix("Record"))
                .unwrap_or(t);
            let nm = format!(
                "{}{}",
                camel_us(base).to_lowercase(),
                if t.ends_with("Record") {
                    "_acc"
                } else {
                    "_data"
                }
            );
            let u = unique(&nm, &names);
            set_name(&mut names, *v, u);
        }
    }
    let objs = d.obj_vars.get(&pc);
    if let Some(o) = objs {
        for (v, a) in &o.boxes {
            if used(*v) && param_of(f, *v) != Some(10) && !arg_types.contains_key(v) {
                let u = unique(&format!("{}_box", a.name), &names);
                set_name(&mut names, *v, u.clone());
                recovered.push(u);
            }
        }
    }
    if let Some(an) = an {
        let mut vn: Vec<(u32, String)> =
            an.var_names.iter().map(|(v, n)| (*v, n.clone())).collect();
        vn.sort_by_key(|x| x.0);
        for (v, nm0) in vn {
            if !used(v)
                || param_of(f, v) == Some(10)
                || arg_types.contains_key(&v)
                || d.data_vars.get(&pc).is_some_and(|m| m.contains_key(&v))
            {
                continue;
            }
            let u = unique(&nm0, &names);
            set_name(&mut names, v, u.clone());
            recovered.push(u);
        }
    }
    // the entry input
    let input_var0 = if f.is_entry { param_var(f, 1) } else { None };
    let input_var = input_var0.filter(|iv| {
        !f.blocks
            .iter()
            .any(|b| b.stmts.iter().any(|s| matches!(s, Stmt::Set { dst, .. } | Stmt::Call { dst, .. } if *dst == *iv as i32)))
    });
    let acc_typed = Some(&d.account_infos[fi]);
    // typed views
    let mut var_types: IndexMap<u32, String> = IndexMap::default();
    let mut data_notes: Vec<String> = Vec::new();
    let mut ctx_notes: Vec<String> = Vec::new();
    if let Some(bt) = d.base_types.get(&pc) {
        for (v, t) in bt {
            if used(*v) || is_param(f, *v) {
                var_types.insert(*v, t.clone());
            }
        }
    }
    for (v, t) in &arg_types {
        var_types.insert(*v, t.clone());
    }
    if let Some(m) = d.param_types.get(&pc) {
        for (v, (t, why)) in m {
            if var_types.get(v) == Some(t) {
                if let Some(Some(nm)) = names.get(*v as usize) {
                    ctx_notes.push(format!("{nm}: {t} ({why})"));
                }
            }
        }
    }
    if let Some(&tag) = d.out_tags.get(&pc) {
        if let Some(a) = param_var(f, 1) {
            if !var_types.contains_key(&a)
                && names.get(a as usize).cloned().flatten().as_deref() == Some("ret")
            {
                let t = format!("Tagged{}", tag * 8);
                var_types.insert(a, t.clone());
                ctx_notes.push(format!(
                    "ret: {t} (every store at ret + 0 is a constant: an enum's variant tag)"
                ));
            }
        }
    }
    if let Some(m) = d.data_vars.get(&pc) {
        for (v, t) in m {
            if var_types.get(v) == Some(t) && used(*v) {
                data_notes.push(format!(
                    "{}: {t}",
                    names
                        .get(*v as usize)
                        .cloned()
                        .flatten()
                        .unwrap_or_else(|| "undefined".into())
                ));
            }
        }
    }
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
                if var_types.contains_key(&dv)
                    || !used(dv)
                    || is_param(f, dv)
                    || d.def_count(pc, dv) != 1
                {
                    continue;
                }
                let t = {
                    let vt = &var_types;
                    d.set_type(fi, *e, &|id| vt.get(&id).cloned())
                };
                if let Some(t) = t {
                    if d.views.map.contains_key(&t) {
                        var_types.insert(dv, t);
                        grew = true;
                    }
                }
            }
        }
        it += 1;
    }
    if let Some(iv) = input_var {
        var_types.insert(iv, "Input".into());
    }
    for b in &f.blocks {
        for st in &b.stmts {
            let Stmt::Set { dst, e, .. } = st else {
                continue;
            };
            let dv = *dst as u32;
            let Node::Load { size: 8, addr: a } = ir.get(*e) else {
                continue;
            };
            let cur = names
                .get(dv as usize)
                .cloned()
                .flatten()
                .unwrap_or_default();
            if !used(dv) || is_param(f, dv) || !is_short_temp(&cur) || d.def_count(pc, dv) != 1 {
                continue;
            }
            let bv = match ir.get(a) {
                Node::Var(v) => Some(v),
                Node::Bin(BinOp::Add, x, c) if matches!(ir.get(c), Node::Const(_)) => var_of(ir, x),
                _ => None,
            };
            let off = match ir.get(a) {
                Node::Bin(_, _, c) => match ir.get(c) {
                    Node::Const(c) => n_s(c),
                    _ => 0.0,
                },
                _ => 0.0,
            };
            let Some(t) = bv.and_then(|b| var_types.get(&b)) else {
                continue;
            };
            if !(t.ends_with("Accounts") || t.ends_with("Context")) || off < 0.0 {
                continue;
            }
            let Some(r) = d.views.resolve(t, off) else {
                continue;
            };
            if r.rest != 0.0 || !matches!(r.last, FT::Ref(_)) {
                continue;
            }
            let last = r.path.last().unwrap();
            let base = match last.rfind('[') {
                Some(i)
                    if last.ends_with(']')
                        && last[i + 1..last.len() - 1]
                            .bytes()
                            .all(|c| c.is_ascii_digit())
                        && last.len() - i > 2 =>
                {
                    &last[..i]
                }
                _ => last.as_str(),
            };
            let u = unique(base, &names);
            set_name(&mut names, dv, u);
        }
    }
    // Result tags (u32 layout) and stored strings
    let mut ok_at: Vec<E> = Vec::new();
    if let Some(ok) = d.sem.result_ok_tag {
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Store {
                    size: 4, v, addr, ..
                } = s
                {
                    if ir.get(*v) == Node::Const(ok)
                        && !ok_at.iter().any(|&x| expr_eq(ir, x, *addr))
                    {
                        ok_at.push(*addr);
                    }
                }
            }
        }
        if d.result_out.contains(&pc) {
            if let Some(a) = param_var(f, 1) {
                ok_at.push(ir.var(a));
            }
        }
    }
    let stored = stored_strings(ir, tree, body);
    // outlined uses in this function
    let mut outl_map: HashMap<(*const Vec<SNode>, usize), (String, Vec<E>, bool)> = HashMap::default();
    for ((ffi, list), m) in &outl.at {
        if *ffi != fi {
            continue;
        }
        for (i, u) in m {
            let h = &outl.helpers[u.helper];
            outl_map.insert((*list, *i), (h.name.clone(), u.args.clone(), h.value));
        }
    }
    // CPI sites
    let fp_v = fp_var(f);
    let sites = match fp_v {
        Some(fpv) => find_cpi_sites(ir, tree, body, Some(fpv), &|t: &CallTarget| match t {
            CallTarget::Sys { name, .. } => Some(invoke_abi(name).unwrap_or(SiteKind::Call)),
            CallTarget::Fn { pc: t } => Some(
                d.invoke_thunks
                    .get(t)
                    .copied()
                    .or_else(|| pda_abi(&d.fn_name(*t)))
                    .or_else(|| d.pda_wrappers.get(t).copied())
                    .unwrap_or(if d.invoke_wrappers.contains(t) {
                        SiteKind::Invoke
                    } else {
                        SiteKind::Call
                    }),
            ),
            _ => None,
        }),
        None => sbpf_ir::fx::IndexMap::default(),
    };
    let site_list: Vec<&CpiSite> = sites.values().map(|x| &x.1).collect();
    let site_notes: Rc<RefCell<HashMap<NodeKey, SiteNote>>> = Rc::new(RefCell::new(HashMap::default()));
    TREE_STMTS.with(|t| *t.borrow_mut() = tree.stmts.clone());
    let sugar = FnSugar {
        d,
        var_types: var_types.clone(),
        input_var,
        acc_typed,
        in_addr: Cell::new(false),
        frame: RefCell::new(None),
        ok_at,
        stored,
        outl: outl_map,
        note: RefCell::new(None),
        arg_notes: !d.error_from.is_empty(),
        ir,
        spans: RefCell::new(HashMap::default()),
    };
    let names_final = names.clone();
    // the CPI node notes
    if fp_v.is_some() && !sites.is_empty() {
        let fpv = fp_v.unwrap();
        let taint = d.taint.get(&pc);
        let defs_by_key: RefCell<Option<HashMap<String, u32>>> = RefCell::new(None);
        let names_r = names_final.clone();
        let exec_memo: RefCell<HashMap<(i64, u8), (Option<crate::cpi::CpiDesc>, i64)>> =
            RefCell::new(HashMap::default());
        let sites_by_node: HashMap<*const SNode, CpiSite> =
            sites.iter().map(|(k, v)| (*k, v.1.clone())).collect();
        let tree_ref = tree;
        let notes_w = site_notes.clone();
        let note = move |pr: &mut Printer, n: &SNode| -> Option<String> {
            let s = sites_by_node.get(&(n as *const SNode))?;
            let named = |e: E| -> E {
                if defs_by_key.borrow().is_none() {
                    let mut m: HashMap<String, u32> = HashMap::default();
                    for b in &f.blocks {
                        for st in &b.stmts {
                            let Stmt::Set { dst, e, .. } = st else {
                                continue;
                            };
                            let dv = *dst as u32;
                            if names_r.get(dv as usize).cloned().flatten().is_none() {
                                continue;
                            }
                            if !matches!(ir.get(*e), Node::Load { .. } | Node::Bin(..))
                                || d.def_count(pc, dv) != 1
                            {
                                continue;
                            }
                            m.entry(jkey_s(ir, *e)).or_insert(dv);
                        }
                    }
                    *defs_by_key.borrow_mut() = Some(m);
                }
                let m = defs_by_key.borrow();
                map_expr(ir, e, &mut |x| {
                    if matches!(ir.get(x), Node::Load { .. } | Node::Bin(..)) {
                        if let Some(&v) = m.as_ref().unwrap().get(&jkey_s(ir, x)) {
                            return ir.var(v);
                        }
                    }
                    x
                })
            };
            let pcheck = |ptr: E| key_compares(d, f, ptr);
            let tainted = |e: E| expr_tainted(taint, ir, e, Some(fpv));
            let ka = |a: u64| d.sem.key_at(a);
            let sa = |a: u64, n: u64| d.sem.str_at(a, n, true);
            let cn = |v: u64| d.sem.const_comment(v, 0);
            let fa = |a: u64| d.pn.by_addr.get(&a).cloned();
            let rd = |a: u128, n: usize| d.sem.read_ro(a, n);
            let mut ex = |e: E| pr.u(e, 0, true);
            let mut env = CpiEnv {
                ir,
                fp: Some(fpv),
                expr: &mut ex,
                key_at: Some(&ka),
                str_at: Some(&sa),
                const_name: Some(&cn),
                read: Some(&rd),
                program_check: Some(&pcheck),
                fn_at: Some(&fa),
                named: Some(&named),
                tainted: Some(&tainted),
            };
            let dd = cpi_desc(s, &mut env);
            // (not the undecoded CPI inside an invoke wrapper, decoded at its call sites)
            let in_wrapper = !s.abi.is_pda()
                && d.invoke_wrappers.contains(&pc)
                && dd.as_ref().is_none_or(|x| x.family.is_none());
            if s.abi != SiteKind::Call && !in_wrapper {
                notes_w.borrow_mut().insert(
                    n as *const SNode,
                    SiteNote {
                        pda: s.abi.is_pda(),
                        desc: dd.clone(),
                        via: None,
                    },
                );
            }
            if let Some(CallTarget::Fn { pc: t }) = &s.t {
                if d.pda_wrappers.contains_key(t) {
                    let s2 = CpiSite {
                        abi: SiteKind::Call,
                        ..s.clone()
                    };
                    return cpi_desc(&s2, &mut env).map(|x| x.text);
                }
            }
            let kind = match &s.t {
                Some(CallTarget::Sys { .. }) => {
                    if matches!(s.abi, SiteKind::C | SiteKind::Rust) {
                        Some(ExecSiteKind::Sys)
                    } else {
                        None
                    }
                }
                Some(CallTarget::Fn { pc: t }) => {
                    if d.invoke_thunks.contains_key(t)
                        && matches!(s.abi, SiteKind::C | SiteKind::Rust)
                    {
                        Some(ExecSiteKind::Thunk)
                    } else if d.invoke_wrappers.contains(t) {
                        Some(ExecSiteKind::Wrapper)
                    } else {
                        None
                    }
                }
                _ => None,
            };
            let decoded = dd
                .as_ref()
                .is_some_and(|x| x.family.is_some() && !x.guessed);
            if let Some(kind) = kind {
                if !decoded && bud.test(BK::Exec) {
                    let at = match n {
                        SNode::Stmt(si) if matches!(tree_ref.stmt(*si), Stmt::Call { .. }) => {
                            Some(stmt_pc(tree_ref.stmt(*si)))
                        }
                        _ => {
                            let t = match &s.t {
                                Some(CallTarget::Fn { pc: t }) => Some(format!("fn:{t}")),
                                Some(CallTarget::Sys { name, .. }) => Some(format!("sys:{name}")),
                                _ => None,
                            };
                            let l = t.map(|t| call_insns(d, pc, &t)).unwrap_or_default();
                            if l.len() == 1 {
                                Some(l[0])
                            } else {
                                None
                            }
                        }
                    };
                    if let Some(at) = at {
                        let k = (at, kind as u8);
                        let hit = exec_memo.borrow().get(&k).cloned();
                        let r = match hit {
                            Some(r) => {
                                bud.spend(BK::Exec, r.1);
                                r
                            }
                            None => {
                                let mut b = ExecBudget { steps: bud.left(BK::Exec) };
                                let m = describe_model(d.ctx, f, at, kind, &mut env, &mut b);
                                let spent = bud.left(BK::Exec) - b.steps;
                                bud.spend(BK::Exec, spent);
                                let x = m.and_then(|m| m.format(&mut env));
                                let r = (x, spent);
                                exec_memo.borrow_mut().insert(k, r.clone());
                                r
                            }
                        };
                        if let Some(x) = r.0 {
                            let t = x.text.clone();
                            notes_w.borrow_mut().insert(
                                n as *const SNode,
                                SiteNote {
                                    pda: false,
                                    desc: Some(x),
                                    via: None,
                                },
                            );
                            return Some(t);
                        }
                    }
                }
            }
            dd.map(|x| x.text)
        };
        *sugar.note.borrow_mut() = Some(Box::new(note));
    }
    let mut pr = Printer::new(ir, &d.pn, &names_final).with_sugar(&sugar);
    // (analysis only: CPIs made through small user functions wrapping invoke; runs with their own budget)
    if let Some(fpv) = fp_v {
        if !d.user_invoke.is_empty() && bud.test(BK::Wrap) {
            wrapper_runs(d, f, tree, body, fpv, &mut pr, &site_notes, bud);
        }
    }
    // stack objects
    if let Some(fpv) = fp_v {
        let claims = frame_roles(d, f, &site_list, pc);
        let mut bases: IndexSet<K> = d.frame_offsets(fi, fpv);
        let mut obj_name: IndexMap<K, String> = IndexMap::default();
        let mut obj_type: IndexMap<K, String> = IndexMap::default();
        let mut obj_why: IndexMap<K, String> = IndexMap::default();
        let mut out_obj: HashSet<K> = HashSet::default();
        let mut extent_of: HashMap<K, N> = HashMap::default();
        let mut cl: Vec<(&K, &Vec<FrameClaim>)> = claims.iter().collect();
        cl.sort_by(|a, b| b.0.get().partial_cmp(&a.0.get()).unwrap());
        for (o, cs) in cl {
            let ov = o.get();
            if ov >= 0.0 || ov < -8192.0 || cs.iter().any(|c| c.name != cs[0].name) {
                continue;
            }
            bases.insert(*o);
            let nm = if cs[0].why == GENERIC_RESULT {
                cs[0].name.clone()
            } else {
                unique(&cs[0].name, &names)
            };
            obj_name.insert(*o, nm);
            obj_why.insert(*o, cs[0].why.clone());
            if cs[0].out {
                out_obj.insert(*o);
            }
            if let Some(x) = cs[0].extent.filter(|x| *x != 0.0) {
                extent_of.insert(*o, x);
            }
            if let Some(t) = &cs[0].ty {
                let all = cs.iter().all(|c| c.ty.as_ref() == Some(t));
                let ok = if builtin_name(t) {
                    d.views.is_builtin(t)
                } else {
                    d.views.map.contains_key(t)
                };
                if all && ok {
                    obj_type.insert(*o, t.clone());
                }
            }
        }
        let mut sorted: Vec<N> = bases.iter().map(|k| k.get()).collect();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let pick = |o: N| -> (N, N) {
            let mut b = o;
            for &x in &sorted {
                if x <= o && o - x < 512.0 {
                    b = x;
                }
                if x > o {
                    break;
                }
            }
            (b, o - b)
        };
        if !obj_type.is_empty() || !out_obj.is_empty() || !extent_of.is_empty() {
            for (off, size, copy, write) in frame_accesses(f, fpv) {
                let (b, dd) = pick(off);
                let bk = K::of(b);
                let t = obj_type.get(&bk).cloned();
                let x = extent_of.get(&bk).copied();
                let bad_t = match &t {
                    Some(t) => {
                        let sized = builtin_name(t)
                            || d.views
                                .map
                                .get(t)
                                .and_then(|v| v.size)
                                .is_some_and(|s| s != 0.0 && !s.is_nan());
                        !(if sized {
                            fits_access(&d.views, t, dd, size, copy)
                        } else {
                            copy || fits_loose(&d.views, t, dd, size)
                        })
                    }
                    None => false,
                };
                if bad_t || (write && out_obj.contains(&bk)) || x.is_some_and(|x| dd + size > x) {
                    obj_type.shift_remove(&bk);
                    obj_name.shift_remove(&bk);
                }
            }
        }
        let generic = |b: &K, obj_why: &IndexMap<K, String>| {
            obj_why.get(b).map(|s| s.as_str()) == Some(GENERIC_RESULT)
        };
        let claimed: Vec<N> = obj_name
            .keys()
            .filter(|b| !generic(b, &obj_why))
            .map(|k| k.get())
            .collect();
        let rg = {
            let tpc = d.try_of.get(&pc).copied();
            let ix = d.sem.ix_names.get(&pc).cloned();
            let pp = ix.as_ref().map(|x| pascal_ix(x));
            let accounts = match (&tpc, &pp) {
                (Some(_), Some(p)) if d.views.map.contains_key(&format!("{p}Accounts")) => {
                    Some(format!("{p}Accounts"))
                }
                _ => None,
            };
            let rc = RC {
                d,
                fp: fpv,
                bases: sorted.clone(),
                pc,
                tpc,
                ix,
                accounts,
                names: &names_final,
                var_types: &var_types,
            };
            let mut rg = frame_regions(ir, tree, body, &rc);
            let mut any = false;
            for r in rg.list.iter_mut() {
                if r.dropped {
                    continue;
                }
                if claimed.iter().any(|&c| c >= r.lo && c < r.hi) {
                    r.dropped = true;
                    continue;
                }
                r.name = unique(&r.name, &names);
                any = true;
            }
            if any {
                Some(rg)
            } else {
                None
            }
        };
        if let Some(rg) = &rg {
            let keys: Vec<K> = obj_name.keys().copied().collect();
            for b in keys {
                if generic(&b, &obj_why)
                    && rg
                        .list
                        .iter()
                        .any(|r| !r.dropped && b.get() >= r.lo && b.get() < r.hi)
                {
                    obj_name.shift_remove(&b);
                    obj_type.shift_remove(&b);
                }
            }
        }
        let keys: Vec<K> = obj_name.keys().copied().collect();
        for b in keys {
            if generic(&b, &obj_why) {
                let n0 = obj_name[&b].clone();
                let u = unique(&n0, &names);
                obj_name.insert(b, u);
            }
        }
        let typed = !obj_type.is_empty()
            || rg.as_ref().is_some_and(|rg| {
                rg.list
                    .iter()
                    .any(|r| r.ty.is_some() && !r.bad && !r.dropped)
            });
        *sugar.frame.borrow_mut() = Some(Frame {
            obj_name,
            obj_type,
            obj_why,
            sorted,
            rg,
            cur: Rc::new(Vec::new()),
            used: IndexMap::default(),
            typed,
        });
    }
    // header
    let param_type = |reg: i32| {
        f.vars
            .iter()
            .find(|x| x.param == reg)
            .and_then(|v| var_types.get(&v.id).cloned())
            .unwrap_or_else(|| "u64".into())
    };
    let param_nm = |reg: i32, dflt: String| {
        f.vars
            .iter()
            .find(|x| x.param == reg)
            .and_then(|v| names_final.get(v.id as usize).cloned().flatten())
            .unwrap_or(dflt)
    };
    let pdef = |r: i32| {
        PARAM_NAME
            .get(r as usize)
            .map_or("undefined".to_string(), |s| s.to_string())
    };
    let mut params: Vec<String> = Vec::new();
    let sa = f.stack_args.unwrap_or(0);
    if f.is_entry {
        params.push(format!("input: {}", param_type(1)));
    } else {
        let n = if sa > 0 { 4 } else { f.nparams as i32 };
        for r in 1..=n {
            params.push(format!("{}: {}", param_nm(r, pdef(r)), param_type(r)));
        }
        for k in 0..sa as i32 {
            params.push(format!(
                "{}: {}",
                param_nm(100 + k, format!("p{}", 5 + k)),
                param_type(100 + k)
            ));
        }
        for &r in &f.extra_in {
            params.push(format!(
                "{}: {}",
                param_nm(r as i32, pdef(r as i32)),
                param_type(r as i32)
            ));
        }
    }
    let name = d.fn_name(pc);
    let sig = format!(
        "function {name}({}){}",
        params.join(", "),
        if f.noreturn {
            ": never"
        } else if f.returns {
            ": u64"
        } else {
            ""
        }
    );
    let mut lines: Vec<String> = Vec::new();
    if let Some(h) = d.sem.func_comment(pc) {
        lines.push(format!("// {h}"));
    }
    for n in d.fn_notes.get(&pc).map_or(&[][..], |x| x.as_slice()) {
        lines.push(format!("// {n}"));
    }
    if let Some(h) = d.heur_names.get(&pc) {
        lines.push(format!("// {h}"));
    }
    if let Some(s) = d.sym_notes.get(&pc) {
        lines.push(format!("// symbol: {s}"));
    }
    if let Some(tp) = d.taint.get(&pc) {
        if !d.sem.ix_names.contains_key(&pc) {
            let ps: Vec<String> = f
                .vars
                .iter()
                .filter(|v| {
                    v.param >= 1
                        && v.param != 10
                        && tp.vars.contains_key(&v.id)
                        && names_final.get(v.id as usize).cloned().flatten().is_some()
                })
                .map(|v| {
                    format!(
                        "{} ({})",
                        names_final[v.id as usize].as_ref().unwrap(),
                        if tp.vars[&v.id] == crate::taint::TK::Ptr {
                            "points to it"
                        } else {
                            "value"
                        }
                    )
                })
                .collect();
            if !ps.is_empty() {
                lines.push(format!(
                    "// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: {}",
                    ps.join(", ")
                ));
            }
        }
    }
    if !abi_nm.is_empty() {
        lines.push(format!("// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: {}", abi_nm.join(", ")));
    }
    if !ctx_notes.is_empty() {
        lines.push(format!("// types [heur]: {}", ctx_notes.join("; ")));
    }
    if !data_notes.is_empty() {
        lines.push(format!("// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: {}", data_notes.join(", ")));
    }
    if !arg_names.is_empty() {
        lines.push(format!("// names [idl: argument names and layout; which variable holds the instruction data is inferred]: {}", arg_names.join(", ")));
    }
    if let Some(an) = an {
        let checks: Vec<String> = an
            .accounts
            .iter()
            .map(|nm| {
                let c = an.checks.get(nm).cloned().unwrap_or_default();
                if c.is_empty() {
                    nm.clone()
                } else {
                    format!("{nm} ({})", c.join(", "))
                }
            })
            .collect();
        lines.push(format!("// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: {}", checks.join(", ")));
        if !recovered.is_empty() {
            let idl_acc: HashSet<String> = d
                .idl
                .map(|i| {
                    i.instructions
                        .iter()
                        .flat_map(|x| {
                            x.accounts.iter().map(|a| {
                                a.split(' ')
                                    .next()
                                    .unwrap()
                                    .split('.')
                                    .next_back()
                                    .unwrap()
                                    .to_string()
                            })
                        })
                        .collect()
                })
                .unwrap_or_default();
            let tag = |nm: &str| {
                let base = {
                    let i = nm.rfind('_');
                    match i {
                        Some(i)
                            if nm[i + 1..].bytes().all(|c| c.is_ascii_digit())
                                && i + 1 < nm.len() =>
                        {
                            &nm[..i]
                        }
                        _ => nm,
                    }
                };
                if idl_acc.contains(base) {
                    format!("{nm} [idl]")
                } else {
                    nm.to_string()
                }
            };
            lines.push(format!(
                "// names [str: account-error string on the failing branch; which variable holds the account is inferred{}]: {}",
                if idl_acc.is_empty() { "" } else { "; [idl]: also an account name in the IDL" },
                recovered.iter().map(|x| tag(x)).collect::<Vec<_>>().join(", ")
            ));
        }
    }
    if tree.irreducible {
        lines.push("// note: irreducible control flow, emitted as a state machine".into());
    }
    lines.push(format!("{sig} {{"));
    let hoisted: Vec<u32> = hoisted.into_iter().filter(|&v| used(v)).collect();
    let body_lines = print_nodes(&mut pr, tree, body, "\t", &decls, &hoisted);
    let fdecl = sugar
        .frame
        .borrow()
        .as_ref()
        .map(|fr| fr.decl())
        .unwrap_or_default();
    if !fdecl.is_empty() {
        lines.push(fdecl);
    }
    if !zero_init.is_empty() {
        let z: Vec<String> = zero_init
            .iter()
            .map(|&v| {
                format!(
                    "{}{} = 0",
                    names_final
                        .get(v as usize)
                        .cloned()
                        .flatten()
                        .unwrap_or_else(|| format!("u{v}")),
                    var_types
                        .get(&v)
                        .map_or(String::new(), |t| format!(": {t}"))
                )
            })
            .collect();
        lines.push(format!("\tlet {}", z.join(", ")));
    }
    let body_at = lines.len();
    lines.extend(body_lines);
    lines.push("}".into());
    drop(pr);
    let spans = sugar.spans.take();
    let notes = std::mem::take(&mut *site_notes.borrow_mut());
    let snap = SugarSnap {
        fi,
        var_types: sugar.var_types.clone(),
        input_var: sugar.input_var,
        in_addr: sugar.in_addr.get(),
        frame: sugar.frame.borrow_mut().take(),
        ok_at: sugar.ok_at.clone(),
        stored: sugar.stored.clone(),
        arg_notes: sugar.arg_notes,
        names: names_final.clone(),
    };
    Printed {
        fi,
        text: lines.join("\n"),
        name,
        lines,
        body_at,
        spans,
        notes,
        names_final,
        names,
        var_types,
        calls: calls_of(d, f),
        snap,
    }
}

/// A function as printed (before its analysis facts, which read the shared flow layer: made in order).
struct Printed {
    fi: usize,
    name: String,
    text: String,
    lines: Vec<String>,
    /// index in `lines` of the body's first line
    body_at: usize,
    spans: HashMap<NodeKey, (usize, usize)>,
    notes: HashMap<NodeKey, SiteNote>,
    names_final: Vec<Option<String>>,
    names: Vec<Option<String>>,
    var_types: IndexMap<u32, String>,
    calls: Vec<i64>,
    snap: SugarSnap,
}

/// The analysis facts of a printed function (native programs: the account resolver of the flow layer).
fn func_facts<'x, 'p>(d: &'x Dx<'p>, tree: &Tree, p: &Printed, flo: Option<&FlowCtx<'p>>) -> FnFacts {
    // (native programs only: the account resolver)
    let fl = || flo.expect("the flow layer");
    let f = d.fs[p.fi];
    let pc = f.pc;
    let ir = f.ir.as_ref().unwrap();
    let body = &tree.body;
    let spans = &p.spans;
    let notes = &p.notes;
    let noreturn = |t: i64| d.p.funcs.get(&t).is_some_and(|x| x.noreturn);
    let callee_name = |t: i64| d.fn_name(t);
    let seeds_at = |ptr: u64, n: u64| seeds_at(d, ptr, n);
    let callee_path = |t: i64| {
        d.libs
            .get(&t)
            .filter(|i| i.lib)
            .and_then(|i| i.hint.clone())
    };
    let str_at = |a: u64, n: u64| d.sem.str_at(a, n, false);
    let custom_error = |t: i64| d.error_from.contains(&t) || d.error_or.contains(&t);
    // (native: the account resolver; a condition the structuring rebuilt: the branch deciding it)
    let ir_cfg: RefCell<Option<Rc<Cfg>>> = RefCell::new(None);
    let cfg = || -> Rc<Cfg> {
        ir_cfg
            .borrow_mut()
            .get_or_insert_with(|| Rc::new(cfg_of(f)))
            .clone()
    };
    let res = || account_resolver(fl(), f, &p.names_final, true, None);
    let ir_refs = |e: E, fail: Option<i64>, pass: Option<i64>| -> Vec<Option<String>> {
        let r = res();
        let x = r.refs(fl(), e, None);
        let x = if !x.is_empty() || fail.is_none() {
            x
        } else {
            match decision_block(&cfg(), Some(e), fail, pass) {
                Some(b) => r.refs(fl(), e, Some(b)),
                None => x,
            }
        };
        x.into_iter().map(|y| y.field).collect()
    };
    let ir_cmp = |e: E, fail: Option<i64>, pass: Option<i64>| -> bool {
        let r = res();
        let b = if fail.is_none() {
            None
        } else {
            decision_block(&cfg(), Some(e), fail, pass)
        };
        r.cmp32(fl(), e, b)
    };
    let ir_pda = |e: E, fail: Option<i64>, pass: Option<i64>| -> Option<f64> {
        let r = res();
        let b = if fail.is_none() {
            None
        } else {
            decision_block(&cfg(), Some(e), fail, pass)
        };
        r.pda_eq(fl(), e, b)
    };
    let ir_store = |si: u32| -> Option<StoreRef> {
        let r = res();
        let p = tree
            .origin
            .get(&si)
            .map(|&(b, i)| pos_of(b as usize, i as usize));
        r.store(fl(), p).map(|(a, how)| StoreRef {
            index: a.index,
            field: a.field,
            how,
        })
    };
    let anchor = d.sem.anchor;
    let inp = FnInput {
        pc,
        name: &p.name,
        ir,
        tree,
        body,
        lines: &p.lines,
        at: p.body_at,
        spans,
        sites: notes,
        noreturn: &noreturn,
        callee_name: &callee_name,
        anchor: d.sem.anchor,
        seeds_at: &seeds_at,
        ir_refs: if anchor { None } else { Some(&ir_refs) },
        ir_cmp: if anchor { None } else { Some(&ir_cmp) },
        ir_pda: if anchor { None } else { Some(&ir_pda) },
        ir_store: if anchor { None } else { Some(&ir_store) },
        callee_path: &callee_path,
        str_at: &str_at,
        custom_error: &custom_error,
    };
    let mut ff = function_facts(&inp);
    if d.user_invoke.contains(&pc) {
        ff.wrapper = true;
    }
    ff
}

/// A printed function with its facts.
fn read_func(d: &Dx, p: Printed, facts: FnFacts) -> (ReadFunc, SugarSnap) {
    let f = d.fs[p.fi];
    let rf = ReadFunc {
        pc: f.pc,
        name: p.name,
        text: p.text,
        calls: p.calls,
        is_entry: f.is_entry,
        var_types: p.var_types.into_iter().collect(),
        names: p.names,
        facts: Some(facts),
    };
    (rf, p.snap)
}

/// seedsAt: a seed list (&[&[u8]]) in read-only program memory: ["text" | 0x<hex>, …]
fn seeds_at(d: &Dx, ptr: u64, n: u64) -> Option<String> {
    if n > 16 {
        return None;
    }
    let mut out: Vec<String> = Vec::new();
    for i in 0..n {
        let at = ptr as u128 + 16 * i as u128;
        let a = if d.sem.region_exec(at, 16) == Some(false) {
            d.sem.read(at, 8)
        } else {
            None
        };
        let l = a.and_then(|_| d.sem.read(at + 8, 8));
        let (Some(a), Some(l)) = (a, l) else {
            return None;
        };
        if l > 64 {
            return None;
        }
        if let Some(s) = d.sem.str_at(a, l, true) {
            if s.chars().all(|c| (' '..='~').contains(&c)) {
                out.push(json_str(&s));
                continue;
            }
        }
        let mut bytes = String::new();
        for j in 0..l {
            let b = d.sem.read(a as u128 + j as u128, 1)?;
            bytes.push_str(&format!("{b:02x}"));
        }
        out.push(format!("0x{bytes}"));
    }
    Some(format!("[{}]", out.join(", ")))
}

/// argsVar: the variable holding a handler's instruction data, for an argument view.
fn args_var(d: &Dx, fi: usize, view: &str) -> Option<u32> {
    let f = d.fs[fi];
    let pc = f.pc;
    let ir = f.ir.as_ref().unwrap();
    let v = d.views.map.get(view)?;
    let mut cands: IndexSet<u32> = IndexSet::default();
    for x in &f.vars {
        if x.param >= 1 && x.param != 10 {
            cands.insert(x.id);
        }
    }
    for b in &f.blocks {
        for s in &b.stmts {
            if let Stmt::Set { dst, e, .. } = s {
                if let Node::Var(id) = ir.get(*e) {
                    if cands.contains(&id) && d.def_count(pc, *dst as u32) == 1 {
                        cands.insert(*dst as u32);
                    }
                }
            }
        }
    }
    let mut loads: IndexMap<u32, Vec<(N, u8)>> = IndexMap::default();
    let visit = |e: E, loads: &mut IndexMap<u32, Vec<(N, u8)>>| {
        ir.walk(e, &mut |_, x| {
            let Node::Load { size, addr } = x else { return };
            let (id, off) = match ir.get(addr) {
                Node::Var(v) => (Some(v), 0.0),
                Node::Bin(BinOp::Add, a, c) => match (ir.get(a), ir.get(c)) {
                    (Node::Var(v), Node::Const(c)) => (Some(v), n_s(c)),
                    _ => (None, 0.0),
                },
                _ => (None, 0.0),
            };
            let Some(id) = id else { return };
            if !cands.contains(&id) {
                return;
            }
            loads.entry(id).or_default().push((off, size));
        })
    };
    for b in &f.blocks {
        for s in &b.stmts {
            for e in stmt_exprs(ir, s) {
                visit(e, &mut loads);
            }
        }
        match &b.term {
            Term::Br { c, .. } => visit(*c, &mut loads),
            Term::Ret { e: Some(e) } => visit(*e, &mut loads),
            _ => {}
        }
    }
    let (mut best, mut score) = (None, 0usize);
    for (id, ls) in &loads {
        let mut hit: HashSet<String> = HashSet::default();
        let mut ok = true;
        for &(off, size) in ls {
            let fd = v
                .fields
                .iter()
                .find(|x| x.off <= off && off + size as N <= x.off + d.views.width(&x.t));
            match fd {
                Some(fd) if !matches!(fd.t, FT::Scalar(s) if fd.off != off || s != size) => {
                    hit.insert(fd.name.clone());
                }
                _ => {
                    ok = false;
                    break;
                }
            }
        }
        if ok && hit.len() > score {
            best = Some(*id);
            score = hit.len();
        }
    }
    if score >= 2.min(v.fields.len()) {
        best
    } else {
        None
    }
}

/// callsOf: direct callees and function-address constants.
fn calls_of(d: &Dx, f: &Func) -> Vec<i64> {
    let pc_by_addr = d.pc_by_addr.get_or_init(|| {
        d.p.funcs
            .keys()
            .map(|&pc| (sbpf_program::fn_addr(d.p, pc), pc))
            .collect()
    });
    calls_of_with(f, pc_by_addr)
}

/// callsOf with the function-address table given.
pub fn calls_of_with(f: &Func, pc_by_addr: &HashMap<u64, i64>) -> Vec<i64> {
    let ir = f.ir.as_ref().unwrap();
    let mut out: IndexSet<i64> = IndexSet::default();
    let visit = |e: E, out: &mut IndexSet<i64>| {
        ir.walk(e, &mut |_, n| match n {
            Node::Call(t, _) => {
                if let CallTarget::Fn { pc } = ir.target(t) {
                    out.insert(pc);
                }
            }
            Node::Const(v) => {
                if let Some(&t) = pc_by_addr.get(&v) {
                    out.insert(t);
                }
            }
            _ => {}
        });
    };
    for b in &f.blocks {
        for s in &b.stmts {
            if let Stmt::Call {
                t: CallTarget::Fn { pc },
                ..
            } = s
            {
                out.insert(*pc);
            }
            for e in stmt_exprs(ir, s) {
                visit(e, &mut out);
            }
        }
        match &b.term {
            Term::Br { c, .. } => visit(*c, &mut out),
            Term::Ret { e: Some(e) } => visit(*e, &mut out),
            _ => {}
        }
    }
    out.into_iter().collect()
}

/// mapExpr (post-order: children first, then f on the rebuilt node)
pub fn map_expr(ir: &Ir, e: E, f: &mut dyn FnMut(E) -> E) -> E {
    let n = match ir.get(e) {
        Node::Bin(op, a, b) => {
            let (a, b) = (map_expr(ir, a, f), map_expr(ir, b, f));
            ir.bin(op, a, b)
        }
        Node::Neg(a) => {
            let a = map_expr(ir, a, f);
            ir.mk(Node::Neg(a))
        }
        Node::Not(a) => {
            let a = map_expr(ir, a, f);
            ir.mk(Node::Not(a))
        }
        Node::Lnot(a) => {
            let a = map_expr(ir, a, f);
            ir.mk(Node::Lnot(a))
        }
        Node::Ext { signed, bits, a } => {
            let a = map_expr(ir, a, f);
            ir.ext(signed, bits, a)
        }
        Node::Bswap { bits, a } => {
            let a = map_expr(ir, a, f);
            ir.mk(Node::Bswap { bits, a })
        }
        Node::Load { size, addr } => {
            let a = map_expr(ir, addr, f);
            ir.load(size, a)
        }
        Node::Cmp(op, a, b) => {
            let (a, b) = (map_expr(ir, a, f), map_expr(ir, b, f));
            ir.cmp(op, a, b)
        }
        Node::Land(a, b) => {
            let (a, b) = (map_expr(ir, a, f), map_expr(ir, b, f));
            ir.mk(Node::Land(a, b))
        }
        Node::Lor(a, b) => {
            let (a, b) = (map_expr(ir, a, f), map_expr(ir, b, f));
            ir.mk(Node::Lor(a, b))
        }
        Node::Sel(c, a, b) => {
            let (c, a, b) = (map_expr(ir, c, f), map_expr(ir, a, f), map_expr(ir, b, f));
            ir.mk(Node::Sel(c, a, b))
        }
        Node::Call(t, args) => {
            let tt = match ir.target(t) {
                CallTarget::Ind { e } => CallTarget::Ind {
                    e: map_expr(ir, e, f),
                },
                x => x,
            };
            let xs: Vec<E> = ir.items(args).map(|a| map_expr(ir, a, f)).collect();
            let l = ir.list(xs);
            let ti = ir.mk_target(tt);
            ir.mk(Node::Call(ti, l))
        }
        Node::Fn(nm, args) => {
            let xs: Vec<E> = ir.items(args).map(|a| map_expr(ir, a, f)).collect();
            let l = ir.list(xs);
            ir.mk(Node::Fn(nm, l))
        }
        _ => e,
    };
    f(n)
}

/// The wrapper-CPI runs of the analysis (budget only: nothing printed).
fn wrapper_runs(
    d: &Dx,
    f: &Func,
    tree: &Tree,
    body: &[SNode],
    fpv: u32,
    pr: &mut Printer,
    notes: &RefCell<HashMap<NodeKey, SiteNote>>,
    bud: &Budgets,
) {
    let ir = f.ir.as_ref().unwrap();
    let pc = f.pc;
    let taint = d.taint.get(&pc);
    fn visit(
        d: &Dx,
        f: &Func,
        tree: &Tree,
        ns: &[SNode],
        fpv: u32,
        pr: &mut Printer,
        taint: Option<&crate::taint::FnTaint>,
        notes: &RefCell<HashMap<NodeKey, SiteNote>>,
        bud: &Budgets,
    ) {
        let ir = f.ir.as_ref().unwrap();
        for n in ns {
            if let SNode::Stmt(si) = n {
                if bud.test(BK::Wrap) {
                    let s = tree.stmt(*si);
                    if let Some((CallTarget::Fn { pc: t }, _)) = call_of(ir, s) {
                        if d.user_invoke.contains(&t) && t != f.pc {
                            let ka = |a: u64| d.sem.key_at(a);
                            let sa = |a: u64, n: u64| d.sem.str_at(a, n, true);
                            let cn = |v: u64| d.sem.const_comment(v, 0);
                            let fa = |a: u64| d.pn.by_addr.get(&a).cloned();
                            let rd = |a: u128, n: usize| d.sem.read_ro(a, n);
                            let tainted = |e: E| expr_tainted(taint, ir, e, Some(fpv));
                            let mut ex = |e: E| pr.u(e, 0, true);
                            let mut env = CpiEnv {
                                ir,
                                fp: Some(fpv),
                                expr: &mut ex,
                                key_at: Some(&ka),
                                str_at: Some(&sa),
                                const_name: Some(&cn),
                                read: Some(&rd),
                                program_check: None,
                                fn_at: Some(&fa),
                                named: None,
                                tainted: Some(&tainted),
                            };
                            let m = {
                                let mut b = ExecBudget { steps: bud.left(BK::Wrap) };
                                let m = describe_model(
                                    d.ctx,
                                    f,
                                    stmt_pc(s),
                                    ExecSiteKind::Wrapper,
                                    &mut env,
                                    &mut b,
                                );
                                bud.spend(BK::Wrap, bud.left(BK::Wrap) - b.steps);
                                m
                            };
                            if let Some(x) = m.and_then(|m| m.format(&mut env)) {
                                notes.borrow_mut().insert(
                                    n as *const SNode,
                                    SiteNote {
                                        pda: false,
                                        desc: Some(x),
                                        via: Some(d.fn_name(t)),
                                    },
                                );
                            }
                        }
                    }
                }
            }
            for c in child_lists(n) {
                visit(d, f, tree, c, fpv, pr, taint, notes, bud);
            }
        }
    }
    let _ = ir;
    visit(d, f, tree, body, fpv, pr, taint, notes, bud);
}

#[allow(dead_code)]
fn unused() {
    let _ = format_ix;
}

/// The IDL argument view of the function's instruction (`views.map.get(vname) ?? views.borshView(...)`):
/// added to the shared table while the function is named, as in the TS.
fn add_args_view(d: &mut Dx, fi: usize) -> Option<String> {
    match args_view_of(d, fi) {
        ArgsView::None => None,
        ArgsView::Existing(v) => Some(v),
        ArgsView::New => {
            let pc = d.fs[fi].pc;
            let ix_name = d.sem.ix_names.get(&pc).cloned()?;
            let idl = d.idl?;
            let ix_def = idl.instructions.iter().find(|x| x.name == ix_name)?;
            let vname = args_view_name(&ix_name, idl);
            d.views.borsh_view(
                &vname,
                &format!("arguments of instruction {ix_name} (Anchor IDL, Borsh layout; after the 8-byte discriminator)"),
                &ix_def.arg_defs,
                &idl.types,
                0.0,
            )
        }
    }
}

enum ArgsView {
    /// no argument view
    None,
    /// the view is in the table already
    Existing(String),
    /// the view is added to the table
    New,
}

fn args_view_name(ix_name: &str, idl: &crate::idl::IdlInfo) -> String {
    let vbase = format!("{}Args", pascal_ix(ix_name));
    if idl.types.contains_key(&vbase) {
        format!("{}IxArgs", vbase.strip_suffix("Args").unwrap())
    } else {
        vbase
    }
}

/// What `add_args_view` does for the function (without doing it).
fn args_view_of(d: &Dx, fi: usize) -> ArgsView {
    let pc = d.fs[fi].pc;
    let Some(ix_name) = d.sem.ix_names.get(&pc) else {
        return ArgsView::None;
    };
    let Some(idl) = d.idl else {
        return ArgsView::None;
    };
    let Some(ix_def) = idl.instructions.iter().find(|x| &x.name == ix_name) else {
        return ArgsView::None;
    };
    if ix_def.arg_defs.is_empty() {
        return ArgsView::None;
    }
    if ix_name.split('_').any(|w| w.is_empty()) {
        // (pascal_ix throws: when its turn comes)
        return ArgsView::New;
    }
    let vname = args_view_name(ix_name, idl);
    if d.views.map.contains_key(&vname) {
        ArgsView::Existing(vname)
    } else {
        ArgsView::New
    }
}

/// A Dx reference with its lifetime shortened (Dx is covariant).
pub fn shorten_dx<'a, 'p: 'a>(d: &'a Dx<'p>) -> &'a Dx<'a> {
    d
}

/// A function's printing hooks as they are once it is printed (the analysis prints expressions of the function
/// afterwards: facts' `expr`, the printer of the function with its hooks).
pub struct SugarSnap {
    fi: usize,
    var_types: IndexMap<u32, String>,
    input_var: Option<u32>,
    in_addr: bool,
    frame: Option<Frame>,
    ok_at: Vec<E>,
    stored: HashMap<u32, String>,
    arg_notes: bool,
    names: Vec<Option<String>>,
}

/// The expression printer of the printed functions (by function pc), as each one's printer left it.
pub fn expr_printer<'a>(
    d: &'a Dx<'a>,
    snaps: Vec<SugarSnap>,
) -> Box<dyn Fn(i64, E) -> Option<String> + 'a> {
    let mut by_pc: HashMap<i64, (FnSugar<'a>, Vec<Option<String>>)> = HashMap::default();
    for sn in snaps {
        let f = d.fs[sn.fi];
        let sugar = FnSugar {
            d,
            var_types: sn.var_types,
            input_var: sn.input_var,
            acc_typed: Some(&d.account_infos[sn.fi]),
            in_addr: Cell::new(sn.in_addr),
            frame: RefCell::new(sn.frame),
            ok_at: sn.ok_at,
            stored: sn.stored,
            outl: HashMap::default(),
            note: RefCell::new(None),
            arg_notes: sn.arg_notes,
            ir: f.ir.as_ref().unwrap(),
            spans: RefCell::new(HashMap::default()),
        };
        by_pc.insert(f.pc, (sugar, sn.names));
    }
    Box::new(move |pc: i64, e: E| {
        let (sugar, names) = by_pc.get(&pc)?;
        let mut pr = Printer::new(sugar.ir, &d.pn, names).with_sugar(sugar);
        Some(pr.u(e, 0, true))
    })
}
