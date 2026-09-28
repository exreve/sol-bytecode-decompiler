//! Build symbolized reference programs with Solana platform-tools, for library function naming (sbpf-build-libnames).
//! Toolchains live in ~/.cache/sbf-tools/<version> (llvm/, rust/); those newer than v1.41 need glibc >= 2.34 and
//! run inside the `sbf-builder` container (ubuntu:24.04), v1.41 runs through a linked rustup toolchain.
//! usage: sbpf-refbuild [filter]   (run from the repository root; writes refbuild/out/<variant>.so)

use std::path::Path;
use std::process::{Command, Stdio};

struct Variant {
    name: String,
    template: &'static str,
    tools: &'static str,
    rust: &'static str,
    vars: Vec<(&'static str, &'static str)>,
    pins: &'static [(&'static str, &'static str)],
}

/// (tools, rust version, needs the container)
const TOOLS: &[(&str, &str, bool)] = &[
    ("v1.41", "1.75", false),
    ("v1.43", "1.79", true),
    ("v1.48", "1.84", true),
];
const PINS141: &[(&str, &str)] = &[("blake3", "1.5.5"), ("cc", "1.0.94")];
// keep crates that need edition 2024 / newer cargo out of the graph
const PINS: &[(&str, &str)] = &[
    ("blake3", "1.5.5"),
    ("cc", "1.1.31"),
    ("jobserver", "0.1.32"),
];

fn tool(t: &str) -> (&'static str, bool) {
    TOOLS
        .iter()
        .find(|x| x.0 == t)
        .map(|x| (x.1, x.2))
        .expect("tools version")
}

fn matrix() -> Vec<Variant> {
    let mut m = vec![];
    let nat =
        |m: &mut Vec<Variant>, tools: &'static str, sol: &'static str, spl: &'static str, pins| {
            m.push(Variant {
                name: format!("native-sol{sol}-t{}", &tools[1..]),
                template: "native",
                tools,
                rust: tool(tools).0,
                vars: vec![("SOLANA", sol), ("SPL_TOKEN", spl)],
                pins,
            })
        };
    let anc = |m: &mut Vec<Variant>,
               tools: &'static str,
               anchor: &'static str,
               bump: &'static str,
               pins| {
        m.push(Variant {
            name: format!("anchor{anchor}-t{}", &tools[1..]),
            template: "anchor",
            tools,
            rust: tool(tools).0,
            vars: vec![("ANCHOR", anchor), ("BUMP", bump)],
            pins,
        })
    };
    let rich = |m: &mut Vec<Variant>, tools: &'static str, anchor: &'static str, pins| {
        m.push(Variant {
            name: format!("anchorrich{anchor}-t{}", &tools[1..]),
            template: "anchor_rich",
            tools,
            rust: tool(tools).0,
            vars: vec![("ANCHOR", anchor)],
            pins,
        })
    };
    for sol in ["1.16.27", "1.17.34", "1.18.26"] {
        nat(&mut m, "v1.41", sol, "4.0.0", PINS141);
    }
    anc(
        &mut m,
        "v1.41",
        "0.28.0",
        "*ctx.bumps.get(\"vault\").unwrap()",
        PINS141,
    );
    anc(&mut m, "v1.41", "0.29.0", "ctx.bumps.vault", PINS141);
    anc(&mut m, "v1.41", "0.30.1", "ctx.bumps.vault", PINS141);
    nat(&mut m, "v1.43", "1.18.26", "4.0.0", PINS);
    nat(&mut m, "v1.43", "2.1.21", "7.0.0", PINS);
    anc(&mut m, "v1.43", "0.30.1", "ctx.bumps.vault", PINS);
    anc(&mut m, "v1.43", "0.31.1", "ctx.bumps.vault", PINS);
    nat(&mut m, "v1.48", "2.2.1", "8.0.0", PINS);
    anc(&mut m, "v1.48", "0.31.1", "ctx.bumps.vault", PINS);
    rich(&mut m, "v1.41", "0.30.1", PINS141);
    rich(&mut m, "v1.43", "0.30.1", PINS);
    rich(&mut m, "v1.43", "0.31.1", PINS);
    rich(&mut m, "v1.48", "0.31.1", PINS);
    m
}

fn copy_dir(from: &Path, to: &Path) -> std::io::Result<()> {
    std::fs::create_dir_all(to)?;
    for e in std::fs::read_dir(from)? {
        let e = e?;
        let p = e.path();
        if p.is_dir() {
            copy_dir(&p, &to.join(e.file_name()))?;
        } else {
            std::fs::copy(&p, to.join(e.file_name()))?;
        }
    }
    Ok(())
}

/// a shell command in `wd`: its stdout, or its stderr as the error
fn sh(wd: &Path, cmd: &str, env: &[(&str, String)]) -> Result<String, String> {
    let mut c = Command::new("sh");
    c.arg("-c").arg(cmd).current_dir(wd).stdin(Stdio::null());
    for (k, v) in env {
        c.env(k, v);
    }
    let o = c.output().map_err(|e| e.to_string())?;
    if o.status.success() {
        Ok(String::from_utf8_lossy(&o.stdout).into_owned())
    } else {
        Err(String::from_utf8_lossy(&o.stderr).into_owned() + &format!("\nCommand failed: {cmd}"))
    }
}

fn build(v: &Variant, root: &Path, out: &Path, home: &Path) -> Result<(), String> {
    let wd = home.join(".cache/sbf-rb").join(&v.name);
    std::fs::remove_dir_all(&wd).ok();
    copy_dir(&root.join("refbuild/templates").join(v.template), &wd).map_err(|e| e.to_string())?;
    for f in ["Cargo.toml", "src/lib.rs"] {
        let p = wd.join(f);
        let mut s = std::fs::read_to_string(&p).map_err(|e| e.to_string())?;
        for (k, val) in v.vars.iter().chain([&("RUST", v.rust)]) {
            s = s.replace(&format!("{{{{{k}}}}}"), val);
        }
        std::fs::write(&p, s).map_err(|e| e.to_string())?;
    }
    sh(
        &wd,
        "cargo generate-lockfile",
        &[(
            "CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS",
            "fallback".into(),
        )],
    )?;
    for (pkg, ver) in v.pins {
        // (not in the graph: fine)
        sh(&wd, &format!("cargo update -p {pkg} --precise {ver}"), &[]).ok();
    }
    let lock = wd.join("Cargo.lock");
    let l = std::fs::read_to_string(&lock).map_err(|e| e.to_string())?;
    let l: Vec<&str> = l.split('\n').collect();
    // the first `version = 4` line (the lockfile format) back to 3 for the older cargo
    let mut done = false;
    let l: Vec<&str> = l
        .into_iter()
        .map(|x| {
            if !done && x == "version = 4" {
                done = true;
                "version = 3"
            } else {
                x
            }
        })
        .collect();
    std::fs::write(&lock, l.join("\n")).map_err(|e| e.to_string())?;
    let t = home.join(".cache/sbf-tools").join(v.tools);
    if tool(v.tools).1 {
        let id = |f: &str| sh(&wd, &format!("id -{f}"), &[]).map(|s| s.trim().to_string());
        let (uid, gid) = (id("u")?, id("g")?);
        let cargo_home = home.join(format!(".cache/sbf-cargo-{}", v.tools));
        std::fs::create_dir_all(&cargo_home).map_err(|e| e.to_string())?;
        sh(
            &wd,
            &format!(
                "docker run --rm -u {uid}:{gid} -v {}:/tools:ro -v {}:/cargo -v {}:/w -w /w -e CARGO_HOME=/cargo -e HOME=/tmp -e PATH=/tools/llvm/bin:/tools/rust/bin:/usr/bin:/bin -e CC=clang -e AR=llvm-ar -e RUSTC=/tools/rust/bin/rustc sbf-builder sh -c \"cargo fetch && cargo build --offline --release --target sbf-solana-solana\"",
                t.display(),
                cargo_home.display(),
                wd.display()
            ),
            &[],
        )?;
    } else {
        Command::new("rustup")
            .args(["toolchain", "link", &format!("sbf-{}", v.tools)])
            .arg(t.join("rust"))
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map_err(|e| e.to_string())?;
        let path = format!(
            "{}:{}",
            t.join("llvm/bin").display(),
            std::env::var("PATH").unwrap_or_default()
        );
        sh(
            &wd,
            &format!(
                "cargo +sbf-{} build --release --target sbf-solana-solana",
                v.tools
            ),
            &[
                ("PATH", path),
                ("CC", "clang".into()),
                ("AR", "llvm-ar".into()),
            ],
        )?;
    }
    let rel = wd.join("target/sbf-solana-solana/release");
    let so = std::fs::read_dir(&rel)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .find(|f| f.ends_with(".so"))
        .ok_or("no .so built")?;
    std::fs::copy(rel.join(so), out).map_err(|e| e.to_string())?;
    std::fs::remove_dir_all(wd.join("target")).ok();
    Ok(())
}

fn main() {
    let filter = std::env::args().nth(1);
    let root = std::env::current_dir().expect("cwd");
    let home = std::path::PathBuf::from(std::env::var("HOME").expect("HOME"));
    std::fs::create_dir_all(root.join("refbuild/out")).expect("refbuild/out");
    for v in matrix() {
        if filter
            .as_ref()
            .is_some_and(|f| !v.name.contains(f.as_str()))
        {
            continue;
        }
        let out = root.join("refbuild/out").join(format!("{}.so", v.name));
        if out.exists() {
            println!("skip (exists) {}", v.name);
            continue;
        }
        match build(&v, &root, &out, &home) {
            Ok(()) => println!("built {}", v.name),
            Err(e) => {
                let msg: Vec<&str> = e
                    .split('\n')
                    .filter(|l| l.starts_with("error"))
                    .take(5)
                    .collect();
                let msg = if msg.is_empty() {
                    e.chars().take(400).collect()
                } else {
                    msg.join("\n")
                };
                println!("FAILED {} \n {msg}", v.name);
            }
        }
    }
}
