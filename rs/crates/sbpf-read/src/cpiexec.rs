//! `src/cpiexec.ts`: CPIs whose instruction is not visible in the frame, described from two runs of
//! the function (sbpf-exec) on synthetic inputs, traced back to the function's inputs.

use crate::cpi::{wrap, Acc, CpiEnv, DataAt, IxModel, KeyText};
use crate::sem::known_key;
use crate::util::{b58, json_eq, json_str, N};
use sbpf_exec::{BranchKey, Exc, Exec, ExecMem, Hooks, MemObserver, ProgCtx, Sticky, R};
use sbpf_ir::{BinOp, Ir, E};
use sbpf_program::Func;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

const TOP_FP: u64 = 0x2_0000_3000;
const CALLER_FP: u64 = 0x2_0000_1000;
const MAX_STEPS: i64 = 5_000;
const LOOP_CAP: u32 = 40;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ExecSiteKind {
    Sys,
    Thunk,
    Wrapper,
}

/// Interpreter steps all runs of a decompilation share.
pub struct ExecBudget {
    pub steps: i64,
}

struct TB {
    b: Vec<u8>,
    t: Vec<u8>,
}

struct Meta {
    key: TB,
    ptr: Option<u64>,
    w: u64,
    s: u64,
    flags_tainted: u8,
}

struct Captured {
    abi_c: bool,
    program: TB,
    program_ptr: Option<u64>,
    metas: Vec<Meta>,
    data: TB,
    signers: Option<Vec<Vec<(u64, u64)>>>,
    seeds_ptr: u64,
    seeds_len: u64,
}

#[derive(Default)]
struct Log {
    /// (size (0: a copy, then the index into copies), address, value)
    entries: Vec<(u8, u64, u64)>,
    copies: Vec<(u64, Vec<u8>)>,
}

impl MemObserver for Log {
    fn load(&mut self, addr: u64, size: u8, v: u64) {
        self.entries.push((size, addr, v));
    }
    fn copy(&mut self, addr: u64, b: &[u8]) {
        self.entries.push((0, self.copies.len() as u64, 0));
        self.copies.push((addr, b.to_vec()));
    }
}

/// Traces values of one run back to the function's inputs.
struct Sym {
    markers: HashMap<u64, u32>,
    loads8: HashMap<u64, Vec<u64>>,
    small: Vec<(u64, u8, u64)>,
    bases: Vec<u64>,
}

impl Sym {
    fn note(&mut self, addr: u64, size: u8, v: u64) {
        if addr >= TOP_FP - 0x1000 && addr < TOP_FP + 0x100000 {
            return;
        }
        if size == 8 {
            let l = self.loads8.entry(v).or_default();
            if l.len() < 4 {
                l.push(addr);
            }
        } else if self.small.len() < 20000 {
            self.small.push((addr, size, v));
        }
    }
    fn finish(&mut self, log: &Log) {
        for &(size, a, v) in &log.entries {
            if size != 0 {
                self.note(a, size, v);
                continue;
            }
            let (ca, b) = &log.copies[a as usize];
            let mut j = 0;
            while j + 8 <= b.len() {
                let w = u64::from_le_bytes(b[j..j + 8].try_into().unwrap());
                self.note(ca.wrapping_add(j as u64), 8, w);
                j += 8;
            }
        }
        let mut bases: Vec<u64> = self.markers.keys().copied().collect();
        // (the markers first in Map order, then the loaded values: a sorted list with duplicates)
        bases.extend(self.loads8.keys().copied());
        bases.sort();
        self.bases = bases;
    }
    fn addr(&self, ir: &Ir, a: u64, depth: u32) -> Option<E> {
        if depth > 6 {
            return None;
        }
        let (mut lo, mut hi, mut best) = (0i64, self.bases.len() as i64 - 1, -1i64);
        while lo <= hi {
            let mid = (lo + hi) >> 1;
            if self.bases[mid as usize] <= a {
                best = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        let mut i = best;
        while i >= 0 && i > best - 4 {
            let b = self.bases[i as usize];
            let off = a - b;
            if off >= 0x10000 {
                break;
            }
            if let Some(be) = self.value(ir, b, depth + 1) {
                return Some(if off == 0 {
                    be
                } else {
                    let c = ir.c(off);
                    ir.bin(BinOp::Add, be, c)
                });
            }
            i -= 1;
        }
        None
    }
    fn value(&self, ir: &Ir, v: u64, depth: u32) -> Option<E> {
        if let Some(&m) = self.markers.get(&v) {
            return Some(ir.var(m));
        }
        if depth > 6 {
            return None;
        }
        for &a in self.loads8.get(&v).map_or(&[][..], |x| x.as_slice()) {
            if let Some(e) = self.addr(ir, a, depth + 1) {
                return Some(ir.load(8, e));
            }
        }
        None
    }
    fn values(&self, ir: &Ir, v: u64, size: u8) -> Vec<E> {
        if size == 8 {
            return self.value(ir, v, 0).into_iter().collect();
        }
        let mut out = Vec::new();
        for &(a, sz, val) in &self.small {
            if sz == size && val == v {
                if let Some(e) = self.addr(ir, a, 0) {
                    out.push(ir.load(size, e));
                }
                if out.len() > 3 {
                    break;
                }
            }
        }
        out
    }
    fn key(&self, ir: &Ir, mem: &mut ExecMem, b: &[u8]) -> Option<E> {
        let w0 = le(b, 0, 8);
        for &a in self.loads8.get(&w0).map_or(&[][..], |x| x.as_slice()) {
            if mem.read(a, 32) != b {
                continue;
            }
            if let Some(e) = self.addr(ir, a, 0) {
                return Some(e);
            }
        }
        None
    }
}

fn le(b: &[u8], o: usize, n: usize) -> u64 {
    let mut v = 0u64;
    for i in (0..n).rev() {
        v = (v << 8) | *b.get(o + i).unwrap_or(&0) as u64;
    }
    v
}

struct Run<'c> {
    cap: Captured,
    sym: Sym,
    mem: ExecMem<'c>,
}

struct RunCtl {
    flip: bool,
    no_flip: HashSet<BranchKey>,
    sticky: Sticky,
    limit: bool,
    flipped: Vec<BranchKey>,
}

struct RunHooks {
    site_pc: i64,
    kind: ExecSiteKind,
    reached: bool,
    infos: Option<u64>,
    cap: Option<Option<Captured>>,
}

impl Hooks for RunHooks {
    fn on_call(&mut self, x: &mut Exec, cpc: i64, depth: u32, regs: &mut [u64; 16]) {
        if depth != 0 || cpc != self.site_pc {
            return;
        }
        self.reached = true;
        x.flip = false;
        if self.kind == ExecSiteKind::Wrapper {
            self.infos = Some(regs[3]);
            regs[4] = 0;
        }
    }
    fn on_syscall(&mut self, x: &mut Exec, name: &str, a: &[u64; 5]) -> R<Option<u64>> {
        if name != "sol_invoke_signed_c" && name != "sol_invoke_signed_rust" {
            return Ok(None);
        }
        if !self.reached {
            return Ok(Some(0));
        }
        if self.kind == ExecSiteKind::Wrapper && (a[2] != 0 || Some(a[1]) != self.infos) {
            return Err(Exc::Stop);
        }
        self.cap = Some(capture(&mut x.mem, name == "sol_invoke_signed_c", a));
        Err(Exc::Stop)
    }
}

fn capture(mem: &mut ExecMem, abi_c: bool, a: &[u64; 5]) -> Option<Captured> {
    let tb = |mem: &mut ExecMem, addr: u64, n: usize| TB {
        b: mem.read(addr, n),
        t: mem.taint_arr(addr, n),
    };
    let ix = a[0];
    let mut metas = Vec::new();
    let (program, program_ptr, data);
    if !abi_c {
        let n = mem.read_u(ix.wrapping_add(16), 8);
        let dl = mem.read_u(ix.wrapping_add(40), 8);
        if n > 64 || dl > 10240 {
            return None;
        }
        let mp = mem.read_u(ix, 8);
        for i in 0..n {
            let b = mp.wrapping_add(34 * i);
            let key = tb(mem, b, 32);
            let s = mem.read_u(b.wrapping_add(32), 1);
            let w = mem.read_u(b.wrapping_add(33), 1);
            let ft = mem.tainted(b.wrapping_add(32), 2);
            metas.push(Meta {
                key,
                ptr: None,
                w,
                s,
                flags_tainted: ft,
            });
        }
        let dp = mem.read_u(ix.wrapping_add(24), 8);
        data = tb(mem, dp, dl as usize);
        program = tb(mem, ix.wrapping_add(48), 32);
        program_ptr = None;
    } else {
        let n = mem.read_u(ix.wrapping_add(16), 8);
        let dl = mem.read_u(ix.wrapping_add(32), 8);
        if n > 64 || dl > 10240 {
            return None;
        }
        let mp = mem.read_u(ix.wrapping_add(8), 8);
        for i in 0..n {
            let b = mp.wrapping_add(16 * i);
            let kp = mem.read_u(b, 8);
            let key = tb(mem, kp, 32);
            let w = mem.read_u(b.wrapping_add(8), 1);
            let s = mem.read_u(b.wrapping_add(9), 1);
            let ft = mem.tainted(b.wrapping_add(8), 2);
            metas.push(Meta {
                key,
                ptr: Some(kp),
                w,
                s,
                flags_tainted: ft,
            });
        }
        let dp = mem.read_u(ix.wrapping_add(24), 8);
        data = tb(mem, dp, dl as usize);
        let pp = mem.read_u(ix, 8);
        program_ptr = Some(pp);
        program = tb(mem, pp, 32);
    }
    if metas.iter().any(|m| m.w > 1 || m.s > 1) {
        return None;
    }
    let mut signers: Option<Vec<Vec<(u64, u64)>>> = Some(Vec::new());
    if a[4] > 8 {
        signers = None;
    } else {
        let mut i = 0u64;
        while i < a[4] && signers.is_some() {
            let base = a[3].wrapping_add(16 * i);
            let sp = mem.read_u(base, 8);
            let sn = mem.read_u(base.wrapping_add(8), 8);
            if sn > 16 {
                signers = None;
                break;
            }
            let mut seeds = Vec::new();
            for j in 0..sn {
                seeds.push((
                    mem.read_u(sp.wrapping_add(16 * j), 8),
                    mem.read_u(sp.wrapping_add(16 * j + 8), 8),
                ));
            }
            if seeds.iter().any(|s| s.1 > 64) {
                signers = None;
                break;
            }
            signers.as_mut().unwrap().push(seeds);
            i += 1;
        }
    }
    Some(Captured {
        abi_c,
        program,
        program_ptr,
        metas,
        data,
        signers,
        seeds_ptr: a[3],
        seeds_len: a[4],
    })
}

#[allow(clippy::too_many_arguments)]
fn run_once<'c>(
    ctx: &'c ProgCtx<'c>,
    ir: &Ir,
    f: &Func,
    site_pc: i64,
    kind: ExecSiteKind,
    seed: u32,
    ctl: &mut RunCtl,
    steps: &mut i64,
) -> Result<Option<Run<'c>>, String> {
    let _ = ir;
    let mut mem = ExecMem::new(ctx, seed);
    let log = Rc::new(RefCell::new(Log::default()));
    let mut sym = Sym {
        markers: HashMap::new(),
        loads8: HashMap::new(),
        small: Vec::new(),
        bases: Vec::new(),
    };
    let base = 0x4_1000_0000u64 + seed as u64 * 0x2000_0000;
    let marker = |k: u64| base + k * 0x100_0000;
    let param = |reg: i32| crate::util::param_var(f, reg);
    let mut regs: Vec<u64> = Vec::new();
    for r in 1..=5 {
        regs.push(marker(r as u64));
        if let Some(id) = param(r) {
            sym.markers.insert(marker(r as u64), id);
        }
    }
    if let Some(sa) = f.stack_args.filter(|&n| n > 0) {
        regs[4] = CALLER_FP;
        for j in 0..sa {
            let v = marker(16 + j as u64);
            let _ = mem.store(CALLER_FP - 0x1000 + 8 * j as u64, 8, v);
            if let Some(id) = param(100 + j as i32) {
                sym.markers.insert(v, id);
            }
        }
    }
    let extra: Vec<u64> = [0u8, 6, 7, 8, 9]
        .iter()
        .enumerate()
        .map(|(i, &r)| {
            let v = marker(8 + i as u64);
            if f.extra_in.contains(&r) {
                if let Some(id) = param(r as i32) {
                    sym.markers.insert(v, id);
                }
            }
            v
        })
        .collect();
    mem.observer = Some(log.clone());
    let mut x = Exec::new(ctx, mem, MAX_STEPS, true);
    x.no_panic = true;
    x.loop_cap = LOOP_CAP;
    x.variant = if seed == 2 { 1 } else { 0 };
    x.flip = ctl.flip;
    x.no_flip = ctl.no_flip.clone();
    x.sticky = ctl.sticky;
    let mut h = RunHooks {
        site_pc,
        kind,
        reached: false,
        infos: None,
        cap: None,
    };
    // (flips made before the site's call: the call itself only has to reach the syscall)
    let r = x.run(&mut h, f.pc, &regs, TOP_FP, Some(site_pc), &extra)?;
    ctl.limit = r.limit;
    ctl.flipped = x.flipped_list();
    *steps += r.steps;
    let cap = h.cap.flatten();
    let Exec { mem, .. } = x;
    let Some(cap) = cap else { return Ok(None) };
    let mut mem = mem;
    mem.observer = None;
    sym.finish(&log.borrow());
    Ok(Some(Run { cap, sym, mem }))
}

/// The data of an exec model (both runs' captured bytes).
struct ExecData<'c> {
    a: Rc<RefCell<Run<'c>>>,
    b: Rc<RefCell<Run<'c>>>,
}

fn constant(x: &TB, y: &TB, o: usize, n: usize, mask: u8) -> bool {
    for i in o..o + n {
        let (tx, ty) = (*x.t.get(i).unwrap_or(&0), *y.t.get(i).unwrap_or(&0));
        if (tx | ty) & mask != 0 || x.b.get(i) != y.b.get(i) {
            return false;
        }
    }
    true
}

fn agree(ir: &Ir, a: &[E], b: &[E]) -> Option<E> {
    for &x in a {
        for &y in b {
            if json_eq(ir, x, y) {
                return Some(x);
            }
        }
    }
    None
}

fn nm(env: &CpiEnv, e: E) -> E {
    match env.named {
        Some(f) => f(e),
        None => e,
    }
}
fn exn(env: &mut CpiEnv, e: E) -> String {
    let x = nm(env, e);
    env.ex(x)
}

fn key_text(
    env: &mut CpiEnv,
    ra: &mut Run,
    rb: &mut Run,
    x: &TB,
    y: &TB,
    px: Option<u64>,
    py: Option<u64>,
) -> KeyText {
    let ir = env.ir;
    if constant(x, y, 0, 32, 1) {
        let k = b58(&x.b);
        let n = known_key(&k).map_or(format!("key {k}"), |s| s.to_string());
        return KeyText {
            text: n.clone(),
            known: Some(n),
            src: None,
        };
    }
    if let (Some(px), Some(py)) = (px, py) {
        let ea: Vec<E> = ra.sym.addr(ir, px, 0).into_iter().collect();
        let eb: Vec<E> = rb.sym.addr(ir, py, 0).into_iter().collect();
        if let Some(e) = agree(ir, &ea, &eb) {
            let text = exn(env, e);
            return KeyText {
                text,
                known: None,
                src: Some(nm(env, e)),
            };
        }
    }
    let ea: Vec<E> = ra.sym.key(ir, &mut ra.mem, &x.b).into_iter().collect();
    let eb: Vec<E> = rb.sym.key(ir, &mut rb.mem, &y.b).into_iter().collect();
    match agree(ir, &ea, &eb) {
        Some(e) => {
            let t = exn(env, e);
            KeyText {
                text: format!("*{}", wrap(&t)),
                known: None,
                src: Some(nm(env, e)),
            }
        }
        None => KeyText {
            text: "?".into(),
            known: None,
            src: None,
        },
    }
}

impl DataAt for ExecData<'_> {
    fn at(&mut self, env: &mut CpiEnv, o: N, size: u8) -> Option<E> {
        let ir = env.ir;
        let (ra, rb) = (self.a.borrow(), self.b.borrow());
        let (ad, bd) = (&ra.cap.data, &rb.cap.data);
        if o + size as N > ad.b.len() as N {
            return None;
        }
        let o = o as usize;
        let va = le(&ad.b, o, size as usize);
        let vb = le(&bd.b, o, size as usize);
        let wide = size == 8 && va >= 0x1_0000_0000 && va.count_ones() >= 16;
        if constant(ad, bd, o, size as usize, if o == 0 || wide { 1 } else { 3 }) {
            return Some(ir.c(va));
        }
        let ea = ra.sym.values(ir, va, size);
        let eb = rb.sym.values(ir, vb, size);
        agree(ir, &ea, &eb).map(|e| nm(env, e))
    }
    fn key(&mut self, env: &mut CpiEnv, o: N) -> Option<KeyText> {
        let len = self.a.borrow().cap.data.b.len();
        if o + 32.0 > len as N {
            return None;
        }
        let o = o as usize;
        let sub = |t: &TB| TB {
            b: t.b[o..o + 32].to_vec(),
            t: t.t[o..o + 32].to_vec(),
        };
        let x = sub(&self.a.borrow().cap.data);
        let y = sub(&self.b.borrow().cap.data);
        let mut ra = self.a.borrow_mut();
        let mut rb = self.b.borrow_mut();
        Some(key_text(env, &mut ra, &mut rb, &x, &y, None, None))
    }
}

/// The model with its data (the runs stay alive while the model is formatted).
pub struct ExecModel<'c> {
    pub program: KeyText,
    pub accounts: Vec<Acc>,
    pub dl: N,
    pub seeds: Option<String>,
    data: ExecData<'c>,
}

impl<'c> ExecModel<'c> {
    /// formatIx of the model
    pub fn format(mut self, env: &mut CpiEnv) -> Option<crate::cpi::CpiDesc> {
        let n = self.accounts.len() as N;
        crate::cpi::format_ix(
            IxModel {
                program: self.program,
                accounts: self.accounts,
                n_acc: Some(n),
                dl: Some(self.dl),
                data: Some(&mut self.data),
                data_text: None,
                seeds: self.seeds,
                note: Some("[exec]".into()),
            },
            env,
        )
    }
}

/// describeByExec as a model (formatted by the caller with `ExecModel::format`).
pub fn describe_model<'c>(
    ctx: &'c ProgCtx<'c>,
    f: &Func,
    site_pc: i64,
    kind: ExecSiteKind,
    env: &mut CpiEnv,
    budget: &mut ExecBudget,
) -> Option<ExecModel<'c>> {
    let mut steps = 0i64;
    let r = model0(ctx, f, site_pc, kind, env, &mut steps);
    budget.steps -= steps;
    match r {
        Ok(m) => m,
        Err(msg) => crate::util::js_throw(&msg),
    }
}

fn model0<'c>(
    ctx: &'c ProgCtx<'c>,
    f: &Func,
    site_pc: i64,
    kind: ExecSiteKind,
    env: &mut CpiEnv,
    steps: &mut i64,
) -> Result<Option<ExecModel<'c>>, String> {
    let ir = env.ir;
    let mut no_flip: HashSet<BranchKey> = HashSet::new();
    let mut b_run: Option<Run> = None;
    for _ in 0..4 {
        let used = no_flip.clone();
        let mut c = RunCtl {
            flip: true,
            no_flip: no_flip.clone(),
            sticky: Sticky::NoFlip,
            limit: false,
            flipped: Vec::new(),
        };
        b_run = run_once(ctx, ir, f, site_pc, kind, 2, &mut c, steps)?;
        if b_run.is_some() {
            no_flip = used;
            break;
        }
        if c.limit {
            return Ok(None);
        }
        if c.flipped.is_empty() {
            break;
        }
        for k in c.flipped {
            no_flip.insert(k);
        }
    }
    let mut a_run: Option<Run> = None;
    if b_run.is_some() {
        let mut c = RunCtl {
            flip: false,
            no_flip: no_flip.clone(),
            sticky: Sticky::Callees,
            limit: false,
            flipped: Vec::new(),
        };
        a_run = run_once(ctx, ir, f, site_pc, kind, 1, &mut c, steps)?;
    }
    if a_run.is_none() || b_run.is_none() {
        let mut c = RunCtl {
            flip: false,
            no_flip: no_flip.clone(),
            sticky: Sticky::All,
            limit: false,
            flipped: Vec::new(),
        };
        a_run = run_once(ctx, ir, f, site_pc, kind, 1, &mut c, steps)?;
        if a_run.is_none() {
            return Ok(None);
        }
        let mut c = RunCtl {
            flip: false,
            no_flip: no_flip.clone(),
            sticky: Sticky::All,
            limit: false,
            flipped: Vec::new(),
        };
        b_run = run_once(ctx, ir, f, site_pc, kind, 2, &mut c, steps)?;
        if b_run.is_none() {
            return Ok(None);
        }
    }
    let mut ra = a_run.unwrap();
    let mut rb = b_run.unwrap();
    {
        let (a, b) = (&ra.cap, &rb.cap);
        if a.abi_c != b.abi_c || a.metas.len() != b.metas.len() || a.data.b.len() != b.data.b.len()
        {
            return Ok(None);
        }
    }
    let (ap, bp) = (
        std::mem::replace(
            &mut ra.cap.program,
            TB {
                b: vec![],
                t: vec![],
            },
        ),
        std::mem::replace(
            &mut rb.cap.program,
            TB {
                b: vec![],
                t: vec![],
            },
        ),
    );
    let (app, bpp) = (ra.cap.program_ptr, rb.cap.program_ptr);
    let program = key_text(env, &mut ra, &mut rb, &ap, &bp, app, bpp);
    let mut accounts = Vec::new();
    let na = ra.cap.metas.len();
    for i in 0..na {
        let mk = std::mem::replace(
            &mut ra.cap.metas[i].key,
            TB {
                b: vec![],
                t: vec![],
            },
        );
        let nk = std::mem::replace(
            &mut rb.cap.metas[i].key,
            TB {
                b: vec![],
                t: vec![],
            },
        );
        let (mp, np) = (ra.cap.metas[i].ptr, rb.cap.metas[i].ptr);
        let k = key_text(env, &mut ra, &mut rb, &mk, &nk, mp, np);
        let (m, n) = (&ra.cap.metas[i], &rb.cap.metas[i]);
        let fixed = m.flags_tainted & 1 == 0 && n.flags_tainted & 1 == 0;
        accounts.push(Acc {
            text: k.known.unwrap_or(k.text),
            w: if fixed && m.w == n.w {
                Some(m.w as N)
            } else {
                None
            },
            s: if fixed && m.s == n.s {
                Some(m.s as N)
            } else {
                None
            },
        });
    }
    // signer seeds
    let seeds;
    let (sa, sb) = (ra.cap.signers.clone(), rb.cap.signers.clone());
    match (&sa, &sb) {
        (Some(x), Some(y)) if x.len() == y.len() && x.is_empty() => {
            seeds = Some("no signer seeds".to_string())
        }
        (Some(x), Some(y))
            if x.len() == y.len() && x.iter().zip(y).all(|(s, t)| s.len() == t.len()) =>
        {
            let mut list = Vec::new();
            for (i, s) in x.iter().enumerate() {
                let mut parts = Vec::new();
                for (j, sd) in s.iter().enumerate() {
                    parts.push(seed_text(env, &mut ra, &mut rb, *sd, y[i][j]));
                }
                list.push(format!("[{}]", parts.join(", ")));
            }
            seeds = Some(format!("signer seeds {}", list.join(", ")));
        }
        _ => {
            let pa: Vec<E> = ra.sym.value(ir, ra.cap.seeds_ptr, 0).into_iter().collect();
            let pb: Vec<E> = rb.sym.value(ir, rb.cap.seeds_ptr, 0).into_iter().collect();
            let pe = agree(ir, &pa, &pb);
            let le_ = if ra.cap.seeds_len == rb.cap.seeds_len {
                Some(ir.c(ra.cap.seeds_len))
            } else {
                let la: Vec<E> = ra.sym.value(ir, ra.cap.seeds_len, 0).into_iter().collect();
                let lb: Vec<E> = rb.sym.value(ir, rb.cap.seeds_len, 0).into_iter().collect();
                agree(ir, &la, &lb)
            };
            seeds = match (pe, le_) {
                (Some(pe), Some(le_)) => {
                    let a = exn(env, pe);
                    let b = exn(env, le_);
                    Some(format!("signer seeds {}[..{}]", wrap(&a), b))
                }
                _ => None,
            };
        }
    }
    let dl = ra.cap.data.b.len() as N;
    Ok(Some(ExecModel {
        program,
        accounts,
        dl,
        seeds,
        data: ExecData {
            a: Rc::new(RefCell::new(ra)),
            b: Rc::new(RefCell::new(rb)),
        },
    }))
}

fn seed_text(env: &mut CpiEnv, ra: &mut Run, rb: &mut Run, x: (u64, u64), y: (u64, u64)) -> String {
    let ir = env.ir;
    if x.1 != y.1 {
        return "?".into();
    }
    let n = x.1 as usize;
    let bx = ra.mem.read(x.0, n);
    let by = rb.mem.read(y.0, n);
    if bx == by && ra.mem.tainted(x.0, n) == 0 && rb.mem.tainted(y.0, n) == 0 {
        if n > 0 && bx.iter().all(|&c| (0x20..0x7f).contains(&c)) {
            let s: String = bx.iter().map(|&c| c as char).collect();
            return json_str(&s);
        }
        if n == 32 {
            let k = b58(&bx);
            return known_key(&k).map_or(format!("key {k}"), |s| s.to_string());
        }
        return if n <= 8 {
            format!("u{} 0x{:x}", n * 8, le(&bx, 0, n))
        } else {
            format!(
                "0x{}",
                bx.iter().map(|b| format!("{b:02x}")).collect::<String>()
            )
        };
    }
    if n == 32 {
        let ea: Vec<E> = ra.sym.key(ir, &mut ra.mem, &bx).into_iter().collect();
        let eb: Vec<E> = rb.sym.key(ir, &mut rb.mem, &by).into_iter().collect();
        if let Some(e) = agree(ir, &ea, &eb) {
            let t = exn(env, e);
            return format!("*{}", wrap(&t));
        }
    }
    if [1, 2, 4, 8].contains(&n) {
        let ea = ra.sym.values(ir, le(&bx, 0, n), n as u8);
        let eb = rb.sym.values(ir, le(&by, 0, n), n as u8);
        if let Some(e) = agree(ir, &ea, &eb) {
            let t = exn(env, e);
            return format!("u{} {t}", n * 8);
        }
        let pa: Vec<E> = ra.sym.addr(ir, x.0, 0).into_iter().collect();
        let pb: Vec<E> = rb.sym.addr(ir, y.0, 0).into_iter().collect();
        if let Some(pa) = agree(ir, &pa, &pb) {
            let l = ir.load(n as u8, pa);
            let t = exn(env, l);
            return format!("u{} {t}", n * 8);
        }
    }
    let pa: Vec<E> = ra.sym.addr(ir, x.0, 0).into_iter().collect();
    let pb: Vec<E> = rb.sym.addr(ir, y.0, 0).into_iter().collect();
    match agree(ir, &pa, &pb) {
        Some(pa) => {
            let t = exn(env, pa);
            format!("{}[..{n}]", wrap(&t))
        }
        None => format!("? ({n} bytes)"),
    }
}
