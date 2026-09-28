//! Register liveness, interprocedural parameter/return inference and variable recovery: a port of
//! `src/dataflow.ts` (same algorithms, same iteration orders), plus `stack.ts` and `stackargs.ts`.
//!
//! Signatures (`noreturn`, `returns`, `nparams`, `extraIn`) are read and written through a [`Sig`]
//! table indexed like `Program::funcs` while a pass runs (so blocks can be borrowed at the same time),
//! then stored back into the functions.

pub mod stack;
pub mod stackargs;

use indexmap::IndexMap;
use sbpf_ir::{CallTarget, Ir, Node, Stmt, Term, E};
use sbpf_program::syscalls::Syscall;
use sbpf_program::{
    has_pending_blocks, materialize_blocks, reaches_return_pending, Block, Func, Program, VarInfo,
};
use std::collections::{HashMap, HashSet};

const ARG_MASK: [i32; 6] = [0, 0b10, 0b110, 0b1110, 0b11110, 0b111110]; // r1..rk
const CLOBBER: i32 = 0b111111; // r0..r5

/// `ARG_MASK[n]` (undefined, i.e. 0 once or-ed, past 5)
fn arg_mask(n: u32) -> i32 {
    ARG_MASK.get(n as usize).copied().unwrap_or(0)
}

#[derive(Clone, Debug, Default, PartialEq)]
pub struct Sig {
    pub nparams: u32,
    pub returns: bool,
    pub noreturn: bool,
    pub extra_in: Vec<u8>,
}

pub fn sigs_of(p: &Program) -> Vec<Sig> {
    p.funcs
        .values()
        .map(|f| Sig {
            nparams: f.nparams,
            returns: f.returns,
            noreturn: f.noreturn,
            extra_in: f.extra_in.clone(),
        })
        .collect()
}

/// What calleeInfo reads of the program.
#[derive(Clone, Copy)]
pub struct Ctx<'a> {
    pub funcs: &'a IndexMap<i64, Func>,
    pub syscalls: &'a IndexMap<String, Syscall>,
}

#[derive(Clone, Copy, Debug)]
pub struct CallInfo {
    pub nparams: u32,
    pub returns: bool,
    pub noreturn: bool,
}

impl Ctx<'_> {
    pub fn of(p: &Program) -> Ctx<'_> {
        Ctx {
            funcs: &p.funcs,
            syscalls: &p.syscalls,
        }
    }
    pub fn callee_info(&self, sigs: &[Sig], t: &CallTarget) -> CallInfo {
        match t {
            CallTarget::Fn { pc } => match self.funcs.get_index_of(pc) {
                Some(i) => {
                    let s = &sigs[i];
                    CallInfo {
                        nparams: s.nparams,
                        returns: s.returns,
                        noreturn: s.noreturn,
                    }
                }
                None => CallInfo {
                    nparams: 5,
                    returns: true,
                    noreturn: false,
                },
            },
            CallTarget::Sys { name, .. } => {
                let sc = &self.syscalls[&**name];
                CallInfo {
                    nparams: sc.params.len() as u32,
                    returns: true,
                    noreturn: sc.noreturn,
                }
            }
            CallTarget::Ind { .. } => CallInfo {
                nparams: 5,
                returns: true,
                noreturn: false,
            },
        }
    }
}

pub fn regs_of(ir: &Ir, e: E) -> i32 {
    let mut m = 0;
    ir.walk(e, &mut |_, n| {
        if let Node::Reg(r) = n {
            m |= 1 << r;
        }
    });
    m
}

/// use/def masks of one statement in register form (`clob`: the indirect call's clobber mask).
fn stmt_use_def(cx: &Ctx, sigs: &[Sig], ir: &Ir, s: &Stmt, clob: i32) -> (i32, i32) {
    match s {
        Stmt::Set { dst, e, .. } => (regs_of(ir, *e), 1 << dst),
        Stmt::Store { addr, v, .. } => (regs_of(ir, *addr) | regs_of(ir, *v), 0),
        Stmt::Eval { e, .. } => (regs_of(ir, *e), 0),
        Stmt::Call { t, .. } => {
            let ci = cx.callee_info(sigs, t);
            let mut u = arg_mask(ci.nparams);
            if let CallTarget::Ind { e } = t {
                u = (u & !clob) | regs_of(ir, *e);
            }
            if let CallTarget::Fn { pc } = t {
                if let Some(i) = cx.funcs.get_index_of(pc) {
                    for &r in &sigs[i].extra_in {
                        u |= 1 << r;
                    }
                }
            }
            (u, CLOBBER)
        }
        _ => (0, 0),
    }
}

fn term_use(ir: &Ir, returns: bool, b: &Block) -> i32 {
    match &b.term {
        Term::Br { c, .. } => regs_of(ir, *c),
        Term::Ret { .. } => returns as i32,
        _ => 0,
    }
}

type Clob = HashMap<(u32, u32), i32>;

fn clob_at(clob: &Clob, b: usize, i: usize) -> i32 {
    clob.get(&(b as u32, i as u32)).copied().unwrap_or(0)
}

/// Per-block backwards liveness over registers r0..r10: (liveIn, liveOut).
pub fn liveness(
    cx: &Ctx,
    sigs: &[Sig],
    ir: &Ir,
    f: &Func,
    returns: bool,
    clob: &Clob,
    mut cache: Option<&mut Vec<Option<(i32, i32)>>>,
) -> (Vec<i32>, Vec<i32>) {
    let n = f.blocks.len();
    let mut gen = vec![0i32; n];
    let mut kill = vec![0i32; n];
    if let Some(c) = cache.as_deref_mut() {
        c.resize(n, None);
    }
    for (bi, b) in f.blocks.iter().enumerate() {
        // Folding x -> (x & ~def) | use backwards gives x -> (x & ~K) | G; (G, K) of a block without
        // calls does not depend on signatures (cached across the fixed point's evaluations)
        let cached = cache.as_deref().and_then(|c| c[bi]);
        let (g, k) = match cached {
            Some(gk) => gk,
            None => {
                let (mut g, mut k) = (0i32, 0i32);
                let mut calls = false;
                for i in (0..b.stmts.len()).rev() {
                    let s = &b.stmts[i];
                    calls |= matches!(s, Stmt::Call { .. });
                    let (u, d) = stmt_use_def(cx, sigs, ir, s, clob_at(clob, bi, i));
                    g = (g & !d) | u;
                    k |= d;
                }
                if let (false, Some(c)) = (calls, cache.as_deref_mut()) {
                    c[bi] = Some((g, k));
                }
                (g, k)
            }
        };
        gen[bi] = g | (term_use(ir, returns, b) & !k);
        kill[bi] = k;
    }
    let mut live_in = vec![0i32; n];
    let mut live_out = vec![0i32; n];
    let order = postorder(f);
    let mut changed = true;
    while changed {
        changed = false;
        for &id in &order {
            let b = &f.blocks[id];
            let mut out = 0;
            for &s in &b.succs {
                out |= live_in[s];
            }
            let inn = gen[id] | (out & !kill[id]);
            if inn != live_in[id] || out != live_out[id] {
                live_in[id] = inn;
                live_out[id] = out;
                changed = true;
            }
        }
    }
    (live_in, live_out)
}

pub fn postorder(f: &Func) -> Vec<usize> {
    let mut seen = vec![false; f.blocks.len()];
    let mut out = vec![];
    let mut stack: Vec<(usize, usize)> = vec![(0, 0)];
    seen[0] = true;
    while let Some(top) = stack.last_mut() {
        let b = &f.blocks[top.0];
        if top.1 < b.succs.len() {
            let s = b.succs[top.1];
            top.1 += 1;
            if !seen[s] {
                seen[s] = true;
                stack.push((s, 0));
            }
        } else {
            out.push(top.0);
            stack.pop();
        }
    }
    out
}

fn compute_ind_clobber(cx: &Ctx, sigs: &[Sig], f: &Func) -> Clob {
    let mut clob = Clob::new();
    let has_ind = f.blocks.iter().any(|b| {
        b.stmts.iter().any(|s| {
            matches!(
                s,
                Stmt::Call {
                    t: CallTarget::Ind { .. },
                    ..
                }
            )
        })
    });
    if !has_ind {
        return clob;
    }
    let n = f.blocks.len();
    let mut in_m = vec![-1i32; n];
    let mut out_m = vec![-1i32; n];
    in_m[0] = 0;
    let mut order = postorder(f);
    order.reverse();
    let xfer = |bi: usize, mut m: i32, rec: Option<&mut Clob>| {
        let mut rec = rec;
        for (i, s) in f.blocks[bi].stmts.iter().enumerate() {
            match s {
                Stmt::Set { dst, .. } => m &= !(1 << dst),
                Stmt::Call { t, .. } => {
                    if let (Some(r), CallTarget::Ind { .. }) = (rec.as_deref_mut(), t) {
                        r.insert((bi as u32, i as u32), m & 0b111110);
                    }
                    m |= 0b111110;
                    if cx.callee_info(sigs, t).returns {
                        m &= !1;
                    } else {
                        m |= 1;
                    }
                }
                _ => {}
            }
        }
        m
    };
    let mut changed = true;
    while changed {
        changed = false;
        for &id in &order {
            let b = &f.blocks[id];
            let mut m = if id == 0 { 0 } else { -1 };
            if id != 0 {
                for &pr in &b.preds {
                    m &= out_m[pr];
                }
            }
            if id != 0 && b.preds.is_empty() {
                m = 0;
            }
            let o = xfer(id, m, None);
            if m != in_m[id] || o != out_m[id] {
                in_m[id] = m;
                out_m[id] = o;
                changed = true;
            }
        }
    }
    for bi in 0..n {
        xfer(bi, in_m[bi], Some(&mut clob));
    }
    clob
}

fn defines_r0(f: &Func) -> bool {
    f.blocks.iter().any(|b| {
        b.stmts
            .iter()
            .any(|s| matches!(s, Stmt::Set { dst: 0, .. } | Stmt::Call { .. }))
    })
}

fn is_noret(cx: &Ctx, sigs: &[Sig], s: &Stmt) -> bool {
    match s {
        Stmt::Call { t, .. } => cx.callee_info(sigs, t).noreturn,
        _ => false,
    }
}

/// Interprocedural fixed point for noreturn, returns, nparams, extraIn (dataflow.ts inferSignatures,
/// lazily formed blocks: the decompiler's path).
pub fn infer_signatures(p: &mut Program) {
    assert!(
        has_pending_blocks(p),
        "infer_signatures: only the lazyBlocks path is ported"
    );
    let n = p.funcs.len();
    let mut sigs = sigs_of(p);
    {
        let cx = Ctx::of(p);
        // noreturn: optimistic start, worklist over callers of newly noreturn functions
        let mut nr_callers: HashMap<i64, Vec<usize>> = HashMap::new();
        for (fi, f) in p.funcs.values().enumerate() {
            let mut seen = HashSet::new();
            for &t in sbpf_program::pending_calls(f) {
                if seen.insert(t) {
                    nr_callers.entry(t).or_default().push(fi);
                }
            }
        }
        let mut queue: Vec<usize> = (0..n).collect();
        let mut queued = vec![true; n];
        let mut qi = 0;
        while qi < queue.len() {
            let fi = queue[qi];
            qi += 1;
            queued[fi] = false;
            let f = &p.funcs[fi];
            if sigs[fi].noreturn || reaches_return_pending(p, f, &|s| is_noret(&cx, &sigs, s)) {
                continue;
            }
            sigs[fi].noreturn = true;
            if let Some(cs) = nr_callers.get(&f.pc) {
                for &c in cs {
                    if !sigs[c].noreturn && !queued[c] {
                        queued[c] = true;
                        queue.push(c);
                    }
                }
            }
        }
    }
    // cut blocks after calls to noreturn callees: form the remaining blocks
    let formed: Vec<_> = {
        let cx = Ctx::of(p);
        p.funcs
            .values()
            .map(|f| materialize_blocks(p, f, &|s| is_noret(&cx, &sigs, s)))
            .collect()
    };
    for (f, (blocks, block_at)) in p.funcs.values_mut().zip(formed) {
        f.blocks = blocks;
        f.block_at = block_at;
        f.pending = None;
    }
    p.lazy = None;
    // (call statements are values here: nothing is shared between functions to unshare)
    let cx = Ctx::of(p);
    let funcs: Vec<&Func> = p.funcs.values().collect();
    let clobs: Vec<Clob> = funcs
        .iter()
        .map(|f| compute_ind_clobber(&cx, &sigs, f))
        .collect();
    let nfuncs = p.funcs.len();
    for (fi, f) in funcs.iter().enumerate() {
        let s = &mut sigs[fi];
        s.nparams = 0;
        s.extra_in = vec![];
        s.returns = !s.noreturn
            && (f.is_entry || p.address_taken.contains(&f.pc) || nfuncs == 0)
            && (f.is_entry || defines_r0(f));
    }
    // worklist fixed point (monotone), callees first
    let mut callers: HashMap<i64, Vec<usize>> = HashMap::new();
    let mut callees: Vec<Vec<usize>> = Vec::with_capacity(n);
    for (fi, f) in funcs.iter().enumerate() {
        let mut seen = HashSet::new();
        let mut out = vec![];
        for b in &f.blocks {
            for s in &b.stmts {
                let Stmt::Call {
                    t: CallTarget::Fn { pc },
                    ..
                } = s
                else {
                    continue;
                };
                if !seen.insert(*pc) {
                    continue;
                }
                callers.entry(*pc).or_default().push(fi);
                if let Some(g) = p.funcs.get_index_of(pc) {
                    out.push(g);
                }
            }
        }
        callees.push(out);
    }
    let mut queue: Vec<usize> = vec![];
    {
        let mut done = vec![false; n];
        for root in 0..n {
            if done[root] {
                continue;
            }
            done[root] = true;
            let mut st: Vec<(usize, usize)> = vec![(root, 0)];
            while let Some(top) = st.last_mut() {
                let cs = &callees[top.0];
                if top.1 < cs.len() {
                    let g = cs[top.1];
                    top.1 += 1;
                    if !done[g] {
                        done[g] = true;
                        st.push((g, 0));
                    }
                } else {
                    queue.push(top.0);
                    st.pop();
                }
            }
        }
    }
    let mut queued = vec![true; n];
    let mut gks: Vec<Vec<Option<(i32, i32)>>> = vec![vec![]; n];
    let mut qi = 0;
    while qi < queue.len() {
        let fi = queue[qi];
        qi += 1;
        queued[fi] = false;
        let f = funcs[fi];
        let (live_in, live_out) = liveness(
            &cx,
            &sigs,
            &p.ir,
            f,
            sigs[fi].returns,
            &clobs[fi],
            Some(&mut gks[fi]),
        );
        // markUsedResults
        for (bi, b) in f.blocks.iter().enumerate() {
            let mut live = live_out[bi] | term_use(&p.ir, sigs[fi].returns, b);
            for i in (0..b.stmts.len()).rev() {
                let s = &b.stmts[i];
                if let Stmt::Call {
                    t: CallTarget::Fn { pc },
                    ..
                } = s
                {
                    if live & 1 != 0 {
                        if let Some(ci) = p.funcs.get_index_of(pc) {
                            if !sigs[ci].returns && !sigs[ci].noreturn {
                                sigs[ci].returns = true;
                                if !queued[ci] {
                                    queued[ci] = true;
                                    queue.push(ci);
                                }
                            }
                        }
                    }
                }
                let (u, d) = stmt_use_def(&cx, &sigs, &p.ir, s, clob_at(&clobs[fi], bi, i));
                live = (live & !d) | u;
            }
        }
        let li = live_in[0];
        let mut k = 0;
        for r in 1..=5 {
            if li & (1 << r) != 0 {
                k = r;
            }
        }
        let extra: Vec<u8> = [0u8, 6, 7, 8, 9]
            .into_iter()
            .filter(|r| li & (1 << r) != 0)
            .collect();
        let np = (k as u32).max(sigs[fi].nparams);
        let mut ex: Vec<u8> = sigs[fi].extra_in.clone();
        ex.extend(extra);
        ex.sort();
        ex.dedup();
        if np != sigs[fi].nparams || ex != sigs[fi].extra_in {
            sigs[fi].nparams = np;
            sigs[fi].extra_in = ex;
            if let Some(cs) = callers.get(&f.pc) {
                for &c in cs {
                    if !queued[c] {
                        queued[c] = true;
                        queue.push(c);
                    }
                }
            }
        }
    }
    drop(funcs);
    for ((f, s), c) in p.funcs.values_mut().zip(sigs).zip(clobs) {
        f.nparams = s.nparams;
        f.returns = s.returns;
        f.noreturn = s.noreturn;
        f.extra_in = s.extra_in;
        f.ind_clobber = c;
    }
}

// ---------------- variable recovery ----------------

struct Uf(Vec<i32>);

impl Uf {
    fn new(n: usize) -> Uf {
        Uf((0..n as i32).collect())
    }
    fn find(&mut self, mut x: i32) -> i32 {
        let p = &mut self.0;
        while p[x as usize] != x {
            p[x as usize] = p[p[x as usize] as usize];
            x = p[x as usize];
        }
        x
    }
    fn union(&mut self, a: i32, b: i32) {
        let a = self.find(a);
        let b = self.find(b);
        if a != b {
            self.0[a as usize] = b;
        }
    }
}

#[derive(Clone, Copy, PartialEq)]
enum DefKind {
    Stmt,
    Clobber,
    Entry,
}

/// A call statement's arguments after the first pass (sliced to the callee's parameters, clobbered
/// indirect-call arguments replaced by `undef`).
enum Arg {
    E(E),
    Undef,
}

/// The function's new IR, variables and arena.
pub struct Recovered {
    pub stmts: Vec<Vec<Stmt>>,
    pub terms: Vec<Term>,
    pub vars: Vec<VarInfo>,
    pub ir: Ir,
}

/// Convert register IR into variable IR (dataflow.ts recoverVars): each maximal web of
/// definitions/uses of a register becomes one variable. Reads the function (register IR in `pir`);
/// the result is stored with [`apply_recovered`].
pub fn recover_vars(cx: &Ctx, sigs: &[Sig], pir: &Ir, fi: usize) -> Result<Recovered, String> {
    let f = &cx.funcs[fi];
    let returns = sigs[fi].returns;
    let (live_in, _) = liveness(cx, sigs, pir, f, returns, &f.ind_clobber, None);
    let nb = f.blocks.len();
    let mut next = (nb * 11) as i32;
    let entry_node = |b: usize, r: usize| (b * 11 + r) as i32;
    let mut defs: Vec<(i32, i32, DefKind)> = vec![];
    let mut new_def = |defs: &mut Vec<(i32, i32, DefKind)>, reg: i32, kind: DefKind| {
        let n = next;
        next += 1;
        defs.push((n, reg, kind));
        n
    };
    let mut entry_defs = [-1i32; 11];
    for (r, d) in entry_defs.iter_mut().enumerate() {
        if live_in[0] & (1 << r) != 0 {
            *d = new_def(&mut defs, r as i32, DefKind::Entry);
        }
    }
    // first pass: def nodes, the node read by each register use (in visit order), block exit values
    let mut uses: Vec<(i32, u8)> = vec![];
    let mut def_node: Vec<Vec<i32>> = Vec::with_capacity(nb); // per stmt (-1: none)
    let mut clobbers: Vec<Vec<Vec<i32>>> = Vec::with_capacity(nb);
    let mut call_args: Vec<Vec<Vec<Arg>>> = Vec::with_capacity(nb);
    let mut call_extra: Vec<Vec<Vec<u8>>> = Vec::with_capacity(nb);
    let mut call_dst: Vec<Vec<i32>> = Vec::with_capacity(nb);
    let mut ret_e: Vec<Option<E>> = Vec::with_capacity(nb);
    let mut exit_val: Vec<[i32; 16]> = Vec::with_capacity(nb);
    for (bi, b) in f.blocks.iter().enumerate() {
        // (registers 11..15 of invalid instructions: `undefined` (-1) until defined in the block)
        let mut cur = [-1i32; 16];
        for (r, c) in cur.iter_mut().enumerate().take(11) {
            *c = entry_node(bi, r);
        }
        let note = |uses: &mut Vec<(i32, u8)>, cur: &[i32; 16], e: E| {
            pir.walk(e, &mut |_, n| {
                if let Node::Reg(r) = n {
                    uses.push((cur[r as usize], r));
                }
            })
        };
        let ns = b.stmts.len();
        let mut dn = vec![-1i32; ns];
        let mut cl: Vec<Vec<i32>> = vec![vec![]; ns];
        let mut ca: Vec<Vec<Arg>> = (0..ns).map(|_| vec![]).collect();
        let mut cex: Vec<Vec<u8>> = vec![vec![]; ns];
        let mut cd = vec![0i32; ns];
        for (i, s) in b.stmts.iter().enumerate() {
            match s {
                Stmt::Set { dst, e, .. } => {
                    note(&mut uses, &cur, *e);
                    let n = new_def(&mut defs, *dst, DefKind::Stmt);
                    dn[i] = n;
                    cur[*dst as usize] = n;
                }
                Stmt::Store { addr, v, .. } => {
                    note(&mut uses, &cur, *addr);
                    note(&mut uses, &cur, *v);
                }
                Stmt::Eval { e, .. } => note(&mut uses, &cur, *e),
                Stmt::Call { t, args, .. } => {
                    let ci = cx.callee_info(sigs, t);
                    let mut a: Vec<Arg> = pir
                        .items(*args)
                        .take(ci.nparams as usize)
                        .map(Arg::E)
                        .collect();
                    if let CallTarget::Ind { .. } = t {
                        let cm = clob_at(&f.ind_clobber, bi, i);
                        let mut k = 5usize;
                        while k > 0 && cm & (1 << k) != 0 {
                            k -= 1;
                        }
                        a.truncate(k);
                        for (j, x) in a.iter_mut().enumerate() {
                            if cm & (1 << (j + 1)) != 0 {
                                *x = Arg::Undef;
                            }
                        }
                    }
                    for x in &a {
                        if let Arg::E(e) = x {
                            note(&mut uses, &cur, *e);
                        }
                    }
                    if let CallTarget::Ind { e } = t {
                        note(&mut uses, &cur, *e);
                    }
                    let mut extras = vec![];
                    if let CallTarget::Fn { pc } = t {
                        if let Some(g) = cx.funcs.get_index_of(pc) {
                            extras = sigs[g].extra_in.clone();
                        }
                    }
                    for &r in &extras {
                        uses.push((cur[r as usize], r));
                    }
                    for r in 1..=5 {
                        let n = new_def(&mut defs, r, DefKind::Clobber);
                        cl[i].push(n);
                        cur[r as usize] = n;
                    }
                    if ci.returns {
                        let n = new_def(&mut defs, 0, DefKind::Stmt);
                        dn[i] = n;
                        cur[0] = n;
                        cd[i] = 0;
                    } else {
                        let n = new_def(&mut defs, 0, DefKind::Clobber);
                        cl[i].push(n);
                        cur[0] = n;
                        cd[i] = -1;
                    }
                    ca[i] = a;
                    cex[i] = extras;
                }
                _ => {}
            }
        }
        let mut re = None;
        match &b.term {
            Term::Br { c, .. } => note(&mut uses, &cur, *c),
            Term::Ret { e } => {
                if let (true, Some(e)) = (returns, e) {
                    note(&mut uses, &cur, *e);
                    re = Some(*e);
                }
            }
            _ => {}
        }
        def_node.push(dn);
        clobbers.push(cl);
        call_args.push(ca);
        call_extra.push(cex);
        call_dst.push(cd);
        ret_e.push(re);
        exit_val.push(cur);
    }

    let mut uf = Uf::new(next as usize);
    for (bi, b) in f.blocks.iter().enumerate() {
        for r in 0..=10 {
            if live_in[bi] & (1 << r) == 0 {
                continue;
            }
            let en = entry_node(bi, r);
            if bi == 0 && entry_defs[r] >= 0 {
                uf.union(en, entry_defs[r]);
            }
            for &pr in &b.preds {
                uf.union(en, exit_val[pr][r]);
            }
        }
    }
    let mut cv = ClassVars {
        uf,
        class_var: vec![NO_VAR; next as usize],
        undef_class: NO_VAR,
        vars: vec![],
    };
    // variables for every class that is read (in use order)
    let use_vars: Vec<u32> = uses.iter().map(|&(n, r)| cv.var_of(n, r as i32)).collect();
    // rewrite (the uses are visited in the same order as in the first pass)
    // (sized by the function, not the program arena: a program-sized block per function is costly to map)
    let est: usize = f.blocks.iter().map(|b| b.stmts.len() + 1).sum::<usize>() * 12 + 64;
    let ir = Ir::with_capacity(est.min(pir.len() / 4));
    let mut rw = Rw {
        uses: &uses,
        use_vars: &use_vars,
        cur: 0,
        err: false,
    };
    let mut out_stmts = Vec::with_capacity(nb);
    let mut terms = Vec::with_capacity(nb);
    for (bi, b) in f.blocks.iter().enumerate() {
        let mut out: Vec<Stmt> = Vec::with_capacity(b.stmts.len());
        for (i, s) in b.stmts.iter().enumerate() {
            match s {
                Stmt::Set { dst, e, pc } => {
                    let e = rw.rw(&ir, pir, *e);
                    let dst = cv.var_of(def_node[bi][i], *dst) as i32;
                    out.push(Stmt::Set { dst, e, pc: *pc });
                }
                Stmt::Store { size, addr, v, pc } => {
                    let addr = rw.rw(&ir, pir, *addr);
                    let v = rw.rw(&ir, pir, *v);
                    out.push(Stmt::Store {
                        size: *size,
                        addr,
                        v,
                        pc: *pc,
                    });
                }
                Stmt::Eval { e, pc } => {
                    let e = rw.rw(&ir, pir, *e);
                    out.push(Stmt::Eval { e, pc: *pc });
                }
                Stmt::Call { t, pc, .. } => {
                    let args: Vec<E> = call_args[bi][i]
                        .iter()
                        .map(|a| match a {
                            Arg::E(e) => rw.rw(&ir, pir, *e),
                            Arg::Undef => ir.undef(),
                        })
                        .collect();
                    let t = match t {
                        CallTarget::Ind { e } => CallTarget::Ind {
                            e: rw.rw(&ir, pir, *e),
                        },
                        t => t.clone(),
                    };
                    let extra: Vec<E> = call_extra[bi][i].iter().map(|_| rw.top(&ir)).collect();
                    let dst = if call_dst[bi][i] == 0 {
                        cv.var_of(def_node[bi][i], 0) as i32
                    } else {
                        -1
                    };
                    out.push(Stmt::Call {
                        dst,
                        t,
                        args: ir.list(args),
                        pc: *pc,
                        extra: Some(ir.list(extra)),
                    });
                    // registers the callee leaves behind that are read later: explicit `undef`
                    for &n in &clobbers[bi][i] {
                        let c = cv.uf.find(n);
                        if let Some(v) = cv.get(c) {
                            out.push(Stmt::Set {
                                dst: v as i32,
                                e: ir.undef(),
                                pc: *pc,
                            });
                        }
                    }
                }
                s => out.push(s.clone()),
            }
        }
        let t = match &b.term {
            Term::Br { c, t, f } => Term::Br {
                c: rw.rw(&ir, pir, *c),
                t: *t,
                f: *f,
            },
            Term::Ret { .. } => Term::Ret {
                e: ret_e[bi].map(|e| rw.rw(&ir, pir, e)),
            },
            t => t.clone(),
        };
        out_stmts.push(out);
        terms.push(t);
    }
    if rw.err {
        return Err("internal: unmapped register use".into());
    }
    // classify variables: parameters / implicit inputs
    for &(node, reg, kind) in &defs {
        let c = cv.uf.find(node);
        if let Some(v) = cv.get(c) {
            if kind == DefKind::Entry {
                cv.vars[v as usize].param = reg;
            }
        }
    }
    Ok(Recovered {
        stmts: out_stmts,
        terms,
        vars: cv.vars,
        ir,
    })
}

/// The rewrite's register reads, consumed in first-pass order. TS: a register read with no reaching
/// node (`undefined`: registers 11..15) maps to one shared variable when it is the whole expression
/// (`rwUse`), and throws when nested (`rwLeaf`).
struct Rw<'a> {
    uses: &'a [(i32, u8)],
    use_vars: &'a [u32],
    cur: usize,
    err: bool,
}

impl Rw<'_> {
    fn top(&mut self, ir: &Ir) -> E {
        let v = self.use_vars[self.cur];
        self.cur += 1;
        ir.var(v)
    }
    fn rw(&mut self, ir: &Ir, pir: &Ir, e: E) -> E {
        if let Node::Reg(_) = pir.get(e) {
            return self.top(ir);
        }
        ir.import(pir, e, &mut |ir: &Ir, _e: E, n: Node| {
            if let Node::Reg(_) = n {
                if self.uses[self.cur].0 < 0 {
                    self.err = true;
                }
                Some(self.top(ir))
            } else {
                None
            }
        })
    }
}

const NO_VAR: u32 = u32::MAX;

/// classVar (union-find root -> variable) and the variables, in allocation order.
struct ClassVars {
    uf: Uf,
    class_var: Vec<u32>,
    /// the class of `undefined` nodes (see Rw)
    undef_class: u32,
    vars: Vec<VarInfo>,
}

impl ClassVars {
    fn get(&self, root: i32) -> Option<u32> {
        let v = if root < 0 {
            self.undef_class
        } else {
            self.class_var[root as usize]
        };
        (v != NO_VAR).then_some(v)
    }
    fn var_of(&mut self, node: i32, reg: i32) -> u32 {
        let c = if node < 0 { node } else { self.uf.find(node) };
        if let Some(v) = self.get(c) {
            return v;
        }
        let v = self.vars.len() as u32;
        self.vars.push(VarInfo {
            id: v,
            reg,
            param: -1,
            undef: false,
        });
        if c < 0 {
            self.undef_class = v;
        } else {
            self.class_var[c as usize] = v;
        }
        v
    }
}

pub fn apply_recovered(f: &mut Func, r: Recovered) {
    for ((b, ss), t) in f.blocks.iter_mut().zip(r.stmts).zip(r.terms) {
        b.stmts = ss;
        b.term = t;
    }
    f.vars = r.vars;
    f.ir = Some(r.ir);
}

/// recoverVars of every function (in `p.funcs` order); the first error stops.
pub fn recover_all(p: &mut Program) -> Result<(), String> {
    recover_some(p, &|_| true)
}

/// recoverVars of the functions `pick` selects (by index, in `p.funcs` order); the first error stops.
pub fn recover_some(p: &mut Program, pick: &dyn Fn(usize) -> bool) -> Result<(), String> {
    recover_some_par(p, pick, 1)
}

/// `recover_some` with the per-function recoveries on `threads` worker threads, applied in order.
pub fn recover_some_par(
    p: &mut Program,
    pick: &dyn Fn(usize) -> bool,
    threads: usize,
) -> Result<(), String> {
    let sigs = sigs_of(p);
    let picked: Vec<usize> = (0..p.funcs.len()).filter(|&fi| pick(fi)).collect();
    let rs = {
        let cx = Ctx::of(p);
        /// The program read by the recoveries: `recover_vars` only reads the program arena and the
        /// functions (it builds each function's IR in a new arena of its own), and nothing else holds the
        /// program while they run (`p` is borrowed mutably here): the arenas' interior mutability is not
        /// used, so sharing them read-only between the threads is sound.
        struct Shared<'a>(&'a Ctx<'a>, &'a [Sig], &'a Ir);
        unsafe impl Sync for Shared<'_> {}
        impl Shared<'_> {
            fn recover(&self, fi: usize) -> Result<Recovered, String> {
                recover_vars(self.0, self.1, self.2, fi)
            }
        }
        let sh = Shared(&cx, &sigs, &p.ir);
        sbpf_ir::par_map_n(picked.len(), threads, |k| sh.recover(picked[k]))
    };
    // (the first error in function order stops, as one at a time)
    for (fi, r) in picked.into_iter().zip(rs) {
        apply_recovered(&mut p.funcs[fi], r?);
    }
    Ok(())
}
