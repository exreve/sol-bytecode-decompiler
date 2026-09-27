//! Phase 3 (`src/analysis/phase3.ts`): path conditions of the operations, authority chains, arithmetic and
//! division sites, per-operation proof checklists, the state machine of status-like fields.

use super::report::Loc;

#[derive(Clone, Debug)]
pub struct PathCond {
    pub at: Loc,
    pub cond: String,
    pub holds: bool,
    pub how: &'static str,
    pub check: Option<usize>,
}

#[derive(Clone, Debug)]
pub struct PathInfo {
    pub op: usize,
    pub conds: Vec<PathCond>,
    pub not_required: Vec<(usize, Option<Vec<Loc>>)>,
    pub truncated: Option<bool>,
}

#[derive(Clone, Debug)]
pub struct ChainStep {
    pub kind: &'static str,
    pub what: String,
    pub status: Option<&'static str>,
}

#[derive(Clone, Debug)]
pub struct Chain {
    pub op: usize,
    pub steps: Vec<Vec<ChainStep>>,
}

#[derive(Clone, Debug)]
pub struct ArithSite {
    pub at: Loc,
    pub op: Option<usize>,
    pub target: String,
    pub expr: String,
    pub kind: &'static str,
    pub status: &'static str,
    pub guard: Option<(Loc, String)>,
    pub caller: Option<bool>,
    pub unnamed: Option<bool>,
}

#[derive(Clone, Debug)]
pub struct DivSite {
    pub at: Loc,
    pub expr: String,
    pub divisor: String,
    pub status: &'static str,
    pub guard: Option<(Loc, String)>,
}

#[derive(Clone, Debug)]
pub struct Prop {
    pub prop: String,
    pub status: &'static str,
    pub evidence: String,
}

#[derive(Clone, Debug)]
pub struct Proof {
    pub op: usize,
    pub kind: String,
    pub props: Vec<Prop>,
}

#[derive(Clone, Debug)]
pub struct StateField {
    pub field: String,
    pub set_by: Vec<(String, String, Loc)>,
    pub checked_by: Vec<(String, String, Loc)>,
}

use super::acct::account_resolver;
use super::flow::*;
use super::ixctx::{IxCtx, IxInfo};
use super::paths::{key_in, IrCond};
use super::report::{Analysis, IxOut, OpOut};
use super::sources::SourceCtx;
use super::{js_slice, js_trim, An};
use sbpf_ir::{BinOp, CallTarget, Node, Term, E};
use std::collections::{HashMap, HashSet};

const VALUE_OPS: &[&str] = &[
    "TOKEN_TRANSFER",
    "LAMPORT_TRANSFER",
    "MINT",
    "BURN",
    "ACCOUNT_CLOSE",
    "AUTHORITY_WRITE",
    "OWNER_ASSIGN",
    "PROGRAM_UPGRADE",
];

pub fn is_value_op(o: &OpOut) -> bool {
    o.kinds.iter().any(|k| VALUE_OPS.contains(k)) || (o.has("LAMPORT_WRITE") && o.how == Some("-="))
}

fn value_field(s: &str) -> bool {
    crate::jre!(r"(?i)amount|balance|lamports|supply|total|claimed|deposit|reserve|share|liquidity|fee|debt|collateral|stake|reward|fund|minted|burn|withdraw|borrow|owed|volume|principal|interest|vault|pot|prize|payout|bet|tokens?\b").is_match(s)
}
fn supply(s: &str) -> bool {
    crate::jre!(r"(?i)supply|shares|total|balance|reserve|liquidity|deposit|lamports|staked|tvl|pool_token|\.amount\b|_amount\b|virtual").is_match(s)
}
pub fn status_field(s: &str) -> bool {
    crate::jre!(r"(?i)(^|_)(status|state|phase|stage|initiali[sz]ed|active|paused|frozen|closed|locked|enabled|started|ended|finished|settled|resolved|mode)$|(^|\.)is_[a-z_]+$").is_match(s)
}
fn is_const(k: &str) -> bool {
    k.starts_with('#')
}

/// `/^\*?([A-Za-z_]\w*(?:\[\d+\])?)/` on a text
fn name_of(t: Option<&str>) -> Option<String> {
    crate::jre!(r"^\*?([A-Za-z_]\w*(?:\[\d+\])?)")
        .captures(t?)
        .map(|m| m[1].to_string())
}

fn best_of(ss: &[Option<&'static str>]) -> &'static str {
    ["found", "runtime", "partial"]
        .into_iter()
        .find(|s| ss.contains(&Some(*s)))
        .unwrap_or("not_found")
}

/// the per-instruction phase 3 context
struct P3<'a, 'x> {
    an: &'x An<'a>,
    ctx: &'x IxCtx<'a>,
    /// function name -> pc (facts; the last of a name)
    by_name: HashMap<String, i64>,
    /// checkAt: fn -> decision block -> check
    check_at: HashMap<i64, HashMap<usize, usize>>,
}

impl<'a, 'x> P3<'a, 'x> {
    fn line_at(&self, fname: &str, line: i64) -> Option<i64> {
        let pc = *self.by_name.get(fname)?;
        let facts = self.an.facts.borrow();
        let ff = facts.get(&pc)?;
        ff.pc_line
            .iter()
            .filter(|x| *x.1 == line)
            .map(|x| *x.0)
            .min()
    }
    fn loc(&self, fname: &str, line: i64) -> Loc {
        Loc {
            fn_: fname.to_string(),
            line,
            pc: self.line_at(fname, line),
        }
    }
    fn expr(&self, fn_: i64, e: E) -> Option<String> {
        if !self.an.facts.borrow().contains_key(&fn_) {
            return None;
        }
        (self.an.expr)(fn_, e)
    }
    fn text(&self, fn_: i64, e: E) -> String {
        js_slice(
            &self.expr(fn_, e).unwrap_or_else(|| "?".into()),
            0,
            Some(120),
        )
    }
    /// the printed line of a branching block's condition
    fn cond_line_of(&self, fn_: i64, c: &IrCond) -> i64 {
        let facts = self.an.facts.borrow();
        let ff = &facts[&fn_];
        if let Some(&l) = ff.cond_line.get(&c.c) {
            return l;
        }
        let g = self.an.cfg(fn_);
        let ir = fir(g.f);
        let k = cond_key(ir, c.c, 0);
        for (e, x) in &ff.cond_line {
            if cond_key(ir, *e, 0) == k {
                return *x;
            }
        }
        let bl = &g.f.blocks[c.b];
        let mut pcs: Vec<Option<i64>> = vec![bl.stmts.last().map(stmt_pc)];
        if let Term::Br { t, .. } = &bl.term {
            pcs.push(
                g.f.blocks
                    .get(*t as usize)
                    .and_then(|b| b.stmts.first())
                    .map(stmt_pc),
            );
        }
        for pc in pcs.into_iter().flatten() {
            if let Some(&x) = ff.pc_line.get(&pc) {
                return x;
            }
        }
        ff.at as i64 + 1
    }
    fn shown(&self, c: &IrCond) -> PathCond {
        let fname = self.an.facts.borrow()[&c.fn_].name.clone();
        let g = self.an.cfg(c.fn_);
        let check = self.check_at.get(&c.fn_).and_then(|m| m.get(&c.b)).copied();
        let how = if c.how == "branch" && check.is_some() {
            "exit-check"
        } else {
            c.how
        };
        PathCond {
            at: Loc {
                fn_: fname,
                line: self.cond_line_of(c.fn_, c),
                pc: Some(block_pc(&g, c.b)),
            },
            cond: self.expr(c.fn_, c.c).unwrap_or_else(|| "?".into()),
            holds: c.holds.unwrap_or(false),
            how,
            check,
        }
    }
    fn guard_of(&self, c: &IrCond) -> (Loc, String) {
        (self.shown(c).at, self.text(c.fn_, c.c))
    }
    /// the statement at a position (None past the block's statements)
    fn stmt_pc_at(&self, fn_: i64, p: Pos) -> Option<i64> {
        let f = self.an.fo(fn_)?.f;
        f.blocks
            .get((p >> 16) as usize)?
            .stmts
            .get((p & 0xffff) as usize)
            .map(stmt_pc)
    }

    /// where a value comes from, as printed
    fn provenance(&self, fn0: i64, e0: E, p0: Pos) -> Vec<String> {
        let an = self.an;
        let mut out: Vec<String> = Vec::new();
        let add = |out: &mut Vec<String>, f: i64, x: E| {
            if let Some(t) = self.expr(f, x) {
                let t = js_trim(&t).to_string();
                if !t.is_empty() && !out.contains(&t) {
                    out.push(t);
                }
            }
        };
        let (mut fn_, mut e, mut p) = (fn0, e0, p0);
        add(&mut out, fn_, e);
        for _ in 0..12 {
            let (x, q) = an.follow_def(fn_, e, p, 1);
            if x != e {
                e = x;
                p = q;
                add(&mut out, fn_, e);
                continue;
            }
            let fo = an.fo(fn_);
            let ir = fo.map(|f| fir(f.f));
            let d = an.defs_in(fn_);
            if let (Some(fo), Some(ir), Some(d)) = (fo, ir, &d) {
                if let Node::Var(id) = ir.get(e) {
                    if let Some(v) = fo.f.vars.get(id as usize) {
                        if v.param >= 1
                            && v.param != 10
                            && !d.defs.contains_key(&id)
                            && !d.multi.contains(&id)
                        {
                            let par = if fn_ == self.ctx.handler {
                                None
                            } else {
                                self.ctx.parents.get(&fn_).copied()
                            };
                            let st = par.and_then(|p| p.pc.and_then(|pc| an.stmt_at(p.fn_, pc)));
                            if let (Some(par), Some((sb, si))) = (par, st) {
                                let pf = an.fo(par.fn_).unwrap().f;
                                let pir = fir(pf);
                                if let Some((_, args)) = call_of(pir, &pf.blocks[sb].stmts[si]) {
                                    let i = if v.param < 100 {
                                        v.param - 1
                                    } else {
                                        4 + (v.param - 100)
                                    };
                                    if i >= 0 && (i as u32) < args.len {
                                        e = pir.at(args, i as u32);
                                        p = pos_of(sb, si);
                                        fn_ = par.fn_;
                                        add(&mut out, fn_, e);
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            let Some(ir) = an.fo(fn_).map(|f| fir(f.f)) else {
                break;
            };
            let a = match ir.get(e) {
                Node::Load { addr, .. } => Some(addr),
                _ => None,
            };
            let b = match a.map(|a| ir.get(a)) {
                Some(Node::Bin(BinOp::Add, x, y)) if matches!(ir.get(y), Node::Const(_)) => Some(x),
                _ => a,
            };
            if let Some(b) = b {
                if matches!(ir.get(b), Node::Var(_)) {
                    let (y, q2) = an.follow_def(fn_, b, p, 1);
                    if y != b {
                        add(&mut out, fn_, y);
                        e = y;
                        p = q2;
                        continue;
                    }
                }
            }
            break;
        }
        out.truncate(12);
        out
    }
}

/// a function's statements dividing by a non-constant (the divisors; wide: a 128-bit division helper's)
fn div_cands(an: &An, f: &sbpf_program::Func) -> Vec<(usize, usize, i64, Vec<(E, bool)>)> {
    let ir = fir(f);
    let mut out = Vec::new();
    for (bi, bl) in f.blocks.iter().enumerate() {
        for (si, s) in bl.stmts.iter().enumerate() {
            let mut cands: Vec<(E, bool)> = Vec::new();
            for e in crate::util::stmt_exprs(ir, s) {
                ir.walk(e, &mut |_, n| {
                    if let Node::Bin(BinOp::Udiv | BinOp::Sdiv | BinOp::Sdiv32, _, b) = n {
                        if !matches!(ir.get(b), Node::Const(_)) {
                            cands.push((b, false));
                        }
                    }
                });
            }
            if let Some((CallTarget::Fn { pc }, args)) = call_of(ir, s) {
                if crate::jre!(r"^__u?divti3").is_match(&an.pname(pc))
                    && args.len > 3
                    && !matches!(ir.get(ir.at(args, 3)), Node::Const(_))
                {
                    cands.push((ir.at(args, 3), true));
                }
            }
            if !cands.is_empty() {
                out.push((bi, si, stmt_pc(s), cands));
            }
        }
    }
    out
}

/// `acct.field` / native `account[i].data[a..a+1]` compared with a small constant in a condition
fn state_refs(cond: &str, ix: &IxOut) -> Vec<String> {
    let mut out = Vec::new();
    let acc_info = |s: &str| {
        crate::jre!(
            r"^(key|owner|lamports|data|data_len|is_signer|is_writable|executable|rent_epoch|len)$"
        )
        .is_match(s)
    };
    let small = |s: &str| crate::jre!(r"(?i)^(0x[0-9a-f]{1,2}|\d{1,3}|true|false)$").is_match(s);
    let nm = |a: &str| a.strip_prefix("accounts.").unwrap_or(a).to_string();
    for m in crate::jre!(r"(?i)((?:accounts\.)?[A-Za-z_]\w*(?:\[\d+\])?)\.([a-z_][a-z0-9_]*)\s*(?:==|!=|<=|>=|<|>)\s*(-?(?:0x[0-9a-f]+|\d+)|true|false)\b").captures_iter(cond) {
        if !acc_info(&m[2]) && small(&m[3]) {
            out.push(format!("{}.{}", nm(&m[1]), &m[2]));
        }
    }
    // (?!\() after the field: the match is dropped when a call follows; the regex then backtracks to the account
    // part without `accounts.` (the only other way to match at that start), else moves on one character
    let re = crate::jre!(
        r"(?i)(-?(?:0x[0-9a-f]+|\d+))\s*(?:==|!=|<=|>=|<|>)\s*((?:accounts\.)?[A-Za-z_]\w*(?:\[\d+\])?)\.([a-z_][a-z0-9_]*)\b"
    );
    let re2 = crate::jre!(
        r"(?i)^(-?(?:0x[0-9a-f]+|\d+))\s*(?:==|!=|<=|>=|<|>)\s*([A-Za-z_]\w*(?:\[\d+\])?)\.([a-z_][a-z0-9_]*)\b"
    );
    let mut pos = 0usize;
    while pos <= cond.len() {
        let Some(m) = re.captures_at(cond, pos) else {
            break;
        };
        let s0 = m.get(0).unwrap().start();
        let e0 = m.get(0).unwrap().end();
        let ok = |e: usize| !cond[e..].starts_with('(');
        let hit = if ok(e0) {
            Some((m[1].to_string(), m[2].to_string(), m[3].to_string(), e0))
        } else {
            re2.captures(&cond[s0..]).and_then(|m2| {
                let e2 = s0 + m2.get(0).unwrap().end();
                if ok(e2) {
                    Some((m2[1].to_string(), m2[2].to_string(), m2[3].to_string(), e2))
                } else {
                    None
                }
            })
        };
        match hit {
            Some((n, a, f, e)) => {
                if !acc_info(&f) && small(&n) {
                    out.push(format!("{}.{}", nm(&a), f));
                }
                pos = e.max(s0 + 1);
            }
            None => {
                pos = s0 + cond[s0..].chars().next().map_or(1, |c| c.len_utf8());
            }
        }
    }
    for m in crate::jre!(r"ld8\(input\.acc(\d+)\.data \+ (0x[0-9a-f]+)\)(?:\s*(?:==|!=|<=|>=|<|>)\s*(0x[0-9a-f]{1,2}|\d{1,3})\b)?").captures_iter(cond) {
        if m.get(3).is_some() {
            let i = super::js_number(&m[1]);
            let off = super::js_number(&m[2]);
            let n = ix
                .accounts
                .iter()
                .find(|x| x.index == Some(i))
                .map_or_else(|| format!("account[{}]", crate::util::js_num(i)), |x| x.name.clone());
            out.push(format!(
                "{n}.data[{}..{}]",
                crate::util::js_num(off),
                crate::util::js_num(off + 1.0)
            ));
        }
    }
    out
}

/// for a close: evidence the data is zeroed (and of a realloc after it, which could revive the account)
pub fn close_zeroing(an: &An, ix: &IxOut, oi: usize) -> (Option<String>, Option<String>) {
    let o = &ix.ops[oi];
    let t = o
        .target
        .as_ref()
        .map(|t| t.split('.').next().unwrap_or("").to_string());
    let (mut zeroed, mut revived): (Option<String>, Option<String>) = (None, None);
    let facts = an.facts.borrow();
    let cf = facts.values().filter(|f| f.name == o.at.fn_).last();
    for (i, x) in ix.ops.iter().enumerate() {
        if i == oi {
            continue;
        }
        let same = t.as_ref().is_none_or(|t| t.is_empty())
            || x.target.as_ref().is_none_or(|s| s.is_empty())
            || x.target.as_ref().unwrap().split('.').next() == t.as_deref();
        if !same {
            continue;
        }
        if x.has("OWNER_ASSIGN") && zeroed.is_none() {
            zeroed = Some(format!("owner reassigned {}:{}", x.at.fn_, x.at.line));
        }
        let to0 = x.at.fn_ != o.at.fn_
            && cf.is_some_and(|cf| {
                let re = regex::Regex::new(&format!(
                    r"(?-u:\b){}\((?:[^,()]+, )*0[,)]",
                    regex::escape(&x.at.fn_)
                ))
                .unwrap();
                cf.lines.iter().any(|l| re.is_match(l))
            });
        if x.has("ACCOUNT_REALLOC")
            && (to0 || crate::jre!(r"realloc\([^,]+, [^,]+, 0\b|space: 0\b").is_match(&x.text))
        {
            if zeroed.is_none() {
                zeroed = Some(format!("realloc to 0 {}:{}", x.at.fn_, x.at.line));
            }
        } else if x.has("ACCOUNT_REALLOC") && (x.at.fn_ != o.at.fn_ || x.at.line > o.at.line) {
            if revived.is_none() {
                revived = Some(format!(
                    "{} ({}:{})",
                    js_slice(&x.text, 0, Some(80)),
                    x.at.fn_,
                    x.at.line
                ));
            }
        }
        if x.has("ACCOUNT_DATA_WRITE")
            && x.target
                .as_ref()
                .is_some_and(|t| crate::jre!(r"discriminator|data\[0\.\.|\.data$").is_match(t))
            && zeroed.is_none()
        {
            zeroed = Some(format!("discriminator written {}:{}", x.at.fn_, x.at.line));
        }
    }
    if zeroed.is_none() && crate::jre!(r"memset|fill\(").is_match(&o.text) {
        zeroed = Some("memset in the close".into());
    }
    if zeroed.is_none()
        && cf.is_some_and(|cf| {
            cf.lines
                .iter()
                .any(|l| crate::jre!(r"\bAccountInfo_(assign|realloc|resize)\w*\(").is_match(l))
        })
    {
        zeroed = Some(format!("AccountInfo::assign / realloc in {}", o.at.fn_));
    }
    (zeroed, revived)
}

impl<'a> An<'a> {
    /// phase3Ix: arithmetic and division sites, path conditions, chains, proofs
    pub fn phase3_ix(&self, a: &mut Analysis, xi: usize, info: &IxInfo<'a>, s: &SourceCtx<'a, '_>) {
        let ctx = &*info.ctx;
        let by_name: HashMap<String, i64> = self
            .facts
            .borrow()
            .iter()
            .map(|(pc, f)| (f.name.clone(), *pc))
            .collect();
        let mut check_at: HashMap<i64, HashMap<usize, usize>> = HashMap::new();
        for (ci, c) in a.ixs[xi].checks.iter().enumerate() {
            if self.fo(c.fn_pc).is_none() {
                continue;
            }
            let Some(db) = decision_block(&self.cfg(c.fn_pc), c.c, c.at.pc, c.pass_pc) else {
                continue;
            };
            check_at.entry(c.fn_pc).or_default().entry(db).or_insert(ci);
        }
        let p3 = P3 {
            an: self,
            ctx,
            by_name,
            check_at,
        };
        let caller_ctl = |fn_: i64, e: E, p: Pos| s.of(fn_, e, p).iter().any(|x| x.kind == "ix");
        let mut arith: Vec<ArithSite> = Vec::new();
        let mut keys_of: HashMap<usize, Vec<(bool, String)>> = HashMap::new();
        let site = |arith: &mut Vec<ArithSite>,
                    keys_of: &mut HashMap<usize, Vec<(bool, String)>>,
                    fn_: i64,
                    v: E,
                    p: Pos,
                    target: String,
                    op: Option<usize>,
                    unnamed: bool| {
            let (fname, at1, pcl) = {
                let facts = self.facts.borrow();
                let Some(ff) = facts.get(&fn_) else { return };
                (ff.name.clone(), ff.at as i64 + 1, ff.pc_line.clone())
            };
            if arith.len() >= 40 {
                return;
            }
            let (e, q) = self.follow_def(fn_, v, p, 6);
            let k1 = p3.stmt_pc_at(fn_, q).unwrap_or(-1);
            let k2 = p3.stmt_pc_at(fn_, p).unwrap_or(-1);
            let line = pcl
                .get(&k1)
                .or_else(|| pcl.get(&k2))
                .copied()
                .unwrap_or(at1);
            let ir = fir(self.fo(fn_).unwrap().f);
            if let Node::Fn(n, _) = ir.get(e) {
                if &*ir.name(n) == "sat_sub" {
                    arith.push(ArithSite {
                        at: p3.loc(&fname, line),
                        op,
                        target,
                        expr: p3.text(fn_, e),
                        kind: "sub",
                        status: "saturating",
                        guard: None,
                        caller: None,
                        unnamed: if unnamed { Some(true) } else { None },
                    });
                    return;
                }
            }
            if !matches!(ir.get(e), Node::Bin(BinOp::Add | BinOp::Sub, _, _)) {
                return;
            }
            let mut terms: Vec<(bool, E)> = Vec::new();
            fn flat(ir: &sbpf_ir::Ir, x: E, neg: bool, d: u32, terms: &mut Vec<(bool, E)>) {
                match ir.get(x) {
                    Node::Bin(op @ (BinOp::Add | BinOp::Sub), a, b) if d < 6 => {
                        flat(ir, a, neg, d + 1, terms);
                        flat(
                            ir,
                            b,
                            if op == BinOp::Sub { !neg } else { neg },
                            d + 1,
                            terms,
                        );
                    }
                    _ => terms.push((neg, x)),
                }
            }
            flat(ir, e, false, 0, &mut terms);
            let vars: Vec<(bool, String)> = terms
                .iter()
                .map(|(n, x)| (*n, self.value_key(Some(ctx), fn_, *x, q, 0)))
                .filter(|(_, k)| !is_const(k))
                .collect();
            if vars.is_empty()
                || vars
                    .iter()
                    .any(|(_, k)| crate::jre!(r"^fp\d+$").is_match(k))
            {
                return;
            }
            let kind = if terms.iter().any(|t| t.0) {
                "sub"
            } else {
                "add"
            };
            let sum = self.value_key(Some(ctx), fn_, e, q, 0);
            let mut g: Option<IrCond> = None;
            let mut bounded: Option<IrCond> = None;
            for c in self.path_to(Some(ctx), fn_, Some((p >> 16) as usize), 80) {
                let cm = self.cmps_of(Some(ctx), c.fn_, c.c, c.pos);
                if cm.is_empty() {
                    continue;
                }
                let kk = cm
                    .iter()
                    .map(|x| format!("({} {} {})", x.0, x.1, x.2))
                    .collect::<Vec<_>>()
                    .join(" ");
                if vars.iter().all(|(_, k)| key_in(&kk, k))
                    || (key_in(&kk, &sum) && vars.iter().any(|(_, k)| key_in(&kk, k)))
                {
                    g = Some(c);
                    break;
                }
                if bounded.is_none()
                    && c.how != "before"
                    && kind == "sub"
                    && vars.iter().filter(|(n, _)| *n).all(|(_, k)| {
                        cm.iter()
                            .any(|(_, x, y)| (x == k && !is_const(y)) || (y == k && !is_const(x)))
                    })
                {
                    bounded = Some(c);
                }
            }
            let gc = g.as_ref().or(bounded.as_ref());
            keys_of.insert(arith.len(), vars);
            let guard = gc.map(|c| p3.guard_of(c));
            let caller = caller_ctl(fn_, e, q);
            arith.push(ArithSite {
                at: p3.loc(&fname, line),
                op,
                target,
                expr: p3.text(fn_, e),
                kind,
                status: if g.is_some() {
                    "checked"
                } else if bounded.is_some() {
                    "bounded"
                } else {
                    "unchecked"
                },
                guard,
                caller: if caller { Some(true) } else { None },
                unnamed: if unnamed { Some(true) } else { None },
            });
        };
        let ops = a.ixs[xi].ops.clone();
        for (oi, o) in ops.iter().enumerate() {
            let Some(fn_) = o.fn_pc else { continue };
            let x = o.at.pc.and_then(|pc| self.stored_at(fn_, pc));
            let value = o.value.as_ref().is_some_and(|v| !v.is_empty());
            if let (Some(x), true, true, false) =
                (x, o.has("LAMPORT_WRITE"), value, o.has("ACCOUNT_CLOSE"))
            {
                site(
                    &mut arith,
                    &mut keys_of,
                    fn_,
                    x.0,
                    x.1,
                    o.target.clone().unwrap_or_else(|| "?".into()),
                    Some(oi),
                    false,
                );
            } else if let (Some(x), true, true, Some(t)) = (
                x,
                o.has("ACCOUNT_DATA_WRITE"),
                value,
                o.target.as_ref().filter(|t| !t.is_empty()),
            ) {
                let f = t.split('.').skip(1).collect::<Vec<_>>().join(".");
                let unnamed = f.starts_with("data[");
                if value_field(&f) || (unnamed && o.how != Some("=")) {
                    site(
                        &mut arith,
                        &mut keys_of,
                        fn_,
                        x.0,
                        x.1,
                        t.clone(),
                        Some(oi),
                        unnamed,
                    );
                } else if unnamed && crate::jre!(r"^data\[\d+\.\.\d+\]$").is_match(&f) {
                    let inner = &f[5..f.len() - 1];
                    let (lo, hi) = inner.split_once("..").unwrap();
                    if super::js_number(hi) - super::js_number(lo) == 8.0 {
                        site(
                            &mut arith,
                            &mut keys_of,
                            fn_,
                            x.0,
                            x.1,
                            t.clone(),
                            Some(oi),
                            true,
                        );
                    }
                }
            }
            // (a CPI's amount: the call's argument printed as the field's value)
            let fields = o.cpi(|c| (c.fields.clone(), c.program.clone(), c.ix.clone()));
            let cs = match (&fields, o.at.pc) {
                (Some((f, _, _)), Some(pc)) if !f.is_empty() => self.stmt_at(fn_, pc),
                _ => None,
            };
            let f = self.fo(fn_).unwrap().f;
            let call = cs.and_then(|(b, i)| call_of(fir(f), &f.blocks[b].stmts[i]));
            let has_facts = self.facts.borrow().contains_key(&fn_);
            if let (Some((_, args)), true, Some((flds, prog, cix))) = (call, has_facts, &fields) {
                let ir = fir(f);
                for (k, v) in flds {
                    if !crate::jre!(r"(?i)amount|lamports|quantity").is_match(k) {
                        continue;
                    }
                    let want = v.strip_suffix(" [ix data?]").unwrap_or(v);
                    let arg = ir
                        .items(args)
                        .find(|y| (self.expr)(fn_, *y).as_deref() == Some(want));
                    if let Some(arg) = arg {
                        let (b, i) = cs.unwrap();
                        site(
                            &mut arith,
                            &mut keys_of,
                            fn_,
                            arg,
                            pos_of(b, i),
                            format!("{prog}.{}.{k}", cix.as_deref().unwrap_or("?")),
                            Some(oi),
                            false,
                        );
                    }
                }
            }
        }
        // (value conserved: an addition of an amount the instruction subtracts from another balance with a check)
        for i in 0..arith.len() {
            if arith[i].status != "unchecked" || arith[i].kind != "add" {
                continue;
            }
            let ks = keys_of.get(&i).cloned().unwrap_or_default();
            let j = (0..arith.len()).find(|&k| {
                let y = &arith[k];
                (y.status == "checked" || y.status == "bounded")
                    && y.kind == "sub"
                    && keys_of.get(&k).is_some_and(|l| {
                        l.iter()
                            .any(|(n, key)| *n && ks.iter().any(|(_, a)| a == key))
                    })
            });
            if let Some(j) = j {
                let g = arith[j].guard.clone().map(|(at, c)| {
                    (
                        at,
                        format!(
                            "{c} (the amount is subtracted from {}: a transfer)",
                            arith[j].target
                        ),
                    )
                });
                arith[i].status = "bounded";
                arith[i].guard = g;
            }
        }
        a.ixs[xi].arith = Some(arith);
        // divisions by a supply / balance-like value
        let mut divs: Vec<DivSite> = Vec::new();
        let fnames = a.ixs[xi].functions.clone();
        for fname in &fnames {
            let Some(&fpc) = p3.by_name.get(fname) else {
                continue;
            };
            let Some(fo) = self.fo(fpc) else { continue };
            if divs.len() >= 20 {
                continue;
            }
            let g = self.cfg(fpc);
            let r = if !self.anchor {
                Some(account_resolver(&self.fl, fo.f, &fo.names, true, None))
            } else {
                None
            };
            let (ff_at, ff_lines, ff_pcl) = {
                let facts = self.facts.borrow();
                let ff = &facts[&fpc];
                (ff.at as i64, ff.lines.clone(), ff.pc_line.clone())
            };
            for (bi, si, spc, cands) in div_cands(self, fo.f) {
                if g.rpo[bi] < 0
                    || divs.len() >= 20
                    || (ctx.restricted.as_ref().is_some_and(|x| x.contains(&fpc))
                        && ctx.allowed(fpc, bi) == Some(false))
                {
                    continue;
                }
                let p = pos_of(bi, si);
                for (dv, wide) in cands {
                    let seen = p3.provenance(fpc, dv, p);
                    let mut acct = false;
                    if wide && !seen.iter().any(|x| supply(x)) {
                        let (fe, fq) = self.follow_def(fpc, dv, p, 6);
                        let ir = fir(fo.f);
                        acct = matches!(ir.get(fe), Node::Load { .. })
                            && match &r {
                                Some(r) => {
                                    let sp = if p3.stmt_pc_at(fpc, fq).is_some() {
                                        fq
                                    } else {
                                        p
                                    };
                                    r.value_ref(&self.fl, fe, Some(sp))
                                        .and_then(|x| x.field)
                                        .is_some_and(|f| f.starts_with("data"))
                                }
                                None => seen.iter().any(|x| div_acct_text(x)),
                            };
                    }
                    if !seen.iter().any(|x| supply(x)) && !acct {
                        continue;
                    }
                    let k = self.value_key(Some(ctx), fpc, dv, p, 0);
                    if is_const(&k) {
                        continue;
                    }
                    let gc = self
                        .path_to(Some(ctx), fpc, Some(bi), 80)
                        .into_iter()
                        .find(|x| {
                            x.how != "before"
                                && !x.panics
                                && self
                                    .cmps_of(Some(ctx), x.fn_, x.c, x.pos)
                                    .iter()
                                    .any(|(_, u, v)| key_in(u, &k) || key_in(v, &k))
                        });
                    let line = ff_pcl.get(&spc).copied().unwrap_or(ff_at + 1);
                    let expr = if line >= 1 {
                        ff_lines
                            .get((line - 1) as usize)
                            .map_or(String::new(), |l| js_slice(js_trim(l), 0, Some(140)))
                    } else {
                        String::new()
                    };
                    divs.push(DivSite {
                        at: p3.loc(fname, line),
                        expr,
                        divisor: js_slice(&seen.join(" ← "), 0, Some(160)),
                        status: if gc.is_some() { "checked" } else { "not_found" },
                        guard: gc.as_ref().map(|c| p3.guard_of(c)),
                    });
                }
            }
        }
        a.ixs[xi].divs = Some(divs);
        // path conditions to the sensitive operations
        let mut paths: Vec<PathInfo> = Vec::new();
        {
            let ix = &a.ixs[xi];
            for (oi, o) in ix.ops.iter().enumerate() {
                let known = o
                    .cpi(|c| c.known.as_ref().is_some_and(|k| !k.is_empty()))
                    .unwrap_or(false);
                if paths.len() >= 30
                    || !o.kinds.iter().any(|k| *k != "PDA_DERIVE")
                    || (o.kinds.len() == 1 && o.kinds[0] == "CPI" && known)
                    || o.fn_pc.is_none()
                {
                    continue;
                }
                let f = o.fn_pc.unwrap();
                let all: Vec<IrCond> = self
                    .path_to(Some(ctx), f, self.block_at(f, o.at.pc, o.ret), 80)
                    .into_iter()
                    .filter(|c| c.how != "before")
                    .collect();
                let conds: Vec<PathCond> = all.iter().take(40).map(|c| p3.shown(c)).collect();
                let mut acct: HashSet<String> = HashSet::new();
                if let Some(t) = &o.target {
                    let h = t.split('.').next().unwrap_or("");
                    if !h.is_empty() {
                        acct.insert(h.to_string());
                    }
                }
                if let Some(c) = &o.cpi {
                    for x in &c.borrow().accounts {
                        if let Some(m) = crate::jre!(r"^\*?([A-Za-z_]\w*)").captures(&x.text) {
                            acct.insert(m[1].to_string());
                        }
                    }
                }
                let req: HashSet<usize> = conds.iter().filter_map(|c| c.check).collect();
                let mut not_required: Vec<(usize, Option<Vec<Loc>>)> = Vec::new();
                for (ci, c) in ix.checks.iter().enumerate() {
                    if not_required.len() >= 6
                        || o.guards.as_ref().is_some_and(|g| g.contains(&ci))
                        || req.contains(&ci)
                    {
                        continue;
                    }
                    if !c.kinds.iter().any(|k| {
                        [
                            "signer", "owner", "key", "address", "has_one", "pda", "custom",
                            "state", "raw",
                        ]
                        .contains(k)
                    }) {
                        continue;
                    }
                    if !(c.kinds.contains(&"signer")
                        || c.account.as_ref().is_some_and(|a| {
                            !a.is_empty() && acct.contains(a.strip_suffix('?').unwrap_or(a))
                        }))
                    {
                        continue;
                    }
                    if o.guards.is_none() {
                        continue;
                    }
                    not_required.push((
                        ci,
                        o.bypass
                            .as_ref()
                            .and_then(|b| b.iter().find(|b| b.check == ci))
                            .map(|b| b.path.clone()),
                    ));
                }
                paths.push(PathInfo {
                    op: oi,
                    conds,
                    not_required,
                    truncated: if all.len() > 40 { Some(true) } else { None },
                });
            }
        }
        a.ixs[xi].paths = Some(paths);
        let ch = chains(&a.ixs[xi], a);
        a.ixs[xi].chains = Some(ch);
        let pr = proofs(self, &a.ixs[xi]);
        a.ixs[xi].proof = Some(pr);
    }

    /// stateMachine: status / enum-like fields, the instructions setting and checking them
    pub fn state_machine(&self, a: &Analysis) -> Vec<StateField> {
        let small =
            |s: &str| crate::jre!(r"(?i)^(0x[0-9a-f]{1,2}|\d{1,3}|true|false)$").is_match(s);
        let mut out: indexmap::IndexMap<String, StateField> = indexmap::IndexMap::new();
        let mut writes: Vec<(String, &IxOut, &OpOut)> = Vec::new();
        for ix in &a.ixs {
            for o in &ix.ops {
                let ok = o.has("ACCOUNT_DATA_WRITE")
                    && o.target.as_ref().is_some_and(|t| !t.is_empty())
                    && o.how == Some("=")
                    && o.value.as_ref().is_some_and(|v| small(js_trim(v)));
                if ok {
                    writes.push((o.target.clone().unwrap(), ix, o));
                }
            }
        }
        let mut checks: Vec<(String, &IxOut, String, Loc)> = Vec::new();
        for ix in &a.ixs {
            for c in &ix.checks {
                for t in state_refs(&c.cond, ix) {
                    checks.push((t, ix, c.cond.clone(), c.at.clone()));
                }
            }
            for p in ix.paths.iter().flatten() {
                for c in &p.conds {
                    if c.check.is_none() {
                        for t in state_refs(&c.cond, ix) {
                            checks.push((t, ix, c.cond.clone(), c.at.clone()));
                        }
                    }
                }
            }
        }
        let checked: HashSet<String> = checks.iter().map(|x| x.0.clone()).collect();
        let field = |t: &str| t.split('.').skip(1).collect::<Vec<_>>().join(".");
        let is_state = |t: &str| {
            let f = field(t);
            status_field(&f)
                || (crate::jre!(r"^data\[(\d+)\.\.(\d+)\]$").is_match(&f) && checked.contains(t))
        };
        for (t, ix, o) in &writes {
            if !is_state(t) && !checked.contains(t) {
                continue;
            }
            let s = out.entry(t.clone()).or_insert_with(|| StateField {
                field: t.clone(),
                set_by: vec![],
                checked_by: vec![],
            });
            let v = js_trim(o.value.as_ref().unwrap()).to_string();
            if !s.set_by.iter().any(|x| x.0 == ix.name && x.1 == v) {
                s.set_by.push((ix.name.clone(), v, o.at.clone()));
            }
        }
        for (t, ix, cond, at) in &checks {
            if !out.contains_key(t) && !status_field(&field(t)) {
                continue;
            }
            let s = out.entry(t.clone()).or_insert_with(|| StateField {
                field: t.clone(),
                set_by: vec![],
                checked_by: vec![],
            });
            let c = js_slice(cond, 0, Some(100));
            if s.checked_by.len() < 24 && !s.checked_by.iter().any(|x| x.0 == ix.name && x.1 == c) {
                s.checked_by.push((ix.name.clone(), c, at.clone()));
            }
        }
        let mut v: Vec<StateField> = out.into_values().collect();
        v.sort_by(|x, y| {
            let bx = (!x.set_by.is_empty() && !x.checked_by.is_empty()) as i64;
            let by = (!y.set_by.is_empty() && !y.checked_by.is_empty()) as i64;
            (by - bx)
                .cmp(&0)
                .then_with(|| {
                    ((y.set_by.len() + y.checked_by.len()) as i64
                        - (x.set_by.len() + x.checked_by.len()) as i64)
                        .cmp(&0)
                })
                .then_with(|| super::locale_cmp(&x.field, &y.field))
        });
        v.truncate(40);
        v
    }
}

/// divisions: a value read from an account's data, by its printed provenance (Anchor)
fn div_acct_text(x: &str) -> bool {
    let a = crate::jre!(r"\bld(?:32|64)\(accounts\b|\.accounts\.").is_match(x)
        || crate::jre!(r"[A-Za-z_]\w*\.([a-z_]\w*)\)?$")
            .captures(x)
            .is_some_and(|m| &m[1] != "data");
    a && !crate::jre!(r"\b(?:res|ret|arg|prod|quot|rem)(?:_\d+)?\.f0x[0-9a-f]+_\w+\)?$|\.f0x0_\w+\)?$|\.(?:val|lo|hi|tag)\)?$").is_match(x)
}

fn chains(ix: &IxOut, a: &Analysis) -> Vec<Chain> {
    let mut out = Vec::new();
    let signers_of = |name: &str| -> Vec<String> {
        a.ixs
            .iter()
            .find(|x| x.name == name)
            .map(|x| {
                x.accounts
                    .iter()
                    .filter(|y| y.has("signer"))
                    .map(|y| format!("{} ({})", y.name, y.constraints["signer"].status))
                    .collect()
            })
            .unwrap_or_default()
    };
    for row in ix.authority.iter().flatten() {
        let mut alts: Vec<Vec<ChainStep>> = Vec::new();
        let head = ChainStep {
            kind: "op",
            what: js_trim(&format!(
                "{} {}",
                row.kind,
                ix.ops[row.op].target.as_deref().unwrap_or("")
            ))
            .to_string(),
            status: None,
        };
        for e in &row.enabled_by {
            if e.kind == "signer"
                && row
                    .enabled_by
                    .iter()
                    .any(|x| x.kind == "stored" && x.what.starts_with(&format!("{}.key", e.what)))
            {
                continue;
            }
            let mut steps = vec![head.clone()];
            if e.kind == "stored" {
                let mut sp = e.what.split(" == ");
                let sg = sp.next().unwrap_or("").to_string();
                let field = sp.next().unwrap_or("undefined").to_string();
                let sgn = sg.strip_suffix(".key").unwrap_or(&sg).to_string();
                steps.push(ChainStep {
                    kind: "signer",
                    what: sgn.clone(),
                    status: row
                        .enabled_by
                        .iter()
                        .find(|x| x.kind == "signer" && x.what == sgn)
                        .and_then(|x| x.status),
                });
                steps.push(ChainStep {
                    kind: "stored",
                    what: format!("{field} == {sg}"),
                    status: e.status,
                });
                for w in e.written_by.iter().flatten().take(4) {
                    let sigs = signers_of(w).join(", ");
                    steps.push(ChainStep {
                        kind: "writer",
                        what: format!(
                            "{field} written by {w}{}; signers there: {}",
                            if *w == ix.name {
                                " (this instruction)"
                            } else {
                                ""
                            },
                            if sigs.is_empty() {
                                "none found".to_string()
                            } else {
                                sigs
                            }
                        ),
                        status: None,
                    });
                }
                if e.written_by.as_ref().is_none_or(|w| w.is_empty()) {
                    steps.push(ChainStep {
                        kind: "writer",
                        what: format!("{field}: no instruction writing it found (set at creation, or outside the recognized writes)"),
                        status: None,
                    });
                }
            } else {
                steps.push(ChainStep {
                    kind: e.kind,
                    what: e.what.clone(),
                    status: e.status,
                });
            }
            alts.push(steps);
        }
        alts.truncate(6);
        out.push(Chain {
            op: row.op,
            steps: alts,
        });
    }
    out
}

fn prop(p: &str, status: &'static str, evidence: String) -> Option<Prop> {
    Some(Prop {
        prop: p.to_string(),
        status,
        evidence,
    })
}

fn proofs(an: &An, ix: &IxOut) -> Vec<Proof> {
    let mut out: Vec<Proof> = Vec::new();
    let row = |n: Option<&str>| {
        n.filter(|s| !s.is_empty())
            .and_then(|n| ix.accounts.iter().find(|x| x.name == n))
    };
    let cst = |n: Option<&str>, ks: &[&str]| -> &'static str {
        match row(n) {
            Some(x) => best_of(
                &ks.iter()
                    .map(|k| x.constraints.get(k).map(|c| c.status))
                    .collect::<Vec<_>>(),
            ),
            None => "not_found",
        }
    };
    let ev = |n: Option<&str>, ks: &[&str]| -> String {
        let Some(x) = row(n) else {
            return match n.filter(|s| !s.is_empty()) {
                Some(n) => format!("{n}: not an identified account"),
                None => "account not identified".into(),
            };
        };
        let n = n.unwrap();
        let f: Vec<&&str> = ks.iter().filter(|k| x.has(k)).collect();
        if f.is_empty() {
            format!("{n}: no {} check found", ks.join(" / "))
        } else {
            format!(
                "{n}: {}",
                f.iter()
                    .map(|k| format!("{k} {}", x.constraints[**k].status))
                    .collect::<Vec<_>>()
                    .join(", ")
            )
        }
    };
    let rel = |n: Option<&str>| -> Vec<&super::phase2::Relation> {
        match n.filter(|s| !s.is_empty()) {
            Some(n) => {
                let p = format!("{n}.");
                ix.relations
                    .iter()
                    .flatten()
                    .filter(|x| x.a.starts_with(&p) || x.b.starts_with(&p))
                    .collect()
            }
            None => vec![],
        }
    };
    let base = ["pda", "address", "key", "has_one", "associated"];
    let bound = |n: Option<&str>, extra: &[&str]| -> &'static str {
        let ks: Vec<&str> = base.iter().copied().chain(extra.iter().copied()).collect();
        let s = cst(n, &ks);
        if s != "not_found" {
            return s;
        }
        let r = rel(n);
        if r.is_empty() {
            "not_found"
        } else {
            best_of(&r.iter().map(|x| Some(x.status)).collect::<Vec<_>>())
        }
    };
    let bound_ev = |n: Option<&str>, extra: &[&str]| -> String {
        let ks: Vec<&str> = base.iter().copied().chain(extra.iter().copied()).collect();
        let r = rel(n);
        format!(
            "{}{}",
            ev(n, &ks),
            if r.is_empty() {
                String::new()
            } else {
                format!(
                    "; relations: {}",
                    r.iter()
                        .take(3)
                        .map(|x| format!("{} == {} ({})", x.a, x.b, x.status))
                        .collect::<Vec<_>>()
                        .join(", ")
                )
            }
        )
    };
    let auth_of = |oi: usize| -> Option<Prop> {
        let en: Vec<&super::phase2::Enabler> = ix
            .authority
            .iter()
            .flatten()
            .find(|x| x.op == oi)
            .map_or(vec![], |a| a.enabled_by.iter().collect());
        let st = best_of(
            &en.iter()
                .map(|e| {
                    if e.kind == "pda" {
                        Some("found")
                    } else if e.kind == "none" {
                        None
                    } else {
                        e.status
                    }
                })
                .collect::<Vec<_>>(),
        );
        let evs = js_slice(
            &en.iter()
                .map(|e| {
                    format!(
                        "{} {}{}",
                        e.kind,
                        e.what,
                        e.status.map_or(String::new(), |s| format!(" ({s})"))
                    )
                })
                .collect::<Vec<_>>()
                .join("; "),
            0,
            Some(200),
        );
        prop(
            "authorized (signer / PDA signature / stored authority)",
            st,
            if evs.is_empty() {
                "none found".into()
            } else {
                evs
            },
        )
    };
    let stored = |oi: usize| -> Option<Prop> {
        let en: Vec<&super::phase2::Enabler> = ix
            .authority
            .iter()
            .flatten()
            .find(|x| x.op == oi)
            .map_or(vec![], |a| a.enabled_by.iter().collect());
        let s: Vec<&&super::phase2::Enabler> = en
            .iter()
            .filter(|e| e.kind == "stored" || e.kind == "pda")
            .collect();
        let evs = js_slice(
            &s.iter()
                .map(|e| e.what.clone())
                .collect::<Vec<_>>()
                .join("; "),
            0,
            Some(200),
        );
        prop(
            "signer related to a stored authority (or PDA signature)",
            if s.is_empty() {
                "not_found"
            } else {
                best_of(
                    &s.iter()
                        .map(|e| {
                            if e.kind == "pda" {
                                Some("found")
                            } else {
                                e.status
                            }
                        })
                        .collect::<Vec<_>>(),
                )
            },
            if evs.is_empty() {
                "no relation between a signer key and a stored field found".into()
            } else {
                evs
            },
        )
    };
    let dom = |o: &OpOut| -> Option<Prop> {
        let nb = o.bypass.as_ref().map_or(0, |b| b.len());
        prop(
            "relevant checks on every path",
            if nb > 0 {
                "partial"
            } else if o.guards.is_some() {
                "found"
            } else {
                "not_found"
            },
            if nb > 0 {
                format!("{nb} relevant check(s) do not dominate it")
            } else if let Some(g) = &o.guards {
                format!("{} dominating checks", g.len())
            } else {
                "dominance not computed (operation not placed in the CFG)".into()
            },
        )
    };
    let amount = |o: &OpOut, oi: usize| -> Option<Prop> {
        let ar: Vec<&ArithSite> = ix
            .arith
            .iter()
            .flatten()
            .filter(|x| x.op == Some(oi))
            .collect();
        let src: Vec<&super::report::SrcRow> = o
            .sources
            .iter()
            .flatten()
            .filter(|s| {
                crate::jre!(r"(?i)amount|lamports|quantity").is_match(&s.param)
                    || Some(&s.param) == o.target.as_ref()
            })
            .collect();
        if ar.is_empty() && src.is_empty() {
            return None;
        }
        let bad = ar.iter().any(|x| x.status == "unchecked");
        let evs: Vec<String> = ar
            .iter()
            .map(|x| format!("{} ({})", x.expr, x.status))
            .chain(
                src.iter()
                    .map(|s| format!("{} ← {} ({})", s.param, s.source, s.trust)),
            )
            .collect();
        prop(
            "amount arithmetic checked",
            if bad {
                "not_found"
            } else if !ar.is_empty() {
                "found"
            } else {
                "partial"
            },
            js_slice(&evs.join("; "), 0, Some(200)),
        )
    };
    for (oi, o) in ix.ops.iter().enumerate() {
        if out.len() >= 16 {
            break;
        }
        let has = |k: &str| o.has(k);
        let acc = |role: &str| -> Option<String> {
            let re = regex::Regex::new(role).unwrap();
            let c = o.cpi.as_ref()?.borrow();
            let t = c
                .accounts
                .iter()
                .find(|x| {
                    x.role
                        .as_ref()
                        .is_some_and(|r| !r.is_empty() && re.is_match(r))
                })?
                .text
                .clone();
            name_of(Some(&t))
        };
        let cpi = o.cpi.as_ref().map(|c| c.borrow().clone());
        let known = cpi
            .as_ref()
            .is_some_and(|c| c.known.as_ref().is_some_and(|k| !k.is_empty()));
        let seeds = cpi
            .as_ref()
            .and_then(|c| c.seeds.clone())
            .filter(|s| !s.is_empty());
        let mut props: Vec<Option<Prop>> = Vec::new();
        let kind: String;
        if has("TOKEN_TRANSFER") {
            kind = "TOKEN_TRANSFER".into();
            let src = acc(r"^(source|from)");
            let dst = acc(r"^(destination|to)");
            let cix = cpi.as_ref().and_then(|c| c.ix.clone());
            let checked = cpi.as_ref().and_then(|c| c.checked.clone());
            props.push(auth_of(oi));
            props.push(stored(oi));
            props.push(prop(
                "source account bound",
                bound(src.as_deref(), &["token_owner"]),
                bound_ev(src.as_deref(), &["token_owner"]),
            ));
            props.push(prop(
                "destination bound (owner / mint / key)",
                bound(dst.as_deref(), &["token_owner", "token_mint"]),
                bound_ev(dst.as_deref(), &["token_owner", "token_mint"]),
            ));
            props.push(prop(
                "mints consistent",
                if cix.as_deref() == Some("Transfer") || cix.as_deref() == Some("TransferChecked") {
                    "runtime"
                } else {
                    "not_found"
                },
                "the token program requires source and destination of the same mint".into(),
            ));
            props.push(prop(
                "token program id",
                if known
                    || checked
                        .as_deref()
                        .is_some_and(|c| c.contains("(id compared with"))
                {
                    "found"
                } else {
                    "not_found"
                },
                if known {
                    format!("constant {}", cpi.as_ref().unwrap().program)
                } else {
                    checked.unwrap_or_else(|| "account-supplied".into())
                },
            ));
            props.push(amount(o, oi));
            props.push(dom(o));
        } else if has("MINT") || has("BURN") {
            kind = if has("MINT") {
                "MINT".into()
            } else {
                "BURN".into()
            };
            let auth = acc(r"authority|owner");
            let mint = acc(r"^mint");
            let dst = acc(r"^(account|destination|to)");
            props.push(prop(
                &format!(
                    "{} authority is a signer or PDA",
                    if kind == "MINT" { "mint" } else { "burn" }
                ),
                if seeds.is_some() {
                    "found"
                } else {
                    cst(auth.as_deref(), &["signer"])
                },
                match &seeds {
                    Some(s) => format!("PDA signature {s}"),
                    None => ev(auth.as_deref(), &["signer"]),
                },
            ));
            props.push(prop(
                "mint account bound",
                bound(mint.as_deref(), &[]),
                bound_ev(mint.as_deref(), &[]),
            ));
            props.push(prop(
                "token account bound",
                bound(dst.as_deref(), &["token_owner", "token_mint"]),
                bound_ev(dst.as_deref(), &["token_owner", "token_mint"]),
            ));
            props.push(amount(o, oi));
            props.push(dom(o));
        } else if has("LAMPORT_TRANSFER") || (has("LAMPORT_WRITE") && !has("ACCOUNT_CLOSE")) {
            kind = if has("LAMPORT_TRANSFER") {
                "LAMPORT_TRANSFER".into()
            } else {
                js_trim(&format!("LAMPORT_WRITE {}", o.how.unwrap_or(""))).to_string()
            };
            let lt = has("LAMPORT_TRANSFER");
            let from = if lt {
                acc(r"^from")
            } else if o.how == Some("-=") {
                name_of(o.target.as_deref())
            } else {
                None
            };
            let to = if lt {
                acc(r"^to")
            } else if o.how == Some("+=") {
                name_of(o.target.as_deref())
            } else {
                None
            };
            if from.as_ref().is_some_and(|s| !s.is_empty()) {
                props.push(prop(
                    "debited account authorized (signer / PDA / owned by the program)",
                    if seeds.is_some() {
                        "found"
                    } else if lt {
                        cst(from.as_deref(), &["signer"])
                    } else {
                        best_of(&[Some(cst(from.as_deref(), &["owner"])), Some("runtime")])
                    },
                    match &seeds {
                        Some(s) => format!("PDA signature {s}"),
                        None if lt => ev(from.as_deref(), &["signer"]),
                        None => "direct lamport debit: the runtime requires the program to own the account".into(),
                    },
                ));
            }
            if is_value_op(o) || lt {
                props.push(auth_of(oi));
            }
            if to.as_ref().is_some_and(|s| !s.is_empty()) {
                props.push(prop(
                    "recipient bound",
                    bound(to.as_deref(), &["signer"]),
                    bound_ev(to.as_deref(), &["signer"]),
                ));
            }
            props.push(amount(o, oi));
            props.push(dom(o));
        } else if has("ACCOUNT_CLOSE") {
            kind = "ACCOUNT_CLOSE".into();
            let t = name_of(o.target.as_deref()).or_else(|| acc(r"^account"));
            let (zeroed, revived) = close_zeroing(an, ix, oi);
            props.push(auth_of(oi));
            props.push(prop(
                "data zeroed / closed discriminator / owner reassigned",
                if zeroed.is_some() {
                    "found"
                } else if known {
                    "runtime"
                } else {
                    "not_found"
                },
                zeroed.clone().unwrap_or_else(|| {
                    if known {
                        format!("closed by {}", cpi.as_ref().unwrap().program)
                    } else {
                        format!(
                            "no zeroing, discriminator write, realloc(0) or assign of {} found in the instruction",
                            t.as_deref().filter(|s| !s.is_empty()).unwrap_or("the account")
                        )
                    }
                }),
            ));
            props.push(prop(
                "not reopened (no realloc after the close)",
                if revived.is_some() {
                    "not_found"
                } else {
                    "found"
                },
                revived.unwrap_or_else(|| "no realloc after it in the instruction".into()),
            ));
            props.push(dom(o));
        } else if has("AUTHORITY_WRITE") {
            kind = "AUTHORITY_WRITE".into();
            let src = o
                .sources
                .iter()
                .flatten()
                .find(|s| Some(&s.param) == o.target.as_ref());
            props.push(auth_of(oi));
            props.push(stored(oi));
            props.push(prop(
                "new value validated",
                match src {
                    None => "partial",
                    Some(s) if s.trust == "caller-controlled" => "not_found",
                    Some(s) if s.trust == "validated" => "found",
                    _ => "partial",
                },
                match src {
                    Some(s) => format!("{} ({})", s.source, s.trust),
                    None => format!("value {}", o.value.as_deref().unwrap_or("?")),
                },
            ));
            props.push(dom(o));
        } else if has("ACCOUNT_DATA_WRITE") {
            if out
                .iter()
                .filter(|p| p.kind == "ACCOUNT_DATA_WRITE")
                .count()
                >= 6
            {
                continue;
            }
            kind = "ACCOUNT_DATA_WRITE".into();
            let t = name_of(o.target.as_deref());
            let sig = ix.accounts.iter().any(|x| x.has("signer"));
            let gate: Vec<&super::report::CheckOut> = o
                .guards
                .iter()
                .flatten()
                .map(|i| &ix.checks[*i])
                .filter(|c| {
                    c.kinds.iter().any(|x| {
                        [
                            "signer", "has_one", "key", "address", "pda", "custom", "state", "raw",
                        ]
                        .contains(x)
                    })
                })
                .collect();
            props.push(prop(
                "account owned by the program",
                best_of(&[Some(cst(t.as_deref(), &["owner"])), Some("runtime")]),
                "data written: the runtime rejects writes by a non-owner program".into(),
            ));
            props.push(prop(
                "account type (discriminator)",
                cst(t.as_deref(), &["discriminator"]),
                ev(t.as_deref(), &["discriminator"]),
            ));
            props.push(prop(
                "write gated (signer / constraint)",
                if !gate.is_empty() {
                    "found"
                } else if sig {
                    "partial"
                } else {
                    "not_found"
                },
                if !gate.is_empty() {
                    gate.iter()
                        .take(3)
                        .map(|c| {
                            format!(
                                "{} {} {}:{}",
                                c.kinds.join("/"),
                                c.account.as_deref().unwrap_or(""),
                                c.at.fn_,
                                c.at.line
                            )
                        })
                        .collect::<Vec<_>>()
                        .join("; ")
                } else if sig {
                    "a signer is checked, but no gating check found to dominate the write".into()
                } else {
                    "no signer and no gating constraint found".into()
                },
            ));
            props.push(amount(o, oi));
        } else if has("CPI") && cpi.as_ref().is_some_and(|c| !known && c.program != "?") {
            kind = "CPI (account-supplied program)".into();
            let c = cpi.as_ref().unwrap();
            props.push(prop(
                "program id checked",
                if c.checked
                    .as_deref()
                    .is_some_and(|x| x.contains("(id compared with"))
                {
                    "found"
                } else {
                    "not_found"
                },
                c.checked.clone().unwrap_or_else(|| "no check found".into()),
            ));
            props.push(prop(
                "no PDA signature lent to it",
                if seeds.is_some() {
                    "not_found"
                } else {
                    "found"
                },
                match &c.seeds {
                    Some(s) if !s.is_empty() => format!("signs with {s}"),
                    _ => "no signer seeds".into(),
                },
            ));
            props.push(dom(o));
        } else {
            continue;
        }
        out.push(Proof {
            op: oi,
            kind,
            props: props.into_iter().flatten().collect(),
        });
    }
    out
}

