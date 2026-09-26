#!/bin/sh
# Build compat/bin/rust_<crate>_<v2|v3>.so from this workspace (copies of bench/programs n_vault: solana-program 2.2.1,
# p_counter: pinocchio 0.8) for the sbpfv2 / sbpfv3 targets of platform-tools v1.57 (cargo build --target
# sbpfvN-solana-solana is what cargo build-sbf --arch vN runs), in the sbf-builder container like bench/build.sh.
# v1.57, not v1.48: v1.48's sbpfv3 target still emits v2 opcodes (PQR, moved memory classes, hor64) under e_flags 3,
# which the final v3 spec (and src/emu.ts) rejects.
# usage: compat/src/rust/build.sh [crate ...]
set -e
D=$(cd "$(dirname "$0")" && pwd)
OUT=$(cd "$D/../../bin" && pwd)
T=${SBF_TOOLS:-$HOME/.cache/sbf-tools/v1.57}
C=$HOME/.cache/sbf-cargo-v1.57
mkdir -p "$C"
run() {
	docker run --rm -u "$(id -u):$(id -g)" -v "$T:/tools:ro" -v "$C:/cargo" -v "$D:/w" -v "$OUT:/out" -w /w \
		-e CARGO_HOME=/cargo -e CARGO_TARGET_DIR=/cargo/target -e HOME=/tmp -e PATH=/tools/llvm/bin:/tools/rust/bin:/usr/bin:/bin \
		-e CC=clang -e AR=llvm-ar -e RUSTC=/tools/rust/bin/rustc sbf-builder sh -c "$1"
}
[ -f "$D/Cargo.lock" ] || run "cargo generate-lockfile"
run "cargo fetch"
crates=${*:-n_vault p_counter}
for v in v2 v3; do
	for p in $crates; do
		so=/cargo/target/sbpf$v-solana-solana/release/$p.so
		run "rm -f $so; cargo build --offline --release --target sbpf$v-solana-solana -p $p 2>&1 | grep -E '^error' -A7 | head -30; test -f $so && llvm-objcopy --strip-all $so /out/rust_${p}_$v.so" && echo "built rust_${p}_$v.so" || echo "FAILED rust_${p}_$v.so"
	done
done
