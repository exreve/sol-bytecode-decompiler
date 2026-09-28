//! Compatibility set: decompile (project mode) + equivalence (readable and --raw) over compat/bin/*.so.
//! One line per program, then a summary; exit code 1 on any crash or failing function, except for the
//! KNOWN issues below (reported, not counted; --strict counts them too). A <name>.json next to a binary is passed as
//! --idl. Runs the `sbpf-decompile` and `sbpf-equiv` binaries built next to this one.
//! usage: sbpf-compat [filter] [--trials N] [--keep dir/] [--strict]

use regex::Regex;
use sbpf_bench::{fixed0, fixed1, pad_end, pad_start, repo_root};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Instant;

// known issues (compat/README.md): binary -> reason
const KNOWN: &[(&str, &str)] = &[];

struct Run {
    ms: u128,
    ok: bool,
    text: String,
}

fn run(exe: &Path, args: &[&str], root: &Path) -> Run {
    let t0 = Instant::now();
    match Command::new(exe).args(args).current_dir(root).output() {
        Ok(o) => Run {
            ms: t0.elapsed().as_millis(),
            ok: o.status.success(),
            text: String::from_utf8_lossy(&o.stdout).into_owned()
                + &String::from_utf8_lossy(&o.stderr),
        },
        Err(e) => Run {
            ms: t0.elapsed().as_millis(),
            ok: false,
            text: e.to_string(),
        },
    }
}

fn last_line(s: &str) -> &str {
    s.trim().rsplit('\n').next().unwrap_or("")
}

fn main() {
    let argv: Vec<String> = std::env::args().skip(1).collect();
    let opt = |n: &str| {
        argv.iter()
            .position(|a| a == n)
            .and_then(|i| argv.get(i + 1))
            .cloned()
    };
    let filter = argv
        .iter()
        .enumerate()
        .find(|(i, a)| {
            !a.starts_with("--")
                && !(*i > 0 && ["--trials", "--keep"].contains(&argv[i - 1].as_str()))
        })
        .map(|(_, a)| a.clone());
    let trials = opt("--trials").unwrap_or_else(|| "2".into());
    let keep = opt("--keep");
    let strict = argv.iter().any(|a| a == "--strict");
    let root = repo_root();
    let bindir = std::env::current_exe()
        .expect("exe")
        .parent()
        .unwrap()
        .to_path_buf();
    let (decompile, equiv) = (bindir.join("sbpf-decompile"), bindir.join("sbpf-equiv"));
    let out: PathBuf = match &keep {
        Some(k) => PathBuf::from(k),
        None => std::env::temp_dir().join(format!("compat-{}", std::process::id())),
    };
    let mut bins: Vec<String> = std::fs::read_dir(root.join("compat/bin"))
        .expect("compat/bin")
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .filter(|f| f.ends_with(".so") && filter.as_ref().is_none_or(|x| f.contains(x.as_str())))
        .collect();
    bins.sort();
    let counts =
        Regex::new(r"([0-9]+) functions, [^\n]* ([0-9]+) failing functions, ([0-9]+) errors")
            .unwrap();
    let header =
        Regex::new(r"program: sBPF (v[0-9]+), ([0-9]+) instructions, ([0-9]+) functions").unwrap();
    let eq = |so: &str, idl: &[&str], raw: bool| -> (bool, String) {
        let mut a = vec![so, trials.as_str()];
        a.extend(idl);
        if raw {
            a.push("--raw");
        }
        let r = run(&equiv, &a, &root);
        match counts.captures(&r.text) {
            Some(m) => (r.ok, format!("{}F/{}E of {}", &m[2], &m[3], &m[1])),
            None => (
                false,
                format!(
                    "CRASH {}",
                    last_line(&r.text).chars().take(80).collect::<String>()
                ),
            ),
        }
    };
    let (mut bad, mut known) = (0, 0);
    let t0 = Instant::now();
    println!(
        "{} ver  insns   fns  ixs  decompile  equiv(readable)       equiv(raw)",
        pad_end("program", 34)
    );
    for f in &bins {
        let so = format!("compat/bin/{f}");
        let json = format!("{}.json", &so[..so.len() - 3]);
        let idl: Vec<&str> = if root.join(&json).exists() {
            vec!["--idl", &json]
        } else {
            vec![]
        };
        let dir = format!("{}/", out.join(&f[..f.len() - 3]).display());
        let mut args = vec![so.as_str()];
        args.extend(&idl);
        args.extend(["-o", dir.as_str()]);
        let d = run(&decompile, &args, &root);
        let index = Path::new(&dir).join("index.ts");
        let ok;
        let mut line;
        if !d.ok || !index.exists() {
            ok = false;
            let t = d.text.trim();
            let lines: Vec<&str> = t.split('\n').collect();
            line = format!(
                "decompile CRASH: {}",
                lines[lines.len().saturating_sub(3)..]
                    .join(" | ")
                    .chars()
                    .take(200)
                    .collect::<String>()
            );
        } else {
            let text = std::fs::read_to_string(&index).unwrap_or_default();
            let (ver, insns, fns) = match header.captures(&text) {
                Some(m) => (m[1].to_string(), m[2].to_string(), m[3].to_string()),
                None => ("?".into(), "?".into(), "?".into()),
            };
            let sec = Path::new(&dir).join("security");
            let ixs = std::fs::read_dir(&sec).map_or(0, |r| {
                r.filter_map(|e| e.ok()?.file_name().into_string().ok())
                    .filter(|x| x.ends_with(".md") && x != "summary.md")
                    .count()
            });
            let a = eq(&so, &idl, false);
            let b = eq(&so, &idl, true);
            ok = a.0 && b.0;
            line = [
                pad_end(&ver, 4),
                pad_start(&insns, 5),
                pad_start(&fns, 5),
                pad_start(&ixs.to_string(), 4),
                " ".into(),
                pad_end(&format!("{}s", fixed1(d.ms as f64 / 1000.0)), 9),
                format!("{}{}", if a.0 { "ok " } else { "BAD " }, pad_end(&a.1, 18)),
                format!("{}{}", if b.0 { "ok " } else { "BAD " }, b.1),
            ]
            .join(" ");
        }
        let k = KNOWN.iter().find(|(b, _)| b == f).map(|(_, r)| *r);
        match k {
            Some(k) if !ok && !strict => {
                known += 1;
                line += &format!("  (known: {k})");
            }
            _ if !ok => bad += 1,
            Some(_) => line += "  (listed as known issue but passes: update KNOWN)",
            None => {}
        }
        println!("{} {line}", pad_end(f, 34));
    }
    if keep.is_none() {
        std::fs::remove_dir_all(&out).ok();
    }
    println!(
        "{} programs, {bad} with a crash or failing functions, {known} known issues, {}s",
        bins.len(),
        fixed0(t0.elapsed().as_secs_f64())
    );
    if bad > 0 {
        std::process::exit(1);
    }
}
