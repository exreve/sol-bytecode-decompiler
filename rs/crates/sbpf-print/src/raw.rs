//! The raw decompiler output (`decompile(bytes, { sugar: false, full: true })`, what
//! `test/equiv.ts --raw` evaluates): the pipeline of stages 1–4 in the TS order, each function's
//! printed text, and the single-file rendering (`layout.ts` renderSingle) without the analysis
//! summary (stage 8).

use crate::consts::{PRELUDE, PROVENANCE, TYPES};
use crate::names::{name_functions, semantics, sha8, Sem};
use crate::print::{declarations, print_body, stmt_exprs, Printer, ProgNames};
use indexmap::{IndexMap, IndexSet};
use sbpf_elf::Image;
use sbpf_ir::{CallTarget, Node, Stmt, Term, E};
use sbpf_opt::Fx;
use sbpf_program::{fn_addr, load_program, Func, Program};
use sbpf_struct::Tree;
use std::collections::{HashMap, HashSet};

/// One decompiled function.
pub struct RawFunc {
    pub pc: i64,
    pub tree: Tree,
    pub text: String,
    /// callsOf: direct callees and function-address constants, in order of first appearance
    pub calls: Vec<i64>,
}

pub struct Raw {
    /// the program after the whole pipeline (each function's blocks, arena and variables)
    pub p: Program,
    pub sem: Sem,
    pub funcs: Vec<RawFunc>,
}

/// The program after stages 1–3 (through sinkFrameLoads + compactStores), named, with the tables
/// the printer needs.
pub struct Prepared {
    pub p: Program,
    pub sem: Sem,
    /// original symbol names of the renamed functions (symNotes)
    pub sym_notes: IndexMap<i64, String>,
    pub names: ProgNames,
}

/// The raw pipeline: load, signatures, naming, variable recovery, the per-function phase, stack
/// arguments, then per function sinkFrameLoads + compactStores, structuring, clean-up, statement
/// idioms and printing (per-function work on `threads` worker threads, results in function order).
pub fn decompile_raw(bytes: &[u8], threads: usize) -> Result<Raw, String> {
    let mut pr = prepare(bytes, threads)?;
    let trees = structure_all(&mut pr, threads);
    let funcs = print_all(&mut pr, trees, threads);
    Ok(Raw {
        p: pr.p,
        sem: pr.sem,
        funcs,
    })
}

/// Stages 1–3 of the raw pipeline (the input of structuring).
pub fn prepare(bytes: &[u8], threads: usize) -> Result<Prepared, String> {
    let mut p = load_program(bytes, true)?;
    sbpf_dataflow::infer_signatures(&mut p);
    let sem = semantics(&p);
    let sym_notes = name_functions(&mut p, &sem);
    let names = prog_names(&p);
    sbpf_dataflow::recover_all(&mut p)?;
    {
        let img = Image::new(&p.elf);
        sbpf_opt::par_each(p.funcs.values_mut().collect(), threads, |f| {
            sbpf_opt::phase2(f, Some(&img), false, |_, _| {});
        });
    }
    let built: Vec<usize> = (0..p.funcs.len()).collect();
    sbpf_dataflow::stackargs::rewrite_stack_args(&mut p.funcs, &built);
    sbpf_opt::par_each(p.funcs.values_mut().collect(), threads, |f| {
        sbpf_opt::finish(f, false)
    });
    Ok(Prepared {
        p,
        sem,
        sym_notes,
        names,
    })
}

/// Structuring of every function (structure + cleanup + statementIdioms), in function order.
pub fn structure_all(pr: &mut Prepared, threads: usize) -> Vec<Tree> {
    sbpf_opt::par_each(pr.p.funcs.values_mut().collect(), threads, structure_func)
}

/// Printing of every function (names, declarations, text) and its calls, in function order.
pub fn print_all(pr: &mut Prepared, trees: Vec<Tree>, threads: usize) -> Vec<RawFunc> {
    let p = &mut pr.p;
    let pc_by_addr: HashMap<u64, i64> = p.funcs.keys().map(|&pc| (fn_addr(p, pc), pc)).collect();
    let (names, sym_notes) = (&pr.names, &pr.sym_notes);
    let items: Vec<(&mut Func, Tree)> = p.funcs.values_mut().zip(trees).collect();
    par_map(items, threads, |(f, tree)| {
        let f = &*f;
        let text = func_text(f, &tree, names, sym_notes.get(&f.pc).map(|s| s.as_str()));
        let calls = calls_of(f, &pc_by_addr);
        RawFunc {
            pc: f.pc,
            tree,
            text,
            calls,
        }
    })
}

/// structure + cleanup + statementIdioms of one function (after compactStores).
pub fn structure_func(f: &mut Func) -> Tree {
    let mut tree = Tree::default();
    sbpf_struct::structure(f, &mut tree);
    let mut x = Fx::new(f.ir.take().expect("variable IR"), None);
    sbpf_struct::cleanup(&mut x, &mut tree, f.returns);
    let fp = f.vars.iter().find(|v| v.param == 10).map(|v| v.id);
    sbpf_struct::statement_idioms(&mut x, &mut tree, fp);
    f.ir = Some(x.ir);
    tree
}

/// Map over items on worker threads, results in input order.
pub fn par_map<T: Send, R: Send>(
    items: Vec<T>,
    threads: usize,
    f: impl Fn(T) -> R + Sync,
) -> Vec<R> {
    let n = items.len();
    if threads <= 1 || n <= 1 {
        return items.into_iter().map(f).collect();
    }
    let work = std::sync::Mutex::new(items.into_iter().enumerate());
    let out: std::sync::Mutex<Vec<Option<R>>> =
        std::sync::Mutex::new((0..n).map(|_| None).collect());
    std::thread::scope(|s| {
        for _ in 0..threads.min(n) {
            std::thread::Builder::new()
                .stack_size(1 << 28)
                .spawn_scoped(s, || loop {
                    let next = work.lock().unwrap().next();
                    let Some((i, x)) = next else { break };
                    let r = f(x);
                    out.lock().unwrap()[i] = Some(r);
                })
                .expect("spawn");
        }
    });
    out.into_inner()
        .unwrap()
        .into_iter()
        .map(|x| x.unwrap())
        .collect()
}

pub fn prog_names(p: &Program) -> ProgNames {
    let mut n = ProgNames {
        text_addr: p.elf.text().addr,
        ..Default::default()
    };
    for f in p.funcs.values() {
        n.by_pc.insert(f.pc, f.name.clone());
        n.by_addr.insert(fn_addr(p, f.pc), f.name.clone());
    }
    for (k, s) in &p.syscalls {
        n.sys.insert(k.clone(), s.alias.clone());
    }
    n
}

/// callsOf (decompile.ts): call targets and function-address constants of the blocks.
fn calls_of(f: &Func, pc_by_addr: &HashMap<u64, i64>) -> Vec<i64> {
    let ir = f.ir.as_ref().unwrap();
    let mut out: IndexSet<i64> = IndexSet::new();
    let visit = |e: E, out: &mut IndexSet<i64>| {
        ir.walk(e, &mut |_, n| match n {
            Node::Call(t, _) => {
                if let CallTarget::Fn { pc } = ir.target(t) {
                    out.insert(pc);
                }
            }
            Node::Const(v) => {
                if let Some(&t) = pc_by_addr.get(&v) {
                    out.insert(t);
                }
            }
            _ => {}
        });
    };
    let mut es = Vec::new();
    for b in &f.blocks {
        for s in &b.stmts {
            if let Stmt::Call {
                t: CallTarget::Fn { pc },
                ..
            } = s
            {
                out.insert(*pc);
            }
            stmt_exprs(ir, s, &mut es);
            for &e in &es {
                visit(e, &mut out);
            }
        }
        match &b.term {
            Term::Br { c, .. } => visit(*c, &mut out),
            Term::Ret { e: Some(e) } => visit(*e, &mut out),
            _ => {}
        }
    }
    out.into_iter().collect()
}

const RESERVED: &[&str] = &[
    "do", "if", "in", "as", "of", "fp", "let", "var", "for", "new", "try", "int", "is", "ld", "st",
];

/// shortNames: f … z, then two letters (not reserved words), then v0, v1, …
pub struct ShortNames {
    pub k: usize,
}

impl Iterator for ShortNames {
    type Item = String;
    fn next(&mut self) -> Option<String> {
        loop {
            let k = self.k;
            self.k += 1;
            if k < 21 {
                return Some(((b'f' + k as u8) as char).to_string());
            }
            let k2 = k - 21;
            if k2 < 26 * 26 {
                let n: String = [
                    (b'a' + (k2 / 26) as u8) as char,
                    (b'a' + (k2 % 26) as u8) as char,
                ]
                .iter()
                .collect();
                if RESERVED.contains(&n.as_str()) {
                    continue;
                }
                return Some(n);
            }
            return Some(format!("v{}", k2 - 26 * 26));
        }
    }
}

pub const PARAM_NAME: [&str; 11] = ["r0", "a", "b", "c", "d", "e", "r6", "r7", "r8", "r9", "fp"];

/// A function's printed text (decompile's phase 4, plain form).
pub fn func_text(f: &Func, tree: &Tree, names: &ProgNames, sym_note: Option<&str>) -> String {
    let ir = f.ir.as_ref().expect("variable IR");
    let (decls, hoisted, used) = declarations(ir, f, tree);
    let used = |v: &u32| used.get(*v as usize).copied().unwrap_or(false);
    let zero_init: Vec<u32> = if f.is_entry {
        f.vars
            .iter()
            .filter(|v| v.param >= 0 && v.param != 1 && v.param != 10 && used(&v.id))
            .map(|v| v.id)
            .collect()
    } else {
        Vec::new()
    };
    let mut vn: Vec<Option<String>> = vec![None; f.vars.len()];
    for v in &f.vars {
        let i = v.id as usize;
        if i >= vn.len() {
            vn.resize(i + 1, None);
        }
        if v.param >= 100 {
            vn[i] = Some(format!("p{}", 5 + v.param - 100));
        } else if v.param >= 0 && !zero_init.contains(&v.id) {
            vn[i] = if f.is_entry && v.param == 1 {
                Some("input".into())
            } else {
                PARAM_NAME.get(v.param as usize).map(|s| s.to_string())
            };
        } else if v.reg == -1 {
            vn[i] = Some("state".into());
        }
    }
    let mut gen = ShortNames { k: 0 };
    for v in &f.vars {
        let i = v.id as usize;
        if vn[i].is_none() && used(&v.id) {
            vn[i] = gen.next();
        }
    }
    let param_nm = |reg: i32, dflt: String| -> String {
        f.vars
            .iter()
            .find(|x| x.param == reg)
            .and_then(|v| vn.get(v.id as usize).cloned().flatten())
            .unwrap_or(dflt)
    };
    let pdef = |r: i32| {
        PARAM_NAME
            .get(r as usize)
            .map_or("undefined".to_string(), |s| s.to_string())
    };
    let mut params: Vec<String> = Vec::new();
    let stack_args = f.stack_args.unwrap_or(0);
    if f.is_entry {
        params.push("input: u64".into());
    } else {
        let n = if stack_args > 0 { 4 } else { f.nparams as i32 };
        for r in 1..=n {
            params.push(format!("{}: u64", param_nm(r, pdef(r))));
        }
        for k in 0..stack_args as i32 {
            params.push(format!("{}: u64", param_nm(100 + k, format!("p{}", 5 + k))));
        }
        for &r in &f.extra_in {
            params.push(format!("{}: u64", param_nm(r as i32, pdef(r as i32))));
        }
    }
    let mut lines: Vec<String> = Vec::new();
    if let Some(s) = sym_note {
        lines.push(format!("// symbol: {s}"));
    }
    if tree.irreducible {
        lines.push("// note: irreducible control flow, emitted as a state machine".into());
    }
    lines.push(format!(
        "function {}({}){} {{",
        f.name,
        params.join(", "),
        if f.noreturn {
            ": never"
        } else if f.returns {
            ": u64"
        } else {
            ""
        }
    ));
    let hoisted: Vec<u32> = hoisted.into_iter().filter(|v| used(v)).collect();
    let mut pr = Printer::new(ir, names, &vn);
    let body = print_body(&mut pr, tree, "\t", &decls, &hoisted);
    if !zero_init.is_empty() {
        let z: Vec<String> = zero_init
            .iter()
            .map(|&v| format!("{} = 0", pr.var_name(v)))
            .collect();
        lines.push(format!("\tlet {}", z.join(", ")));
    }
    lines.extend(body);
    lines.push("}".into());
    lines.join("\n")
}

// ---------------- single file (layout.ts renderSingle) ----------------

/// Called names of a text (`\b([A-Za-z_][A-Za-z0-9_]*)\(`), in order of first appearance.
pub fn called(text: &str, out: &mut IndexSet<String>) {
    let b = text.as_bytes();
    let w = |c: u8| c.is_ascii_alphanumeric() || c == b'_';
    let mut i = 0;
    while i < b.len() {
        if !w(b[i]) {
            i += 1;
            continue;
        }
        let s = i;
        while i < b.len() && w(b[i]) {
            i += 1;
        }
        if !b[s].is_ascii_digit() && b.get(i) == Some(&b'(') && !out.contains(&text[s..i]) {
            out.insert(text[s..i].to_string());
        }
    }
}

/// localeCompare of snake-case names (`_` before digits before letters, then by length).
pub fn locale_cmp(a: &str, b: &str) -> std::cmp::Ordering {
    let key = |c: u8| match c {
        b'_' => (0u8, c),
        b'0'..=b'9' => (1, c),
        _ => (2, c.to_ascii_lowercase()),
    };
    let (x, y) = (a.as_bytes(), b.as_bytes());
    for i in 0..x.len().min(y.len()) {
        let o = key(x[i]).cmp(&key(y[i]));
        if o != std::cmp::Ordering::Equal {
            return o;
        }
    }
    x.len().cmp(&y.len())
}

/// One function of the single file.
pub struct SingleFunc<'a> {
    pub pc: i64,
    pub name: &'a str,
    pub text: &'a str,
    pub calls: &'a [i64],
    pub is_entry: bool,
}

/// One row of the instruction table.
pub struct SingleIx<'a> {
    pub name: &'a str,
    pub disc: u64,
    pub args: Option<&'a [String]>,
    pub accounts: Option<&'a [String]>,
    pub str_accounts: Option<&'a [String]>,
}

/// What renderSingle reads of a decompile Result.
pub struct SingleIn<'a> {
    pub version: u32,
    pub n_insns: usize,
    pub n_funcs: usize,
    pub funcs: Vec<SingleFunc<'a>>,
    pub ixs: Vec<SingleIx<'a>>,
    pub anchor: bool,
    /// (function name, instruction names)
    pub processors: Vec<(&'a str, &'a [String])>,
    /// usedViews: the view declarations for the candidate names scanned from the texts (in order)
    pub views: &'a dyn Fn(&IndexSet<String>) -> Vec<String>,
    /// the outlined helpers' texts
    pub outlined: Vec<&'a str>,
}

/// renderSingle without the analysis summary (`// security summary …` block).
pub fn render_single(r: &Raw) -> String {
    let p = &r.p;
    let funcs = r
        .funcs
        .iter()
        .map(|f| {
            let pf = &p.funcs[&f.pc];
            SingleFunc {
                pc: f.pc,
                name: pf.name.as_str(),
                text: f.text.as_str(),
                calls: &f.calls,
                is_entry: pf.is_entry,
            }
        })
        .collect::<Vec<_>>();
    let by_pc: HashSet<i64> = r.funcs.iter().map(|f| f.pc).collect();
    let ixs = r
        .sem
        .ix_names
        .iter()
        .filter(|(pc, _)| by_pc.contains(pc))
        .map(|(_, n)| SingleIx {
            name: n.as_str(),
            disc: sha8(&format!("global:{n}")),
            args: None,
            accounts: None,
            str_accounts: None,
        })
        .collect();
    let processors = r
        .sem
        .processors
        .iter()
        .filter(|(pc, _)| by_pc.contains(pc))
        .map(|(pc, names)| (p.funcs[pc].name.as_str(), names.as_slice()))
        .collect();
    let no_views = |_: &IndexSet<String>| Vec::new();
    render_single_of(&SingleIn {
        version: p.version,
        n_insns: p.insns.len(),
        n_funcs: p.funcs.len(),
        funcs,
        ixs,
        anchor: r.sem.anchor,
        processors,
        views: &no_views,
        outlined: vec![],
    })
}

/// usedViews' scan: `/(?::|\bas) ([A-Z][A-Za-z0-9_]*)\b/g` capture groups, first appearance order.
pub fn scan_views(text: &str, out: &mut IndexSet<String>) {
    let b = text.as_bytes();
    let w = |c: u8| c.is_ascii_alphanumeric() || c == b'_';
    let mut i = 0;
    while i < b.len() {
        let st = if b[i] == b':' {
            i + 1
        } else if b[i] == b'a' && b.get(i + 1) == Some(&b's') && (i == 0 || !w(b[i - 1])) {
            i + 2
        } else {
            i += 1;
            continue;
        };
        if b.get(st) == Some(&b' ') && b.get(st + 1).is_some_and(|c| c.is_ascii_uppercase()) {
            let s = st + 1;
            let mut e = s;
            while e < b.len() && w(b[e]) {
                e += 1;
            }
            if !out.contains(&text[s..e]) {
                out.insert(text[s..e].to_string());
            }
            i = e;
        } else {
            i += 1;
        }
    }
}

/// layout.ts renderSingle (without the analysis summary block).
pub fn render_single_of(r: &SingleIn) -> String {
    let by_pc: HashMap<i64, usize> = r.funcs.iter().enumerate().map(|(i, f)| (f.pc, i)).collect();
    let name = |i: usize| r.funcs[i].name;
    let proc_names: HashSet<&str> = r.processors.iter().map(|x| x.0).collect();
    let is_root = |i: usize| name(i).starts_with("ix_") || proc_names.contains(name(i));
    let handlers: Vec<usize> = (0..r.funcs.len()).filter(|&i| is_root(i)).collect();
    let mut owners: HashMap<usize, Vec<usize>> = HashMap::new();
    for &h in &handlers {
        let mut seen: HashSet<usize> = HashSet::from([h]);
        let mut q = vec![h];
        while let Some(x) = q.pop() {
            let o = owners.entry(x).or_default();
            if !o.contains(&h) {
                o.push(h);
            }
            for t in r.funcs[x].calls {
                if let Some(&ti) = by_pc.get(t) {
                    if !seen.contains(&ti) && !is_root(ti) {
                        seen.insert(ti);
                        q.push(ti);
                    }
                }
            }
        }
    }
    // groups: each handler + the helpers only it reaches (call order), then the rest
    let mut placed = vec![false; r.funcs.len()];
    let mut ix_groups: Vec<(String, Vec<usize>)> = Vec::new();
    for &h in &handlers {
        let mut order = Vec::new();
        let mut seen = vec![false; r.funcs.len()];
        let mut st: Vec<(usize, usize)> = vec![(h, 0)];
        seen[h] = true;
        order.push(h);
        while let Some(top) = st.last_mut() {
            let (x, k) = *top;
            if k >= r.funcs[x].calls.len() {
                st.pop();
                continue;
            }
            top.1 += 1;
            let t = r.funcs[x].calls[k];
            let Some(&ti) = by_pc.get(&t) else { continue };
            if seen[ti] || is_root(ti) {
                continue;
            }
            if owners.get(&ti).is_some_and(|o| o.len() == 1 && o[0] == h) {
                seen[ti] = true;
                order.push(ti);
                st.push((ti, 0));
            }
        }
        for &x in &order {
            placed[x] = true;
        }
        let n = name(h);
        let title = match n.strip_prefix("ix_") {
            Some(ix) => format!("instruction {ix}"),
            None => format!("instruction processor {n} (handles several instructions inline)"),
        };
        ix_groups.push((title, order));
    }
    let mut entry: Vec<usize> = Vec::new();
    let mut shared: Vec<usize> = Vec::new();
    for i in 0..r.funcs.len() {
        if placed[i] {
            continue;
        }
        if owners.get(&i).is_some_and(|o| o.len() > 1) {
            shared.push(i);
        } else {
            entry.push(i);
        }
    }
    entry.sort_by_key(|&i| (!r.funcs[i].is_entry, r.funcs[i].pc));

    let mut out: Vec<String> = vec![PRELUDE.to_string(), PROVENANCE.to_string()];
    out.push(format!(
        "// program: sBPF v{}, {} instructions, {} functions ({} decompiled, 0 library)",
        r.version,
        r.n_insns,
        r.n_funcs,
        r.funcs.len()
    ));
    if !r.ixs.is_empty() {
        out.push(if r.anchor {
            "// instructions (Anchor, discriminator = sha256(\"global:<name>\")[..8] of instruction data, as u64):".into()
        } else {
            "// instruction handlers (named from their \"Instruction: X\" logs, or [heur] from the discriminator compared before the call):".into()
        });
        let mut ixs: Vec<&SingleIx> = r.ixs.iter().collect();
        ixs.sort_by(|a, b| locale_cmp(a.name, b.name));
        for i in ixs {
            let n = i.name;
            out.push(if r.anchor {
                format!("//   {n:<28} 0x{:016x}  -> ix_{n}", i.disc)
            } else {
                format!("//   {n:<28} -> ix_{n}")
            });
            if let Some(a) = i.args.filter(|a| !a.is_empty()) {
                out.push(format!("//     args [idl]: {}", a.join(", ")));
            }
            if let Some(a) = i.accounts.filter(|a| !a.is_empty()) {
                out.push(format!("//     accounts [idl]: {}", a.join(", ")));
            } else if let Some(a) = i.str_accounts.filter(|a| !a.is_empty()) {
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
    out.push(String::new());
    let mut calls: IndexSet<String> = IndexSet::new();
    for f in &r.funcs {
        called(f.text, &mut calls);
    }
    let lower = |n: &str| {
        let b = n.as_bytes();
        !b.is_empty()
            && (b[0].is_ascii_lowercase() || b[0] == b'_')
            && b.iter()
                .all(|&c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'_')
    };
    let helpers: Vec<&str> = TYPES
        .split('\n')
        .filter(|l| {
            let Some(rest) = l.strip_prefix("declare function ") else {
                return false;
            };
            let k = rest
                .bytes()
                .take_while(|c| c.is_ascii_alphanumeric() || *c == b'_')
                .count();
            k > 0
                && rest.as_bytes().get(k) == Some(&b'(')
                && rest[k..].contains("// ")
                && lower(&rest[..k])
                && calls.contains(&rest[..k])
        })
        .collect();
    if !helpers.is_empty() {
        out.push("// helpers:".into());
        out.extend(helpers.iter().map(|s| s.to_string()));
        out.push(String::new());
    }
    let mut vnames: IndexSet<String> = IndexSet::new();
    for f in &r.funcs {
        scan_views(f.text, &mut vnames);
    }
    let vw = (r.views)(&vnames);
    if !vw.is_empty() {
        out.extend(vw);
        out.push(String::new());
    }
    let is_sys = |n: &str| {
        n == "abort"
            || n.strip_prefix("sol_").is_some_and(|r| {
                !r.is_empty()
                    && r.bytes()
                        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'_')
            })
    };
    let mut sys = Vec::new();
    for sc in &sbpf_program::syscalls::tables().all {
        if is_sys(&sc.alias) && calls.contains(sc.alias.as_str()) {
            let ps: Vec<String> = sc.params.iter().map(|p| format!("{p}: u64")).collect();
            sys.push(format!(
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
    if !sys.is_empty() {
        out.extend(sys);
        out.push(String::new());
    }
    if !r.outlined.is_empty() {
        out.push(crate::consts::OUTLINED.into());
        out.extend(r.outlined.iter().map(|t| format!("{t}\n")));
    }
    let mut section = |title: &str, fs: &[usize]| {
        if fs.is_empty() {
            return;
        }
        out.push(format!("// ===== {title} ====="));
        for &i in fs {
            out.push(r.funcs[i].text.to_string());
            out.push(String::new());
        }
    };
    section(
        "entrypoint, dispatcher and code outside instruction handlers",
        &entry,
    );
    for (t, fs) in &ix_groups {
        section(t, fs);
    }
    section("helpers used by several instructions", &shared);
    out.join("\n")
}
