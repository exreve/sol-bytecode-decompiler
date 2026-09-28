//! SBF stack-passed arguments become ordinary parameters: the callee reads
//! arguments 5.. through `r5 - 0x1000 + 8k`; the caller stores them in its own frame's argument area.

use crate::stack::{fp_offset, js_as_u64, rebuild};
use sbpf_ir::fx::IndexMap;
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, Term, E, L};
use sbpf_program::{Func, VarInfo};

const AREA: f64 = -4096.0;

/// stmtExprs(s)
pub fn stmt_exprs(ir: &Ir, s: &Stmt) -> Vec<E> {
    match s {
        Stmt::Set { e, .. } | Stmt::Eval { e, .. } => vec![*e],
        Stmt::Store { addr, v, .. } => vec![*addr, *v],
        Stmt::Call { args, t, extra, .. } => {
            let mut v = ir.to_vec(*args);
            if let CallTarget::Ind { e } = t {
                v.push(*e);
            }
            if let Some(x) = extra {
                v.extend(ir.items(*x));
            }
            v
        }
        Stmt::Stores { addr, vals, .. } => {
            let mut v = vec![*addr];
            v.extend(ir.items(*vals));
            v
        }
        Stmt::Copy { dst, src, .. } => vec![*dst, *src],
        Stmt::Trap { .. } => vec![],
    }
}

fn is_mem_intrinsic(ir: &Ir, name: u32) -> bool {
    let n = ir.name(name);
    &*n == "memeq" || &*n == "keyeq"
}

fn is_int(x: f64) -> bool {
    x.is_finite() && x.fract() == 0.0
}

/// Number of stack arguments a function reads through r5, or 0 if it does not follow the pattern.
fn callee_stack_args(f: &Func) -> u32 {
    if f.nparams < 5 {
        return 0;
    }
    let Some(ev) = f.vars.iter().find(|v| v.param == 5) else {
        return 0;
    };
    let ev = ev.id;
    let ir = f.ir.as_ref().expect("variable IR");
    struct V<'a> {
        ir: &'a Ir,
        ev: u32,
        ok: bool,
        max: f64,
    }
    impl V<'_> {
        fn visit(&mut self, e: E) {
            if !self.ok {
                return;
            }
            let ir = self.ir;
            let n = ir.get(e);
            if let Node::Load { size, addr } = n {
                if let Some(o) = fp_offset(ir, addr, self.ev) {
                    let k = (o - AREA) / 8.0;
                    if size != 8 || !is_int(k) || k < 0.0 || k > 32.0 {
                        self.ok = false;
                        return;
                    }
                    self.max = self.max.max(k);
                    return;
                }
                self.visit(addr);
                return;
            }
            if n == Node::Var(self.ev) {
                self.ok = false;
                return;
            }
            match n {
                Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                    self.visit(a);
                    self.visit(b);
                }
                Node::Neg(a)
                | Node::Not(a)
                | Node::Ext { a, .. }
                | Node::Bswap { a, .. }
                | Node::Lnot(a) => self.visit(a),
                Node::Sel(c, a, b) => {
                    self.visit(c);
                    self.visit(a);
                    self.visit(b);
                }
                Node::Call(t, args) => {
                    for a in ir.items(args) {
                        self.visit(a);
                    }
                    if let CallTarget::Ind { e } = ir.target(t) {
                        self.visit(e);
                    }
                }
                Node::Fn(_, args) => {
                    for a in ir.items(args) {
                        self.visit(a);
                    }
                }
                _ => {}
            }
        }
    }
    let mut v = V {
        ir,
        ev,
        ok: true,
        max: -1.0,
    };
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Set { dst, .. } | Stmt::Call { dst, .. } if *dst == ev as i32 => return 0,
                Stmt::Store { addr, .. } if fp_offset(ir, *addr, ev).is_some() => return 0,
                _ => {}
            }
            for e in stmt_exprs(ir, s) {
                v.visit(e);
            }
        }
        match &b.term {
            Term::Br { c, .. } => v.visit(*c),
            Term::Ret { e: Some(e) } => v.visit(*e),
            _ => {}
        }
    }
    if v.ok && v.max >= 0.0 {
        v.max as u32 + 1
    } else {
        0
    }
}

/// `mapExprs(s, f)`: every expression of the statement through `f` (new statement).
fn map_exprs(ir: &Ir, s: Stmt, f: &mut dyn FnMut(E) -> E) -> Stmt {
    let fl = |l: L, f: &mut dyn FnMut(E) -> E| {
        let v: Vec<E> = ir.items(l).map(&mut *f).collect();
        ir.list(v)
    };
    match s {
        Stmt::Set { dst, e, pc } => Stmt::Set { dst, e: f(e), pc },
        Stmt::Store { size, addr, v, pc } => {
            let addr = f(addr);
            let v = f(v);
            Stmt::Store { size, addr, v, pc }
        }
        Stmt::Eval { e, pc } => Stmt::Eval { e: f(e), pc },
        Stmt::Call {
            dst,
            t,
            args,
            pc,
            extra,
        } => {
            let args = fl(args, f);
            let t = match t {
                CallTarget::Ind { e } => CallTarget::Ind { e: f(e) },
                t => t,
            };
            let extra = extra.map(|x| fl(x, f));
            Stmt::Call {
                dst,
                t,
                args,
                pc,
                extra,
            }
        }
        Stmt::Stores {
            size,
            addr,
            vals,
            pc,
        } => {
            let addr = f(addr);
            let vals = fl(vals, f);
            Stmt::Stores {
                size,
                addr,
                vals,
                pc,
            }
        }
        Stmt::Copy {
            dst,
            src,
            n,
            pc,
            rev,
        } => {
            let dst = f(dst);
            let src = f(src);
            Stmt::Copy {
                dst,
                src,
                n,
                pc,
                rev,
            }
        }
        s => s,
    }
}

/// rewriteStackArgs over `built` (indices into `funcs`, in the pipeline's order). Returns nstack
/// (function pc -> number of stack arguments), in discovery order.
pub fn rewrite_stack_args(funcs: &mut IndexMap<i64, Func>, built: &[usize]) -> IndexMap<i64, u32> {
    // 1) callee signatures
    let mut nstack: IndexMap<i64, u32> = IndexMap::default();
    for &fi in built {
        let n = callee_stack_args(&funcs[fi]);
        if n != 0 {
            nstack.insert(funcs[fi].pc, n);
        }
    }
    for (&pc, &n) in &nstack {
        let f = funcs.get_mut(&pc).expect("built function");
        let evi = f.vars.iter().position(|v| v.param == 5).unwrap();
        let ev = f.vars[evi].id;
        let mut pv = vec![];
        for k in 0..n {
            let id = f.vars.len() as u32;
            f.vars.push(VarInfo {
                id,
                reg: -3,
                param: 100 + k as i32,
                undef: false,
            });
            pv.push(id);
        }
        let ir = f.ir.as_ref().unwrap();
        let mut leaf = |ir: &Ir, _e: E, n: Node| -> Option<E> {
            if let Node::Load { addr, .. } = n {
                if let Some(o) = fp_offset(ir, addr, ev) {
                    return Some(ir.var(pv[((o - AREA) / 8.0) as usize]));
                }
            }
            None
        };
        for b in f.blocks.iter_mut() {
            let old = std::mem::take(&mut b.stmts);
            b.stmts = old
                .into_iter()
                .map(|s| map_exprs(ir, s, &mut |e| rebuild(ir, e, &mut leaf)))
                .collect();
            match &mut b.term {
                Term::Br { c, .. } => *c = rebuild(ir, *c, &mut leaf),
                Term::Ret { e: Some(e) } => *e = rebuild(ir, *e, &mut leaf),
                _ => {}
            }
        }
        f.vars[evi].param = -1; // r5 is no longer a parameter (it is unused now)
        f.stack_args = Some(n);
    }
    // 2) call sites (call statements and call expressions)
    for &fi in built {
        let f = &mut funcs[fi];
        let fpv = f.vars.iter().find(|v| v.param == 10).map(|v| v.id);
        let ir = f.ir.as_ref().unwrap();
        for b in f.blocks.iter_mut() {
            for i in 0..b.stmts.len() {
                let s = b.stmts[i].clone();
                b.stmts[i] = map_exprs_keep(ir, s, &mut |e| fix_expr(ir, &nstack, e));
                let Stmt::Call {
                    dst,
                    t: CallTarget::Fn { pc: tpc },
                    args,
                    pc,
                    extra,
                } = b.stmts[i].clone()
                else {
                    continue;
                };
                let Some(&n) = nstack.get(&tpc) else {
                    continue;
                };
                let r5 = (args.len > 4).then(|| ir.at(args, 4));
                let base = match (r5, fpv) {
                    (Some(r5), Some(fp)) => fp_offset(ir, r5, fp),
                    _ => None,
                };
                let mut vals = vec![];
                for k in 0..n {
                    let v = if let (Some(base), Some(fp)) = (base, fpv) {
                        let off = base + AREA + 8.0 * k as f64;
                        latest_store(ir, &b.stmts, i, fp, off).unwrap_or_else(|| {
                            let a = ir.var(fp);
                            let c = ir.c(js_as_u64(off));
                            let ad = ir.bin(BinOp::Add, a, c);
                            ir.load(8, ad)
                        })
                    } else if let Some(r5) = r5 {
                        let c = ir.c(js_as_u64(AREA + 8.0 * k as f64));
                        let ad = ir.bin(BinOp::Add, r5, c);
                        ir.load(8, ad)
                    } else {
                        ir.undef()
                    };
                    vals.push(v);
                }
                let mut na: Vec<E> = ir.items(args).take(4).collect();
                na.extend(vals);
                b.stmts[i] = Stmt::Call {
                    dst,
                    t: CallTarget::Fn { pc: tpc },
                    args: ir.list(na),
                    pc,
                    extra,
                };
            }
            match &mut b.term {
                Term::Br { c, .. } => *c = fix_expr(ir, &nstack, *c),
                Term::Ret { e: Some(e) } => *e = fix_expr(ir, &nstack, *e),
                _ => {}
            }
        }
    }
    // 3) outgoing argument-area stores that only fed rewritten calls are dead
    for &fi in built {
        elide_arg_area(&mut funcs[fi]);
    }
    nstack
}

/// Call expressions to stack-argument functions: arguments read from memory at the call.
/// Returns `e` itself when nothing changed (IR nodes are immutable).
fn fix_expr(ir: &Ir, nstack: &IndexMap<i64, u32>, e: E) -> E {
    let n = ir.get(e);
    if let Node::Call(t, args) = n {
        if let CallTarget::Fn { pc } = ir.target(t) {
            if let Some(&k) = nstack.get(&pc) {
                let args: Vec<E> = ir.items(args).map(|a| fix_expr(ir, nstack, a)).collect();
                let r5 = args.get(4).copied();
                let vals: Vec<E> = (0..k)
                    .map(|k| match r5 {
                        Some(r5) => {
                            let c = ir.c(js_as_u64(AREA + 8.0 * k as f64));
                            let ad = ir.bin(BinOp::Add, r5, c);
                            ir.load(8, ad)
                        }
                        None => ir.undef(),
                    })
                    .collect();
                let mut na: Vec<E> = args.iter().take(4).copied().collect();
                na.extend(vals);
                na.extend(args.iter().skip(5).copied());
                let l = ir.list(na);
                return ir.mk(Node::Call(t, l));
            }
        }
    }
    let f = |x: E| fix_expr(ir, nstack, x);
    match n {
        Node::Bin(op, a, b) => {
            let (na, nb) = (f(a), f(b));
            if na == a && nb == b {
                e
            } else {
                ir.mk(Node::Bin(op, na, nb))
            }
        }
        Node::Cmp(op, a, b) => {
            let (na, nb) = (f(a), f(b));
            if na == a && nb == b {
                e
            } else {
                ir.mk(Node::Cmp(op, na, nb))
            }
        }
        Node::Land(a, b) => {
            let (na, nb) = (f(a), f(b));
            if na == a && nb == b {
                e
            } else {
                ir.mk(Node::Land(na, nb))
            }
        }
        Node::Lor(a, b) => {
            let (na, nb) = (f(a), f(b));
            if na == a && nb == b {
                e
            } else {
                ir.mk(Node::Lor(na, nb))
            }
        }
        Node::Neg(a)
        | Node::Not(a)
        | Node::Lnot(a)
        | Node::Ext { a, .. }
        | Node::Bswap { a, .. } => {
            let na = f(a);
            if na == a {
                return e;
            }
            ir.mk(match n {
                Node::Neg(_) => Node::Neg(na),
                Node::Not(_) => Node::Not(na),
                Node::Lnot(_) => Node::Lnot(na),
                Node::Ext { signed, bits, .. } => Node::Ext {
                    signed,
                    bits,
                    a: na,
                },
                Node::Bswap { bits, .. } => Node::Bswap { bits, a: na },
                _ => unreachable!(),
            })
        }
        Node::Load { size, addr } => {
            let na = f(addr);
            if na == addr {
                e
            } else {
                ir.mk(Node::Load { size, addr: na })
            }
        }
        Node::Sel(c, a, b) => {
            let (nc, na, nb) = (f(c), f(a), f(b));
            if nc == c && na == a && nb == b {
                e
            } else {
                ir.mk(Node::Sel(nc, na, nb))
            }
        }
        Node::Call(t, args) => match keep_all(ir, args, &mut |x| fix_expr(ir, nstack, x)) {
            None => e,
            Some(l) => ir.mk(Node::Call(t, l)),
        },
        Node::Fn(name, args) => match keep_all(ir, args, &mut |x| fix_expr(ir, nstack, x)) {
            None => e,
            Some(l) => ir.mk(Node::Fn(name, l)),
        },
        _ => e,
    }
}

/// `keepAll`: the list mapped by `f`, or None when `f` returned every element unchanged.
fn keep_all(ir: &Ir, l: L, f: &mut dyn FnMut(E) -> E) -> Option<L> {
    let old: Vec<E> = ir.to_vec(l);
    let new: Vec<E> = old.iter().map(|&x| f(x)).collect();
    if new == old {
        None
    } else {
        Some(ir.list(new))
    }
}

/// `mapExprsKeep`: the statement itself when `f` returned every expression unchanged.
fn map_exprs_keep(ir: &Ir, s: Stmt, f: &mut dyn FnMut(E) -> E) -> Stmt {
    let same = match &s {
        Stmt::Set { e, .. } | Stmt::Eval { e, .. } => f(*e) == *e,
        Stmt::Store { addr, v, .. } => f(*addr) == *addr && f(*v) == *v,
        Stmt::Call { args, t, extra, .. } => {
            keep_all(ir, *args, f).is_none()
                && match t {
                    CallTarget::Ind { e } => f(*e) == *e,
                    _ => true,
                }
                && extra.is_none_or(|x| keep_all(ir, x, f).is_none())
        }
        Stmt::Stores { addr, vals, .. } => f(*addr) == *addr && keep_all(ir, *vals, f).is_none(),
        Stmt::Copy { dst, src, .. } => f(*dst) == *dst && f(*src) == *src,
        _ => true,
    };
    if same {
        s
    } else {
        map_exprs(ir, s, f)
    }
}

fn has_trap_or_mem(ir: &Ir, e: E, divrem: bool) -> bool {
    let mut t = false;
    ir.walk(e, &mut |_, n| match n {
        Node::Load { .. } | Node::Call(..) => t = true,
        Node::Fn(name, _) if is_mem_intrinsic(ir, name) => t = true,
        Node::Bin(op, ..) if divrem => {
            let s = op.as_str();
            if s.contains("div") || s.contains("rem") {
                t = true;
            }
        }
        _ => {}
    });
    t
}

fn elide_arg_area(f: &mut Func) {
    let Some(fp) = f.vars.iter().find(|v| v.param == 10).map(|v| v.id) else {
        return;
    };
    let ir = f.ir.as_ref().unwrap();
    let in_area = |o: Option<f64>| o.is_some_and(|o| o >= AREA && o < AREA + 256.0);
    let mut used = false;
    let mut has = false;
    fn scan(ir: &Ir, fp: u32, e: E, used: &mut bool) {
        if let Some(o) = fp_offset(ir, e, fp) {
            if o == 0.0 || (o >= AREA && o < AREA + 256.0) {
                *used = true;
            }
            return;
        }
        match ir.get(e) {
            Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                scan(ir, fp, a, used);
                scan(ir, fp, b, used);
            }
            Node::Neg(a)
            | Node::Not(a)
            | Node::Ext { a, .. }
            | Node::Bswap { a, .. }
            | Node::Lnot(a) => scan(ir, fp, a, used),
            Node::Load { addr, .. } => scan(ir, fp, addr, used),
            Node::Sel(c, a, b) => {
                scan(ir, fp, c, used);
                scan(ir, fp, a, used);
                scan(ir, fp, b, used);
            }
            Node::Call(t, args) => {
                for a in ir.items(args) {
                    scan(ir, fp, a, used);
                }
                if let CallTarget::Ind { e } = ir.target(t) {
                    scan(ir, fp, e, used);
                }
            }
            Node::Fn(_, args) => {
                for a in ir.items(args) {
                    scan(ir, fp, a, used);
                }
            }
            _ => {}
        }
    }
    for b in &f.blocks {
        for s in &b.stmts {
            match s {
                Stmt::Store { addr, v, .. } if in_area(fp_offset(ir, *addr, fp)) => {
                    has = true;
                    scan(ir, fp, *v, &mut used);
                    continue;
                }
                Stmt::Stores { addr, vals, .. } if in_area(fp_offset(ir, *addr, fp)) => {
                    has = true;
                    for v in ir.items(*vals) {
                        scan(ir, fp, v, &mut used);
                    }
                    continue;
                }
                _ => {}
            }
            for e in stmt_exprs(ir, s) {
                scan(ir, fp, e, &mut used);
            }
        }
        match &b.term {
            Term::Br { c, .. } => scan(ir, fp, *c, &mut used),
            Term::Ret { e: Some(e) } => scan(ir, fp, *e, &mut used),
            _ => {}
        }
    }
    if !has || used {
        return;
    }
    for b in f.blocks.iter_mut() {
        let old = std::mem::take(&mut b.stmts);
        for s in old {
            let (vals, pc) = match &s {
                Stmt::Store { addr, v, pc, .. } if in_area(fp_offset(ir, *addr, fp)) => {
                    (vec![*v], *pc)
                }
                Stmt::Stores { addr, vals, pc, .. } if in_area(fp_offset(ir, *addr, fp)) => {
                    (ir.to_vec(*vals), *pc)
                }
                _ => {
                    b.stmts.push(s);
                    continue;
                }
            };
            // keep evaluation of anything that could trap
            for v in vals {
                if has_trap_or_mem(ir, v, true) {
                    b.stmts.push(Stmt::Eval { e: v, pc });
                }
            }
        }
    }
    f.arg_area_elided = Some(true);
}

/// Value stored at fp+off by the latest store before stmts[i], if still valid at i.
fn latest_store(ir: &Ir, stmts: &[Stmt], i: usize, fp: u32, off: f64) -> Option<E> {
    let mut defined: Vec<u32> = vec![];
    let pure_now = |e: E, defined: &[u32]| {
        let mut ok = true;
        ir.walk(e, &mut |_, n| match n {
            Node::Load { .. } | Node::Call(..) => ok = false,
            Node::Fn(name, _) if is_mem_intrinsic(ir, name) => ok = false,
            Node::Var(id) if defined.contains(&id) => ok = false,
            _ => {}
        });
        ok
    };
    for j in (0..i).rev() {
        let t = &stmts[j];
        if let Stmt::Store {
            size: 8, addr, v, ..
        } = t
        {
            if fp_offset(ir, *addr, fp) == Some(off) {
                return pure_now(*v, &defined).then_some(*v);
            }
        }
        if let Stmt::Stores {
            size, addr, vals, ..
        } = t
        {
            if let Some(o0) = fp_offset(ir, *addr, fp) {
                let idx = (off - o0) / *size as f64;
                if *size == 8 && is_int(idx) && idx >= 0.0 && idx < vals.len as f64 {
                    let x = ir.at(*vals, idx as u32);
                    return pure_now(x, &defined).then_some(x);
                }
            }
        }
        if matches!(t, Stmt::Call { .. } | Stmt::Copy { .. } | Stmt::Trap { .. }) {
            return None;
        }
        if let Stmt::Store { addr, .. } | Stmt::Stores { addr, .. } = t {
            // another direct frame store elsewhere is fine; anything else might alias
            let o = fp_offset(ir, *addr, fp)?;
            let sz = match t {
                Stmt::Store { size, .. } => *size as f64,
                Stmt::Stores { size, vals, .. } => *size as f64 * vals.len as f64,
                _ => unreachable!(),
            };
            if o < off + 8.0 && off < o + sz {
                return None;
            }
        }
        if let Stmt::Set { dst, e, .. } = t {
            if *dst >= 0 {
                defined.push(*dst as u32);
            }
            let mut c = false;
            ir.walk(*e, &mut |_, n| {
                if let Node::Call(..) = n {
                    c = true;
                }
            });
            if c {
                return None;
            }
        }
    }
    None
}
