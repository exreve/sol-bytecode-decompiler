//! Generates the bench/gen programs from instruction templates (anchor.rs, native.rs, risk.rs): per program a crate
//! (clean base, one cargo feature v_<id> per single-property variant), an Anchor IDL (bench/idl) and the expectation
//! file (bench/expected, "generated": true: scored for rules only by `sbpf-bench`). Deterministic; rerun after editing
//! a template, then build with `WS=bench/gen/programs sh bench/build.sh g_` (and programs29 for Anchor 0.29).

pub mod anchor;
pub mod native;
pub mod risk;

/// the name the generated files cite
const GEN: &str = "sbpf-bench-gen";

use indexmap::{IndexMap, IndexSet};
use regex::Regex;
use serde_json::{json, Map, Value};
use std::path::Path;

pub struct Variant {
    pub id: &'static str,
    pub rules: &'static [&'static str],
    /// IDL accounts of the instruction in this variant (`name:ws …`)
    pub idl: Option<&'static str>,
    /// kept as a build, not scored (reason)
    pub not_exploitable: Option<&'static str>,
}

/// informational: an authority-only instruction moving user funds
pub struct FundMover {
    pub authority: &'static str,
    pub from: &'static str,
    pub index: Option<u32>,
}

pub struct Unit {
    pub name: &'static str,
    /// native: dispatch byte
    pub tag: Option<u8>,
    /// Anchor account types used
    pub types: Option<&'static [&'static str]>,
    /// Anchor: IDL accounts `name:ws …`
    pub idl: &'static str,
    pub args: &'static [(&'static str, &'static str)],
    pub fund_mover: Option<FundMover>,
    pub variants: &'static [Variant],
    /// Anchor: handler inside #[program]; native: the fn
    pub code: &'static str,
    /// Anchor: the Accounts struct (without #[derive(Accounts)])
    pub accounts: Option<&'static str>,
}

#[derive(PartialEq)]
enum Kind {
    Anchor29,
    Anchor31,
    Native,
    Pinocchio,
}

impl Kind {
    fn name(&self) -> &'static str {
        match self {
            Kind::Anchor29 => "anchor29",
            Kind::Anchor31 => "anchor31",
            Kind::Native => "native",
            Kind::Pinocchio => "pinocchio",
        }
    }
    fn anchor(&self) -> bool {
        matches!(self, Kind::Anchor29 | Kind::Anchor31)
    }
}

struct Program {
    name: &'static str,
    kind: Kind,
    id: Option<&'static str>,
    about: &'static str,
    header: Option<&'static str>,
    units: &'static [Unit],
    deps: &'static [&'static str],
    errors: &'static [&'static str],
}

const PROGRAMS: &[Program] = &[
    Program { name: "g_a31_vault", kind: Kind::Anchor31, id: Some("GVau311111111111111111111111111111111111111"), about: "lamport vault + audit-rule instructions", header: None, units: anchor::VAULT_UNITS, deps: &[], errors: &[] },
    Program { name: "g_a31_pool", kind: Kind::Anchor31, id: Some("GPoo311111111111111111111111111111111111111"), about: "token staking pool (anchor-spl) + admin setters", header: None, units: anchor::POOL_UNITS, deps: &[], errors: &[] },
    Program { name: "g_a29_vault", kind: Kind::Anchor29, id: Some("GVau291111111111111111111111111111111111111"), about: "lamport vault + audit-rule instructions (Anchor 0.29)", header: None, units: anchor::VAULT_UNITS, deps: &[], errors: &[] },
    Program { name: "g_a29_pool", kind: Kind::Anchor29, id: Some("GPoo291111111111111111111111111111111111111"), about: "token staking pool (Anchor 0.29, anchor-spl)", header: None, units: anchor::POOL_UNITS, deps: &[], errors: &[] },
    Program { name: "g_n_bank", kind: Kind::Native, id: None, about: "native bank: manual signer / owner / tag / stored-key checks", header: Some(native::BANK_HEADER), units: native::BANK_UNITS, deps: &[], errors: &[] },
    Program { name: "g_n_amm", kind: Kind::Native, id: None, about: "native pool: share price, PDA-signed spl-token CPI", header: Some(native::AMM_HEADER), units: native::AMM_UNITS, deps: &["spl-token = { workspace = true }"], errors: &[] },
    Program { name: "g_a31_risk", kind: Kind::Anchor31, id: Some("GRisk31111111111111111111111111111111111111"), about: "lending reserve: incident classes (introspection, stale after CPI, Token-2022 amount, oracle, signer forwarding, rounding, admin drain)", header: Some(risk::RISK_ANCHOR_HEADER), units: risk::RISK_ANCHOR_UNITS, deps: &[], errors: &["BadIx", "BadRepay", "BadOracle", "Stale"] },
    Program { name: "g_n_risk", kind: Kind::Native, id: None, about: "native lending reserve: incident classes (introspection, stale after CPI, Token-2022 amount, oracle, signer forwarding, rounding, admin drain)", header: Some(risk::RISK_NATIVE_HEADER), units: risk::RISK_NATIVE_UNITS, deps: &[], errors: &[] },
    Program { name: "g_p_jar", kind: Kind::Pinocchio, id: None, about: "pinocchio lamport jar", header: Some(native::JAR_HEADER), units: native::JAR_UNITS, deps: &[], errors: &[] },
];

const ANCHOR_FEATURES: &[&str] = &[
    "no-entrypoint = []",
    "no-idl = []",
    "no-log-ix-name = []",
    "cpi = [\"no-entrypoint\"]",
    "idl-build = []",
    "anchor-debug = []",
    "custom-heap = []",
    "custom-panic = []",
];
const ERRORS: &[&str] = &[
    "Math",
    "Empty",
    "Paused",
    "Limit",
    "Claimed",
    "SameAccount",
    "BadConfig",
    "NoDest",
    "BadDest",
    "AlreadyInitialized",
    "NotOpen",
];

fn idl_ty(t: &str) -> &str {
    match t {
        "Pubkey" => "pubkey",
        other => other,
    }
}

fn disc(s: &str) -> Value {
    json!(sbpf_print::names::sha256(s.as_bytes())[..8].to_vec())
}

fn fields(t: &str) -> &'static [(&'static str, &'static str)] {
    anchor::TYPES
        .iter()
        .find(|(n, _)| *n == t)
        .unwrap_or_else(|| panic!("unknown account type {t}"))
        .1
}

/// (variant, instruction) of every unit
fn variants_of(p: &Program) -> Vec<(&'static Variant, &'static str)> {
    p.units
        .iter()
        .flat_map(|u| u.variants.iter().map(move |v| (v, u.name)))
        .collect()
}

fn types_of(p: &Program) -> Vec<&'static str> {
    let s: IndexSet<&str> = p
        .units
        .iter()
        .flat_map(|u| u.types.unwrap_or(&[]).iter().copied())
        .collect();
    s.into_iter().collect()
}

fn cargo_toml(p: &Program) -> String {
    let feats: IndexSet<String> = variants_of(p)
        .iter()
        .map(|(v, _)| format!("v_{} = []", v.id))
        .collect();
    let mut deps: Vec<&str> = match p.kind {
        Kind::Pinocchio => vec!["pinocchio = { workspace = true }"],
        Kind::Native => vec!["solana-program = { workspace = true }"],
        _ => vec![
            "anchor-lang = { workspace = true, features = [\"init-if-needed\"] }",
            "anchor-spl = { workspace = true }",
        ],
    };
    match p.kind {
        Kind::Native => deps.extend(p.deps),
        Kind::Anchor29 => deps.push("solana-program = { workspace = true }"),
        _ => {}
    }
    let mut f: Vec<String> = feats.into_iter().collect();
    if p.kind.anchor() {
        f.extend(ANCHOR_FEATURES.iter().map(|s| s.to_string()));
    }
    format!(
        "# generated by {GEN}
[package]
name = \"{}\"
version = \"0.1.0\"
edition = \"2021\"
rust-version = \"1.84\"

[lib]
crate-type = [\"cdylib\", \"lib\"]

[features]
default = []
{}

[dependencies]
{}
",
        p.name,
        f.join("\n"),
        deps.join("\n")
    )
}

/// each non-empty line prefixed with a tab
fn indent(s: &str) -> String {
    s.split('\n')
        .map(|l| {
            if l.is_empty() {
                String::new()
            } else {
                format!("\t{l}")
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn anchor_lib(p: &Program) -> String {
    let types = types_of(p);
    let token = p.units.iter().any(|u| {
        let s = format!("{}{}", u.code, u.accounts.unwrap_or("undefined"));
        s.contains("TokenAccount") || s.contains("token::")
    });
    let header = p.header.map(String::from).unwrap_or_else(|| {
        if token {
            "use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};\n".into()
        } else {
            String::new()
        }
    });
    let errors: Vec<String> = ERRORS
        .iter()
        .chain(p.errors)
        .map(|e| format!("\t{e},"))
        .collect();
    format!(
        "// generated by {GEN}: {}; each v_* feature removes one property (bench/expected/{}.json)
use anchor_lang::prelude::*;
{header}
declare_id!(\"{}\");

#[program]
pub mod {} {{
\tuse super::*;

{}
}}

{}

{}

#[error_code]
pub enum GenError {{
{}
}}
",
        p.about,
        p.name,
        p.id.unwrap_or("undefined"),
        p.name,
        p.units
            .iter()
            .map(|u| indent(u.code))
            .collect::<Vec<_>>()
            .join("\n\n"),
        types
            .iter()
            .map(|t| format!(
                "#[account]\npub struct {t} {{\n{}\n}}",
                fields(t)
                    .iter()
                    .map(|(n, ty)| format!("\tpub {n}: {ty},"))
                    .collect::<Vec<_>>()
                    .join("\n")
            ))
            .collect::<Vec<_>>()
            .join("\n\n"),
        p.units
            .iter()
            .map(|u| format!("#[derive(Accounts)]\n{}", u.accounts.unwrap_or("undefined")))
            .collect::<Vec<_>>()
            .join("\n\n"),
        errors.join("\n")
    )
}

fn native_lib(p: &Program) -> String {
    format!(
        "// generated by {GEN}: {}; each v_* feature removes one property (bench/expected/{}.json)
{}
pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {{
\tmatch data.first() {{
{}
\t\t_ => Err(ProgramError::InvalidInstructionData),
\t}}
}}

{}
",
        p.about,
        p.name,
        p.header.unwrap_or("undefined"),
        p.units
            .iter()
            .map(|u| format!(
                "\t\tSome({}) => {}(program_id, accounts, data),",
                u.tag.map_or("undefined".into(), |t| t.to_string()),
                u.name
            ))
            .collect::<Vec<_>>()
            .join("\n"),
        p.units
            .iter()
            .map(|u| u.code)
            .collect::<Vec<_>>()
            .join("\n\n")
    )
}

/// The IDL with the listed instructions' accounts replaced (`name:ws …`).
pub fn patch_idl(idl: &Value, patch: &Map<String, Value>) -> Value {
    let mut out = idl.clone();
    for (ix, accs) in patch {
        let ins = out
            .get_mut("instructions")
            .and_then(Value::as_array_mut)
            .expect("instructions");
        let i = ins
            .iter_mut()
            .find(|x| x.get("name").and_then(Value::as_str) == Some(ix))
            .expect("instruction");
        i["accounts"] = idl_accounts(accs.as_str().unwrap_or(""));
    }
    out
}

/// `name:ws …` → IDL account objects
pub fn idl_accounts(s: &str) -> Value {
    Value::Array(
        s.split_whitespace()
            .map(|a| {
                let (name, f) = a.split_once(':').unwrap_or((a, ""));
                let mut o = Map::new();
                o.insert("name".into(), json!(name));
                if f.contains('w') {
                    o.insert("writable".into(), json!(true));
                }
                if f.contains('s') {
                    o.insert("signer".into(), json!(true));
                }
                Value::Object(o)
            })
            .collect(),
    )
}

fn idl(p: &Program) -> Value {
    let types = types_of(p);
    let errors: Vec<Value> = ERRORS
        .iter()
        .chain(p.errors)
        .enumerate()
        .map(|(i, e)| {
            let mut c = e.chars();
            let first = c
                .next()
                .map(|c| c.to_lowercase().to_string())
                .unwrap_or_default();
            json!({ "code": 6000 + i, "name": first + c.as_str() })
        })
        .collect();
    let mut o = Map::new();
    if let Some(id) = p.id {
        o.insert("address".into(), json!(id));
    }
    o.insert(
        "metadata".into(),
        json!({ "name": p.name, "version": "0.1.0", "spec": "0.1.0" }),
    );
    o.insert(
        "instructions".into(),
        Value::Array(
            p.units
                .iter()
                .map(|u| {
                    json!({
                        "name": u.name,
                        "discriminator": disc(&format!("global:{}", u.name)),
                        "accounts": idl_accounts(u.idl),
                        "args": u.args.iter().map(|(n, t)| json!({ "name": n, "type": t })).collect::<Vec<_>>(),
                    })
                })
                .collect(),
        ),
    );
    o.insert(
        "accounts".into(),
        Value::Array(
            types
                .iter()
                .map(|t| json!({ "name": t, "discriminator": disc(&format!("account:{t}")) }))
                .collect(),
        ),
    );
    o.insert("errors".into(), Value::Array(errors));
    o.insert(
        "types".into(),
        Value::Array(
            types
                .iter()
                .map(|t| {
                    let fs: Vec<Value> = fields(t)
                        .iter()
                        .map(|(n, ty)| json!({ "name": n, "type": idl_ty(ty) }))
                        .collect();
                    json!({ "name": t, "type": { "kind": "struct", "fields": fs } })
                })
                .collect(),
        ),
    );
    Value::Object(o)
}

fn expected(p: &Program) -> Value {
    let anchor = p.kind.anchor();
    let mut o = Map::new();
    o.insert(
        "kind".into(),
        json!(if anchor { "anchor" } else { "native" }),
    );
    if anchor {
        o.insert("idl".into(), json!(format!("{}.json", p.name)));
    }
    o.insert("generated".into(), json!(true));
    o.insert("about".into(), json!(format!("generated by {GEN} ({}): {}. Scored for rules only: every finding on the base is false, each variant expects one of its rules at its instruction ('~consistency': a validation_consistency inconsistency there).", p.kind.name(), p.about)));
    let mut ixs = Map::new();
    for u in p.units {
        let mut e = Map::new();
        if let Some(t) = u.tag {
            e.insert("tag".into(), json!(t));
        }
        e.insert("accounts".into(), json!({}));
        ixs.insert(u.name.into(), Value::Object(e));
    }
    o.insert("instructions".into(), Value::Object(ixs));
    let movers: Vec<Value> = p
        .units
        .iter()
        .filter_map(|u| {
            let m = u.fund_mover.as_ref()?;
            let mut x = Map::new();
            x.insert("ix".into(), json!(u.name));
            x.insert("authority".into(), json!(m.authority));
            x.insert("from".into(), json!(m.from));
            if let Some(i) = m.index {
                x.insert("index".into(), json!(i));
            }
            Some(Value::Object(x))
        })
        .collect();
    if !movers.is_empty() {
        o.insert("fund_movers".into(), Value::Array(movers));
    }
    let vs = variants_of(p);
    let mut variants: IndexMap<String, Value> = IndexMap::new();
    let mut discarded: IndexMap<String, Value> = IndexMap::new();
    for (v, ix) in &vs {
        match v.not_exploitable {
            None => {
                let mut e = Map::new();
                e.insert("ix".into(), json!(ix));
                e.insert("rules".into(), json!(v.rules));
                if let Some(i) = v.idl {
                    e.insert("idl".into(), json!({ *ix: i }));
                }
                variants.insert(v.id.into(), Value::Object(e));
            }
            Some(r) => {
                discarded.insert(v.id.into(), json!({ "ix": ix, "reason": r }));
            }
        }
    }
    o.insert(
        "variants".into(),
        Value::Object(variants.into_iter().collect()),
    );
    if !discarded.is_empty() {
        o.insert(
            "discarded".into(),
            Value::Object(discarded.into_iter().collect()),
        );
    }
    Value::Object(o)
}

/// `JSON.stringify(x, null, '\t')`
fn pretty(x: &Value, ind: &str, out: &mut String) {
    let inner = format!("{ind}\t");
    match x {
        Value::Array(a) if !a.is_empty() => {
            out.push_str("[\n");
            for (i, v) in a.iter().enumerate() {
                out.push_str(&inner);
                pretty(v, &inner, out);
                out.push_str(if i + 1 < a.len() { ",\n" } else { "\n" });
            }
            out.push_str(ind);
            out.push(']');
        }
        Value::Object(o) if !o.is_empty() => {
            out.push_str("{\n");
            for (i, (k, v)) in o.iter().enumerate() {
                out.push_str(&inner);
                out.push_str(&serde_json::to_string(k).unwrap());
                out.push_str(": ");
                pretty(v, &inner, out);
                out.push_str(if i + 1 < o.len() { ",\n" } else { "\n" });
            }
            out.push_str(ind);
            out.push('}');
        }
        v => out.push_str(&serde_json::to_string(v).unwrap()),
    }
}

/// `JSON.stringify(x, null, '\t')` with arrays of primitives on one line
pub fn to_json(x: &Value) -> String {
    let mut s = String::new();
    pretty(x, "", &mut s);
    let flat = Regex::new(r"\[\n\t+([^\[\]{}]*?)\n\t+\]").unwrap();
    let nl = Regex::new(r"\n\t+").unwrap();
    flat.replace_all(&s, |c: &regex::Captures| {
        format!("[{}]", nl.replace_all(&c[1], " "))
    })
    .into_owned()
        + "\n"
}

fn write(p: &Path, text: &str) {
    if let Some(d) = p.parent() {
        std::fs::create_dir_all(d).unwrap_or_else(|e| panic!("{}: {e}", d.display()));
    }
    std::fs::write(p, text).unwrap_or_else(|e| panic!("{}: {e}", p.display()));
}

/// Writes every program's crate, IDL and expectations under `bench`, and the two workspaces.
pub fn run(bench: &Path) {
    for p in PROGRAMS {
        let ws = bench.join("gen").join(if p.kind == Kind::Anchor29 {
            "programs29"
        } else {
            "programs"
        });
        write(&ws.join(p.name).join("Cargo.toml"), &cargo_toml(p));
        write(
            &ws.join(p.name).join("src/lib.rs"),
            &if p.kind.anchor() {
                anchor_lib(p)
            } else {
                native_lib(p)
            },
        );
        if p.kind.anchor() {
            write(
                &bench.join("idl").join(format!("{}.json", p.name)),
                &to_json(&idl(p)),
            );
        }
        write(
            &bench.join("expected").join(format!("{}.json", p.name)),
            &to_json(&expected(p)),
        );
        println!(
            "{}: {} instructions, {} variants",
            p.name,
            p.units.len(),
            variants_of(p).len()
        );
    }
    for a29 in [false, true] {
        let members: Vec<String> = PROGRAMS
            .iter()
            .filter(|p| (p.kind == Kind::Anchor29) == a29)
            .map(|p| format!("\"{}\"", p.name))
            .collect();
        let deps = if a29 {
            "anchor-lang = \"=0.29.0\"
anchor-spl = { version = \"=0.29.0\", default-features = false, features = [\"token\"] }
solana-program = \"=1.16.27\""
        } else {
            "anchor-lang = \"=0.31.1\"
anchor-spl = { version = \"=0.31.1\", default-features = false, features = [\"token\", \"token_2022\", \"token_2022_extensions\"] }
solana-program = \"=2.2.1\"
spl-token = { version = \"=8.0.0\", features = [\"no-entrypoint\"] }
pinocchio = \"=0.8.4\""
        };
        write(
            &bench
                .join("gen")
                .join(if a29 { "programs29" } else { "programs" })
                .join("Cargo.toml"),
            &format!(
                "# generated by {GEN}
[workspace]
resolver = \"2\"
members = [{}]

[workspace.dependencies]
{deps}

[profile.release]
overflow-checks = true
lto = \"fat\"
codegen-units = 1
",
                members.join(", ")
            ),
        );
    }
}
