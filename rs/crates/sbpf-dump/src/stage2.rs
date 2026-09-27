//! Stage 2 dumps (`dataflow`, `vars`, `stack`, `stackargs`): scripts/dump.ts dumpStage2.

use crate::enc::*;
use sbpf_dataflow::{infer_signatures, recover_all, stack::promote_stack, stackargs};
use sbpf_ir::Ir;
use sbpf_program::{load_program, Block, Func, Program};

const S2: [&str; 4] = ["dataflow", "vars", "stack", "stackargs"];

/// A block with its IR.
fn block_line(ir: &Ir, b: &Block, o: &mut String) {
    let mut j = J::obj();
    j.s("t", "block")
        .n("id", b.id as i64)
        .n("start", b.start)
        .n("end", b.end)
        .raw("stmts", &to_s(ir, b.stmts.as_slice(), stmts))
        .raw("term", &to_s(ir, &b.term, term))
        .raw("succs", &nums(b.succs.iter().map(|&s| s as i64)))
        .raw("preds", &nums(b.preds.iter().map(|&s| s as i64)));
    j.line(o);
}

fn func_ir(f: &Func) -> String {
    let ir = f.ir.as_ref().expect("variable IR");
    let mut o = String::new();
    for b in &f.blocks {
        block_line(ir, b, &mut o);
    }
    o
}

fn vars_of(f: &Func) -> String {
    let mut s = String::from("[");
    for (i, v) in f.vars.iter().enumerate() {
        if i > 0 {
            s.push(',');
        }
        s.push_str(&format!("[{},{},{}]", v.reg, v.param, v.undef));
    }
    s.push(']');
    s
}

pub fn dump_stage2(bytes: &[u8], stages: &[String], res: &mut Vec<(&'static str, String)>) {
    let want = |s: &str| stages.iter().any(|x| x == s);
    let Some(last) = S2.iter().rposition(|s| want(s)) else {
        return;
    };
    let need = |s: &str| S2.iter().position(|x| *x == s).unwrap() <= last;
    let mut q: Program = load_program(bytes, true).expect("loaded before");
    infer_signatures(&mut q);
    if want("dataflow") {
        let mut o = header("dataflow");
        for f in q.funcs.values() {
            let mut j = J::obj();
            j.s("t", "func")
                .n("pc", f.pc)
                .b("noreturn", f.noreturn)
                .b("returns", f.returns)
                .n("nparams", f.nparams as i64)
                .raw("extraIn", &nums(f.extra_in.iter().map(|&r| r as i64)))
                .raw("leaders", &nums(f.block_at.keys().copied()))
                .n("blocks", f.blocks.len() as i64);
            j.line(&mut o);
            for b in &f.blocks {
                let mut j = J::obj();
                j.s("t", "block")
                    .n("id", b.id as i64)
                    .n("start", b.start)
                    .n("end", b.end)
                    .n("stmts", b.stmts.len() as i64)
                    .raw("term", &to_s(&q.ir, &b.term, term))
                    .raw("succs", &nums(b.succs.iter().map(|&s| s as i64)))
                    .raw("preds", &nums(b.preds.iter().map(|&s| s as i64)));
                j.line(&mut o);
            }
        }
        res.push(("dataflow", o));
    }
    if !need("vars") {
        return;
    }
    if let Err(e) = recover_all(&mut q) {
        res.push(("vars", header("vars") + &err_line(&e)));
        return;
    }
    if want("vars") {
        let mut o = header("vars");
        for f in q.funcs.values() {
            let mut j = J::obj();
            j.s("t", "func").n("pc", f.pc).raw("vars", &vars_of(f));
            j.line(&mut o);
            o.push_str(&func_ir(f));
        }
        res.push(("vars", o));
    }
    if !need("stack") {
        return;
    }
    let mut before: Vec<String> = vec![];
    {
        let mut o = header("stack");
        for f in q.funcs.values_mut() {
            let r = promote_stack(f);
            let ir = func_ir(f);
            let mut j = J::obj();
            j.s("t", "func").n("pc", f.pc).b("promoted", r);
            j.line(&mut o);
            if r {
                let mut sl = String::from("[");
                for (i, x) in f.promoted.as_ref().unwrap().iter().enumerate() {
                    if i > 0 {
                        sl.push(',');
                    }
                    sl.push_str(&format!("[{},{},{}]", js_num(x.off), x.size, x.v));
                }
                sl.push(']');
                let mut j = J::obj();
                j.s("t", "slots").raw("slots", &sl).raw("vars", &vars_of(f));
                j.line(&mut o);
                o.push_str(&ir);
            }
            before.push(ir);
        }
        if want("stack") {
            res.push(("stack", o));
        }
    }
    if !need("stackargs") {
        return;
    }
    let mut o = header("stackargs");
    let built: Vec<usize> = (0..q.funcs.len()).collect();
    let nstack = stackargs::rewrite_stack_args(&mut q.funcs, &built);
    for (&pc, &n) in &nstack {
        let mut j = J::obj();
        j.s("t", "nstack").n("pc", pc).n("n", n as i64);
        j.line(&mut o);
    }
    for (fi, f) in q.funcs.values().enumerate() {
        let ir = func_ir(f);
        let mut j = J::obj();
        j.s("t", "func").n("pc", f.pc);
        if let Some(n) = f.stack_args {
            j.n("stackArgs", n as i64);
        }
        if let Some(x) = f.arg_area_elided {
            j.b("argAreaElided", x);
        }
        if nstack.contains_key(&f.pc) {
            j.raw("vars", &vars_of(f));
        }
        let changed = ir != before[fi];
        j.b("changed", changed);
        j.line(&mut o);
        if changed {
            o.push_str(&ir);
        }
    }
    res.push(("stackargs", o));
}
