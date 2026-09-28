#!/bin/sh
# Rebuild bench/bin/*.so from bench/programs (not needed to run the bench: the binaries are committed).
# Uses Solana platform-tools v1.48 (~/.cache/sbf-tools/v1.48, see sbpf-refbuild) in the sbf-builder container.
# usage: [WS=workspace-dir] bench/build.sh [crate-filter]   (WS: bench/programs by default; bench/gen/programs, bench/gen/programs29)
set -e
B=$(cd "$(dirname "$0")" && pwd)
T=${SBF_TOOLS:-$HOME/.cache/sbf-tools/v1.48}
C=$HOME/.cache/sbf-cargo-v1.48
WS=$(cd "${WS:-$B/programs}" && pwd)
mkdir -p "$C" "$B/bin"
run() {
	docker run --rm -u "$(id -u):$(id -g)" -v "$T:/tools:ro" -v "$C:/cargo" -v "$WS:/w" -v "$B/bin:/out" -w /w \
		-e CARGO_HOME=/cargo -e CARGO_TARGET_DIR=/cargo/target-bench -e HOME=/tmp -e PATH=/tools/llvm/bin:/tools/rust/bin:/usr/bin:/bin \
		-e CC=clang -e AR=llvm-ar -e RUSTC=/tools/rust/bin/rustc sbf-builder sh -c "$1"
}
[ -f "$WS/Cargo.lock" ] || run "CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback cargo generate-lockfile && (cargo update -p blake3 --precise 1.5.5 || true)"
run "cargo fetch"
for dir in "$WS"/*/; do
	p=$(basename "$dir")
	case "$p" in *${1:-}*) ;; *) continue ;; esac
	for v in "" $(grep -o '^v_[a-z_]*' "$dir/Cargo.toml"); do
		out="$p${v:+@${v#v_}}.so"
		rm -f "$C/target-bench/sbf-solana-solana/release/$p.so"
		run "cargo build --offline --release --target sbf-solana-solana -p $p ${v:+--features $v} 2>&1 | grep -E '^(error|warning: unused)' -A5 | head -40"
		[ -f "$C/target-bench/sbf-solana-solana/release/$p.so" ] || { echo "FAILED $out"; continue; }
		run "llvm-objcopy --strip-all /cargo/target-bench/sbf-solana-solana/release/$p.so /out/$out" # as deployed (cargo build-sbf)
		echo "built $out"
	done
done
