//! Differential equivalence check: the bytecode (the reference interpreter `emu`) against the decompiled
//! TypeScript (the evaluator `evaluate`), function by function on random inputs, with calls stubbed
//! identically on both sides; the traces of stores and calls, the aborts and the return values must agree.

pub mod emu;
pub mod evaluate;
pub mod tsparse;

use emu::{emulate, Event, Exc, TestMem, UNDEF};
use evaluate::{Env, Evaluator, RunResult};
use sbpf_program::{fn_addr, Program};
use std::cell::RefCell;
use std::collections::{BTreeMap, HashMap, HashSet};

#[derive(Clone, Debug)]
pub struct Failure {
    pub func: String,
    pub seed: u64,
    pub why: String,
}

#[derive(Clone, Debug, Default)]
pub struct Report {
    pub funcs: usize,
    pub trials: usize,
    pub skipped: usize,
    pub failures: Vec<Failure>,
    /// (function, why)
    pub errors: Vec<(String, String)>,
}

pub struct Opts {
    pub trials: usize,
    pub max_funcs: usize,
    /// restrict to these function entry pcs
    pub only: Option<HashSet<i64>>,
    /// print each failing function (name, seed, why) as found
    pub verbose: bool,
    /// print both traces of the trial with this seed
    pub dump_seed: Option<u64>,
    /// the readable output (the CLI default) instead of the raw form
    pub sugar: bool,
    pub idl: Option<serde_json::Value>,
    pub threads: usize,
}

impl Default for Opts {
    fn default() -> Self {
        Opts {
            trials: 20,
            max_funcs: usize::MAX,
            only: None,
            verbose: false,
            dump_seed: None,
            sugar: true,
            idl: None,
            threads: std::thread::available_parallelism().map_or(1, |n| n.get()),
        }
    }
}

/// xorshift64 (the seed and draw order fix the inputs: reports are reproducible)
pub struct Rng(u64);
impl Rng {
    pub fn new(seed: u64) -> Rng {
        Rng(seed
            .wrapping_mul(0x9e37_79b9_7f4a_7c15)
            .wrapping_add(0x123_4567))
    }
    pub fn next(&mut self) -> u64 {
        let mut x = self.0;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.0 = x;
        x
    }
}

/// The decompiled program: the output text, the built program and the checked functions (name, pc).
pub struct Decompiled {
    pub text: String,
    pub p: Program,
    pub funcs: Vec<(String, i64)>,
    /// final function names by pc
    pub names: HashMap<i64, String>,
}

pub fn decompile(
    bytes: &[u8],
    sugar: bool,
    idl: Option<&serde_json::Value>,
    threads: usize,
) -> Result<Decompiled, String> {
    if sugar {
        let idl = idl.map(sbpf_read::idl::parse_idl);
        let r = sbpf_read::decompile::decompile_read(bytes, idl.as_ref(), threads, true)?;
        let text = sbpf_read::decompile::render_read(&r);
        let funcs = r.funcs.iter().map(|f| (f.name.clone(), f.pc)).collect();
        let names = r.fn_names.iter().map(|(k, v)| (*k, v.clone())).collect();
        let p = r.program.ok_or("no program")?;
        Ok(Decompiled {
            text,
            p,
            funcs,
            names,
        })
    } else {
        let r = sbpf_print::raw::decompile_raw(bytes, threads)?;
        let text = sbpf_print::raw::render_single(&r);
        let funcs = r
            .funcs
            .iter()
            .map(|f| (r.p.funcs[&f.pc].name.clone(), f.pc))
            .collect();
        let names = r.p.funcs.values().map(|f| (f.pc, f.name.clone())).collect();
        Ok(Decompiled {
            text,
            p: r.p,
            funcs,
            names,
        })
    }
}

#[derive(Default)]
struct Side {
    ret: Option<u64>,
    abort: Option<String>,
    limit: bool,
    alias: bool,
    err: Option<String>,
    events: Vec<Event>,
}

fn r2(h: u64, t: &str) -> u64 {
    // stub results: mostly small (so result-dependent branches go both ways), sometimes large
    match h % 4 {
        0 => 0,
        1 => h % 8,
        2 => h,
        _ => t.encode_utf16().count() as u64,
    }
}

pub fn fmt_ev(e: Option<&Event>) -> String {
    match e {
        None => "none".into(),
        Some(Event::Store { addr, size, v }) => format!("st{}[0x{addr:x}]=0x{v:x}", size * 8),
        Some(Event::Call { t, args }) => format!(
            "call {t}({})",
            args.iter()
                .map(|x| format!("0x{x:x}"))
                .collect::<Vec<_>>()
                .join(",")
        ),
    }
}

fn ev_eq(x: &Event, y: &Event) -> bool {
    match (x, y) {
        (
            Event::Store { addr, size, v },
            Event::Store {
                addr: a2,
                size: s2,
                v: v2,
            },
        ) => addr == a2 && size == s2 && v == v2,
        (Event::Call { t, args }, Event::Call { t: t2, args: b }) => {
            // indirect calls: the decompiler omits trailing arguments that provably hold call-clobbered garbage
            t == t2
                && if t.starts_with("ptr:") {
                    b.len() <= args.len()
                        && b.iter().zip(args).all(|(p, q)| p == q)
                        && args[b.len()..].iter().all(|&v| v == UNDEF)
                } else {
                    args == b
                }
        }
        _ => false,
    }
}

/// Stores into the function's own frame between two barriers (calls or stores elsewhere) folded into the
/// byte-level frame state they produce (stores to disjoint frame addresses commute).
fn normalize(events: &[Event], lo: u64, hi: u64) -> Vec<Event> {
    let mut out = Vec::new();
    let mut pending: BTreeMap<u64, u8> = BTreeMap::new();
    let flush = |pending: &mut BTreeMap<u64, u8>, out: &mut Vec<Event>| {
        for (&addr, &v) in pending.iter() {
            out.push(Event::Store {
                addr,
                size: 1,
                v: v as u64,
            });
        }
        pending.clear();
    };
    for e in events {
        if let Event::Store { addr, size, v } = e {
            if *addr >= lo && (*addr as u128 + *size as u128) <= hi as u128 {
                for i in 0..*size as u64 {
                    pending.insert(addr + i, (v >> (8 * i)) as u8);
                }
                continue;
            }
        }
        flush(&mut pending, &mut out);
        out.push(e.clone());
    }
    flush(&mut pending, &mut out);
    out
}

fn js_hex(v: Option<u64>) -> String {
    v.map_or("undefined".into(), |v| format!("{v:x}"))
}

fn compare(a: &Side, b: &Side, returns: bool, fp: u64) -> Option<String> {
    if let Some(e) = &b.err {
        return Some(format!("evaluator error: {e}"));
    }
    let lo = fp.wrapping_sub(0x1000);
    let hi = fp;
    let is_frame = |e: &Event| matches!(e, Event::Store { addr, size, .. } if *addr >= lo && (*addr as u128 + *size as u128) <= hi as u128);
    let (ae, be) = if a.limit || b.limit {
        // partial trace: compare up to the last barrier both traces reached
        let barriers = |ev: &[Event]| ev.iter().filter(|e| !is_frame(e)).count();
        let nb = barriers(&a.events).min(barriers(&b.events));
        let cut = |ev: &[Event]| -> Vec<Event> {
            if nb == 0 {
                return Vec::new();
            }
            let mut k = 0;
            for (i, e) in ev.iter().enumerate() {
                if !is_frame(e) {
                    k += 1;
                    if k == nb {
                        return ev[..=i].to_vec();
                    }
                }
            }
            ev.to_vec()
        };
        (
            normalize(&cut(&a.events), lo, hi),
            normalize(&cut(&b.events), lo, hi),
        )
    } else {
        (normalize(&a.events, lo, hi), normalize(&b.events, lo, hi))
    };
    let n = ae.len().min(be.len());
    for i in 0..n {
        if !ev_eq(&ae[i], &be[i]) {
            return Some(format!(
                "event #{i}: emu {} vs dec {}",
                fmt_ev(Some(&ae[i])),
                fmt_ev(Some(&be[i]))
            ));
        }
    }
    if a.limit || b.limit {
        return None;
    }
    if ae.len() != be.len() {
        return Some(format!(
            "event count: emu {} vs dec {}; next emu {} dec {}",
            ae.len(),
            be.len(),
            fmt_ev(ae.get(n)),
            fmt_ev(be.get(n))
        ));
    }
    if a.abort.is_some() != b.abort.is_some() {
        return Some(format!(
            "abort mismatch: emu {} vs dec {}",
            a.abort
                .clone()
                .unwrap_or_else(|| format!("ret 0x{}", js_hex(a.ret))),
            b.abort.clone().unwrap_or_else(|| format!(
                "ret {}",
                b.ret.map_or("undefined".into(), |v| v.to_string())
            ))
        ));
    }
    if a.abort.is_none() && returns && a.ret != b.ret {
        return Some(format!(
            "return: emu 0x{} vs dec 0x{}",
            js_hex(a.ret),
            js_hex(b.ret)
        ));
    }
    None
}

/// checkProgram: decompile, parse the output and compare every function (or the `only` ones) on `trials` inputs.
pub fn check_program(bytes: &[u8], o: &Opts) -> Result<Report, String> {
    let d = decompile(bytes, o.sugar, o.idl.as_ref(), o.threads)?;
    Ok(check_decompiled(&d, o))
}

pub fn check_decompiled(d: &Decompiled, o: &Opts) -> Report {
    let p = &d.p;
    let mut report = Report::default();
    let ev = match Evaluator::new(&d.text) {
        Ok(e) => e,
        Err(e) => {
            report.errors.push(("*".into(), e));
            return report;
        }
    };
    let name_of = |f: &sbpf_program::Func| {
        d.names
            .get(&f.pc)
            .cloned()
            .unwrap_or_else(|| f.name.clone())
    };
    let mut fn_addr_map: HashMap<String, u64> = HashMap::new();
    let mut fn_target: HashMap<String, String> = HashMap::new();
    let mut sys_target: HashMap<String, String> = HashMap::new();
    for f in p.funcs.values() {
        fn_addr_map.insert(name_of(f), fn_addr(p, f.pc));
        fn_target.insert(name_of(f), format!("fn:{}", f.pc));
    }
    for sc in p.syscalls.values() {
        sys_target.insert(sc.alias.clone(), format!("sys:{}", sc.name));
    }
    // readable output: argument counts of call targets (trailing undef arguments are omitted there)
    let mut arity: HashMap<String, usize> = HashMap::new();
    for f in p.funcs.values() {
        let sa = f.stack_args.unwrap_or(0) as usize;
        let n = if sa > 0 { 4 + sa } else { f.nparams as usize };
        arity.insert(format!("fn:{}", f.pc), n + f.extra_in.len());
    }
    for sc in p.syscalls.values() {
        arity.insert(format!("sys:{}", sc.name), sc.params.len());
    }
    // "text": first occurrence of its UTF-8 bytes in program memory (regions in address order)
    let img = p.image();
    let str_cache: RefCell<HashMap<String, Option<u64>>> = RefCell::new(HashMap::new());
    let str_addr = |text: &str| -> Option<u64> {
        if let Some(v) = str_cache.borrow().get(text) {
            return *v;
        }
        let needle = text.as_bytes();
        let mut at = None;
        for &i in &img.order {
            let r = &p.elf.regions[i];
            let hay = p.elf.region_bytes(r);
            let pos = if needle.is_empty() {
                Some(0)
            } else {
                hay.windows(needle.len()).position(|w| w == needle)
            };
            if let Some(k) = pos {
                at = Some(r.vaddr + k as u64);
                break;
            }
        }
        str_cache.borrow_mut().insert(text.to_string(), at);
        at
    };
    let func_of = |t: &str| -> Option<&sbpf_program::Func> {
        t.strip_prefix("fn:")
            .and_then(|x| x.parse::<i64>().ok())
            .and_then(|pc| p.funcs.get(&pc))
    };
    let arg_regs = |t: &str| -> Vec<usize> {
        if t.starts_with("fn:") {
            if let Some(f) = func_of(t) {
                let mut v: Vec<usize> = (1..=f.nparams as usize).collect();
                v.extend(f.extra_in.iter().map(|&r| r as usize));
                return v;
            }
        } else if let Some(n) = t.strip_prefix("sys:") {
            if let Some(sc) = p.syscalls.get(n) {
                return (1..=sc.params.len()).collect();
            }
        }
        vec![1, 2, 3, 4, 5]
    };
    let noreturn = |t: &str| -> bool {
        if t.starts_with("fn:") {
            func_of(t).is_some_and(|f| f.noreturn)
        } else if let Some(n) = t.strip_prefix("sys:") {
            p.syscalls.get(n).is_some_and(|s| s.noreturn)
        } else {
            false
        }
    };
    let stack_args = |t: &str| -> usize {
        if t.starts_with("fn:") {
            func_of(t).and_then(|f| f.stack_args).unwrap_or(0) as usize
        } else {
            0
        }
    };
    let mut n = 0usize;
    for (name, pc) in &d.funcs {
        if o.only.as_ref().is_some_and(|s| !s.contains(pc)) {
            continue;
        }
        let k = n;
        n += 1;
        if k >= o.max_funcs {
            break;
        }
        let Some(decl) = ev.decl(name) else {
            report
                .errors
                .push((name.clone(), "function missing in output".into()));
            continue;
        };
        report.funcs += 1;
        let f = &p.funcs[pc];
        let stack_n = f.stack_args.unwrap_or(0) as usize;
        for t in 0..o.trials {
            let seed = (t as u64).wrapping_mul(7919).wrapping_add(*pc as u64);
            let mut rng = Rng::new(seed);
            let pick = |rng: &mut Rng| -> u64 {
                let k = rng.next() % 6;
                match k {
                    0 => rng.next() % 16,
                    1 => 0x4_0000_0000 + (rng.next() % 0x400) * 8,
                    2 => 0x3_0000_0000 + (rng.next() % 0x400) * 8,
                    3 => 0x2_0000_0000 + (rng.next() % 0x100) * 8, // caller frames: never inside the callee's own frame
                    4 => rng.next() % 0x10000,
                    _ => rng.next(),
                }
            };
            let args: [u64; 5] = if f.is_entry {
                [0x4_0000_0000, 0, 0, 0, 0]
            } else {
                let a0 = pick(&mut rng);
                let a1 = pick(&mut rng);
                let a2 = pick(&mut rng);
                let a3 = pick(&mut rng);
                let a4 = if stack_n > 0 {
                    0x2_0010_0000 + (rng.next() % 0x100) * 0x1000
                } else {
                    pick(&mut rng)
                };
                [a0, a1, a2, a3, a4]
            };
            let extra: [u64; 5] = if f.is_entry {
                [0; 5]
            } else {
                let mut e = [0u64; 5];
                for x in e.iter_mut() {
                    *x = pick(&mut rng);
                }
                e
            };
            let fp = 0x2_0000_1000u64 + 0x2000 * (1 + (t % 5) as u64);
            let run = |side_emu: bool, cap: usize| -> Side {
                let mut mem = TestMem::new(Some(p.image()), seed, t % 4 == 3);
                mem.cap = cap;
                let mut calls = 0u64;
                let mut on_call =
                    |mem: &mut TestMem, target: &str, a: Vec<u64>| -> Result<u64, Exc> {
                        mem.push(Event::Call {
                            t: target.to_string(),
                            args: a.clone(),
                        })?;
                        if noreturn(target) {
                            return Err(Exc::Abort("noreturn call".into()));
                        }
                        calls += 1;
                        let mut h = calls.wrapping_mul(0x100_0000_01b3);
                        let mut n = a.len();
                        if target.starts_with("ptr:") {
                            while n > 0 && a[n - 1] == UNDEF {
                                n -= 1;
                            }
                        }
                        for &x in &a[..n] {
                            h = (h ^ x).wrapping_mul(0x100_0000_01b3);
                        }
                        // callees may write through pointer arguments: model that (identically on both sides)
                        for &x in &a[..n] {
                            if (0x2_0000_0000..0x5_0000_0000).contains(&x) && x & 7 == 0 {
                                mem.store(x, 8, (h ^ x) & 0xffff)?;
                            }
                        }
                        Ok(r2(h, target))
                    };
                if side_emu {
                    let r = emulate(
                        p,
                        *pc,
                        &args,
                        fp,
                        &mut mem,
                        &mut on_call,
                        20000,
                        &arg_regs,
                        &extra,
                        &stack_args,
                    );
                    return Side {
                        ret: r.ret,
                        abort: r.abort,
                        limit: r.limit,
                        alias: r.alias,
                        err: None,
                        events: std::mem::take(&mut mem.events),
                    };
                }
                let mut pargs: Vec<u64> = if stack_n > 0 {
                    let mut v = args[..4].to_vec();
                    for k in 0..stack_n {
                        v.push(
                            mem.load(args[4].wrapping_sub(0x1000).wrapping_add(8 * k as u64), 8),
                        );
                    }
                    v
                } else {
                    args[..if f.is_entry {
                        1
                    } else {
                        (f.nparams as usize).min(5)
                    }]
                        .to_vec()
                };
                if !f.is_entry {
                    for &r in &f.extra_in {
                        pargs.push(if r == 0 {
                            extra[0]
                        } else {
                            extra[r as usize - 5]
                        });
                    }
                }
                let str_ref: &dyn Fn(&str) -> Option<u64> = &str_addr;
                let res = {
                    let mut env = Env {
                        mem: &mut mem,
                        on_call: &mut on_call,
                        fp,
                        fn_addr: &fn_addr_map,
                        fn_target: &fn_target,
                        sys_target: &sys_target,
                        max_steps: 20000,
                        str_addr: if o.sugar { Some(str_ref) } else { None },
                        arity: if o.sugar { Some(&arity) } else { None },
                        undef_uninit: o.sugar,
                    };
                    ev.run_function(decl, &pargs, &mut env)
                };
                let events = std::mem::take(&mut mem.events);
                match res {
                    Ok(RunResult { ret, abort, limit }) => Side {
                        ret,
                        abort,
                        limit,
                        events,
                        ..Default::default()
                    },
                    Err(Exc::Eval(m)) => Side {
                        err: Some(m),
                        events,
                        ..Default::default()
                    },
                    Err(e) => Side {
                        err: Some(format!("{e:?}")),
                        events,
                        ..Default::default()
                    },
                }
            };
            let mut a = run(true, usize::MAX);
            // memory-unsafe execution (frame accessed through a non-frame pointer): outside the model, skip
            if a.alias {
                report.skipped += 1;
                continue;
            }
            // stores into promoted stack slots are variables in the output
            if f.arg_area_elided == Some(true) {
                let lo = fp.wrapping_sub(0x1000);
                let hi = lo + 0x100;
                a.events.retain(
                    |e| !matches!(e, Event::Store { addr, .. } if *addr >= lo && *addr < hi),
                );
            }
            if let Some(pro) = f.promoted.as_ref().filter(|v| !v.is_empty()) {
                let set: HashSet<(u64, u32)> = pro
                    .iter()
                    .map(|x| (fp.wrapping_add(x.off as i64 as u64), x.size as u32))
                    .collect();
                a.events.retain(|e| !matches!(e, Event::Store { addr, size, .. } if set.contains(&(*addr, *size))));
            }
            let cap = if a.limit {
                a.events.len() + 1
            } else {
                usize::MAX
            };
            let b = run(false, cap);
            if o.dump_seed == Some(seed) {
                println!(
                    "EMU {} {} {}",
                    js_hex(a.ret),
                    a.abort.clone().unwrap_or_default(),
                    if a.limit { "true" } else { "" }
                );
                for e in &a.events {
                    println!("   {}", fmt_ev(Some(e)));
                }
                println!(
                    "DEC {} {} {}",
                    js_hex(b.ret),
                    b.abort.clone().unwrap_or_default(),
                    b.err.clone().unwrap_or_default()
                );
                for e in &b.events {
                    println!("   {}", fmt_ev(Some(e)));
                }
            }
            report.trials += 1;
            if let Some(why) = compare(&a, &b, f.returns, fp) {
                if o.verbose {
                    println!("{name} {seed} {why}");
                }
                report.failures.push(Failure {
                    func: name.clone(),
                    seed,
                    why,
                });
                break;
            }
        }
    }
    report
}
