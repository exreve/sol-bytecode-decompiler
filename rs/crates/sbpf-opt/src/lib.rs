//! Stage 3: the per-function optimizer. Ports `src/simplify.ts` (expression simplification and the
//! `optimizeFunc` pass loop), `src/cfgopt.ts`, `src/ifconv.ts`, `src/idioms.ts`, `src/compact.ts`, and
//! the per-function phase of `src/decompile.ts` ([`phase2`]).
//!
//! Every pass works on one function: its blocks ([`Func`]) and its expression arena, held by an
//! [`Fx`] while the function is being optimized. Object identity in the TS code (`n !== s` after a
//! rewrite, "the pass returned the same object") is id equality here: every TS object creation is a
//! new arena node, every reuse is the same id. The TS per-statement caches (`StmtMeta`: `stmtInfo`,
//! the `simple` mark) are pure functions of a statement's expressions; they are kept per expression
//! id instead (nodes are immutable, so a cached answer for an id never goes stale).

use sbpf_elf::Image;
use sbpf_ir::{BinOp, CallTarget, CmpOp, Ir, Node, Stmt, Term, E, L};
use sbpf_program::{Block, Func};
use std::rc::Rc;

pub mod cfgopt;
pub mod compact;
pub mod idioms;
pub mod ifconv;
pub mod simplify;

pub use simplify::optimize_func;

pub const LOAD: u8 = 1;
pub const CALL: u8 = 2;
pub const TRAP: u8 = 4;
pub const M64: u64 = u64::MAX;

/// Intrinsic helper names (`src/ir.ts`: INTRINSICS, MemIntrinsic, EffIntrinsic).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Intr {
    Popcount,
    Clz,
    Ctz,
    Rotl,
    Min,
    Max,
    Smin,
    Smax,
    SatSub,
    Memeq,
    Keyeq,
    RcInc,
    RcDec,
    RcRelease,
    Other,
}

const INTRS: [(Intr, &str); 14] = [
    (Intr::Popcount, "popcount"),
    (Intr::Clz, "clz"),
    (Intr::Ctz, "ctz"),
    (Intr::Rotl, "rotl"),
    (Intr::Min, "min"),
    (Intr::Max, "max"),
    (Intr::Smin, "smin"),
    (Intr::Smax, "smax"),
    (Intr::SatSub, "sat_sub"),
    (Intr::Memeq, "memeq"),
    (Intr::Keyeq, "keyeq"),
    (Intr::RcInc, "rc_inc"),
    (Intr::RcDec, "rc_dec"),
    (Intr::RcRelease, "rc_release"),
];

impl Intr {
    fn of(s: &str) -> Intr {
        INTRS
            .iter()
            .find(|(_, n)| *n == s)
            .map_or(Intr::Other, |x| x.0)
    }
    fn name(self) -> &'static str {
        INTRS.iter().find(|x| x.0 == self).unwrap().1
    }
    /// `name in INTRINSICS` (pure, total, foldable)
    fn pure_fn(self) -> bool {
        !matches!(
            self,
            Intr::Memeq | Intr::Keyeq | Intr::RcInc | Intr::RcDec | Intr::RcRelease | Intr::Other
        )
    }
    pub fn is_mem(self) -> bool {
        matches!(self, Intr::Memeq | Intr::Keyeq)
    }
}

// ---------------- reference semantics (src/ir.ts) ----------------

/// evalBin; `None` = Trap.
pub fn eval_bin(op: BinOp, a: u64, b: u64) -> Option<u64> {
    use BinOp::*;
    Some(match op {
        Add => a.wrapping_add(b),
        Sub => a.wrapping_sub(b),
        Mul => a.wrapping_mul(b),
        Udiv => a.checked_div(b)?,
        Urem => a.checked_rem(b)?,
        Sdiv | Srem => {
            if b == 0 || (a as i64 == i64::MIN && b as i64 == -1) {
                return None;
            }
            let (x, y) = (a as i64, b as i64);
            (if op == Sdiv { x / y } else { x % y }) as u64
        }
        Sdiv32 | Srem32 => {
            let (x, y) = (a as u32 as i32, b as u32 as i32);
            if y == 0 || (x == i32::MIN && y == -1) {
                return None;
            }
            (if op == Sdiv32 { x / y } else { x % y }) as u32 as u64
        }
        And => a & b,
        Or => a | b,
        Xor => a ^ b,
        Shl => a << (b & 63),
        Lshr => a >> (b & 63),
        Ashr => ((a as i64) >> (b & 63)) as u64,
        Uhmul => ((a as u128 * b as u128) >> 64) as u64,
        Shmul => ((a as i64 as i128 * b as i64 as i128) >> 64) as u64,
    })
}

pub fn eval_cmp(op: CmpOp, a: u64, b: u64) -> bool {
    use CmpOp::*;
    let (x, y) = (a as i64, b as i64);
    match op {
        Eq => a == b,
        Ne => a != b,
        Ugt => a > b,
        Uge => a >= b,
        Ult => a < b,
        Ule => a <= b,
        Sgt => x > y,
        Sge => x >= y,
        Slt => x < y,
        Sle => x <= y,
        Set => a & b != 0,
    }
}

pub fn mask(bits: u32) -> u64 {
    if bits >= 64 {
        M64
    } else {
        (1u64 << bits) - 1
    }
}

pub fn eval_ext(signed: bool, bits: u8, a: u64) -> u64 {
    let b = bits as u32;
    if signed {
        let sh = 64 - b;
        (((a << sh) as i64) >> sh) as u64
    } else {
        a & mask(b)
    }
}

pub fn eval_bswap(bits: u8, a: u64) -> u64 {
    let mut v = a & mask(bits as u32);
    let mut r = 0u64;
    for _ in 0..bits / 8 {
        r = (r << 8) | (v & 0xff);
        v >>= 8;
    }
    r
}

fn eval_intr(n: Intr, a: &[u64]) -> u64 {
    let i = |x: u64| x as i64;
    match n {
        Intr::Popcount => a[0].count_ones() as u64,
        Intr::Clz => a[0].leading_zeros() as u64,
        Intr::Ctz => a[0].trailing_zeros() as u64,
        Intr::Rotl => a[0].rotate_left((a[1] & 63) as u32),
        Intr::Min => a[0].min(a[1]),
        Intr::Max => a[0].max(a[1]),
        Intr::Smin => {
            if i(a[0]) < i(a[1]) {
                a[0]
            } else {
                a[1]
            }
        }
        Intr::Smax => {
            if i(a[0]) > i(a[1]) {
                a[0]
            } else {
                a[1]
            }
        }
        Intr::SatSub => {
            if a[0] >= a[1] {
                a[0] - a[1]
            } else {
                0
            }
        }
        _ => unreachable!(),
    }
}

pub fn neg_cmp(op: CmpOp) -> Option<CmpOp> {
    use CmpOp::*;
    Some(match op {
        Eq => Ne,
        Ne => Eq,
        Ugt => Ule,
        Uge => Ult,
        Ult => Uge,
        Ule => Ugt,
        Sgt => Sle,
        Sge => Slt,
        Slt => Sge,
        Sle => Sgt,
        Set => return None,
    })
}

pub fn swap_cmp(op: CmpOp) -> CmpOp {
    use CmpOp::*;
    match op {
        Ugt => Ult,
        Uge => Ule,
        Ult => Ugt,
        Ule => Uge,
        Sgt => Slt,
        Sge => Sle,
        Slt => Sgt,
        Sle => Sge,
        x => x,
    }
}

pub fn is_div_op(op: BinOp) -> bool {
    use BinOp::*;
    matches!(op, Udiv | Urem | Sdiv | Srem | Sdiv32 | Srem32)
}

/// bitlen: number of significant bits (0 for 0)
pub fn bitlen(v: u64) -> u32 {
    64 - v.leading_zeros()
}

/// The expression-valued fields of a statement, in stmtExprs order.
pub fn stmt_exprs(ir: &Ir, s: &Stmt, out: &mut Vec<E>) {
    out.clear();
    match s {
        Stmt::Set { e, .. } | Stmt::Eval { e, .. } => out.push(*e),
        Stmt::Store { addr, v, .. } => {
            out.push(*addr);
            out.push(*v);
        }
        Stmt::Call { args, t, extra, .. } => {
            out.extend(ir.items(*args));
            if let CallTarget::Ind { e } = t {
                out.push(*e);
            }
            if let Some(x) = extra {
                out.extend(ir.items(*x));
            }
        }
        Stmt::Stores { addr, vals, .. } => {
            out.push(*addr);
            out.extend(ir.items(*vals));
        }
        Stmt::Copy { dst, src, .. } => {
            out.push(*dst);
            out.push(*src);
        }
        Stmt::Trap { .. } => {}
    }
}

/// `(s.k === 'set' || s.k === 'call') && s.dst >= 0`: the variable a statement defines.
#[inline]
pub fn def_of(s: &Stmt) -> Option<u32> {
    match s {
        Stmt::Set { dst, .. } | Stmt::Call { dst, .. } if *dst >= 0 => Some(*dst as u32),
        _ => None,
    }
}

/// The expression of a `br` / `ret` terminator (what the passes read of a terminator).
#[inline]
pub fn term_expr(t: &Term) -> Option<E> {
    match t {
        Term::Br { c, .. } => Some(*c),
        Term::Ret { e } => *e,
        _ => None,
    }
}

pub fn dead_trap() -> Term {
    thread_local!(static DEAD: Rc<str> = Rc::from("dead"));
    Term::Trap {
        msg: DEAD.with(|d| d.clone()),
    }
}

/// Per-function optimizer state: the function's arena plus caches keyed by expression id.
pub struct Fx<'i> {
    pub ir: Ir,
    /// read-only program memory for load folding (setFoldImage)
    pub img: Option<&'i Image<'i>>,
    /// per node: 0 unknown, else 0x80 | side-effect flags
    fxc: Vec<u8>,
    /// per node: simplifyExpr(e) === e is known
    stable: Vec<bool>,
    /// per node: 0, else 1 + index into `infos` (variable occurrences of a statement expression)
    info_ix: Vec<u32>,
    infos: Vec<(u32, u32)>,
    ivars: Vec<u32>,
    /// per name index: 0 unknown, else 1 + Intr
    names: Vec<u8>,
    /// name index of each intrinsic created here (u32::MAX: none yet)
    intr_ix: [u32; 15],
    pub(crate) scratch: Vec<E>,
}

impl<'i> Fx<'i> {
    pub fn new(ir: Ir, img: Option<&'i Image<'i>>) -> Self {
        Fx {
            ir,
            img,
            fxc: vec![],
            stable: vec![],
            info_ix: vec![],
            infos: vec![],
            ivars: vec![],
            names: vec![],
            intr_ix: [u32::MAX; 15],
            scratch: vec![],
        }
    }

    #[inline]
    pub fn node(&self, e: E) -> Node {
        self.ir.get(e)
    }
    #[inline]
    pub fn c(&self, v: u64) -> E {
        self.ir.c(v)
    }
    #[inline]
    pub fn cv(&self, e: E) -> Option<u64> {
        match self.ir.get(e) {
            Node::Const(v) => Some(v),
            _ => None,
        }
    }
    #[inline]
    pub fn is_c(&self, e: E, v: u64) -> bool {
        self.cv(e) == Some(v)
    }

    pub fn intr(&mut self, name: u32) -> Intr {
        let i = name as usize;
        if i >= self.names.len() {
            self.names.resize(i + 1, 0);
        }
        if self.names[i] == 0 {
            let k = self.ir.with_name(name, Intr::of);
            self.names[i] = 1 + INTRS.iter().position(|x| x.0 == k).unwrap_or(14) as u8;
        }
        let k = self.names[i] - 1;
        if k as usize >= INTRS.len() {
            Intr::Other
        } else {
            INTRS[k as usize].0
        }
    }

    /// A new `fn` expression node.
    pub fn mk_fn(&mut self, n: Intr, args: &[E]) -> E {
        let k = INTRS.iter().position(|x| x.0 == n).unwrap();
        if self.intr_ix[k] == u32::MAX {
            self.intr_ix[k] = self.ir.mk_name(Rc::from(n.name()));
        }
        let l = self.ir.list(args.iter().copied());
        self.ir.mk(Node::Fn(self.intr_ix[k], l))
    }

    /// hasSideEffectsOrMem(e) as LOAD | CALL | TRAP flags (memoized per node).
    pub fn fx(&mut self, e: E) -> u8 {
        let i = e.0 as usize;
        if let Some(&c) = self.fxc.get(i) {
            if c != 0 {
                return c & 7;
            }
        }
        let r = match self.ir.get(e) {
            Node::Load { addr, .. } => LOAD | TRAP | self.fx(addr),
            Node::Call(t, args) => {
                let mut r = CALL;
                if let CallTarget::Ind { e } = self.ir.target(t) {
                    r |= self.fx(e);
                }
                for k in 0..args.len {
                    r |= self.fx(self.ir.at(args, k));
                }
                r
            }
            Node::Bin(op, a, b) => {
                let t = if is_div_op(op) && !self.safe_divisor(op, b) {
                    TRAP
                } else {
                    0
                };
                t | self.fx(a) | self.fx(b)
            }
            Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => self.fx(a) | self.fx(b),
            Node::Neg(a)
            | Node::Not(a)
            | Node::Lnot(a)
            | Node::Ext { a, .. }
            | Node::Bswap { a, .. } => self.fx(a),
            Node::Sel(c, a, b) => self.fx(c) | self.fx(a) | self.fx(b),
            Node::Fn(name, args) => {
                let mut r = match self.intr(name) {
                    Intr::Memeq | Intr::Keyeq => LOAD | TRAP,
                    Intr::RcInc | Intr::RcDec | Intr::RcRelease => LOAD | TRAP | CALL,
                    _ => 0,
                };
                for k in 0..args.len {
                    r |= self.fx(self.ir.at(args, k));
                }
                r
            }
            _ => 0,
        };
        if i >= self.fxc.len() {
            self.fxc.resize(self.ir.len().max(i + 1), 0);
        }
        self.fxc[i] = 0x80 | r;
        r
    }
    #[inline]
    pub fn is_pure(&mut self, e: E) -> bool {
        self.fx(e) == 0
    }

    /// safeDivisor: constant divisor, non-zero (in the operand width), not -1 for signed ops.
    pub fn safe_divisor(&self, op: BinOp, b: E) -> bool {
        let Some(v) = self.cv(b) else { return false };
        match op {
            BinOp::Sdiv32 | BinOp::Srem32 => v as u32 != 0 && v as u32 as i32 != -1,
            BinOp::Sdiv | BinOp::Srem => v != 0 && v != M64,
            _ => v != 0,
        }
    }

    pub(crate) fn is_stable(&self, e: E) -> bool {
        self.stable.get(e.0 as usize).copied().unwrap_or(false)
    }
    pub(crate) fn set_stable(&mut self, e: E) {
        let i = e.0 as usize;
        if i >= self.stable.len() {
            self.stable.resize(self.ir.len().max(i + 1), false);
        }
        self.stable[i] = true;
    }

    /// The variable occurrences of `e` (pre-order, with multiplicity), cached per id.
    fn vars_range(&mut self, e: E) -> (u32, u32) {
        let i = e.0 as usize;
        if let Some(&k) = self.info_ix.get(i) {
            if k != 0 {
                return self.infos[k as usize - 1];
            }
        }
        let start = self.ivars.len() as u32;
        let ir = &self.ir;
        let iv = &mut self.ivars;
        ir.walk(e, &mut |_, n| {
            if let Node::Var(id) = n {
                iv.push(id);
            }
        });
        let r = (start, self.ivars.len() as u32 - start);
        if i >= self.info_ix.len() {
            self.info_ix.resize(self.ir.len().max(i + 1), 0);
        }
        self.infos.push(r);
        self.info_ix[i] = self.infos.len() as u32;
        r
    }

    /// stmtInfo(s): calls `f` on every variable occurrence of the statement's expressions (stmtExprs
    /// order) and returns the union of their side-effect flags.
    pub fn sinfo(&mut self, s: &Stmt, mut f: impl FnMut(u32)) -> u8 {
        let mut es = std::mem::take(&mut self.scratch);
        stmt_exprs(&self.ir, s, &mut es);
        let mut fl = 0;
        for &e in &es {
            let (a, n) = self.vars_range(e);
            for k in a..a + n {
                f(self.ivars[k as usize]);
            }
            fl |= self.fx(e);
        }
        self.scratch = es;
        fl
    }
    /// stmtInfo(s) side-effect flags only.
    pub fn sflags(&mut self, s: &Stmt) -> u8 {
        let mut es = std::mem::take(&mut self.scratch);
        stmt_exprs(&self.ir, s, &mut es);
        let mut fl = 0;
        for &e in &es {
            fl |= self.fx(e);
        }
        self.scratch = es;
        fl
    }
    /// The statement's variable occurrences as a vector.
    pub fn svars(&mut self, s: &Stmt) -> Vec<u32> {
        let mut v = vec![];
        self.sinfo(s, |x| v.push(x));
        v
    }
    /// Occurrences of variable `v` in the statement.
    pub fn count_in(&mut self, s: &Stmt, v: u32) -> i32 {
        let mut n = 0;
        self.sinfo(s, |x| n += (x == v) as i32);
        n
    }
    /// Calls `f` on every variable occurrence of `e` (walkExpr order).
    pub fn evars(&mut self, e: E, mut f: impl FnMut(u32)) {
        let (a, n) = self.vars_range(e);
        for k in a..a + n {
            f(self.ivars[k as usize]);
        }
    }
    pub fn uses_var(&mut self, e: E, v: u32) -> bool {
        let mut h = false;
        self.evars(e, |x| h |= x == v);
        h
    }

    /// exprEq: structural equality (calls are never equal).
    pub fn expr_eq(&self, a: E, b: E) -> bool {
        let (x, y) = (self.ir.get(a), self.ir.get(b));
        match (x, y) {
            (Node::Const(p), Node::Const(q)) => p == q,
            (Node::Var(p), Node::Var(q)) => p == q,
            (Node::Reg(p), Node::Reg(q)) => p == q,
            (Node::Bin(o, a1, b1), Node::Bin(p, a2, b2)) => {
                o == p && self.expr_eq(a1, a2) && self.expr_eq(b1, b2)
            }
            (Node::Cmp(o, a1, b1), Node::Cmp(p, a2, b2)) => {
                o == p && self.expr_eq(a1, a2) && self.expr_eq(b1, b2)
            }
            (Node::Land(a1, b1), Node::Land(a2, b2)) | (Node::Lor(a1, b1), Node::Lor(a2, b2)) => {
                self.expr_eq(a1, a2) && self.expr_eq(b1, b2)
            }
            (Node::Neg(p), Node::Neg(q))
            | (Node::Not(p), Node::Not(q))
            | (Node::Lnot(p), Node::Lnot(q)) => self.expr_eq(p, q),
            (
                Node::Ext {
                    signed: s1,
                    bits: b1,
                    a: p,
                },
                Node::Ext {
                    signed: s2,
                    bits: b2,
                    a: q,
                },
            ) => s1 == s2 && b1 == b2 && self.expr_eq(p, q),
            (Node::Bswap { bits: b1, a: p }, Node::Bswap { bits: b2, a: q }) => {
                b1 == b2 && self.expr_eq(p, q)
            }
            (
                Node::Load {
                    size: s1,
                    addr: p,
                },
                Node::Load {
                    size: s2,
                    addr: q,
                },
            ) => s1 == s2 && self.expr_eq(p, q),
            (Node::Sel(c1, a1, b1), Node::Sel(c2, a2, b2)) => {
                self.expr_eq(c1, c2) && self.expr_eq(a1, a2) && self.expr_eq(b1, b2)
            }
            (Node::Fn(n1, l1), Node::Fn(n2, l2)) => {
                let same_name =
                    n1 == n2 || self.ir.with_name(n1, |p| self.ir.with_name(n2, |q| p == q));
                same_name
                    && l1.len == l2.len
                    && (0..l1.len).all(|k| self.expr_eq(self.ir.at(l1, k), self.ir.at(l2, k)))
            }
            (Node::Undef, Node::Undef) => true,
            _ => false,
        }
    }

    /// Structural equality as JSON.stringify sees it (calls included): idioms.ts `sameBody`.
    pub fn json_eq(&self, a: E, b: E) -> bool {
        if a == b {
            return true;
        }
        match (self.ir.get(a), self.ir.get(b)) {
            (Node::Call(t1, l1), Node::Call(t2, l2)) => {
                let tq = match (self.ir.target(t1), self.ir.target(t2)) {
                    (CallTarget::Ind { e: x }, CallTarget::Ind { e: y }) => self.json_eq(x, y),
                    (x, y) => x == y,
                };
                tq && self.list_json_eq(l1, l2)
            }
            (Node::Bin(o, a1, b1), Node::Bin(p, a2, b2)) => {
                o == p && self.json_eq(a1, a2) && self.json_eq(b1, b2)
            }
            (Node::Cmp(o, a1, b1), Node::Cmp(p, a2, b2)) => {
                o == p && self.json_eq(a1, a2) && self.json_eq(b1, b2)
            }
            (Node::Land(a1, b1), Node::Land(a2, b2)) | (Node::Lor(a1, b1), Node::Lor(a2, b2)) => {
                self.json_eq(a1, a2) && self.json_eq(b1, b2)
            }
            (Node::Neg(p), Node::Neg(q))
            | (Node::Not(p), Node::Not(q))
            | (Node::Lnot(p), Node::Lnot(q)) => self.json_eq(p, q),
            (
                Node::Ext {
                    signed: s1,
                    bits: b1,
                    a: p,
                },
                Node::Ext {
                    signed: s2,
                    bits: b2,
                    a: q,
                },
            ) => s1 == s2 && b1 == b2 && self.json_eq(p, q),
            (Node::Bswap { bits: b1, a: p }, Node::Bswap { bits: b2, a: q }) => {
                b1 == b2 && self.json_eq(p, q)
            }
            (
                Node::Load {
                    size: s1,
                    addr: p,
                },
                Node::Load {
                    size: s2,
                    addr: q,
                },
            ) => s1 == s2 && self.json_eq(p, q),
            (Node::Sel(c1, a1, b1), Node::Sel(c2, a2, b2)) => {
                self.json_eq(c1, c2) && self.json_eq(a1, a2) && self.json_eq(b1, b2)
            }
            (Node::Fn(n1, l1), Node::Fn(n2, l2)) => {
                self.ir.with_name(n1, |p| self.ir.with_name(n2, |q| p == q))
                    && self.list_json_eq(l1, l2)
            }
            (x, y) => x == y,
        }
    }
    pub fn list_json_eq(&self, a: L, b: L) -> bool {
        a.len == b.len && (0..a.len).all(|k| self.json_eq(self.ir.at(a, k), self.ir.at(b, k)))
    }

    /// exprSize
    pub fn size(&self, e: E) -> usize {
        let mut n = 0;
        self.ir.walk(e, &mut |_, _| n += 1);
        n
    }
    /// exprSize(e) <= n without walking more than n + 1 nodes.
    pub fn size_at_most(&self, e: E, n: i64) -> bool {
        fn go(ir: &Ir, x: E, left: &mut i64) -> bool {
            *left -= 1;
            if *left < 0 {
                return false;
            }
            match ir.get(x) {
                Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                    go(ir, a, left) && go(ir, b, left)
                }
                Node::Neg(a)
                | Node::Not(a)
                | Node::Lnot(a)
                | Node::Ext { a, .. }
                | Node::Bswap { a, .. } => go(ir, a, left),
                Node::Load { addr, .. } => go(ir, addr, left),
                Node::Sel(c, a, b) => go(ir, c, left) && go(ir, a, left) && go(ir, b, left),
                Node::Call(t, args) => {
                    (match ir.target(t) {
                        CallTarget::Ind { e } => go(ir, e, left),
                        _ => true,
                    }) && (0..args.len).all(|k| go(ir, ir.at(args, k), left))
                }
                Node::Fn(_, args) => (0..args.len).all(|k| go(ir, ir.at(args, k), left)),
                _ => true,
            }
        }
        let mut left = n;
        go(&self.ir, e, &mut left)
    }

    pub fn has_undef(&self, e: E) -> bool {
        let mut u = false;
        self.ir.walk(e, &mut |_, n| u |= matches!(n, Node::Undef));
        u
    }

    /// mapExpr(e, f): rebuilds every composite node bottom-up (new nodes), then applies `f` to each
    /// node (children already mapped).
    pub fn map_expr(&mut self, e: E, f: &mut dyn FnMut(&mut Fx<'i>, E) -> E) -> E {
        let n = match self.ir.get(e) {
            Node::Bin(op, a, b) => {
                let a = self.map_expr(a, f);
                let b = self.map_expr(b, f);
                self.ir.mk(Node::Bin(op, a, b))
            }
            Node::Neg(a) => {
                let a = self.map_expr(a, f);
                self.ir.mk(Node::Neg(a))
            }
            Node::Not(a) => {
                let a = self.map_expr(a, f);
                self.ir.mk(Node::Not(a))
            }
            Node::Lnot(a) => {
                let a = self.map_expr(a, f);
                self.ir.mk(Node::Lnot(a))
            }
            Node::Ext { signed, bits, a } => {
                let a = self.map_expr(a, f);
                self.ir.mk(Node::Ext { signed, bits, a })
            }
            Node::Bswap { bits, a } => {
                let a = self.map_expr(a, f);
                self.ir.mk(Node::Bswap { bits, a })
            }
            Node::Load { size, addr } => {
                let addr = self.map_expr(addr, f);
                self.ir.mk(Node::Load { size, addr })
            }
            Node::Cmp(op, a, b) => {
                let a = self.map_expr(a, f);
                let b = self.map_expr(b, f);
                self.ir.mk(Node::Cmp(op, a, b))
            }
            Node::Land(a, b) => {
                let a = self.map_expr(a, f);
                let b = self.map_expr(b, f);
                self.ir.mk(Node::Land(a, b))
            }
            Node::Lor(a, b) => {
                let a = self.map_expr(a, f);
                let b = self.map_expr(b, f);
                self.ir.mk(Node::Lor(a, b))
            }
            Node::Sel(c, a, b) => {
                let c = self.map_expr(c, f);
                let a = self.map_expr(a, f);
                let b = self.map_expr(b, f);
                self.ir.mk(Node::Sel(c, a, b))
            }
            Node::Call(t, args) => {
                let t = match self.ir.target(t) {
                    CallTarget::Ind { e } => {
                        let e = self.map_expr(e, f);
                        self.ir.mk_target(CallTarget::Ind { e })
                    }
                    _ => t,
                };
                let v: Vec<E> = (0..args.len)
                    .map(|k| {
                        let a = self.ir.at(args, k);
                        self.map_expr(a, f)
                    })
                    .collect();
                let l = self.ir.list(v);
                self.ir.mk(Node::Call(t, l))
            }
            Node::Fn(name, args) => {
                let v: Vec<E> = (0..args.len)
                    .map(|k| {
                        let a = self.ir.at(args, k);
                        self.map_expr(a, f)
                    })
                    .collect();
                let l = self.ir.list(v);
                self.ir.mk(Node::Fn(name, l))
            }
            _ => e,
        };
        f(self, n)
    }

    /// mapStmtExprs(s, f): a new statement with every expression mapped (always rebuilt lists).
    pub fn map_stmt(&mut self, s: &Stmt, f: &mut dyn FnMut(&mut Fx<'i>, E) -> E) -> Stmt {
        match s {
            Stmt::Set { dst, e, pc } => Stmt::Set {
                dst: *dst,
                e: f(self, *e),
                pc: *pc,
            },
            Stmt::Store { size, addr, v, pc } => {
                let addr = f(self, *addr);
                let v = f(self, *v);
                Stmt::Store {
                    size: *size,
                    addr,
                    v,
                    pc: *pc,
                }
            }
            Stmt::Eval { e, pc } => Stmt::Eval {
                e: f(self, *e),
                pc: *pc,
            },
            Stmt::Call {
                dst,
                t,
                args,
                pc,
                extra,
            } => {
                let args = self.map_list(*args, f);
                let t = match t {
                    CallTarget::Ind { e } => CallTarget::Ind { e: f(self, *e) },
                    t => t.clone(),
                };
                let extra = extra.map(|x| self.map_list(x, f));
                Stmt::Call {
                    dst: *dst,
                    t,
                    args,
                    pc: *pc,
                    extra,
                }
            }
            Stmt::Stores {
                size,
                addr,
                vals,
                pc,
            } => {
                let addr = f(self, *addr);
                let vals = self.map_list(*vals, f);
                Stmt::Stores {
                    size: *size,
                    addr,
                    vals,
                    pc: *pc,
                }
            }
            Stmt::Copy {
                dst,
                src,
                n,
                pc,
                rev,
            } => {
                let dst = f(self, *dst);
                let src = f(self, *src);
                Stmt::Copy {
                    dst,
                    src,
                    n: *n,
                    pc: *pc,
                    rev: *rev,
                }
            }
            Stmt::Trap { .. } => s.clone(),
        }
    }
    pub fn map_list(&mut self, l: L, f: &mut dyn FnMut(&mut Fx<'i>, E) -> E) -> L {
        let v: Vec<E> = (0..l.len)
            .map(|k| {
                let a = self.ir.at(l, k);
                f(self, a)
            })
            .collect();
        self.ir.list(v)
    }
    /// mapAll / subAll: the same list when `f` returned every element unchanged.
    pub fn map_list_keep(&mut self, l: L, f: &mut dyn FnMut(&mut Fx<'i>, E) -> E) -> L {
        let mut out: Option<Vec<E>> = None;
        for k in 0..l.len {
            let a = self.ir.at(l, k);
            let n = f(self, a);
            if n != a {
                out.get_or_insert_with(|| self.ir.to_vec(l))[k as usize] = n;
            }
        }
        match out {
            Some(v) => self.ir.list(v),
            None => l,
        }
    }
    /// mapStmtExprsKeep: `None` when `f` returned every expression unchanged.
    pub fn map_stmt_keep(
        &mut self,
        s: &Stmt,
        f: &mut dyn FnMut(&mut Fx<'i>, E) -> E,
    ) -> Option<Stmt> {
        match s {
            Stmt::Set { dst, e, pc } => {
                let n = f(self, *e);
                (n != *e).then(|| Stmt::Set {
                    dst: *dst,
                    e: n,
                    pc: *pc,
                })
            }
            Stmt::Eval { e, pc } => {
                let n = f(self, *e);
                (n != *e).then(|| Stmt::Eval { e: n, pc: *pc })
            }
            Stmt::Store { size, addr, v, pc } => {
                let a2 = f(self, *addr);
                let v2 = f(self, *v);
                (a2 != *addr || v2 != *v).then(|| Stmt::Store {
                    size: *size,
                    addr: a2,
                    v: v2,
                    pc: *pc,
                })
            }
            Stmt::Call {
                dst,
                t,
                args,
                pc,
                extra,
            } => {
                let a2 = self.map_list_keep(*args, f);
                let te = match t {
                    CallTarget::Ind { e } => Some((*e, f(self, *e))),
                    _ => None,
                };
                let x2 = extra.map(|x| self.map_list_keep(x, f));
                if a2 == *args && x2 == *extra && te.is_none_or(|(o, n)| o == n) {
                    return None;
                }
                Some(Stmt::Call {
                    dst: *dst,
                    t: match te {
                        Some((_, n)) => CallTarget::Ind { e: n },
                        None => t.clone(),
                    },
                    args: a2,
                    pc: *pc,
                    extra: x2,
                })
            }
            Stmt::Stores {
                size,
                addr,
                vals,
                pc,
            } => {
                let a2 = f(self, *addr);
                let v2 = self.map_list_keep(*vals, f);
                (a2 != *addr || v2 != *vals).then(|| Stmt::Stores {
                    size: *size,
                    addr: a2,
                    vals: v2,
                    pc: *pc,
                })
            }
            Stmt::Copy {
                dst,
                src,
                n,
                pc,
                rev,
            } => {
                let d2 = f(self, *dst);
                let s2 = f(self, *src);
                (d2 != *dst || s2 != *src).then(|| Stmt::Copy {
                    dst: d2,
                    src: s2,
                    n: *n,
                    pc: *pc,
                    rev: *rev,
                })
            }
            Stmt::Trap { .. } => None,
        }
    }
}

/// pruneUnreachable (src/dataflow.ts): drop blocks unreachable from block 0, renumbering the rest.
pub fn prune_unreachable(f: &mut Func) {
    let n = f.blocks.len();
    let mut seen = vec![false; n];
    let mut st = vec![0usize];
    seen[0] = true;
    while let Some(b) = st.pop() {
        for &s in &f.blocks[b].succs {
            if !seen[s] {
                seen[s] = true;
                st.push(s);
            }
        }
    }
    if seen.iter().all(|&x| x) {
        return;
    }
    let mut remap = vec![-1i64; n];
    let old = std::mem::take(&mut f.blocks);
    let mut nb: Vec<Block> = Vec::with_capacity(n);
    for b in old {
        if seen[b.id] {
            remap[b.id] = nb.len() as i64;
            nb.push(b);
        }
    }
    for b in &mut nb {
        b.id = remap[b.id] as usize;
        for s in b.succs.iter_mut() {
            *s = remap[*s] as usize;
        }
        b.preds.retain(|&x| remap[x] >= 0);
        for p in b.preds.iter_mut() {
            *p = remap[*p] as usize;
        }
        match &mut b.term {
            Term::Jmp { to } => *to = remap[*to as usize],
            Term::Br { t, f, .. } => {
                *t = remap[*t as usize];
                *f = remap[*f as usize];
            }
            _ => {}
        }
    }
    f.blocks = nb;
    f.block_at.retain(|_, id| {
        let r = remap[*id];
        if r < 0 {
            return false;
        }
        *id = r as usize;
        true
    });
}

/// The per-function phase of `decompile` (phase 2) for one function after recoverVars:
/// optimizeFunc; promoteStack (then optimizeFunc again); recognizeIdioms (then optimizeFunc again
/// unless the function is settled and idioms did not really change it). `after_opt` is called after
/// the first optimizeFunc (for the intermediate dump).
pub fn phase2(f: &mut Func, img: Option<&Image>, exact_memory: bool, after_opt: impl FnOnce(&Func, bool)) -> bool {
    let mut x = Fx::new(f.ir.take().expect("variable IR"), img);
    let mut settled = optimize_func(&mut x, f);
    f.ir = Some(x.ir);
    after_opt(f, settled);
    if !exact_memory && sbpf_dataflow::stack::promote_stack(f) {
        x.ir = f.ir.take().unwrap();
        settled = optimize_func(&mut x, f);
        f.ir = Some(std::mem::take(&mut x.ir));
    }
    x.ir = f.ir.take().unwrap();
    let (changed, real) = idioms::recognize_idioms(&mut x, f);
    if changed && (real || !settled) {
        settled = optimize_func(&mut x, f);
    }
    f.ir = Some(x.ir);
    settled
}

/// The per-function steps after rewriteStackArgs: sinkFrameLoads (unless exactMemory), compactStores.
pub fn finish(f: &mut Func, exact_memory: bool) {
    let mut x = Fx::new(f.ir.take().expect("variable IR"), None);
    if !exact_memory {
        compact::sink_frame_loads(&mut x, f);
    }
    compact::compact_stores(&mut x, f);
    f.ir = Some(x.ir);
}
