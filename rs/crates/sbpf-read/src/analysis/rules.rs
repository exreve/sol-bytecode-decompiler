//! The rule engine of phase 2 (`src/analysis/phase2.ts` RULES): declarative rules over the per-instruction facts
//! (checks, operations, trust, relations, authority rows, audit facts, phase 3 sites). The incident rules
//! (incidents.ts), the dispatcher grouping and the ranking of the findings come after (8c).

use super::phase2::{is_value_or_auth, Finding};
use super::phase3::close_zeroing;
use super::report::{snake, AcctOut, Analysis, CheckOut, IxOut, Loc, OpOut};
use super::{js_slice, An};
use indexmap::{IndexMap, IndexSet};

/// a finding before its rule / title / instruction
struct F {
    accounts: Vec<String>,
    path: Vec<String>,
    evidence: Vec<String>,
    confidence: &'static str,
    weight: f64,
}

fn l(at: &Loc) -> String {
    format!("{}:{}", at.fn_, at.line)
}

fn w_of(o: &OpOut) -> f64 {
    let w = |k: &str| match k {
        "TOKEN_TRANSFER" | "LAMPORT_TRANSFER" | "MINT" => 5.0,
        "PROGRAM_UPGRADE" => 6.0,
        "AUTHORITY_WRITE" | "ACCOUNT_CLOSE" | "OWNER_ASSIGN" | "LAMPORT_WRITE" => 4.0,
        "BURN" => 3.0,
        "CPI" => 1.0,
        _ => 0.0,
    };
    o.kinds.iter().map(|k| w(k)).fold(0.0, f64::max)
}

fn t140(s: &str) -> String {
    js_slice(s, 0, Some(140))
}

fn nz(s: &Option<String>) -> bool {
    s.as_ref().is_some_and(|x| !x.is_empty())
}

fn sysvar_name(s: &str) -> bool {
    crate::jre!(r"^(clock|rent|instructions?|ix_sysvar|instructions?_sysvar|sysvar_\w+|\w+_sysvar|slot_?hashes|recent_(block|slot)hashes|stake_history|epoch_schedule|epoch_rewards|fees|last_restart_slot)$").is_match(s)
}

fn row<'x>(ix: &'x IxOut, a: &str) -> Option<&'x AcctOut> {
    ix.accounts.iter().find(|x| x.name == a)
}

fn found(ix: &IxOut, a: &str, k: &str) -> bool {
    row(ix, a)
        .and_then(|x| x.constraints.get(k))
        .is_some_and(|c| c.status == "found" || c.status == "partial")
}

fn address_checked(ix: &IxOut, a: &str) -> bool {
    found(ix, a, "address")
        || ix
            .checks
            .iter()
            .any(|c| c.account.as_deref() == Some(a) && c.kinds.contains(&"address"))
}

fn runtime_authorized(o: &OpOut) -> bool {
    o.cpi(|c| (nz(&c.known) || nz(&c.family)) && !nz(&c.seeds)).unwrap_or(false) && !o.has("PDA_SIGNATURE")
}

fn seeds(o: &OpOut) -> bool {
    o.cpi(|c| nz(&c.seeds)).unwrap_or(false)
}

fn init_mechanics(ix: &IxOut, o: &OpOut) -> bool {
    o.cpi(|c| {
        c.family.as_deref() == Some("system")
            && crate::jre!(r"^(CreateAccount|Assign|Allocate|Transfer)$").is_match(c.ix.as_deref().unwrap_or(""))
    })
    .unwrap_or(false)
        && ix.ops.iter().any(|x| {
            x.has("ACCOUNT_CREATE")
                || x.cpi(|c| c.family.as_deref() == Some("system") && c.ix.as_deref() == Some("Allocate"))
                    .unwrap_or(false)
        })
}

fn init_write(ix: &IxOut, o: &OpOut) -> bool {
    let t = match (&o.cpi, &o.target) {
        (None, Some(tg)) if !tg.is_empty() => row(ix, tg.split('.').next().unwrap_or("")),
        _ => None,
    };
    let Some(t) = t else { return false };
    t.has("zero")
        || (ix.ops.iter().any(|x| x.has("ACCOUNT_CREATE"))
            && t.constraints.get("discriminator").map(|c| c.status) != Some("found"))
}

fn authorized(ix: &IxOut, oi: usize) -> bool {
    ix.authority
        .iter()
        .flatten()
        .any(|r| r.op == oi && r.enabled_by.iter().any(|e| e.kind == "stored" || e.kind == "pda"))
}

fn admin_gated(ix: &IxOut) -> bool {
    ix.accounts
        .iter()
        .any(|x| x.has("signer") && address_checked(ix, &x.name))
}

fn signer_key(ix: &IxOut, src: &str) -> bool {
    match src.strip_suffix(".key").filter(|s| !s.is_empty()) {
        Some(n) => row(ix, n).is_some_and(|x| x.has("signer")),
        None => false,
    }
}

fn rels(ix: &IxOut) -> &[super::phase2::Relation] {
    ix.relations.as_deref().unwrap_or(&[])
}

/// `/^\*?([A-Za-z_]\w*)/` of a text
fn lead_name(t: &str) -> Option<String> {
    crate::jre!(r"^\*?([A-Za-z_]\w*)").captures(t).map(|m| m[1].to_string())
}

fn signer_unrelated(ix: &IxOut) -> Vec<F> {
    if ix.checks.iter().any(|c| {
        (c.kinds.contains(&"has_one")
            || (ix.kind == "anchor" && c.kinds.contains(&"pda"))
            || (c.kinds.contains(&"key") && c.kinds.contains(&"custom")))
            && !nz(&c.account)
            && c.sides.is_none()
            && c.status != "not_found"
    }) {
        return vec![];
    }
    let mut out = Vec::new();
    for rw in ix.authority.iter().flatten() {
        let o = &ix.ops[rw.op];
        let has_signer = rw.enabled_by.iter().any(|e| e.kind == "signer");
        let stored = rw.enabled_by.iter().any(|e| e.kind == "stored" || e.kind == "pda");
        if !has_signer
            || stored
            || seeds(o)
            || init_mechanics(ix, o)
            || rw.enabled_by.iter().any(|e| e.kind == "signer" && address_checked(ix, &e.what))
        {
            continue;
        }
        if rw.enabled_by.iter().any(|e| {
            e.kind == "signer" && row(ix, &e.what).and_then(|x| x.constraints.get("key")).map(|c| c.status) == Some("found")
        }) {
            continue;
        }
        if rw.enabled_by.iter().any(|e| {
            e.kind == "signer"
                && ix
                    .checks
                    .iter()
                    .any(|c| c.account.as_deref() == Some(e.what.as_str()) && c.kinds.contains(&"custom") && c.status == "found")
        }) {
            continue;
        }
        let closed = match &o.target {
            Some(t) if o.anchor_close && !t.is_empty() => Some(format!("{}.", t.split('.').next().unwrap_or(""))),
            _ => None,
        };
        if let Some(cl) = &closed {
            if !ix.accounts.iter().any(|x| &format!("{}.", x.name) == cl) {
                continue;
            }
            if rels(ix).iter().any(|x| {
                (x.kind == "has_one" || x.kind == "field_eq")
                    && ((x.a.starts_with(cl.as_str()) && x.b.ends_with(".key")) || (x.b.starts_with(cl.as_str()) && x.a.ends_with(".key")))
            }) {
                continue;
            }
        }
        if init_write(ix, o) {
            continue;
        }
        let t = match &o.target {
            Some(tg) if o.has("AUTHORITY_WRITE") && !tg.is_empty() => row(ix, tg.split('.').next().unwrap_or("")),
            _ => None,
        };
        if let Some(t) = t {
            let none = |k: &str| t.constraints.get(k).is_none_or(|c| c.status == "not_found");
            if ix.kind == "anchor"
                && none("discriminator")
                && none("initialized")
                && (none("owner") || t.constraints["owner"].status == "runtime")
                && o
                    .sources
                    .iter()
                    .flatten()
                    .any(|s| Some(&s.param) == o.target.as_ref() && signer_key(ix, &s.source))
            {
                continue;
            }
        }
        let pass_on = o
            .cpi(|c| (nz(&c.known) || nz(&c.family)) && (c.accounts.iter().any(|x| x.s.is_some_and(|v| v != 0.0 && !v.is_nan())) || c.accounts.is_empty()))
            .unwrap_or(false);
        if pass_on || runtime_authorized(o) {
            continue;
        }
        let sg: Vec<&super::phase2::Enabler> = rw.enabled_by.iter().filter(|e| e.kind == "signer").collect();
        out.push(F {
            accounts: sg.iter().map(|e| e.what.clone()).collect(),
            path: vec![l(&o.at)],
            evidence: vec![
                t140(&o.text),
                format!(
                    "signers: {}",
                    sg.iter()
                        .map(|e| format!("{} ({})", e.what, e.status.unwrap_or("undefined")))
                        .collect::<Vec<_>>()
                        .join(", ")
                ),
            ],
            confidence: "low",
            weight: w_of(o),
        });
    }
    out
}

/// the account whose key a CPI's program id is
fn prog_account(ix: &IxOut, o: &OpOut) -> Option<String> {
    let is_acct = |a: &str| ix.accounts.iter().any(|x| x.name == a) || crate::jre!(r"^(remaining_accounts|account)\[\d+\]$").is_match(a);
    for s in o.sources.iter().flatten() {
        if s.param == "program" {
            if let Some(m) = crate::jre!(r"^(.+)\.key$").captures(&s.source) {
                if is_acct(&m[1]) {
                    return Some(m[1].to_string());
                }
            }
        }
    }
    let prog = o.cpi(|c| c.program.clone())?;
    let pa = crate::jre!(r"^\*?([A-Za-z_]\w*(?:\[\d+\])?)(?:\.key)?$")
        .captures(super::js_trim(&prog))
        .map(|m| m[1].to_string())?;
    if is_acct(&pa) {
        Some(pa)
    } else {
        None
    }
}

fn prog_id_checked(ix: &IxOut, o: &OpOut, acct: Option<&str>) -> bool {
    let cpi = o.cpi.as_ref().unwrap().borrow().clone();
    if cpi.checked.as_deref().is_some_and(|c| c.contains("(id compared with")) {
        return true;
    }
    if crate::jre!(r"built before it: \w+ \(TokenInstruction::pack").is_match(&o.text) {
        return true;
    }
    let unid = cpi.accounts.is_empty() && crate::jre!(r"^[A-Z_0-9|]+$").is_match(&cpi.program);
    let prog = match acct {
        Some(a) => Some(a.to_string()),
        None => prog_account(ix, o),
    };
    if o.guards.iter().flatten().map(|i| &ix.checks[*i]).any(|c| {
        c.kinds.iter().any(|k| *k == "address" || *k == "executable" || *k == "key")
            && ((!nz(&c.account) && !c.kinds.contains(&"initialized"))
                || c.account.as_deref().unwrap_or("").contains("program")
                || (nz(&c.account) && {
                    let a = c.account.as_ref().unwrap();
                    cpi.program.contains(a.strip_suffix('?').unwrap_or(a)) || Some(a) == prog.as_ref()
                })
                || (unid && c.kinds.contains(&"address")))
    }) {
        return true;
    }
    let Some(prog) = prog.filter(|p| !p.is_empty()) else {
        return false;
    };
    if ["address", "key", "pda", "has_one"]
        .iter()
        .any(|k| row(ix, &prog).and_then(|x| x.constraints.get(k)).map(|c| c.status) == Some("found"))
    {
        return true;
    }
    let pk = format!("{prog}.key");
    rels(ix)
        .iter()
        .any(|x| (x.a == pk && !x.b.ends_with(".key")) || (x.b == pk && !x.a.ends_with(".key") && !x.a.starts_with('(')))
}

fn member_unsigned(ix: &IxOut) -> Vec<F> {
    let writes: Vec<&OpOut> = ix
        .ops
        .iter()
        .filter(|o| (o.has("ACCOUNT_DATA_WRITE") || is_value_or_auth(o)) && !init_mechanics(ix, o))
        .collect();
    if writes.is_empty() {
        return vec![];
    }
    let rel = rels(ix);
    let related = |t: &str, m: &str| {
        rel.iter().any(|r| {
            r.kind != "member"
                && ((r.a.starts_with(&format!("{t}.")) && r.b == format!("{m}.key"))
                    || (r.a.starts_with(&format!("{m}.")) && r.b == format!("{t}.key"))
                    || (r.a == format!("{t}.key") && r.b == format!("{m}.key")))
        })
    };
    let created = |t: &str| row(ix, t).is_some_and(|x| ["zero", "rent_exempt", "pda", "address"].iter().any(|k| x.has(k)));
    let mut out = Vec::new();
    for r in rel.iter().filter(|r| r.kind == "member" && r.status == "found") {
        let x = r.b.strip_suffix(".key").unwrap_or(&r.b).to_string();
        let m = r.a.split('.').next().unwrap_or("").to_string();
        let Some(rw) = row(ix, &x) else { continue };
        if !rw.expected.signer && !rw.has("signer") {
            out.push(F {
                accounts: vec![x.clone(), m.clone()],
                path: vec![l(&r.at), l(&writes[0].at)],
                evidence: vec![
                    format!("{x}.key is looked up in {} (a membership check), but {x} does not sign", r.a),
                    js_slice(&writes[0].text, 0, Some(120)),
                ],
                confidence: "medium",
                weight: 4.0,
            });
            continue;
        }
        let w = writes.iter().find(|o| {
            let t = o.target.as_ref().map(|t| t.split('.').next().unwrap_or("").to_string());
            match t {
                Some(t) if !t.is_empty() => {
                    t != m && t != x && ix.accounts.iter().any(|y| y.name == t) && !created(&t) && !init_write(ix, o) && !related(&t, &m)
                }
                _ => false,
            }
        });
        if let Some(w) = w {
            let wt = w.target.as_ref().unwrap().split('.').next().unwrap_or("").to_string();
            out.push(F {
                accounts: vec![wt.clone(), m.clone()],
                path: vec![l(&r.at), l(&w.at)],
                evidence: vec![
                    format!("{x} is a member of {}, but {wt} (written) is not related to {m} by any stored key", r.a),
                    js_slice(&w.text, 0, Some(120)),
                ],
                confidence: "low",
                weight: 3.0,
            });
        }
    }
    out.truncate(1);
    out
}

fn cross_unrelated(ix: &IxOut) -> Vec<F> {
    if ix.kind != "anchor" {
        return vec![];
    }
    let rel = rels(ix);
    let key_rel = |x: &str| {
        let k = format!("{x}.key");
        rel.iter().any(|r| r.kind != "member" && r.kind != "address" && (r.a == k || r.b == k))
    };
    let fixed = |x: &str| ["pda", "address", "zero"].iter().any(|k| row(ix, x).is_some_and(|y| y.has(k)));
    let mut out = Vec::new();
    for (ci, c) in ix.checks.iter().enumerate() {
        let Some((aa, bb)) = &c.cross else { continue };
        if c.status != "found" {
            continue;
        }
        if key_rel(aa) || key_rel(bb) || fixed(aa) || fixed(bb) {
            continue;
        }
        let o = ix.ops.iter().find(|o| {
            o.guards.as_ref().is_some_and(|g| g.contains(&ci))
                && (o.has("ACCOUNT_DATA_WRITE") || is_value_or_auth(o) || (o.has("CPI") && !o.cpi(|c| nz(&c.known)).unwrap_or(false)))
        });
        let Some(o) = o else { continue };
        out.push(F {
            accounts: vec![aa.clone(), bb.clone()],
            path: vec![l(&c.at), l(&o.at)],
            evidence: vec![
                format!(
                    "a check compares {aa}'s and {bb}'s data ({}), but no stored key relates {aa} and {bb}",
                    js_slice(&c.cond, 0, Some(60))
                ),
                js_slice(&o.text, 0, Some(120)),
            ],
            confidence: "low",
            weight: w_of(o),
        });
    }
    out.truncate(1);
    out
}

fn bound_crank(ix: &IxOut, o: &OpOut) -> bool {
    let guards: Vec<&CheckOut> = o.guards.iter().flatten().filter_map(|i| ix.checks.get(*i)).collect();
    let custom = guards.iter().any(|c| c.kinds.contains(&"custom") && c.status == "found");
    let pda_signed = seeds(o) || o.has("PDA_SIGNATURE");
    if pda_signed
        && guards.iter().any(|c| {
            !nz(&c.account)
                && c.sides.is_none()
                && c.status == "found"
                && (c.kinds.contains(&"has_one")
                    || c.kinds.contains(&"token_owner")
                    || (c.kinds.contains(&"key") && c.kinds.contains(&"custom")))
        })
    {
        return true;
    }
    if o.cpi.is_none() && o.has("ACCOUNT_CLOSE") {
        return custom;
    }
    if !seeds(o) && !o.has("PDA_SIGNATURE") {
        return false;
    }
    let recips: Vec<Option<String>> = o
        .cpi(|c| {
            c.accounts
                .iter()
                .filter(|x| x.role.as_ref().is_some_and(|r| !r.is_empty() && (r == "destination" || r == "to")))
                .map(|x| crate::jre!(r"^\*?([A-Za-z_]\w*)$").captures(&x.text).map(|m| m[1].to_string()))
                .collect()
        })
        .unwrap_or_default();
    if recips.is_empty() || recips.iter().any(|d| d.as_ref().is_none_or(|d| !ix.accounts.iter().any(|y| &y.name == d))) {
        return false;
    }
    let rel = rels(ix);
    let fixed = |x: &str| {
        let k = format!("{x}.key");
        rel.iter().any(|r| (r.kind == "field_eq" || r.kind == "has_one") && (r.a == k || r.b == k))
            || ["address", "pda"].iter().any(|c| row(ix, x).is_some_and(|y| y.has(c)))
    };
    let bound = |d: &str| {
        fixed(d)
            || rel.iter().any(|r| {
                r.kind == "token"
                    && r.a == format!("{d}.owner")
                    && (if let Some(b) = r.b.strip_suffix(".key") { fixed(b) } else { true })
            })
    };
    custom && recips.iter().all(|d| bound(d.as_ref().unwrap()))
}

fn mint_unanchored(ix: &IxOut) -> Vec<F> {
    let pays = ix
        .ops
        .iter()
        .any(|o| (o.has("TOKEN_TRANSFER") || o.has("LAMPORT_TRANSFER")) && (seeds(o) || o.has("PDA_SIGNATURE")));
    if !pays {
        return vec![];
    }
    let name = |t: Option<String>| t.and_then(|t| crate::jre!(r"^\*?([A-Za-z_]\w*)$").captures(&t).map(|m| m[1].to_string()));
    let anchored = |x: &str| {
        let Some(rw) = row(ix, x) else { return true };
        if ["address", "pda", "has_one"].iter().any(|c| rw.has(c)) {
            return true;
        }
        let k = format!("{x}.key");
        rels(ix)
            .iter()
            .any(|r| (r.a == k || r.b == k) && r.kind != "token" && r.kind != "compare" && r.kind != "member")
    };
    let seg = |n: &str| snake(n).split('_').next().unwrap_or("").to_string();
    let signs = |x: &AcctOut| x.expected.signer || x.has("signer");
    let party = |d: &str| {
        let p = ix.accounts.iter().find(|x| x.name != d && snake(&x.name) == seg(d));
        p.is_some_and(|p| {
            let k = format!("{}.key", p.name);
            !signs(p)
                && rels(ix)
                    .iter()
                    .any(|r| r.kind != "address" && r.kind != "member" && (r.a == k || r.b == k))
        })
    };
    let mut out = Vec::new();
    for o in &ix.ops {
        let ok = o.has("TOKEN_TRANSFER")
            && o.cpi(|c| c.ix.as_deref() == Some("TransferChecked") && !nz(&c.seeds)).unwrap_or(false)
            && !o.has("PDA_SIGNATURE");
        if !ok {
            continue;
        }
        let role_text = |r: &str| o.cpi(|c| c.accounts.iter().find(|x| x.role.as_deref() == Some(r)).map(|x| x.text.clone())).flatten();
        let m = name(role_text("mint"));
        let d = name(role_text("to"));
        let (Some(m), Some(d)) = (m, d) else { continue };
        if anchored(&m) || anchored(&d) || !party(&d) {
            continue;
        }
        out.push(F {
            accounts: vec![m.clone(), d.clone()],
            path: vec![l(&o.at)],
            evidence: vec![
                t140(&o.text),
                format!("the caller pays in with mint {m} and destination {d}, neither bound to the program's state, while the program pays out (PDA-signed) in the same instruction"),
            ],
            confidence: "low",
            weight: w_of(o),
        });
    }
    out
}

/// V8's Array.prototype.sort for arrays shorter than 64 (one run: CountAndMakeRun, then binary insertion), with an
/// inconsistent comparator as the TS gives it
fn v8_sort<T>(v: &mut Vec<T>, cmp: impl Fn(&T, &T) -> i32) {
    let n = v.len();
    if n < 2 {
        return;
    }
    assert!(n < 64, "v8_sort: long arrays not modeled");
    // CountAndMakeRun(0, n)
    let mut run = 2;
    let desc = cmp(&v[1], &v[0]) < 0;
    let mut prev = 1;
    for idx in 2..n {
        let o = cmp(&v[idx], &v[prev]);
        if desc {
            if o >= 0 {
                break;
            }
        } else if o < 0 {
            break;
        }
        prev = idx;
        run += 1;
    }
    if desc {
        v[..run].reverse();
    }
    // BinaryInsertionSort(0, n, run)
    for start in run..n {
        let (mut left, mut right) = (0, start);
        while left < right {
            let mid = left + ((right - left) >> 1);
            if cmp(&v[start], &v[mid]) < 0 {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        let pivot = v.remove(start);
        v.insert(left, pivot);
    }
}

/// /^(.+?) - (?:min|sat_sub)\(\1, / (the backreference by hand)
fn cannot_wrap(e: &str) -> bool {
    for pat in [" - min(", " - sat_sub("] {
        let mut from = 0;
        while let Some(i) = e[from..].find(pat) {
            let i = from + i;
            let x = &e[..i];
            if i > 0 && !x.contains('\n') && e[i + pat.len()..].starts_with(&format!("{x}, ")) {
                return true;
            }
            from = i + 1;
        }
    }
    false
}

impl<'a> An<'a> {
    /// the rule engine over one instruction
    pub fn rules(&self, a: &Analysis, xi: usize, _info: &super::ixctx::IxInfo<'a>) -> Vec<Finding> {
        let ix = &a.ixs[xi];
        let anchor = a.program.anchor;
        let mut out: Vec<Finding> = Vec::new();
        if anchor
            && crate::jre!(r"^idl_(create_account|resize_account|close_account|set_buffer|set_authority|create_buffer|write)$")
                .is_match(&ix.name)
        {
            return out;
        }
        let mut push = |rule: &'static str, title: &'static str, fs: Vec<F>| {
            for f in fs {
                out.push(Finding {
                    rule,
                    title,
                    ix: ix.name.clone(),
                    accounts: f.accounts,
                    path: f.path,
                    evidence: f.evidence,
                    confidence: f.confidence,
                    weight: f.weight,
                });
            }
        };
        // cpi-unchecked-program
        {
            let mut by: IndexMap<String, (usize, usize, bool)> = IndexMap::new();
            for (oi, o) in ix.ops.iter().enumerate() {
                let Some(c) = &o.cpi else { continue };
                let (known, prog, sd) = {
                    let c = c.borrow();
                    (nz(&c.known), c.program.clone(), nz(&c.seeds))
                };
                if known || prog == "?" {
                    continue;
                }
                let Some(acct) = prog_account(ix, o) else { continue };
                if prog_id_checked(ix, o, Some(&acct)) {
                    continue;
                }
                let pda = sd || o.has("PDA_SIGNATURE");
                match by.get_mut(&acct) {
                    None => {
                        by.insert(acct, (oi, 1, pda));
                    }
                    Some(e) => {
                        e.1 += 1;
                        if pda && !e.2 {
                            e.0 = oi;
                            e.2 = true;
                        }
                    }
                }
            }
            let fs = by
                .iter()
                .map(|(acct, &(oi, n, pda))| {
                    let o = &ix.ops[oi];
                    let prog_acct = ix
                        .accounts
                        .iter()
                        .any(|x| &x.name == acct && ["address", "executable"].iter().any(|k| x.has(k)));
                    let mut ev = vec![
                        t140(&o.text),
                        format!("program id ← {acct}.key{}", if n > 1 { format!(" ({n} call sites)") } else { String::new() }),
                        if prog_acct {
                            format!("{acct} is checked on some paths, but no check dominating this CPI compares its id")
                        } else {
                            format!("no check of {acct}'s key against a known program id or a stored key found")
                        },
                    ];
                    if pda {
                        ev.push("PDA-signed: the program lends its PDA signature to the account-supplied program".into());
                    }
                    F {
                        accounts: vec![acct.clone()],
                        path: vec![l(&o.at)],
                        evidence: ev,
                        confidence: if pda {
                            "high"
                        } else if prog_acct {
                            "low"
                        } else {
                            "medium"
                        },
                        weight: w_of(o) + if pda { 4.0 } else { 2.0 },
                    }
                })
                .collect();
            push(
                "cpi-unchecked-program",
                "CPI to an account-supplied program id with no dominating check against a known id",
                fs,
            );
        }
        // value-move-no-signer
        {
            let signers = ix.accounts.iter().any(|x| x.has("signer")) || ix.checks.iter().any(|c| c.kinds.contains(&"signer"));
            let fs = if signers {
                vec![]
            } else {
                ix.ops
                    .iter()
                    .filter(|o| is_value_or_auth(o) && !runtime_authorized(o) && !init_mechanics(ix, o) && !o.anchor_close && !bound_crank(ix, o))
                    .take(3)
                    .map(|o| {
                        let pda = seeds(o) || o.has("PDA_SIGNATURE");
                        let mut ev = vec![t140(&o.text)];
                        if pda {
                            ev.push("the program signs it (PDA); no caller signature is required".into());
                        }
                        F {
                            accounts: super::phase2::op_accounts(o).into_iter().collect(),
                            path: vec![l(&o.at)],
                            evidence: ev,
                            confidence: if pda { "low" } else { "medium" },
                            weight: w_of(o),
                        }
                    })
                    .collect()
            };
            push("value-move-no-signer", "Value movement or authority change with no signer check and no PDA signature", fs);
        }
        // signer-not-related-to-authority
        push(
            "signer-not-related-to-authority",
            "Value movement or authority change with a signer but no relation between the signer key and a stored authority field",
            self.rule_signer_not_related(a, ix),
        );
        // check-bypassable
        {
            let mut fs = Vec::new();
            for o in ix.ops.iter().filter(|o| !runtime_authorized(o) && !init_mechanics(ix, o)) {
                for b in o.bypass.iter().flatten() {
                    if anchor && ix.checks[b.check].error == "return" {
                        continue;
                    }
                    let c = &ix.checks[b.check];
                    fs.push(F {
                        accounts: c.account.iter().filter(|a| !a.is_empty()).cloned().collect(),
                        path: b.path.iter().map(l).collect(),
                        evidence: vec![
                            format!("check {} ({}): fails if {}", l(&c.at), c.kinds.join(", "), js_slice(&c.cond, 0, Some(80))),
                            format!("operation {}: {}", l(&o.at), js_slice(&o.text, 0, Some(100))),
                            if b.strong {
                                "no other check of this kind on the path".into()
                            } else {
                                "another check of this kind is on the path".into()
                            },
                        ],
                        confidence: "info",
                        weight: w_of(o) + 1.0,
                    });
                }
            }
            push(
                "check-bypassable",
                "A signer / owner / key check exists but does not dominate a value movement or authority change",
                fs,
            );
        }
        // token-mint-unrelated
        {
            let mut fs = Vec::new();
            for o in &ix.ops {
                if !o.has("TOKEN_TRANSFER") || o.cpi(|c| c.ix.as_deref() != Some("Transfer")).unwrap_or(true) {
                    continue;
                }
                let d = o
                    .cpi(|c| c.accounts.iter().find(|x| x.role.as_deref() == Some("destination")).map(|x| x.text.clone()))
                    .flatten()
                    .and_then(|t| lead_name(&t));
                let Some(d) = d.filter(|d| ix.accounts.iter().any(|x| &x.name == d)) else {
                    continue;
                };
                let rw = row(ix, &d);
                let pda = rw.is_some_and(|x| x.has("pda"));
                let pre = format!("{d}.");
                let related = rw.is_some_and(|x| x.constraints.contains_key("token_mint") || x.constraints.contains_key("associated") || pda)
                    || rels(ix)
                        .iter()
                        .any(|x| (x.a.starts_with(&pre) || x.b.starts_with(&pre)) && format!("{}{}", x.a, x.b).contains("mint"));
                if !related {
                    fs.push(F {
                        accounts: vec![d.clone()],
                        path: vec![l(&o.at)],
                        evidence: vec![t140(&o.text), format!("no token::mint constraint / mint relation found for {d}")],
                        confidence: "low",
                        weight: w_of(o),
                    });
                }
            }
            fs.extend(mint_unanchored(ix));
            push(
                "token-mint-unrelated",
                "Token transfer (unchecked Transfer) whose destination mint is not related to the source / state mint",
                fs,
            );
        }
        // caller-controlled-sensitive-param
        {
            let mut fs = Vec::new();
            for (oi, o) in ix.ops.iter().enumerate() {
                let ss: Vec<&super::report::SrcRow> = o
                    .sources
                    .iter()
                    .flatten()
                    .filter(|s| {
                        s.trust == "caller-controlled"
                            && ((s.param == "program"
                                && !(o.cpi.is_some() && prog_account(ix, o).is_some_and(|p| !p.is_empty()))
                                && s.source != "instruction data"
                                && s.source != "remaining accounts")
                                || (o.has("AUTHORITY_WRITE")
                                    && nz(&o.target)
                                    && Some(&s.param) == o.target.as_ref()
                                    && !authorized(ix, oi)
                                    && !signer_key(ix, &s.source)
                                    && !init_write(ix, o)
                                    && !admin_gated(ix)))
                    })
                    .take(2)
                    .collect();
                for s in ss {
                    fs.push(F {
                        accounts: vec![s.source.clone()],
                        path: vec![l(&o.at)],
                        evidence: vec![format!("{} ← {} ({})", s.param, s.source, s.trust), js_slice(&o.text, 0, Some(120))],
                        confidence: "low",
                        weight: w_of(o),
                    });
                }
            }
            push(
                "caller-controlled-sensitive-param",
                "Caller-controlled value reaches a CPI program id, PDA seeds or an authority assignment",
                fs,
            );
        }
        // unverified-account-data
        push(
            "unverified-account-data",
            "Operation parameter read from the data of an account whose owner is not verified",
            rule_unverified(ix),
        );
        // sysvar-account-unchecked
        {
            let mut fs: Vec<F> = Vec::new();
            if let Some(au) = &ix.audit {
                for a0 in au.data_reads.iter().filter(|a| sysvar_name(a) && !address_checked(ix, a)) {
                    fs.push(F {
                        accounts: vec![a0.clone()],
                        path: vec![],
                        evidence: vec![
                            format!("the logic borrows {a0}'s data and reads it as a sysvar"),
                            format!("no check of {a0}'s key against the sysvar id found: any account with chosen data passes (Sysvar<T> / from_account_info / get() check or avoid it)"),
                        ],
                        confidence: "medium",
                        weight: 4.0,
                    });
                }
                for x in au.sysvar_reads.iter().flatten() {
                    if x.id_compared
                        || fs.iter().any(|y| y.accounts[0] == x.acct)
                        || address_checked(ix, &x.acct)
                        || found(ix, &x.acct, "key")
                        || found(ix, &x.acct, "owner")
                    {
                        continue;
                    }
                    let q = x.acct == "?";
                    fs.push(F {
                        accounts: vec![x.acct.clone()],
                        path: vec![l(&x.at)],
                        evidence: vec![
                            format!("{}'s data is parsed as the {} sysvar", if q { "an account" } else { &x.acct }, x.sysvar),
                            format!(
                                "no check of {} key against the sysvar id found: an account with forged data passes (load_instruction_at_checked / load_current_index_checked check it)",
                                if q { "its".to_string() } else { format!("{}'s", x.acct) }
                            ),
                        ],
                        confidence: if q { "info" } else { "medium" },
                        weight: 5.0,
                    });
                }
            }
            push(
                "sysvar-account-unchecked",
                "Sysvar data (Clock / Rent / Instructions / …) read from an account whose key is not checked against the sysvar id",
                fs,
            );
        }
        // pda-bump-from-ix
        {
            let fs = ix
                .audit
                .iter()
                .flat_map(|au| au.bumps.iter())
                .map(|(op, src)| {
                    let o = &ix.ops[*op];
                    F {
                        accounts: vec![],
                        path: vec![l(&o.at)],
                        evidence: vec![
                            t140(&o.text),
                            format!("bump seed ← {src}: the caller picks among several valid addresses (use find_program_address or a stored canonical bump)"),
                        ],
                        confidence: "medium",
                        weight: 3.0,
                    }
                })
                .collect();
            push(
                "pda-bump-from-ix",
                "PDA address from create_program_address with a bump taken from instruction data (not the canonical bump)",
                fs,
            );
        }
        push(
            "duplicate-mutable-accounts",
            "Two writable accounts of one type with no key comparison between them (the same account passed twice)",
            rule_duplicate(ix, anchor),
        );
        push(
            "account-type-unchecked",
            "Account data trusted in an authorization / value decision without a discriminator (type) check",
            rule_type_unchecked(a, xi),
        );
        // cpi-result-ignored
        {
            let fs = ix
                .audit
                .iter()
                .flat_map(|au| au.ignored.iter())
                .map(|i| {
                    let o = &ix.ops[*i];
                    F {
                        accounts: o.cpi(|c| c.program.clone()).into_iter().collect(),
                        path: vec![l(&o.at)],
                        evidence: vec![
                            t140(&o.text),
                            "no statement after the call reads its Result: an error returned before the CPI runs (e.g. a borrow failure) passes silently".into(),
                        ],
                        confidence: "medium",
                        weight: w_of(o) + 1.0,
                    }
                })
                .collect();
            push("cpi-result-ignored", "CPI whose result (the Result invoke / the CPI helper returns) is never tested", fs);
        }
        // truncating-cast
        {
            let fs = ix
                .audit
                .iter()
                .flat_map(|au| au.casts.iter())
                .map(|(op, expr, bits, src)| {
                    let o = &ix.ops[*op];
                    F {
                        accounts: vec![],
                        path: vec![l(&o.at)],
                        evidence: vec![
                            expr.clone(),
                            format!("a value from {src} is cast to {bits} bits before this operation: larger values wrap"),
                        ],
                        confidence: if crate::jre!(r"^ix\.|instruction data").is_match(src) { "medium" } else { "low" },
                        weight: 3.0,
                    }
                })
                .collect();
            push("truncating-cast", "Amount / balance narrowed (truncating cast) on a value path", fs);
        }
        // remaining-account-unchecked
        {
            let ok: IndexSet<&String> = ix.audit.iter().flat_map(|au| au.rem_checked.iter()).collect();
            let mut fs = Vec::new();
            for o in &ix.ops {
                let mut rs: IndexSet<String> = IndexSet::new();
                if let Some(t) = &o.target {
                    if crate::jre!(r"^remaining_accounts\[\d+\]\.").is_match(t)
                        && (o.how == Some("+=") || o.kinds.iter().any(|k| *k != "LAMPORT_WRITE"))
                    {
                        rs.insert(t.split('.').next().unwrap_or("").to_string());
                    }
                }
                if let Some(c) = &o.cpi {
                    for x in &c.borrow().accounts {
                        if x.role.as_ref().is_some_and(|r| !r.is_empty() && crate::jre!(r"^(destination|to|authority|owner|account)$").is_match(r)) {
                            if let Some(m) = crate::jre!(r"remaining_accounts\[\d+\]").find(&x.text) {
                                rs.insert(m.as_str().to_string());
                            }
                        }
                    }
                }
                for a0 in rs.into_iter().filter(|a| !ok.contains(a)) {
                    fs.push(F {
                        accounts: vec![a0.clone()],
                        path: vec![l(&o.at)],
                        evidence: vec![
                            t140(&o.text),
                            format!("{a0} (ctx.remaining_accounts) receives value / authority; no check of its key or owner found"),
                        ],
                        confidence: "medium",
                        weight: w_of(o),
                    });
                }
            }
            fs.truncate(2);
            push("remaining-account-unchecked", "Remaining account used as a destination / authority with no key or owner check", fs);
        }
        // init-if-needed-reinit
        {
            let fs = ix
                .audit
                .iter()
                .flat_map(|au| au.reinit.iter())
                .take(1)
                .map(|(op, acct)| {
                    let o = &ix.ops[*op];
                    F {
                        accounts: vec![acct.clone()],
                        path: vec![l(&o.at)],
                        evidence: vec![
                            t140(&o.text),
                            format!(
                                "{acct} may exist already (init_if_needed: its owner check on the existing account's path); no condition on the way reads its state: a second call overwrites {}",
                                o.target.as_deref().unwrap_or("undefined")
                            ),
                        ],
                        confidence: "medium",
                        weight: 5.0,
                    }
                })
                .collect();
            push(
                "init-if-needed-reinit",
                "Authority / state field of an init_if_needed account overwritten with no initialized check (reinitialization)",
                fs,
            );
        }
        // reinit-unchecked
        {
            let fs = ix
                .audit
                .iter()
                .flat_map(|au| au.init_writes.iter().flatten())
                .take(1)
                .map(|x| {
                    let owner = if x.owner { " (its owner is checked: an existing account of this program)" } else { "" };
                    match &x.field {
                        Some(field) if !field.is_empty() => F {
                            accounts: vec![x.acct.clone()],
                            path: vec![l(&x.at)],
                            evidence: vec![
                                format!(
                                    "writes the authority field {field}{}{owner}",
                                    x.tag.as_ref().filter(|t| !t.is_empty()).map_or(String::new(), |t| format!(" and the type tag ({t})"))
                                ),
                                format!(
                                    "{} is not created by the instruction and no condition on the way reads its data (an is_initialized flag, its state unpacked): calling it again on an initialized {} overwrites the authority",
                                    x.acct, x.acct
                                ),
                            ],
                            confidence: if nz(&x.tag) { "medium" } else { "info" },
                            weight: 3.0,
                        },
                        _ => F {
                            accounts: vec![x.acct.clone()],
                            path: vec![l(&x.at)],
                            evidence: vec![
                                format!("writes the {} discriminator into {}'s data{owner}", x.ty, x.acct),
                                format!(
                                    "{} is not created by the instruction and no condition on the way reads its data (discriminator == 0 / Anchor `zero` / an is_initialized flag): calling it again on a live {} overwrites it (e.g. its authority)",
                                    x.acct, x.ty
                                ),
                            ],
                            confidence: "medium",
                            weight: 5.0,
                        },
                    }
                })
                .collect();
            push(
                "reinit-unchecked",
                "Account initialized (its type discriminator written) with no check that it is uninitialized (reinitialization)",
                fs,
            );
        }
        push(
            "state-write-ungated",
            "Instruction writes program state with no signer check and no constraint gating the write",
            rule_state_write_ungated(ix),
        );
        // share-price-zero-supply
        {
            let fs = ix
                .divs
                .iter()
                .flatten()
                .filter(|d| d.status == "not_found")
                .take(2)
                .map(|d| F {
                    accounts: vec![],
                    path: vec![l(&d.at)],
                    evidence: vec![
                        format!(
                            "divisor {}: no comparison on it found on the way (a zero divisor aborts; a first depositor / donation can skew the ratio)",
                            d.divisor
                        ),
                        d.expr.clone(),
                    ],
                    confidence: if crate::jre!(r"\.amount\b|balance|lamports").is_match(&d.divisor) { "medium" } else { "low" },
                    weight: 4.0,
                })
                .collect();
            push(
                "share-price-zero-supply",
                "Division by a supply / balance-like value with no zero / minimum check on the way (empty or donated pool)",
                fs,
            );
        }
        push(
            "mint-burn-authority-from-data",
            "Mint / burn whose authority comes from account data rather than a signer",
            rule_mint_burn(ix),
        );
        // cpi-forwarder
        {
            let names: IndexSet<&String> = ix.accounts.iter().map(|x| &x.name).collect();
            let mut fs = Vec::new();
            for o in &ix.ops {
                let Some(c) = &o.cpi else { continue };
                let c = c.borrow().clone();
                if nz(&c.known) || c.program == "?" || nz(&c.seeds) {
                    continue;
                }
                let accts = &c.accounts;
                if accts.is_empty()
                    || !accts.iter().all(|x| {
                        crate::jre!(r"^\*?([A-Za-z_]\w*(?:\[\d+\])?)$")
                            .captures(super::js_trim(&x.text))
                            .is_some_and(|m| names.contains(&m[1].to_string()))
                            || x.text.contains("remaining")
                    })
                {
                    continue;
                }
                let data_caller = c.fields.is_empty()
                    || o.sources.iter().flatten().any(|s| {
                        s.trust == "caller-controlled" && (s.source == "instruction data" || s.source.starts_with("ix."))
                    });
                if !data_caller {
                    continue;
                }
                if prog_id_checked(ix, o, None) || o.has("PDA_SIGNATURE") {
                    continue;
                }
                fs.push(F {
                    accounts: vec![c.program.clone()],
                    path: vec![l(&o.at)],
                    evidence: vec![
                        t140(&o.text),
                        format!(
                            "{} accounts, all caller-provided; data {}; program id not compared with a known id",
                            accts.len(),
                            if c.fields.is_empty() { "not decoded" } else { "from the instruction data" }
                        ),
                    ],
                    confidence: "medium",
                    weight: 4.0,
                });
            }
            push(
                "cpi-forwarder",
                "Verbatim CPI forwarder: account-supplied program id, caller accounts passed through, no signer seeds",
                fs,
            );
        }
        // close-without-zeroing
        {
            let mut fs = Vec::new();
            for (oi, o) in ix.ops.iter().enumerate() {
                if !o.has("ACCOUNT_CLOSE") || o.cpi(|c| nz(&c.known) || nz(&c.family)).unwrap_or(false) {
                    continue;
                }
                let (zeroed, revived) = close_zeroing(self, ix, oi);
                let tg = o.target.clone().unwrap_or_else(|| "?".into());
                if let Some(rv) = revived {
                    fs.push(F {
                        accounts: vec![tg],
                        path: vec![l(&o.at)],
                        evidence: vec![js_slice(&o.text, 0, Some(120)), format!("realloc after the close: {rv}")],
                        confidence: "medium",
                        weight: 5.0,
                    });
                    continue;
                }
                if zeroed.is_some() {
                    continue;
                }
                fs.push(F {
                    accounts: vec![tg],
                    path: vec![l(&o.at)],
                    evidence: vec![
                        js_slice(&o.text, 0, Some(120)),
                        "lamports drained, but no data zeroing / closed discriminator / realloc(0) / owner reassignment found in the instruction".into(),
                    ],
                    confidence: "low",
                    weight: 4.0,
                });
            }
            push(
                "close-without-zeroing",
                "Account close without zeroing the data / discriminator, or followed by a realloc (revival)",
                fs,
            );
        }
        // unchecked-arithmetic
        {
            let mut xs: Vec<&super::phase3::ArithSite> = ix
                .arith
                .iter()
                .flatten()
                .filter(|x| {
                    x.status == "unchecked"
                        && !cannot_wrap(&x.expr)
                        && !(x.kind == "add" && crate::jre!(r" \+ (?:0x[0-9a-f]{1,2}|\d{1,3})$").is_match(&x.expr))
                })
                .collect();
            v8_sort(&mut xs, |x, y| {
                let d = y.caller.unwrap_or(false) as i32 - x.caller.unwrap_or(false) as i32;
                if d != 0 {
                    d
                } else if x.kind == "sub" {
                    -1
                } else {
                    1
                }
            });
            let fs = xs
                .into_iter()
                .take(3)
                .map(|x| {
                    let caller = x.caller.unwrap_or(false);
                    F {
                        accounts: vec![x.target.split('.').next().unwrap_or("").to_string()],
                        path: vec![l(&x.at)],
                        evidence: vec![
                            format!("{} ← {} ({})", x.target, x.expr, x.kind),
                            format!(
                                "no comparison of the operands found on the way{}{}",
                                if caller { "; operands include instruction data" } else { "" },
                                if x.unnamed.unwrap_or(false) { "; field not named (native layout)" } else { "" }
                            ),
                        ],
                        confidence: if caller && x.kind == "sub" { "medium" } else { "low" },
                        weight: if x.kind == "sub" { 3.0 } else { 2.0 },
                    }
                })
                .collect();
            push(
                "unchecked-arithmetic",
                "Wrapping (unchecked) addition / subtraction on a value path with no bound check on the way",
                fs,
            );
        }
        push(
            "recipient-unbound",
            "Recipient / destination with no owner, mint or key binding",
            rule_recipient_unbound(ix, anchor),
        );
        out
    }

    fn rule_signer_not_related(&self, a: &Analysis, ix: &IxOut) -> Vec<F> {
        let mut out = signer_unrelated(ix);
        out.extend(member_unsigned(ix));
        out.extend(cross_unrelated(ix));
        if !out.is_empty() {
            out.truncate(3);
            return out;
        }
        let signers: IndexSet<&String> = ix.accounts.iter().filter(|x| x.has("signer")).map(|x| &x.name).collect();
        let own = |o: &OpOut| {
            o.cpi(|c| {
                c.accounts.iter().any(|x| {
                    x.s.is_some_and(|v| v != 0.0 && !v.is_nan()) && signers.contains(&lead_name(&x.text).unwrap_or_default())
                })
            })
            .unwrap_or(false)
        };
        let rw = ix.authority.iter().flatten().find(|x| {
            let o = &ix.ops[x.op];
            !init_mechanics(ix, o) && !init_write(ix, o) && !own(o)
        });
        let wr = rw.is_none()
            && !ix.ops.iter().any(own)
            && !ix.checks.iter().any(|c| !nz(&c.account) && c.kinds.contains(&"custom"));
        let wrote = |acct: &str| -> Option<&OpOut> {
            if !wr {
                return None;
            }
            let pre = format!("{acct}.");
            ix.ops.iter().find(|o| {
                o.has("ACCOUNT_DATA_WRITE")
                    && o.target.as_ref().is_some_and(|t| t.starts_with(&pre))
                    && !init_mechanics(ix, o)
                    && !init_write(ix, o)
            })
        };
        let split = |field: &str| -> (String, String) {
            match field.find('.') {
                Some(i) => (field[..i].to_string(), field[i + 1..].to_string()),
                None => (js_slice(field, 0, Some(crate::util::u16len(field).saturating_sub(1))), field.to_string()),
            }
        };
        let afs = a.authority_fields.as_deref().unwrap_or(&[]);
        if !a.program.anchor
            || (rw.is_none() && !afs.iter().any(|x| wrote(&split(&x.0).0).is_some()))
            || ix.checks.iter().any(|c| c.kinds.contains(&"has_one") && !nz(&c.account) && c.sides.is_none())
        {
            return vec![];
        }
        let signer_key_of = |acct: &str| {
            ix.checks.iter().any(|c| {
                c.account.as_deref() == Some(acct)
                    && c.kinds.iter().any(|k| *k == "has_one" || *k == "key")
                    && !c.kinds.contains(&"pda")
                    && c.sides.is_none()
            })
        };
        let mut res = Vec::new();
        for (field, written_by) in afs {
            let (acct, f) = split(field);
            if !signers.contains(&f) || written_by.contains(&ix.name) || !ix.accounts.iter().any(|x| x.name == acct) {
                continue;
            }
            let fk = format!("{f}.key");
            let pa = format!("{acct}.");
            if rels(ix).iter().any(|x| {
                x.a == *field
                    || x.b == *field
                    || ((x.a == fk || x.b == fk) && (x.a.starts_with(&pa) || x.b.starts_with(&pa)))
            }) {
                continue;
            }
            if signer_key_of(&acct) {
                continue;
            }
            let o = match rw {
                Some(r) => Some(&ix.ops[r.op]),
                None => wrote(&acct),
            };
            let Some(o) = o else { continue };
            res.push(F {
                accounts: vec![f.clone(), acct.clone()],
                path: vec![l(&o.at)],
                evidence: vec![
                    t140(&o.text),
                    format!(
                        "{field} (the stored authority {} writes) is not compared with the signer {f}",
                        written_by.join(", ")
                    ),
                ],
                confidence: "low",
                weight: w_of(o),
            });
        }
        res.truncate(1);
        res
    }
}

fn rule_unverified(ix: &IxOut) -> Vec<F> {
    let mut out = Vec::new();
    for o in &ix.ops {
        let s = o.sources.iter().flatten().find(|s| {
            !s.source.ends_with(".key")
                && s.source != "instruction data"
                && !s.source.starts_with("ix.")
                && s.trust == "caller-controlled"
                && is_value_or_auth(o)
        });
        if let Some(s) = s {
            out.push(F {
                accounts: vec![s.source.split('.').next().unwrap_or("").to_string()],
                path: vec![l(&o.at)],
                evidence: vec![
                    format!("{} ← {}: the account's owner is not verified (no check found)", s.param, s.source),
                    js_slice(&o.text, 0, Some(120)),
                ],
                confidence: "low",
                weight: w_of(o),
            });
        }
    }
    if !out.is_empty() {
        return out;
    }
    let checked = |a: &str| {
        row(ix, a)
            .and_then(|x| x.constraints.get("owner"))
            .is_some_and(|c| c.status == "found" || c.status == "partial")
            || ix.ops.iter().any(|o| {
                o.target.as_deref() == Some(&format!("{a}.lamports")) && (o.has("ACCOUNT_CLOSE") || o.how == Some("-="))
            })
    };
    for o in &ix.ops {
        if !is_value_or_auth(o) || runtime_authorized(o) {
            continue;
        }
        for &ci in o.guards.iter().flatten() {
            let c = &ix.checks[ci];
            let a = c.sides.as_ref().and_then(|(x, y)| {
                [x, y]
                    .into_iter()
                    .map(|s| crate::jre!(r"^([A-Za-z_]\w*(?:\[\d+\])?)\.data\b").captures(s).map(|m| m[1].to_string()))
                    .find(|x| x.as_ref().is_some_and(|x| !x.is_empty() && !checked(x)))
                    .flatten()
            });
            if let Some(a) = a {
                let (x, y) = c.sides.as_ref().unwrap();
                return vec![F {
                    accounts: vec![a.clone()],
                    path: vec![l(&c.at), l(&o.at)],
                    evidence: vec![
                        format!("check {} reads {a}'s data ({x} == {y}); {a}'s owner is not checked", l(&c.at)),
                        js_slice(&o.text, 0, Some(120)),
                    ],
                    confidence: "low",
                    weight: w_of(o),
                }];
            }
        }
    }
    vec![]
}

fn rule_duplicate(ix: &IxOut, anchor: bool) -> Vec<F> {
    if !anchor {
        let owned = |n: &str| found(ix, n, "owner");
        let ws: Vec<&OpOut> = ix
            .ops
            .iter()
            .filter(|o| {
                o.has("ACCOUNT_DATA_WRITE")
                    && crate::jre!(r"^account\[\d+\]\.data\[\d+\.\.\d+\]$").is_match(o.target.as_deref().unwrap_or(""))
                    && owned(o.target.as_ref().unwrap().split('.').next().unwrap_or(""))
            })
            .collect();
        for x in &ws {
            for y in &ws {
                let xt = x.target.as_ref().unwrap();
                let yt = y.target.as_ref().unwrap();
                let ax = xt.split('.').next().unwrap_or("");
                let ay = yt.split('.').next().unwrap_or("");
                if super::report::js_str_cmp(ax, ay) != std::cmp::Ordering::Less || xt[ax.len()..] != yt[ay.len()..] {
                    continue;
                }
                let (kx, ky) = (format!("{ax}.key"), format!("{ay}.key"));
                if rels(ix).iter().any(|r| (r.a == kx && r.b == ky) || (r.a == ky && r.b == kx)) {
                    continue;
                }
                let both = format!("{}{}", x.text, y.text);
                if !both.contains(" - ") || !both.contains(" + ") {
                    continue;
                }
                return vec![F {
                    accounts: vec![ax.to_string(), ay.to_string()],
                    path: vec![l(&x.at), l(&y.at)],
                    evidence: vec![
                        format!(
                            "{ax} and {ay} (both owned by the program) are written at the same offset ({}): {} / {}",
                            &xt[ax.len() + 1..],
                            js_slice(&x.text, 0, Some(60)),
                            js_slice(&y.text, 0, Some(60))
                        ),
                        "no comparison of their keys found: passing one account twice makes both views of it, the last one written back wins (e.g. a debit undone by the credit)".into(),
                    ],
                    confidence: "medium",
                    weight: 4.0,
                }];
            }
        }
        return vec![];
    }
    let Some((tfn, tn, tty, taccts)) = ix.audit.as_ref().and_then(|a| a.same_type.as_ref()) else {
        return vec![];
    };
    if ix.checks.iter().any(|c| c.key_cmp) {
        return vec![];
    }
    let w: Vec<String> = ix.accounts.iter().filter(|x| x.expected.writable).map(|x| x.name.clone()).collect();
    let mine = |o: &OpOut| {
        let a = o.target.as_ref().map(|t| t.split('.').next().unwrap_or("").to_string());
        o.has("ACCOUNT_DATA_WRITE")
            && a.as_ref().is_some_and(|a| {
                !a.is_empty()
                    && (taccts.contains(a)
                        || match tty.as_ref().filter(|t| !t.is_empty()) {
                            Some(t) => *a == snake(t),
                            None => !ix.accounts.iter().any(|x| &x.name == a),
                        })
            })
    };
    let o = ix.ops.iter().find(|o| mine(o) && o.how != Some("="));
    let any = o.or_else(|| ix.ops.iter().find(|o| mine(o)));
    let Some(any) = any else { return vec![] };
    if w.len() < 2 || !taccts.iter().all(|a| w.contains(a)) {
        return vec![];
    }
    vec![F {
        accounts: w.clone(),
        path: vec![l(&any.at)],
        evidence: vec![
            format!("{tn} accounts deserialized by {tfn} (one type), {} writable ({})", w.len(), w.join(", ")),
            "no comparison of two account keys found: passing one account twice makes both views of it, the last one written back wins (e.g. a debit undone by the credit)".into(),
        ],
        confidence: if o.is_some() { "medium" } else { "low" },
        weight: 4.0,
    }]
}

fn rule_type_unchecked(a: &Analysis, xi: usize) -> Vec<F> {
    let ix = &a.ixs[xi];
    if !ix.ops.iter().any(|o| is_value_or_auth(o) && !runtime_authorized(o)) {
        return vec![];
    }
    if ix.kind != "anchor" {
        let tagged = |x: &str| {
            a.ixs.iter().enumerate().any(|(j, i)| {
                j != xi
                    && i.kind != "anchor"
                    && i.checks.iter().any(|c| {
                        c.account.as_deref() == Some(x) && c.kinds.contains(&"discriminator") && c.status == "found"
                    })
            })
        };
        let used = |x: &str| {
            let pre = format!("{x}.");
            tagged(x)
                && ix.ops.iter().any(|o| is_value_or_auth(o) && o.target.as_ref().is_some_and(|t| t.starts_with(&pre)))
                && ix.checks.iter().any(|c| {
                    c.account.as_deref() == Some(x)
                        && c.status == "found"
                        && c.kinds.contains(&"key")
                        && !c.kinds.contains(&"owner")
                        && !c.kinds.contains(&"address")
                        && !c.kinds.contains(&"pda")
                })
        };
        let created = |x: &str| {
            let pre = format!("{x}.");
            ix.checks.iter().any(|c| {
                c.account.as_deref() == Some(x)
                    && c.kinds.contains(&"owner")
                    && crate::jre!(r#""1{32}"|SYSTEM_PROGRAM"#).is_match(&c.cond)
            }) || ix.ops.iter().any(|o| {
                (o.has("ACCOUNT_CREATE") && o.target.as_ref().is_some_and(|t| t.starts_with(&pre)))
                    || o.cpi(|c| {
                        c.family.as_deref() == Some("system")
                            && crate::jre!(r"^(CreateAccount|Allocate|Assign)").is_match(c.ix.as_deref().unwrap_or(""))
                            && c.accounts.iter().any(|y| y.text.strip_prefix('*').unwrap_or(&y.text) == x)
                    })
                    .unwrap_or(false)
            })
        };
        return ix
            .accounts
            .iter()
            .filter(|x| found(ix, &x.name, "owner") && !found(ix, &x.name, "discriminator") && used(&x.name) && !created(&x.name))
            .take(1)
            .map(|x| F {
                accounts: vec![x.name.clone()],
                path: vec![],
                evidence: vec![
                    format!("{}: its owner is checked and its data used, no type tag (first data byte) comparison on it found", x.name),
                    "the program tells its account types by a tag byte elsewhere: another account type of the program with a matching layout passes".into(),
                ],
                confidence: "medium",
                weight: 3.0,
            })
            .collect();
    }
    let own = |a0: &str| {
        found(ix, a0, "owner")
            || ix
                .audit
                .as_ref()
                .and_then(|x| x.owner_cmp.as_ref())
                .is_some_and(|l| l.iter().any(|y| y == a0))
    };
    ix.audit
        .iter()
        .flat_map(|au| au.data_reads.iter())
        .filter(|a0| !sysvar_name(a0) && !address_checked(ix, a0) && !found(ix, a0, "discriminator") && own(a0))
        .take(2)
        .map(|a0| F {
            accounts: vec![a0.clone()],
            path: vec![],
            evidence: vec![
                format!("the logic reads {a0}'s data itself; its owner is checked, no discriminator check on it found"),
                "another account type of the same program with a matching layout passes the checks made on this data".into(),
            ],
            confidence: "medium",
            weight: 3.0,
        })
        .collect()
}

fn rule_state_write_ungated(ix: &IxOut) -> Vec<F> {
    if ix.accounts.iter().any(|x| x.has("signer")) || ix.checks.iter().any(|c| c.kinds.contains(&"signer")) {
        return vec![];
    }
    let gate = ["signer", "address", "pda", "custom", "state", "raw"];
    let mut tagged: IndexSet<String> = IndexSet::new();
    for o in &ix.ops {
        if crate::jre!(r"\.data\[0\.\.[18]\]$|\.discriminator$").is_match(o.target.as_deref().unwrap_or(""))
            && crate::jre!(r"^(0x[0-9a-f]+|\d+)$").is_match(o.value.as_deref().unwrap_or(""))
        {
            tagged.insert(o.target.as_ref().unwrap().split('.').next().unwrap_or("").to_string());
        }
    }
    if let Some(g) = ix.audit.as_ref().and_then(|a| a.init_gated.as_ref()) {
        tagged.extend(g.iter().cloned());
    }
    let gates = |c: &CheckOut| {
        c.kinds.iter().any(|k| {
            gate.contains(k)
                && (*k != "raw" || c.sides.is_some() || crate::jre!(r"memcmp|memeq|keyeq|is_signer|, 0x20\)").is_match(&c.cond))
        })
    };
    let ws: Vec<&OpOut> = ix
        .ops
        .iter()
        .filter(|o| {
            (o.has("ACCOUNT_DATA_WRITE") || o.has("AUTHORITY_WRITE"))
                && nz(&o.target)
                && !init_write(ix, o)
                && !tagged.contains(o.target.as_ref().unwrap().split('.').next().unwrap_or(""))
                && !o.guards.iter().flatten().any(|i| gates(&ix.checks[*i]))
        })
        .collect();
    if ws.is_empty() {
        return vec![];
    }
    let mut tg: IndexSet<String> = IndexSet::new();
    for o in &ws {
        tg.insert(o.target.clone().unwrap());
    }
    let any_guard = ws.iter().any(|o| o.guards.as_ref().is_some_and(|g| !g.is_empty()));
    let accts: IndexSet<String> = tg.iter().map(|t| t.split('.').next().unwrap_or("").to_string()).collect();
    let tgv: Vec<&String> = tg.iter().collect();
    vec![F {
        accounts: accts.into_iter().collect(),
        path: vec![l(&ws[0].at)],
        evidence: vec![
            format!(
                "writes {}{}",
                tgv.iter().take(4).map(|s| s.as_str()).collect::<Vec<_>>().join(", "),
                if tgv.len() > 4 { ", …" } else { "" }
            ),
            if any_guard {
                "only type / owner / size checks dominate the writes".into()
            } else {
                "no dominating check found".into()
            },
        ],
        confidence: if ws.iter().any(|o| o.has("AUTHORITY_WRITE")) || !any_guard { "medium" } else { "low" },
        weight: ws.iter().map(|o| w_of(o)).fold(2.0, f64::max),
    }]
}

fn rule_mint_burn(ix: &IxOut) -> Vec<F> {
    let mut out = Vec::new();
    for o in &ix.ops {
        if !o.has("MINT") && !o.has("BURN") {
            continue;
        }
        let au = o
            .cpi(|c| {
                c.accounts
                    .iter()
                    .find(|x| x.role.as_ref().is_some_and(|r| !r.is_empty() && crate::jre!(r"authority|owner").is_match(r)))
                    .cloned()
            })
            .flatten();
        let n = au
            .as_ref()
            .and_then(|a| crate::jre!(r"^\*?([A-Za-z_]\w*(?:\[\d+\])?)").captures(&a.text).map(|m| m[1].to_string()));
        let rw = n.as_ref().and_then(|n| row(ix, n));
        let signed = rw.is_some_and(|x| x.has("signer"));
        let from_data: Vec<&super::report::SrcRow> = o
            .sources
            .iter()
            .flatten()
            .filter(|s| au.as_ref().is_some_and(|a| a.role.as_ref() == Some(&s.param)) && !s.source.ends_with(".key") && s.source.contains('.'))
            .collect();
        let seeds_data: Vec<&super::report::SrcRow> = if !seeds(o) {
            vec![]
        } else {
            o.sources
                .iter()
                .flatten()
                .filter(|s| s.param == "signer seeds" && s.trust == "caller-controlled" && !s.source.ends_with(".key"))
                .collect()
        };
        if signed {
            continue;
        }
        if !from_data.is_empty() {
            out.push(F {
                accounts: vec![n.clone().unwrap_or_else(|| au.as_ref().unwrap().text.clone())],
                path: vec![l(&o.at)],
                evidence: vec![
                    t140(&o.text),
                    format!(
                        "authority ← {}",
                        from_data.iter().map(|s| format!("{} ({})", s.source, s.trust)).collect::<Vec<_>>().join(", ")
                    ),
                ],
                confidence: if from_data.iter().any(|s| s.trust == "caller-controlled") { "medium" } else { "low" },
                weight: w_of(o),
            });
            continue;
        }
        if !seeds_data.is_empty() {
            out.push(F {
                accounts: seeds_data.iter().map(|s| s.source.clone()).collect(),
                path: vec![l(&o.at)],
                evidence: vec![
                    t140(&o.text),
                    format!(
                        "PDA signer seeds from unverified account data: {}",
                        seeds_data.iter().map(|s| s.source.clone()).collect::<Vec<_>>().join(", ")
                    ),
                ],
                confidence: "low",
                weight: w_of(o),
            });
            continue;
        }
        if !seeds(o) && !o.has("PDA_SIGNATURE") && au.is_some() && rw.is_none() {
            let t = au.as_ref().unwrap().text.clone();
            out.push(F {
                accounts: vec![t.clone()],
                path: vec![l(&o.at)],
                evidence: vec![
                    t140(&o.text),
                    format!("authority {t} is not an identified account with a signer check (read from memory / data)"),
                ],
                confidence: "low",
                weight: w_of(o),
            });
        }
    }
    out
}

fn rule_recipient_unbound(ix: &IxOut, anchor: bool) -> Vec<F> {
    let mut out = Vec::new();
    for o in &ix.ops {
        let k = &o.kinds;
        if !k.iter().any(|x| *x == "TOKEN_TRANSFER" || *x == "LAMPORT_TRANSFER" || *x == "MINT") {
            continue;
        }
        let dest = o
            .cpi(|c| {
                c.accounts
                    .iter()
                    .find(|x| x.role.as_ref().is_some_and(|r| !r.is_empty() && crate::jre!(r"^(destination|to|account)$").is_match(r)))
                    .map(|x| x.text.clone())
            })
            .flatten();
        let d = dest.and_then(|t| crate::jre!(r"^\*?([A-Za-z_]\w*(?:\[\d+\])?)").captures(&t).map(|m| m[1].to_string()));
        let rw = d.as_ref().and_then(|d| row(ix, d));
        if rw.is_none()
            && !(d.as_ref().is_some_and(|d| !d.is_empty() && !anchor && crate::jre!(r"^account\[\d+\]$").is_match(d)) && !k.contains(&"MINT"))
        {
            continue;
        }
        let d = d.unwrap();
        let fnd = |c: &str| {
            rw.and_then(|x| x.constraints.get(c))
                .is_some_and(|e| e.status != "not_found" && e.status != "runtime")
        };
        let mut list: Vec<&str> = vec!["token_owner", "token_mint", "associated", "has_one", "key", "address", "pda", "signer"];
        if !anchor {
            list.push("owner");
        }
        let bind: Vec<&str> = list.into_iter().filter(|c| fnd(c)).collect();
        let pre = format!("{d}.");
        let rel = rels(ix).iter().any(|x| x.a.starts_with(&pre) || x.b.starts_with(&pre));
        if anchor && fnd("rent_exempt") {
            continue;
        }
        let seg = |n: &str| snake(n).split('_').next().unwrap_or("").to_string();
        let signers: Vec<&AcctOut> = ix.accounts.iter().filter(|x| x.expected.signer || x.has("signer")).collect();
        let who = if d.is_empty() || d.starts_with("account[") { None } else { Some(seg(&d)) };
        let party = who
            .as_ref()
            .and_then(|w| ix.accounts.iter().find(|x| x.name != d && snake(&x.name) == *w));
        let bound = party.is_some_and(|p| {
            let k = format!("{}.key", p.name);
            rels(ix).iter().any(|x| x.kind != "address" && (x.a == k || x.b == k))
        });
        let third = bound && !signers.iter().any(|x| Some(seg(&x.name)) == who);
        let owner_bound = ["token_owner", "associated", "has_one", "key", "address", "pda"]
            .iter()
            .any(|c| rw.and_then(|x| x.constraints.get(c)).map(|e| e.status) == Some("found"))
            || rels(ix).iter().any(|x| {
                x.kind != "compare" && [&x.a, &x.b].iter().any(|y| **y == format!("{d}.owner") || **y == format!("{d}.key"))
            });
        if if third { owner_bound } else { !bind.is_empty() || rel } {
            continue;
        }
        let conf = if signers.is_empty() || third {
            if seeds(o) {
                "medium"
            } else {
                "low"
            }
        } else {
            "info"
        };
        if conf == "info"
            && ix.checks.iter().any(|c| {
                !nz(&c.account) && c.kinds.iter().any(|x| crate::jre!(r"^(token_mint|token_owner|has_one|associated)$").is_match(x))
            })
        {
            continue;
        }
        out.push(F {
            accounts: vec![d.clone()],
            path: vec![l(&o.at)],
            evidence: vec![
                t140(&o.text),
                format!(
                    "{d}: no owner / mint / key / PDA / relation check found{}{}",
                    if seeds(o) { "; the program signs this outflow (PDA)" } else { "" },
                    if signers.is_empty() {
                        "; no signer check in the instruction".to_string()
                    } else if third {
                        format!("; named after {}, who does not sign", who.as_deref().unwrap_or("undefined"))
                    } else {
                        String::new()
                    }
                ),
            ],
            confidence: conf,
            weight: w_of(o),
        });
    }
    out
}
