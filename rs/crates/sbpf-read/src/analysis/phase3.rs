//! Phase 3 (`src/analysis/phase3.ts`): path conditions of the operations, authority chains, arithmetic and
//! division sites, per-operation proof checklists, the state machine of status-like fields.

use super::report::Loc;

#[derive(Clone, Debug)]
pub struct PathCond {
    pub at: Loc,
    pub cond: String,
    pub holds: bool,
    pub how: &'static str,
    pub check: Option<usize>,
}

#[derive(Clone, Debug)]
pub struct PathInfo {
    pub op: usize,
    pub conds: Vec<PathCond>,
    pub not_required: Vec<(usize, Option<Vec<Loc>>)>,
    pub truncated: Option<bool>,
}

#[derive(Clone, Debug)]
pub struct ChainStep {
    pub kind: &'static str,
    pub what: String,
    pub status: Option<&'static str>,
}

#[derive(Clone, Debug)]
pub struct Chain {
    pub op: usize,
    pub steps: Vec<Vec<ChainStep>>,
}

#[derive(Clone, Debug)]
pub struct ArithSite {
    pub at: Loc,
    pub op: Option<usize>,
    pub target: String,
    pub expr: String,
    pub kind: &'static str,
    pub status: &'static str,
    pub guard: Option<(Loc, String)>,
    pub caller: Option<bool>,
    pub unnamed: Option<bool>,
}

#[derive(Clone, Debug)]
pub struct DivSite {
    pub at: Loc,
    pub expr: String,
    pub divisor: String,
    pub status: &'static str,
    pub guard: Option<(Loc, String)>,
}

#[derive(Clone, Debug)]
pub struct Prop {
    pub prop: &'static str,
    pub status: &'static str,
    pub evidence: String,
}

#[derive(Clone, Debug)]
pub struct Proof {
    pub op: usize,
    pub kind: String,
    pub props: Vec<Prop>,
}

#[derive(Clone, Debug)]
pub struct StateField {
    pub field: String,
    pub set_by: Vec<(String, String, Loc)>,
    pub checked_by: Vec<(String, String, Loc)>,
}

impl<'a> super::An<'a> {
    /// phase3Ix (8b: in progress)
    pub fn phase3_ix(
        &self,
        _a: &mut super::report::Analysis,
        _xi: usize,
        _info: &super::ixctx::IxInfo<'a>,
        _s: &super::sources::SourceCtx<'a, '_>,
    ) {
    }
    /// stateMachine
    pub fn state_machine(&self, _a: &super::report::Analysis) -> Vec<StateField> {
        vec![]
    }
}
