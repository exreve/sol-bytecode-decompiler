//! Function naming of `decompile` (the part the raw output uses): instruction handler names from the
//! "Instruction: X" logs (`Semantics.scanInstructionLogs` / `classifyInstructionLogs`), `nameThunks`,
//! helper-name suffixes and symbol sanitizing. Runs on the register-level blocks (after
//! inferSignatures, before variable recovery).

use sbpf_ir::fx::IndexMap;
use sbpf_ir::{CallTarget, Node, Stmt, Term};
use sbpf_program::Program;
use sbpf_ir::fx::{HashMap, HashSet};

/// What the raw output uses of `Semantics` (instruction-log classification).
#[derive(Clone, Debug, Default)]
pub struct Sem {
    /// the program contains "AnchorError occurred" (non-executable memory)
    pub anchor: bool,
    /// handler function pc -> instruction name (logs exactly one "Instruction: X")
    pub ix_names: IndexMap<i64, String>,
    /// functions logging several instruction names
    pub processors: IndexMap<i64, Vec<String>>,
}

/// snake: `aB` -> `a_B`, `ABc` -> `A_Bc`, whitespace runs -> `_`, lower case.
pub fn snake(s: &str) -> String {
    let b: Vec<char> = s.chars().collect();
    // /([a-z0-9])([A-Z])/g
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
    // /([A-Z]+)([A-Z][a-z])/g
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
    // /\s+/g -> '_'
    let mut out = String::with_capacity(s2.len());
    let mut i = 0;
    while i < s2.len() {
        if s2[i].is_whitespace() {
            while i < s2.len() && s2[i].is_whitespace() {
                i += 1;
            }
            out.push('_');
        } else {
            out.extend(s2[i].to_lowercase());
            i += 1;
        }
    }
    out
}

/// `/^Instruction: ([A-Za-z0-9_]+(?: [A-Za-z0-9_]+)*)$/` on the latin1 text of `b`: the name.
fn ix_log_name(b: &[u8]) -> Option<String> {
    let rest = b.strip_prefix(b"Instruction: ")?;
    let w = |c: &u8| c.is_ascii_alphanumeric() || *c == b'_';
    if rest.is_empty() || !rest.iter().all(|c| w(c) || *c == b' ') {
        return None;
    }
    if rest.split(|&c| c == b' ').any(|x| x.is_empty()) {
        return None;
    }
    Some(rest.iter().map(|&c| c as char).collect())
}

struct LogSite {
    fpc: i64,
    block: usize,
    stmt: usize,
    name: String,
}

/// `new Semantics(p)`'s anchor flag and instruction-log classification.
pub fn semantics(p: &Program) -> Sem {
    let mut sem = Sem::default();
    let img = p.image();
    for r in &p.elf.regions {
        if !r.exec
            && p.elf
                .region_bytes(r)
                .windows(20)
                .any(|w| w == b"AnchorError occurred")
        {
            sem.anchor = true;
        }
    }
    // scanInstructionLogs
    let mut ix_logs: IndexMap<i64, Vec<String>> = IndexMap::default();
    let mut sites: Vec<LogSite> = Vec::new();
    for f in p.funcs.values() {
        let ir = f.ir(p);
        for b in &f.blocks {
            for (si, s) in b.stmts.iter().enumerate() {
                let Stmt::Call {
                    t: CallTarget::Sys { name, .. },
                    ..
                } = s
                else {
                    continue;
                };
                if &**name != "sol_log_" {
                    continue;
                }
                let (mut ptr, mut len) = (None, None);
                for x in &b.stmts[..si] {
                    if let Stmt::Set { dst, e, .. } = x {
                        if let Node::Const(v) = ir.get(*e) {
                            if *dst == 1 {
                                ptr = Some(v);
                            }
                            if *dst == 2 {
                                len = Some(v);
                            }
                        }
                    }
                }
                let (Some(ptr), Some(len)) = (ptr, len) else {
                    continue;
                };
                if len > 200 {
                    continue;
                }
                let Some(name) = img.bytes_at(ptr, len as usize).and_then(ix_log_name) else {
                    continue;
                };
                let sn = snake(&name);
                let l = ix_logs.entry(f.pc).or_default();
                if !l.contains(&sn) {
                    l.push(sn.clone());
                }
                sites.push(LogSite {
                    fpc: f.pc,
                    block: b.id,
                    stmt: si,
                    name: sn,
                });
            }
        }
    }
    // classifyInstructionLogs
    for (&pc, names) in &ix_logs {
        if names.len() == 1 {
            sem.ix_names.insert(pc, names[0].clone());
        } else {
            sem.processors.insert(pc, names.clone());
        }
    }
    let mut callers: HashMap<i64, HashSet<i64>> = HashMap::default();
    for f in p.funcs.values() {
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Call {
                    t: CallTarget::Fn { pc },
                    ..
                } = s
                {
                    callers.entry(*pc).or_default().insert(f.pc);
                }
            }
        }
    }
    let mut found: IndexMap<i64, String> = IndexMap::default();
    let mut dup: HashSet<i64> = HashSet::default();
    for site in &sites {
        if !sem.processors.contains_key(&site.fpc) {
            continue;
        }
        let f = &p.funcs[&site.fpc];
        let mut b = f.blocks.get(site.block);
        let mut i = site.stmt + 1;
        let mut hops = 0;
        while hops < 6 {
            let Some(bb) = b else { break };
            let mut hit = None;
            while i < bb.stmts.len() {
                if let Stmt::Call {
                    t: CallTarget::Fn { pc },
                    ..
                } = &bb.stmts[i]
                {
                    if let Some(g) = p.funcs.get(pc) {
                        let size: i64 = g.blocks.iter().map(|gb| gb.end - gb.start + 1).sum();
                        if !g.noreturn
                            && size >= 40
                            && callers.get(&g.pc).is_some_and(|c| c.len() == 1)
                        {
                            hit = Some(g.pc);
                            break;
                        }
                    }
                }
                i += 1;
            }
            if let Some(h) = hit {
                if found.get(&h).is_some_and(|n| *n != site.name) {
                    dup.insert(h);
                }
                found.insert(h, site.name.clone());
                break;
            }
            let Term::Jmp { to } = bb.term else { break };
            b = f.blocks.get(to as usize);
            i = 0;
            hops += 1;
        }
    }
    let mut taken: HashSet<String> = sem.ix_names.values().cloned().collect();
    for (pc, name) in found {
        if !dup.contains(&pc) && !taken.contains(&name) && !sem.ix_names.contains_key(&pc) {
            sem.ix_names.insert(pc, name.clone());
            taken.insert(name);
        }
    }
    sem
}

const WRAP: &[(&str, &str)] = &[
    ("sol_memcpy_", "memcpy"),
    ("sol_memmove_", "memmove"),
    ("sol_memset_", "memset"),
    ("sol_memcmp_", "memcmp"),
    ("abort", "abort_"),
    ("sol_panic_", "panic_"),
    ("sol_log_", "log"),
    ("sol_invoke_signed_rust", "invoke_signed"),
    ("sol_invoke_signed_c", "invoke_signed_c"),
    ("sol_try_find_program_address", "find_program_address"),
    ("sol_create_program_address", "create_program_address"),
    ("sol_sha256", "sha256"),
    ("sol_keccak256", "keccak256"),
    ("sol_log_data", "log_data"),
    ("sol_set_return_data", "set_return_data"),
    ("sol_get_return_data", "get_return_data"),
    ("sol_get_clock_sysvar", "clock_get"),
    ("sol_get_rent_sysvar", "rent_get"),
];

/// The output language's own helpers (names a program function must not take).
pub const HELPERS: &[&str] = &[
    "copy",
    "copyr",
    "sar",
    "shl",
    "sdiv",
    "srem",
    "sdiv32",
    "srem32",
    "mulhu",
    "mulhs",
    "trap",
    "callx",
    "undef",
    "fp",
    "memeq",
    "keyeq",
    "rc_inc",
    "rc_dec",
    "rc_release",
    "popcount",
    "clz",
    "ctz",
    "rotl",
    "min",
    "max",
    "smin",
    "smax",
    "sat_sub",
];

const JS_KEYWORDS: &[&str] = &[
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "enum",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "null",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "implements",
    "interface",
    "let",
    "package",
    "private",
    "protected",
    "public",
    "static",
    "yield",
    "await",
];

fn is_fn_hex(n: &str) -> bool {
    n.strip_prefix("fn_").is_some_and(|h| {
        !h.is_empty()
            && h.bytes()
                .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
    })
}

/// `/^(ld|st)(8|16|32|64)$|^bswap(16|32|64)$/`
fn is_mem_helper(n: &str) -> bool {
    let w = |r: &str, set: &[&str]| set.contains(&r);
    n.strip_prefix("ld")
        .or_else(|| n.strip_prefix("st"))
        .is_some_and(|r| w(r, &["8", "16", "32", "64"]))
        || n.strip_prefix("bswap")
            .is_some_and(|r| w(r, &["16", "32", "64"]))
}

/// `/^[A-Za-z_$][\w$]*$/`
fn is_ident(n: &str) -> bool {
    let b = n.as_bytes();
    !b.is_empty()
        && (b[0].is_ascii_alphabetic() || b[0] == b'_' || b[0] == b'$')
        && b.iter()
            .all(|&c| c.is_ascii_alphanumeric() || c == b'_' || c == b'$')
}

/// Symbol name sanitizing: `::` -> `__`, runs of non-`[\w$]` -> `_`, a leading digit (or nothing) gets `_`.
fn sanitize(n: &str) -> String {
    let n = n.replace("::", "__");
    let mut out = String::with_capacity(n.len());
    let mut in_run = false;
    for ch in n.chars() {
        if ch.is_ascii_alphanumeric() || ch == '_' || ch == '$' {
            out.push(ch);
            in_run = false;
        } else if !in_run {
            out.push('_');
            in_run = true;
        }
    }
    if out.is_empty() || out.as_bytes()[0].is_ascii_digit() {
        out.insert(0, '_');
    }
    out
}

/// decompile's function naming (raw output: no library classification): handler names, thunk
/// names, helper suffixes, sanitized symbols. Returns the original symbol names of the renamed
/// ones (symNotes).
pub fn name_functions(p: &mut Program, sem: &Sem) -> IndexMap<i64, String> {
    name_functions_lib(p, sem, &|_| false)
}

/// name_functions with library classification: handler names are not given to library functions.
pub fn name_functions_lib(
    p: &mut Program,
    sem: &Sem,
    is_lib: &dyn Fn(i64) -> bool,
) -> IndexMap<i64, String> {
    for (pc, ix) in &sem.ix_names {
        if is_lib(*pc) {
            continue;
        }
        if let Some(f) = p.funcs.get_mut(pc) {
            f.name = format!("ix_{ix}");
        }
    }
    // nameThunks
    let mut taken: HashSet<String> = p.funcs.values().map(|f| f.name.clone()).collect();
    for f in p.funcs.values_mut() {
        if !is_fn_hex(&f.name) || f.blocks.len() > 2 {
            continue;
        }
        let n: i64 = f.blocks.iter().map(|b| b.end - b.start + 1).sum();
        if n > 8 {
            continue;
        }
        let calls: Vec<&Stmt> = f
            .blocks
            .iter()
            .flat_map(|b| b.stmts.iter().filter(|s| matches!(s, Stmt::Call { .. })))
            .collect();
        if calls.len() != 1 {
            continue;
        }
        let Stmt::Call {
            t: CallTarget::Sys { name, .. },
            ..
        } = calls[0]
        else {
            continue;
        };
        let Some(&(_, base)) = WRAP.iter().find(|x| x.0 == &**name) else {
            continue;
        };
        let mut nm = base.to_string();
        let mut k = 2;
        while taken.contains(&nm) {
            nm = format!("{base}{k}");
            k += 1;
        }
        taken.insert(nm.clone());
        f.name = nm;
    }
    for f in p.funcs.values_mut() {
        if HELPERS.contains(&f.name.as_str()) || is_mem_helper(&f.name) {
            f.name.push('_');
        }
    }
    let mut notes = IndexMap::default();
    let mut taken: HashSet<String> = p.funcs.values().map(|f| f.name.clone()).collect();
    let text_addr = p.elf.text().addr;
    for f in p.funcs.values_mut() {
        if is_ident(&f.name) && !JS_KEYWORDS.contains(&f.name.as_str()) {
            continue;
        }
        let mut nm = sanitize(&f.name);
        if JS_KEYWORDS.contains(&nm.as_str()) {
            nm.push('_');
        }
        if taken.contains(&nm) {
            nm = format!("{nm}_{:x}", (text_addr + (f.pc * 8) as f64) as u128);
        }
        notes.insert(f.pc, f.name.clone());
        taken.insert(nm.clone());
        f.name = nm;
    }
    notes
}

/// sha8: the first 8 bytes of SHA-256(s), little-endian (Anchor discriminators).
pub fn sha8(s: &str) -> u64 {
    let h = sha256(s.as_bytes());
    u64::from_le_bytes(h[..8].try_into().unwrap())
}

pub fn sha256(data: &[u8]) -> [u8; 32] {
    const K: [u32; 64] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
        0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
        0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
        0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
        0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
        0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
        0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
        0xc67178f2,
    ];
    let mut h: [u32; 8] = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
        0x5be0cd19,
    ];
    let mut msg = data.to_vec();
    msg.push(0x80);
    while msg.len() % 64 != 56 {
        msg.push(0);
    }
    msg.extend_from_slice(&((data.len() as u64) * 8).to_be_bytes());
    for chunk in msg.chunks(64) {
        let mut w = [0u32; 64];
        for i in 0..16 {
            w[i] = u32::from_be_bytes(chunk[i * 4..i * 4 + 4].try_into().unwrap());
        }
        for i in 16..64 {
            let s0 = w[i - 15].rotate_right(7) ^ w[i - 15].rotate_right(18) ^ (w[i - 15] >> 3);
            let s1 = w[i - 2].rotate_right(17) ^ w[i - 2].rotate_right(19) ^ (w[i - 2] >> 10);
            w[i] = w[i - 16]
                .wrapping_add(s0)
                .wrapping_add(w[i - 7])
                .wrapping_add(s1);
        }
        let mut v = h;
        for i in 0..64 {
            let s1 = v[4].rotate_right(6) ^ v[4].rotate_right(11) ^ v[4].rotate_right(25);
            let ch = (v[4] & v[5]) ^ (!v[4] & v[6]);
            let t1 = v[7]
                .wrapping_add(s1)
                .wrapping_add(ch)
                .wrapping_add(K[i])
                .wrapping_add(w[i]);
            let s0 = v[0].rotate_right(2) ^ v[0].rotate_right(13) ^ v[0].rotate_right(22);
            let maj = (v[0] & v[1]) ^ (v[0] & v[2]) ^ (v[1] & v[2]);
            let t2 = s0.wrapping_add(maj);
            v = [
                t1.wrapping_add(t2),
                v[0],
                v[1],
                v[2],
                v[3].wrapping_add(t1),
                v[4],
                v[5],
                v[6],
            ];
        }
        for i in 0..8 {
            h[i] = h[i].wrapping_add(v[i]);
        }
    }
    let mut out = [0u8; 32];
    for i in 0..8 {
        out[i * 4..i * 4 + 4].copy_from_slice(&h[i].to_be_bytes());
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn sha() {
        let h = sha256(b"abc");
        assert_eq!(h[0], 0xba);
        assert_eq!(h[31], 0xad);
    }
    #[test]
    fn snakes() {
        assert_eq!(snake("InitializeMint"), "initialize_mint");
        assert_eq!(snake("ABCdef"), "ab_cdef");
        assert_eq!(snake("Transfer Checked"), "transfer_checked");
    }
}
