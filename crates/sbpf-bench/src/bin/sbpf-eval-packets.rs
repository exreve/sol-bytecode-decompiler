//! Generate the reviewer packets from eval/cases.json: eval/packets/<prog_NN>/full/ (the CLI project output, security/
//! included) and code/ (index.ts, lib.d.ts, bundle/*.ts and the shared files they import; no security/ folder and no
//! pointer to it). Binaries and IDLs are copied under their neutral id first, so no file or program name hints at the
//! case. Runs the `sbpf-decompile` binary built next to this one.
//! usage: sbpf-eval-packets [prog_NN ...]

use indexmap::IndexSet;
use regex::Regex;
use sbpf_bench::gen::{patch_idl, pretty};
use sbpf_bench::*;
use serde_json::{json, Map, Value};
use std::collections::BTreeMap;
use std::path::Path;
use std::process::{Command, Stdio};

#[derive(Default, Clone, Copy)]
struct Size {
    files: u64,
    lines: u64,
    kb: f64,
}

impl Size {
    fn json(&self) -> Value {
        json!({ "files": self.files, "lines": self.lines, "kb": self.kb as u64 })
    }
    /// as console.log prints the object
    fn show(&self) -> String {
        format!(
            "{{ files: {}, lines: {}, kb: {} }}",
            self.files, self.lines, self.kb as u64
        )
    }
}

/// program name / address / docs of the IDL would name the project (or the bench variant): neutral id instead
fn neutral(mut idl: Value, id: &str) -> Value {
    if let Some(o) = idl.as_object_mut() {
        o.shift_remove("address");
        o.shift_remove("docs");
        if let Some(m) = o.get_mut("metadata").and_then(Value::as_object_mut) {
            m.insert("name".into(), json!(id));
            m.shift_remove("address");
            m.shift_remove("description");
            m.shift_remove("repository");
        }
        if truthy(o.get("name")) {
            o.insert("name".into(), json!(id));
        }
    }
    idl
}

fn measure(dir: &Path) -> Size {
    fn walk(d: &Path, s: &mut Size) {
        let mut names: Vec<_> = std::fs::read_dir(d)
            .unwrap()
            .filter_map(|e| e.ok())
            .map(|e| e.path())
            .collect();
        names.sort();
        for p in names {
            if p.is_dir() {
                walk(&p, s);
                continue;
            }
            let txt = std::fs::read_to_string(&p).unwrap();
            s.files += 1;
            s.lines += (txt.split('\n').count() - usize::from(txt.ends_with('\n'))) as u64;
            s.kb += txt.len() as f64 / 1024.0;
        }
    }
    let mut s = Size::default();
    walk(dir, &mut s);
    s.kb = (s.kb + 0.5).floor();
    s
}

fn make_code(full: &Path, code: &Path) {
    std::fs::create_dir_all(code).unwrap();
    let index = std::fs::read_to_string(full.join("index.ts")).unwrap();
    let index = Regex::new(r"(?m)^// security/summary\.md:[^\n\r]*\n")
        .unwrap()
        .replace(&index, "")
        .into_owned();
    if index.contains("security/") {
        panic!("{}: index.ts still mentions security/", full.display());
    }
    std::fs::write(code.join("index.ts"), index).unwrap();
    std::fs::copy(full.join("lib.d.ts"), code.join("lib.d.ts")).unwrap();
    // the entrypoint (dispatcher, and every handler the decompiler did not split into bundle/) is code too
    let mut top: IndexSet<String> = IndexSet::new();
    if full.join("entrypoint.ts").exists() {
        top.insert("entrypoint.ts".into());
    }
    let up = Regex::new(r"from '\.\./([A-Za-z0-9_.]+\.ts)'").unwrap();
    let here = Regex::new(r"from '\./([A-Za-z0-9_.]+\.ts)'").unwrap();
    let ls = |d: &Path| {
        let mut v: Vec<String> = std::fs::read_dir(d)
            .unwrap()
            .filter_map(|e| e.ok()?.file_name().into_string().ok())
            .collect();
        v.sort();
        v
    };
    if full.join("bundle").exists() {
        std::fs::create_dir(code.join("bundle")).unwrap();
        for f in ls(&full.join("bundle")) {
            let txt = std::fs::read_to_string(full.join("bundle").join(&f)).unwrap();
            std::fs::write(code.join("bundle").join(&f), &txt).unwrap();
            for m in up.captures_iter(&txt) {
                top.insert(m[1].to_string());
            }
        }
    } else {
        // no per-instruction bundles (native dispatch not split): the code lives in the top-level files
        for f in ls(full) {
            if f.ends_with(".ts") && f != "index.ts" && f != "lib.d.ts" {
                top.insert(f);
            }
        }
    }
    // top-level modules imported by what is copied (not ix/: bundle/ already inlines it)
    let first: Vec<String> = top.iter().cloned().collect();
    for f in first {
        let txt = std::fs::read_to_string(full.join(&f)).unwrap();
        for m in here.captures_iter(&txt) {
            top.insert(m[1].to_string());
        }
    }
    for f in &top {
        std::fs::copy(full.join(f), code.join(f)).unwrap();
    }
}

fn main() {
    let root = repo_root();
    let e = root.join("eval");
    let only: Vec<String> = std::env::args().skip(1).collect();
    let decompile = std::env::current_exe()
        .expect("exe")
        .parent()
        .unwrap()
        .join("sbpf-decompile");
    let stats_file = e.join("packets/stats.json");
    let mut stats: BTreeMap<String, (Size, Size)> = BTreeMap::new();
    let mut kept: Map<String, Value> = Map::new();
    if let Ok(v) = read_json(&stats_file) {
        if let Some(p) = v.get("packets").and_then(Value::as_object) {
            kept = p.clone();
        }
    }
    let doc = read_json(&e.join("cases.json")).unwrap_or_else(|e| panic!("{e}"));
    for c in arr_at(&doc, "cases") {
        let bench = str_at(c, "source") == Some("bench");
        let cid = str_at(c, "id").unwrap_or("");
        for (variant, id) in c
            .get("packets")
            .and_then(Value::as_object)
            .into_iter()
            .flatten()
        {
            let id = js_string(id);
            if !only.is_empty() && !only.contains(&id) {
                continue;
            }
            let so = if bench {
                root.join(str_at(c, "binary").unwrap_or(""))
            } else {
                e.join("bin").join(format!("{cid}@{variant}.so"))
            };
            let idl_file = if bench {
                str_at(c, "idl_file")
                    .filter(|s| !s.is_empty())
                    .map(|f| root.join(f))
            } else if truthy(c.get("idl")) {
                Some(e.join("bin").join(format!("{cid}@{variant}.json")))
            } else {
                None
            };
            let tmp = std::env::temp_dir().join(format!("packet-{}-{id}", std::process::id()));
            std::fs::create_dir_all(&tmp).unwrap();
            let so_tmp = tmp.join(format!("{id}.so"));
            std::fs::copy(&so, &so_tmp).unwrap_or_else(|er| panic!("{}: {er}", so.display()));
            let mut cmd = Command::new(&decompile);
            cmd.arg(&so_tmp);
            if let Some(f) = idl_file {
                let mut idl = read_json(&f).unwrap_or_else(|e| panic!("{e}"));
                if let Some(p) = c.get("idl_patch").and_then(Value::as_object) {
                    idl = patch_idl(&idl, p);
                }
                let mut s = String::new();
                pretty(&neutral(idl, &id), "", &mut s);
                let j = tmp.join(format!("{id}.json"));
                std::fs::write(&j, s).unwrap();
                cmd.arg("--idl").arg(j);
            }
            let dir = e.join("packets").join(&id);
            let (full, code) = (dir.join("full"), dir.join("code"));
            std::fs::remove_dir_all(&dir).ok();
            let t = std::time::Instant::now();
            let st = cmd
                .arg("-o")
                .arg(format!("{}/", full.display()))
                .current_dir(&tmp)
                .stdin(Stdio::null())
                .stdout(Stdio::null())
                .status()
                .expect("sbpf-decompile");
            if !st.success() {
                panic!("sbpf-decompile failed on {id}: {st}");
            }
            std::fs::remove_dir_all(&tmp).ok();
            make_code(&full, &code);
            let s = (measure(&code), measure(&full));
            println!(
                "{id} {}s code {} full {}",
                fixed1(t.elapsed().as_secs_f64()),
                s.0.show(),
                s.1.show()
            );
            stats.insert(id, s);
        }
    }
    // packets depend on the decompiler version: record it (the packet directories themselves are not committed)
    let rev = Command::new("git")
        .args(["rev-parse", "--short", "HEAD"])
        .current_dir(&root)
        .output()
        .expect("git");
    for (id, (c, f)) in stats {
        kept.insert(id, json!({ "code": c.json(), "full": f.json() }));
    }
    let mut sorted: Vec<(String, Value)> = kept.into_iter().collect();
    sorted.sort_by(|a, b| a.0.cmp(&b.0));
    let doc = json!({
        "decompiler": String::from_utf8_lossy(&rev.stdout).trim(),
        "packets": Value::Object(sorted.into_iter().collect()),
    });
    let mut s = String::new();
    pretty(&doc, "", &mut s);
    std::fs::write(&stats_file, s + "\n").unwrap();
}
