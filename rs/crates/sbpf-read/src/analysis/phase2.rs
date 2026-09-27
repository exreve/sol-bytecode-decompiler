//! Phase 2 (`src/analysis/phase2.ts`): dominance of the checks over the operations (across calls), trust rows,
//! parameter sources, relations, stored keys, authority rows, the rule engine; it runs phase 3 / audit /
//! consistency on the way.

use super::flow::*;
use super::ixctx::IxCtx;
use super::report::{CheckOut, Loc, OpOut};
use super::An;
use sbpf_ir::CallTarget;
use std::collections::{HashMap, HashSet};

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
        a: &mut Analysis,
        infos: &'x [IxInfo<'a>],
        srcs: &'x [OnceCell<SourceCtx<'a, 'x>>],
    ) {
        let mut findings: Vec<Finding> = Vec::new();
        // stored authority field -> instructions writing it
        let mut auth_fields: IndexMap<String, Vec<String>> = IndexMap::new();
        for (t, ws) in &a.state_writes {
            let is_auth = a.ixs.iter().any(|ix| {
                ix.ops
                    .iter()
                    .any(|o| o.target.as_ref() == Some(t) && o.has("AUTHORITY_WRITE"))
            });
            if is_auth {
                let mut l: Vec<String> = Vec::new();
                for w in ws {
                    if !l.contains(&w.ix) {
                        l.push(w.ix.clone());
                    }
                }
                auth_fields.insert(t.clone(), l);
            }
        }
        for xi in 0..a.ixs.len() {
            let ii = a.ixs[xi].info;
            let s = srcs[ii].get_or_init(|| self.source_ctx(&infos[ii]));
            self.phase2_ix(a, xi, s, &auth_fields);
        }
        // phase 3 views (after every instruction's authority rows: the chains follow the writers), then the rules
        for xi in 0..a.ixs.len() {
            let ii = a.ixs[xi].info;
            let s = srcs[ii].get_or_init(|| self.source_ctx(&infos[ii]));
            self.phase3_ix(a, xi, &infos[ii], s);
            let au = self.audit_ix(&a.ixs[xi], &infos[ii], s);
            a.ixs[xi].audit = Some(au);
        }
        a.states = Some(self.state_machine(a));
        a.consistency = Some(self.consistency(a));
        a.authority_fields = Some(auth_fields.into_iter().collect());
        for xi in 0..a.ixs.len() {
            let fs = self.rules(a, xi, &infos[a.ixs[xi].info]);
            findings.extend(fs);
        }
        a.rule_findings = findings.clone();
        let memo = super::incidents::IncMemo::default();
        let inc = self.incident_findings(a, infos, srcs, &mut findings, &memo);
        findings.extend(inc);
        // (native: one finding at one place found by several arms of a dispatcher: the first instruction's, naming the
        // others; inside the dispatcher itself from two arms on, elsewhere from three)
        let mut arm_of: HashMap<&str, Option<String>> = HashMap::new();
        for ix in &a.ixs {
            let d = ix.dispatch.as_deref().unwrap_or("");
            arm_of.insert(
                ix.name.as_str(),
                crate::jre!(r"matched in (\w+)")
                    .captures(d)
                    .map(|m| m[1].to_string()),
            );
        }
        let mut groups: IndexMap<String, Vec<usize>> = IndexMap::new();
        for (i, f) in findings.iter().enumerate() {
            let Some(Some(d)) = arm_of.get(f.ix.as_str()) else {
                continue;
            };
            if f.path.is_empty() {
                continue;
            }
            groups
                .entry(format!("{}|{}|{}", f.rule, f.path.join(","), d))
                .or_default()
                .push(i);
        }
        let mut drop: HashSet<usize> = HashSet::new();
        for (k, g) in &groups {
            let d = &k[k.rfind('|').unwrap() + 1..];
            let pre = format!("{d}:");
            let min = if findings[g[0]].path.iter().all(|p| p.starts_with(&pre)) {
                2
            } else {
                3
            };
            if g.len() < min {
                continue;
            }
            for &i in &g[1..] {
                drop.insert(i);
            }
            let names: Vec<&str> = g[1..g.len().min(6)]
                .iter()
                .map(|&i| findings[i].ix.as_str())
                .collect();
            let e = format!(
                "the same place in {} instructions of the dispatcher: {}{}",
                g.len(),
                names.join(", "),
                if g.len() > 6 { ", …" } else { "" }
            );
            let names_owned = e;
            findings[g[0]].evidence.push(names_owned);
        }
        let mut findings: Vec<Finding> = findings
            .into_iter()
            .enumerate()
            .filter(|(i, _)| !drop.contains(i))
            .map(|x| x.1)
            .collect();
        a.fund_movers = Some(self.fund_movers(a, infos));
        let rank = |c: &str| match c {
            "high" => 3.0,
            "medium" => 2.0,
            "low" => 1.0,
            _ => 0.0,
        };
        findings.sort_by(|x, y| {
            let d = (rank(y.confidence) * 10.0 + y.weight) - (rank(x.confidence) * 10.0 + x.weight);
            if d != 0.0 && !d.is_nan() {
                d.partial_cmp(&0.0).unwrap()
            } else {
                super::locale_cmp(&x.ix, &y.ix)
            }
        });
        a.findings = findings;
    }

    /// trust, the known-program CPIs, CpiContext accounts, parameter sources, relations, stored keys, authority
    fn phase2_ix(
        &self,
        a: &mut Analysis,
        xi: usize,
        s: &SourceCtx<'a, '_>,
        auth_fields: &IndexMap<String, Vec<String>>,
    ) {
        let anchor = self.anchor;
        let names: HashSet<String> = a.ixs[xi].accounts.iter().map(|x| x.name.clone()).collect();
        let acct_of = |t: &str| -> Option<String> {
            let m = crate::jre!(r"^\*?([A-Za-z_]\w*(?:\[\d+\])?)").captures(t)?;
            let n = m[1].to_string();
            if names.contains(&n) {
                Some(n)
            } else {
                None
            }
        };
        // trust
        let mut trust: Vec<TrustRow> = Vec::new();
        {
            let ix = &a.ixs[xi];
            let ev = |x: &AcctOut, ks: &[&str]| -> Vec<String> {
                ks.iter()
                    .filter_map(|k| {
                        let c = x.constraints.get(k)?;
                        if c.status == "not_found" {
                            return None;
                        }
                        Some(format!(
                            "{k} {}{}",
                            c.status,
                            c.at.as_ref()
                                .map_or(String::new(), |at| format!(" @{}:{}", at.fn_, at.line))
                        ))
                    })
                    .collect()
            };
            let st = |x: &AcctOut, ks: &[&str]| -> &'static str {
                let ss: Vec<&str> = ks
                    .iter()
                    .filter_map(|k| x.constraints.get(k).map(|c| c.status))
                    .collect();
                if ss.contains(&"found") {
                    "validated"
                } else if ss.contains(&"runtime") {
                    "runtime"
                } else if ss.contains(&"partial") {
                    "partially-validated"
                } else {
                    "caller-controlled"
                }
            };
            for x in &ix.accounts {
                let kk = ["address", "pda", "key", "has_one"];
                trust.push(TrustRow {
                    value: format!("{}.key", x.name),
                    trust: st(x, &kk),
                    evidence: ev(x, &kk),
                });
                let data_t = st(x, &["owner"]);
                trust.push(TrustRow {
                    value: format!("{}.data", x.name),
                    trust: if data_t == "validated"
                        && !x.constraints.contains_key("discriminator")
                        && !x.constraints.contains_key("initialized")
                        && anchor
                    {
                        "partially-validated"
                    } else {
                        data_t
                    },
                    evidence: ev(x, &["owner", "discriminator", "initialized"]),
                });
            }
        }
        let args: Vec<String> = self
            .instructions
            .iter()
            .find(|i| i.name == a.ixs[xi].name)
            .and_then(|i| i.args.clone())
            .unwrap_or_default()
            .iter()
            .map(|s| super::js_trim(s.split(':').next().unwrap_or("")).to_string())
            .collect();
        for g in &args {
            trust.push(TrustRow {
                value: format!("ix.{g}"),
                trust: "caller-controlled",
                evidence: vec!["instruction data".into()],
            });
        }
        let trust_of = |v: &str| trust.iter().find(|t| t.value == v).map(|t| t.trust);
        let classify = |text: &str| -> Vec<(String, &'static str)> {
            let mut out: Vec<(String, &'static str)> = Vec::new();
            if text.contains("[ix data?]") {
                out.push(("instruction data".into(), "caller-controlled"));
            }
            for g in &args {
                let re =
                    regex::Regex::new(&format!(r"(?-u:\b){}(?-u:\b)", regex::escape(g))).unwrap();
                if re.is_match(text) {
                    out.push((format!("ix.{g}"), "caller-controlled"));
                }
            }
            for m in acct_ref().captures_iter(text) {
                let Some(acct) = acct_of(&m[1]) else { continue };
                let v = if &m[2] == "key" {
                    format!("{acct}.key")
                } else {
                    format!("{acct}.data")
                };
                let src = if &m[2] == "key" {
                    format!("{acct}.key")
                } else {
                    format!("{acct}.{}", &m[2])
                };
                out.push((src, trust_of(&v).unwrap_or("caller-controlled")));
            }
            if out.is_empty() {
                if let Some(bare) = acct_of(super::js_trim(text)) {
                    out.push((
                        format!("{bare}.key"),
                        trust_of(&format!("{bare}.key")).unwrap_or("caller-controlled"),
                    ));
                }
            }
            let mut u: Vec<(String, &'static str)> = Vec::new();
            for x in out {
                if !u.iter().any(|y| y.0 == x.0) {
                    u.push(x);
                }
            }
            u
        };
        // (a CPI whose program id the printed text does not name: the instruction built up the call path)
        for oi in 0..a.ixs[xi].ops.len() {
            let o = &a.ixs[xi].ops[oi];
            let (Some(cpi), Some(fnpc), Some(apc)) = (&o.cpi, o.fn_pc, o.at.pc) else {
                continue;
            };
            if cpi.borrow().known.as_ref().is_some_and(|k| !k.is_empty()) {
                continue;
            }
            let Some((sb, si)) = self.stmt_at(fnpc, apc) else {
                continue;
            };
            let f = self.fo(fnpc).unwrap().f;
            let ir = fir(f);
            let Some((t, cargs)) = call_of(ir, &f.blocks[sb].stmts[si]) else {
                continue;
            };
            let nm = match &t {
                CallTarget::Sys { name, .. } => name.to_string(),
                _ => String::new(),
            };
            if cargs.len == 0 || !crate::jre!(r"^sol_invoke_signed_(c|rust)$").is_match(&nm) {
                continue;
            }
            let a0 = ir.at(cargs, 0);
            let sp = pos_of(sb, si);
            let w = |k: u64| ir.load(8, ir.bin(BinOp::Add, a0, ir.c(k)));
            let id = if nm.ends_with("rust") {
                s.bytes_at(fnpc, ir.bin(BinOp::Add, a0, ir.c(48)), sp, 32)
            } else {
                s.bytes_at(fnpc, w(0), sp, 32)
            };
            let known: Option<String> = id.and_then(|id| {
                if id.iter().all(|x| *x == 0) {
                    Some("SYSTEM_PROGRAM".to_string())
                } else {
                    crate::sem::known_key(&crate::util::b58(&id)).map(|s| s.to_string())
                }
            });
            let Some(known) = known.filter(|k| !k.is_empty()) else {
                continue;
            };
            let data = s
                .bytes_at(fnpc, w(24), sp, 4)
                .or_else(|| s.bytes_at(fnpc, w(24), sp, 1));
            let k = data.and_then(|d| crate::cpi::known_ix(&known, &d));
            let mut nc = cpi.borrow().clone();
            nc.program = known.clone();
            nc.known = Some(known.clone());
            nc.checked = None;
            if let Some((fam, ixn, roles)) = k {
                nc.family = Some(fam.to_string());
                nc.ix = Some(ixn.to_string());
                for (i, x) in nc.accounts.iter_mut().enumerate() {
                    x.ord.ensure(0);
                    if x.role.is_none() {
                        x.role = roles.get(i).map(|r| r.to_string());
                    }
                }
            }
            let o = &mut a.ixs[xi].ops[oi];
            o.cpi = Some(Rc::new(RefCell::new(nc)));
            if let Some((fam, ixn, _)) = k {
                let mut ks = o.kinds.clone();
                for x in cpi_kinds(fam, ixn) {
                    if !ks.contains(&x) {
                        ks.push(x);
                    }
                }
                o.kinds = ks;
            }
        }
        // (Anchor CPI helpers: the accounts of the CpiContext not named by the printed text, by the AccountInfo copies'
        // key words; in place: the object is shared)
        if anchor {
            for o in &a.ixs[xi].ops {
                let (Some(cpi), Some(fnpc), Some(apc)) = (&o.cpi, o.fn_pc, o.at.pc) else {
                    continue;
                };
                {
                    let c = cpi.borrow();
                    if !c.family.as_ref().is_some_and(|f| !f.is_empty())
                        || !c.accounts.iter().any(|x| x.text == "?")
                    {
                        continue;
                    }
                }
                let st = self.stmt_at(fnpc, apc);
                let f = self.fo(fnpc).unwrap().f;
                let ir = fir(f);
                let c = st.and_then(|(b, i)| call_of(ir, &f.blocks[b].stmts[i]));
                let y = match c {
                    Some((_, args)) if args.len > 1 => {
                        self.defs_in(fnpc).and_then(|d| d.fp_off(ir.at(args, 1)))
                    }
                    _ => None,
                };
                let Some(y) = y else { continue };
                let (sb, si) = st.unwrap();
                let accs = cpi.borrow().accounts.clone();
                let accs: Vec<PartAcc> = accs
                    .into_iter()
                    .enumerate()
                    .map(|(i, x)| {
                        if x.text != "?" {
                            x
                        } else {
                            let mut x = x;
                            x.text = s
                                .frame_account(
                                    fnpc,
                                    y + 0x18 as f64 + 0x30 as f64 * (i + 1) as f64,
                                    pos_of(sb, si),
                                )
                                .unwrap_or_else(|| "?".into());
                            x
                        }
                    })
                    .collect();
                cpi.borrow_mut().accounts = accs;
            }
        }
        let trust_src = |x: &Source| -> &'static str {
            match x.kind {
                "ix" | "remaining" => "caller-controlled",
                "sysvar" | "lamports" | "owner" => "runtime",
                "return-data" => "partially-validated",
                _ => {
                    let v = if x.kind == "key" {
                        format!("{}.key", x.acct.as_deref().unwrap_or("undefined"))
                    } else {
                        format!("{}.data", x.acct.as_deref().unwrap_or("undefined"))
                    };
                    trust_of(&v).unwrap_or("caller-controlled")
                }
            }
        };
        for oi in 0..a.ixs[xi].ops.len() {
            if !is_sensitive(&a.ixs[xi].ops[oi]) {
                continue;
            }
            let o = a.ixs[xi].ops[oi].clone();
            let fnpc = o.fn_pc;
            let pos = fnpc.and_then(|f| self.pos_at(f, o.at.pc, o.ret));
            let call = match (fnpc, o.at.pc) {
                (Some(f), Some(pc)) => self.stmt_at(f, pc),
                _ => None,
            };
            let fsrc = fnpc.and_then(|f| self.fo(f)).map(|x| x.f);
            let call_stmt = call.map(|(b, i)| &fsrc.unwrap().blocks[b].stmts[i]);
            let ir = fsrc.map(fir);
            let cargs: Option<Vec<E>> = call_stmt
                .and_then(|st| call_of(ir.unwrap(), st))
                .map(|(_, l)| ir.unwrap().to_vec(l));
            let has_facts = fnpc.is_some_and(|f| self.facts.borrow().contains_key(&f));
            let printed = |v: &str| -> Option<E> {
                if !has_facts {
                    return None;
                }
                let want = v.strip_suffix(" [ix data?]").unwrap_or(v);
                cargs
                    .as_ref()?
                    .iter()
                    .copied()
                    .find(|a| (self.expr)(fnpc.unwrap(), *a).as_deref() == Some(want))
            };
            let mut params: Vec<(String, String, Option<E>)> = Vec::new();
            if let Some(c) = &o.cpi {
                let c = c.borrow();
                let cs = c.src.as_ref();
                if !c.known.as_ref().is_some_and(|k| !k.is_empty()) && c.program != "?" {
                    params.push((
                        "program".into(),
                        c.program.clone(),
                        cs.and_then(|s| s.program),
                    ));
                }
                for (i, x) in c.accounts.iter().enumerate() {
                    params.push((
                        x.role.clone().unwrap_or_else(|| "account".into()),
                        x.text.clone(),
                        cs.and_then(|s| s.accounts.get(i).copied().flatten()),
                    ));
                }
                for (i, (k, v)) in c.fields.iter().enumerate() {
                    let e = cs
                        .and_then(|s| s.fields.get(i).copied().flatten())
                        .or_else(|| printed(v));
                    params.push((k.clone(), v.clone(), e));
                }
                if let Some(sd) = c.seeds.as_ref().filter(|s| !s.is_empty()) {
                    params.push(("signer seeds".into(), sd.clone(), None));
                }
            }
            if let Some(p) = &o.pda {
                params.push(("seeds".into(), p.seeds.clone(), None));
            }
            let cp = match call_stmt {
                Some(Stmt::Copy { src, .. }) => Some(*src),
                _ => None,
            };
            if let (Some(v), Some(t)) = (&o.value, &o.target) {
                let e = match (fnpc, o.at.pc) {
                    (Some(f), Some(pc)) => self
                        .stored_at(f, pc)
                        .map(|x| x.0)
                        .or_else(|| cp.map(|src| ir.unwrap().load(8, src))),
                    _ => None,
                };
                params.push((t.clone(), v.clone(), e));
            }
            let mut src: Vec<SrcRow> = Vec::new();
            for (p, t, e) in &params {
                let irs = match (e, fnpc, pos) {
                    (Some(e), Some(f), Some(pos)) => Some(s.of(f, *e, pos)),
                    _ => None,
                };
                match irs {
                    Some(l) if !l.is_empty() => {
                        for x in &l {
                            src.push(SrcRow {
                                param: p.clone(),
                                source: x.source.clone(),
                                trust: trust_src(x),
                            });
                        }
                    }
                    _ => {
                        for (so, tr) in classify(t) {
                            src.push(SrcRow {
                                param: p.clone(),
                                source: so,
                                trust: tr,
                            });
                        }
                    }
                }
            }
            // (a CPI whose program the printed text does not trace: the key its program_id is copied from)
            let ic: Option<Vec<E>> = if call.is_some() {
                cargs.clone()
            } else {
                o.ret.and_then(|r| self.invoke_call(fsrc.unwrap(), r))
            };
            let unknown = o
                .cpi(|c| !c.known.as_ref().is_some_and(|k| !k.is_empty()))
                .unwrap_or(false);
            if unknown && !src.iter().any(|x| x.param == "program") {
                if let (Some(f), Some(pos), Some(ic)) = (fnpc, pos, &ic) {
                    let ir = ir.unwrap();
                    let ld = |a: E, k: u64| ir.load(8, ir.bin(BinOp::Add, a, ir.c(k)));
                    let mut hits: Vec<Source> = Vec::new();
                    for &a0 in ic {
                        let ks: Vec<Source> = s
                            .of(f, ld(a0, 0x30), pos)
                            .into_iter()
                            .filter(|x| x.kind == "key" || x.kind == "remaining")
                            .collect();
                        if ks.len() == 1
                            && ks[0].source.ends_with(".key")
                            && !s.of(f, ld(a0, 0), pos).iter().any(|x| x.kind == "key")
                        {
                            hits.push(ks[0].clone());
                        }
                    }
                    if hits.len() == 1 {
                        src.push(SrcRow {
                            param: "program".into(),
                            source: hits[0].source.clone(),
                            trust: trust_src(&hits[0]),
                        });
                    }
                }
            }
            let mut uniq: Vec<SrcRow> = Vec::new();
            for x in src {
                if !uniq
                    .iter()
                    .any(|y| y.param == x.param && y.source == x.source)
                {
                    uniq.push(x);
                }
            }
            if !uniq.is_empty() {
                uniq.truncate(24);
                a.ixs[xi].ops[oi].sources = Some(uniq);
            }
            // (a debit of the account's whole balance: its lamports drained, a close)
            if o.has("LAMPORT_WRITE")
                && !o.has("ACCOUNT_CLOSE")
                && o.target.as_ref().is_some_and(|t| t.ends_with(".lamports"))
                && fnpc.is_some()
                && o.at.pc.is_some()
            {
                let f = fnpc.unwrap();
                let sv = self.stored_at(f, o.at.pc.unwrap());
                let (mut e, mut q) = match sv {
                    Some((e, p)) => (Some(e), p),
                    None => (None, 0),
                };
                let d = self.defs_in(f);
                let ir = ir.unwrap();
                let def_step = |id: u32, q: Pos| -> Option<(E, Pos)> {
                    let d = d.as_ref()?;
                    if let Some(&x) = d.defs.get(&id) {
                        Some((x, d.def_pos[&id]))
                    } else if d.multi.contains(&id) {
                        d.reaching(&self.fl, id as f64, q, false)
                    } else {
                        None
                    }
                };
                let mut k = 0;
                while k < 4 && d.is_some() {
                    let Some(ee) = e else { break };
                    let Node::Var(id) = ir.get(ee) else { break };
                    let Some(y) = def_step(id, q) else { break };
                    e = Some(y.0);
                    q = y.1;
                    k += 1;
                }
                if let Some(Node::Bin(BinOp::Sub, ea, eb)) = e.map(|e| ir.get(e)) {
                    let t = o.target.as_ref().unwrap();
                    let t = &t[..t.len() - ".lamports".len()];
                    let bal = |x: E| {
                        let ss = s.of(f, x, q);
                        !ss.is_empty()
                            && ss
                                .iter()
                                .all(|y| y.kind == "lamports" && y.acct.as_deref() == Some(t))
                    };
                    let def1 = |x: E| -> E {
                        let (mut y, mut w) = (x, q);
                        let mut k = 0;
                        while d.is_some() && k < 4 {
                            let Node::Var(id) = ir.get(y) else { break };
                            let Some(z) = def_step(id, w) else { break };
                            y = z.0;
                            w = z.1;
                            k += 1;
                        }
                        y
                    };
                    let getter = |x: E| match ir.get(def1(x)) {
                        Node::Call(ti, _) => match ir.target(ti) {
                            CallTarget::Fn { pc } => self.lamports_getter(pc),
                            _ => false,
                        },
                        _ => false,
                    };
                    let a0 = def1(ea);
                    if (bal(ea) && bal(eb))
                        || (getter(eb) && (getter(ea) || matches!(ir.get(a0), Node::Load { .. })))
                    {
                        a.ixs[xi].ops[oi].kinds.push("ACCOUNT_CLOSE");
                    }
                }
            }
        }
        // relations: two sides of an equality check, at least one an account key / field
        let mut rel: Vec<Relation> = Vec::new();
        {
            let ix = &a.ixs[xi];
            for c in &ix.checks {
                if c.kinds.contains(&"has_one")
                    && c.account.as_ref().is_some_and(|x| !x.is_empty())
                    && c.sides.is_none()
                {
                    let ca = c.account.as_ref().unwrap();
                    let fields = self.idl_fields(&ix.handler, ca);
                    let tt = snake(ca);
                    let mut by_name: IndexMap<String, &AcctOut> = IndexMap::new();
                    for x in &ix.accounts {
                        let k = snake(&x.name);
                        if k != tt
                            && (!by_name.contains_key(&k) || x.constraints.contains_key("signer"))
                        {
                            by_name.insert(k, x);
                        }
                    }
                    let cands: Vec<&AcctOut> = match &fields {
                        Some(fs) => by_name
                            .iter()
                            .filter(|(k, _)| fs.contains(*k))
                            .map(|x| *x.1)
                            .collect(),
                        None => ix
                            .accounts
                            .iter()
                            .filter(|x| &x.name != ca && x.has("signer"))
                            .collect(),
                    };
                    for t in cands {
                        rel.push(Relation {
                            a: if fields.is_some() {
                                format!("{ca}.{}", t.name)
                            } else {
                                has_one_field(ca, &t.name, &c.cond, a)
                            },
                            b: format!("{}.key", t.name),
                            kind: "has_one",
                            status: c.status,
                            at: c.at.clone(),
                            negated: None,
                        });
                    }
                }
                if c.kinds.contains(&"address") && c.account.as_ref().is_some_and(|x| !x.is_empty())
                {
                    rel.push(Relation {
                        a: format!("{}.key", c.account.as_ref().unwrap()),
                        b: "(constant address)".into(),
                        kind: "address",
                        status: c.status,
                        at: c.at.clone(),
                        negated: None,
                    });
                }
                if c.kinds.contains(&"member") {
                    if let Some((x, y)) = &c.sides {
                        rel.push(Relation {
                            a: x.clone(),
                            b: y.clone(),
                            kind: "member",
                            status: c.status,
                            at: c.at.clone(),
                            negated: None,
                        });
                        continue;
                    }
                }
                let Some(sides) = c.sides.clone().or_else(|| eq_sides(&c.cond)) else {
                    continue;
                };
                let norm = |t: &str| -> Option<String> {
                    let tt = super::js_trim(t);
                    if let Some(d) =
                        crate::jre!(r"^([A-Za-z_]\w*)\.([a-z_]\w*(?:\.[a-z_]\w*)+)$").captures(tt)
                    {
                        if let Some(ac) = acct_of(&d[1]) {
                            return Some(format!("{ac}.{}", &d[2]));
                        }
                    }
                    for m in acct_ref().captures_iter(t) {
                        if let Some(ac) = acct_of(&m[1]) {
                            return Some(format!("{ac}.{}", &m[2]));
                        }
                    }
                    acct_of(tt).map(|b| format!("{b}.key"))
                };
                let (x, y) = (norm(&sides.0), norm(&sides.1));
                if x.is_none() && y.is_none() {
                    continue;
                }
                let kind = if c
                    .kinds
                    .iter()
                    .any(|k| *k == "token_mint" || *k == "token_owner")
                {
                    "token"
                } else if x.as_ref().is_some_and(|x| x.ends_with(".key"))
                    && y.as_ref().is_some_and(|y| y.ends_with(".key"))
                {
                    "key_eq"
                } else if x.is_some() && y.is_some() {
                    "field_eq"
                } else {
                    "compare"
                };
                rel.push(Relation {
                    a: x.unwrap_or_else(|| super::js_slice(&sides.0, 0, Some(60))),
                    b: y.unwrap_or_else(|| super::js_slice(&sides.1, 0, Some(60))),
                    kind,
                    status: c.status,
                    at: c.at.clone(),
                    negated: None,
                });
            }
            // (the relations a token account's / mint's initialization establishes)
            for o in &ix.ops {
                let acc = |role: &str| -> Option<String> {
                    let c = o.cpi.as_ref()?.borrow();
                    let t = c
                        .accounts
                        .iter()
                        .find(|x| x.role.as_deref() == Some(role))?
                        .text
                        .clone();
                    if !t.is_empty() && t != "?" {
                        Some(t)
                    } else {
                        None
                    }
                };
                let st = if o.main { "found" } else { "partial" };
                let cix = o.cpi(|c| c.ix.clone()).flatten();
                if cix.as_deref() == Some("InitializeAccount3") {
                    if let Some(ac) = acc("account") {
                        if let Some(m) = acc("mint") {
                            rel.push(Relation {
                                a: format!("{ac}.mint"),
                                b: format!("{m}.key"),
                                kind: "token",
                                status: st,
                                at: o.at.clone(),
                                negated: None,
                            });
                        }
                        if let Some(au) = acc("authority") {
                            rel.push(Relation {
                                a: format!("{ac}.owner"),
                                b: format!("{au}.key"),
                                kind: "token",
                                status: st,
                                at: o.at.clone(),
                                negated: None,
                            });
                        }
                    }
                }
                let ma = if cix.as_deref() == Some("InitializeMint2") {
                    o.cpi(|c| {
                        c.fields
                            .iter()
                            .find(|x| x.0 == "mint_authority")
                            .map(|x| x.1.clone())
                    })
                    .flatten()
                } else {
                    None
                };
                if let (Some(ma), Some(m)) = (ma.filter(|s| !s.is_empty()), acc("mint")) {
                    rel.push(Relation {
                        a: format!("{m}.mint_authority"),
                        b: ma,
                        kind: "token",
                        status: st,
                        at: o.at.clone(),
                        negated: None,
                    });
                }
            }
        }
        let mut dedup: Vec<Relation> = Vec::new();
        for x in &rel {
            if !dedup
                .iter()
                .any(|y| y.a == x.a && y.b == x.b && y.kind == x.kind)
            {
                dedup.push(x.clone());
            }
        }
        a.ixs[xi].relations = Some(dedup);
        let sk = self.stored_keys(&a.ixs[xi]);
        a.ixs[xi].stored_keys = Some(sk);
        // (account data rows only for accounts whose data is checked or read by an operation)
        let data_used: HashSet<String> = a.ixs[xi]
            .ops
            .iter()
            .flat_map(|o| o.sources.iter().flatten())
            .filter(|x| !x.source.ends_with(".key"))
            .map(|x| x.source.split('.').next().unwrap_or("").to_string())
            .collect();
        let trust: Vec<TrustRow> = trust
            .into_iter()
            .filter(|t| {
                !t.value.ends_with(".data")
                    || !t.evidence.is_empty()
                    || data_used.contains(&t.value[..t.value.len() - 5])
            })
            .collect();
        a.ixs[xi].trust = Some(trust);
        // authority: who enables each value movement / authority change
        let ix = &a.ixs[xi];
        let signers: Vec<&AcctOut> = ix.accounts.iter().filter(|x| x.has("signer")).collect();
        let mut auth: Vec<AuthorityRow> = Vec::new();
        for (oi, o) in ix.ops.iter().enumerate() {
            if !is_value_or_auth(o) {
                continue;
            }
            let mut en: Vec<Enabler> = Vec::new();
            for s in &signers {
                en.push(Enabler {
                    kind: "signer",
                    what: s.name.clone(),
                    status: Some(s.constraints["signer"].status),
                    written_by: None,
                });
                let sk = format!("{}.key", s.name);
                for x in &rel {
                    let other = if x.a == sk {
                        Some(&x.b)
                    } else if x.b == sk {
                        Some(&x.a)
                    } else {
                        None
                    };
                    let Some(other) = other.filter(|o| !o.is_empty()) else {
                        continue;
                    };
                    if (other.ends_with(".key") && x.kind != "has_one") || x.kind == "token" {
                        continue;
                    }
                    let field = if x.kind == "has_one" && other.ends_with('?') {
                        auth_fields
                            .keys()
                            .find(|f| f.ends_with(&format!(".{}", s.name)))
                            .cloned()
                            .unwrap_or_else(|| other[..other.len() - 1].to_string())
                    } else {
                        other.clone()
                    };
                    let written_by = auth_fields.get(&field).cloned().or_else(|| {
                        a.state_writes
                            .iter()
                            .find(|w| w.0 == field)
                            .map(|w| w.1.iter().map(|x| x.ix.clone()).collect())
                    });
                    en.push(Enabler {
                        kind: "stored",
                        what: format!("{}.key == {field}", s.name),
                        status: Some(x.status),
                        written_by,
                    });
                }
            }
            let seeds = o.cpi(|c| c.seeds.clone()).flatten();
            if seeds.as_ref().is_some_and(|s| !s.is_empty()) || o.has("PDA_SIGNATURE") {
                en.push(Enabler {
                    kind: "pda",
                    what: format!(
                        "PDA signature {}",
                        seeds.unwrap_or_else(|| "(seeds not decoded)".into())
                    ),
                    status: None,
                    written_by: None,
                });
            }
            if en.is_empty() {
                en.push(Enabler {
                    kind: "none",
                    what: "no signer, stored authority or PDA signature found".into(),
                    status: None,
                    written_by: None,
                });
            }
            let ks: Vec<&str> = o.kinds.iter().copied().filter(|k| *k != "CPI").collect();
            auth.push(AuthorityRow {
                op: oi,
                kind: if ks.is_empty() {
                    "CPI".into()
                } else {
                    ks.join(", ")
                },
                enabled_by: en,
            });
        }
        a.ixs[xi].authority = Some(auth);
    }

    /// AccountInfo::lamports(): a small function returning the value of its AccountInfo parameter's lamports RefCell
    fn lamports_getter(&self, pc: i64) -> bool {
        if let Some(v) = self.getters.borrow().get(&pc) {
            return *v;
        }
        let t = {
            let facts = self.facts.borrow();
            let ls = facts.get(&pc).map_or(&[][..], |f| &f.lines[..]);
            if ls.len() < 16 {
                ls.join("\n")
            } else {
                String::new()
            }
        };
        let v = crate::jre!(r"= \w+\.lamports\b").is_match(&t)
            && amount_returned(&t)
            && !t.contains(".value.amount = ");
        self.getters.borrow_mut().insert(pc, v);
        v
    }

    /// the invoke call a returned expression makes (a tail call, possibly wrapped): its arguments
    fn invoke_call(&self, f: &sbpf_program::Func, e: E) -> Option<Vec<E>> {
        let ir = fir(f);
        let mut out: Option<Vec<E>> = None;
        ir.walk(e, &mut |_, n| {
            if out.is_some() {
                return;
            }
            if let Node::Call(t, args) = n {
                if let CallTarget::Fn { pc } = ir.target(t) {
                    if self.pname(pc).contains("invoke") {
                        out = Some(ir.to_vec(args));
                    }
                }
            }
        });
        out
    }

    /// the fields of an account's IDL type (its type in the Accounts struct's layout, else any account type's)
    fn idl_fields(&self, handler: &str, acct: &str) -> Option<HashSet<String>> {
        let idl = self.idl?;
        if idl.accounts.is_empty() {
            return None;
        }
        let h = self.funcs.iter().find(|x| x.name == handler);
        let t = h
            .and_then(|h| self.acct_layouts.get(&h.pc))
            .and_then(|l| l.iter().find(|x| x.name == acct))
            .map(|x| &x.t);
        let ty = match t {
            Some(FT::Embed(s)) => Some(s.clone()),
            Some(FT::Ref(s)) if s != "AccountInfo" => Some(s.clone()),
            _ => None,
        };
        let types: Vec<String> = match ty {
            Some(ty) if idl.accounts.iter().any(|x| x.0 == ty) => vec![ty],
            _ => idl.accounts.iter().map(|x| x.0.clone()).collect(),
        };
        let mut out = HashSet::new();
        for x in &types {
            for (n, _) in crate::idl::struct_fields(x, &idl.types).unwrap_or_default() {
                out.insert(snake(&n));
            }
        }
        Some(out)
    }

    /// Stored keys of the accounts whose data the instruction uses (storedKeys)
    fn stored_keys(&self, ix: &IxOut) -> Vec<StoredKeys> {
        let rel = ix.relations.as_deref().unwrap_or(&[]);
        let mut out: Vec<StoredKeys> = Vec::new();
        let types = self.idl.map(|i| &i.types);
        let h = self.funcs.iter().find(|x| x.name == ix.handler);
        let lay = h.and_then(|h| self.acct_layouts.get(&h.pc));
        let is_key = |t: &serde_json::Value| {
            t.as_str()
                .is_some_and(|s| s == "publicKey" || s == "pubkey")
        };
        let field_of = |side: &str, a: &str| -> Option<String> {
            let rest = side.strip_prefix(a)?.strip_prefix('.')?;
            if crate::jre!(r"^(key|owner|lamports|data|data_len|is_signer|is_writable|executable)$")
                .is_match(rest)
            {
                None
            } else {
                Some(rest.to_string())
            }
        };
        let tr = |x: &Option<String>| x.as_ref().is_some_and(|s| !s.is_empty());
        for x in &ix.accounts {
            let a = &x.name;
            let typed = x.has("discriminator");
            let mine: Vec<&Relation> = rel
                .iter()
                .filter(|y| tr(&field_of(&y.a, a)) || tr(&field_of(&y.b, a)))
                .collect();
            if !typed && mine.is_empty() {
                continue;
            }
            let t = lay
                .and_then(|l| {
                    l.iter()
                        .find(|y| &y.name == a || snake(&y.name) == snake(a))
                })
                .map(|y| &y.t);
            let lt = match t {
                Some(FT::Embed(s)) => Some(s.clone()),
                Some(FT::Ref(s)) if s != "AccountInfo" => Some(s.clone()),
                _ => None,
            };
            let ty: Option<String> = match lt {
                Some(lt) if types.is_some_and(|t| t.contains_key(&lt)) => Some(lt),
                _ => self.idl.and_then(|i| {
                    i.accounts
                        .iter()
                        .find(|y| snake(&y.0) == snake(a))
                        .map(|y| y.0.clone())
                }),
            };
            let fields: Option<Vec<String>> = match (&ty, types) {
                (Some(ty), Some(types)) => crate::idl::struct_fields(ty, types).map(|fs| {
                    fs.iter()
                        .filter(|f| is_key(&f.1))
                        .map(|f| snake(&f.0))
                        .collect()
                }),
                _ => None,
            };
            let compared: Vec<String> = mine
                .iter()
                .map(|y| {
                    if tr(&field_of(&y.a, a)) {
                        format!("{} == {}", y.a, y.b)
                    } else {
                        format!("{} == {}", y.b, y.a)
                    }
                })
                .collect();
            let ak = format!("{a}.key");
            let referenced_by: Vec<String> = rel
                .iter()
                .filter(|y| {
                    (y.a == ak && !tr(&field_of(&y.b, a)) && !y.b.starts_with('('))
                        || (y.b == ak && !tr(&field_of(&y.a, a)))
                })
                .map(|y| if y.a == ak { y.b.clone() } else { y.a.clone() })
                .collect();
            let cmp_f: HashSet<String> = mine
                .iter()
                .map(|y| {
                    field_of(&y.a, a)
                        .or_else(|| field_of(&y.b, a))
                        .unwrap_or_default()
                        .split('.')
                        .next()
                        .unwrap_or("")
                        .to_string()
                })
                .collect();
            let pre = format!("{a}.");
            let written: HashSet<String> = ix
                .ops
                .iter()
                .filter_map(|o| o.target.as_ref().filter(|t| t.starts_with(&pre)))
                .map(|t| snake(t[pre.len()..].split(['.', '[']).next().unwrap_or("")))
                .collect();
            let never: Vec<String> = fields
                .unwrap_or_default()
                .into_iter()
                .filter(|f| !cmp_f.contains(f) && !written.contains(f))
                .collect();
            let bound = |y: &AcctOut| {
                [
                    "address",
                    "pda",
                    "has_one",
                    "key",
                    "token_owner",
                    "token_mint",
                    "associated",
                ]
                .iter()
                .any(|c| y.has(c))
                    || rel.iter().any(|z| {
                        z.a.starts_with(&format!("{}.", y.name))
                            || z.b.starts_with(&format!("{}.", y.name))
                    })
            };
            let gaps: Vec<String> = never
                .iter()
                .flat_map(|f| {
                    ix.accounts
                        .iter()
                        .filter(|y| &y.name != a && &snake(&y.name) == f && !bound(y))
                        .map(|y| format!("{a}.{f} is never compared with {}.key", y.name))
                        .collect::<Vec<_>>()
                })
                .collect();
            out.push(StoredKeys {
                account: a.clone(),
                ty,
                compared,
                referenced_by,
                never,
                gaps,
            });
        }
        out
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

use super::ixctx::IxInfo;
use super::report::{snake, AcctOut, Analysis, IxOut, SrcRow};
use super::sources::{Source, SourceCtx};
use crate::analysis::facts::cpi_kinds;
use crate::cpi::PartAcc;
use crate::views::FT;
use indexmap::IndexMap;
use sbpf_ir::{BinOp, Node, Stmt, E};
use std::cell::{OnceCell, RefCell};
use std::rc::Rc;

/// ACCT_REF: `<account>.<field>` references in a printed text
pub fn acct_ref() -> &'static regex::Regex {
    crate::jre!(
        r"\b([A-Za-z_]\w*(?:\[\d+\])?)\.(key|owner|lamports|data|[a-z_][a-z0-9_]*(?:\[\d+\.\.\d+\])?)\b"
    )
}

/// /(\w+) = \w+\.value\.amount\b[\s\S]*return \1\b/ (the backreference by hand: every start position)
fn amount_returned(t: &str) -> bool {
    let re = crate::jre!(r"^(\w+) = \w+\.value\.amount\b");
    let w = |c: u8| c.is_ascii_alphanumeric() || c == b'_';
    let b = t.as_bytes();
    for i in 0..b.len() {
        if !t.is_char_boundary(i) {
            continue;
        }
        let Some(m) = re.captures(&t[i..]) else {
            continue;
        };
        let cap = &m[1];
        let end = i + m.get(0).unwrap().end();
        let pat = format!("return {cap}");
        let mut k = end;
        while let Some(j) = t[k..].find(&pat) {
            let e = k + j + pat.len();
            if e >= b.len() || !w(b[e]) {
                return true;
            }
            k = k + j + 1;
        }
    }
    false
}

/// The stored field an Anchor has_one on account T compares with signer S's key
fn has_one_field(t: &str, s: &str, cond: &str, a: &Analysis) -> String {
    let re = regex::Regex::new(&format!(
        r"(?-u:\b){}\.([a-z_][a-z0-9_]*)(?-u:\b)",
        regex::escape(t)
    ))
    .unwrap();
    if let Some(m) = re.captures(cond) {
        if !crate::jre!(r"^(key|owner|lamports|data|is_signer|is_writable)$").is_match(&m[1]) {
            return format!("{t}.{}", &m[1]);
        }
    }
    let ts = format!("{t}.{s}");
    let pre = format!("{t}.");
    let suf = format!("_{s}");
    a.state_writes
        .iter()
        .map(|w| &w.0)
        .find(|f| **f == ts || (f.starts_with(&pre) && f.ends_with(&suf)))
        .cloned()
        .unwrap_or_else(|| format!("{t}.{s}?"))
}

/// the two sides of an (in)equality condition: a == b, a != b, memeq/keyeq/memcmp(a, b, 0x20)
pub fn eq_sides(cond: &str) -> Option<(String, String)> {
    if cond.contains(" && ") && !cond.contains(" || ") {
        let bal = |t: &str| -> String {
            let mut x = super::js_trim(t).to_string();
            for _ in 0..4 {
                let o = x.matches('(').count();
                let c = x.matches(')').count();
                if o > c && x.starts_with('(') {
                    x = x[1..].to_string();
                } else if c > o && x.ends_with(')') {
                    x = x[..x.len() - 1].to_string();
                } else {
                    break;
                }
            }
            x
        };
        for p in cond.split(" && ").map(bal) {
            if crate::jre!(r"memeq|keyeq|memcmp").is_match(&p) {
                if let Some(s) = eq_sides1(&p) {
                    return Some(s);
                }
            }
        }
        return None;
    }
    eq_sides1(cond)
}

fn eq_sides1(cond: &str) -> Option<(String, String)> {
    let c = crate::jre!(r"^!+\(?").replace(cond, "");
    let c = crate::jre!(r"\)$").replace(&c, "");
    if let Some(m) = crate::jre!(r"^(?:\(\s*)?(?:memeq|keyeq|memcmp)\(([^,]+), ([^,]+?)(?:, 0x20)?\)(?: as u32\))?(?: [!=]= 0)?$").captures(&c) {
        return Some((m[1].to_string(), m[2].to_string()));
    }
    let e = crate::jre!(r"^([^&|=!<>]+?) [!=]= ([^&|=!<>]+)$").captures(cond)?;
    if crate::jre!(r"^\d+$|^0x[0-9a-f]+$").is_match(super::js_trim(&e[2])) {
        return None;
    }
    Some((e[1].to_string(), e[2].to_string()))
}
