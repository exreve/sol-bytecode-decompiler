# Compatibility set

Programs of kinds the mainnet corpus (mostly Rust: Anchor / native / pinocchio, sBPF v0) does not cover:
other languages, hand-written assembly, the deprecated loader, sBPF v2 / v3, other SVM chains.

`node compat/run.ts [filter] [--keep dir/] [--strict]` decompiles every `bin/*.so` in project mode and runs the
equivalence check (readable and `--raw`, 2 trials), one line per program (sBPF version, instructions, functions,
recognized instructions = `security/*.md` files, decompile time, equivalence), then a summary. It exits non-zero on a
crash or a failing function, except for the known issues listed in `KNOWN` in run.ts (`--strict` counts them).
A `<name>.json` next to a binary is passed as `--idl`. Runs in CI (~45 s).

## Programs

| binary | kind | source / provenance | toolchain |
|---|---|---|---|
| `c_vault_v0.so`, `c_vault_v2.so`, `c_vault_v3.so` | C, Solana C SDK | `src/c/vault.c` (3 instructions, system transfer CPI, PDA check, sha256, logs); SDK headers + `sbf.ld` vendored from agave `programs/sbf/c` (master, 2026-09) into `src/c/sdk/`; `src/c/build.sh` | platform-tools v1.57 clang 22, `-target sbf` (v0), `-mcpu=v2`, `-mcpu=v3 -DSOL_SBPFV3=1` |
| `zig_counter.so` | Zig | `src/zig/` (3 instructions, signer / owner checks, system transfer CPI); `src/zig/build.sh` | solana-zig (joncinque/solana-zig-bootstrap `solana-v1.53.0`, zig 0.16.0) + solana-program-sdk-zig v0.18.0; `zig build` reports LLVM frame-size errors in unused compiler_rt big-int division but links the program |
| `asm_counter_v0.so`, `asm_counter_v3.so` | hand-written sBPF assembly | `src/asm/counter.s` (signer / writable checks, loop, local call, syscalls); `src/asm/build.sh` | `sbpf` 0.3.1 (blueshift-gg, `cargo install sbpf`), `--arch v0` / `v3` |
| `solang_counter.so` (+ `.json` IDL), `solang_counter_stripped.so` | Solidity (Solang) | `src/solang/counter.sol` (storage: u64, address, mapping; `@signer`; event; system-program CPI via `address.call{accounts:}`); `src/solang/build.sh` | Solang v0.3.5 release binary, `--target solana -O default`; the stripped copy by llvm-objcopy `--strip-all` |
| `rust_n_vault_v2.so`, `rust_n_vault_v3.so`, `rust_p_counter_v2.so`, `rust_p_counter_v3.so` | native Rust (solana-program 2.2.1 / pinocchio 0.8), sBPF v2 and v3 | `src/rust/` (copies of `bench/programs/n_vault`, `p_counter`); `src/rust/build.sh` | platform-tools v1.57, `cargo build --release --target sbpfv2-solana-solana` / `sbpfv3-solana-solana` (what `cargo build-sbf --arch v2/v3` runs), stripped |
| `bpf1_tiny_BYVBQ71C.so` | deprecated `BPFLoader1111…` | mainnet `BYVBQ71CYArTNbEpDnsPCjcoWkJL9181xvj52kfyFFHg` (2.3 KB) | `compat/fetch.ts` |
| `bpf1_small_8pXDrcpH.so` | " | mainnet `8pXDrcpHJuYk4niJMRTiYv5dVbCZN15xTzFcAnqHTvsx` (checks a program id, logs) | " |
| `bpf1_break_BrEAK7zG.so` | " | mainnet `BrEAK7zGZ6dM71zUDACDqJnekihmwF15noTddWTsknjC` (Solana "Break" game) | " |
| `bpf1_tokenv1_TokenSVp5.so` | " | mainnet `TokenSVp5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o` (SPL Token v1, 2020) | " |
| `bpf1_2voXLbiG.so` | " | mainnet `2voXLbiGTiuioc4DtEtWRkz3h4BJ42aBhbqhaNcx8tpD` (108 KB, unidentified) | " |
| `svm_eclipse_tiny_2r7UuKRa.so` | other SVM chain | Eclipse mainnet `2r7UuKRaoh7Y8qgmrn73DbRcYuauqBn7tpBJpfodam92` (336-byte, 1-instruction ELF; most of Eclipse's ~65k upgradeable programs are such stubs) | " |
| `svm_sonic_2sCw3Foz.so` | other SVM chain | Sonic mainnet `2sCw3FozxoNinZV923Q6XNvaMjRsmPSFAKnNYYnWsqD3` (194 KB, native Rust) | " |

BPFLoader1 programs: `getProgramAccounts` on `BPFLoader1111111111111111111111111111111111` (mainnet, 2026-09-26:
202 accounts, 136 executable; `Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo` is already in the corpus).
Rebuild the local ones with `sh compat/src/<kind>/build.sh` (needs the tools above and the `sbf-builder` container),
re-fetch the on-chain ones with `node compat/fetch.ts`.

Not included: sBPF v3 from platform-tools v1.48: its `sbpfv3` target still emits v2 opcodes (PQR, moved memory
classes, `hor64`) under `e_flags` 3; the final v3 spec (and `src/emu.ts`) rejects them, and equivalence fails on
60 / 154 functions. The v3 binaries here are built with v1.57. `c_vault_v3.so` (C SDK `sbf.ld` link) was not
validated against the agave loader.

## Results (2026-09-26)

All decompile without crashing (< 2 s each) and pass equivalence in both modes, except `solang_counter.so`.

## Known issues (for src/)

1. **Solang, unstripped (`solang_counter.so`)**: ELF symbol names such as `counter::counter::function::count` and
   `counter::counter::constructor::872ccdc6190148bc` become function names verbatim, so the output does not parse
   (equivalence: 1 error, 0 functions checked). Symbol names need sanitizing into identifiers. Some Solang functions
   also get 10 parameters (`p5`..`p10`).
2. **Solang dispatch**: only `entrypoint` is found as an instruction, with or without the Solang-emitted IDL
   (`--idl solang_counter.json`); `solang_dispatch` (8-byte selector) is not recognized, so storage writes, signer
   checks and the CPI are not attributed to instructions.
3. **BPFLoader1 input layout**: the deprecated loader serializes the input unaligned (no padding, no 10 KiB realloc
   area, no alignment). The decompiler applies the aligned layout (`input.acc0…`, `Input` typing), so the account
   fields are misnamed and no signers / writes / CPIs are recognized (token v1: 9 named instructions, all
   "signers: none found"). Needs loader detection (the RPC owner, or a heuristic on the entrypoint parser) and an
   unaligned `Input` model.
4. **sBPF v3 read-only data**: strings are not resolved (rodata sits at vaddr 0 in v3): `sol_log(0, 0xd)` for
   `"asm: counted"`, PDA seeds shown as `0x70[..5]` instead of `"vault"` (`asm_counter_v3`, `rust_n_vault_v3`).
5. **sBPF v2 / v3 CPI classification**: n_vault's system `Transfer` / `CreateAccount` CPIs are recognized on v0
   (`bench/bin/n_vault.so`) but not on v2 / v3 ("program *(b + 0x30) id not a constant"), and a spurious `entrypoint`
   instruction is listed on v3.
6. **Library recognition on v2 / v3**: n_vault has 95 library functions on v0 but 18 on v2 and 5 on v3 (p_counter:
   10 / 2 / 0); the fingerprints only cover v0 codegen.
7. **C SDK and Zig account parsing**: the programs copy the input into `SolAccountInfo` / `Account` arrays on the
   stack (`sol_deserialize`, zig `Context.load`); signer checks and data writes made through those copies are not
   recognized (`c_vault`: "moves value … but no signer check was found" although `is_signer` is checked; zig: no
   signers found). The C deserialization loop reuses the `input` name as a cursor (`input = l`, `input.acc0`).
8. **Signer false positive in asm**: `asm_counter` reports `account[1]` as a signer (likely acc0's `is_writable`
   read at input + 10) with a single account.
9. **Version / opcode mismatch goes unnoticed**: a v1.48 "v3" binary decompiles silently although its opcodes are
   invalid for v3; a warning would help.
