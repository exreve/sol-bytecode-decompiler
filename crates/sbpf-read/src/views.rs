//! `src/views.ts`: typed views (named fields over memory, printed as `x.field`).
//!
//! Views live in an insertion-ordered map (JS `Map` semantics: `add` of an existing name keeps its
//! position, delete + add moves it to the end). Fields carry an identity (`id`): the TS mutates field
//! objects in place and keys maps by them (fieldnames.ts); a copy (`{ ...f }`) is a new id.

use crate::idl::{borsh_prefix, struct_fields, BKind, BorshField};
use crate::util::{js_hex, js_num, n_s, pad_end, u16len, N};
use sbpf_ir::fx::IndexMap;
use sbpf_ir::{BinOp, Ir, Node, E};
use serde_json::Value;
use std::cell::Cell;

#[derive(Clone, Debug, PartialEq)]
pub enum FT {
    Scalar(u8),
    Ref(String),
    Embed(String),
}

#[derive(Clone, Debug)]
pub struct Field {
    pub id: u32,
    pub name: String,
    pub off: N,
    pub t: FT,
    pub doc: Option<String>,
    pub count: Option<N>,
}

#[derive(Clone, Debug)]
pub struct View {
    pub name: String,
    pub doc: String,
    pub size: Option<N>,
    pub fields: Vec<Field>,
    /// the BUILTIN_VIEWS object of that name (identity: `views.map.get(t) === BUILTIN_VIEW[t]`)
    pub builtin: bool,
}

#[derive(Clone, Debug)]
pub struct Opaque {
    pub size: Option<N>,
    pub doc: String,
}

thread_local! {
    static FIELD_ID: Cell<u32> = const { Cell::new(1) };
    static NO_FIELDS: Cell<bool> = const { Cell::new(false) };
}

/// (speculative computations: field identities are made on the calling thread only, in order; returns
/// the previous setting)
pub fn forbid_new_fields(on: bool) -> bool {
    NO_FIELDS.with(|c| c.replace(on))
}

/// A new field identity.
pub fn fid() -> u32 {
    assert!(!NO_FIELDS.with(|c| c.get()), "a field identity made while speculating");
    FIELD_ID.with(|c| {
        let v = c.get();
        c.set(v + 1);
        v
    })
}

pub fn fld(name: &str, off: N, t: FT, doc: Option<&str>) -> Field {
    Field {
        id: fid(),
        name: name.into(),
        off,
        t,
        doc: doc.map(|s| s.to_string()),
        count: None,
    }
}

fn s(n: u8) -> FT {
    FT::Scalar(n)
}
fn rf(t: &str) -> FT {
    FT::Ref(t.into())
}
fn em(t: &str) -> FT {
    FT::Embed(t.into())
}

fn view(name: &str, size: Option<N>, doc: &str, fields: Vec<Field>) -> View {
    View {
        name: name.into(),
        doc: doc.into(),
        size,
        fields,
        builtin: false,
    }
}

pub fn builtin_views() -> Vec<View> {
    let mut v = vec![
        view("AccountInfo", Some(48.0), "solana_program::account_info::AccountInfo (Rust struct, 0x30 bytes; `&[AccountInfo]` has stride 0x30)", vec![
            fld("key", 0.0, rf("Pubkey"), Some("&Pubkey")),
            fld("lamports", 8.0, rf("LamportsCell"), Some("Rc<RefCell<&mut u64>>")),
            fld("data", 16.0, rf("DataCell"), Some("Rc<RefCell<&mut [u8]>>")),
            fld("owner", 24.0, rf("Pubkey"), Some("&Pubkey")),
            fld("rent_epoch", 32.0, s(8), None),
            fld("is_signer", 40.0, s(1), None),
            fld("is_writable", 41.0, s(1), None),
            fld("executable", 42.0, s(1), None),
        ]),
        view("LamportsCell", Some(32.0), "Rc<RefCell<&mut u64>> box of an AccountInfo: reference counts, RefCell borrow flag, the lamports pointer", vec![
            fld("strong", 0.0, s(8), None),
            fld("weak", 8.0, s(8), None),
            fld("borrow", 16.0, s(8), Some("RefCell flag: 0 free, > 0 shared borrows, -1 mutably borrowed")),
            fld("value", 24.0, rf("Lamports"), Some("&mut u64")),
        ]),
        view("Lamports", Some(8.0), "the lamports of an account (in the input buffer)", vec![fld("amount", 0.0, s(8), None)]),
        view("DataCell", Some(40.0), "Rc<RefCell<&mut [u8]>> box of an AccountInfo: reference counts, RefCell borrow flag, the data slice", vec![
            fld("strong", 0.0, s(8), None),
            fld("weak", 8.0, s(8), None),
            fld("borrow", 16.0, s(8), Some("RefCell flag: 0 free, > 0 shared borrows, -1 mutably borrowed")),
            fld("ptr", 24.0, rf("bytes"), Some("data pointer")),
            fld("len", 32.0, s(8), Some("data length")),
        ]),
        view("AccountRecord", None, "serialized account in the program input (what a pinocchio AccountInfo points to)", vec![
            fld("dup_marker", 0.0, s(1), Some("0xff: not a duplicate of an earlier account (pinocchio reuses this byte as borrow state)")),
            fld("is_signer", 1.0, s(1), None),
            fld("is_writable", 2.0, s(1), None),
            fld("executable", 3.0, s(1), None),
            fld("original_data_len", 4.0, s(4), Some("pinocchio: resize delta")),
            fld("key", 8.0, em("Pubkey"), None),
            fld("owner", 40.0, em("Pubkey"), None),
            fld("lamports", 72.0, s(8), None),
            fld("data_len", 80.0, s(8), None),
            fld("data", 88.0, em("bytes"), None),
        ]),
        view("SolInstruction", Some(40.0), "C-ABI instruction (sol_invoke_signed_c): program id, account metas, data", vec![
            fld("program_id", 0.0, rf("Pubkey"), Some("&Pubkey")),
            fld("accounts", 8.0, rf("SolAccountMeta"), None),
            fld("account_len", 16.0, s(8), None),
            fld("data", 24.0, rf("bytes"), None),
            fld("data_len", 32.0, s(8), None),
        ]),
        view("SolAccountMeta", Some(16.0), "C-ABI account meta of a SolInstruction (16 bytes)", vec![
            fld("pubkey", 0.0, rf("Pubkey"), Some("&Pubkey")),
            fld("is_writable", 8.0, s(1), None),
            fld("is_signer", 9.0, s(1), None),
        ]),
        view("StableInstruction", Some(80.0), "solana_program StableInstruction (sol_invoke_signed_rust): account metas and data as StableVec { ptr, cap, len }, the program id in place", vec![
            fld("accounts", 0.0, rf("AccountMeta"), None),
            fld("accounts_cap", 8.0, s(8), None),
            fld("accounts_len", 16.0, s(8), None),
            fld("data", 24.0, rf("bytes"), None),
            fld("data_cap", 32.0, s(8), None),
            fld("data_len", 40.0, s(8), None),
            fld("program_id", 48.0, em("Pubkey"), None),
        ]),
        view("AccountMeta", Some(34.0), "solana_program::instruction::AccountMeta (34 bytes: the key in place, then the flags)", vec![
            fld("pubkey", 0.0, em("Pubkey"), None),
            fld("is_signer", 32.0, s(1), None),
            fld("is_writable", 33.0, s(1), None),
        ]),
        view("Slice", Some(16.0), "&[u8]: pointer and length (a seed)", vec![
            fld("ptr", 0.0, rf("bytes"), None),
            fld("len", 8.0, s(8), None),
        ]),
        view("SeedList", Some(16.0), "&[&[u8]]: one signer's seeds (pointer to Slices, count)", vec![
            fld("ptr", 0.0, rf("Slice"), None),
            fld("len", 8.0, s(8), None),
        ]),
        view("U128", Some(16.0), "u128 / i128 in place (little-endian words)", vec![
            fld("lo", 0.0, s(8), None),
            fld("hi", 8.0, s(8), None),
        ]),
        view("FmtArguments", Some(48.0), "core::fmt::Arguments { pieces: &[&str], args: &[Argument], fmt: Option<&[Placeholder]> } (fields in this order)", vec![
            fld("pieces", 0.0, rf("Slice"), Some("&[&str] (rodata)")),
            fld("pieces_len", 8.0, s(8), None),
            fld("args", 16.0, rf("FmtArg"), None),
            fld("args_len", 24.0, s(8), None),
            fld("fmt", 32.0, rf("bytes"), Some("placeholder specs (0: none)")),
            fld("fmt_len", 40.0, s(8), None),
        ]),
        view("FmtArgumentsSpecsFirst", Some(48.0), "core::fmt::Arguments { pieces: &[&str], fmt: Option<&[Placeholder]>, args: &[Argument] } (fields in this order)", vec![
            fld("pieces", 0.0, rf("Slice"), Some("&[&str] (rodata)")),
            fld("pieces_len", 8.0, s(8), None),
            fld("fmt", 16.0, rf("bytes"), Some("placeholder specs (0: none)")),
            fld("fmt_len", 24.0, s(8), None),
            fld("args", 32.0, rf("FmtArg"), None),
            fld("args_len", 40.0, s(8), None),
        ]),
        view("FmtArg", Some(16.0), "core::fmt::rt::Argument: value pointer, formatter function", vec![
            fld("value", 0.0, rf("bytes"), None),
            fld("formatter", 8.0, s(8), None),
        ]),
    ];
    for n in [1u8, 2, 4, 8] {
        v.push(view(
            &format!("Tagged{}", n as u32 * 8),
            None,
            &format!("enum value returned through an out parameter: its variant tag, a u{} at offset 0 (the payload after it is not named)", n as u32 * 8),
            vec![fld("tag", 0.0, s(n), None)],
        ));
    }
    v.push(view("Result64", Some(32.0), "result a call writes through its first parameter, as 8-byte words (tag: the first word, a Result / Option variant or a niche-encoded value; val…: the payload)", vec![
        fld("tag", 0.0, s(8), None),
        fld("val", 8.0, s(8), None),
        fld("val2", 16.0, s(8), None),
        fld("val3", 24.0, s(8), None),
    ]));
    v.push(view(
        "Input",
        None,
        "program input (entrypoint parameter): account count, then the first serialized account",
        vec![
            fld("num_accounts", 0.0, s(8), None),
            fld("acc0", 8.0, em("AccountRecord"), None),
        ],
    ));
    for x in v.iter_mut() {
        x.builtin = true;
    }
    v
}

pub fn legacy_info_view() -> View {
    view("AccountInfo", Some(48.0), "solana_program::account_info::AccountInfo (Rust struct, 0x30 bytes, pre-repr(C) field order; `&[AccountInfo]` has stride 0x30)", vec![
        fld("rent_epoch", 0.0, s(8), None),
        fld("key", 8.0, rf("Pubkey"), Some("&Pubkey")),
        fld("lamports", 16.0, rf("LamportsCell"), Some("Rc<RefCell<&mut u64>>")),
        fld("data", 24.0, rf("DataCell"), Some("Rc<RefCell<&mut [u8]>>")),
        fld("owner", 32.0, rf("Pubkey"), Some("&Pubkey")),
        fld("is_signer", 40.0, s(1), None),
        fld("is_writable", 41.0, s(1), None),
        fld("executable", 42.0, s(1), None),
    ])
}

pub fn unaligned_views() -> Vec<View> {
    vec![
        view("UnalignedAccount", None, "serialized account in the deprecated loader's unaligned input (BPFLoader1111…): owner [32], executable (u8) and rent_epoch (u64) follow the data", vec![
            fld("dup_marker", 0.0, s(1), Some("0xff: not a duplicate; else the index of the account it duplicates (and nothing else follows)")),
            fld("is_signer", 1.0, s(1), None),
            fld("is_writable", 2.0, s(1), None),
            fld("key", 3.0, em("Pubkey"), None),
            fld("lamports", 35.0, s(8), None),
            fld("data_len", 43.0, s(8), None),
            fld("data", 51.0, em("bytes"), None),
        ]),
        view("Input", None, "program input (entrypoint parameter) of the deprecated loader (unaligned): account count, then the first serialized account", vec![
            fld("num_accounts", 0.0, s(8), None),
            fld("acc0", 8.0, em("UnalignedAccount"), None),
        ]),
    ]
}

/// Opaque embedded types of views.ts OPAQUE.
pub fn is_static_opaque(n: &str) -> bool {
    n == "Pubkey" || n == "bytes"
}

/// The result of resolving a byte offset of a view.
#[derive(Clone, Debug)]
pub struct Resolved {
    pub path: Vec<String>,
    pub rest: N,
    pub last: FT,
}

#[derive(Clone)]
pub struct Views {
    pub map: IndexMap<String, View>,
    pub opaque: IndexMap<String, Opaque>,
}

impl Default for Views {
    fn default() -> Self {
        Self::new()
    }
}

impl Views {
    pub fn new() -> Self {
        let mut map = IndexMap::default();
        for v in builtin_views() {
            map.insert(v.name.clone(), v);
        }
        let mut opaque = IndexMap::default();
        opaque.insert(
            "Pubkey".to_string(),
            Opaque {
                size: Some(32.0),
                doc: "32-byte public key (a Pubkey value is its address)".into(),
            },
        );
        opaque.insert(
            "bytes".to_string(),
            Opaque {
                size: None,
                doc: "byte array in place (a bytes value is its address)".into(),
            },
        );
        Views { map, opaque }
    }
    pub fn add(&mut self, v: View) {
        self.map.insert(v.name.clone(), v);
    }
    pub fn has(&self, n: &str) -> bool {
        self.map.contains_key(n)
    }
    /// `views.map.get(t) === BUILTIN_VIEW[t]`
    pub fn is_builtin(&self, n: &str) -> bool {
        self.map.get(n).is_some_and(|v| v.builtin)
    }

    /// width of a field in bytes (Infinity: open-ended)
    pub fn width(&self, t: &FT) -> N {
        match t {
            FT::Scalar(n) => *n as N,
            FT::Ref(_) => 8.0,
            FT::Embed(ty) => {
                if let Some(o) = self.opaque.get(ty) {
                    return o.size.unwrap_or(f64::INFINITY);
                }
                self.map
                    .get(ty)
                    .and_then(|v| v.size)
                    .unwrap_or(f64::INFINITY)
            }
        }
    }

    /// recordOf: a serialized-account-record view whose data has the given layout.
    pub fn record_of(&mut self, data: &str) -> String {
        let base = data.strip_suffix("Account").unwrap_or(data);
        let name = format!("{base}Record");
        if !self.map.contains_key(&name) {
            let b = &self.map["AccountRecord"];
            let fields = b
                .fields
                .iter()
                .map(|f| {
                    if f.name == "data" {
                        Field {
                            id: fid(),
                            t: FT::Embed(data.into()),
                            ..f.clone()
                        }
                    } else {
                        f.clone()
                    }
                })
                .collect();
            self.map.insert(
                name.clone(),
                view(
                    &name,
                    None,
                    &format!("serialized input account whose data is a {data}"),
                    fields,
                ),
            );
        }
        name
    }

    /// an opaque fixed-size byte range type (Bytes16, ...)
    pub fn bytes(&mut self, n: N) -> String {
        let name = if n == 32.0 {
            "Pubkey".to_string()
        } else {
            format!("Bytes{}", js_num(n))
        };
        if !self.opaque.contains_key(&name) {
            self.opaque.insert(
                name.clone(),
                Opaque {
                    size: Some(n),
                    doc: format!("{} bytes in place (value = their address)", js_num(n)),
                },
            );
        }
        name
    }

    pub fn u128(&mut self) -> String {
        if !self.opaque.contains_key("u128") {
            self.opaque.insert(
                "u128".into(),
                Opaque {
                    size: Some(16.0),
                    doc: "128-bit integer in place (value = its address)".into(),
                },
            );
        }
        "u128".into()
    }

    /// borshView: a view of Borsh-serialized fields (the fixed-offset prefix from byte `base`).
    pub fn borsh_view(
        &mut self,
        name: &str,
        doc: &str,
        fields: &[(String, Value)],
        types: &IndexMap<String, Value>,
        base: N,
    ) -> Option<String> {
        let pre = borsh_prefix(fields, types);
        if pre.is_empty() {
            return None;
        }
        let mut vf = Vec::new();
        for f in &pre {
            let t = self.field_type(f, types);
            vf.push(Field {
                id: fid(),
                name: f.name.clone(),
                off: base + f.off,
                t,
                doc: None,
                count: None,
            });
        }
        let last = pre.last().unwrap();
        let size = if pre.len() == fields.len() {
            Some(base + last.off + last.size)
        } else {
            None
        };
        self.map.insert(
            name.to_string(),
            View {
                name: name.into(),
                doc: doc.into(),
                size,
                fields: vf,
                builtin: false,
            },
        );
        Some(name.to_string())
    }

    fn field_type(&mut self, f: &BorshField, types: &IndexMap<String, Value>) -> FT {
        if f.kind == BKind::Scalar && [1.0, 2.0, 4.0, 8.0].contains(&f.size) {
            return FT::Scalar(f.size as u8);
        }
        if f.kind == BKind::Key {
            return FT::Embed("Pubkey".into());
        }
        if f.kind == BKind::Struct {
            if let Some(ty) = &f.ty {
                let nm = ty.clone();
                if self.map.contains_key(&nm) || is_static_opaque(&nm) {
                    return FT::Embed(nm);
                }
                if let Some(fs) = struct_fields(ty, types) {
                    let ok = self
                        .borsh_view(
                            &nm,
                            &format!("IDL type {ty} (Borsh layout)"),
                            &fs,
                            types,
                            0.0,
                        )
                        .and_then(|n| self.map.get(&n).and_then(|v| v.size))
                        == Some(f.size);
                    if ok {
                        return FT::Embed(nm);
                    }
                }
                self.map.shift_remove(&nm);
            }
        }
        if f.size == 16.0 && f.kind == BKind::Bytes {
            return FT::Embed(self.u128());
        }
        FT::Embed(self.bytes(f.size))
    }

    /// fieldAt: the field of view `ty` covering byte offset off (the last one with the highest offset).
    pub fn field_at(&self, ty: &str, off: N) -> Option<&Field> {
        let v = self.map.get(ty)?;
        let mut best: Option<&Field> = None;
        for f in &v.fields {
            if f.off <= off
                && off < f.off + self.width(&f.t) * f.count.unwrap_or(1.0)
                && best.is_none_or(|b| f.off > b.off)
            {
                best = Some(f);
            }
        }
        best
    }

    /// resolve: path of field names, the byte offset left inside the last field, what it denotes.
    pub fn resolve(&self, ty: &str, off: N) -> Option<Resolved> {
        self.resolve0(ty, off, 0)
    }
    fn resolve0(&self, ty: &str, off: N, depth: u32) -> Option<Resolved> {
        if depth > 32 {
            return None;
        }
        let f = self.field_at(ty, off)?;
        let mut d = off - f.off;
        if let (Some(_), FT::Embed(et)) = (f.count, &f.t) {
            let w = self.width(&f.t);
            let k = (d / w).floor();
            d -= k * w;
            let inner = if d > 0.0 && self.map.contains_key(et) {
                self.resolve0(et, d, depth + 1)
            } else {
                None
            };
            let head = format!("{}[{}]", f.name, js_num(k));
            return Some(match inner {
                Some(i) => {
                    let mut path = vec![head];
                    path.extend(i.path);
                    Resolved {
                        path,
                        rest: i.rest,
                        last: i.last,
                    }
                }
                None => Resolved {
                    path: vec![head],
                    rest: d,
                    last: f.t.clone(),
                },
            });
        }
        if let FT::Embed(et) = &f.t {
            if d > 0.0 && self.map.contains_key(et) {
                if let Some(i) = self.resolve0(et, d, depth + 1) {
                    let mut path = vec![f.name.clone()];
                    path.extend(i.path);
                    return Some(Resolved {
                        path,
                        rest: i.rest,
                        last: i.last,
                    });
                }
            }
        }
        Some(Resolved {
            path: vec![f.name.clone()],
            rest: d,
            last: f.t.clone(),
        })
    }

    /// render: TypeScript declarations of the given views (and the views they mention).
    pub fn render(&self, names: &[String]) -> Vec<String> {
        let mut want: sbpf_ir::fx::HashSet<String> = sbpf_ir::fx::HashSet::default();
        fn visit(v: &Views, n: &str, want: &mut sbpf_ir::fx::HashSet<String>) {
            if want.contains(n) {
                return;
            }
            want.insert(n.to_string());
            if let Some(view) = v.map.get(n) {
                for f in &view.fields {
                    match &f.t {
                        FT::Ref(t) | FT::Embed(t) => visit(v, t, want),
                        _ => {}
                    }
                }
            }
        }
        for n in names {
            visit(self, n, &mut want);
        }
        let hex = |n: N| {
            let h = js_hex(n);
            format!("0x{}", if u16len(&h) < 2 { format!("0{h}") } else { h })
        };
        let mut out = Vec::new();
        for (n, o) in &self.opaque {
            if want.contains(n) {
                out.push(format!("interface {n} {{}} // {}", o.doc));
            }
        }
        for v in self.map.values() {
            if !want.contains(&v.name) {
                continue;
            }
            let sized = match v.size {
                Some(s) if s != 0.0 && !s.is_nan() => format!(" extends sized<{}>", hex(s)),
                _ => String::new(),
            };
            out.push(format!("interface {}{} {{ // {}", v.name, sized, v.doc));
            let w = v
                .fields
                .iter()
                .map(|f| u16len(&f.name) as f64)
                .fold(f64::NEG_INFINITY, f64::max);
            for f in &v.fields {
                let t = match &f.t {
                    FT::Scalar(n) => match n {
                        1 => "u8".to_string(),
                        2 => "u16".into(),
                        4 => "u32".into(),
                        _ => "u64".into(),
                    },
                    FT::Ref(t) => format!("ref<{t}>"),
                    FT::Embed(t) => t.clone(),
                };
                let mut doc: Vec<String> = Vec::new();
                if let Some(c) = f.count {
                    doc.push(format!("[{}]", js_num(c)));
                }
                if let Some(d) = &f.doc {
                    if !d.is_empty() {
                        doc.push(d.clone());
                    }
                }
                let doc = doc.join(" ");
                out.push(format!(
                    "\t{} at<{}, {}>{}",
                    pad_end(&format!("{}:", f.name), w + 1.0),
                    hex(f.off),
                    t,
                    if doc.is_empty() {
                        String::new()
                    } else {
                        format!(" // {doc}")
                    }
                ));
            }
            out.push("}".into());
        }
        out
    }
}

pub const VIEW_NOTATION: [&str; 3] = [
    "type at<Offset extends number, T> = T // view field: a T at byte offset Offset of the object (x.f: scalar = its load, ref<U> = the loaded pointer, other = its address)",
    "type ref<T> = T                        // view field holding a pointer (8 bytes) to a T (x.f = p stores the pointer)",
    "interface sized<Size extends number> {} // a view of that many bytes: x[k] is the k-th such object from x (at x + k * Size)",
];

/// exprType: the view type of an expression, given the variables' types.
pub fn expr_type(
    v: &Views,
    ir: &Ir,
    e: E,
    var_type: &dyn Fn(u32) -> Option<String>,
) -> Option<String> {
    let field = |addr: E| -> Option<Resolved> {
        let (b, off) = match ir.get(addr) {
            Node::Bin(BinOp::Add, a, c) => match ir.get(c) {
                Node::Const(c) => (a, n_s(c)),
                _ => (addr, 0.0),
            },
            _ => (addr, 0.0),
        };
        if !(0.0..=65536.0).contains(&off) {
            return None;
        }
        let t = expr_type(v, ir, b, var_type)?;
        let size = v.map.get(&t).and_then(|x| x.size);
        let rel = match size {
            Some(s) if s != 0.0 && off >= s => off % s,
            _ => off,
        };
        v.resolve(&t, rel)
    };
    match ir.get(e) {
        Node::Var(id) => var_type(id),
        Node::Load { size: 8, addr } => {
            let r = field(addr)?;
            match r.last {
                FT::Ref(to) if r.rest == 0.0 => Some(to),
                _ => None,
            }
        }
        Node::Bin(BinOp::Add, _, b) if matches!(ir.get(b), Node::Const(_)) => {
            let r = field(e)?;
            match r.last {
                FT::Embed(t) if r.rest == 0.0 => Some(t),
                _ => None,
            }
        }
        _ => None,
    }
}
