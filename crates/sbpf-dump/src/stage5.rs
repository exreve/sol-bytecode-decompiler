//! Stage 5 dumps (`types`, `rtext`, `readfile`).

use crate::enc::*;
use crate::stage3::threads;
use sbpf_read::decompile::{decompile_read, render_read};
use sbpf_read::idl::IdlInfo;

pub fn dump_stage5(
    bytes: &[u8],
    stages: &[String],
    idl: Option<&IdlInfo>,
    res: &mut Vec<(&'static str, String)>,
) {
    let want = |s: &str| stages.iter().any(|x| x == s);
    let Some(first) = ["types", "rtext", "readfile"].into_iter().find(|s| want(s)) else {
        return;
    };
    let r = match decompile_read(bytes, idl, threads(), true) {
        Ok(r) => r,
        Err(e) => {
            res.push((first, header(first) + &err_line(&e)));
            return;
        }
    };
    if want("types") {
        let mut o = header("types");
        for f in &r.funcs {
            let mut names = f.names.as_slice();
            while let Some((None, rest)) = names.split_last() {
                names = rest;
            }
            let mut ns = String::from("[");
            for (i, n) in names.iter().enumerate() {
                if i > 0 {
                    ns.push(',');
                }
                match n {
                    Some(n) => push_str(&mut ns, n),
                    None => ns.push_str("null"),
                }
            }
            ns.push(']');
            let mut ts = String::from("[");
            for (i, (v, t)) in f.var_types.iter().enumerate() {
                if i > 0 {
                    ts.push(',');
                }
                ts.push('[');
                ts.push_str(&v.to_string());
                ts.push(',');
                push_str(&mut ts, t);
                ts.push(']');
            }
            ts.push(']');
            let mut j = J::obj();
            j.s("t", "func")
                .n("pc", f.pc)
                .s("name", &f.name)
                .raw("names", &ns)
                .raw("types", &ts);
            j.line(&mut o);
        }
        res.push(("types", o));
    }
    if want("rtext") {
        let mut o = header("rtext");
        for f in &r.funcs {
            let mut j = J::obj();
            j.s("t", "func")
                .n("pc", f.pc)
                .s("name", &f.name)
                .s("text", &f.text);
            j.line(&mut o);
        }
        res.push(("rtext", o));
    }
    if want("readfile") {
        let mut j = J::obj();
        j.s("text", &render_read(&r));
        let mut o = header("readfile");
        j.line(&mut o);
        res.push(("readfile", o));
    }
}
