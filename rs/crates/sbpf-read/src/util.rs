//! JS semantics helpers (numbers, strings, JSON) and IR helpers shared by the readable-output modules.
//!
//! Offsets and sizes that the TS computes as `number` from IR constants (`Number(BigInt.asIntN(64, c))`)
//! are `f64` here ([`N`]), with the same double arithmetic: a constant beyond 2^53 rounds, and two such
//! offsets can compare or hash equal exactly when they do in the TS. Map keys over them use [`K`]
//! (SameValueZero: -0 and +0 are one key).

use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, Term, E, L};
use sbpf_program::Func;
use sbpf_struct::SNode;

/// A TS runtime error (TypeError etc.) thrown out of the whole decompilation (caught at the top).
pub struct JsError(pub String);

pub fn js_throw(m: &str) -> ! {
    std::panic::panic_any(JsError(m.into()))
}

/// A JS number.
pub type N = f64;

/// Number(BigInt.asIntN(64, v))
#[inline]
pub fn n_s(v: u64) -> N {
    v as i64 as f64
}
/// Number(v) of a u64 bigint
#[inline]
pub fn n_u(v: u64) -> N {
    v as f64
}

/// A number as a Map / Set key (SameValueZero).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct K(pub u64);
impl K {
    #[inline]
    pub fn of(x: N) -> K {
        K(if x == 0.0 { 0 } else { x.to_bits() })
    }
    #[inline]
    pub fn get(self) -> N {
        f64::from_bits(self.0)
    }
}

/// BigInt.asUintN(64, BigInt(x)) of an integral double.
#[inline]
pub fn big_u(x: N) -> u64 {
    (x as i128) as u64
}

/// ToInt32
pub fn to_int32(x: N) -> i32 {
    if !x.is_finite() {
        return 0;
    }
    let t = x.trunc();
    let m = t.rem_euclid(4294967296.0);
    (m as u64 as u32) as i32
}

/// `JSON.stringify(x)` / String(x) of a finite number.
pub fn js_num(x: N) -> String {
    if x == 0.0 {
        return "0".into();
    }
    if x.is_nan() {
        return "NaN".into();
    }
    if x.is_infinite() {
        return if x > 0.0 { "Infinity" } else { "-Infinity" }.into();
    }
    if x.fract() == 0.0 && x.abs() < 9007199254740992.0 {
        // (integers: the same digits as the float's shortest form)
        return (x as i64).to_string();
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

/// `x.toString(16)` of an integral number.
pub fn js_hex(x: N) -> String {
    if x < 0.0 {
        return format!("-{}", js_hex(-x));
    }
    if x.is_infinite() {
        return "Infinity".into();
    }
    format!("{:x}", x as u128)
}

/// JSON.stringify of a string.
pub fn json_str(s: &str) -> String {
    let mut o = String::with_capacity(s.len() + 2);
    json_str_into(&mut o, s);
    o
}

/// `JSON.stringify(s)` appended to `o` (serde_json's escaping; plain strings copied as they are).
pub fn json_str_into(o: &mut String, s: &str) {
    if s.bytes().any(|b| b < 0x20 || b == b'"' || b == b'\\') {
        o.push_str(&serde_json::to_string(s).unwrap());
    } else {
        o.push('"');
        o.push_str(s);
        o.push('"');
    }
}

/// UTF-16 length of a string (JS `.length`).
pub fn u16len(s: &str) -> usize {
    // one unit per char (every byte but continuation bytes), two for 4-byte sequences
    s.bytes().filter(|&b| b & 0xc0 != 0x80).count() + s.bytes().filter(|&b| b >= 0xf0).count()
}

/// `s.padEnd(n)` (UTF-16 length).
pub fn pad_end(s: &str, n: f64) -> String {
    let l = u16len(s) as f64;
    let mut o = s.to_string();
    if n > l {
        for _ in 0..(n - l) as usize {
            o.push(' ');
        }
    }
    o
}

/// `/^fn_[0-9a-f]+$/`
pub fn is_fn_hex(n: &str) -> bool {
    n.strip_prefix("fn_").is_some_and(|r| {
        !r.is_empty()
            && r.bytes()
                .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
    })
}

/// `/^(memcpy|memmove)\d*_?$/`
pub fn is_memcpy_name(n: &str) -> bool {
    let r = n
        .strip_prefix("memcpy")
        .or_else(|| n.strip_prefix("memmove"));
    match r {
        Some(r) => {
            let r = r.strip_suffix('_').unwrap_or(r);
            r.bytes().all(|c| c.is_ascii_digit())
        }
        None => false,
    }
}

/// `x.replace(/_[0-9a-f]+$/, '')` (with `min` hex digits at least)
pub fn strip_hex_suffix(n: &str, min: usize) -> &str {
    if let Some(i) = n.rfind('_') {
        let t = &n[i + 1..];
        if t.len() >= min
            && t.bytes()
                .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
        {
            return &n[..i];
        }
    }
    n
}

/// `pascal`: `a_b` -> `AB` (split on `_`, first letter upper-cased).
pub fn pascal_us(s: &str) -> String {
    s.split('_')
        .filter(|w| !w.is_empty())
        .map(|w| {
            let mut c = w.chars();
            let f = c.next().unwrap();
            f.to_uppercase().collect::<String>() + c.as_str()
        })
        .collect()
}

/// `s[0].toUpperCase() + s.slice(1)`
pub fn upper_first(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        Some(f) => {
            let u: String = if (f as u32) < 0x10000 {
                f.to_uppercase().collect()
            } else {
                f.to_string()
            };
            u + c.as_str()
        }
        None => String::new(),
    }
}

/// `.replace(/([a-z0-9])([A-Z])/g, '$1_$2')`
pub fn camel_us(s: &str) -> String {
    let b: Vec<char> = s.chars().collect();
    let mut o = String::with_capacity(s.len() + 4);
    let mut i = 0;
    while i < b.len() {
        if i + 1 < b.len()
            && (b[i].is_ascii_lowercase() || b[i].is_ascii_digit())
            && b[i + 1].is_ascii_uppercase()
        {
            o.push(b[i]);
            o.push('_');
            o.push(b[i + 1]);
            i += 2;
        } else {
            o.push(b[i]);
            i += 1;
        }
    }
    o
}

/// `.replace(/([a-z])([A-Z])/g, '$1 $2')`
pub fn camel_split_space(s: &str) -> String {
    let b: Vec<char> = s.chars().collect();
    let mut o = String::with_capacity(s.len() + 4);
    let mut i = 0;
    while i < b.len() {
        if i + 1 < b.len() && b[i].is_ascii_lowercase() && b[i + 1].is_ascii_uppercase() {
            o.push(b[i]);
            o.push(' ');
            o.push(b[i + 1]);
            i += 2;
        } else {
            o.push(b[i]);
            i += 1;
        }
    }
    o
}

// ---------------- IR helpers ----------------

/// exprEq (ir.ts): structural equality; calls are never equal.
pub fn expr_eq(ir: &Ir, a: E, b: E) -> bool {
    if a == b {
        // (the same object: equal unless it contains a call)
        return !has_call(ir, a);
    }
    match (ir.get(a), ir.get(b)) {
        (Node::Const(p), Node::Const(q)) => p == q,
        (Node::Var(p), Node::Var(q)) => p == q,
        (Node::Reg(p), Node::Reg(q)) => p == q,
        (Node::Undef, Node::Undef) => true,
        (Node::Bin(o, a1, b1), Node::Bin(p, a2, b2)) => {
            o == p && expr_eq(ir, a1, a2) && expr_eq(ir, b1, b2)
        }
        (Node::Cmp(o, a1, b1), Node::Cmp(p, a2, b2)) => {
            o == p && expr_eq(ir, a1, a2) && expr_eq(ir, b1, b2)
        }
        (Node::Land(a1, b1), Node::Land(a2, b2)) | (Node::Lor(a1, b1), Node::Lor(a2, b2)) => {
            expr_eq(ir, a1, a2) && expr_eq(ir, b1, b2)
        }
        (Node::Neg(p), Node::Neg(q))
        | (Node::Not(p), Node::Not(q))
        | (Node::Lnot(p), Node::Lnot(q)) => expr_eq(ir, p, q),
        (
            Node::Ext {
                signed: s1,
                bits: b1,
                a: p,
            },
            Node::Ext {
                signed: s2,
                bits: b2,
                a: q,
            },
        ) => s1 == s2 && b1 == b2 && expr_eq(ir, p, q),
        (Node::Bswap { bits: b1, a: p }, Node::Bswap { bits: b2, a: q }) => {
            b1 == b2 && expr_eq(ir, p, q)
        }
        (Node::Load { size: s1, addr: p }, Node::Load { size: s2, addr: q }) => {
            s1 == s2 && expr_eq(ir, p, q)
        }
        (Node::Sel(c1, a1, b1), Node::Sel(c2, a2, b2)) => {
            expr_eq(ir, c1, c2) && expr_eq(ir, a1, a2) && expr_eq(ir, b1, b2)
        }
        (Node::Fn(n1, l1), Node::Fn(n2, l2)) => {
            ir.with_name(n1, |p| ir.with_name(n2, |q| p == q))
                && l1.len == l2.len
                && (0..l1.len).all(|k| expr_eq(ir, ir.at(l1, k), ir.at(l2, k)))
        }
        _ => false,
    }
}

pub fn has_call(ir: &Ir, e: E) -> bool {
    let mut c = false;
    ir.walk(e, &mut |_, n| {
        if let Node::Call(..) = n {
            c = true;
        }
    });
    c
}

/// Structural equality as JSON.stringify sees it (calls included).
pub fn json_eq(ir: &Ir, a: E, b: E) -> bool {
    if a == b {
        return true;
    }
    match (ir.get(a), ir.get(b)) {
        (Node::Call(t1, l1), Node::Call(t2, l2)) => {
            let tq = match (ir.target(t1), ir.target(t2)) {
                (CallTarget::Ind { e: x }, CallTarget::Ind { e: y }) => json_eq(ir, x, y),
                (x, y) => x == y,
            };
            tq && l1.len == l2.len && (0..l1.len).all(|k| json_eq(ir, ir.at(l1, k), ir.at(l2, k)))
        }
        (Node::Bin(o, a1, b1), Node::Bin(p, a2, b2)) => {
            o == p && json_eq(ir, a1, a2) && json_eq(ir, b1, b2)
        }
        (Node::Cmp(o, a1, b1), Node::Cmp(p, a2, b2)) => {
            o == p && json_eq(ir, a1, a2) && json_eq(ir, b1, b2)
        }
        (Node::Land(a1, b1), Node::Land(a2, b2)) | (Node::Lor(a1, b1), Node::Lor(a2, b2)) => {
            json_eq(ir, a1, a2) && json_eq(ir, b1, b2)
        }
        (Node::Neg(p), Node::Neg(q))
        | (Node::Not(p), Node::Not(q))
        | (Node::Lnot(p), Node::Lnot(q)) => json_eq(ir, p, q),
        (
            Node::Ext {
                signed: s1,
                bits: b1,
                a: p,
            },
            Node::Ext {
                signed: s2,
                bits: b2,
                a: q,
            },
        ) => s1 == s2 && b1 == b2 && json_eq(ir, p, q),
        (Node::Bswap { bits: b1, a: p }, Node::Bswap { bits: b2, a: q }) => {
            b1 == b2 && json_eq(ir, p, q)
        }
        (Node::Load { size: s1, addr: p }, Node::Load { size: s2, addr: q }) => {
            s1 == s2 && json_eq(ir, p, q)
        }
        (Node::Sel(c1, a1, b1), Node::Sel(c2, a2, b2)) => {
            json_eq(ir, c1, c2) && json_eq(ir, a1, a2) && json_eq(ir, b1, b2)
        }
        (Node::Fn(n1, l1), Node::Fn(n2, l2)) => {
            ir.with_name(n1, |p| ir.with_name(n2, |q| p == q))
                && l1.len == l2.len
                && (0..l1.len).all(|k| json_eq(ir, ir.at(l1, k), ir.at(l2, k)))
        }
        (x, y) => x == y,
    }
}

/// A canonical text of an expression, equal for two expressions exactly when their JSON.stringify is.
pub fn jkey(ir: &Ir, e: E, o: &mut String) {
    use std::fmt::Write;
    match ir.get(e) {
        Node::Const(v) => write!(o, "#{v:x}").unwrap(),
        Node::Var(v) => write!(o, "v{v}").unwrap(),
        Node::Reg(r) => write!(o, "r{r}").unwrap(),
        Node::Undef => o.push('U'),
        Node::Bin(op, a, b) => {
            write!(o, "({}", op.as_str()).unwrap();
            o.push(' ');
            jkey(ir, a, o);
            o.push(' ');
            jkey(ir, b, o);
            o.push(')');
        }
        Node::Cmp(op, a, b) => {
            write!(o, "(c{}", op.as_str()).unwrap();
            o.push(' ');
            jkey(ir, a, o);
            o.push(' ');
            jkey(ir, b, o);
            o.push(')');
        }
        Node::Land(a, b) | Node::Lor(a, b) => {
            o.push_str(if matches!(ir.get(e), Node::Land(..)) {
                "(&& "
            } else {
                "(|| "
            });
            jkey(ir, a, o);
            o.push(' ');
            jkey(ir, b, o);
            o.push(')');
        }
        Node::Neg(a) => {
            o.push_str("(neg ");
            jkey(ir, a, o);
            o.push(')');
        }
        Node::Not(a) => {
            o.push_str("(not ");
            jkey(ir, a, o);
            o.push(')');
        }
        Node::Lnot(a) => {
            o.push_str("(lnot ");
            jkey(ir, a, o);
            o.push(')');
        }
        Node::Ext { signed, bits, a } => {
            write!(o, "(ext{}{} ", if signed { 's' } else { 'u' }, bits).unwrap();
            jkey(ir, a, o);
            o.push(')');
        }
        Node::Bswap { bits, a } => {
            write!(o, "(bswap{bits} ").unwrap();
            jkey(ir, a, o);
            o.push(')');
        }
        Node::Load { size, addr } => {
            write!(o, "[{size} ").unwrap();
            jkey(ir, addr, o);
            o.push(']');
        }
        Node::Sel(c, a, b) => {
            o.push_str("(? ");
            jkey(ir, c, o);
            o.push(' ');
            jkey(ir, a, o);
            o.push(' ');
            jkey(ir, b, o);
            o.push(')');
        }
        Node::Call(t, args) => {
            o.push_str("(call ");
            match ir.target(t) {
                CallTarget::Fn { pc } => write!(o, "fn{pc}").unwrap(),
                CallTarget::Sys { name, hash } => {
                    write!(o, "sys{}:{hash}", json_str(&name)).unwrap()
                }
                CallTarget::Ind { e } => {
                    o.push_str("ind");
                    jkey(ir, e, o);
                }
            }
            for a in ir.items(args) {
                o.push(' ');
                jkey(ir, a, o);
            }
            o.push(')');
        }
        Node::Fn(n, args) => {
            o.push_str("(fn ");
            ir.with_name(n, |x| o.push_str(&json_str(x)));
            for a in ir.items(args) {
                o.push(' ');
                jkey(ir, a, o);
            }
            o.push(')');
        }
        Node::Item(_) => unreachable!(),
    }
}

pub fn jkey_s(ir: &Ir, e: E) -> String {
    let mut s = String::new();
    jkey(ir, e, &mut s);
    s
}

/// `v + c` (or `v`): the variable and the constant.
pub fn var_off(ir: &Ir, e: E) -> Option<(u32, u64)> {
    match ir.get(e) {
        Node::Var(v) => Some((v, 0)),
        Node::Bin(BinOp::Add, a, b) => match (ir.get(a), ir.get(b)) {
            (Node::Var(v), Node::Const(c)) => Some((v, c)),
            _ => None,
        },
        _ => None,
    }
}

/// `fp + c` only (not `fp` itself): the offset as a number.
pub fn fo_add(ir: &Ir, e: E, fp: Option<u32>) -> Option<N> {
    let fp = fp?;
    match ir.get(e) {
        Node::Bin(BinOp::Add, a, b) => match (ir.get(a), ir.get(b)) {
            (Node::Var(v), Node::Const(c)) if v == fp => Some(n_s(c)),
            _ => None,
        },
        _ => None,
    }
}

/// `fp` (0) or `fp + c`.
pub fn fo_any(ir: &Ir, e: E, fp: Option<u32>) -> Option<N> {
    let fpv = fp?;
    if ir.get(e) == Node::Var(fpv) {
        return Some(0.0);
    }
    fo_add(ir, e, fp)
}

/// `e.k === 'bin' && e.op === 'add' && e.b.k === 'const'`: (a, c)
pub fn add_const(ir: &Ir, e: E) -> Option<(E, u64)> {
    match ir.get(e) {
        Node::Bin(BinOp::Add, a, b) => match ir.get(b) {
            Node::Const(c) => Some((a, c)),
            _ => None,
        },
        _ => None,
    }
}

pub fn cv(ir: &Ir, e: E) -> Option<u64> {
    match ir.get(e) {
        Node::Const(v) => Some(v),
        _ => None,
    }
}

pub fn var_of(ir: &Ir, e: E) -> Option<u32> {
    match ir.get(e) {
        Node::Var(v) => Some(v),
        _ => None,
    }
}

pub fn is_var(ir: &Ir, e: E, v: u32) -> bool {
    ir.get(e) == Node::Var(v)
}

pub fn uses_var(ir: &Ir, e: E, v: u32) -> bool {
    let mut u = false;
    ir.walk(e, &mut |_, n| {
        if n == Node::Var(v) {
            u = true;
        }
    });
    u
}

/// stmtExprs (simplify.ts)
pub fn stmt_exprs(ir: &Ir, s: &Stmt) -> Vec<E> {
    let mut v = Vec::new();
    sbpf_opt::stmt_exprs(ir, s, &mut v);
    v
}

/// A call statement or a set of a call expression: target and arguments (`st.k === 'call' ? st : st.k ===
/// 'set' && st.e.k === 'call' ? st.e : undefined`).
pub fn call_of(ir: &Ir, s: &Stmt) -> Option<(CallTarget, L)> {
    match s {
        Stmt::Call { t, args, .. } => Some((t.clone(), *args)),
        Stmt::Set { e, .. } => match ir.get(*e) {
            Node::Call(t, args) => Some((ir.target(t), args)),
            _ => None,
        },
        _ => None,
    }
}

/// The destination variable of a set / call statement (`dst >= 0`).
pub fn dst_of(s: &Stmt) -> Option<u32> {
    match s {
        Stmt::Set { dst, .. } | Stmt::Call { dst, .. } if *dst >= 0 => Some(*dst as u32),
        _ => None,
    }
}

pub fn stmt_pc(s: &Stmt) -> i64 {
    match s {
        Stmt::Set { pc, .. }
        | Stmt::Store { pc, .. }
        | Stmt::Call { pc, .. }
        | Stmt::Eval { pc, .. }
        | Stmt::Stores { pc, .. }
        | Stmt::Copy { pc, .. }
        | Stmt::Trap { pc, .. } => *pc,
    }
}

/// The frame pointer variable (parameter r10).
pub fn fp_var(f: &Func) -> Option<u32> {
    f.vars.iter().find(|v| v.param == 10).map(|v| v.id)
}

/// The variable of parameter register `reg`.
pub fn param_var(f: &Func, reg: i32) -> Option<u32> {
    f.vars.iter().find(|v| v.param == reg).map(|v| v.id)
}

/// `f.vars[v]?.param` (None: no such variable)
pub fn param_of(f: &Func, v: u32) -> Option<i32> {
    f.vars.get(v as usize).map(|x| x.param)
}

/// `f.vars[v]?.param >= 0`
pub fn is_param(f: &Func, v: u32) -> bool {
    param_of(f, v).is_some_and(|p| p >= 0)
}

/// `f.vars[v]?.param < 0`
pub fn is_local(f: &Func, v: u32) -> bool {
    param_of(f, v).is_some_and(|p| p < 0)
}

/// The register of a call's i-th argument (stack-passed arguments: 100 + k).
pub fn arg_reg(callee: &Func, i: usize) -> i32 {
    if callee.stack_args.unwrap_or(0) > 0 {
        if i < 4 {
            i as i32 + 1
        } else {
            100 + (i as i32 - 4)
        }
    } else {
        i as i32 + 1
    }
}

/// The expression of a branch terminator / return.
pub fn term_br(t: &Term) -> Option<E> {
    match t {
        Term::Br { c, .. } => Some(*c),
        _ => None,
    }
}
pub fn term_ret(t: &Term) -> Option<E> {
    match t {
        Term::Ret { e } => *e,
        _ => None,
    }
}

/// childLists
pub fn child_lists(n: &SNode) -> Vec<&Vec<SNode>> {
    match n {
        SNode::If { then, els, .. } => vec![then, els],
        SNode::Block { body, .. } | SNode::Loop { body, .. } => vec![body],
        SNode::Switch { cases, .. } => cases.iter().map(|c| &c.1).collect(),
        _ => vec![],
    }
}

/// Definition counts per variable (defCount).
pub fn def_counts(f: &Func) -> Vec<u32> {
    let mut m = vec![0u32; f.vars.len()];
    for b in &f.blocks {
        for s in &b.stmts {
            if let Some(d) = dst_of(s) {
                if d as usize >= m.len() {
                    m.resize(d as usize + 1, 0);
                }
                m[d as usize] += 1;
            }
        }
    }
    m
}

/// base58 of 32 bytes (b58)
pub fn b58(b: &[u8]) -> String {
    sbpf_print::print::b58(b)
}

const B58: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/// unb58: at least 32 bytes (left-padded with zeros).
pub fn unb58(s: &str) -> Vec<u8> {
    // n = n * 58 + index (index -1 for an unknown character, as indexOf)
    let mut n: Vec<u32> = Vec::new(); // little-endian base-2^8 digits of a signed big number (only >= 0 handled)
    let mut neg = false;
    let mut mag: Vec<u64> = vec![0]; // little-endian base 2^32
    let _ = &mut n;
    for c in s.chars() {
        let idx = B58
            .iter()
            .position(|&x| x as char == c)
            .map_or(-1i64, |i| i as i64);
        // mag = mag * 58 + idx (with sign)
        let mut carry: u64 = 0;
        for d in mag.iter_mut() {
            let x = *d * 58 + carry;
            *d = x & 0xffff_ffff;
            carry = x >> 32;
        }
        if carry > 0 {
            mag.push(carry);
        }
        if idx >= 0 {
            if neg {
                // mag is -|mag|: -m*58 + idx
                neg = !sub_small(&mut mag, idx as u64, true);
            } else {
                add_small(&mut mag, idx as u64);
            }
        } else if neg {
            add_small(&mut mag, 1);
        } else if mag.iter().all(|&d| d == 0) {
            mag = vec![1];
            neg = true;
        } else {
            sub_small(&mut mag, 1, false);
        }
    }
    let mut out: Vec<u8> = Vec::new();
    if !neg {
        // big-endian bytes of mag
        let mut bytes: Vec<u8> = Vec::new();
        for d in mag.iter() {
            bytes.extend_from_slice(&(*d as u32).to_le_bytes());
        }
        while bytes.last() == Some(&0) {
            bytes.pop();
        }
        bytes.reverse();
        out = bytes;
    }
    for c in s.chars() {
        if c != '1' {
            break;
        }
        out.insert(0, 0);
    }
    while out.len() < 32 {
        out.insert(0, 0);
    }
    out
}

fn add_small(m: &mut Vec<u64>, v: u64) {
    let mut carry = v;
    for d in m.iter_mut() {
        let x = *d + carry;
        *d = x & 0xffff_ffff;
        carry = x >> 32;
        if carry == 0 {
            break;
        }
    }
    if carry > 0 {
        m.push(carry);
    }
}

/// m -= v; returns false when the result went negative (then m holds its magnitude). `rev`: compute v - m.
fn sub_small(m: &mut [u64], v: u64, rev: bool) -> bool {
    let val: u128 = m
        .iter()
        .rev()
        .fold(0u128, |a, &d| a.wrapping_shl(32) | d as u128);
    let (res, pos) = if rev {
        if v as u128 >= val {
            (v as u128 - val, true)
        } else {
            (val - v as u128, false)
        }
    } else if val >= v as u128 {
        (val - v as u128, true)
    } else {
        (v as u128 - val, false)
    };
    for (i, d) in m.iter_mut().enumerate() {
        *d = ((res >> (32 * i)) & 0xffff_ffff) as u64;
    }
    pos
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn b58_roundtrip() {
        let k = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        assert_eq!(b58(&unb58(k)), k);
        assert_eq!(unb58("11111111111111111111111111111111"), vec![0u8; 32]);
    }
    #[test]
    fn nums() {
        assert_eq!(js_num(12.0), "12");
        assert_eq!(js_hex(4096.0), "1000");
        assert_eq!(js_hex(-48.0), "-30");
        assert_eq!(to_int32(4294967297.0), 1);
        assert!(is_memcpy_name("memcpy2_"));
        assert!(!is_memcpy_name("memcpyx"));
        assert_eq!(strip_hex_suffix("foo_1a2b", 1), "foo");
    }
}

/// JS `Math.max(a, b)`: NaN when either is NaN.
pub fn jmax(a: N, b: N) -> N {
    if a.is_nan() || b.is_nan() {
        N::NAN
    } else {
        a.max(b)
    }
}

/// `(0..n).map(f)` on up to `threads` threads with the main thread's stack size (deep recursion).
pub fn par_map_big<R: Send>(n: usize, threads: usize, f: impl Fn(usize) -> R + Sync) -> Vec<R> {
    if threads <= 1 || n <= 1 {
        return (0..n).map(f).collect();
    }
    let next = std::sync::atomic::AtomicUsize::new(0);
    let out: std::sync::Mutex<Vec<Option<R>>> = std::sync::Mutex::new((0..n).map(|_| None).collect());
    std::thread::scope(|s| {
        for _ in 0..threads.min(n) {
            std::thread::Builder::new()
                .stack_size(1 << 30)
                .spawn_scoped(s, || loop {
                    let i = next.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                    if i >= n {
                        break;
                    }
                    let r = f(i);
                    out.lock().unwrap()[i] = Some(r);
                })
                .expect("spawn");
        }
    });
    out.into_inner().unwrap().into_iter().map(|x| x.unwrap()).collect()
}

/// A reference handed to worker threads by a computation that only reads what it reaches. The
/// decompilation state is `Sync` but for the IR arenas' interior mutability (nodes appended through a
/// shared reference) and the `Rc`s of results: sound when the computation appends to no arena another
/// thread reads and clones no `Rc` of the shared state (each use says why).
pub struct Shared<'a, T: ?Sized>(pub &'a T);
unsafe impl<T: ?Sized> Sync for Shared<'_, T> {}
unsafe impl<T: ?Sized> Send for Shared<'_, T> {}
impl<T: ?Sized> Clone for Shared<'_, T> {
    fn clone(&self) -> Self {
        *self
    }
}
impl<T: ?Sized> Copy for Shared<'_, T> {}
impl<'a, T: ?Sized> Shared<'a, T> {
    /// (a method: a closure calling it captures the wrapper, not the reference inside)
    pub fn get(self) -> &'a T {
        self.0
    }
}

/// A value handed back from a worker thread that is not `Send` only because of what it may hold of the
/// shared state (node keys: addresses in shared trees, used as keys only).
pub struct SendBox<T>(pub T);
unsafe impl<T> Send for SendBox<T> {}

/// (`--features sync-check`) what the parallel parts share through `Shared` is `Sync` but for the arenas
#[cfg(feature = "sync-check")]
#[allow(dead_code)]
fn sync_check() {
    fn sync<T: Sync + ?Sized>() {}
    sync::<crate::decompile::Dx<'static>>();
    sync::<[sbpf_struct::Tree]>();
    // (not checked: the outlines' node keys are addresses, the facts' Rc<RefCell<OpCpi>>s in ReadOut are
    // not touched by the rendering's workers)
}

thread_local! {
    /// (a speculative computation runs: a panic is caught, its message not printed)
    static QUIET: std::cell::Cell<bool> = const { std::cell::Cell::new(false) };
}

/// `f()` run speculatively on this thread: None when it panics (the panic hook prints nothing then; the
/// caller redoes the computation for real in its sequential turn, where it panics with its message). A
/// field identity made meanwhile panics (the counter is per thread: identities are made on the calling
/// thread only, in order).
pub fn speculate<R>(f: impl FnOnce() -> R) -> Option<R> {
    static HOOK: std::sync::Once = std::sync::Once::new();
    HOOK.call_once(|| {
        let prev = std::panic::take_hook();
        std::panic::set_hook(Box::new(move |info| {
            if !QUIET.with(|q| q.get()) {
                prev(info)
            }
        }));
    });
    let was = QUIET.with(|q| q.replace(true));
    let nf = crate::views::forbid_new_fields(true);
    let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(f));
    crate::views::forbid_new_fields(nf);
    QUIET.with(|q| q.set(was));
    r.ok()
}

/// `(0..n).map(f).collect()` with the calls on up to `threads` threads, for an `f` whose result and
/// visible effects do not depend on the order of the calls (reads, caches of pure functions, nodes
/// appended to one function's own arena). A call that panics is made again on this thread in its turn
/// (after the results before it: the same panic as one at a time).
pub fn par_map_exact<R: Send>(n: usize, threads: usize, f: impl Fn(usize) -> R + Sync) -> Vec<R> {
    let rs = par_map_big(n, threads, |i| speculate(|| f(i)));
    rs.into_iter()
        .enumerate()
        .map(|(i, r)| match r {
            Some(r) => r,
            None => f(i),
        })
        .collect()
}
