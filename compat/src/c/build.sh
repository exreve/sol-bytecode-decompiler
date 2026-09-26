#!/bin/sh
# Build compat/bin/c_vault*.so with the Solana C SDK (headers vendored from agave programs/sbf/c, see sdk/)
# using platform-tools v1.57 clang in the sbf-builder container (same setup as bench/build.sh).
set -e
D=$(cd "$(dirname "$0")" && pwd)
OUT=$(cd "$D/../../bin" && pwd)
T=${SBF_TOOLS:-$HOME/.cache/sbf-tools/v1.57}
run() {
	docker run --rm -u "$(id -u):$(id -g)" -v "$T:/tools:ro" -v "$D:/w" -v "$OUT:/out" -w /w -e HOME=/tmp \
		-e PATH=/tools/llvm/bin:/usr/bin:/bin sbf-builder sh -c "$1"
}
CF="-O2 -fno-builtin -std=c17 -isystem sdk/inc -isystem /tools/llvm/lib/clang/22/include -I/tools/llvm/sbpf/include -target sbf -fPIC"
LF="-z notext -shared --Bdynamic sdk/sbf.ld --entry entrypoint -z max-page-size=4096"
for cpu in v0 v2 v3; do
	case $cpu in v0) m="" ;; v3) m="-mcpu=v3 -DSOL_SBPFV3=1" ;; *) m="-mcpu=$cpu" ;; esac
	run "clang $CF $m -o /tmp/vault.o -c vault.c && ld.lld $LF -o /tmp/vault.so /tmp/vault.o && llvm-objcopy --strip-all /tmp/vault.so /out/c_vault_$cpu.so"
	echo "built c_vault_$cpu.so"
done
