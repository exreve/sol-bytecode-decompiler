//! SHA-256 (node:crypto `createHash('sha256')`) and SHA3-256 (`createHash('sha3-256')`, the stand-in
//! digest of the `sol_keccak256` model).

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
const H0: [u32; 8] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

fn compress(h: &mut [u32; 8], chunk: &[u8]) {
    #[cfg(target_arch = "x86_64")]
    {
        use std::sync::atomic::{AtomicU8, Ordering};
        // 0 = unknown, 1 = no SHA extensions, 2 = SHA-NI
        static NI: AtomicU8 = AtomicU8::new(0);
        let mut ni = NI.load(Ordering::Relaxed);
        if ni == 0 {
            ni = if std::arch::is_x86_feature_detected!("sha")
                && std::arch::is_x86_feature_detected!("sse4.1")
                && std::arch::is_x86_feature_detected!("ssse3")
            {
                2
            } else {
                1
            };
            NI.store(ni, Ordering::Relaxed);
        }
        if ni == 2 {
            // SAFETY: the CPU features were detected above
            unsafe { compress_ni(h, chunk.try_into().unwrap()) };
            return;
        }
    }
    compress_soft(h, chunk)
}

/// SHA-256 block function with the x86 SHA extensions (same result as `compress_soft`).
#[cfg(target_arch = "x86_64")]
#[target_feature(enable = "sha,sse2,ssse3,sse4.1")]
unsafe fn compress_ni(state: &mut [u32; 8], block: &[u8; 64]) {
    use std::arch::x86_64::*;
    unsafe fn schedule(v0: __m128i, v1: __m128i, v2: __m128i, v3: __m128i) -> __m128i {
        let t1 = _mm_sha256msg1_epu32(v0, v1);
        let t2 = _mm_alignr_epi8(v3, v2, 4);
        let t3 = _mm_add_epi32(t1, t2);
        _mm_sha256msg2_epu32(t3, v3)
    }
    macro_rules! rounds4 {
        ($abef:ident, $cdgh:ident, $rest:expr, $i:expr) => {{
            let k = _mm_loadu_si128(K.as_ptr().add(4 * $i) as *const __m128i);
            let t1 = _mm_add_epi32($rest, k);
            $cdgh = _mm_sha256rnds2_epu32($cdgh, $abef, t1);
            let t2 = _mm_shuffle_epi32(t1, 0x0E);
            $abef = _mm_sha256rnds2_epu32($abef, $cdgh, t2);
        }};
    }
    macro_rules! schedule_rounds4 {
        ($abef:ident, $cdgh:ident, $w0:expr, $w1:expr, $w2:expr, $w3:expr, $w4:expr, $i:expr) => {{
            $w4 = schedule($w0, $w1, $w2, $w3);
            rounds4!($abef, $cdgh, $w4, $i);
        }};
    }
    let mask = _mm_set_epi64x(
        0x0C0D_0E0F_0809_0A0Bu64 as i64,
        0x0405_0607_0001_0203u64 as i64,
    );
    let sp = state.as_ptr() as *const __m128i;
    let dcba = _mm_loadu_si128(sp);
    let efgh = _mm_loadu_si128(sp.add(1));
    let cdab = _mm_shuffle_epi32(dcba, 0xB1);
    let efgh = _mm_shuffle_epi32(efgh, 0x1B);
    let mut abef = _mm_alignr_epi8(cdab, efgh, 8);
    let mut cdgh = _mm_blend_epi16(efgh, cdab, 0xF0);
    let (abef_save, cdgh_save) = (abef, cdgh);
    let dp = block.as_ptr() as *const __m128i;
    let mut w0 = _mm_shuffle_epi8(_mm_loadu_si128(dp), mask);
    let mut w1 = _mm_shuffle_epi8(_mm_loadu_si128(dp.add(1)), mask);
    let mut w2 = _mm_shuffle_epi8(_mm_loadu_si128(dp.add(2)), mask);
    let mut w3 = _mm_shuffle_epi8(_mm_loadu_si128(dp.add(3)), mask);
    let mut w4;
    rounds4!(abef, cdgh, w0, 0);
    rounds4!(abef, cdgh, w1, 1);
    rounds4!(abef, cdgh, w2, 2);
    rounds4!(abef, cdgh, w3, 3);
    schedule_rounds4!(abef, cdgh, w0, w1, w2, w3, w4, 4);
    schedule_rounds4!(abef, cdgh, w1, w2, w3, w4, w0, 5);
    schedule_rounds4!(abef, cdgh, w2, w3, w4, w0, w1, 6);
    schedule_rounds4!(abef, cdgh, w3, w4, w0, w1, w2, 7);
    schedule_rounds4!(abef, cdgh, w4, w0, w1, w2, w3, 8);
    schedule_rounds4!(abef, cdgh, w0, w1, w2, w3, w4, 9);
    schedule_rounds4!(abef, cdgh, w1, w2, w3, w4, w0, 10);
    schedule_rounds4!(abef, cdgh, w2, w3, w4, w0, w1, 11);
    schedule_rounds4!(abef, cdgh, w3, w4, w0, w1, w2, 12);
    schedule_rounds4!(abef, cdgh, w4, w0, w1, w2, w3, 13);
    schedule_rounds4!(abef, cdgh, w0, w1, w2, w3, w4, 14);
    schedule_rounds4!(abef, cdgh, w1, w2, w3, w4, w0, 15);
    let _ = (w1, w2, w3, w4);
    abef = _mm_add_epi32(abef, abef_save);
    cdgh = _mm_add_epi32(cdgh, cdgh_save);
    let feba = _mm_shuffle_epi32(abef, 0x1B);
    let dchg = _mm_shuffle_epi32(cdgh, 0xB1);
    let dcba = _mm_blend_epi16(feba, dchg, 0xF0);
    let hgef = _mm_alignr_epi8(dchg, feba, 8);
    let op = state.as_mut_ptr() as *mut __m128i;
    _mm_storeu_si128(op, dcba);
    _mm_storeu_si128(op.add(1), hgef);
}

fn compress_soft(h: &mut [u32; 8], chunk: &[u8]) {
    let mut w = [0u32; 64];
    for i in 0..16 {
        w[i] = u32::from_be_bytes([
            chunk[i * 4],
            chunk[i * 4 + 1],
            chunk[i * 4 + 2],
            chunk[i * 4 + 3],
        ]);
    }
    for i in 16..64 {
        let s0 = w[i - 15].rotate_right(7) ^ w[i - 15].rotate_right(18) ^ (w[i - 15] >> 3);
        let s1 = w[i - 2].rotate_right(17) ^ w[i - 2].rotate_right(19) ^ (w[i - 2] >> 10);
        w[i] = w[i - 16]
            .wrapping_add(s0)
            .wrapping_add(w[i - 7])
            .wrapping_add(s1);
    }
    let [mut a, mut b, mut c, mut d, mut e, mut f, mut g, mut hh] = *h;
    for i in 0..64 {
        let s1 = e.rotate_right(6) ^ e.rotate_right(11) ^ e.rotate_right(25);
        let ch = (e & f) ^ (!e & g);
        let t1 = hh
            .wrapping_add(s1)
            .wrapping_add(ch)
            .wrapping_add(K[i])
            .wrapping_add(w[i]);
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

/// Incremental SHA-256.
#[derive(Clone)]
pub struct Sha256 {
    h: [u32; 8],
    buf: [u8; 64],
    n: usize,
    len: u64,
}

impl Default for Sha256 {
    fn default() -> Self {
        Self::new()
    }
}

impl Sha256 {
    pub fn new() -> Self {
        Sha256 {
            h: H0,
            buf: [0; 64],
            n: 0,
            len: 0,
        }
    }
    pub fn update(&mut self, mut data: &[u8]) {
        self.len += data.len() as u64;
        while !data.is_empty() {
            let k = (64 - self.n).min(data.len());
            self.buf[self.n..self.n + k].copy_from_slice(&data[..k]);
            self.n += k;
            data = &data[k..];
            if self.n == 64 {
                let b = self.buf;
                compress(&mut self.h, &b);
                self.n = 0;
            }
        }
    }
    pub fn digest(mut self) -> [u8; 32] {
        let bits = self.len.wrapping_mul(8);
        self.update(&[0x80]);
        while self.n != 56 {
            self.update(&[0]);
        }
        self.update(&bits.to_be_bytes());
        let mut out = [0u8; 32];
        for (i, x) in self.h.iter().enumerate() {
            out[i * 4..i * 4 + 4].copy_from_slice(&x.to_be_bytes());
        }
        out
    }
}

pub fn sha256(data: &[u8]) -> [u8; 32] {
    let mut h = Sha256::new();
    h.update(data);
    h.digest()
}

#[cfg(test)]
mod ni_tests {
    #[test]
    fn ni_matches_soft() {
        let mut x: u32 = 1;
        for n in 0..2000 {
            let mut b = [0u8; 64];
            for c in b.iter_mut() {
                x ^= x << 13;
                x ^= x >> 17;
                x ^= x << 5;
                *c = x as u8;
            }
            let mut h1 = super::H0;
            h1[n % 8] ^= x;
            let mut h2 = h1;
            super::compress(&mut h1, &b);
            super::compress_soft(&mut h2, &b);
            assert_eq!(h1, h2);
        }
        assert_eq!(
            super::sha256(b"abc")[..4],
            [0xba, 0x78, 0x16, 0xbf]
        );
    }
}

/// First 8 bytes of sha256(s) as a little-endian u64 (short messages: one block, no allocation).
pub fn sha8(s: &[u8]) -> u64 {
    if s.len() <= 55 {
        let mut b = [0u8; 64];
        b[..s.len()].copy_from_slice(s);
        b[s.len()] = 0x80;
        b[56..].copy_from_slice(&((s.len() as u64) * 8).to_be_bytes());
        let mut h = H0;
        compress(&mut h, &b);
        let x = [h[0].to_be_bytes(), h[1].to_be_bytes()].concat();
        return u64::from_le_bytes(x.try_into().unwrap());
    }
    u64::from_le_bytes(sha256(s)[..8].try_into().unwrap())
}

const RC: [u64; 24] = [
    0x0000000000000001,
    0x0000000000008082,
    0x800000000000808a,
    0x8000000080008000,
    0x000000000000808b,
    0x0000000080000001,
    0x8000000080008081,
    0x8000000000008009,
    0x000000000000008a,
    0x0000000000000088,
    0x0000000080008009,
    0x000000008000000a,
    0x000000008000808b,
    0x800000000000008b,
    0x8000000000008089,
    0x8000000000008003,
    0x8000000000008002,
    0x8000000000000080,
    0x000000000000800a,
    0x800000008000000a,
    0x8000000080008081,
    0x8000000000008080,
    0x0000000080000001,
    0x8000000080008008,
];
const ROT: [u32; 25] = [
    0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14,
];

fn keccak_f(a: &mut [u64; 25]) {
    for rc in RC {
        let mut c = [0u64; 5];
        for x in 0..5 {
            c[x] = a[x] ^ a[x + 5] ^ a[x + 10] ^ a[x + 15] ^ a[x + 20];
        }
        for x in 0..5 {
            let d = c[(x + 4) % 5] ^ c[(x + 1) % 5].rotate_left(1);
            for y in 0..5 {
                a[x + 5 * y] ^= d;
            }
        }
        let mut b = [0u64; 25];
        for x in 0..5 {
            for y in 0..5 {
                b[y + 5 * ((2 * x + 3 * y) % 5)] = a[x + 5 * y].rotate_left(ROT[x + 5 * y]);
            }
        }
        for x in 0..5 {
            for y in 0..5 {
                a[x + 5 * y] = b[x + 5 * y] ^ (!b[(x + 1) % 5 + 5 * y] & b[(x + 2) % 5 + 5 * y]);
            }
        }
        a[0] ^= rc;
    }
}

/// SHA3-256 of the concatenation of `parts`.
pub fn sha3_256(parts: &[&[u8]]) -> [u8; 32] {
    const RATE: usize = 136;
    let mut msg: Vec<u8> = parts.concat();
    msg.push(0x06);
    while msg.len() % RATE != 0 {
        msg.push(0);
    }
    let last = msg.len() - 1;
    msg[last] |= 0x80;
    let mut st = [0u64; 25];
    for block in msg.chunks(RATE) {
        for i in 0..RATE / 8 {
            st[i] ^= u64::from_le_bytes(block[i * 8..i * 8 + 8].try_into().unwrap());
        }
        keccak_f(&mut st);
    }
    let mut out = [0u8; 32];
    for i in 0..4 {
        out[i * 8..i * 8 + 8].copy_from_slice(&st[i].to_le_bytes());
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    fn hex(b: &[u8]) -> String {
        b.iter().map(|x| format!("{x:02x}")).collect()
    }
    #[test]
    fn digests() {
        assert_eq!(
            hex(&sha256(b"abc")),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
        assert_eq!(
            hex(&sha3_256(&[b"abc"])),
            "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532"
        );
        assert_eq!(
            hex(&sha3_256(&[b""])),
            "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"
        );
        let long = vec![7u8; 200];
        assert_eq!(
            sha8(&long),
            u64::from_le_bytes(sha256(&long)[..8].try_into().unwrap())
        );
        assert_eq!(
            sha8(b"global:initialize"),
            u64::from_le_bytes(sha256(b"global:initialize")[..8].try_into().unwrap())
        );
    }
}
