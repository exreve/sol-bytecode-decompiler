//! Stage 8b dump: the analysis before the incident rules (scripts/dump8.ts analysisLines).

use crate::enc::*;
use sbpf_read::analysis::facts::{OpCpi, Pda};
use sbpf_read::analysis::report::{Analysis, Loc, OpOut};
use sbpf_read::analysis::An;

fn jstr(s: &str) -> String {
    let mut o = String::new();
    push_str(&mut o, s);
    o
}

fn arr(items: impl Iterator<Item = String>) -> String {
    let v: Vec<String> = items.collect();
    format!("[{}]", v.join(","))
}

fn sarr(v: &[String]) -> String {
    strs(v.iter().map(|s| s.as_str()))
}

fn pair(a: &str, b: &str) -> String {
    format!("[{},{}]", jstr(a), jstr(b))
}

trait Opt {
    fn os(&mut self, k: &str, v: Option<&str>) -> &mut Self;
    fn on(&mut self, k: &str, v: Option<i64>) -> &mut Self;
    fn ob(&mut self, k: &str, v: bool) -> &mut Self;
    fn or(&mut self, k: &str, v: Option<String>) -> &mut Self;
}

impl Opt for J {
    fn os(&mut self, k: &str, v: Option<&str>) -> &mut Self {
        if let Some(v) = v {
            self.s(k, v);
        }
        self
    }
    fn on(&mut self, k: &str, v: Option<i64>) -> &mut Self {
        if let Some(v) = v {
            self.n(k, v);
        }
        self
    }
    /// true or absent
    fn ob(&mut self, k: &str, v: bool) -> &mut Self {
        if v {
            self.b(k, true);
        }
        self
    }
    fn or(&mut self, k: &str, v: Option<String>) -> &mut Self {
        if let Some(v) = v {
            self.raw(k, &v);
        }
        self
    }
}

pub fn loc(at: &Loc) -> String {
    let mut j = J::obj();
    j.s("fn", &at.fn_).n("line", at.line).on("pc", at.pc);
    j.done()
}

fn cpi_j(c: &OpCpi) -> String {
    let mut j = J::obj();
    j.s("program", &c.program)
        .os("known", c.known.as_deref())
        .os("checked", c.checked.as_deref())
        .os("family", c.family.as_deref())
        .os("ix", c.ix.as_deref())
        .os("seeds", c.seeds.as_deref())
        .raw("fields", &arr(c.fields.iter().map(|(a, b)| pair(a, b))))
        .raw(
            "accounts",
            &arr(c.accounts.iter().map(|a| {
                let mut o = J::obj();
                o.os("role", a.role.as_deref()).s("text", &a.text);
                if let Some(w) = a.w {
                    o.f("w", w);
                }
                if let Some(s) = a.s {
                    o.f("s", s);
                }
                o.done()
            })),
        );
    j.done()
}

fn pda_j(p: &Pda) -> String {
    let mut j = J::obj();
    j.s("fn", &p.fn_)
        .s("seeds", &p.seeds)
        .s("program", &p.program);
    j.done()
}

fn op_line(o: &OpOut, t: &str, full: bool, out: &mut String) {
    let mut j = J::obj();
    j.s("t", t)
        .raw("at", &loc(&o.at))
        .raw("kinds", &strs(o.kinds.iter().copied()))
        .s("text", &o.text);
    if full {
        j.b("main", o.main);
    }
    j.os("target", o.target.as_deref())
        .os("how", o.how)
        .os("value", o.value.as_deref())
        .or("cpi", o.cpi.as_ref().map(|c| cpi_j(&c.borrow())))
        .or("pda", o.pda.as_ref().map(pda_j));
    if full {
        j.on("fnPc", o.fn_pc)
            .ob("anchorClose", o.anchor_close)
            .or(
                "guards",
                o.guards.as_ref().map(|g| nums(g.iter().map(|x| *x as i64))),
            )
            .or(
                "bypass",
                o.bypass.as_ref().map(|bs| {
                    arr(bs.iter().map(|b| {
                        let mut x = J::obj();
                        x.n("check", b.check as i64)
                            .raw("path", &arr(b.path.iter().map(loc)))
                            .ob("strong", b.strong);
                        x.done()
                    }))
                }),
            )
            .or(
                "sources",
                o.sources.as_ref().map(|ss| {
                    arr(ss.iter().map(|s| {
                        let mut x = J::obj();
                        x.s("param", &s.param)
                            .s("source", &s.source)
                            .s("trust", s.trust);
                        x.done()
                    }))
                }),
            );
    }
    j.line(out);
}

pub fn analysis_lines(_an: &An, a: &Analysis) -> String {
    let mut out = String::new();
    let p = &a.program;
    let mut j = J::obj();
    j.s("t", "program")
        .n("version", p.version as i64)
        .n("instructions", p.instructions as i64)
        .n("functions", p.functions as i64)
        .b("anchor", p.anchor)
        .b("idl", p.idl);
    j.line(&mut out);
    for ix in &a.ixs {
        let mut j = J::obj();
        j.s("t", "ix")
            .s("name", &ix.name)
            .s("handler", &ix.handler)
            .s("kind", ix.kind)
            .os("dispatch", ix.dispatch.as_deref())
            .n("score", ix.score)
            .raw("effects", &sarr(&ix.effects))
            .raw("functions", &sarr(&ix.functions))
            .raw("indirect", &sarr(&ix.indirect));
        j.line(&mut out);
        for x in &ix.accounts {
            let mut j = J::obj();
            j.s("t", "acct");
            if let Some(i) = x.index {
                j.f("index", i);
            }
            let mut e = J::obj();
            e.ob("signer", x.expected.signer)
                .ob("writable", x.expected.writable)
                .ob("pda", x.expected.pda)
                .os("address", x.expected.address.as_deref())
                .ob("optional", x.expected.optional);
            j.s("name", &x.name)
                .s("source", x.source)
                .raw("expected", &e.done())
                .raw(
                    "constraints",
                    &arr(x.constraints.iter().map(|(k, ev)| {
                        let mut o = J::obj();
                        o.s("status", ev.status)
                            .or("at", ev.at.as_ref().map(loc))
                            .os("via", ev.via.as_deref())
                            .os("note", ev.note);
                        format!("[{},{}]", jstr(k), o.done())
                    })),
                );
            j.line(&mut out);
        }
        for (i, c) in ix.checks.iter().enumerate() {
            let mut j = J::obj();
            j.s("t", "check")
                .n("id", i as i64)
                .raw("at", &loc(&c.at))
                .s("status", c.status)
                .os("account", c.account.as_deref())
                .raw("kinds", &strs(c.kinds.iter().copied()))
                .s("cond", &c.cond)
                .b("fails_if", c.fails_if)
                .s("error", &c.error)
                .os("via", c.via.as_deref())
                .or("sides", c.sides.as_ref().map(|(a, b)| pair(a, b)))
                .or(
                    "pdaBufs",
                    c.pda_bufs
                        .as_ref()
                        .map(|v| arr(v.iter().map(|x| js_num(*x)))),
                )
                .n("fnPc", c.fn_pc)
                .on("passPc", c.pass_pc)
                .b("main", c.main)
                .ob("keyCmp", c.key_cmp)
                .or("cross", c.cross.as_ref().map(|(a, b)| pair(a, b)));
            j.line(&mut out);
        }
        for o in &ix.ops {
            op_line(o, "op", true, &mut out);
        }
    }
    for x in &a.pdas {
        let mut j = J::obj();
        j.s("t", "pda")
            .s("seeds", &x.seeds)
            .s("program", &x.program)
            .raw("derivedIn", &sarr(&x.derived_in))
            .raw("signsIn", &sarr(&x.signs_in))
            .raw("accounts", &sarr(&x.accounts))
            .s("compared", x.compared);
        j.line(&mut out);
    }
    for (t, ws) in &a.state_writes {
        let mut j = J::obj();
        j.s("t", "writes").s("target", t).raw(
            "writes",
            &arr(ws.iter().map(|w| {
                let mut o = J::obj();
                o.s("ix", &w.ix).s("how", &w.how).raw("at", &loc(&w.at));
                o.done()
            })),
        );
        j.line(&mut out);
    }
    for (t, rb, wb) in &a.deps {
        let mut j = J::obj();
        j.s("t", "dep")
            .s("target", t)
            .raw("readBy", &sarr(rb))
            .raw("writtenBy", &sarr(wb));
        j.line(&mut out);
    }
    for o in &a.unattributed {
        op_line(o, "unattr", false, &mut out);
    }
    out
}
