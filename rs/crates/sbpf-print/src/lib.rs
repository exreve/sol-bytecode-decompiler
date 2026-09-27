//! Stage 4b: printing. Ports `src/print.ts` (the TypeScript printer), the parts of
//! `src/decompile.ts` the plain (raw) output needs (function naming, variable names, declarations,
//! the per-function text) and `src/layout.ts` renderSingle for that output.

pub mod consts;
pub mod names;
pub mod print;
pub mod raw;

pub use raw::{decompile_raw, render_single, Raw, RawFunc};
