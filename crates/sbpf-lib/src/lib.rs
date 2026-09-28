//! Stage 7: function fingerprints and signatures (`src/fingerprint.ts`), library recognition
//! (`src/library.ts`, `crateOf` of `src/demangle.ts`), compiler-builtin names by behavior
//! (`src/builtins.ts`).

pub mod builtins;
pub mod fingerprint;
pub mod library;
pub mod sha1;

/// JS `<` on strings: UTF-16 code unit order.
pub fn js_str_cmp(a: &str, b: &str) -> std::cmp::Ordering {
    a.encode_utf16().cmp(b.encode_utf16())
}
