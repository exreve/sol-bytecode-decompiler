//! Program fetchers (a JSON-RPC endpoint is always passed; there is no built-in one):
//!   sbpf-fetch samples --rpc <url> [name=ProgramId ...]   samples/<name>.so (no names: the default set)
//!   sbpf-fetch corpus --rpc <url> [target=300] [outDir=corpus]
//!       a corpus of deployed programs (+ their on-chain Anchor IDLs), discovered from the instructions of recent
//!       blocks; programs already in outDir count towards the target
//!   sbpf-fetch compat [filter]   the on-chain members of the compatibility set into compat/bin (their own clusters)
//! Run from the repository root.

use sbpf_cli::rpc::{anchor_idl_address, base64_decode, fetch_program_account, post};
use sbpf_read::util::b58;
use serde_json::{json, Value};
use std::collections::HashSet;
use std::time::Duration;

const SAMPLES: &[(&str, &str)] = &[
    ("memo", "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    ("ata", "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
    ("token", "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    ("token22", "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
    ("stake_pool", "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy"),
    ("jup", "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"),
    ("whirlpool", "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"),
];

const MAINNET: &str = "https://api.mainnet-beta.solana.com";
const ECLIPSE: &str = "https://mainnetbeta-rpc.eclipse.xyz";
const SONIC: &str = "https://api.mainnet-alpha.sonic.game";
/// [output name, address, rpc] (compat/README.md for provenance)
const COMPAT: &[(&str, &str, &str)] = &[
    (
        "bpf1_tiny_BYVBQ71C",
        "BYVBQ71CYArTNbEpDnsPCjcoWkJL9181xvj52kfyFFHg",
        MAINNET,
    ),
    (
        "bpf1_small_8pXDrcpH",
        "8pXDrcpHJuYk4niJMRTiYv5dVbCZN15xTzFcAnqHTvsx",
        MAINNET,
    ),
    (
        "bpf1_break_BrEAK7zG",
        "BrEAK7zGZ6dM71zUDACDqJnekihmwF15noTddWTsknjC",
        MAINNET,
    ),
    (
        "bpf1_tokenv1_TokenSVp5",
        "TokenSVp5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o",
        MAINNET,
    ),
    (
        "bpf1_2voXLbiG",
        "2voXLbiGTiuioc4DtEtWRkz3h4BJ42aBhbqhaNcx8tpD",
        MAINNET,
    ),
    (
        "svm_eclipse_tiny_2r7UuKRa",
        "2r7UuKRaoh7Y8qgmrn73DbRcYuauqBn7tpBJpfodam92",
        ECLIPSE,
    ),
    (
        "svm_sonic_2sCw3Foz",
        "2sCw3FozxoNinZV923Q6XNvaMjRsmPSFAKnNYYnWsqD3",
        SONIC,
    ),
];

/// native / builtin program ids (not programs to decompile)
const NATIVE: &[&str] = &[
    "11111111111111111111111111111111",
    "ComputeBudget111111111111111111111111111111",
    "Vote111111111111111111111111111111111111111",
    "Stake11111111111111111111111111111111111111",
    "AddressLookupTab1e1111111111111111111111111",
    "BPFLoader",
    "Ed25519SigVerify",
    "KeccakSecp256k",
    "Config1111",
    "Sysvar",
    "NativeLoader",
    "Secp256r1",
];

fn take_rpc(args: &mut Vec<String>) -> String {
    match args.iter().position(|a| a == "--rpc") {
        Some(i) if i + 1 < args.len() => {
            let r = args.remove(i + 1);
            args.remove(i);
            r
        }
        _ => {
            eprintln!("pass --rpc <url>");
            std::process::exit(1);
        }
    }
}

/// a JSON-RPC call with retries (HTTP 429: back off); None for skipped / unavailable slots
fn rpc(url: &str, method: &str, params: Value) -> Result<Option<Value>, String> {
    let tries = 6;
    for i in 0..tries {
        let r = post(url, method, params.clone()).and_then(|(status, text)| {
            if status == 429 {
                return Ok(None);
            }
            let j: Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
            if let Some(e) = j.get("error").filter(|e| !e.is_null()) {
                let code = e.get("code").and_then(Value::as_i64);
                if code == Some(-32007) || code == Some(-32009) {
                    return Ok(Some(Value::Null));
                }
                return Err(e.to_string());
            }
            Ok(Some(j.get("result").cloned().unwrap_or(Value::Null)))
        });
        match r {
            Ok(None) => std::thread::sleep(Duration::from_millis(2000 * (i + 1))),
            Ok(Some(v)) => return Ok(if v.is_null() { None } else { Some(v) }),
            Err(e) if i == tries - 1 => return Err(e),
            Err(_) => std::thread::sleep(Duration::from_millis(1000 * (i + 1))),
        }
    }
    Err(format!("{method}: rate limited"))
}

fn account_data(v: &Value) -> Vec<u8> {
    base64_decode(
        v.get("data")
            .and_then(|d| d.get(0))
            .and_then(Value::as_str)
            .unwrap_or(""),
    )
}

fn samples(mut args: Vec<String>) {
    let url = take_rpc(&mut args);
    let list: Vec<(String, String)> = if args.is_empty() {
        SAMPLES
            .iter()
            .map(|(a, b)| (a.to_string(), b.to_string()))
            .collect()
    } else {
        args.iter()
            .map(|a| {
                a.split_once('=')
                    .map_or((a.clone(), String::new()), |(n, i)| (n.into(), i.into()))
            })
            .collect()
    };
    std::fs::create_dir_all("samples").expect("samples/");
    for (name, id) in list {
        match fetch_program_account(&url, &id) {
            Ok((b, _)) => {
                std::fs::write(format!("samples/{name}.so"), &b).expect("write");
                println!("{name} {}", b.len());
            }
            Err(e) => {
                eprintln!("{name}: {e}");
                std::process::exit(1);
            }
        }
    }
}

fn corpus(mut args: Vec<String>) {
    let url = take_rpc(&mut args);
    let target: usize = args.first().and_then(|s| s.parse().ok()).unwrap_or(300);
    let out = args.get(1).cloned().unwrap_or_else(|| "corpus".into());
    std::fs::create_dir_all(format!("{out}/idl")).expect("outDir");
    let have: Vec<String> = sbpf_data::so_files(&out)
        .iter()
        .map(|f| f[..f.len() - 3].to_string())
        .collect();
    let mut seen: HashSet<String> = have.iter().cloned().collect();
    let mut queue: Vec<String> = vec![];
    let fail = |e: String| -> ! {
        eprintln!("{e}");
        std::process::exit(1)
    };
    let mut slot = rpc(&url, "getSlot", json!([]))
        .unwrap_or_else(|e| fail(e))
        .and_then(|v| v.as_i64())
        .unwrap_or(0)
        - 200;
    let mut blocks = 0;
    while seen.len() < target * 3 && blocks < 400 {
        let b = rpc(
            &url,
            "getBlock",
            json!([slot, { "encoding": "json", "maxSupportedTransactionVersion": 1, "transactionDetails": "full", "rewards": false }]),
        )
        .unwrap_or_else(|e| fail(e));
        slot -= 37;
        let Some(b) = b else { continue };
        blocks += 1;
        for tx in b
            .get("transactions")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
        {
            let m = &tx["transaction"]["message"];
            let strs = |v: &Value| -> Vec<String> {
                v.as_array().map_or(vec![], |a| {
                    a.iter()
                        .filter_map(|x| x.as_str().map(String::from))
                        .collect()
                })
            };
            let mut keys = strs(&m["accountKeys"]);
            keys.extend(strs(&tx["meta"]["loadedAddresses"]["writable"]));
            keys.extend(strs(&tx["meta"]["loadedAddresses"]["readonly"]));
            let mut ixs: Vec<&Value> = m["instructions"]
                .as_array()
                .map_or(vec![], |a| a.iter().collect());
            for inner in tx["meta"]["innerInstructions"]
                .as_array()
                .into_iter()
                .flatten()
            {
                ixs.extend(inner["instructions"].as_array().into_iter().flatten());
            }
            for ix in ixs {
                let Some(p) = ix["programIdIndex"]
                    .as_u64()
                    .and_then(|i| keys.get(i as usize))
                else {
                    continue;
                };
                if !seen.contains(p) && !NATIVE.iter().any(|n| p.starts_with(n)) {
                    seen.insert(p.clone());
                    queue.push(p.clone());
                }
            }
        }
        if blocks % 10 == 0 {
            println!("blocks {blocks}, programs {}", seen.len());
        }
        if queue.len() >= target {
            break;
        }
    }
    let mut n = have.len();
    for pid in queue {
        if n >= target {
            break;
        }
        let r = (|| -> Result<Option<String>, String> {
            let Some(acc) = rpc(
                &url,
                "getAccountInfo",
                json!([pid, { "encoding": "base64" }]),
            )?
            else {
                return Ok(None);
            };
            let v = &acc["value"];
            if v["executable"] != json!(true) {
                return Ok(None);
            }
            let owner = v["owner"].as_str().unwrap_or("");
            let mut data = account_data(v);
            if owner.starts_with("BPFLoaderUpgradeab") {
                if data.len() < 36 {
                    return Ok(None);
                }
                let pd = rpc(
                    &url,
                    "getAccountInfo",
                    json!([b58(&data[4..36]), { "encoding": "base64" }]),
                )?;
                let Some(pd) = pd.filter(|p| !p["value"].is_null()) else {
                    return Ok(None);
                };
                data = account_data(&pd["value"]).get(45..).unwrap_or(&[]).to_vec();
            } else if owner.starts_with("LoaderV4") {
                data = data.get(48..).unwrap_or(&[]).to_vec();
            }
            if data.len() < 2 || data[0] != 0x7f || data[1] != 0x45 {
                return Ok(None);
            }
            std::fs::write(format!("{out}/{pid}.so"), &data).map_err(|e| e.to_string())?;
            n += 1;
            // anchor IDL
            let idl = rpc(
                &url,
                "getAccountInfo",
                json!([anchor_idl_address(&pid)?, { "encoding": "base64" }]),
            )?;
            let has_idl = idl.as_ref().is_some_and(|i| !i["value"].is_null());
            if has_idl {
                let raw = account_data(&idl.unwrap()["value"]);
                if raw.len() >= 44 {
                    let len = u32::from_le_bytes(raw[40..44].try_into().unwrap()) as usize;
                    let end = (44 + len).min(raw.len());
                    if let Ok(text) = miniz_oxide_inflate(&raw[44..end]) {
                        std::fs::write(format!("{out}/idl/{pid}.json"), text)
                            .map_err(|e| e.to_string())?;
                    }
                }
            }
            Ok(Some(format!(
                "{n} {pid} {}{}",
                data.len(),
                if has_idl { " +idl" } else { "" }
            )))
        })();
        match r {
            Ok(Some(line)) => println!("{line}"),
            Ok(None) => {}
            Err(e) => println!("skip {pid} {}", e.chars().take(100).collect::<String>()),
        }
    }
}

fn miniz_oxide_inflate(z: &[u8]) -> Result<Vec<u8>, String> {
    miniz_oxide::inflate::decompress_to_vec_zlib(z).map_err(|e| format!("{e:?}"))
}

fn compat(args: Vec<String>) {
    let filter = args.first();
    for (name, addr, rpc_url) in COMPAT {
        if filter.is_some_and(|f| !name.contains(f.as_str())) {
            continue;
        }
        match fetch_program_account(rpc_url, addr) {
            Ok((elf, _)) => {
                std::fs::write(format!("compat/bin/{name}.so"), &elf).expect("write");
                println!("fetched {name} {}", elf.len());
            }
            Err(e) => println!("FAILED {name} {}", e.chars().take(200).collect::<String>()),
        }
    }
}

fn main() {
    let mut args: Vec<String> = std::env::args().skip(1).collect();
    let cmd = if args.is_empty() {
        String::new()
    } else {
        args.remove(0)
    };
    match cmd.as_str() {
        "samples" => samples(args),
        "corpus" => corpus(args),
        "compat" => compat(args),
        _ => {
            eprintln!("usage: sbpf-fetch samples --rpc <url> [name=ProgramId ...] | corpus --rpc <url> [target=300] [outDir=corpus] | compat [filter]");
            std::process::exit(1);
        }
    }
}
