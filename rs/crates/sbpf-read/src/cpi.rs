//! `src/cpi.ts`: CPI / PDA / fmt call sites of a structured body (frame contents at the call along
//! straight-line code), their one-line descriptions, and the frame objects they show the role of.

use crate::sem::known_key;
use crate::util::{b58, expr_eq, fo_any, has_call, js_num, json_str, N};
use sbpf_ir::{BinOp, CallTarget, Ir, Node, Stmt, E};
use sbpf_struct::{SNode, Tree};
use std::collections::HashMap;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SiteKind {
    C,
    Rust,
    PdaFind,
    PdaCreate,
    PdaFindOut,
    PdaCreateOut,
    Invoke,
    Call,
}

impl SiteKind {
    pub fn is_pda(self) -> bool {
        matches!(
            self,
            SiteKind::PdaFind | SiteKind::PdaCreate | SiteKind::PdaFindOut | SiteKind::PdaCreateOut
        )
    }
}

#[derive(Clone, Debug)]
pub struct Fact {
    pub off: N,
    pub size: N,
    pub e: E,
}

#[derive(Clone, Debug)]
pub struct CpiSite {
    pub abi: SiteKind,
    pub args: Vec<E>,
    pub facts: Vec<Fact>,
    pub t: Option<CallTarget>,
}

/// Sites keyed by the node containing the call (in discovery order).
pub type Sites<'t> = indexmap::IndexMap<*const SNode, (&'t SNode, CpiSite)>;

/// addOff (cpi.ts)
pub fn add_off(ir: &Ir, e: E, i: N) -> E {
    if i == 0.0 {
        return e;
    }
    let iu = crate::util::big_u(i);
    match ir.get(e) {
        Node::Const(v) => ir.c(v.wrapping_add(iu)),
        Node::Bin(BinOp::Add, a, b) => match ir.get(b) {
            Node::Const(c) => {
                let c2 = ir.c(c.wrapping_add(iu));
                ir.bin(BinOp::Add, a, c2)
            }
            _ => {
                let c2 = ir.c(iu);
                ir.bin(BinOp::Add, e, c2)
            }
        },
        _ => {
            let c2 = ir.c(iu);
            ir.bin(BinOp::Add, e, c2)
        }
    }
}

/// findCpiSites
pub fn find_cpi_sites<'t>(
    ir: &Ir,
    tree: &'t Tree,
    body: &'t [SNode],
    fp: Option<u32>,
    abi_of: &dyn Fn(&CallTarget) -> Option<SiteKind>,
) -> Sites<'t> {
    struct W<'a, 't> {
        ir: &'a Ir,
        tree: &'t Tree,
        fp: Option<u32>,
        abi_of: &'a dyn Fn(&CallTarget) -> Option<SiteKind>,
        sites: Sites<'t>,
        info: HashMap<E, (Vec<u32>, Vec<(N, N)>)>,
    }
    impl<'t> W<'_, 't> {
        fn fo(&self, e: E) -> Option<N> {
            fo_any(self.ir, e, self.fp)
        }
        fn info_of(&mut self, e: E) -> &(Vec<u32>, Vec<(N, N)>) {
            if !self.info.contains_key(&e) {
                let mut vars = Vec::new();
                let mut loads = Vec::new();
                let ir = self.ir;
                let fp = self.fp;
                ir.walk(e, &mut |_, x| match x {
                    Node::Var(v) => {
                        if !vars.contains(&v) {
                            vars.push(v)
                        }
                    }
                    Node::Load { size, addr } => {
                        if let Some(lo) = fo_any(ir, addr, fp) {
                            loads.push((lo, size as N));
                        }
                    }
                    _ => {}
                });
                self.info.insert(e, (vars, loads));
            }
            &self.info[&e]
        }
        fn mentions(&mut self, e: E, v: u32) -> bool {
            self.info_of(e).0.contains(&v)
        }
        fn reads_changed(&mut self, e: E, o: N, n: N) -> bool {
            self.info_of(e)
                .1
                .iter()
                .any(|&(lo, size)| lo < o + n && o < lo + size)
        }
        fn kill(&mut self, facts: Vec<Fact>, o: N, n: N) -> Vec<Fact> {
            let mut out = Vec::new();
            for f in facts {
                if !(f.off < o + n && o < f.off + f.size) && !self.reads_changed(f.e, o, n) {
                    out.push(f);
                }
            }
            out
        }
        fn qualifies(&self, abi: SiteKind, args: &[E]) -> bool {
            (abi != SiteKind::Call && !abi.is_pda()) || args.iter().any(|&a| self.fo(a).is_some())
        }
        fn note(&mut self, n: &'t SNode, e: Option<E>, facts: &[Fact]) {
            let Some(e) = e else { return };
            let ir = self.ir;
            let mut found: Vec<(CallTarget, Vec<E>)> = Vec::new();
            ir.walk(e, &mut |_, x| {
                if let Node::Call(t, args) = x {
                    let t = ir.target(t);
                    if !matches!(t, CallTarget::Ind { .. }) {
                        found.push((t, ir.to_vec(args)));
                    }
                }
            });
            let key = n as *const SNode;
            for (t, args) in found {
                if let Some(abi) = (self.abi_of)(&t) {
                    if !self.sites.contains_key(&key) && self.qualifies(abi, &args) {
                        self.sites.insert(
                            key,
                            (
                                n,
                                CpiSite {
                                    abi,
                                    args,
                                    facts: facts.to_vec(),
                                    t: Some(t),
                                },
                            ),
                        );
                    }
                }
            }
        }
        fn exits(ns: &[SNode]) -> bool {
            matches!(
                ns.last(),
                Some(SNode::Return(_) | SNode::Break(_) | SNode::Continue(_) | SNode::Trap(_))
            )
        }
        fn run(&mut self, ns: &'t [SNode], facts0: Vec<Fact>) -> Vec<Fact> {
            let ir = self.ir;
            let mut facts = facts0;
            for n in ns {
                match n {
                    SNode::Stmt(si) => {
                        let s = self.tree.stmt(*si);
                        match s {
                            Stmt::Call { t, args, .. } => {
                                if !matches!(t, CallTarget::Ind { .. }) {
                                    if let Some(abi) = (self.abi_of)(t) {
                                        let av = ir.to_vec(*args);
                                        if self.qualifies(abi, &av) {
                                            self.sites.insert(
                                                n as *const SNode,
                                                (
                                                    n,
                                                    CpiSite {
                                                        abi,
                                                        args: av,
                                                        facts: facts.clone(),
                                                        t: Some(t.clone()),
                                                    },
                                                ),
                                            );
                                        }
                                    }
                                }
                                facts = Vec::new();
                            }
                            Stmt::Set { dst, e, .. } => {
                                self.note(n, Some(*e), &facts);
                                if has_call(ir, *e) {
                                    facts = Vec::new();
                                } else {
                                    let dst = *dst as u32;
                                    let mut keep = Vec::new();
                                    for f in facts {
                                        if !self.mentions(f.e, dst) {
                                            keep.push(f);
                                        }
                                    }
                                    facts = keep;
                                }
                            }
                            Stmt::Store { .. } | Stmt::Stores { .. } => {
                                let (addr, size, vals) = match s {
                                    Stmt::Store { addr, size, v, .. } => (*addr, *size, vec![*v]),
                                    Stmt::Stores {
                                        addr, size, vals, ..
                                    } => (*addr, *size, ir.to_vec(*vals)),
                                    _ => unreachable!(),
                                };
                                let o = self.fo(addr);
                                if o.is_none() || vals.iter().any(|&v| has_call(ir, v)) {
                                    facts = Vec::new();
                                } else {
                                    let o = o.unwrap();
                                    for (i, v) in vals.iter().enumerate() {
                                        let at = o + (i * size as usize) as N;
                                        facts = self.kill(facts, at, size as N);
                                        facts.push(Fact {
                                            off: at,
                                            size: size as N,
                                            e: *v,
                                        });
                                    }
                                }
                            }
                            Stmt::Copy {
                                dst, src, n: cn, ..
                            } => {
                                let o = self.fo(*dst);
                                let so = self.fo(*src);
                                let cn = *cn as N;
                                let moved: Vec<Fact> = match (o, so) {
                                    (Some(o), Some(so)) if so + cn <= o || o + cn <= so => facts
                                        .iter()
                                        .filter(|f| f.off >= so && f.off + f.size <= so + cn)
                                        .map(|f| Fact {
                                            off: f.off - so + o,
                                            ..f.clone()
                                        })
                                        .collect(),
                                    _ => Vec::new(),
                                };
                                facts = match o {
                                    None => Vec::new(),
                                    Some(o) => self.kill(facts, o, cn),
                                };
                                facts.extend(moved);
                                if let (Some(o), None) = (o, so) {
                                    if !has_call(ir, *src) {
                                        let mut i = 0.0;
                                        while i < cn {
                                            let a = add_off(ir, *src, i);
                                            facts.push(Fact {
                                                off: o + i,
                                                size: 8.0,
                                                e: ir.load(8, a),
                                            });
                                            i += 8.0;
                                        }
                                    }
                                }
                            }
                            Stmt::Eval { e, .. } => {
                                self.note(n, Some(*e), &facts);
                                if has_call(ir, *e) {
                                    facts = Vec::new();
                                }
                            }
                            Stmt::Trap { .. } => {}
                        }
                    }
                    SNode::Return(e) => self.note(n, *e, &facts),
                    SNode::If { c, then, els } => {
                        if has_call(ir, *c) {
                            self.note(n, Some(*c), &facts);
                            facts = Vec::new();
                            self.run(then, Vec::new());
                            self.run(els, Vec::new());
                            continue;
                        }
                        self.run(then, facts.clone());
                        self.run(els, facts.clone());
                        if !((Self::exits(then) && els.is_empty())
                            || (Self::exits(els) && then.is_empty()))
                        {
                            facts = Vec::new();
                        }
                    }
                    SNode::Block { body, .. } => {
                        self.run(body, facts.clone());
                        facts = Vec::new();
                    }
                    SNode::Loop { body, .. } => {
                        self.run(body, Vec::new());
                        facts = Vec::new();
                    }
                    SNode::Switch { cases, .. } => {
                        for c in cases {
                            self.run(&c.1, Vec::new());
                        }
                        facts = Vec::new();
                    }
                    _ => {}
                }
            }
            facts
        }
    }
    let mut w = W {
        ir,
        tree,
        fp,
        abi_of,
        sites: indexmap::IndexMap::new(),
        info: HashMap::new(),
    };
    w.run(body, Vec::new());
    w.sites
}

/// The environment of the descriptions (cpi.ts CpiEnv).
pub struct CpiEnv<'a> {
    pub ir: &'a Ir,
    pub fp: Option<u32>,
    pub expr: &'a mut dyn FnMut(E) -> String,
    pub key_at: Option<&'a dyn Fn(u64) -> Option<String>>,
    pub str_at: Option<&'a dyn Fn(u64, u64) -> Option<String>>,
    pub const_name: Option<&'a dyn Fn(u64) -> Option<String>>,
    pub read: Option<&'a dyn Fn(u128, usize) -> Option<u64>>,
    pub program_check: Option<&'a dyn Fn(E) -> Vec<String>>,
    pub fn_at: Option<&'a dyn Fn(u64) -> Option<String>>,
    pub named: Option<&'a dyn Fn(E) -> E>,
    pub tainted: Option<&'a dyn Fn(E) -> bool>,
}

impl CpiEnv<'_> {
    pub fn ex(&mut self, e: E) -> String {
        (self.expr)(e)
    }
    fn taint(&self, e: E) -> bool {
        self.tainted.is_some_and(|t| t(e))
    }
}

const IXD: &str = " [ix data?]";
const EVENT_IX_TAG: u64 = 0x1d9acb512ea545e4;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Sz {
    N(u8),
    Key,
}
struct IxLayout {
    name: &'static str,
    accounts: &'static [&'static str],
    fields: &'static [(&'static str, u32, Sz)],
    len: Option<u32>,
}
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Fam {
    Token,
    System,
    Ata,
    ComputeBudget,
    Stake,
}
const AMOUNT: &[(&str, u32, Sz)] = &[("amount", 1, Sz::N(8))];
const CHECKED: &[(&str, u32, Sz)] = &[("amount", 1, Sz::N(8)), ("decimals", 9, Sz::N(1))];
const ATA_ACCOUNTS: &[&str] = &[
    "payer",
    "associated_token_account",
    "wallet",
    "mint",
    "system_program",
    "token_program",
];

macro_rules! lay {
    ($n:expr, $a:expr) => {
        IxLayout {
            name: $n,
            accounts: $a,
            fields: &[],
            len: None,
        }
    };
    ($n:expr, $a:expr, $f:expr) => {
        IxLayout {
            name: $n,
            accounts: $a,
            fields: $f,
            len: None,
        }
    };
    ($n:expr, $a:expr, $f:expr, $l:expr) => {
        IxLayout {
            name: $n,
            accounts: $a,
            fields: $f,
            len: Some($l),
        }
    };
}

fn fam_ix(f: Fam, tag: u64) -> Option<IxLayout> {
    Some(match f {
        Fam::Token => match tag {
            0 => lay!(
                "InitializeMint",
                &["mint", "rent_sysvar"],
                &[("decimals", 1, Sz::N(1)), ("mint_authority", 2, Sz::Key)]
            ),
            1 => lay!(
                "InitializeAccount",
                &["account", "mint", "owner", "rent_sysvar"],
                &[],
                1
            ),
            2 => lay!(
                "InitializeMultisig",
                &["multisig", "rent_sysvar"],
                &[("m", 1, Sz::N(1))],
                2
            ),
            3 => lay!(
                "Transfer",
                &["source", "destination", "authority"],
                AMOUNT,
                9
            ),
            4 => lay!("Approve", &["source", "delegate", "owner"], AMOUNT, 9),
            5 => lay!("Revoke", &["source", "owner"], &[], 1),
            6 => lay!(
                "SetAuthority",
                &["account", "current_authority"],
                &[
                    ("authority_type", 1, Sz::N(1)),
                    ("new_authority_is_some", 2, Sz::N(1)),
                    ("new_authority", 3, Sz::Key)
                ]
            ),
            7 => lay!("MintTo", &["mint", "destination", "authority"], AMOUNT, 9),
            8 => lay!("Burn", &["account", "mint", "authority"], AMOUNT, 9),
            9 => lay!(
                "CloseAccount",
                &["account", "destination", "authority"],
                &[],
                1
            ),
            10 => lay!("FreezeAccount", &["account", "mint", "authority"], &[], 1),
            11 => lay!("ThawAccount", &["account", "mint", "authority"], &[], 1),
            12 => lay!(
                "TransferChecked",
                &["source", "mint", "destination", "authority"],
                CHECKED,
                10
            ),
            13 => lay!(
                "ApproveChecked",
                &["source", "mint", "delegate", "owner"],
                CHECKED,
                10
            ),
            14 => lay!(
                "MintToChecked",
                &["mint", "destination", "authority"],
                CHECKED,
                10
            ),
            15 => lay!(
                "BurnChecked",
                &["account", "mint", "authority"],
                CHECKED,
                10
            ),
            16 => lay!(
                "InitializeAccount2",
                &["account", "mint", "rent_sysvar"],
                &[("owner", 1, Sz::Key)],
                33
            ),
            17 => lay!("SyncNative", &["account"], &[], 1),
            18 => lay!(
                "InitializeAccount3",
                &["account", "mint"],
                &[("owner", 1, Sz::Key)],
                33
            ),
            19 => lay!(
                "InitializeMultisig2",
                &["multisig"],
                &[("m", 1, Sz::N(1))],
                2
            ),
            20 => lay!(
                "InitializeMint2",
                &["mint"],
                &[("decimals", 1, Sz::N(1)), ("mint_authority", 2, Sz::Key)]
            ),
            21 => lay!("GetAccountDataSize", &["mint"]),
            22 => lay!("InitializeImmutableOwner", &["account"], &[], 1),
            23 => lay!("AmountToUiAmount", &["mint"], AMOUNT, 9),
            25 => lay!(
                "InitializeMintCloseAuthority",
                &["mint"],
                &[
                    ("close_authority_is_some", 1, Sz::N(1)),
                    ("close_authority", 2, Sz::Key)
                ]
            ),
            38 => lay!(
                "WithdrawExcessLamports",
                &["source", "destination", "authority"],
                &[],
                1
            ),
            45 => lay!(
                "UnwrapLamports",
                &["source", "destination", "authority"],
                &[("amount_is_some", 1, Sz::N(1)), ("amount", 2, Sz::N(8))]
            ),
            _ => return None,
        },
        Fam::System => match tag {
            0 => lay!(
                "CreateAccount",
                &["funder", "new_account"],
                &[
                    ("lamports", 4, Sz::N(8)),
                    ("space", 12, Sz::N(8)),
                    ("owner", 20, Sz::Key)
                ],
                52
            ),
            1 => lay!("Assign", &["account"], &[("owner", 4, Sz::Key)], 36),
            2 => lay!(
                "Transfer",
                &["from", "to"],
                &[("lamports", 4, Sz::N(8))],
                12
            ),
            3 => lay!(
                "CreateAccountWithSeed",
                &["funder", "new_account", "base"],
                &[("base", 4, Sz::Key)]
            ),
            4 => lay!(
                "AdvanceNonceAccount",
                &[
                    "nonce_account",
                    "recent_blockhashes_sysvar",
                    "nonce_authority"
                ],
                &[],
                4
            ),
            5 => lay!(
                "WithdrawNonceAccount",
                &[
                    "nonce_account",
                    "to",
                    "recent_blockhashes_sysvar",
                    "rent_sysvar",
                    "nonce_authority"
                ],
                &[("lamports", 4, Sz::N(8))],
                12
            ),
            8 => lay!("Allocate", &["account"], &[("space", 4, Sz::N(8))], 12),
            11 => lay!(
                "TransferWithSeed",
                &["from", "base", "to"],
                &[("lamports", 4, Sz::N(8))]
            ),
            _ => return None,
        },
        Fam::Ata => match tag {
            0 => lay!("Create", ATA_ACCOUNTS, &[], 1),
            1 => lay!("CreateIdempotent", ATA_ACCOUNTS, &[], 1),
            2 => lay!(
                "RecoverNested",
                &[
                    "nested",
                    "nested_mint",
                    "destination",
                    "owner_associated_token_account",
                    "owner_mint",
                    "wallet",
                    "token_program"
                ],
                &[],
                1
            ),
            _ => return None,
        },
        Fam::ComputeBudget => match tag {
            1 => lay!("RequestHeapFrame", &[], &[("bytes", 1, Sz::N(4))], 5),
            2 => lay!("SetComputeUnitLimit", &[], &[("units", 1, Sz::N(4))], 5),
            3 => lay!(
                "SetComputeUnitPrice",
                &[],
                &[("micro_lamports", 1, Sz::N(8))],
                9
            ),
            4 => lay!(
                "SetLoadedAccountsDataSizeLimit",
                &[],
                &[("bytes", 1, Sz::N(4))],
                5
            ),
            _ => return None,
        },
        Fam::Stake => match tag {
            0 => lay!(
                "Initialize",
                &["stake", "rent_sysvar"],
                &[
                    ("staker", 4, Sz::Key),
                    ("withdrawer", 36, Sz::Key),
                    ("lockup_unix_timestamp", 68, Sz::N(8)),
                    ("lockup_epoch", 76, Sz::N(8)),
                    ("lockup_custodian", 84, Sz::Key)
                ],
                116
            ),
            1 => lay!(
                "Authorize",
                &["stake", "clock_sysvar", "authority"],
                &[
                    ("new_authority", 4, Sz::Key),
                    ("stake_authorize", 36, Sz::N(4))
                ],
                40
            ),
            2 => lay!(
                "DelegateStake",
                &[
                    "stake",
                    "vote",
                    "clock_sysvar",
                    "stake_history_sysvar",
                    "stake_config",
                    "stake_authority"
                ],
                &[],
                4
            ),
            3 => lay!(
                "Split",
                &["stake", "split_stake", "stake_authority"],
                &[("lamports", 4, Sz::N(8))],
                12
            ),
            4 => lay!(
                "Withdraw",
                &[
                    "stake",
                    "recipient",
                    "clock_sysvar",
                    "stake_history_sysvar",
                    "withdraw_authority"
                ],
                &[("lamports", 4, Sz::N(8))],
                12
            ),
            5 => lay!(
                "Deactivate",
                &["stake", "clock_sysvar", "stake_authority"],
                &[],
                4
            ),
            6 => lay!("SetLockup", &["stake", "authority"]),
            7 => lay!(
                "Merge",
                &[
                    "destination_stake",
                    "source_stake",
                    "clock_sysvar",
                    "stake_history_sysvar",
                    "stake_authority"
                ],
                &[],
                4
            ),
            8 => lay!(
                "AuthorizeWithSeed",
                &["stake", "authority_base", "clock_sysvar"],
                &[
                    ("new_authority", 4, Sz::Key),
                    ("stake_authorize", 36, Sz::N(4))
                ]
            ),
            9 => lay!(
                "InitializeChecked",
                &[
                    "stake",
                    "rent_sysvar",
                    "stake_authority",
                    "withdraw_authority"
                ],
                &[],
                4
            ),
            10 => lay!(
                "AuthorizeChecked",
                &["stake", "clock_sysvar", "authority", "new_authority"],
                &[("stake_authorize", 4, Sz::N(4))],
                8
            ),
            11 => lay!(
                "AuthorizeCheckedWithSeed",
                &["stake", "authority_base", "clock_sysvar", "new_authority"],
                &[("stake_authorize", 4, Sz::N(4))]
            ),
            12 => lay!("SetLockupChecked", &["stake", "authority"]),
            13 => lay!("GetMinimumDelegation", &[], &[], 4),
            14 => lay!(
                "DeactivateDelinquent",
                &["stake", "delinquent_vote", "reference_vote"],
                &[],
                4
            ),
            15 => lay!(
                "Redelegate",
                &[
                    "stake",
                    "uninitialized_stake",
                    "vote",
                    "stake_config",
                    "stake_authority"
                ],
                &[],
                4
            ),
            16 => lay!(
                "MoveStake",
                &["source_stake", "destination_stake", "stake_authority"],
                &[("lamports", 4, Sz::N(8))],
                12
            ),
            17 => lay!(
                "MoveLamports",
                &["source_stake", "destination_stake", "stake_authority"],
                &[("lamports", 4, Sz::N(8))],
                12
            ),
            _ => return None,
        },
    })
}

fn fam_label(f: Fam) -> &'static str {
    match f {
        Fam::Token => "SPL Token",
        Fam::System => "System",
        Fam::Ata => "Associated Token Account",
        Fam::ComputeBudget => "Compute Budget",
        Fam::Stake => "Stake",
    }
}
fn fam_tag_size(f: Fam) -> u8 {
    match f {
        Fam::System | Fam::Stake => 4,
        _ => 1,
    }
}
fn family_of(known: &str) -> Option<Fam> {
    Some(match known {
        "TOKEN_PROGRAM" | "TOKEN_2022_PROGRAM" => Fam::Token,
        "SYSTEM_PROGRAM" => Fam::System,
        "ASSOCIATED_TOKEN_PROGRAM" => Fam::Ata,
        "COMPUTE_BUDGET_PROGRAM" => Fam::ComputeBudget,
        "STAKE_PROGRAM" => Fam::Stake,
        _ => return None,
    })
}
fn fam_name(known: Option<&str>, f: Fam) -> &'static str {
    if known == Some("TOKEN_2022_PROGRAM") {
        return "token2022";
    }
    match f {
        Fam::Token => "token",
        Fam::System => "system",
        Fam::Ata => "ata",
        Fam::Stake => "stake",
        Fam::ComputeBudget => "compute_budget",
    }
}

/// A described CPI.
#[derive(Clone, Debug, Default)]
pub struct CpiDesc {
    pub text: String,
    pub family: Option<String>,
    pub ix: Option<String>,
    pub guessed: bool,
    pub parts: Option<CpiParts>,
}

/// An account meta of a decoded CPI (CpiParts.accounts).
#[derive(Clone, Debug, Default, PartialEq)]
pub struct PartAcc {
    pub role: Option<String>,
    pub text: String,
    pub w: Option<N>,
    pub s: Option<N>,
}

/// The decoded parts of a CPI (for the analysis): program, account metas by role, data fields, signer
/// seeds; the expressions (at the call) the program id, account keys and fields come from.
#[derive(Clone, Debug, Default)]
pub struct CpiParts {
    pub program: String,
    pub known: Option<String>,
    pub checked: Option<String>,
    pub accounts: Vec<PartAcc>,
    pub fields: Vec<(String, String)>,
    pub seeds: Option<String>,
    /// src: (program, accounts, fields); None when absent
    pub src: Option<CpiSrc>,
}

#[derive(Clone, Debug, Default)]
pub struct CpiSrc {
    pub program: Option<E>,
    pub accounts: Vec<Option<E>>,
    pub fields: Vec<Option<E>>,
}

/// signerSeeds: the seeds text of a CPI's parts
fn signer_seeds(s: &Option<String>) -> Option<String> {
    match s {
        Some(s) if !s.is_empty() && !s.starts_with("no signer seeds") => {
            Some(s.strip_prefix("signer seeds ").unwrap_or(s).to_string())
        }
        _ => None,
    }
}

#[derive(Clone, Debug, Default)]
pub struct KeyText {
    pub text: String,
    pub known: Option<String>,
    pub src: Option<E>,
}
fn kt(t: &str) -> KeyText {
    KeyText {
        text: t.into(),
        known: None,
        src: None,
    }
}
fn kt_known(t: String) -> KeyText {
    KeyText {
        text: t.clone(),
        known: Some(t),
        src: None,
    }
}

#[derive(Clone, Debug)]
pub struct Acc {
    pub text: String,
    pub w: Option<N>,
    pub s: Option<N>,
    pub src: Option<E>,
}

/// The data of an instruction model: bytes relative to the data start.
pub trait DataAt {
    fn at(&mut self, env: &mut CpiEnv, o: N, size: u8) -> Option<E>;
    fn key(&mut self, env: &mut CpiEnv, o: N) -> Option<KeyText>;
}

pub struct IxModel<'d> {
    pub program: KeyText,
    pub accounts: Vec<Acc>,
    pub n_acc: Option<N>,
    pub dl: Option<N>,
    pub data: Option<&'d mut dyn DataAt>,
    pub data_text: Option<String>,
    pub seeds: Option<String>,
    pub note: Option<String>,
}

/// `/^[\w.]+$/.test(t) ? t : (t)`
pub fn wrap(t: &str) -> String {
    if !t.is_empty()
        && t.bytes()
            .all(|c| c.is_ascii_alphanumeric() || c == b'_' || c == b'.')
    {
        t.to_string()
    } else {
        format!("({t})")
    }
}

fn key_name(b: &str) -> String {
    match known_key(b) {
        Some(n) => n.to_string(),
        None => format!("key {b}"),
    }
}

fn flags(w: Option<N>, s: Option<N>) -> String {
    let (Some(w), Some(s)) = (w, s) else {
        return " (?)".into();
    };
    let mut f: Vec<&str> = Vec::new();
    if w != 0.0 {
        f.push("w");
    }
    if s != 0.0 {
        f.push("s");
    }
    if f.is_empty() {
        String::new()
    } else {
        format!(" ({})", f.join(","))
    }
}

/// The frame contents of a site: exact facts, a constant covering the bytes, or constant bytes from
/// several stores (`cover`: the cpiDesc variant that tries the covering constant first).
fn at_facts(ir: &Ir, facts: &[Fact], o: N, size: u8, cover: bool) -> Option<E> {
    let sz = size as N;
    if let Some(f) = facts.iter().find(|x| x.off == o && x.size == sz) {
        return Some(f.e);
    }
    if cover {
        if let Some(c) = facts.iter().find(|x| {
            x.off <= o && o + sz <= x.off + x.size && matches!(ir.get(x.e), Node::Const(_))
        }) {
            let Node::Const(v) = ir.get(c.e) else {
                unreachable!()
            };
            let sh = (o - c.off) as u32 * 8;
            let x = if sh >= 64 { 0 } else { v >> sh };
            let m = if size >= 8 {
                u64::MAX
            } else {
                (1u64 << (size as u32 * 8)) - 1
            };
            return Some(ir.c(x & m));
        }
    }
    let mut v: u64 = 0;
    for i in (0..size as usize).rev() {
        let p = o + i as N;
        let b = facts
            .iter()
            .find(|x| x.off <= p && p < x.off + x.size && matches!(ir.get(x.e), Node::Const(_)))?;
        let Node::Const(bv) = ir.get(b.e) else {
            unreachable!()
        };
        let sh = (p - b.off) as u32 * 8;
        let byte = if sh >= 64 { 0 } else { (bv >> sh) & 0xff };
        v = (v << 8) | byte;
    }
    Some(ir.c(v))
}

struct FactsAt<'f> {
    facts: &'f [Fact],
    cover: bool,
    /// offset of the data in the frame
    base: N,
}

impl FactsAt<'_> {
    fn get(&self, ir: &Ir, o: N, size: u8) -> Option<E> {
        at_facts(ir, self.facts, o, size, self.cover)
    }
    /// keyInFrame: a 32-byte key in the frame at o (four constant words, or copied from one place)
    fn key_in_frame(&self, env: &mut CpiEnv, o: N) -> Option<KeyText> {
        let ir = env.ir;
        let w0 = self.get(ir, o, 8);
        if let Some(w0) = w0 {
            if let Node::Load { addr: a0, .. } = ir.get(w0) {
                if !matches!(ir.get(a0), Node::Const(_))
                    && (1..4).all(|i| {
                        let w = self.get(ir, o + 8.0 * i as N, 8);
                        match w.map(|w| ir.get(w)) {
                            Some(Node::Load { addr, .. }) => {
                                let x = add_off(ir, a0, 8.0 * i as N);
                                expr_eq(ir, addr, x)
                            }
                            _ => false,
                        }
                    })
                {
                    let t = env.ex(a0);
                    return Some(KeyText {
                        text: format!("*{}", wrap(&t)),
                        known: None,
                        src: Some(a0),
                    });
                }
            }
        }
        let mut words = Vec::new();
        for i in 0..4 {
            let mut w = self.get(ir, o + 8.0 * i as N, 8).map(|w| (w, ir.get(w)));
            if let Some((_, Node::Load { addr, .. })) = w {
                if let (Node::Const(a), Some(read)) = (ir.get(addr), env.read) {
                    w = read(a as u128, 8).map(|v| {
                        let c = ir.c(v);
                        (c, Node::Const(v))
                    });
                }
            }
            match w {
                Some((_, Node::Const(v))) => words.push(v),
                _ => return None,
            }
        }
        let mut b = [0u8; 32];
        for (i, v) in words.iter().enumerate() {
            b[i * 8..i * 8 + 8].copy_from_slice(&v.to_le_bytes());
        }
        Some(kt_known(key_name(&b58(&b))))
    }
}

struct DataFacts<'f> {
    fa: FactsAt<'f>,
}
impl DataAt for DataFacts<'_> {
    fn at(&mut self, env: &mut CpiEnv, o: N, size: u8) -> Option<E> {
        self.fa.get(env.ir, self.fa.base + o, size)
    }
    fn key(&mut self, env: &mut CpiEnv, o: N) -> Option<KeyText> {
        let b = self.fa.base;
        self.fa.key_in_frame(env, b + o)
    }
}

fn num(ir: &Ir, e: Option<E>) -> Option<N> {
    match e.map(|e| ir.get(e)) {
        Some(Node::Const(v)) if v < 0x10000 => Some(v as N),
        _ => None,
    }
}

/// cpiDesc
pub fn cpi_desc(site: &CpiSite, env: &mut CpiEnv) -> Option<CpiDesc> {
    match site.abi {
        SiteKind::Call => {
            return describe_fmt(site, env).map(|t| CpiDesc {
                text: t,
                ..Default::default()
            })
        }
        SiteKind::Invoke => return None,
        k if k.is_pda() => {
            return describe_pda(site, env).map(|t| CpiDesc {
                text: t,
                ..Default::default()
            })
        }
        _ => {}
    }
    let ir = env.ir;
    let fa = FactsAt {
        facts: &site.facts,
        cover: true,
        base: 0.0,
    };
    let at = |o: N, size: u8| fa.get(ir, o, size);
    let Some(&arg0) = site.args.first() else {
        crate::util::js_throw("Cannot read properties of undefined (reading 'k')");
    };
    let ix = fo_any(ir, arg0, env.fp)?;
    let key_ptr = |env: &mut CpiEnv, e: Option<E>| -> KeyText {
        let Some(e) = e else { return kt("?") };
        if let Node::Const(v) = ir.get(e) {
            if let Some(k) = env.key_at.and_then(|f| f(v)) {
                return kt_known(key_name(&k));
            }
            if let Some(read) = env.read {
                if [0u128, 8, 16, 24]
                    .iter()
                    .all(|&i| read(v as u128 + i, 8) == Some(0))
                {
                    return kt_known("SYSTEM_PROGRAM".into());
                }
            }
        }
        if let Some(o) = fo_any(ir, e, env.fp) {
            if let Some(k) = fa.key_in_frame(env, o) {
                return k;
            }
        }
        let t = env.ex(e);
        KeyText {
            text: format!("*{}", wrap(&t)),
            known: None,
            src: Some(e),
        }
    };
    let program;
    let mut accounts: Vec<Acc> = Vec::new();
    let n_acc;
    let data_ptr;
    let data_len;
    if site.abi == SiteKind::C {
        program = key_ptr(env, at(ix, 8));
        let metas = at(ix + 8.0, 8);
        n_acc = num(ir, at(ix + 16.0, 8));
        data_ptr = at(ix + 24.0, 8);
        data_len = at(ix + 32.0, 8);
        let mo = metas.and_then(|m| fo_any(ir, m, env.fp));
        if let (Some(na), Some(mo)) = (n_acc, mo) {
            if na <= 24.0 {
                let mut i = 0.0;
                while i < na {
                    let pk = at(mo + 16.0 * i, 8);
                    let text = match pk {
                        Some(pk) => match key_ptr(env, Some(pk)).known {
                            Some(k) => k,
                            None => env.ex(pk),
                        },
                        None => "?".into(),
                    };
                    accounts.push(Acc {
                        text,
                        w: num(ir, at(mo + 16.0 * i + 8.0, 1)),
                        s: num(ir, at(mo + 16.0 * i + 9.0, 1)),
                        src: pk,
                    });
                    i += 1.0;
                }
            }
        }
    } else {
        program = fa.key_in_frame(env, ix + 48.0).unwrap_or_else(|| kt("?"));
        n_acc = num(ir, at(ix + 16.0, 8));
        data_ptr = at(ix + 24.0, 8);
        data_len = at(ix + 40.0, 8);
        let metas = at(ix, 8);
        let mo = metas.and_then(|m| fo_any(ir, m, env.fp));
        if let (Some(na), Some(mo)) = (n_acc, mo) {
            if na <= 24.0 {
                let mut i = 0.0;
                while i < na {
                    let b = mo + 34.0 * i;
                    let k = fa.key_in_frame(env, b);
                    let src = k.as_ref().and_then(|k| k.src);
                    accounts.push(Acc {
                        text: k.map_or("?".into(), |k| k.text),
                        w: num(ir, at(b + 33.0, 1)),
                        s: num(ir, at(b + 32.0, 1)),
                        src,
                    });
                    i += 1.0;
                }
            }
        }
    }
    let dl = num(ir, data_len);
    let seeds = describe_seeds(
        site.args.get(3).copied(),
        site.args.get(4).copied(),
        &fa,
        env,
    );
    let d_off = data_ptr.and_then(|d| fo_any(ir, d, env.fp));
    let data_text = if dl.is_none() && data_ptr.is_some() && data_len.is_some() {
        let a = env.ex(data_ptr.unwrap());
        let b = env.ex(data_len.unwrap());
        Some(format!("{}[..{}]", wrap(&a), b))
    } else {
        None
    };
    let mut df = d_off.map(|b| DataFacts {
        fa: FactsAt {
            facts: &site.facts,
            cover: true,
            base: b,
        },
    });
    format_ix(
        IxModel {
            program,
            accounts,
            n_acc,
            dl,
            data: df.as_mut().map(|x| x as &mut dyn DataAt),
            data_text,
            seeds,
            note: None,
        },
        env,
    )
}

/// formatIx: the comment for an instruction model.
pub fn format_ix(m: IxModel, env: &mut CpiEnv) -> Option<CpiDesc> {
    let IxModel {
        program,
        accounts,
        n_acc,
        dl,
        mut data,
        data_text,
        seeds,
        note,
    } = m;
    let tail = format!(
        "{}{}",
        seeds.as_ref().map_or(String::new(), |s| format!(", {s}")),
        note.as_ref().map_or(String::new(), |n| format!(" {n}"))
    );
    let acc_text = |a: &Acc| format!("{}{}", a.text, flags(a.w, a.s));
    let mut check = String::new();
    if program.known.is_none() {
        if let Some(src) = program.src {
            if env.taint(src) {
                check.push_str(" [id from ix data]");
            }
            if let Some(pc) = env.program_check {
                let ids = pc(src);
                check.push_str(&if !ids.is_empty() {
                    format!(" (id compared with {} in this function)", ids.join(" / "))
                } else {
                    " (id not a constant, and not compared with a known program id in this function)".into()
                });
            }
        }
    }
    if let (Some(dl), Some(data)) = (dl, data.as_deref_mut()) {
        let fam = program.known.as_deref().and_then(family_of);
        let cands: Vec<Fam> = match (fam, &program.known) {
            (Some(f), _) => vec![f],
            (None, Some(_)) => vec![],
            (None, None) => vec![Fam::Token, Fam::System],
        };
        for f in cands {
            let tag = if dl == 0.0 && f == Fam::Ata {
                Some(0u64)
            } else {
                match data.at(env, 0.0, fam_tag_size(f)).map(|e| env.ir.get(e)) {
                    Some(Node::Const(v)) => Some(v),
                    _ => None,
                }
            };
            let Some(tag) = tag else { continue };
            let Some(lay) = fam_ix(f, tag) else { continue };
            if fam.is_none()
                && (lay.len.is_none()
                    || lay.len.unwrap() as N != dl
                    || n_acc.is_some_and(|n| n != lay.accounts.len() as N))
            {
                continue;
            }
            let mut parts: Vec<String> = Vec::new();
            let mut fields: Vec<(String, String)> = Vec::new();
            let mut fsrc: Vec<Option<E>> = Vec::new();
            for (i, a) in accounts.iter().enumerate() {
                let role = lay
                    .accounts
                    .get(i)
                    .map_or(format!("account{i}"), |s| s.to_string());
                parts.push(format!("{role}: {}", acc_text(a)));
            }
            if accounts.is_empty() {
                if let Some(n) = n_acc {
                    if n != lay.accounts.len() as N {
                        parts.push(format!("{} accounts", js_num(n)));
                    }
                }
            }
            for &(name, off, size) in lay.fields {
                if off as N >= dl {
                    continue;
                }
                let v = match size {
                    Sz::Key => {
                        let k = data.key(env, off as N);
                        fsrc.push(k.as_ref().and_then(|k| k.src));
                        let t = k.as_ref().map_or("?".to_string(), |k| k.text.clone());
                        let mark = match k.as_ref().and_then(|k| k.src) {
                            Some(s) if env.taint(s) => IXD,
                            _ => "",
                        };
                        format!("{t}{mark}")
                    }
                    Sz::N(sz) => {
                        let e = data.at(env, off as N, sz);
                        fsrc.push(e);
                        match e {
                            Some(e) => {
                                let t = env.ex(e);
                                format!("{t}{}", if env.taint(e) { IXD } else { "" })
                            }
                            None => "?".into(),
                        }
                    }
                };
                parts.push(format!("{name}: {v}"));
                fields.push((name.to_string(), v));
            }
            let head = if fam.is_some() {
                format!("{}.{}", program.text, lay.name)
            } else {
                format!(
                    "program {}{} — data and accounts match {} {}; if it is {}:",
                    program.text,
                    check,
                    fam_label(f),
                    lay.name,
                    fam_label(f)
                )
            };
            return Some(CpiDesc {
                text: format!(
                    "CPI {head} {}{tail}",
                    if parts.is_empty() {
                        "{}".to_string()
                    } else {
                        format!("{{ {} }}", parts.join(", "))
                    }
                ),
                family: Some(fam_name(program.known.as_deref(), f).into()),
                ix: Some(lay.name.into()),
                guessed: fam.is_none(),
                parts: Some(CpiParts {
                    program: program.text.clone(),
                    known: program.known.clone(),
                    checked: Some(check.trim().to_string()).filter(|x| !x.is_empty()),
                    seeds: signer_seeds(&seeds),
                    fields,
                    accounts: accounts
                        .iter()
                        .enumerate()
                        .map(|(i, a)| PartAcc {
                            role: lay.accounts.get(i).map(|x| x.to_string()),
                            text: a.text.clone(),
                            w: a.w,
                            s: a.s,
                        })
                        .collect(),
                    src: Some(CpiSrc {
                        program: program.src,
                        accounts: accounts.iter().map(|a| a.src).collect(),
                        fields: fsrc,
                    }),
                }),
            });
        }
    }
    let mut parts = vec![format!("program {}{}", program.text, check)];
    let tag0 = match (dl, data.as_deref_mut()) {
        (Some(dl), Some(d)) if dl >= 16.0 => d.at(env, 0.0, 8),
        _ => None,
    };
    let event = tag0.is_some_and(|t| env.ir.get(t) == Node::Const(EVENT_IX_TAG));
    if accounts.iter().any(|a| a.text != "?" || a.w.is_some()) {
        parts.push(format!(
            "accounts [{}]",
            accounts.iter().map(acc_text).collect::<Vec<_>>().join(", ")
        ));
    } else if let Some(n) = n_acc {
        parts.push(format!(
            "{} account{}",
            js_num(n),
            if n == 1.0 { "" } else { "s" }
        ));
    }
    if let Some(dl) = dl {
        let dd = match data.as_deref_mut() {
            Some(d) => describe_data(d, dl, env),
            None => String::new(),
        };
        parts.push(format!(
            "data {} byte{}{}",
            js_num(dl),
            if dl == 1.0 { "" } else { "s" },
            dd
        ));
    } else if let Some(t) = data_text {
        if !t.is_empty() {
            parts.push(format!("data {t}"));
        }
    }
    if program.text == "?" && parts.len() == 1 {
        return None;
    }
    Some(CpiDesc {
        text: format!(
            "CPI{}: {}{tail}",
            if event {
                " emit_cpi! (Anchor event self-invocation)"
            } else {
                ""
            },
            parts.join(", ")
        ),
        parts: Some(CpiParts {
            program: program.text.clone(),
            known: program.known.clone(),
            checked: Some(check.trim().to_string()).filter(|x| !x.is_empty()),
            seeds: signer_seeds(&seeds),
            fields: if event {
                vec![("event".into(), "emit_cpi!".into())]
            } else {
                vec![]
            },
            accounts: accounts
                .iter()
                .map(|a| PartAcc {
                    role: None,
                    text: a.text.clone(),
                    w: a.w,
                    s: a.s,
                })
                .collect(),
            src: Some(CpiSrc {
                program: program.src,
                accounts: accounts.iter().map(|a| a.src).collect(),
                fields: vec![],
            }),
        }),
        ..Default::default()
    })
}

fn describe_data(data: &mut dyn DataAt, len: N, env: &mut CpiEnv) -> String {
    if len == 0.0 || len > 256.0 {
        return String::new();
    }
    let mut items: Vec<String> = Vec::new();
    let mut p = 0.0;
    let mut first = true;
    while p < len && items.len() < 12 {
        let mut e: Option<E> = None;
        let mut size = 0u8;
        for s in [8u8, 4, 2, 1] {
            if p + s as N <= len {
                e = data.at(env, p, s);
                if e.is_some() {
                    size = s;
                    break;
                }
            }
        }
        let Some(e) = e else {
            if !items.is_empty() {
                items.push("?".into());
            }
            break;
        };
        let is_const = matches!(env.ir.get(e), Node::Const(_));
        let mut t = if first && size == 8 && env.ir.get(e) == Node::Const(EVENT_IX_TAG) {
            "EVENT_IX_TAG".to_string()
        } else {
            let x = env.ex(e);
            format!(
                "u{} {x}{}",
                size as u32 * 8,
                if env.taint(e) { IXD } else { "" }
            )
        };
        if first && is_const && size == 8 {
            if let Node::Const(v) = env.ir.get(e) {
                if let Some(n) = env.const_name.and_then(|f| f(v)) {
                    if !t.contains("/*") {
                        t.push_str(&format!(" ({n})"));
                    }
                }
            }
        }
        items.push(t);
        p += size as N;
        first = false;
    }
    if items.is_empty() {
        String::new()
    } else {
        format!(" [{}]", items.join(", "))
    }
}

/// seedText: one seed (ptr, len)
fn seed_text(p: E, l: E, fa: &FactsAt, env: &mut CpiEnv) -> String {
    let ir = env.ir;
    if let (Node::Const(pv), Node::Const(lv)) = (ir.get(p), ir.get(l)) {
        if let Some(s) = env.str_at.and_then(|f| f(pv, lv)) {
            return json_str(&s);
        }
        if lv == 32 {
            if let Some(k) = env.key_at.and_then(|f| f(pv)) {
                return key_name(&k);
            }
        }
    }
    let o = fo_any(ir, p, env.fp);
    if let (Some(o), Node::Const(lv)) = (o, ir.get(l)) {
        if lv == 32 {
            if let Some(w0) = fa.get(ir, o, 8) {
                if let Node::Load { addr: a0, .. } = ir.get(w0) {
                    if (1..4).all(
                        |i| match fa.get(ir, o + 8.0 * i as N, 8).map(|w| ir.get(w)) {
                            Some(Node::Load { addr, .. }) => {
                                let x = add_off(ir, a0, 8.0 * i as N);
                                expr_eq(ir, addr, x)
                            }
                            _ => false,
                        },
                    ) {
                        let t = env.ex(a0);
                        return format!("*{}{}", wrap(&t), if env.taint(a0) { IXD } else { "" });
                    }
                }
            }
        }
        if [1, 2, 4, 8].contains(&lv) {
            if let Some(v) = fa.get(ir, o, lv as u8) {
                let t = env.ex(v);
                return format!("u{} {t}{}", lv * 8, if env.taint(v) { IXD } else { "" });
            }
        }
    }
    let mark = if env.taint(p) || env.taint(l) {
        IXD
    } else {
        ""
    };
    let t = if ir.get(l) == Node::Const(32) {
        let x = env.ex(p);
        format!("*{}", wrap(&x))
    } else {
        let x = env.ex(p);
        let y = env.ex(l);
        format!("{}[..{}]", wrap(&x), y)
    };
    t + mark
}

fn seed_list(ptr: E, n: E, fa: &FactsAt, env: &mut CpiEnv) -> Option<String> {
    let ir = env.ir;
    let o = fo_any(ir, ptr, env.fp)?;
    let Node::Const(nv) = ir.get(n) else {
        return None;
    };
    if nv > 16 {
        return None;
    }
    let mut seeds = Vec::new();
    for i in 0..nv {
        let p = fa.get(ir, o + 16.0 * i as N, 8);
        let l = fa.get(ir, o + 16.0 * i as N + 8.0, 8);
        seeds.push(match (p, l) {
            (Some(p), Some(l)) => seed_text(p, l, fa, env),
            _ => "?".into(),
        });
    }
    Some(format!("[{}]", seeds.join(", ")))
}

fn describe_pda(site: &CpiSite, env: &mut CpiEnv) -> Option<String> {
    let out = matches!(site.abi, SiteKind::PdaFindOut | SiteKind::PdaCreateOut);
    let s = if out { 1 } else { 0 };
    let (seeds, n, prog) = (
        *site.args.get(s)?,
        *site.args.get(s + 1)?,
        *site.args.get(s + 2)?,
    );
    let fa = FactsAt {
        facts: &site.facts,
        cover: false,
        base: 0.0,
    };
    let list = seed_list(seeds, n, &fa, env)?;
    let t = env.ex(prog);
    let mut program = format!("*{}", wrap(&t));
    if let Node::Const(v) = env.ir.get(prog) {
        if let Some(k) = env.key_at.and_then(|f| f(v)) {
            program = key_name(&k);
        }
    }
    let kind = if matches!(site.abi, SiteKind::PdaFind | SiteKind::PdaFindOut) {
        "find_program_address"
    } else {
        "create_program_address"
    };
    Some(format!("PDA {kind}({list}, program {program})"))
}

fn describe_seeds(ptr: Option<E>, n: Option<E>, fa: &FactsAt, env: &mut CpiEnv) -> Option<String> {
    let ir = env.ir;
    let n = n?;
    let Node::Const(nv) = ir.get(n) else {
        return None;
    };
    if nv == 0 {
        return Some("no signer seeds".into());
    }
    let o = ptr.and_then(|p| fo_any(ir, p, env.fp));
    let Some(o) = o.filter(|_| nv <= 4) else {
        return Some(format!("{nv} signer{}", if nv == 1 { "" } else { "s" }));
    };
    let mut signers = Vec::new();
    for j in 0..nv {
        let sp = fa.get(ir, o + 16.0 * j as N, 8);
        let sl = fa.get(ir, o + 16.0 * j as N + 8.0, 8);
        let so = sp.and_then(|x| fo_any(ir, x, env.fp));
        let slv = match sl.map(|x| ir.get(x)) {
            Some(Node::Const(v)) if v <= 16 => Some(v),
            _ => None,
        };
        let (Some(so), Some(slv)) = (so, slv) else {
            signers.push("?".to_string());
            continue;
        };
        let mut seeds = Vec::new();
        for i in 0..slv {
            let p = fa.get(ir, so + 16.0 * i as N, 8);
            let l = fa.get(ir, so + 16.0 * i as N + 8.0, 8);
            seeds.push(match (p, l) {
                (Some(p), Some(l)) => seed_text(p, l, fa, env),
                _ => "?".into(),
            });
        }
        signers.push(format!("[{}]", seeds.join(", ")));
    }
    Some(format!("signer seeds {}", signers.join(", ")))
}

fn word(site: &CpiSite, o: N) -> Option<E> {
    site.facts
        .iter()
        .find(|x| x.off == o && x.size == 8.0)
        .map(|x| x.e)
}

fn describe_fmt(site: &CpiSite, env: &mut CpiEnv) -> Option<String> {
    let (Some(read), Some(str_at)) = (env.read, env.str_at) else {
        return None;
    };
    let ir = env.ir;
    for &a in &site.args {
        let Some(o) = fo_any(ir, a, env.fp) else {
            continue;
        };
        let (Some(p), Some(n)) = (word(site, o), word(site, o + 8.0)) else {
            continue;
        };
        let (Node::Const(pv), Node::Const(nv)) = (ir.get(p), ir.get(n)) else {
            continue;
        };
        if !(1..=12).contains(&nv) {
            continue;
        }
        let mut pieces: Vec<String> = Vec::new();
        for i in 0..nv {
            let sp = read(pv as u128 + 16 * i as u128, 8);
            let sl = read(pv as u128 + 16 * i as u128 + 8, 8);
            let (Some(sp), Some(sl)) = (sp, sl) else {
                break;
            };
            if sl > 200 {
                break;
            }
            let s = if sl == 0 {
                Some(String::new())
            } else {
                str_at(sp, sl)
            };
            let Some(s) = s else { break };
            pieces.push(s);
        }
        if pieces.len() as u64 != nv || !pieces.iter().any(|s| crate::util::u16len(s) > 1) {
            continue;
        }
        let pj = serde_json::to_string(&pieces).unwrap();
        let Some((list, specs)) = fmt_args(site, o, env) else {
            return Some(format!("fmt pieces {pj}"));
        };
        let l2 = list
            .iter()
            .map(|x| format!("{{}} = {x}"))
            .collect::<Vec<_>>()
            .join(", ");
        if !specs && (pieces.len() == list.len() || pieces.len() == list.len() + 1) {
            let mut s = String::new();
            for (i, x) in pieces.iter().enumerate() {
                s.push_str(x);
                if i < list.len() {
                    s.push_str("{}");
                }
            }
            return Some(format!(
                "fmt {}{}",
                json_str(&s),
                if l2.is_empty() {
                    String::new()
                } else {
                    format!(" {l2}")
                }
            ));
        }
        return Some(format!(
            "fmt pieces {pj} (with placeholder specs), arguments: {}",
            if list.is_empty() {
                "(none)".to_string()
            } else {
                list.join(", ")
            }
        ));
    }
    None
}

fn fmt_args(site: &CpiSite, o: N, env: &mut CpiEnv) -> Option<(Vec<String>, bool)> {
    let ir = env.ir;
    for k in [16.0, 32.0] {
        let ap = word(site, o + k);
        let an = word(site, o + k + 8.0);
        let Some(ap) = ap else { continue };
        let anv = match an.map(|x| ir.get(x)) {
            Some(Node::Const(v)) if v <= 16 => v,
            _ => continue,
        };
        let a = if anv == 0 {
            None
        } else {
            fo_any(ir, ap, env.fp)
        };
        if anv != 0 && a.is_none() {
            continue;
        }
        let mut list = Vec::new();
        let mut ok = true;
        for i in 0..anv {
            let a = a.unwrap();
            let v = word(site, a + 16.0 * i as N);
            let f = word(site, a + 16.0 * i as N + 8.0);
            let fname = match f.map(|x| ir.get(x)) {
                Some(Node::Const(fv)) => env.fn_at.and_then(|g| g(fv)),
                _ => None,
            };
            let (Some(v), Some(fname)) = (v, fname) else {
                ok = false;
                break;
            };
            let t = fmt_value(v, site, env);
            list.push(format!("{t} [{fname}]"));
        }
        if !ok {
            continue;
        }
        let s = word(site, o + if k == 16.0 { 32.0 } else { 16.0 });
        let specs = !s.is_some_and(|s| ir.get(s) == Node::Const(0));
        return Some((list, specs));
    }
    None
}

fn fmt_value(v: E, site: &CpiSite, env: &mut CpiEnv) -> String {
    let ir = env.ir;
    if let Some(vo) = fo_any(ir, v, env.fp) {
        let at = |k: N, size: N| {
            site.facts
                .iter()
                .find(|x| x.off == k && x.size == size)
                .map(|x| x.e)
        };
        if let Some(w0) = at(vo, 8.0) {
            if let Node::Load { size: 8, addr: a0 } = ir.get(w0) {
                if (1..4).all(|i| match at(vo + 8.0 * i as N, 8.0).map(|w| ir.get(w)) {
                    Some(Node::Load { addr, .. }) => {
                        let x = add_off(ir, a0, 8.0 * i as N);
                        expr_eq(ir, addr, x)
                    }
                    _ => false,
                }) {
                    let t = env.ex(a0);
                    return format!("*{}", wrap(&t));
                }
            }
        }
        for size in [8.0, 4.0, 2.0, 1.0] {
            if let Some(e) = at(vo, size) {
                return env.ex(e);
            }
        }
    }
    let t = env.ex(v);
    format!("*{}", wrap(&t))
}

/// A frame object a site shows the role of.
#[derive(Clone, Debug)]
pub struct SiteObject {
    pub off: N,
    pub name: &'static str,
    pub ty: Option<&'static str>,
}

/// siteObjects
pub fn site_objects(
    ir: &Ir,
    site: &CpiSite,
    fp: Option<u32>,
    read: Option<&dyn Fn(u128, usize) -> Option<u64>>,
) -> Vec<SiteObject> {
    let mut out = Vec::new();
    let fo = |e: Option<E>| e.and_then(|e| fo_any(ir, e, fp));
    let fa = FactsAt {
        facts: &site.facts,
        cover: false,
        base: 0.0,
    };
    let at = |o: N, s: u8| fa.get(ir, o, s);
    let seed_arr = |out: &mut Vec<SiteObject>, ptr: Option<E>, n: Option<E>, name: &'static str| {
        let Some(o) = fo(ptr) else { return };
        let nv = match n.map(|x| ir.get(x)) {
            Some(Node::Const(v)) if v != 0 && v <= 16 => v,
            _ => return,
        };
        for i in 0..nv {
            if at(o + 16.0 * i as N, 8).is_none() || at(o + 16.0 * i as N + 8.0, 8).is_none() {
                return;
            }
        }
        out.push(SiteObject {
            off: o,
            name,
            ty: Some("Slice"),
        });
    };
    match site.abi {
        SiteKind::C | SiteKind::Rust => {
            let Some(ix) = fo(site.args.first().copied()) else {
                return out;
            };
            let c = site.abi == SiteKind::C;
            let metas = fo(at(if c { ix + 8.0 } else { ix }, 8));
            let data = fo(at(ix + 24.0, 8));
            if at(ix + 16.0, 8).is_none() {
                return out;
            }
            out.push(SiteObject {
                off: ix,
                name: "ix",
                ty: Some(if c {
                    "SolInstruction"
                } else {
                    "StableInstruction"
                }),
            });
            if let Some(m) = metas {
                out.push(SiteObject {
                    off: m,
                    name: "metas",
                    ty: Some(if c { "SolAccountMeta" } else { "AccountMeta" }),
                });
            }
            if let Some(d) = data {
                out.push(SiteObject {
                    off: d,
                    name: "ix_data",
                    ty: None,
                });
            }
            let so = fo(site.args.get(3).copied());
            let sn = site.args.get(4).map(|x| ir.get(*x));
            if let (Some(so), Some(Node::Const(snv))) = (so, sn) {
                if snv > 0 && snv <= 4 {
                    out.push(SiteObject {
                        off: so,
                        name: "signers",
                        ty: Some("SeedList"),
                    });
                    for j in 0..snv {
                        seed_arr(
                            &mut out,
                            at(so + 16.0 * j as N, 8),
                            at(so + 16.0 * j as N + 8.0, 8),
                            "seeds",
                        );
                    }
                }
            }
            out
        }
        k if k.is_pda() => {
            let o = matches!(k, SiteKind::PdaFindOut | SiteKind::PdaCreateOut);
            let (s0, n0) = if o { (1, 2) } else { (0, 1) };
            seed_arr(
                &mut out,
                site.args.get(s0).copied(),
                site.args.get(n0).copied(),
                "seeds",
            );
            let res = fo(site.args.get(if o { 0 } else { 3 }).copied());
            if let Some(r) = res {
                out.push(SiteObject {
                    off: r,
                    name: "pda",
                    ty: None,
                });
            }
            if k == SiteKind::PdaFind {
                if let Some(b) = fo(site.args.get(4).copied()) {
                    out.push(SiteObject {
                        off: b,
                        name: "bump",
                        ty: None,
                    });
                }
            }
            out
        }
        SiteKind::Call => {
            let Some(read) = read else { return out };
            for &a in &site.args {
                let Some(o) = fo_any(ir, a, fp) else { continue };
                let (Some(p), Some(n)) = (word(site, o), word(site, o + 8.0)) else {
                    continue;
                };
                let (Node::Const(pv), Node::Const(nv)) = (ir.get(p), ir.get(n)) else {
                    continue;
                };
                if !(1..=12).contains(&nv) || read(pv as u128, 8).is_none() {
                    continue;
                }
                for k in [16.0, 32.0] {
                    let ap = word(site, o + k);
                    let an = word(site, o + k + 8.0);
                    let s = word(site, o + if k == 16.0 { 32.0 } else { 16.0 });
                    let Some(ap) = ap else { continue };
                    let anv = match an.map(|x| ir.get(x)) {
                        Some(Node::Const(v)) if v <= 16 => v,
                        _ => continue,
                    };
                    if s.is_none() {
                        continue;
                    }
                    let aa = fo_any(ir, ap, fp);
                    if anv != 0 && aa.is_none() {
                        continue;
                    }
                    let mut ok = true;
                    for i in 0..anv {
                        let a2 = aa.unwrap();
                        if word(site, a2 + 16.0 * i as N).is_none()
                            || !matches!(
                                word(site, a2 + 16.0 * i as N + 8.0).map(|x| ir.get(x)),
                                Some(Node::Const(_))
                            )
                        {
                            ok = false;
                            break;
                        }
                    }
                    if !ok {
                        continue;
                    }
                    out.push(SiteObject {
                        off: o,
                        name: "fmt",
                        ty: Some(if k == 16.0 {
                            "FmtArguments"
                        } else {
                            "FmtArgumentsSpecsFirst"
                        }),
                    });
                    if anv != 0 {
                        out.push(SiteObject {
                            off: aa.unwrap(),
                            name: "fmt_args",
                            ty: Some("FmtArg"),
                        });
                    }
                    return out;
                }
            }
            out
        }
        _ => out,
    }
}

/// The name of a TokenInstruction by its tag (knownFamilies' TOKEN_PROGRAM).
pub fn token_ix_name(tag: u64) -> Option<&'static str> {
    fam_ix(Fam::Token, tag).map(|l| l.name)
}

/// A well-known program's instruction layouts (knownFamilies: the FAMILY entries in order): (known-id label,
/// family label, [(tag, name, account roles)] by ascending tag).
pub type KnownFamily = (
    &'static str,
    &'static str,
    Vec<(u64, &'static str, &'static [&'static str])>,
);

pub fn known_families() -> Vec<KnownFamily> {
    let fams = [
        ("TOKEN_PROGRAM", Fam::Token),
        ("TOKEN_2022_PROGRAM", Fam::Token),
        ("SYSTEM_PROGRAM", Fam::System),
        ("ASSOCIATED_TOKEN_PROGRAM", Fam::Ata),
        ("COMPUTE_BUDGET_PROGRAM", Fam::ComputeBudget),
        ("STAKE_PROGRAM", Fam::Stake),
    ];
    fams.iter()
        .map(|&(k, f)| {
            let ixs = (0..1024u64)
                .filter_map(|t| fam_ix(f, t).map(|l| (t, l.name, l.accounts)))
                .collect();
            (k, fam_label(f), ixs)
        })
        .collect()
}
