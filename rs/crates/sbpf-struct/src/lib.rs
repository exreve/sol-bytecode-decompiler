//! Stage 4a: control-flow structuring. Ports `src/structure.ts` (stackifier structuring, node splitting
//! for irreducible CFGs, the state-machine fallback, the clean-up passes) and `src/stmtidioms.ts`.
//!
//! The structured body is a tree of [`SNode`]s. Statements live in a per-function table
//! ([`Tree::stmts`]) and nodes refer to them by index: a TS statement *object* is an index here, so
//! identity-keyed maps of the later stages (declarations) port 1:1 — a statement copied by the TS
//! code (`{ ...s }`: node splitting, `cloneNodes`) is a new table entry, a moved one keeps its index.

use sbpf_ir::{Stmt, E};
use std::sync::Arc;

pub mod stmtidioms;
pub mod structure;

pub use stmtidioms::statement_idioms;
pub use structure::{cleanup, structure};

/// A label: `L<block>` (loop header), `B<block>` (merge block), or the dispatcher loop's `L`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Label {
    L(u32),
    B(u32),
    Disp,
}

impl Label {
    /// `label.startsWith('L')`
    pub fn is_l(self) -> bool {
        !matches!(self, Label::B(_))
    }
    /// `label.startsWith('B')`
    pub fn is_b(self) -> bool {
        matches!(self, Label::B(_))
    }
    pub fn write(self, o: &mut String) {
        use std::fmt::Write;
        match self {
            Label::L(b) => write!(o, "L{b}").unwrap(),
            Label::B(b) => write!(o, "B{b}").unwrap(),
            Label::Disp => o.push('L'),
        }
    }
    pub fn text(self) -> String {
        let mut s = String::new();
        self.write(&mut s);
        s
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Form {
    For,
    While,
    Do,
}

impl Form {
    pub fn as_str(self) -> &'static str {
        match self {
            Form::For => "for",
            Form::While => "while",
            Form::Do => "do",
        }
    }
}

/// `src/structure.ts` `Node`.
#[derive(Clone, Debug)]
pub enum SNode {
    /// index into [`Tree::stmts`]
    Stmt(u32),
    If {
        c: E,
        then: Vec<SNode>,
        els: Vec<SNode>,
    },
    Block {
        label: Label,
        body: Vec<SNode>,
    },
    Loop {
        label: Option<Label>,
        body: Vec<SNode>,
        form: Form,
        c: Option<E>,
    },
    Break(Option<Label>),
    Continue(Option<Label>),
    Return(Option<E>),
    Trap(Arc<str>),
    Switch {
        v: u32,
        cases: Vec<(Vec<i64>, Vec<SNode>)>,
    },
    SetState {
        v: u32,
        val: i64,
    },
}

/// A function's structured body and its statement table.
#[derive(Clone, Debug, Default)]
pub struct Tree {
    pub stmts: Vec<Stmt>,
    pub body: Vec<SNode>,
    pub irreducible: bool,
}

impl Tree {
    pub fn stmt(&self, i: u32) -> &Stmt {
        &self.stmts[i as usize]
    }
    pub fn push(&mut self, s: Stmt) -> u32 {
        self.stmts.push(s);
        (self.stmts.len() - 1) as u32
    }
}
