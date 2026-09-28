//! `src/idl.ts`: Anchor IDL parsing (legacy <= 0.29 and 0.30+ formats), Borsh layouts (fixed-offset
//! prefixes, sizes) and Borsh samples (anchorstate). The IDL JSON keeps its key order
//! (`serde_json` with `preserve_order`); values are read with JS semantics (`??`, truthiness, String()).

use crate::util::{js_num, upper_first, N};
use sbpf_ir::fx::IndexMap;
use sbpf_exec::hash::{sha256, sha8};
use serde_json::Value;
use sbpf_ir::fx::HashMap;

pub struct IdlIx {
    pub name: String,
    pub disc: u64,
    pub args: Vec<String>,
    pub accounts: Vec<String>,
    /// (snake name, type)
    pub arg_defs: Vec<(String, Value)>,
}

pub struct IdlInfo {
    pub address: Option<String>,
    pub instructions: Vec<IdlIx>,
    /// error code -> name (None: the name is undefined)
    pub errors: HashMap<u64, Option<Value>>,
    pub discs: IndexMap<u64, String>,
    pub types: IndexMap<String, Value>,
    /// (name, disc)
    pub accounts: Vec<(String, u64)>,
}

impl IdlInfo {
    /// `idl.errors.get(code)` as a string (String(name)); None when absent or undefined.
    pub fn error_name(&self, code: N) -> Option<String> {
        self.errors
            .get(&crate::util::K::of(code).0)
            .and_then(|v| v.as_ref().map(js_string))
    }
    pub fn has_error(&self, code: N) -> bool {
        self.errors.contains_key(&crate::util::K::of(code).0)
    }
    /// `address` truthy
    pub fn addr(&self) -> Option<&str> {
        self.address.as_deref().filter(|a| !a.is_empty())
    }
}

/// `o[key]` of an object (None: not an object, or no such key).
pub fn get<'a>(v: &'a Value, key: &str) -> Option<&'a Value> {
    v.as_object().and_then(|o| o.get(key))
}
/// `o?.[key] ?? undefined` (null counts as absent)
pub fn nn<'a>(v: Option<&'a Value>) -> Option<&'a Value> {
    v.filter(|x| !x.is_null())
}
pub fn truthy(v: Option<&Value>) -> bool {
    match v {
        None | Some(Value::Null) => false,
        Some(Value::Bool(b)) => *b,
        Some(Value::Number(n)) => n.as_f64().is_some_and(|x| x != 0.0 && !x.is_nan()),
        Some(Value::String(s)) => !s.is_empty(),
        _ => true,
    }
}
/// String(x) of a JSON value
pub fn js_string(v: &Value) -> String {
    match v {
        Value::Null => "null".into(),
        Value::Bool(b) => b.to_string(),
        Value::Number(n) => js_num(n.as_f64().unwrap_or(0.0)),
        Value::String(s) => s.clone(),
        Value::Array(a) => a
            .iter()
            .map(|x| match x {
                Value::Null => String::new(),
                x => js_string(x),
            })
            .collect::<Vec<_>>()
            .join(","),
        Value::Object(_) => "[object Object]".into(),
    }
}
pub fn js_string_opt(v: Option<&Value>) -> String {
    match v {
        None => "undefined".into(),
        Some(v) => js_string(v),
    }
}
/// JSON.stringify of a value (numbers as JS prints them)
pub fn js_stringify(v: &Value, o: &mut String) {
    match v {
        Value::Null => o.push_str("null"),
        Value::Bool(b) => o.push_str(if *b { "true" } else { "false" }),
        Value::Number(n) => o.push_str(&js_num(n.as_f64().unwrap_or(0.0))),
        Value::String(s) => o.push_str(&serde_json::to_string(s).unwrap()),
        Value::Array(a) => {
            o.push('[');
            for (i, x) in a.iter().enumerate() {
                if i > 0 {
                    o.push(',');
                }
                js_stringify(x, o);
            }
            o.push(']');
        }
        Value::Object(m) => {
            o.push('{');
            for (i, (k, x)) in m.iter().enumerate() {
                if i > 0 {
                    o.push(',');
                }
                o.push_str(&serde_json::to_string(k).unwrap());
                o.push(':');
                js_stringify(x, o);
            }
            o.push('}');
        }
    }
}
fn num(v: Option<&Value>) -> Option<N> {
    v.and_then(|x| x.as_f64())
}

/// snake (idl.ts): `aB` -> `a_B`, `ABc` -> `A_Bc`, lower case (no whitespace rule).
pub fn snake(s: &str) -> String {
    let b: Vec<char> = s.chars().collect();
    let mut s1: Vec<char> = Vec::with_capacity(b.len() + 4);
    let mut i = 0;
    while i < b.len() {
        if i + 1 < b.len()
            && (b[i].is_ascii_lowercase() || b[i].is_ascii_digit())
            && b[i + 1].is_ascii_uppercase()
        {
            s1.extend([b[i], '_', b[i + 1]]);
            i += 2;
        } else {
            s1.push(b[i]);
            i += 1;
        }
    }
    let mut s2: Vec<char> = Vec::with_capacity(s1.len() + 4);
    let mut i = 0;
    while i < s1.len() {
        if s1[i].is_ascii_uppercase() {
            let mut j = i;
            while j < s1.len() && s1[j].is_ascii_uppercase() {
                j += 1;
            }
            if j - i >= 2 && j < s1.len() && s1[j].is_ascii_lowercase() {
                s2.extend_from_slice(&s1[i..j - 1]);
                s2.push('_');
                s2.push(s1[j - 1]);
                s2.push(s1[j]);
                i = j + 1;
            } else {
                s2.extend_from_slice(&s1[i..j]);
                i = j;
            }
        } else {
            s2.push(s1[i]);
            i += 1;
        }
    }
    s2.into_iter().collect::<String>().to_lowercase()
}

/// pascal (idl.ts): split on runs of `_`, whitespace, `-`; each word's first letter upper-cased.
pub fn pascal(s: &str) -> String {
    s.split(|c: char| c == '_' || c == '-' || c.is_whitespace())
        .filter(|w| !w.is_empty())
        .map(upper_first)
        .collect()
}

fn le8(v: &[Value]) -> u64 {
    let mut b = [0u8; 8];
    for (i, x) in v.iter().take(8).enumerate() {
        let n = match x {
            Value::Number(n) => n.as_f64().unwrap_or(0.0),
            Value::String(s) => s.trim().parse::<f64>().unwrap_or(0.0),
            Value::Bool(t) => {
                if *t {
                    1.0
                } else {
                    0.0
                }
            }
            _ => 0.0,
        };
        b[i] = (crate::util::to_int32(n) & 0xff) as u8;
    }
    u64::from_le_bytes(b)
}

fn sha8s(s: &str) -> u64 {
    sha8(s.as_bytes())
}

fn defined_name(t: &Value) -> Option<String> {
    let d = get(t, "defined")?;
    Some(match d {
        Value::String(s) => s.clone(),
        d => js_string_opt(get(d, "name")),
    })
}

/// typeStr
pub fn type_str(t: &Value) -> String {
    match t {
        Value::String(s) => return s.clone(),
        Value::Object(_) | Value::Array(_) => {}
        _ => return "?".into(),
    }
    if truthy(get(t, "defined")) {
        return defined_name(t).unwrap();
    }
    if let Some(v) = get(t, "vec").filter(|x| truthy(Some(x))) {
        return format!("Vec<{}>", type_str(v));
    }
    if let Some(v) = get(t, "option").filter(|x| truthy(Some(x))) {
        return format!("Option<{}>", type_str(v));
    }
    if let Some(v) = get(t, "coption").filter(|x| truthy(Some(x))) {
        return format!("COption<{}>", type_str(v));
    }
    if let Some(a) = get(t, "array").filter(|x| truthy(Some(x))) {
        let e0 = idx(a, 0);
        let e1 = idx(a, 1);
        return format!(
            "[{}; {}]",
            match e0 {
                Some(x) => type_str(x),
                None => "?".into(),
            },
            js_string_opt(e1)
        );
    }
    let mut o = String::new();
    js_stringify(t, &mut o);
    o
}

fn idx(v: &Value, i: usize) -> Option<&Value> {
    match v {
        Value::Array(a) => a.get(i),
        Value::Object(o) => o.get(&i.to_string()),
        _ => None,
    }
}

fn arr(v: Option<&Value>) -> &[Value] {
    match v {
        Some(Value::Array(a)) => a,
        _ => &[],
    }
}

fn flatten_accounts(accs: Option<&Value>, prefix: &str, out: &mut Vec<String>) {
    for a in arr(nn(accs)) {
        if let Some(Value::Array(_)) = get(a, "accounts") {
            let p = format!("{prefix}{}.", js_string_opt(get(a, "name")));
            flatten_accounts(get(a, "accounts"), &p, out);
            continue;
        }
        let w = nn(get(a, "writable")).or(get(a, "isMut"));
        let s = nn(get(a, "signer")).or(get(a, "isSigner"));
        let o = nn(get(a, "optional")).or(get(a, "isOptional"));
        let mut flags: Vec<String> = Vec::new();
        if truthy(s) {
            flags.push("signer".into());
        }
        if truthy(w) {
            flags.push("mut".into());
        }
        if truthy(o) {
            flags.push("optional".into());
        }
        if truthy(get(a, "address")) {
            flags.push(format!("= {}", js_string_opt(get(a, "address"))));
        }
        if truthy(get(a, "pda")) {
            flags.push("pda".into());
        }
        out.push(format!(
            "{prefix}{}{}",
            js_string_opt(get(a, "name")),
            if flags.is_empty() {
                String::new()
            } else {
                format!(" [{}]", flags.join(", "))
            }
        ));
    }
}

/// parseIdl
pub fn parse_idl(json: &Value) -> IdlInfo {
    let address = nn(get(json, "address"))
        .or_else(|| nn(get(json, "metadata")).and_then(|m| get(m, "address")))
        .map(js_string);
    let mut info = IdlInfo {
        address,
        instructions: Vec::new(),
        errors: HashMap::default(),
        discs: IndexMap::default(),
        types: IndexMap::default(),
        accounts: Vec::new(),
    };
    for t in arr(nn(get(json, "types"))) {
        if truthy(get(t, "name")) && truthy(get(t, "type")) {
            info.types.insert(
                js_string_opt(get(t, "name")),
                get(t, "type").unwrap().clone(),
            );
        }
    }
    for a in arr(nn(get(json, "accounts"))) {
        if truthy(get(a, "name")) && truthy(get(a, "type")) {
            let n = js_string_opt(get(a, "name"));
            if !info.types.contains_key(&n) {
                info.types.insert(n, get(a, "type").unwrap().clone());
            }
        }
    }
    for ix in arr(nn(get(json, "instructions"))) {
        let name = snake(&js_string_opt(get(ix, "name")));
        let disc = match get(ix, "discriminator") {
            Some(Value::Array(d)) => le8(d),
            _ => sha8s(&format!("global:{name}")),
        };
        info.discs.insert(disc, format!("ix:{name}"));
        let args_v = arr(nn(get(ix, "args")));
        let mut accounts = Vec::new();
        flatten_accounts(get(ix, "accounts"), "", &mut accounts);
        info.instructions.push(IdlIx {
            name,
            disc,
            args: args_v
                .iter()
                .map(|a| {
                    format!(
                        "{}: {}",
                        js_string_opt(get(a, "name")),
                        match get(a, "type") {
                            Some(t) => type_str(t),
                            None => "?".into(),
                        }
                    )
                })
                .collect(),
            accounts,
            arg_defs: args_v
                .iter()
                .map(|a| {
                    (
                        snake(&js_string_opt(get(a, "name"))),
                        get(a, "type").cloned().unwrap_or(Value::Null),
                    )
                })
                .collect(),
        });
    }
    for a in arr(nn(get(json, "accounts"))) {
        let n = js_string_opt(get(a, "name"));
        let disc = match get(a, "discriminator") {
            Some(Value::Array(d)) => le8(d),
            _ => sha8s(&format!("account:{}", pascal(&n))),
        };
        info.discs.insert(disc, format!("account:{}", pascal(&n)));
        info.accounts.push((n, disc));
    }
    for e in arr(nn(get(json, "events"))) {
        let n = pascal(&js_string_opt(get(e, "name")));
        let disc = match get(e, "discriminator") {
            Some(Value::Array(d)) => le8(d),
            _ => sha8s(&format!("event:{n}")),
        };
        info.discs.insert(disc, format!("event:{n}"));
    }
    for e in arr(nn(get(json, "errors"))) {
        if let Some(c) = num(get(e, "code")) {
            info.errors
                .insert(crate::util::K::of(c).0, get(e, "name").cloned());
        }
    }
    info
}

// ---- Borsh layouts ----

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BKind {
    Scalar,
    Key,
    Bytes,
    Struct,
}

#[derive(Clone, Debug)]
pub struct BorshField {
    pub name: String,
    pub off: N,
    pub size: N,
    pub kind: BKind,
    pub ty: Option<String>,
}

pub fn scalar_size(t: &str) -> Option<N> {
    Some(match t {
        "bool" | "u8" | "i8" => 1.0,
        "u16" | "i16" => 2.0,
        "u32" | "i32" | "f32" => 4.0,
        "u64" | "i64" | "f64" => 8.0,
        "u128" | "i128" => 16.0,
        "publicKey" | "pubkey" => 32.0,
        _ => return None,
    })
}

/// A field's type: `typeof f === 'object' && 'type' in f ? f.type : f`
pub fn field_type(f: &Value) -> &Value {
    match f {
        Value::Object(o) if o.contains_key("type") => &o["type"],
        _ => f,
    }
}

fn kind_of(t: &Value, types: &IndexMap<String, Value>) -> (BKind, Option<String>) {
    if let Value::String(s) = t {
        let z = scalar_size(s);
        return if z == Some(32.0) {
            (BKind::Key, None)
        } else if z.is_some_and(|z| z <= 8.0) {
            (BKind::Scalar, None)
        } else {
            (BKind::Bytes, None)
        };
    }
    if get(t, "defined").is_some() {
        let d = defined_name(t).unwrap();
        let def = types.get(&d);
        return if def.and_then(|x| get(x, "kind")).and_then(|k| k.as_str()) == Some("struct") {
            (BKind::Struct, Some(d))
        } else {
            (BKind::Scalar, None)
        };
    }
    (BKind::Bytes, None)
}

/// borshSize: the Borsh size of a type when it does not depend on the data.
pub fn borsh_size(t: &Value, types: &IndexMap<String, Value>, depth: u32) -> Option<N> {
    if depth > 8 {
        return None;
    }
    if let Value::String(s) = t {
        return scalar_size(s);
    }
    if let Some(a) = get(t, "array").filter(|x| truthy(Some(x))) {
        let z = borsh_size(idx(a, 0).unwrap_or(&Value::Null), types, depth + 1)?;
        let n = match idx(a, 1) {
            Some(Value::Number(n)) => n.as_f64().unwrap_or(f64::NAN),
            Some(Value::String(s)) if s.trim().is_empty() => 0.0,
            Some(Value::String(s)) => s.trim().parse::<f64>().unwrap_or(f64::NAN),
            Some(Value::Null) => 0.0,
            Some(Value::Bool(b)) => {
                if *b {
                    1.0
                } else {
                    0.0
                }
            }
            _ => f64::NAN,
        };
        return Some(z * n);
    }
    get(t, "defined")?;
    let d = defined_name(t).unwrap();
    let def = types.get(&d)?;
    let kind = get(def, "kind").and_then(|k| k.as_str());
    if kind == Some("struct") {
        if let Some(Value::Array(fs)) = get(def, "fields") {
            let mut n = 0.0;
            for f in fs {
                n += borsh_size(field_type(f), types, depth + 1)?;
            }
            return Some(n);
        }
    }
    if kind == Some("enum") {
        if let Some(Value::Array(vs)) = get(def, "variants") {
            if vs.iter().all(|v| match get(v, "fields") {
                Some(Value::Array(a)) => a.is_empty(),
                Some(Value::String(s)) => s.is_empty(),
                Some(Value::Object(o)) => !truthy(o.get("length")),
                _ => true,
            }) {
                return Some(1.0);
            }
        }
    }
    None
}

/// borshPrefix: fields up to the first one whose size depends on the data.
pub fn borsh_prefix(
    fields: &[(String, Value)],
    types: &IndexMap<String, Value>,
) -> Vec<BorshField> {
    let mut out = Vec::new();
    let mut off = 0.0;
    for (name, t) in fields {
        let Some(z) = borsh_size(t, types, 0) else {
            break;
        };
        let (kind, ty) = kind_of(t, types);
        out.push(BorshField {
            name: snake(name),
            off,
            size: z,
            kind,
            ty,
        });
        off += z;
    }
    out
}

/// structFields: fields of a defined struct type (named fields only).
pub fn struct_fields(name: &str, types: &IndexMap<String, Value>) -> Option<Vec<(String, Value)>> {
    let def = types.get(name)?;
    if get(def, "kind").and_then(|k| k.as_str()) != Some("struct") {
        return None;
    }
    let Some(Value::Array(fs)) = get(def, "fields") else {
        return None;
    };
    if !fs.iter().all(|f| f.is_object() && truthy(get(f, "name"))) {
        return None;
    }
    Some(
        fs.iter()
            .map(|f| {
                (
                    js_string_opt(get(f, "name")),
                    get(f, "type").cloned().unwrap_or(Value::Null),
                )
            })
            .collect(),
    )
}

// ---- Borsh samples ----

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum LeafKind {
    Int,
    Bool,
    Key,
    Bytes,
}

#[derive(Clone, Debug)]
pub struct SampleLeaf {
    pub path: String,
    pub off: N,
    pub size: N,
    pub kind: LeafKind,
    pub ty: String,
    pub heap: bool,
}

/// borshSample: Borsh serialization of the fields with pseudo-random contents.
pub fn borsh_sample(
    fields: &[(String, Value)],
    types: &IndexMap<String, Value>,
    rnd: &mut dyn FnMut() -> u8,
) -> Option<(Vec<u8>, Vec<SampleLeaf>)> {
    struct S<'a> {
        bytes: Vec<u8>,
        leaves: Vec<SampleLeaf>,
        ok: bool,
        types: &'a IndexMap<String, Value>,
    }
    fn put(
        st: &mut S,
        rnd: &mut dyn FnMut() -> u8,
        n: N,
        path: &str,
        kind: LeafKind,
        heap: bool,
        ty: String,
    ) {
        let off = st.bytes.len() as N;
        let mut i = 0.0;
        while i < n {
            st.bytes
                .push(if kind == LeafKind::Bool { 1 } else { rnd() });
            i += 1.0;
        }
        st.leaves.push(SampleLeaf {
            path: path.to_string(),
            off,
            size: n,
            kind,
            ty,
            heap,
        });
    }
    fn u32le(st: &mut S, v: u32) {
        st.bytes.extend_from_slice(&v.to_le_bytes());
    }
    fn fname(f: &Value, i: usize) -> String {
        if f.is_object() && truthy(get(f, "name")) {
            snake(&js_string_opt(get(f, "name")))
        } else {
            i.to_string()
        }
    }
    fn val(st: &mut S, rnd: &mut dyn FnMut() -> u8, t: &Value, path: &str, heap: bool, depth: u32) {
        if !st.ok || depth > 12 || st.bytes.len() > 0x10000 {
            st.ok = false;
            return;
        }
        if let Value::String(s) = t {
            match s.as_str() {
                "bool" => return put(st, rnd, 1.0, path, LeafKind::Bool, heap, s.clone()),
                "string" => {
                    u32le(st, 3);
                    st.bytes.extend_from_slice(b"abc");
                    return;
                }
                "bytes" => {
                    u32le(st, 1);
                    return put(st, rnd, 1.0, path, LeafKind::Bytes, true, s.clone());
                }
                _ => {}
            }
            let Some(z) = scalar_size(s) else {
                st.ok = false;
                return;
            };
            let ty = if s == "publicKey" {
                "pubkey".to_string()
            } else {
                s.clone()
            };
            return put(
                st,
                rnd,
                z,
                path,
                if z == 32.0 {
                    LeafKind::Key
                } else {
                    LeafKind::Int
                },
                heap,
                ty,
            );
        }
        if let Some(a) = get(t, "array").filter(|x| truthy(Some(x))) {
            let et = idx(a, 0).cloned().unwrap_or(Value::Null);
            let n = match idx(a, 1) {
                Some(Value::Number(n)) => n.as_f64().unwrap_or(0.0),
                _ => {
                    st.ok = false;
                    return;
                }
            };
            if n > 4096.0 {
                st.ok = false;
                return;
            }
            if let Value::String(e) = &et {
                if e == "u8" || e == "i8" {
                    return put(
                        st,
                        rnd,
                        n,
                        path,
                        LeafKind::Bytes,
                        heap,
                        format!("[{e}; {}]", js_num(n)),
                    );
                }
            }
            let mut i = 0.0;
            while i < n {
                val(
                    st,
                    rnd,
                    &et,
                    &format!("{path}[{}]", js_num(i)),
                    heap,
                    depth + 1,
                );
                i += 1.0;
            }
            return;
        }
        let opt = get(t, "option");
        let copt = get(t, "coption");
        if opt.is_some() || copt.is_some() {
            if copt.is_some() {
                u32le(st, 1);
            } else {
                st.bytes.push(1);
            }
            let inner = nn(opt).or(copt).cloned().unwrap_or(Value::Null);
            return val(st, rnd, &inner, path, heap, depth + 1);
        }
        if let Some(v) = get(t, "vec") {
            u32le(st, 1);
            let v = v.clone();
            return val(st, rnd, &v, &format!("{path}[0]"), true, depth + 1);
        }
        let def = if get(t, "defined").is_some() {
            st.types.get(&defined_name(t).unwrap()).cloned()
        } else {
            None
        };
        if let Some(def) = def {
            let kind = get(&def, "kind").and_then(|k| k.as_str());
            if kind == Some("struct") {
                if let Some(Value::Array(fs)) = get(&def, "fields") {
                    for (i, f) in fs.iter().enumerate() {
                        val(
                            st,
                            rnd,
                            field_type(f),
                            &format!("{path}.{}", fname(f, i)),
                            heap,
                            depth + 1,
                        );
                    }
                    return;
                }
            }
            if kind == Some("enum") {
                if let Some(Value::Array(vs)) = get(&def, "variants") {
                    if !vs.is_empty() {
                        st.bytes.push(0);
                        let v = &vs[0];
                        for (i, f) in arr(nn(get(v, "fields"))).iter().enumerate() {
                            val(
                                st,
                                rnd,
                                field_type(f),
                                &format!("{path}.{}", fname(f, i)),
                                heap,
                                depth + 1,
                            );
                        }
                        return;
                    }
                }
            }
        }
        st.ok = false;
    }
    let mut st = S {
        bytes: Vec::new(),
        leaves: Vec::new(),
        ok: true,
        types,
    };
    for (name, t) in fields {
        val(&mut st, rnd, t, &snake(name), false, 0);
    }
    if st.ok {
        Some((st.bytes, st.leaves))
    } else {
        None
    }
}

/// sha256 digest (idl.ts sha): used for the discriminators only through sha8.
#[allow(dead_code)]
pub fn digest(s: &[u8]) -> [u8; 32] {
    sha256(s)
}
