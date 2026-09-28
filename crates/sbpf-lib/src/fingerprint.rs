//! Position-independent function fingerprints (library recognition) and the
//! per-function signatures of program diffing and `security/fingerprints.json`.

use crate::sha1::sha1_16;
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_elf::{CallReloc, Image};
use sbpf_ir::{CallTarget, Stmt};
use sbpf_program::{Func, Program};

/// alt (sBPF v2 / v3): the hash of the code in its v0 encoding, when it differs
#[derive(Clone, Debug)]
pub struct FnPrint {
    pub hash: String,
    pub insns: usize,
    pub strings: Vec<String>,
    pub alt: Option<String>,
}

/// The fingerprints read `p.insns[pc]` of every pc of every block: a block reaching past the instructions
/// (corrupt input) is a fatal error.
pub fn check_pcs(p: &Program) -> Result<(), String> {
    for f in p.funcs.values() {
        if f.blocks
            .iter()
            .any(|b| b.start <= b.end && (b.start < 0 || b.end >= p.insns.len() as i64))
        {
            return Err("Cannot read properties of undefined (reading 'opc')".into());
        }
    }
    Ok(())
}

/// Instructions of a function in address order (blocks sorted by start, stable).
fn func_pcs(f: &Func) -> Vec<i64> {
    let mut bl: Vec<(i64, i64)> = f.blocks.iter().map(|b| (b.start, b.end)).collect();
    bl.sort_by_key(|b| b.0);
    let mut pcs = Vec::new();
    for (s, e) in bl {
        let mut pc = s;
        while pc <= e {
            pcs.push(pc);
            pc += 1;
        }
    }
    pcs
}

fn v2_mem(opc: u8) -> Option<u8> {
    Some(match opc {
        0x2c => 0x71,
        0x3c => 0x69,
        0x8c => 0x61,
        0x9c => 0x79,
        0x27 => 0x72,
        0x37 => 0x6a,
        0x87 => 0x62,
        0x97 => 0x7a,
        0x2f => 0x73,
        0x3f => 0x6b,
        0x8f => 0x63,
        0x9f => 0x7b,
        _ => return None,
    })
}

pub fn fingerprint(p: &Program, img: &Image, f: &Func) -> FnPrint {
    let pcs = func_pcs(f);
    let raw = print_of(p, img, f, false, &pcs);
    if p.version < 2 {
        return raw;
    }
    let alt = print_of(p, img, f, true, &pcs).hash;
    if alt == raw.hash {
        raw
    } else {
        FnPrint {
            alt: Some(alt),
            ..raw
        }
    }
}

enum Imm {
    N(i32),
    S(String),
}

fn print_of(p: &Program, img: &Image, f: &Func, norm: bool, pcs: &[i64]) -> FnPrint {
    let mut out: Vec<u8> = Vec::with_capacity(pcs.len() * 12 + 64);
    let text_lo = p.text_vaddr as u128;
    let text_hi = text_lo + (p.insns.len() as u128) * 8;
    let mut strings: Vec<String> = Vec::new();
    let v = p.version;
    let put = |out: &mut Vec<u8>, opc: u8, regs: u8, off: i16, imm: &Imm, hi: i32| {
        out.push(opc);
        out.push(regs);
        out.extend_from_slice(&off.to_le_bytes());
        match imm {
            Imm::N(x) => {
                out.extend_from_slice(&x.to_le_bytes());
                out.extend_from_slice(&hi.to_le_bytes());
            }
            Imm::S(s) => out.extend_from_slice(s.as_bytes()),
        }
    };
    let mut const_imm = |val: u64, lo: i32, hi_imm: i32, strings: &mut Vec<String>| -> (Imm, i32) {
        if (val as u128) >= text_lo && (val as u128) < text_hi {
            return (Imm::S("T".into()), 0);
        }
        if img.region(val, 1).is_some() {
            if let Some(s) = preview_string(img, val, 48) {
                strings.push(s);
            }
            return (Imm::S("A".into()), 0);
        }
        (Imm::N(lo), hi_imm)
    };
    let mut sys_at: Option<IndexMap<i64, String>> = None;
    if norm && v >= 3 {
        let mut m = IndexMap::default();
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Call {
                    t: CallTarget::Sys { name, .. },
                    pc,
                    ..
                } = s
                {
                    m.insert(*pc, name.to_string());
                }
            }
        }
        sys_at = Some(m);
    }
    let ins = |pc: i64| p.insns.get(pc as usize);
    let mut k = 0;
    while k < pcs.len() {
        let pc = pcs[k];
        let i = &p.insns[pc as usize];
        let mut opc = i.opc;
        let mut regs = i.dst | (i.src << 4);
        let mut imm = Imm::N(i.imm);
        let mut hi = 0i32;
        if !norm {
        } else if v == 2 && v2_mem(opc).is_some() {
            opc = v2_mem(opc).unwrap();
        } else if v >= 3 && opc == 0x9d {
            opc = 0x95;
        } else if opc == 0x8d {
            imm = Imm::N(if v == 2 { i.src as i32 } else { i.dst as i32 });
            regs = 0;
        } else if v == 2
            && opc == 0xb4
            && pcs.get(k + 1) == Some(&(pc + 1))
            && ins(pc + 1).is_some_and(|n| n.opc == 0xf7 && n.dst == i.dst)
        {
            let n = ins(pc + 1).unwrap();
            let val = ((n.imm as u32 as u64) << 32) | i.imm as u32 as u64;
            let (a, b) = const_imm(val, i.imm, n.imm, &mut strings);
            put(&mut out, 0x18, i.dst, 0, &a, b);
            put(&mut out, 0, 0, 0, &Imm::N(n.imm), 0);
            k += 2;
            continue;
        }
        if opc == 0x85 {
            let rel = p.elf.call_reloc(pc);
            imm = Imm::S(if let Some(CallReloc::Syscall { name }) = rel {
                format!("S:{name}")
            } else if let Some(n) = sys_at.as_ref().and_then(|m| m.get(&pc)) {
                format!("S:{n}")
            } else if v < 3 && i.imm == -1 && rel.is_none() {
                "U".into()
            } else {
                "F".into()
            });
        } else if opc == 0x18 && (if norm { v != 2 } else { v < 2 }) {
            let n = ins(pc + 1);
            let val = n.map_or(0, |n| ((n.imm as u32 as u64) << 32) | i.imm as u32 as u64);
            let c = const_imm(val, i.imm, n.map_or(0, |n| n.imm), &mut strings);
            imm = c.0;
            hi = c.1;
        }
        put(
            &mut out,
            opc,
            regs,
            if opc == 0x85 { 0 } else { i.off },
            &imm,
            hi,
        );
        k += 1;
    }
    FnPrint {
        hash: sha1_16(&out),
        insns: pcs.len(),
        strings,
        alt: None,
    }
}

/// Printable ASCII run at an address (at least 4 characters).
pub fn preview_string(img: &Image, addr: u64, max: usize) -> Option<String> {
    img.bytes_at(addr, 1)?;
    let mut s = String::new();
    for k in 0..max as u64 {
        let Some(a) = addr.checked_add(k) else { break };
        let Some(b) = img.bytes_at(a, 1) else { break };
        let c = b[0];
        if !(0x20..=0x7e).contains(&c) {
            break;
        }
        s.push(c as char);
    }
    if s.len() >= 4 {
        Some(s)
    } else {
        None
    }
}

// ---- function signatures for program diffing and security/fingerprints.json ----

#[derive(Clone, Debug)]
pub struct FnSig {
    pub pc: i64,
    pub insns: usize,
    pub toks: Vec<String>,
    pub consts: Vec<String>,
    pub hash: String,
    pub regfree: String,
    pub data: String,
    pub fuzzy: String,
    pub hist: [u32; 16],
    pub blocks: usize,
    pub edges: usize,
    pub calls: Vec<i64>,
    pub sys: Vec<String>,
}

pub const OP_CLASSES: [&str; 16] = [
    "ldx",
    "st",
    "lddw",
    "addsub",
    "muldiv",
    "bitop",
    "shift",
    "mov",
    "alu_other",
    "jeq",
    "jcc",
    "ja",
    "call",
    "syscall",
    "callx",
    "exit",
];

fn op_class(opc: u8, sys: bool) -> usize {
    if opc == 0x18 {
        return 2;
    }
    if opc == 0x85 {
        return if sys { 13 } else { 12 };
    }
    if opc == 0x8d {
        return 14;
    }
    if opc == 0x95 {
        return 15;
    }
    let cls = opc & 7;
    let op = opc >> 4;
    if cls == 0 || cls == 1 {
        return 0;
    }
    if cls == 2 || cls == 3 {
        return 1;
    }
    if cls == 5 || cls == 6 {
        return if op == 0 {
            11
        } else if op == 1 || op == 5 {
            9
        } else {
            10
        };
    }
    match op {
        0 | 1 => 3,
        2 | 3 | 9 => 4,
        4 | 5 | 10 => 5,
        6 | 7 | 12 => 6,
        11 => 7,
        _ => 8,
    }
}

/// JSON.stringify of a latin1 string
fn json_str(s: &str) -> String {
    serde_json::to_string(s).unwrap()
}

fn constant_at(img: &Image, bytes: &[u8], o: usize) -> String {
    let lo = o.min(bytes.len());
    let w = &bytes[lo..(o + 32).min(bytes.len())];
    let mut txt = 0;
    while txt < w.len() && w[txt] >= 0x20 && w[txt] < 0x7f {
        txt += 1;
    }
    if txt >= 4 {
        let s: String = w[..txt.min(16)].iter().map(|&c| c as char).collect();
        return json_str(&s);
    }
    let mut k = 0;
    while k + 8 <= w.len() {
        let v = u64::from_le_bytes(w[k..k + 8].try_into().unwrap());
        if v >> 32 >= 1 && v >> 32 <= 4 && img.region(v, 1).is_some() {
            return String::new();
        }
        k += 8;
    }
    if w.len() == 32 {
        sbpf_print::print::b58(w)
    } else {
        let mut s = String::new();
        for b in w {
            s.push_str(&format!("{b:02x}"));
        }
        s
    }
}

fn uses_src(opc: u8) -> bool {
    let cls = opc & 7;
    cls == 1
        || cls == 3
        || (cls >= 4 && (opc & 8) != 0 && opc != 0x85 && opc != 0x8d && opc != 0x95)
}

/// A call target as a signature reads it: kind, syscall name, callee pc.
#[derive(Clone, Debug)]
pub enum SigTarget {
    Fn(i64),
    Sys(String),
    Ind,
}

/// What a signature reads of a function's lifted blocks.
#[derive(Clone, Debug)]
pub struct SigShape {
    pub pc: i64,
    pub pcs: Vec<i64>,
    pub targets: IndexMap<i64, SigTarget>,
    pub edges: usize,
    pub blocks: usize,
}

pub fn sig_shape(f: &Func) -> SigShape {
    let mut targets = IndexMap::default();
    let mut edges = 0;
    for b in &f.blocks {
        edges += b.succs.len();
        for s in &b.stmts {
            if let Stmt::Call { t, pc, .. } = s {
                targets.insert(
                    *pc,
                    match t {
                        CallTarget::Fn { pc } => SigTarget::Fn(*pc),
                        CallTarget::Sys { name, .. } => SigTarget::Sys(name.to_string()),
                        CallTarget::Ind { .. } => SigTarget::Ind,
                    },
                );
            }
        }
    }
    SigShape {
        pc: f.pc,
        pcs: func_pcs(f),
        targets,
        edges,
        blocks: f.blocks.len(),
    }
}

/// The parts of a Program `shape_signature` reads (shareable between threads, unlike the IR arenas).
pub struct ShapeProg<'a> {
    pub elf: &'a sbpf_elf::Elf,
    pub version: u32,
    pub insns: &'a [sbpf_program::Insn],
    pub text_vaddr: u64,
}

impl<'a> ShapeProg<'a> {
    pub fn of(p: &'a Program) -> Self {
        ShapeProg {
            elf: &p.elf,
            version: p.version,
            insns: &p.insns,
            text_vaddr: p.text_vaddr,
        }
    }
}

pub fn shape_signature(p: &Program, img: &Image, f: &SigShape) -> FnSig {
    shape_signature_of(&ShapeProg::of(p), img, f)
}

pub fn shape_signature_of(p: &ShapeProg, img: &Image, f: &SigShape) -> FnSig {
    let pcs = &f.pcs;
    let text_lo = p.text_vaddr as u128;
    let text_hi = text_lo + (p.insns.len() as u128) * 8;
    let lddw = p.version != 2;
    let mut toks: Vec<String> = Vec::new();
    let mut rf: Vec<String> = Vec::new();
    let mut consts: Vec<String> = Vec::new();
    let mut hist = [0u32; 16];
    let mut ren: IndexMap<u8, u32> = IndexMap::default();
    ren.insert(10, 10);
    let mut calls: Vec<i64> = Vec::new();
    let mut sys: IndexSet<String> = IndexSet::default();
    let mut n = 0usize;
    let mut k = 0;
    while k < pcs.len() {
        let pc = pcs[k];
        let i = &p.insns[pc as usize];
        let mut imm = i.imm.to_string();
        let mut hi = 0i32;
        let t = if i.opc == 0x85 {
            f.targets.get(&pc)
        } else {
            None
        };
        if i.opc == 0x85 {
            match t {
                Some(SigTarget::Sys(name)) => {
                    imm = format!("S:{name}");
                    sys.insert(name.clone());
                }
                Some(SigTarget::Fn(c)) => {
                    imm = "F".into();
                    calls.push(*c);
                }
                _ => {}
            }
        } else if i.opc == 0x18 && lddw {
            let nx = p.insns.get(pc as usize + 1);
            let v = nx.map_or(0, |nx| ((nx.imm as u32 as u64) << 32) | i.imm as u32 as u64);
            if (v as u128) >= text_lo && (v as u128) < text_hi {
                imm = "T".into();
            } else {
                match img.region(v, 1) {
                    Some(r) if !r.exec => {
                        imm = "A".into();
                        let c = constant_at(img, p.elf.region_bytes(r), (v - r.vaddr) as usize);
                        if !c.is_empty() {
                            consts.push(c);
                        }
                    }
                    _ => hi = nx.map_or(0, |nx| nx.imm),
                }
            }
            if pcs.get(k + 1) == Some(&(pc + 1)) {
                k += 1;
            }
        }
        hist[op_class(i.opc, matches!(t, Some(SigTarget::Sys(_))))] += 1;
        n += 1;
        let off = if i.opc == 0x85 { 0 } else { i.off };
        toks.push(format!(
            "{},{},{},{},{},{}",
            i.opc, i.dst, i.src, off, imm, hi
        ));
        let mut reg = |r: u8| -> u32 {
            if let Some(&x) = ren.get(&r) {
                return x;
            }
            let x = ren.len() as u32 - 1;
            ren.insert(r, x);
            x
        };
        let dst = if i.opc == 0x85 || i.opc == 0x95 || i.opc == 0x05 {
            i.dst as u32
        } else {
            reg(i.dst)
        };
        let src = if uses_src(i.opc) {
            reg(i.src)
        } else {
            i.src as u32
        };
        rf.push(format!("{},{},{},{},{},{}", i.opc, dst, src, off, imm, hi));
        k += 1;
    }
    let h = |a: &[String]| sha1_16(a.join(";").as_bytes());
    let mut sysv: Vec<String> = sys.into_iter().collect();
    sysv.sort_by(|a, b| crate::js_str_cmp(a, b));
    let fuzzy = format!(
        "{}i {}b {}e {}",
        n,
        f.blocks,
        f.edges,
        hist.iter()
            .map(|x| x.to_string())
            .collect::<Vec<_>>()
            .join(".")
    );
    FnSig {
        pc: f.pc,
        insns: n,
        hash: h(&toks),
        regfree: h(&rf),
        data: if consts.is_empty() {
            String::new()
        } else {
            h(&consts)
        },
        toks,
        consts,
        fuzzy,
        hist,
        blocks: f.blocks,
        edges: f.edges,
        calls,
        sys: sysv,
    }
}

/// Similarity of two functions' coarse shapes, 0..1.
pub fn fuzzy_sim(a: &FnSig, b: &FnSig) -> f64 {
    let (mut d, mut t) = (0f64, 0f64);
    for k in 0..a.hist.len() {
        d += (a.hist[k] as f64 - b.hist[k] as f64).abs();
        t += (a.hist[k] + b.hist[k]) as f64;
    }
    let ratio = |x: usize, y: usize| {
        if x == y {
            1.0
        } else {
            x.min(y) as f64 / x.max(y) as f64
        }
    };
    (if t != 0.0 { 1.0 - d / t } else { 1.0 }) * 0.6
        + ratio(a.blocks, b.blocks) * 0.15
        + ratio(a.edges, b.edges) * 0.15
        + if a.sys.join(",") == b.sys.join(",") {
            0.1
        } else {
            0.05
        }
}

/// Program-level hash: the multiset of (code hash, constants hash).
pub fn code_hash<'a>(sigs: impl Iterator<Item = &'a FnSig>) -> String {
    let mut v: Vec<String> = sigs.map(|s| format!("{}:{}", s.hash, s.data)).collect();
    v.sort();
    sha1_16(v.join("\n").as_bytes())
}

/// security/fingerprints.json: one line per function, in address order.
pub fn render_fingerprints(
    p: &Program,
    sigs: &IndexMap<i64, FnSig>,
    lib: &IndexSet<i64>,
    name: &dyn Fn(i64) -> Option<String>,
    instructions: &dyn Fn(i64) -> Vec<String>,
) -> String {
    let mut all: Vec<&FnSig> = sigs.values().collect();
    all.sort_by_key(|s| s.pc);
    let user: Vec<&FnSig> = all
        .iter()
        .copied()
        .filter(|s| !lib.contains(&s.pc))
        .collect();
    let about = format!("address-independent function hashes (bytecode only): hash = code with call targets, text/rodata addresses normalized; regfree = same, registers renamed; data = constants the code refers to in rodata (texts, 32-byte keys/tables; absent: none); fuzzy = \"<insns>i <blocks>b <edges>e <opcode-class histogram: {}>\"; codeHash = hash of the set of (hash, data). Compare programs with `sbpf-decompile <A> <B>`", OP_CLASSES.join("."));
    let head = format!(
        "{{\"sbpf\":{},\"functions\":{},\"library\":{},\"codeHash\":{},\"userCodeHash\":{},\"about\":{}}}",
        p.version,
        all.len(),
        all.len() - user.len(),
        json_str(&code_hash(all.iter().copied())),
        json_str(&code_hash(user.iter().copied())),
        json_str(&about)
    );
    let rows: Vec<String> = all
        .iter()
        .map(|s| {
            let mut o = format!(
                "{{\"pc\":{},\"addr\":\"0x{:x}\"",
                s.pc,
                p.text_vaddr as u128 + s.pc as u128 * 8
            );
            if let Some(n) = name(s.pc) {
                o.push_str(&format!(",\"name\":{}", json_str(&n)));
            }
            if lib.contains(&s.pc) {
                o.push_str(",\"lib\":true");
            }
            let ix = instructions(s.pc);
            if !ix.is_empty() {
                o.push_str(",\"instructions\":");
                o.push_str(&serde_json::to_string(&ix).unwrap());
            }
            o.push_str(&format!(
                ",\"hash\":{},\"regfree\":{}",
                json_str(&s.hash),
                json_str(&s.regfree)
            ));
            if !s.data.is_empty() {
                o.push_str(&format!(",\"data\":{}", json_str(&s.data)));
            }
            o.push_str(&format!(
                ",\"fuzzy\":{},\"size\":{}}}",
                json_str(&s.fuzzy),
                s.insns
            ));
            o
        })
        .collect();
    format!(
        "{{\"program\": {head},\n\"functions\": [\n{}\n]}}\n",
        rows.join(",\n")
    )
}

/// Signatures of every function of the program, by entry pc.
pub fn signatures(p: &Program, img: &Image) -> IndexMap<i64, FnSig> {
    p.funcs
        .values()
        .map(|f| (f.pc, shape_signature(p, img, &sig_shape(f))))
        .collect()
}
