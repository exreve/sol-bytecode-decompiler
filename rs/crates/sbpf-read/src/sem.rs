//! `src/semantics.ts` (the readable-output parts): well-known keys, the discriminator dictionary
//! (rodata names, the selector vocabulary, the IDL), rodata strings and keys, Result layouts, and the
//! comments constants get. The instruction-log naming (anchor flag, ix names, processors) is in
//! `sbpf_print::names`.

use crate::idl::IdlInfo;
use crate::util::{b58, unb58};
use sbpf_ir::fx::IndexMap;
use sbpf_exec::hash::sha8;
use sbpf_program::Program;
use sbpf_ir::fx::{HashMap, HashSet};
use std::sync::OnceLock;

pub const KNOWN_KEYS: &[(&str, &str)] = &[
    ("11111111111111111111111111111111", "SYSTEM_PROGRAM"),
    (
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "TOKEN_PROGRAM",
    ),
    (
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        "TOKEN_2022_PROGRAM",
    ),
    (
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        "ASSOCIATED_TOKEN_PROGRAM",
    ),
    (
        "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
        "MEMO_PROGRAM",
    ),
    (
        "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo",
        "MEMO_V1_PROGRAM",
    ),
    (
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
        "TOKEN_METADATA_PROGRAM",
    ),
    (
        "ComputeBudget111111111111111111111111111111",
        "COMPUTE_BUDGET_PROGRAM",
    ),
    (
        "BPFLoaderUpgradeab1e11111111111111111111111",
        "BPF_LOADER_UPGRADEABLE",
    ),
    (
        "BPFLoader2111111111111111111111111111111111",
        "BPF_LOADER_2",
    ),
    (
        "BPFLoader1111111111111111111111111111111111",
        "BPF_LOADER_1",
    ),
    (
        "SysvarC1ock11111111111111111111111111111111",
        "SYSVAR_CLOCK",
    ),
    ("SysvarRent111111111111111111111111111111111", "SYSVAR_RENT"),
    (
        "Sysvar1nstructions1111111111111111111111111",
        "SYSVAR_INSTRUCTIONS",
    ),
    (
        "SysvarRecentB1ockHashes11111111111111111111",
        "SYSVAR_RECENT_BLOCKHASHES",
    ),
    (
        "SysvarEpochSchedu1e111111111111111111111111",
        "SYSVAR_EPOCH_SCHEDULE",
    ),
    ("SysvarFees111111111111111111111111111111111", "SYSVAR_FEES"),
    (
        "SysvarS1otHashes111111111111111111111111111",
        "SYSVAR_SLOT_HASHES",
    ),
    (
        "SysvarStakeHistory1111111111111111111111111",
        "SYSVAR_STAKE_HISTORY",
    ),
    (
        "SysvarEpochRewards1111111111111111111111111",
        "SYSVAR_EPOCH_REWARDS",
    ),
    (
        "SysvarLastRestartS1ot1111111111111111111111",
        "SYSVAR_LAST_RESTART_SLOT",
    ),
    (
        "Stake11111111111111111111111111111111111111",
        "STAKE_PROGRAM",
    ),
    (
        "Vote111111111111111111111111111111111111111",
        "VOTE_PROGRAM",
    ),
    (
        "Config1111111111111111111111111111111111111",
        "CONFIG_PROGRAM",
    ),
    (
        "AddressLookupTab1e1111111111111111111111111",
        "ADDRESS_LOOKUP_TABLE_PROGRAM",
    ),
    (
        "Ed25519SigVerify111111111111111111111111111",
        "ED25519_PROGRAM",
    ),
    (
        "KeccakSecp256k11111111111111111111111111111",
        "SECP256K1_PROGRAM",
    ),
    ("So11111111111111111111111111111111111111112", "WSOL_MINT"),
    ("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "USDC_MINT"),
    ("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "USDT_MINT"),
    (
        "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",
        "OPENBOOK_V1_PROGRAM",
    ),
    (
        "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb",
        "OPENBOOK_V2_PROGRAM",
    ),
    (
        "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
        "RAYDIUM_AMM_V4_PROGRAM",
    ),
    (
        "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
        "RAYDIUM_CLMM_PROGRAM",
    ),
    (
        "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C",
        "RAYDIUM_CPMM_PROGRAM",
    ),
    (
        "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
        "ORCA_WHIRLPOOL_PROGRAM",
    ),
    (
        "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        "JUPITER_V6_PROGRAM",
    ),
    (
        "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
        "METEORA_DLMM_PROGRAM",
    ),
    (
        "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
        "PUMPFUN_PROGRAM",
    ),
    (
        "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
        "MPL_CORE_PROGRAM",
    ),
    (
        "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
        "BUBBLEGUM_PROGRAM",
    ),
    (
        "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy",
        "STAKE_POOL_PROGRAM",
    ),
    (
        "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX",
        "NAME_SERVICE_PROGRAM",
    ),
    (
        "rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ",
        "PYTH_RECEIVER_PROGRAM",
    ),
    (
        "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH",
        "PYTH_ORACLE_PROGRAM",
    ),
    (
        "SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv",
        "SWITCHBOARD_ONDEMAND_PROGRAM",
    ),
    (
        "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf",
        "SQUADS_V4_PROGRAM",
    ),
    (
        "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
        "MARINADE_PROGRAM",
    ),
    (
        "KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD",
        "KAMINO_LEND_PROGRAM",
    ),
    (
        "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH",
        "DRIFT_PROGRAM",
    ),
    (
        "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth",
        "WORMHOLE_CORE_PROGRAM",
    ),
    (
        "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb",
        "WORMHOLE_TOKEN_BRIDGE",
    ),
    (
        "4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg",
        "MANGO_V4_PROGRAM",
    ),
    (
        "T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt",
        "JITO_TIP_PROGRAM",
    ),
];

pub fn known_key(b58s: &str) -> Option<&'static str> {
    KNOWN_KEYS.iter().find(|(k, _)| *k == b58s).map(|x| x.1)
}

pub const NICHE: u64 = 0x8000_0000_0000_0000;
pub const OK_TAGS: [u64; 6] = [0x12, 0x14, 0x15, 0x16, 0x18, 0x1a];
const HEAP_CURSOR: u64 = 0x3_0000_0000;

pub const PROGRAM_ERRORS: [&str; 27] = [
    "",
    "Custom(0)",
    "InvalidArgument",
    "InvalidInstructionData",
    "InvalidAccountData",
    "AccountDataTooSmall",
    "InsufficientFunds",
    "IncorrectProgramId",
    "MissingRequiredSignature",
    "AccountAlreadyInitialized",
    "UninitializedAccount",
    "NotEnoughAccountKeys",
    "AccountBorrowFailed",
    "MaxSeedLengthExceeded",
    "InvalidSeeds",
    "BorshIoError",
    "AccountNotRentExempt",
    "UnsupportedSysvar",
    "IllegalOwner",
    "MaxAccountsDataAllocationsExceeded",
    "InvalidRealloc",
    "MaxInstructionTraceLengthExceeded",
    "BuiltinProgramsMustConsumeComputeUnits",
    "InvalidAccountOwner",
    "ArithmeticOverflow",
    "Immutable",
    "IncorrectAuthority",
];
fn perr(i: u64) -> &'static str {
    PROGRAM_ERRORS
        .get(i as usize)
        .copied()
        .unwrap_or("undefined")
}

pub fn anchor_error_name(v: u64) -> Option<&'static str> {
    Some(match v {
        100 => "InstructionMissing",
        101 => "InstructionFallbackNotFound",
        102 => "InstructionDidNotDeserialize",
        103 => "InstructionDidNotSerialize",
        1000 => "IdlInstructionStub",
        1001 => "IdlInstructionInvalidProgram",
        1002 => "IdlAccountNotEmpty",
        1500 => "EventInstructionStub",
        2000 => "ConstraintMut",
        2001 => "ConstraintHasOne",
        2002 => "ConstraintSigner",
        2003 => "ConstraintRaw",
        2004 => "ConstraintOwner",
        2005 => "ConstraintRentExempt",
        2006 => "ConstraintSeeds",
        2007 => "ConstraintExecutable",
        2008 => "ConstraintState",
        2009 => "ConstraintAssociated",
        2010 => "ConstraintAssociatedInit",
        2011 => "ConstraintClose",
        2012 => "ConstraintAddress",
        2013 => "ConstraintZero",
        2014 => "ConstraintTokenMint",
        2015 => "ConstraintTokenOwner",
        2016 => "ConstraintMintMintAuthority",
        2017 => "ConstraintMintFreezeAuthority",
        2018 => "ConstraintMintDecimals",
        2019 => "ConstraintSpace",
        2020 => "ConstraintAccountIsNone",
        2021 => "ConstraintTokenTokenProgram",
        2022 => "ConstraintMintTokenProgram",
        2023 => "ConstraintAssociatedTokenTokenProgram",
        2500 => "RequireViolated",
        2501 => "RequireEqViolated",
        2502 => "RequireKeysEqViolated",
        2503 => "RequireNeqViolated",
        2504 => "RequireKeysNeqViolated",
        2505 => "RequireGtViolated",
        2506 => "RequireGteViolated",
        3000 => "AccountDiscriminatorAlreadySet",
        3001 => "AccountDiscriminatorNotFound",
        3002 => "AccountDiscriminatorMismatch",
        3003 => "AccountDidNotDeserialize",
        3004 => "AccountDidNotSerialize",
        3005 => "AccountNotEnoughKeys",
        3006 => "AccountNotMutable",
        3007 => "AccountOwnedByWrongProgram",
        3008 => "InvalidProgramId",
        3009 => "InvalidProgramExecutable",
        3010 => "AccountNotSigner",
        3011 => "AccountNotSystemOwned",
        3012 => "AccountNotInitialized",
        3013 => "AccountNotProgramData",
        3014 => "AccountNotAssociatedTokenAccount",
        3015 => "AccountSysvarMismatch",
        3016 => "AccountReallocExceedsLimit",
        3017 => "AccountDuplicateReallocs",
        4100 => "DeclaredProgramIdMismatch",
        4101 => "TryingToInitPayerAsProgramAccount",
        4102 => "InvalidNumericConversion",
        5000 => "Deprecated",
        _ => return None,
    })
}

/// looksRandom: above 48 bits, 18..=46 bits set.
pub fn looks_random(v: u64) -> bool {
    v > 0xffff_ffff_ffff && (18..=46).contains(&v.count_ones())
}

// ---------------- selector vocabulary ----------------

struct SelDb {
    names: Vec<(String, String)>,
    verbs: Vec<String>,
    nouns: Vec<String>,
}

static SELECTORS: &[u8] = include_bytes!("../../../../data/selectors.json.gz");

fn sel_db() -> &'static SelDb {
    static DB: OnceLock<SelDb> = OnceLock::new();
    DB.get_or_init(|| {
        // gzip: 10-byte header (+ optional fields), deflate stream, 8-byte trailer
        let g = SELECTORS;
        let flg = g[3];
        let mut i = 10usize;
        if flg & 4 != 0 {
            let xlen = u16::from_le_bytes([g[i], g[i + 1]]) as usize;
            i += 2 + xlen;
        }
        if flg & 8 != 0 {
            while g[i] != 0 {
                i += 1;
            }
            i += 1;
        }
        if flg & 16 != 0 {
            while g[i] != 0 {
                i += 1;
            }
            i += 1;
        }
        if flg & 2 != 0 {
            i += 2;
        }
        let raw = miniz_oxide::inflate::decompress_to_vec(&g[i..g.len() - 8]).expect("selectors");
        let v: serde_json::Value = serde_json::from_slice(&raw).expect("selectors json");
        let names = v["names"]
            .as_object()
            .map(|o| {
                o.iter()
                    .map(|(k, x)| (k.clone(), x.as_str().unwrap_or("").to_string()))
                    .collect()
            })
            .unwrap_or_default();
        let list = |k: &str| -> Vec<String> {
            v[k].as_array()
                .map(|a| {
                    a.iter()
                        .map(|x| x.as_str().unwrap_or("").to_string())
                        .collect()
                })
                .unwrap_or_default()
        };
        SelDb {
            names,
            verbs: list("verbs"),
            nouns: list("nouns"),
        }
    })
}

fn name_at(db: &SelDb, i: usize) -> String {
    let per = 2 * (db.nouns.len() + 1);
    let verb = &db.verbs[i / per];
    let r = i % per;
    let noun = if r >> 1 != 0 {
        db.nouns[(r >> 1) - 1].as_str()
    } else {
        ""
    };
    let nm = if !noun.is_empty() {
        format!("{verb}_{noun}")
    } else {
        verb.clone()
    };
    if r & 1 != 0 {
        nm + "_v2"
    } else {
        nm
    }
}

/// The indices of the expanded vocabulary whose `sha8("global:" + name)` is one of `wants`, by wanted value
/// (ascending indices). The vocabulary is hashed on worker threads and only the wanted values are kept (the
/// TS caches the whole (hash, index) table sorted by hash; a lookup finds the same names).
fn vocab_scan(wants: &[u64]) -> HashMap<u64, Vec<u32>> {
    let mut w: Vec<u64> = wants.to_vec();
    w.sort_unstable();
    w.dedup();
    let mut out: HashMap<u64, Vec<u32>> = HashMap::default();
    if w.is_empty() {
        return out;
    }
    let db = sel_db();
    let n = db.verbs.len() * 2 * (db.nouns.len() + 1);
    let threads = std::thread::available_parallelism()
        .map_or(4, |x| x.get())
        .min(16);
    let chunk = n.div_ceil(threads).max(1);
    // (a 2^16-bit filter on the hashes' top bits first: most hashes are no wanted value)
    let mut filter = vec![0u64; 1 << 10];
    for &h in &w {
        let k = (h >> 48) as usize;
        filter[k >> 6] |= 1 << (k & 63);
    }
    let (w, filter) = (&w, &filter);
    let parts: Vec<Vec<(u64, u32)>> = std::thread::scope(|s| {
        let hs: Vec<_> = (0..threads)
            .map(|t| {
                s.spawn(move || {
                    let lo = (t * chunk).min(n);
                    let hi = ((t + 1) * chunk).min(n);
                    let mut v = Vec::new();
                    let per = 2 * (db.nouns.len() + 1);
                    // "global:" + name_at(db, i), without the allocation
                    let name = |i: usize, buf: &mut String| {
                        buf.clear();
                        buf.push_str("global:");
                        buf.push_str(&db.verbs[i / per]);
                        let r = i % per;
                        if r >> 1 != 0 && !db.nouns[(r >> 1) - 1].is_empty() {
                            buf.push('_');
                            buf.push_str(&db.nouns[(r >> 1) - 1]);
                        }
                        if r & 1 != 0 {
                            buf.push_str("_v2");
                        }
                    };
                    let mut check = |h: u64, i: usize| {
                        let k = (h >> 48) as usize;
                        if filter[k >> 6] & (1 << (k & 63)) != 0 && w.binary_search(&h).is_ok() {
                            v.push((h, i as u32));
                        }
                    };
                    let mut bufs: [String; 4] = Default::default();
                    let mut i = lo;
                    // (four names hashed at once)
                    while i + 4 <= hi {
                        for (j, b) in bufs.iter_mut().enumerate() {
                            name(i + j, b);
                        }
                        let hs = sbpf_exec::hash::sha8_x4([
                            bufs[0].as_bytes(),
                            bufs[1].as_bytes(),
                            bufs[2].as_bytes(),
                            bufs[3].as_bytes(),
                        ]);
                        for (j, h) in hs.into_iter().enumerate() {
                            check(h, i + j);
                        }
                        i += 4;
                    }
                    while i < hi {
                        name(i, &mut bufs[0]);
                        check(sha8(bufs[0].as_bytes()), i);
                        i += 1;
                    }
                    v
                })
            })
            .collect();
        hs.into_iter().map(|h| h.join().unwrap()).collect()
    });
    for (h, i) in parts.into_iter().flatten() {
        out.entry(h).or_default().push(i);
    }
    out
}

/// The vocabulary names of wanted hashes (a hash of several indices names them all the same: the names are
/// equal, barring a 64-bit collision).
fn vocab_lookup_many(wants: &[u64]) -> HashMap<u64, String> {
    // (a process decompiles more than once, e.g. the diff's two programs and their profiles: the answers
    // are kept, only values not looked up yet are scanned for)
    static SEEN: std::sync::Mutex<Option<HashMap<u64, Option<String>>>> = std::sync::Mutex::new(None);
    let mut seen = SEEN.lock().unwrap();
    let seen = seen.get_or_insert_with(HashMap::default);
    let new: Vec<u64> = wants
        .iter()
        .copied()
        .filter(|v| !seen.contains_key(v))
        .collect();
    if !new.is_empty() {
        let found = vocab_scan(&new);
        for v in new {
            let nm = found.get(&v).map(|is| name_at(sel_db(), is[0] as usize));
            seen.insert(v, nm);
        }
    }
    wants
        .iter()
        .filter_map(|v| seen.get(v).cloned().flatten().map(|n| (*v, n)))
        .collect()
}

/// selector.ts lookup: the name of an 8-byte discriminator given as 16 hex digits (`0x` optional), either
/// byte order: the dataset's names, then `i:<verb>_<noun>` of the vocabulary (first in vocabulary order).
pub fn selector_lookup(hex: &str) -> Option<String> {
    let h = hex.strip_prefix("0x").unwrap_or(hex).to_ascii_lowercase();
    if h.len() > 16 || !h.bytes().all(|c| c.is_ascii_hexdigit()) {
        return None;
    }
    let h = format!("{h:0>16}");
    let be = u64::from_str_radix(&h, 16).ok()?;
    let le_hex = format!("{:016x}", be.swap_bytes());
    let db = sel_db();
    for k in [&h, &le_hex] {
        if let Some((_, n)) = db.names.iter().find(|(x, n)| x == k && !n.is_empty()) {
            return Some(n.clone());
        }
    }
    // (h8("global:" + name) as hex is the bytes in order: as a little-endian u64, the swapped value)
    let t = vocab_scan(&[be.swap_bytes(), be]);
    let mut best: Option<u32> = None;
    for want in [be.swap_bytes(), be] {
        for &x in t.get(&want).into_iter().flatten() {
            if x & 1 == 0 && best.is_none_or(|b| x < b) {
                best = Some(x);
            }
        }
    }
    best.map(|i| format!("i:{}", name_at(db, i as usize)))
}

// ---------------- Semantics ----------------

/// The readable output's Semantics.
pub struct SemR {
    pub anchor: bool,
    pub ix_names: IndexMap<i64, String>,
    pub processors: IndexMap<i64, Vec<String>>,
    key_chunks: HashMap<u64, String>,
    key_addrs: HashMap<u64, String>,
    /// 8-byte discriminator -> "ix:x" / "account:X" / "event:X"
    pub disc: IndexMap<u64, String>,
    pub result_ok: Option<u64>,
    pub result_ok_tag: Option<u64>,
    /// syscall name -> alias
    sys_alias: HashMap<String, String>,
    /// image regions in address order: (vaddr, bytes, exec)
    regions: Vec<(u64, Vec<u8>, bool)>,
    str_cache: std::cell::RefCell<HashMap<String, Option<u64>>>,
    /// idl error names (code -> String(name), None: undefined)
    idl_errors: Option<HashMap<u64, Option<String>>>,
}

fn snake_sem(s: &str) -> String {
    sbpf_print::names::snake(s)
}

/// `/[A-Za-z][A-Za-z0-9_]{2,40}/g` over latin1 bytes
fn words_in(b: &[u8], out: &mut sbpf_ir::fx::IndexSet<String>) {
    let w = |c: u8| c.is_ascii_alphanumeric() || c == b'_';
    let mut i = 0;
    while i < b.len() {
        if !b[i].is_ascii_alphabetic() {
            i += 1;
            continue;
        }
        let s = i;
        let mut j = i + 1;
        while j < b.len() && j - s < 41 && w(b[j]) {
            j += 1;
        }
        if j - s >= 3 {
            out.insert(String::from_utf8(b[s..j].to_vec()).unwrap());
            i = j;
        } else {
            i += 1;
        }
    }
}

/// `w.match(/[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*/g)`
fn camel_parts(w: &str) -> Vec<String> {
    let b = w.as_bytes();
    let lo = |c: u8| c.is_ascii_lowercase() || c.is_ascii_digit();
    let mut out = Vec::new();
    let mut i = 0;
    while i < b.len() {
        if b[i].is_ascii_uppercase() && i + 1 < b.len() && lo(b[i + 1]) {
            let s = i;
            let mut j = i + 1;
            while j < b.len() && lo(b[j]) {
                j += 1;
            }
            while j + 1 < b.len() && b[j].is_ascii_uppercase() && lo(b[j + 1]) {
                j += 1;
                while j < b.len() && lo(b[j]) {
                    j += 1;
                }
            }
            out.push(w[s..j].to_string());
            i = j;
        } else {
            i += 1;
        }
    }
    out
}

impl SemR {
    pub fn new(p: &Program, base: &sbpf_print::names::Sem, idl: Option<&IdlInfo>) -> SemR {
        let img = p.image();
        let mut regions = Vec::new();
        for &i in &img.order {
            let r = &p.elf.regions[i];
            regions.push((r.vaddr, p.elf.region_bytes(r).to_vec(), r.exec));
        }
        let mut key_chunks = HashMap::default();
        for (k, n) in KNOWN_KEYS {
            let b = unb58(k);
            if k.starts_with("1111") {
                continue;
            }
            for i in 0..4 {
                let w = u64::from_le_bytes(b[i * 8..i * 8 + 8].try_into().unwrap());
                key_chunks.insert(
                    w,
                    if i == 0 {
                        n.to_string()
                    } else {
                        format!("{n}[{i}]")
                    },
                );
            }
        }
        let mut s = SemR {
            anchor: base.anchor,
            ix_names: base.ix_names.clone(),
            processors: base.processors.clone(),
            key_chunks,
            key_addrs: HashMap::default(),
            disc: IndexMap::default(),
            result_ok: None,
            result_ok_tag: None,
            sys_alias: p
                .syscalls
                .iter()
                .map(|(k, v)| (k.clone(), v.alias.clone()))
                .collect(),
            regions,
            str_cache: Default::default(),
            idl_errors: idl.map(|i| {
                i.errors
                    .iter()
                    .map(|(k, v)| (*k, v.as_ref().map(crate::idl::js_string)))
                    .collect()
            }),
        };
        s.scan_rodata();
        if let Some(idl) = idl {
            for (v, n) in &idl.discs {
                s.disc.insert(*v, n.clone());
            }
        }
        s
    }

    fn scan_rodata(&mut self) {
        let mut known: HashMap<Vec<u8>, &str> = HashMap::default();
        let mut prefixes: HashSet<u32> = HashSet::default();
        for (k, n) in KNOWN_KEYS {
            let kb = unb58(k);
            prefixes.insert(u32::from_le_bytes(kb[..4].try_into().unwrap()));
            known.insert(kb, n);
        }
        let mut words: sbpf_ir::fx::IndexSet<String> = sbpf_ir::fx::IndexSet::default();
        for (vaddr, b, exec) in &self.regions {
            if *exec {
                continue;
            }
            let mut o = 0usize;
            while o + 32 <= b.len() {
                let pf = u32::from_le_bytes(b[o..o + 4].try_into().unwrap());
                if prefixes.contains(&pf) {
                    if let Some(h) = known.get(&b[o..o + 32]) {
                        if !h.starts_with("SYSTEM") {
                            self.key_addrs.insert(vaddr + o as u64, h.to_string());
                        }
                    }
                }
                o += 1;
            }
            words_in(b, &mut words);
        }
        for w in &words {
            let mut xs = vec![w.clone()];
            xs.extend(camel_parts(w));
            for x in xs {
                self.disc.insert(
                    sha8(format!("account:{x}").as_bytes()),
                    format!("account:{x}"),
                );
                self.disc
                    .insert(sha8(format!("event:{x}").as_bytes()), format!("event:{x}"));
                let sn = snake_sem(&x);
                self.disc
                    .insert(sha8(format!("global:{sn}").as_bytes()), format!("ix:{sn}"));
            }
        }
        let db = sel_db();
        for (h, n) in &db.names {
            let mut b = [0u8; 8];
            let hb = h.as_bytes();
            for i in 0..8 {
                let pair = hb.get(i * 2..i * 2 + 2);
                match pair
                    .and_then(|p| std::str::from_utf8(p).ok())
                    .and_then(|p| u8::from_str_radix(p, 16).ok())
                {
                    Some(x) => b[i] = x,
                    None => break,
                }
            }
            let v = u64::from_le_bytes(b);
            if self.disc.contains_key(&v) {
                continue;
            }
            let d = if let Some(r) = n.strip_prefix("i:") {
                format!("ix:{r}")
            } else if let Some(r) = n.strip_prefix("a:") {
                format!("account:{r}")
            } else {
                format!("event:{}", n.get(2..).unwrap_or(""))
            };
            self.disc.insert(v, d);
        }
    }

    /// resolveCandidates
    pub fn resolve_candidates(&mut self, values: &sbpf_ir::fx::IndexSet<u64>) {
        let want: Vec<u64> = values
            .iter()
            .copied()
            .filter(|v| !self.disc.contains_key(v) && looks_random(*v))
            .collect();
        if want.is_empty() {
            return;
        }
        let names = vocab_lookup_many(&want);
        for v in want {
            if let Some(name) = names.get(&v) {
                self.disc.insert(v, format!("ix:{name}"));
            }
        }
    }

    pub fn disc_of(&self, ix: &str) -> u64 {
        sha8(format!("global:{ix}").as_bytes())
    }

    pub fn syscall_name<'a>(&'a self, n: &'a str) -> &'a str {
        self.sys_alias.get(n).map_or(n, |s| s.as_str())
    }

    /// noteResultCompares (counts in Map order)
    pub fn note_result_compares(&mut self, counts: &IndexMap<u64, u32>) {
        let mut best: Option<u64> = None;
        let mut n = 0;
        for (&v, &c) in counts {
            if c > n || (c == n && best.is_some() && v > best.unwrap()) {
                best = Some(v);
                n = c;
            }
        }
        if let Some(b) = best {
            if n >= 3 && b >= NICHE + 0x10 && b < NICHE + PROGRAM_ERRORS.len() as u64 {
                self.result_ok = Some(b);
            }
        }
    }

    pub fn note_result_tags(&mut self, compares: &IndexMap<u64, u32>, stores: &IndexMap<u64, u32>) {
        let mut best: Option<u64> = None;
        let mut n = 0;
        for (&v, &c) in compares {
            if c > n {
                best = Some(v);
                n = c;
            }
        }
        if let Some(b) = best {
            if stores.contains_key(&b) {
                self.result_ok_tag = Some(b);
            }
        }
    }

    pub fn result_tag_name(&self, v: u64) -> Option<String> {
        let ok = self.result_ok_tag?;
        if v > ok {
            return None;
        }
        Some(if v == ok {
            "Ok".into()
        } else if v == 0 {
            "Err(ProgramError::Custom(u32 at +4))".into()
        } else {
            format!("Err(ProgramError::{})", perr(v + 1))
        })
    }

    /// constComment(v, role): role 0 value, 1 addr, 2 ret
    pub fn const_comment(&self, v: u64, role: u8) -> Option<String> {
        if looks_random(v) {
            if let Some(d) = self.disc.get(&v) {
                return Some(d.clone());
            }
        }
        if v == HEAP_CURSOR {
            return Some("heap bump-allocator cursor".into());
        }
        if role == 1 {
            return None;
        }
        if let Some(ok) = self.result_ok {
            if v > NICHE && v <= ok {
                return Some(if v == ok {
                    "Ok".into()
                } else {
                    format!("Err(ProgramError::{})", perr(v - NICHE + 1))
                });
            }
        }
        if self.anchor && (100..=5000).contains(&v) {
            if let Some(n) = anchor_error_name(v) {
                return Some(format!("anchor::{n}"));
            }
        }
        if let Some(errs) = &self.idl_errors {
            if (6000..0x10000).contains(&v) {
                let k = crate::util::K::of(v as f64).0;
                if let Some(n) = errs.get(&k) {
                    return Some(format!(
                        "error::{}",
                        n.clone().unwrap_or_else(|| "undefined".into())
                    ));
                }
            }
        }
        if let Some(k) = self.key_addrs.get(&v) {
            return Some(format!("&{k}"));
        }
        if let Some(c) = self.key_chunks.get(&v) {
            return Some(c.clone());
        }
        if role == 2
            && v & 0xffff_ffff == 0
            && (v >> 32) > 0
            && (v >> 32) < PROGRAM_ERRORS.len() as u64
        {
            return Some(format!("ProgramError::{}", perr(v >> 32)));
        }
        None
    }

    /// anchorError: an anchor_lang ErrorCode name, or a custom error named by the IDL
    pub fn anchor_error(&self, v: u64) -> Option<String> {
        if !self.anchor {
            return None;
        }
        if (100..=5000).contains(&v) {
            if let Some(n) = anchor_error_name(v) {
                return Some(n.into());
            }
        }
        if let Some(errs) = &self.idl_errors {
            if (6000..0x10000).contains(&v) {
                return errs.get(&crate::util::K::of(v as f64).0).cloned().flatten();
            }
        }
        None
    }

    /// image.region(addr, len) (addresses past 2^64 have none): (region index, offset)
    pub fn region(&self, addr: u128, len: u128) -> Option<(usize, usize)> {
        let end = addr + len;
        for (i, (vaddr, b, _)) in self.regions.iter().enumerate() {
            if addr < *vaddr as u128 {
                return None;
            }
            if end <= *vaddr as u128 + b.len() as u128 {
                return Some((i, (addr - *vaddr as u128) as usize));
            }
        }
        None
    }
    pub fn region_exec(&self, addr: u128, len: u128) -> Option<bool> {
        self.region(addr, len).map(|(i, _)| self.regions[i].2)
    }
    pub fn bytes_at(&self, addr: u128, len: usize) -> Option<&[u8]> {
        let (i, o) = self.region(addr, len as u128)?;
        Some(&self.regions[i].1[o..o + len])
    }
    /// image.read(addr, size) (little-endian)
    pub fn read(&self, addr: u128, size: usize) -> Option<u64> {
        let b = self.bytes_at(addr, size)?;
        Some(b.iter().rev().fold(0u64, |v, &x| (v << 8) | x as u64))
    }
    /// read-only program memory (`image.region(a, n)?.exec === false ? image.read(a, n) : undefined`)
    pub fn read_ro(&self, addr: u128, size: usize) -> Option<u64> {
        if self.region_exec(addr, size as u128) == Some(false) {
            self.read(addr, size)
        } else {
            None
        }
    }

    /// keyAt: base58 of 32 non-text bytes in rodata at ptr
    pub fn key_at(&self, ptr: u64) -> Option<String> {
        let ex = self.region_exec(ptr as u128, 32)?;
        if ex || self.str_at(ptr, 32, false).is_some() {
            return None;
        }
        let b = self.bytes_at(ptr as u128, 32)?;
        if b.iter().any(|&x| x != 0) {
            Some(b58(b))
        } else {
            None
        }
    }

    /// strAt(ptr, len, isPtr)
    pub fn str_at(&self, ptr: u64, len: u64, is_ptr: bool) -> Option<String> {
        if !(1..=512).contains(&len) || (ptr < 0x100 && !is_ptr) {
            return None;
        }
        let b = self.bytes_at(ptr as u128, len as usize)?;
        let b = b.strip_prefix(&[0xef, 0xbb, 0xbf]).unwrap_or(b);
        let s = String::from_utf8_lossy(b).into_owned();
        let mut printable = 0usize;
        let mut units = 0usize;
        for ch in s.chars() {
            units += ch.len_utf16();
            if ch >= ' ' && ch != '\u{fffd}' {
                printable += 1;
            }
        }
        if printable as f64 >= units as f64 * 0.9 {
            Some(s)
        } else {
            None
        }
    }

    /// strLit: a string literal that denotes exactly (ptr, len)
    pub fn str_lit(&self, ptr: u64, len: u64, is_ptr: bool) -> Option<String> {
        let s = self.str_at(ptr, len, is_ptr)?;
        if s.contains('\u{fffd}') {
            return None;
        }
        let b = self.bytes_at(ptr as u128, len as usize)?;
        if s.as_bytes() != b {
            return None;
        }
        if self.string_addr(&s) == Some(ptr) {
            Some(s)
        } else {
            None
        }
    }

    /// stringAddr: the address of the first occurrence of the UTF-8 bytes in program memory.
    pub fn string_addr(&self, s: &str) -> Option<u64> {
        if let Some(r) = self.str_cache.borrow().get(s) {
            return *r;
        }
        let needle = s.as_bytes();
        let mut at = None;
        for (vaddr, b, _) in &self.regions {
            if let Some(i) = find(b, needle) {
                at = Some(vaddr + i as u64);
                break;
            }
        }
        self.str_cache.borrow_mut().insert(s.to_string(), at);
        at
    }

    pub fn func_comment(&self, pc: i64) -> Option<String> {
        if let Some(ix) = self.ix_names.get(&pc) {
            return Some(if self.anchor {
                format!(
                    "instruction handler: {ix} (discriminator sha256(\"global:{ix}\")[..8] = 0x{:x})",
                    sha8(format!("global:{ix}").as_bytes())
                )
            } else {
                format!("instruction handler: {ix}")
            });
        }
        self.processors.get(&pc).map(|pr| {
            format!(
                "instruction processor (handles inline, see its \"Instruction: X\" logs): {}",
                pr.join(", ")
            )
        })
    }
}

/// Buffer.indexOf of a needle (the empty needle is found at 0).
pub fn find(hay: &[u8], needle: &[u8]) -> Option<usize> {
    memchr::memmem::find(hay, needle)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn words_and_parts() {
        let mut w = sbpf_ir::fx::IndexSet::default();
        words_in(b"xx ab abc 9Hello_World1 ", &mut w);
        assert_eq!(
            w.iter().cloned().collect::<Vec<_>>(),
            vec!["abc", "Hello_World1"]
        );
        assert_eq!(camel_parts("SwapBaseIn"), vec!["SwapBaseIn"]);
        assert_eq!(camel_parts("ABcdEf_GhI"), vec!["BcdEf", "Gh"]);
    }
    #[test]
    fn selectors_load() {
        let db = sel_db();
        assert!(!db.verbs.is_empty());
    }
    #[test]
    fn selector_lookups() {
        // (node src/selector.ts <hex>)
        let l = |h: &str| selector_lookup(h);
        assert_eq!(l("0xf8c69e91e17587c8").as_deref(), Some("i:swap"));
        assert_eq!(l("afaf6d1f0d989bed").as_deref(), Some("i:initialize"));
        assert_eq!(l("4834b68f43599db5").as_deref(), Some("i:add_liquidity"));
        assert_eq!(
            l("0x1c8cee63e7a21595").as_deref(),
            Some("i:add_liquidity_by_weight")
        );
        assert_eq!(l("0x0000000000000001"), None);
        assert_eq!(l("e445a52e51cb9a1d"), None);
    }
}
