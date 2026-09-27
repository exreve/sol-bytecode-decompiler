//! `src/simplify.ts`: exact expression simplification, the optimizeFunc pass loop, variable
//! propagation and dead code elimination.

use crate::cfgopt::{
    dead_stores, global_const_prop, local_const_prop, local_copy_prop, merge_blocks,
    tail_duplicate, thread_jumps,
};
use crate::ifconv::if_convert;
use crate::*;
use sbpf_ir::{BinOp, CmpOp, Node, Stmt, Term, E};
use sbpf_program::{Block, Func};

impl Fx<'_> {
    /// Upper bound on the number of significant bits of an expression's value.
    pub fn max_bits(&mut self, e: E) -> u32 {
        match self.node(e) {
            Node::Const(v) => bitlen(v),
            Node::Load { size, .. } => size as u32 * 8,
            Node::Ext { signed, bits, .. } => {
                if signed {
                    64
                } else {
                    bits as u32
                }
            }
            Node::Bswap { bits, .. } => bits as u32,
            Node::Cmp(..) | Node::Lnot(_) | Node::Land(..) | Node::Lor(..) => 1,
            Node::Bin(op, a, b) => match op {
                BinOp::And => self.max_bits(a).min(self.max_bits(b)),
                BinOp::Or | BinOp::Xor => self.max_bits(a).max(self.max_bits(b)),
                BinOp::Lshr => match self.cv(b) {
                    Some(c) => self.max_bits(a).saturating_sub((c & 63) as u32),
                    None => self.max_bits(a),
                },
                BinOp::Udiv => self.max_bits(a),
                BinOp::Urem => self.max_bits(a).min(self.max_bits(b)),
                BinOp::Add => 64.min(self.max_bits(a).max(self.max_bits(b)) + 1),
                BinOp::Mul => 64.min(self.max_bits(a) + self.max_bits(b)),
                BinOp::Shl => match self.cv(b) {
                    Some(c) => 64.min(self.max_bits(a) + (c & 63) as u32),
                    None => 64,
                },
                BinOp::Sdiv32 | BinOp::Srem32 => 32,
                _ => 64,
            },
            Node::Sel(_, a, b) => self.max_bits(a).max(self.max_bits(b)),
            Node::Fn(name, args) => match self.intr(name) {
                Intr::Popcount | Intr::Clz | Intr::Ctz => 7,
                Intr::Memeq | Intr::Keyeq | Intr::RcRelease => 1,
                Intr::Min => {
                    let (a, b) = (self.ir.at(args, 0), self.ir.at(args, 1));
                    self.max_bits(a).min(self.max_bits(b))
                }
                Intr::Max => {
                    let (a, b) = (self.ir.at(args, 0), self.ir.at(args, 1));
                    self.max_bits(a).max(self.max_bits(b))
                }
                Intr::SatSub => {
                    let a = self.ir.at(args, 0);
                    self.max_bits(a)
                }
                _ => 64,
            },
            _ => 64,
        }
    }

    fn is_bool(&mut self, e: E) -> bool {
        match self.node(e) {
            Node::Cmp(..) | Node::Lnot(_) | Node::Land(..) | Node::Lor(..) => true,
            Node::Const(v) => v <= 1,
            Node::Fn(name, _) => matches!(
                self.intr(name),
                Intr::Memeq | Intr::Keyeq | Intr::RcRelease
            ),
            _ => false,
        }
    }

    pub fn negate(&mut self, c: E) -> E {
        match self.node(c) {
            Node::Cmp(op, a, b) => {
                if let Some(n) = neg_cmp(op) {
                    return self.ir.mk(Node::Cmp(n, a, b));
                }
            }
            Node::Lnot(a) => return a,
            Node::Land(a, b) => {
                let a = self.negate(a);
                let b = self.negate(b);
                return self.ir.mk(Node::Lor(a, b));
            }
            Node::Lor(a, b) => {
                let a = self.negate(a);
                let b = self.negate(b);
                return self.ir.mk(Node::Land(a, b));
            }
            Node::Const(v) => return self.c((v == 0) as u64),
            _ => {}
        }
        self.ir.mk(Node::Lnot(c))
    }

    /// Bottom-up simplification of one node whose children are already simplified.
    fn simp1(&mut self, e: E) -> E {
        match self.node(e) {
            Node::Bin(op, a, b) => self.simp_bin(e, op, a, b),
            Node::Neg(a) => match self.node(a) {
                Node::Const(v) => self.c(v.wrapping_neg()),
                Node::Neg(x) => x,
                _ => e,
            },
            Node::Not(a) => match self.cv(a) {
                Some(v) => self.c(v ^ M64),
                None => e,
            },
            Node::Ext { signed, bits, a } => self.simp_ext(e, signed, bits, a),
            Node::Bswap { bits, a } => match self.cv(a) {
                Some(v) => self.c(eval_bswap(bits, v)),
                None => e,
            },
            Node::Cmp(op, a, b) => self.simp_cmp(e, op, a, b),
            Node::Lnot(a) => self.negate(a),
            Node::Land(a, b) => match self.cv(a) {
                Some(v) => {
                    if v != 0 {
                        b
                    } else {
                        self.c(0)
                    }
                }
                None => e,
            },
            Node::Lor(a, b) => match self.cv(a) {
                Some(v) => {
                    if v != 0 {
                        self.c(1)
                    } else {
                        b
                    }
                }
                None => e,
            },
            Node::Sel(c, a, b) => self.simp_sel(e, c, a, b),
            Node::Fn(name, args) => {
                let n = self.intr(name);
                if n.pure_fn() {
                    let mut vs = Vec::with_capacity(args.len as usize);
                    for k in 0..args.len {
                        match self.cv(self.ir.at(args, k)) {
                            Some(v) => vs.push(v),
                            None => return e,
                        }
                    }
                    return self.c(eval_intr(n, &vs));
                }
                e
            }
            _ => e,
        }
    }

    fn simp_bin(&mut self, e0: E, op: BinOp, a0: E, b0: E) -> E {
        use BinOp::*;
        let (mut a, mut b, mut e) = (a0, b0, e0);
        if let (Some(x), Some(y)) = (self.cv(a), self.cv(b)) {
            return match eval_bin(op, x, y) {
                Some(v) => self.c(v),
                None => e,
            };
        }
        // canonical: constant on the right for commutative ops
        if self.cv(a).is_some() && matches!(op, Add | Mul | And | Or | Xor) {
            std::mem::swap(&mut a, &mut b);
            e = self.ir.bin(op, a, b);
        }
        if let Some(c) = self.cv(b) {
            if c == 0 && matches!(op, Add | Sub | Or | Xor | Shl | Lshr | Ashr) {
                return a;
            }
            if c == 1 && matches!(op, Mul | Udiv | Sdiv) {
                return a;
            }
            if c == M64 && op == And {
                return a;
            }
            if c == M64 && op == Xor {
                return self.ir.mk(Node::Not(a));
            }
            if c == 0 && matches!(op, And | Mul) && self.is_pure(a) {
                return self.c(0);
            }
            if op == Sub {
                let k = self.c(c.wrapping_neg());
                let n = self.ir.bin(Add, a, k);
                return self.simp1(n);
            }
            let an = self.node(a);
            if op == Add {
                if let Node::Bin(Add, aa, ab) = an {
                    if let Some(k) = self.cv(ab) {
                        let k = self.c(k.wrapping_add(c));
                        let n = self.ir.bin(Add, aa, k);
                        return self.simp1(n);
                    }
                }
            }
            if matches!(op, And | Or | Xor) {
                if let Node::Bin(o2, aa, ab) = an {
                    if o2 == op {
                        if let Some(k) = self.cv(ab) {
                            let k = self.c(eval_bin(op, k, c).unwrap());
                            let n = self.ir.bin(op, aa, k);
                            return self.simp1(n);
                        }
                    }
                }
            }
            if op == And {
                for (m, bits) in [(0xffu64, 8u8), (0xffff, 16), (0xffff_ffff, 32)] {
                    if c == m {
                        let n = self.ir.ext(false, bits, a);
                        return self.simp1(n);
                    }
                }
                let mb = self.max_bits(a);
                if mb <= bitlen(c) && mask(mb) & !c == 0 {
                    return a;
                }
            }
            if matches!(op, Lshr | Ashr) && matches!(c, 32 | 48 | 56) {
                if let Node::Bin(Shl, aa, ab) = an {
                    if self.cv(ab) == Some(c) {
                        let n = self.ir.ext(op == Ashr, (64 - c) as u8, aa);
                        return self.simp1(n);
                    }
                }
            }
            if op == Lshr && self.max_bits(a) <= (c & 63) as u32 {
                return if self.is_pure(a) { self.c(0) } else { e };
            }
            if op == Shl {
                if let Node::Bin(Shl, aa, ab) = an {
                    if let Some(k) = self.cv(ab) {
                        if (k & 63) + (c & 63) < 64 {
                            let k = self.c((k & 63) + (c & 63));
                            let n = self.ir.bin(Shl, aa, k);
                            return self.simp1(n);
                        }
                    }
                }
            }
            if matches!(op, Or | Xor) && self.cv(a).is_some() {
                return e;
            }
        }
        if matches!(op, Sub | Xor) && self.expr_eq(a, b) && self.is_pure(a) {
            return self.c(0);
        }
        if matches!(op, And | Or) && self.expr_eq(a, b) && self.is_pure(a) {
            return a;
        }
        e
    }

    fn simp_ext(&mut self, e: E, signed: bool, bits: u8, a: E) -> E {
        let an = self.node(a);
        if let Node::Const(v) = an {
            return self.c(eval_ext(signed, bits, v));
        }
        let mb = self.max_bits(a);
        if !signed && mb <= bits as u32 {
            return a;
        }
        if signed && mb < bits as u32 {
            return a;
        }
        match an {
            Node::Ext {
                signed: s2,
                bits: b2,
                a: aa,
            } => {
                if b2 <= bits {
                    // inner result already fits in e.bits (zero) or is a sign-extension from fewer bits
                    if !s2 {
                        return if signed && b2 == bits {
                            self.ir.ext(signed, bits, aa)
                        } else {
                            a
                        };
                    }
                    if signed {
                        return a;
                    }
                    return if bits == b2 {
                        self.ir.ext(signed, bits, aa)
                    } else {
                        e
                    };
                }
                // outer narrower: only low e.bits of inner matter
                let n = self.ir.ext(signed, bits, aa);
                self.simp1(n)
            }
            Node::Load { size, .. } if size as u32 * 8 == bits as u32 && !signed => a,
            Node::Bin(op @ (BinOp::And | BinOp::Or | BinOp::Xor), aa, ab) => {
                if let Some(bv) = self.cv(ab) {
                    let nc = bv & mask(bits as u32);
                    if nc != bv {
                        let k = self.c(nc);
                        let inner = self.ir.bin(op, aa, k);
                        let inner = self.simp1(inner);
                        let n = self.ir.ext(signed, bits, inner);
                        return self.simp1(n);
                    }
                }
                e
            }
            _ => e,
        }
    }

    fn simp_cmp(&mut self, e: E, op0: CmpOp, a0: E, b0: E) -> E {
        use CmpOp::*;
        let (mut a, mut b, mut op) = (a0, b0, op0);
        if let (Some(x), Some(y)) = (self.cv(a), self.cv(b)) {
            return self.c(eval_cmp(op, x, y) as u64);
        }
        if self.cv(a).is_some() && self.cv(b).is_none() {
            std::mem::swap(&mut a, &mut b);
            op = swap_cmp(op);
        }
        if let Some(c) = self.cv(b) {
            // boolean value compared against 0/1
            if matches!(op, Ne | Eq) && c <= 1 && self.is_bool(a) {
                return if (op == Ne) == (c == 0) {
                    a
                } else {
                    self.negate(a)
                };
            }
            if op == Set && c == M64 {
                let z = self.c(0);
                let n = self.ir.cmp(Ne, a, z);
                return self.simp1(n);
            }
            if op == Ugt && c == 0 {
                return self.ir.cmp(Ne, a, b);
            }
            if op == Ule && c == 0 {
                return self.ir.cmp(Eq, a, b);
            }
            if op == Ult && c == 1 {
                let z = self.c(0);
                return self.ir.cmp(Eq, a, z);
            }
            if op == Uge && c == 1 {
                let z = self.c(0);
                return self.ir.cmp(Ne, a, z);
            }
            if matches!(op, Eq | Ne) {
                if let Node::Bin(BinOp::Xor, xa, xb) = self.node(a) {
                    if self.is_pure(a) {
                        let n = self.ir.bin(BinOp::Xor, xb, b);
                        let r = self.simp1(n);
                        return self.ir.cmp(op, xa, r);
                    }
                }
                if let Node::Bin(BinOp::Add, xa, xb) = self.node(a) {
                    if let Some(k) = self.cv(xb) {
                        let r = self.c(c.wrapping_sub(k));
                        return self.ir.cmp(op, xa, r);
                    }
                }
            }
            // value provably out of range of the constant
            let mb = self.max_bits(a);
            if mb < 64 && self.is_pure(a) {
                let max = mask(mb);
                if op == Eq && c > max {
                    return self.c(0);
                }
                if op == Ne && c > max {
                    return self.c(1);
                }
            }
        }
        if let Some(r) = self.checked_sub(op, a, b) {
            return r;
        }
        if op == op0 && a == a0 && b == b0 {
            return e;
        }
        self.ir.cmp(op, a, b)
    }

    /// Borrow checks of a subtraction compare the difference with the minuend (`checked_sub`).
    fn checked_sub(&mut self, op: CmpOp, a: E, b: E) -> Option<E> {
        let (mut d, mut x, mut o) = (a, b, op);
        if self.sub_of(d, x).is_none() {
            d = b;
            x = a;
            o = swap_cmp(op);
        }
        let y = self.sub_of(d, x)?;
        if self.fx(d) & CALL != 0 {
            return None;
        }
        let nz = matches!(self.cv(y), Some(v) if v != 0);
        if o == CmpOp::Ugt || (o == CmpOp::Uge && nz) {
            return Some(self.ir.cmp(CmpOp::Ugt, y, x));
        }
        if o == CmpOp::Ule || (o == CmpOp::Ult && nz) {
            return Some(self.ir.cmp(CmpOp::Ule, y, x));
        }
        None
    }

    /// d = x - y: returns y (x - c appears as x + (-c))
    fn sub_of(&mut self, d: E, x: E) -> Option<E> {
        let Node::Bin(op, da, db) = self.node(d) else {
            return None;
        };
        if !self.expr_eq(da, x) {
            return None;
        }
        if op == BinOp::Sub {
            return Some(db);
        }
        if op == BinOp::Add {
            if let Some(v) = self.cv(db) {
                if (v as i64) < 0 {
                    return Some(self.c(v.wrapping_neg()));
                }
            }
        }
        None
    }

    fn no_call(&mut self, e: E) -> bool {
        self.fx(e) & CALL == 0
    }

    /// Selects (from if-conversion).
    fn simp_sel(&mut self, e: E, c: E, a: E, b: E) -> E {
        let cn = self.node(c);
        if let Node::Const(v) = cn {
            return if v != 0 { a } else { b };
        }
        if let Node::Lnot(ca) = cn {
            let n = self.ir.mk(Node::Sel(ca, b, a));
            return self.simp_sel(n, ca, b, a);
        }
        if self.expr_eq(a, b) && self.is_pure(c) {
            return a;
        }
        if self.is_bool(c) {
            if let (Some(x), Some(y)) = (self.cv(a), self.cv(b)) {
                if x == 1 && y == 0 {
                    return c;
                }
                if x == 0 && y == 1 {
                    return self.negate(c);
                }
            }
        }
        let Node::Cmp(op, x, y) = cn else {
            return e;
        };
        if op == CmpOp::Eq {
            let nc = self.ir.cmp(CmpOp::Ne, x, y);
            let n = self.ir.mk(Node::Sel(nc, b, a));
            return self.simp_sel(n, nc, b, a);
        }
        use CmpOp::*;
        let mm = match op {
            Ult | Ule => Some((Intr::Min, Intr::Max)),
            Ugt | Uge => Some((Intr::Max, Intr::Min)),
            Slt | Sle => Some((Intr::Smin, Intr::Smax)),
            Sgt | Sge => Some((Intr::Smax, Intr::Smin)),
            _ => None,
        };
        if let Some((m0, m1)) = mm {
            if self.no_call(x) && self.no_call(y) {
                if self.expr_eq(a, x) && self.expr_eq(b, y) {
                    return self.mk_fn(m0, &[x, y]);
                }
                if self.expr_eq(a, y) && self.expr_eq(b, x) {
                    return self.mk_fn(m1, &[x, y]);
                }
            }
        }
        // y > x ? 0 : x - y  ->  sat_sub(x, y)
        let lt = match op {
            Ult => Some((x, y)),
            Ugt => Some((y, x)),
            _ => None,
        };
        let ge = match op {
            Uge => Some((x, y)),
            Ule => Some((y, x)),
            _ => None,
        };
        if let Some((l0, l1)) = lt {
            if self.no_call(x) && self.no_call(y) && self.sat_arms(b, a, l0, l1) {
                return self.mk_fn(Intr::SatSub, &[l0, l1]);
            }
        }
        if let Some((g0, g1)) = ge {
            if self.no_call(x) && self.no_call(y) && self.sat_arms(a, b, g0, g1) {
                return self.mk_fn(Intr::SatSub, &[g0, g1]);
            }
        }
        // x != 0 ? clz(x) : 64  ->  clz(x)
        if op == Ne && self.is_c(y, 0) {
            if let Node::Fn(name, args) = self.node(a) {
                if matches!(self.intr(name), Intr::Clz | Intr::Ctz)
                    && args.len > 0
                    && self.expr_eq(self.ir.at(args, 0), x)
                    && self.is_c(b, 64)
                    && self.is_pure(x)
                {
                    return a;
                }
            }
        }
        e
    }

    fn sat_arms(&mut self, d: E, z: E, m: E, s: E) -> bool {
        if !self.is_c(z, 0) || self.sub_of(d, m).is_none() {
            return false;
        }
        let y = self.sub_of(d, m).unwrap();
        self.expr_eq(y, s)
    }

    /// simplifyExpr: returns `e` itself when nothing changes.
    pub fn simplify_expr(&mut self, e: E) -> E {
        if self.is_stable(e) {
            return e;
        }
        let r = match self.node(e) {
            Node::Bin(op, a, b) => {
                let (a2, b2) = (self.simplify_expr(a), self.simplify_expr(b));
                let n = if a2 == a && b2 == b {
                    e
                } else {
                    self.ir.bin(op, a2, b2)
                };
                self.simp1(n)
            }
            Node::Cmp(op, a, b) => {
                let (a2, b2) = (self.simplify_expr(a), self.simplify_expr(b));
                let n = if a2 == a && b2 == b {
                    e
                } else {
                    self.ir.cmp(op, a2, b2)
                };
                self.simp1(n)
            }
            Node::Land(a, b) => {
                let (a2, b2) = (self.simplify_expr(a), self.simplify_expr(b));
                let n = if a2 == a && b2 == b {
                    e
                } else {
                    self.ir.mk(Node::Land(a2, b2))
                };
                self.simp1(n)
            }
            Node::Lor(a, b) => {
                let (a2, b2) = (self.simplify_expr(a), self.simplify_expr(b));
                let n = if a2 == a && b2 == b {
                    e
                } else {
                    self.ir.mk(Node::Lor(a2, b2))
                };
                self.simp1(n)
            }
            Node::Neg(a) => {
                let a2 = self.simplify_expr(a);
                let n = if a2 == a { e } else { self.ir.mk(Node::Neg(a2)) };
                self.simp1(n)
            }
            Node::Not(a) => {
                let a2 = self.simplify_expr(a);
                let n = if a2 == a { e } else { self.ir.mk(Node::Not(a2)) };
                self.simp1(n)
            }
            Node::Lnot(a) => {
                let a2 = self.simplify_expr(a);
                let n = if a2 == a { e } else { self.ir.mk(Node::Lnot(a2)) };
                self.simp1(n)
            }
            Node::Ext { signed, bits, a } => {
                let a2 = self.simplify_expr(a);
                let n = if a2 == a {
                    e
                } else {
                    self.ir.ext(signed, bits, a2)
                };
                self.simp1(n)
            }
            Node::Bswap { bits, a } => {
                let a2 = self.simplify_expr(a);
                let n = if a2 == a {
                    e
                } else {
                    self.ir.mk(Node::Bswap { bits, a: a2 })
                };
                self.simp1(n)
            }
            Node::Load { size, addr } => {
                let a2 = self.simplify_expr(addr);
                // read-only program memory never changes and never faults: the load is a constant
                if let (Some(v), Some(img)) = (self.cv(a2), self.img) {
                    if let Some(x) = img.read_const(v, size as usize) {
                        return self.c(x);
                    }
                }
                if a2 == addr {
                    e
                } else {
                    self.ir.load(size, a2)
                }
            }
            Node::Sel(c, a, b) => {
                let (c2, a2, b2) = (
                    self.simplify_expr(c),
                    self.simplify_expr(a),
                    self.simplify_expr(b),
                );
                let n = if c2 == c && a2 == a && b2 == b {
                    e
                } else {
                    self.ir.mk(Node::Sel(c2, a2, b2))
                };
                self.simp1(n)
            }
            Node::Call(t, args) => {
                let l = self.map_list_keep(args, &mut |x, a| x.simplify_expr(a));
                if l == args {
                    e
                } else {
                    self.ir.mk(Node::Call(t, l))
                }
            }
            Node::Fn(name, args) => {
                let l = self.map_list_keep(args, &mut |x, a| x.simplify_expr(a));
                let n = if l == args {
                    e
                } else {
                    self.ir.mk(Node::Fn(name, l))
                };
                self.simp1(n)
            }
            _ => e,
        };
        if r == e {
            self.set_stable(e);
        }
        r
    }

    /// simplifyStmt: `None` when the statement is left unchanged.
    pub fn simplify_stmt(&mut self, s: &Stmt) -> Option<Stmt> {
        self.map_stmt_keep(s, &mut |x, e| x.simplify_expr(e))
    }
}

// ---------------- function-level passes ----------------

/// Variable -> expression substitution map (insertion-ordered, dense by variable id).
pub(crate) struct VarMap {
    slot: Vec<u32>,
    pub(crate) keys: Vec<u32>,
    pub(crate) vals: Vec<Option<E>>,
    pub(crate) n: usize,
}

impl VarMap {
    pub(crate) fn new(nv: usize) -> Self {
        VarMap {
            slot: vec![u32::MAX; nv],
            keys: vec![],
            vals: vec![],
            n: 0,
        }
    }
    #[inline]
    pub(crate) fn get(&self, v: u32) -> Option<E> {
        match self.slot.get(v as usize) {
            Some(&k) if k != u32::MAX => self.vals[k as usize],
            _ => None,
        }
    }
    #[inline]
    pub(crate) fn has(&self, v: u32) -> bool {
        self.get(v).is_some()
    }
    pub(crate) fn set(&mut self, v: u32, e: E) {
        let k = self.slot[v as usize];
        if k != u32::MAX && self.vals[k as usize].is_some() {
            self.vals[k as usize] = Some(e);
            return;
        }
        self.slot[v as usize] = self.keys.len() as u32;
        self.keys.push(v);
        self.vals.push(Some(e));
        self.n += 1;
    }
    pub(crate) fn delete(&mut self, v: u32) {
        let k = self.slot[v as usize];
        if k != u32::MAX && self.vals[k as usize].is_some() {
            self.vals[k as usize] = None;
            self.slot[v as usize] = u32::MAX;
            self.n -= 1;
        }
    }
    pub(crate) fn clear(&mut self) {
        for &v in &self.keys {
            self.slot[v as usize] = u32::MAX;
        }
        self.keys.clear();
        self.vals.clear();
        self.n = 0;
    }
}

impl Fx<'_> {
    /// substVars: returns `e` when no variable of `m` occurs; otherwise rebuilds every composite node.
    pub(crate) fn subst_vars(&mut self, e: E, m: &VarMap) -> E {
        let mut hit = false;
        self.evars(e, |v| hit |= m.has(v));
        if !hit {
            return e;
        }
        self.subst_go(e, m)
    }
    fn subst_go(&mut self, x: E, m: &VarMap) -> E {
        match self.node(x) {
            Node::Var(id) => m.get(id).unwrap_or(x),
            Node::Bin(op, a, b) => {
                let a = self.subst_go(a, m);
                let b = self.subst_go(b, m);
                self.ir.bin(op, a, b)
            }
            Node::Cmp(op, a, b) => {
                let a = self.subst_go(a, m);
                let b = self.subst_go(b, m);
                self.ir.cmp(op, a, b)
            }
            Node::Land(a, b) => {
                let a = self.subst_go(a, m);
                let b = self.subst_go(b, m);
                self.ir.mk(Node::Land(a, b))
            }
            Node::Lor(a, b) => {
                let a = self.subst_go(a, m);
                let b = self.subst_go(b, m);
                self.ir.mk(Node::Lor(a, b))
            }
            Node::Neg(a) => {
                let a = self.subst_go(a, m);
                self.ir.mk(Node::Neg(a))
            }
            Node::Not(a) => {
                let a = self.subst_go(a, m);
                self.ir.mk(Node::Not(a))
            }
            Node::Lnot(a) => {
                let a = self.subst_go(a, m);
                self.ir.mk(Node::Lnot(a))
            }
            Node::Ext { signed, bits, a } => {
                let a = self.subst_go(a, m);
                self.ir.ext(signed, bits, a)
            }
            Node::Bswap { bits, a } => {
                let a = self.subst_go(a, m);
                self.ir.mk(Node::Bswap { bits, a })
            }
            Node::Load { size, addr } => {
                let a = self.subst_go(addr, m);
                self.ir.load(size, a)
            }
            Node::Sel(c, a, b) => {
                let c = self.subst_go(c, m);
                let a = self.subst_go(a, m);
                let b = self.subst_go(b, m);
                self.ir.mk(Node::Sel(c, a, b))
            }
            Node::Call(t, args) => {
                let t = match self.ir.target(t) {
                    CallTarget::Ind { e } => {
                        let e = self.subst_go(e, m);
                        self.ir.mk_target(CallTarget::Ind { e })
                    }
                    _ => t,
                };
                let l = self.map_list(args, &mut |x, a| x.subst_go(a, m));
                self.ir.mk(Node::Call(t, l))
            }
            Node::Fn(name, args) => {
                let l = self.map_list(args, &mut |x, a| x.subst_go(a, m));
                self.ir.mk(Node::Fn(name, l))
            }
            _ => x,
        }
    }
}

fn count_uses(x: &mut Fx, f: &Func) -> Vec<i32> {
    let mut uses = vec![0i32; f.vars.len()];
    for b in &f.blocks {
        for s in &b.stmts {
            x.sinfo(s, |v| uses[v as usize] += 1);
        }
        if let Some(e) = term_expr(&b.term) {
            x.evars(e, |v| uses[v as usize] += 1);
        }
    }
    uses
}

fn def_counts(f: &Func) -> Vec<i32> {
    let mut nd = vec![0i32; f.vars.len()];
    for b in &f.blocks {
        for s in &b.stmts {
            if let Some(d) = def_of(s) {
                nd[d as usize] += 1;
            }
        }
    }
    nd
}

/// optimizeFunc; returns whether the function is settled (its IR at a fixpoint).
pub fn optimize_func(x: &mut Fx, f: &mut Func) -> bool {
    let mut fixed = false;
    let mut prev_last = i32::MAX;
    for round in 0..8 {
        let mut changed = false;
        let mut real = false;
        let mut last = -1;
        simplify_all(x, f, &mut || {
            real = true;
            last = 0;
        });
        let mut counts: Option<Vec<i32>> = None;
        for i in 1..12 {
            if !real && i > prev_last {
                break;
            }
            let hit = match i {
                1 => {
                    let mut r = false;
                    changed = propagate_global(x, f, &mut r) || changed;
                    r
                }
                2 => {
                    let c = inline_local(x, f, &mut counts);
                    changed |= c;
                    c
                }
                3 => {
                    let c = dce(x, f, counts.take());
                    changed |= c;
                    c
                }
                4 => {
                    let c = local_const_prop(x, f);
                    changed |= c;
                    c
                }
                5 => {
                    let c = global_const_prop(x, f);
                    changed |= c;
                    c
                }
                6 => {
                    let mut r = false;
                    changed = local_copy_prop(x, f, &mut r) || changed;
                    r
                }
                7 => {
                    let c = fold_const_branches(x, f);
                    if c {
                        prune_unreachable(f);
                        merge_blocks(f);
                        changed = true;
                    }
                    c
                }
                8 => {
                    let c = thread_jumps(x, f);
                    changed |= c;
                    c
                }
                9 => {
                    let c = if_convert(x, f, 3);
                    if c {
                        prune_unreachable(f);
                        merge_blocks(f);
                        changed = true;
                    }
                    c
                }
                10 => {
                    let c = dead_stores(x, f);
                    changed |= c;
                    c
                }
                _ => {
                    let c = round < 6 && tail_duplicate(f, 6);
                    changed |= c;
                    c
                }
            };
            if hit {
                real = true;
                last = i;
            }
        }
        prev_last = last;
        if !changed || !real {
            fixed = !real && round < 6;
            break;
        }
    }
    // expressions created by the last round's passes still get simplified
    simplify_all(x, f, &mut || fixed = false);
    fixed
}

fn simplify_all(x: &mut Fx, f: &mut Func, on_change: &mut dyn FnMut()) {
    for b in &mut f.blocks {
        for i in 0..b.stmts.len() {
            if let Some(n) = x.simplify_stmt(&b.stmts[i]) {
                b.stmts[i] = n;
                on_change();
            }
        }
        match &mut b.term {
            Term::Br { c, .. } => {
                let n = x.simplify_expr(*c);
                if n != *c {
                    *c = n;
                    on_change();
                }
            }
            Term::Ret { e: Some(e) } => {
                let n = x.simplify_expr(*e);
                if n != *e {
                    *e = n;
                    on_change();
                }
            }
            _ => {}
        }
    }
}

/// A propagateGlobal map value: an expression, or the TOO_BIG stand-in.
const TOO_BIG: E = E(u32::MAX);

/// Substitute single-def vars whose definition is a cheap pure expression over single-def vars /
/// constants.
fn propagate_global(x: &mut Fx, f: &mut Func, real: &mut bool) -> bool {
    let nv = f.vars.len();
    let mut nd = vec![0i32; nv];
    // first definition: Some(e) for a `set`, None for a call
    let mut first: Vec<Option<E>> = vec![None; nv];
    for b in &f.blocks {
        for s in &b.stmts {
            if let Some(d) = def_of(s) {
                let d = d as usize;
                if nd[d] == 0 {
                    first[d] = match s {
                        Stmt::Set { e, .. } => Some(*e),
                        _ => None,
                    };
                }
                nd[d] += 1;
            }
        }
    }
    let vars = &f.vars;
    let single_def = |v: usize| nd[v] == 1 && vars[v].param < 0 && !vars[v].undef;
    let mut cands: Vec<u32> = vec![];
    for v in 0..nv {
        if !single_def(v) {
            continue;
        }
        let Some(e) = first[v] else { continue };
        if !x.size_at_most(e, 3) {
            continue;
        }
        if x.fx(e) != 0 {
            continue;
        }
        cands.push(v as u32);
    }
    let mut m = VarMap::new(nv);
    for &v in &cands {
        let e = first[v as usize].unwrap();
        let mut good = true;
        x.evars(e, |id| {
            let id = id as usize;
            if !(single_def(id) || vars[id].param >= 0 && nd[id] == 0) {
                good = false
            }
        });
        if good {
            m.set(v, e);
        }
    }
    if m.n == 0 {
        return false;
    }
    // resolve chains; keep only substitutions that stay small
    for k in 0..m.keys.len() {
        if let Some(e) = m.vals[k] {
            let r = resolve_small(x, e, &m);
            m.vals[k] = Some(r);
        }
    }
    for k in 0..m.keys.len() {
        if let Some(e) = m.vals[k] {
            if e == TOO_BIG || x.size(e) > 4 {
                m.delete(m.keys[k]);
            }
        }
    }
    for k in 0..m.keys.len() {
        if let Some(e) = m.vals[k] {
            let r = resolve(x, e, &m, 0);
            m.vals[k] = Some(r);
        }
    }
    let mut changed = false;
    for b in &mut f.blocks {
        for i in 0..b.stmts.len() {
            let s = &b.stmts[i];
            if !matches!(s, Stmt::Trap { .. }) {
                changed = true;
            }
            let mut some = false;
            x.sinfo(s, |v| some |= m.has(v));
            if !some {
                continue;
            }
            if let Some(n) = x.map_stmt_keep(s, &mut |x, e| x.subst_vars(e, &m)) {
                b.stmts[i] = n;
                *real = true;
            }
        }
        match &mut b.term {
            Term::Br { c, .. } => {
                let n = x.subst_vars(*c, &m);
                if n != *c {
                    *c = n;
                    changed = true;
                    *real = true;
                }
            }
            Term::Ret { e: Some(e) } => {
                let n = x.subst_vars(*e, &m);
                if n != *e {
                    *e = n;
                    changed = true;
                    *real = true;
                }
            }
            _ => {}
        }
    }
    changed
}

fn resolve(x: &mut Fx, e: E, m: &VarMap, depth: u32) -> E {
    if depth > 20 {
        return e;
    }
    let n = x.subst_vars(e, m);
    if n == e {
        e
    } else {
        resolve(x, n, m, depth + 1)
    }
}

/// resolve() for the first chain-resolution pass (results larger than 4 nodes become TOO_BIG).
fn resolve_small(x: &mut Fx, mut e: E, m: &VarMap) -> E {
    let mut depth = 0;
    loop {
        if depth > 20 {
            return e;
        }
        let (mut hit, mut big) = (false, false);
        x.evars(e, |v| {
            if let Some(r) = m.get(v) {
                hit = true;
                if r == TOO_BIG {
                    big = true;
                }
            }
        });
        if !hit {
            return e;
        }
        if big {
            return TOO_BIG;
        }
        let n = x.subst_vars(e, m);
        if x.size(n) > 4 {
            return TOO_BIG;
        }
        e = n;
        depth += 1;
    }
}

/// Inline single-use definitions into their (same-block) use when no intervening statement
/// interferes. `exact` receives the exact use counts after the rewrites.
fn inline_local(x: &mut Fx, f: &mut Func, exact: &mut Option<Vec<i32>>) -> bool {
    let uses = count_uses(x, f);
    let mut cur = uses.clone();
    let mut nd = def_counts(f);
    let mut changed = false;
    let mut rem = vec![0i32; f.vars.len()];
    let vars = &f.vars;
    for b in &mut f.blocks {
        let mut passed = 0usize;
        let mut active = false;
        let mut i = 0usize;
        while i < b.stmts.len() {
            if active {
                while passed < i {
                    x.sinfo(&b.stmts[passed], |v| rem[v as usize] -= 1);
                    passed += 1;
                }
            }
            if let Stmt::Call { dst, .. } = b.stmts[i] {
                if dst >= 0 && inline_call(x, vars, b, i, &uses, &mut nd, &cur) {
                    cur[dst as usize] -= 1;
                    if active {
                        rem[dst as usize] -= 1;
                    }
                    changed = true;
                    continue;
                }
            }
            let Stmt::Set { dst, e: se, .. } = b.stmts[i] else {
                i += 1;
                continue;
            };
            let v = dst as u32;
            let vi = v as usize;
            if !(uses[vi] == 1 && nd[vi] == 1 && vars[vi].param < 0) {
                if cur[vi] == 0 {
                    i += 1;
                    continue;
                }
                if !active {
                    for k in i..b.stmts.len() {
                        x.sinfo(&b.stmts[k], |y| rem[y as usize] += 1);
                    }
                    if let Some(te) = term_expr(&b.term) {
                        x.evars(te, |y| rem[y as usize] += 1);
                    }
                    passed = i;
                    active = true;
                }
                if rem[vi] == x.count_in(&b.stmts[i], v) || local_reach(x, b, i, v) != 1 {
                    i += 1;
                    continue;
                }
            }
            let fx = x.fx(se);
            let mut reads: Vec<u32> = vec![];
            x.evars(se, |y| reads.push(y));
            // find use
            let mut found: isize = -1;
            let n = b.stmts.len();
            for j in i + 1..=n {
                if j == n {
                    if let Some(te) = term_expr(&b.term) {
                        if x.uses_var(te, v) {
                            found = j as isize;
                        }
                    }
                    break;
                }
                let t = &b.stmts[j];
                let mut has = false;
                let tf = x.sinfo(t, |y| has |= y == v);
                if has {
                    found = j as isize;
                    break;
                }
                if let Some(d) = def_of(t) {
                    if reads.contains(&d) {
                        break;
                    }
                }
                let t_loads = tf & LOAD != 0;
                let t_calls = matches!(t, Stmt::Call { .. }) || tf & CALL != 0;
                let t_writes = matches!(
                    t,
                    Stmt::Store { .. } | Stmt::Stores { .. } | Stmt::Copy { .. } | Stmt::Trap { .. }
                ) || t_calls;
                if fx != 0 && t_writes {
                    break;
                }
                if fx & CALL != 0 && (t_loads || tf & TRAP != 0) {
                    break;
                }
            }
            if found < 0 {
                i += 1;
                continue;
            }
            let found = found as usize;
            if fx != 0 {
                let es = use_exprs(x, b, found);
                if es.iter().any(|&e| occurs_lazily(x, e, v)) {
                    i += 1;
                    continue;
                }
            }
            let mut m = VarMap::new(vars.len());
            m.set(v, se);
            if found < b.stmts.len() {
                let ns = x.map_stmt(&b.stmts[found], &mut |x, e| x.subst_vars(e, &m));
                b.stmts[found] = ns;
            } else {
                match &mut b.term {
                    Term::Br { c, .. } => *c = x.subst_vars(*c, &m),
                    Term::Ret { e: Some(e) } => *e = x.subst_vars(*e, &m),
                    _ => {}
                }
            }
            b.stmts.remove(i);
            nd[vi] -= 1;
            cur[vi] -= 1;
            if active {
                rem[vi] -= 1;
            }
            changed = true;
        }
        if !active {
            continue;
        }
        while passed < b.stmts.len() {
            x.sinfo(&b.stmts[passed], |v| rem[v as usize] -= 1);
            passed += 1;
        }
        if let Some(te) = term_expr(&b.term) {
            x.evars(te, |y| rem[y as usize] -= 1);
        }
    }
    *exact = Some(cur);
    changed
}

fn use_exprs(x: &mut Fx, b: &Block, j: usize) -> Vec<E> {
    if j < b.stmts.len() {
        let mut v = vec![];
        stmt_exprs(&x.ir, &b.stmts[j], &mut v);
        v
    } else {
        term_expr(&b.term).into_iter().collect()
    }
}

/// v occurs where it may not be evaluated (select arms, right side of && / ||).
fn occurs_lazily(x: &mut Fx, e: E, v: u32) -> bool {
    let mut lazy = false;
    let ir = &x.ir;
    let inside = |y: E| {
        let mut h = false;
        ir.walk(y, &mut |_, n| h |= n == Node::Var(v));
        h
    };
    ir.walk(e, &mut |_, n| match n {
        Node::Sel(_, a, b) => {
            if inside(a) || inside(b) {
                lazy = true
            }
        }
        Node::Land(_, b) | Node::Lor(_, b) => {
            if inside(b) {
                lazy = true
            }
        }
        _ => {}
    });
    lazy
}

/// If the definition of v at stmt i only reaches uses inside this block, how many (stops at 2);
/// else -1.
fn local_reach(x: &mut Fx, b: &Block, i: usize, v: u32) -> i32 {
    let mut n = 0;
    for j in i + 1..b.stmts.len() {
        let t = &b.stmts[j];
        n += x.count_in(t, v);
        if let Stmt::Set { dst, .. } | Stmt::Call { dst, .. } = t {
            if *dst == v as i32 {
                return n;
            }
        }
        if n >= 2 {
            return n;
        }
    }
    if let Some(te) = term_expr(&b.term) {
        x.evars(te, |y| n += (y == v) as i32);
    }
    if b.succs.is_empty() {
        n
    } else {
        -1
    }
}

/// `v = call(...)` immediately followed by the single use of v -> call expression at the use site.
fn inline_call(
    x: &mut Fx,
    vars: &[sbpf_program::VarInfo],
    b: &mut Block,
    i: usize,
    uses: &[i32],
    nd: &mut [i32],
    cur: &[i32],
) -> bool {
    let Stmt::Call {
        dst,
        ref t,
        args,
        extra,
        ..
    } = b.stmts[i]
    else {
        unreachable!()
    };
    let v = dst as u32;
    let vi = v as usize;
    if !(uses[vi] == 1 && nd[vi] == 1 && vars[vi].param < 0)
        && (cur[vi] == 0 || local_reach(x, b, i, v) != 1)
    {
        return false;
    }
    let next: Vec<E> = if i + 1 < b.stmts.len() {
        let mut v = vec![];
        stmt_exprs(&x.ir, &b.stmts[i + 1], &mut v);
        v
    } else {
        match term_expr(&b.term) {
            Some(e) => vec![e],
            None => return false,
        }
    };
    let (mut hit, mut impure) = (false, false);
    for &e in &next {
        hit |= x.uses_var(e, v);
        if x.fx(e) != 0 {
            impure = true;
        }
    }
    if !hit || impure || next.iter().any(|&e| occurs_lazily(x, e, v)) {
        return false;
    }
    let mut all = x.ir.to_vec(args);
    if let Some(xl) = extra {
        all.extend(x.ir.items(xl));
    }
    let ti = x.ir.mk_target(t.clone());
    let l = x.ir.list(all);
    let ce = x.ir.mk(Node::Call(ti, l));
    let mut m = VarMap::new(vars.len());
    m.set(v, ce);
    if i + 1 < b.stmts.len() {
        let ns = x.map_stmt(&b.stmts[i + 1], &mut |x, e| x.subst_vars(e, &m));
        b.stmts[i + 1] = ns;
    } else {
        match &mut b.term {
            Term::Br { c, .. } => *c = x.subst_vars(*c, &m),
            Term::Ret { e: Some(e) } => *e = x.subst_vars(*e, &m),
            _ => {}
        }
    }
    b.stmts.remove(i);
    nd[vi] -= 1;
    true
}

/// Remove definitions of unused variables (keeping anything that may trap or has effects).
fn dce(x: &mut Fx, f: &mut Func, initial: Option<Vec<i32>>) -> bool {
    let mut changed = false;
    let mut uses = match initial {
        Some(u) => u,
        None => count_uses(x, f),
    };
    for _ in 0..10 {
        let mut next = uses.clone();
        let mut any = false;
        for b in &mut f.blocks {
            let old = std::mem::take(&mut b.stmts);
            let mut out: Vec<Stmt> = Vec::with_capacity(old.len());
            for s in old {
                match s {
                    Stmt::Set { dst, e, pc } => {
                        if x.node(e) == Node::Var(dst as u32) {
                            any = true;
                            x.sinfo(&s, |v| next[v as usize] -= 1);
                            continue;
                        }
                        if uses[dst as usize] == 0 {
                            if x.fx(e) != 0 {
                                out.push(Stmt::Eval { e, pc });
                            } else {
                                x.sinfo(&s, |v| next[v as usize] -= 1);
                            }
                            any = true;
                            continue;
                        }
                        out.push(s);
                    }
                    Stmt::Call { dst, .. } if dst >= 0 && uses[dst as usize] == 0 => {
                        let mut s = s;
                        if let Stmt::Call { dst, .. } = &mut s {
                            *dst = -1;
                        }
                        out.push(s);
                        any = true;
                    }
                    Stmt::Eval { e, pc } => {
                        if x.fx(e) == 0 {
                            any = true;
                            x.sinfo(&s, |v| next[v as usize] -= 1);
                            continue;
                        }
                        let inner = trapping_core(x, e);
                        if inner != e {
                            let ns = Stmt::Eval { e: inner, pc };
                            x.sinfo(&s, |v| next[v as usize] -= 1);
                            x.sinfo(&ns, |v| next[v as usize] += 1);
                            out.push(ns);
                            any = true;
                            continue;
                        }
                        out.push(s);
                    }
                    s => out.push(s),
                }
            }
            b.stmts = out;
        }
        if !any {
            break;
        }
        uses = next;
        changed = true;
    }
    changed
}

/// For an evaluated-for-effect expression, drop pure wrappers around a single trapping core.
fn trapping_core(x: &mut Fx, e: E) -> E {
    let n = x.node(e);
    let mut kids: Vec<E> = vec![];
    match n {
        Node::Load { .. } => return e,
        Node::Fn(name, _) if x.intr(name).is_mem() => return e,
        Node::Bin(op, _, _) if is_div_op(op) => return e,
        Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
            kids.push(a);
            kids.push(b)
        }
        Node::Neg(a) | Node::Not(a) | Node::Ext { a, .. } | Node::Bswap { a, .. } | Node::Lnot(a) => {
            kids.push(a)
        }
        Node::Fn(_, args) => kids.extend(x.ir.items(args)),
        _ => {}
    }
    let impure: Vec<E> = kids.into_iter().filter(|&k| x.fx(k) != 0).collect();
    if impure.len() == 1 && !matches!(n, Node::Land(..) | Node::Lor(..)) {
        return trapping_core(x, impure[0]);
    }
    e
}

/// Branch on a constant becomes a jump.
fn fold_const_branches(x: &Fx, f: &mut Func) -> bool {
    let mut touched = false;
    for bi in 0..f.blocks.len() {
        let Term::Br { c, t, f: fl } = f.blocks[bi].term else {
            continue;
        };
        let Some(v) = x.cv(c) else { continue };
        let (to, other) = if v != 0 { (t, fl) } else { (fl, t) };
        let id = f.blocks[bi].id;
        f.blocks[bi].term = Term::Jmp { to };
        if other != to {
            f.blocks[other as usize].preds.retain(|&p| p != id);
        }
        f.blocks[bi].succs = vec![to as usize];
        touched = true;
    }
    touched
}
