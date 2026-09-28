//! Stage 4b: printing. The TypeScript printer ([`print`]), what the plain (raw) output needs of the
//! decompiler (function naming, variable names, declarations, the per-function text) and the single
//! file rendering of that output ([`raw`]).

pub mod consts;
pub mod names;
pub mod print;
pub mod raw;

pub use raw::{decompile_raw, render_single, Raw, RawFunc};
