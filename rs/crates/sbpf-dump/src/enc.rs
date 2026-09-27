//! Canonical JSON encoding (rs/README.md): keys in a fixed order, compact, `JSON.stringify` escaping.

use sbpf_ir::{CallTarget, Ir, Node, Stmt, Term, E, L};

pub const FORMAT: i64 = 1;

/// A JSON object written key by key, in call order.
pub struct J(String);

impl J {
    pub fn obj() -> Self {
        J(String::from("{"))
    }
    fn key(&mut self, k: &str) {
        if self.0.len() > 1 {
            self.0.push(',');
        }
        self.0.push('"');
        self.0.push_str(k);
        self.0.push_str("\":");
    }
    pub fn raw(&mut self, k: &str, v: &str) -> &mut Self {
        self.key(k);
        self.0.push_str(v);
        self
    }
    pub fn s(&mut self, k: &str, v: &str) -> &mut Self {
        self.key(k);
        push_str(&mut self.0, v);
        self
    }
    pub fn n(&mut self, k: &str, v: i64) -> &mut Self {
        self.key(k);
        self.0.push_str(&v.to_string());
        self
    }
    /// a JS number (JSON.stringify format)
    pub fn f(&mut self, k: &str, v: f64) -> &mut Self {
        self.key(k);
        self.0.push_str(&js_num(v));
        self
    }
    /// bigint: "0x" + lowercase hex
    pub fn h(&mut self, k: &str, v: u64) -> &mut Self {
        self.key(k);
        self.0.push_str(&format!("\"0x{v:x}\""));
        self
    }
    pub fn b(&mut self, k: &str, v: bool) -> &mut Self {
        self.key(k);
        self.0.push_str(if v { "true" } else { "false" });
        self
    }
    pub fn done(&mut self) -> String {
        let mut s = std::mem::take(&mut self.0);
        s.push('}');
        s
    }
    pub fn line(&mut self, out: &mut String) {
        out.push_str(&self.done());
        out.push('\n');
    }
}

pub fn push_str(out: &mut String, s: &str) {
    if s.bytes().all(|b| b >= 0x20 && b != b'"' && b != b'\\') {
        out.push('"');
        out.push_str(s);
        out.push('"');
        return;
    }
    out.push_str(&serde_json::to_string(s).unwrap());
}

/// `JSON.stringify(x)` of a finite number: shortest round-trip digits; exponent form from 1e21.
pub fn js_num(x: f64) -> String {
    if x == 0.0 {
        return "0".into();
    }
    if x.abs() < 1e21 && x.abs() >= 1e-6 {
        return format!("{x}");
    }
    let s = format!("{x:e}");
    match s.split_once('e') {
        Some((m, e)) if !e.starts_with('-') => format!("{m}e+{e}"),
        _ => s,
    }
}

pub fn header(stage: &str) -> String {
    let mut j = J::obj();
    j.s("stage", stage).n("format", FORMAT);
    j.done() + "\n"
}

pub fn err_line(msg: &str) -> String {
    let mut j = J::obj();
    j.s("error", msg);
    j.done() + "\n"
}

pub fn nums(it: impl Iterator<Item = i64>) -> String {
    let mut s = String::from("[");
    for (i, v) in it.enumerate() {
        if i > 0 {
            s.push(',');
        }
        s.push_str(&v.to_string());
    }
    s.push(']');
    s
}

pub fn strs<'a>(it: impl Iterator<Item = &'a str>) -> String {
    let mut s = String::from("[");
    for (i, v) in it.enumerate() {
        if i > 0 {
            s.push(',');
        }
        push_str(&mut s, v);
    }
    s.push(']');
    s
}

/// FNV-1a 64, 16 hex digits.
pub fn fnv64(b: &[u8]) -> String {
    let mut h: u64 = 0xcbf29ce484222325;
    for &x in b {
        h ^= x as u64;
        h = h.wrapping_mul(0x100000001b3);
    }
    format!("{h:016x}")
}

// ---------- IR (written straight into the output) ----------

fn num(o: &mut String, v: i64) {
    use std::fmt::Write;
    let _ = write!(o, "{v}");
}

fn hexv(o: &mut String, v: u64) {
    use std::fmt::Write;
    let _ = write!(o, "\"0x{v:x}\"");
}

pub fn list(ir: &Ir, l: L, o: &mut String) {
    o.push('[');
    for (i, e) in ir.items(l).enumerate() {
        if i > 0 {
            o.push(',');
        }
        expr(ir, e, o);
    }
    o.push(']');
}

fn un(ir: &Ir, k: &str, a: E, o: &mut String) {
    o.push_str("{\"k\":\"");
    o.push_str(k);
    o.push_str("\",\"a\":");
    expr(ir, a, o);
    o.push('}');
}

fn bi(ir: &Ir, k: &str, op: Option<&str>, a: E, b: E, o: &mut String) {
    o.push_str("{\"k\":\"");
    o.push_str(k);
    if let Some(op) = op {
        o.push_str("\",\"op\":\"");
        o.push_str(op);
    }
    o.push_str("\",\"a\":");
    expr(ir, a, o);
    o.push_str(",\"b\":");
    expr(ir, b, o);
    o.push('}');
}

pub fn expr(ir: &Ir, e: E, o: &mut String) {
    match ir.get(e) {
        Node::Const(v) => {
            o.push_str("{\"k\":\"const\",\"v\":");
            hexv(o, v);
            o.push('}');
        }
        Node::Var(id) => {
            o.push_str("{\"k\":\"var\",\"id\":");
            num(o, id as i64);
            o.push('}');
        }
        Node::Reg(r) => {
            o.push_str("{\"k\":\"reg\",\"r\":");
            num(o, r as i64);
            o.push('}');
        }
        Node::Undef => o.push_str("{\"k\":\"undef\"}"),
        Node::Bin(op, a, b) => bi(ir, "bin", Some(op.as_str()), a, b, o),
        Node::Cmp(op, a, b) => bi(ir, "cmp", Some(op.as_str()), a, b, o),
        Node::Land(a, b) => bi(ir, "land", None, a, b, o),
        Node::Lor(a, b) => bi(ir, "lor", None, a, b, o),
        Node::Neg(a) => un(ir, "neg", a, o),
        Node::Not(a) => un(ir, "not", a, o),
        Node::Lnot(a) => un(ir, "lnot", a, o),
        Node::Ext { signed, bits, a } => {
            o.push_str(if signed {
                "{\"k\":\"ext\",\"signed\":true,\"bits\":"
            } else {
                "{\"k\":\"ext\",\"signed\":false,\"bits\":"
            });
            num(o, bits as i64);
            o.push_str(",\"a\":");
            expr(ir, a, o);
            o.push('}');
        }
        Node::Bswap { bits, a } => {
            o.push_str("{\"k\":\"bswap\",\"bits\":");
            num(o, bits as i64);
            o.push_str(",\"a\":");
            expr(ir, a, o);
            o.push('}');
        }
        Node::Load { size, addr } => {
            o.push_str("{\"k\":\"load\",\"size\":");
            num(o, size as i64);
            o.push_str(",\"addr\":");
            expr(ir, addr, o);
            o.push('}');
        }
        Node::Sel(c, a, b) => {
            o.push_str("{\"k\":\"sel\",\"c\":");
            expr(ir, c, o);
            o.push_str(",\"a\":");
            expr(ir, a, o);
            o.push_str(",\"b\":");
            expr(ir, b, o);
            o.push('}');
        }
        Node::Call(t, args) => {
            o.push_str("{\"k\":\"call\",\"t\":");
            target(ir, &ir.target(t), o);
            o.push_str(",\"args\":");
            list(ir, args, o);
            o.push('}');
        }
        Node::Fn(name, args) => {
            o.push_str("{\"k\":\"fn\",\"name\":");
            push_str(o, &ir.name(name));
            o.push_str(",\"args\":");
            list(ir, args, o);
            o.push('}');
        }
        Node::Item(_) => unreachable!("list item as expression"),
    }
}

pub fn target(ir: &Ir, t: &CallTarget, o: &mut String) {
    match t {
        CallTarget::Fn { pc } => {
            o.push_str("{\"k\":\"fn\",\"pc\":");
            num(o, *pc);
            o.push('}');
        }
        CallTarget::Sys { name, hash } => {
            o.push_str("{\"k\":\"sys\",\"name\":");
            push_str(o, name);
            o.push_str(",\"hash\":");
            num(o, *hash as i64);
            o.push('}');
        }
        CallTarget::Ind { e } => {
            o.push_str("{\"k\":\"ind\",\"e\":");
            expr(ir, *e, o);
            o.push('}');
        }
    }
}

pub fn stmt(ir: &Ir, s: &Stmt, o: &mut String) {
    let pc = match s {
        Stmt::Set { dst, e, pc } => {
            o.push_str("{\"k\":\"set\",\"dst\":");
            num(o, *dst as i64);
            o.push_str(",\"e\":");
            expr(ir, *e, o);
            pc
        }
        Stmt::Store { size, addr, v, pc } => {
            o.push_str("{\"k\":\"store\",\"size\":");
            num(o, *size as i64);
            o.push_str(",\"addr\":");
            expr(ir, *addr, o);
            o.push_str(",\"v\":");
            expr(ir, *v, o);
            pc
        }
        Stmt::Call {
            dst, t, args, pc, ..
        } => {
            o.push_str("{\"k\":\"call\",\"dst\":");
            num(o, *dst as i64);
            o.push_str(",\"t\":");
            target(ir, t, o);
            o.push_str(",\"args\":");
            list(ir, *args, o);
            pc
        }
        Stmt::Eval { e, pc } => {
            o.push_str("{\"k\":\"eval\",\"e\":");
            expr(ir, *e, o);
            pc
        }
        Stmt::Stores {
            size,
            addr,
            vals,
            pc,
        } => {
            o.push_str("{\"k\":\"stores\",\"size\":");
            num(o, *size as i64);
            o.push_str(",\"addr\":");
            expr(ir, *addr, o);
            o.push_str(",\"vals\":");
            list(ir, *vals, o);
            pc
        }
        Stmt::Copy {
            dst, src, n, pc, ..
        } => {
            o.push_str("{\"k\":\"copy\",\"dst\":");
            expr(ir, *dst, o);
            o.push_str(",\"src\":");
            expr(ir, *src, o);
            o.push_str(",\"n\":");
            o.push_str(&n.to_string());
            pc
        }
        Stmt::Trap { msg, pc } => {
            o.push_str("{\"k\":\"trap\",\"msg\":");
            push_str(o, msg);
            pc
        }
    };
    o.push_str(",\"pc\":");
    num(o, *pc);
    match s {
        Stmt::Call { extra: Some(x), .. } => {
            o.push_str(",\"extra\":");
            list(ir, *x, o);
        }
        Stmt::Copy { rev: Some(r), .. } => {
            o.push_str(if *r { ",\"rev\":true" } else { ",\"rev\":false" });
        }
        _ => {}
    }
    o.push('}');
}

pub fn stmts(ir: &Ir, ss: &[Stmt], o: &mut String) {
    o.push('[');
    for (i, s) in ss.iter().enumerate() {
        if i > 0 {
            o.push(',');
        }
        stmt(ir, s, o);
    }
    o.push(']');
}

pub fn term(ir: &Ir, t: &Term, o: &mut String) {
    match t {
        Term::Jmp { to } => {
            o.push_str("{\"k\":\"jmp\",\"to\":");
            num(o, *to);
        }
        Term::Br { c, t, f } => {
            o.push_str("{\"k\":\"br\",\"c\":");
            expr(ir, *c, o);
            o.push_str(",\"t\":");
            num(o, *t);
            o.push_str(",\"f\":");
            num(o, *f);
        }
        Term::Ret { e } => {
            o.push_str("{\"k\":\"ret\",\"e\":");
            match e {
                Some(e) => expr(ir, *e, o),
                None => o.push_str("null"),
            }
        }
        Term::Trap { msg } => {
            o.push_str("{\"k\":\"trap\",\"msg\":");
            push_str(o, msg);
        }
        Term::Tail => o.push_str("{\"k\":\"tail\",\"e\":null"),
    }
    o.push('}');
}

/// `f(ir, x, out)` into a new string.
pub fn to_s<T: ?Sized>(ir: &Ir, x: &T, f: fn(&Ir, &T, &mut String)) -> String {
    let mut o = String::new();
    f(ir, x, &mut o);
    o
}
