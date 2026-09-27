//! Per-function facts for the program analysis (`src/analysis/facts.ts`): the checks a function makes
//! (a condition guarding an early exit), the operations it performs (CPIs, PDA derivations, lamport and
//! account-data writes) and the calls it makes, each with its line in the function's printed text.
//!
//! Control flow comes from the structured IR (nodes); names, typed fields and CPI decodings come from the
//! lines the function printed as. Nodes are identified by address (`*const SNode`): the printed body.

use super::{big_of, js_number, js_trim, js_ws, parse_hex};
use crate::anchorstate::inline_string;
use crate::cpi::{CpiDesc, CpiParts, CpiSrc, PartAcc};
use crate::jre;
use crate::util::{call_of, js_num, json_str, stmt_exprs, stmt_pc, u16len};
use indexmap::IndexMap;
use regex::Regex;
use sbpf_ir::{CallTarget, CmpOp, Ir, Node, Stmt, BinOp, E};
use sbpf_struct::{Label, SNode, Tree};
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

/// A CPI / PDA site of the function (the comment printed before it).
#[derive(Clone, Debug)]
pub struct SiteNote {
    pub pda: bool,
    pub desc: Option<CpiDesc>,
    /// the user function wrapping invoke that was called
    pub via: Option<String>,
}

pub type NodeKey = *const SNode;

/// A store's account field (flow.ts accountResolver.store)
#[derive(Clone, Debug)]
pub struct StoreRef {
    pub index: i64,
    pub field: Option<String>,
    pub how: Option<&'static str>,
}

pub struct FnInput<'a> {
    pub pc: i64,
    pub name: &'a str,
    pub ir: &'a Ir,
    pub tree: &'a Tree,
    pub body: &'a [SNode],
    /// the function's printed lines (header comments included)
    pub lines: &'a [String],
    /// index in `lines` of the body's first line
    pub at: usize,
    pub spans: &'a HashMap<NodeKey, (usize, usize)>,
    pub sites: &'a HashMap<NodeKey, SiteNote>,
    pub noreturn: &'a dyn Fn(i64) -> bool,
    pub callee_name: &'a dyn Fn(i64) -> String,
    pub anchor: bool,
    pub seeds_at: &'a dyn Fn(u64, u64) -> Option<String>,
    /// native: account fields a condition reads (the sides' first statements locate a rebuilt condition)
    pub ir_refs: Option<&'a dyn Fn(E, Option<i64>, Option<i64>) -> Vec<Option<String>>>,
    pub ir_cmp: Option<&'a dyn Fn(E, Option<i64>, Option<i64>) -> bool>,
    pub ir_pda: Option<&'a dyn Fn(E, Option<i64>, Option<i64>) -> Option<f64>>,
    /// native: the account field a store writes (by the statement's index in the tree)
    pub ir_store: Option<&'a dyn Fn(u32) -> Option<StoreRef>>,
    pub callee_path: &'a dyn Fn(i64) -> Option<String>,
    pub str_at: &'a dyn Fn(u64, u64) -> Option<String>,
    pub custom_error: &'a dyn Fn(i64) -> bool,
}

/// An account (or an object held by one) as the code names it.
#[derive(Clone, Debug, PartialEq)]
pub struct Ref {
    pub acct: String,
    pub field: Option<String>,
}

#[derive(Clone, Debug)]
pub struct Check {
    pub line: i64,
    pub pc: Option<i64>,
    pub cond: String,
    pub fails_if: bool,
    pub error: String,
    pub kinds: Vec<&'static str>,
    pub refs: Vec<Ref>,
    pub named: Option<String>,
    pub main: bool,
    pub before: Option<i64>,
    pub via: Option<(String, Vec<&'static str>)>,
    pub c: Option<E>,
    pub pass_pc: Option<i64>,
    pub cmp32: bool,
    pub log_rel: Option<(String, String)>,
    pub pubkeys: bool,
}

/// An operation's CPI (CpiParts & { family, ix })
#[derive(Clone, Debug, Default)]
pub struct OpCpi {
    pub program: String,
    pub known: Option<String>,
    pub checked: Option<String>,
    pub accounts: Vec<PartAcc>,
    pub fields: Vec<(String, String)>,
    pub seeds: Option<String>,
    pub src: Option<CpiSrc>,
    pub family: Option<String>,
    pub ix: Option<String>,
}

#[derive(Clone, Debug)]
pub struct Pda {
    pub fn_: String,
    pub seeds: String,
    pub program: String,
}

#[derive(Clone, Debug)]
pub struct Op {
    pub line: i64,
    pub pc: Option<i64>,
    pub kinds: Vec<&'static str>,
    pub text: String,
    pub main: bool,
    pub err_path: bool,
    pub cpi: Option<OpCpi>,
    pub target: Option<Ref>,
    pub how: Option<&'static str>,
    pub value: Option<String>,
    pub pda: Option<Pda>,
    pub via: Option<String>,
    pub ret: Option<E>,
    pub exit: Option<String>,
    pub handler: Option<i64>,
}

impl Op {
    fn new(line: i64, pc: Option<i64>, kinds: Vec<&'static str>, text: String, main: bool, err: bool) -> Op {
        Op {
            line,
            pc,
            kinds,
            text,
            main,
            err_path: err,
            cpi: None,
            target: None,
            how: None,
            value: None,
            pda: None,
            via: None,
            ret: None,
            exit: None,
            handler: None,
        }
    }
}

#[derive(Clone, Debug)]
pub struct Call {
    pub line: i64,
    pub pc: Option<i64>,
    pub ret: Option<E>,
    pub callee: i64,
    pub main: bool,
    pub err_path: bool,
}

#[derive(Clone, Debug)]
pub struct IxHint {
    pub line: i64,
    pub program: String,
    pub family: String,
    pub ix: String,
    pub how: String,
    /// the builder call: (fn, pc)
    pub call: Option<(i64, i64)>,
}

#[derive(Clone, Debug, Default)]
pub struct FnFacts {
    pub pc: i64,
    pub name: String,
    pub checks: Vec<Check>,
    pub ops: Vec<Op>,
    pub calls: Vec<Call>,
    pub types: IndexMap<String, String>,
    pub wrapper: bool,
    pub ix_hints: Vec<IxHint>,
    pub lines: Vec<String>,
    pub at: usize,
    pub pc_line: IndexMap<i64, i64>,
    pub cond_line: IndexMap<E, i64>,
}

const ACC_FIELDS: &[&str] = &[
    "key",
    "owner",
    "is_signer",
    "is_writable",
    "executable",
    "lamports",
    "data",
    "data_len",
    "rent_epoch",
    "original_data_len",
    "dup_marker",
];

fn field_kind(f: &str) -> Option<&'static str> {
    Some(match f {
        "is_signer" => "signer",
        "is_writable" => "writable",
        "executable" => "executable",
        "owner" => "owner",
        "key" => "key",
        "data_len" => "data_len",
        "lamports" => "lamports",
        _ => return None,
    })
}

/// Anchor error -> the constraint it reports
pub fn anchor_kind(e: &str) -> Option<&'static str> {
    Some(match e {
        "ConstraintMut" | "AccountNotMutable" => "writable",
        "ConstraintSigner" | "AccountNotSigner" => "signer",
        "ConstraintOwner" | "AccountOwnedByWrongProgram" | "AccountNotSystemOwned" => "owner",
        "ConstraintSeeds" => "pda",
        "ConstraintHasOne" => "has_one",
        "ConstraintAddress" | "InvalidProgramId" | "AccountSysvarMismatch" => "address",
        "AccountDiscriminatorMismatch" | "AccountDiscriminatorNotFound" => "discriminator",
        "AccountNotInitialized" => "initialized",
        "ConstraintRentExempt" => "rent_exempt",
        "ConstraintExecutable" | "InvalidProgramExecutable" | "AccountNotProgram" => "executable",
        "ConstraintTokenMint" => "token_mint",
        "ConstraintTokenOwner" => "token_owner",
        "ConstraintMintAuthority" => "mint_authority",
        "ConstraintRaw" => "raw",
        "ConstraintClose" => "close",
        "ConstraintZero" => "zero",
        "AccountNotEnoughKeys" => "count",
        "ConstraintState" => "state",
        "ConstraintAssociated" | "ConstraintAssociatedInit" => "associated",
        "ConstraintTokenTokenProgram" => "token_program",
        "ConstraintSpace" => "space",
        "ConstraintDuplicateMutableAccount" => "duplicate",
        _ => return None,
    })
}

fn is_w(c: u8) -> bool {
    c.is_ascii_alphanumeric() || c == b'_'
}

/// `/anchor::(?!Instruction(?:Missing|FallbackNotFound|DidNotDeserialize|DidNotSerialize)\b)\w/`
fn anchor_mark(s: &str) -> bool {
    let b = s.as_bytes();
    let mut from = 0;
    while let Some(i) = s[from..].find("anchor::") {
        let j = from + i + 8;
        from = from + i + 1;
        if j >= b.len() || !is_w(b[j]) {
            continue;
        }
        let rest = &s[j..];
        let excluded = ["InstructionMissing", "InstructionFallbackNotFound", "InstructionDidNotDeserialize", "InstructionDidNotSerialize"]
            .iter()
            .any(|x| rest.starts_with(x) && rest.as_bytes().get(x.len()).is_none_or(|&c| !is_w(c)));
        if !excluded {
            return true;
        }
    }
    false
}

/// ERROR_MARK
pub fn error_mark(s: &str) -> bool {
    anchor_mark(s)
        || jre!(r"error::\w|\bErr\(|ProgramError::|Error_with_(?:account_name|pubkeys|values)\(|anchor_error_from\(|\btrap\(|\babort\(|sol_panic|panic").is_match(s)
}

/// ERROR_RAISE
fn error_raise(s: &str) -> bool {
    jre!(r"anchor::(Constraint|Account|Require)\w*|error::\w|ProgramError::\w").is_match(s)
}

/// VIPERS_LOG
fn vipers_log(s: &str) -> Option<regex::Captures<'_>> {
    jre!(r#""self\.([a-z_][\w.]*) != (?:self\.([a-z_][\w.]*)|([A-Z][A-Z0-9_]*))""#).captures(s)
}

/// a two-letter account name built on the heap (inlineString wants three): one 16-bit store, the String's length 2
pub fn short_name(t: &str) -> Option<String> {
    let m = jre!(r"\bst16\((\w+), (0x[0-9a-f]{4})\)").captures(t)?;
    let v = &m[1];
    let re = super::jsre(&format!(r"st64\(\w+ \+ 8, 2\)|st64\(\w+ \+ 0x10, {v}, 2\)"));
    if !re.is_match(t) {
        return None;
    }
    let x = parse_hex(&m[2]) as u32;
    let (a, b) = ((x & 0xff) as u8, (x >> 8) as u8);
    if a.is_ascii_lowercase() && b.is_ascii_lowercase() {
        Some(format!("{}{}", a as char, b as char))
    } else {
        None
    }
}

/// TEMP: `^([a-z]{1,2}|v\d+|s[0-9a-f]+|p\d+|r\d|fp|u\d+)$`
fn is_temp(s: &str) -> bool {
    jre!(r"^([a-z]{1,2}|v\d+|s[0-9a-f]+|p\d+|r\d|fp|u\d+)$").is_match(s)
}

fn authority(s: &str) -> bool {
    jre!(r"(?i-u)authority|admin|owner|manager|operator|governor|guardian|upgrade|signer|delegate").is_match(s)
}

fn helper_roles_of(family: &str, ix: &str) -> Option<&'static [&'static str]> {
    if family == "system" {
        return Some(match ix {
            "Transfer" => &["from", "to"],
            "CreateAccount" => &["from", "to"],
            "Assign" => &["account_to_assign"],
            "Allocate" => &["account_to_allocate"],
            _ => return None,
        });
    }
    Some(match ix {
        "Transfer" => &["from", "to", "authority"],
        "TransferChecked" => &["from", "mint", "to", "authority"],
        "MintTo" | "MintToChecked" => &["mint", "to", "authority"],
        "Burn" | "BurnChecked" => &["mint", "from", "authority"],
        "CloseAccount" => &["account", "destination", "authority"],
        "Approve" => &["to", "delegate", "authority"],
        "Revoke" => &["source", "authority"],
        "SetAuthority" => &["current_authority", "account_or_mint"],
        "InitializeAccount3" => &["account", "mint", "authority"],
        "InitializeMint2" => &["mint"],
        "FreezeAccount" | "ThawAccount" => &["account", "mint", "authority"],
        _ => return None,
    })
}

/// the accounts struct of a CPI helper's context
pub fn helper_roles(family: &str, ix: &str) -> Option<&'static [&'static str]> {
    helper_roles_of(family, ix)
}

/// `s.replace(/(^|_)([a-z0-9])/g, (_, _u, c) => c.toUpperCase())`
pub fn pascal(s: &str) -> String {
    let b: Vec<char> = s.chars().collect();
    let cls = |c: char| c.is_ascii_lowercase() || c.is_ascii_digit();
    let mut o = String::with_capacity(s.len());
    let mut i = 0;
    while i < b.len() {
        if i == 0 && cls(b[0]) {
            o.push(b[0].to_ascii_uppercase());
            i += 1;
            continue;
        }
        if b[i] == '_' && i + 1 < b.len() && cls(b[i + 1]) {
            o.push(b[i + 1].to_ascii_uppercase());
            i += 2;
            continue;
        }
        o.push(b[i]);
        i += 1;
    }
    o
}

/// a library path's program: (program, family)
fn helper_program(p: &str) -> (&'static str, &'static str) {
    if p.contains("system") {
        ("SYSTEM_PROGRAM", "system")
    } else if p.contains("token_2022") {
        ("TOKEN_2022_PROGRAM", "token2022")
    } else if p.contains("token_interface") {
        ("TOKEN_PROGRAM|TOKEN_2022_PROGRAM", "token")
    } else {
        ("TOKEN_PROGRAM", "token")
    }
}

/// the operation kinds of a well-known program's instruction
pub fn cpi_kinds(fam: &str, ix: &str) -> Vec<&'static str> {
    let mut k = vec!["CPI"];
    if fam == "token" || fam == "token2022" {
        if ix.starts_with("Transfer") {
            k.push("TOKEN_TRANSFER")
        } else if ix.starts_with("MintTo") {
            k.push("MINT")
        } else if ix.starts_with("Burn") {
            k.push("BURN")
        } else if ix == "CloseAccount" {
            k.push("ACCOUNT_CLOSE")
        } else if ix.starts_with("SetAuthority") || ix.starts_with("Approve") || ix.starts_with("Revoke") {
            k.push("AUTHORITY_WRITE")
        }
    } else if fam == "system" {
        if ix.starts_with("Transfer") {
            k.push("LAMPORT_TRANSFER")
        } else if ix.starts_with("CreateAccount") {
            k.push("ACCOUNT_CREATE")
        } else if ix.starts_with("Assign") {
            k.push("OWNER_ASSIGN")
        } else if ix.starts_with("Allocate") {
            k.push("ACCOUNT_REALLOC")
        }
    }
    k
}

/// Split a dotted path into the account it names and the field; None when no account is involved.
pub fn ref_of(path: &str, types: &IndexMap<String, String>) -> Option<Ref> {
    let seg: Vec<&str> = path.split('.').collect();
    let i = match seg.iter().position(|&s| s == "accounts") {
        Some(i) if i + 1 < seg.len() => i + 1,
        _ => {
            if seg[0] == "input" && seg.get(1).is_some_and(|s| jre!(r"^acc\d+$").is_match(s)) {
                1
            } else {
                0
            }
        }
    };
    let acct0 = seg[i];
    let rest = &seg[i + 1..];
    let t = types.get(seg[0]).map_or("", |s| s.as_str());
    let is_acc = t == "AccountInfo"
        || t == "AccountRecord"
        || t.ends_with("Account")
        || t.ends_with("Data")
        || i > 0
        || jre!(r"_(box|data|acc)$").is_match(acct0)
        || (!rest.is_empty() && ACC_FIELDS.contains(&rest[0]));
    let ctx_t = t.ends_with("Context") || t.ends_with("Accounts") || t.ends_with("Args");
    if !is_acc || (ctx_t && i == 0) {
        return None;
    }
    let acct = jre!(r"_(box|data|acc)$").replace(acct0, "").into_owned();
    Some(Ref {
        acct,
        field: if rest.is_empty() { None } else { Some(rest.join(".")) },
    })
}

/// an input account record (the serialized account), not an AccountInfo
fn is_record(path: &str, types: &IndexMap<String, String>) -> bool {
    jre!(r"^input\.acc\d+$").is_match(path) || (!path.contains('.') && types.get(path).is_some_and(|t| t == "AccountRecord"))
}

/// `stN(...)` line parts: fo of a frame slot text `s<hex>[ + off]`
fn slot_off(x: &str) -> Option<f64> {
    let m = jre!(r"^s([0-9a-f]+)(?: \+ (0x[0-9a-f]+|\d+))?$").captures(js_trim(x))?;
    Some(-parse_hex(&m[1]) + m.get(2).map_or(0.0, |g| js_number(g.as_str())))
}

/// `^\s*(?:const |let )?${v}(?:: \w+)? = (.+)$` on a line: the right-hand side
fn def_rhs<'a>(line: &'a str, v: &str) -> Option<&'a str> {
    let t = line.trim_start_matches(js_ws);
    for pre in ["const ", "let ", ""] {
        let Some(r) = t.strip_prefix(pre) else { continue };
        let Some(r2) = r.strip_prefix(v) else { continue };
        if let Some(r3) = r2.strip_prefix(": ") {
            let w = r3.bytes().take_while(|&c| is_w(c)).count();
            if w > 0 {
                if let Some(rhs) = r3[w..].strip_prefix(" = ") {
                    if !rhs.is_empty() && !rhs.contains('\n') {
                        return Some(rhs);
                    }
                }
            }
        }
        if let Some(rhs) = r2.strip_prefix(" = ") {
            if !rhs.is_empty() && !rhs.contains('\n') {
                return Some(rhs);
            }
        }
    }
    None
}

fn st64_words(lines: &[String], from: i64, to: i64, words: &mut HashMap<super::FK, String>, range: Option<(f64, f64)>) {
    let mut k = from;
    while k < to {
        if let Some(line) = lines.get(k as usize) {
            if let Some(m) = jre!(r"^\s*st64\((s[0-9a-f]+(?: \+ (?:0x[0-9a-f]+|\d+))?), (.*)\)$").captures(line) {
                if let Some(o) = slot_off(&m[1]) {
                    let ok = match range {
                        Some((lo, hi)) => !(o < lo || o >= hi),
                        None => true,
                    };
                    if ok {
                        for (i, y) in m[2].split(", ").enumerate() {
                            words.insert(super::FK::of(o + 8.0 * i as f64), js_trim(y).to_string());
                        }
                    }
                }
            }
        }
        k += 1;
    }
}

struct Fx<'a, 'b> {
    inp: &'b FnInput<'a>,
    facts: RefCell<FnFacts>,
    alias: HashMap<String, Option<String>>,
    label_cont: RefCell<HashMap<Label, bool>>,
    ok_out: Option<Regex>,
}

fn key(n: &SNode) -> NodeKey {
    n as *const SNode
}

impl Fx<'_, '_> {
    fn line(&self, i: i64) -> Option<&str> {
        if i < 0 {
            return None;
        }
        self.inp.lines.get(i as usize).map(|s| s.as_str())
    }
    fn resolve(&self, path0: &str) -> String {
        let mut path = path0.to_string();
        for _ in 0..4 {
            let dot = path.find('.');
            let head = match dot {
                Some(d) => &path[..d],
                None => &path[..],
            };
            let Some(Some(a)) = self.alias.get(head) else { break };
            let t = self.facts.borrow().types.get(head).cloned().unwrap_or_default();
            if (t == "AccountInfo" || t == "AccountRecord") && ref_of(a, &self.facts.borrow().types).is_none() {
                break;
            }
            path = format!("{a}{}", dot.map_or("", |d| &path[d..]));
        }
        path
    }
    fn ref_(&self, path: &str) -> Option<Ref> {
        let r = self.resolve(path);
        ref_of(&r, &self.facts.borrow().types)
    }
    fn line_of(&self, n: &SNode) -> i64 {
        match self.inp.spans.get(&key(n)) {
            Some(s) => (self.inp.at + s.0) as i64,
            None => -1,
        }
    }
    fn text_of(&self, ns: &[SNode], max: usize) -> String {
        let (Some(f), Some(l)) = (ns.first(), ns.last()) else {
            return String::new();
        };
        let (Some(a), Some(b)) = (self.inp.spans.get(&key(f)), self.inp.spans.get(&key(l))) else {
            return String::new();
        };
        let at = self.inp.at;
        let lo = at + a.0;
        let hi = (at + b.1).min(at + a.0 + max).min(self.inp.lines.len());
        if lo >= hi {
            return String::new();
        }
        self.inp.lines[lo..hi].join("\n")
    }
    fn top_text(&self, ns: &[SNode], max: usize) -> String {
        let mut out: Vec<&str> = Vec::new();
        for n in ns {
            if matches!(n, SNode::If { .. } | SNode::Block { .. } | SNode::Loop { .. } | SNode::Switch { .. }) {
                continue;
            }
            if let Some(sp) = self.inp.spans.get(&key(n)) {
                let mut i = sp.0;
                while i < sp.1 && out.len() < max {
                    out.push(self.inp.lines.get(self.inp.at + i).map_or("", |s| s.as_str()));
                    i += 1;
                }
            }
        }
        out.join("\n")
    }
    fn lead_text(&self, ns: &[SNode]) -> String {
        let mut out: Vec<&str> = Vec::new();
        for n in ns {
            if matches!(n, SNode::If { .. } | SNode::Block { .. } | SNode::Loop { .. } | SNode::Switch { .. }) {
                break;
            }
            if let Some(sp) = self.inp.spans.get(&key(n)) {
                let mut i = sp.0;
                while i < sp.1 && out.len() < 40 {
                    out.push(self.inp.lines.get(self.inp.at + i).map_or("", |s| s.as_str()));
                    i += 1;
                }
            }
        }
        out.join("\n")
    }
    fn first_pc(&self, ns: &[SNode]) -> Option<i64> {
        for n in ns {
            match n {
                SNode::Stmt(si) => return Some(stmt_pc(self.inp.tree.stmt(*si))),
                SNode::If { then, els, .. } => {
                    if let Some(p) = self.first_pc(then) {
                        return Some(p);
                    }
                    if let Some(p) = self.first_pc(els) {
                        return Some(p);
                    }
                }
                SNode::Block { body, .. } | SNode::Loop { body, .. } => {
                    if let Some(p) = self.first_pc(body) {
                        return Some(p);
                    }
                }
                _ => {}
            }
        }
        None
    }
    fn exits(&self, ns: &[SNode], cont: bool) -> bool {
        let Some(n) = ns.last() else { return cont };
        match n {
            SNode::Return(_) | SNode::Trap(_) => true,
            SNode::Stmt(si) => {
                let s = self.inp.tree.stmt(*si);
                matches!(s, Stmt::Trap { .. })
                    || matches!(s, Stmt::Call { t: CallTarget::Fn { pc }, .. } if (self.inp.noreturn)(*pc))
                    || cont
            }
            SNode::Break(l) => match l {
                Some(l) => self.label_cont.borrow().get(l).copied().unwrap_or(false),
                None => false,
            },
            SNode::If { then, els, .. } => self.exits(then, cont) && self.exits(els, cont),
            SNode::Block { label, body } => {
                self.label_cont.borrow_mut().insert(*label, cont);
                self.exits(body, cont)
            }
            SNode::SetState { .. } => cont,
            _ => false,
        }
    }
    fn callees_of(&self, s: &Stmt) -> Vec<i64> {
        let ir = self.inp.ir;
        let mut out = Vec::new();
        if let Stmt::Call { t: CallTarget::Fn { pc }, .. } = s {
            out.push(*pc);
        }
        for e in stmt_exprs(ir, s) {
            ir.walk(e, &mut |_, x| {
                if let Node::Call(t, _) = x {
                    if let CallTarget::Fn { pc } = ir.target(t) {
                        out.push(pc);
                    }
                }
            });
        }
        out
    }
    fn expr_callees(&self, e: E) -> Vec<i64> {
        let ir = self.inp.ir;
        let mut out = Vec::new();
        ir.walk(e, &mut |_, x| {
            if let Node::Call(t, _) = x {
                if let CallTarget::Fn { pc } = ir.target(t) {
                    out.push(pc);
                }
            }
        });
        out
    }

    /// The seeds of one PDA signer built in the frame before line l.
    fn signer_seeds(&self, v: Option<&str>, l: i64) -> Option<String> {
        let at = self.inp.at as i64;
        let mut words: HashMap<super::FK, String> = HashMap::new();
        st64_words(self.inp.lines, at.max(l - 120), l, &mut words, None);
        let s = v.and_then(slot_off);
        let get = |o: f64| words.get(&super::FK::of(o));
        let p = s.and_then(|s| get(s));
        let n = match s {
            Some(s) => get(s + 8.0).map_or(f64::NAN, |x| js_number(x)),
            None => f64::NAN,
        };
        let a = p.and_then(|p| slot_off(p));
        let a = a?;
        if !(n > 0.0 && n <= 16.0) {
            return None;
        }
        let mut out: Vec<String> = Vec::new();
        let mut i = 0.0;
        while i < n {
            let (Some(pa), Some(len)) = (get(a + 16.0 * i), get(a + 16.0 * i + 8.0)) else {
                return None;
            };
            let lit = if jre!(r"^0x[0-9a-f]+$").is_match(pa) && jre!(r"^(0x[0-9a-f]+|\d+)$").is_match(len) {
                match (big_of(pa), big_of(len)) {
                    (Some(x), Some(y)) => (self.inp.str_at)(x, y),
                    _ => None,
                }
            } else {
                None
            };
            out.push(match lit {
                Some(l) if !l.is_empty() && l.chars().all(|c| (' '..='~').contains(&c)) => json_str(&l),
                _ => {
                    if len == "1" || len == "0x1" {
                        "(1 bytes)".into()
                    } else {
                        format!("*{pa}")
                    }
                }
            });
            i += 1.0;
        }
        Some(format!("[{}]", out.join(", ")))
    }

    fn def_in(&self, v: &str, l: i64) -> Option<String> {
        let at = self.inp.at as i64;
        let mut k = l - 1;
        while k >= at && k > l - 400 {
            if let Some(line) = self.line(k) {
                if let Some(r) = def_rhs(line, v) {
                    return Some(js_trim(r).to_string());
                }
            }
            k -= 1;
        }
        None
    }

    fn key_acct(&self, v0: Option<&str>, l: i64) -> Option<String> {
        let mut v: Option<String> = v0.map(|s| s.to_string());
        for _ in 0..4 {
            let Some(vv) = v.clone() else { break };
            if vv.is_empty() || !vv.bytes().all(is_w) {
                break;
            }
            let d = self.def_in(&vv, l);
            let km = d.as_deref().and_then(|d| jre!(r"^([A-Za-z_]\w*)\.key$").captures(d).map(|m| m[1].to_string()));
            if let Some(x) = km {
                let xd = self.def_in(&x, l);
                let am = xd.as_deref().and_then(|xd| {
                    jre!(r"^(?:ld64\()?(?:accounts|\w+)\.([a-z_][a-z0-9_]*)\)?$").captures(xd).map(|m| m[1].to_string())
                });
                return match am {
                    Some(a) => Some(a),
                    None => {
                        if is_temp(&x) {
                            None
                        } else {
                            Some(self.ref_(&x).map_or(x.clone(), |r| r.acct))
                        }
                    }
                };
            }
            v = d;
        }
        None
    }

    fn cpi_context(&self, ctx: &str, l: i64, roles: &[&str]) -> Option<(Vec<PartAcc>, Option<String>)> {
        let y = slot_off(ctx)?;
        let at = self.inp.at as i64;
        let mut words: HashMap<super::FK, String> = HashMap::new();
        st64_words(self.inp.lines, at.max(l - 120), l, &mut words, Some((y, y + 512.0)));
        let get = |o: f64| words.get(&super::FK::of(o)).cloned();
        let mut infos: Vec<Option<String>> = Vec::new();
        let cap = 1 + if roles.is_empty() { 11 } else { roles.len() };
        let mut o = y + 24.0;
        while let Some(w) = get(o) {
            if infos.len() >= cap {
                break;
            }
            infos.push(self.key_acct(Some(&w), l));
            o += 48.0;
        }
        if infos.len() < 2 {
            return None;
        }
        let accts = &infos[1..];
        let base = y + 24.0 + 48.0 * infos.len() as f64;
        let seed_len = get(base + 8.0);
        let accounts = accts
            .iter()
            .enumerate()
            .map(|(i, a)| {
                let role = roles.get(i).map_or(format!("account{i}"), |r| r.to_string());
                let s = matches!(roles.get(i).copied(), Some("authority" | "from" | "current_authority"));
                PartAcc {
                    role: Some(role),
                    text: a.clone().unwrap_or_else(|| "?".into()),
                    w: None,
                    s: if s { Some(1.0) } else { None },
                }
            })
            .collect();
        let seeds = match seed_len {
            Some(sl) if !(sl == "0" || sl == "0x0") => {
                let x = if sl == "1" { self.signer_seeds(get(base).as_deref(), l) } else { None };
                Some(x.unwrap_or_else(|| format!("? ({sl} seeds)")))
            }
            _ => None,
        };
        Some((accounts, seeds))
    }

    fn helper_call(&self, n: &SNode, callee: i64, main: bool, err: bool) {
        let path = (self.inp.callee_path)(callee).unwrap_or_default();
        let l = self.line_of(n);
        let t = self.line(l).map_or(String::new(), |s| js_trim(s).to_string());
        let stmt_pc_of = |n: &SNode| match n {
            SNode::Stmt(si) => Some(stmt_pc(self.inp.tree.stmt(*si))),
            _ => None,
        };
        if let Some(h) = jre!(r"^(anchor_lang::system_program|anchor_spl::(?:token|token_2022|token_interface))::(\w+)$").captures(&path) {
            let (program, family) = helper_program(&h[1]);
            let ix = pascal(&h[2]);
            let amount = jre!(r"^(?:(?:const |let )?\w+ = )?\w+\(([^,]*), ([^,]*), (.*)\)$")
                .captures(&t)
                .map(|m| m[3].to_string());
            let ctx_arg = jre!(r"\w+\(([^,]*), ([^,]*)[,)]").captures(&t).map_or(String::new(), |m| m[2].to_string());
            let roles: &[&str] = helper_roles_of(family, &ix).unwrap_or(&[]);
            let ctx = self.cpi_context(&ctx_arg, l, roles);
            let accounts = ctx.as_ref().map_or(vec![], |c| c.0.clone());
            let seeds = ctx.as_ref().and_then(|c| c.1.clone());
            let fields = match &amount {
                Some(a) if !a.is_empty() => vec![(if family.starts_with("system") { "lamports" } else { "amount" }.to_string(), a.clone())],
                _ => vec![],
            };
            let cpi = OpCpi {
                program: program.into(),
                known: if program.contains('|') { None } else { Some(program.into()) },
                checked: None,
                accounts: accounts.clone(),
                fields,
                seeds: seeds.clone(),
                src: None,
                family: Some(family.into()),
                ix: Some(ix.clone()),
            };
            let text = format!(
                "CPI {program}.{ix}{}{} [lib: {path}]",
                if accounts.is_empty() {
                    String::new()
                } else {
                    format!(
                        " {{ {} }}",
                        accounts.iter().map(|x| format!("{}: {}", x.role.clone().unwrap_or_default(), x.text)).collect::<Vec<_>>().join(", ")
                    )
                },
                if seeds.is_some() { " (PDA-signed)" } else { "" }
            );
            let mut kinds = cpi_kinds(family, &ix);
            if seeds.is_some() {
                kinds.push("PDA_SIGNATURE");
            }
            let mut f = self.facts.borrow_mut();
            let prev = f.ops.iter_mut().find(|o| o.line == l + 1 && o.kinds.contains(&"CPI") && o.cpi.as_ref().is_none_or(|c| c.ix.is_none()));
            if let Some(prev) = prev {
                let old = prev.cpi.take().unwrap_or_default();
                let accs = if !cpi.accounts.is_empty() { cpi.accounts.clone() } else { old.accounts.clone() };
                prev.cpi = Some(OpCpi {
                    program: cpi.program,
                    known: cpi.known,
                    checked: old.checked,
                    accounts: accs,
                    fields: cpi.fields,
                    seeds: cpi.seeds,
                    src: old.src,
                    family: cpi.family,
                    ix: cpi.ix,
                });
                let mut ks: Vec<&'static str> = Vec::new();
                for k in kinds.iter().chain(prev.kinds.iter()) {
                    if !ks.contains(k) {
                        ks.push(k);
                    }
                }
                prev.kinds = ks;
                prev.text = text;
            } else {
                let mut op = Op::new(l + 1, stmt_pc_of(n), kinds, text, main, err);
                op.cpi = Some(cpi);
                f.ops.push(op);
            }
            return;
        }
        if let Some(b) = jre!(r"^(solana_program::system_instruction|solana_system_interface::instruction|spl_token(?:_2022)?::instruction)::(\w+)$").captures(&path) {
            let (program, family) = helper_program(&b[1]);
            let call = stmt_pc_of(n).map(|pc| (self.inp.pc, pc));
            self.facts.borrow_mut().ix_hints.push(IxHint {
                line: l + 1,
                program: program.into(),
                family: family.into(),
                ix: pascal(&b[2]),
                how: path.clone(),
                call,
            });
            return;
        }
        if path.ends_with("TokenInstruction::pack") || (self.inp.callee_name)(callee).starts_with("TokenInstruction_pack") {
            let Some(me) = jre!(r"\(([^,]+), ([^,)]+)\)$").captures(&t).map(|m| js_trim(&m[2]).to_string()) else {
                return;
            };
            if me.is_empty() {
                return;
            }
            let re = super::jsre(&format!(r"^\s*st(?:8|16|32)\({}, (0x[0-9a-f]+|\d+)\b", regex::escape(&me)));
            let mut k = l - 1;
            while k >= 0.max(l - 40) {
                if let Some(m) = self.line(k).and_then(|x| re.captures(x)) {
                    let tag = js_number(&m[1]);
                    let ix = if tag >= 0.0 && tag.fract() == 0.0 && tag < 1e15 { crate::cpi::token_ix_name(tag as u64) } else { None };
                    if let Some(ix) = ix {
                        self.facts.borrow_mut().ix_hints.push(IxHint {
                            line: l + 1,
                            program: "TOKEN_PROGRAM".into(),
                            family: "token".into(),
                            ix: ix.into(),
                            how: format!("TokenInstruction::pack (tag {})", js_num(tag)),
                            call: None,
                        });
                    }
                    break;
                }
                k -= 1;
            }
        }
    }

    fn site(&self, n: &SNode, main: bool, err: bool) {
        let Some(s) = self.inp.sites.get(&key(n)) else { return };
        let l = self.line_of(n);
        let pc = match n {
            SNode::Stmt(si) => Some(stmt_pc(self.inp.tree.stmt(*si))),
            _ => None,
        };
        let text = match &s.desc {
            Some(d) => d.text.clone(),
            None => self.line(l).map_or(String::new(), |x| js_trim(x).to_string()),
        };
        let ir = self.inp.ir;
        if s.pda {
            let mut pda = match jre!(r"^PDA (\w+)\((.*), program (.*)\)$").captures(&text) {
                Some(m) => Pda {
                    fn_: m[1].into(),
                    seeds: m[2].into(),
                    program: m[3].into(),
                },
                None => Pda {
                    fn_: "find_program_address".into(),
                    seeds: "?".into(),
                    program: "?".into(),
                },
            };
            let c = match n {
                SNode::Stmt(si) => call_of(ir, self.inp.tree.stmt(*si)),
                _ => None,
            };
            if pda.seeds.starts_with('?') {
                if let Some((_, args)) = c {
                    let av: Vec<E> = ir.to_vec(args);
                    if let (Some(Node::Const(a1)), Some(Node::Const(a2))) = (av.get(1).map(|&e| ir.get(e)), av.get(2).map(|&e| ir.get(e))) {
                        if let Some(seeds) = (self.inp.seeds_at)(a1, a2) {
                            pda.seeds = seeds;
                            if pda.program == "?" {
                                let t = self.line(l).map_or(String::new(), |x| js_trim(x).to_string());
                                pda.program = jre!(r", (\w+)\)$").captures(&t).map_or("?".into(), |m| m[1].to_string());
                            }
                        }
                    }
                }
            }
            let mut op = Op::new(l + 1, pc, vec!["PDA_DERIVE"], text, main, err);
            op.pda = Some(pda);
            self.facts.borrow_mut().ops.push(op);
            return;
        }
        let d = s.desc.as_ref();
        let known = d.and_then(|d| d.parts.as_ref()).and_then(|p| p.known.clone()).unwrap_or_default();
        let mut kinds = cpi_kinds(
            d.and_then(|d| d.family.as_deref()).unwrap_or(""),
            d.and_then(|d| d.ix.as_deref()).unwrap_or(""),
        );
        if known.contains("UPGRADEABLE") {
            kinds.push("PROGRAM_UPGRADE");
        }
        let signed = match d {
            Some(d) => d.parts.as_ref().and_then(|p| p.seeds.as_ref()).is_some_and(|s| !s.is_empty()),
            None => {
                let mut sig = false;
                let mut from = 0;
                while let Some(i) = text[from..].find("signer seeds ") {
                    let j = from + i + 13;
                    if !text[j..].starts_with("[]") {
                        sig = true;
                        break;
                    }
                    from = from + i + 1;
                }
                sig && !text.contains("no signer seeds")
            }
        };
        if signed || jre!(r"(\b|_)invoke_signed(_unchecked)?(_[0-9a-f]+)?\(").is_match(self.line(l).unwrap_or("")) {
            kinds.push("PDA_SIGNATURE");
        }
        let ret = match n {
            SNode::Return(Some(e)) => Some(*e),
            _ => None,
        };
        let text2 = if text.is_empty() {
            format!(
                "CPI (instruction not decoded): {}",
                self.line(l).map_or("undefined".to_string(), |x| js_trim(x).to_string())
            )
        } else {
            text
        };
        let mut op = Op::new(l + 1, pc, kinds, text2, main, err);
        op.ret = ret;
        op.cpi = d.and_then(|d| {
            d.parts.as_ref().map(|p: &CpiParts| OpCpi {
                program: p.program.clone(),
                known: p.known.clone(),
                checked: p.checked.clone(),
                accounts: p.accounts.clone(),
                fields: p.fields.clone(),
                seeds: p.seeds.clone(),
                src: p.src.clone(),
                family: d.family.clone(),
                ix: d.ix.clone(),
            })
        });
        op.via = s.via.clone();
        self.facts.borrow_mut().ops.push(op);
    }

    /// a DataCell length store next to a store of a moved slice pointer
    fn slice_advance(&self, l: i64, lhs: &str) -> bool {
        let b = jre!(r"\.(len|f0x20_u64)$").replace(lhs, "").into_owned();
        if b == lhs {
            return false;
        }
        let e = regex::escape(&b);
        let ptr = format!(r"(?:{e}\.(?:ptr|f0x18_u64)|ld64\({e} \+ 0x18\))");
        let re = super::jsre(&format!(r"^(?:{e}\.(?:ptr|f0x18_u64) = (?:(\w+)$)?|st64\({e} \+ 0x18, (?:(\w+)\)$)?)"));
        for k in l - 2..=l + 2 {
            if k == l {
                continue;
            }
            let t = self.line(k).map_or("", js_trim);
            let Some(m) = re.captures(t) else { continue };
            let v = m.get(1).or(m.get(2)).map(|x| x.as_str().to_string());
            let Some(v) = v else { return true };
            if v.is_empty() {
                return true;
            }
            let dre = super::jsre(&format!(r"^\s*(?:const |let )?{v}(?:: \w+)? = {ptr}$"));
            let lo = (k - 12).max(0);
            let mut any = false;
            let mut x = lo;
            while x < k {
                if let Some(line) = self.line(x) {
                    if dre.is_match(line) {
                        any = true;
                        break;
                    }
                }
                x += 1;
            }
            if !any {
                return true;
            }
        }
        false
    }

    fn store(&self, n: &SNode, main: bool, err: bool) {
        let SNode::Stmt(si) = n else { return };
        let s = self.inp.tree.stmt(*si);
        let is_cs = matches!(s, Stmt::Call { .. } | Stmt::Set { .. } | Stmt::Copy { .. });
        if !is_cs && !matches!(s, Stmt::Store { .. } | Stmt::Stores { .. }) {
            return;
        }
        let pc = stmt_pc(s);
        let l = self.line_of(n);
        let t = self.line(l).map_or(String::new(), |x| js_trim(x).to_string());
        let ir = self.inp.ir_store.and_then(|f| f(*si));
        if is_cs {
            if let Some(ir) = ir.as_ref().filter(|x| x.field.as_ref().is_some_and(|f| !f.is_empty())) {
                let a = jre!(r"\(([^,]+), ([^,]+), ([^)]+)\)").captures(&t);
                let value = if t.contains("memset") {
                    a.as_ref().map_or("?".to_string(), |m| m[2].to_string())
                } else {
                    a.as_ref().map_or("?".to_string(), |m| format!("bytes at {}", &m[2]))
                };
                let mut op = Op::new(l + 1, Some(pc), vec!["ACCOUNT_DATA_WRITE"], t.clone(), main, err);
                op.target = Some(Ref {
                    acct: format!("account[{}]", ir.index),
                    field: ir.field.clone(),
                });
                op.how = Some("=");
                op.value = Some(value);
                self.facts.borrow_mut().ops.push(op);
            }
            return;
        }
        if let Some(ir) = ir.as_ref().filter(|x| x.field.as_ref().is_some_and(|f| !f.is_empty())) {
            let field = ir.field.clone().unwrap();
            let v = match jre!(r"^st(?:8|16|32|64)\((.*)\)$").captures(&t) {
                Some(m) => m[1].split(", ").skip(1).collect::<Vec<_>>().join(", "),
                None => match jre!(r"^[\w.[\]]+ = (.*?)(?: //.*)?$").captures(&t) {
                    Some(m) => m[1].to_string(),
                    None => t.clone(),
                },
            };
            let mut kinds: Vec<&'static str> = match field.as_str() {
                "lamports" => vec!["LAMPORT_WRITE"],
                "owner" => vec!["OWNER_ASSIGN"],
                "data_len" => vec!["ACCOUNT_REALLOC"],
                _ => vec!["ACCOUNT_DATA_WRITE"],
            };
            if field == "lamports" && (v == "0" || v == "0x0") {
                kinds.push("ACCOUNT_CLOSE");
            }
            let dre = jre!(r"^data\[(\d+)\.\.(\d+)\]$");
            let acct = format!("account[{}]", ir.index);
            let mut f = self.facts.borrow_mut();
            let r = dre.captures(&field).map(|m| (m[1].to_string(), m[2].to_string()));
            if let Some(prev) = f.ops.last_mut() {
                let pr = if prev.line == l
                    && prev.target.as_ref().is_some_and(|x| x.acct == acct)
                    && v.starts_with("ld64(")
                    && prev.value.as_deref().unwrap_or("").starts_with("ld64(")
                {
                    prev.target.as_ref().and_then(|x| x.field.as_deref()).and_then(|x| dre.captures(x)).map(|m| (m[1].to_string(), m[2].to_string()))
                } else {
                    None
                };
                if let (Some(r), Some(pr)) = (&r, &pr) {
                    if r.0 == pr.1 || r.1 == pr.0 {
                        prev.target.as_mut().unwrap().field = Some(if r.0 == pr.1 {
                            format!("data[{}..{}]", pr.0, r.1)
                        } else {
                            format!("data[{}..{}]", r.0, pr.1)
                        });
                        prev.line = l + 1;
                        return;
                    }
                }
            }
            let mut op = Op::new(l + 1, Some(pc), kinds, t.clone(), main, err);
            op.target = Some(Ref { acct, field: Some(field) });
            op.how = Some(ir.how.unwrap_or("="));
            op.value = Some(v);
            f.ops.push(op);
            return;
        }
        let Some(m) = jre!(r"^([A-Za-z_][\w]*(?:\.[A-Za-z_]\w*|\[\d+\])+) = (.*?)(?: //.*)?$").captures(&t) else {
            let Some(d) = jre!(r"^st(8|16|32|64)\(([A-Za-z_][\w.]*)\.data(?: \+ (0x[0-9a-f]+|\d+))?(?: /\*[^*]*\*/)?, (.*)\)$").captures(&t) else {
                return;
            };
            let r = ref_of(&format!("{}.data", self.resolve(&d[2])), &self.facts.borrow().types);
            let Some(r) = r else { return };
            if !matches!(s, Stmt::Store { .. }) {
                return;
            }
            let off = d.get(3).map_or(0.0, |x| js_number(x.as_str()));
            let z = js_number(&d[1]) / 8.0;
            let field = format!("data[{}..{}]", js_num(off), js_num(off + z));
            let pat = format!(
                r"^ld{}\({}\.data{}\) ([-+]) ",
                &d[1],
                d[2].replace('.', r"\."),
                d.get(3).map_or(String::new(), |x| format!(r" \+ {}", x.as_str()))
            );
            let me = super::jsre(&pat).captures(&d[4]).map(|x| x[1].to_string());
            let mut op = Op::new(l + 1, Some(pc), vec!["ACCOUNT_DATA_WRITE"], t.clone(), main, err);
            op.target = Some(Ref { acct: r.acct, field: Some(field) });
            op.how = Some(match me.as_deref() {
                Some("+") => "+=",
                Some(_) => "-=",
                None => "=",
            });
            op.value = Some(d[4].to_string());
            self.facts.borrow_mut().ops.push(op);
            return;
        };
        let lv = self.resolve(&m[1]);
        let rhs = m[2].to_string();
        if jre!(r"\.(borrow|strong|weak|dup_marker)$").is_match(&lv) {
            return;
        }
        if jre!(r"\.(lamports|data)\.f0x[0-9a-f]+_\w+$").is_match(&lv) {
            return;
        }
        let Some(r) = ref_of(&lv, &self.facts.borrow().types) else { return };
        let how = if rhs.starts_with(&format!("{} - ", &m[1])) || rhs.starts_with(&format!("{lv} - ")) {
            "-="
        } else if rhs.starts_with(&format!("{} + ", &m[1])) || rhs.starts_with(&format!("{lv} + ")) {
            "+="
        } else {
            "="
        };
        let mut kinds: Vec<&'static str> = Vec::new();
        let f = r.field.clone().unwrap_or_default();
        if jre!(r"^lamports\b").is_match(&f) || jre!(r"\.lamports(\.|$)").is_match(&lv) {
            let rec = lv.ends_with(".lamports") && is_record(&lv[..lv.len() - 9], &self.facts.borrow().types);
            if !jre!(r"\.lamports\.value(\.amount)?$").is_match(&lv) && !rec {
                return;
            }
            kinds.push("LAMPORT_WRITE");
        } else if f == "data.ptr" || f == "data.f0x18_u64" {
            return;
        } else if f == "data_len" || f == "data.len" {
            if self.slice_advance(l, &m[1]) {
                return;
            }
            kinds.push("ACCOUNT_REALLOC");
        } else if jre!(r"^(key|owner|is_signer|is_writable|executable|rent_epoch|data|original_data_len)$").is_match(&f) {
            return;
        } else if jre!(r"^info(\.|$)").is_match(&f) {
            return;
        } else {
            kinds.push("ACCOUNT_DATA_WRITE");
            if authority(f.split('.').next_back().unwrap_or("")) {
                kinds.push("AUTHORITY_WRITE");
            }
        }
        if kinds[0] == "LAMPORT_WRITE" && how == "=" && jre!(r"^0x0*0?$|^0$").is_match(&rhs) {
            kinds.push("ACCOUNT_CLOSE");
        }
        let mut op = Op::new(l + 1, Some(pc), kinds, t.clone(), main, err);
        op.target = Some(Ref {
            acct: r.acct,
            field: r.field.map(|x| jre!(r"^lamports\..*").replace(&x, "lamports").into_owned()),
        });
        op.how = Some(how);
        op.value = Some(rhs);
        self.facts.borrow_mut().ops.push(op);
    }

    /// the custom error code a failing side raises through the program's error constructor
    fn custom_err_call(&self, ns: &[SNode]) -> Option<i64> {
        let ir = self.inp.ir;
        let mut r: Option<i64> = None;
        fn visit(fx: &Fx, ir: &Ir, xs: &[SNode], d: u32, r: &mut Option<i64>) {
            for x in xs.iter().take(12) {
                if r.is_some() {
                    return;
                }
                match x {
                    SNode::Stmt(si) => {
                        if let Some((CallTarget::Fn { pc }, args)) = call_of(ir, fx.inp.tree.stmt(*si)) {
                            if (fx.inp.custom_error)(pc) {
                                if let Some(Node::Const(v)) = ir.to_vec(args).get(1).map(|&e| ir.get(e)) {
                                    if v < 0x400 {
                                        *r = Some(6000 + v as i64);
                                    }
                                }
                            }
                        }
                    }
                    SNode::Block { body, .. } if d < 2 => visit(fx, ir, body, d + 1, r),
                    SNode::If { then, els, .. } if d < 2 => {
                        let mut v: Vec<SNode> = then.clone();
                        v.extend(els.iter().cloned());
                        // (the concatenation copies nodes: statements are looked up by index only)
                        visit(fx, ir, &v, d + 1, r)
                    }
                    _ => {}
                }
            }
        }
        visit(self, ir, ns, 0, &mut r);
        r
    }

    #[allow(clippy::too_many_arguments)]
    fn check(&self, n: &SNode, fail_nodes: &[SNode], fails_if: bool, main: bool, before: Option<i64>, pass_nodes: &[SNode]) {
        let SNode::If { c, .. } = n else { return };
        let c = *c;
        let ir = self.inp.ir;
        let l = self.line_of(n);
        let hl = self.line(l).unwrap_or("");
        let if_re = jre!(r"^\s*(?:\} else )?if \((.*)\) \{$");
        let cond = match if_re.captures(hl).or_else(|| if_re.captures(self.line(l + 1).unwrap_or(""))) {
            Some(m) => m[1].to_string(),
            None => "?".into(),
        };
        let ft = format!("{}\n{}", self.top_text(fail_nodes, 80), self.text_of(fail_nodes, 60));
        let mut kinds: Vec<&'static str> = Vec::new();
        let add = |kinds: &mut Vec<&'static str>, k: &'static str| {
            if !kinds.contains(&k) {
                kinds.push(k)
            }
        };
        let mut refs: Vec<Ref> = Vec::new();
        let clean = jre!(r#""(?:[^"\\]|\\.)*""#).replace_all(&cond, "\"\"").into_owned();
        for pm in jre!(r"\b([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+)").captures_iter(&clean) {
            let Some(r) = self.ref_(&pm[1]) else { continue };
            if !refs.iter().any(|x| x.acct == r.acct && x.field == r.field) {
                refs.push(r.clone());
            }
            let f0 = r.field.as_deref().map_or("", |f| f.split('.').next().unwrap_or(""));
            if let Some(k) = field_kind(f0) {
                add(&mut kinds, k);
            } else if r.field.is_some() && !ACC_FIELDS.contains(&f0) {
                add(&mut kinds, "state");
            }
        }
        let tag_cmp = {
            let mut e = c;
            while let Node::Lnot(a) = ir.get(e) {
                e = a;
            }
            match ir.get(e) {
                Node::Cmp(CmpOp::Eq | CmpOp::Ne, a, b) => [a, b].iter().any(|&y| matches!(ir.get(y), Node::Const(v) if v < 0x100)),
                _ => false,
            }
        };
        let mut tag_ref = false;
        if let Some(f) = self.inp.ir_refs {
            for x in f(c, self.first_pc(fail_nodes), self.first_pc(pass_nodes)) {
                let fl = x.as_deref().unwrap_or("");
                if let Some(k) = field_kind(fl) {
                    add(&mut kinds, k);
                } else if tag_cmp && x.as_deref() == Some("data[0..1]") {
                    tag_ref = true;
                }
            }
        }
        if jre!(r"\bkeyeq\(|(?:memeq|memcmp)\((?:[^()]|\([^()]*\))*, 0x20\)").is_match(&clean) && !kinds.contains(&"owner") {
            add(&mut kinds, "key");
        }
        let lead = self.lead_text(fail_nodes);
        let log_rel = vipers_log(&lead).map(|lr| (lr[1].to_string(), lr.get(2).or(lr.get(3)).map_or(String::new(), |x| x.as_str().to_string())));
        if log_rel.is_some() {
            add(&mut kinds, "key");
        }
        let mut error = String::new();
        let cm2 = jre!(r"\berror::(\w+)").find(&ft).map(|m| m.as_str().to_string());
        let ams: Vec<String> = jre!(r"anchor::(\w+)").captures_iter(&ft).map(|x| x[1].to_string()).collect();
        let ak = ams.iter().find(|x| anchor_kind(x).is_some()).cloned();
        let ce = if cm2.is_some() { None } else { self.custom_err_call(fail_nodes) };
        if let Some(cm2) = cm2 {
            error = cm2;
            add(&mut kinds, "custom");
        } else if let Some(ce) = ce {
            error = format!("error {ce}");
            add(&mut kinds, "custom");
        } else if let Some(ak) = ak {
            let k = anchor_kind(&ak).unwrap();
            error = format!("anchor::{ak}");
            add(&mut kinds, k);
            if k == "zero" {
                add(&mut kinds, "discriminator");
            }
        } else if !ams.is_empty() {
            error = format!("anchor::{}", ams[0]);
        } else if let Some(em) = jre!(r"\b(Err\([^)]*\)?\))").find(&ft).or_else(|| jre!(r"ProgramError::(\w+)").find(&ft)) {
            error = em.as_str().to_string();
        }
        if error.is_empty() {
            error = if jre!(r"\btrap\(|\babort\(|panic").is_match(&ft) || matches!(fail_nodes.last(), Some(SNode::Trap(_))) {
                "abort".into()
            } else {
                "return".into()
            };
        }
        if tag_ref && jre!(r"InvalidAccountData|UninitializedAccount|AccountAlreadyInitialized|InvalidAccountOwner|IncorrectProgramId|^error").is_match(&error) {
            add(&mut kinds, "discriminator");
        }
        if kinds.is_empty() && error.contains("MissingRequiredSignature") {
            add(&mut kinds, "signer");
        }
        if !kinds.contains(&"initialized") && (error.contains("AccountAlreadyInitialized") || error.contains("UninitializedAccount")) {
            add(&mut kinds, "initialized");
        }
        let nm = jre!(r#"Error_with_account_name\([^\n]*?"(\w+)""#).captures(&ft).map(|m| m[1].to_string());
        let sm = if nm.is_none() && self.inp.anchor {
            jre!(r#"\b\w+\([^\n]*?, "([a-z_][a-z0-9_]*)", (0x[0-9a-f]+|\d+)\)"#)
                .captures_iter(&ft)
                .find(|x| js_number(&x[2]) == u16len(&x[1]) as f64)
                .map(|x| x[1].to_string())
        } else {
            None
        };
        let named = if nm.is_some() {
            nm
        } else if sm.is_some() {
            sm
        } else if self.inp.anchor && u16len(&ft) < 4000 {
            inline_string(ir, self.inp.tree, fail_nodes).or_else(|| short_name(&ft))
        } else {
            None
        };
        let cmp32 = kinds.is_empty() && named.is_none() && self.inp.ir_cmp.is_some_and(|f| f(c, self.first_pc(fail_nodes), self.first_pc(pass_nodes)));
        if kinds.is_empty() && named.is_none() && !cmp32 {
            return;
        }
        let mut ac = c;
        while let Node::Lnot(a) = ir.get(ac) {
            ac = a;
        }
        if let Node::Cmp(CmpOp::Eq | CmpOp::Ne, a, b) = ir.get(ac) {
            if ir.get(b) == Node::Const(0) {
                if let Node::Bin(BinOp::And, _, m) = ir.get(a) {
                    if matches!(ir.get(m), Node::Const(1 | 3 | 7 | 15)) && !error.contains("::") {
                        return;
                    }
                }
            }
        }
        let pc = self.first_pc(fail_nodes);
        let pubkeys = self.inp.anchor && jre!(r"\bError_with_pubkeys\(").is_match(&ft);
        let pass_pc = self.first_pc(pass_nodes);
        self.facts.borrow_mut().checks.push(Check {
            line: l + 1,
            pc,
            cond,
            fails_if,
            error,
            kinds,
            refs,
            named,
            main,
            before,
            via: None,
            c: Some(c),
            pass_pc,
            cmp32,
            log_rel,
            pubkeys,
        });
    }

    fn cond_lines(&self, c: E, l: i64) {
        let ir = self.inp.ir;
        {
            let mut f = self.facts.borrow_mut();
            if !f.cond_line.contains_key(&c) {
                f.cond_line.insert(c, l);
            }
        }
        match ir.get(c) {
            Node::Lnot(a) => self.cond_lines(a, l),
            Node::Land(a, b) | Node::Lor(a, b) => {
                self.cond_lines(a, l);
                self.cond_lines(b, l);
            }
            _ => {}
        }
    }

    fn span(&self, ns: &[SNode]) -> i64 {
        let (Some(f), Some(l)) = (ns.first(), ns.last()) else { return 0 };
        match (self.inp.spans.get(&key(f)), self.inp.spans.get(&key(l))) {
            (Some(a), Some(b)) => b.1 as i64 - a.0 as i64,
            _ => 0,
        }
    }
    fn first_mark(&self, ns: &[SNode]) -> f64 {
        let Some(s0) = ns.first().and_then(|n| self.inp.spans.get(&key(n))) else {
            return f64::INFINITY;
        };
        for n in ns {
            if matches!(n, SNode::If { .. } | SNode::Block { .. } | SNode::Loop { .. } | SNode::Switch { .. }) {
                continue;
            }
            if let Some(sp) = self.inp.spans.get(&key(n)) {
                for i in sp.0..sp.1 {
                    if error_mark(self.inp.lines.get(self.inp.at + i).map_or("undefined", |s| s.as_str())) {
                        return i as f64 - s0.0 as f64;
                    }
                }
            }
        }
        f64::INFINITY
    }
    fn marks(&self, ns: &[SNode]) -> i64 {
        self.text_of(ns, 400).split('\n').filter(|l| error_mark(l)).count() as i64
    }
    fn cond_exits(ns: &[SNode]) -> i64 {
        ns.iter()
            .map(|n| match n {
                SNode::If { then, els, .. } => {
                    then.iter().any(|x| matches!(x, SNode::Return(_))) as i64
                        + els.iter().any(|x| matches!(x, SNode::Return(_))) as i64
                        + Self::cond_exits(then)
                        + Self::cond_exits(els)
                }
                SNode::Block { body, .. } | SNode::Loop { body, .. } => Self::cond_exits(body),
                _ => 0,
            })
            .sum()
    }
    fn has_exit(ns: &[SNode]) -> bool {
        ns.iter().any(|n| match n {
            SNode::Return(_) | SNode::Trap(_) => true,
            SNode::If { then, els, .. } => Self::has_exit(then) || Self::has_exit(els),
            SNode::Block { body, .. } | SNode::Loop { body, .. } => Self::has_exit(body),
            _ => false,
        })
    }
    fn vlog(&self, x: &[SNode]) -> bool {
        vipers_log(&self.lead_text(x)).is_some()
    }
    fn inline(&self, ns: &[SNode]) -> bool {
        inline_string(self.inp.ir, self.inp.tree, ns).is_some()
    }

    /// both sides exit: the one that looks like the error path: Some(true) = then (a), Some(false) = rest (b)
    fn pick_fail(&self, a: &[SNode], b: &[SNode], strict: bool) -> Option<bool> {
        let la = self.span(a);
        let lb = self.span(b);
        if !strict {
            if let Some(ok) = &self.ok_out {
                if la <= 8 {
                    let ta = self.text_of(a, 80);
                    if ok.is_match(&ta) && !error_mark(&ta) && self.first_mark(b) <= 2.0 && error_raise(&self.text_of(b, 4)) {
                        return Some(false);
                    }
                }
            }
        }
        let quiet = |x: &[SNode], y: &[SNode]| -> bool {
            self.inp.anchor && self.first_mark(y) == 0.0 && anchor_mark(&self.top_text(y, 80)) && !error_mark(&self.text_of(x, 400))
        };
        if !strict && la * 4 <= lb && la <= 40 && !quiet(a, b) {
            return Some(true);
        }
        if !strict && lb * 4 <= la && lb <= 40 && !quiet(b, a) {
            return Some(false);
        }
        if !strict && self.inp.anchor && la <= 60 && la * 2 <= lb && self.inline(a) {
            return Some(true);
        }
        if !strict && self.inp.anchor {
            let ma0 = self.marks(a);
            let mb0 = self.marks(b);
            if ma0 == 0 && mb0 >= 2 && la <= 60 && self.inline(a) {
                return Some(true);
            }
            if mb0 == 0 && ma0 >= 2 && lb <= 60 && self.inline(b) {
                return Some(false);
            }
            if ma0 == 0 && mb0 == 1 && self.first_mark(b) > 0.0 && matches!(b.first(), Some(SNode::If { .. })) && la <= 60 && self.inline(a) {
                return Some(true);
            }
            if mb0 == 0 && ma0 == 1 && self.first_mark(a) > 0.0 && matches!(a.first(), Some(SNode::If { .. })) && lb <= 60 && self.inline(b) {
                return Some(false);
            }
        }
        let fa = self.first_mark(a);
        let fb = self.first_mark(b);
        if fa != fb && fa.min(fb) + 8.0 < fa.max(fb) {
            return Some(fa < fb);
        }
        let ca = self.marks(a);
        let cb = self.marks(b);
        if ca != 0 && cb != 0 && ca != cb && ca.min(cb) * 2 < ca.max(cb) {
            return Some(ca < cb);
        }
        let ma = error_mark(&self.top_text(a, 80));
        let mb = error_mark(&self.top_text(b, 80));
        if ma != mb {
            return Some(ma);
        }
        if !strict && !self.inp.anchor {
            let ea = Self::cond_exits(a);
            let eb = Self::cond_exits(b);
            if ea == 0 && eb >= 2 && la <= 16 && !a.iter().any(|n| matches!(n, SNode::Loop { .. })) {
                return Some(true);
            }
            if eb == 0 && ea >= 2 && lb <= 16 && !b.iter().any(|n| matches!(n, SNode::Loop { .. })) {
                return Some(false);
            }
        }
        None
    }

    fn walk(&self, ns: &[SNode], main: bool, err: bool, cont: bool, cont_fail: bool) {
        let ir = self.inp.ir;
        let mut before: Option<i64> = None;
        for k in 0..ns.len() {
            let n = &ns[k];
            self.site(n, main, err);
            match n {
                SNode::Stmt(si) => {
                    let s = self.inp.tree.stmt(*si);
                    let pc = stmt_pc(s);
                    let ln = self.line_of(n) + 1;
                    {
                        let mut f = self.facts.borrow_mut();
                        if !f.pc_line.contains_key(&pc) {
                            f.pc_line.insert(pc, ln);
                        }
                    }
                    self.store(n, main, err);
                    let cs = self.callees_of(s);
                    for &c in &cs {
                        self.facts.borrow_mut().calls.push(Call {
                            line: ln,
                            pc: Some(pc),
                            ret: None,
                            callee: c,
                            main,
                            err_path: err,
                        });
                        let nm = (self.inp.callee_name)(c);
                        if (nm.contains("find_program_address") || nm.contains("create_program_address")) && !self.inp.sites.contains_key(&key(n)) {
                            let cc = call_of(ir, s);
                            let seeds = cc.and_then(|(_, args)| {
                                let av = ir.to_vec(args);
                                match (av.get(1).map(|&e| ir.get(e)), av.get(2).map(|&e| ir.get(e))) {
                                    (Some(Node::Const(a)), Some(Node::Const(b))) => (self.inp.seeds_at)(a, b),
                                    _ => None,
                                }
                            });
                            let t = self.line(ln - 1).map_or(String::new(), |x| js_trim(x).to_string());
                            let prog = jre!(r", (\w+)\)$").captures(&t).map_or("?".to_string(), |m| m[1].to_string());
                            let mut op = Op::new(ln, Some(pc), vec!["PDA_DERIVE"], t, main, err);
                            op.pda = Some(Pda {
                                fn_: jre!(r"_[0-9a-f]+$").replace(&nm, "").into_owned(),
                                seeds: seeds.unwrap_or_else(|| "? (not in the frame)".into()),
                                program: prog,
                            });
                            self.facts.borrow_mut().ops.push(op);
                        }
                        self.helper_call(n, c, main, err);
                        if jre!(r"(?i-u)realloc|resize").is_match(&nm) {
                            let t = self.line(ln - 1).map_or(String::new(), |x| js_trim(x).to_string());
                            self.facts.borrow_mut().ops.push(Op::new(ln, Some(pc), vec!["ACCOUNT_REALLOC"], t, main, err));
                        }
                    }
                    if !cs.is_empty() {
                        before = match s {
                            Stmt::Call { t: CallTarget::Fn { pc }, .. } => Some(*pc),
                            Stmt::Set { e, .. } if matches!(ir.get(*e), Node::Call(t, _) if matches!(ir.target(t), CallTarget::Fn { .. })) => {
                                let Node::Call(t, _) = ir.get(*e) else { unreachable!() };
                                let CallTarget::Fn { pc } = ir.target(t) else { unreachable!() };
                                Some(pc)
                            }
                            _ => cs.last().copied(),
                        };
                    }
                }
                SNode::Return(Some(e)) => {
                    let ln = self.line_of(n) + 1;
                    for c in self.expr_callees(*e) {
                        self.facts.borrow_mut().calls.push(Call {
                            line: ln,
                            pc: None,
                            ret: Some(*e),
                            callee: c,
                            main,
                            err_path: err,
                        });
                    }
                }
                SNode::If { c, then, els } => {
                    self.cond_lines(*c, self.line_of(n) + 1);
                    let rest = &ns[k + 1..];
                    let after = if k + 1 < ns.len() { self.exits(ns, cont) } else { cont };
                    let t_ex = self.exits(then, false);
                    let e_ex = !els.is_empty() && self.exits(els, false);
                    // 0: then, 1: else, 2: rest
                    let mut fail: Option<u8> = None;
                    if els.is_empty() {
                        let r_ex = after;
                        if t_ex && !r_ex {
                            fail = Some(0)
                        } else if t_ex && r_ex {
                            fail = self.pick_fail(then, rest, false).map(|x| if x { 0 } else { 2 })
                        } else if then.is_empty() && r_ex {
                            fail = Some(2)
                        } else if !t_ex && r_ex && Self::has_exit(then) {
                            fail = self.pick_fail(then, rest, true).map(|x| if x { 0 } else { 2 })
                        }
                    } else if t_ex && !e_ex {
                        fail = Some(0)
                    } else if e_ex && !t_ex {
                        fail = Some(1)
                    } else if (t_ex && e_ex) || (!t_ex && !e_ex && after) {
                        let pf = self.pick_fail(then, els, false);
                        fail = match pf {
                            Some(true) => Some(0),
                            Some(false) => Some(1),
                            None => None,
                        };
                        let init_alt = |xs: &[SNode]| {
                            xs.iter().any(|x| matches!(x, SNode::If { then, .. } if self.text_of(then, 60).contains("TryingToInitPayerAsProgramAccount")))
                        };
                        if let Some(fv) = fail {
                            let (other, own) = if fv == 0 { (&els[..], &then[..]) } else { (&then[..], &els[..]) };
                            if self.inp.anchor && init_alt(other) && !error_mark(&self.text_of(own, 400)) {
                                fail = None;
                            }
                        }
                    }
                    let vt = self.vlog(then);
                    if !els.is_empty() {
                        let ve = self.vlog(els);
                        if vt != ve {
                            fail = Some(if vt { 0 } else { 1 });
                        }
                    } else if vt != self.vlog(rest) {
                        fail = Some(if vt { 0 } else { 2 });
                    }
                    if let Some(fv) = fail {
                        let fail_nodes: &[SNode] = match fv {
                            0 => then,
                            1 => els,
                            _ => rest,
                        };
                        let pass_nodes: &[SNode] = if fv == 0 {
                            if !els.is_empty() {
                                els
                            } else {
                                rest
                            }
                        } else {
                            then
                        };
                        self.check(n, fail_nodes, fv == 0, main, before, pass_nodes);
                        self.walk(then, if fv == 0 { false } else { main }, err || fv == 0, after, fv == 2 || (rest.is_empty() && cont_fail));
                        self.walk(els, if fv == 1 { false } else { main }, err || fv == 1, after, false);
                        if fv == 2 {
                            self.walk(rest, false, true, cont, false);
                            return;
                        }
                    } else if cont_fail && els.is_empty() && rest.is_empty() {
                        self.walk(then, main, err, after, true);
                    } else {
                        if els.is_empty() {
                            if let Some(f) = self.inp.ir_pda {
                                if f(*c, self.first_pc(rest), self.first_pc(then)) == Some(0.0) {
                                    self.check(n, rest, false, main, before, then);
                                }
                            }
                        }
                        self.walk(then, false, err, after, false);
                        self.walk(els, false, err, after, false);
                    }
                    before = None;
                }
                SNode::Block { label, body } => {
                    let after = if k + 1 < ns.len() { self.exits(ns, cont) } else { cont };
                    self.label_cont.borrow_mut().insert(*label, after);
                    self.walk(body, main, err, after, false);
                    before = None;
                }
                SNode::Loop { body, form, c, .. } => {
                    if let Some(c) = c {
                        self.cond_lines(*c, self.line_of(n) + 1);
                    }
                    self.walk(body, if *form == sbpf_struct::Form::Do { main } else { false }, err, false, false);
                    before = None;
                }
                SNode::Switch { cases, .. } => {
                    let after = if k + 1 < ns.len() { self.exits(ns, cont) } else { cont };
                    for (_, body) in cases {
                        self.walk(body, false, err, after, false);
                    }
                    before = None;
                }
                _ => {}
            }
        }
    }
}

pub fn function_facts(inp: &FnInput) -> FnFacts {
    let lines = inp.lines;
    let mut types: IndexMap<String, String> = IndexMap::new();
    let mut alias: HashMap<String, Option<String>> = HashMap::new();
    let sig = lines.iter().find(|l| l.starts_with("function ") || l.starts_with("export function "));
    if let Some(sig) = sig {
        for m in jre!(r"(\w+): (\w+)").captures_iter(sig) {
            types.insert(m[1].to_string(), m[2].to_string());
        }
    }
    for l in lines {
        if !l.contains(" = ") {
            continue;
        }
        if let Some(m) = jre!(r"^\s*(?:const |let )?(\w+)(?:: (\w+))? = ([A-Za-z_]\w*\.[\w.]+)$").captures(l) {
            let k = m[1].to_string();
            let v = m[3].to_string();
            let nv = match alias.get(&k) {
                Some(old) if old.as_deref() != Some(v.as_str()) => None,
                _ => Some(v),
            };
            alias.insert(k.clone(), nv);
            if let Some(t) = m.get(2) {
                types.insert(k, t.as_str().to_string());
            }
        } else if let Some(d) = jre!(r"^\s*(?:const |let )?(\w+)(?:: (\w+))? = ").captures(l) {
            let k = d[1].to_string();
            if alias.contains_key(&k) {
                alias.insert(k.clone(), None);
            }
            if let Some(t) = d.get(2) {
                types.insert(k, t.as_str().to_string());
            }
        }
    }
    let ok_out = sig
        .and_then(|s| jre!(r"^(?:export )?function \w+\((\w+)").captures(s).map(|m| m[1].to_string()))
        .map(|o| super::jsre(&format!(r"(?m)^\s*(?:st64\({o}, 0\)|{o}\.tag = 0)$")));
    let fx = Fx {
        inp,
        facts: RefCell::new(FnFacts {
            pc: inp.pc,
            name: inp.name.to_string(),
            types,
            lines: lines.to_vec(),
            at: inp.at,
            ..Default::default()
        }),
        alias,
        label_cont: RefCell::new(HashMap::new()),
        ok_out,
    };
    fx.walk(inp.body, true, false, true, false);
    fx.facts.into_inner()
}

/// Anchor account types by the library functions a try-callee uses
fn type_kinds(nm: &str) -> &'static [&'static str] {
    if nm.starts_with("Signer_try_from") {
        &["signer"]
    } else if jre!(r"^(Account|AccountLoader|InterfaceAccount)_try_from").is_match(nm) {
        &["owner", "discriminator"]
    } else if nm.starts_with("Program_try_from") {
        &["address", "executable"]
    } else if nm.starts_with("SystemAccount_try_from") {
        &["owner"]
    } else if nm.starts_with("Sysvar_from_account_info") {
        &["address"]
    } else {
        &[]
    }
}

/// What a callee checks (calleeChecks): the kinds of the Anchor errors its code (and its callees' within 2
/// calls) raises, and the account types of the named library functions it calls.
pub fn callee_checks(
    ctx: &sbpf_exec::ProgCtx,
    pc: i64,
    err_name: &dyn Fn(u64) -> Option<String>,
    memo: &mut HashMap<i64, Vec<&'static str>>,
    depth: i32,
) -> Vec<&'static str> {
    if let Some(r) = memo.get(&pc) {
        return r.clone();
    }
    memo.insert(pc, Vec::new());
    let p = ctx.p;
    let mut own: indexmap::IndexSet<&'static str> = indexmap::IndexSet::new();
    let mut sub: Vec<i64> = Vec::new();
    let end = ctx.extent_of(pc);
    let mut i = pc;
    while i < end {
        let Some(ins) = p.insns.get(i as usize) else { break };
        if matches!(ins.opc, 0xb7 | 0xb4 | 0x62 | 0x7a) && ins.imm >= 2000 && ins.imm <= 4200 {
            if let Some(e) = err_name(ins.imm as u64) {
                let e = e.strip_prefix("anchor::").unwrap_or(&e).to_string();
                if let Some(k) = anchor_kind(&e) {
                    own.insert(k);
                }
            }
        }
        if ins.opc == 0x85 {
            if let sbpf_exec::CallName::Fn(x) = sbpf_exec::call_target_name(p, i, ins.imm) {
                let nm = p.funcs.get(&x).map_or("", |f| f.name.as_str());
                for k in type_kinds(nm) {
                    own.insert(k);
                }
                if depth > 0 {
                    sub.push(x);
                }
            }
        }
        i += 1;
    }
    if own.len() > 6 {
        return Vec::new();
    }
    // (the memo holds the set being built: a cycle back to pc sees its contents so far)
    let mut r: Vec<&'static str> = own.into_iter().collect();
    memo.insert(pc, r.clone());
    for x in sub {
        for k in callee_checks(ctx, x, err_name, memo, depth - 1) {
            if !r.contains(&k) {
                r.push(k);
            }
        }
        memo.insert(pc, r.clone());
    }
    r
}

#[allow(dead_code)]
fn unused(_: &HashSet<u8>) {}
