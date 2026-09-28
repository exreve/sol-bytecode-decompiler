//! Corpus noise baseline of the analysis: decompiles every corpus/*.so (with corpus/idl/<id>.json when present) as the
//! CLI project output does, in parallel under a time budget, and prints per rule: programs hit, findings, findings per
//! 100 programs (informational findings and validation_consistency / stored-key signals in their own rows). On a clean
//! corpus every finding is presumed noise, so lower is better at equal bench recall.
//! usage: sbpf-bench-corpus [corpusDir] [--budget s=1800] [--timeout s=240] [--jobs n] [--save]
//!   compares with bench/corpus-baseline.json when present; --save rewrites it (only after a run that finished every
//!   program). Each program runs in a child process (`--one <so> [idl]`), killed on timeout.

#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use indexmap::IndexMap;
use sbpf_bench::*;
use serde_json::{json, Value};
use std::collections::{BTreeMap, HashSet};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;
use std::time::{Duration, Instant};

/// per program: row -> count; rows: `<rule>` (finding), `<rule> (info)`, `~consistency`, `~stored-key gap`
type Counts = IndexMap<String, u64>;

fn counts(a: &Value) -> Counts {
    let mut c = Counts::new();
    let mut add = |k: String| *c.entry(k).or_insert(0) += 1;
    for f in arr_at(a, "findings") {
        let rule = js_string(f.get("rule").unwrap_or(&Value::Null));
        add(if str_at(f, "confidence") == Some("info") {
            format!("{rule} (info)")
        } else {
            rule
        });
    }
    for r in arr_at(a, "validation_consistency") {
        for _ in arr_at(r, "inconsistencies") {
            add("~consistency".into());
        }
    }
    for ix in arr_at(a, "instructions") {
        for k in arr_at(ix, "stored_keys") {
            for _ in arr_at(k, "gaps") {
                add("~stored-key gap".into());
            }
        }
    }
    c
}

/// child mode: one program's counts as JSON on stdout
fn one(so: &str, idl: Option<&str>) -> i32 {
    // an IDL the parser rejects: none, as the CLI would fail
    let idl = idl.and_then(|p| read_json(Path::new(p)).ok());
    let r = std::fs::read(so)
        .map_err(|e| e.to_string())
        .and_then(|b| analysis_json(&b, idl.as_ref()))
        .and_then(|t| parse(&t));
    match r {
        Ok(a) => {
            println!(
                "{}",
                Value::Object(counts(&a).into_iter().map(|(k, n)| (k, json!(n))).collect())
            );
            0
        }
        Err(e) => {
            println!("{}", json!({ "error": e }));
            0
        }
    }
}

enum Res {
    Counts(Counts),
    Timeout,
    Failed(String),
}

fn run_one(so: &Path, idl: Option<&Path>, timeout: Duration) -> Res {
    let mut cmd = Command::new(std::env::current_exe().expect("exe"));
    cmd.arg("--one").arg(so);
    if let Some(i) = idl {
        cmd.arg(i);
    }
    let mut child = match cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).spawn() {
        Ok(c) => c,
        Err(e) => return Res::Failed(e.to_string()),
    };
    // read the pipes on threads so a large output never blocks the child
    let mut so_pipe = child.stdout.take().unwrap();
    let mut se_pipe = child.stderr.take().unwrap();
    let ro = std::thread::spawn(move || {
        let mut s = String::new();
        std::io::Read::read_to_string(&mut so_pipe, &mut s).ok();
        s
    });
    let re = std::thread::spawn(move || {
        let mut s = String::new();
        std::io::Read::read_to_string(&mut se_pipe, &mut s).ok();
        s
    });
    let t0 = Instant::now();
    let status = loop {
        match child.try_wait() {
            Ok(Some(s)) => break Some(s),
            Ok(None) if t0.elapsed() > timeout => {
                child.kill().ok();
                child.wait().ok();
                break None;
            }
            Ok(None) => std::thread::sleep(Duration::from_millis(20)),
            Err(e) => return Res::Failed(e.to_string()),
        }
    };
    let out = ro.join().unwrap_or_default();
    let err = re.join().unwrap_or_default();
    let Some(status) = status else {
        return Res::Timeout;
    };
    match serde_json::from_str::<Value>(out.trim()) {
        Ok(Value::Object(o)) if !o.contains_key("error") => Res::Counts(
            o.into_iter()
                .map(|(k, v)| (k, v.as_u64().unwrap_or(0)))
                .collect(),
        ),
        Ok(v) => Res::Failed(js_string(&v["error"])),
        Err(_) => Res::Failed(if err.trim().is_empty() {
            format!("exit {status}")
        } else {
            err.trim().to_string()
        }),
    }
}

fn arg(args: &[String], name: &str, dflt: u64) -> u64 {
    match args.iter().position(|a| a == name) {
        Some(i) => args.get(i + 1).and_then(|v| v.parse().ok()).unwrap_or(0),
        None => dflt,
    }
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.first().map(String::as_str) == Some("--one") {
        let t = std::thread::Builder::new()
            .stack_size(1 << 30)
            .spawn(move || one(&args[1], args.get(2).map(String::as_str)))
            .expect("spawn");
        std::process::exit(t.join().unwrap_or(1));
    }
    let baseline = repo_root().join("bench/corpus-baseline.json");
    let dir: PathBuf = args
        .iter()
        .enumerate()
        .find(|(i, a)| {
            !a.starts_with('-')
                && !(*i > 0 && ["--budget", "--timeout", "--jobs"].contains(&args[i - 1].as_str()))
        })
        .map_or_else(|| repo_root().join("corpus"), |(_, a)| PathBuf::from(a));
    if !dir.exists() {
        eprintln!("no corpus at {} (pass its directory)", dir.display());
        std::process::exit(1);
    }
    let budget = Duration::from_secs(arg(&args, "--budget", 1800));
    let timeout = Duration::from_secs(arg(&args, "--timeout", 240));
    let nw = arg(
        &args,
        "--jobs",
        parallelism().saturating_sub(2).max(1) as u64,
    )
    .max(1) as usize;
    let mut files: Vec<String> = std::fs::read_dir(&dir)
        .expect("corpus dir")
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .filter(|f| f.ends_with(".so"))
        .collect();
    files.sort();
    // big ones first: the budget cuts the small tail rather than a long program started last
    let mut queue: Vec<(String, PathBuf, u64)> = files
        .iter()
        .map(|f| {
            let p = dir.join(f);
            let size = std::fs::metadata(&p).map_or(0, |m| m.len());
            (f[..f.len() - 3].to_string(), p, size)
        })
        .collect();
    queue.sort_by(|a, b| b.2.cmp(&a.2));
    let t0 = Instant::now();
    let next = AtomicUsize::new(0);
    let skipped = AtomicUsize::new(0);
    let done_n = AtomicUsize::new(0);
    let results: Mutex<BTreeMap<String, Res>> = Mutex::new(BTreeMap::new());
    std::thread::scope(|s| {
        let mut hs = Vec::new(); // joined below: a dropped handle detaches its thread
        for _ in 0..nw {
            hs.push(s.spawn(|| loop {
                let i = next.fetch_add(1, Ordering::Relaxed);
                let Some((id, so, _)) = queue.get(i) else {
                    break;
                };
                if t0.elapsed() > budget {
                    skipped.fetch_add(1, Ordering::Relaxed);
                    continue;
                }
                let idl = dir.join("idl").join(format!("{id}.json"));
                let r = run_one(so, idl.exists().then_some(idl.as_path()), timeout);
                results.lock().unwrap().insert(id.clone(), r);
                let n = done_n.fetch_add(1, Ordering::Relaxed) + 1;
                if n % 25 == 0 {
                    eprintln!(
                        "  {n}/{} ({}s)",
                        files.len(),
                        fixed0(t0.elapsed().as_secs_f64())
                    );
                }
            }));
        }
        for h in hs {
            if let Err(e) = h.join() {
                std::panic::resume_unwind(e);
            }
        }
    });
    let skipped = skipped.into_inner();
    let mut per: IndexMap<String, Counts> = IndexMap::new();
    let (mut timeouts, mut failures) = (vec![], vec![]);
    for (id, r) in results.into_inner().unwrap() {
        match r {
            Res::Counts(c) => {
                per.insert(id, c);
            }
            Res::Timeout => timeouts.push(id),
            Res::Failed(e) => failures.push(format!("{id}: {}", e.lines().next().unwrap_or(""))),
        }
    }
    let done = per.len();
    let mut rows: IndexMap<String, (u64, u64)> = IndexMap::new();
    for c in per.values() {
        for (k, n) in c {
            let r = rows.entry(k.clone()).or_insert((0, 0));
            r.0 += 1;
            r.1 += n;
        }
    }
    let base: Option<Value> = if baseline.exists() {
        read_json(&baseline).ok()
    } else {
        None
    };
    println!(
        "corpus: {done}/{} programs analysed, {} timeouts, {} failures, {skipped} skipped (budget) [{}s]",
        files.len(),
        timeouts.len(),
        failures.len(),
        fixed0(t0.elapsed().as_secs_f64())
    );
    println!(
        "{} programs  findings  per100{}",
        pad_end("rule", 40),
        if base.is_some() {
            "   baseline (programs / findings, same programs)"
        } else {
            ""
        }
    );
    let mut keys: Vec<String> = rows.keys().cloned().collect();
    if let Some(b) = base
        .as_ref()
        .and_then(|b| b.get("rows"))
        .and_then(Value::as_object)
    {
        for k in b.keys() {
            if !rows.contains_key(k) {
                keys.push(k.clone());
            }
        }
    }
    let findings = |k: &str| rows.get(k).map_or(0, |r| r.1);
    keys.sort_by(|a, b| {
        a.starts_with('~')
            .cmp(&b.starts_with('~'))
            .then(a.contains("(info)").cmp(&b.contains("(info)")))
            .then(findings(b).cmp(&findings(a)))
    });
    let mut total = 0;
    let mut total_progs: HashSet<&str> = HashSet::new();
    for k in &keys {
        let (rp, rf) = rows.get(k).copied().unwrap_or((0, 0));
        if !k.starts_with('~') && !k.contains("(info)") {
            total += rf;
            for (id, c) in &per {
                if c.get(k).is_some_and(|n| *n > 0) {
                    total_progs.insert(id);
                }
            }
        }
        let mut cmp = String::new();
        if let Some(b) = &base {
            // same program set: only programs analysed in both runs
            let (mut p, mut f) = (0, 0);
            for id in per.keys() {
                let n = b["per_program"]
                    .get(id)
                    .and_then(|c| c.get(k))
                    .and_then(Value::as_u64)
                    .unwrap_or(0);
                if n > 0 {
                    p += 1;
                    f += n;
                }
            }
            if p != rp || f != rf {
                cmp = format!("   {p} / {f}");
            }
        }
        println!(
            "{} {} {} {}{cmp}",
            pad_end(k.strip_prefix('~').unwrap_or(k), 40),
            pad_start(&rp.to_string(), 8),
            pad_start(&rf.to_string(), 9),
            pad_start(&fixed1(100.0 * rf as f64 / done.max(1) as f64), 7)
        );
    }
    println!(
        "all findings (not info) {} {} {} {}",
        " ".repeat(16),
        pad_start(&total_progs.len().to_string(), 8),
        pad_start(&total.to_string(), 9),
        pad_start(&fixed1(100.0 * total as f64 / done.max(1) as f64), 7)
    );
    if !timeouts.is_empty() {
        println!("timeouts: {}", timeouts.join(" "));
    }
    for f in &failures {
        println!("failed: {f}");
    }
    if args.iter().any(|a| a == "--save") {
        if skipped > 0 {
            eprintln!("not saved: the budget cut the run");
        } else {
            let rows_v: serde_json::Map<String, Value> = rows
                .iter()
                .map(|(k, (p, f))| (k.clone(), json!({ "programs": p, "findings": f })))
                .collect();
            let per_v: serde_json::Map<String, Value> = per
                .iter()
                .map(|(id, c)| {
                    (
                        id.clone(),
                        Value::Object(c.iter().map(|(k, n)| (k.clone(), json!(n))).collect()),
                    )
                })
                .collect();
            let doc = json!({
                "about": "sbpf-bench-corpus --save: per rule programs / findings on the corpus; per_program: nonzero counts (~ rows: informational signals)",
                "date": utc_date(),
                "programs": done,
                "timeouts": timeouts,
                "failures": failures,
                "rows": rows_v,
                "per_program": per_v,
            });
            std::fs::write(&baseline, fmt(&doc, "") + "\n").expect("write baseline");
            println!("saved {}", baseline.display());
        }
    }
}

/// today (UTC) as YYYY-MM-DD
fn utc_date() -> String {
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_or(0, |d| d.as_secs()) as i64;
    let z = secs.div_euclid(86400) + 719468;
    let era = z.div_euclid(146097);
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = yoe + era * 400 + i64::from(m <= 2);
    format!("{y:04}-{m:02}-{d:02}")
}

/// JSON with tab indentation, objects / arrays of primitives on one line
fn fmt(x: &Value, ind: &str) -> String {
    let prim = |v: &Value| !v.is_object() && !v.is_array();
    let inner = format!("{ind}\t");
    match x {
        Value::Array(a) => {
            let items: Vec<String> = a.iter().map(|v| fmt(v, &inner)).collect();
            if a.iter().all(prim) {
                format!("[{}]", items.join(", "))
            } else {
                format!(
                    "[\n{}\n{ind}]",
                    items
                        .iter()
                        .map(|i| format!("{inner}{i}"))
                        .collect::<Vec<_>>()
                        .join(",\n")
                )
            }
        }
        Value::Object(o) => {
            let items: Vec<String> = o
                .iter()
                .map(|(k, v)| format!("{}: {}", serde_json::to_string(k).unwrap(), fmt(v, &inner)))
                .collect();
            if o.values().all(prim) {
                if items.is_empty() {
                    "{}".into()
                } else {
                    format!("{{ {} }}", items.join(", "))
                }
            } else {
                format!(
                    "{{\n{}\n{ind}}}",
                    items
                        .iter()
                        .map(|i| format!("{inner}{i}"))
                        .collect::<Vec<_>>()
                        .join(",\n")
                )
            }
        }
        v => serde_json::to_string(v).unwrap(),
    }
}
