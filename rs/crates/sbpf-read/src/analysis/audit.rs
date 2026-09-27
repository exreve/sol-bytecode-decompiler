//! Facts for the audit pattern rules (`src/analysis/audit.ts`): per instruction, on the IR: accounts whose data the
//! logic borrows itself, PDA bumps from instruction data, CPI results never read, narrowing casts of value-path
//! amounts, remaining accounts the checks read, authority writes of an init_if_needed account not gated by its
//! state, sysvar layouts parsed by behavior. Also `evaluatorsFor` (the Anchor evaluation contexts of an
//! instruction's functions, shared by the report, libcpi and the rules).

use super::anchor::{ACtx, HVal, HA, HK};
use super::flow::*;
use super::ixctx::IxCtx;
use super::ixctx::IxInfo;
use super::paths::IrCond;
use super::report::{IxOut, Loc, OpOut};
use super::sources::SourceCtx;
use super::An;
use super::{js_slice, FK};
use indexmap::IndexMap;
use sbpf_ir::{BinOp, CallTarget, Node, Stmt, Term, E};
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

#[derive(Clone, Debug)]
pub struct InitWrite {
    pub acct: String,
    pub ty: String,
    pub at: super::report::Loc,
    pub owner: bool,
    pub field: Option<String>,
    pub tag: Option<String>,
}

#[derive(Clone, Debug)]
pub struct SysvarRead {
    pub acct: String,
    pub sysvar: &'static str,
    pub at: super::report::Loc,
    pub id_compared: bool,
}

#[derive(Clone, Debug, Default)]
pub struct AuditFacts {
    pub data_reads: Vec<String>,
    pub bumps: Vec<(usize, String)>,
    pub ignored: Vec<usize>,
    /// (op, expr, bits, source)
    pub casts: Vec<(usize, String, u32, String)>,
    pub rem_checked: Vec<String>,
    pub owner_cmp: Option<Vec<String>>,
    pub reinit: Vec<(usize, String)>,
    /// (fn, n, type, accts)
    pub same_type: Option<(String, usize, Option<String>, Vec<String>)>,
    pub init_writes: Option<Vec<InitWrite>>,
    pub sysvar_reads: Option<Vec<SysvarRead>>,
    pub init_gated: Option<Vec<String>>,
}

impl<'a> An<'a> {
    /// auditIx: facts for the audit pattern rules
    pub fn audit_ix(&self, ix: &IxOut, info: &IxInfo<'a>, s: &SourceCtx<'a, '_>) -> AuditFacts {
        let ctx = &*info.ctx;
        let mut out = AuditFacts {
            data_reads: self
                .memo
                .data_reads
                .borrow()
                .get(&ctx.handler)
                .map_or(vec![], |x| x.iter().cloned().collect()),
            ..Default::default()
        };
        let src = |fn_: i64, e: E, p: Pos| s.of(fn_, e, p);
        for (oi, o) in ix.ops.iter().enumerate() {
            let (Some(fn_), Some(pc)) = (o.fn_pc, o.at.pc) else {
                continue;
            };
            let (Some((sb, si)), Some(d)) = (self.stmt_at(fn_, pc), self.defs_in(fn_)) else {
                continue;
            };
            let f = self.fo(fn_).unwrap().f;
            let ir = fir(f);
            let st = &f.blocks[sb].stmts[si];
            let p = pos_of(sb, si);
            let c = call_of(ir, st);
            // (a PDA derived with a bump the caller chooses)
            if let (Some(pda), Some((_, args))) = (&o.pda, &c) {
                if pda.fn_.contains("create_program_address") && args.len >= 3 {
                    if let Node::Const(nv) = ir.get(ir.at(*args, 2)) {
                        let s0 = d.fp_off(ir.at(*args, 1));
                        let n = nv as f64;
                        let w = match s0 {
                            Some(s0) if (1.0..=16.0).contains(&n) => Some(s0 + 16.0 * (n - 1.0)),
                            _ => None,
                        };
                        let len = w.and_then(|w| d.reaching(&self.fl, slot(w + 8.0), p, false));
                        let ptr = w.and_then(|w| d.reaching(&self.fl, slot(w), p, false));
                        let bb = ptr.and_then(|x| d.fp_off(x.0));
                        if let (Some(len), Some(bb)) = (len, bb) {
                            if ir.get(len.0) == Node::Const(1) {
                                let v = d.reaching(&self.fl, slot(bb), p, true);
                                let ld = v.and_then(|v| direct(self, v.0, v.1, &d, 0));
                                let ss = ld.map_or(vec![], |ld| src(fn_, ld.0, ld.1));
                                if !ss.is_empty() && ss.iter().all(|x| x.kind == "ix") {
                                    out.bumps.push((oi, ss[0].source.clone()));
                                }
                            }
                        }
                    }
                }
            }
            // (a CPI whose Result no later statement reads)
            if let Some((CallTarget::Fn { .. }, args)) = &c {
                if o.has("CPI") && o.ret.is_none() && args.len > 0 {
                    if let Some(oo) = d.fp_off(ir.at(*args, 0)) {
                        if !read_after(f, p, &d, oo, 8.0) {
                            out.ignored.push(oi);
                        }
                    }
                }
            }
            // (a value-path amount narrowed from a wider value)
            if o.kinds.iter().any(|k| AUDIT_VALUE_OPS.contains(k)) {
                let es: Vec<E> = match (st, &c) {
                    (Stmt::Store { v, .. }, _) => vec![*v],
                    (_, Some((_, args))) => ir
                        .items(*args)
                        .skip(2)
                        .filter(|x| d.fp_off(*x).is_none())
                        .collect(),
                    _ => vec![],
                };
                for e in es {
                    let pw = PW {
                        an: self,
                        ctx,
                        fn_,
                        depth: 0,
                    };
                    let Some(x) = narrowed(self, e, p, &d, 0, &pw) else {
                        continue;
                    };
                    let ss: Vec<_> = src(fn_, x.0, x.1)
                        .into_iter()
                        .filter(|y| y.kind == "ix" || y.kind == "data" || y.kind == "lamports")
                        .collect();
                    if !ss.is_empty() {
                        out.casts.push((
                            oi,
                            js_slice(&o.text, 0, Some(100)),
                            x.2,
                            ss[0].source.clone(),
                        ));
                        break;
                    }
                }
            }
        }
        // (Anchor: remaining accounts checked, owners compared)
        let rem = ix.ops.iter().any(|o| {
            o.target
                .as_ref()
                .is_some_and(|t| t.starts_with("remaining_accounts["))
                || o.cpi(|c| {
                    c.accounts
                        .iter()
                        .any(|x| x.text.contains("remaining_accounts["))
                })
                .unwrap_or(false)
        });
        if self.anchor && (!out.data_reads.is_empty() || rem) {
            let mut seen: indexmap::IndexSet<String> = indexmap::IndexSet::new();
            let mut owners: indexmap::IndexSet<String> = indexmap::IndexSet::new();
            for ck in &ix.checks {
                let ev = self.ev_for(ctx, ck.fn_pc);
                let st = ck.at.pc.and_then(|pc| self.stmt_at(ck.fn_pc, pc));
                let fo = self.fo(ck.fn_pc);
                let d = self.defs_in(ck.fn_pc);
                let b = match (fo, ck.c) {
                    (Some(_), Some(c)) => self.cfg(ck.fn_pc).cond_block.get(&c).copied(),
                    _ => None,
                };
                let p = match b {
                    Some(b) => Some(pos_of(b, fo.unwrap().f.blocks[b].stmts.len())),
                    None => st.map(|(b, i)| pos_of(b, i)),
                };
                let (Some(ev), Some(d), Some(cc), Some(p)) = (ev, d, ck.c, p) else {
                    continue;
                };
                let ir = d.ir;
                fn scan<'a>(
                    an: &An<'a>,
                    ev: &ACtx<'a>,
                    d: &Defs<'a>,
                    ir: &sbpf_ir::Ir,
                    e: E,
                    q: Pos,
                    dd: u32,
                    seen: &mut indexmap::IndexSet<String>,
                    owners: &mut indexmap::IndexSet<String>,
                ) {
                    let mut nodes: Vec<Node> = Vec::new();
                    ir.walk(e, &mut |_, n| nodes.push(n));
                    for n in nodes {
                        match n {
                            Node::Call(_, args) | Node::Fn(_, args) => {
                                for a in ir.items(args) {
                                    for (v, k) in reads(an, ev, a, q) {
                                        if v.starts_with("remaining_accounts[") {
                                            seen.insert(v.clone());
                                        }
                                        if k == HK::Ownp {
                                            owners.insert(v);
                                        }
                                    }
                                }
                            }
                            Node::Var(id) if dd < 3 => {
                                let y = def_step(an, d, id, q);
                                match y {
                                    Some(y) => scan(an, ev, d, ir, y.0, y.1, dd + 1, seen, owners),
                                    None => {
                                        for (v, _) in reads(an, ev, ir.var(id), q) {
                                            if v.starts_with("remaining_accounts[") {
                                                seen.insert(v);
                                            }
                                        }
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                }
                scan(self, &ev, &d, ir, cc, p, 0, &mut seen, &mut owners);
            }
            out.rem_checked = seen.into_iter().collect();
            out.owner_cmp = Some(owners.into_iter().collect());
        }
        // (Anchor: a deserialization try_accounts makes for several accounts)
        if self.anchor {
            let t = self.try_info(ctx.handler).map(|t| t.try_pc);
            let facts = self.facts.borrow();
            if let Some(tf) = t.and_then(|t| facts.get(&t)) {
                let mut n: IndexMap<i64, usize> = IndexMap::new();
                for c in &tf.calls {
                    if !c.err_path {
                        *n.entry(c.callee).or_insert(0) += 1;
                    }
                }
                let des: HashSet<i64> = tf
                    .checks
                    .iter()
                    .filter(|k| {
                        k.before.is_some()
                            && k.via
                                .as_ref()
                                .is_some_and(|v| v.1.contains(&"discriminator"))
                    })
                    .map(|k| k.before.unwrap())
                    .collect();
                if let Some((&c, &k)) = n.iter().find(|(c, k)| **k >= 2 && des.contains(c)) {
                    let ty = facts.get(&c).and_then(|f| {
                        f.checks
                            .iter()
                            .filter_map(|x| {
                                crate::jre!(r"account:(\w+)")
                                    .captures(&x.cond)
                                    .map(|m| m[1].to_string())
                            })
                            .find(|x| !x.is_empty())
                    });
                    let name = facts
                        .get(&c)
                        .map(|f| f.name.clone())
                        .or_else(|| self.p.funcs.get(&c).map(|f| f.name.clone()))
                        .unwrap_or_else(|| c.to_string());
                    let mut accts: Vec<String> = Vec::new();
                    for x in &tf.checks {
                        if x.before == Some(c) {
                            if let Some(nm) = x.named.as_ref().filter(|s| !s.is_empty()) {
                                if !accts.contains(nm) {
                                    accts.push(nm.clone());
                                }
                            }
                        }
                    }
                    out.same_type = Some((name, k, ty, accts));
                }
            }
        }
        // (init_if_needed: an authority field written with no state read on the way)
        if self.anchor && ix.ops.iter().any(|o| o.has("ACCOUNT_CREATE")) {
            for (oi, o) in ix.ops.iter().enumerate() {
                let (true, Some(t), Some(fpc)) = (
                    o.has("AUTHORITY_WRITE"),
                    o.target.as_ref().filter(|t| !t.is_empty()),
                    o.fn_pc,
                ) else {
                    continue;
                };
                let acct = t.split('.').next().unwrap_or("").to_string();
                if !ix.checks.iter().any(|k| {
                    k.account.as_ref() == Some(&acct) && k.error.contains("ConstraintOwner")
                }) {
                    continue;
                }
                let b = self.block_at(fpc, o.at.pc, None);
                let conds = self.path_to(Some(ctx), fpc, b, 80);
                let gated = conds.iter().any(|k| {
                    k.how != "before"
                        && (src(k.fn_, k.c, k.pos)
                            .iter()
                            .any(|x| x.acct.as_ref() == Some(&acct) && x.kind == "data")
                            || self.reads_acct(ctx, k.fn_, k.c, k.pos, &acct))
                });
                if !gated {
                    out.reinit.push((oi, acct));
                }
            }
        }
        // (native: an account set to 1 behind a condition reading its data)
        if !self.anchor {
            let mut gated: indexmap::IndexSet<String> = indexmap::IndexSet::new();
            let rent_test = |k: &IrCond| {
                let ir = fir(self.fo(k.fn_).unwrap().f);
                let mut hit = false;
                ir.walk(k.c, &mut |_, n| {
                    if !hit {
                        if let Node::Call(t, _) = n {
                            if let CallTarget::Fn { pc } = ir.target(t) {
                                if self.pname(pc).contains("is_exempt") {
                                    hit = true;
                                }
                            }
                        }
                    }
                });
                hit
            };
            for o in &ix.ops {
                let tgt = o.target.as_deref().unwrap_or("");
                let (true, true, Some(fpc), Some(apc)) = (
                    o.has("ACCOUNT_DATA_WRITE"),
                    crate::jre!(r"\.data\b").is_match(tgt),
                    o.fn_pc,
                    o.at.pc,
                ) else {
                    continue;
                };
                let flag = crate::jre!(r"\.data\[\d+\.\.\d+\]$").is_match(tgt)
                    && crate::jre!(r"^(0x0*)?1$").is_match(o.value.as_deref().unwrap_or(""));
                let acct = tgt.split('.').next().unwrap_or("").to_string();
                if gated.contains(&acct) {
                    continue;
                }
                let conds = self.path_to(Some(ctx), fpc, self.block_at(fpc, Some(apc), None), 80);
                if !flag && !conds.iter().any(|k| rent_test(k)) {
                    continue;
                }
                if conds.iter().any(|k| {
                    k.how != "before"
                        && src(k.fn_, k.c, k.pos)
                            .iter()
                            .any(|x| x.acct.as_ref() == Some(&acct) && x.kind == "data")
                }) {
                    gated.insert(acct);
                }
            }
            if !gated.is_empty() {
                out.init_gated = Some(gated.into_iter().collect());
            }
        }
        let owner_cmp = out.owner_cmp.clone().unwrap_or_default();
        out.init_writes = Some(self.init_writes(ix, ctx, &owner_cmp));
        out.sysvar_reads = Some(self.sysvar_reads(ix, ctx, s));
        // (native: an authority field written into an account the instruction does not create)
        let creates = ix.ops.iter().any(|o| {
            o.has("ACCOUNT_CREATE")
                || o.cpi(|c| {
                    c.family.as_deref() == Some("system")
                        || (!c.known.as_ref().is_some_and(|k| !k.is_empty())
                            && !c.family.as_ref().is_some_and(|k| !k.is_empty()))
                })
                .unwrap_or(false)
        });
        if !self.anchor && out.init_writes.as_ref().is_none_or(|w| w.is_empty()) && !creates {
            let signer_key = |o: &OpOut| {
                o.target.as_ref().is_some_and(|t| !t.is_empty())
                    && o.sources.iter().flatten().any(|x| {
                        Some(&x.param) == o.target.as_ref()
                            && x.source.ends_with(".key")
                            && ix
                                .accounts
                                .iter()
                                .any(|a| format!("{}.key", a.name) == x.source && a.has("signer"))
                    })
            };
            for o in &ix.ops {
                let tgt = o.target.as_deref().unwrap_or("");
                let shape = o.has("AUTHORITY_WRITE")
                    || (o.has("ACCOUNT_DATA_WRITE")
                        && crate::jre!(r"\.data\[\d+\.\.\d+\]$").is_match(tgt)
                        && signer_key(o));
                let (true, false, Some(fpc), Some(apc)) = (shape, tgt.is_empty(), o.fn_pc, o.at.pc)
                else {
                    continue;
                };
                let acct = tgt.split('.').next().unwrap_or("").to_string();
                if crate::jre!(r"\?$|^account\[").is_match(&acct)
                    && !ix.accounts.iter().any(|a| a.name == acct)
                {
                    continue;
                }
                let conds = self.path_to(Some(ctx), fpc, self.block_at(fpc, Some(apc), None), 80);
                if conds.iter().any(|k| {
                    k.how != "before"
                        && src(k.fn_, k.c, k.pos)
                            .iter()
                            .any(|x| x.acct.as_ref() == Some(&acct) && x.kind == "data")
                }) {
                    continue;
                }
                let pre = format!("{acct}.");
                let mut wk: HashSet<String> = HashSet::new();
                for x in &ix.ops {
                    let (Some(xt), Some(fx), Some(xpc)) = (&x.target, x.fn_pc, x.at.pc) else {
                        continue;
                    };
                    if !xt.starts_with(&pre) {
                        continue;
                    }
                    let Some((b, i)) = self.stmt_at(fx, xpc) else {
                        continue;
                    };
                    let xf = self.fo(fx).unwrap().f;
                    let xir = fir(xf);
                    match &xf.blocks[b].stmts[i] {
                        Stmt::Store { addr, .. } => {
                            wk.insert(self.value_key(Some(ctx), fx, *addr, pos_of(b, i), 0));
                        }
                        Stmt::Copy { dst, .. } => {
                            for off in [0u64, 8, 16, 24] {
                                let e = if off > 0 {
                                    xir.bin(BinOp::Add, *dst, xir.c(off))
                                } else {
                                    *dst
                                };
                                wk.insert(self.value_key(Some(ctx), fx, e, pos_of(b, i), 0));
                            }
                        }
                        _ => {}
                    }
                }
                let reads_w = |k: &IrCond| -> bool {
                    let kd = self.defs_in(k.fn_);
                    let kir = fir(self.fo(k.fn_).unwrap().f);
                    fn go<'a>(
                        an: &An<'a>,
                        ctx: &IxCtx<'a>,
                        kd: &Option<std::rc::Rc<Defs<'a>>>,
                        ir: &sbpf_ir::Ir,
                        f: i64,
                        wk: &HashSet<String>,
                        e: E,
                        q: Pos,
                        d: u32,
                        hit: &mut bool,
                    ) {
                        let mut nodes: Vec<Node> = Vec::new();
                        ir.walk(e, &mut |_, n| nodes.push(n));
                        for n in nodes {
                            if *hit {
                                return;
                            }
                            match n {
                                Node::Load { addr, .. } => {
                                    *hit = wk.contains(&an.value_key(Some(ctx), f, addr, q, 0))
                                }
                                Node::Call(_, args) | Node::Fn(_, args) => {
                                    *hit = ir
                                        .items(args)
                                        .any(|a| wk.contains(&an.value_key(Some(ctx), f, a, q, 0)))
                                }
                                Node::Var(id) if kd.is_some() && d < 3 => {
                                    if let Some(z) = def_step(an, kd.as_ref().unwrap(), id, q) {
                                        go(an, ctx, kd, ir, f, wk, z.0, z.1, d + 1, hit);
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                    let mut hit = false;
                    go(self, ctx, &kd, kir, k.fn_, &wk, k.c, k.pos, 0, &mut hit);
                    hit
                };
                if !wk.is_empty() && conds.iter().any(|k| k.how != "before" && reads_w(k)) {
                    continue;
                }
                if ix.checks.iter().any(|k| {
                    (k.account.as_ref() == Some(&acct)
                        || (k.account.as_ref().is_none_or(|a| a.is_empty())
                            && k.kinds.contains(&"initialized")))
                        && k.kinds
                            .iter()
                            .any(|x| *x == "state" || *x == "discriminator" || *x == "initialized")
                }) {
                    continue;
                }
                let tre =
                    regex::Regex::new(&format!(r"^{}\.data\[0\.\.[18]\]$", regex::escape(&acct)))
                        .unwrap();
                let tag = ix.ops.iter().find(|x| {
                    x.target.as_ref().is_some_and(|t| tre.is_match(t))
                        && crate::jre!(r"^(0x[0-9a-f]+|\d+)$")
                            .is_match(x.value.as_deref().unwrap_or(""))
                });
                out.init_writes.as_mut().unwrap().push(InitWrite {
                    acct: acct.clone(),
                    ty: String::new(),
                    at: o.at.clone(),
                    owner: ix
                        .checks
                        .iter()
                        .any(|k| k.account.as_ref() == Some(&acct) && k.kinds.contains(&"owner")),
                    field: o.target.clone(),
                    tag: tag.map(|t| {
                        format!(
                            "{} = {}",
                            t.target.as_ref().unwrap(),
                            t.value.as_ref().unwrap()
                        )
                    }),
                });
                break;
            }
        }
        out
    }

    /// Initialization writes (reinit-unchecked): an account type's discriminator stored at offset 0 of an account's data
    fn init_writes(&self, ix: &IxOut, ctx: &IxCtx<'a>, owner_cmp: &[String]) -> Vec<InitWrite> {
        let Some(_) = self.fo(ctx.handler) else {
            return vec![];
        };
        let fns: Vec<i64> = std::iter::once(ctx.handler)
            .chain(ctx.parents.keys().copied())
            .collect();
        let mut discs: IndexMap<u64, String> = IndexMap::new();
        if let Some(idl) = self.idl {
            for (n, d) in &idl.accounts {
                discs.insert(*d, n.clone());
            }
        }
        for fn_ in &fns {
            if let Some(fo) = self.fo(*fn_) {
                for m in
                    crate::jre!(r"0x([0-9a-f]{9,16}) /\* account:(\w+) \*/").captures_iter(&fo.text)
                {
                    discs.insert(u64::from_str_radix(&m[1], 16).unwrap(), m[2].to_string());
                }
            }
        }
        if discs.is_empty() {
            return vec![];
        }
        if ix.ops.iter().any(|o| {
            o.has("ACCOUNT_CREATE")
                || o.cpi(|c| {
                    c.known.as_deref().is_some_and(|k| k.starts_with("SYSTEM"))
                        || c.family.as_deref() == Some("system")
                        || (!c.known.as_ref().is_some_and(|k| !k.is_empty())
                            && !c.family.as_ref().is_some_and(|k| !k.is_empty()))
                })
                .unwrap_or(false)
        }) {
            return vec![];
        }
        self.ev_init(ctx);
        let mut out: Vec<InitWrite> = Vec::new();
        let mut compared: HashSet<String> = HashSet::new();
        for fn_ in &fns {
            if let Some(fo) = self.fo(*fn_) {
                let ir = fir(fo.f);
                for b in &fo.f.blocks {
                    if let Term::Br { c, .. } = &b.term {
                        ir.walk(*c, &mut |_, n| {
                            if let Node::Const(v) = n {
                                if let Some(nm) = discs.get(&v) {
                                    compared.insert(nm.clone());
                                }
                            }
                        });
                    }
                }
            }
        }
        for &fn_ in &fns {
            let fo = self.fo(fn_);
            let ev = self.ev_for(ctx, fn_);
            let d = self.defs_in(fn_);
            let (Some(fo), Some(ev), Some(d)) = (fo, ev, d) else {
                continue;
            };
            let ir = fir(fo.f);
            let base_of = |e: E| -> (E, bool) {
                match ir.get(e) {
                    Node::Bin(BinOp::Add, a, b) if !matches!(ir.get(b), Node::Const(_)) => {
                        (a, true)
                    }
                    _ => (e, false),
                }
            };
            let mut buf_v: HashMap<u32, String> = HashMap::new();
            let mut buf_f: HashMap<FK, String> = HashMap::new();
            let mut any = false;
            for b in &fo.f.blocks {
                for st in &b.stmts {
                    let (v, a) = match st {
                        Stmt::Store {
                            size: 8, v, addr, ..
                        } => (Some(*v), *addr),
                        Stmt::Stores {
                            size: 8,
                            vals,
                            addr,
                            ..
                        } if vals.len > 0 => (Some(ir.at(*vals, 0)), *addr),
                        _ => continue,
                    };
                    let Some(Node::Const(cv)) = v.map(|v| ir.get(v)) else {
                        continue;
                    };
                    let Some(nm) = discs.get(&cv) else { continue };
                    any = true;
                    if let Some(z) = d.fp_off(a) {
                        buf_f.insert(FK::of(z), nm.clone());
                    } else if let Node::Var(id) = ir.get(a) {
                        buf_v.insert(id, nm.clone());
                    }
                }
            }
            if !any {
                continue;
            }
            let buf_of = |e: E| -> Option<String> {
                let (b, _) = base_of(e);
                match d.fp_off(b) {
                    Some(z) => buf_f.get(&FK::of(z)).cloned(),
                    None => match ir.get(b) {
                        Node::Var(id) => buf_v.get(&id).cloned(),
                        _ => None,
                    },
                }
            };
            for (bi, b) in fo.f.blocks.iter().enumerate() {
                for (i, st) in b.stmts.iter().enumerate() {
                    let p = pos_of(bi, i);
                    let (dst, ty): (Option<E>, Option<String>) = match st {
                        Stmt::Store { addr, v, .. } => {
                            (Some(*addr), vtype(ir, *v, &discs, &buf_of))
                        }
                        Stmt::Stores { addr, vals, .. } => (
                            Some(*addr),
                            if vals.len > 0 {
                                vtype(ir, ir.at(*vals, 0), &discs, &buf_of)
                            } else {
                                None
                            },
                        ),
                        _ => {
                            let c = call_of(ir, st);
                            let mc: Option<(Option<E>, Option<E>)> = match (st, &c) {
                                (Stmt::Copy { dst, src, .. }, _) => Some((Some(*dst), Some(*src))),
                                (_, Some((CallTarget::Fn { pc }, args)))
                                    if crate::jre!(r"memcpy|memmove")
                                        .is_match(&self.pname(*pc)) =>
                                {
                                    Some((
                                        ir.to_vec(*args).first().copied(),
                                        ir.to_vec(*args).get(1).copied(),
                                    ))
                                }
                                (_, Some((CallTarget::Sys { name, .. }, args)))
                                    if crate::jre!(r"memcpy|memmove").is_match(name) =>
                                {
                                    Some((
                                        ir.to_vec(*args).first().copied(),
                                        ir.to_vec(*args).get(1).copied(),
                                    ))
                                }
                                _ => None,
                            };
                            match mc {
                                Some((dd, ss)) => (dd, ss.and_then(|x| buf_of(x))),
                                None => (None, None),
                            }
                        }
                    };
                    let (Some(dst), Some(ty)) = (dst, ty) else {
                        continue;
                    };
                    let (base, var_off) = base_of(dst);
                    let Some(h) = ev.ev(base, p, 0).and_then(|v| v.ha()) else {
                        continue;
                    };
                    if h.k != HK::Data
                        || (h.off != 0.0 && !var_off)
                        || compared.contains(&ty)
                        || out.iter().any(|x| x.acct == h.acct)
                    {
                        continue;
                    }
                    let t = self.try_info(ctx.handler).map(|t| t.try_pc);
                    let mut conds: Vec<(i64, E, Pos)> = self
                        .path_to(Some(ctx), fn_, Some(bi), 80)
                        .into_iter()
                        .filter(|k| k.how != "before")
                        .map(|k| (k.fn_, k.c, k.pos))
                        .collect();
                    if let Some(tf) = t.and_then(|t| self.fo(t)) {
                        for (tbi, tb) in tf.f.blocks.iter().enumerate() {
                            if let Term::Br { c, .. } = &tb.term {
                                conds.push((t.unwrap(), *c, pos_of(tbi, tb.stmts.len())));
                            }
                        }
                    }
                    if conds
                        .iter()
                        .any(|(f2, c2, q)| self.reads_data(ctx, *f2, *c2, *q, &h.acct))
                    {
                        continue;
                    }
                    if ix.checks.iter().any(|k| {
                        k.account.as_ref() == Some(&h.acct)
                            && k.kinds.iter().any(|x| {
                                ["discriminator", "zero", "initialized", "state"].contains(x)
                            })
                    }) {
                        continue;
                    }
                    let facts = self.facts.borrow();
                    let ff = facts.get(&fn_);
                    let spc = stmt_pc(st);
                    out.push(InitWrite {
                        acct: h.acct.clone(),
                        ty,
                        at: Loc {
                            fn_: ff.map_or(fo.name.clone(), |f| f.name.clone()),
                            line: ff.and_then(|f| f.pc_line.get(&spc).copied()).unwrap_or(0),
                            pc: Some(spc),
                        },
                        owner: owner_cmp.contains(&h.acct)
                            || ix.checks.iter().any(|k| {
                                k.account.as_ref() == Some(&h.acct) && k.kinds.contains(&"owner")
                            }),
                        field: None,
                        tag: None,
                    });
                }
            }
        }
        out
    }

    /// whether a value reads an account's data (a load through a pointer into it), through variables
    fn reads_data(&self, ctx: &IxCtx<'a>, fn_: i64, e: E, p: Pos, acct: &str) -> bool {
        let (Some(ev), Some(d)) = (self.ev_for(ctx, fn_), self.defs_in(fn_)) else {
            return false;
        };
        fn go<'a>(
            an: &An<'a>,
            ev: &ACtx<'a>,
            d: &Defs<'a>,
            e: E,
            p: Pos,
            dd: u32,
            acct: &str,
        ) -> bool {
            if dd > 6 {
                return false;
            }
            let ir = d.ir;
            let mut nodes: Vec<Node> = Vec::new();
            ir.walk(e, &mut |_, n| nodes.push(n));
            let mut hit = false;
            for n in nodes {
                if hit {
                    break;
                }
                match n {
                    Node::Load { addr, .. } => {
                        let a = match ir.get(addr) {
                            Node::Bin(BinOp::Add, x, y) if !matches!(ir.get(y), Node::Const(_)) => {
                                x
                            }
                            _ => addr,
                        };
                        hit = ev
                            .ev(a, p, 0)
                            .and_then(|v| v.ha())
                            .is_some_and(|h| h.k == HK::Data && h.acct == acct);
                    }
                    Node::Var(id) => {
                        if let Some(y) = def_step(an, d, id, p) {
                            if !matches!(ir.get(y.0), Node::Call(..)) {
                                hit = go(an, ev, d, y.0, y.1, dd + 1, acct);
                            }
                        }
                    }
                    _ => {}
                }
            }
            hit
        }
        go(self, &ev, &d, e, p, 0, acct)
    }

    /// Anchor: whether a value reads the account's bytes (its data, or its object in the handler's frame)
    fn reads_acct(&self, ctx: &IxCtx<'a>, fn_: i64, e: E, p: Pos, acct: &str) -> bool {
        let (Some(ev), Some(d)) = (self.ev_for(ctx, fn_), self.defs_in(fn_)) else {
            return false;
        };
        if self.fo(ctx.handler).is_none() {
            return false;
        }
        let ae = self.anchor_eval(ctx.handler);
        let h = ctx.handler;
        let f = self.fo(fn_).unwrap().f;
        let ir = fir(f);
        let mut stored: HashSet<u32> = HashSet::new();
        for (bi, b) in f.blocks.iter().enumerate() {
            for (i, s) in b.stmts.iter().enumerate() {
                let (addr, size, vals): (E, u8, Vec<E>) = match s {
                    Stmt::Store { addr, v, size, .. } => (*addr, *size, vec![*v]),
                    Stmt::Stores {
                        addr, vals, size, ..
                    } => (*addr, *size, ir.to_vec(*vals)),
                    _ => continue,
                };
                if !vals.iter().any(|v| matches!(ir.get(*v), Node::Var(_))) {
                    continue;
                }
                if let Some(HVal::Fr { ctx: hc, z, at }) = ev.ev(addr, pos_of(bi, i), 0) {
                    if hc.fo == h
                        && ae
                            .frame_acct(z, size as f64, at)
                            .is_some_and(|x| x.0 == acct)
                    {
                        for v in &vals {
                            if let Node::Var(id) = ir.get(*v) {
                                stored.insert(id);
                            }
                        }
                    }
                }
            }
        }
        fn go<'a>(
            an: &An<'a>,
            ev: &ACtx<'a>,
            ae: &super::anchor::AnchorEval<'a>,
            h: i64,
            d: &Defs<'a>,
            stored: &HashSet<u32>,
            e: E,
            p: Pos,
            dd: u32,
            acct: &str,
        ) -> bool {
            if dd > 6 {
                return false;
            }
            let ir = d.ir;
            let mut nodes: Vec<Node> = Vec::new();
            ir.walk(e, &mut |_, n| nodes.push(n));
            let mut hit = false;
            for n in nodes {
                if hit {
                    break;
                }
                match n {
                    Node::Load { addr, size } => match ev.ev(addr, p, 0) {
                        Some(HVal::Fr { ctx: hc, z, at }) if hc.fo == h => {
                            hit = ae
                                .frame_acct(z, size as f64, at)
                                .is_some_and(|x| x.0 == acct);
                        }
                        Some(v) => {
                            if let Some(x) = v.ha() {
                                if x.k == HK::Data {
                                    hit = x.acct == acct;
                                }
                            }
                        }
                        None => {}
                    },
                    Node::Var(id) => {
                        if stored.contains(&id) {
                            hit = true;
                            break;
                        }
                        if let Some(y) = def_step(an, d, id, p) {
                            if !matches!(ir.get(y.0), Node::Call(..)) {
                                hit = go(an, ev, ae, h, d, stored, y.0, y.1, dd + 1, acct);
                            }
                        }
                    }
                    _ => {}
                }
            }
            hit
        }
        go(self, &ev, &ae, h, &d, &stored, e, p, 0, acct)
    }

    /// Accounts whose data the instruction parses as the Instructions sysvar (by behavior)
    fn sysvar_reads(&self, ix: &IxOut, ctx: &IxCtx<'a>, s: &SourceCtx<'a, '_>) -> Vec<SysvarRead> {
        let mut out: Vec<SysvarRead> = Vec::new();
        let by_name: HashMap<String, i64> = self
            .facts
            .borrow()
            .iter()
            .map(|(pc, f)| (f.name.clone(), *pc))
            .collect();
        let id_compared = ix.functions.iter().any(|n| {
            let Some(pc) = by_name.get(n) else {
                return false;
            };
            self.facts.borrow()[pc]
                .lines
                .iter()
                .any(|l| l.contains("SYSVAR_INSTRUCTIONS"))
        });
        for fname in &ix.functions {
            let ff = by_name.get(fname).copied();
            let fo = ff.and_then(|pc| self.fo(pc));
            let d = ff.and_then(|pc| self.defs_in(pc));
            let (Some(fpc), Some(fo), Some(d)) = (ff, fo, d) else {
                continue;
            };
            if out.len() >= 4 {
                continue;
            }
            let mut bases0: HashSet<String> = HashSet::new();
            let mut cands: Vec<(E, Pos, &'static str)> = Vec::new();
            for bi in 0..fo.f.blocks.len() {
                if ctx.restricted.as_ref().is_some_and(|r| r.contains(&fpc))
                    && ctx.allowed(fpc, bi) == Some(false)
                {
                    continue;
                }
                let (b, c) = self.sysvar_scan(fpc, &d, bi);
                bases0.extend(b.iter().cloned());
                cands.extend(c.iter().cloned());
            }
            let ir = fir(fo.f);
            for (base, p, what) in cands {
                if what.contains("offset") && !bases0.contains(&crate::util::jkey_s(ir, base)) {
                    continue;
                }
                let mut accts: Vec<String> = Vec::new();
                for x in s.of(fpc, base, p) {
                    if x.kind == "data" {
                        if let Some(a) = x.acct.filter(|a| !a.is_empty()) {
                            if !accts.contains(&a) {
                                accts.push(a);
                            }
                        }
                    }
                }
                if accts.is_empty() && !self.anchor {
                    if let Some(r) = self.ctx_resolver(ctx, fpc, 0) {
                        if let Some(rf) = r.value_at(&self.fl, base, p) {
                            if rf.field.as_deref().is_some_and(|f| f.starts_with("data")) {
                                accts.push(
                                    ix.accounts
                                        .iter()
                                        .find(|x| x.index == Some(rf.index))
                                        .map_or_else(
                                            || {
                                                format!(
                                                    "account[{}]",
                                                    crate::util::js_num(rf.index)
                                                )
                                            },
                                            |x| x.name.clone(),
                                        ),
                                );
                            }
                        }
                    }
                }
                let sb = &fo.f.blocks[(p >> 16) as usize];
                let Some(st) = sb.stmts.get((p & 0xffff) as usize) else {
                    self.set_err("Cannot read properties of undefined (reading 'pc')");
                    return out;
                };
                let (line, fname2) = {
                    let facts = self.facts.borrow();
                    let f = &facts[&fpc];
                    (
                        f.pc_line
                            .get(&stmt_pc(st))
                            .copied()
                            .unwrap_or(f.at as i64 + 1),
                        f.name.clone(),
                    )
                };
                let list = if accts.is_empty() {
                    vec!["?".to_string()]
                } else {
                    accts
                };
                for acct in list {
                    if !out.iter().any(|y| y.acct == acct) {
                        out.push(SysvarRead {
                            acct,
                            sysvar: what,
                            at: Loc {
                                fn_: fname2.clone(),
                                line,
                                pc: None,
                            },
                            id_compared,
                        });
                    }
                }
            }
        }
        out
    }

    /// a block's 2-byte loads (sysvarReads): the bases read at no offset (their keys), the candidate reads
    fn sysvar_scan(
        &self,
        fn_: i64,
        d: &Defs<'a>,
        bi: usize,
    ) -> (Vec<String>, Vec<(E, Pos, &'static str)>) {
        let f = self.fo(fn_).unwrap().f;
        let ir = fir(f);
        let i64v = |x: E| match ir.get(x) {
            Node::Const(v) => Some(v as i64),
            _ => None,
        };
        let def = |e: E, p: Pos| -> (E, Pos) {
            let (mut e, mut p) = (e, p);
            for _ in 0..4 {
                let Node::Var(id) = ir.get(e) else { break };
                let Some(y) = def_step(self, d, id, p) else {
                    break;
                };
                e = y.0;
                p = y.1;
            }
            (e, p)
        };
        let minus2 = |e: E, p: Pos| match ir.get(def(e, p).0) {
            Node::Bin(BinOp::Sub, _, b) => i64v(b) == Some(2),
            Node::Bin(BinOp::Add, _, b) => i64v(b) == Some(-2),
            _ => false,
        };
        let twiceplus2 = |e: E, p: Pos| {
            let (x, q) = def(e, p);
            let Node::Bin(BinOp::Add, xa, xb) = ir.get(x) else {
                return false;
            };
            if i64v(xb) != Some(2) {
                return false;
            }
            match ir.get(def(xa, q).0) {
                Node::Bin(BinOp::Shl, _, b) => i64v(b) == Some(1),
                Node::Bin(BinOp::Mul, _, b) => i64v(b) == Some(2),
                _ => false,
            }
        };
        let mut bases: Vec<String> = Vec::new();
        let mut cands: Vec<(E, Pos, &'static str)> = Vec::new();
        let mut scan = |e: E, p: Pos| {
            let mut nodes: Vec<Node> = Vec::new();
            ir.walk(e, &mut |_, n| nodes.push(n));
            for n in nodes {
                let Node::Load { size: 2, addr } = n else {
                    continue;
                };
                let Node::Bin(BinOp::Add, aa, ab) = ir.get(addr) else {
                    bases.push(crate::util::jkey_s(ir, addr));
                    continue;
                };
                if minus2(ab, p) {
                    cands.push((aa, p, "Instructions (current index: the last 2 bytes)"));
                } else if i64v(ab) == Some(-2) && matches!(ir.get(aa), Node::Bin(BinOp::Add, _, _))
                {
                    let Node::Bin(_, aaa, _) = ir.get(aa) else {
                        unreachable!()
                    };
                    cands.push((aaa, p, "Instructions (current index: the last 2 bytes)"));
                } else if twiceplus2(ab, p) {
                    cands.push((
                        aa,
                        p,
                        "Instructions (an instruction's offset: u16 at 2 + 2 * index)",
                    ));
                }
            }
        };
        let b = &f.blocks[bi];
        for (si, s) in b.stmts.iter().enumerate() {
            for e in crate::util::stmt_exprs(ir, s) {
                scan(e, pos_of(bi, si));
            }
        }
        if let Term::Br { c, .. } = &b.term {
            scan(*c, pos_of(bi, b.stmts.len()));
        }
        (bases, cands)
    }

    /// evaluatorsFor(r, ctx)(fn): the Anchor evaluation context of a function of an instruction (its parameters
    /// bound up the call path; try_accounts' &AccountInfo variables)
    pub fn ev_for(&self, ctx: &IxCtx<'a>, fn_: i64) -> Option<Rc<ACtx<'a>>> {
        self.ev_init(ctx);
        self.ev_in(ctx, fn_, 0)
    }

    /// (evaluatorsFor's creation: the handler's anchorEval and tryInfo, once per context)
    pub fn ev_init(&self, ctx: &IxCtx<'a>) {
        if ctx.ev_ready.get() {
            return;
        }
        ctx.ev_ready.set(true);
        if self.fo(ctx.handler).is_some() {
            self.anchor_eval(ctx.handler);
            self.try_info(ctx.handler);
        }
    }

    fn ev_in(&self, ctx: &IxCtx<'a>, fn_: i64, d: u32) -> Option<Rc<ACtx<'a>>> {
        self.fo(ctx.handler)?;
        if d > 8 {
            return None;
        }
        if let Some(x) = ctx.ev.borrow().get(&fn_) {
            return x.clone();
        }
        ctx.ev.borrow_mut().insert(fn_, None);
        let ae = self.anchor_eval(ctx.handler);
        let mut x: Option<Rc<ACtx<'a>>> = None;
        if let Some(fo) = self.fo(fn_) {
            if fn_ == ctx.handler {
                x = Some(ae.ctx_of(fn_, IndexMap::new(), 2));
            } else {
                let par = ctx.parents.get(&fn_).copied();
                let pp = par.and_then(|p| self.ev_in(ctx, p.fn_, d + 1));
                let st = par.and_then(|p| p.pc.and_then(|pc| self.stmt_at(p.fn_, pc)));
                let c = match (par, st) {
                    (Some(p), Some((b, i))) => {
                        let pf = self.fo(p.fn_).unwrap().f;
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
                    let t = self.try_info(ctx.handler);
                    if let Some(t) = t.filter(|t| t.try_pc == fn_) {
                        if let Some(ptrs) = &t.ptrs {
                            for (id, acct) in ptrs {
                                let mut h = HA::new(HK::Info, acct.clone(), 0.0);
                                h.seq = t.seqs.as_ref().and_then(|s| s.get(id).cloned());
                                roots.insert(*id, HVal::a(h));
                            }
                        }
                    }
                    x = Some(ae.ctx_of(fn_, roots, 2));
                }
            }
        }
        ctx.ev.borrow_mut().insert(fn_, x.clone());
        x
    }
}

const AUDIT_VALUE_OPS: &[&str] = &[
    "LAMPORT_WRITE",
    "LAMPORT_TRANSFER",
    "TOKEN_TRANSFER",
    "MINT",
    "BURN",
];

fn vtype(
    ir: &sbpf_ir::Ir,
    v: E,
    discs: &IndexMap<u64, String>,
    buf_of: &dyn Fn(E) -> Option<String>,
) -> Option<String> {
    match ir.get(v) {
        Node::Const(c) => discs.get(&c).cloned(),
        Node::Load { addr, .. } => buf_of(addr),
        _ => None,
    }
}

/// a variable's single definition, or the one reaching p (multi)
pub fn def_step<'a>(an: &An<'a>, d: &Defs<'a>, id: u32, p: Pos) -> Option<(E, Pos)> {
    if let Some(&x) = d.defs.get(&id) {
        Some((x, d.def_pos[&id]))
    } else if d.multi.contains(&id) {
        d.reaching(&an.fl, id as f64, p, false)
    } else {
        None
    }
}

/// the accounts a compared value comes from: pointers to a key / owner / data, and the frame bytes copied from them
fn reads<'a>(an: &An<'a>, ev: &ACtx<'a>, e: E, p: Pos) -> Vec<(String, HK)> {
    let mut out = Vec::new();
    let one = |out: &mut Vec<(String, HK)>, v: &Option<HVal<'a>>| {
        if let Some(x) = v.as_ref().and_then(|v| v.ha()) {
            if matches!(x.k, HK::Keyp | HK::Ownp | HK::Data | HK::Info) {
                out.push((x.acct, x.k));
            }
        }
    };
    let v = ev.ev(e, p, 0);
    one(&mut out, &v);
    if let Some(HVal::Fr { ctx, z, at }) = &v {
        let y = ctx.d.reaching(&an.fl, slot(*z), *at, true);
        if let Some((ye, yp)) = y {
            if let Node::Load { addr, .. } = ctx.d.ir.get(ye) {
                let w = ctx.ev(addr, yp, 0);
                one(&mut out, &w);
            }
        }
    }
    out
}

/// the load a value is (through variables and frame words, not a call's results): its address, with its position
fn direct<'a>(an: &An<'a>, e: E, p: Pos, d: &Defs<'a>, dd: u32) -> Option<(E, Pos)> {
    if dd > 8 {
        return None;
    }
    let ir = d.ir;
    match ir.get(e) {
        Node::Ext { a, .. } => direct(an, a, p, d, dd + 1),
        Node::Var(id) => {
            let y = def_step(an, d, id, p)?;
            if matches!(ir.get(y.0), Node::Call(..)) {
                None
            } else {
                direct(an, y.0, y.1, d, dd + 1)
            }
        }
        Node::Load { addr, .. } => match d.fp_off(addr) {
            None => Some((addr, p)),
            Some(o) => {
                let y = d.reaching(&an.fl, slot(o), p, true)?;
                if matches!(ir.get(y.0), Node::Call(..)) {
                    None
                } else {
                    direct(an, y.0, y.1, d, dd + 1)
                }
            }
        },
        _ => None,
    }
}

/// whether a statement after position p (in its block, or in a block reachable from it) reads the frame bytes [O, O + n)
fn read_after(f: &sbpf_program::Func, p: Pos, d: &Defs, o: f64, n: f64) -> bool {
    let ir = fir(f);
    let blocks = &f.blocks;
    let hit = |e: E| -> bool {
        let mut h = false;
        ir.walk(e, &mut |_, x| {
            if h {
                return;
            }
            match x {
                Node::Load { addr, size } => {
                    if let Some(a) = d.fp_off(addr) {
                        if a < o + n && o < a + size as f64 {
                            h = true;
                        }
                    }
                }
                Node::Call(_, args) | Node::Fn(_, args) => {
                    for y in ir.items(args) {
                        if let Some(a) = d.fp_off(y) {
                            if a <= o && o < a + 64.0 {
                                h = true;
                            }
                        }
                    }
                }
                _ => {}
            }
        });
        h
    };
    let stmt_hit = |s: &Stmt| -> bool {
        if let Stmt::Copy { src, n: cn, .. } = s {
            if let Some(a) = d.fp_off(*src) {
                if a < o + n && o < a + *cn as f64 {
                    return true;
                }
            }
        }
        if let Some((_, args)) = call_of(ir, s) {
            for y in ir.items(args) {
                if let Some(a) = d.fp_off(y) {
                    if a <= o && o < a + 64.0 {
                        return true;
                    }
                }
            }
        }
        let es: Vec<E> = match s {
            Stmt::Set { e, .. } | Stmt::Eval { e, .. } => vec![*e],
            Stmt::Store { addr, v, .. } => vec![*addr, *v],
            Stmt::Stores { addr, vals, .. } => {
                std::iter::once(*addr).chain(ir.items(*vals)).collect()
            }
            Stmt::Copy { dst, src, .. } => vec![*dst, *src],
            Stmt::Call { args, .. } => ir.to_vec(*args),
            _ => vec![],
        };
        es.into_iter().any(hit)
    };
    let term_hit = |b: usize| match &blocks[b].term {
        Term::Br { c, .. } => hit(*c),
        Term::Ret { e: Some(e) } => hit(*e),
        _ => false,
    };
    let b0 = (p >> 16) as usize;
    let i0 = (p & 0xffff) as usize;
    if blocks[b0].stmts.iter().skip(i0 + 1).any(stmt_hit) {
        return true;
    }
    if term_hit(b0) {
        return true;
    }
    let mut seen: HashSet<usize> = HashSet::from([b0]);
    let mut work: Vec<usize> = blocks[b0].succs.clone();
    while let Some(b) = work.pop() {
        if !seen.insert(b) {
            continue;
        }
        if blocks[b].stmts.iter().any(stmt_hit) || term_hit(b) {
            return true;
        }
        work.extend(blocks[b].succs.iter().copied());
    }
    false
}

/// the width of a function's parameter: its argument's at the call site up the instruction's call path
struct PW<'a, 'x> {
    an: &'x An<'a>,
    ctx: &'x IxCtx<'a>,
    fn_: i64,
    depth: u32,
}

impl PW<'_, '_> {
    fn get(&self, id: u32) -> u32 {
        let an = self.an;
        let k = an
            .fo(self.fn_)
            .and_then(|fo| fo.f.vars.iter().find(|v| v.id == id))
            .map_or(-1, |v| v.param);
        let par = if self.fn_ != self.ctx.handler {
            self.ctx.parents.get(&self.fn_).copied()
        } else {
            None
        };
        let Some(par) = par else { return 0 };
        let Some(ppc) = par.pc else { return 0 };
        if !(1..=5).contains(&k) || self.depth > 3 {
            return 0;
        }
        let Some((b, i)) = an.stmt_at(par.fn_, ppc) else {
            return 0;
        };
        let pf = an.fo(par.fn_).unwrap().f;
        let pir = fir(pf);
        let Some((_, args)) = call_of(pir, &pf.blocks[b].stmts[i]) else {
            return 0;
        };
        let Some(d) = an.defs_in(par.fn_) else {
            return 0;
        };
        if (k - 1) as u32 >= args.len {
            return 0;
        }
        let pw = PW {
            an,
            ctx: self.ctx,
            fn_: par.fn_,
            depth: self.depth + 1,
        };
        width(an, pir.at(args, (k - 1) as u32), pos_of(b, i), &d, 0, &pw)
    }
}

/// an `ext` narrowing a wider value on the way to e (through variables' definitions): the inner value and its width
fn narrowed<'a>(
    an: &An<'a>,
    e: E,
    p: Pos,
    d: &Defs<'a>,
    dd: u32,
    pw: &PW,
) -> Option<(E, Pos, u32)> {
    if dd > 6 {
        return None;
    }
    let ir = d.ir;
    let mut nodes: Vec<Node> = Vec::new();
    ir.walk(e, &mut |_, n| nodes.push(n));
    let mut found: Option<(E, Pos, u32)> = None;
    for n in nodes {
        if found.is_some() {
            break;
        }
        match n {
            Node::Ext { bits, a, .. } => {
                if width(an, a, p, d, 0, pw) > bits as u32 {
                    found = Some((a, p, bits as u32));
                }
            }
            Node::Var(id) => {
                if let Some(y) = def_step(an, d, id, p) {
                    if !matches!(ir.get(y.0), Node::Call(..)) {
                        found = narrowed(an, y.0, y.1, d, dd + 1, pw);
                    }
                }
            }
            _ => {}
        }
    }
    found
}

/// the width in bits of a value, 0 when not known
fn width<'a>(an: &An<'a>, e: E, p: Pos, d: &Defs<'a>, dd: u32, pw: &PW) -> u32 {
    if dd > 6 {
        return 0;
    }
    let ir = d.ir;
    match ir.get(e) {
        Node::Load { size, .. } => size as u32 * 8,
        Node::Ext { bits, .. } => bits as u32,
        Node::Const(v) => {
            if v < 0x100 {
                8
            } else if v < 0x10000 {
                16
            } else if v < 0x1_0000_0000 {
                32
            } else {
                64
            }
        }
        Node::Bin(op, x, y) => {
            let a = width(an, x, p, d, dd + 1, pw);
            let b = width(an, y, p, d, dd + 1, pw);
            let is_and = op.as_str() == "and";
            if (a == 0 && !matches!(ir.get(x), Node::Const(_)))
                || (b == 0 && !matches!(ir.get(y), Node::Const(_)))
            {
                return if is_and { a.max(b) } else { 0 };
            }
            if is_and {
                a.min(b)
            } else if ["shr", "sar", "div", "udiv", "mod", "umod"].contains(&op.as_str()) {
                a
            } else {
                a.max(b)
            }
        }
        Node::Var(id) => match def_step(an, d, id, p) {
            Some(y) => {
                if matches!(ir.get(y.0), Node::Call(..)) {
                    0
                } else {
                    width(an, y.0, y.1, d, dd + 1, pw)
                }
            }
            None => pw.get(id),
        },
        _ => 0,
    }
}
