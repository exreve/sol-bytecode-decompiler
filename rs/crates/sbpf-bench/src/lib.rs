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
    let p = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../..");
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

/// `Number.prototype.toFixed(1)` for non-negative numbers (a tie rounds up, where Rust rounds to even).
pub fn fixed1(x: f64) -> String {
    let t = x * 10.0;
    if t.fract() == 0.5 {
        return format!("{:.1}", (t + 0.5) / 10.0);
    }
    format!("{x:.1}")
}

/// `Number.prototype.toFixed(0)` for non-negative numbers.
pub fn fixed0(x: f64) -> String {
    if x.fract() == 0.5 {
        return format!("{:.0}", x + 0.5);
    }
    format!("{x:.0}")
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
