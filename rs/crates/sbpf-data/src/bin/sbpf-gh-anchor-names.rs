//! Harvest Anchor instruction / account / event names from public GitHub code (via the `gh` CLI), resuming from
//! the previous harvest. Output: data-src/gh-names.json { instructions, accounts, events, seen } (read by
//! sbpf-build-selectors).
//! usage: sbpf-gh-anchor-names [maxFiles=3000]   (run from the repository root)

use indexmap::IndexSet;
use serde_json::{json, Value};
use std::process::Command;
use std::time::Duration;

const OUT: &str = "data-src/gh-names.json";

struct State {
    ins: IndexSet<String>,
    accs: IndexSet<String>,
    evs: IndexSet<String>,
    seen: IndexSet<String>,
}

impl State {
    fn save(&self) {
        let sorted = |s: &IndexSet<String>| {
            let mut v: Vec<&String> = s.iter().collect();
            v.sort_by(|a, b| sbpf_lib::js_str_cmp(a, b));
            json!(v)
        };
        let doc = json!({
            "instructions": sorted(&self.ins),
            "accounts": sorted(&self.accs),
            "events": sorted(&self.evs),
            "seen": self.seen.iter().collect::<Vec<_>>(),
        });
        std::fs::write(OUT, doc.to_string()).expect(OUT);
    }
}

fn gh(args: &[&str]) -> Result<String, String> {
    let o = Command::new("gh")
        .args(args)
        .output()
        .map_err(|e| e.to_string())?;
    if o.status.success() {
        Ok(String::from_utf8_lossy(&o.stdout).into_owned())
    } else {
        Err(format!(
            "Command failed: gh {}\n{}",
            args.join(" "),
            String::from_utf8_lossy(&o.stderr)
        ))
    }
}

/// base64 (GitHub's contents API wraps lines)
fn b64(s: &str) -> Vec<u8> {
    sbpf_cli::rpc::base64_decode(s)
}

fn main() {
    let max_files: usize = std::env::args()
        .nth(1)
        .and_then(|s| s.parse().ok())
        .unwrap_or(3000);
    std::fs::create_dir_all("data-src").expect("data-src/");
    let prev: Value = std::fs::read_to_string(OUT)
        .ok()
        .and_then(|t| serde_json::from_str(&t).ok())
        .unwrap_or(json!({}));
    let list = |k: &str| -> IndexSet<String> {
        prev.get(k)
            .and_then(Value::as_array)
            .map_or(IndexSet::new(), |a| {
                a.iter()
                    .filter_map(|x| x.as_str().map(String::from))
                    .collect()
            })
    };
    let mut st = State {
        ins: list("instructions"),
        accs: list("accounts"),
        evs: list("events"),
        seen: list("seen"),
    };
    let names = sbpf_data::AnchorNames::default();
    // code search returns at most 1000 hits per query: partition by file size
    let mut queries = vec![];
    for q in [
        "\"Context<\" \"#[program]\"",
        "\"Context<\" \"pub fn\" anchor_lang",
        "\"#[account]\" \"pub struct\"",
        "\"#[event]\" \"pub struct\"",
    ] {
        for (lo, hi) in [
            (0, 2000),
            (2000, 4000),
            (4000, 7000),
            (7000, 12000),
            (12000, 20000),
            (20000, 40000),
            (40000, 400000),
        ] {
            queries.push(format!("{q} language:rust size:{lo}..{hi}"));
        }
    }
    let mut files = st.seen.len();
    for q in &queries {
        let mut page = 1;
        while page <= 10 && files < max_files {
            let res = gh(&[
                "api",
                "-X",
                "GET",
                "search/code",
                "-f",
                &format!("q={q}"),
                "-f",
                "per_page=100",
                "-f",
                &format!("page={page}"),
            ])
            .and_then(|t| serde_json::from_str::<Value>(&t).map_err(|e| e.to_string()));
            let res = match res {
                Ok(r) => r,
                Err(e) => {
                    println!(
                        "search error, waiting {}",
                        e.chars().take(120).collect::<String>()
                    );
                    std::thread::sleep(Duration::from_secs(65));
                    page += 1;
                    continue;
                }
            };
            let items = res
                .get("items")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            if items.is_empty() {
                break;
            }
            for it in &items {
                let repo = it["repository"]["full_name"].as_str().unwrap_or("");
                let path = it["path"].as_str().unwrap_or("");
                let key = format!("{repo}/{path}");
                if !st.seen.insert(key) {
                    continue;
                }
                let got = gh(&["api", &format!("repos/{repo}/contents/{path}")])
                    .and_then(|t| serde_json::from_str::<Value>(&t).map_err(|e| e.to_string()));
                if let Ok(c) = got {
                    if let Some(content) = c.get("content").and_then(Value::as_str) {
                        let [i, a, e] = names.extract(&String::from_utf8_lossy(&b64(content)));
                        st.ins.extend(i);
                        st.accs.extend(a);
                        st.evs.extend(e);
                        files += 1;
                    }
                }
                if files % 50 == 0 {
                    st.save();
                    println!(
                        "files {files} ix {} accounts {} events {}",
                        st.ins.len(),
                        st.accs.len(),
                        st.evs.len()
                    );
                }
            }
            // search API: 10 requests / minute
            std::thread::sleep(Duration::from_secs(7));
            page += 1;
        }
    }
    st.save();
    println!(
        "done: files {files} ix {} accounts {} events {}",
        st.ins.len(),
        st.accs.len(),
        st.evs.len()
    );
}
