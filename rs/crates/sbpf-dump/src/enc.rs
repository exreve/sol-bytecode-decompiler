//! Canonical JSON encoding (rs/README.md): keys in a fixed order, compact, `JSON.stringify` escaping.

use sbpf_ir::{CallTarget, Expr, Stmt, Term};

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
    pub fn u(&mut self, k: &str, v: u64) -> &mut Self {
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

fn list(es: &[Expr]) -> String {
    let mut s = String::from("[");
    for (i, e) in es.iter().enumerate() {
        if i > 0 {
            s.push(',');
        }
        s.push_str(&expr(e));
    }
    s.push(']');
    s
}

pub fn expr(e: &Expr) -> String {
    let mut j = J::obj();
    match e {
        Expr::Const(v) => j.s("k", "const").h("v", *v),
        Expr::Var(id) => j.s("k", "var").n("id", *id as i64),
        Expr::Reg(r) => j.s("k", "reg").n("r", *r as i64),
        Expr::Undef => j.s("k", "undef"),
        Expr::Bin(op, a, b) => j
            .s("k", "bin")
            .s("op", op.as_str())
            .raw("a", &expr(a))
            .raw("b", &expr(b)),
        Expr::Neg(a) => j.s("k", "neg").raw("a", &expr(a)),
        Expr::Not(a) => j.s("k", "not").raw("a", &expr(a)),
        Expr::Lnot(a) => j.s("k", "lnot").raw("a", &expr(a)),
        Expr::Ext { signed, bits, a } => j
            .s("k", "ext")
            .b("signed", *signed)
            .n("bits", *bits as i64)
            .raw("a", &expr(a)),
        Expr::Bswap { bits, a } => j.s("k", "bswap").n("bits", *bits as i64).raw("a", &expr(a)),
        Expr::Load { size, addr } => j
            .s("k", "load")
            .n("size", *size as i64)
            .raw("addr", &expr(addr)),
        Expr::Cmp(op, a, b) => j
            .s("k", "cmp")
            .s("op", op.as_str())
            .raw("a", &expr(a))
            .raw("b", &expr(b)),
        Expr::Land(a, b) => j.s("k", "land").raw("a", &expr(a)).raw("b", &expr(b)),
        Expr::Lor(a, b) => j.s("k", "lor").raw("a", &expr(a)).raw("b", &expr(b)),
        Expr::Sel { c, a, b } => j
            .s("k", "sel")
            .raw("c", &expr(c))
            .raw("a", &expr(a))
            .raw("b", &expr(b)),
        Expr::Call { t, args } => j
            .s("k", "call")
            .raw("t", &target(t))
            .raw("args", &list(args)),
        Expr::Fn { name, args } => j.s("k", "fn").s("name", name).raw("args", &list(args)),
    };
    j.done()
}

pub fn target(t: &CallTarget) -> String {
    let mut j = J::obj();
    match t {
        CallTarget::Fn { pc } => j.s("k", "fn").n("pc", *pc),
        CallTarget::Sys { name, hash } => j.s("k", "sys").s("name", name).n("hash", *hash as i64),
        CallTarget::Ind { e } => j.s("k", "ind").raw("e", &expr(e)),
    };
    j.done()
}

pub fn stmt(s: &Stmt) -> String {
    let mut j = J::obj();
    match s {
        Stmt::Set { dst, e, pc } => j
            .s("k", "set")
            .n("dst", *dst as i64)
            .raw("e", &expr(e))
            .n("pc", *pc),
        Stmt::Store { size, addr, v, pc } => j
            .s("k", "store")
            .n("size", *size as i64)
            .raw("addr", &expr(addr))
            .raw("v", &expr(v))
            .n("pc", *pc),
        Stmt::Call {
            dst,
            t,
            args,
            pc,
            extra,
        } => {
            j.s("k", "call")
                .n("dst", *dst as i64)
                .raw("t", &target(t))
                .raw("args", &list(args))
                .n("pc", *pc);
            if let Some(x) = extra {
                j.raw("extra", &list(x));
            }
            &mut j
        }
        Stmt::Eval { e, pc } => j.s("k", "eval").raw("e", &expr(e)).n("pc", *pc),
        Stmt::Stores {
            size,
            addr,
            vals,
            pc,
        } => j
            .s("k", "stores")
            .n("size", *size as i64)
            .raw("addr", &expr(addr))
            .raw("vals", &list(vals))
            .n("pc", *pc),
        Stmt::Copy {
            dst,
            src,
            n,
            pc,
            rev,
        } => {
            j.s("k", "copy")
                .raw("dst", &expr(dst))
                .raw("src", &expr(src))
                .u("n", *n)
                .n("pc", *pc);
            if let Some(r) = rev {
                j.b("rev", *r);
            }
            &mut j
        }
        Stmt::Trap { msg, pc } => j.s("k", "trap").s("msg", msg).n("pc", *pc),
    };
    j.done()
}

pub fn term(t: &Term) -> String {
    let mut j = J::obj();
    match t {
        Term::Jmp { to } => j.s("k", "jmp").n("to", *to),
        Term::Br { c, t, f } => j.s("k", "br").raw("c", &expr(c)).n("t", *t).n("f", *f),
        Term::Ret { e } => j
            .s("k", "ret")
            .raw("e", &e.as_ref().map_or("null".into(), expr)),
        Term::Trap { msg } => j.s("k", "trap").s("msg", msg),
        Term::Tail => j.s("k", "tail").raw("e", "null"),
    };
    j.done()
}
