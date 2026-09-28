//! `src/builtins.ts`: compiler-builtin 128-bit arithmetic recognized by behavior (library stub names).

use sbpf_exec::{Exec, ExecMem, NoHooks, ProgCtx};

type Op = fn(u128, u128) -> Option<u128>;

const OPS: [(&str, &str, Op); 5] = [
    (
        "__multi3",
        "u128 multiply: *out = a * b (mod 2^128), a = (a_lo, a_hi), b = (b_lo, b_hi)",
        |a, b| Some(a.wrapping_mul(b)),
    ),
    (
        "__udivti3",
        "u128 divide: *out = a / b (unsigned), a = (a_lo, a_hi), b = (b_lo, b_hi)",
        |a, b| if b == 0 { None } else { Some(a / b) },
    ),
    (
        "__umodti3",
        "u128 remainder: *out = a % b (unsigned), a = (a_lo, a_hi), b = (b_lo, b_hi)",
        |a, b| if b == 0 { None } else { Some(a % b) },
    ),
    (
        "__divti3",
        "i128 divide: *out = a / b (signed, truncating), a = (a_lo, a_hi), b = (b_lo, b_hi)",
        |a, b| {
            if b == 0 {
                None
            } else {
                Some((a as i128).wrapping_div(b as i128) as u128)
            }
        },
    ),
    (
        "__modti3",
        "i128 remainder: *out = a % b (signed), a = (a_lo, a_hi), b = (b_lo, b_hi)",
        |a, b| {
            if b == 0 {
                None
            } else {
                Some((a as i128).wrapping_rem(b as i128) as u128)
            }
        },
    ),
];

/// operand pairs: edge cases, then pseudo-random values of assorted widths
fn operands() -> Vec<(u128, u128)> {
    let mut x: u64 = 0x9e3779b97f4a7c15;
    let mut rnd = || {
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        x
    };
    let m = u128::MAX;
    let mut out: Vec<(u128, u128)> = vec![
        (0, 1),
        (1, 1),
        (m, 1),
        (m, m),
        (1 << 64, 3),
        (1 << 127, 2),
        (12345, (1 << 64) + 7),
    ];
    for i in 0..24u32 {
        let mut w = |n: u32| -> u128 {
            if n == 0 {
                (rnd() >> (i % 60)) as u128
            } else {
                let hi = rnd() as u128;
                (hi << 64) | rnd() as u128
            }
        };
        let a = w(i % 3);
        let b = w((i >> 1) % 3) | 1;
        out.push((a, b));
    }
    out
}

/// A behavioral name for the function at pc, or None.
pub fn builtin_name(ctx: &ProgCtx, pc: i64) -> Result<Option<(String, String)>, String> {
    let p = ctx.p;
    let end = ctx.extent_of(pc);
    if end - pc > 400 || p.funcs.get(&pc).map(|f| f.nparams) != Some(5) {
        return Ok(None);
    }
    for i in pc..end {
        let o = p.insns[i as usize].opc;
        if o == 0x85 || o == 0x8d {
            return Ok(None);
        }
    }
    let mut cands: Vec<(&str, &str, Op)> = OPS.to_vec();
    const OUT: u64 = 0x2_0000_0100;
    let ops = operands();
    for &(a, b) in &ops {
        let mut mem = ExecMem::new(ctx, 3);
        let _ = mem.store(OUT, 8, 0x1111);
        let _ = mem.store(OUT + 8, 8, 0x2222);
        let mut e = Exec::new(ctx, mem, 20_000, false);
        let args = [OUT, a as u64, (a >> 64) as u64, b as u64, (b >> 64) as u64];
        let r = e.run(&mut NoHooks, pc, &args, 0x2_0000_3000, None, &[])?;
        let got = if r.abort.is_some() || r.limit {
            None
        } else {
            let lo = e.mem.read_u(OUT, 8) as u128;
            let hi = e.mem.read_u(OUT + 8, 8) as u128;
            Some(lo | (hi << 64))
        };
        let mut k = cands.len();
        while k > 0 {
            k -= 1;
            let Some(want) = (cands[k].2)(a, b) else {
                continue;
            };
            if got != Some(want) {
                cands.remove(k);
            }
        }
        if cands.is_empty() {
            return Ok(None);
        }
    }
    Ok(if cands.len() == 1 {
        Some((
            cands[0].0.to_string(),
            format!("{} [exec: on {} operand pairs]", cands[0].1, ops.len()),
        ))
    } else {
        None
    })
}
