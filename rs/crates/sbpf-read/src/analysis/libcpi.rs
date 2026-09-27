//! Anchor CPI helpers the library database does not name (`src/analysis/libcpi.ts`: anchor_spl::token::
//! initialize_account3 / initialize_mint2, behind `init` of token accounts and mints), recognized in the bytecode of
//! the library function the handler calls; the accounts of a library helper's CpiContext (ctxAccounts).

use super::anchor::HK;
use super::facts::{cpi_kinds, FnFacts, OpCpi};
use super::flow::*;
use super::ixctx::IxCtx;
use super::report::{Loc, OpOut};
use super::An;
use crate::cpi::PartAcc;
use sbpf_elf::CallReloc;
use sbpf_ir::{BinOp, Node, Stmt, E};
use std::cell::RefCell;
use std::collections::HashSet;
use std::rc::Rc;

#[derive(Clone, Debug)]
pub struct LibCpi {
    pub program: &'static str,
    pub family: &'static str,
    pub ix: &'static str,
}

fn token_id(s: &str) -> Option<(&'static str, &'static str)> {
    match s {
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" => Some(("TOKEN_PROGRAM", "token")),
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" => Some(("TOKEN_2022_PROGRAM", "token2022")),
        _ => None,
    }
}

fn tag_name(t: i32) -> Option<&'static str> {
    match t {
        18 => Some("InitializeAccount3"),
        20 => Some("InitializeMint2"),
        _ => None,
    }
}

impl<'a> An<'a> {
    /// the CPI a library function the analysis has no name for makes, by its pc
    pub fn lib_cpi(&self, pc: i64) -> Option<LibCpi> {
        if let Some(x) = self.lib_cpi.borrow().get(&pc) {
            return x.clone();
        }
        let r = if self.lib_pcs.contains(&pc)
            && crate::jre!(r"^fn_[0-9a-f]+$").is_match(&self.pname(pc))
        {
            self.lib_scan(pc)
        } else {
            None
        };
        self.lib_cpi.borrow_mut().insert(pc, r.clone());
        r
    }

    fn lib_scan(&self, pc: i64) -> Option<LibCpi> {
        let p = self.p;
        let mut starts: Vec<i64> = p.funcs.keys().copied().collect();
        starts.sort();
        let n = p.insns.len() as i64;
        let end = |s: i64| -> i64 {
            let i = starts.partition_point(|&x| x <= s);
            starts.get(i).copied().unwrap_or(n)
        };
        let calls = |s: i64| -> (Vec<i64>, Vec<String>) {
            let (mut fns, mut sys) = (Vec::new(), Vec::new());
            let e = end(s).min(s + 4000);
            let mut i = s;
            while i < e {
                let x = &p.insns[i as usize];
                if x.opc == 0x85 {
                    match p.elf.call_reloc(i) {
                        Some(CallReloc::Syscall { name }) => sys.push(name.clone()),
                        Some(CallReloc::Fn { target_pc, .. }) => fns.push(*target_pc),
                        None => {
                            if p.version >= 3 || x.src == 1 || x.imm != -1 {
                                let t = i + 1 + x.imm as i64;
                                if t >= 0 && t < n && p.funcs.contains_key(&t) {
                                    fns.push(t);
                                }
                            }
                        }
                    }
                }
                i += 1;
            }
            (fns, sys)
        };
        fn invokes(
            calls: &dyn Fn(i64) -> (Vec<i64>, Vec<String>),
            s: i64,
            d: i32,
            seen: &mut HashSet<i64>,
        ) -> bool {
            if !seen.insert(s) {
                return false;
            }
            let (fns, sys) = calls(s);
            sys.iter().any(|n| n.contains("sol_invoke_signed"))
                || (d > 0 && fns.iter().any(|&t| invokes(calls, t, d - 1, seen)))
        }
        let img = p.image();
        let built = |s: i64| -> Option<LibCpi> {
            let mut prog: Option<(&'static str, &'static str)> = None;
            let mut tag: Option<i32> = None;
            let e = end(s).min(s + 4000);
            let mut i = s;
            while i < e {
                let x = &p.insns[i as usize];
                if x.opc == 0x18 && i + 1 < e {
                    let a =
                        (x.imm as u32 as u64) | ((p.insns[i as usize + 1].imm as u32 as u64) << 32);
                    if let Some(reg) = img.region(a, 32) {
                        if !reg.exec {
                            let o = (a - reg.vaddr) as usize;
                            let bytes = p.elf.region_bytes(reg);
                            let id = token_id(&crate::util::b58(&bytes[o..o + 32]));
                            if let Some(id) = id {
                                if prog.is_none() || id.0 == "TOKEN_PROGRAM" {
                                    prog = Some(id);
                                }
                            }
                        }
                    }
                    i += 1;
                } else if (x.opc == 0x62 || x.opc == 0x72)
                    && x.dst == 10
                    && tag_name(x.imm).is_some()
                {
                    if tag.is_some_and(|t| t != x.imm) {
                        return None;
                    }
                    tag = Some(x.imm);
                }
                i += 1;
            }
            match (prog, tag) {
                (Some(p), Some(t)) => Some(LibCpi {
                    program: p.0,
                    family: p.1,
                    ix: tag_name(t).unwrap(),
                }),
                _ => None,
            }
        };
        if !invokes(&calls, pc, 3, &mut HashSet::new()) {
            return None;
        }
        let mut found: indexmap::IndexMap<&'static str, LibCpi> = indexmap::IndexMap::new();
        fn walk(
            built: &dyn Fn(i64) -> Option<LibCpi>,
            calls: &dyn Fn(i64) -> (Vec<i64>, Vec<String>),
            s: i64,
            d: i32,
            seen: &mut HashSet<i64>,
            found: &mut indexmap::IndexMap<&'static str, LibCpi>,
        ) {
            if !seen.insert(s) {
                return;
            }
            if let Some(b) = built(s) {
                found.insert(b.ix, b);
            }
            if d > 0 {
                for t in calls(s).0 {
                    walk(built, calls, t, d - 1, seen, found);
                }
            }
        }
        walk(&built, &calls, pc, 2, &mut HashSet::new(), &mut found);
        if found.len() == 1 {
            found.into_values().next()
        } else {
            None
        }
    }

    /// `{ k: 'load', size: 8, addr: fp + o }` with o as a u64 constant
    fn word(&self, ir: &sbpf_ir::Ir, fpv: u32, o: f64) -> E {
        ir.load(8, ir.bin(BinOp::Add, ir.var(fpv), ir.c(o as i64 as u64)))
    }

    /// The CPI ops of an instruction's calls to such helpers (libCpiOps).
    pub fn lib_cpi_ops(
        &self,
        ctx: &IxCtx<'a>,
        fns: &[&FnFacts],
        keep: &dyn Fn(i64, Option<i64>) -> bool,
        main_fn: &dyn Fn(i64) -> bool,
    ) -> Vec<OpOut> {
        let mut out: Vec<OpOut> = Vec::new();
        self.ev_init(ctx);
        let legacy = self.legacy;
        for ff in fns {
            for c in &ff.calls {
                let h = if c.err_path || c.pc.is_none() || !keep(ff.pc, c.pc) {
                    None
                } else {
                    self.lib_cpi(c.callee)
                };
                let Some(h) = h else { continue };
                let st = self.stmt_at(ff.pc, c.pc.unwrap());
                let fo = self.fo(ff.pc);
                let d = self.defs_in(ff.pc);
                let ev = self.ev_for(ctx, ff.pc);
                let (Some((sb, si)), Some(fo), Some(d)) = (st, fo, d) else {
                    continue;
                };
                let ir = fir(fo.f);
                let Some((_, args)) = call_of(ir, &fo.f.blocks[sb].stmts[si]) else {
                    continue;
                };
                let sp = pos_of(sb, si);
                let fpv = param_var(fo.f, 10);
                let y = if args.len > 1 {
                    d.fp_off(ir.at(args, 1))
                } else {
                    None
                };
                let key_of = |e: E| -> Option<String> {
                    let v = ev.as_ref()?.ev(e, sp, 0)?.ha()?;
                    if (v.k == HK::Keyp || v.k == HK::Info) && !v.guess.unwrap_or(false) {
                        Some(v.acct)
                    } else {
                        None
                    }
                };
                let roles: &[&str] = if h.ix == "InitializeAccount3" {
                    &["account", "mint", "authority"]
                } else {
                    &["mint"]
                };
                let slots: Vec<Option<String>> = (0..=roles.len())
                    .map(|i| match (y, fpv) {
                        (Some(y), Some(fpv)) => key_of(self.word(
                            ir,
                            fpv,
                            y + 0x18 as f64
                                + 0x30 as f64 * i as f64
                                + if legacy { 8.0 } else { 0.0 },
                        )),
                        _ => None,
                    })
                    .collect();
                let acc = pick_slots(&slots);
                let accounts: Vec<PartAcc> = roles
                    .iter()
                    .enumerate()
                    .map(|(i, role)| PartAcc {
                        role: Some(role.to_string()),
                        text: acc.get(i).cloned().flatten().unwrap_or_else(|| "?".into()),
                        w: None,
                        s: None,
                        ord: Default::default(),
                    })
                    .collect();
                let mut fields: Vec<(String, String)> = Vec::new();
                if h.ix == "InitializeMint2" && args.len > 3 {
                    let a3 = ir.at(args, 3);
                    let z = d.fp_off(a3);
                    let yy = z.and_then(|z| d.reaching(&self.fl, slot(z), sp, true));
                    let a = key_of(a3).or_else(|| match yy {
                        Some((e, _)) => match ir.get(e) {
                            Node::Load { addr, .. } => key_of(addr),
                            _ => None,
                        },
                        None => None,
                    });
                    if let Some(a) = a {
                        fields.push(("mint_authority".into(), format!("{a}.key")));
                    }
                }
                let text = format!(
                    "CPI {}.{} {{ {} }}{} [heur: library helper {} (Anchor CpiContext; the builder's tag and program id)]",
                    h.program,
                    h.ix,
                    accounts
                        .iter()
                        .map(|x| format!("{}: {}", x.role.as_deref().unwrap_or(""), x.text))
                        .collect::<Vec<_>>()
                        .join(", "),
                    if fields.is_empty() {
                        String::new()
                    } else {
                        format!(
                            " ({})",
                            fields
                                .iter()
                                .map(|x| format!("{}: {}", x.0, x.1))
                                .collect::<Vec<_>>()
                                .join(", ")
                        )
                    },
                    self.pname(c.callee)
                );
                let cpi = OpCpi {
                    program: h.program.to_string(),
                    known: Some(h.program.to_string()),
                    checked: None,
                    accounts,
                    fields,
                    seeds: None,
                    src: None,
                    family: Some(h.family.to_string()),
                    ix: Some(h.ix.to_string()),
                };
                out.push(OpOut {
                    at: Loc {
                        fn_: ff.name.clone(),
                        line: c.line,
                        pc: c.pc,
                    },
                    kinds: cpi_kinds(h.family, h.ix),
                    text,
                    main: main_fn(ff.pc) && c.main,
                    target: None,
                    how: None,
                    value: None,
                    cpi: Some(Rc::new(RefCell::new(cpi))),
                    pda: None,
                    fn_pc: Some(ff.pc),
                    ret: None,
                    anchor_close: false,
                    guards: None,
                    bypass: None,
                    sources: None,
                });
            }
        }
        out
    }

    /// The accounts of the Anchor CpiContext a library CPI helper is given at the call at `pc` in `fn_pc` (and its
    /// signer seeds: None when absent / not decoded)
    pub fn ctx_accounts(
        &self,
        ctx: &IxCtx<'a>,
        fn_pc: i64,
        pc: i64,
        roles: &[&str],
    ) -> Option<(Vec<Option<String>>, Option<String>)> {
        let (sb, si) = self.stmt_at(fn_pc, pc)?;
        let fo = self.fo(fn_pc)?;
        let d = self.defs_in(fn_pc)?;
        if roles.is_empty() {
            return None;
        }
        let ir = fir(fo.f);
        let s = &fo.f.blocks[sb].stmts[si];
        let sp = pos_of(sb, si);
        let mut calls: Vec<Vec<E>> = Vec::new();
        fn walk(ir: &sbpf_ir::Ir, e: E, calls: &mut Vec<Vec<E>>) {
            match ir.get(e) {
                Node::Call(t, args) => {
                    let _ = t;
                    calls.push(ir.to_vec(args));
                    for a in ir.items(args) {
                        walk(ir, a, calls);
                    }
                }
                Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                    walk(ir, a, calls);
                    walk(ir, b, calls);
                }
                Node::Neg(a)
                | Node::Not(a)
                | Node::Lnot(a)
                | Node::Ext { a, .. }
                | Node::Bswap { a, .. } => walk(ir, a, calls),
                Node::Load { addr, .. } => walk(ir, addr, calls),
                Node::Sel(c, a, b) => {
                    walk(ir, c, calls);
                    walk(ir, a, calls);
                    walk(ir, b, calls);
                }
                _ => {}
            }
        }
        if let Some((_, args)) = call_of(ir, s) {
            calls.push(ir.to_vec(args));
        }
        match s {
            Stmt::Set { e, .. } | Stmt::Eval { e, .. } => walk(ir, *e, &mut calls),
            Stmt::Call { args, .. } => {
                for a in ir.items(*args) {
                    walk(ir, a, &mut calls);
                }
            }
            _ => {}
        }
        let fpv = param_var(fo.f, 10);
        let ev = self.ev_for(ctx, fn_pc);
        let (Some(fpv), Some(ev)) = (fpv, ev) else {
            return None;
        };
        let key_of = |e: E| -> Option<String> {
            let v = ev.ev(e, sp, 0)?.ha()?;
            if (v.k == HK::Keyp || v.k == HK::Info) && !v.guess.unwrap_or(false) {
                Some(v.acct)
            } else {
                None
            }
        };
        let legacy = self.legacy;
        for args in &calls {
            let Some(y) = args.get(1).and_then(|&a| d.fp_off(a)) else {
                continue;
            };
            let slots: Vec<Option<String>> = (0..=roles.len())
                .map(|i| {
                    key_of(self.word(
                        ir,
                        fpv,
                        y + 0x18 as f64 + 0x30 as f64 * i as f64 + if legacy { 8.0 } else { 0.0 },
                    ))
                })
                .collect();
            if slots.iter().all(|x| x.is_none()) {
                continue;
            }
            let acc = pick_slots(&slots);
            let s0 = y + 0x18 as f64 + 0x30 as f64 * slots.len() as f64;
            let origin = |o: f64| -> Option<E> {
                let yy = d.reaching(&self.fl, slot(o), sp, true);
                let mut e = yy.map(|x| x.0);
                let mut k = 0;
                while k < 6 {
                    match e.map(|e| ir.get(e)) {
                        Some(Node::Var(id)) if d.defs.contains_key(&id) => e = Some(d.defs[&id]),
                        _ => break,
                    }
                    k += 1;
                }
                e
            };
            let pnum = |f: &sbpf_program::Func, ir: &sbpf_ir::Ir, e: Option<E>| -> Option<i32> {
                let Node::Var(id) = ir.get(e?) else {
                    return None;
                };
                let v = f.vars.get(id as usize)?;
                if v.param > 0 && v.param != 10 {
                    Some(if v.param >= 100 {
                        v.param - 100 + 5
                    } else {
                        v.param
                    })
                } else {
                    None
                }
            };
            fn arg_const(an: &An, ctx: &IxCtx, fn_: i64, pnum: i32, d: u32) -> Option<u64> {
                let par = ctx.parents.get(&fn_).copied()?;
                let ppc = par.pc?;
                let (b, i) = an.stmt_at(par.fn_, ppc)?;
                let pfo = an.fo(par.fn_)?;
                let pir = fir(pfo.f);
                let (_, args) = call_of(pir, &pfo.f.blocks[b].stmts[i])?;
                if pnum < 1 || (pnum - 1) as u32 >= args.len {
                    return None;
                }
                let mut a = pir.at(args, (pnum - 1) as u32);
                let pd = an.defs_in(par.fn_);
                let mut k = 0;
                while k < 6 {
                    match (pir.get(a), &pd) {
                        (Node::Var(id), Some(pd)) if pd.defs.contains_key(&id) => a = pd.defs[&id],
                        _ => break,
                    }
                    k += 1;
                }
                match pir.get(a) {
                    Node::Const(v) => Some(v),
                    Node::Var(id) => {
                        let v = pfo.f.vars.get(id as usize)?;
                        if v.param > 0 && v.param != 10 && d < 3 {
                            let n = if v.param >= 100 {
                                v.param - 100 + 5
                            } else {
                                v.param
                            };
                            arg_const(an, ctx, par.fn_, n, d + 1)
                        } else {
                            None
                        }
                    }
                    _ => None,
                }
            }
            let len = origin(s0 + 8.0);
            let lp = pnum(fo.f, ir, len);
            let ptr_p = pnum(fo.f, ir, origin(s0));
            let lc = match len.map(|e| ir.get(e)) {
                Some(Node::Const(v)) => Some(v),
                _ => lp.and_then(|lp| arg_const(self, ctx, fn_pc, lp, 0)),
            };
            let seeds = match lc {
                Some(0) => None,
                Some(v) if v <= 16 => Some(format!("? ({v} seeds)")),
                Some(_) => None,
                None => match (lp, ptr_p) {
                    (Some(lp), Some(pp)) => Some(format!("p{pp}[..p{lp}]")),
                    _ => None,
                },
            };
            return Some((acc, seeds));
        }
        None
    }
}

/// the AccountInfo copies' accounts: a program account found drops its slot, else the program is first unless only
/// the first slot is known
fn pick_slots(slots: &[Option<String>]) -> Vec<Option<String>> {
    let pi = slots
        .iter()
        .position(|x| x.as_ref().is_some_and(|x| x.contains("program")));
    match pi {
        Some(pi) => slots
            .iter()
            .enumerate()
            .filter(|(i, _)| *i != pi)
            .map(|x| x.1.clone())
            .collect(),
        None => {
            if slots[0].is_some() && slots[slots.len() - 1].is_none() {
                slots[..slots.len() - 1].to_vec()
            } else {
                slots[1..].to_vec()
            }
        }
    }
}
