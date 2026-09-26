#!/bin/sh
# Build compat/bin/asm_counter_<v0|v3>.so with the sbpf assembler (blueshift-gg/sbpf, `cargo install sbpf` 0.3.1;
# SBPF, default ~/.cache/compat-tools/sbpf/bin/sbpf).
set -e
D=$(cd "$(dirname "$0")" && pwd)
OUT=$(cd "$D/../../bin" && pwd)
SBPF=${SBPF:-$HOME/.cache/compat-tools/sbpf/bin/sbpf}
TMP=$(mktemp -d)
for a in v0 v3; do
	"$SBPF" build --arch $a --input "$D/counter.s" --deploy-dir "$TMP/$a" >/dev/null
	cp "$TMP/$a"/*.so "$OUT/asm_counter_$a.so"
	echo "built asm_counter_$a.so"
done
rm -rf "$TMP"
