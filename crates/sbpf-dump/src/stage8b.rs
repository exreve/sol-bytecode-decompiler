//! Stage 8b dump: the analysis before the incident rules.

use crate::enc::*;
use sbpf_read::analysis::facts::{OpCpi, Pda};
use sbpf_read::analysis::report::{Analysis, IxOut, Loc, OpOut};
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

pub fn analysis_lines(an: &An, a: &Analysis) -> String {
    if let Some(e) = an.err.borrow().as_ref() {
        return err_line(e);
    }
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
        phase2_lines(ix, &mut out);
    }
    for s in a.states.iter().flatten() {
        let row = |l: &[(String, String, Loc)], k: &str| {
            arr(l.iter().map(|(ix, v, at)| {
                let mut o = J::obj();
                o.s("ix", ix).s(k, v).raw("at", &loc(at));
                o.done()
            }))
        };
        let mut j = J::obj();
        j.s("t", "state")
            .s("field", &s.field)
            .raw("setBy", &row(&s.set_by, "value"))
            .raw("checkedBy", &row(&s.checked_by, "cond"));
        j.line(&mut out);
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
    for f in &a.rule_findings {
        let mut j = J::obj();
        j.s("t", "finding")
            .s("rule", f.rule)
            .s("ix", &f.ix)
            .s("confidence", f.confidence)
            .f("weight", f.weight)
            .s("title", f.title)
            .raw("accounts", &sarr(&f.accounts))
            .raw("path", &sarr(&f.path))
            .raw("evidence", &sarr(&f.evidence));
        j.line(&mut out);
    }
    for (f, w) in a.authority_fields.iter().flatten() {
        let mut j = J::obj();
        j.s("t", "authField")
            .s("field", f)
            .raw("writtenBy", &sarr(w));
        j.line(&mut out);
    }
    for v in a.consistency.iter().flatten() {
        let mut j = J::obj();
        j.s("t", "role")
            .s("role", &v.role)
            .s("by", v.by)
            .raw(
                "members",
                &arr(v.members.iter().map(|m| {
                    let mut o = J::obj();
                    o.s("ix", &m.ix)
                        .s("account", &m.account)
                        .raw("validations", &sarr(&m.validations))
                        .raw("uses", &sarr(&m.uses));
                    o.done()
                })),
            )
            .raw(
                "inconsistencies",
                &arr(v.inconsistencies.iter().map(|x| {
                    let mut o = J::obj();
                    o.s("role", &x.role)
                        .s("ix", &x.ix)
                        .s("account", &x.account)
                        .s("validation", &x.validation)
                        .raw(
                            "appliedIn",
                            &arr(x.applied_in.iter().map(|(ix, ac, at)| {
                                let mut y = J::obj();
                                y.s("ix", ix)
                                    .s("account", ac)
                                    .or("at", at.as_ref().map(loc));
                                y.done()
                            })),
                        )
                        .n("others", x.others as i64)
                        .raw("uses", &sarr(&x.uses))
                        .f("weight", x.weight);
                    o.done()
                })),
            );
        j.line(&mut out);
    }
    for o in &a.unattributed {
        op_line(o, "unattr", false, &mut out);
    }
    for f in &a.findings {
        let mut j = J::obj();
        j.s("t", "ranked")
            .s("rule", f.rule)
            .s("ix", &f.ix)
            .s("confidence", f.confidence)
            .f("weight", f.weight)
            .s("title", f.title)
            .raw("accounts", &sarr(&f.accounts))
            .raw("path", &sarr(&f.path))
            .raw("evidence", &sarr(&f.evidence));
        j.line(&mut out);
    }
    for m in a.fund_movers.iter().flatten() {
        let mut j = J::obj();
        j.s("t", "fundMover")
            .s("instruction", &m.instruction)
            .s("authority", &m.authority)
            .s("kind", &m.kind)
            .os("from", m.from.as_deref())
            .s("at", &m.at);
        j.line(&mut out);
    }
    out
}

fn guard_j(g: &Option<(Loc, String)>) -> Option<String> {
    g.as_ref().map(|(at, c)| {
        let mut o = J::obj();
        o.raw("at", &loc(at)).s("cond", c);
        o.done()
    })
}

fn rows_line(t: &str, rows: String, out: &mut String) {
    let mut j = J::obj();
    j.s("t", t).raw("rows", &rows);
    j.line(out);
}

/// the phase 2 / 3 / audit rows of an instruction
fn phase2_lines(ix: &IxOut, out: &mut String) {
    if let Some(t) = &ix.trust {
        rows_line(
            "trust",
            arr(t.iter().map(|x| {
                let mut o = J::obj();
                o.s("value", &x.value)
                    .s("trust", x.trust)
                    .raw("evidence", &sarr(&x.evidence));
                o.done()
            })),
            out,
        );
    }
    if let Some(r) = &ix.relations {
        rows_line(
            "relations",
            arr(r.iter().map(|x| {
                let mut o = J::obj();
                o.s("a", &x.a)
                    .s("b", &x.b)
                    .s("kind", x.kind)
                    .s("status", x.status)
                    .raw("at", &loc(&x.at));
                if let Some(n) = x.negated {
                    o.b("negated", n);
                }
                o.done()
            })),
            out,
        );
    }
    if let Some(r) = &ix.stored_keys {
        rows_line(
            "storedKeys",
            arr(r.iter().map(|x| {
                let mut o = J::obj();
                o.s("account", &x.account)
                    .os("type", x.ty.as_deref())
                    .raw("compared", &sarr(&x.compared))
                    .raw("referencedBy", &sarr(&x.referenced_by))
                    .raw("never", &sarr(&x.never))
                    .raw("gaps", &sarr(&x.gaps));
                o.done()
            })),
            out,
        );
    }
    if let Some(r) = &ix.authority {
        rows_line(
            "authority",
            arr(r.iter().map(|x| {
                let mut o = J::obj();
                o.n("op", x.op as i64).s("kind", &x.kind).raw(
                    "enabledBy",
                    &arr(x.enabled_by.iter().map(|e| {
                        let mut y = J::obj();
                        y.s("kind", e.kind)
                            .s("what", &e.what)
                            .os("status", e.status)
                            .or("writtenBy", e.written_by.as_ref().map(|w| sarr(w)));
                        y.done()
                    })),
                );
                o.done()
            })),
            out,
        );
    }
    if let Some(r) = &ix.paths {
        rows_line(
            "paths",
            arr(r.iter().map(|p| {
                let mut o = J::obj();
                o.n("op", p.op as i64)
                    .raw(
                        "conds",
                        &arr(p.conds.iter().map(|c| {
                            let mut y = J::obj();
                            y.raw("at", &loc(&c.at))
                                .s("cond", &c.cond)
                                .b("holds", c.holds)
                                .s("how", c.how)
                                .on("check", c.check.map(|x| x as i64));
                            y.done()
                        })),
                    )
                    .raw(
                        "notRequired",
                        &arr(p.not_required.iter().map(|(c, path)| {
                            let mut y = J::obj();
                            y.n("check", *c as i64)
                                .or("path", path.as_ref().map(|l| arr(l.iter().map(loc))));
                            y.done()
                        })),
                    );
                if let Some(t) = p.truncated {
                    o.b("truncated", t);
                }
                o.done()
            })),
            out,
        );
    }
    if let Some(r) = &ix.chains {
        rows_line(
            "chains",
            arr(r.iter().map(|c| {
                let mut o = J::obj();
                o.n("op", c.op as i64).raw(
                    "steps",
                    &arr(c.steps.iter().map(|s| {
                        arr(s.iter().map(|x| {
                            let mut y = J::obj();
                            y.s("kind", x.kind)
                                .s("what", &x.what)
                                .os("status", x.status);
                            y.done()
                        }))
                    })),
                );
                o.done()
            })),
            out,
        );
    }
    if let Some(r) = &ix.arith {
        rows_line(
            "arith",
            arr(r.iter().map(|x| {
                let mut o = J::obj();
                o.raw("at", &loc(&x.at))
                    .on("op", x.op.map(|v| v as i64))
                    .s("target", &x.target)
                    .s("expr", &x.expr)
                    .s("kind", x.kind)
                    .s("status", x.status)
                    .or("guard", guard_j(&x.guard));
                if let Some(c) = x.caller {
                    o.b("caller", c);
                }
                if let Some(u) = x.unnamed {
                    o.b("unnamed", u);
                }
                o.done()
            })),
            out,
        );
    }
    if let Some(r) = &ix.divs {
        rows_line(
            "divs",
            arr(r.iter().map(|x| {
                let mut o = J::obj();
                o.raw("at", &loc(&x.at))
                    .s("expr", &x.expr)
                    .s("divisor", &x.divisor)
                    .s("status", x.status)
                    .or("guard", guard_j(&x.guard));
                o.done()
            })),
            out,
        );
    }
    if let Some(r) = &ix.proof {
        rows_line(
            "proof",
            arr(r.iter().map(|p| {
                let mut o = J::obj();
                o.n("op", p.op as i64).s("kind", &p.kind).raw(
                    "props",
                    &arr(p.props.iter().map(|x| {
                        let mut y = J::obj();
                        y.s("prop", &x.prop)
                            .s("status", x.status)
                            .s("evidence", &x.evidence);
                        y.done()
                    })),
                );
                o.done()
            })),
            out,
        );
    }
    if let Some(au) = &ix.audit {
        let mut j = J::obj();
        j.s("t", "audit")
            .raw("dataReads", &sarr(&au.data_reads))
            .raw(
                "bumps",
                &arr(au.bumps.iter().map(|(op, s)| {
                    let mut o = J::obj();
                    o.n("op", *op as i64).s("source", s);
                    o.done()
                })),
            )
            .raw("ignored", &nums(au.ignored.iter().map(|x| *x as i64)))
            .raw(
                "casts",
                &arr(au.casts.iter().map(|(op, e, bits, s)| {
                    let mut o = J::obj();
                    o.n("op", *op as i64)
                        .s("expr", e)
                        .n("bits", *bits as i64)
                        .s("source", s);
                    o.done()
                })),
            )
            .raw("remChecked", &sarr(&au.rem_checked))
            .or("ownerCmp", au.owner_cmp.as_ref().map(|x| sarr(x)))
            .raw(
                "reinit",
                &arr(au.reinit.iter().map(|(op, a)| {
                    let mut o = J::obj();
                    o.n("op", *op as i64).s("acct", a);
                    o.done()
                })),
            )
            .or(
                "sameType",
                au.same_type.as_ref().map(|(f, n, t, accts)| {
                    let mut o = J::obj();
                    o.s("fn", f)
                        .n("n", *n as i64)
                        .os("type", t.as_deref())
                        .raw("accts", &sarr(accts));
                    o.done()
                }),
            )
            .or(
                "initWrites",
                au.init_writes.as_ref().map(|l| {
                    arr(l.iter().map(|x| {
                        let mut o = J::obj();
                        o.s("acct", &x.acct)
                            .s("type", &x.ty)
                            .raw("at", &loc(&x.at))
                            .b("owner", x.owner)
                            .os("field", x.field.as_deref())
                            .os("tag", x.tag.as_deref());
                        o.done()
                    }))
                }),
            )
            .or(
                "sysvarReads",
                au.sysvar_reads.as_ref().map(|l| {
                    arr(l.iter().map(|x| {
                        let mut o = J::obj();
                        o.s("acct", &x.acct)
                            .s("sysvar", x.sysvar)
                            .raw("at", &loc(&x.at))
                            .b("idCompared", x.id_compared);
                        o.done()
                    }))
                }),
            )
            .or("initGated", au.init_gated.as_ref().map(|x| sarr(x)));
        j.line(out);
    }
}
