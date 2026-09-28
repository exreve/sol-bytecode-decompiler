//! Hash containers with a fast non-cryptographic hasher (rustc's Fx add-multiply, rustc-hash 2's constant).
//! Iteration orders of the unordered maps are never part of an output (they were random per process with
//! std's SipHash); the ordered ones (IndexMap / IndexSet) keep insertion order whatever the hasher.

use std::hash::{BuildHasherDefault, Hasher};

pub type FxBuild = BuildHasherDefault<FxHasher>;
pub type HashMap<K, V> = std::collections::HashMap<K, V, FxBuild>;
pub type HashSet<T> = std::collections::HashSet<T, FxBuild>;
pub type IndexMap<K, V> = indexmap::IndexMap<K, V, FxBuild>;
pub type IndexSet<T> = indexmap::IndexSet<T, FxBuild>;

const K: u64 = 0xf135_7aea_2e62_a9c5;

#[derive(Default, Clone, Copy)]
pub struct FxHasher {
    hash: u64,
}

impl FxHasher {
    #[inline]
    fn add(&mut self, w: u64) {
        self.hash = self.hash.wrapping_add(w).wrapping_mul(K);
    }
}

impl Hasher for FxHasher {
    #[inline]
    fn write(&mut self, bytes: &[u8]) {
        let mut b = bytes;
        while b.len() >= 8 {
            self.add(u64::from_le_bytes(b[..8].try_into().unwrap()));
            b = &b[8..];
        }
        if b.len() >= 4 {
            self.add(u32::from_le_bytes(b[..4].try_into().unwrap()) as u64);
            b = &b[4..];
        }
        for &x in b {
            self.add(x as u64);
        }
    }
    #[inline]
    fn write_u8(&mut self, i: u8) {
        self.add(i as u64);
    }
    #[inline]
    fn write_u16(&mut self, i: u16) {
        self.add(i as u64);
    }
    #[inline]
    fn write_u32(&mut self, i: u32) {
        self.add(i as u64);
    }
    #[inline]
    fn write_u64(&mut self, i: u64) {
        self.add(i);
    }
    #[inline]
    fn write_u128(&mut self, i: u128) {
        self.add(i as u64);
        self.add((i >> 64) as u64);
    }
    #[inline]
    fn write_usize(&mut self, i: usize) {
        self.add(i as u64);
    }
    #[inline]
    fn finish(&self) -> u64 {
        // (the product's entropy is in its high bits; hashbrown takes bucket indices from the low ones)
        self.hash.rotate_left(26)
    }
}
