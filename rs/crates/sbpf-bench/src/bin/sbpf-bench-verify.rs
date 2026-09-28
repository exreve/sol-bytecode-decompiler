//! Label verification of the bench/real variants (bench/README.md, "Realistic and open-source sets"): decompiles every
//! variant's clean build and the variant as the CLI project does and prints, at the variant's instruction, the evidence
//! that the removed validation is in the clean build's code and not in the variant's:
//!  - code: check-related tokens of the instruction's decompiled bundle (bundle/<ix>.ts) whose count differs: Anchor
//!    error constants (`anchor::ConstraintHasOne`), ProgramError returns, logged messages, the Anchor account types
//!    whose try_accounts the handler calls (`Signer::try_accounts`), is_signer reads, memcmp calls, PDA derivations;
//!  - program: the same tokens over the whole decompiled program (every .ts file but bundle/ and lib.d.ts), for code
//!    shared by several instructions or instructions the analysis does not dispatch;
//!  - analysis: per-account checks of security/analysis.json found in one build and not in the other.
//! The expected file records the result (variants.<v>.verified: code / analysis, plus a hand-written note where the
//! tokens do not show it). usage: sbpf-bench-verify [--write] [filter]

#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use indexmap::{IndexMap, IndexSet};
use regex::Regex;
use sbpf_bench::*;
use serde_json::{json, Map, Value};
use std::path::Path;

type Project = sbpf_ir::fx::IndexMap<String, String>;

fn project(bench: &Path, so: &str, idl: Option<&Value>) -> Project {
    let bytes = std::fs::read(bench.join("bin").join(so)).unwrap_or_else(|e| panic!("{so}: {e}"));
    let info = idl.map(sbpf_read::idl::parse_idl);
    let threads = parallelism();
    let r = sbpf_read::decompile::decompile_read_opts(
        &bytes,
        info.as_ref(),
        threads,
        false,
        None,
        None,
    )
    .unwrap_or_else(|e| panic!("{so}: {e}"));
    sbpf_read::layout::render_project(&r)
}

fn whole(p: &Project) -> String {
    p.iter()
        .filter(|(k, _)| k.ends_with(".ts") && !k.starts_with("bundle/") && *k != "lib.d.ts")
        .map(|(_, v)| v.as_str())
        .collect::<Vec<_>>()
        .join("\n")
}

fn token_diff(b: &IndexMap<String, i64>, v: &IndexMap<String, i64>) -> String {
    let keys: IndexSet<&String> = b.keys().chain(v.keys()).collect();
    let mut diff = vec![];
    for k in keys {
        let d = v.get(k).copied().unwrap_or(0) - b.get(k).copied().unwrap_or(0);
        if d != 0 {
            diff.push(format!("{}{d} {k}", if d > 0 { "+" } else { "" }));
        }
    }
    if diff.is_empty() {
        "no check-related token differs".into()
    } else {
        diff.join(", ")
    }
}

/// instruction of the analysis: Anchor by name, native by dispatch tag
fn ix_of<'a>(a: &'a Value, name: &str, tag: Option<&Value>) -> Option<&'a Value> {
    arr_at(a, "instructions").iter().find(|x| match tag {
        Some(t) => {
            let d = str_at(x, "dispatch").unwrap_or("");
            let p = format!("tag {}", js_string(t));
            d.starts_with(&p)
                && !d[p.len()..]
                    .chars()
                    .next()
                    .is_some_and(|c| c.is_ascii_alphanumeric() || c == '_')
        }
        None => str_at(x, "name") == Some(name),
    })
}

struct Res {
    comment: Regex,
    log: Regex,
    try_accounts: Regex,
    is_signer: Regex,
    memcmp: Regex,
    pda: Regex,
    head: Regex,
}

/// check-related tokens of a decompiled bundle, with counts
fn tokens(re: &Res, code: &str) -> IndexMap<String, i64> {
    let mut out: IndexMap<String, i64> = IndexMap::new();
    let mut add = |t: String| *out.entry(t).or_insert(0) += 1;
    for m in re.comment.captures_iter(code) {
        add(m[1].to_string());
    }
    for m in re.log.captures_iter(code) {
        add(format!("log \"{}\"", &m[1]));
    }
    for m in re.try_accounts.captures_iter(code) {
        add(format!(
            "{}::try_accounts",
            m[1].rsplit("::").next().unwrap_or("")
        ));
    }
    for _ in re.is_signer.find_iter(code) {
        add(".is_signer read".into());
    }
    for m in re.memcmp.captures_iter(code) {
        add(m[1].to_string());
    }
    for m in re.pda.captures_iter(code) {
        add(m[1].to_string());
    }
    // call sites of the functions that return MissingRequiredSignature (a signer-check helper such as validate_owner)
    let heads: Vec<(usize, String)> = re
        .head
        .captures_iter(code)
        .map(|c| (c.get(0).unwrap().start(), c[1].to_string()))
        .collect();
    let mut signer_fns: IndexSet<&str> = IndexSet::new();
    for (i, (at, name)) in heads.iter().enumerate() {
        let end = heads.get(i + 1).map_or(code.len(), |h| h.0);
        if code[*at..end].contains("MissingRequiredSignature") {
            signer_fns.insert(name);
        }
    }
    for f in signer_fns {
        let call = Regex::new(&format!(r"(?-u:\b){}\(", regex::escape(f))).unwrap();
        for m in call.find_iter(code) {
            if !code[..m.start()].ends_with("function ") {
                add("call of a function returning MissingRequiredSignature".into());
            }
        }
    }
    out
}

fn constraints(ix: Option<&Value>) -> IndexSet<String> {
    let mut s = IndexSet::new();
    let Some(ix) = ix else { return s };
    for acc in arr_at(ix, "accounts") {
        for (k, v) in acc
            .get("constraints")
            .and_then(Value::as_object)
            .into_iter()
            .flatten()
        {
            let st = str_at(v, "status");
            if st == Some("found") || st == Some("partial") {
                s.insert(format!("{}.{k}", str_at(acc, "name").unwrap_or("")));
            }
        }
    }
    for r in arr_at(ix, "relations") {
        let mut ab = [str_at(r, "a").unwrap_or(""), str_at(r, "b").unwrap_or("")];
        ab.sort();
        s.insert(format!(
            "{} {}",
            str_at(r, "kind").unwrap_or(""),
            ab.join(" ~ ")
        ));
    }
    s
}

fn main() {
    let t = std::thread::Builder::new()
        .stack_size(1 << 30)
        .spawn(run)
        .expect("spawn");
    t.join().unwrap();
}

fn run() {
    let argv: Vec<String> = std::env::args().skip(1).collect();
    let write = argv.iter().any(|a| a == "--write");
    let filter = argv.iter().find(|a| !a.starts_with('-')).cloned();
    let bench = repo_root().join("bench");
    let w = r"[A-Za-z0-9_]";
    let re = Res {
        comment: Regex::new(r"/\* ((?:anchor::|Err\()[^*]*?) \*/").unwrap(),
        log: Regex::new(r#"sol_log\("([^"]*)""#).unwrap(),
        try_accounts: Regex::new(&format!(
            r"(?m)^declare function {w}+\([^\n\r]*// lib <([A-Za-z0-9_:]+)(?:<[^>]*>)? as anchor_lang::Accounts<B>>::try_accounts"
        ))
        .unwrap(),
        is_signer: Regex::new(r"\.is_signer(?-u:\b)").unwrap(),
        memcmp: Regex::new(r"(?-u:\b)(sol_memcmp|memcmp)\(").unwrap(),
        pda: Regex::new(&format!(r"(?-u:\b)({w}*(?:create_program_address|find_program_address))\(")).unwrap(),
        head: Regex::new(&format!(r"(?m)^(?:export )?function ({w}+)\(")).unwrap(),
    };
    let mut files: Vec<String> = std::fs::read_dir(bench.join("expected"))
        .expect("bench/expected")
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .filter(|f| f.ends_with(".json"))
        .collect();
    files.sort();
    for f in files {
        let path = bench.join("expected").join(&f);
        let mut exp = read_json(&path).unwrap_or_else(|e| panic!("{e}"));
        let prog = &f[..f.len() - 5];
        if str_at(&exp, "set") != Some("oss")
            || filter.as_ref().is_some_and(|x| !prog.contains(x.as_str()))
        {
            continue;
        }
        let idl = str_at(&exp, "idl")
            .map(|i| read_json(&bench.join("idl").join(i)).unwrap_or_else(|e| panic!("{e}")));
        let base = project(&bench, &format!("{prog}.so"), idl.as_ref());
        let ba = parse(&base["security/analysis.json"]).unwrap();
        let instructions = exp["instructions"].clone();
        let Some(variants) = exp.get_mut("variants").and_then(Value::as_object_mut) else {
            continue;
        };
        for (v, ve) in variants.iter_mut() {
            let vix = str_at(ve, "ix").unwrap_or("").to_string();
            let tag = instructions
                .get(&vix)
                .and_then(|i| i.get("tag"))
                .filter(|t| !t.is_null())
                .cloned();
            let vidl = match (&idl, ve.get("idl").and_then(Value::as_object)) {
                (Some(i), Some(p)) => Some(gen::patch_idl(i, p)),
                _ => idl.clone(),
            };
            let vp = project(&bench, &format!("{prog}@{v}.so"), vidl.as_ref());
            let va = parse(&vp["security/analysis.json"]).unwrap();
            let bi = ix_of(&ba, &vix, tag.as_ref());
            let vi = ix_of(&va, &vix, tag.as_ref());
            println!(
                "{prog}@{v} ({vix}{})",
                tag.as_ref()
                    .map_or(String::new(), |t| format!(", tag {}", js_string(t)))
            );
            let program = token_diff(&tokens(&re, &whole(&base)), &tokens(&re, &whole(&vp)));
            println!("  program: {program}");
            let code = match (bi, vi) {
                (Some(bi), Some(vi)) => {
                    let get = |p: &Project, ix: &Value| {
                        p.get(&format!("bundle/{}.ts", str_at(ix, "name").unwrap_or("")))
                            .cloned()
                            .unwrap_or_default()
                    };
                    token_diff(&tokens(&re, &get(&base, bi)), &tokens(&re, &get(&vp, vi)))
                }
                _ => format!(
                    "instruction not found (clean build {}, variant {})",
                    if bi.is_some() { "found" } else { "not found" },
                    if vi.is_some() { "found" } else { "not found" }
                ),
            };
            println!("  code: {code}");
            let bc = constraints(bi);
            let vc = constraints(vi);
            let gone: Vec<&str> = bc
                .iter()
                .filter(|c| !vc.contains(*c))
                .map(String::as_str)
                .collect();
            let added: Vec<&str> = vc
                .iter()
                .filter(|c| !bc.contains(*c))
                .map(String::as_str)
                .collect();
            let analysis = format!(
                "{}{}",
                if gone.is_empty() {
                    "no check found only in the clean build".to_string()
                } else {
                    format!("found in the clean build only: {}", gone.join(", "))
                },
                if added.is_empty() {
                    String::new()
                } else {
                    format!("; in the variant only: {}", added.join(", "))
                }
            );
            println!("  analysis: {analysis}");
            let note = ve
                .get("verified")
                .and_then(|x| x.get("note"))
                .filter(|n| truthy(Some(n)))
                .cloned();
            if let Some(n) = &note {
                println!("  note: {}", js_string(n));
            }
            let mut verified = Map::new();
            verified.insert("program".into(), json!(program));
            verified.insert("code".into(), json!(code));
            verified.insert("analysis".into(), json!(analysis));
            if let Some(n) = note {
                verified.insert("note".into(), n);
            }
            ve["verified"] = Value::Object(verified);
        }
        if write {
            std::fs::write(&path, gen::to_json(&exp))
                .unwrap_or_else(|e| panic!("{}: {e}", path.display()));
        }
    }
}
