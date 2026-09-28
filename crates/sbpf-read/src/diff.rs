//! Program diff from bytecode alone (upgrade diff / fork-family matching). Functions
//! are matched by address-independent hash, then register-renamed hash, instruction / symbol name,
//! and finally by coarse shape + call-graph neighbourhood.

use crate::idl::IdlInfo;
use crate::sem::SemR;
use sbpf_ir::fx::{IndexMap, IndexSet};
use sbpf_lib::fingerprint::{code_hash, fuzzy_sim, signatures, FnSig};
use sbpf_lib::js_str_cmp;
use sbpf_lib::library::classify;
use sbpf_program::{load_program, Program};
use sbpf_ir::fx::{HashMap, HashSet};

pub struct Profile {
    pub p: Program,
    pub sigs: IndexMap<i64, FnSig>,
    pub lib: IndexSet<i64>,
    /// pc -> display name (ix_<name>, library name, symbol, fn_<addr>)
    pub names: IndexMap<i64, String>,
    /// pc -> instructions whose handler reaches the function
    pub owners: HashMap<i64, Vec<String>>,
    /// instruction name -> where it was found (log / disc)
    pub arms: IndexMap<String, &'static str>,
    pub callers: HashMap<i64, Vec<i64>>,
    pub code_hash: String,
}

/// Instruction arms of a native program from the analysis' tag-dispatch split (and the functions each reaches).
fn native_arms(
    bytes: &[u8],
    idl: Option<&IdlInfo>,
    arms: &mut IndexMap<String, &'static str>,
    owners: &mut HashMap<i64, Vec<String>>,
) {
    let threads = std::thread::available_parallelism().map_or(1, |n| n.get());
    let Ok(r) = crate::decompile::decompile_read(bytes, idl, threads, false) else {
        return;
    };
    let Some(an) = r.analysis.as_ref() else {
        return;
    };
    let mut by_name: HashMap<&str, i64> = HashMap::default();
    for f in &r.funcs {
        by_name.insert(&f.name, f.pc);
    }
    for ix in &an.a.ixs {
        if ix.kind != "native" {
            continue;
        }
        arms.insert(ix.name.clone(), "tag");
        for f in &ix.functions {
            let Some(&pc) = by_name.get(f.as_str()) else {
                continue;
            };
            let o = owners.entry(pc).or_default();
            if !o.contains(&ix.name) {
                o.push(ix.name.clone());
            }
        }
    }
}

/// Everything the diff needs, from the first decompiler phase.
pub fn profile(bytes: &[u8], idl: Option<&IdlInfo>) -> Result<Profile, String> {
    let mut p = load_program(bytes, true)?;
    sbpf_dataflow::infer_signatures(&mut p);
    let base = sbpf_print::names::semantics(&p);
    let sem = SemR::new(&p, &base, idl);
    let libs = classify(&p)?;
    let img = p.image();
    let sigs = signatures(&p, &img);
    let lib: IndexSet<i64> = libs.iter().filter(|x| x.1.lib).map(|x| *x.0).collect();
    let mut names: IndexMap<i64, String> = IndexMap::default();
    for f in p.funcs.values() {
        names.insert(
            f.pc,
            libs.get(&f.pc)
                .and_then(|i| i.name.clone())
                .unwrap_or_else(|| f.name.clone()),
        );
    }
    let mut roots: IndexMap<i64, Vec<String>> = IndexMap::default();
    for (pc, ix) in &sem.ix_names {
        if !lib.contains(pc) {
            names.insert(*pc, format!("ix_{ix}"));
            roots.insert(*pc, vec![ix.clone()]);
        }
    }
    for (pc, ixs) in &sem.processors {
        if !lib.contains(pc) {
            roots.insert(
                *pc,
                if ixs.len() > 3 {
                    vec![format!("processor {}", names[pc])]
                } else {
                    ixs.clone()
                },
            );
        }
    }
    let mut owners = handler_reach(&sigs, &lib, &roots);
    let mut arms: IndexMap<String, &'static str> = IndexMap::default();
    for ix in sem.ix_names.values() {
        arms.insert(ix.clone(), "log");
    }
    for ixs in sem.processors.values() {
        for ix in ixs {
            arms.insert(ix.clone(), "log");
        }
    }
    // Anchor dispatcher: 8-byte instruction discriminators loaded as constants
    if p.version != 2 {
        for i in 0..p.insns.len().saturating_sub(1) {
            if p.insns[i].opc != 0x18 {
                continue;
            }
            let v = ((p.insns[i + 1].imm as u32 as u64) << 32) | p.insns[i].imm as u32 as u64;
            if let Some(n) = sem.disc.get(&v) {
                if let Some(x) = n.strip_prefix("ix:") {
                    if !arms.contains_key(x) {
                        arms.insert(x.to_string(), "disc");
                    }
                }
            }
        }
    }
    if let Some(idl) = idl {
        for ix in &idl.instructions {
            if !arms.contains_key(&ix.name) {
                arms.insert(ix.name.clone(), "idl");
            }
        }
    }
    if arms.is_empty() {
        // native programs (no names from logs / discriminators): the per-instruction split on the tag dispatch
        // (security analysis), which needs the full decompilation
        native_arms(bytes, idl, &mut arms, &mut owners);
    }
    let mut callers: HashMap<i64, Vec<i64>> = HashMap::default();
    for s in sigs.values() {
        let mut seen = HashSet::default();
        for &t in &s.calls {
            if seen.insert(t) {
                callers.entry(t).or_default().push(s.pc);
            }
        }
    }
    let code_hash = code_hash(sigs.values());
    drop(img);
    Ok(Profile {
        p,
        sigs,
        lib,
        names,
        owners,
        arms,
        callers,
        code_hash,
    })
}

/// Instruction handlers reaching each function through direct calls (not through library code or other handlers).
fn handler_reach(
    sigs: &IndexMap<i64, FnSig>,
    lib: &IndexSet<i64>,
    roots: &IndexMap<i64, Vec<String>>,
) -> HashMap<i64, Vec<String>> {
    let mut own: IndexMap<i64, IndexSet<String>> = IndexMap::default();
    for (&r, ixs) in roots {
        let mut seen: HashSet<i64> = HashSet::from_iter([r]);
        let mut q = vec![r];
        while let Some(x) = q.pop() {
            let o = own.entry(x).or_default();
            for ix in ixs {
                o.insert(ix.clone());
            }
            for &t in sigs.get(&x).map_or(&[][..], |s| &s.calls[..]) {
                if !seen.contains(&t)
                    && !lib.contains(&t)
                    && !roots.contains_key(&t)
                    && sigs.contains_key(&t)
                {
                    seen.insert(t);
                    q.push(t);
                }
            }
        }
    }
    own.into_iter()
        .map(|(pc, s)| {
            let mut v: Vec<String> = s.into_iter().collect();
            v.sort_by(|a, b| js_str_cmp(a, b));
            (pc, v)
        })
        .collect()
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Kind {
    Same,
    Data,
    Regs,
    Near,
}

#[derive(Clone, Copy, Debug)]
struct Match {
    b: i64,
    kind: Kind,
    sim: f64,
}

fn is_fn_hex(n: &str) -> bool {
    n.strip_prefix("fn_").is_some_and(|h| {
        !h.is_empty()
            && h.bytes()
                .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
    })
}

fn match_fns(a: &Profile, b: &Profile) -> IndexMap<i64, Match> {
    let mut m: IndexMap<i64, Match> = IndexMap::default();
    let mut used: HashSet<i64> = HashSet::default();
    fn pair(
        m: &mut IndexMap<i64, Match>,
        used: &mut HashSet<i64>,
        x: i64,
        y: i64,
        kind: Kind,
        sim: f64,
    ) {
        m.insert(x, Match { b: y, kind, sim });
        used.insert(y);
    }
    // 1-3: identical code (and constants), identical code, identical up to register allocation
    let by_key = |m: &mut IndexMap<i64, Match>,
                  used: &mut HashSet<i64>,
                  kind: Kind,
                  key: &dyn Fn(&FnSig) -> String| {
        let mut idx: HashMap<String, std::collections::VecDeque<i64>> = HashMap::default();
        for s in b.sigs.values() {
            if !used.contains(&s.pc) {
                idx.entry(key(s)).or_default().push_back(s.pc);
            }
        }
        for s in a.sigs.values() {
            if m.contains_key(&s.pc) {
                continue;
            }
            if let Some(y) = idx.get_mut(&key(s)).and_then(|l| l.pop_front()) {
                pair(m, used, s.pc, y, kind, 1.0);
            }
        }
    };
    by_key(&mut m, &mut used, Kind::Same, &|s| {
        format!("{}:{}", s.hash, s.data)
    });
    by_key(&mut m, &mut used, Kind::Data, &|s| s.hash.clone());
    by_key(&mut m, &mut used, Kind::Regs, &|s| s.regfree.clone());
    // 4: same instruction handler / symbol name (user code)
    let mut b_by_name: HashMap<&str, i64> = HashMap::default();
    for (pc, n) in &b.names {
        if !used.contains(pc) && !b.lib.contains(pc) && !is_fn_hex(n) {
            b_by_name.insert(n.as_str(), *pc);
        }
    }
    for (pc, n) in &a.names {
        if m.contains_key(pc) || a.lib.contains(pc) {
            continue;
        }
        if let Some(&y) = b_by_name.get(n.as_str()) {
            if !used.contains(&y) {
                let sim = fuzzy_sim(&a.sigs[pc], &b.sigs[&y]);
                pair(&mut m, &mut used, *pc, y, Kind::Near, sim);
            }
        }
    }
    // 5: coarse shape + call-graph neighbourhood, greedy by score; twice
    let nbrs = |pp: &Profile, pc: i64| -> IndexSet<i64> {
        let mut s: IndexSet<i64> = pp.sigs[&pc].calls.iter().copied().collect();
        if let Some(c) = pp.callers.get(&pc) {
            s.extend(c.iter().copied());
        }
        s
    };
    for round in 0..2 {
        let as_: Vec<&FnSig> = a
            .sigs
            .values()
            .filter(|s| !m.contains_key(&s.pc) && !a.lib.contains(&s.pc) && s.insns >= 6)
            .collect();
        let mut bs: Vec<&FnSig> = b
            .sigs
            .values()
            .filter(|s| !used.contains(&s.pc) && !b.lib.contains(&s.pc) && s.insns >= 6)
            .collect();
        bs.sort_by_key(|s| s.insns);
        if as_.is_empty() || bs.is_empty() {
            break;
        }
        let mut cands: Vec<(f64, i64, i64, f64)> = Vec::new();
        for x in &as_ {
            let na = nbrs(a, x.pc);
            let (mut lo, mut hi) = (0usize, bs.len());
            while lo < hi {
                let mid = (lo + hi) >> 1;
                if bs[mid].insns * 2 < x.insns {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }
            let mut k = lo;
            while k < bs.len() && bs[k].insns <= x.insns * 2 {
                let y = bs[k];
                k += 1;
                let f = fuzzy_sim(x, y);
                if f < 0.55 {
                    continue;
                }
                let nb = nbrs(b, y.pc);
                let mut hit = 0usize;
                for t in &na {
                    if let Some(z) = m.get(t) {
                        if nb.contains(&z.b) {
                            hit += 1;
                        }
                    }
                }
                let score = if !na.is_empty() || !nb.is_empty() {
                    f * 0.6 + (hit as f64 / na.len().max(nb.len()) as f64) * 0.4
                } else {
                    f
                };
                if score >= if round > 0 { 0.65 } else { 0.75 } {
                    cands.push((score, x.pc, y.pc, f));
                }
            }
        }
        cands.sort_by(|x, y| {
            y.0.partial_cmp(&x.0)
                .unwrap_or(std::cmp::Ordering::Equal)
                .then(x.1.cmp(&y.1))
        });
        for (_, x, y, f) in cands {
            if !m.contains_key(&x) && !used.contains(&y) {
                pair(&mut m, &mut used, x, y, Kind::Near, f);
            }
        }
    }
    m
}

/// Instructions differing between two functions' normalized code.
fn changed_insns(a: &[String], b: &[String]) -> usize {
    let (mut pre, mut suf) = (0usize, 0usize);
    while pre < a.len() && pre < b.len() && a[pre] == b[pre] {
        pre += 1;
    }
    while suf < a.len() - pre && suf < b.len() - pre && a[a.len() - 1 - suf] == b[b.len() - 1 - suf]
    {
        suf += 1;
    }
    let mut d = a.len().max(b.len()) - pre - suf;
    if a.len() == b.len() {
        let mut q = 0;
        for k in pre..a.len() - suf {
            if a[k] != b[k] {
                q += 1;
            }
        }
        d = d.min(q);
    }
    if d > 8 {
        let mut c: HashMap<&str, usize> = HashMap::default();
        for x in &a[pre..a.len() - suf] {
            *c.entry(x.as_str()).or_default() += 1;
        }
        let mut common = 0;
        for x in &b[pre..b.len() - suf] {
            if let Some(n) = c.get_mut(x.as_str()) {
                if *n > 0 {
                    common += 1;
                    *n -= 1;
                }
            }
        }
        d = d.min(a.len().max(b.len()) - pre - suf - common);
    }
    d
}

/// `x` with one decimal, non-negative (the exact decimal value, a tie rounds up: 0.25 -> "0.3").
fn to_fixed1(x: f64) -> String {
    if x.fract() == 0.25 {
        return format!("{}.3", x.trunc());
    }
    format!("{x:.1}")
}

/// The diff report's lines (diff(A, B, { all, labels }).lines).
fn diff_lines(a: &Profile, b: &Profile, all: bool, labels: [&str; 2]) -> Vec<String> {
    let m = match_fns(a, b);
    let matched_b: HashSet<i64> = m.values().map(|x| x.b).collect();
    let size = |pp: &Profile, pc: i64| pp.sigs[&pc].insns;
    let user = |pp: &Profile| -> Vec<i64> {
        pp.sigs
            .keys()
            .copied()
            .filter(|pc| !pp.lib.contains(pc))
            .collect()
    };
    let total = |pp: &Profile, pcs: &[i64]| -> usize { pcs.iter().map(|&pc| size(pp, pc)).sum() };
    let delta = |pc: i64, x: &Match| changed_insns(&a.sigs[&pc].toks, &b.sigs[&x.b].toks);
    let weight = |pc: i64, x: &Match| -> f64 {
        if x.kind == Kind::Data || x.kind == Kind::Regs {
            1.0
        } else {
            (1.0 - delta(pc, x) as f64 / size(a, pc).max(size(b, x.b)) as f64).max(x.sim / 2.0)
        }
    };
    let (ua, ub) = (user(a), user(b));
    let (ta, tb) = (total(a, &ua), total(b, &ub));
    let (mut same, mut near) = (0f64, 0f64);
    for &pc in &ua {
        let Some(x) = m.get(&pc) else { continue };
        if b.lib.contains(&x.b) {
            continue;
        }
        let w = (size(a, pc) + size(b, x.b)) as f64;
        if x.kind == Kind::Same {
            same += w;
        } else {
            near += w * weight(pc, x);
        }
    }
    let tt = (ta + tb) as f64;
    let pct = |x: f64| {
        format!(
            "{}%",
            to_fixed1(if ta + tb > 0 { (100.0 * x) / tt } else { 100.0 })
        )
    };
    let (la, lb) = ("a", "b");
    let mut l: Vec<String> = Vec::new();
    let desc = |pp: &Profile, lab: &str| {
        format!(
            "{lab}: {}  sBPF v{}, {} insns, {} functions ({} user, {} library), {} instruction arms, code hash {}",
            labels[if lab == la { 0 } else { 1 }],
            pp.p.version,
            pp.p.insns.len(),
            pp.sigs.len(),
            pp.sigs.len() - pp.lib.len(),
            pp.lib.len(),
            pp.arms.len(),
            pp.code_hash
        )
    };
    l.push(desc(a, la));
    l.push(desc(b, lb));
    let lib_hashes = |pp: &Profile| -> IndexMap<String, usize> {
        let mut c: IndexMap<String, usize> = IndexMap::default();
        for pc in &pp.lib {
            *c.entry(pp.sigs[pc].hash.clone()).or_default() += 1;
        }
        c
    };
    let (ha, hb) = (lib_hashes(a), lib_hashes(b));
    let mut lib_only_a = 0;
    let mut lib_only_b = 0;
    for (h, n) in &ha {
        lib_only_a += n.saturating_sub(*hb.get(h).unwrap_or(&0));
    }
    for (h, n) in &hb {
        lib_only_b += n.saturating_sub(*ha.get(h).unwrap_or(&0));
    }
    let user_same = ua.len() == ub.len()
        && ua.iter().all(|pc| {
            m.get(pc)
                .is_some_and(|x| x.kind == Kind::Same && !b.lib.contains(&x.b))
        });
    let score = if ta + tb > 0 { (same + near) / tt } else { 1.0 };
    if a.code_hash == b.code_hash {
        l.push(format!(
            "verdict: same code (e.g. redeployed at a new address){}",
            if a.p.elf.bytes == b.p.elf.bytes {
                "; identical files"
            } else {
                ""
            }
        ));
    } else if user_same {
        l.push(format!("verdict: same program code; toolchain/library version changed (library functions: {lib_only_a} only in {la}, {lib_only_b} only in {lb})"));
    } else {
        l.push(format!(
            "verdict: {}",
            if score >= 0.9 {
                "same program, modified"
            } else if score >= 0.5 {
                "related programs (fork family / shared code base)"
            } else if score >= 0.15 {
                "partially shared code"
            } else {
                "different programs"
            }
        ));
    }
    l.push(format!(
        "similarity: {} of user code (identical {}, near {}; user code {ta} vs {tb} instructions)",
        pct(same + near),
        pct(same),
        pct(near)
    ));
    l.push(format!(
        "library: {}",
        if lib_only_a > 0 || lib_only_b > 0 {
            format!("{lib_only_a} functions only in {la}, {lib_only_b} only in {lb} (toolchain/library version differs)")
        } else {
            "identical".into()
        }
    ));
    // instruction arms
    let arms_a: Vec<&String> = a.arms.keys().collect();
    let arms_b: Vec<&String> = b.arms.keys().collect();
    let mut add_arms: Vec<&String> = arms_b
        .iter()
        .copied()
        .filter(|x| !a.arms.contains_key(*x))
        .collect();
    add_arms.sort_by(|x, y| js_str_cmp(x, y));
    let mut del_arms: Vec<&String> = arms_a
        .iter()
        .copied()
        .filter(|x| !b.arms.contains_key(*x))
        .collect();
    del_arms.sort_by(|x, y| js_str_cmp(x, y));
    if !add_arms.is_empty() || !del_arms.is_empty() {
        l.push(format!(
            "instructions: {} common, {} added, {} removed",
            arms_a.len() - del_arms.len(),
            add_arms.len(),
            del_arms.len()
        ));
        let cap = |xs: &[&String]| -> String {
            let v: Vec<&str> = xs.iter().map(|s| s.as_str()).collect();
            if all || v.len() <= 30 {
                v.join(", ")
            } else {
                format!("{}, … ({} more)", v[..30].join(", "), v.len() - 30)
            }
        };
        if !add_arms.is_empty() {
            l.push(format!("  + {}", cap(&add_arms)));
        }
        if !del_arms.is_empty() {
            l.push(format!("  - {}", cap(&del_arms)));
        }
    } else {
        l.push(format!(
            "instructions: {}",
            if arms_a.is_empty() {
                "none recognized".to_string()
            } else {
                format!("same {}", arms_a.len())
            }
        ));
    }
    // user functions
    let ixs = |pp: &Profile, pc: i64| -> String {
        match pp.owners.get(&pc) {
            Some(o) if !o.is_empty() => format!(
                "  [{}]",
                if o.len() > 4 {
                    format!("{}, +{}", o[..4].join(", "), o.len() - 4)
                } else {
                    o.join(", ")
                }
            ),
            _ => String::new(),
        }
    };
    let mut changed: Vec<i64> = ua
        .iter()
        .copied()
        .filter(|pc| {
            m.get(pc)
                .is_some_and(|x| x.kind != Kind::Same && !b.lib.contains(&x.b))
        })
        .collect();
    changed.sort_by(|x, y| size(a, *y).cmp(&size(a, *x)));
    let mut removed: Vec<i64> = ua
        .iter()
        .copied()
        .filter(|pc| !m.contains_key(pc))
        .collect();
    removed.sort_by(|x, y| size(a, *y).cmp(&size(a, *x)));
    let mut added: Vec<i64> = ub
        .iter()
        .copied()
        .filter(|pc| !matched_b.contains(pc))
        .collect();
    added.sort_by(|x, y| size(b, *y).cmp(&size(b, *x)));
    l.push(format!(
        "functions: {} identical, {} changed, {} added, {} removed (user code)",
        ua.len() - changed.len() - removed.len(),
        changed.len(),
        added.len(),
        removed.len()
    ));
    let list = |l: &mut Vec<String>, xs: &[i64], row: &dyn Fn(i64) -> String| {
        let n = if all { xs.len() } else { 25 };
        for &pc in xs.iter().take(n) {
            l.push(row(pc));
        }
        if xs.len() > n {
            l.push(format!("    … {} more (--all)", xs.len() - n));
        }
    };
    let nm = |pp: &Profile, pc: i64| {
        pp.names
            .get(&pc)
            .cloned()
            .unwrap_or_else(|| format!("fn_{pc}"))
    };
    list(&mut l, &changed, &|pc| {
        let x = m[&pc];
        let (an, bn) = (nm(a, pc), nm(b, x.b));
        let mut why = match x.kind {
            Kind::Data => "constants only".to_string(),
            Kind::Regs => "register allocation only".to_string(),
            _ => format!("{} insns differ", delta(pc, &x)),
        };
        if x.kind == Kind::Data {
            let (ca, cb) = (&a.sigs[&pc].consts, &b.sigs[&x.b].consts);
            let d: Vec<(&String, Option<&String>)> = ca
                .iter()
                .enumerate()
                .map(|(k, c)| (c, cb.get(k)))
                .filter(|(c, e)| Some(*c) != *e)
                .collect();
            if !d.is_empty() {
                let v: Vec<String> = d
                    .iter()
                    .take(2)
                    .map(|(c, e)| format!("{c} -> {}", e.map_or("?", |s| s.as_str())))
                    .collect();
                why.push_str(&format!(
                    ": {}{}",
                    v.join(", "),
                    if d.len() > 2 {
                        format!(", +{}", d.len() - 2)
                    } else {
                        String::new()
                    }
                ));
            }
        }
        let own = {
            let s = ixs(b, x.b);
            if s.is_empty() {
                ixs(a, pc)
            } else {
                s
            }
        };
        format!(
            "  ~ {}  {} -> {} insns, {why}{own}",
            if an == bn {
                an.clone()
            } else {
                format!("{an} -> {bn}")
            },
            size(a, pc),
            size(b, x.b)
        )
    });
    list(&mut l, &added, &|pc| {
        format!("  + {}  {} insns{}", nm(b, pc), size(b, pc), ixs(b, pc))
    });
    list(&mut l, &removed, &|pc| {
        format!("  - {}  {} insns{}", nm(a, pc), size(a, pc), ixs(a, pc))
    });
    l
}

/// The diff report of two programs (`sbpf-decompile a.so b.so -o report.txt`): lines joined, trailing newline.
pub fn diff_report(
    a: &[u8],
    b: &[u8],
    idls: [Option<&IdlInfo>; 2],
    all: bool,
    labels: [&str; 2],
) -> Result<String, String> {
    // (the two programs are independent: the second one's profile is built on another thread)
    let (pa, pb) = std::thread::scope(|s| {
        let hb = std::thread::Builder::new()
            .stack_size(1 << 30)
            .spawn_scoped(s, || profile(b, idls[1]))
            .expect("spawn");
        let pa = profile(a, idls[0]);
        let pb = hb.join().unwrap_or_else(|e| std::panic::resume_unwind(e));
        (pa, pb)
    });
    let (pa, pb) = (pa?, pb?);
    Ok(diff_lines(&pa, &pb, all, labels).join("\n") + "\n")
}
