//! Rendering of the analysis (`src/analysis/report.ts` renderJson / renderSummary / renderIx /
//! renderSummaryComment, `src/budget.ts`): security/analysis.json, security/summary.md, security/<ix>.md and the
//! single file's summary comment.

use super::js_slice;
use super::json::{utf16_len, Jv};
use super::phase2::Finding;
use super::report::{AcctOut, Analysis, CheckOut, Evidence, IxOut, Loc, OpOut};
use crate::util::js_num;
use sbpf_ir::fx::{IndexMap, IndexSet};

/// Where a location is in the written files (`file`, `line`), or None (single-file output).
pub type Where<'w> = &'w dyn Fn(Option<&str>, &Loc) -> Option<(String, i64)>;

pub const BUDGET_SUMMARY_LINES: usize = 150;
pub const BUDGET_IX_LINES: usize = 400;
pub const BUDGET_JSON_BYTES: usize = 2 * 1024 * 1024;
pub const BUDGET_BUNDLE_LINES: usize = 30_000;

fn at2s(w: Where, ix: Option<&str>, at: &Loc) -> String {
    match w(ix, at) {
        Some((f, l)) => format!("{f}:{l}"),
        None => format!("{}:{}", at.fn_, at.line),
    }
}

fn st(s: &str) -> &str {
    match s {
        "found" => "found",
        "partial" => "found on some paths",
        "not_found" => "NOT FOUND",
        "runtime" => "runtime",
        _ => s,
    }
}

fn sl(s: &str, n: usize) -> String {
    js_slice(s, 0, Some(n))
}

fn weight(k: &str) -> f64 {
    match k {
        "TOKEN_TRANSFER" | "LAMPORT_TRANSFER" | "MINT" => 5.0,
        "BURN" | "PDA_SIGNATURE" => 3.0,
        "PROGRAM_UPGRADE" => 6.0,
        "AUTHORITY_WRITE" | "ACCOUNT_CLOSE" | "OWNER_ASSIGN" | "LAMPORT_WRITE" => 4.0,
        "ACCOUNT_REALLOC" | "ACCOUNT_CREATE" => 2.0,
        "ACCOUNT_DATA_WRITE" | "CPI" => 1.0,
        _ => 0.0,
    }
}

// ---- analysis.json ----

fn loc_j(w: Where, ix: Option<&str>, at: &Loc) -> Jv {
    let x = w(ix, at);
    Jv::obj()
        .with("fn", Jv::s(&at.fn_))
        .with("line", Jv::n(at.line as f64))
        .with_opt("pc", at.pc.map(|p| Jv::n(p as f64)))
        .with_opt("file", x.as_ref().map(|x| Jv::s(&x.0)))
        .with_opt("file_line", x.as_ref().map(|x| Jv::n(x.1 as f64)))
}

fn nums(v: &[usize]) -> Jv {
    Jv::Arr(v.iter().map(|&x| Jv::n(x as f64)).collect())
}

fn cpi_accounts(c: &crate::analysis::facts::OpCpi) -> Jv {
    Jv::Arr(
        c.accounts
            .iter()
            .map(|x| {
                let mut o = Jv::obj();
                for &k in &x.ord.0 {
                    match k {
                        0 => o.opt("role", x.role.as_ref().map(|r| Jv::s(r))),
                        1 => o.set("text", Jv::s(&x.text)),
                        2 => o.opt("w", x.w.map(Jv::n)),
                        3 => o.opt("s", x.s.map(Jv::n)),
                        _ => &mut o,
                    };
                }
                o
            })
            .collect(),
    )
}

fn cpi_fields(c: &crate::analysis::facts::OpCpi) -> Jv {
    Jv::Arr(
        c.fields
            .iter()
            .map(|(k, v)| Jv::Arr(vec![Jv::s(k), Jv::s(v)]))
            .collect(),
    )
}

/// security/analysis.json
pub fn render_json(a: &Analysis, w: Where) -> String {
    let lj = |ix: &str, at: &Loc| loc_j(w, Some(ix), at);
    let ev = |ix: &str, e: &Evidence| {
        Jv::obj()
            .with("status", Jv::s(e.status))
            .with_opt("at", e.at.as_ref().map(|at| lj(ix, at)))
            .with_opt("via", e.via.as_ref().map(|v| Jv::s(v)))
            .with_opt("note", e.note.map(Jv::s))
    };
    let guard = |ix: &str, g: &Option<(Loc, String)>| {
        g.as_ref()
            .map(|(at, cond)| Jv::obj().with("at", lj(ix, at)).with("cond", Jv::s(cond)))
    };
    let p = &a.program;
    let mut doc = Jv::obj()
        .with("schema", Jv::s("sbpf-decompiler/security@1"))
        .with("note", Jv::s("derived, over-approximate facts read off the decompiled code (the verified source of truth); statuses: found | partial (a complete check, not on every path to the operations) | not_found (no check found, not a proof of absence) | runtime (enforced by the Solana runtime)"))
        .with(
            "program",
            Jv::obj()
                .with("version", Jv::n(p.version as f64))
                .with("instructions", Jv::n(p.instructions as f64))
                .with("functions", Jv::n(p.functions as f64))
                .with("anchor", Jv::Bool(p.anchor))
                .with("idl", Jv::Bool(p.idl)),
        );
    let mut ixs = Vec::new();
    for ix in &a.ixs {
        let n = ix.name.as_str();
        let accounts = Jv::Arr(
            ix.accounts
                .iter()
                .map(|x| {
                    let e = &x.expected;
                    let exp = Jv::obj()
                        .with_opt("signer", e.signer.then_some(Jv::Bool(true)))
                        .with_opt("writable", e.writable.then_some(Jv::Bool(true)))
                        .with_opt("pda", e.pda.then_some(Jv::Bool(true)))
                        .with_opt("optional", e.optional.then_some(Jv::Bool(true)))
                        .with_opt("address", e.address.as_ref().map(|s| Jv::s(s)));
                    Jv::obj()
                        .with_opt("index", x.index.map(Jv::n))
                        .with("name", Jv::s(&x.name))
                        .with("source", Jv::s(x.source))
                        .with("expected", exp)
                        .with(
                            "constraints",
                            Jv::Obj(
                                x.constraints
                                    .iter()
                                    .map(|(k, e)| (k.to_string(), ev(n, e)))
                                    .collect(),
                            ),
                        )
                })
                .collect(),
        );
        let checks = Jv::Arr(
            ix.checks
                .iter()
                .enumerate()
                .map(|(i, c)| {
                    Jv::obj()
                        .with("id", Jv::n(i as f64))
                        .with("at", lj(n, &c.at))
                        .with("status", Jv::s(c.status))
                        .with_opt("account", c.account.as_ref().map(|s| Jv::s(s)))
                        .with("kinds", Jv::strs(&c.kinds))
                        .with("cond", Jv::s(&c.cond))
                        .with("fails_if", Jv::Bool(c.fails_if))
                        .with("error", Jv::s(&c.error))
                        .with_opt("via", c.via.as_ref().map(|s| Jv::s(s)))
                })
                .collect(),
        );
        let ops = Jv::Arr(
            ix.ops
                .iter()
                .map(|o| {
                    let cpi = o.cpi.as_ref().map(|c| {
                        let c = c.borrow();
                        let known = c.known.as_deref().is_some_and(|k| !k.is_empty());
                        Jv::obj()
                            .with("program", Jv::s(&c.program))
                            .with_opt("known", c.known.as_ref().map(|s| Jv::s(s)))
                            .with(
                                "program_check",
                                Jv::s(if known {
                                    "constant"
                                } else {
                                    c.checked.as_deref().unwrap_or("unknown")
                                }),
                            )
                            .with_opt("instruction", c.ix.as_ref().map(|s| Jv::s(s)))
                            .with("accounts", cpi_accounts(&c))
                            .with("fields", cpi_fields(&c))
                            .with_opt("seeds", c.seeds.as_ref().map(|s| Jv::s(s)))
                    });
                    Jv::obj()
                        .with("at", lj(n, &o.at))
                        .with("kinds", Jv::strs(&o.kinds))
                        .with("text", Jv::s(&o.text))
                        .with("path", Jv::s(if o.main { "main" } else { "conditional" }))
                        .with_opt("target", o.target.as_ref().map(|s| Jv::s(s)))
                        .with_opt("how", o.how.map(Jv::s))
                        .with_opt("value", o.value.as_ref().map(|s| Jv::s(s)))
                        .with_opt("cpi", cpi)
                        .with_opt(
                            "pda",
                            o.pda.as_ref().map(|p| {
                                Jv::obj()
                                    .with("fn", Jv::s(&p.fn_))
                                    .with("seeds", Jv::s(&p.seeds))
                                    .with("program", Jv::s(&p.program))
                            }),
                        )
                        .with_opt("guarded_by", o.guards.as_ref().map(|g| nums(g)))
                        .with_opt(
                            "bypass",
                            o.bypass.as_ref().map(|bs| {
                                Jv::Arr(
                                    bs.iter()
                                        .map(|b| {
                                            Jv::obj().with("check", Jv::n(b.check as f64)).with(
                                                "path",
                                                Jv::Arr(b.path.iter().map(|x| lj(n, x)).collect()),
                                            )
                                        })
                                        .collect(),
                                )
                            }),
                        )
                        .with_opt(
                            "sources",
                            o.sources.as_ref().map(|s| {
                                Jv::Arr(
                                    s.iter()
                                        .map(|x| {
                                            Jv::obj()
                                                .with("param", Jv::s(&x.param))
                                                .with("source", Jv::s(&x.source))
                                                .with("trust", Jv::s(x.trust))
                                        })
                                        .collect(),
                                )
                            }),
                        )
                })
                .collect(),
        );
        let mut o = Jv::obj()
            .with("name", Jv::s(n))
            .with("handler", Jv::s(&ix.handler))
            .with("kind", Jv::s(ix.kind))
            .with_opt("dispatch", ix.dispatch.as_ref().map(|s| Jv::s(s)))
            .with("score", Jv::n(ix.score as f64))
            .with("effects", Jv::strs(&ix.effects))
            .with("functions", Jv::strs(&ix.functions))
            .with_opt(
                "indirect",
                (!ix.indirect.is_empty()).then(|| Jv::strs(&ix.indirect)),
            )
            .with("accounts", accounts)
            .with("checks", checks)
            .with("operations", ops);
        o.opt(
            "trust",
            ix.trust.as_ref().map(|t| {
                Jv::Arr(
                    t.iter()
                        .map(|x| {
                            Jv::obj()
                                .with("value", Jv::s(&x.value))
                                .with("trust", Jv::s(x.trust))
                                .with("evidence", Jv::strs(&x.evidence))
                        })
                        .collect(),
                )
            }),
        );
        o.opt(
            "relations",
            ix.relations.as_ref().map(|r| {
                Jv::Arr(
                    r.iter()
                        .map(|x| {
                            Jv::obj()
                                .with("a", Jv::s(&x.a))
                                .with("b", Jv::s(&x.b))
                                .with("kind", Jv::s(x.kind))
                                .with("status", Jv::s(x.status))
                                .with("at", lj(n, &x.at))
                                .with_opt("negated", x.negated.map(Jv::Bool))
                        })
                        .collect(),
                )
            }),
        );
        o.opt(
            "stored_keys",
            ix.stored_keys.as_ref().filter(|s| !s.is_empty()).map(|s| {
                Jv::Arr(
                    s.iter()
                        .map(|k| {
                            Jv::obj()
                                .with("account", Jv::s(&k.account))
                                .with_opt("type", k.ty.as_ref().map(|t| Jv::s(t)))
                                .with("compared", Jv::strs(&k.compared))
                                .with("referencedBy", Jv::strs(&k.referenced_by))
                                .with("never", Jv::strs(&k.never))
                                .with("gaps", Jv::strs(&k.gaps))
                        })
                        .collect(),
                )
            }),
        );
        o.opt(
            "authority",
            ix.authority.as_ref().map(|r| {
                Jv::Arr(
                    r.iter()
                        .map(|x| {
                            Jv::obj()
                                .with("operation", Jv::n(x.op as f64))
                                .with("kind", Jv::s(&x.kind))
                                .with(
                                    "enabled_by",
                                    Jv::Arr(
                                        x.enabled_by
                                            .iter()
                                            .map(|e| {
                                                Jv::obj()
                                                    .with("kind", Jv::s(e.kind))
                                                    .with("what", Jv::s(&e.what))
                                                    .with_opt("status", e.status.map(Jv::s))
                                                    .with_opt(
                                                        "writtenBy",
                                                        e.written_by.as_ref().map(|w| Jv::strs(w)),
                                                    )
                                            })
                                            .collect(),
                                    ),
                                )
                        })
                        .collect(),
                )
            }),
        );
        o.opt(
            "path_conditions",
            ix.paths.as_ref().map(|ps| {
                Jv::Arr(
                    ps.iter()
                        .map(|p| {
                            Jv::obj()
                                .with("operation", Jv::n(p.op as f64))
                                .with(
                                    "conditions",
                                    Jv::Arr(
                                        p.conds
                                            .iter()
                                            .map(|c| {
                                                Jv::obj()
                                                    .with("at", lj(n, &c.at))
                                                    .with("cond", Jv::s(&c.cond))
                                                    .with("holds", Jv::Bool(c.holds))
                                                    .with("how", Jv::s(c.how))
                                                    .with_opt(
                                                        "check",
                                                        c.check.map(|x| Jv::n(x as f64)),
                                                    )
                                            })
                                            .collect(),
                                    ),
                                )
                                .with(
                                    "not_required",
                                    Jv::Arr(
                                        p.not_required
                                            .iter()
                                            .map(|(c, path)| {
                                                Jv::obj().with("check", Jv::n(*c as f64)).with_opt(
                                                    "path",
                                                    path.as_ref().map(|p| {
                                                        Jv::Arr(
                                                            p.iter().map(|y| lj(n, y)).collect(),
                                                        )
                                                    }),
                                                )
                                            })
                                            .collect(),
                                    ),
                                )
                                .with_opt("truncated", p.truncated.map(Jv::Bool))
                        })
                        .collect(),
                )
            }),
        );
        o.opt(
            "auth_chains",
            ix.chains.as_ref().map(|cs| {
                Jv::Arr(
                    cs.iter()
                        .map(|c| {
                            Jv::obj().with("operation", Jv::n(c.op as f64)).with(
                                "chains",
                                Jv::Arr(
                                    c.steps
                                        .iter()
                                        .map(|alt| {
                                            Jv::Arr(
                                                alt.iter()
                                                    .map(|s| {
                                                        Jv::obj()
                                                            .with("kind", Jv::s(s.kind))
                                                            .with("what", Jv::s(&s.what))
                                                            .with_opt("status", s.status.map(Jv::s))
                                                    })
                                                    .collect(),
                                            )
                                        })
                                        .collect(),
                                ),
                            )
                        })
                        .collect(),
                )
            }),
        );
        o.opt(
            "arithmetic",
            ix.arith.as_ref().map(|xs| {
                Jv::Arr(
                    xs.iter()
                        .map(|x| {
                            Jv::obj()
                                .with("at", lj(n, &x.at))
                                .with_opt("operation", x.op.map(|o| Jv::n(o as f64)))
                                .with("target", Jv::s(&x.target))
                                .with("expr", Jv::s(&x.expr))
                                .with("kind", Jv::s(x.kind))
                                .with("status", Jv::s(x.status))
                                .with_opt("guard", guard(n, &x.guard))
                                .with_opt("caller_controlled", x.caller.map(Jv::Bool))
                                .with_opt("unnamed_field", x.unnamed.map(Jv::Bool))
                        })
                        .collect(),
                )
            }),
        );
        o.opt(
            "divisions",
            ix.divs.as_ref().map(|xs| {
                Jv::Arr(
                    xs.iter()
                        .map(|x| {
                            Jv::obj()
                                .with("at", lj(n, &x.at))
                                .with("expr", Jv::s(&x.expr))
                                .with("divisor", Jv::s(&x.divisor))
                                .with("status", Jv::s(x.status))
                                .with_opt("guard", guard(n, &x.guard))
                        })
                        .collect(),
                )
            }),
        );
        o.opt(
            "proof",
            ix.proof.as_ref().map(|ps| {
                Jv::Arr(
                    ps.iter()
                        .map(|p| {
                            Jv::obj()
                                .with("operation", Jv::n(p.op as f64))
                                .with("kind", Jv::s(&p.kind))
                                .with(
                                    "properties",
                                    Jv::Arr(
                                        p.props
                                            .iter()
                                            .map(|x| {
                                                Jv::obj()
                                                    .with("prop", Jv::s(&x.prop))
                                                    .with("status", Jv::s(x.status))
                                                    .with("evidence", Jv::s(&x.evidence))
                                            })
                                            .collect(),
                                    ),
                                )
                        })
                        .collect(),
                )
            }),
        );
        ixs.push(o);
    }
    doc.set("instructions", Jv::Arr(ixs));
    doc.opt(
        "state_machine",
        a.states.as_ref().map(|ss| {
            Jv::Arr(
                ss.iter()
                    .map(|s| {
                        Jv::obj()
                            .with("field", Jv::s(&s.field))
                            .with(
                                "set_by",
                                Jv::Arr(
                                    s.set_by
                                        .iter()
                                        .map(|(ix, v, at)| {
                                            Jv::obj()
                                                .with("ix", Jv::s(ix))
                                                .with("value", Jv::s(v))
                                                .with("at", lj(ix, at))
                                        })
                                        .collect(),
                                ),
                            )
                            .with(
                                "checked_by",
                                Jv::Arr(
                                    s.checked_by
                                        .iter()
                                        .map(|(ix, c, at)| {
                                            Jv::obj()
                                                .with("ix", Jv::s(ix))
                                                .with("cond", Jv::s(c))
                                                .with("at", lj(ix, at))
                                        })
                                        .collect(),
                                ),
                            )
                    })
                    .collect(),
            )
        }),
    );
    doc.set(
        "pdas",
        Jv::Arr(
            a.pdas
                .iter()
                .map(|x| {
                    Jv::obj()
                        .with("seeds", Jv::s(&x.seeds))
                        .with("program", Jv::s(&x.program))
                        .with("derived_in", Jv::strs(&x.derived_in))
                        .with("signs_in", Jv::strs(&x.signs_in))
                        .with("accounts", Jv::strs(&x.accounts))
                        .with("compared", Jv::s(x.compared))
                })
                .collect(),
        ),
    );
    doc.set(
        "state_writes",
        Jv::Arr(
            a.state_writes
                .iter()
                .map(|(t, ws)| {
                    Jv::obj().with("target", Jv::s(t)).with(
                        "writes",
                        Jv::Arr(
                            ws.iter()
                                .map(|w| {
                                    Jv::obj()
                                        .with("ix", Jv::s(&w.ix))
                                        .with("how", Jv::s(&w.how))
                                        .with("at", lj(&w.ix, &w.at))
                                })
                                .collect(),
                        ),
                    )
                })
                .collect(),
        ),
    );
    doc.set(
        "dependencies",
        Jv::Arr(
            a.deps
                .iter()
                .map(|(t, r, wb)| {
                    Jv::obj()
                        .with("target", Jv::s(t))
                        .with("read_by", Jv::strs(r))
                        .with("written_by", Jv::strs(wb))
                })
                .collect(),
        ),
    );
    doc.set(
        "findings",
        Jv::Arr(
            a.findings
                .iter()
                .map(|f| {
                    Jv::obj()
                        .with("rule", Jv::s(f.rule))
                        .with("instruction", Jv::s(&f.ix))
                        .with("confidence", Jv::s(f.confidence))
                        .with("title", Jv::s(f.title))
                        .with("accounts", Jv::strs(&f.accounts))
                        .with("path", Jv::strs(&f.path))
                        .with("evidence", Jv::strs(&f.evidence))
                })
                .collect(),
        ),
    );
    doc.opt(
        "authority_fields",
        a.authority_fields.as_ref().map(|xs| {
            Jv::Arr(
                xs.iter()
                    .map(|(f, w)| {
                        Jv::obj()
                            .with("field", Jv::s(f))
                            .with("writtenBy", Jv::strs(w))
                    })
                    .collect(),
            )
        }),
    );
    doc.opt(
        "fund_movers",
        a.fund_movers.as_ref().filter(|x| !x.is_empty()).map(|xs| {
            Jv::Arr(
                xs.iter()
                    .map(|m| {
                        Jv::obj()
                            .with("instruction", Jv::s(&m.instruction))
                            .with("authority", Jv::s(&m.authority))
                            .with("kind", Jv::s(&m.kind))
                            .with_opt("from", m.from.as_ref().map(|s| Jv::s(s)))
                            .with("at", Jv::s(&m.at))
                    })
                    .collect(),
            )
        }),
    );
    doc.opt(
        "validation_consistency",
        a.consistency.as_ref().filter(|x| !x.is_empty()).map(|vs| {
            Jv::Arr(
                vs.iter()
                    .map(|v| {
                        Jv::obj()
                            .with("role", Jv::s(&v.role))
                            .with("by", Jv::s(v.by))
                            .with(
                                "instructions",
                                Jv::Arr(
                                    v.members
                                        .iter()
                                        .map(|m| {
                                            Jv::obj()
                                                .with("ix", Jv::s(&m.ix))
                                                .with("account", Jv::s(&m.account))
                                                .with("validations", Jv::strs(&m.validations))
                                                .with("uses", Jv::strs(&m.uses))
                                        })
                                        .collect(),
                                ),
                            )
                            .with(
                                "inconsistencies",
                                Jv::Arr(
                                    v.inconsistencies
                                        .iter()
                                        .map(|x| {
                                            Jv::obj()
                                                .with("instruction", Jv::s(&x.ix))
                                                .with("account", Jv::s(&x.account))
                                                .with("validation", Jv::s(&x.validation))
                                                .with(
                                                    "applied_in",
                                                    Jv::Arr(
                                                        x.applied_in
                                                            .iter()
                                                            .map(|(ix, acc, at)| {
                                                                Jv::obj()
                                                                    .with("instruction", Jv::s(ix))
                                                                    .with("account", Jv::s(acc))
                                                                    .with_opt(
                                                                        "at",
                                                                        at.as_ref()
                                                                            .map(|at| lj(ix, at)),
                                                                    )
                                                            })
                                                            .collect(),
                                                    ),
                                                )
                                                .with("others", Jv::n(x.others as f64))
                                                .with("uses", Jv::strs(&x.uses))
                                        })
                                        .collect(),
                                ),
                            )
                    })
                    .collect(),
            )
        }),
    );
    doc.set(
        "unattributed_operations",
        Jv::Arr(
            a.unattributed
                .iter()
                .map(|o| {
                    let cpi = o.cpi.as_ref().map(|c| {
                        let c = c.borrow();
                        Jv::obj()
                            .with("program", Jv::s(&c.program))
                            .with_opt("known", c.known.as_ref().map(|s| Jv::s(s)))
                            .with_opt("instruction", c.ix.as_ref().map(|s| Jv::s(s)))
                            .with("accounts", cpi_accounts(&c))
                            .with("fields", cpi_fields(&c))
                            .with_opt("seeds", c.seeds.as_ref().map(|s| Jv::s(s)))
                    });
                    Jv::obj()
                        .with("at", loc_j(w, None, &o.at))
                        .with("kinds", Jv::strs(&o.kinds))
                        .with("text", Jv::s(&o.text))
                        .with_opt("target", o.target.as_ref().map(|s| Jv::s(s)))
                        .with_opt("how", o.how.map(Jv::s))
                        .with_opt("cpi", cpi)
                })
                .collect(),
        ),
    );
    budget_json(doc, BUDGET_JSON_BYTES)
}

/// budgetJson: cut analysis.json to `max` bytes (UTF-16 units), lowest-priority detail first
fn budget_json(mut doc: Jv, max: usize) -> String {
    // (sizes are measured without printing: the document is printed once, as it ends up)
    if doc.pretty_len(1) + 1 <= max {
        return doc.pretty(1) + "\n";
    }
    let mut omitted: IndexMap<String, f64> = IndexMap::default();
    fn cap(o: &mut Jv, key: &str, n: usize, label: &str, omitted: &mut IndexMap<String, f64>) {
        let Some(Jv::Arr(a)) = o.get_mut(key) else {
            return;
        };
        if a.len() <= n {
            return;
        }
        let k = a.len() - n;
        a.truncate(n);
        let ok = format!("{key}_omitted");
        let prev = o.get(&ok).and_then(|x| x.as_num()).unwrap_or(0.0);
        o.set(&ok, Jv::n(prev + k as f64));
        *omitted.entry(label.to_string()).or_insert(0.0) += k as f64;
    }
    fn each(doc: &mut Jv, f: &mut dyn FnMut(&mut Jv)) {
        if let Some(Jv::Arr(ixs)) = doc.get_mut("instructions") {
            for ix in ixs {
                f(ix);
            }
        }
    }
    fn items<'j>(o: &'j mut Jv, key: &str) -> Vec<&'j mut Jv> {
        match o.get_mut(key) {
            Some(Jv::Arr(a)) => a.iter_mut().collect(),
            _ => vec![],
        }
    }
    if let Some(Jv::Arr(fs)) = doc.get_mut("findings") {
        let n = fs.len();
        let mut seen: Vec<String> = Vec::new();
        let mut keep = Vec::new();
        for f in fs.drain(..) {
            let mut k = String::new();
            f.compact(&mut k);
            if !seen.contains(&k) {
                seen.push(k);
                keep.push(f);
            }
        }
        *fs = keep;
        if fs.len() < n {
            omitted.insert("findings (duplicates)".into(), (n - fs.len()) as f64);
        }
    }
    // the document with the budget member appended: printed (Some) or measured (None, in UTF-16 units)
    let out = |doc: &mut Jv, omitted: &IndexMap<String, f64>, print: bool| -> (String, usize) {
        let b = Jv::obj()
                .with("max_bytes", Jv::n(max as f64))
                .with("note", Jv::s("detail dropped to fit the size budget, lowest priority first (<key>_omitted: entries cut from that list); the decompiled code is complete"))
                .with("omitted", Jv::Obj(omitted.iter().map(|(k, v)| (k.clone(), Jv::n(*v))).collect()));
        let emit = |d: &Jv| {
            if print {
                (d.pretty(1) + "\n", 0)
            } else {
                (String::new(), d.pretty_len(1) + 1)
            }
        };
        // (the budget appended for the printing, not a copy of the document)
        if let Jv::Obj(m) = doc {
            if !m.iter().any(|x| x.0 == "budget") {
                m.push(("budget".to_string(), b));
                let r = emit(doc);
                if let Jv::Obj(m) = doc {
                    m.pop();
                }
                return r;
            }
        }
        let mut d = doc.clone();
        d.set("budget", b);
        emit(&d)
    };
    let mut len = out(&mut doc, &omitted, false).1;
    for step in 0..8 {
        if len <= max {
            break;
        }
        let om = &mut omitted;
        match step {
            0 => each(&mut doc, &mut |ix| {
                for p in items(ix, "path_conditions") {
                    cap(p, "conditions", 12, "path_conditions[].conditions", om);
                    cap(p, "not_required", 4, "path_conditions[].not_required", om);
                    for x in items(p, "not_required") {
                        cap(x, "path", 6, "path_conditions[].not_required[].path", om);
                    }
                }
            }),
            1 => each(&mut doc, &mut |ix| {
                for o in items(ix, "operations") {
                    cap(o, "bypass", 3, "operations[].bypass", om);
                    for b in items(o, "bypass") {
                        cap(b, "path", 6, "operations[].bypass[].path", om);
                    }
                    cap(o, "sources", 8, "operations[].sources", om);
                }
            }),
            2 => {
                let mut cut = 0;
                if let Some(Jv::Arr(fs)) = doc.get_mut("findings") {
                    let n = fs.len();
                    let mut per: HashMapS = HashMapS::default();
                    fs.retain(|f| {
                        let k = format!(
                            "{}@{}",
                            f.get("rule").and_then(|x| x.as_str()).unwrap_or(""),
                            f.get("instruction").and_then(|x| x.as_str()).unwrap_or("")
                        );
                        let c = per.entry(k).or_insert(0);
                        *c += 1;
                        *c <= 25
                    });
                    cut = n - fs.len();
                }
                if cut > 0 {
                    let prev = doc
                        .get("findings_omitted")
                        .and_then(|x| x.as_num())
                        .unwrap_or(0.0);
                    doc.set("findings_omitted", Jv::n(prev + cut as f64));
                    om.insert(
                        "findings (beyond 25 per rule and instruction)".into(),
                        cut as f64,
                    );
                }
            }
            3 => each(&mut doc, &mut |ix| {
                cap(ix, "path_conditions", 24, "path_conditions", om);
                cap(ix, "auth_chains", 12, "auth_chains", om);
                cap(ix, "relations", 30, "relations", om);
                cap(ix, "trust", 40, "trust", om);
            }),
            4 => each(&mut doc, &mut |ix| {
                for p in items(ix, "path_conditions") {
                    cap(p, "conditions", 4, "path_conditions[].conditions", om);
                }
                for c in items(ix, "auth_chains") {
                    cap(c, "chains", 2, "auth_chains[].chains", om);
                }
                cap(ix, "proof", 24, "proof", om);
                cap(ix, "authority", 24, "authority", om);
            }),
            5 => each(&mut doc, &mut |ix| {
                cap(ix, "path_conditions", 0, "path_conditions", om);
                cap(ix, "auth_chains", 0, "auth_chains", om);
                cap(ix, "relations", 0, "relations", om);
                cap(ix, "proof", 0, "proof", om);
                cap(ix, "arithmetic", 40, "arithmetic", om);
                cap(ix, "functions", 60, "functions", om);
            }),
            6 => each(&mut doc, &mut |ix| {
                for o in items(ix, "operations") {
                    cap(o, "bypass", 0, "operations[].bypass", om);
                    cap(o, "guarded_by", 16, "operations[].guarded_by", om);
                }
                cap(ix, "checks", 150, "checks", om);
                cap(ix, "operations", 150, "operations", om);
                cap(ix, "trust", 0, "trust", om);
                cap(ix, "authority", 0, "authority", om);
            }),
            _ => {
                cap(&mut doc, "findings", 300, "findings", om);
                cap(
                    &mut doc,
                    "unattributed_operations",
                    100,
                    "unattributed_operations",
                    om,
                );
                cap(&mut doc, "state_writes", 200, "state_writes", om);
                cap(
                    &mut doc,
                    "validation_consistency",
                    30,
                    "validation_consistency",
                    om,
                );
                each(&mut doc, &mut |ix| {
                    cap(ix, "checks", 60, "checks", om);
                    cap(ix, "operations", 60, "operations", om);
                    cap(ix, "arithmetic", 0, "arithmetic", om);
                    cap(ix, "divisions", 20, "divisions", om);
                });
            }
        }
        len = out(&mut doc, &omitted, false).1;
    }
    out(&mut doc, &omitted, true).0
}

type HashMapS = sbpf_ir::fx::HashMap<String, usize>;

// ---- markdown ----

const HEADER: [&str; 2] = [
    "DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).",
    "Statuses: found (on every non-failing path) · found on some paths (the check itself is complete, e.g. a full 32-byte key comparison, but it is not on every path to the operations) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).",
];

fn has(x: &AcctOut, k: &str) -> bool {
    x.has(k)
}

/// Flags an auditor should look at first, per instruction.
fn flags(ix: &IxOut) -> Vec<String> {
    let mut out: IndexSet<String> = IndexSet::default();
    for x in &ix.accounts {
        for k in ["signer", "pda", "address", "writable"] {
            if x.constraints
                .get(k)
                .is_some_and(|e| e.status == "not_found")
            {
                out.insert(format!("{}: {k} expected, no check found", x.name));
            }
        }
    }
    let prog_checked = ix
        .accounts
        .iter()
        .any(|x| x.name.contains("program") && ["address", "executable"].iter().any(|k| has(x, k)));
    for o in &ix.ops {
        if let Some(c) = &o.cpi {
            let c = c.borrow();
            if !c.known.as_deref().is_some_and(|k| !k.is_empty())
                && c.program != "?"
                && !c
                    .checked
                    .as_deref()
                    .unwrap_or("")
                    .contains("(id compared with")
                && !prog_checked
            {
                out.insert(format!(
                    "CPI to an account-supplied program id without a recognized check ({}:{})",
                    o.at.fn_, o.at.line
                ));
            }
        }
    }
    let value = ix.ops.iter().any(|o| {
        o.kinds.iter().any(|k| {
            matches!(
                *k,
                "TOKEN_TRANSFER"
                    | "LAMPORT_TRANSFER"
                    | "MINT"
                    | "LAMPORT_WRITE"
                    | "ACCOUNT_CLOSE"
                    | "AUTHORITY_WRITE"
            )
        })
    });
    let signer = ix.accounts.iter().any(|x| has(x, "signer"))
        || ix.checks.iter().any(|c| c.kinds.contains(&"signer"));
    if value && !signer {
        out.insert("moves value / changes authority, but no signer check was found".into());
    }
    out.into_iter().collect()
}

/// informational rule results (not findings): counts per rule
fn info_line(fs: &[&Finding]) -> Option<String> {
    let mut n: IndexMap<&str, usize> = IndexMap::default();
    for f in fs {
        if f.confidence == "info" {
            *n.entry(f.rule).or_insert(0) += 1;
        }
    }
    if n.is_empty() {
        return None;
    }
    Some(format!(
        "- informational (not findings, see analysis.json): {}",
        n.iter()
            .map(|(k, c)| format!("{k} {c}"))
            .collect::<Vec<_>>()
            .join(", ")
    ))
}

fn render_findings(a: &Analysis) -> Vec<String> {
    let fs: Vec<&Finding> = a
        .findings
        .iter()
        .filter(|f| f.confidence != "info")
        .collect();
    let mut out = vec![
        "## Findings (ranked; rule engine over the facts: leads to review, not verdicts)"
            .to_string(),
        String::new(),
    ];
    if fs.is_empty() {
        out.push("- none of the rules matched".into());
    }
    for f in fs.iter().take(15) {
        let at = f.path.first();
        out.push(sl(
            &format!(
                "- [{}] **{}** · {}{}{} — {}",
                f.confidence,
                f.rule,
                f.ix,
                if f.accounts.is_empty() {
                    String::new()
                } else {
                    format!(" · {}", f.accounts[..f.accounts.len().min(3)].join(", "))
                },
                at.map_or(String::new(), |a| format!(" · {a}")),
                f.evidence.first().map_or("", |s| s.as_str())
            ),
            260,
        ));
    }
    if fs.len() > 15 {
        out.push(format!(
            "- … {} more in analysis.json (findings)",
            fs.len() - 15
        ));
    }
    let mut by_rule: IndexMap<&str, usize> = IndexMap::default();
    for f in &fs {
        *by_rule.entry(f.rule).or_insert(0) += 1;
    }
    if !fs.is_empty() {
        out.push(format!(
            "- by rule: {}",
            by_rule
                .iter()
                .map(|(k, n)| format!("{k} {n}"))
                .collect::<Vec<_>>()
                .join(", ")
        ));
    }
    let all: Vec<&Finding> = a.findings.iter().collect();
    if let Some(i) = info_line(&all) {
        out.push(i);
    }
    out.push(String::new());
    out
}

fn v_text(v: &str) -> String {
    match v {
        "owner" => "no owner check".into(),
        "type" => "no type (discriminator / length) check".into(),
        "signer" => "no signer check".into(),
        "address" => "no address / PDA check".into(),
        _ => format!("no `{v}`"),
    }
}

fn inc_line(x: &super::consistency::Inconsistency, w: Where, head: bool) -> String {
    let lim = if head { 2 } else { 3 };
    format!(
        "{}{}; {}/{} other instructions of the role apply it: {}{}{}",
        if head {
            format!(
                "{} · {} [{}] ({}): ",
                x.ix,
                x.account,
                x.role,
                x.uses.join(", ")
            )
        } else {
            String::new()
        },
        v_text(&x.validation),
        x.applied_in.len(),
        x.others,
        x.applied_in
            .iter()
            .take(lim)
            .map(|(ix, _, at)| format!(
                "{ix}{}",
                at.as_ref()
                    .map_or(String::new(), |at| format!(" {}", at2s(w, Some(ix), at)))
            ))
            .collect::<Vec<_>>()
            .join(", "),
        if x.applied_in.len() > lim {
            format!(", +{}", x.applied_in.len() - lim)
        } else {
            String::new()
        },
        if head {
            String::new()
        } else {
            format!(" (here: {})", x.uses.join(", "))
        }
    )
}

fn render_consistency(a: &Analysis, w: Where) -> Vec<String> {
    let mut xs: Vec<&super::consistency::Inconsistency> = a
        .consistency
        .iter()
        .flatten()
        .flat_map(|v| v.inconsistencies.iter())
        .collect();
    xs.sort_by(|x, y| {
        let d = y.weight - x.weight;
        if d != 0.0 && !d.is_nan() {
            d.partial_cmp(&0.0).unwrap()
        } else {
            y.applied_in.len().cmp(&x.applied_in.len())
        }
    });
    if xs.is_empty() {
        return vec![];
    }
    let mut out = vec![
        "## Validation consistency (a validation most instructions apply to an account role, missing in one using its data; leads)".to_string(),
        String::new(),
    ];
    for x in xs.iter().take(6) {
        out.push(sl(&format!("- {}", inc_line(x, w, true)), 360));
    }
    if xs.len() > 6 {
        out.push(format!(
            "- … {} more in analysis.json (validation_consistency)",
            xs.len() - 6
        ));
    }
    out.push(String::new());
    out
}

fn moves(ix: &IxOut) -> bool {
    ix.ops.iter().any(|o| {
        o.kinds.iter().any(|k| {
            matches!(
                *k,
                "TOKEN_TRANSFER"
                    | "LAMPORT_TRANSFER"
                    | "MINT"
                    | "BURN"
                    | "ACCOUNT_CLOSE"
                    | "AUTHORITY_WRITE"
            )
        }) || (o.has("LAMPORT_WRITE") && o.how == Some("-="))
    })
}

fn render_stored_gaps(a: &Analysis) -> Vec<String> {
    let mut gaps: Vec<String> = Vec::new();
    let mut only: Vec<String> = Vec::new();
    for ix in &a.ixs {
        for k in ix.stored_keys.iter().flatten() {
            let x = ix.accounts.iter().find(|y| y.name == k.account);
            let on = |c: &str| x.is_some_and(|x| x.has(c));
            let mv = moves(ix);
            if mv {
                for g in &k.gaps {
                    gaps.push(format!("- {} · GAP: {g}", ix.name));
                }
            }
            let via: Vec<&String> = k
                .referenced_by
                .iter()
                .filter(|b| !crate::jre!(r"\.(mint|owner|data)$").is_match(b))
                .collect();
            if k.compared.is_empty()
                && !via.is_empty()
                && via.len() == k.referenced_by.len()
                && on("discriminator")
                && !crate::jre!(r"(?i)mint|vault|token|_ata$|^ata").is_match(&k.account)
                && !["pda", "address", "key", "has_one"].iter().any(|c| on(c))
                && mv
            {
                only.push(format!(
                    "- {} · {}{}: none of its stored fields is compared with a provided account (bound only through {})",
                    ix.name,
                    k.account,
                    k.ty.as_ref().map_or(String::new(), |t| format!(" ({t})")),
                    via.iter().map(|s| s.as_str()).collect::<Vec<_>>().join(", ")
                ));
            }
        }
    }
    let mut out: Vec<String> = only.iter().take(2).cloned().collect();
    out.extend(gaps.iter().take(5 - only.len().min(2)).cloned());
    if out.is_empty() {
        return vec![];
    }
    let more = gaps.len() + only.len() - out.len();
    let mut r = vec![
        "## Stored keys not compared (accounts whose data is used; see <ix>.md Stored keys)"
            .to_string(),
        String::new(),
    ];
    r.extend(out);
    if more > 0 {
        r.push(format!("- … {more} more in the <ix>.md files"));
    }
    r.push(String::new());
    r
}

fn render_fund_movers(a: &Analysis) -> Vec<String> {
    let xs = a.fund_movers.as_deref().unwrap_or(&[]);
    if xs.is_empty() {
        return vec![];
    }
    let mut out = vec![
        "## Who can move funds (program-controlled funds: PDA-signed token moves, lamport debits; informational)".to_string(),
        String::new(),
    ];
    for x in xs.iter().take(8) {
        out.push(sl(
            &format!(
                "- {}: {} — {}{} ({})",
                x.instruction,
                x.authority,
                x.kind,
                x.from
                    .as_ref()
                    .map_or(String::new(), |f| format!(" from {f}")),
                x.at
            ),
            240,
        ));
    }
    if xs.len() > 8 {
        out.push(format!(
            "- … {} more in analysis.json (fund_movers)",
            xs.len() - 8
        ));
    }
    out.push(String::new());
    out
}

/// security/summary.md: the ranked instruction surface tree (`bundled[xi]`: the instruction has a bundle
/// through its dispatch part, `ix.ctx?.allowed`)
pub fn render_summary(a: &Analysis, w: Where, bundled: &[bool]) -> String {
    let p = &a.program;
    let mut out: Vec<String> = vec!["# Security summary".into(), String::new()];
    out.extend(HEADER.iter().map(|s| s.to_string()));
    out.push(String::new());
    out.push(format!(
        "Program: sBPF v{}, {} instructions, {} functions{}{}. Machine-readable: analysis.json.",
        p.version,
        p.instructions,
        p.functions,
        if p.anchor { ", Anchor" } else { "" },
        if p.idl { " (with IDL)" } else { "" }
    ));
    out.push(String::new());
    out.extend(render_findings(a));
    out.extend(render_consistency(a, w));
    out.extend(render_stored_gaps(a));
    out.extend(render_fund_movers(a));
    out.push("## Instructions (most sensitive first)".into());
    out.push(String::new());
    for (xi, ix) in a.ixs.iter().enumerate() {
        let file = format!("{}.md", ix.name);
        let mut signers: Vec<String> = ix
            .accounts
            .iter()
            .filter(|x| x.has("signer"))
            .map(|x| format!("{} ({})", x.name, st(x.constraints["signer"].status)))
            .collect();
        let anon = ix
            .checks
            .iter()
            .filter(|c| {
                c.kinds.contains(&"signer")
                    && c.account
                        .as_ref()
                        .is_none_or(|a| a.is_empty() || a.ends_with('?'))
            })
            .count();
        if anon > 0 {
            signers.push(format!(
                "{anon} signer check{} on accounts held in temporaries (see {file})",
                if anon > 1 { "s" } else { "" }
            ));
        }
        out.push(format!(
            "- **{}** — score {} · [{file}]({file}){}",
            ix.name,
            ix.score,
            if ix.handler.starts_with("ix_") || bundled.get(xi).copied().unwrap_or(false) {
                format!(" · ../bundle/{}.ts", ix.name)
            } else {
                String::new()
            }
        ));
        out.push(format!(
            "  - signers: {}",
            if signers.is_empty() {
                "none found".to_string()
            } else {
                signers.join(", ")
            }
        ));
        for e in ix.effects.iter().take(12) {
            out.push(format!("  - {e}"));
        }
        if ix.effects.len() > 12 {
            out.push(format!("  - … {} more (see {file})", ix.effects.len() - 12));
        }
        for f in flags(ix).iter().take(6) {
            out.push(format!("  - ⚠ {f}"));
        }
    }
    if !a.unattributed.is_empty() {
        out.extend(
            [
                "",
                "## Operations not attributed to an instruction",
                "",
                "In functions no handler reaches through direct calls (called through function pointers / dispatch tables, or dead code):",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        let wo = |o: &OpOut| {
            o.kinds
                .iter()
                .map(|k| weight(k))
                .fold(f64::NEG_INFINITY, f64::max)
        };
        let mut us: Vec<&OpOut> = a.unattributed.iter().collect();
        us.sort_by(|x, y| {
            let d = wo(y) - wo(x);
            if d != 0.0 && !d.is_nan() {
                d.partial_cmp(&0.0).unwrap()
            } else {
                std::cmp::Ordering::Equal
            }
        });
        for o in us.iter().take(25) {
            out.push(format!(
                "- {} {}: {}",
                at2s(w, None, &o.at),
                o.kinds.join(", "),
                sl(&o.text, 160)
            ));
        }
        if a.unattributed.len() > 25 {
            out.push(format!(
                "- … {} more in analysis.json",
                a.unattributed.len() - 25
            ));
        }
    }
    if !a.pdas.is_empty() {
        out.extend(["", "## PDAs", ""].iter().map(|s| s.to_string()));
        for x in &a.pdas {
            out.push(format!(
                "- seeds {}, program {}{}{}{}",
                x.seeds,
                x.program,
                if x.derived_in.is_empty() {
                    String::new()
                } else {
                    format!(" — derived in {}", x.derived_in.join(", "))
                },
                if x.signs_in.is_empty() {
                    String::new()
                } else {
                    format!(" — signs in {}", x.signs_in.join(", "))
                },
                if x.accounts.is_empty() {
                    String::new()
                } else {
                    format!(
                        " — seeds constraint on {} ({})",
                        x.accounts.join(", "),
                        st(x.compared)
                    )
                }
            ));
        }
    }
    if !a.state_writes.is_empty() {
        out.extend(
            ["", "## State writes (account.field ← instructions)", ""]
                .iter()
                .map(|s| s.to_string()),
        );
        for (t, ws) in a.state_writes.iter().take(60) {
            out.push(format!(
                "- {t} ← {}",
                ws.iter()
                    .map(|w| format!("{} ({})", w.ix, w.how))
                    .collect::<Vec<_>>()
                    .join(", ")
            ));
        }
        if a.state_writes.len() > 60 {
            out.push(format!(
                "- … {} more in analysis.json",
                a.state_writes.len() - 60
            ));
        }
    }
    if let Some(af) = a.authority_fields.as_ref().filter(|x| !x.is_empty()) {
        out.extend(
            [
                "",
                "## Authority fields (stored authorities and the instructions writing them)",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for (f, wb) in af.iter().take(30) {
            out.push(format!("- {f} ← {}", wb.join(", ")));
        }
    }
    if let Some(ss) = a.states.as_ref().filter(|x| !x.is_empty()) {
        out.extend(
            [
                "",
                "## State machine (status-like fields: set by → checked by; details in analysis.json state_machine)",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for x in ss.iter().take(8) {
            let set = x
                .set_by
                .iter()
                .map(|(ix, v, _)| format!("{ix} (= {v})"))
                .collect::<Vec<_>>()
                .join(", ");
            let mut chk: IndexSet<&str> = IndexSet::default();
            for (ix, _, _) in &x.checked_by {
                chk.insert(ix);
            }
            out.push(format!(
                "- {}: set by {}; checked by {}",
                x.field,
                if set.is_empty() {
                    "none found".into()
                } else {
                    set
                },
                if chk.is_empty() {
                    "none found".into()
                } else {
                    chk.iter().copied().collect::<Vec<_>>().join(", ")
                }
            ));
        }
        if ss.len() > 8 {
            out.push(format!("- … {} more in analysis.json", ss.len() - 8));
        }
    }
    if !a.deps.is_empty() {
        out.extend(
            [
                "",
                "## Read/write dependencies (field checked by X, written by Y)",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for (t, r, wb) in &a.deps {
            out.push(format!(
                "- {t}: checked in {}; written in {}",
                r.join(", "),
                wb.join(", ")
            ));
        }
    }
    out.join("\n") + "\n"
}

fn cell(x: &AcctOut, k: &str) -> String {
    let e = x.constraints.get(k);
    let exp = match k {
        "signer" => x.expected.signer,
        "writable" => x.expected.writable,
        "pda" => x.expected.pda,
        "address" => x.expected.address.as_ref().is_some_and(|a| !a.is_empty()),
        _ => false,
    };
    match e {
        None => {
            if exp {
                "expected · NOT FOUND".into()
            } else {
                "—".into()
            }
        }
        Some(e) => format!("{}{}", if exp { "expected · " } else { "" }, st(e.status)),
    }
}

/// the condition under which a check fails, as text
pub fn fail_text(c: &CheckOut) -> String {
    if c.fails_if {
        return c.cond.clone();
    }
    if let Some(m) =
        crate::jre!(r"^([^&|!=<>()]+?) (==|!=|>=|<=|>|<) ([^&|!=<>()]+)$").captures(&c.cond)
    {
        let op = match &m[2] {
            "==" => "!=",
            "!=" => "==",
            ">=" => "<",
            "<=" => ">",
            ">" => "<=",
            _ => ">=",
        };
        return format!("{} {op} {}", &m[1], &m[3]);
    }
    if crate::jre!(r"^!\w+\([^()]*(\([^()]*\)[^()]*)*\)$").is_match(&c.cond) {
        return c.cond[1..].to_string();
    }
    if crate::jre!(r"^\w+\([^()]*(\([^()]*\)[^()]*)*\)$").is_match(&c.cond) {
        format!("!{}", c.cond)
    } else {
        format!("!({})", c.cond)
    }
}

fn md(s: &str) -> String {
    s.replace('|', "\\|").replace('\n', " ")
}

fn stx(s: &str) -> String {
    match s {
        "found" | "partial" | "not_found" | "runtime" => st(s).to_string(),
        _ => s.to_string(),
    }
}

/// security/<ix>.md
pub fn render_ix(ix: &IxOut, w: Where, a: &Analysis) -> String {
    let n = ix.name.as_str();
    let wl = |at: &Loc| at2s(w, Some(n), at);
    let mut out: Vec<String> = vec![format!("# {n}"), String::new()];
    out.extend(HEADER.iter().map(|s| s.to_string()));
    out.push(String::new());
    out.push(format!(
        "Handler {} ({}); {} functions reachable: {}{}.",
        ix.handler,
        ix.kind,
        ix.functions.len(),
        ix.functions[..ix.functions.len().min(12)].join(", "),
        if ix.functions.len() > 12 { ", …" } else { "" }
    ));
    out.push(String::new());
    if let Some(d) = &ix.dispatch {
        out.push(format!("Dispatch: {d}."));
        out.push(String::new());
    }
    if !ix.indirect.is_empty() {
        out.push(format!(
            "Reached through function pointers / tables (conditional): {}{}.",
            ix.indirect[..ix.indirect.len().min(8)].join(", "),
            if ix.indirect.len() > 8 { ", …" } else { "" }
        ));
        out.push(String::new());
    }
    let fl = flags(ix);
    if !fl.is_empty() {
        out.push("## Look first".into());
        out.push(String::new());
        out.extend(fl.iter().map(|f| format!("- ⚠ {f}")));
        out.push(String::new());
    }
    let all: Vec<&Finding> = a.findings.iter().filter(|f| f.ix == ix.name).collect();
    let fs: Vec<&Finding> = all
        .iter()
        .copied()
        .filter(|f| f.confidence != "info")
        .collect();
    let info = info_line(&all);
    if info.is_some() && fs.is_empty() {
        out.extend(
            ["## Findings (rule engine)", "", "- none"]
                .iter()
                .map(|s| s.to_string()),
        );
        out.push(info.clone().unwrap());
        out.push(String::new());
    }
    if !fs.is_empty() {
        out.push("## Findings (rule engine)".into());
        out.push(String::new());
        for f in fs.iter().take(10) {
            out.push(format!(
                "- [{}] {}: {}. {}{}",
                f.confidence,
                f.rule,
                f.title,
                sl(&f.evidence.join(" · "), 220),
                if f.path.len() > 1 {
                    format!(" (path {})", f.path.join(" → "))
                } else if let Some(p) = f.path.first() {
                    format!(" ({p})")
                } else {
                    String::new()
                }
            ));
        }
        if let Some(i) = &info {
            out.push(i.clone());
        }
        out.push(String::new());
    }
    out.extend(
        [
            "## Account privileges (expected by the IDL · verified by the code)",
            "",
            "| # | account | signer | writable | owner | executable | address |",
            "|---|---|---|---|---|---|---|",
        ]
        .iter()
        .map(|s| s.to_string()),
    );
    for x in &ix.accounts {
        out.push(format!(
            "| {} | {}{} | {} | {} | {}{} | {} | {}{} |",
            x.index.map_or(String::new(), js_num),
            x.name,
            if x.source != "idl" {
                format!(" [{}]", x.source)
            } else {
                String::new()
            },
            cell(x, "signer"),
            cell(x, "writable"),
            cell(x, "owner"),
            x.constraints
                .get("discriminator")
                .map_or(String::new(), |e| format!(
                    " (+discriminator {})",
                    st(e.status)
                )),
            cell(x, "executable"),
            x.expected
                .address
                .as_ref()
                .filter(|a| !a.is_empty())
                .map_or(String::new(), |a| format!("= {}… · ", sl(a, 8))),
            cell(x, "address")
        ));
    }
    out.push(String::new());
    out.push("## Constraints per account".into());
    out.push(String::new());
    for x in &ix.accounts {
        if x.constraints.is_empty() {
            out.push(format!("- {}: no checks found", x.name));
            continue;
        }
        out.push(format!(
            "- {}: {}",
            x.name,
            x.constraints
                .iter()
                .map(|(k, e)| format!(
                    "{k} {}{}{}",
                    st(e.status),
                    e.at.as_ref().map_or(String::new(), |at| format!(
                        " ({}{})",
                        wl(at),
                        e.via
                            .as_ref()
                            .filter(|v| !v.is_empty())
                            .map_or(String::new(), |v| format!(" via {v}"))
                    )),
                    e.note.map_or(String::new(), |n| format!(" — {n}"))
                ))
                .collect::<Vec<_>>()
                .join("; ")
        ));
    }
    let cpis: Vec<&OpOut> = ix.ops.iter().filter(|o| o.has("CPI")).collect();
    if !cpis.is_empty() {
        out.extend(["", "## CPIs", ""].iter().map(|s| s.to_string()));
        for o in cpis {
            let c = o.cpi.as_ref().map(|c| c.borrow().clone());
            let prog = match &c {
                None => "program not decoded".to_string(),
                Some(c) if c.program == "?" => "program not decoded".to_string(),
                Some(c) if c.known.as_deref().is_some_and(|k| !k.is_empty()) => {
                    format!("{} (constant)", c.program)
                }
                Some(c) => format!(
                    "{} (account-supplied; {})",
                    c.program,
                    c.checked.as_deref().unwrap_or("check unknown")
                ),
            };
            let mut line = format!(
                "- {} {}{prog}",
                wl(&o.at),
                if o.main { "" } else { "[conditional] " }
            );
            if let Some(c) = &c {
                if let Some(i) = c.ix.as_ref().filter(|i| !i.is_empty()) {
                    line.push_str(&format!(".{i}"));
                }
                if !c.accounts.is_empty() {
                    line.push_str(&format!(
                        " — accounts {}",
                        c.accounts
                            .iter()
                            .map(|x| format!(
                                "{}{}{}{}",
                                x.role
                                    .as_ref()
                                    .filter(|r| !r.is_empty())
                                    .map_or(String::new(), |r| format!("{r}: ")),
                                x.text,
                                if x.w.is_some_and(|v| v != 0.0 && !v.is_nan()) {
                                    " w"
                                } else {
                                    ""
                                },
                                if x.s.is_some_and(|v| v != 0.0 && !v.is_nan()) {
                                    " s"
                                } else {
                                    ""
                                }
                            ))
                            .collect::<Vec<_>>()
                            .join(", ")
                    ));
                }
                if !c.fields.is_empty() {
                    line.push_str(&format!(
                        " — {}",
                        c.fields
                            .iter()
                            .map(|(k, v)| format!("{k}: {v}"))
                            .collect::<Vec<_>>()
                            .join(", ")
                    ));
                }
                if let Some(s) = c.seeds.as_ref().filter(|s| !s.is_empty()) {
                    line.push_str(&format!(" — PDA signer: {s}"));
                }
            }
            out.push(line);
            if c.is_none() {
                out.push(format!("  - {}", md(&o.text)));
            }
        }
    }
    let pdas: Vec<&OpOut> = ix.ops.iter().filter(|o| o.pda.is_some()).collect();
    if !pdas.is_empty() {
        out.extend(["", "## PDAs derived", ""].iter().map(|s| s.to_string()));
        for o in pdas {
            let p = o.pda.as_ref().unwrap();
            out.push(format!(
                "- {} {}({}, program {})",
                wl(&o.at),
                p.fn_,
                p.seeds,
                p.program
            ));
        }
        let sc: Vec<&AcctOut> = ix
            .accounts
            .iter()
            .filter(|x| x.constraints.contains_key("pda"))
            .collect();
        if !sc.is_empty() {
            out.push(format!(
                "- compared with provided accounts: {}",
                sc.iter()
                    .map(|x| format!("{} {}", x.name, st(x.constraints["pda"].status)))
                    .collect::<Vec<_>>()
                    .join(", ")
            ));
        }
    }
    let sens: Vec<&OpOut> = ix
        .ops
        .iter()
        .filter(|o| !o.has("CPI") && o.pda.is_none())
        .collect();
    if !sens.is_empty() {
        out.extend(
            ["", "## Operations (account writes)", ""]
                .iter()
                .map(|s| s.to_string()),
        );
        for o in sens {
            out.push(format!(
                "- {} {} {} {}{}{}",
                wl(&o.at),
                o.kinds.join(", "),
                o.target.as_deref().unwrap_or(""),
                o.how.unwrap_or(""),
                o.value
                    .as_ref()
                    .filter(|v| !v.is_empty())
                    .map_or(String::new(), |v| format!(" {}", sl(&md(v), 80))),
                if o.main { "" } else { " [conditional]" }
            ));
        }
    }
    let vo: Vec<&OpOut> = ix
        .ops
        .iter()
        .filter(|o| {
            o.guards.is_some()
                && o.kinds.iter().any(|k| {
                    (*k != "PDA_DERIVE" && *k != "CPI")
                        || o.cpi.as_ref().is_some_and(|c| {
                            !c.borrow().known.as_deref().is_some_and(|k| !k.is_empty())
                        })
                })
        })
        .collect();
    if !vo.is_empty() {
        out.extend(
            [
                "",
                "## Dominance (checks on every path to the operation; across calls)",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for o in vo.iter().take(20) {
            let g: Vec<&CheckOut> = o
                .guards
                .as_ref()
                .unwrap()
                .iter()
                .map(|&i| &ix.checks[i])
                .filter(|c| c.kinds.iter().any(|k| *k != "count"))
                .collect();
            let mut ks: IndexSet<String> = IndexSet::default();
            for c in &g {
                for k in &c.kinds {
                    ks.insert(format!(
                        "{k}{}",
                        c.account
                            .as_ref()
                            .filter(|a| !a.is_empty())
                            .map_or(String::new(), |a| format!(" {a}"))
                    ));
                }
            }
            let ks: Vec<String> = ks.into_iter().collect();
            let kk: Vec<&str> = o.kinds.iter().copied().filter(|k| *k != "CPI").collect();
            out.push(format!(
                "- {} {}: {} dominating checks{}",
                wl(&o.at),
                if kk.is_empty() {
                    "CPI".to_string()
                } else {
                    kk.join(", ")
                },
                g.len(),
                if ks.is_empty() {
                    String::new()
                } else {
                    format!(
                        " ({}{})",
                        ks[..ks.len().min(8)].join("; "),
                        if ks.len() > 8 { "; …" } else { "" }
                    )
                }
            ));
            for b in o.bypass.iter().flatten() {
                let c = &ix.checks[b.check];
                out.push(format!(
                    "  - ⚠ check {} ({}{}) does not dominate it: {}",
                    wl(&c.at),
                    c.kinds.join(", "),
                    c.account
                        .as_ref()
                        .filter(|a| !a.is_empty())
                        .map_or(String::new(), |a| format!(" on {a}")),
                    b.path.iter().map(|x| wl(x)).collect::<Vec<_>>().join(" → ")
                ));
            }
            if let Some(s) = o.sources.as_ref().filter(|s| !s.is_empty()) {
                out.push(format!(
                    "  - sources: {}",
                    s.iter()
                        .take(6)
                        .map(|x| format!("{} ← {} ({})", x.param, x.source, x.trust))
                        .collect::<Vec<_>>()
                        .join("; ")
                ));
            }
        }
    }
    if let Some(au) = ix.authority.as_ref().filter(|a| !a.is_empty()) {
        out.extend(
            [
                "",
                "## Authority (who enables each value movement / authority change)",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for x in au.iter().take(12) {
            out.push(format!(
                "- {} {}: {}",
                wl(&ix.ops[x.op].at),
                x.kind,
                x.enabled_by
                    .iter()
                    .map(|e| format!(
                        "{} {}{}{}",
                        e.kind,
                        e.what,
                        e.status
                            .filter(|s| !s.is_empty())
                            .map_or(String::new(), |s| format!(" ({})", stx(s))),
                        e.written_by
                            .as_ref()
                            .filter(|w| !w.is_empty())
                            .map_or(String::new(), |w| format!(" — written by {}", w.join(", ")))
                    ))
                    .collect::<Vec<_>>()
                    .join("; ")
            ));
        }
    }
    let op_name = |i: usize| {
        let o = &ix.ops[i];
        let kk: Vec<&str> = o.kinds.iter().copied().filter(|k| *k != "CPI").collect();
        format!(
            "{} {}{}",
            wl(&o.at),
            if kk.is_empty() {
                "CPI".to_string()
            } else {
                kk.join(", ")
            },
            if let Some(t) = o.target.as_ref().filter(|t| !t.is_empty()) {
                format!(" {t}")
            } else if let Some((p, i)) = o.cpi.as_ref().and_then(|c| {
                let c = c.borrow();
                c.ix.clone()
                    .filter(|i| !i.is_empty())
                    .map(|i| (c.program.clone(), i))
            }) {
                format!(" {p}.{i}")
            } else {
                String::new()
            }
        )
    };
    let pst = |s: &str| match s {
        "found" => "found",
        "partial" => "PARTIAL",
        "not_found" => "NOT FOUND",
        "runtime" => "runtime",
        _ => "undefined",
    };
    if let Some(ps) = ix.proof.as_ref().filter(|p| !p.is_empty()) {
        out.extend(
            [
                "",
                "## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for p in ps {
            out.push(format!("- {} [{}]", op_name(p.op), p.kind));
            for x in &p.props {
                out.push(format!(
                    "  - [{}] {} — {}",
                    pst(x.status),
                    x.prop,
                    md(&x.evidence)
                ));
            }
        }
    }
    if let Some(cs) = ix.chains.as_ref().filter(|c| !c.is_empty()) {
        out.extend(
            ["", "## Authorization chains (operation ⇐ … ⇐ signer)", ""]
                .iter()
                .map(|s| s.to_string()),
        );
        for c in cs.iter().take(12) {
            for alt in &c.steps {
                out.push(format!(
                    "- {} ⇐ {}",
                    op_name(c.op),
                    alt.iter()
                        .skip(1)
                        .map(|s| format!(
                            "{} {}{}",
                            s.kind,
                            s.what,
                            s.status
                                .filter(|s| !s.is_empty())
                                .map_or(String::new(), |s| format!(" ({})", stx(s)))
                        ))
                        .collect::<Vec<_>>()
                        .join(" ⇐ ")
                ));
            }
        }
    }
    let pcs: Vec<&super::phase3::PathInfo> = ix
        .paths
        .iter()
        .flatten()
        .filter(|p| !p.conds.is_empty() || !p.not_required.is_empty())
        .collect();
    if !pcs.is_empty() {
        out.extend(
            [
                "",
                "## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for p in pcs.iter().take(16) {
            let cs: Vec<String> = p
                .conds
                .iter()
                .filter(|c| c.how != "loop")
                .take(10)
                .map(|c| {
                    format!(
                        "{}`{}`{}",
                        if c.holds { "" } else { "✗ " },
                        sl(&md(&c.cond), 70),
                        c.check.map_or(String::new(), |k| format!(" #{k}"))
                    )
                })
                .collect();
            out.push(format!(
                "- {}: {}{}{}",
                op_name(p.op),
                if cs.is_empty() {
                    "no conditions found".to_string()
                } else {
                    cs.join(" · ")
                },
                if p.conds.len() > 10 {
                    format!(" · … {} more", p.conds.len() - 10)
                } else {
                    String::new()
                },
                if p.truncated == Some(true) {
                    " (budget reached)"
                } else {
                    ""
                }
            ));
            if !p.not_required.is_empty() {
                out.push(format!(
                    "  - not required on some path: {}",
                    p.not_required
                        .iter()
                        .map(|(k, path)| {
                            let c = &ix.checks[*k];
                            format!(
                                "#{k} ({}{}){}",
                                c.kinds.join(", "),
                                c.account
                                    .as_ref()
                                    .filter(|a| !a.is_empty())
                                    .map_or(String::new(), |a| format!(" {a}")),
                                path.as_ref().map_or(String::new(), |p| format!(
                                    " via {}",
                                    p.iter().map(|x| wl(x)).collect::<Vec<_>>().join(" → ")
                                ))
                            )
                        })
                        .collect::<Vec<_>>()
                        .join("; ")
                ));
            }
        }
    }
    let arith = ix.arith.as_deref().unwrap_or(&[]);
    let divs = ix.divs.as_deref().unwrap_or(&[]);
    if !arith.is_empty() || !divs.is_empty() {
        out.extend(
            ["", "## Arithmetic on value paths", ""]
                .iter()
                .map(|s| s.to_string()),
        );
        for x in arith {
            out.push(format!(
                "- {} {} ← `{}`: {}{}{}",
                wl(&x.at),
                x.target,
                md(&x.expr),
                if x.status == "unchecked" {
                    "UNCHECKED (wraps)"
                } else {
                    x.status
                },
                x.guard.as_ref().map_or(String::new(), |(at, cond)| format!(
                    " — guard `{}` ({})",
                    md(cond),
                    wl(at)
                )),
                if x.caller == Some(true) {
                    " — instruction data"
                } else {
                    ""
                }
            ));
        }
        for x in divs {
            out.push(format!(
                "- {} division by {}: {}",
                wl(&x.at),
                md(&x.divisor),
                if x.status == "checked" {
                    let (at, cond) = x.guard.as_ref().unwrap();
                    format!("checked — `{}` ({})", md(cond), wl(at))
                } else {
                    "NO zero / minimum check found".to_string()
                }
            ));
        }
    }
    if let Some(rs) = ix.relations.as_ref().filter(|r| !r.is_empty()) {
        out.extend(
            ["", "## Relations (equalities the checks establish)", ""]
                .iter()
                .map(|s| s.to_string()),
        );
        for x in rs.iter().take(20) {
            out.push(format!(
                "- {} {} {} ({}, {}, {})",
                x.a,
                if x.kind == "compare" { "~" } else { "==" },
                x.b,
                x.kind,
                st(x.status),
                wl(&x.at)
            ));
        }
    }
    if let Some(sk) = ix.stored_keys.as_ref().filter(|s| !s.is_empty()) {
        out.extend(
            [
                "",
                "## Stored keys (accounts whose data is used: which stored keys are compared with provided accounts)",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for k in sk {
            let mut parts: Vec<String> = k.compared.clone();
            parts.extend(
                k.referenced_by
                    .iter()
                    .map(|b| format!("key referenced by {b}")),
            );
            out.push(format!(
                "- {}{}: {}",
                k.account,
                k.ty.as_ref()
                    .filter(|t| !t.is_empty())
                    .map_or(String::new(), |t| format!(" ({t})")),
                if parts.is_empty() {
                    "no key relation found".to_string()
                } else {
                    parts.join("; ")
                }
            ));
            if k.compared.is_empty() {
                out.push(format!(
                    "  - none of its stored fields is compared with a provided account{}",
                    if k.referenced_by.is_empty() {
                        String::new()
                    } else {
                        format!(" (bound only through {})", k.referenced_by.join(", "))
                    }
                ));
            }
            if !k.never.is_empty() {
                out.push(format!(
                    "  - stored keys never compared: {}",
                    k.never.join(", ")
                ));
            }
            for g in &k.gaps {
                out.push(format!("  - GAP: {g}"));
            }
        }
    }
    let mine: Vec<&super::consistency::RoleView> = a
        .consistency
        .iter()
        .flatten()
        .filter(|v| v.members.iter().any(|m| m.ix == ix.name))
        .collect();
    if !mine.is_empty() {
        out.extend(
            [
                "",
                "## Validation consistency (account roles shared with other instructions: the validations each applies)",
                "",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for v in mine.iter().take(12) {
            let mut ixn: IndexSet<&str> = IndexSet::default();
            for m in &v.members {
                ixn.insert(&m.ix);
            }
            let cnt = ixn.len();
            for m in v.members.iter().filter(|m| m.ix == ix.name) {
                let mut others: IndexMap<&str, usize> = IndexMap::default();
                for o in &v.members {
                    if o.ix != ix.name {
                        let mut seen: IndexSet<&str> = IndexSet::default();
                        for x in &o.validations {
                            seen.insert(x);
                        }
                        for x in seen {
                            *others.entry(x).or_insert(0) += 1;
                        }
                    }
                }
                let mut ov: Vec<(&str, usize)> = others.into_iter().collect();
                ov.sort_by(|p, q| q.1.cmp(&p.1));
                let os: Vec<String> = ov.iter().take(6).map(|(x, c)| format!("{x} {c}")).collect();
                out.push(sl(
                    &format!(
                        "- {} [{}; {cnt} instructions]: here {}; in the others {}",
                        m.account,
                        v.role,
                        if m.validations.is_empty() {
                            "none".to_string()
                        } else {
                            m.validations.join(", ")
                        },
                        if os.is_empty() {
                            "none".to_string()
                        } else {
                            os.join(", ")
                        }
                    ),
                    300,
                ));
                for x in v
                    .inconsistencies
                    .iter()
                    .filter(|x| x.ix == ix.name && x.account == m.account)
                {
                    out.push(sl(&format!("  - ⚠ {}", inc_line(x, w, false)), 400));
                }
            }
        }
    }
    let tr: Vec<&super::phase2::TrustRow> = ix
        .trust
        .iter()
        .flatten()
        .filter(|t| t.trust != "validated" || !t.evidence.is_empty())
        .collect();
    if !tr.is_empty() {
        out.extend(
            ["", "## Trust (caller-controlled vs validated values)", ""]
                .iter()
                .map(|s| s.to_string()),
        );
        let cc: Vec<&str> = tr
            .iter()
            .filter(|t| t.trust == "caller-controlled")
            .map(|t| t.value.as_str())
            .collect();
        if !cc.is_empty() {
            out.push(format!(
                "- caller-controlled (no validating check found): {}",
                cc.join(", ")
            ));
        }
        for t in tr.iter().filter(|t| t.trust != "caller-controlled") {
            out.push(format!(
                "- {}: {}{}",
                t.value,
                t.trust,
                if t.evidence.is_empty() {
                    String::new()
                } else {
                    format!(" ({})", t.evidence[..t.evidence.len().min(4)].join(", "))
                }
            ));
        }
    }
    if !ix.checks.is_empty() {
        out.extend(
            [
                "",
                "## Checks",
                "",
                "| # | at | status | account | kinds | fails if | error |",
                "|---|---|---|---|---|---|---|",
            ]
            .iter()
            .map(|s| s.to_string()),
        );
        for (i, c) in ix.checks.iter().enumerate() {
            out.push(format!(
                "| {i} | {} | {} | {} | {}{} | `{}` | {} |",
                wl(&c.at),
                st(c.status),
                c.account.as_deref().unwrap_or(""),
                c.kinds.join(", "),
                c.via
                    .as_ref()
                    .filter(|v| !v.is_empty())
                    .map_or(String::new(), |v| format!(" (via {v})")),
                sl(&md(&fail_text(c)), 100),
                c.error
            ));
        }
    }
    out.join("\n") + "\n"
}

/// Short comment block for the single-file output.
pub fn render_summary_comment(a: &Analysis) -> Vec<String> {
    let mut out = vec!["// security summary (DERIVED, over-approximate; write a project with -o dir/ for security/*.md, analysis.json):".to_string()];
    for ix in a.ixs.iter().take(40) {
        let fl = flags(ix);
        out.push(format!(
            "//   {} [score {}]: {}{}{}",
            ix.name,
            ix.score,
            if ix.effects.is_empty() {
                "no effects found".to_string()
            } else {
                ix.effects[..ix.effects.len().min(4)].join("; ")
            },
            if ix.effects.len() > 4 { "; …" } else { "" },
            if fl.is_empty() {
                String::new()
            } else {
                format!(
                    " | ⚠ {}{}",
                    fl[..fl.len().min(2)].join("; "),
                    if fl.len() > 2 { "; …" } else { "" }
                )
            }
        ));
    }
    if a.ixs.len() > 40 {
        out.push(format!("//   … {} more", a.ixs.len() - 40));
    }
    out
}

// ---- budgets (src/budget.ts) ----

struct Item {
    head: String,
    kids: Vec<String>,
}

struct Section {
    head: Vec<String>,
    items: Vec<Item>,
    tail: Vec<String>,
    table: bool,
}

fn is_rule(l: &str) -> bool {
    // /^\|[-| ]+\|$/
    let b = l.as_bytes();
    b.len() >= 3
        && b[0] == b'|'
        && b[b.len() - 1] == b'|'
        && b[1..b.len() - 1]
            .iter()
            .all(|&c| c == b'-' || c == b'|' || c == b' ')
}

/// Section order for security/<ix>.md (dropped first → last).
pub fn ix_order(h: &str) -> usize {
    const O: [&str; 17] = [
        "Path conditions",
        "Relations",
        "Trust",
        "Validation consistency",
        "Authorization chains",
        "Proof trees",
        "Arithmetic",
        "Dominance",
        "Authority",
        "^## Checks",
        "Operations",
        "PDAs derived",
        "CPIs",
        "Constraints per account",
        "Findings",
        "Account privileges",
        "Look first",
    ];
    rank_of(&O, h)
}

/// Section order for security/summary.md.
pub fn summary_order(h: &str) -> usize {
    const O: [&str; 10] = [
        "Read/write dependencies",
        "State machine",
        "Authority fields",
        "State writes",
        "^## PDAs",
        "not attributed",
        "Stored keys not compared",
        "Validation consistency",
        "Findings",
        "Instructions",
    ];
    rank_of(&O, h)
}

fn rank_of(o: &[&str], h: &str) -> usize {
    o.iter()
        .position(|p| match p.strip_prefix('^') {
            Some(q) => h.starts_with(q),
            None => h.contains(p),
        })
        .unwrap_or(o.len())
}

/// budgetMarkdown: cut a security markdown file to `max` lines (`order`: the rank of a section heading)
pub fn budget_markdown(text: &str, max: usize, order: fn(&str) -> usize) -> String {
    let wh = "analysis.json";
    let count = text.split('\n').count() - if text.ends_with('\n') { 1 } else { 0 };
    if count <= max {
        return text.to_string();
    }
    let body = text.strip_suffix('\n').unwrap_or(text);
    let mut pre: Vec<String> = Vec::new();
    let mut secs: Vec<Section> = Vec::new();
    for l in body.split('\n') {
        if l.starts_with("## ") {
            secs.push(Section {
                head: vec![l.to_string()],
                items: vec![],
                tail: vec![],
                table: false,
            });
            continue;
        }
        let Some(cur) = secs.last_mut() else {
            pre.push(l.to_string());
            continue;
        };
        let is_item = l.starts_with("- ")
            || (l.starts_with('|') && !is_rule(l) && cur.head.iter().any(|h| is_rule(h)));
        if is_item && cur.tail.is_empty() {
            cur.items.push(Item {
                head: l.to_string(),
                kids: vec![],
            });
            if l.starts_with('|') {
                cur.table = true;
            }
            continue;
        }
        if l.starts_with("  ") && !cur.items.is_empty() && cur.tail.is_empty() {
            cur.items.last_mut().unwrap().kids.push(l.to_string());
            continue;
        }
        if !cur.items.is_empty() {
            cur.tail.push(l.to_string());
        } else {
            cur.head.push(l.to_string());
        }
    }
    let n = secs.len();
    let ranks: Vec<usize> = secs.iter().map(|s| order(&s.head[0])).collect();
    let mut by_rank: Vec<usize> = (0..n).collect();
    by_rank.sort_by_key(|&i| ranks[i]);
    let mut lim_items: Vec<usize> = secs.iter().map(|s| s.items.len()).collect();
    let mut lim_kids: Vec<Vec<usize>> = secs
        .iter()
        .map(|s| s.items.iter().map(|it| it.kids.len()).collect())
        .collect();
    let item_lines = |it: &Item, k: usize| {
        1 + k.min(it.kids.len()) + if k > 0 && k < it.kids.len() { 1 } else { 0 }
    };
    let sec_lines = |s: &Section, li: usize, lk: &[usize]| {
        let mut m = s.head.len() + s.tail.len();
        for i in 0..li {
            m += item_lines(&s.items[i], lk[i]);
        }
        m + if li < s.items.len() {
            if s.table {
                2
            } else {
                1
            }
        } else {
            0
        }
    };
    let mut sizes: Vec<usize> = (0..n)
        .map(|i| sec_lines(&secs[i], lim_items[i], &lim_kids[i]))
        .collect();
    let mut total: usize = pre.len() + sizes.iter().sum::<usize>();
    // (step k of the section ranked r at time k + r)
    let mut plan: Vec<(usize, usize, usize)> = Vec::new();
    for (r, &s) in by_rank.iter().enumerate() {
        for k in 0..7 {
            plan.push((k + r, k, s));
        }
    }
    plan.sort_by_key(|x| x.0);
    'outer: for &(_, k, s) in &plan {
        if k < 3 {
            let kk = [3, 1, 0][k];
            for i in (0..secs[s].items.len()).rev() {
                if lim_kids[s][i] > kk {
                    lim_kids[s][i] = kk;
                    let m = sec_lines(&secs[s], lim_items[s], &lim_kids[s]);
                    total = total + m - sizes[s];
                    sizes[s] = m;
                    if total <= max {
                        break 'outer;
                    }
                }
            }
        } else {
            let kk = [20, 8, 3, 0][k - 3];
            if lim_items[s] > kk {
                lim_items[s] = kk;
                let m = sec_lines(&secs[s], lim_items[s], &lim_kids[s]);
                total = total + m - sizes[s];
                sizes[s] = m;
                if total <= max {
                    break 'outer;
                }
            }
        }
    }
    let mut out: Vec<String> = pre;
    for (si, s) in secs.iter().enumerate() {
        out.extend(s.head.iter().cloned());
        for (i, it) in s.items.iter().take(lim_items[si]).enumerate() {
            let k = lim_kids[si][i];
            let cut = it.kids.len() as i64 - k as i64;
            if cut <= 0 {
                out.push(it.head.clone());
                out.extend(it.kids.iter().cloned());
            } else if k == 0 {
                out.push(format!(
                    "{}{}",
                    it.head,
                    if s.table {
                        String::new()
                    } else {
                        format!(" (… {cut} more line{})", if cut > 1 { "s" } else { "" })
                    }
                ));
            } else {
                out.push(it.head.clone());
                out.extend(it.kids.iter().take(k).cloned());
                out.push(format!("  - … {cut} more"));
            }
        }
        let m = s.items.len() - lim_items[si];
        if m > 0 {
            if s.table {
                out.push(String::new());
            }
            out.push(format!("- … {m} more in {wh}"));
        }
        out.extend(s.tail.iter().cloned());
    }
    out.join("\n") + "\n"
}
