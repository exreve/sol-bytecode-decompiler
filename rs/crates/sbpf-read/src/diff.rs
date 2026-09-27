//! `src/diff.ts`: program diff from bytecode alone.

/// The diff report of two programs (lines joined, trailing newline).
pub fn diff_report(_a: &[u8], _b: &[u8], _all: bool, _labels: [&str; 2]) -> Result<String, String> {
    Err("unsupported: diff".into())
}
