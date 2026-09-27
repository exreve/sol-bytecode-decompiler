//! Validation consistency across instructions (`src/analysis/consistency.ts`): the accounts of the same role
//! (IDL account type, data length, name) and the validations most of the other instructions apply to them.

use super::report::Loc;

#[derive(Clone, Debug)]
pub struct RoleMember {
    pub ix: String,
    pub account: String,
    pub validations: Vec<String>,
    pub uses: Vec<String>,
}

#[derive(Clone, Debug)]
pub struct Inconsistency {
    pub role: String,
    pub ix: String,
    pub account: String,
    pub validation: String,
    pub applied_in: Vec<(String, String, Option<Loc>)>,
    pub others: usize,
    pub uses: Vec<String>,
    pub weight: f64,
}

#[derive(Clone, Debug)]
pub struct RoleView {
    pub role: String,
    pub by: &'static str,
    pub members: Vec<RoleMember>,
    pub inconsistencies: Vec<Inconsistency>,
}

impl<'a> super::An<'a> {
    /// consistency(a, r)
    pub fn consistency(&self, _a: &super::report::Analysis) -> Vec<RoleView> {
        vec![]
    }
}
