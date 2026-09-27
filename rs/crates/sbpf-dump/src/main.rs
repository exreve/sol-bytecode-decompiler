//! Stage dumps, byte-identical to `scripts/dump.ts` (encoding: rs/README.md), and a stage timer.
//!
//!   sbpf-dump prog.so [--idl x.json] [--stages elf,insns,cfg,lift,dataflow,vars,stack,stackargs,opt,optir,compact,struct,text,rawfile,types,rtext,readfile,library,fingerprint] out_dir
//!   sbpf-dump --time [--iters N] prog.so...

mod enc;
mod stage2;
mod stage3;
mod stage4;
mod stage5;
mod stage7;
mod stage8;
mod stage8b;

use enc::*;
use sbpf_elf::{parse_elf, CallReloc, Elf, Image};
use sbpf_program::{
    discover, instruction_starts, load_program, pending_calls, prepare, Cx, Flow, Lifter, Program,
};
use std::time::Instant;

const STAGES: [&str; 23] = [
    "elf",
    "insns",
    "cfg",
    "lift",
    "dataflow",
    "vars",
    "stack",
    "stackargs",
    "opt",
    "optir",
    "compact",
    "struct",
    "text",
    "rawfile",
    "types",
    "rtext",
    "readfile",
    "library",
    "fingerprint",
    "facts",
    "flow",
    "analysis",
    "project",
];

fn dump_elf(elf: &Elf) -> String {
    let mut o = header("elf");
    let text = elf.text; // (index of the text section)
    let mut j = J::obj();
    j.s("t", "elf")
        .n("version", elf.version as i64)
        .f("entryPc", elf.entry_pc as f64)
        .h("textVaddr", elf.text_vaddr);
    j.n("text", text as i64)
        .n("bytes", elf.bytes.len() as i64)
        .s("hash", &fnv64(&elf.bytes));
    j.line(&mut o);
    for s in &elf.sections {
        let mut j = J::obj();
        j.s("t", "section")
            .s("name", &s.name)
            .n("type", s.ty as i64)
            .f("flags", s.flags)
            .f("addr", s.addr);
        j.f("offset", s.offset)
            .f("size", s.size)
            .n("link", s.link as i64)
            .f("entsize", s.entsize);
        j.line(&mut o);
    }
    for (t, syms) in [("dynsym", &elf.dynsyms), ("symbol", &elf.symbols)] {
        for s in syms {
            let mut j = J::obj();
            j.s("t", t)
                .s("name", &s.name)
                .f("value", s.value)
                .f("size", s.size);
            j.n("type", s.ty as i64)
                .n("bind", s.bind as i64)
                .n("shndx", s.shndx as i64);
            j.line(&mut o);
        }
    }
    for r in &elf.relocs {
        let mut j = J::obj();
        j.s("t", "reloc")
            .f("offset", r.offset)
            .n("type", r.ty as i64)
            .n("sym", r.sym as i64);
        j.line(&mut o);
    }
    for (&pc, r) in &elf.call_relocs {
        let mut j = J::obj();
        j.s("t", "callreloc").f("pc", f64::from_bits(pc));
        match r {
            CallReloc::Fn { name, target_pc } => {
                j.s("kind", "fn").s("name", name).n("targetPc", *target_pc)
            }
            CallReloc::Syscall { name } => j.s("kind", "syscall").s("name", name),
        };
        j.line(&mut o);
    }
    for r in &elf.regions {
        let b = elf.region_bytes(r);
        let mut j = J::obj();
        j.s("t", "region")
            .s("name", &r.name)
            .h("vaddr", r.vaddr)
            .n("len", b.len() as i64);
        j.b("exec", r.exec).s("hash", &fnv64(b));
        j.line(&mut o);
    }
    for (&va, &v) in &elf.data_pointers {
        let mut j = J::obj();
        j.s("t", "dataptr").h("va", va).h("v", v);
        j.line(&mut o);
    }
    let image = Image::new(elf);
    let mut j = J::obj();
    j.s("t", "image")
        .raw("order", &nums(image.order.iter().map(|&i| i as i64)));
    j.line(&mut o);
    o
}

fn dump_insns(p: &Program) -> String {
    let mut o = header("insns");
    for i in &p.insns {
        let v = [
            i.pc as i64,
            i.opc as i64,
            i.dst as i64,
            i.src as i64,
            i.off as i64,
            i.imm as i64,
        ];
        o.push_str(&nums(v.into_iter()));
        o.push('\n');
    }
    o
}

fn dump_cfg(p: &Program) -> String {
    let mut o = header("cfg");
    for (&pc, name) in &p.symbol_names {
        let mut j = J::obj();
        j.s("t", "symname").f("pc", pc as f64).s("name", name);
        j.line(&mut o);
    }
    let mut j = J::obj();
    j.s("t", "addressTaken")
        .raw("pcs", &nums(p.address_taken.iter().copied()));
    j.line(&mut o);
    let mut j = J::obj();
    j.s("t", "syscalls")
        .raw("names", &strs(p.syscalls.keys().map(|s| s.as_str())));
    j.line(&mut o);
    for f in p.funcs.values() {
        let mut j = J::obj();
        j.s("t", "func")
            .n("pc", f.pc)
            .s("name", &f.name)
            .b("isEntry", f.is_entry);
        j.raw("leaders", &nums(f.block_at.keys().copied()))
            .raw("calls", &nums(pending_calls(f).iter().copied()));
        j.n("blocks", f.blocks.len() as i64);
        j.line(&mut o);
        for b in &f.blocks {
            let mut j = J::obj();
            j.s("t", "block")
                .n("id", b.id as i64)
                .n("start", b.start)
                .n("end", b.end)
                .n("stmts", b.stmts.len() as i64);
            j.raw("term", &to_s(&p.ir, &b.term, term));
            j.raw("succs", &nums(b.succs.iter().map(|&s| s as i64)));
            j.raw("preds", &nums(b.preds.iter().map(|&s| s as i64)));
            j.line(&mut o);
        }
    }
    o
}

fn dump_lift(p: &Program) -> String {
    let mut o = header("lift");
    let mut syscalls = p.syscalls.clone();
    let ir = sbpf_ir::Ir::new();
    let mut cx = Cx {
        insns: &p.insns,
        elf: &p.elf,
        syscalls: &mut syscalls,
        ir: &ir,
    };
    let mut lifter = Lifter::new(p.version, p.insns.len());
    let no_lddw = p.version == 2;
    let mut pc = 0usize;
    while pc < p.insns.len() {
        let l = lifter.lift(&mut cx, pc as i64);
        let mut j = J::obj();
        j.n("pc", pc as i64);
        j.raw("stmts", &to_s(&ir, l.stmt.as_slice(), stmts));
        match &l.flow {
            Flow::Next(n) => j.n("next", *n),
            Flow::Term(t) => j.raw("term", &to_s(&ir, t, term)),
        };
        j.line(&mut o);
        if p.insns[pc].opc == 0x18 && !no_lddw {
            pc += 1;
        }
        pc += 1;
    }
    o
}

fn dump_all(
    bytes: &[u8],
    stages: &[String],
    idl: Option<&sbpf_read::idl::IdlInfo>,
) -> Vec<(&'static str, String)> {
    let mut res = vec![];
    let want = |s: &str| stages.iter().any(|x| x == s);
    let elf = match parse_elf(bytes) {
        Ok(e) => e,
        Err(e) => {
            res.push(("elf", header("elf") + &err_line(&e)));
            return res;
        }
    };
    if want("elf") {
        res.push(("elf", dump_elf(&elf)));
    }
    let p = match load_program(bytes, false) {
        Ok(p) => p,
        Err(e) => {
            res.push(("insns", header("insns") + &err_line(&e)));
            return res;
        }
    };
    if want("insns") {
        res.push(("insns", dump_insns(&p)));
    }
    if want("cfg") {
        res.push(("cfg", dump_cfg(&p)));
    }
    if want("lift") {
        res.push(("lift", dump_lift(&p)));
    }
    drop(p);
    stage2::dump_stage2(bytes, stages, &mut res);
    stage3::dump_stage3(bytes, stages, &mut res);
    stage4::dump_stage4(bytes, stages, &mut res);
    stage5::dump_stage5(bytes, stages, idl, &mut res);
    stage7::dump_stage7(bytes, stages, idl, &mut res);
    stage8::dump_stage8(bytes, stages, idl, &mut res);
    res
}

/// Stage timings (ms, best of `iters`): the same breakdown as scripts/stagetime.ts.
fn time(files: &[String], iters: usize) {
    println!("file\telf\tdecode\tdiscover_lazy\tload_lazy\tload_full\tlift_all\tsignatures\trecover\tpromote\tstackargs");
    for f in files {
        let bytes = std::fs::read(f).expect("read");
        let mut best = [f64::MAX; 10];
        for _ in 0..iters {
            let t0 = Instant::now();
            let elf = parse_elf(&bytes).unwrap();
            let t1 = Instant::now();
            let mut p = prepare(elf).unwrap();
            let t2 = Instant::now();
            discover(&mut p, true);
            let t3 = Instant::now();
            let tl = Instant::now();
            let mut q = load_program(&bytes, true).unwrap();
            let load_lazy = tl.elapsed();
            let tf = Instant::now();
            let full = load_program(&bytes, false).unwrap();
            let load_full = tf.elapsed();
            drop(full);
            let ta = Instant::now();
            let starts = instruction_starts(&q);
            let mut sc = q.syscalls.clone();
            let ir = sbpf_ir::Ir::new();
            let mut cx = Cx {
                insns: &q.insns,
                elf: &q.elf,
                syscalls: &mut sc,
                ir: &ir,
            };
            let mut lifter = Lifter::new(q.version, q.insns.len());
            let mut cnt = 0usize;
            for pc in 0..q.insns.len() {
                if starts[pc] != 0 {
                    cnt += lifter.lift(&mut cx, pc as i64).stmt.is_some() as usize;
                }
            }
            std::hint::black_box(cnt);
            let lift_all = ta.elapsed();
            drop(cx);
            let ts = Instant::now();
            sbpf_dataflow::infer_signatures(&mut q);
            let sig = ts.elapsed();
            let ts = Instant::now();
            let _ = sbpf_dataflow::recover_all(&mut q);
            let rec = ts.elapsed();
            let ts = Instant::now();
            for f in q.funcs.values_mut() {
                sbpf_dataflow::stack::promote_stack(f);
            }
            let prom = ts.elapsed();
            let ts = Instant::now();
            let built: Vec<usize> = (0..q.funcs.len()).collect();
            sbpf_dataflow::stackargs::rewrite_stack_args(&mut q.funcs, &built);
            let sa = ts.elapsed();
            let ms = |d: std::time::Duration| d.as_secs_f64() * 1e3;
            let v = [
                ms(t1 - t0),
                ms(t2 - t1),
                ms(t3 - t2),
                ms(load_lazy),
                ms(load_full),
                ms(lift_all),
                ms(sig),
                ms(rec),
                ms(prom),
                ms(sa),
            ];
            for k in 0..10 {
                best[k] = best[k].min(v[k]);
            }
        }
        let name = std::path::Path::new(f)
            .file_name()
            .unwrap()
            .to_string_lossy();
        let cols: Vec<String> = best.iter().map(|x| format!("{x:.2}")).collect();
        println!("{name}\t{}", cols.join("\t"));
    }
}

fn main() {
    // deep expression trees are walked recursively (TS runs with --stack-size=65500)
    let t = std::thread::Builder::new()
        .stack_size(1 << 30)
        .spawn(real_main)
        .expect("spawn");
    if t.join().is_err() {
        std::process::exit(101);
    }
}

fn real_main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.first().map(|s| s.as_str()) == Some("--time7") {
        let (iters, files) = if args.get(1).map(|s| s.as_str()) == Some("--iters") {
            (args[2].parse().unwrap(), &args[3..])
        } else {
            (5, &args[1..])
        };
        time7(files, iters);
        return;
    }
    if args.first().map(|s| s.as_str()) == Some("--time8") {
        let (iters, files) = if args.get(1).map(|s| s.as_str()) == Some("--iters") {
            (args[2].parse().unwrap(), &args[3..])
        } else {
            (5, &args[1..])
        };
        time8(files, iters);
        return;
    }
    if args.first().map(|s| s.as_str()) == Some("--timediff") {
        let (iters, files) = if args.get(1).map(|s| s.as_str()) == Some("--iters") {
            (args[2].parse().unwrap(), &args[3..])
        } else {
            (5, &args[1..])
        };
        let (a, b) = (
            std::fs::read(&files[0]).unwrap(),
            std::fs::read(&files[1]).unwrap(),
        );
        let mut best = f64::MAX;
        for _ in 0..iters {
            let t = Instant::now();
            std::hint::black_box(
                sbpf_read::diff::diff_report(&a, &b, true, [&files[0], &files[1]]).unwrap(),
            );
            best = best.min(t.elapsed().as_secs_f64() * 1e3);
        }
        println!("diff\t{}\t{}\t{best:.1}", files[0], files[1]);
        return;
    }
    if args.first().map(|s| s.as_str()) == Some("--time5") {
        let (iters, files) = if args.get(1).map(|s| s.as_str()) == Some("--iters") {
            (args[2].parse().unwrap(), &args[3..])
        } else {
            (5, &args[1..])
        };
        time5(files, iters);
        return;
    }
    if args.first().map(|s| s.as_str()) == Some("--time4") {
        let (iters, files) = if args.get(1).map(|s| s.as_str()) == Some("--iters") {
            (args[2].parse().unwrap(), &args[3..])
        } else {
            (5, &args[1..])
        };
        time4(files, iters);
        return;
    }
    if args.first().map(|s| s.as_str()) == Some("--time3") {
        let (iters, files) = if args.get(1).map(|s| s.as_str()) == Some("--iters") {
            (args[2].parse().unwrap(), &args[3..])
        } else {
            (5, &args[1..])
        };
        time3(files, iters);
        return;
    }
    if args.first().map(|s| s.as_str()) == Some("--time") {
        let mut iters = 5;
        let mut files = vec![];
        let mut i = 1;
        while i < args.len() {
            if args[i] == "--iters" {
                iters = args[i + 1].parse().unwrap();
                i += 1;
            } else {
                files.push(args[i].clone());
            }
            i += 1;
        }
        time(&files, iters);
        return;
    }
    let mut stages: Vec<String> = STAGES.iter().map(|s| s.to_string()).collect();
    let mut pos = vec![];
    let mut idl_file: Option<String> = None;
    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--idl" => {
                idl_file = Some(args[i + 1].clone()); // (stage 5 on)
                i += 1;
            }
            "--stages" => {
                stages = args[i + 1].split(',').map(String::from).collect();
                i += 1;
            }
            _ => pos.push(args[i].clone()),
        }
        i += 1;
    }
    if pos.len() == 4 && pos[0] == "--diff" {
        std::fs::create_dir_all(&pos[3]).expect("mkdir");
        std::fs::write(
            std::path::Path::new(&pos[3]).join("diff.jsonl"),
            stage7::dump_diff(&pos[1], &pos[2]),
        )
        .expect("write");
        return;
    }
    if pos.len() != 2 {
        eprintln!("usage: sbpf-dump prog.so [--idl x.json] [--stages elf,insns,cfg,lift,dataflow,vars,stack,stackargs,opt,optir,compact,struct,text,rawfile,types,rtext,readfile,library,fingerprint] out_dir");
        std::process::exit(2);
    }
    let bytes = std::fs::read(&pos[0]).expect("read input");
    std::fs::create_dir_all(&pos[1]).expect("mkdir");
    let idl = idl_file.map(|f| {
        let v: serde_json::Value =
            serde_json::from_str(&std::fs::read_to_string(f).expect("read idl")).expect("idl json");
        sbpf_read::idl::parse_idl(&v)
    });
    for (stage, text) in dump_all(&bytes, &stages, idl.as_ref()) {
        std::fs::write(
            std::path::Path::new(&pos[1]).join(format!("{stage}.jsonl")),
            text,
        )
        .expect("write");
    }
}

/// Stage 4 timings (ms, best of `iters`): the same breakdown as scripts/stagetime.ts --stage4
/// (struct = structure + cleanup + statementIdioms, print = names + declarations + text, summed over
/// all functions), single-threaded, then the same on worker threads (wall time).
fn time4(files: &[String], iters: usize) {
    use sbpf_print::raw::{prepare, print_all, structure_all};
    println!("file\tstruct\tprint\ttotal\tstruct_par\tprint_par\ttotal_par");
    let n = stage3::threads();
    for f in files {
        let bytes = std::fs::read(f).expect("read");
        let mut best = [f64::MAX; 6];
        for _ in 0..iters {
            let mut v = [0f64; 6];
            for (k, th) in [(0, 1), (3, n)] {
                let mut pr = prepare(&bytes, n).unwrap();
                let t = Instant::now();
                let trees = structure_all(&mut pr, th);
                let t1 = Instant::now();
                let funcs = print_all(&mut pr, trees, th);
                v[k] = (t1 - t).as_secs_f64() * 1e3;
                v[k + 1] = t1.elapsed().as_secs_f64() * 1e3;
                v[k + 2] = v[k] + v[k + 1];
                drop(funcs);
            }
            for k in 0..6 {
                best[k] = best[k].min(v[k]);
            }
        }
        let name = std::path::Path::new(f)
            .file_name()
            .unwrap()
            .to_string_lossy();
        let cols: Vec<String> = best.iter().map(|x| format!("{x:.2}")).collect();
        println!("{name}\t{}", cols.join("\t"));
    }
}

/// Stage 3 timings (ms, best of `iters`): the same breakdown as scripts/stagetime.ts --stage3.
fn time3(files: &[String], iters: usize) {
    use sbpf_opt::{compact, idioms, optimize_func, Fx};
    println!("file\topt1\tpromote\topt2\tidioms\topt3\tstackargs\tsink\tcompact\ttotal\tparallel");
    for f in files {
        let bytes = std::fs::read(f).expect("read");
        let mut best = [f64::MAX; 10];
        for _ in 0..iters {
            let mut q = load_program(&bytes, true).unwrap();
            sbpf_dataflow::infer_signatures(&mut q);
            sbpf_dataflow::recover_all(&mut q).unwrap();
            let img = Image::new(&q.elf);
            let mut v = [0f64; 9];
            let mut t;
            let mut lap = |k: usize, t: &mut Instant| {
                let n = Instant::now();
                v[k] += (n - *t).as_secs_f64() * 1e3;
                *t = n;
            };
            for g in q.funcs.values_mut() {
                t = Instant::now();
                let mut x = Fx::new(g.ir.take().unwrap(), Some(&img));
                let mut settled = optimize_func(&mut x, g);
                g.ir = Some(std::mem::take(&mut x.ir));
                lap(0, &mut t);
                let pr = sbpf_dataflow::stack::promote_stack(g);
                x.ir = g.ir.take().unwrap();
                lap(1, &mut t);
                if pr {
                    settled = optimize_func(&mut x, g);
                }
                lap(2, &mut t);
                let (c, real) = idioms::recognize_idioms(&mut x, g);
                lap(3, &mut t);
                if c && (real || !settled) {
                    optimize_func(&mut x, g);
                }
                g.ir = Some(std::mem::take(&mut x.ir));
                lap(4, &mut t);
            }
            t = Instant::now();
            let built: Vec<usize> = (0..q.funcs.len()).collect();
            sbpf_dataflow::stackargs::rewrite_stack_args(&mut q.funcs, &built);
            lap(5, &mut t);
            for g in q.funcs.values_mut() {
                t = Instant::now();
                let mut x = Fx::new(g.ir.take().unwrap(), None);
                compact::sink_frame_loads(&mut x, g);
                lap(6, &mut t);
                compact::compact_stores(&mut x, g);
                g.ir = Some(std::mem::take(&mut x.ir));
                lap(7, &mut t);
            }
            v[8] = v[..8].iter().sum();
            // the same work with the per-function steps on worker threads (wall time)
            let mut q = load_program(&bytes, true).unwrap();
            sbpf_dataflow::infer_signatures(&mut q);
            sbpf_dataflow::recover_all(&mut q).unwrap();
            let n = stage3::threads();
            let tp = Instant::now();
            {
                let img = Image::new(&q.elf);
                sbpf_opt::par_each(q.funcs.values_mut().collect(), n, |g| {
                    sbpf_opt::phase2(g, Some(&img), false, |_, _| {})
                });
            }
            let built: Vec<usize> = (0..q.funcs.len()).collect();
            sbpf_dataflow::stackargs::rewrite_stack_args(&mut q.funcs, &built);
            sbpf_opt::par_each(q.funcs.values_mut().collect(), n, |g| {
                sbpf_opt::finish(g, false)
            });
            let par = tp.elapsed().as_secs_f64() * 1e3;
            let v = [v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], par];
            for k in 0..10 {
                best[k] = best[k].min(v[k]);
            }
        }
        let name = std::path::Path::new(f)
            .file_name()
            .unwrap()
            .to_string_lossy();
        let cols: Vec<String> = best.iter().map(|x| format!("{x:.2}")).collect();
        println!("{name}\t{}", cols.join("\t"));
    }
}

/// Stage 5 timings (ms, best of `iters`): the same breakdown as scripts/stagetime.ts --stage5 (the whole
/// raw / readable output, single file included, without the analysis), on 1 thread and on worker threads.
/// Stage 7 timings (ms, best of `iters`): the --full readable output and the default output (library
/// code as stubs), single file included, on one thread and on worker threads (as scripts/stagetime.ts --stage7).
/// Stage 8 timings (ms, best of `iters`): the analysis foundation on the default output (the flow dump, as
/// scripts/stagetime.ts --stage8).
/// The analysis column: the report layer up to phase 2's rule findings (stage 8b), on a fresh decompile.
fn time8(files: &[String], iters: usize) {
    println!("file\tflow\tanalysis");
    for f in files {
        let bytes = std::fs::read(f).expect("read");
        let mut best = [f64::MAX; 2];
        for _ in 0..iters {
            let ms = std::cell::Cell::new(0.0);
            let hook = |an: &sbpf_read::analysis::An| {
                let t = Instant::now();
                let s = stage8::flow_lines(an, false);
                ms.set(t.elapsed().as_secs_f64() * 1e3);
                s
            };
            let ma = std::cell::Cell::new(0.0);
            let hook_a = |an: &sbpf_read::analysis::An| {
                let t = Instant::now();
                an.analyze(|a, _| std::hint::black_box(a.ixs.len()));
                ma.set(t.elapsed().as_secs_f64() * 1e3);
                String::new()
            };
            for (h, cell, k) in [
                (&hook as sbpf_read::printfn::AnalysisHook, &ms, 0),
                (&hook_a, &ma, 1),
            ] {
                std::hint::black_box(
                    sbpf_read::decompile::decompile_read_hook(
                        &bytes,
                        None,
                        stage3::threads(),
                        false,
                        Some(h),
                    )
                    .unwrap(),
                );
                best[k] = best[k].min(cell.get());
            }
        }
        let name = std::path::Path::new(f)
            .file_name()
            .unwrap()
            .to_string_lossy();
        println!("{name}\t{:.1}\t{:.1}", best[0], best[1]);
    }
}

fn time7(files: &[String], iters: usize) {
    println!("file\tfull\tdefault\tfull_par\tdefault_par");
    let n = stage3::threads();
    for f in files {
        let bytes = std::fs::read(f).expect("read");
        let mut best = [f64::MAX; 4];
        for _ in 0..iters {
            for (k, th) in [(0, 1), (2, n)] {
                for (j, full) in [(0, true), (1, false)] {
                    let t = Instant::now();
                    let r = sbpf_read::decompile::decompile_read(&bytes, None, th, full).unwrap();
                    std::hint::black_box(sbpf_read::decompile::render_read(&r));
                    best[k + j] = best[k + j].min(t.elapsed().as_secs_f64() * 1e3);
                }
            }
        }
        let name = std::path::Path::new(f)
            .file_name()
            .unwrap()
            .to_string_lossy();
        println!(
            "{name}\t{:.1}\t{:.1}\t{:.1}\t{:.1}",
            best[0], best[1], best[2], best[3]
        );
    }
}

fn time5(files: &[String], iters: usize) {
    println!("file\traw\treadable\tread\traw_par\treadable_par\tread_par");
    let n = stage3::threads();
    for f in files {
        let bytes = std::fs::read(f).expect("read");
        let mut best = [f64::MAX; 4];
        for _ in 0..iters {
            for (k, th) in [(0, 1), (2, n)] {
                let t = Instant::now();
                let r = sbpf_print::raw::decompile_raw(&bytes, th).unwrap();
                std::hint::black_box(sbpf_print::raw::render_single(&r));
                let t1 = Instant::now();
                let r = sbpf_read::decompile::decompile_read(&bytes, None, th, true).unwrap();
                std::hint::black_box(sbpf_read::decompile::render_read(&r));
                best[k] = best[k].min((t1 - t).as_secs_f64() * 1e3);
                best[k + 1] = best[k + 1].min(t1.elapsed().as_secs_f64() * 1e3);
            }
        }
        let name = std::path::Path::new(f)
            .file_name()
            .unwrap()
            .to_string_lossy();
        println!(
            "{name}\t{:.1}\t{:.1}\t{:.1}\t{:.1}\t{:.1}\t{:.1}",
            best[0],
            best[1],
            best[1] - best[0],
            best[2],
            best[3],
            best[3] - best[2]
        );
    }
}
