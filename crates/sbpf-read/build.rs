//! Build step: a Bloom filter of the expanded selector vocabulary's hashes (`sha8("global:" + name)` of every
//! `name_at` index of `data/selectors.json.gz`), so that a lookup of values none of which is in the
//! vocabulary (the common case) skips hashing the whole vocabulary at run time. The filter has no false
//! negatives: a value it rejects is in no vocabulary entry; a value it accepts is looked up by the scan.

use std::io::Write;

/// Filter size (bits, a power of two) and number of probes; shared with `sem.rs` through the output file's
/// header.
const LOG_BITS: u32 = 25;
const PROBES: u32 = 13;

fn main() {
    let src = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../data/selectors.json.gz");
    println!("cargo:rerun-if-changed={}", src.display());
    println!("cargo:rerun-if-changed=build.rs");
    let g = std::fs::read(&src).expect("selectors.json.gz");
    // gzip: 10-byte header (+ optional fields), deflate stream, 8-byte trailer
    let flg = g[3];
    let mut i = 10usize;
    if flg & 4 != 0 {
        let xlen = u16::from_le_bytes([g[i], g[i + 1]]) as usize;
        i += 2 + xlen;
    }
    for bit in [8u8, 16] {
        if flg & bit != 0 {
            while g[i] != 0 {
                i += 1;
            }
            i += 1;
        }
    }
    if flg & 2 != 0 {
        i += 2;
    }
    let raw = miniz_oxide::inflate::decompress_to_vec(&g[i..g.len() - 8]).expect("inflate");
    let v: serde_json::Value = serde_json::from_slice(&raw).expect("json");
    let list = |k: &str| -> Vec<String> {
        v[k].as_array()
            .map(|a| {
                a.iter()
                    .map(|x| x.as_str().unwrap_or("").to_string())
                    .collect()
            })
            .unwrap_or_default()
    };
    let (verbs, nouns) = (list("verbs"), list("nouns"));
    let per = 2 * (nouns.len() + 1);
    let n = verbs.len() * per;
    let mut bits = vec![0u64; 1 << (LOG_BITS - 6)];
    let mask = (1u32 << LOG_BITS) - 1;
    let mut buf = String::new();
    for i in 0..n {
        buf.clear();
        buf.push_str("global:");
        buf.push_str(&verbs[i / per]);
        let r = i % per;
        if r >> 1 != 0 && !nouns[(r >> 1) - 1].is_empty() {
            buf.push('_');
            buf.push_str(&nouns[(r >> 1) - 1]);
        }
        if r & 1 != 0 {
            buf.push_str("_v2");
        }
        let d = sha256(buf.as_bytes());
        let h = u64::from_le_bytes(d[..8].try_into().unwrap());
        let (h1, h2) = (h as u32, (h >> 32) as u32 | 1);
        for k in 0..PROBES {
            let x = h1.wrapping_add(k.wrapping_mul(h2)) & mask;
            bits[(x >> 6) as usize] |= 1 << (x & 63);
        }
    }
    let out = std::path::Path::new(&std::env::var("OUT_DIR").unwrap()).join("vocab_bloom.bin");
    let mut f = std::fs::File::create(out).unwrap();
    f.write_all(&LOG_BITS.to_le_bytes()).unwrap();
    f.write_all(&PROBES.to_le_bytes()).unwrap();
    for w in &bits {
        f.write_all(&w.to_le_bytes()).unwrap();
    }
}

fn sha256(data: &[u8]) -> [u8; 32] {
    const K: [u32; 64] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    let mut h: [u32; 8] = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];
    let mut m = data.to_vec();
    m.push(0x80);
    while m.len() % 64 != 56 {
        m.push(0);
    }
    m.extend_from_slice(&((data.len() as u64) * 8).to_be_bytes());
    for chunk in m.chunks(64) {
        let mut w = [0u32; 64];
        for i in 0..16 {
            w[i] = u32::from_be_bytes(chunk[i * 4..i * 4 + 4].try_into().unwrap());
        }
        for i in 16..64 {
            let s0 = w[i - 15].rotate_right(7) ^ w[i - 15].rotate_right(18) ^ (w[i - 15] >> 3);
            let s1 = w[i - 2].rotate_right(17) ^ w[i - 2].rotate_right(19) ^ (w[i - 2] >> 10);
            w[i] = w[i - 16].wrapping_add(s0).wrapping_add(w[i - 7]).wrapping_add(s1);
        }
        let [mut a, mut b, mut c, mut d, mut e, mut f, mut g, mut hh] = h;
        for i in 0..64 {
            let s1 = e.rotate_right(6) ^ e.rotate_right(11) ^ e.rotate_right(25);
            let ch = (e & f) ^ (!e & g);
            let t1 = hh.wrapping_add(s1).wrapping_add(ch).wrapping_add(K[i]).wrapping_add(w[i]);
            let s0 = a.rotate_right(2) ^ a.rotate_right(13) ^ a.rotate_right(22);
            let maj = (a & b) ^ (a & c) ^ (b & c);
            let t2 = s0.wrapping_add(maj);
            hh = g;
            g = f;
            f = e;
            e = d.wrapping_add(t1);
            d = c;
            c = b;
            b = a;
            a = t1.wrapping_add(t2);
        }
        for (x, y) in h.iter_mut().zip([a, b, c, d, e, f, g, hh]) {
            *x = x.wrapping_add(y);
        }
    }
    let mut out = [0u8; 32];
    for (i, x) in h.iter().enumerate() {
        out[i * 4..i * 4 + 4].copy_from_slice(&x.to_be_bytes());
    }
    out
}
