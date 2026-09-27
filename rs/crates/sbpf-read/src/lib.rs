//! Stage 5 (+ 6): the readable output (`decompile(bytes, { full: true, idl })`, the CLI default without
//! library classification): typed views, accounts, Anchor names and layouts, CPI descriptions (with
//! concrete runs, `sbpf-exec`), frame objects and regions, outlined tails, comments, and the single file.

pub mod accounts;
pub mod analysis;
pub mod anchor;
pub mod anchorstate;
pub mod cpi;
pub mod cpiexec;
pub mod decompile;
pub mod diff;
pub mod fieldnames;
pub mod frameregions;
pub mod idl;
pub mod layout;
pub mod outline;
pub mod printfn;
pub mod sem;
pub mod state;
pub mod structs;
pub mod taint;
pub mod types;
pub mod util;
pub mod views;
