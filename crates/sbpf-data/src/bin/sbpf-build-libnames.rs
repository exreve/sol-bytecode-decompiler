//! Build data/libnames.json: fingerprint -> demangled Rust name, from symbolized reference builds (sbpf-refbuild).
//! usage: sbpf-build-libnames [dir=refbuild/out]   (run from the repository root)

use indexmap::IndexMap;
use sbpf_lib::fingerprint::{check_pcs, fingerprint};
use sbpf_lib::library::MIN_LIB_INSNS;

/// the reference program's own code: `ref_native` / `ref_anchor` / `ref_anchor_rich` as a word
fn own_code(n: &str) -> bool {
    ["ref_native", "ref_anchor", "ref_anchor_rich"]
        .iter()
        .any(|w| {
            n.match_indices(w).any(|(i, _)| {
                !n[i + w.len()..]
                    .chars()
                    .next()
                    .is_some_and(|c| c.is_ascii_alphanumeric() || c == '_')
            })
        })
}

fn main() {
    let dir = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "refbuild/out".into());
    let mut names: IndexMap<String, IndexMap<String, usize>> = IndexMap::new();
    let mut nf = 0;
    for f in sbpf_data::so_files(&dir) {
        let bytes = std::fs::read(format!("{dir}/{f}")).unwrap_or_else(|e| panic!("{f}: {e}"));
        let p = sbpf_program::load_program(&bytes, false).unwrap_or_else(|e| panic!("{f}: {e}"));
        check_pcs(&p).unwrap_or_else(|e| panic!("{f}: {e}"));
        let img = p.image();
        for func in p.funcs.values() {
            let Some(sym) = p.symbol_names.get(&func.pc) else {
                continue;
            };
            let fp = fingerprint(&p, &img, func);
            if fp.insns < MIN_LIB_INSNS {
                continue;
            }
            let n = sbpf_data::demangle(sym);
            if own_code(&n) || n == "process" {
                continue;
            }
            *names.entry(fp.hash).or_default().entry(n).or_insert(0) += 1;
            nf += 1;
        }
    }
    let mut out = serde_json::Map::new();
    for (h, m) in names {
        // several instantiations can compile to identical code: prefer the most frequent, then shortest
        let mut v: Vec<(String, usize)> = m.into_iter().collect();
        v.sort_by(|a, b| {
            b.1.cmp(&a.1)
                .then(a.0.encode_utf16().count().cmp(&b.0.encode_utf16().count()))
        });
        out.insert(h, serde_json::Value::String(v.swap_remove(0).0));
    }
    let n = out.len();
    std::fs::write(
        "data/libnames.json",
        serde_json::Value::Object(out).to_string(),
    )
    .expect("data/libnames.json");
    println!("functions {nf}, named fingerprints {n}");
}
