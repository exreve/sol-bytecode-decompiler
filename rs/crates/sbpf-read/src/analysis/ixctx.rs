//! The instructions and their contexts as the report layer builds them (the start of report.ts analyze0):
//! roots (instruction handlers, processors, else the entrypoint), native dispatch splits, the functions
//! each instruction reaches through direct calls / function pointers (main path, call parents), its initial
//! account rows; ctxResolver (native account resolvers along the call path).

use super::acct::{account_resolver, seed_from, Resolver};
use super::dispatch::{DispatchGroup, DispatchGroups, Indirect};
use super::flow::*;
use super::An;
use indexmap::{IndexMap, IndexSet};
use sbpf_ir::{CallTarget, Stmt, E};
use std::cell::RefCell;
use std::collections::{HashMap, HashSet, VecDeque};
use std::rc::Rc;

#[derive(Clone, Copy, Debug)]
pub struct Parent {
    pub fn_: i64,
    pub pc: Option<i64>,
    pub ret: Option<E>,
}

/// IxCtx: the handler, the call parents, the dispatch group (allowed blocks), the dispatchers, the tag variable
pub struct IxCtx<'a> {
    pub id: u32,
    pub handler: i64,
    pub parents: IndexMap<i64, Parent>,
    pub grp: Option<DispatchGroup>,
    pub restricted: Option<IndexSet<i64>>,
    pub tag: Option<(i64, u32)>,
    pub res: RefCell<HashMap<i64, Option<Rc<Resolver<'a>>>>>,
    pub ridom: RefCell<HashMap<i64, Rc<Vec<i32>>>>,
}

impl IxCtx<'_> {
    pub fn allowed(&self, fn_: i64, b: usize) -> Option<bool> {
        self.grp.as_ref().map(|g| g.allowed(fn_, b))
    }
}

#[derive(Clone, Debug, Default)]
pub struct Expected {
    pub signer: bool,
    pub writable: bool,
    pub pda: bool,
    pub optional: bool,
    pub address: Option<String>,
}

#[derive(Clone, Debug)]
pub struct AccountRow {
    pub index: Option<f64>,
    pub name: String,
    pub source: &'static str,
    pub expected: Expected,
}

pub struct IxInfo<'a> {
    pub name: String,
    pub handler: i64,
    pub h_name: String,
    pub grp: Option<DispatchGroup>,
    pub fns: Vec<i64>,
    pub main: IndexMap<i64, bool>,
    pub indirect: Vec<String>,
    pub accounts: Vec<AccountRow>,
    pub ctx: Rc<IxCtx<'a>>,
}

fn parse_idl_account(s: &str, i: usize) -> AccountRow {
    let (head, flags) = match crate::jre!(r"^(\S+)(?: \[(.*)\])?$").captures(s) {
        Some(m) => (
            m[1].to_string(),
            m.get(2).map_or(String::new(), |x| x.as_str().to_string()),
        ),
        None => (s.to_string(), String::new()),
    };
    let fl: Vec<&str> = flags.split(", ").collect();
    let addr = fl
        .iter()
        .find(|f| f.starts_with("= "))
        .map(|f| f[2..].to_string());
    AccountRow {
        index: Some(i as f64),
        name: head.split('.').next_back().unwrap_or("").to_string(),
        source: "idl",
        expected: Expected {
            signer: fl.contains(&"signer"),
            writable: fl.contains(&"mut"),
            pda: fl.contains(&"pda"),
            optional: fl.contains(&"optional"),
            address: addr,
        },
    }
}

impl<'a> An<'a> {
    /// the functions a library function calls, in order
    fn lib_calls(&self, pc: i64) -> Vec<i64> {
        let Some(f) = self.p.funcs.get(&pc) else {
            return vec![];
        };
        let mut l = Vec::new();
        for b in &f.blocks {
            for st in &b.stmts {
                if let Stmt::Call {
                    t: CallTarget::Fn { pc },
                    ..
                } = st
                {
                    l.push(*pc);
                }
            }
        }
        l
    }

    /// the instruction handlers (roots) and their native dispatch splits
    pub fn roots(&self) -> Vec<i64> {
        let proc_names: HashSet<&str> = self.processors.iter().map(|x| x.0.as_str()).collect();
        let mut roots: Vec<i64> = self
            .funcs
            .iter()
            .filter(|f| f.name.starts_with("ix_") || proc_names.contains(f.name.as_str()))
            .map(|f| f.pc)
            .collect();
        if roots.is_empty() {
            roots = self
                .funcs
                .iter()
                .filter(|f| f.f.is_entry)
                .map(|f| f.pc)
                .collect();
        }
        roots
    }

    pub fn ix_contexts(
        &self,
        ind: &Indirect,
        splits: &IndexMap<i64, DispatchGroups>,
    ) -> Vec<IxInfo<'a>> {
        let roots = self.roots();
        let root_pcs: HashSet<i64> = roots.iter().copied().collect();
        let mut out: Vec<IxInfo<'a>> = Vec::new();
        let mut next_id = 1u32;
        let lib_memo: RefCell<HashMap<i64, Vec<i64>>> = RefCell::new(HashMap::new());
        let lib_calls = |pc: i64| -> Vec<i64> {
            if let Some(l) = lib_memo.borrow().get(&pc) {
                return l.clone();
            }
            let l = self.lib_calls(pc);
            lib_memo.borrow_mut().insert(pc, l.clone());
            l
        };
        for &hpc in &roots {
            let h = self.fo(hpc).unwrap();
            let groups: Vec<Option<&DispatchGroup>> = match splits.get(&hpc) {
                Some(g) => g.groups.iter().map(Some).collect(),
                None => vec![None],
            };
            for grp in groups {
                let name = match grp {
                    Some(g) => g.name.clone(),
                    None => h.name.strip_prefix("ix_").unwrap_or(&h.name).to_string(),
                };
                let info = if grp.is_some() {
                    None
                } else {
                    self.instructions.iter().find(|i| i.pc == hpc)
                };
                let facts = self.facts.borrow();
                let keep = |fn_: i64, pc: Option<i64>| -> bool {
                    match (grp, pc) {
                        (None, _) | (_, None) => true,
                        (Some(g), Some(pc)) => g.keep(self, fn_, pc),
                    }
                };
                let is_disp = |fn_: i64| -> bool {
                    grp.is_some_and(|g| {
                        g.dispatchers
                            .iter()
                            .any(|d| Some(d) == facts.get(&fn_).map(|f| &f.name))
                    })
                };
                let keep_call = |fn_: i64, pc: Option<i64>, ret: Option<E>| -> bool {
                    let Some(g) = grp else { return true };
                    if pc.is_some() {
                        return keep(fn_, pc);
                    }
                    let b = match (self.fo(fn_), ret) {
                        (Some(_), Some(r)) => self.cfg(fn_).ret_block.get(&r).copied(),
                        _ => None,
                    };
                    b.is_none_or(|b| g.allowed(fn_, b))
                };
                let mut main: IndexMap<i64, bool> = IndexMap::from([(hpc, true)]);
                let mut lib: HashSet<i64> = HashSet::new();
                let mut q: VecDeque<i64> = VecDeque::from([hpc]);
                let mut parents: IndexMap<i64, Parent> = IndexMap::new();
                let mut from: Option<Parent> = None;
                #[allow(clippy::too_many_arguments)]
                fn reach(
                    an: &An,
                    facts: &IndexMap<i64, super::facts::FnFacts>,
                    root_pcs: &HashSet<i64>,
                    hpc: i64,
                    lib_calls: &dyn Fn(i64) -> Vec<i64>,
                    main: &mut IndexMap<i64, bool>,
                    lib: &mut HashSet<i64>,
                    q: &mut VecDeque<i64>,
                    parents: &mut IndexMap<i64, Parent>,
                    from: Option<Parent>,
                    callee: i64,
                    cm: bool,
                ) {
                    if root_pcs.contains(&callee) {
                        return;
                    }
                    if let Some(fr) = from {
                        if !parents.contains_key(&callee) && callee != hpc {
                            parents.insert(callee, fr);
                        }
                    }
                    if !facts.contains_key(&callee) {
                        if lib.contains(&callee) || !an.p.funcs.contains_key(&callee) {
                            return;
                        }
                        lib.insert(callee);
                        for t in lib_calls(callee) {
                            reach(
                                an, facts, root_pcs, hpc, lib_calls, main, lib, q, parents, from,
                                t, false,
                            );
                        }
                        return;
                    }
                    let prev = main.get(&callee).copied();
                    if prev.is_none() || (cm && prev == Some(false)) {
                        main.insert(callee, cm);
                        q.push_back(callee);
                    }
                }
                let generated = h.name.starts_with("ix_") && self.anchor;
                let mut indirect: Vec<String> = Vec::new();
                let via_ptr = |t: i64,
                               why: String,
                               main: &mut IndexMap<i64, bool>,
                               lib: &mut HashSet<i64>,
                               q: &mut VecDeque<i64>,
                               parents: &mut IndexMap<i64, Parent>,
                               from: Option<Parent>,
                               indirect: &mut Vec<String>| {
                    if !main.contains_key(&t) && !root_pcs.contains(&t) && facts.contains_key(&t) {
                        let ft = &facts[&t];
                        if !ft.ops.is_empty() || !why.starts_with("function") {
                            indirect.push(format!("{} ({why})", ft.name));
                        }
                        reach(
                            self, &facts, &root_pcs, hpc, &lib_calls, main, lib, q, parents, from,
                            t, false,
                        );
                    }
                };
                if let Some(info) = info {
                    for &t in ind.by_disc.get(&info.disc).map_or(&[][..], |v| &v[..]) {
                        via_ptr(
                            t,
                            "entrypoint table entry chosen by the discriminator".into(),
                            &mut main,
                            &mut lib,
                            &mut q,
                            &mut parents,
                            from,
                            &mut indirect,
                        );
                    }
                }
                while let Some(x) = q.pop_front() {
                    let m = main[&x];
                    let calls: Vec<(Option<i64>, Option<E>, i64, bool, bool)> =
                        facts.get(&x).map_or(vec![], |f| {
                            f.calls
                                .iter()
                                .map(|c| (c.pc, c.ret, c.callee, c.main, c.err_path))
                                .collect()
                        });
                    for (cpc, cret, callee, cmain, err) in calls {
                        if (!err || is_disp(x)) && keep_call(x, cpc, cret) {
                            from = Some(Parent {
                                fn_: x,
                                pc: cpc,
                                ret: cret,
                            });
                            reach(
                                self,
                                &facts,
                                &root_pcs,
                                hpc,
                                &lib_calls,
                                &mut main,
                                &mut lib,
                                &mut q,
                                &mut parents,
                                from,
                                callee,
                                m && (cmain || (generated && x == hpc)),
                            );
                        }
                    }
                    from = Some(Parent {
                        fn_: x,
                        pc: None,
                        ret: None,
                    });
                    let xname = facts
                        .get(&x)
                        .map_or("undefined".to_string(), |f| f.name.clone());
                    for &t in ind.targets.get(&x).map_or(&[][..], |v| &v[..]) {
                        via_ptr(
                            t,
                            format!("function pointer in {xname}"),
                            &mut main,
                            &mut lib,
                            &mut q,
                            &mut parents,
                            from,
                            &mut indirect,
                        );
                    }
                }
                let fns: Vec<i64> = main
                    .keys()
                    .copied()
                    .filter(|pc| facts.contains_key(pc))
                    .collect();
                let accounts: Vec<AccountRow> = match info
                    .and_then(|i| i.accounts.as_ref())
                    .filter(|a| !a.is_empty())
                {
                    Some(a) => a
                        .iter()
                        .enumerate()
                        .map(|(i, s)| parse_idl_account(s, i))
                        .collect(),
                    None => match grp.and_then(|g| g.accounts.as_ref()) {
                        Some(a) => a
                            .iter()
                            .enumerate()
                            .map(|(i, n)| AccountRow {
                                index: Some(i as f64),
                                name: n.clone(),
                                source: "known",
                                expected: Expected::default(),
                            })
                            .collect(),
                        None => info
                            .and_then(|i| i.str_accounts.as_ref())
                            .map_or(vec![], |a| {
                                a.iter()
                                    .enumerate()
                                    .map(|(i, n)| AccountRow {
                                        index: Some(i as f64),
                                        name: n.clone(),
                                        source: "str",
                                        expected: Expected::default(),
                                    })
                                    .collect()
                            }),
                    },
                };
                let restricted = grp.map(|g| {
                    fns.iter()
                        .copied()
                        .filter(|pc| g.dispatchers.iter().any(|d| *d == facts[pc].name))
                        .collect::<IndexSet<i64>>()
                });
                drop(facts);
                let ctx = Rc::new(IxCtx {
                    id: next_id,
                    handler: hpc,
                    parents,
                    grp: grp.cloned(),
                    restricted,
                    tag: grp.map(|g| g.tag),
                    res: RefCell::new(HashMap::new()),
                    ridom: RefCell::new(HashMap::new()),
                });
                next_id += 1;
                out.push(IxInfo {
                    name,
                    handler: hpc,
                    h_name: h.name.clone(),
                    grp: grp.cloned(),
                    fns,
                    main,
                    indirect,
                    accounts,
                    ctx,
                });
            }
        }
        out
    }

    /// native: the account resolver of a function of an instruction, its pointer parameters bound to the values
    /// at the call site of the instruction's call path (ctxResolver)
    pub fn ctx_resolver(&self, ctx: &IxCtx<'a>, fn_: i64, d: u32) -> Option<Rc<Resolver<'a>>> {
        if let Some(x) = ctx.res.borrow().get(&fn_) {
            return x.clone();
        }
        let fo = self.fo(fn_)?;
        let r0 = account_resolver(&self.fl, fo.f, &fo.names, true, None);
        ctx.res.borrow_mut().insert(fn_, Some(r0));
        let par = if fn_ != ctx.handler && d < 6 {
            ctx.parents.get(&fn_).copied()
        } else {
            None
        };
        let pr = match par {
            Some(p) if p.pc.is_some() => self.ctx_resolver(ctx, p.fn_, d + 1),
            _ => None,
        };
        let pf = par.and_then(|p| self.fo(p.fn_));
        let mut pos: Pos = -1;
        let mut c = None;
        if let (Some(pf), Some(p)) = (pf, par) {
            if let Some(ppc) = p.pc {
                let ir = fir(pf.f);
                for (bi, b) in pf.f.blocks.iter().enumerate() {
                    for (i, st) in b.stmts.iter().enumerate() {
                        if stmt_pc(st) == ppc {
                            if let Some(x) = call_of(ir, st) {
                                pos = pos_of(bi, i);
                                c = Some(x);
                            }
                        }
                    }
                }
            }
        }
        let seed = seed_from(&self.fl, pr.as_ref(), pf.map(|x| x.f), c, pos, fo.f, fn_);
        if !seed.is_empty() {
            let r = account_resolver(&self.fl, fo.f, &fo.names, true, Some(&seed));
            ctx.res.borrow_mut().insert(fn_, Some(r));
        }
        ctx.res.borrow().get(&fn_).cloned().flatten()
    }

    /// the native dispatch splits of the roots (analyze0: not for Anchor programs, not for ix_ handlers)
    pub fn splits(&self) -> IndexMap<i64, DispatchGroups> {
        let roots = self.roots();
        let root_pcs: HashSet<i64> = roots.iter().copied().collect();
        let mut splits: IndexMap<i64, DispatchGroups> = IndexMap::new();
        if !self.anchor {
            for &h in &roots {
                if !self.fo(h).unwrap().name.starts_with("ix_") {
                    if let Some(g) = self.split_dispatch(h, &root_pcs) {
                        splits.insert(h, g);
                    }
                }
            }
        }
        splits
    }
}
