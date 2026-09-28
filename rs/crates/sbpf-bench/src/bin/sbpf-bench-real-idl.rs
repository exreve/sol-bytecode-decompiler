//! Writes bench/idl/<prog>.json (Anchor 0.30+ spec) for the Anchor programs of bench/real and bench/real29 from the
//! compact specs below, written from the sources (accounts: `name[:w][s]` in Accounts struct order; args and fields as
//! IDL types: primitives, `vec<T>`, `option<T>`, `[T; n]`, a capitalized name = a defined type).
//! usage: sbpf-bench-real-idl

use sbpf_bench::gen::{idl_accounts, to_json};
use sbpf_bench::repo_root;
use serde_json::{json, Map, Value};

type Fields = &'static [(&'static str, &'static str)];

struct Spec {
    name: &'static str,
    address: &'static str,
    ixs: &'static [(&'static str, &'static str, Fields)],
    accounts: &'static [&'static str],
    types: &'static [(&'static str, Fields)],
    zero_copy: &'static [&'static str],
    errors: &'static [&'static str],
    events: Option<&'static [&'static str]>,
}

const SPECS: &[Spec] = &[
    Spec {
        name: "o_multisig",
        address: "msigUdDBsR4zSUYqYEDrc1LcgtmuSDDM7KxpRUXNC6U",
        ixs: &[
            ("create_multisig", "multisig:ws", &[("owners", "vec<pubkey>"), ("threshold", "u64"), ("nonce", "u8")]),
            ("create_transaction", "multisig transaction:ws proposer:s", &[("pid", "pubkey"), ("accs", "vec<TransactionAccount>"), ("data", "bytes")]),
            ("approve", "multisig transaction:w owner:s", &[]),
            ("set_owners_and_change_threshold", "multisig:w multisig_signer:s", &[("owners", "vec<pubkey>"), ("threshold", "u64")]),
            ("set_owners", "multisig:w multisig_signer:s", &[("owners", "vec<pubkey>")]),
            ("change_threshold", "multisig:w multisig_signer:s", &[("threshold", "u64")]),
            ("execute_transaction", "multisig multisig_signer transaction:w", &[]),
        ],
        accounts: &["Multisig", "Transaction"],
        types: &[
            ("Multisig", &[("owners", "vec<pubkey>"), ("threshold", "u64"), ("nonce", "u8"), ("owner_set_seqno", "u32")]),
            ("Transaction", &[("multisig", "pubkey"), ("program_id", "pubkey"), ("accounts", "vec<TransactionAccount>"), ("data", "bytes"), ("signers", "vec<bool>"), ("did_execute", "bool"), ("owner_set_seqno", "u32")]),
            ("TransactionAccount", &[("pubkey", "pubkey"), ("is_signer", "bool"), ("is_writable", "bool")]),
        ],
        zero_copy: &[],
        errors: &["InvalidOwner", "InvalidOwnersLen", "NotEnoughSigners", "TransactionAlreadySigned", "Overflow", "UnableToDelete", "AlreadyExecuted", "InvalidThreshold", "UniqueOwners"],
        events: None,
    },
    Spec {
        name: "o_escrow",
        address: "3o3jk7aj2aGCGsbChkgeNdHcBmeEmGA7BtpnTXdVSgtr",
        ixs: &[
            ("make_offer", "maker:ws token_mint_a token_mint_b maker_token_account_a:w offer:w vault:w associated_token_program token_program system_program", &[("id", "u64"), ("token_a_offered_amount", "u64"), ("token_b_wanted_amount", "u64")]),
            ("take_offer", "taker:ws maker:w token_mint_a token_mint_b taker_token_account_a:w taker_token_account_b:w maker_token_account_b:w offer:w vault:w associated_token_program token_program system_program", &[]),
            ("refund_offer", "maker:ws token_mint_a maker_token_account_a:w offer:w vault:w token_program", &[]),
        ],
        accounts: &["Offer"],
        types: &[("Offer", &[("id", "u64"), ("maker", "pubkey"), ("token_mint_a", "pubkey"), ("token_mint_b", "pubkey"), ("token_b_wanted_amount", "u64"), ("bump", "u8")])],
        zero_copy: &[],
        errors: &["CustomError"],
        events: None,
    },
    Spec {
        name: "r_a31_staking",
        address: "Da8iRYKozKr2XYpuUT7NayMotUGDG4oUqbRtWT3UhdSY",
        ixs: &[
            ("init_config", "admin:ws config:w program program_data system_program", &[("fee_bps", "u16"), ("treasury", "pubkey")]),
            ("propose_admin", "config:w admin:s", &[("new_admin", "pubkey")]),
            ("accept_admin", "config:w new_admin:s", &[]),
            ("set_fee", "config:w admin:s", &[("fee_bps", "u16")]),
            ("set_paused", "config:w admin:s", &[("paused", "bool")]),
            ("set_treasury", "config:w admin:s", &[("treasury", "pubkey")]),
            ("create_pool", "admin:ws config stake_mint reward_mint pool:w stake_vault:w reward_vault:w stats:w token_program system_program", &[("reward_rate", "u64")]),
            ("set_reward_rate", "config admin:s pool:w", &[("reward_rate", "u64")]),
            ("open_position", "payer:ws owner pool position:w system_program", &[]),
            ("stake", "config pool:w position:w owner:s user_stake:w stake_vault:w token_program", &[("amount", "u64")]),
            ("unstake", "config pool:w position:w owner:s stake_mint user_stake:w stake_vault:w treasury_token:w token_program associated_token_program", &[("amount", "u64")]),
            ("claim", "pool:w position:w owner:s user_reward:w reward_vault:w stats:w token_program", &[]),
            ("fund_rewards", "funder:s pool:w funder_token:w reward_vault:w token_program", &[("amount", "u64")]),
            ("crank", "cranker:s pool:w stats:w", &[]),
            ("sync_positions", "pool:w", &[]),
            ("close_position", "owner:ws position:w", &[]),
        ],
        accounts: &["Config", "Pool", "Position", "PoolStats"],
        types: &[
            ("Config", &[("admin", "pubkey"), ("pending_admin", "pubkey"), ("treasury", "pubkey"), ("fee_bps", "u16"), ("paused", "bool"), ("bump", "u8")]),
            ("Pool", &[("stake_mint", "pubkey"), ("reward_mint", "pubkey"), ("stake_vault", "pubkey"), ("reward_vault", "pubkey"), ("reward_rate", "u64"), ("total_staked", "u64"), ("acc_reward_per_share", "u128"), ("last_update_ts", "i64"), ("rewards_funded", "u64"), ("bump", "u8"), ("stats_bump", "u8")]),
            ("Position", &[("owner", "pubkey"), ("pool", "pubkey"), ("amount", "u64"), ("reward_debt", "u128"), ("pending", "u64"), ("bump", "u8")]),
            ("PoolStats", &[("pool", "pubkey"), ("crank_count", "u64"), ("last_crank_ts", "i64"), ("total_claimed", "u64"), ("head", "u64"), ("history", "[u64; 16]")]),
            ("ConfigUpdated", &[("admin", "pubkey"), ("fee_bps", "u16"), ("treasury", "pubkey"), ("paused", "bool")]),
            ("Staked", &[("pool", "pubkey"), ("owner", "pubkey"), ("amount", "u64")]),
            ("Unstaked", &[("pool", "pubkey"), ("owner", "pubkey"), ("amount", "u64"), ("fee", "u64")]),
            ("Claimed", &[("pool", "pubkey"), ("owner", "pubkey"), ("amount", "u64")]),
            ("RewardsFunded", &[("pool", "pubkey"), ("funder", "pubkey"), ("amount", "u64")]),
        ],
        zero_copy: &["PoolStats"],
        errors: &["FeeTooHigh", "RateTooHigh", "Unauthorized", "NotPendingAdmin", "InvalidProgramData", "SameMint", "InvalidVault", "InvalidMint", "InvalidPosition", "ZeroAmount", "Paused", "InsufficientStake", "PositionNotEmpty", "MathOverflow"],
        events: Some(&["ConfigUpdated", "Staked", "Unstaked", "Claimed", "RewardsFunded"]),
    },
    Spec {
        name: "r_a29_market",
        address: "E8kSAFnyqQdXis8mCgX3pAXyG3ZLasYJX9AYEAVyRhZh",
        ixs: &[
            ("init_market", "admin:ws market:w fee_vault:w system_program", &[("fee_bps", "u16")]),
            ("set_fee", "market:w admin:s", &[("fee_bps", "u16")]),
            ("set_paused", "market:w admin:s", &[("paused", "bool")]),
            ("transfer_admin", "market:w admin:s new_admin:s", &[]),
            ("withdraw_fees", "market admin:s fee_vault:w destination:w system_program", &[("amount", "u64")]),
            ("list", "seller:ws market mint seller_token:w listing:w escrow:w token_program system_program", &[("price", "u64"), ("amount", "u64")]),
            ("update_price", "listing:w seller:s", &[("price", "u64")]),
            ("cancel_listing", "seller:ws listing:w escrow:w seller_token:w token_program", &[]),
            ("buy", "buyer:ws market listing:w escrow:w seller:w fee_vault:w buyer_token:w token_program system_program", &[("amount", "u64"), ("max_price", "u64")]),
            ("sweep_listing", "listing:w escrow:w seller:w token_program", &[]),
        ],
        accounts: &["Market", "Listing"],
        types: &[
            ("Market", &[("admin", "pubkey"), ("fee_bps", "u16"), ("paused", "bool"), ("bump", "u8"), ("fee_vault_bump", "u8")]),
            ("Listing", &[("seller", "pubkey"), ("mint", "pubkey"), ("escrow", "pubkey"), ("price", "u64"), ("remaining", "u64"), ("bump", "u8"), ("escrow_bump", "u8")]),
            ("Listed", &[("listing", "pubkey"), ("seller", "pubkey"), ("mint", "pubkey"), ("price", "u64"), ("amount", "u64")]),
            ("Sold", &[("listing", "pubkey"), ("buyer", "pubkey"), ("amount", "u64"), ("cost", "u64"), ("fee", "u64")]),
            ("FeesWithdrawn", &[("amount", "u64"), ("destination", "pubkey")]),
        ],
        zero_copy: &[],
        errors: &["Unauthorized", "FeeTooHigh", "Paused", "InvalidAmount", "PriceChanged", "InvalidEscrow", "NotSoldOut", "InsufficientFees", "MathOverflow"],
        events: Some(&["Listed", "Sold", "FeesWithdrawn"]),
    },
];

/// an IDL type from its compact form
fn ty(s: &str) -> Value {
    if let Some(inner) = s.strip_prefix("vec<").and_then(|r| r.strip_suffix('>')) {
        return json!({ "vec": ty(inner) });
    }
    if let Some(inner) = s.strip_prefix("option<").and_then(|r| r.strip_suffix('>')) {
        return json!({ "option": ty(inner) });
    }
    if let Some((t, n)) = s
        .strip_prefix('[')
        .and_then(|r| r.strip_suffix(']'))
        .and_then(|r| r.split_once("; "))
    {
        return json!({ "array": [ty(t), n.parse::<u64>().expect("array length")] });
    }
    if s.starts_with(|c: char| c.is_ascii_uppercase()) {
        return json!({ "defined": { "name": s } });
    }
    json!(s)
}

fn disc(s: &str) -> Value {
    json!(sbpf_print::names::sha256(s.as_bytes())[..8].to_vec())
}

fn fields(f: Fields) -> Value {
    Value::Array(
        f.iter()
            .map(|(n, t)| json!({ "name": n, "type": ty(t) }))
            .collect(),
    )
}

fn idl(s: &Spec) -> Value {
    let mut o = Map::new();
    o.insert("address".into(), json!(s.address));
    o.insert(
        "metadata".into(),
        json!({ "name": s.name, "version": "0.1.0", "spec": "0.1.0" }),
    );
    o.insert(
        "instructions".into(),
        Value::Array(
            s.ixs
                .iter()
                .map(|(n, a, args)| {
                    json!({ "name": n, "discriminator": disc(&format!("global:{n}")), "accounts": idl_accounts(a), "args": fields(args) })
                })
                .collect(),
        ),
    );
    o.insert(
        "accounts".into(),
        Value::Array(
            s.accounts
                .iter()
                .map(|t| json!({ "name": t, "discriminator": disc(&format!("account:{t}")) }))
                .collect(),
        ),
    );
    if let Some(ev) = s.events {
        o.insert(
            "events".into(),
            Value::Array(
                ev.iter()
                    .map(|e| json!({ "name": e, "discriminator": disc(&format!("event:{e}")) }))
                    .collect(),
            ),
        );
    }
    o.insert(
        "errors".into(),
        Value::Array(
            s.errors
                .iter()
                .enumerate()
                .map(|(i, e)| json!({ "code": 6000 + i, "name": e[..1].to_lowercase() + &e[1..] }))
                .collect(),
        ),
    );
    o.insert(
        "types".into(),
        Value::Array(
            s.types
                .iter()
                .map(|(t, f)| {
                    let mut x = Map::new();
                    x.insert("name".into(), json!(t));
                    if s.zero_copy.contains(t) {
                        x.insert("serialization".into(), json!("bytemuckunsafe"));
                        x.insert("repr".into(), json!({ "kind": "c" }));
                    }
                    x.insert(
                        "type".into(),
                        json!({ "kind": "struct", "fields": fields(f) }),
                    );
                    Value::Object(x)
                })
                .collect(),
        ),
    );
    Value::Object(o)
}

fn main() {
    let out = repo_root().join("bench/idl");
    for s in SPECS {
        let p = out.join(format!("{}.json", s.name));
        std::fs::write(&p, to_json(&idl(s))).unwrap_or_else(|e| panic!("{}: {e}", p.display()));
        println!("{}: {} instructions", s.name, s.ixs.len());
    }
}
