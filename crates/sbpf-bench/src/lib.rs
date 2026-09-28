//! Ground-truth benchmarks of the analysis layer and their shared pieces: the repository layout, one decompilation
//! as the CLI project output renders `security/analysis.json`, a worker pool, and the JS number / string formatting
//! the reports use.

pub mod eval;
pub mod gen;

use serde_json::Value;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;

/// The repository root (bench/, eval/, compat/, corpus/ live there).
pub fn repo_root() -> PathBuf {
    let p = Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
    p.canonicalize().unwrap_or(p)
}

/// `security/analysis.json` of one program as the CLI project output (`-o dir/`) writes it.
pub fn analysis_json(bytes: &[u8], idl: Option<&Value>) -> Result<String, String> {
    let info = idl.map(sbpf_read::idl::parse_idl);
    let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let r =
            sbpf_read::decompile::decompile_read_opts(bytes, info.as_ref(), 1, false, None, None)?;
        sbpf_read::layout::render_project(&r)
            .shift_remove("security/analysis.json")
            .ok_or_else(|| "no security/analysis.json".to_string())
    }));
    match r {
        Ok(r) => r,
        Err(e) => Err(e
            .downcast_ref::<String>()
            .cloned()
            .or_else(|| e.downcast_ref::<&str>().map(|s| s.to_string()))
            .unwrap_or_else(|| "panic".into())),
    }
}

/// Parses JSON text keeping object key order (`JSON.parse`).
pub fn parse(text: &str) -> Result<Value, String> {
    serde_json::from_str(text).map_err(|e| e.to_string())
}

pub fn read_json(p: &Path) -> Result<Value, String> {
    let t = std::fs::read_to_string(p).map_err(|e| format!("{}: {e}", p.display()))?;
    parse(&t).map_err(|e| format!("{}: {e}", p.display()))
}

/// Runs `f` over `jobs` on `n` threads with large stacks (the decompiler recurses deeply); results in job order.
pub fn par_map<J: Sync, R: Send>(jobs: &[J], n: usize, f: impl Fn(&J) -> R + Sync) -> Vec<R> {
    let next = AtomicUsize::new(0);
    let out: Mutex<Vec<Option<R>>> = Mutex::new((0..jobs.len()).map(|_| None).collect());
    std::thread::scope(|s| {
        for _ in 0..n.clamp(1, jobs.len().max(1)) {
            std::thread::Builder::new()
                .stack_size(1 << 30)
                .spawn_scoped(s, || loop {
                    let i = next.fetch_add(1, Ordering::Relaxed);
                    if i >= jobs.len() {
                        break;
                    }
                    let r = f(&jobs[i]);
                    out.lock().unwrap()[i] = Some(r);
                })
                .expect("spawn");
        }
    });
    out.into_inner()
        .unwrap()
        .into_iter()
        .map(|r| r.unwrap())
        .collect()
}

pub fn parallelism() -> usize {
    std::thread::available_parallelism().map_or(1, |n| n.get())
}

/// `Number.prototype.toFixed(d)` for finite numbers below 1e21: the exact decimal value rounded half away from
/// zero (Rust's formatting rounds a tie to even).
pub fn to_fixed(x: f64, d: usize) -> String {
    let neg = x < 0.0;
    // the exact expansion (an f64 has at most 1074 fractional digits)
    let s = format!("{:.1100}", x.abs());
    let (int, frac) = s.split_once('.').unwrap();
    let mut digits: Vec<u8> = int
        .bytes()
        .chain(frac.bytes().take(d))
        .map(|c| c - b'0')
        .collect();
    if frac.as_bytes()[d] >= b'5' {
        let mut i = digits.len();
        loop {
            if i == 0 {
                digits.insert(0, 1);
                break;
            }
            i -= 1;
            if digits[i] == 9 {
                digits[i] = 0;
            } else {
                digits[i] += 1;
                break;
            }
        }
    }
    let n = digits.len() - d;
    let body: String = digits.iter().map(|c| (c + b'0') as char).collect();
    let out = if d > 0 {
        format!("{}.{}", &body[..n], &body[n..])
    } else {
        body
    };
    let zero = digits.iter().all(|&c| c == 0);
    if neg && !zero {
        format!("-{out}")
    } else {
        out
    }
}

/// `x.toFixed(1)`
pub fn fixed1(x: f64) -> String {
    to_fixed(x, 1)
}

/// `x.toFixed(0)`
pub fn fixed0(x: f64) -> String {
    to_fixed(x, 0)
}

/// `JSON.stringify(x, null, unit)` (objects keep their key order)
pub fn pretty_indent(x: &Value, ind: &str, unit: &str, out: &mut String) {
    let inner = format!("{ind}{unit}");
    match x {
        Value::Array(a) if !a.is_empty() => {
            out.push_str("[\n");
            for (i, v) in a.iter().enumerate() {
                out.push_str(&inner);
                pretty_indent(v, &inner, unit, out);
                out.push_str(if i + 1 < a.len() { ",\n" } else { "\n" });
            }
            out.push_str(ind);
            out.push(']');
        }
        Value::Object(o) if !o.is_empty() => {
            out.push_str("{\n");
            for (i, (k, v)) in o.iter().enumerate() {
                out.push_str(&inner);
                out.push_str(&serde_json::to_string(k).unwrap());
                out.push_str(": ");
                pretty_indent(v, &inner, unit, out);
                out.push_str(if i + 1 < o.len() { ",\n" } else { "\n" });
            }
            out.push_str(ind);
            out.push('}');
        }
        v => out.push_str(&serde_json::to_string(v).unwrap()),
    }
}

pub fn pad_end(s: &str, n: usize) -> String {
    format!("{s:<n$}")
}

pub fn pad_start(s: &str, n: usize) -> String {
    format!("{s:>n$}")
}

/// JS truthiness of an optional JSON value.
pub fn truthy(v: Option<&Value>) -> bool {
    match v {
        None | Some(Value::Null) => false,
        Some(Value::Bool(b)) => *b,
        Some(Value::Number(n)) => n.as_f64().is_some_and(|x| x != 0.0 && !x.is_nan()),
        Some(Value::String(s)) => !s.is_empty(),
        _ => true,
    }
}

/// `x?.k` as a string (non-strings: none).
pub fn str_at<'a>(v: &'a Value, k: &str) -> Option<&'a str> {
    v.get(k).and_then(Value::as_str)
}

/// `x.k ?? []` as an array.
pub fn arr_at<'a>(v: &'a Value, k: &str) -> &'a [Value] {
    v.get(k)
        .and_then(Value::as_array)
        .map_or(&[], |a| a.as_slice())
}

/// `String(v)` for the values the reports hold (strings as-is).
pub fn js_string(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        Value::Null => "null".into(),
        Value::Number(n) => n
            .as_f64()
            .map_or_else(|| n.to_string(), sbpf_read::util::js_num),
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
        Value::Object(_) => "[object Object]".into(),
        Value::Bool(b) => b.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::to_fixed;

    #[test]
    fn js_to_fixed() {
        for (x, d, want) in [
            (0.25, 1, "0.3"),
            (0.35, 1, "0.3"),
            (1.005, 2, "1.00"),
            (0.0625, 3, "0.063"),
            (99.95, 1, "100.0"),
            (2.5, 0, "3"),
            (0.0, 1, "0.0"),
            (123.456, 2, "123.46"),
            (-1.5, 0, "-2"),
        ] {
            assert_eq!(to_fixed(x, d), want, "{x} {d}");
        }
    }
}
