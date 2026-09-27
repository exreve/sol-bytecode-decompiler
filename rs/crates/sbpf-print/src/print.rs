//! `src/print.ts`: the TypeScript printer (expressions with the TS precedence / parenthesization rules,
//! statements, the structured body) and decompile's `declarations`.
//!
//! Only the plain (raw) rendering is ported so far: no typed views, frame objects, string / key
//! literals, comments or outlining (the `PrintCtx` hooks the readable output sets).

use sbpf_ir::{BinOp, CallTarget, CmpOp, Ir, Node, Stmt, E};
use sbpf_program::Func;
use sbpf_struct::{Form, SNode, Tree};
use std::collections::HashMap;
use std::hash::{BuildHasherDefault, Hasher};

/// A fast hasher for integer keys (lookups only: no iteration order depends on it).
#[derive(Default)]
pub struct IntHasher(u64);

impl Hasher for IntHasher {
    fn finish(&self) -> u64 {
        self.0
    }
    fn write(&mut self, b: &[u8]) {
        for &x in b {
            self.0 = (self.0.rotate_left(5) ^ x as u64).wrapping_mul(0x51_7c_c1_b7_27_22_0a_95);
        }
    }
    fn write_u64(&mut self, x: u64) {
        self.0 = (self.0.rotate_left(5) ^ x).wrapping_mul(0x51_7c_c1_b7_27_22_0a_95);
    }
    fn write_i64(&mut self, x: i64) {
        self.write_u64(x as u64);
    }
}

pub type IntMap<K, V> = HashMap<K, V, BuildHasherDefault<IntHasher>>;
use std::fmt::Write;

/// Program-level names the printer looks up (PrintCtx fnName / fnAddrName / sysName).
#[derive(Clone, Debug, Default)]
pub struct ProgNames {
    pub by_pc: IntMap<i64, String>,
    pub by_addr: IntMap<u64, String>,
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

/// The expression printer. Text is written into one buffer; a subexpression that needs parentheses
/// (its precedence below the context's, or one of the TS-ambiguity rules looking at its text) is
/// wrapped in place after it is written.
pub struct Printer<'a> {
    pub ir: &'a Ir,
    pub names: &'a ProgNames,
    pub vars: &'a [Option<String>],
    addr_depth: u32,
    shl_call: bool,
}

fn wrap_at(o: &mut String, start: usize) {
    o.insert(start, '(');
    o.push(')');
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

    pub fn var_name_to(&self, id: u32, o: &mut String) {
        match self.vars.get(id as usize) {
            Some(Some(n)) => o.push_str(n),
            _ => write!(o, "u{id}").unwrap(),
        }
    }

    pub fn var_name(&self, id: u32) -> String {
        let mut s = String::new();
        self.var_name_to(id, &mut s);
        s
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
        let mut o = String::new();
        self.expr_to(e, prec, &mut o);
        o
    }

    /// expr(e, prec): parenthesized when its precedence is below `prec`.
    pub fn expr_to(&mut self, e: E, prec: u8, o: &mut String) {
        let start = o.len();
        let p = self.expr0(e, o);
        if p < prec {
            wrap_at(o, start);
        }
    }

    fn const0(&self, v: u64, o: &mut String) -> u8 {
        if let Some(f) = self.fn_addr_name(v) {
            o.push_str(f);
            return P::PRIM;
        }
        let s = v as i64;
        if s < 0 && s > -0x10000 {
            o.push('-');
            fmt_pos(s.unsigned_abs(), o);
            P::UNARY
        } else {
            fmt_pos(v, o);
            P::PRIM
        }
    }

    /// Arguments joined as joinArgs does (written, then the rare `<`…`>` case rewritten).
    fn args_to(&mut self, items: &[(E, u8, bool)], o: &mut String) {
        let mut spans = Vec::with_capacity(items.len());
        for (i, &(x, prec, s_ok)) in items.iter().enumerate() {
            if i > 0 {
                o.push_str(", ");
            }
            let s = o.len();
            self.u_to(x, prec, s_ok, o);
            spans.push((s, o.len()));
        }
        fix_args(o, &spans);
    }

    fn expr0(&mut self, e: E, o: &mut String) -> u8 {
        match self.ir.get(e) {
            Node::Const(v) => self.const0(v, o),
            Node::Var(id) => {
                self.var_name_to(id, o);
                P::PRIM
            }
            Node::Reg(r) => {
                write!(o, "r{r}").unwrap();
                P::PRIM
            }
            Node::Undef => {
                o.push_str("undef");
                P::PRIM
            }
            Node::Bin(op, a, b) => self.bin(op, a, b, o),
            Node::Neg(a) => {
                if let Node::Const(v) = self.ir.get(a) {
                    return self.const0(v.wrapping_neg(), o);
                }
                let s = o.len();
                self.u_to(a, P::UNARY + 1, true, o);
                if o.as_bytes().get(s).is_some_and(|c| c.is_ascii_digit()) {
                    o.insert_str(s, "-(");
                    o.push(')');
                } else {
                    o.insert(s, '-');
                }
                P::UNARY
            }
            Node::Not(a) => {
                o.push('~');
                self.u_to(a, P::UNARY + 1, true, o);
                P::UNARY
            }
            Node::Ext { signed, bits, a } => {
                self.expr_to(a, P::UNARY, o);
                write!(o, " as {}{}", if signed { 'i' } else { 'u' }, bits).unwrap();
                P::AS
            }
            Node::Bswap { bits, a } => {
                write!(o, "bswap{bits}(").unwrap();
                self.u_to(a, 0, true, o);
                o.push(')');
                P::CALL
            }
            Node::Load { size, addr } => {
                write!(o, "ld{}(", size as u32 * 8).unwrap();
                self.addr_depth += 1;
                self.u_to(addr, 0, true, o);
                self.addr_depth -= 1;
                o.push(')');
                P::CALL
            }
            Node::Cmp(op, a, b) => self.cmp(e, op, a, b, o),
            Node::Lnot(a) => {
                o.push('!');
                self.expr_to(a, P::UNARY, o);
                P::UNARY
            }
            Node::Land(a, b) => {
                self.expr_to(a, P::LAND, o);
                o.push_str(" && ");
                self.expr_to(b, P::LAND + 1, o);
                P::LAND
            }
            Node::Lor(a, b) => {
                self.expr_to(a, P::LOR, o);
                o.push_str(" || ");
                self.expr_to(b, P::LOR + 1, o);
                P::LOR
            }
            Node::Sel(c, a, b) => {
                self.expr_to(c, P::COND + 1, o);
                o.push_str(" ? ");
                self.u_to(a, P::ASSIGN, false, o);
                o.push_str(" : ");
                self.u_to(b, P::ASSIGN, false, o);
                P::COND
            }
            Node::Call(t, args) => {
                let t = self.ir.target(t);
                let args = self.ir.to_vec(args);
                self.call_to(&t, &args, o);
                P::CALL
            }
            Node::Fn(n, args) => {
                let is_key = self.ir.with_name(n, |x| x == "keyeq");
                if is_key {
                    o.push_str("keyeq(");
                    self.u_to(self.ir.at(args, 0), P::ASSIGN, true, o);
                    let mut b = [0u8; 32];
                    for i in 1..args.len as usize {
                        if let Node::Const(v) = self.ir.get(self.ir.at(args, i as u32)) {
                            let k = (i - 1) * 8;
                            if k + 8 <= 32 {
                                b[k..k + 8].copy_from_slice(&v.to_le_bytes());
                            }
                        }
                    }
                    o.push_str(", ");
                    o.push_str(&json_str(&b58(&b)));
                    o.push(')');
                    return P::CALL;
                }
                self.ir.with_name(n, |x| o.push_str(x));
                o.push('(');
                let items: Vec<(E, u8, bool)> =
                    self.ir.items(args).map(|x| (x, P::ASSIGN, true)).collect();
                self.args_to(&items, o);
                o.push(')');
                P::CALL
            }
            Node::Item(_) => unreachable!("list item"),
        }
    }

    fn bin(&mut self, op: BinOp, a: E, b: E, o: &mut String) -> u8 {
        if op == BinOp::Add {
            if let Node::Const(bv) = self.ir.get(b) {
                let s = bv as i64;
                if s < 0 && s > -0x1_0000_0000 && self.fn_addr_name(bv).is_none() {
                    self.u_to(a, P::ADD, true, o);
                    o.push_str(" - ");
                    fmt_pos(s.unsigned_abs(), o);
                    return P::ADD;
                }
            }
        }
        if op == BinOp::Shl && self.shl_call {
            let amt = self.shift_amt(b);
            o.push_str("shl(");
            self.args_to(&[(a, 0, false), (amt, 0, false)], o);
            o.push(')');
            return P::CALL;
        }
        if op == BinOp::Shl || op == BinOp::Lshr {
            let amt = self.shift_amt(b);
            let start = o.len();
            self.u_to(a, P::SHIFT, false, o);
            let mut r = String::new();
            self.u_to(amt, P::SHIFT + 1, false, &mut r);
            // `x << (… > (…))` can be misread by TypeScript as a generic call: the function form
            if op == BinOp::Shl && r.contains(['<', '>']) {
                o.truncate(start);
                o.push_str("shl(");
                self.u_to(a, P::ASSIGN, false, o);
                o.push_str(", ");
                self.u_to(amt, P::ASSIGN, false, o);
                o.push(')');
                return P::CALL;
            }
            o.push_str(if op == BinOp::Shl { " << " } else { " >> " });
            o.push_str(&r);
            return P::SHIFT;
        }
        if op == BinOp::Ashr {
            let amt = self.shift_amt(b);
            o.push_str("sar(");
            self.args_to(&[(a, 0, true), (amt, 0, true)], o);
            o.push(')');
            return P::CALL;
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
            o.push_str(fname);
            o.push('(');
            self.args_to(&[(a, 0, true), (b, 0, true)], o);
            o.push(')');
            return P::CALL;
        }
        let (op_s, p) = match op {
            BinOp::Add => (" + ", P::ADD),
            BinOp::Sub => (" - ", P::ADD),
            BinOp::Mul => (" * ", P::MUL),
            BinOp::Udiv => (" / ", P::MUL),
            BinOp::Urem => (" % ", P::MUL),
            BinOp::And => (" & ", P::BAND),
            BinOp::Or => (" | ", P::BOR),
            BinOp::Xor => (" ^ ", P::BXOR),
            _ => unreachable!("binary operator {op:?}"),
        };
        let s_ok = op != BinOp::Udiv && op != BinOp::Urem;
        self.operand(a, p, s_ok, o);
        o.push_str(op_s);
        self.operand(b, p + 1, s_ok, o);
        p
    }

    /// A binary operand; a `<<` operand is parenthesized (TS could read `<1 | (b>` as type arguments).
    fn operand(&mut self, x: E, pp: u8, s_ok: bool, o: &mut String) {
        let start = o.len();
        self.u_to(x, pp, s_ok, o);
        if matches!(self.ir.get(x), Node::Bin(BinOp::Shl, ..)) && !wrapped(&o[start..]) {
            wrap_at(o, start);
        }
    }

    fn cmp(&mut self, e: E, op: CmpOp, a: E, b: E, o: &mut String) -> u8 {
        if op == CmpOp::Set {
            o.push('(');
            self.u_to(a, P::BAND, true, o);
            o.push_str(" & ");
            self.u_to(b, P::BAND + 1, true, o);
            o.push_str(") != 0");
            return P::EQ;
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
        let signed = matches!(op, CmpOp::Sgt | CmpOp::Sge | CmpOp::Slt | CmpOp::Sle);
        let op_s = match op {
            CmpOp::Eq => " == ",
            CmpOp::Ne => " != ",
            CmpOp::Ugt | CmpOp::Sgt => " > ",
            CmpOp::Uge | CmpOp::Sge => " >= ",
            CmpOp::Ult | CmpOp::Slt => " < ",
            CmpOp::Ule | CmpOp::Sle => " <= ",
            CmpOp::Set => unreachable!(),
        };
        let p = if matches!(op, CmpOp::Eq | CmpOp::Ne) {
            P::EQ
        } else {
            P::REL
        };
        self.side(a, p, signed, p == P::EQ, o);
        o.push_str(op_s);
        self.side(b, p + 1, signed, p == P::EQ, o);
        p
    }

    fn side(&mut self, x: E, pp: u8, signed: bool, s_ok: bool, o: &mut String) {
        let start = o.len();
        if signed {
            self.signed_operand(x, o);
        } else {
            self.u_to(x, pp, s_ok, o);
        }
        let risky = matches!(
            self.ir.get(x),
            Node::Bin(BinOp::Shl | BinOp::Lshr, ..) | Node::Cmp(..)
        );
        if risky && !wrapped(&o[start..]) {
            wrap_at(o, start);
        }
    }

    pub fn u(&mut self, e: E, prec: u8, signed_ok: bool) -> String {
        let mut o = String::new();
        self.u_to(e, prec, signed_ok, &mut o);
        o
    }

    /// An operand in an unsigned context: signed-typed intermediates are re-normalized.
    pub fn u_to(&mut self, e: E, prec: u8, signed_ok: bool, o: &mut String) {
        let mut e = e;
        if let Node::Neg(a) = self.ir.get(e) {
            if let Node::Const(v) = self.ir.get(a) {
                e = self.ir.c(v.wrapping_neg());
            }
        }
        if !signed_ok {
            match self.ir.get(e) {
                Node::Ext { signed: true, .. } => {
                    o.push('(');
                    self.expr_to(e, P::UNARY, o);
                    o.push_str(" as u64)");
                    return;
                }
                Node::Const(v) if (v as i64) < 0 && self.fn_addr_name(v).is_none() => {
                    fmt_pos(v, o);
                    return;
                }
                _ => {}
            }
        }
        self.expr_to(e, prec, o)
    }

    fn signed_operand(&mut self, e: E, o: &mut String) {
        match self.ir.get(e) {
            Node::Const(v) => {
                let s = v as i64;
                if s < 0 {
                    o.push('-');
                }
                fmt_pos(s.unsigned_abs(), o);
            }
            Node::Ext { signed: true, .. } => self.expr_to(e, P::REL + 1, o),
            _ => {
                o.push('(');
                self.expr_to(e, P::UNARY, o);
                o.push_str(" as i64)");
            }
        }
    }

    pub fn call_to(&mut self, t: &CallTarget, args: &[E], o: &mut String) {
        let mut items: Vec<(E, u8, bool)> = Vec::with_capacity(args.len() + 1);
        match t {
            CallTarget::Fn { pc } => match self.names.by_pc.get(pc) {
                Some(n) => o.push_str(n),
                None => o.push_str(&self.names.fn_name(*pc)),
            },
            CallTarget::Sys { name, .. } => o.push_str(self.names.sys_name(name)),
            CallTarget::Ind { e } => {
                o.push_str("callx");
                items.push((*e, P::ASSIGN, true));
            }
        }
        o.push('(');
        // (callText renders the arguments before an indirect target; the order does not change the text)
        items.extend(args.iter().map(|&x| (x, P::ASSIGN, true)));
        self.args_to(&items, o);
        o.push(')');
    }
}

/// joinArgs on arguments already written at `spans` (joined with ", "): when some argument contains
/// `<` and some `>`, the ones containing either (and not of the form `f(…)`) are parenthesized.
fn fix_args(o: &mut String, spans: &[(usize, usize)]) {
    if spans.len() < 2 {
        return;
    }
    let lt = spans.iter().any(|&(s, e)| o[s..e].contains('<'));
    let gt = spans.iter().any(|&(s, e)| o[s..e].contains('>'));
    if !lt || !gt {
        return;
    }
    let base = spans[0].0;
    let parts: Vec<String> = spans.iter().map(|&(s, e)| o[s..e].to_string()).collect();
    o.truncate(base);
    let joined = join_args(&parts);
    o.push_str(&joined);
}

/// Declaration keyword of the statements that declare a variable, by statement index in the tree
/// (0: none, else "const" / "let").
pub type Decls = Vec<Option<&'static str>>;

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
        let mut l = b.line(0);
        l.push_str("let ");
        for (i, &v) in hoisted.iter().enumerate() {
            if i > 0 {
                l.push_str(", ");
            }
            b.pr.var_name_to(v, &mut l);
        }
        l.push_str(": u64");
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
    /// A new line holding the indentation of depth d.
    fn line(&self, d: usize) -> String {
        let mut s = String::with_capacity(self.indent.len() + d + 96);
        s.push_str(self.indent);
        for _ in 0..d {
            s.push('\t');
        }
        s
    }
    fn decl_to(&self, si: u32, v: i32, o: &mut String) {
        if let Some(Some(k)) = self.decls.get(si as usize) {
            o.push_str(k);
            o.push(' ');
        }
        self.pr.var_name_to(v as u32, o);
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
        let mut o = self.line(d);
        match s {
            Stmt::Set { dst, e, .. } => {
                self.decl_to(si, *dst, &mut o);
                o.push_str(" = ");
                self.pr.u_to(*e, P::ASSIGN, true, &mut o);
            }
            Stmt::Store { size, addr, v, .. } => {
                write!(o, "st{}(", *size as u32 * 8).unwrap();
                let s0 = o.len();
                self.pr.addr_depth += 1;
                self.pr.u_to(*addr, P::ASSIGN, true, &mut o);
                self.pr.addr_depth -= 1;
                let s1 = o.len();
                o.push_str(", ");
                let s2 = o.len();
                self.pr.u_to(*v, P::ASSIGN, true, &mut o);
                let s3 = o.len();
                fix_args(&mut o, &[(s0, s1), (s2, s3)]);
                o.push(')');
            }
            Stmt::Call {
                dst,
                t,
                args,
                extra,
                ..
            } => {
                let mut all = self.pr.ir.to_vec(*args);
                if let Some(x) = extra {
                    all.extend(self.pr.ir.items(*x));
                }
                if *dst >= 0 {
                    self.decl_to(si, *dst, &mut o);
                    o.push_str(" = ");
                }
                self.pr.call_to(t, &all, &mut o);
            }
            Stmt::Eval { e, .. } => {
                let bare = match self.pr.ir.get(*e) {
                    Node::Fn(n, _) => self.pr.ir.with_name(n, |x| x == "rc_inc" || x == "rc_dec"),
                    _ => false,
                };
                if !bare {
                    o.push_str("void ");
                }
                self.pr.u_to(*e, P::UNARY, true, &mut o);
            }
            Stmt::Stores {
                size, addr, vals, ..
            } => {
                write!(o, "st{}(", *size as u32 * 8).unwrap();
                let mut spans = Vec::new();
                let s0 = o.len();
                self.pr.addr_depth += 1;
                self.pr.u_to(*addr, P::ASSIGN, true, &mut o);
                self.pr.addr_depth -= 1;
                spans.push((s0, o.len()));
                for v in self.pr.ir.items(*vals) {
                    o.push_str(", ");
                    let s = o.len();
                    self.pr.u_to(v, P::ASSIGN, true, &mut o);
                    spans.push((s, o.len()));
                }
                fix_args(&mut o, &spans);
                o.push(')');
            }
            Stmt::Copy {
                dst, src, n, rev, ..
            } => {
                o.push_str(if *rev == Some(true) {
                    "copyr("
                } else {
                    "copy("
                });
                let s0 = o.len();
                self.pr.u_to(*dst, P::ASSIGN, true, &mut o);
                let s1 = o.len();
                o.push_str(", ");
                let s2 = o.len();
                self.pr.u_to(*src, P::ASSIGN, true, &mut o);
                let s3 = o.len();
                o.push_str(", ");
                let s4 = o.len();
                o.push_str(&fmt_const(*n));
                let s5 = o.len();
                fix_args(&mut o, &[(s0, s1), (s2, s3), (s4, s5)]);
                o.push(')');
            }
            Stmt::Trap { msg, .. } => {
                o.push_str("trap(");
                o.push_str(&json_str(msg));
                o.push(')');
            }
        }
        self.out.push(o);
    }
    fn rec(&mut self, ns: &[SNode], d: usize) {
        for n in ns {
            self.node(n, d);
        }
    }
    fn push_label(o: &mut String, l: Option<sbpf_struct::Label>) {
        if let Some(l) = l {
            o.push(' ');
            l.write(o);
        }
    }
    fn node(&mut self, n: &SNode, d: usize) {
        match n {
            SNode::Stmt(s) => self.stmt(*s, d),
            SNode::If { c, then, els } => {
                let mut l = self.line(d);
                l.push_str("if (");
                self.pr.expr_to(*c, 0, &mut l);
                l.push_str(") {");
                self.out.push(l);
                self.rec(then, d + 1);
                let mut el = els;
                while el.len() == 1 {
                    let SNode::If { c, then, els } = &el[0] else {
                        break;
                    };
                    let mut l = self.line(d);
                    l.push_str("} else if (");
                    self.pr.expr_to(*c, 0, &mut l);
                    l.push_str(") {");
                    self.out.push(l);
                    self.rec(then, d + 1);
                    el = els;
                }
                if !el.is_empty() {
                    let mut l = self.line(d);
                    l.push_str("} else {");
                    self.out.push(l);
                    self.rec(el, d + 1);
                }
                let mut l = self.line(d);
                l.push('}');
                self.out.push(l);
            }
            SNode::Block { label, body } => {
                let mut l = self.line(d);
                label.write(&mut l);
                l.push_str(": {");
                self.out.push(l);
                self.rec(body, d + 1);
                let mut l = self.line(d);
                l.push('}');
                self.out.push(l);
            }
            SNode::Loop {
                label,
                body,
                form,
                c,
            } => {
                let mut l = self.line(d);
                if let Some(lb) = label {
                    lb.write(&mut l);
                    l.push_str(": ");
                }
                match form {
                    Form::For => l.push_str("while (true) {"),
                    Form::While => {
                        l.push_str("while (");
                        self.pr.expr_to(c.unwrap(), 0, &mut l);
                        l.push_str(") {");
                    }
                    Form::Do => l.push_str("do {"),
                }
                self.out.push(l);
                self.rec(body, d + 1);
                let mut l = self.line(d);
                l.push('}');
                if *form == Form::Do {
                    l.push_str(" while (");
                    self.pr.expr_to(c.unwrap(), 0, &mut l);
                    l.push(')');
                }
                self.out.push(l);
            }
            SNode::Break(lb) => {
                let mut l = self.line(d);
                l.push_str("break");
                Self::push_label(&mut l, *lb);
                self.out.push(l);
            }
            SNode::Continue(lb) => {
                let mut l = self.line(d);
                l.push_str("continue");
                Self::push_label(&mut l, *lb);
                self.out.push(l);
            }
            SNode::Return(e) => {
                let mut l = self.line(d);
                l.push_str("return");
                if let Some(e) = e {
                    l.push(' ');
                    self.pr.u_to(*e, P::ASSIGN, true, &mut l);
                }
                self.out.push(l);
            }
            SNode::Trap(msg) => {
                if !msg.is_empty() {
                    let mut l = self.line(d);
                    l.push_str("trap(");
                    l.push_str(&json_str(msg));
                    l.push(')');
                    self.out.push(l);
                }
            }
            SNode::SetState { v, val } => {
                let mut l = self.line(d);
                self.pr.var_name_to(*v, &mut l);
                write!(l, " = {val}").unwrap();
                self.out.push(l);
            }
            SNode::Switch { v, cases } => {
                let mut l = self.line(d);
                l.push_str("switch (");
                self.pr.var_name_to(*v, &mut l);
                l.push_str(") {");
                self.out.push(l);
                for (vals, body) in cases {
                    let mut l = self.line(d + 1);
                    for (i, v) in vals.iter().enumerate() {
                        if i > 0 {
                            l.push(' ');
                        }
                        write!(l, "case {v}:").unwrap();
                    }
                    l.push_str(" {");
                    self.out.push(l);
                    self.rec(body, d + 2);
                    let mut l = self.line(d + 1);
                    l.push('}');
                    self.out.push(l);
                }
                let mut l = self.line(d);
                l.push('}');
                self.out.push(l);
            }
        }
    }
}

// ---------------- declarations (decompile.ts) ----------------

/// stmtExprs (simplify.ts)
pub fn stmt_exprs(ir: &Ir, s: &Stmt, out: &mut Vec<E>) {
    out.clear();
    match s {
        Stmt::Set { e, .. } | Stmt::Eval { e, .. } => out.push(*e),
        Stmt::Store { addr, v, .. } => {
            out.push(*addr);
            out.push(*v);
        }
        Stmt::Call { args, t, extra, .. } => {
            out.extend(ir.items(*args));
            if let CallTarget::Ind { e } = t {
                out.push(*e);
            }
            if let Some(x) = extra {
                out.extend(ir.items(*x));
            }
        }
        Stmt::Stores { addr, vals, .. } => {
            out.push(*addr);
            out.extend(ir.items(*vals));
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

/// Per variable: its first reference and the innermost list common to all its references.
#[derive(Clone, Copy)]
struct VarRefs {
    /// list of the first reference (u32::MAX: no reference yet)
    first_list: u32,
    first_def: bool,
    /// the first reference's statement (a definition by a statement)
    first_s: Option<u32>,
    common: u32,
}

/// The references of `declarations`, walked in the TS order. The TS keeps each reference's path of
/// enclosing lists and takes the longest common prefix; here the lists form a tree (parent, depth)
/// and the common prefix's last list is the lowest common ancestor.
struct DeclWalk<'a> {
    ir: &'a Ir,
    tree: &'a Tree,
    refs: Vec<VarRefs>,
    def_count: Vec<u32>,
    parent: Vec<u32>,
    depth: Vec<u32>,
    scratch: Vec<E>,
}

impl DeclWalk<'_> {
    fn lca(&self, mut a: u32, mut b: u32) -> u32 {
        while self.depth[a as usize] > self.depth[b as usize] {
            a = self.parent[a as usize];
        }
        while self.depth[b as usize] > self.depth[a as usize] {
            b = self.parent[b as usize];
        }
        while a != b {
            a = self.parent[a as usize];
            b = self.parent[b as usize];
        }
        a
    }
    fn add(&mut self, v: u32, list: u32, is_def: bool, s: Option<u32>) {
        let i = v as usize;
        if i >= self.refs.len() {
            self.refs.resize(
                i + 1,
                VarRefs {
                    first_list: u32::MAX,
                    first_def: false,
                    first_s: None,
                    common: 0,
                },
            );
        }
        let r = self.refs[i];
        if r.first_list == u32::MAX {
            self.refs[i] = VarRefs {
                first_list: list,
                first_def: is_def,
                first_s: s,
                common: list,
            };
        } else {
            self.refs[i].common = self.lca(r.common, list);
        }
    }
    fn count_def(&mut self, v: u32, set2: bool) {
        let i = v as usize;
        if i >= self.def_count.len() {
            self.def_count.resize(i + 1, 0);
        }
        if set2 {
            self.def_count[i] = 2;
        } else {
            self.def_count[i] += 1;
        }
    }
    fn use_e(&mut self, e: E, list: u32) {
        let mut vs = std::mem::take(&mut self.scratch);
        vs.clear();
        self.ir.walk(e, &mut |x, n| {
            if let Node::Var(_) = n {
                vs.push(x);
            }
        });
        for &x in &vs {
            if let Node::Var(v) = self.ir.get(x) {
                self.add(v, list, false, None);
            }
        }
        self.scratch = vs;
    }
    fn walk(&mut self, ns: &[SNode], parent: Option<u32>) {
        let id = self.parent.len() as u32;
        self.parent.push(parent.unwrap_or(id));
        self.depth
            .push(parent.map_or(0, |p| self.depth[p as usize] + 1));
        let mut es = Vec::new();
        for n in ns {
            match n {
                SNode::Stmt(si) => {
                    let s = self.tree.stmt(*si);
                    stmt_exprs(self.ir, s, &mut es);
                    for &e in &es {
                        self.use_e(e, id);
                    }
                    let dst = match s {
                        Stmt::Set { dst, .. } | Stmt::Call { dst, .. } => *dst,
                        _ => -1,
                    };
                    if dst >= 0 {
                        self.add(dst as u32, id, true, Some(*si));
                        self.count_def(dst as u32, false);
                    }
                }
                SNode::If { c, then, els } => {
                    self.use_e(*c, id);
                    self.walk(then, Some(id));
                    self.walk(els, Some(id));
                }
                SNode::Block { body, .. } => self.walk(body, Some(id)),
                SNode::Loop { form, c, body, .. } => {
                    if *form == Form::While {
                        if let Some(c) = c {
                            self.use_e(*c, id);
                        }
                    }
                    self.walk(body, Some(id));
                    if *form == Form::Do {
                        if let Some(c) = c {
                            self.use_e(*c, id);
                        }
                    }
                }
                SNode::Return(Some(e)) => self.use_e(*e, id),
                SNode::Switch { v, cases } => {
                    self.add(*v, id, false, None);
                    for c in cases {
                        self.walk(&c.1, Some(id));
                    }
                }
                SNode::SetState { v, .. } => {
                    self.add(*v, id, true, None);
                    self.count_def(*v, true);
                }
                _ => {}
            }
        }
    }
}

/// declarations(f, body): `let` / `const` at the first definition when it sits in the innermost list
/// common to all references (and does not read the variable), else hoisted (sorted ids). Also the
/// variables the body mentions (decompile's `used`: the same references).
pub fn declarations(ir: &Ir, f: &Func, tree: &Tree) -> (Decls, Vec<u32>, Vec<bool>) {
    let mut w = DeclWalk {
        ir,
        tree,
        refs: Vec::new(),
        def_count: Vec::new(),
        parent: Vec::new(),
        depth: Vec::new(),
        scratch: Vec::new(),
    };
    w.walk(&tree.body, None);
    let mut decls: Decls = vec![None; tree.stmts.len()];
    let mut hoisted = Vec::new();
    for (v, r) in w.refs.iter().enumerate() {
        if r.first_list == u32::MAX {
            continue;
        }
        let v = v as u32;
        if f.vars.get(v as usize).is_some_and(|x| x.param >= 0) {
            continue;
        }
        let top_def = r.first_def
            && r.first_list == r.common
            && r.first_s.is_some_and(|si| match tree.stmt(si) {
                Stmt::Set { e, .. } => !uses_var(ir, *e, v),
                _ => true,
            });
        if top_def {
            let n = w.def_count.get(v as usize).copied().unwrap_or(0);
            decls[r.first_s.unwrap() as usize] = Some(if n == 1 { "const" } else { "let" });
        } else {
            hoisted.push(v);
        }
    }
    let used = w.refs.iter().map(|r| r.first_list != u32::MAX).collect();
    (decls, hoisted, used)
}
