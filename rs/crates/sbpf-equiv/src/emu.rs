//! Reference sBPF interpreter used to verify the decompiler's output. Written independently of the
//! lifter (and of `sbpf-exec`, the decompiler's own analysis interpreter), following agave solana-sbpf
//! `interpreter.rs` instruction by instruction, with the version quirks of the declared sBPF version.
//! Calls are not followed: they are reported to a hook (stubs) so a single function can be tested.

use sbpf_elf::Image;
use sbpf_program::{syscalls, Program};
use std::collections::HashMap;

/// Value the test emulator leaves in call-clobbered registers; the evaluator maps `undef` to it.
pub const UNDEF: u64 = 0xdead_beef_dead_beef;

/// How a run stops early.
#[derive(Clone, Debug, PartialEq)]
pub enum Exc {
    /// an expected outcome of a run (a trap, a failed check of the VM)
    Abort(String),
    /// the step or event budget is exhausted
    StepLimit,
    /// access to the current frame through a pointer not derived from the frame pointer (memory-unsafe execution)
    FrameAlias,
    /// the evaluated output is outside the documented language (evaluator only)
    Eval(String),
}

pub fn abort<T>(m: &str) -> Result<T, Exc> {
    Err(Exc::Abort(m.to_string()))
}

/// An observable effect: a store to memory or a call (target id, argument values).
#[derive(Clone, Debug, PartialEq)]
pub enum Event {
    Store { addr: u64, size: u32, v: u64 },
    Call { t: String, args: Vec<u64> },
}

/// Deterministic test memory: the program image is read-only, everything else is seeded noise.
pub struct TestMem<'a> {
    pub image: Option<Image<'a>>,
    pub seed: u64,
    pub bytes: HashMap<u64, u8>,
    pub events: Vec<Event>,
    /// uninitialized memory reads as zero (makes equality tests on memory take their "equal" side)
    pub flat: bool,
    /// recording an event when this many are recorded stops the run (StepLimit)
    pub cap: usize,
}

impl<'a> TestMem<'a> {
    pub fn new(image: Option<Image<'a>>, seed: u64, flat: bool) -> Self {
        TestMem {
            image,
            seed,
            bytes: HashMap::new(),
            events: Vec::new(),
            flat,
            cap: usize::MAX,
        }
    }
    pub fn push(&mut self, e: Event) -> Result<(), Exc> {
        if self.events.len() >= self.cap {
            return Err(Exc::StepLimit);
        }
        self.events.push(e);
        Ok(())
    }
    fn noise(&self, a: u64) -> u8 {
        let mut x = a ^ self.seed.wrapping_mul(0x9e37_79b9_7f4a_7c15);
        x = (x ^ (x >> 33)).wrapping_mul(0xff51_afd7_ed55_8ccd);
        x = (x ^ (x >> 33)).wrapping_mul(0xc4ce_b9fe_1a85_ec53);
        x ^= x >> 33;
        // bias towards small bytes so lengths/indices/tags are plausible
        let b = (x & 0xff) as u8;
        if self.flat {
            0
        } else if (x >> 8) & 1 != 0 {
            b
        } else if (x >> 9) & 1 != 0 {
            0
        } else {
            b & 7
        }
    }
    fn region_of(&self, addr: u64, len: u64) -> Option<&'a sbpf_elf::Region> {
        self.image.as_ref().and_then(|i| i.region(addr, len))
    }
    pub fn byte(&self, a: u64) -> u8 {
        if let Some(&w) = self.bytes.get(&a) {
            return w;
        }
        if let (Some(img), Some(r)) = (self.image.as_ref(), self.region_of(a, 1)) {
            return img.elf.region_bytes(r)[(a - r.vaddr) as usize];
        }
        self.noise(a)
    }
    pub fn load(&self, addr: u64, size: u32) -> u64 {
        let mut v = 0u64;
        for i in (0..size as u64).rev() {
            v = (v << 8) | self.byte(addr.wrapping_add(i)) as u64;
        }
        v
    }
    pub fn store(&mut self, addr: u64, size: u32, v: u64) -> Result<(), Exc> {
        if self.region_of(addr, size as u64).is_some() {
            return abort("store to read-only memory");
        }
        let v = if size >= 8 {
            v
        } else {
            v & ((1u64 << (size * 8)) - 1)
        };
        self.push(Event::Store { addr, size, v })?;
        for i in 0..size as u64 {
            self.bytes
                .insert(addr.wrapping_add(i), (v >> (8 * i)) as u8);
        }
        Ok(())
    }
}

/// The call hook: target id (`fn:<pc>`, `sys:<name>`, `ptr:<hex>`, `hash:<n>`) and argument values → r0.
pub type CallHook<'h, 'a> = dyn FnMut(&mut TestMem<'a>, &str, Vec<u64>) -> Result<u64, Exc> + 'h;

#[derive(Clone, Debug, Default)]
pub struct EmuResult {
    pub ret: Option<u64>,
    pub abort: Option<String>,
    pub steps: usize,
    pub limit: bool,
    pub alias: bool,
}

// conditional jump codes (opc >> 4)
const fn jcc(code: u8) -> bool {
    matches!(code, 1..=7 | 0xa..=0xd)
}

const fn i32v(x: u64) -> i64 {
    x as u32 as i32 as i64
}

/// Execute one function starting at `pc` with registers r1..r5 = args, r0 and r6..r9 = `extra_in`, r10 = fp.
/// `arg_regs(t)`: the registers a call to `t` passes; `stack_args(t)`: its stack-passed argument count.
#[allow(clippy::too_many_arguments)]
pub fn emulate<'a>(
    p: &Program,
    mut pc: i64,
    args: &[u64],
    fp: u64,
    mem: &mut TestMem<'a>,
    on_call: &mut CallHook<'_, 'a>,
    max_steps: usize,
    arg_regs: &dyn Fn(&str) -> Vec<usize>,
    extra_in: &[u64],
    stack_args: &dyn Fn(&str) -> usize,
) -> EmuResult {
    let mut steps = 0usize;
    match run(
        p, &mut pc, args, fp, mem, on_call, max_steps, arg_regs, extra_in, stack_args, &mut steps,
    ) {
        Ok(Some(ret)) => EmuResult {
            ret: Some(ret),
            steps,
            ..Default::default()
        },
        Ok(None) => EmuResult {
            steps,
            limit: true,
            ..Default::default()
        },
        Err(Exc::Abort(m)) => EmuResult {
            abort: Some(m),
            steps,
            ..Default::default()
        },
        Err(Exc::StepLimit) => EmuResult {
            steps,
            limit: true,
            ..Default::default()
        },
        Err(Exc::FrameAlias) => EmuResult {
            steps,
            alias: true,
            ..Default::default()
        },
        Err(Exc::Eval(m)) => EmuResult {
            abort: Some(m),
            steps,
            ..Default::default()
        },
    }
}

#[allow(clippy::too_many_arguments)]
fn run<'a>(
    p: &Program,
    pcr: &mut i64,
    args: &[u64],
    fp: u64,
    mem: &mut TestMem<'a>,
    on_call: &mut CallHook<'_, 'a>,
    max_steps: usize,
    arg_regs: &dyn Fn(&str) -> Vec<usize>,
    extra_in: &[u64],
    stack_args: &dyn Fn(&str) -> usize,
    steps: &mut usize,
) -> Result<Option<u64>, Exc> {
    let v = p.version;
    let v2 = v == 2;
    let (pqr, sx, swap_sub, no_neg, no_lddw, no_le, mov_mem) = (v2, v2, v2, v2, v2, v2, v2);
    let static_sys = v >= 3;
    let jmp32 = v >= 3;
    let mut r = [0u64; 16];
    for i in 0..5 {
        r[i + 1] = args.get(i).copied().unwrap_or(0);
    }
    let ex = |i: usize| extra_in.get(i).copied().unwrap_or(0);
    r[0] = ex(0);
    r[6] = ex(1);
    r[7] = ex(2);
    r[8] = ex(3);
    r[9] = ex(4);
    r[10] = fp;
    let insns = &p.insns;
    // provenance: which registers hold frame-pointer-derived values
    let mut fr = [false; 16];
    fr[10] = true;
    let flo = fp.wrapping_sub(0x1000);
    let fhi = fp;
    let check_frame = |fr: &[bool; 16], base: usize, addr: u64| -> Result<(), Exc> {
        if !fr[base] && addr >= flo && addr < fhi {
            Err(Exc::FrameAlias)
        } else {
            Ok(())
        }
    };
    let sign_ext = |x: u64| -> u64 {
        if sx {
            x as u32 as u64
        } else {
            x as u32 as i32 as i64 as u64
        }
    };
    let divz = |x: u64| -> Result<(), Exc> {
        if x == 0 {
            abort("division by zero")
        } else {
            Ok(())
        }
    };
    let mut pc = *pcr;
    loop {
        *steps += 1;
        if *steps > max_steps {
            return Ok(None);
        }
        if pc < 0 || pc as usize >= insns.len() {
            return abort("pc out of text");
        }
        let ins = &insns[pc as usize];
        let dst = ins.dst as usize;
        let src = ins.src as usize;
        let imm = ins.imm as i64;
        let imm_u = imm as u64;
        let off = ins.off as i64 as u64;
        let mut next = pc + 1;
        let d = r[dst];
        let s = r[src];
        // provenance update (computed before the instruction executes)
        let opc = ins.opc;
        let cls0 = opc & 7;
        let op0 = opc & 0xf0;
        let alu64 = cls0 == 7 && !mov_mem;
        let is_reg = opc & 8 != 0;
        let mut nfr: Option<bool> = None;
        if alu64 && op0 == 0xb0 {
            nfr = Some(if is_reg { fr[src] } else { false });
        } else if alu64 && (op0 == 0x00 || op0 == 0x10) {
            nfr = Some(fr[dst] || (is_reg && fr[src]));
        } else if opc != 0x05 && cls0 != 5 && cls0 != 2 && cls0 != 3 {
            nfr = Some(false);
        }
        if mov_mem && cls0 == 7 && matches!(op0, 0x20 | 0x30 | 0x80 | 0x90) {
            nfr = None; // v2 stores
        }
        let ld =
            |r: &mut [u64; 16], fr: &[bool; 16], mem: &TestMem, size: u32| -> Result<(), Exc> {
                let a = s.wrapping_add(off);
                check_frame(fr, src, a)?;
                r[dst] = mem.load(a, size);
                Ok(())
            };
        let st = |fr: &[bool; 16], mem: &mut TestMem, size: u32, val: u64| -> Result<(), Exc> {
            let a = d.wrapping_add(off);
            check_frame(fr, dst, a)?;
            mem.store(a, size, val)
        };
        let mut handled = true;
        if !mov_mem {
            match opc {
                0x71 => ld(&mut r, &fr, mem, 1)?,
                0x69 => ld(&mut r, &fr, mem, 2)?,
                0x61 => ld(&mut r, &fr, mem, 4)?,
                0x79 => ld(&mut r, &fr, mem, 8)?,
                0x72 => st(&fr, mem, 1, imm_u)?,
                0x6a => st(&fr, mem, 2, imm_u)?,
                0x62 => st(&fr, mem, 4, imm_u)?,
                0x7a => st(&fr, mem, 8, imm_u)?,
                0x73 => st(&fr, mem, 1, s)?,
                0x6b => st(&fr, mem, 2, s)?,
                0x63 => st(&fr, mem, 4, s)?,
                0x7b => st(&fr, mem, 8, s)?,
                _ => handled = false,
            }
        } else {
            match opc {
                0x2c => ld(&mut r, &fr, mem, 1)?,
                0x3c => ld(&mut r, &fr, mem, 2)?,
                0x8c => ld(&mut r, &fr, mem, 4)?,
                0x9c => ld(&mut r, &fr, mem, 8)?,
                0x27 => st(&fr, mem, 1, imm_u)?,
                0x37 => st(&fr, mem, 2, imm_u)?,
                0x87 => st(&fr, mem, 4, imm_u)?,
                0x97 => st(&fr, mem, 8, imm_u)?,
                0x2f => st(&fr, mem, 1, s)?,
                0x3f => st(&fr, mem, 2, s)?,
                0x8f => st(&fr, mem, 4, s)?,
                0x9f => st(&fr, mem, 8, s)?,
                _ => handled = false,
            }
        }
        if !handled {
            handled = true;
            let sh32 = |x: u64| (x as u32 & 31) as u32;
            let sh64 = |x: u64| (x as u32 & 63) as u32;
            match opc {
                0x18 if !no_lddw => {
                    let hi = insns.get(pc as usize + 1).map_or(0, |i| i.imm as u32);
                    r[dst] = ((hi as u64) << 32) | (ins.imm as u32 as u64);
                    next = pc + 2;
                }
                0x04 => r[dst] = sign_ext(d.wrapping_add(imm_u)),
                0x0c => r[dst] = sign_ext(d.wrapping_add(s)),
                0x14 => {
                    r[dst] = if swap_sub {
                        sign_ext(imm_u.wrapping_sub(d))
                    } else {
                        sign_ext(d.wrapping_sub(imm_u))
                    }
                }
                0x1c => r[dst] = sign_ext(d.wrapping_sub(s)),
                0x24 if !pqr => r[dst] = (d as i32).wrapping_mul(imm as i32) as i64 as u64,
                0x2c if !pqr => r[dst] = (d as i32).wrapping_mul(s as i32) as i64 as u64,
                0x34 if !pqr => {
                    divz(imm_u as u32 as u64)?;
                    r[dst] = (d as u32 / imm_u as u32) as u64
                }
                0x3c if !pqr => {
                    divz(s as u32 as u64)?;
                    r[dst] = (d as u32 / s as u32) as u64
                }
                0x44 => r[dst] = (d | imm_u) as u32 as u64,
                0x4c => r[dst] = (d | s) as u32 as u64,
                0x54 => r[dst] = (d & imm_u) as u32 as u64,
                0x5c => r[dst] = (d & s) as u32 as u64,
                0x64 => r[dst] = ((d as u32) << sh32(imm_u)) as u64,
                0x6c => r[dst] = ((d as u32) << sh32(s)) as u64,
                0x74 => r[dst] = ((d as u32) >> sh32(imm_u)) as u64,
                0x7c => r[dst] = ((d as u32) >> sh32(s)) as u64,
                0x84 if !no_neg => r[dst] = (d as i32).wrapping_neg() as u32 as u64,
                0x94 if !pqr => {
                    divz(imm_u as u32 as u64)?;
                    r[dst] = (d as u32 % imm_u as u32) as u64
                }
                0x9c if !pqr => {
                    divz(s as u32 as u64)?;
                    r[dst] = (d as u32 % s as u32) as u64
                }
                0xa4 => r[dst] = (d ^ imm_u) as u32 as u64,
                0xac => r[dst] = (d ^ s) as u32 as u64,
                0xb4 => r[dst] = imm_u as u32 as u64,
                0xbc => {
                    r[dst] = if sx {
                        s as u32 as i32 as i64 as u64
                    } else {
                        s as u32 as u64
                    }
                }
                0xc4 => r[dst] = ((d as i32) >> sh32(imm_u)) as u32 as u64,
                0xcc => r[dst] = ((d as i32) >> sh32(s)) as u32 as u64,
                0xd4 if !no_le => {
                    r[dst] = match ins.imm {
                        16 => d & 0xffff,
                        32 => d as u32 as u64,
                        64 => d,
                        _ => return abort("invalid le"),
                    }
                }
                0xdc => {
                    let bits = ins.imm;
                    if bits != 16 && bits != 32 && bits != 64 {
                        return abort("invalid be");
                    }
                    r[dst] = match bits {
                        16 => (d as u16).swap_bytes() as u64,
                        32 => (d as u32).swap_bytes() as u64,
                        _ => d.swap_bytes(),
                    }
                }
                0x07 => r[dst] = d.wrapping_add(imm_u),
                0x0f => r[dst] = d.wrapping_add(s),
                0x17 => {
                    r[dst] = if swap_sub {
                        imm_u.wrapping_sub(d)
                    } else {
                        d.wrapping_sub(imm_u)
                    }
                }
                0x1f => r[dst] = d.wrapping_sub(s),
                0x27 if !pqr => r[dst] = d.wrapping_mul(imm_u),
                0x2f if !pqr => r[dst] = d.wrapping_mul(s),
                0x37 if !pqr => {
                    divz(imm_u)?;
                    r[dst] = d / imm_u
                }
                0x3f if !pqr => {
                    divz(s)?;
                    r[dst] = d / s
                }
                0x47 => r[dst] = d | imm_u,
                0x4f => r[dst] = d | s,
                0x57 => r[dst] = d & imm_u,
                0x5f => r[dst] = d & s,
                0x67 => r[dst] = d << sh64(imm_u),
                0x6f => r[dst] = d << sh64(s),
                0x77 => r[dst] = d >> sh64(imm_u),
                0x7f => r[dst] = d >> sh64(s),
                0x87 if !no_neg => r[dst] = d.wrapping_neg(),
                0x97 if !pqr => {
                    divz(imm_u)?;
                    r[dst] = d % imm_u
                }
                0x9f if !pqr => {
                    divz(s)?;
                    r[dst] = d % s
                }
                0xa7 => r[dst] = d ^ imm_u,
                0xaf => r[dst] = d ^ s,
                0xb7 => r[dst] = imm_u,
                0xbf => r[dst] = s,
                0xc7 => r[dst] = ((d as i64) >> sh64(imm_u)) as u64,
                0xcf => r[dst] = ((d as i64) >> sh64(s)) as u64,
                0xf7 if no_lddw => r[dst] = d | ((imm_u as u32 as u64) << 32),
                _ => handled = false,
            }
            if !handled && pqr && cls0 == 6 {
                handled = true;
                let is_imm = opc & 8 == 0;
                let is64 = opc & 0x10 != 0;
                let op = opc & 0xe0;
                match op {
                    0x80 => {
                        let b = if is_imm { imm_u } else { s };
                        r[dst] = if is64 {
                            d.wrapping_mul(b)
                        } else {
                            (d as u32).wrapping_mul(b as u32) as u64
                        }
                    }
                    0x20 if is64 => {
                        let b = if is_imm { imm_u as u32 as u64 } else { s };
                        r[dst] = ((d as u128 * b as u128) >> 64) as u64
                    }
                    0xa0 if is64 => {
                        let b = if is_imm { imm } else { s as i64 };
                        r[dst] = (((d as i64 as i128) * (b as i128)) >> 64) as u64
                    }
                    0x40 | 0x60 => {
                        let b = if is_imm { imm_u as u32 as u64 } else { s };
                        if is64 {
                            divz(b)?;
                            r[dst] = if op == 0x40 { d / b } else { d % b }
                        } else {
                            divz(b as u32 as u64)?;
                            r[dst] = if op == 0x40 {
                                (d as u32 / b as u32) as u64
                            } else {
                                (d as u32 % b as u32) as u64
                            }
                        }
                    }
                    0xc0 | 0xe0 => {
                        if is64 {
                            let b = if is_imm { imm } else { s as i64 };
                            if b == 0 {
                                return abort("division by zero");
                            }
                            if d as i64 == i64::MIN && b == -1 {
                                return abort("division overflow");
                            }
                            r[dst] = if op == 0xc0 {
                                (d as i64 / b) as u64
                            } else {
                                (d as i64 % b) as u64
                            }
                        } else {
                            let b = if is_imm { imm as i32 } else { s as i32 };
                            if b == 0 {
                                return abort("division by zero");
                            }
                            if d as i32 == i32::MIN && b == -1 {
                                return abort("division overflow");
                            }
                            r[dst] = if op == 0xc0 {
                                (d as i32 / b) as u32 as u64
                            } else {
                                (d as i32 % b) as u32 as u64
                            }
                        }
                    }
                    _ => handled = false,
                }
            }
        }
        if !handled {
            let code = opc >> 4;
            let not_call = !matches!(opc, 0x85 | 0x8d | 0x95 | 0x9d);
            if opc == 0x05 {
                next = pc + 1 + ins.off as i64;
            } else if cls0 == 5 && jcc(code) && not_call {
                let b = if opc & 8 != 0 { s } else { imm_u };
                let t = match code {
                    1 => d == b,
                    2 => d > b,
                    3 => d >= b,
                    4 => d & b != 0,
                    5 => d != b,
                    6 => (d as i64) > (b as i64),
                    7 => (d as i64) >= (b as i64),
                    0xa => d < b,
                    0xb => d <= b,
                    0xc => (d as i64) < (b as i64),
                    _ => (d as i64) <= (b as i64),
                };
                if t {
                    next = pc + 1 + ins.off as i64;
                }
            } else if jmp32 && cls0 == 6 && jcc(code) {
                let bb = if opc & 8 != 0 { s } else { imm_u };
                let (x, y) = (d as u32, bb as u32);
                let (sx32, sy32) = (i32v(d), i32v(bb));
                let t = match code {
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
                };
                if t {
                    next = pc + 1 + ins.off as i64;
                }
            } else if opc == 0x85 || opc == 0x8d {
                let t = if opc == 0x85 {
                    if static_sys {
                        if ins.src == 0 {
                            sys_name(ins.imm as u32)
                        } else if ins.src == 1 {
                            format!("fn:{}", pc + 1 + ins.imm as i64)
                        } else {
                            return abort("invalid call");
                        }
                    } else {
                        call_target_name(p, pc, ins.imm)
                    }
                } else {
                    let reg = if v == 2 {
                        src
                    } else if v >= 3 {
                        dst
                    } else {
                        ins.imm as usize
                    };
                    match r.get(reg).filter(|_| reg <= 10) {
                        Some(x) => format!("ptr:{x:x}"),
                        None => return abort("invalid callx register"),
                    }
                };
                // doCall
                let regs = arg_regs(&t);
                let mut a: Vec<u64> = regs.iter().map(|&i| r[i]).collect();
                let ns = stack_args(&t);
                if ns > 0 {
                    a = vec![r[1], r[2], r[3], r[4]];
                    for k in 0..ns {
                        a.push(mem.load(r[5].wrapping_sub(0x1000).wrapping_add(8 * k as u64), 8));
                    }
                    for &i in &regs {
                        if i == 0 || i > 5 {
                            a.push(r[i]);
                        }
                    }
                }
                r[0] = on_call(mem, &t, a)?;
                for x in r.iter_mut().take(6).skip(1) {
                    *x = UNDEF; // clobbered
                }
                for x in fr.iter_mut().take(6) {
                    *x = false;
                }
            } else if opc == 0x95 {
                *pcr = pc;
                return Ok(Some(r[0]));
            } else {
                return abort(&format!("invalid instruction 0x{opc:x}"));
            }
        }
        if let Some(b) = nfr {
            {
                fr[dst] = b;
            }
        }
        pc = next;
    }
}

fn sys_name(h: u32) -> String {
    match syscalls::by_hash(h) {
        Some(s) => format!("sys:{}", s.name),
        None => format!("sys:hash:{h}"),
    }
}

/// Name of a call target the way the test hooks identify it (independent of the lifter).
pub fn call_target_name(p: &Program, pc: i64, imm: i32) -> String {
    let n = p.insns.len() as i64;
    let rel_ok = |t: i64| t >= 0 && t < n;
    if p.version >= 3 {
        // static syscalls: src 0 = syscall by hash, src 1 = pc-relative call
        let src = p.insns.get(pc as usize).map(|i| i.src);
        if src == Some(0) {
            return sys_name(imm as u32);
        }
        if src == Some(1) && rel_ok(pc + 1 + imm as i64) {
            return format!("fn:{}", pc + 1 + imm as i64);
        }
        return format!("hash:{}", imm as u32);
    }
    if let Some(rel) = p.elf.call_reloc(pc) {
        return match rel {
            sbpf_elf::CallReloc::Fn { target_pc, .. } => format!("fn:{target_pc}"),
            sbpf_elf::CallReloc::Syscall { name } => format!("sys:{name}"),
        };
    }
    if imm != -1 && rel_ok(pc + 1 + imm as i64) {
        return format!("fn:{}", pc + 1 + imm as i64);
    }
    format!("hash:{}", imm as u32)
}
