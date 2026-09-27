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
        for f in q.funcs.values_mut() {
            let settled = sbpf_opt::phase2(f, Some(&img), false, |f, s| fline(f, s, &mut opt));
            fline(f, settled, &mut optir);
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
    for f in q.funcs.values_mut() {
        sbpf_opt::finish(f, false);
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
    }
    res.push(("compact", o));
}
