//! Validation consistency across instructions (`src/analysis/consistency.ts`): the accounts of the same role
//! (IDL account type, data length, name) and the validations most of the other instructions apply to them.

use super::report::Loc;

#[derive(Clone, Debug)]
pub struct RoleMember {
    pub ix: String,
    pub account: String,
    pub validations: Vec<String>,
    pub uses: Vec<String>,
}

#[derive(Clone, Debug)]
pub struct Inconsistency {
    pub role: String,
    pub ix: String,
    pub account: String,
    pub validation: String,
    pub applied_in: Vec<(String, String, Option<Loc>)>,
    pub others: usize,
    pub uses: Vec<String>,
    pub weight: f64,
}

#[derive(Clone, Debug)]
pub struct RoleView {
    pub role: String,
    pub by: &'static str,
    pub members: Vec<RoleMember>,
    pub inconsistencies: Vec<Inconsistency>,
}

use super::report::{snake, AcctOut, Analysis, IxOut};
use crate::views::FT;
use indexmap::{IndexMap, IndexSet};
use std::collections::HashMap;

const OWNED: &str = "(owner-checked account)";
const VALUE: &[&str] = &[
    "TOKEN_TRANSFER",
    "LAMPORT_TRANSFER",
    "LAMPORT_WRITE",
    "MINT",
    "BURN",
    "ACCOUNT_CLOSE",
];

fn weight_of(k: &str) -> Option<f64> {
    match k {
        "owner" => Some(6.0),
        "type" => Some(5.0),
        "relation" => Some(4.0),
        _ => None,
    }
}

fn kind_of(v: &str) -> &str {
    if ["owner", "type", "signer", "writable", "address"].contains(&v) {
        v
    } else {
        "relation"
    }
}

/// the constant a data-length check compares with (a native unpack: Pack::LEN)
fn data_len(cond: &str) -> Option<String> {
    let m = crate::jre!(r"(?:==|!=|>=|<|>|<=) (0x[0-9a-f]+|\d+)\)?$")
        .captures(cond)
        .or_else(|| crate::jre!(r"^\(?(0x[0-9a-f]+|\d+) (?:==|!=)").captures(cond))?;
    if super::js_number(&m[1]) >= 16.0 {
        Some(m[1].to_string())
    } else {
        None
    }
}

fn has(x: &AcctOut, k: &str) -> bool {
    x.has(k)
}

fn field_of(side: &str, acct: &str) -> Option<String> {
    let rest = side.strip_prefix(acct)?.strip_prefix('.')?;
    if crate::jre!(r"^(key|owner|lamports|data_len|is_signer|is_writable|executable)$")
        .is_match(rest)
    {
        return None;
    }
    Some(crate::jre!(r"^data\b.*").replace(rest, "data").to_string())
}

fn tr(x: &Option<String>) -> bool {
    x.as_ref().is_some_and(|s| !s.is_empty())
}

/// the validations of a member: name -> where
type Vals = IndexMap<String, Option<Loc>>;

struct Member {
    ix: usize,
    x: usize,
    v: Vals,
    uses: Vec<String>,
}

fn same(x: &str, y: &str) -> bool {
    if x == y {
        return true;
    }
    let re = crate::jre!(r"^(.+) == (.+)$");
    let (Some(a), Some(b)) = (re.captures(x), re.captures(y)) else {
        return false;
    };
    a[2] == b[2]
        && !a[1].starts_with("key")
        && !b[1].starts_with("key")
        && (&a[1] == "stored key" || &b[1] == "stored key")
}

fn has_v(vs: &Vals, v: &str) -> bool {
    vs.contains_key(v) || vs.keys().any(|x| same(x, v))
}

impl<'a> super::An<'a> {
    /// consistency(a, r): validation consistency across the instructions of a role
    pub fn consistency(&self, a: &Analysis) -> Vec<RoleView> {
        let types = self.idl.map(|i| &i.types);
        let idl_accts: IndexSet<String> = self.idl.map_or(IndexSet::new(), |i| {
            i.accounts.iter().map(|x| x.0.clone()).collect()
        });
        let type_of = |ix: &IxOut, name: &str| -> Option<String> {
            if idl_accts.is_empty() {
                return None;
            }
            let h = self.funcs.iter().find(|x| x.name == ix.handler);
            let lay = h.and_then(|h| self.acct_layouts.get(&h.pc));
            let t = lay
                .and_then(|l| {
                    l.iter()
                        .find(|y| y.name == name || snake(&y.name) == snake(name))
                })
                .map(|y| &y.t);
            let lt = match t {
                Some(FT::Embed(s)) => Some(s.clone()),
                Some(FT::Ref(s)) if s != "AccountInfo" => Some(s.clone()),
                _ => None,
            };
            if let Some(lt) = lt {
                if idl_accts.contains(&lt) && types.is_none_or(|t| t.contains_key(&lt)) {
                    return Some(lt);
                }
            }
            self.idl.and_then(|i| {
                i.accounts
                    .iter()
                    .find(|y| snake(&y.0) == snake(name))
                    .map(|y| y.0.clone())
            })
        };
        let role_of = |ix: &IxOut, name: &str| -> Option<(String, &'static str)> {
            if let Some(t) = type_of(ix, name) {
                return Some((t, "type"));
            }
            let len = ix.checks.iter().find(|c| {
                c.account.as_deref() == Some(name)
                    && c.kinds.contains(&"data_len")
                    && data_len(&c.cond).is_some()
            });
            if let Some(c) = len {
                return Some((
                    format!("data_len {}", data_len(&c.cond).unwrap()),
                    "data_len",
                ));
            }
            let n = snake(name);
            if crate::jre!(r"^account\[\d+\]$|\?$").is_match(name)
                || crate::jre!(r"program|^(rent|clock|instructions?(_sysvar)?|sysvar\w*|\w+_sysvar|slot_?hashes|recent_\w+|stake_history|epoch_schedule|fees)$").is_match(&n)
            {
                None
            } else {
                Some((n, "name"))
            }
        };
        let roles: Vec<HashMap<String, (String, &'static str)>> = a
            .ixs
            .iter()
            .map(|ix| {
                let mut m = HashMap::new();
                for x in &ix.accounts {
                    if let Some(ro) = role_of(ix, &x.name) {
                        m.insert(x.name.clone(), ro);
                    }
                }
                m
            })
            .collect();
        let counter = |ii: usize, name: &str| -> Option<String> {
            if let Some(ro) = roles[ii].get(name) {
                return Some(ro.0.clone());
            }
            let x = a.ixs[ii].accounts.iter().find(|y| y.name == name)?;
            if has(x, "owner") {
                Some(OWNED.into())
            } else {
                None
            }
        };
        let acct_of_side = |ix: &IxOut, side: &str| -> Option<String> {
            ix.accounts
                .iter()
                .find(|x| side.starts_with(&format!("{}.", x.name)))
                .map(|x| x.name.clone())
        };
        let validations = |ii: usize, x: &AcctOut, by: &str| -> Vals {
            let ix = &a.ixs[ii];
            let mut out: Vals = IndexMap::new();
            let c = |k: &str| x.constraints.get(k);
            if has(x, "owner") && c("owner").unwrap().status != "runtime" {
                out.insert("owner".into(), c("owner").unwrap().at.clone());
            }
            if by != "data_len" && (has(x, "discriminator") || has(x, "data_len")) {
                out.insert(
                    "type".into(),
                    c("discriminator").or(c("data_len")).unwrap().at.clone(),
                );
            }
            if has(x, "signer") {
                out.insert("signer".into(), c("signer").unwrap().at.clone());
            }
            if has(x, "writable") {
                out.insert("writable".into(), c("writable").unwrap().at.clone());
            }
            if has(x, "address") || has(x, "pda") {
                out.insert(
                    "address".into(),
                    c("address").or(c("pda")).unwrap().at.clone(),
                );
            }
            for rel in ix.relations.iter().flatten() {
                if rel.kind == "address" || rel.kind == "compare" {
                    continue;
                }
                for (s, o) in [(&rel.a, &rel.b), (&rel.b, &rel.a)] {
                    let f = field_of(s, &x.name);
                    if tr(&f) && o.ends_with(".key") {
                        let y = &o[..o.len() - 4];
                        let cr = if y != x.name { counter(ii, y) } else { None };
                        if let Some(cr) = cr.filter(|s| !s.is_empty()) {
                            let f = f.unwrap();
                            out.insert(
                                format!(
                                    "{} == {cr}.key",
                                    if f == "data" { "stored key" } else { &f }
                                ),
                                Some(rel.at.clone()),
                            );
                        }
                    }
                    if *s == format!("{}.key", x.name) {
                        let y = acct_of_side(ix, o);
                        let f2 = y.as_ref().and_then(|y| field_of(o, y));
                        let cr = match &y {
                            Some(y) if !y.is_empty() && *y != x.name => counter(ii, y),
                            _ => None,
                        };
                        if let (true, Some(cr)) = (tr(&f2), cr.filter(|s| !s.is_empty())) {
                            let f2 = f2.unwrap();
                            out.insert(
                                format!(
                                    "key == {cr}.{}",
                                    if f2 == "data" { "(stored key)" } else { &f2 }
                                ),
                                Some(rel.at.clone()),
                            );
                        }
                    }
                }
            }
            out
        };
        let uses = |ix: &IxOut, name: &str, by: &str| -> Vec<String> {
            let mut out: IndexSet<String> = IndexSet::new();
            if by == "data_len" {
                out.insert("data unpacked".into());
            }
            let pre = format!("{name}.");
            for o in &ix.ops {
                if o.sources
                    .iter()
                    .flatten()
                    .any(|s| s.source.starts_with(&pre) && !s.source.ends_with(".key"))
                {
                    out.insert(format!(
                        "data read by {}",
                        o.kinds
                            .iter()
                            .find(|k| **k != "CPI")
                            .copied()
                            .unwrap_or("CPI")
                    ));
                }
                if o.kinds.iter().any(|k| VALUE.contains(k))
                    && (o.target.as_ref().is_some_and(|t| t.starts_with(&pre))
                        || o.cpi(|c| c.accounts.iter().any(|y| y.text == name))
                            .unwrap_or(false))
                {
                    out.insert(format!(
                        "value moved ({})",
                        o.kinds
                            .iter()
                            .filter(|k| VALUE.contains(k))
                            .copied()
                            .collect::<Vec<_>>()
                            .join(", ")
                    ));
                }
                if o.target.as_ref().is_some_and(|t| t.starts_with(&pre))
                    && (o.how == Some("+=") || o.how == Some("-="))
                {
                    out.insert("data updated (+= / -=)".into());
                }
            }
            for rel in ix.relations.iter().flatten() {
                if rel.kind != "address"
                    && (tr(&field_of(&rel.a, name)) || tr(&field_of(&rel.b, name)))
                {
                    out.insert("stored keys compared".into());
                    break;
                }
            }
            if ix.checks.iter().any(|c| {
                c.account.as_deref() == Some(name)
                    && c.kinds.iter().any(|k| *k == "state" || *k == "custom")
            }) {
                out.insert("data checked".into());
            }
            out.into_iter().collect()
        };
        let initializes = |ix: &IxOut, x: &AcctOut| -> bool {
            crate::jre!(r"(?i)^(init|initialize|create)(_|$)").is_match(&snake(&ix.name))
                || has(x, "zero")
                || has(x, "init")
                || (self.anchor && has(x, "rent_exempt"))
                || ix.ops.iter().any(|o| {
                    o.has("ACCOUNT_CREATE")
                        && o.cpi(|c| c.accounts.iter().any(|y| y.text == x.name))
                            .unwrap_or(false)
                })
        };
        let mut by_role: IndexMap<String, (&'static str, Vec<Member>)> = IndexMap::new();
        for (ii, ix) in a.ixs.iter().enumerate() {
            for (xi, x) in ix.accounts.iter().enumerate() {
                let Some(ro) = roles[ii].get(&x.name) else {
                    continue;
                };
                if initializes(ix, x) {
                    continue;
                }
                let g = by_role.entry(ro.0.clone()).or_insert((ro.1, vec![]));
                g.1.push(Member {
                    ix: ii,
                    x: xi,
                    v: validations(ii, x, ro.1),
                    uses: uses(ix, &x.name, ro.1),
                });
            }
        }
        let mut out: Vec<RoleView> = Vec::new();
        for (role, (by, members)) in &by_role {
            let mut ixs: IndexSet<usize> = IndexSet::new();
            for m in members {
                ixs.insert(m.ix);
            }
            if ixs.len() < 3 {
                continue;
            }
            let mut inc: Vec<Inconsistency> = Vec::new();
            let mut all: IndexSet<String> = IndexSet::new();
            for m in members {
                for k in m.v.keys() {
                    all.insert(k.clone());
                }
            }
            for m in members {
                if m.uses.is_empty() {
                    continue;
                }
                let mx = &a.ixs[m.ix].accounts[m.x];
                for v in &all {
                    if has_v(&m.v, v) {
                        continue;
                    }
                    let k = kind_of(v);
                    let cr: Option<String> = if k == "relation" {
                        crate::jre!(r"== (.+?)\.[^.]+$")
                            .captures(v)
                            .map(|c| c[1].to_string())
                    } else {
                        None
                    };
                    let eligible = |ii: usize| -> bool {
                        let Some(cr) = cr.as_ref().filter(|s| !s.is_empty()) else {
                            return true;
                        };
                        let ix = &a.ixs[ii];
                        ix.accounts.iter().any(|y| {
                            y.name != mx.name
                                && !initializes(ix, y)
                                && (roles[ii].get(&y.name).is_some_and(|r| &r.0 == cr)
                                    || (cr == OWNED
                                        && has(y, "owner")
                                        && !roles[ii].contains_key(&y.name)))
                        })
                    };
                    if !eligible(m.ix) {
                        continue;
                    }
                    if weight_of(k).is_none() || ((k == "owner" || k == "type") && self.anchor) {
                        continue;
                    }
                    let others: Vec<usize> = ixs
                        .iter()
                        .copied()
                        .filter(|&ii| ii != m.ix && eligible(ii))
                        .collect();
                    let applied: Vec<&Member> = members
                        .iter()
                        .filter(|o| o.ix != m.ix && has_v(&o.v, v) && others.contains(&o.ix))
                        .collect();
                    let n = applied
                        .iter()
                        .map(|o| o.ix)
                        .collect::<IndexSet<usize>>()
                        .len();
                    if n < 2 || n * 3 < others.len() * 2 {
                        continue;
                    }
                    let mut applied_in: Vec<(String, String, Option<Loc>)> = Vec::new();
                    let mut seen_ix: IndexSet<usize> = IndexSet::new();
                    for o in &applied {
                        if !seen_ix.insert(o.ix) {
                            continue;
                        }
                        let at = o.v.get(v).cloned().flatten().or_else(|| {
                            let key =
                                o.v.keys()
                                    .find(|x| same(x, v))
                                    .cloned()
                                    .unwrap_or_else(|| v.clone());
                            o.v.get(&key).cloned().flatten()
                        });
                        applied_in.push((
                            a.ixs[o.ix].name.clone(),
                            a.ixs[o.ix].accounts[o.x].name.clone(),
                            at,
                        ));
                    }
                    inc.push(Inconsistency {
                        role: role.clone(),
                        ix: a.ixs[m.ix].name.clone(),
                        account: mx.name.clone(),
                        validation: v.clone(),
                        applied_in,
                        others: others.len(),
                        uses: m.uses.clone(),
                        weight: weight_of(k).unwrap_or(1.0),
                    });
                }
            }
            inc.sort_by(|x, y| {
                y.weight
                    .partial_cmp(&x.weight)
                    .unwrap()
                    .then_with(|| y.applied_in.len().cmp(&x.applied_in.len()))
            });
            out.push(RoleView {
                role: role.clone(),
                by,
                members: members
                    .iter()
                    .map(|m| RoleMember {
                        ix: a.ixs[m.ix].name.clone(),
                        account: a.ixs[m.ix].accounts[m.x].name.clone(),
                        validations: m.v.keys().cloned().collect(),
                        uses: m.uses.clone(),
                    })
                    .collect(),
                inconsistencies: inc,
            });
        }
        out.sort_by(|x, y| {
            let wx = x.inconsistencies.first().map_or(0.0, |i| i.weight);
            let wy = y.inconsistencies.first().map_or(0.0, |i| i.weight);
            wy.partial_cmp(&wx)
                .unwrap()
                .then_with(|| y.members.len().cmp(&x.members.len()))
        });
        out
    }
}
