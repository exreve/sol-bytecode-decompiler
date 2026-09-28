//! A small ordered JSON value for the security/ files: objects keep insertion order (the files' key
//! order), absent members are left out by the builders.

use crate::util::js_num;

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
            Jv::Str(s) => crate::util::json_str_into(o, s),
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
                    crate::util::json_str_into(o, k);
                    o.push(':');
                    x.compact(o);
                }
                o.push('}');
            }
        }
    }

    /// The UTF-16 length of `pretty(indent)`, without building it.
    pub fn pretty_len(&self, indent: usize) -> usize {
        self.pretty_len0(indent, 0)
    }
    fn pretty_len0(&self, ind: usize, depth: usize) -> usize {
        match self {
            Jv::Arr(a) if !a.is_empty() => {
                // '[' + per item (',' except the first, '\n', pad) + '\n' + pad + ']'
                let mut n = 1 + (a.len() - 1) + 1 + ind * depth + 1;
                for x in a {
                    n += 1 + ind * (depth + 1) + x.pretty_len0(ind, depth + 1);
                }
                n
            }
            Jv::Obj(m) if !m.is_empty() => {
                let mut n = 1 + (m.len() - 1) + 1 + ind * depth + 1;
                for (k, x) in m {
                    n += 1 + ind * (depth + 1) + str_len(k) + 2 + x.pretty_len0(ind, depth + 1);
                }
                n
            }
            _ => self.compact_len(),
        }
    }
    fn compact_len(&self) -> usize {
        match self {
            Jv::Null => 4,
            Jv::Bool(b) => if *b { 4 } else { 5 },
            Jv::Num(x) => num(*x).len(),
            Jv::Str(s) => str_len(s),
            Jv::Arr(a) => 2 + a.len().saturating_sub(1) + a.iter().map(|x| x.compact_len()).sum::<usize>(),
            Jv::Obj(m) => {
                2 + m.len().saturating_sub(1)
                    + m.iter().map(|(k, x)| str_len(k) + 1 + x.compact_len()).sum::<usize>()
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
                    crate::util::json_str_into(o, k);
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

/// UTF-16 length of JSON.stringify(s)
fn str_len(s: &str) -> usize {
    if s.bytes().any(|b| b < 0x20 || b == b'"' || b == b'\\') {
        let mut o = String::new();
        crate::util::json_str_into(&mut o, s);
        utf16_len(&o)
    } else {
        utf16_len(s) + 2
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
    crate::util::u16len(s)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn pretty_len_is_len() {
        let d = Jv::obj()
            .with("a", Jv::Arr(vec![Jv::n(1.5), Jv::s("x\"y\u{1F600}\u{e9}\u{1}"), Jv::obj(), Jv::Arr(vec![])]))
            .with("b\n", Jv::obj().with("c", Jv::Null).with("d", Jv::Bool(false)))
            .with("e", Jv::Arr(vec![Jv::obj().with("f", Jv::Arr(vec![Jv::Bool(true), Jv::n(-3.0), Jv::n(1e300)]))]));
        for ind in [0, 1, 2] {
            assert_eq!(d.pretty_len(ind), utf16_len(&d.pretty(ind)));
            let mut c = String::new();
            d.compact(&mut c);
            assert_eq!(d.compact_len(), utf16_len(&c));
        }
    }
}
