//! Concrete execution for analyses (stage 6): a port of `src/exec.ts` (the `Exec` interpreter with all
//! calls followed, syscall models, `ExecMem` paged memory with input taint, forced / flipped branches) and
//! of `callTargetName` (`src/emu.ts`). Runs only ever produce comments, names and view layouts.
//!
//! Registers are plain `u64`s here (the TS keeps int32 halves for speed; the arithmetic is the same
//! modulo 2^64). Step accounting follows the TS exactly: a frame's steps are counted when it returns,
//! aborts or runs out of steps, not when a `Stop` / `Limit` from a call ends it.

pub mod hash;

use indexmap_lite::IndexSet;
use sbpf_program::Program;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

/// Minimal insertion-ordered set (the crate avoids other dependencies).
mod indexmap_lite {
    use std::collections::HashSet;
    use std::hash::Hash;
    #[derive(Clone, Debug, Default)]
    pub struct IndexSet<T: Hash + Eq + Clone> {
        v: Vec<T>,
        s: HashSet<T>,
    }
    impl<T: Hash + Eq + Clone> IndexSet<T> {
        pub fn new() -> Self {
            IndexSet {
                v: Vec::new(),
                s: HashSet::new(),
            }
        }
        pub fn insert(&mut self, x: T) -> bool {
            if self.s.insert(x.clone()) {
                self.v.push(x);
                true
            } else {
                false
            }
        }
        pub fn contains(&self, x: &T) -> bool {
            self.s.contains(x)
        }
        pub fn len(&self) -> usize {
            self.v.len()
        }
        pub fn is_empty(&self) -> bool {
            self.v.is_empty()
        }
        pub fn clear(&mut self) {
            self.v.clear();
            self.s.clear();
        }
        pub fn iter(&self) -> std::slice::Iter<'_, T> {
            self.v.iter()
        }
    }
}

pub type BranchKey = i64;

/// Exceptions of a run: `Abort` (an expected outcome), `Limit` (out of steps / too deep), `Stop` (a hook
/// ended the run), `Fatal` (a TS runtime error: propagates out of the whole decompilation).
#[derive(Clone, Debug, PartialEq)]
pub enum Exc {
    Abort(String),
    Limit,
    Stop,
    Fatal(String),
}

pub type R<T> = Result<T, Exc>;

/// A call target as `callTargetName` names it.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum CallName {
    /// `fn:<pc>`
    Fn(i64),
    /// `sys:<name>` (v3: `sys:hash:<n>` for an unknown hash)
    Sys(String),
    /// `hash:<n>`
    Hash(u32),
}

impl CallName {
    pub fn text(&self) -> String {
        match self {
            CallName::Fn(pc) => format!("fn:{pc}"),
            CallName::Sys(n) => format!("sys:{n}"),
            CallName::Hash(h) => format!("hash:{h}"),
        }
    }
}

fn sys_by_hash(h: u32) -> String {
    match sbpf_program::syscalls::by_hash(h) {
        Some(s) => s.name.clone(),
        None => format!("hash:{h}"),
    }
}

/// callTargetName (emu.ts): the target of the call instruction at pc, independent of the lifter.
pub fn call_target_name(p: &Program, pc: i64, imm: i32) -> CallName {
    let n = p.insns.len() as i64;
    if p.version >= 3 {
        let src = p.insns.get(pc as usize).map(|i| i.src);
        if src == Some(0) {
            return CallName::Sys(sys_by_hash(imm as u32));
        }
        let t = pc + 1 + imm as i64;
        if src == Some(1) && t >= 0 && t < n {
            return CallName::Fn(t);
        }
        return CallName::Hash(imm as u32);
    }
    if let Some(r) = p.elf.call_reloc(pc) {
        return match r {
            sbpf_elf::CallReloc::Fn { target_pc, .. } => CallName::Fn(*target_pc),
            sbpf_elf::CallReloc::Syscall { name } => CallName::Sys(name.clone()),
        };
    }
    let t = pc + 1 + imm as i64;
    if imm != -1 && t >= 0 && t < n {
        return CallName::Fn(t);
    }
    CallName::Hash(imm as u32)
}

/// The exec target of a call instruction (exec.ts callTarget): a function entry, a syscall name, or
/// None (an invalid v3 call).
#[derive(Clone, Debug)]
enum Target {
    Fn(i64),
    Sys(String),
}

/// A set of instructions of one function (lo: its entry).
#[derive(Clone, Debug)]
pub struct PcSet {
    lo: i64,
    m: Vec<bool>,
}

impl PcSet {
    pub fn has(&self, pc: i64) -> bool {
        let i = pc - self.lo;
        i >= 0 && (i as usize) < self.m.len() && self.m[i as usize]
    }
}

struct Cfg {
    preds: Vec<Vec<i64>>,
    exits: Vec<i64>,
    lo: i64,
    end: i64,
}

/// Per-program state shared by all runs of a decompilation (the TS keeps these in WeakMaps keyed by the
/// program): call targets, function extents, machine-level CFGs and reachability sets, image pages.
pub struct ProgCtx<'p> {
    pub p: &'p Program,
    /// image regions in address order: (vaddr, bytes)
    regions: Vec<(u64, &'p [u8])>,
    image_pages: HashSet<u64>,
    calls: RefCell<HashMap<i64, Option<Target>>>,
    extents: RefCell<Option<HashMap<i64, i64>>>,
    cfgs: RefCell<HashMap<i64, Rc<Cfg>>>,
    reach: RefCell<HashMap<(i64, i64), Option<Rc<PcSet>>>>,
    ret: RefCell<HashMap<i64, Rc<PcSet>>>,
}

impl<'p> ProgCtx<'p> {
    pub fn new(p: &'p Program) -> Self {
        let img = p.image();
        let mut regions = Vec::new();
        let mut image_pages = HashSet::new();
        for &i in &img.order {
            let r = &p.elf.regions[i];
            let b = p.elf.region_bytes(r);
            regions.push((r.vaddr, b));
            if !b.is_empty() {
                let last = (r.vaddr as u128 + b.len() as u128 - 1) >> 12;
                let mut k = (r.vaddr >> 12) as u128;
                while k <= last {
                    image_pages.insert(k as u64);
                    k += 1;
                }
            }
        }
        ProgCtx {
            p,
            regions,
            image_pages,
            calls: RefCell::new(HashMap::new()),
            extents: RefCell::new(None),
            cfgs: RefCell::new(HashMap::new()),
            reach: RefCell::new(HashMap::new()),
            ret: RefCell::new(HashMap::new()),
        }
    }

    fn call_target(&self, pc: i64) -> Option<Target> {
        if let Some(t) = self.calls.borrow().get(&pc) {
            return t.clone();
        }
        let p = self.p;
        let ins = &p.insns[pc as usize];
        let t = if p.version >= 3 {
            match ins.src {
                0 => Some(Target::Sys(sys_by_hash(ins.imm as u32))),
                1 => Some(Target::Fn(pc + 1 + ins.imm as i64)),
                _ => None,
            }
        } else {
            Some(match call_target_name(p, pc, ins.imm) {
                CallName::Fn(t) => Target::Fn(t),
                CallName::Sys(n) => Target::Sys(n),
                CallName::Hash(h) => Target::Sys(format!("hash:{h}")),
            })
        };
        self.calls.borrow_mut().insert(pc, t.clone());
        t
    }

    /// extentOf: the first pc after the function at fpc (the next function's entry).
    pub fn extent_of(&self, fpc: i64) -> i64 {
        let mut e = self.extents.borrow_mut();
        let m = e.get_or_insert_with(|| {
            let mut starts: Vec<i64> = self.p.funcs.keys().copied().collect();
            starts.sort();
            let mut m = HashMap::new();
            for (i, &s) in starts.iter().enumerate() {
                m.insert(
                    s,
                    starts
                        .get(i + 1)
                        .copied()
                        .unwrap_or(self.p.insns.len() as i64),
                );
            }
            m
        });
        m.get(&fpc).copied().unwrap_or(self.p.insns.len() as i64)
    }

    fn cfg_of(&self, fpc: i64) -> R<Rc<Cfg>> {
        if let Some(c) = self.cfgs.borrow().get(&fpc) {
            return Ok(c.clone());
        }
        let p = self.p;
        let end = self.extent_of(fpc);
        let v3 = p.version >= 3;
        let no_lddw = p.version == 2;
        let n = (end - fpc).max(0) as usize;
        let mut preds: Vec<Vec<i64>> = vec![Vec::new(); n];
        let mut exits = Vec::new();
        let mut edge = |a: i64, b: i64| {
            if b < fpc || b >= end {
                return;
            }
            preds[(b - fpc) as usize].push(a);
        };
        let mut pc = fpc;
        while pc < end {
            let Some(ins) = (if pc >= 0 {
                p.insns.get(pc as usize)
            } else {
                None
            }) else {
                return Err(Exc::Fatal(
                    "Cannot read properties of undefined (reading 'opc')".into(),
                ));
            };
            let cls = ins.opc & 7;
            let code = ins.opc >> 4;
            if ins.opc == 0x18 && !no_lddw {
                edge(pc, pc + 2);
                pc += 2;
                continue;
            }
            if ins.opc == 0x95 || ins.opc == 0x9d {
                exits.push(pc);
                pc += 1;
                continue;
            }
            if ins.opc == 0x05 {
                edge(pc, pc + 1 + ins.off as i64);
                pc += 1;
                continue;
            }
            if ins.opc == 0x85 {
                let noret = match call_target_name(p, pc, ins.imm) {
                    CallName::Fn(t) => p.funcs.get(&t).is_some_and(|f| f.noreturn),
                    CallName::Sys(s) => s == "abort" || s == "sol_panic_",
                    CallName::Hash(_) => false,
                };
                if !noret {
                    edge(pc, pc + 1);
                }
                pc += 1;
                continue;
            }
            if (cls == 5 || (v3 && cls == 6)) && JCC[code as usize] && ins.opc != 0x8d {
                edge(pc, pc + 1);
                edge(pc, pc + 1 + ins.off as i64);
                pc += 1;
                continue;
            }
            edge(pc, pc + 1);
            pc += 1;
        }
        let c = Rc::new(Cfg {
            preds,
            exits,
            lo: fpc,
            end,
        });
        self.cfgs.borrow_mut().insert(fpc, c.clone());
        Ok(c)
    }

    fn backward(g: &Cfg, seeds: &[i64]) -> PcSet {
        let mut m = vec![false; g.preds.len()];
        let mut q = Vec::new();
        for &s in seeds {
            let i = (s - g.lo) as usize;
            if !m[i] {
                m[i] = true;
                q.push(s);
            }
        }
        while let Some(x) = q.pop() {
            for &y in &g.preds[(x - g.lo) as usize] {
                let i = (y - g.lo) as usize;
                if !m[i] {
                    m[i] = true;
                    q.push(y);
                }
            }
        }
        PcSet { lo: g.lo, m }
    }

    /// reaching: instructions of the function at fpc from which `target` can be reached.
    pub fn reaching(&self, fpc: i64, target: i64) -> R<Option<Rc<PcSet>>> {
        if let Some(r) = self.reach.borrow().get(&(fpc, target)) {
            return Ok(r.clone());
        }
        let g = self.cfg_of(fpc)?;
        let r = if target < fpc || target >= g.end {
            None
        } else {
            Some(Rc::new(Self::backward(&g, &[target])))
        };
        self.reach.borrow_mut().insert((fpc, target), r.clone());
        Ok(r)
    }

    /// returning: instructions of the function at fpc from which it can return.
    pub fn returning(&self, fpc: i64) -> R<Rc<PcSet>> {
        if let Some(r) = self.ret.borrow().get(&fpc) {
            return Ok(r.clone());
        }
        let g = self.cfg_of(fpc)?;
        let r = Rc::new(Self::backward(&g, &g.exits));
        self.ret.borrow_mut().insert(fpc, r.clone());
        Ok(r)
    }
}

const JCC: [bool; 16] = [
    false, true, true, true, true, true, true, true, false, false, true, true, true, true, false,
    false,
];
const LD: u8 = 16;
const STI: u8 = 32;
const STX: u8 = 64;

fn mem_table(v2: bool) -> [u8; 256] {
    let mut t = [0u8; 256];
    let v0: [(u8, u8); 12] = [
        (0x71, LD | 1),
        (0x69, LD | 2),
        (0x61, LD | 4),
        (0x79, LD | 8),
        (0x72, STI | 1),
        (0x6a, STI | 2),
        (0x62, STI | 4),
        (0x7a, STI | 8),
        (0x73, STX | 1),
        (0x6b, STX | 2),
        (0x63, STX | 4),
        (0x7b, STX | 8),
    ];
    let v2t: [(u8, u8); 12] = [
        (0x2c, LD | 1),
        (0x3c, LD | 2),
        (0x8c, LD | 4),
        (0x9c, LD | 8),
        (0x27, STI | 1),
        (0x37, STI | 2),
        (0x87, STI | 4),
        (0x97, STI | 8),
        (0x2f, STX | 1),
        (0x3f, STX | 2),
        (0x8f, STX | 4),
        (0x9f, STX | 8),
    ];
    for (o, k) in if v2 { v2t } else { v0 } {
        t[o as usize] = k;
    }
    t
}

const UNDEF: u64 = 0xdeadbeef_deadbeef;

/// The pseudo-random bytes of page k for a seed (a xorshift32 stream, little-endian words).
fn fill_bytes(seed: u32, k: u64, b: &mut [u8; 4096]) {
    let mut x: u32 =
        (k as u32) ^ ((k >> 32) as u32).wrapping_mul(0x9e3779b9) ^ seed.wrapping_mul(0x85ebca6b);
    if x == 0 {
        x = 1;
    }
    for i in 0..1024 {
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        b[i * 4..i * 4 + 4].copy_from_slice(&x.to_le_bytes());
    }
}

struct Page {
    b: Box<[u8; 4096]>,
    t: Option<Box<[u8; 4096]>>,
    t0: u8,
    ro: Option<Box<[u8; 4096]>>,
}

/// Taint written with bytes (ExecMem.write).
pub enum TaintArg<'a> {
    Keep,
    All(u8),
    Each(&'a [u8]),
}

/// Observes loads (address, size, value) and memcpy sources (address, bytes).
pub trait MemObserver {
    fn load(&mut self, addr: u64, size: u8, v: u64);
    fn copy(&mut self, addr: u64, b: &[u8]);
}

/// Paged memory (see exec.ts ExecMem): image bytes read-only where mapped, else pseudo-random bytes from
/// the seed (0: zeros); per-byte input taint.
pub struct ExecMem<'c> {
    ctx: &'c ProgCtx<'c>,
    fill_seed: u32,
    pages: HashMap<u64, Page>,
    pub observer: Option<Rc<RefCell<dyn MemObserver + 'c>>>,
}

impl<'c> ExecMem<'c> {
    pub fn new(ctx: &'c ProgCtx<'c>, seed: u32) -> Self {
        ExecMem {
            ctx,
            fill_seed: seed,
            pages: HashMap::new(),
            observer: None,
        }
    }
    fn page(&mut self, k: u64) -> &mut Page {
        if !self.pages.contains_key(&k) {
            let mut b = Box::new([0u8; 4096]);
            let t0 = if (0x30_0000..0x40_0000).contains(&k) {
                0
            } else {
                1
            };
            if self.fill_seed != 0 {
                fill_bytes(self.fill_seed, k, &mut b);
            }
            if k == 0x30_0000 {
                b[..8].fill(0);
            }
            let mut t: Option<Box<[u8; 4096]>> = None;
            let mut ro: Option<Box<[u8; 4096]>> = None;
            if self.ctx.image_pages.contains(&k) {
                let base = k as u128 * 4096;
                for &(vaddr, bytes) in &self.ctx.regions {
                    let rend = vaddr as u128 + bytes.len() as u128;
                    let lo = (vaddr as u128).max(base);
                    let hi = rend.min(base + 4096);
                    if lo >= hi {
                        continue;
                    }
                    let ro = ro.get_or_insert_with(|| Box::new([0u8; 4096]));
                    let o = (lo - base) as usize;
                    let n = (hi - lo) as usize;
                    let so = (lo - vaddr as u128) as usize;
                    b[o..o + n].copy_from_slice(&bytes[so..so + n]);
                    let t = t.get_or_insert_with(|| Box::new([t0; 4096]));
                    t[o..o + n].fill(0);
                    ro[o..o + n].fill(1);
                }
            }
            self.pages.insert(k, Page { b, t, t0, ro });
        }
        self.pages.get_mut(&k).unwrap()
    }
    pub fn byte(&mut self, a: u64) -> u8 {
        self.page(a >> 12).b[(a & 0xfff) as usize]
    }
    /// ldN: a load of `size` bytes (observed).
    pub fn ld(&mut self, a: u64, size: u8) -> u64 {
        let o = (a & 0xfff) as usize;
        let v = if o + size as usize <= 4096 {
            let pg = self.page(a >> 12);
            let mut v = 0u64;
            for i in (0..size as usize).rev() {
                v = (v << 8) | pg.b[o + i] as u64;
            }
            v
        } else {
            self.read_u(a, size as usize)
        };
        if let Some(ob) = &self.observer {
            ob.borrow_mut().load(a, size, v);
        }
        v
    }
    /// load (TestMem API): an observed load.
    pub fn load(&mut self, a: u64, size: u8) -> u64 {
        self.ld(a, size)
    }
    pub fn store(&mut self, a: u64, size: u8, v: u64) -> R<()> {
        let o = (a & 0xfff) as usize;
        let n = size as usize;
        if o + n <= 4096 {
            let pg = self.page(a >> 12);
            if let Some(ro) = &pg.ro {
                if ro[o..o + n].iter().any(|&x| x != 0) {
                    return Err(Exc::Abort("store to read-only memory".into()));
                }
            }
            pg.b[o..o + n].copy_from_slice(&v.to_le_bytes()[..n]);
            return Ok(());
        }
        for i in 0..n {
            let x = a.wrapping_add(i as u64);
            let pg = self.page(x >> 12);
            let k = (x & 0xfff) as usize;
            if pg.ro.as_ref().is_some_and(|r| r[k] != 0) {
                return Err(Exc::Abort("store to read-only memory".into()));
            }
            pg.b[k] = (v >> (8 * i)) as u8;
        }
        Ok(())
    }
    /// raw bytes (no load observation)
    pub fn read(&mut self, a: u64, n: usize) -> Vec<u8> {
        let mut out = vec![0u8; n];
        let mut i = 0;
        while i < n {
            let x = a.wrapping_add(i as u64);
            let k = (x & 0xfff) as usize;
            let c = (n - i).min(4096 - k);
            let pg = self.page(x >> 12);
            out[i..i + c].copy_from_slice(&pg.b[k..k + c]);
            i += c;
        }
        out
    }
    pub fn read_u(&mut self, a: u64, size: usize) -> u64 {
        let mut v = 0u64;
        for i in (0..size).rev() {
            v = (v << 8) | self.byte(a.wrapping_add(i as u64)) as u64;
        }
        v
    }
    pub fn write(&mut self, a: u64, b: &[u8], taint: TaintArg) {
        let mut i = 0;
        while i < b.len() {
            let x = a.wrapping_add(i as u64);
            let k = (x & 0xfff) as usize;
            let c = (b.len() - i).min(4096 - k);
            let pg = self.page(x >> 12);
            pg.b[k..k + c].copy_from_slice(&b[i..i + c]);
            match taint {
                TaintArg::Keep => {}
                TaintArg::All(t) => {
                    if pg.t.is_some() || t != pg.t0 {
                        let t0 = pg.t0;
                        pg.t.get_or_insert_with(|| Box::new([t0; 4096]))[k..k + c].fill(t);
                    }
                }
                TaintArg::Each(ts) => {
                    let t0 = pg.t0;
                    pg.t.get_or_insert_with(|| Box::new([t0; 4096]))[k..k + c]
                        .copy_from_slice(&ts[i..i + c]);
                }
            }
            i += c;
        }
    }
    /// the taint of n bytes
    pub fn taint_arr(&mut self, a: u64, n: usize) -> Vec<u8> {
        let mut out = vec![0u8; n];
        let mut i = 0;
        while i < n {
            let x = a.wrapping_add(i as u64);
            let k = (x & 0xfff) as usize;
            let c = (n - i).min(4096 - k);
            let pg = self.page(x >> 12);
            match &pg.t {
                Some(t) => out[i..i + c].copy_from_slice(&t[k..k + c]),
                None => out[i..i + c].fill(pg.t0),
            }
            i += c;
        }
        out
    }
    pub fn tainted(&mut self, a: u64, n: usize) -> u8 {
        let mut t = 0u8;
        let mut i = 0;
        while i < n {
            let x = a.wrapping_add(i as u64);
            let k = (x & 0xfff) as usize;
            let c = (n - i).min(4096 - k);
            let pg = self.page(x >> 12);
            match &pg.t {
                Some(tt) => {
                    for &y in &tt[k..k + c] {
                        t |= y;
                    }
                }
                None => {
                    if c > 0 {
                        t |= pg.t0
                    }
                }
            }
            i += c;
        }
        t
    }
    pub fn set_taint(&mut self, a: u64, n: usize, t: u8) {
        let mut i = 0;
        while i < n {
            let x = a.wrapping_add(i as u64);
            let k = (x & 0xfff) as usize;
            let c = (n - i).min(4096 - k);
            let pg = self.page(x >> 12);
            if pg.t.is_some() || t != pg.t0 {
                let t0 = pg.t0;
                pg.t.get_or_insert_with(|| Box::new([t0; 4096]))[k..k + c].fill(t);
            }
            i += c;
        }
    }
}

/// Which branches' control taint sticks (Exec.sticky).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Sticky {
    NoFlip,
    All,
    Callees,
}

#[derive(Clone, Debug, Default)]
pub struct ExecResult {
    pub ret: Option<u64>,
    pub abort: Option<String>,
    pub steps: i64,
    pub limit: bool,
    pub stopped: bool,
}

/// Hooks of a run: before each call (the caller's registers may be changed), and syscalls (a result, or
/// None for the models below; `Err(Exc::Stop)` ends the run).
pub trait Hooks {
    fn on_call(&mut self, _x: &mut Exec, _cpc: i64, _depth: u32, _regs: &mut [u64; 16]) {}
    fn on_syscall(&mut self, _x: &mut Exec, _name: &str, _a: &[u64; 5]) -> R<Option<u64>> {
        Ok(None)
    }
}

pub struct NoHooks;
impl Hooks for NoHooks {}

/// Runs functions with all calls followed (exec.ts Exec).
pub struct Exec<'c> {
    pub ctx: &'c ProgCtx<'c>,
    pub mem: ExecMem<'c>,
    pub steps: i64,
    pub max_steps: i64,
    pub max_depth: u32,
    pub taint: bool,
    pub no_panic: bool,
    pub flip: bool,
    pub no_flip: HashSet<BranchKey>,
    pub blamed: bool,
    pub flipped: IndexSet<BranchKey>,
    flip_log: Vec<BranchKey>,
    pub sticky: Sticky,
    pub loop_cap: u32,
    branch_count: HashMap<BranchKey, u32>,
    capped: HashSet<BranchKey>,
    pub variant: u32,
    pda_calls: u32,
    force: Option<Rc<PcSet>>,
    ret: u64,
    ret_t: u8,
    mem_v0: [u8; 256],
    mem_v2: [u8; 256],
}

impl<'c> Exec<'c> {
    pub fn new(ctx: &'c ProgCtx<'c>, mem: ExecMem<'c>, max_steps: i64, taint: bool) -> Self {
        Exec {
            ctx,
            mem,
            steps: 0,
            max_steps,
            max_depth: 24,
            taint,
            no_panic: false,
            flip: false,
            no_flip: HashSet::new(),
            blamed: false,
            flipped: IndexSet::new(),
            flip_log: Vec::new(),
            sticky: Sticky::NoFlip,
            loop_cap: 0,
            branch_count: HashMap::new(),
            capped: HashSet::new(),
            variant: 0,
            pda_calls: 0,
            force: None,
            ret: 0,
            ret_t: 0,
            mem_v0: mem_table(false),
            mem_v2: mem_table(true),
        }
    }

    pub fn flipped_list(&self) -> Vec<BranchKey> {
        self.flipped.iter().copied().collect()
    }

    /// Run the function at `pc` (see exec.ts run). `Err` only for a fatal (TS runtime) error.
    pub fn run(
        &mut self,
        h: &mut dyn Hooks,
        pc: i64,
        args: &[u64],
        fp: u64,
        target: Option<i64>,
        extra_in: &[u64],
    ) -> Result<ExecResult, String> {
        let start = self.steps;
        let reach = match target {
            Some(t) => match self.ctx.reaching(pc, t) {
                Ok(r) => r,
                Err(Exc::Fatal(m)) => return Err(m),
                Err(_) => None,
            },
            None => None,
        };
        self.force = reach;
        self.flipped.clear();
        self.flip_log.clear();
        self.blamed = false;
        self.branch_count.clear();
        self.capped.clear();
        let mut regs = [0u64; 16];
        for i in 0..5 {
            regs[i + 1] = args.get(i).copied().unwrap_or(0);
        }
        regs[0] = extra_in.first().copied().unwrap_or(0);
        for (k, r) in [6usize, 7, 8, 9].iter().enumerate() {
            regs[*r] = extra_in.get(k + 1).copied().unwrap_or(0);
        }
        regs[10] = fp;
        let mut rt = [0u8; 16];
        rt[..10].fill(1);
        let taint = self.taint;
        let r = self.frame(
            h,
            pc,
            0,
            fp,
            &mut regs,
            if taint { Some(&mut rt) } else { None },
            0,
        );
        let steps = self.steps - start;
        match r {
            Ok(()) => Ok(ExecResult {
                ret: Some(self.ret),
                steps,
                ..Default::default()
            }),
            Err(Exc::Stop) => Ok(ExecResult {
                stopped: true,
                steps,
                ..Default::default()
            }),
            Err(Exc::Abort(m)) => Ok(ExecResult {
                abort: Some(m),
                steps,
                ..Default::default()
            }),
            Err(Exc::Limit) => Ok(ExecResult {
                limit: true,
                steps,
                ..Default::default()
            }),
            Err(Exc::Fatal(m)) => Err(m),
        }
    }

    fn forced(&self, reach: Option<&PcSet>, pc: i64) -> bool {
        match reach {
            Some(r) => {
                let off = self.ctx.p.insns[pc as usize].off as i64;
                r.has(pc + 1 + off) != r.has(pc + 1)
            }
            None => false,
        }
    }

    fn sticky_at(&self, fpc: i64, depth: u32, reach: Option<&PcSet>, pc: i64) -> bool {
        let k = fpc * 0x400_0000 + pc;
        !self.forced(reach, pc)
            && (self.sticky == Sticky::All
                || (self.sticky == Sticky::Callees && depth > 0)
                || self.no_flip.contains(&k)
                || self.capped.contains(&k))
    }

    fn branch(
        &mut self,
        fpc: i64,
        depth: u32,
        reach: Option<&PcSet>,
        pc: i64,
        taken: bool,
        tainted: bool,
    ) -> bool {
        if self.forced(reach, pc) {
            let off = self.ctx.p.insns[pc as usize].off as i64;
            let dir = reach.unwrap().has(pc + 1 + off);
            if depth == 0 {
                if dir != taken && !self.flip_log.is_empty() {
                    for k in self.flip_log.clone() {
                        self.no_flip.insert(k);
                    }
                    self.blamed = true;
                }
                if dir == taken {
                    self.flip_log.clear();
                }
            }
            return dir;
        }
        let k = fpc * 0x400_0000 + pc;
        if self.loop_cap != 0 && tainted {
            let n = self.branch_count.get(&k).copied().unwrap_or(0) + 1;
            self.branch_count.insert(k, n);
            if n > self.loop_cap {
                self.capped.insert(k);
                return !taken;
            }
        }
        if self.flip && tainted && !self.flipped.contains(&k) && !self.no_flip.contains(&k) {
            self.flipped.insert(k);
            self.flip_log.push(k);
            return !taken;
        }
        taken
    }

    #[allow(clippy::too_many_arguments)]
    fn frame(
        &mut self,
        h: &mut dyn Hooks,
        fpc: i64,
        depth: u32,
        fp: u64,
        regs: &mut [u64; 16],
        mut rt: Option<&mut [u8; 16]>,
        base: u8,
    ) -> R<()> {
        let budget = self.max_steps - self.steps;
        if budget <= 0 || depth > self.max_depth {
            return Err(Exc::Limit);
        }
        let p = self.ctx.p;
        let reach: Option<Rc<PcSet>> = if depth == 0 && self.force.is_some() {
            self.force.clone()
        } else if self.no_panic {
            Some(self.ctx.returning(fpc)?)
        } else {
            None
        };
        let reach = reach.as_deref();
        let v = p.version;
        let v2 = v == 2;
        let (pqr, sx, swap_sub, no_neg, no_lddw, no_le, mov_mem) = (v2, v2, v2, v2, v2, v2, v2);
        let jmp32 = v >= 3;
        let mem_t = if mov_mem { self.mem_v2 } else { self.mem_v0 };
        let mut ctl: u8 = if rt.is_some() { base } else { 0 };
        let mut steps: i64 = 0;
        let mut limit = false;
        let mut pc = fpc;
        let n = p.insns.len() as i64;
        let res: R<()> = (|| {
            loop {
                steps += 1;
                if steps > budget {
                    limit = true;
                    return Ok(());
                }
                if pc < 0 || pc >= n {
                    return Err(Exc::Abort("pc out of text".into()));
                }
                let ins = p.insns[pc as usize];
                let o = ins.opc;
                let (dst, src) = (ins.dst as usize, ins.src as usize);
                let imm = ins.imm;
                let imm64 = imm as i64 as u64;
                let cls = o & 7;
                let op0 = o & 0xf0;
                let is_reg = o & 8 != 0;
                let (d, s) = (regs[dst], regs[src]);
                let off64 = ins.off as i64 as u64;
                let mut next = pc + 1;
                let mt = mem_t[o as usize];
                let mut tv: i32 = -1;
                if let Some(rt) = rt.as_deref_mut() {
                    let rs = if is_reg { rt[src] } else { 0 };
                    if mt & LD != 0 {
                        tv = (self.mem.tainted(s.wrapping_add(off64), (mt & 15) as usize)
                            | rt[src]
                            | ctl) as i32;
                    } else if mt & STI != 0 {
                        self.mem
                            .set_taint(d.wrapping_add(off64), (mt & 15) as usize, ctl);
                    } else if mt & STX != 0 {
                        self.mem.set_taint(
                            d.wrapping_add(off64),
                            (mt & 15) as usize,
                            rt[src] | ctl,
                        );
                    } else if o == 0x18 && !no_lddw {
                        tv = ctl as i32;
                    } else if pqr && cls == 6 {
                        tv = (rt[dst] | rs | ctl) as i32;
                    } else if cls == 4 || cls == 7 {
                        tv = (if op0 == 0xb0 {
                            rs
                        } else if op0 == 0x80 || op0 == 0xd0 {
                            rt[dst]
                        } else {
                            rt[dst] | rs
                        } | ctl) as i32;
                    } else if (cls == 5 || (jmp32 && cls == 6))
                        && !matches!(o, 0x05 | 0x85 | 0x8d | 0x95 | 0x9d)
                        && (rt[dst] | rs) & 1 != 0
                        && self.sticky_at(fpc, depth, reach, pc)
                    {
                        ctl = 2;
                    }
                }
                if mt != 0 {
                    let size = mt & 15;
                    if mt & LD != 0 {
                        regs[dst] = self.mem.ld(s.wrapping_add(off64), size);
                    } else {
                        let val = if mt & STI != 0 { imm64 } else { s };
                        self.mem.store(d.wrapping_add(off64), size, val)?;
                    }
                } else {
                    let dl = d as u32;
                    let sl = s as u32;
                    let immu = imm as u32;
                    let ext32 = |x: u32| if sx { x as u64 } else { x as i32 as i64 as u64 };
                    let divz = |x: u64| {
                        if x == 0 {
                            Err(Exc::Abort("division by zero".into()))
                        } else {
                            Ok(())
                        }
                    };
                    let r: Option<u64> = match o {
                        0x18 => {
                            if no_lddw {
                                None
                            } else {
                                let Some(nx) = p.insns.get(pc as usize + 1) else {
                                    return Err(Exc::Fatal(
                                        "Cannot read properties of undefined (reading 'imm')"
                                            .into(),
                                    ));
                                };
                                next = pc + 2;
                                Some(((nx.imm as u32 as u64) << 32) | immu as u64)
                            }
                        }
                        0x04 => Some(ext32(dl.wrapping_add(immu))),
                        0x0c => Some(ext32(dl.wrapping_add(sl))),
                        0x14 => Some(ext32(if swap_sub {
                            immu.wrapping_sub(dl)
                        } else {
                            dl.wrapping_sub(immu)
                        })),
                        0x1c => Some(ext32(dl.wrapping_sub(sl))),
                        0x24 if !pqr => Some((dl as i32).wrapping_mul(imm) as i64 as u64),
                        0x2c if !pqr => Some((dl as i32).wrapping_mul(sl as i32) as i64 as u64),
                        0x34 if !pqr => {
                            divz(immu as u64)?;
                            Some((dl / immu) as u64)
                        }
                        0x3c if !pqr => {
                            divz(sl as u64)?;
                            Some((dl / sl) as u64)
                        }
                        0x44 => Some((dl | immu) as u64),
                        0x4c => Some((dl | sl) as u64),
                        0x54 => Some((dl & immu) as u64),
                        0x5c => Some((dl & sl) as u64),
                        0x64 => Some((dl << (immu & 31)) as u64),
                        0x6c => Some((dl << (sl & 31)) as u64),
                        0x74 => Some((dl >> (immu & 31)) as u64),
                        0x7c => Some((dl >> (sl & 31)) as u64),
                        0x84 if !no_neg => Some(dl.wrapping_neg() as u64),
                        0x94 if !pqr => {
                            divz(immu as u64)?;
                            Some((dl % immu) as u64)
                        }
                        0x9c if !pqr => {
                            divz(sl as u64)?;
                            Some((dl % sl) as u64)
                        }
                        0xa4 => Some((dl ^ immu) as u64),
                        0xac => Some((dl ^ sl) as u64),
                        0xb4 => Some(immu as u64),
                        0xbc => Some(if sx {
                            sl as i32 as i64 as u64
                        } else {
                            sl as u64
                        }),
                        0xc4 => Some(((dl as i32) >> (immu & 31)) as u32 as u64),
                        0xcc => Some(((dl as i32) >> (sl & 31)) as u32 as u64),
                        0xd4 if !no_le => match imm {
                            16 => Some(d & 0xffff),
                            32 => Some(d & 0xffff_ffff),
                            64 => Some(d),
                            _ => return Err(Exc::Abort("invalid le".into())),
                        },
                        0xdc => match imm {
                            16 => Some((((dl & 0xff) << 8) | ((dl >> 8) & 0xff)) as u64),
                            32 => Some(dl.swap_bytes() as u64),
                            64 => Some(d.swap_bytes()),
                            _ => return Err(Exc::Abort("invalid be".into())),
                        },
                        0x07 => Some(d.wrapping_add(imm64)),
                        0x0f => Some(d.wrapping_add(s)),
                        0x17 => Some(if swap_sub {
                            imm64.wrapping_sub(d)
                        } else {
                            d.wrapping_sub(imm64)
                        }),
                        0x1f => Some(d.wrapping_sub(s)),
                        0x27 if !pqr => Some(d.wrapping_mul(imm64)),
                        0x2f if !pqr => Some(d.wrapping_mul(s)),
                        0x37 | 0x3f | 0x97 | 0x9f if !pqr => {
                            let b = if o & 8 != 0 { s } else { imm64 };
                            divz(b)?;
                            Some(if o == 0x37 || o == 0x3f { d / b } else { d % b })
                        }
                        0x47 => Some(d | imm64),
                        0x4f => Some(d | s),
                        0x57 => Some(d & imm64),
                        0x5f => Some(d & s),
                        0x67 => Some(d << (immu & 63)),
                        0x6f => Some(d << (sl & 63)),
                        0x77 => Some(d >> (immu & 63)),
                        0x7f => Some(d >> (sl & 63)),
                        0x87 if !no_neg => Some(d.wrapping_neg()),
                        0xa7 => Some(d ^ imm64),
                        0xaf => Some(d ^ s),
                        0xb7 => Some(imm64),
                        0xbf => Some(s),
                        0xc7 => Some(((d as i64) >> (immu & 63)) as u64),
                        0xcf => Some(((d as i64) >> (sl & 63)) as u64),
                        0xf7 if no_lddw => Some(d | ((immu as u64) << 32)),
                        _ => None,
                    };
                    let r = match r {
                        None if pqr && cls == 6 => Some(pqr_op(o, d, s, imm)?),
                        r => r,
                    };
                    if let Some(r) = r {
                        regs[dst] = r;
                    } else if o == 0x05 {
                        next = pc + 1 + ins.off as i64;
                    } else if (cls == 5
                        && JCC[(o >> 4) as usize]
                        && !matches!(o, 0x85 | 0x8d | 0x95 | 0x9d))
                        || (jmp32 && cls == 6 && JCC[(o >> 4) as usize])
                    {
                        let b = if is_reg { s } else { imm64 };
                        let t = if cls == 5 {
                            let (sd, sb) = (d as i64, b as i64);
                            match o >> 4 {
                                1 => d == b,
                                2 => d > b,
                                3 => d >= b,
                                4 => d & b != 0,
                                5 => d != b,
                                6 => sd > sb,
                                7 => sd >= sb,
                                0xa => d < b,
                                0xb => d <= b,
                                0xc => sd < sb,
                                _ => sd <= sb,
                            }
                        } else {
                            let (x, y) = (d as u32, b as u32);
                            let (sx32, sy32) = (x as i32, y as i32);
                            match o >> 4 {
                                1 => x == y,
                                2 => x > y,
                                3 => x >= y,
                                4 => x & y != 0,
                                5 => x != y,
                                6 => sx32 > sy32,
                                7 => sx32 >= sy32,
                                0xa => x < y,
                                0xb => x <= y,
                                0xc => sx32 < sy32,
                                _ => sx32 <= sy32,
                            }
                        };
                        let tainted = match rt.as_deref() {
                            Some(rt) => (rt[dst] | if is_reg { rt[src] } else { 0 }) != 0,
                            None => false,
                        };
                        if self.branch(fpc, depth, reach, pc, t, tainted) {
                            next = pc + 1 + ins.off as i64;
                        }
                    } else if o == 0x85 || o == 0x8d {
                        let t = if o == 0x85 {
                            match self.ctx.call_target(pc) {
                                Some(t) => t,
                                None => return Err(Exc::Abort("invalid call".into())),
                            }
                        } else {
                            let reg = if v == 2 {
                                src as i64
                            } else if v >= 3 {
                                dst as i64
                            } else {
                                imm as i64
                            };
                            if !(0..=10).contains(&reg) {
                                return Err(Exc::Fatal("callx: no such register".into()));
                            }
                            let addr = regs[reg as usize];
                            let off = addr as i128 - p.text_vaddr as i128;
                            if off < 0 || off % 8 != 0 || off / 8 >= p.insns.len() as i128 {
                                // (resolved in call(): 'bad indirect call' after the onCall hook)
                                Target::Sys(format!("\u{0}ptr:{addr:x}"))
                            } else {
                                Target::Fn((off / 8) as i64)
                            }
                        };
                        let indirect_bad = matches!(&t, Target::Sys(n) if n.starts_with('\u{0}'));
                        self.call(h, t, indirect_bad, pc, fp, depth, regs, rt.as_deref(), ctl)?;
                        regs[0] = self.ret;
                        if let Some(rt) = rt.as_deref_mut() {
                            rt[0] = self.ret_t | ctl;
                            rt[1..=5].fill(1);
                        }
                        regs[1..=5].fill(UNDEF);
                    } else if o == 0x95 {
                        self.ret = regs[0];
                        self.ret_t = match rt.as_deref() {
                            Some(rt) => rt[0] | ctl,
                            None => 1,
                        };
                        return Ok(());
                    } else {
                        return Err(Exc::Abort(format!("invalid instruction 0x{o:x}")));
                    }
                }
                if tv >= 0 {
                    if let Some(rt) = rt.as_deref_mut() {
                        rt[dst] = tv as u8;
                    }
                }
                pc = next;
            }
        })();
        match res {
            Ok(()) => {
                self.steps += steps;
                if limit {
                    return Err(Exc::Limit);
                }
                Ok(())
            }
            Err(Exc::Abort(m)) => {
                self.steps += steps;
                Err(Exc::Abort(m))
            }
            Err(e) => Err(e),
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn call(
        &mut self,
        h: &mut dyn Hooks,
        t: Target,
        indirect_bad: bool,
        cpc: i64,
        fp: u64,
        depth: u32,
        regs: &mut [u64; 16],
        rt: Option<&[u8; 16]>,
        ctl: u8,
    ) -> R<()> {
        h.on_call(self, cpc, depth, regs);
        if indirect_bad {
            return Err(Exc::Abort("bad indirect call".into()));
        }
        match t {
            Target::Fn(target) => {
                let mut c = [0u64; 16];
                c[1..=5].copy_from_slice(&regs[1..=5]);
                let cfp = fp.wrapping_add(0x2000);
                c[10] = cfp;
                match rt {
                    Some(rt) => {
                        let mut crt = [0u8; 16];
                        crt[..10].fill(1);
                        crt[1..=5].copy_from_slice(&rt[1..=5]);
                        self.frame(h, target, depth + 1, cfp, &mut c, Some(&mut crt), ctl)
                    }
                    None => self.frame(h, target, depth + 1, cfp, &mut c, None, 0),
                }
            }
            Target::Sys(name) => {
                let a = [regs[1], regs[2], regs[3], regs[4], regs[5]];
                let r = match h.on_syscall(self, &name, &a)? {
                    Some(v) => v,
                    None => {
                        let at = match rt {
                            Some(rt) => [rt[1], rt[2], rt[3], rt[4], rt[5]],
                            None => [1; 5],
                        };
                        self.syscall(&name, &a, &at)?
                    }
                };
                self.ret = r;
                self.ret_t = ctl;
                Ok(())
            }
        }
    }

    /// n pseudo-random bytes (tainted): outputs of the environment (sysvars)
    fn opaque(&mut self, addr: u64, n: usize) {
        let src = 0x7_0000_0000u64 + (addr & 0xffff_fff8);
        let b = self.mem.read(src, n);
        self.mem.write(addr, &b, TaintArg::All(1));
    }

    /// Syscall models (exec.ts syscall). `at`: taint of the argument registers.
    pub fn syscall(&mut self, name: &str, a: &[u64; 5], at: &[u8; 5]) -> R<u64> {
        let n = (a[2] & 0xffff_ffff) as usize;
        let m = &mut self.mem;
        match name {
            "abort" | "sol_panic_" => Err(Exc::Abort(name.into())),
            "sol_memcpy_" | "sol_memmove_" => {
                if n > 1 << 20 {
                    return Err(Exc::Abort("memcpy size".into()));
                }
                let bytes = m.read(a[1], n);
                if let Some(ob) = &m.observer {
                    ob.borrow_mut().copy(a[1], &bytes);
                }
                let mut t = m.taint_arr(a[1], n);
                let x = at[1] | at[2];
                if x != 0 {
                    for y in t.iter_mut() {
                        *y |= x;
                    }
                }
                m.write(a[0], &bytes, TaintArg::Each(&t));
                Ok(0)
            }
            "sol_memset_" => {
                if n > 1 << 20 {
                    return Err(Exc::Abort("memset size".into()));
                }
                let b = vec![a[1] as u8; n];
                m.write(a[0], &b, TaintArg::All(at[1] | at[2]));
                Ok(0)
            }
            "sol_memcmp_" => {
                if n > 1 << 20 {
                    return Err(Exc::Abort("memcmp size".into()));
                }
                let x = m.read(a[0], n);
                let y = m.read(a[1], n);
                let mut r: i32 = 0;
                for i in 0..n {
                    if x[i] != y[i] {
                        r = x[i] as i32 - y[i] as i32;
                        break;
                    }
                }
                m.store(a[3], 4, r as u32 as u64)?;
                let t = m.tainted(a[0], n) | m.tainted(a[1], n) | at[0] | at[1] | at[2];
                m.set_taint(a[3], 4, t);
                Ok(0)
            }
            "sol_sha256" | "sol_keccak256" => {
                let mut parts: Vec<Vec<u8>> = Vec::new();
                let mut i = 0u64;
                while i < a[1] && i < 64 {
                    let base = a[0].wrapping_add(16 * i);
                    let ptr = m.read_u(base, 8);
                    let len = (m.read_u(base.wrapping_add(8), 8) & 0xffff) as usize;
                    parts.push(m.read(ptr, len));
                    i += 1;
                }
                let d = if name == "sol_sha256" {
                    let mut hs = hash::Sha256::new();
                    for x in &parts {
                        hs.update(x);
                    }
                    hs.digest()
                } else {
                    let refs: Vec<&[u8]> = parts.iter().map(|x| x.as_slice()).collect();
                    hash::sha3_256(&refs)
                };
                m.write(a[2], &d, TaintArg::All(1));
                Ok(0)
            }
            "sol_try_find_program_address" | "sol_create_program_address" => {
                if name == "sol_create_program_address" && self.variant == 1 {
                    let k = self.pda_calls;
                    self.pda_calls += 1;
                    if k % 2 == 0 {
                        return Ok(1);
                    }
                }
                let m = &mut self.mem;
                let mut hs = hash::Sha256::new();
                let mut i = 0u64;
                while i < a[1] && i < 17 {
                    let base = a[0].wrapping_add(16 * i);
                    let ptr = m.read_u(base, 8);
                    let len = (m.read_u(base.wrapping_add(8), 8) & 0xff) as usize;
                    hs.update(&m.read(ptr, len));
                    i += 1;
                }
                hs.update(&m.read(a[2], 32));
                m.write(a[3], &hs.digest(), TaintArg::All(1));
                if name == "sol_try_find_program_address" {
                    m.store(a[4], 1, if self.variant == 1 { 254 } else { 255 })?;
                    m.set_taint(a[4], 1, 1);
                }
                Ok(0)
            }
            "sol_get_clock_sysvar" => {
                self.opaque(a[0], 40);
                Ok(0)
            }
            "sol_get_rent_sysvar" => {
                self.opaque(a[0], 17);
                Ok(0)
            }
            "sol_get_epoch_schedule_sysvar" => {
                self.opaque(a[0], 33);
                Ok(0)
            }
            "sol_get_fees_sysvar" | "sol_get_last_restart_slot" => {
                self.opaque(a[0], 8);
                Ok(0)
            }
            "sol_get_epoch_rewards_sysvar" => {
                self.opaque(a[0], 96);
                Ok(0)
            }
            "sol_get_sysvar" => {
                self.opaque(a[1], (a[3] & 0xffff) as usize);
                Ok(0)
            }
            "sol_get_stack_height" => Ok(1),
            "sol_remaining_compute_units" => Ok(1_000_000),
            _ => Ok(0),
        }
    }
}

/// The v2 product / quotient / remainder instructions (class 6), as emu.ts.
fn pqr_op(o: u8, d: u64, s: u64, imm32: i32) -> R<u64> {
    let bad = || Err(Exc::Abort(format!("invalid instruction 0x{o:x}")));
    let immu = imm32 as i64 as u64;
    let is_imm = o & 8 == 0;
    let is64 = o & 0x10 != 0;
    let op = o & 0xe0;
    match op {
        0x80 => {
            let b = if is_imm { immu } else { s };
            Ok(if is64 {
                d.wrapping_mul(b)
            } else {
                (d as u32).wrapping_mul(b as u32) as u64
            })
        }
        0x20 => {
            if !is64 {
                return bad();
            }
            let b = if is_imm { immu & 0xffff_ffff } else { s };
            Ok(((d as u128 * b as u128) >> 64) as u64)
        }
        0xa0 => {
            if !is64 {
                return bad();
            }
            let b: i128 = if is_imm {
                imm32 as i128
            } else {
                s as i64 as i128
            };
            Ok((((d as i64 as i128) * b) >> 64) as u64)
        }
        0x40 | 0x60 => {
            let b = if is_imm { immu & 0xffff_ffff } else { s };
            if is64 {
                if b == 0 {
                    return Err(Exc::Abort("division by zero".into()));
                }
                Ok(if op == 0x40 { d / b } else { d % b })
            } else {
                let (x, y) = (d as u32, b as u32);
                if y == 0 {
                    return Err(Exc::Abort("division by zero".into()));
                }
                Ok((if op == 0x40 { x / y } else { x % y }) as u64)
            }
        }
        0xc0 | 0xe0 => {
            if is64 {
                let b: i64 = if is_imm { imm32 as i64 } else { s as i64 };
                if b == 0 {
                    return Err(Exc::Abort("division by zero".into()));
                }
                if d as i64 == i64::MIN && b == -1 {
                    return Err(Exc::Abort("division overflow".into()));
                }
                Ok((if op == 0xc0 {
                    (d as i64) / b
                } else {
                    (d as i64) % b
                }) as u64)
            } else {
                let b: i32 = if is_imm { imm32 } else { s as i32 };
                if b == 0 {
                    return Err(Exc::Abort("division by zero".into()));
                }
                if d as i32 == i32::MIN && b == -1 {
                    return Err(Exc::Abort("division overflow".into()));
                }
                Ok((if op == 0xc0 {
                    (d as i32) / b
                } else {
                    (d as i32) % b
                }) as u32 as u64)
            }
        }
        _ => bad(),
    }
}
