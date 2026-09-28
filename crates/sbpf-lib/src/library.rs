//! `src/library.ts` (+ `crateOf` of `src/demangle.ts`): library code recognition against
//! `data/libsigs.json` / `data/libnames.json`, the crate-aware policy and behavioral names.

use crate::fingerprint::{fingerprint, FnPrint};
use sbpf_ir::fx::{IndexMap, IndexSet};
use regex::Regex;
use sbpf_ir::{CallTarget, Node, Stmt};
use sbpf_program::{Func, Program};
use sbpf_ir::fx::HashMap;
use std::sync::OnceLock;

pub const MIN_LIB_INSNS: usize = 6;

/// `(p.elf.text.addr + pc * 8).toString(16)` (a JS number)
pub fn addr_hex(text_addr: f64, pc: i64) -> String {
    format!("{:x}", (text_addr + (pc * 8) as f64) as u128)
}

static LIBSIGS: &str = include_str!("../../../data/libsigs.json");
static LIBNAMES: &str = include_str!("../../../data/libnames.json");

/// hash -> families (`sigs[hash][0]`)
fn lib_db() -> &'static HashMap<String, f64> {
    static DB: OnceLock<HashMap<String, f64>> = OnceLock::new();
    DB.get_or_init(|| {
        let v: serde_json::Value = serde_json::from_str(LIBSIGS).expect("libsigs.json");
        let mut m = HashMap::default();
        if let Some(o) = v.get("sigs").and_then(|x| x.as_object()) {
            for (k, x) in o {
                m.insert(k.clone(), x.get(0).and_then(|y| y.as_f64()).unwrap_or(0.0));
            }
        }
        m
    })
}

fn lib_names() -> &'static HashMap<String, String> {
    static DB: OnceLock<HashMap<String, String>> = OnceLock::new();
    DB.get_or_init(|| {
        let v: serde_json::Value = serde_json::from_str(LIBNAMES).expect("libnames.json");
        let mut m = HashMap::default();
        if let Some(o) = v.as_object() {
            for (k, x) in o {
                if let Some(s) = x.as_str() {
                    m.insert(k.clone(), s.to_string());
                }
            }
        }
        m
    })
}

#[derive(Clone, Debug, Default)]
pub struct LibInfo {
    pub lib: bool,
    pub families: f64,
    pub name: Option<String>,
    pub hint: Option<String>,
}

fn string_name(s: &str) -> Option<&'static str> {
    let st = |p: &str| s.starts_with(p);
    if st("called `Option::unwrap()` on a `None`") {
        return Some("panic_unwrap_none");
    }
    if st("called `Result::unwrap()` on an `Err`") {
        return Some("panic_unwrap_err");
    }
    if st("capacity overflow") {
        return Some("panic_capacity_overflow");
    }
    if ["add", "subtract", "multiply", "divide", "negate", "shift"]
        .iter()
        .any(|w| st(&format!("attempt to {w}")))
    {
        return Some("panic_arith_overflow");
    }
    if st("already borrowed") || st("already mutably borrowed") {
        return Some("panic_already_borrowed");
    }
    if s.contains("index out of bounds") {
        return Some("panic_bounds_check");
    }
    if st("memory allocation of") || st("Error: memory allocation failed") {
        return Some("alloc_error");
    }
    if st("a formatting trait implementation returned an error") {
        return Some("fmt_format");
    }
    if st("Unable to find a viable program address bump seed") {
        return Some("find_program_address");
    }
    if st("AnchorError occurred") {
        return Some("anchor_error_log");
    }
    if st("ProgramError occurred") {
        return Some("program_error_log");
    }
    None
}

/// Name library functions by observable behavior (syscalls used, strings referenced, heap use).
pub fn behavior_name(p: &Program, f: &Func, strings: &[String]) -> Option<String> {
    // (for each string, the first of the patterns that matches, in STRING_NAMES order)
    for s in strings {
        if let Some(n) = string_name(s) {
            return Some(n.into());
        }
    }
    let ir = f.ir.as_ref().unwrap_or(&p.ir);
    let mut sys: IndexSet<String> = IndexSet::default();
    let mut calls = 0;
    let mut heap = false;
    let mut es = Vec::new();
    for b in &f.blocks {
        for s in &b.stmts {
            if let Stmt::Call { t, .. } = s {
                calls += 1;
                if let CallTarget::Sys { name, .. } = t {
                    sys.insert(name.to_string());
                }
            }
            sbpf_opt::stmt_exprs(ir, s, &mut es);
            for &e in &es {
                ir.walk(e, &mut |_, n| {
                    if n == Node::Const(0x3_0000_0000) {
                        heap = true;
                    }
                });
            }
        }
    }
    let only = |n: &str| sys.len() == 1 && sys.contains(n);
    let has = |n: &str| sys.contains(n);
    let r = if only("sol_memcpy_") {
        "memcpy"
    } else if only("sol_memmove_") {
        "memmove"
    } else if only("sol_memset_") {
        "memset"
    } else if only("sol_memcmp_") {
        "memcmp"
    } else if has("sol_invoke_signed_rust") || has("sol_invoke_signed_c") {
        "invoke_signed"
    } else if has("sol_try_find_program_address") {
        "find_program_address"
    } else if has("sol_create_program_address") {
        "create_program_address"
    } else if has("sol_get_rent_sysvar") {
        "rent_get"
    } else if has("sol_get_clock_sysvar") {
        "clock_get"
    } else if has("sol_log_data") {
        "log_data"
    } else if has("sol_set_return_data") {
        "set_return_data"
    } else if has("sol_sha256") {
        "sha256"
    } else if heap && calls == 0 {
        "heap_alloc"
    } else if f.noreturn && (has("abort") || has("sol_panic_")) {
        "panic"
    } else if f.noreturn {
        "panic_fmt"
    } else if has("sol_log_") {
        "log"
    } else {
        return None;
    };
    Some(r.into())
}

fn generic_re() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| Regex::new(r"^(?:core|alloc|std|compiler_builtins|solana_[a-z0-9_]+|borsh[a-z0-9_]*|anchor_lang|anchor_spl|bs58|bytemuck[a-z_]*|hashbrown|num_[a-z_]+|thiserror|arrayref|bincode|serde[a-z_]*|curve25519_dalek|ark_[a-z_]+|sha2|sha3|blake3|keccak|base64|memchr|itoa|ryu|getrandom|rand[a-z_]*|spl_discriminator|spl_pod|spl_type_length_value|spl_program_error|spl_tlv_account_resolution|pinocchio[a-z_]*|light_[a-z_]+|hex|byteorder|static_assertions|five8[a-z_]*|uint|primitive_types|fixed|rust_decimal)$").unwrap())
}

fn owned_re() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r"::processor::|process_instruction|::instruction::[A-Z][A-Za-z0-9_]*::unpack")
            .unwrap()
    })
}

/// Crate a (demangled) function belongs to: for `<T as Trait>::f` the crate defining T.
pub fn crate_of(name: &str) -> String {
    static A: OnceLock<Regex> = OnceLock::new();
    static B: OnceLock<Regex> = OnceLock::new();
    let a = A.get_or_init(|| Regex::new(r"^<(?:&(?:mut )?)?([A-Za-z_][A-Za-z0-9_]*)").unwrap());
    if let Some(m) = a.captures(name) {
        return m[1].to_string();
    }
    let b = B.get_or_init(|| Regex::new(r"^([A-Za-z_][A-Za-z0-9_]*)").unwrap());
    b.captures(name)
        .map_or("?".to_string(), |m| m[1].to_string())
}

/// Turn a Rust path into a short identifier: `<a::B as c::D>::f` -> `B_f`, `a::b::c` -> `b_c`.
pub fn ident_from_path(name: &str) -> String {
    static IMPL: OnceLock<Regex> = OnceLock::new();
    static GEN: OnceLock<Regex> = OnceLock::new();
    let im = IMPL.get_or_init(|| {
        Regex::new(r"^<(?:&(?:mut )?)?(?:[A-Za-z0-9_]+::)*([A-Za-z0-9_]+)(?:<[^>]*>)?(?: as [^>]*)?>::([A-Za-z0-9_]+)").unwrap()
    });
    if let Some(m) = im.captures(name) {
        return format!("{}_{}", &m[1], &m[2]);
    }
    let g = GEN.get_or_init(|| Regex::new(r"<[^<>]*>").unwrap());
    let n = g.replace_all(name, "");
    let n = g.replace_all(&n, "");
    let segs: Vec<&str> = n.split("::").filter(|s| !s.is_empty()).collect();
    let tail = &segs[segs.len().saturating_sub(2)..];
    tail.join("_")
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' {
                c
            } else {
                '_'
            }
        })
        .flat_map(|c| {
            // (JS replaces per UTF-16 code unit: an astral character becomes two underscores)
            let n = if c == '_' { 1 } else { c.len_utf16() };
            std::iter::repeat(c).take(n)
        })
        .collect()
}

/// UTF-16 length of a string
fn u16len(s: &str) -> usize {
    s.encode_utf16().count()
}

/// `s.slice(0, n)` on UTF-16 code units (a split surrogate pair is kept as U+FFFD: never in the data)
fn u16slice(s: &str, n: usize) -> String {
    let u: Vec<u16> = s.encode_utf16().take(n).collect();
    String::from_utf16_lossy(&u)
}

pub fn lookup<'a>(m: &'a HashMap<String, impl Sized>, fp: &FnPrint) -> Option<&'a str> {
    if let Some((k, _)) = m.get_key_value(&fp.hash) {
        return Some(k.as_str());
    }
    fp.alt
        .as_ref()
        .and_then(|a| m.get_key_value(a))
        .map(|(k, _)| k.as_str())
}

/// classify(p): library information per function (p.funcs order).
pub fn classify(p: &Program) -> Result<IndexMap<i64, LibInfo>, String> {
    classify_par(p, 1)
}

/// `classify` with the functions' fingerprints made on `threads` worker threads.
pub fn classify_par(p: &Program, threads: usize) -> Result<IndexMap<i64, LibInfo>, String> {
    crate::fingerprint::check_pcs(p)?;
    let d = lib_db();
    let nm = lib_names();
    let img = p.image();
    let mut out: IndexMap<i64, LibInfo> = IndexMap::default();
    let mut used: HashMap<String, u32> = HashMap::default();
    let prints: Vec<FnPrint> = {
        /// The program read by the fingerprints (instructions, image, the functions' blocks): no arena
        /// is written, so sharing it between the threads is sound.
        struct Shared<'a>(&'a Program, &'a sbpf_elf::Image<'a>);
        unsafe impl Sync for Shared<'_> {}
        impl Shared<'_> {
            fn print(&self, fi: usize) -> FnPrint {
                fingerprint(self.0, self.1, &self.0.funcs[fi])
            }
        }
        let sh = Shared(p, &img);
        sbpf_ir::par_map_n(p.funcs.len(), threads, |fi| sh.print(fi))
    };
    let name_of = |fp: &FnPrint| -> Option<&'static String> {
        nm.get(&fp.hash)
            .or_else(|| fp.alt.as_ref().and_then(|a| nm.get(a)))
    };
    let mut owned: IndexSet<String> = IndexSet::default();
    for fp in &prints {
        if let Some(n) = name_of(fp) {
            if owned_re().is_match(n) && !generic_re().is_match(&crate_of(n)) {
                owned.insert(crate_of(n));
            }
        }
    }
    for (f, fp) in p.funcs.values().zip(&prints) {
        let big = fp.insns >= MIN_LIB_INSNS;
        let hit = if big {
            d.get(&fp.hash)
                .or_else(|| fp.alt.as_ref().and_then(|a| d.get(a)))
        } else {
            None
        };
        let rust = if big { name_of(fp) } else { None };
        let mut lib = (hit.is_some() || rust.is_some()) && !f.is_entry;
        if lib {
            if let Some(r) = rust {
                if owned.contains(&crate_of(r)) {
                    lib = false;
                }
            }
        }
        let mut info = LibInfo {
            lib,
            families: hit.copied().unwrap_or(0.0),
            name: None,
            hint: None,
        };
        if info.lib {
            let n = match rust {
                Some(r) => Some(ident_from_path(r)),
                None => behavior_name(p, f, &fp.strings),
            };
            if let Some(r) = rust {
                info.hint = Some(if u16len(r) > 90 {
                    u16slice(r, 90) + "…"
                } else {
                    r.clone()
                });
            }
            if let Some(n) = n {
                *used.entry(n.clone()).or_default() += 1;
                info.name = Some(n);
            }
            let strs: Vec<String> = fp
                .strings
                .iter()
                .filter(|s| s.len() >= 6)
                .take(2)
                .map(|s| {
                    let t = if s.len() > 40 {
                        format!("{}…", &s[..40])
                    } else {
                        s.clone()
                    };
                    serde_json::to_string(&t).unwrap()
                })
                .collect();
            if info.hint.is_none() && !strs.is_empty() {
                info.hint = Some(strs.join(", "));
            }
        }
        out.insert(f.pc, info);
    }
    let text_addr = p.elf.text().addr;
    for (pc, info) in out.iter_mut() {
        if let Some(n) = &info.name {
            if used[n] > 1 {
                info.name = Some(format!("{}_{}", n, addr_hex(text_addr, *pc)));
            }
        }
    }
    Ok(out)
}
