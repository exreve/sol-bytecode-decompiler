//! Stage 8 dumps (the analysis foundation): scripts/dump8.ts dumpStage8.

use crate::enc::*;
use crate::stage3::threads;
use sbpf_ir::{Ir, E};
use sbpf_read::analysis::facts::FnFacts;
use sbpf_read::decompile::{decompile_read, ReadOut};
use sbpf_read::idl::IdlInfo;

fn ex(ir: &Ir, e: E) -> String {
    to_s(ir, &e, |ir, e, o| expr(ir, *e, o))
}

fn arr(items: impl Iterator<Item = String>) -> String {
    let v: Vec<String> = items.collect();
    format!("[{}]", v.join(","))
}

fn jstr(s: &str) -> String {
    let mut o = String::new();
    push_str(&mut o, s);
    o
}

fn pair(a: &str, b: &str) -> String {
    format!("[{},{}]", jstr(a), jstr(b))
}

pub fn fn_facts_lines(ir: &Ir, pc: i64, ff: &FnFacts, out: &mut String) {
    let mut j = J::obj();
    j.s("t", "fn").n("pc", pc).s("name", &ff.name);
    if ff.wrapper {
        j.b("wrapper", true);
    }
    j.n("at", ff.at as i64).raw("types", &arr(ff.types.iter().map(|(k, v)| pair(k, v))));
    j.line(out);
    for c in &ff.checks {
        let mut j = J::obj();
        j.s("t", "check").n("line", c.line);
        if let Some(pc) = c.pc {
            j.n("pc", pc);
        }
        j.s("cond", &c.cond).b("failsIf", c.fails_if).s("error", &c.error).raw("kinds", &strs(c.kinds.iter().copied()));
        j.raw(
            "refs",
            &arr(c.refs.iter().map(|r| {
                let mut o = J::obj();
                o.s("acct", &r.acct);
                if let Some(f) = &r.field {
                    o.s("field", f);
                }
                o.done()
            })),
        );
        if let Some(n) = &c.named {
            j.s("named", n);
        }
        j.b("main", c.main);
        if let Some(b) = c.before {
            j.n("before", b);
        }
        if let Some((f, ks)) = &c.via {
            let mut o = J::obj();
            o.s("fn", f).raw("kinds", &strs(ks.iter().copied()));
            j.raw("via", &o.done());
        }
        if let Some(e) = c.c {
            j.raw("c", &ex(ir, e));
        }
        if let Some(p) = c.pass_pc {
            j.n("passPc", p);
        }
        if c.cmp32 {
            j.b("cmp32", true);
        }
        if let Some((a, b)) = &c.log_rel {
            j.raw("logRel", &pair(a, b));
        }
        if c.pubkeys {
            j.b("pubkeys", true);
        }
        j.line(out);
    }
    for o in &ff.ops {
        let mut j = J::obj();
        j.s("t", "op").n("line", o.line);
        if let Some(pc) = o.pc {
            j.n("pc", pc);
        }
        j.raw("kinds", &strs(o.kinds.iter().copied())).s("text", &o.text).b("main", o.main).b("errPath", o.err_path);
        if let Some(c) = &o.cpi {
            let mut k = J::obj();
            k.s("program", &c.program);
            if let Some(x) = &c.known {
                k.s("known", x);
            }
            if let Some(x) = &c.checked {
                k.s("checked", x);
            }
            if let Some(x) = &c.seeds {
                k.s("seeds", x);
            }
            k.raw("fields", &arr(c.fields.iter().map(|(a, b)| pair(a, b))));
            k.raw(
                "accounts",
                &arr(c.accounts.iter().map(|a| {
                    let mut o = J::obj();
                    if let Some(r) = &a.role {
                        o.s("role", r);
                    }
                    o.s("text", &a.text);
                    if let Some(w) = a.w {
                        o.f("w", w);
                    }
                    if let Some(s) = a.s {
                        o.f("s", s);
                    }
                    o.done()
                })),
            );
            if let Some(src) = &c.src {
                let mut s = J::obj();
                if let Some(p) = src.program {
                    s.raw("program", &ex(ir, p));
                }
                let opt = |x: &Option<E>| x.map_or("null".to_string(), |e| ex(ir, e));
                s.raw("accounts", &arr(src.accounts.iter().map(opt)));
                s.raw("fields", &arr(src.fields.iter().map(opt)));
                k.raw("src", &s.done());
            }
            if let Some(x) = &c.family {
                k.s("family", x);
            }
            if let Some(x) = &c.ix {
                k.s("ix", x);
            }
            j.raw("cpi", &k.done());
        }
        if let Some(t) = &o.target {
            let mut k = J::obj();
            k.s("acct", &t.acct);
            if let Some(f) = &t.field {
                k.s("field", f);
            }
            j.raw("target", &k.done());
        }
        if let Some(h) = o.how {
            j.s("how", h);
        }
        if let Some(v) = &o.value {
            j.s("value", v);
        }
        if let Some(p) = &o.pda {
            let mut k = J::obj();
            k.s("fn", &p.fn_).s("seeds", &p.seeds).s("program", &p.program);
            j.raw("pda", &k.done());
        }
        if let Some(v) = &o.via {
            j.s("via", v);
        }
        if let Some(e) = o.ret {
            j.raw("ret", &ex(ir, e));
        }
        if let Some(v) = &o.exit {
            j.s("exit", v);
        }
        if let Some(h) = o.handler {
            j.n("handler", h);
        }
        j.line(out);
    }
    for c in &ff.calls {
        let mut j = J::obj();
        j.s("t", "call").n("line", c.line);
        if let Some(pc) = c.pc {
            j.n("pc", pc);
        }
        if let Some(e) = c.ret {
            j.raw("ret", &ex(ir, e));
        }
        j.n("callee", c.callee).b("main", c.main).b("errPath", c.err_path);
        j.line(out);
    }
    for h in &ff.ix_hints {
        let mut j = J::obj();
        j.s("t", "hint").n("line", h.line).s("program", &h.program).s("family", &h.family).s("ix", &h.ix).s("how", &h.how);
        if let Some((f, p)) = h.call {
            let mut k = J::obj();
            k.n("fn", f).n("pc", p);
            j.raw("call", &k.done());
        }
        j.line(out);
    }
    let mut j = J::obj();
    j.s("t", "pcline").raw("m", &arr(ff.pc_line.iter().map(|(p, l)| format!("[{p},{l}]"))));
    j.line(out);
    let mut j = J::obj();
    j.s("t", "condline").raw("m", &arr(ff.cond_line.iter().map(|(e, l)| format!("[{},{l}]", ex(ir, *e)))));
    j.line(out);
}

pub fn facts_lines(r: &ReadOut, out: &mut String) {
    let p = r.program.as_ref().unwrap();
    for (pc, ff) in &r.facts {
        let f = &p.funcs[pc];
        let ir = f.ir.as_ref().unwrap_or(&p.ir);
        fn_facts_lines(ir, *pc, ff, out);
    }
}

pub fn dump_stage8(bytes: &[u8], stages: &[String], idl: Option<&IdlInfo>, res: &mut Vec<(&'static str, String)>) {
    let want = |s: &str| stages.iter().any(|x| x == s);
    if !want("facts") {
        return;
    }
    let r = match decompile_read(bytes, idl, threads(), false) {
        Ok(r) => r,
        Err(e) => {
            res.push(("facts", header("facts") + &err_line(&e)));
            return;
        }
    };
    let mut o = header("facts");
    facts_lines(&r, &mut o);
    res.push(("facts", o));
}
