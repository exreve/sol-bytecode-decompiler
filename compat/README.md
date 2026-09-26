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

All decompile without crashing (< 2 s each) and pass equivalence in both modes (`--strict`: no known issues).

Fixed since the first run (Phase A findings, now handled in src/):

- Solang symbol names (`counter::counter::function::count`) are sanitized into identifiers (`counter__counter__function__count`,
  the original in a `// symbol:` comment); the output parses and is equivalent.
- Solang dispatch: the handler of each 8-byte discriminator is found (first function called only on that
  discriminator's side) and named from the IDL (`solang_counter.so` + IDL: 7 instructions) or from names in
  the program's strings (stripped, no IDL: 5 of 7).
- BPFLoader1 input: the deprecated loader's unaligned layout (`UnalignedAccount`: key +3, lamports +0x23,
  data_len +0x2b, data +0x33) replaces the aligned one, detected by the program account's owner when fetched
  with `--rpc`, else by the entrypoint deserializer (data_len at record + 0x2b, rent_epoch at owner + 0x21):
  `bpf1_small`, `bpf1_break`, `bpf1_2voXLbiG`, `bpf1_tokenv1` (corpus of 400 mainnet programs: only Memo v1 matches besides).
- sBPF v3 rodata at address 0: syscall string arguments, PDA seeds and fmt pieces resolve (`sol_log("asm: counted\u0000", 0xd)`,
  seeds `["vault", …]`).
- v2 / v3 CPIs: invoke wrappers outside recognized library code (they pass their own account infos on to
  `sol_invoke_signed`) are decoded at their call sites: n_vault v2 / v3 `SYSTEM_PROGRAM.Transfer` / `CreateAccount`
  as on v0, no spurious "CPI not decoded" entry.
- Library fingerprints: v2 / v3 code is also hashed in its v0 encoding; n_vault library functions v2 18 → 28,
  v3 5 → 14 (v0: 95), p_counter v2 2 → 3, v3 0 → 1.
- C SDK / zig SDK accounts (analysis): the entrypoint's cursor-filled frame arrays are account models: C
  `SolAccountInfo` copies (c_vault v0 / v2 / v3: signer `account[1]` found, lamport / data writes attributed),
  zig record pointers (owner check and data writes attributed). The entrypoint's `input` is not typed `Input`
  when the variable is reassigned (the C deserializer's cursor: fields were misnamed).
- asm: no false-positive signer (the entrypoint's input is not taken as an `&[AccountInfo]` slice).
- A warning (stderr) when reachable instructions are invalid for the declared sBPF version.

## Known issues (for src/)

1. **BPFLoader1 Rust (`bpf1_tokenv1`)**: the layout is right, but "signers: none found": solana-program 2020 does not
   inline `next_account_info`; the accounts come back through an out parameter of the iterator, which the account
   model does not follow (not loader-specific).
2. **`bpf1_tiny_BYVBQ71C.so`** reads the input byte-wise at offsets matching neither layout; it is not detected as
   unaligned from the bytecode (only with `--rpc`, by the owner). Its input fields are no longer misnamed.
3. **sBPF v3 CPI with more than 5 arguments**: `invoke_signed(ix, infos, seeds)` passes its 6th argument through
   the stack differently from v0 (`st64(fp, …)`); the call-site decode shows `CreateAccount` without the owner and
   signer seeds ("PDA-signed" on v0 only). v2 likewise.
4. **Library recognition on v2 / v3** stays partial (n_vault 28 / 14 of 95): the rest differs by codegen (instruction
   selection, register allocation, frames), not encoding.
5. **Zig signer check**: `auth.isSigner()` is read (`l.is_signer`) but not reported: the handler is structured inside
   the deserialization loop and fails by `break`, which the check detection does not take as an error exit.
6. **Solang**: `@signer` checks are not recognized (Solang searches the account list); functions taking an `address`
   by value get 32 byte-sized parameters (`p5`..`p34`): that is Solang's ABI, not a decompiler error.
7. **C SDK on BPFLoader1 (`bpf1_small`)**: the one-account deserializer writes `SolAccountInfo` at fixed frame
   offsets (no cursor), not modeled.
8. **`asm_counter_v0`**: `sol_log(0x100000280, 0xd)` stays an address: the program logs 13 bytes of a 12-byte `.rodata`.
