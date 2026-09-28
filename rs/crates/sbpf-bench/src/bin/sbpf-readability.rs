//! Readability metrics of decompiled output: raw memory accesses vs named field accesses.
//!   sbpf-readability prog.so|out.ts … [--idl x.json] [--json]
//! A .so is decompiled as the CLI does (single-file output); a .ts is measured as is.
//! Counted in function bodies, outside comments and string literals:
//!   code      code lines (not blank, not comment-only)
//!   ld / st   raw ldN( / stN( calls; `frame` those whose address is a stack object (sNN / a named one)
//!   copy      copy( / copyr( / memcpy( calls
//!   fields    named field accesses (x.f, x[k].f, x.f.g count once)
//!   density   (ld + st) per code line

use regex::Regex;
use sbpf_bench::*;
use serde_json::json;
use std::collections::HashSet;

#[derive(Default)]
struct M {
    file: String,
    lines: usize,
    bytes: usize,
    code: usize,
    ld: usize,
    st: usize,
    frame_ld: usize,
    frame_st: usize,
    copy: usize,
    fields: usize,
    helpers: usize,
}

struct Res {
    func: Regex,
    helper: Regex,
    frame_decl: Regex,
    frame_name: Regex,
    access: Regex,
    stack_obj: Regex,
    copy: Regex,
    field: Regex,
}

fn res() -> Res {
    let w = "[A-Za-z0-9_]";
    let s = r"[\t\n\x0B\x0C\r \u{a0}\u{1680}\u{2000}-\u{200a}\u{2028}\u{2029}\u{202f}\u{205f}\u{3000}\u{feff}]";
    let r = |x: String| Regex::new(&x).unwrap();
    Res {
        func: r("^(export )?function ".into()),
        helper: r(r"^function (ret_tail|tail)_[0-9]+\(".into()),
        frame_decl: r(" = fp - 0x".into()),
        frame_name: r(format!(r"^({w}+)(?::{s}*{w}+)? = fp - 0x")),
        access: r(format!(
            r"(?-u:\b)(ld|st)(8|16|32|64)\({s}*([A-Za-z_]{w}*)?"
        )),
        stack_obj: r("^s[0-9a-f]+$".into()),
        copy: r(r"(?-u:\b)(copyr?|memcpy)\(".into()),
        field: r(format!(
            r"(?-u:\b)[A-Za-z_]{w}*(\[[0-9]+\])?(\.[A-Za-z_]{w}*(\[[0-9]+\])?)+"
        )),
    }
}

/// a line without its comments and string literals
fn strip(s: &str) -> String {
    let c: Vec<char> = s.chars().collect();
    let mut out = String::new();
    let mut i = 0;
    while i < c.len() {
        if c[i] == '"' {
            i += 1;
            while i < c.len() && c[i] != '"' {
                i += if c[i] == '\\' { 2 } else { 1 };
            }
            out.push_str("\"\"");
            i += 1;
            continue;
        }
        if c[i] == '/' && c.get(i + 1) == Some(&'/') {
            break;
        }
        if c[i] == '/' && c.get(i + 1) == Some(&'*') {
            let rest: String = c[i + 2..].iter().collect();
            match rest.find("*/") {
                None => break,
                Some(j) => {
                    i += 2 + rest[..j].chars().count() + 2;
                    continue;
                }
            }
        }
        out.push(c[i]);
        i += 1;
    }
    out
}

fn measure(re: &Res, file: &str, text: &str) -> M {
    let mut m = M {
        file: file.into(),
        bytes: text.len(),
        ..Default::default()
    };
    let lines: Vec<&str> = text.split('\n').collect();
    m.lines = lines.len();
    // frame object names: `const s30 = fp - 0x30, key = fp - 0x58` declarations
    let mut frame_names: HashSet<String> = HashSet::new();
    let mut in_fn = false;
    for raw in lines {
        if re.func.is_match(raw) {
            in_fn = true;
            frame_names.clear();
            if re.helper.is_match(raw) {
                m.helpers += 1;
            }
            continue;
        }
        if raw == "}" {
            in_fn = false;
            continue;
        }
        if !in_fn {
            continue;
        }
        let code = strip(raw);
        let code = code.trim();
        if code.is_empty() {
            continue;
        }
        m.code += 1;
        if let Some(decls) = code.strip_prefix("const ") {
            if re.frame_decl.is_match(code) {
                for d in decls.split(", ") {
                    if let Some(n) = re.frame_name.captures(d) {
                        frame_names.insert(n[1].to_string());
                    }
                }
            }
        }
        for x in re.access.captures_iter(code) {
            let frame = x.get(3).is_some_and(|n| {
                frame_names.contains(n.as_str()) || re.stack_obj.is_match(n.as_str())
            });
            if &x[1] == "ld" {
                m.ld += 1;
                m.frame_ld += usize::from(frame);
            } else {
                m.st += 1;
                m.frame_st += usize::from(frame);
            }
        }
        m.copy += re.copy.find_iter(code).count();
        m.fields += re.field.find_iter(code).count();
    }
    m
}

fn main() {
    let t = std::thread::Builder::new()
        .stack_size(1 << 30)
        .spawn(run)
        .expect("spawn");
    std::process::exit(t.join().unwrap_or(1));
}

fn run() -> i32 {
    let argv: Vec<String> = std::env::args().skip(1).collect();
    let idl_at = argv.iter().position(|a| a == "--idl");
    let idl = idl_at
        .and_then(|i| argv.get(i + 1))
        .map(|p| read_json(std::path::Path::new(p)).unwrap_or_else(|e| panic!("{e}")));
    let info = idl.as_ref().map(sbpf_read::idl::parse_idl);
    let files: Vec<&String> = argv
        .iter()
        .enumerate()
        .filter(|(i, a)| !a.starts_with("--") && idl_at.is_none_or(|j| *i != j + 1))
        .map(|(_, a)| a)
        .collect();
    let re = res();
    let mut rows = vec![];
    for f in files {
        let text = if f.ends_with(".so") {
            let bytes = std::fs::read(f).unwrap_or_else(|e| panic!("{f}: {e}"));
            let r = sbpf_read::decompile::decompile_read_opts(
                &bytes,
                info.as_ref(),
                parallelism(),
                false,
                None,
                None,
            )
            .unwrap_or_else(|e| panic!("{f}: {e}"));
            sbpf_read::decompile::render_read(&r)
        } else {
            std::fs::read_to_string(f).unwrap_or_else(|e| panic!("{f}: {e}"))
        };
        rows.push(measure(&re, f.rsplit('/').next().unwrap_or(f), &text));
    }
    if argv.iter().any(|a| a == "--json") {
        let v: Vec<_> = rows
            .iter()
            .map(|m| {
                json!({ "file": m.file, "lines": m.lines, "bytes": m.bytes, "code": m.code, "ld": m.ld, "st": m.st,
                    "frameLd": m.frame_ld, "frameSt": m.frame_st, "copy": m.copy, "fields": m.fields, "helpers": m.helpers })
            })
            .collect();
        let mut s = String::new();
        pretty_indent(&json!(v), "", " ", &mut s);
        println!("{s}");
        return 0;
    }
    let cols: [(&str, fn(&M) -> String); 12] = [
        ("file", |m| m.file.clone()),
        ("lines", |m| m.lines.to_string()),
        ("KiB", |m| fixed0(m.bytes as f64 / 1024.0)),
        ("code", |m| m.code.to_string()),
        ("ld", |m| m.ld.to_string()),
        ("st", |m| m.st.to_string()),
        ("ld+st", |m| (m.ld + m.st).to_string()),
        ("frame ld/st", |m| format!("{}/{}", m.frame_ld, m.frame_st)),
        ("copy", |m| m.copy.to_string()),
        ("fields", |m| m.fields.to_string()),
        ("density", |m| {
            to_fixed((m.ld + m.st) as f64 / m.code.max(1) as f64, 3)
        }),
        ("helpers", |m| m.helpers.to_string()),
    ];
    let mut tab: Vec<Vec<String>> = vec![cols.iter().map(|c| c.0.to_string()).collect()];
    for r in &rows {
        tab.push(cols.iter().map(|c| c.1(r)).collect());
    }
    let w: Vec<usize> = (0..cols.len())
        .map(|i| tab.iter().map(|r| r[i].chars().count()).max().unwrap_or(0))
        .collect();
    for r in &tab {
        let cells: Vec<String> = r
            .iter()
            .enumerate()
            .map(|(i, x)| {
                if i > 0 {
                    pad_start(x, w[i])
                } else {
                    pad_end(x, w[i])
                }
            })
            .collect();
        println!("{}", cells.join("  "));
    }
    0
}
