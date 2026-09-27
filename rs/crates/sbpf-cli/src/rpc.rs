//! `src/rpc.ts` (minimal Solana JSON-RPC client for program binaries) and `idl.ts fetchIdl` (the on-chain
//! Anchor IDL). There is no built-in endpoint: callers pass one. Error messages are the TS ones.

use sbpf_read::util::{b58, unb58};
use serde_json::{json, Value};

/// isAddress: `/^[1-9A-HJ-NP-Za-km-z]{32,44}$/`
pub fn is_address(s: &str) -> bool {
    (32..=44).contains(&s.len())
        && s.bytes().all(|c| {
            matches!(c, b'1'..=b'9' | b'A'..=b'H' | b'J'..=b'N' | b'P'..=b'Z' | b'a'..=b'k' | b'm'..=b'z')
        })
}

/// One HTTP POST of a JSON-RPC request (as `fetch` sends it): (status, body). A transport failure is
/// `fetch failed` (an unparsable URL: `Failed to parse URL from <url>`), as the TS error message.
fn post(rpc: &str, method: &str, params: Value) -> Result<(u16, String), String> {
    let body = json!({ "jsonrpc": "2.0", "id": 1, "method": method, "params": params }).to_string();
    if !(rpc.starts_with("http://") || rpc.starts_with("https://"))
        || rpc.parse::<ureq::http::Uri>().is_err()
    {
        return Err(format!("Failed to parse URL from {rpc}"));
    }
    let agent: ureq::Agent = ureq::Agent::config_builder()
        .http_status_as_error(false)
        .build()
        .into();
    let mut r = agent
        .post(rpc)
        .header("content-type", "application/json")
        .send(body)
        .map_err(|_| "fetch failed".to_string())?;
    let status = r.status().as_u16();
    let text = r
        .body_mut()
        .with_config()
        .limit(u64::MAX)
        .read_to_string()
        .map_err(|_| "fetch failed".to_string())?;
    Ok((status, text))
}

/// `call`: retries on HTTP 429 (1 s, 2 s, 3 s, 4 s), then `RPC <method>: HTTP <status>` / the RPC error.
fn call(rpc: &str, method: &str, params: Value) -> Result<Value, String> {
    let mut attempt = 0;
    loop {
        let (status, text) = post(rpc, method, params.clone())?;
        if status == 429 && attempt < 4 {
            std::thread::sleep(std::time::Duration::from_millis(1000 * (attempt + 1)));
            attempt += 1;
            continue;
        }
        if !(200..300).contains(&status) {
            return Err(format!("RPC {method}: HTTP {status}"));
        }
        let j: Value =
            serde_json::from_str(&text).map_err(|e| format!("invalid JSON response: {e}"))?;
        if let Some(e) = j.get("error") {
            if !e.is_null() {
                let msg = match e.get("message") {
                    Some(Value::String(s)) => s.clone(),
                    Some(m) if !m.is_null() => js_string(m),
                    _ => e.to_string(),
                };
                return Err(format!("RPC {method}: {msg}"));
            }
        }
        return Ok(j.get("result").cloned().unwrap_or(Value::Null));
    }
}

/// String(x) of a JSON value (numbers / booleans as JS prints them; objects as `[object Object]`).
fn js_string(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        Value::Object(_) => "[object Object]".into(),
        Value::Array(a) => a
            .iter()
            .map(|x| {
                if x.is_null() {
                    String::new()
                } else {
                    js_string(x)
                }
            })
            .collect::<Vec<_>>()
            .join(","),
        other => other.to_string(),
    }
}

/// Standard base64 (Buffer.from(s, 'base64'): stops at the first padding / invalid character).
pub fn base64_decode(s: &str) -> Vec<u8> {
    let mut out = Vec::with_capacity(s.len() / 4 * 3);
    let (mut acc, mut n) = (0u32, 0);
    for c in s.bytes() {
        let v = match c {
            b'A'..=b'Z' => c - b'A',
            b'a'..=b'z' => c - b'a' + 26,
            b'0'..=b'9' => c - b'0' + 52,
            b'+' | b'-' => 62,
            b'/' | b'_' => 63,
            b'=' => break,
            b' ' | b'\n' | b'\r' | b'\t' => continue,
            _ => break,
        } as u32;
        acc = (acc << 6) | v;
        n += 6;
        if n >= 8 {
            n -= 8;
            out.push((acc >> n) as u8);
            acc &= (1 << n) - 1;
        }
    }
    out
}

pub struct AccountData {
    pub owner: String,
    pub data: Vec<u8>,
}

/// getAccount: None when the account does not exist.
fn get_account(rpc: &str, address: &str) -> Result<Option<AccountData>, String> {
    let r = call(
        rpc,
        "getAccountInfo",
        json!([address, { "encoding": "base64" }]),
    )?;
    let v = match r.get("value") {
        Some(v) if !v.is_null() => v,
        _ => return Ok(None),
    };
    Ok(Some(account_of(v)))
}

fn account_of(v: &Value) -> AccountData {
    AccountData {
        owner: v
            .get("owner")
            .map(js_string)
            .unwrap_or_else(|| "undefined".into()),
        data: base64_decode(
            v.get("data")
                .and_then(|d| d.get(0))
                .and_then(|d| d.as_str())
                .unwrap_or(""),
        ),
    }
}

/// fetchProgramAccount: the ELF bytes of a deployed program, for every loader (BPFLoader1/2: the account data;
/// BPFLoaderUpgradeable: the programdata account after its 45-byte header; LoaderV4: after 48 bytes), and the
/// loader owning the program account.
pub fn fetch_program_account(rpc: &str, program_id: &str) -> Result<(Vec<u8>, String), String> {
    let acc =
        get_account(rpc, program_id)?.ok_or_else(|| format!("account {program_id} not found"))?;
    let mut data = acc.data;
    if acc.owner.starts_with("BPFLoaderUpgradeab") {
        if data.len() < 36 {
            return Err(format!(
                "{program_id} is not an upgradeable program account"
            ));
        }
        let pd = get_account(rpc, &b58(&data[4..36]))?
            .ok_or_else(|| format!("programdata account of {program_id} not found"))?;
        data = pd.data.get(45..).map(|d| d.to_vec()).unwrap_or_default();
    } else if acc.owner.starts_with("LoaderV4") {
        data = data.get(48..).map(|d| d.to_vec()).unwrap_or_default();
    } else if !acc.owner.starts_with("BPFLoader") {
        return Err(format!(
            "{program_id} is owned by {}, not a BPF loader (not a program?)",
            acc.owner
        ));
    }
    if !data.starts_with(b"\x7fELF") {
        return Err(format!(
            "{program_id}: account data is not an ELF (closed program?)"
        ));
    }
    // programdata may be zero-padded up to its allocated size: harmless (the ELF uses offsets)
    Ok((data, acc.owner))
}

// ---- anchorIdlAddress: create_with_seed(PDA([], program), "anchor:idl", program) ----

type U = [u64; 4];
const P: U = [
    0xffff_ffff_ffff_ffed,
    u64::MAX,
    u64::MAX,
    0x7fff_ffff_ffff_ffff,
];

fn geq(a: &U, b: &U) -> bool {
    for i in (0..4).rev() {
        if a[i] != b[i] {
            return a[i] > b[i];
        }
    }
    true
}

fn sub_raw(a: &U, b: &U) -> U {
    let mut r = [0u64; 4];
    let mut borrow = 0u64;
    for i in 0..4 {
        let (d1, b1) = a[i].overflowing_sub(b[i]);
        let (d2, b2) = d1.overflowing_sub(borrow);
        r[i] = d2;
        borrow = (b1 | b2) as u64;
    }
    r
}

/// a value below 2^256 reduced mod p (fully)
fn norm(mut a: U) -> U {
    while geq(&a, &P) {
        a = sub_raw(&a, &P);
    }
    a
}

fn add_small(a: &mut [u64; 4], mut x: u128) -> u128 {
    for limb in a.iter_mut() {
        let s = *limb as u128 + x;
        *limb = s as u64;
        x = s >> 64;
        if x == 0 {
            break;
        }
    }
    x
}

fn mulp(a: &U, b: &U) -> U {
    let mut t = [0u64; 8];
    for i in 0..4 {
        let mut carry = 0u128;
        for j in 0..4 {
            let cur = t[i + j] as u128 + (a[i] as u128) * (b[j] as u128) + carry;
            t[i + j] = cur as u64;
            carry = cur >> 64;
        }
        t[i + 4] = carry as u64;
    }
    // 2^256 ≡ 38 (mod p)
    let mut r = [t[0], t[1], t[2], t[3]];
    let mut carry = 0u128;
    for i in 0..4 {
        let cur = r[i] as u128 + (t[i + 4] as u128) * 38 + carry;
        r[i] = cur as u64;
        carry = cur >> 64;
    }
    while carry > 0 {
        carry = add_small(&mut r, carry * 38);
    }
    norm(r)
}

fn subp(a: &U, b: &U) -> U {
    if geq(a, b) {
        sub_raw(a, b)
    } else {
        sub_raw(&P, &sub_raw(b, a))
    }
}

fn pw(b: &U, e: &U) -> U {
    let mut r: U = [1, 0, 0, 0];
    let mut b = norm(*b);
    for i in 0..256 {
        if (e[i / 64] >> (i % 64)) & 1 == 1 {
            r = mulp(&r, &b);
        }
        b = mulp(&b, &b);
    }
    r
}

fn small(x: u64) -> U {
    [x, 0, 0, 0]
}

fn on_curve(k: &[u8; 32]) -> bool {
    let mut y = [0u64; 4];
    for (i, c) in k.chunks(8).enumerate() {
        y[i] = u64::from_le_bytes(c.try_into().unwrap());
    }
    y[3] &= 0x7fff_ffff_ffff_ffff;
    if geq(&y, &P) {
        return false;
    }
    let pm2 = sub_raw(&P, &small(2));
    let d = mulp(&subp(&[0; 4], &small(121665)), &pw(&small(121666), &pm2));
    let y2 = mulp(&y, &y);
    let one = small(1);
    let den = norm({
        let mut s = mulp(&d, &y2);
        let c = add_small(&mut s, 1);
        debug_assert_eq!(c, 0);
        s
    });
    let x2 = mulp(&subp(&y2, &one), &pw(&den, &pm2));
    if x2 == [0; 4] {
        return true;
    }
    let half = {
        let q = sub_raw(&P, &one);
        [
            q[0] >> 1 | q[1] << 63,
            q[1] >> 1 | q[2] << 63,
            q[2] >> 1 | q[3] << 63,
            q[3] >> 1,
        ]
    };
    pw(&x2, &half) == one
}

fn sha(parts: &[&[u8]]) -> [u8; 32] {
    sbpf_print::names::sha256(&parts.concat())
}

/// anchorIdlAddress (the address of the program's Anchor IDL account)
pub fn anchor_idl_address(program_id: &str) -> Result<String, String> {
    let pid = unb58(program_id);
    for bump in (0..=255u8).rev() {
        let base = sha(&[&[bump], &pid, b"ProgramDerivedAddress"]);
        if !on_curve(&base) {
            return Ok(b58(&sha(&[&base, b"anchor:idl", &pid])));
        }
    }
    Err("no pda".into())
}

/// fetchIdl: the program's on-chain Anchor IDL JSON (None when absent or unreadable). The IDL account is owned
/// by the program: [8 discriminator][32 authority][u32 len][zlib json].
pub fn fetch_idl(program_id: &str, rpc: &str) -> Option<Value> {
    let addr = anchor_idl_address(program_id).ok()?;
    let (_, text) = post(
        rpc,
        "getAccountInfo",
        json!([addr, { "encoding": "base64" }]),
    )
    .ok()?;
    let j: Value = serde_json::from_str(&text).ok()?;
    let v = j.get("result")?.get("value")?;
    if v.is_null() || v.get("owner").and_then(|o| o.as_str()) != Some(program_id) {
        return None;
    }
    let raw = account_of(v).data;
    if raw.len() < 44 {
        return None;
    }
    let len = u32::from_le_bytes(raw[40..44].try_into().unwrap()) as usize;
    if 44 + len > raw.len() {
        return None;
    }
    let text = miniz_oxide::inflate::decompress_to_vec_zlib(&raw[44..44 + len]).ok()?;
    serde_json::from_str(&String::from_utf8_lossy(&text)).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn base64() {
        assert_eq!(base64_decode("aGVsbG8="), b"hello");
        assert_eq!(base64_decode("aGVsbG8h"), b"hello!");
    }

    #[test]
    fn idl_address() {
        // the TS anchorIdlAddress
        for (p, a) in [
            (
                "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf",
                "6i4UjrDtkc7dqEmCyNDRfoxnAhDKSrY92u96Z74nRFdX",
            ),
            (
                "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
                "2KFqE4RWoPVbvodo8vbggCFeHPS8TDvgpwp79ALMrcyn",
            ),
            (
                "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                "C88XWfp26heEmDkmfSzeXP7Fd7GQJ2j9dDTUsyiZbUTa",
            ),
            (
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                "4nmzuuebvZ9EVghi2khvz9SyxUNvuXXdAzWtG5N7avYf",
            ),
            (
                "11111111111111111111111111111111",
                "J7NactFg7ikhyNGKsub9rrPE5WWMmndPuWmQtDXUbXi8",
            ),
        ] {
            assert_eq!(anchor_idl_address(p).unwrap(), a);
        }
    }

    #[test]
    fn field() {
        // (p - 1)^2 = 1
        let pm1 = sub_raw(&P, &small(1));
        assert_eq!(mulp(&pm1, &pm1), small(1));
        // Fermat: 3^(p-1) = 1
        assert_eq!(pw(&small(3), &pm1), small(1));
    }
}
