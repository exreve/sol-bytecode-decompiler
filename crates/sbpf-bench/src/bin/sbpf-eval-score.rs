//! Score reviewer outputs against eval/cases.json.
//!   eval/results/<prog_NN>/<code|full>/<run>.json = { findings: [{ instruction, accounts, issue, confidence }], tokens_read? }
//! A finding matches the ground truth when its instruction names the case's instruction (or an alias: native tag forms,
//! sibling instructions with the same bug) and its accounts or issue text name a ground-truth account or keyword.
//! Instruction-only matches are "unsure" and printed for a human (adjudicate in eval/results/overrides.json:
//! { "<prog>/<variant>/<run>#<finding index>": "hit" | "miss" }). On a vuln packet a match = found; on the fixed
//! packet of the same program a match = false positive. Findings matching nothing are "other claims" (unverified: real
//! other bugs or false claims; listed with --verbose).
//! usage: sbpf-eval-score [--verbose] [--min-confidence x] [packet or case filter]   (EVAL_RESULTS=dir: other results dir)

use regex::Regex;
use sbpf_bench::*;
use serde_json::Value;
use std::collections::{BTreeSet, HashMap};
use std::path::PathBuf;

struct Case {
    id: String,
    source: String,
    category: String,
    instruction: String,
    aliases: Vec<String>,
    accounts: Vec<String>,
    keywords: Vec<String>,
    description: String,
}

struct Run<'a> {
    prog: String,
    variant: String,
    run: String,
    c: &'a Case,
    kind: String,
    found: bool,
    unsure: Vec<String>,
    other: Vec<String>,
    tokens: Option<f64>,
}

fn strs(v: Option<&Value>) -> Vec<String> {
    v.and_then(Value::as_array)
        .map_or(vec![], |a| a.iter().map(js_string).collect())
}

fn sorted_dir(p: &std::path::Path) -> Vec<String> {
    let mut v: Vec<String> = std::fs::read_dir(p)
        .map(|r| {
            r.filter_map(|e| e.ok()?.file_name().into_string().ok())
                .collect()
        })
        .unwrap_or_default();
    v.sort();
    v
}

fn main() {
    let e = repo_root().join("eval");
    let r = std::env::var("EVAL_RESULTS")
        .map(PathBuf::from)
        .unwrap_or_else(|_| e.join("results"));
    let argv: Vec<String> = std::env::args().skip(1).collect();
    let verbose = argv.iter().any(|a| a == "--verbose");
    let mc = argv.iter().position(|a| a == "--min-confidence");
    let min_conf = mc.map_or(f64::NEG_INFINITY, |i| {
        argv.get(i + 1)
            .and_then(|x| x.parse().ok())
            .unwrap_or(f64::NAN)
    });
    let filter = argv
        .iter()
        .enumerate()
        .find(|(i, a)| !a.starts_with("--") && mc.is_none_or(|m| *i != m + 1))
        .map(|(_, a)| a.clone());

    let doc = read_json(&e.join("cases.json")).unwrap_or_else(|e| panic!("{e}"));
    let cases: Vec<Case> = arr_at(&doc, "cases")
        .iter()
        .map(|c| {
            let t = &c["ground_truth"];
            Case {
                id: str_at(c, "id").unwrap_or("").into(),
                source: str_at(c, "source").unwrap_or("").into(),
                category: str_at(c, "category").unwrap_or("").into(),
                instruction: str_at(t, "instruction").unwrap_or("").into(),
                aliases: strs(t.get("aliases")),
                accounts: strs(t.get("accounts")),
                keywords: strs(t.get("keywords")),
                description: str_at(t, "description").unwrap_or("").into(),
            }
        })
        .collect();
    let mut packets: HashMap<String, (usize, String)> = HashMap::new();
    for (ci, c) in arr_at(&doc, "cases").iter().enumerate() {
        for (kind, id) in c
            .get("packets")
            .and_then(Value::as_object)
            .into_iter()
            .flatten()
        {
            packets.insert(js_string(id), (ci, kind.clone()));
        }
    }
    let overrides: HashMap<String, String> = read_json(&r.join("overrides.json"))
        .ok()
        .and_then(|v| {
            v.as_object()
                .map(|o| o.iter().map(|(k, v)| (k.clone(), js_string(v))).collect())
        })
        .unwrap_or_default();

    let camel = Regex::new(r"([a-z0-9])([A-Z])").unwrap();
    let non = Regex::new(r"[^a-z0-9]+").unwrap();
    // words joined by '_': "VerifySignatures" / "verify signatures" / "tag 7" / "accounts[3]" -> verify_signatures, tag_7, accounts_3
    let norm = |s: &str| -> String {
        let s = camel.replace_all(s, "${1}_${2}").to_lowercase();
        let s = non.replace_all(&s, "_");
        let s = s.strip_prefix('_').unwrap_or(&s);
        let s = s.strip_suffix('_').unwrap_or(s);
        format!("_{s}_")
    };
    let has = |text: &str, w: &str| text.contains(&norm(w));
    // keyword as a word prefix: "deserializ", "round"
    let stem = |text: &str, w: &str| {
        let n = norm(w);
        text.contains(&n[..n.len() - 1])
    };
    let accounts_text = |f: &Value, sep: &str| match f.get("accounts") {
        None | Some(Value::Null) => String::new(),
        Some(Value::Array(a)) => a
            .iter()
            .map(|x| {
                if x.is_null() {
                    String::new()
                } else {
                    js_string(x)
                }
            })
            .collect::<Vec<_>>()
            .join(sep),
        Some(v) => js_string(v),
    };
    // 'hit' | 'unsure' | 'other'
    let judge = |f: &Value, t: &Case| -> &'static str {
        let ix = norm(str_at(f, "instruction").unwrap_or(""));
        let accs = norm(&accounts_text(f, " "));
        let issue = norm(str_at(f, "issue").unwrap_or(""));
        let ix_hit = t
            .aliases
            .iter()
            .chain([&t.instruction])
            .any(|a| has(&ix, a));
        let acc_hit = t.accounts.iter().any(|a| has(&accs, a) || has(&issue, a));
        let kw_hit = t.keywords.iter().any(|k| stem(&issue, k));
        if ix_hit && (acc_hit || kw_hit) {
            "hit"
        } else if ix_hit || (acc_hit && kw_hit && ix.replace('_', "").is_empty()) {
            "unsure"
        } else {
            "other"
        }
    };

    let mut runs: Vec<Run> = vec![];
    if !r.exists() {
        println!("no results in {}", r.display());
        return;
    }
    for prog in sorted_dir(&r) {
        let Some((ci, kind)) = packets.get(&prog) else {
            if prog != "overrides.json" {
                println!("? {prog}: not a packet id of cases.json");
            }
            continue;
        };
        let c = &cases[*ci];
        if filter
            .as_ref()
            .is_some_and(|f| !prog.contains(f.as_str()) && !c.id.contains(f.as_str()))
        {
            continue;
        }
        for variant in sorted_dir(&r.join(&prog)) {
            for file in sorted_dir(&r.join(&prog).join(&variant))
                .into_iter()
                .filter(|f| f.ends_with(".json"))
            {
                let key = format!("{prog}/{variant}/{}", &file[..file.len() - 5]);
                let out = match read_json(&r.join(&prog).join(&variant).join(&file)) {
                    Ok(v) => v,
                    Err(e) => {
                        println!("! {key}: {}", e.rsplit(": ").next().unwrap_or(&e));
                        continue;
                    }
                };
                let mut run = Run {
                    prog: prog.clone(),
                    variant: variant.clone(),
                    run: file.clone(),
                    c,
                    kind: kind.clone(),
                    found: false,
                    unsure: vec![],
                    other: vec![],
                    tokens: out.get("tokens_read").and_then(Value::as_f64),
                };
                for (i, f) in arr_at(&out, "findings").iter().enumerate() {
                    let conf = f.get("confidence").filter(|v| !v.is_null());
                    if conf.and_then(Value::as_f64).unwrap_or(1.0) < min_conf {
                        continue;
                    }
                    let v = match overrides.get(&format!("{key}#{i}")).map(String::as_str) {
                        Some("hit") => "hit",
                        Some("miss") => "other",
                        _ => judge(f, c),
                    };
                    let line = format!(
                        "{key}#{i} [{}] ({}) conf {}: {}",
                        f.get("instruction")
                            .filter(|v| !v.is_null())
                            .map_or("?".into(), js_string),
                        accounts_text(f, ", "),
                        conf.map_or("?".into(), js_string),
                        f.get("issue")
                            .filter(|v| !v.is_null())
                            .map_or(String::new(), js_string)
                    );
                    match v {
                        "hit" => run.found = true,
                        "unsure" => run.unsure.push(line),
                        _ => run.other.push(line),
                    }
                }
                runs.push(run);
            }
        }
    }

    let pct = |a: usize, b: usize| {
        if b > 0 {
            format!("{}%", fixed0(100.0 * a as f64 / b as f64))
        } else {
            "-".into()
        }
    };
    let tok = |t: Option<f64>| t.map_or(String::new(), sbpf_read::util::js_num);
    println!("packet   case                              bin    variant run            result   other  tokens");
    for r in &runs {
        let res = match (r.kind == "fixed", r.found) {
            (true, true) => "FP",
            (true, false) => "clean",
            (false, true) => "found",
            (false, false) => "MISSED",
        };
        println!(
            "{}  {} {} {} {} {} {}  {}",
            r.prog,
            pad_end(&r.c.id, 33),
            pad_end(&r.kind, 6),
            pad_end(&r.variant, 7),
            pad_end(&r.run, 14),
            pad_end(res, 8),
            pad_start(&r.other.len().to_string(), 5),
            tok(r.tokens)
        );
    }

    println!("\nsummary (per packet variant; real = real-world cases, bench = synthetic variants)");
    println!("variant  set    runs  found/vuln  recall  FP/fixed  FP-rate  other/run  unsure  mean tokens");
    let variants: BTreeSet<&str> = runs.iter().map(|r| r.variant.as_str()).collect();
    for variant in variants {
        for set in ["real", "bench", "all"] {
            let rs: Vec<&Run> = runs
                .iter()
                .filter(|r| r.variant == variant && (set == "all" || r.c.source == set))
                .collect();
            if rs.is_empty() {
                continue;
            }
            let vuln: Vec<&&Run> = rs.iter().filter(|r| r.kind == "vuln").collect();
            let fixed: Vec<&&Run> = rs.iter().filter(|r| r.kind == "fixed").collect();
            let found = vuln.iter().filter(|r| r.found).count();
            let fp = fixed.iter().filter(|r| r.found).count();
            let toks: Vec<f64> = rs.iter().filter_map(|r| r.tokens).collect();
            let other: usize = rs.iter().map(|r| r.other.len()).sum();
            let unsure: usize = rs.iter().map(|r| r.unsure.len()).sum();
            println!(
                "{} {} {}  {}  {}  {}  {}  {}  {}  {}",
                pad_end(variant, 8),
                pad_end(set, 6),
                pad_start(&rs.len().to_string(), 4),
                pad_start(&format!("{found}/{}", vuln.len()), 10),
                pad_start(&pct(found, vuln.len()), 6),
                pad_start(&format!("{fp}/{}", fixed.len()), 8),
                pad_start(&pct(fp, fixed.len()), 7),
                pad_start(&fixed1(other as f64 / rs.len() as f64), 9),
                pad_start(&unsure.to_string(), 6),
                if toks.is_empty() {
                    "-".to_string()
                } else {
                    sbpf_read::util::js_num(
                        (toks.iter().sum::<f64>() / toks.len() as f64 + 0.5).floor(),
                    )
                }
            );
        }
    }

    let unsure: Vec<(&Run, &String)> = runs
        .iter()
        .flat_map(|r| r.unsure.iter().map(move |u| (r, u)))
        .collect();
    if !unsure.is_empty() {
        println!("\nunsure matches (instruction matches, account / issue does not): adjudicate in eval/results/overrides.json");
        for (r, u) in unsure {
            println!("  {u}\n    truth ({}): {}", r.c.category, r.c.description);
        }
    }
    if verbose {
        println!("\nother claims (not the ground-truth issue; review manually: real other bugs or false claims)");
        for r in &runs {
            for o in &r.other {
                println!("  {o}");
            }
        }
    }
}
