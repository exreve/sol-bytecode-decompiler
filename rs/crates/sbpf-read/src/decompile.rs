//! The readable decompiler output (`decompile(bytes, { full: true, idl })`): decompile.ts from phase 3
//! on (constants, Result layouts, out parameters, Anchor / selector naming, taint, CPI wrappers,
//! accounts, Anchor Accounts / Context views, CPI naming, view types, inferred structs, field names,
//! stripUndef, outlining), then per-function printing (printfn.rs) and the single file (layout.rs).

use crate::accounts::{find_accounts, legacy_account_info, Kind, Typed};
use crate::anchor::{accounts_layout, anchor_fn, find_name_fn, AnchorFn};
use crate::anchorstate::{account_objects, copy_leaves, AccountObjs, StateCtx};
use crate::cpi::{cpi_desc, find_cpi_sites, format_ix, CpiEnv, SiteKind};
use crate::cpiexec::{describe_model, ExecBudget, ExecSiteKind};
use crate::fieldnames::{name_fields, role_names, FieldNameCfg};
use crate::idl::IdlInfo;
use crate::sem::{known_key, SemR, NICHE, OK_TAGS};
use crate::state::{account_data_vars, account_views};
use crate::structs::{infer_structs, StructCfg};
use crate::taint::{instruction_taint, FnTaint};
use crate::util::*;
use crate::views::{expr_type, fid, legacy_info_view, unaligned_views, Field, View, Views, FT};
use indexmap::{IndexMap, IndexSet};
use sbpf_exec::{call_target_name, ProgCtx};
use sbpf_ir::{BinOp, CallTarget, CmpOp, Ir, Node, Stmt, Term, E};
use sbpf_print::names::{name_functions, semantics};
use sbpf_print::print::ProgNames;
use sbpf_print::raw::{prog_names, structure_all, Prepared};
use sbpf_program::{fn_addr, load_program, Func, Program};
use sbpf_struct::{SNode, Tree};
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

/// What the register-level blocks tell (read before variable recovery replaces them).
pub struct RegFacts {
    /// invokeThunks: function pc -> 'c' / 'rust' / 'pda_find' / 'pda_create'
    pub invoke_thunks: IndexMap<i64, SiteKind>,
    /// per function (pc order): nparams, number of blocks, syscall names of its call statements
    pub pda_info: Vec<(i64, u32, usize, Vec<String>)>,
    pub unaligned: bool,
}

pub fn invoke_abi(sys: &str) -> Option<SiteKind> {
    match sys {
        "sol_invoke_signed_c" => Some(SiteKind::C),
        "sol_invoke_signed_rust" => Some(SiteKind::Rust),
        "sol_try_find_program_address" => Some(SiteKind::PdaFind),
        "sol_create_program_address" => Some(SiteKind::PdaCreate),
        _ => None,
    }
}

/// pdaAbi: Pubkey::find/create_program_address by name
pub fn pda_abi(name: &str) -> Option<SiteKind> {
    let m = |p: &str| {
        name.strip_prefix(p).is_some_and(|r| {
            r.is_empty()
                || r.strip_prefix('_').is_some_and(|h| {
                    !h.is_empty() && h.bytes().all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
                })
        })
    };
    if m("Pubkey_find_program_address") {
        Some(SiteKind::PdaFindOut)
    } else if m("Pubkey_create_program_address") {
        Some(SiteKind::PdaCreateOut)
    } else {
        None
    }
}

fn reg_facts(p: &Program) -> RegFacts {
    let mut invoke_thunks = IndexMap::new();
    let mut pda_info = Vec::new();
    for f in p.funcs.values() {
        let calls: Vec<&Stmt> = f
            .blocks
            .iter()
            .flat_map(|b| b.stmts.iter())
            .filter(|s| matches!(s, Stmt::Call { .. }))
            .collect();
        if f.blocks.len() <= 2 {
            let n: i64 = f.blocks.iter().map(|b| b.end - b.start + 1).sum();
            if calls.len() == 1 {
                if let Stmt::Call {
                    t: CallTarget::Sys { name, .. },
                    ..
                } = calls[0]
                {
                    if let Some(abi) = invoke_abi(name) {
                        if n <= 8 {
                            invoke_thunks.insert(f.pc, abi);
                        }
                    }
                }
            }
        }
        let sys: Vec<String> = calls
            .iter()
            .filter_map(|s| match s {
                Stmt::Call {
                    t: CallTarget::Sys { name, .. },
                    ..
                } => Some(name.to_string()),
                _ => None,
            })
            .collect();
        pda_info.push((f.pc, f.nparams, f.blocks.len(), sys));
    }
    RegFacts {
        invoke_thunks,
        pda_info,
        unaligned: crate::accounts::unaligned_input(p),
    }
}

/// The raw pipeline's stages 1–4 with the register-level facts read before variable recovery.
pub fn prepare_read(bytes: &[u8], threads: usize) -> Result<(Prepared, RegFacts, Vec<Tree>), String> {
    let mut p = load_program(bytes, true)?;
    sbpf_dataflow::infer_signatures(&mut p);
    let sem = semantics(&p);
    let sym_notes = name_functions(&mut p, &sem);
    let names = prog_names(&p);
    let facts = reg_facts(&p);
    sbpf_dataflow::recover_all(&mut p)?;
    {
        let img = sbpf_elf::Image::new(&p.elf);
        sbpf_opt::par_each(p.funcs.values_mut().collect(), threads, |f| {
            sbpf_opt::phase2(f, Some(&img), false, |_, _| {});
        });
    }
    let built: Vec<usize> = (0..p.funcs.len()).collect();
    sbpf_dataflow::stackargs::rewrite_stack_args(&mut p.funcs, &built);
    sbpf_opt::par_each(p.funcs.values_mut().collect(), threads, |f| sbpf_opt::finish(f, false));
    let mut pr = Prepared {
        p,
        sem,
        sym_notes,
        names,
    };
    let trees = structure_all(&mut pr, threads);
    Ok((pr, facts, trees))
}

/// A readable function.
pub struct ReadFunc {
    pub pc: i64,
    pub name: String,
    pub text: String,
    pub calls: Vec<i64>,
    pub is_entry: bool,
    /// the variables' view types as printed (insertion order)
    pub var_types: Vec<(u32, String)>,
}

pub struct IxRow {
    pub name: String,
    pub pc: i64,
    pub disc: u64,
    pub args: Option<Vec<String>>,
    pub accounts: Option<Vec<String>>,
    pub str_accounts: Option<Vec<String>>,
}

pub struct ReadOut {
    pub version: u32,
    pub n_insns: usize,
    pub n_funcs: usize,
    pub funcs: Vec<ReadFunc>,
    pub outlined: Vec<(String, String)>,
    pub views: Views,
    pub instructions: Vec<IxRow>,
    pub processors: Vec<(String, Vec<String>)>,
    pub anchor: bool,
}

pub const GENERIC_RESULT: &str = "the result of the one (library / out-parameter) call they are passed to";

/// A role of a stack object (FrameClaim).
#[derive(Clone, Debug)]
pub struct FrameClaim {
    pub name: String,
    pub ty: Option<String>,
    pub why: String,
    pub out: bool,
    pub extent: Option<N>,
}

/// The state of phase 3 and 4 shared by the per-function printing.
pub struct Dx<'p> {
    pub p: &'p Program,
    pub fs: Vec<&'p Func>,
    pub idx: HashMap<i64, usize>,
    pub trees: &'p [Tree],
    pub pn: ProgNames,
    pub sem: SemR,
    pub idl: Option<&'p IdlInfo>,
    pub ctx: &'p ProgCtx<'p>,
    pub views: Views,
    pub sym_notes: IndexMap<i64, String>,
    pub heur_names: IndexMap<i64, String>,
    pub fn_notes: IndexMap<i64, Vec<String>>,
    pub error_from: IndexSet<i64>,
    pub abi_names: IndexMap<i64, IndexMap<u32, String>>,
    pub taint: IndexMap<i64, FnTaint>,
    pub invoke_thunks: IndexMap<i64, SiteKind>,
    pub pda_wrappers: IndexMap<i64, SiteKind>,
    pub invoke_wrappers: IndexSet<i64>,
    pub user_invoke: IndexSet<i64>,
    pub legacy: bool,
    pub unaligned: bool,
    pub account_infos: Vec<Typed>,
    pub data_vars: IndexMap<i64, IndexMap<u32, String>>,
    pub anchor_info: IndexMap<i64, AnchorFn>,
    pub str_accounts: IndexMap<i64, Vec<String>>,
    pub try_of: IndexMap<i64, i64>,
    pub acct_layouts: IndexMap<i64, Vec<Field>>,
    pub acct_shift: IndexMap<i64, N>,
    pub param_types: IndexMap<i64, IndexMap<u32, (String, String)>>,
    pub obj_vars: IndexMap<i64, AccountObjs>,
    pub base_types: IndexMap<i64, IndexMap<u32, String>>,
    pub lib_out: IndexMap<i64, String>,
    pub out_params: IndexSet<i64>,
    pub out_tags: IndexMap<i64, u32>,
    pub result_out: IndexSet<i64>,
    pub exec_budget: RefCell<ExecBudget>,
    pub wrap_budget: RefCell<ExecBudget>,
    pub def_counts: Vec<Vec<u32>>,
    pub state_ctx: StateCtx<'p>,
    pub acct_field_view: IndexMap<(String, K), (String, bool)>,
    pub state_idl_address: Option<String>,
    global_idents: RefCell<Option<HashSet<String>>>,
    var_acc: RefCell<HashMap<usize, HashMap<u32, Vec<(N, u8)>>>>,
    spill: RefCell<HashMap<usize, HashMap<K, E>>>,
    frame_offs: RefCell<HashMap<usize, (IndexSet<K>, IndexSet<K>)>>,
}

pub const RESERVED_TS: &[&str] = &[
    "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do",
    "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "import", "in",
    "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try",
    "typeof", "var", "void", "while", "with", "as", "implements", "interface", "let", "package",
    "private", "protected", "public", "static", "yield", "any", "boolean", "constructor", "declare",
    "get", "module", "require", "number", "set", "string", "symbol", "type", "from", "of", "async",
    "await", "input", "fp", "undef", "state",
];

impl<'p> Dx<'p> {
    pub fn f(&self, pc: i64) -> Option<&'p Func> {
        self.idx.get(&pc).map(|&i| self.fs[i])
    }
    pub fn tree(&self, pc: i64) -> &'p Tree {
        &self.trees[self.idx[&pc]]
    }
    pub fn fn_name(&self, pc: i64) -> String {
        self.pn.fn_name(pc)
    }
    pub fn name_taken(&self, nm: &str) -> bool {
        self.pn.by_pc.values().any(|x| x == nm)
    }
    pub fn rename(&mut self, pc: i64, nm: &str) {
        self.pn.by_pc.insert(pc, nm.to_string());
        self.pn.by_addr.insert(fn_addr(self.p, pc), nm.to_string());
    }
    pub fn def_count(&self, pc: i64, v: u32) -> u32 {
        self.def_counts[self.idx[&pc]].get(v as usize).copied().unwrap_or(0)
    }
    pub fn global_idents(&self) -> std::cell::Ref<'_, Option<HashSet<String>>> {
        if self.global_idents.borrow().is_none() {
            let mut ids: HashSet<String> = sbpf_print::names::HELPERS.iter().map(|s| s.to_string()).collect();
            for n in [
                "u8", "u16", "u32", "u64", "i8", "i16", "i32", "i64", "at", "ref", "sized", "Pubkey", "bytes",
                "AccountInfo", "AccountRecord", "UnalignedAccount", "Input",
            ] {
                ids.insert(n.into());
            }
            for f in self.p.funcs.values() {
                ids.insert(self.fn_name(f.pc));
            }
            for sc in self.p.syscalls.values() {
                ids.insert(sc.alias.clone());
            }
            for n in [
                "ld8", "ld16", "ld32", "ld64", "st8", "st16", "st32", "st64", "bswap16", "bswap32", "bswap64",
            ] {
                ids.insert(n.into());
            }
            *self.global_idents.borrow_mut() = Some(ids);
        }
        self.global_idents.borrow()
    }
    pub fn is_global(&self, nm: &str) -> bool {
        self.global_idents().as_ref().unwrap().contains(nm)
    }
    /// sem.strAt(ptr, len, isPtr)
    pub fn str_at(&self, ptr: u64, len: u64, is_ptr: bool) -> Option<String> {
        self.sem.str_at(ptr, len, is_ptr)
    }
    pub fn read_ro(&self, a: u128, n: usize) -> Option<u64> {
        self.sem.read_ro(a, n)
    }
    /// varAccesses: loads and stores through `v + c`, per variable: [c, size]
    pub fn var_accesses(&self, fi: usize) -> std::cell::Ref<'_, HashMap<usize, HashMap<u32, Vec<(N, u8)>>>> {
        if !self.var_acc.borrow().contains_key(&fi) {
            let f = self.fs[fi];
            let ir = f.ir.as_ref().unwrap();
            let mut r: HashMap<u32, Vec<(N, u8)>> = HashMap::new();
            let mut acc = |addr: E, size: u8, extra: N, r: &mut HashMap<u32, Vec<(N, u8)>>| {
                let (b, o) = match ir.get(addr) {
                    Node::Var(v) => (Some(v), 0.0),
                    Node::Bin(BinOp::Add, a, c) => match (ir.get(a), ir.get(c)) {
                        (Node::Var(v), Node::Const(c)) => (Some(v), n_s(c)),
                        _ => (None, 0.0),
                    },
                    _ => (None, 0.0),
                };
                if let Some(b) = b {
                    r.entry(b).or_default().push((o + extra, size));
                }
            };
            for b in &f.blocks {
                for st in &b.stmts {
                    match st {
                        Stmt::Store { addr, size, .. } => acc(*addr, *size, 0.0, &mut r),
                        Stmt::Stores { addr, size, vals, .. } => {
                            for i in 0..vals.len {
                                acc(*addr, *size, (i * *size as u32) as N, &mut r);
                            }
                        }
                        _ => {}
                    }
                    for e in stmt_exprs(ir, st) {
                        let mut loads = Vec::new();
                        ir.walk(e, &mut |_, x| {
                            if let Node::Load { size, addr } = x {
                                loads.push((addr, size));
                            }
                        });
                        for (a, s) in loads {
                            acc(a, s, 0.0, &mut r);
                        }
                    }
                }
            }
            self.var_acc.borrow_mut().insert(fi, r);
        }
        self.var_acc.borrow()
    }
    /// spillSlots: frame slots stored exactly once (8-byte store, no other write overlapping)
    pub fn spill_slot(&self, fi: usize, o: N) -> Option<E> {
        if !self.spill.borrow().contains_key(&fi) {
            let f = self.fs[fi];
            let ir = f.ir.as_ref().unwrap();
            let fpv = fp_var(f);
            let fo = |e: E| fo_any(ir, e, fpv);
            let mut vals: IndexMap<K, Option<E>> = IndexMap::new();
            let mut spans: Vec<(N, N)> = Vec::new();
            for b in &f.blocks {
                for s in &b.stmts {
                    match s {
                        Stmt::Store { addr, size, v, .. } => {
                            let Some(o) = fo(*addr) else { continue };
                            spans.push((o, *size as N));
                            if *size == 8 {
                                let k = K::of(o);
                                let nv = if vals.contains_key(&k) { None } else { Some(*v) };
                                vals.insert(k, nv);
                            }
                        }
                        Stmt::Stores { addr, size, vals: vs, .. } => {
                            let Some(o) = fo(*addr) else { continue };
                            spans.push((o, (*size as u32 * vs.len) as N));
                            if *size == 8 {
                                for (i, v) in ir.items(*vs).enumerate() {
                                    let k = K::of(o + 8.0 * i as N);
                                    let nv = if vals.contains_key(&k) { None } else { Some(v) };
                                    vals.insert(k, nv);
                                }
                            }
                        }
                        Stmt::Copy { dst, n, .. } => {
                            if let Some(o) = fo(*dst) {
                                spans.push((o, *n as N));
                            }
                        }
                        _ => {}
                    }
                }
            }
            let mut r = HashMap::new();
            for (k, v) in vals {
                let o = k.get();
                if let Some(v) = v {
                    if spans.iter().filter(|(a, n)| *a < o + 8.0 && o < a + n).count() == 1 {
                        r.insert(k, v);
                    }
                }
            }
            self.spill.borrow_mut().insert(fi, r);
        }
        self.spill.borrow()[&fi].get(&K::of(o)).copied()
    }
    /// frameOffsets: (bases, all)
    pub fn frame_offsets(&self, fi: usize, fp: u32) -> IndexSet<K> {
        if !self.frame_offs.borrow().contains_key(&fi) {
            let f = self.fs[fi];
            let ir = f.ir.as_ref().unwrap();
            let mut bases = IndexSet::new();
            let mut all = IndexSet::new();
            fn visit(ir: &Ir, fp: u32, e: E, addr: bool, bases: &mut IndexSet<K>, all: &mut IndexSet<K>) {
                if let Some(o) = fo_add(ir, e, Some(fp)) {
                    all.insert(K::of(o));
                    if !addr {
                        bases.insert(K::of(o));
                    }
                    return;
                }
                match ir.get(e) {
                    Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                        visit(ir, fp, a, false, bases, all);
                        visit(ir, fp, b, false, bases, all);
                    }
                    Node::Neg(a) | Node::Not(a) | Node::Ext { a, .. } | Node::Bswap { a, .. } | Node::Lnot(a) => {
                        visit(ir, fp, a, false, bases, all)
                    }
                    Node::Load { addr, .. } => visit(ir, fp, addr, true, bases, all),
                    Node::Sel(c, a, b) => {
                        visit(ir, fp, c, false, bases, all);
                        visit(ir, fp, a, false, bases, all);
                        visit(ir, fp, b, false, bases, all);
                    }
                    Node::Call(t, args) => {
                        for a in ir.items(args) {
                            visit(ir, fp, a, false, bases, all);
                        }
                        if let CallTarget::Ind { e } = ir.target(t) {
                            visit(ir, fp, e, false, bases, all);
                        }
                    }
                    Node::Fn(_, args) => {
                        for a in ir.items(args) {
                            visit(ir, fp, a, false, bases, all);
                        }
                    }
                    _ => {}
                }
            }
            for b in &f.blocks {
                for s in &b.stmts {
                    match s {
                        Stmt::Store { addr, v, .. } => {
                            visit(ir, fp, *addr, true, &mut bases, &mut all);
                            visit(ir, fp, *v, false, &mut bases, &mut all);
                        }
                        Stmt::Stores { addr, vals, .. } => {
                            if let Some(o) = fo_add(ir, *addr, Some(fp)) {
                                bases.insert(K::of(o));
                                all.insert(K::of(o));
                            } else {
                                visit(ir, fp, *addr, true, &mut bases, &mut all);
                            }
                            for v in ir.items(*vals) {
                                visit(ir, fp, v, false, &mut bases, &mut all);
                            }
                        }
                        Stmt::Copy { dst, src, .. } => {
                            for x in [*dst, *src] {
                                if let Some(o) = fo_add(ir, x, Some(fp)) {
                                    bases.insert(K::of(o));
                                    all.insert(K::of(o));
                                } else {
                                    visit(ir, fp, x, false, &mut bases, &mut all);
                                }
                            }
                        }
                        _ => {
                            for e in stmt_exprs(ir, s) {
                                visit(ir, fp, e, false, &mut bases, &mut all);
                            }
                        }
                    }
                }
                match &b.term {
                    Term::Br { c, .. } => visit(ir, fp, *c, false, &mut bases, &mut all),
                    Term::Ret { e: Some(e) } => visit(ir, fp, *e, false, &mut bases, &mut all),
                    _ => {}
                }
            }
            self.frame_offs.borrow_mut().insert(fi, (bases, all));
        }
        self.frame_offs.borrow()[&fi].0.clone()
    }
    /// fitsView: all loads and stores through `v + c` hit fields of view `ty` exactly (and min fields).
    pub fn fits_view(&self, pc: i64, v: u32, ty: &str, min: usize) -> bool {
        let fi = self.idx[&pc];
        let acc = self.var_accesses(fi);
        let mut hit: HashSet<String> = HashSet::new();
        for &(o, size) in acc[&fi].get(&v).map_or(&[][..], |x| x.as_slice()) {
            let r = if o < 0.0 { None } else { self.views.resolve(ty, o) };
            let Some(r) = r else { return false };
            let bad = match &r.last {
                FT::Scalar(s) => r.rest != 0.0 || *s != size,
                FT::Ref(_) => r.rest != 0.0 || size != 8,
                FT::Embed(_) => r.rest + size as N > self.views.width(&r.last),
            };
            if bad {
                return false;
            }
            hit.insert(r.path.join("."));
        }
        hit.len() >= min
    }
    pub fn param_view(&self, cpc: i64, reg: i32) -> Option<String> {
        if reg == 1 {
            if let Some(v) = self.lib_out.get(&cpc) {
                return Some(v.clone());
            }
        }
        let cb = self.f(cpc)?;
        let pv = cb.vars.iter().find(|v| v.param == reg)?;
        if self.def_count(cpc, pv.id) != 0 {
            return None;
        }
        let t = self.base_types.get(&cpc)?.get(&pv.id)?;
        if ["AccountRecord", "UnalignedAccount", "Input"].contains(&t.as_str()) {
            None
        } else {
            Some(t.clone())
        }
    }
    pub fn etype(&self, ir: &Ir, e: E, ty: &dyn Fn(u32) -> Option<String>) -> Option<String> {
        expr_type(&self.views, ir, e, ty)
    }
    /// setType: a typed expression, or a load of a frame slot stored exactly once with a typed value
    pub fn set_type(&self, fi: usize, e: E, ty: &dyn Fn(u32) -> Option<String>) -> Option<String> {
        let f = self.fs[fi];
        let ir = f.ir.as_ref().unwrap();
        let t = self.etype(ir, e, ty);
        if t.is_some() {
            return t;
        }
        let Node::Load { size: 8, addr } = ir.get(e) else { return None };
        let o = fo_add(ir, addr, fp_var(f))?;
        let v = self.spill_slot(fi, o)?;
        self.etype(ir, v, ty)
    }
}

fn is_hex_fn(n: &str) -> bool {
    is_fn_hex(n)
}

/// The instruction name as a view prefix (`ix.split('_').map(w => w[0].toUpperCase() + w.slice(1))`).
pub fn pascal_ix(ix: &str) -> String {
    let mut o = String::new();
    for w in ix.split('_') {
        if w.is_empty() {
            js_throw("Cannot read properties of undefined (reading 'toUpperCase')");
        }
        o.push_str(&upper_first(w));
    }
    o
}

/// decompile(bytes, { full: true, idl }): the readable output.
pub fn decompile_read(bytes: &[u8], idl: Option<&IdlInfo>, threads: usize) -> Result<ReadOut, String> {
    let (pr, facts, trees) = prepare_read(bytes, threads)?;
    let p = &pr.p;
    let ctx = ProgCtx::new(p);
    let fs: Vec<&Func> = p.funcs.values().collect();
    let idx: HashMap<i64, usize> = fs.iter().enumerate().map(|(i, f)| (f.pc, i)).collect();
    let def_counts: Vec<Vec<u32>> = fs.iter().map(|f| def_counts(f)).collect();
    let mut d = Dx {
        p,
        fs,
        idx,
        trees: &trees,
        pn: pr.names.clone(),
        sem: SemR::new(p, &pr.sem, idl),
        idl,
        ctx: &ctx,
        views: Views::new(),
        sym_notes: pr.sym_notes.clone(),
        heur_names: IndexMap::new(),
        fn_notes: IndexMap::new(),
        error_from: IndexSet::new(),
        abi_names: IndexMap::new(),
        taint: IndexMap::new(),
        invoke_thunks: facts.invoke_thunks.clone(),
        pda_wrappers: IndexMap::new(),
        invoke_wrappers: IndexSet::new(),
        user_invoke: IndexSet::new(),
        legacy: false,
        unaligned: facts.unaligned,
        account_infos: Vec::new(),
        data_vars: IndexMap::new(),
        anchor_info: IndexMap::new(),
        str_accounts: IndexMap::new(),
        try_of: IndexMap::new(),
        acct_layouts: IndexMap::new(),
        acct_shift: IndexMap::new(),
        param_types: IndexMap::new(),
        obj_vars: IndexMap::new(),
        base_types: IndexMap::new(),
        lib_out: IndexMap::new(),
        out_params: IndexSet::new(),
        out_tags: IndexMap::new(),
        result_out: IndexSet::new(),
        exec_budget: RefCell::new(ExecBudget { steps: 250_000 }),
        wrap_budget: RefCell::new(ExecBudget { steps: 150_000 }),
        def_counts,
        state_ctx: StateCtx::new(&ctx),
        acct_field_view: IndexMap::new(),
        state_idl_address: None,
        global_idents: RefCell::new(None),
        var_acc: RefCell::new(HashMap::new()),
        spill: RefCell::new(HashMap::new()),
        frame_offs: RefCell::new(HashMap::new()),
    };
    phase3(&mut d);
    let name_fn = anchor_names(&mut d);
    selector_dispatch(&mut d);
    anchor_dispatch(&mut d);
    // instruction-data taint from the handlers' ix_args
    {
        let mut seeds: IndexMap<i64, Vec<u32>> = IndexMap::new();
        for (pc, m) in &d.abi_names {
            for (v, nm) in m {
                if nm == "ix_args" {
                    seeds.entry(*pc).or_default().push(*v);
                }
            }
        }
        if !seeds.is_empty() {
            let funcs: IndexMap<i64, &Func> = d.fs.iter().map(|f| (f.pc, *f)).collect();
            d.taint = instruction_taint(&funcs, &seeds);
        }
    }
    wrappers(&mut d, &facts);
    d.legacy = {
        let m: HashMap<i64, &Func> = d.fs.iter().map(|f| (f.pc, *f)).collect();
        legacy_account_info(&m, p.elf.entry_pc)
    };
    user_invoke(&mut d);
    d.account_infos = find_accounts(&d.fs, d.unaligned, d.legacy);
    if d.unaligned {
        for v in unaligned_views() {
            d.views.add(v);
        }
    }
    if d.legacy {
        d.views.add(legacy_info_view());
    }
    if let Some(idl) = idl {
        let discs = account_views(idl, &mut d.views);
        d.data_vars = account_data_vars(&d.fs, &discs, &mut d.views);
    }
    crate::types::anchor_accounts(&mut d, name_fn);
    crate::printfn::run(d, name_fn)
}

// ---------------- phase 3: constants, Result layouts, out parameters ----------------

fn phase3(d: &mut Dx) {
    let mut consts: IndexSet<u64> = IndexSet::new();
    let mut niche: IndexMap<u64, u32> = IndexMap::new();
    let mut tags: IndexMap<u64, u32> = IndexMap::new();
    let mut tag_stores: IndexMap<u64, u32> = IndexMap::new();
    for f in &d.fs {
        let ir = f.ir.as_ref().unwrap();
        let mut note = |e: E| {
            ir.walk(e, &mut |_, x| match x {
                Node::Const(v) => {
                    consts.insert(v);
                }
                Node::Cmp(op, a, b) if op == CmpOp::Eq || op == CmpOp::Ne => {
                    if let Node::Const(bv) = ir.get(b) {
                        if bv > NICHE && bv < NICHE + 0x40 {
                            *niche.entry(bv).or_default() += 1;
                        }
                        if matches!(ir.get(a), Node::Load { size: 4, .. }) && OK_TAGS.contains(&bv) {
                            *tags.entry(bv).or_default() += 1;
                        }
                    }
                }
                _ => {}
            });
        };
        for b in &f.blocks {
            for s in &b.stmts {
                if let Stmt::Store { size: 4, v, .. } = s {
                    if let Node::Const(c) = ir.get(*v) {
                        if OK_TAGS.contains(&c) {
                            *tag_stores.entry(c).or_default() += 1;
                        }
                    }
                }
                for e in stmt_exprs(ir, s) {
                    note(e);
                }
            }
            if let Term::Br { c, .. } = &b.term {
                note(*c);
            }
        }
    }
    d.sem.resolve_candidates(&consts);
    d.sem.note_result_compares(&niche);
    d.sem.note_result_tags(&tags, &tag_stores);
    if let Some(ok) = d.sem.result_ok_tag {
        d.result_out = result_out_params(d, ok);
    }
    d.out_params = pure_out_params(d);
    d.out_tags = out_param_tags(d);
}

fn param1_unassigned(f: &Func) -> Option<u32> {
    let id = param_var(f, 1)?;
    for b in &f.blocks {
        for s in &b.stmts {
            if dst_of(s) == Some(id) {
                return None;
            }
        }
    }
    Some(id)
}

/// direct calls (statements and call expressions): target pc and arguments
fn direct_calls(f: &Func) -> Vec<(i64, Vec<E>)> {
    let ir = f.ir.as_ref().unwrap();
    let mut r = Vec::new();
    let visit = |e: E, r: &mut Vec<(i64, Vec<E>)>| {
        ir.walk(e, &mut |_, x| {
            if let Node::Call(t, args) = x {
                if let CallTarget::Fn { pc } = ir.target(t) {
                    r.push((pc, ir.to_vec(args)));
                }
            }
        })
    };
    for b in &f.blocks {
        for s in &b.stmts {
            if let Stmt::Call {
                t: CallTarget::Fn { pc },
                args,
                ..
            } = s
            {
                r.push((*pc, ir.to_vec(*args)));
            }
            for e in stmt_exprs(ir, s) {
                visit(e, &mut r);
            }
        }
        match &b.term {
            Term::Br { c, .. } => visit(*c, &mut r),
            Term::Ret { e: Some(e) } => visit(*e, &mut r),
            _ => {}
        }
    }
    r
}

fn result_out_params(d: &Dx, ok: u64) -> IndexSet<i64> {
    let mut out: IndexSet<i64> = IndexSet::new();
    for f in &d.fs {
        let ir = f.ir.as_ref().unwrap();
        let a = param1_unassigned(f);
        let mut compared: Vec<E> = Vec::new();
        let note = |e: E, compared: &mut Vec<E>| {
            ir.walk(e, &mut |_, x| {
                if let Node::Cmp(op, l, r) = x {
                    if (op == CmpOp::Eq || op == CmpOp::Ne) && ir.get(r) == Node::Const(ok) {
                        if let Node::Load { size: 4, addr } = ir.get(l) {
                            compared.push(addr);
                        }
                    }
                }
            })
        };
        for b in &f.blocks {
            for s in &b.stmts {
                if let (Some(a), Stmt::Store { size: 4, v, addr, .. }) = (a, s) {
                    if ir.get(*v) == Node::Const(ok) && ir.get(*addr) == Node::Var(a) {
                        out.insert(f.pc);
                    }
                }
                for e in stmt_exprs(ir, s) {
                    note(e, &mut compared);
                }
            }
            if let Term::Br { c, .. } = &b.term {
                note(*c, &mut compared);
            }
        }
        for (t, args) in direct_calls(f) {
            if let Some(&a0) = args.first() {
                if compared.iter().any(|&x| expr_eq(ir, x, a0)) {
                    out.insert(t);
                }
            }
        }
    }
    let mut changed = true;
    while changed {
        changed = false;
        for pc in out.clone() {
            let Some(bt) = d.f(pc) else { continue };
            let Some(a) = param1_unassigned(bt) else { continue };
            let ir = bt.ir.as_ref().unwrap();
            for (t, args) in direct_calls(bt) {
                if args.first().is_some_and(|&x| ir.get(x) == Node::Var(a)) && !out.contains(&t) {
                    out.insert(t);
                    changed = true;
                }
            }
        }
    }
    out
}

fn pure_out_params(d: &Dx) -> IndexSet<i64> {
    let mut out = IndexSet::new();
    for f in &d.fs {
        let ir = f.ir.as_ref().unwrap();
        let Some(a) = param_var(f, 1) else { continue };
        if f.is_entry {
            continue;
        }
        let base = |e: E| match ir.get(e) {
            Node::Var(v) => v == a,
            Node::Bin(BinOp::Add, x, c) => ir.get(x) == Node::Var(a) && matches!(ir.get(c), Node::Const(_)),
            _ => false,
        };
        let mut writes = 0;
        let mut ok = true;
        let other = |e: E, ok: &mut bool| {
            if uses_var(ir, e, a) {
                *ok = false;
            }
        };
        let call_args = |args: &[E], ok: &mut bool| {
            for (i, &x) in args.iter().enumerate() {
                if !(i == 0 && base(x)) {
                    other(x, ok);
                }
            }
        };
        'o: for b in &f.blocks {
            for s in &b.stmts {
                if dst_of(s) == Some(a) {
                    ok = false;
                }
                match s {
                    Stmt::Store { addr, v, .. } => {
                        if base(*addr) {
                            writes += 1;
                        } else {
                            other(*addr, &mut ok);
                        }
                        other(*v, &mut ok);
                    }
                    Stmt::Stores { addr, vals, .. } => {
                        if base(*addr) {
                            writes += 1;
                        } else {
                            other(*addr, &mut ok);
                        }
                        for v in ir.items(*vals) {
                            other(v, &mut ok);
                        }
                    }
                    Stmt::Copy { dst, src, .. } => {
                        if base(*dst) {
                            writes += 1;
                        } else {
                            other(*dst, &mut ok);
                        }
                        other(*src, &mut ok);
                    }
                    Stmt::Call { args, extra, t, .. } => {
                        call_args(&ir.to_vec(*args), &mut ok);
                        if let Some(x) = extra {
                            for v in ir.items(*x) {
                                other(v, &mut ok);
                            }
                        }
                        if let CallTarget::Ind { e } = t {
                            other(*e, &mut ok);
                        }
                    }
                    Stmt::Set { e, .. } => match ir.get(*e) {
                        Node::Call(t, args) => {
                            call_args(&ir.to_vec(args), &mut ok);
                            if let CallTarget::Ind { e } = ir.target(t) {
                                other(e, &mut ok);
                            }
                        }
                        _ => other(*e, &mut ok),
                    },
                    _ => {
                        for e in stmt_exprs(ir, s) {
                            other(e, &mut ok);
                        }
                    }
                }
                if !ok {
                    break;
                }
            }
            match &b.term {
                Term::Br { c, .. } => other(*c, &mut ok),
                Term::Ret { e: Some(e) } => other(*e, &mut ok),
                _ => {}
            }
            if !ok {
                break 'o;
            }
        }
        if ok && writes > 0 {
            out.insert(f.pc);
        }
    }
    out
}

fn out_param_tags(d: &Dx) -> IndexMap<i64, u32> {
    // tag: None = unclear (null), Some(None) = undefined, Some(Some(n))
    let mut tag: IndexMap<i64, Option<Option<u32>>> = IndexMap::new();
    let mut fwd: IndexMap<i64, Vec<i64>> = IndexMap::new();
    for &pc in &d.out_params {
        let f = d.f(pc).unwrap();
        let ir = f.ir.as_ref().unwrap();
        let a = param_var(f, 1).unwrap();
        let at0 = |e: E| ir.get(e) == Node::Var(a);
        // size: Some(None) = undefined, None = null
        let mut size: Option<Option<u32>> = Some(None);
        let note = |size: &mut Option<Option<u32>>, n: u32, c: bool| {
            *size = if !c || matches!(size, Some(Some(x)) if *x != n) {
                None
            } else if size.is_none() {
                None
            } else {
                Some(Some(n))
            };
        };
        let mut to: Vec<i64> = Vec::new();
        for b in &f.blocks {
            for s in &b.stmts {
                match s {
                    Stmt::Store { addr, size: sz, v, .. } if at0(*addr) => {
                        note(&mut size, *sz as u32, matches!(ir.get(*v), Node::Const(_)))
                    }
                    Stmt::Stores { addr, size: sz, vals, .. } if at0(*addr) => {
                        note(&mut size, *sz as u32, matches!(ir.get(ir.at(*vals, 0)), Node::Const(_)))
                    }
                    Stmt::Copy { dst, .. } if at0(*dst) => size = None,
                    _ => {}
                }
                if let Some((t, args)) = call_of(ir, s) {
                    if args.len > 0 && at0(ir.at(args, 0)) {
                        match t {
                            CallTarget::Fn { pc: cp } if d.out_params.contains(&cp) => to.push(cp),
                            _ => size = None,
                        }
                    }
                }
            }
        }
        tag.insert(pc, if size == Some(None) && to.is_empty() { None } else { size });
        fwd.insert(pc, to);
    }
    let mut changed = true;
    while changed {
        changed = false;
        for (pc, to) in fwd.clone() {
            let t = tag[&pc];
            if t.is_none() || to.is_empty() {
                continue;
            }
            for q in to {
                let u = tag.get(&q).copied();
                // u === null || u === undefined -> null; t === undefined || t === u -> u; else null
                let n: Option<Option<u32>> = match u {
                    None | Some(None) | Some(Some(None)) => None,
                    Some(Some(Some(uv))) => {
                        if t == Some(None) || t == Some(Some(uv)) {
                            Some(Some(uv))
                        } else {
                            None
                        }
                    }
                };
                if n != t {
                    tag.insert(pc, n);
                    changed = true;
                    break;
                }
            }
        }
    }
    let mut out = IndexMap::new();
    for (pc, t) in tag {
        if let Some(Some(n)) = t {
            out.insert(pc, n);
        }
    }
    out
}

// ---------------- Anchor error helpers ----------------

fn anchor_names(d: &mut Dx) -> Option<i64> {
    if !d.sem.anchor {
        return None;
    }
    let name_fn = {
        let sa = |p: u64, n: u64| d.str_at(p, n, false);
        find_name_fn(&d.fs, &sa)
    };
    let rename = |d: &mut Dx, pc: i64, nm: &str, why: &str| {
        let Some(old) = d.pn.by_pc.get(&pc).cloned() else { return };
        if !is_hex_fn(&old) || d.name_taken(nm) {
            return;
        }
        d.heur_names.insert(pc, format!("name [heur]: {why} (was {old})"));
        d.rename(pc, nm);
    };
    if let Some(nf) = name_fn {
        rename(d, nf, "Error_with_account_name", "the callee most often given an account-name string as its last argument pair");
    }
    let mut count: IndexMap<i64, u32> = IndexMap::new();
    for f in &d.fs {
        let ir = f.ir.as_ref().unwrap();
        for b in &f.blocks {
            for st in &b.stmts {
                if let Stmt::Call {
                    t: CallTarget::Fn { pc },
                    args,
                    ..
                } = st
                {
                    if args.len > 1 {
                        if let Node::Const(v) = ir.get(ir.at(*args, 1)) {
                            if (2000..=5000).contains(&v) && d.sem.anchor_error(v).is_some() {
                                *count.entry(*pc).or_default() += 1;
                            }
                        }
                    }
                }
            }
        }
    }
    let (mut best, mut n) = (None, 0);
    for (&pc, &c) in &count {
        if c > n {
            best = Some(pc);
            n = c;
        }
    }
    if let Some(b) = best {
        if n >= 3 && Some(b) != name_fn {
            rename(d, b, "anchor_error_from", "the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from");
        }
    }
    let pcs: Vec<i64> = d.fs.iter().map(|f| f.pc).collect();
    for pc in pcs {
        let f = d.f(pc).unwrap();
        let ir = f.ir.as_ref().unwrap();
        let Some(b) = param_var(f, 2) else { continue };
        let nst: usize = f.blocks.iter().map(|x| x.stmts.len()).sum();
        if f.is_entry || nst > 80 {
            continue;
        }
        let mut hit = false;
        for x in &f.blocks {
            for st in &x.stmts {
                let vals: Vec<E> = match st {
                    Stmt::Store { v, .. } => vec![*v],
                    Stmt::Stores { vals, .. } => ir.to_vec(*vals),
                    _ => continue,
                };
                for v in vals {
                    ir.walk(v, &mut |_, n| {
                        if let Node::Bin(BinOp::Add, a, c) = n {
                            if ir.get(a) == Node::Var(b) && ir.get(c) == Node::Const(6000) {
                                hit = true;
                            }
                        }
                    });
                }
            }
        }
        if !hit {
            // (6000 | variant: analysis only)
            continue;
        }
        let mut nm = "program_error_from".to_string();
        let mut k = 2;
        while d.name_taken(&nm) {
            nm = format!("program_error_from_{k}");
            k += 1;
        }
        rename(d, pc, &nm, "stores 6000 + its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from for the program's #[error_code] enum (the argument: the variant, error code 6000 + it)");
        if d.fn_name(pc) == nm {
            d.error_from.insert(pc);
        }
    }
    name_fn
}

// ---------------- selector dispatcher without instruction logs ----------------

fn selector_dispatch(d: &mut Dx) {
    let mut disc_high: IndexMap<u64, String> = IndexMap::new();
    for (v, dd) in &d.sem.disc {
        if dd.starts_with("ix:") {
            let k = v & !0xff;
            let nv = if disc_high.contains_key(&k) { String::new() } else { dd.clone() };
            disc_high.insert(k, nv);
        }
    }
    if !d.sem.ix_names.is_empty() {
        return;
    }
    let pcs: Vec<i64> = d.fs.iter().map(|f| f.pc).collect();
    for dpc in pcs {
        let f = d.f(dpc).unwrap();
        let ir = f.ir.as_ref().unwrap();
        let mut br: IndexMap<usize, (String, usize)> = IndexMap::new();
        for b in &f.blocks {
            let Term::Br { c, t, f: fl } = &b.term else { continue };
            let Node::Cmp(op, a, cb) = ir.get(*c) else { continue };
            if op != CmpOp::Eq && op != CmpOp::Ne {
                continue;
            }
            let Node::Const(v) = ir.get(cb) else { continue };
            let dd = d.sem.disc.get(&v).cloned().or_else(|| match ir.get(a) {
                Node::Bin(BinOp::And, _, m) if ir.get(m) == Node::Const(0xffff_ffff_ffff_ff00) && v & 0xff == 0 => {
                    disc_high.get(&v).cloned().filter(|x| !x.is_empty())
                }
                _ => None,
            });
            if let Some(dd) = dd {
                if dd.starts_with("ix:") && v >> 32 != 0 {
                    br.insert(b.id, (dd[3..].to_string(), if op == CmpOp::Eq { *t as usize } else { *fl as usize }));
                }
            }
        }
        let distinct: IndexSet<&String> = br.values().map(|x| &x.0).collect();
        if distinct.len() < 3 {
            continue;
        }
        let mut order: IndexMap<String, Vec<i64>> = IndexMap::new();
        let mut seen: HashMap<i64, IndexSet<String>> = HashMap::new();
        for (ix, start) in br.values() {
            let mut out = Vec::new();
            let mut vis: IndexSet<usize> = IndexSet::new();
            vis.insert(*start);
            let mut q = std::collections::VecDeque::new();
            q.push_back(*start);
            while !q.is_empty() && vis.len() < 64 {
                let bi = q.pop_front().unwrap();
                let Some(b) = f.blocks.get(bi) else { continue };
                if br.contains_key(&b.id) {
                    continue;
                }
                let mut call = |t: &CallTarget| {
                    if let CallTarget::Fn { pc } = t {
                        out.push(*pc);
                        seen.entry(*pc).or_default().insert(ix.clone());
                    }
                };
                for st in &b.stmts {
                    match st {
                        Stmt::Call { t, .. } => call(t),
                        Stmt::Set { e, .. } => {
                            if let Node::Call(t, _) = ir.get(*e) {
                                call(&ir.target(t));
                            }
                        }
                        _ => {}
                    }
                }
                if let Term::Ret { e: Some(e) } = &b.term {
                    if let Node::Call(t, _) = ir.get(*e) {
                        call(&ir.target(t));
                    }
                }
                let next: Vec<usize> = match &b.term {
                    Term::Br { t, f, .. } => vec![*t as usize, *f as usize],
                    Term::Jmp { to } => vec![*to as usize],
                    _ => vec![],
                };
                for n in next {
                    if !vis.contains(&n) {
                        vis.insert(n);
                        q.push_back(n);
                    }
                }
            }
            order.insert(ix.clone(), out);
        }
        let mut taken: HashSet<String> = d.sem.ix_names.values().cloned().collect();
        for (ix, pcs) in &order {
            let hpc = pcs.iter().copied().find(|x| {
                seen.get(x).is_some_and(|s| s.len() == 1) && d.idx.contains_key(x) && !d.sem.ix_names.contains_key(x)
            });
            let Some(hpc) = hpc else { continue };
            if taken.contains(ix) {
                continue;
            }
            d.sem.ix_names.insert(hpc, ix.clone());
            taken.insert(ix.clone());
            let old = d.fn_name(hpc);
            let idl_tag = if d.idl.is_some_and(|i| i.instructions.iter().any(|x| &x.name == ix)) { " [idl]" } else { "" };
            let msg = format!(
                "name [heur]: called on the side where {} matches the discriminator of instruction {ix}{idl_tag} (was {old})",
                d.fn_name(dpc)
            );
            d.heur_names.insert(hpc, msg);
            d.rename(hpc, &format!("ix_{ix}"));
        }
        if !d.sem.ix_names.is_empty() && is_hex_fn(&d.fn_name(dpc)) && !d.name_taken("selector_dispatch") {
            let old = d.fn_name(dpc);
            d.heur_names.insert(
                dpc,
                format!("name [heur]: compares a value with {} instruction discriminators and calls their handlers (was {old})", br.len()),
            );
            d.rename(dpc, "selector_dispatch");
        }
        break;
    }
}

// ---------------- Anchor dispatcher ----------------

fn anchor_dispatch(d: &mut Dx) {
    let handler_of: HashMap<String, i64> = d.sem.ix_names.iter().map(|(pc, ix)| (ix.clone(), *pc)).collect();
    let set_name = |d: &mut Dx, pc: i64, v: u32, nm: &str| {
        let m = d.abi_names.entry(pc).or_default();
        m.entry(v).or_insert_with(|| nm.to_string());
    };
    const ABI: [&str; 6] = ["", "program_id", "accounts", "accounts_len", "ix_args", "ix_args_len"];
    let pcs: Vec<i64> = d.fs.iter().map(|f| f.pc).collect();
    for dpc in pcs {
        let f = d.f(dpc).unwrap();
        let ir = f.ir.as_ref().unwrap();
        let mut hits: Vec<(u32, i64, Vec<E>)> = Vec::new();
        for b in &f.blocks {
            let Term::Br { c, t, f: fl } = &b.term else { continue };
            let Node::Cmp(op, a, cb) = ir.get(*c) else { continue };
            if op != CmpOp::Eq && op != CmpOp::Ne {
                continue;
            }
            let Node::Const(v) = ir.get(cb) else { continue };
            let Node::Load { size: 8, addr } = ir.get(a) else { continue };
            let Node::Var(x) = ir.get(addr) else { continue };
            let hpc = d.sem.disc.get(&v).filter(|s| s.starts_with("ix:")).and_then(|s| handler_of.get(&s[3..]).copied());
            let Some(hpc) = hpc else { continue };
            let next = f.blocks.get(if op == CmpOp::Eq { *t as usize } else { *fl as usize });
            let call = next.and_then(|n| {
                n.stmts.iter().find_map(|s| match s {
                    Stmt::Call {
                        t: CallTarget::Fn { pc },
                        args,
                        ..
                    } if *pc == hpc => Some(ir.to_vec(*args)),
                    _ => None,
                })
            });
            if let Some(args) = call {
                hits.push((x, hpc, args));
            }
        }
        if hits.len() < 3 || hits.iter().any(|h| h.0 != hits[0].0) {
            continue;
        }
        if is_hex_fn(&d.fn_name(dpc)) && !d.name_taken("anchor_dispatch") {
            let old = d.fn_name(dpc);
            d.heur_names.insert(
                dpc,
                format!("name [heur]: compares the instruction data's first 8 bytes with {} handlers' discriminators and calls the matching handler (was {old})", hits.len()),
            );
            d.rename(dpc, "anchor_dispatch");
        }
        let xv = hits[0].0;
        set_name(d, dpc, xv, "ix_data");
        for k in 1..=5usize {
            let args: Vec<E> = hits.iter().filter_map(|h| h.2.get(k).copied()).collect();
            if args.is_empty() {
                continue;
            }
            if !args.iter().all(|&a| expr_eq(ir, a, args[0])) {
                continue;
            }
            let a = args[0];
            let ok = if k <= 3 {
                matches!(ir.get(a), Node::Var(_))
            } else if k == 4 {
                matches!(ir.get(a), Node::Bin(BinOp::Add, x, c) if ir.get(x) == Node::Var(xv) && ir.get(c) == Node::Const(8))
            } else {
                matches!(ir.get(a), Node::Bin(BinOp::Add, x, c) if matches!(ir.get(x), Node::Var(_)) && ir.get(c) == Node::Const(8u64.wrapping_neg()))
            };
            if !ok {
                continue;
            }
            if k <= 3 {
                if let Node::Var(id) = ir.get(a) {
                    set_name(d, dpc, id, ABI[k]);
                }
            }
            if k == 5 {
                if let Node::Bin(_, x, _) = ir.get(a) {
                    if let Node::Var(id) = ir.get(x) {
                        set_name(d, dpc, id, "ix_data_len");
                    }
                }
            }
            for h in &hits {
                let hpc = h.1;
                let Some(hb) = d.f(hpc) else { continue };
                let reg = if hb.stack_args.unwrap_or(0) > 0 {
                    if k < 4 {
                        k as i32 + 1
                    } else {
                        100 + (k as i32 - 4)
                    }
                } else {
                    k as i32 + 1
                };
                if let Some(t) = hb.vars.iter().find(|v| v.param == reg) {
                    if d.def_count(hpc, t.id) == 0 {
                        set_name(d, hpc, t.id, ABI[k]);
                    }
                }
            }
        }
    }
}

// ---------------- CPI wrappers ----------------

fn wrappers(d: &mut Dx, facts: &RegFacts) {
    for (pc, nparams, nblocks, sys) in &facts.pda_info {
        if *nparams < 4 || *nblocks > 40 || d.invoke_thunks.contains_key(pc) || pda_abi(&d.fn_name(*pc)).is_some() {
            continue;
        }
        let pda: Vec<&String> = sys
            .iter()
            .filter(|x| *x == "sol_create_program_address" || *x == "sol_try_find_program_address")
            .collect();
        if pda.len() == 1 && sys.len() <= 3 {
            d.pda_wrappers.insert(
                *pc,
                if pda[0] == "sol_create_program_address" {
                    SiteKind::PdaCreateOut
                } else {
                    SiteKind::PdaFindOut
                },
            );
        }
    }
    // (library wrappers: none without library classification) user functions passing their account infos on
    for _round in 0..2 {
        let pcs: Vec<i64> = d.fs.iter().map(|f| f.pc).collect();
        for pc in pcs {
            let f = d.f(pc).unwrap();
            if d.invoke_wrappers.contains(&pc) || f.nparams < 4 {
                continue;
            }
            let ir = f.ir.as_ref().unwrap();
            let slot = |a: E| -> Option<(u32, i64)> {
                match ir.get(a) {
                    Node::Var(v) => Some((v, 0)),
                    Node::Bin(BinOp::Add, x, c) => match (ir.get(x), ir.get(c)) {
                        (Node::Var(v), Node::Const(c)) => Some((v, c as i64)),
                        _ => None,
                    },
                    _ => None,
                }
            };
            let mut spills: Option<IndexMap<(u32, i128), Vec<E>>> = None;
            let mut spilled = || -> &IndexMap<(u32, i128), Vec<E>> {
                if spills.is_none() {
                    let mut m: IndexMap<(u32, i128), Vec<E>> = IndexMap::new();
                    for b in &f.blocks {
                        for st in &b.stmts {
                            match st {
                                Stmt::Store { size: 8, addr, v, .. } => {
                                    if let Some((v0, o)) = slot(*addr) {
                                        m.entry((v0, o as i128)).or_default().push(*v);
                                    }
                                }
                                Stmt::Stores { size: 8, addr, vals, .. } => {
                                    for (i, v) in ir.items(*vals).enumerate() {
                                        if let Some((v0, o)) = slot(*addr) {
                                            m.entry((v0, o as i128 + 8 * i as i128)).or_default().push(v);
                                        }
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                    spills = Some(m);
                }
                spills.as_ref().unwrap()
            };
            let mut par = |e: Option<E>, r: i32| -> bool {
                let Some(e) = e else { return false };
                match ir.get(e) {
                    Node::Var(v) => f.vars.get(v as usize).is_some_and(|x| x.param == r),
                    Node::Load { size: 8, addr } => {
                        let Some((v0, o)) = slot(addr) else { return false };
                        let vs = spilled().get(&(v0, o as i128)).cloned();
                        vs.is_some_and(|vs| {
                            vs.len() == 1 && matches!(ir.get(vs[0]), Node::Var(id) if f.vars.get(id as usize).is_some_and(|x| x.param == r))
                        })
                    }
                    _ => false,
                }
            };
            let iw = d.invoke_wrappers.clone();
            let mut passes = |t: &CallTarget, args: &[E]| -> bool {
                match t {
                    CallTarget::Sys { name, .. } => {
                        (&**name == "sol_invoke_signed_c" || &**name == "sol_invoke_signed_rust")
                            && par(args.get(1).copied(), 3)
                            && par(args.get(2).copied(), 4)
                    }
                    CallTarget::Fn { pc } => {
                        iw.contains(pc) && par(args.get(2).copied(), 3) && par(args.get(3).copied(), 4)
                    }
                    _ => false,
                }
            };
            let mut hit = false;
            for b in &f.blocks {
                for st in &b.stmts {
                    match st {
                        Stmt::Call { t, args, .. } => {
                            if passes(t, &ir.to_vec(*args)) {
                                hit = true;
                            }
                        }
                        Stmt::Set { e, .. } => {
                            if let Node::Call(t, args) = ir.get(*e) {
                                if passes(&ir.target(t), &ir.to_vec(args)) {
                                    hit = true;
                                }
                            }
                        }
                        _ => {}
                    }
                }
                if let Term::Ret { e: Some(e) } = &b.term {
                    if let Node::Call(t, args) = ir.get(*e) {
                        if passes(&ir.target(t), &ir.to_vec(args)) {
                            hit = true;
                        }
                    }
                }
            }
            if hit {
                d.invoke_wrappers.insert(pc);
            }
        }
    }
}

fn user_invoke(d: &mut Dx) {
    for f in &d.fs {
        let ir = f.ir.as_ref().unwrap();
        let mut n = 0;
        let mut hit = false;
        let is_inv = |t: &CallTarget| match t {
            CallTarget::Fn { pc } => {
                d.invoke_wrappers.contains(pc)
                    || matches!(d.invoke_thunks.get(pc), Some(SiteKind::Rust | SiteKind::C))
            }
            CallTarget::Sys { name, .. } => &**name == "sol_invoke_signed_c" || &**name == "sol_invoke_signed_rust",
            _ => false,
        };
        for b in &f.blocks {
            for st in &b.stmts {
                n += 1;
                match st {
                    Stmt::Call { t, .. } if is_inv(t) => hit = true,
                    Stmt::Set { e, .. } => {
                        if let Node::Call(t, _) = ir.get(*e) {
                            if is_inv(&ir.target(t)) {
                                hit = true;
                            }
                        }
                    }
                    _ => {}
                }
                if let Term::Ret { e: Some(e) } = &b.term {
                    if let Node::Call(t, _) = ir.get(*e) {
                        if is_inv(&ir.target(t)) {
                            hit = true;
                        }
                    }
                }
            }
        }
        if hit && n <= 80 && (f.nparams >= 4 || f.stack_args.unwrap_or(0) > 0) {
            d.user_invoke.insert(f.pc);
        }
    }
    let _ = known_key;
}

/// callInsns: the call instructions of a function to a target (`fn:<pc>` / `sys:<name>`).
pub fn call_insns(d: &Dx, fpc: i64, target: &str) -> Vec<i64> {
    let p = d.p;
    let mut end = p.insns.len() as i64;
    for &x in p.funcs.keys() {
        if x > fpc && x < end {
            end = x;
        }
    }
    let mut out = Vec::new();
    let mut pc = fpc.max(0);
    while pc < end {
        let ins = &p.insns[pc as usize];
        if ins.opc == 0x85 && call_target_name(p, pc, ins.imm).text() == target {
            out.push(pc);
        }
        pc += 1;
    }
    out
}
