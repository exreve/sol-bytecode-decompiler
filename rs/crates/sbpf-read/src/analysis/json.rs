//! A small ordered JSON value for the security/ files: objects keep insertion order (as the TS objects
//! `JSON.stringify` serializes), `undefined` members are left out by the builders.

use crate::util::{js_num, json_str};

#[derive(Clone, Debug, PartialEq)]
pub enum Jv {
    Null,
    Bool(bool),
    Num(f64),
    Str(String),
    Arr(Vec<Jv>),
    Obj(Vec<(String, Jv)>),
}

impl Jv {
    pub fn obj() -> Jv {
        Jv::Obj(Vec::new())
    }
    pub fn s(s: &str) -> Jv {
        Jv::Str(s.to_string())
    }
    pub fn n(x: f64) -> Jv {
        Jv::Num(x)
    }
    pub fn strs<S: AsRef<str>>(v: &[S]) -> Jv {
        Jv::Arr(v.iter().map(|s| Jv::s(s.as_ref())).collect())
    }
    /// set a member (replacing it in place when present, else appended)
    pub fn set(&mut self, k: &str, v: Jv) -> &mut Jv {
        if let Jv::Obj(m) = self {
            match m.iter().position(|x| x.0 == k) {
                Some(i) => m[i].1 = v,
                None => m.push((k.to_string(), v)),
            }
        }
        self
    }
    /// set a member when defined
    pub fn opt(&mut self, k: &str, v: Option<Jv>) -> &mut Jv {
        if let Some(v) = v {
            self.set(k, v);
        }
        self
    }
    pub fn with(mut self, k: &str, v: Jv) -> Jv {
        self.set(k, v);
        self
    }
    pub fn with_opt(mut self, k: &str, v: Option<Jv>) -> Jv {
        self.opt(k, v);
        self
    }
    pub fn get(&self, k: &str) -> Option<&Jv> {
        match self {
            Jv::Obj(m) => m.iter().find(|x| x.0 == k).map(|x| &x.1),
            _ => None,
        }
    }
    pub fn get_mut(&mut self, k: &str) -> Option<&mut Jv> {
        match self {
            Jv::Obj(m) => m.iter_mut().find(|x| x.0 == k).map(|x| &mut x.1),
            _ => None,
        }
    }
    pub fn arr_mut(&mut self) -> Option<&mut Vec<Jv>> {
        match self {
            Jv::Arr(a) => Some(a),
            _ => None,
        }
    }
    pub fn as_str(&self) -> Option<&str> {
        match self {
            Jv::Str(s) => Some(s),
            _ => None,
        }
    }
    pub fn as_num(&self) -> Option<f64> {
        match self {
            Jv::Num(x) => Some(*x),
            _ => None,
        }
    }

    /// JSON.stringify(v) (compact)
    pub fn compact(&self, o: &mut String) {
        match self {
            Jv::Null => o.push_str("null"),
            Jv::Bool(b) => o.push_str(if *b { "true" } else { "false" }),
            Jv::Num(x) => o.push_str(&num(*x)),
            Jv::Str(s) => o.push_str(&json_str(s)),
            Jv::Arr(a) => {
                o.push('[');
                for (i, x) in a.iter().enumerate() {
                    if i > 0 {
                        o.push(',');
                    }
                    x.compact(o);
                }
                o.push(']');
            }
            Jv::Obj(m) => {
                o.push('{');
                for (i, (k, x)) in m.iter().enumerate() {
                    if i > 0 {
                        o.push(',');
                    }
                    o.push_str(&json_str(k));
                    o.push(':');
                    x.compact(o);
                }
                o.push('}');
            }
        }
    }

    /// JSON.stringify(v, null, indent)
    pub fn pretty(&self, indent: usize) -> String {
        let mut o = String::new();
        self.pretty0(&mut o, indent, 0);
        o
    }
    fn pretty0(&self, o: &mut String, ind: usize, depth: usize) {
        match self {
            Jv::Arr(a) if !a.is_empty() => {
                o.push('[');
                for (i, x) in a.iter().enumerate() {
                    if i > 0 {
                        o.push(',');
                    }
                    o.push('\n');
                    pad(o, ind * (depth + 1));
                    x.pretty0(o, ind, depth + 1);
                }
                o.push('\n');
                pad(o, ind * depth);
                o.push(']');
            }
            Jv::Obj(m) if !m.is_empty() => {
                o.push('{');
                for (i, (k, x)) in m.iter().enumerate() {
                    if i > 0 {
                        o.push(',');
                    }
                    o.push('\n');
                    pad(o, ind * (depth + 1));
                    o.push_str(&json_str(k));
                    o.push_str(": ");
                    x.pretty0(o, ind, depth + 1);
                }
                o.push('\n');
                pad(o, ind * depth);
                o.push('}');
            }
            _ => self.compact(o),
        }
    }
}

fn pad(o: &mut String, n: usize) {
    for _ in 0..n {
        o.push(' ');
    }
}

fn num(x: f64) -> String {
    if x.is_finite() {
        js_num(x)
    } else {
        "null".into()
    }
}

/// String.prototype.length (UTF-16 code units)
pub fn utf16_len(s: &str) -> usize {
    s.chars().map(|c| c.len_utf16()).sum()
}
