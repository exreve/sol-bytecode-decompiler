//! Intermediate representation: a port of `src/ir.ts`. Every value is an unsigned 64-bit integer;
//! every operator has exactly the sBPF VM semantics.
//!
//! Pcs are `i64`: jump and call targets may fall outside the text (negative or past the end) and are
//! kept as computed, like the TS numbers.

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

#[derive(Clone, Debug, PartialEq)]
pub enum Expr {
    Const(u64),
    Var(u32),
    /// pre-variable-recovery register read
    Reg(u8),
    Undef,
    Bin(BinOp, Box<Expr>, Box<Expr>),
    Neg(Box<Expr>),
    Not(Box<Expr>),
    /// truncate to bits then zero/sign extend to 64
    Ext {
        signed: bool,
        bits: u8,
        a: Box<Expr>,
    },
    Bswap {
        bits: u8,
        a: Box<Expr>,
    },
    Load {
        size: u8,
        addr: Box<Expr>,
    },
    Cmp(CmpOp, Box<Expr>, Box<Expr>),
    Lnot(Box<Expr>),
    Land(Box<Expr>, Box<Expr>),
    Lor(Box<Expr>, Box<Expr>),
    Sel {
        c: Box<Expr>,
        a: Box<Expr>,
        b: Box<Expr>,
    },
    Call {
        t: CallTarget,
        args: Vec<Expr>,
    },
    Fn {
        name: String,
        args: Vec<Expr>,
    },
}

#[derive(Clone, Debug, PartialEq)]
pub enum CallTarget {
    Fn { pc: i64 },
    Sys { name: Rc<str>, hash: u32 },
    Ind { e: Box<Expr> },
}

#[derive(Clone, Debug, PartialEq)]
pub enum Stmt {
    Set {
        dst: i32,
        e: Expr,
        pc: i64,
    },
    Store {
        size: u8,
        addr: Expr,
        v: Expr,
        pc: i64,
    },
    Call {
        dst: i32,
        t: CallTarget,
        args: Vec<Expr>,
        pc: i64,
        extra: Option<Vec<Expr>>,
    },
    Eval {
        e: Expr,
        pc: i64,
    },
    Stores {
        size: u8,
        addr: Expr,
        vals: Vec<Expr>,
        pc: i64,
    },
    Copy {
        dst: Expr,
        src: Expr,
        n: u64,
        pc: i64,
        rev: Option<bool>,
    },
    Trap {
        msg: String,
        pc: i64,
    },
}

#[derive(Clone, Debug, PartialEq)]
pub enum Term {
    Jmp { to: i64 },
    Br { c: Expr, t: i64, f: i64 },
    Ret { e: Option<Expr> },
    Trap { msg: String },
    Tail,
}

pub fn c(v: u64) -> Expr {
    Expr::Const(v)
}
pub fn r(r: u8) -> Expr {
    Expr::Reg(r)
}
pub fn b(op: BinOp, a: Expr, b: Expr) -> Expr {
    Expr::Bin(op, Box::new(a), Box::new(b))
}
pub fn x(signed: bool, bits: u8, a: Expr) -> Expr {
    Expr::Ext {
        signed,
        bits,
        a: Box::new(a),
    }
}
pub fn cmp(op: CmpOp, a: Expr, b: Expr) -> Expr {
    Expr::Cmp(op, Box::new(a), Box::new(b))
}
