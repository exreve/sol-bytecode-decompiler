//! `src/print.ts`: the TypeScript printer (expressions with the TS precedence / parenthesization rules,
//! statements, the structured body) and decompile's `declarations`.
//!
//! Only the plain (raw) rendering is ported so far: no typed views, frame objects, string / key
//! literals, comments or outlining (the `PrintCtx` hooks the readable output sets).

use sbpf_ir::{BinOp, CallTarget, CmpOp, Ir, Node, Stmt, E, L};
use sbpf_program::Func;
use sbpf_struct::{Form, SNode, Tree};
use std::collections::HashMap;
use std::fmt::Write;
use std::rc::Rc;

/// Program-level names the printer looks up (PrintCtx fnName / fnAddrName / sysName).
#[derive(Clone, Debug, Default)]
pub struct ProgNames {
    pub by_pc: HashMap<i64, String>,
    pub by_addr: HashMap<u64, String>,
    /// syscall name -> alias (registered syscalls)
    pub sys: HashMap<String, String>,
    /// p.elf.text.addr (fallback names `fn_<addr>`)
    pub text_addr: f64,
}

impl ProgNames {
    pub fn fn_name(&self, pc: i64) -> String {
        match self.by_pc.get(&pc) {
            Some(n) => n.clone(),
            None => format!("fn_{:x}", (self.text_addr + (pc * 8) as f64) as u128),
        }
    }
    pub fn sys_name<'a>(&'a self, n: &'a str) -> &'a str {
        self.sys.get(n).map_or(n, |s| s.as_str())
    }
}

mod prec {
    pub const ASSIGN: u8 = 2;
    pub const COND: u8 = 3;
    pub const LOR: u8 = 4;
    pub const LAND: u8 = 5;
    pub const BOR: u8 = 6;
    pub const BXOR: u8 = 7;
    pub const BAND: u8 = 8;
    pub const EQ: u8 = 9;
    pub const REL: u8 = 10;
    pub const SHIFT: u8 = 11;
    pub const ADD: u8 = 12;
    pub const MUL: u8 = 13;
    pub const UNARY: u8 = 15;
    pub const AS: u8 = 3;
    pub const CALL: u8 = 20;
    pub const PRIM: u8 = 21;
}
use prec as P;

/// fmtPos: decimal below 10, else lowercase hex.
pub fn fmt_pos(v: u64, o: &mut String) {
    if v < 10 {
        write!(o, "{v}").unwrap();
    } else {
        write!(o, "0x{v:x}").unwrap();
    }
}

/// fmtConst: small negative values (as i64, above -0x10000) as `-k`.
pub fn fmt_const(v: u64) -> String {
    let mut o = String::new();
    let s = v as i64;
    if s < 0 && s > -0x10000 {
        o.push('-');
        fmt_pos(s.unsigned_abs(), &mut o);
    } else {
        fmt_pos(v, &mut o);
    }
    o
}

const B58: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/// base58 (semantics.ts b58)
pub fn b58(b: &[u8]) -> String {
    let mut digits: Vec<u8> = Vec::new(); // little-endian base-58 digits
    for &x in b {
        let mut carry = x as u32;
        for d in digits.iter_mut() {
            carry += (*d as u32) << 8;
            *d = (carry % 58) as u8;
            carry /= 58;
        }
        while carry > 0 {
            digits.push((carry % 58) as u8);
            carry /= 58;
        }
    }
    let mut s = String::new();
    for &x in b {
        if x != 0 {
            break;
        }
        s.push('1');
    }
    for &d in digits.iter().rev() {
        s.push(B58[d as usize] as char);
    }
    s
}

fn is_word(c: u8) -> bool {
    c.is_ascii_alphanumeric() || c == b'_'
}

/// `/^\w+\(.*\)$/`
fn is_call_text(x: &str) -> bool {
    let b = x.as_bytes();
    let i = b.iter().take_while(|&&c| is_word(c)).count();
    i > 0
        && b.get(i) == Some(&b'(')
        && b.last() == Some(&b')')
        && b.len() > i + 1
        && !x.contains(['\n', '\r', '\u{2028}', '\u{2029}'])
}

/// joinArgs: parenthesize arguments TypeScript could misparse as generic type arguments.
pub fn join_args(a: &[String]) -> String {
    if a.len() < 2 || !a.iter().any(|x| x.contains('<')) || !a.iter().any(|x| x.contains('>')) {
        return a.join(", ");
    }
    a.iter()
        .map(|x| {
            if x.contains(['<', '>']) && !is_call_text(x) {
                format!("({x})")
            } else {
                x.clone()
            }
        })
        .collect::<Vec<_>>()
        .join(", ")
}

/// `t` is one parenthesized group: its first `(` closes at the very end (string literals skipped).
fn wrapped(t: &str) -> bool {
    let b = t.as_bytes();
    if b.first() != Some(&b'(') {
        return false;
    }
    let mut d = 0i32;
    let mut i = 0usize;
    while i < b.len() {
        let ch = b[i];
        if ch == b'"' {
            i += 1;
            while i < b.len() && b[i] != b'"' {
                i += if b[i] == b'\\' { 2 } else { 1 };
            }
            i += 1;
            continue;
        }
        if ch == b'(' {
            d += 1;
        } else if ch == b')' {
            d -= 1;
            if d == 0 {
                return i == b.len() - 1;
            }
        }
        i += 1;
    }
    false
}

fn json_str(s: &str) -> String {
    serde_json::to_string(s).unwrap()
}

pub struct Printer<'a> {
    pub ir: &'a Ir,
    pub names: &'a ProgNames,
    pub vars: &'a [Option<String>],
    addr_depth: u32,
    shl_call: bool,
}

impl<'a> Printer<'a> {
    pub fn new(ir: &'a Ir, names: &'a ProgNames, vars: &'a [Option<String>]) -> Self {
        Printer {
            ir,
            names,
            vars,
            addr_depth: 0,
            shl_call: false,
        }
    }

    pub fn var_name(&self, id: u32) -> String {
        match self.vars.get(id as usize) {
            Some(Some(n)) => n.clone(),
            _ => format!("u{id}"),
        }
    }

    fn fn_addr_name(&self, v: u64) -> Option<&'a str> {
        self.names.by_addr.get(&v).map(|s| s.as_str())
    }

    /// maxBits (simplify.ts)
    fn max_bits(&self, e: E) -> u32 {
        match self.ir.get(e) {
            Node::Const(v) => 64 - v.leading_zeros(),
            Node::Load { size, .. } => size as u32 * 8,
            Node::Ext { signed, bits, .. } => {
                if signed {
                    64
                } else {
                    bits as u32
                }
            }
            Node::Bswap { bits, .. } => bits as u32,
            Node::Cmp(..) | Node::Lnot(_) | Node::Land(..) | Node::Lor(..) => 1,
            Node::Bin(op, a, b) => match op {
                BinOp::And => self.max_bits(a).min(self.max_bits(b)),
                BinOp::Or | BinOp::Xor => self.max_bits(a).max(self.max_bits(b)),
                BinOp::Lshr => match self.ir.get(b) {
                    Node::Const(c) => self.max_bits(a).saturating_sub((c & 63) as u32),
                    _ => self.max_bits(a),
                },
                BinOp::Udiv => self.max_bits(a),
                BinOp::Urem => self.max_bits(a).min(self.max_bits(b)),
                BinOp::Add => 64.min(self.max_bits(a).max(self.max_bits(b)) + 1),
                BinOp::Mul => 64.min(self.max_bits(a) + self.max_bits(b)),
                BinOp::Shl => match self.ir.get(b) {
                    Node::Const(c) => 64.min(self.max_bits(a) + (c & 63) as u32),
                    _ => 64,
                },
                BinOp::Sdiv32 | BinOp::Srem32 => 32,
                _ => 64,
            },
            Node::Sel(_, a, b) => self.max_bits(a).max(self.max_bits(b)),
            Node::Fn(n, args) => self.ir.with_name(n, |name| match name {
                "popcount" | "clz" | "ctz" => 7,
                "memeq" | "keyeq" | "rc_release" => 1,
                "min" => self
                    .max_bits(self.ir.at(args, 0))
                    .min(self.max_bits(self.ir.at(args, 1))),
                "max" => self
                    .max_bits(self.ir.at(args, 0))
                    .max(self.max_bits(self.ir.at(args, 1))),
                "sat_sub" => self.max_bits(self.ir.at(args, 0)),
                _ => 64,
            }),
            _ => 64,
        }
    }

    fn shift_amt(&self, b: E) -> E {
        if let Node::Const(v) = self.ir.get(b) {
            return self.ir.c(v & 63);
        }
        if self.max_bits(b) <= 6 {
            return b;
        }
        let c = self.ir.c(63);
        self.ir.bin(BinOp::And, b, c)
    }

    pub fn expr(&mut self, e: E, prec: u8) -> String {
        let (t, p) = self.expr0(e);
        if p < prec {
            format!("({t})")
        } else {
            t
        }
    }

    fn const0(&self, v: u64) -> (String, u8) {
        if let Some(f) = self.fn_addr_name(v) {
            return (f.to_string(), P::PRIM);
        }
        let t = fmt_const(v);
        let p = if t.starts_with('-') {
            P::UNARY
        } else {
            P::PRIM
        };
        (t, p)
    }

    fn expr0(&mut self, e: E) -> (String, u8) {
        match self.ir.get(e) {
            Node::Const(v) => self.const0(v),
            Node::Var(id) => (self.var_name(id), P::PRIM),
            Node::Reg(r) => (format!("r{r}"), P::PRIM),
            Node::Undef => ("undef".into(), P::PRIM),
            Node::Bin(op, a, b) => self.bin(op, a, b),
            Node::Neg(a) => {
                if let Node::Const(v) = self.ir.get(a) {
                    return self.const0(v.wrapping_neg());
                }
                let t = self.u(a, P::UNARY + 1, true);
                if t.as_bytes().first().is_some_and(|c| c.is_ascii_digit()) {
                    (format!("-({t})"), P::UNARY)
                } else {
                    (format!("-{t}"), P::UNARY)
                }
            }
            Node::Not(a) => (format!("~{}", self.u(a, P::UNARY + 1, true)), P::UNARY),
            Node::Ext { signed, bits, a } => (
                format!(
                    "{} as {}{}",
                    self.expr(a, P::UNARY),
                    if signed { 'i' } else { 'u' },
                    bits
                ),
                P::AS,
            ),
            Node::Bswap { bits, a } => (format!("bswap{bits}({})", self.u(a, 0, true)), P::CALL),
            Node::Load { size, addr } => {
                self.addr_depth += 1;
                let a = self.u(addr, 0, true);
                self.addr_depth -= 1;
                (format!("ld{}({a})", size as u32 * 8), P::CALL)
            }
            Node::Cmp(op, a, b) => self.cmp(e, op, a, b),
            Node::Lnot(a) => (format!("!{}", self.expr(a, P::UNARY)), P::UNARY),
            Node::Land(a, b) => (
                format!("{} && {}", self.expr(a, P::LAND), self.expr(b, P::LAND + 1)),
                P::LAND,
            ),
            Node::Lor(a, b) => (
                format!("{} || {}", self.expr(a, P::LOR), self.expr(b, P::LOR + 1)),
                P::LOR,
            ),
            Node::Sel(c, a, b) => (
                format!(
                    "{} ? {} : {}",
                    self.expr(c, P::COND + 1),
                    self.u(a, P::ASSIGN, false),
                    self.u(b, P::ASSIGN, false)
                ),
                P::COND,
            ),
            Node::Call(t, args) => {
                let t = self.ir.target(t);
                let args = self.ir.to_vec(args);
                (self.call_text(&t, &args), P::CALL)
            }
            Node::Fn(n, args) => {
                let name = self.ir.name(n);
                if &*name == "keyeq" {
                    let a0 = self.u(self.ir.at(args, 0), P::ASSIGN, true);
                    let mut b = [0u8; 32];
                    for i in 1..args.len as usize {
                        if let Node::Const(v) = self.ir.get(self.ir.at(args, i as u32)) {
                            let k = (i - 1) * 8;
                            if k + 8 <= 32 {
                                b[k..k + 8].copy_from_slice(&v.to_le_bytes());
                            }
                        }
                    }
                    return (format!("keyeq({a0}, {})", json_str(&b58(&b))), P::CALL);
                }
                let a: Vec<String> = (0..args.len)
                    .map(|k| self.u(self.ir.at(args, k), P::ASSIGN, true))
                    .collect();
                (format!("{name}({})", join_args(&a)), P::CALL)
            }
            Node::Item(_) => unreachable!("list item"),
        }
    }

    fn bin(&mut self, op: BinOp, a: E, b: E) -> (String, u8) {
        if op == BinOp::Add {
            if let Node::Const(bv) = self.ir.get(b) {
                let s = bv as i64;
                if s < 0 && s > -0x1_0000_0000 && self.fn_addr_name(bv).is_none() {
                    let mut t = self.u(a, P::ADD, true);
                    t.push_str(" - ");
                    fmt_pos(s.unsigned_abs(), &mut t);
                    return (t, P::ADD);
                }
            }
        }
        if op == BinOp::Shl && self.shl_call {
            let amt = self.shift_amt(b);
            let x = [self.u(a, 0, false), self.u(amt, 0, false)];
            return (format!("shl({})", join_args(&x)), P::CALL);
        }
        if op == BinOp::Shl || op == BinOp::Lshr {
            let (o, p) = if op == BinOp::Shl {
                ("<<", P::SHIFT)
            } else {
                (">>", P::SHIFT)
            };
            let amt = self.shift_amt(b);
            let l = self.u(a, p, false);
            let r = self.u(amt, p + 1, false);
            if op == BinOp::Shl && r.contains(['<', '>']) {
                return (
                    format!(
                        "shl({}, {})",
                        self.u(a, P::ASSIGN, false),
                        self.u(amt, P::ASSIGN, false)
                    ),
                    P::CALL,
                );
            }
            return (format!("{l} {o} {r}"), p);
        }
        if op == BinOp::Ashr {
            let amt = self.shift_amt(b);
            let x = [self.u(a, 0, true), self.u(amt, 0, true)];
            return (format!("sar({})", join_args(&x)), P::CALL);
        }
        let fname = match op {
            BinOp::Sdiv => Some("sdiv"),
            BinOp::Srem => Some("srem"),
            BinOp::Sdiv32 => Some("sdiv32"),
            BinOp::Srem32 => Some("srem32"),
            BinOp::Uhmul => Some("mulhu"),
            BinOp::Shmul => Some("mulhs"),
            _ => None,
        };
        if let Some(fname) = fname {
            let x = [self.u(a, 0, true), self.u(b, 0, true)];
            return (format!("{fname}({})", join_args(&x)), P::CALL);
        }
        let (o, p) = match op {
            BinOp::Add => ("+", P::ADD),
            BinOp::Sub => ("-", P::ADD),
            BinOp::Mul => ("*", P::MUL),
            BinOp::Udiv => ("/", P::MUL),
            BinOp::Urem => ("%", P::MUL),
            BinOp::And => ("&", P::BAND),
            BinOp::Or => ("|", P::BOR),
            BinOp::Xor => ("^", P::BXOR),
            _ => unreachable!("binary operator {op:?}"),
        };
        let s_ok = op != BinOp::Udiv && op != BinOp::Urem;
        let l = self.operand(a, p, s_ok);
        let r = self.operand(b, p + 1, s_ok);
        (format!("{l} {o} {r}"), p)
    }

    /// A binary operand; a `<<` operand is parenthesized (TS could read `<1 | (b>` as type arguments).
    fn operand(&mut self, x: E, pp: u8, s_ok: bool) -> String {
        let t = self.u(x, pp, s_ok);
        if matches!(self.ir.get(x), Node::Bin(BinOp::Shl, ..)) && !wrapped(&t) {
            format!("({t})")
        } else {
            t
        }
    }

    fn cmp(&mut self, e: E, op: CmpOp, a: E, b: E) -> (String, u8) {
        if op == CmpOp::Set {
            return (
                format!(
                    "({} & {}) != 0",
                    self.u(a, P::BAND, true),
                    self.u(b, P::BAND + 1, true)
                ),
                P::EQ,
            );
        }
        let (mut op, mut a, mut b) = (op, a, b);
        let sw = match op {
            CmpOp::Ult => Some(CmpOp::Ugt),
            CmpOp::Ule => Some(CmpOp::Uge),
            CmpOp::Slt => Some(CmpOp::Sgt),
            CmpOp::Sle => Some(CmpOp::Sge),
            _ => None,
        };
        if let Some(s) = sw {
            let mut has_call = false;
            self.ir.walk(e, &mut |_, n| {
                if let Node::Call(..) = n {
                    has_call = true;
                }
            });
            if !has_call {
                op = s;
                std::mem::swap(&mut a, &mut b);
            }
        }
        let signed = op.as_str().starts_with('s');
        let o = match op {
            CmpOp::Eq => "==",
            CmpOp::Ne => "!=",
            CmpOp::Ugt | CmpOp::Sgt => ">",
            CmpOp::Uge | CmpOp::Sge => ">=",
            CmpOp::Ult | CmpOp::Slt => "<",
            CmpOp::Ule | CmpOp::Sle => "<=",
            CmpOp::Set => unreachable!(),
        };
        let p = if o == "==" || o == "!=" {
            P::EQ
        } else {
            P::REL
        };
        let l = self.side(a, p, signed, p == P::EQ);
        let r = self.side(b, p + 1, signed, p == P::EQ);
        (format!("{l} {o} {r}"), p)
    }

    fn side(&mut self, x: E, pp: u8, signed: bool, s_ok: bool) -> String {
        let t = if signed {
            self.signed_operand(x)
        } else {
            self.u(x, pp, s_ok)
        };
        let risky = matches!(
            self.ir.get(x),
            Node::Bin(BinOp::Shl | BinOp::Lshr, ..) | Node::Cmp(..)
        );
        if risky && !wrapped(&t) {
            format!("({t})")
        } else {
            t
        }
    }

    /// An operand in an unsigned context: signed-typed intermediates are re-normalized.
    pub fn u(&mut self, e: E, prec: u8, signed_ok: bool) -> String {
        let mut e = e;
        if let Node::Neg(a) = self.ir.get(e) {
            if let Node::Const(v) = self.ir.get(a) {
                e = self.ir.c(v.wrapping_neg());
            }
        }
        if !signed_ok {
            match self.ir.get(e) {
                Node::Ext { signed: true, .. } => {
                    return format!("({} as u64)", self.expr(e, P::UNARY));
                }
                Node::Const(v) if (v as i64) < 0 && self.fn_addr_name(v).is_none() => {
                    let mut o = String::new();
                    fmt_pos(v, &mut o);
                    return o;
                }
                _ => {}
            }
        }
        self.expr(e, prec)
    }

    fn signed_operand(&mut self, e: E) -> String {
        match self.ir.get(e) {
            Node::Const(v) => {
                let s = v as i64;
                let mut o = String::new();
                if s < 0 {
                    o.push('-');
                }
                fmt_pos(s.unsigned_abs(), &mut o);
                o
            }
            Node::Ext { signed: true, .. } => self.expr(e, P::REL + 1),
            _ => format!("({} as i64)", self.expr(e, P::UNARY)),
        }
    }

    pub fn call_text(&mut self, t: &CallTarget, args: &[E]) -> String {
        let a: Vec<String> = args.iter().map(|&x| self.u(x, P::ASSIGN, true)).collect();
        match t {
            CallTarget::Fn { pc } => format!("{}({})", self.names.fn_name(*pc), join_args(&a)),
            CallTarget::Sys { name, .. } => {
                format!("{}({})", self.names.sys_name(name), join_args(&a))
            }
            CallTarget::Ind { e } => {
                let mut x = vec![self.u(*e, P::ASSIGN, true)];
                x.extend(a);
                format!("callx({})", join_args(&x))
            }
        }
    }
}

/// Declaration keyword of the statements that declare a variable (by statement index in the tree).
pub type Decls = HashMap<u32, &'static str>;

/// printBody: the structured body as lines (indent = one tab per level below `indent`).
pub fn print_body(
    pr: &mut Printer,
    tree: &Tree,
    indent: &str,
    decls: &Decls,
    hoisted: &[u32],
) -> Vec<String> {
    let mut b = BodyPrinter {
        pr,
        tree,
        indent,
        decls,
        out: Vec::new(),
    };
    if !hoisted.is_empty() {
        let names: Vec<String> = hoisted.iter().map(|&v| b.pr.var_name(v)).collect();
        let l = format!("{}let {}: u64", b.ind(0), names.join(", "));
        b.out.push(l);
    }
    b.rec(&tree.body, 0);
    b.out
}

struct BodyPrinter<'p, 'a> {
    pr: &'p mut Printer<'a>,
    tree: &'p Tree,
    indent: &'p str,
    decls: &'p Decls,
    out: Vec<String>,
}

impl BodyPrinter<'_, '_> {
    fn ind(&self, d: usize) -> String {
        let mut s = String::with_capacity(self.indent.len() + d);
        s.push_str(self.indent);
        for _ in 0..d {
            s.push('\t');
        }
        s
    }
    fn decl_name(&self, v: i32, kw: Option<&str>) -> String {
        let n = self.pr.var_name(v as u32);
        match kw {
            Some(k) => format!("{k} {n}"),
            None => n,
        }
    }
    fn stmt(&mut self, si: u32, d: usize) {
        let n0 = self.out.len();
        self.stmt0(si, d);
        // `x << (… > (…` could be read as a generic call: print shifts as shl(x, n)
        let risky = self.out[n0..].iter().any(|l| match l.find("<<") {
            Some(i) => l[i + 2..].contains("> ("),
            None => false,
        });
        if risky {
            self.out.truncate(n0);
            self.pr.shl_call = true;
            self.stmt0(si, d);
            self.pr.shl_call = false;
        }
    }
    fn stmt0(&mut self, si: u32, d: usize) {
        let s = self.tree.stmt(si);
        let i = self.ind(d);
        let line = match s {
            Stmt::Set { dst, e, .. } => {
                let kw = self.decls.get(&si).copied();
                let dn = self.decl_name(*dst, kw);
                format!("{i}{dn} = {}", self.pr.u(*e, P::ASSIGN, true))
            }
            Stmt::Store { size, addr, v, .. } => {
                self.pr.addr_depth += 1;
                let a = self.pr.u(*addr, P::ASSIGN, true);
                self.pr.addr_depth -= 1;
                let x = [a, self.pr.u(*v, P::ASSIGN, true)];
                format!("{i}st{}({})", *size as u32 * 8, join_args(&x))
            }
            Stmt::Call {
                dst,
                t,
                args,
                extra,
                ..
            } => {
                let kw = self.decls.get(&si).copied();
                let mut all = self.pr.ir.to_vec(*args);
                if let Some(x) = extra {
                    all.extend(self.pr.ir.items(*x));
                }
                let txt = self.pr.call_text(t, &all);
                if *dst >= 0 {
                    format!("{i}{} = {txt}", self.decl_name(*dst, kw))
                } else {
                    format!("{i}{txt}")
                }
            }
            Stmt::Eval { e, .. } => {
                let bare = match self.pr.ir.get(*e) {
                    Node::Fn(n, _) => self.pr.ir.with_name(n, |x| x == "rc_inc" || x == "rc_dec"),
                    _ => false,
                };
                format!(
                    "{i}{}{}",
                    if bare { "" } else { "void " },
                    self.pr.u(*e, P::UNARY, true)
                )
            }
            Stmt::Stores {
                size, addr, vals, ..
            } => {
                self.pr.addr_depth += 1;
                let a = self.pr.u(*addr, P::ASSIGN, true);
                self.pr.addr_depth -= 1;
                let mut x = vec![a];
                for v in self.pr.ir.to_vec(*vals) {
                    x.push(self.pr.u(v, P::ASSIGN, true));
                }
                format!("{i}st{}({})", *size as u32 * 8, join_args(&x))
            }
            Stmt::Copy {
                dst, src, n, rev, ..
            } => {
                let x = [
                    self.pr.u(*dst, P::ASSIGN, true),
                    self.pr.u(*src, P::ASSIGN, true),
                    fmt_const(*n),
                ];
                format!(
                    "{i}copy{}({})",
                    if *rev == Some(true) { "r" } else { "" },
                    join_args(&x)
                )
            }
            Stmt::Trap { msg, .. } => format!("{i}trap({})", json_str(msg)),
        };
        self.out.push(line);
    }
    fn rec(&mut self, ns: &[SNode], d: usize) {
        for n in ns {
            self.node(n, d);
        }
    }
    fn node(&mut self, n: &SNode, d: usize) {
        let i = self.ind(d);
        match n {
            SNode::Stmt(s) => self.stmt(*s, d),
            SNode::If { c, then, els } => {
                let l = format!("{i}if ({}) {{", self.pr.expr(*c, 0));
                self.out.push(l);
                self.rec(then, d + 1);
                let mut el = els;
                while el.len() == 1 {
                    let SNode::If { c, then, els } = &el[0] else {
                        break;
                    };
                    let l = format!("{i}}} else if ({}) {{", self.pr.expr(*c, 0));
                    self.out.push(l);
                    self.rec(then, d + 1);
                    el = els;
                }
                if !el.is_empty() {
                    self.out.push(format!("{i}}} else {{"));
                    self.rec(el, d + 1);
                }
                self.out.push(format!("{i}}}"));
            }
            SNode::Block { label, body } => {
                self.out.push(format!("{i}{}: {{", label.text()));
                self.rec(body, d + 1);
                self.out.push(format!("{i}}}"));
            }
            SNode::Loop {
                label,
                body,
                form,
                c,
            } => {
                let lbl = label.map_or(String::new(), |l| format!("{}: ", l.text()));
                let l = match form {
                    Form::For => format!("{i}{lbl}while (true) {{"),
                    Form::While => format!("{i}{lbl}while ({}) {{", self.pr.expr(c.unwrap(), 0)),
                    Form::Do => format!("{i}{lbl}do {{"),
                };
                self.out.push(l);
                self.rec(body, d + 1);
                let l = if *form == Form::Do {
                    format!("{i}}} while ({})", self.pr.expr(c.unwrap(), 0))
                } else {
                    format!("{i}}}")
                };
                self.out.push(l);
            }
            SNode::Break(l) => self.out.push(match l {
                Some(l) => format!("{i}break {}", l.text()),
                None => format!("{i}break"),
            }),
            SNode::Continue(l) => self.out.push(match l {
                Some(l) => format!("{i}continue {}", l.text()),
                None => format!("{i}continue"),
            }),
            SNode::Return(e) => {
                let l = match e {
                    Some(e) => format!("{i}return {}", self.pr.u(*e, P::ASSIGN, true)),
                    None => format!("{i}return"),
                };
                self.out.push(l);
            }
            SNode::Trap(msg) => {
                if !msg.is_empty() {
                    self.out.push(format!("{i}trap({})", json_str(msg)));
                }
            }
            SNode::SetState { v, val } => {
                let l = format!("{i}{} = {val}", self.pr.var_name(*v));
                self.out.push(l);
            }
            SNode::Switch { v, cases } => {
                let l = format!("{i}switch ({}) {{", self.pr.var_name(*v));
                self.out.push(l);
                let i1 = self.ind(d + 1);
                for (vals, body) in cases {
                    let cs: Vec<String> = vals.iter().map(|v| format!("case {v}:")).collect();
                    self.out.push(format!("{i1}{} {{", cs.join(" ")));
                    self.rec(body, d + 2);
                    self.out.push(format!("{i1}}}"));
                }
                self.out.push(format!("{i}}}"));
            }
        }
    }
}

// ---------------- declarations (decompile.ts) ----------------

struct Ref {
    /// id of the list holding the node
    list: u32,
    path: Rc<Vec<u32>>,
    is_def: bool,
    s: Option<u32>,
}

struct DeclWalk<'a> {
    ir: &'a Ir,
    tree: &'a Tree,
    refs: indexmap::IndexMap<u32, Vec<Ref>>,
    def_count: HashMap<u32, u32>,
    next_list: u32,
    scratch: Vec<E>,
}

impl DeclWalk<'_> {
    fn add(&mut self, v: u32, r: Ref) {
        self.refs.entry(v).or_default().push(r);
    }
    fn use_e(&mut self, e: E, list: u32, path: &Rc<Vec<u32>>) {
        let mut vs = Vec::new();
        self.ir.walk(e, &mut |_, n| {
            if let Node::Var(v) = n {
                vs.push(v);
            }
        });
        for v in vs {
            self.add(
                v,
                Ref {
                    list,
                    path: path.clone(),
                    is_def: false,
                    s: None,
                },
            );
        }
    }
    fn walk(&mut self, ns: &[SNode], path: &[u32]) {
        let id = self.next_list;
        self.next_list += 1;
        let mut p2v = path.to_vec();
        p2v.push(id);
        let p2 = Rc::new(p2v);
        for n in ns {
            match n {
                SNode::Stmt(si) => {
                    let s = self.tree.stmt(*si);
                    let mut es = std::mem::take(&mut self.scratch);
                    stmt_exprs(self.ir, s, &mut es);
                    for &e in &es {
                        self.use_e(e, id, &p2);
                    }
                    self.scratch = es;
                    let dst = match s {
                        Stmt::Set { dst, .. } | Stmt::Call { dst, .. } => *dst,
                        _ => -1,
                    };
                    if dst >= 0 {
                        let v = dst as u32;
                        self.add(
                            v,
                            Ref {
                                list: id,
                                path: p2.clone(),
                                is_def: true,
                                s: Some(*si),
                            },
                        );
                        *self.def_count.entry(v).or_insert(0) += 1;
                    }
                }
                SNode::If { c, then, els } => {
                    self.use_e(*c, id, &p2);
                    self.walk(then, &p2);
                    self.walk(els, &p2);
                }
                SNode::Block { body, .. } => self.walk(body, &p2),
                SNode::Loop { form, c, body, .. } => {
                    if *form == Form::While {
                        if let Some(c) = c {
                            self.use_e(*c, id, &p2);
                        }
                    }
                    self.walk(body, &p2);
                    if *form == Form::Do {
                        if let Some(c) = c {
                            self.use_e(*c, id, &p2);
                        }
                    }
                }
                SNode::Return(Some(e)) => self.use_e(*e, id, &p2),
                SNode::Switch { v, cases } => {
                    self.add(
                        *v,
                        Ref {
                            list: id,
                            path: p2.clone(),
                            is_def: false,
                            s: None,
                        },
                    );
                    for c in cases {
                        self.walk(&c.1, &p2);
                    }
                }
                SNode::SetState { v, .. } => {
                    self.add(
                        *v,
                        Ref {
                            list: id,
                            path: p2.clone(),
                            is_def: true,
                            s: None,
                        },
                    );
                    self.def_count.insert(*v, 2);
                }
                _ => {}
            }
        }
    }
}

/// stmtExprs (simplify.ts)
pub fn stmt_exprs(ir: &Ir, s: &Stmt, out: &mut Vec<E>) {
    out.clear();
    let items = |l: &L, out: &mut Vec<E>| out.extend(ir.items(*l));
    match s {
        Stmt::Set { e, .. } | Stmt::Eval { e, .. } => out.push(*e),
        Stmt::Store { addr, v, .. } => {
            out.push(*addr);
            out.push(*v);
        }
        Stmt::Call { args, t, extra, .. } => {
            items(args, out);
            if let CallTarget::Ind { e } = t {
                out.push(*e);
            }
            if let Some(x) = extra {
                items(x, out);
            }
        }
        Stmt::Stores { addr, vals, .. } => {
            out.push(*addr);
            items(vals, out);
        }
        Stmt::Copy { dst, src, .. } => {
            out.push(*dst);
            out.push(*src);
        }
        Stmt::Trap { .. } => {}
    }
}

fn uses_var(ir: &Ir, e: E, v: u32) -> bool {
    let mut u = false;
    ir.walk(e, &mut |_, n| {
        if n == Node::Var(v) {
            u = true;
        }
    });
    u
}

/// declarations(f, body): `let` / `const` at the first definition when it sits in the innermost list
/// common to all references (and does not read the variable), else hoisted (sorted ids).
pub fn declarations(ir: &Ir, f: &Func, tree: &Tree) -> (Decls, Vec<u32>) {
    let mut w = DeclWalk {
        ir,
        tree,
        refs: indexmap::IndexMap::new(),
        def_count: HashMap::new(),
        next_list: 0,
        scratch: Vec::new(),
    };
    w.walk(&tree.body, &[]);
    let mut decls = Decls::new();
    let mut hoisted = Vec::new();
    for (&v, rs) in &w.refs {
        if f.vars.get(v as usize).is_some_and(|x| x.param >= 0) {
            continue;
        }
        let first = &rs[0];
        let mut common = first.path.len();
        for r in rs {
            let mut i = 0;
            while i < common && i < r.path.len() && first.path[i] == r.path[i] {
                i += 1;
            }
            common = i;
        }
        let list = if common > 0 {
            Some(first.path[common - 1])
        } else {
            None
        };
        let top_def = first.is_def
            && Some(first.list) == list
            && first.s.is_some_and(|si| match tree.stmt(si) {
                Stmt::Set { e, .. } => !uses_var(ir, *e, v),
                _ => true,
            });
        if top_def {
            let n = w.def_count.get(&v).copied().unwrap_or(0);
            decls.insert(first.s.unwrap(), if n == 1 { "const" } else { "let" });
        } else {
            hoisted.push(v);
        }
    }
    hoisted.sort_unstable();
    (decls, hoisted)
}
