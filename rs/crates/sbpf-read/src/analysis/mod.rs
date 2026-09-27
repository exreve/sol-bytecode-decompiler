//! Stage 8: the program analysis (`src/analysis/*`). 8a: the foundation — per-function facts collected
//! while printing (facts.rs), the IR-level flow support (flow.rs: CFGs, dominators, reaching definitions,
//! the account models, exit writes, dispatch splits, function pointers), value sources (sources.rs) and
//! path conditions (paths.rs).

pub mod acct;
pub mod anchor;
pub mod audit;
pub mod consistency;
pub mod dispatch;
pub mod facts;
pub mod flow;
pub mod incidents;
pub mod json;
pub mod ixctx;
pub mod libcpi;
pub mod paths;
pub mod phase2;
pub mod phase3;
pub mod render;
pub mod report;
pub mod rules;
pub mod sources;

use regex::Regex;

/// A JS regex source as a `regex` crate pattern: `\w` `\d` `\b` `\W` are ASCII in JS (`\s` is Unicode in both).
pub fn jsre(p: &str) -> Regex {
    let mut o = String::with_capacity(p.len() + 16);
    let mut in_class = false;
    let mut it = p.chars();
    while let Some(c) = it.next() {
        if c == '\\' {
            let Some(n) = it.next() else {
                o.push('\\');
                break;
            };
            match (n, in_class) {
                ('w', false) => o.push_str("[0-9A-Za-z_]"),
                ('w', true) => o.push_str("0-9A-Za-z_"),
                ('W', false) => o.push_str("[^0-9A-Za-z_]"),
                ('d', false) => o.push_str("[0-9]"),
                ('d', true) => o.push_str("0-9"),
                ('b', false) => o.push_str("(?-u:\\b)"),
                ('s', false) => {
                    o.push('[');
                    o.push_str(JS_WS);
                    o.push(']');
                }
                ('s', true) => o.push_str(JS_WS),
                ('S', false) => {
                    o.push_str("[^");
                    o.push_str(JS_WS);
                    o.push(']');
                }
                ('D', false) => o.push_str("[^0-9]"),
                _ => {
                    o.push('\\');
                    o.push(n);
                }
            }
            continue;
        }
        if c == '[' && !in_class {
            in_class = true;
            o.push(c);
            continue;
        }
        if in_class && matches!(c, '[' | '&' | '~') {
            // (literal in a JS class; nested classes / set operations in the regex crate)
            o.push('\\');
            o.push(c);
            continue;
        }
        if c == ']' && in_class {
            in_class = false;
        }
        o.push(c);
    }
    Regex::new(&o).unwrap_or_else(|e| panic!("regex {p}: {e}"))
}

/// JS `\s` as class members
const JS_WS: &str = r"\t\n\x0B\x0C\r \x{a0}\x{1680}\x{2000}-\x{200a}\x{2028}\x{2029}\x{202f}\x{205f}\x{3000}\x{feff}";

/// A static JS regex (compiled once).
#[macro_export]
macro_rules! jre {
    ($p:expr) => {{
        static R: std::sync::OnceLock<regex::Regex> = std::sync::OnceLock::new();
        R.get_or_init(|| $crate::analysis::jsre($p))
    }};
}

/// JS whitespace (`\s`, String.prototype.trim)
pub fn js_ws(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
    )
}

/// String.prototype.trim
pub fn js_trim(s: &str) -> &str {
    s.trim_matches(js_ws)
}

/// `Number(s)` of a string (NaN when not a number).
pub fn js_number(s: &str) -> f64 {
    let t = js_trim(s);
    if t.is_empty() {
        return 0.0;
    }
    let radix = |p: &str, r: u32| -> f64 {
        if p.is_empty() {
            return f64::NAN;
        }
        let mut v = 0f64;
        for c in p.chars() {
            match c.to_digit(r) {
                Some(d) => v = v * r as f64 + d as f64,
                None => return f64::NAN,
            }
        }
        v
    };
    if let Some(h) = t.strip_prefix("0x").or_else(|| t.strip_prefix("0X")) {
        return radix(h, 16);
    }
    if let Some(h) = t.strip_prefix("0o").or_else(|| t.strip_prefix("0O")) {
        return radix(h, 8);
    }
    if let Some(h) = t.strip_prefix("0b").or_else(|| t.strip_prefix("0B")) {
        return radix(h, 2);
    }
    let body = t.strip_prefix(['+', '-']).unwrap_or(t);
    if body == "Infinity" {
        return if t.starts_with('-') {
            f64::NEG_INFINITY
        } else {
            f64::INFINITY
        };
    }
    let b = body.as_bytes();
    let mut i = 0;
    let mut digits = 0;
    while i < b.len() && b[i].is_ascii_digit() {
        i += 1;
        digits += 1;
    }
    if i < b.len() && b[i] == b'.' {
        i += 1;
        while i < b.len() && b[i].is_ascii_digit() {
            i += 1;
            digits += 1;
        }
    }
    if digits > 0 && i < b.len() && (b[i] == b'e' || b[i] == b'E') {
        i += 1;
        if i < b.len() && (b[i] == b'+' || b[i] == b'-') {
            i += 1;
        }
        let s = i;
        while i < b.len() && b[i].is_ascii_digit() {
            i += 1;
        }
        if i == s {
            return f64::NAN;
        }
    }
    if digits == 0 || i != b.len() {
        return f64::NAN;
    }
    t.parse::<f64>().unwrap_or(f64::NAN)
}

/// `parseInt(s, 16)` of a string of hex digits
pub fn parse_hex(s: &str) -> f64 {
    let s = s
        .strip_prefix("0x")
        .or_else(|| s.strip_prefix("0X"))
        .unwrap_or(s);
    let mut v = 0f64;
    for c in s.chars() {
        match c.to_digit(16) {
            Some(d) => v = v * 16.0 + d as f64,
            None => break,
        }
    }
    v
}

/// `BigInt(s)` of a `0x…` / decimal literal as a u64 (None when it does not fit)
pub fn big_of(s: &str) -> Option<u64> {
    match s.strip_prefix("0x") {
        Some(h) => u64::from_str_radix(h, 16).ok(),
        None => s.parse::<u64>().ok(),
    }
}

/// String.prototype.localeCompare (ICU root collation) for the analysis' names: ASCII by the root order (spaces,
/// punctuation, symbols, digits, letters case-insensitively), then lowercase before uppercase; other characters after
/// ASCII letters by code point.
pub fn locale_cmp(a: &str, b: &str) -> std::cmp::Ordering {
    const ORD: &str = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ";
    let prim = |c: char| -> u32 {
        if c.is_ascii_alphabetic() {
            return 1000 + (c.to_ascii_lowercase() as u32 - 'a' as u32);
        }
        match ORD.find(c) {
            Some(i) if c.is_ascii() => i as u32,
            _ => 2000 + c as u32,
        }
    };
    let (x, y): (Vec<char>, Vec<char>) = (a.chars().collect(), b.chars().collect());
    for i in 0..x.len().min(y.len()) {
        let o = prim(x[i]).cmp(&prim(y[i]));
        if o != std::cmp::Ordering::Equal {
            return o;
        }
    }
    let o = x.len().cmp(&y.len());
    if o != std::cmp::Ordering::Equal {
        return o;
    }
    for i in 0..x.len() {
        let o = x[i].is_ascii_uppercase().cmp(&y[i].is_ascii_uppercase());
        if o != std::cmp::Ordering::Equal {
            return o;
        }
    }
    std::cmp::Ordering::Equal
}

/// f64 map key (JS Map semantics for numbers: -0 is 0)
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub struct FK(pub u64);
impl FK {
    pub fn of(x: f64) -> FK {
        FK(if x == 0.0 { 0 } else { x.to_bits() })
    }
}

use crate::decompile::IxRow;
use crate::idl::IdlInfo;
use crate::views::{Field, Views};
use facts::FnFacts;
use flow::{Cfg, FlowCtx};
use indexmap::IndexMap;
use sbpf_program::{Func, Program};
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

/// A built function as the analysis reads it (decompile.ts FuncOut).
pub struct FnRef<'a> {
    pub pc: i64,
    pub name: String,
    pub f: &'a Func,
    pub text: String,
    pub names: Vec<Option<String>>,
}

/// The decompiler's result as the analysis reads it (decompile.ts Result), with the flow layer's state
/// (shared with the printing phase: the same memos, as the TS's WeakMaps keyed by the same functions).
pub struct An<'a> {
    pub p: &'a Program,
    pub fl: FlowCtx<'a>,
    pub funcs: Vec<FnRef<'a>>,
    pub by_pc: HashMap<i64, usize>,
    pub facts: RefCell<IndexMap<i64, FnFacts>>,
    pub instructions: Vec<IxRow>,
    pub processors: Vec<(String, Vec<String>)>,
    pub anchor: bool,
    pub idl: Option<&'a IdlInfo>,
    pub views: &'a Views,
    pub legacy: bool,
    pub try_of: IndexMap<i64, i64>,
    pub acct_layouts: IndexMap<i64, Vec<Field>>,
    cfgs: RefCell<HashMap<i64, Rc<Cfg<'a>>>>,
    pub memo: anchor::AnchorMemo<'a>,
    pub paths: paths::PathMemo,
    /// the printer of a function's expressions (facts' expr: names as printed)
    pub expr: Box<dyn Fn(i64, sbpf_ir::E) -> Option<String> + 'a>,
    /// recognized library functions (Result.libPcs)
    pub lib_pcs: std::collections::HashSet<i64>,
    /// the program's address (Result.programId)
    pub program_id: Option<String>,
    /// (instruction context ids: every context object distinct, as the TS's memo keys)
    pub ctx_ids: std::cell::Cell<u32>,
    /// libcpi.ts memo
    pub lib_cpi: RefCell<HashMap<i64, Option<libcpi::LibCpi>>>,
    /// phase2.ts lamportsGetter memo
    pub getters: RefCell<HashMap<i64, bool>>,
    /// a TS exception the analysis would throw (its message; the analysis dump reports it)
    pub err: RefCell<Option<String>>,
    /// report-layer memos (per function, as the TS's WeakMaps): condition lines by condKey, the first pc of each
    /// printed line, the sysvar scan of each block, whether a function's text names SYSVAR_INSTRUCTIONS
    pub cond_lines: RefCell<HashMap<i64, Rc<HashMap<String, i64>>>>,
    pub line_pcs: RefCell<HashMap<i64, Rc<HashMap<i64, i64>>>>,
    pub sysvar_scans: RefCell<HashMap<(i64, usize), Rc<audit::SysvarScan>>>,
    pub names_id: RefCell<HashMap<i64, bool>>,
    pub fn_discs: RefCell<HashMap<i64, Rc<Vec<(u64, String)>>>>,
}

impl<'a> An<'a> {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        p: &'a Program,
        fl: FlowCtx<'a>,
        funcs: Vec<FnRef<'a>>,
        facts: IndexMap<i64, FnFacts>,
        instructions: Vec<IxRow>,
        processors: Vec<(String, Vec<String>)>,
        anchor: bool,
        idl: Option<&'a IdlInfo>,
        views: &'a Views,
        legacy: bool,
        try_of: IndexMap<i64, i64>,
        acct_layouts: IndexMap<i64, Vec<Field>>,
        expr: Box<dyn Fn(i64, sbpf_ir::E) -> Option<String> + 'a>,
    ) -> Self {
        let by_pc = funcs.iter().enumerate().map(|(i, f)| (f.pc, i)).collect();
        An {
            p,
            fl,
            funcs,
            by_pc,
            facts: RefCell::new(facts),
            instructions,
            processors,
            anchor,
            idl,
            views,
            legacy,
            try_of,
            acct_layouts,
            cfgs: RefCell::new(HashMap::new()),
            memo: Default::default(),
            paths: Default::default(),
            expr,
            lib_pcs: Default::default(),
            program_id: None,
            ctx_ids: std::cell::Cell::new(1),
            lib_cpi: Default::default(),
            getters: Default::default(),
            err: Default::default(),
            cond_lines: Default::default(),
            line_pcs: Default::default(),
            sysvar_scans: Default::default(),
            names_id: Default::default(),
            fn_discs: Default::default(),
        }
    }
    pub fn fo(&self, pc: i64) -> Option<&FnRef<'a>> {
        self.by_pc.get(&pc).map(|&i| &self.funcs[i])
    }
    /// cfgOf(fo), memoized per function
    pub fn cfg(&self, pc: i64) -> Rc<Cfg<'a>> {
        if let Some(g) = self.cfgs.borrow().get(&pc) {
            return g.clone();
        }
        let f = self.fo(pc).unwrap().f;
        let g = Rc::new(flow::cfg_of(f));
        self.cfgs.borrow_mut().insert(pc, g.clone());
        g
    }
    /// record the first exception the analysis would throw
    pub fn set_err(&self, m: &str) {
        let mut e = self.err.borrow_mut();
        if e.is_none() {
            *e = Some(m.to_string());
        }
    }
    /// r.program.funcs.get(pc)?.name ?? ''
    pub fn pname(&self, pc: i64) -> String {
        self.p
            .funcs
            .get(&pc)
            .map_or(String::new(), |f| f.name.clone())
    }
}

/// String.prototype.slice(start, end) by UTF-16 code units (a surrogate pair cut in half becomes U+FFFD)
pub fn js_slice(s: &str, start: usize, end: Option<usize>) -> String {
    let mut o = String::new();
    let mut u = 0usize;
    let end = end.unwrap_or(usize::MAX);
    for c in s.chars() {
        let n = c.len_utf16();
        let (a, b) = (u, u + n);
        u = b;
        if b <= start {
            continue;
        }
        if a >= end {
            break;
        }
        if a >= start && b <= end {
            o.push(c);
        } else {
            o.push('\u{FFFD}');
        }
    }
    o
}
