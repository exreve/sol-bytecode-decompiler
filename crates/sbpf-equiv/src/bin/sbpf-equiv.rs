//! `sbpf-equiv prog.so [trials=20] [--raw] [--idl file.json] [--only fn_x,..] [--seed N] [--max N]`:
//! differential equivalence of the decompiled output (default: the readable output the CLI prints;
//! `--raw`: the plain form) against the bytecode, on random inputs. Exit code 1 on a failure or an error.

use sbpf_equiv::{check_decompiled, decompile, Opts};
use std::collections::HashSet;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    // deeply nested outputs are parsed and evaluated recursively
    let t = std::thread::Builder::new()
        .stack_size(1 << 30)
        .spawn(move || run(&args))
        .expect("spawn");
    std::process::exit(t.join().unwrap_or(2));
}

fn run(argv: &[String]) -> i32 {
    let opt = |n: &str| {
        argv.iter()
            .position(|a| a == n)
            .and_then(|i| argv.get(i + 1))
            .cloned()
    };
    let valued = ["--idl", "--only", "--seed", "--max"];
    let pos: Vec<&String> = argv
        .iter()
        .enumerate()
        .filter(|(i, a)| {
            !a.starts_with("--") && !(*i > 0 && valued.contains(&argv[i - 1].as_str()))
        })
        .map(|(_, a)| a)
        .collect();
    let Some(file) = pos.first() else {
        eprintln!("usage: sbpf-equiv <program.so> [trials=20] [--raw] [--idl file.json] [--only fn_x,..] [--seed N] [--max N]");
        return 2;
    };
    let t0 = std::time::Instant::now();
    let bytes = match std::fs::read(file) {
        Ok(b) => b,
        Err(e) => {
            eprintln!("{file}: {e}");
            return 2;
        }
    };
    let idl = match opt("--idl") {
        Some(f) => match std::fs::read_to_string(&f)
            .map_err(|e| e.to_string())
            .and_then(|s| serde_json::from_str(&s).map_err(|e| e.to_string()))
        {
            Ok(v) => Some(v),
            Err(e) => {
                eprintln!("{f}: {e}");
                return 2;
            }
        },
        None => None,
    };
    let mut o = Opts {
        trials: pos.get(1).map_or(20, |s| s.parse().unwrap_or(20)),
        max_funcs: opt("--max").map_or(usize::MAX, |s| s.parse().unwrap_or(usize::MAX)),
        verbose: true,
        dump_seed: opt("--seed").and_then(|s| s.parse().ok()),
        sugar: !argv.iter().any(|a| a == "--raw"),
        idl,
        ..Default::default()
    };
    let d = match decompile(&bytes, o.sugar, o.idl.as_ref(), o.threads) {
        Ok(d) => d,
        Err(e) => {
            eprintln!("Error: {e}");
            return 2;
        }
    };
    if let Some(list) = opt("--only") {
        let txt = d.p.elf.text().addr;
        let mut s = HashSet::new();
        for x in list.split(',') {
            let v = match x.strip_prefix("fn_") {
                Some(h) => i64::from_str_radix(h, 16)
                    .ok()
                    .map(|a| (a as f64 - txt) / 8.0),
                None => x.parse::<f64>().ok(),
            };
            if let Some(v) = v.filter(|v| v.fract() == 0.0) {
                s.insert(v as i64);
            }
        }
        o.only = Some(s);
    }
    let r = check_decompiled(&d, &o);
    println!(
        "{file}: {} functions, {} trials ({} skipped: memory-unsafe), {} failing functions, {} errors, {}ms",
        r.funcs,
        r.trials,
        r.skipped,
        r.failures.len(),
        r.errors.len(),
        t0.elapsed().as_millis()
    );
    for (f, why) in r.errors.iter().take(10) {
        println!("ERROR {f} {why}");
    }
    i32::from(!r.failures.is_empty() || !r.errors.is_empty())
}
