#!/bin/sh
# Build the real-issue eval binaries (eval/bin/<case>@vuln.so, @fixed.so) from upstream sources at pinned commits.
# Not needed to use the dataset: the stripped binaries are committed.
# Runs cargo inside the sbf-builder container with Solana platform-tools from ~/.cache/sbf-tools/<tools> (see bench/build.sh).
# usage: eval/build.sh [case-filter] [vuln|fixed]
set -e
E=$(cd "$(dirname "$0")" && pwd)
W=${SBF_EVAL_WORK:-$HOME/.cache/sbf-eval}
mkdir -p "$W" "$E/bin"

# Anchor IDL from source (eval/idlgen, anchor-syn 0.29 parser) when IDL_SRC names the program's lib.rs
IDLGEN=$W/idlgen-target/release/idlgen
[ -x "$IDLGEN" ] || (cd "$E/idlgen" && CARGO_TARGET_DIR="$W/idlgen-target" cargo build --release -q)

# fetch <dir> <owner/repo> <sha> <topdir>: source snapshot of one commit (only <topdir> is extracted, '.' = all)
fetch() {
	[ -d "$1" ] && return
	mkdir -p "$1.tmp"
	if [ "$4" = . ]; then set -- "$1" "$2" "$3"; else set -- "$1" "$2" "$3" --wildcards "*/$4/*"; fi
	fd=$1 fr=$2 fc=$3; shift 3
	curl -sfL "https://codeload.github.com/$fr/tar.gz/$fc" | tar xz -C "$fd.tmp" --strip-components=1 "$@"
	mv "$fd.tmp" "$fd"
}

# run <tools> <srcroot> <subdir> <cmd>: cargo in the container, in <srcroot>/<subdir> (cargo home shared per toolchain)
run() {
	T=$HOME/.cache/sbf-tools/$1
	C=$HOME/.cache/sbf-cargo-$1
	mkdir -p "$C"
	docker run --rm -u "$(id -u):$(id -g)" -v "$T:/tools:ro" -v "$C:/cargo" -v "$2:/w" -w "/w/$3" \
		-e CARGO_HOME=/cargo -e CARGO_TARGET_DIR=/w/target -e HOME=/tmp -e PATH=/tools/llvm/bin:/tools/rust/bin:/usr/bin:/bin \
		-e CC=clang -e AR=llvm-ar -e RUSTC=/tools/rust/bin/rustc -e RUSTFLAGS="$RUSTFLAGS_SBF" \
		-e CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback $DOCKER_ENV sbf-builder sh -c "$4"
}

# build <case> <variant> <owner/repo> <sha> <workspace-subdir> <package> <lib-name> <tools> [host-side patch function, run in the source root]
# RUSTFLAGS_SBF: extra rustc flags; old solana-program (< 1.10) gates syscalls on target_arch="bpf", hence --cfg target_arch="bpf"
build() {
	case "$1" in *${FILTER:-}*) ;; *) return ;; esac
	case "$2" in *${VARIANT:-}*) ;; *) return ;; esac
	out="$E/bin/$1@$2.so"
	[ -f "$out" ] && { echo "exists $1@$2"; return; }
	d="$W/$1@$2"
	fetch "$d" "$3" "$4" "${5%%/*}"
	[ -z "$9" ] || [ -f "$d/.patched" ] || { (cd "$d" && $9) && touch "$d/.patched"; }
	so=$7.so
	run "$8" "$d" "$5" "cargo build --release --target sbf-solana-solana -p $6 2>&1 | grep -E '^error' -A8 | head -60" || true
	f="$d/target/sbf-solana-solana/release/$so"
	[ -f "$f" ] || { echo "FAILED $1@$2"; return; }
	run "$8" "$d" . "llvm-objcopy --strip-all target/sbf-solana-solana/release/$so /tmp/o.so && cat /tmp/o.so" > "$out" # as deployed (cargo build-sbf)
	rm -rf "$d/target"
	[ -z "$IDL_SRC" ] || "$IDLGEN" "$d/$IDL_SRC" > "$E/bin/$1@$2.json"
	echo "built $1@$2 ($(wc -c < "$out") bytes)"
}

FILTER=$1 VARIANT=$2
BPF='--cfg target_arch="bpf"'

# solitaire (2021) used the removed const_generics feature; adt_const_params is its successor in rustc 1.75
wormhole_patch() {
	for f in solana/solitaire/program/src/lib.rs solana/bridge/program/src/lib.rs; do
		sed -i 's/^#!\[feature(const_generics)\]//; 1s/^/#![feature(adt_const_params)]\n#![allow(incomplete_features)]\n/' "$f"
	done
	sed -i '/^pub enum AccountState/i #[derive(std::marker::ConstParamTy)]' solana/solitaire/program/src/types/accounts.rs
}

RUSTFLAGS_SBF=$BPF DOCKER_ENV="-e EMITTER_ADDRESS=11111111111111111111111111111115" # mainnet governance emitter (as in solana/Dockerfile)
build wormhole_bridge vuln wormhole-foundation/wormhole 79ab522f802ccc5ba34278d3c648fa62e06f4f1c solana/bridge wormhole-bridge-solana bridge v1.41 wormhole_patch
build wormhole_bridge fixed wormhole-foundation/wormhole e8b91810a9bb35c3c139f86b4d0795432d647305 solana/bridge wormhole-bridge-solana bridge v1.41 wormhole_patch

RUSTFLAGS_SBF= DOCKER_ENV= IDL_SRC=programs/cp-swap/src/lib.rs
build raydium_cp_swap vuln raydium-io/raydium-cp-swap cfdb70a8ca . raydium-cp-swap raydium_cp_swap v1.41
build raydium_cp_swap fixed raydium-io/raydium-cp-swap 183ddbb115 . raydium-cp-swap raydium_cp_swap v1.41
