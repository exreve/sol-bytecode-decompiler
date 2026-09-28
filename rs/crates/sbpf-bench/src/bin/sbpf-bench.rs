//! Ground-truth benchmark of the analysis layer (bench/README.md): decompiles bench/bin/*.so as the CLI project
//! output does, compares security/analysis.json with bench/expected/<prog>.json and prints recall / precision.
//! Then the eval pairs (`sbpf_bench::eval`): skipped with a filter, filter "pairs" (or "eval") runs only them.
//! usage: sbpf-bench [--verbose] [filter]

#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use indexmap::{IndexMap, IndexSet};
use regex::Regex;
use sbpf_bench::*;
use serde_json::{json, Map, Value};
use std::collections::{BTreeMap, HashMap};
use std::path::PathBuf;
use std::sync::OnceLock;

const CATS: [&str; 6] = ["checks", "relations", "cpis", "writes", "pdas", "rules"];
// check kinds scored (others reported by the analysis, e.g. initialized / key / rent_exempt, are not)
const KINDS: [&str; 10] = [
    "signer",
    "writable",
    "owner",
    "discriminator",
    "pda",
    "has_one",
    "address",
    "token_mint",
    "token_owner",
    "close",
];
const WRITE_OPS: [&str; 3] = ["ACCOUNT_DATA_WRITE", "LAMPORT_WRITE", "AUTHORITY_WRITE"];

struct Job {
    prog: String,
    variant: Option<String>,
    so: PathBuf,
    idl: Option<Value>,
    eval_key: Option<String>,
}

#[derive(Default, Clone, Copy)]
struct Tp {
    tp: u32,
    fp: u32,
    fn_: u32,
}

struct GenRow {
    rule: String,
    n: u32,
    caught: u32,
    missed: Vec<String>,
}

#[derive(Default)]
struct SetTally {
    progs: u32,
    falses: Vec<String>,
    info: Vec<String>,
    not_found: Vec<String>,
    n: u32,
    caught: u32,
    lines: Vec<String>,
    extra: Vec<String>,
}

#[derive(Default)]
struct St {
    tally: [Tp; 6],
    misses: Vec<String>,
    falses: Vec<String>,
    variant_lines: Vec<String>,
    // generated programs (bench/gen, expected.generated): rules only, tallied apart from the six categories
    gen: IndexMap<String, GenRow>,
    gen_false: Vec<String>,
    gen_info: Vec<String>,
    gen_extra: Vec<String>,
    // labelled sets (expected.set, bench/real): 'realistic' clean programs (r_*), 'oss' open-source programs (o_*)
    sets: IndexMap<String, SetTally>,
    // informational expectations (expected.fund_movers)
    movers: Vec<(String, bool)>,
}

impl St {
    fn set_of(&mut self, s: &str) -> &mut SetTally {
        self.sets.entry(s.to_string()).or_default()
    }
}

fn cat(c: &str) -> usize {
    CATS.iter().position(|x| *x == c).unwrap()
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let verbose = args.iter().any(|a| a == "--verbose" || a == "-v");
    let filter = args.iter().find(|a| !a.starts_with('-')).cloned();
    let t0 = std::time::Instant::now();
    let root = repo_root().join("bench");
    let mut progs: Vec<String> = std::fs::read_dir(root.join("expected"))
        .expect("bench/expected")
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .filter(|f| f.ends_with(".json"))
        .map(|f| f[..f.len() - 5].to_string())
        .filter(|p| filter.as_ref().is_none_or(|f| p.contains(f.as_str())))
        .collect();
    progs.sort();
    let with_eval = filter.as_ref().is_none_or(|f| f == "eval" || f == "pairs");
    let exps: IndexMap<String, Value> = progs
        .iter()
        .map(|p| {
            (
                p.clone(),
                read_json(&root.join("expected").join(format!("{p}.json")))
                    .unwrap_or_else(|e| panic!("{e}")),
            )
        })
        .collect();
    let mut bins: Vec<String> = std::fs::read_dir(root.join("bin"))
        .expect("bench/bin")
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .collect();
    bins.sort();
    let mut jobs: Vec<Job> = vec![];
    for (prog, exp) in &exps {
        let idl = str_at(exp, "idl")
            .map(|f| read_json(&root.join("idl").join(f)).unwrap_or_else(|e| panic!("{e}")));
        jobs.push(Job {
            prog: prog.clone(),
            variant: None,
            so: root.join("bin").join(format!("{prog}.so")),
            idl: idl.clone(),
            eval_key: None,
        });
        let variants = exp.get("variants").and_then(Value::as_object);
        for (v, ve) in variants.into_iter().flatten() {
            let so = root.join("bin").join(format!("{prog}@{v}.so"));
            if !so.exists() {
                eprintln!("missing binary {prog}@{v}.so");
                continue;
            }
            let idl = match (&idl, ve.get("idl").and_then(Value::as_object)) {
                (Some(i), Some(p)) => Some(patch_idl(i, p)),
                _ => idl.clone(),
            };
            jobs.push(Job {
                prog: prog.clone(),
                variant: Some(v.clone()),
                so,
                idl,
                eval_key: None,
            });
        }
        let pre = format!("{prog}@");
        for f in &bins {
            if let Some(rest) = f.strip_prefix(&pre) {
                let v = rest
                    .strip_suffix(".so")
                    .unwrap_or(&rest[..rest.len().saturating_sub(3)]);
                let has = |k: &str| exp.get(k).and_then(|x| x.get(v)).is_some();
                if !has("variants") && !has("discarded") {
                    eprintln!("no expectation for {f}");
                }
            }
        }
    }
    if with_eval {
        for e in eval::eval_jobs() {
            jobs.push(Job {
                prog: String::new(),
                variant: None,
                so: e.so,
                idl: e.idl,
                eval_key: Some(e.key),
            });
        }
    }
    let out = run_all(&jobs);
    let mut st = St::default();
    for (prog, exp) in &exps {
        let bi = jobs
            .iter()
            .position(|j| &j.prog == prog && j.variant.is_none() && j.eval_key.is_none())
            .unwrap();
        let base = &out[bi];
        let base_findings = score_facts(&mut st, prog, exp, base);
        for m in arr_at(exp, "fund_movers") {
            let listed = fund_mover_listed(base, m, exp);
            st.movers.push((
                format!(
                    "{prog} {} ({} moves {})",
                    str_at(m, "ix").unwrap_or(""),
                    str_at(m, "authority").unwrap_or(""),
                    str_at(m, "from").unwrap_or("")
                ),
                listed,
            ));
        }
        for (i, j) in jobs.iter().enumerate() {
            if &j.prog == prog {
                if let Some(v) = &j.variant {
                    score_variant(&mut st, prog, v, exp, &out[i], &base_findings);
                }
            }
        }
    }
    if verbose {
        println!("variants:");
        for l in &st.variant_lines {
            println!("  {l}");
        }
        println!("misses ({}):", st.misses.len());
        for l in &st.misses {
            println!("  {l}");
        }
        println!("false reports ({}):", st.falses.len());
        for l in &st.falses {
            println!("  {l}");
        }
        println!();
    }
    if with_eval {
        let m: HashMap<String, Value> = jobs
            .iter()
            .zip(&out)
            .filter_map(|(j, a)| Some((j.eval_key.clone()?, a.clone())))
            .collect();
        for l in eval::score_eval(&m, verbose) {
            println!("{l}");
        }
        println!();
    }
    if !st.gen.is_empty() {
        print_generated(&st, verbose);
    }
    if !st.sets.is_empty() {
        print_sets(&st, verbose);
    }
    if !exps
        .values()
        .any(|e| !truthy(e.get("generated")) && !truthy(e.get("set")))
    {
        return;
    }
    let pct = |n: u32, d: u32| {
        if d > 0 {
            pad_start(&fixed1(100.0 * n as f64 / d as f64), 6)
        } else {
            "     -".into()
        }
    };
    println!("category      TP    FP    FN  recall  precision     F1");
    let mut f1s = vec![];
    for (ci, c) in CATS.iter().enumerate() {
        let Tp { tp, fp, fn_ } = st.tally[ci];
        let r = tp as f64 / (if tp + fn_ > 0 { tp + fn_ } else { 1 }) as f64;
        let p = tp as f64 / (if tp + fp > 0 { tp + fp } else { 1 }) as f64;
        let f1 = if r + p != 0.0 {
            2.0 * r * p / (r + p)
        } else {
            0.0
        };
        f1s.push(f1);
        println!(
            "{} {} {} {}  {}     {} {}",
            pad_end(c, 10),
            pad_start(&tp.to_string(), 5),
            pad_start(&fp.to_string(), 5),
            pad_start(&fn_.to_string(), 5),
            pct(tp, tp + fn_),
            pct(tp, tp + fp),
            pad_start(&fixed1(100.0 * f1), 6)
        );
    }
    let facts = st.tally[..5].iter().fold(Tp::default(), |a, t| Tp {
        tp: a.tp + t.tp,
        fp: a.fp + t.fp,
        fn_: a.fn_ + t.fn_,
    });
    let rules = st.tally[5];
    println!(
        "score {} (mean F1 of the 6 categories)  facts R {} P {}  rules {}/{} variants caught, {} false findings  [{} binaries, {}s]",
        fixed1(100.0 * f1s.iter().sum::<f64>() / f1s.len() as f64),
        pct(facts.tp, facts.tp + facts.fn_).trim(),
        pct(facts.tp, facts.tp + facts.fp).trim(),
        rules.tp,
        rules.tp + rules.fn_,
        rules.fp,
        jobs.len(),
        fixed1(t0.elapsed().as_millis() as f64 / 1000.0)
    );
}

/// The IDL with the listed instructions' accounts replaced (`name:ws` = writable, signer).
fn patch_idl(idl: &Value, patch: &Map<String, Value>) -> Value {
    let mut out = idl.clone();
    for (ix, accs) in patch {
        let ins = out
            .get_mut("instructions")
            .and_then(Value::as_array_mut)
            .expect("instructions");
        let i = ins
            .iter_mut()
            .find(|x| x.get("name").and_then(Value::as_str) == Some(ix))
            .expect("instruction");
        let list: Vec<Value> = accs
            .as_str()
            .unwrap_or("")
            .split_whitespace()
            .map(|a| {
                let (name, f) = a.split_once(':').unwrap_or((a, ""));
                let mut o = Map::new();
                o.insert("name".into(), json!(name));
                if f.contains('w') {
                    o.insert("writable".into(), json!(true));
                }
                if f.contains('s') {
                    o.insert("signer".into(), json!(true));
                }
                Value::Object(o)
            })
            .collect();
        i["accounts"] = Value::Array(list);
    }
    out
}

fn run_all(jobs: &[Job]) -> Vec<Value> {
    // big ones first
    let size = |j: &Job| {
        let s = j.so.to_string_lossy();
        let a = s
            .rfind('/')
            .is_some_and(|i| s[i + 1..].starts_with('a') || s[i + 1..].starts_with("g_a"));
        (if j.eval_key.is_some() { 2 } else { 0 }) + a as u32
    };
    let mut order: Vec<usize> = (0..jobs.len()).collect();
    order.sort_by_key(|&i| std::cmp::Reverse(size(&jobs[i])));
    let n = parallelism().saturating_sub(1).max(1);
    let res = par_map(&order, n, |&i| {
        let j = &jobs[i];
        let r = std::fs::read(&j.so)
            .map_err(|e| e.to_string())
            .and_then(|b| analysis_json(&b, j.idl.as_ref()));
        match r.and_then(|t| parse(&t)) {
            Ok(v) => v,
            Err(e) => {
                eprintln!("decompile failed: {}\n{e}", j.so.display());
                json!({ "instructions": [], "findings": [], "pdas": [], "state_writes": [] })
            }
        }
    });
    let mut out: Vec<Value> = vec![Value::Null; jobs.len()];
    for (k, v) in order.into_iter().zip(res) {
        out[k] = v;
    }
    out
}

// ---- normalization ----

fn opt(s: &str) -> bool {
    s.ends_with('?')
}
fn bare(s: &str) -> &str {
    s.strip_suffix('?').unwrap_or(s)
}

/// predicted instruction for an expected one: Anchor by name, native by dispatch tag
fn find_ix<'a>(a: &'a Value, name: &str, e: &Value) -> Option<&'a Value> {
    let tag = e.get("tag").filter(|t| !t.is_null());
    arr_at(a, "instructions").iter().find(|x| match tag {
        Some(t) => {
            str_at(x, "kind") == Some("native") && {
                let d = str_at(x, "dispatch").unwrap_or("");
                let p = format!("tag {}", js_string(t));
                d.starts_with(&p)
                    && !d[p.len()..]
                        .chars()
                        .next()
                        .is_some_and(|c| c.is_ascii_alphanumeric() || c == '_')
            }
        }
        None => str_at(x, "name") == Some(name),
    })
}

fn re(i: usize) -> &'static Regex {
    static R: OnceLock<Vec<Regex>> = OnceLock::new();
    &R.get_or_init(|| {
        [
            r"^(account\[([0-9]+)\]|[A-Za-z_][A-Za-z0-9_]*)\??",
            r"^(account\[[0-9]+\]|[A-Za-z_][A-Za-z0-9_]*)\??\.?",
            r"^data\[([0-9]+)(\.\.[0-9]+)?\]",
            r"^u8 |\(1 bytes\)$|^&?\[?bump",
            r#"^"([^\n\r]*)"$"#,
        ]
        .iter()
        .map(|r| Regex::new(r).unwrap())
        .collect()
    })[i]
}

/// account part of a reference (`vault.owner?`, `account[1].data[0..32]`, `h.lamports`) as an expected account name;
/// `alias`: names the analysis gave to account indices
fn acct_of(
    r: Option<&str>,
    names: &[String],
    alias: Option<&HashMap<String, usize>>,
) -> Option<String> {
    let m = re(0).captures(r?.trim())?;
    if let Some(i) = m.get(2) {
        return names.get(i.as_str().parse::<usize>().ok()?).cloned();
    }
    let n = m.get(1).unwrap().as_str();
    if names.iter().any(|x| x == n) {
        return Some(n.to_string());
    }
    names.get(*alias?.get(n)?).cloned()
}

/// `acct.field` / `acct.data[a..b]` / `acct.lamports` with the account resolved; data ranges keyed by their start
fn write_key(r: &str, names: &[String], alias: Option<&HashMap<String, usize>>) -> Option<String> {
    let a = acct_of(Some(r), names, alias)?;
    let rest = re(1).replace(r.trim(), "");
    Some(match re(2).captures(&rest) {
        Some(d) => format!("{a}.data@{}", &d[1]),
        None => format!("{a}.{}", rest.replace('?', "")),
    })
}

/// `["vault", *k, u8 l]` -> `vault/*` (the trailing bump dropped); none when nothing is known
fn seeds_key(s: Option<&str>) -> Option<String> {
    let s = s.filter(|s| s.starts_with('['))?;
    let chars: Vec<char> = s.chars().collect();
    let inner = if chars.len() >= 2 {
        &chars[1..chars.len() - 1]
    } else {
        &[][..]
    };
    let mut parts: Vec<String> = vec![];
    let (mut depth, mut cur, mut q) = (0i32, String::new(), false);
    for &ch in inner {
        if ch == '"' {
            q = !q;
        }
        if !q && "([{".contains(ch) {
            depth += 1;
        }
        if !q && ")]}".contains(ch) {
            depth -= 1;
        }
        if !q && depth == 0 && ch == ',' {
            parts.push(cur.trim().to_string());
            cur.clear();
        } else {
            cur.push(ch);
        }
    }
    if !cur.trim().is_empty() {
        parts.push(cur.trim().to_string());
    }
    if parts.last().is_some_and(|p| re(3).is_match(p)) {
        parts.pop();
    }
    if parts.is_empty() {
        return None;
    }
    Some(
        parts
            .iter()
            .map(|p| {
                re(4)
                    .captures(p)
                    .map_or("*".to_string(), |m| m[1].to_string())
            })
            .collect::<Vec<_>>()
            .join("/"),
    )
}

// ---- scoring ----

fn count(
    st: &mut St,
    c: &str,
    where_: &str,
    exp: &[String],
    pred: &IndexSet<String>,
    m: impl Fn(&str, &str) -> bool,
) {
    let ci = cat(c);
    let mut used: IndexSet<&str> = IndexSet::new();
    for e in exp {
        let p = pred
            .iter()
            .find(|p| !used.contains(p.as_str()) && m(bare(e), p));
        if let Some(p) = p {
            used.insert(p);
            if !opt(e) {
                st.tally[ci].tp += 1;
            }
        } else if !opt(e) {
            st.tally[ci].fn_ += 1;
            st.misses.push(format!("{where_} {c}: {e}"));
        }
    }
    for p in pred {
        if !used.contains(p.as_str()) {
            st.tally[ci].fp += 1;
            st.falses.push(format!("{where_} {c}: {p}"));
        }
    }
}

fn strs(v: &[Value]) -> Vec<String> {
    v.iter().map(js_string).collect()
}

fn score_facts(st: &mut St, prog: &str, exp: &Value, a: &Value) -> IndexSet<String> {
    let mut findings: IndexSet<String> = IndexSet::new();
    let set = str_at(exp, "set")
        .filter(|s| !s.is_empty())
        .map(String::from);
    let generated = truthy(exp.get("generated"));
    let empty = Map::new();
    for (name, e) in exp
        .get("instructions")
        .and_then(Value::as_object)
        .unwrap_or(&empty)
    {
        let where_ = format!("{prog} {name}");
        let names: Vec<String> = e
            .get("accounts")
            .and_then(Value::as_object)
            .map_or(vec![], |o| o.keys().cloned().collect());
        let ix = find_ix(a, name, e);
        if ix.is_none() && set.is_none() {
            st.misses.push(format!("{where_}: instruction not found"));
        }
        let mut checks = IndexSet::new();
        let mut rels = IndexSet::new();
        let mut cpis = IndexSet::new();
        let mut writes = IndexSet::new();
        let mut pdas = IndexSet::new();
        if let Some(ix) = ix {
            let ixname = str_at(ix, "name").unwrap_or("");
            let mut alias: HashMap<String, usize> = HashMap::new();
            for x in arr_at(ix, "accounts") {
                let (Some(i), Some(n)) =
                    (x.get("index").filter(|i| !i.is_null()), str_at(x, "name"))
                else {
                    continue;
                };
                if !names.iter().any(|y| y == n) {
                    alias.insert(n.to_string(), i.as_f64().unwrap_or(f64::NAN) as usize);
                }
            }
            let of = |r: Option<&str>| acct_of(r, &names, Some(&alias));
            for acc in arr_at(ix, "accounts") {
                if let Some(n) = of(str_at(acc, "name")) {
                    for (k, ev) in acc
                        .get("constraints")
                        .and_then(Value::as_object)
                        .unwrap_or(&empty)
                    {
                        let s = str_at(ev, "status");
                        if KINDS.contains(&k.as_str())
                            && (s == Some("found") || s == Some("partial"))
                        {
                            checks.insert(format!("{n}.{k}"));
                        }
                    }
                }
            }
            for c in arr_at(ix, "checks") {
                if let Some(n) = of(str_at(c, "account")) {
                    for k in arr_at(c, "kinds").iter().filter_map(Value::as_str) {
                        if KINDS.contains(&k) {
                            checks.insert(format!("{n}.{k}"));
                        }
                    }
                }
            }
            for r in arr_at(ix, "relations") {
                if str_at(r, "kind") == Some("address") {
                    continue;
                }
                if let (Some(x), Some(y)) = (of(str_at(r, "a")), of(str_at(r, "b"))) {
                    if x != y {
                        let mut v = [x, y];
                        v.sort();
                        rels.insert(v.join("~"));
                    }
                }
            }
            for o in arr_at(ix, "operations") {
                let cpi = o.get("cpi");
                if let Some(c) = cpi.filter(|c| truthy(c.get("instruction"))) {
                    cpis.insert(format!(
                        "{}.{}",
                        js_string(&c["program"]),
                        js_string(&c["instruction"])
                    ));
                }
                if truthy(o.get("target"))
                    && arr_at(o, "kinds")
                        .iter()
                        .any(|k| k.as_str().is_some_and(|k| WRITE_OPS.contains(&k)))
                {
                    if let Some(w) =
                        write_key(str_at(o, "target").unwrap_or(""), &names, Some(&alias))
                    {
                        writes.insert(w);
                    }
                }
                for s in [
                    o.get("pda").and_then(|p| str_at(p, "seeds")),
                    cpi.and_then(|c| str_at(c, "seeds")),
                ] {
                    if let Some(k) = seeds_key(s) {
                        pdas.insert(k);
                    }
                }
            }
            for p in arr_at(a, "pdas") {
                let has = |k: &str| arr_at(p, k).iter().any(|x| x.as_str() == Some(ixname));
                if has("derived_in") || has("signs_in") {
                    if let Some(k) = seeds_key(str_at(p, "seeds")) {
                        pdas.insert(k);
                    }
                }
            }
            for sw in arr_at(a, "state_writes") {
                if arr_at(sw, "writes")
                    .iter()
                    .any(|w| str_at(w, "ix") == Some(ixname))
                {
                    if let Some(w) =
                        write_key(str_at(sw, "target").unwrap_or(""), &names, Some(&alias))
                    {
                        writes.insert(w);
                    }
                }
            }
            for f in arr_at(a, "findings") {
                if str_at(f, "instruction") == Some(ixname) {
                    findings.insert(format!("{}@{name}", js_string(&f["rule"])));
                }
            }
        }
        if generated || set.is_some() {
            if let Some(ix) = ix {
                for k in consistency_at(a, str_at(ix, "name").unwrap_or("")) {
                    let l = format!("{prog} (base) {name}: {k}");
                    match &set {
                        Some(s) => st.set_of(s).info.push(l),
                        None => st.gen_info.push(l),
                    }
                }
            }
            if ix.is_none() {
                if let Some(s) = &set {
                    st.set_of(s).not_found.push(where_.clone());
                }
            }
            continue;
        }
        let mut exp_checks = vec![];
        for (n, ks) in e
            .get("accounts")
            .and_then(Value::as_object)
            .unwrap_or(&empty)
        {
            for k in ks.as_array().into_iter().flatten() {
                exp_checks.push(format!("{n}.{}", js_string(k)));
            }
        }
        count(st, "checks", &where_, &exp_checks, &checks, |x, p| x == p);
        let exp_rels: Vec<String> = arr_at(e, "relations")
            .iter()
            .map(|r| {
                let mut v = strs(r.as_array().map_or(&[][..], |a| a.as_slice()));
                v.sort();
                v.join("~")
            })
            .collect();
        count(st, "relations", &where_, &exp_rels, &rels, |x, p| x == p);
        count(
            st,
            "cpis",
            &where_,
            &strs(arr_at(e, "cpis")),
            &cpis,
            |x, p| {
                let (xp, xi) = split_dot(x);
                let (pp, pi) = split_dot(p);
                // an account-supplied program id matches by instruction
                xi == pi
                    && (xp == pp
                        || !pp
                            .chars()
                            .all(|c| c.is_ascii_uppercase() || c == '_' || c.is_ascii_digit())
                        || pp.is_empty())
            },
        );
        let exp_writes: Vec<String> = strs(arr_at(e, "writes"))
            .iter()
            .map(|w| {
                let k = |s: &str| write_key(s, &names, None).unwrap_or_else(|| "undefined".into());
                if opt(w) {
                    k(bare(w)) + "?"
                } else {
                    k(w)
                }
            })
            .collect();
        count(st, "writes", &where_, &exp_writes, &writes, |x, p| x == p);
        count(
            st,
            "pdas",
            &where_,
            &strs(arr_at(e, "pdas")),
            &pdas,
            |x, p| x == p,
        );
    }
    if let Some(s) = &set {
        st.set_of(s).progs += 1;
    }
    for f in &findings {
        if let Some(s) = &set {
            st.set_of(s).falses.push(format!("{prog} (base): {f}"));
        } else if generated {
            st.gen_false.push(format!("{prog} (base): {f}"));
        } else {
            st.tally[5].fp += 1;
            st.falses.push(format!("{prog} (base) rules: {f}"));
        }
    }
    findings
}

/// `x.split('.')`'s first two parts ('' when missing: never equal to a real part here)
fn split_dot(s: &str) -> (&str, Option<&str>) {
    let mut it = s.split('.');
    (it.next().unwrap_or(""), it.next())
}

fn score_variant(
    st: &mut St,
    prog: &str,
    v: &str,
    exp: &Value,
    a: &Value,
    base_findings: &IndexSet<String>,
) {
    let ve = &exp["variants"][v];
    let vix = str_at(ve, "ix").unwrap_or("");
    let rules = strs(arr_at(ve, "rules"));
    let set = str_at(exp, "set")
        .filter(|s| !s.is_empty())
        .map(String::from);
    let generated = truthy(exp.get("generated"));
    let ix = find_ix(a, vix, &exp["instructions"][vix]);
    let mut got: IndexSet<String> = IndexSet::new();
    let empty = Map::new();
    for (name, e) in exp
        .get("instructions")
        .and_then(Value::as_object)
        .unwrap_or(&empty)
    {
        let x = find_ix(a, name, e);
        if let Some(x) = x {
            let xn = str_at(x, "name").unwrap_or("");
            for f in arr_at(a, "findings") {
                if str_at(f, "instruction") == Some(xn) {
                    got.insert(format!("{}@{name}", js_string(&f["rule"])));
                }
            }
            if (generated || set.is_some()) && !consistency_at(a, xn).is_empty() {
                got.insert(format!("~consistency@{name}"));
            }
        }
    }
    let at = format!("@{vix}");
    let hit = rules.iter().find(|r| got.contains(&format!("{r}@{vix}")));
    let at_ix = |with_base: bool| {
        let v: Vec<String> = got
            .iter()
            .filter(|f| f.ends_with(&at))
            .map(|f| {
                if with_base && base_findings.contains(f) {
                    format!("{f} (also on the clean build)")
                } else {
                    f.clone()
                }
            })
            .collect();
        if v.is_empty() {
            "nothing".to_string()
        } else {
            v.join(", ")
        }
    };
    let is_expected = |f: &str| rules.iter().any(|r| f == format!("{r}@{vix}"));
    if let Some(s) = &set {
        // caught: an accepted rule at the instruction that the clean build does not report there already
        let hit_new = rules.iter().find(|r| {
            let k = format!("{r}@{vix}");
            got.contains(&k) && !base_findings.contains(&k)
        });
        let extra: Vec<String> = got
            .iter()
            .filter(|f| !base_findings.contains(*f) && !f.starts_with('~') && !is_expected(f))
            .map(|f| format!("{prog}@{v}: {f}"))
            .collect();
        let line = format!(
            "{} {prog}@{v}: {} @{vix}{}{}",
            if hit_new.is_some() {
                "caught"
            } else {
                "MISSED"
            },
            rules.join(" | "),
            if ix.is_some() {
                ""
            } else {
                " (instruction not found)"
            },
            if hit_new.is_some() {
                String::new()
            } else {
                format!("  (reported there: {})", at_ix(true))
            }
        );
        let t = st.set_of(s);
        t.n += 1;
        if hit_new.is_some() {
            t.caught += 1;
        }
        t.extra.extend(extra);
        t.lines.push(line);
        return;
    }
    if generated {
        let missed = format!(
            "{prog}@{v}{}: {} @{vix}",
            if ix.is_some() {
                ""
            } else {
                " (instruction not found)"
            },
            at_ix(false)
        );
        let g = st.gen.entry(v.to_string()).or_insert_with(|| GenRow {
            rule: rules.first().cloned().unwrap_or_else(|| "undefined".into()),
            n: 0,
            caught: 0,
            missed: vec![],
        });
        g.n += 1;
        if hit.is_some() {
            g.caught += 1;
        } else {
            g.missed.push(missed);
        }
        for f in &got {
            if !base_findings.contains(f) && !f.starts_with('~') && !is_expected(f) {
                st.gen_extra.push(format!("{prog}@{v}: {f}"));
            }
        }
        return;
    }
    if hit.is_some() {
        st.tally[5].tp += 1;
    } else {
        st.tally[5].fn_ += 1;
        st.misses.push(format!(
            "{prog}@{v} rules: {} @{vix}{}",
            rules.join(" | "),
            if ix.is_some() {
                ""
            } else {
                " (instruction not found)"
            }
        ));
    }
    let extra: Vec<&String> = got
        .iter()
        .filter(|f| !base_findings.contains(*f) && !is_expected(f))
        .collect();
    for f in &extra {
        st.tally[5].fp += 1;
        st.falses.push(format!("{prog}@{v} rules: {f}"));
    }
    st.variant_lines.push(format!(
        "{} {prog}@{v}: {} @{vix}{}",
        if hit.is_some() { "caught" } else { "MISSED" },
        rules.join(" | "),
        if extra.is_empty() {
            String::new()
        } else {
            format!(
                "  (+{})",
                extra
                    .iter()
                    .map(|s| s.as_str())
                    .collect::<Vec<_>>()
                    .join(", ")
            )
        }
    ));
}

/// the expected authority-only fund move is listed in analysis.json fund_movers (instruction + authority account)
fn fund_mover_listed(a: &Value, m: &Value, exp: &Value) -> bool {
    let mix = str_at(m, "ix").unwrap_or("");
    let Some(ix) = find_ix(a, mix, &exp["instructions"][mix]) else {
        return false;
    };
    let ixn = str_at(ix, "name");
    let idx = m
        .get("index")
        .filter(|v| !v.is_null())
        .map_or("undefined".to_string(), js_string);
    let want = [
        js_string(m.get("authority").unwrap_or(&Value::Null)),
        format!("account[{idx}]"),
    ];
    arr_at(a, "fund_movers").iter().any(|x| {
        let au = x
            .get("authority")
            .filter(|v| !v.is_null())
            .map_or(String::new(), js_string);
        let first = au
            .split(|c: char| c == '.' || c.is_whitespace())
            .next()
            .unwrap_or("");
        str_at(x, "instruction") == ixn && want.iter().any(|w| w == first)
    })
}

/// validation_consistency inconsistencies at an instruction (`account lacks validation`)
fn consistency_at(a: &Value, ix: &str) -> Vec<String> {
    let mut out = vec![];
    for r in arr_at(a, "validation_consistency") {
        for x in arr_at(r, "inconsistencies") {
            if str_at(x, "instruction") == Some(ix) {
                out.push(format!(
                    "~consistency {} lacks {}",
                    str_at(x, "account").unwrap_or(""),
                    str_at(x, "validation").unwrap_or("")
                ));
            }
        }
    }
    out
}

fn print_generated(st: &St, verbose: bool) {
    println!(
        "generated variants (bench/gen): property   accepted rule (first)              caught"
    );
    let (mut n, mut c) = (0, 0);
    let mut rows: Vec<(&String, &GenRow)> = st.gen.iter().collect();
    rows.sort_by(|a, b| {
        sbpf_read::analysis::locale_cmp(&a.1.rule, &b.1.rule)
            .then_with(|| sbpf_read::analysis::locale_cmp(a.0, b.0))
    });
    for (v, g) in rows {
        n += g.n;
        c += g.caught;
        println!(
            "  {} {} {}",
            pad_end(v, 22),
            pad_end(&g.rule, 34),
            pad_start(&format!("{}/{}", g.caught, g.n), 6)
        );
    }
    if verbose {
        for g in st.gen.values() {
            for m in &g.missed {
                println!("  MISSED {m}");
            }
        }
        for f in &st.gen_false {
            println!("  FALSE {f}");
        }
        for f in &st.gen_info {
            println!("  info on a clean base: {f}");
        }
        for f in &st.gen_extra {
            println!("  extra {f}");
        }
    }
    if !st.movers.is_empty() {
        println!(
            "  fund movers listed (informational, analysis.json fund_movers): {}/{}",
            st.movers.iter().filter(|m| m.1).count(),
            st.movers.len()
        );
        if verbose {
            for (w, l) in &st.movers {
                println!("  {} {w}", if *l { "listed" } else { "NOT LISTED" });
            }
        }
    }
    println!(
        "generated (template set): {c}/{n} variants caught ({}%), {} false findings on the clean bases (+{} inconsistencies), {} unexpected findings in variants",
        fixed1(100.0 * c as f64 / (if n > 0 { n } else { 1 }) as f64),
        st.gen_false.len(),
        st.gen_info.len(),
        st.gen_extra.len()
    );
    println!();
}

fn print_sets(st: &St, verbose: bool) {
    let sorted: BTreeMap<&String, &SetTally> = st.sets.iter().collect();
    for (name, t) in sorted {
        if verbose {
            for l in &t.lines {
                println!("  {l}");
            }
            for f in &t.falses {
                println!("  FALSE {f}");
            }
            for f in &t.info {
                println!("  info on a clean base: {f}");
            }
            if !t.not_found.is_empty() {
                println!(
                    "  instructions not found (not scored on the base): {}",
                    t.not_found.join(", ")
                );
            }
            for f in &t.extra {
                println!("  extra {f}");
            }
        }
        let label = if name == "realistic" {
            "realistic clean programs (bench/real*, r_*)"
        } else {
            "open-source programs (bench/real o_*)"
        };
        println!(
            "{label}: {} clean programs, {} false findings (+{} inconsistencies{}){}",
            t.progs,
            t.falses.len(),
            t.info.len(),
            if t.not_found.is_empty() {
                String::new()
            } else {
                format!(", {} instructions not found", t.not_found.len())
            },
            if t.n > 0 {
                format!(
                    "; {}/{} variants caught (recall {}%), {} unexpected findings in variants",
                    t.caught,
                    t.n,
                    fixed1(100.0 * t.caught as f64 / t.n as f64),
                    t.extra.len()
                )
            } else {
                String::new()
            }
        );
    }
    println!();
}
