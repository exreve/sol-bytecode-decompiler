//! A parser for the TypeScript subset the decompiler emits: function declarations (typed parameters,
//! `declare function` stubs), interfaces (`at<Offset, T>` view fields, `extends sized<N>`), type aliases,
//! and inside functions `const` / `let`, `if` / `else`, `while`, `do … while`, labels, `break` / `continue`,
//! `return`, `switch`, and expressions with the TypeScript precedences (including `as` casts, member and
//! element access, calls, `?:`, `void`). Statements end at `;`, `}` or a line break (automatic semicolon
//! insertion). Nodes keep their source span (`text()`: the node's source text).

#[derive(Clone, Debug, PartialEq)]
enum Tk {
    Ident(String),
    Num(String),
    /// string literal value as UTF-16 code units (JavaScript string semantics)
    Str(Vec<u16>),
    P(&'static str),
    Eof,
}

#[derive(Clone, Debug)]
struct Tok {
    k: Tk,
    s: usize,
    e: usize,
    nl: bool,
}

#[derive(Clone, Debug)]
pub struct E {
    pub k: Ex,
    pub s: usize,
    pub e: usize,
}

#[derive(Clone, Debug)]
pub enum Ex {
    Num(String),
    Str(Vec<u16>),
    True,
    False,
    Null,
    This,
    Ident(String),
    Paren(Box<E>),
    /// prefix unary: `-`, `+`, `!`, `~`, `++`, `--`
    Unary(&'static str, Box<E>),
    Postfix(&'static str, Box<E>),
    Void(Box<E>),
    TypeOf(Box<E>),
    Delete(Box<E>),
    Prop(Box<E>, String),
    Elem(Box<E>, Box<E>),
    Call(Box<E>, Vec<E>),
    As(Box<E>, Ty),
    Cond(Box<E>, Box<E>, Box<E>),
    Bin(&'static str, Box<E>, Box<E>),
}

impl Ex {
    /// the node kind's name (error messages)
    pub fn kind_name(&self) -> &'static str {
        match self {
            Ex::Num(_) => "NumericLiteral",
            Ex::Str(_) => "StringLiteral",
            Ex::True => "TrueKeyword",
            Ex::False => "FalseKeyword",
            Ex::Null => "NullKeyword",
            Ex::This => "ThisKeyword",
            Ex::Ident(_) => "Identifier",
            Ex::Paren(_) => "ParenthesizedExpression",
            Ex::Unary(..) => "PrefixUnaryExpression",
            Ex::Postfix(..) => "PostfixUnaryExpression",
            Ex::Void(_) => "VoidExpression",
            Ex::TypeOf(_) => "TypeOfExpression",
            Ex::Delete(_) => "DeleteExpression",
            Ex::Prop(..) => "PropertyAccessExpression",
            Ex::Elem(..) => "ElementAccessExpression",
            Ex::Call(..) => "CallExpression",
            Ex::As(..) => "AsExpression",
            Ex::Cond(..) => "ConditionalExpression",
            Ex::Bin(..) => "BinaryExpression",
        }
    }
}

/// A type node: a type reference (`Name<args>`), a numeric literal type, or anything else.
#[derive(Clone, Debug)]
pub struct Ty {
    pub k: TyK,
    pub s: usize,
    pub e: usize,
}

#[derive(Clone, Debug)]
pub enum TyK {
    Ref(String, Vec<Ty>),
    NumLit(String),
    Other,
}

#[derive(Clone, Debug)]
pub struct Decl {
    pub name: String,
    pub ty: Option<Ty>,
    pub init: Option<E>,
}

#[derive(Clone, Debug)]
pub struct Clause {
    pub test: Option<E>,
    pub body: Vec<S>,
}

#[derive(Clone, Debug)]
pub struct S {
    pub k: St,
    pub s: usize,
    pub e: usize,
}

#[derive(Clone, Debug)]
pub enum St {
    Block(Vec<S>),
    Var(Vec<Decl>),
    Expr(E),
    If(E, Box<S>, Option<Box<S>>),
    While(E, Box<S>),
    Do(Box<S>, E),
    Labeled(String, Box<S>),
    Break(Option<String>),
    Continue(Option<String>),
    Return(Option<E>),
    Switch(E, Vec<Clause>),
    Empty,
    /// a statement the evaluator does not support (its SyntaxKind name)
    Other(&'static str),
}

impl St {
    pub fn kind_name(&self) -> &'static str {
        match self {
            St::Block(_) => "Block",
            St::Var(_) => "VariableStatement",
            St::Expr(_) => "ExpressionStatement",
            St::If(..) => "IfStatement",
            St::While(..) => "WhileStatement",
            St::Do(..) => "DoStatement",
            St::Labeled(..) => "LabeledStatement",
            St::Break(_) => "BreakStatement",
            St::Continue(_) => "ContinueStatement",
            St::Return(_) => "ReturnStatement",
            St::Switch(..) => "SwitchStatement",
            St::Empty => "EmptyStatement",
            St::Other(k) => k,
        }
    }
}

#[derive(Clone, Debug)]
pub struct Param {
    pub name: String,
    pub ty: Option<Ty>,
}

#[derive(Clone, Debug)]
pub struct Func {
    pub name: String,
    pub params: Vec<Param>,
    pub body: Option<Vec<S>>,
}

#[derive(Clone, Debug)]
pub enum Member {
    Prop {
        name: String,
        ty: Option<Ty>,
        s: usize,
        e: usize,
    },
    Other {
        s: usize,
        e: usize,
    },
}

#[derive(Clone, Debug)]
pub struct Heritage {
    /// the heritage expression's text (`sized`)
    pub expr: String,
    pub args: Vec<Ty>,
    pub s: usize,
    pub e: usize,
}

#[derive(Clone, Debug)]
pub struct Interface {
    pub name: String,
    pub heritage: Vec<Heritage>,
    pub members: Vec<Member>,
}

#[derive(Clone, Debug)]
pub enum Item {
    Func(Func),
    Interface(Interface),
    Other,
}

pub struct SourceFile {
    pub src: String,
    pub items: Vec<Item>,
}

impl SourceFile {
    pub fn text(&self, s: usize, e: usize) -> &str {
        &self.src[s..e]
    }
}

const KEYWORD_TYPES: &[&str] = &[
    "number",
    "string",
    "boolean",
    "void",
    "never",
    "any",
    "unknown",
    "bigint",
    "object",
    "symbol",
    "undefined",
    "null",
    "true",
    "false",
    "this",
];

const PUNCTS: &[&str] = &[
    "...", "===", "!==", "**=", "<<=", "&&=", "||=", "??=", "=>", "==", "!=", "<=", "&&", "||",
    "??", "?.", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<", "**", "{", "}",
    "(", ")", "[", "]", ";", ",", "<", ">", "+", "-", "*", "/", "%", "&", "|", "^", "!", "~", "?",
    ":", "=", ".", "@", "#",
];

fn lex(src: &str) -> Result<Vec<Tok>, String> {
    let b = src.as_bytes();
    let mut i = 0;
    let mut out = Vec::new();
    let mut nl = false;
    while i < b.len() {
        let c = b[i];
        if c == b'\n' || c == b'\r' {
            nl = true;
            i += 1;
            continue;
        }
        if c == b' ' || c == b'\t' || c == 0x0b || c == 0x0c {
            i += 1;
            continue;
        }
        if c >= 0x80 {
            // non-ASCII whitespace (e.g. U+00A0, U+2028) or an identifier character
            let ch = src[i..].chars().next().unwrap();
            if ch == '\u{2028}' || ch == '\u{2029}' {
                nl = true;
                i += ch.len_utf8();
                continue;
            }
            if ch.is_whitespace() || ch == '\u{feff}' {
                i += ch.len_utf8();
                continue;
            }
        }
        if c == b'/' && b.get(i + 1) == Some(&b'/') {
            while i < b.len() && b[i] != b'\n' && b[i] != b'\r' {
                i += 1;
            }
            continue;
        }
        if c == b'/' && b.get(i + 1) == Some(&b'*') {
            let Some(end) = src[i + 2..].find("*/") else {
                return Err(format!("'*/' expected @{i}"));
            };
            if src[i + 2..i + 2 + end].contains(['\n', '\r']) {
                nl = true;
            }
            i += end + 4;
            continue;
        }
        let s = i;
        let k = if c.is_ascii_alphabetic() || c == b'_' || c == b'$' || c >= 0x80 {
            let mut j = i;
            while j < b.len() {
                let ch = src[j..].chars().next().unwrap();
                if ch.is_alphanumeric() || ch == '_' || ch == '$' {
                    j += ch.len_utf8();
                } else {
                    break;
                }
            }
            if j == i {
                return Err(format!("Invalid character. @{i}"));
            }
            i = j;
            Tk::Ident(src[s..i].to_string())
        } else if c.is_ascii_digit()
            || (c == b'.' && b.get(i + 1).is_some_and(|d| d.is_ascii_digit()))
        {
            let mut j = i + 1;
            while j < b.len() && (b[j].is_ascii_alphanumeric() || b[j] == b'_' || b[j] == b'.') {
                // exponent signs
                if (b[j] == b'e' || b[j] == b'E')
                    && !src[s..j].starts_with("0x")
                    && !src[s..j].starts_with("0X")
                    && matches!(b.get(j + 1), Some(b'+') | Some(b'-'))
                {
                    j += 2;
                    continue;
                }
                j += 1;
            }
            i = j;
            Tk::Num(src[s..i].to_string())
        } else if c == b'"' || c == b'\'' {
            let mut v: Vec<u16> = Vec::new();
            let mut j = i + 1;
            loop {
                let Some(&d) = b.get(j) else {
                    return Err(format!("Unterminated string literal. @{s}"));
                };
                if d == c {
                    j += 1;
                    break;
                }
                if d == b'\n' || d == b'\r' {
                    return Err(format!("Unterminated string literal. @{s}"));
                }
                if d == b'\\' {
                    let e = *b.get(j + 1).ok_or("Unterminated string literal.")?;
                    j += 2;
                    match e {
                        b'n' => v.push(10),
                        b't' => v.push(9),
                        b'r' => v.push(13),
                        b'b' => v.push(8),
                        b'f' => v.push(12),
                        b'v' => v.push(11),
                        b'0' if !b.get(j).is_some_and(|x| x.is_ascii_digit()) => v.push(0),
                        b'x' => {
                            let h = src
                                .get(j..j + 2)
                                .and_then(|h| u16::from_str_radix(h, 16).ok());
                            let Some(h) = h else {
                                return Err(format!("Hexadecimal digit expected. @{j}"));
                            };
                            v.push(h);
                            j += 2;
                        }
                        b'u' => {
                            if b.get(j) == Some(&b'{') {
                                let end =
                                    src[j..].find('}').ok_or("Unterminated Unicode escape")?;
                                let cp = u32::from_str_radix(&src[j + 1..j + end], 16)
                                    .map_err(|_| format!("Hexadecimal digit expected. @{j}"))?;
                                let ch = char::from_u32(cp).ok_or("invalid code point")?;
                                let mut buf = [0u16; 2];
                                v.extend_from_slice(ch.encode_utf16(&mut buf));
                                j += end + 1;
                            } else {
                                let h = src
                                    .get(j..j + 4)
                                    .and_then(|h| u16::from_str_radix(h, 16).ok());
                                let Some(h) = h else {
                                    return Err(format!("Hexadecimal digit expected. @{j}"));
                                };
                                v.push(h);
                                j += 4;
                            }
                        }
                        b'\r' => {
                            if b.get(j) == Some(&b'\n') {
                                j += 1;
                            }
                        }
                        b'\n' => {}
                        _ => {
                            // any other character stands for itself
                            j -= 1;
                            let ch = src[j..].chars().next().unwrap();
                            let mut buf = [0u16; 2];
                            v.extend_from_slice(ch.encode_utf16(&mut buf));
                            j += ch.len_utf8();
                        }
                    }
                    continue;
                }
                let ch = src[j..].chars().next().unwrap();
                let mut buf = [0u16; 2];
                v.extend_from_slice(ch.encode_utf16(&mut buf));
                j += ch.len_utf8();
            }
            i = j;
            Tk::Str(v)
        } else if c == b'`' {
            return Err(format!("template literals are not supported @{i}"));
        } else {
            let Some(p) = PUNCTS.iter().find(|p| src[i..].starts_with(**p)) else {
                return Err(format!("Invalid character. @{i}"));
            };
            i += p.len();
            Tk::P(p)
        };
        out.push(Tok { k, s, e: i, nl });
        nl = false;
    }
    out.push(Tok {
        k: Tk::Eof,
        s: b.len(),
        e: b.len(),
        nl: true,
    });
    Ok(out)
}

struct Parser<'a> {
    t: Vec<Tok>,
    i: usize,
    src: &'a str,
}

type R<T> = Result<T, String>;

impl<'a> Parser<'a> {
    fn peek(&self) -> &Tok {
        &self.t[self.i]
    }
    fn at(&self, k: usize) -> &Tok {
        &self.t[(self.i + k).min(self.t.len() - 1)]
    }
    fn is_p(&self, p: &str) -> bool {
        matches!(&self.peek().k, Tk::P(x) if *x == p)
    }
    fn is_id(&self, w: &str) -> bool {
        matches!(&self.peek().k, Tk::Ident(x) if x == w)
    }
    fn bump(&mut self) -> Tok {
        let t = self.t[self.i].clone();
        if self.i < self.t.len() - 1 {
            self.i += 1;
        }
        t
    }
    fn prev_end(&self) -> usize {
        if self.i == 0 {
            0
        } else {
            self.t[self.i - 1].e
        }
    }
    fn err<T>(&self, m: &str) -> R<T> {
        Err(format!("{m} @{}", self.peek().s))
    }
    fn expect(&mut self, p: &str) -> R<()> {
        if self.is_p(p) {
            self.bump();
            Ok(())
        } else {
            self.err(&format!("'{p}' expected."))
        }
    }
    fn ident(&mut self) -> R<String> {
        match &self.peek().k {
            Tk::Ident(x) => {
                let x = x.clone();
                self.bump();
                Ok(x)
            }
            _ => self.err("Identifier expected."),
        }
    }
    /// `;`, or the end of the statement by automatic semicolon insertion
    fn semi(&mut self) -> R<()> {
        if self.is_p(";") {
            self.bump();
            return Ok(());
        }
        if self.is_p("}") || self.peek().k == Tk::Eof || self.peek().nl {
            return Ok(());
        }
        self.err("';' expected.")
    }
    fn can_end(&self) -> bool {
        self.is_p(";") || self.is_p("}") || self.peek().k == Tk::Eof || self.peek().nl
    }

    // ---- types ----
    fn ty(&mut self) -> R<Ty> {
        let s = self.peek().s;
        if self.is_p("|") || self.is_p("&") {
            self.bump();
        }
        let first = self.ty_postfix()?;
        if self.is_p("|") || self.is_p("&") {
            while self.is_p("|") || self.is_p("&") {
                self.bump();
                self.ty_postfix()?;
            }
            return Ok(Ty {
                k: TyK::Other,
                s,
                e: self.prev_end(),
            });
        }
        if self.is_p("=>") {
            return self.err("';' expected.");
        }
        Ok(first)
    }
    fn ty_postfix(&mut self) -> R<Ty> {
        let mut t = self.ty_primary()?;
        while self.is_p("[") && !self.peek().nl {
            self.bump();
            if !self.is_p("]") {
                self.ty()?;
            }
            self.expect("]")?;
            t = Ty {
                k: TyK::Other,
                s: t.s,
                e: self.prev_end(),
            };
        }
        Ok(t)
    }
    fn ty_args(&mut self) -> R<Vec<Ty>> {
        self.expect("<")?;
        let mut a = Vec::new();
        loop {
            a.push(self.ty()?);
            if self.is_p(",") {
                self.bump();
                continue;
            }
            break;
        }
        self.expect(">")?;
        Ok(a)
    }
    fn ty_primary(&mut self) -> R<Ty> {
        let s = self.peek().s;
        let other = |p: &Self| Ty {
            k: TyK::Other,
            s,
            e: p.prev_end(),
        };
        match self.peek().k.clone() {
            Tk::Ident(w) if w == "typeof" || w == "keyof" || w == "readonly" || w == "unique" => {
                self.bump();
                self.ty_postfix()?;
                Ok(other(self))
            }
            Tk::Ident(w) => {
                self.bump();
                if KEYWORD_TYPES.contains(&w.as_str()) {
                    return Ok(other(self));
                }
                let mut name = w;
                while self.is_p(".") {
                    self.bump();
                    name.push('.');
                    name.push_str(&self.ident()?);
                }
                let args = if self.is_p("<") && !self.peek().nl {
                    self.ty_args()?
                } else {
                    Vec::new()
                };
                Ok(Ty {
                    k: TyK::Ref(name, args),
                    s,
                    e: self.prev_end(),
                })
            }
            Tk::Num(n) => {
                self.bump();
                Ok(Ty {
                    k: TyK::NumLit(n),
                    s,
                    e: self.prev_end(),
                })
            }
            Tk::Str(_) => {
                self.bump();
                Ok(other(self))
            }
            Tk::P("-") => {
                self.bump();
                match self.peek().k {
                    Tk::Num(_) => {
                        self.bump();
                        Ok(other(self))
                    }
                    _ => self.err("Type expected."),
                }
            }
            Tk::P("(") => {
                // parenthesized type or a function type
                let save = self.i;
                if self.skip_balanced().is_ok() && self.is_p("=>") {
                    self.bump();
                    self.ty()?;
                    return Ok(other(self));
                }
                self.i = save;
                self.bump();
                self.ty()?;
                self.expect(")")?;
                Ok(other(self))
            }
            Tk::P("{") | Tk::P("[") => {
                self.skip_balanced()?;
                Ok(other(self))
            }
            _ => self.err("Type expected."),
        }
    }
    /// skip a bracketed group starting at the current `(`, `[`, `{` or `<`
    fn skip_balanced(&mut self) -> R<()> {
        let mut depth = 0i32;
        loop {
            match self.peek().k {
                Tk::P("(") | Tk::P("[") | Tk::P("{") => depth += 1,
                Tk::P(")") | Tk::P("]") | Tk::P("}") => depth -= 1,
                Tk::Eof => return self.err("'}' expected."),
                _ => {}
            }
            self.bump();
            if depth == 0 {
                return Ok(());
            }
        }
    }
    fn skip_type_params(&mut self) -> R<()> {
        if !self.is_p("<") {
            return Ok(());
        }
        self.bump();
        loop {
            self.ident()?;
            if self.is_id("extends") {
                self.bump();
                self.ty()?;
            }
            if self.is_p("=") {
                self.bump();
                self.ty()?;
            }
            if self.is_p(",") {
                self.bump();
                continue;
            }
            break;
        }
        self.expect(">")
    }

    // ---- expressions ----
    /// binary operator at the cursor (`>` tokens combined: the scanner emits them one by one)
    fn bin_op(&self) -> Option<(&'static str, usize)> {
        let t = self.peek();
        let Tk::P(p) = t.k else {
            if let Tk::Ident(w) = &t.k {
                if w == "as" && !t.nl {
                    return Some(("as", 1));
                }
                if w == "instanceof" || w == "in" {
                    return Some((if w == "in" { "in" } else { "instanceof" }, 1));
                }
            }
            return None;
        };
        if p == ">" {
            let adj = |k: usize, q: &str| {
                let a = self.at(k);
                a.s == self.at(k - 1).e && matches!(a.k, Tk::P(x) if x == q)
            };
            if adj(1, ">") {
                if adj(2, ">") {
                    if adj(3, "=") || adj(3, ">=") {
                        return Some((">>>=", 4));
                    }
                    return Some((">>>", 3));
                }
                if adj(2, "=") {
                    return Some((">>=", 3));
                }
                return Some((">>", 2));
            }
            if adj(1, "=") {
                return Some((">=", 2));
            }
            if adj(1, "==") {
                return None;
            }
            return Some((">", 1));
        }
        Some((p, 1))
    }
    fn prec(op: &str) -> Option<u8> {
        Some(match op {
            "??" => 4,
            "||" => 5,
            "&&" => 6,
            "|" => 7,
            "^" => 8,
            "&" => 9,
            "==" | "!=" | "===" | "!==" => 10,
            "<" | ">" | "<=" | ">=" | "as" | "instanceof" | "in" => 11,
            "<<" | ">>" | ">>>" => 12,
            "+" | "-" => 13,
            "*" | "/" | "%" => 14,
            "**" => 15,
            _ => return None,
        })
    }
    fn expr(&mut self) -> R<E> {
        let e = self.assign()?;
        if self.is_p(",") {
            return self.err("comma expressions are not supported");
        }
        Ok(e)
    }
    fn assign(&mut self) -> R<E> {
        let s = self.peek().s;
        let l = self.cond()?;
        if let Some((op, n)) = self.bin_op() {
            if matches!(
                op,
                "=" | "+="
                    | "-="
                    | "*="
                    | "/="
                    | "%="
                    | "&="
                    | "|="
                    | "^="
                    | "<<="
                    | ">>="
                    | ">>>="
                    | "**="
                    | "&&="
                    | "||="
                    | "??="
            ) {
                for _ in 0..n {
                    self.bump();
                }
                let r = self.assign()?;
                return Ok(E {
                    k: Ex::Bin(op, Box::new(l), Box::new(r)),
                    s,
                    e: self.prev_end(),
                });
            }
        }
        Ok(l)
    }
    fn cond(&mut self) -> R<E> {
        let s = self.peek().s;
        let c = self.binary(0)?;
        if self.is_p("?") {
            self.bump();
            let a = self.assign()?;
            self.expect(":")?;
            let b = self.assign()?;
            return Ok(E {
                k: Ex::Cond(Box::new(c), Box::new(a), Box::new(b)),
                s,
                e: self.prev_end(),
            });
        }
        Ok(c)
    }
    fn binary(&mut self, min: u8) -> R<E> {
        let s = self.peek().s;
        let mut l = self.unary()?;
        loop {
            let Some((op, n)) = self.bin_op() else { break };
            let Some(p) = Self::prec(op) else { break };
            if p <= min {
                break;
            }
            for _ in 0..n {
                self.bump();
            }
            if op == "as" {
                if self.is_id("const") {
                    self.bump();
                    return self.err("'as const' is not supported");
                }
                let t = self.ty()?;
                l = E {
                    k: Ex::As(Box::new(l), t),
                    s,
                    e: self.prev_end(),
                };
                continue;
            }
            let r = self.binary(if op == "**" { p - 1 } else { p })?;
            l = E {
                k: Ex::Bin(op, Box::new(l), Box::new(r)),
                s,
                e: self.prev_end(),
            };
        }
        Ok(l)
    }
    fn unary(&mut self) -> R<E> {
        let s = self.peek().s;
        let mk = |p: &Self, k: Ex| E {
            k,
            s,
            e: p.prev_end(),
        };
        match self.peek().k.clone() {
            Tk::P(op @ ("-" | "+" | "!" | "~" | "++" | "--")) => {
                self.bump();
                let a = self.unary()?;
                Ok(mk(self, Ex::Unary(op, Box::new(a))))
            }
            Tk::Ident(w) if w == "void" || w == "typeof" || w == "delete" => {
                self.bump();
                let a = Box::new(self.unary()?);
                Ok(mk(
                    self,
                    match w.as_str() {
                        "void" => Ex::Void(a),
                        "typeof" => Ex::TypeOf(a),
                        _ => Ex::Delete(a),
                    },
                ))
            }
            _ => {
                let e = self.postfix()?;
                if (self.is_p("++") || self.is_p("--")) && !self.peek().nl {
                    let Tk::P(op) = self.bump().k else {
                        unreachable!()
                    };
                    return Ok(mk(self, Ex::Postfix(op, Box::new(e))));
                }
                Ok(e)
            }
        }
    }
    fn postfix(&mut self) -> R<E> {
        let s = self.peek().s;
        let mut e = self.primary()?;
        loop {
            if self.is_p(".") {
                self.bump();
                let n = match &self.peek().k {
                    Tk::Ident(x) => x.clone(),
                    _ => return self.err("Identifier expected."),
                };
                self.bump();
                e = E {
                    k: Ex::Prop(Box::new(e), n),
                    s,
                    e: self.prev_end(),
                };
            } else if self.is_p("[") {
                self.bump();
                let k = self.expr()?;
                self.expect("]")?;
                e = E {
                    k: Ex::Elem(Box::new(e), Box::new(k)),
                    s,
                    e: self.prev_end(),
                };
            } else if self.is_p("(") {
                self.bump();
                let mut args = Vec::new();
                while !self.is_p(")") {
                    args.push(self.assign()?);
                    if self.is_p(",") {
                        self.bump();
                    } else {
                        break;
                    }
                }
                self.expect(")")?;
                e = E {
                    k: Ex::Call(Box::new(e), args),
                    s,
                    e: self.prev_end(),
                };
            } else if self.is_p("!")
                && !self.peek().nl
                && !matches!(self.at(1).k, Tk::P("=") | Tk::P("=="))
            {
                return self.err("non-null assertions are not supported");
            } else {
                break;
            }
        }
        Ok(e)
    }
    fn primary(&mut self) -> R<E> {
        let t = self.peek().clone();
        let one = |k| E { k, s: t.s, e: t.e };
        match &t.k {
            Tk::Num(n) => {
                self.bump();
                Ok(one(Ex::Num(n.clone())))
            }
            Tk::Str(v) => {
                self.bump();
                Ok(one(Ex::Str(v.clone())))
            }
            Tk::Ident(w) => {
                let k = match w.as_str() {
                    "true" => Ex::True,
                    "false" => Ex::False,
                    "null" => Ex::Null,
                    "this" => Ex::This,
                    "function" | "new" | "class" | "async" | "await" | "yield" | "import" => {
                        return self.err("Expression expected.")
                    }
                    _ => Ex::Ident(w.clone()),
                };
                self.bump();
                if self.is_p("=>") {
                    return self.err("arrow functions are not supported");
                }
                Ok(one(k))
            }
            Tk::P("(") => {
                self.bump();
                let e = self.expr()?;
                self.expect(")")?;
                if self.is_p("=>") {
                    return self.err("arrow functions are not supported");
                }
                Ok(E {
                    k: Ex::Paren(Box::new(e)),
                    s: t.s,
                    e: self.prev_end(),
                })
            }
            _ => self.err("Expression expected."),
        }
    }

    // ---- statements ----
    fn block(&mut self) -> R<Vec<S>> {
        self.expect("{")?;
        let mut v = Vec::new();
        while !self.is_p("}") {
            if self.peek().k == Tk::Eof {
                return self.err("'}' expected.");
            }
            v.push(self.stmt()?);
        }
        self.bump();
        Ok(v)
    }
    fn var_decls(&mut self) -> R<Vec<Decl>> {
        let mut ds = Vec::new();
        loop {
            let name = self.ident()?;
            let ty = if self.is_p(":") {
                self.bump();
                Some(self.ty()?)
            } else {
                None
            };
            let init = if self.is_p("=") {
                self.bump();
                Some(self.assign()?)
            } else {
                None
            };
            ds.push(Decl { name, ty, init });
            if self.is_p(",") {
                self.bump();
                continue;
            }
            break;
        }
        Ok(ds)
    }
    fn paren_expr(&mut self) -> R<E> {
        self.expect("(")?;
        let e = self.expr()?;
        self.expect(")")?;
        Ok(e)
    }
    fn stmt(&mut self) -> R<S> {
        let s = self.peek().s;
        let k = self.stmt_kind()?;
        Ok(S {
            k,
            s,
            e: self.prev_end(),
        })
    }
    fn label_arg(&mut self) -> Option<String> {
        match &self.peek().k {
            Tk::Ident(x) if !self.peek().nl => {
                let x = x.clone();
                self.bump();
                Some(x)
            }
            _ => None,
        }
    }
    fn stmt_kind(&mut self) -> R<St> {
        let t = self.peek().clone();
        match &t.k {
            Tk::P("{") => Ok(St::Block(self.block()?)),
            Tk::P(";") => {
                self.bump();
                Ok(St::Empty)
            }
            Tk::Ident(w) => match w.as_str() {
                "const" | "let" | "var" => {
                    self.bump();
                    let ds = self.var_decls()?;
                    self.semi()?;
                    Ok(St::Var(ds))
                }
                "if" => {
                    self.bump();
                    let c = self.paren_expr()?;
                    let a = self.stmt()?;
                    let b = if self.is_id("else") {
                        self.bump();
                        Some(Box::new(self.stmt()?))
                    } else {
                        None
                    };
                    Ok(St::If(c, Box::new(a), b))
                }
                "while" => {
                    self.bump();
                    let c = self.paren_expr()?;
                    Ok(St::While(c, Box::new(self.stmt()?)))
                }
                "do" => {
                    self.bump();
                    let b = self.stmt()?;
                    if !self.is_id("while") {
                        return self.err("'while' expected.");
                    }
                    self.bump();
                    let c = self.paren_expr()?;
                    if self.is_p(";") {
                        self.bump();
                    }
                    Ok(St::Do(Box::new(b), c))
                }
                "break" | "continue" => {
                    self.bump();
                    let l = self.label_arg();
                    self.semi()?;
                    Ok(if w == "break" {
                        St::Break(l)
                    } else {
                        St::Continue(l)
                    })
                }
                "return" => {
                    self.bump();
                    let e = if self.can_end() {
                        None
                    } else {
                        Some(self.expr()?)
                    };
                    self.semi()?;
                    Ok(St::Return(e))
                }
                "switch" => {
                    self.bump();
                    let v = self.paren_expr()?;
                    self.expect("{")?;
                    let mut cs = Vec::new();
                    while !self.is_p("}") {
                        let test = if self.is_id("case") {
                            self.bump();
                            Some(self.expr()?)
                        } else if self.is_id("default") {
                            self.bump();
                            None
                        } else {
                            return self.err("'case' expected.");
                        };
                        self.expect(":")?;
                        let mut body = Vec::new();
                        while !self.is_id("case") && !self.is_id("default") && !self.is_p("}") {
                            if self.peek().k == Tk::Eof {
                                return self.err("'}' expected.");
                            }
                            body.push(self.stmt()?);
                        }
                        cs.push(Clause { test, body });
                    }
                    self.bump();
                    Ok(St::Switch(v, cs))
                }
                "for" => {
                    self.bump();
                    self.skip_balanced()?;
                    self.stmt()?;
                    Ok(St::Other("ForStatement"))
                }
                "throw" => {
                    self.bump();
                    self.expr()?;
                    self.semi()?;
                    Ok(St::Other("ThrowStatement"))
                }
                "function" => {
                    self.func(false)?;
                    Ok(St::Other("FunctionDeclaration"))
                }
                "try" | "class" | "import" | "export" | "enum" => {
                    self.err("Declaration or statement expected.")
                }
                _ if matches!(self.at(1).k, Tk::P(":")) => {
                    let l = w.clone();
                    self.bump();
                    self.bump();
                    Ok(St::Labeled(l, Box::new(self.stmt()?)))
                }
                _ => {
                    let e = self.expr()?;
                    self.semi()?;
                    Ok(St::Expr(e))
                }
            },
            _ => {
                let e = self.expr()?;
                self.semi()?;
                Ok(St::Expr(e))
            }
        }
    }
    fn func(&mut self, declare: bool) -> R<Func> {
        self.bump(); // function
        let name = self.ident()?;
        self.skip_type_params()?;
        self.expect("(")?;
        let mut params = Vec::new();
        while !self.is_p(")") {
            if self.is_p("...") {
                self.bump();
            }
            let n = self.ident()?;
            if self.is_p("?") {
                self.bump();
            }
            let ty = if self.is_p(":") {
                self.bump();
                Some(self.ty()?)
            } else {
                None
            };
            if self.is_p("=") {
                self.bump();
                self.assign()?;
            }
            params.push(Param { name: n, ty });
            if self.is_p(",") {
                self.bump();
            } else {
                break;
            }
        }
        self.expect(")")?;
        if self.is_p(":") {
            self.bump();
            self.ty()?;
        }
        let body = if self.is_p("{") && !declare {
            Some(self.block()?)
        } else {
            self.semi()?;
            None
        };
        Ok(Func { name, params, body })
    }
    fn interface(&mut self) -> R<Interface> {
        self.bump(); // interface
        let name = self.ident()?;
        self.skip_type_params()?;
        let mut heritage = Vec::new();
        while self.is_id("extends") || self.is_id("implements") {
            self.bump();
            loop {
                let s = self.peek().s;
                let mut expr = self.ident()?;
                while self.is_p(".") {
                    self.bump();
                    expr.push('.');
                    expr.push_str(&self.ident()?);
                }
                let args = if self.is_p("<") {
                    self.ty_args()?
                } else {
                    Vec::new()
                };
                heritage.push(Heritage {
                    expr,
                    args,
                    s,
                    e: self.prev_end(),
                });
                if self.is_p(",") {
                    self.bump();
                    continue;
                }
                break;
            }
        }
        self.expect("{")?;
        let mut members = Vec::new();
        while !self.is_p("}") {
            let s = self.peek().s;
            let name = match &self.peek().k {
                Tk::Ident(x) => Some(x.clone()),
                Tk::Str(_) | Tk::Num(_) => Some(self.src[s..self.peek().e].to_string()),
                _ => None,
            };
            let prop = name.is_some()
                && matches!(
                    self.at(1).k,
                    Tk::P(":") | Tk::P("?") | Tk::P(";") | Tk::P(",") | Tk::P("}")
                )
                || name.is_some() && self.at(1).nl;
            if prop {
                self.bump();
                if self.is_p("?") {
                    self.bump();
                }
                let ty = if self.is_p(":") {
                    self.bump();
                    Some(self.ty()?)
                } else {
                    None
                };
                members.push(Member::Prop {
                    name: name.unwrap(),
                    ty,
                    s,
                    e: self.prev_end(),
                });
            } else {
                // a method or index signature: skipped to its end
                while !(self.is_p(";")
                    || self.is_p(",")
                    || self.is_p("}")
                    || (self.peek().nl && self.peek().s > s))
                {
                    if self.peek().k == Tk::Eof {
                        return self.err("'}' expected.");
                    }
                    if self.is_p("(") || self.is_p("[") || self.is_p("{") {
                        self.skip_balanced()?;
                    } else {
                        self.bump();
                    }
                }
                members.push(Member::Other {
                    s,
                    e: self.prev_end(),
                });
            }
            if self.is_p(";") || self.is_p(",") {
                self.bump();
            } else if !self.is_p("}") && !self.peek().nl {
                return self.err("';' expected.");
            }
        }
        self.bump();
        Ok(Interface {
            name,
            heritage,
            members,
        })
    }
    fn item(&mut self) -> R<Item> {
        let mut declare = false;
        loop {
            if self.is_id("export") && !matches!(self.at(1).k, Tk::P(_)) {
                self.bump();
                continue;
            }
            if self.is_id("declare") && matches!(self.at(1).k, Tk::Ident(_)) && !self.at(1).nl {
                self.bump();
                declare = true;
                continue;
            }
            break;
        }
        if self.is_id("function") {
            return Ok(Item::Func(self.func(declare)?));
        }
        if self.is_id("interface") && matches!(self.at(1).k, Tk::Ident(_)) {
            return Ok(Item::Interface(self.interface()?));
        }
        if self.is_id("type") && matches!(self.at(1).k, Tk::Ident(_)) && !self.at(1).nl {
            self.bump();
            self.ident()?;
            self.skip_type_params()?;
            self.expect("=")?;
            self.ty()?;
            self.semi()?;
            return Ok(Item::Other);
        }
        if declare && (self.is_id("const") || self.is_id("let") || self.is_id("var")) {
            self.bump();
            self.var_decls()?;
            self.semi()?;
            return Ok(Item::Other);
        }
        self.stmt()?;
        Ok(Item::Other)
    }
}

/// Parse a source file (the decompiler's single-file output). Errors: the first syntax error.
pub fn parse(src: &str) -> Result<SourceFile, String> {
    let t = lex(src)?;
    let mut p = Parser { t, i: 0, src };
    let mut items = Vec::new();
    while p.peek().k != Tk::Eof {
        items.push(p.item()?);
    }
    Ok(SourceFile {
        src: src.to_string(),
        items,
    })
}
