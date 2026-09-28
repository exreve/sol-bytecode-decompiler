#!/bin/sh
# Run the equivalence harness over every corpus program up to a size limit (bytes).
# usage: scripts/equiv-corpus.sh [maxBytes=400000] [trials=2] [binDir=target/release]   (from the repository root)
max=${1:-400000}; trials=${2:-2}; bin=${3:-target/release}
for f in $(ls -S -r corpus/*.so); do
	sz=$(stat -c %s "$f"); [ "$sz" -gt "$max" ] && continue
	timeout 900 "$bin/sbpf-equiv" "$f" "$trials" 2>&1 | tail -3 | sed "s#^#$(basename $f) #"
done
