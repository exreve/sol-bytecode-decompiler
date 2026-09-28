//! Stage 4 dumps (`struct`, `text`, `rawfile`).

use crate::enc::*;
use crate::stage3::threads;
use sbpf_ir::Ir;
use sbpf_print::raw::{decompile_raw, render_single};
use sbpf_struct::{SNode, Tree};

fn nodes(ir: &Ir, t: &Tree, ns: &[SNode], o: &mut String) {
    o.push('[');
    for (i, n) in ns.iter().enumerate() {
        if i > 0 {
            o.push(',');
        }
        node(ir, t, n, o);
    }
    o.push(']');
}

fn label(l: Option<sbpf_struct::Label>, o: &mut String) {
    match l {
        Some(l) => {
            o.push('"');
            l.write(o);
            o.push('"');
        }
        None => o.push_str("null"),
    }
}

fn node(ir: &Ir, t: &Tree, n: &SNode, o: &mut String) {
    match n {
        SNode::Stmt(s) => {
            o.push_str("{\"k\":\"stmt\",\"s\":");
            stmt(ir, t.stmt(*s), o);
            o.push('}');
        }
        SNode::If { c, then, els } => {
            o.push_str("{\"k\":\"if\",\"c\":");
            expr(ir, *c, o);
            o.push_str(",\"then\":");
            nodes(ir, t, then, o);
            o.push_str(",\"else\":");
            nodes(ir, t, els, o);
            o.push('}');
        }
        SNode::Block { label: l, body } => {
            o.push_str("{\"k\":\"block\",\"label\":");
            label(Some(*l), o);
            o.push_str(",\"body\":");
            nodes(ir, t, body, o);
            o.push('}');
        }
        SNode::Loop {
            label: l,
            body,
            form,
            c,
        } => {
            o.push_str("{\"k\":\"loop\",\"label\":");
            label(*l, o);
            o.push_str(",\"body\":");
            nodes(ir, t, body, o);
            o.push_str(",\"form\":\"");
            o.push_str(form.as_str());
            o.push('"');
            if let Some(c) = c {
                o.push_str(",\"c\":");
                expr(ir, *c, o);
            }
            o.push('}');
        }
        SNode::Break(l) | SNode::Continue(l) => {
            o.push_str(if matches!(n, SNode::Break(_)) {
                "{\"k\":\"break\",\"label\":"
            } else {
                "{\"k\":\"continue\",\"label\":"
            });
            label(*l, o);
            o.push('}');
        }
        SNode::Return(e) => {
            o.push_str("{\"k\":\"return\",\"e\":");
            match e {
                Some(e) => expr(ir, *e, o),
                None => o.push_str("null"),
            }
            o.push('}');
        }
        SNode::Trap(msg) => {
            o.push_str("{\"k\":\"trap\",\"msg\":");
            push_str(o, msg);
            o.push('}');
        }
        SNode::Switch { v, cases } => {
            o.push_str(&format!("{{\"k\":\"switch\",\"v\":{v},\"cases\":["));
            for (i, (vals, body)) in cases.iter().enumerate() {
                if i > 0 {
                    o.push(',');
                }
                o.push_str("{\"vals\":");
                o.push_str(&nums(vals.iter().copied()));
                o.push_str(",\"body\":");
                nodes(ir, t, body, o);
                o.push('}');
            }
            o.push_str("]}");
        }
        SNode::SetState { v, val } => {
            o.push_str(&format!("{{\"k\":\"setstate\",\"v\":{v},\"val\":{val}}}"));
        }
    }
}

pub fn dump_stage4(bytes: &[u8], stages: &[String], res: &mut Vec<(&'static str, String)>) {
    let want = |s: &str| stages.iter().any(|x| x == s);
    if !["struct", "text", "rawfile"].iter().any(|s| want(s)) {
        return;
    }
    let r = match decompile_raw(bytes, threads()) {
        Ok(r) => r,
        Err(e) => {
            res.push(("struct", header("struct") + &err_line(&e)));
            return;
        }
    };
    if want("struct") {
        let mut o = header("struct");
        for rf in &r.funcs {
            let f = &r.p.funcs[&rf.pc];
            let ir = f.ir.as_ref().unwrap();
            let mut j = J::obj();
            j.s("t", "func")
                .n("pc", rf.pc)
                .b("irreducible", rf.tree.irreducible)
                .n("nvars", f.vars.len() as i64);
            let mut b = String::new();
            nodes(ir, &rf.tree, &rf.tree.body, &mut b);
            j.raw("body", &b);
            j.line(&mut o);
        }
        res.push(("struct", o));
    }
    if want("text") {
        let mut o = header("text");
        for rf in &r.funcs {
            let mut j = J::obj();
            j.s("t", "func")
                .n("pc", rf.pc)
                .s("name", &r.p.funcs[&rf.pc].name)
                .s("text", &rf.text);
            j.line(&mut o);
        }
        res.push(("text", o));
    }
    if want("rawfile") {
        let mut j = J::obj();
        j.s("text", &render_single(&r));
        let mut o = header("rawfile");
        j.line(&mut o);
        res.push(("rawfile", o));
    }
}
