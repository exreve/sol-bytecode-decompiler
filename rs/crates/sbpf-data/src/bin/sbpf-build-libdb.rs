//! Build data/libsigs.json: fingerprints of functions shared by many unrelated programs.
//! Programs from the same code base (forks/redeploys) are clustered into families first so
//! that forked *user* code is not mistaken for library code.
//! usage: sbpf-build-libdb [corpusDir=corpus] [minFamilies=3]   (run from the repository root)

use indexmap::{IndexMap, IndexSet};
use sbpf_lib::fingerprint::{check_pcs, fingerprint};
use sbpf_lib::library::MIN_LIB_INSNS;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::io::Write;

struct ProgInfo {
    hashes: IndexSet<String>,
    size: HashMap<String, usize>,
}

fn load(file: &str) -> Result<ProgInfo, String> {
    let bytes = std::fs::read(file).map_err(|e| e.to_string())?;
    let p = sbpf_program::load_program(&bytes, false)?;
    check_pcs(&p)?;
    let img = p.image();
    let mut info = ProgInfo {
        hashes: IndexSet::new(),
        size: HashMap::new(),
    };
    for f in p.funcs.values() {
        let fp = fingerprint(&p, &img, f);
        if fp.insns < MIN_LIB_INSNS {
            continue;
        }
        info.hashes.insert(fp.hash.clone());
        info.size.insert(fp.hash, fp.insns);
    }
    Ok(info)
}

fn find(parent: &mut [usize], x: usize) -> usize {
    let mut r = x;
    while parent[r] != r {
        r = parent[r];
    }
    let mut y = x;
    while parent[y] != r {
        let n = parent[y];
        parent[y] = r;
        y = n;
    }
    r
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let dir = args.first().cloned().unwrap_or_else(|| "corpus".into());
    let min_fam: usize = args.get(1).and_then(|s| s.parse().ok()).unwrap_or(3);
    let mut files: Vec<String> = sbpf_data::so_files(&dir)
        .into_iter()
        .map(|f| format!("{dir}/{f}"))
        .collect();
    files.extend(
        sbpf_data::so_files("samples")
            .into_iter()
            .map(|f| format!("samples/{f}")),
    );
    let mut progs: Vec<ProgInfo> = vec![];
    let mut out = std::io::stdout();
    for file in &files {
        match load(file) {
            Ok(info) => {
                progs.push(info);
                write!(out, "\r{}/{}", progs.len(), files.len()).ok();
                out.flush().ok();
            }
            Err(e) => println!("\nskip {file} {}", e.chars().take(80).collect::<String>()),
        }
    }
    println!();
    // global frequency
    let mut freq: IndexMap<&str, usize> = IndexMap::new();
    for pr in &progs {
        for h in &pr.hashes {
            *freq.entry(h).or_insert(0) += 1;
        }
    }
    // family clustering on rare hashes (frequency <= 4): programs sharing many rare functions are one code base
    let mut parent: Vec<usize> = (0..progs.len()).collect();
    let rare_of: Vec<Vec<&str>> = progs
        .iter()
        .map(|pr| {
            pr.hashes
                .iter()
                .map(String::as_str)
                .filter(|h| freq[h] <= 4)
                .collect()
        })
        .collect();
    let mut by_hash: IndexMap<&str, Vec<usize>> = IndexMap::new();
    for (i, s) in rare_of.iter().enumerate() {
        for h in s {
            by_hash.entry(h).or_default().push(i);
        }
    }
    let mut pair_count: IndexMap<(usize, usize), usize> = IndexMap::new();
    for ids in by_hash.values() {
        for a in 0..ids.len() {
            for b in a + 1..ids.len() {
                *pair_count.entry((ids[a], ids[b])).or_insert(0) += 1;
            }
        }
    }
    for (&(a, b), &n) in &pair_count {
        let small = rare_of[a].len().min(rare_of[b].len());
        if n >= 10 && n as f64 >= 0.2 * small as f64 {
            let (ra, rb) = (find(&mut parent, a), find(&mut parent, b));
            parent[ra] = rb;
        }
    }
    let roots: Vec<usize> = (0..progs.len()).map(|i| find(&mut parent, i)).collect();
    let families = roots.iter().collect::<IndexSet<_>>().len();
    // count families per hash
    let mut fam: IndexMap<&str, IndexSet<usize>> = IndexMap::new();
    for (i, pr) in progs.iter().enumerate() {
        for h in &pr.hashes {
            fam.entry(h).or_default().insert(roots[i]);
        }
    }
    let mut sigs = serde_json::Map::new();
    for (h, s) in &fam {
        if s.len() >= min_fam {
            let size = progs.iter().find(|p| p.hashes.contains(*h)).unwrap().size[*h];
            sigs.insert(h.to_string(), json!([s.len(), size]));
        }
    }
    let kept = sigs.len();
    std::fs::create_dir_all("data").expect("data/");
    let doc = json!({ "programs": progs.len(), "families": families, "minFamilies": min_fam, "sigs": Value::Object(sigs) });
    std::fs::write("data/libsigs.json", doc.to_string()).expect("data/libsigs.json");
    println!(
        "programs {}, families {families}, distinct fns {}, library sigs {kept}",
        progs.len(),
        freq.len()
    );
}
