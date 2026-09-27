//! Stage 7 dumps (`library`, `fingerprint`, the default-output line of `readfile`): scripts/dump.ts
//! dumpStage7, and the program diff report (dumpDiff).

use crate::enc::*;
use crate::stage3::threads;
use sbpf_read::decompile::{decompile_read, render_read};
use sbpf_read::idl::IdlInfo;

pub fn dump_stage7(
    bytes: &[u8],
    stages: &[String],
    idl: Option<&IdlInfo>,
    res: &mut Vec<(&'static str, String)>,
) {
    let want = |s: &str| stages.iter().any(|x| x == s);
    let wanted: Vec<&'static str> = ["library", "fingerprint", "readfile", "project"]
        .into_iter()
        .filter(|s| want(s))
        .collect();
    if wanted.is_empty() {
        return;
    }
    let mut lib = String::new();
    if want("library") {
        lib = header("library");
        match sbpf_program::load_program(bytes, true) {
            Err(e) => lib.push_str(&err_line(&e)),
            Ok(mut p) => {
                sbpf_dataflow::infer_signatures(&mut p);
                match sbpf_lib::library::classify(&p) {
                    Err(e) => lib.push_str(&err_line(&e)),
                    Ok(libs) => {
                        for (pc, i) in libs {
                            let mut j = J::obj();
                            j.s("t", "func")
                                .n("pc", pc)
                                .b("lib", i.lib)
                                .f("families", i.families);
                            if let Some(n) = &i.name {
                                j.s("name", n);
                            }
                            if let Some(h) = &i.hint {
                                j.s("hint", h);
                            }
                            j.line(&mut lib);
                        }
                    }
                }
            }
        }
    }
    let take = |res: &mut Vec<(&'static str, String)>, st: &'static str| -> String {
        match res.iter().position(|x| x.0 == st) {
            Some(i) => res.remove(i).1,
            None => header(st),
        }
    };
    let r = match decompile_read(bytes, idl, threads(), false) {
        Ok(r) => r,
        Err(e) => {
            for st in wanted {
                let mut o = if st == "library" {
                    std::mem::take(&mut lib)
                } else {
                    take(res, st)
                };
                if st == "readfile" {
                    let mut j = J::obj();
                    j.b("lib", true).s("error", &e);
                    j.line(&mut o);
                } else {
                    o.push_str(&err_line(&e));
                }
                res.push((st, o));
            }
            return;
        }
    };
    if want("library") {
        for pc in &r.lib_pcs {
            let mut j = J::obj();
            j.s("t", "lib").n("pc", *pc).s("name", &r.fn_names[pc]);
            j.line(&mut lib);
        }
        for s in &r.stubs {
            let mut j = J::obj();
            j.s("t", "stub").s("text", s);
            j.line(&mut lib);
        }
        let mut j = J::obj();
        j.s("t", "count")
            .n("funcs", r.funcs.len() as i64)
            .n("lib", r.lib_count as i64);
        j.line(&mut lib);
        res.push(("library", lib));
    }
    if want("fingerprint") {
        let mut o = header("fingerprint");
        let mut j = J::obj();
        j.s("text", &sbpf_read::decompile::render_fingerprints(&r));
        j.line(&mut o);
        res.push(("fingerprint", o));
    }
    if want("project") {
        let mut o = header("project");
        for (path, text) in sbpf_read::layout::render_project(&r) {
            let mut j = J::obj();
            j.s("path", &path).s("text", &text);
            j.line(&mut o);
        }
        res.push(("project", o));
    }
    if want("readfile") {
        let mut o = take(res, "readfile");
        let mut j = J::obj();
        j.b("lib", true).s("text", &render_read(&r));
        j.line(&mut o);
        res.push(("readfile", o));
    }
}

/// The program diff report (dumpDiff).
pub fn dump_diff(a: &str, b: &str) -> String {
    let mut o = header("diff");
    let ba = std::fs::read(a).expect("read a");
    let bb = std::fs::read(b).expect("read b");
    match sbpf_read::diff::diff_report(&ba, &bb, [None, None], true, [a, b]) {
        Ok(text) => {
            let mut j = J::obj();
            j.s("text", &text);
            j.line(&mut o);
        }
        Err(e) => o.push_str(&err_line(&e)),
    }
    o
}
