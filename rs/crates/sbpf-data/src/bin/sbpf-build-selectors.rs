//! Build data/selectors.json.gz: 8-byte Anchor discriminator -> name.
//!   instruction: sha256("global:<snake_name>")[..8]
//!   account:     sha256("account:<PascalName>")[..8]
//!   event:       sha256("event:<PascalName>")[..8]
//! Sources: IDL JSON files, Anchor Rust sources (Context<> handlers, #[account]/#[event] structs),
//! and a vocabulary expansion (observed verbs x observed noun phrases); data-src/gh-names.json when present.
//! usage: sbpf-build-selectors <dir> [<dir>...]   (run from the repository root)

use indexmap::{IndexMap, IndexSet};
use regex::Regex;
use sbpf_lib::js_str_cmp;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::path::Path;

// JS `\s`
const S: &str = r"[\t\n\x0B\x0C\r \u{a0}\u{1680}\u{2000}-\u{200a}\u{2028}\u{2029}\u{202f}\u{205f}\u{3000}\u{feff}]";
const W: &str = r"[A-Za-z0-9_]";

fn hex8(s: &str) -> String {
    sbpf_print::names::sha256(s.as_bytes())[..8]
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

fn pascal(s: &str) -> String {
    s.split(|c: char| c == '_' || c == '-' || c.is_whitespace() || c == '\u{feff}')
        .filter(|w| !w.is_empty())
        .map(|w| {
            let mut c = w.chars();
            let f = c.next().unwrap();
            f.to_uppercase().collect::<String>() + c.as_str()
        })
        .collect()
}

fn walk(d: &Path, out: &mut Vec<String>) {
    let Ok(rd) = std::fs::read_dir(d) else { return };
    let mut ents: Vec<String> = rd
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .collect();
    ents.sort();
    for e in ents {
        if e == "node_modules" || e == ".git" || e == "target" {
            continue;
        }
        let p = d.join(&e);
        let Ok(st) = std::fs::metadata(&p) else {
            continue;
        };
        if st.is_dir() {
            walk(&p, out);
        } else if (e.ends_with(".json") || e.ends_with(".rs")) && st.len() < 20_000_000 {
            out.push(p.to_string_lossy().into_owned());
        }
    }
}

/// `Buffer.from(array).toString('hex')` of an 8-element discriminator
fn disc_hex(v: Option<&Value>) -> Option<String> {
    let a = v?.as_array().filter(|a| a.len() == 8)?;
    Some(
        a.iter()
            .map(|x| {
                format!(
                    "{:02x}",
                    (x.as_f64().filter(|f| f.is_finite()).unwrap_or(0.0) as i64) & 0xff
                )
            })
            .collect(),
    )
}

fn crc32(data: &[u8]) -> u32 {
    let mut table = [0u32; 256];
    for (i, t) in table.iter_mut().enumerate() {
        let mut c = i as u32;
        for _ in 0..8 {
            c = if c & 1 != 0 {
                0xedb88320 ^ (c >> 1)
            } else {
                c >> 1
            };
        }
        *t = c;
    }
    let mut c = !0u32;
    for &b in data {
        c = table[((c ^ b as u32) & 0xff) as usize] ^ (c >> 8);
    }
    !c
}

fn gzip(data: &[u8]) -> Vec<u8> {
    let mut out = vec![0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 2, 3];
    out.extend(miniz_oxide::deflate::compress_to_vec(data, 10));
    out.extend(crc32(data).to_le_bytes());
    out.extend((data.len() as u32).to_le_bytes());
    out
}

fn main() {
    let dirs: Vec<String> = std::env::args().skip(1).collect();
    let mut ins: IndexSet<String> = IndexSet::new();
    let mut accs: IndexSet<String> = IndexSet::new();
    let mut evs: IndexSet<String> = IndexSet::new();
    // disc hex -> name, from IDLs that list discriminators
    let mut explicit: IndexMap<String, String> = IndexMap::new();
    let r1 = Regex::new(r"([a-z0-9])([A-Z])").unwrap();
    let r2 = Regex::new(r"([A-Z]+)([A-Z][a-z])").unwrap();
    let snake = |s: &str| {
        let s = r1.replace_all(s, "${1}_${2}");
        let s = r2.replace_all(&s, "${1}_${2}");
        s.replace(['-', ' '], "_").to_lowercase()
    };
    let handler = Regex::new(&format!(
        r"pub fn ({W}+){S}*(?:<[^>]*>)?{S}*\({S}*(?:mut{S}+)?{W}+{S}*:{S}*Context<"
    ))
    .unwrap();
    let account = Regex::new(&format!(
        r"#\[account(?:\([^)]*\))?\]{S}*(?:#\[[^\]]*\]{S}*)*pub struct ({W}+)"
    ))
    .unwrap();
    let event = Regex::new(&format!(
        r"#\[event\]{S}*(?:#\[[^\]]*\]{S}*)*pub struct ({W}+)"
    ))
    .unwrap();

    let mut files = vec![];
    for d in &dirs {
        walk(Path::new(d), &mut files);
    }
    let mut n_idl = 0;
    let name_of = |x: &Value| x.get("name").and_then(Value::as_str).map(String::from);
    for f in &files {
        let Ok(bytes) = std::fs::read(f) else {
            continue;
        };
        let src = String::from_utf8_lossy(&bytes);
        if f.ends_with(".json") {
            if !src.contains("\"instructions\"") {
                continue;
            }
            let Ok(j) = serde_json::from_str::<Value>(&src) else {
                continue;
            };
            let idls = match &j {
                Value::Array(a) => a.clone(),
                v => vec![v.clone()],
            };
            for idl in &idls {
                let Some(ixs) = idl.get("instructions").and_then(Value::as_array) else {
                    continue;
                };
                n_idl += 1;
                for i in ixs {
                    if let Some(n) = name_of(i) {
                        let s = snake(&n);
                        ins.insert(s.clone());
                        if let Some(h) = disc_hex(i.get("discriminator")) {
                            explicit.insert(h, format!("i:{s}"));
                        }
                    }
                }
                for a in idl
                    .get("accounts")
                    .and_then(Value::as_array)
                    .into_iter()
                    .flatten()
                {
                    if let Some(n) = name_of(a) {
                        accs.insert(pascal(&n));
                        if let Some(h) = disc_hex(a.get("discriminator")) {
                            explicit.insert(h, format!("a:{}", pascal(&n)));
                        }
                    }
                }
                for e in idl
                    .get("events")
                    .and_then(Value::as_array)
                    .into_iter()
                    .flatten()
                {
                    if let Some(n) = name_of(e) {
                        evs.insert(pascal(&n));
                        if let Some(h) = disc_hex(e.get("discriminator")) {
                            explicit.insert(h, format!("e:{}", pascal(&n)));
                        }
                    }
                }
                for t in idl
                    .get("types")
                    .and_then(Value::as_array)
                    .into_iter()
                    .flatten()
                {
                    if let Some(n) = name_of(t) {
                        accs.insert(pascal(&n));
                    }
                }
            }
        } else {
            for m in handler.captures_iter(&src) {
                ins.insert(m[1].to_string());
            }
            for m in account.captures_iter(&src) {
                accs.insert(m[1].to_string());
            }
            for m in event.captures_iter(&src) {
                evs.insert(m[1].to_string());
            }
        }
    }
    // names harvested from GitHub (sbpf-gh-anchor-names)
    if let Ok(gh) = std::fs::read_to_string("data-src/gh-names.json")
        .map_err(|e| e.to_string())
        .and_then(|t| serde_json::from_str::<Value>(&t).map_err(|e| e.to_string()))
    {
        let list = |k: &str| {
            gh.get(k)
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default()
        };
        for n in list("instructions") {
            ins.insert(n.as_str().unwrap_or_default().to_string());
        }
        for n in list("accounts") {
            accs.insert(n.as_str().unwrap_or_default().to_string());
        }
        for n in list("events") {
            evs.insert(n.as_str().unwrap_or_default().to_string());
        }
    }
    // vocabulary expansion: verb + noun phrase
    let mut verbs: IndexSet<String> = IndexSet::new();
    let mut nouns: IndexSet<String> = IndexSet::new();
    for n in &ins {
        let w: Vec<&str> = n.split('_').filter(|x| !x.is_empty()).collect();
        if w.is_empty() {
            continue;
        }
        verbs.insert(w[0].to_string());
        for k in 1..w.len() {
            nouns.insert(w[k..].join("_"));
        }
    }
    for a in &accs {
        nouns.insert(snake(a));
    }
    const COMMON_VERBS: &[&str] = &[
        "initialize",
        "init",
        "create",
        "update",
        "set",
        "close",
        "open",
        "deposit",
        "withdraw",
        "swap",
        "buy",
        "sell",
        "claim",
        "stake",
        "unstake",
        "mint",
        "burn",
        "transfer",
        "add",
        "remove",
        "lock",
        "unlock",
        "harvest",
        "liquidate",
        "borrow",
        "repay",
        "redeem",
        "cancel",
        "place",
        "fill",
        "settle",
        "collect",
        "distribute",
        "register",
        "delete",
        "migrate",
        "execute",
        "approve",
        "revoke",
        "freeze",
        "thaw",
        "pause",
        "unpause",
        "admin",
        "emergency",
        "refresh",
        "sync",
        "crank",
        "consume",
        "process",
        "verify",
        "accept",
        "propose",
        "vote",
        "finalize",
        "start",
        "end",
        "reset",
        "resize",
        "realloc",
        "increase",
        "decrease",
        "change",
        "toggle",
        "enable",
        "disable",
    ];
    for v in COMMON_VERBS {
        verbs.insert(v.to_string());
    }
    let u16len = |s: &str| s.encode_utf16().count();
    let noun_list: Vec<&String> = nouns
        .iter()
        .filter(|n| u16len(n) <= 40 && n.split('_').count() <= 4)
        .collect();
    let mut out: IndexMap<String, String> = IndexMap::new();
    for (h, v) in &explicit {
        out.insert(h.clone(), v.clone());
    }
    for n in &ins {
        out.entry(hex8(&format!("global:{n}")))
            .or_insert_with(|| format!("i:{n}"));
    }
    for a in &accs {
        out.entry(hex8(&format!("account:{a}")))
            .or_insert_with(|| format!("a:{a}"));
    }
    for e in &evs {
        out.entry(hex8(&format!("event:{e}")))
            .or_insert_with(|| format!("e:{e}"));
    }
    std::fs::create_dir_all("data").expect("data/");
    // nouns that occur at least twice (or are account names) keep the runtime expansion tractable
    let mut noun_freq: HashMap<String, usize> = HashMap::new();
    let mut verb_freq: HashMap<String, usize> = HashMap::new();
    for n in &ins {
        let w: Vec<&str> = n.split('_').collect();
        for k in 1..w.len() {
            *noun_freq.entry(w[k..].join("_")).or_insert(0) += 1;
        }
        *verb_freq.entry(w[0].to_string()).or_insert(0) += 1;
    }
    let acc_nouns: IndexSet<String> = accs.iter().map(|a| snake(a)).collect();
    // keep the runtime expansion around ~1M hashes: most frequent verbs / noun phrases
    let vf = |v: &str| verb_freq.get(v).copied().unwrap_or(0);
    let mut by_freq: Vec<String> = verbs.iter().cloned().collect();
    by_freq.sort_by(|a, b| vf(b).cmp(&vf(a)));
    let top: IndexSet<String> = by_freq.into_iter().take(300).collect();
    verbs.retain(|v| top.contains(v));
    let nf = |n: &str| noun_freq.get(n).copied().unwrap_or(0);
    let mut vocab_nouns: Vec<String> = noun_list
        .into_iter()
        .filter(|n| nf(n) >= 2 || acc_nouns.contains(*n))
        .cloned()
        .collect();
    vocab_nouns.sort_by(|a, b| nf(b).cmp(&nf(a)));
    vocab_nouns.truncate(3000);
    vocab_nouns.sort_by(|a, b| js_str_cmp(a, b));
    let mut vs: Vec<String> = verbs.iter().cloned().collect();
    vs.sort_by(|a, b| js_str_cmp(a, b));
    let names: serde_json::Map<String, Value> =
        out.iter().map(|(k, v)| (k.clone(), json!(v))).collect();
    let doc = json!({ "names": Value::Object(names), "verbs": vs, "nouns": vocab_nouns });
    let buf = gzip(doc.to_string().as_bytes());
    std::fs::write("data/selectors.json.gz", &buf).expect("data/selectors.json.gz");
    println!(
        "files {}, idls {n_idl}, instructions {}, accounts {}, events {}, names {}, vocab {} verbs x {} nouns, gz {} bytes",
        files.len(),
        ins.len(),
        accs.len(),
        evs.len(),
        out.len(),
        vs.len(),
        vocab_nouns.len(),
        buf.len()
    );
}
