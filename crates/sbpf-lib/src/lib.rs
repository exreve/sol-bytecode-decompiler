//! Stage 7: function fingerprints and signatures ([`fingerprint`]), library recognition
//! ([`library`]), compiler-builtin names by behavior ([`builtins`]).

pub mod builtins;
pub mod fingerprint;
pub mod library;
pub mod sha1;

/// String order by UTF-16 code units (the output's sort order for names).
pub fn js_str_cmp(a: &str, b: &str) -> std::cmp::Ordering {
    a.encode_utf16().cmp(b.encode_utf16())
}
