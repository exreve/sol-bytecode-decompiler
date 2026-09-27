//! Stage 3 dumps (`opt`, `optir`, `compact`): scripts/dump.ts dumpStage3.

use crate::enc::*;
use crate::stage2::{func_ir, vars_of};
use sbpf_dataflow::{infer_signatures, recover_all, stackargs};
use sbpf_elf::Image;
use sbpf_program::{load_program, Func, Program};

fn fline(f: &Func, settled: bool, o: &mut String) {
    let mut j = J::obj();
    j.s("t", "func")
        .n("pc", f.pc)
        .b("settled", settled)
        .raw("vars", &vars_of(f));
    j.line(o);
    o.push_str(&func_ir(f));
}

/// Worker threads for the per-function phase (SBPF_THREADS, default: available parallelism).
pub fn threads() -> usize {
    std::env::var("SBPF_THREADS")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or_else(|| std::thread::available_parallelism().map_or(1, |n| n.get()))
}

pub fn dump_stage3(bytes: &[u8], stages: &[String], res: &mut Vec<(&'static str, String)>) {
    let want = |s: &str| stages.iter().any(|x| x == s);
    if !["opt", "optir", "compact"].iter().any(|s| want(s)) {
        return;
    }
    let mut q: Program = load_program(bytes, true).expect("loaded before");
    infer_signatures(&mut q);
    if let Err(e) = recover_all(&mut q) {
        res.push(("opt", header("opt") + &err_line(&e)));
        return;
    }
    let (mut opt, mut optir) = (header("opt"), header("optir"));
    {
        let img = Image::new(&q.elf);
        let outs = sbpf_opt::par_each(q.funcs.values_mut().collect(), threads(), |f| {
            let mut a = String::new();
            let settled = sbpf_opt::phase2(f, Some(&img), false, |f, s| fline(f, s, &mut a));
            let mut b = String::new();
            fline(f, settled, &mut b);
            (a, b)
        });
        for (a, b) in outs {
            opt.push_str(&a);
            optir.push_str(&b);
        }
    }
    if want("opt") {
        res.push(("opt", opt));
    }
    if want("optir") {
        res.push(("optir", optir));
    }
    if !want("compact") {
        return;
    }
    let mut o = header("compact");
    let built: Vec<usize> = (0..q.funcs.len()).collect();
    let nstack = stackargs::rewrite_stack_args(&mut q.funcs, &built);
    for (&pc, &n) in &nstack {
        let mut j = J::obj();
        j.s("t", "nstack").n("pc", pc).n("n", n as i64);
        j.line(&mut o);
    }
    let outs = sbpf_opt::par_each(q.funcs.values_mut().collect(), threads(), |f| {
        sbpf_opt::finish(f, false);
        let mut o = String::new();
        let mut j = J::obj();
        j.s("t", "func").n("pc", f.pc);
        if let Some(n) = f.stack_args {
            j.n("stackArgs", n as i64);
        }
        if let Some(x) = f.arg_area_elided {
            j.b("argAreaElided", x);
        }
        j.raw("vars", &vars_of(f));
        j.line(&mut o);
        o.push_str(&func_ir(f));
        o
    });
    for s in outs {
        o.push_str(&s);
    }
    res.push(("compact", o));
}
