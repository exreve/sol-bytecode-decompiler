//! Regression runner against the frozen TS CLI fixtures (`scripts/fixtures.ts`, see docs/RUST_PORT.md): runs the
//! real `sbpf-decompile` binary on every binary of the fixtures and compares its outputs byte for byte.
//!
//!   sbpf-fixtures --fixtures dir [--bin sbpf-decompile] [--root repo (default .)] [-j N] [--ofile] [--no-diff | --only-diff] [substring...]
//!
//! Per binary (`<fixtures>/<path>.jsonl.zst`, decompressed with `zstd -dc --long=27`): the default single file on
//! stdout (and `-o out.ts` with `--ofile`), the project (`-o dir/`), `--full` on stdout, and with the binary's IDL
//! `--idl x.json` on stdout and as a project; stderr and the exit code too (`stderr/<mode>`, `error/<mode>`: the
//! first line). `diff.jsonl.zst`: each pair on stdout (terminal report) and with `-o report.txt` (complete).
//! The binaries and IDLs are read from `--root` (the paths in the fixtures are relative to it). Substrings select
//! the binaries (and pairs) whose path contains one of them. Exit status 1 when anything differs.

use serde_json::Value;
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;

struct Cfg {
    bin: String,
    root: PathBuf,
    fixtures: PathBuf,
    ofile: bool,
    tmp: PathBuf,
}

fn zstd_lines(path: &Path) -> Vec<Value> {
    let out = Command::new("zstd")
        .args(["-dc", "--long=27"])
        .arg(path)
        .output()
        .expect("zstd");
    assert!(out.status.success(), "zstd -dc {}", path.display());
    String::from_utf8(out.stdout)
        .expect("utf-8")
        .lines()
        .map(|l| serde_json::from_str(l).expect("json line"))
        .collect()
}

struct Run {
    code: i32,
    stdout: Vec<u8>,
    stderr: String,
}

fn run(cfg: &Cfg, args: &[&str]) -> Run {
    let o = Command::new(&cfg.bin)
        .args(args)
        .current_dir(&cfg.root)
        .stdin(Stdio::null())
        .output()
        .expect("run sbpf-decompile");
    Run {
        code: o.status.code().unwrap_or(-1),
        stdout: o.stdout,
        stderr: String::from_utf8_lossy(&o.stderr).into_owned(),
    }
}

/// The first differing line of two texts.
fn first_diff(a: &str, b: &str) -> String {
    let (la, lb): (Vec<&str>, Vec<&str>) = (a.split('\n').collect(), b.split('\n').collect());
    let k = la.iter().zip(&lb).take_while(|(x, y)| x == y).count();
    let clip = |s: Option<&&str>| s.map_or("<end>".to_string(), |s| s.chars().take(160).collect());
    format!(
        "line {}\n      ts: {}\n      rs: {}",
        k + 1,
        clip(la.get(k)),
        clip(lb.get(k))
    )
}

/// Every file under `dir` (relative path -> text).
fn read_tree(dir: &Path) -> BTreeMap<String, String> {
    let mut out = BTreeMap::new();
    let mut stack = vec![dir.to_path_buf()];
    while let Some(d) = stack.pop() {
        let Ok(rd) = std::fs::read_dir(&d) else {
            continue;
        };
        for e in rd.flatten() {
            let p = e.path();
            if p.is_dir() {
                stack.push(p);
            } else {
                let rel = p.strip_prefix(dir).unwrap().to_string_lossy().into_owned();
                out.insert(
                    rel,
                    String::from_utf8_lossy(&std::fs::read(&p).unwrap()).into_owned(),
                );
            }
        }
    }
    out
}

/// Compares one CLI run against the fixture: `Ok` or the difference.
fn check(
    r: &Run,
    err: Option<&str>,
    stderr: &str,
    text: Option<&str>,
    what: &str,
) -> Result<(), String> {
    if let Some(e) = err {
        let first = r.stderr.lines().next().unwrap_or("");
        return if r.code == 1 && first == e {
            Ok(())
        } else {
            Err(format!(
                "{what}: expected error `{e}`, got exit {} `{first}`",
                r.code
            ))
        };
    }
    if r.code != 0 {
        return Err(format!(
            "{what}: exit {} ({})",
            r.code,
            r.stderr.lines().next().unwrap_or("")
        ));
    }
    if r.stderr != stderr {
        return Err(format!("{what}: stderr {}", first_diff(stderr, &r.stderr)));
    }
    if let Some(t) = text {
        let got = String::from_utf8_lossy(&r.stdout);
        if got != t {
            return Err(format!("{what}: {}", first_diff(t, &got)));
        }
    }
    Ok(())
}

fn check_project(
    cfg: &Cfg,
    args: &[&str],
    dir: &Path,
    err: Option<&str>,
    stderr: &str,
    want: &BTreeMap<String, String>,
    what: &str,
) -> Result<(), String> {
    let _ = std::fs::remove_dir_all(dir);
    let d = format!("{}/", dir.display());
    let mut a: Vec<&str> = args.to_vec();
    a.extend(["-o", &d]);
    let r = run(cfg, &a);
    let res = (|| {
        check(
            &r,
            err,
            &format!("{stderr}wrote project to {d}\n"),
            None,
            what,
        )?;
        if err.is_some() {
            return Ok(());
        }
        let got = read_tree(dir);
        for (p, t) in want {
            match got.get(p) {
                None => return Err(format!("{what}: missing {p}")),
                Some(g) if g != t => return Err(format!("{what}: {p} {}", first_diff(t, g))),
                _ => {}
            }
        }
        if let Some(p) = got.keys().find(|p| !want.contains_key(*p)) {
            return Err(format!("{what}: extra file {p}"));
        }
        Ok(())
    })();
    let _ = std::fs::remove_dir_all(dir);
    res
}

/// All checks of one binary: (mode, result) pairs.
fn check_binary(cfg: &Cfg, fix: &Path, slot: usize) -> Vec<(&'static str, Result<(), String>)> {
    let recs = zstd_lines(fix);
    let file = recs[0]["file"].as_str().unwrap().to_string();
    let idl = recs[0]["idl"].as_str().map(|s| s.to_string());
    let mut texts: BTreeMap<String, String> = BTreeMap::new();
    for r in &recs[1..] {
        texts.insert(
            r["out"].as_str().unwrap().to_string(),
            r["text"].as_str().unwrap().to_string(),
        );
    }
    let get = |k: &str| texts.get(k).map(|s| s.as_str());
    let stderr = |m: &str| get(&format!("stderr/{m}")).unwrap_or("").to_string();
    let project = |prefix: &str| -> BTreeMap<String, String> {
        texts
            .iter()
            .filter_map(|(k, v)| k.strip_prefix(prefix).map(|p| (p.to_string(), v.clone())))
            .collect()
    };
    let dir = cfg.tmp.join(format!("w{slot}"));
    let mut out = Vec::new();
    // default: stdout, -o out.ts, -o dir/
    let e = get("error/default");
    let r = run(cfg, &[&file]);
    out.push((
        "single (stdout)",
        check(&r, e, &stderr("default"), get("single.ts"), "single"),
    ));
    if cfg.ofile {
        let f = cfg.tmp.join(format!("w{slot}.ts"));
        let fs = f.to_string_lossy().into_owned();
        let _ = std::fs::remove_file(&f);
        let r = run(cfg, &[&file, "-o", &fs]);
        let res = check(&r, e, &stderr("default"), None, "single -o").and_then(|_| {
            if e.is_some() {
                return Ok(());
            }
            let got = std::fs::read_to_string(&f).unwrap_or_default();
            let want = get("single.ts").unwrap_or("");
            if got == want {
                Ok(())
            } else {
                Err(format!("single -o: {}", first_diff(want, &got)))
            }
        });
        let _ = std::fs::remove_file(&f);
        out.push(("single (-o file)", res));
    }
    out.push((
        "project",
        check_project(
            cfg,
            &[&file],
            &dir,
            e.or(get("error/project")),
            &stderr("default"),
            &project("project/"),
            "project",
        ),
    ));
    let r = run(cfg, &[&file, "--full"]);
    out.push((
        "--full",
        check(
            &r,
            get("error/full"),
            &stderr("full"),
            get("full.ts"),
            "--full",
        ),
    ));
    if let Some(idl) = &idl {
        let e = get("error/idl");
        let r = run(cfg, &[&file, "--idl", idl]);
        out.push((
            "--idl single",
            check(&r, e, &stderr("idl"), get("idl.ts"), "--idl"),
        ));
        out.push((
            "--idl project",
            check_project(
                cfg,
                &[&file, "--idl", idl],
                &dir,
                e.or(get("error/idl-project")),
                &stderr("idl"),
                &project("idl-project/"),
                "--idl project",
            ),
        ));
    }
    out
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let exe = std::env::current_exe().unwrap();
    let mut cfg = Cfg {
        bin: exe
            .with_file_name("sbpf-decompile")
            .to_string_lossy()
            .into_owned(),
        root: PathBuf::from("."),
        fixtures: PathBuf::new(),
        ofile: false,
        tmp: std::env::temp_dir().join(format!("sbpf-fixtures-{}", std::process::id())),
    };
    let (mut jobs, mut diffs, mut bins, mut filters) = (2usize, true, true, Vec::new());
    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--bin" => {
                cfg.bin = args[i + 1].clone();
                i += 1;
            }
            "--root" => {
                cfg.root = PathBuf::from(&args[i + 1]);
                i += 1;
            }
            "--fixtures" => {
                cfg.fixtures = PathBuf::from(&args[i + 1]);
                i += 1;
            }
            "-j" => {
                jobs = args[i + 1].parse().expect("-j N");
                i += 1;
            }
            "--ofile" => cfg.ofile = true,
            "--no-diff" => diffs = false,
            "--only-diff" => bins = false,
            s => filters.push(s.to_string()),
        }
        i += 1;
    }
    let bin = std::fs::canonicalize(&cfg.bin).expect("sbpf-decompile binary");
    cfg.bin = bin.to_string_lossy().into_owned();
    std::fs::create_dir_all(&cfg.tmp).unwrap();
    let t0 = std::time::Instant::now();
    let wanted = |p: &str| filters.is_empty() || filters.iter().any(|f| p.contains(f.as_str()));
    let list = std::fs::read_to_string(cfg.fixtures.join("files.txt")).expect("files.txt");
    let files: Vec<String> = list
        .lines()
        .filter(|l| bins && !l.is_empty() && wanted(l))
        .map(|s| s.to_string())
        .collect();
    let counts: Mutex<BTreeMap<&'static str, (usize, usize)>> = Mutex::new(BTreeMap::new());
    let missing = AtomicUsize::new(0);
    let next = AtomicUsize::new(0);
    std::thread::scope(|s| {
        for slot in 0..jobs {
            let (cfg, files, counts, next, missing) = (&cfg, &files, &counts, &next, &missing);
            s.spawn(move || loop {
                let k = next.fetch_add(1, Ordering::SeqCst);
                let Some(f) = files.get(k) else { break };
                let fix = cfg.fixtures.join(format!("{f}.jsonl.zst"));
                if !fix.exists() {
                    missing.fetch_add(1, Ordering::SeqCst);
                    println!("MISSING fixture {f}");
                    continue;
                }
                let res = check_binary(cfg, &fix, slot);
                let mut c = counts.lock().unwrap();
                for (mode, r) in res {
                    let e = c.entry(mode).or_default();
                    e.1 += 1;
                    match r {
                        Ok(()) => e.0 += 1,
                        Err(m) => println!("DIFF {f}: {m}"),
                    }
                }
            });
        }
    });
    let mut c = counts.into_inner().unwrap();
    // the program diffs
    let dfix = cfg.fixtures.join("diff.jsonl.zst");
    if diffs && dfix.exists() {
        let report = cfg.tmp.join("report.txt");
        let rs = report.to_string_lossy().into_owned();
        for r in zstd_lines(&dfix) {
            let (a, b) = (r["a"].as_str().unwrap(), r["b"].as_str().unwrap());
            if !(wanted(a) || wanted(b)) {
                continue;
            }
            let all = r["all"].as_bool().unwrap();
            let mode = if all { "diff (-o)" } else { "diff (stdout)" };
            let err = r["error"].as_str();
            let res = if all {
                let _ = std::fs::remove_file(&report);
                let x = run(&cfg, &[a, b, "-o", &rs]);
                check(&x, err, "", None, mode).and_then(|_| {
                    if err.is_some() {
                        return Ok(());
                    }
                    let got = std::fs::read_to_string(&report).unwrap_or_default();
                    let want = r["text"].as_str().unwrap();
                    if got == want {
                        Ok(())
                    } else {
                        Err(format!("{mode}: {}", first_diff(want, &got)))
                    }
                })
            } else {
                let x = run(&cfg, &[a, b]);
                check(&x, err, "", r["text"].as_str(), mode)
            };
            let e = c.entry(mode).or_default();
            e.1 += 1;
            match res {
                Ok(()) => e.0 += 1,
                Err(m) => println!("DIFF {a} {b}: {m}"),
            }
        }
    }
    let _ = std::fs::remove_dir_all(&cfg.tmp);
    let mut bad = missing.load(Ordering::SeqCst);
    println!(
        "sbpf-fixtures: {} binaries ({} s)",
        files.len(),
        t0.elapsed().as_secs()
    );
    for (mode, (ok, n)) in &c {
        println!("  {mode}: {ok}/{n} identical");
        bad += n - ok;
    }
    std::process::exit(if bad > 0 { 1 } else { 0 });
}
