//! Syscall table (the order is part of the output: the stubs' declaration order).

use crate::murmur::hash_name;
use sbpf_ir::fx::HashMap;
use std::sync::OnceLock;

/// Syscall signature. `ret` = returns a meaningful u64.
#[derive(Clone, Debug, PartialEq)]
pub struct Syscall {
    pub name: String,
    pub alias: String,
    pub params: Vec<&'static str>,
    pub ret: bool,
    pub noreturn: bool,
    pub doc: &'static str,
}

type Row = (
    &'static str,
    &'static [&'static str],
    bool,
    &'static str,
    bool,
);

#[rustfmt::skip]
const TABLE: &[Row] = &[
    ("abort", &[], false, "abort program execution (panic)", true),
    ("sol_panic_", &["file", "len", "line", "column"], false, "panic with file:line:column", true),
    ("sol_log_", &["msg", "len"], false, "log utf8 message", false),
    ("sol_log_64_", &["a1", "a2", "a3", "a4", "a5"], false, "log 5 u64 values as hex", false),
    ("sol_log_compute_units_", &[], false, "log remaining compute units", false),
    ("sol_log_pubkey", &["pubkey"], false, "log base58 pubkey (32 bytes)", false),
    ("sol_log_data", &["slices", "len"], false, "log base64 data: slices = &[&[u8]]", false),
    ("sol_create_program_address", &["seeds", "seedsLen", "programId", "outAddr"], true, "derive PDA from seeds (&[&[u8]]); 0 = ok", false),
    ("sol_try_find_program_address", &["seeds", "seedsLen", "programId", "outAddr", "outBump"], true, "find PDA + bump seed; 0 = ok", false),
    ("sol_sha256", &["vals", "len", "out"], true, "sha256 over slices (&[&[u8]]) -> out[32]", false),
    ("sol_keccak256", &["vals", "len", "out"], true, "keccak256 over slices -> out[32]", false),
    ("sol_blake3", &["vals", "len", "out"], true, "blake3 over slices -> out[32]", false),
    ("sol_poseidon", &["params", "endianness", "vals", "len", "out"], true, "poseidon hash", false),
    ("sol_secp256k1_recover", &["hash", "recoveryId", "signature", "out"], true, "recover secp256k1 pubkey -> out[64]", false),
    ("sol_invoke_signed_c", &["ix", "accountInfos", "accountInfosLen", "signerSeeds", "signerSeedsLen"], true, "CPI (C ABI structs)", false),
    ("sol_invoke_signed_rust", &["ix", "accountInfos", "accountInfosLen", "signerSeeds", "signerSeedsLen"], true, "CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])", false),
    ("sol_alloc_free_", &["size", "freePtr"], true, "deprecated heap alloc/free", false),
    ("sol_set_return_data", &["data", "len"], false, "set program return data", false),
    ("sol_get_return_data", &["data", "len", "programId"], true, "get return data of last CPI -> copied length", false),
    ("sol_get_stack_height", &[], true, "current invocation stack height", false),
    ("sol_get_processed_sibling_instruction", &["index", "meta", "programId", "data", "accounts"], true, "read processed sibling instruction", false),
    ("sol_memcpy_", &["dst", "src", "n"], false, "memcpy (non-overlapping)", false),
    ("sol_memmove_", &["dst", "src", "n"], false, "memmove", false),
    ("sol_memcmp_", &["a", "b", "n", "outI32"], false, "memcmp; *outI32 = result", false),
    ("sol_memset_", &["dst", "byte", "n"], false, "memset", false),
    ("sol_get_clock_sysvar", &["out"], true, "Clock sysvar -> out", false),
    ("sol_get_epoch_schedule_sysvar", &["out"], true, "EpochSchedule sysvar -> out", false),
    ("sol_get_rent_sysvar", &["out"], true, "Rent sysvar -> out", false),
    ("sol_get_fees_sysvar", &["out"], true, "Fees sysvar -> out", false),
    ("sol_get_last_restart_slot", &["out"], true, "LastRestartSlot sysvar -> out", false),
    ("sol_get_epoch_rewards_sysvar", &["out"], true, "EpochRewards sysvar -> out", false),
    ("sol_get_sysvar", &["sysvarId", "out", "offset", "len"], true, "read sysvar bytes", false),
    ("sol_get_epoch_stake", &["voteAddr"], true, "epoch stake of vote account", false),
    ("sol_remaining_compute_units", &[], true, "remaining compute units", false),
    ("sol_curve_validate_point", &["curveId", "point", "out"], true, "curve point validation", false),
    ("sol_curve_group_op", &["curveId", "op", "left", "right", "out"], true, "curve group op", false),
    ("sol_curve_multiscalar_mul", &["curveId", "scalars", "points", "n", "out"], true, "curve multiscalar mul", false),
    ("sol_curve_pairing_map", &["curveId", "point", "out"], true, "curve pairing map", false),
    ("sol_alt_bn128_group_op", &["op", "input", "len", "out"], true, "alt_bn128 group op", false),
    ("sol_alt_bn128_compression", &["op", "input", "len", "out"], true, "alt_bn128 compression", false),
    ("sol_big_mod_exp", &["params", "out"], true, "big modular exponentiation", false),
];

fn mk(
    name: &str,
    params: Vec<&'static str>,
    ret: bool,
    doc: &'static str,
    noreturn: bool,
) -> Syscall {
    // alias: name.replace(/_$/, '')
    let alias = name.strip_suffix('_').unwrap_or(name).to_string();
    Syscall {
        name: name.into(),
        alias,
        params,
        ret,
        noreturn,
        doc,
    }
}

pub struct Tables {
    pub all: Vec<Syscall>,
    pub by_hash: HashMap<u32, usize>,
    pub by_name: HashMap<&'static str, usize>,
}

pub fn tables() -> &'static Tables {
    static T: OnceLock<Tables> = OnceLock::new();
    T.get_or_init(|| {
        let all: Vec<Syscall> = TABLE
            .iter()
            .map(|&(n, p, r, d, nr)| mk(n, p.to_vec(), r, d, nr))
            .collect();
        let mut by_hash = HashMap::default();
        let mut by_name = HashMap::default();
        for (i, &(n, ..)) in TABLE.iter().enumerate() {
            by_hash.insert(hash_name(n), i); // (Map constructor: a later duplicate key wins)
            by_name.insert(n, i);
        }
        Tables {
            all,
            by_hash,
            by_name,
        }
    })
}

pub fn by_hash(h: u32) -> Option<&'static Syscall> {
    let t = tables();
    t.by_hash.get(&h).map(|&i| &t.all[i])
}

pub fn by_name(n: &str) -> Option<&'static Syscall> {
    let t = tables();
    t.by_name.get(n).map(|&i| &t.all[i])
}

/// Signature for an unknown imported symbol: assume full 5-register ABI.
pub fn unknown_syscall(name: &str) -> Syscall {
    mk(
        name,
        vec!["a1", "a2", "a3", "a4", "a5"],
        true,
        "unknown syscall",
        false,
    )
}
