//! The report layer (`src/analysis/report.ts` analyze0): per instruction (ixctx.rs contexts) the check rows
//! (canonical account names, Anchor key comparisons, sysvar checks, native account resolvers), the operation
//! rows (CPIs completed by the instruction built before them, library CPI helpers), the Anchor post-passes
//! (cross-account data comparisons, Vec membership, CpiContext accounts), the dominance statuses (phase2.rs), the
//! per-account constraints and the runtime model, effects and the sensitivity score; the program-level views (PDAs,
//! state writes, read / write dependencies, unattributed operations). Phase 2 / 3 run on the result (phase2.rs).

use super::acct::{account_resolver, seed_from, AcctRef, Resolver, Side};
use super::anchor::HK;
use super::audit::AuditFacts;
use super::consistency::RoleView;
use super::dispatch::DispatchGroups;
use super::facts::{cpi_kinds, helper_roles, ref_of, FnFacts, IxHint, OpCpi, Pda};
use super::flow::*;
use super::ixctx::{Expected, IxInfo};
use super::phase2::{AuthorityRow, Finding, Relation, StoredKeys, TrustRow};
use super::phase3::{ArithSite, Chain, DivSite, PathInfo, Proof, StateField};
use super::An;
use crate::cpi::PartAcc;
use indexmap::{IndexMap, IndexSet};
use sbpf_ir::{CallTarget, Node, Stmt, E};
use std::cell::{OnceCell, RefCell};
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

pub fn rank(s: &str) -> i32 {
    match s {
        "found" => 3,
        "runtime" => 2,
        "partial" => 1,
        _ => 0,
    }
}

fn weight(k: &str) -> i64 {
    match k {
        "TOKEN_TRANSFER" | "LAMPORT_TRANSFER" | "MINT" => 5,
        "BURN" => 3,
        "PROGRAM_UPGRADE" => 6,
        "AUTHORITY_WRITE" | "ACCOUNT_CLOSE" | "OWNER_ASSIGN" | "LAMPORT_WRITE" => 4,
        "PDA_SIGNATURE" => 3,
        "ACCOUNT_REALLOC" | "ACCOUNT_CREATE" => 2,
        "ACCOUNT_DATA_WRITE" | "CPI" => 1,
        _ => 0,
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct Loc {
    pub fn_: String,
    pub line: i64,
    pub pc: Option<i64>,
}

#[derive(Clone, Debug)]
pub struct Evidence {
    pub status: &'static str,
    pub at: Option<Loc>,
    pub via: Option<String>,
    pub note: Option<&'static str>,
}

#[derive(Clone, Debug)]
pub struct AcctOut {
    pub index: Option<f64>,
    pub name: String,
    pub source: &'static str,
    pub expected: Expected,
    pub constraints: IndexMap<&'static str, Evidence>,
}

impl AcctOut {
    /// a constraint that is there and not `not_found`
    pub fn has(&self, k: &str) -> bool {
        self.constraints
            .get(k)
            .is_some_and(|e| e.status != "not_found")
    }
}

#[derive(Clone, Debug)]
pub struct CheckOut {
    pub at: Loc,
    pub status: &'static str,
    pub account: Option<String>,
    pub kinds: Vec<&'static str>,
    pub cond: String,
    pub fails_if: bool,
    pub error: String,
    pub via: Option<String>,
    pub sides: Option<(String, String)>,
    pub pda_bufs: Option<Vec<f64>>,
    pub fn_pc: i64,
    pub c: Option<E>,
    pub pass_pc: Option<i64>,
    pub main: bool,
    pub key_cmp: bool,
    pub cross: Option<(String, String)>,
}

#[derive(Clone, Debug)]
pub struct Bypass {
    pub check: usize,
    pub path: Vec<Loc>,
    pub strong: bool,
}

#[derive(Clone, Debug, PartialEq)]
pub struct SrcRow {
    pub param: String,
    pub source: String,
    pub trust: &'static str,
}

/// an operation's CPI: shared by reference (the facts' object is shared by the instructions reaching the function)
pub type CpiRef = Rc<RefCell<OpCpi>>;

#[derive(Clone, Debug)]
pub struct OpOut {
    pub at: Loc,
    pub kinds: Vec<&'static str>,
    pub text: String,
    pub main: bool,
    pub target: Option<String>,
    pub how: Option<&'static str>,
    pub value: Option<String>,
    pub cpi: Option<CpiRef>,
    pub pda: Option<Pda>,
    pub fn_pc: Option<i64>,
    pub ret: Option<E>,
    pub anchor_close: bool,
    pub guards: Option<Vec<usize>>,
    pub bypass: Option<Vec<Bypass>>,
    pub sources: Option<Vec<SrcRow>>,
}

impl OpOut {
    pub fn has(&self, k: &str) -> bool {
        self.kinds.contains(&k)
    }
    /// a field of the CPI (None without one)
    pub fn cpi<R>(&self, f: impl FnOnce(&OpCpi) -> R) -> Option<R> {
        self.cpi.as_ref().map(|c| f(&c.borrow()))
    }
}

#[derive(Clone, Debug)]
pub struct IxOut {
    pub name: String,
    pub handler: String,
    pub kind: &'static str,
    pub functions: Vec<String>,
    pub accounts: Vec<AcctOut>,
    pub checks: Vec<CheckOut>,
    pub ops: Vec<OpOut>,
    pub score: i64,
    pub effects: Vec<String>,
    pub indirect: Vec<String>,
    pub dispatch: Option<String>,
    /// the instruction's context (index into the contexts)
    pub info: usize,
    pub trust: Option<Vec<TrustRow>>,
    pub relations: Option<Vec<Relation>>,
    pub stored_keys: Option<Vec<StoredKeys>>,
    pub authority: Option<Vec<AuthorityRow>>,
    pub paths: Option<Vec<PathInfo>>,
    pub chains: Option<Vec<Chain>>,
    pub arith: Option<Vec<ArithSite>>,
    pub divs: Option<Vec<DivSite>>,
    pub proof: Option<Vec<Proof>>,
    pub audit: Option<AuditFacts>,
}

impl IxOut {
    pub fn acct(&self, n: &str) -> Option<&AcctOut> {
        self.accounts.iter().find(|x| x.name == n)
    }
}

#[derive(Clone, Debug)]
pub struct PdaOut {
    pub seeds: String,
    pub program: String,
    pub derived_in: Vec<String>,
    pub signs_in: Vec<String>,
    pub accounts: Vec<String>,
    pub compared: &'static str,
}

#[derive(Clone, Debug)]
pub struct WriteOut {
    pub ix: String,
    pub how: String,
    pub at: Loc,
}

pub struct ProgramOut {
    pub version: u32,
    pub instructions: usize,
    pub functions: usize,
    pub anchor: bool,
    pub idl: bool,
}

pub struct Analysis {
    pub program: ProgramOut,
    pub ixs: Vec<IxOut>,
    pub pdas: Vec<PdaOut>,
    pub state_writes: Vec<(String, Vec<WriteOut>)>,
    pub deps: Vec<(String, Vec<String>, Vec<String>)>,
    pub unattributed: Vec<OpOut>,
    /// the ranked findings (rule engine + incident rules, grouped by dispatcher)
    pub findings: Vec<Finding>,
    /// the rule engine's findings as they were before the incident rules (the `analysis` dump)
    pub rule_findings: Vec<Finding>,
    pub fund_movers: Option<Vec<super::incidents::FundMover>>,
    pub authority_fields: Option<Vec<(String, Vec<String>)>>,
    pub states: Option<Vec<StateField>>,
    pub consistency: Option<Vec<RoleView>>,
}

/// String.prototype.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
pub fn snake(s: &str) -> String {
    super::anchor::snake1(s)
}

/// TEMP: a temporary's name
fn is_temp(s: &str) -> bool {
    crate::jre!(r"^([a-z]{1,2}|v\d+|s[0-9a-f]+|p\d+|r\d|fp|u\d+|[a-z]{1,2}_\d+)$").is_match(s)
}

/// the facts' CPI objects by (function, op index): one shared object each
#[derive(Default)]
pub struct CpiReg {
    m: HashMap<(i64, usize), CpiRef>,
}

impl CpiReg {
    pub fn get(&mut self, fn_: i64, i: usize, c: &Option<OpCpi>) -> Option<CpiRef> {
        let c = c.as_ref()?;
        Some(
            self.m
                .entry((fn_, i))
                .or_insert_with(|| Rc::new(RefCell::new(c.clone())))
                .clone(),
        )
    }
}

fn fk(f: Option<&str>) -> Option<&'static str> {
    Some(match f? {
        "is_signer" => "signer",
        "is_writable" => "writable",
        "owner" => "owner",
        "key" => "key",
        "executable" => "executable",
        "data_len" => "data_len",
        "lamports" => "lamports",
        _ => return None,
    })
}

/// N truthy
fn truthy(x: Option<f64>) -> bool {
    x.is_some_and(|v| v != 0.0 && !v.is_nan())
}

fn st_truthy(x: &Option<String>) -> bool {
    x.as_deref().is_some_and(|s| !s.is_empty())
}

/// the key accounts of a side pair
fn side_obj(s: &Side) -> Option<&AcctRef> {
    match s {
        Side::Acct(r) => Some(r),
        _ => None,
    }
}

/// anchorCompares' per-function state
struct AnchorCmp<'a> {
    g: Rc<Cfg<'a>>,
    d: Rc<Defs<'a>>,
    calls: HashMap<Pos, String>,
    names: Vec<Option<String>>,
    accts: HashSet<String>,
    ipos: HashMap<Pos, String>,
    ivars: HashMap<u32, String>,
}

/// per-instruction state of analyze0's loop
struct IxB<'a, 'x> {
    an: &'x An<'a>,
    info: &'x IxInfo<'a>,
    accounts: Vec<AcctOut>,
    known: HashSet<String>,
    by_snake: HashMap<String, Option<String>>,
    checks: Vec<CheckOut>,
    pend: Vec<(String, &'static str, usize, Option<String>)>,
    ops: Vec<OpOut>,
    res_memo: RefCell<HashMap<i64, Option<Rc<Resolver<'a>>>>>,
    idl_paths: Vec<(Vec<String>, Option<String>)>,
}

impl<'a, 'x> IxB<'a, 'x> {
    fn idx_name(&self, i: f64) -> String {
        self.accounts
            .iter()
            .find(|y| y.index == Some(i))
            .map_or_else(
                || format!("account[{}]", crate::util::js_num(i)),
                |y| y.name.clone(),
            )
    }
    fn canon(&self, acct: Option<&str>) -> Option<String> {
        let acct = acct.filter(|s| !s.is_empty())?;
        if self.known.contains(acct) {
            return Some(acct.to_string());
        }
        let a = crate::jre!(r"_\d+$").replace(acct, "").to_string();
        if self.known.contains(&a) {
            return Some(a);
        }
        if let Some(Some(sn)) = self.by_snake.get(&a) {
            if !sn.is_empty() {
                return Some(sn.clone());
            }
        }
        let ix = crate::jre!(r"^acc(\d+)$")
            .captures(&a)
            .or_else(|| crate::jre!(r"^account\[(\d+)\]$").captures(&a))
            .map(|m| m[1].to_string());
        if let Some(d) = ix {
            let n = super::js_number(&d);
            return Some(
                self.accounts
                    .iter()
                    .find(|y| y.index == Some(n))
                    .map_or_else(|| format!("account[{d}]"), |y| y.name.clone()),
            );
        }
        if is_temp(acct) {
            None
        } else {
            Some(a)
        }
    }
    fn row(&mut self, nm: &str) -> usize {
        if let Some(i) = self.accounts.iter().position(|y| y.name == nm) {
            return i;
        }
        self.accounts.push(AcctOut {
            index: None,
            name: nm.to_string(),
            source: "code",
            expected: Expected::default(),
            constraints: IndexMap::new(),
        });
        self.known.insert(nm.to_string());
        self.accounts.len() - 1
    }
    fn note(&mut self, acct: &str, kind: &'static str, ev: Evidence) {
        let i = self.row(acct);
        let x = &mut self.accounts[i];
        let replace = match x.constraints.get(kind) {
            None => true,
            Some(old) => rank(ev.status) > rank(old.status),
        };
        if replace {
            x.constraints.insert(kind, ev);
        }
    }
    fn path_refs(&self, p: &str) -> Vec<String> {
        let segs: Vec<&str> = p.split('.').collect();
        let mut out: Vec<(usize, String)> = Vec::new();
        for (xs, name) in &self.idl_paths {
            let mut k = segs.len().min(xs.len());
            while k >= 1 {
                if let Some(n) = name {
                    if segs[..k].join(".") == xs[xs.len() - k..].join(".") {
                        let rest = segs[k..].join(".");
                        out.push((
                            k,
                            format!("{n}.{}", if rest.is_empty() { "key" } else { &rest }),
                        ));
                    }
                }
                k -= 1;
            }
        }
        out.sort_by(|a, b| b.0.cmp(&a.0));
        let mut r: Vec<String> = Vec::new();
        for (_, s) in out {
            if !r.contains(&s) {
                r.push(s);
            }
        }
        r
    }
    fn log_sides(&self, a: &str, b: &str) -> Option<(String, String)> {
        let bs = if crate::jre!(r"^[A-Z][A-Z0-9_]*$").is_match(b) {
            vec![format!("(constant {b})")]
        } else {
            self.path_refs(b)
        };
        for x in self.path_refs(a) {
            for y in &bs {
                if x.split('.').next() != y.split('.').next() {
                    return Some((x, y.clone()));
                }
            }
        }
        None
    }

    /// the report's resolverFor: native, the account resolver of a function of the instruction with its pointer
    /// parameters bound up the call path (its own memo)
    fn resolver_for(&self, fn_: i64, d: u32) -> Option<Rc<Resolver<'a>>> {
        let an = self.an;
        if let Some(x) = self.res_memo.borrow().get(&fn_) {
            return x.clone();
        }
        let fo = an.fo(fn_);
        if an.anchor || fo.is_none() {
            return None;
        }
        let fo = fo.unwrap();
        let ctx = &self.info.ctx;
        let r0 = account_resolver(&an.fl, fo.f, &fo.names, true, None);
        self.res_memo.borrow_mut().insert(fn_, Some(r0));
        let par = if fn_ != ctx.handler && d < 6 {
            ctx.parents.get(&fn_).copied()
        } else {
            None
        };
        let pr = match par {
            Some(p) if p.pc.is_some() => self.resolver_for(p.fn_, d + 1),
            _ => None,
        };
        let pf = par.and_then(|p| an.fo(p.fn_));
        let mut pos: Pos = -1;
        let mut c = None;
        if let (Some(pf), Some(p)) = (pf, par) {
            if let Some(ppc) = p.pc {
                let ir = fir(pf.f);
                for (bi, b) in pf.f.blocks.iter().enumerate() {
                    for (i, st) in b.stmts.iter().enumerate() {
                        if stmt_pc(st) == ppc {
                            if let Some(x) = call_of(ir, st) {
                                pos = pos_of(bi, i);
                                c = Some(x);
                            }
                        }
                    }
                }
            }
        }
        let seed = seed_from(&an.fl, pr.as_ref(), pf.map(|x| x.f), c, pos, fo.f, fn_);
        if !seed.is_empty() {
            let r = account_resolver(&an.fl, fo.f, &fo.names, true, Some(&seed));
            self.res_memo.borrow_mut().insert(fn_, Some(r));
        }
        self.res_memo.borrow().get(&fn_).cloned().flatten()
    }

    /// the accounts whose keys a call passes (arguments 1.., native), by name
    fn builder_accounts(&self, fn_: i64, pc: i64) -> Option<Vec<Option<String>>> {
        let an = self.an;
        let fo = an.fo(fn_)?;
        let ir = fir(fo.f);
        let mut hit = None;
        'o: for (bi, b) in fo.f.blocks.iter().enumerate() {
            for (i, s) in b.stmts.iter().enumerate() {
                if stmt_pc(s) == pc && call_of(ir, s).is_some() {
                    hit = Some((pos_of(bi, i), s));
                    break 'o;
                }
            }
        }
        let (p, s) = hit?;
        let r = account_resolver(&an.fl, fo.f, &fo.names, true, None);
        let (_, args) = call_of(ir, s).unwrap();
        Some(
            ir.items(args)
                .skip(1)
                .take(7)
                .map(|a| {
                    let x = r.value_ref(&an.fl, a, Some(p));
                    match x {
                        Some(x) if x.field.as_deref() == Some("key") => {
                            Some(self.idx_name(x.index))
                        }
                        _ => None,
                    }
                })
                .collect(),
        )
    }

    /// the nearest instruction built before a line of a function: its own hints and calls to builders
    fn hint_before(
        &self,
        facts: &IndexMap<i64, FnFacts>,
        ff: &FnFacts,
        line: i64,
        depth: u32,
    ) -> Option<IxHint> {
        let mut best: Option<IxHint> = None;
        let take = |best: &mut Option<IxHint>, x: IxHint| {
            if x.line < line && best.as_ref().is_none_or(|b| x.line > b.line) {
                *best = Some(x);
            }
        };
        for h in &ff.ix_hints {
            take(&mut best, h.clone());
        }
        for c in &ff.calls {
            let hs = facts.get(&c.callee).map_or(&[][..], |f| &f.ix_hints[..]);
            if !hs.is_empty() && hs.iter().all(|x| x.ix == hs[0].ix) && self.keep(ff.pc, c.pc) {
                let mut h = hs[0].clone();
                h.line = c.line;
                h.how = format!("{} ({})", facts[&c.callee].name, hs[0].how);
                h.call = c.pc.map(|pc| (ff.pc, pc));
                take(&mut best, h);
            }
        }
        if best.is_some() {
            return best;
        }
        let par = if depth > 0 {
            self.info.ctx.parents.get(&ff.pc).copied()
        } else {
            None
        };
        let par = par?;
        let pf = facts.get(&par.fn_)?;
        let pl = pf
            .calls
            .iter()
            .find(|x| {
                x.callee == ff.pc
                    && (if par.pc.is_some() {
                        x.pc == par.pc
                    } else {
                        x.ret == par.ret
                    })
            })
            .map(|x| x.line)?;
        self.hint_before(facts, pf, pl, depth - 1)
    }

    fn keep(&self, fn_: i64, pc: Option<i64>) -> bool {
        match (&self.info.grp, pc) {
            (None, _) | (_, None) => true,
            (Some(g), Some(pc)) => g.keep(self.an, fn_, pc),
        }
    }
    fn keep_ret(&self, fn_: i64, ret: E) -> bool {
        let Some(g) = &self.info.grp else { return true };
        let b = match self.an.fo(fn_) {
            Some(_) => self.an.cfg(fn_).ret_block.get(&ret).copied(),
            None => None,
        };
        b.is_none_or(|b| g.allowed(fn_, b))
    }
    fn is_disp(&self, facts: &IndexMap<i64, FnFacts>, fn_: i64) -> bool {
        self.info.grp.as_ref().is_some_and(|g| {
            g.dispatchers
                .iter()
                .any(|d| Some(d) == facts.get(&fn_).map(|f| &f.name))
        })
    }

    /// Anchor try_accounts: the accounts a check's key comparison reads (flow.ts compareAccounts)
    fn anchor_compares(&self, ff: &FnFacts) -> Option<AnchorCmp<'a>> {
        let an = self.an;
        let fo = an.fo(ff.pc)?;
        if !ff
            .checks
            .iter()
            .any(|c| c.named.is_some() && c.before.is_some())
        {
            return None;
        }
        let d = an.fl.defs_of(fo.f, true);
        let g = an.cfg(ff.pc);
        let blocks = &fo.f.blocks;
        let ir = fir(fo.f);
        let mut calls: HashMap<Pos, String> = HashMap::new();
        for c in &ff.checks {
            let (Some(named), Some(before), Some(_)) = (&c.named, c.before, c.c) else {
                continue;
            };
            if c.kinds.contains(&"pda") {
                continue;
            }
            let mut b = decision_block(&g, c.c, c.pc, c.pass_pc);
            let mut k = 0;
            while let Some(bb) = b {
                if k >= 6 {
                    break;
                }
                let ss = &blocks[bb].stmts;
                let hit = ss.iter().rposition(
                    |s| matches!(call_of(ir, s), Some((CallTarget::Fn { pc }, _)) if pc == before),
                );
                if let Some(i) = hit {
                    calls.insert(pos_of(bb, i), named.clone());
                    break;
                }
                b = if blocks[bb].preds.len() == 1 {
                    Some(blocks[bb].preds[0])
                } else {
                    None
                };
                k += 1;
            }
        }
        if calls.is_empty() {
            return None;
        }
        let mut ipos: HashMap<Pos, String> = HashMap::new();
        let mut ivars: HashMap<u32, String> = HashMap::new();
        for c in &ff.checks {
            let (Some(named), Some(_), Some(pp)) = (&c.named, c.c, c.pass_pc) else {
                continue;
            };
            if !c.kinds.contains(&"count") {
                continue;
            }
            let Some(&pb) = g.pc_block.get(&pp) else {
                continue;
            };
            let ss = &blocks[pb].stmts;
            let i = ss.iter().position(|st| match st {
                Stmt::Set { e, .. } => match ir.get(*e) {
                    Node::Load { size: 8, addr } => matches!(ir.get(addr), Node::Var(_)),
                    _ => false,
                },
                _ => false,
            });
            if let Some(i) = i {
                ipos.insert(pos_of(pb, i), named.clone());
                if let Stmt::Set { dst, .. } = &ss[i] {
                    ivars.insert(*dst as u32, named.clone());
                }
            }
        }
        Some(AnchorCmp {
            g,
            d,
            calls,
            names: fo.names.clone(),
            accts: self.accounts.iter().map(|x| x.name.clone()).collect(),
            ipos,
            ivars,
        })
    }

    fn ac_call(&self, ac: &AnchorCmp<'a>, c: &super::facts::Check) -> Option<Vec<(String, bool)>> {
        let b = decision_block(&ac.g, c.c, c.pc, c.pass_pc)?;
        let acct_var = |id: u32| -> Option<String> {
            let n = ac.names.get(id as usize).cloned().flatten()?;
            if ac.accts.contains(&n) {
                Some(n)
            } else {
                None
            }
        };
        compare_accounts(
            &self.an.fl,
            &ac.d,
            c.c.unwrap(),
            pos_of(b, ac.g.f.blocks[b].stmts.len()),
            &ac.calls,
            Some(&acct_var),
            Some((&ac.ipos, &ac.ivars)),
        )
    }
}

impl<'a> An<'a> {
    /// analyze(r) up to phase 2's rule findings (the incident rules, fund movers and the findings' ranking are 8c);
    /// `f` reads the result with the instruction contexts.
    pub fn analyze<R>(&self, f: impl FnOnce(&Analysis, &[IxInfo<'a>]) -> R) -> R {
        self.add_exit_writes();
        let ind = self.indirect_targets();
        let splits = self.splits();
        let infos = self.ix_contexts(&ind, &splits);
        let mut reg = CpiReg::default();
        let mut a = self.analyze0(&infos, &splits, &mut reg);
        let srcs: Vec<OnceCell<super::sources::SourceCtx<'a, '_>>> =
            infos.iter().map(|_| OnceCell::new()).collect();
        self.phase2(&mut a, &infos, &srcs);
        f(&a, &infos)
    }

    fn analyze0(
        &self,
        infos: &[IxInfo<'a>],
        splits: &IndexMap<i64, DispatchGroups>,
        reg: &mut CpiReg,
    ) -> Analysis {
        let proc_names: HashSet<&str> = self.processors.iter().map(|x| x.0.as_str()).collect();
        let mut ixs: Vec<IxOut> = Vec::new();
        for (ii, info) in infos.iter().enumerate() {
            if let Some(x) = self.ix_rows(ii, info, splits, &proc_names, reg) {
                ixs.push(x);
            }
        }
        ixs.sort_by(|x, y| {
            y.score
                .cmp(&x.score)
                .then_with(|| super::locale_cmp(&x.name, &y.name))
        });
        let facts = self.facts.borrow();
        // operations in code no handler reaches through direct calls
        let reached: HashSet<&str> = ixs
            .iter()
            .flat_map(|x| x.functions.iter().map(|s| s.as_str()))
            .collect();
        let mut unattributed: Vec<OpOut> = Vec::new();
        if ixs.iter().any(|x| x.kind != "entrypoint") {
            for ff in facts.values() {
                if reached.contains(ff.name.as_str()) {
                    continue;
                }
                for (oi, o) in ff.ops.iter().enumerate() {
                    if o.err_path || o.kinds.iter().all(|k| *k == "PDA_DERIVE") {
                        continue;
                    }
                    unattributed.push(OpOut {
                        at: Loc {
                            fn_: ff.name.clone(),
                            line: o.line,
                            pc: o.pc,
                        },
                        kinds: o.kinds.clone(),
                        text: o.text.clone(),
                        main: false,
                        target: o.target.as_ref().map(|t| {
                            format!(
                                "{}{}",
                                t.acct,
                                t.field.as_ref().map_or(String::new(), |f| format!(".{f}"))
                            )
                        }),
                        how: o.how,
                        value: o.value.clone(),
                        cpi: reg.get(ff.pc, oi, &o.cpi),
                        pda: o.pda.clone(),
                        fn_pc: None,
                        ret: None,
                        anchor_close: false,
                        guards: None,
                        bypass: None,
                        sources: None,
                    });
                }
            }
        }
        // program-level views: PDAs, state writes, read / write dependencies
        let mut pdas: IndexMap<String, PdaOut> = IndexMap::new();
        let pda_outs = |o: &OpOut| -> Vec<f64> {
            let Some(fo) = o.fn_pc.and_then(|f| self.fo(f)) else {
                return vec![];
            };
            let Some(pc) = o.at.pc else { return vec![] };
            let ir = fir(fo.f);
            let st =
                fo.f.blocks
                    .iter()
                    .flat_map(|b| b.stmts.iter())
                    .find(|s| stmt_pc(s) == pc);
            let Some((_, args)) = st.and_then(|s| call_of(ir, s)) else {
                return vec![];
            };
            let d = self.fl.defs_of(fo.f, true);
            ir.items(args).filter_map(|a| d.fp_off(a)).collect()
        };
        fn add(l: &mut Vec<String>, v: &str) {
            if !l.iter().any(|x| x == v) {
                l.push(v.to_string());
            }
        }
        let mut writes: IndexMap<String, Vec<WriteOut>> = IndexMap::new();
        let mut reads: IndexMap<String, IndexSet<String>> = IndexMap::new();
        for ix in &ixs {
            let pda_accts: Vec<&AcctOut> = ix
                .accounts
                .iter()
                .filter(|x| {
                    x.constraints
                        .get("pda")
                        .is_some_and(|e| e.status == "found" || e.status == "partial")
                })
                .collect();
            let pda_checks: Vec<&CheckOut> = ix
                .checks
                .iter()
                .filter(|c| {
                    c.kinds.contains(&"pda")
                        && !ix
                            .accounts
                            .iter()
                            .any(|a| Some(&a.name) == c.account.as_ref())
                })
                .collect();
            for o in &ix.ops {
                if let Some(pd) = &o.pda {
                    let k = format!("{}|{}", pd.seeds, pd.program);
                    let x = pdas.entry(k).or_insert_with(|| PdaOut {
                        seeds: pd.seeds.clone(),
                        program: pd.program.clone(),
                        derived_in: vec![],
                        signs_in: vec![],
                        accounts: vec![],
                        compared: "not_found",
                    });
                    add(&mut x.derived_in, &ix.name);
                    let outs = pda_outs(o);
                    let mine = |c: &CheckOut| {
                        Some(c.fn_pc) != o.fn_pc
                            || c.pda_bufs.as_ref().is_none_or(|b| b.is_empty())
                            || outs.is_empty()
                            || c.pda_bufs
                                .as_ref()
                                .unwrap()
                                .iter()
                                .any(|b| outs.contains(b))
                    };
                    for a in &pda_accts {
                        let cs: Vec<&CheckOut> = ix
                            .checks
                            .iter()
                            .filter(|c| {
                                c.account.as_ref() == Some(&a.name) && c.kinds.contains(&"pda")
                            })
                            .collect();
                        if !cs.is_empty() && !cs.iter().any(|c| mine(c)) {
                            continue;
                        }
                        add(&mut x.accounts, &format!("{}.{}", ix.name, a.name));
                        let s = a.constraints["pda"].status;
                        if rank(s) > rank(x.compared) {
                            x.compared = s;
                        }
                    }
                    for c in &pda_checks {
                        let calls_it = Some(c.fn_pc) == o.fn_pc
                            || facts
                                .get(&c.fn_pc)
                                .is_some_and(|f| f.calls.iter().any(|y| Some(y.callee) == o.fn_pc));
                        if calls_it && mine(c) && rank(c.status) > rank(x.compared) {
                            x.compared = c.status;
                        }
                    }
                }
                if let Some(seeds) = o
                    .cpi(|c| c.seeds.clone())
                    .flatten()
                    .filter(|s| !s.is_empty())
                {
                    let k = format!("{seeds}|(caller: this program)");
                    let x = pdas.entry(k).or_insert_with(|| PdaOut {
                        seeds: seeds.clone(),
                        program: "(caller: this program)".into(),
                        derived_in: vec![],
                        signs_in: vec![],
                        accounts: vec![],
                        compared: "not_found",
                    });
                    add(&mut x.signs_in, &ix.name);
                }
                if let Some(t) = &o.target {
                    if o.has("ACCOUNT_DATA_WRITE") || o.has("LAMPORT_WRITE") {
                        let l = writes.entry(t.clone()).or_default();
                        if !l
                            .iter()
                            .any(|w| w.ix == ix.name && Some(w.how.as_str()) == o.how)
                        {
                            l.push(WriteOut {
                                ix: ix.name.clone(),
                                how: o.how.unwrap_or("=").to_string(),
                                at: o.at.clone(),
                            });
                        }
                    }
                }
            }
            for c in &ix.checks {
                for m in crate::jre!(r"\b([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+)").captures_iter(&c.cond)
                {
                    let Some(rf) = ref_of(&m[1], &IndexMap::new()) else {
                        continue;
                    };
                    let Some(field) = rf.field.as_ref().filter(|f| !f.is_empty()) else {
                        continue;
                    };
                    if crate::jre!(
                        r"^(key|owner|is_signer|is_writable|executable|lamports|data_len)$"
                    )
                    .is_match(field)
                    {
                        continue;
                    }
                    let t = format!("{}.{}", crate::jre!(r"_\d+$").replace(&rf.acct, ""), field);
                    reads.entry(t).or_default().insert(ix.name.clone());
                }
            }
        }
        let mut deps: Vec<(String, Vec<String>, Vec<String>)> = Vec::new();
        for (t, rs) in &reads {
            if let Some(w) = writes.get(t) {
                let mut rb: Vec<String> = rs.iter().cloned().collect();
                rb.sort_by(|a, b| js_str_cmp(a, b));
                let mut wb: Vec<String> = Vec::new();
                for x in w {
                    if !wb.contains(&x.ix) {
                        wb.push(x.ix.clone());
                    }
                }
                wb.sort_by(|a, b| js_str_cmp(a, b));
                deps.push((t.clone(), rb, wb));
            }
        }
        deps.sort_by(|x, y| super::locale_cmp(&x.0, &y.0));
        let mut state_writes: Vec<(String, Vec<WriteOut>)> = writes.into_iter().collect();
        state_writes.sort_by(|x, y| super::locale_cmp(&x.0, &y.0));
        drop(facts);
        Analysis {
            program: ProgramOut {
                version: self.p.version,
                instructions: self.p.insns.len(),
                functions: self.p.funcs.len(),
                anchor: self.anchor,
                idl: self.instructions.iter().any(|i| i.accounts.is_some()),
            },
            ixs,
            pdas: pdas.into_values().collect(),
            state_writes,
            deps,
            unattributed,
            findings: vec![],
            rule_findings: vec![],
            fund_movers: None,
            authority_fields: None,
            states: None,
            consistency: None,
        }
    }

    /// one instruction's rows (None: a dispatch part doing nothing the analysis sees)
    fn ix_rows(
        &self,
        ii: usize,
        info: &IxInfo<'a>,
        splits: &IndexMap<i64, DispatchGroups>,
        proc_names: &HashSet<&str>,
        reg: &mut CpiReg,
    ) -> Option<IxOut> {
        let facts_ref = self.facts.borrow();
        let facts: &IndexMap<i64, FnFacts> = &facts_ref;
        let hpc = info.handler;
        let grp = info.grp.as_ref();
        let ixrow = if grp.is_some() {
            None
        } else {
            self.instructions.iter().find(|i| i.pc == hpc)
        };
        let accounts: Vec<AcctOut> = info
            .accounts
            .iter()
            .map(|x| AcctOut {
                index: x.index,
                name: x.name.clone(),
                source: x.source,
                expected: x.expected.clone(),
                constraints: IndexMap::new(),
            })
            .collect();
        let known: HashSet<String> = accounts.iter().map(|x| x.name.clone()).collect();
        let mut by_snake: HashMap<String, Option<String>> = HashMap::new();
        for x in &accounts {
            if x.source == "idl" {
                let k = snake(&x.name);
                let v = if by_snake.contains_key(&k)
                    && by_snake[&k].as_deref() != Some(x.name.as_str())
                {
                    None
                } else {
                    Some(x.name.clone())
                };
                by_snake.insert(k, v);
            }
        }
        let idl_paths: Vec<(Vec<String>, Option<String>)> =
            if accounts.first().is_some_and(|a| a.source == "idl") {
                ixrow.and_then(|i| i.accounts.as_ref()).map_or(vec![], |l| {
                    l.iter()
                        .enumerate()
                        .map(|(i, s)| {
                            (
                                s.split(' ')
                                    .next()
                                    .unwrap_or("")
                                    .split('.')
                                    .map(snake)
                                    .collect(),
                                accounts.get(i).map(|a| a.name.clone()),
                            )
                        })
                        .collect()
                })
            } else {
                vec![]
            };
        let mut b = IxB {
            an: self,
            info,
            accounts,
            known,
            by_snake,
            checks: vec![],
            pend: vec![],
            ops: vec![],
            res_memo: RefCell::new(HashMap::new()),
            idl_paths,
        };
        let fns: Vec<&FnFacts> = info.fns.iter().filter_map(|pc| facts.get(pc)).collect();
        for ff in &fns {
            let fm = info.main[&ff.pc];
            let r_cell: OnceCell<Option<Rc<Resolver<'a>>>> = OnceCell::new();
            let rr = |b: &IxB<'a, '_>| r_cell.get_or_init(|| b.resolver_for(ff.pc, 0)).clone();
            let cn = |b: &IxB<'a, '_>, a: Option<&str>| -> Option<String> {
                let x = match a {
                    Some(s) if !s.is_empty() => rr(b).and_then(|r| r.by_name.get(s).cloned()),
                    _ => None,
                };
                match x {
                    Some(x) => Some(b.idx_name(x.index)),
                    None => b.canon(a),
                }
            };
            let ac = if self.anchor {
                b.anchor_compares(ff)
            } else {
                None
            };
            let is_sysvar = |e: &str| e.contains("AccountSysvarMismatch");
            for c0 in &ff.checks {
                let sv = if self.anchor && is_sysvar(&c0.error) {
                    let mut ks: Vec<&super::facts::Check> = ff
                        .checks
                        .iter()
                        .filter(|k| k.line < c0.line && k.named.is_some() && !is_sysvar(&k.error))
                        .collect();
                    ks.sort_by(|x, y| y.line.cmp(&x.line));
                    ks.first().and_then(|k| k.named.clone())
                } else {
                    None
                };
                let c_own;
                let c = match &sv {
                    Some(s) => {
                        let mut x = c0.clone();
                        x.named = Some(s.clone());
                        c_own = x;
                        &c_own
                    }
                    None => c0,
                };
                let cb = if (grp.is_some() || rr(&b).is_some())
                    && c.c.is_some()
                    && self.fo(ff.pc).is_some()
                {
                    decision_block(&self.cfg(ff.pc), c.c, c.pc, c.pass_pc)
                } else {
                    None
                };
                if let Some(g) = grp {
                    let skip = match cb {
                        Some(cb) => !g.allowed(ff.pc, cb),
                        None => !b.keep(ff.pc, c.pc),
                    };
                    if skip {
                        continue;
                    }
                }
                let status = if fm && c.main { "found" } else { "partial" };
                let ir_refs: Vec<AcctRef> = match (rr(&b), c.c) {
                    (Some(r), Some(e)) => r.refs(&self.fl, e, cb),
                    _ => vec![],
                };
                let acct = cn(&b, c.named.as_deref())
                    .or_else(|| {
                        let f = c.refs.iter().find(|x| cn(&b, Some(&x.acct)).is_some());
                        cn(&b, f.map(|x| x.acct.as_str()))
                    })
                    .or_else(|| ir_refs.first().map(|x| b.idx_name(x.index)))
                    .or_else(|| c.refs.first().map(|x| format!("{}?", x.acct)));
                let mut kinds: Vec<&'static str> = c.kinds.clone();
                if let Some((_, vk)) = &c.via {
                    for k in vk {
                        if *k != "count" && !c.kinds.contains(k) {
                            kinds.push(k);
                        }
                    }
                }
                let mapped: Vec<Option<&'static str>> =
                    ir_refs.iter().map(|x| fk(x.field.as_deref())).collect();
                for (i, k) in mapped.iter().enumerate() {
                    if let Some(k) = k {
                        if !c.kinds.contains(k)
                            && mapped.iter().position(|y| y == &Some(*k)) == Some(i)
                        {
                            kinds.push(k);
                        }
                    }
                }
                let sd: Option<(Side, Side)> = match (rr(&b), c.c) {
                    (Some(r), Some(e)) => r.sides(&self.fl, e, cb),
                    _ => None,
                };
                if kinds.is_empty() && c.cmp32 {
                    let has_pda = sd
                        .as_ref()
                        .is_some_and(|(x, y)| *x == Side::Pda || *y == Side::Pda);
                    if !has_pda
                        || sd
                            .as_ref()
                            .is_some_and(|(x, y)| *x == Side::Pda && *y == Side::Pda)
                    {
                        continue;
                    }
                    let (x, y) = sd.as_ref().unwrap();
                    let keyed =
                        |s: &Side| side_obj(s).is_some_and(|r| r.field.as_deref() == Some("key"));
                    if !keyed(x) && !keyed(y) {
                        kinds.push("pda");
                    }
                }
                // keyed side and the other one
                let (keyed, other): (Option<AcctRef>, Option<Side>) = match &sd {
                    Some((x, y)) => {
                        let kx = side_obj(x).filter(|r| r.field.as_deref() == Some("key"));
                        let ky = side_obj(y).filter(|r| r.field.as_deref() == Some("key"));
                        if let Some(k) = kx {
                            (Some(k.clone()), Some(y.clone()))
                        } else if let Some(k) = ky {
                            (Some(k.clone()), Some(x.clone()))
                        } else {
                            (None, None)
                        }
                    }
                    None => (None, None),
                };
                let sk: Option<&'static str> = match other {
                    Some(Side::Const) => Some("address"),
                    Some(Side::Pda) => Some("pda"),
                    _ => None,
                };
                if let Some(sk) = sk {
                    if !kinds.contains(&sk) {
                        kinds.push(sk);
                    }
                }
                let mut sides: Option<(String, String)> = match &sd {
                    Some((Side::Acct(x), Side::Acct(y))) if x.index != y.index => Some((
                        format!(
                            "{}.{}",
                            b.idx_name(x.index),
                            x.field.as_deref().unwrap_or("undefined")
                        ),
                        format!(
                            "{}.{}",
                            b.idx_name(y.index),
                            y.field.as_deref().unwrap_or("undefined")
                        ),
                    )),
                    _ => None,
                };
                let ac_hit = match (&ac, c.c) {
                    (Some(ac), Some(_))
                        if kinds.iter().any(|k| {
                            [
                                "has_one",
                                "token_mint",
                                "token_owner",
                                "key",
                                "raw",
                                "custom",
                            ]
                            .contains(k)
                        }) || kinds.is_empty() =>
                    {
                        b.ac_call(ac, c)
                    }
                    _ => None,
                };
                let mut account = if sk.is_some() {
                    Some(b.idx_name(keyed.as_ref().unwrap().index))
                } else {
                    acct
                };
                let has_any = |kinds: &Vec<&str>, l: &[&str]| kinds.iter().any(|k| l.contains(k));
                if let Some(acl) = &ac_hit {
                    let dat = acl.iter().find(|x| x.1);
                    let key = acl.iter().find(|x| !x.1);
                    let d = b.canon(dat.map(|x| x.0.as_str()));
                    let k = b.canon(key.map(|x| x.0.as_str()));
                    if let (Some(d), Some(k)) = (&d, &k) {
                        if d != k
                            && c.pubkeys
                            && !has_any(
                                &kinds,
                                &["has_one", "address", "pda", "token_mint", "token_owner"],
                            )
                        {
                            kinds.push("has_one");
                        }
                    }
                    let unset = |a: &Option<String>| {
                        a.as_ref().is_none_or(|s| s.is_empty() || s.ends_with('?'))
                    };
                    if d.is_some() && k.is_some() && d != k {
                        let (d, k) = (d.unwrap(), k.unwrap());
                        let f = if kinds.contains(&"has_one") {
                            k.clone()
                        } else if kinds.contains(&"token_mint") {
                            "mint".into()
                        } else if kinds.contains(&"token_owner") {
                            "owner".into()
                        } else {
                            "data".into()
                        };
                        sides = Some((format!("{d}.{f}"), format!("{k}.key")));
                        if unset(&account) {
                            account = Some(d);
                        }
                    } else if k.is_some()
                        && d.is_none()
                        && c.pubkeys
                        && account.as_ref().is_some_and(|a| !a.is_empty())
                        && b.canon(account.as_deref()) == account
                        && account != k
                        && !has_any(&kinds, &["address", "pda", "token_mint", "token_owner"])
                    {
                        let (a, k) = (account.clone().unwrap(), k.unwrap());
                        sides = Some((format!("{a}.{k}"), format!("{k}.key")));
                        if !kinds.contains(&"has_one") {
                            kinds.push("has_one");
                        }
                    } else if key.is_none() && acl.len() == 2 && kinds.contains(&"token_mint") {
                        let t = b.canon(Some(&acl[0].0));
                        let o = b.canon(Some(&acl[1].0));
                        if let (Some(t), Some(o)) = (t, o) {
                            if t != o {
                                sides = Some((format!("{t}.mint"), format!("{o}.data")));
                                if unset(&account) {
                                    account = Some(t);
                                }
                            }
                        }
                    }
                }
                let ls = match (&c.log_rel, &sides) {
                    (Some((la, lb)), None) => b.log_sides(la, lb),
                    _ => None,
                };
                let l_addr = ls.as_ref().and_then(|(x, y)| {
                    if y.starts_with("(constant") && x.ends_with(".key") {
                        Some(x[..x.len() - 4].to_string())
                    } else {
                        None
                    }
                });
                if let Some(la) = &l_addr {
                    account = Some(la.clone());
                    if !kinds.contains(&"address") {
                        kinds.push("address");
                    }
                } else if let Some((x, y)) = &ls {
                    sides = Some((x.clone(), y.clone()));
                    if account
                        .as_ref()
                        .is_none_or(|s| s.is_empty() || s.ends_with('?'))
                    {
                        let z = [x, y]
                            .into_iter()
                            .find(|z| !z.ends_with(".key"))
                            .unwrap_or(x);
                        account = Some(z.split('.').next().unwrap_or("").to_string());
                    }
                }
                let at = Loc {
                    fn_: ff.name.clone(),
                    line: c.line,
                    pc: c.pc,
                };
                let key_cmp = ac_hit
                    .as_ref()
                    .is_some_and(|l| !l.is_empty() && l.iter().all(|x| !x.1))
                    && !has_any(&kinds, &["address", "pda"]);
                let pda_bufs = match (rr(&b), c.c) {
                    (Some(r), Some(e)) if kinds.contains(&"pda") => {
                        Some(r.pda_bufs(&self.fl, e, cb))
                    }
                    _ => None,
                };
                b.checks.push(CheckOut {
                    at,
                    status,
                    account,
                    kinds: kinds.clone(),
                    cond: c.cond.clone(),
                    fails_if: c.fails_if,
                    error: c.error.clone(),
                    via: c
                        .via
                        .as_ref()
                        .map(|(f, ks)| format!("{f} ({})", ks.join(", "))),
                    sides,
                    pda_bufs: pda_bufs.filter(|x| !x.is_empty()),
                    fn_pc: ff.pc,
                    c: c.c,
                    pass_pc: c.pass_pc,
                    main: c.main,
                    key_cmp,
                    cross: None,
                });
                let ci = b.checks.len() - 1;
                if let Some(sk) = sk {
                    let n = b.idx_name(keyed.as_ref().unwrap().index);
                    b.pend.push((n, sk, ci, None));
                }
                if let Some(la) = &l_addr {
                    b.pend.push((la.clone(), "address", ci, None));
                }
                if c.named.is_some() {
                    if let Some(nm) = cn(&b, c.named.as_deref()) {
                        for k in &kinds {
                            let via = match &c.via {
                                Some((f, _)) if !c.kinds.contains(k) => Some(f.clone()),
                                _ => None,
                            };
                            b.pend.push((nm.clone(), k, ci, via));
                        }
                    }
                }
                for x in &ir_refs {
                    let k = fk(x.field.as_deref()).or(
                        if x.field.as_deref() == Some("data[0..1]")
                            && kinds.contains(&"discriminator")
                        {
                            Some("discriminator")
                        } else {
                            None
                        },
                    );
                    if let Some(k) = k {
                        let n = b.idx_name(x.index);
                        b.pend.push((n, k, ci, None));
                    }
                }
                let named_c = cn(&b, c.named.as_deref());
                for x in &c.refs {
                    let Some(ca) = cn(&b, Some(&x.acct)) else {
                        continue;
                    };
                    if Some(&ca) == named_c.as_ref() {
                        continue;
                    }
                    let f0 = x
                        .field
                        .as_deref()
                        .map_or("", |f| f.split('.').next().unwrap_or(""));
                    let k = fk(Some(f0)).or(if x.field.as_deref().is_some_and(|f| !f.is_empty()) {
                        Some("state")
                    } else {
                        None
                    });
                    if let Some(k) = k {
                        b.pend.push((ca, k, ci, None));
                    }
                }
            }
            for (oi, o) in ff.ops.iter().enumerate() {
                let kept = if o.pc.is_none() && o.ret.is_some() {
                    b.keep_ret(ff.pc, o.ret.unwrap())
                } else {
                    b.keep(ff.pc, o.pc)
                };
                if (o.err_path && !b.is_disp(facts, ff.pc)) || !kept {
                    continue;
                }
                if o.handler.is_some_and(|h| h != hpc) {
                    continue;
                }
                if ff.wrapper
                    && o.cpi.is_none()
                    && fns.iter().any(|g| {
                        g.ops
                            .iter()
                            .any(|x| x.via.as_deref() == Some(ff.name.as_str()))
                    })
                {
                    continue;
                }
                let at = Loc {
                    fn_: ff.name.clone(),
                    line: o.line,
                    pc: o.pc,
                };
                let tgt = o.target.as_ref().map(|t| {
                    format!(
                        "{}{}",
                        cn(&b, Some(&t.acct)).unwrap_or_else(|| t.acct.clone()),
                        t.field.as_ref().map_or(String::new(), |f| format!(".{f}"))
                    )
                });
                let mut kinds = o.kinds.clone();
                let mut text = o.text.clone();
                let mut cpi = reg.get(ff.pc, oi, &o.cpi);
                let h = if o.kinds.contains(&"CPI")
                    && o.cpi.as_ref().is_none_or(|c| !st_truthy(&c.ix))
                {
                    b.hint_before(facts, ff, o.line, 2)
                } else {
                    None
                };
                if let Some(h) = h {
                    let mut nc = o.cpi.clone().unwrap_or_else(|| OpCpi {
                        program: h.program.clone(),
                        ..Default::default()
                    });
                    nc.family = Some(h.family.clone());
                    nc.ix = Some(h.ix.clone());
                    if o.cpi.as_ref().is_none_or(|c| c.program == "?") {
                        nc.program = h.program.clone();
                    }
                    let ba = match h.call {
                        Some((f, pc)) if !self.anchor => b.builder_accounts(f, pc),
                        _ => None,
                    };
                    if let Some(ba) = ba {
                        if nc.accounts.is_empty() {
                            let fams = crate::cpi::known_families();
                            let lay = fams
                                .iter()
                                .find(|f| f.0 == h.program)
                                .and_then(|f| f.2.iter().find(|x| x.1 == h.ix));
                            let n = lay.map_or(0, |l| l.2.len());
                            nc.accounts = ba
                                .iter()
                                .skip(1)
                                .take(n)
                                .enumerate()
                                .map(|(i, a)| PartAcc {
                                    role: Some(lay.unwrap().2[i].to_string()),
                                    text: a.clone().unwrap_or_else(|| "?".into()),
                                    w: None,
                                    s: None,
                                })
                                .collect();
                            if let Some(Some(p0)) = ba.first() {
                                if !p0.is_empty() {
                                    nc.program = p0.clone();
                                }
                            }
                        }
                    }
                    let mut ks: Vec<&'static str> = Vec::new();
                    for k in cpi_kinds(&h.family, &h.ix)
                        .into_iter()
                        .chain(o.kinds.iter().copied())
                    {
                        if !ks.contains(&k) {
                            ks.push(k);
                        }
                    }
                    kinds = ks;
                    text = format!(
                        "CPI {}.{} [heur: the instruction built before it: {}]{}",
                        nc.program,
                        h.ix,
                        h.how,
                        if o.cpi.is_some() {
                            format!(" — {}", o.text)
                        } else {
                            String::new()
                        }
                    );
                    cpi = Some(Rc::new(RefCell::new(nc)));
                }
                let anchor_close = self.anchor
                    && kinds.contains(&"ACCOUNT_CLOSE")
                    && cpi.is_none()
                    && ff.lines.iter().any(|l| {
                        crate::jre!(r"\bAccountInfo_(assign|realloc|resize)\w*\(").is_match(l)
                    });
                b.ops.push(OpOut {
                    at,
                    kinds,
                    text: format!(
                        "{text}{}",
                        o.via.as_ref().map_or(String::new(), |v| format!(
                            " [through {v}, decoded by a run of {}]",
                            ff.name
                        ))
                    ),
                    main: fm && o.main,
                    target: tgt,
                    how: o.how,
                    value: o.value.clone(),
                    cpi,
                    pda: o.pda.clone(),
                    fn_pc: Some(ff.pc),
                    ret: o.ret,
                    anchor_close,
                    guards: None,
                    bypass: None,
                    sources: None,
                });
            }
        }
        let ctx = info.ctx.clone();
        // (CPIs of Anchor helpers the library database does not name: libcpi.rs)
        let main_fn = |f: i64| info.main.get(&f).copied().unwrap_or(false);
        let lib_ops = self.lib_cpi_ops(&ctx, &fns, &|f, pc| b.keep(f, pc), &main_fn);
        b.ops.extend(lib_ops);
        if self.anchor {
            // (a condition comparing the data of two accounts)
            for ci in 0..b.checks.len() {
                let (Some(ce), None) = (b.checks[ci].c, &b.checks[ci].cross) else {
                    continue;
                };
                let fnpc = b.checks[ci].fn_pc;
                let Some(fo) = self.fo(fnpc) else { continue };
                let g = self.cfg(fnpc);
                let Some(bb) =
                    decision_block(&g, Some(ce), b.checks[ci].at.pc, b.checks[ci].pass_pc)
                else {
                    continue;
                };
                let Some(ev) = self.ev_for(&ctx, fnpc) else {
                    continue;
                };
                let p = pos_of(bb, fo.f.blocks[bb].stmts.len());
                let d = self.fl.defs_of(fo.f, true);
                let ir = fir(fo.f);
                let side = |e0: E| -> Option<String> {
                    let mut e = e0;
                    let mut k = 0;
                    while k < 4 {
                        match ir.get(e) {
                            Node::Var(id) if d.defs.contains_key(&id) => e = d.defs[&id],
                            _ => break,
                        }
                        k += 1;
                    }
                    while let Node::Ext { a, .. } = ir.get(e) {
                        e = a;
                    }
                    let Node::Load { addr, .. } = ir.get(e) else {
                        return None;
                    };
                    let v = ev.ev(addr, p, 0)?.ha()?;
                    if (v.k == HK::Obj || v.k == HK::Data) && !v.guess.unwrap_or(false) && !v.vo {
                        Some(v.acct)
                    } else {
                        None
                    }
                };
                let mut pair: Option<(String, String)> = None;
                let mut nodes: Vec<(E, Node)> = Vec::new();
                ir.walk(ce, &mut |x, n| nodes.push((x, n)));
                for (_, n) in nodes {
                    if pair.is_some() {
                        break;
                    }
                    if let Node::Cmp(_, x, y) = n {
                        let a = side(x);
                        let bb = side(y);
                        if let (Some(a), Some(bb)) = (a, bb) {
                            if a != bb {
                                pair = Some((a, bb));
                            }
                        }
                    }
                }
                if pair.is_some() {
                    b.checks[ci].cross = pair;
                }
            }
            // (a key compared with the elements of a Vec field of a boxed account: a membership check)
            for ci in 0..b.checks.len() {
                let c = &b.checks[ci];
                let Some(ce) = c.c else { continue };
                if c.sides.is_some() || !c.kinds.contains(&"key") || c.kinds.contains(&"member") {
                    continue;
                }
                let fnpc = c.fn_pc;
                let Some(fo) = self.fo(fnpc) else { continue };
                let g = self.cfg(fnpc);
                let Some(bb) = decision_block(&g, Some(ce), c.at.pc, c.pass_pc) else {
                    continue;
                };
                let ir = fir(fo.f);
                let mut x = ce;
                loop {
                    match ir.get(x) {
                        Node::Lnot(a) => x = a,
                        Node::Cmp(_, a, bq)
                            if matches!(ir.get(bq), Node::Const(_))
                                && !matches!(ir.get(a), Node::Const(_)) =>
                        {
                            x = a
                        }
                        _ => break,
                    }
                }
                while let Node::Ext { a, .. } = ir.get(x) {
                    x = a;
                }
                let d = self.fl.defs_of(fo.f, true);
                if let Node::Var(id) = ir.get(x) {
                    if let Some(&y) = d.defs.get(&id) {
                        if matches!(ir.get(y), Node::Call(..)) {
                            x = y;
                        }
                    }
                }
                let Node::Call(_, args) = ir.get(x) else {
                    continue;
                };
                if args.len < 3 || ir.get(ir.at(args, 2)) != Node::Const(0x20) {
                    continue;
                }
                let ev = self.ev_for(&ctx, fnpc);
                let p = pos_of(bb, fo.f.blocks[bb].stmts.len());
                let vs: Vec<Option<super::anchor::HA>> = match &ev {
                    Some(e) => vec![
                        e.ev(ir.at(args, 0), p, 0).and_then(|v| v.ha()),
                        e.ev(ir.at(args, 1), p, 0).and_then(|v| v.ha()),
                    ],
                    None => vec![],
                };
                let el = vs
                    .iter()
                    .flatten()
                    .find(|v| v.k == HK::Objp && v.vo)
                    .cloned();
                let key = vs
                    .iter()
                    .flatten()
                    .find(|v| v.k == HK::Keyp && v.off == 0.0 && !v.guess.unwrap_or(false))
                    .cloned();
                let (Some(el), Some(key)) = (el, key) else {
                    continue;
                };
                if el.acct == key.acct {
                    continue;
                }
                let fl = self
                    .obj_field(el.ty.as_deref(), el.fo.unwrap_or(-1.0))
                    .unwrap_or_else(|| {
                        format!(
                            "data@{}",
                            el.fo.map_or("undefined".to_string(), crate::util::js_num)
                        )
                    });
                let c = &mut b.checks[ci];
                c.kinds.push("member");
                c.sides = Some((format!("{}.{fl}[]", el.acct), format!("{}.key", key.acct)));
                if c.account
                    .as_ref()
                    .is_none_or(|s| s.is_empty() || s.ends_with('?'))
                {
                    c.account = Some(el.acct.clone());
                }
                b.pend.push((key.acct.clone(), "member", ci, None));
            }
            // (a CPI a function the handler calls makes: its accounts by where their keys come from)
            for oi in 0..b.ops.len() {
                let fo = b.ops[oi].fn_pc.and_then(|f| self.fo(f));
                let src = b.ops[oi].cpi(|c| c.src.clone()).flatten();
                let at_pc = b.ops[oi].at.pc;
                let roles = match (&src, fo, at_pc, &b.ops[oi].cpi) {
                    (None, Some(_), Some(_), Some(c)) => {
                        let c = c.borrow();
                        match (&c.family, &c.ix) {
                            (Some(f), Some(i))
                                if !f.is_empty()
                                    && !i.is_empty()
                                    && b.ops[oi].text.contains("[lib: ") =>
                            {
                                helper_roles(f, i)
                            }
                            _ => None,
                        }
                    }
                    _ => None,
                };
                if let Some(roles) = roles {
                    let prev = b.ops[oi].cpi.as_ref().unwrap().borrow().accounts.clone();
                    if prev.len() <= roles.len()
                        && (0..roles.len()).any(|i| {
                            !b.known
                                .contains(prev.get(i).map_or("", |x| x.text.as_str()))
                        })
                    {
                        let cx = self.ctx_accounts(&ctx, fo.unwrap().pc, at_pc.unwrap(), roles);
                        let acc = cx.as_ref().map(|x| &x.0);
                        if acc.is_some_and(|a| {
                            a.iter()
                                .any(|x| x.as_ref().is_some_and(|x| b.known.contains(x)))
                        }) {
                            let acc = acc.unwrap();
                            let accounts: Vec<PartAcc> = roles
                                .iter()
                                .enumerate()
                                .map(|(i, role)| {
                                    let mut base = prev.get(i).cloned().unwrap_or(PartAcc {
                                        role: None,
                                        text: String::new(),
                                        w: None,
                                        s: if crate::jre!(r"^(authority|from|current_authority)$")
                                            .is_match(role)
                                        {
                                            Some(1.0)
                                        } else {
                                            None
                                        },
                                    });
                                    base.role = Some(role.to_string());
                                    base.text =
                                        if b.known
                                            .contains(prev.get(i).map_or("", |x| x.text.as_str()))
                                        {
                                            prev[i].text.clone()
                                        } else if let Some(Some(a)) = acc.get(i).filter(|a| {
                                            a.as_ref().is_some_and(|a| b.known.contains(a))
                                        }) {
                                            a.clone()
                                        } else {
                                            prev.get(i).map_or("?".into(), |x| x.text.clone())
                                        };
                                    base
                                })
                                .collect();
                            let old = b.ops[oi].cpi.as_ref().unwrap().borrow().clone();
                            let seeds = old
                                .seeds
                                .clone()
                                .or_else(|| cx.as_ref().and_then(|x| x.1.clone()));
                            let mut nc = old;
                            nc.accounts = accounts.clone();
                            if let Some(s) = seeds.as_ref().filter(|s| !s.is_empty()) {
                                nc.seeds = Some(s.clone());
                            }
                            let o = &mut b.ops[oi];
                            o.cpi = Some(Rc::new(RefCell::new(nc)));
                            if let Some(s) = seeds.as_ref().filter(|s| !s.is_empty()) {
                                if !o.kinds.contains(&"PDA_SIGNATURE")
                                    && !crate::jre!(r"^p\d+\[").is_match(s)
                                {
                                    o.kinds.push("PDA_SIGNATURE");
                                }
                            }
                            let list = accounts
                                .iter()
                                .map(|x| {
                                    format!(
                                        "{}: {}",
                                        x.role.as_deref().unwrap_or("undefined"),
                                        x.text
                                    )
                                })
                                .collect::<Vec<_>>()
                                .join(", ");
                            o.text = crate::jre!(r"^(CPI \S+)(?: \{[^}]*\})?")
                                .replace(&o.text, |m: &regex::Captures| {
                                    format!("{} {{ {list} }}", &m[1])
                                })
                                .to_string();
                        }
                    }
                }
                let (Some(src), Some(fo), Some(at_pc)) = (src, fo, at_pc) else {
                    continue;
                };
                let cur = b.ops[oi].cpi.as_ref().unwrap().borrow().accounts.clone();
                let mut accs: Option<Vec<PartAcc>> = None;
                let ir = fir(fo.f);
                for (i, x) in cur.iter().enumerate() {
                    let t = x.text.strip_prefix('*').unwrap_or(&x.text);
                    let r = ref_of(t, &IndexMap::new()).map_or(t.to_string(), |r| r.acct);
                    if b.known.contains(&b.canon(Some(&r)).unwrap_or_default()) {
                        continue;
                    }
                    let nv = if crate::jre!(r"^[A-Za-z_]\w*$").is_match(t) {
                        fo.names.iter().position(|n| n.as_deref() == Some(t))
                    } else {
                        None
                    };
                    let e = src
                        .accounts
                        .get(i)
                        .copied()
                        .flatten()
                        .or_else(|| nv.map(|n| ir.var(n as u32)));
                    let Some(e) = e else { continue };
                    self.ev_init(&ctx);
                    let st = self.stmt_at(fo.pc, at_pc);
                    let v = st.and_then(|(sb, si)| {
                        self.ev_for(&ctx, fo.pc)
                            .and_then(|ev| ev.ev(e, pos_of(sb, si), 0))
                    });
                    if let Some(v) = v.and_then(|v| v.ha()) {
                        if (v.k == HK::Keyp || v.k == HK::Info)
                            && v.off == 0.0
                            && !v.guess.unwrap_or(false)
                            && b.known.contains(&v.acct)
                        {
                            accs.get_or_insert_with(|| cur.clone())[i].text = v.acct.clone();
                        }
                    }
                }
                if let Some(accs) = accs {
                    let mut nc = b.ops[oi].cpi.as_ref().unwrap().borrow().clone();
                    nc.accounts = accs;
                    b.ops[oi].cpi = Some(Rc::new(RefCell::new(nc)));
                }
            }
        }
        // (a write the text names by a temporary and the IR by the account it reaches: the named one)
        let mut i = b.ops.len();
        while i > 0 {
            i -= 1;
            let o = &b.ops[i];
            let Some(t) = &o.target else { continue };
            let t: Vec<&str> = t.split('.').collect();
            if b.known.contains(t[0]) || o.at.pc.is_none() {
                continue;
            }
            let rest = t[1..].join(".");
            let dup = b.ops.iter().enumerate().any(|(j, x)| {
                j != i
                    && x.at.pc == o.at.pc
                    && x.at.fn_ == o.at.fn_
                    && x.target.as_ref().is_some_and(|xt| {
                        let s: Vec<&str> = xt.split('.').collect();
                        b.known.contains(s[0]) && s[1..].join(".") == rest
                    })
            });
            if dup {
                b.ops.remove(i);
            }
        }
        self.dominance(&mut b.checks, &mut b.ops, &ctx);
        let pend = std::mem::take(&mut b.pend);
        for (acct, k, ci, via) in pend {
            let ev = Evidence {
                status: b.checks[ci].status,
                at: Some(b.checks[ci].at.clone()),
                via,
                note: None,
            };
            b.note(&acct, k, ev);
        }
        // runtime model
        for oi in 0..b.ops.len() {
            let o = b.ops[oi].clone();
            let acct = o
                .target
                .as_ref()
                .map(|t| t.split('.').next().unwrap_or("").to_string());
            if let Some(acct) = acct.filter(|a| !a.is_empty() && b.known.contains(a)) {
                if o.has("ACCOUNT_DATA_WRITE") || o.has("LAMPORT_WRITE") {
                    b.note(
                        &acct,
                        "writable",
                        Evidence {
                            status: "runtime",
                            at: Some(o.at.clone()),
                            via: None,
                            note: Some(
                                "written: the runtime rejects changes to a read-only account",
                            ),
                        },
                    );
                }
                if o.has("ACCOUNT_DATA_WRITE") || (o.has("LAMPORT_WRITE") && o.how == Some("-=")) {
                    b.note(&acct, "owner", Evidence {
                        status: "runtime",
                        at: Some(o.at.clone()),
                        via: None,
                        note: Some("data written / lamports debited: only the owner program may (the runtime rejects it otherwise)"),
                    });
                }
            }
            let (accs, seeds) = o
                .cpi(|c| (c.accounts.clone(), st_truthy(&c.seeds)))
                .unwrap_or((vec![], false));
            for x in &accs {
                let t = x.text.strip_prefix('*').unwrap_or(&x.text);
                let r = ref_of(t, &IndexMap::new()).map_or(t.to_string(), |r| r.acct);
                let Some(ca) = b.canon(Some(&r)) else {
                    continue;
                };
                if !b.known.contains(&ca) {
                    continue;
                }
                if truthy(x.s) && !seeds {
                    b.note(&ca, "signer", Evidence {
                        status: "runtime",
                        at: Some(o.at.clone()),
                        via: None,
                        note: Some("passed as a CPI signer: the callee rejects it unless it signed the transaction"),
                    });
                }
                if truthy(x.w) {
                    b.note(
                        &ca,
                        "writable",
                        Evidence {
                            status: "runtime",
                            at: Some(o.at.clone()),
                            via: None,
                            note: Some("passed writable to a CPI: privileges cannot be escalated"),
                        },
                    );
                }
            }
        }
        // what the IDL declares but no check was found for
        for x in b.accounts.iter_mut() {
            let e = &x.expected;
            let mut need: Vec<&'static str> = Vec::new();
            if e.signer {
                need.push("signer");
            }
            if e.writable {
                need.push("writable");
            }
            if e.pda {
                need.push("pda");
            }
            if e.address
                .as_ref()
                .is_some_and(|a| !a.is_empty() && Some(a) != self.program_id.as_ref())
            {
                need.push("address");
            }
            for k in need {
                x.constraints.entry(k).or_insert(Evidence {
                    status: "not_found",
                    at: None,
                    via: None,
                    note: None,
                });
            }
        }
        // effects and the sensitivity score
        let mut effects: Vec<String> = Vec::new();
        let mut score: i64 = 0;
        let mut seen: HashSet<String> = HashSet::new();
        let mut eff = |t: String, w: i64| {
            if seen.contains(&t) {
                return;
            }
            seen.insert(t.clone());
            effects.push(t);
            score += w;
        };
        for o in &b.ops {
            let k = &o.kinds;
            let w = k.iter().map(|x| weight(x)).max().unwrap_or(i64::MIN);
            let has = |x: &str| k.contains(&x);
            if has("CPI") {
                let c = o.cpi.as_ref().map(|c| c.borrow().clone());
                let prog = match &c {
                    Some(c) if c.program != "?" => {
                        if st_truthy(&c.known) {
                            c.program.clone()
                        } else {
                            format!(
                                "{} [account-supplied program id{}]",
                                c.program,
                                if st_truthy(&c.checked) {
                                    format!("; {}", c.checked.as_ref().unwrap())
                                } else {
                                    String::new()
                                }
                            )
                        }
                    }
                    _ => "?".into(),
                };
                let what = match c
                    .as_ref()
                    .and_then(|c| c.ix.clone())
                    .filter(|s| !s.is_empty())
                {
                    Some(ix) => format!("{prog}.{ix}"),
                    None if prog != "?" => prog.clone(),
                    None => "program not decoded".into(),
                };
                let tag = if has("TOKEN_TRANSFER") {
                    "TOKEN MOVE"
                } else if has("LAMPORT_TRANSFER") {
                    "LAMPORT MOVE"
                } else if has("MINT") {
                    "MINT"
                } else if has("BURN") {
                    "BURN"
                } else if has("ACCOUNT_CLOSE") {
                    "CLOSE"
                } else if has("AUTHORITY_WRITE") {
                    "SET authority"
                } else if has("ACCOUNT_CREATE") {
                    "CREATE"
                } else if has("OWNER_ASSIGN") {
                    "ASSIGN owner"
                } else if has("ACCOUNT_REALLOC") {
                    "ALLOCATE"
                } else if has("PROGRAM_UPGRADE") {
                    "UPGRADE"
                } else {
                    "CPI"
                };
                let extra = match &c {
                    Some(c) if !st_truthy(&c.known) && c.program != "?" => 3,
                    _ => 0,
                };
                eff(
                    format!(
                        "{tag}: CPI → {what}{}",
                        if has("PDA_SIGNATURE") {
                            " (PDA-signed)"
                        } else {
                            ""
                        }
                    ),
                    w + extra,
                );
            } else if has("PDA_DERIVE") {
                eff(
                    format!(
                        "DERIVE PDA {}",
                        o.pda.as_ref().map_or("?", |p| p.seeds.as_str())
                    ),
                    0,
                );
            } else if has("LAMPORT_WRITE") {
                let t = if has("ACCOUNT_CLOSE") {
                    "CLOSE (lamports = 0)"
                } else if o.how == Some("-=") {
                    "LAMPORT OUT"
                } else if o.how == Some("+=") {
                    "LAMPORT IN"
                } else {
                    "LAMPORT SET"
                };
                eff(
                    format!("{t} {}", o.target.as_deref().unwrap_or("undefined")),
                    w,
                );
            } else if has("AUTHORITY_WRITE") {
                eff(
                    format!(
                        "SET authority {}",
                        o.target.as_deref().unwrap_or("undefined")
                    ),
                    w,
                );
            } else if has("ACCOUNT_DATA_WRITE") {
                eff(
                    format!(
                        "WRITE {} ({})",
                        o.target.as_deref().unwrap_or("undefined"),
                        o.how.unwrap_or("undefined")
                    ),
                    w,
                );
            } else if has("ACCOUNT_REALLOC") {
                eff(
                    format!("REALLOC {}", o.target.as_deref().unwrap_or(&o.text)),
                    w,
                );
            }
        }
        for x in &b.accounts {
            for (k, ev) in &x.constraints {
                if ev.status == "not_found" && (*k == "signer" || *k == "pda" || *k == "address") {
                    score += 2;
                }
            }
        }
        let h_name = &info.h_name;
        let kind = if grp.is_some() {
            "native"
        } else if !h_name.starts_with("ix_") {
            if proc_names.contains(h_name.as_str()) {
                "processor"
            } else {
                "entrypoint"
            }
        } else if self.anchor {
            "anchor"
        } else {
            "native"
        };
        let via = if grp.is_some() {
            None
        } else {
            splits
                .iter()
                .find_map(|(pc, g)| g.via.get(&hpc).map(|v| (*pc, v.clone())))
        };
        let dispatch = if let Some((vpc, tags)) = via {
            Some(format!(
                "tag {} (instruction data) matched in {}, handled by {}",
                tags.iter()
                    .map(|t| t.to_string())
                    .collect::<Vec<_>>()
                    .join(", "),
                splits[&vpc].groups[0].dispatchers.join(", "),
                h_name
            ))
        } else {
            grp.map(|g| {
                format!(
                    "{} (instruction data) matched in {}; name {}",
                    if g.tags.is_empty() {
                        "paths leaving before the tag is matched".to_string()
                    } else {
                        format!(
                            "tag {}",
                            g.tags
                                .iter()
                                .map(|t| t.to_string())
                                .collect::<Vec<_>>()
                                .join(", ")
                        )
                    },
                    g.dispatchers.join(", "),
                    match g.source {
                        "str" => "[str: its \"Instruction: …\" log]",
                        "known" => "[heur: the layout of a well-known program with these tags]",
                        _ => "[the tag]",
                    }
                )
            })
        };
        if grp.is_some() && b.ops.is_empty() && b.checks.is_empty() {
            return None;
        }
        Some(IxOut {
            name: info.name.clone(),
            handler: h_name.clone(),
            kind,
            functions: fns.iter().map(|f| f.name.clone()).collect(),
            accounts: b.accounts,
            checks: b.checks,
            ops: b.ops,
            score,
            effects,
            indirect: info.indirect.clone(),
            dispatch,
            info: ii,
            trust: None,
            relations: None,
            stored_keys: None,
            authority: None,
            paths: None,
            chains: None,
            arith: None,
            divs: None,
            proof: None,
            audit: None,
        })
    }
}

/// JS default sort / `<` on strings: UTF-16 code units
pub fn js_str_cmp(a: &str, b: &str) -> std::cmp::Ordering {
    a.encode_utf16().cmp(b.encode_utf16())
}
