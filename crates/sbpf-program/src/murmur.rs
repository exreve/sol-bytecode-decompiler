//! MurmurHash3 x86 32-bit, seed 0 — the hash sBPF uses for syscall / function keys.

pub fn murmur3(data: &[u8], seed: u32) -> u32 {
    const C1: u32 = 0xcc9e2d51;
    const C2: u32 = 0x1b873593;
    let mut h = seed;
    let n = data.len() & !3;
    for ch in data[..n].chunks_exact(4) {
        let mut k = u32::from_le_bytes([ch[0], ch[1], ch[2], ch[3]]);
        k = k.wrapping_mul(C1).rotate_left(15).wrapping_mul(C2);
        h ^= k;
        h = h.rotate_left(13).wrapping_mul(5).wrapping_add(0xe6546b64);
    }
    let tail = &data[n..];
    let mut k = 0u32;
    if tail.len() >= 3 {
        k ^= (tail[2] as u32) << 16;
    }
    if tail.len() >= 2 {
        k ^= (tail[1] as u32) << 8;
    }
    if !tail.is_empty() {
        k ^= tail[0] as u32;
        k = k.wrapping_mul(C1).rotate_left(15).wrapping_mul(C2);
        h ^= k;
    }
    h ^= data.len() as u32;
    h ^= h >> 16;
    h = h.wrapping_mul(0x85ebca6b);
    h ^= h >> 13;
    h = h.wrapping_mul(0xc2b2ae35);
    h ^= h >> 16;
    h
}

pub fn hash_name(s: &str) -> u32 {
    murmur3(s.as_bytes(), 0)
}

/// Legacy key of an internal function: murmur3 of its pc as little-endian u64.
pub fn hash_pc(pc: u64) -> u32 {
    murmur3(&pc.to_le_bytes(), 0)
}
