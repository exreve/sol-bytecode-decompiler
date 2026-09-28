//! Deterministic eval of the analysis on the real-world vuln / fixed pairs (eval/cases.json, source "real"): does a
//! finding or an informational signal point at the ground-truth instruction / account (ground_truth.target) in @vuln,
//! and is it gone in @fixed. Run by `sbpf-bench` (filter "pairs" runs only these).
//! Signals: findings (confidence info = informational), validation_consistency inconsistencies, stored-key gaps
//! (instructions[].stored_keys: a gap, or no stored field compared while another account's field references it).

use crate::{arr_at, pad_end, read_json, repo_root, str_at};
use regex::Regex;
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::sync::OnceLock;

pub struct EvalJob {
    pub key: String,
    pub so: PathBuf,
    pub idl: Option<Value>,
}

struct Target {
    instructions: Vec<String>,
    accounts: Vec<String>,
    rules: Option<Vec<String>>,
}

struct Case {
    id: String,
    instruction: String,
    target: Target,
}

fn strs(v: Option<&Value>) -> Vec<String> {
    v.and_then(Value::as_array)
        .map(|a| {
            a.iter()
                .filter_map(|x| x.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default()
}

fn cases() -> Vec<Case> {
    let root = repo_root().join("eval");
    let doc = read_json(&root.join("cases.json")).unwrap_or_else(|e| panic!("{e}"));
    let mut out = vec![];
    for c in arr_at(&doc, "cases") {
        let gt = &c["ground_truth"];
        let Some(t) = gt.get("target").filter(|t| t.is_object()) else {
            continue;
        };
        if str_at(c, "source") != Some("real") {
            continue;
        }
        out.push(Case {
            id: str_at(c, "id").unwrap_or("").into(),
            instruction: str_at(gt, "instruction").unwrap_or("").into(),
            target: Target {
                instructions: strs(t.get("instructions")),
                accounts: strs(t.get("accounts")),
                rules: t
                    .get("rules")
                    .filter(|r| r.is_array())
                    .map(|r| strs(Some(r))),
            },
        });
    }
    out
}

pub fn eval_jobs() -> Vec<EvalJob> {
    let bin = repo_root().join("eval/bin");
    let mut jobs = vec![];
    for c in cases() {
        for v in ["vuln", "fixed"] {
            let so = bin.join(format!("{}@{v}.so", c.id));
            let idl = bin.join(format!("{}@{v}.json", c.id));
            if !so.exists() {
                eprintln!("missing binary eval/bin/{}@{v}.so", c.id);
                continue;
            }
            let idl = if idl.exists() {
                Some(read_json(&idl).unwrap_or_else(|e| panic!("{e}")))
            } else {
                None
            };
            jobs.push(EvalJob {
                key: format!("{}@{v}", c.id),
                so,
                idl,
            });
        }
    }
    jobs
}

fn norm(s: &str) -> String {
    static R: OnceLock<[Regex; 3]> = OnceLock::new();
    let r = R.get_or_init(|| {
        [
            Regex::new(r"[ \t\n\r\x0b\x0c]*\([^\n]*$").unwrap(),
            Regex::new(r"\.key$").unwrap(),
            Regex::new(r"[_ \t\n\r\x0b\x0c]").unwrap(),
        ]
    });
    let s = r[0].replace(s, "");
    let s = r[1].replace(&s, "");
    r[2].replace_all(&s, "").to_lowercase()
}

struct Signal {
    finding: bool,
    what: String,
}

fn join_strs(v: &[Value], sep: &str) -> String {
    v.iter().map(crate::js_string).collect::<Vec<_>>().join(sep)
}

/// signals of one analysis.json at the target
fn signals(a: &Value, t: &Target) -> Vec<Signal> {
    let ixs: HashSet<String> = t.instructions.iter().map(|x| norm(x)).collect();
    let any = t.accounts.iter().any(|x| x == "*");
    let accs: Vec<String> = t
        .accounts
        .iter()
        .filter(|x| *x != "*")
        .map(|x| norm(x))
        .collect();
    let hit = |xs: &[&str]| any || xs.iter().any(|x| accs.contains(&norm(x)));
    let mut out = vec![];
    for f in arr_at(a, "findings") {
        let ix = str_at(f, "instruction").unwrap_or("");
        let rule = str_at(f, "rule").unwrap_or("");
        let accounts = arr_at(f, "accounts");
        let names: Vec<&str> = accounts.iter().filter_map(Value::as_str).collect();
        if !ixs.contains(&norm(ix))
            || t.rules
                .as_ref()
                .is_some_and(|r| !r.iter().any(|x| x == rule))
            || !hit(&names)
        {
            continue;
        }
        let info = str_at(f, "confidence") == Some("info");
        out.push(Signal {
            finding: !info,
            what: format!(
                "{rule}{} @{ix} [{}]",
                if info { " (info)" } else { "" },
                join_strs(accounts, ", ")
            ),
        });
    }
    if t.rules.is_some() {
        return out;
    }
    for r in arr_at(a, "validation_consistency") {
        for x in arr_at(r, "inconsistencies") {
            let ix = str_at(x, "instruction").unwrap_or("");
            let acc = str_at(x, "account").unwrap_or("");
            if ixs.contains(&norm(ix)) && hit(&[acc]) {
                out.push(Signal {
                    finding: false,
                    what: format!(
                        "consistency: {acc} lacks \"{}\" @{ix}",
                        str_at(x, "validation").unwrap_or("")
                    ),
                });
            }
        }
    }
    for ix in arr_at(a, "instructions") {
        let name = str_at(ix, "name").unwrap_or("");
        if !ixs.contains(&norm(name)) {
            continue;
        }
        for k in arr_at(ix, "stored_keys") {
            let acc = str_at(k, "account").unwrap_or("");
            for g in arr_at(k, "gaps") {
                let g = g.as_str().unwrap_or("");
                if hit(&[acc]) || accs.iter().any(|x| norm(g).contains(x.as_str())) {
                    out.push(Signal {
                        finding: false,
                        what: format!("stored-key gap @{name}: {g}"),
                    });
                }
            }
            let refs = arr_at(k, "referencedBy");
            if hit(&[acc]) && arr_at(k, "compared").is_empty() && !refs.is_empty() {
                out.push(Signal {
                    finding: false,
                    what: format!(
                        "stored-key: {acc} @{name} no stored field compared (bound only through {})",
                        join_strs(refs, ", ")
                    ),
                });
            }
        }
    }
    out
}

/// The eval section of the bench report: one line per case; `out`: analysis.json by job key.
pub fn score_eval(out: &HashMap<String, Value>, verbose: bool) -> Vec<String> {
    let mut lines = vec![
        "eval pairs (eval/cases.json, real): vuln = strongest signal at the ground truth; fixed = no signal left there".to_string(),
        "case                    ground truth (instruction: accounts)       vuln          fixed".to_string(),
    ];
    let (mut finding, mut info, mut clean, mut n) = (0, 0, 0, 0);
    for c in cases() {
        let (Some(v), Some(f)) = (
            out.get(&format!("{}@vuln", c.id)),
            out.get(&format!("{}@fixed", c.id)),
        ) else {
            continue;
        };
        n += 1;
        let t = &c.target;
        let sv = signals(v, t);
        let sf = signals(f, t);
        let fixed_keys: HashSet<&str> = sf.iter().map(|s| s.what.as_str()).collect();
        let vs = if sv.iter().any(|s| s.finding) {
            "finding"
        } else if !sv.is_empty() {
            "informational"
        } else {
            "missed"
        };
        match vs {
            "finding" => finding += 1,
            "informational" => info += 1,
            _ => {}
        }
        if sf.is_empty() {
            clean += 1;
        }
        let gone = !sv.is_empty() && sv.iter().all(|s| !fixed_keys.contains(s.what.as_str()));
        let gt: String = format!("{}: {}", c.instruction, t.accounts.join(" "))
            .chars()
            .take(42)
            .collect();
        lines.push(format!(
            "{} {} {} {}{}",
            pad_end(&c.id, 23),
            pad_end(&gt, 42),
            pad_end(vs, 13),
            if sf.is_empty() {
                "clean".to_string()
            } else {
                format!("NOT clean ({})", sf.len())
            },
            if !sv.is_empty() && !gone {
                "  (a vuln signal stays in fixed)"
            } else {
                ""
            }
        ));
        if verbose {
            for s in &sv {
                lines.push(format!(
                    "    vuln  {} {}",
                    if s.finding { 'F' } else { 'i' },
                    s.what
                ));
            }
            for s in &sf {
                lines.push(format!(
                    "    fixed {} {}",
                    if s.finding { 'F' } else { 'i' },
                    s.what
                ));
            }
        }
    }
    lines.push(format!(
        "eval: {}/{n} detected ({finding} as finding, {info} informational only), {clean}/{n} fixed clean",
        finding + info
    ));
    lines
}
