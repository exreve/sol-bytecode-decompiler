//! Stage 8 dumps (the analysis foundation): scripts/dump8.ts dumpStage8.

use crate::enc::*;
use crate::stage3::threads;
use sbpf_ir::{Ir, E};
use sbpf_read::analysis::acct::{AcctRef, Side};
use sbpf_read::analysis::anchor::XField;
use sbpf_read::analysis::facts::FnFacts;
use sbpf_read::analysis::An;
use sbpf_read::decompile::{decompile_read_hook, ReadOut};
use sbpf_read::idl::IdlInfo;
use sbpf_read::views::FT;
use std::collections::HashSet;

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
    j.n("at", ff.at as i64)
        .raw("types", &arr(ff.types.iter().map(|(k, v)| pair(k, v))));
    j.line(out);
    for c in &ff.checks {
        let mut j = J::obj();
        j.s("t", "check").n("line", c.line);
        if let Some(pc) = c.pc {
            j.n("pc", pc);
        }
        j.s("cond", &c.cond)
            .b("failsIf", c.fails_if)
            .s("error", &c.error)
            .raw("kinds", &strs(c.kinds.iter().copied()));
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
        j.raw("kinds", &strs(o.kinds.iter().copied()))
            .s("text", &o.text)
            .b("main", o.main)
            .b("errPath", o.err_path);
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
            k.s("fn", &p.fn_)
                .s("seeds", &p.seeds)
                .s("program", &p.program);
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
        j.n("callee", c.callee)
            .b("main", c.main)
            .b("errPath", c.err_path);
        j.line(out);
    }
    for h in &ff.ix_hints {
        let mut j = J::obj();
        j.s("t", "hint")
            .n("line", h.line)
            .s("program", &h.program)
            .s("family", &h.family)
            .s("ix", &h.ix)
            .s("how", &h.how);
        if let Some((f, p)) = h.call {
            let mut k = J::obj();
            k.n("fn", f).n("pc", p);
            j.raw("call", &k.done());
        }
        j.line(out);
    }
    let mut j = J::obj();
    j.s("t", "pcline").raw(
        "m",
        &arr(ff.pc_line.iter().map(|(p, l)| format!("[{p},{l}]"))),
    );
    j.line(out);
    let mut j = J::obj();
    j.s("t", "condline").raw(
        "m",
        &arr(ff
            .cond_line
            .iter()
            .map(|(e, l)| format!("[{},{l}]", ex(ir, *e)))),
    );
    j.line(out);
}

fn num(x: f64) -> String {
    js_num(x)
}

fn nopt(x: Option<f64>) -> String {
    x.map_or("null".into(), num)
}

fn sopt(x: Option<&str>) -> String {
    x.map_or("null".into(), jstr)
}

fn acct_ref(x: &AcctRef) -> String {
    format!("[{},{}]", num(x.index), sopt(x.field.as_deref()))
}

fn side_j(s: &Side) -> String {
    match s {
        Side::None => "null".into(),
        Side::Stack => jstr("stack"),
        Side::Pda => jstr("pda"),
        Side::Const => jstr("const"),
        Side::Acct(a) => acct_ref(a),
    }
}

/// scripts/dump8.ts flowLines: the flow layer's outputs
pub fn flow_lines(an: &An) -> String {
    let mut out = String::new();
    // (analyze0's foundation calls, in its order)
    an.add_exit_writes();
    let ind = an.indirect_targets();
    let splits = an.splits();
    let ixs = an.ix_contexts(&ind, &splits);
    let fir = |pc: i64| an.fo(pc).map(|f| sbpf_read::analysis::flow::fir(f.f));
    for (pc, ex) in an.exit_fns().iter() {
        let fields = |fs: &[XField]| {
            arr(fs
                .iter()
                .map(|f| format!("[{},{},{}]", num(f.off), num(f.size), jstr(&f.name))))
        };
        let mut j = J::obj();
        j.s("t", "exit").n("pc", *pc);
        if let Some(t) = &ex.ty {
            j.s("type", t);
        }
        j.n("param", ex.param as i64)
            .raw("fields", &fields(&ex.fields));
        if let Some(subs) = &ex.subs {
            j.raw(
                "subs",
                &arr(subs.iter().map(|s| {
                    let mut o = J::obj();
                    if let Some(t) = &s.ty {
                        o.s("type", t);
                    }
                    o.raw("fields", &fields(&s.fields));
                    if let Some(n) = &s.name {
                        o.s("name", n);
                    }
                    o.done()
                })),
            );
        }
        j.line(&mut out);
    }
    for (pc, ff) in an.facts.borrow().iter() {
        let ir = fir(*pc).unwrap();
        for o in &ff.ops {
            if o.exit.is_none() {
                continue;
            }
            let one = FnFacts {
                pc: *pc,
                name: ff.name.clone(),
                ops: vec![o.clone()],
                ..Default::default()
            };
            let mut s = String::new();
            fn_facts_lines(ir, *pc, &one, &mut s);
            let l = s.lines().nth(1).unwrap();
            out.push_str(&l.replacen("{\"t\":\"op\"", &format!("{{\"t\":\"xop\",\"fn\":{pc}"), 1));
            out.push('\n');
        }
    }
    {
        let mut j = J::obj();
        j.s("t", "indirect")
            .raw(
                "targets",
                &arr(ind
                    .targets
                    .iter()
                    .map(|(k, v)| format!("[{k},{}]", nums(v.iter().copied())))),
            )
            .raw(
                "byDisc",
                &arr(ind
                    .by_disc
                    .iter()
                    .map(|(k, v)| format!("[\"0x{k:x}\",{}]", nums(v.iter().copied())))),
            );
        j.line(&mut out);
    }
    for (root, g) in &splits {
        let mut j = J::obj();
        j.s("t", "split")
            .n("root", *root)
            .raw(
                "via",
                &arr(g
                    .via
                    .iter()
                    .map(|(h, t)| format!("[{h},{}]", nums(t.iter().map(|&x| x as i64))))),
            )
            .raw(
                "groups",
                &arr(g.groups.iter().map(|x| {
                    let mut o = J::obj();
                    o.raw("tags", &nums(x.tags.iter().map(|&t| t as i64)))
                        .s("name", &x.name)
                        .s("source", x.source);
                    if let Some(a) = &x.accounts {
                        o.raw("accounts", &strs(a.iter().map(|s| s.as_str())));
                    }
                    o.raw(
                        "dispatchers",
                        &strs(x.dispatchers.iter().map(|s| s.as_str())),
                    );
                    o.raw("tag", &format!("[{},{}]", x.tag.0, x.tag.1));
                    o.done()
                })),
            );
        j.line(&mut out);
        for x in &g.groups {
            for fo in &an.funcs {
                if x.dispatchers.contains(&fo.name) {
                    let m: String = (0..fo.f.blocks.len())
                        .map(|b| if x.allowed(fo.pc, b) { '1' } else { '0' })
                        .collect();
                    let mut j = J::obj();
                    j.s("t", "allowed")
                        .s("name", &x.name)
                        .n("fn", fo.pc)
                        .s("m", &m);
                    j.line(&mut out);
                }
            }
        }
    }
    if an.anchor {
        for fo in &an.funcs {
            if !fo.name.starts_with("ix_") {
                continue;
            }
            if let Some(ti) = an.try_info(fo.pc) {
                let mut j = J::obj();
                j.s("t", "try").n("h", fo.pc).n("tryPc", ti.try_pc).raw(
                    "layout",
                    &arr(ti.layout.iter().map(|x| {
                        let t = match &x.t {
                            FT::Ref(to) => to.clone(),
                            FT::Embed(ty) => format!("embed {ty}"),
                            FT::Scalar(z) => format!("scalar {z}"),
                        };
                        format!(
                            "[{},{},{},{}]",
                            jstr(&x.name),
                            num(x.off),
                            jstr(&t),
                            sopt(x.doc.as_deref())
                        )
                    })),
                );
                if let Some(b) = &ti.box_info {
                    j.raw(
                        "boxInfo",
                        &arr(b.iter().map(|(n, o)| format!("[{},{}]", jstr(n), num(*o)))),
                    );
                }
                if let Some(w) = &ti.words {
                    j.raw(
                        "words",
                        &arr(w
                            .values()
                            .map(|(o, n, x)| format!("[{},{},{}]", num(*o), jstr(n), num(*x)))),
                    );
                }
                if let Some(p) = &ti.ptrs {
                    j.raw(
                        "ptrs",
                        &arr(p.iter().map(|(v, n)| format!("[{v},{}]", jstr(n)))),
                    );
                }
                if let Some(s) = &ti.seqs {
                    j.raw(
                        "seqs",
                        &arr(s
                            .iter()
                            .map(|(v, n)| format!("[{v},{}]", strs(n.iter().map(|x| x.as_str()))))),
                    );
                }
                j.line(&mut out);
            }
            if let Some(dr) = an.memo.data_reads.borrow().get(&fo.pc) {
                let mut j = J::obj();
                j.s("t", "dataReads")
                    .n("h", fo.pc)
                    .raw("accts", &strs(dr.iter().map(|s| s.as_str())));
                j.line(&mut out);
            }
        }
    }
    for ix in &ixs {
        let ctx = &ix.ctx;
        let mut j = J::obj();
        j.s("t", "ix")
            .s("name", &ix.name)
            .n("handler", ctx.handler)
            .raw("functions", &nums(ix.fns.iter().copied()))
            .raw(
                "parents",
                &arr(ctx.parents.iter().map(|(f, p)| {
                    format!(
                        "[{f},{},{},{}]",
                        p.fn_,
                        p.pc.map_or("null".into(), |x| x.to_string()),
                        p.ret.map_or("null".into(), |e| ex(fir(p.fn_).unwrap(), e))
                    )
                })),
            );
        if let Some(r) = &ctx.restricted {
            j.raw("restricted", &nums(r.iter().copied()));
        }
        if let Some((f, v)) = ctx.tag {
            j.raw("tag", &format!("[{f},{v}]"));
        }
        j.raw("indirect", &strs(ix.indirect.iter().map(|s| s.as_str())));
        j.raw(
            "accounts",
            &arr(ix.accounts.iter().map(|x| {
                format!(
                    "[{},{},{},{},{},{},{},{}]",
                    nopt(x.index),
                    jstr(&x.name),
                    jstr(x.source),
                    x.expected.signer,
                    x.expected.writable,
                    x.expected.pda,
                    x.expected.optional,
                    sopt(x.expected.address.as_deref())
                )
            })),
        );
        j.line(&mut out);
        if !an.anchor {
            for &fnpc in &ix.fns {
                let r = an.ctx_resolver(ctx, fnpc, 0);
                let (Some(r), Some(fo)) = (r, an.fo(fnpc)) else {
                    continue;
                };
                let fl = &an.fl;
                let mut conds: Vec<String> = Vec::new();
                let mut stores: Vec<String> = Vec::new();
                for (bi, b) in fo.f.blocks.iter().enumerate() {
                    for i in 0..b.stmts.len() {
                        let p = sbpf_read::analysis::flow::pos_of(bi, i);
                        if let Some((x, how)) = r.store(fl, Some(p)) {
                            stores.push(format!(
                                "[{p},{},{},{}]",
                                num(x.index),
                                sopt(x.field.as_deref()),
                                sopt(how)
                            ));
                        }
                    }
                    if let sbpf_ir::Term::Br { c, .. } = &b.term {
                        let refs = arr(r.refs(fl, *c, None).iter().map(acct_ref));
                        let sides = r.sides(fl, *c, None).map_or("null".into(), |(a, b)| {
                            format!("[{},{}]", side_j(&a), side_j(&b))
                        });
                        let c32 = r.cmp32(fl, *c, None);
                        let pe = nopt(r.pda_eq(fl, *c, None));
                        let pb = arr(r.pda_bufs(fl, *c, None).into_iter().map(num));
                        conds.push(format!("[{bi},{refs},{sides},{c32},{pe},{pb}]"));
                    }
                }
                let mut j = J::obj();
                j.s("t", "res")
                    .n("fn", fnpc)
                    .raw(
                        "byName",
                        &arr(r.by_name.iter().map(|(n, x)| {
                            format!(
                                "[{},{},{}]",
                                jstr(n),
                                num(x.index),
                                sopt(x.field.as_deref())
                            )
                        })),
                    )
                    .raw("conds", &format!("[{}]", conds.join(",")))
                    .raw("stores", &format!("[{}]", stores.join(",")));
                j.line(&mut out);
            }
        }
        // (the points the report reads: ops and checks of the instruction's functions)
        let mut pts: Vec<(i64, Option<usize>)> = Vec::new();
        for &fnpc in &ix.fns {
            let facts = an.facts.borrow();
            let ff = &facts[&fnpc];
            for o in &ff.ops {
                pts.push((fnpc, an.block_at(fnpc, o.pc, o.ret)));
            }
            for c in &ff.checks {
                let b = an.fo(fnpc).and_then(|_| {
                    sbpf_read::analysis::flow::decision_block(&an.cfg(fnpc), c.c, c.pc, c.pass_pc)
                });
                pts.push((fnpc, b));
            }
        }
        let mut seen_pt: HashSet<(i64, usize)> = HashSet::new();
        let mut seen_c: HashSet<(i64, usize)> = HashSet::new();
        for (fnpc, b) in pts {
            let Some(b) = b else { continue };
            if !seen_pt.insert((fnpc, b)) {
                continue;
            }
            let cs = an.path_to(Some(ctx), fnpc, Some(b), 80);
            let mut j = J::obj();
            j.s("t", "path").n("fn", fnpc).n("b", b as i64).raw(
                "conds",
                &arr(cs.iter().map(|c| {
                    format!(
                        "[{},{},{},{},{}]",
                        c.fn_,
                        c.b,
                        c.holds.map_or("null".into(), |h| h.to_string()),
                        jstr(c.how),
                        c.panics
                    )
                })),
            );
            j.line(&mut out);
            for c in &cs {
                if !seen_c.insert((c.fn_, c.b)) {
                    continue;
                }
                let key = an.value_key(Some(ctx), c.fn_, c.c, c.pos, 0);
                let cmps = an.cmps_of(Some(ctx), c.fn_, c.c, c.pos);
                let mut j = J::obj();
                j.s("t", "vk")
                    .n("fn", c.fn_)
                    .n("b", c.b as i64)
                    .s("key", &key)
                    .raw(
                        "cmps",
                        &arr(cmps
                            .iter()
                            .map(|(o, a, b)| format!("[{},{},{}]", jstr(o), jstr(a), jstr(b)))),
                    );
                j.line(&mut out);
            }
        }
        let sc = an.source_ctx(ix);
        for &fnpc in &ix.fns {
            let ops: Vec<i64> = an.facts.borrow()[&fnpc]
                .ops
                .iter()
                .filter_map(|o| o.pc)
                .collect();
            for opc in ops {
                let Some((b, i)) = an.stmt_at(fnpc, opc) else {
                    continue;
                };
                let f = an.fo(fnpc).unwrap().f;
                let ir = fir(fnpc).unwrap();
                let s = &f.blocks[b].stmts[i];
                let p = sbpf_read::analysis::flow::pos_of(b, i);
                let vals: Vec<sbpf_ir::E> = match s {
                    sbpf_ir::Stmt::Store { v, .. } => vec![*v],
                    _ => sbpf_read::analysis::flow::call_of(ir, s)
                        .map_or(vec![], |(_, a)| ir.to_vec(a)),
                };
                let v = arr(vals.iter().map(|&v| {
                    arr(sc.of(fnpc, v, p).iter().map(|x| {
                        format!(
                            "[{},{},{}]",
                            jstr(&x.source),
                            jstr(x.kind),
                            sopt(x.acct.as_deref())
                        )
                    }))
                }));
                let mut j = J::obj();
                j.s("t", "src").n("fn", fnpc).n("pc", opc).raw("v", &v);
                j.line(&mut out);
            }
        }
    }
    out
}

pub fn facts_lines(r: &ReadOut, out: &mut String) {
    let p = r.program.as_ref().unwrap();
    for (pc, ff) in &r.facts {
        let f = &p.funcs[pc];
        let ir = f.ir.as_ref().unwrap_or(&p.ir);
        fn_facts_lines(ir, *pc, ff, out);
    }
}

pub fn dump_stage8(
    bytes: &[u8],
    stages: &[String],
    idl: Option<&IdlInfo>,
    res: &mut Vec<(&'static str, String)>,
) {
    let want = |s: &str| stages.iter().any(|x| x == s);
    let wanted: Vec<&'static str> = ["facts", "flow", "analysis"]
        .into_iter()
        .filter(|s| want(s))
        .collect();
    if wanted.is_empty() {
        return;
    }
    let (wa, wf) = (want("analysis"), want("flow"));
    // (the analysis first, as the TS single file runs it before the dump's flow walk)
    let hook = |an: &An| {
        let a = if wa {
            an.analyze(|a, _| crate::stage8b::analysis_lines(an, a))
        } else {
            String::new()
        };
        let f = if wf { flow_lines(an) } else { String::new() };
        format!("{a}\u{0}{f}")
    };
    let r = match decompile_read_hook(
        bytes,
        idl,
        threads(),
        false,
        if wa || wf { Some(&hook) } else { None },
    ) {
        Ok(r) => r,
        Err(e) => {
            for st in wanted {
                res.push((st, header(st) + &err_line(&e)));
            }
            return;
        }
    };
    if want("facts") {
        let mut o = header("facts");
        facts_lines(&r, &mut o);
        res.push(("facts", o));
    }
    let fl = r.flow.as_deref().unwrap_or("\u{0}");
    let (a, f) = fl.split_once('\u{0}').unwrap_or(("", ""));
    if wf {
        res.push(("flow", header("flow") + f));
    }
    if wa {
        res.push(("analysis", header("analysis") + a));
    }
}
