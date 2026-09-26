#!/bin/sh
# Build compat/bin/zig_counter.so with solana-zig (joncinque/solana-zig-bootstrap solana-v1.53.0, zig 0.16.0;
# ZIG, default ~/.cache/compat-tools/zig-x86_64-linux-musl-baseline/zig) and solana-program-sdk-zig v0.18.0.
# zig build reports a failure (LLVM stack-frame errors in unused compiler_rt big-int division) but still links
# and installs the program, so the exit status is ignored and the artifact checked instead.
D=$(cd "$(dirname "$0")" && pwd)
ZIG=${ZIG:-$HOME/.cache/compat-tools/zig-x86_64-linux-musl-baseline/zig}
cd "$D" && rm -rf zig-out && "$ZIG" build >/dev/null 2>&1
[ -f zig-out/lib/zig_counter.so ] || { echo "FAILED zig_counter.so"; exit 1; }
cp zig-out/lib/zig_counter.so ../../bin/zig_counter.so && echo "built zig_counter.so"
