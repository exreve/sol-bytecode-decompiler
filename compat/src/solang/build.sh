#!/bin/sh
# Build compat/bin/solang_counter.so (+ its Anchor-style IDL .json, as Solang emits it) and a symbol-stripped copy.
# Solang v0.3.5 release binary (SOLANG, default ~/.cache/compat-tools/solang); llvm-objcopy from platform-tools v1.48 (sbf-builder container).
set -e
D=$(cd "$(dirname "$0")" && pwd)
OUT=$(cd "$D/../../bin" && pwd)
SOLANG=${SOLANG:-$HOME/.cache/compat-tools/solang}
T=${SBF_TOOLS:-$HOME/.cache/sbf-tools/v1.48}
TMP=$(mktemp -d)
"$SOLANG" compile --target solana -O default -o "$TMP" "$D/counter.sol"
cp "$TMP/counter.so" "$OUT/solang_counter.so"
cp "$TMP/counter.json" "$OUT/solang_counter.json"
docker run --rm -u "$(id -u):$(id -g)" -v "$T:/tools:ro" -v "$OUT:/out" sbf-builder /tools/llvm/bin/llvm-objcopy --strip-all /out/solang_counter.so /out/solang_counter_stripped.so
rm -rf "$TMP"
echo "built solang_counter.so solang_counter_stripped.so"
