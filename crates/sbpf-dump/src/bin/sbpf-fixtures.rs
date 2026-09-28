//! Golden-output regression guard: runs the real `sbpf-decompile` binary on every binary of a golden set and
//! compares its outputs (stdout, files, stderr, exit code) byte for byte with the recorded ones; `--write` records
//! them instead (after an intentional output change).
//!
//!   sbpf-fixtures --fixtures dir [--bin sbpf-decompile] [--root repo (default .)] [-j N] [--ofile] [--no-diff | --only-diff] [--fuzz] [substring...]
//!   sbpf-fixtures --fixtures dir --write [--bin ...] [--root ...] [-j N] [--no-diff | --only-diff] [--fuzz] [substring...]
//!
//! Layout of the golden directory (docs/INTERNALS.md, "Regression guards"):
//! - `files.txt`: the binaries, paths relative to `--root` (`--write` creates it from `samples/`, `samples/regress/`,
//!   `compat/bin/`, `eval/bin/`, `bench/bin/`, `corpus/` when missing; add a line to guard another binary).
//! - `<path>.jsonl.zst` per binary (zstd `--long=27`, JSON lines): a header `{"file","idl"}` (the binary's Anchor IDL:
//!   `<name>.json` next to it, in `../idl/` or `idl/`, `<name>` with or without its `@variant` suffix), then
//!   `{"out","text"}` records: `single.ts` (the default single file on stdout, and `-o out.ts` with `--ofile`),
//!   `project/<path>` (`-o dir/`), `full.ts` (`--full`), `idl.ts` / `idl-project/<path>` (`--idl x.json`), and
//!   `stderr/<mode>` (warnings) or `error/<mode>` (the first line of a fatal error; exit code 1).
//! - `diff.jsonl.zst`: per pair of `pairs.txt` (`a b` per line) the terminal report (stdout) and the complete one
//!   (`-o report.txt`): `{"a","b","all","text"}`.
//! - `fuzz.json`: fuzz runs (`seed`, `n`, the binary `sets` under `--root`); `--fuzz` checks the xorshift32 mutants
//!   of the sets' binaries under 512 KB (see `mutate`) against `fuzz/seed<S>/fuzz<i>.so.jsonl.zst`, and their sha-256
//!   against `fuzz/seed<S>/mutants.sha256` (a mismatch means the base sets changed). `--write-mutants dir`: write the
//!   mutants to `dir/fuzz/seed<S>/fuzz<i>.so` and exit.
//!
//! Substrings select the binaries (and pairs) whose path contains one of them. Exit status 1 when anything differs.
//! Needs the `zstd` command.

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

/// xorshift32 (deterministic mutants)
struct Rng(u32);

impl Rng {
    fn next(&mut self) -> u32 {
        let mut x = self.0;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        self.0 = x;
        x
    }
    fn pick<T: Copy>(&mut self, a: &[T]) -> T {
        a[(self.next() as usize) % a.len()]
    }
}

const OPS: &[u8] = &[
    0x04, 0x05, 0x07, 0x0c, 0x0f, 0x14, 0x15, 0x16, 0x17, 0x18, 0x1c, 0x1d, 0x1e, 0x1f, 0x24, 0x25,
    0x26, 0x27, 0x2c, 0x2d, 0x2e, 0x2f, 0x34, 0x35, 0x36, 0x37, 0x3c, 0x3d, 0x3e, 0x3f, 0x44, 0x45,
    0x46, 0x47, 0x4c, 0x4d, 0x4e, 0x4f, 0x54, 0x55, 0x56, 0x57, 0x5c, 0x5d, 0x5e, 0x5f, 0x61, 0x62,
    0x63, 0x64, 0x65, 0x66, 0x67, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x71, 0x72, 0x73, 0x74,
    0x75, 0x76, 0x77, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f, 0x84, 0x85, 0x86, 0x87, 0x8c, 0x8d,
    0x8e, 0x8f, 0x94, 0x95, 0x96, 0x97, 0x9c, 0x9f, 0xa4, 0xa5, 0xa6, 0xa7, 0xac, 0xad, 0xae, 0xaf,
    0xb4, 0xb5, 0xb6, 0xb7, 0xbc, 0xbd, 0xbe, 0xbf, 0xc4, 0xc5, 0xc6, 0xc7, 0xcc, 0xcd, 0xce, 0xcf,
    0xd4, 0xd5, 0xd6, 0xd7, 0xdc, 0xdd, 0xde, 0xe6, 0xe7, 0xf6, 0xf7,
];

/// A mutant: random e_flags (all sBPF versions), random instructions in the text, sometimes corrupted headers or a
/// truncated file. The random draws follow the evaluation order of the original generator (array literals before
/// the pick of an element, left operand first).
fn mutate(base: &[u8], r: &mut Rng) -> Vec<u8> {
    let mut b = base.to_vec();
    let x = r.next();
    let flags = [0, 1, 2, 3, 4, 0x20, 0, 2, 3, x][(r.next() % 10) as usize];
    b[48..52].copy_from_slice(&flags.to_le_bytes());
    let text = sbpf_elf::parse_elf(base).ok().map(|e| {
        let t = &e.sections[e.text];
        (t.offset, t.size)
    });
    if let Some((offset, size)) = text.filter(|t| t.1 >= 8.0) {
        let n = (size / 8.0).floor() as u32;
        let k = 1 + r.next() % n.min(400);
        for _ in 0..k {
            let o = offset + ((r.next() % n) as f64) * 8.0;
            if o + 8.0 > b.len() as f64 {
                continue;
            }
            let o = o as usize;
            b[o] = if r.next() % 4 != 0 {
                r.pick(&OPS)
            } else {
                r.next() as u8
            };
            b[o + 1] = if r.next() % 3 != 0 {
                let lo = r.next() % 11;
                let hi = r.next() % 11;
                (lo | (hi << 4)) as u8
            } else {
                r.next() as u8
            };
            let off: i32 = if r.next() % 3 != 0 {
                (r.next() % 64) as i32 - 32
            } else {
                (r.next() & 0xffff) as i32
            };
            b[o + 2..o + 4].copy_from_slice(&(off as u16).to_le_bytes());
            let (a, c, d) = (r.next() % 100, r.next(), r.next() % 2000);
            let imm: [i64; 10] = [
                0,
                1,
                -1,
                16,
                32,
                64,
                7,
                a as i64,
                c as i32 as i64,
                d as i64 - 1000,
            ];
            let imm = imm[(r.next() % 10) as usize];
            b[o + 4..o + 8].copy_from_slice(&(imm as i32).to_le_bytes());
        }
    }
    if r.next() % 5 == 0 {
        let k = 1 + r.next() % 8;
        for _ in 0..k {
            let a = r.next() as u64;
            let len = b.len() as u64;
            let m = len.min(64 + (r.next() % 2) as u64 * len);
            let o = (a % m) as usize;
            b[o] = r.next() as u8;
        }
    }
    // section / program header tables
    if r.next() % 4 == 0 && b.len() >= 64 {
        let at = if r.next() % 2 != 0 { 40 } else { 32 };
        let tab = u64::from_le_bytes(b[at..at + 8].try_into().unwrap()) as f64;
        let k = 1 + r.next() % 4;
        for _ in 0..k {
            let o = tab + (r.next() % 1024) as f64;
            if o < b.len() as f64 {
                let o = o as usize;
                b[o] = if r.next() % 2 != 0 {
                    r.next() as u8
                } else {
                    b[o] ^ (1 << (r.next() % 8))
                };
            }
        }
    }
    if r.next() % 10 == 0 {
        let l = (r.next() as usize) % b.len();
        b.truncate(l);
    }
    b
}

/// The binaries of the sets (directories under root, their *.so sorted by name) under 512 KB, and `n` mutants.
fn mutants(root: &Path, sets: &[String], seed: u32, n: usize) -> Vec<Vec<u8>> {
    let mut bases = vec![];
    for s in sets {
        let d = root.join(s);
        let mut names: Vec<String> = std::fs::read_dir(&d)
            .unwrap_or_else(|e| panic!("{}: {e}", d.display()))
            .filter_map(|e| e.ok()?.file_name().into_string().ok())
            .filter(|f| f.ends_with(".so"))
            .collect();
        names.sort();
        for f in names {
            let b = std::fs::read(d.join(&f)).unwrap();
            if b.len() < 512 * 1024 {
                bases.push(b);
            }
        }
    }
    let mut r = Rng(if seed == 0 { 1 } else { seed });
    (0..n)
        .map(|_| {
            let i = (r.next() as usize) % bases.len();
            mutate(&bases[i], &mut r)
        })
        .collect()
}

/// fuzz.json runs: (seed, n, sets)
fn fuzz_runs(fixtures: &Path) -> Vec<(u32, usize, Vec<String>)> {
    let t = std::fs::read_to_string(fixtures.join("fuzz.json")).expect("fuzz.json");
    let v: Value = serde_json::from_str(&t).expect("fuzz.json");
    v["runs"]
        .as_array()
        .expect("runs")
        .iter()
        .map(|r| {
            let sets = r["sets"]
                .as_array()
                .unwrap()
                .iter()
                .map(|s| s.as_str().unwrap().to_string())
                .collect();
            (
                r["seed"].as_u64().unwrap() as u32,
                r["n"].as_u64().unwrap() as usize,
                sets,
            )
        })
        .collect()
}

fn sha256_hex(b: &[u8]) -> String {
    sbpf_print::names::sha256(b)
        .iter()
        .map(|x| format!("{x:02x}"))
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
        "line {}\n      want: {}\n       got: {}",
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

/// error lines matched only modulo the error class name (see `compat_error`)
static NORMALIZED: AtomicUsize = AtomicUsize::new(0);

/// Golden compatibility: older goldens name some fatal errors by class (`TypeError: …`, `RangeError: …`) where the
/// binary prints `Error: …`, and word the size errors of corrupt inputs differently (`out of bounds`, as sbpf-elf
/// reports them). An error line matching after this mapping counts as identical (and is counted apart).
fn compat_error(e: &str) -> String {
    let e = e
        .strip_prefix("TypeError: ")
        .or_else(|| e.strip_prefix("RangeError: "))
        .map_or(e.to_string(), |m| format!("Error: {m}"));
    match e.as_str() {
        "Error: Offset is outside the bounds of the DataView" | "Error: Invalid array length" => {
            "Error: out of bounds".into()
        }
        _ => e,
    }
}

/// Compares one CLI run against the golden: `Ok` or the difference.
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
        } else if r.code == 1 && first == compat_error(e) {
            NORMALIZED.fetch_add(1, Ordering::SeqCst);
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

/// The binary sets a new golden directory covers (directories under the root; their *.so sorted by name).
const SETS: &[&str] = &["samples", "samples/regress", "compat/bin", "eval/bin", "bench/bin", "corpus"];

/// Lexical normalization of a relative path (`a/b/../c` -> `a/c`).
fn normalize(p: &Path) -> String {
    let mut out: Vec<String> = Vec::new();
    for c in p.components() {
        match c {
            std::path::Component::ParentDir if out.last().is_some_and(|l| l != "..") => {
                out.pop();
            }
            std::path::Component::CurDir => {}
            c => out.push(c.as_os_str().to_string_lossy().into_owned()),
        }
    }
    out.join("/")
}

/// The binary's Anchor IDL, relative to the root: `<name>.json` next to it, in `../idl/` or in `idl/`, where
/// `<name>` is the file name without `.so`, then without its `@variant` suffix.
fn idl_of(root: &Path, f: &str) -> Option<String> {
    let p = Path::new(f);
    let d = p.parent().unwrap_or(Path::new(""));
    let b = p.file_name()?.to_str()?;
    let b = b.strip_suffix(".so").unwrap_or(b);
    let mut names = vec![b];
    let short = b.split('@').next().unwrap_or(b);
    if short != b {
        names.push(short);
    }
    for n in names {
        for dd in [d.to_path_buf(), d.join("..").join("idl"), d.join("idl")] {
            let c = dd.join(format!("{n}.json"));
            if root.join(&c).is_file() {
                return Some(normalize(&c));
            }
        }
    }
    None
}

fn rec(out: String, text: String) -> Value {
    serde_json::json!({ "out": out, "text": text })
}

fn first_line(s: &str) -> String {
    s.lines().next().unwrap_or("").to_string()
}

/// JSON lines, compressed with zstd to `path`.
fn write_zstd(path: &Path, recs: &[Value]) {
    use std::io::Write;
    std::fs::create_dir_all(path.parent().unwrap()).unwrap();
    let mut text = String::new();
    for r in recs {
        text.push_str(&serde_json::to_string(r).unwrap());
        text.push('\n');
    }
    let mut c = Command::new("zstd")
        .args(["-17", "--long=27", "-q", "-f", "-o"])
        .arg(path)
        .stdin(Stdio::piped())
        .spawn()
        .expect("zstd");
    c.stdin.take().unwrap().write_all(text.as_bytes()).unwrap();
    assert!(c.wait().unwrap().success(), "zstd -o {}", path.display());
}

/// The golden records of one binary (what `check_binary` compares against), from the binary under test.
fn record_binary(cfg: &Cfg, f: &str, idl: Option<&str>, slot: usize) -> Vec<Value> {
    let mut recs = vec![serde_json::json!({ "file": f, "idl": idl })];
    let dir = cfg.tmp.join(format!("w{slot}"));
    let d = format!("{}/", dir.display());
    // (mode, arguments, single-file record, project records)
    let mut modes: Vec<(&str, Vec<&str>, &str, Option<&str>)> = vec![
        ("default", vec![f], "single.ts", Some("project")),
        ("full", vec![f, "--full"], "full.ts", None),
    ];
    if let Some(i) = idl {
        modes.push(("idl", vec![f, "--idl", i], "idl.ts", Some("idl-project")));
    }
    for (mode, args, single, project) in modes {
        let r = run(cfg, &args);
        if r.code != 0 {
            recs.push(rec(format!("error/{mode}"), first_line(&r.stderr)));
            continue;
        }
        if !r.stderr.is_empty() {
            recs.push(rec(format!("stderr/{mode}"), r.stderr.clone()));
        }
        recs.push(rec(single.to_string(), String::from_utf8_lossy(&r.stdout).into_owned()));
        if let Some(pd) = project {
            let _ = std::fs::remove_dir_all(&dir);
            let mut a = args.clone();
            a.extend(["-o", &d]);
            let r = run(cfg, &a);
            if r.code != 0 {
                recs.push(rec(format!("error/{pd}"), first_line(&r.stderr)));
            } else {
                for (p, t) in read_tree(&dir) {
                    recs.push(rec(format!("{pd}/{p}"), t));
                }
            }
            let _ = std::fs::remove_dir_all(&dir);
        }
    }
    recs
}

/// The diff goldens: per pair of `pairs.txt`, the terminal report and the complete one. Pairs not selected keep
/// their existing records.
fn record_diffs(cfg: &Cfg, wanted: &dyn Fn(&str) -> bool) -> Vec<Value> {
    let dfix = cfg.fixtures.join("diff.jsonl.zst");
    let old = if dfix.exists() { zstd_lines(&dfix) } else { vec![] };
    let pairs = std::fs::read_to_string(cfg.fixtures.join("pairs.txt")).unwrap_or_default();
    let report = cfg.tmp.join("report.txt");
    let rs = report.to_string_lossy().into_owned();
    let mut recs = vec![];
    for l in pairs.lines() {
        let mut it = l.split_whitespace();
        let (Some(a), Some(b)) = (it.next(), it.next()) else {
            continue;
        };
        for all in [false, true] {
            if !(wanted(a) || wanted(b)) {
                recs.extend(
                    old.iter()
                        .filter(|r| r["a"] == a && r["b"] == b && r["all"] == all)
                        .cloned(),
                );
                continue;
            }
            let _ = std::fs::remove_file(&report);
            let x = if all { run(cfg, &[a, b, "-o", &rs]) } else { run(cfg, &[a, b]) };
            let mut v = serde_json::json!({ "a": a, "b": b, "all": all });
            if x.code != 0 {
                v["error"] = first_line(&x.stderr).into();
            } else if all {
                v["text"] = std::fs::read_to_string(&report).unwrap_or_default().into();
            } else {
                v["text"] = String::from_utf8_lossy(&x.stdout).into_owned().into();
            }
            recs.push(v);
        }
    }
    let _ = std::fs::remove_file(&report);
    recs
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
    let (mut fuzz, mut write_mutants, mut write) = (false, None::<PathBuf>, false);
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
            "--fuzz" => fuzz = true,
            "--write" => write = true,
            "--write-mutants" => {
                write_mutants = Some(PathBuf::from(&args[i + 1]));
                i += 1;
            }
            s => filters.push(s.to_string()),
        }
        i += 1;
    }
    let bin = std::fs::canonicalize(&cfg.bin).expect("sbpf-decompile binary");
    cfg.bin = bin.to_string_lossy().into_owned();
    std::fs::create_dir_all(&cfg.tmp).unwrap();
    let t0 = std::time::Instant::now();
    let wanted = |p: &str| filters.is_empty() || filters.iter().any(|f| p.contains(f.as_str()));
    // the fuzz mutants: (relative path, bytes, expected sha-256)
    let mut fuzzed: BTreeMap<String, (Vec<u8>, Option<String>)> = BTreeMap::new();
    if fuzz || write_mutants.is_some() {
        for (seed, n, sets) in fuzz_runs(&cfg.fixtures) {
            let dir = format!("fuzz/seed{seed}");
            let sums: BTreeMap<String, String> =
                std::fs::read_to_string(cfg.fixtures.join(&dir).join("mutants.sha256"))
                    .unwrap_or_default()
                    .lines()
                    .filter_map(|l| {
                        l.split_once("  ")
                            .map(|(h, f)| (f.to_string(), h.to_string()))
                    })
                    .collect();
            let mut new_sums = String::new();
            for (i, m) in mutants(&cfg.root, &sets, seed, n).into_iter().enumerate() {
                let name = format!("fuzz{i}.so");
                if write {
                    new_sums.push_str(&format!("{}  {name}\n", sha256_hex(&m)));
                }
                if let Some(out) = &write_mutants {
                    let d = out.join(&dir);
                    std::fs::create_dir_all(&d).unwrap();
                    std::fs::write(d.join(&name), &m).unwrap();
                    continue;
                }
                let rel = format!("{dir}/{name}");
                if wanted(&rel) {
                    let sum = if write { None } else { sums.get(&name).cloned() };
                    fuzzed.insert(rel, (m, sum));
                }
            }
            if write && write_mutants.is_none() {
                let d = cfg.fixtures.join(&dir);
                std::fs::create_dir_all(&d).unwrap();
                std::fs::write(d.join("mutants.sha256"), new_sums).unwrap();
            }
        }
        if write_mutants.is_some() {
            return;
        }
        diffs = false;
        cfg.root = cfg.tmp.join("fuzzroot");
    }
    let files: Vec<String> = if fuzz {
        fuzzed.keys().cloned().collect()
    } else {
        let listed = cfg.fixtures.join("files.txt");
        if write && !listed.exists() {
            let mut list = String::new();
            for s in SETS {
                let Ok(rd) = std::fs::read_dir(cfg.root.join(s)) else {
                    continue;
                };
                let mut names: Vec<String> = rd
                    .filter_map(|e| e.ok()?.file_name().into_string().ok())
                    .filter(|f| f.ends_with(".so"))
                    .collect();
                names.sort();
                for n in names {
                    list.push_str(&format!("{s}/{n}\n"));
                }
            }
            std::fs::create_dir_all(&cfg.fixtures).unwrap();
            std::fs::write(&listed, list).unwrap();
        }
        let list = std::fs::read_to_string(&listed).expect("files.txt");
        list.lines()
            .filter(|l| bins && !l.is_empty() && wanted(l))
            .map(|s| s.to_string())
            .collect()
    };
    let counts: Mutex<BTreeMap<&'static str, (usize, usize)>> = Mutex::new(BTreeMap::new());
    let missing = AtomicUsize::new(0);
    let next = AtomicUsize::new(0);
    std::thread::scope(|s| {
        for slot in 0..jobs {
            let (cfg, files, counts, next, missing, fuzzed) =
                (&cfg, &files, &counts, &next, &missing, &fuzzed);
            s.spawn(move || loop {
                let k = next.fetch_add(1, Ordering::SeqCst);
                let Some(f) = files.get(k) else { break };
                let fix = cfg.fixtures.join(format!("{f}.jsonl.zst"));
                if write {
                    let written = fuzzed.get(f).map(|(bytes, _)| {
                        let p = cfg.root.join(f);
                        std::fs::create_dir_all(p.parent().unwrap()).unwrap();
                        std::fs::write(&p, bytes).unwrap();
                        p
                    });
                    let idl = if fuzz { None } else { idl_of(&cfg.root, f) };
                    write_zstd(&fix, &record_binary(cfg, f, idl.as_deref(), slot));
                    if let Some(p) = written {
                        let _ = std::fs::remove_file(p);
                    }
                    let mut c = counts.lock().unwrap();
                    let e = c.entry("written").or_default();
                    (e.0, e.1) = (e.0 + 1, e.1 + 1);
                    continue;
                }
                if !fix.exists() {
                    missing.fetch_add(1, Ordering::SeqCst);
                    println!("MISSING fixture {f}");
                    continue;
                }
                let written = fuzzed.get(f).map(|(bytes, sum)| {
                    let p = cfg.root.join(f);
                    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
                    std::fs::write(&p, bytes).unwrap();
                    (p, sum.as_ref().is_some_and(|s| *s != sha256_hex(bytes)))
                });
                if let Some((_, true)) = &written {
                    missing.fetch_add(1, Ordering::SeqCst);
                    println!("MUTANT {f}: not the frozen mutant (the base sets changed?)");
                    let _ = std::fs::remove_file(&written.unwrap().0);
                    continue;
                }
                let res = check_binary(cfg, &fix, slot);
                if let Some((p, _)) = written {
                    let _ = std::fs::remove_file(p);
                }
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
    if write {
        let n = c.get("written").map_or(0, |e| e.0);
        let mut pairs = 0;
        if diffs && cfg.fixtures.join("pairs.txt").exists() {
            let recs = record_diffs(&cfg, &wanted);
            pairs = recs.len() / 2;
            write_zstd(&dfix, &recs);
        }
        let _ = std::fs::remove_dir_all(&cfg.tmp);
        println!(
            "sbpf-fixtures: wrote the goldens of {n} binaries and {pairs} diff pairs to {} ({} s)",
            cfg.fixtures.display(),
            t0.elapsed().as_secs()
        );
        return;
    }
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
    let norm = NORMALIZED.load(Ordering::SeqCst);
    if norm > 0 {
        println!(
            "  ({norm} of them: the error line modulo the error class name, see compat_error)"
        );
    }
    std::process::exit(if bad > 0 { 1 } else { 0 });
}
