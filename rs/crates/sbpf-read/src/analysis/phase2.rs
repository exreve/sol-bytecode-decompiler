//! Phase 2 (`src/analysis/phase2.ts`): dominance of the checks over the operations (across calls), trust rows,
//! parameter sources, relations, stored keys, authority rows, the rule engine; it runs phase 3 / audit /
//! consistency on the way.

use super::flow::*;
use super::ixctx::IxCtx;
use super::report::{CheckOut, Loc, OpOut};
use super::An;
use sbpf_ir::CallTarget;
use std::collections::HashSet;

#[derive(Clone, Debug)]
pub struct TrustRow {
    pub value: String,
    pub trust: &'static str,
    pub evidence: Vec<String>,
}

#[derive(Clone, Debug)]
pub struct Relation {
    pub a: String,
    pub b: String,
    pub kind: &'static str,
    pub status: &'static str,
    pub at: Loc,
    pub negated: Option<bool>,
}

#[derive(Clone, Debug)]
pub struct StoredKeys {
    pub account: String,
    pub ty: Option<String>,
    pub compared: Vec<String>,
    pub referenced_by: Vec<String>,
    pub never: Vec<String>,
    pub gaps: Vec<String>,
}

#[derive(Clone, Debug)]
pub struct Enabler {
    pub kind: &'static str,
    pub what: String,
    pub status: Option<&'static str>,
    pub written_by: Option<Vec<String>>,
}

#[derive(Clone, Debug)]
pub struct AuthorityRow {
    pub op: usize,
    pub kind: String,
    pub enabled_by: Vec<Enabler>,
}

#[derive(Clone, Debug)]
pub struct Finding {
    pub rule: &'static str,
    pub title: &'static str,
    pub ix: String,
    pub accounts: Vec<String>,
    pub path: Vec<String>,
    pub evidence: Vec<String>,
    pub confidence: &'static str,
    pub weight: f64,
}

const VALUE: &[&str] = &[
    "TOKEN_TRANSFER",
    "LAMPORT_TRANSFER",
    "MINT",
    "BURN",
    "ACCOUNT_CLOSE",
    "OWNER_ASSIGN",
    "PROGRAM_UPGRADE",
];
pub const GUARD_KINDS: &[&str] = &[
    "signer",
    "owner",
    "key",
    "address",
    "has_one",
    "pda",
    "custom",
    "discriminator",
    "state",
];

pub fn is_sensitive(o: &OpOut) -> bool {
    o.kinds.iter().any(|k| *k != "PDA_DERIVE")
}

pub fn is_value_or_auth(o: &OpOut) -> bool {
    o.kinds
        .iter()
        .any(|k| VALUE.contains(k) || *k == "AUTHORITY_WRITE")
        || (o.has("LAMPORT_WRITE") && o.how == Some("-="))
}

/// a check that reads like a signer / owner / key binding (for check-bypassable)
pub fn binding_shaped(c: &CheckOut) -> bool {
    if crate::jre!(r"Signer|Owner|HasOne|Address|Seeds|KeyMismatch|IncorrectProgramId|MissingRequiredSignature|IllegalOwner")
        .is_match(&c.error)
    {
        return true;
    }
    let t = &c.cond;
    let eq_fail = if c.fails_if {
        crate::jre!(r"^(memeq|keyeq)\(|^[^!=<>&|]+ == [^=&|]+$").is_match(t)
    } else {
        crate::jre!(r"^!(memeq|keyeq)\(|^[^!=<>&|]+ != [^=&|]+$").is_match(t)
    };
    if eq_fail {
        return false;
    }
    let has = |k: &str| c.kinds.contains(&k);
    (has("signer") && t.contains("is_signer"))
        || (c
            .kinds
            .iter()
            .any(|k| ["owner", "key", "address", "has_one", "pda"].contains(k))
            && crate::jre!(r"memeq|keyeq|memcmp|\.key\b|\.owner\b|owner\[|key\[").is_match(t))
        || (c.sides.is_some() && !has("signer"))
}

/// the accounts an operation names (target, CPI accounts)
pub fn op_accounts(o: &OpOut) -> indexmap::IndexSet<String> {
    let mut s = indexmap::IndexSet::new();
    if let Some(t) = &o.target {
        s.insert(t.split('.').next().unwrap_or("").to_string());
    }
    if let Some(c) = &o.cpi {
        for a in &c.borrow().accounts {
            if let Some(m) = crate::jre!(r"^\*?([A-Za-z_]\w*)").captures(&a.text) {
                s.insert(m[1].to_string());
            }
            if let Some(r) = a.role.as_ref().filter(|r| !r.is_empty()) {
                s.insert(r.clone());
            }
        }
    }
    s
}

#[derive(Clone, Copy, Debug)]
struct Site {
    fn_: i64,
    b: usize,
    pc: f64,
}

impl<'a> An<'a> {
    /// phase2(a, r) up to the rule findings (before the incident rules)
    pub fn phase2<'x>(
        &'x self,
        _a: &mut super::report::Analysis,
        _infos: &'x [super::ixctx::IxInfo<'a>],
        _srcs: &[std::cell::OnceCell<super::sources::SourceCtx<'a, 'x>>],
    ) {
    }

    fn block_of(&self, fn_: i64, pc: Option<i64>, ret: Option<E>) -> Option<usize> {
        self.fo(fn_)?;
        let g = self.cfg(fn_);
        match (pc, ret) {
            (Some(pc), _) => g.pc_block.get(&pc).copied(),
            (None, Some(r)) => g.ret_block.get(&r).copied(),
            _ => None,
        }
    }

    fn chain_up(&self, ctx: &IxCtx<'a>, fn_: i64, first: Option<Site>) -> Vec<Site> {
        let mut out: Vec<Site> = first.into_iter().collect();
        let mut x = fn_;
        let mut k = 0;
        while x != ctx.handler && k < 16 {
            let Some(p) = ctx.parents.get(&x).copied() else {
                break;
            };
            let Some(b) = self.block_of(p.fn_, p.pc, p.ret) else {
                break;
            };
            out.push(Site {
                fn_: p.fn_,
                b,
                pc: p.pc.map_or(f64::INFINITY, |v| v as f64),
            });
            x = p.fn_;
            k += 1;
        }
        out
    }

    fn dom_site(&self, ctx: &IxCtx<'a>, fn_: i64, a: Site, b: Site) -> bool {
        let g = self.cfg(fn_);
        if a.b == b.b {
            return a.pc < b.pc;
        }
        if !ctx.restricted.as_ref().is_some_and(|r| r.contains(&fn_)) {
            return dominates(&g, a.b, b.b);
        }
        let idom = self.idom_of(fn_, Some(ctx)).unwrap();
        if idom[b.b] < 0 {
            return true;
        }
        let mut x = b.b;
        for _ in 0..100000 {
            if x == a.b {
                return true;
            }
            if x == 0 || idom[x] < 0 {
                return false;
            }
            x = idom[x] as usize;
        }
        false
    }

    /// Which checks dominate which operations (phase2.ts dominance): guards, statuses, bypass paths.
    pub fn dominance(&self, checks: &mut [CheckOut], ops: &mut [OpOut], ctx: &IxCtx<'a>) {
        let site_of: Vec<Vec<Site>> = checks
            .iter()
            .map(|c| {
                if self.fo(c.fn_pc).is_none() {
                    return vec![];
                }
                let g = self.cfg(c.fn_pc);
                let Some(b) = decision_block(&g, c.c, c.at.pc, c.pass_pc) else {
                    return vec![];
                };
                let own = Site {
                    fn_: c.fn_pc,
                    b,
                    pc: f64::INFINITY,
                };
                if c.main && c.fn_pc != ctx.handler {
                    self.chain_up(ctx, c.fn_pc, Some(own))
                } else {
                    vec![own]
                }
            })
            .collect();
        let points_of: Vec<Vec<Site>> = ops
            .iter()
            .map(|o| {
                let Some(f) = o.fn_pc else { return vec![] };
                let b = self.block_of(f, o.at.pc, o.ret);
                self.chain_up(
                    ctx,
                    f,
                    b.map(|b| Site {
                        fn_: f,
                        b,
                        pc: o.at.pc.map_or(f64::INFINITY, |v| v as f64),
                    }),
                )
            })
            .collect();
        let doms = |ci: usize, oi: usize| -> bool {
            for s in &site_of[ci] {
                for p in &points_of[oi] {
                    if p.fn_ == s.fn_ && self.dom_site(ctx, s.fn_, *s, *p) {
                        return true;
                    }
                }
            }
            false
        };
        let sens: Vec<usize> = (0..ops.len())
            .filter(|&i| is_sensitive(&ops[i]) && !points_of[i].is_empty())
            .collect();
        for &oi in &sens {
            ops[oi].guards = Some(vec![]);
        }
        for ci in 0..checks.len() {
            if site_of[ci].is_empty() || sens.is_empty() {
                continue;
            }
            let mut n = 0;
            for &oi in &sens {
                if doms(ci, oi) {
                    n += 1;
                    ops[oi].guards.as_mut().unwrap().push(ci);
                }
            }
            checks[ci].status = if n == sens.len() { "found" } else { "partial" };
        }
        let facts = self.facts.borrow();
        for &oi in &sens {
            if !is_value_or_auth(&ops[oi]) {
                continue;
            }
            let accts = op_accounts(&ops[oi]);
            let guards = ops[oi].guards.clone().unwrap();
            let cand: Vec<usize> = (0..checks.len())
                .filter(|&ci| {
                    let c = &checks[ci];
                    !guards.contains(&ci)
                        && c.kinds.iter().any(|k| GUARD_KINDS.contains(k))
                        && binding_shaped(c)
                        && (c.kinds.contains(&"signer")
                            || c.account.as_ref().is_some_and(|a| {
                                !a.is_empty() && accts.contains(a.strip_suffix('?').unwrap_or(a))
                            }))
                        && !points_of[oi].iter().any(|p| {
                            site_of[ci].iter().any(|s| {
                                s.fn_ == p.fn_ && s.b != p.b && self.dom_site(ctx, s.fn_, *p, *s)
                            })
                        })
                })
                .collect();
            for &ci in cand.iter().take(3) {
                for (si, s) in site_of[ci].iter().enumerate() {
                    let Some(p) = points_of[oi].iter().find(|x| x.fn_ == s.fn_).copied() else {
                        continue;
                    };
                    let g = self.cfg(s.fn_);
                    let child = if si > 0 {
                        Some(site_of[ci][si - 1].fn_)
                    } else {
                        None
                    };
                    let mut calls: HashSet<usize> = HashSet::new();
                    if let Some(child) = child {
                        let ir = fir(g.f);
                        for (bi, bl) in g.f.blocks.iter().enumerate() {
                            if bi != s.b
                                && bl.stmts.iter().any(|st| {
                                    matches!(call_of(ir, st), Some((CallTarget::Fn { pc }, _)) if pc == child)
                                })
                            {
                                calls.insert(bi);
                            }
                        }
                    }
                    let sfn = s.fn_;
                    let has_al = ctx.grp.is_some();
                    let al0 = |b: usize| ctx.allowed(sfn, b).unwrap_or(true);
                    let al = |b: usize| !calls.contains(&b) && (!has_al || al0(b));
                    let al0_d: Option<&dyn Fn(usize) -> bool> =
                        if has_al { Some(&al0) } else { None };
                    let al_d: Option<&dyn Fn(usize) -> bool> =
                        if !calls.is_empty() { Some(&al) } else { al0_d };
                    if s.b == p.b || !reaches(&g, s.b, p.b, al0_d) {
                        continue;
                    }
                    let Some(path) = bypass(&g, s.b, p.b, al_d) else {
                        continue;
                    };
                    let ff = facts.get(&s.fn_);
                    let mut locs: Vec<Loc> = Vec::new();
                    for &b in &path {
                        let pc = block_pc(&g, b);
                        let line = ff.and_then(|f| f.pc_line.get(&pc).copied());
                        if let Some(line) = line {
                            if locs.last().is_none_or(|l| l.line != line) {
                                locs.push(Loc {
                                    fn_: ff.unwrap().name.clone(),
                                    line,
                                    pc: Some(pc),
                                });
                            }
                        }
                    }
                    let short: Vec<Loc> = if locs.len() > 6 {
                        locs[..3]
                            .iter()
                            .chain(locs[locs.len() - 3..].iter())
                            .cloned()
                            .collect()
                    } else {
                        locs
                    };
                    let c0 = &checks[ci];
                    let same = |c: &CheckOut| {
                        if c0.kinds.contains(&"signer") {
                            c.kinds.contains(&"signer")
                        } else {
                            c.account.as_ref().is_some_and(|a| !a.is_empty())
                                && c.account == c0.account
                                && c.kinds.iter().any(|k| GUARD_KINDS.contains(k))
                        }
                    };
                    let mut others: HashSet<usize> = HashSet::new();
                    for (cj, c) in checks.iter().enumerate() {
                        if same(c) {
                            for x in &site_of[cj] {
                                if x.fn_ == s.fn_ {
                                    others.insert(x.b);
                                }
                            }
                        }
                    }
                    let al_s = |b: usize| !others.contains(&b) && al_d.is_none_or(|f| f(b));
                    let strong =
                        !others.contains(&p.b) && bypass(&g, s.b, p.b, Some(&al_s)).is_some();
                    ops[oi]
                        .bypass
                        .get_or_insert_with(Vec::new)
                        .push(super::report::Bypass {
                            check: ci,
                            path: short,
                            strong,
                        });
                    break;
                }
            }
        }
    }
}

use sbpf_ir::E;
