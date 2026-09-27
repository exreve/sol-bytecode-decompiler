//! Facts for the audit pattern rules (`src/analysis/audit.ts`): per instruction, on the IR: accounts whose data the
//! logic borrows itself, PDA bumps from instruction data, CPI results never read, narrowing casts of value-path
//! amounts, remaining accounts the checks read, authority writes of an init_if_needed account not gated by its
//! state, sysvar layouts parsed by behavior. Also `evaluatorsFor` (the Anchor evaluation contexts of an
//! instruction's functions, shared by the report, libcpi and the rules).

use super::anchor::{ACtx, HVal, HA, HK};
use super::flow::*;
use super::ixctx::IxCtx;
use super::An;
use indexmap::IndexMap;
use std::rc::Rc;

#[derive(Clone, Debug)]
pub struct InitWrite {
    pub acct: String,
    pub ty: String,
    pub at: super::report::Loc,
    pub owner: bool,
    pub field: Option<String>,
    pub tag: Option<String>,
}

#[derive(Clone, Debug)]
pub struct SysvarRead {
    pub acct: String,
    pub sysvar: &'static str,
    pub at: super::report::Loc,
    pub id_compared: bool,
}

#[derive(Clone, Debug, Default)]
pub struct AuditFacts {
    pub data_reads: Vec<String>,
    pub bumps: Vec<(usize, String)>,
    pub ignored: Vec<usize>,
    /// (op, expr, bits, source)
    pub casts: Vec<(usize, String, u32, String)>,
    pub rem_checked: Vec<String>,
    pub owner_cmp: Option<Vec<String>>,
    pub reinit: Vec<(usize, String)>,
    /// (fn, n, type, accts)
    pub same_type: Option<(String, usize, Option<String>, Vec<String>)>,
    pub init_writes: Option<Vec<InitWrite>>,
    pub sysvar_reads: Option<Vec<SysvarRead>>,
    pub init_gated: Option<Vec<String>>,
}

impl<'a> An<'a> {
    /// auditIx (8b: in progress)
    pub fn audit_ix(
        &self,
        _ix: &super::report::IxOut,
        _info: &super::ixctx::IxInfo<'a>,
        _s: &super::sources::SourceCtx<'a, '_>,
    ) -> AuditFacts {
        AuditFacts::default()
    }

    /// evaluatorsFor(r, ctx)(fn): the Anchor evaluation context of a function of an instruction (its parameters
    /// bound up the call path; try_accounts' &AccountInfo variables)
    pub fn ev_for(&self, ctx: &IxCtx<'a>, fn_: i64) -> Option<Rc<ACtx<'a>>> {
        self.ev_init(ctx);
        self.ev_in(ctx, fn_, 0)
    }

    /// (evaluatorsFor's creation: the handler's anchorEval and tryInfo, once per context)
    pub fn ev_init(&self, ctx: &IxCtx<'a>) {
        if ctx.ev_ready.get() {
            return;
        }
        ctx.ev_ready.set(true);
        if self.fo(ctx.handler).is_some() {
            self.anchor_eval(ctx.handler);
            self.try_info(ctx.handler);
        }
    }

    fn ev_in(&self, ctx: &IxCtx<'a>, fn_: i64, d: u32) -> Option<Rc<ACtx<'a>>> {
        self.fo(ctx.handler)?;
        if d > 8 {
            return None;
        }
        if let Some(x) = ctx.ev.borrow().get(&fn_) {
            return x.clone();
        }
        ctx.ev.borrow_mut().insert(fn_, None);
        let ae = self.anchor_eval(ctx.handler);
        let mut x: Option<Rc<ACtx<'a>>> = None;
        if let Some(fo) = self.fo(fn_) {
            if fn_ == ctx.handler {
                x = Some(ae.ctx_of(fn_, IndexMap::new(), 2));
            } else {
                let par = ctx.parents.get(&fn_).copied();
                let pp = par.and_then(|p| self.ev_in(ctx, p.fn_, d + 1));
                let st = par.and_then(|p| p.pc.and_then(|pc| self.stmt_at(p.fn_, pc)));
                let c = match (par, st) {
                    (Some(p), Some((b, i))) => {
                        let pf = self.fo(p.fn_).unwrap().f;
                        call_of(fir(pf), &pf.blocks[b].stmts[i]).map(|c| (c, pos_of(b, i), fir(pf)))
                    }
                    _ => None,
                };
                if let (Some(pp), Some(((_, args), sp, pir))) = (pp, c) {
                    let mut roots: IndexMap<u32, HVal<'a>> = IndexMap::new();
                    for (j, a) in pir.items(args).enumerate() {
                        let v = pp.ev(a, sp, 0);
                        let pv = arg_param(fo.f, j);
                        if let (Some(v), Some(pv)) = (v, pv) {
                            roots.insert(pv, v);
                        }
                    }
                    let t = self.try_info(ctx.handler);
                    if let Some(t) = t.filter(|t| t.try_pc == fn_) {
                        if let Some(ptrs) = &t.ptrs {
                            for (id, acct) in ptrs {
                                let mut h = HA::new(HK::Info, acct.clone(), 0.0);
                                h.seq = t.seqs.as_ref().and_then(|s| s.get(id).cloned());
                                roots.insert(*id, HVal::a(h));
                            }
                        }
                    }
                    x = Some(ae.ctx_of(fn_, roots, 2));
                }
            }
        }
        ctx.ev.borrow_mut().insert(fn_, x.clone());
        x
    }
}
