//! `src/cli.ts`: the `sbpf-decompile` command line (argument handling, program loading from a file, stdin or
//! an RPC endpoint, the on-chain Anchor IDL, the single file / project output, the two-program diff).
//! Messages and exit codes are the TS CLI's; an uncaught TS exception (printed with its stack by Node) is
//! printed as its first line (`Error: <message>`), exit code 1.

pub mod rpc;

use sbpf_read::idl::{parse_idl, IdlInfo};
use std::io::{Read, Write};
use std::path::Path;

pub const USAGE: &str = r#"usage: sbpf-decompile <program> [-o out.ts | -o outdir/] [--rpc <url>] [--idl <file.json>] [--full]
       sbpf-decompile <program A> <program B> [-o report.txt] [--rpc <url>]

  <program>         a local .so file ("-" reads it from stdin), or a program address fetched with --rpc
                    (its on-chain Anchor IDL is used when published)
  -o out.ts         write a single file (default: stdout)
  -o outdir/        write a project: index.ts, bundle/<ix>.ts, ix/, shared.ts, entrypoint.ts, lib.d.ts, security/
  --idl file.json   Anchor IDL (instruction args/accounts, account layouts, error names)
  --full            also decompile recognized library code (default: one-line typed stubs)
  two programs      compare them (upgrade diff / fork matching); long lists are shortened on the terminal,
                    complete with -o"#;

const VALUED: [&str; 3] = ["-o", "--idl", "--rpc"];
const KNOWN: [&str; 6] = ["-o", "--idl", "--rpc", "--full", "-h", "--help"];

/// The end of a run: an exit code (the messages are already printed).
pub struct Exit(pub i32);

fn fail(msg: impl std::fmt::Display) -> Exit {
    eprintln!("error: {msg}");
    Exit(1)
}

/// An uncaught exception of the TS CLI (Node prints it with its stack; here its first line).
fn thrown(msg: impl std::fmt::Display) -> Exit {
    eprintln!("{msg}");
    Exit(1)
}

/// Node's fs error text of an io error (`ENOENT: no such file or directory, open '<path>'`).
fn fs_error(e: &std::io::Error, syscall: &str, path: Option<&str>) -> String {
    let (code, text) = match e.raw_os_error() {
        Some(2) => ("ENOENT", "no such file or directory"),
        Some(13) => ("EACCES", "permission denied"),
        Some(21) => ("EISDIR", "illegal operation on a directory"),
        Some(20) => ("ENOTDIR", "not a directory"),
        Some(28) => ("ENOSPC", "no space left on device"),
        _ => ("EIO", "i/o error"),
    };
    match path {
        Some(p) => format!("Error: {code}: {text}, {syscall} '{p}'"),
        None => format!("Error: {code}: {text}, {syscall}"),
    }
}

/// readFileSync (Err: the exception's first line).
fn read_file(path: &str) -> Result<Vec<u8>, String> {
    std::fs::read(path).map_err(|e| {
        // a directory opens, then fails on read (as Node reports it)
        let dir = e.raw_os_error() == Some(21);
        fs_error(
            &e,
            if dir { "read" } else { "open" },
            if dir { None } else { Some(path) },
        )
    })
}

fn write_file(path: &Path, data: &[u8]) -> Result<(), Exit> {
    std::fs::write(path, data)
        .map_err(|e| thrown(fs_error(&e, "open", Some(&path.to_string_lossy()))))
}

/// Writes to stdout; a closed pipe (e.g. `| head`) ends the process with exit code 0.
fn stdout_write(text: &str) {
    let mut o = std::io::stdout().lock();
    if o.write_all(text.as_bytes())
        .and_then(|_| o.flush())
        .is_err()
    {
        std::process::exit(0);
    }
}

struct Loaded {
    bytes: Vec<u8>,
    idl: Option<IdlInfo>,
    loader: Option<String>,
}

/// The synchronous part of the TS `load` (up to the fetch): the bytes of a local input (or the exception reading
/// it threw), or the address to fetch. `Err`: the CLI exits (`fail`).
enum Start<'a> {
    Local(Result<Vec<u8>, String>),
    Remote(&'a str, &'a str),
}

fn start<'a>(input: &'a str, rpc: Option<&'a str>) -> Result<Start<'a>, Exit> {
    if input == "-" {
        let mut b = Vec::new();
        return Ok(Start::Local(
            std::io::stdin()
                .read_to_end(&mut b)
                .map(|_| b)
                .map_err(|e| fs_error(&e, "read", None)),
        ));
    }
    if Path::new(input).exists() {
        return Ok(Start::Local(read_file(input)));
    }
    if rpc::is_address(input) {
        let Some(rpc_url) = rpc else {
            return Err(fail(format!(
                "{input} looks like a program address: pass --rpc <url> to fetch it"
            )));
        };
        return Ok(Start::Remote(input, rpc_url));
    }
    Err(fail(format!(
        "{input}: no such file, and not a program address"
    )))
}

/// JSON.parse's SyntaxError (V8's text for the end of input; otherwise serde's description).
fn json_parse(text: &[u8]) -> Result<serde_json::Value, Exit> {
    serde_json::from_str(&String::from_utf8_lossy(text)).map_err(|e| {
        thrown(if e.is_eof() {
            "SyntaxError: Unexpected end of JSON input".to_string()
        } else {
            format!("SyntaxError: {e}")
        })
    })
}

/// The rest of `load`: program bytes, and the IDL (explicit file, or the on-chain one of a fetched program).
fn finish(s: Start, idl_file: Option<&str>) -> Result<Loaded, Exit> {
    let (bytes, remote, loader) = match s {
        Start::Local(b) => (b.map_err(thrown)?, None, None),
        Start::Remote(input, rpc_url) => {
            let (b, l) = rpc::fetch_program_account(rpc_url, input).map_err(fail)?;
            eprintln!("fetched {input}: {} bytes", b.len());
            (b, Some((input, rpc_url)), Some(l))
        }
    };
    let mut idl_json = None;
    if let Some(f) = idl_file {
        idl_json = Some(json_parse(&read_file(f).map_err(thrown)?)?);
    } else if let Some((pid, rpc_url)) = remote {
        idl_json = rpc::fetch_idl(pid, rpc_url);
        if idl_json.is_some() {
            eprintln!("using on-chain Anchor IDL of {pid}");
        }
    }
    Ok(Loaded {
        bytes,
        idl: idl_json.as_ref().map(parse_idl),
        loader,
    })
}

/// invalidInstructions: pcs of the reachable instructions the declared sBPF version does not have.
fn invalid_instructions(p: &sbpf_program::Program) -> Vec<i64> {
    let mut out = std::collections::BTreeSet::new();
    for f in p.funcs.values() {
        for b in &f.blocks {
            if let sbpf_ir::Term::Trap { msg } = &b.term {
                if msg.starts_with("invalid instruction") {
                    let at = msg.find("at pc ").map(|i| &msg[i + 6..]).and_then(|s| {
                        let d: String = s.chars().take_while(|c| c.is_ascii_digit()).collect();
                        d.parse().ok()
                    });
                    out.insert(at.unwrap_or(b.end));
                }
            }
        }
    }
    out.into_iter().collect()
}

/// The CLI (arguments without the program name); returns the exit code.
pub fn run(args: &[String], threads: usize) -> i32 {
    match run_inner(args, threads) {
        Ok(()) => 0,
        Err(Exit(c)) => c,
    }
}

fn run_inner(args: &[String], threads: usize) -> Result<(), Exit> {
    let prev_valued = |i: usize| i > 0 && VALUED.contains(&args[i - 1].as_str());
    let opt = |n: &str| -> Option<&str> {
        let i = args.iter().position(|a| a == n)?;
        args.get(i + 1).map(|s| s.as_str())
    };
    let flag = |n: &str| args.iter().any(|a| a == n);
    let unknown: Vec<&str> = (0..args.len())
        .filter(|&i| {
            let a = args[i].as_str();
            a.starts_with('-') && a != "-" && !KNOWN.contains(&a) && !prev_valued(i)
        })
        .map(|i| args[i].as_str())
        .collect();
    if !unknown.is_empty() {
        eprintln!(
            "error: unknown option{} {}\n\n{USAGE}",
            if unknown.len() > 1 { "s" } else { "" },
            unknown.join(", ")
        );
        return Err(Exit(1));
    }
    let inputs: Vec<&str> = (0..args.len())
        .filter(|&i| (!args[i].starts_with('-') || args[i] == "-") && !prev_valued(i))
        .map(|i| args[i].as_str())
        .collect();
    if inputs.is_empty() || inputs.len() > 2 || flag("-h") || flag("--help") {
        eprintln!("{USAGE}");
        return Err(Exit(if !inputs.is_empty() && inputs.len() <= 2 {
            0
        } else {
            1
        }));
    }
    // (JS truthiness: an empty value is no value)
    let rpc = opt("--rpc").filter(|s| !s.is_empty());
    let out = opt("-o").filter(|s| !s.is_empty());

    if inputs.len() == 2 {
        // Promise.all(inputs.map(load)): the synchronous parts of both loads (a `fail` exits at once), then the
        // first exception thrown there, then the fetches
        let sa = start(inputs[0], rpc)?;
        let sb = start(inputs[1], rpc)?;
        for x in [&sa, &sb] {
            if let Start::Local(Err(e)) = x {
                return Err(thrown(e));
            }
        }
        let a = finish(sa, None)?;
        let b = finish(sb, None)?;
        let text = sbpf_read::diff::diff_report(
            &a.bytes,
            &b.bytes,
            [a.idl.as_ref(), b.idl.as_ref()],
            out.is_some(),
            [inputs[0], inputs[1]],
        )
        .map_err(|e| thrown(format!("Error: {e}")))?;
        match out {
            Some(o) => write_file(Path::new(o), text.as_bytes())?,
            None => stdout_write(&text),
        }
        return Ok(());
    }

    let l = finish(
        start(inputs[0], rpc)?,
        opt("--idl").filter(|s| !s.is_empty()),
    )?;
    let r = sbpf_read::decompile::decompile_read_opts(
        &l.bytes,
        l.idl.as_ref(),
        threads,
        flag("--full"),
        l.loader.as_deref(),
        None,
    )
    .map_err(|e| thrown(format!("Error: {e}")))?;
    if let Some(p) = r.program.as_ref() {
        // opcodes the declared sBPF version (e_flags) does not have: probably built for another version
        let bad = invalid_instructions(p);
        if !bad.is_empty() {
            let s = bad.len() > 1;
            eprintln!(
                "warning: {} reachable instruction{} invalid for the declared sBPF v{} (first at pc {}, opcode 0x{:x}): built for another sBPF version? The output follows the declared version.",
                bad.len(),
                if s { "s are" } else { " is" },
                p.version,
                bad[0],
                p.insns.get(bad[0] as usize).map_or(0, |i| i.opc)
            );
        }
    }
    match out {
        Some(o) if o.ends_with('/') || Path::new(o).is_dir() => {
            for (path, text) in sbpf_read::layout::render_project(&r) {
                let f = Path::new(o).join(&path);
                if let Some(d) = f.parent() {
                    std::fs::create_dir_all(d)
                        .map_err(|e| thrown(fs_error(&e, "mkdir", Some(&d.to_string_lossy()))))?;
                }
                write_file(&f, text.as_bytes())?;
            }
            eprintln!("wrote project to {o}");
        }
        Some(o) => write_file(
            Path::new(o),
            sbpf_read::decompile::render_read(&r).as_bytes(),
        )?,
        None => stdout_write(&sbpf_read::decompile::render_read(&r)),
    }
    // (the process ends after the run: the result's many small allocations are left to the OS)
    std::mem::forget(r);
    Ok(())
}
