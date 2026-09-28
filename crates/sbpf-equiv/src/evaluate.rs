//! Interpreter for the decompiler's TypeScript output, implementing exactly the semantics documented in the
//! output header (the runtime model: u64 values, wrapping `+ - * <<`, unsigned `/ %`, logical `>>`, casts,
//! `ldN` / `stN`, `copy` / `copyr`, the pure helpers, `memeq` / `keyeq`, the `rc_*` idioms, typed views,
//! outlined helpers, "text" arguments, `undef`). Used to check output == bytecode on random inputs.
//!
//! Values are exact (unbounded) integers: operations that wrap are reduced mod
//! 2^64, casts to signed types give negative values, and comparisons compare the values as they are.
//! A function is compiled on its first run (errors outside the language are reported then, `Exc::Eval`).

use crate::emu::{CallHook, Exc, TestMem, UNDEF};
use crate::tsparse::{parse, Ex, Func, Interface, Member, St, Ty, TyK, E, S};
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

pub type V = i128;
const M: V = u64::MAX as V;

#[inline]
fn w(x: V) -> V {
    x as u64 as V
}
#[inline]
fn b(x: bool) -> V {
    x as V
}
fn as_int(bits: u32, x: V) -> V {
    let sh = 128 - bits;
    (x << sh) >> sh
}
fn as_uint(bits: u32, x: V) -> V {
    if bits >= 128 {
        x
    } else {
        x & ((1i128 << bits) - 1)
    }
}
fn eval_err<T>(m: String) -> Result<T, Exc> {
    Err(Exc::Eval(m))
}

/// The environment of a run.
pub struct Env<'e, 'a> {
    pub mem: &'e mut TestMem<'a>,
    pub on_call: &'e mut CallHook<'e, 'a>,
    pub fp: u64,
    /// function name -> VM address (function pointer constants)
    pub fn_addr: &'e HashMap<String, u64>,
    /// function name -> call target id ("fn:<pc>")
    pub fn_target: &'e HashMap<String, String>,
    /// printed syscall name -> "sys:<name>"
    pub sys_target: &'e HashMap<String, String>,
    pub max_steps: usize,
    /// readable output: "text" argument = address of the first occurrence of its UTF-8 bytes
    pub str_addr: Option<&'e dyn Fn(&str) -> Option<u64>>,
    /// readable output: call target id -> argument count (omitted trailing arguments are undef)
    pub arity: Option<&'e HashMap<String, usize>>,
    /// readable output: a variable read before any assignment holds undef
    pub undef_uninit: bool,
}

#[derive(Clone, Copy, Debug, PartialEq)]
enum VKind {
    Scalar,
    Ref,
    Embed,
}

#[derive(Clone, Debug)]
struct VField {
    off: V,
    kind: VKind,
    size: u32,
    ty: Option<String>,
}

/// View types: `interface T { f: at<off, u8|u16|u32|u64 | ref<U> | U> }` declared in the source.
struct Views {
    m: HashMap<String, HashMap<String, VField>>,
    /// from `extends sized<N>`
    size: HashMap<String, V>,
}

fn big(text: &str) -> Result<V, Exc> {
    let t = text;
    let r = if let Some(h) = t.strip_prefix("0x").or_else(|| t.strip_prefix("0X")) {
        i128::from_str_radix(h, 16)
    } else if let Some(h) = t.strip_prefix("0b").or_else(|| t.strip_prefix("0B")) {
        i128::from_str_radix(h, 2)
    } else if let Some(h) = t.strip_prefix("0o").or_else(|| t.strip_prefix("0O")) {
        i128::from_str_radix(h, 8)
    } else if !t.is_empty() && t.bytes().all(|c| c.is_ascii_digit()) {
        t.parse::<i128>()
    } else {
        return eval_err(format!("SyntaxError: Cannot convert {t} to a BigInt"));
    };
    r.map_err(|_| Exc::Eval(format!("SyntaxError: Cannot convert {t} to a BigInt")))
}

/// JSON string literal of a string (UTF-16 code units)
fn json_str(v: &[u16]) -> String {
    let mut o = String::from("\"");
    let mut i = 0;
    while i < v.len() {
        let c = v[i];
        match c {
            0x22 => o.push_str("\\\""),
            0x5c => o.push_str("\\\\"),
            0x08 => o.push_str("\\b"),
            0x0c => o.push_str("\\f"),
            0x0a => o.push_str("\\n"),
            0x0d => o.push_str("\\r"),
            0x09 => o.push_str("\\t"),
            c if c < 0x20 => o.push_str(&format!("\\u{c:04x}")),
            0xd800..=0xdbff if v.get(i + 1).is_some_and(|d| (0xdc00..=0xdfff).contains(d)) => {
                o.push_str(&String::from_utf16_lossy(&v[i..i + 2]));
                i += 1;
            }
            0xd800..=0xdfff => o.push_str(&format!("\\u{c:04x}")),
            c => o.push(char::from_u32(c as u32).unwrap()),
        }
        i += 1;
    }
    o.push('"');
    o
}

/// 32 bytes denoted by a base58 string (leading '1's are leading zero bytes).
fn base58_decode(s: &str) -> Result<[u8; 32], Exc> {
    const A: &str = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    // big number as little-endian bytes
    let mut n: Vec<u32> = Vec::new();
    for ch in s.chars() {
        let Some(d) = A.find(ch) else {
            return eval_err(format!("bad base58 {s}"));
        };
        let mut carry = d as u32;
        for x in n.iter_mut() {
            let v = *x * 58 + carry;
            *x = v & 0xff;
            carry = v >> 8;
        }
        while carry > 0 {
            n.push(carry & 0xff);
            carry >>= 8;
        }
    }
    while n.last() == Some(&0) {
        n.pop();
    }
    if n.len() > 32 {
        return eval_err(format!("base58 key longer than 32 bytes: {s}"));
    }
    let mut out = [0u8; 32];
    for (i, &x) in n.iter().enumerate() {
        out[31 - i] = x as u8;
    }
    let zeros = s.chars().take_while(|&c| c == '1').count();
    for &x in out.iter().take(zeros.min(32)) {
        if x != 0 {
            return eval_err(format!("bad base58 leading zeros: {s}"));
        }
    }
    Ok(out)
}

// ---- compiled form ----

#[derive(Clone, Copy, Debug)]
enum H {
    Ld(u32),
    St(u32),
    Copy,
    Copyr,
    Shl,
    Sar,
    SDiv,
    SRem,
    SDiv32,
    SRem32,
    Mulhu,
    Mulhs,
    Bswap(u32),
    Popcount,
    Clz,
    Ctz,
    Rotl,
    Min,
    Max,
    Smin,
    Smax,
    SatSub,
    Memeq,
    RcInc,
    RcDec,
    RcRelease,
    Trap,
    Callx,
}

#[derive(Clone, Copy, Debug)]
enum Op {
    LAnd,
    LOr,
    Add,
    Sub,
    Mul,
    Div,
    Rem,
    And,
    Or,
    Xor,
    Shl,
    Shr,
    Eq,
    Ne,
    Lt,
    Le,
    Gt,
    Ge,
}

enum CE {
    Const(V),
    Str(Vec<u16>),
    Slot(usize, Rc<str>),
    Global(String),
    Neg(Box<CE>),
    Not(Box<CE>),
    LNot(Box<CE>),
    Void(Box<CE>),
    FieldLoad(Box<CE>, V, u32),
    Addr(Box<CE>, V),
    Cast(Box<CE>, u32, bool),
    Helper(H, Vec<CE>),
    Call(String, Vec<CE>),
    KeyEq(Box<CE>, [u64; 4]),
    Cond(Box<CE>, Box<CE>, Box<CE>),
    FieldStore(Box<CE>, V, u32, Box<CE>),
    Assign(usize, Box<CE>),
    Bin(Op, Box<CE>, Box<CE>),
}

enum CS {
    List(Vec<CS>),
    Expr(CE),
    Var(Vec<(usize, Option<CE>)>),
    If(CE, Box<CS>, Option<Box<CS>>),
    While(CE, Box<CS>, Option<u32>),
    Do(Box<CS>, CE, Option<u32>),
    Labeled(u32, Box<CS>),
    Break(Option<u32>),
    Continue(Option<u32>),
    Return(Option<CE>),
    Switch(CE, Vec<(Option<CE>, CS)>),
}

struct Compiled {
    nslots: usize,
    nparams: usize,
    fp_slot: usize,
    body: CS,
}

/// A parsed output file with its functions, compiled on first use.
pub struct Evaluator {
    src: String,
    funcs: Vec<Func>,
    interfaces: Vec<Interface>,
    /// every function declaration by name (the last one of a name)
    decls: HashMap<String, usize>,
    /// function declarations with a body by name (outlined helpers)
    locals: HashMap<String, usize>,
    views: RefCell<Option<Rc<Views>>>,
    compiled: RefCell<Vec<Option<Rc<Compiled>>>>,
    active: RefCell<Vec<bool>>,
}

/// Outcome of a run: the returned value (None: no `return` value), or an abort / a step limit.
#[derive(Clone, Debug, Default)]
pub struct RunResult {
    pub ret: Option<u64>,
    pub abort: Option<String>,
    pub limit: bool,
}

struct Ctl {
    label: Option<u32>,
    ret: Option<V>,
    steps: usize,
    max: usize,
}

impl Evaluator {
    /// parseFunctions: the file's syntax errors as `syntax error: …`.
    pub fn new(src: &str) -> Result<Evaluator, String> {
        let sf = parse(src).map_err(|e| format!("syntax error: {e}"))?;
        let mut funcs = Vec::new();
        let mut interfaces = Vec::new();
        for it in sf.items {
            match it {
                crate::tsparse::Item::Func(f) => funcs.push(f),
                crate::tsparse::Item::Interface(i) => interfaces.push(i),
                crate::tsparse::Item::Other => {}
            }
        }
        let mut decls = HashMap::new();
        let mut locals = HashMap::new();
        for (i, f) in funcs.iter().enumerate() {
            decls.insert(f.name.clone(), i);
            if f.body.is_some() {
                locals.insert(f.name.clone(), i);
            }
        }
        let n = funcs.len();
        Ok(Evaluator {
            src: sf.src,
            funcs,
            interfaces,
            decls,
            locals,
            views: RefCell::new(None),
            compiled: RefCell::new(vec![None; n]),
            active: RefCell::new(vec![false; n]),
        })
    }

    /// The function declaration of that name (index for `run_function`).
    pub fn decl(&self, name: &str) -> Option<usize> {
        self.decls.get(name).copied()
    }

    fn text(&self, s: usize, e: usize) -> &str {
        &self.src[s..e]
    }

    fn views(&self) -> Result<Rc<Views>, Exc> {
        if let Some(v) = self.views.borrow().as_ref() {
            return Ok(v.clone());
        }
        let mut m = HashMap::new();
        let mut size = HashMap::new();
        const SCALAR: [(&str, u32); 4] = [("u8", 1), ("u16", 2), ("u32", 4), ("u64", 8)];
        for it in &self.interfaces {
            let mut fields = HashMap::new();
            for mb in &it.members {
                let (name, ty, s, e) = match mb {
                    Member::Prop { name, ty, s, e } => (name, ty, *s, *e),
                    Member::Other { s, e } => {
                        return eval_err(format!("bad view field {}", self.text(*s, *e)))
                    }
                };
                let bad = || Exc::Eval(format!("bad view field {}", self.text(s, e)));
                let Some(Ty {
                    k: TyK::Ref(tn0, targs),
                    ..
                }) = ty
                else {
                    return Err(bad());
                };
                if tn0 != "at" {
                    return Err(bad());
                }
                let (Some(o), Some(t)) = (targs.first(), targs.get(1)) else {
                    return Err(bad());
                };
                let (TyK::NumLit(on), TyK::Ref(tn, targs2)) = (&o.k, &t.k) else {
                    return Err(bad());
                };
                let off = big(on)?;
                if let Some(&(_, sz)) = SCALAR.iter().find(|x| x.0 == tn) {
                    fields.insert(
                        name.clone(),
                        VField {
                            off,
                            kind: VKind::Scalar,
                            size: sz,
                            ty: None,
                        },
                    );
                } else if tn == "ref" {
                    let Some(Ty {
                        k: TyK::Ref(to, _), ..
                    }) = targs2.first()
                    else {
                        return eval_err(format!("bad ref {}", self.text(s, e)));
                    };
                    fields.insert(
                        name.clone(),
                        VField {
                            off,
                            kind: VKind::Ref,
                            size: 8,
                            ty: Some(to.clone()),
                        },
                    );
                } else {
                    fields.insert(
                        name.clone(),
                        VField {
                            off,
                            kind: VKind::Embed,
                            size: 0,
                            ty: Some(tn.clone()),
                        },
                    );
                }
            }
            m.insert(it.name.clone(), fields);
            size.remove(&it.name);
            for h in &it.heritage {
                let ok = match h.args.first() {
                    Some(Ty {
                        k: TyK::NumLit(n), ..
                    }) if h.expr == "sized" => Some(big(n)?),
                    _ => None,
                };
                let Some(n) = ok else {
                    return eval_err(format!("bad view heritage {}", self.text(h.s, h.e)));
                };
                size.insert(it.name.clone(), n);
            }
        }
        let v = Rc::new(Views { m, size });
        *self.views.borrow_mut() = Some(v.clone());
        Ok(v)
    }

    fn compiled(&self, i: usize) -> Result<Rc<Compiled>, Exc> {
        if let Some(c) = &self.compiled.borrow()[i] {
            return Ok(c.clone());
        }
        let c = Rc::new(Comp::compile(self, &self.funcs[i])?);
        self.compiled.borrow_mut()[i] = Some(c.clone());
        Ok(c)
    }

    /// runFunction: run a program function of the output with its arguments.
    pub fn run_function(&self, i: usize, args: &[u64], env: &mut Env) -> Result<RunResult, Exc> {
        let c = self.compiled(i)?;
        let mut vals: Vec<Option<V>> = vec![None; c.nslots];
        for (k, v) in vals.iter_mut().enumerate().take(c.nparams) {
            *v = Some(args.get(k).copied().unwrap_or(0) as V);
        }
        vals[c.fp_slot] = Some(env.fp as V);
        let mut ctl = Ctl {
            label: None,
            ret: None,
            steps: 0,
            max: env.max_steps,
        };
        let mut rt = Rt {
            ev: self,
            vals,
            ctl: &mut ctl,
        };
        match rt.st(&c.body, env) {
            Ok(r) => Ok(RunResult {
                ret: if r == 3 {
                    ctl.ret.map(|v| v as u64)
                } else {
                    None
                },
                ..Default::default()
            }),
            Err(Exc::Abort(m)) => Ok(RunResult {
                abort: Some(m),
                ..Default::default()
            }),
            Err(Exc::StepLimit) => Ok(RunResult {
                limit: true,
                ..Default::default()
            }),
            Err(e) => Err(e),
        }
    }

    /// Run a helper defined in the output in the caller's environment (aborts and step limits propagate).
    fn run_local(&self, i: usize, args: &[V], env: &mut Env) -> Result<V, Exc> {
        let c = self.compiled(i)?;
        if self.active.borrow()[i] {
            return eval_err(format!("helper {} entered twice", self.funcs[i].name));
        }
        let mut vals: Vec<Option<V>> = vec![None; c.nslots];
        for (k, v) in vals.iter_mut().enumerate().take(c.nparams) {
            *v = Some(w(args.get(k).copied().unwrap_or(0)));
        }
        vals[c.fp_slot] = Some(env.fp as V);
        let mut ctl = Ctl {
            label: None,
            ret: None,
            steps: 0,
            max: env.max_steps,
        };
        self.active.borrow_mut()[i] = true;
        let r = Rt {
            ev: self,
            vals,
            ctl: &mut ctl,
        }
        .st(&c.body, env);
        self.active.borrow_mut()[i] = false;
        let r = r?;
        Ok(if r == 3 { ctl.ret.unwrap_or(0) } else { 0 })
    }
}

/// Compilation of one function.
struct Comp<'v> {
    ev: &'v Evaluator,
    views: Rc<Views>,
    slots: HashMap<String, usize>,
    names: Vec<Rc<str>>,
    decl_type: HashMap<String, String>,
    labels: HashMap<String, u32>,
}

impl<'v> Comp<'v> {
    fn compile(ev: &'v Evaluator, f: &Func) -> Result<Compiled, Exc> {
        let views = ev.views()?;
        let mut c = Comp {
            ev,
            views,
            slots: HashMap::new(),
            names: Vec::new(),
            decl_type: HashMap::new(),
            labels: HashMap::new(),
        };
        for p in &f.params {
            c.slot(&p.name);
        }
        let fp_slot = c.slot("fp");
        // view types of identifiers: from parameter and variable declarations
        for p in &f.params {
            c.note_type(&p.name, p.ty.as_ref())?;
        }
        let body = f.body.as_deref().unwrap_or(&[]);
        for s in body {
            c.scan_decls(s)?;
        }
        // every name that is a variable of the function (its slot at run time)
        for s in body {
            c.scan_slots(s);
        }
        let body = c.list(body)?;
        Ok(Compiled {
            nslots: c.names.len(),
            nparams: f.params.len(),
            fp_slot,
            body,
        })
    }
    fn slot(&mut self, n: &str) -> usize {
        if let Some(&i) = self.slots.get(n) {
            return i;
        }
        let i = self.names.len();
        self.slots.insert(n.to_string(), i);
        self.names.push(n.into());
        i
    }
    fn label(&mut self, l: &str) -> u32 {
        let n = self.labels.len() as u32;
        *self.labels.entry(l.to_string()).or_insert(n)
    }
    fn text(&self, s: usize, e: usize) -> &str {
        self.ev.text(s, e)
    }
    fn note_type(&mut self, n: &str, t: Option<&Ty>) -> Result<(), Exc> {
        let Some(Ty {
            k: TyK::Ref(tn, _), ..
        }) = t
        else {
            return Ok(());
        };
        if !self.views.m.contains_key(tn) {
            return Ok(());
        }
        if let Some(prev) = self.decl_type.get(n) {
            if prev != tn {
                return eval_err(format!("{n} declared with two view types"));
            }
        }
        self.decl_type.insert(n.to_string(), tn.clone());
        Ok(())
    }
    fn scan_decls(&mut self, s: &S) -> Result<(), Exc> {
        match &s.k {
            St::Var(ds) => {
                for d in ds {
                    self.note_type(&d.name, d.ty.as_ref())?;
                }
            }
            St::Block(v) => {
                for x in v {
                    self.scan_decls(x)?;
                }
            }
            St::If(_, a, b) => {
                self.scan_decls(a)?;
                if let Some(b) = b {
                    self.scan_decls(b)?;
                }
            }
            St::While(_, a) | St::Do(a, _) | St::Labeled(_, a) => self.scan_decls(a)?,
            St::Switch(_, cs) => {
                for c in cs {
                    for x in &c.body {
                        self.scan_decls(x)?;
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }
    fn scan_slots_e(&mut self, e: &E) {
        match &e.k {
            Ex::Bin(op, l, r) => {
                if *op == "=" && !matches!(l.k, Ex::Prop(..)) {
                    let n = match &l.k {
                        Ex::Ident(n) => n.clone(),
                        _ => "undefined".to_string(),
                    };
                    self.slot(&n);
                }
                self.scan_slots_e(l);
                self.scan_slots_e(r);
            }
            Ex::Paren(a)
            | Ex::Unary(_, a)
            | Ex::Postfix(_, a)
            | Ex::Void(a)
            | Ex::TypeOf(a)
            | Ex::Delete(a)
            | Ex::Prop(a, _)
            | Ex::As(a, _) => self.scan_slots_e(a),
            Ex::Elem(a, k) => {
                self.scan_slots_e(a);
                self.scan_slots_e(k);
            }
            Ex::Call(c, args) => {
                self.scan_slots_e(c);
                for a in args {
                    self.scan_slots_e(a);
                }
            }
            Ex::Cond(c, a, b) => {
                self.scan_slots_e(c);
                self.scan_slots_e(a);
                self.scan_slots_e(b);
            }
            _ => {}
        }
    }
    fn scan_slots(&mut self, s: &S) {
        match &s.k {
            St::Var(ds) => {
                for d in ds {
                    self.slot(&d.name);
                    if let Some(i) = &d.init {
                        self.scan_slots_e(i);
                    }
                }
            }
            St::Block(v) => {
                for x in v {
                    self.scan_slots(x);
                }
            }
            St::Expr(e) => self.scan_slots_e(e),
            St::If(c, a, b) => {
                self.scan_slots_e(c);
                self.scan_slots(a);
                if let Some(b) = b {
                    self.scan_slots(b);
                }
            }
            St::While(c, a) | St::Do(a, c) => {
                self.scan_slots_e(c);
                self.scan_slots(a);
            }
            St::Labeled(_, a) => self.scan_slots(a),
            St::Return(Some(e)) => self.scan_slots_e(e),
            St::Switch(v, cs) => {
                self.scan_slots_e(v);
                for c in cs {
                    if let Some(t) = &c.test {
                        self.scan_slots_e(t);
                    }
                    for x in &c.body {
                        self.scan_slots(x);
                    }
                }
            }
            _ => {}
        }
    }
    fn field(&self, e: &E) -> Result<VField, Exc> {
        let Ex::Prop(obj, name) = &e.k else {
            unreachable!()
        };
        let Some(t) = self.type_of(obj)? else {
            return eval_err(format!(
                "field access on a value without a view type: {}",
                self.text(e.s, e.e)
            ));
        };
        match self.views.m.get(&t).and_then(|m| m.get(name)) {
            Some(f) => Ok(f.clone()),
            None => eval_err(format!("no field {name} in view {t}")),
        }
    }
    /// view type of an expression (None: a plain value)
    fn type_of(&self, e: &E) -> Result<Option<String>, Exc> {
        Ok(match &e.k {
            Ex::Paren(a) => self.type_of(a)?,
            Ex::Ident(n) => self.decl_type.get(n).cloned(),
            Ex::As(
                _,
                Ty {
                    k: TyK::Ref(tn, _), ..
                },
            ) if self.views.m.contains_key(tn) => Some(tn.clone()),
            Ex::Prop(..) => {
                let f = self.field(e)?;
                if f.kind == VKind::Scalar {
                    None
                } else {
                    f.ty
                }
            }
            Ex::Elem(a, _) => self.type_of(a)?,
            _ => None,
        })
    }
    fn ex(&mut self, e: &E) -> Result<CE, Exc> {
        Ok(match &e.k {
            Ex::Paren(a) => self.ex(a)?,
            Ex::Num(t) => CE::Const(big(t)?),
            Ex::True => CE::Const(1),
            Ex::Str(v) => CE::Str(v.clone()),
            Ex::Ident(n) => {
                if n == "undef" {
                    CE::Const(UNDEF as V)
                } else if let Some(&i) = self.slots.get(n) {
                    CE::Slot(i, self.names[i].clone())
                } else {
                    CE::Global(n.clone())
                }
            }
            Ex::Unary(op, a) => {
                if *op == "-" {
                    if let Ex::Num(t) = &a.k {
                        return Ok(CE::Const(-big(t)?));
                    }
                }
                let x = Box::new(self.ex(a)?);
                match *op {
                    "-" => CE::Neg(x),
                    "~" => CE::Not(x),
                    "!" => CE::LNot(x),
                    _ => return eval_err("bad unary".into()),
                }
            }
            Ex::Void(a) => CE::Void(Box::new(self.ex(a)?)),
            Ex::Prop(obj, _) => {
                let f = self.field(e)?;
                let o = Box::new(self.ex(obj)?);
                if f.kind == VKind::Embed {
                    CE::Addr(o, f.off)
                } else {
                    CE::FieldLoad(o, f.off, f.size)
                }
            }
            Ex::Elem(obj, k) => {
                let t = self.type_of(obj)?;
                let size = t.and_then(|t| self.views.size.get(&t).copied());
                let (Some(size), Ex::Num(kt)) = (size.filter(|&s| s != 0), &k.k) else {
                    return eval_err(format!("bad element access {}", self.text(e.s, e.e)));
                };
                let o = Box::new(self.ex(obj)?);
                CE::Addr(o, big(kt)? * size)
            }
            Ex::As(a, t) => {
                if let TyK::Ref(tn, _) = &t.k {
                    if self.views.m.contains_key(tn) {
                        return self.ex(a);
                    }
                }
                let x = Box::new(self.ex(a)?);
                let tt = self.text(t.s, t.e);
                let (signed, bits) = match tt {
                    "u8" => (false, 8),
                    "u16" => (false, 16),
                    "u32" => (false, 32),
                    "u64" => (false, 64),
                    "i8" => (true, 8),
                    "i16" => (true, 16),
                    "i32" => (true, 32),
                    "i64" => (true, 64),
                    _ => return eval_err(format!("bad cast {tt}")),
                };
                CE::Cast(x, bits, signed)
            }
            Ex::Call(callee, args) => {
                let name = self.text(callee.s, callee.e).to_string();
                if name == "keyeq" {
                    // keyeq(p, "<base58>"): 32 bytes at p == the key, compared as ascending 8-byte words
                    let Some(a0) = args.first() else {
                        return eval_err("TypeError: keyeq without arguments".into());
                    };
                    let p0 = Box::new(self.ex(a0)?);
                    let Some(E {
                        k: Ex::Str(lit), ..
                    }) = args.get(1)
                    else {
                        return eval_err("keyeq needs a base58 literal".into());
                    };
                    let key = base58_decode(&String::from_utf16_lossy(lit))?;
                    let mut words = [0u64; 4];
                    for (i, wd) in words.iter_mut().enumerate() {
                        *wd = u64::from_le_bytes(key[i * 8..i * 8 + 8].try_into().unwrap());
                    }
                    return Ok(CE::KeyEq(p0, words));
                }
                let a = args
                    .iter()
                    .map(|x| self.ex(x))
                    .collect::<Result<Vec<_>, _>>()?;
                helper(name, a)
            }
            Ex::Cond(c, a, b2) => CE::Cond(
                Box::new(self.ex(c)?),
                Box::new(self.ex(a)?),
                Box::new(self.ex(b2)?),
            ),
            Ex::Bin(op, l, r) => {
                if *op == "=" {
                    if let Ex::Prop(obj, _) = &l.k {
                        // x.f = v: store to a scalar (or pointer: 8 bytes) view field
                        let f = self.field(l)?;
                        let o = Box::new(self.ex(obj)?);
                        let rv = Box::new(self.ex(r)?);
                        if f.kind == VKind::Embed {
                            return eval_err(format!(
                                "assignment to an embedded view field: {}",
                                self.text(e.s, e.e)
                            ));
                        }
                        return Ok(CE::FieldStore(o, f.off, f.size, rv));
                    }
                    let n = match &l.k {
                        Ex::Ident(n) => n.clone(),
                        _ => "undefined".to_string(),
                    };
                    let i = self.slot(&n);
                    return Ok(CE::Assign(i, Box::new(self.ex(r)?)));
                }
                let a = Box::new(self.ex(l)?);
                let bb = Box::new(self.ex(r)?);
                let o = match *op {
                    "&&" => Op::LAnd,
                    "||" => Op::LOr,
                    "+" => Op::Add,
                    "-" => Op::Sub,
                    "*" => Op::Mul,
                    "/" => Op::Div,
                    "%" => Op::Rem,
                    "&" => Op::And,
                    "|" => Op::Or,
                    "^" => Op::Xor,
                    "<<" => Op::Shl,
                    ">>" => Op::Shr,
                    "==" | "===" => Op::Eq,
                    "!=" | "!==" => Op::Ne,
                    "<" => Op::Lt,
                    "<=" => Op::Le,
                    ">" => Op::Gt,
                    ">=" => Op::Ge,
                    _ => return eval_err(format!("bad binary {op}")),
                };
                CE::Bin(o, a, bb)
            }
            k => {
                return eval_err(format!(
                    "unsupported expression {}: {}",
                    k.kind_name(),
                    self.text(e.s, e.e)
                ))
            }
        })
    }
    fn list(&mut self, ss: &[S]) -> Result<CS, Exc> {
        Ok(CS::List(
            ss.iter()
                .map(|s| self.st(s, None))
                .collect::<Result<_, _>>()?,
        ))
    }
    fn st(&mut self, s: &S, label: Option<u32>) -> Result<CS, Exc> {
        Ok(match &s.k {
            St::Block(v) => self.list(v)?,
            St::Expr(e) => CS::Expr(self.ex(e)?),
            St::Var(ds) => {
                let mut v = Vec::new();
                for d in ds {
                    let i = self.slot(&d.name);
                    let init = match &d.init {
                        Some(x) => Some(self.ex(x)?),
                        None => None,
                    };
                    v.push((i, init));
                }
                CS::Var(v)
            }
            St::If(c, a, b2) => {
                let c = self.ex(c)?;
                let t = Box::new(self.st(a, None)?);
                let f = match b2 {
                    Some(x) => Some(Box::new(self.st(x, None)?)),
                    None => None,
                };
                CS::If(c, t, f)
            }
            St::While(c, body) => {
                let c = self.ex(c)?;
                CS::While(c, Box::new(self.st(body, None)?), label)
            }
            St::Do(body, c) => {
                let c = self.ex(c)?;
                CS::Do(Box::new(self.st(body, None)?), c, label)
            }
            St::Labeled(l, inner) => {
                let l = self.label(l);
                if matches!(inner.k, St::While(..) | St::Do(..)) {
                    return self.st(inner, Some(l));
                }
                CS::Labeled(l, Box::new(self.st(inner, None)?))
            }
            St::Break(l) => CS::Break(l.as_ref().map(|l| self.label(l))),
            St::Continue(l) => CS::Continue(l.as_ref().map(|l| self.label(l))),
            St::Return(e) => CS::Return(match e {
                Some(e) => Some(self.ex(e)?),
                None => None,
            }),
            St::Switch(v, cs) => {
                let v = self.ex(v)?;
                let mut out = Vec::new();
                for c in cs {
                    let t = match &c.test {
                        Some(t) => Some(self.ex(t)?),
                        None => None,
                    };
                    out.push((t, self.list(&c.body)?));
                }
                CS::Switch(v, out)
            }
            k => return eval_err(format!("unsupported statement {}", k.kind_name())),
        })
    }
}

fn helper(name: String, args: Vec<CE>) -> CE {
    let h = match name.as_str() {
        "ld8" => H::Ld(1),
        "ld16" => H::Ld(2),
        "ld32" => H::Ld(4),
        "ld64" => H::Ld(8),
        "st8" => H::St(1),
        "st16" => H::St(2),
        "st32" => H::St(4),
        "st64" => H::St(8),
        "copy" => H::Copy,
        "copyr" => H::Copyr,
        "shl" => H::Shl,
        "sar" => H::Sar,
        "sdiv" => H::SDiv,
        "srem" => H::SRem,
        "sdiv32" => H::SDiv32,
        "srem32" => H::SRem32,
        "mulhu" => H::Mulhu,
        "mulhs" => H::Mulhs,
        "bswap16" => H::Bswap(16),
        "bswap32" => H::Bswap(32),
        "bswap64" => H::Bswap(64),
        "popcount" => H::Popcount,
        "clz" => H::Clz,
        "ctz" => H::Ctz,
        "rotl" => H::Rotl,
        "min" => H::Min,
        "max" => H::Max,
        "smin" => H::Smin,
        "smax" => H::Smax,
        "sat_sub" => H::SatSub,
        "memeq" => H::Memeq,
        "rc_inc" => H::RcInc,
        "rc_dec" => H::RcDec,
        "rc_release" => H::RcRelease,
        "trap" => H::Trap,
        "callx" => H::Callx,
        _ => return CE::Call(name, args),
    };
    CE::Helper(h, args)
}

/// Run-time state of one invocation.
struct Rt<'r> {
    ev: &'r Evaluator,
    vals: Vec<Option<V>>,
    ctl: &'r mut Ctl,
}

fn arg<'c>(a: &'c [CE], i: usize) -> Result<&'c CE, Exc> {
    a.get(i)
        .ok_or_else(|| Exc::Eval("TypeError: missing argument".into()))
}

impl<'r> Rt<'r> {
    fn all(&mut self, a: &[CE], env: &mut Env) -> Result<Vec<V>, Exc> {
        a.iter().map(|x| self.ex(x, env)).collect()
    }
    fn two(&mut self, a: &[CE], env: &mut Env) -> Result<(V, V), Exc> {
        let x = self.ex(arg(a, 0)?, env)?;
        let y = self.ex(arg(a, 1)?, env)?;
        Ok((x, y))
    }
    fn load(env: &Env, a: V, size: u32) -> V {
        env.mem.load(a as u64, size) as V
    }
    fn store(env: &mut Env, a: V, size: u32, v: V) -> Result<(), Exc> {
        env.mem.store(a as u64, size, v as u64)
    }
    fn ex(&mut self, e: &CE, env: &mut Env) -> Result<V, Exc> {
        Ok(match e {
            CE::Const(v) => *v,
            CE::Str(text) => {
                let Some(f) = env.str_addr else { return Ok(0) };
                match f(&String::from_utf16_lossy(text)) {
                    Some(a) => a as V,
                    None => {
                        return eval_err(format!(
                            "string not in program memory: {}",
                            json_str(text)
                        ))
                    }
                }
            }
            CE::Slot(i, n) => match self.vals[*i] {
                Some(v) => v,
                None => {
                    if env.undef_uninit {
                        UNDEF as V
                    } else {
                        return eval_err(format!("read of uninitialized variable {n}"));
                    }
                }
            },
            CE::Global(n) => match env.fn_addr.get(n) {
                Some(&a) => a as V,
                None => return eval_err(format!("unknown identifier {n}")),
            },
            CE::Neg(a) => w(-self.ex(a, env)?),
            CE::Not(a) => w(!self.ex(a, env)?),
            CE::LNot(a) => b(w(self.ex(a, env)?) == 0),
            CE::Void(a) => {
                self.ex(a, env)?;
                0
            }
            CE::FieldLoad(o, off, size) => {
                let a = w(self.ex(o, env)? + off);
                Self::load(env, a, *size)
            }
            CE::Addr(o, off) => w(self.ex(o, env)? + off),
            CE::Cast(a, bits, signed) => {
                let x = self.ex(a, env)?;
                if *signed {
                    as_int(*bits, x)
                } else {
                    as_uint(*bits, x)
                }
            }
            CE::KeyEq(p0, words) => {
                let p = self.ex(p0, env)?;
                for (i, &wd) in words.iter().enumerate() {
                    if Self::load(env, w(p + 8 * i as V), 8) != wd as V {
                        return Ok(0);
                    }
                }
                1
            }
            CE::Cond(c, a, b2) => {
                if w(self.ex(c, env)?) != 0 {
                    self.ex(a, env)?
                } else {
                    self.ex(b2, env)?
                }
            }
            CE::FieldStore(o, off, size, r) => {
                let a = w(self.ex(o, env)? + off);
                let v = w(self.ex(r, env)?);
                Self::store(env, a, *size, v)?;
                v
            }
            CE::Assign(i, r) => {
                let v = w(self.ex(r, env)?);
                self.vals[*i] = Some(v);
                v
            }
            CE::Bin(op, a, b2) => self.bin(*op, a, b2, env)?,
            CE::Helper(h, args) => self.helper(*h, args, env)?,
            CE::Call(name, args) => {
                let t = env
                    .fn_target
                    .get(name)
                    .or_else(|| env.sys_target.get(name))
                    .cloned();
                let Some(t) = t else {
                    // a function defined in the output that is not a program function: an outlined helper, run in place
                    let Some(&d) = self.ev.locals.get(name) else {
                        return eval_err(format!("unknown function {name}"));
                    };
                    let vs = self.all(args, env)?.into_iter().map(w).collect::<Vec<_>>();
                    return self.ev.run_local(d, &vs, env);
                };
                let mut vs: Vec<u64> = self.all(args, env)?.into_iter().map(|v| v as u64).collect();
                if let Some(n) = env.arity.and_then(|m| m.get(&t)) {
                    while vs.len() < *n {
                        vs.push(UNDEF);
                    }
                }
                (env.on_call)(env.mem, &t, vs)? as V
            }
        })
    }
    fn bin(&mut self, op: Op, a: &CE, b2: &CE, env: &mut Env) -> Result<V, Exc> {
        Ok(match op {
            Op::LAnd => b(w(self.ex(a, env)?) != 0 && w(self.ex(b2, env)?) != 0),
            Op::LOr => b(w(self.ex(a, env)?) != 0 || w(self.ex(b2, env)?) != 0),
            _ => {
                let x = self.ex(a, env)?;
                let y = self.ex(b2, env)?;
                match op {
                    Op::Add => w(x + y),
                    Op::Sub => w(x - y),
                    Op::Mul => (x as u64).wrapping_mul(y as u64) as V,
                    Op::Div | Op::Rem => {
                        if w(y) == 0 {
                            return Err(Exc::Abort("division by zero".into()));
                        }
                        if x < 0 || y < 0 {
                            return eval_err("signed operand to / or %".into());
                        }
                        if matches!(op, Op::Div) {
                            x / y
                        } else {
                            x % y
                        }
                    }
                    Op::And => w(x & y),
                    Op::Or => w(x | y),
                    Op::Xor => w(x ^ y),
                    Op::Shl => {
                        if !(0..=63).contains(&y) {
                            return eval_err("shift amount out of range".into());
                        }
                        ((x as u64) << y) as V
                    }
                    Op::Shr => {
                        if !(0..=63).contains(&y) {
                            return eval_err("shift amount out of range".into());
                        }
                        if x < 0 {
                            return eval_err("signed operand to >>".into());
                        }
                        x >> y
                    }
                    Op::Eq => b(w(x) == w(y)),
                    Op::Ne => b(w(x) != w(y)),
                    Op::Lt => b(x < y),
                    Op::Le => b(x <= y),
                    Op::Gt => b(x > y),
                    Op::Ge => b(x >= y),
                    Op::LAnd | Op::LOr => unreachable!(),
                }
            }
        })
    }
    fn helper(&mut self, h: H, args: &[CE], env: &mut Env) -> Result<V, Exc> {
        Ok(match h {
            H::Ld(sz) => {
                let a = w(self.ex(arg(args, 0)?, env)?);
                Self::load(env, a, sz)
            }
            H::St(sz) => {
                let vs = self.all(args, env)?;
                for i in 1..vs.len() {
                    Self::store(env, w(vs[0] + (i as V - 1) * sz as V), sz, w(vs[i]))?;
                }
                0
            }
            H::Copy | H::Copyr => {
                let vs = self.all(args, env)?;
                if vs.len() < 3 {
                    return eval_err("TypeError: missing argument".into());
                }
                let (d, s0, n) = (vs[0], vs[1], vs[2]);
                if matches!(h, H::Copy) {
                    let mut o = 0;
                    while o < n {
                        let v = Self::load(env, w(s0 + o), 8);
                        Self::store(env, w(d + o), 8, v)?;
                        o += 8;
                    }
                } else {
                    let mut o = n - 8;
                    while o >= 0 {
                        let v = Self::load(env, w(s0 + o), 8);
                        Self::store(env, w(d + o), 8, v)?;
                        o -= 8;
                    }
                }
                0
            }
            H::Shl | H::Sar => {
                let (a, b2) = self.two(args, env)?;
                if w(b2) > 63 {
                    return eval_err("shift >= 64".into());
                }
                if matches!(h, H::Shl) {
                    ((a as u64) << w(b2)) as V
                } else {
                    w(as_int(64, a) >> w(b2))
                }
            }
            H::SDiv | H::SRem => {
                let (p, q) = self.two(args, env)?;
                let (x, y) = (as_int(64, p), as_int(64, q));
                if y == 0 {
                    return Err(Exc::Abort("division by zero".into()));
                }
                if x == i64::MIN as V && y == -1 {
                    return Err(Exc::Abort("division overflow".into()));
                }
                w(if matches!(h, H::SDiv) { x / y } else { x % y })
            }
            H::SDiv32 | H::SRem32 => {
                let (p, q) = self.two(args, env)?;
                let (x, y) = (as_int(32, p), as_int(32, q));
                if y == 0 {
                    return Err(Exc::Abort("division by zero".into()));
                }
                if x == i32::MIN as V && y == -1 {
                    return Err(Exc::Abort("division overflow".into()));
                }
                as_uint(32, if matches!(h, H::SDiv32) { x / y } else { x % y })
            }
            H::Mulhu => {
                let (a, b2) = self.two(args, env)?;
                ((w(a) as u128 * w(b2) as u128) >> 64) as V
            }
            H::Mulhs => {
                let (a, b2) = self.two(args, env)?;
                w((as_int(64, a) * as_int(64, b2)) >> 64)
            }
            H::Bswap(bits) => {
                let x = as_uint(bits, self.ex(arg(args, 0)?, env)?) as u64;
                (match bits {
                    16 => (x as u16).swap_bytes() as u64,
                    32 => (x as u32).swap_bytes() as u64,
                    _ => x.swap_bytes(),
                }) as V
            }
            H::Popcount => (w(self.ex(arg(args, 0)?, env)?) as u64).count_ones() as V,
            H::Clz => (w(self.ex(arg(args, 0)?, env)?) as u64).leading_zeros() as V,
            H::Ctz => (w(self.ex(arg(args, 0)?, env)?) as u64).trailing_zeros() as V,
            H::Rotl => {
                let (a, b2) = self.two(args, env)?;
                (w(a) as u64).rotate_left((w(b2) % 64) as u32) as V
            }
            H::Min | H::Max | H::Smin | H::Smax | H::SatSub => {
                let (a, b2) = self.two(args, env)?;
                let (x, y) = (w(a), w(b2));
                match h {
                    H::Min => x.min(y),
                    H::Max => x.max(y),
                    H::Smin => {
                        if as_int(64, a) < as_int(64, b2) {
                            x
                        } else {
                            y
                        }
                    }
                    H::Smax => {
                        if as_int(64, a) > as_int(64, b2) {
                            x
                        } else {
                            y
                        }
                    }
                    _ => {
                        if x >= y {
                            x - y
                        } else {
                            0
                        }
                    }
                }
            }
            H::Memeq => {
                let vs = self.all(args, env)?;
                if vs.len() < 3 {
                    return eval_err("TypeError: missing argument".into());
                }
                let (p0, q0, n0) = (vs[0], vs[1], vs[2]);
                let mut o = 0;
                while o < w(n0) {
                    if Self::load(env, w(p0 + o), 8) != Self::load(env, w(q0 + o), 8) {
                        return Ok(0);
                    }
                    o += 8;
                }
                1
            }
            H::RcInc | H::RcDec | H::RcRelease => {
                let p = w(self.ex(arg(args, 0)?, env)?);
                let x = match args.get(1) {
                    Some(a) => w(self.ex(a, env)?),
                    None => Self::load(env, p, 8),
                };
                match h {
                    H::RcInc => {
                        Self::store(env, p, 8, w(x + 1))?;
                        if x == M {
                            // the abort() syscall, as a call
                            let Some(t) = env.sys_target.get("abort").cloned() else {
                                return eval_err("rc_inc without an abort syscall".into());
                            };
                            (env.on_call)(env.mem, &t, Vec::new())?;
                            return Err(Exc::Abort("abort".into()));
                        }
                        0
                    }
                    H::RcDec => {
                        Self::store(env, p, 8, w(x - 1))?;
                        if x == 1 {
                            let v = Self::load(env, w(p + 8), 8);
                            Self::store(env, w(p + 8), 8, w(v - 1))?;
                        }
                        0
                    }
                    _ => {
                        Self::store(env, p, 8, w(x - 1))?;
                        b(x == 1)
                    }
                }
            }
            H::Trap => return Err(Exc::Abort("trap".into())),
            H::Callx => {
                let vs: Vec<u64> = self.all(args, env)?.into_iter().map(|v| v as u64).collect();
                let Some(&f) = vs.first() else {
                    return eval_err("TypeError: missing argument".into());
                };
                (env.on_call)(env.mem, &format!("ptr:{f:x}"), vs[1..].to_vec())? as V
            }
        })
    }
    /// 0 normal, 1 break, 2 continue, 3 return
    fn st(&mut self, s: &CS, env: &mut Env) -> Result<u8, Exc> {
        Ok(match s {
            CS::List(v) => {
                for x in v {
                    let r = self.st(x, env)?;
                    if r != 0 {
                        return Ok(r);
                    }
                }
                0
            }
            CS::Expr(e) => {
                self.ex(e, env)?;
                0
            }
            CS::Var(ds) => {
                for (i, init) in ds {
                    self.vals[*i] = match init {
                        Some(x) => Some(w(self.ex(x, env)?)),
                        None => None,
                    };
                }
                0
            }
            CS::If(c, t, f) => {
                if w(self.ex(c, env)?) != 0 {
                    self.st(t, env)?
                } else if let Some(f) = f {
                    self.st(f, env)?
                } else {
                    0
                }
            }
            CS::While(c, body, label) => {
                while w(self.ex(c, env)?) != 0 {
                    match self.loop_body(body, *label, env)? {
                        -1 => break,
                        0 => {}
                        r => return Ok(r as u8),
                    }
                }
                0
            }
            CS::Do(body, c, label) => {
                loop {
                    match self.loop_body(body, *label, env)? {
                        -1 => break,
                        0 => {}
                        r => return Ok(r as u8),
                    }
                    if w(self.ex(c, env)?) == 0 {
                        break;
                    }
                }
                0
            }
            CS::Labeled(l, inner) => {
                let r = self.st(inner, env)?;
                if r == 1 && self.ctl.label == Some(*l) {
                    self.ctl.label = None;
                    0
                } else {
                    r
                }
            }
            CS::Break(l) => {
                self.ctl.label = *l;
                1
            }
            CS::Continue(l) => {
                self.ctl.label = *l;
                2
            }
            CS::Return(e) => {
                self.ctl.ret = match e {
                    Some(e) => Some(w(self.ex(e, env)?)),
                    None => None,
                };
                3
            }
            CS::Switch(v, cases) => {
                let x = w(self.ex(v, env)?);
                let mut matched = false;
                for (val, body) in cases {
                    if !matched {
                        if let Some(val) = val {
                            if w(self.ex(val, env)?) == x {
                                matched = true;
                            }
                        }
                    }
                    if matched {
                        let r = self.st(body, env)?;
                        if r == 1 && self.ctl.label.is_none() {
                            return Ok(0);
                        }
                        if r != 0 {
                            return Ok(r);
                        }
                    }
                }
                0
            }
        })
    }
    /// run a loop body; -1 exits the loop, 0 continues looping, else a propagating signal
    fn loop_body(&mut self, body: &CS, label: Option<u32>, env: &mut Env) -> Result<i8, Exc> {
        self.ctl.steps += 1;
        if self.ctl.steps > self.ctl.max {
            return Err(Exc::StepLimit);
        }
        let r = self.st(body, env)?;
        if r == 1 && (self.ctl.label.is_none() || self.ctl.label == label) {
            self.ctl.label = None;
            return Ok(-1);
        }
        if r == 2 && (self.ctl.label.is_none() || self.ctl.label == label) {
            self.ctl.label = None;
            return Ok(0);
        }
        Ok(r as i8)
    }
}
