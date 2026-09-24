/** MurmurHash3 x86 32-bit, seed 0 — the hash sBPF uses for syscall / function keys. */
export function murmur3(data: Uint8Array, seed = 0): number {
  const c1 = 0xcc9e2d51, c2 = 0x1b873593;
  let h = seed >>> 0;
  const n = data.length & ~3;
  for (let i = 0; i < n; i += 4) {
    let k = data[i] | (data[i + 1] << 8) | (data[i + 2] << 16) | (data[i + 3] << 24);
    k = Math.imul(k, c1); k = (k << 15) | (k >>> 17); k = Math.imul(k, c2);
    h ^= k; h = (h << 13) | (h >>> 19); h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }
  let k = 0;
  switch (data.length & 3) {
    case 3: k ^= data[n + 2] << 16; // fallthrough
    case 2: k ^= data[n + 1] << 8; // fallthrough
    case 1: k ^= data[n]; k = Math.imul(k, c1); k = (k << 15) | (k >>> 17); k = Math.imul(k, c2); h ^= k;
  }
  h ^= data.length;
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}

export const hashName = (s: string): number => murmur3(new TextEncoder().encode(s));

/** Legacy key of an internal function: murmur3 of its pc as little-endian u64. */
export function hashPc(pc: number): number {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigUint64(0, BigInt(pc), true);
  return murmur3(b);
}
