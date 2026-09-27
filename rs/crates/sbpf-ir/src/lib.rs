//! Intermediate representation: a port of `src/ir.ts`. Every value is an unsigned 64-bit integer;
//! every operator has exactly the sBPF VM semantics.
//!
//! Representation (see docs/RUST_PORT.md, "IR representation"): expressions are immutable 16-byte
//! nodes in an append-only arena ([`Ir`]) addressed by [`E`] ids; lists (call arguments, `stores`
//! values) are runs of consecutive `Item` nodes in the same arena ([`L`]). There is no hash-consing:
//! every constructor call creates a new node, so an id is the exact counterpart of a JS object
//! reference (`a === b` in TS is `a == b` on ids, and "the pass returned the same object" keeps its
//! meaning). Statements and terminators are small `Clone` values holding ids.
//!
//! The arena uses interior mutability so that nested constructors (`ir.bin(Add, ir.reg(1), ir.c(8))`)
//! work through a shared reference. It is sound because no method ever hands out a reference into its
//! vectors: every read copies a `Node` / `E` out.
//!
//! Pcs are `i64`: jump and call targets may fall outside the text (negative or past the end) and are
//! kept as computed, like the TS numbers.

use std::cell::UnsafeCell;
use std::rc::Rc;

macro_rules! str_enum {
    ($name:ident { $($v:ident = $s:literal),* $(,)? }) => {
        #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
        pub enum $name { $($v),* }
        impl $name {
            pub fn as_str(self) -> &'static str { match self { $(Self::$v => $s),* } }
        }
    };
}

str_enum!(BinOp {
    Add = "add", Sub = "sub", Mul = "mul",
    Udiv = "udiv", Urem = "urem",
    Sdiv = "sdiv", Srem = "srem",
    Sdiv32 = "sdiv32", Srem32 = "srem32",
    And = "and", Or = "or", Xor = "xor",
    Shl = "shl", Lshr = "lshr", Ashr = "ashr",
    Uhmul = "uhmul", Shmul = "shmul",
});

str_enum!(CmpOp {
    Eq = "eq", Ne = "ne", Ugt = "ugt", Uge = "uge", Ult = "ult", Ule = "ule",
    Sgt = "sgt", Sge = "sge", Slt = "slt", Sle = "sle", Set = "set",
});

/// Expression id (index into an [`Ir`] arena).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct E(pub u32);

/// A list of expressions: `len` consecutive `Node::Item`s starting at `start`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Default)]
pub struct L {
    pub start: u32,
    pub len: u32,
}

/// One expression node (16 bytes). `Call` and `Fn` refer to side tables of the arena.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Node {
    Const(u64),
    Var(u32),
    /// pre-variable-recovery register read
    Reg(u8),
    Undef,
    Bin(BinOp, E, E),
    Neg(E),
    Not(E),
    /// truncate to bits then zero/sign extend to 64
    Ext {
        signed: bool,
        bits: u8,
        a: E,
    },
    Bswap {
        bits: u8,
        a: E,
    },
    Load {
        size: u8,
        addr: E,
    },
    Cmp(CmpOp, E, E),
    Lnot(E),
    Land(E, E),
    Lor(E, E),
    Sel(E, E, E),
    /// call expression: target (index into the arena's targets), arguments
    Call(u32, L),
    /// intrinsic: name (index into the arena's names), arguments
    Fn(u32, L),
    /// list element (see [`L`])
    Item(E),
}

#[derive(Clone, Debug, PartialEq)]
pub enum CallTarget {
    Fn { pc: i64 },
    Sys { name: Rc<str>, hash: u32 },
    Ind { e: E },
}

#[derive(Clone, Debug, PartialEq)]
pub enum Stmt {
    Set {
        dst: i32,
        e: E,
        pc: i64,
    },
    Store {
        size: u8,
        addr: E,
        v: E,
        pc: i64,
    },
    Call {
        dst: i32,
        t: CallTarget,
        args: L,
        pc: i64,
        extra: Option<L>,
    },
    Eval {
        e: E,
        pc: i64,
    },
    Stores {
        size: u8,
        addr: E,
        vals: L,
        pc: i64,
    },
    Copy {
        dst: E,
        src: E,
        n: u64,
        pc: i64,
        rev: Option<bool>,
    },
    Trap {
        msg: Rc<str>,
        pc: i64,
    },
}

#[derive(Clone, Debug, PartialEq)]
pub enum Term {
    Jmp { to: i64 },
    Br { c: E, t: i64, f: i64 },
    Ret { e: Option<E> },
    Trap { msg: Rc<str> },
    Tail,
}

/// Append-only expression arena (one per program for the lifted IR, one per function from variable
/// recovery on).
#[derive(Default)]
pub struct Ir {
    nodes: UnsafeCell<Vec<Node>>,
    targets: UnsafeCell<Vec<CallTarget>>,
    names: UnsafeCell<Vec<Rc<str>>>,
}

impl Ir {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn with_capacity(n: usize) -> Self {
        Ir {
            nodes: UnsafeCell::new(Vec::with_capacity(n)),
            ..Self::default()
        }
    }
    /// Number of nodes allocated so far.
    #[inline]
    pub fn len(&self) -> usize {
        // SAFETY: no reference into the vector is ever handed out (see the module docs)
        unsafe { (&*self.nodes.get()).len() }
    }
    #[inline]
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
    #[inline]
    pub fn get(&self, e: E) -> Node {
        // SAFETY: see `len`
        unsafe { *(&*self.nodes.get()).get_unchecked(e.0 as usize) }
    }
    #[inline]
    pub fn mk(&self, n: Node) -> E {
        // SAFETY: see `len`
        unsafe {
            let v = &mut *self.nodes.get();
            v.push(n);
            E((v.len() - 1) as u32)
        }
    }
    /// A new list of the given elements (each becomes an `Item` node).
    pub fn list(&self, es: impl IntoIterator<Item = E>) -> L {
        let start = self.len() as u32;
        let mut len = 0;
        for e in es {
            self.mk(Node::Item(e));
            len += 1;
        }
        L { start, len }
    }
    #[inline]
    pub fn at(&self, l: L, i: u32) -> E {
        debug_assert!(i < l.len);
        match self.get(E(l.start + i)) {
            Node::Item(e) => e,
            _ => unreachable!("not a list"),
        }
    }
    /// The list's elements (copied out).
    pub fn items(&self, l: L) -> Items<'_> {
        Items { ir: self, l, i: 0 }
    }
    pub fn to_vec(&self, l: L) -> Vec<E> {
        self.items(l).collect()
    }
    pub fn target(&self, i: u32) -> CallTarget {
        // SAFETY: see `len` (the target is cloned out)
        unsafe { (&*self.targets.get())[i as usize].clone() }
    }
    pub fn mk_target(&self, t: CallTarget) -> u32 {
        // SAFETY: see `len`
        unsafe {
            let v = &mut *self.targets.get();
            v.push(t);
            (v.len() - 1) as u32
        }
    }
    pub fn name(&self, i: u32) -> Rc<str> {
        // SAFETY: see `len`
        unsafe { (&*self.names.get())[i as usize].clone() }
    }
    pub fn mk_name(&self, s: Rc<str>) -> u32 {
        // SAFETY: see `len`
        unsafe {
            let v = &mut *self.names.get();
            v.push(s);
            (v.len() - 1) as u32
        }
    }

    // ---- constructors (each creates a new node) ----
    #[inline]
    pub fn c(&self, v: u64) -> E {
        self.mk(Node::Const(v))
    }
    #[inline]
    pub fn reg(&self, r: u8) -> E {
        self.mk(Node::Reg(r))
    }
    #[inline]
    pub fn var(&self, id: u32) -> E {
        self.mk(Node::Var(id))
    }
    #[inline]
    pub fn undef(&self) -> E {
        self.mk(Node::Undef)
    }
    #[inline]
    pub fn bin(&self, op: BinOp, a: E, b: E) -> E {
        self.mk(Node::Bin(op, a, b))
    }
    #[inline]
    pub fn ext(&self, signed: bool, bits: u8, a: E) -> E {
        self.mk(Node::Ext { signed, bits, a })
    }
    #[inline]
    pub fn cmp(&self, op: CmpOp, a: E, b: E) -> E {
        self.mk(Node::Cmp(op, a, b))
    }
    #[inline]
    pub fn load(&self, size: u8, addr: E) -> E {
        self.mk(Node::Load { size, addr })
    }

    /// Deep copy of `e` from another arena (new nodes for every node, as the TS object graph would
    /// be rebuilt), with `leaf` replacing nodes first (pre-order, `mapExprPre`).
    pub fn import(&self, from: &Ir, e: E, leaf: &mut impl FnMut(&Ir, E, Node) -> Option<E>) -> E {
        let n = from.get(e);
        if let Some(r) = leaf(self, e, n) {
            return r;
        }
        match n {
            Node::Bin(op, a, b) => {
                let a = self.import(from, a, leaf);
                let b = self.import(from, b, leaf);
                self.mk(Node::Bin(op, a, b))
            }
            Node::Cmp(op, a, b) => {
                let a = self.import(from, a, leaf);
                let b = self.import(from, b, leaf);
                self.mk(Node::Cmp(op, a, b))
            }
            Node::Land(a, b) => {
                let a = self.import(from, a, leaf);
                let b = self.import(from, b, leaf);
                self.mk(Node::Land(a, b))
            }
            Node::Lor(a, b) => {
                let a = self.import(from, a, leaf);
                let b = self.import(from, b, leaf);
                self.mk(Node::Lor(a, b))
            }
            Node::Neg(a) => {
                let a = self.import(from, a, leaf);
                self.mk(Node::Neg(a))
            }
            Node::Not(a) => {
                let a = self.import(from, a, leaf);
                self.mk(Node::Not(a))
            }
            Node::Lnot(a) => {
                let a = self.import(from, a, leaf);
                self.mk(Node::Lnot(a))
            }
            Node::Ext { signed, bits, a } => {
                let a = self.import(from, a, leaf);
                self.mk(Node::Ext { signed, bits, a })
            }
            Node::Bswap { bits, a } => {
                let a = self.import(from, a, leaf);
                self.mk(Node::Bswap { bits, a })
            }
            Node::Load { size, addr } => {
                let addr = self.import(from, addr, leaf);
                self.mk(Node::Load { size, addr })
            }
            Node::Sel(c, a, b) => {
                let c = self.import(from, c, leaf);
                let a = self.import(from, a, leaf);
                let b = self.import(from, b, leaf);
                self.mk(Node::Sel(c, a, b))
            }
            Node::Call(t, args) => {
                let t = match from.target(t) {
                    CallTarget::Ind { e } => CallTarget::Ind {
                        e: self.import(from, e, leaf),
                    },
                    t => t,
                };
                let args = self.import_list(from, args, leaf);
                let t = self.mk_target(t);
                self.mk(Node::Call(t, args))
            }
            Node::Fn(name, args) => {
                let args = self.import_list(from, args, leaf);
                let name = self.mk_name(from.name(name));
                self.mk(Node::Fn(name, args))
            }
            Node::Item(_) => unreachable!("list item as expression"),
            leafn => self.mk(leafn),
        }
    }
    pub fn import_list(
        &self,
        from: &Ir,
        l: L,
        leaf: &mut impl FnMut(&Ir, E, Node) -> Option<E>,
    ) -> L {
        let v: Vec<E> = from.items(l).map(|e| self.import(from, e, leaf)).collect();
        self.list(v)
    }

    /// Calls `f` on every node of `e`, pre-order (walkExpr).
    pub fn walk(&self, e: E, f: &mut impl FnMut(E, Node)) {
        let n = self.get(e);
        f(e, n);
        match n {
            Node::Bin(_, a, b) | Node::Cmp(_, a, b) | Node::Land(a, b) | Node::Lor(a, b) => {
                self.walk(a, f);
                self.walk(b, f);
            }
            Node::Neg(a)
            | Node::Not(a)
            | Node::Lnot(a)
            | Node::Ext { a, .. }
            | Node::Bswap { a, .. } => self.walk(a, f),
            Node::Load { addr, .. } => self.walk(addr, f),
            Node::Sel(c, a, b) => {
                self.walk(c, f);
                self.walk(a, f);
                self.walk(b, f);
            }
            Node::Call(t, args) => {
                if let CallTarget::Ind { e } = self.target(t) {
                    self.walk(e, f);
                }
                for a in self.items(args) {
                    self.walk(a, f);
                }
            }
            Node::Fn(_, args) => {
                for a in self.items(args) {
                    self.walk(a, f);
                }
            }
            _ => {}
        }
    }
}

pub struct Items<'a> {
    ir: &'a Ir,
    l: L,
    i: u32,
}

impl Iterator for Items<'_> {
    type Item = E;
    #[inline]
    fn next(&mut self) -> Option<E> {
        if self.i >= self.l.len {
            return None;
        }
        let e = self.ir.at(self.l, self.i);
        self.i += 1;
        Some(e)
    }
    fn size_hint(&self) -> (usize, Option<usize>) {
        let n = (self.l.len - self.i) as usize;
        (n, Some(n))
    }
}

impl ExactSizeIterator for Items<'_> {}
