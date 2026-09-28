//! The multi-file project (`src/layout.ts` renderProject): index.ts, entrypoint.ts, ix/<name>.ts, shared.ts,
//! processor modules, outlined.ts, lib.d.ts, the self-contained bundle/<ix>.ts, security/.

use crate::analysis::js_ws;
use crate::analysis::render::{
    budget_markdown, ix_order, render_ix, render_json, render_summary, summary_order,
    BUDGET_BUNDLE_LINES, BUDGET_IX_LINES, BUDGET_SUMMARY_LINES,
};
use crate::analysis::report::{AnalysisOut, Loc};
use crate::decompile::ReadOut;
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_print::consts::{OUTLINED, PRELUDE, PROVENANCE, TYPES};
use sbpf_print::raw::{called, scan_views};
use sbpf_ir::fx::{HashMap, HashSet};

fn line_count(t: &str) -> usize {
    memchr::memchr_iter(b'\n', t.as_bytes()).count() + 1
}

/// `text.replace(/^function /m, 'export function ')`
fn export_fn(t: &str) -> String {
    if t.starts_with("function ") {
        return format!("export {t}");
    }
    match t.find("\nfunction ") {
        Some(i) => format!("{}\nexport {}", &t[..i], &t[i + 1..]),
        None => t.to_string(),
    }
}

fn names_in(t: &str) -> IndexSet<String> {
    let mut s = IndexSet::default();
    called(t, &mut s);
    s
}

fn stub_name(s: &str) -> &str {
    let i = s.find("declare function ").map_or(0, |i| i + 17);
    let r = &s[i..];
    let n = r
        .bytes()
        .take_while(|c| c.is_ascii_alphanumeric() || *c == b'_')
        .count();
    &r[..n]
}

/// The program header lines of index.ts and the single file (layout.ts summary).
pub fn summary_lines(r: &ReadOut) -> Vec<String> {
    let mut out = vec![
        PROVENANCE.to_string(),
        format!(
            "// program: sBPF v{}, {} instructions, {} functions ({} decompiled, {} library)",
            r.version,
            r.n_insns,
            r.n_funcs,
            r.funcs.len(),
            r.lib_count
        ),
    ];
    if !r.instructions.is_empty() {
        out.push(if r.anchor {
            "// instructions (Anchor, discriminator = sha256(\"global:<name>\")[..8] of instruction data, as u64):".into()
        } else {
            "// instruction handlers (named from their \"Instruction: X\" logs, or [heur] from the discriminator compared before the call):".into()
        });
        let mut ixs: Vec<_> = r.instructions.iter().collect();
        ixs.sort_by(|a, b| crate::analysis::locale_cmp(&a.name, &b.name));
        for i in ixs {
            let n = &i.name;
            let pn = crate::util::pad_end(n, 28.0);
            out.push(if r.anchor {
                format!("//   {pn} 0x{:016x}  -> ix_{n}", i.disc)
            } else {
                format!("//   {pn} -> ix_{n}")
            });
            if let Some(a) = i.args.as_ref().filter(|a| !a.is_empty()) {
                out.push(format!("//     args [idl]: {}", a.join(", ")));
            }
            if let Some(a) = i.accounts.as_ref().filter(|a| !a.is_empty()) {
                out.push(format!("//     accounts [idl]: {}", a.join(", ")));
            } else if let Some(a) = i.str_accounts.as_ref().filter(|a| !a.is_empty()) {
                out.push(format!(
                    "//     accounts [str, order of first use]: {}",
                    a.join(", ")
                ));
            }
        }
    }
    for (f, names) in &r.processors {
        out.push(format!(
            "// instructions handled inline by {f} (search its \"Instruction: X\" log calls): {}",
            names.join(", ")
        ));
    }
    out
}

struct Scan {
    called: IndexSet<String>,
    views: IndexSet<String>,
}

/// usedViews: the view declarations of the typed views these functions use
fn used_views(r: &ReadOut, scans: &[Scan], fis: &[usize]) -> Vec<String> {
    let mut names: IndexSet<String> = IndexSet::default();
    for &i in fis {
        for n in &scans[i].views {
            if r.views.has(n) {
                names.insert(n.clone());
            }
        }
    }
    if names.is_empty() {
        return vec![];
    }
    let mut out = vec!["// typed views: x.field is exactly the load / store / address given by the field declaration".to_string()];
    out.extend(crate::views::VIEW_NOTATION.iter().map(|s| s.to_string()));
    out.extend(r.views.render(&names.into_iter().collect::<Vec<_>>()));
    out
}

fn is_sys(n: &str) -> bool {
    n == "abort"
        || n.strip_prefix("sol_").is_some_and(|r| {
            !r.is_empty()
                && r.bytes()
                    .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'_')
        })
}

fn used_syscalls(names: &dyn Fn(&str) -> bool) -> Vec<String> {
    let mut out = Vec::new();
    for sc in &sbpf_program::syscalls::tables().all {
        if names(&sc.alias) {
            let ps: Vec<String> = sc.params.iter().map(|p| format!("{p}: u64")).collect();
            out.push(format!(
                "declare function {}({}){} // {}",
                sc.alias,
                ps.join(", "),
                if sc.noreturn {
                    ": never"
                } else if sc.ret {
                    ": u64"
                } else {
                    ": void"
                },
                sc.doc
            ));
        }
    }
    out
}

struct Group {
    key: String,
    title: String,
    funcs: Vec<usize>,
}

/// A function's text cut down to some of its paths (layout.ts Sliced)
struct Sliced {
    text: String,
    lines: usize,
    map: Vec<usize>,
}

/// Net brace depth change of a line and its lowest running depth (braces in strings and comments ignored).
fn braces(l: &str) -> (i64, i64) {
    let c: Vec<char> = l.chars().collect();
    let (mut d, mut min) = (0i64, 0i64);
    let mut i = 0;
    while i < c.len() {
        let x = c[i];
        if x == '"' || x == '\'' || x == '`' {
            i += 1;
            while i < c.len() && c[i] != x {
                if c[i] == '\\' {
                    i += 1;
                }
                i += 1;
            }
            i += 1;
            continue;
        }
        if x == '/' && c.get(i + 1) == Some(&'/') {
            break;
        }
        if x == '/' && c.get(i + 1) == Some(&'*') {
            let mut e = None;
            let mut j = i + 2;
            while j + 1 < c.len() {
                if c[j] == '*' && c[j + 1] == '/' {
                    e = Some(j);
                    break;
                }
                j += 1;
            }
            match e {
                None => break,
                Some(e) => {
                    i = e + 2;
                    continue;
                }
            }
        }
        if x == '{' {
            d += 1;
        } else if x == '}' {
            d -= 1;
            if d < min {
                min = d;
            }
        }
        i += 1;
    }
    (d, min)
}

fn slice(text: &str, st: &[u8], full: &str) -> Sliced {
    let lines: Vec<&str> = text.split('\n').collect();
    let n = lines.len();
    let mut out: Vec<String> = Vec::new();
    let mut map = vec![0usize; n];
    let br: Vec<(i64, i64)> = lines.iter().map(|l| braces(l)).collect();
    let mut i = 0;
    while i < n {
        let mut best: i64 = -1;
        if st[i] != 1 {
            let mut depth = 0i64;
            let mut other = false;
            let mut j = i;
            while j < n && st[j] != 1 {
                if depth + br[j].1 < 0 {
                    break;
                }
                depth += br[j].0;
                if st[j] == 2 {
                    other = true;
                }
                if depth == 0 && other {
                    best = j as i64;
                }
                j += 1;
            }
        }
        if best >= i as i64 {
            let best = best as usize;
            let cnt = best - i + 1;
            let ws: String = lines[i].chars().take_while(|&c| js_ws(c)).collect();
            out.push(format!(
                "{ws}// … {cnt} lines of other instructions (full function: {full})"
            ));
            for m in map.iter_mut().take(best + 1).skip(i) {
                *m = out.len();
            }
            i = best + 1;
        } else {
            out.push(lines[i].to_string());
            map[i] = out.len();
            i += 1;
        }
    }
    Sliced {
        text: out.join("\n"),
        lines: out.len(),
        map,
    }
}

/// renderProject: path -> content, in the TS map's order
pub fn render_project(r: &ReadOut) -> IndexMap<String, String> {
    let fs = &r.funcs;
    let nf = fs.len();
    let by_pc: HashMap<i64, usize> = fs.iter().enumerate().map(|(i, f)| (f.pc, i)).collect();
    let by_name: HashMap<&str, usize> = {
        let mut m = HashMap::default();
        for (i, f) in fs.iter().enumerate() {
            m.insert(f.name.as_str(), i);
        }
        m
    };
    let outl_by_name: HashMap<&str, usize> = {
        let mut m = HashMap::default();
        for (i, o) in r.outlined.iter().enumerate() {
            m.insert(o.0.as_str(), i);
        }
        m
    };
    // (each function's text on its own)
    let texts = crate::util::Shared(fs.as_slice());
    let scans: Vec<Scan> = crate::util::par_map_exact(nf, r.threads, |i| {
        let t = &texts.get()[i].text;
        let mut c = IndexSet::default();
        called(t, &mut c);
        let mut v = IndexSet::default();
        scan_views(t, &mut v);
        Scan {
            called: c,
            views: v,
        }
    });
    let proc_names: HashSet<&str> = r.processors.iter().map(|x| x.0.as_str()).collect();
    let is_root =
        |i: usize| fs[i].name.starts_with("ix_") || proc_names.contains(fs[i].name.as_str());
    // handlerOwners
    let handlers: Vec<usize> = (0..nf).filter(|&i| is_root(i)).collect();
    let mut owners: HashMap<usize, IndexSet<usize>> = HashMap::default();
    for &h in &handlers {
        let mut seen: HashSet<usize> = HashSet::from_iter([h]);
        let mut q = vec![h];
        while let Some(x) = q.pop() {
            owners.entry(x).or_default().insert(h);
            for t in &fs[x].calls {
                if let Some(&ti) = by_pc.get(t) {
                    if !seen.contains(&ti) && !is_root(ti) {
                        seen.insert(ti);
                        q.push(ti);
                    }
                }
            }
        }
    }
    // groups
    let mut placed = vec![false; nf];
    let mut ixg: Vec<Group> = Vec::new();
    for &h in &handlers {
        let n = &fs[h].name;
        let (key, title) = match n.strip_prefix("ix_") {
            Some(x) => (format!("ix/{x}"), format!("instruction {x}")),
            None => (
                format!("processor_{n}"),
                format!("instruction processor {n} (handles several instructions inline)"),
            ),
        };
        let mut order = vec![h];
        let mut seen = vec![false; nf];
        seen[h] = true;
        let mut st: Vec<(usize, usize)> = vec![(h, 0)];
        while let Some(top) = st.last_mut() {
            let (x, k) = *top;
            if k >= fs[x].calls.len() {
                st.pop();
                continue;
            }
            top.1 += 1;
            let Some(&ti) = by_pc.get(&fs[x].calls[k]) else {
                continue;
            };
            if seen[ti] || is_root(ti) {
                continue;
            }
            if owners
                .get(&ti)
                .is_some_and(|o| o.len() == 1 && o.contains(&h))
            {
                seen[ti] = true;
                order.push(ti);
                st.push((ti, 0));
            }
        }
        for &x in &order {
            placed[x] = true;
        }
        ixg.push(Group {
            key,
            title,
            funcs: order,
        });
    }
    let mut entry = Group {
        key: "entrypoint".into(),
        title: "entrypoint, dispatcher and code outside instruction handlers".into(),
        funcs: vec![],
    };
    let mut shared = Group {
        key: "shared".into(),
        title: "helpers used by several instructions".into(),
        funcs: vec![],
    };
    for i in 0..nf {
        if placed[i] {
            continue;
        }
        if owners.get(&i).is_some_and(|o| o.len() > 1) {
            shared.funcs.push(i);
        } else {
            entry.funcs.push(i);
        }
    }
    entry.funcs.sort_by_key(|&i| (!fs[i].is_entry, fs[i].pc));

    let mut files: IndexMap<String, String> = IndexMap::default();
    let mut home: HashMap<String, String> = HashMap::default();
    for g in std::iter::once(&entry)
        .chain(std::iter::once(&shared))
        .chain(ixg.iter())
    {
        for &f in &g.funcs {
            home.insert(fs[f].name.clone(), g.key.clone());
        }
    }
    for (n, _) in &r.outlined {
        home.insert(n.clone(), "outlined".into());
    }
    let mut mod_loc: HashMap<String, (String, i64)> = HashMap::default();
    let mut module = |g: &Group, files: &mut IndexMap<String, String>| {
        if g.funcs.is_empty() {
            return;
        }
        let mut imports: IndexMap<String, IndexSet<String>> = IndexMap::default();
        for &f in &g.funcs {
            for n in &scans[f].called {
                if let Some(h) = home.get(n) {
                    if *h != g.key {
                        imports.entry(h.clone()).or_default().insert(n.clone());
                    }
                }
            }
        }
        let depth = g.key.split('/').count() - 1;
        let rel = |to: &str| {
            format!(
                "{}{to}.ts",
                if depth > 0 {
                    "../".repeat(depth)
                } else {
                    "./".to_string()
                }
            )
        };
        let mut head = vec![
            format!(
                "/// <reference path=\"{}lib.d.ts\" />",
                if g.key.contains('/') { "../" } else { "./" }
            ),
            format!("// {}", g.title),
        ];
        for (h, names) in &imports {
            let mut ns: Vec<&String> = names.iter().collect();
            ns.sort_by(|a, b| crate::analysis::report::js_str_cmp(a, b));
            head.push(format!(
                "import {{ {} }} from '{}'",
                ns.iter().map(|s| s.as_str()).collect::<Vec<_>>().join(", "),
                rel(h)
            ));
        }
        let body = g
            .funcs
            .iter()
            .map(|&f| export_fn(&fs[f].text))
            .collect::<Vec<_>>()
            .join("\n\n");
        let file = format!("{}.ts", g.key);
        files.insert(file.clone(), head.join("\n") + "\n\n" + &body + "\n");
        let mut at = head.len() as i64 + 2;
        for &f in &g.funcs {
            mod_loc.insert(fs[f].name.clone(), (file.clone(), at));
            at += line_count(&fs[f].text) as i64 + 1;
        }
    };
    module(&entry, &mut files);
    module(&shared, &mut files);
    for g in &ixg {
        module(g, &mut files);
    }
    if !r.outlined.is_empty() {
        files.insert(
            "outlined.ts".into(),
            [
                "/// <reference path=\"./lib.d.ts\" />".to_string(),
                OUTLINED.to_string(),
                String::new(),
                r.outlined
                    .iter()
                    .map(|h| export_fn(&h.1))
                    .collect::<Vec<_>>()
                    .join("\n\n"),
                String::new(),
            ]
            .join("\n"),
        );
    }
    let all: Vec<usize> = (0..nf).collect();
    let mut all_called: IndexSet<String> = IndexSet::default();
    for s in &scans {
        for n in &s.called {
            if is_sys(n) {
                all_called.insert(n.clone());
            }
        }
    }
    let mut lib: Vec<String> = vec![PRELUDE.to_string(), TYPES.to_string(), String::new()];
    lib.extend(used_views(r, &scans, &all));
    lib.push(String::new());
    lib.push("// syscalls".into());
    lib.extend(used_syscalls(&|n| all_called.contains(n)));
    lib.push(String::new());
    lib.push("// library functions (recognized in many programs; not decompiled)".into());
    lib.extend(r.stubs.iter().cloned());
    files.insert("lib.d.ts".into(), lib.join("\n") + "\n");
    let mut idx = summary_lines(r);
    idx.push(String::new());
    for i in &r.instructions {
        idx.push(format!(
            "export {{ ix_{} }} from './ix/{}.ts'",
            i.name, i.name
        ));
    }
    idx.push("export { entrypoint } from './entrypoint.ts'".into());
    files.insert("index.ts".into(), idx.join("\n") + "\n");

    // self-contained per-instruction bundles
    let an: Option<&AnalysisOut> = r.analysis.as_ref();
    let facts_calls = |f: usize| -> Vec<(i64, bool)> {
        r.facts
            .get(&fs[f].pc)
            .or(fs[f].facts.as_ref())
            .map_or_else(Vec::new, |ff| {
                ff.calls.iter().map(|c| (c.callee, c.err_path)).collect()
            })
    };
    // (the outlined helpers' called names, scanned once for every bundle)
    let outl_names: Vec<IndexSet<String>> = r.outlined.iter().map(|o| names_in(&o.1)).collect();
    let mut bundle_loc: HashMap<String, HashMap<String, (i64, Option<Vec<usize>>)>> =
        HashMap::default();
    let bundle = |ix: &str,
                  h: usize,
                  what: &str,
                  view: &dyn Fn(usize) -> Option<Sliced>|
     -> (String, HashMap<String, (i64, Option<Vec<usize>>)>) {
        enum Code {
            F(usize),
            O(usize),
        }
        let mut order: Vec<usize> = vec![h];
        let mut outl: Vec<usize> = Vec::new();
        let mut seen: HashSet<String> = HashSet::from_iter([fs[h].name.clone()]);
        let mut sliced: HashMap<usize, Sliced> = HashMap::default();
        let mut other: Vec<usize> = Vec::new();
        let mut left: Vec<usize> = Vec::new();
        let mut size = match view(h) {
            Some(v) => {
                let n = v.lines;
                sliced.insert(h, v);
                n
            }
            None => line_count(&fs[h].text),
        };
        let callees = |g: &Code, sliced: &HashMap<usize, Sliced>| -> Vec<(String, bool)> {
            match g {
                Code::F(f) => {
                    let names: IndexSet<String> = match sliced.get(f) {
                        Some(s) => names_in(&s.text),
                        None => scans[*f].called.clone(),
                    };
                    let mut err: HashMap<i64, bool> = HashMap::default();
                    for (c, e) in facts_calls(*f) {
                        let v = *err.get(&c).unwrap_or(&true) && e;
                        err.insert(c, v);
                    }
                    names
                        .into_iter()
                        .map(|n| {
                            let e = by_name
                                .get(n.as_str())
                                .is_some_and(|&t| err.get(&fs[t].pc) == Some(&true));
                            (n, e)
                        })
                        .collect()
                }
                Code::O(o) => outl_names[*o]
                    .iter()
                    .cloned()
                    .map(|n| {
                        let e = by_name.contains_key(n.as_str()) && false;
                        (n, e)
                    })
                    .collect(),
            }
        };
        let mut level: Vec<usize> = vec![h];
        while !level.is_empty() {
            let mut next: IndexMap<String, bool> = IndexMap::default();
            let add = |x: &Code,
                       next: &mut IndexMap<String, bool>,
                       seen: &HashSet<String>,
                       sliced: &HashMap<usize, Sliced>| {
                for (n, e) in callees(x, sliced) {
                    if !seen.contains(&n)
                        && (by_name.contains_key(n.as_str())
                            || outl_by_name.contains_key(n.as_str()))
                    {
                        let v = *next.get(&n).unwrap_or(&true) && e;
                        next.insert(n, v);
                    }
                }
            };
            for &x in &level {
                add(&Code::F(x), &mut next, &seen, &sliced);
            }
            let mut changed = true;
            while changed {
                changed = false;
                let keys: Vec<String> = next.keys().cloned().collect();
                for n in keys {
                    if let Some(&o) = outl_by_name.get(n.as_str()) {
                        if !seen.contains(&n) {
                            seen.insert(n.clone());
                            next.shift_remove(&n);
                            outl.push(o);
                            add(&Code::O(o), &mut next, &seen, &sliced);
                            changed = true;
                        }
                    }
                }
            }
            level = Vec::new();
            let mut nx: Vec<(String, bool)> = next.into_iter().collect();
            nx.sort_by_key(|x| x.1);
            for (n, _) in nx {
                let g = by_name[n.as_str()];
                seen.insert(n);
                if is_root(g) {
                    other.push(g);
                    continue;
                }
                let (lines, v) = match view(g) {
                    Some(v) => (v.lines, Some(v)),
                    None => (line_count(&fs[g].text), None),
                };
                if size + lines > BUDGET_BUNDLE_LINES {
                    sliced.remove(&g);
                    left.push(g);
                    continue;
                }
                if let Some(v) = v {
                    sliced.insert(g, v);
                }
                size += lines;
                order.push(g);
                level.push(g);
            }
        }
        let sig = |f: usize| {
            let l = fs[f]
                .text
                .split('\n')
                .find(|l| l.starts_with("function "))
                .unwrap_or("");
            let l = format!("declare {l}");
            l.strip_suffix(" {").map_or(l.clone(), |x| x.to_string())
        };
        let body = |f: usize| match mod_loc.get(&fs[f].name) {
            Some((file, line)) => format!("{file}:{line}"),
            None => format!(
                "{}.ts",
                home.get(&fs[f].name).map_or("entrypoint", |s| s.as_str())
            ),
        };
        let mut text = order
            .iter()
            .map(|f| {
                sliced
                    .get(f)
                    .map_or(fs[*f].text.as_str(), |s| s.text.as_str())
            })
            .collect::<Vec<_>>()
            .join("\n\n");
        if !left.is_empty() {
            text.push_str(&format!("\n\n// user functions this instruction reaches, not inlined (bundle size budget: {BUDGET_BUNDLE_LINES} lines); their bodies are in the modules named:\n"));
            text.push_str(
                &left
                    .iter()
                    .map(|&f| {
                        format!(
                            "{} // body: {} (not inlined: bundle size budget)",
                            sig(f),
                            body(f)
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n"),
            );
        }
        if !other.is_empty() {
            text.push_str("\n\n// other instructions' handlers called on these paths (see their own bundle / module):\n");
            text.push_str(
                &other
                    .iter()
                    .map(|&f| {
                        format!(
                            "{} // {}",
                            sig(f),
                            match fs[f].name.strip_prefix("ix_") {
                                Some(x) => format!("bundle/{x}.ts"),
                                None => body(f),
                            }
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n"),
            );
        }
        let mut used = names_in(&text);
        for &o in &outl {
            used.extend(names_in(&r.outlined[o].1));
        }
        let stubs: Vec<&String> = r
            .stubs
            .iter()
            .filter(|x| used.contains(stub_name(x)))
            .collect();
        let sys = used_syscalls(&|n| used.contains(n));
        let outl_sorted: Vec<&(String, String)> =
            r.outlined.iter().filter(|x| seen.contains(&x.0)).collect();
        let mut pre: Vec<String> = vec![
            PRELUDE.to_string(),
            format!(
                "// instruction {ix}: {what} + {} reachable functions{}",
                order.len() - 1,
                if left.is_empty() {
                    String::new()
                } else {
                    format!(
                        " ({} more declared at the end: bundle size budget)",
                        left.len()
                    )
                }
            ),
        ];
        pre.extend(used_views(r, &scans, &order));
        pre.extend(sys);
        pre.extend(stubs.iter().map(|s| s.to_string()));
        if !outl_sorted.is_empty() {
            pre.push(String::new());
            pre.push(OUTLINED.to_string());
            pre.extend(outl_sorted.iter().map(|x| x.1.clone()));
        }
        pre.push(String::new());
        let pre = pre.join("\n");
        let mut m: HashMap<String, (i64, Option<Vec<usize>>)> = HashMap::default();
        let mut at = pre.split('\n').count() as i64 + 1;
        for &f in &order {
            let v = sliced.get(&f);
            m.insert(fs[f].name.clone(), (at, v.map(|v| v.map.clone())));
            at += v.map_or(line_count(&fs[f].text), |v| v.lines) as i64 + 1;
        }
        (format!("{pre}\n{text}\n"), m)
    };
    // the bundles: which ones in order (a name bundled once), then each on its own (in parallel), added in order
    enum Job {
        Handler(usize),
        /// (index in the analysis' instructions, handler)
        Inline(usize, usize),
    }
    let mut jobs: Vec<(String, Job)> = Vec::new();
    let mut bundled: HashSet<String> = HashSet::default();
    for (i, f) in fs.iter().enumerate() {
        if let Some(x) = f.name.strip_prefix("ix_") {
            bundled.insert(x.to_string());
            jobs.push((x.to_string(), Job::Handler(i)));
        }
    }
    let mut inline: Vec<String> = Vec::new();
    if let Some(an) = an {
        for (xi, ix) in an.a.ixs.iter().enumerate() {
            if an.parts[xi].is_none() {
                continue;
            }
            let Some(&h) = by_name.get(ix.handler.as_str()) else {
                continue;
            };
            if ix.handler.starts_with("ix_") || bundled.contains(&ix.name) {
                continue;
            }
            bundled.insert(ix.name.clone());
            jobs.push((ix.name.clone(), Job::Inline(xi, h)));
        }
    }
    let made = {
        // (the bundles only read the functions' texts, the scans and the analysis' instruction parts)
        let sh = crate::util::Shared(&bundle);
        let jobs_sh = crate::util::Shared(jobs.as_slice());
        let an_sh = crate::util::Shared(&an);
        let fs_sh = crate::util::Shared(fs.as_slice());
        let home_sh = crate::util::Shared(&home);
        crate::util::par_map_exact(jobs.len(), r.threads, |k| {
            let bundle = sh.get();
            let fs = fs_sh.get();
            let (ix, job) = &jobs_sh.get()[k];
            crate::util::SendBox(match *job {
                Job::Handler(i) => bundle(ix, i, "handler", &|_| None),
                Job::Inline(xi, h) => {
                    let an = an_sh.get().as_ref().unwrap();
                    let part = an.parts[xi].as_ref().unwrap();
                    let x = &an.a.ixs[xi];
                    let view = |f: usize| -> Option<Sliced> {
                        let pc = fs[f].pc;
                        if f != h && !part.restricted.contains(&pc) {
                            return None;
                        }
                        let st = part.marks.get(&pc)?.as_ref()?;
                        let full = format!(
                            "{}.ts",
                            home_sh.get().get(&fs[f].name).map_or("entrypoint", |s| s.as_str())
                        );
                        Some(slice(&fs[f].text, st, &full))
                    };
                    bundle(
                        ix,
                        h,
                        &format!(
                            "{} restricted to this instruction's paths ({})",
                            x.handler,
                            x.dispatch.as_deref().unwrap_or("instruction tag")
                        ),
                        &view,
                    )
                }
            })
        })
    };
    for ((ix, job), m) in jobs.iter().zip(made) {
        let (text, loc) = m.0;
        files.insert(format!("bundle/{ix}.ts"), text);
        bundle_loc.insert(ix.to_string(), loc);
        let Job::Inline(xi, _) = *job else { continue };
        let ix = &an.unwrap().a.ixs[xi];
        {
            let d = ix.dispatch.as_deref().map_or(String::new(), |d| {
                match d.find(" (instruction data)") {
                    Some(i) => d[..i].to_string(),
                    None => d.to_string(),
                }
            });
            inline.push(format!(
                "//   {} {d} of {} -> bundle/{}.ts",
                crate::util::pad_end(&ix.name, 28.0),
                ix.handler,
                ix.name
            ));
        }
    }
    if !inline.is_empty() {
        inline.sort_by(|a, b| crate::analysis::report::js_str_cmp(a, b));
        let mut t = files["index.ts"].clone();
        t.push_str(&format!("// instructions handled inline by a processor (a match on the instruction tag; bundle/<name>.ts: the processor restricted to that instruction's paths + what they call):\n{}\n", inline.join("\n")));
        files.insert("index.ts".into(), t);
    }
    // security/
    if let Some(an) = an {
        let wh = |ix: Option<&str>, at: &Loc| -> Option<(String, i64)> {
            if let Some(ix) = ix {
                if let Some((base, map)) = bundle_loc.get(ix).and_then(|m| m.get(&at.fn_)) {
                    let l = at.line;
                    let line = match map {
                        Some(map) => {
                            let v = if l >= 1 {
                                map.get(l as usize - 1).copied()
                            } else {
                                None
                            };
                            base + v.map_or(l, |v| v as i64) - 1
                        }
                        None => base + l - 1,
                    };
                    return Some((format!("bundle/{ix}.ts"), line));
                }
            }
            mod_loc
                .get(&at.fn_)
                .map(|(f, l)| (f.clone(), l + at.line - 1))
        };
        let a = &an.a;
        files.insert("security/analysis.json".into(), render_json(a, &wh));
        let bundled: Vec<bool> = an.parts.iter().map(|p| p.is_some()).collect();
        files.insert(
            "security/summary.md".into(),
            budget_markdown(
                &render_summary(a, &wh, &bundled),
                BUDGET_SUMMARY_LINES,
                summary_order,
            ),
        );
        for ix in &a.ixs {
            files.insert(
                format!("security/{}.md", ix.name),
                budget_markdown(&render_ix(ix, &wh, a), BUDGET_IX_LINES, ix_order),
            );
        }
    }
    files.insert(
        "security/fingerprints.json".into(),
        crate::decompile::render_fingerprints(r),
    );
    let mut t = files["index.ts"].clone();
    t.push_str("// security/summary.md: read first — instructions ranked by sensitivity, their effects, privileges and checks (derived, over-approximate views; security/<ix>.md per instruction, security/analysis.json)\n");
    files.insert("index.ts".into(), t);
    files
}
